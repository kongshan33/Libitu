import { contentContextFixture } from "../../apps/web/tests/helpers/content-context-fixture.mjs";
import assert from "node:assert/strict";
import { installSignedInPractice } from "../../apps/web/tests/helpers/signed-in-practice.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3000";
const titles = {
  unavailable: "Word timing unavailable", partial: "Partial word timing",
  off: "Word highlighting is off", hidden: "Word highlighting is hidden"
};
const sourceSentences = ["Amber silence remains.", "Cobalt timing varies.", "Violet words synchronize."];

function fixture(status) {
  const modes = status === "unavailable" ? ["invalid", "block"] : status === "full" ? ["full", "full"]
    : ["invalid", "partial", "full"];
  const transcript = modes.map((mode, index) => {
    const text = sourceSentences[index];
    const start = 1000 + index * 3000;
    const words = text.split(" ").map((word, offset) => ({
      source_token_index: index * 3 + offset, text: word, start_ms: start + offset * 300,
      end_ms: start + (offset + 1) * 300, start_source: "caption_offset", end_source: "next_word_estimate",
      source_event_index: index, source_seg_index: offset
    }));
    return {
      id: `sentence-v3-notice-${status}-${index}`, segmentation_version: "sentence-v3", time: `0:0${1 + index * 3}`,
      parts: [text], start_ms: start, end_ms: start + 3000, source_token_start: index * 3, source_token_end: index * 3 + 3,
      boundary_source: "source_punctuation", boundary_confidence: "high",
      timing_source: mode === "block" ? "caption_event_estimate" : "caption_word_offsets",
      word_timings: mode === "block" ? [] : mode === "partial" ? [words[0]] : mode === "full" ? words : [
        { ...words[0], end_ms: null, end_source: null },
        { ...words[1], text: "unmatched-provider-token" },
        { ...words[2], end_ms: words[2].start_ms }
      ]
    };
  });
  const job = { id: `notice-job-${status}`, content_id: `15eabce1-7847-4f3e-aa20-f1e49e53a01${["unavailable", "full", "partial"].indexOf(status)}`, status: "ready",
    blueprint_id: `notice-blueprint-${status}`, processing_stage: "completed", analysis_version: "mvp-v9",
    analysis_preview: null, error_message: null };
  const blueprint = {
    id: job.blueprint_id, content_id: job.content_id, title: "Word timing status fixture",
    source_url: "https://www.youtube.com/watch?v=practice123", summary: "Practice complete sentences.",
    chapters: [], logic_flow: [], corpus_items: [], transcript,
    segments: [{ id: "notice-segment", sequence: 1, title: "Timing practice", summary: "Listen and repeat.",
      start_ms: 1000, end_ms: 1000 + modes.length * 3000, transcript_start_index: 0,
      transcript_end_index: modes.length, phonology_tags: [] }]
  };
  return { job, blueprint };
}

function soundGuide(blueprint, row) {
  const text = row.parts[0];
  const tokens = [...text.matchAll(/[A-Za-z]+/g)].map((match, index) => ({
    index, text: match[0], start: match.index, end: match.index + match[0].length,
    status: "known", pronunciations: [["AH0"]], ipa: ["ə"]
  }));
  return { version: "sound-rules-v1", content_id: blueprint.content_id, sentence_id: row.id,
    sentence_text: text, dialect: "en-US", provider: "cmudict-rules", lexicon_version: "browser-fixture",
    tokens, candidates: [], coverage: { total: tokens.length, known: tokens.length }, warnings: [] };
}

async function expectNotice(page, status) {
  if (status === "full") {
    await page.waitForFunction(() => !document.querySelector(".word-timing-notice"));
    return;
  }
  const notice = page.locator(`.word-timing-notice[data-word-timing-status='${status}']`);
  await notice.waitFor();
  assert.equal(await page.locator(".word-timing-notice").count(), 1);
  assert.equal(await notice.getByText(titles[status], { exact: true }).count(), 1);
  for (const [other, title] of Object.entries(titles)) {
    if (other !== status) assert.equal(await notice.getByText(title, { exact: true }).count(), 0);
  }
  for (const sentence of sourceSentences) assert.ok(!(await notice.textContent()).includes(sentence), "status messages never reproduce source text");
}

