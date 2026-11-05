import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { installLoadoutFixture } from "./helpers/loadout-fixture.mjs";
import { installSpeakingFixture, speakingSessionId } from "./helpers/speaking-fixture.mjs";

const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3104";
const artifacts = process.env.LIBITU_DESIGN_ARTIFACTS ?? "/tmp/libitu-conversation-step2";
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
async function noOverflow(page) { assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true); }
async function openTargets(page, width) { if (width <= 800) await page.getByRole("button", { name: "Targets", exact: true }).click(); }
try {
  for (const width of (process.env.LIBITU_TEST_WIDTH ? [Number(process.env.LIBITU_TEST_WIDTH)] : [1440, 768, 390])) {
    const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce" });
    const page = await context.newPage(); page.setDefaultTimeout(10000); page.setDefaultNavigationTimeout(60000);
    const { errors } = await installLoadoutFixture(page, { origin });
    const apiCalls = []; page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/speaking")) apiCalls.push(request.url()); });
    try {
      await page.goto(`${origin}/dev/conversation`, { waitUntil: "domcontentloaded" });
      const states = page.getByRole("group", { name: "Prototype state", exact: true });
      await states.waitFor();
      await page.waitForLoadState("load");
      const choose = label => states.getByRole("button", { name: label, exact: true }).click();
      const conversation = page.getByRole("region", { name: "Conversation", exact: true });
      const hint = conversation.getByRole("region", { name: "Speaking hint" });
      await openTargets(page, width);
      const sidebar = page.getByRole("complementary", { name: "Training sidebar" });
      assert.equal(await sidebar.getByRole("heading", { name: "zero-sum game", exact: true }).count(), 1, "confirmed model auto-reveals");
      assert.equal(await sidebar.getByRole("heading", { name: "eke out a beachhead", exact: true }).count(), 1, "learner use auto-reveals");
      assert.equal(await sidebar.getByRole("heading", { name: "Hidden until you ask", exact: true }).count(), 0);
      await sidebar.getByRole("heading", { name: "lean into", exact: true }).waitFor();
      await sidebar.getByRole("button", { name: "Hide targets", exact: true }).click();
      await sidebar.getByRole("button", { name: "Show targets", exact: true }).waitFor();
      assert.equal(await sidebar.getByRole("heading", { name: "zero-sum game", exact: true }).count(), 1);
      await choose("Uncertain model");
      await sidebar.getByRole("heading", { name: "zero-sum game", exact: true }).waitFor({ state: "detached" });
      assert.equal(await sidebar.getByRole("heading", { name: "zero-sum game", exact: true }).count(), 0, "uncertain is not modeled");
      await choose("Live");
      for (const mode of ["Voice", "Chat"]) {
        await conversation.getByRole("button", { name: mode, exact: true }).click();
        await choose("Live");
        await conversation.getByRole("button", { name: "Need a hint?", exact: true }).click();
        await hint.getByText("explain why both sides can win.", { exact: true }).waitFor();
        assert.equal(await hint.count(), 1);
        await conversation.getByRole("button", { name: "Opening words", exact: true }).click();
        await hint.getByText("This isn’t a zero-sum game…", { exact: true }).waitFor();
        assert.equal(await hint.getByText("explain why both sides can win.", { exact: true }).count(), 0);
        await conversation.getByRole("button", { name: "See an example", exact: true }).click();
        await hint.getByText("This isn’t a zero-sum game: premium buyers are new customers, not ours moving over.", { exact: true }).waitFor();
        assert.equal(await hint.getByText("This isn’t a zero-sum game…", { exact: true }).count(), 0);
        await conversation.getByRole("button", { name: "Hide hint", exact: true }).click();
        assert.equal(await hint.count(), 0);
        for (const label of ["Ready", "Live", "Speaking", "Silence", "Direction", "Opening words", "Example", "Hint loading", "Hint unavailable", "Connecting", "Paused", "Connection lost", "Completed", "Free conversation"]) {
          await choose(label);
          await noOverflow(page);
          if (label === "Speaking") { assert.equal(await hint.count(), 0); assert.equal(await conversation.getByRole("button", { name: "Need a hint?", exact: true }).isDisabled(), true); }
          if (label === "Silence") await hint.getByText("Take your time.", { exact: true }).waitFor();
          if (label === "Hint loading") assert.equal(await hint.getAttribute("aria-busy"), "true");
          if (label === "Hint unavailable") { await conversation.getByRole("button", { name: "Try hint again", exact: true }).click(); await hint.getByText("explain why both sides can win.", { exact: true }).waitFor(); }
          if (label === "Completed") assert.equal(await conversation.getByRole("textbox").count(), 0);
          if (label === "Free conversation") assert.equal(await sidebar.locator("article").count(), 0);
          if (["Live", "Silence", "Opening words", "Paused", "Connection lost"].includes(label)) await page.screenshot({ path: join(artifacts, `${width}-${mode.toLowerCase()}-${label.toLowerCase().replaceAll(" ", "-")}.png`), fullPage: true });
        }
        await choose("Direction");
        await conversation.getByRole("textbox").fill("I would start with a small pilot.");
        assert.equal(await hint.count(), 1, "typing retains the visible hint");
        await conversation.getByRole("textbox").fill("");
        assert.equal(await hint.count(), 1, "clearing draft keeps the reply reference");
      }
      await choose("Live");
      assert.deepEqual(await conversation.locator('[class*="recast"] strong').allTextContents(), ["produce"], "only changed word is bold");
      assert.equal(await conversation.getByText(/Target modeled|Your turn|Used on your own|Correction · Grammar/).count(), 0);
      assert.equal(await conversation.locator("del").count(), 0);
      assert.deepEqual(apiCalls, [], "preview never calls speaking APIs");
      assert.deepEqual(errors, []);
      console.log(`PASS preview ${width}: both views, 15 states, help replacement, model/use/uncertainty reveal, recast, draft suppression, no overflow/API calls`);
    } finally { await context.close(); }
  }

  // Real route + controller, fully synthetic auth/API/socket. No provider or microphone.
  for (const width of (process.env.LIBITU_TEST_WIDTH ? [Number(process.env.LIBITU_TEST_WIDTH)] : [1440, 390])) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    const { state, errors } = await installSpeakingFixture(page, { origin });
    const items = state.workspace.session.items;
    const model = { id: "model-turn", ordinal: 0, role: "assistant", text: "We should be on the same page. Which part needs more time?", input_source: "text", status: "final", revision: 1, provider_item_id: "model", response_id: "model", client_turn_id: null, created_at: new Date().toISOString() };
    state.workspace.messages = [model];
    state.workspace.session.mission_plan = { version: 2, title: "Align a delivery", setting: "A planning discussion.", goal: state.workspace.session.goal, user_role: "Project lead", ai_role: "Colleague", register: "professional", logic_template: state.workspace.session.logic_template, targets: items.map((item, index) => ({ session_item_id: item.id, stage_index: index, role: "primary" })) };
    state.workspace.stage_progress = { current_stage_index: 1, stages: state.workspace.session.logic_template.steps.map((label, index) => ({ index, label, status: index === 1 ? "current" : index === 0 ? "completed" : "pending" })), targets: items.map((item, index) => ({ session_item_id: item.id, stage_index: index, modeling_status: index === 1 ? "modeled" : "pending", practice_status: "pending", imitation_uses: 0 })) };
    const start = model.text.indexOf("on the same page");
    state.workspace.demonstrations = [{ target_item_id: items[1].id, message_id: model.id, revision: 1, start, end: start + 16, quote: "on the same page" }];
    try {
      await page.goto(`${origin}/speaking/${speakingSessionId}`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: "Align the migration plan", exact: true }).waitFor();
      const conversation = page.getByRole("region", { name: "Conversation", exact: true });
      const startPaint = await conversation.getByRole("button", { name: "Start conversation", exact: true }).evaluate(element => ({ background: getComputedStyle(element).backgroundColor, radius: getComputedStyle(element).borderRadius }));
      assert.deepEqual(startPaint, { background: "rgb(12, 10, 9)", radius: "999px" }, "shared buttons retain neutral pill design");
      await openTargets(page, width);
      const sidebar = page.getByRole("complementary", { name: "Training sidebar" });
      await sidebar.getByRole("heading", { name: "on the same page", exact: true }).waitFor();
      assert.equal(await sidebar.getByRole("heading", { name: "Hidden until you ask", exact: true }).count(), 0);
      assert.equal(state.connections.length, 0, "redesign does not auto-connect");
      await conversation.getByRole("button", { name: "Chat", exact: true }).click();
      await conversation.getByRole("textbox").fill("To be fair, we need another week.");
      await conversation.getByRole("button", { name: "Send message", exact: true }).click();
      await conversation.getByRole("button", { name: "View evidence for To be fair", exact: true }).waitFor();
      await sidebar.getByRole("heading", { name: "To be fair", exact: true }).waitFor();
      await conversation.getByRole("button", { name: "Voice", exact: true }).click();
      await conversation.getByText("Which part of the timeline would you adjust first?", { exact: true }).waitFor();
      assert.equal(await conversation.getByText(model.text, { exact: true }).count(), 0, "Voice retains only current utterance");
      assert.equal(state.connections.length, 1, "view switch keeps connection");
      assert.equal(state.events.some(event => event.type === "microphone" && event.enabled), false);
      assert.equal(state.events.some(event => event.type === "help.request" || event.type === "client.activity"), false, "no new wire controls in step 2");
      await noOverflow(page);
      await page.screenshot({ path: join(artifacts, `${width}-production-route.png`), fullPage: true });
      assert.deepEqual(errors, []);
      console.log(`PASS real route ${width}: synthetic current controller, stage/model/use rendering, view continuity, no new protocol`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
console.log(`Screenshots: ${artifacts}`);
