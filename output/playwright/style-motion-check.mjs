import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {installLoadoutFixture,loadoutOwner} from '../../apps/web/tests/helpers/loadout-fixture.mjs';
const {chromium}=createRequire(import.meta.url)('/Users/river/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try { for(const width of [1440,390]) {
 const page=await browser.newPage({viewport:{width,height:900}});
 page.setDefaultTimeout(15000);
 await installLoadoutFixture(page,{origin:'http://localhost:3000',initialOwner:loadoutOwner});
 await page.goto('http://localhost:3000/corpus',{waitUntil:'domcontentloaded',timeout:120000});
 const trigger=page.getByRole('button',{name:'Type',exact:false});
 // Check actual filter controls by their expanded state, independent of labels.
 const filter=page.locator('[aria-haspopup="dialog"][aria-expanded]').first();
 console.log("filter",width);await filter.click();
 const panel=page.locator('[class*=filterPanel]:not([hidden])');await panel.waitFor();
 assert.equal(await panel.evaluate(n=>getComputedStyle(n).transitionDuration.split(',')[0]),'0.16s');
 await panel.getByRole('button',{name:'Done',exact:true}).click();
 await panel.waitFor({state:'hidden'});
 assert.equal(await filter.evaluate(n=>n===document.activeElement),true);
 await page.emulateMedia({reducedMotion:'reduce'});console.log("filter",width);await filter.click();
 assert.equal(await panel.evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
 await page.goto('http://localhost:3000/loadout',{waitUntil:'domcontentloaded',timeout:120000});
 const hero=page.getByRole("region",{name:"Quick start",exact:true});await hero.waitFor();
 assert.equal(await hero.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(12, 10, 9)');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await page.screenshot({path:`output/playwright/style-loadout-${width}.png`,fullPage:true});
 console.log(`Visual/motion checks passed at ${width}px`);await page.close();
 }} finally {await browser.close();}
