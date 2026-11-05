import type { ComparisonView, Word } from './view';
import type { PracticeAnalysis, SignalProsody } from '../persistence/practice-api';

export type TimelineFrame = { time: number; pitch: number | null; energy: number | null };
export type TimelineVoice = { duration: number | null; start: number; gap: number; pause: number | null; step: number; prominence: number | null; uncertain: boolean; frames: TimelineFrame[] };
export type TimelineColumn = { text: string; index: number; duration: number; reference: TimelineVoice; yours: TimelineVoice };
export type TimelineVoiceName = 'reference' | 'yours';
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const measured = (word: Word | undefined): word is Word & { startMs: number; endMs: number } => Boolean(word && finite(word.startMs) && finite(word.endMs) && word.endMs > word.startMs && (!word.match || word.match === 'matched'));

function signalFrames(signal: SignalProsody | null | undefined): TimelineFrame[] {
  return signal?.display_frames?.length
    ? signal.display_frames.map(f => ({ time: f.time_sec, pitch: finite(f.pitch_st) ? f.pitch_st : null, energy: finite(f.energy_dbfs) ? f.energy_dbfs : null }))
    : (signal?.pitch_st ?? []).map((pitch, i) => ({ time: i * signal!.time_step_sec, pitch: finite(pitch) ? pitch : null, energy: null }));
}

function voice(word: Word | undefined, next: Word | undefined, index: number, signal: SignalProsody | null | undefined, frames: TimelineFrame[]): TimelineVoice {
  const empty: TimelineVoice = { duration: null, start: 0, gap: 0, pause: null, step: .02, prominence: null, uncertain: false, frames: [] };
  // Never borrow evidence across unmatched words or inserted speech.
  if (!measured(word)) return empty;
  const start = word.startMs / 1000, end = word.endMs / 1000;
  const boundaryKnown = measured(next) && finite(word.pause) && next.startMs >= word.endMs - 1;
  const gap = boundaryKnown ? Math.max(0, next.startMs - word.endMs) : 0;
  const prominence = signal?.words.find(w => w.source_index === index);
  return { duration: word.endMs - word.startMs, start, gap, pause: boundaryKnown ? word.pause : null,
    step: signal?.display_frames?.length ? .02 : signal?.time_step_sec ?? .02,
    prominence: finite(prominence?.value) ? prominence.value : null, uncertain: prominence?.uncertain ?? false,
    frames: frames.filter(f => finite(f.time) && f.time >= start && f.time < end + gap / 1000).map(f => ({ ...f, time: f.time - start })) };
}

export function timelineColumns(view: ComparisonView, data: PracticeAnalysis | null): TimelineColumn[] {
  const result = data && ['completed', 'needs_review'].includes(data.state) ? data.result : null;
  const referenceSignal = result?.comparison === 'available' ? result.reference?.rhythm_signal : null;
  const learnerSignal = result?.learner.rhythm_signal;
  const referenceFrames = signalFrames(referenceSignal), learnerFrames = signalFrames(learnerSignal);
  return view.yours.words.map((word, index) => {
    const reference = voice(view.reference.words[index], view.reference.words[index + 1], index, referenceSignal, referenceFrames);
    const yours = voice(word, view.yours.words[index + 1], index, learnerSignal, learnerFrames);
    return { text: word.text, index, reference, yours, duration: Math.max((reference.duration ?? 0) + reference.gap, (yours.duration ?? 0) + yours.gap) };
  });
}

export function columnWidth(column: TimelineColumn, zoom: number, labelWidth = column.text.length * 16) {
  // Additional label room is not measured time; traces retain their own scale.
  return Math.max(48, Math.ceil(labelWidth) + 20, column.duration * zoom);
}

