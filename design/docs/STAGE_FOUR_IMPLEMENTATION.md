# Stage 4: live conversation

## Deterministic target candidates — 2026-11-06

Teaching analysis v6 receives bounded, source-positioned target candidates and
reviews each candidate ID for contextual appropriateness. Exact lexical spans,
supported contractions/inflections and filled structure anchors are computed by
the server. A uniquely contained exact phrase can be trimmed from an overlong
model quote without changing its semantic verdict. Partial words, cross-sentence
variants, paraphrases and unfilled structures cannot establish usage. Mentioning,
quoting or denying use of a card phrase remains separate from using it in context;
ordinary sentence negation is not automatically inappropriate.

Missing, duplicate or unknown candidate reviews are diagnosed, with lexical-only
observations remaining uncertain. Stage 5 shares the matching rules. Teaching
analysis keeps its single-call latency budget and the existing exposure ledger;
no voice, hint-display or assistance-attribution behavior changes. See the
[real regression results](../benchmarks/text-quality-20261106/COMPARISON.md).

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


## Stage 4 reactive partner orb and Chat pause — 2026-11-03

The partner orb uses layered local CSS motion for gentle breathing and fluid
color movement, inspired by the ElevenLabs Orb interaction. Actual rendered
output volume from Web Audio controls its amplitude; queued network chunks and
microphone input do not. Interrupted/ended/suspended output reads zero. Animation
sampling stays outside React state, stops in hidden tabs, and respects reduced motion.
No provider change or extra microphone stream is introduced.

Chat places Pause conversation beside the microphone in the bottom audio bar.
Pause uses the existing runtime cleanup and preserves the transcript; the same
position offers Resume conversation (or Start/Reconnect while offline). Chat
resume keeps capture off until explicitly enabled. Narrow screens retain an
accessible icon-only pause button. Target visibility and hint policy are unchanged.


2026-11-01 target visibility correction: the live and preview target panels start
expanded with wording and meanings visible. Manual Hide/Show remains available;
speech only hides question help. Actual visibility still records assistance,
never learner use. This supersedes the earlier concealment default.

## Hint latency update — 2026-11-01

Protocol 1 now prepares/validates a three-level help bundle on the first eligible
request. One connection-local private cache shares concurrent generation and
serves requested upgrades directly; no unrequested wording enters a workspace.
Question/quote/target/support/transcript versions and input epochs fence reuse.
Failure remains retryable, and disconnect clears the cache. No pre-generation
before a request or new SQL/public event contract is introduced.

The controller delays loading feedback by 600ms and retains the previous ready
card during a same-context upgrade. `QuestionHelp` reports the actually painted
card ID/version, including across Voice/Chat switches; it never acknowledges the
pending level. Cache-hit/request-ready and generation timings are recorded in
sanitized diagnostics. First-request model latency still exists; see `TASK.MD`
for validation rather than treating synthetic tests as provider latency claims.

## Design alignment — 2026-11-01

The audit's four functional gaps and two visual differences are addressed.
Concealment uses explicit-support presence, not only Mission version. Stage
markers bind request-time stage identity to confirmed question presentation and
persist in private runtime JSON; public revision-validated markers drive actual
Chat dividers. Missing old history remains unmarked. Evidence detail opens in
Targets on desktop/mobile. Chat's wrapped hint now has 16px text, `--surface` (`#FAFAFA`) background
and 14px/18px padding. Confirmed silent rephrases show “Waiting for you”; the guide
has its known current-stage cue. The marker/target contracts and limits are in
[Conversation contract](STAGE_FOUR_CONVERSATION_CONTRACT.md); current verification
is recorded in `../../TASK.MD`. No SQL migration is required by this increment.

## Conversation redesign status — 2026-10-31

