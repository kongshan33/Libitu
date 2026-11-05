import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { installLoadoutFixture, loadoutOwner, fixtureContentId, shadowBlueprint } from './helpers/loadout-fixture.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.LIBITU_TEST_URL ?? 'http://localhost:3000';
shadowBlueprint.transcript[0].parts = ['Let us practice this sentence now.'];
shadowBlueprint.transcript[0].source_token_end = 7;
shadowBlueprint.transcript.push({ ...shadowBlueprint.transcript[0], id:'sentence-v2-loadout-next', time:'0:04', start_ms:4000, end_ms:7000, source_token_start:7, source_token_end:13, parts:['We can practice another sentence together.'] });
shadowBlueprint.segments[0].transcript_end_index = 2;
shadowBlueprint.segments[0].end_ms = 7000;
const browser = await chromium.launch({ channel:'chrome', headless:true });
try { for (const width of [1400,390]) {
  const context = await browser.newContext({viewport:{width,height:1100}});
  const page = await context.newPage();
  const state = await installLoadoutFixture(page,{origin,initialOwner:loadoutOwner,shadow:true});
  const gates = new Map();
  for (const row of shadowBlueprint.transcript) {
    let release; const promise = new Promise(resolve => { release = resolve; });
    gates.set(row.id,{promise,release,requested:false});
  }
  await page.route('**/api/practice/**',async route=>{
    const request=route.request(),url=new URL(request.url());
    const headers={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type'};
    if(request.method()==='OPTIONS')return route.fulfill({status:204,headers});
    if(url.pathname==='/api/practice/attempts/progress')return route.fulfill({headers,json:{practiced_sentence_ids:[]}});
    if(url.pathname==='/api/practice/attempts' && request.method()==='GET'){
      const gate=gates.get(url.searchParams.get('sentence_id'));
      if(gate){gate.requested=true;await gate.promise;}
      return route.fulfill({headers,json:{items:[],next_offset:null}});
    }
    return route.fulfill({headers,json:{items:[],sentences:[]}});
  });
  await page.addInitScript(()=>{
    window.__emptyTakeFlash=false;window.__watchEmpty=true;
    new MutationObserver(()=>{
      if(window.__watchEmpty && [...document.querySelectorAll('.practice-history p')].some(p=>p.textContent==='No saved takes yet.'))window.__emptyTakeFlash=true;
    }).observe(document,{childList:true,subtree:true});
  });
  await page.goto(`${origin}/practice/${fixtureContentId}/shadow?segmentId=loadout-segment&sentenceId=sentence-v2-loadout&shadowMode=detailed`);
  const history=page.getByRole('region',{name:'Saved practice',exact:true});
  await history.getByRole('status',{name:'Loading saved practice…'}).waitFor();
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>window.__emptyTakeFlash),false,'initial history never flashes an empty result');
  await page.evaluate(()=>{window.__watchEmpty=false;});
  gates.get('sentence-v2-loadout').release();
  await history.getByText('No saved takes yet.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Next sentence',exact:true}).click();
  await history.getByRole('status',{name:'Loading saved practice…'}).waitFor();
  assert.equal(await history.getByText('No saved takes yet.',{exact:true}).count(),0);
  gates.get('sentence-v2-loadout-next').release();
  await history.getByText('No saved takes yet.',{exact:true}).waitFor();
  assert.ok(gates.get('sentence-v2-loadout-next').requested);
  assert.deepEqual(state.errors,[]);
  console.log(`PASS ${width}: initial and switched sentence history wait for resolved data before showing empty state`);
  await context.close();
}}finally{await browser.close();}
