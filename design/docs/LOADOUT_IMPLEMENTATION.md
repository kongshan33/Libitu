# Speaking loadout

## Scene preparation reliability — 2026-10-31

Provider prompts v8 / v9-logic use request-local `t0`, `t1`, … references instead
of asking the model to reproduce corpus UUIDs. The provider adapter maps exact
references back to the original IDs before existing validation and persistence;
unknown/duplicate references fail, and reordered responses retain their own
content association. No stored plan, public request or pending retry format changes.
Structure examples receive their fixed anchors explicitly, including pronouns.
Scalar field repair includes its rejected string only when at most 500 characters;
the existing total repair-input limit and shared 90-second/two-attempt budget remain.
The same-expression live probe and authenticated browser retry passed after the
fix. This does not establish a general model success rate or conversation quality.

## Stage 3 reference completion — 2026-10-26

This section governs the current Stage 3 increment and supersedes the older
six-template, no-Travel and no-review boundaries below. The user paused further
Stage 4 work. Existing runtime code and its unfinished live acceptance remain
as previously documented; Summary-only is visibly unavailable, not relabelled
Light or Balanced. New drafts default to Workplace / Guided / Detailed.

The nine-template catalog exposes `logic_metadata` (family, stage functions,
version) separately from the frozen logic snapshot. Daily life and Travel use
the daily recommendation family; Travel retains its own saved scenario value.
New metadata does not change hashes or content of old pending requests. Catalog
and usage migrations are `20261026081427_loadout_stage_three_catalog` and
`20261026081433_speaking_loadout_usage`.

`POST /api/speaking/scene-logic` accepts an owned selection and a custom scene of
at most 500 characters. One bounded model request chooses from the selected
family, with a five-minute owner-specific cache and one in-flight request per
owner/process. It neither generates a Mission nor changes selected targets.
The client fences stale results and preserves a manual logic override. Scene planning remains behind Start; the manual scene-generation/comparison
entry was removed at the user's request. The scene panel offers AI planning or
a custom description, not a generate-then-select step.

`POST /api/speaking/loadout-usage` reads up to 500 owned corpus IDs without
queuing assessments or writing runtime state. Each item includes `used`, `never`
or `unknown`, the number of evidenced learner turns, its last-use/due timestamp,
and separate independent-practice counts. All assistance categories count as
recorded use. Never requires a complete compatible history with zero use;
zero qualifying independent Missions alone is insufficient. A never-started
draft with zero turns contributes no use. Active/unassessed Missions, old or
invalid evidence and truncated history produce unknown and null usage values.

The user-approved rule `recorded-use-7d-v1` makes a used item Due seven days after
its latest validated learner use. Never-used items are not Due. The read checks
at most 100 target Missions and conservatively treats a 40-reference result as
possibly truncated. Report/message revisions and exact quoted target evidence
must match. Independent practice retains the existing three-Mission, two-UTC-date,
two-distinct-scene-root rule, with linked/repeated scenes grouped together; it
is not mastery and is not a count of Workplace/Daily life/Travel categories.

The UI follows the prototype interaction and the newer neutral colors: inline
Hero Adjust, four independent Advanced disclosures, shared five-target selection
and function drawer, explicit custom/automatic scene modes, and a Free preview
before starting. Drawer search/filter survives reopening. Filter-specific rules are explained in-page; the general selection-tips
disclosure was removed at the user's request. Actual acceptance results are tracked in `TASK.MD`.

Selection, scene intent, logic source and preview share one replan path. Shuffle
preserves manually pinned targets; explicit logic stays selected until AI pick is
chosen. The Hero Quick start adopts its displayed targets and AI-generated scene;
an empty manual scene cannot disable that independent action. Its selection check
uses the same projected draft that is saved before planning. Manual/custom setups
use Start mission in the preview and retain their own validation. Frozen pending
requests and linked rounds remain locked against switching to a recommendation.
Custom-scene matching only blocks the manual Start, so preferences and targets remain
editable. Its cache is populated before draft persistence; stale responses cannot
replace a newer scene or selection. Successful creation records the previous
logic inside the existing durable acknowledgement transaction. Legacy pending
requests and linked rounds keep their exact payload and frozen logic. Normal
unlinked v1 drafts upgrade to v2 while retaining their saved preferences.

Existing known tags are adapted to the eight function categories. Missing
metadata is not invented; explicitly ineligible vocabulary/context-bound entries
are excluded. This increment does not rewrite the Stage 1 corpus taxonomy.

## Logic and evidence milestone — 2026-10-26