[State/data contracts](STAGE_FOUR_CONVERSATION_CONTRACT.md) are defined for the
user's new prototype and hint design, including confirmed-model target reveal.
Steps 1/2 defined the contract and delivered visual components/preview. Step 3
implements the Python/TypeScript protocol and negotiated OpenAI runtime. Step 4
connects asynchronous minimal recasts and frozen report annotations. Old clients and the explicit Gemini provider keep legacy behavior.

`GET /options` advertises `conversation_contract_versions`; the client selects 1
in the realtime POST only when supported. Selection is returned in runtime state.
The backend analyzes finalized actual invitations asynchronously and binds them
to UUID/context version plus exact UTF-16 message refs. No historical question is
fabricated. A simpler question retains its UUID; a normal next invitation replaces
it. Reconnect closes previous automatic budgets rather than replaying them.

`SPEAKING_REPHRASE_SECONDS=8` and `SPEAKING_DIRECTION_SECONDS=20` are frozen per
connection and must be ordered. A two-second heartbeat accumulates eligible
silence only after validated question metadata and actual presentation. Generation,
playback, speech, drafts, pending transcription, invisible surfaces and client
activity older than 15 seconds are excluded. Client activity contains booleans and
an increasing sequence, never draft text; it is sent on changes and every 10 seconds.
Pure text does not trigger silence actions. Legacy explicit support still suppresses
automatic direction. One spoken rephrase and one automatic direction can be reserved
per question; opening words/examples require manual requests. Input closes automatic
help and retires pending/visible cards. All model completions recheck question,
context, activity and support, with runtime ownership enforced by the existing CAS.

`help.request` replaces a single card with direction, opening words or an example.
`help.shown` acknowledges only painted, unobscured content; `help.dismiss` retires it.
Generation/loading does not count as exposure. Question-linked receipts include
level and overlap; targetless receipts persist without inventing target use. If their actual wording
incidentally contains another selected expression, that exposure is also recorded
conservatively.
Late receipts for actually shown cards remain attributable. Explicitly starting
again at direction is allowed after an uncertain timeout; it cannot erase earlier
exposure. End/disconnect retain the existing bounded receipt-drain behavior.

New plans optionally freeze `simpler_question`; absent/invalid values are omitted,
so old serialized plans and retry fingerprints remain unchanged. Runtime validates
against the actual invitation rather than assuming a planned question was spoken.
New generation prompt versions are v7 and v8-logic. Step 3 needs no SQL migration;
private state uses existing runtime JSON and its size/CAS limits. Questions are
bounded to 200 per session and manual requests to 100 per connection.

The actual route now uses `ConversationPresentation.tsx` and the redesigned
`Speaking.module.css`: neutral page, pill controls, stage guide from existing
progress, current-utterance Voice, text-first Chat and a responsive 332px desktop
target panel. On phones the Targets toggle reveals the panel below conversation;
desktop/tablet retains the focus control. Confirmed modeling and valid learner
use reveal staged targets; Show targets exposes remaining wording through the
existing visibility receipt path. Unknown/partial modeling does not auto-reveal.
Existing v1 support keeps its legacy sidebar rules.

For unnegotiated runtimes, legacy HintCard stays connected to Usage/Example data and receipts;
it is placed inside Voice or above Chat controls, never rendered twice. It is
not relabeled as opening words. No historical stage dividers or recasts are
invented from a current-stage snapshot. The microphone activity bars indicate
activity, not measured amplitude. Existing authentication, text submission,
microphone, playback, interruption, reconnect, end/delete and support handlers
are reused. Step 3 extends controller/backend orchestration; the audio transport
and target-model/use validation retain their established behavior.

The shared components' new help and silence states now receive negotiated live
state through `QuestionHelp`. Confirmed recasts now enter the real Voice/Chat
route through `ConfirmedRecast`; example stages/recasts in
`features/speaking/preview` remain explicitly synthetic. `/dev/conversation` is a dynamic,
server-gated route: `LIBITU_CONVERSATION_PREVIEW=1` enables it; otherwise 404.
It cannot create a Mission or start audio/provider requests. Example local launch:

