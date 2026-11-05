import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { installProfileFixture, profileHistory } from "./helpers/profile-fixture.mjs";

const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3000";
function gate() { let release; const promise = new Promise(resolve => { release = resolve; }); return { promise, release }; }
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir('output/playwright/pending-feedback', { recursive: true });
try {
  for (const width of [1400, 390]) for (const reducedMotion of ["no-preference", "reduce"]) {
    const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion });
    await context.addCookies([{ name: "__clerk_db_jwt", value: "synthetic-browser-device", url: origin }]);
    const page = await context.newPage();
    const state = await installProfileFixture(page, { origin });
    await page.goto(`${origin}/profile/history`);
    await page.getByText(profileHistory[19].title, { exact: true }).waitFor();
    const more = page.locator('.ui-button').filter({ hasText: 'Load more practice' });
    const original = await more.boundingBox();
    const quick = gate(); state.historyGate = quick.promise; state.failHistory = true;
    const request = page.waitForRequest(r => r.url().includes('/api/profile/history') && r.url().includes('offset=20'));
    await more.click(); await request;
    assert.equal(await more.isDisabled(), true, 'pending actions disable immediately');
    assert.equal(await more.getAttribute('aria-busy'), 'true');
    assert.equal(await more.locator('.ui-button-progress').count(), 0, 'short request keeps its idle label');
    assert.equal(await page.getByRole('status', { name: 'Loading practice history…' }).count(), 0, 'pagination does not append a skeleton');
    quick.release(); state.historyGate = null;
    await page.locator('main [role="alert"]').waitFor();
    assert.equal(await page.getByText(profileHistory[19].title, { exact: true }).count(), 1, 'failed pagination retains records');
    await page.waitForTimeout(650);
    assert.equal(await page.locator('[data-progress="true"]').count(), 0, 'finished requests cancel delayed feedback');

    const slow = gate(); state.historyGate = slow.promise;
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await more.locator('.ui-button-progress').waitFor();
    const during = await more.boundingBox();
    assert.equal(during.width, original.width, 'loading overlay preserves button width');
    assert.equal(during.height, original.height, 'loading overlay preserves button height');
    assert.equal(await page.getByRole('status', { name: 'Loading practice history…' }).count(), 0);
    slow.release(); state.historyGate = null;
    await page.getByText(profileHistory[22].title, { exact: true }).waitFor();

    const filter = gate(); state.historyGate = filter.promise;
    const results = page.locator('[class*="historyResults"]');
    const height = await results.evaluate(el => el.getBoundingClientRect().height);
    await page.getByRole('button', { name: 'Shadowing', exact: true }).click();
    await page.getByText('Updating history…', { exact: true }).waitFor();
    assert.equal(await results.evaluate(el => el.getBoundingClientRect().height), height, 'filter keeps previous list geometry while waiting');
    await page.screenshot({ path: `output/playwright/pending-feedback/history-${width}-${reducedMotion}.png`, animations: 'disabled' });
    assert.equal(await page.getByText(profileHistory[1].title, { exact: true }).count(), 1, 'previous results stay until replacement arrives');
    filter.release(); state.historyGate = null;
    await page.waitForFunction(() => document.querySelector('[class*="historyResults"]')?.getAttribute('aria-busy') === 'false');
    assert.equal(await page.getByText(profileHistory[1].title, { exact: true }).count(), 0);
    await page.getByRole('button', { name: 'All practice', exact: true }).click();
    await page.getByText(profileHistory[19].title, { exact: true }).waitFor();
    assert.equal(state.requests.filter(r => r.path === '/api/profile/history').at(-1).query.offset, '0', 'returning to a paginated filter starts at page one');

    await page.goto(`${origin}/profile`);
    const chart = page.getByRole('img', { name: /^Shadowing takes:/ });
    await chart.waitFor(); const chartNode = await chart.elementHandle();
    const chartGate = gate(); state.profileGate = chartGate.promise;
    await page.getByRole('button', { name: 'Last 3 months', exact: true }).click();
    await page.getByText('Updating activity…', { exact: true }).waitFor();
    assert.ok(await chartNode.evaluate(el => el.isConnected), 'range changes preserve the existing chart');
    await page.screenshot({ path: `output/playwright/pending-feedback/chart-${width}-${reducedMotion}.png`, animations: 'disabled' });
    assert.equal(await page.locator('#activity-panel [aria-busy="true"]').count(), 0, 'existing chart is not replaced with a skeleton');
    chartGate.release(); state.profileGate = null;
    await page.waitForFunction(() => document.querySelector('#activity-panel')?.getAttribute('aria-busy') === 'false');
    await page.getByText('View activity data', { exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('table tbody tr').length === 90);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(state.errors, []);
    console.log(`PASS ${width} ${reducedMotion}: delayed/cancelled feedback, stable buttons, immediate errors, retained history/chart, pagination reset`);
    await context.close();
  }
} finally { await browser.close(); }
