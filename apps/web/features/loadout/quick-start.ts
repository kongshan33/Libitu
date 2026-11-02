import type { LogicTemplateId, SpeakingLogicTemplate, SpeakingScenario, SpeakingLogicMetadata, LoadoutFunction, LoadoutUsageItem } from "@libitu/types/speaking";
import type { FunctionalTag } from "@libitu/types/stage-one";
import type { SavedCorpusRecord } from "../corpus/corpus-storage.ts";

export type QuickStartPick = {
  record: SavedCorpusRecord;
  stage: string;
  stageIndex: number | null;
  reason: string;
};
export type QuickStartRecommendation = {
  picks: QuickStartPick[];
  logic: SpeakingLogicTemplate | undefined;
  scene: string;
};

// These are local suggestions from existing saved tags, not an assessment of
// usage, mastery or suitability for the scene generated after Start.
const stageTags: Record<string, readonly FunctionalTag[]> = {
  context: ["framing", "discourse"],
  "big picture": ["framing", "discourse"],
  tension: ["contrast", "conceding"],
  proposal: ["proposing"],
  propose: ["proposing"],
  defend: ["justifying", "emphasising"],
  symptom: ["clarifying", "framing"],
  problem: ["clarifying", "framing"],
  cause: ["justifying"],
  fix: ["proposing"],
  solution: ["proposing"],
  confirm: ["summarising", "summarizing", "acknowledging"],
  stakes: ["emphasising", "justifying"],
  priorities: ["emphasising", "justifying"],
  "trade off": ["contrast", "conceding", "hedging"],
  tradeoffs: ["contrast", "conceding", "hedging"],
  commit: ["proposing", "summarising", "summarizing"],
  agreement: ["acknowledging", "summarising", "summarizing"],
  done: ["summarising", "summarizing", "framing"],
  progress: ["summarising", "summarizing", "framing"],
  blockers: ["contrast", "clarifying", "hedging"],
  next: ["transitioning", "proposing"],
  "next steps": ["transitioning", "proposing"],
  ask: ["softening", "redirecting"],
  acknowledge: ["acknowledging", "conceding"],
  reframe: ["reframing", "contrast"],
  concern: ["hedging", "contrast"],
  evidence: ["justifying", "emphasising"],
  alternative: ["proposing", "reframing"],
  align: ["summarising", "summarizing", "acknowledging"],
  welcome: ["acknowledging"],
  parts: ["transitioning", "clarifying"],
  steps: ["transitioning", "discourse"],
  why: ["justifying", "emphasising"],
  "try it": ["proposing", "redirecting"],
  check: ["clarifying", "summarising", "summarizing"],
};

const sceneSeeds: Partial<Record<LogicTemplateId, Partial<Record<SpeakingScenario, readonly string[]>>>> = {
  persuasive_pitch: {
    workplace: ["Pitch a small change that would make your team's week easier.", "Convince a colleague to try a new approach to a shared project.", "Make the case for a short pilot before committing to a bigger project."],
    everyday: ["Persuade a friend to try a new weekend activity.", "Suggest a simpler plan for a group trip and explain why it works.", "Make the case for a new routine with someone you live with."],
  },
  technical_troubleshoot: {
    workplace: ["Work with a colleague to solve a recurring problem in your workflow.", "Explain a problem with a shared tool and agree on a practical fix.", "Discuss why a handoff keeps going wrong and how to test a solution."],
    everyday: ["Work out why a household device is not working with a friend.", "Resolve a problem with a travel booking with a helpful agent.", "Explain an issue with a delivery and agree on a solution."],
  },
  stakeholder_alignment: {
    workplace: ["Agree on priorities with a colleague when time is limited.", "Balance two teams' needs and settle on the next step.", "Agree on a realistic deadline with someone who has different priorities."],
    everyday: ["Plan a group weekend when everyone wants something different.", "Agree on shared household responsibilities with a housemate.", "Balance budget and preferences while planning a trip with a friend."],
  },
  status_update: {
    workplace: ["Give a colleague a short update on a project and ask for help.", "Explain what is finished, what is blocked and what happens next.", "Update your team on a task that is taking longer than expected."],
    everyday: ["Update a friend on preparations for an event you are organizing together.", "Tell a housemate how a shared errand is going and what is left to do.", "Catch up with a friend about a personal project and your next steps."],
  },
  disagreement: {
    workplace: ["Respectfully challenge a colleague's plan and propose an alternative.", "Discuss a decision you disagree with while finding common ground.", "Raise a concern about a deadline and suggest a workable adjustment."],
    everyday: ["Disagree kindly with a friend's plan and suggest another option.", "Discuss a shared expense you have different opinions about.", "Find common ground with a friend about where to go this weekend."],
  },
  onboarding: {
    workplace: ["Help a new teammate understand a process and try their first step.", "Explain how a shared tool works to a colleague using it for the first time.", "Introduce a teammate to the main parts of a project and why they matter."],
    everyday: ["Introduce a friend to a hobby and help them try it.", "Show a visitor how to get around your neighborhood.", "Explain a simple recipe to someone trying it for the first time."],
  },
};