```bash
LIBITU_CONVERSATION_PREVIEW=1 pnpm --filter @libitu/web exec next start -p 3104
```

Run `speaking-design.browser.mjs` against that server with `LIBITU_TEST_URL` and
the existing `LIBITU_PLAYWRIGHT_MODULE` convention. It checks 1440/768/390px
preview states and 1440/390px real-route rendering with synthetic auth/API/socket
events. `speaking-conversation.browser.mjs` verifies the negotiated live route
with synthetic auth/API/socket events at 1440/390px. `speaking.browser.mjs` and `speaking-help.browser.mjs` retain lifecycle,
media and legacy help regression coverage. Verification results are in `TASK.MD`.

Implemented locally, 2026-10-01; default voice provider switched to OpenAI on 2026-10-30. The earlier [implementation plan](STAGE_FOUR_IMPLEMENTATION_PLAN.md) is design history; this page and [runtime contract](STAGE_FOUR_RUNTIME_CONTRACT.md) describe current behavior.

## Delivered behavior

### Minimal partner recasts (Conversation protocol 1)

`speaking_recasts.py` analyzes finalized learner text through the existing bounded
selected text-provider JSON adapter (`conversation-recast-v1`). At most one candidate per turn
contains 1–3 exact UTF-16 edits; the server reconstructs the replacement and
derives changed-word spans. Uncertain ASR, incomplete utterances, broad rewrites,
changed names/numbers/negation/commitments and ungrounded quotes are rejected.
Deletion-only edits create no artificial bold text. These gates reduce unsafe
suggestions; they do not establish measured model accuracy.

`speaking_recast_runtime.py` binds the learner ID/revision at response creation,
including voice placeholders whose ASR finishes later. A ready candidate can be
reserved once before normal response I/O. Analysis never delays that reply or
creates a separate catch-up response. A second asynchronous pass validates the
actual learner/partner pair, including naturally spoken recasts that preceded
the candidate. Source revision, runtime ownership, input epoch and deduplication
by rule plus edit fence late completions. New input closes live eligibility;
late validated suggestions can still be report-only.

Generation and instructions are not delivery. A live recast requires a validated
final partner quote and actual text visibility or fully acknowledged audio.
Voice retires its current recast on new speech/draft; Chat keeps confirmed history
beside the original learner turn. `recast.shown` records actual visibility once
per ID/version and conservatively attributes any selected wording as assistance.
It never creates learner evidence, independent use or target-model confirmation.
End/disconnect include pending receipts in the existing bounded drain/merge path.

Report responses expose optional top-level `recasts` with `grammar|word_choice`,
a short reason, the exact source, replacement and whether delivery was confirmed.
The live projection omits these categories and reasons. The existing rubric and
assessment scores are unchanged. Migration
`20261031091811_speaking_conversation_recasts.sql` extends only the frozen-source
whitelist in `enqueue_speaking_feedback`; nested data is whitelisted, old absent
fields and existing report retries remain unchanged. It is applied to hosted
Libitu; this is not an application deployment.

`test_speaking_recasts.py`, `speaking-recasts.test.mjs`,
`speaking-recasts.browser.mjs` and rollback-only `speaking_recasts.sql` exercise
the delivery gates, stale revisions, receipt persistence, report privacy and
desktop/mobile presentation. Recorded results and remaining acceptance are in
`TASK.MD`.

`/speaking/[sessionId]` opens the actual speaking workspace. Voice and Chat share
the same authenticated mission, conversation, microphone and playback. The
2026-10-31 visual update above replaces the earlier framed shell and purple
learner bubbles. The logic guide shows existing server stage progress when
available; missing progress is not fabricated from the transcript.

