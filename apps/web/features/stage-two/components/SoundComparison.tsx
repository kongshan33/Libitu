"use client";

import { Button } from "@/components/ui/button";

import { useMemo, useState } from 'react';
import type { ComparisonView } from '../comparison/view';
import { emptyPhenomenon, phenomena, soundMarks, visibleSoundMarks, type Phenomenon } from '../sound/phenomena';
import styles from './SoundComparison.module.css';
import { SoundBadge, SoundLink } from './SoundCue';

export function SoundComparison({view,concealed,onConcealedChange,filter,onFilterChange}:{
  filter:Phenomenon|'all';onFilterChange(value:Phenomenon|'all'):void;
  view:ComparisonView;concealed:boolean;onConcealedChange?(value:boolean):void;
}) {
  const [revealed,setRevealed]=useState<number[]>([]);
  const marks=useMemo(()=>soundMarks(view),[view]);
  // Keep the default text reading stable when acoustic results arrive. Dense
  // measurements belong to their explicit filter, not every word in All.
  const visible=visibleSoundMarks(marks,filter);
  const displayed=marks.filter(mark=>mark.kind!=='vowel_length'||filter==='vowel_length');
  const count=view.reference.words.length;
  return <div className={styles.root}>
    <div className={styles.filters} role="group" aria-label="Sound phenomenon filters">
      <button type="button" aria-pressed={filter==='all'} onClick={()=>onFilterChange('all')}>All</button>
      {phenomena.map(p=><button key={p.id} type="button" aria-label={p.label} data-phenomenon={p.id} aria-pressed={filter===p.id}
        onClick={()=>onFilterChange(p.id)}><span aria-hidden="true">{p.symbol}</span> {p.label}</button>)}
    </div>
    <div className={styles.revealBar}>
      <span className={styles.mono}>Shadow mode · {concealed?'click a covered word to peek':'hover a reference word for IPA'}</span>
      <Button variant="secondary" type="button" aria-pressed={concealed} onClick={()=>{setRevealed([]);onConcealedChange?.(!concealed);}}>{concealed?'Show text':'Hide text'}</Button>
      {concealed?<small className={styles.mono} role="status">{revealed.length} / {count} revealed</small>:null}
    </div>
    <div className={styles.comparison}>
      {[view.reference,view.yours].map((voice,v)=><div key={v} className={`${styles.voice} paired-${v?'learner':'reference'}`}>
        <div className={styles.voiceHeading}><h3>{v?'Your voice':'Reference'}</h3>
          <span className={styles.mono}>{v?'dashed with “?” = not yet evaluated':'possible readings from the text'}</span></div>
        <div className={`${styles.words} sound-word-flow`} aria-label={`${v?'Your voice':'Reference'} sound-marked text`}>
          {voice.words.map((word,i)=>{
            const covered=concealed&&!revealed.includes(i);
            const targets=displayed.filter(m=>i>=m.start&&i<m.end);
            const linking=targets.find(m=>m.kind==='linking'&&i<m.end-1);
            const badges=phenomena.filter(p=>p.id!=='linking'&&targets.some(m=>m.kind===p.id));
            return <div key={i} className={`${styles.wordGroup} sound-word-group`} data-word-index={i}>
              <div className={`${styles.word} sound-word-card`} tabIndex={!covered&&word.ipa?0:undefined}>
                <span className="sound-word-ipa">{!covered&&word.ipa?word.ipa:''}</span>
                {covered?<button type="button" className={styles.peek} aria-label={`Reveal word ${i+1}`}
                  style={{width:`${Math.max(3,word.text.length)}ch`}}
                  onClick={()=>setRevealed(items=>items.includes(i)?items:[...items,i])}><span aria-hidden="true">•••</span></button>:<strong>{word.text}</strong>}
                <span className="sound-word-marks">{!covered?badges.map(p=>{
                  const measured=p.id==='vowel_length'&&word.vowel!==null;
                  const note=measured?`${Math.round(word.vowel!)} ms vowel duration`:
                    `${p.label}: ${v?'practice target, not evaluated in your voice':'possible reading'}`;
                  return <SoundBadge key={p.id} kind={p.id} evidence={measured?'measured':'target'}
                    uncertain={Boolean(v&&!measured)} muted={filter!=='all'&&filter!==p.id}
                    title={`${note}. ${targets.filter(m=>m.kind===p.id).map(m=>m.description).join(' ')}`}>
                    {p.badge}{measured?` ${Math.round(word.vowel!)} ms`:v?'?':''}
                  </SoundBadge>;
                }):null}</span>
              </div>
              {!covered&&linking&&(!concealed||revealed.includes(i+1))?<SoundLink className={styles.link} uncertain={Boolean(v)} muted={filter!=='all'&&filter!=='linking'}
                title={`${linking.description} ${v?'Your voice: not evaluated.':''}`}/>:null}
              {!covered&&filter==='linking'&&word.pause!==null&&word.pause>0?<span className={`${styles.pause} sound-boundary-pause`}
                title="Measured silence at this word boundary; not a linking verdict" aria-label={`After ${word.text}: measured pause ${(word.pause/1000).toFixed(2)} seconds`}>
                <i aria-hidden="true"/>{(word.pause/1000).toFixed(2)} s
              </span>:null}
            </div>;
          })}
        </div>
        {voice.status?<p className={`${styles.mono} ${styles.status}`}>{voice.status}</p>:null}
      </div>)}
      {!visible.length?<p className={`${styles.mono} ${styles.status}`} role="status">{emptyPhenomenon(filter)}</p>:null}
    </div>
    <div className={`${styles.legend} sound-phenomenon-legend`} aria-label="Sound marker legend">
      {phenomena.map(p=><span key={p.id}><SoundBadge kind={p.id}/>{p.label}</span>)}
    </div>
    <p className={styles.footnote}>Colored marks are possible readings from the text. “?” means your voice has not been evaluated for that sound. Choose Vowel len. for measured vowel durations, or Linking for measured pauses.</p>
  </div>;
}