export const FUNCTION_LABELS: Record<LoadoutFunction, string> = { open: "Open & structure", inform: "Inform & explain", stance: "Stance", align: "Align & respond", ask: "Ask & propose", clarify: "Clarify & repair", social: "Social", narrate: "Narrate" };
const functionTags: Record<LoadoutFunction, readonly string[]> = {
  open: ["framing", "discourse", "summarising", "summarizing", "transitioning", "signposting", "concluding", "open"], inform: ["describing", "giving examples", "data/trends", "cause & effect", "justifying", "inform"],
  stance: ["contrast", "hedging", "emphasising", "evaluating", "agreeing", "disagreeing", "stance"], align: ["acknowledging", "conceding", "reframing", "align"],
  ask: ["proposing", "redirecting", "softening", "ask"], clarify: ["clarifying", "clarify"], social: ["social"], narrate: ["narrate"],
};
export type LogicMetadata = Partial<Record<LogicTemplateId, SpeakingLogicMetadata>>;
export function corpusFunctions(record: SavedCorpusRecord): LoadoutFunction[] {
  return (Object.keys(functionTags) as LoadoutFunction[]).filter(fn => functionTags[fn].some(tag => (record.item.tags as string[]).includes(tag)));
}
export function logicFamily(logic: SpeakingLogicTemplate, metadata?: LogicMetadata): "workplace" | "daily" {
  return metadata?.[logic.id]?.family ?? (["telling_story", "making_plans", "catching_up"].includes(logic.id) ? "daily" : "workplace");
}
const fallbackFunctions: Partial<Record<LogicTemplateId, LoadoutFunction[]>> = {
  telling_story: ["open", "inform", "inform", "stance"], making_plans: ["ask", "clarify", "align", "ask"], catching_up: ["social", "inform", "social", "ask"],
};
export function matchesStage(record: SavedCorpusRecord, logic: SpeakingLogicTemplate, index: number, metadata?: LogicMetadata): boolean {
  const fn = metadata?.[logic.id]?.stage_functions[index] ?? fallbackFunctions[logic.id]?.[index];
  return fn ? corpusFunctions(record).includes(fn) : Boolean(stageTags[normalizedStage(logic.steps[index])]?.some(tag => record.item.tags.includes(tag)));
}
/** Allocate repeated function stages before placing another target into an occupied stage. */
export function mapTargetStages(records: SavedCorpusRecord[], logic?: SpeakingLogicTemplate, metadata?: LogicMetadata): Record<string, number | null> {
  const occupied = new Set<number>();
  return Object.fromEntries(records.map(record => {
    const matches = logic?.steps.flatMap((_, index) => matchesStage(record, logic, index, metadata) ? [index] : []) ?? [];
    const stage = matches.find(index => !occupied.has(index)) ?? matches[0] ?? null;
    if (stage !== null) occupied.add(stage);
    return [record.key, stage];
  }));
}
export function isRecentVideo(record: SavedCorpusRecord, now: number): boolean {
  const age = now - savedTime(record);
  if (!record.createdAt || age < 0 || age > 30 * 86400000) return false;
  try { const url = new URL(record.sourceUrl); return ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(url.hostname) && (url.hostname === "youtu.be" ? url.pathname.length > 1 : url.pathname === "/watch" && !!url.searchParams.get("v") || /^\/(shorts|embed)\/[^/]+/.test(url.pathname)); } catch { return false; }
}
export type RecommendationContext = { metadata?: LogicMetadata; usage?: ReadonlyMap<string, LoadoutUsageItem>; now?: number; lastLogicId?: LogicTemplateId | null };
export function usageReason(record: SavedCorpusRecord, context: RecommendationContext): string | null {
  const usage = record.serverId ? context.usage?.get(record.serverId)?.usage : undefined;
  if (usage?.state === "never") return "Never used in recorded missions";
  if (usage?.state === "used" && usage.due === true) return "Due for review · 7 days";
  if (context.now !== undefined && isRecentVideo(record, context.now)) return "From a recent video";
  return null;
}
/** Exclude only explicit metadata; missing labels are not evidence of ineligibility. */
export function loadoutEligible(record: SavedCorpusRecord): boolean {
  const item = record.item as typeof record.item & { loadoutEligible?: boolean; function?: string };
  return item.loadoutEligible !== false && !["vocabulary", "context-bound"].includes(item.function ?? "") && !(item.tags as string[]).some(tag => tag === "vocabulary" || tag === "context-bound");
}
export function rankCorpus(records: SavedCorpusRecord[], context: RecommendationContext = {}): SavedCorpusRecord[] {
  const rank = (record: SavedCorpusRecord) => {
    const usage = record.serverId ? context.usage?.get(record.serverId)?.usage : undefined;
    return usage?.state === "never" ? 0 : usage?.state === "used" && usage.due === true ? 1 : context.now !== undefined && isRecentVideo(record, context.now) ? 2 : 3;
  };
  return uniqueRecords(records).filter(loadoutEligible).sort((a, b) => rank(a) - rank(b));
}
const travelScenes = ["Ask a local to help you plan an afternoon in a new city.", "Discuss a change to your travel booking with a helpful agent.", "Agree on a day's itinerary with a travel companion.", "Ask a hotel host for a practical recommendation."];
const travelLogicScenes: Partial<Record<LogicTemplateId, readonly string[]>> = {
  telling_story: ["Tell a fellow traveler about an unexpected detour on your trip.", "Share a memorable first experience in a new city.", "Describe a travel mishap and how it worked out."],
  making_plans: ["Agree on tomorrow's itinerary with your travel companion.", "Choose transport and a meeting time for a day trip.", "Adjust sightseeing plans when the weather changes."],
  catching_up: ["Catch up with a friend about your travels so far.", "Chat with a fellow traveler about what you both enjoyed today.", "Share a travel update with a friend and ask about their news."],
};
const dailyScenes: Partial<Record<LogicTemplateId, readonly string[]>> = {
  telling_story: ["Tell a friend about an unexpected moment in your week.", "Share a story about trying something for the first time.", "Describe a small mishap and what you learned from it."],
  making_plans: ["Agree on a weekend plan with a friend.", "Plan a meal together around different preferences.", "Choose an activity for a free afternoon."],
  catching_up: ["Catch up with a friend you have not seen recently.", "Chat with a neighbor about how your week has been.", "Share a recent update and ask about a friend's news."],
};
export function sceneForLogic(logic: SpeakingLogicTemplate | undefined, scenario: SpeakingScenario, seed = 0): string {
  const scenes = logic ? sceneSeeds[logic.id]?.[scenario] ?? (scenario === "travel" ? travelLogicScenes[logic.id] ?? travelScenes : dailyScenes[logic.id]) : undefined;
  return scenes?.[offset(seed, scenes.length)] ?? (scenario === "workplace" ? "Discuss a practical next step with a colleague." : scenario === "travel" ? travelScenes[offset(seed, travelScenes.length)] : "Make a plan with a friend.");
}

