"use client";

import { useEffect, useRef, useState } from "react";
import type { CorpusSelectionContext } from "@libitu/types/stage-one";
import { ArrowUp } from "lucide-react";
import { useDelayedPending } from "@/components/ui/use-delayed-pending";
import { Button } from "@/components/ui/button";
import { corpusContextPayload } from "../stage-one/api/stage-one-api";
import styles from "./CorpusDetail.module.css";
import { RestrictedMarkdown } from "./CorpusMarkdown";

type Turn = { question: string; answer: string };
export function CorpusFollowup({ context, comparison, suggestions, onSaveNote, disabled, noteIsDraft }: {
  context: CorpusSelectionContext; comparison?: string; suggestions?: string[]; onSaveNote(note: string): Promise<boolean>; disabled: boolean; noteIsDraft?: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [turn, setTurn] = useState<Turn | null>(null);
  const [history, setHistory] = useState<Turn[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming" | "complete" | "error">("idle");
  const answering = useDelayedPending(status === "streaming");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const request = useRef<AbortController | null>(null);
  const questions = suggestions?.length ? suggestions.slice(0, 3) : ["换成更口语的说法", "给我一段职场对话", comparison ? `和 ${comparison} 比较` : "这个表达可以怎样替换"];
  useEffect(() => () => request.current?.abort(), []);
  async function ask(value: string) {
    if (!value.trim() || request.current) return;
    const controller = new AbortController(); request.current = controller;
    const next = { question: value.trim(), answer: "" }; setTurn(next); setQuestion(value.trim());
    setStatus("streaming"); setError(""); setSaved(false);
    try {
      const response = await fetch(`${(process.env.NEXT_PUBLIC_LIBITU_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "")}/api/corpus/ask`, {
        method: "POST", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(90_000)]),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...corpusContextPayload(context), question: next.question, history: history.slice(-6) })
      });
      if (!response.ok || !response.body) throw new Error("Answer unavailable. Please retry.");
      const reader = response.body.getReader(); const decoder = new TextDecoder();
      let buffer = "", complete = false;
      try {
        while (true) {
          const { done, value: chunk } = await reader.read();
          buffer += decoder.decode(chunk, { stream: !done }).replace(/\r\n/g, "\n");
          let boundary: number;
          while ((boundary = buffer.indexOf("\n\n")) >= 0) {
            const frame = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
            const event = frame.match(/^event: (.+)$/m)?.[1];
            const raw = frame.split("\n").filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n");
            if (!raw) continue;
            const data = JSON.parse(raw) as { text?: string; message?: string };
            if (event === "error") throw new Error(data.message ?? "Answer interrupted. Please retry.");
            if (event === "delta") {
              next.answer += data.text ?? "";
              if (next.answer.length > 6000) throw new Error("Answer too long. Try a shorter question.");
              setTurn({ ...next });
            }
            if (event === "done") complete = true;
          }
          if (done) break;
        }
      } finally { await reader.cancel(); }
      if (!complete || !next.answer) throw new Error("Answer interrupted. Please retry.");
      if (!controller.signal.aborted) { setHistory(old => [...old, next].slice(-6)); setStatus("complete"); }
    } catch (reason) {
      if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : "Answer unavailable."); setStatus("error"); }
    } finally { if (!controller.signal.aborted) request.current = null; }
  }
  return <section className={styles.ask}>
    <h3>Ask about this</h3>
    <div className={styles.suggestions}>{questions.map(value => <button key={value} type="button" aria-pressed={question === value} disabled={status === "streaming" || saving} onClick={() => setQuestion(old => old === value ? "" : value)}>{value}</button>)}</div>
    <form data-input-group className={styles.askForm} onSubmit={event => { event.preventDefault(); void ask(question); }}>
      <input aria-label="Ask about this expression" placeholder={`Ask about “${context.selectedText}”…`} maxLength={500} value={question} onChange={event => setQuestion(event.target.value)} disabled={status === "streaming" || saving} />
      <Button variant="primary" size="sm" shape="circle" aria-label="Send question" disabled={!question.trim() || status === "streaming" || saving} type="submit"><ArrowUp size={16} /></Button>
    </form>
    {turn ? <div className={styles.answer}><p className={styles.summary}>{turn.question}</p><RestrictedMarkdown text={turn.answer} />
      <p className={`${styles.meta} ${styles.answerStatus}`} role="status">{status === "streaming" ? answering ? "Answering…" : null : saved && noteIsDraft ? "Save the item to keep this note." : ""}</p>
      {status === "complete" ? <button type="button" className={styles.noteAction} disabled={disabled || saved || saving} aria-busy={saving} onClick={async () => {
        setSaving(true); setError("");
        try { const ok = await onSaveNote(`${turn.question}\n${turn.answer}`); setSaved(ok); if (!ok) setError("Note could not be saved. Please retry."); }
        catch { setError("Note could not be saved. Please retry."); }
        finally { setSaving(false); }
      }}>{saving ? "Saving…" : saved ? noteIsDraft ? "Added to note draft" : "Saved to note" : "Save as note"}</button> : null}
    </div> : null}
    {error ? <div className="ui-retry-notice" role="alert"><p>{error}</p>
      {status === "error" ? <Button variant="secondary" size="md" onClick={() => void ask(turn?.question ?? question)}>Retry answer</Button> : null}
    </div> : null}
  </section>;
}
