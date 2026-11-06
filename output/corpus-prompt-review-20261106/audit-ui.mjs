import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fixtureRecords, installLoadoutFixture } from '../../apps/web/tests/helpers/loadout-fixture.mjs';
const { chromium }=createRequire(import.meta.url)('/Users/river/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const rows=JSON.parse(await readFile(new URL('./results.json',import.meta.url),'utf8'));
const chosen=rows.find(r=>r.case==='pockets'&&r.stage==='explain'&&r.version==='current'&&r.round===1);
const syntax=rows.find(r=>r.case==='pockets'&&r.stage==='syntax'&&r.version==='current'&&r.round===1).output;
const camel=x=>Array.isArray(x)?x.map(camel):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()),camel(v)])):x;
const analysis={...camel(chosen.output),schemaVersion:2,syntaxState:'pending',analysisSource:'ai',syntaxAnalysis:camel(syntax)};
const context=camel(JSON.parse(chosen.request.messages[1].content.split('\n').slice(1).join('\n')));
const record={...fixtureRecords[4],item:{...fixtureRecords[4].item,text:'pockets of greatness',sourceText:'pockets of greatness',meaning:analysis.explanation.meaning,analysisDetail:{context,analysis}}};
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:950}});
page.setDefaultTimeout(20000); page.setDefaultNavigationTimeout(60000);
const headers={'access-control-allow-origin':'*','access-control-allow-headers':'content-type,authorization','access-control-allow-methods':'POST,OPTIONS'};
const observations={};let asks=0;
try {
 await installLoadoutFixture(page,{origin:'http://localhost:3000',records:[record],initialOwner:null});
 await page.route('**/api/corpus/*',route=>{
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
  const path=new URL(route.request().url()).pathname;
  if(path.endsWith('/analyze-syntax'))return route.fulfill({headers,json:syntax});
  if(path.endsWith('/ask')){asks++;return route.fulfill({headers,contentType:'text/event-stream',body:'event: delta\ndata: {"text":"A synthetic answer."}\n\nevent: done\ndata: {}\n\n'});}
  return route.fallback();
 });
 await page.goto('http://localhost:3000/corpus',{waitUntil:'domcontentloaded'});
 const trigger=page.getByRole('button',{name:'View pockets of greatness',exact:true});await trigger.click();
 const dialog=page.getByRole('dialog');await dialog.getByText('POCK-ets of GREAT-ness',{exact:true}).waitFor();
 observations.headings=await dialog.getByRole('heading').evaluateAll(els=>els.map(el=>({tag:el.tagName,text:el.textContent})));
 observations.modal=await dialog.evaluate(el=>({height:el.getBoundingClientRect().height,viewport:innerHeight,closedby:el.getAttribute('closedby')}));
 observations.close=await dialog.getByRole('button',{name:'Close corpus detail'}).evaluate(el=>({borderRadius:getComputedStyle(el).borderRadius,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
 await page.mouse.click(4,4);observations.openAfterBackdropClick=await dialog.isVisible();
 await page.keyboard.press('Escape');observations.escapeCloses=await dialog.count()===0;
 try{await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='View pockets of greatness',{},{timeout:1500});}catch{}
 observations.focusReturned=await trigger.evaluate(el=>el===document.activeElement);
 observations.focusAfterEscape=await page.evaluate(()=>({tag:document.activeElement?.tagName,label:document.activeElement?.getAttribute('aria-label')}));await trigger.click();
 const suggestion=dialog.getByRole('button',{name:'换成更口语的说法',exact:true});await suggestion.click();
 await dialog.getByRole('button',{name:'Save as note',exact:true}).waitFor();
 observations.suggestion={immediateRequests:asks,pressed:await suggestion.getAttribute('aria-pressed'),selected:await suggestion.getAttribute('aria-selected')};
 observations.form=await dialog.locator('form').evaluate(el=>({height:el.getBoundingClientRect().height,borderRadius:getComputedStyle(el).borderRadius}));
 await dialog.getByRole('button',{name:'Save as note',exact:true}).click();await dialog.getByText('Saved to note',{exact:true}).waitFor();
 observations.saveButtonAfterSaving=await dialog.getByRole('button',{name:'Save as note',exact:true}).count();
 await dialog.getByRole('tab',{name:'Syntax',exact:true}).click();await dialog.getByRole('heading',{name:'Role in the sentence'}).waitFor();
 observations.phraseSyntaxHeadings=await dialog.getByRole('tabpanel').getByRole('heading').allTextContents();
 observations.lazyGenerationCopy=await dialog.getByText('Generated when you open this tab',{exact:true}).count();
 await mkdir('output/playwright/corpus-prompt-review',{recursive:true});
 await page.screenshot({path:'output/playwright/corpus-prompt-review/phrase-syntax.png'});
 await writeFile(new URL('./ui-observations.json',import.meta.url),JSON.stringify(observations,null,2));console.log(JSON.stringify(observations,null,2));
}finally{await browser.close();}
