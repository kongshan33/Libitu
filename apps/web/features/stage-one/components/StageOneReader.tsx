"use client";

import { currentAuthReturnUrl } from "@/features/navigation/return-location";

import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

import { DirectionButton } from "@/components/ui/direction-button";

import { Textarea } from "@/components/ui/field";

import { Button } from "@/components/ui/button";

import { FlowNavigation } from "@/components/FlowNavigation";

import dynamic from "next/dynamic";
import { StageTwoSkeleton } from "../../stage-two/components/StageTwoSkeleton";
import { ReaderSkeleton } from "./ReaderSkeleton";
import { useReaderReveal } from "./use-reader-reveal";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";

import { ArrowLeft, ArrowRight, Check, Pin, PinOff, Plus, Trash2, X } from "lucide-react";
import type {
  CorpusFilter,
  CorpusItem,
  CorpusItemAnalysisDetail,
  CorpusKind,
  CorpusSelectionAnalysis,
  CorpusSelectionContext,
  FunctionalTag,
  StageOneBlueprint,
  StageOneSegment
} from "@libitu/types/stage-one";
import type { LearnerLevel } from "@libitu/types/stage-one";
import { useContentWorkspace } from "../../learning-workspace/ContentWorkspaceProvider";
import { WorkspacePlayer } from "../../learning-workspace/MediaHost";
import {
  analyzeCorpusSelection,
  annotateTranscriptLine,
  type StageOneAnalysisPreview
} from "../api/stage-one-api";
import { type YouTubePlayerHandle } from "./YouTubePlayer";
import { CorpusDetailViews, CorpusSourceContext } from "../../corpus/CorpusDetailViews";
import detailStyles from "../../corpus/CorpusDetail.module.css";
import { expressionText } from "../../loadout/draft";
import { useSavedCorpus } from "../../corpus/useSavedCorpus";
import { savedCorpusKey, type SavedCorpusRecord } from "../../corpus/corpus-storage";
import { findCurrentTimedItem, parseTimestamp, formatTranscriptTimestamp } from "../timeline";
import { CaptionTimedText } from "../../playback/CaptionTimedText";
import { CaptionWordClock } from "../../playback/caption-word-clock";
import { CaptionTimingRecoveryNotice } from "../../playback/CaptionTimingRecoveryNotice";
import { buildSentenceUnits } from "../../stage-two/sentences";
import { BufferedReferencePanel } from "../../stage-two/components/BufferedReferencePanel";
import { LoadoutLink } from "../../navigation/LoadoutLink";

const loadShadow = () => import("../../stage-two/components/StageTwoShadowing");
const StageTwoShadowing = dynamic(() => import("../../stage-two/components/StageTwoShadowing").then((module) => module.StageTwoShadowing),
  { loading: () => <StageTwoSkeleton label="Opening practice…" /> });

const tagClass: Record<CorpusItem["tags"][number], string> = {
  acknowledging: "tag-teal",
  clarifying: "tag-teal",
  conceding: "tag-purple",
  contrast: "tag-purple",
  discourse: "tag-purple",
  emphasising: "tag-amber",
  framing: "tag-amber",
  hedging: "tag-amber",
  idiom: "tag-teal",
  justifying: "tag-amber",
  proposing: "tag-teal",
  reframing: "tag-teal",
  redirecting: "tag-purple",
  softening: "tag-gray",
  summarising: "tag-teal",
  summarizing: "tag-teal",
  transitioning: "tag-purple"
};

const editableKinds: CorpusKind[] = ["chunk", "idiom", "structure"];
const editableTags: FunctionalTag[] = ["discourse", "softening", "hedging", "clarifying", "contrast", "justifying", "reframing", "proposing"];
const editableLevels: LearnerLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const editableRegisters: NonNullable<CorpusItem["register"]>[] = ["casual", "neutral", "professional", "formal"];
const TRANSCRIPT_AUTO_ALIGN_PAUSE_MS = 6000;
const PROGRAMMATIC_SCROLL_SETTLE_MS = 450;

type SelectionCardState = {
  id: string;
  pinned: boolean;
  analysis: CorpusSelectionAnalysis;
  fieldDraft: CorpusSelectionAnalysis["fields"];
  note: string;
  tab: "explain" | "syntax";
  status: "loading" | "ready";
  position: { x: number; y: number };
  context: CorpusSelectionContext;
};

type CorpusDetailState = {
  id: string;
  key: string;
  item: CorpusItem;
  record?: SavedCorpusRecord;
  context: CorpusSelectionContext;
  detail?: CorpusItemAnalysisDetail;
  status: "loading" | "ready" | "error";
  tab: "explain" | "syntax";
  error?: string;
};

