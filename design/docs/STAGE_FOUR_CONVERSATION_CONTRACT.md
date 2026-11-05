# Stage 4 Conversation redesign: state and data contract

## Stage 4 reply references — 2026-11-03

User instruction supersedes speech-start hint fade-out: retain the already
visible ready hint and the current partner question while the learner speaks,
types, submits and waits for the next reply. Retention is a client-only read-only
reference, separate from live question/help state. Do not show pending or unseen
results, advance help, restart timers, or create duplicate exposure receipts.
The first subsequent partner text/audio output (or new finalized assistant turn)
replaces the reference; pause, disconnect and end clear it. Voice retains the
partner question instead of replacing it with the learner's live transcription.
Backend question/version retirement and delayed-result rejection stay intact.


Date: 2026-11-01. Status: **steps 1–4 implemented: contract, UI/fixtures,
negotiated OpenAI question/help runtime and minimal recast/report integration**. See
[UI implementation and boundaries](STAGE_FOUR_IMPLEMENTATION.md).

This contract was defined in step 1 of the user-requested Conversation redesign. The supplied
[prototype](../prototypes/Stage%204%20%C2%B7%20Conversation-html/Stage4.dc.html)
defines the visual reference; the user's written rules and subsequent correction
take precedence. The existing [runtime contract](STAGE_FOUR_RUNTIME_CONTRACT.md)
describes the base transport and legacy behavior; this document governs the
selected Conversation protocol. Gemini currently advertises no new protocol.

## 1. Product decisions

- Help comes primarily from the partner's natural speech. The UI has one help
  position, not a stack of direction, meaning, pattern and example cards.
- Guided, Standard and Challenging show all target wording and meanings from
  entry so learners know which expressions to transfer. This 2026-11-01 user
  decision supersedes default concealment. Manual Hide/Show remains available;
  confirmed models and observed uses still reveal their targets when hidden.
  Speaking hides question help, not target wording.
- A confirmed model means the existing validated reflection AND presentation
  evidence. Sent instructions, generated audio, uncertain/partial exposure or a
  raw target substring are insufficient. Existing independent/assisted-use
  accounting remains authoritative; neither reveal nor modeling is a learner use.
- The 8/20-second values are initial configurable defaults, not measured optimal
  thresholds or exact wall-clock delivery promises.
- Resolve the earlier wording conflict as: at most **one spoken simplification
  and one automatic UI direction** per question. Only direction can be automatic;
  opening words and examples always require a click. This deliberately permits
  both the 8-second and 20-second actions, rather than a single combined action.
- No `Target modeled`, `Used on your own`, `Your turn`, grammar category or
  teaching instruction in the conversation surface. Evidence labels belong in
  the target panel/report. `Take your time.` is the only silence reassurance.
- Voice shows the current utterance (possibly several short sentences), never
  a transcript history. Chat retains actual messages and stage names only on
  dividers. Mode selection is presentation; microphone state controls audio.

## 2. Independent states and ownership

Do not create one enum mixing connection, speech, help and design-demo states.

| State | Owner | Values / source |
| --- | --- | --- |
| Connection | Existing client/controller and server lease | Existing loading, idle, connecting, connected, paused, disconnected, ended, error |
| Response | Existing runtime | listening, thinking, speaking; playback acknowledgments separately gate readiness |
| Learner activity | Server VAD + client activity | speaking, pending transcription/submission, draft present |
| View | Client | voice or chat; changing it never resets question/help budgets |
| Question | Server, persisted | presenting, awaiting_reply, responding, answered, superseded, interrupted, closed |
| Help request | Server, persisted current result | loading, ready, unavailable, retired |
| Help visibility | Client, receipts persisted | hidden, visible, fading; only actual visible content establishes exposure |
| Recast | Server, persisted | ready, retired, unavailable; spoken/visual presentation recorded independently |

Server decides when help is eligible and reserves automatic attempts. Client
can suppress display immediately when local activity/visibility requires it,
but cannot award use, declare a question answered, or reset an automatic budget.

## 3. Question identity and lifecycle

A question is one invitation for a learner response, including an invitation
such as “Tell me what changed.” It is not a stage index, target ID, question-mark
count or provider response ID. Several questions may belong to one stage/target;
a question can have no selected target. Allow only one active question.

