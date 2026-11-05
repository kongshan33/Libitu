# Corpus library — first usable increment

## Corpus detail DeepSeek comparison — 2026-11-05

Corpus detail now supports a scoped `CORPUS_ANALYSIS_PROVIDER` switch. The current local API uses the official DeepSeek `deepseek-flash` model with the existing server-side credential; repository defaults retain Ark for compatibility. Explain, lazy Syntax and streamed follow-up share the selected provider. Other text/voice tasks keep their own configuration. Two same-prompt live rounds (12 requests) were substantially faster and retained rewrite difficulty in both sentence follow-ups. Grammar terminology, spatial-versus-temporal translation and template adherence still had errors; this is sampled improvement, not broad teaching acceptance. 53 focused API tests pass, including provider/credential isolation. See [comparison, complete outputs and timings](../benchmarks/corpus-detail-20261105/DEEPSEEK_COMPARISON.md). Existing saved analyses refresh only on the existing explicit action.

## Corpus detail: speaking-first, on-demand analysis — 2026-11-05

Stage 1 and Corpus library share the same Explain/Syntax panels, source underlines and follow-up UI. Explain v2 adds a 60–120-character Chinese teacher note (prompt requirement), reusable speaking frames, collocations, text stress guidance and no speculative pitfalls in new Explain output. Usage scenarios appear once, as mono text. No default etymology or word-family content. Library cards preview the first saved speaking frame and show register alongside level.

`POST /api/corpus/analyze-selection` now generates Explain only and returns `schema_version=2`, `syntax_state=pending` plus an empty compatible syntax object. `/analyze-syntax` runs only on tab activation; phrase/chunk/idiom output is limited to internal structure, sentence role and nearby logic, while sentences/structures retain full analysis. Client requests are deduplicated while pending, abort on dismissal, and retain retryable failures. Saved Syntax uses the existing account-owned/guest corpus update boundary; unsaved candidates cache it for this visit. Legacy combined records remain readable, with an explicit Refresh explanation action and no automatic regeneration.

`POST /api/corpus/ask` streams actual provider SSE deltas with explicit done/error states. Requests carry bounded local context, a question up to 500 characters and at most six completed exchanges. The UI renders only escaped text, paragraphs/lists, emphasis and inline code; no HTML, images or links. Failed/truncated answers cannot be saved. Save as note explicitly appends to the existing usage note; an unsaved transcript selection instead labels this as a note draft until the item is saved. Follow-up history stays in the open detail and is not automatically persisted. Account changes/dismissal dispose its requests.

Initial redesign, before the DeepSeek comparison above: no database migration or provider change; existing Ark configuration was reused. Restart the API process to load new prompt files. A real Doubao follow-up tested one authored phrase and one full sentence across Explain, Syntax and streamed questions, with repeated calls and prompt fixes. Default Explain now leaves speculative pitfalls empty; placeholder and complete-selection boundary copy are application-owned. Transport/contract checks pass, but repeated Lite answers still sometimes alter meaning in follow-up rewrites, so teaching quality is not accepted as stable. Thinking-mode probes were slower and did not resolve every issue; Pro calls returned 404 and no model configuration was switched. See [live results, remaining failures and full prompt snapshots](../benchmarks/corpus-detail-20261105/README.md). Latency is sampled API wall time; billing and broad model quality remain unqualified.


Implemented locally on 2026-10-02. Route: `/corpus`.

## Unified v2 presentation — 2026-11-02

The supplied Corpus artboard replaces the sidebar with a 1440px shell, heading
counts and a wrapping search/filter/sort toolbar. Neutral surface cards use plain
kind/tag metadata and a purple inset selection outline; buttons are black or
outlined pills. Detail/edit dialogs share the palette, typography and no-shadow
presentation. Existing account, save/delete and original-analysis behavior stays.

- Each filter popover supports multi-selection, its own Clear, Escape with focus
  return, outside-click dismissal and responsive positioning. Only one is open.
- Corpus tabs support arrow/Home/End keys. Clear all resets search/facets within
  the active tab. High value still requires a real learning-value score >=4/5.
- Display starts with 15 matching items, and Load more adds 15. Search/filter/sort
  changes reset the display limit; selection remains keyed across these changes.
  Counts describe the complete loaded collection. This does not add server-side
  pagination or improve the full-collection fetch contract.
- The selected-items tray keeps its real Loadout capacity/error behavior and sits
  above mobile bottom navigation. Its action replaces the header's primary style.

## Delivered behavior

