import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { installSpeakingFixture, speakingSessionId } from "./helpers/speaking-fixture.mjs";
const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3104";
const artifacts = "output/playwright/stage4-orb";
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const tone = Buffer.alloc(48000);
for (let i = 0; i < 24000; i++) tone.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 220 / 24000) * 16000), i * 2);
try {
  for (const width of [1192, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, permissions: ["microphone"], reducedMotion: "no-preference" });
    const page = await context.newPage();
    const { state, errors } = await installSpeakingFixture(page, { origin });
    try {
      await page.goto(`${origin}/speaking/${speakingSessionId}`);
      const conversation = page.getByRole("region", { name: "Conversation", exact: true });
      const orb = page.getByRole("img", { name: "AI partner", exact: true });
      await orb.waitFor();
      const initialTransform = await orb.evaluate(node => getComputedStyle(node.firstElementChild).transform);
      await page.waitForFunction(before => getComputedStyle(document.querySelector('[aria-label="AI partner"]').firstElementChild).transform !== before, initialTransform);
      await conversation.getByRole("button", { name: "Start conversation", exact: true }).click();
      await conversation.getByRole("button", { name: "Pause conversation", exact: true }).waitFor();
      state.sockets.at(-1).send(JSON.stringify({ type: "state", state: "speaking" }));
      state.sockets.at(-1).send(JSON.stringify({ type: "audio.delta", item_id: "tone", response_id: "tone", audio: tone.toString("base64") }));
      await page.waitForFunction(() => Number(document.querySelector('[aria-label="AI partner"]').style.getPropertyValue("--orb-level")) > .3);
      await page.screenshot({ path: `${artifacts}/${width}-voice.png`, fullPage: true });
      state.sockets.at(-1).send(JSON.stringify({ type: "audio.clear" }));
      await page.waitForFunction(() => Number(document.querySelector('[aria-label="AI partner"]').style.getPropertyValue("--orb-level")) < .01);
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await orb.evaluate(node => getComputedStyle(node.firstElementChild).animationName), "none");
      await conversation.getByRole("button", { name: "Chat", exact: true }).click();
      const bar = conversation.locator('[class*="microphoneBar"]');
      await bar.getByRole("button", { name: "Pause conversation", exact: true }).click();
      await bar.getByRole("button", { name: "Resume conversation", exact: true }).waitFor();
      assert.equal(await page.evaluate(() => window.__speakingTracks.every(track => track.readyState === "ended")), true);
      assert.equal(await conversation.getByRole("button", { name: "Resume conversation", exact: true }).count(), 1);
      await bar.getByRole("button", { name: "Resume conversation", exact: true }).click();
      await bar.getByRole("button", { name: "Pause conversation", exact: true }).waitFor();
      assert.equal(state.connections.length, 2);
      assert.equal(await page.evaluate(() => window.__speakingTracks.every(track => track.readyState === "ended")), true, "Chat resume does not enable capture");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      await page.screenshot({ path: `${artifacts}/${width}-chat.png`, fullPage: true });
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}: breathing, real Web Audio synthetic tone, clear, reduced motion, Chat pause/resume, no overflow`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
