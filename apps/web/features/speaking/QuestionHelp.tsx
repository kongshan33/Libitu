"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ConversationHelp as HelpCard, SpeakingWorkspace } from "@libitu/types/speaking";
import { ConversationHint, type HintPresentation } from "./ConversationPresentation";
import { observeVisible } from "./visibility";
import styles from "./Speaking.module.css";

/** One visible level, acknowledged only after it is actually on screen. */
export function QuestionHelp({ conversation, hidden, onShown, retained, loadingVisible, frozen }: {
  conversation: SpeakingWorkspace["conversation"]; hidden: boolean; onShown: (id: string, version: number) => void;
  frozen?: HelpCard | null; retained: HelpCard | null; loadingVisible: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const active = conversation?.help;
  const question = conversation?.question;
  const pending = !frozen && active?.status === "loading";
  const card = frozen ?? (pending && retained?.question_id === question?.id && retained?.question_version === question?.context_version
    && retained?.target_item_id === active.target_item_id ? retained : active);
  const valid = !!frozen || !!card && card.question_id === question?.id && card.question_version === question.context_version && card.status !== "retired";
  const hint = useMemo<HintPresentation | null>(() => {
    if (valid && card && card.status === "loading" && !loadingVisible) return null;
    if (valid && card) return { level: card.level === "usage" ? "opening" : card.level, status: card.status === "retired" ? "unavailable" : card.status,
      text: card.direction?.replace(/^You could(?:…|\.{3})?\s*/u, "") ?? card.opening_words ?? card.example ?? "" };
    if (question?.auto_rephrase === "completed" && !question.automatic_help_closed && ["presenting", "awaiting_reply"].includes(question.status)) return { level: "reassurance", text: "Take your time." };
    return null;
  }, [valid, card, question, loadingVisible]);
  const [painted, setPainted] = useState<HintPresentation | null>(null);
  const leaving = hidden || !hint;
  useEffect(() => {
    if (!leaving) { setPainted(hint); return; }
    const timer = setTimeout(() => setPainted(null), 160);
    return () => clearTimeout(timer);
  }, [leaving, hint]);
  useEffect(() => {
    if (!frozen && !leaving && valid && card && card.status === "ready" && painted === hint && container.current) return observeVisible(container.current, () => onShown(card.id, card.version));
  }, [frozen, leaving, valid, card, painted, hint, onShown]);
  // Remove from accessibility/receipt eligibility immediately; retain only the
  // outgoing pixels briefly when the reference is replaced or the surface closes.
  return <div ref={container} aria-hidden={leaving || undefined} className={`${styles.hintSlot} ${leaving ? styles.hintLeaving : ""}`}><ConversationHint hint={painted} speaking={false} pending={pending && loadingVisible} /></div>;
}
