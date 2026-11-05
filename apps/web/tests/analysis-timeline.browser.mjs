// Start Next dev on 3000 and helpers/quick-browser-fixture.mjs on 3011. Synthetic account/analysis only.
import {mkdirSync} from 'node:fs';
mkdirSync('output/playwright',{recursive:true});
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? 'playwright');
const content='aa000000-0000-4000-8000-000000000044',sentence='sentence-v2-quick-0',text='We practice speaking every day.';
const tokens=[...text.matchAll(/[a-z]+/gi)].map(m=>({display:m[0],normalized:m[0].toLowerCase(),start:m.index,end:m.index+m[0].length}));
function signal(duration) {return {version:'server-prominence-v1',feature_version:'fixture',aggregation_version:'fixture',boundary_source:'mfa',duration_evaluated:true,duration_sec:duration*5+.3,time_step_sec:.05,pitch_st:[],prominence:[],words:tokens.map((t,i)=>({text:t.display,source_index:i,start_sec:i*duration,end_sec:(i+1)*duration,value:.2+i*.12,uncertain:i===2,reasons:[],sensitivity_range:[]})),display_frames:Array.from({length:Math.floor((duration*5+.3)/.02)},(_,i)=>({time_sec:i*.02,pitch_st:(i*.02>=duration*2&&i*.02<duration*2+.3)||i%29>24?null:Math.sin(i*.15)*4,energy_dbfs:-22+Math.sin(i*.2)*8})),reasons:[],experimental:true};}
function voice(duration){return {content:{status:'matched',transcript:text,reason:null},alignment_status:'aligned',quality_issues:[],words:tokens.map((t,i)=>({text:t.display,source_index:i,recognized_index:i,start_sec:i*duration+(i>1?.3:0),end_sec:(i+1)*duration+(i>1?.3:0),duration_ms:duration*1000,pause_after_ms:i===1?300:0,boundary_pause_ms:i===1?300:0,phones:[{label:'IY1',duration_ms:100}],pitch_curve_st:[0,1,2]})),rhythm_signal:signal(duration)};}
function take(id,ref,created){return {id,content_id:content,sentence_id:sentence,sentence_text:text,start_ms:1000,end_ms:4000,reference_version:'fixture',duration_ms:3500,playback_rate:1,text_visible:true,recording_state:'none',created_at:created,evidence_source:'browser_recording',fixture_analysis:{id,sentence_id:sentence,analysis_version:'practice-gated-v3',state:'completed',phase:'finished',analysis_scope:'all_layers',created_at:created,error_code:null,retryable:false,word_check:{version:'word-match-v1',status:'reliable',reason:null,transcript:text,source_tokens:tokens,recognized_tokens:tokens,operations:tokens.map((_,i)=>({kind:'matched',source_index:i,recognized_index:i,source_boundary:null})),matched_count:5,source_count:5,tier:'full_85_plus'},layers:Object.fromEntries(['sound','rhythm','melody'].map(l=>[l,{state:'partial',reason:ref?null:'learner_only'}])),result:{learner:voice(.7),reference:ref?voice(.5):null,comparison:ref?'available':'unavailable',reason:ref?null:'reference_unavailable'}}};}
const takes=[take('older-paired',true,'2026-11-04T10:00:00Z'),take('newer-solo',false,'2026-11-04T10:05:00Z')];
const palette={linking:'rgb(29, 78, 216)',weak_form:'rgb(87, 83, 78)',flap:'rgb(15, 118, 110)',elision:'rgb(91, 63, 199)',assimilation:'rgb(60, 79, 168)',glottal:'rgb(180, 83, 9)',drop_d:'rgb(146, 112, 12)',h_drop:'rgb(190, 24, 93)',vowel_length:'rgb(46, 125, 50)',voicing:'rgb(126, 63, 191)'};
for(const take of takes)take.fixture_sound={
 coverage:{known:tokens.length,total:tokens.length},
 tokens:tokens.map((t,index)=>({index,text:t.display,start:t.start,end:t.end,status:'known',pronunciations:[['AH1']],ipa:['test']})),
 candidates:[['linking',0,2],['weak_form',2,3],['flap',3,4]].map(([kind,start,end])=>({id:kind,kind,token_start:start,token_end:end,source_text:tokens.slice(start,end).map(t=>t.display).join(' '),phonemes_before:'test',phonemes_after:'test',explanation:'Synthetic sound cue for visual testing.',conditions:['synthetic'],rule_id:'fixture',status:'candidate'}))};
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
const cueStyles = nodes => Object.fromEntries(nodes.map(node => {
 const css=getComputedStyle(node);
 return [`${node.dataset.phenomenon}:${node.dataset.uncertain}`,Object.fromEntries(['color','backgroundColor','fontFamily','fontSize','fontWeight','borderRadius','padding','outlineStyle'].map(key=>[key,css[key]]))];
}));
async function assertReviewSound(timeline,detailedStyles,voiceCount) {
 const badges=timeline.locator('[data-sound-voice] .sound-inline-badge');
 const styles=await badges.evaluateAll(cueStyles);
 for(const [key,value]of Object.entries(styles))assert.deepEqual(value,detailedStyles[key],`Review cue matches Detailed: ${key}`);
 assert.equal(await timeline.locator('.sound-link').count(),voiceCount);
 assert.equal(await timeline.getByRole('button',{name:'Compare practice, word 2',exact:true}).locator('.sound-link').count(),0,'Do not repeat a linking arc on the end word');
 const learner=timeline.locator('[data-sound-voice=yours]');
 assert.equal(await learner.locator('.sound-link path').first().getAttribute('stroke-dasharray'),'3 2');
 assert.equal(await learner.locator('.sound-link .sound-inline-badge').first().innerText(),'LK?');
 const clipped=await timeline.locator('[data-sound-voice]').evaluateAll(rows=>rows.some(row=>{
  const box=row.getBoundingClientRect();
  return [...row.querySelectorAll('.sound-inline-badge,svg')].some(node=>{const b=node.getBoundingClientRect();return b.left<box.left-1||b.right>box.right+1||b.top<box.top-1||b.bottom>box.bottom+1;});
 }));
 assert.equal(clipped,false,'Sound badges and arcs fit their lanes');
}
const base=`http://127.0.0.1:3011/practice/${content}/shadow?segmentId=quick-segment&sentenceId=${sentence}`;
async function assertActionGeometry(page, width) {
 const row=page.locator('.shadow-practice-actions').filter({visible:true});
 const buttons=await row.locator('button').evaluateAll(nodes=>nodes.map(el=>({text:el.textContent,rect:el.getBoundingClientRect().toJSON()})));
 assert.equal(buttons.length,3);
 assert.ok(buttons.every(({rect})=>Math.abs(rect.height-44)<1),JSON.stringify(buttons));
 if(width>1040) {
  assert.ok(buttons.every(({rect})=>Math.abs(rect.y-buttons[0].rect.y)<1),'main actions share one baseline');
  const timer=await row.locator('.stage-two-recording-timer').boundingBox();
  assert.ok(Math.abs(timer.y+timer.height/2-buttons[0].rect.y-22)<1,'duration is centered with the buttons');
 }
}
async function assertSettingsPosition(page) {
 const settings=page.locator('.stage-two-audio-settings').filter({visible:true}),summary=settings.locator('summary');
 await summary.scrollIntoViewIfNeeded();
 const offset=()=>summary.evaluate(el=>el.getBoundingClientRect().left-el.closest('.stage-two-operation-footer').getBoundingClientRect().left);
 const before=await offset();assert.ok(before<2,'settings starts at the left edge');
 await summary.click();assert.equal(await offset(),before,'opening settings does not move the trigger');
 await summary.click();assert.equal(await offset(),before,'closing settings does not move the trigger');
}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const width of (process.env.LIBITU_TEST_WIDTHS ?? '1192,390').split(',').map(Number)){
 const page=await browser.newPage({viewport:{width,height:1506}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(takes=>{sessionStorage.setItem('quick-fixture-takes',JSON.stringify(takes));},takes);
 await page.goto(base+'&shadowMode=detailed&takeId=older-paired',{waitUntil:'domcontentloaded',timeout:120000});
 const sound=page.getByRole('tab',{name:'Sound',exact:true});
 try{await sound.waitFor({timeout:90000});}catch(error){
  await page.screenshot({path:`output/playwright/analysis-load-failure-${width}.png`,fullPage:true});
  console.error({url:page.url(),text:(await page.locator('body').innerText()).slice(0,1800),errors});throw error;
 }
 assert.ok(page.url().includes('takeId=older-paired'));
 await assertActionGeometry(page,width);
 await assertSettingsPosition(page);
 await page.locator('.stage-two-practice-main').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`output/playwright/analysis-detailed-top-${width}.png`,fullPage:true});
 const soundPanel=page.getByRole('region',{name:'Saved sound word comparison',exact:true});
 const focus=soundPanel.getByRole('complementary',{name:'Sound notes',exact:true});
 assert.equal(await focus.count(),0);
 await soundPanel.getByRole('button',{name:'Notes',exact:true}).click();await focus.waitFor();
 assert.equal(await soundPanel.getByRole('button',{name:'Hide notes',exact:true}).getAttribute('aria-expanded'),'true');
 const feedback=await focus.getByRole('region',{name:'Sound feedback'}).boundingBox(),tip=await focus.getByRole('region',{name:'Sound practice tip'}).boundingBox();
 if(width>600)assert.ok(tip.x>feedback.x+feedback.width);else assert.ok(tip.y>=feedback.y+feedback.height);
 await page.screenshot({path:`output/playwright/sound-prototype-notes-${width}.png`,fullPage:true});
 await soundPanel.getByRole('button',{name:'Hide notes',exact:true}).click();assert.equal(await focus.count(),0);
 await soundPanel.locator('.sound-link').first().waitFor();
 assert.equal(await soundPanel.locator('.sound-word-marks [data-phenomenon=vowel_length]').count(),0);
 const colors=await soundPanel.locator('.sound-phenomenon-legend [data-phenomenon]').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>[n.dataset.phenomenon,getComputedStyle(n).color])));
 assert.deepEqual(colors,palette);
 const detailedCueStyles=await soundPanel.locator('.sound-word-flow .sound-inline-badge').evaluateAll(cueStyles);
 assert.ok(await soundPanel.getByRole('group',{name:'Sound phenomenon filters'}).evaluate(el=>el.scrollWidth<=el.clientWidth+1));
 assert.equal(await soundPanel.locator('.sound-word-card strong').first().evaluate(el=>getComputedStyle(el).fontSize),'19px');
 assert.equal(await soundPanel.locator('.paired-learner .sound-inline-badge').first().evaluate(el=>getComputedStyle(el).outlineStyle),'dashed');
 assert.equal(await soundPanel.locator('.paired-learner .sound-link path').first().getAttribute('stroke-dasharray'),'3 2');
 const ipa=soundPanel.locator('.paired-reference .sound-word-ipa').first();await ipa.locator('..').focus();
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.paired-reference .sound-word-ipa')).opacity==='1');
 await soundPanel.getByRole('button',{name:'Vowel len.',exact:true}).click();assert.equal(await soundPanel.locator('[data-evidence=measured]').count(),10);
 await soundPanel.getByRole('button',{name:'Linking',exact:true}).click();assert.equal(await soundPanel.locator('.sound-boundary-pause').count(),2);
 await soundPanel.getByRole('button',{name:'All',exact:true}).click();
 await soundPanel.getByRole('button',{name:'Hide text',exact:true}).click();assert.equal(await soundPanel.locator('.sound-word-marks [data-phenomenon]').count(),0);
 await soundPanel.getByRole('button',{name:'Show text',exact:true}).click();
 await page.screenshot({path:`output/playwright/analysis-detailed-sound-${width}.png`,fullPage:true});
 await page.getByRole('tab',{name:'Rhythm',exact:true}).click();
 await page.getByRole('button',{name:'Notes',exact:true}).click();assert.equal(await page.getByRole('complementary',{name:'Rhythm notes'}).count(),1);
 await page.getByRole('button',{name:'Notes',exact:true}).click();assert.equal(await page.getByRole('complementary',{name:'Rhythm notes'}).count(),0);
 let timeline=page.getByRole('region',{name:'Analysis timeline',exact:true}).filter({visible:true});
 await assertReadable(timeline);
 await timeline.getByRole('slider',{name:'Timeline zoom',exact:true}).fill('0.18');
 const pauseWidths=await timeline.getByRole('button',{name:'Compare practice, word 2',exact:true}).evaluate(el=>({word:el.getBoundingClientRect().width,slot:el.parentElement.getBoundingClientRect().width}));
 assert.ok(pauseWidths.slot-pauseWidths.word>50);
 const envelopes=await timeline.locator('svg[class*=envelope] path').evaluateAll(nodes=>nodes.map(p=>p.getAttribute('d')));
 assert.ok(envelopes.every(Boolean));
 assert.equal(await timeline.locator('[data-pause=true]').count(),2);
 assert.equal(await timeline.locator('svg[class*=envelope]').first().evaluate(el=>getComputedStyle(el).fill),'rgb(239, 237, 235)');
 await page.screenshot({path:`output/playwright/analysis-detailed-rhythm-${width}.png`,fullPage:true});
 assert.equal(await page.getByRole('region',{name:'Saved practice',exact:true}).getByText('Analyzed',{exact:true}).count(),2);
 assert.equal(await page.getByLabel('Recording duration',{exact:true}).innerText(),'0:03');
 let word=timeline.getByRole('button',{name:'Compare speaking, word 3',exact:true});await word.click();assert.equal(await word.getAttribute('aria-pressed'),'true');
 if(width===1192) {
  const beforePause=await timeline.getByRole('button',{name:'Compare practice, word 2',exact:true}).boundingBox();
  await page.mouse.click(beforePause.x+beforePause.width+20,beforePause.y+10);
  assert.equal(await word.getAttribute('aria-pressed'),'true','Clicking silence must not select the preceding word');
 }
 await page.getByRole('tab',{name:'Melody',exact:true}).click();timeline=page.getByRole('region',{name:'Analysis timeline',exact:true}).filter({visible:true});assert.equal(await timeline.getByRole('button',{name:'Compare speaking, word 3',exact:true}).getAttribute('aria-pressed'),'true');
 await assertReadable(timeline);
 await timeline.getByRole('slider',{name:'Timeline zoom',exact:true}).fill('0.18');
 const pitch=await timeline.locator('[class*=AnalysisTimeline_pitchPlot] path').evaluateAll(nodes=>nodes.map(p=>p.getAttribute('d')));
 assert.ok(pitch.every(Boolean));
 assert.equal(await timeline.locator('[class*=AnalysisTimeline_pitchPlot] path[data-voice=reference]').count(),1);
 await page.screenshot({path:`output/playwright/analysis-detailed-melody-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'View analysis',exact:true}).last().click();
 await page.getByRole('heading',{name:'Overview',exact:true}).waitFor();assert.ok(page.url().includes('takeId=older-paired'));
 await assertActionGeometry(page,width);
 timeline=page.getByRole('region',{name:'Analysis timeline',exact:true}).filter({visible:true});await timeline.getByRole('button',{name:'Compare speaking, word 3',exact:true}).waitFor();
 assert.equal(await timeline.getByRole('button',{name:'Compare speaking, word 3',exact:true}).getAttribute('aria-pressed'),'true');
 await timeline.getByRole('slider',{name:'Timeline zoom',exact:true}).fill('0.18');
 assert.deepEqual(await timeline.locator('svg[class*=envelope] path').evaluateAll(nodes=>nodes.map(p=>p.getAttribute('d'))),envelopes);
 assert.deepEqual(await timeline.locator('[class*=AnalysisTimeline_pitchPlot] path').evaluateAll(nodes=>nodes.map(p=>p.getAttribute('d'))),pitch);
 assert.equal(await timeline.locator('[data-phenomenon=vowel_length]').count(),0);
 assert.equal(await timeline.locator('[data-phenomenon=linking]').first().evaluate(el=>getComputedStyle(el).color),palette.linking);
 await assertReviewSound(timeline,detailedCueStyles,2);
 assert.equal(await timeline.locator('[data-sound-voice=reference] .sound-link path').getAttribute('stroke-dasharray'),null);
 await assertReadable(timeline);
 await assertReviewSound(timeline,detailedCueStyles,2);
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
 await page.waitForFunction(()=>document.querySelector('[aria-label=Voices] button')?.disabled);
 assert.equal(await page.getByText('Reference audio unavailable for this take. Showing your voice only.',{exact:true}).count(),0);
 assert.equal(await voices.getByRole('button',{name:'Reference',exact:true}).isDisabled(),true);
 await assertReviewSound(timeline,detailedCueStyles,1);
 assert.equal(await timeline.locator('[data-sound-voice=reference]').count(),0);
 assert.equal(await page.locator('details.stage-two-audio-settings:visible').count(),0);
 assert.equal(await page.getByRole('region',{name:'Reference preparation'}).count(),0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:`output/playwright/analysis-review-solo-${width}.png`,fullPage:true});
 assert.equal(await page.getByRole('region',{name:'Analysis status',exact:true}).count(),0);
 assert.equal(await page.locator('.practice-analysis-status').count(),0);
 assert.equal(await page.getByText('Practice records are saved to your account.',{exact:false}).count(),0);
 assert.equal(await page.getByText('Continuous relative prominence is experimental',{exact:false}).count(),0);
 assert.equal(await page.getByRole('region',{name:'Saved practice',exact:true}).getByRole('button',{name:'Delete analysis',exact:true}).count(),1);
 await page.getByRole('navigation',{name:'Shadow mode',exact:true}).getByRole('button',{name:'Quick',exact:true}).click();
 await page.getByRole('heading',{name:'Quick shadowing',exact:true}).waitFor();
 await assertSettingsPosition(page);
 assert.deepEqual(errors,[]);console.log(`PASS ${width}: equal action heights/centered duration, stable Audio settings, shared Detailed/Review Sound badges/arcs/uncertainty, filters/IPA/folded Notes, separate pauses, shared curves/selection, exact take, zoom/drag, no overflow`);
 // Exercise wrapping with the supplied prototype's 27-word sentence.
 const longText='A lot of other companies just do one or the other and I think that is what your helming of this company has made it so valuable';
 const longTokens=[...longText.matchAll(/[a-z]+/gi)].map(m=>({display:m[0],normalized:m[0].toLowerCase(),start:m.index,end:m.index+m[0].length}));
 const long=structuredClone(takes[1]);long.sentence_text=longText;
 const check=long.fixture_analysis.word_check;check.transcript=longText;check.source_tokens=longTokens;check.recognized_tokens=longTokens;
 check.source_count=longTokens.length;check.matched_count=longTokens.length;check.operations=longTokens.map((_,i)=>({kind:'matched',source_index:i,recognized_index:i,source_boundary:null}));
 long.fixture_analysis.result.learner.words=longTokens.map((t,i)=>({...voice(.5).words[0],text:t.display,source_index:i,recognized_index:i,start_sec:i*.5,end_sec:(i+1)*.5}));
 long.fixture_sound.tokens=longTokens.map((t,index)=>({index,text:t.display,start:t.start,end:t.end,status:'known',pronunciations:[['AH1']],ipa:['test']}));
 long.fixture_sound.coverage={known:longTokens.length,total:longTokens.length};
 long.fixture_sound.candidates=[['weak_form',2,3],['linking',2,4],['weak_form',9,10],['weak_form',11,12],['linking',18,20],['weak_form',19,20]].map(([kind,start,end],i)=>({id:`long-${i}`,kind,token_start:start,token_end:end,source_text:longTokens.slice(start,end).map(t=>t.display).join(' '),phonemes_before:'test',phonemes_after:'test',explanation:'Possible connected-speech reading for layout verification.',conditions:['synthetic'],rule_id:'fixture',status:'candidate'}));
 await page.addInitScript(take=>sessionStorage.setItem('quick-fixture-takes',JSON.stringify([take])),long);
 await page.goto(base+'&shadowMode=detailed&takeId=newer-solo',{waitUntil:'domcontentloaded',timeout:120000});
 await soundPanel.waitFor({timeout:90000});await soundPanel.locator('.sound-link').first().waitFor();
 assert.equal(await soundPanel.locator('.paired-reference .sound-word-card').count(),27);
 assert.ok(await soundPanel.locator('.sound-word-flow').first().evaluate(el=>el.scrollWidth<=el.clientWidth+1));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await soundPanel.screenshot({path:`output/playwright/sound-prototype-long-${width}.png`});
 console.log(`PASS ${width}: prototype long-sentence wrapping`);
 await page.close();
}}finally{await browser.close();}
