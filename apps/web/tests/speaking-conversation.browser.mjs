import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { installSpeakingFixture, speakingSessionId } from "./helpers/speaking-fixture.mjs";
const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3104";
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir("/tmp/libitu-conversation-step3", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1100 } });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    const { state, errors } = await installSpeakingFixture(page, { origin, conversationContract: true, denyMicrophone: true });
    const message = { id: "question-message", ordinal: 0, role: "assistant", text: "Which customers would benefit?", input_source: "text", status: "final", revision: 1, created_at: new Date().toISOString() };
    const ref = { message_id: message.id, revision: 1, start: 0, end: message.text.length, quote: message.text };
    state.workspace.runtime = { id: "runtime", generation: 1, state: "connected", expires_at: new Date(Date.now() + 60000).toISOString(), conversation_contract_version: 1 };
    state.workspace.messages = [message];
    state.workspace.conversation = { contract_version: 1, question: { id: "question", context_version: 1, origin: ref, current: ref, stage_index: null, target_item_id: "item-2", status: "awaiting_reply", auto_rephrase: "available", auto_direction: "available", automatic_help_closed: false }, help: null };
    const publish = () => { state.workspace.version++; state.sockets.at(-1).send(JSON.stringify({ type: "snapshot", workspace: state.workspace })); };
    try {
      await page.goto(`${origin}/speaking/${speakingSessionId}`, { waitUntil: "domcontentloaded" });
      const region = page.getByRole("region", { name: "Conversation", exact: true });
      await region.getByRole("button", { name: "Start conversation", exact: true }).click();
      await region.getByRole("button", { name: "Chat", exact: true }).click();
      await region.getByRole("button", { name: "Need a hint?", exact: true }).click();
      const hint = region.getByRole("region", { name: "Speaking hint" });
      await hint.getByText("explain why both sides can win.", { exact: true }).waitFor();
      await page.waitForFunction(() => true); // Receipt requires two painted frames.
      await region.getByRole("button", { name: "Opening words", exact: true }).click();
      await hint.getByText("We could be on the same page…", { exact: true }).waitFor();
      await region.getByRole("button", { name: "Voice", exact: true }).click();
      await hint.getByText("We could be on the same page…", { exact: true }).waitFor();
      assert.equal(await hint.count(), 1);
      await region.getByRole("button", { name: "See an example", exact: true }).click();
      await hint.getByText("We could be on the same page about the deadline.", { exact: true }).waitFor();
      await page.screenshot({ path: `/tmp/libitu-conversation-step3/${width}-example.png`, fullPage: true });
      await region.getByRole("textbox").fill("My own words");
      assert.equal(await hint.count(), 0);
      await region.getByRole("textbox").fill(""); publish();
      assert.equal(await hint.count(), 0, "a late snapshot cannot revive help after input");
      state.workspace.conversation.help = null;
      state.workspace.conversation.question.auto_rephrase = "completed";
      publish();
      await hint.getByText("Take your time.", { exact: true }).waitFor();
      state.sockets.at(-1).send(JSON.stringify({ type: "user.activity", speaking: true }));
      await hint.waitFor({ state: "detached" });
      assert.equal(state.connections[0].conversation_contract_version, 1);
      assert.deepEqual(state.events.filter(e => e.type === "help.request").map(e => e.level), ["direction", "usage", "example"]);
      assert.equal(state.events.some(e => e.type === "hint"), false);
      assert.ok(state.events.some(e => e.type === "help.shown"));
      assert.ok(state.events.some(e => e.type === "client.activity" && e.draft_present));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}: negotiated route, progressive help, Voice/Chat, receipts, typing/speech suppression, no overflow`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
