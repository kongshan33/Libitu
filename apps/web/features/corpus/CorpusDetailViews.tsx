"use client";
import { useContentMotion } from "@/components/ui/use-content-motion";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CorpusItem, CorpusSelectionAnalysis, CorpusSelectionContext } from "@libitu/types/stage-one";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { analyzeCorpusSelection, analyzeCorpusSyntax } from "../stage-one/api/stage-one-api";
import { ExplainPanel, SyntaxPanel } from "./AnalysisPanels";
import { CorpusFollowup } from "./CorpusFollowup";
import styles from "./CorpusDetail.module.css";

export function CorpusDetailViews({ analysis, context, onAnalysis, onSaveNote, onSavePattern, disabled = false, noteIsDraft = false }: {
  analysis: CorpusSelectionAnalysis; context: CorpusSelectionContext;
  onAnalysis?(analysis: CorpusSelectionAnalysis): void | Promise<boolean>;
  onSaveNote(note: string): Promise<boolean>;
  onSavePattern?: (kind?: CorpusItem["kind"], text?: string, slots?: Record<string, string>) => void;
  disabled?: boolean; noteIsDraft?: boolean;
}) {
  const id = useId();
  const [tab, setTab] = useState<"explain" | "syntax">("explain");
  const panelRef = useContentMotion(tab);
  const [local, setLocal] = useState<{ input: CorpusSelectionAnalysis; value: CorpusSelectionAnalysis } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [unsaved, setUnsaved] = useState(false);
  const request = useRef<AbortController | null>(null);
  const acceptAnalysis = useRef(onAnalysis);
  useLayoutEffect(() => { acceptAnalysis.current = onAnalysis; }, [onAnalysis]);
  // Ignore a local result as soon as its owning input changes. Keep the view
  // mounted so switching kind does not discard a question or the active tab.
  const current = local?.input === analysis ? local.value : analysis;
  const requestKey = JSON.stringify([context, analysis.recommendedText, analysis.selectionType, analysis.fields.kind]);
  useLayoutEffect(() => {
    setPending(false); setError(""); setRefreshing(false); setRefreshError(""); setUnsaved(false);
    return () => { request.current?.abort(); request.current = null; };
  }, [requestKey]);
  async function refreshExplain() {
    if (request.current || refreshing) return;
    const controller = new AbortController(); request.current = controller;
    setRefreshing(true); setRefreshError("");
    try {
      const result = await analyzeCorpusSelection(context, controller.signal);
      if (controller.signal.aborted) return;
      if (result.analysisSource !== "ai") { setRefreshError("Explanation could not be refreshed. Please retry."); return; }
      setLocal({ input: analysis, value: result }); setTab("explain"); setError("");
      const saved = await acceptAnalysis.current?.(result);
      if (!controller.signal.aborted) setUnsaved(saved === false);
    } catch {
      if (!controller.signal.aborted) setRefreshError("Explanation could not be saved. Please retry.");
    } finally {
      if (!controller.signal.aborted) { request.current = null; setRefreshing(false); }
    }
  }
  const loadSyntax = useCallback(async () => {
    if (refreshing) return;
    setTab("syntax");
    if (request.current || (current.syntaxState === "ready" || (!current.syntaxState && current.analysisSource === "ai"))) return;
    const controller = new AbortController(); request.current = controller;
    setPending(true); setError("");
    try {
      const result = await analyzeCorpusSyntax(context, current, controller.signal);
      if (controller.signal.aborted) return;
      setLocal({ input: analysis, value: result });
      const saved = await acceptAnalysis.current?.(result);
      if (!controller.signal.aborted) setUnsaved(saved === false);
    } catch {
      if (!controller.signal.aborted) setError("Syntax could not be loaded. Please retry.");
    } finally {
      if (!controller.signal.aborted) { request.current = null; setPending(false); }
    }
  }, [analysis, context, current, refreshing]);
  useEffect(() => {
    if (tab === "syntax" && !error) void loadSyntax();
  }, [tab, error, loadSyntax]);
  return <div className={styles.views}>
    <div className={styles.tabs} role="tablist" aria-label="Analysis views" onKeyDown={event => {
      const tabs = ["explain", "syntax"] as const;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? "explain" : event.key === "End" ? "syntax" : tabs[tab === "explain" ? 1 : 0];
      document.getElementById(`${id}-${next}`)?.focus();
      if (next === "syntax") void loadSyntax(); else setTab(next);
    }}>
      {(["explain", "syntax"] as const).map(value => <button key={value} id={`${id}-${value}`} type="button" role="tab" aria-selected={tab === value} tabIndex={tab === value ? 0 : -1} aria-controls={`${id}-panel`} onClick={() => value === "syntax" ? void loadSyntax() : setTab(value)}>{value === "explain" ? "Explain" : "Syntax"}</button>)}
    </div>
    <div ref={panelRef} id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} className={styles.panel}>
      <div hidden={tab !== "explain"}>
        {(current.schemaVersion ?? 1) < 3 || current.analysisSource === "fallback" ? <Button variant="secondary" size="sm" disabled={disabled || pending} loading={refreshing} loadingLabel="Refreshing…" onClick={() => void refreshExplain()}>Refresh explanation</Button> : null}
        {refreshError ? <p role="alert">{refreshError}</p> : null}
        <ExplainPanel analysis={current} isLoading={false} onSavePattern={onSavePattern} saveDisabled={disabled} active={tab === "explain"} />
        <CorpusFollowup context={context} suggestions={current.askSuggestions} comparison={current.explanation.similarExpressions[0]?.split(/\s*[—–]\s*/)[0]} onSaveNote={onSaveNote} disabled={disabled} noteIsDraft={noteIsDraft} />
      </div>
      {tab === "syntax" ? <p className={styles.meta}>Generated when you open this tab.</p> : null}
      {tab === "syntax" ? pending || (current.syntaxState === "pending" && !error) ? <ContentSkeleton label="Loading syntax…" rows={3} /> : error ? <p className="ui-retry-notice" role="alert">{error} <Button variant="secondary" size="sm" onClick={() => void loadSyntax()}>Retry syntax</Button></p> : <>
        <SyntaxPanel analysis={current} isLoading={false} saveDisabled />
      </> : null}
        {unsaved ? <p className="ui-retry-notice" role="status">Analysis is available for this visit, but could not be saved. <Button variant="secondary" size="sm" disabled={disabled} onClick={async () => { setUnsaved(await onAnalysis?.(current) === false); }}>Retry saving analysis</Button></p> : null}
    </div>
  </div>;
}

