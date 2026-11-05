import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('/Users/river/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const content='aa000000-0000-4000-8000-000000000044',sentence='sentence-v2-quick-0',text='We practice speaking every day.';
const tokens=[...text.matchAll(/[a-z]+/gi)].map(m=>({display:m[0],normalized:m[0].toLowerCase(),start:m.index,end:m.index+m[0].length}));
function signal(duration) {return {version:'server-prominence-v1',feature_version:'fixture',aggregation_version:'fixture',boundary_source:'mfa',duration_evaluated:true,duration_sec:duration*5,time_step_sec:.05,pitch_st:[],prominence:[],words:tokens.map((t,i)=>({text:t.display,source_index:i,start_sec:i*duration,end_sec:(i+1)*duration,value:.2+i*.12,uncertain:i===2,reasons:[],sensitivity_range:[]})),display_frames:Array.from({length:Math.floor(duration*5/.02)},(_,i)=>({time_sec:i*.02,pitch_st:i%29>24?null:Math.sin(i*.15)*4,energy_dbfs:-22+Math.sin(i*.2)*8})),reasons:[],experimental:true};}
function voice(duration){return {content:{status:'matched',transcript:text,reason:null},alignment_status:'aligned',quality_issues:[],words:tokens.map((t,i)=>({text:t.display,source_index:i,recognized_index:i,start_sec:i*duration,end_sec:(i+1)*duration,duration_ms:duration*1000,pause_after_ms:0,boundary_pause_ms:0,phones:[{label:'IY1',duration_ms:100}],pitch_curve_st:[0,1,2]})),rhythm_signal:signal(duration)};}
function take(id,ref,created){return {id,content_id:content,sentence_id:sentence,sentence_text:text,start_ms:1000,end_ms:4000,reference_version:'fixture',duration_ms:3500,playback_rate:1,text_visible:true,recording_state:'none',created_at:created,evidence_source:'browser_recording',fixture_analysis:{id,sentence_id:sentence,analysis_version:'practice-gated-v3',state:'completed',phase:'finished',analysis_scope:'all_layers',created_at:created,error_code:null,retryable:false,word_check:{version:'word-match-v1',status:'reliable',reason:null,transcript:text,source_tokens:tokens,recognized_tokens:tokens,operations:tokens.map((_,i)=>({kind:'matched',source_index:i,recognized_index:i,source_boundary:null})),matched_count:5,source_count:5,tier:'full_85_plus'},layers:Object.fromEntries(['sound','rhythm','melody'].map(l=>[l,{state:'partial',reason:ref?null:'learner_only'}])),result:{learner:voice(.7),reference:ref?voice(.5):null,comparison:ref?'available':'unavailable',reason:ref?null:'reference_unavailable'}}};}
const takes=[take('older-paired',true,'2026-11-04T10:00:00Z'),take('newer-solo',false,'2026-11-04T10:05:00Z')];
const base=`http://127.0.0.1:3011/practice/${content}/shadow?segmentId=quick-segment&sentenceId=${sentence}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(takes=>{sessionStorage.setItem('quick-fixture-takes',JSON.stringify(takes));},takes);
 await page.goto(base+'&shadowMode=detailed&takeId=older-paired',{waitUntil:'domcontentloaded',timeout:120000});
 const sound=page.getByRole('tab',{name:'Sound',exact:true});await sound.waitFor({timeout:90000});
 assert.ok(page.url().includes('takeId=older-paired'));
 await page.locator('.stage-two-practice-main').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`output/playwright/analysis-detailed-top-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Notes',exact:true}).click();assert.equal(await page.getByRole('complementary',{name:'Sound notes'}).count(),1);
 await page.getByRole('button',{name:'Notes',exact:true}).click();assert.equal(await page.getByRole('complementary',{name:'Sound notes'}).count(),0);
 await page.screenshot({path:`output/playwright/analysis-detailed-sound-${width}.png`,fullPage:true});
 await page.getByRole('tab',{name:'Rhythm',exact:true}).click();
 let timeline=page.getByRole('region',{name:'Analysis timeline',exact:true}).filter({visible:true});
 let word=timeline.getByRole('button',{name:'Compare speaking, word 3',exact:true});await word.click();assert.equal(await word.getAttribute('aria-pressed'),'true');
 await page.getByRole('tab',{name:'Melody',exact:true}).click();timeline=page.getByRole('region',{name:'Analysis timeline',exact:true}).filter({visible:true});assert.equal(await timeline.getByRole('button',{name:'Compare speaking, word 3',exact:true}).getAttribute('aria-pressed'),'true');
 assert.equal(await timeline.locator('[class*=AnalysisTimeline_melody] path[data-voice=reference]').count(),5);
 await page.screenshot({path:`output/playwright/analysis-detailed-melody-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'View analysis',exact:true}).last().click();
 await page.getByRole('heading',{name:'Overview',exact:true}).waitFor();assert.ok(page.url().includes('takeId=older-paired'));
 timeline=page.getByRole('region',{name:'Analysis timeline',exact:true}).filter({visible:true});await timeline.getByRole('button',{name:'Compare speaking, word 3',exact:true}).waitFor();
 assert.equal(await timeline.getByRole('button',{name:'Compare speaking, word 3',exact:true}).getAttribute('aria-pressed'),'true');
 const voices=page.getByRole('group',{name:'Voices',exact:true});await voices.getByRole('button',{name:'Reference',exact:true}).click();assert.equal(await voices.getByRole('button',{name:'Reference',exact:true}).getAttribute('aria-pressed'),'false');
 await voices.getByRole('button',{name:'You',exact:true}).click();assert.equal(await voices.getByRole('button',{name:'You',exact:true}).getAttribute('aria-pressed'),'true');
 await voices.getByRole('button',{name:'Reference',exact:true}).click();
 const layers=page.getByRole('group',{name:'Overview layers',exact:true});for(const name of ['Sound','Rhythm','Melody'])await layers.getByRole('button',{name,exact:true}).click();
 await page.getByText('Turn on at least one layer to see it here.',{exact:true}).waitFor();for(const name of ['Sound','Rhythm','Melody'])await layers.getByRole('button',{name,exact:true}).click();
 const slider=timeline.getByRole('slider',{name:'Timeline zoom',exact:true});await slider.fill('0.6');
 const scroll=timeline.getByRole('region',{name:'Scrollable word timeline',exact:true});await scroll.scrollIntoViewIfNeeded();
 const rect=await scroll.boundingBox();await page.mouse.move(rect.x+rect.width*.8,rect.y+80);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.25,rect.y+80,{steps:12});await page.mouse.up();
 assert.ok(await scroll.evaluate(el=>el.scrollLeft)>0);assert.equal(await timeline.getByRole('button',{name:'Compare speaking, word 3',exact:true}).getAttribute('aria-pressed'),'true');
 await timeline.getByRole('button',{name:'Fit',exact:true}).click();
 await page.screenshot({path:`output/playwright/analysis-review-paired-${width}.png`,fullPage:true});
 await page.getByRole('group',{name:'Saved take',exact:true}).getByRole('button').first().click();
 await page.getByText('Reference audio unavailable for this take. Showing your voice only.',{exact:true}).waitFor();
 assert.equal(await voices.getByRole('button',{name:'Reference',exact:true}).isDisabled(),true);
 assert.equal(await page.locator('details.stage-two-audio-settings:visible').count(),0);
 assert.equal(await page.getByRole('region',{name:'Reference preparation'}).count(),0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:`output/playwright/analysis-review-solo-${width}.png`,fullPage:true});
 assert.deepEqual(errors,[]);console.log(`PASS ${width}: Notes, selection sync, exact take, voices, layer toggles, zoom, drag, no-reference, no overflow`);
 await page.close();
}}finally{await browser.close();}
