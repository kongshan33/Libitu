'use client';
import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ComparisonView } from '../comparison/view';
import type { ComparisonPlayback } from '../comparison/use-playing-word';
import type { PracticeAnalysis } from '../persistence/practice-api';
import { SoundComparison } from './SoundComparison';
import { LayerFocus } from './LayerFocus';
import { AnalysisTimeline } from './AnalysisTimeline';
import type { Phenomenon } from '../sound/phenomena';
import type { PracticeLayer } from './PracticeLayers';
import styles from './LayerAnalysis.module.css';
export type { ComparisonPlayback } from '../comparison/use-playing-word';
const descriptions = {
  sound:'Notice how the marked sounds connect in the sentence.',
  rhythm:'Compare relative prominence and word timing, phrase by phrase.',
  melody:'Follow the rise and fall of each voice, centered on its own median pitch.',
};
export function LayerComparison({ layer, view, data = null, sentenceId = '', concealed = false, onConcealedChange, playbackActions, playback }: {
  layer:PracticeLayer; view:ComparisonView; data?:PracticeAnalysis|null; sentenceId?:string; concealed?:boolean;
  onConcealedChange?(v:boolean):void; playback?:ComparisonPlayback; playbackActions?:ReactNode;
}) {
  const [soundFilter, setSoundFilter] = useState<Phenomenon|'all'>('all');
  const [notes, setNotes] = useState(false);
  const notesId = useId();
  return <section className={`${styles.layer}${layer === 'sound' ? ' layer-comparison-sound' : ''}`} aria-label={`${view.saved?'Saved':'Current'} ${layer} word comparison`}>
    <div className={styles.heading}><div><h2>{layer === 'sound' ? 'Sound layer' : layer[0].toUpperCase()+layer.slice(1)}</h2><p>{descriptions[layer]}</p></div>
      <Button variant="secondary" aria-expanded={notes} aria-controls={notesId} onClick={() => setNotes(v => !v)}>{layer === 'sound' && notes ? 'Hide notes' : 'Notes'}<ChevronDown size={14} style={{ transform:notes?'rotate(180deg)':undefined }}/></Button></div>
    {notes ? <LayerFocus id={notesId} layer={layer} view={view} soundFilter={soundFilter} concealed={concealed}/> : null}
    {layer === 'sound' ? <div className={styles.soundWorkspace}>
      <SoundComparison filter={soundFilter} onFilterChange={setSoundFilter} view={view} concealed={concealed} onConcealedChange={onConcealedChange}/>
    </div>
      : <>{layer === 'melody' && playbackActions ? <div className={styles.playback}>{playbackActions}</div> : null}<AnalysisTimeline view={view} data={data} layers={[layer]} sentenceId={sentenceId} playback={playback}/></>}
  </section>;
}
