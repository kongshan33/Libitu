"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Mic, MicOff } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { stageCue } from "./conversation-view";
import { observeVisible } from "./visibility";
import styles from "./Speaking.module.css";

/** Display-only models. These are not the negotiated realtime wire contract. */
export type HintPresentation = {
  level: "reassurance" | "direction" | "opening" | "example";
  text: string;
  status?: "ready" | "loading" | "unavailable";
};
export type TargetPresentation = {
  id: string; stage: string; text: string; meaning?: string | null;
  used: boolean; modeled: boolean; current: boolean; status: string;
  actions?: ReactNode;
};

export function ConversationHeader({ title, loadoutHref, reportHref, practiceHref = "/", account }: {
  title?: string; loadoutHref: string; reportHref?: string; practiceHref?: string; account: ReactNode;
}) {
  return <header className={styles.header}>
    <div className={styles.headerIdentity}><BrandLogo className={styles.logo} /><span title={title}>{title}</span></div>
    <nav className={styles.stageNav} aria-label="Stages">
      <Link href={practiceHref}>Stage 1</Link><span aria-disabled="true">Stage 2</span>
      <Link href={loadoutHref}>Stage 3</Link><span aria-current="step">Stage 4</span>
      {reportHref ? <Link href={reportHref}>Stage 5</Link> : <span aria-disabled="true">Stage 5</span>}
    </nav>
    <div className={styles.headerLinks}><Link href="/corpus">Corpus</Link><Link href="/profile">My learning</Link>{account}</div>
  </header>;
}

export function MissionIntro({ goal, metadata, setting, actions }: { goal: string; metadata: string; setting?: string; actions: ReactNode }) {
  return <div className={styles.missionHeader}><div className={styles.mission}>
    <span className={styles.eyebrow}>Stage 4 · Conversation</span><h1>{goal}</h1>
    <p className={styles.metadata}>{metadata}</p>{setting ? <p>{setting}</p> : null}
  </div><div className={styles.missionActions}>{actions}</div></div>;
}

export function StageGuide({ title, steps, currentIndex = null, statuses }: {
  title: string; steps: string[]; currentIndex?: number | null; statuses?: string[];
}) {
  const current = currentIndex === null ? undefined : steps[currentIndex];
  const cue = stageCue(current);
  return <section className={styles.logic} aria-label="Conversation strategy">
    <div><strong>{title}</strong><span>Practice guide</span></div>
    <ol>{steps.map((step, index) => <li key={`${index}:${step}`} aria-current={index === currentIndex ? "step" : undefined} data-state={statuses?.[index] ?? "pending"}>
      <i aria-hidden="true" /><span>{step}</span>{index < steps.length - 1 ? <b aria-hidden="true" /> : null}
    </li>)}</ol>
    {cue ? <p className={styles.stageCue}>{current} · {cue}</p> : null}
  </section>;
}

export function ConversationToolbar({ view, onView, status, online, actions }: {
  view: "voice" | "chat"; onView: (view: "voice" | "chat") => void; status: string; online: boolean; actions?: ReactNode;
}) {
  return <div className={styles.toolbar}>
    <div className={styles.views} role="group" aria-label="Conversation mode">
      {(["voice", "chat"] as const).map(value => <button type="button" key={value} aria-pressed={view === value} onClick={() => onView(value)}>{value === "voice" ? "Voice" : "Chat"}</button>)}
    </div><div className={styles.connection} role="status"><i className={online ? styles.connectedDot : styles.dot} aria-hidden="true" />{status}<span> · AI partner</span></div>{actions}
  </div>;
}

export function VoiceSurface({ phase, speaker, utterance, recast, hint, controls, action }: {
  phase: string; speaker?: string; utterance?: ReactNode; recast?: ReactNode;
  hint?: ReactNode; controls?: ReactNode; action?: ReactNode;
}) {
  return <div className={styles.voice} data-phase={phase}>
    <div className={styles.orb} role="img" aria-label="AI partner" />
    {utterance ? <div className={styles.currentUtterance}><span className={styles.eyebrow}>{speaker ?? "AI partner · now"}</span><div className={styles.currentText}>{utterance}</div></div> : null}
    {recast}{hint}{action}{controls}
  </div>;
}

export function MicrophoneButton({ enabled, disabled, onClick, large = false }: { enabled: boolean; disabled?: boolean; onClick: () => void; large?: boolean }) {
  return <button type="button" className={`${styles.micButton} ${large ? styles.largeMic : ""}`} aria-label={enabled ? "Mute microphone" : "Enable microphone"} aria-pressed={enabled} disabled={disabled} onClick={onClick}>
    {enabled ? <Mic size={large ? 28 : 22} aria-hidden="true" /> : <MicOff size={large ? 28 : 22} aria-hidden="true" />}
  </button>;
}

