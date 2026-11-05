import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('/Users/river/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {for(const width of [1440,390]) {
 const page=await browser.newPage({viewport:{width,height:900}});
 for(const mode of ['quick','review','detailed']) {
  await page.goto(`http://127.0.0.1:3011/practice/aa000000-0000-4000-8000-000000000044/shadow?segmentId=quick-segment&shadowMode=${mode}`,{waitUntil:'domcontentloaded',timeout:90000});
  await page.getByRole('heading',{name:'Practice with a steady rhythm',exact:true}).waitFor({timeout:60000}).catch(async error=>{console.log(await page.locator('body').innerText());throw error;});
  const settings=page.locator('details.stage-two-audio-settings:visible');
  if(mode==='review') {assert.equal(await settings.count(),0);assert.equal(await page.getByRole('region',{name:'Reference preparation'}).count(),0);}
  else {await settings.waitFor();assert.equal(await settings.count(),1);if(mode==='quick') {assert.equal(await page.getByRole('region',{name:'Reference preparation'}).count(),0);const above=await page.locator('[class*=QuickShadowing_setup]').boundingBox();const box=await settings.boundingBox();assert.ok(box.y>=above.y+above.height);}}
  await page.screenshot({path:`output/playwright/shadow-layout-${mode}-${width}.png`});
  console.log(`${mode} controls passed ${width}`);
 }
 await page.close();
}}finally{await browser.close();}
