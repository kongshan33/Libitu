import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fixtureRecords, installLoadoutFixture, loadoutOwner } from "./helpers/loadout-fixture.mjs";

// Synthetic identity, corpus, history and Mission responses. Never starts a
// microphone/runtime connection or sends a request to an AI provider/database.
const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3000";
const artifacts = process.env.LIBITU_LOADOUT_ARTIFACTS ?? "/tmp/libitu-loadout-redesign";
await mkdir(artifacts, { recursive: true });
const tags = [["framing"], ["proposing"], ["justifying"], ["contrast"], ["hedging"], ["framing"], ["idiom", "acknowledging"], ["proposing"], ["idiom"], ["summarising"]];
const records = fixtureRecords.map((record, index) => ({ ...record,
  createdAt: new Date(Date.UTC(2026, 9, 20, index)).toISOString(),
  item: { ...record.item, tags: tags[index] },
}));
const requestedWidth = Number(process.env.LIBITU_LOADOUT_VIEWPORT ?? 0);
const widths = [1440, 390].filter(width => !requestedWidth || requestedWidth === width);
const headers = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization,content-type", "access-control-allow-methods": "POST,OPTIONS" };
const browser = await chromium.launch({ channel: process.env.LIBITU_BROWSER_CHANNEL ?? "chrome", headless: true });

async function draft(page) {
  return page.evaluate(owner => JSON.parse(localStorage.getItem("libitu:loadout:v1")).accounts[owner].draft, loadoutOwner);
}

async function saved(page, count) {
  await page.waitForFunction(({ owner, count }) => {
    const value = JSON.parse(localStorage.getItem("libitu:loadout:v1") ?? "null")?.accounts?.[owner]?.draft;
    return value && document.querySelector("[data-pending]")?.getAttribute("data-pending") === "false"
      && (count === undefined || value.selectedKeys.length === count);
  }, { owner: loadoutOwner, count });
}

async function checkLayout(page, name) {
  const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(overflow.scroll <= overflow.width + 1, `${name}: horizontal page overflow ${JSON.stringify(overflow)}`);
  const modalOpen = await page.locator("dialog[open]").count() > 0;
  await page.screenshot({ path: join(artifacts, `${name}.png`), fullPage: !modalOpen });
  if (!modalOpen && overflow.width === 390) await page.screenshot({ path: join(artifacts, `${name}-viewport.png`) });
}

async function selectPreference(page, option) {
  const chip = page.getByRole("region", { name: "Quick start", exact: true }).getByRole("button", { name: option, exact: true });
  await chip.click();
  await saved(page);
  assert.equal(await chip.getAttribute("aria-pressed"), "true");
}

async function selectFromDrawer(page, record) {
  await page.getByRole("button", { name: "Browse the full corpus by function", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "All corpus", exact: true });
  await drawer.getByRole("button", { name: `Select ${record.item.text}`, exact: true }).click();
  await saved(page, 1);
  await drawer.getByRole("button", { name: "Done", exact: true }).click();
  await drawer.waitFor({ state: "hidden" });
}

async function fixture(width, fixtureCorpus = records) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1050 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  const state = await installLoadoutFixture(page, { origin, initialOwner: loadoutOwner, records: fixtureCorpus });
  state.historyRequests = [];
  await page.route("**/api/speaking/support-recommendations", async route => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    const input = route.request().postDataJSON();
    state.historyRequests.push(input);
    return route.fulfill({ headers, json: {
      status: "insufficient_history", suggested_level: null, current_level: input.current_level,
      rule_version: "support-history-v1", as_of: "2026-10-25T00:00:00Z", history_truncated: false,
      reason: "No qualifying independent practice in this fixture.",
      targets: input.targets.map(target => ({ ...target, qualifying_missions: 0, practice_days: 0, scene_roots: 0, eligible: false, evidence: [] })),
    } });
  });
  await page.goto(`${origin}/loadout`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByRole("heading", { name: "Mission loadout", exact: true }).waitFor();
  await page.getByRole("region", { name: "Quick start", exact: true }).waitFor();
  await saved(page, 0);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some(button => button.textContent?.includes("Free conversation, no targets") && !button.disabled));
  if (fixtureCorpus.length) {
    await page.waitForFunction(() => [...document.querySelectorAll("button")].some(button => button.textContent?.trim() === "Quick start" && !button.disabled));
    await page.getByText("Never used in recorded missions", { exact: true }).first().waitFor();
  }
  return { page, context, state };
}

