import type { HintPresentation, TargetPresentation } from "../ConversationPresentation";

export const previewStates = [
  ["ready", "Ready"], ["live", "Live"], ["speaking", "Speaking"], ["silence", "Silence"],
  ["direction", "Direction"], ["opening", "Opening words"], ["example", "Example"],
  ["hint_loading", "Hint loading"], ["hint_error", "Hint unavailable"],
  ["connecting", "Connecting"], ["paused", "Paused"], ["error", "Connection lost"],
  ["completed", "Completed"], ["uncertain", "Uncertain model"], ["free", "Free conversation"],
] as const;
export type PreviewState = typeof previewStates[number][0];
export const scene = {
  goal: "Secure leadership approval for a new market entry strategy.",
  metadata: "Workplace · Guided · Detailed feedback",
  setting: "Quarterly leadership review. You are the senior product strategy manager. Your partner is a skeptical senior vice president of growth.",
  stages: ["Context", "Tension", "Proposal", "Defend"],
  opening: "Thanks for making time. Which market are you proposing we enter first, and why now?",
  user: "We can eke out a beachhead in the premium segment, because we plan to production our product there.",
  partner: "Got it, you plan to produce it there. But this isn’t a zero-sum game for us. If we win premium share, who loses it?",
  simpler: "Let me ask it differently. Which customers would we be taking share from?",
  partial: "It isn’t a zero-sum game because …",
  recast: "We plan to produce our product there.",
};
export const hints: Record<"direction" | "opening" | "example", HintPresentation> = {
  direction: { level: "direction", text: "explain why both sides can win." },
  opening: { level: "opening", text: "This isn’t a zero-sum game…" },
  example: { level: "example", text: "This isn’t a zero-sum game: premium buyers are new customers, not ours moving over." },
};
export const freeHints: typeof hints = {
  direction: { level: "direction", text: "share something you enjoyed recently." },
  opening: { level: "opening", text: "One thing I enjoyed this week…" },
  example: { level: "example", text: "One thing I enjoyed this week was a quiet walk by the river." },
};
export const targets: TargetPresentation[] = [
  { id: "preview-1", stage: "Context", text: "eke out a beachhead", meaning: "Gain a small, initial foothold in a new market.", used: true, modeled: false, current: false, status: "Used on your own" },
  { id: "preview-2", stage: "Tension", text: "zero-sum game", meaning: "One side gains only when the other loses.", used: false, modeled: true, current: true, status: "Partner example confirmed" },
  { id: "preview-3", stage: "Proposal", text: "lean into", meaning: "Commit more strongly to something.", used: false, modeled: false, current: false, status: "Coming up" },
];
