import type { StageOneBlueprint } from "@libitu/types/stage-one";
import { buildSentenceUnits } from "../stage-two/sentences.ts";

export function resolveHistoricalSentence(blueprint: StageOneBlueprint, id: string, text: string | null) {
  const sentences = blueprint.segments.flatMap(segment =>
    buildSentenceUnits(blueprint.contentId, segment, blueprint.transcript));
  const exact = sentences.find(sentence => sentence.id === id);
  if (exact) return exact;
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  const matches = text ? sentences.filter(sentence => normalize(sentence.text) === normalize(text)) : [];
  return matches.length === 1 ? matches[0] : null;
}
