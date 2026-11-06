import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixtureRecords, fixtureContentId, loadoutOwner, installLoadoutFixture } from './helpers/loadout-fixture.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.LIBITU_TEST_URL ?? 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [width, initialOwner] of [[1440, null], [390, null], [1440, loadoutOwner]]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage(), reader = await context.newPage();
    page.setDefaultTimeout(60000); reader.setDefaultTimeout(60000);
    const state = await installLoadoutFixture(page, { origin, initialOwner });
    await page.route("**/api/corpus/*", async route => {
      if (route.request().method() !== "DELETE") return route.fallback();
      const id = new URL(route.request().url()).pathname.split("/").at(-1);
      const rows = state.cloud.get(initialOwner);
      const entry = [...rows.entries()].find(([, row]) => row.id === id);
      assert.ok(entry);
      rows.delete(entry[0]);
      return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
    });
    await page.goto(`${origin}/corpus`);
    await page.getByText('10 items', { exact: true }).waitFor();
    await installLoadoutFixture(reader, { origin, shadow: true, seedCorpus: false, initialOwner, sharedState: state });
    await reader.goto(`${origin}/practice/${fixtureContentId}`);
    await reader.getByRole('button', { name: /^Saved/ }).click();
    await reader.getByText('5 items saved from this source', { exact: true }).waitFor();
    for (const row of fixtureRecords.slice(0, 2)) await page.getByRole('checkbox', { name: `Select ${row.item.text}`, exact: true }).check();
    await page.getByRole('searchbox', { name: 'Search corpus' }).fill('to be fair');
    await page.getByRole('button', { name: 'Delete selected (2)', exact: true }).click();
    const confirm = page.getByRole('dialog', { name: 'Delete 2 saved items?', exact: true });
    await confirm.getByText('2 selected items are hidden by your current filters.', { exact: true }).waitFor();
    assert.equal(await confirm.getByRole('button', { name: 'Keep items' }).evaluate(el => el === document.activeElement), true);
    await confirm.getByRole('button', { name: 'Keep items' }).click();
    assert.equal(await page.getByRole('button', { name: 'Delete selected (2)' }).count(), 1);
    await page.getByRole('button', { name: 'Delete selected (2)' }).click();
    await confirm.getByRole('button', { name: 'Confirm delete' }).click();
    await confirm.waitFor({ state: 'hidden' });
    await reader.getByText('3 items saved from this source', { exact: true }).waitFor();
    for (const row of fixtureRecords.slice(0, 2)) assert.equal(await reader.getByText(row.item.text, { exact: true }).count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await context.close();
    console.log(`PASS ${width} ${initialOwner ?? "guest"}: batch confirmation, cancel, hidden selections, cross-tab Stage 1 Saved sync`);
  }
} finally { await browser.close(); }
