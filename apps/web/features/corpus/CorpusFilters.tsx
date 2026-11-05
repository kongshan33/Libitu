"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SavedCorpusRecord } from "./corpus-storage";
import { sourceKey, type LibraryFilters } from "./library";
import styles from "./CorpusLibrary.module.css";

type FacetKey = "kind" | "tags" | "level" | "scenario" | "register" | "source";
type Option = { value: string; label: string; count?: number };
const option = (value: string): Option => ({ value, label: value === "unknown" ? "Unassessed" : value });

export function CorpusFilters({ records, filters, onChange }: {
  records: SavedCorpusRecord[];
  filters: LibraryFilters;
  onChange(change: Partial<LibraryFilters>): void;
}) {
  const [open, setOpen] = useState<FacetKey | null>(null);
  const anchors = useRef<Partial<Record<FacetKey, HTMLDivElement | null>>>({});
  const panel = useRef<HTMLDivElement>(null);
  const facets = useMemo(() => {
    const tags = new Set<string>();
    const scenarios = new Set<string>();
    const sources = new Map<string, Option>();
    for (const record of records) {
      record.item.tags.forEach(tag => tags.add(tag));
      record.item.scenarioTags?.forEach(scenario => scenarios.add(scenario));
      const value = sourceKey(record);
      const source = sources.get(value);
      sources.set(value, { value, label: record.sourceTitle || "Personal corpus", count: (source?.count ?? 0) + 1 });
    }
    return [
      { key: "kind", title: "Type", options: ["chunk", "idiom", "structure"].map(option) },
      { key: "tags", title: "Functional tags", options: [...tags].sort().map(option) },
      { key: "level", title: "Difficulty", options: ["A1", "A2", "B1", "B2", "C1", "C2", "unknown"].map(option) },
      { key: "scenario", title: "Scenario", options: [...scenarios].sort().concat("unknown").map(option) },
      { key: "register", title: "Register", options: ["professional", "neutral", "casual", "formal", "unknown"].map(option) },
      { key: "source", title: "Source", options: [...sources.values()] }
    ] satisfies { key: FacetKey; title: string; options: Option[] }[];
  }, [records]);

  useEffect(() => {
    if (!open) return;
    const anchor = anchors.current[open];
    const popup = panel.current;
    if (!anchor || !popup) return;
    const position = () => {
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 32);
      // The filter group uses display: contents; anchor to this pill instead.
      const left = Math.max(16, Math.min(rect.left, window.innerWidth - 16 - width));
      popup.style.setProperty("--popover-shift", `${left - rect.left}px`);
      const below = window.innerHeight - rect.bottom - 24;
      const above = below < 180 && rect.top - 24 > below;
      popup.dataset.side = above ? "top" : "bottom";
      popup.style.setProperty("--popover-height", `${Math.min(360, Math.max(0, above ? rect.top - 24 : below))}px`);
    };
    position();
    const resize = new ResizeObserver(position);
    resize.observe(anchor);
    popup.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    const outside = (event: Event) => {
      if (event.target instanceof Node && !anchor.contains(event.target)) setOpen(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      anchor.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
      setOpen(null);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      resize.disconnect();
    };
  }, [open]);

  return <div className={styles.filters} role="group" aria-label="Corpus filters">
    {facets.map(({ key, title, options }) => <div key={key} className={styles.filterAnchor} ref={node => { anchors.current[key] = node; }}>
      <button className={styles.filterPill} type="button" aria-expanded={open === key} aria-haspopup="dialog"
        aria-controls={`corpus-filter-${key}`} data-selected={filters[key].length > 0 || undefined}
        onClick={() => setOpen(current => current === key ? null : key)}>
        {title}{filters[key].length ? ` · ${filters[key].length}` : ""}<ChevronDown size={16} aria-hidden="true" />
      </button>
      <div hidden={open !== key} inert={open !== key} ref={open === key ? panel : undefined} id={`corpus-filter-${key}`} className={styles.filterPanel} role="dialog" aria-label={`${title} filters`}>
        <div className={key === "source" ? styles.sourceOptions : styles.filterOptions}>
          {options.map(({ value, label, count }) => <button key={value} type="button" aria-pressed={filters[key].includes(value)}
            onClick={() => onChange({ [key]: filters[key].includes(value) ? filters[key].filter(item => item !== value) : [...filters[key], value] })}>
            <span>{label}</span>{count !== undefined ? <span className={styles.sourceCount}>{count}</span> : null}
          </button>)}
        </div>
        {!options.length ? <p className={styles.help}>No {title.toLowerCase()} saved yet.</p> : null}
        <div className={styles.filterActions}>
          {filters[key].length ? <button type="button" className={styles.textButton} onClick={() => onChange({ [key]: [] })}>Clear</button> : null}
          <button type="button" className={styles.textButton} onClick={() => {
            anchors.current[key]?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
            setOpen(null);
          }}>Done</button>
        </div>
      </div>
    </div>)}
  </div>;
}