New targeted setups use the selected existing logic in `SpeakingPlanCreate` and
bind each target to a zero-based stage or null (Any stage). The cache includes
logic identity/steps and target placement. Planning v2 freezes `logic_template`
and each target's `stage_index`/`model_line`; generated implicit questions still
cannot disclose selected wording. The server validates model lines against the
saved expression/structure and rejects changed mappings. Source checks, one
bounded repair, low-fit recovery and exact uncertain-create replay remain.

The saved Mission uses the plan's full logic snapshot. Multiple targets may share
a stage. Linked v2 rounds preserve this structure and target placement; v1 plans,
linked rounds and immutable retry payloads remain readable. The service-only
`20261026063046_speaking_logic_stage_milestone` migration validates v2 JSON and
freezes it atomically. Migration/verification status lives in `TASK.MD`.

Stage 4 derives stage/target progress from persisted messages, opportunities,
attempts and exposure evidence. The first unused eligible target in the current
stage gets one natural demonstration; actual earlier independent use suppresses
it. Completing the same communicative task with other wording does not by itself
skip a v2 demonstration; topic changes and conversation endings still do. The
frozen model line is an adaptable scene reference, not a required verbatim reply.
Targets with earlier confirmed or uncertain partner exposure are not modeled again. The scheduler
covers multiple targets per stage and Any stage, with skip/restore and safe
response boundaries. A stage response does not imply target use or learning.

The v2 sidebar starts with target number/stage/status, supports explicit reveal,
and shows confirmed demonstration and learner-use records separately. Revealing
wording records `visual_target`; model lines are never pre-rendered. The complete
snapshot remains in the session API. Reports retain session-scoped assistance:
independent, imitation after a confirmed example, other supported use and unknown.
Difficulty still changes conversational behavior; v2 hides legacy manual support
switches and uses the compatible default support value. V1 controls are retained.

This section supersedes the older logic-cache reuse and demonstration deferral
below for v2 only. It does not add new taxonomy, review ranking, Travel,
Summary-only, correction or streaming behavior.

## Current Quick start amendment — 2026-10-25

The supplied Quick start reference now defines the Loadout page: a local
three-item suggestion, manual target cards, a shared full-corpus drawer, a
preview and collapsible Advanced controls. `features/loadout/quick-start.ts`
uses actual saved functional tags and the six templates returned by speaking
options. It chooses by distinct-stage coverage, rotates tied logic/candidates
and scenario-specific scene seeds deterministically, and fills unmatched slots
as Any stage. Fewer saved items produce fewer suggestions; missing usage and
eligibility metadata do not imply Never used, Due for review or exclusion.
Recommendation reasons describe tag fit or corpus membership, not model quality.

New manual and Quick selections share a maximum of five targets across chunks,
idioms and structures. There is no user-facing primary/opportunity distinction;
new targets use the existing `primary` value internally. The drawer searches
expressions, meanings and tags and shares selection with the page. Shuffle
preserves manual targets; starting the Quick card explicitly adopts its proposal.
Generated scene/template values remain distinguishable from user overrides.
Advanced retains existing preferences, scene comparison, logic, support and
evidence-based practice history. Legacy linked rounds retain their stored roles.

Local suggestions make no model request. Targeted Start retains the existing
single-scene planner, validated fit/frames and bounded repair; optional manual
comparison requests two scenes. Free conversation skips target planning and
creates a session with `corpus_item_ids: []`, `logic_template_id: null` and no
plan/candidate IDs. It does not request corpus selection or fabricate target
results. Both paths persist the chosen draft before starting and retain account
ownership, source checks, exact uncertain-request retries and confirmed-create
acknowledgement. Older drafts/snapshots and legacy retry payloads remain readable.

`20261025123200_loadout_quick_start_targets` updates the existing service-only
RPC validation for five equal targets and zero-target Free conversation without
rewriting historical roles or request identities. The migration is applied to
hosted development and its synthetic SQL checks roll back successfully. Root
lint/build/test pass (455 Web, 1654 API, 114 Extension); desktop/mobile fixtures
cover Quick start, manual selection, drawer keyboard behavior, free conversation,
exact retry and returning for a new Mission. See `TASK.MD` for evidence paths.
Free-conversation report transfer is not applicable; Retry/Adjust preserve free
mode without requiring a corpus read.

Existing scenario (`workplace`, `everyday`), difficulty, feedback and support
enums remain. This increment does not implement the development notes' proposed
taxonomy/eligibility migration, usage/review ranking, Travel, Summary-only
feedback, new daily-life templates, streaming SessionBrief or Stage 4
once-per-target demonstrations/once-per-error corrections. Existing Stage 4
support and evidence policies continue to apply.

## Planning and support baseline — 2026-10-20

