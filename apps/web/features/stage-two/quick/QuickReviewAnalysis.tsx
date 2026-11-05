'use client';
import { useMemo, useState, type ReactNode } from 'react';
import { LockKeyhole } from 'lucide-react';
import type { SentenceUnit } from '@libitu/types/stage-two';
import type { PracticeApi } from '../persistence/practice-api';
import { useSoundGuide } from '../sound/use-sound-guide';
import { comparisonView } from '../comparison/view';
import { layerPresentation } from '../practice/layer-presentation';
import { practiceLayers, type PracticeLayer } from '../components/PracticeLayers';
import { AnalysisTimeline } from '../components/AnalysisTimeline';
import { PracticeAnalysisPanel } from '../components/PracticeAnalysisPanel';
import { Button } from '@/components/ui/button';
import type { QuickTake } from './use-quick-takes';
import styles from './QuickShadowing.module.css';
import type { ComparisonPlayback } from '../comparison/use-playing-word';

export function QuickReviewAnalysis({content,sentence,take,api,reload,takeControls,playback}:{
  content:string; sentence:SentenceUnit; take:QuickTake; api:PracticeApi|undefined; reload():void; takeControls:ReactNode;
  playback?:ComparisonPlayback;
}) {
  const [shown, setShown] = useState<PracticeLayer[]>(['sound','rhythm','melody']);
  const guide = useSoundGuide(content, sentence.id, sentence.text);
  const data = take.analysis ?? null, presentation = layerPresentation(data, true, false);
  const view = useMemo(() => comparisonView({sentence,guide:guide.data,data,server:null,reference:null,yours:null}), [sentence,guide.data,data]);
  const available = (layer:PracticeLayer) => presentation.visible && ['available','partial'].includes(presentation.statuses[layer].state);
  const hasAvailable = practiceLayers.some(({id}) => available(id));
  const pending = !take.id || !take.loaded || Boolean(data && ['awaiting_upload','queued','processing'].includes(data.state));
  const locked = Boolean(data?.word_check) && data?.state !== 'deleted' && data?.state !== 'cancelled' && practiceLayers.every(({id}) => presentation.locked[id]);
  return <div className="shadow-analysis-workspace">
    <PracticeAnalysisPanel api={api} attemptId={take.id} data={data} error={take.error??null} loading={Boolean(take.id&&!take.loaded)} reload={reload}/>
    {hasAvailable ? <section aria-label="Overview">
      <div className={styles.overviewHeading}><div><h2>Overview</h2></div>
        <div className={styles.overviewLayers} role="group" aria-label="Overview layers">{practiceLayers.map(({id,label}) => <button key={id} type="button" className="analysis-chip" aria-pressed={shown.includes(id) && available(id)} disabled={!available(id)}
          title={presentation.badges[id].title} onClick={() => setShown(current => current.includes(id) ? current.filter(item => item !== id) : [...current,id])}>{label}{presentation.locked[id] ? ' · Locked' : ''}</button>)}</div>
      </div>
      <div className={styles.takeSelection}><span>Take</span>{takeControls}</div>
      {guide.error ? <p className="ui-retry-notice" role="alert">{guide.error} <Button size="sm" onClick={guide.retry}>Retry sound guide</Button></p> : null}
      <AnalysisTimeline view={view} data={data} layers={shown.filter(available)} sentenceId={sentence.id} voiceControls playback={playback}/>
    </section> : !pending && !take.error && data?.state !== 'failed' ? <div className={styles.lockedOverview} role="status">
      {locked ? <LockKeyhole size={15} aria-hidden="true"/> : null}{locked ? 'Analysis locked' : 'Analysis unavailable'}
    </div> : null}
  </div>;
}
