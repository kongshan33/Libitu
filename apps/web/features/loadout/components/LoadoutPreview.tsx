"use client";
import { useContentMotion } from "@/components/ui/use-content-motion";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, X } from "lucide-react";
import type { SpeakingLogicTemplate } from "@libitu/types/speaking";
import type { SavedCorpusRecord } from "../../corpus/corpus-storage";
import { currentCandidate, expressionText, resolveSelection, type LoadoutDraft } from "../draft";
import { targetStage } from "../quick-start";
import styles from "./Loadout.module.css";

export function LoadoutPreview({ draft, records, logic, suggested, onRemove, submitting, children }: {
  draft: LoadoutDraft; records: SavedCorpusRecord[]; logic?: SpeakingLogicTemplate; suggested: boolean;
  onRemove(key: string): void; submitting: boolean; children: React.ReactNode;
}) {
  const selection = resolveSelection(draft, records);
  const slotsRef = useContentMotion<HTMLElement>(selection.selected.map(slot => slot.key).join("|"));
  const candidate = currentCandidate(draft, records, logic);
  return <aside className={styles.preview} aria-label="Loadout preview">
    <div className={styles.eyebrow}>Loadout preview</div>
    <h2>{draft.freeConversation ? "Free conversation" : "Your mission"}</h2>
    <div className={styles.setupBadges}><span>{draft.scenarioType === "workplace" ? "Workplace" : draft.scenarioType === "travel" ? "Travel" : "Daily life"}</span><span>{{ guided: "Guided", standard: "Natural", challenging: "Stretch" }[draft.difficulty]}</span><span>{draft.feedbackLevel} feedback</span></div>
    <section ref={slotsRef} className={styles.slots} aria-label="Selected targets">
      {selection.selected.flatMap(slot => {
        if (!slot.record) return [];
        const text = expressionText(slot.record);
        const index = draft.targetStages?.[slot.key];
        const stage = draft.targetStages && slot.key in draft.targetStages ? index == null ? "Any stage" : logic?.steps[index] ?? "Any stage" : targetStage(slot.record, logic);
        return <div className={`${styles.slot} ${styles.filledSlot}`} key={slot.key}><div className={styles.slotText}><strong>{text}</strong><span>{stage}{suggested ? " · AI pick" : ""}</span></div><Button variant="ghost" size="md" type="button" className={styles.remove} aria-label={`Remove ${text} from loadout`} disabled={submitting} onClick={() => onRemove(slot.key)}><X size={15} aria-hidden="true" /></Button></div>;
      })}
      {draft.freeConversation ? <p className={styles.fieldHelp}>No targets. Follow the conversation wherever it goes.</p> : null}
    </section>
    <div className={styles.previewLogic}><h3>Logic</h3><div className={styles.logicPreview}>
      <strong>{draft.freeConversation ? "None" : logic?.title ?? "Let the conversation flow"}</strong>
      <span>{draft.freeConversation ? "Follow the conversation naturally" : logic?.steps.join(" → ") ?? "No template selected"}</span>
    </div></div>
    {candidate ? <p className={styles.goalPreview}>{candidate.title} · {candidate.goal}</p> : null}
    <p className={styles.preparationNote}>{suggested ? "These are your Quick start picks. Choose your own below to build a different mission." : draft.freeConversation ? "Your conversation settings still apply." : "Your chosen targets stay selected when you browse or shuffle suggestions."}</p>
    {selection.missing.length ? <div className={styles.missing} role="status"><strong>Unavailable selections</strong><p>These items were removed or could not be loaded.</p>{selection.missing.map(({ key }, index) => <Button variant="secondary" size="md" type="button" key={key} disabled={submitting} onClick={() => onRemove(key)}>Remove unavailable item {index + 1}</Button>)}</div> : null}
    <div className={styles.startArea}>{children}</div>
  </aside>;
}

export function StartIcon() { return <ArrowUpRight size={17} aria-hidden="true" />; }