The earlier Loadout followed
[expression-led Mission planning P0/P1 and P2](STAGE_THREE_FOUR_MISSION_PLAN.md).
It selected one to three primary targets and up to two opportunity targets; that
selection budget is superseded above for new selections. Use
Start mission to generate or reuse one matching scene and open its frozen Mission.
Choose a scene myself optionally generates two scenes for manual comparison.
The 2026-10-24 latency follow-up repairs only failed fields, batches selected
corpus reads, and exposes bounded request/phase timings. Changes to difficulty,
feedback, logic template or support reuse a source-matching cached plan.
An uncertain creation retry reuses the saved request before any planning. The new budget is
shared across structures and expressions. The contract below records the legacy
loadout and remains relevant to old sessions and uncertain creation retries.
The earlier flow recommended two primary targets with zero or one opportunity.
Planning still recovers content-validation errors once within the model time budget, and keeps
system-error recovery separate from candidate-specific selection advice.

P2 adds optional `support_level` independently of difficulty: `model_frame`,
`model_label`, `label_only`, `no_hint`. New drafts default to `model_frame`;
old drafts, sessions and exact pending requests without the field retain null
legacy behavior. The learner chooses support manually. Changing only support
does not invalidate a valid generated scene; an already-uncertain creation keeps
its original request and level until recovered.

New plans include a server-validated `sentence_frame` per target, with complete
target wording outside a nonempty `[slot]`; structures retain existing anchors
and slots, allowing only terminal sentence-punctuation differences.
Missing frames in old plans stay absent and are explained by the UI. New invalid
frames are output errors (`plan_invalid_frame`), use the existing single
constrained repair and do not blame or change the learner's selection.

The session API accepts an omitted/null level for legacy, or an explicit enum.
Explicit support is frozen atomically in the session and included in its
idempotency payload by `create_supported_speaking_loadout`; old creation RPCs and
absent-field payloads are unchanged. The initial setting is version 0 when the
Mission opens. Runtime manual changes have their own CAS/history contract in
[Stage 4](STAGE_FOUR_TEACHING_CONTROL.md). The connected development database has
`20261020090509_speaking_support_and_demonstrations`; local/hosted SQL rollback
checks pass. Overall P2 verification is tracked in `TASK.MD`.

P3 adds an explicit linked-round import with changed details or swapped roles and
before/after scene changes. The learner chooses support before starting; an uncertain
creation still recovers its exact saved request. The new evidence-create wrapper
preserves existing payload identities, freezes original corpus IDs and adds
`speaking-evidence-v3` only to new explicit-support sessions.

P4 offers read-only support history and a user-applied reduction of at most one level.
Every primary target needs three reliable independent Missions on two UTC practice
dates across two scene families; repeats do not manufacture variety. Failures and
insufficient history do not block starting. See the [full contract](STAGE_THREE_FOUR_MISSION_PLAN.md)
for evidence eligibility, account/input fencing and version boundaries.

## Original accepted scope and rules — 2026-09-30

The original 2026-09-30 increment delivered Stage 3 loadout and durable session
preparation. Real-time role-play, turn history and feedback have since been
implemented separately. Loadout may be opened directly or from Stage 1/2;
completing Shadow is not required.
The historical target limits below are retained for context and legacy paths;
the current Quick start amendment governs new Loadout selections.

- At least one saved corpus item is required.
- Up to three structures; chunks and idioms share up to five expression slots.
- Logic is optional. Selection order is preserved; duplicate corpus IDs are rejected.
- Scenario: `workplace` or `everyday`; goal: trimmed, nonblank, at most 500 characters.
- Difficulty: `guided`, `standard` (default), `challenging`.
- Feedback level: `light`, `balanced` (default), `detailed`.
- Static logic IDs: `persuasive_pitch`, `technical_troubleshoot`, `stakeholder_alignment`, `status_update`, `disagreement`, `onboarding`. Canonical template content is snapshotted by the server.
- Browser drafts use stable corpus keys, never blueprint candidate IDs. On login, guest draft ownership binds once to the active account. Existing account drafts are not silently overwritten; a guest draft can be explicitly adopted. Account-bound drafts never transfer on logout/account switch. Only confirmed account corpus server IDs can be submitted.
- Creating a session snapshots its selected language. Later source edits/deletions do not rewrite the session.

## API contract

`GET /api/speaking/options` is public static configuration (no model call):

```json
{
  "logic_templates": [{"id": "persuasive_pitch", "title": "Persuasive pitch", "description": "Make a case under pushback", "steps": ["Context", "Tension", "Proposal", "Defend"]}],
  "max_structures": 5,
  "max_expressions": 5,
  "max_targets": 5,
  "min_items": 0
}
```

`POST /api/speaking/sessions` requires Clerk identity and accepts:

