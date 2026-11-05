'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PracticeApi, PracticeAttempt } from '../persistence/practice-api';
import type { CaptionWordClock } from '../../playback/caption-word-clock';
import { useAudioWordClock } from '../../playback/use-audio-word-clock';

export function SavedTakeReplay({ take, api, clock, onPlay, disabled = false, label = 'Replay mine' }: {
  take: PracticeAttempt | null; api?: PracticeApi; clock: CaptionWordClock; onPlay(): void; disabled?: boolean; label?: string;
}) {
  const audio = useRef<HTMLAudioElement>(null), request = useRef<AbortController | null>(null);
  const [url, setUrl] = useState<string | null>(null), [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  useAudioWordClock(audio, url, clock, !disabled);
  useEffect(() => () => { request.current?.abort(); }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => {
    const stop = () => audio.current?.pause();
    window.addEventListener('libitu:practice-playback', stop);
    return () => window.removeEventListener('libitu:practice-playback', stop);
  }, []);
  useEffect(() => { if (disabled) audio.current?.pause(); }, [disabled]);
  async function play() {
    if (playing) { audio.current?.pause(); return; }
    if (!take || !api || disabled || loading) return;
    request.current?.abort(); const abort = new AbortController(); request.current = abort;
    setLoading(true); setError('');
    try {
      const source = url ?? URL.createObjectURL(await api.audio(take.id, abort.signal));
      if (abort.signal.aborted) { if (!url) URL.revokeObjectURL(source); return; }
      onPlay(); setUrl(source);
      if (audio.current) { audio.current.src = source; await audio.current.play(); }
    } catch (cause) { if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : 'This recording could not play.'); }
    finally { if (!abort.signal.aborted) setLoading(false); }
  }
  return <><Button variant="secondary" disabled={disabled || !api || take?.recording_state !== 'ready'} loading={loading} loadingLabel="Loading…" onClick={() => void play()}>
    {playing ? <Pause size={16}/> : <Play size={16}/>}{playing ? 'Pause mine' : label}</Button>
    <audio ref={audio} src={url ?? undefined} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setError('This recording could not play. Try again.')}/>
    {error ? <span role="alert" className="saved-replay-error">{error}</span> : null}</>;
}
