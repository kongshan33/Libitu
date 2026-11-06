import type { CorpusKind, CorpusSelectionAnalysis } from "@libitu/types/stage-one";

/** A saved/user-selected kind owns routing; Syntax belongs to the old kind. */
export function withCorpusKind(analysis: CorpusSelectionAnalysis, kind: CorpusKind): CorpusSelectionAnalysis {
  if (analysis.fields.kind === kind) return analysis;
  return {
    ...analysis,
    fields: { ...analysis.fields, kind },
    syntaxState: "pending",
    syntaxAnalysis: {
      sentenceType: "", mainClause: "", structureBreakdown: [], logicRelations: [],
      informationHierarchy: [], styleFeatures: [], usageScenarios: [], grammarPoints: [],
      wordingNotes: [], reusablePatterns: [], translations: [], translationNotes: [], evidence: []
    }
  };
}

export function corpusNotePreview(note: string): string {
  const plain = note.trim().replace(/\*\*([^*]+)\*\*|`([^`]+)`/g, "$1$2").replace(/\s+/g, " ");
  return plain.length > 140 ? `${plain.slice(0, 137).trimEnd()}…` : plain;
}