```json
{
  "client_id": "a stable UUID for this submission, retained across retries",
  "scenario_type": "workplace",
  "goal": "Agree on a revised project deadline",
  "difficulty": "standard",
  "feedback_level": "balanced",
  "logic_template_id": null,
  "corpus_item_ids": ["account-owned corpus UUID"]
}
```

For current Free conversation, send an empty `corpus_item_ids`, null logic and
omit plan/candidate IDs. The API still reads legacy eight-item create payloads;
new targeted planning has one shared five-item budget. New free sessions use the
same owner/client-ID idempotency contract as targeted sessions.

`GET /api/speaking/sessions/{session_id}` is owner-scoped. Both return:

```json
{
  "id": "UUID", "user_id": "verified Clerk subject", "client_id": "UUID",
  "scenario_type": "workplace", "goal": "Agree on a revised project deadline",
  "difficulty": "standard", "feedback_level": "balanced",
  "logic_template": null, "status": "draft", "created_at": "ISO timestamp", "turn_count": 0,
  "items": [{"id": "snapshot UUID", "corpus_item_id": "UUID or null after deletion", "ordinal": 0, "kind": "chunk", "text": "to be fair", "meaning": null, "tags": [], "slots": {}, "source_title": null}]
}
```

Validation failures use 422, missing/unowned corpus or session uses 404, same client ID with a different payload uses 409, unavailable persistence uses 503. Error detail is a safe user-facing string. Creation is atomic and idempotent per owner/client ID; replays return the original snapshot even after corpus edits/deletions. No configured database request silently falls back to memory. Inline tests may use the deterministic in-memory adapter.

The original preparation-only increment displayed saved setup and language;
real-time conversation and evidence were delivered subsequently under the Stage 4
contract. The Quick start redesign does not replace that runtime.

## Original increment verification — 2026-09-30

These historical results do not verify the current Quick start change; its
current checks and hosted migration status are listed above and in `TASK.MD`.

- Final root `pnpm lint`, `pnpm test`, and `pnpm build` passed: 494 API, 252 web and 112 extension tests (858 total; unchanged API/extension tasks reused caches).
- `apps/api/tests/test_speaking_loadout.py` covers schema/limits, identity, snapshot stability, safe persistence errors, repository transport and retry behavior.
- Migration `20260930114115_speaking_loadout_sessions.sql` is applied to the connected development project. `apps/api/tests/speaking_loadout.sql` passed in a rolled-back real database transaction, including service-only privileges and immutable snapshots.
- `apps/api/scripts/verify_speaking_loadout.py --run-live` passed against actual Supabase through FastAPI and the REST repository. It exercises concurrent idempotent create, retrieval, settings, idiom support, cross-owner rejection, source edit/deletion and repeated creation after source deletion. All synthetic profiles and dependent rows were removed and cleanup was rechecked. Clerk identity is substituted only inside this opt-in script; it does not verify real OAuth.
- Browser acceptance uses the real UI and media APIs with isolated identity/API fixtures. It covers 1440/768/390 widths, guest refresh/login/server-ID mapping, selection limits, filtering, preview, failed-create retry, session recovery, account switching and explicit guest-draft adoption. Stage 1 save → loadout → session and pending Shadow-save navigation pass; the latter verifies released playback/microphone resources while the save finishes.
- The final browser suite also verifies Space/Enter interaction and 200%-equivalent reflow at 720×525 (not native browser zoom), without horizontal overflow. Two tabs competing for real Web Locks preserve account drafts, continuous edits and uncertain-request UUIDs. Pending writes survive SPA links and history Back/Forward, expose exit protection, and cancel when the owning account changes.
- Security advisors report no new warnings/errors; the existing private-schema RLS-without-public-policy informational notice is unchanged.

## Ownership and runtime notes

- Corpus storage/API/hook code is shared under `features/corpus`, with compatibility exports for Stage 1 callers.
- `PracticePersistence` lives under the shared root layout. Its children stay mounted across authentication updates; account changes fence and dispose the old queues. Completed-take saves continue across client-side routes, while page refresh/exit still requires pending uploads to finish.
- Drafts use a versioned local envelope and Web Locks where available. All mutations share the lock. Input renders optimistically; starting a mission or signing in waits for durable storage. Queued writes survive SPA unmount but cancel on an actual account change, with exit protection until pending writes finish. A prepared submission persists its complete request and UUID before the API call; an uncertain response can replay the same request even if the source corpus subsequently changes.
- The original preparation-only increment included no new model call, microphone permission, production deployment, real Clerk/OAuth verification, full corpus editing UI or real role-play. Subsequent planning, corpus and conversation delivery are documented separately above.
