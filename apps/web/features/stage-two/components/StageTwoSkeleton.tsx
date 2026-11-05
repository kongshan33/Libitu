"use client";

import { useSyncExternalStore } from "react";
import { FlowNavigation } from "@/components/FlowNavigation";
import styles from "./StageTwoSkeleton.module.css";

const subscribe = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  window.addEventListener("libitu:stage-two-location", notify);
  return () => { window.removeEventListener("popstate", notify); window.removeEventListener("libitu:stage-two-location", notify); };
};
const readMode = () => new URLSearchParams(window.location.search).get("shadowMode") ?? "quick";

type View = "shadow" | "segments";

/** Show only the main regions; loading should not imitate every control or sentence. */
export function StageTwoSkeleton({ view = "shadow", label = "Loading practice…" }: { view?: View; label?: string }) {
  const mode = useSyncExternalStore(subscribe, readMode, () => "quick");
  return <section className={styles.practice} role="status" aria-label={label} aria-busy="true" data-practice-skeleton={view}>
    <span className={styles.srOnly}>{label}</span>
    <div className={styles.frame} aria-hidden="true">
      <div className="stage-two-shadow-header"><span className={styles.heading} /></div>
      {view === "segments" ? <div className={styles.picker}>
        <div className={styles.timeline} />
        <div className={styles.cards}><div className={styles.card} /><div className={styles.card} /><div className={styles.card} /></div>
      </div> : mode === "quick" ? <div className={styles.quick}>
        <span className={styles.caption} /><div className={styles.setup} />
        <div className={styles.action} />
      </div> : <div className={styles.workspace}>
        <aside className={styles.directory} data-skeleton-region="sentences"><div className={styles.sidebar} /></aside>
        <div className={styles.main}>
          <span className={styles.caption} />
          {mode !== "review" ? <div className={styles.media} data-skeleton-region="media" /> : null}
          <div className={styles.prompt} /><div className={styles.action} />
          <div className={styles.analysis} data-skeleton-region="analysis" />
        </div>
      </div>}

    </div>
  </section>;
}

export function StageTwoLoadingShell({ view }: { view: "shadow" | "segments" }) {
  return <main className="stage-page practice-redesign"><section className="reader-shell" aria-label="Loading Libitu">
    <FlowNavigation title="Practice" current={1} steps={[{ label: "Ingest" }, { label: "Shadow" }]} />
    <StageTwoSkeleton view={view} label={view === "segments" ? "Loading segments…" : "Loading practice…"} />
  </section></main>;
}
