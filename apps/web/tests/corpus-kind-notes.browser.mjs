import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fixtureContentId, fixtureRecords, installLoadoutFixture, shadowBlueprint } from './helpers/loadout-fixture.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.LIBITU_TEST_URL ?? 'http://localhost:3000';
const headers = {'access-control-allow-origin':'*','access-control-allow-headers':'content-type,authorization','access-control-allow-methods':'POST,PATCH,OPTIONS'};
const snake = value => Array.isArray(value) ? value.map(snake) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key,item])=>[key.replace(/[A-Z]/g,c=>'_'+c.toLowerCase()),snake(item)])) : value;
const empty = {sentenceType:'',mainClause:'',structureBreakdown:[],logicRelations:[],informationHierarchy:[],styleFeatures:[],usageScenarios:[],grammarPoints:[],wordingNotes:[],reusablePatterns:[],translations:[],translationNotes:[],evidence:[]};
const analysis = {schemaVersion:3,syntaxState:'pending',analysisSource:'ai',selectionType:'phrase',completeness:'complete',selectedText:'pockets of greatness',recommendedText:'pockets of greatness',learningText:'pocket of greatness',recommendationReason:'',fields:{kind:'chunk',tags:['framing'],level:'B2',register:'neutral'},notePlaceholder:'Your note',teacherNote:'Keep the original explanation.',reusablePatterns:[],collocations:[],pitfalls:[],askSuggestions:['换个场景怎么用？','写一段对话','比较近义表达'],explanation:{pronunciation:{ipa:'/ˈpɑkɪt əv ˈɡreɪtnəs/',connectedSpeech:'A learning reading.',audioText:'pocket of greatness',stressText:'POCK-et of GREAT-ness'},meaningSummary:'局部亮点',meaning:'',pragmaticFunction:'',similarExpressions:[],examples:[],usageChips:[]},syntaxAnalysis:empty};
const source = {selectedText:analysis.selectedText,currentSentence:'The team has pockets of greatness, but needs consistency.',timestamp:'0:38.120'};
const originalNote = '**Original learning note**\n\n'+'Long saved explanation. '.repeat(35)+'END_OF_ORIGINAL_NOTE';
const followup = '**Saved follow-up**\n\n- A useful comparison.\n- A concrete example.\n\n'+ 'Follow-up detail. '.repeat(25)+'END_OF_FOLLOWUP <img src=x onerror=alert(1)>';
const record = {...fixtureRecords[4],key:JSON.stringify([fixtureContentId,'chunk','pockets of greatness']),item:{...fixtureRecords[4].item,text:analysis.selectedText,sourceText:analysis.selectedText,usageNote:originalNote,analysisDetail:{context:source,analysis}}};
async function select(page) {
  const line=page.locator('.transcript-text').first();await line.scrollIntoViewIfNeeded();
  await line.evaluate((element,text)=>{
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),range=document.createRange();
    const start=element.textContent.indexOf(text);let offset=0,started=false;
    while(walker.nextNode()) {const node=walker.currentNode,end=offset+node.textContent.length;
      if(!started&&start>=offset&&start<end){range.setStart(node,start-offset);started=true;}
      if(started&&start+text.length<=end){range.setEnd(node,start+text.length-offset);break;}offset=end;
    }
    window.getSelection().removeAllRanges();window.getSelection().addRange(range);element.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
  },analysis.selectedText);
  await page.getByRole('dialog',{name:'Corpus selection analysis'}).getByRole('heading',{name:'pocket of greatness',exact:true}).waitFor();
}
await mkdir('output/playwright/corpus-kind-notes',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
  for(const width of [1440,390]) {
    const context=await browser.newContext({viewport:{width,height:950},reducedMotion:width===390?'reduce':'no-preference'});
    const page=await context.newPage();page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(60000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await installLoadoutFixture(page,{origin,records:[record],shadow:true});
    const blueprint={...shadowBlueprint,corpus_items:[{...record.item,id:'kind-note-candidate',analysisDetail:undefined,usage_note:originalNote,source_text:analysis.selectedText}],transcript:[{...shadowBlueprint.transcript[0],parts:[source.currentSentence],time:'0:38.120'}]};
    await page.route('**/api/blueprints/**',route=>route.fulfill({headers,json:blueprint}));
    const requests=[];let delayNext=false,releaseDelayed,delayedDone;
    await page.route('**/api/corpus/*',async route=>{
      if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
      const path=new URL(route.request().url()).pathname;
      if(path.endsWith('/analyze-selection'))return route.fulfill({headers,json:snake(analysis)});
      if(path.endsWith('/ask'))return route.fulfill({headers,contentType:'text/event-stream',body:`event: delta\ndata: ${JSON.stringify({text:followup})}\n\nevent: done\ndata: {}\n\n`});
      if(path.endsWith('/analyze-syntax')) {
        const input=route.request().postDataJSON();requests.push(input);
        assert.equal(input.selected_text,source.selectedText);assert.equal(input.selection_type,'phrase');
        const full=input.kind==='structure';const delayed=delayNext;delayNext=false;
        let finished;if(delayed){delayedDone=new Promise(resolve=>{finished=resolve;});await new Promise(resolve=>{releaseDelayed=resolve;});}
        const result={...empty,sentenceType:full?'完整句式分析':'名词短语',mainClause:`${delayed?'OBSOLETE':'CURRENT'} ${input.kind} analysis`,structureBreakdown:['pockets — 中心词'],logicRelations:['but — 对照'],wordingNotes:full?['greatness — 卓越']:[],informationHierarchy:full?['重点 — 转折后内容']:[],styleFeatures:full?['并列 — 对照']:[]};
        try {await route.fulfill({headers,json:snake(result)});} catch(error) {if(!delayed)throw error;} finally {finished?.();}
        return;
      }
      return route.fallback();
    });
    await page.goto(`${origin}/practice/${fixtureContentId}`,{waitUntil:'domcontentloaded'});
    const trigger=page.getByRole('button',{name:'Open full analysis for pockets of greatness',exact:true});
    const preview=trigger.locator('.corpus-note');
    assert.ok((await preview.textContent()).length<=140);
    assert.ok(await preview.evaluate(el=>el.getBoundingClientRect().height<=parseFloat(getComputedStyle(el).lineHeight)*2+1));
    await trigger.click();const detail=page.getByRole('dialog',{name:'pocket of greatness',exact:true});
    const note=detail.getByRole('region',{name:'My note',exact:true});
    assert.match(await note.innerText(),/END_OF_ORIGINAL_NOTE/);assert.equal(await note.locator('strong').textContent(),'Original learning note');
    await detail.getByLabel('Ask about this expression').fill('Compare the meanings');await detail.getByRole('button',{name:'Send question'}).click();
    await detail.getByRole('button',{name:'Save as note'}).click();await detail.getByRole('button',{name:'Saved to note'}).waitFor();
    assert.match(await note.innerText(),/END_OF_FOLLOWUP/);assert.equal(await note.locator('img').count(),0);assert.equal(await note.locator('li').count(),2);
    await note.scrollIntoViewIfNeeded();await page.screenshot({path:`output/playwright/corpus-kind-notes/reader-note-${width}.png`});
    await detail.getByRole('button',{name:'Close corpus detail'}).click();
    assert.ok((await preview.textContent()).length<=140);
    await page.screenshot({path:`output/playwright/corpus-kind-notes/thumbnail-${width}.png`});
    await page.goto(origin+'/corpus',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'View pocket of greatness',exact:true}).click();
    assert.match(await page.getByRole('region',{name:'My note',exact:true}).innerText(),/END_OF_ORIGINAL_NOTE[\s\S]*END_OF_FOLLOWUP/);
    await page.getByRole('region',{name:'My note',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`output/playwright/corpus-kind-notes/library-note-${width}.png`});
    await page.getByRole('button',{name:'Close corpus detail'}).click();
    await page.goto(`${origin}/practice/${fixtureContentId}`,{waitUntil:'domcontentloaded'});await select(page);
    const selection=page.getByRole('dialog',{name:'Corpus selection analysis'});
    await selection.getByLabel('Ask about this expression').fill('Keep this unsent question');await selection.getByLabel('My note').fill('Keep this note draft');
    await selection.getByRole('button',{name:'kind chunk',exact:true}).click();await selection.getByRole('button',{name:'kind idiom',exact:true}).click();
    assert.equal(requests.length,0,'kind changes in Explain do not generate Syntax');
    delayNext=true;const firstSyntax=page.waitForRequest(req=>req.url().endsWith('/analyze-syntax')&&req.postDataJSON()?.kind==='structure');
    await selection.getByRole('tab',{name:'Syntax',exact:true}).click();await firstSyntax;
    assert.equal(requests.at(-1).kind,'structure');assert.ok(releaseDelayed);
    await selection.getByRole('button',{name:'kind structure',exact:true}).click();
    await selection.getByText('CURRENT chunk analysis',{exact:true}).waitFor();
    releaseDelayed();await delayedDone;
    assert.equal(await selection.getByText('OBSOLETE structure analysis',{exact:true}).count(),0);
    assert.equal(await selection.getByRole('tab',{name:'Syntax',exact:true}).getAttribute('aria-selected'),'true');
    await selection.getByRole('tab',{name:'Explain',exact:true}).click();
    assert.equal(await selection.getByLabel('Ask about this expression').inputValue(),'Keep this unsent question');
    assert.equal(await selection.getByLabel('My note').inputValue(),'Keep this note draft');
    await selection.getByRole('button',{name:'kind chunk',exact:true}).click();await selection.getByRole('tab',{name:'Syntax',exact:true}).click();
    await selection.getByText('CURRENT idiom analysis',{exact:true}).waitFor();
    await selection.getByRole('button',{name:'kind idiom',exact:true}).click();
    await selection.getByText('CURRENT structure analysis',{exact:true}).waitFor();await selection.getByRole('heading',{name:'Wording',exact:true}).waitFor();
    await page.screenshot({path:`output/playwright/corpus-kind-notes/selection-structure-${width}.png`});
    // Save while a new kind-specific request is pending. The late response
    // must not turn the persisted pending entry into a stale ready analysis.
    await selection.getByRole('tab',{name:'Explain',exact:true}).click();
    for(const kind of ['structure','chunk','idiom'])await selection.getByRole('button',{name:`kind ${kind}`,exact:true}).click();
    delayNext=true;const pending=page.waitForRequest(req=>req.url().endsWith('/analyze-syntax'));
    await selection.getByRole('tab',{name:'Syntax',exact:true}).click();await pending;
    await selection.getByRole('button',{name:'Save',exact:true}).click();await selection.waitFor({state:'detached'});
    releaseDelayed();await delayedDone;
    let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('libitu:corpus:v1')).guest.find(row=>row.item.kind==='structure'));
    assert.equal(saved.item.analysisDetail.analysis.fields.kind,'structure');assert.equal(saved.item.analysisDetail.analysis.syntaxState,'pending');
    assert.equal(saved.item.analysisDetail.analysis.syntaxAnalysis.mainClause,'');assert.equal(saved.item.usageNote,'Keep this note draft');
    const beforeLibrary=requests.length;
    await page.goto(origin+'/corpus',{waitUntil:'domcontentloaded'});
    const structureCard=page.locator('article').filter({has:page.getByText('structure',{exact:true})});
    await structureCard.getByRole('button',{name:'View pocket of greatness',exact:true}).click();
    await page.getByRole('dialog').getByRole('tab',{name:'Syntax',exact:true}).click();
    await page.getByRole('dialog').getByText('CURRENT structure analysis',{exact:true}).waitFor();
    await page.getByRole('dialog').getByRole('heading',{name:'Wording',exact:true}).waitFor();assert.equal(requests.length,beforeLibrary+1);
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('libitu:corpus:v1')).guest.find(row=>row.item.kind==='structure')?.item.analysisDetail.analysis.syntaxState==='ready');
    await page.getByRole('button',{name:'Close corpus detail'}).click();await page.reload({waitUntil:'domcontentloaded'});
    await structureCard.getByRole('button',{name:'View pocket of greatness',exact:true}).click();await page.getByRole('dialog').getByRole('tab',{name:'Syntax',exact:true}).click();
    await page.getByRole('dialog').getByText('CURRENT structure analysis',{exact:true}).waitFor();assert.equal(requests.length,beforeLibrary+1);
    assert.deepEqual(errors,[]);console.log(`${width}px: bounded previews, shared saved notes, kind cancellation/regeneration, pending save and Library reload passed`);
    await context.close();
  }
} finally { await browser.close(); }