export function wordColumnWidth(column: TimelineColumn, zoom: number, labelWidth = column.text.length * 16) {
  // A trailing pause occupies time on the axis, but is not part of the word's
  // label, selection or playback highlight. Keep the plot's full width intact.
  const wordDuration = Math.max(column.reference.duration ?? 0, column.yours.duration ?? 0);
  return Math.min(columnWidth(column, zoom, labelWidth), Math.max(48, Math.ceil(labelWidth) + 20, wordDuration * zoom));
}

export function fitTimelineZoom(columns: TimelineColumn[], labels: number[], available: number) {
  const width = (zoom: number) => columns.reduce((sum, column, i) => sum + columnWidth(column, zoom, labels[i]), 0);
  if (available <= width(.06)) return .06;
  let low = .06, high = .6;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (width(mid) <= available) low = mid; else high = mid;
  }
  return low;
}

export function timelineTicks(columns: TimelineColumn[], zoom: number, labels: number[], voice: TimelineVoiceName = 'yours') {
  const ticks: { second: number; left: number }[] = [];
  let left = 0;
  for (const column of columns) {
    const evidence = column[voice];
    if (evidence.duration !== null) {
      const end = evidence.start + (evidence.duration + evidence.gap) / 1000;
      for (let second = Math.ceil(evidence.start); second < end; second++) {
        ticks.push({ second, left: left + (second - evidence.start) * 1000 * zoom });
      }
    }
    left += columnWidth(column, zoom, labels[column.index]);
  }
  return ticks;
}

export function pitchPath(frames: TimelineFrame[], zoom: number, step = .02) {
  return projectedPitchPath(frames.map(f => ({ ...f, x: f.time * 1000 * zoom, step })));
}

function projectedPitchPath(frames: (TimelineFrame & { x: number; step: number })[]) {
  let connected = false, previous = -Infinity;
  return frames.map(frame => {
    if (!finite(frame.pitch)) { connected = false; previous = frame.time; return ''; }
    const command = connected && frame.time > previous && frame.time - previous <= frame.step * 1.51 ? 'L' : 'M';
    connected = true; previous = frame.time;
    return `${command}${frame.x.toFixed(2)},${(56 - Math.max(-12, Math.min(12, frame.pitch)) * 4).toFixed(2)}`;
  }).join(' ');
}

export function timelinePitchPath(columns: TimelineColumn[], voice: TimelineVoiceName, zoom: number, labels: number[]) {
  const points: (TimelineFrame & { x: number; step: number })[] = [];
  let left = 0;
  columns.forEach((column, index) => {
    const evidence = column[voice], previous = columns[index - 1]?.[voice];
    // A word boundary alone is not a pitch break. Only measured continuous
    // boundaries may join; gaps, unvoiced frames and missing evidence break it.
    if (!previous || previous.pause !== 0 || evidence.duration === null) {
      points.push({ time: evidence.start, pitch: null, energy: null, x: left, step: evidence.step });
    }
    for (const frame of evidence.frames) points.push({ ...frame, time: frame.time + evidence.start, x: left + frame.time * 1000 * zoom, step: evidence.step });
    left += columnWidth(column, zoom, labels[index]);
  });
  return projectedPitchPath(points);
}

export function envelopePath(frames: TimelineFrame[], zoom: number, peak: number) {
  const parts: string[] = [];
  let path = '', lastX = 0, previous = -Infinity;
  const close = () => { if (path) parts.push(`${path} L${lastX},52 Z`); path = ''; };
  for (const frame of frames) {
    if (!finite(frame.energy)) { close(); continue; }
    if (frame.time - previous > .031) close();
    const x = frame.time * 1000 * zoom;
    const y = 52 - Math.min(1, Math.pow(10, (frame.energy - peak) / 20)) * 52;
    path += path ? ` L${x.toFixed(2)},${y.toFixed(2)}` : `M${x.toFixed(2)},52 L${x.toFixed(2)},${y.toFixed(2)}`;
    lastX = x; previous = frame.time;
  }
  close();
  return parts.join(' ');
}
