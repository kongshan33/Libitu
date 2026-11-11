'use client';
import type { SoundSubtype } from '@libitu/types/stage-two';
import type { ComparisonView } from '../comparison/view';
import { allSound, emptyPhenomenon, markMatches, markSymbol, phenomena, phenomenon, soundCount, soundExamples, soundGroups, wordSoundCategories, type SoundFilter, type SoundMark } from '../sound/phenomena';
import { SoundBadge, SoundCategoryDot, SoundSymbol } from './SoundCue';
import styles from './SoundExplorer.module.css';

export function SoundFilters({filter,onChange,marks,concealed=false}:{filter:SoundFilter;onChange(value:SoundFilter):void;marks:SoundMark[];concealed?:boolean}) {
  const chosen=filter.kind==='all'?null:phenomenon(filter.kind);
  return <div className={styles.filters}>
    <div className={styles.groups} role="group" aria-label="Sound phenomenon filters">
      <button type="button" aria-pressed={filter.kind==='all'} aria-label="All reading cues" onClick={()=>onChange(allSound)}>All</button>
      {soundGroups.map(group=><div key={group} className={styles.group} role="group" aria-label={group}>
        <span className={styles.groupName}>{group}</span>
        {phenomena.filter(p=>p.group===group).map(p=>{const count=soundCount(marks,p.id);return <button key={p.id} type="button" data-phenomenon={p.id}
          data-empty={!concealed&&count===0} aria-label={p.label} title={`${p.description}${concealed?'':` · ${soundExamples[p.id]}`}`}
          aria-pressed={filter.kind===p.id} onClick={()=>onChange({kind:p.id,subtype:'all'})}>
          <SoundCategoryDot kind={p.id}/><SoundSymbol kind={p.id}/><span>{p.label}</span>
          {!concealed?<span className={styles.count} aria-label={`${count} candidate events`}>{count}</span>:null}
        </button>;})}
      </div>)}
    </div>
    {chosen?.id==='elision'?<div className={styles.subtypes} role="group" aria-label="Elision subtypes">
      <span className={styles.groupName}>Subtype</span>{[{id:'all',label:'All elision'},...chosen.subtypes].map(sub=><button key={sub.id} type="button"
        aria-pressed={filter.subtype===sub.id} onClick={()=>onChange({kind:'elision',subtype:sub.id as SoundSubtype|'all'})}>{sub.label}</button>)}
    </div>:null}
    {chosen?<p className={styles.caption}>{chosen.description}{!concealed?<> · {soundExamples[chosen.id]}</>:null}</p>:null}
  </div>;
}
export function SoundScope() {
  return <p className={styles.caption}>Learning target · General American. The source accent has not been identified. Reading cues come from text and dictionary rules, not a judgment of either recording.</p>;
}
export function SoundEmpty({marks,filter}:{marks:SoundMark[];filter:SoundFilter}) {
  return marks.some(mark=>markMatches(mark,filter))?null:<p className={styles.caption} role="status">{emptyPhenomenon(filter.kind,filter.subtype)}</p>;
}

export function SoundNotes({view,concealed=false}:{view:ComparisonView;concealed?:boolean}) {
  return <div className={styles.notes}>
    <SoundScope/>
    <p>Full forms and separate sounds can be valid under emphasis or careful speech. A missing suggestion does not mean a phenomenon is absent. No sound accuracy score is assigned.</p>
    <p>GA is rhotic: an existing /r/ can connect to a vowel through ordinary Linking. Intrusive R is not a GA learning target. Unaspirated /p, t, k/ after /s/ are not automatically voiced.</p>
    <p>Dictionary /slashes/ give a broad reference; [brackets] show a possible realization. Word stress is not sentence emphasis. A phone anchor refers to the dictionary, not an aligned letter or audio interval.</p>
    <details><summary>More GA pronunciation notes</summary>
      <p>Aspiration is the breath release often heard after /p, t, k/ at the start of a stressed syllable. The reduced aspiration after /s/ is different from changing voicing.</p>
      <p>Dark L involves a raised tongue back; it is common in GA. L vocalization loses the tongue-tip contact and is a separate, speaker-dependent variation, not a required substitution.</p>
      <p>A vowel may become nasalized near a nasal consonant. That resonance does not by itself show that the consonant was deleted.</p>
      <p>R coloring affects vowel quality. GA retains postvocalic /r/; its precise articulation varies. Yod-dropping concerns the absence of /j/ in certain lexical pronunciations, rather than fusion across a word boundary.</p>
      <p>The -ing ending has style- and speaker-dependent variants. A [ŋ] to [n] change is not evidence of deleting a separate /g/.</p>
      <p>Vowel quality includes tongue and lip position. Ship/sheep and full/fool cannot be taught or evaluated from length alone. These notes do not classify either recording. Vowel length cues compare the same vowel before a word-final voiceless or voiced consonant under similar conditions; they are not audio measurements.</p>
    </details>
    {view.sound&&!concealed?<details><summary>Dictionary coverage and limits</summary><p>{view.sound.coverage.known} / {view.sound.coverage.total} words have one dictionary reading · {view.sound.lexicon_version}</p>
      <ul>{view.sound.tokens.filter(t=>t.status!=='known').map(t=><li key={t.index}>{t.text}: {t.status==='unknown'?'pronunciation unavailable':`multiple readings: ${t.ipa.join(' / ')}`}</li>)}</ul>
      {view.sound.warnings.map((warning,i)=><p key={i}>{warning}</p>)}</details>:null}
    {concealed?<p>Show the text to see word-specific dictionary notes.</p>:null}
  </div>;
}

