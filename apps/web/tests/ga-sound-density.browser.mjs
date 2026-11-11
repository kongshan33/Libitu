// Synthetic density fixture: these added cues test layout only, not linguistic rules.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {takes,base} from './helpers/ga-sound-fixture.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE??'playwright');
const take=structuredClone(takes[0]);
for(const [kind,subtype] of [['weak_form','function_word'],['syllabic','n'],['unreleased','stop_cluster']]){
 take.fixture_sound.candidates.push({...take.fixture_sound.candidates[0],id:`density-${kind}`,kind,subtype,token_start:6,token_end:7,source_text:'water',
  anchor:{type:'word',token_index:6},alternative_group:null,rule_id:'synthetic-density-only',phonemes_before:'layout fixture',phonemes_after:kind==='weak_form'?'[ə]':kind==='syllabic'?'[n̩]':'[t̚]',
  explanation:'Synthetic density cue; not a pronunciation example.',conditions:['Layout test only.']});
}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const width of [1400,390])for(const mode of ['detailed','review']){
 const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width===390});
 await page.addInitScript(take=>sessionStorage.setItem('quick-fixture-takes',JSON.stringify([take])),take);
 await page.goto(`${base}&shadowMode=${mode}&takeId=ga-paired`,{waitUntil:'domcontentloaded',timeout:120000});
 const panel=page.getByRole('region',{name:mode==='detailed'?'Saved sound word comparison':'Analysis timeline',exact:true});await panel.waitFor({timeout:90000});
 const word=panel.getByRole('button',{name:`${mode==='detailed'?'Explore':'Compare'} water, word 7${mode==='detailed'?' · Reference':''}`,exact:true}).first();await word.waitFor();
 const row=mode==='detailed'?word:word.locator('[data-sound-cues][data-sound-voice=reference]');
 assert.equal(await row.locator('.sound-inline-badge').count(),2);
 const more=panel.getByRole('button',{name:'+2 more sound categories: water, word 7 · Reference',exact:true});
 await more.focus();await page.keyboard.press('Enter');
 assert.equal(await more.getAttribute('aria-expanded'),'true');
 const expanded=panel.getByRole('list',{name:'All sound categories: water',exact:true});
 assert.equal(await expanded.locator('.sound-inline-badge').count(),4);
 assert.equal(await row.locator('.sound-inline-badge').count(),2,'expanded explanation does not crowd the word flow');
 assert.equal(await panel.locator('button button').count(),0);
 await more.click();assert.equal(await more.getAttribute('aria-expanded'),'false');
 assert.equal(await expanded.count(),0);
 await more.press('Space');assert.equal(await more.getAttribute('aria-expanded'),'true');
 const details=panel.getByRole('region',{name:'Sound explanation',exact:true});
 assert.equal(await details.locator('summary').count(),4);
 await details.locator('summary').last().focus();await page.keyboard.press('Enter');
 await details.getByText('Synthetic density cue; not a pronunciation example.',{exact:true}).last().waitFor();
 await panel.getByRole('button',{name:'Weakening',exact:true}).click();
 assert.equal(await more.getAttribute('aria-expanded'),'false','filter changes close the expanded category list');
 const muted=panel.locator('.sound-inline-badge[data-muted=true],.sound-link[data-muted=true]');
 const checkOpacity=async()=>assert.ok(await muted.evaluateAll(nodes=>nodes.length>0&&nodes.every(el=>getComputedStyle(el).opacity==='0.2')));
 await page.waitForTimeout(200);await checkOpacity();
 await word.hover();await page.waitForTimeout(200);await checkOpacity();
 await word.focus();await checkOpacity();
 const arc=panel.locator('.sound-link[data-muted=true]').first();
 await arc.hover();await arc.focus();await page.waitForTimeout(200);await checkOpacity();
 await arc.click();await checkOpacity();
 assert.equal(await panel.getByRole('region',{name:'Sound explanation',exact:true}).evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.equal(await word.evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await panel.getByRole('button',{name:'Hide text',exact:true}).click();
 assert.equal(await panel.locator('.sound-more,.sound-inline-badge,.sound-link').count(),0);
 await page.close();console.log(`PASS ${width}px ${mode}: two categories, +2 keyboard toggle, strict 20% on hover/focus/expanded arcs, concealment`);
}}finally{await browser.close();}
