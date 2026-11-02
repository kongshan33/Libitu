import type { ConversationStageMarker, SpeakingWorkspace } from "@libitu/types/speaking";
import { currentSupport } from "./support.ts";
import { validRecastReference } from "./recasts.ts";

/** Existing explicit v1 support remains a choice; plan version alone is not one. */
export function concealedTargets(workspace: SpeakingWorkspace): boolean {
  return workspace.session.mission_plan?.version === 2 || currentSupport(workspace) === null;
}

export function stageMarkers(workspace: SpeakingWorkspace): Map<string, ConversationStageMarker> {
  const steps = workspace.session.logic_template?.steps ?? [];
  const messages = workspace.messages;
  const result = new Map<string, ConversationStageMarker>();
  const markers = (workspace.conversation?.stage_markers ?? []).filter(marker =>
    Number.isInteger(marker.stage_index) && steps[marker.stage_index] === marker.label
    && validRecastReference(marker.source, messages, "assistant"));
  let previous: number | undefined;
  for (const message of messages) {
    const marker = markers.find(value => value.source.message_id === message.id);
    if (marker && marker.stage_index !== previous) result.set(message.id, marker);
    if (marker) previous = marker.stage_index;
  }
  return result;
}

export function waitingForReply(workspace: SpeakingWorkspace): boolean {
  const question = workspace.conversation?.question;
  const help = workspace.conversation?.help;
  return !!question && question.auto_rephrase === "completed" && !question.automatic_help_closed
    && ["presenting", "awaiting_reply"].includes(question.status) && (!help || help.status === "retired");
}

const cues: Record<string, string> = {
  context: "Set the scene and the goal.", tension: "Name the risk or objection.",
  proposal: "Make your recommendation.", defend: "Answer pushback with evidence.",
  symptom: "Describe what is happening.", cause: "Explain what may be causing it.",
  fix: "Suggest a practical fix.", confirm: "Check that you agree on the next step.",
  stakes: "Explain why this matters.", "trade-off": "Weigh the competing priorities.",
  commit: "Agree on what happens next.", done: "Share what is finished.",
  blockers: "Explain what is getting in the way.", next: "Outline the next step.",
  ask: "Say what help you need.", acknowledge: "Recognize the other perspective.",
  reframe: "Offer another way to see it.", evidence: "Support your point with an example.",
  propose: "Suggest an alternative.", "big picture": "Explain the overall purpose.",
  parts: "Introduce the main parts.", why: "Explain why they matter.",
  "try it": "Invite a first attempt.", setting: "Set the scene.",
  complication: "Describe what changed.", outcome: "Explain what happened next.",
  reflection: "Share what you took from it.", suggest: "Offer a plan.",
  check: "Ask what works for the other person.", adjust: "Adapt the plan together.",
  open: "Start the conversation.", share: "Share a recent experience.",
  relate: "Connect with the other person's experience.", "follow up": "Ask a follow-up question.",
};
export function stageCue(label: string | undefined): string | undefined {
  return label ? cues[label.trim().toLowerCase()] : undefined;
}
