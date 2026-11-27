import assert from "node:assert/strict";
import { test } from "node:test";
import {
  STANDARD_PLAYBACK_RATES,
  formatPlaybackRate,
  normalizePlaybackRates,
  playbackRateIndex,
  playbackRateRatio,
  selectPresetRates,
  stepPlaybackRate
} from "../features/stage-two/practice/playback-speed.ts";

test("standard playback rates match YouTube 0.25x to 2x scale", () => {
  assert.deepEqual(STANDARD_PLAYBACK_RATES, [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
  assert.equal(formatPlaybackRate(0.25), "0.25×");
  assert.equal(formatPlaybackRate(1), "1×");
  assert.equal(formatPlaybackRate(2), "2×");
});

test("normalizePlaybackRates deduplicates, includes current rate, and sorts ascending", () => {
  assert.deepEqual(normalizePlaybackRates([1.25, 0.5, 1, 1.25], 0.75), [0.5, 0.75, 1, 1.25]);
  assert.deepEqual(normalizePlaybackRates([], 1), [1]);
  assert.deepEqual(normalizePlaybackRates([Number.NaN, -1, 0], 1), [1]);
});

test("playbackRateIndex, ratio, and stepping stay clamped within discrete stops", () => {
  const options = STANDARD_PLAYBACK_RATES;
  assert.equal(playbackRateIndex(options, 0.25), 0);
  assert.equal(playbackRateIndex(options, 1), 3);
  assert.equal(playbackRateIndex(options, 2), 7);
  assert.equal(playbackRateIndex(options, 1.1), 3);

  assert.equal(playbackRateRatio(options, 0.25), 0);
  assert.equal(playbackRateRatio(options, 2), 1);
  assert.equal(playbackRateRatio([1], 1), 0);

  assert.equal(stepPlaybackRate(options, 0.25, -1), 0.25);
  assert.equal(stepPlaybackRate(options, 0.25, 1), 0.5);
  assert.equal(stepPlaybackRate(options, 1, -1), 0.75);
  assert.equal(stepPlaybackRate(options, 1, 1), 1.25);
  assert.equal(stepPlaybackRate(options, 2, 1), 2);
});

test("selectPresetRates keeps full subsets up to 5 and selects 5 balanced presets for full YouTube scale", () => {
  assert.deepEqual(selectPresetRates(STANDARD_PLAYBACK_RATES), [0.5, 0.75, 1, 1.25, 1.5]);
  assert.deepEqual(selectPresetRates([0.5, 0.75, 1, 1.25]), [0.5, 0.75, 1, 1.25]);
  assert.deepEqual(selectPresetRates([0.75, 1, 1.25]), [0.75, 1, 1.25]);
  assert.deepEqual(selectPresetRates([1]), [1]);
});