const browser = await chromium.launch({ headless: true, channel: process.env.LIBITU_BROWSER_CHANNEL ?? "chrome" });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    for (const status of ["full"]) {
      const { job, blueprint } = fixture(status);
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const errors = [], requests = [], assets = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("request", (request) => { if (new URL(request.url()).pathname.includes("/acoustic-assets/")) assets.push(request.url()); });
      await page.route("**/*", async (route) => {
        const request = route.request(), url = new URL(request.url());
        const headers = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
        if (url.pathname.startsWith("/api/")) {
          if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
          if (request.method() === "PUT" && url.pathname === `/api/profile/videos/${blueprint.content_id}`) return route.fulfill({ status: 204, headers });
          requests.push(`${request.method()} ${url.pathname}`);
          assert.equal(request.method(), "GET", "timing status is computed locally without writes or analysis requests");
          if (url.pathname === `/api/content/${blueprint.content_id}`) return route.fulfill({ json: contentContextFixture(blueprint, job), headers });
          if (url.pathname === `/api/jobs/${job.id}`) return route.fulfill({ json: job, headers });
          if (url.pathname === `/api/blueprints/${job.content_id}`) return route.fulfill({ json: blueprint, headers });
          const row = blueprint.transcript.find((line) => url.pathname === `/api/blueprints/${job.content_id}/sentences/${line.id}/sound`);
          assert.ok(row, `Unexpected API request: ${url.pathname}`);
          return route.fulfill({ json: soundGuide(blueprint, row), headers });
        }
        if (url.origin === origin || url.hostname.endsWith(".clerk.accounts.dev")) return route.continue();
        return route.fulfill({ contentType: "text/html", body: "<!doctype html><body>Video timing fixture</body>" });
      });
      await installSignedInPractice(page);
      await page.addInitScript(() => {
        window.__players = [];
        window.YT = { Player: class {
          time = 0; rate = 1; playing = false; ready = false;
          constructor(_element, { events }) {
            this.events = events;
            window.__players.push(this);
            window.__activePlayer = this;
            queueMicrotask(() => { this.ready = true; events.onReady(); });
          }
          getCurrentTime() { return this.time; }
          getPlayerState() { return this.playing ? 1 : 2; }
          seekTo(seconds) { this.time = seconds; }
          playVideo() { this.playing = true; this.events.onStateChange({ data: 1 }); }
          pauseVideo() { this.playing = false; this.events.onStateChange({ data: 2 }); }
          setPlaybackRate(rate) { this.rate = rate; this.events.onPlaybackRateChange?.({ data: rate }); }
          getPlaybackRate() { return this.rate; }
          getAvailablePlaybackRates() { return [0.75, 1, 1.25]; }
          destroy() { this.destroyed = true; this.playing = false; }
        } };
      });
      const url = `${origin}/practice/${job.content_id}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.getByRole("region", { name: "Reference preparation", exact: true }).waitFor({timeout:10000}).catch(async error => { console.log(await page.locator("body").innerText()); throw error; });
      await page.waitForFunction(() => window.__activePlayer?.ready);
      assert.equal(await page.locator(".transcript-line").count(), blueprint.transcript.length);
      await expectNotice(page, status);
      const reference = page.getByRole("region", { name: "Reference preparation", exact: true });
      assert.equal(await reference.locator(".reader-reference-details, .stage-two-reference-copy > span").count(), 0);
      await reference.getByRole("button", { name: "Enable reference audio", exact: true }).waitFor();
      if (status === "full") {
        await page.evaluate(() => { window.__activePlayer.time = 1.1; window.__activePlayer.playVideo(); });
        const active = page.locator(".caption-word-active").first(); await active.waitFor();
        assert.deepEqual(await active.evaluate(node => ({ bg: getComputedStyle(node).backgroundColor, fg: getComputedStyle(node).color })), { bg: "rgb(240, 238, 236)", fg: "rgb(68, 64, 60)" });
        await active.scrollIntoViewIfNeeded();
        await page.screenshot({path:`output/playwright/quiet-word-${viewport.width}.png`});
        await page.evaluate(() => window.__activePlayer.pauseVideo());
      }
      await page.screenshot({path:`output/playwright/reference-correction-${viewport.width}.png`});
      console.log(`Reference copy and live caption colors passed ${viewport.width}`);
      await context.close();
    }
  }
} finally { await browser.close(); }
