import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {installLoadoutFixture, fixtureContentId, loadoutOwner} from './helpers/loadout-fixture.mjs';
import {installAnalyticsFixture} from './helpers/analytics-fixture.mjs';
import {installProfileFixture} from './helpers/profile-fixture.mjs';
import {speakingSessionId} from './helpers/speaking-fixture.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE??'playwright');
const origin=process.env.LIBITU_TEST_URL??'http://localhost:3000';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {for(const width of [1400,390]) for(const target of ['landing','corpus','loadout','report','profile','shadow']) {
 const page=await browser.newPage({viewport:{width,height:1100}});
 if(target==='report') await installAnalyticsFixture(page,{origin});
 else if(target==='profile') await installProfileFixture(page,{origin});
 else await installLoadoutFixture(page,{origin,shadow:true,initialOwner:loadoutOwner});
 await page.route('**/api/practice/attempts/progress?*',route=>route.fulfill({json:{practiced_sentence_ids:[],best_word_matches:{}},headers:{'access-control-allow-origin':'*','access-control-allow-headers':'content-type,authorization'}}));
 const path={landing:'/',corpus:'/corpus',loadout:'/loadout',profile:'/profile',report:`/speaking/${speakingSessionId}/analytics`,shadow:`/practice/${fixtureContentId}/shadow?segmentId=loadout-segment&sentenceId=sentence-v2-loadout&shadowMode=detailed`}[target];
 await page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:90000});
 const ready={landing:'Learn from real speech.',corpus:'Corpus library',loadout:'Mission loadout',profile:'Recent practice',report:'Your mission report'};
 if(target==='shadow')await page.getByRole('button',{name:'Record sentence',exact:true}).waitFor();
 else await page.getByRole('heading',{name:ready[target],exact:target!=='landing'}).first().waitFor();
 if(target==='loadout') await page.getByRole('button',{name:'Shuffle picks',exact:true}).waitFor();
 const metrics=await page.locator('.ui-button').evaluateAll(nodes=>nodes.filter(el=>el.getClientRects().length&&el.dataset.size!=='inherit'&&el.dataset.shape!=='circle').map(el=>{
  const css=getComputedStyle(el),r=el.getBoundingClientRect();
  return {text:el.textContent,size:el.dataset.size,height:r.height,font:css.fontSize,group:!!el.closest('.ui-button-group'),width:r.width,scroll:el.scrollWidth,client:el.clientWidth};
 }));
 assert.ok(metrics.length,`${target} has controls`);
 for(const m of metrics){const size=m.group?'lg':m.size;assert.ok(m.height>={sm:32,md:40,lg:44}[size]-1,JSON.stringify({target,m}));assert.equal(m.font,{sm:'12px',md:'13px',lg:'14px'}[size],JSON.stringify({target,m}));}
 const groups=await page.locator('.ui-button-group').evaluateAll(nodes=>nodes.map(group=>[...group.querySelectorAll('.ui-button')].filter(el=>el.getClientRects().length&&el.dataset.size!=='inherit'&&el.dataset.shape!=='circle').map(el=>el.getBoundingClientRect().height)));
 for(const heights of groups)if(heights.length>1)assert.ok(Math.max(...heights)-Math.min(...heights)<1,JSON.stringify({target,heights}));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${target} overflow`);
 console.log(`PASS ${width} ${target}: ${metrics.length} shared controls, size typography and equal action groups`);await page.close();
}}finally{await browser.close();}
