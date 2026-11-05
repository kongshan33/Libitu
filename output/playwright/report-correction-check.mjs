import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {installAnalyticsFixture} from '../../apps/web/tests/helpers/analytics-fixture.mjs';
import {speakingSessionId} from '../../apps/web/tests/helpers/speaking-fixture.mjs';
const {chromium}=createRequire(import.meta.url)('/Users/river/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {for(const width of [1440,390]) {
 const page=await browser.newPage({viewport:{width,height:900}});
 await installAnalyticsFixture(page,{origin:'http://localhost:3000'});
 await page.goto(`http://localhost:3000/speaking/${speakingSessionId}/analytics`,{waitUntil:'domcontentloaded',timeout:90000});
 const retry=page.getByRole('button',{name:'Retry this mission',exact:true});await retry.waitFor();
 const adjust=page.getByRole('button',{name:'Adjust loadout',exact:true});
 assert.equal(await retry.locator('small').count(),0);
 assert.equal(await retry.evaluate(n=>getComputedStyle(n).fontSize),'15px');
 assert.equal(await retry.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(12, 10, 9)');
 assert.equal(await adjust.evaluate(n=>getComputedStyle(n).fontSize),'13px');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await retry.scrollIntoViewIfNeeded();await page.screenshot({path:`output/playwright/report-correction-${width}.png`});
 console.log(`Report buttons passed ${width}`);await page.close();
}} finally {await browser.close();}