function normalizedStage(stage: string): string {
  return stage.toLowerCase().replace(/[-–—]/g, " ").replace(/\s+/g, " ").trim();
}

/** Preserve server-provided stage names; unknown tags/steps have no inferred fit. */
export function targetStage(record: SavedCorpusRecord, logic?: SpeakingLogicTemplate, metadata?: LogicMetadata): string {
  const index = targetStageIndex(record, logic, metadata);
  return index === null ? "Any stage" : logic!.steps[index];
}

export function targetStageIndex(record: SavedCorpusRecord, logic?: SpeakingLogicTemplate, metadata?: LogicMetadata): number | null {
  const index = logic?.steps.findIndex((_, index) => matchesStage(record, logic, index, metadata)) ?? -1;
  return index < 0 ? null : index;
}

/** Suggest a change only when it gives more of the learner's chosen targets a stage. */
export function betterLogicForTargets(records: SavedCorpusRecord[], options: SpeakingLogicTemplate[], current?: SpeakingLogicTemplate, metadata?: LogicMetadata) {
  if (!records.length || !current) return null;
  const coverage = (logic: SpeakingLogicTemplate) => records.filter(record => targetStageIndex(record, logic, metadata) !== null).length;
  const currentCoverage = coverage(current);
  const best = options.reduce<{ logic: SpeakingLogicTemplate; coverage: number }>((best, logic) => {
    const count = coverage(logic);
    return count > best.coverage ? { logic, coverage: count } : best;
  }, { logic: current, coverage: currentCoverage });
  return best.logic.id === current.id ? null : { ...best, currentCoverage };
}