Application-owned references and public shape (implemented for question/help and recasts):

```typescript
type MessageRef = { message_id: string; revision: number };
type QuoteRef = MessageRef & { start: number; end: number; quote: string };
type ConversationQuestion = {
  id: string;                       // server UUID; stable through simplification
  context_version: number;           // >= 1; fences changes to its actual wording
  origin: QuoteRef;                  // actual initial assistant invitation
  current: QuoteRef;                 // latest finalized wording; status gates delivery
  stage_index: number | null;
  target_item_id: string | null;
  status: "presenting" | "awaiting_reply" | "responding" | "answered"
    | "superseded" | "interrupted" | "closed";
  auto_rephrase: "available" | "reserved" | "completed" | "suppressed" | "failed";
  auto_direction: "available" | "reserved" | "completed" | "suppressed" | "failed";
  automatic_help_closed: boolean;
};
```

`QuoteRef` uses zero-based, half-open **UTF-16** offsets into the exact message
revision; slice equality is required. No fuzzy fabricated quote or Python-code-
point offsets. Question refs point to assistant messages; recast source refs
point to finalized learner messages. Foreign-session refs are invalid.

Allocate identity when an actual finalized assistant invitation is identified
and validated against its transcript. Use the associated planned opportunity
when available; otherwise an asynchronous, bounded invitation analysis. A model
must not delay the initial spoken response. Until metadata is valid, display
normal conversation without automatic help; punctuation alone is insufficient.
The question becomes awaiting_reply only after actual presentation. Missing or
interrupted delivery never starts a timer for an unheard question.
During a rephrase, move to presenting; only validated presentation returns it
to awaiting_reply. If rephrase validation fails, retain the original current
ref, mark the attempt failed and close automatic help rather than prompting
against uncertain context. A draft already present when the question is
created also closes its automatic help, even without a new draft-change event.

| Event | Transition / invariant |
| --- | --- |
| Normal next invitation | New UUID; previous unresolved question superseded |
| Simplification of current invitation | Same UUID; append a real assistant message; advance context_version/current ref only after validation; do not reset budgets |
| Question transcript revision changes | Increment context_version; retire old requests/results and revalidate refs; preserve consumed budgets |
| Learner speech starts | responding; close automatic help and retire live/in-flight help; keep already shown content as a read-only reply reference |
| Finalized nonblank learner reply | answered; a reply is not automatically a target use or a correct answer |
| Speech ends without usable transcript | Return to awaiting_reply when safe, but automatic_help_closed stays true; manual help remains possible |
| New text draft | Retire current help and close automatic help; clearing the draft does not reopen automatic budgets |
| Topic change / skip of associated target | Supersede or detach based on actual invitation; retire target-specific help; no synthetic learner turn |
| Pause / disconnect / takeover / end | Close automatic help; retire pending outputs; retain facts and used budgets |

On reconnect, an unanswered question may remain available for explicitly
requested help after its transcript/ref validation; do not replay its audio or
restart its timers. If delivery is uncertain, leave it interrupted and wait for
a new real invitation. A rephrase is never a new question solely because it has
a different provider response ID.

## 4. Timing and automatic-action budget

Configuration defaults: `rephrase_after_ms = 8000`, `direction_after_ms = 20000`,
with `0 < rephrase_after_ms < direction_after_ms`. Freeze these values for the
connection; expose thresholds for diagnostics, not a learner countdown.

Accumulate eligible silence using a server monotonic clock. Start at the first
instant all of these are true, with no retroactive catch-up if metadata is late:

- A validated current question is awaiting_reply and its response has finished.
- Voice output has acknowledged complete playback; for a text response, the
  finalized message has a real visible-text receipt.
- Microphone enabled, active lease, visible/unobscured conversation surface,
  fresh client activity state, and no pause/end.
- No learner speech, draft, pending transcription/submission, provider response
  request/generation, pending output playback, or explicit help request.
- `automatic_help_closed` is false.

At >=8 seconds, atomically reserve rephrase once, then request one simpler
in-role version of the **same** invitation. Pause eligible time during its
generation/playback; resume the accumulated value afterward. At >=20 eligible
seconds, reserve direction once. Example: 8 seconds silence + 4 seconds spoken
rephrase + 12 seconds silence gives a direction no earlier than wall time 24s.
Do not reset to zero after rephrasing or trigger both actions in one late tick.

