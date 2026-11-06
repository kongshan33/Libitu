"use client";
import { useContentMotion } from "@/components/ui/use-content-motion";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { ArrowRight, BookOpen, LayoutGrid, List, Pencil, Search } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { Input } from "@/components/ui/field";
import Link from "@/components/ui/PrefetchLink";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouteIntent } from "../navigation/use-route-prefetch";
import { addCorpusToDraft, expressionText } from "../loadout/draft";
import { useSavedCorpus } from "./useSavedCorpus";
import { CorpusFilters } from "./CorpusFilters";
import { CorpusDeleteDialog } from "./CorpusDeleteDialog";
import { CorpusItemDialog } from "./CorpusItemDialog";
import { emptyFilters, libraryItems, type LibraryFilters, type LibrarySort } from "./library";
import styles from "./CorpusLibrary.module.css";

const PAGE_SIZE = 15;
const sorts = [
  { value: "recent", label: "Recently added" },
  { value: "value", label: "Learning value ↓" },
  { value: "transfer", label: "Transferability ↓" },
  { value: "alphabetical", label: "Alphabetical" }
];
const itemCount = (count: number) => `${count} ${count === 1 ? "item" : "items"}`;

export function CorpusLibrary() {
  const { isLoaded, userId } = useAuth();
  return <main className={styles.page}>
    {isLoaded ? <LibraryContent key={userId ?? "guest"} owner={userId ?? null} /> : <div className={styles.shell}><ContentSkeleton label="Loading your library…" variant="library" rows={6} /></div>}
  </main>;
}

