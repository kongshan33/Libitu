import assert from "node:assert/strict";
import test from "node:test";
import { acknowledgeSubmission, emptyDraft, missionSelectionError, openDraft, prepareFreeSubmission, saveDraft } from "../features/loadout/draft.ts";

const uuid = "11111111-2222-4333-8444-555555555555";
const freeDraft = () => ({ ...emptyDraft(), freeConversation: true, goal: "Talk about your day" });

test("free conversation freezes an empty target request and replays it exactly", () => {
  const draft = freeDraft();
  assert.equal(missionSelectionError(draft, [], true), null);
  const prepared = prepareFreeSubmission(draft, () => uuid);
  assert.deepEqual(prepared.submission.request.corpus_item_ids, []);
  assert.equal(prepared.submission.request.logic_template_id, null);
  assert.equal(prepared.submission.request.plan_id, undefined);
  assert.equal(prepareFreeSubmission(prepared, () => assert.fail("must reuse ID")), prepared);
  const confirmed = acknowledgeSubmission(prepared, uuid);
  assert.equal(confirmed.submission, undefined);
  assert.equal(confirmed.freeConversation, true);
});

test("free conversation draft survives account storage and refuses target or logic mix", async () => {
  const entries = new Map();
  const storage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
  const prepared = prepareFreeSubmission(freeDraft(), () => uuid);
  await saveDraft(storage, "test-owner", prepared);
  const restored = await openDraft(storage, "test-owner");
  assert.deepEqual(restored.draft.submission, prepared.submission);
  assert.throws(() => prepareFreeSubmission({ ...freeDraft(), selectedKeys: ["unexpected"] }, () => uuid), /cannot contain/);
  assert.throws(() => prepareFreeSubmission({ ...freeDraft(), logicTemplateId: "status_update" }, () => uuid), /cannot contain/);
});
