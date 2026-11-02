import assert from "node:assert/strict";
import test from "node:test";
import { betterLogicForTargets, recommendQuickStart, targetStageIndex } from "../features/loadout/quick-start.ts";
import { emptyDraft, missionInputSignature, planningRequest, validPlan, preparePlannedSubmission, draftSignature, openDraft, saveDraft } from "../features/loadout/draft.ts";
import { createSpeakingApi } from "../features/loadout/api/speaking-api.ts";
import { stagedTargetStatus } from "../features/speaking/staged-targets.ts";

const logic = { id: "persuasive_pitch", title: "Pitch", description: "Make a case", steps: ["Context", "Proposal"] };
const alternative = { id: "disagreement", title: "Disagreement", description: "Discuss alternatives", steps: ["Acknowledge", "Propose"] };
const records = ["framing", "framing", "proposing"].map((tag, i) => ({ key: `key-${i}`, serverId: `corpus-${i}`, item: { id: `item-${i}`, kind: "chunk", text: `target ${i}`, tags: [tag], meta: "Saved" } }));
function fixture() {
  const draft = { ...emptyDraft(), selectedKeys: records.map(r => r.key), targetRoles: Object.fromEntries(records.map(r => [r.key, "primary"])), logicTemplateId: logic.id };
  const request = planningRequest(draft, records, logic, 1);
  const plan = { id: "plan", version: 2, scenario_type: draft.scenarioType, brief: "", created_at: "2026-10-26T00:00:00Z", logic_template: logic, candidates: [{
    id: "scene", title: "Discuss a change", setting: "A project meeting", goal: "Agree a change", user_role: "Lead", ai_role: "Colleague", register: "professional",
    targets: request.targets.map(target => ({ ...target, communicative_function: "Frame a proposal", fit: "high", fit_reason: "Fits the discussion", trigger_question: "What would you change?", skip_when: "The discussion has ended", metadata_status: "available", model_line: `I would say ${target.corpus_item_id}.` })),
  }] };
  return { draft: { ...draft, plan: { value: plan, signature: missionInputSignature(draft, records, logic) }, selectedCandidateId: "scene" }, request, plan };
}

test("planning uses the same stages as recommendations, including Any stage fill", () => {
  const quick = recommendQuickStart(records, [logic], "workplace", 0);
  const draft = { ...emptyDraft(), logicTemplateId: logic.id, selectedKeys: quick.picks.map(p => p.record.key), targetStages: Object.fromEntries(quick.picks.map(p => [p.record.key, p.stageIndex])) };
  const request = planningRequest(draft, records, logic, 1);
  assert.equal(request.logic_template_id, logic.id);
  assert.deepEqual(request.targets.map(t => t.stage_index), [0, 1, null]);
  assert.equal(targetStageIndex(records[0], logic), 0);
  assert.ok(request.targets.every(t => t.role === "primary"));
  assert.throws(() => planningRequest(draft, [], logic, 1), /syncing/);
});

test("logic advice covers selected targets and never changes a selection or a tied choice", () => {
  const chosen = [records[0], { ...records[1], item: { ...records[1].item, tags: ["acknowledging"] } }];
  const before = structuredClone(chosen);
  const broad = { ...alternative, steps: ["Context", "Acknowledge"] };
  assert.deepEqual(betterLogicForTargets(chosen, [logic, broad], logic), { logic: broad, coverage: 2, currentCoverage: 1 });
  assert.equal(betterLogicForTargets(chosen, [logic, alternative], logic), null);
  assert.deepEqual(chosen, before);
});

test("v2 plan requires its frozen structure and complete bounded target assignments", () => {
  const { plan } = fixture();
  assert.equal(validPlan(plan), true);
  for (const mutate of [p => delete p.logic_template, p => delete p.candidates[0].targets[0].stage_index,
    p => p.candidates[0].targets[0].stage_index = 2, p => p.candidates[0].targets[0].stage_index = -1,
    p => delete p.candidates[0].targets[0].model_line, p => p.candidates[0].targets[0].model_line = " ",
    p => p.candidates[0].targets[0].role = "opportunity"]) {
    const invalid = structuredClone(plan); mutate(invalid); assert.equal(validPlan(invalid), false);
  }
});

test("a frozen v2 plan survives reload while logic identity, steps and stage mapping invalidate its cache", async () => {
  const { draft } = fixture();
  assert.equal(missionInputSignature(draft, records), draft.plan.signature);
  assert.notEqual(missionInputSignature({ ...draft, logicTemplateId: alternative.id }, records, alternative), draft.plan.signature);
  assert.notEqual(missionInputSignature(draft, records, { ...logic, steps: ["Context", "Defend"] }), draft.plan.signature);
  assert.notEqual(missionInputSignature({ ...draft, targetStages: { "key-0": null } }, records), draft.plan.signature);
  assert.equal(missionInputSignature({ ...draft, difficulty: "guided" }, records), draft.plan.signature);
  const prepared = preparePlannedSubmission(draft, records, () => "a0000000-0000-4000-8000-000000000001", logic);
  const values = new Map(); const storage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) };
  await saveDraft(storage, "owner", prepared);
  const restored = (await openDraft(storage, "owner")).draft;
  assert.equal(draftSignature(restored), prepared.submission.signature);
  assert.deepEqual(preparePlannedSubmission(restored, [], () => { throw Error("must replay"); }, alternative).submission, prepared.submission);
});

test("planning response cannot silently change the requested logic or target stage", async () => {
  const { plan, request } = fixture(); const originalFetch = globalThis.fetch;
  const api = createSpeakingApi("owner", async () => `header.${Buffer.from(JSON.stringify({ sub: "owner" })).toString("base64")}.signature`);
  try {
    for (const mutate of [p => p.logic_template.id = alternative.id, p => p.candidates[0].targets[0].stage_index = null, p => p.logic_template.steps.reverse()]) {
      const changed = structuredClone(plan); mutate(changed);
      globalThis.fetch = async () => new Response(JSON.stringify(changed), { status: 200 });
      await assert.rejects(api.plan(request, new AbortController().signal, logic), /did not match/);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test("stage status separates uncertain delivery, a reply without target use, and actual imitation", () => {
  const pending = { session_item_id: "item", stage_index: 0, modeling_status: "uncertain", practice_status: "responded", imitation_uses: 0 };
  assert.equal(stagedTargetStatus(pending).modeled, false);
  assert.match(stagedTargetStatus(pending).practice, /target use not observed/);
  assert.equal(stagedTargetStatus({ ...pending, modeling_status: "modeled", practice_status: "attempted", imitation_uses: 1 }).imitationUses, 1);
  assert.equal(stagedTargetStatus({ ...pending, modeling_status: "exposed" }).modeled, false);
  assert.equal(stagedTargetStatus().imitationUses, 0);
});
