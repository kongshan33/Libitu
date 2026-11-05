"use client";

import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

import { Button } from "@/components/ui/button";

import { useEffect, useRef, useState } from "react";
import { usePracticePersistence } from "./PracticePersistence";
import type { PracticeAnalysis, PracticeAttempt } from "./practice-api";
import { loadHistoryPages } from "./history-pages";
import { takeAnalysisStatus } from './analysis-status';
import type { CaptionWordClock } from '../../playback/caption-word-clock';
import { useAudioWordClock } from '../../playback/use-audio-word-clock';

export function PracticeHistory({ contentId, sentenceId, onPlay, blocked, onAnalysisSelect, onViewAnalysis, onAnalysisRestore, selectedAnalysisId, playbackClock, onRecordDeleted, onSelectedTake, selectedAnalysis, onAnalysisChanged }: {
  contentId: string; sentenceId: string | null; onPlay: () => void; blocked: boolean;
  onAnalysisSelect?(id: string | null): void; onAnalysisRestore?(id: string | null, availableIds: string[]): void; selectedAnalysisId?: string | null;
  onViewAnalysis?(id: string): void;
  onSelectedTake?(take: PracticeAttempt | null): void;
  selectedAnalysis?: PracticeAnalysis | null;
  onAnalysisChanged?(): void;
  playbackClock?: CaptionWordClock;
  onRecordDeleted?(id: string): void;
}) {
  const persistence = usePracticePersistence();
  const api = persistence?.api;
  const version = persistence?.state.savedVersion ?? 0;
  const [items, setItems] = useState<PracticeAttempt[]>([]);
  const [offset, setOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [audio, setAudio] = useState<{ id: string; url: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const active = useRef<AbortController | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const busy = busyAction !== null;
  const current = useRef({ items, selectedAnalysisId, onAnalysisRestore });
  current.current = { items, selectedAnalysisId, onAnalysisRestore };
  const acting = useRef(false);
  useAudioWordClock(audioRef,audio?.url??null,playbackClock,!blocked && audio?.id===selectedAnalysisId);
  useEffect(() => { onSelectedTake?.(items.find(item => item.id === selectedAnalysisId) ?? null); }, [items, selectedAnalysisId, onSelectedTake]);

  useEffect(() => {
    const abort = new AbortController();
    active.current = abort;
    setItems([]); setOffset(null); setError(null); setAudio(null); setBusyAction(null);
    acting.current = false;
    return () => abort.abort();
  }, [api, contentId, sentenceId]);

  useEffect(() => {
    const abort = new AbortController();
    const signal = AbortSignal.any([abort.signal, active.current!.signal]);
    if (api && sentenceId) {
      setLoading(current.current.items.length === 0); setError(null);
      void loadHistoryPages(api, contentId, sentenceId, Math.max(20, current.current.items.length),
        current.current.selectedAnalysisId ?? null, signal).then(page => {
        if (!signal.aborted) {
          setItems(page.items); setOffset(page.next_offset);
          current.current.onAnalysisRestore?.(page.items[0]?.id ?? null, page.items.map(item => item.id));
          setAudio(previous => previous && !page.items.some(item => item.id === previous.id && item.recording_state === "ready") ? null : previous);
        }
      }).catch(reason => { if (!signal.aborted) setError(reason.message); })
        .finally(() => { if (!signal.aborted) setLoading(false); });
    } else setLoading(false);
    return () => abort.abort();
  }, [api, contentId, sentenceId, version, refresh, selectedAnalysis?.state]);

  useEffect(() => {
    if (loading || error || !items.some(item => item.analysis_state === 'queued' || item.analysis_state === 'processing')) return;
    const timer = setTimeout(() => setRefresh(value => value + 1), 5000);
    return () => clearTimeout(timer);
  }, [items, loading, error]);

  useEffect(() => {
    if (audio?.id !== selectedAnalysisId) audioRef.current?.pause();
  }, [audio?.id, selectedAnalysisId]);

  useEffect(() => {
    const element = audioRef.current;
    return () => { element?.pause(); if (audio) URL.revokeObjectURL(audio.url); };
  }, [audio]);
  useEffect(() => { if (blocked) audioRef.current?.pause(); }, [blocked]);
  // All practice playback paths emit this before playing; history playback participates too.
  useEffect(() => {
    const pause = () => audioRef.current?.pause();
    window.addEventListener("libitu:practice-playback", pause);
    const hide = () => { if (document.visibilityState === "hidden") pause(); };
    document.addEventListener("visibilitychange", hide);
    return () => { window.removeEventListener("libitu:practice-playback", pause); document.removeEventListener("visibilitychange", hide); };
  }, []);

  async function action(key: string, run: (signal: AbortSignal) => Promise<void>) {
    const abort = active.current;
    if (!abort || acting.current || loading || blocked) return;
    if (key.startsWith('remove') && !window.confirm(key.startsWith('remove-analysis') ? 'Delete this take’s saved analysis? The recording and practice record will remain.' : key.startsWith('remove-audio') ? 'Delete the retained recording? The practice record will remain.' : 'Delete this practice record and its recording?')) return;
    acting.current = true;
    setBusyAction(key); setError(null);
    try { await run(abort.signal); }
    catch (reason) { if (!abort.signal.aborted) setError(reason instanceof Error ? reason.message : "Please retry."); }
    finally { if (!abort.signal.aborted) { acting.current = false; setBusyAction(null); } }
  }

  return <section className="practice-history" aria-label="Saved practice">
    <h2>Takes</h2>
    {loading ? <ContentSkeleton label="Loading saved practice…" /> : !items.length ? <p>No saved takes yet.</p> : null}
    {error ? <p role="alert">{error} <Button variant="secondary" size="sm" onClick={() => setRefresh((n) => n + 1)}>Reload history</Button></p> : null}
    <ul>{items.map((item) => <li key={item.id} data-selected={selectedAnalysisId === item.id}>
      <div className="practice-history-meta"><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time><span> {(item.duration_ms / 1000).toFixed(1)} sec · {item.playback_rate}× · {item.text_support?`${item.text_support.mode==='keywords'?'Key words':item.text_support.mode==='full'?'Full text':'Text hidden'}${item.text_support.revealed_source_indices.length?` · peeked ${item.text_support.revealed_source_indices.length}`:''}`:item.text_visible ? "Text visible" : "Text hidden"}</span></div>
      <div className="practice-history-actions ui-button-group">
      <small>{takeAnalysisStatus(item, selectedAnalysisId === item.id ? selectedAnalysis : null)}</small>
      {onAnalysisSelect ? <Button variant="secondary" size="sm" type="button" disabled={busy||blocked||loading} aria-pressed={selectedAnalysisId === item.id}
        onClick={() => onViewAnalysis ? onViewAnalysis(item.id) : onAnalysisSelect(item.id)}>View analysis</Button> : null}
      {item.recording_state === "ready" ? <>
        <Button variant="secondary" size="sm" type="button" disabled={busy || blocked || loading} loading={busyAction === `audio:${item.id}`} loadingLabel="Loading…" onClick={() => void action(`audio:${item.id}`, async (signal) => {
          const blob = await api!.audio(item.id, signal);
          if (signal.aborted) return;
          onPlay();
          if(selectedAnalysisId!==item.id)onAnalysisSelect?.(item.id);
          setAudio({ id: item.id, url: URL.createObjectURL(blob) });
        })}>Load recording</Button>
        <Button className="analysis-text-action" variant="ghost" size="sm" type="button" disabled={busy||blocked||loading} loading={busyAction === `remove-audio:${item.id}`} loadingLabel="Deleting…" onClick={() => void action(`remove-audio:${item.id}`, async (signal) => {
          await api!.remove(item.id, true, signal);
          if (!signal.aborted) {
            if(audio?.id===item.id)setAudio(null);
            setItems(current => current.map(take => take.id === item.id ? { ...take, recording_state: "deleted" } : take));
          }
        })}>Delete saved audio</Button>
      </> : <small>{item.recording_state === "pending" ? "Audio upload incomplete" : "No retained audio"}</small>}
      {selectedAnalysisId === item.id && selectedAnalysis && !['deleted', 'awaiting_upload', 'queued', 'processing'].includes(selectedAnalysis.state) ? <Button className="analysis-text-action" variant="ghost" size="sm" type="button" disabled={busy||blocked||loading}
        loading={busyAction === `remove-analysis:${item.id}`} loadingLabel="Deleting…" onClick={() => void action(`remove-analysis:${item.id}`, async signal => {
          await api!.controlAnalysis(item.id, 'delete', signal);
          if (!signal.aborted) onAnalysisChanged?.();
        })}>Delete analysis</Button> : null}
      <Button className="analysis-text-action" variant="ghost" size="sm" type="button" disabled={busy||blocked||loading} loading={busyAction === `remove:${item.id}`} loadingLabel="Deleting…" onClick={() => void action(`remove:${item.id}`, async (signal) => {
        await api!.remove(item.id, false, signal);
        if (!signal.aborted) {
          onRecordDeleted?.(item.id);
          setItems(current => current.filter(take => take.id !== item.id));
          if(audio?.id===item.id)setAudio(null);
          setRefresh((n) => n + 1);
        }
      })}>Delete practice record</Button>
      </div>
      {audio?.id === item.id ? <audio ref={audioRef} src={audio.url} controls preload="metadata"
        onPlay={() => { if (blocked) audioRef.current?.pause(); else {onPlay();if(selectedAnalysisId!==item.id)onAnalysisSelect?.(item.id);} }}
        onError={() => setError("This recording could not play. Try loading it again.")} /> : null}
    </li>)}</ul>
    {offset !== null ? <Button variant="secondary" size="sm" type="button" disabled={busy||blocked||loading} loading={busyAction === "older"} loadingLabel="Loading…" onClick={() => void action("older", async (signal) => {
      const page = await api!.list(contentId, sentenceId!, offset, signal);
      if (!signal.aborted) { setItems((current) => [...new Map([...current, ...page.items].map(take => [take.id, take])).values()]); setOffset(page.next_offset); }
    })}>Load older takes</Button> : null}
  </section>;
}