Starting voice is an explicit action. Speech is streamed continuously, OpenAI semantic VAD detects turn boundaries, and learners can interrupt. Typed messages work without microphone permission; muting or changing the visible view does not create a separate mission. OpenAI requests audio responses while the microphone is enabled and text-only responses while muted. Voice responses also supply transcript events. The optional legacy Gemini path still generates audio in text mode and discards it. Backgrounding, leaving, changing account and ending release browser media and the provider connection. Reconnection is manual and recovers acknowledged text; it does not reopen the microphone automatically.

2026-10-18 conversation pacing: defer the initial opening until the browser acknowledges its microphone mode, preventing the initial enable event from cancelling or silencing that opening. With the microphone enabled, wait at least 15 seconds after AI generation and acknowledged playback finish, then request one brief in-role follow-up; allow at most two until nonblank learner text resets the count. Pending speech/transcription, generation, playback, mute and terminal/ownership changes block follow-ups. Timer checks use the approximately two-second heartbeat; reconnect resets the connection-local budget. Controls do not create learner turns or learning evidence. The former 144 KB fixed one-second input ceiling is replaced by a 240 KB token bucket refilling at 60 KB/s, allowing bounded catch-up of nominal 48 KB/s PCM while still rejecting sustained excess. See the [runtime contract](STAGE_FOUR_RUNTIME_CONTRACT.md). These paths have synthetic regression coverage; real microphone/provider timing remains unmeasured.

An asynchronous DeepSeek analyzer checks each finalized learner revision against frozen context while the live partner responds independently. The first two substantive learner utterances stay in observation mode; later automatic teaching requires a contextual opportunity, a two-substantive-turn cooldown and a separate target attempt budget. Candidates can survive through two later user turns within 45 seconds of source finalization. Analysis completion actively wakes safe-boundary dispatch. Evidence retains exact UTF-16 quotes, uncertain lexical fallback and assistance provenance; revision changes invalidate old evidence without rewriting actual presentation history.

The subsequent compliance fix withholds selected wording from Gemini's setup and implicit controls. The control assigns a communicative task to the learner and asks the partner to elicit it with one question. Private target metadata supports deterministic post-response disclosure checks before advisory assessment; no voice buffering or extra pre-response model request is added. `speaking-analysis-v3` asks for exact quote text and derives UTF-16 offsets server-side when unique, retaining valid supplied ranges for repeated-quote disambiguation and logging repaired/derived provenance. Stored evidence and Stage 5 remain strictly validated.

A live follow-up failed with `audio_rate` before reaching strategy execution. The subsequent ingress fix lets PCM, ping and presentation receipts bypass the provider/state operation lock; playback completion persists in the background. Stateful controls and provider writes remain serialized, and frame/rate limits are unchanged. This addresses database-lock-induced capture backlog without introducing an unbounded queue or treating a failed verification as a pass.

Voice and Chat share Usage/Example cards. Explicit requests can receive one contextual example; automatic direction waits for a completed AI reply assessed as reflecting the policy. Immutable sent attempts, reflection assessment and text/audio presentation are distinct records. Expression/example exposure remains assisted for the rest of the Mission, while overlap/unknown evidence does not count as independent use. See [the complete teaching and diagnostics contract](STAGE_FOUR_TEACHING_CONTROL.md).

End mission saves a read-only transcript and evidence review. The subsequent [Stage 5 increment](STAGE_FIVE_CONTRACT.md) now requests a durable report and navigates to Analytics, with a link back to this transcript. Delete removes the private session, cascading runtime document and report. Stage 4 itself produces no final scores, raw-audio recording archive or pronunciation grading.

## Provider and event details

The user selected OpenAI on 2026-10-30 and authorized reuse of the existing
server-side key. Code, example and ignored local configuration now select
`SPEAKING_REALTIME_PROVIDER=openai`, `OPENAI_REALTIME_MODEL=gpt-realtime-2.1`
and `OPENAI_REALTIME_VOICE=marin`. Use the fixed
`wss://api.openai.com/v1/realtime` origin and Authorization header; browser →
FastAPI → provider retains server ownership of instructions and controls.
Input and output are PCM16LE mono24k. Input transcription uses
`gpt-4o-mini-transcribe` with no target-language priming. Semantic VAD uses low
eagerness; the application requests responses and handles interruption itself.
Private policies bind to explicit `response.create` requests and never require
waiting for text analysis before audio response generation.

