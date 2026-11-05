import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installProfileFixture, profileHistory } from "./helpers/profile-fixture.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3000";
const artifacts = await mkdtemp(join(tmpdir(), "libitu-history-"));
const browser = await chromium.launch({ headless: true, channel: process.env.LIBITU_BROWSER_CHANNEL ?? "chrome" });
try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, timezoneId: "Asia/Shanghai" });
    const page = await context.newPage();
    const state = await installProfileFixture(page, { origin });
    // A missing source URL alone is still recoverable via the canonical content ID.
    state.transformHistory = result => ({ ...result, items: result.items.map(item =>
      item.id === profileHistory[22].id ? { ...item, content_id: null }
        : item.id === profileHistory[3].id ? { ...item, title: "Secure approval for a six-week pilot before committing to a full twelve-month platform rollout.", status: "active" } : item) });
    await page.goto(`${origin}/profile`, { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /^Practice history/ }).click();
    await page.getByRole("heading", { name: "Practice history", exact: true }).waitFor();
    const feed = page.getByRole("region", { name: "Saved practice history" });
    await feed.getByText(profileHistory[19].title, { exact: true }).waitFor();
    assert.equal(await feed.locator("li").count(), 20);
    await feed.getByRole("status").filter({ hasText: /^20 entries loaded$/ }).waitFor();
    assert.equal(await feed.getByRole("heading", { name: "Friday, Oct 2, 2026" }).count(), 1);
    assert.match(await feed.locator("time").first().innerText(), /2:00 PM/);
    await page.screenshot({ path: join(artifacts, `history-initial-${width}.png`), fullPage: true });
    state.failHistory = true;
    await feed.getByRole("button", { name: "Load more practice" }).click();
    await feed.getByRole("button", { name: "Retry", exact: true }).waitFor();
    assert.equal(await feed.locator("li").count(), 20);
    await feed.getByRole("status").filter({ hasText: /^20 entries loaded$/ }).waitFor();
    await feed.getByRole("button", { name: "Retry", exact: true }).click();
    await feed.getByText(profileHistory[22].title, { exact: true }).waitFor();
    assert.equal(await feed.locator("li").count(), 23);
    await feed.getByRole("status").filter({ hasText: /^23 entries$/ }).waitFor();
    assert.equal(await feed.getByRole("heading", { name: "Thursday, Oct 1, 2026" }).count(), 1);
    assert.equal(await feed.getByText("Source unavailable", { exact: true }).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: join(artifacts, `history-${width}.png`), fullPage: true });
    await feed.getByRole("button", { name: "Shadowing", exact: true }).focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector('[class*="historyResults"]')?.getAttribute('aria-busy') === 'false');
    await feed.getByText(profileHistory[22].title, { exact: true }).waitFor();
    assert.equal(await feed.locator("li").count(), 12);
    await feed.getByRole("status").filter({ hasText: /^12 entries$/ }).waitFor();
    assert.equal(await feed.getByRole("button", { name: "Shadowing", exact: true }).evaluate(el => document.activeElement === el), true);
    assert.equal(await feed.getByText("Completed", { exact: true }).count(), 0);
    assert.equal(await feed.getByRole("button", { name: "Load more practice" }).count(), 0);
    // A late response from the previous filter must not replace the new one.
    let release;
    state.historyGate = new Promise((resolve) => { release = resolve; });
    const requestStarted = page.waitForRequest((request) => request.url().includes("kind=speaking"));
    await feed.getByRole("button", { name: "Missions", exact: true }).click();
    await requestStarted;
    state.historyGate = null;
    await feed.getByRole("button", { name: "All practice", exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[class*="historyResults"]')?.getAttribute('aria-busy') === 'false');
    await feed.getByText(profileHistory[0].title, { exact: true }).waitFor();
    release();
    await page.waitForTimeout(150);
    assert.equal(await feed.locator("li").count(), 20);
    await feed.getByRole("status").filter({ hasText: /^20 entries loaded$/ }).waitFor();
    await feed.getByRole("button", { name: "Missions", exact: true }).click();
    await feed.getByText(profileHistory[21].title, { exact: true }).waitFor();
    assert.equal(await feed.locator("li").count(), 11);
    assert.equal(await feed.locator("li").first().locator("time").locator("..").getByText("Completed", { exact: true }).count(), 1);
    assert.equal(await feed.getByText("Saved take", { exact: true }).count(), 0);
    assert.match(await feed.locator("li a").first().getAttribute("href"), /\/analytics$/);
    state.transformHistory = (result, request) => request.query.kind === "video" ? {
      items: [{ ...profileHistory[0], id: "original-video", kind: "video", status: "opened", title: "Original video source", duration_ms: null, turn_count: null }], next_offset: null
    } : result;
    await feed.getByRole("button", { name: "Videos", exact: true }).click();
    await feed.getByRole("status").filter({ hasText: /^1 entry$/ }).waitFor();
    assert.equal((await feed.locator("time").locator("..").innerText()).match(/Original video/g)?.length, 1);
    assert.match(await feed.getByRole("link", { name: /Open Stage 1/ }).getAttribute("href"), /^\/practice\//);
    state.empty = true;
    await feed.getByRole("button", { name: "Shadowing", exact: true }).click();
    await feed.getByRole("heading", { name: "No saved shadowing takes yet" }).waitFor();
    await feed.getByRole("status").filter({ hasText: /^0 entries$/ }).waitFor();
    assert.equal(await feed.getByRole("link", { name: "Explore practice" }).getAttribute("href"), "/");
    await page.screenshot({ path: join(artifacts, `empty-${width}.png`), fullPage: true });
    assert.deepEqual(state.errors, []);
    await context.close();
    console.log(`PASS history ${width}px: profile entry, local dates, pagination retry, filters, stale response, report navigation, empty state`);
  }
  console.log(`Screenshots: ${artifacts}`);
} finally { await browser.close(); }
