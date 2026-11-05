"use client";

import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

import { Textarea } from "@/components/ui/field";

import { Button } from "@/components/ui/button";

import Link from "@/components/ui/PrefetchLink";
import { useEffect, useRef, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import type { CorpusSelectionAnalysis, CorpusSelectionContext, FunctionalTag } from "@libitu/types/stage-one";
import type { CorpusEdit, SavedCorpusRecord } from "./corpus-storage";
import { CorpusDetailViews, CorpusSourceContext } from "./CorpusDetailViews";
import detailStyles from "./CorpusDetail.module.css";
import { analyzeCorpusSelection } from "../stage-one/api/stage-one-api";
import { expressionText } from "../loadout/draft";
import { functionalTags, sourceHref } from "./library";
import styles from "./CorpusLibrary.module.css";

type Props = {
  record: SavedCorpusRecord; busy: boolean; error: string | null; initialEdit: boolean;
  onClose(): void;
  onUpdate(record: SavedCorpusRecord, edit: CorpusEdit): Promise<boolean>;
  onRemove(record: SavedCorpusRecord): Promise<boolean>;
  onHydrate(record: SavedCorpusRecord, context: CorpusSelectionContext, analyze: () => Promise<CorpusSelectionAnalysis>): Promise<SavedCorpusRecord | null>;
};
export function CorpusItemDialog({ record, busy, error, initialEdit, onClose, onUpdate, onRemove, onHydrate }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState(initialEdit);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<CorpusEdit>(() => ({ text: expressionText(record), meaning: record.item.meaning ?? "", usageNote: record.item.usageNote ?? "", tags: record.item.tags, slots: record.item.slots ?? {} }));
  const [slots, setSlots] = useState(JSON.stringify(record.item.slots ?? {}, null, 2));
  const started = useRef(false);
  const detail = record.item.analysisDetail;
  const original = record.item.sourceText;
  const href = sourceHref(record);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => { node?.close(); }; }, []);
  async function hydrate() {
    if (!original || busy) return;
    setNotice(null);
    const context: CorpusSelectionContext = { contentId: record.contentId, selectedText: original, currentSentence: original,
      timestamp: record.item.meta.match(/^\s*(\d{1,2}:\d{2}(?::\d{2})?)/)?.[1] };
    const result = await onHydrate(record, context, () => analyzeCorpusSelection(context));
    if (!result) setNotice("Analysis could not be loaded. Please retry.");
  }
  useEffect(() => {
    if (started.current || editing || detail || !original || busy) return;
    started.current = true;
    void hydrate();
  });
  async function save() {
    setNotice(null);
    try {
      const parsed = JSON.parse(slots) as unknown;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object" || !Object.values(parsed).every((value) => typeof value === "string")) throw new Error("Slots must be an object with text values, for example {\"A\": \"a concern\"}.");
      if (!draft.text.trim()) throw new Error("Enter an expression or structure.");
      if (await onUpdate(record, { ...draft, text: draft.text.trim(), slots: parsed as Record<string, string> })) { setEditing(false); setNotice("Changes saved."); }
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Could not save changes."); }
  }
  return <dialog ref={dialog} className={detailStyles.dialog} aria-labelledby="library-detail-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className={detailStyles.shell}>
    <header className={detailStyles.header}><div><span className={styles.eyebrow}>{record.item.kind} · {editing ? "Edit saved item" : "Corpus detail"}</span><h2 id="library-detail-title">{expressionText(record)}</h2><p className={detailStyles.meta}>{[record.item.level ?? detail?.analysis.fields.level, record.item.register ?? detail?.analysis.fields.register, ...(record.item.tags.length ? record.item.tags : detail?.analysis.fields.tags ?? [])].filter(Boolean).join(" · ")}</p></div><Button variant="ghost" size="inherit" type="button" className={styles.iconButton} disabled={busy} aria-label="Close corpus detail" onClick={onClose}><X size={20} aria-hidden="true" /></Button></header>
    <div className={detailStyles.scroll}>
    <div className={editing || error || notice ? styles.dialogBody : undefined}>
      {error ? <p role="alert" className="ui-retry-notice">{error}</p> : null}
      {notice ? <p role="status" className={styles.notice}>{notice}</p> : null}
      {editing ? <form onSubmit={(event) => { event.preventDefault(); void save(); }} className={styles.form}>
        <label>Expression or structure<Textarea aria-label="Expression or structure" required maxLength={2000} value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} /></label>
        <label>Meaning<Textarea aria-label="Meaning" maxLength={4000} value={draft.meaning} onChange={(event) => setDraft({ ...draft, meaning: event.target.value })} /></label>
        <label>Usage note<Textarea aria-label="Usage note" maxLength={4000} value={draft.usageNote} onChange={(event) => setDraft({ ...draft, usageNote: event.target.value })} /></label>
        <fieldset className={styles.tagEditor}><legend>Functional tags</legend>{[...new Set([...functionalTags, ...record.item.tags])].map((tag) => <label key={tag}><input type="checkbox" checked={draft.tags.includes(tag)} onChange={() => setDraft({ ...draft, tags: draft.tags.includes(tag) ? draft.tags.filter((value) => value !== tag) : [...draft.tags, tag as FunctionalTag] })} />{tag}</label>)}</fieldset>
        {record.item.kind === "structure" ? <label>Slots (JSON)<Textarea aria-label="Slots (JSON)" value={slots} onChange={(event) => setSlots(event.target.value)} spellCheck={false} /></label> : null}
        <p className={styles.help}>The original source and its analysis stay attached as evidence. Your edits update the saved item used in future missions.</p>
        <div className={`${styles.actions} ui-button-group`}><Button variant="secondary" size="md" type="button" disabled={busy} onClick={() => { setEditing(false); setNotice(null); }}>Cancel edit</Button><Button variant="primary" size="md" type="submit" loading={busy} loadingLabel="Saving…">Save changes</Button></div>
      </form> : null}
    </div>
    {!editing ? <>
      {detail ? <>
        <CorpusSourceContext context={detail.context} kind={record.item.kind} title={record.sourceTitle}
          onSeek={/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(record.sourceUrl) ? time => {
            const seconds = time.split(":").reduce((total, part) => total * 60 + Number(part), 0);
            const url = new URL(record.sourceUrl); url.searchParams.set("t", String(Math.floor(seconds)));
            window.open(url.href, "_blank", "noopener,noreferrer");
          } : undefined} />
        {detail.analysis.providerNotice ? <p className={detailStyles.notice}>{detail.analysis.providerNotice}</p> : null}
        <CorpusDetailViews analysis={detail.analysis} context={detail.context} disabled={busy}
          onAnalysis={analysis => onUpdate(record, { text: expressionText(record), meaning: record.item.meaning ?? "", usageNote: record.item.usageNote ?? "", tags: record.item.tags, slots: record.item.slots ?? {}, analysisDetail: { ...detail, analysis } })}
          onSaveNote={async note => {
            const usageNote = [record.item.usageNote, note].filter(Boolean).join("\n\n");
            if (usageNote.length > 4000) { setNotice("Your note is too long. Edit it before adding this answer."); return false; }
            return onUpdate(record, { text: expressionText(record), meaning: record.item.meaning ?? "", usageNote, tags: record.item.tags, slots: record.item.slots ?? {} });
          }} />
      </> : busy ? <div className={detailStyles.panel}><ContentSkeleton label="Loading original analysis…" rows={1} /></div> : original ? <div className={detailStyles.panel}><Button variant="secondary" size="md" type="button" onClick={() => void hydrate()}>Load original analysis</Button></div> : <p className={detailStyles.notice}>Full analysis is unavailable without saved source evidence. You can still edit and practice this item.</p>}
        <footer className={detailStyles.management}>
        {!detail ? <p className={styles.meaning}>{record.item.meaning || "No meaning saved."}</p> : null}
        {record.item.usageNote ? <div><h3>My note</h3><p style={{ whiteSpace: "pre-wrap" }}>{record.item.usageNote}</p></div> : null}
        <div className={`${styles.actions} ui-button-group`}><Button variant="secondary" size="md" type="button" disabled={busy} onClick={() => { setDraft({ text: expressionText(record), meaning: record.item.meaning ?? "", usageNote: record.item.usageNote ?? "", tags: record.item.tags, slots: record.item.slots ?? {} }); setSlots(JSON.stringify(record.item.slots ?? {}, null, 2)); setEditing(true); }}>Edit item</Button><Button variant="danger" size="md" type="button" disabled={busy} onClick={() => setConfirmDelete(true)}>Delete item</Button></div>
        {confirmDelete ? <div className={styles.deleteNotice} role="alert"><p>Delete this saved item? Its source and past mission transcripts will remain.</p><div className={`${styles.actions} ui-button-group`}><Button variant="secondary" size="md" type="button" disabled={busy} onClick={() => setConfirmDelete(false)}>Keep item</Button><Button variant="danger-solid" size="md" type="button" disabled={busy} loading={busy} loadingLabel="Deleting…" onClick={async () => { if (await onRemove(record)) onClose(); }}>Confirm delete</Button></div></div> : null}
        {href ? <p><Link href={href} {...(href.startsWith("/") ? {} : { target: "_blank", rel: "noreferrer" })}>Open source <ExternalLink size={14} aria-hidden="true" /></Link></p> : null}

        </footer>
      </> : null}
    </div>
    </div>
  </dialog>;
}