Commit the reservation under the runtime's owner/CAS fence **before** provider
I/O. A crash, failed generation, unknown delivery or lost lease consumes that
automatic attempt; no automatic retry. Actual presentation is a separate fact.
A valid manual request closes both remaining automatic actions, preventing the
8-second rephrase from talking over someone already asking for help.

Budget transitions are `available -> reserved -> completed | failed`, or
`available -> suppressed`. Completed requires validated actual presentation
(playback/text for rephrase, a matching help.shown receipt for direction).
Reserved is already consumed; pending receipts may resolve its delivery later.
Neither failed nor suppressed transitions back to available. An unknown send/
playback outcome stays unconfirmed in the delivery ledger even if operational
cleanup marks its reserved attempt failed. Retry is a separate manual request.

Hidden surface, mute, pause, disconnect and explicit interrupt close automatic
help for this question; returning or unmuting requires a new invitation for
automatic help. Mere Voice/Chat switching does not close it. If speech starts
during a requested rephrase, use existing cancel/truncate handling and never
queue the rephrase behind the learner's next turn. The simplification control
must not attach an unrelated modeling/elicitation action.

Pure text mode has no automatic silence actions. Chat with an enabled microphone
uses the same rules as Voice. No VAD false start, visibility change, reload,
reconnect or hide/reveal operation replenishes a question's budget.

## 5. Single-position help contract

Design levels 0 and 1 are absence/reassurance, not generated cards. Design levels
2–4 map to existing assistance categories, but the new content is versioned:

| Design level | Wire level | Content | Next button |
| --- | --- | --- | --- |
| 0 | none | No help | Need a hint? |
| 1 | none | Take your time., following the actual simpler question | Need a hint? |
| 2 | direction | One communicative idea, “You could…”; no selected wording/answer | Opening words |
| 3 | usage | Short incomplete opening ending in an ellipsis | See an example |
| 4 | example | One complete contextual example | Hide hint |

Reassurance is replaced by direction. Each deeper level replaces the previous
level, never accumulates. Voice placement is between the current utterance and
microphone; Chat placement is immediately above its bottom input/microphone bar.
Allow natural wrapping on narrow screens rather than clipping accessible text.

```typescript
type ConversationHelp = {
  id: string; version: number;        // request UUID; server content version >= 1
  question_id: string; question_version: number;
  target_item_id: string | null;
  source: "automatic" | "requested";
  level: "direction" | "usage" | "example";
  status: "loading" | "ready" | "unavailable" | "retired";
  direction: string | null;
  opening_words: string | null;
  example: string | null;
  error_code: "unavailable" | "invalid_content" | null;
};
```

For a ready result, exactly the field corresponding to `level` is non-null;
others remain null even if privately precomputed. Loading/unavailable/retired
results expose no generated wording. Do not leak the old expression/meaning/
pattern fields while a direction or opening is loading. The 2026-11-01 latency
update retains the previous ready card in the same display position while its
next level loads, only for the same question/version/target. The current wire card
still contains no loading wording: retained display is a separate client-only
reference to an already received card. Replace it when the next result is ready;
a failure offers Retry at that same level, never silently advances. Disable
repeated advancement immediately while loading. Show loading feedback only after
250ms; fast cache responses never deliberately wait. A slow first request uses
“Finding a little help…”, while a slow upgrade keeps prior text and adds a small
spinner to the action. Mode switches retain the same pending display. Speech,
drafts, question/version/target/support changes and disconnect discard retention.
Receipt callbacks carry the painted card ID/version, not the pending card ID.
Hide retires the card; reopening starts at direction with a new request ID,
without clearing earlier exposures or consumed automatic budgets.

### On-demand bundle generation and private cache — 2026-11-01

The first eligible help request generates direction, opening_words and example
in one text-model call (`conversation-help-bundle-v1`, <=900 output tokens,
existing 12-second provider deadline). All three follow one communicative idea
and must pass their existing validators before any part is cached. There is no
per-level repair loop or fallback that pretends unvalidated wording is contextual.

