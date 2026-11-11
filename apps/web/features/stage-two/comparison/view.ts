import type { SentenceUnit, SoundAnnotation } from '@libitu/types/stage-two';
import type { PracticeAnalysis, VoiceProsody, WordProsody } from '../persistence/practice-api';
import type { SentenceMeasurement } from '../server-reference/api';
import type { AcousticFeatures } from '../acoustics/types';
import { rhythmWords } from '../rhythm/rhythm-text.ts';
import { practiceTokens } from '../practice/flow.ts';

export type Point={x:number;pitch:number|null};
export type Vowel={phoneIndex:number;label:string;duration:number};
export type Word={text:string;ipa?:string;stress:number[]|null;duration:number|null;vowel:number|null;pause:number|null;startMs:number|null;endMs:number|null;
  match?:'matched'|'substituted'|'omitted'|'unavailable';recognizedText?:string;vowels?:Vowel[];measurement?:{source:'aligned_phones'|'legacy_word_total';quality:string[];reliable:boolean}};
export type VoiceEvidence={voice:'reference'|'learner';analysisId:string|null;sentenceId:string;source:'saved_analysis'|'reference_analysis'|'unavailable'};
export type Voice={words:Word[];curve:Point[];status:string;evidence?:VoiceEvidence};
export type ComparisonView={reference:Voice;yours:Voice;wordAligned:boolean;saved:boolean;sound?:SoundAnnotation|null};
const vowels=/^(AA|AE|AH|AO|AW|AY|EH|ER|EY|IH|IY|OW|OY|UH|UW)[012]?$/;
const blank=(text:string):Word=>({text,stress:null,duration:null,vowel:null,pause:null,startMs:null,endMs:null});
export function comparisonWordAtTime(words:readonly Word[],ms:number):number|null {
  if(!Number.isFinite(ms))return null;
  const matches=words.flatMap((w,i)=>w.startMs!==null&&w.endMs!==null&&w.startMs>=0&&w.endMs>w.startMs&&ms>=w.startMs&&ms<w.endMs?[i]:[]);
  return matches.length===1?matches[0]:null;
}
export function wordCurve(words:WordProsody[]):Point[] {
  return words.flatMap((w,i)=>[...w.pitch_curve_st.map((p,k,b)=>({x:(i+(k+.5)/b.length)/words.length,pitch:p})),{x:(i+1)/words.length,pitch:null}]);
}
export function localCurve(audio:AcousticFeatures|null):Point[] {
  if(audio?.quality.status!=='usable'||audio.quality.issues.includes('insufficient_pitch')||!audio.speechSpanMs||audio.speechStartMs===null)return [];
  return audio.pitchCurve.map(p=>({x:(p.timeMs-audio.speechStartMs!)/audio.speechSpanMs!,pitch:p.semitones}));
}
export function fileCurve(server:SentenceMeasurement|null):Point[] {
  const m=server?.measurements;
  if(!m||m.quality_issues.some(q=>['low_energy','clipping','insufficient_speech','insufficient_pitch'].includes(q)))return [];
  const values=m.frames.flatMap(p=>p.f0_hz&&Number.isFinite(p.f0_hz)&&p.f0_hz>0?[p.f0_hz]:[]).sort((a,b)=>a-b);
  const start=m.speech[0]?.start_sec,end=m.speech.at(-1)?.end_sec;
  if(!values.length||start===undefined||end===undefined||end<=start)return [];
  const mid=(values.length-1)/2,median=(values[Math.floor(mid)]+values[Math.ceil(mid)])/2;
  return m.frames.map(p=>({x:(p.time_sec-start)/(end-start),pitch:p.f0_hz&&p.f0_hz>0?12*Math.log2(p.f0_hz/median):null}));
}
export function trace(points:Point[],left:number,span:number,extent:number):string {
  let connected=false;
  return points.map(p=>{if(p.pitch===null||!Number.isFinite(p.pitch)||!Number.isFinite(p.x)||p.x<0||p.x>1){connected=false;return '';}
    const value=`${connected?'L':'M'}${(left+p.x*span).toFixed(2)},${(92-p.pitch/extent*65).toFixed(2)}`;connected=true;return value;}).join(' ');
}
function measured(w:WordProsody, voice?:VoiceProsody|null, exactMatch=false):Word {
  const phones=(w.phones??[]).flatMap((p,phoneIndex)=>vowels.test(p.label)&&Number.isFinite(p.duration_ms)&&p.duration_ms>0?[{phoneIndex,label:p.label,duration:p.duration_ms}]:[]);
  const quality=voice?.quality_issues??[];
  const reliable=voice?.alignment_status==='aligned'&&(exactMatch||['matched','source_transcript'].includes(voice.content?.status??'unavailable'))
    &&!quality.some(q=>['insufficient_speech','low_energy','clipping'].includes(q))
    &&(w.phones??[]).filter(p=>vowels.test(p.label)).every(p=>Number.isFinite(p.duration_ms)&&p.duration_ms>0);
  return {...blank(w.text),duration:w.duration_ms,pause:w.boundary_pause_ms??w.pause_after_ms,
    startMs:Number.isFinite(w.start_sec)?w.start_sec*1000:null,endMs:Number.isFinite(w.end_sec)?w.end_sec*1000:null,
    vowel:reliable&&phones.length?phones.reduce((n,p)=>n+p.duration,0):null,
    vowels:reliable?phones:[],measurement:{source:'aligned_phones',quality,reliable},
    stress:phones.length&&phones.every(p=>/[012]$/.test(p.label))?phones.map(p=>Number(p.label.slice(-1))):null};
}
export function comparisonView({sentence,guide,data,server,reference,yours}: {
  sentence:SentenceUnit|null;guide:SoundAnnotation|null;data:PracticeAnalysis|null;server:SentenceMeasurement|null;reference:AcousticFeatures|null;yours:AcousticFeatures|null;
}):ComparisonView {
  const result=data&&['completed','needs_review'].includes(data.state)&&data.sentence_id===sentence?.id?data.result:null;
  const evidence=(voice:VoiceEvidence['voice'],available:boolean):VoiceEvidence=>({voice,sentenceId:sentence?.id??'',analysisId:result?data?.id??null:null,
    source:!available?'unavailable':result?'saved_analysis':'reference_analysis'});
  const legacyTotals=(words:Word[],voice:'reference'|'learner')=>words.map((word,index)=>{
    if(!word.measurement?.reliable||word.vowels?.length||word.match&&word.match!=='matched'||result?.comparison!=='available')return word;
    const pairs=result.assessment?.sound.find(item=>item.kind==='vowel_length'&&item.status==='measured')?.pairs
      .filter(pair=>pair.word_index===index&&pair.end_index===index+1&&pair.unit==='ms')??[];
    if(pairs.length!==1||!Number.isFinite(pairs[0][voice])||pairs[0][voice]<=0)return word;
    return {...word,vowel:pairs[0][voice],measurement:{...word.measurement,source:'legacy_word_total' as const}};
  });
  if(data?.word_check&&data.sentence_id===sentence?.id) {
    const check=data.word_check;
    const tokens=practiceTokens(sentence?.text??'');
    const valid=tokens.length===check.source_count&&tokens.every((token,i)=>token.normalized===check.source_tokens[i]?.normalized);
    const display=valid?tokens.map(token=>token.display):[];
    const normalize=(text:string)=>practiceTokens(text).map(token=>token.normalized).join(' ');
    const sound=guide&&guide.sentence_id===sentence?.id&&guide.sentence_text===sentence?.text&&guide.tokens.length===display.length
      &&guide.tokens.every((token,i)=>normalize(token.text)===tokens[i].normalized)?guide:null;
    const referenceWords=result?.comparison==='available'?result.reference?.words??[]:[];
    const map=new Map<number,WordProsody>();
    const exact=new Map(check.operations.filter(op=>op.kind==='matched').map(op=>[op.recognized_index,op.source_index]));
    for(const word of result?.learner.words??[]) {
      const index=word.source_index;
      if(index!==null&&index!==undefined&&Number.isInteger(index)&&index>=0&&index<display.length
        &&word.recognized_index!==null&&word.recognized_index!==undefined&&exact.get(word.recognized_index)===index
        &&normalize(word.text)===tokens[index].normalized&&!map.has(index))map.set(index,word);
    }
    const refs=display.map((text,i)=>{
      const word=referenceWords[i];
      return {...word&&normalize(word.text)===tokens[i].normalized?measured(word,result?.reference):blank(text),text,ipa:sound?.tokens[i]?.ipa.join(' / ')};
    });
    const yours=display.map((text,i)=>{
      const word=map.get(i);
      const value=word?measured(word,result?.learner,valid&&check.status==='reliable'&&check.tier!=='below_60'):blank(text);
      const next=map.get(i+1);
      // A gap or inserted word breaks the source boundary in both comparison and display.
      if(word&&(!next||word.recognized_index!+1!==next.recognized_index))value.pause=null;
      const operation=check.operations.find(op=>op.source_index===i);
      const match=operation?.kind==='matched'?(word?'matched':'unavailable'):operation?.kind==='substituted'?'substituted':operation?.kind==='omitted'?'omitted':'unavailable';
      return {...value,text,match:match as Word['match'],recognizedText:operation?.kind==='substituted'?check.recognized_tokens[operation.recognized_index!]?.display:undefined};
    });
    const curves=(words:(WordProsody|undefined)[])=>words.flatMap((word,i)=>
      [...(word?.pitch_curve_st??[]).map((pitch,k,bins)=>({x:(i+(k+.5)/bins.length)/words.length,pitch})),
        {x:(i+1)/Math.max(1,words.length),pitch:null}]);
    return {saved:Boolean(result),wordAligned:Boolean(valid&&map.size&&result?.learner.alignment_status==='aligned'),sound,
      reference:{words:legacyTotals(refs,'reference'),evidence:evidence('reference',Boolean(referenceWords.length)),curve:curves(display.map((_,i)=>referenceWords[i]&&normalize(referenceWords[i].text)===tokens[i].normalized?referenceWords[i]:undefined)),status:referenceWords.length?'':'Reference unavailable for this take.'},
      yours:{words:legacyTotals(yours,'learner'),evidence:evidence('learner',Boolean(map.size)),curve:curves(display.map((_,i)=>map.get(i))),status:map.size<display.length?'Unmatched or unavailable words are not compared.':''}};
  }
  const learner=result?.learner.words??[];
  const saved=Boolean(result);
  const available=server?.sentence_id===sentence?.id?server:null;
  const ref=saved?(result?.comparison==='available'?result.reference?.words??[]:[]):
    available?.prosody&&['matched','source_transcript'].includes(available.prosody.content.status)&&available.prosody.alignment_status==='aligned'?available.prosody.words:[];
  const caption=rhythmWords(sentence?.text??'',guide);
  const axis=learner.length?learner:ref;
  const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9']/g,'');
  const display=axis.length?axis.map((w,i)=>caption.length===axis.length&&normalize(caption[i].text)===normalize(w.text)?caption[i].text:w.text):caption.map(w=>w.text);
  const makeWords=(words:WordProsody[],isReference:boolean)=>display.map((text,i)=>{
    const value=words[i]&&normalize(words[i].text)===normalize(text)?measured(words[i],isReference?(saved?result?.reference:available?.prosody):result?.learner):blank(text);
    const token=guide&&guide.sentence_text===sentence?.text?guide.tokens.find(t=>normalize(t.text)===normalize(text)):null;
    return {...value,text,ipa:isReference?token?.ipa.join(' / '):undefined,
      stress:value.stress??(isReference&&!words.length?caption[i]?.stresses??null:null)};
  });
  const wordAligned=saved||Boolean(ref.length&&!yours);
  const mismatch=result&&['mismatch','uncertain'].includes(result.learner.content.status);
  const sound=guide&&guide.sentence_id===sentence?.id&&guide.sentence_text===sentence?.text&&guide.tokens.length===display.length
    &&guide.tokens.every((t,i)=>normalize(t.text)===normalize(display[i]))?guide:null;
  return {saved,wordAligned,sound,
    reference:{words:legacyTotals(makeWords(ref,true),'reference'),evidence:evidence('reference',Boolean(ref.length)),curve:wordAligned?wordCurve(ref):fileCurve(available).length?fileCurve(available):localCurve(reference),
      status:saved&&!ref.length?'Reference unavailable for this take.':!ref.length?'Reference word analysis pending.':''},
    yours:{words:legacyTotals(makeWords(learner,false),'learner'),evidence:evidence('learner',Boolean(learner.length)),curve:saved?wordCurve(learner):mismatch?[]:localCurve(yours),
      status:saved?'':mismatch?'Spoken words need review; word comparison unavailable.':yours?'Word alignment pending.':'Record a take to compare your voice.'}};
}

