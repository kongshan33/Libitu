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
async function assertReadable(timeline) {
 await timeline.getByRole('slider',{name:'Timeline zoom',exact:true}).fill('0.06');
 const check=async()=>{
  const clipped=await timeline.locator('[class*=AnalysisTimeline_word]').evaluateAll(labels=>labels.filter(label=>{
   const range=document.createRange();range.selectNodeContents(label);const text=range.getBoundingClientRect(),cell=label.closest('button').getBoundingClientRect();
   return text.left<cell.left+4 || text.right>cell.right-4;
  }).map(label=>label.textContent));
  assert.deepEqual(clipped,[]);
 };
 await check();await timeline.getByRole('button',{name:'Fit',exact:true}).click();await check();
}
const base=`http://127.0.0.1:3011/practice/${content}/shadow?segmentId=quick-segment&sentenceId=${sentence}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const state of ['locked','uncertain','processing','failed']) {
  const fixture=structuredClone(takes[0]),a=fixture.fixture_analysis;
  if(state==='locked'||state==='uncertain') {
   a.word_check.matched_count=2;a.word_check.tier=state==='locked'?'below_60':null;
   a.word_check.status=state==='locked'?'reliable':'uncertain';a.analysis_scope='none';a.result=null;
   a.state=state==='uncertain'?'needs_review':'completed';
   a.layers=Object.fromEntries(['sound','rhythm','melody'].map(l=>[l,{state:'locked',reason:null}]));
  } else {
   a.state=state;a.phase='checking_words';a.result=null;a.retryable=state==='failed';a.error_code=state==='failed'?'asr_timeout':null;
   a.layers=Object.fromEntries(['sound','rhythm','melody'].map(l=>[l,{state:state==='failed'?'unavailable':'pending',reason:null}]));
  }
  const page=await browser.newPage({viewport:{width:1192,height:1000}});
  await page.addInitScript(f=>sessionStorage.setItem('quick-fixture-takes',JSON.stringify([f])),fixture);
  await page.goto(base+'&shadowMode=review&takeId=older-paired',{waitUntil:'domcontentloaded',timeout:90000});
  await page.getByRole('heading',{name:'Takes',exact:true}).waitFor({timeout:60000});
  if(state==='locked'||state==='uncertain') {
   await page.getByText('Analysis locked',{exact:true}).waitFor();
   assert.equal(await page.getByRole('heading',{name:'Overview',exact:true}).count(),0);
   assert.equal(await page.getByRole('region',{name:'Analysis status',exact:true}).count(),0);
   assert.equal(await page.getByRole('group',{name:'Overview layers',exact:true}).count(),0);
   assert.equal(await page.getByRole('group',{name:'Voices',exact:true}).count(),0);
   assert.equal(await page.getByRole('slider',{name:'Timeline zoom',exact:true}).count(),0);
   const del=page.getByRole('region',{name:'Saved practice',exact:true}).getByRole('button',{name:'Delete analysis',exact:true});
   await del.waitFor();page.once('dialog',d=>d.dismiss());await del.click();assert.equal(await del.count(),1);
  } else {
   const notice=page.getByRole('region',{name:'Analysis status',exact:true});await notice.waitFor();
   await notice.getByText(state==='failed'?'Word check timed out.':'Checking words…',{exact:true}).waitFor();
   assert.ok((await notice.boundingBox()).height<=80);
   if(state==='failed')assert.equal(await notice.getByRole('button',{name:'Retry analysis',exact:true}).isEnabled(),true);
   else assert.equal(await notice.getByRole('button',{name:'Cancel',exact:true}).isEnabled(),true);
  }
  assert.equal(await page.getByRole('region',{name:'Analysis timeline',exact:true}).count(),0);
  await page.screenshot({path:`output/playwright/analysis-refinement-${state}.png`,fullPage:true});
  console.log(`PASS ${state}: compact status, no empty timeline chrome, retained recovery/history controls`);await page.close();
 }
}finally{await browser.close();}
