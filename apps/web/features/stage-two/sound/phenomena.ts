import type { SoundCandidate, SoundKind, SoundPhenomenon, SoundSubtype } from '@libitu/types/stage-two';
import type { ComparisonView } from '../comparison/view';

export type Phenomenon = SoundPhenomenon;
export type SoundFilter = { kind: Phenomenon | 'all'; subtype: SoundSubtype | 'all' };
export const allSound: SoundFilter = { kind: 'all', subtype: 'all' };
type Subtype = { id: SoundSubtype; label: string; supported: boolean };
type Definition = { id: Phenomenon; group: 'Connect'|'Reduce'|'Consonant'|'Vowel'; label: string; symbol: string;
  badge: string; description: string; listen: string; practice: string; subtypes: Subtype[] };
const sub = (id: SoundSubtype, label: string, supported = true): Subtype => ({ id, label, supported });
export const phenomena: readonly Definition[] = [
  {id:'linking',group:'Connect',label:'Linking',symbol:'‿',badge:'LK',
    description:'Words may connect across a boundary. Consonant–vowel, vowel transitions and matching consonants are distinct patterns.',
    listen:'Listen across the boundary, without assuming that no pause proves linking.', practice:'Say the pair within one phrase. Do not add an extra stressed glide.',
    subtypes:[sub('cv','C–V'),sub('glide','V–V glide'),sub('same_consonant','Same consonant')]},
  {id:'coalescence',group:'Connect',label:'Coalescence',symbol:'t͡ʃ',badge:'CO',
    description:'A consonant and /j/ may fuse into [tʃ], [dʒ], [ʃ] or [ʒ]. This is a type of assimilation.',
    listen:'Listen for one fused sound at the boundary.',practice:'Try the fused reading, then the separate sounds. Both can be valid.',subtypes:[sub('yod','Yod coalescence')]},
  {id:'assimilation',group:'Connect',label:'Assimilation',symbol:'≈',badge:'AS',
    description:'A sound may adopt the place or manner of a neighbor. Fusion and voicing changes have their own entries.',
    listen:'Notice the consonant transition, especially a nasal before a lip or back-of-tongue closure.',practice:'Prepare for the following sound while keeping the phrase intelligible.',subtypes:[sub('place','Place'),sub('manner','Manner',false)]},
  {id:'weak_form',group:'Reduce',label:'Weakening',symbol:'ə',badge:'WK',
    description:'Function-word weak forms and unstressed vowel reduction are related, but not identical. Not every weak vowel is schwa.',
    listen:'Notice the unstressed word in its phrase, not only its duration.',practice:'Keep emphasized words clear. A full form can be appropriate under contrast.',subtypes:[sub('function_word','Function word'),sub('vowel_reduction','Vowel reduction',false)]},
  {id:'reduced_form',group:'Reduce',label:'Reduced forms',symbol:'’',badge:'RF',
    description:'Contractions and casual spellings represent word-level forms with grammatical conditions.',
    listen:'Recognize the full meaning behind the written reduction.',practice:'Use the form only with its intended grammar; going to does not always become gonna.',subtypes:[sub('contraction','Contraction'),sub('casual','Casual form')]},
  {id:'elision',group:'Reduce',label:'Elision',symbol:'∅',badge:'EL',
    description:'A sound may be omitted. An inaudible burst or glottal replacement is not evidence of deletion.',
    listen:'Listen for the cluster or weak initial /h/ in context.',practice:'Try a fluent phrase without forcing deletion; retaining the sound can be valid.',subtypes:[sub('td_drop','T–D'),sub('h_drop','H'),sub('other','Other',false)]},
  {id:'flap',group:'Consonant',label:'T/D tap',symbol:'ɾ',badge:'TP',
    description:'Both /t/ and /d/ may become a brief alveolar tap [ɾ] in suitable GA environments.',
    listen:'Listen for a very brief tongue contact, not a full [d].',practice:'Use a light tongue tap between the surrounding sounds; emphasis may preserve the stop.',subtypes:[sub('tap','T/D tap')]},
  {id:'glottal',group:'Consonant',label:'Glottalization',symbol:'ʔ',badge:'GT',
    description:'A glottal closure can replace a stop or reinforce a retained stop. These are distinct realizations.',
    listen:'Compare a glottal closure with the retained oral stop; pitch interruption alone cannot identify either.',practice:'Explore the listed GA alternatives gently, without forcing a throat squeeze.',subtypes:[sub('replacement','Replacement'),sub('reinforcement','Reinforcement')]},
  {id:'unreleased',group:'Consonant',label:'Unreleased',symbol:'p̚',badge:'UR',
    description:'A stop closure can remain while its release is inaudible or masked by another closure.',
    listen:'Notice how the next stop can hide the release. The first consonant is not necessarily absent.',practice:'Keep the closure and move into the next consonant without forcing an extra burst.',subtypes:[sub('stop_cluster','Stop cluster')]},
  {id:'syllabic',group:'Consonant',label:'Syllabic',symbol:'n̩',badge:'SY',
    description:'A consonant such as [n̩] or [l̩] may carry a weak syllable without a separate schwa.',
    listen:'Listen for a syllable carried by the consonant.',practice:'Try the weak syllable without adding a full vowel; the schwa reading remains an alternative.',subtypes:[sub('n','n̩'),sub('l','l̩'),sub('m','m̩',false)]},
  {id:'voicing',group:'Consonant',label:'Voicing change',symbol:'◐',badge:'VC',
    description:'Voicing and devoicing are different directions. Unaspirated /p,t,k/ after /s/ are not automatically voiced.',
    listen:'Listen to the consonant with its neighboring vowel. No pitch track does not prove devoicing.',practice:'Use only the stated construction; do not generalize have to to every consonant cluster.',subtypes:[sub('voicing','Voicing',false),sub('devoicing','Devoicing')]},
  {id:'vowel_length',group:'Vowel',label:'Vowel length',symbol:'ː',badge:'VL',
    description:'The same vowel is usually shorter before a word-final voiceless consonant and longer before its voiced counterpart, under similar conditions.',
    listen:'Compare the vowel in bit /bɪt/ and bid /bɪd/, or beat /bit/ and bead /bid/. Keep the vowel quality the same within each pair.',
    practice:'Keep pace, stress and phrase position similar. Shorten the vowel before /t/ relative to /d/; do not aim for a fixed number of milliseconds.',
    subtypes:[sub('before_voiceless','Before voiceless'),sub('before_voiced','Before voiced')]},
];
export const soundExamples: Record<Phenomenon,string> = {
  linking:'talking about → ŋ‿ə',coalescence:'did you → dʒ',assimilation:'ten bottles → n→m',
  weak_form:'of → [əv]',reduced_form:'gonna = going to',elision:'next day → t→∅; tell him → h→∅',
  flap:'water → [ɾ]',glottal:'button → [ʔ]',unreleased:'stop talking → p̚',syllabic:'button → n̩; bottle → l̩',
  voicing:'have to → v→f',vowel_length:'bit /bɪt/ ↔ bid /bɪd/ · relatively shorter ↔ longer',
};
export const soundGroups = ['Connect','Reduce','Consonant','Vowel'] as const;
export const phenomenon = (kind: Phenomenon) => phenomena.find(item => item.id === kind)!;
export function legacyKind(kind: string, rule = ''): Phenomenon | null {
  if (kind === 'drop_d' || kind === 'h_drop') return 'elision';
  if (kind === 'assimilation' && rule === 'coalescence-pronoun-v1') return 'coalescence';
  return phenomena.some(item => item.id === kind) ? kind as Phenomenon : null;
}
export function legacySubtype(kind: string, rule: string): SoundSubtype | undefined {
  if (kind === 'drop_d') return 'td_drop';
  if (kind === 'h_drop') return 'h_drop';
  if (kind === 'assimilation' && rule === 'coalescence-pronoun-v1') return 'yod';
  if (['assimilation','glottal','voicing'].includes(kind)) return undefined;
  if (kind === 'elision') return rule === 'cluster-elision-v1' ? 'td_drop' : 'other';
  return phenomenon(legacyKind(kind,rule)!).subtypes[0].id;
}
export type SoundMark = {id:string;kind:Phenomenon;subtype?:SoundSubtype;start:number;end:number;description:string;candidate?:SoundCandidate};
export function soundMarks(view:ComparisonView):SoundMark[] {
  const words=view.reference.words;
  const marks:SoundMark[]=(view.sound?.candidates??[]).filter(c=>Number.isInteger(c.token_start)&&Number.isInteger(c.token_end)
    &&c.token_start>=0&&c.token_end>c.token_start&&c.token_end<=words.length).flatMap(c=>{
      const kind=legacyKind(c.kind,c.rule_id);if(!kind||(kind==='vowel_length'&&view.sound?.version!=='sound-rules-v3'))return [];
      return [{id:c.id,kind,subtype:c.subtype??legacySubtype(c.kind,c.rule_id),start:c.token_start,end:c.token_end,
        description:`Possible reading: ${c.explanation}`,candidate:{...c,kind:kind as SoundKind}}];
    });
  return marks.sort((a,b)=>priority.indexOf(a.kind)-priority.indexOf(b.kind));
}
export function markMatches(mark:SoundMark, filter:SoundFilter) {
  return filter.kind==='all' || mark.kind===filter.kind && (filter.subtype==='all'||mark.subtype===filter.subtype);
}
export function visibleSoundMarks(marks:SoundMark[], filter:Phenomenon|'all'='all') {
  return marks.filter(mark=>markMatches(mark,{kind:filter,subtype:'all'}));
}
export function emptyPhenomenon(kind:Phenomenon|'all', subtype:SoundSubtype|'all'='all') {
  if(kind!=='all'&&subtype!=='all'&&!phenomenon(kind).subtypes.find(s=>s.id===subtype)?.supported)
    return 'Suggestions for this subtype are not available yet.';
  return kind==='all'?'No sound suggestions are available for this sentence.':
    'No suggestions of this type were found for this sentence.';
}
// Specific transformations appear before general contextual cues. Alternative
// realizations share one event in All and expand together in the detail card.
const priority:Phenomenon[]=['reduced_form','coalescence','flap','glottal','syllabic','unreleased','elision','voicing','assimilation','weak_form','linking','vowel_length'];
export function wordSoundMarks(marks:SoundMark[], index:number) {
  const events=new Map<string,SoundMark>();
  for(const mark of marks) {
    if(index!==(mark.candidate?.anchor?.token_index??mark.start)||mark.kind==='linking')continue;
    const key=mark.candidate?.alternative_group??`${mark.kind}:${mark.start}:${mark.end}:${mark.candidate?.anchor?.phone_index??''}`;
    if(!events.has(key))events.set(key,mark);
  }
  return [...events.values()];
}
/** Compact word labels count categories; the explanation retains every event. */
export function wordSoundCategories(marks:SoundMark[],index:number,filter:SoundFilter) {
  const preferred=filter.kind==='all'?marks:[...marks.filter(m=>markMatches(m,filter)),...marks.filter(m=>!markMatches(m,filter))];
  const categories=new Map<Phenomenon,SoundMark>();
  for(const mark of wordSoundMarks(preferred,index))if(!categories.has(mark.kind))categories.set(mark.kind,mark);
  return [...categories.values()];
}
export function markSymbol(mark:SoundMark) {
  const c=mark.candidate;
  if(!c)return phenomenon(mark.kind).symbol;
  if(mark.kind==='vowel_length')return mark.subtype==='before_voiceless'?'shorter':'longer';
  if(mark.kind==='linking')return c.phonemes_after.replace(/^\[|\]$/g,'');
  if(mark.kind==='elision')return c.phonemes_before==='/h/'?'h→∅':mark.subtype==='td_drop'?`${c.phonemes_before.match(/([td])\s*#/)?.[1]??'t/d'}→∅`:'∅';
  if(mark.kind==='assimilation'&&mark.subtype==='place')return c.phonemes_after.includes('ŋ')?'n→ŋ':'n→m';
  if(mark.kind==='coalescence')return `${c.phonemes_before.replaceAll('/','').replaceAll(' ','')}→${c.phonemes_after.replace(/^\[|\]$/g,'')}`;
  if(mark.kind==='glottal')return mark.subtype==='replacement'?'[ʔ]':'[ʔt]';
  if(mark.kind==='flap')return '[ɾ]';
  if(mark.kind==='weak_form')return `[${c.phonemes_after.replaceAll('/','')}]`;
  if(mark.kind==='reduced_form')return `= ${c.phonemes_before.replace(/\s*\([^)]*\)/g,'')}`;
  if(['syllabic','unreleased'].includes(mark.kind))return c.phonemes_after.replace(/^\[|\]$/g,'');
  if(mark.kind==='voicing')return `${c.phonemes_before.replaceAll('/','')}→${c.phonemes_after.replace(/^\[|\]$/g,'')}`;
  return phenomenon(mark.kind).symbol;
}

/** Count independent candidate events, not alternative realizations or recordings. */
export function soundCount(marks:SoundMark[],kind:Phenomenon) {
  return new Set(marks.filter(m=>m.kind===kind).map(m=>m.candidate?.alternative_group??m.id)).size;
}
