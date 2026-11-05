import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { installSpeakingFixture, speakingSessionId } from "./helpers/speaking-fixture.mjs";
const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3104";
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir("output/playwright/target-hint", { recursive: true });
try {
 for (const width of [1192, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 1100 } });
  const page = await context.newPage();
  const { state, errors } = await installSpeakingFixture(page, { origin, conversationContract: true, deferHints: true });
  const w = state.workspace;
  const message = { id: "question-message", ordinal: 0, role: "assistant", text: "Which customers would benefit?", input_source: "text", status: "final", revision: 1, created_at: new Date().toISOString() };
  const ref = { message_id: message.id, revision: 1, start: 0, end: message.text.length, quote: message.text };
  w.runtime = { id: "runtime", generation: 1, state: "connected", expires_at: new Date(Date.now() + 60000).toISOString(), conversation_contract_version: 1 };
  w.messages = [message];
  w.opportunities = w.session.items.map(item => ({ session_item_id: item.id, role: "primary", status: "planned" }));
  w.conversation = { contract_version: 1, question: { id: "question", context_version: 1, origin: ref, current: ref, stage_index: null, target_item_id: null, status: "awaiting_reply", auto_rephrase: "available", auto_direction: "available", automatic_help_closed: false }, help: null };
  const publish = () => { w.version++; state.sockets.at(-1).send(JSON.stringify({ type: "snapshot", workspace: w })); };
  try {
   await page.goto(`${origin}/speaking/${speakingSessionId}`);
   const conversation = page.getByRole("region", { name: "Conversation", exact: true });
   const sidebar = page.getByRole("complementary", { name: "Training sidebar" });
   await conversation.getByRole("button", { name: "Chat", exact: true }).click();
   if (width < 800) await conversation.getByRole("button", { name: "Targets", exact: true }).click();
   const card = sidebar.locator("article").first();
   assert.equal(await card.getByRole("button", { name: "Hint", exact: true }).isDisabled(), true);
   await sidebar.getByText("Start or resume the conversation to get a target hint.").waitFor();
   const first = await card.getByRole("button", { name: "Hint", exact: true }).boundingBox();
   const second = await card.getByRole("button", { name: "Doesn't fit this scene", exact: true }).boundingBox();
   assert.ok(Math.abs(first.y - second.y) < 1, "target actions align");
   await conversation.getByRole("button", { name: "Start conversation", exact: true }).click();
   await conversation.getByRole("button", { name: "Pause conversation", exact: true }).waitFor();
   await card.getByRole("button", { name: "Hint", exact: true }).click();
   await card.getByRole("button", { name: "Finding help…", exact: true }).waitFor();
   for (let i=0;i<100 && !state.events.some(e=>e.type==="help.request");i++) await new Promise(r=>setTimeout(r,20));
   let request = state.events.findLast(e=>e.type==="help.request");
   assert.equal(request.target_item_id, "item-1");
   assert.equal(request.level, "direction");
   w.conversation.help = { id: request.request_id, version: 2, question_id: request.question_id, question_version: request.question_version, target_item_id: "item-1", source: "requested", level: "direction", status: "ready", direction: "You could… acknowledge another perspective.", opening_words: null, example: null, error_code: null }; publish();
   await card.getByRole("button", { name: "Opening words", exact: true }).waitFor();
   await conversation.getByRole("region", { name: "Speaking hint" }).getByText("acknowledge another perspective.", { exact: true }).waitFor();
   await card.getByRole("button", { name: "Opening words", exact: true }).click();
   await card.getByRole("button", { name: "Finding help…", exact: true }).waitFor();
   for (let i=0;i<100 && state.events.filter(e=>e.type==="help.request").length<2;i++) await new Promise(r=>setTimeout(r,20));
   request = state.events.findLast(e=>e.type==="help.request");
   assert.equal(request.target_item_id, "item-1"); assert.equal(request.level,"usage");
   w.conversation.help = {...w.conversation.help, id:request.request_id, level:"usage", direction:null, opening_words:"To be fair…"}; publish();
   await card.getByRole("button", {name:"See an example",exact:true}).waitFor();
   await conversation.getByRole("region",{name:"Speaking hint"}).getByText("To be fair…",{exact:true}).waitFor();
   await conversation.getByRole("textbox").fill("a draft");
   assert.equal(await card.getByRole("button", { name: "Hint", exact: true }).isDisabled(), true);
   await conversation.getByRole("textbox").fill("");
   await page.screenshot({ path:`output/playwright/target-hint/${width}.png`,fullPage:true });
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   assert.deepEqual(errors,[]);
   console.log(`PASS ${width}: alignment, offline/draft gating, target ID, loading, direction and opening display`);
  } finally { await context.close(); }
 }
} finally { await browser.close(); }
