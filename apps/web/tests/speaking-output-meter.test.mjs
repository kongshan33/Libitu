import test from "node:test";
import assert from "node:assert/strict";
import { ConversationAudio } from "../features/speaking/audio.ts";

test("output meter follows rendered playback, excludes queued audio, and clears on interruption/disposal", async () => {
  const original = globalThis.AudioContext;
  const contexts = [];
  let amplitude = 0;
  class Context {
    state = "running"; currentTime = 0; destination = {}; nodes = [];
    constructor() { contexts.push(this); }
    async resume() {}
    async close() { this.state = "closed"; }
    createAnalyser() { return { connect() {}, disconnect() {}, getFloatTimeDomainData(values) { values.fill(amplitude); } }; }
    createBuffer(_channels, length, rate) { return { duration: length / rate, copyToChannel() {} }; }
    createBufferSource() { const node = { connect() {}, disconnect() {}, start() {}, stop() {}, onended: null }; this.nodes.push(node); return node; }
  }
  globalThis.AudioContext = Context;
  const audio = new ConversationAudio(() => {}, () => {}, () => {});
  try {
    assert.equal(audio.getOutputLevel(), 0);
    await audio.prepare();
    const context = contexts[0];
    audio.append("response", Buffer.alloc(4800).toString("base64"));
    amplitude = .2;
    assert.equal(audio.getOutputLevel(), 0, "queued audio is not yet audible");
    context.currentTime = .04;
    assert.ok(Math.abs(audio.getOutputLevel() - .8) < .001);
    amplitude = 0;
    assert.equal(audio.getOutputLevel(), 0, "silence within playback has no energy");
    amplitude = 1;
    assert.equal(audio.getOutputLevel(), 1, "normalizes to a bounded envelope");
    context.state = "suspended";
    assert.equal(audio.getOutputLevel(), 0);
    context.state = "running";
    audio.clear();
    assert.equal(audio.getOutputLevel(), 0, "interrupted analyser tail cannot animate the orb");
    audio.append("next", Buffer.alloc(4800).toString("base64"));
    context.currentTime = .08;
    context.nodes.at(-1).onended();
    assert.equal(audio.getOutputLevel(), 0, "ended playback is quiet");
    audio.dispose();
    assert.equal(audio.getOutputLevel(), 0);
  } finally { audio.dispose(); globalThis.AudioContext = original; }
});
