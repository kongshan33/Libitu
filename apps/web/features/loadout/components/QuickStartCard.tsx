"use client";
import { useContentMotion } from "@/components/ui/use-content-motion";
import { Button } from "@/components/ui/button";

import { Zap } from "lucide-react";
import type { ReactNode } from "react";
import type { SpeakingLogicTemplate } from "@libitu/types";
import type { SavedCorpusRecord } from "../../corpus/corpus-storage";
import { expressionText } from "../draft";
import styles from "./QuickStart.module.css";

export function QuickStartCard({ picks, logic, scene, scenarioLabel, difficultyLabel, feedbackLabel, disabled, startDisabled = false, busy, manualSelectionActive = false, adjustOpen = false, children, onStart, onShuffle, onAdjust }: {
  picks: { record: SavedCorpusRecord; stage: string; reason: string }[];
  logic?: SpeakingLogicTemplate;
  scene: string;
  scenarioLabel: string;
  difficultyLabel: string;
  feedbackLabel: string;
  disabled: boolean;
  startDisabled?: boolean;
  busy: boolean;
  manualSelectionActive?: boolean;
  adjustOpen?: boolean;
  children?: ReactNode;
  onStart(): void;
  onShuffle(): void;
  onAdjust(): void;
}) {
  const unavailable = disabled || busy;
  const planRef = useContentMotion(JSON.stringify([picks.map(pick => pick.record.key), scene, logic?.id]));

  return <section className={styles.hero} aria-label="Quick start" aria-busy={busy}>
    <div className={styles.heroHeading}>
      <h2><Zap size={15} aria-hidden="true" />Quick start</h2>
      <span>{manualSelectionActive ? "Start here to use these suggested picks" : picks.length ? "Picked from your saved corpus" : "Your next conversation starts here"}</span>
    </div>

    <div ref={planRef} className={styles.heroPlan}>
      {picks.length ? <ul className={styles.picks}>
        {picks.map(({ record, stage, reason }) => <li className={styles.pick} key={record.key}>
          <span className={styles.stage}>{stage}</span>
          <strong>{expressionText(record)}</strong>
          <span className={styles.reason}>{reason}</span>
        </li>)}
      </ul> : <div className={styles.emptyPicks}>
        <strong>No saved targets yet</strong>
        <p>Save expressions while you learn to build your first quick-start mission.</p>
      </div>}
      {logic ? <div className={styles.logic}>
        <span className={styles.stage}>Logic</span>
        <strong>{logic.title}</strong>
        <span className={styles.chain}>{logic.steps.join(" → ")}</span>
      </div> : null}
      {scene ? <p className={styles.scene}><span>Scene idea:</span> {scene}</p> : null}
    </div>

    {adjustOpen ? children : null}

    <div className={`${styles.heroActions} ui-button-group`}>
      <Button variant="secondary" size="lg" type="button" className={`${styles.button} ${styles.heroStart}`} disabled={unavailable || startDisabled || !picks.length} loading={busy} loadingLabel="Preparing mission…" onClick={onStart}>
        Quick start
      </Button>
      <Button variant="secondary" size="lg" type="button" className={`${styles.button} ${styles.heroSecondary}`} disabled={unavailable || !picks.length} onClick={onShuffle}>
        Shuffle picks
      </Button>
      <Button variant="secondary" size="lg" type="button" className={`${styles.button} ${styles.heroSecondary}`} disabled={unavailable} onClick={onAdjust} aria-expanded={adjustOpen}>
        {adjustOpen ? "Done" : "Adjust"}
      </Button>
      <p className={styles.preferenceSummary}>{[scenarioLabel, difficultyLabel, feedbackLabel].filter(Boolean).join(" · ")}</p>
    </div>
  </section>;
}