Cache one bundle/in-flight task per live connection, never globally or in a
public workspace/report. Its context includes question ID/version, exact current
quote/revision, selected target/version, explicit support/version, activity epoch
and recent transcript IDs/revisions/statuses. Same-context requests share the
pending generation. A ready cache hit publishes only the requested level directly
as ready in one CAS write; it does not persist an intermediate loading transition.
New contexts replace the entry, input invalidates/cancels it, and disconnect
clears it. Failed generations are not cached; retries can make a new request.
Reconnect starts cold while persisted question/help/exposure compatibility remains.
No SQL migration, new client event or public bundle fields are required.

By user decision, do **not** pre-generate before help is requested for now:
learners may never ask, so speculative calls can incur unnecessary model cost.
Pre-generation is not an active follow-up, and hint preparation must not become
a prerequisite for entering a session. The existing
20-second automatic direction is also an eligible first request, but preparing
the other levels neither displays them nor consumes manual levels or exposure.
`help.shown` still requires a matching delivered ready card and real visibility;
old actually painted levels remain attributable during a pending upgrade.
Sanitized `conversation.help_bundle` diagnostics record generation outcome/time;
`conversation.help_ready` records cache hit and request-to-ready time, without
logging bundle content. These are server timings, not measured device end-to-end
latency or a promise that the first request is instantaneous.

Initial content bounds: direction <=160 characters; opening <=120 characters
and at most 12 whitespace-delimited words; example <=400 characters, one
sentence. Validate intent and incompleteness as well as length; do not truncate
an old frame/answer to make it pass. Direction must not disclose any selected
target. Reject instruction-style wording such as “Try to use…”. An example for
a target must satisfy existing exact/variant/structure grounding rules. Failure
returns unavailable, not a generic direction falsely claimed to be contextual.

Null target is valid for Free conversation and conversational help when no
unskipped target fits. Such help must still relate to the current invitation;
it neither invents a corpus item nor contributes to target-use statistics.
Explicit target selection must refer to an owned, unskipped session item and
fit the current question. Invalid requests fail without consuming a new level.

Accept an async result only for the latest request ID, same question/context,
same support version where applicable, current runtime generation and open
session; check these conditions again on commit. Speech, draft activity or
retirement invalidates that request even if question wording has not changed.
An unrelated higher workspace version is not proof a stale hint is current.

At learner onset, freeze the already shown ready hint and partner question as
read-only references. Do not display late results, upgrade hints or send new
exposure receipts. Retire the live request independently. Keep references through
pauses in speech and thinking; clear them on the next partner output or runtime
closure. Reduced motion changes animation, not reference retention.

## 6. Simpler questions and the frozen plan

Extend `SpeakingPlanTarget` and its candidate/frozen Mission projections with
optional `simpler_question: string | null` (initial bound 240 characters / 30
words). This is a companion to `trigger_question`, not an independent script
for every future turn. New generation should produce and validate it together
with the scene; a missing/invalid optional simplification does not block Start.

The simpler question must preserve communicative intent and scenario facts,
use simpler syntax/vocabulary, ask only one thing, and disclose neither the
target expression nor a completed learner answer. Do not confuse this with
`model_line` (partner demonstration) or `sentence_frame` (legacy visual help).

If the actual invitation still matches the frozen planned intent/context, the
runtime may use this wording. Otherwise rephrase the actual current question
in-role, including for free/dynamic conversation. Do not read an unrelated
precomputed line after the conversation has moved on. The chosen source and
validation outcome are private diagnostics. No second SessionBrief authority
or per-turn plan regeneration is introduced in this increment.

Generating the new field requires a planner prompt/cache version change and
updates to validation, repair, freeze and linked-round copies. Old saved plans
remain immutable; never backfill their serialized snapshot/hash, request
identity or exact-retry payload. Missing field reads as null only in the
projection; serializers/hashes must preserve legacy absent-field behavior.

## 7. Lightweight correction / recast contract

A recast is a suggestion linked to an actual learner utterance, never a rewritten
transcript or learner use. Analyze finalized text asynchronously. High-confidence
here means accepted by the configured language/grounding checks, not empirically
proven correctness or a calibrated probability. Skip uncertain ASR, incomplete
utterances and meaning-changing rewrites. No pronunciation judgment from text.