async function ready(page) {
  await page.waitForURL(/\/speaking\/10000000/);
  await page.getByRole("button", { name: "Start conversation", exact: true }).waitFor();
}

async function defaultStartAndRetry(width) {
  const { page, context, state } = await fixture(width);
  try {
    const hero = page.getByRole("region", { name: "Quick start", exact: true });
    assert.equal(await hero.evaluate(node => getComputedStyle(node).backgroundColor), "rgb(12, 10, 9)");
    const picks = await hero.locator("li strong").allTextContents();
    assert.equal(picks.length, 3, "Quick start has three real saved recommendations");
    assert.equal(new Set(picks).size, 3);
    assert.ok(picks.every(text => records.some(record => record.item.text === text)));
    assert.deepEqual((await draft(page)).selectedKeys, [], "recommendation preview does not silently pin targets");
    const preview = page.getByRole("complementary", { name: "Loadout preview", exact: true });
    await preview.getByRole("button", { name: "Quick start", exact: true }).waitFor();
    assert.equal(await preview.getByRole("button", { name: "Quick start", exact: true }).evaluate(node => getComputedStyle(node).backgroundColor), "rgb(12, 10, 9)",
      "the sidebar primary action uses the black reference styling");
    const advanced = page.getByRole("region", { name: "Advanced settings", exact: true });
    await advanced.waitFor();
    assert.equal(await advanced.getByRole("button", { name: /^Mission preferences/ }).getAttribute("aria-expanded"), "false");
    const rows = advanced.locator(":scope > details");
    assert.equal(await rows.count(), 3, "Advanced has a preference button and three independent disclosure rows");
    assert.deepEqual(await rows.evaluateAll(nodes => nodes.map(node => node.open)), [false, false, false]);
    await checkLayout(page, `quick-start-${width}`);

    state.failNextCreate = true;
    await preview.getByRole("button", { name: "Quick start", exact: true }).click();
    await preview.getByRole("button", { name: "Retry start mission", exact: true }).waitFor();
    assert.equal(state.creates.length, 1);
    assert.equal(state.planRequests.length, 1);
    const planRequest = state.planRequests[0].input;
    assert.equal(planRequest.candidate_count, 1);
    assert.equal(planRequest.targets.length, 3);
    assert.ok(planRequest.targets.every(target => target.role === "primary"), "new starts use the unified target list");
    const cloud = [...state.cloud.get(loadoutOwner).values()];
    assert.deepEqual(planRequest.targets.map(target => cloud.find(row => row.id === target.corpus_item_id).text), picks,
      "Start uses exactly the three visible recommendations, in order");
    const request = structuredClone(state.creates[0].input);
    const pending = await draft(page);
    assert.equal(pending.submission.request.client_id, request.client_id);
    assert.equal(await hero.getByRole("button", { name: "Shuffle picks", exact: true }).isDisabled(), true);
    assert.equal(await page.getByRole("button", { name: "Free conversation, no targets", exact: true }).isDisabled(), true);
    await checkLayout(page, `retry-start-${width}`);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Retry start mission", exact: true }).click();
    await ready(page);
    assert.deepEqual(state.creates[1].input, request, "reload/retry replays the entire exact create snapshot");
    assert.equal(state.planRequests.length, 1, "retry does not generate another plan");
    assert.equal(state.sessions.size, 1, "uncertain success recovers a single Mission");
    assert.equal((await draft(page)).submission, undefined, "successful acknowledgement releases the setup lock");
    assert.equal((await draft(page)).lastLogicId, request.logic_template_id, "acknowledgement records the previous logic for automatic recommendations");
    if (width < 720) await page.getByRole("button", { name: "Show practice steps", exact: true }).click();
    await page.getByRole("link", { name: "Loadout", exact: true }).click();
    await saved(page);
    assert.equal((await draft(page)).origin, "quick", "returning does not turn automatic picks into a manual selection");
    assert.deepEqual((await draft(page)).pinnedKeys, []);
    await preview.getByRole("region", { name: "Selected targets", exact: true }).locator("strong").first().waitFor();
    const nextPicks = await preview.getByRole("region", { name: "Selected targets", exact: true }).locator("strong").allTextContents();
    const plansBeforeNextStart = state.planRequests.length;
    await preview.getByRole("button", { name: "Quick start", exact: true }).click();
    await ready(page);
    assert.equal(state.sessions.size, 2, "returning to Loadout permits a new Mission");
    assert.notEqual(state.creates[2].input.client_id, request.client_id, "new starts allocate a new request identity");
    assert.deepEqual(state.creates[2].input.corpus_item_ids.map(id => cloud.find(row => row.id === id).text), nextPicks,
      "the next Quick start uses the current preview, which may replan after the previous logic");
    assert.ok(state.planRequests.length >= plansBeforeNextStart && state.planRequests.length <= plansBeforeNextStart + 1,
      "a new automatic start may reuse its matching plan or prepare one new scene");
    assert.ok(state.plans.has(state.creates[2].input.plan_id));
    assert.deepEqual(state.errors, []);
    console.log(`PASS ${width}px: three-target quick start, exact failed-create retry, acknowledgement and a new automatic Mission.`);
  } catch (error) {
    console.error("Quick-start diagnostic", { width, url: page.url(), creates: state.creates, plans: state.planRequests, errors: state.errors, draft: await draft(page).catch(() => null) });
    await page.screenshot({ path: join(artifacts, `failure-quick-${width}.png`), fullPage: true }).catch(() => {});
    throw error;
  } finally { await context.close(); }
}

