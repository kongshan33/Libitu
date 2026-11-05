import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {installLoadoutFixture,loadoutOwner} from '../../apps/web/tests/helpers/loadout-fixture.mjs';
const {chromium}=createRequire(import.meta.url)('/Users/river/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const width of [1440,390,360,320]) {
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  await installLoadoutFixture(page,{origin:'http://localhost:3000'});
  for(const path of ['/?source=auth-check#video-url','/corpus']) {
   await page.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded',timeout:90000});
   const header=page.locator('header');
   await header.getByRole('button',{name:'Sign in',exact:true}).waitFor();
   assert.equal(await header.getByRole('button',{name:'Sign up',exact:true}).count(),0);
   await page.evaluate(()=>{window.__authModes=[];for(const key of ['openSignIn','openSignUp'])window.Clerk[key]=(options)=>window.__authModes.push({key,options});});
   await header.getByRole('button',{name:'Sign in',exact:true}).click();
   const returnUrl=page.url();
   assert.deepEqual(await page.evaluate(()=>window.__authModes),[
    {key:'openSignIn',options:{forceRedirectUrl:returnUrl,signUpForceRedirectUrl:returnUrl,withSignUp:false,transferable:false}}
   ]);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`overflow ${width} ${path}`);
   const rects=await header.locator('a,button').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().width).map(n=>{const r=n.getBoundingClientRect();return {text:n.textContent,left:r.left,right:r.right,top:r.top,bottom:r.bottom}}));
   for(const r of rects)assert.ok(r.left>=0&&r.right<=width+1,JSON.stringify(r));
   await page.screenshot({path:`output/playwright/auth-controls-${path.startsWith('/corpus')?'corpus':'landing'}-${width}.png`});
  }
  await page.evaluate(owner=>window.__setLoadoutUser(owner),loadoutOwner);
  await page.locator('header [class*=AuthControls_avatar]').waitFor();
  assert.equal(await page.getByRole('button',{name:'Sign in',exact:true}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Sign up',exact:true}).count(),0);
  console.log(`Auth entry checks passed at ${width}px`);
  await context.close();
 }
} finally {await browser.close();}
