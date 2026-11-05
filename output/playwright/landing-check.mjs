import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {installLoadoutFixture,loadoutOwner} from '../../apps/web/tests/helpers/loadout-fixture.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/river/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
for(const width of [1440,768,390,320]) {
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage(); const fixture=await installLoadoutFixture(page,{origin:'http://localhost:3000'});
 await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded',timeout:90000});
 const input=page.getByRole('textbox',{name:'YouTube video link'}); await input.waitFor();
 await page.getByRole('button',{name:'Sign in',exact:true}).waitFor();
 await input.fill('test'); await input.fill('');
 await page.getByRole('button',{name:'Analyze video',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Paste a YouTube'}).waitFor();
 assert.equal(await input.evaluate(el=>el===document.activeElement),true);
 await input.fill('https://example.com');
 await page.getByRole('button',{name:'Analyze video',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Enter a YouTube'}).waitFor();
 await input.fill('');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await page.mouse.move(0,0);
 assert.equal(await page.getByRole('button',{name:'Analyze video',exact:true}).evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(12, 10, 9)');
 assert.equal(await page.locator('main i').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.locator('h1').click();
 await page.screenshot({path:`output/playwright/landing-${width}.png`,fullPage:true});
 await page.evaluate(owner=>window.__setLoadoutUser(owner),loadoutOwner);
 await page.locator('header').getByRole('link',{name:'My learning',exact:true}).waitFor();
 assert.equal(await page.locator('header').getByRole('link',{name:'How it works'}).count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await page.getByRole('link',{name:'Paste a video link',exact:true}).click();
 await page.waitForURL(/#video-url$/);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded'});
 await input.waitFor();
 assert.notEqual(await page.locator('main i').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.deepEqual(fixture.errors,[]);
 console.log(`Landing passed ${width}`); await context.close();
}
} catch(error) { for(const context of browser.contexts()) for(const page of context.pages()) { console.log(await page.locator('body').innerText()); console.log(page.url()); await page.screenshot({path:'output/playwright/landing-failure.png'}); } throw error; } finally {await browser.close();}
