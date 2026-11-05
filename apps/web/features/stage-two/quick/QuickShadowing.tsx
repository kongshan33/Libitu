'use client';
import { ContentSkeleton } from '@/components/ui/ContentSkeleton';
import { PracticeHistory } from '../persistence/PracticeHistory';

import { AudioSettings } from "../components/AudioSettings";
import { useNavigationFocus } from "@/components/AppNavigation";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DirectionButton } from '@/components/ui/direction-button';
import { SentenceDirectory } from '../components/SentenceDirectory';
import type { StageTwoProps } from '../components/StageTwoDetailed';
import type { ShadowMode } from '../components/StageTwoShadowing';
import type { TextSupport } from '../persistence/practice-api';
import type { RecordingState } from '../recording/local-recorder';
import { WorkspacePlayer } from '../../learning-workspace/MediaHost';
import type { YouTubePlayerHandle } from '../../stage-one/components/YouTubePlayer';
import { CaptionWordClock } from '../../playback/caption-word-clock';
import { useAudioWordClock } from '../../playback/use-audio-word-clock';
import { useBufferedReferenceContext } from '../reference/use-buffered-reference';
import { buildSentenceUnits } from '../sentences';
import { useSentenceRecording } from '../recording/use-sentence-recording';
import { usePracticePersistence } from '../persistence/PracticePersistence';
import { recordingReference } from '../practice/recording-reference';
import { practiceTokens, supportSnapshot, visiblePositions } from '../practice/flow';
import { PracticePrompt } from '../components/PracticePrompt';
import { PracticeOutcome } from '../components/PracticeOutcome';
import { RecordingWaveform } from '../components/RecordingWaveform';
import { readStageTwoLocation, replaceStageTwoLocation } from '../location';
import { useCurrentLocation } from '../../navigation/use-current-location';
import { useQuickReference } from './use-quick-reference';
import { useQuickTakes, type QuickTake } from './use-quick-takes';
import { QuickReviewAnalysis } from './QuickReviewAnalysis';
import { clock, quickQueue, quickStatus, repeatDuration, type QuickPhase } from './flow';
import { startQuickPreparation } from './preparation';
import styles from './QuickShadowing.module.css';
import practiceStyles from '../components/StageTwoPractice.module.css';

type Props = StageTwoProps & {mode: ShadowMode; modes: ReactNode; onMode(mode: ShadowMode): void};
type Run = {ids: string[]; index: number; round: number; takes: Record<string, string>; skipped: string[]};
const emptyRun: Run = {ids: [], index: 0, round: 1, takes: {}, skipped: []};

