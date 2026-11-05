import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fixtureRecords, installLoadoutFixture, loadoutOwner, shadowBlueprint, fixtureContentId } from './helpers/loadout-fixture.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.LIBITU_TEST_URL ?? 'http://localhost:3000';
const syntax = { sentenceType:'名词性短语',mainClause:'在句中作宾语',structureBreakdown:['中心词 + of 短语'],logicRelations:['先让步，再转折'],grammarPoints:['宾语'],informationHierarchy:[],wordingNotes:[],styleFeatures:[],usageScenarios:[],reusablePatterns:[],translations:[],translationNotes:[],evidence:[] };
const analysis = { schemaVersion:2,syntaxState:'pending',analysisSource:'ai',selectionType:'phrase',completeness:'complete',selectedText:'pockets of greatness',recommendedText:'pockets of greatness',recommendationReason:'',
  fields:{kind:'chunk',tags:['framing'],level:'B2',register:'professional'},notePlaceholder:'Your note',teacherNote:'这里先肯定团队仍有局部的强项，再用 but 转到整体问题。说话时记住 have pockets of greatness in … 这个框架，先说明亮点在哪，再接一句需要改进的地方。',
  reusablePatterns:[{template:'[team] has pockets of greatness in [area], but [problem].',slots:{team:'被评价的团队',area:'有优势的领域',problem:'整体问题'},rationale:'先肯定，再指出改进方向。'}],collocations:['have pockets of greatness','pockets of greatness in design'],pitfalls:[],
  explanation:{pronunciation:{ipa:'/ˈpɒkɪts əv ˈɡreɪtnəs/',connectedSpeech:'of 弱读为 /əv/。',audioText:'pockets of greatness',stressText:'POCK-ets of GREAT-ness'},meaning:'整体之中零散出现的优秀之处。',pragmaticFunction:'',similarExpressions:['islands of excellence — 更偏正式书面表达','scattered bright spots — 更口语化'],examples:[{english:'The team has pockets of greatness in design.',chinese:'团队在设计方面有局部亮点。',typical:true}],usageChips:['商业评论','委婉评价']},syntaxAnalysis:syntax };
