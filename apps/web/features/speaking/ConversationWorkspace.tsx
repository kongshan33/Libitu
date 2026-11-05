"use client";

import { currentAuthReturnUrl } from "@/features/navigation/return-location";

import { DirectionLink } from "@/components/ui/direction-button";

import { useNavigationFocus } from "@/components/AppNavigation";
import { ConversationHeader, MissionIntro, StageGuide, ConversationToolbar, VoiceSurface, MicrophoneButton, MicrophoneBar, ConversationMessage, StageDivider, TargetPanel } from "./ConversationPresentation";

import { Textarea } from "@/components/ui/field";

import { Button, ButtonLink } from "@/components/ui/button";

import { useAuth, useClerk } from "@clerk/nextjs";
import { BrandLogo } from "@/components/BrandLogo";
import { useRouteIntent, useRoutePrefetch } from "../navigation/use-route-prefetch";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, Check, ChevronDown, ChevronRight, Expand, LoaderCircle, Minimize, Pause, Square, Trash2, X } from "lucide-react";
import type { SpeakingDemonstration, SpeakingEvidence, SpeakingHelpLevel, SpeakingMessage, SpeakingOpportunity, SpeakingSupportLevel, SpeakingWorkspace } from "@libitu/types/speaking";
import { missionHref } from "../navigation/return-location";
import { useConversation } from "./use-conversation";
import { validEvidence, observedItemIds, assistanceLabel } from "./evidence";
import { ConfirmedRecast } from "./ConfirmedRecast";
import { validRecasts } from "./recasts";
import { concealedTargets, stageMarkers, waitingForReply } from "./conversation-view";
import { QuestionHelp } from "./QuestionHelp";
import { HintCard } from "./HintCard";
import { observeVisible } from "./visibility";
import { currentSupport, validDemonstrations } from "./support";
import { SupportControls } from "./SupportControls";
import { finishMissionNavigation } from "./mission-timing";
import styles from "./Speaking.module.css";

function MissionNavigation({ returnTo, title, reportHref, exit }: { returnTo: string; title?: string; reportHref?: string; exit?: React.ReactNode }) {
  return <ConversationHeader title={title} loadoutHref={missionHref("loadout", returnTo)} practiceHref={returnTo} reportHref={reportHref} exit={exit} />;
}

