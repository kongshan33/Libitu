import test from "node:test";
import assert from "node:assert/strict";
import { ConversationAudio, visualAudioLevel } from "../features/speaking/audio.ts";
import { readOrbEnergy, smoothOrbBands, visualFrequencyBands } from "../features/speaking/orb-energy.ts";

test("quiet speech has visible dynamic range while silence and noise floor stay still", () => {
  const level = amplitude => visualAudioLevel(new Float32Array(256).fill(amplitude));
  assert.equal(level(0), 0);
  assert.equal(level(.001), 0);
  assert.ok(level(.01) > .25 && level(.01) < .35);
  assert.ok(level(.03) > .45 && level(.03) < .55);
  assert.ok(level(.06) > level(.03));
  assert.equal(level(.2), 1);
  assert.equal(level(NaN), 0);
});

test("orb hears first syllables before server VAD and interruptions during partner speech", () => {
  assert.equal(readOrbEnergy("thinking", () => 0, () => .6), .6);
  assert.equal(readOrbEnergy("speaking", () => .2, () => .7), .7);
  assert.equal(readOrbEnergy("listening", () => .5, () => 0), .5);
  assert.equal(readOrbEnergy("idle", () => 1, () => 1), 0);
  assert.equal(readOrbEnergy("connecting", () => 1, () => 1), 0);
  assert.equal(readOrbEnergy("listening", () => NaN, () => Infinity), 0);
});

test("output meter follows rendered playback, excludes queued audio, and clears on interruption/disposal", async () => {
  const original = globalThis.AudioContext;
  const contexts = [];
  let amplitude = 0;
  class Context {
    state = "running"; sampleRate = 48000; currentTime = 0; destination = {}; nodes = [];
    constructor() { contexts.push(this); }
    async resume() {}
    async close() { this.state = "closed"; }
    createAnalyser() { return { connect() {}, disconnect() {}, getFloatTimeDomainData(values) { values.fill(amplitude); }, getByteFrequencyData(values) { values.fill(amplitude ? 128 : 0); } }; }
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
    assert.equal(audio.getOutputLevel(), 1);
    assert.ok(audio.getOutputBands()[1] > 0);
    amplitude = 0;
    assert.equal(audio.getOutputLevel(), 0, "silence within playback has no energy");
    amplitude = 1;
    assert.equal(audio.getOutputLevel(), 1, "normalizes to a bounded envelope");
    context.state = "suspended";
    assert.equal(audio.getOutputLevel(), 0);
    context.state = "running";
    audio.clear();
    assert.deepEqual([...audio.getOutputBands()], [0,0,0,0]);
    assert.equal(audio.getOutputLevel(), 0, "interrupted analyser tail cannot animate the orb");
    audio.append("next", Buffer.alloc(4800).toString("base64"));
    context.currentTime = .08;
    context.nodes.at(-1).onended();
    assert.equal(audio.getOutputLevel(), 0, "ended playback is quiet");
    audio.dispose();
    assert.equal(audio.getOutputLevel(), 0);
  } finally { audio.dispose(); globalThis.AudioContext = original; }
});

test("input meter only reads an enabled microphone and releases its graph on mute or track loss", async () => {
  const originals = Object.fromEntries(["AudioContext", "AudioWorkletNode", "navigator"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let amplitude = .1, meterDisconnected = 0, lost = 0, stopped = 0;
  const track = { onended: null, stop() { stopped++; } };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  class Context {
    state = "running"; sampleRate = 48000; destination = {}; audioWorklet = { async addModule() {} };
    async resume() {} async close() { this.state = "closed"; }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createGain() { return { gain: {}, connect() {}, disconnect() {} }; }
    createAnalyser() { return { connect() {}, disconnect() { meterDisconnected++; }, getFloatTimeDomainData(values) { values.fill(amplitude); }, getByteFrequencyData(values) { values.fill(amplitude ? 128 : 0); } }; }
  }
  class Worklet { port = { onmessage: null, close() {} }; connect() {} disconnect() {} }
  Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: Context });
  Object.defineProperty(globalThis, "AudioWorkletNode", { configurable: true, value: Worklet });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { mediaDevices: { async getUserMedia() { return stream; } } } });
  const audio = new ConversationAudio(() => {}, () => {}, () => lost++);
  try {
    assert.equal(audio.getInputLevel(), 0);
    await audio.enableMicrophone();
    assert.ok(audio.getInputLevel() > .9);
    assert.ok(audio.getInputBands()[1] > 0);
    assert.equal(audio.getOutputLevel(), 0, "capture is not partner playback");
    amplitude = 0; assert.equal(audio.getInputLevel(), 0);
    amplitude = .8; assert.equal(audio.getInputLevel(), 1);
    audio.disableMicrophone(); assert.equal(audio.getInputLevel(), 0); assert.deepEqual([...audio.getInputBands()], [0,0,0,0]); assert.equal(meterDisconnected, 1);
    await audio.enableMicrophone(); track.onended();
    assert.equal(lost, 1); assert.equal(audio.getInputLevel(), 0); assert.equal(meterDisconnected, 2);
    await audio.enableMicrophone(); audio.dispose();
    assert.equal(audio.getInputLevel(), 0); assert.equal(stopped, 3);
  } finally {
    audio.dispose();
    for (const [key, descriptor] of Object.entries(originals)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
});


test("spectral bands use Hz boundaries, handle Nyquist, and clear stale values in silence", () => {
  const bins = new Uint8Array(1024), result = new Float32Array(4);
  bins[Math.round(1000 / (48000/2048))] = 255;
  assert.equal(visualFrequencyBands(bins,48000,.4,result),result);
  assert.equal(result[0],0); assert.ok(result[1]>0); assert.equal(result[2],0);
  assert.ok(Math.abs(result[3]-.4)<1e-6);
  bins.fill(255); visualFrequencyBands(bins,16000,1,result);
  assert.deepEqual([...result],[1,1,1,1]);
  visualFrequencyBands(bins,16000,0,result); assert.deepEqual([...result],[0,0,0,0]);
  visualFrequencyBands(bins,NaN,1,result); assert.deepEqual([...result],[0,0,0,0]);
});

test("orb response is frame-rate independent with a fast attack and gentle release", () => {
  const fast=new Float32Array(4),slow=new Float32Array(4);
  for(let i=0;i<6;i++) smoothOrbBands(fast,undefined,.8,100/6);
  for(let i=0;i<3;i++) smoothOrbBands(slow,undefined,.8,100/3);
  assert.ok(Math.abs(fast[3]-slow[3])<1e-6); assert.ok(fast[3]>.77);
  smoothOrbBands(fast,undefined,0,160); assert.ok(fast[3]>.27&&fast[3]<.3);
  smoothOrbBands(slow,new Float32Array([NaN,Infinity,-1,2]),0,1000);
  assert.ok([...slow].every(Number.isFinite));assert.ok(slow[0]<.002);assert.ok(slow[3]>.99);
});
