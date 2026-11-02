import assert from "node:assert/strict";
import test from "node:test";
import { addCorpusToDraft, sceneLogicSignature, acknowledgeSubmission, draftOrigin, draftSignature, emptyDraft, explicitLogicId, replanLoadout, quickStartDraft, missionSelectionError, draftSceneMode, planningRequest, toggleMissionSelection, adjustSceneTarget, saveDraft, openDraft, prepareFreeSubmission } from "../features/loadout/draft.ts";
import { recommendQuickStart, mapTargetStages, rankCorpus, usageReason, isRecentVideo, corpusFunctions, loadoutEligible } from "../features/loadout/quick-start.ts";
import { createSpeakingApi } from "../features/loadout/api/speaking-api.ts";

const status = { id: "status_update", title: "Status update", description: "Report progress", steps: ["Done", "Blockers", "Next", "Ask"] };
const pitch = { id: "persuasive_pitch", title: "Pitch", description: "Make a case", steps: ["Context", "Tension", "Proposal", "Defend"] };
const daily = [
  { id: "telling_story", title: "Story", description: "Share a story", steps: ["Setting", "Complication", "Outcome", "Reflection"] },
  { id: "making_plans", title: "Plans", description: "Make plans", steps: ["Suggest", "Check", "Adjust", "Confirm"] },
  { id: "catching_up", title: "Catch up", description: "Chat", steps: ["Open", "Share", "Relate", "Follow up"] },
];
const metadata = {
  status_update: { family: "workplace", stage_functions: ["inform", "inform", "inform", "ask"], version: 1 },
  persuasive_pitch: { family: "workplace", stage_functions: ["open", "inform", "ask", "stance"], version: 1 },
  telling_story: { family: "daily", stage_functions: ["open", "inform", "inform", "stance"], version: 1 },
  making_plans: { family: "daily", stage_functions: ["ask", "clarify", "align", "ask"], version: 1 },
  catching_up: { family: "daily", stage_functions: ["social", "inform", "social", "ask"], version: 1 },
};
const options = { logic_templates: [status, pitch, ...daily], logic_metadata: metadata };
const row = (key, tags = ["justifying"], extra = {}) => ({ key, serverId: key, item: { id: key, kind: "chunk", text: key, tags, meta: "Saved" }, sourceUrl: "", sourceTitle: "Corpus", ...extra });
const records = [row("a"), row("b"), row("c"), row("ask", ["proposing"]), row("open", ["framing"]), row("stance", ["emphasising"])];
const quick = (draft, extra = {}) => recommendQuickStart(records, options.logic_templates, draft.scenarioType, draft.shuffleSeed ?? 0, explicitLogicId(draft), { metadata, ...extra });
const storage = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; };

test("new defaults are Guided/Detailed and an initial quick preview is the exact planning payload", () => {
  const draft = emptyDraft();
  assert.equal(draft.difficulty, "guided"); assert.equal(draft.feedbackLevel, "detailed");
  const recommendation = quick(draft);
  const projected = replanLoadout(draft, recommendation, records, options);
  const payload = planningRequest(projected, records, recommendation.logic, 1);
  assert.equal(payload.brief, recommendation.scene);
  assert.deepEqual(payload.targets.map(target => target.stage_index), recommendation.picks.map(pick => pick.stageIndex));
  assert.deepEqual(projected.pinnedKeys, []);
});

test("first manual click pins only that choice; shuffle cannot replace manual targets or lock Hero logic", () => {
  const suggested = replanLoadout(emptyDraft(), quick(emptyDraft()), records, options);
  let manual = toggleMissionSelection(suggested, records[5]);
  assert.deepEqual(manual.selectedKeys, ["stance"]);
  assert.deepEqual(manual.pinnedKeys, ["stance"]);
  assert.equal(explicitLogicId(manual), null);
  manual = { ...manual, shuffleSeed: 2 };
  const projected = replanLoadout(manual, quick(manual), records, options);
  assert.deepEqual(projected.selectedKeys, ["stance"]);
  assert.equal(projected.logicTemplateId, suggested.logicTemplateId);
  assert.equal(draftOrigin(projected), "manual");
  const replaced = replanLoadout({ ...manual, origin: "quick", pinnedKeys: [] }, quick(manual), records, options);
  assert.equal(replaced.origin, "quick"); assert.equal(replaced.selectedKeys.length, 3);
});