- Shared cross-source collection through `useSavedCorpus`, with existing browser-local guest saves, account-bound import outboxes and authenticated FastAPI persistence.
- Search over expression, meaning, note, tags and source title. Multi-select type/tag/level/scenario/register/source facets use OR within a dimension and AND between dimensions. Defaults include all difficulties and unknown metadata.
- Real total/type/source counts, current-result count, recency/learning-value/transferability/alphabetical sorting, grid/list layouts and six responsive filter popovers. Unknown creation dates sort after known dates with stable legacy order. Unknown scores are not zero; high value includes only scores at least 4/5.
- Selection uses the stable saved key, survives filters/sorting, and reports selected items hidden by filters. Account changes remount the management workspace and clear open dialogs and selection.
- Card bodies open native modal details; checkboxes and edit buttons are independent. Full original analysis reuses the Stage 1 explanation/syntax panels. Cached detail is reused. Legacy items with stored source text can hydrate their original analysis through the existing API. Items lacking evidence remain browsable/editable without inventing source context or analysis.
- Edit expression/template, meaning, usage note, functional tags and structure slots. Guest edits survive reload; account edits call the existing owner-scoped PATCH and require a confirmed cloud ID. The saved identity, original evidence/analysis and creation date remain unchanged. Analysis is explicitly labelled as original; editing an expression does not silently reanalyze it. Historical speaking snapshots remain unchanged.
- Delete requires confirmation inside the detail modal; failed writes/deletes remain visible and retryable. Deleting an item does not delete its source or historical mission snapshots.
- Add selected items to Loadout under the same browser lock as ordinary draft writes. Read current settings inside the lock, deduplicate keys, preserve scenario/goal/difficulty/feedback/logic and guest/account adoption semantics. Reject missing items, a pending idempotent mission start, more than 3 structures or more than 5 shared chunk/idiom expressions. Never truncate or automatically replace an existing draft. Navigate only after the draft write succeeds.
- Navigation from Stage 1, Loadout and My learning points to the new page.

## Contracts and storage

`GET /api/corpus` now exposes existing database `created_at` and `updated_at` fields; inline records receive server timestamps, and new guest records receive local creation timestamps. Historical guest records retain unknown dates. PATCH rejects null/blank expression text, null tags/slots and expressions over 2,000 characters. No schema migration, new table, authentication provider or AI provider integration is required.

`CorpusStorage.update` preserves the key used by imports and Loadout. Legacy cloud items without an import key derive identity from their immutable original snapshot, or from the server ID when no snapshot exists; editing text never regenerates that identity. Cloud edit errors keep the open editor draft rather than putting edits into the import-only outbox. A late response after an account change cannot publish into the new account. The original source locator and analysis are not included in the management PATCH.

The first version loads the existing complete collection and filters locally. It does not promise arbitrary-library scalability. Future server-side pagination should separate list summaries from full analysis payloads. Concurrent edits to the same cloud item currently use the existing last-write-wins contract; field-level conflict resolution and an offline edit queue are not delivered.

## Deliberately separate

Decks, corpus usage aggregation, “unused” classification, spaced repetition/review scheduling, manual creation, metadata/quality-score editing and server-side search/pagination are not delivered here. Existing Stage 1 save actions remain the entry into the collection. No illustrative prototype usage counts or fake review states are shown.

## Verification

2026-11-02 visual migration: root lint/build/test pass. The updated synthetic
browser suite passes at 1440/768/390/320px, including keyboard tabs/popovers,
per-facet clearing, single-open/outside/Escape behavior, 15→30→33 display,
sort/search reset, selection persistence, empty results, long content reflow,
mobile action-tray clearance and the existing edit/delete/account/handoff flows.
Screenshots are retained in `output/playwright/corpus-*`. The full collection is
still fetched before local display pagination; no production scalability claim.

Earlier baseline:

- Root lint, production build (including `/corpus`), and test suites passed. After the final legacy-identity fix, all 18 focused corpus/storage regressions and the production build passed again.
- Unit regressions cover AND/OR filtering, unknown metadata, ordering, stable identity/source preservation after edit/reload, failed edits, delayed account responses, atomic Loadout merge, settings retention, deduplication, overflow rejection and guest/account adoption.
- Backend regressions cover source/identity/timestamp preservation, idempotent re-import after edits, owner denial and invalid PATCH fields.
- A read-only smoke query against configured Supabase returned an empty owner-scoped collection for a nonexistent synthetic owner; no data was changed.
- Browser acceptance passed at 1440×1000 and 390×844: search/selection isolation, hidden selections, cached explanation/syntax, edit/reload, list reflow, type filtering, Loadout handoff, signed-in PATCH failure/retry/reload, confirmed delete/reload and account-switch clearing. Desktop/mobile library and detail screenshots were visually inspected.
- Browser tests use synthetic Clerk identities and intercepted API responses, not real OAuth or production load qualification. No paid analysis request is made by the browser fixture.

Corpus detail v2 verification (2026-11-05): 44 targeted API tests, 513 Web unit tests, Web lint / TypeScript and production build passed. The new synthetic browser regression covers desktop guest and mobile account persistence plus Reader candidate detail: no eager Syntax, failure/retry, cached Syntax after reload, exact timestamp seek, safe follow-up rendering and explicit note persistence. Existing Corpus library mobile edit/filter/pagination regression passed. Screenshots under `output/playwright/corpus-detail-*-v2*.png` are local artifacts. The older Stage 1 all-in-one browser regression stops at playback-highlight restoration after visibilitychange (before detail); it is not claimed passed. The later live report above supersedes the timing/content-unverified status; semantic consistency and billing qualification remain open.
