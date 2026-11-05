import { contentContextFixture } from "/Users/river/Documents/Libitu/apps/web/tests/helpers/content-context-fixture.mjs";
import assert from "node:assert/strict";
import { installSignedInPractice } from "/Users/river/Documents/Libitu/apps/web/tests/helpers/signed-in-practice.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3000";
const job = {
  id: "stage-two-test", content_id: "a0000000-0000-4000-8000-000000000001", status: "ready", blueprint_id: "practice-blueprint",
  analysis_version: "mvp-v9", processing_stage: "completed", analysis_preview: null, error_message: null
};
const blueprint = {
  id: job.blueprint_id, content_id: job.content_id, title: "Sentence practice",
  source_url: "https://www.youtube.com/watch?v=practice123", summary: "A short practice clip.", chapters: [],
  logic_flow: [{ id: "logic-1", title: "Opening", subtitle: "An introduction.", time: "0:01" }], corpus_items: [],
  transcript: [
    { time: "0:01", parts: ["Let's begin."], start_ms: 1000, end_ms: 3000, source_token_start: 0, source_token_end: 2 },
    { time: "0:01", parts: ['Dr. Smith asked, "Really?" and waited for our reply.'], start_ms: 3000, end_ms: 9000,
      source_token_start: 2, source_token_end: 11 },
    { time: "0:09", parts: ["The third sentence continues here."], start_ms: 9000, end_ms: 15000,
      source_token_start: 11, source_token_end: 16 },
    { time: "0:12", parts: ["We finish the segment."], start_ms: 15000, end_ms: 20000,
      source_token_start: 16, source_token_end: 20 },
    { time: "0:20", parts: ["One final sentence."], start_ms: 20000, end_ms: 26000,
      source_token_start: 20, source_token_end: 23 }
  ].map((row, index) => ({
    ...row, id: `sentence-v2-practice-${index}`, segmentation_version: "sentence-v2",
    boundary_source: "syntax_merge", boundary_confidence: "medium",
    timing_source: index < 3 ? "caption_word_offsets" : "caption_event_estimate",
    word_timings: index < 3 ? row.parts[0].split(" ").map((text, wordIndex) => ({
      source_token_index: row.source_token_start + wordIndex, text,
      start_ms: row.start_ms + wordIndex * 100, end_ms: row.start_ms + (wordIndex + 1) * 100,
      start_source: "caption_offset", end_source: "next_word_estimate", source_event_index: index, source_seg_index: wordIndex
    })) : []
  })),
  segments: [
    { id: "segment-1", sequence: 1, title: "Opening", summary: "Practice the opening.", start_ms: 1000, end_ms: 20000,
      transcript_start_index: 0, transcript_end_index: 4, phonology_tags: [] },
    { id: "segment-2", sequence: 2, title: "Closing", summary: "Practice the closing.", start_ms: 20000, end_ms: 26000,
      transcript_start_index: 4, transcript_end_index: 5, phonology_tags: [] },
    { id: "segment-3", sequence: 3, title: "No captions", summary: "Listen to the segment.", start_ms: 30000, end_ms: 35000,
      phonology_tags: [] }
  ]
};
const entry = `${origin}/practice/${job.content_id}?learnerLevel=B2#transcript-0-01`;
const requestedViewport = Number(process.env.LIBITU_NAV_VIEWPORT ?? 0);
const viewports = [{ width: 1440, height: 1000 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]
  .filter((viewport) => !requestedViewport || viewport.width === requestedViewport);

async function startSegment(page, index) {
  await page.locator(".stage-one-segment-card").nth(index).click();
  await page.getByRole("button", { name: /Begin Stage 2/ }).click();
    await page.getByRole("button", { name: "Detailed", exact: true }).click();
  await page.locator(".stage-two-shadow:visible").waitFor();
  await page.waitForFunction(() => window.__activePlayer?.ready && !window.__activePlayer.destroyed);
}

async function sampleAt(page, seconds) {
  await page.evaluate((time) => { window.__activePlayer.time = time; }, seconds);
  // The production controller polls every 100 ms; cross at least two ticks.
  await page.waitForTimeout(250);
}

async function chooseSelect(page, label, option) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function selectedText(page, label) {
  return (await page.getByRole("combobox", { name: label, exact: true }).textContent())?.trim();
}

const browser = await chromium.launch({ headless: true, channel: process.env.LIBITU_BROWSER_CHANNEL ?? "chrome" });
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      const headers = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
      if (url.pathname.startsWith("/api/")) {
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
        if (route.request().method() === "GET" && url.pathname.startsWith(`/api/blueprints/${job.content_id}/sentences/`)
          && url.pathname.endsWith("/sound")) return route.fulfill({ status: 404, json: { detail: "Sound guide is outside this navigation fixture." }, headers });
        if (route.request().method() === "PUT" && url.pathname === `/api/profile/videos/${job.content_id}`)
          return route.fulfill({ status: 204, headers });
        requests.push(`${route.request().method()} ${url.pathname}`);
        if (url.pathname === `/api/content/${blueprint.content_id}`) return route.fulfill({ json: contentContextFixture(blueprint, job), headers });
        if (url.pathname === `/api/jobs/${job.id}`) return route.fulfill({ json: job, headers });
        if (url.pathname === `/api/blueprints/${job.content_id}`) return route.fulfill({ json: blueprint, headers });
        throw new Error(`Unexpected API call: ${url.pathname}`);
      }
      if (url.origin === origin || url.hostname.endsWith(".clerk.accounts.dev")) return route.continue();
      return route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><body style='margin:0;background:#eeeef5;height:100vh;display:grid;place-content:center;color:#686377;font:16px system-ui'>Video player test fixture</body>" });
    });
    await installSignedInPractice(page);
    await page.addInitScript(() => {
      window.__players = [];
      window.YT = { Player: class {
        time = 0; rate = 1; playing = false; ready = false; destroyed = false; seeks = [];
        constructor(_element, { events }) {
          this.events = events;
          window.__players.push(this);
          window.__activePlayer = this;
          queueMicrotask(() => { this.ready = true; events.onReady(); });
        }
        getCurrentTime() { return this.time; }
        seekTo(seconds) { this.seeks.push(seconds); if (!window.__holdSeek) this.time = seconds; }
        playVideo() { this.playing = true; this.events.onStateChange({ data: 1 }); }
        pauseVideo() { this.playing = false; this.events.onStateChange({ data: 2 }); }
        setPlaybackRate(rate) { this.rate = rate; this.events.onPlaybackRateChange?.({ data: rate }); }
        getPlaybackRate() { return this.rate; }
        getAvailablePlaybackRates() { return [0.5, 0.75, 1, 1.25, 1.5]; }
        destroy() { this.destroyed = true; this.playing = false; }
      } };
    });
    await page.goto(entry, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForFunction(() => window.__activePlayer?.ready);
    await page.screenshot({ path: `output/playwright/reader-${viewport.width}.png`, fullPage: true });
    const workspaceFrame = await page.locator(".youtube-player iframe").elementHandle();
    const initialPlayers = await page.evaluate(() => window.__players.length);
    await page.getByRole("button", { name: "Choose a segment to shadow", exact: true }).click();
    await page.locator(".stage-one-segment-card").first().waitFor();
    assert.equal(await workspaceFrame.evaluate(node => node.isConnected), true, "picker retains the actual iframe");
    assert.equal(await page.locator("[data-workspace-media-host]").isVisible(), false, "picker hides and pauses the host");
    await startSegment(page, 0);
    assert.equal(await page.evaluate(() => window.__players.length), initialPlayers, "Reader → picker → preparation → Shadow creates no additional players");
    assert.equal(await workspaceFrame.evaluate(node => node === document.querySelector(".youtube-player iframe")), true);
    assert.equal(await page.getByRole("navigation", { name: "Main navigation", exact: true }).count(), 1);
    assert.equal(await page.getByRole("link", { name: "Practice", exact: true }).getAttribute("aria-current"), "page");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: `output/playwright/shadow-${viewport.width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}: reader/picker/Shadow retain the same media host and share responsive global/workflow navigation`);
    await context.close();
  }
} finally { await browser.close(); }
