import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {installLoadoutFixture} from '../../apps/web/tests/helpers/loadout-fixture.mjs';
const {chromium}=createRequire(import.meta.url)('/Users/river/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
for(const [width,height] of [[1192,1506],[1440,900],[390,844],[320,640]]) {
 const context=await browser.newContext({viewport:{width,height}});const page=await context.newPage();
 await installLoadoutFixture(page,{origin:'http://localhost:3000'});
 await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded',timeout:90000});
 await page.getByRole('button',{name:'Sign in',exact:true}).waitFor();
 const sections=page.locator('main > section'); const header=page.locator('header');
 const hh=(await header.boundingBox()).height;const first=await sections.nth(0).boundingBox();
 assert.ok(first.height>=height-hh-1);
 assert.ok((await sections.nth(1).boundingBox()).y>=height-1);
 await page.screenshot({path:`output/playwright/landing-screen-${width}.png`});
 await page.mouse.move(width/2,height/2);await page.mouse.wheel(0,height);
 await page.waitForFunction(h=>{const r=document.querySelector('#how-it-works').getBoundingClientRect();return r.height>innerHeight-h+2 ? r.top<=h+2 && r.top>-(innerHeight-h) : Math.abs(r.top-h)<2;},hh,{timeout:10000});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await page.screenshot({path:`output/playwright/landing-screen-two-${width}.png`});
 // Oversized phone sections must let users reach their final card.
 await sections.nth(1).getByText('Language you can reach for',{exact:true}).scrollIntoViewIfNeeded();
 await sections.nth(1).getByText('Language you can reach for',{exact:true}).waitFor({state:'visible'});
 await page.getByRole('link',{name:'Paste a video link',exact:true}).click();
 await page.waitForFunction(()=>{const r=document.querySelector('#video-url').getBoundingClientRect();return r.top>=0&&r.bottom<innerHeight;});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 await page.goto('http://localhost:3000/corpus',{waitUntil:'domcontentloaded',timeout:90000});
 await page.getByRole('heading',{name:'Corpus library'}).waitFor();
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollSnapType),'none');
 console.log(`PASS ${width}x${height}: full-height, wheel snap, long content, return anchor, reduced motion, route cleanup`);
 await context.close();
}
} finally {await browser.close();}
