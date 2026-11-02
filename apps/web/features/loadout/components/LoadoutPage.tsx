"use client";

import { currentAuthReturnUrl, missionHref } from "@/features/navigation/return-location";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { DirectionLink } from "@/components/ui/direction-button";
import { SelectField } from "@/components/ui/select";
import { AppHeader } from "@/components/AppHeader";
import { Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/PrefetchLink";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import type { SpeakingOptions, LoadoutUsageResponse, SceneLogicResponse } from "@libitu/types/speaking";
import { useSavedCorpus } from "../../corpus/useSavedCorpus";
import { createSpeakingApi, getSpeakingOptions, SpeakingApiError } from "../api/speaking-api";
import { useLoadoutDraft } from "../hooks/useLoadoutDraft";
import { sceneLogicSignature, draftOrigin, explicitLogicId, draftSceneMode, replanLoadout, quickStartDraft, adjustSceneTarget, automaticCandidate, changeDraftSupport, draftSignature, expressionText, missionInputSignature, missionSelectionError, preparePlannedSubmission, prepareFreeSubmission, planningRequest, sceneFitAdvice, toggleMissionSelection, type LoadoutDraft, type SceneTargetAdjustment } from "../draft";
import { recommendQuickStart, targetStage, betterLogicForTargets, rankCorpus, usageReason, isRecentVideo, logicFamily, FUNCTION_LABELS, mapTargetStages, loadoutEligible } from "../quick-start";
import { QuickStartCard } from "./QuickStartCard";
import { CorpusDrawer } from "./CorpusDrawer";
import { isSupportLevel, SUPPORT_OPTIONS } from "../../speaking/support";
import { prepareMissionNavigation, startMissionPhase } from "../../speaking/mission-timing";
import { missionFitProblem, missionProblem, type MissionProblem } from "../problems";
import { MissionRecovery } from "./MissionRecovery";
import { CorpusPicker } from "./CorpusPicker";
import { LoadoutPreview, StartIcon } from "./LoadoutPreview";
import { SupportHistory } from "./SupportHistory";
import styles from "./Loadout.module.css";
import quickStyles from "./QuickStart.module.css";

export function LoadoutPage({ returnTo = "/", reportImport: reportOrigin = null, replaceMissing = false }: { returnTo?: string; reportImport?: string | null; replaceMissing?: boolean } = {}) {
  const { isLoaded, userId, getToken } = useAuth();
  const clerk = useClerk();
  const router = useRouter();
  const owner = userId ?? null;
  const corpus = useSavedCorpus();
  const local = useLoadoutDraft(owner, isLoaded);
  const [options, setOptions] = useState<SpeakingOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [optionsAttempt, setOptionsAttempt] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<"recommended" | "due" | "never" | "recent">("recommended");
  const [logicBrowseFamily, setLogicBrowseFamily] = useState<"workplace" | "daily">("workplace");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [drawerQuery, setDrawerQuery] = useState("");
  const [drawerFunction, setDrawerFunction] = useState("all");
  const [usageState, setUsageState] = useState<{ key: string; value?: LoadoutUsageResponse; error?: string }>({ key: "" });
  const sceneLogicCache = useRef(new Map<string, SceneLogicResponse>());
  const [sceneLogicState, setSceneLogicState] = useState<{ key: string; busy?: boolean; value?: SceneLogicResponse; error?: string }>({ key: "" });
  const [referenceTime] = useState(() => Date.now());
  const [queuedStart, setQueuedStart] = useState<{ owner: string | null; draft: LoadoutDraft } | null>(null);
  const [submission, setSubmission] = useState<{ owner: string | null; busy: boolean; phase?: "preparing" | "saving"; error: MissionProblem | null; authError: boolean }>({ owner: null, busy: false, error: null, authError: false });
  const [manualOpen, setManualOpen] = useState(false);
  const comparisonRef = useRef<HTMLDetailsElement>(null);
  const preferencesRef = useRef<HTMLTextAreaElement>(null);
  const recoveryRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef<AbortController | null>(null);
  const draft = local.draft;
  const corpusIds = useMemo(() => [...new Set(corpus.records.flatMap(record => record.serverId ? [record.serverId] : []))].sort(), [corpus.records]);
  const corpusIdentity = JSON.stringify(corpusIds);
  const corpusContentIdentity = JSON.stringify(corpus.records.filter(record => record.serverId).map(record => [record.serverId, record.item.kind, expressionText(record), record.item.meaning ?? null, Object.entries(record.item.slots ?? {}).sort(([a], [b]) => a.localeCompare(b))]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
  const usageKey = JSON.stringify([owner, corpusContentIdentity]);
  const history = usageState.key === usageKey ? usageState.value : undefined;
  const recommendationContext = useMemo(() => ({ metadata: options?.logic_metadata, now: history ? Date.parse(history.as_of) : referenceTime,
    usage: new Map(history?.items.map(item => [item.corpus_item_id, item])), lastLogicId: draft.lastLogicId }), [options, history, referenceTime, draft.lastLogicId]);
  const quick = useMemo(() => recommendQuickStart(corpus.records, options?.logic_templates ?? [], draft.scenarioType, draft.shuffleSeed ?? 0,
    explicitLogicId(draft) ?? (draft.logicSource === "scene" ? draft.logicTemplateId : null), recommendationContext), [corpus.records, options, draft, recommendationContext]);
  const previewDraft = useMemo(() => replanLoadout(draft, quick, corpus.records, options), [draft, quick, corpus.records, options]);
  const frozenLogic = (draft.submission || draft.plan?.value.practice_source) ? draft.plan?.value.logic_template : undefined;
  const logic = frozenLogic ?? options?.logic_templates.find(value => value.id === previewDraft.logicTemplateId) ?? quick.logic;
  const inputSignature = missionInputSignature(previewDraft, corpus.records, logic);
  const manualKeys = draftOrigin(draft) === "manual" ? draft.pinnedKeys ?? draft.selectedKeys : [];
  const customScene = draft.customScene ?? (draftSceneMode(draft) === "custom" ? draft.goal : "");
  const sceneTargetIds = previewDraft.selectedKeys.flatMap(key => { const record = corpus.records.find(record => record.key === key); return record?.serverId ? [record.serverId] : []; }).slice(0, 5);
  const customSignature = sceneLogicSignature(owner, draft, corpus.records, previewDraft.selectedKeys);
  const setupLatest = useRef({ owner, customSignature, draft });
  setupLatest.current = { owner, customSignature, draft };
  const latest = useRef({ owner, inputSignature });
  latest.current = { owner, inputSignature };

  useEffect(() => { setLogicBrowseFamily(draft.scenarioType === "workplace" ? "workplace" : "daily"); }, [draft.scenarioType]);
  useEffect(() => {
    const controller = new AbortController();
    setOptionsError(null);
    void getSpeakingOptions(controller.signal).then(setOptions).catch((error: unknown) => {
      if (!controller.signal.aborted) setOptionsError(error instanceof Error ? error.message : "Mission options could not be loaded.");
    });
    return () => controller.abort();
  }, [optionsAttempt]);
  useEffect(() => {
    setDrawerOpen(false); setFilter("recommended"); setAdjustOpen(false); setDrawerQuery(""); setDrawerFunction("all"); setQueuedStart(null); setManualOpen(false);
    setSubmission({ owner, busy: false, error: null, authError: false });
    return () => { inFlight.current?.abort(); inFlight.current = null; };
  }, [owner]);
  useEffect(() => {
    // Also fence another tab's input changes and corpus sync/account transitions.
    inFlight.current?.abort(); inFlight.current = null;
    setSubmission({ owner, busy: false, error: null, authError: false });
  }, [owner, inputSignature]);

  const busy = submission.owner === owner && submission.busy;
  const submitError = submission.owner === owner ? submission.error : null;
  const problem = submitError;
  const fitAdvice = problem?.kind === "fit" ? sceneFitAdvice(draft, corpus.records, logic) : undefined;
  const quickDraft = quickStartDraft(draft, quick, corpus.records, options);
  const quickTargetError = missionSelectionError(quickDraft, corpus.records, Boolean(owner));
  useEffect(() => {
    if (problem) { recoveryRef.current?.focus({ preventScroll: true }); recoveryRef.current?.scrollIntoView({ block: "nearest" }); }
  }, [problem]);
  const authError = submission.owner === owner && submission.authError;
  const rankedCorpus = rankCorpus(corpus.records, recommendationContext);
  const visible = (filter === "recent" ? rankedCorpus.filter(record => isRecentVideo(record, recommendationContext.now))
    : filter === "never" ? rankedCorpus.filter(record => record.serverId && recommendationContext.usage.get(record.serverId)?.usage.state === "never")
    : filter === "due" ? rankedCorpus.filter(record => record.serverId && recommendationContext.usage.get(record.serverId)?.usage.state === "used" && recommendationContext.usage.get(record.serverId)?.usage.due === true)
    : rankedCorpus).slice(0, 9);
  const reasons = Object.fromEntries(visible.map(record => [record.key, usageReason(record, recommendationContext) ?? (targetStage(record, logic, options?.logic_metadata) !== "Any stage" ? "Fits this structure" : "From your corpus")]));
  const groups = new Map<string, typeof visible>((logic?.steps ?? []).map(stage => [stage, []]));
  const visibleStages = mapTargetStages(visible, logic, options?.logic_metadata);
  for (const record of visible) {
    const index = visibleStages[record.key];
    const title = index == null ? "Any stage" : logic?.steps[index] ?? "Any stage";
    groups.set(title, [...(groups.get(title) ?? []), record]);
  }
  const targetError = missionSelectionError(previewDraft, corpus.records, Boolean(owner));
  const plan = draft.plan?.signature === inputSignature ? draft.plan.value : null;
  const canRetrySnapshot = Boolean(owner && draft.submission?.signature === draftSignature(draft));
  const linked = Boolean(draft.plan?.value.practice_source);
  const setupLocked = linked || canRetrySnapshot;
  const showLegacySupport = canRetrySnapshot && draft.plan?.value.version !== 2 || linked && draft.plan?.value.version === 1 || !!draft.freeConversation;
  const betterLogic = betterLogicForTargets(corpus.records.filter(record => manualKeys.includes(record.key)), options?.logic_templates ?? [], logic, options?.logic_metadata);
  const familyMismatch = logic && logicFamily(logic, options?.logic_metadata) !== (draft.scenarioType === "workplace" ? "workplace" : "daily");
  const familySuggestion = familyMismatch ? recommendQuickStart(corpus.records, options?.logic_templates ?? [], draft.scenarioType, draft.shuffleSeed ?? 0, null, recommendationContext).logic : undefined;
  const customPending = Boolean(!setupLocked && !draft.freeConversation && draftSceneMode(draft) === "custom" && (!customScene.trim() || owner && !explicitLogicId(draft) && (sceneLogicState.key !== customSignature || sceneLogicState.busy)));
  const blocked = customPending || !local.ready || Boolean(local.error) || !isLoaded || !options || busy
    || (!canRetrySnapshot && !draft.freeConversation && (!corpus.ready || corpus.busy || Boolean(corpus.error) || Boolean(targetError)));


  useEffect(() => {
    if (!owner || !corpus.ready || corpus.busy || corpus.error || !corpusIds.length) return;
    const controller = new AbortController();
    const ids: string[] = JSON.parse(corpusIdentity);
    const api = createSpeakingApi(owner, getToken);
    void Promise.all(Array.from({ length: Math.ceil(ids.length / 500) }, (_, index) => api.loadoutUsage(ids.slice(index * 500, (index + 1) * 500), controller.signal)))
      .then(results => { if (!controller.signal.aborted && (clerk.user?.id ?? null) === owner) setUsageState({ key: usageKey, value: { ...results[0], items: results.flatMap(result => result.items) } }); })
      .catch((error: unknown) => { if (!controller.signal.aborted) setUsageState({ key: usageKey, error: error instanceof Error ? error.message : "Usage history is unavailable." }); });
    return () => controller.abort();
  // Corpus identity, not filtering or ranking, owns this request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, usageKey, corpus.ready, corpus.busy, corpus.error]);
  useEffect(() => {
    if (!owner || !local.ready || setupLocked || draft.freeConversation || draftSceneMode(draft) !== "custom" || !customScene.trim() || explicitLogicId(draft) || !corpus.ready || corpus.busy || corpus.error) return;
    const controller = new AbortController();
    const signature = customSignature;
    async function apply(value: SceneLogicResponse) {
        const current = setupLatest.current;
        if (controller.signal.aborted || current.owner !== owner || current.customSignature !== signature || (clerk.user?.id ?? null) !== owner || explicitLogicId(current.draft) || current.draft.submission || current.draft.plan?.value.practice_source) return;
        if (current.draft.logicSource === "scene" && current.draft.logicTemplateId === value.logic_template_id) {
          sceneLogicCache.current.set(signature, value); setSceneLogicState({ key: signature, value }); return;
        }
        const next: LoadoutDraft = { ...current.draft, logicTemplateId: value.logic_template_id, logicSource: "scene", suggestedLogic: true, targetStages: undefined, plan: undefined, selectedCandidateId: undefined };
        const nextQuick = recommendQuickStart(corpus.records, options?.logic_templates ?? [], next.scenarioType, next.shuffleSeed ?? 0, value.logic_template_id, recommendationContext);
        const nextPreview = replanLoadout(next, nextQuick, corpus.records, options);
        const nextSignature = sceneLogicSignature(owner, next, corpus.records, nextPreview.selectedKeys);
        // The draft hook publishes optimistically before its storage lock resolves.
        // Cache this verified result first so the new signature cannot spend another request.
        sceneLogicCache.current.set(signature, value); sceneLogicCache.current.set(nextSignature, value);
        if (await local.update(next, current.draft)) setSceneLogicState({ key: nextSignature, value });
    }
    const cached = sceneLogicCache.current.get(signature);
    if (cached) { void apply(cached); return () => controller.abort(); }
    const timer = setTimeout(() => {
      setSceneLogicState({ key: signature, busy: true });
      void createSpeakingApi(owner, getToken).sceneLogic({ scenario_type: draft.scenarioType, brief: customScene.trim(), corpus_item_ids: sceneTargetIds }, controller.signal).then(apply)
        .catch((error: unknown) => { if (!controller.signal.aborted) setSceneLogicState({ key: signature, error: error instanceof Error ? error.message : "Choose a structure yourself." }); });
    }, 600);
    return () => { clearTimeout(timer); controller.abort(); };
  // The full scene/owner/corpus signature fences responses; a manual logic choice cancels them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customSignature, local.ready, setupLocked, draft.freeConversation, corpus.ready, corpus.busy, corpus.error]);

  function change(patch: Partial<LoadoutDraft>, preservePlan = false) {
    if ("goal" in patch && patch.goal !== draft.goal) { patch.suggestedScene = false; patch.sceneMode = "custom"; patch.customScene = patch.goal; }
    if ("logicTemplateId" in patch && patch.logicTemplateId !== draft.logicTemplateId) { patch.targetStages = undefined; preservePlan = false; }
    if (busy || canRetrySnapshot || linked && !preservePlan) return;
    const next = { ...draft, ...patch, ...(!preservePlan ? { plan: undefined, selectedCandidateId: undefined } : {}), submission: undefined };
    void local.update(next, draft);
    setSubmission({ owner, busy: false, error: null, authError: false });
  }
  function showPreferences() { setAdjustOpen(true); }
  function showScenes() {
    setManualOpen(true);
    comparisonRef.current?.querySelector("summary")?.focus();
    comparisonRef.current?.scrollIntoView({ block: "center" });
  }
  function toggleTarget(record: (typeof corpus.records)[number]) {
    const next = toggleMissionSelection(draft, record);
    if (next === draft) return;
    change({ ...next, logicTemplateId: logic?.id ?? null, logicSource: draft.logicSource ?? (explicitLogicId(draft) ? "manual" : "auto"), suggestedLogic: !explicitLogicId(draft) });
  }
  function chooseLogic(id: LoadoutDraft["logicTemplateId"]) { change({ freeConversation: false, logicTemplateId: id, logicSource: id ? "manual" : "auto", suggestedLogic: !id }); }
  function adjustTarget(key: string, action: SceneTargetAdjustment) {
    const adjusted = adjustSceneTarget(draft, key, action);
    if (adjusted !== draft) change(adjusted);
  }
  async function signIn() {
    if (!await local.update(draft)) return;
    const returnUrl = currentAuthReturnUrl();
    clerk.openSignIn({ forceRedirectUrl: returnUrl, signUpForceRedirectUrl: returnUrl });
  }
  async function start() {
    if (inFlight.current || blocked) return;
    if (!owner || authError) { await signIn(); return; }
    const started = performance.now();
    startMissionPhase("scene_cache", started)(canRetrySnapshot ? "retry" : plan ? "cache_hit" : "cache_miss");
    const controller = new AbortController();
    inFlight.current = controller;
    let working = draft;
    let savedDraft = draft;
    let phase: MissionProblem["phase"] = canRetrySnapshot ? "saving" : "preparing";
    const assertCurrent = () => {
      controller.signal.throwIfAborted();
      if (latest.current.owner !== owner || latest.current.inputSignature !== inputSignature || (clerk.user?.id ?? null) !== owner) throw new DOMException("The setup changed.", "AbortError");
      if (!local.isCurrentDraft(working)) throw new Error("Your draft changed in another tab. Review it before starting.");
    };
    setSubmission({ owner, busy: true, phase: canRetrySnapshot || plan ? "saving" : "preparing", error: null, authError: false });
    try {
      assertCurrent();
      const api = createSpeakingApi(owner, getToken);
      // An uncertain create always replays its immutable request before planning.
      if (!canRetrySnapshot && !working.freeConversation) {
        if (!plan) {
          if (linked) throw new Error("This linked setup no longer matches its saved scenes. Unlink it before preparing a new mission.");
          if (!logic) throw new Error("Choose a conversation structure before starting.");
          const value = await api.plan(planningRequest(working, corpus.records, logic, 1), controller.signal, logic);
          assertCurrent();
          const generated = { ...working, plan: { signature: inputSignature, value }, selectedCandidateId: undefined, submission: undefined };
          if (!await local.update(generated, working)) throw new Error("Your draft changed or could not be saved while preparing the scene. Review it before starting.");
          working = generated; savedDraft = generated;
          assertCurrent();
        }
        const selected = automaticCandidate(working, corpus.records, logic);
        if (!selected) {
          if (!sceneFitAdvice(working, corpus.records, logic)) throw new SpeakingApiError("The prepared scenes could not be verified against your targets. Please retry preparation.", 502, "invalid_output_schema");
          setManualOpen(true);
          setSubmission({ owner, busy: false, error: missionFitProblem(), authError: false });
          return;
        }
        working = { ...working, selectedCandidateId: selected.id };
      }
      const prepared = working.freeConversation ? prepareFreeSubmission(working, () => crypto.randomUUID()) : preparePlannedSubmission(working, corpus.records, () => crypto.randomUUID(), logic);
      // The comparison uses the exact last saved draft, including any retry ID.
      if (!await local.update(prepared, savedDraft)) throw new Error("Your draft changed or could not be saved. Review it before starting.");
      working = prepared;
      assertCurrent();
      phase = "saving";
      setSubmission({ owner, busy: true, phase: "saving", error: null, authError: false });
      const session = await api.create(prepared.submission!.request, controller.signal);
      assertCurrent();
      const confirmed = await local.confirmSubmission(prepared, session.client_id);
      if (!confirmed) throw new Error("Your mission was saved, but its confirmation could not be saved on this device. Retry to recover the same mission before starting another.");
      working = confirmed;
      assertCurrent();
      prepareMissionNavigation(owner, session.id, started);
      router.push(missionHref("session", returnTo, session.id));
    } catch (error) {
      if (!controller.signal.aborted && (clerk.user?.id ?? null) === owner) setSubmission({ owner, busy: false,
        error: missionProblem(error, phase),
        authError: error instanceof SpeakingApiError && error.status === 401 });
    } finally { if (inFlight.current === controller) inFlight.current = null; }
  }

  async function requestStart(mode: "quick" | "manual" | "free" = "manual") {
    if (busy || queuedStart || !local.ready || local.error || !isLoaded || !options) return;
    if (canRetrySnapshot || linked) { await start(); return; }
    const useQuick = mode === "quick";
    const base = useQuick ? quickDraft : draft;
    const next = { ...replanLoadout(base, quick, corpus.records, options), supportLevel: base.freeConversation ? base.supportLevel : "model_frame" as const };
    if (!next.freeConversation && (!next.selectedKeys.length || !corpus.ready || corpus.busy || corpus.error)) return;
    if (next.plan?.value.version === 1 || missionInputSignature(next, corpus.records, logic) !== draft.plan?.signature) { next.plan = undefined; next.selectedCandidateId = undefined; }
    if (next === draft) { await start(); return; }
    if (await local.update(next, draft)) setQueuedStart({ owner, draft: next });
  }
  // Start only after the chosen suggestion is durably saved and React observes
  // its new signature. The existing owner/tab fences then cover the whole request.
  const queuedStartAction = useRef({ start });
  queuedStartAction.current = { start };
  useEffect(() => {
    if (!queuedStart || local.pending) return;
    setQueuedStart(null);
    if (queuedStart.owner === owner && queuedStart.draft === draft) void queuedStartAction.current.start();
  }, [queuedStart, local.pending, owner, draft]);
  const controlsLocked = busy || setupLocked || !!queuedStart || !local.ready;
  const difficultyLabel = { guided: "Guided", standard: "Natural", challenging: "Stretch" }[draft.difficulty];
  const feedbackLabel = { light: "Light", balanced: "Balanced", detailed: "Detailed" }[draft.feedbackLevel];
  const scenarioLabel = draft.scenarioType === "workplace" ? "Workplace" : draft.scenarioType === "travel" ? "Travel" : "Daily life";
  const startLabel = canRetrySnapshot ? "Retry start mission" : draft.freeConversation ? "Start free conversation"
    : manualKeys.length ? `Start with ${manualKeys.length} target${manualKeys.length === 1 ? "" : "s"}` : draftOrigin(draft) === "manual" || draftSceneMode(draft) === "custom" ? "Start mission" : "Quick start";

  const preferences = <div className={quickStyles.preferences}>
    <div className={quickStyles.preferenceRow}><span className={quickStyles.preferenceLabel}>Scenario</span><div className={quickStyles.preferenceChips}>{([["workplace", "Workplace"], ["everyday", "Daily life"], ["travel", "Travel"]] as const).map(([value, label]) => <button key={value} type="button" className={quickStyles.preferenceChip} disabled={controlsLocked} aria-pressed={draft.scenarioType === value} onClick={() => change({ scenarioType: value })}>{label}</button>)}</div></div>
    <div className={quickStyles.preferenceRow}><span className={quickStyles.preferenceLabel}>Difficulty</span><div className={quickStyles.preferenceChips}>{([["guided", "Guided"], ["standard", "Natural"], ["challenging", "Stretch"]] as const).map(([value, label]) => <button key={value} type="button" className={quickStyles.preferenceChip} disabled={controlsLocked} aria-pressed={draft.difficulty === value} onClick={() => change({ difficulty: value }, true)}>{label}</button>)}</div></div>
    <div className={quickStyles.preferenceRow}><span className={quickStyles.preferenceLabel}>Feedback</span><div className={quickStyles.preferenceChips}>{([["detailed", "Detailed"], ["light", "Light"], ...(draft.feedbackLevel === "balanced" ? [["balanced", "Balanced (saved)"]] : [])] as const).map(([value, label]) => <button key={value} type="button" className={quickStyles.preferenceChip} disabled={controlsLocked} aria-pressed={draft.feedbackLevel === value} onClick={() => change({ feedbackLevel: value as LoadoutDraft["feedbackLevel"] }, true)}>{label}</button>)}<button type="button" className={quickStyles.preferenceChip} disabled title="Summary-only feedback is not supported yet">Summary only</button></div></div>
    <p className={quickStyles.preferenceHelp}>Summary only is not supported yet.</p>
    {showLegacySupport ? <label>Conversation support<SelectField disabled={busy || canRetrySnapshot} aria-label="Mission support" value={draft.supportLevel ?? "legacy"} onValueChange={value => { if (isSupportLevel(value)) change(changeDraftSupport(draft, value), true); }} options={[...(draft.supportLevel == null ? [{ value: "legacy", label: "Existing support" }] : []), ...SUPPORT_OPTIONS.map(({ value, label }) => ({ value, label }))]} /></label> : null}
  </div>;

  return <div className={styles.reference}><AppHeader active="mission" /><main className={styles.page}><section className={styles.shell} aria-label="Speaking loadout"><div className={styles.body}>
    <div className={styles.main}>
      <DirectionLink href={returnTo} className={styles.back}><ArrowLeft size={14} aria-hidden="true" /> Back to learning</DirectionLink>
      <div className={styles.pageHeading}><div className={styles.eyebrow}>Stage 3 · Prepare to use your English</div><h1>Mission loadout</h1><p>Start in one click, or tune the details yourself.</p></div>
      {reportOrigin ? <p className={styles.notice} role="status">{reportOrigin === "saved" ? "Your previous mission is saved as an additional draft." : "Your previous mission is ready to adjust."} Choose your targets, then start to prepare a matching scene.{replaceMissing ? " Remove unavailable selections and choose replacements." : ""}</p> : null}
      {!local.ready && !local.error ? <ContentSkeleton label="Loading your saved loadout…" /> : null}
      <p className={`${styles.fieldHelp} ${styles.draftStatus}`} data-pending={local.pending} role="status" aria-hidden={!local.pending}>Saving your draft on this device… Keep this page open until saving finishes.</p>
      {local.error ? <div className={styles.error} role="alert"><p>{local.error}</p><p>This is a device storage issue, not evidence that you chose the wrong targets.{local.ready ? " Your current selection is still on this page." : ""}</p><Button variant="secondary" size="inherit" type="button" onClick={local.retry}>Retry saving draft</Button></div> : null}
      {local.deviceDrafts.map((deviceDraft, index) => <div className={styles.notice} key={index}><strong>You also have a saved draft.</strong><p>{deviceDraft.goal || "An untitled mission"} · {deviceDraft.selectedKeys.length} selected items. {deviceDraft.plan?.value.practice_source ? "Your current setup will be kept as another draft." : "Using it replaces the setup below."}</p><Button variant="secondary" size="inherit" type="button" disabled={busy || canRetrySnapshot} onClick={() => local.adopt(index)}>Use device draft{local.deviceDrafts.length > 1 ? ` ${index + 1}` : ""}</Button></div>)}
      {canRetrySnapshot ? <p className={styles.notice} role="status">A mission start is awaiting confirmation. Retry start mission to recover the original request before changing this setup.</p> : null}
      {linked ? <section className={styles.notice} aria-label="Linked second round"><strong>Linked second round · {draft.plan!.value.practice_source!.variation === "role_swap" ? "Swapped roles" : "Changed details"}</strong><p>Your language, target roles and scene setup stay linked to the original mission. You can change support. Unlink to edit the targets or prepare different scenes.</p><Button variant="secondary" size="inherit" type="button" disabled={busy || canRetrySnapshot} onClick={() => { void local.update({ ...draft, plan: undefined, selectedCandidateId: undefined, submission: undefined }, draft); }}>Unlink second round</Button></section> : null}

      {!corpus.ready && !corpus.error ? <ContentSkeleton label="Loading your corpus…" variant="cards" /> : <QuickStartCard
        picks={quick.picks} logic={quick.logic} scene={quick.scene} scenarioLabel={scenarioLabel}
        difficultyLabel={difficultyLabel} feedbackLabel={feedbackLabel} disabled={controlsLocked || !options || !!local.error || !!corpus.error || corpus.busy} startDisabled={!!quickTargetError}
        busy={busy} manualSelectionActive={draftOrigin(draft) === "manual" || draftSceneMode(draft) === "custom"} onStart={() => void requestStart("quick")} onShuffle={() => change({ shuffleSeed: (draft.shuffleSeed ?? 0) + 1 })} adjustOpen={adjustOpen} onAdjust={() => setAdjustOpen(value => !value)}>{preferences}</QuickStartCard>}
      {corpus.error ? <div className={styles.error} role="alert"><p>{corpus.error}</p><Button variant="secondary" size="inherit" type="button" onClick={corpus.retry}>Retry corpus sync</Button></div> : null}
      <section id="corpus" className={styles.section} aria-label="Your saved corpus">
        <div className={styles.sectionHeading}><div><h2>Or choose your own targets</h2></div><span className={styles.selectionCount} aria-live="polite">{manualKeys.length} / 5 selected</span></div>
        <div className={styles.filterChips} role="group" aria-label="Filter saved targets">
          {([ ["recommended", "Recommended"], ["due", "Due for review"], ["never", "Never used"], ["recent", "From recent videos"] ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        {manualKeys.length === 5 ? <p className={styles.fieldHelp} role="status">You have selected 5 targets. Remove one to choose another.</p> : null}
        {draft.selectedKeys.length > 5 ? <p className={styles.notice}>Your previous {draft.selectedKeys.length} selections are preserved. Choose up to 5 for this mission using the preview.</p> : null}
        {corpus.ready && !corpus.records.length ? <div className={styles.emptyLibrary}><h3>Your corpus starts here</h3><p>Save language while learning to get personal picks, or start a free conversation.</p><Link href={returnTo}>Find language to save <StartIcon /></Link></div> : null}
        {[...groups].sort(([a], [b]) => (logic?.steps.indexOf(a) === -1 ? 999 : logic?.steps.indexOf(a) ?? 999) - (logic?.steps.indexOf(b) === -1 ? 999 : logic?.steps.indexOf(b) ?? 999)).map(([title, records]) => <CorpusPicker key={title} title={title} functionLabel={logic && options?.logic_metadata?.[logic.id]?.stage_functions[logic.steps.indexOf(title)] ? FUNCTION_LABELS[options.logic_metadata[logic.id]!.stage_functions[logic.steps.indexOf(title)]] : undefined} reasons={reasons} records={records} selectedKeys={manualKeys} count={manualKeys.length} limit={5} disabled={controlsLocked} onToggle={toggleTarget} />)}
        {corpus.records.length && !groups.size ? <p className={styles.empty}>No saved expressions match this filter.</p> : null}
        {betterLogic && !setupLocked ? <div className={styles.notice}><p>{betterLogic.logic.title} gives {betterLogic.coverage} of your chosen targets a matching stage (currently {betterLogic.currentCoverage}). Your targets stay selected.</p><Button variant="secondary" size="inherit" disabled={controlsLocked} onClick={() => chooseLogic(betterLogic.logic.id)}>Use {betterLogic.logic.title}</Button></div> : null}
        <button type="button" className={styles.browseButton} onClick={() => setDrawerOpen(true)}>Browse the full corpus by function</button>
        {usageState.key === usageKey && usageState.error ? <p className={styles.fieldHelp} role="status">{usageState.error} Unknown history is not labelled Never used or Due.</p> : null}
        {filter === "recent" ? <p className={styles.fieldHelp}>Saved in the past 30 days from a verified YouTube link.</p> : filter === "due" ? <p className={styles.fieldHelp}>At least 7 days since a recorded target use.</p> : null}
      </section>
      {problem ? <div ref={recoveryRef} tabIndex={-1}><MissionRecovery problem={problem} advice={fitAdvice} draft={draft} disabled={busy}
        onRetry={() => void start()} onPreferences={showPreferences} onScene={showScenes} onAdjust={adjustTarget} /></div> : null}
      {optionsError ? <div className={styles.error} role="alert"><p>{optionsError}</p><Button variant="secondary" size="inherit" type="button" onClick={() => setOptionsAttempt(value => value + 1)}>Retry mission options</Button></div> : !options ? <p className={styles.fieldHelp} role="status">Loading mission settings…</p> : null}
      <section className={styles.advanced} aria-label="Advanced settings">
        <div className={styles.advancedHeading}>Advanced</div>
        <button type="button" className={styles.advancedRowButton} aria-expanded={adjustOpen} onClick={() => setAdjustOpen(value => !value)}>Mission preferences <span>{scenarioLabel} · {difficultyLabel} · {feedbackLabel}<ChevronDown size={16} aria-hidden="true" /></span></button>
        <details ref={comparisonRef} className={styles.advancedRow} open={manualOpen} onToggle={event => setManualOpen(event.currentTarget.open)}>
          <summary>Choose a scene myself <span>{draftSceneMode(draft) === "custom" ? "Custom scene" : "Let AI choose"}<ChevronDown size={16} aria-hidden="true" /></span></summary>
          <div className={styles.advancedPanel}>
            <div className={styles.filterChips} role="group" aria-label="Scene mode"><button type="button" disabled={controlsLocked} aria-pressed={draftSceneMode(draft) === "ai"} onClick={() => change({ sceneMode: "ai", logicSource: draft.logicSource === "scene" ? "auto" : draft.logicSource, suggestedScene: true })}>Let AI choose</button><button type="button" disabled={controlsLocked} aria-pressed={draftSceneMode(draft) === "custom"} onClick={() => change({ sceneMode: "custom", customScene })}>I will choose</button></div>
            {draftSceneMode(draft) === "custom" ? <label>Describe your scene<Textarea disabled={controlsLocked} ref={preferencesRef} aria-label="Custom scene" value={customScene} maxLength={500} rows={3} placeholder="For example: discussing a launch with a colleague" onChange={event => change({ customScene: event.target.value, sceneMode: "custom", logicSource: draft.logicSource === "scene" ? "auto" : draft.logicSource })} /><span className={styles.characterCount}>{customScene.length} / 500</span></label> : <p className={styles.fieldHelp}>AI plans a scene around your targets and your scenario. Switch to I will choose to describe your own.</p>}
            {sceneLogicState.key === customSignature ? <p className={styles.fieldHelp} role="status">{sceneLogicState.busy ? "Finding a structure for your scene…" : sceneLogicState.error ?? sceneLogicState.value?.reason}</p> : null}
            {explicitLogicId(draft) && draftSceneMode(draft) === "custom" ? <p className={styles.fieldHelp}>Your selected logic stays in place. Return to AI pick to infer a structure from this scene.</p> : null}

          </div>
        </details>
        <details className={styles.advancedRow}>
          <summary>Logic template <span>{draft.freeConversation ? "None" : logic?.title ?? "Recommended"}<ChevronDown size={16} aria-hidden="true" /></span></summary>
          <fieldset disabled={controlsLocked} className={styles.advancedPanel}>
            <p className={styles.sectionIntro}>Give your conversation a shape. Choose AI pick to return to a recommendation.</p>
            <button type="button" className={styles.browseButton} aria-pressed={!explicitLogicId(draft)} onClick={() => chooseLogic(null)}>AI pick</button>
            {familySuggestion ? <p className={styles.fieldHelp}>Your chosen structure stays in place. For {scenarioLabel.toLowerCase()}, try <button type="button" onClick={() => chooseLogic(familySuggestion.id)}>{familySuggestion.title}</button>.</p> : null}
            <div className={styles.filterChips} role="group" aria-label="Browse logic families">{(["workplace", "daily"] as const).map(family => <button type="button" key={family} aria-pressed={logicBrowseFamily === family} onClick={() => setLogicBrowseFamily(family)}>{family === "workplace" ? "Workplace" : "Daily life"}</button>)}</div>
            <div className={styles.logicGrid} role="group" aria-label={`${logicBrowseFamily} logic templates`}>{options?.logic_templates.filter(value => logicFamily(value, options.logic_metadata) === logicBrowseFamily).map(value => <button type="button" key={value.id} aria-pressed={logic?.id === value.id} className={`${styles.logicCard} ${logic?.id === value.id ? styles.selectedCard : ""}`} onClick={() => chooseLogic(explicitLogicId(draft) === value.id ? null : value.id)}><span className={styles.logicTitle}>{value.title}{logic?.id === value.id ? <Check size={15} aria-hidden="true" /> : null}</span><span className={styles.logicDescription}>{value.description}</span><span className={styles.logicFlow}>{value.steps.join(" → ")}</span></button>)}</div>

          </fieldset>
        </details>
        <details className={styles.advancedRow}>
          <summary>Practice history <span>Independent use across missions<ChevronDown size={16} aria-hidden="true" /></span></summary>
          <SupportHistory allowSupportAdjustment={showLegacySupport} owner={owner} getToken={getToken} draft={previewDraft} records={corpus.records} disabled={controlsLocked || !!local.error || !corpus.ready || corpus.busy || !!corpus.error || !!targetError || !previewDraft.selectedKeys.length} onApply={level => change(changeDraftSupport(draft, level), true)} />
        </details>
      </section>
    </div>
    <LoadoutPreview draft={previewDraft} records={corpus.records} logic={draft.freeConversation ? undefined : logic} suggested={draftOrigin(draft) === "quick" && !draft.freeConversation} submitting={controlsLocked}
      onRemove={key => {
        const selectedKeys = previewDraft.selectedKeys.filter(item => item !== key);
        change({ freeConversation: false, origin: "manual", pinnedKeys: selectedKeys, selectedKeys, logicTemplateId: logic?.id ?? null, logicSource: draft.logicSource ?? "auto", targetStages: undefined, targetRoles: Object.fromEntries(selectedKeys.map(value => [value, "primary"])) });
      }}>
      {problem ? <Button variant="ghost" size="inherit" type="button" className={styles.recoveryLink} onClick={() => { recoveryRef.current?.focus(); recoveryRef.current?.scrollIntoView({ block: "center" }); }}>Review mission guidance</Button> : null}
      {targetError && !canRetrySnapshot && corpus.records.length ? <p className={styles.validation} id="loadout-validation">{targetError}</p> : null}
      {busy && submission.phase === "preparing" && !draft.freeConversation ? <p className={styles.fieldHelp} role="status">Preparing a matching scene… This may take up to 2 minutes. Your selection is kept.</p> : null}
      <Button variant="primary" size="inherit" type="button" className={styles.startButton} disabled={blocked || !!queuedStart} loading={busy || !!queuedStart} loadingLabel={submission.phase === "preparing" && !draft.freeConversation ? "Preparing scene…" : "Saving mission…"} onClick={() => void requestStart()} aria-describedby={targetError && !canRetrySnapshot && corpus.records.length ? "loadout-validation" : undefined}>{!owner || authError ? `Sign in · ${startLabel.toLowerCase()}` : startLabel}<StartIcon /></Button>
      <Button variant="secondary" size="inherit" type="button" className={styles.freeButton} disabled={controlsLocked || !isLoaded || !options || !!local.error} onClick={() => change({ freeConversation: true, origin: "manual", pinnedKeys: [], selectedKeys: [], logicTemplateId: null, logicSource: "auto", targetStages: undefined, targetRoles: {} })}>Free conversation, no targets</Button>
      {!owner ? <p className={styles.fieldHelp}>Sign in to save and start your mission.</p> : null}
    </LoadoutPreview>
  </div></section></main>{drawerOpen ? <CorpusDrawer query={drawerQuery} onQueryChange={setDrawerQuery} functionFilter={drawerFunction} onFunctionFilterChange={setDrawerFunction} records={corpus.records.filter(loadoutEligible)} selectedKeys={manualKeys} disabled={controlsLocked} onToggle={toggleTarget} onClose={() => setDrawerOpen(false)} /> : null}</div>;
}