function offset(seed: number, length: number): number {
  return ((seed % length) + length) % length;
}

function savedTime(record: SavedCorpusRecord): number {
  const time = record.createdAt ? Date.parse(record.createdAt) : NaN;
  return Number.isFinite(time) ? time : 0;
}

function uniqueRecords(records: SavedCorpusRecord[]): SavedCorpusRecord[] {
  const keys = new Set<string>();
  const serverIds = new Set<string>();
  return [...records].sort((left, right) => savedTime(right) - savedTime(left)
    || (left.key < right.key ? -1 : left.key > right.key ? 1 : 0)).filter((record) => {
    if (keys.has(record.key) || record.serverId && serverIds.has(record.serverId)) return false;
    keys.add(record.key);
    if (record.serverId) serverIds.add(record.serverId);
    return true;
  });
}

/** A pure preview: manual selections and their pinned state are never read or changed. */
export function recommendQuickStart(
  records: SavedCorpusRecord[],
  options: SpeakingLogicTemplate[],
  scenario: SpeakingScenario,
  seed: number,
  preferredLogicId?: LogicTemplateId | null,
  context: RecommendationContext = {},
): QuickStartRecommendation {
  const iteration = Number.isFinite(seed) ? Math.trunc(seed) : 0;
  const available = rankCorpus(records, context);
  const familyOptions = options.filter(logic => logicFamily(logic, context.metadata) === (scenario === "workplace" ? "workplace" : "daily"));
  const ranked = (familyOptions.length ? familyOptions : options).map((logic) => ({
    logic,
    coverage: logic.steps.filter((_, index) => available.some(record => matchesStage(record, logic, index, context.metadata))).length,
  }));
  const reviewCoverage = (logic: SpeakingLogicTemplate) => logic.steps.filter((_, index) => available.some(record => {
    const usage = record.serverId ? context.usage?.get(record.serverId)?.usage : undefined;
    return (usage?.state === "never" || usage?.state === "used" && usage.due === true) && matchesStage(record, logic, index, context.metadata);
  })).length;
  const bestReview = Math.max(0, ...ranked.map(({ logic }) => reviewCoverage(logic)));
  const eligible = bestReview ? ranked.filter(({ logic }) => reviewCoverage(logic) === bestReview) : ranked;
  const bestCoverage = Math.max(0, ...eligible.map(({ coverage }) => coverage));
  const best = eligible.filter(({ coverage }) => coverage === bestCoverage).map(({ logic }) => logic);
  const preferred = options.find((logic) => logic.id === preferredLogicId);
  const alternatives = best.filter(logic => logic.id !== context.lastLogicId);
  const candidates = preferred ? [preferred] : alternatives.length ? alternatives : best;
  const logic = candidates.length ? candidates[offset(iteration, candidates.length)] : undefined;
  // Each visit to the same logic rotates its alternatives. A single compatible
  // logic still gets new records and scenes on every Shuffle.
  const cycle = Math.floor(iteration / Math.max(1, candidates.length));
  const picks: QuickStartPick[] = [];
  const used = new Set<string>();
  for (const [stageIndex, stage] of (logic?.steps ?? []).entries()) {
    const matching = available.filter((record) => !used.has(record.key) && matchesStage(record, logic!, stageIndex, context.metadata));
    if (!matching.length) continue;
    const record = matching[offset(cycle, matching.length)]!;
    picks.push({ record, stage, stageIndex, reason: usageReason(record, context) ?? "Fits this structure" });
    used.add(record.key);
    if (picks.length === 3) break;
  }
  const remaining = available.filter((record) => !used.has(record.key));
  const start = remaining.length ? offset(cycle, remaining.length) : 0;
  for (let index = 0; index < remaining.length && picks.length < 3; index++) {
    const record = remaining[(start + index) % remaining.length]!;
    picks.push({ record, stage: "Any stage", stageIndex: null, reason: usageReason(record, context) ?? "From your corpus" });
  }
  return { picks, logic, scene: sceneForLogic(logic, scenario, cycle) };
}