OpenAI cancellation stops generation and `conversation.item.truncate` removes
unplayed audio from the provider context using playback receipts. Recovery still
excludes interrupted or unacknowledged assistant replies. The transport uses an
isolated silent logger so debug configuration cannot expose headers or audio.
The local proxy required `python-socks[asyncio]`, now declared and locked.

Gemini (`gemini-3.8-live`, `Kore`) remains explicitly selectable; there is no
silent provider fallback. The following Gemini wire details and older live runs
are retained as historical/optional-adapter evidence, not OpenAI qualification.

Gemini setup is immutable within a connection. Private teaching context is appended at an observed idle provider boundary or before an explicit request, with generation disabled for that control message. Dispatch checks current speech/transcription/generation and ownership, and is awakened by both analysis and provider completion. It binds one immutable attempt to a later response. A newer user turn alone does not expire an eligible candidate; time, turn, revision, evidence and budget gates still apply. Local idle checks cannot eliminate remote automatic-VAD/network races, and changing database state cannot retract an already sent instruction. No analysis wait is added to the audio path; real interruption/latency distributions remain unmeasured.

Observed Gemini wire events use `voiceActivity.type` with `ACTIVITY_START`/`ACTIVITY_END`. The current service does not always emit the SDK's optional transcription `finished` flag. Without it, a matching ended VAD segment plus a non-interrupted completed model generation provides the finalization boundary. An interrupted old reply cannot finalize a new learner utterance. Ambiguous overlapping transcription remains unconfirmed and receives no learning credit. Late fragments revise the same utterance rather than incrementing the turn count.

