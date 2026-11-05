import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { installSpeakingFixture, speakingSessionId } from "./helpers/speaking-fixture.mjs";
const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3104";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const artifacts = "/tmp/libitu-help-bundle-20261101";
await mkdir(artifacts, { recursive: true });
async function waitFor(check) { for (let i = 0; i < 160; i++) { if (check()) return; await new Promise(resolve => setTimeout(resolve, 10)); } assert.fail("Expected fixture event"); }
const wording = { direction: "You could… explain the benefit.", opening_words: "We could begin by…", example: "We could begin by calling the customer." };
try {
  for (const width of (process.env.LIBITU_TEST_WIDTH ? [Number(process.env.LIBITU_TEST_WIDTH)] : [1440, 390])) {
    const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce" });
    const page = await context.newPage(); page.setDefaultTimeout(12000); page.setDefaultNavigationTimeout(60000);
    const { state, errors } = await installSpeakingFixture(page, { origin, conversationContract: true, deferHints: true, denyMicrophone: true });
    const w = state.workspace;
    const message = { id: "question-message", ordinal: 0, role: "assistant", text: "Which customers would benefit?", input_source: "text", status: "final", revision: 1, created_at: new Date().toISOString() };
    const ref = { message_id: message.id, revision: 1, start: 0, end: message.text.length, quote: message.text };
    w.runtime = { id: "runtime", generation: 1, state: "connected", expires_at: new Date(Date.now() + 60000).toISOString(), conversation_contract_version: 1 };
    w.messages = [message];
    w.conversation = { contract_version: 1, question: { id: "question", context_version: 1, origin: ref, current: ref, stage_index: null, target_item_id: null, status: "awaiting_reply", auto_rephrase: "available", auto_direction: "available", automatic_help_closed: false }, help: null };
    const requests = () => state.events.filter(e => e.type === "help.request");
    const receipts = () => state.events.filter(e => e.type === "help.shown");
    const publish = () => { w.version++; state.sockets.at(-1).send(JSON.stringify({ type: "snapshot", workspace: w })); };
    const respond = (request, status = "ready") => {
      const field = request.level === "usage" ? "opening_words" : request.level;
      const card = { id: request.request_id, version: status === "loading" ? 1 : 2, question_id: request.question_id, question_version: request.question_version,
        target_item_id: null, source: "requested", level: request.level, status, direction: null, opening_words: null, example: null, error_code: status === "unavailable" ? "unavailable" : null,
        ...(status === "ready" ? { [field]: wording[field] } : {}) };
      w.conversation.help = card; publish(); return card;
    };
    try {
      await page.goto(`${origin}/speaking/${speakingSessionId}`);
      const conversation = page.getByRole("region", { name: "Conversation", exact: true });
      const hint = conversation.getByRole("region", { name: "Speaking hint" });
      await conversation.getByRole("button", { name: "Start conversation", exact: true }).waitFor({ timeout: 60000 });
      await conversation.getByRole("button", { name: "Start conversation", exact: true }).click();
      await conversation.getByRole("button", { name: "Pause conversation", exact: true }).waitFor();
      await conversation.getByRole("button", { name: "Chat", exact: true }).click();
      await conversation.getByRole("button", { name: "Need a hint?", exact: true }).click();
      await waitFor(() => requests().length === 1); respond(requests()[0], "loading");
      await hint.getByText("Finding a little help…", { exact: true }).waitFor();
      assert.equal(receipts().length, 0);
      respond(requests()[0]); await hint.getByText("explain the benefit.", { exact: true }).waitFor();
      await waitFor(() => receipts().length === 1);
      await conversation.getByRole("button", { name: "Opening words", exact: true }).click();
      await waitFor(() => requests().length === 2); respond(requests()[1], "loading");
      await conversation.getByRole("button", { name: "Finding help…", exact: true }).waitFor();
      await hint.getByText("explain the benefit.", { exact: true }).waitFor();
      assert.equal(await hint.getByText("Finding a little help…", { exact: true }).count(), 0);
      assert.equal(await hint.getAttribute("aria-busy"), "true");
      assert.deepEqual(receipts().map(e => e.level), ["direction"], "loading upgrade is not exposure");
      await conversation.getByRole("button", { name: "Voice", exact: true }).click();
      await hint.getByText("explain the benefit.", { exact: true }).waitFor();
      await page.screenshot({ path: `${artifacts}/${width}-retained-during-upgrade.png`, fullPage: true });
      respond(requests()[1]); await hint.getByText(wording.opening_words, { exact: true }).waitFor();
      await waitFor(() => receipts().length === 2);
      await page.evaluate(() => {
        window.__helpLoadingFlashes = [];
        window.__helpObserver = new MutationObserver(() => { if (document.body.textContent.includes("Finding a little help…")) window.__helpLoadingFlashes.push(performance.now()); });
        window.__helpObserver.observe(document.body, { subtree: true, childList: true, characterData: true });
      });
      await conversation.getByRole("button", { name: "See an example", exact: true }).click();
      await waitFor(() => requests().length === 3); respond(requests()[2]);
      await hint.getByText(wording.example, { exact: true }).waitFor(); await waitFor(() => receipts().length === 3);
      assert.deepEqual(await page.evaluate(() => window.__helpLoadingFlashes), [], "fast response has no hint-slot loading flash");
      assert.deepEqual(receipts().map(e => e.level), ["direction", "usage", "example"]);
      assert.equal(await hint.count(), 1);
      await page.screenshot({ path: `${artifacts}/${width}-example.png`, fullPage: true });
      await conversation.getByRole("button", { name: "Hide hint", exact: true }).click();
      w.conversation.help = null; publish();
      await conversation.getByRole("button", { name: "Need a hint?", exact: true }).click();
      await waitFor(() => requests().length === 4); respond(requests()[3]);
      await hint.getByText("explain the benefit.", { exact: true }).waitFor();
      await conversation.getByRole("button", { name: "Opening words", exact: true }).click();
      await waitFor(() => requests().length === 5);
      w.conversation.question.context_version = 2; w.conversation.help = null; publish();
      await hint.waitFor({ state: "hidden" });
      respond(requests()[4]);
      assert.equal(await hint.count(), 0, "old revision cannot revive retained or arriving help");
      await conversation.getByRole("button", { name: "Need a hint?", exact: true }).click();
      await waitFor(() => requests().length === 6); assert.equal(requests()[5].question_version, 2);
      respond(requests()[5], "unavailable"); await hint.getByText("Help is unavailable. You can try again.", { exact: true }).waitFor();
      await conversation.getByRole("button", { name: "Try again", exact: true }).click();
      await waitFor(() => requests().length === 7); assert.equal(requests()[6].level, "direction");
      respond(requests()[6]); await hint.getByText("explain the benefit.", { exact: true }).waitFor();
      await waitFor(() => receipts().some(event => event.hint_id === requests()[6].request_id));
      await conversation.getByRole("button", { name: "Opening words", exact: true }).click();
      await waitFor(() => requests().length === 8);
      await conversation.getByRole("textbox").fill("My own answer");
      await hint.getByText("explain the benefit.", { exact: true }).waitFor(); respond(requests()[7]);
      await conversation.getByRole("textbox").fill("");
      await conversation.getByRole("button", { name: "Voice", exact: true }).click();
      state.sockets.at(-1).send(JSON.stringify({ type: "user.activity", speaking: true }));
      state.sockets.at(-1).send(JSON.stringify({ type: "transcript.delta", role: "user", item_id: "reply", delta: "My answer" }));
      await conversation.getByText("Which customers would benefit?", { exact: true }).waitFor();
      await hint.getByText("explain the benefit.", { exact: true }).waitFor();
      assert.equal(await hint.getByText(wording.opening_words, { exact: true }).count(), 0);
      await page.screenshot({ path: `${artifacts}/${width}-reply-reference.png`, fullPage: true });
      state.sockets.at(-1).send(JSON.stringify({ type: "user.activity", speaking: false }));
      state.sockets.at(-1).send(JSON.stringify({ type: "state", state: "thinking" }));
      await hint.getByText("explain the benefit.", { exact: true }).waitFor();
      state.sockets.at(-1).send(JSON.stringify({ type: "transcript.delta", role: "assistant", item_id: "next", delta: "Thanks. What would you change?" }));
      await hint.waitFor({ state: "hidden" });
      await conversation.getByText("Thanks. What would you change?", { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}: delayed loading, retained previous level across modes, no premature receipts, fast response, stale-version fence, retry and input retirement`);
    } catch (error) { console.log(await page.locator("body").innerText()); console.log(errors); throw error; } finally { await context.close(); }
  }
} finally { await browser.close(); }
console.log(`Screenshots: ${artifacts}`);
