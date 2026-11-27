import assert from "node:assert/strict";
import test from "node:test";
import { nextEnabledTabIndex, resolvePanelId, resolveTabId } from "../components/ui/tabs-navigation.ts";

const items = [
  { value: "first" },
  { value: "second", disabled: true },
  { value: "third" },
  { value: "fourth" }
];

test("ArrowRight and ArrowLeft wrap around and skip disabled tabs", () => {
  assert.equal(nextEnabledTabIndex(items, 0, "ArrowRight"), 2);
  assert.equal(nextEnabledTabIndex(items, 2, "ArrowRight"), 3);
  assert.equal(nextEnabledTabIndex(items, 3, "ArrowRight"), 0);
  assert.equal(nextEnabledTabIndex(items, 2, "ArrowLeft"), 0);
  assert.equal(nextEnabledTabIndex(items, 0, "ArrowLeft"), 3);
});

test("Home and End jump to first and last enabled tabs", () => {
  const edgeDisabled = [
    { value: "a", disabled: true },
    { value: "b" },
    { value: "c" },
    { value: "d", disabled: true }
  ];
  assert.equal(nextEnabledTabIndex(edgeDisabled, 2, "Home"), 1);
  assert.equal(nextEnabledTabIndex(edgeDisabled, 1, "End"), 2);
});

test("non-navigation keys and all-disabled lists return null", () => {
  assert.equal(nextEnabledTabIndex(items, 0, "Enter"), null);
  assert.equal(nextEnabledTabIndex(items, 0, "Tab"), null);
  assert.equal(nextEnabledTabIndex([], 0, "ArrowRight"), null);
  assert.equal(
    nextEnabledTabIndex([{ value: "only", disabled: true }], 0, "ArrowRight"),
    null
  );
});

test("tab and panel id resolvers preserve custom and prefixed conventions", () => {
  assert.equal(resolveTabId("explain", 0, "detail"), "detail-explain");
  assert.equal(resolveTabId("recommended", 1, "ignored", (_, index) => `corpus-view-${index}`), "corpus-view-1");
  assert.equal(resolveTabId("explain", 0), undefined);
  assert.equal(resolvePanelId("explain", 0, "corpus-results"), "corpus-results");
  assert.equal(resolvePanelId("sound", 0, "fallback", (value) => `panel-${value}`), "panel-sound");
});