const record={...fixtureRecords[4],item:{...fixtureRecords[4].item,text:'pockets of greatness',sourceText:'pockets of greatness',meaning:analysis.explanation.meaning,level:'B2',register:'professional',analysisDetail:{context:{selectedText:'pockets of greatness',currentSentence:'The team has pockets of greatness, but needs consistency.',contextBefore:'Let us review the results.',contextAfter:'We will focus on delivery.',timestamp:'0:38.120'},analysis}}};
const headers={'access-control-allow-origin':'*','access-control-allow-headers':'content-type,authorization','access-control-allow-methods':'POST,PATCH,OPTIONS'};
const apiSyntax={sentence_type:syntax.sentenceType,main_clause:syntax.mainClause,structure_breakdown:syntax.structureBreakdown,logic_relations:syntax.logicRelations,grammar_points:syntax.grammarPoints,information_hierarchy:[],style_features:[],usage_scenarios:[],wording_notes:[],reusable_patterns:[],translations:[],translation_notes:[],evidence:[]};
async function selectTranscriptText(page, text) {
  const line = page.locator('.transcript-text').first();
  await line.scrollIntoViewIfNeeded();
  await line.evaluate((element, selected) => {
    const start = element.textContent.indexOf(selected);
    if (start < 0) throw new Error(`Missing selection: ${selected}`);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let offset = 0, started = false;
    while (walker.nextNode()) {
      const node = walker.currentNode, end = offset + node.textContent.length;
      if (!started && start >= offset && start < end) {
        range.setStart(node, start - offset); started = true;
      }
      if (started && start + selected.length <= end) {
        range.setEnd(node, start + selected.length - offset); break;
      }
      offset = end;
    }
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  }, text);
  await page.getByRole('dialog', {name:'Corpus selection analysis'}).getByRole('heading', {name:text, exact:true}).waitFor();
}
await mkdir('output/playwright',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
  for(const [width, owner] of [[1440,null],[390,loadoutOwner]]) {
    const context=await browser.newContext({viewport:{width,height:950}});const page=await context.newPage();page.setDefaultTimeout(20000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const state=await installLoadoutFixture(page,{origin,records:[record],initialOwner:owner});
    let syntaxCount=0, asks=0;
    await page.route('**/api/corpus/*',async route=>{
      const req=route.request();const path=new URL(req.url()).pathname;
      if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
      if(path.endsWith('/analyze-syntax')){
        syntaxCount++;
        assert.equal(req.postDataJSON().selected_text,'pockets of greatness');
        if(syntaxCount===1)return route.fulfill({status:503,headers,json:{detail:'Temporary failure'}});
        return route.fulfill({headers,json:apiSyntax});
      }
      if(path.endsWith('/ask')){
        asks++;
        const text='**Try** `bright spots`.\n\n- 更口语化。\n\n<img src=x onerror=alert(1)>';
        return route.fulfill({headers,contentType:'text/event-stream',body:`event: delta\ndata: ${JSON.stringify({text})}\n\nevent: ${asks===1?'error':'done'}\ndata: ${JSON.stringify(asks===1?{message:'Interrupted'}:{})}\n\n`});
      }
      if(req.method()==='PATCH'){
        const cloud=state.cloud.get(owner); const entry=[...cloud.entries()].find(([,row])=>path.endsWith('/'+row.id));
        assert.ok(entry);const row={...entry[1],...req.postDataJSON()};cloud.set(entry[0],row);return route.fulfill({headers,json:row});
      }
      return route.fallback();
    });
    await page.goto(origin+'/corpus');await page.getByRole('button',{name:'View pockets of greatness',exact:true}).click();
    const dialog=page.getByRole('dialog');await dialog.getByText('POCK-ets of GREAT-ness',{exact:true}).waitFor();
    assert.equal(syntaxCount,0);assert.equal(asks,0);
    assert.equal(await dialog.evaluate(el=>getComputedStyle(el).boxShadow),'none');
    assert.equal(await dialog.evaluate(el=>getComputedStyle(el).borderRadius),'14px');
    await dialog.getByRole('button',{name:'Play from 0:38',exact:true}).waitFor();
    assert.equal(await dialog.locator('mark').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
    await dialog.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
    await page.screenshot({path:`output/playwright/corpus-detail-v2-${width}.png`});
    await dialog.getByRole('tab',{name:'Syntax',exact:true}).click();await dialog.getByRole('button',{name:'Retry syntax'}).click();
    await dialog.getByRole('heading',{name:'Role in the sentence'}).waitFor();
    assert.equal(await dialog.getByRole('tabpanel').getByRole('heading').count(),3);
    await dialog.getByRole('tab',{name:'Explain',exact:true}).click();
    await dialog.getByRole('button',{name:'换成更口语的说法',exact:true}).click();await dialog.getByRole('button',{name:'Retry answer'}).waitFor();
    assert.equal(await dialog.getByRole('button',{name:'Save as note'}).count(),0);
    await dialog.getByRole('button',{name:'Retry answer'}).click();await dialog.getByRole('button',{name:'Save as note'}).waitFor();
    assert.equal(await dialog.locator('img').count(),0);
    await dialog.getByRole('tab',{name:'Syntax',exact:true}).click();await dialog.getByRole('tab',{name:'Explain',exact:true}).click();
    await dialog.getByRole('button',{name:'Save as note'}).click();await dialog.getByText('Saved to note',{exact:true}).waitFor();
    assert.equal(syntaxCount,2);assert.equal(asks,2);
    assert.equal(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth),true);
    await dialog.getByRole('button',{name:'Close corpus detail'}).click();
    await page.reload();await page.getByRole('button',{name:'View pockets of greatness',exact:true}).click();
    await dialog.getByText(/<img src=x onerror=alert\(1\)>/).waitFor();
    await dialog.getByRole('tab',{name:'Syntax',exact:true}).click();await dialog.getByRole('heading',{name:'Role in the sentence'}).waitFor();
    assert.equal(syntaxCount,2,'persisted Syntax is reused after reload');assert.deepEqual(errors,[]);
    console.log(`Corpus detail ${width}px / ${owner?'account':'guest'}: lazy generation, retry, safe Markdown, note + syntax persistence passed`);
    await context.close();
  }
  const context = await browser.newContext({viewport:{width:1440,height:1000}});
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  await installLoadoutFixture(page,{origin,records:[],shadow:true});
  const snake = value => Array.isArray(value) ? value.map(snake) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key,item])=>[key.replace(/[A-Z]/g,c=>'_'+c.toLowerCase()),snake(item)])) : value;
  const blueprint = {...shadowBlueprint,corpus_items:[{...record.item,id:'detail-candidate',meta:'0:38.120 - B2',source_text:'pockets of greatness'}],transcript:[{...shadowBlueprint.transcript[0],parts:[record.item.analysisDetail.context.currentSentence],time:'0:38.120'}]};
  await page.route('**/api/blueprints/**',route=>route.fulfill({headers,json:blueprint}));
  let explainCount=0,syntaxCount=0;
  await page.route('**/api/corpus/*',route=>{
    if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
    const path=new URL(route.request().url()).pathname;
    if(path.endsWith('/analyze-selection')){explainCount++;return route.fulfill({headers,json:snake(analysis)});}
    if(path.endsWith('/analyze-syntax')){syntaxCount++;return route.fulfill({headers,json:apiSyntax});}
    if(path.endsWith('/ask'))return route.fulfill({headers,contentType:'text/event-stream',body:'event: delta\ndata: {"text":"A useful reader note."}\n\nevent: done\ndata: {}\n\n'});
    return route.fallback();
  });
  await page.goto(`${origin}/practice/${fixtureContentId}`);
  await page.getByRole('button',{name:'Open full analysis for pockets of greatness',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'pockets of greatness',exact:true});
  await dialog.getByText('POCK-ets of GREAT-ness',{exact:true}).waitFor();
  assert.equal(explainCount,1);assert.equal(syntaxCount,0);
  await dialog.getByRole('button',{name:'Play from 0:38',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.__loadoutPlayers[0].time),38.12);
  await dialog.getByRole('tab',{name:'Syntax',exact:true}).click();await dialog.getByRole('heading',{name:'Role in the sentence'}).waitFor();
  await dialog.getByRole('tab',{name:'Explain',exact:true}).click();
  await dialog.getByRole('button',{name:'换成更口语的说法',exact:true}).click();
  await dialog.getByRole('button',{name:'Save as note'}).click();await dialog.getByText('Saved to note',{exact:true}).waitFor();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('libitu:corpus:v1')).guest[0]);
  assert.match(stored.item.usageNote,/A useful reader note/);assert.equal(stored.item.analysisDetail.analysis.syntaxState,'ready');
  await dialog.getByRole('button',{name:'Close corpus detail'}).click();
  await page.getByRole('button',{name:'Open full analysis for pockets of greatness',exact:true}).click();
  await dialog.getByRole('tab',{name:'Syntax',exact:true}).click();await dialog.getByRole('heading',{name:'Role in the sentence'}).waitFor();
  assert.equal(explainCount,1);assert.equal(syntaxCount,1);
  await dialog.getByRole('tab',{name:'Explain',exact:true}).click();
  await dialog.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
  await page.screenshot({path:'output/playwright/corpus-detail-reader-v2.png'});
  console.log('Reader detail: Explain-first, lazy Syntax, exact timestamp seek, candidate note save and cache reuse passed');
  const detailStyle = await dialog.evaluate(el => {
    const style = getComputedStyle(el), heading = getComputedStyle(el.querySelector('header h1, header h2'));
    return [style.borderRadius, style.boxShadow, style.backgroundColor, heading.fontSize, heading.fontWeight];
  });
  await dialog.getByRole('button',{name:'Close corpus detail'}).click();
  for (const width of [1440, 390]) {
    await page.setViewportSize({width,height:950});
    await selectTranscriptText(page, 'pockets of greatness');
    const selection = page.getByRole('dialog', {name:'Corpus selection analysis'});
    await selection.getByText('POCK-ets of GREAT-ness',{exact:true}).waitFor();
    assert.deepEqual(await selection.evaluate(el => {
      const style = getComputedStyle(el), heading = getComputedStyle(el.querySelector('header h1, header h2'));
      return [style.borderRadius, style.boxShadow, style.backgroundColor, heading.fontSize, heading.fontWeight];
    }), detailStyle);
    assert.equal(await selection.evaluate(el => {
      const box=el.getBoundingClientRect();
      return box.left>=0 && box.right<=innerWidth && box.top>=0 && box.bottom<=innerHeight && el.scrollWidth<=el.clientWidth;
    }), true);
    await page.screenshot({path:`output/playwright/add-to-corpus-v2-${width}.png`});
    await selection.getByRole('button',{name:'Play from 0:38',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.__loadoutPlayers[0].time),38.12);
    const requestsBeforeSyntax = syntaxCount;
    await selection.getByRole('tab',{name:'Syntax',exact:true}).click();
    await selection.getByRole('heading',{name:'Role in the sentence'}).waitFor();
    assert.equal(syntaxCount,requestsBeforeSyntax+1);
    await selection.getByRole('tab',{name:'Explain',exact:true}).click();
    await selection.getByRole('button',{name:'Pin selection card',exact:true}).click();
    await page.mouse.click(2,2);
    assert.equal(await selection.count(),1);
    await selection.getByLabel('My note').fill(`Selection note ${width}`);
    await selection.getByRole('button',{name:'kind chunk',exact:true}).click();
    await selection.getByRole('button',{name:'kind idiom',exact:true}).waitFor();
    assert.equal(await selection.locator('mark').evaluate(el=>getComputedStyle(el).textDecorationStyle),'dashed');
    assert.equal(await selection.getByRole('button',{name:'Close selection card'}).isVisible(),true);
    await page.screenshot({path:`output/playwright/add-to-corpus-footer-${width}.png`});
    await selection.getByRole('button',{name:'Save',exact:true}).click();
    await selection.waitFor({state:'detached'});
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('libitu:corpus:v1')).guest);
    assert.ok(saved.some(entry=>entry.item.usageNote===`Selection note ${width}` && entry.item.kind==='idiom'));
    await selectTranscriptText(page, 'pockets of greatness');
    await selection.getByRole('button',{name:'Close selection card'}).click();
    await selection.waitFor({state:'detached'});
    await selectTranscriptText(page, 'pockets of greatness');
    await page.keyboard.press('Escape');
    await selection.waitFor({state:'detached'});
    await selectTranscriptText(page, 'pockets of greatness');
    await page.mouse.click(2,2);
    await selection.waitFor({state:'detached'});
    console.log(`Add to corpus ${width}px: shared detail style, viewport bounds, lazy Syntax, exact seek, pin, fields, note save and dismissal passed`);
  }
  await context.close();
} finally { await browser.close(); }
