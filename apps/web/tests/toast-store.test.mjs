import assert from "node:assert/strict";
import test from "node:test";
import { createToastStore } from "../components/ui/toast-store.ts";

test("toast store shows toasts with tone-aware default durations and dismisses them", () => {
  const store = createToastStore({ maxVisible: 3, defaultDurationMs: 3000, errorDurationMs: 5000 });
  const notifications = [];
  const unsubscribe = store.subscribe(() => notifications.push(store.getSnapshot().length));

  const id1 = store.show("Saved to corpus");
  const id2 = store.show({ title: "Sync failed", tone: "error" });
  const id3 = store.show({ title: "Added item", action: { label: "Undo", onClick() {} } });

  assert.equal(store.getSnapshot().length, 3);
  assert.equal(store.getSnapshot()[0].tone, "neutral");
  assert.equal(store.getSnapshot()[0].durationMs, 3000);
  assert.equal(store.getSnapshot()[1].durationMs, 5000);
  assert.equal(store.getSnapshot()[2].durationMs, 4800);

  store.dismiss(id1);
  assert.deepEqual(store.getSnapshot().map((item) => item.id), [id2, id3]);

  store.dismissAll();
  assert.equal(store.getSnapshot().length, 0);
  assert.deepEqual(notifications, [1, 2, 3, 2, 0]);
  unsubscribe();
});

test("toast store caps visible stack and updates duplicate ids in place", () => {
  const store = createToastStore({ maxVisible: 2 });
  store.show({ id: "save", title: "Saved locally", tone: "info" });
  store.show({ id: "note", title: "Saved note", tone: "success" });
  store.show({ id: "third", title: "Third notice" });

  assert.deepEqual(store.getSnapshot().map((item) => item.id), ["note", "third"]);

  store.show({ id: "note", title: "Saved note again", tone: "success" });
  assert.deepEqual(store.getSnapshot().map((item) => [item.id, item.title, item.revision]), [
    ["third", "Third notice", 1],
    ["note", "Saved note again", 2]
  ]);
});

test("toast store ignores blank messages and no-op dismissals", () => {
  const store = createToastStore();
  let calls = 0;
  store.subscribe(() => { calls++; });

  assert.equal(store.show("   "), "");
  store.dismiss("missing");
  store.dismissAll();
  assert.equal(calls, 0);
});

test("toast store preserves pending, dismissible, and dismissOnAction flags", () => {
  const store = createToastStore();
  store.show({
    id: "practice-save",
    title: "Saving practice take…",
    tone: "info",
    durationMs: 0,
    pending: true,
    dismissible: false,
    dismissOnAction: false
  });

  const [item] = store.getSnapshot();
  assert.equal(item.pending, true);
  assert.equal(item.dismissible, false);
  assert.equal(item.dismissOnAction, false);
  assert.equal(item.durationMs, 0);

  store.show({ id: "practice-save", title: "Take saved", tone: "success" });
  const [updated] = store.getSnapshot();
  assert.equal(updated.pending, false);
  assert.equal(updated.dismissible, true);
  assert.equal(updated.dismissOnAction, true);
  assert.equal(updated.revision, 2);
});
