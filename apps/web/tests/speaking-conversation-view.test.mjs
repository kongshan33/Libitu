import assert from "node:assert/strict";
import test from "node:test";
import { concealedTargets, stageMarkers, waitingForReply, stageCue } from "../features/speaking/conversation-view.ts";
import { speakingWorkspace } from "./helpers/speaking-fixture.mjs";

test("concealment is independent of plan version and preserves explicit legacy support", () => {
  const w = speakingWorkspace();
  for (const version of [undefined, 1, 2]) {
    w.session.mission_plan = version ? { version } : undefined;
    assert.equal(concealedTargets(w), true);
    for (const level of ["model_frame", "model_label", "label_only", "no_hint"]) {
      w.session.support_level = level;
      assert.equal(concealedTargets(w), version === 2);
      delete w.session.support_level;
      w.support = { level, version: 1 };
      assert.equal(concealedTargets(w), version === 2);
      delete w.support;
    }
  }
});

test("historical dividers require exact final sources and frozen stage names, never current-stage inference", () => {
  const w = speakingWorkspace();
  w.messages = [0, 1, 2].map(index => ({ id: `m${index}`, ordinal: index, role: "assistant", revision: 1, status: "final", text: "What changed?" }));
  w.stage_progress = { current_stage_index: 3 };
  assert.equal(stageMarkers(w).size, 0);
  const marker = (index, stage_index) => ({ source: { message_id: `m${index}`, revision: 1, start: 0, end: 13, quote: "What changed?" }, stage_index, label: w.session.logic_template.steps[stage_index] });
  w.conversation = { stage_markers: [marker(0, 0), marker(1, 0), marker(2, 1)] };
  assert.deepEqual([...stageMarkers(w).keys()], ["m0", "m2"]);
  w.messages[0].revision++;
  assert.deepEqual([...stageMarkers(w).keys()], ["m1", "m2"]);
  w.messages[1].status = "interrupted";
  w.conversation.stage_markers[2].label = "Defend";
  assert.equal(stageMarkers(w).size, 0);
});

test("silence label follows confirmed rephrase and disappears after input or stronger help", () => {
  const w = speakingWorkspace();
  w.conversation = { question: { status: "awaiting_reply", auto_rephrase: "reserved", automatic_help_closed: false }, help: null };
  assert.equal(waitingForReply(w), false);
  w.conversation.question.auto_rephrase = "completed";
  assert.equal(waitingForReply(w), true);
  w.conversation.help = { status: "ready" };
  assert.equal(waitingForReply(w), false);
  w.conversation.help.status = "retired";
  assert.equal(waitingForReply(w), true);
  w.conversation.question.automatic_help_closed = true;
  assert.equal(waitingForReply(w), false);
  assert.equal(stageCue("Tension"), "Name the risk or objection.");
  assert.equal(stageCue(undefined), undefined);
  assert.equal(stageCue("Unknown"), undefined);
});