test("logic changes update the shown scene and submission together; custom text survives shuffle and family changes", () => {
  const first = { ...emptyDraft(), origin: "manual", pinnedKeys: ["a"], selectedKeys: ["a"], logicTemplateId: status.id, logicSource: "manual", goal: "An old generated seed" };
  const changed = { ...first, logicTemplateId: pitch.id };
  const projected = replanLoadout(changed, quick(changed), records, options);
  assert.notEqual(projected.goal, first.goal);
  assert.equal(planningRequest(projected, records, pitch, 1).brief, projected.goal);
  const custom = { ...changed, sceneMode: "custom", customScene: "Find a lost bag at the station.", scenarioType: "travel", shuffleSeed: 3 };
  const next = replanLoadout(custom, quick(custom), records, options);
  assert.equal(next.goal, custom.customScene); assert.equal(next.logicTemplateId, pitch.id);
});

test("repeated function stages get distinct targets in both quick and manual mappings", () => {
  const mapping = mapTargetStages(records.slice(0, 3), status, metadata);
  assert.deepEqual(Object.values(mapping), [0, 1, 2]);
  const recommendation = recommendQuickStart(records, [status], "workplace", 0, null, { metadata });
  assert.deepEqual(recommendation.picks.map(pick => pick.stageIndex), [0, 1, 2]);
});

test("Travel uses the daily family and every daily logic has three distinct suitable local scenes", () => {
  for (const logic of daily) {
    const scenes = [0, 1, 2].map(seed => recommendQuickStart(records, options.logic_templates, "travel", seed, logic.id, { metadata }).scene);
    assert.equal(new Set(scenes).size, 3);
  }
  assert.ok(daily.some(logic => logic.id === recommendQuickStart(records, options.logic_templates, "travel", 0, null, { metadata }).logic.id));
  assert.equal(recommendQuickStart(records, options.logic_templates, "travel", 0, pitch.id, { metadata }).logic.id, pitch.id);
});

test("review ranking uses complete recorded usage, unknown stays unknown and recent means a real video within 30 days", () => {
  const now = Date.parse("2026-10-26T00:00:00Z");
  const entries = [row("unknown"), row("due"), row("never"), row("video", [], { sourceUrl: "https://www.youtube.com/watch?v=video", createdAt: "2026-10-24T00:00:00Z" }), row("article", [], { sourceUrl: "https://example.com/story", createdAt: "2026-10-25T00:00:00Z" })];
  const usage = new Map([["unknown", { usage: { state: "unknown", due: null }, practice: { qualifying_missions: 0 } }], ["never", { usage: { state: "never", due: false } }], ["due", { usage: { state: "used", due: true } }]]);
  const context = { usage, now };
  assert.deepEqual(rankCorpus(entries, context).slice(0, 3).map(record => record.key), ["never", "due", "video"]);
  assert.equal(usageReason(entries[0], context), null);
  assert.equal(isRecentVideo(entries[3], now), true); assert.equal(isRecentVideo(entries[4], now), false);
  assert.equal(isRecentVideo({ ...entries[3], createdAt: "2026-01-01T00:00:00Z" }, now), false);
});

test("function mapping follows the design and only explicit ineligibility removes records", () => {
  assert.deepEqual(corpusFunctions(row("sum", ["summarizing", "transitioning"])), ["open"]);
  assert.deepEqual(corpusFunctions(row("stress", ["emphasising"])), ["stance"]);
  assert.equal(loadoutEligible(row("unknown", [])), true);
  assert.equal(loadoutEligible(row("vocab", ["vocabulary"])), false);
  assert.equal(loadoutEligible(row("excluded", [], { item: { ...row("excluded").item, loadoutEligible: false } })), false);
});