export function StageOneReader() {
  const { isLoaded: authLoaded, userId } = useAuth();
  const clerk = useClerk();
  const { blueprint, analysisPreview, status, errorMessage, source, retryLoad,
    stageOneView, navigate, prefetch, isNavigating, selectedSegmentId, setSelectedSegmentId,
    isPlayerPlaying, handlePlaybackChange, timingRecovery, bufferedReference,
    sharedReferenceCache, captureGeneration, suspendReference } = useContentWorkspace();
  const sourceTitle = source?.title || (stageOneView === "shadow" ? "Practice" : "Video");
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeTranscriptIdentity, setActiveTranscriptIdentity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CorpusFilter>("chunks");
  const corpus = useSavedCorpus();
  const [corpusTarget, setCorpusTarget] = useState<{ key: string } | null>(null);
  const [selectionCard, setSelectionCard] = useState<SelectionCardState | null>(null);
  const [corpusDetail, setCorpusDetail] = useState<CorpusDetailState | null>(null);
  const closeSelectionCard = useCallback(() => setSelectionCard(null), []);
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoScrollPausedUntil, setAutoScrollPausedUntil] = useState<number | null>(null);
  const [highlightActive, setHighlightActive] = useState(true);
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [wordClock] = useState(() => new CaptionWordClock());
  const programmaticScrollTimeoutRef = useRef<number | null>(null);
  const resumeAutoScrollTimeoutRef = useRef<number | null>(null);
  const ownerGeneration = useRef(0);
  const detailCacheRef = useRef(new Map<string, CorpusItemAnalysisDetail>());
  const sourceKey = blueprint?.contentId ?? source?.contentId ?? source?.sourceUrl ?? "";
  const sourceUrl = blueprint?.sourceUrl ?? source?.sourceUrl;
  useEffect(() => { setActiveNode(current => blueprint?.logicNodes.some(node => node.id === current)
    ? current : blueprint?.logicNodes[0]?.id ?? null); }, [blueprint?.logicNodes]);
  useLayoutEffect(() => {
    ownerGeneration.current++;
    setSelectionCard(null); setCorpusDetail(null); detailCacheRef.current.clear();
  }, [userId]);
  const savedRecords = useMemo(() => corpus.records.filter((record) => (record.contentId ?? record.sourceUrl) === sourceKey
    || Boolean(sourceUrl && record.sourceUrl === sourceUrl)), [corpus.records, sourceKey, sourceUrl]);
  const corpusKey = (item: CorpusItem) => savedRecords.find((record) =>
    record.key === savedCorpusKey(record.contentId ?? record.sourceUrl, item)
    || savedCorpusKey("", record.item) === savedCorpusKey("", item))?.key ?? savedCorpusKey(sourceKey, item);
  const allCorpus = useMemo(() => {
    const candidates = blueprint?.corpusItems ?? analysisPreview?.corpusItems ?? [];
    const keyFor = (item: CorpusItem) => savedRecords.find((record) =>
      savedCorpusKey("", record.item) === savedCorpusKey("", item))?.key ?? savedCorpusKey(sourceKey, item);
    const records = new Map(savedRecords.map((record) => [record.key, record]));
    return [...new Map([
      ...candidates.map((item) => [keyFor(item), item] as const),
      ...savedRecords.map((record) => [record.key, record.item] as const)
    ]).entries()].map(([key, item]) => ({ key, item, record: records.get(key) }));
  }, [blueprint?.corpusItems, analysisPreview?.corpusItems, savedRecords, sourceKey]);
  const selectCorpusHighlight = useCallback((key: string) => {
    const entry = allCorpus.find((entry) => entry.key === key);
    if (!entry) return;
    setActiveTab((tab) => tab === "saved" && entry.record ? "saved"
      : ({ chunk: "chunks", idiom: "idioms", structure: "structures" } as const)[entry.item.kind]);
    setCorpusTarget({ key });
  }, [allCorpus]);
  useEffect(() => {
    if (!corpusTarget) return;
    const card = document.getElementById(`corpus-card-${encodeURIComponent(corpusTarget.key)}`);
    card?.scrollIntoView({ block: "nearest", inline: "nearest" });
    card?.querySelector<HTMLButtonElement>(".corpus-detail-trigger")?.focus({ preventScroll: true });
  }, [corpusTarget]);
  const visibleCorpus = activeTab === "saved" ? savedRecords.map((record) => ({ key: record.key, item: record.item, record }))
    : allCorpus.filter(({ item }) => item.kind === ({ chunks: "chunk", idioms: "idiom", structures: "structure" } as const)[activeTab]);

  const transcript = useMemo(
    () => {
      const lines = blueprint?.transcript ?? analysisPreview?.transcriptLines ?? [];
      const items = allCorpus.map(({ key, item }) => ({ ...item, id: key }));
      return lines.map((line) => annotateTranscriptLine(line, items));
    },
    [analysisPreview?.transcriptLines, blueprint?.transcript, allCorpus]
  );
  const logicNodes = useMemo(
    () => blueprint?.logicNodes ?? analysisPreview?.logicNodes ?? [],
    [analysisPreview?.logicNodes, blueprint?.logicNodes]
  );
  const transcriptTimeline = useMemo(
    () => transcript.map((line, index) => ({
      item: { identity: transcriptIdentity(line, index) },
      seconds: transcriptStartSeconds(line)
    })),
    [transcript]
  );
  const logicTimeline = useMemo(
    () => logicNodes.map((node) => ({ item: node, seconds: parseTimestamp(node.time) })),
    [logicNodes]
  );

  const syncActiveMoment = useCallback((seconds: number) => {
    const currentLine = findCurrentTimedItem(transcriptTimeline, seconds);
    if (currentLine) setActiveTranscriptIdentity((current) => current === currentLine.identity ? current : currentLine.identity);
    const currentNode = findCurrentTimedItem(logicTimeline, seconds, true);
    if (currentNode) setActiveNode((current) => current === currentNode.id ? current : currentNode.id);
  }, [logicTimeline, transcriptTimeline]);

  const handlePlayerTimeChange = useCallback((seconds: number) => {
    syncActiveMoment(seconds);
  }, [syncActiveMoment]);

  const autoScrollPaused = autoScrollPausedUntil !== null && Date.now() < autoScrollPausedUntil;
  const manualAutoAlignPaused = isPlayerPlaying && autoScrollPaused;
  const shouldAutoAlignTranscript = autoScroll && !autoScrollPaused && isPlayerPlaying;

  const markProgrammaticScroll = useCallback(() => {
    if (programmaticScrollTimeoutRef.current !== null) window.clearTimeout(programmaticScrollTimeoutRef.current);
    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      programmaticScrollTimeoutRef.current = null;
    }, PROGRAMMATIC_SCROLL_SETTLE_MS);
  }, []);

  const pauseAutoAlignForManualScroll = useCallback(() => {
    if (!autoScroll) return;
    const pausedUntil = Date.now() + TRANSCRIPT_AUTO_ALIGN_PAUSE_MS;
    setAutoScrollPausedUntil(pausedUntil);
    if (resumeAutoScrollTimeoutRef.current !== null) window.clearTimeout(resumeAutoScrollTimeoutRef.current);
    resumeAutoScrollTimeoutRef.current = window.setTimeout(() => {
      setAutoScrollPausedUntil((current) => current === pausedUntil ? null : current);
      resumeAutoScrollTimeoutRef.current = null;
    }, TRANSCRIPT_AUTO_ALIGN_PAUSE_MS);
  }, [autoScroll]);

  const resumeAutoAlignNow = useCallback(() => {
    if (resumeAutoScrollTimeoutRef.current !== null) {
      window.clearTimeout(resumeAutoScrollTimeoutRef.current);
      resumeAutoScrollTimeoutRef.current = null;
    }
    setAutoScrollPausedUntil(null);
  }, []);

  useEffect(() => {
    return () => {
      if (programmaticScrollTimeoutRef.current !== null) window.clearTimeout(programmaticScrollTimeoutRef.current);
      if (resumeAutoScrollTimeoutRef.current !== null) window.clearTimeout(resumeAutoScrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!shouldAutoAlignTranscript || !activeTranscriptIdentity) return;
    const activeLine = document.getElementById(transcriptElementId(activeTranscriptIdentity));
    if (!activeLine) return;
    markProgrammaticScroll();
    activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeTranscriptIdentity, markProgrammaticScroll, shouldAutoAlignTranscript]);

  function handleTranscriptViewportScroll() {
    if (programmaticScrollTimeoutRef.current !== null) return;
    pauseAutoAlignForManualScroll();
  }

  function toggleAutoScroll() {
    resumeAutoAlignNow();
    setAutoScroll((value) => !value);
  }

  function selectNode(nodeId: string, time: string | null) {
    resumeAutoAlignNow();
    seekToMoment(time, transcript.find((line) => line.id === nodeId)?.time);
    setActiveNode(nodeId);
  }

  function selectTranscriptLine(line: StageOneBlueprint["transcript"][number], index: number) {
    resumeAutoAlignNow();
    const seconds = transcriptStartSeconds(line);
    if (seconds === null) return;
    playerRef.current?.seekTo(seconds, { autoplay: true });
    syncActiveMoment(seconds);
    setActiveTranscriptIdentity(transcriptIdentity(line, index));
  }

  function seekToMoment(primaryTime: string | null, fallbackTime?: string) {
    const time = primaryTime ?? fallbackTime ?? null;
    const seconds = parseTimestamp(time);
    if (seconds === null) return;
    playerRef.current?.seekTo(seconds, { autoplay: true });
    syncActiveMoment(seconds);
  }

  function saveCorpusItem(item: CorpusItem) {
    const key = corpusKey(item);
    const analysisDetail = item.analysisDetail ?? detailCacheRef.current.get(key);
    return corpus.save({
      key,
      item: analysisDetail ? { ...item, analysisDetail } : item,
      contentId: blueprint?.contentId ?? source?.contentId,
      sourceUrl: blueprint?.sourceUrl ?? source?.sourceUrl ?? "",
      sourceTitle: blueprint?.title ?? sourceTitle
    });
  }

  async function handleTranscriptSelection(event: MouseEvent<HTMLElement>) {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (!selection || !selectedText || selectedText.length < 2 || /^[\W_]+$/.test(selectedText)) return;

    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const target = event.currentTarget;
    if (!range || !target.contains(range.commonAncestorContainer)) return;

    const lineElement = nearestTranscriptLine(range.commonAncestorContainer) ?? nearestTranscriptLine(selection.anchorNode);
    if (!lineElement) return;

    const lineIndex = Number(lineElement.dataset.index ?? "0");
    const currentLine = transcript[lineIndex];
    if (!currentLine) return;

    const context: CorpusSelectionContext = {
      contentId: blueprint?.contentId ?? source?.contentId,
      selectedText,
      currentSentence: transcriptLineText(currentLine),
      contextBefore: transcript[lineIndex - 1] ? transcriptLineText(transcript[lineIndex - 1]) : undefined,
      contextAfter: transcript[lineIndex + 1] ? transcriptLineText(transcript[lineIndex + 1]) : undefined,
      timestamp: currentLine.time
    };
    const rect = range.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 12
    };

    const loadingAnalysis = buildLoadingSelectionAnalysis(context);
    const selectionId = crypto.randomUUID();
    setSelectionCard({
      id: selectionId,
      pinned: false,
      analysis: loadingAnalysis,
      fieldDraft: loadingAnalysis.fields,
      note: "",
      tab: "explain",
      status: "loading",
      position,
      context
    });

    const analysis = await analyzeCorpusSelection(context);
    setSelectionCard((current) => current?.id === selectionId
      ? {
        ...current,
        analysis,
        fieldDraft: analysis.fields,
        status: "ready"
      }
      : current
    );
  }

  function updateSelectionField<K extends keyof CorpusSelectionAnalysis["fields"]>(field: K, value: CorpusSelectionAnalysis["fields"][K]) {
    setSelectionCard((current) => current
      ? { ...current, fieldDraft: { ...current.fieldDraft, [field]: value } }
      : current
    );
  }

  async function saveSelectionItem(kindOverride?: CorpusKind, textOverride?: string, slots?: Record<string, string>) {
    if (!selectionCard || !corpus.ready || corpus.busy) return;
    const kind = kindOverride ?? selectionCard.fieldDraft.kind;
    const text = textOverride ?? selectionCard.analysis.recommendedText;
    const id = `manual-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const savedAnalysis = {
      ...selectionCard.analysis,
      fields: { ...selectionCard.fieldDraft, kind }
    };
    const item: CorpusItem = {
      id,
      kind,
      text,
      tags: selectionCard.fieldDraft.tags,
      meta: `${selectionCard.context.timestamp ?? "--:--"} - ${selectionCard.fieldDraft.level}`,
      saved: true,
      meaning: selectionCard.analysis.explanation.meaning,
      usageNote: selectionCard.note,
      sourceText: selectionCard.context.selectedText,
      level: selectionCard.fieldDraft.level,
      register: selectionCard.fieldDraft.register,
      scenarioTags: selectionCard.analysis.explanation.usageChips,
      patternFamily: slots ? Object.keys(slots).join(", ") : undefined,
      slots,
      analysisDetail: {
        context: selectionCard.context,
        analysis: savedAnalysis
      }
    };
    if (!await saveCorpusItem(item)) return;
    setSelectionCard((current) => current?.id === selectionCard.id ? null : current);
    setActiveTab("saved");
  }

  async function openCorpusDetail(key: string, item: CorpusItem, record?: SavedCorpusRecord) {
    const generation = ownerGeneration.current;
    const context = buildCorpusSelectionContext(
      item,
      transcript,
      blueprint?.contentId ?? source?.contentId
    );
    const cached = item.analysisDetail ?? detailCacheRef.current.get(key);
    const detailId = crypto.randomUUID();
    setCorpusDetail({
      id: detailId,
      key,
      item,
      record,
      context: cached?.context ?? context,
      detail: cached,
      status: cached ? "ready" : "loading",
      tab: "explain"
    });
    if (cached) return;

    const analyze = () => analyzeCorpusSelection(context);
    let enrichedItem: CorpusItem;
    let enrichedRecord = record;
    if (record) {
      const saved = await corpus.hydrate(record, context, analyze);
      if (!saved?.item.analysisDetail) {
        setCorpusDetail((current) => current?.id === detailId
          ? { ...current, status: "error", error: "The full analysis could not be loaded. Please retry." }
          : current
        );
        return;
      }
      enrichedRecord = saved;
      enrichedItem = saved.item;
    } else {
      enrichedItem = { ...item, analysisDetail: { context, analysis: await analyze() } };
    }
    if (generation !== ownerGeneration.current) return;
    const detail = enrichedItem.analysisDetail;
    if (!detail) {
      setCorpusDetail((current) => current?.id === detailId
        ? { ...current, status: "error", error: "The full analysis could not be loaded. Please retry." }
        : current
      );
      return;
    }
    detailCacheRef.current.set(key, detail);
    setCorpusDetail((current) => current?.id === detailId
      ? { ...current, item: enrichedItem, record: enrichedRecord, detail, context: detail.context, status: "ready" }
      : current
    );
  }

  async function persistDetail(analysis: CorpusSelectionAnalysis, note?: string): Promise<boolean> {
    if (!corpusDetail) return false;
    const detail = { context: corpusDetail.context, analysis };
    detailCacheRef.current.set(corpusDetail.key, detail);
    const record = corpus.records.find(value => value.key === corpusDetail.key) ?? corpusDetail.record;
    const item = record?.item ?? corpusDetail.item;
    const usageNote = note ? [item.usageNote, note].filter(Boolean).join("\n\n") : item.usageNote ?? "";
    if (usageNote.length > 4000) return false;
    let ok = true;
    if (record) {
      ok = await corpus.update(record, { text: expressionText(record), meaning: item.meaning ?? "", usageNote,
        tags: item.tags, slots: item.slots ?? {}, analysisDetail: detail });
    } else if (note) {
      ok = await saveCorpusItem({ ...item, usageNote, analysisDetail: detail });
    }
    setCorpusDetail(current => current?.id === corpusDetail.id ? { ...current, detail, item: { ...current.item, analysisDetail: detail, usageNote } } : current);
    return ok;
  }

  function retryCorpusDetail() {
    if (!corpusDetail) return;
    detailCacheRef.current.delete(corpusDetail.key);
    void openCorpusDetail(corpusDetail.key, corpusDetail.item, corpusDetail.record);
  }

  const isReady = status === "ready" && blueprint !== null;
  const playableSegments = useMemo(
    () => (blueprint?.segments ?? []).filter(isPlayableSegment),
    [blueprint?.segments]
  );
  const displaySourceUrl = blueprint?.sourceUrl ?? source?.sourceUrl;
  const displayTitle = blueprint?.title ?? sourceTitle;
  const displaySummary = blueprint?.summary ?? analysisPreview?.summary;
  const revealRevision = useMemo(() => ({ analysisPreview, blueprint, activeTab, savedRecords, stageOneView }),
    [analysisPreview, blueprint, activeTab, savedRecords, stageOneView]);
  const readerRevealRef = useReaderReveal(sourceKey, revealRevision);
  const selectedSegment = playableSegments.find((segment) => segment.id === selectedSegmentId) ?? null;

  const warmShadow = useCallback(() => {
    // Load code only; recorder/audio effects still start when Shadow mounts.
    void loadShadow().catch(() => { /* The normal entry retains its loading/error boundary. */ });
    if (!selectedSegment || !blueprint) return;
    const first = buildSentenceUnits(blueprint.contentId, selectedSegment, blueprint.transcript)[0];
    prefetch("shadow", selectedSegment.id, first?.id);
  }, [selectedSegment, blueprint, prefetch]);
  useEffect(() => {
    if (stageOneView === "picker") warmShadow();
  }, [stageOneView, warmShadow]);

  const openSegmentPicker = useCallback(() => {
    if (playableSegments.length === 0) return;
    suspendReference();
    playerRef.current?.pause();
    navigate("picker");
  }, [playableSegments.length, suspendReference, navigate]);

  const closeSegmentPicker = useCallback(() => {
    suspendReference();
    if (stageOneView !== "reader") handlePlaybackChange(false);
    navigate("reader", undefined, undefined, true);
  }, [handlePlaybackChange, stageOneView, suspendReference, navigate]);

  const launchStageTwo = useCallback((segment: StageOneSegment) => {
    suspendReference();
    const firstSentence = blueprint ? buildSentenceUnits(blueprint.contentId, segment, blueprint.transcript)[0] : null;
    const target = navigate("shadow", segment.id, firstSentence?.id);
    if (!userId && authLoaded) {
      const returnUrl = window.location.origin + target;
      clerk.openSignIn({ forceRedirectUrl: returnUrl, signUpForceRedirectUrl: returnUrl });
    }
  }, [suspendReference, blueprint, userId, authLoaded, clerk, navigate]);

  return (
    <>
    <main className="stage-page practice-redesign">
      <section ref={readerRevealRef} className="reader-shell" aria-label="Libitu stage 1 ingest reader" aria-busy={isNavigating}>
        <FlowNavigation title={blueprint?.title ?? sourceTitle} current={stageOneView === "reader" ? 0 : 1}
          steps={[{ label: "Ingest", onClick: closeSegmentPicker }, { label: "Shadow", onClick: isReady ? () => navigate("picker") : undefined }]}
          exit={<button type="button" onClick={() => navigate("picker")}>Back to segments</button>} />

        {stageOneView !== "reader" && status !== "failed" && status !== "unsupported"
          && (status === "loading" || (stageOneView !== "picker" && !selectedSegment) || (stageOneView === "shadow" && !authLoaded)) ? (
          <StageTwoSkeleton view={stageOneView === "picker" ? "segments" : "shadow"} />
        ) : stageOneView === "picker" && status !== "failed" && status !== "unsupported" ? (
          <StageOneSegmentPicker
            segments={playableSegments}
            logicNodes={logicNodes}
            selectedSegmentId={selectedSegmentId}
            title={displayTitle}
            onBack={closeSegmentPicker}
            onSelect={setSelectedSegmentId}
            onBegin={launchStageTwo}
            onPrefetch={warmShadow}
            isNavigating={isNavigating}
          />
        ) : stageOneView === "shadow" && selectedSegment && (!authLoaded || !userId) ? (
          <section className="shadow-sign-in" aria-label="Sign in to Shadow">
            <h1>Sign in to start Shadow</h1>
            <p>Save your practice history to your account. You choose whether to keep recordings for later playback.</p>
            <p>{selectedSegment.title} · Your selected sentence will be kept.</p>
            <Button variant="secondary" size="md" type="button" disabled={!authLoaded} onClick={() => {
              const returnUrl = currentAuthReturnUrl();
              clerk.openSignIn({ forceRedirectUrl: returnUrl, signUpForceRedirectUrl: returnUrl });
            }}>{authLoaded ? "Sign in or create account" : "Checking sign-in…"}</Button>
            <Button variant="secondary" size="md" type="button" onClick={closeSegmentPicker}>Back to Stage 1</Button>
          </section>
        ) : stageOneView === "shadow" && selectedSegment && authLoaded && userId ? (
          <StageTwoShadowing
            key={JSON.stringify([userId, blueprint!.contentId, selectedSegment.id, displaySourceUrl])}
            contentId={blueprint!.contentId}
            segment={selectedSegment}
            sourceUrl={displaySourceUrl}
            title={displayTitle}
            transcript={transcript}
            timingRecovery={<CaptionTimingRecoveryNotice state={timingRecovery.state} inPractice onRetry={timingRecovery.retry} />}
            sharedReferenceCache={sharedReferenceCache}
            captureGeneration={captureGeneration.current}
            onBack={() => {
              suspendReference();
              navigate("picker", undefined, undefined, true);
            }}
          />
        ) : (
          <>
        <aside className="left-panel" aria-label="Logic flow" aria-busy={!isReady}>
          <section className="logic-flow">
            <div className="section-label">Logic flow</div>
            {status === "loading" && logicNodes.length === 0 ? <ReaderSkeleton /> : null}
            {logicNodes.map((node) => (
              <div className="logic-step" key={node.id} data-reader-reveal={`logic:${node.id}`}>
                <button
                  className={`logic-node ${activeNode === node.id ? "active" : ""}`}
                  type="button"
                  onClick={() => selectNode(node.id, node.time)}
                >
                  <span className="logic-dot" aria-hidden="true" />
                  <span className="logic-copy">
                    <span className="logic-title">{node.title}</span>
                    <span className="logic-subtitle">{node.subtitle}</span>
                  </span>
                  <span className="logic-time">{node.time}</span>
                </button>
                {/* {index < logicNodes.length - 1 ? <span className="logic-connector" aria-hidden="true" /> : null} */}
              </div>
            ))}
          </section>

        </aside>

        <section
          className="center-panel"
          aria-label="Video and transcript"
          onScroll={handleTranscriptViewportScroll}
        >
          <div className="video-summary" aria-live="polite">
            <h1>{displayTitle}</h1>
            <p className={displaySummary ? undefined : "summary-pending"} data-reader-reveal={displaySummary ? "summary:content" : undefined}>
              {displaySummary ?? "Preparing the video summary..."}
            </p>
          </div>
          <div className="video-frame">
            {displaySourceUrl ? (
              <WorkspacePlayer
                wordClock={wordClock}
                ref={playerRef}
                sourceUrl={displaySourceUrl}
                title={displayTitle}
                onPlaybackChange={handlePlaybackChange}
                onTimeChange={handlePlayerTimeChange}
                onTelemetry={(sample) => bufferedReference.sample(
                  sample.blockedByPausedSeek ? { ...sample, state: 2 } : sample, captureGeneration.current)}
              />
            ) : source ? (
              <p className="empty-state">The source video URL is unavailable.</p>
            ) : <div className="reader-skeleton-video" aria-hidden="true" />}
          </div>
          {displaySourceUrl && blueprint?.contentId ? <BufferedReferencePanel capture={bufferedReference} playable compact quiet /> : null}

          {!isReady ? (
            <StageOneStatusPanel
              status={status === "ready" ? "loading" : status}
              message={errorMessage}
              onRetry={retryLoad}
              preview={analysisPreview}
            />
          ) : null}

          {status === "loading" && transcript.length === 0 ? <ReaderSkeleton rows={4} /> : null}
          {transcript.length > 0 ? (
            <>
              <div className="video-controls">
                <button
                  className={`toggle-control ${autoScroll ? "on" : ""}`}
                  type="button"
                  aria-pressed={autoScroll}
                  aria-label={manualAutoAlignPaused ? "Auto-scroll paused after manual scroll" : "Auto-scroll"}
                  title={!isPlayerPlaying
                    ? "Auto-scroll will apply when the video plays"
                    : manualAutoAlignPaused
                      ? "Auto-scroll paused after manual scroll"
                      : "Auto-scroll"}
                  onClick={toggleAutoScroll}
                >
                  <span className="toggle-track"><span /></span>
                  {manualAutoAlignPaused ? "Auto-scroll paused" : "Auto-scroll"}
                </button>
                <button
                  className={`toggle-control ${highlightActive ? "on" : ""}`}
                  type="button"
                  aria-pressed={highlightActive}
                  onClick={() => setHighlightActive((value) => !value)}
                >
                  <span className="toggle-track"><span /></span>
                  Highlight active
                </button>
                {/* <Button variant="secondary" size="md" className="control-button" type="button" disabled={!isReady}>
                  <LibraryIcon />
                  Add to corpus
                </Button> */}
              </div>

              {/* <WordTimingNotice rows={transcript} enabled={highlightActive} pending={status === "loading"} /> */}
              <CaptionTimingRecoveryNotice state={timingRecovery.state} onRetry={timingRecovery.retry} />
              <article
                className="transcript-area"
                aria-label="Annotated transcript"
                aria-busy={!isReady}
                onMouseUp={handleTranscriptSelection}
                onWheel={pauseAutoAlignForManualScroll}
                onTouchMove={pauseAutoAlignForManualScroll}
              >
                {transcript.map((line, lineIndex) => (
                  <div
                    className={`transcript-line ${highlightActive && transcriptIdentity(line, lineIndex) === activeTranscriptIdentity ? "active-line" : ""}`}
                    data-index={lineIndex}
                    data-reader-reveal={`transcript:${transcriptIdentity(line, lineIndex)}`}
                    id={transcriptElementId(transcriptIdentity(line, lineIndex))}
                    key={line.segmentationVersion && line.id ? line.id : `${line.time}-${lineIndex}`}
                    onClick={() => selectTranscriptLine(line, lineIndex)}
                  >
                    <button className="transcript-time" type="button" aria-label={`Play from ${formatTranscriptTimestamp(line.time)}`}>{formatTranscriptTimestamp(line.time)}</button>
                    <CaptionTimedText className="transcript-text" parts={line.parts} clock={wordClock}
                      enabled={highlightActive} onCorpusSelect={selectCorpusHighlight}
                      sourceTokenStart={line.sourceTokenStart} timingSource={line.timingSource} wordTimings={line.wordTimings} />
                  </div>
                ))}
              </article>
              {selectionCard && !corpusDetail ? (
                <SelectionAnalysisCard
                  key={selectionCard.id}
                  state={selectionCard}
                  saveDisabled={!corpus.ready || corpus.busy}
                  onClose={closeSelectionCard}
                  onTogglePin={() => setSelectionCard((current) => current ? { ...current, pinned: !current.pinned } : current)}
                  onFieldChange={updateSelectionField}
                  onNoteChange={(note) => setSelectionCard((current) => current ? { ...current, note } : current)}
                  onSave={saveSelectionItem}
                  onSeek={seekToMoment}
                  onAnalysis={(analysis) => setSelectionCard((current) => current ? { ...current, analysis } : current)}
                />
              ) : null}
            </>
          ) : null}
        </section>

        <aside className="right-panel" aria-label="Extracted corpus" aria-busy={!isReady}>
          <div className="corpus-tabs" role="tablist" aria-label="Corpus filters">
            <button
              className={`corpus-tab ${activeTab === "chunks" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("chunks")}
            >
              Chunks
            </button>
            <button
              className={`corpus-tab ${activeTab === "idioms" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("idioms")}
            >
              Idioms
            </button>
            <button
              className={`corpus-tab ${activeTab === "structures" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("structures")}
            >
              Structures
            </button>
            <button
              className={`corpus-tab ${activeTab === "saved" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("saved")}
            >
              Saved
            </button>
          </div>

          <section className="corpus-section">
            <div className="section-label">{activeTab === "saved" ? "Saved to corpus" : "Extracted this video"}</div>
            {corpus.error ? (
              <div className="corpus-sync-status" role="alert">
                <p>{corpus.error}</p>
                <Button variant="secondary" size="md" type="button" className="inline-command" onClick={corpus.retry} disabled={corpus.busy} loading={corpus.busy} loadingLabel="Syncing…">Retry sync</Button>
              </div>
            ) : corpus.busy ? <ContentSkeleton label="Loading saved corpus…" rows={1} /> : null}
            <div className="corpus-list">
              {status === "loading" && visibleCorpus.length === 0 && activeTab !== "saved" ? <ReaderSkeleton /> : null}
              {visibleCorpus.length === 0 && activeTab === "saved" && corpus.ready ? (
                <p className="empty-state">No saved expressions for this video.</p>
              ) : visibleCorpus.length === 0 && !isReady && status !== "loading" ? (
                <p className="empty-state">No corpus was produced.</p>
              ) : null}
              {visibleCorpus.map(({ key, item, record }) => {
                const saved = Boolean(record);
                const saveLabel = saved ? "Remove from corpus" : "Save to corpus";
                return (
                  <article id={`corpus-card-${encodeURIComponent(key)}`} data-reader-reveal={`corpus:${key}`} className={`corpus-card ${saved ? "saved" : ""} ${corpusTarget?.key === key ? "corpus-target" : ""}`} key={key}>
                    <button
                      className="corpus-detail-trigger"
                      type="button"
                      aria-label={`Open full analysis for ${corpusSelectedText(item)}`}
                      onClick={() => void openCorpusDetail(key, item, record)}
                    >
                      <span className={item.kind === "structure" ? "structure-text" : "corpus-text"}>{item.text}</span>
                      {item.usageNote ? <span className="corpus-note">{item.usageNote}</span> : null}
                      <span className="corpus-tags">
                        {item.tags.map((tag) => (
                          <span className={`tag ${tagClass[tag]}`} key={tag}>
                            {tag}
                          </span>
                        ))}
                      </span>
                      <span className="corpus-meta">{item.meta.replace(/\s*-\s*(click \+ to save|saved locally|saved to corpus|analyzing)$/, "")}{saved ? ` - ${corpus.signedIn ? record?.serverId ? "Saved to account" : "Pending sync" : "Saved on this device"}` : ""}</span>
                    </button>
                    <button
                      className={`save-button ${saved ? "saved" : ""}`}
                      type="button"
                      disabled={(!isReady && !saved) || !corpus.ready || corpus.busy}
                      aria-label={saveLabel}
                      title={saveLabel}
                      aria-pressed={saved}
                      data-feedback={saved && activeTab !== "saved" ? "success" : undefined}
                      onClick={() => record ? void corpus.remove(record) : void saveCorpusItem(item)}
                    >
                      {saved ? activeTab === "saved" ? <Trash2 /> : <Check /> : <Plus />}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="mission-box">
            <div>
              <span>Your saved language</span>
              <strong>{savedRecords.length} items saved from this source</strong>
            </div>
            <LoadoutLink className="mission-button" size="sm" shape="default">Open Loadout</LoadoutLink>
          </div>
        </aside>

        {isReady ? (
          <StageOneStageCta
            segmentCount={playableSegments.length}
            onChooseSegment={openSegmentPicker}
            onPrefetch={() => prefetch("picker")}
            isNavigating={isNavigating}
          />
        ) : null}
          </>
        )}
      </section>
      {corpusDetail ? (
        <CorpusDetailDialog
          key={corpusDetail.id}
          state={corpusDetail}
          busy={corpus.busy}
          onAnalysis={(analysis) => persistDetail(analysis)}
          onSaveNote={(note) => persistDetail(corpusDetail.detail!.analysis, note)}
          onClose={() => setCorpusDetail(null)}
          onRetry={retryCorpusDetail}
          onSeek={seekToMoment}
        />
      ) : null}
    </main>
    </>
  );
}

function isPlayableSegment(segment: StageOneBlueprint["segments"][number]) {
  return typeof segment.startMs === "number"
    && typeof segment.endMs === "number"
    && segment.endMs > segment.startMs;
}

type StageOneStageCtaProps = {
  segmentCount: number;
  onChooseSegment?: () => void;
  onPrefetch?: () => void;
  isNavigating?: boolean;
};

function StageOneStageCta({ segmentCount, onChooseSegment, onPrefetch, isNavigating }: StageOneStageCtaProps) {
  const canChooseSegment = segmentCount > 0;

  return (
    <footer className="stage-one-cta" aria-label="Stage 2 entry point">
      <div className="stage-one-cta-status" role="status" aria-live="polite">
        <span className={`stage-one-cta-dot ${canChooseSegment ? "ready" : "unavailable"}`} aria-hidden="true" />
        {canChooseSegment
          ? `Analysis complete · ${segmentCount} practice segment${segmentCount === 1 ? "" : "s"} ready`
          : "Analysis complete · Practice segments unavailable"}
      </div>
      <span className="stage-one-cta-spacer" aria-hidden="true" />
      <span className="stage-one-cta-hint">
        {canChooseSegment ? "All segments under 5 minutes" : "Playable segment timing is required"}
      </span>
      <DirectionButton variant="primary"
        className="stage-one-cta-button"
        type="button"
        disabled={!canChooseSegment}
        loading={isNavigating}
        loadingLabel="Opening segments…"
        onClick={onChooseSegment}
        onMouseEnter={onPrefetch} onFocus={onPrefetch} onTouchStart={onPrefetch}
      >
        {canChooseSegment ? "Choose a segment to shadow" : "Segments unavailable"}
        <ArrowRight aria-hidden="true" />
      </DirectionButton>
    </footer>
  );
}

const segmentLogicColors = ["#1d9e75", "#ef9f27", "#534ab7", "#3b82f6"];

function StageOneSegmentPicker({
  segments,
  logicNodes,
  selectedSegmentId,
  title,
  onBack,
  onSelect,
  onBegin,
  onPrefetch,
  isNavigating
}: {
  segments: StageOneSegment[];
  logicNodes: StageOneBlueprint["logicNodes"];
  selectedSegmentId: string | null;
  title: string;
  onBack: () => void;
  onSelect: (segmentId: string) => void;
  onBegin?: (segment: StageOneSegment) => void;
  onPrefetch?: () => void;
  isNavigating?: boolean;
}) {
  const totalDurationMs = Math.max(...segments.map((segment) => segment.endMs ?? 0), 0);
  const selectedSegment = segments.find((segment) => segment.id === selectedSegmentId) ?? null;

  return (
    <section className="stage-one-picker" aria-label="Choose a segment to shadow">
      <header className="stage-one-picker-header">
        <div className="stage-one-picker-heading">
          <h1>Choose a segment to shadow</h1>
          <p>AI divided {title} into {segments.length} segments aligned to the logic flow.</p>
        </div>
        <DirectionButton variant="secondary" className="stage-one-picker-back" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Back
        </DirectionButton>
      </header>

      <div className="stage-one-picker-timeline">
        <div className="stage-one-picker-timeline-label">
          <span>Video timeline · {formatSegmentClock(totalDurationMs)} total</span>
          <span>Click a segment to select</span>
        </div>
        <div className="stage-one-picker-timeline-scroll">
          <div
            className="stage-one-picker-timeline-track"
            style={{ minWidth: `${Math.max(segments.length * 112, 560)}px` }}
          >
            <div className="stage-one-picker-timeline-bar" role="group" aria-label="Video segments">
              {segments.map((segment, index) => {
                const selected = segment.id === selectedSegmentId;
                return (
                  <button
                    className={`stage-one-picker-timeline-segment ${selected ? "selected" : ""}`}
                    key={segment.id}
                    type="button"
                    aria-label={`${segment.title}, ${formatSegmentClock(segment.startMs ?? 0)} to ${formatSegmentClock(segment.endMs ?? 0)}`}
                    aria-pressed={selected}
                    style={{
                      flex: Math.max(segmentDurationMs(segment), 1)
                    }}
                    onClick={() => onSelect(segment.id)}
                  >
                    <span className="stage-one-picker-timeline-number">S{segment.sequence ?? index + 1}</span>
                    <span className="stage-one-picker-timeline-title">{segment.title}</span>
                  </button>
                );
              })}
            </div>
            <div className="stage-one-picker-timeline-boundaries" aria-label="Segment boundary times">
              {segments.map((segment, index) => (
                <time
                  className={index === 0 ? "first" : ""}
                  dateTime={`PT${Math.round((segment.startMs ?? 0) / 1000)}S`}
                  key={`${segment.id}-start`}
                  style={{ left: `${totalDurationMs > 0 ? (segment.startMs ?? 0) / totalDurationMs * 100 : 0}%` }}
                >
                  {formatSegmentClock(segment.startMs ?? 0)}
                </time>
              ))}
              <time className="last" dateTime={`PT${Math.round(totalDurationMs / 1000)}S`}>
                {formatSegmentClock(totalDurationMs)}
              </time>
            </div>
          </div>
        </div>
      </div>

      <div className="stage-one-picker-scroll">
        <div className="stage-one-picker-grid">
          {segments.map((segment, index) => (
            <StageOneSegmentCard
              key={segment.id}
              segment={segment}
              logic={segmentLogicFor(segment, logicNodes, index)}
              selected={segment.id === selectedSegmentId}
              onSelect={() => onSelect(segment.id)}
            />
          ))}
        </div>
      </div>

      <footer className="stage-one-picker-footer">
        <div className="stage-one-picker-selection">
          <span>{selectedSegment ? "Selected segment" : "Select a segment above to begin"}</span>
          {selectedSegment ? (
            <strong>{selectedSegment.title} · {formatSegmentDuration(selectedSegment)} · {segmentLogicFor(selectedSegment, logicNodes, 0).node?.title ?? "Logic flow"}</strong>
          ) : null}
        </div>
        <DirectionButton variant="primary"
          className="stage-one-picker-begin"
          type="button"
          disabled={!selectedSegment}
          loading={isNavigating}
          loadingLabel="Opening practice…"
          onMouseEnter={onPrefetch} onFocus={onPrefetch} onTouchStart={onPrefetch}
          onClick={() => selectedSegment && onBegin?.(selectedSegment)}
        >
          Begin Stage 2{selectedSegment ? ` · ${selectedSegment.title}` : ""}
          <ArrowRight aria-hidden="true" />
        </DirectionButton>
      </footer>
    </section>
  );
}

function StageOneSegmentCard({
  segment,
  logic,
  selected,
  onSelect
}: {
  segment: StageOneSegment;
  logic: SegmentLogic;
  selected: boolean;
  onSelect: () => void;
}) {
  const difficulty = segment.difficulty ?? "medium";
  const difficultyDots = difficulty === "easy" ? 1 : difficulty === "dense" ? 3 : 2;
  const duration = segmentDurationMs(segment);
  const quote = segment.quote ?? segment.sourceText ?? segment.summary;

  return (
    <button
      className={`stage-one-segment-card ${selected ? "selected" : ""}`}
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="stage-one-segment-accent" style={{ background: logic.color }} aria-hidden="true" />
      <span className="stage-one-segment-body">
        <span className="stage-one-segment-heading">
          <strong className="stage-one-segment-title">{segment.title}</strong>
          {segment.recommended ? (
            <span className="stage-one-segment-recommended">
              Recommended
            </span>
          ) : null}
        </span>
        <span className="stage-one-segment-time">
          {formatSegmentClock(segment.startMs ?? 0)}–{formatSegmentClock(segment.endMs ?? 0)} · {formatSegmentDuration(segment)} · {segment.wordCount ?? "--"} words
        </span>
        <span className="stage-one-segment-duration-bar" aria-hidden="true">
          <span style={{ width: `${Math.min(duration / (5 * 60_000) * 100, 100)}%` }} />
        </span>
        <span className="stage-one-segment-quote">“{quote}”</span>
        <span className="stage-one-segment-footer">
          <span className="stage-one-segment-phonology">
            {segment.phonologyTags.map((tag) => <span key={tag}>{tag.toUpperCase()}</span>)}
          </span>
          <span className="stage-one-segment-difficulty">
            {[1, 2, 3].map((dot) => <i className={dot <= difficultyDots ? "filled" : ""} key={dot} aria-hidden="true" />)}
            {difficulty}
          </span>
        </span>
      </span>
      <span className="stage-one-segment-check" aria-hidden="true"><Check /></span>
    </button>
  );
}

type SegmentLogic = {
  node?: StageOneBlueprint["logicNodes"][number];
  color: string;
};

function segmentLogicFor(segment: StageOneSegment, logicNodes: StageOneBlueprint["logicNodes"], index: number): SegmentLogic {
  const node = segment.logicNodeId ? logicNodes.find((candidate) => candidate.id === segment.logicNodeId) : undefined;
  const fallbackNode = node ?? logicNodes[Math.min(segment.sequence ? segment.sequence - 1 : index, logicNodes.length - 1)];
  const colorIndex = Math.max(logicNodes.indexOf(fallbackNode), 0) % segmentLogicColors.length;
  return {
    node: fallbackNode,
    color: segmentLogicColors[colorIndex]
  };
}

function segmentDurationMs(segment: StageOneSegment) {
  return Math.max((segment.durationMs ?? ((segment.endMs ?? 0) - (segment.startMs ?? 0))), 0);
}

function formatSegmentClock(milliseconds: number) {
  const totalSeconds = Math.max(Math.round(milliseconds / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatSegmentDuration(segment: StageOneSegment) {
  const totalSeconds = Math.round(segmentDurationMs(segment) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function transcriptIdentity(line: StageOneBlueprint["transcript"][number], index: number) {
  return line.segmentationVersion ? line.id ?? `${line.time}-${index}` : line.time;
}

function transcriptStartSeconds(line: StageOneBlueprint["transcript"][number]): number | null {
  return Number.isFinite(line.startMs) && line.startMs! >= 0 ? line.startMs! / 1000 : parseTimestamp(line.time);
}

function transcriptElementId(identity: string) {
  return `transcript-${identity.replaceAll(":", "-")}`;
}


function nearestTranscriptLine(node: Node | null): HTMLElement | null {
  const element = node instanceof Element ? node : node?.parentElement;
  return element?.closest<HTMLElement>(".transcript-line") ?? null;
}

function transcriptLineText(line: StageOneBlueprint["transcript"][number]) {
  return line.parts.map((part) => typeof part === "string" ? part : part.text).join("").replace(/\s+/g, " ").trim();
}

function corpusSelectedText(item: CorpusItem) {
  if (item.sourceText) return item.sourceText;
  if (item.kind === "structure") return item.text;
  return item.text.match(/^["“'](.+?)["”']\s*[-–—]/)?.[1] ?? item.text;
}

function buildCorpusSelectionContext(
  item: CorpusItem,
  transcript: StageOneBlueprint["transcript"],
  contentId?: string,
): CorpusSelectionContext {
  const selectedText = corpusSelectedText(item);
  const selected = selectedText.toLocaleLowerCase();
  const timestamp = item.meta.match(/^\s*(\d{1,2}:\d{2}(?::\d{2})?)/)?.[1];
  let lineIndex = transcript.findIndex((line) => transcriptLineText(line).toLocaleLowerCase().includes(selected));
  if (lineIndex < 0 && timestamp) lineIndex = transcript.findIndex((line) => line.time === timestamp);
  const line = lineIndex >= 0 ? transcript[lineIndex] : undefined;
  return {
    contentId,
    selectedText,
    currentSentence: line ? transcriptLineText(line) : selectedText,
    contextBefore: lineIndex > 0 ? transcriptLineText(transcript[lineIndex - 1]) : undefined,
    contextAfter: lineIndex >= 0 && transcript[lineIndex + 1] ? transcriptLineText(transcript[lineIndex + 1]) : undefined,
    timestamp: line?.time ?? timestamp
  };
}

function buildLoadingSelectionAnalysis(context: CorpusSelectionContext): CorpusSelectionAnalysis {
  return {
    analysisSource: "ai",
    selectionType: /[.!?]$/.test(context.selectedText) ? "sentence" : "phrase",
    completeness: "complete",
    selectedText: context.selectedText,
    recommendedText: context.selectedText,
    recommendationReason: "Checking whether this is the best corpus unit from context.",
    fields: {
      kind: "chunk",
      tags: ["discourse"],
      level: "B1",
      register: "neutral"
    },
    notePlaceholder: "Add your own cue, translation, or memory hook.",
    explanation: {
      pronunciation: {
        ipa: "/.../",
        connectedSpeech: "Analyzing connected speech from context.",
        audioText: context.selectedText
      },
      meaning: "Analyzing meaning in context.",
      pragmaticFunction: "Analyzing what this expression does in the conversation.",
      similarExpressions: [],
      examples: [],
      usageChips: ["context"]
    },
    syntaxAnalysis: {
      sentenceType: "Analyzing selection type and grammatical role.",
      mainClause: "Finding the main clause and the selection's role in it.",
      structureBreakdown: [],
      logicRelations: [],
      informationHierarchy: [],
      styleFeatures: [],
      usageScenarios: [],
      grammarPoints: [],
      wordingNotes: [],
      reusablePatterns: [],
      translations: [],
      translationNotes: [],
      evidence: [context.contextBefore, context.currentSentence, context.contextAfter].filter((value): value is string => Boolean(value))
    }
  };
}

type CorpusDetailDialogProps = {
  state: CorpusDetailState;
  busy: boolean;
  onClose(): void;
  onRetry(): void;
  onSeek(time: string | null): void;
  onAnalysis(analysis: CorpusSelectionAnalysis): Promise<boolean>;
  onSaveNote(note: string): Promise<boolean>;
};

function CorpusDetailDialog({ state, busy, onClose, onRetry, onSeek, onAnalysis, onSaveNote }: CorpusDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const analysis = state.detail?.analysis;
  useEffect(() => {
    const dialog = dialogRef.current; dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);
  return <dialog ref={dialogRef} className={`corpus-detail-dialog ${detailStyles.dialog}`} aria-labelledby="corpus-detail-title"
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className={detailStyles.shell}>
      <header className={detailStyles.header}><div><span className={detailStyles.eyebrow}>Corpus detail</span>
        <h1 id="corpus-detail-title">{analysis?.recommendedText ?? corpusSelectedText(state.item)}</h1>
        <p className={detailStyles.meta}>{[state.item.kind, analysis?.fields.level ?? state.item.level, analysis?.fields.register ?? state.item.register, ...(analysis?.fields.tags ?? state.item.tags)].filter(Boolean).join(" · ")}</p>
      </div><Button variant="ghost" size="sm" shape="circle" aria-label="Close corpus detail" onClick={onClose}><X size={18} /></Button></header>
      <div className={detailStyles.scroll}>
        <CorpusSourceContext context={state.context} kind={state.item.kind} title={state.record?.sourceTitle} onSeek={onSeek} />
        {state.status === "loading" ? <div className={detailStyles.panel}><ContentSkeleton label="Preparing explanation…" rows={3} /></div>
          : state.status === "error" || !analysis ? <p className={detailStyles.notice} role="alert">{state.error ?? "Analysis could not be loaded."} <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button></p>
          : <>{analysis.providerNotice ? <p className={detailStyles.notice} role="status">{analysis.providerNotice}</p> : null}
            <CorpusDetailViews analysis={analysis} context={state.context} onAnalysis={onAnalysis} onSaveNote={onSaveNote} disabled={busy} />
          </>}
      </div>
    </div>
  </dialog>;
}

type SelectionAnalysisCardProps = {
  state: SelectionCardState;
  saveDisabled: boolean;
  onClose: () => void;
  onTogglePin: () => void;
  onFieldChange: <K extends keyof CorpusSelectionAnalysis["fields"]>(field: K, value: CorpusSelectionAnalysis["fields"][K]) => void;
  onNoteChange: (note: string) => void;
  onSave: (kindOverride?: CorpusKind, textOverride?: string, slots?: Record<string, string>) => void;
  onSeek: (time: string) => void;
  onAnalysis: (analysis: CorpusSelectionAnalysis) => void;
};

function SelectionAnalysisCard({ state, saveDisabled, onClose, onTogglePin, onFieldChange, onNoteChange, onSave, onSeek, onAnalysis }: SelectionAnalysisCardProps) {
  const { analysis, fieldDraft } = state;
  const isLoading = state.status === "loading";
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const card = cardRef.current;
    card?.focus({ preventScroll: true });
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (card?.contains(document.activeElement) && previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [onClose]);

  useEffect(() => {
    if (state.pinned) return;
    function handleOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !cardRef.current?.contains(event.target)) onClose();
    }
    // Pointer events inside the embedded video do not bubble to this document.
    function handleFrameFocus() {
      if (document.activeElement instanceof HTMLIFrameElement) onClose();
    }
    document.addEventListener("pointerdown", handleOutsidePointer, true);
    window.addEventListener("blur", handleFrameFocus);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer, true);
      window.removeEventListener("blur", handleFrameFocus);
    };
  }, [state.pinned, onClose]);

  return createPortal(
    <>
      <div className={detailStyles.selectionBackdrop} aria-hidden="true" />
      <section
        ref={cardRef}
        className={`selection-card ${detailStyles.dialog} ${detailStyles.selection}`}
        style={{ "--selection-x": `${state.position.x}px`, "--selection-y": `${state.position.y}px` } as CSSProperties}
        role="dialog"
        aria-modal="false"
        aria-label="Corpus selection analysis"
        tabIndex={-1}
      >
        <div className={detailStyles.shell}>
          <header className={detailStyles.header}>
            <div>
              <span className={detailStyles.eyebrow}>Add to corpus</span>
              <h2>{analysis.selectedText}</h2>
              {!isLoading ? <p className={detailStyles.meta}>{[fieldDraft.kind, fieldDraft.level, fieldDraft.register, ...fieldDraft.tags].join(" · ")}</p> : null}
            </div>
            <div className={detailStyles.headerActions}>
              <Button
                variant="ghost" size="sm" shape="circle"
                className={detailStyles.pin}
                type="button"
                aria-label={state.pinned ? "Unpin selection card" : "Pin selection card"}
                aria-pressed={state.pinned}
                title={state.pinned ? "Unpin selection card" : "Pin selection card"}
                onClick={onTogglePin}
              >
                {state.pinned ? <PinOff size={16} aria-hidden="true" /> : <Pin size={16} aria-hidden="true" />}
              </Button>
              <Button variant="ghost" size="sm" shape="circle" aria-label="Close selection card" onClick={onClose}><X size={18} aria-hidden="true" /></Button>
            </div>
          </header>

          <div className={detailStyles.scroll}>
            <CorpusSourceContext context={state.context} kind={fieldDraft.kind} onSeek={onSeek} />

            {analysis.completeness === "needs_expansion" ? (
              <section className={detailStyles.recommendation} aria-label="Suggested completion">
                <span className={detailStyles.eyebrow}>Suggested completion</span>
                <p className={detailStyles.summary}>{analysis.recommendedText}</p>
                <p>{analysis.recommendationReason}</p>
              </section>
            ) : null}

            {analysis.providerNotice ? (
              <p className={detailStyles.notice} role="status">{analysis.providerNotice}</p>
            ) : null}

            <div aria-busy={isLoading}>
              {isLoading ? <div className={detailStyles.panel}><ContentSkeleton label="Preparing explanation…" rows={3} /></div> : <CorpusDetailViews analysis={analysis} context={state.context} onAnalysis={onAnalysis}
                onSaveNote={async note => { onNoteChange([state.note, note].filter(Boolean).join("\n\n")); return true; }} noteIsDraft
                onSavePattern={onSave} disabled={saveDisabled} />}
            </div>

            <footer className={detailStyles.management}>
              <div className={detailStyles.fieldControls} aria-label="Editable AI fields">
                <CycleChip label="kind" value={fieldDraft.kind} values={editableKinds} disabled={isLoading} onChange={(value) => onFieldChange("kind", value)} />
                <CycleChip label="tag" value={fieldDraft.tags[0] ?? "discourse"} values={editableTags} disabled={isLoading} onChange={(value) => onFieldChange("tags", [value])} />
                <CycleChip label="level" value={fieldDraft.level} values={editableLevels} disabled={isLoading} onChange={(value) => onFieldChange("level", value)} />
                <CycleChip label="register" value={fieldDraft.register} values={editableRegisters} disabled={isLoading} onChange={(value) => onFieldChange("register", value)} />
              </div>
              <label className={detailStyles.noteField}>My note
                <Textarea
                  className="selection-note"
                  value={state.note}
                  placeholder={analysis.notePlaceholder}
                  onChange={(event) => onNoteChange(event.target.value)}
                />
              </label>

              <div className={`${detailStyles.saveActions} ui-button-group`}>
                <Button variant="primary" size="md" className="selection-save" type="button" disabled={isLoading || saveDisabled} onClick={() => onSave()}>
                  Save
                </Button>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </>, document.body
  );
}

type CycleChipProps<T extends string> = {
  label: string;
  value: T;
  values: readonly T[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

function CycleChip<T extends string>({ label, value, values, onChange, disabled }: CycleChipProps<T>) {
  function cycle() {
    const currentIndex = values.indexOf(value);
    onChange(values[(currentIndex + 1) % values.length]);
  }

  return (
    <button className={detailStyles.fieldControl} type="button" disabled={disabled} onClick={cycle}>
      <span>{label}</span>
      {value}
    </button>
  );
}

type StageOneStatusPanelProps = {
  status: "loading" | "failed" | "unsupported";
  message: string | null;
  onRetry: () => void;
  preview: StageOneAnalysisPreview | null;
};

function StageOneStatusPanel({ status, message, onRetry, preview }: StageOneStatusPanelProps) {
  const isLoading = status === "loading";
  const title = isLoading
    ? "Preparing your listening workspace"
    : status === "unsupported"
      ? "This source is not supported yet"
      : "Blueprint generation failed";

  return (
    <div className="stage-status" role={isLoading ? "status" : "alert"}>
      <div className="status-heading">
        <span className={`status-indicator ${isLoading ? "loading" : "failed"}`} aria-hidden="true">
          {isLoading ? null : "!"}
        </span>
        <div>
          <h2>{title}</h2>
          <p>
            {message ??
              (isLoading
                ? "Your video, subtitles and expressions will appear here as they become available."
                : "The API could not return a usable blueprint.")}
          </p>
        </div>
      </div>
      {isLoading && preview ? (
        <div className="stream-metrics" aria-label="Streaming analysis progress">
          <span><strong>{preview.logicNodes.length}</strong> logic steps</span>
          <span><strong>{preview.corpusItems.length}</strong> expressions</span>
          <span><strong>{preview.transcriptLines.length}</strong> subtitles</span>
        </div>
      ) : null}
      {!isLoading ? (
        <Button variant="secondary" size="md" className="mission-button" type="button" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