export function QuickShadowing({contentId, segment, sourceUrl, title, transcript, onBack, mode, modes, onMode, timingRecovery}: Props) {
  const active = mode !== 'detailed';
  const directoryId = useId();
  const sentences = useMemo(() => buildSentenceUnits(contentId, segment, transcript), [contentId, segment, transcript]);
  const persistence = usePracticePersistence();
  const buffered = useBufferedReferenceContext();
  const suspend = buffered?.suspend;
  const [phase, setPhaseState] = useState<QuickPhase>('idle');
  useNavigationFocus(active && phase === 'recording');
  const phaseRef = useRef<QuickPhase>('idle');
  const setPhase = useCallback((next: QuickPhase) => { phaseRef.current = next; setPhaseState(next); }, []);
  const [run, setRun] = useState<Run>(emptyRun);
  const [sentenceId, setSentenceId] = useState<string | null>(null);
  const href = useCurrentLocation();
  const location = readStageTwoLocation(new URL(href, 'https://libitu.invalid'));
  const selectedId = mode === 'review' ? (location?.segmentId === segment.id ? location.sentenceId : null) ?? sentenceId : sentenceId ?? (location?.segmentId === segment.id ? location.sentenceId : null);
  const selected = sentences.find(sentence => sentence.id === selectedId) ?? sentences[0] ?? null;
  const [first, setFirst] = useState(0), [last, setLast] = useState(Math.max(0, sentences.length - 1));
  const [skipShort, setSkipShort] = useState(true), [chooseRange, setChooseRange] = useState(false);
  const [rate, setRate] = useState(1), [auto, setAuto] = useState(true), [support, setSupport] = useState<TextSupport['mode']>('hidden');
  const [retain, setRetain] = useState(false), [revealed, setRevealed] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [preparationSeconds, setPreparationSeconds] = useState(2);
  const [time, setTime] = useState(0), [videoReady, setVideoReady] = useState(false);
  const [selectedTakeKey, setSelectedTakeKey] = useState<string | null>(null);
  const requestedTake = new URL(href, 'https://libitu.invalid').searchParams.get('takeId');
  const results = useQuickTakes(persistence?.api, contentId, mode === 'review', requestedTake ?? selectedTakeKey, sentences);
  const {add, acknowledge} = results;
  const references = useQuickReference(contentId, segment.id, sentences, selected, rate);
  const player = useRef<YouTubePlayerHandle>(null), referenceAudio = useRef<HTMLAudioElement>(null), takeAudio = useRef<HTMLAudioElement>(null);
  const [referenceClock] = useState(() => new CaptionWordClock()), [learnerClock] = useState(() => new CaptionWordClock());
  const [replay, setReplay] = useState<{key: string; url: string} | null>(null);
  const replayRequest = useRef<AbortController | null>(null);
  const replayObjectUrl = useRef<string | null>(null);
  const epoch = useRef(0), listenSource = useRef<'reference' | 'video'>('video');
  const interrupted = useRef(false), ending = useRef(false);
  const frozen = useRef<{sentenceId: string; rate: number; retain: boolean; analyze: boolean; referenceId: string | null; support: TextSupport} | null>(null);
  const [referencePlaying, setReferencePlaying] = useState(false);
  const stopPlayback = useCallback(() => {
    player.current?.pause(); referenceAudio.current?.pause(); takeAudio.current?.pause();
    setReferencePlaying(false); suspend?.();
  }, [suspend]);
  const saveCompleted = useCallback((clip: NonNullable<RecordingState['clip']>) => {
    const context = frozen.current;
    if (!context || context.sentenceId !== clip.sentenceId || !persistence) return;
    frozen.current = null;
    const key = crypto.randomUUID();
    const take: QuickTake = {durationMs:clip.durationMs,key, id: null, sentenceId: clip.sentenceId, createdAt: new Date().toISOString(), requested: context.analyze,
      recordingState: context.retain ? 'ready' : 'none'};
    add(take, clip.blob);
    setRun(old => ({...old, takes: {...old.takes, [clip.sentenceId]: key}}));
    try {
      persistence.outbox.enqueue({content_id: contentId, sentence_id: clip.sentenceId, duration_ms: Math.max(1, Math.round(clip.durationMs)),
        playback_rate: context.rate, text_visible: Boolean(context.support.visible_source_indices_at_start.length), text_support: context.support},
        clip.blob, context.retain, context.analyze ? {referenceId: context.referenceId} : undefined, id => acknowledge(key, id));
      setPhase(ending.current ? 'done' : interrupted.current ? 'paused' : 'gap');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Take could not be queued.'); setPhase('paused');
    }
  }, [persistence, contentId, add, acknowledge, setPhase]);
  const recording = useSentenceRecording(selected?.id ?? null, stopPlayback, saveCompleted);
  const recordingRef = useRef(recording);
  useLayoutEffect(() => { recordingRef.current = recording; });
  const latest = useRef({selected, references, persistence, rate, support, revealed, active, mode, auto, run});
  useLayoutEffect(() => { latest.current = {selected, references, persistence, rate, support, revealed, active, mode, auto, run}; });

  function pauseRun() {
    epoch.current += 1; interrupted.current = true;
    if (phaseRef.current !== 'saving' && !['idle', 'done'].includes(phaseRef.current)) {
      frozen.current = null;
      recording.recorder.cancel(); setPhase('paused');
    }
    stopPlayback();
  }
  const pauseRunRef = useRef(pauseRun);
  useLayoutEffect(() => { pauseRunRef.current = pauseRun; });
  useEffect(() => {
    if (mode !== 'quick') pauseRunRef.current();
    if (mode === 'review' && !recordingRef.current.isBusy()) {
      const id = new URL(window.location.href).searchParams.get('sentenceId');
      if (id) setSentenceId(id);
    }
    if (mode !== 'review') { replayRequest.current?.abort(); takeAudio.current?.pause(); }
  }, [mode]);
  useEffect(() => {
    const hide = () => { if (document.visibilityState === 'hidden') pauseRunRef.current(); };
    document.addEventListener('visibilitychange', hide);
    return () => { epoch.current += 1; document.removeEventListener('visibilitychange', hide); stopPlayback(); replayRequest.current?.abort(); if (replayObjectUrl.current) URL.revokeObjectURL(replayObjectUrl.current); };
  }, [stopPlayback]);

  const beginRecording = useCallback(() => {
    if (phaseRef.current !== 'preparing') return;
    const state = latest.current;
    if (!state.active || state.mode !== 'quick' || !state.selected || document.visibilityState === 'hidden') return;
    if (!state.persistence?.outbox.canRecord()) { setError('Sign in or retry pending saves before continuing.'); setPhase('paused'); stopPlayback(); return; }
    setPhase('requesting'); stopPlayback();
    const tokens = practiceTokens(state.selected.text);
    frozen.current = {sentenceId: state.selected.id, rate: state.rate, retain, analyze: state.persistence.analyze,
      referenceId: recordingReference(state.references.row, contentId, segment.id, state.selected)?.id ?? null,
      support: supportSnapshot(state.support, visiblePositions(tokens, state.support, state.revealed), state.revealed)};
    recordingRef.current.startWithDuration(repeatDuration(state.selected));
  }, [contentId, segment.id, retain, setPhase, stopPlayback]);

  const listenEnded = useCallback(() => {
    if (phaseRef.current !== 'listening' || latest.current.mode !== 'quick' || document.visibilityState === 'hidden') return;
    setPreparationSeconds(2); setPhase('preparing'); stopPlayback();
  }, [setPhase, stopPlayback]);
  useEffect(() => {
    if (phase !== 'preparing') return;
    const generation = epoch.current;
    return startQuickPreparation(setPreparationSeconds, () => {
      if (generation === epoch.current) beginRecording();
    });
  }, [phase, beginRecording]);

  useEffect(() => {
    if (phase !== 'loading' || !active || mode !== 'quick' || !selected || references.loading) return;
    if (!references.url && !videoReady) return;
    const generation = ++epoch.current;
    const audio = referenceAudio.current;
    listenSource.current = references.url ? 'reference' : 'video';
    setTime(selected.startMs / 1000);
    setPhase('listening');
    if (references.url && audio) {
      audio.currentTime = 0; audio.playbackRate = rate;
      void audio.play().catch(() => { if (generation === epoch.current) { setError('Playback was blocked. Press Resume to try again.'); setPhase('paused'); } });
    } else {
      player.current?.setPlaybackRate(rate);
      player.current?.playRange(selected.startMs / 1000, selected.endMs / 1000, {loop: false});
    }
  }, [phase, active, mode, selected, references.url, references.loading, videoReady, rate, setPhase]);
  useEffect(() => {
    if (!['loading', 'listening'].includes(phase)) return;
    const timer = setTimeout(() => {
      if (['loading','listening'].includes(phaseRef.current)) { pauseRunRef.current(); setError('Playback did not finish. Check the video or connection, then resume.'); }
    }, Math.max(30_000, ((selected?.endMs ?? 0) - (selected?.startMs ?? 0)) / rate + 30_000));
    return () => clearTimeout(timer);
  }, [phase, selected, rate]);
  useEffect(() => {
    if (recording.state.phase === 'recording' && phaseRef.current === 'requesting') setPhase('recording');
    if (recording.state.phase === 'stopping' && phaseRef.current === 'recording') setPhase('saving');
    if (recording.state.phase === 'error' && ['requesting','recording','saving'].includes(phaseRef.current)) {
      setError(recording.state.error ?? 'Recording could not finish.'); setPhase('paused'); frozen.current = null;
    }
  }, [recording.state.phase, recording.state.error, setPhase]);

  function startSentence(id: string) {
    epoch.current += 1;
    stopPlayback(); recording.changeSentence(id); setSentenceId(id); setRevealed([]); setError('');
    frozen.current = null; interrupted.current = false; ending.current = false;
    replaceStageTwoLocation({segmentId: segment.id, sentenceId: id}); setPhase('loading');
  }
  function startRun(ids: string[], round = 1) {
    if (!ids.length || recording.isBusy()) return;
    setRun({ids, index: 0, round, takes: {}, skipped: []}); onMode('quick'); startSentence(ids[0]);
  }
  function advance(skip = false) {
    const current = latest.current.run;
    const index = current.index + 1;
    setRun({...current, index, skipped: skip ? [...current.skipped, current.ids[current.index]] : current.skipped});
    if (index >= current.ids.length) { stopPlayback(); setPhase('done'); } else startSentence(current.ids[index]);
  }
  const advanceRef = useRef(advance);
  useLayoutEffect(() => { advanceRef.current = advance; });
  useEffect(() => {
    if (phase !== 'gap') return;
    const timer = setTimeout(() => { if (phaseRef.current !== 'gap') return; if (latest.current.auto) advanceRef.current(); else setPhase('wait'); }, 650);
    return () => clearTimeout(timer);
  }, [phase, setPhase]);
  function resume() {
    const id = run.ids[run.index];
    if (!id) { setPhase('done'); return; }
    startSentence(id);
  }
  function redo() {
    epoch.current += 1; recording.recorder.cancel();
    const id = run.ids[run.index]; if (id) { setRun(old => { const takes = {...old.takes}; delete takes[id]; return {...old, takes}; }); startSentence(id); }
  }
  function endRun() { ending.current = true; pauseRun(); if (phaseRef.current !== 'saving') setPhase('done'); }
  function leave() { pauseRun(); recording.recorder.cancel(); stopPlayback(); onBack(); }
  function reveal(index: number) {
    setRevealed(old => [...new Set([...old, index])]);
    if (frozen.current) frozen.current.support.revealed_source_indices = [...new Set([...frozen.current.support.revealed_source_indices,index])];
  }

  const queue = quickQueue(sentences, first, last, skipShort);
  const latestTakes = new Map<string, QuickTake>();
  for (const take of results.takes) if (!latestTakes.has(take.sentenceId)) latestTakes.set(take.sentenceId,take);
  const practiced = sentences.filter(sentence => latestTakes.has(sentence.id));
  const [filter, setFilter] = useState<'all'|'need'|'matched'>('all'), [collapsed, setCollapsed] = useState(false);
  const statusOf = (take: QuickTake) => quickStatus(take.analysis, take.requested, Boolean(take.id));
  const filtered = practiced.filter(sentence => filter === 'all' || (filter === 'matched' ? statusOf(latestTakes.get(sentence.id)!) === 'matched' : ['close','redo','failed','unchecked'].includes(statusOf(latestTakes.get(sentence.id)!))));
  const reviewSentence = (requestedTake ? practiced : filtered).find(sentence => sentence.id === selectedId) ?? filtered[0] ?? null;
  const sentenceTakes = results.takes.filter(take => take.sentenceId === reviewSentence?.id);
  const take = sentenceTakes.find(item => item.id === requestedTake) ?? sentenceTakes.find(item => item.key === selectedTakeKey) ?? sentenceTakes[0] ?? null;
  useEffect(() => {
    if (!['requesting','recording','stopping'].includes(recording.state.phase) && mode === 'review' && reviewSentence && reviewSentence.id !== sentenceId) setSentenceId(reviewSentence.id);
  }, [mode, reviewSentence, sentenceId, recording.state.phase]);
  const replayUrl = take?.url ?? (replay?.key === take?.key ? replay?.url : null);
  useAudioWordClock(referenceAudio, references.url, referenceClock, Boolean(references.url), (selected?.startMs ?? 0)/1000);
  useAudioWordClock(takeAudio, replayUrl ?? null, learnerClock, mode === 'review');
  useEffect(() => { replayRequest.current?.abort(); takeAudio.current?.pause(); setReplay(null);
    if (replayObjectUrl.current) { URL.revokeObjectURL(replayObjectUrl.current); replayObjectUrl.current = null; }
  }, [take?.key]);
  async function playTake() {
    if (!take || !persistence) return;
    stopPlayback(); setError('');
    if (replayUrl && takeAudio.current) { try { await takeAudio.current.play(); } catch { setError('Your take could not play. Please retry.'); } return; }
    if (!take.id || take.recordingState !== 'ready') return;
    replayRequest.current?.abort(); const request = new AbortController(); replayRequest.current = request;
    try {
      const blob = await persistence.api.audio(take.id, request.signal); if (request.signal.aborted) return;
      const url = URL.createObjectURL(blob); replayObjectUrl.current = url; setReplay({key: take.key, url});
      if (takeAudio.current) { takeAudio.current.src = url; await takeAudio.current.play(); }
    } catch (cause) { if (!request.signal.aborted) setError(cause instanceof Error ? cause.message : 'Your take could not play.'); }
  }
  async function playReference() {
    if (referencePlaying) { stopPlayback(); return; }
    stopPlayback();
    if (references.url && referenceAudio.current) { referenceAudio.current.currentTime = 0; referenceAudio.current.playbackRate = rate;
      try { await referenceAudio.current.play(); } catch { setError('Reference playback was blocked. Try again.'); }
    } else if (reviewSentence) player.current?.playRange(reviewSentence.startMs/1000, reviewSentence.endMs/1000, {loop: false});
  }
  function selectTake(key: string) {
    stopPlayback();setSelectedTakeKey(key);
    const url = new URL(window.location.href), item = results.takes.find(t => t.key === key || t.id === key);
    if(item?.id)url.searchParams.set('takeId', item.id);else url.searchParams.delete('takeId');
    if(reviewSentence)url.searchParams.set('sentenceId', reviewSentence.id);
    window.history.replaceState(null,'',url);window.dispatchEvent(new Event('libitu:stage-two-location'));
  }
  function selectReview(id: string) { if (recording.isBusy()) return; stopPlayback(); replaceStageTwoLocation({segmentId: segment.id, sentenceId: id}); setSentenceId(id); setSelectedTakeKey(null); setError(''); }
  const roundTakes = run.ids.flatMap(id => { const item = results.takes.find(t => t.key === run.takes[id]); return item ? [item] : []; });
  const need = roundTakes.filter(item => ['close','redo','failed','unchecked'].includes(statusOf(item))).map(item => item.sentenceId);
  const running = !['idle','done'].includes(phase);
  const duration = selected ? repeatDuration(selected) : 1;
  const fraction = phase === 'preparing' ? preparationSeconds / 2 : phase === 'recording' ? Math.max(0,1-recording.state.elapsedMs/duration)
    : phase === 'listening' && selected ? Math.min(1, Math.max(0,(time*1000-selected.startMs)/(selected.endMs-selected.startMs))) : 0;
  const showVideo = mode === 'review' ? !references.url && referencePlaying : running && (phase === 'listening' ? listenSource.current === 'video' : !references.url);

  return <section hidden={!active} className={`stage-two-shadow ${practiceStyles.workspace} ${styles.workspace}`} aria-label="Stage 2 quick shadowing" data-analysis-mode={mode}>
    <header className={`stage-two-shadow-header ${styles.header}`}>
      <div><div className="section-label">Stage 2 · Shadow</div><h1>{segment.title}</h1><p>{title} · {clock(segment.startMs ?? 0)} – {clock(segment.endMs ?? 0)}</p></div>
      {modes}<DirectionButton variant="secondary" className="stage-two-shadow-back" onClick={leave}><ArrowLeft aria-hidden="true"/> Back to segments</DirectionButton>
    </header>
    <div className={mode === 'review' ? 'stage-two-practice-layout' : styles.body} data-directory-collapsed={collapsed}>
      {mode === 'review' ? <SentenceDirectory label="Practiced sentences" title="Practiced"
        summary={`${practiced.length} practiced in this segment`} position={reviewSentence ? sentences.indexOf(reviewSentence) + 1 : null} total={sentences.length}
        collapsed={collapsed} listId={directoryId} toggleLabel={collapsed ? 'Expand review list' : 'Collapse review list'}
        onToggle={() => setCollapsed(value => !value)}
        controls={!collapsed ? <div className={styles.filters}>{(['all','need','matched'] as const).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? 'All' : value === 'need' ? 'Needs work' : 'Matched'}</button>)}</div> : null}>
        <ol id={directoryId}>
          {filtered.map(sentence => {const item = latestTakes.get(sentence.id)!; const number = sentences.indexOf(sentence) + 1; return <li key={sentence.id}>
            <button type="button" aria-current={reviewSentence?.id === sentence.id ? 'true' : undefined}
              aria-label={`Sentence ${number}`} onClick={() => selectReview(sentence.id)} title={sentence.text} data-practiced="true">
              <span className="stage-two-sentence-number">{number}</span>
              <span className="stage-two-sentence-copy">
                <small className="shadow-directory-status">{statusOf(item)} · {results.takes.filter(t => t.sentenceId === sentence.id).length} takes</small>
                <span className="shadow-directory-text">{sentence.text}</span>
                <span className={styles.heat} aria-label="Word matching overview">{item.analysis?.word_check?.operations.filter(op => op.source_index !== null).map((op,index) => <i key={index} data-kind={op.kind}/>)}</span>
                <small>~{clock(sentence.startMs)} – {clock(sentence.endMs)}</small>
              </span>
            </button>
          </li>;})}
        </ol>
        {!filtered.length && !collapsed ? <p className="shadow-directory-empty">No sentences in this filter.</p> : null}
      </SentenceDirectory> : null}
      <main className={mode === 'review' ? 'stage-two-practice-main' : styles.main}>
        <div className={`${styles.inner} ${mode === 'review' ? 'shadow-workspace-content' : ''}`}>
          {mode === 'quick' && phase === 'idle' ? <>
            <div><h2>Quick shadowing</h2><p className={styles.intro}>Listen to each sentence, then say it right away. Keep practicing while analysis runs in the background. The details are waiting in Review.</p></div>
            <div className={styles.setup}>
              <div><span>This run</span><p>Sentences {first+1}–{last+1} · {queue.length} to practice <small>· {last-first+1-queue.length} short ones skipped · about {Math.ceil(queue.reduce((sum,s) => sum+(s.endMs-s.startMs)*(1/rate+2),0)/60000)} min</small></p><button onClick={() => setChooseRange(!chooseRange)}>Change</button></div>
              {chooseRange ? <div className={styles.range}><label>First sentence<input type="number" min={1} max={last+1} value={first+1} onChange={event => setFirst(Math.max(0,Math.min(last,Number(event.target.value)-1)))}/></label><label>Last sentence<input type="number" min={first+1} max={sentences.length} value={last+1} onChange={event => setLast(Math.max(first,Math.min(sentences.length-1,Number(event.target.value)-1)))}/></label><label><input type="checkbox" checked={skipShort} onChange={event => setSkipShort(event.target.checked)}/>Skip sentences under 4 words</label></div> : null}

              <div><span>Speed</span><Choices<number> label="Playback speed" values={[0.75,1,1.25]} value={rate} onChange={setRate} labelOf={value => `${value}×`}/></div>
              <div><span>Time to repeat</span><p>2× the original sentence duration <small>· finish early with Done</small></p></div>
              <div><span>Text</span><Choices<TextSupport['mode']> label="Text support" values={['hidden','keywords','full'] as const} value={support} onChange={setSupport} labelOf={value => ({hidden:'Hidden',keywords:'Key words',full:'Full'})[value]}/></div>
              <div><span>After each sentence</span><Choices<boolean> label="Auto advance" values={[true,false]} value={auto} onChange={setAuto} labelOf={value => value ? 'Go on by itself' : 'Wait for me'}/></div>
            </div>
            <div className="stage-two-operation-footer"><AudioSettings analyze={persistence?.analyze ?? false} retain={retain} disabled={recording.isBusy()} onAnalyze={value => persistence?.setAnalyze(value)} onRetain={setRetain} /></div>
          </> : null}
          {mode === 'quick' && phase !== 'idle' ? <div><div className={styles.strip} aria-label="Round progress">{run.ids.map((id,index) => {const item = results.takes.find(t => t.key === run.takes[id]); return <span key={id} data-status={item ? statusOf(item) : run.skipped.includes(id) ? 'skipped' : index === run.index && running ? 'current' : 'empty'} title={`Sentence ${sentences.findIndex(s => s.id === id)+1}: ${item ? statusOf(item) : run.skipped.includes(id) ? 'skipped' : 'not recorded'}`}/>;})}</div><div className={styles.progressLabel}><span>Round {run.round} · {phase === 'done' ? 'complete' : `Sentence ${Math.min(run.index+1,run.ids.length)} of ${run.ids.length}`}</span><span>No scoring while you practice</span></div></div> : null}
          {active ? <div hidden={!showVideo} className={styles.video} data-dim={phase === 'recording'}><WorkspacePlayer ref={player} sourceUrl={sourceUrl ?? ''} title={title} wordClock={referenceClock}
            onReady={() => setVideoReady(true)} onTimeChange={value => {setTime(value); if (phaseRef.current === 'listening' && listenSource.current === 'video' && selected && value*1000 >= selected.endMs-30) listenEnded();}}
            onPlaybackChange={playing => {if (playing && recordingRef.current.isBusy()) {player.current?.pause(); return;} setReferencePlaying(playing);}}/>
          </div> : null}
          {active ? <audio ref={referenceAudio} src={references.url ?? undefined} preload="auto" onPlay={() => setReferencePlaying(true)} onPause={() => setReferencePlaying(false)} onEnded={listenEnded} onTimeUpdate={event => setTime((selected?.startMs ?? 0)/1000+event.currentTarget.currentTime)} onError={() => {if (phaseRef.current === 'listening') {pauseRun();setError('Reference audio could not play. Open Detailed to prepare it again.');}}}/> : null}
          {mode === 'quick' && running && selected ? <>
            {references.url && (phase !== 'listening' || listenSource.current === 'reference') ? <div className={styles.referenceBar}><i/>Reference audio · video stays hidden</div> : null}
            <div className={styles.practice}>
              <span className={styles.phase} data-phase={phase}>{({loading:'GETTING READY',listening:'LISTEN',preparing:'GET READY',requesting:'MICROPHONE',recording:'YOUR TURN',saving:'SAVING',gap:'TAKE RECORDED',wait:'TAKE RECORDED',paused:'PAUSED',idle:'',done:''})[phase]}</span>
              <PracticePrompt sentence={selected} mode={support} revealed={revealed} onReveal={reveal} clock={referenceClock}/>
              <div className={styles.timer} role="progressbar" aria-label={phase === 'preparing' ? 'Preparation countdown' : phase === 'recording' ? 'Recording time remaining' : 'Sentence playback'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(fraction*100)} data-recording={phase === 'recording'}><i style={{width:`${fraction*100}%`}}/></div>
              {phase === 'preparing' ? <p role="status" aria-live="polite">Recording starts in {preparationSeconds}…</p> : phase === 'recording' ? <><RecordingWaveform stream={recording.recorder.getActiveStream()}/><p>{Math.ceil(Math.max(0,duration-recording.state.elapsedMs)/1000)} seconds left · finish early with Done</p></> : <p className={styles.muted}>{phase === 'paused' ? 'Resume replays this sentence. Unfinished recording is discarded; completed takes are kept.' : phase === 'requesting' ? 'Allow microphone access to continue, or pause to cancel.' : phase === 'listening' ? 'Listen, then say it back. Click a covered word to peek.' : phase === 'wait' ? 'Go on when you are ready.' : 'Please wait…'}</p>}
              <div className={`${styles.actions} ui-button-group`}>
                {phase === 'recording' ? <Button variant="primary" size="lg" onClick={() => {setPhase('saving');recording.recorder.stop();}}><Check size={16}/>Done</Button> : null}
                {phase === 'paused' ? <Button variant="primary" size="lg" disabled={!persistence?.outbox.canRecord()} onClick={resume}><Play size={16}/>Resume</Button> : null}
                {phase === 'wait' ? <Button variant="primary" size="lg" onClick={() => advance()}>Next sentence <ChevronRight size={16}/></Button> : null}
                {['loading','listening','preparing','requesting','recording','gap'].includes(phase) ? <Button variant="secondary" onClick={pauseRun}><Pause size={16}/>Pause</Button> : null}
                {!['saving','gap','paused'].includes(phase) ? <Button variant="secondary" onClick={redo}><RotateCcw size={16}/>Redo</Button> : null}
                {['loading','listening','preparing','requesting','paused'].includes(phase) ? <Button variant="secondary" onClick={() => {recording.recorder.cancel();advance(true);}}><SkipForward size={16}/>Skip</Button> : null}
                {phase === 'paused' ? <Button variant="secondary" onClick={endRun}>End run</Button> : null}
              </div>
              {['paused','wait'].includes(phase) ? <Choices<TextSupport['mode']> label="Text support" values={['hidden','keywords','full'] as const} value={support} onChange={value => {setSupport(value);setRevealed([]);}} labelOf={value => ({hidden:'Hidden',keywords:'Key words',full:'Full'})[value]}/> : null}
              {['listening','paused','wait'].includes(phase) ? <details className={styles.audioSettings}><summary>Settings · {rate}×</summary><Choices<number> label="Playback speed" values={[0.75,1,1.25]} value={rate} onChange={value => {if (phase === 'listening') pauseRun();setRate(value);}} labelOf={value => `${value}×`}/><p>Time to repeat: 2× the original sentence duration.</p><Choices<boolean> label="Auto advance" values={[true,false]} value={auto} onChange={setAuto} labelOf={value => value ? 'Go on by itself' : 'Wait for me'}/></details> : null}
            </div>
          </> : null}
          {mode === 'quick' && phase === 'done'  ? <div className={styles.summary}><h2>Round {run.round} done</h2><div className={styles.counts}>{(['matched','close','redo'] as const).map(status => <div key={status} data-status={status}><b>{roundTakes.filter(t => statusOf(t) === status).length}</b><span>{status === 'redo' ? 'to redo' : status}</span></div>)}</div><p>{roundTakes.filter(t => statusOf(t) === 'pending').length} pending · {roundTakes.filter(t => ['failed','unchecked'].includes(statusOf(t))).length} unchecked or failed · {run.ids.length-roundTakes.length} skipped or not recorded</p><p className={styles.muted}>Word matching and acoustic analysis finish in the background. Open Review for each take’s status.</p><div className={`${styles.actions} ui-button-group`}><Button variant="primary" size="lg" onClick={() => startRun(need.length ? need : run.ids,run.round+1)}>{need.length ? `Practice the ${need.length} that need work` : 'Run again'}</Button><Button variant="secondary" size="lg" onClick={() => onMode('review')}>Review details</Button></div><button onClick={() => setPhase('idle')}>Change run settings</button><button onClick={onBack}>Back to segments</button></div> : null}
          {mode === 'review' ? <>
            {results.history.loading && !take ? <ContentSkeleton label="Loading saved takes…" rows={2} /> : null}
            {results.history.error ? <p className="ui-retry-notice" role="alert">{results.history.error} <Button variant="secondary" size="md" onClick={results.retryHistory}>Retry history</Button></p> : null}
            {take && reviewSentence ? <>
              <div className="stage-two-sentence-navigation"><Button variant="secondary" disabled={filtered.indexOf(reviewSentence) === 0} onClick={() => selectReview(filtered[filtered.indexOf(reviewSentence)-1].id)}><ChevronLeft size={16}/>Previous</Button><span>Sentence {sentences.indexOf(reviewSentence)+1} · ~{clock(reviewSentence.startMs)}</span><Button variant="secondary" disabled={filtered.indexOf(reviewSentence) === filtered.length-1} onClick={() => selectReview(filtered[filtered.indexOf(reviewSentence)+1].id)}>Next<ChevronRight size={16}/></Button></div>
              <section className="shadow-practice-flow" aria-label="Take review">
              <PracticeOutcome key={`outcome:${take.key}`} data={take.analysis ?? null} text={reviewSentence.text} loading={Boolean(take.id && !take.loaded)} pendingSave={!take.id} requested={take.requested} api={persistence?.api} takeId={take.id} onMarked={() => results.refresh(take.key)}/>
              <div className="shadow-practice-actions ui-button-group"><Button variant="secondary" size="lg" onClick={() => void playReference()} disabled={take.analysis?.result?.comparison !== 'available' || references.loading || !references.url && !sourceUrl}>{referencePlaying ? <Pause size={16}/> : <Play size={16}/>}Reference</Button><Button variant="secondary" size="lg" onClick={() => void playTake()} disabled={!replayUrl && (!take.id || take.recordingState !== 'ready')}><Play size={16}/>My take</Button><Button variant="primary" size="lg" onClick={() => startRun([reviewSentence.id])}>Practice again</Button>{take.durationMs != null ? <span className="stage-two-recording-timer" aria-label="Recording duration">{Math.floor(take.durationMs/60000)}:{String(Math.floor(take.durationMs/1000)%60).padStart(2,'0')}</span> : null}</div>
              {!replayUrl && take.recordingState !== 'ready' ? <p className={styles.muted}>Audio was not retained, or this temporary replay has expired. Enable recording retention before your next run for later playback.</p> : null}
              <audio ref={takeAudio} src={replayUrl ?? undefined} onError={() => setError('Your take could not play. Try again or record a new take.')}/>

              </section>
              <QuickReviewAnalysis key={`analysis:${take.key}`} content={contentId} sentence={reviewSentence} take={take} api={persistence?.api} reload={() => results.refresh(take.key)} playback={{reference:referenceClock,yours:learnerClock,referenceOffsetMs:reviewSentence.startMs}} takeControls={<div className={styles.takes} role="group" aria-label="Saved take">{sentenceTakes.map((item,index) => <button className="analysis-chip" key={item.key} aria-pressed={item.key === take.key} onClick={() => selectTake(item.key)}>Take {sentenceTakes.length-index} · {new Date(item.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}{item.durationMs ? ` · ${(item.durationMs/1000).toFixed(1)}s` : ''}{item.loaded && item.analysis?.result?.comparison !== 'available' ? ' · no Reference' : ''}</button>)}</div>}/>
              <PracticeHistory selectedAnalysis={take.analysis} onAnalysisChanged={()=>results.refresh(take.key)} key={reviewSentence.id} contentId={contentId} sentenceId={reviewSentence.id} selectedAnalysisId={take.id} onAnalysisSelect={id=>{if(id)selectTake(id);}} onViewAnalysis={selectTake} blocked={recording.isBusy()} onPlay={stopPlayback} playbackClock={learnerClock} onRecordDeleted={id=>{results.remove(id);if(take.id===id){const url=new URL(window.location.href);url.searchParams.delete('takeId');window.history.replaceState(null,'',url);window.dispatchEvent(new Event('libitu:stage-two-location'));setSelectedTakeKey(null);}}}/>
            </> : !results.history.loading ? <div className={styles.empty}><h2>{practiced.length ? 'Nothing in this filter' : 'Nothing to review yet'}</h2><p>Run Quick shadowing. Your takes and their analysis will appear here.</p><Button variant="primary" onClick={() => onMode('quick')}>Go to Quick shadowing</Button></div> : null}
          </> : null}
          {error ? <p className="ui-retry-notice" role="alert">{error}</p> : null}
          {references.error && phase === 'idle' ? <p className={styles.muted}>Reference audio is unavailable. You can use video playback or prepare it in Detailed.</p> : null}
          {active && persistence?.state.errors.length ? <p className="ui-retry-notice" role="alert">Some takes still need saving. Keep this page open. <Button variant="secondary" size="md" onClick={() => persistence.outbox.retry()}>Retry saves</Button></p> : null}
          {timingRecovery}
        </div>
      </main>
    </div>
    {mode === 'quick' && phase === 'idle' ? <footer className={styles.startFooter}>
      <div><Button variant="primary" size="lg" disabled={!queue.length || !persistence?.outbox.canRecord() || !sourceUrl} onClick={() => startRun(queue.map(s => s.id))}><Play size={16}/> Start</Button><p className={styles.muted}>After each sentence, get ready for 2 seconds before recording. Pause discards the unfinished take.</p>{!persistence ? <p>Sign in to save takes and start Quick shadowing.</p> : null}</div>
    </footer> : null}
  </section>;
}
function Choices<T extends string | number | boolean>({label, values, value, onChange, labelOf}: {label: string; values: readonly T[]; value: T; onChange(value: T): void; labelOf(value: T): string}) {
  return <div className={styles.choices} role="group" aria-label={label}>{values.map(item => <button key={String(item)} type="button" aria-pressed={item === value} onClick={() => onChange(item)}>{labelOf(item)}</button>)}</div>;
}