test("removing a failed-fit target clears its pin and survives storage and replanning", async () => {
  const current = { ...emptyDraft(), origin: "manual", pinnedKeys: ["a", "b"], selectedKeys: ["a", "b"], logicTemplateId: status.id, targetRoles: { a: "primary", b: "primary" }, targetStages: { a: 0, b: 1 } };
  const adjusted = adjustSceneTarget(current, "a", "remove");
  assert.deepEqual(adjusted.pinnedKeys, ["b"]); assert.equal(adjusted.targetStages, undefined);
  const store = storage(); await saveDraft(store, "owner", adjusted);
  const restored = (await openDraft(store, "owner")).draft;
  assert.deepEqual(replanLoadout(restored, quick(restored), records, options).selectedKeys, ["b"]);
});

test("free preview remains unsubmitted and immutable pending requests bypass all replanning", () => {
  const free = replanLoadout({ ...emptyDraft(), freeConversation: true }, quick(emptyDraft()), records, options);
  assert.deepEqual(free.selectedKeys, []); assert.equal(free.logicTemplateId, null); assert.equal(free.submission, undefined);
  const pending = prepareFreeSubmission(free, () => "11111111-2222-4333-8444-555555555555");
  assert.equal(replanLoadout(pending, quick(emptyDraft()), [], options), pending);
  assert.equal(draftSignature({ ...pending, lastLogicId: status.id }), pending.submission.signature);
});

test("usage and scene API methods verify identities and do not infer history from practice counts", async () => {
  const savedFetch = globalThis.fetch;
  const api = createSpeakingApi("owner", async () => `e30.${btoa(JSON.stringify({ sub: "owner" }))}.sig`);
  const signal = new AbortController().signal;
  const item = { corpus_item_id: "a", usage: { state: "unknown", all_use_count: null, last_used_at: null, due_at: null, due: null, unknown_reasons: ["legacy_report"] }, practice: { qualifying_missions: 0, practice_days: 0, scene_roots: 0, eligible: false, history_truncated: false } };
  const response = { as_of: "2026-10-26T00:00:00Z", review_rule: { id: "recorded-use-7d-v1", interval_days: 7 }, items: [item] };
  try {
    globalThis.fetch = async (_url, init) => { assert.deepEqual(JSON.parse(init.body), { corpus_item_ids: ["a"] }); return Response.json(response); };
    assert.equal((await api.loadoutUsage(["a"], signal)).items[0].usage.state, "unknown");
    globalThis.fetch = async () => Response.json({ ...response, items: [{ ...item, corpus_item_id: "other" }] });
    await assert.rejects(api.loadoutUsage(["a"], signal), /could not be verified/);
    const payload = { scenario_type: "travel", brief: "Find a bus", corpus_item_ids: ["a"] };
    globalThis.fetch = async (_url, init) => { assert.deepEqual(JSON.parse(init.body), payload); return Response.json({ logic_template_id: "making_plans", reason: "Agree on transport." }); };
    assert.equal((await api.sceneLogic(payload, signal)).logic_template_id, "making_plans");
    globalThis.fetch = async () => Response.json({ logic_template_id: "invented", reason: "Unknown" });
    await assert.rejects(api.sceneLogic(payload, signal), /could not be verified/);
  } finally { globalThis.fetch = savedFetch; }
});


test("explicit Corpus Library add pins those targets and enforces one five-target pool", async () => {
  const store = storage();
  const suggested = replanLoadout(emptyDraft(), quick(emptyDraft()), records, options);
  await saveDraft(store, "owner", suggested);
  const added = await addCorpusToDraft(store, "owner", ["stance"], records);
  assert.deepEqual(added.pinnedKeys, ["stance"]);
  assert.deepEqual(replanLoadout(added, quick(added), records, options).selectedKeys, ["stance"]);
  await addCorpusToDraft(store, "owner", ["a", "b", "c", "open"], records);
  await assert.rejects(addCorpusToDraft(store, "owner", ["ask"], records), /5 targets/);
});

