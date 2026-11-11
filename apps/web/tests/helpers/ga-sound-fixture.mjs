// Deterministic saved measurements, with candidates from the actual GA rule service.
// These durations are synthetic and do not establish acoustic accuracy.
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../..',import.meta.url));
export const content='aa000000-0000-4000-8000-000000000044',sentence='sentence-v2-quick-0';
export const text='Did you put the button in water next day? Go away. Bit bid. Red apple.';
const guide=JSON.parse(execFileSync(`${root}/apps/api/.venv/bin/python`,['-c',
 `import json; from app.services.sound_service import annotate_sentence; print(annotate_sentence(${JSON.stringify(content)},${JSON.stringify(sentence)},${JSON.stringify(text)}).model_dump_json())`],{cwd:root,env:{...process.env,PYTHONPATH:`${root}/apps/api`},encoding:'utf8'}));
const tokens=guide.tokens.map(t=>({display:t.text,normalized:t.text.toLowerCase(),start:t.start,end:t.end}));
function voice(scale=1){return{content:{status:'matched',transcript:text,reason:null},alignment_status:'aligned',quality_issues:[],
 words:tokens.map((t,i)=>({text:t.display,source_index:i,recognized_index:i,start_sec:i*.5*scale,end_sec:(i*.5+.4)*scale,duration_ms:400*scale,
 pause_after_ms:0,boundary_pause_ms:0,pitch_curve_st:[0,1,null,2],phones:(guide.tokens[i].pronunciations[0]??[]).map((label,j)=>({label,duration_ms:(/[012]$/.test(label)?80+j*5:25)*scale}))}))};}
function take(id,ref,created,partial=false){const learner=voice(1.25),reference=ref?voice():null;
 const operations=tokens.map((_,i)=>({kind:partial&&i>=6&&i<10?'substituted':'matched',source_index:i,recognized_index:i,source_boundary:null}));
 if(partial){learner.content.status='mismatch';learner.words=learner.words.filter(w=>w.source_index<6||w.source_index>=10);}
 return{id,content_id:content,sentence_id:sentence,sentence_text:text,start_ms:1000,end_ms:4000,reference_version:'fixture',duration_ms:5500,
 playback_rate:1,text_visible:true,recording_state:'none',created_at:created,evidence_source:'browser_recording',fixture_sound:guide,
 fixture_analysis:{id,sentence_id:sentence,analysis_version:'practice-gated-v3',state:'completed',phase:'finished',analysis_scope:partial?'sound_only':'all_layers',created_at:created,error_code:null,retryable:false,
 word_check:{version:'word-match-v1',status:'reliable',reason:null,transcript:text,source_tokens:tokens,recognized_tokens:tokens.map((t,i)=>partial&&i>=6&&i<10?{...t,display:'other',normalized:'other'}:t),operations,matched_count:partial?tokens.length-4:tokens.length,source_count:tokens.length,tier:partial?'partial_60_85':'full_85_plus'},
 layers:Object.fromEntries(['sound','rhythm','melody'].map(l=>[l,{state:partial&&l!=='sound'?'locked':ref?'available':'partial',reason:ref?null:'learner_only'}])),result:{learner,reference,comparison:ref?'available':'unavailable',reason:ref?null:'reference_unavailable'}}};}
export const takes=[take('ga-paired',true,'2026-11-07T01:00:00Z'),take('ga-solo',false,'2026-11-07T01:01:00Z'),take('ga-partial',true,'2026-11-07T01:02:00Z',true)];
export const base=`http://127.0.0.1:3011/practice/${content}/shadow?segmentId=quick-segment&sentenceId=${sentence}`;
