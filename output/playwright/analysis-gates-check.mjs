// Start Next dev on 3000 and helpers/quick-browser-fixture.mjs on 3011. Synthetic account/analysis only.
import {mkdirSync} from 'node:fs';
mkdirSync('output/playwright',{recursive:true});
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? 'playwright');
const content='aa000000-0000-4000-8000-000000000044',sentence='sentence-v2-quick-0',text='We practice speaking every day.';
const tokens=[...text.matchAll(/[a-z]+/gi)].map(m=>({display:m[0],normalized:m[0].toLowerCase(),start:m.index,end:m.index+m[0].length}));
function signal(duration) {return {version:'server-prominence-v1',feature_version:'fixture',aggregation_version:'fixture',boundary_source:'mfa',duration_evaluated:true,duration_sec:duration*5,time_step_sec:.05,pitch_st:[],prominence:[],words:tokens.map((t,i)=>({text:t.display,source_index:i,start_sec:i*duration,end_sec:(i+1)*duration,value:.2+i*.12,uncertain:i===2,reasons:[],sensitivity_range:[]})),display_frames:Array.from({length:Math.floor(duration*5/.02)},(_,i)=>({time_sec:i*.02,pitch_st:i%29>24?null:Math.sin(i*.15)*4,energy_dbfs:-22+Math.sin(i*.2)*8})),reasons:[],experimental:true};}
function voice(duration){return {content:{status:'matched',transcript:text,reason:null},alignment_status:'aligned',quality_issues:[],words:tokens.map((t,i)=>({text:t.display,source_index:i,recognized_index:i,start_sec:i*duration,end_sec:(i+1)*duration,duration_ms:duration*1000,pause_after_ms:0,boundary_pause_ms:0,phones:[{label:'IY1',duration_ms:100}],pitch_curve_st:[0,1,2]})),rhythm_signal:signal(duration)};}
function take(id,ref,created){return {id,content_id:content,sentence_id:sentence,sentence_text:text,start_ms:1000,end_ms:4000,reference_version:'fixture',duration_ms:3500,playback_rate:1,text_visible:true,recording_state:'none',created_at:created,evidence_source:'browser_recording',fixture_analysis:{id,sentence_id:sentence,analysis_version:'practice-gated-v3',state:'completed',phase:'finished',analysis_scope:'all_layers',created_at:created,error_code:null,retryable:false,word_check:{version:'word-match-v1',status:'reliable',reason:null,transcript:text,source_tokens:tokens,recognized_tokens:tokens,operations:tokens.map((_,i)=>({kind:'matched',source_index:i,recognized_index:i,source_boundary:null})),matched_count:5,source_count:5,tier:'full_85_plus'},layers:Object.fromEntries(['sound','rhythm','melody'].map(l=>[l,{state:'partial',reason:ref?null:'learner_only'}])),result:{learner:voice(.7),reference:ref?voice(.5):null,comparison:ref?'available':'unavailable',reason:ref?null:'reference_unavailable'}}};}
const takes=[take('older-paired',true,'2026-11-04T10:00:00Z'),take('newer-solo',false,'2026-11-04T10:05:00Z')];
const base=`http://127.0.0.1:3011/practice/${content}/shadow?segmentId=quick-segment&sentenceId=${sentence}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const matched of [2,3]) {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const fixture=structuredClone(takes[0]),a=fixture.fixture_analysis;
  a.word_check.matched_count=matched;a.word_check.tier=matched===2?'below_60':'partial_60_85';a.analysis_scope=matched===2?'none':'sound_only';
  a.word_check.operations=a.word_check.operations.map((op,i)=>({...op,kind:i<matched?'matched':'substituted'}));
  a.layers={sound:{state:matched===2?'locked':'partial',reason:null},rhythm:{state:'locked',reason:null},melody:{state:'locked',reason:null}};
  if(matched===2)a.result=null;
  await page.addInitScript(f=>sessionStorage.setItem('quick-fixture-takes',JSON.stringify([f])),fixture);
  await page.goto(base+'&shadowMode=detailed&takeId=older-paired',{waitUntil:'domcontentloaded'});
  await page.getByRole('tab',{name:'Rhythm',exact:true}).waitFor({timeout:60000});
  assert.equal(await page.getByRole('tab',{name:'Rhythm',exact:true}).isDisabled(),true);
  assert.equal(await page.getByRole('tab',{name:'Melody',exact:true}).isDisabled(),true);
  assert.equal(await page.getByRole('tab',{name:'Sound',exact:true}).isDisabled(),matched===2);
  await page.getByRole('navigation',{name:'Shadow mode',exact:true}).getByRole('button',{name:'Review',exact:true}).click();
  await page.getByRole('heading',{name:'Overview',exact:true}).waitFor();
  const group=page.getByRole('group',{name:'Overview layers',exact:true});
  await group.getByRole('button',{name:'Rhythm · Locked',exact:true}).waitFor();
  assert.equal(await group.getByRole('button',{name:'Rhythm · Locked',exact:true}).isDisabled(),true);
  assert.equal(await group.getByRole('button',{name:'Melody · Locked',exact:true}).isDisabled(),true);
  page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'Delete analysis',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Delete analysis',exact:true}).count(),1);
  console.log(`PASS ${matched}/5: Detailed/Review gates and cancelled deletion`);await page.close();
 }
}finally{await browser.close();}
