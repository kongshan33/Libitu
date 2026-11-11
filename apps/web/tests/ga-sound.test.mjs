import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { comparisonView, vowelComparison, vowelPace } from '../features/stage-two/comparison/view.ts';
import { phenomena, soundGroups, wordSoundMarks, wordSoundCategories, soundMarks, soundCount, markSymbol, markMatches, emptyPhenomenon } from '../features/stage-two/sound/phenomena.ts';
const word=(text,duration=300)=>({text,start_sec:0,end_sec:duration/1000,duration_ms:duration,pitch_curve_st:[],pause_after_ms:null,
 phones:[{label:'W',duration_ms:30},{label:'AO1',duration_ms:100},{label:'T',duration_ms:20},{label:'ER0',duration_ms:90}]});
const voice=(words)=>({alignment_status:'aligned',content:{status:'matched'},quality_issues:[],words});
const base={sentence:{id:'s',text:'Water water water.'},guide:null,server:null,reference:null,yours:null};
const render=(reference,yours,more={})=>comparisonView({...base,data:{id:'take-1',sentence_id:'s',state:'completed',result:{comparison:reference?'available':'unavailable',reference,learner:yours},...more}});
test('registry is exactly twelve grouped entries with the shared canonical kinds',()=>{
 assert.equal(phenomena.length,12);assert.equal(new Set(phenomena.map(p=>p.id)).size,12);
 assert.deepEqual([...new Set(phenomena.map(p=>p.group))],soundGroups);
 assert.ok(!phenomena.some(p=>['drop_d','h_drop','r_linking'].includes(p.id)));
 const schema=readFileSync(new URL('../../api/app/schemas/sound.py',import.meta.url),'utf8');
 const literal=schema.match(/SoundKind = Literal\[([\s\S]*?)\]/)[1];
 assert.deepEqual(new Set([...literal.matchAll(/"([^"]+)"/g)].map(m=>m[1])),new Set(phenomena.map(p=>p.id)));
});
test('alternative realizations share one event; independent phones and syllabic events remain',()=>{
 const mark=(id,kind,group,phone)=>({id,kind,start:0,end:1,candidate:{alternative_group:group,anchor:{phone_index:phone}}});
 const marks=[mark('tap','flap','t'),mark('glottal','glottal','t'),mark('n','syllabic'),mark('stop','unreleased',null,4),mark('stop2','unreleased',null,7)];
 assert.equal(wordSoundMarks(marks,0).length,4);
 assert.deepEqual(wordSoundCategories(marks,0,{kind:'all',subtype:'all'}).map(m=>m.kind),['flap','syllabic','unreleased']);
 assert.equal(wordSoundCategories(marks,0,{kind:'glottal',subtype:'all'})[0].id,'glottal');
 assert.equal(marks.length,5,'compact category labels preserve all original events for explanations');
 assert.equal(wordSoundMarks(marks,1).length,0);
 assert.equal(markMatches({kind:'vowel_length'},{kind:'all',subtype:'all'}),true);
 assert.match(emptyPhenomenon('assimilation','manner'),/not available yet/);
 assert.match(emptyPhenomenon('assimilation','place'),/No suggestions/);
});
test('multiple vowel labels retain phone indices, raw values and independently pace-adjusted values',()=>{
 const reference=voice(Array.from({length:3},()=>word('water'))), yours=voice(Array.from({length:3},()=>({...word('water',600),phones:word('water').phones.map(p=>({...p,duration_ms:p.duration_ms*2}))})));
 const view=render(reference,yours);const values=vowelComparison(view,0);
 assert.deepEqual(values.reference,[{phoneIndex:1,label:'AO1',duration:100},{phoneIndex:3,label:'ER0',duration:90}]);
 assert.equal(values.paired,true);assert.equal(values.pace,2);assert.equal(vowelPace(view),2);
 assert.equal(values.yours[1].duration/values.pace,90);
 assert.ok(values.reference.every(p=>!('startMs'in p)&&!('endMs'in p)));
});
test('missing, mismatched, unaligned, low-quality or out-of-range vowels never become comparable pairs',()=>{
 const words=Array.from({length:3},()=>word('water')), reference=voice(words);
 for(const learner of [voice([{...word('water'),phones:[{label:'IY1',duration_ms:120}]}]),
   {...voice(words),alignment_status:'failed'},{...voice(words),quality_issues:['clipping']},
   voice([{...word('water'),phones:[{label:'AO1',duration_ms:10},{label:'ER0',duration_ms:90}]}])]) {
   assert.equal(vowelComparison(render(reference,learner),0).paired,false);
 }
 const single=render(null,voice(words));assert.equal(vowelComparison(single,0).reference.length,0);assert.equal(vowelComparison(single,0).yours.length,2);
 assert.equal(vowelComparison(render(voice([word('water')]),voice([word('water')])),0).pace,null);
});
test('saved take ignores live reference, revoked reference leaves learner values only, deleted result disappears',()=>{
 const words=Array.from({length:3},()=>word('water')), learner=voice(words);
 const saved=render(null,learner);assert.equal(vowelComparison(saved,0).reference.length,0);
 const deleted=render(learner,learner,{state:'deleted'});assert.equal(vowelComparison(deleted,0).yours.length,0);
});

test('legacy misordered words and an empty saved take cannot borrow a live reference',()=>{
 const words=Array.from({length:3},()=>word('water'));
 const mismatch=render(voice([word('other'),...words.slice(1)]),voice(words));
 assert.equal(vowelComparison(mismatch,0).reference.length,0);
 const view=comparisonView({...base,server:{sentence_id:'s',prosody:voice(words)},data:{id:'old-empty',sentence_id:'s',state:'completed',result:{comparison:'unavailable',learner:voice([])}}});
 assert.equal(view.saved,true);assert.equal(vowelComparison(view,0).reference.length,0);
 assert.equal(view.reference.evidence.analysisId,'old-empty');assert.equal(view.reference.evidence.source,'unavailable');
});

test('a boundary event appears once at its anchor and alternatives honor the active subtype',()=>{
 const marks=[{id:'replace',kind:'glottal',start:0,end:2,subtype:'replacement',candidate:{anchor:{token_index:0},alternative_group:'t'}},
  {id:'reinforce',kind:'glottal',start:0,end:2,subtype:'reinforcement',candidate:{anchor:{token_index:0},alternative_group:'t'}}];
 assert.equal(wordSoundMarks(marks,1).length,0);
 const filter={kind:'glottal',subtype:'reinforcement'};
 const preferred=[...marks.filter(m=>markMatches(m,filter)),...marks.filter(m=>!markMatches(m,filter))];
 assert.equal(wordSoundMarks(preferred,0)[0].id,'reinforce');
});

test('saved word-total pairs remain explicit legacy totals, never synthetic individual vowels',()=>{
 const old=voice(Array.from({length:3},()=>({...word('water'),phones:undefined})));
 const pair={word_index:0,end_index:1,reference:180,learner:210,unit:'ms'};
 const data={id:'old-take',sentence_id:'s',state:'completed',result:{comparison:'available',reference:old,learner:old,
  assessment:{sound:[{kind:'vowel_length',status:'measured',pairs:[pair]}]}}};
 const view=comparisonView({...base,data});
 assert.equal(view.reference.words[0].vowel,180);assert.equal(view.yours.words[0].vowel,210);
 assert.equal(view.yours.words[0].measurement.source,'legacy_word_total');
 assert.deepEqual(vowelComparison(view,0).yours,[]);assert.equal(vowelComparison(view,0).paired,false);
 data.result.assessment.sound[0].pairs=[{...pair,end_index:2}];
 assert.equal(comparisonView({...base,data}).yours.words[0].vowel,null);
});

test('saved timing never manufactures a vowel-length reading cue',()=>{
 const view=render(voice([word('water')]),voice([word('water')]));
 assert.deepEqual(soundMarks(view),[]);
 const candidate={id:'vowel',kind:'vowel_length',subtype:'before_voiceless',token_start:0,token_end:1,
  anchor:{type:'phone',token_index:0,phone_index:1},explanation:'Relative shortening',phonemes_before:'/ɪ + t/',phonemes_after:'[ɪt]'};
 view.sound={version:'sound-rules-v3',candidates:[candidate]};
 const [mark]=soundMarks(view);assert.equal(mark.kind,'vowel_length');assert.equal(markSymbol(mark),'shorter');
 assert.equal(wordSoundMarks([mark],0).length,1);
 view.sound.version='sound-rules-v2';assert.deepEqual(soundMarks(view),[]);
});
test('filter counts deduplicate alternatives within a category, not independent events',()=>{
 const mark=(id,kind,group)=>({id,kind,candidate:{alternative_group:group}});
 assert.equal(soundCount([mark('g1','glottal','t'),mark('g2','glottal','t'),mark('s','syllabic',null)],'glottal'),1);
 assert.equal(soundCount([],'vowel_length'),0);
});
