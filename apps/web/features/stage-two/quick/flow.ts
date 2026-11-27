import type { PracticeAnalysis } from '../persistence/practice-api';
import { practiceTokens } from '../practice/flow.ts';

export type QuickPhase = 'idle' | 'loading' | 'listening' | 'preparing' | 'requesting' | 'recording' | 'saving' | 'gap' | 'wait' | 'paused' | 'done';
export type QuickStatus = 'matched' | 'close' | 'redo' | 'pending' | 'unchecked' | 'failed';
export type QuickListenSource = 'reference' | 'video';

export function shouldAcceptListenTime(
  phase: QuickPhase,
  activeSource: QuickListenSource,
  eventSource: QuickListenSource
): boolean {
  return phase === 'listening' && activeSource === eventSource;
}

export function listenProgressFraction(
  source: QuickListenSource,
  sentence: { startMs: number; endMs: number },
  sample: { videoTimeSeconds?: number; audioCurrentTimeSeconds?: number; audioDurationSeconds?: number }
): number {
  const spanMs = sentence.endMs - sentence.startMs;
  if (source === 'reference') {
    const currentSeconds = sample.audioCurrentTimeSeconds ?? 0;
    if (!Number.isFinite(currentSeconds) || currentSeconds <= 0) return 0;
    const durationSeconds = sample.audioDurationSeconds;
    if (durationSeconds !== undefined && Number.isFinite(durationSeconds) && durationSeconds > 0) {
      return Math.min(1, Math.max(0, currentSeconds / durationSeconds));
    }
    if (spanMs <= 0) return 0;
    return Math.min(1, Math.max(0, (currentSeconds * 1000) / spanMs));
  }
  if (spanMs <= 0) return 0;
  const videoSeconds = sample.videoTimeSeconds ?? sentence.startMs / 1000;
  if (!Number.isFinite(videoSeconds)) return 0;
  return Math.min(1, Math.max(0, (videoSeconds * 1000 - sentence.startMs) / spanMs));
}
export function repeatDuration(sentence: { startMs: number; endMs: number }) {
  return Math.max(1, Math.round((sentence.endMs - sentence.startMs) * 2));
}
export function quickQueue<T extends { text: string }>(sentences: readonly T[], first: number, last: number, skipShort: boolean): T[] {
  return sentences.slice(first, last + 1).filter(sentence => !skipShort || practiceTokens(sentence.text).length >= 4);
}
export function quickStatus(data: PracticeAnalysis | null | undefined, requested: boolean, saved: boolean): QuickStatus {
  if (!saved || data && ['awaiting_upload', 'queued', 'processing'].includes(data.state) && !data.word_check) return 'pending';
  if (data?.state === 'failed' || data?.state === 'cancelled' || data?.state === 'deleted') return 'failed';
  const check = data?.word_check;
  if (check?.status === 'reliable' && check.source_count > 0) {
    return check.matched_count * 100 >= check.source_count * 85 ? 'matched'
      : check.matched_count * 100 >= check.source_count * 60 ? 'close' : 'redo';
  }
  return data || !requested ? 'unchecked' : 'pending';
}
export function clock(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
