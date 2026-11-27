'use client';
import { useEffect, useRef, useState } from 'react';
import { comparisonWordAtTime, type ComparisonView } from './view';
import type { CaptionClockSample, CaptionWordClock } from '../../playback/caption-word-clock';

export type ComparisonPlayback = { reference: CaptionWordClock; yours: CaptionWordClock; referenceOffsetMs: number };
export type PlayingVoice = 'reference' | 'yours';
export type TimelinePlaybackState = { voice: PlayingVoice | null; index: number | null };

export function useTimelinePlayback(
  view: ComparisonView,
  playback?: ComparisonPlayback,
  onTime?: (voice: PlayingVoice | null, timeMs: number) => void,
): TimelinePlaybackState {
  const [state, setState] = useState<TimelinePlaybackState>({ voice: null, index: null });
  const onTimeRef = useRef(onTime);
  useEffect(() => { onTimeRef.current = onTime; });
  const reference = playback?.reference, yours = playback?.yours, offset = playback?.referenceOffsetMs ?? 0;
  useEffect(() => {
    if (!reference || !yours || !view.wordAligned) {
      onTimeRef.current?.(null, 0);
      return;
    }
    let r: CaptionClockSample = { timeMs: 0, playing: false }, y: CaptionClockSample = { timeMs: 0, playing: false };
    const update = () => {
      const voice: PlayingVoice | null = y.playing ? 'yours' : r.playing ? 'reference' : null;
      const timeMs = voice === 'yours' ? y.timeMs : voice === 'reference' ? r.timeMs - offset : 0;
      const index = voice === 'yours' ? comparisonWordAtTime(view.yours.words, timeMs)
        : voice === 'reference' ? comparisonWordAtTime(view.reference.words, timeMs) : null;
      onTimeRef.current?.(voice, timeMs);
      setState(prev => prev.voice === voice && prev.index === index ? prev : { voice, index });
    };
    const offR = reference.subscribe(sample => { r = sample; update(); });
    const offY = yours.subscribe(sample => { y = sample; update(); });
    return () => { offR(); offY(); onTimeRef.current?.(null, 0); };
  }, [reference, yours, offset, view]);
  return view.wordAligned ? state : { voice: null, index: null };
}

export function usePlayingWord(view: ComparisonView, playback?: ComparisonPlayback) {
  return useTimelinePlayback(view, playback).index;
}