function LibraryContent({ owner }: { owner: string | null }) {
  const corpus = useSavedCorpus();
  const clerk = useClerk();
  const router = useRouter();
  const loadoutIntent = useRouteIntent("/loadout?returnTo=%2Fcorpus");
  const [filters, setFilters] = useState<LibraryFilters>(emptyFilters);
  const [sort, setSort] = useState<LibrarySort>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<string[]>([]);
  const [active, setActive] = useState<{ key: string; edit: boolean } | null>(null);
  const [deleteKeys, setDeleteKeys] = useState<string[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const query = useDeferredValue(filters.query);
  const matching = useMemo(() => libraryItems(corpus.records, { ...filters, query }, sort), [corpus.records, filters, query, sort]);
  const shown = matching.slice(0, limit);
  const resultsRef = useContentMotion(JSON.stringify([view, sort, shown.map(record => record.key)]), undefined, 120);
  const selectedKeys = selected.filter(key => corpus.records.some(record => record.key === key));
  const loadoutOverLimit = selectedKeys.length > 5;
  const allMatchingSelected = matching.length > 0 && matching.every(record => selectedKeys.includes(record.key));
  const hidden = selectedKeys.filter(key => !matching.some(record => record.key === key)).length;
  const activeRecord = corpus.records.find(record => record.key === active?.key);
  const disabled = !corpus.ready || corpus.busy || adding;
  const hasFilters = Boolean(filters.query || filters.kind.length || filters.tags.length || filters.level.length || filters.scenario.length || filters.register.length || filters.source.length);
  const counts = useMemo(() => {
    const result = { chunk: 0, idiom: 0, structure: 0 };
    corpus.records.forEach(record => result[record.item.kind]++);
    return result;
  }, [corpus.records]);

  function changeFilters(change: Partial<LibraryFilters>) {
    setFilters(current => ({ ...current, ...change }));
    setLimit(PAGE_SIZE);
  }
  function clearFilters() { changeFilters({ ...emptyFilters, highValue: filters.highValue }); }
  function toggleSelected(key: string) {
    setSelected(current => current.includes(key) ? current.filter(value => value !== key) : [...current, key]);
    setMessage(null);
  }
  async function addToLoadout() {
    if (disabled || loadoutOverLimit || !selectedKeys.length) return;
    setAdding(true); setMessage(null);
    try {
      const draft = await addCorpusToDraft(window.localStorage, owner, selectedKeys, corpus.records, {
        isCurrent: () => clerk.loaded && (clerk.user?.id ?? null) === owner
      });
      if (draft && (clerk.user?.id ?? null) === owner) router.push("/loadout?returnTo=%2Fcorpus");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save your loadout. Please retry."); }
    finally { setAdding(false); }
  }

  return <div className={`${styles.shell} ${selectedKeys.length ? styles.withSelection : ""}`}>
    <section aria-labelledby="library-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>From saved to spoken</span>
          <h1 id="library-title">Corpus Library</h1>
          <p>Keep useful language close. Make it part of your next conversation.</p>
          <p className={styles.collectionSummary}>{corpus.ready
            ? `${corpus.records.length} saved ${corpus.records.length === 1 ? "item" : "items"} · ${counts.chunk} chunks · ${counts.idiom} idioms · ${counts.structure} structures`
            : null}</p>
        </div>
        <ButtonLink className={styles.openLoadout} variant={selectedKeys.length ? "secondary" : "primary"} size="md" href="/loadout">
          Open Loadout <ArrowRight size={16} aria-hidden="true" />
        </ButtonLink>
      </div>
      {!owner ? <p className={styles.guestNotice}>Saved on this device. Sign in to sync your collection across devices.</p> : null}
      <div className={styles.tabs} role="tablist" aria-label="Corpus views">
        {[false, true].map((highValue, index) => <button key={String(highValue)} id={`corpus-view-${index}`} type="button" role="tab"
          aria-selected={filters.highValue === highValue} aria-controls="corpus-results" tabIndex={filters.highValue === highValue ? 0 : -1}
          onClick={() => changeFilters({ highValue })} onKeyDown={event => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
            changeFilters({ highValue: Boolean(next) });
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
          }}>{highValue ? "AI recommended" : "All items"}</button>)}
      </div>
      <search className={styles.toolbar} aria-label="Search and filter corpus">
        <label className={styles.search} data-input-group>
          <Search size={16} aria-hidden="true" />
          <Input appearance="bare" aria-label="Search corpus" type="search" placeholder="Search expressions, meanings, tags…" value={filters.query} onChange={event => changeFilters({ query: event.target.value })} />
        </label>
        <CorpusFilters records={corpus.records} filters={filters} onChange={changeFilters} />
        {hasFilters ? <button className={styles.textButton} type="button" onClick={clearFilters}>Clear all</button> : null}
        <div className={styles.viewControls}>
          <Select value={sort} onValueChange={value => { setSort(value as LibrarySort); setLimit(PAGE_SIZE); }}>
            <SelectTrigger className={styles.sort} aria-label="Sort corpus"><SelectValue /></SelectTrigger>
            <SelectContent className={styles.sortMenu} align="end">
              {sorts.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className={styles.viewToggle} role="group" aria-label="Corpus layout">
            <button type="button" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><LayoutGrid size={16} aria-hidden="true" /></button>
            <button type="button" aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={16} aria-hidden="true" /></button>
          </div>
        </div>
      </search>
      <div id="corpus-results" role="tabpanel" aria-labelledby={`corpus-view-${filters.highValue ? 1 : 0}`} tabIndex={0} className={styles.results}>
        {filters.highValue ? <p className={styles.help}>AI-rated learning value of 4 or 5 out of 5. Items without a score are not included.</p> : null}
        {corpus.error ? <div role="alert" className="ui-retry-notice"><p>{corpus.error}</p><Button variant="secondary" size="md" disabled={corpus.busy} loading={corpus.busy} loadingLabel="Syncing…" onClick={corpus.retry}>Retry corpus sync</Button></div> : null}
        {!corpus.ready && !corpus.error ? <ContentSkeleton label="Loading and syncing your corpus…" variant={view === "grid" ? "corpus" : "rows"} rows={view === "grid" ? 6 : 3} /> : null}
        <div className={styles.resultMeta}>
          <span role="status">{corpus.ready ? itemCount(matching.length) : corpus.error ? "Collection unavailable" : null}</span>
          <div className={styles.resultSelection}>
            <Button variant="ghost" size="sm" disabled={disabled || !matching.length || query !== filters.query}
              onClick={() => {
                const keys = new Set(matching.map(record => record.key));
                setSelected(current => allMatchingSelected ? current.filter(key => !keys.has(key)) : [...new Set([...current, ...keys])]);
                setMessage(null);
              }}>{allMatchingSelected ? "Deselect filtered results" : `Select all filtered results (${matching.length})`}</Button>
            <span>{selectedKeys.length} selected{hidden ? ` · ${hidden} hidden by filters` : ""}</span>
          </div>
        </div>
        {corpus.ready && !corpus.records.length ? <div className={styles.empty}>
          <BookOpen size={28} aria-hidden="true" /><h2>Your collection starts with one expression.</h2>
          <p>Save useful language while listening or reading, then find it here.</p>
          <ButtonLink href="/" variant="secondary" size="md">Find language to save <ArrowRight size={16} aria-hidden="true" /></ButtonLink>
        </div> : corpus.ready && !matching.length ? <div className={styles.empty}>
          <Search size={28} aria-hidden="true" /><h2>{filters.highValue && !hasFilters ? "No AI recommendations yet" : "No matching items"}</h2>
          <p>{filters.highValue && !hasFilters ? "Saved items with an AI-rated learning value of 4 or 5 will appear here." : "Try a different search or clear your filters."}</p>
          <Button variant="secondary" size="md" onClick={hasFilters ? clearFilters : () => changeFilters({ highValue: false })}>{hasFilters ? "Clear filters" : "View all items"}</Button>
        </div> : null}
        <div ref={resultsRef} className={`${styles.items} ${view === "list" ? styles.list : ""}`}>
          {shown.map(record => <article key={record.key} className={`${styles.card} ${selectedKeys.includes(record.key) ? styles.selected : ""}`}>
            <div className={styles.cardTop}>
              <span className={styles.kind}>{record.item.kind}</span><span className={styles.level}>{[record.item.level ?? "Unassessed", record.item.register].filter(Boolean).join(" · ")}</span>
              <label className={styles.selectionControl}><input type="checkbox" aria-label={`Select ${expressionText(record)}`} checked={selectedKeys.includes(record.key)} disabled={disabled} onChange={() => toggleSelected(record.key)} /></label>
            </div>
            <button type="button" className={styles.cardBody} aria-label={`View ${expressionText(record)}`} onClick={() => setActive({ key: record.key, edit: false })}>
              <strong className={record.item.kind === "structure" ? styles.structure : ""}>{expressionText(record)}</strong><span>{record.item.meaning || "No meaning saved"}</span>
            </button>
            {record.item.analysisDetail?.analysis.reusablePatterns?.[0] ? <p className={styles.patternPreview}>{record.item.analysisDetail.analysis.reusablePatterns[0].template}</p> : null}
            <p className={styles.tags}>{record.item.tags.join(" · ") || "No functional tags"}</p>
            <footer className={styles.cardFooter}>
              <span title={record.sourceTitle}>{record.sourceTitle || "Personal corpus"}</span>
              <Button variant="ghost" size="inherit" className={styles.iconButton} aria-label={`Edit ${expressionText(record)}`} disabled={disabled} onClick={() => setActive({ key: record.key, edit: true })}><Pencil size={16} aria-hidden="true" /></Button>
            </footer>
          </article>)}
        </div>
        {matching.length > PAGE_SIZE ? <div className={styles.pagination}>
          <p role="status">Showing {shown.length} of {matching.length}</p>
          {shown.length < matching.length ? <Button variant="secondary" size="md" onClick={() => setLimit(current => current + PAGE_SIZE)}>Load more</Button> : null}
        </div> : null}
      </div>
    </section>
    <div hidden={!selectedKeys.length} inert={!selectedKeys.length} className={styles.tray} role="region" aria-label="Selected corpus actions">
      <div><strong>{selectedKeys.length} selected</strong><small id="corpus-loadout-limit">{loadoutOverLimit ? "Select 5 or fewer items to add to Loadout. Deletion has no selection limit." : "Loadout: up to 5 items total, including existing selections."}</small></div>
      <Button variant="secondary" size="md" disabled={disabled} onClick={() => { setSelected([]); setMessage(null); }}>Clear selection</Button>
      <Button variant="secondary" size="md" disabled={disabled} onClick={() => setDeleteKeys([...selectedKeys])}>Delete selected ({selectedKeys.length})</Button>
      <Button {...loadoutIntent} variant="primary" size="md" disabled={disabled || loadoutOverLimit} aria-describedby="corpus-loadout-limit" loading={adding} loadingLabel="Saving…" onClick={() => void addToLoadout()}>Add to Loadout<ArrowRight size={16} aria-hidden="true" /></Button>
      {message ? <p role="alert">{message} <Link href="/loadout?returnTo=%2Fcorpus">Open Loadout</Link></p> : null}
    </div>
    {deleteKeys ? <CorpusDeleteDialog count={deleteKeys.length} hidden={deleteKeys.filter(key => !matching.some(record => record.key === key)).length}
      onClose={() => setDeleteKeys(null)} onConfirm={async () => {
        const records = corpus.records.filter(record => deleteKeys.includes(record.key));
        const removed = await corpus.removeMany(records);
        setSelected(current => current.filter(key => !removed.includes(key)));
        return removed.length === records.length;
      }} /> : null}
    {activeRecord && active ? <CorpusItemDialog key={active.key} record={activeRecord} initialEdit={active.edit} busy={corpus.busy} error={corpus.error} onClose={() => setActive(null)} onUpdate={corpus.update} onRemove={corpus.remove} onHydrate={corpus.hydrate} /> : null}
  </div>;
}