export function CorpusSourceContext({ context, kind, title, onSeek }: { context: CorpusSelectionContext; kind: CorpusItem["kind"]; title?: string; onSeek?: (time: string) => void }) {
  const index = context.currentSentence.toLowerCase().indexOf(context.selectedText.toLowerCase());
  const timestamp = context.timestamp?.replace(/\.\d+$/, "");
  return <section className={styles.context} aria-label="Original source context">
    <div className={styles.contextHeading}><div><span className={styles.eyebrow}>Original context</span>{title ? <p>{title}</p> : null}</div>
      {timestamp && onSeek ? <Button variant="secondary" size="sm" aria-label={`Play from ${timestamp}`} onClick={() => onSeek(context.timestamp!)}><Play size={14} aria-hidden="true" />{timestamp}</Button> : timestamp ? <span className={styles.meta}>{timestamp}</span> : null}
    </div>
    {context.contextBefore ? <p className={styles.neighbor}>{context.contextBefore}</p> : null}
    <p className={styles.current}>{index < 0 ? context.currentSentence : <>{context.currentSentence.slice(0, index)}<mark data-kind={kind}>{context.currentSentence.slice(index, index + context.selectedText.length)}</mark>{context.currentSentence.slice(index + context.selectedText.length)}</>}</p>
    {context.contextAfter ? <p className={styles.neighbor}>{context.contextAfter}</p> : null}
  </section>;
}