```typescript
type ConversationRecast = {
  id: string; version: number;
  source: QuoteRef;                  // exact learner clause being rephrased
  replacement: string;              // entire corrected clause, <=400 characters
  edits: { start: number; end: number; before: string; after: string }[];
  changed_spans: { start: number; end: number; quote: string }[];
  status: "ready" | "retired" | "unavailable";
  delivery: QuoteRef | null;         // validated actual partner recast, if any
};
```

Edit offsets are relative to `source.quote`; highlight offsets are relative to
`replacement`, both UTF-16. Apply 1–3 sorted non-overlapping edits to reconstruct
replacement exactly. Every `before` must match; reject unchanged/empty rewrites
and out-of-range or split-surrogate boundaries. The server derives changed
spans rather than trusting model-supplied emphasis. Bold only added/replacement
words; deletion-only edits produce no artificial bold word or strikethrough.
The public view contains no grammar/word-choice category or explanatory lesson.

Private record adds `category: grammar | word_choice`, `rule_key`, validation
status, source transcript revision, creation time, prompt version and spoken/
visual presentation facts. Categories/reasons may feed the report in step 4;
they do not appear in the live conversation. Keep at most one recast per learner
turn. Deduplicate confirmed delivered corrections by category + rule_key +
normalized before/after phrase within the Mission, not by category alone.
Reserve a pending correction so consecutive analysis cannot schedule it twice.

The partner can incorporate a ready recast at the next not-yet-started response
boundary, before continuing the scene. Do not interrupt speech, delay the
current reply for analysis, or send a standalone correction response afterward.
If that boundary is missed or a new learner utterance begins, retire live
delivery; a grounded suggestion may remain report-only. No live “catch-up”.

The partner may also naturally recast a turn before background analysis
finishes. Validate that actual assistant/learner pair asynchronously and derive
the same record from it; no precomputed correction is required for this path.
Publish it only if the source is still the latest learner turn and no new speech
has begun. This allows the current reply to carry a natural recast without
waiting for analysis; a late validation becomes report-only, not another reply.

Show the lightweight line only when the corresponding partner response has
actually presented a validated recast. `delivery` identifies the real recast
quote; generation or a scheduled instruction alone is insufficient. Voice uses
“Your last turn, another way to say it”; Chat attaches “Another way to say it”
to the source learner turn. Hide the live Voice line during learner speech;
historical Chat recasts remain attached to their own turns. Never bold a
correction into the original learner transcript.

If corrected wording exposes a selected target, record that actual exposure
using existing conservative assistance rules, separately from correction
classification. Do not count the assistant's recast as learner use. Unknown
playback remains unknown, and duplicate audio/text receipts must not create
duplicate observed uses. Neither a recast nor its receipt alone proves a
successful target demonstration; retain the existing demonstration checks.

## 8. Protocol, persistence and compatibility

These are planned additive changes; no endpoint/schema is changed in step 1.
Use conversation contract version **1**, independent of Mission Plan v1/v2,
workspace CAS version and transcript/content revisions.

- Add optional `conversation_contract_versions: number[]` to speaking options;
  absent means legacy-only. A new client requests `conversation_contract_version:
  1` on POST `/realtime` only when advertised. Omitted means existing behavior;
  unsupported explicit versions fail before a provider connection/ticket claim.
- Persist the selected version in the active runtime and return it in ready.
  Add optional `workspace.conversation = {contract_version: 1, question:
  ConversationQuestion|null, help: ConversationHelp|null, recasts:
  ConversationRecast[]}`. Missing/null retains the legacy path. Both HTTP and WS
  projections must agree. Recasts here include only confirmed live presentations;
  pending/report-only suggestions remain private.
- Keep existing `workspace.help` and legacy `hint`/`hint.shown` semantics for
  legacy runtimes. A negotiated runtime publishes only the new conversation help
  and does not also emit legacy automatic cards. Do not reinterpret historic
  Usage/Example data as the new short openings.
- Add `help.request {request_id, question_id, question_version, level,
  target_item_id?}`, `help.dismiss {hint_id, version}` and
  `help.shown {hint_id, version, question_id, question_version, level}`. Requests
  are permitted only at a safe boundary for the active question. Advancing to
  usage/example requires the preceding ready level for that question/target;
  requested level is explicit, so a retry cannot accidentally advance it.
