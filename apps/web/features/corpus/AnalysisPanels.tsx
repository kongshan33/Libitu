"use client";

import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import type { CorpusKind, CorpusSelectionAnalysis } from "@libitu/types/stage-one";
import styles from "./CorpusDetail.module.css";

type SavePattern = (kind?: CorpusKind, text?: string, slots?: Record<string, string>) => void;

export function ExplainPanel({ analysis, isLoading, onSavePattern, saveDisabled }: {
  analysis: CorpusSelectionAnalysis; isLoading: boolean; onSavePattern?: SavePattern; saveDisabled?: boolean;
}) {
  const { explanation: e } = analysis;
  const patterns = analysis.reusablePatterns ?? analysis.syntaxAnalysis.reusablePatterns;
  return <div className={styles.analysis}>
    {analysis.teacherNote ? <p className={styles.teacher}>{analysis.teacherNote}</p> : null}
    {patterns.length ? <section><h2>Use it</h2>{patterns.map(pattern => <article key={pattern.template}>
      <p className={styles.pattern}>{pattern.template}</p>
      <dl className={styles.slots}>{Object.entries(pattern.slots).map(([slot, meaning]) => <div key={slot}><dt>{slot}</dt><dd>{meaning}</dd></div>)}</dl>
      {pattern.rationale ? <p>{pattern.rationale}</p> : null}
      {onSavePattern ? <Button variant="secondary" size="sm" disabled={isLoading || saveDisabled} onClick={() => onSavePattern("structure", pattern.template, pattern.slots)}>Save structure</Button> : null}
    </article>)}{analysis.collocations?.length ? <p className={styles.meta}>常见搭配 · {analysis.collocations.join(" · ")}</p> : null}</section> : null}
    <section><h2>Meaning</h2><p className={styles.summary}>{e.meaning}</p></section>
    <section><h2>Pronunciation</h2><div className={styles.pronunciation}>
      <span>{e.pronunciation.ipa}</span>{e.pronunciation.stressText ? <span>{e.pronunciation.stressText}</span> : null}
      <Button variant="secondary" size="sm" disabled={isLoading} onClick={() => speakText(e.pronunciation.audioText)}><Volume2 size={14} aria-hidden="true" />Play</Button>
    </div><p>{e.pronunciation.connectedSpeech}</p></section>
    {e.similarExpressions.length ? <section><h2>Similar expressions</h2><dl className={styles.alternatives}>{e.similarExpressions.map((expression, i) => {
      const [label, ...rest] = expression.split(/\s*[—–]\s*/);
      return <div key={i}><dt>{label}</dt>{rest.length ? <dd>{rest.join(" — ")}</dd> : null}</div>;
    })}</dl></section> : null}
    {e.examples.length ? <section><h2>Examples</h2>{e.examples.map((example, i) => <div className={styles.example} key={i}>
      <p>{example.english} {example.typical ? <span className={styles.meta}>typical</span> : null}</p><p>{example.chinese}</p>
    </div>)}{e.usageChips.length ? <p className={styles.meta}>{e.usageChips.join(" · ")}</p> : null}</section> : null}
    {analysis.pitfalls?.length ? <AnalysisList title="Watch out" items={analysis.pitfalls} /> : null}
  </div>;
}

export function SyntaxPanel({ analysis }: { analysis: CorpusSelectionAnalysis; isLoading: boolean; onSavePattern?: SavePattern; saveDisabled: boolean }) {
  const s = analysis.syntaxAnalysis;
  const phrase = analysis.selectionType === "phrase" && analysis.fields.kind !== "structure";
  return <div className={styles.analysis}>
    <section><h2>{phrase ? "Internal structure" : "Sentence structure"}</h2><p className={styles.summary}>{s.sentenceType}</p><Items items={s.structureBreakdown} /></section>
    <section><h2>{phrase ? "Role in the sentence" : "Grammar functions"}</h2><p className={styles.summary}>{s.mainClause}</p><Items items={s.grammarPoints} /></section>
    <AnalysisList title="Logic with nearby sentences" items={s.logicRelations} />
    {!phrase ? <>
      <AnalysisList title="Information hierarchy" items={s.informationHierarchy} />
      <AnalysisList title="Wording" items={s.wordingNotes} />
      <AnalysisList title="Sentence style" items={s.styleFeatures} />
      {s.translations.length ? <section><h2>Translations</h2><dl className={styles.slots}>{s.translations.map((t, i) => <div key={i}><dt>{t.label}{t.recommended ? " · 推荐" : ""}</dt><dd>{t.text}</dd></div>)}</dl><Items items={s.translationNotes} /></section> : null}
    </> : null}
  </div>;
}
function AnalysisList({ title, items }: { title: string; items: string[] }) {
  return items.length ? <section><h2>{title}</h2><Items items={items} /></section> : null;
}
function Items({ items }: { items: string[] }) { return items.length ? <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul> : null; }
function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}
