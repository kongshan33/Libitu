import assert from "node:assert/strict";
import test from "node:test";
import { corpusNotePreview, withCorpusKind } from "../features/corpus/corpus-analysis.ts";

const ready = { selectionType: "phrase", selectedText: "drifted away from", learningText: "drift away from",
  teacherNote: "Keep this explanation", fields: { kind: "chunk", level: "B2", tags: ["contrast"] },
  syntaxState: "ready", syntaxAnalysis: { sentenceType: "old", mainClause: "old", structureBreakdown: ["old"], sectionSummaries: { structure: "old" } } };

test("kind changes invalidate every syntax field while retaining Explain and selection evidence", () => {
  for (const kind of ["idiom", "structure"]) {
    const updated = withCorpusKind(ready, kind);
    assert.equal(updated.fields.kind, kind);
    assert.equal(updated.selectionType, "phrase");
    assert.equal(updated.selectedText, ready.selectedText);
    assert.equal(updated.learningText, ready.learningText);
    assert.equal(updated.teacherNote, ready.teacherNote);
    assert.equal(updated.syntaxState, "pending");
    assert.equal(updated.syntaxAnalysis.sentenceType, "");
    assert.equal(updated.syntaxAnalysis.mainClause, "");
    assert.equal(updated.syntaxAnalysis.sectionSummaries, undefined);
    assert.ok(Object.values(updated.syntaxAnalysis).every(value => value === "" || value.length === 0));
  }
  assert.equal(ready.syntaxState, "ready");
});

test("unchanged kinds preserve ready analysis identity and avoid regeneration", () => {
  assert.equal(withCorpusKind(ready, "chunk"), ready);
});

test("thumbnail notes are bounded plain previews; complete saved text is untouched", () => {
  const note = "**Original note** with `a phrase`.\n\nQuestion\n" + "Detailed answer. ".repeat(80);
  const preview = corpusNotePreview(note);
  assert.ok(preview.length <= 140);
  assert.ok(preview.endsWith("…"));
  assert.ok(preview.startsWith("Original note with a phrase."));
  assert.ok(!preview.includes("\n"));
  assert.ok(note.length > 1000);
  assert.equal(corpusNotePreview(" Short note "), "Short note");
});
