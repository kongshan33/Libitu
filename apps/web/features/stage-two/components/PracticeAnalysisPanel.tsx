'use client';
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDelayedPending } from '@/components/ui/use-delayed-pending';
import type { PracticeAnalysis, PracticeApi } from '../persistence/practice-api';
import styles from './PracticeAnalysisPanel.module.css';

function failureMessage(code: string | null) {
  if (code === 'recording_duration_invalid') return 'Recording length is invalid. Record another take.';
  if (code === 'audio_decode_failed' || code === 'recording_integrity_failed') return 'Recording could not be read. Record another take.';
  if (code === 'asr_timeout') return 'Word check timed out.';
  if (code === 'reference_not_ready') return 'Reference is not ready yet.';
  return 'Analysis could not finish.';
}

/** Only active work and recoverable failures interrupt the analysis workspace. */
export function PracticeAnalysisPanel({ api, attemptId, data, error, loading, reload }: {
  api: PracticeApi | undefined; attemptId: string | null; data: PracticeAnalysis | null;
  error: string | null; loading: boolean; reload(): void;
}) {
  const [failure, setFailure] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'retry' | 'cancel' | null>(null);
  const active = useRef<AbortController | null>(null);
  useEffect(() => { const abort = new AbortController(); active.current = abort; setFailure(null); setBusyAction(null); return () => abort.abort(); }, [attemptId]);
  async function act(action: 'retry' | 'cancel') {
    if (!api || !attemptId || !active.current || busyAction) return;
    const signal = active.current.signal;
    setBusyAction(action); setFailure(null);
    try { await api.controlAnalysis(attemptId, action, signal); if (!signal.aborted) reload(); }
    catch (cause) { if (!signal.aborted) setFailure(cause instanceof Error ? cause.message : 'Please retry.'); }
    finally { if (!signal.aborted) setBusyAction(null); }
  }
  const pending = Boolean(data && ['queued', 'processing', 'awaiting_upload'].includes(data.state));
  const showPending = useDelayedPending(Boolean(attemptId && pending));
  if (!attemptId) return null;
  const failed = data?.state === 'failed' || data?.state === 'cancelled' && data.retryable;
  const issue = error ?? failure ?? (failed ? failureMessage(data?.error_code ?? null) : null);
  if (!issue && !showPending) return null;
  const message = issue ?? (data?.state === 'awaiting_upload' ? 'Uploading recording…'
    : data?.phase === 'waiting_reference' || data?.error_code === 'reference_pending' ? 'Waiting for reference…'
    : data?.phase === 'checking_words' ? 'Checking words…'
    : data?.state === 'queued' ? 'Analysis queued…' : 'Analyzing recording…');
  return <section className={issue ? "ui-retry-notice" : styles.notice} aria-label="Analysis status">
    <span className={styles.message} role={issue ? 'alert' : 'status'}>{issue ? <AlertCircle size={15} aria-hidden="true"/> : <LoaderCircle className={styles.spinner} size={15} aria-hidden="true"/>}{message}</span>
    {error || failure ? <Button variant="ghost" size="sm" loading={loading} loadingLabel="Loading…" onClick={reload}>Reload</Button> : null}
    {data?.retryable ? <Button variant="secondary" size="sm" disabled={Boolean(busyAction)} loading={busyAction === 'retry'} loadingLabel="Requesting…" onClick={() => void act('retry')}>Retry analysis</Button> : null}
    {pending ? <Button variant="ghost" size="sm" disabled={Boolean(busyAction)} loading={busyAction === 'cancel'} loadingLabel="Cancelling…" onClick={() => void act('cancel')}>Cancel</Button> : null}
  </section>;
}
