"use client";

import { useState } from "react";
import { ArrowUp, ChevronDown, Pause, Square } from "lucide-react";
import Link from "next/link";
import { ConversationHeader, MissionIntro, StageGuide, ConversationToolbar, VoiceSurface, MicrophoneButton, MicrophoneBar, ConversationHint, ConversationMessage, RecastLine, StageDivider, TargetPanel, type HintPresentation } from "../ConversationPresentation";
import { freeHints, hints, previewStates, scene, targets, type PreviewState } from "./fixtures";
import styles from "../Speaking.module.css";

function ModelText({ text, phrase }: { text: string; phrase: string }) {
  const start = text.indexOf(phrase);
  return start < 0 ? text : <>{text.slice(0, start)}<mark className={styles.modelMark}>{phrase}</mark>{text.slice(start + phrase.length)}</>;
}

export function ConversationPreview() {
  const [state, setState] = useState<PreviewState>("live");
  const [view, setView] = useState<"voice" | "chat">("voice");
  const [hint, setHint] = useState<HintPresentation | null>(null);
  const [reveal, setReveal] = useState(true);
  const [targetsOpen, setTargetsOpen] = useState(false);
  const [microphone, setMicrophone] = useState(true);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [skipped, setSkipped] = useState(false);
  const ready = state === "ready" || state === "connecting";
  const ended = state === "completed";
  const speaking = state === "speaking";
  const offline = ready || ended || state === "paused" || state === "error";
  const status = state === "connecting" ? "Connecting…" : state === "paused" ? "Paused" : ended ? "Completed" : offline ? "Offline" : state === "silence" ? "Waiting for you" : microphone ? "Listening" : "Microphone off";
  const help = !offline && !draft && !speaking ? hint : null;
  const label = help?.status === "unavailable" ? "Try hint again" : help?.level === "direction" ? "Opening words" : help?.level === "opening" ? "See an example" : help?.level === "example" ? "Hide hint" : "Need a hint?";
  const text = speaking ? scene.partial : state === "free" ? "What is something you enjoyed this week?" : state === "silence" ? scene.simpler : scene.partner;
  const recast = <RecastLine voice={view === "voice"} text={scene.recast} changes={[{ start: 11, end: 18 }]} />;
  const startLabel = state === "paused" ? "Resume conversation" : state === "error" ? "Reconnect" : state === "connecting" ? "Connecting…" : "Start conversation";

  function chooseState(next: PreviewState) {
    setState(next); setDraft(""); setMessages([]); setSkipped(false);
    setMicrophone(!["ready", "connecting", "paused", "error", "completed"].includes(next));
    setHint(next in hints ? hints[next as keyof typeof hints] : next === "silence" ? { level: "reassurance", text: "Take your time." }
      : next === "hint_loading" ? { level: "direction", text: "", status: "loading" }
        : next === "hint_error" ? { level: "direction", text: "", status: "unavailable" } : null);
  }
  function advanceHint() {
    if (speaking || offline || draft) return;
    const content = state === "free" ? freeHints : hints;
    setHint(help?.status === "unavailable" ? content.direction : help?.level === "direction" ? content.opening : help?.level === "opening" ? content.example : help?.level === "example" ? null : content.direction);
  }
  const start = <button type="button" className={styles.primary} disabled={state === "connecting"} onClick={() => chooseState("live")}>{startLabel}</button>;
  const previewTargets = state === "free" ? [] : targets.map(target => ({ ...target,
    used: !ready && target.used, modeled: !ready && state !== "uncertain" && target.modeled,
    current: !ready && target.current,
    status: ready ? "Not started" : target.current && skipped ? "Skipped" : target.current && state === "uncertain" ? "Example delivery uncertain" : target.status,
    actions: !ready && target.current && !ended ? <div className={styles.targetActions}><button type="button" className={styles.itemHelp} disabled={offline || speaking || skipped || !!draft} onClick={advanceHint}>Hint</button><button type="button" className={styles.itemHelp} disabled={offline} onClick={() => { setSkipped(value => !value); setHint(null); }}>{skipped ? "Undo skip" : "Doesn’t fit this scene"}</button></div> : null,
  }));

  return <><ConversationHeader title={scene.goal} loadoutHref="/loadout" account={<span className={styles.previewAvatar} aria-label="Preview account">S</span>} />
    <main className={styles.page}><section className={styles.shell} aria-label="Speaking mission preview">
      <div className={styles.previewTools} role="group" aria-label="Prototype state">
        <span className={styles.eyebrow}>Prototype state</span>{previewStates.map(([value, label]) => <button type="button" key={value} aria-pressed={state === value} onClick={() => chooseState(value)}>{label}</button>)}
        <p>Simulated UI preview · no microphone, provider connection, or saved learner data. Silence and hint states are selected manually.</p>
      </div>
      <MissionIntro goal={state === "free" ? "A conversation at your own pace." : scene.goal} metadata={ended ? "Saved conversation · read-only review" : scene.metadata} setting={state === "free" ? undefined : scene.setting} actions={<><Link href="/loadout">Back to loadout</Link>{!ended ? <button type="button" onClick={() => chooseState("completed")}>End mission</button> : null}</>} />
      {state !== "free" ? <StageGuide title="Persuasive pitch" steps={[...scene.stages]} currentIndex={ready ? null : 1} statuses={ready ? undefined : ["completed", "current", "pending", "pending"]} /> : null}
      <div className={styles.workspace}><section className={styles.conversation} aria-label="Conversation">
        <ConversationToolbar view={view} onView={setView} status={status} online={!offline} actions={<button type="button" className={styles.trainingToggle} aria-expanded={targetsOpen} aria-controls="preview-targets" onClick={() => setTargetsOpen(value => !value)}>Targets<ChevronDown size={14} aria-hidden="true" /></button>} />
        {state === "paused" || state === "error" ? <div className={styles.connectionNotice}><div><strong>{state === "paused" ? "Conversation paused" : "Connection lost"}</strong><p>Your transcript is saved. {state === "paused" ? "Resume when you are ready." : "Reconnect to continue."}</p></div>{start}</div> : null}
        {view === "voice" ? <VoiceSurface phase={speaking ? "listening" : "idle"} speaker={speaking ? "You · now" : "AI partner · now"}
          utterance={!ready ? <ModelText text={messages.at(-1) ?? text} phrase={state === "uncertain" || state === "free" || speaking || messages.length ? "__none__" : "zero-sum game"} /> : undefined}
          recast={!ready && !speaking && !messages.length && state !== "free" ? recast : undefined}
          hint={<ConversationHint hint={help} speaking={speaking} />} action={ready ? start : undefined}
          controls={!offline ? <div className={styles.voiceControls}><MicrophoneButton large enabled={microphone} onClick={() => setMicrophone(value => !value)} /><div className={styles.voiceActions}><button type="button" className={styles.quiet} onClick={() => chooseState("paused")}><Pause size={12} />Pause conversation</button></div></div> : undefined} />
          : <div className={styles.chat} aria-label="Conversation transcript">
            {ready ? <div className={styles.chatEmpty}><h2>Ready when you are</h2>{start}</div> : <>
              <ConversationMessage speaker="Partner"><div className={styles.bubble}>{state === "free" ? "How has your week been?" : scene.opening}</div></ConversationMessage>
              <ConversationMessage speaker="You" user recast={state !== "free" ? recast : undefined}><div className={styles.bubble}>{state === "free" ? "It has been a busy week, but I had some time to relax." : <ModelText text={scene.user} phrase="eke out a beachhead" />}</div></ConversationMessage>
              {state !== "free" ? <StageDivider label="Tension" /> : null}
              <ConversationMessage speaker="Partner"><div className={styles.bubble}><ModelText text={state === "free" ? text : state === "silence" ? scene.simpler : scene.partner} phrase={state === "uncertain" || state === "free" ? "__none__" : "zero-sum game"} /></div></ConversationMessage>
              {speaking ? <ConversationMessage speaker="You" user><div className={styles.bubble}>{scene.partial}</div></ConversationMessage> : null}
              {messages.map((message, index) => <ConversationMessage key={index} speaker="You" user><div className={styles.bubble}>{message}</div></ConversationMessage>)}
            </>}
          </div>}
        {view === "chat" ? <ConversationHint hint={help} speaking={speaking} /> : null}
        {!ended ? <div className={styles.composerArea}>
          {view === "chat" ? <MicrophoneBar enabled={microphone} disabled={state === "connecting"} onClick={() => { if (offline) chooseState("live"); else setMicrophone(value => !value); }} status={status} active={!offline && microphone} /> : null}
          <form className={styles.composer} onSubmit={event => { event.preventDefault(); if (draft.trim()) { setMessages(values => [...values, draft.trim()]); setDraft(""); setHint(null); setView("chat"); } }}><textarea aria-label="Message your AI partner" rows={1} maxLength={4000} placeholder={view === "voice" ? "Or send a message…" : "Type a reply…"} value={draft} onChange={event => { setDraft(event.target.value); setHint(null); }} /><button type="submit" className={styles.sendButton} aria-label="Send message" disabled={!draft.trim() || offline}><ArrowUp size={18} /></button></form>
          <div className={styles.composerHelp}><span>Transcript is saved. Audio is not retained by Libitu.</span><button type="button" disabled={offline || speaking || !!draft || hint?.status === "loading"} onClick={advanceHint}>{label}</button></div>
        </div> : <div className={styles.review}><Square size={14} /><p>Mission complete. This preview has no saved report.</p></div>}
      </section><aside id="preview-targets" className={`${styles.sidebar} ${targetsOpen ? styles.sidebarOpen : ""}`} aria-label="Training sidebar"><TargetPanel targets={previewTargets} reveal={reveal} onReveal={() => setReveal(value => !value)} active={false} /></aside></div>
    </section></main></>;
}
