import assert from "node:assert/strict";
import test from "node:test";
import { recommendQuickStart, targetStage } from "../features/loadout/quick-start.ts";

const pitch = { id: "persuasive_pitch", title: "Persuasive pitch", description: "Make a case", steps: ["Context", "Tension", "Proposal", "Defend"] };
const disagreement = { id: "disagreement", title: "Disagreement", description: "Push back constructively", steps: ["Acknowledge", "Reframe", "Evidence", "Propose"] };
const troubleshoot = { id: "technical_troubleshoot", title: "Troubleshoot", description: "Solve a problem", steps: ["Symptom", "Cause", "Fix", "Confirm"] };
function record(key, tags = [], extra = {}) {
  return { key, serverId: `server-${key}`, item: { id: `item-${key}`, text: key, kind: "chunk", tags, meta: "Saved" }, sourceUrl: "", sourceTitle: "Personal corpus", ...extra };
}

test("Quick start chooses the logic with greatest saved-tag coverage and real unique targets", () => {
  const records = [record("context", ["framing"]), record("contrast", ["contrast"]), record("proposal", ["proposing"]), record("idiom", ["idiom"])];
  const result = recommendQuickStart(records, [troubleshoot, pitch], "workplace", 0);
  assert.equal(result.logic, pitch);
  assert.deepEqual(result.picks.map(({ stage }) => stage), ["Context", "Tension", "Proposal"]);
  assert.equal(new Set(result.picks.map(({ record }) => record.key)).size, 3);
  assert.ok(result.picks.every(({ record, reason }) => records.includes(record) && reason === "Fits this structure"));
});

test("each matched stage has at most one target; unmatched fill is explicitly Any stage", () => {
  const records = [record("context-a", ["framing"]), record("context-b", ["framing"]), record("unlabelled")];
  const result = recommendQuickStart(records, [pitch], "workplace", 0);
  assert.deepEqual(result.picks.map(({ stage }) => stage), ["Context", "Any stage", "Any stage"]);
  assert.ok(result.picks.slice(1).every(({ reason }) => reason === "From your corpus"));
  assert.equal(targetStage(records[2], pitch), "Any stage");
  assert.equal(targetStage(record("unknown", ["idiom"]), pitch), "Any stage");
  assert.equal(targetStage(records[0]), "Any stage");
});

test("Shuffle deterministically rotates tied logic, related scenes and stage candidates", () => {
  const records = [record("proposal-a", ["proposing"]), record("proposal-b", ["proposing"]), record("proposal-c", ["proposing"])];
  const options = [pitch, disagreement];
  const first = recommendQuickStart(records, options, "workplace", 0);
  const second = recommendQuickStart(records, options, "workplace", 1);
  const nextCycle = recommendQuickStart(records, options, "workplace", 2);
  assert.equal(first.logic, pitch);
  assert.equal(second.logic, disagreement);
  assert.notEqual(second.scene, first.scene);
  assert.equal(nextCycle.logic, pitch);
  assert.notEqual(nextCycle.scene, first.scene);
  assert.notEqual(nextCycle.picks[0].record, first.picks[0].record);
  assert.deepEqual(recommendQuickStart(records, options, "workplace", 2), nextCycle);
  assert.notEqual(recommendQuickStart(records, options, "everyday", 2).scene, nextCycle.scene);
});

test("preferred logic remains explicit while its suggestions shuffle, and unavailable preferences fall back", () => {
  const records = [record("context", ["framing"]), record("contrast", ["contrast"]), record("proposal", ["proposing"])];
  assert.equal(recommendQuickStart(records, [pitch, disagreement], "workplace", 0, "disagreement").logic, disagreement);
  assert.equal(recommendQuickStart(records, [pitch, disagreement], "workplace", 1, "disagreement").logic, disagreement);
  assert.equal(recommendQuickStart(records, [pitch], "workplace", 0, "onboarding").logic, pitch);
});

test("small, empty and untagged corpora never invent records or usage evidence", () => {
  for (const count of [0, 1, 2]) {
    const records = Array.from({ length: count }, (_, index) => record(String(index)));
    const result = recommendQuickStart(records, [pitch], "workplace", 0);
    assert.equal(result.picks.length, count);
    assert.ok(result.picks.every(({ record, stage, reason }) => records.includes(record) && stage === "Any stage" && reason === "From your corpus"));
  }
  const local = record("local", [], { serverId: undefined });
  const result = recommendQuickStart([local], [], "everyday", 0);
  assert.equal(result.logic, undefined);
  assert.equal(result.picks[0].record, local);
  assert.ok(result.scene.length > 0);
});

test("recommendations deduplicate both local keys and shared server identities", () => {
  const first = record("first");
  const duplicateServer = record("alias", [], { serverId: first.serverId });
  const third = record("third");
  const result = recommendQuickStart([first, first, duplicateServer, third], [pitch], "workplace", 0);
  assert.equal(result.picks.length, 2);
  assert.equal(new Set(result.picks.map(({ record }) => record.serverId)).size, 2);
});

test("newest saved candidates lead the initial preview without reading the clock or mutating inputs", () => {
  const records = [record("older", ["proposing"], { createdAt: "2026-01-01T00:00:00Z" }), record("newer", ["proposing"], { createdAt: "2026-02-01T00:00:00Z" }), record("unknown", ["proposing"] )];
  const before = structuredClone(records);
  const selectedKeys = [records[0].key];
  const first = recommendQuickStart(records, [pitch], "workplace", 0);
  selectedKeys.push(records[2].key);
  assert.deepEqual(recommendQuickStart(records, [pitch], "workplace", 0), first);
  assert.equal(first.picks[0].record, records[1]);
  assert.deepEqual(records, before);
  assert.deepEqual(recommendQuickStart([...records].reverse(), [pitch], "workplace", 0), first);
});

test("stage assignment follows supplied names and uses only known functional tags", () => {
  assert.equal(targetStage(record("because", ["justifying"]), troubleshoot), "Cause");
  assert.equal(targetStage(record("summary", ["summarizing"]), troubleshoot), "Confirm");
  assert.equal(targetStage(record("tradeoff", ["contrast"]), { ...pitch, steps: ["Context", "Trade-off", "Commit"] }), "Trade-off");
  assert.equal(targetStage(record("unknown", ["framing"]), { ...pitch, steps: ["Custom stage"] }), "Any stage");
});

test("invalid and negative shuffle seeds still produce bounded deterministic results", () => {
  const records = [record("first"), record("second")];
  assert.deepEqual(recommendQuickStart(records, [pitch], "workplace", NaN), recommendQuickStart(records, [pitch], "workplace", 0));
  assert.equal(recommendQuickStart(records, [pitch], "workplace", -1).picks.length, 2);
  assert.equal(recommendQuickStart(records, [pitch], "workplace", Infinity).logic, pitch);
});
