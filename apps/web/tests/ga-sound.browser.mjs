// Next dev :3000 + helpers/quick-browser-fixture.mjs :3011. Synthetic audio; no account/provider writes.
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {takes,base} from './helpers/ga-sound-fixture.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE??'playwright');
const output=process.env.LIBITU_SCREENSHOT_DIR??'output/playwright/sound-v3';mkdirSync(output,{recursive:true});writeFileSync(`${output}/fixture.json`,JSON.stringify(takes));
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
async function capture(page,target,name){
 await target.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
 await page.screenshot({path:`${output}/${name}.png`,animations:'disabled',style:'[data-ga-fixture-tools] { visibility:hidden; }'});
}
async function geometry(page,scope,width){
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');
 const groups=scope.getByRole('group',{name:'Sound phenomenon filters',exact:true});
 assert.equal(await groups.getByRole('button').count(),13);
 assert.ok(await groups.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'groups fit viewport');
 assert.ok(await groups.getByRole('button').evaluateAll(nodes=>nodes.every(el=>getComputedStyle(el).fontSize==='13px')),'Detailed and Review share filter typography');
 if(width===390)assert.ok(await groups.getByRole('button').evaluateAll(nodes=>nodes.every(el=>el.getBoundingClientRect().height>=44)));
 assert.ok(await scope.locator('.sound-inline-badge').evaluateAll(nodes=>nodes.length>0&&nodes.every(el=>el.dataset.evidence==='candidate'&&getComputedStyle(el).outlineStyle!=='dashed')));
 assert.equal(await scope.locator('button button').count(),0,'arc buttons are siblings, never nested in word buttons');
 assert.equal(await scope.locator('[data-evidence=measured]').count(),0);
 assert.ok(await scope.getByRole('button',{name:'Linking',exact:true}).locator('[aria-label$="candidate events"]').count());
}
async function filtering(scope){
 const page=scope.page(),activity=()=>page.evaluate(()=>{const a=window.__quickFixtureActivity;return {play:a.play,pause:a.pause,record:a.record,requests:a.api.filter(r=>r.path.endsWith('/sound')||r.method!=='GET')};});
 const before=await activity();
 await scope.getByRole('button',{name:'Elision',exact:true}).click();await scope.getByRole('button',{name:'H',exact:true}).click();
 await scope.getByRole('button',{name:'Assimilation',exact:true}).click();
 assert.equal(await scope.getByRole('group',{name:'Elision subtypes',exact:true}).count(),0);
 await scope.getByRole('button',{name:'Elision',exact:true}).click();
 assert.equal(await scope.getByRole('button',{name:'All elision',exact:true}).getAttribute('aria-pressed'),'true');
 await scope.getByRole('button',{name:'Voicing change',exact:true}).click();
 assert.equal(await scope.getByRole('button',{name:'Voicing change',exact:true}).isEnabled(),true,'zero counts remain selectable');
 await scope.getByText(/No suggestions/).first().waitFor();
 await scope.getByRole('button',{name:'All reading cues',exact:true}).click();
 assert.deepEqual(await activity(),before,'filters do not control media or request analysis');
}
async function linking(scope){
 const page=scope.page(),arcs=scope.locator('.sound-link').and(scope.getByRole('button',{name:/ · Reference$/})),card=scope.getByRole('region',{name:'Sound explanation',exact:true});
 const filterGlyph=await scope.getByRole('button',{name:'Linking',exact:true}).locator('[class*=arc]').innerText();
 assert.equal(filterGlyph,'‿');assert.ok(await arcs.count()>1,'test more than one boundary');
 for(const index of [0,1]){
  const arc=arcs.nth(index),source=(await arc.getAttribute('aria-label')).replace('Explain linking: ','').split(' · ')[0];
  assert.equal(await arc.locator('[class*=arc]').innerText(),filterGlyph);
  await arc.focus();await page.keyboard.press('Enter');assert.equal(await arc.getAttribute('aria-expanded'),'true');
  assert.equal(await arc.getAttribute('aria-controls'),await card.getAttribute('id'));
  assert.equal(await card.locator('dt').count(),7);assert.ok((await card.locator('dd').first().innerText()).includes(source));
  assert.equal(await card.locator('summary').count(),0,'arc opens only its own candidate');
 }
 assert.equal(await scope.locator('.sound-link[aria-expanded=true]').count(),1);
 const second=arcs.nth(1);await second.click();assert.equal(await second.getAttribute('aria-expanded'),'false');
 await arcs.first().click();return card;
}
async function noLeak(scope){
 const widths=await scope.locator('[data-sound-voice=reference] .sound-word-card strong').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().width));
 const notes=scope.getByRole('button',{name:'Notes',exact:true});
 if(await notes.count())await notes.click();else await scope.locator('summary').filter({hasText:/^Notes$/}).click();
 await scope.getByRole('button',{name:'Hide text',exact:true}).click();
 if(widths.length){
  const masks=await scope.locator('[data-sound-voice=reference] .sound-word-card strong').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().width));
  assert.ok(new Set(masks.map(Math.round)).size>3,'masks follow actual word widths');
  assert.ok(masks.every((width,i)=>Math.abs(width-widths[i])<1),'cover width equals revealed word width');
 }
 assert.equal(await scope.locator('.sound-inline-badge,.sound-link,[aria-label$="candidate events"]').count(),0);
 assert.equal(await scope.getByRole('region',{name:'Sound explanation',exact:true}).locator('dd').count(),0);
 const snapshot=await scope.ariaSnapshot();assert.ok(!/Did you|put the|Explore button|Compare button|Dictionary reference:/.test(snapshot),snapshot);
 assert.equal(await scope.page().locator('.shadow-word-differences:visible').count(),0);
 assert.equal(await scope.page().locator('[aria-current=true][title*="Did you"]:visible').count(),0);
 await scope.getByRole('button',{name:/^Reveal word 1(?: · Reference)?$/}).first().click();
 assert.equal(await scope.locator('[data-phenomenon=coalescence][data-evidence]').count(),0,'one boundary word does not expose the other');
 await scope.getByRole('button',{name:'Show text',exact:true}).click();
 const closeNotes=scope.getByRole('button',{name:'Hide notes',exact:true});
 if(await closeNotes.count())await closeNotes.click();else await scope.locator('summary').filter({hasText:/^Notes$/}).click();
}
async function vowel(scope,prefix){
 await scope.getByRole('button',{name:'Vowel length',exact:true}).click();
 assert.equal(await scope.getByRole('button',{name:'Vowel length',exact:true}).isEnabled(),true);
 const card=scope.getByRole('region',{name:'Sound explanation',exact:true});
 for(const [word,index,length] of [['Bit',12,'shorter'],['bid',13,'longer']]){
  await scope.getByRole('button',{name:`${prefix} ${word}, word ${index}${prefix==='Explore'?' · Reference':''}`,exact:true}).click();
  await card.getByText(new RegExp(`relatively ${length}`)).waitFor();
  assert.equal(await card.locator('dt:visible').count(),7);
  assert.ok(!/\d+\s*ms|Pace-adjusted|Measured ·|aligned vowel label/.test(await card.innerText()));
 }
 return card;
}
try{for(const width of [1400,390]){
 const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width===390}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(takes=>sessionStorage.setItem('quick-fixture-takes',JSON.stringify(takes)),takes);
 for(const mode of ['detailed','review']){
  await page.goto(`${base}&shadowMode=${mode}&takeId=ga-paired`,{waitUntil:'domcontentloaded',timeout:120000});
  const scope=page.getByRole('region',{name:mode==='detailed'?'Saved sound word comparison':'Analysis timeline',exact:true});
  await scope.waitFor({timeout:90000});await scope.locator('.sound-inline-badge').first().waitFor();
  await geometry(page,scope,width);await filtering(scope);
  if(mode==='detailed'){
   assert.equal(await scope.locator('.sound-word-flow').count(),2);
   await scope.getByRole('heading',{name:'Reference',exact:true}).waitFor();await scope.getByRole('heading',{name:'Your voice',exact:true}).waitFor();
   assert.ok(await scope.locator('.sound-word-flow').evaluateAll(flows=>flows.every(el=>el.scrollWidth<=el.clientWidth+1)));
   assert.ok(await scope.locator('.sound-word-group').evaluateAll(groups=>groups.every(group=>{
    const b=group.getBoundingClientRect();return [...group.querySelectorAll('strong,.sound-inline-badge,.sound-link')].every(el=>{const r=el.getBoundingClientRect();return r.left>=b.left-1&&r.right<=b.right+1;});
   })),'cues fit natural word groups');
  }else{
   const check=async()=>assert.equal(await scope.locator('[data-sound-cues]').evaluateAll(rows=>rows.some(row=>{
    const b=row.getBoundingClientRect();return [...row.querySelectorAll('.sound-inline-badge')].some(n=>{const r=n.getBoundingClientRect();return r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;});
   })),false,'cues fit timeline lanes');
   await scope.getByRole('slider',{name:'Timeline zoom',exact:true}).fill('0.06');await check();await scope.getByRole('button',{name:'Fit',exact:true}).click();await check();
  }
  await linking(scope);await capture(page,scope.locator(mode==='detailed'?'.sound-word-flow':'[aria-label="Scrollable word timeline"]').first(),`${mode}-linking-${width}`);
  await capture(page,await vowel(scope,mode==='detailed'?'Explore':'Compare'),`${mode}-vowel-${width}`);
  await noLeak(scope);await scope.getByRole('button',{name:'All reading cues',exact:true}).click();
  await capture(page,scope.getByRole('group',{name:'Sound phenomenon filters',exact:true}),`${mode}-all-${width}`);
  if(mode==='review')for(const id of ['ga-solo','ga-partial']){
   await page.getByRole('group',{name:'Saved take',exact:true}).getByRole('button').filter({hasText:id==='ga-solo'?'Take 2':'Take 3'}).click();
   await page.waitForFunction(id=>location.search.includes(`takeId=${id}`),id);await scope.waitFor();
   assert.equal(await scope.getByRole('button',{name:'All reading cues',exact:true}).getAttribute('aria-pressed'),'true');
   await vowel(scope,'Compare');
   if(id==='ga-solo')assert.equal(await scope.getByRole('button',{name:'Reference',exact:true}).isDisabled(),true);
  }
 }
 assert.deepEqual(errors,[]);results.push({width,status:'passed',checks:['paired Reference cues and Your voice targets','13 filters with counts','Elision subtypes','solid shared palette','same lower linking arc','exact boundary explanation and keyboard toggle','7 explanation rows','conditional shorter/longer without measurements','no reference dependency','hidden spans and counts','minimum zoom/Fit','take changes','no overflow']});
 await context.close();console.log(`PASS GA Sound v3 ${width}px`);
}}finally{await browser.close();writeFileSync(`${output}/results.json`,JSON.stringify(results,null,2));}