test("scene inference identity changes when the same corpus ID is edited, and when targets or owner change", () => {
  const draft = { ...emptyDraft(), sceneMode: "custom", customScene: "Plan a trip" };
  const key = sceneLogicSignature("owner", draft, records, ["a"]);
  const edited = records.map(record => record.key === "a" ? { ...record, item: { ...record.item, text: "New wording" } } : record);
  assert.notEqual(sceneLogicSignature("owner", draft, edited, ["a"]), key);
  assert.notEqual(sceneLogicSignature("owner", draft, records, ["b"]), key);
  assert.notEqual(sceneLogicSignature("other", draft, records, ["a"]), key);
});

test("last confirmed logic is recorded inside acknowledgement without altering immutable request identity", () => {
  const draft = { ...emptyDraft(), logicTemplateId: status.id, selectedKeys: ["a"] };
  const pending = { ...draft, submission: { signature: draftSignature(draft), request: { client_id: "request" } } };
  const confirmed = acknowledgeSubmission(pending, "request");
  assert.equal(confirmed.lastLogicId, status.id); assert.equal(confirmed.submission, undefined);
  assert.equal(pending.lastLogicId, undefined); assert.equal(pending.submission.signature, draftSignature(pending));
});

test("old unlinked plans reproject for v2 while linked and pending setups remain untouched", () => {
  const legacy = { scenarioType: "workplace", goal: "An existing scene", difficulty: "standard", feedbackLevel: "balanced", selectedKeys: ["a"], logicTemplateId: status.id,
    plan: { signature: "old-input", value: { version: 1, id: "old-plan" } } };
  const replanned = replanLoadout(legacy, quick(legacy), records, options);
  assert.notEqual(replanned, legacy);
  assert.equal(replanned.feedbackLevel, "balanced");
  assert.deepEqual(replanned.targetStages, { a: 0 });
  const linked = { ...legacy, plan: { ...legacy.plan, value: { ...legacy.plan.value, practice_source: { parent_session_id: "parent" } } } };
  assert.equal(replanLoadout(linked, quick(legacy), records, options), linked);
});


test("Hero quick start uses its shown AI scene even when the saved manual scene is empty", () => {
  const draft = { ...emptyDraft(), origin: "manual", sceneMode: "custom", customScene: "", selectedKeys: [], pinnedKeys: [], logicTemplateId: status.id };
  const before = structuredClone(draft);
  const recommendation = quick(draft);
  const next = quickStartDraft(draft, recommendation, records, options);
  assert.equal(missionSelectionError(next, records, true), null);
  assert.equal(draftSceneMode(next), "ai");
  assert.equal(next.goal, recommendation.scene);
  assert.equal(next.logicTemplateId, recommendation.logic.id);
  assert.deepEqual(next.selectedKeys, recommendation.picks.map(pick => pick.record.key));
  assert.deepEqual(planningRequest(next, records, recommendation.logic, 1).targets.map(target => target.corpus_item_id), recommendation.picks.map(pick => pick.record.serverId));
  assert.deepEqual(draft, before, "rendering a Hero preview does not overwrite the manual draft");
});

test("Hero quick start leaves frozen retry and linked drafts untouched", () => {
  const draft = { ...emptyDraft(), sceneMode: "custom", customScene: "An unfinished scene" };
  const pending = { ...draft, submission: { signature: "frozen", request: { client_id: "existing" } } };
  const linked = { ...draft, plan: { signature: "frozen", value: { practice_source: { parent_session_id: "parent" } } } };
  assert.equal(quickStartDraft(pending, quick(draft), records, options), pending);
  assert.equal(quickStartDraft(linked, quick(draft), records, options), linked);
});
