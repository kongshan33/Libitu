'use client';
import { Button } from '@/components/ui/button';
import { useId, useMemo, useState } from 'react';
import type { ComparisonView } from '../comparison/view';
import { allSound, soundMarks, type SoundFilter } from '../sound/phenomena';
import styles from './SoundComparison.module.css';
import { SoundLink, SoundMore, SoundWordCues } from './SoundCue';
import { SoundDetails, SoundEmpty, SoundFilters } from './SoundExplorer';

const voices = ['reference', 'yours'] as const;
const voiceName = (voice:typeof voices[number]) => voice==='reference'?'Reference':'Your voice';

export function SoundComparison({view,concealed,onConcealedChange,filter=allSound,onFilterChange}:{
  filter?:SoundFilter;onFilterChange(value:SoundFilter):void;
  view:ComparisonView;concealed:boolean;onConcealedChange?(value:boolean):void;
}) {
  const [revealed,setRevealed]=useState<number[]>([]);
  const [selected,setSelected]=useState<number|null>(null);
  const [selectedMark,setSelectedMark]=useState<string|null>(null);
  const [selectedVoice,setSelectedVoice]=useState<typeof voices[number]>('reference');
  const [expandedMore,setExpandedMore]=useState<string|null>(null);
  const explanationId=useId();
  const marks=useMemo(()=>soundMarks(view),[view]);
  const allowed=(index:number)=>!concealed||revealed.includes(index);
  const safeMarks=marks.filter(m=>Array.from({length:m.end-m.start},(_,i)=>m.start+i).every(allowed));
  const close=()=>{setSelected(null);setSelectedMark(null);setExpandedMore(null);};
  return <div className={styles.root}>
    <SoundFilters filter={filter} onChange={value=>{onFilterChange(value);setSelectedMark(null);setExpandedMore(null);}} marks={marks} concealed={concealed}/>
    {!concealed?<SoundEmpty marks={marks} filter={filter}/>:null}
    <div className={styles.revealBar}>
      <span className={styles.mono}>Learning target · General American · {concealed?'tap a covered word to peek':'select a word or linking arc for its explanation'}</span>
      <Button variant="secondary" type="button" aria-pressed={concealed} onClick={()=>{setRevealed([]);close();onConcealedChange?.(!concealed);}}>{concealed?'Show text':'Hide text'}</Button>
      {concealed?<small className={styles.mono} role="status">{revealed.length} / {view.reference.words.length} revealed</small>:null}
    </div>
    {voices.map(voice=><div key={voice} className={styles.comparison} data-sound-voice={voice}>
      <div className={styles.voiceHeading}><h3>{voiceName(voice)}</h3><span className={styles.mono}>{voice==='reference'?'Reading cues · GA conditions':'Practice targets · not checked'}</span></div>
      <div className={`${styles.words} sound-word-flow`} role="group" aria-label={`${voiceName(voice)} sound cues`}>
        {view.reference.words.map((word,i)=>{
          const covered=!allowed(i),link=safeMarks.find(m=>m.kind==='linking'&&m.start===i);
          return <div key={i} className={`${styles.wordGroup} sound-word-group`} data-word-index={i}>
            <button type="button" className={`${styles.word} sound-word-card`} aria-pressed={selectedVoice===voice&&selected===i&&!covered&&!selectedMark}
              aria-label={covered?`Reveal word ${i+1} · ${voiceName(voice)}`:`Explore ${word.text}, word ${i+1} · ${voiceName(voice)}`} aria-controls={explanationId}
              onClick={()=>{if(covered)setRevealed(items=>items.includes(i)?items:[...items,i]);setSelected(i);setSelectedVoice(voice);setSelectedMark(null);setExpandedMore(null);}}>
              <span className="sound-word-ipa">{!covered&&word.ipa?word.ipa:''}</span>
              <strong className={covered?styles.peek:undefined} aria-hidden={covered||undefined}><span>{word.text}</span></strong>
              <span className="sound-word-marks">{!covered?<SoundWordCues marks={safeMarks} index={i} filter={filter}/>:null}</span>
            </button>
            {!covered?<SoundMore marks={safeMarks} index={i} filter={filter} word={word.text} voice={voiceName(voice)} controls={explanationId}
              expanded={expandedMore===`${voice}:${i}`} onToggle={()=>{if(expandedMore===`${voice}:${i}`)close();else{setSelected(i);setSelectedVoice(voice);setSelectedMark(null);setExpandedMore(`${voice}:${i}`);}}}/>:null}
            {link?<SoundLink mark={link} filter={filter} selected={selectedVoice===voice&&selectedMark===link.id} controls={explanationId} voice={voiceName(voice)}
              onSelect={()=>{if(selectedVoice===voice&&selectedMark===link.id)close();else{setSelected(i);setSelectedVoice(voice);setSelectedMark(link.id);setExpandedMore(null);}}}/>:null}
          </div>;
        })}
      </div>
      <p className={`${styles.mono} ${styles.status}`}>{voice==='reference'
        ?`${view.reference.evidence?.source==='unavailable'&&view.saved?'Reference analysis unavailable for this take. ':''}Text and dictionary cues · not checked in the reference recording.`
        :`${view.yours.status?`${view.yours.status} `:''}Targets from the same text · not checked in your recording.`}</p>
      {selected!==null&&selectedVoice===voice?<SoundDetails id={explanationId} view={view} marks={marks} index={selected} markId={selectedMark} allowed={allowed} filter={filter} voice={voice} expanded={expandedMore===`${voice}:${selected}`} onClose={close}/>:null}
    </div>)}
    {selected===null?<SoundDetails id={explanationId} view={view} marks={marks} index={null} allowed={allowed} filter={filter}/>:null}
  </div>;
}