export function ConversationWorkspace({ sessionId, returnTo = "/" }: { sessionId: string; returnTo?: string }) {
  const { isLoaded, userId, getToken } = useAuth();
  const clerk = useClerk();
  if (!isLoaded) return <MissionLoading returnTo={returnTo} />;
  if (!userId) return <><MissionNavigation returnTo={returnTo} /><main className={styles.page}><section className={styles.gate}><BrandLogo className={styles.logo} /><h1>Sign in to view your mission</h1><p>Your saved mission and conversation belong to your account.</p><Button variant="primary" size="md" className={styles.primary} onClick={() => { const url = currentAuthReturnUrl(); clerk.openSignIn({ forceRedirectUrl: url, signUpForceRedirectUrl: url }); }}>Sign in</Button></section></main></>;
  return <OwnedConversation key={`${userId}:${sessionId}`} owner={userId} sessionId={sessionId} returnTo={returnTo} getToken={getToken} />;
}
/** Keep auth and workspace loading visually identical; route transitions retain Loadout. */
function MissionLoading({ returnTo }: { returnTo: string }) {
  return <><MissionNavigation returnTo={returnTo} /><main className={styles.page}><section className={styles.shell} aria-label="Speaking mission" aria-busy="true">
    <div className={styles.topbar} aria-label="Mission controls"><DirectionLink className={styles.back} href={missionHref("loadout", returnTo)}><ArrowLeft size={14} aria-hidden="true" /><span>Loadout</span></DirectionLink></div>
    <div role="status" aria-label="Loading your saved mission…">
      <span className={styles.loadingLabel}>Loading your saved mission…</span>
      <div className={styles.loadingContent} aria-hidden="true">
        <div className={`${styles.mission} ${styles.loadingMission}`}><span className={styles.loadingEyebrow} /><span className={styles.loadingTitle} /><span className={styles.loadingDescription} /></div>
        <div className={styles.workspace}>
          <div className={styles.conversation}>
            <div className={styles.toolbar}><span className={styles.loadingTabs} /><span className={styles.topspacer} /><span className={styles.loadingStatus} /></div>
            <div className={styles.voice}><span className={styles.loadingOrb} /><span className={styles.loadingVoiceTitle} /><span className={styles.loadingVoiceHelp} /><span className={styles.loadingAction} /></div>
            <div className={styles.composerArea}><span className={styles.loadingComposer} /></div>
          </div>
          <div className={styles.sidebar}><span className={styles.loadingSidebarTitle} /><span className={styles.loadingEntry} /><span className={styles.loadingEntry} /><span className={styles.loadingEntry} /></div>
        </div>
      </div>
    </div>
  </section></main></>;
}
function HighlightedMessage({ message, evidence, demonstrations, onSelect }: { message: SpeakingMessage; evidence: SpeakingEvidence[]; demonstrations?: SpeakingDemonstration[]; onSelect: (value: SpeakingEvidence) => void }) {
  if (message.role === "assistant") {
    const pieces: React.ReactNode[] = []; let end = 0;
    for (const match of validDemonstrations(message, demonstrations)) {
      if (match.start < end) continue;
      pieces.push(message.text.slice(end, match.start));
      pieces.push(<mark className={styles.modelMark} key={`${match.target_item_id}:${match.start}`}>{match.quote}</mark>);
      end = match.end;
    }
    pieces.push(message.text.slice(end));
    return <>{pieces}</>;
  }
  const matches = validEvidence(message, evidence);
  const pieces: React.ReactNode[] = []; let end = 0;
  for (const match of matches) {
    if (match.start < end) continue;
    pieces.push(message.text.slice(end, match.start));
    pieces.push(<button type="button" className={styles.evidenceMark} key={match.id} onClick={() => onSelect(match)} aria-label={`View evidence for ${match.quote}`}>{match.quote}</button>);
    end = match.end;
  }
  pieces.push(message.text.slice(end));
  return <>{pieces}</>;
}
function VisibleMessage({ message, active, onShown, children }: { message: SpeakingMessage; active: boolean; onShown: (id: string, revision: number) => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active || message.role !== "assistant" || message.status === "unavailable" || !ref.current) return;
    return observeVisible(ref.current, () => onShown(message.id, message.revision));
  }, [active, message.id, message.revision, message.role, message.status, onShown]);
  return <div ref={ref} className={styles.bubble}>{children}</div>;
}
function OpportunityStatus({ value, version, canChange, hideReason, onSkip, onRestore, compact }: {
  value: SpeakingOpportunity; version: number; canChange: boolean;
  hideReason?: boolean; compact?: boolean;
  onSkip: (id: string) => boolean | undefined; onRestore: (id: string) => boolean | undefined;
}) {
  const [pending, setPending] = useState<number | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const waiting = pending !== null && version <= pending;
  useEffect(() => {
    if (!waiting) return;
    const timer = setTimeout(() => { setPending(null); setUnconfirmed(true); }, 10_000);
    return () => clearTimeout(timer);
  }, [waiting]);
  function change() {
    const sent = value.status === "skipped" ? onRestore(value.session_item_id) : onSkip(value.session_item_id);
    if (sent) { setPending(version); setUnconfirmed(false); }
  }
  const label = value.status === "skipped" ? "Skipped · excluded from assessment"
    : value.status === "used" ? "Used in this mission"
      : value.status === "offered" ? "Opportunity confirmed" : "Opportunity not yet confirmed";
  return <div className={styles.opportunity}>
    {!compact ? <span className={styles.opportunityStatus} data-status={value.status} role="status">{label}</span> : null}
    {!compact && value.status === "skipped" ? <p>{hideReason ? null : value.skipped_reason} Skipping this target does not count as a failed attempt.</p>
      : !compact && value.role === "opportunity" ? <p>Optional: use this only when it fits.</p> : !compact && value.status === "planned" ? <p>Your partner has a planned opportunity. It has not yet been confirmed in the conversation.</p> : null}
    <button type="button" className={styles.itemHelp} disabled={!canChange || waiting} onClick={change}>{waiting ? "Saving change…" : value.status === "skipped" ? "Undo skip" : "Doesn't fit this scene"}</button>
    {unconfirmed ? <p role="status">The change was not confirmed. Check your connection and retry.</p> : null}
  </div>;
}
function VisibleTarget({ id, text, active, onShown }: { id: string; text: string; active: boolean; onShown: (id: string) => void }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    return observeVisible(ref.current, () => onShown(id));
  }, [active, id, text, onShown]);
  return <h3 ref={ref}>{text}</h3>;
}
function VisibleFrame({ id, text, active, onShown }: { id: string; text: string; active: boolean; onShown: (id: string) => void }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    return observeVisible(ref.current, () => onShown(id));
  }, [active, id, text, onShown]);
  return <p ref={ref} className={styles.sentenceFrame}><span>Sentence frame</span>{text}</p>;
}
function targetHintLabel(workspace: SpeakingWorkspace, itemId: string): string {
  const help = workspace.conversation?.help;
  if (!help || help.target_item_id !== itemId) return "Hint";
  if (help.status === "loading") return "Finding help…";
  if (help.status === "unavailable") return "Try hint again";
  if (help.status !== "ready") return "Hint";
  return help.level === "direction" ? "Opening words" : help.level === "usage" ? "See an example" : "Hide hint";
}
function TrainingSidebar({ workspace, onSelect, onHint, onSkip, onRestore, onTargetShown, canHint, hintDisabledReason }: {
  workspace: SpeakingWorkspace; onSelect: (value: SpeakingEvidence) => void;
  onHint: (level: "usage" | "example", targetItemId?: string) => void;
  onSkip: (id: string) => boolean | undefined; onRestore: (id: string) => boolean | undefined; canHint: boolean;
  onTargetShown: (id: string) => void; hintDisabledReason?: string;
}) {
  if (concealedTargets(workspace)) return <ConcealedTrainingSidebar workspace={workspace} onSelect={onSelect} onHint={onHint} onSkip={onSkip} onRestore={onRestore} onTargetShown={onTargetShown} canHint={canHint} hintDisabledReason={hintDisabledReason} />;
  const items = [...workspace.session.items].sort((a, b) => a.ordinal - b.ordinal);
  const valid = workspace.messages.flatMap(message => validEvidence(message, workspace.evidence));
  const observed = observedItemIds(workspace);
  const planned = Boolean(workspace.session.mission_plan);
  const support = currentSupport(workspace);
  const hideWording = support?.level === "no_hint";
  const legacy = support === null;
  const active = !["completed", "abandoned"].includes(workspace.session.status);
  const groups = planned ? ["primary", "opportunity"] : ["expression", "structure"];
  const skipped = new Set(workspace.opportunities?.filter(value => value.status === "skipped").map(value => value.session_item_id));
  return <>
    <div className={styles.sidebarHeading}><span>Your loadout</span><span>{items.length ? `${items.length} targets` : "Free conversation"}</span></div>
    {groups.map(group => <section className={group === "structure" ? styles.structures : undefined} key={group}>
      <h2 className={styles.groupTitle}>{group === "primary" ? "Primary targets" : group === "opportunity" ? "Opportunity targets" : group === "structure" ? "Structures" : "Expressions"}</h2>
      {items.filter(item => planned ? workspace.session.mission_plan?.targets.find(target => target.session_item_id === item.id)?.role === group : group === "structure" ? item.kind === "structure" : item.kind !== "structure").map(item => {
        const evidence = valid.filter(value => value.session_item_id === item.id);
        const learning = workspace.learning.find(value => value.session_item_id === item.id);
        const opportunity = workspace.opportunities?.find(value => value.session_item_id === item.id);
        const target = workspace.session.mission_plan?.targets.find(value => value.session_item_id === item.id);
        return <article className={styles.languageCard} key={item.id}>
          {hideWording ? <h3>{target?.role === "opportunity" ? "Opportunity target" : "Primary target"} {item.ordinal + 1}</h3>
            : <VisibleTarget id={item.id} text={item.text} active={(planned || support !== null) && active} onShown={onTargetShown} />}
          {legacy && item.meaning ? <p>{item.meaning}</p> : null}
          {legacy && target ? <p className={styles.usageDetail}>{target.communicative_function}</p> : null}
          {support?.level === "model_frame" ? target?.sentence_frame
            ? <VisibleFrame id={item.id} text={target.sentence_frame} active={(planned || support !== null) && active} onShown={onTargetShown} />
            : <p>A sentence frame is not available for this target. You can ask for help.</p> : null}
          {opportunity ? <OpportunityStatus value={opportunity} version={workspace.version} canChange={canHint} hideReason={hideWording} onSkip={onSkip} onRestore={onRestore} /> : null}
          {legacy && Object.keys(item.slots).length ? <details><summary>Pattern slots</summary><dl>{Object.entries(item.slots).map(([slot, description]) => <div key={slot}><dt>{slot}</dt><dd>{description}</dd></div>)}</dl></details> : null}
          {evidence.length ? <><button type="button" className={styles.evidenceLink} onClick={() => onSelect(evidence[evidence.length - 1])}><Check size={12} aria-hidden="true" /> {evidence.length} observed {evidence.length === 1 ? "use" : "uses"}<ChevronRight size={12} aria-hidden="true" /></button>{learning ? <p className={styles.usageDetail}>{learning.independent_uses} independent · {learning.prompted_uses} prompted</p> : null}</> : <span className={styles.notObserved}>Not observed yet</span>}
          <button type="button" className={styles.itemHelp} disabled={!canHint || !!hintDisabledReason || opportunity?.status === "skipped"} title={hintDisabledReason} onClick={() => onHint("usage", item.id)}>Help me use this</button>
        </article>;
      })}
    </section>)}
    <section className={styles.observations}><h2>Practice so far</h2><div><span>User turns</span><strong>{workspace.session.turn_count}</strong></div>{planned ? <><div><span>Primary used</span><strong>{workspace.opportunities?.filter(value => value.role === "primary" && value.status === "used").length ?? 0}</strong></div><div><span>Opportunity used</span><strong>{workspace.opportunities?.filter(value => value.role === "opportunity" && value.status === "used").length ?? 0}</strong></div><div><span>Skipped</span><strong>{skipped.size}</strong></div></> : items.length ? <div><span>Language observed</span><strong>{observed.size}/{items.length}</strong></div> : <p>No target expressions in this conversation.</p>}<p>Observations in this conversation, not a mastery score.</p>
      <p role="status">{workspace.analysis_status === "pending" ? "Checking your latest turn…" : workspace.analysis_status === "unavailable" ? "Language analysis is unavailable for the latest turn." : workspace.analysis_status === "ready" ? "Evidence is up to date." : "Evidence appears after a finalized turn."}</p>
    </section>
  </>;
}

