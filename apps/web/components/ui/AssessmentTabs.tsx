"use client";

import type { CSSProperties } from "react";
import type { FeedbackDimensionId } from "@libitu/types/speaking";
import styles from "./AssessmentTabs.module.css";

type Dimension = { id: FeedbackDimensionId; label: string; score?: number | null; description: string };
export function AssessmentTabs({ dimensions, active, onChange, panelId, idPrefix, label }: {
  dimensions: Dimension[]; active: FeedbackDimensionId; onChange: (id: FeedbackDimensionId) => void;
  panelId: string; idPrefix: string; label: string;
}) {
  return <div className={styles.tabs} role="tablist" aria-label={label}>
    {dimensions.map((dimension, index) => {
      const available = typeof dimension.score === "number";
      return <button type="button" role="tab" key={dimension.id} id={`${idPrefix}-${dimension.id}`} aria-controls={panelId}
        aria-selected={active === dimension.id} tabIndex={active === dimension.id ? 0 : -1} onClick={() => onChange(dimension.id)}
        onKeyDown={event => {
          const next = event.key === "ArrowRight" ? (index + 1) % dimensions.length : event.key === "ArrowLeft" ? (index + dimensions.length - 1) % dimensions.length : event.key === "Home" ? 0 : event.key === "End" ? dimensions.length - 1 : null;
          if (next !== null) { event.preventDefault(); onChange(dimensions[next].id); document.getElementById(`${idPrefix}-${dimensions[next].id}`)?.focus(); }
        }}>
        <span className={styles.label}>{dimension.label}</span>
        <span className={styles.score}>{available ? <>{dimension.score}<small> / 100</small></> : <span className={styles.unassessed}>Not assessed</span>}</span>
        <span className={styles.track} data-empty={!available} aria-hidden="true">{available ? <i style={{ "--progress-scale": (dimension.score ?? 0) / 100 } as CSSProperties} /> : null}</span>
        <span className={styles.basis}>{dimension.description}</span>
      </button>;
    })}
  </div>;
}
