"use client";

import { Check } from "lucide-react";
import type { SavedCorpusRecord } from "../../corpus/corpus-storage";
import { expressionText } from "../draft";
import styles from "./Loadout.module.css";

export function CorpusPicker({ title, functionLabel, reasons, records, selectedKeys, count, limit, structures = false, disabled, onToggle }: {
  title: string; records: SavedCorpusRecord[]; selectedKeys: string[]; count: number; limit: number;
  functionLabel?: string; reasons?: Readonly<Record<string, string>>;
  structures?: boolean; disabled: boolean; onToggle(record: SavedCorpusRecord): void;
}) {
  return <fieldset className={styles.picker}>
    <legend><span className={styles.pickerHeading}><span>{title}</span>{functionLabel ? <span className={styles.functionCaption}>{functionLabel}</span> : null}</span></legend>
    <div className={structures ? styles.structureList : styles.expressionGrid}>
      {records.map((record) => {
        const selected = selectedKeys.includes(record.key);
        const text = expressionText(record);
        return <button className={`${styles.corpusCard} ${selected ? styles.selectedCard : ""}`} type="button" key={record.key}
          aria-label={`${selected ? "Remove" : "Select"} ${text}`} aria-pressed={selected}
          disabled={disabled || (!selected && count >= limit)} onClick={() => onToggle(record)}>
          {selected ? <span className={styles.cardToggle} aria-hidden="true"><Check size={16} /></span> : null}
          <span className={record.item.kind === "structure" ? styles.structureText : styles.expressionText}>{text}</span>
          {record.item.meaning ? <span className={styles.meaning}>{record.item.meaning}</span> : null}
          <span className={styles.cardMetadata}><span className={styles.tags}>{[...new Set([record.item.kind, ...record.item.tags])].map(tag => <span key={tag}>{tag}</span>)}</span>{reasons?.[record.key] ? <span className={styles.cardReason}>{reasons[record.key]}</span> : null}</span>
          {!record.serverId ? <span className={styles.source}>Saved on this device</span> : null}
        </button>;
      })}
    </div>
    {!records.length ? <p className={styles.empty}>No {structures ? "structures" : "expressions"} match these filters.</p> : null}
  </fieldset>;
}