function ConcealedTrainingSidebar({ workspace, onSelect, onHint, onSkip, onRestore, onTargetShown, canHint, hintDisabledReason }: {
  workspace: SpeakingWorkspace; onSelect: (value: SpeakingEvidence) => void;
  onHint: (level: "usage" | "example", targetItemId?: string) => void;
  onSkip: (id: string) => boolean | undefined; onRestore: (id: string) => boolean | undefined;
  onTargetShown: (id: string) => void; hintDisabledReason?: string; canHint: boolean;
}) {
  const [revealed, setRevealed] = useState(true);
  const plan = workspace.session.mission_plan;
  const progress = workspace.stage_progress;
  const active = !["completed", "abandoned"].includes(workspace.session.status);
  const valid = workspace.messages.flatMap(message => validEvidence(message, workspace.evidence));
  const targets = [...workspace.session.items].sort((a, b) => a.ordinal - b.ordinal).map(item => {
    const target = plan?.targets.find(value => value.session_item_id === item.id);
    const state = progress?.targets.find(value => value.session_item_id === item.id);
    const evidence = valid.filter(value => value.session_item_id === item.id);
    const used = evidence.length > 0;
    const modeled = plan?.version === 2 ? state?.modeling_status === "modeled"
      : workspace.messages.some(message => validDemonstrations(message, workspace.demonstrations).some(value => value.target_item_id === item.id));
    const opportunity = workspace.opportunities?.find(value => value.session_item_id === item.id);
    const current = plan?.version === 2 ? target?.stage_index != null && target.stage_index === progress?.current_stage_index
      : workspace.conversation?.question?.target_item_id === item.id;
    const status = opportunity?.status === "skipped" ? "Skipped" : used
      ? evidence.some(value => value.assistance === "independent" || (!value.assistance && !value.prompted)) ? "Used on your own" : "Used with help"
      : modeled ? "Partner example confirmed" : state?.modeling_status === "uncertain" ? "Example delivery uncertain" : "Not used yet";
    return { id: item.id, stage: target?.stage_index == null ? "Any stage" : plan?.logic_template?.steps[target.stage_index] ?? "Any stage",
      text: item.text, meaning: item.meaning, used, modeled, current, status,
      actions: <>{used ? <button type="button" className={styles.evidenceLink} onClick={() => onSelect(evidence[evidence.length - 1])}><Check size={12} aria-hidden="true" />View use<ChevronRight size={12} aria-hidden="true" /></button> : null}
        {active && (plan?.version !== 2 || current || opportunity?.status === "skipped") ? <div className={styles.targetActions}>
          <button type="button" className={styles.itemHelp} disabled={!canHint || !!hintDisabledReason || opportunity?.status === "skipped"} title={hintDisabledReason} aria-busy={workspace.conversation?.help?.target_item_id === item.id && workspace.conversation.help.status === "loading"} onClick={() => onHint("usage", item.id)}>{targetHintLabel(workspace, item.id)}</button>
          {opportunity ? <OpportunityStatus compact value={opportunity} version={workspace.version} canChange={canHint} hideReason={!revealed && !modeled && !used} onSkip={onSkip} onRestore={onRestore} /> : null}
        </div> : null}</> };
  });
  return <TargetPanel targets={targets} reveal={revealed} onReveal={() => setRevealed(value => !value)} active={active} onShown={onTargetShown}
    footer={<>{hintDisabledReason ? <p className={styles.meta} role="status">{hintDisabledReason}</p> : null}{workspace.analysis_status === "unavailable" ? <p className={styles.meta} role="status">Language analysis is unavailable for the latest turn.</p> : null}</>} />;
}