2026-10-18 onset tuning: increase Gemini `prefixPaddingMs` from 100 to 300 ms while retaining low start/end sensitivity, 1200 ms end-of-speech silence and automatic interruption. The longer speech-confirmation window is intended to reduce brief background-noise interruptions, with a possible increase in deliberate barge-in latency and missed very short utterances. It applies to new provider connections; real-room noise reduction and microphone performance have not been measured. See the [provider field definition](https://ai.google.dev/api/live#AutomaticActivityDetection).

Gemini does not expose OpenAI's exact audio truncation operation. Playback stops immediately in the browser and incomplete deliveries are marked interrupted. Generated text may include words not played; interrupted replies are excluded from reconstructed provider context. Durable pending-playback metadata also protects recovery after a lost connection or takeover. This does not claim word-accurate audio/text alignment or exact deletion from an ongoing Gemini context.

Sources checked during implementation: [Gemini Live protocol](https://ai.google.dev/api/live), [WebSocket setup](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket), [audio and VAD capabilities](https://ai.google.dev/gemini-api/docs/live-api/capabilities), [OpenAI conversation events](https://developers.openai.com/api/docs/guides/realtime-conversations).

## Storage and operation

Applied migration: `20261001111236_speaking_runtime_state.sql`. A bounded JSON document per mission stores finalized messages, evidence, learning counters, policies and a leased runtime. A server-only, security-invoker RPC atomically compares the document version and updates session status/turn count. RLS and grants prohibit browser roles. It intentionally does not write the legacy `speaking_turns` table or persist audio frames/token deltas.

Applied migration `20261018111206_speaking_teaching_diagnostics.sql` adds an owner-readable diagnostic journal through GET `/api/speaking/sessions/{id}/diagnostics`. Raw bounded analyzer content, validation outcomes, immutable attempts, assessments and presentation events stay outside the runtime snapshot/CAS document. The queue is best-effort with gap/closure records. Reads retain 30 days; same-session append prunes expired rows, but no global physical-purge schedule is installed. Session deletion cascades the journal. No diagnostic timeline UI is implemented.

One active runtime per mission, a one-use 30-second ticket delivered in the first socket message, strict Origin validation, explicit takeover, 60-second lease and approximately two-second remote-owner checks fence old connections. Heartbeats renew the lease; a dead process can be replaced after expiry. HTTP end/delete work independently of worker affinity. Session end preserves finalized/acknowledged content; in-flight unconfirmed fragments can be lost. Client text IDs make retries idempotent. Public snapshots omit provider prompts, ticket hashes, credentials and controller internals.

Defaults: at most 100 learner utterances, 4,000 characters per typed/finalized learner message, 450 provider output tokens, 20-minute application connection ceiling, three-minute idle timeout and 1 MiB persisted document. A provider may require reconnection sooner. These are per-connection/mission bounds; account-wide rate limits, spend enforcement, production supervision and fleet metrics remain operational follow-ups. This local delivery has not been deployed.

Configuration lives in ignored `apps/api/.env`; safe variable names/defaults are in `.env.example`. Select `SPEAKING_REALTIME_PROVIDER=openai`, configure `OPENAI_API_KEY`, and configure `DEEPSEEK_API_KEY` for the separate DeepSeek analyzer (`TEXT_ANALYSIS_PROVIDER=deepseek`; Ark remains an explicit alternative). The local API reloads after source edits; restart it after environment-only changes before opening a new call. Secrets never enter browser bundles. Libitu retains text and derived observations, not raw audio; provider processing/retention is a separate boundary.

## OpenAI verification — 2026-10-30

The existing key listed `gpt-realtime-2.1`; a real bounded protocol smoke then
passed production session setup, opening audio (244800 bytes), cancellation and
truncation, synthetic speech VAD/ASR (48 transcript characters), a complete
post-interruption audio reply (148800 bytes), muted text-only output (zero audio)
and assistant-history creation in a fresh connection followed by a text reply.
Reproduce with `apps/api/scripts/smoke_openai_realtime.py --live --voice` from
`apps/api` as `.venv/bin/python -m scripts.smoke_openai_realtime --live --voice`.
It uses macOS `say`/ffmpeg, no learner records and no database writes. The first
connection attempt exposed a missing SOCKS dependency; the successful run was
after installing the declared dependency. This supersedes the older exhausted-
credit observation only for this tested key/model/run.

Focused transport/runtime/coaching/support/staged tests: 95 passed. Final root
verification is recorded in `TASK.MD`. Local API auto-reload was observed and
`/health` returned OK. No production deployment, physical audio, real OAuth,
OpenAI teaching-quality or full OpenAI/database live acceptance is implied.
The existing full runtime smoke now respects the configured provider; it was
not rerun against persistent storage for this migration.

Official sources: [Realtime conversations](https://developers.openai.com/api/docs/guides/realtime-conversations),
[GPT-Realtime-2.1](https://developers.openai.com/api/docs/models/gpt-realtime-2.1),
[WebSocket proxies](https://websockets.readthedocs.io/en/15.0.1/topics/proxies.html).

## Earlier verification (Gemini)

Final post-fix root lint/build/test pass: 1,179 API, 390 Web and 114 cached extension tests, with one existing Starlette test-client warning. These checks ran sequentially after the live sessions to avoid competing with real audio.

Post-fix [live runs](../benchmarks/teaching-live-20261018/README.md) now record one compliant eligible policy crossing turn 3→4, an actual direction-card ACK and exact server-derived quote evidence. Gemini asks for the learner's comparison without supplying the target or a completed answer. Voice run-04 has three finalized turns whose audio precedes analysis and no rate-limit failure, but four unconfirmed ASR fragments prevent strategy coverage there. Controlled text run-05 has real Gemini audio during an unfinished DeepSeek request; its later persistence 503 prevents fifth-reply audio after the quote evidence was committed. All failures remain in the exported reports. These are bounded observations; they do not qualify general reliability or prove learning from the prewritten fifth input.

2026-10-18 teaching-control increment: root lint/build/test pass (1,111 API, 390 Web, 114 cached extension tests), with one existing Starlette test-client deprecation warning. Hosted migration rollback checks pass. The security advisor reports only the pre-existing `private.content_payloads` INFO finding; the performance advisor reports three unused indexes on existing, unrelated tables. `speaking-help.browser.mjs` passes at 1440/390 px using synthetic auth/API/provider events, covering usage/example loading, per-level visibility acknowledgments, hidden/occluded suppression, stale requests, automatic-card retirement and layout overflow; screenshots inspected. These checks and the historical checks below do not qualify live teaching quality or microphone timing.

The existing `speaking.browser.mjs` was rerun for this increment and passes at 1440/768/390 px, including real browser AudioWorklet capture/playback with synthetic audio/provider events, interruption, mute, recovery, background/resume, account isolation, denied microphone, takeover and deletion. Its obsolete deletion URL assertion now accepts the current `/loadout` pathname without requiring a query string.

A subsequent [real Gemini/DeepSeek/Supabase browser probe](../benchmarks/teaching-live-20261018/run-01/README.md) records seven canonical learner turns using fixture identity and synthesized microphone input. All six voice first replies began before their analysis started; five analysis windows overlap valid running WebAudio playback. One policy crossed from turn 5 to turn 6 while eligible, but its content assessment was `not_reflected` and Gemini violated the implicit target-name constraint. Requested Usage/Example cards have actual visibility ACKs; later reuse is assisted, with a malformed model quote offset rejected before uncertain lexical fallback. All 221 diagnostic records were exported, closure reported no gaps, and synthetic database records were deleted. This bounded run qualifies observed delivery and logging; teaching compliance, physical audio, real authentication and broader latency distributions remain open.

- Root lint, production build and 982 automated tests pass (603 API, 267 web, 112 extension); automatic tests explicitly clear paid-provider credentials.
- Real Supabase transaction tests cover ownership, concurrent CAS, terminal state, payload bounds, server-only grants and cascade deletion. Synthetic records are rolled back or removed.
- Real Gemini header authentication, text → audio, and synthetic spoken input → VAD/transcription → audio passed. Full service smokes also ran real DeepSeek analysis, exact language evidence persistence, end and recovery against Supabase. The opt-in script is `apps/api/scripts/smoke_speaking_runtime.py --live [--voice]`; the voice smoke uses locally generated speech, not a person's microphone.
- One bounded live interruption probe confirmed `ACTIVITY_START → interrupted → turnComplete` while AI audio was playing. No subsequent `ACTIVITY_END`, user transcription or reply arrived within its 35-second limit; that complete post-interruption turn remains unverified. The probe was stopped without retry. Regression fixtures ensure the interrupted old `turnComplete` cannot finalize the new learner utterance.
- Browser checks at 1440/768/390 cover real Chrome AudioWorklet capture, PCM payloads and Web Audio playback with synthetic server events, Voice/Chat continuity, text-only/denied-mic paths, interrupt/mute, lost acknowledgements, explicit takeover, hidden-tab pause, account change, end/reload/delete. Orb states, reduced motion and 200% equivalent reflow were inspected.
- Full Loadout/Shadow persistence browser regression passed, including cross-tab locks, identity changes and pending writes across navigation.

This verification does not establish physical-phone audio quality, human accent accuracy, network-wide latency/cost distributions or completed real Clerk/OAuth sign-in. Manual transcript editing, detected logic-stage progression and Stage 5 assessment remain separate work.

## Stage 4 target hint feedback — 2026-11-03

Target-card Hint retains the explicit selected target ID and the existing
question-versioned three-level flow in the shared conversation hint slot.
Its button now reports loading/retry/next-level state and disables unavailable
requests with an explanation (offline, speaking/draft, no question, busy/help
pending). Generic Need a hint? routing and generation remain unchanged. Compact
target actions share a baseline with no nested opportunity top margin.
