import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { installLoadoutFixture, fixtureContentId, shadowBlueprint, loadoutOwner } from "./helpers/loadout-fixture.mjs";

const { chromium } = createRequire(import.meta.url)(process.env.LIBITU_PLAYWRIGHT_MODULE ?? "playwright");
const origin = process.env.LIBITU_TEST_URL ?? "http://localhost:3001";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const cleanups = new Set();
try {
  for (const width of [1512, 1192, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1506 } });
    const page = await context.newPage();
    const state = await installLoadoutFixture(page, { origin, shadow: true, initialOwner: loadoutOwner });
    const reader = `${origin}/practice/${fixtureContentId}`;
    let release;
    const routeGate = new Promise(resolve => { release = resolve; });
    const cleanup = async () => { release(); await context.unrouteAll({ behavior: "ignoreErrors" }); };
    cleanups.add(cleanup);
    const prefetches = [];
    page.on("request", request => {
      if (request.headers().rsc === "1") prefetches.push(new URL(request.url()));
    });
    await page.route(`**/practice/${fixtureContentId}/**`, async route => {
      if (route.request().headers().rsc === "1") await routeGate;
      await route.continue();
    });
    const pickerPrefetch = page.waitForRequest(request => new URL(request.url()).pathname === `/practice/${fixtureContentId}/segments` && request.headers().rsc === "1");
    await page.goto(reader);
    const choose = page.getByRole("button", { name: "Choose a segment to shadow", exact: true });
    await choose.waitFor();
    await page.waitForFunction(() => document.querySelector(".youtube-player iframe"));
    const frame = await page.locator(".youtube-player iframe").elementHandle();
    const publicReads = () => state.requests.filter(request => /^\/api\/(?:content|jobs|blueprints)/.test(request.path)).length;
    const initialReads = publicReads();
    async function assertFixedFooter(selector) {
      if (width < 1041) return;
      const footer = page.locator(selector), before = await footer.boundingBox();
      assert.equal(await page.evaluate(() => document.documentElement.scrollHeight), 1506, "workspace fits below the global header");
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      assert.deepEqual(await footer.boundingBox(), before, "document scrolling cannot shift or resize the CTA");
      assert.ok(Math.abs(before.y + before.height - 1506) < 1);
    }
    await assertFixedFooter(".stage-one-cta");
    await choose.focus();
    await pickerPrefetch;
    assert.ok(prefetches.some(url => url.pathname === `/practice/${fixtureContentId}/segments`), "next workspace step is prefetched before clicking");
    await choose.click();
    await page.locator(".stage-one-segment-card").first().waitFor({ timeout: 1500 });
    assert.equal(await choose.isVisible(), false, "picker opens while its RSC response is still blocked");
    assert.equal(await page.locator("[data-practice-skeleton]").count(), 0, "ready content is never replaced with a route skeleton");
    assert.equal(publicReads(), initialReads, "prefetch/navigation do not reactivate content processing");
    await assertFixedFooter(".stage-one-picker-footer");
    assert.equal(new URL(page.url()).pathname, `/practice/${fixtureContentId}/segments`);
    assert.equal(await frame.evaluate(node => node.isConnected), true);
    await page.locator(".stage-one-segment-card").first().click();
    assert.equal(await page.locator(".stage-two-shadow").count(), 0, "prefetch from picker does not mount practice");
    const begin = page.getByRole("button", { name: /Begin Stage 2/ });
    await begin.focus();
    await begin.click();
    await page.locator(".stage-two-shadow").waitFor({ timeout: 5000 });
    assert.ok(prefetches.some(url => url.pathname.endsWith("/shadow") && url.searchParams.get("sentenceId") === "sentence-v2-loadout"), "picker warms the exact Shadow route");
    assert.equal(await page.evaluate(() => window.__loadoutMicrophoneTracks.length), 0);
    assert.equal(publicReads(), initialReads, "view changes reuse the public blueprint");
    const shadowHref = page.url();
    await page.goBack();
    await page.locator(".stage-one-picker").waitFor();
    assert.equal(await page.locator('.stage-one-segment-card[aria-pressed="true"]').count(), 1);
    await page.goBack();
    await choose.waitFor();
    await page.goForward();
    await page.locator(".stage-one-picker").waitFor();
    await page.goForward();
    await page.locator(".stage-two-shadow").waitFor();
    assert.equal(page.url(), shadowHref);
    assert.equal(await frame.evaluate(node => node.isConnected), true, "history keeps the media host alive");
    release();
    const mission = page.getByRole("link", { name: "Mission", exact: true });
    const missionHref = await mission.getAttribute("href");
    const matchesMission = url => url.pathname === "/loadout" && url.searchParams.get("returnTo") === new URL(missionHref, origin).searchParams.get("returnTo");
    const missionPrefetch = prefetches.some(matchesMission) ? Promise.resolve() : page.waitForRequest(request => request.headers().rsc === "1" && matchesMission(new URL(request.url())));
    await mission.focus();
    await missionPrefetch;
    assert.ok(prefetches.some(matchesMission), "keyboard intent prefetches the exact Mission return address");
    assert.equal(state.requests.filter(request => request.method === "POST" && request.path === "/api/speaking/sessions").length, 0);
    await page.getByRole("link", { name: "Corpus", exact: true }).click();
    await page.getByRole("heading", { name: "Corpus library", exact: true }).waitFor();
    await page.goBack();
    await page.locator(".stage-two-shadow").waitFor();
    assert.equal(page.url(), shadowHref);
    await page.reload();
    await page.locator(".stage-two-shadow").waitFor();
    assert.equal(page.url(), shadowHref, "refresh resolves the same canonical route");
    assert.deepEqual(state.errors, []);
    await context.unrouteAll({ behavior: "ignoreErrors" });
    cleanups.delete(cleanup);
    await context.close();

    // Form intent may warm the import shell, but cannot run caption resolution.
    const landing = await browser.newContext();
    const entry = await landing.newPage();
    const entryState = await installLoadoutFixture(entry, { origin });
    const importPrefetch = entry.waitForRequest(request => new URL(request.url()).pathname === "/practice/import" && request.headers().rsc === "1");
    await entry.goto(origin);
    await entry.getByPlaceholder("Paste a YouTube video link…").fill(shadowBlueprint.source_url);
    await entry.getByRole("button", { name: "Analyze video", exact: true }).hover();
    await importPrefetch;
    assert.equal(entryState.requests.some(request => request.path === "/api/content/resolve"), false, "hover never resolves/imports a video");
    assert.equal(new URL(entry.url()).pathname, "/");
    await landing.close();
    console.log(`Intent/next-step prefetch, warm navigation, stable media and no eager mutations passed at ${width}px`);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally { for (const cleanup of cleanups) await cleanup(); await browser.close(); }