- Add `recast.shown {recast_id, version}` for visual presentation. Continue
  using existing playback and message.shown receipts for actual partner speech/
  text; do not invent an independent client “model confirmed” event.
- Add transient `client.activity {sequence, draft_present, surface_visible}`
  on change and with the existing 10-second heartbeat. Sequence is increasing
  per connection; ignore older values. Treat missing or >15-second-stale
  activity as ineligible for automatic help, without spending attempts.
  Never transmit the unsent draft. Surface means visible conversation, without
  a blocking dialog; client suppresses hints immediately before server ACK.
- Existing snapshot/version checks, runtime ownership, authentication, input
  bounds and rate limits apply to new controls. Repeated identical request IDs
  are idempotent; same ID with changed payload fails. Define sanitized
  `help_stale_context`, `help_busy`, `help_invalid_target`, `help_invalid_level`,
  `conversation_contract_unsupported` errors with request correlation. Rejection
  never advances a level or marks a target used.

Persist question IDs/refs/closed budgets, help versions, recast records and
exposures in the existing bounded runtime document. Do not persist monotonic
timestamps, draft contents, audio, frame deltas or per-tick counter updates.
Only transitions reserve/complete actions through CAS. Keep current question
and recent help payloads bounded; archive only references needed by receipts
and evidence. Initial bounds: <=200 question records, <=100 recasts, <=100 manual
help requests per connection; preserve the existing 1 MiB document ceiling.
When a bound is reached, disable further optional help/corrections rather than
evict evidence/budget tombstones required for truthful attribution or break the
conversation. Physical storage/schema changes, if needed at implementation,
require their own migration verification; none is assumed applied here.

Receipts can arrive after retirement/reconnect. Preserve matching known content
long enough to record an actual earlier presentation through the existing
shutdown drain; never resurrect its UI. A stale generation cannot initiate a
new action. Missing receipt is not proof of no exposure; retain existing
overlap/unknown attribution when event ordering or delivery is uncertain.

| Existing data / client | Compatibility behavior |
| --- | --- |
| Old options/server or omitted requested version | Legacy runtime and help renderer; new client does not send unsupported events |
| Old session without question metadata on a new negotiated runtime | Keep transcript/evidence; do not invent historic questions/receipts; first new actual invitation starts tracking |
| Old plan without simpler_question | Null projection; contextual runtime simplification if eligible; never mutate frozen plan |
| Old help Usage contains expression/meaning/frame | Historical legacy help only; never truncate or relabel as opening words |
| Old v1 explicit support choice | Keep support selector and modeling policy; automatic UI direction remains disabled under its existing explicit-support rule; manual new help remains available |
| v2 staged Mission | New one-position timed-help policy; fixed once-per-unused-target demonstration rule remains intact |
| Free conversation | No invented targets/logic; null-target question/help/recast allowed |
| Completed / abandoned Mission | Read-only; no new timer, model request, correction or assistance receipts |
| Existing report / retry / linked round | Keep input hash and historical provenance; no retrospective rescore; new optional fields copied only through explicit new-plan generation |

For negotiated presentation, show target wording by default, including Guided;
an old v1 explicit model-frame/model-label display remains a documented legacy
support exception until the user changes that choice. This avoids silently
discarding an existing explicit support preference. Do not confuse a frozen
default ignored by v2 modeling with a live v1 support setting.

## 8a. Confirmed stage markers (2026-11-01)

Optional `conversation.stage_markers` defaults to `[]`. Each marker contains
`source: ConversationQuote`, `stage_index: number` and `label: string`. The index
is captured on the response request, not recomputed after asynchronous analysis.
The grounded question retains that index through rephrasing. Record the marker
only after final text visibility or complete audio playback confirms the origin.
Labels come from the session's frozen logic steps. The public view revalidates
exact assistant role/status/revision/UTF-16 quote and collapses consecutive marks
for the same stage. UI repeats those guards. Private receipts are question-scoped,
idempotent, capped at 200, and included in the existing bounded end drain.

Legacy history without a marker has no inferred divider; a current stage must not
relabel earlier turns. Rephrasing does not add a new stage. Reconnect/end preserve
confirmed markers; source revisions or interruptions invalidate them. This is an
optional protocol-1 projection using existing runtime JSON; no SQL migration.

