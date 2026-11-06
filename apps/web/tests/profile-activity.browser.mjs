import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { installProfileFixture } from "./helpers/profile-fixture.mjs";

const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3000";
const metrics = ["Shadowing takes", "Speaking turns", "Corpus added"];
const totals = { "4w": [42, 27, 12], "3m": [135, 90, 36], all: [12, 6, 4] };
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir("output/playwright/profile-activity", { recursive: true });
try {
  for (const width of [1400, 390]) for (const reducedMotion of ["no-preference", "reduce"]) {
    const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion });
    const page = await context.newPage();
    const duplicateKeys = [];
    page.on("console", message => { if (/same key|unique.*key/i.test(message.text())) duplicateKeys.push(message.text()); });
    const state = await installProfileFixture(page, { origin });
    try {
      await page.goto(`${origin}/profile`);
      const panel = page.getByRole("tabpanel", { name: "Shadowing takes", exact: true });
      await panel.getByRole("img").waitFor();
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator("#activity-panel");
      const svg = await chart.getByRole("img").elementHandle();
      const initialHeight = (await chart.boundingBox()).height;
      const requestsBefore = state.requests.filter(request => request.path === "/api/profile").length;

      async function checkMetric(index, range = "4w") {
        assert.equal(await chart.getByRole("img").count(), 1, "only the active chart is present");
        assert.equal(await chart.locator('[class*="chartTotal"]').count(), 1, "old totals must be replaced, not accumulated");
        assert.equal(await chart.locator("strong").textContent(), String(totals[range][index]));
        assert.equal(await chart.locator('[class*="chartTotal"] span').textContent(), `${metrics[index].toLowerCase()} in this period`);
        assert.equal(await chart.getAttribute("aria-labelledby"), await page.getByRole("tab", { name: metrics[index], exact: true }).getAttribute("id"));
        assert.ok(await svg.evaluate(node => node.isConnected), "metric switches update the existing chart");
        assert.ok(Math.abs((await chart.boundingBox()).height - initialHeight) < 1, "switching metrics keeps the panel height stable");
      }

      for (const index of [1, 2, 1, 0, 2, 0, 1, 2, 0]) {
        await page.getByRole("tab", { name: metrics[index], exact: true }).click();
        await checkMetric(index);
      }
      for (const [key, index] of [["ArrowRight", 1], ["End", 2], ["ArrowLeft", 1], ["Home", 0]]) {
        await page.keyboard.press(key);
        await checkMetric(index);
        assert.equal(await page.getByRole("tab", { name: metrics[index], exact: true }).evaluate(node => node === document.activeElement), true);
      }
      assert.equal(state.requests.filter(request => request.path === "/api/profile").length, requestsBefore, "metric tabs do not refetch activity");

      let release;
      state.profileGate = new Promise(resolve => { release = resolve; });
      await page.getByRole("button", { name: "Last 3 months", exact: true }).click();
      await page.waitForFunction(() => document.querySelector("#activity-panel")?.getAttribute("aria-busy") === "true");
      await page.getByRole("tab", { name: "Corpus added", exact: true }).click();
      await checkMetric(2);
      release(); state.profileGate = null;
      await page.waitForFunction(() => document.querySelector("#activity-panel")?.getAttribute("aria-busy") === "false");
      await checkMetric(2, "3m");
      await page.getByRole("button", { name: "All time", exact: true }).click();
      await page.waitForFunction(() => document.querySelector("#activity-panel strong")?.textContent === "4");
      await checkMetric(2, "all");

      state.transformProfile = result => ({ ...result, activity: { ...result.activity, items: result.activity.items.map(item => ({ ...item, speaking_turns: 0, corpus_added: null })) } });
      await page.getByRole("button", { name: "Last 4 weeks", exact: true }).click();
      await chart.getByText("Dates aren’t available for this activity yet.", { exact: true }).waitFor();
      await page.getByRole("tab", { name: "Speaking turns", exact: true }).click();
      await chart.getByText("No speaking turns in this period", { exact: true }).waitFor();
      assert.equal(await chart.getByRole("img").count(), 0, "empty state removes the previous chart");
      assert.equal(await chart.locator('[class*="chartTotal"]').count(), 0, "empty state removes the previous total");
      await page.getByRole("tab", { name: "Shadowing takes", exact: true }).click();
      assert.equal(await chart.getByRole("img").count(), 1);
      assert.equal(await chart.locator('[class*="chartTotal"]').count(), 1);
      assert.equal(await chart.locator("strong").textContent(), "42");
      await page.waitForTimeout(200);
      if (reducedMotion === "reduce") assert.equal(await chart.evaluate(node => node.getAnimations({ subtree: true }).length), 0);
      await chart.screenshot({ path: `output/playwright/profile-activity/${width}-${reducedMotion}.png` });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(duplicateKeys, []);
      assert.deepEqual(state.errors, []);
      console.log(`PASS ${width} ${reducedMotion}: repeated/keyboard metric switches, stable chart/height, delayed range updates, empty/missing data`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