function OwnedConversation({ owner, sessionId, returnTo, getToken }: { owner: string; sessionId: string; returnTo: string; getToken: () => Promise<string | null> }) {
  const router = useRouter();
  const reportIntent = useRouteIntent(missionHref("analytics", returnTo, sessionId));
  const prefetch = useRoutePrefetch();
  const { state, controller } = useConversation(owner, sessionId, getToken);
  const [view, setView] = useState<"voice" | "chat">("voice");
  const [focused, setFocused] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [text, setText] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<SpeakingEvidence | null>(null);
  const [confirmAction, setConfirmAction] = useState<"end" | "delete" | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const workspace = state.workspace;
  useEffect(() => {
    if (workspace && ["idle", "ended"].includes(state.connection)) finishMissionNavigation(owner, sessionId);
  }, [owner, sessionId, workspace, state.connection]);
  const support = workspace ? currentSupport(workspace) : null;
  const visibleMessages = workspace?.messages.filter(message => message.text.trim().length > 0) ?? [];
  const visiblePartials = Object.entries(state.partials).filter(([, partial]) => partial.text.trim().length > 0);
  const ended = state.connection === "ended";
  const connected = state.connection === "connected";
  const connecting = state.connection === "connecting";
  const allTargetsSkipped = !!workspace?.session.mission_plan && !!workspace.opportunities?.length && workspace.opportunities.every(value => value.status === "skipped");
  const newHelp = workspace?.runtime?.conversation_contract_version === 1;
  const requestHint = useCallback((level: "usage" | "example" = "usage", targetItemId?: string) => {
    if (newHelp) controller?.requestHelp(targetItemId); else controller?.hint(level, targetItemId);
  }, [controller, newHelp]);
  const conversationHelpShown = useCallback((id: string, version: number) => controller?.conversationHelpShown(id, version), [controller]);
  useEffect(() => {
    const activity = () => controller?.setActivity(!!text.trim(), document.visibilityState === "visible" && !confirmAction);
    activity(); document.addEventListener("visibilitychange", activity);
    return () => document.removeEventListener("visibilitychange", activity);
  }, [controller, text, confirmAction]);
  const skipTarget = useCallback((id: string) => controller?.skipTarget(id), [controller]);
  const restoreTarget = useCallback((id: string) => controller?.restoreTarget(id), [controller]);
  const targetShown = useCallback((id: string) => controller?.targetShown(id), [controller]);
  const changeSupport = useCallback((level: SpeakingSupportLevel) => { controller?.setSupport(level); }, [controller]);
  const hintShown = useCallback((id: string, version: number, level: SpeakingHelpLevel) => controller?.hintShown(id, version, level), [controller]);
  const recastShown = useCallback((id: string, version: number) => controller?.recastShown(id, version), [controller]);
  const messageShown = useCallback((id: string, revision: number) => controller?.messageShown(id, revision), [controller]);
  const canStart = !!workspace && !ended && !connecting && !state.busy;
  const evidence = selectedEvidence && workspace?.messages.some(message => validEvidence(message, workspace.evidence).some(item => item.id === selectedEvidence.id)) ? selectedEvidence : null;
  useEffect(() => { if (view === "chat") bottom.current?.scrollIntoView({ block: "nearest", behavior: "instant" }); }, [visibleMessages.length, visiblePartials.length, state.pending?.id, view]);
  function chooseEvidence(value: SpeakingEvidence) { setSelectedEvidence(value); setTrainingOpen(true); setFocused(false); requestAnimationFrame(() => document.getElementById("language-evidence")?.scrollIntoView({ block: "nearest", behavior: "smooth" })); }
  async function submit() { const value = text.trim(); if (!value || !controller || state.pending || ended) return; setView("chat"); setText(""); await controller.submit(value); }
  async function confirm() {
    if (!controller) return;
    prefetch(confirmAction === "delete" ? missionHref("loadout", returnTo) : missionHref("analytics", returnTo, sessionId));
    if (confirmAction === "delete") { if (await controller.delete()) router.replace(missionHref("loadout", returnTo)); }
    else { if (await controller.end()) { setConfirmAction(null); router.push(missionHref("analytics", returnTo, sessionId)); } }
  }
  useNavigationFocus(connected && !ended);
  if (!workspace && !state.error) return <MissionLoading returnTo={returnTo} />;
  const status = ended ? "Completed" : connecting ? "Connecting…" : state.connection === "paused" ? "Paused" : !connected ? "Offline" : state.userSpeaking ? "Listening" : state.phase === "thinking" ? "Thinking…" : state.phase === "speaking" ? "Speaking" : state.microphone ? workspace && !text.trim() && !state.pending && !confirmAction && waitingForReply(workspace) ? "Waiting for you" : "Listening" : "Microphone off";
  const latestPartial = visiblePartials.at(-1)?.[1];
  const latestMessage = visibleMessages.at(-1);
  const caption = state.userSpeaking ? visiblePartials.findLast(([, value]) => value.role === "user")?.[1] : latestPartial;
  const currentMessage = state.userSpeaking ? undefined : latestMessage;
  const dividers = workspace ? stageMarkers(workspace) : new Map();
  const recasts = validRecasts(workspace?.conversation?.recasts, workspace?.messages ?? []);
  const latestUser = workspace?.messages.findLast(message => message.role === "user");
  const voiceRecast = connected && !state.userSpeaking && !text.trim() && !state.pending && !confirmAction
    ? recasts.findLast(row => row.source.message_id === latestUser?.id && row.source.message_id !== state.recastSourceRetired && row.delivery?.message_id === currentMessage?.id) : null;
  const micDisabled = state.microphoneBusy || connecting || state.busy || state.conflict;
  const toggleMicrophone = () => { if (!connected) void controller?.start(true); else void controller?.setMicrophone(!state.microphone); };
  const startLabel = state.connection === "paused" ? "Resume conversation" : state.connection === "disconnected" ? "Reconnect" : "Start conversation";
  const startAction = !connected && !ended ? <Button variant="primary" size="md" className={styles.primary} disabled={!canStart || state.conflict} loading={connecting} loadingLabel="Connecting…" onClick={() => void controller?.start(view === "voice")}>{startLabel}</Button> : null;
  const helpCard = workspace?.conversation?.help;
  const labelCard = helpCard?.status === "loading" && !state.helpLoadingVisible ? state.retainedConversationHelp : helpCard;
  const helpLabel = labelCard?.status === "unavailable" ? "Try again" : labelCard?.status === "loading" ? "Finding help…" : labelCard?.status === "ready" ? labelCard.level === "direction" ? "Opening words" : labelCard.level === "usage" ? "See an example" : "Hide hint" : "Need a hint?";
  const targetHintDisabledReason = !connected ? "Start or resume the conversation to get a target hint."
    : state.replyReference || state.userSpeaking || !!text.trim() || !!state.pending ? "Target hints are available after you finish your reply."
    : !!confirmAction || state.busy || state.conflict ? "Close the current action to get a target hint."
    : newHelp && (state.phase !== "listening" || !workspace?.conversation?.question || !["presenting", "awaiting_reply", "responding"].includes(workspace.conversation.question.status)) ? "Target hints are available when your partner finishes a question."
    : newHelp && helpCard?.status === "loading" ? "Preparing a hint in the conversation…" : undefined;
  const hint = !ended && newHelp ? <QuestionHelp frozen={state.replyReference?.help} retained={state.retainedConversationHelp} loadingVisible={state.helpLoadingVisible} conversation={workspace?.conversation} hidden={!connected || !!confirmAction || (state.replyReference ? !state.replyReference.help : state.userSpeaking || !!text.trim() || !!state.pending)} onShown={conversationHelpShown} /> : !ended ? <HintCard card={state.replyReference ? state.replyReference.legacyHelp ?? null : support && workspace?.help?.source === "automatic" ? null : workspace?.help ?? null} connected={connected && !state.replyReference} userSpeaking={false} onHint={requestHint} onShown={hintShown} /> : null;
  return <><MissionNavigation returnTo={returnTo} title={workspace?.session.goal} reportHref={ended ? missionHref("analytics", returnTo, sessionId) : undefined} exit={<button type="button" disabled={state.busy} onClick={() => setConfirmAction("end")}>End mission</button>} /><main className={styles.page}><section className={`${styles.shell} ${focused ? styles.focused : ""}`} aria-label="Speaking mission">
    {!workspace ? <div className={styles.empty}><h1>Mission unavailable</h1><p role="alert">{state.error}</p><Button variant="primary" className={styles.primary} onClick={() => void controller?.load()}>Retry loading mission</Button></div> : <>
      <MissionIntro goal={workspace.session.goal} metadata={ended ? "Saved conversation · read-only review" : `${workspace.session.scenario_type === "workplace" ? "Workplace" : workspace.session.scenario_type === "travel" ? "Travel" : "Everyday life"} · ${workspace.session.difficulty} · ${workspace.session.feedback_level} feedback`}
        setting={workspace.session.mission_plan ? `${workspace.session.mission_plan.setting} You are ${workspace.session.mission_plan.user_role}. Your partner is ${workspace.session.mission_plan.ai_role}.` : undefined}
        actions={<><DirectionLink href={missionHref("loadout", returnTo)}>Back to loadout</DirectionLink>{!ended && !connected ? <Button {...reportIntent} variant="secondary" size="md" className={styles.endButton} onClick={() => setConfirmAction("end")} disabled={state.busy}>End mission</Button> : null}</>} />
      {workspace.session.logic_template ? <StageGuide title={workspace.session.logic_template.title} steps={workspace.session.logic_template.steps} currentIndex={workspace.stage_progress?.current_stage_index} statuses={workspace.session.logic_template.steps.map((_, index) => workspace.stage_progress?.stages.find(stage => stage.index === index)?.status ?? "pending")} /> : null}
      {!ended && workspace.session.mission_plan?.version !== 2 ? <SupportControls workspace={workspace} disabled={!connected || state.busy || state.phase !== "listening" || state.userSpeaking} pending={!!state.supportPending} error={state.supportError} onChange={changeSupport} /> : null}
      {state.error ? <div className={styles.notice} role="alert"><span>{state.error}</span>{state.conflict ? <Button variant="secondary" size="md" onClick={() => void controller?.start(view === "voice", true)} disabled={connecting}>Take over here</Button> : null}</div> : null}
      {confirmAction ? <section className={styles.confirm} aria-label={confirmAction === "delete" ? "Delete conversation confirmation" : "End mission confirmation"}><h2>{confirmAction === "delete" ? "Delete this mission?" : "End this mission?"}</h2><p>{confirmAction === "delete" ? "Your saved transcript, language evidence and mission will be permanently deleted." : state.pending ? "One message is still unconfirmed. Ending closes the connection and saves the finalized conversation for review." : "This stops the microphone and closes the conversation. Your finalized transcript and evidence stay available."}</p><div><Button variant={confirmAction === "delete" ? "danger-solid" : "primary"} size="md" className={styles.primary} disabled={state.busy} loading={state.busy} loadingLabel="Saving…" onClick={() => void confirm()}>{confirmAction === "delete" ? "Delete permanently" : "End and review"}</Button><Button variant="secondary" size="md" disabled={state.busy} onClick={() => setConfirmAction(null)}>Cancel</Button></div></section> : null}
      <div className={styles.workspace}>
        <section className={styles.conversation} aria-label="Conversation">
          <ConversationToolbar view={view} onView={setView} status={status} online={connected} actions={<>
            <button type="button" className={styles.trainingToggle} aria-expanded={trainingOpen} aria-controls="mission-targets" onClick={() => { setTrainingOpen(!trainingOpen); setFocused(false); }}>Targets<ChevronDown size={14} aria-hidden="true" /></button>
            <button type="button" className={styles.iconButton} aria-label={focused ? "Restore training sidebar" : "Expand conversation"} aria-pressed={focused} onClick={() => setFocused(!focused)}>{focused ? <Minimize size={16} /> : <Expand size={16} />}</button></>} />
          {state.connection === "paused" || state.connection === "disconnected" ? <div className={styles.connectionNotice}><div><strong>{state.connection === "paused" ? "Conversation paused" : "Connection lost"}</strong><p>Your finalized transcript is saved.</p></div>{view === "voice" ? startAction : null}</div> : null}
          {view === "voice" ? <VoiceSurface getOutputLevel={controller?.getOutputLevel} recast={voiceRecast ? <ConfirmedRecast recast={voiceRecast} voice active={connected} onShown={recastShown} /> : null} phase={connected ? state.phase : "idle"} speaker={state.replyReference ? "AI partner · now" : caption?.role === "user" || currentMessage?.role === "user" ? "You · now" : "AI partner · now"}
            utterance={state.replyReference ? state.replyReference.question : caption ? caption.text : currentMessage ? <><VisibleMessage message={currentMessage} active={connected} onShown={messageShown}><HighlightedMessage message={currentMessage} evidence={workspace.evidence} demonstrations={support?.level === "no_hint" && workspace.session.mission_plan?.version !== 2 ? [] : workspace.demonstrations} onSelect={chooseEvidence} /></VisibleMessage>{currentMessage.status !== "final" ? <p className={styles.messageStatus}>Transcript may include words not played.</p> : null}</> : undefined}
            hint={hint}
            action={state.connection !== "paused" && state.connection !== "disconnected" ? startAction : null}
            controls={connected ? <div className={styles.voiceControls}><MicrophoneButton large enabled={state.microphone} disabled={micDisabled} onClick={toggleMicrophone} /><div className={styles.voiceActions}>{state.phase === "speaking" ? <button type="button" className={styles.quiet} onClick={() => controller?.interrupt()}><Square size={12} aria-hidden="true" />Stop speaking</button> : null}<button type="button" className={styles.quiet} onClick={() => controller?.pause()}><Pause size={12} aria-hidden="true" />Pause conversation</button></div></div> : undefined} />
            : <div className={styles.chat} aria-label="Conversation transcript">
              {!visibleMessages.length && !visiblePartials.length && !state.pending ? <div className={styles.chatEmpty}><h2>Ready when you are</h2></div> : null}
              {visibleMessages.map(message => <Fragment key={message.id}>{dividers.has(message.id) ? <StageDivider label={dividers.get(message.id)!.label} /> : null}<ConversationMessage id={`turn-${message.id}`} speaker={message.role === "user" ? "You" : "Partner"} user={message.role === "user"} note={message.status !== "final" ? <p className={styles.messageStatus}>{message.status === "interrupted" ? "Interrupted · generated text may include words not played" : "Transcript not confirmed"}</p> : null}>
                <VisibleMessage message={message} active={connected} onShown={messageShown}><HighlightedMessage message={message} evidence={workspace.evidence} demonstrations={support?.level === "no_hint" && workspace.session.mission_plan?.version !== 2 ? [] : workspace.demonstrations} onSelect={chooseEvidence} /></VisibleMessage>
                {message.role === "user" ? recasts.filter(row => row.source.message_id === message.id).map(row => <ConfirmedRecast key={row.id} recast={row} active={connected && !confirmAction} onShown={recastShown} />) : null}
              </ConversationMessage></Fragment>)}
              {visiblePartials.map(([id, partial]) => <ConversationMessage key={id} speaker={partial.role === "user" ? "You" : "Partner"} user={partial.role === "user"} note={<span className={styles.messageStatus}>Live · not finalized</span>}><div className={styles.bubble}>{partial.text}</div></ConversationMessage>)}
              {state.pending ? <ConversationMessage speaker="You" user note={<><span className={styles.messageStatus}>{state.pending.status === "sending" ? "Awaiting confirmation…" : "Not yet confirmed"}</span>{state.pending.status === "unconfirmed" ? <Button variant="secondary" size="md" onClick={() => void controller?.retryText()} disabled={connecting || state.conflict}>Retry same message</Button> : null}</>}><div className={styles.bubble}>{state.pending.text}</div></ConversationMessage> : null}<div ref={bottom} />
            </div>}

          {view === "chat" ? hint : null}
          {!ended ? <div className={styles.composerArea}>
            {view === "chat" ? <MicrophoneBar action={connected ? <button type="button" className={styles.chatPause} aria-label="Pause conversation" disabled={state.busy} onClick={() => controller?.pause()}><Pause size={16} aria-hidden="true" /><span>Pause conversation</span></button> : startAction} enabled={state.microphone} disabled={micDisabled} onClick={toggleMicrophone} status={status} active={connected && (state.userSpeaking || state.phase === "speaking")} /> : null}
            <form className={styles.composer} onSubmit={event => { event.preventDefault(); void submit(); }}><Textarea shape="pill" aria-label="Message your AI partner" placeholder={view === "voice" ? "Or send a message…" : "Type a reply…"} value={text} rows={1} maxLength={4000} disabled={state.busy} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void submit(); } }} /><button type="submit" className={styles.sendButton} aria-label="Send message" disabled={!text.trim() || !!state.pending || connecting || state.busy || state.conflict}><ArrowUp size={18} /></button></form>
            <div className={styles.composerHelp}><span>{text.length ? `${text.length}/4000 · Shift+Enter for a new line` : "Transcript is saved. Audio is not retained by Libitu."}</span><button type="button" disabled={!connected || allTargetsSkipped || (newHelp && (!workspace?.conversation?.question || !["presenting", "awaiting_reply", "responding"].includes(workspace.conversation.question.status) || helpCard?.status === "loading" || !!state.replyReference || state.userSpeaking || !!text.trim() || state.phase !== "listening"))} aria-busy={newHelp && helpCard?.status === "loading"} onClick={() => requestHint()}>{newHelp && state.helpLoadingVisible ? <LoaderCircle className={styles.helpSpinner} size={14} aria-hidden="true" /> : null}{newHelp ? helpLabel : "Need a hint?"}</button></div>
          </div> : <div className={styles.review}><Check size={16} aria-hidden="true" /><p>Mission complete.</p><ButtonLink variant="primary" size="md" className={styles.primary} href={missionHref("analytics", returnTo, sessionId)}>View mission report</ButtonLink><Button variant="danger" size="md" className={styles.deleteButton} onClick={() => setConfirmAction("delete")}><Trash2 size={13} aria-hidden="true" />Delete mission</Button></div>}
        </section>
        <aside id="mission-targets" className={`${styles.sidebar} ${trainingOpen ? styles.sidebarOpen : ""}`} aria-label="Training sidebar"><TrainingSidebar workspace={workspace} onSelect={chooseEvidence} onHint={requestHint} onSkip={skipTarget} onRestore={restoreTarget} onTargetShown={targetShown} canHint={connected} hintDisabledReason={targetHintDisabledReason} />{evidence ? <section id="language-evidence" className={styles.evidenceDetail} aria-label="Language evidence"><button type="button" className={styles.iconButton} aria-label="Close evidence" onClick={() => setSelectedEvidence(null)}><X size={14} /></button><strong>“{evidence.quote}”</strong><p>{evidence.reason}</p><span>{evidence.match_type} match · {evidence.appropriateness === "appropriate" ? "Appropriate in this context" : evidence.appropriateness === "uncertain" ? "Context not confirmed" : "Context needs attention"} · {assistanceLabel(evidence)}</span></section> : null}</aside>
      </div>
    </>}
  </section></main></>;
}
