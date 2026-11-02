import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { installSpeakingFixture, speakingSessionId } from "./helpers/speaking-fixture.mjs";
import { installAnalyticsFixture } from "./helpers/analytics-fixture.mjs";

const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3104";
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir("/tmp/libitu-conversation-step4", { recursive: true });
const messages = [
  { id: "learner", role: "user", text: "We product high-end chips." },
  { id: "partner", role: "assistant", text: "So you produce high-end chips. Who buys them?" }
].map((m, ordinal) => ({ ...m, ordinal, status: "final", revision: 1, input_source: "text", created_at: new Date().toISOString() }));
const recast = { id: "recast", version: 1, status: "ready",
  source: { message_id: "learner", revision: 1, start: 0, end: 26, quote: messages[0].text },
  replacement: "We produce high-end chips.", edits: [{ start: 3, end: 10, before: "product", after: "produce" }],
  changed_spans: [{ start: 3, end: 10, quote: "produce" }],
  delivery: { message_id: "partner", revision: 1, start: 3, end: 29, quote: "you produce high-end chips." } };
recast.source.end = recast.source.quote.length;
recast.delivery.end = recast.delivery.start + recast.delivery.quote.length;
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1100 } });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    try {
      const { state, errors } = await installSpeakingFixture(page, { origin, conversationContract: true, denyMicrophone: true });
      state.workspace.runtime = { id: "runtime", generation: 1, state: "connected", expires_at: new Date(Date.now() + 60000).toISOString(), conversation_contract_version: 1 };
      state.workspace.messages = structuredClone(messages);
      state.workspace.conversation = { contract_version: 1, question: null, help: null, recasts: [] };
      const publish = () => { state.workspace.version++; state.sockets.at(-1).send(JSON.stringify({ type: "snapshot", workspace: state.workspace })); };
      await page.goto(`${origin}/speaking/${speakingSessionId}`, { waitUntil: "domcontentloaded" });
      const region = page.getByRole("region", { name: "Conversation", exact: true });
      await region.getByRole("button", { name: "Start conversation", exact: true }).click();
      await region.getByRole("button", { name: "Pause conversation", exact: true }).waitFor();
      const line = region.getByLabel("Partner rephrasing", { exact: true });
      assert.equal(await line.count(), 0, "no speculative correction before server confirmation");
      state.workspace.conversation.recasts = [structuredClone(recast)]; publish();
      await line.waitFor();
      assert.deepEqual(await line.locator("strong").allTextContents(), ["produce"]);
      assert.equal(await line.locator("del,s").count(), 0);
      assert.doesNotMatch(await line.innerText(), /Grammar|Word choice|Correction/);
      await page.waitForFunction(() => document.querySelector('[aria-label="Partner rephrasing"]'));
      await page.screenshot({ path: `/tmp/libitu-conversation-step4/${width}-voice.png`, fullPage: true });
      await region.getByRole("textbox").fill("Another idea");
      await line.waitFor({ state: "detached" });
      await region.getByRole("textbox").fill(""); publish();
      assert.equal(await line.count(), 0, "late snapshots cannot revive the previous Voice correction");
      await region.getByRole("button", { name: "Chat", exact: true }).click();
      await line.waitFor();
      await region.getByText(messages[0].text, { exact: true }).waitFor();
      assert.deepEqual(await line.locator("strong").allTextContents(), ["produce"]);
      await page.screenshot({ path: `/tmp/libitu-conversation-step4/${width}-chat.png`, fullPage: true });
      assert.equal(state.events.filter(e => e.type === "recast.shown").length, 1, "mode changes do not duplicate exposure receipts");
      state.workspace.messages[0].revision = 2; publish();
      await line.waitFor({ state: "detached" });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}: confirmed recast, word-only bold, original preserved, Voice retirement, Chat history, revision gate`);
    } finally { await context.close(); }

    const reportContext = await browser.newContext({ viewport: { width, height: 1100 } });
    const reportPage = await reportContext.newPage(); reportPage.setDefaultTimeout(12000);
    try {
      const { feedback, auth } = await installAnalyticsFixture(reportPage, { origin });
      feedback.report.messages.push(...structuredClone(messages));
      feedback.report.recasts = [{ id: recast.id, source: recast.source, replacement: recast.replacement, changed_spans: recast.changed_spans,
        category: "word_choice", reason: "Use the verb produce to describe making something.", delivered: true }];
      await reportPage.goto(`${origin}/speaking/${speakingSessionId}/analytics`, { waitUntil: "domcontentloaded" });
      const refinements = reportPage.getByRole("region", { name: "Language refinements", exact: true });
      await refinements.getByText("Word choice", { exact: true }).waitFor();
      await refinements.getByText("Rephrased by your partner", { exact: true }).waitFor();
      assert.deepEqual(await refinements.locator("strong").allTextContents(), ["produce"]);
      await refinements.getByRole("link", { name: "View source", exact: true }).click();
      await reportPage.locator("#source-learner mark").waitFor();
      assert.equal(await reportPage.locator("#source-learner mark").innerText(), messages[0].text);
      await refinements.scrollIntoViewIfNeeded();
      await reportPage.screenshot({ path: `/tmp/libitu-conversation-step4/${width}-report.png`, fullPage: true });
      assert.equal(feedback.posts.length, 0, "reading recasts does not regenerate or rescore the report");
      assert.deepEqual(auth.errors, []);
      assert.equal(await reportPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      console.log(`PASS ${width}: report classification, delivered label, source navigation, no regeneration or overflow`);
    } finally { await reportContext.close(); }
  }
} finally { await browser.close(); }