## 9. Target visibility and evidence

New target visibility applies to v2 and to v1/no-plan sessions without explicit
support, including preconnection rendering. Explicit v1 support remains unchanged.
For the new default, legacy demonstrations also require exact assessment and
presentation revisions. Owned unplanned targets can report actual visibility once
protocol 1 is negotiated; unknown/foreign IDs are rejected. Targets seen before
connection are queued and acknowledged before the next submitted learner turn.

New target visibility is derived, not a new learning-state enum:

`visible = show_targets || confirmed_model || validated_learner_use`

`show_targets` starts `true` on mount; manual Hide targets changes it to `false`.

`validated_learner_use` means a revision-valid observed-use record, not merely
an answered opportunity. It does not imply correctness or mastery. Only
`modeling_status == modeled` with its valid evidence establishes confirmed_model
for staged v2 Missions; legacy v1 uses the existing validated demonstration
projection when stage_progress is absent. Exposed/uncertain/not_needed are not
interchangeable with modeled. If evidence
is invalidated by a transcript revision, recompute display but do not erase
actual prior visual exposure.

Targets start visible. Show targets reveals all; Hide targets conceals only targets with neither
confirmed modeling nor observed use. Record actual wording visibility with
existing target.shown machinery, including automatically revealed wording,
without duplicating use counts. Sidebar exposure after a learner's independent
use does not retroactively turn that earlier use into assisted use. Persisted
exposure does not control the display toggle; each new page mount starts visible.

Keep purple dashed underlines on verified partner model spans. Unavailable
analysis does not manufacture highlights or auto-reveal. Skip/restore affects
scheduling, not historical evidence. The panel/report may show modeled/assisted/
independent states; the conversation itself must not announce those mechanisms.

## 10. Implementation sequence and acceptance gates

Step 1 delivers this contract and living-document reconciliation only. Steps
2–4 introduce concrete Python/TypeScript schemas together with their producers
and consumers; do not advertise support before the runtime is complete.

1. UI with explicit synthetic fixtures: layout, current Voice utterance, single
   help slot, recast placement, target reveal and all connection states.
2. Wire schemas, protocol negotiation and runtime: question identity, monotonic
   timer/budget reservations, simpler-question planning, help generation and
   presentation receipts, owner/revision/async fencing and legacy adapter.
3. Recast analysis, next-response binding, actual-delivery validation, private
   classification and report integration without rewriting learner messages.
4. Automated cross-layer regression, desktop/mobile visual checks, then separate
   real provider/audio checks. Update implementation truth only after each lands.

Required contract cases for subsequent tests:

- Exactly one rephrase at eligible 8s and one direction at eligible 20s; AI
  playback time excluded, one question ID retained, no automatic usage/example.
- Speech/draft at 7.9s, during rephrase or during help generation prevents late
  display; VAD-only false starts do not reopen automatic help.
- Manual help before 8s suppresses automatic actions; double click/retry cannot
  skip a level; hide/reopen cannot erase prior assistance.
- Mute, hidden tab, stale activity, pause, takeover, reconnect and view changes
  follow the different budget rules above; new invitation gets a new budget.
- New question, transcript revision, skip and out-of-order snapshots reject old
  results; old presentation receipts remain evidence without reviving UI.
- All targets start visible before connecting; speech does not hide wording.
- When manually hidden, clear model auto-reveals its target; partial/uncertain model does not; observed
  learner use auto-reveals; Hide targets preserves both automatic reveals.
- All three help levels produce only their one allowed field; direction has no
  selected wording; free conversation accepts null-target contextual help.
- Recast spans validate UTF-16 including emoji/repeated words, edits reconstruct
  the replacement, deletion-only edits fabricate no emphasis; stale/ASR-uncertain
  corrections are omitted and actual learner text remains unchanged.
- Old plans, missing fields, completed sessions, explicit v1 support, old clients,
  exact creation retries and linked-round hashes retain their original meaning.
- Reservation/commit failure and unknown playback never become confirmed help,
  correction, modeling, independent use or mastery.

These are acceptance requirements, not tests claimed to have passed in step 1.
