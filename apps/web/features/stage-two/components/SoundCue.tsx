import type { ReactNode } from 'react';
import { markMatches, markSymbol, phenomenon, wordSoundCategories, type Phenomenon, type SoundFilter, type SoundMark } from '../sound/phenomena';
import styles from './SoundCue.module.css';

export function SoundSymbol({kind}:{kind:Phenomenon}) {
  return <span className={kind==='linking'?styles.arc:undefined} aria-hidden="true">{phenomenon(kind).symbol}</span>;
}
export function SoundCategoryDot({kind}:{kind:Phenomenon}) {
  return <span className={`${styles.palette} ${styles.dot}`} data-phenomenon={kind} aria-hidden="true"/>;
}
export function SoundBadge({kind,muted=false,title,children}:{kind:Phenomenon;muted?:boolean;title?:string;children?:ReactNode}) {
  return <span className={`sound-inline-badge ${styles.palette} ${styles.badge}`} data-phenomenon={kind}
    data-muted={muted} data-evidence="candidate" title={title??phenomenon(kind).label}>{children??phenomenon(kind).symbol}</span>;
}
export function SoundLink({mark,filter,selected=false,onSelect,controls,className='',voice}:{
  mark:SoundMark;filter:SoundFilter;selected?:boolean;onSelect():void;controls:string;className?:string;voice?:string;
}) {
  return <button type="button" className={`sound-link ${styles.palette} ${styles.link} ${className}`} data-phenomenon="linking"
    data-muted={!markMatches(mark,filter)} aria-label={`Explain linking: ${mark.candidate?.source_text??`words ${mark.start+1}–${mark.end}`}${voice?` · ${voice}`:''}`}
    aria-expanded={selected} aria-controls={controls} onClick={onSelect}>
    <SoundSymbol kind="linking"/><SoundBadge kind="linking">{markSymbol(mark)}</SoundBadge>
  </button>;
}
export function SoundWordCues({marks,index,filter}:{marks:SoundMark[];index:number;filter:SoundFilter}) {
  const events=wordSoundCategories(marks,index,filter);
  return <>{events.slice(0,2).map(mark=><SoundBadge key={mark.id} kind={mark.kind} muted={!markMatches(mark,filter)}
    title={`${phenomenon(mark.kind).label}: possible reading`}>{markSymbol(mark)}</SoundBadge>)}
    </>;
}
export function SoundMore({marks,index,filter,word,voice,expanded,controls,onToggle}:{
  marks:SoundMark[];index:number;filter:SoundFilter;word:string;voice:string;expanded:boolean;controls:string;onToggle():void;
}) {
  const count=wordSoundCategories(marks,index,filter).length-2;
  return count>0?<button type="button" className={`sound-more ${styles.more}`} aria-expanded={expanded} aria-controls={controls}
    aria-label={`+${count} more sound categories: ${word}, word ${index+1} · ${voice}`} onClick={onToggle}>+{count}</button>:null;
}
