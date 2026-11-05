import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fixtureRecords, installLoadoutFixture, loadoutOwner } from "./helpers/loadout-fixture.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3000";
const artifacts = await mkdtemp(join(tmpdir(), "libitu-corpus-"));
const analysis = {
  analysisSource: "ai", selectionType: "phrase", completeness: "complete", selectedText: "to be fair", recommendedText: "to be fair", recommendationReason: "",
  fields: {kind:"chunk",tags:["softening"],level:"B1",register:"neutral"}, notePlaceholder:"",
  explanation: { pronunciation: { ipa: "/tə bi feə/", connectedSpeech: "Link the words.", audioText:"to be fair" }, meaning:"Acknowledge another perspective.", pragmaticFunction:"Concede before a counterpoint.", similarExpressions:["in fairness"], examples:[{english:"To be fair, the plan worked.",chinese:"公平地说，这个计划奏效了。"}],usageChips:["workplace"] },
  syntaxAnalysis: { sentenceType:"phrase", mainClause:"The plan worked.", structureBreakdown:["Discourse marker before the main clause."],logicRelations:[],informationHierarchy:[],styleFeatures:[],usageScenarios:[],grammarPoints:[],wordingNotes:[],reusablePatterns:[],translations:[],translationNotes:[],evidence:["To be fair, the plan worked."] }
};
const records = fixtureRecords.map((record,index) => ({ ...record, createdAt:`2026-09-${String(10+index).padStart(2,"0")}T00:00:00Z`, item: { ...record.item, level:index%2?"B2":"B1", tags:index%2?["framing"]:["softening"], register:"professional", scenarioTags:[index<5?"workplace":"everyday"], learningValueScore:index%2?3:5, ...(index===4 ? { analysisDetail:{ context:{selectedText:"to be fair",currentSentence:"To be fair, the plan worked.",contextBefore:"Let's look at the results.",timestamp:"0:01"},analysis } } : {}) } }));
const browser = await chromium.launch({headless:true,channel:process.env.LIBITU_BROWSER_CHANNEL??"chrome"});
try {
  for (const viewport of process.env.LIBITU_CORPUS_PAGINATION_ONLY ? [] : [{width:1440,height:1000},{width:768,height:1000},{width:390,height:844},{width:320,height:844}].filter(viewport => !process.env.LIBITU_CORPUS_VIEWPORT || viewport.width === Number(process.env.LIBITU_CORPUS_VIEWPORT))) {
    const context = await browser.newContext({viewport}); const page = await context.newPage(); page.setDefaultTimeout(30000);
    const state = await installLoadoutFixture(page,{origin,records});
    let failPatch = false;
    await page.route("**/api/corpus/*",async route => {
      const request=route.request(); const headers={"access-control-allow-origin":"*","access-control-allow-headers":"content-type,authorization","access-control-allow-methods":"GET,POST,PATCH,DELETE,OPTIONS"};
      if(request.method()==="OPTIONS") return route.fulfill({status:204,headers});
      const owner=JSON.parse(Buffer.from(request.headers().authorization.split(" ")[1].split(".")[1],"base64url").toString()).sub;
      const id=new URL(request.url()).pathname.split("/").pop(); const cloud=state.cloud.get(owner);
      const entry=[...cloud.entries()].find(([,row])=>row.id===id);
      if(!entry) return route.fulfill({status:404,headers,json:{}});
      if(request.method()==="PATCH") {
        if(failPatch) { failPatch=false; return route.fulfill({status:503,headers,json:{detail:"offline"}}); }
        const row={...entry[1],...request.postDataJSON(),updated_at:new Date().toISOString()}; cloud.set(entry[0],row); return route.fulfill({headers,json:row});
      }
      if(request.method()==="DELETE") { cloud.delete(entry[0]); return route.fulfill({status:204,headers}); }
      throw new Error(`Unexpected detail API: ${request.method()}`);
    });
    await page.goto(`${origin}/corpus`,{waitUntil:"domcontentloaded",timeout:60000});
    await page.getByText("10 items",{exact:true}).waitFor();
    console.log(`Loaded ${viewport.width}px`);
    const firstCard = page.locator("article").first();
    assert.equal(await firstCard.evaluate(el=>getComputedStyle(el).backgroundColor), "rgb(250, 250, 249)");
    assert.equal(await firstCard.evaluate(el=>getComputedStyle(el).boxShadow), "none");
    assert.equal(await page.getByRole("link",{name:"Open Loadout",exact:true}).evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(12, 10, 9)");
    await page.getByRole("tab",{name:"All items",exact:true}).focus();
    await page.keyboard.press("ArrowRight");
    await page.getByText("5 items",{exact:true}).waitFor();
    await page.keyboard.press("Home");
    await page.getByText("10 items",{exact:true}).waitFor();
    for (const title of ["Type", "Functional tags", "Difficulty", "Scenario", "Register", "Source"]) {
      await page.getByRole("button", {name:title,exact:true}).click();
      const popup = page.getByRole("dialog", {name:`${title} filters`,exact:true});
      await popup.evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished)));
      const box=await popup.boundingBox();
      assert.ok(box.x>=0 && box.x+box.width<=viewport.width+1, `${title} popup stays on screen`);
      const pill=await page.getByRole("button", {name:title,exact:true}).boundingBox();
      assert.ok(Math.abs(box.y - pill.y - pill.height - 8) < 2 || Math.abs(pill.y - box.y - box.height - 8) < 2, `${title} popup anchors to its pill`);
      await popup.getByRole("button",{name:"Done",exact:true}).click();
      await popup.waitFor({state:"hidden"});
    }
    await page.getByRole("button",{name:"Difficulty",exact:true}).click();
    await page.getByRole("dialog",{name:"Difficulty filters"}).getByRole("button",{name:"B1",exact:true}).click();
    await page.getByRole("button",{name:"Register",exact:true}).click();
    await page.getByRole("dialog",{name:"Difficulty filters"}).waitFor({state:"hidden"});
    await page.getByRole("dialog",{name:"Register filters"}).getByRole("button",{name:"professional",exact:true}).click();
    await page.getByRole("dialog",{name:"Register filters"}).getByRole("button",{name:"Clear",exact:true}).click();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog",{name:"Register filters"}).waitFor({state:"hidden"});
    await page.getByRole("button",{name:"Difficulty · 1",exact:true}).waitFor();
    await page.getByRole("button",{name:"Clear all",exact:true}).click();
    await page.getByRole("button",{name:"Type",exact:true}).click();
    await page.getByRole("heading",{name:"Corpus library",exact:true}).click();
    await page.getByRole("dialog",{name:"Type filters"}).waitFor({state:"hidden"});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await page.screenshot({path:join(artifacts,`library-${viewport.width}.png`),fullPage:true});
    await page.getByRole("checkbox",{name:"Select to be fair",exact:true}).check();
    const tray=page.getByRole("region",{name:"Selected corpus actions"});
    const trayBox=await tray.boundingBox();
    assert.ok(trayBox.x>=0 && trayBox.x+trayBox.width<=viewport.width+1);
    if(viewport.width<720) assert.ok(trayBox.y+trayBox.height<=viewport.height-70);
    await page.getByRole("searchbox",{name:"Search corpus"}).fill("break the ice");
    await page.getByText("1 item",{exact:true}).waitFor();
    assert.equal(await page.getByRole("checkbox",{name:"Select break the ice",exact:true}).isChecked(),false);
    await page.getByText("1 selected · 1 hidden by filters",{exact:true}).waitFor();
    await page.getByRole("searchbox",{name:"Search corpus"}).fill("");
    await page.getByRole("button",{name:"View to be fair",exact:true}).click();
    const dialog=page.getByRole("dialog"); await dialog.getByText("Original analysis · to be fair",{exact:true}).waitFor();
    await dialog.getByRole("button",{name:"Syntax",exact:true}).click();
    await dialog.getByText("Discourse marker before the main clause.",{exact:true}).waitFor();
    await page.screenshot({path:join(artifacts,`detail-${viewport.width}.png`)});
    await dialog.getByRole("button",{name:"Edit item",exact:true}).click();
    await dialog.getByLabel("Expression or structure",{exact:true}).fill("In fairness");
    await dialog.getByLabel("Meaning",{exact:true}).fill("My revised meaning");
    await dialog.getByRole("button",{name:"Save changes",exact:true}).click();
    await dialog.getByText("Changes saved.",{exact:true}).waitFor();
    await dialog.getByRole("button",{name:"Close corpus detail"}).click();
    assert.equal(await page.getByRole("checkbox",{name:"Select In fairness",exact:true}).isChecked(),true);
    console.log(`Guest edit saved ${viewport.width}px`);
    await page.reload({waitUntil:"domcontentloaded"});
    await page.getByRole("button",{name:"View In fairness",exact:true}).waitFor();
    await page.getByRole("button",{name:"List view",exact:true}).click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await page.getByRole("button",{name:"Type",exact:true}).click();
    const filters = page.getByRole("dialog", {name:"Type filters",exact:true});
    await filters.getByRole("button",{name:"idiom",exact:true}).click();
    await page.getByText("2 items",{exact:true}).waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("button",{name:"Type · 1",exact:true}).evaluate(el=>el===document.activeElement),true);
    await page.getByRole("button",{name:"Clear all",exact:true}).click();
    await page.getByRole("checkbox",{name:"Select In fairness",exact:true}).check();
    await page.getByRole("button",{name:"Add to Loadout",exact:true}).click();
    await page.waitForURL(/\/loadout\?/);
    await page.getByRole("button",{name:"Remove In fairness from loadout",exact:true}).waitFor();
    await page.goto(`${origin}/corpus`,{waitUntil:"domcontentloaded"});
    await page.getByRole("button",{name:"View In fairness",exact:true}).waitFor();
    await page.evaluate(owner=>window.__setLoadoutUser(owner),loadoutOwner);
    await page.waitForFunction(()=>!document.querySelector('button[aria-label="Edit In fairness"]')?.disabled);
    await page.getByRole("button",{name:"Edit In fairness",exact:true}).click();
    await dialog.getByLabel("Meaning",{exact:true}).fill("Cloud edited meaning");
    failPatch=true;
    await dialog.getByRole("button",{name:"Save changes",exact:true}).click();
    await dialog.getByRole("alert").waitFor();
    assert.equal(await dialog.getByLabel("Meaning",{exact:true}).inputValue(),"Cloud edited meaning");
    await dialog.getByRole("button",{name:"Save changes",exact:true}).click();
    await dialog.getByText("Changes saved.",{exact:true}).waitFor();
    await dialog.getByRole("button",{name:"Close corpus detail"}).click();
    await page.reload({waitUntil:"domcontentloaded"});
    await page.getByText("Cloud edited meaning",{exact:true}).waitFor();
    await page.getByRole("button",{name:"View In fairness",exact:true}).click();
    await dialog.getByRole("button",{name:"Delete item",exact:true}).click();
    await dialog.getByRole("button",{name:"Confirm delete",exact:true}).click();
    await page.getByText("9 items",{exact:true}).waitFor();
    await page.reload({waitUntil:"domcontentloaded"}); await page.getByText("9 items",{exact:true}).waitFor();
    await page.getByRole("button",{name:`View ${records[0].item.text}`,exact:true}).click();
    await page.evaluate(()=>window.__setLoadoutUser("other-corpus-owner"));
    await page.getByRole("heading",{name:"Your collection starts with one expression."}).waitFor();
    assert.equal(await page.getByRole("dialog").count(),0);
    assert.equal(await page.getByRole("checkbox").count(),0);
    assert.deepEqual(state.errors,[]);
    await context.close(); console.log(`Corpus acceptance passed: ${viewport.width}px`);
  }
  // A larger collection exercises incremental rendering without changing the
  // complete-collection search/sort and stable selection contracts.
  const phrases = ["back to the basics", "pockets of greatness", "come to fruition", "lean into the challenge", "cross-pollinate ideas", "in a lot of ways", "the fact of the matter is", "hedging your bets", "a fresh perspective", "make the most of it", "keep the bigger picture in mind", "build on what works", "bring everyone on board", "weigh the alternatives", "set clear expectations", "find common ground", "get the ball rolling", "make room for improvement", "look at it another way", "put things into perspective", "move in the right direction", "turn a challenge into an opportunity", "a very long expression that explains how the team can approach a complicated decision while keeping everyone's priorities and constraints in mind"];
  const largeRecords = [...records, ...phrases.map((text,index)=>({
    ...records[4], key:`corpus-pagination-${index}`, createdAt:new Date(Date.UTC(2026,9,index+1)).toISOString(),
    sourceTitle: index%2 ? "Building better teams — a conversation about work and everyday communication" : "Ideas worth sharing",
    item:{...records[4].item,id:`pagination-${index}`,text,meaning:"A useful expression for framing a discussion, explaining a point of view and moving a conversation forward.",analysisDetail:undefined,tags:["framing","clarifying"],level:index%3 ? "B2":null, learningValueScore:index%3 ? 5:null}
  }))];
  for (const viewport of [{width:1440,height:1000},{width:768,height:1000},{width:390,height:844},{width:320,height:844}].filter(viewport => !process.env.LIBITU_CORPUS_VIEWPORT || viewport.width === Number(process.env.LIBITU_CORPUS_VIEWPORT))) {
    const context=await browser.newContext({viewport}); const page=await context.newPage(); page.setDefaultTimeout(30000);
    const state=await installLoadoutFixture(page,{origin,records:largeRecords});
    await page.goto(`${origin}/corpus`,{waitUntil:"domcontentloaded",timeout:60000});
    await page.getByText("33 items",{exact:true}).waitFor();
    assert.equal(await page.locator("article").count(),15);
    await page.getByText("Showing 15 of 33",{exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await page.screenshot({path:join(artifacts,`corpus-${viewport.width}.png`),fullPage:true});
    await page.getByRole("checkbox",{name:`Select ${phrases[22]}`,exact:true}).check();
    await page.getByRole("button",{name:"Load more",exact:true}).click();
    await page.getByText("Showing 30 of 33",{exact:true}).waitFor();
    assert.equal(await page.locator("article").count(),30);
    await page.getByRole("button",{name:"Load more",exact:true}).click();
    await page.getByText("Showing 33 of 33",{exact:true}).waitFor();
    assert.equal(await page.locator("article").count(),33);
    assert.equal(await page.getByRole("checkbox",{name:`Select ${phrases[22]}`,exact:true}).isChecked(),true);
    await page.getByRole("combobox",{name:"Sort corpus"}).click();
    await page.getByRole("option",{name:"Alphabetical",exact:true}).click();
    await page.getByText("Showing 15 of 33",{exact:true}).waitFor();
    assert.equal(await page.locator("article").count(),15);
    await page.getByRole("searchbox",{name:"Search corpus"}).fill("come to fruition");
    await page.getByText("1 item",{exact:true}).waitFor();
    await page.getByText("1 selected · 1 hidden by filters",{exact:true}).waitFor();
    await page.getByRole("searchbox",{name:"Search corpus"}).fill("no matching expression in this collection");
    await page.getByRole("heading",{name:"No matching items",exact:true}).waitFor();
    await page.getByRole("button",{name:"Clear filters",exact:true}).click();
    await page.getByText("Showing 15 of 33",{exact:true}).waitFor();
    await page.getByRole("button",{name:"Clear selection",exact:true}).click();
    await page.getByRole("button",{name:"Source",exact:true}).click();
    await page.screenshot({path:join(artifacts,`corpus-filters-${viewport.width}.png`)});
    await page.keyboard.press("Escape");
    await page.getByRole("button",{name:"List view",exact:true}).click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    assert.deepEqual(state.errors,[]);
    await context.close(); console.log(`Corpus pagination passed: ${viewport.width}px`);
  }
} catch (error) {
  for (const context of browser.contexts()) for (const page of context.pages()) {
    await page.screenshot({path:join(artifacts,"failure.png"),fullPage:true}).catch(()=>{});
    console.log("Failure dialog text",await page.getByRole("dialog").allTextContents().catch(()=>[]));
  }
  throw error;
} finally { await browser.close(); console.log(`Screenshots: ${artifacts}`); }