const basePhone=(label:string)=>label.replace(/[012]$/,'');
const reliableWord=(word:Word|undefined)=>Boolean(word?.measurement?.reliable&&word.duration!==null&&word.duration>=25&&word.duration<=3000);
/** Same median learner/reference word-duration ratio used by acoustic comparison.
 * Only source-matched, reliable words contribute. This is a display normalization, not a grade. */
export function vowelPace(view:ComparisonView):number|null {
  const ratios=view.reference.words.flatMap((r,i)=>{
    const y=view.yours.words[i];
    return reliableWord(r)&&reliableWord(y)&&(!y.match||y.match==='matched')&&r.text===y.text?[y.duration!/r.duration!]:[];
  }).sort((a,b)=>a-b);
  if(ratios.length<3)return null;
  const mid=(ratios.length-1)/2;return (ratios[Math.floor(mid)]+ratios[Math.ceil(mid)])/2;
}
export function vowelComparison(view:ComparisonView,index:number) {
  const r=view.reference.words[index],y=view.yours.words[index];
  const reference=r?.vowels??[],yours=y?.vowels??[];
  const paired=Boolean(reliableWord(r)&&reliableWord(y)&&r.text===y.text&&(!y.match||y.match==='matched')
    &&reference.length&&reference.length===yours.length&&reference.every((v,i)=>basePhone(v.label)===basePhone(yours[i].label))
    &&[...reference,...yours].every(v=>v.duration>=25&&v.duration<=800));
  return {reference,yours,paired,pace:paired?vowelPace(view):null};
}