export function SoundDetails({view,marks,index,allowed,filter,markId,id,onClose,voice,expanded=false}:{
  view:ComparisonView;marks:SoundMark[];index:number|null;allowed?(index:number):boolean;filter:SoundFilter;
  markId?:string|null;id:string;onClose?():void;voice?:'reference'|'yours';expanded?:boolean;
}) {
  const visible=index!==null&&Boolean(view.reference.words[index])&&(!allowed||allowed(index));
  const selected=visible?marks.filter(m=>index!>=m.start&&index!<m.end&&(!markId||m.id===markId)
    &&Array.from({length:m.end-m.start},(_,i)=>m.start+i).every(i=>!allowed||allowed(i))):[];
  const matching=selected.filter(m=>markMatches(m,filter));
  const sorted=[...matching,...selected.filter(m=>!matching.includes(m))];
  return <section id={id} className={styles.details} aria-label="Sound explanation">
    <div className={styles.detailHeading}><h3>Explanation</h3><span className={styles.source}>Text rule · {view.sound?.version??'dictionary'}</span>
      {index!==null&&onClose?<button type="button" onClick={onClose} aria-label="Close sound explanation">×</button>:null}</div>
    {visible&&expanded?<ul role="list" className={styles.expandedCues} aria-label={`All sound categories: ${view.reference.words[index!].text}`}>
      {wordSoundCategories(selected,index!,filter).map(mark=><li key={mark.kind}><SoundBadge kind={mark.kind}>{markSymbol(mark)}</SoundBadge><span>{phenomenon(mark.kind).label}</span></li>)}
    </ul>:null}
    {!visible?<p className={styles.caption}>{index===null?'Select a marked word or linking arc to see its conditions.':'Reveal this word to read its explanation.'}</p>:
      !sorted.length?<><p className={styles.caption}>No visible suggestions for this word. This sound has not been checked in the recording.</p>
        <dl className={styles.rows}><dt>Dictionary</dt><dd>{view.reference.words[index!].ipa??'Pronunciation unavailable.'}</dd></dl></>:
      sorted.map((mark,i)=>{const c=mark.candidate!,p=phenomenon(mark.kind);
        const alternatives=selected.filter(m=>m.id!==mark.id&&c.alternative_group&&m.candidate?.alternative_group===c.alternative_group);
        const rows=<dl className={styles.rows}>
          <dt>Text position</dt><dd>“{c.source_text}” · {mark.end-mark.start===1?`word ${mark.start+1}`:`words ${mark.start+1}–${mark.end}`}
            {c.anchor?.type==='phone'?` · dictionary phone ${(c.anchor.phone_index??0)+1}`:c.anchor?.type==='boundary'?' · word boundary':''}</dd>
          <dt>Dictionary</dt><dd>{view.sound?.tokens.slice(mark.start,mark.end).map(t=>`${t.text} ${t.ipa.join(' / ')||'(unavailable)'}`).join(' · ')}</dd>
          <dt>Possible reading</dt><dd>{mark.kind==='vowel_length'?c.explanation:<><span className={styles.phones}>{c.phonemes_before} → {c.phonemes_after}</span><p>{c.explanation}</p></>}
            {alternatives.length?<p>Alternative readings: {alternatives.map(m=>`${phenomenon(m.kind).label} ${m.candidate?.phonemes_after}`).join(' or ')}. These are alternatives for the same event, not simultaneous observations.</p>:null}</dd>
          <dt>Conditions</dt><dd><ul>{c.conditions.map((condition,n)=><li key={n}>{condition}</li>)}</ul></dd>
          <dt>Listen for</dt><dd>{p.listen}</dd><dt>Shadowing tip</dt><dd>{p.practice}</dd>
          <dt>Evidence</dt><dd>{voice==='reference'?'Candidate from text and dictionary · not checked in the reference recording.':voice==='yours'?'Practice target from text and dictionary · not checked in your recording.':'Candidate from text and dictionary · not checked in either recording.'}</dd>
        </dl>;
        return sorted.length===1?<div key={mark.id}>{rows}</div>:<details key={`${index}:${mark.id}`} className={styles.reading} open={i===0}>
          <summary>{p.label} · {markSymbol(mark)}</summary>{rows}</details>;
      })}
  </section>;
}
