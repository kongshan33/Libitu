import assert from "node:assert/strict";
import test from "node:test";
import { libraryItems, emptyFilters, sourceHref } from "../features/corpus/library.ts";
import { addCorpusToDraft, emptyDraft, saveDraft, readDraftEnvelope, LOADOUT_STORAGE_KEY } from "../features/loadout/draft.ts";
import { CorpusStorage } from "../features/corpus/corpus-storage.ts";
import { scenarioGroups, scenarioOptions } from "../features/corpus/scenario-filters.ts";
const rows = [
  { key: "a", sourceTitle: "Talk A", sourceUrl: "https://example.com", createdAt: "2026-01-01", item: { id: "a", kind: "chunk", text: "To be fair", meaning: "concede", tags: ["hedging"], level: "B1", register: "neutral", scenarioTags: ["workplace"], learningValueScore: 5, meta: "" } },
  { key: "b", sourceTitle: "Talk B", sourceUrl: "https://example.org", createdAt: "2026-02-01", item: { id: "b", kind: "idiom", text: "raise the bar", tags: ["framing"], level: "B2", learningValueScore: 3, meta: "" } },
  { key: "c", sourceTitle: "Talk A", sourceUrl: "https://example.com", item: { id: "c", kind: "structure", text: "What matters is [A]", tags: [], meta: "" } }
];
const memory = () => { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; };
test("library combines OR facets with AND dimensions and preserves identities after search", () => {
  assert.deepEqual(libraryItems(rows, { ...emptyFilters, kind: ["chunk", "idiom"], level: ["B1"], tags: ["hedging", "framing"] }, "recent").map(r => r.key), ["a"]);
  assert.equal(libraryItems(rows, { ...emptyFilters, query: "raise" }, "recent")[0].key, "b");
  assert.deepEqual(libraryItems(rows, { ...emptyFilters, highValue: true }, "value").map(r => r.key), ["a"]);
  assert.deepEqual(libraryItems(rows, { ...emptyFilters, level: ["unknown"] }, "recent").map(r => r.key), ["c"]);
  assert.deepEqual(libraryItems(rows, emptyFilters, "recent").map(r => r.key), ["b", "a", "c"]);
  assert.equal(sourceHref({ ...rows[0], sourceUrl: "javascript:alert(1)" }), null);
});
test("scenario facets merge legacy languages and aliases without changing saved metadata", () => {
  const scenarios = [
    ["商务访谈", "interviews", "正式/中性"],
    [" DAILY_LIFE ", "small-talk", "日常口语"],
    ["negotiation", "解释说明", "正式讨论"],
    ["workplace", "presentation", "商业演讲"],
    ["正式", "中性偏正式", "描述性"],
    [],
    ["an unseen future label"],
    ["email", "书面沟通"],
  ];
  const records = scenarios.map((scenarioTags, index) => ({ ...rows[0], key: String(index), item: { ...rows[0].item, scenarioTags, level: index === 2 ? "B2" : "B1" } }));
  const before = JSON.stringify(records);
  assert.deepEqual(scenarioGroups(scenarios[0]), ["interview"]);
  assert.deepEqual(scenarioGroups(scenarios[1]), ["daily_life"]);
  assert.deepEqual(scenarioGroups(scenarios[2]), ["discussion"]);
  assert.deepEqual(scenarioGroups(scenarios[3]), ["workplace", "presentation"]);
  assert.deepEqual(libraryItems(records, { ...emptyFilters, scenario: ["interview", "discussion"] }, "recent").map(r => r.key), ["0", "2"]);
  assert.deepEqual(libraryItems(records, { ...emptyFilters, scenario: ["interview", "discussion"], level: ["B2"] }, "recent").map(r => r.key), ["2"]);
  assert.deepEqual(libraryItems(records, { ...emptyFilters, scenario: ["unknown"] }, "recent").map(r => r.key), ["4", "5", "6"]);
  assert.deepEqual(libraryItems(records, { ...emptyFilters, scenario: ["writing"] }, "recent").map(r => r.key), ["7"]);
  assert.equal(JSON.stringify(records), before);
  const available = new Set(records.flatMap(record => scenarioGroups(record.item.scenarioTags)));
  const labels = scenarioOptions.filter(option => available.has(option.value)).map(option => option.label);
  assert.equal(new Set(labels).size, labels.length);
  assert.ok(labels.every(label => /^[A-Za-z ]+$/.test(label)));
  assert.ok(labels.length <= 8);
});
test("guest edits survive reload with stable key, source evidence, and creation time", async () => {
  const storage = memory(); const store = new CorpusStorage(() => storage);
  const original = { ...rows[0], item: { ...rows[0].item, sourceText: "To be fair", analysisDetail: { context: { selectedText: "To be fair" }, analysis: {} } } };
  await store.open(null); await store.save(original);
  assert.equal(await store.update(original, { text: "In fairness", meaning: "My definition", usageNote: "Use gently", tags: ["softening"], slots: {} }), true);
  await store.open(null);
  const edited = store.state.records[0];
  assert.equal(edited.key, "a"); assert.equal(edited.createdAt, original.createdAt);
  assert.equal(edited.item.text, "In fairness"); assert.equal(edited.item.sourceText, "To be fair");
  assert.equal(edited.item.analysisDetail.context.selectedText, "To be fair");
  assert.ok(Date.parse(edited.updatedAt));
});
test("failed edits and late account responses do not publish a successful edit", async () => {
  const storage = memory(); const store = new CorpusStorage(() => storage);
  const record = { ...rows[0], serverId: "a" };
  const edit = { text: "changed", meaning: "", usageNote: "", tags: [], slots: {} };
  const remote = { list: async () => [record], update: async () => { throw new Error("offline"); } };
  await store.open("alice", remote);
  assert.equal(await store.update(record, edit), false); assert.equal(store.state.records[0].item.text, record.item.text);
  let resolve;
  await store.open("alice", { ...remote, update: () => new Promise(done => { resolve = done; }) });
  const pending = store.update(record, edit);
  await store.open("bob", { list: async () => [] });
  resolve({ ...record, item: { ...record.item, ...edit } });
  assert.equal(await pending, false); assert.deepEqual(store.state.records, []);
});
test("loadout merges latest settings atomically, deduplicates, and never truncates over-capacity input", async () => {
  const storage = memory();
  await saveDraft(storage, "alice", { ...emptyDraft(), selectedKeys: ["a"], goal: "Keep this goal", difficulty: "challenging" });
  const draft = await addCorpusToDraft(storage, "alice", ["a", "b"], rows);
  assert.deepEqual(draft.selectedKeys, ["a", "b"]); assert.equal(draft.goal, "Keep this goal"); assert.equal(draft.difficulty, "challenging");
  const extra = Array.from({length: 5}, (_, i) => ({ ...rows[0], key: `extra-${i}` }));
  const before = storage.getItem(LOADOUT_STORAGE_KEY);
  await assert.rejects(addCorpusToDraft(storage, "alice", extra.map(r => r.key), [...rows, ...extra]), /exceeds/);
  assert.equal(storage.getItem(LOADOUT_STORAGE_KEY), before);
  assert.equal(await addCorpusToDraft(storage, "bob", ["a"], rows, { isCurrent: () => false }), null);
  assert.equal(storage.getItem(LOADOUT_STORAGE_KEY), before);
});
test("first account adopts guest settings; an existing account preserves its guest alternative", async () => {
  const storage = memory();
  await saveDraft(storage, null, { ...emptyDraft(), goal: "Guest goal", selectedKeys: ["a"] });
  assert.equal((await addCorpusToDraft(storage, "alice", ["b"], rows)).goal, "Guest goal");
  await saveDraft(storage, null, { ...emptyDraft(), goal: "Other guest goal" });
  await addCorpusToDraft(storage, "alice", ["c"], rows);
  const envelope = readDraftEnvelope(storage);
  assert.equal(envelope.accounts.alice.draft.goal, "Guest goal");
  assert.equal(envelope.accounts.alice.deviceDrafts[0].goal, "Other guest goal");
  assert.equal(envelope.guest, null);
});