async function manualDrawerAndFree(width) {
  const { page, context, state } = await fixture(width);
  try {
    await selectFromDrawer(page, records[0]);
    const logicSummary = page.locator("summary").filter({ hasText: /^Logic template/ });
    await logicSummary.click();
    await page.getByRole("group", { name: "workplace logic templates", exact: true }).getByRole("button", { name: /^Persuasive pitch/ }).click();
    await saved(page, 1);
    assert.equal((await draft(page)).logicSource, "manual");
    await logicSummary.click();
    const manualKeys = (await draft(page)).selectedKeys;
    const preview = page.getByRole("complementary", { name: "Loadout preview", exact: true });
    const manualLogic = await preview.locator("h3 + div").innerText();
    const manualLogicId = (await draft(page)).logicTemplateId;
    const hero = page.getByRole("region", { name: "Quick start", exact: true });
    const previousSuggestion = await hero.innerText();
    await hero.getByRole("button", { name: "Shuffle picks", exact: true }).click();
    await saved(page, 1);
    assert.notEqual(await hero.innerText(), previousSuggestion, "Shuffle changes the recommendation");
    assert.deepEqual((await draft(page)).selectedKeys, manualKeys, "Shuffle preserves manual selections");
    assert.equal(await preview.locator("h3 + div").innerText(), manualLogic, "Shuffle preserves the manual Mission's displayed logic");
    assert.equal((await draft(page)).logicTemplateId, manualLogicId, "Shuffle preserves the manual Mission's saved logic");

    const browse = page.getByRole("button", { name: "Browse the full corpus by function", exact: true });
    await browse.click();
    let drawer = page.getByRole("dialog", { name: "All corpus", exact: true });
    await drawer.waitFor();
    await drawer.getByRole("button", { name: "Close corpus drawer", exact: true }).focus();
    await page.keyboard.press("Shift+Tab");
    // Chrome may stop at its browser UI between the dialog's first/last
    // controls. Native modality must still skip every underlying page control.
    if (await page.evaluate(() => document.activeElement === document.body)) await page.keyboard.press("Shift+Tab");
    assert.equal(await drawer.getByRole("button", { name: "Done", exact: true }).evaluate(node => node === document.activeElement), true,
      "native modality skips background controls when moving backward");
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => document.activeElement === document.body)) await page.keyboard.press("Tab");
    assert.equal(await drawer.getByRole("button", { name: "Close corpus drawer", exact: true }).evaluate(node => node === document.activeElement), true,
      "native modality skips background controls when moving forward");
    assert.equal(await drawer.getByRole("button", { name: `Remove ${records[0].item.text}`, exact: true }).getAttribute("aria-pressed"), "true");
    await drawer.getByRole("searchbox", { name: "Search corpus", exact: true }).fill("same page");
    assert.equal(await drawer.getByRole("button", { name: /^Select / }).count(), 1, "drawer searches expressions");
    await drawer.getByRole("searchbox", { name: "Search corpus", exact: true }).fill("Meaning for from my perspective");
    assert.equal(await drawer.getByRole("button", { name: /^Select / }).count(), 1, "drawer searches meanings");
    await drawer.getByRole("searchbox", { name: "Search corpus", exact: true }).fill("proposing");
    assert.equal(await drawer.getByRole("button", { name: /^Select / }).count(), 2, "drawer searches functional tags");
    await drawer.getByRole("searchbox", { name: "Search corpus", exact: true }).fill("");
    await drawer.getByRole("button", { name: "Stance", exact: true }).click();
    assert.equal(await drawer.getByRole("button", { name: /^Select / }).count(), 2, "the Stance function groups contrast and hedging tags");
    await drawer.getByRole("button", { name: `Select ${records[4].item.text}`, exact: true }).click();
    await saved(page, 2);
    await drawer.getByRole("button", { name: "All functions", exact: true }).click();
    for (const [index, record] of [records[1], records[2], records[6]].entries()) {
      await drawer.getByRole("button", { name: `Select ${record.item.text}`, exact: true }).click();
      await saved(page, 3 + index);
    }
    await drawer.getByText("5 / 5 selected", { exact: true }).waitFor();
    assert.equal(await drawer.getByRole("button", { name: `Select ${records[3].item.text}`, exact: true }).isDisabled(), true,
      "five slots are shared across structures, chunks and idioms");
    assert.equal(await drawer.getByRole("button", { name: `Select ${records[5].item.text}`, exact: true }).isDisabled(), true);
    await checkLayout(page, `corpus-drawer-${width}`);
    await drawer.getByRole("button", { name: `Remove ${records[4].item.text}`, exact: true }).click();
    await saved(page, 4);
    assert.equal(await drawer.getByRole("button", { name: `Select ${records[5].item.text}`, exact: true }).isEnabled(), true);
    await drawer.getByRole("button", { name: `Select ${records[5].item.text}`, exact: true }).click();
    await saved(page, 5);
    await page.keyboard.press("Escape");
    await drawer.waitFor({ state: "hidden" });
    assert.equal(await browse.evaluate(node => node === document.activeElement), true, "Escape restores focus to the drawer trigger");
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), "hidden", "drawer restores page scrolling");
    await preview.getByRole("button", { name: `Remove ${records[5].item.text} from loadout`, exact: true }).waitFor();
    assert.ok((await draft(page)).selectedKeys.includes(records[5].key), "drawer selection is shared with the persisted preview");
    await page.getByRole("button", { name: "Start with 5 targets", exact: true }).waitFor();

    await browse.click();
    drawer = page.getByRole("dialog", { name: "All corpus", exact: true });
    await drawer.getByRole("button", { name: "Done", exact: true }).click();
    await drawer.waitFor({ state: "hidden" });
    await hero.getByRole("button", { name: "Adjust", exact: true }).click();
    await hero.getByRole("button", { name: "Travel", exact: true }).waitFor();
    assert.equal(await hero.getByRole("button", { name: "Guided", exact: true }).getAttribute("aria-pressed"), "true");
    assert.equal(await hero.getByRole("button", { name: "Detailed", exact: true }).getAttribute("aria-pressed"), "true");
    assert.equal(await hero.getByRole("button", { name: "Summary only", exact: true }).isDisabled(), true);
    await selectPreference(page, "Daily life");
    await selectPreference(page, "Stretch");
    await selectPreference(page, "Light");
    await hero.getByRole("button", { name: "Done", exact: true }).click();
    await page.locator("summary").filter({ hasText: /^Choose a scene myself/ }).click();
    await page.getByRole("button", { name: "I will choose", exact: true }).click();
    await saved(page, 5);
    await page.getByRole("textbox", { name: "Custom scene", exact: true }).fill("Compare plans for the weekend with a friend.");
    await saved(page, 5);
    assert.equal((await draft(page)).customScene, "Compare plans for the weekend with a friend.");
    assert.equal((await draft(page)).sceneMode, "custom");
    assert.equal((await draft(page)).difficulty, "challenging");
    const historySummary = page.locator("summary").filter({ hasText: /^Practice history/ });
    await historySummary.click();
    await page.getByRole("button", { name: "Check practice history", exact: true }).click();
    await page.getByText("Some targets do not yet meet the independent-use practice rule.", { exact: true }).waitFor();
    assert.equal(state.historyRequests[0].targets.length, 5);
    assert.ok(state.historyRequests[0].targets.every(target => target.role === "primary"));
    await checkLayout(page, `manual-preferences-${width}`);

    const manualDraft = await draft(page);
    const expectedManualIds = manualDraft.selectedKeys.map(key => state.cloud.get(loadoutOwner).get(key).id);
    await page.getByRole("button", { name: "Start with 5 targets", exact: true }).click();
    await ready(page);
    assert.equal(state.creates.length, 1);
    assert.deepEqual(state.creates[0].input.corpus_item_ids, expectedManualIds, "manual Start preserves all five selected targets and their order");
    assert.equal(state.creates[0].input.logic_template_id, manualDraft.logicTemplateId, "manual Start uses the persisted sidebar logic");
    assert.equal(state.planRequests.length, 1);
    assert.equal(state.planRequests[0].input.targets.length, 5);
    assert.ok(state.planRequests[0].input.targets.every(target => target.role === "primary"));
    if (width < 720) await page.getByRole("button", { name: "Show practice steps", exact: true }).click();
    await page.getByRole("link", { name: "Loadout", exact: true }).click();
    const plansBeforeFree = state.planRequests.length;
    await page.getByRole("button", { name: "Free conversation, no targets", exact: true }).click();
    await saved(page, 0);
    await preview.getByRole("heading", { name: "Free conversation", exact: true }).waitFor();
    assert.equal(state.creates.length, 1, "Free conversation first opens a target-free preview");
    assert.equal((await draft(page)).logicTemplateId, null);
    await preview.getByRole("button", { name: "Start free conversation", exact: true }).click();
    await ready(page);
    assert.equal(state.creates.length, 2);
    assert.deepEqual(state.creates[1].input.corpus_item_ids, []);
    assert.equal(state.creates[1].input.logic_template_id, null);
    assert.equal(state.creates[1].input.plan_id, undefined);
    assert.equal(state.planRequests.length, plansBeforeFree, "free conversation adds no target plan after a manual Mission");
    assert.equal(state.creates[1].input.scenario_type, "everyday");
    assert.equal(state.creates[1].input.difficulty, "challenging");
    assert.equal(state.creates[1].input.feedback_level, "light");
    assert.equal((await draft(page)).submission, undefined);
    assert.deepEqual(state.errors, []);
    console.log(`PASS ${width}px: shared corpus drawer, search/filter, five targets, shuffle preservation, preferences/history and free conversation.`);
  } catch (error) {
    await page.screenshot({ path: join(artifacts, `failure-manual-${width}.png`), fullPage: true }).catch(() => {});
    throw error;
  } finally { await context.close(); }
}

