import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { installLoadoutFixture, loadoutOwner } from '../../../apps/web/tests/helpers/loadout-fixture.mjs';
const { chromium } = createRequire(import.meta.url)('/Users/river/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.LIBITU_TEST_URL ?? 'http://localhost:3000';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
  for (const width of [1400,390].filter(value=>!process.env.LIBITU_WIDTH || value===Number(process.env.LIBITU_WIDTH))) {
    const context = await browser.newContext({viewport:{width,height:1100}});
    const page = await context.newPage();
    const state = await installLoadoutFixture(page,{origin,initialOwner:loadoutOwner});
    await page.goto(`${origin}/loadout`,{waitUntil:'domcontentloaded',timeout:60000});
    const shuffle = page.getByRole('button',{name:'Shuffle picks',exact:true});
    await shuffle.waitFor();
    await page.waitForFunction(() => document.querySelector('[data-pending]')?.dataset.pending === 'false');
    const card = page.getByRole('region',{name:'Quick start',exact:true});
    const top = await card.evaluate(el=>el.getBoundingClientRect().top+window.scrollY);
    const status = page.locator('[data-pending]');
    async function holdSave() {
      await page.evaluate(() => new Promise(resolve => {
        void navigator.locks.request('libitu:loadout:v1',()=>new Promise(release=>{window.releaseDraftSave=release;resolve();}));
      }));
    }
    await holdSave();
    await shuffle.click();
    await page.waitForFunction(() => document.querySelector('[data-pending]')?.dataset.pending === 'true');
    assert.equal(await status.isVisible(),false,'short save has no flashing status');
    assert.equal(await card.evaluate(el=>el.getBoundingClientRect().top+window.scrollY),top);
    await page.evaluate(()=>window.releaseDraftSave());
    await page.waitForFunction(() => document.querySelector('[data-pending]')?.dataset.pending === 'false');
    await page.waitForTimeout(700);
    assert.equal(await status.isVisible(),false,'completed save cancels the delayed notice');
    await holdSave();
    await shuffle.click();
    await status.waitFor({state:'visible'});
    assert.equal(await status.innerText(),'Saving draft…');
    assert.equal(await card.evaluate(el=>el.getBoundingClientRect().top+window.scrollY),top,'slow save never shifts the card');
    const back = await page.getByRole('link',{name:'Back to learning'}).boundingBox();
    const box = await status.boundingBox();
    assert.ok(box.x>=back.x+back.width,'status does not cover back navigation');
    await page.screenshot({path:`output/playwright/shuffle-status/slow-${width}.png`,animations:'disabled'});
    await page.evaluate(()=>window.releaseDraftSave());
    await page.waitForFunction(() => document.querySelector('[data-pending]')?.dataset.pending === 'false');
    assert.equal(await status.isVisible(),false);
    const seed = await page.evaluate(owner=>JSON.parse(localStorage.getItem('libitu:loadout:v1')).accounts[owner].draft.shuffleSeed,loadoutOwner);
    assert.equal(seed,2,'both shuffle changes are persisted');
    assert.equal(state.creates.length,0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    console.log(`PASS ${width}: quiet short save, delayed slow-save notice, no layout shift/overlap, both shuffles persisted`);
    await context.close();
  }
} finally { await browser.close(); }
