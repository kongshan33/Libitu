"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import type { LoadoutFunction } from "@libitu/types/speaking";
import type { SavedCorpusRecord } from "../../corpus/corpus-storage";
import { expressionText } from "../draft";
import { corpusFunctions, FUNCTION_LABELS } from "../quick-start";
import styles from "./QuickStart.module.css";

const UNLABELLED = "Function not yet labelled";

function functionLabel(value: string): string {
  return FUNCTION_LABELS[value as LoadoutFunction] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

export function CorpusDrawer({ records, selectedKeys, disabled, query: controlledQuery, onQueryChange, functionFilter, onFunctionFilterChange, onToggle, onClose }: {
  records: SavedCorpusRecord[];
  selectedKeys: string[];
  disabled: boolean;
  query?: string;
  onQueryChange?(query: string): void;
  functionFilter?: string;
  onFunctionFilterChange?(filter: string): void;
  onToggle(record: SavedCorpusRecord): void;
  onClose(): void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const searchId = useId();
  const countId = useId();
  const [localQuery, setLocalQuery] = useState("");
  const [localFilter, setLocalFilter] = useState("all");
  const query = controlledQuery ?? localQuery;
  const filter = functionFilter ?? localFilter;
  function setQuery(value: string) { setLocalQuery(value); onQueryChange?.(value); }
  function setFilter(value: string) { setLocalFilter(value); onFunctionFilterChange?.(value); }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  const selected = new Set(selectedKeys);
  const functionsByKey = new Map(records.map(record => [record.key, corpusFunctions(record)]));
  const availableFunctions = new Set([...functionsByKey.values()].flat());
  const functionTags = (Object.keys(FUNCTION_LABELS) as LoadoutFunction[]).filter(value => availableFunctions.has(value));
  const hasUnlabelled = [...functionsByKey.values()].some(functions => !functions.length);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const groups = new Map<string, SavedCorpusRecord[]>();
  for (const record of records) {
    const tags = functionsByKey.get(record.key)!;
    const group = filter === "all" ? tags[0] ?? UNLABELLED : filter;
    if (filter !== "all" && !(filter === UNLABELLED ? !tags.length : tags.some(tag => tag === filter))) continue;
    if (normalizedQuery && ![expressionText(record), record.item.meaning ?? "", ...record.item.tags, ...tags.map(functionLabel)].join(" ").toLocaleLowerCase().includes(normalizedQuery)) continue;
    const items = groups.get(group) ?? [];
    items.push(record);
    groups.set(group, items);
  }
  const selectionFull = selected.size >= 5;

  return <dialog ref={dialogRef} className={styles.drawer} aria-labelledby={titleId} aria-describedby={countId}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className={styles.drawerPanel}>
      <header className={styles.drawerHeader}>
        <div className={styles.drawerTitle}>
          <h2 id={titleId}>All corpus</h2>
          <button className={styles.closeButton} type="button" aria-label="Close corpus drawer" onClick={onClose}><X size={17} aria-hidden="true" /></button>
        </div>
        <label className={styles.searchLabel} htmlFor={searchId}>Search corpus</label>
        <div className={styles.searchField}>
          <input id={searchId} type="search" placeholder="Expression, meaning or function" value={query} onChange={event => setQuery(event.target.value)} />
        </div>
        <div className={styles.functionFilters} role="group" aria-label="Filter corpus by function">
          <button className={styles.filterChip} type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All functions</button>
          {functionTags.map(tag => <button className={styles.filterChip} type="button" key={tag} aria-pressed={filter === tag} onClick={() => setFilter(tag)}>{functionLabel(tag)}</button>)}
          {hasUnlabelled ? <button className={styles.filterChip} type="button" aria-pressed={filter === UNLABELLED} onClick={() => setFilter(UNLABELLED)}>Unlabelled</button> : null}
        </div>
      </header>

      <div className={styles.drawerContent}>
        {selectionFull ? <p className={styles.selectionNotice} role="status">All 5 target slots are filled. Remove one to choose another.</p> : null}
        {[...groups].map(([group, items]) => <section className={styles.corpusGroup} key={group} aria-label={functionLabel(group)}>
          <h3>{functionLabel(group)}</h3>
          {items.map(record => {
            const isSelected = selected.has(record.key);
            const expression = expressionText(record);
            return <button key={record.key} type="button" className={styles.corpusCard} aria-pressed={isSelected}
              aria-label={`${isSelected ? "Remove" : "Select"} ${expression}`}
              disabled={disabled || (!isSelected && selectionFull)} onClick={() => onToggle(record)}>
              <span className={styles.corpusCardTitle}><strong>{expression}</strong>{isSelected ? <Check size={18} aria-hidden="true" /> : null}</span>
              {record.item.meaning ? <span className={styles.meaning}>{record.item.meaning}</span> : null}
              <span className={styles.tags}>{[...new Set([record.item.kind, ...record.item.tags])].map(tag => <span key={tag}>{tag}</span>)}</span>
            </button>;
          })}
        </section>)}
        {!groups.size ? <p className={styles.emptyCorpus}>{records.length ? "No expressions match your search." : "Your corpus is empty. Save expressions while you learn, then choose them here."}</p> : null}
      </div>

      <footer className={styles.drawerFooter}>
        <span id={countId} aria-live="polite">{selected.size} / 5 selected</span>
        <button type="button" className={`${styles.button} ${styles.doneButton}`} onClick={onClose}>Done</button>
      </footer>
    </div>
  </dialog>;
}