async function heroReplacesManualTargets() {
  const { page, context, state } = await fixture(1440);
  try {
    const hero = page.getByRole("region", { name: "Quick start", exact: true });
    await selectFromDrawer(page, records[8]);
    const picks = await hero.locator("li strong").allTextContents();
    assert.equal(picks.length, 3);
    assert.ok(!picks.includes(records[8].item.text), "the manual selection differs from the hero recommendations");
    await hero.getByRole("button", { name: "Quick start", exact: true }).click();
    await ready(page);
    assert.equal(state.creates.length, 1);
    assert.equal(state.planRequests.length, 1);
    assert.equal(state.planRequests[0].input.targets.length, 3);
    assert.ok(state.planRequests[0].input.targets.every(target => target.role === "primary"));
    const cloud = [...state.cloud.get(loadoutOwner).values()];
    assert.deepEqual(state.creates[0].input.corpus_item_ids.map(id => cloud.find(record => record.id === id).text), picks,
      "explicit hero Start replaces manual selections with exactly its displayed recommendations");
    assert.deepEqual((await draft(page)).selectedKeys, picks.map(text => records.find(record => record.item.text === text).key));
    assert.deepEqual(state.errors, []);
    console.log("PASS hero override: one manual selection is replaced by exactly the three displayed recommendations.");
  } finally { await context.close(); }
}

try {
  for (const width of widths) {
    await defaultStartAndRetry(width);
    await manualDrawerAndFree(width);
  }
  await heroReplacesManualTargets();
  const { page, context, state } = await fixture(390, []);
  try {
    await page.getByText("No saved targets yet", { exact: true }).waitFor();
    assert.equal(await page.getByRole("region", { name: "Quick start", exact: true }).getByRole("button", { name: "Quick start", exact: true }).isDisabled(), true);
    await checkLayout(page, "empty-corpus-390");
    await page.getByRole("button", { name: "Free conversation, no targets", exact: true }).click();
    await saved(page, 0);
    assert.equal(state.creates.length, 0, "choosing Free does not create a Mission before confirmation");
    await page.getByRole("button", { name: "Start free conversation", exact: true }).click();
    await ready(page);
    assert.deepEqual(state.creates[0].input.corpus_item_ids, []);
    assert.equal(state.planRequests?.length ?? 0, 0);
    assert.deepEqual(state.errors, []);
    console.log("PASS empty corpus: truthful empty state and free conversation remain available.");
  } finally { await context.close(); }
  console.log(`Screenshots: ${artifacts}`);
} finally { await browser.close(); }