/** Static waveform only communicates activity, never pretends to measure audio. */
export function MicrophoneBar({ enabled, disabled, onClick, status, active }: { enabled: boolean; disabled?: boolean; onClick: () => void; status: string; active: boolean }) {
  return <div className={styles.microphoneBar}>
    <div className={styles.activityBars} data-active={active} aria-hidden="true">{[10, 18, 28, 16, 34, 22, 12, 30, 38, 20, 14, 26, 34, 18, 10, 24, 32, 16, 12, 28, 36, 20, 14, 30, 22, 12, 26, 34, 18, 10].map((height, index) => <i key={index} style={{ height: active ? height : 6 }} />)}</div>
    <span>{status}</span><MicrophoneButton enabled={enabled} disabled={disabled} onClick={onClick} />
  </div>;
}

export function ConversationHint({ hint, speaking, pending = false }: { hint: HintPresentation | null; speaking: boolean; pending?: boolean }) {
  if (!hint || speaking) return null;
  const label = { reassurance: "", direction: "You could…", opening: "You could start with", example: "For example" }[hint.level];
  return <section className={styles.inlineHint} aria-label="Speaking hint" aria-live="polite" aria-busy={pending || hint.status === "loading"}>
    {hint.status === "loading" ? <p className={styles.meta}>Finding a little help…</p> : hint.status === "unavailable" ? <p className={styles.meta}>Help is unavailable. You can try again.</p> : <>{label ? <span className={styles.meta}>{label}</span> : null}<p className={hint.level === "reassurance" ? styles.meta : undefined}>{hint.text}</p></>}
  </section>;
}

export function RecastLine({ text, changes, voice = false }: { text: string; changes: { start: number; end: number }[]; voice?: boolean }) {
  const pieces: ReactNode[] = []; let cursor = 0;
  for (const span of changes) {
    if (span.start < cursor || span.end <= span.start || span.end > text.length) continue;
    pieces.push(text.slice(cursor, span.start), <strong key={span.start}>{text.slice(span.start, span.end)}</strong>); cursor = span.end;
  }
  pieces.push(text.slice(cursor));
  return <div className={styles.recast}><p className={styles.meta}>{voice ? "Your last turn, another way to say it" : "Another way to say it"}</p><p>{pieces}</p></div>;
}

export function StageDivider({ label }: { label: string }) {
  return <div className={styles.stageDivider}><span>{label}</span></div>;
}

export function ConversationMessage({ speaker, user, children, recast, id, note }: {
  speaker: string; user?: boolean; children: ReactNode; recast?: ReactNode; id?: string; note?: ReactNode;
}) {
  return <article id={id} className={`${styles.message} ${user ? styles.userMessage : styles.aiMessage}`}>
    <span className={styles.speaker}>{speaker}</span><div className={styles.messageBody}>{children}{recast}{note}</div>
  </article>;
}

function TargetTitle({ target, active, onShown }: { target: TargetPresentation; active: boolean; onShown?: (id: string) => void }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (active && onShown && ref.current) return observeVisible(ref.current, () => onShown(target.id));
  }, [active, onShown, target.id, target.text]);
  return <h3 ref={ref}>{target.text}</h3>;
}

export function TargetPanel({ targets, reveal, onReveal, active, onShown, footer }: {
  targets: TargetPresentation[]; reveal: boolean; onReveal: () => void; active: boolean; onShown?: (id: string) => void; footer?: ReactNode;
}) {
  return <>
    <div className={styles.sidebarHeading}><h2>Your targets</h2><span>{targets.filter(target => target.used).length} of {targets.length} used</span>
      {targets.length ? <button type="button" aria-pressed={reveal} onClick={onReveal}>{reveal ? "Hide targets" : "Show targets"}</button> : null}</div>
    <section className={styles.targetList} aria-label="Mission targets">{targets.map(target => {
      const visible = reveal || target.modeled || target.used;
      return <article className={styles.languageCard} key={target.id} data-current={target.current} data-target-id={target.id}>
        <span className={styles.eyebrow}>{target.stage}</span>
        {visible ? <TargetTitle target={target} active={active} onShown={onShown} /> : <h3 className={styles.hiddenTarget}>Hidden until you ask</h3>}
        {visible && target.meaning ? <p>{target.meaning}</p> : null}<p className={styles.targetStatus}>{target.status}</p>{target.actions}
      </article>;
    })}</section>
    <p className={styles.meta}>{targets.length ? "Targets are matched to the stage where they fit best." : "Free conversation · no selected targets."}</p>{footer}
  </>;
}
