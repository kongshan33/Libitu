'use client';
import { useEffect, useState } from 'react';
import { comparisonWordAtTime, type ComparisonView } from './view';
import type { CaptionClockSample, CaptionWordClock } from '../../playback/caption-word-clock';

export type ComparisonPlayback = { reference: CaptionWordClock; yours: CaptionWordClock; referenceOffsetMs: number };
export function usePlayingWord(view: ComparisonView, playback?: ComparisonPlayback) {
  const [index, setIndex] = useState<number | null>(null);
  const reference = playback?.reference, yours = playback?.yours, offset = playback?.referenceOffsetMs ?? 0;
  useEffect(() => {
    if (!reference || !yours || !view.wordAligned) return;
    let r: CaptionClockSample = { timeMs:0, playing:false }, y: CaptionClockSample = { timeMs:0, playing:false };
    const update = () => setIndex(y.playing ? comparisonWordAtTime(view.yours.words, y.timeMs)
      : r.playing ? comparisonWordAtTime(view.reference.words, r.timeMs - offset) : null);
    const offR = reference.subscribe(sample => { r = sample; update(); });
    const offY = yours.subscribe(sample => { y = sample; update(); });
    return () => { offR(); offY(); };
  }, [reference, yours, offset, view]);
  return view.wordAligned ? index : null;
}
