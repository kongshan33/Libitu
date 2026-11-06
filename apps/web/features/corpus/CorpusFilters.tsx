"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { SavedCorpusRecord } from "./corpus-storage";
import { sourceKey, type LibraryFilters } from "./library";
import { scenarioGroups, scenarioOptions } from "./scenario-filters";
import styles from "./CorpusLibrary.module.css";

type FacetKey = "kind" | "tags" | "level" | "scenario" | "register" | "source";
type Option = { value: string; label: string; count?: number };
const option = (value: string): Option => ({ value, label: value === "unknown" ? "Unassessed" : value });

export function CorpusFilters({ records, filters, onChange }: {
  records: SavedCorpusRecord[];
  filters: LibraryFilters;
  onChange(change: Partial<LibraryFilters>): void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const facets = useMemo(() => {
    const tags = new Set<string>();
    const scenarios = new Set<string>();
    const sources = new Map<string, Option>();
    for (const record of records) {
      record.item.tags.forEach(tag => tags.add(tag));
      scenarioGroups(record.item.scenarioTags).forEach(scenario => scenarios.add(scenario));
      const value = sourceKey(record);
      const source = sources.get(value);
      sources.set(value, { value, label: record.sourceTitle || "Personal corpus", count: (source?.count ?? 0) + 1 });
    }
    return [
      { key: "kind", title: "Type", options: ["chunk", "idiom", "structure"].map(option) },
      { key: "tags", title: "Functional tags", options: [...tags].sort().map(option) },
      { key: "level", title: "Difficulty", options: ["A1", "A2", "B1", "B2", "C1", "C2", "unknown"].map(option) },
      { key: "scenario", title: "Scenario", options: scenarioOptions.filter(({ value }) => scenarios.has(value)) },
      { key: "register", title: "Register", options: ["professional", "neutral", "casual", "formal", "unknown"].map(option) },
      { key: "source", title: "Source", options: [...sources.values()] }
    ] satisfies { key: FacetKey; title: string; options: Option[] }[];
  }, [records]);

  const selectedCount = facets.reduce((count, { key }) => count + filters[key].length, 0);

  function positionPanel() {
    const anchor = trigger.current;
    const popup = panel.current;
    if (!anchor || !popup) return;
    const rect = anchor.getBoundingClientRect();
    const viewport = window.visualViewport;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    const offsetX = viewport?.offsetLeft ?? 0;
    const offsetY = viewport?.offsetTop ?? 0;
    const panelWidth = Math.min(600, width - 32);
    const below = height + offsetY - rect.bottom - 16;
    const above = rect.top - offsetY - 16;
    const useAbove = below < 360 && above > below;
    popup.style.setProperty("--popover-width", `${panelWidth}px`);
    popup.style.setProperty("--popover-left", `${Math.max(offsetX + 16, Math.min(rect.left, offsetX + width - panelWidth - 16))}px`);
    popup.style.setProperty("--popover-top", useAbove ? "auto" : `${rect.bottom + 8}px`);
    popup.style.setProperty("--popover-bottom", useAbove ? `${window.innerHeight - rect.top + 8}px` : "auto");
    popup.style.setProperty("--popover-height", `${Math.max(0, (useAbove ? above : below) - 8)}px`);
  }

  function closePanel(restoreFocus = false) {
    if (panel.current && "popover" in HTMLElement.prototype && panel.current.matches(":popover-open")) panel.current.hidePopover();
    setOpen(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!open) return;
    const popup = panel.current;
    positionPanel();
    popup?.querySelector<HTMLButtonElement>("[aria-pressed=true]")?.focus({ preventScroll: true });
    // Native popovers own Escape and light dismissal. Also close when keyboard
    // focus leaves the filter controls, preserving the previous nonmodal flow.
    const native = "popover" in HTMLElement.prototype;
    const outside = (event: Event) => {
      if (event.target instanceof Node && !popup?.contains(event.target) && !trigger.current?.contains(event.target)) {
        if (native && popup?.matches(":popover-open")) popup.hidePopover();
        setOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    if (!native) document.addEventListener("keydown", escape);
    const resize = new ResizeObserver(positionPanel);
    if (trigger.current) resize.observe(trigger.current);
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);
    window.visualViewport?.addEventListener("resize", positionPanel);
    window.visualViewport?.addEventListener("scroll", positionPanel);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
      resize.disconnect();
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
      window.visualViewport?.removeEventListener("resize", positionPanel);
      window.visualViewport?.removeEventListener("scroll", positionPanel);
    };
  }, [open]);

  function renderOptions(key: FacetKey, options: readonly Option[]) {
    return (
      <div className={key === "source" ? styles.sourceOptions : styles.filterOptions} data-scrollable={key === "tags" || undefined}>
        {options.map(({ value, label, count }) => <button key={value} type="button" aria-pressed={filters[key].includes(value)}
          onClick={() => onChange({ [key]: filters[key].includes(value) ? filters[key].filter(item => item !== value) : [...filters[key], value] })}>
          {key === "source" ? <Check size={14} aria-hidden="true" /> : null}
          <span>{label}</span>{count !== undefined ? <span className={styles.sourceCount}>{count}</span> : null}
        </button>)}
        <button type="button" aria-pressed={filters[key].length === 0} onClick={() => onChange({ [key]: [] })}>
          {key === "source" ? <Check size={14} aria-hidden="true" /> : null}<span>Any</span>
        </button>
      </div>
    );
  }

  return <div className={styles.filters}>
    <button ref={trigger} className={styles.filterPill} type="button" aria-label="Filters"
      aria-expanded={open} aria-haspopup="dialog" aria-controls={panelId} popoverTarget={panelId}
      data-selected={selectedCount > 0 || undefined} onClick={() => {
        positionPanel();
        if (!("popover" in HTMLElement.prototype)) setOpen(current => !current);
      }}>
      <SlidersHorizontal size={16} aria-hidden="true" />
      Filters{selectedCount > 0 ? <span className={styles.filterCount}>{selectedCount}</span> : null}
    </button>
    <div ref={panel} id={panelId} popover="auto" className={styles.filterPanel}
      data-open={open || undefined} role="dialog" aria-label="Corpus filters"
      onToggle={event => setOpen(event.newState === "open")}>
      <div className={styles.filterHeader}>
        <h2>Filters</h2>
        <button type="button" className={styles.filterClose} aria-label="Close filters" onClick={() => closePanel(true)}><X size={18} aria-hidden="true" /></button>
      </div>
      <div className={styles.filterBody}>
        {facets.map(({ key, title, options }) => <div key={key} className={styles.filterRow} role="group" aria-label={title}>
          {key === "source" ? <details className={styles.sourceDisclosure}>
            <summary><span className={styles.filterLabel}>{title}</span><span className={styles.sourceSummary}>
              {filters.source.length ? `${filters.source.length} selected` : "Any"}<ChevronDown size={14} aria-hidden="true" />
            </span></summary>
            {renderOptions(key, options)}
          </details> : <><span className={styles.filterLabel}>{title}</span>{renderOptions(key, options)}</>}
        </div>)}
      </div>
      <div className={styles.filterActions}>
        <button type="button" className={styles.filterReset} disabled={!selectedCount}
          onClick={() => onChange({ kind: [], tags: [], level: [], scenario: [], register: [], source: [] })}>
          <X size={14} aria-hidden="true" />Clear all filters
        </button>
        <button type="button" className={styles.filterDone} onClick={() => closePanel(true)}>Done</button>
      </div>
    </div>
  </div>;
}
