import assert from "node:assert/strict";
import test from "node:test";
import { validChangedSpans, validRecastReference, validRecasts } from "../features/speaking/recasts.ts";
const original = "We product high-end chips.";
const replacement = "We produce high-end chips.";
const messages = [{ id: "u", role: "user", text: original, status: "final", revision: 1 }, { id: "a", role: "assistant", text: replacement, status: "final", revision: 1 }];
const recast = { id: "recast", version: 1, status: "ready", source: { message_id: "u", revision: 1, start: 0, end: original.length, quote: original }, replacement, edits: [{ start: 3, end: 10, before: "product", after: "produce" }], changed_spans: [{ start: 3, end: 10, quote: "produce" }], delivery: { message_id: "a", revision: 1, start: 0, end: replacement.length, quote: replacement } };
test("recasts require current exact source and actual partner delivery without rewriting the transcript", () => {
  assert.equal(validRecasts([recast], messages).length, 1);
  assert.equal(messages[0].text, original);
  assert.deepEqual(validRecasts([{ ...recast, delivery: null }], messages), []);
  assert.deepEqual(validRecasts([recast], [{ ...messages[0], revision: 2 }, messages[1]]), []);
  assert.deepEqual(validRecasts([recast], [messages[0], { ...messages[1], status: "interrupted" }]), []);
  assert.deepEqual(validRecasts([{ ...recast, replacement: "A different claim." }], messages), []);
});
test("highlight validation rejects wrong words, overlap, split surrogates and accepts deletion-only emphasis", () => {
  assert.equal(validChangedSpans(replacement, [{ start: 3, end: 10, quote: "produce" }]), true);
  assert.equal(validChangedSpans(replacement, [{ start: 3, end: 10, quote: "product" }]), false);
  assert.equal(validChangedSpans("😀 produce", [{ start: 1, end: 2, quote: "\ude00" }]), false);
  assert.equal(validChangedSpans(replacement, []), true);
  assert.equal(validRecastReference(recast.source, messages, "assistant"), false);
});
