import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('/Users/river/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for (const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.goto('http://localhost:3000/?source=auth-check',{waitUntil:'domcontentloaded',timeout:90000});
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  const modal=page.locator('.cl-modalContent');
  await modal.getByRole('heading',{name:'Sign in to Libitu'}).waitFor();
  await modal.getByRole('link',{name:'Sign up',exact:true}).click();
  await modal.getByRole('heading',{name:'Create your account'}).waitFor();
  assert.equal(await modal.getByRole('heading',{name:'Sign in to Libitu'}).count(),0);
  await page.screenshot({path:`output/playwright/auth-modal-sign-up-${width}.png`});
  await modal.getByRole('link',{name:'Sign in',exact:true}).click();
  await modal.getByRole('heading',{name:'Sign in to Libitu'}).waitFor();
  assert.equal(await modal.getByRole('heading',{name:'Create your account'}).count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.screenshot({path:`output/playwright/auth-modal-sign-in-${width}.png`});
  console.log(`Real Clerk login -> registration -> login passed at ${width}px (no credentials submitted)`);
  await page.close();
 }
} finally {await browser.close();}
