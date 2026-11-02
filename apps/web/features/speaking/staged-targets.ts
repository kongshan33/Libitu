import type { SpeakingStageProgress } from "@libitu/types/speaking";

/** These labels describe confirmed evidence, never a planned or merely sent example. */
export function stagedTargetStatus(target?: SpeakingStageProgress["targets"][number]) {
  if (!target) return { modeled: false, modeling: "Example not yet confirmed", practice: "Use not yet observed", imitationUses: 0 };
  return {
    modeled: target.modeling_status === "modeled",
    modeling: {
      pending: "Example not yet confirmed", modeled: "Partner example confirmed",
      exposed: "Target already revealed", uncertain: "Example delivery uncertain", not_needed: "Used before an example was needed",
    }[target.modeling_status],
    practice: {
      pending: "Use not yet observed", offered: "Opportunity confirmed", responded: "Reply confirmed · target use not observed", attempted: "Use observed",
      independent: "Independent use confirmed", skipped: "Skipped · excluded from coverage",
    }[target.practice_status],
    imitationUses: target.imitation_uses,
  };
}
