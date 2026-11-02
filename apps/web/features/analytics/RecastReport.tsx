"use client";

import type { ReactNode } from "react";
import type { FeedbackReference, SpeakingFeedback } from "@libitu/types/speaking";
import { validChangedSpans, validRecastReference } from "../speaking/recasts";
import styles from "./Analytics.module.css";

export function RecastReport({ report, onSelect }: { report: SpeakingFeedback; onSelect: (ref: FeedbackReference) => void }) {
  const recasts = (report.recasts ?? []).filter(row => validRecastReference(row.source, report.messages, "user") && validChangedSpans(row.replacement, row.changed_spans));
  if (!recasts.length) return null;
  return <section aria-label="Language refinements"><div className={styles.sectionHeading}><h2>Language refinements</h2><span className={styles.badge}>{recasts.length}</span></div>
    <p className={styles.explainer}>Small wording suggestions based on your turns. These do not change your transcript or count as language you used.</p>
    <div className={styles.refactors}>{recasts.map(row => {
      const pieces: ReactNode[] = []; let cursor = 0;
      for (const span of row.changed_spans) { pieces.push(row.replacement.slice(cursor, span.start), <strong key={span.start}>{row.replacement.slice(span.start, span.end)}</strong>); cursor = span.end; }
      pieces.push(row.replacement.slice(cursor));
      return <article className={styles.refactor} key={row.id}><div className={styles.refactorHeader}><span className={styles.badge}>{row.category === "grammar" ? "Grammar" : "Word choice"}</span><a href={`#source-${row.source.message_id}`} onClick={event => { event.preventDefault(); onSelect({ ...row.source, transcript_revision: row.source.revision }); }}>View source</a></div>
        <div className={styles.comparison}><div><h3>Your original words</h3><p>{row.source.quote}</p></div><div><h3>{row.delivered ? "Rephrased by your partner" : "Suggested wording"}</h3><p>{pieces}</p></div></div><p className={styles.refactorReason}>{row.reason}</p></article>;
    })}</div>
  </section>;
}
