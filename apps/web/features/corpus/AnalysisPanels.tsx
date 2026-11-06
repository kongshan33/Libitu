"use client";

import { Button } from "@/components/ui/button";
import { CorpusPronunciation } from "./CorpusPronunciation";
import type { CorpusKind, CorpusSelectionAnalysis } from "@libitu/types/stage-one";
import styles from "./CorpusDetail.module.css";

type SavePattern = (kind?: CorpusKind, text?: string, slots?: Record<string, string>) => void;

export function ExplainPanel({ analysis, isLoading, onSavePattern, saveDisabled, active = true }: {
  analysis: CorpusSelectionAnalysis; isLoading: boolean; onSavePattern?: SavePattern; saveDisabled?: boolean; active?: boolean;
}) {
  const { explanation: e } = analysis;
  const patterns = analysis.reusablePatterns ?? analysis.syntaxAnalysis.reusablePatterns;
  return <div className={styles.analysis}>
    {analysis.teacherNote ? <p className={styles.teacher}>{analysis.teacherNote}</p> : null}
    {patterns.length ? <section><h3>Use it</h3>{patterns.map(pattern => <article key={pattern.template}>
      <p className={styles.pattern}>{pattern.template}</p>
      <dl className={styles.slots}>{Object.entries(pattern.slots).map(([slot, meaning]) => <div key={slot}><dt>{slot}</dt><dd>{meaning}</dd></div>)}</dl>
      {pattern.rationale ? <p>{pattern.rationale}</p> : null}
      {onSavePattern ? <Button variant="secondary" size="sm" disabled={isLoading || saveDisabled} onClick={() => onSavePattern("structure", pattern.template, pattern.slots)}>Save structure</Button> : null}
    </article>)}{analysis.collocations?.length ? <p className={styles.meta}>Common collocations · {analysis.collocations.join(" · ")}</p> : null}</section> : null}
    <section><h3>Meaning</h3><p className={styles.summary}>{e.meaningSummary || e.meaning}</p>{e.meaningSummary && e.meaning && e.meaning !== e.meaningSummary ? <p>{e.meaning}</p> : null}</section>
    <CorpusPronunciation key={e.pronunciation.audioText} pronunciation={e.pronunciation} disabled={isLoading} active={active} />
    {e.similarExpressions.length ? <section><h3>Similar expressions</h3><dl className={styles.alternatives}>{e.similarExpressions.map((expression, i) => {
      const [label, ...rest] = expression.split(/\s*[—–]\s*/);
      return <div key={i}><dt>{label}</dt>{rest.length ? <dd>{rest.join(" — ")}</dd> : null}</div>;
    })}</dl></section> : null}
    {analysis.pitfalls?.length ? <AnalysisList title="Pitfalls" items={analysis.pitfalls} /> : null}
    {e.examples.length ? <section><h3>Examples</h3>{e.examples.map((example, i) => <div className={styles.example} key={i}>
      <p>{example.english} {example.typical ? <span className={styles.meta}>typical</span> : null}</p><p>{example.chinese}</p>
    </div>)}</section> : null}
    {e.usageChips.length ? <p className={styles.meta}>{e.usageChips.join(" · ")}</p> : null}
  </div>;
}

export function SyntaxPanel({ analysis }: { analysis: CorpusSelectionAnalysis; isLoading: boolean; onSavePattern?: SavePattern; saveDisabled: boolean }) {
  const s = analysis.syntaxAnalysis;
  const summaries = s.sectionSummaries;
  const phrase = analysis.selectionType === "phrase" && analysis.fields.kind !== "structure";
  return <div className={styles.analysis}>
    <section><h3>{phrase ? "Internal structure" : "Sentence structure"}</h3><p className={styles.summary}>{summaries?.structure || s.sentenceType}</p>{summaries?.structure && s.sentenceType !== summaries.structure ? <p className={styles.meta}>{s.sentenceType}</p> : null}<Items items={s.structureBreakdown} /></section>
    <section><h3>{phrase ? "Role in the sentence" : "Grammar functions"}</h3>{summaries?.grammar ? <p className={styles.summary}>{summaries.grammar}</p> : null}<p className={phrase ? styles.summary : styles.syntaxMain}>{s.mainClause}</p><Items items={s.grammarPoints} /></section>
    <AnalysisList title="Logic with nearby sentences" summary={summaries?.logic} items={s.logicRelations} />
    {!phrase ? <>
      <AnalysisList title="Information hierarchy" summary={summaries?.information} items={s.informationHierarchy} />
      <AnalysisList title="Wording" summary={summaries?.wording} items={s.wordingNotes} />
      <AnalysisList title="Sentence style" summary={summaries?.style} items={s.styleFeatures} />
    </> : null}
    {s.translations.length ? <section><h3>Translations</h3><dl className={styles.slots}>{s.translations.map((t, i) => <div key={i}><dt>{t.label}{t.recommended ? " · Recommended" : ""}</dt><dd>{t.text}</dd></div>)}</dl><Items items={s.translationNotes} /></section> : null}
    {phrase ? <p className={styles.meta}>Select the whole sentence for a full syntax analysis.</p> : null}
  </div>;
}
function AnalysisList({ title, items, summary }: { title: string; items: string[]; summary?: string }) {
  return items.length || summary ? <section><h3>{title}</h3>{summary ? <p className={styles.summary}>{summary}</p> : null}<Items items={items} /></section> : null;
}
function Items({ items }: { items: string[] }) {
  return items.length ? <dl className={styles.syntaxRows}>{items.map((item, i) => {
    const [label, ...details] = item.split(/\s+[—–]\s+/);
    return <div key={i}>{details.length ? <><dt>{label}</dt><dd>{details.join(" — ")}</dd></> : <dd>{item}</dd>}</div>;
  })}</dl> : null;
}
