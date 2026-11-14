# Complete the next Libitu milestone

## Public README and release scope — 2026-11-14

- [x] Remove the generated overview video and its supporting files; restructure both READMEs around the product, local setup and architecture.
- [x] Apply the user-selected MIT license to project-owned code; update root package metadata and bilingual README presentation with centered branding, navigation and badges.
- [ ] Before production distribution, complete the dependency, model and dataset license review. A paid hosted service is intended; future commercial-module boundaries, pricing and deployment remain separate work.

## Speech Phenomena P0/P1 acceptance — 2026-11-11

- [x] P0: preserve research code, labels, weights and outputs with SHA256 verification and sampled recovery; retain originals because independent-media backup is still absent.
- [x] P1: create independent research package/environment, remove business imports, relocate tests, freeze text-rule input, preserve ASR parameter behavior.
- [x] E0a: reproduce 84 metric rows, reload 42 selected heads, verify six encoders on two real clips each; no new real-data training.
- [x] Research tests 231 passed, including isolated roots/blocked old checkout; Libitu lint/build/test pass.
- [x] P2 first increment: exposure/label/lexicon audit, reserved-speaker ledger, nine complete recordings through four frozen backbones and A/B/C/D, 248 isolated research tests. [Report](/Users/river/Documents/speech-phenomena/reports/e0b-first-pass.md).
- [x] P2 dictionary control: new sealed run on identical recordings/waveforms/heads; complete-chain F1 improves while A classifications stay unchanged; 252 research tests pass. [Paired report](/Users/river/Documents/speech-phenomena/reports/e0b-lexicon-pair.md).
- [x] P2 recovery/localization: recover official metadata for all 35 Buckeye development recordings; verify lexical/audio identity; validate automatic localization on the fixed nine-recording control without source times. 264 isolated offline tests pass. [Report](/Users/river/Documents/speech-phenomena/reports/e0b-automatic-localization.md).
- [x] P2 revised acceptance: sealed 739-recording four-backbone C/noise/reverb comparison and source/error/cost audit. User stopped remaining Whisper computation; its A/B/MP3 are explicitly unaccepted, so the original full matrix is not complete. Other three backbones complete all tracks. 282 isolated tests pass; 6 Buckeye + 26 TIMIT reserved test speakers remain excluded. [Report](/Users/river/Documents/speech-phenomena/reports/e0b-p2-accepted.md).
- [x] D1 TIMIT matching control: fix all 16 positive rejections through an opt-in canonical dictionary bridge; same 704 dev recordings, unchanged models/heads/thresholds, 293 tests and 2,136 metric-row replay checks pass. Buckeye ASR and old Whisper A/B/MP3 gaps remain untouched. [Report](/Users/river/Documents/speech-phenomena/reports/timit-variant-control-20261114.md).
- [x] TIMIT-only baseline preparation: verify 2,880 train sources; freeze 750 positive / 518 negative windows, complete dev manifests and the fresh three-model, three-seed, 400-step linear config. 309 isolated tests pass; zero encoder forwards/updates. [Report](/Users/river/Documents/speech-phenomena/reports/timit-baseline-freeze-20261114.md).
- [ ] Execute the frozen TIMIT-only baseline under a new run ID after pretraining verification; implement its config contract, retain unknowns and prompt-overlap diagnostics, keep tests sealed. Subsequent interventions require new configs with identical data/steps/seeds/selection budget. No new training has started.
- [ ] P3/P4/P5: tracking, bounded training and reference-only release when gates pass.
- [ ] Establish an independent-media backup before clearing retained original data.

Evidence: [migration report](/Users/river/Documents/speech-phenomena/docs/migration/REPORT.md). Learner events and unqualified phenomena remain unsupported; no new user annotation requested.

## Supplemental event encoders — 2026-11-10

Whisper padding repair (2026-11-10): the common `padding=True` call produced 100 mel frames instead of the required 3,000. The Whisper-only adapter now explicitly zero-pads the waveform to the native 480,000-sample input before log-mel extraction, preserving the declared 30-second protocol and the first-50-frame readout. Four padding regressions plus 19 event tests pass. A real training clip passes the pinned encoder with `[1,80,3000]` input, all 13 finite `[1,50,768]` hidden states and finite classification-head gradients (zero optimizer updates). Resumed the supplement from existing data2vec artifacts; complete Whisper scores remain pending. Evidence: `.cache/sound-pilot/events-extra-v3-20261110/PADDING-FIX-PREFLIGHT.json`.

User-authorized supplement: pinned `openai/whisper-small` encoder (supervised ASR/translation) and `facebook/data2vec-audio-large` (raw self-supervised, not `-960h`). Implemented isolated runner `event_extra_probe.py`; queued after the active raw-Wav2Vec2 run to avoid CPU/RAM contention. Same immutable 1,600/600/600 split, five depths, three seeds and fixed probe budget. Whisper retains native 30-second zero padding and uses only the first 50 encoder frames; frame-center bookkeeping is not a physical receptive-field claim. No decoder or transcript prompt. Existing test exposure is disclosed. Syntax validation passes; actual model loading, extraction, training and scores remain pending. Artifacts: `.cache/sound-pilot/events-extra-v3-20261110/`.

## Source-labeled Sound event comparison — 2026-11-10

- [x] Acquire pinned Buckeye/TIMIT research mirrors; verify file hashes, decode all 6,554 rows, remove 37 identical duplicate recordings and quarantine one inconsistent source.
- [x] Preserve professional phone labels and unknowns; prepare conservative flap, assimilation and coalescence inventories without new user labeling.
- [x] Freeze speaker-isolated 1,600/600/600 train/dev/test flap candidate windows; retain TIMIT official-test identity and exclude SA prompts.
- [x] Implement equal-budget four-encoder probes, text-only/audio-plus-text controls, validation-only selection, sealed test release and speaker bootstrap intervals.
- [ ] Finish the background four-encoder extraction/training/test run and inspect generated results. Do not infer a ranking from the previous IPA experiment or source vocabulary.
- [ ] Address coarse Buckeye localization, end-to-end predicted windows and missing coalescence development positives before detector qualification; not a request for user annotation.

See [protocol](design/benchmarks/sound-events-20261109/README.md) and [evidence](design/benchmarks/sound-events-20261109/REPORT.md).

## Full Glossika preparation v1 — 2026-11-09

- [x] Reverify all 145 source MP3 hashes and reconcile source durations against the frozen 549-row short-sentence export.
- [x] Identify full-IPA, target-phone/ending-only and text/prosody-only source formats; document their preparation paths and why 8.18 minutes is only the completed subset. See [full-corpus plan](design/benchmarks/sound-glossika-20261108/FULL-CORPUS-PREPARATION.md).
- [x] Implement full-book extraction and all-track processing; index 3,192 entries, export chapter 2 and specialist examples, and recover 21 chapter 3 holds without changing the prior 549 clips.
- [x] Export 661 complete-IPA / 2,075 partial-IPA / 73 text-only samples with separate objectives and a 120-token append-only vocabulary. No generated full-word completions or repeated user phonetic confirmation.
- [x] Validate 3,197 frozen files and all 2,736 supervised source-frame ranges; pass real-audio full/partial loss gradients, 14 focused tests, root lint/build/test (2,192 API tests). See [v1 report](design/benchmarks/sound-glossika-20261108/FULL-CORPUS-V1.md).
- [ ] Continue automatic localization for 383 technical holds and unsegmented standalone/repeated demonstrations; retain all original audio. Missing/truncated material and printed counterexamples remain explicit.
- [ ] Freeze full/partial sampling and suitable external professional-label evaluation before a new optimization run; this preparation made zero optimizer updates and did not merge SAA.

## Speech Accent Archive data assessment — 2026-11-09

- [x] Download the full pinned 1,242-row research snapshot, verify upstream hashes, and decode all 9.862 hours.
- [x] Audit literal Glossika vocabulary coverage, source-character anomalies and existing encoder compatibility without changing labels or models.
- [x] Cross-check 67 retrieved official transcriptions and 21 audio identities; produce ASR content clues and an audio-linked review pack. See [findings](design/benchmarks/sound-saa-20261109/REPORT.md).
- [x] Accept the user's instruction to use professional source annotations without another user listening-confirmation step.
- [ ] Before a separate training experiment, resolve concrete notation/label encoding issues, freeze suitable external evaluation and address the source's noncommercial-use limits. Independent relistening is not a training prerequisite.

## Diagnose IPA adaptation gains and regressions — 2026-11-09

- [x] Audit symbol coverage, reference-anchored gains/losses, insertion/deletion/substitution changes and training/external duration differences across all six heads.
- [x] Reproduce original/adapted outputs and run old/new-row inference ablations without training or changing frozen artifacts.
- [x] Document confirmed output-head changes, unresolved notation/causal limits and concrete listening examples in the [diagnosis](design/benchmarks/sound-glossika-20261108/IPA-ADAPTATION-DIAGNOSIS.md).
- [x] Verify prior-archive integrity and all 48 sentence error deltas; four new tests, lint/build and full-suite retry pass (2,175 API tests). Preserve the initial unrelated heartbeat timing failure log.
- [ ] Run a separately frozen equal-update-budget experiment and collect compatible independent labels before deciding whether to expand training.

## Original-checkpoint IPA adaptation — 2026-11-09

- [x] Audit the existing labels and exposure status; freeze explicit scoring aliases and preserve original IPA strings.
- [x] Implement pretrained-row-preserving vocabulary extension, literal longest-match tokenization, fixed reviewed/full-data arms and before/after exports; ten focused tests pass.
- [x] Complete six real head-only training runs, verify saved-head reloads and unchanged original model, and compare all seeds on the same independent regression recordings. Neither adaptation improves external error under the frozen scoring contract.
- [x] Deliver reports, audio-linked per-sentence comparisons, checkpoints and validation evidence; lint/build and full test retry pass (2,171 API tests). See [adaptation results](design/benchmarks/sound-glossika-20261108/IPA-ADAPTATION-V1.md).
- [ ] Complete additional independent IPA labels with compatible notation before new blind qualification; keep the original model as baseline.

## IPA-only frozen representation comparison — 2026-11-09

- [x] Replace the immediate A/B/C event-model work with the user's four-encoder IPA-only comparison; freeze a new literal-label protocol and snapshot 549 train / 5 development / 8 currently eligible test recordings.
- [x] Implement source-checked feature reuse, fresh linear heads at five depths with three seeds, fixed training budgets, development-only layer selection and a test-release gate.
- [x] Finish all 60 probe fits, freeze selections, score the same eight test recordings, and deliver per-sentence before/after IPA with errors and seed variability; root lint/build/test pass (2,161 API tests).
- [x] Register the eight scored test items and their seven sentence groups as exposed; keep untouched listening items and original annotation drafts available for future evaluation.

See [IPA probe v3](design/benchmarks/sound-encoder-eval-20261109/IPA-PROBE-V3.md). Encoder fine-tuning and phenomenon detection are outside this run.

## Glossika literal-notation data export — 2026-11-09

- [x] Adopt the user's source-first label rule: retain Glossika symbols, including confirmed syllabic `ṇ`, instead of applying old v2 substitutions.
- [x] Recover 199 damaged extraction characters across 180 sentences using verified PDF font mappings; preserve original extraction and source identities.
- [x] Process all 12 short-sentence tracks, reuse 50 reviewed ranges, and check new associations using unprompted ASR plus pause-region alignment and a bounded chunked fallback.
- [x] Export 549 train rows / 490.54625 seconds and a 39-row review queue, 62-entry vocabulary, exact label IDs, WAVs, provenance and frozen hashes; distinguish reviewed and book-supervised subsets.
- [x] Provide checked PyTorch dataset/collator and Hugging Face JSON-compatible records; verify all training artifacts and real-audio CTC loss/head gradients on four encoders without optimizer updates.
- [x] Reprocess the 39 held source/audio/variant items in full-corpus v1: 21 recovered, 18 retained with concrete technical reasons; no new user listening prerequisite.
- [x] Prepare and complete a new training/evaluation run using the literal profile; keep the old 49-clip model and four-encoder evaluation protocol frozen. See the IPA-only comparison above.
- [x] Expand word and specialist chapters in the separate full-corpus v1 export above; preserve this historical 588-sentence export unchanged.

See [dataset v3 guide](design/benchmarks/sound-glossika-20261108/DATASET-V3.md).

## Unified encoder evaluation — 2026-11-09

- [x] Pin and load Wav2Vec2Phoneme, WavLM Base+, WavLM Large and HuBERT Large; cache five selected layers on identical train/development audio with strict audio/model identities.
- [x] Build shared fresh CTC heads, reproducible development selection, IPA/mark/event/ABX metrics and a sealed test-release path; pass real-audio forward/backward preflight without optimizer updates.
- [x] Prepare 12 new development + 24 reserved test recordings across three bounded Sound subtypes; keep test speakers/prompts/PCM separate from prior project samples and training material.
- [x] Deliver a blind listening page with full/context playback, independent IPA/event/timing fields, durable autosave, conflict protection and working JSON export/import; verify desktop/mobile emulation and keyboard flows on a QA copy.
- [x] Receive the user's independent-sample listening annotations; freeze the eligible 5 development / 8 test labels for v3 without treating a single annotator as adjudicated gold. Remaining listening items are still incomplete.
- [x] Train the four new IPA probes with identical budgets on the v3 literal dataset, choose layers on development labels, then score the sealed test; conditional pilot results are recorded above.
- [ ] Add separate localized event-training examples and enough human-timed matched-context contrasts before event-head/ABX quality claims. The 49 IPA rows do not supply these labels automatically.

See [evaluation and annotation guide](design/benchmarks/sound-encoder-eval-20261109/README.md). This remains offline research and does not complete M4b.

## Four-model comparison — 2026-11-08

- [x] Run four local models on 12 original clips and build a source-bound comparison page.
- [x] Check desktop/mobile viewport, playback, navigation, output download and mismatched-result rejection.
- [ ] Independently verify phonetic labels and evaluate baseline errors before deciding whether to fine-tune.

## Glossika dataset and training preparation — 2026-11-08

- [x] Record the user's authorization to train on the supplied Glossika materials; keep the earlier public pilot records separate.
- [x] Reinspect all 145 MP3s and the PDF; index 588 numbered short-sentence sources with hashes and explicit unverified audio associations.
- [x] Record IPA extraction/normalization issues, printed counterexample separation and the single decoder-warning track; propose the data/model/evaluation sequence.
- [x] Prepare normalization candidates for all 588 entries, isolate repairs/printed incorrect examples and find three exact-text duplicate groups.
- [x] Prepare 50 source-bound sentence cut candidates with original-track playback and PDF pages; provide boundary/text/IPA review and optional localized event entry, disk/browser backups and strict draft identity validation.
- [x] Receive and freeze the user's 50 confirmed sentence/IPA reviews; preserve 15 optional event observations separately from localized labels.
- [x] Materialize reviewed audio and isolate 41 CTC candidates / 9 notation holds; keep the entire collection in development and reserve no fake random test split.
- [x] Run Wav2Vec2Phoneme, ZIPA small and ZIPA large on the same 50 recordings; bind every output to source hashes and document literal-metric limitations.
- [x] Prepare minimal Wav2Vec2 vocabulary extension while preserving all 392 existing entries/head rows; verify frozen-encoder CTC losses and head gradients on representative samples with zero optimizer steps.
- [x] Build an official-source IPA reference catalog and model-symbol coverage audit; resolve 8 of 9 notation holds with a source-specific Glossika adapter, preserving originals and all pretrained vocabulary IDs. See [IPA mapping report](design/benchmarks/sound-glossika-20261108/IPA-INVENTORY.md).
- [x] Validate the v2 399-entry candidate on seven real clips with finite CTC loss/gradients and zero optimizer steps; root lint/build/test pass (2,088 API tests).
- [x] Run the user-requested first 49-clip Wav2Vec2 head-only SFT experiment (40 epochs / 280 updates), save/reload weights and compare real training audio plus 12 external development recordings. Record improved training fit and suspected external regression separately in [first-run report](design/benchmarks/sound-glossika-20261108/FIRST-FINETUNE.md).
- [x] Preserve sentence 23's printed compound notation in the new literal profile and expand preparation to all 588 short sentences; see the 2026-11-09 export above.
- [ ] Expand word-internal tap and can/to specialist material and freeze independent validation data before quality claims.
- [ ] Compare Wav2Vec2Phoneme IPA SFT and WavLM Base+ three-subtype heads with the frozen pretrained baselines; ZIPA large baseline inference is now complete for this batch.
- [ ] Train/evaluate localized heads for the three agreed subtypes, then expand coverage of the remaining Sound categories based on actual labels.

See [plan](design/benchmarks/sound-glossika-20261108/PLAN.md), [first review tool](design/benchmarks/sound-glossika-20261108/BATCH-ONE.md), [review intake/baselines](design/benchmarks/sound-glossika-20261108/REVIEWED-BASELINE.md) and [first fine-tuning experiment](design/benchmarks/sound-glossika-20261108/FIRST-FINETUNE.md). Review, three-model baseline, CTC preflight and the first output-head parameter updates are complete. Broader adaptation, independent IPA evaluation, WavLM event heads and online integration remain pending.

## Offline Sound pilot A+B — 2026-11-07

- [x] Isolate model dependencies and pin ZIPA FP32 / Allophant artifacts with integrity verification.
- [x] Add raw phone/attribute inference, source identity and run evidence without online changes.
- [x] Prepare 16-clip blind first-review pack, export/import validation and three-category coverage audit.
- [x] Recover the user's first listening pass; preserve original inputs and separately record explicit span / whole-clip screening clarifications.
- [x] Audit both frozen model runs against source identities and raw arrays; keep whole-clip symbol diagnostics separate from event accuracy.
- [x] Allow incomplete annotation drafts to export and place download / review feedback beside the action.
- [x] Prepare the three requested target excerpts and nine additional licensed human recordings in a separate second-round listening pack, with full-sentence playback and source-bound draft export.
- [x] Receive and validate the second-round target-specific listening pass: 12/12 complete, 8 present / 4 absent, no crop issues; preserve the original export and [results](design/benchmarks/sound-model-pilot-20261107/ROUND-TWO-RESULTS.md).
- [ ] Run the nine new original clips through both frozen models and evaluate localized hypotheses; do not reuse first-round whole-clip diagnostics as second-round predictions.
- [ ] Refine the 3 existing candidate positions and localize observations; obtain an independent second review and adjudication.
- [ ] Collect broader positive/negative/confounder examples. The original 16-clip rule audit was 1 coalescence / 0 nasal assimilation / 2 word-internal tap candidates; the second round now supplies four human-reviewed targets per category, still without independent gold or event timing.
- [ ] Implement and evaluate localized event hypotheses against frozen labels; raw IPA output is not an event detector.

See [pilot report](design/benchmarks/sound-model-pilot-20261107/README.md). This offline increment does not change learner feedback or complete M4b.

## Sound density and filtering follow-up — 2026-11-07

- [x] Cap compact labels by distinct category and implement an accessible `+N` toggle in Detailed / Review.
- [x] Keep nonmatching marks and arcs at 20% through hover/focus/expansion; keep prose readable.
- [x] Complete root lint/build/test and record verification in [DENSITY](design/benchmarks/stage-two-ga-sound-20261107/DENSITY.md).
- [ ] Run desktop / mobile browser acceptance after computer-use service recovery. No audio detector or evidence integration is in this change.

## Sound paired rows and concealment follow-up — 2026-11-07

- [x] Restore Reference / Your voice cue rows in Detailed and Review; keep unavailable saved reference evidence explicit.
- [x] Match Detailed masks to native word widths; synchronize reveals and anchor explanations to the selected row.
- [x] Pass root lint/build/test (API 1,996; Web 540; Extension 124); update browser regression expectations and documentation.
- [ ] Complete final desktop / 390px mobile visual acceptance after browser reconnection. [Current evidence and limitation](design/benchmarks/stage-two-ga-sound-20261107/PAIRED-CUES.md).

## Sound v3 follow-up — 2026-11-07

- [x] Apply html-2 / v2.1 styling with the later user correction: paired Reference / Your voice cue rows, natural word-width masks, solid category badges/counts, shared UI font and responsive explanation cards.
- [x] Use the same lower `‿` arc in filters, Detailed and Review; keyboard/click opens the matching boundary explanation.
- [x] Replace Vowel duration UI with voicing-conditioned Vowel length candidates; keep saved measurements and legacy contracts intact.
- [x] Add v3 rules, contract compatibility and positive/negative tests.
- [x] Complete final root lint/build/test (API 1,996; Web 540; Extension 124) and 1400px/390px browser acceptance; record [evidence](design/benchmarks/stage-two-ga-sound-20261107/READING-CUES.md).

Earlier P4 measurement presentation below is the first delivery record, superseded by this follow-up.

## Sound prototype styling — 2026-11-07

- [x] Match the supplied Detailed Sound prototype's word flow, filter labels, compact markers, boundary arcs and reading surfaces without changing content or application logic.
- [x] Complete desktop/mobile visual inspection and existing regression checks; record [acceptance evidence](design/benchmarks/stage-two-ga-sound-20261107/STYLE.md).

## GA Sound execution — 2026-11-07

Follow [the accepted plan and acceptance cases](design/docs/STAGE_TWO_GA_SOUND_PLAN.md).

- [x] P0: fix the learning target to GA, define 12 top-level filters and subtypes, symbols, evidence states, compatibility and delivery boundaries.
- [x] P1: add the v2 guide contract, shared taxonomy, constrained subtypes, v1 decoding/mapping and versioned cache behavior.
- [x] P2: implement the bounded, reviewed GA candidate rules and their positive/negative/ambiguous cases; keep unsupported subtypes explicit.
- [x] P3: update Detailed and Review together with grouped filters, local marks, alternatives, evidence styles, concealment and accessible explanations.
- [x] P4: expose saved per-vowel durations, clearly label legacy word totals and preserve unavailable/one-sided/matched-only evidence.
- [x] P5: pass root lint/build/test and 1400px/390px browser acceptance; update implementation evidence and remaining coverage.
- [ ] Separate M4b follow-up: validate individual acoustic realization detectors on human-labelled, speaker-disjoint data before publishing confirmed sounds or correctness feedback.

P1–P5 delivered. Root lint/build/test pass (API 1,968; Web 537; Extension 124). Detailed/Review passed 1400px desktop and 390px touch-emulated browser acceptance, including density, hiding, keyboard, partial matches and historical take switching. See [the delivery report](design/benchmarks/stage-two-ga-sound-20261107/REPORT.md) for commands, screenshots and evidence limits.

## Text quality repair — 2026-11-06

- [x] Share deterministic target grounding; keep contextual appropriateness as a separate judgment.
- [x] Require fixed assessment dimensions/criteria and source-owned evidence IDs; permit only one bounded repair with validated partial-result retention.
- [x] Repeat 30 authored live-provider cases three times before/after: 77/90 → 90/90 expected outcomes, with completeness and latency measured separately.
- [x] Rerun root lint/build/test: 1,940 API tests pass. The five legacy prompt assertions reported by the parallel orb work are resolved by checking the actual fixed-key schema; one acoustic subprocess timing failure passed isolated and full reruns.
- [x] Recheck all text stages with DeepSeek: 12/12 ready. Preserve unsuccessful experiments and raw authored outputs.
- [ ] Repeat the same-version Doubao comparison after its account balance is restored; current calls return HTTP 403 AccountOverdueError.
- [ ] Broader independent learner examples, live audio/ASR and deployed quality/latency acceptance remain open.

See [measurements and reproduction](design/benchmarks/text-quality-20261106/COMPARISON.md).

## Mission partner orb — 2026-11-07

The Voice orb now follows the inspected ElevenLabs homepage material: a locally served blue/green texture, sphere projection, four-octave FBM, simplex displacement and separate stationary overlay grain. The ambient clock runs at the reference 1.4 time scale; the circular silhouette stays fixed. A 128px velocity/pressure field and 512px dye field add audio-driven surface advection (three pressure iterations, .98 dissipation and 1.2 blur); unsupported half-float devices retain the noise-driven renderer. Actual playback and the existing authorized microphone supply low/mid/high FFT bands plus a visual RMS envelope, with 28ms attack / 160ms release. RMS noise floor remains .0015 and full scale .12; this never changes audio gain. Input feedback starts before server VAD. There is no animation pause button: ambient motion starts on entry and continues while offline or the call is paused. OS reduced motion, hidden tabs and offscreen content stop rendering. Use at least 2x supersampling, at most 60fps / 1024px; WebGL failure uses a static fallback. Assets and source provenance are in apps/web/public/orb/README.md. The lower-edge call button, mute control and conversation behavior remain unchanged. Exact live-call frame identity is not claimed because audio and accumulated interaction history differ.

Verification: root lint, build and test passed (527 web tests; API / extension task results reused from cache). New tests cover Hz band boundaries, Nyquist, invalid inputs, frame-rate-independent response and stale capture/playback clearing. The actual localhost:3000 Mission uses WebGL with the optional fluid solver, starts ambient motion automatically and has no animation pause button. Production-preview simulated amplitude 1 reaches energy 1; paused-call energy returns to 0 while ambient motion remains on. At the observed 480px narrow viewport, the sphere is 224px with a 448px canvas and no horizontal overflow. Inspected 24 reference frames over 5.18 seconds and 24 final local frames over 6.94 seconds; these are sampled recordings, not measured render frame rates. No live provider call or physical microphone test was made. Evidence: output/mission-orb/mission-orb-final.jpg, mission-orb-sampled.gif, voice-response.jpg and rebuilt-mobile.jpg. The temporary preview server was stopped; the user’s development server remains running.


## Text provider comparison — 2026-11-06

- [x] Route Stage 1, Mission planning/teaching/help and Stage 5 through the selected DeepSeek/Ark credential, URL and model; default to DeepSeek Flash and retain bounded requests and strict evidence validation.
- [x] Isolate credentials in automatic tests; cover both HTTP routes and missing-key behavior. Root lint/build/test pass (1,913 API, 522 Web, 124 extension tests).
- [x] Run two alternating real-provider rounds on authored inputs without database access; retain partial outcomes and compare actual validated outputs. See [comparison](design/benchmarks/text-providers-20261106/COMPARISON.md).
- [x] Switch local configuration and restart the development stack; `/health/ready` confirms the DeepSeek worker.
- [ ] Qualify broader teaching quality beyond the authored cases repaired above; repeat the current contract against Doubao when its account is available. No automatic bulk regeneration or production deployment.

## Neutral interface palette — 2026-11-06

Replace the warm UI gray ramp with neutral shared tokens: ink #0C0C0C, hover #262626, links #404040, descriptions #525252, muted text #6B6B6B, strong borders #D4D4D4, lines #E5E5E5, soft surfaces #EDEDED, cards #FAFAFA and video/dark inset #191919. Practice, Loadout, Mission, reports, skeletons, playback controls and dialog backdrops now inherit or reference these tokens instead of copied warm palettes or literals. The reference Rhythm envelope uses the shared soft gray. Sound phenomenon colors and status/brand palettes remain independent; saved content, layout and interactions are unchanged. The extension's existing gray UI already has equal RGB channels.

Verification: root lint/build/test and diff whitespace checks pass. Source audit confirms no ordinary warm-gray literals or copied core palettes remain in application styles, no circular token aliases, and unchanged Sound phenomenon rules. Muted text contrast is 5.33:1 on white, 5.11:1 on cards and 4.55:1 on soft gray. Existing Corpus content passed computed-color and overflow checks at 1400px/480px, with desktop/mobile visual inspection. New data-page navigation encountered a failed API request and the local web server later stopped; web dev was restarted, but full per-page visual acceptance was not completed. Mobile evidence: `output/playwright/neutral-palette/corpus-mobile.jpg`.

## Corpus scenario groups and neutral options — 2026-11-06

Library Scenario options and matching share a bounded English taxonomy: Work, Everyday, Discussions, Presentations, Interviews, Storytelling and Writing. Only groups present in the collection appear; Other keeps records without a recognized setting reachable. Known Chinese/English aliases merge, while register/function labels alone do not imply a setting. Saved metadata is unchanged. The Source group is collapsed by default. Option groups use the reference page's measured #EDEDED background and white selected states; text uses neutral #616161, and forced-colors selection retains an outline.

Verification: root lint/build/test and diff whitespace checks pass. Regression tests cover alias merging, multi-select and cross-facet matching, unknown settings and unchanged saved metadata. Local browser checks at 1400px and 480px confirm English categories, result counts and reset, exact neutral backgrounds, Source click/keyboard disclosure, 44px narrow-screen controls and no horizontal overflow.

## Unified Corpus filter panel — 2026-11-06

Corpus library now groups the six existing facets into one Filters popover, following the supplied ElevenLabs Voice Library reference: neutral rounded controls, left-hand labels, gray option groups and white selected options. Selections apply immediately; Any clears one dimension, Clear all filters clears facets while preserving search, and the toolbar Clear all resets search/facets within the active tab. The trigger counts selected values. Multi-select OR/AND rules, sorting, selection and pagination remain unchanged. The panel uses native nonmodal popover dismissal with a manual fallback, viewport-clamped positioning, bounded scrolling, 44px narrow/coarse controls and reduced-motion support.

Verification: root lint/build/test and diff whitespace checks pass. Local browser checks at 1400px and 480px confirmed multi-select and cross-facet result counts, Any/reset, Escape focus return, focus-leave dismissal, bounded scrolling, no horizontal overflow and 44px narrow-screen controls. Search retains one black focus outline. The existing browser regression script was updated for the unified panel; it was not rerun as a complete suite in this pass.

## Single input focus boundary — 2026-11-06

Text inputs, textareas and native selects use one inset black focus boundary without a shadow or layout shift. Composite Corpus search, follow-up prompts and Landing URL entry delegate focus paint to their outer group, suppressing the inner outline. Checkbox/radio/range/file controls and button focus behavior remain unchanged.

## Unified interface typeface — 2026-11-06

Replace the Geist Mono/system monospace stack with the existing locally bundled Inter UI typeface across metadata, corpus patterns, timestamps and analysis labels. Keep the legacy font token as an alias and remove direct feature-level monospace overrides. Font sizes, weights and content remain unchanged.

## Corpus deletion — 2026-11-06

Library selection supports confirmed batch deletion, including counts of selected items hidden by filters. Detail exposes Delete beside Edit item in the bottom action group with the same native confirmation. Successful removals notify mounted corpus consumers and other tabs to refresh Stage 1 Saved; failures retain remaining selections. Account changes stop the batch. Deletion affects personal corpus only, preserves source and old practice snapshots, and does not offer undo. Browser fixtures passed at 1440px/390px for guest batch confirmation/cancel/hidden selection and Stage 1 cross-tab synchronization, plus authenticated cross-tab deletion and mobile detail deletion. Unit regressions cover partial failure/retry and account changes.

## Shadow history navigation — 2026-11-06

Completed: route saved Shadow history to its matching segment/sentence, with a segment-picker fallback for stale sentence identities.

## Corpus kind and saved-note synchronization — 2026-11-06

- [x] Synchronize manual kind edits with analysis, invalidate old Syntax, cancel stale requests and regenerate the visible Syntax tab while preserving Explain and drafts.
- [x] Use saved kind in Reader and Corpus library detail; retain pending state when saved before Syntax completes and reuse the completed result after reload.
- [x] Bound Reader note previews to two lines; show complete saved notes in Reader and Library with escaped Markdown.
- [x] Root lint/test/build pass (API 1905, Web 517, Extension 124). Synthetic browser regression covers 1440px and 390px/reduced motion, stale responses, pending saves, Library reload and saved follow-ups; no real provider request or production deployment in this follow-up.

## Corpus detail v3 acceptance — 2026-11-06

- [x] Apply 9.16 with the confirmed 16px spacing and Use it-first exceptions; share changes across Reader detail, Add to corpus and Library.
- [x] Preserve source evidence and custom names while normalizing learning expressions; persist new fields, keep legacy refresh, and verify pronunciation text consistency.
- [x] Verify desktop/mobile, reduced motion, repeated keyboard tabs, native/fallback dismissal and focus return, question selection/send, retry and saved notes/analysis.
- [x] Run 32 final real-provider comparison requests, six unseen Explain/Syntax probes, two streamed follow-ups, and two local HTTP acceptance requests. Retain raw failures and scoped repairs; record quality and latency limits in [comparison](design/benchmarks/corpus-detail-20261106/COMPARISON.md).
- [x] Root lint/build/test pass: API 1905, Web 514, Extension 124 tests. No commit, push or production deployment in this task.

## Extension store preparation — 2026-11-06

[CHROMEWEBSTORE.md](apps/extension/CHROMEWEBSTORE.md) now records every manifest permission, data flows/retention, listing and privacy drafts, and pending publisher/email/domain (owner specified 待定). [Acceptance](design/docs/extension-release/ACCEPTANCE.md) records 124 passing unit tests, extension lint/build, and real unpacked Chrome entry/fresh-caption/no-capture workspace fixture passes. Native toolbar → tabCapture → PCM passed on retry: actual native UI clicks produced a 0.4-second WAV with RMS 0.106066, retained ownership across same-content paths and released offscreen/capture on reload. Earlier shortcut/UI failures are historical; synthetic identity/test-tone coverage does not prove live YouTube or production behavior. The harness offers manual native-action mode without injecting shortcut commands, waits for native Enable audio before arming, accepts enabled followed by coverage, and waits for a fully covered extraction interval. No store submission or production readiness claim. Integrated Web server analysis is separate from extension capture and defaults on unless disabled; its uploads and 30-day reference expiry must be disclosed.

## Activity metric switching — 2026-11-06

- [x] Reproduce duplicated activity totals after switching metrics; remove conflicting sibling keys and animate the existing panel in place.
- [x] Browser regression passes at 1400px/390px with normal/reduced motion: repeated mouse/keyboard switches keep one total and SVG, preserve chart identity/height, and handle delayed date-range responses plus empty/missing values. The same regression reproduced two totals on the first switch before the fix. Screenshots inspected under `output/playwright/profile-activity/`. Root lint/build/test pass (1,889 API, 513 Web, 124 Extension tests); fixtures use synthetic profile data.

## Extension bridge context invalidation — 2026-11-05

Buffered bridge invalidation follow-up: 124 extension tests pass, including synchronous throws and rejected promises during probes, extraction and pagehide; late completion events are rejected after session cleanup. Extension lint/build and diff whitespace checks pass. This is deterministic fault injection, not a live Chrome reload qualification.

## Extension language retry and handoff retention — 2026-11-05

- [x] Retry language detection after unknown/failed metadata while sharing concurrent checks.
- [x] Delete expired handoffs on access/startup/alarm and clear closed import tabs; preserve ready delivery when only the source closes.
- [x] Bound handoff count/serialized size and fence late capture writes after deletion.
- [x] Verify 120 extension tests and extension manifest build/lint. New regressions cover retry, cleanup, worker restart, source/import closure, concurrent capture cleanup, capacity and storage failure recovery. Real Chrome alarm scheduling and live YouTube remain separate checks.

## Neutral retry notices — 2026-11-05

Recoverable-error panels share a neutral surface, gray border and dark gray copy across Loadout, Corpus, learning history, reports and practice. Use 16px padding and vertical margins, 12px action gaps and shared button geometry. Error/alert semantics and retry handlers are preserved; destructive confirmations keep their existing treatment. Audio-save failures use the same neutral palette.

Validation: root lint/build/test pass (1,889 API, 513 Web, 114 Extension tests). Isolated production browser checks at 1400px/390px verify shared computed colors, 16px padding/margins, 12px gaps, 14px corners, action dimensions and no horizontal overflow for Loadout draft/options/mission recovery, Corpus, Profile and reports. Draft and options retries recover with synthetic data. Evidence: `output/playwright/retry-notices/`.


## Stable asynchronous feedback — 2026-11-05

Routine UI feedback shares a 600ms reveal threshold. Shared buttons disable and report busy immediately while retaining their idle label/geometry; only sustained operations show the loading overlay. Inline save/update notices reserve a small stable slot; floating practice-save/upload notices delay normal progress but surface errors immediately. Loadout draft saving uses the same helper. Request cancellation, persistence, unload protection, microphone permissions and recording countdowns remain immediate.

History pagination retains existing rows without appending temporary skeletons. Filter changes retain the previous list while awaiting replacement, reset pagination and reject aborted responses. Activity range changes retain the existing chart and its actual date caption until replacement arrives. Initial loads still use structural skeletons. Shadow takes avoid flashing an empty result before the selected sentence's history resolves. Extension caption-opening progress follows the same 600ms rule without delaying its request.

Mission hints also use the shared threshold; target buttons own progress without duplicating a footer notice, and legacy hint actions remain in place while pending. Retained-help behavior and visibility receipts remain covered by runtime tests.

Validation: root lint/build/test pass (1,889 API, 513 Web, 114 Extension tests). Synthetic production checks pass at 1400px/390px with normal/reduced motion for short/slow/cancelled feedback, stable button geometry, immediate errors, retained history/chart and pagination reset. Shadow initial/sentence-switch empty-state checks pass at 1400px/390px; full profile-history regression passes at 1440px/390px/320px. Target hints pass at 1192px/390px; negotiated hint-bundle tests pass at 1440px/390px, including retained text, visibility receipts, fast responses, stale-result fencing and retry. Evidence: `output/playwright/pending-feedback/`, `output/playwright/target-hint/`. No live model or microphone was used.

Legacy browser-suite limits: `stage-two-history-navigation.browser.mjs` still expects the old exact “Practiced” sidebar label; `speaking-help.browser.mjs` passes its loading/visibility-receipt steps but stops at its old immediate-hide-on-speech expectation, while current accepted reply-reference behavior retains help until the partner's next reply. Those unrelated behaviors were not changed to fit obsolete assertions; the focused suites above cover this change.


## Quiet Loadout draft saves — 2026-11-05

- [x] Delay the save indicator by 600ms, cancel it when persistence finishes, and prevent mobile layout shifts. Preserve actual pending-write state, unload protection and save errors.
- [x] Verify at 1400px/390px with synthetic data and held draft locks: short writes stay quiet, slow writes show a compact status without moving content or overlapping navigation, and both shuffle changes persist. Root lint/build pass; Web 513 and Extension 114 tests pass. Full API run has 1 unrelated 300ms child-start timing failure (1,888 passed); its full 5-test file passes on isolated rerun.

## Corpus detail spacing and pronunciation — 2026-11-05

Validation: root lint/build/test pass (1,889 API, 513 Web, 114 Extension tests). The first build collided with another build writing `.next-build`; the subsequent root build passed using the matching completed cache. Browser regression passes at 1440px/390px for shared detail/selection cards, long IPA wrapping, real HTML audio playback with a synthetic WAV, retry, replay caching and stopping on Syntax. Live OpenAI requests returned valid audio for `drifted away from` in 7.71s (1.45s audio) and a full sentence in 9.56s (5.5s audio); provider-reported words matched. Samples are under `output/corpus-tts/`; naturalness has not been independently rated by a listener.

Shared detail sections now use 16px vertical padding (previously 24px), 8px heading gaps and tighter slot/comparison rows. Pronunciation Play sits beside its heading, independently of IPA/stress wrapping, across Reader detail, Add to corpus and Corpus library. Pronunciation now calls the server-only OpenAI Realtime read-aloud adapter with `gpt-realtime-2.1-mini` / `marin` and the existing `OPENAI_API_KEY`. The request is limited to 800 characters, 45 seconds and 60 seconds of 24kHz mono audio; the provider-reported transcript must match the requested words before a WAV is returned. No microphone or role-play session is involved. The UI marks AI voice, supports retry/stop, caches one audio clip for the open card, and stops playback/aborts browser requests when Explain hides or the card closes. No cross-user or persistent audio cache is added.

## Typography, spacing and interaction polish — 2026-11-05

Validation: root lint/build/test pass. Production Corpus acceptance/pagination passes at 1440/768/390/320px, including a narrow-list metadata/checkbox collision fixed during regression. Production interaction tests pass at 1400/800/390px with normal and reduced motion: type scale, keyboard tabs, stable DOM, shuffle, one filtered-empty result/recovery, coarse targets, no eager mission creation and no horizontal overflow. Screenshots inspected under output/playwright/style-polish. Initial development-browser navigation timeouts were resolved by production-mode verification; no live model or physical microphone was used.

Shared text/space tokens and semantic color aliases now unify current surfaces. Report H1 uses 30px/500, primary explanations 15px, helper text 13px, mono metadata 12px and transcript text 18px; report content gutters follow the 4px scale. Corpus cards use 20px padding/12px gaps. Empty Loadout logic groups are omitted; a filtered-empty result appears once with a recovery action. Coarse-pointer controls have 44px targets independently of layout breakpoints, including labelled Corpus checkboxes and timeline controls.

Content changes use an interruptible 160ms opacity animation without rekeying media/containers: Corpus results (120ms settling window), Quick start recommendations, preview targets, Explain/Syntax and Sound/Rhythm/Melody. Assessment underlines and score bars use transform feedback; reduced-motion preferences skip animations and cancel in-flight content feedback. No score values, acoustic data, recording/playback or provider configuration changes.

## Corpus detail v2 — 2026-11-05

- [x] Preserve the existing workspace as baseline commit `b3a0fd0` before changes.
- [x] Shared 14px/no-shadow dialog, underline tabs, purple source underlines, mono IPA/metadata and comparison rows in Stage 1 / Corpus library.
- [x] Unify transcript-selection Add to corpus with the same detail surface, backdrop, header, source context and scrolling; place field editing, note draft and Save below analysis. Preserve pin/outside dismissal and add close/Escape. Web lint/typecheck and 513 tests pass; synthetic browser checks at 1440px/390px verify shared appearance, viewport bounds, lazy Syntax, precise seek, field/note saving and dismissal. Screenshots inspected.
- [x] Explain-first generation; on-demand Syntax with three-module phrase mode; legacy read compatibility and explicit refresh.
- [x] Bounded SSE follow-up, safe Markdown, retry and explicit note persistence; saved Syntax reuses existing corpus ownership boundaries.
- [x] Test a phrase and a full sentence with real Doubao across Explain, Syntax and follow-up; record repeated outputs/latency and fix duplicated fields, speculative pitfalls and phrase type formatting. See [live evidence](design/benchmarks/corpus-detail-20261105/README.md).
- [x] Switch local Corpus detail to official `deepseek-flash` through a scoped provider setting; compare two live rounds with unchanged prompts. 53 focused API tests pass. See [DeepSeek comparison](design/benchmarks/corpus-detail-20261105/DEEPSEEK_COMPARISON.md).
- [x] Pre-commit root lint/build/test pass: 1,879 API, 513 Web and 114 Extension tests (Web/Extension cached on the final rerun). The first concurrent build/test run hit the unchanged `test_paused_mfa_keeps_parent_lease_heartbeat` timing assertion; its 24-test file and the full suite passed on separate reruns without code changes.
- [ ] Qualify teaching consistency: DeepSeek improved speed and both sampled rewrites, but terminology, local-versus-occasional translation and template adherence still need broader evaluation. CEFR calibration and billing measurements remain open.


## Shared button geometry across features — 2026-11-05

Validation: root lint/build/test pass. Shared geometry browser checks pass at 1400/390px across Landing, Corpus, Loadout (including all three Quick start actions), Analytics, Profile and Detailed Shadow: shared font sizes, minimum heights, equal group heights and no document horizontal overflow. Fixtures use synthetic account/data; no microphone or provider calls.

Regular actions now use explicit shared sizes instead of legacy inherit geometry. Height tokens are 32/40/44px for sm/md/lg; text is 12/13/14px. Action groups use 44px/14px controls, 8px icon gaps and 12px control gaps across primary/secondary, button/link and loading states. Feature CSS no longer overrides regular button geometry. Icon-only controls, recording controls, navigation and filter/segmented controls retain task-specific geometry.

## Consistent report action sizes — 2026-11-05

Validation: root lint/build/test pass. Focused button geometry checks cover 1400/768/390px. The existing full analytics browser flow reaches its older Loadout Scene preferences selector and times out; this batch does not claim that full flow passed.

Report continuation actions use the shared ui-button-group geometry with explicit lg sizing: Retry this mission, Adjust loadout and New mission share 44px height, 14px text and common padding across button/link, primary/secondary and loading states. Legacy inherited controls remain opt-in to avoid changing unrelated layouts.

## Quiet initial loading — 2026-11-05

Initial data reads use skeletons or screen-reader-only status, without redundant visible loading copy: Review takes/analysis, Detailed progress, Corpus counts, profile history counts, Loadout draft/options and report comparison reads. Existing content stays visible during refresh. Upload, save, queued analysis, countdown, user-triggered button progress and error/retry feedback remain explicit.

## Loading layout refresh — 2026-11-05

- [x] Simplify Shadow, Loadout and Corpus skeletons around current page regions; retain explicit errors and loading accessibility. Root lint/test pass; desktop 1440px and mobile 390px loading-boundary regression passes for Reader, segments, Shadow and import using delayed-content fixtures.

## Nine browser layout/navigation annotations — 2026-11-04

- [x] Anchor all Corpus facets to their pills, with viewport clamping and scroll/resize repositioning; preserve focus, Escape, outside dismissal and transitions.
- [x] Equalize Detailed/Review practice actions at 50px including disabled states, center duration, and keep Quick/Detailed Audio settings on the left before/after disclosure.
- [x] Remove the inherited full-viewport main minimum that added 64px document scroll below the header on desktop Ingest/segments; preserve internal scrolling and stable 84px CTAs in the reported viewport.
- [x] Reuse the loaded content workspace through native history for internal views, warm Shadow code upon entering the picker/on Begin intent, and load shared Shadow styles from the content layout.
- [x] Root lint/build/test pass (513 Web; unchanged API/Extension suites cached). Corpus browser acceptance/pagination passes at 1440/768/390/320px, including pill-relative geometry. Detailed/Review actions and Quick/Detailed disclosure checks pass at 1512/390px with existing Sound/acoustic timeline regression. Production navigation passes at 1512/1192/390px with both destination RSC responses blocked, stable iframe/public reads, exact prefetch, back/forward, cross-page return and refresh. Production workspace lifecycle passes at 1440/390px using synthetic microphone/account fixtures, including cancellation/owner isolation/outbox survival; no physical microphone or provider inference was used.
- [x] Real signed-in IAB verification: Corpus popover sits 8px below Type; Review buttons are all 50px at the same y coordinate; Quick/Detailed disclosure coordinates remain unchanged; Ingest/segments document height equals the 1506px viewport. Screenshots under `output/playwright/ui-feedback-*-actual.png`. One initial content read returned a transient 503 and recovered on Retry. Original selected segment was restored.
- [x] Follow-up found during lifecycle verification: mobile pending-save notifications now sit above the bottom navigation. Desktop/mobile pointer navigation while saving passes in the development build; production lifecycle/history/outbox checks also passed. The notification offset applies only while global navigation is present.

## Review Sound cue consistency — 2026-11-04

- [x] Share Detailed/Review badge and SVG arc rendering, including typography, palette and unevaluated learner dashed/question-mark states. Reserve marker space without duplicating linking cues on the end word.
- [x] Root lint/build/test passed (513 Web; API/Extension test results cached). Browser regressions at 1192px/390px compare actual Detailed/Review badge styles, verify solid/dashed SVG arcs and learner question marks, reject duplicate end-word links and check lane clipping at minimum zoom/Fit. Paired/learner-only modes, shared acoustic paths, layer/voice switching, hide/peek and long-sentence wrapping pass. Screenshots inspected; synthetic browser fixtures only.

## Revised Detailed Sound prototype — 2026-11-04

- [x] Replace the permanent right guidance column with folded Notes and full-width Reference/Your voice rows. Match the new prototype's typography, filters, marker palette, SVG arcs, dashed unevaluated marks and legend.
- [x] Keep IPA keyboard access, synchronized hide/peek, explicit measurements, actual evidence and left panels. Scope the Sound layout in its own CSS Module and remove conflicting legacy Sound styles.
- [x] Root lint/build/test passed (513 Web, 1,861 API and 114 Extension tests; API/Extension test results cached). Browser regressions passed at 1192px and 390px, including the prototype's 27-word sentence, folded Notes, ten-color palette, dashed learner cues/arcs, IPA, filtering, concealment and existing timeline interactions. Screenshots inspected. Browser data is synthetic; the in-app browser was unavailable. The initial browser run encountered a stopped Web server; verification passed after restoring Web dev.

## Saved-take alignment audit — 2026-11-04

- [x] Inspect the reported take's persisted MFA words/phones, independent ASR timings, VAD intervals, raw frame energy/F0 and audio-retention state. Confirm major timing disagreement and missing alignment-quality checks; correct the earlier claim that the displayed `the` duration/pause was verified.
- [ ] Add evidence-based alignment validation and recovery before publishing word/phone durations, pause attribution and dependent word-level measurements. Do not silently replace MFA with ASR timestamps or clip a long word to an arbitrary duration. Validate on retained audio with checked boundaries; this take's analysis audio has been cleaned, so exact corrected boundaries remain unknown.

## Sound restoration and pause hit areas — 2026-11-04

- [x] Check the cited conversation and restore its Sound default, ten-color palette, arcs, IPA and right-side guidance; keep measurements under explicit filters.
- [x] Match Review's default phonology colors/filtering and separate pause space from word selection in both timeline views.
- [x] Root lint/build/test pass (513 Web; unchanged 1,861 API and 114 Extension suites cached). Desktop 1192px and mobile 390px browser regression verifies all ten badge colors, linking arcs, explicit measurements, IPA, conceal/reveal, responsive guidance and filters, separate pause hit areas, readable labels and identical Detailed/Review acoustic paths. Mobile rerun passed after a local worker connection timeout interrupted dev. Screenshots inspected; browser fixtures use synthetic account/analysis data.

## Shadow six-gap completion — 2026-11-04

- [x] Restore 20ms envelope/F0 from actual saved legacy measurements when available; retain missing evidence and deletion/Reference boundaries.
- [x] Include measured word-boundary gaps and recording-specific seconds; join continuous voiced pitch across words in shared Detailed/Review plotting.
- [x] Compact shared readouts with sound markers; show saved take duration; list every take’s analysis status without N+1 analysis reads.
- [x] Load Shadow styles with its route to avoid an unstyled dynamically prefetched workspace. Preserve left panels and earlier quiet-state exceptions.
- [x] Root lint/build/test pass (1,861 API, 511 Web, 114 Extension tests). Browser checks at 1192/390px verify measured gaps, envelope colors, identical Detailed/Review paths, readable labels, duration and every take’s status. Authenticated legacy take: 1,950 retained measurement frames produce 975 display frames; both modes show 18 measured envelopes and one segmented Melody path. Screenshots inspected. No real microphone or new analysis job was submitted.

## Shadow readability follow-up — 2026-11-04

- [x] Prevent word clipping across Rhythm, Melody and Review at minimum zoom and Fit; retain real measurement scale and horizontal scrolling.
- [x] Remove requested timeline/Takes explanatory text; move completed analysis state and deletion to Takes.
- [x] Compact pending/failure notices and fully locked Review; preserve layer gates and left panels.
- [x] Root lint/build/test pass (507 Web tests; API/Extension suites cached). Browser checks at 1192/390px verify complete word labels at minimum zoom and Fit; separate locked/uncertain/processing/failed checks verify compact states, retained recovery controls and cancelled analysis deletion. Screenshots inspected.

## Shadow analysis design 9.12–9.15 — 2026-11-04

- [x] Rebuild Detailed first, then Review Overview; preserve the left sentence panels.
- [x] Shared zoom/drag timeline, neutral Sound markers, Notes, exact-take routing, synchronized word selection, dual-voice lanes and destructive-action confirmations.
- [x] Persist real 20ms energy/pitch display frames without fabricating historical evidence; preserve word-matching gates and unassessed states.
- [x] Synthetic desktop/mobile browser checks cover Notes, saved-take selection, cross-view word selection, layers, voices, zoom, drag suppression, missing reference and page overflow. No real microphone, provider or account write was used.
- [x] Root lint/build/test pass (504 Web, 1,855 API, 114 Extension tests). Browser validation at 1440/390px also verifies 40%/60% layer gates and cancelled deletion; screenshots inspected. Existing optional frames remain backward compatible.

## Shadow highlight and control placement — 2026-11-03

All caption playback highlights share line-soft backgrounds, ink-2 text and 3px corners in Ingest and all Shadow modes. Quick keeps only Audio settings beneath its setup card. Review shows neither Reference preparation nor Audio settings. Detailed retains both. Existing capture/session state and playback logic remain intact.

## Quiet Stage 1 word highlight — 2026-11-03

Stage 1 current words now use line-soft warm gray backgrounds with ink-2 text, 3px corners and no shadow. This replaces inverted black/white highlighting per user feedback. Font weight, horizontal spacing, corpus underlines and playback timing stay unchanged; Shadow styling is unaffected.

## Shared Shadow controls — 2026-11-03

Quick and Review now render the same quiet compact BufferedReferencePanel as Detailed. All three modes share AudioSettings with Server analysis / Keep recordings labels and busy-recording guards. The old Quick reference summary and duplicate settings markup are removed.

## Shadow compact reference and settings — 2026-11-03

Detailed Shadow reuses the same quiet compact reference layout as Ingest, retaining readiness titles, setup instructions, errors and reference actions. Audio settings show only checkbox labels; How It Works is removed. Quick settings use the same concise labels. Capture, retention and analysis behavior are unchanged.

## Visual corrections — 2026-11-03

Validation: root lint/build/test passed. Focused browser checks passed at 1440/390px for the dark Quick start card, report button labels/sizes/colors, compact Reference copy and active-word black/white colors driven by the simulated playback clock. The broad legacy report suite encountered a reload timeout; it is not claimed as passing. Timing fixtures now use valid content UUIDs and mock the existing profile video visit write.

Quick start retains a black card as an explicit product exception, with 14px geometry and inverse actions. Report action buttons use a single label and standard primary/secondary sizes. Active caption words use black with white text. Ingest reuses compact Reference audio controls without introductory copy; setup instructions and actionable errors remain visible.

## Visual consistency and feedback pass — 2026-11-03

- [x] Unify shared primary/recording controls, Quick start, measurement palette and report shell.
- [x] Add reduced-motion-aware dialog/filter/tray transitions, selection feedback and assessment/save feedback.
- [x] Root lint/build/test pass (498 Web tests; unchanged API/extension suites may use cache). Corpus regression passes at 1440/768/390px and the final wrapped-filter/tray correction passes at 320px, including pagination. Loadout Quick start, drawer, manual preferences, retry and empty-state regression passes at 1440/390px. Motion checks verify focus restoration, reduced-motion and light Quick start at 1440/390px. Screenshots inspected. No real microphone or provider session was submitted.

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

Verification: root lint/build/test pass (API 1854, Web 498, Extension 114;
unchanged tasks may use cache). Controller tests pass 52/52, including shown-only
retention, pending-upgrade rejection, old output tails, read-only waiting and
runtime cleanup. Browser checks pass at 1440/390px for retained hint/question,
Voice/Chat continuity, speaking/thinking and next-reply replacement. Preview
regression passes 1440/768/390px; real-route design regression passes 1440/390px.
Desktop/mobile reply-reference screenshots inspected. Concurrent workspace builds
initially invalidated the shared production directory; final browser checks used
an isolated build copy with workspace dependencies. Synthetic sessions only;
no physical microphone or live provider session was started.


## Stage 4 target hint feedback — 2026-11-03

Target-card Hint retains the explicit selected target ID and the existing
question-versioned three-level flow in the shared conversation hint slot.
Its button now reports loading/retry/next-level state and disables unavailable
requests with an explanation (offline, speaking/draft, no question, busy/help
pending). Generic Need a hint? routing and generation remain unchanged. Compact
target actions share a baseline with no nested opportunity top margin.

Verification: root lint/build/test pass (API 1854, Web 496, Extension 114;
unchanged tasks may use cache). Synthetic browser checks pass at 1192/390px
for aligned action bounds, offline/draft gating, selected target request IDs,
loading feedback, direction and target opening display. Existing hint-bundle
regression passes at 1440/390px for cached switching, receipts, retries and stale
versions. Screenshot inspected under `output/playwright/target-hint/`. No live
provider or physical microphone was used.


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

Verification: root lint/build/test pass (API 1854, Web 496, Extension 114;
unchanged tasks may use cache). Output-meter unit coverage includes queued,
silent, suspended, interrupted and ended audio. Browser checks at 1192/390/320px
pass breathing, synthetic PCM through real Web Audio, clear, reduced motion,
Chat pause/resume, released tracks and no overflow. Existing design regression
passes preview 1440/768/390px and real routes 1440/390px. Desktop/mobile screenshots
reviewed under `output/playwright/stage4-orb/`. No physical microphone or live
provider session was used. Initial browser animation timing was stabilized by
waiting for observable motion; the test-only lint issue was corrected.


## Signed-out auth controls — 2026-11-03

- [x] Keep one Sign in header action, with explicit login/registration switching inside Clerk; disable implicit sign-in-to-registration transfer and preserve return URLs.
- [x] Synthetic checks pass on Landing/Corpus at 1440/390/360/320px for the single entry, explicit-flow options, return query/hash, signed-in visibility and no overflow. Real Clerk login → registration → login modal switching passes at 1440/390px without submitting credentials or completing OAuth.

## Landing viewport sections — 2026-11-02

- [x] Make the hero and following sections at least one viewport below a sticky
  header; native snapping and smooth anchors move between content sections.
- [x] Keep oversized phone content scrollable, scope snapping to Landing, and
  preserve reduced-motion behavior and content-only entry animation.
- [x] Root lint/build/test pass. Browser checks pass at 1192×1506, 1440×900,
  390×844 and 320×640 for full-height layout, wheel advance/snap, long-content
  access, return-to-input anchors, reduced motion and route cleanup.
  Screenshots reviewed under `output/playwright/landing-screen-*`.

## Landing waveform correction — 2026-11-02

- [x] Match the reference's continuous five-bar waveform: 1.1-second alternating
  cycles with 0.15-second staggering, replacing the former four-cycle stop.
- [x] Browser sampling confirms changing bar transforms and infinite iterations;
  prefers-reduced-motion still disables the animation.

## Landing / navigation artboards — 2026-11-02

- [x] Align Landing layout, typography, field, cards, icons and buttons with v2.
- [x] Add looping waveform/hero entry, progressive scroll reveal and hover motion;
  disable motion under prefers-reduced-motion.
- [x] Align global account pills and flow context/step/exit styles with the supplied
  navigation reference while preserving existing routing and focus safeguards.
- [x] Root lint/build/test pass. Synthetic Landing browser checks pass at
  1440/768/390/320px for empty/invalid URL feedback, focus, responsive layout,
  client sign-in navigation, anchor entry and normal/reduced motion. Screenshots
  reviewed under `output/playwright/landing-*`.
- [x] Shared navigation regression passes at 1440/390/320px, including connected
  conversation focus and cancelling the existing End mission confirmation.
  No provider call, real account write or deployment is part of this verification.

## Corpus library reference — 2026-11-02

- [x] Match the supplied 1440px full-width artboard: heading counts, filter
  popovers, neutral cards/metadata, pill controls and selected-item action tray.
- [x] Add 15-item incremental display, keyboard content tabs, per-group clearing,
  responsive popover placement and mobile bottom-navigation clearance.
- [x] Retain real High value metadata, full-collection search/sort, stable
  selection, detail/edit/delete and existing Loadout handoff/account boundaries.
- [x] Root lint/build/test pass. Synthetic browser checks pass at
  1440/768/390/320px: keyboard tabs/popovers, search/facets, incremental display,
  sort/reset, stable selection, hidden counts, long-title/source wrapping,
  detail/edit/delete/retry, account changes and Loadout handoff.
  Reviewed desktop, mobile and filter screenshots under `output/playwright/corpus-*`.
  The browser fixture does not contact a paid provider or modify real user data.

## Practice history reference — 2026-11-02

- [x] Match the supplied white list layout, title/return spacing, black New Mission,
  filter pills, inline Mission states and pagination separator.
- [x] Show truthful loaded-entry counts; retain existing server filtering/order.
- [x] Root lint/build/test pass. Synthetic history browser regression passes at
  1440/390/320px: local dates, keyboard focus, counts, pagination retry, late
  responses, all four filters, source/report links, long titles and empty states.
  Desktop/mobile screenshots reviewed under `output/playwright/practice-history-*`.


## My learning / global navigation v2 — 2026-11-02

- [x] Apply the supplied My learning reference with live data and existing empty/error states.
- [x] Share accessible assessment tabs with the Mission report; preserve zero/null semantics.
- [x] Move global navigation to the root layout; split Practice/Mission workflow steps.
- [x] Add bottom navigation below 720px, focus chrome during recording/conversation,
  account-scoped continuation links and collision clearance for fixed actions.
- [x] Verify root lint/build/test; fixture checks cover profile/history, feedback,
  keyboard tabs, 1440/390/320px layouts and conversation focus/end cancellation.
- Current Detailed practice-flow browser checks pass at 1440/390px; focused
  Reader → picker → Shadow checks pass at 1440/768/390px and retain the media host.
- Legacy full browser suites are not recorded as passing: `navigation.browser.mjs`
  timed out on Retry after the back-navigation hydration race was isolated;
  `stage-two-navigation.browser.mjs` has an unhandled video-visit request and
  selectors that match both mounted modes. The original scripts are retained.
- Physical audio, provider quality and deployment are not part of this style change.


## Stage 4 targets visible from entry — 2026-11-01

User decision supersedes the earlier default concealment: show all target
expressions and their meanings from the start, including Guided, so learners
know which expressions to transfer into conversation. Keep manual Hide/Show
controls; confirmed models and observed uses still reveal their targets when
manual concealment is selected. Speaking does not hide target wording; only the
current question hint fades. Actual visible wording records exposure, never
learner use. Existing explicit legacy support choices remain unchanged.

Verification: Web lint and root build/test pass (API 1854, Web 495, Extension
114; unchanged tasks may use cache). Production-server browser regression passes
at 1440/390px for v1/v2 entry visibility, manual Hide/Show and speech persistence;
preview states pass at 1440/768/390px and real-route design checks at 1440/390px.
These use synthetic sessions; no physical microphone was started.


```yaml
meta:
  contentType: How-to
  status: active
  updated: 2026-11-01
```

This is the living task queue for coding agents. Work from the first unblocked milestone. Update checkboxes, verification notes, and affected decisions in the same change.

## Loadout scene preparation recovery — 2026-10-31

- [x] Reproduce the reported three-expression setup against real Ark: copied UUID
  mismatch triggered a targets-array repair that lost frame slots; another run
  changed the fixed `you` anchors to `we`, including in its repair.
- [x] Use short model references, exact server-side identity restoration, explicit
  structure anchors and bounded rejected-field context. Keep normal semantic
  checks, one repair, the shared deadline and durable creation/retry contracts.
- [x] After the fix, the same-expression synthetic plan passed in one model call.
  The actual signed-in browser retry also saved/opened its three-target Mission;
  no microphone or conversation was started. These are pipeline checks, not a
  measured model success rate or learning-quality evaluation.
- [x] Focused provider, planning, field-repair, inspection, logic and CORS tests:
  **180 passed**. Existing Starlette TestClient deprecation warning remains.

## Stage 4 on-demand hint bundle — 2026-11-01

The user authorized the first latency optimization only: generate three levels
once, cache, smooth switching, preserve question versions and actual exposure.

- [x] Generate/validate one coherent three-level bundle, cache privately per live
  connection and coalesce same-context in-flight requests. Ready upgrades skip
  generation and the server loading write. Failure retries do not reuse failure.
- [x] Fence by question ID/version/quote revision, target/version, support/version,
  activity epoch and transcript revisions; cancel on input/disconnect. Keep old
  public protocol, legacy runtime and actual exposure semantics.
- [x] Delay loading feedback by 250ms, retain the prior ready level during upgrade
  and across mode changes, and acknowledge its exact painted ID/version. Retire
  retention on context/input/support/disconnect; preserve same-level retries.
- [x] Add sanitized bundle-generation and request-to-ready/cache-hit diagnostics.
- [x] Validate focused tests, full regression and real-route desktop/mobile UI.
Verification:

- Cache-specific backend tests: **11 passed** (one generation for three levels,
  single-level public snapshots, single-flight/retry, question/quote/support/target/
  input fences, cancellation and old-result isolation). Existing conversation and
  recast focused tests pass; frontend controller tests: **50 passed**, including
  deterministic 250ms timing, retained-card receipts and context retirement.
- Root lint/build pass. Real-route browser checks pass at **1440px and 390px**:
  slow initial loading, retained upgrades across modes, quick-result no-flash,
  exact displayed-level receipts, version rejection, same-level retry, input
  retirement and no overflow. Screenshots inspected in
  `/tmp/libitu-help-bundle-20261101`. Negotiated conversation, recast/report and
  the six-item v1/v2 alignment browser regressions also pass.
- One bounded live Ark request using an independent synthetic question passed
  all three level validators in **2873ms**. This is a single cold-generation sample,
  not an end-to-end latency distribution or measured improvement over a baseline.
  Runtime/browser regressions use injected providers and synthetic sessions.
- The first full run passed **API 1854 / Extension 114**, with **Web 494/495**:
  the previously observed Analytics polling test again read twice instead of three
  times within its real 20ms sleep; isolated reproduction also failed. Replaced
  only that test's wall-clock sleep with controlled timer advancement, preserving
  its two-poll bound and adding an assertion that no further polls occur. No
  Analytics runtime behavior changed. Its full isolated file now passes **19/19**.
- Final root serial regression passes: **API 1854 / Web 495 / Extension 114**,
  with zero failures. Final root lint passes; the production build and all scoped
  desktop/mobile browser suites pass. Existing Starlette/Node warnings remain.
- Local documentation links: **167 valid**, with no missing files; whitespace
  check passes. No schema migration or application deployment; no physical
  microphone was started.

- User decision: do not implement background pre-generation for now; learners
  may not request hints, so unused generation would waste model calls and cost.
  Remove it from the active follow-up queue; reconsider only by explicit decision.
  Keep manual/eligible automatic help generation on demand and do not make it a
  prerequisite for entering a session. The first cold request still waits for a model. No live provider/device latency improvement is claimed
  from injected-provider/browser tests.

## Stage 4 Conversation redesign — 2026-10-31

Current scope: the 2026-11-01 request to close four functional gaps, align two
visual differences, and rerun verification after steps 1–4. This supersedes
the earlier UI-only and pause/provider-only scopes for the ordered redesign below. Contract:
[Conversation states and data](design/docs/STAGE_FOUR_CONVERSATION_CONTRACT.md).

- [x] Step 1: define help levels, stable question identity, timing and automatic
  budgets, simpler-question planning, grounded correction results, presentation
  receipts and old-session/client compatibility. Preserve automatic target reveal
  after a confirmed model or observed learner use. Reconcile living documents.
  This delivers a specification, not deployed or executable schemas/behavior.
- [x] Step 2: rebuild the Conversation UI against synthetic fixtures, including
  Voice/Chat, one help position, target reveal, stage strip and lifecycle states.
- [x] Step 3: implement Python/TypeScript contracts and negotiated runtime,
  question/timer state, simpler questions, progressive help and receipt fencing.
- [x] Step 4: implement asynchronous minimal recasts, actual partner delivery,
  changed-word emphasis and report-only correction classification.
- [x] Step 5 automated/visual portion: contract and full serial regression,
  desktop/mobile synthetic browser checks and screenshot inspection.
- [ ] Step 5 remaining acceptance: real provider quality and physical microphone/
  speaker checks; keep these separate from protocol/browser verification.

2026-11-01 alignment follow-up:

- [x] Apply concealed targets to v1/no-plan sessions without explicit support,
  including before connection; keep v1 explicit settings. Require revision-bound
  model confirmation for new auto-reveals and record visible owned-target receipts.
- [x] Record the response's stage at request time and publish a divider only after
  its question is actually presented. Validate source revision, persist through
  reconnect/end, collapse adjacent same-stage markers, and never infer old history.
- [x] Move evidence detail into the target panel; open it on mobile and preserve
  original transcript/highlights. Keep the close action visible at 390px.
- [x] Restore Chat hint 16px text, #fafaf9 surface and 14px/18px padding through
  the runtime wrapper; retain the lighter Voice treatment.
- [x] Show “Waiting for you” for a confirmed rephrase awaiting a reply; suppress
  it on input, stronger help, pause or disconnected states.
- [x] Restore the top guide's current-stage cue; keep Chat dividers stage-name only.

Alignment verification:

- Focused backend tests: **48 passed**; focused frontend tests: **45 passed**.
  Root lint/build pass. Complete serial root regression
  (`pnpm exec turbo run test --concurrency=1`): **API 1843 / Web 487 /
  Extension 114 passed**, with no failures. Existing Starlette/Node warnings remain.
- `speaking-alignment.browser.mjs`: all four combinations of 1440/390px and
  v1/v2 pass, including preconnection concealment, model/use reveals, real-route
  stage dividers, sidebar evidence/open/close, exact Chat hint styling, Voice
  treatment, silence status, known/unknown stage cue and no overflow. Desktop
  and mobile screenshots inspected in `/tmp/libitu-stage4-alignment-20261101`.
- Preview at 1440/768/390px (15 states, both modes), real-route design, negotiated
  help and recast/report browser regressions pass. Legacy Stage 4 support levels,
  no-hint privacy, skip/undo and owned exposures pass with
  `LIBITU_SPEAKING_ONLY=1`; legacy help and full conversation lifecycle checks
  also pass, including synthetic AudioWorklet PCM/playback, interruption,
  background pause, explicit resume, reconnect, end/reload and owner isolation.
- The unfiltered legacy support browser script still stops in its separate
  Loadout section at the removed `Mission support` selector. It was not counted
  as passing; the Stage 4-only option isolates the relevant compatibility checks
  without changing Loadout behavior. No real provider or physical microphone
  quality acceptance is claimed, and no application deployment was performed.
- Local documentation links: **167 valid**, no missing files; whitespace check passes.

Step 1 verification: local documentation links and whitespace checks pass;
runtime/code tests are not claimed for this documentation-only change. The
contract's acceptance matrix remains work for steps 2–5.

Step 4 implementation:

- Analyze one minimal correction asynchronously per finalized learner turn. Bind
  it to the exact source ID/revision and UTF-16 edits, reconstruct the replacement
  and derive changed-word emphasis. Reject uncertain/incomplete ASR and changes
  to protected meaning anchors; keep the original transcript unchanged.
- Reserve a ready candidate before a normal reply without waiting for analysis.
  Independently validate natural recasts in actual partner replies, including
  voice replies whose learner ASR finalizes later. Late suggestions never trigger
  an extra correction response. Deduplicate by rule plus normalized edit.
- Require actual validated delivery and presentation receipts before live display.
  Voice retires its line on new input; Chat retains confirmed history beside its
  own learner turn. Grammar/word-choice categories and reasons remain report-only.
  Recast exposure cannot create learner use or confirmed target demonstration.
- Freeze whitelisted optional report annotations; preserve old sources, jobs,
  hashes and retries. Hosted migration `20261031091811_speaking_conversation_recasts`
  was applied to Libitu (`ulrdykwhggcaspylines`). Local PostgreSQL and hosted
  rollback-only SQL checks pass, including private-field exclusion, owner
  isolation, retry stability and service-role-only execution. No synthetic
  profiles remain. Security/performance advisors are unchanged (informational
  [private-table RLS](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
  and [unused indexes](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)).

Step 4 verification:

- Root lint/build pass; focused recast backend tests pass (29 cases). Web tests
  pass (483) and Extension tests pass (114). A full backend run passed 1835 tests
  with the existing Stage 2 90ms MFA lease test failing; its isolated retry passes.
  An earlier parallel run also hit the existing 20ms Analytics polling assertion;
  its isolated retry and the next full Web run pass. Final root serial regression
  (`pnpm exec turbo run test --concurrency=1`) passes: API **1836**, Web **483**,
  Extension **114**. No Stage 2 behavior was changed in this step.
- `speaking-recasts.browser.mjs` passes at 1440/390px: no speculative line, only
  changed words bold, no strike-through/live categories, unchanged original,
  Voice retirement with no late revival, Chat history, one exposure receipt,
  revision rejection and report source navigation without regeneration. Screenshots
  inspected; no horizontal overflow or console errors. Negotiated help regression
  also passes at both widths; its mode-change assertion now waits for the new
  surface to paint before counting the single hint position.
- Documentation links and whitespace checks pass. This step does not deploy the
  application or qualify real model correction quality or physical microphone/
  speaker behavior; those remain separate step 5 acceptance.

Step 3 implementation:

- OpenAI advertises Conversation protocol 1; clients negotiate before creating a
  ticket. Missing negotiation preserves legacy behavior; unsupported versions
  are rejected before claiming a runtime. Gemini remains explicit legacy mode.
- Persist actual question UUID/UTF-16 refs/context version, per-question budgets,
  closed/archived questions and presentation receipts. Rephrasing retains identity.
  Eligible silence uses configurable 8/20-second defaults, excluding generation,
  playback, stale/hidden activity, speech, drafts and pending transcription.
- Direction → opening words → example replaces one position. Manual help closes
  automatic budgets; speech/drafts retire all current help. Visible receipts,
  including targetless receipts, remain distinct from generation and target use.
- Optional `simpler_question` is generated/frozen without adding null fields to old
  serialized plans. Existing support, plan versions and evidence meanings remain.
- No correction generation or database migration is included.

Step 3 verification:

- Root lint/build pass; the final Web build also passes after adding the short
  hint fade-out. Root tests pass: API 1792, Web 481, Extension 114 (the last run
  reuses the passing Web/Extension cache). This includes 25 new API cases and
  three controller cases for question/help identity, timing gates, receipts,
  stale results, duplicate completion, optional-plan serialization and compatibility.
- A parallel build/test run hit the existing Stage 2 90ms MFA lease timing test;
  its isolated retry and the subsequent full run without a parallel build pass.
  No Stage 2 code was changed in this step.
- New negotiated-route browser checks pass at 1440/390px: direction → opening
  words → example, one slot across Voice/Chat, visible-only receipts, immediate
  speech/draft suppression and fade-out, no revival/overflow. Legacy-help browser
  checks also pass at both sizes, including covered/hidden suppression and late
  result fencing. Mobile screenshot inspected; artifacts are under
  `/tmp/libitu-conversation-step3/`.
- Logs: `/tmp/stage3-lint-complete.log`, `/tmp/stage3-build-final.log`,
  `/tmp/stage3-web-build-verified.log`, `/tmp/stage3-tests-isolated.log`,
  `/tmp/stage3-browser-complete.log`, `/tmp/stage3-legacy-browser.log`.
- Local documentation links and `git diff --check` pass. Runtime tests inject
  model/audio events; browser tests use synthetic auth/API/socket data. No live
  model-quality, physical-microphone, hosted database or deployment acceptance
  is claimed. Those checks remain in step 5.

Step 2 verification:

- Root lint/build/test pass (Web 478, API 1767, Extension 114; unchanged API and
  Extension checks reused Turbo cache). Final web build and focused lint also
  pass after scoped neutral-button and Free-conversation fixture corrections.
  Logs: `/tmp/libitu-conversation-step2-{lint,build,test}.log`,
  `/tmp/libitu-conversation-step2-{build,lint}-final.log`.
- `speaking-design.browser.mjs` passes at 1440/768/390 px: both views, 15
  synthetic states, replacement-only hints, speech/draft suppression, exact
  changed-word emphasis, confirmed-model/use reveal, uncertain-model concealment,
  Show/Hide, no overflow and zero speaking API calls from the preview. Actual
  speaking-route/controller checks at 1440/390 px use synthetic auth/API/socket
  data and confirm current captions, target use, view continuity and no new wire
  controls. Screenshots inspected under `/tmp/libitu-conversation-step2/`;
  log: `/tmp/libitu-conversation-step2-browser-final.log`.
- Existing `speaking.browser.mjs` passes at 1440/768/390 px, including real browser
  worklet/playback with synthetic media, interrupt/mute, lost text ACK recovery,
  background pause/resume, account isolation, denied mic, takeover and end/delete.
  `speaking-help.browser.mjs` passes at 1440/390 px for legacy Usage/Example,
  visibility/occlusion receipts, late results and automatic-card retirement.
  Logs: `/tmp/libitu-conversation-step2-{regression,legacy-help}.log`.
- Preview is 404 on the existing server without its opt-in flag. No controller,
  audio, backend, wire schema or real provider logic changed. This does not
  validate new timers, real simplification/correction generation, physical
  microphone quality or learning outcomes. Step 3/4 work remains unchecked.

## Stage 2 Detailed / Review visual alignment — 2026-10-30

- [x] Share the directory header and visual styles, including the 260 px desktop
  expanded panel, 56 px collapsed rail, selection, numbering and metadata.
  Use matching 680 px main content, header/navigation styles and 32/44 px
  desktop/phone fold targets. Keep Review filters and take metadata distinct
  from Detailed progress and skip-short controls.
- [x] Preserve recording-driven collapse, manual fold preferences, sentence
  selection, playback and analysis behavior. Verify desktop and 390 px phone
  expanded/collapsed states through the local synthetic browser fixture;
  no horizontal overflow. Screenshots: `/tmp/libitu-stage-two-unify/`.
- [x] Root lint/build/test pass (Web 478, API 1767, Extension 114; unchanged
  workspaces may reuse cache). Final web build passes after the responsive
  header adjustment. Logs: `/tmp/libitu-stage-two-unify-{lint,build,test}.log`
  and `/tmp/libitu-stage-two-unify-build-final.log`.
- [x] Extended production browser regression passes at 1440/390 px for both
  modes, including style parity, selection/filter retention, no autoplay on
  fold, recording, history and the existing analysis gates. Log:
  `/tmp/libitu-stage-two-unify-browser.log`. The harness isolates the video
  iframe and waits for the async reference-arm event before checking its count.
  These fixtures do not qualify live YouTube or acoustic-analysis quality.

### Central result and analysis follow-up

- [x] Align result/action spacing, primary/secondary button geometry, saved
  analysis status ordering, neutral three-layer tabs, filters and guidance.
  Keep graph/evidence colors and existing handlers/analysis gates. Use the
  analysis container width to stack guidance on narrow screens.
- [x] Root lint/build/test pass. Logs:
  `/tmp/libitu-stage-two-analysis-{lint,build,test}.log`.
- [x] Production browser regression passes at 1440/390 px for all three layers,
  including matching buttons/layout, selected/locked states, keyboard controls
  and absence of overflow. Existing recording/history/playback checks pass.
  Log: `/tmp/libitu-stage-two-analysis-browser.log`; screenshots:
  `/tmp/libitu-stage-two-analysis/`. Final web build passes after the narrow
  tab layout and progressive-comparison typography adjustments:
  `/tmp/libitu-stage-two-analysis-build-final.log`. Validation uses synthetic
  fixtures; it does not qualify live media or acoustic-analysis quality.

## Mission OpenAI voice migration — 2026-10-30

- [x] User authorized reusing the existing API key and switching Mission voice.
  Set code/example/local defaults to `openai` / `gpt-realtime-2.1` / `marin`.
- [x] Preserve current Mission state/teaching contracts and Doubao text tasks.
  Keep provider headers/audio out of WebSocket debug logs; add the missing
  SOCKS transport dependency needed by the local proxy.
- [x] Add an opt-in provider-only smoke and make the existing runtime smoke
  select the configured provider instead of always instantiating Gemini.
- [x] Real synthetic voice smoke: configuration, opening audio (244800 bytes),
  cancellation, truncation, ASR (48 characters), post-interruption audio (148800
  bytes), text-only response and fresh-connection assistant history all passed.
  No learner records/database writes; this is not a physical-device or full
  persistence/teaching-quality acceptance run.
- [x] Focused runtime/transport/coaching/support/staged tests: 95 passed.
- [x] Root `pnpm lint`, `pnpm build` and `pnpm test` pass: API 1767,
  Web 478 and Extension 114 tests (extension cached). Existing Starlette/httpx
  deprecation and Node module-type warnings remain. `git diff --check` passes. Logs:
  `/tmp/libitu-openai-{lint,build,tests}.log`. Local API auto-reloaded and
  `/health` returned OK.
- [ ] Physical microphone/speaker and OpenAI-specific teaching-quality acceptance.

This request authorizes the provider switch; deferred demonstration/correction
and Summary-only expansion remain outside this increment.

## Stage 3 reference completion — 2026-10-26

- [x] Fix Hero Quick start being disabled by an empty saved custom scene/manual
  selection despite having recommendations. It now validates and starts its own
  shown recommendation; manual Start retains its validation. Reproduced on the
  authenticated Chrome page and verified enabled after the fix without clearing
  the learner's manual draft. Focused lint/typecheck and 52 regression tests pass.
  A synthetic browser reproduction of zero manual targets plus a blank custom
  scene completes Quick start planning/create/navigation with the displayed
  recommendation. No Mission was created in the learner's actual account.
- [x] Remove the general selection-tips disclosure and manual scene comparison.
  AI scene mode uses the user-provided sentence; Start prepares the scene directly.
  Fit recovery links to a custom scene description rather than scene comparison.

Current priority: complete Stage 3 against the development notes, Quick start
prototype and neutral design specification. The user paused further Stage 4
work; the earlier runtime acceptance item below remains open and deferred.

- [x] Add the nine-template catalog, explicit family/stage-function metadata and
  Travel, without changing the shape of old frozen logic snapshots.
- [x] Add owner-checked, bounded custom-scene logic matching; failures retain the
  learner's scene/targets and do not create a Mission.
- [x] Finish unified Quick/manual/custom-scene state, the four filters, shared
  drawer, inline Adjust, four Advanced rows and Free-conversation preview.
- [x] Connect read-only recorded-use history with the user-approved fixed
  seven-day Due rule and explicit unknown states.
- [x] Full API suite: 1764 passed (existing Starlette/httpx deprecation only).
  Local and hosted catalog/usage SQL rollback contracts pass; both migrations
  applied to hosted development, synthetic fixture profiles verified absent.
  Security/performance advisors have no warning/error (existing INFO notices).
- [x] Real Stage 3 Ark/Supabase synthetic smoke passes: owned usage, custom Travel
  scene matching, Making plans v2 persistence/read, frozen targets, create and
  exact retry; unstarted drafts do not manufacture usage. Successful run 19.30 s.
  The first run failed with `persistence_transport_error`; cleanup was verified
  after both runs. Logs: `/tmp/libitu-stage3-real-smoke{,-retry}.jsonl`.
  Reproduce with `apps/api/scripts/smoke_loadout_stage_three.py --live --ipv4`.
  A separate single custom-scene match passed in 2.75 s with no database writes.
- [x] Root lint/build pass; API 1764, Web 476 and Extension 114 tests pass.
  Logs: `/tmp/libitu-stage3-{lint,build}-final.log`,
  `/tmp/libitu-stage3-api-tests.log`, `/tmp/libitu-stage3-web-tests-final.log`,
  `/tmp/libitu-stage3-extension-tests.log`. `git diff --check` passes.
- [x] CUA desktop and 390px mobile acceptance uses the real Loadout components
  with explicitly synthetic auth/corpus/API responses: inline/shared preferences,
  Travel, four filters, five-target limit, pinned Shuffle, drawer search retention,
  custom scene matching/manual logic override and Free preview/confirmation pass.
  Captured planning and create requests agree on targets and selected logic;
  Free creates with zero targets and null logic. Mobile has no horizontal overflow,
  44px filter controls and a working dismissible drawer. Screenshots and visible
  request captures: `/tmp/libitu-stage3-acceptance/`.
  The actual `localhost:3000/loadout` guest route also loads successfully.
  Browser regression fixtures/scripts were updated and syntax checked, but the
  automated browser suites and authenticated OAuth flow were not rerun.

Summary-only feedback remains visibly unavailable because it requires the
paused Stage 4 behavior. Existing Balanced drafts retain their original value.
The preceding scope supersedes the earlier six-template/no-Travel/no-review
boundaries below only for Stage 3; it adds no new Stage 4 runtime behavior.


## Logic-constrained Mission milestone — 2026-10-26

- [x] Bind selected logic and target stages to version 2 planning, cache identity,
  scene validation and frozen Mission snapshots; retain v1 and exact retries.
- [x] Validate one natural model line per target separately from its implicit
  trigger; preserve stage assignments through bounded repair and linked rounds.
- [x] Add stage-aware, once-per-target modeling with real presentation/effect
  evidence; independently used targets need no demonstration.
- [x] Conceal v2 target wording before explicit reveal or actual modeling;
  record visual help and distinguish independent, imitation and other assistance.
- [x] Verify service-only v2 SQL contracts locally: five targets, shared stages,
  Any stage, frozen templates, linked-round preservation and durable exact retry.
- [x] Root lint/build/test pass: API 1713, Web 462, Extension 114 tests.
  Cross-layer tests cover planning → create/retry → live evidence projection →
  frozen report for independent, imitation, visual-help and uncertain-audio paths.
  Runtime tests cover receipt/effect order, duplicate ACK/reconnect, transcript
  revisions, End with pending receipt persistence and v1/v2 modeling skip rules.
  V2 no longer skips a demonstration merely because the learner performed the
  same communicative task without using the target expression. Logs:
  `/tmp/libitu-logic-milestone-{lint,build,test}-final.log`.
- [x] Inspect the real guest Loadout in the browser: neutral/black styling,
  disabled empty-state actions and v2 support-selector removal are intact.
  Authenticated populated browser/real-microphone acceptance is not claimed.
- [x] Apply `20261026063046_speaking_logic_stage_milestone` to hosted development.
  V2 SQL rollback checks pass, with zero remaining synthetic records; security
  and performance advisors report no warning/error.
- [x] Real Ark/Supabase synthetic planning smoke: two targets (chunk + structure),
  stage 0 + Any stage, one model call (8.21 s), no repair; durable plan read,
  Mission creation/read and exact retry pass. Total 17.61 s; cleanup verified.
  Reproduce with `apps/api/scripts/smoke_speaking_logic.py --live --ipv4`.
- [ ] Complete real Gemini → confirmed demonstration → imitation acceptance.
  After the v2 skip-rule fix, the final bounded synthetic text run delivered one
  `model_then_transfer` attempt (sent, bound and presented). The saved reply
  contains the target and a later question; assessment/presentation/response
  revisions all equal 1. Effect assessment returned `unknown` with
  `Effect assessment is unavailable.` (`AnalysisProviderError`); the underlying
  provider error is not retained. The target correctly remains `exposed`, with
  zero imitation uses; the run timed out after 120 seconds and two typed turns.
  Runtime/database error lists are empty. Exact synthetic reply and assessment:
  `/tmp/libitu-staged-runtime-smoke-v2-skip-fix.jsonl`.
  The earlier `/tmp/libitu-staged-runtime-smoke-classified.jsonl` returned
  `not_reflected` without retaining its reason; the skip-rule conflict was found
  independently and is not established as that run's cause.
  A separate default-transport run captured a Supabase `ConnectTimeout`; the
  IPv4 diagnostic avoided that failure without changing product networking.
  Typed inputs and synthetic text visibility receipts do not verify microphone
  capture or audio playback. All generated records were verified cleaned up.

Boundary: existing six logic IDs/tags and scenario enums remain. No taxonomy,
review scheduling, Travel, Summary-only, once-per-error correction, pronunciation
or streaming increment. Synthetic/provider checks do not establish teaching
quality, real microphone behavior or OAuth acceptance.

## Mission Loadout visual alignment — 2026-10-25

- [x] Extend `design/docs/libitu 设计规范 v1.0.md` to Loadout while retaining
  the Quick start reference layout. Use black primary actions/current navigation,
  explicit gray disabled states, neutral cards, restrained typography and no shadows.
- [x] Scope shared-control overrides to Loadout; preserve other pages and Mission creation.
- [x] Keep Advanced rows initially visible with independently expandable settings.
- [x] Web lint/build and all 455 Web tests pass. Live browser inspection covers
  the guest empty state, disabled controls, expanded logic cards and corpus drawer.
  The populated browser fixture assertions were updated but not rerun in this pass.

## Mission Loadout Quick start — 2026-10-25

- [x] Rebuild Loadout around the supplied Quick start reference, shared manual
  selection, full-corpus drawer, preview and collapsible Advanced controls.
- [x] Recommend up to three real saved items locally using existing tags and six
  API logic templates; show matching stages or Any stage, with deterministic
  scene seeds and Shuffle. Do not infer Never used or Due for review.
- [x] Accept one shared pool of up to five targets of any supported corpus kind.
  New selections use equal priority, represented by the existing `primary` role;
  preserve legacy snapshots, linked-round roles and uncertain request payloads.
- [x] Keep manual targets through Shuffle and share selection with the searchable
  function-filtered drawer. Retain scene comparison, support and practice history.
- [x] Add Free conversation with no targets, null logic and no target plan;
  reuse the authenticated, durable create/confirm/retry lifecycle.
- [x] Retain account/tab fences, queued draft persistence, source validation and
  exact uncertain-create replay before planning another Mission.
- [x] Focused verification: TypeScript and component lint pass; nine local
  recommendation tests and 523 focused API tests pass. The migration and SQL
  rollback checks pass on isolated local Postgres.
- [x] Root lint/build/test pass: Web 455, API 1654, Extension 114 tests;
  final lint has no warnings. API retains the existing Starlette deprecation.
  Logs: `/tmp/libitu-loadout-redesign-{lint,build,test}-final.log`.
- [x] Browser fixtures pass at 1440 / 390 px: three real recommended targets,
  shared drawer/search/filters/five-target cap, keyboard modality and focus
  restore, manual selection through Shuffle, preferences/history, empty corpus,
  Free conversation and exact creation retry. Return starts a new request and
  reuses a matching scene. Manual five-target Start and explicit hero replacement
  of manual picks pass; Shuffle preserves the selected logic. Screenshots:
  `/tmp/libitu-loadout-redesign/`.
- [x] Apply `20261025123200_loadout_quick_start_targets` to hosted development;
  rollback tests verify free creation/replay, five structures and owner isolation.
  Security advisors have no warning/error; existing private-schema info remains.
- [x] Free-conversation reports show transfer as not applicable; report Retry and
  Adjust preserve free mode and do not depend on corpus availability.

Boundary: existing `workplace` / `everyday`, difficulty, feedback and support
enums remain. New taxonomy/eligibility metadata, usage statistics/review rules,
Travel, Summary-only feedback, new daily-life logic IDs, streaming SessionBrief
and the proposed Stage 4 one-demonstration/one-correction rules remain outside
this increment. Local recommendations and fixture tests are not evidence of
model quality, teaching effect, live voice or real OAuth.

## Practice workspace visual refresh — 2026-10-25

- [x] Scope the supplied neutral visual direction and black primary actions to
  Stage 1, segment selection, Stage 2 and their loading shells.
- [x] Keep Stage 1 video and existing Reference setup; restyle transcript,
  logic flow, corpus cards and footer without changing their event handlers.
- [x] Replace segment decoration with neutral cards and purple selection;
  retain timing, metadata, difficulty and selection behavior.
- [x] Restyle Quick/Detailed/Review chrome while retaining analysis diagrams,
  semantic feedback, settings, history and recording behavior.
- [x] Complete responsive visual QA at 1440 / 390 px for Reader, segment
  selection, Quick setup/listening/paused, Detailed and Review. Check horizontal
  overflow, black enabled primary actions, segment/timeline selection and mode
  switching. Screenshots: `/tmp/libitu-redesign-preview/` (synthetic content).
- [x] `pnpm lint`, `pnpm build`, `pnpm test`: Web 443, API 1645 and Extension
  114 tests pass. The production CSS includes the final keyboard-focus rules.
- [x] `reference-setup.browser.mjs`: setup acknowledgment, stale-reply
  cancellation and retry pass at 1440 / 390 px.
- [x] `stage-two-practice-flow.browser.mjs` passes at 1440 / 390 px:
  settings, reference cancellation, recording, 60/85 analysis gates, layer
  presentation, historical takes, cancellation restoration and deletion.
  Screenshots: `/tmp/libitu-stage4-practice/`.

Browser test maintenance updates only visual expectations to black pill buttons,
replaces the obsolete Reference progressbar wait with the existing cancel/status
presentation, restricts synthetic microphone instrumentation to the app frame, and disables
decorative transitions for deterministic color assertions.
Browser checks use fake identity/audio/API data, not live login, extension media
capture, hosted persistence or model-quality verification.

### Design follow-up and live playback diagnosis — 2026-10-25

- [x] Apply the user's clarified horizontal-spacing preference: 16 px page
  insets on desktop, 12 px on phones, shared across practice headers, picker
  title/timeline/cards/footer and Stage 1/2 page padding. Keep inner content-width limits.
- [x] Correct the outer margin separately: remove the 1280 px workspace cap and
  automatic centering that generated 80 px side margins at a 1440 px viewport.
- [x] Move picker Back to the right in DOM/layout and remove the Recommended
  star. Reset the legacy phone heading order so Back remains on the right.
- [x] Verify Reader, picker, Quick, Detailed and Review at 1192 / 390 px with
  fixtures: no horizontal overflow, preserved black primary buttons, matching
  16 / 12 px picker insets and no Recommended SVG. Back's right edge is 1176 /
  378 px respectively. Screenshots: `/tmp/libitu-spacing-preview/`.
- [x] Final spacing checks: root lint/build/test pass; final production CSS is
  rebuilt after the phone-order correction. Logs: `/tmp/libitu-spacing-lint.log`,
  `/tmp/libitu-spacing-build-final.log`, `/tmp/libitu-spacing-test.log`.
- [x] Center the shared Stage navigation with equal outer header columns; retain
  centered navigation at narrow widths. Remove the picker header's five-minute badge.
- [x] Verify the real supplied content's picker in the in-app browser at 1192 px:
  navigation center is exactly 596 px, the removed badge is absent, and the
  selected segment remains actionable. Screenshot:
  `/tmp/libitu-design-followup-actual.png`.
- [x] Fixture layout and iframe-click checks at 1440 / 1192 / 596 / 390 px:
  centered navigation, no horizontal overflow, black primary actions, Stage 1,
  Quick listening and Detailed iframe buttons remain clickable. Quick/Review
  visibility rules are unchanged. Screenshots: `/tmp/libitu-design-followup/`.
- [x] `reader-progressive.browser.mjs` passes desktop/mobile and reduced-motion
  cases, including iframe clicks, wheel scrolling and preservation of the iframe.
- [x] Re-run root `pnpm lint`, `pnpm build`, `pnpm test`; all pass (Web 443,
  API 1645, Extension 114). Logs: `/tmp/libitu-design-followup-{lint,build,test}.log`.
- [ ] Live YouTube playback remains blocked by Google verification redirects in
  the current network environment. The supplied Stage 1 iframe displays
  “www.google.com redirected you too many times”; a separate minimal page with
  both standard and privacy-enhanced embeds reproduces it, including explicit
  origin/referrer settings. HTTP responses redirect to `/sorry/index` and back.
  This is not a successful playback check. No player, recording, capture or
  network/privacy settings were changed. Retest real Stage 1/2 playback after
  the external access issue is resolved. Evidence:
  `/tmp/libitu-player-network-error.png`.

## Release confirmed Mission starts — 2026-10-24

- [x] Reproduce the lifecycle defect in code: successful create/retry navigated
  without acknowledging the persisted pending submission, so Return/End could
  never release its exact-retry lock.
- [x] Verify create response owner, original client ID and valid Mission ID;
  clear only the matching pending submission through the existing draft CAS.
  Preserve selections, settings and cached scenes for the next explicit Start.
- [x] Persist acknowledgement before publishing unlocked state. Failed network,
  mismatched responses, storage errors and account/tab changes cannot clear a
  different or still-unconfirmed request.
- [x] Verify create/retry, End and return-to-Loadout create a new request/Mission,
  including legacy completed recovery, storage failure and cross-tab races.
- [x] Full Web suite: 443 passed. TypeScript, changed-file ESLint and isolated
  production build pass. Browser fixtures at 1440/390 px cover exact retry,
  End, editable Loadout and a distinct new Mission with the cached scene; legacy
  completed requests, mismatched responses, quota failure and late responses
  across tabs also pass. Existing Loadout (1440/768/390 px), scene planning and
  linked-practice (1440/390 px) browser suites pass. No paid model call or live
  database write was needed.

## Mission preparation latency P0/P1 — 2026-10-24

- [x] Automatic Start requests exactly one scene; manual comparison and linked
  practice keep two, with legacy one-to-three plan readability.
- [x] Replace complete regeneration with one bounded field-patch call. Aggregate
  original schema/semantic/practice errors, normalize verified target order,
  reject unrequested/missing/duplicate patch IDs, and revalidate the full result.
  Good fields remain unchanged. Unlocatable/malformed output stops safely.
- [x] Batch selected owner-bound corpus reads; retain snapshot validation at
  save/create and committed retry before stale-source checks.
- [x] Reuse cached scenes for difficulty/feedback/template/support changes;
  invalidate on scenario/brief/target order/roles/wording/metadata changes. Keep
  owner and multi-tab fences. Fix linked-practice matching of decorated corpus
  labels against the actual saved expression.
- [x] Add privacy-safe input/model/repair/validation/save/create/workspace timing,
  `Server-Timing` and `X-Request-ID`, plus bounded browser Performance measures
  for cache state, requests, navigation and click-to-ready.
- [x] Apply all 30 migrations and five SQL rollback suites on isolated Postgres;
  apply `20261024092759_speaking_single_scenario_plans` to development Supabase
  and pass hosted planning rollback tests (single-scene save/create/replay,
  0/4 rejection, legacy 2/3 acceptance, ownership and stale-source checks).
- [x] Database-free five-target real Ark probe: 18.01 seconds including two-field
  repair (13.85 + 4.11 seconds provider time). Injected missing-slot repair takes
  2.46 seconds and preserves every other field. Three real calls total.
- [x] Separate real three-target, single-scene hosted smoke: planning 11,468.09 ms
  (input 272.72, model 9,921.28, validation 5.13, save 1,261.81), create 318.69 ms,
  workspace 628.84 ms. One model call. Save/recovery, frozen targets, exact retry,
  stale-source and support checks pass; synthetic records/dependents cleaned up.
  Evidence: `design/benchmarks/mission-planning-20261024/`. These are individual
  synthetic runs, not end-to-end user latency distributions or learning evidence.
- [x] Full API suite: 1,645 passed. Full Web suite: 438 passed. Root lint,
  TypeScript and isolated production Web build pass. Browser suites pass for
  Mission planning and linked practice at 1440/390 px, and original Loadout at
  1440/768/390 px, including source drift, account/tab fences, exact retry,
  settings cache reuse and ready-page timing. The user's dev server was preserved.

## Loadout planning timeout repair — 2026-10-24

- [x] Reproduce the current Loadout failure in the signed-in browser: planning
  times out, so both manual generation and first-time Start are blocked.
- [x] Give two attempts one shared 90-second model deadline and the browser a
  120-second planning deadline; preserve ordinary 20-second Mission saving.
- [x] Request exactly two concise candidates. Require non-null sentence frames
  for all new targets in the model-facing schema, omit derived metadata, and
  constrain generated IDs to the selected set without weakening final validation.
  Bind model-authored `{{target}}` frames to the saved wording, then check every
  frame and supply all safe failure locations to the single repair attempt.
- [x] Pass 226 focused API regressions, 27 Web planning/practice tests, TypeScript
  and changed-frontend-file ESLint. Preserve old optional-frame plans.
- [x] Run a five-target, database-free Ark probe: initial old-contract response
  took 36.88 seconds and failed validation. With the fix, generation plus one
  frame repair passed in 52.71 seconds (26.25 + 26.40 seconds provider time),
  demonstrating why the original shared budget was insufficient. Further checks
  exposed missing slots and rephrased target words. The final placeholder-based
  five-target probe passes in 51.44 seconds (24.75 + 26.65 seconds), with exact
  words and slots validated after expansion. These checks verify transport and
  strict plan validation, not teaching quality.
- [x] Verify the refreshed signed-in browser can generate, persist and open the
  original five-target Mission through Start mission. The final real request
  validates after one repair (25.65 + 28.91 seconds provider time), preserves
  three primary and two opportunity targets, and reaches the ready conversation
  page. Microphone/conversation were not started; no learning-effect claim.

## Doubao text-provider migration — 2026-10-23

- [x] Replace all former DeepSeek text calls with Doubao through Ark, including
  blueprints, selection, Mission planning/help/teaching and assessment.
- [x] Keep Gemini Live independent; store the supplied Ark key only in ignored
  local environment configuration and update worker readiness and diagnostics.
- [x] Verify that the configured `doubao-seed-2-1-lite-260915` returns JSON;
  the Pro model from the supplied example is not activated for this account.
- [x] Real synthetic blueprint streaming and selection analysis pass (27.60 s and
  27.96 s); blueprint emits 16 previews and seven validated corpus items.
- [x] Real teaching analysis returns `ready` on a fresh attempt (6.34 s) after an
  initial transport failure. Assessment returns a schema-valid response that
  compiles to `partial` for the single-turn fixture; complete report verification
  is tracked separately. No learner data or database writes were involved.
- [x] A separate three-turn synthetic assessment returns `ready` with all four
  dimensions scored (21.03 s). This checks transport/schema/evidence processing,
  not human-calibrated scoring quality or learning effects.
- [x] Root lint/build/test pass: 1,589 API, 429 cached Web and 114 cached extension
  tests. Seven stale review-probe credential fixtures failed on the first run;
  after correcting their field names, the full rerun passes. Script compilation
  and `git diff --check` pass. Supplied credentials remain absent from nonignored
  source files; no application deployment or live microphone acceptance is implied.

## Grounded review, linked practice and support history P3/P4 — 2026-10-20

- [x] Add independently validated missed-opportunity suggestions to the existing
  assessment call, keeping suggestions separate from use evidence and scores.
  Preserve v1/v2 jobs; new analysis uses v3 with rubric v2.
- [x] Add owner-bound detail/role-swap practice planning, server-computed changes,
  frozen parent/root/item associations and explicit support on linked creation.
  Preserve committed retries before deleted-source checks.
- [x] Read existing compatible ready reports for factual second-round comparison;
  retain pending, unavailable and incompatible states without inferred zeros.
- [x] Add conservative read-only support history: every primary needs three reliable
  independent Missions, two UTC practice dates and two scene families. Require
  new explicit evidence contracts and dedicated validated positive references.
  Never backfill old sessions or write mastery state.
- [x] Apply `20261020094401_speaking_linked_practice` and
  `20261020094408_speaking_support_history` and
  `20261020094938_speaking_support_evidence_dates` to connected development Supabase.
  Practice-day eligibility uses frozen independent learner utterance times, not
  when an empty Mission or its report was created.
  Both new and the three previous planning/support/feedback SQL rollback suites
  pass locally and hosted; synthetic profile residue is zero. Advisors retain
  one existing security INFO and three unused-index INFO findings, with no
  warning/error results.
- [ ] Finish frontend acceptance and root lint/build/test verification.
- [ ] Record bounded real-provider smoke results and their synthetic-data limits.

## Mission demonstrations and manual support P2 — 2026-10-20

- [x] Add independent `model_frame`, `model_label`, `label_only`, `no_hint` settings. Default new drafts to `model_frame`; retain absent/null legacy settings and exact uncertain-creation payloads.
- [x] Generate and validate server-owned sentence frames, with original expression wording and unfilled slots. Old plans without frames remain readable; unusable new frames use the existing bounded repair.
- [x] Add separate `model_then_transfer` policy and completed-response assessment with exact model/transfer-question quotes. Keep implicit target non-disclosure, observation/cooldown/attempt limits and asynchronous voice behavior.
- [x] Add manual `support.set` with initial version 0, runtime CAS/conflict handling and rejection during active speech, reply/playback or a sent control. Preserve assistance history when changing support.
- [x] Publish verified UTF-16 demonstration spans, hide proactive wording/highlights in `no_hint`, and disable automatic help cards in every explicit mode while preserving requested help.
- [x] Freeze current support/history, immutable attempt support version, demonstration/transfer quotations and possible partial-audio exposure. Stage 4/5 share conservative variant and assistance rules.
- [x] Pass 174 focused planning/loadout/feedback-repository tests. New support and existing planning/feedback SQL rollback contracts pass locally; synthetic support-test records remain absent afterward.
- [x] Apply `20261020090509_speaking_support_and_demonstrations` to connected development Supabase; all three hosted SQL rollback contracts complete without errors.
- [x] Pass root `pnpm lint`, `pnpm build` and the final `pnpm test` rerun: 1,384 API, 423 Web and 114 extension tests. The first API run had one existing Stage 2 lease-heartbeat timing failure; its isolated rerun and the full reruns passed without changing Stage 2.
- [x] Recheck hosted advisors: one pre-existing security INFO for `private.content_payloads` without a policy and three unused-index INFO notices; no warning/error findings.
- [x] Pass existing `mission-plans`/`speaking-help` browser regressions at 1440/390 px and `loadout`/`analytics` at 1440/768/390 px with synthetic identity/API/provider fixtures.
- [x] Fix a real planner validation failure where both attempts only added a final period to an unchanged structure frame. Permit terminal sentence punctuation while still rejecting changed anchors, slots/order and appended content; 89 planning tests pass after this correction. The original provider candidates pass the corrected validator offline without a new paid call.
- [x] Verify the corrected planner with a fresh real DeepSeek request: one model call, 6.75 seconds provider time, no repair required. The hosted chain verifies frames, support/idempotency, versioned transitions and feedback freezing. Initial failure, unchanged-candidate replay and final live run all clean up their synthetic records. Runtime receipts are fixtures; this does not qualify Gemini, actual playback or teaching quality. [Evidence](design/benchmarks/mission-support-20261020/README.md).
- [x] Pass dedicated `speaking-support` browser acceptance at 1440/390 px: default support, cached scene reuse, confirmed four-level changes, verified demonstration spans, no-hint wording removal, skip/undo, requested help and recoverable busy state. Cold no-hint sends no target-visibility receipt. Legacy sessions that opt in record actual visible wording without a mission plan.
- [x] Recheck visibility after dropdown exit animations, preserving occlusion/viewport checks and one receipt per exposure. The legacy opt-in browser passes without extra scrolling or interaction; shared `speaking-help` regressions pass again at 1440/390 px. Desktop/mobile screenshots were inspected.
- [x] Fence late legacy automatic-help writes inside the support CAS boundary. Record conservative contraction/inflection variants in acknowledged assistant text as assistance, including mobile sessions whose target cards were never opened; this does not loosen model-compliance or demonstration-highlighting checks.

Support reduction is learner-controlled. P2 does not infer comfort/focus/stretch,
upgrade mastery automatically, or establish naturalness, transfer quality or
learning gains from fixture checks. The P3/P4 section above records the later rewrites, linked rounds and history-based
support increment.

## Expression-led Mission planning P0/P1 — 2026-10-20

User-approved scope: [selection, scenarios, frozen plans and opportunities](design/docs/STAGE_THREE_FOUR_MISSION_PLAN.md).

- [x] Recover generated-content validation failures once within a shared 45-second model budget, preserving strict final validation, roles and target identity; never repeat provider/network/storage failures automatically.
- [x] Add practical target-selection guidance and distinct recovery actions for system errors versus candidate-specific fit issues. Changes to targets remain explicit and preserve draft/idempotency protections.
- [x] Verify repair limits, safe cross-origin error categories, fit advice, role budgets and desktop/mobile recovery flows.

- [x] Simplify the default to one Start mission action, retaining optional scene comparison, suitable-candidate checks, cached-plan reuse and exact uncertain-creation recovery. Separate preparing/saving progress, block duplicate clicks and reject stale same-owner draft writes inside the browser storage lock.
- [x] Add safe planning failure categories and request-correlated diagnostics for timeout, provider, invalid-output and storage failures. A strict-validation real-provider/Supabase follow-up passes; the original generic user error cannot be retrospectively assigned a cause. The later bounded content-recovery increment above supersedes the initial single-attempt policy; invalid plans and unsupported database changes remain excluded.

- [x] Implement owner-bound plan generation and read APIs, metadata snapshots, strict target validation and atomic planned-session creation.
- [x] Deliver selection-first Loadout, primary/opportunity roles, scenario comparison and recoverable confirmation without losing legacy drafts.
- [x] Add bounded primary opportunity scheduling, actual delivery states, skip/restore and stale-analysis fencing.
- [x] Preserve full assistance/target evidence in Stage 5 and distinguish primary coverage, skipped targets, missing opportunities and optional use.
- [x] Verify API, database rollback contracts and desktop/mobile browser flows. After the content-recovery and selection-guidance follow-up, root `pnpm lint`, `pnpm build` and `pnpm test` pass: 1,284 API and 412 Web tests, plus 114 cached extension tests. One existing Starlette test-client deprecation warning remains.
- [x] Apply `20261020071447_speaking_feedback_opportunities` and `20261020071454_speaking_scenario_plans` to the connected development database. Both SQL transaction/rollback contracts pass locally and on hosted Supabase. Security advisor retains the pre-existing `private.content_payloads` RLS-without-policy INFO; performance advisor reports four unused-index INFO notices, including the new owner index. No warning/error findings were returned; no index was removed based on these notices.
- [x] Run bounded real-provider scenario-generation probes. The initial successful DeepSeek/Supabase run generated three candidates and verified metadata, stable target IDs, stale-plan rejection, idempotent recovery, frozen feedback and cleanup. A follow-up generated two candidates under the expanded three-field disclosure guard and passed the hosted chain. Synthetic identity and runtime events do not qualify Clerk, Gemini, microphones or learning effects. [Failures, correction and successful evidence](design/benchmarks/mission-planning-20261020/README.md).
- [x] Verify the corrective prompt with one real DeepSeek call after a controlled invalid `skip_when` field. The second attempt produced two strictly valid candidates in 9.01 seconds of provider time. This probe created no database records or user Missions and does not reproduce the original failure or establish a recovery rate.

Browser acceptance uses an isolated production build, synthetic identity/API/provider
events and inspected screenshots. `mission-plans.browser.mjs` passes at 1440/390 px,
including failed generation/retry, stale/account fencing, legacy eight-item drafts,
actual opportunity display, skip/restore, separate counts and all-skipped hints.
The one-button follow-up also passes automatic scene preparation, collapsed manual
comparison, cached-plan reuse, no-suitable-scene handling, duplicate clicks, exact
creation recovery after refresh and same-owner cross-tab edits. The legacy Loadout
suite additionally confirms that another account's draft write cannot invalidate
an unchanged in-flight creation response.
The content-recovery follow-up reruns both Mission-plan and legacy Loadout suites:
system failures preserve the complete draft and offer optional guidance; fit advice
uses one candidate's reasons; choosing another candidate clears the previous advice;
explicit demotion/removal changes only the requested target; the last primary and
two-opportunity limits are preserved; edits do not automatically regenerate.
Desktop/mobile system-error and fit-advice screenshots were inspected, with no
horizontal overflow. Uncertain creation still offers recovery of the same Mission.
`analytics.browser.mjs` passes at 1440/768/390 px, with planned reports at 1440/390 px.
Existing Loadout cross-tab/account/retry and Stage 1/2 entry flows pass at all three
widths; legacy conversation and help browsers also pass. The existing port-3000
dev service had static asset 404s, so acceptance ran on port 3005; application
deployment and physical-microphone qualification remain separate.

The P0/P1 verification above predates the separate P2 increment. The later P3/P4 delivery is tracked in the current section at the top of this file.

## Mission teaching control and private diagnostics — 2026-10-18

- [x] Observe finalized learner revisions with frozen context; keep the first two substantive utterances in observation mode and permit explicit help immediately.
- [x] Require a contextual recommendation for automatic teaching; wake dispatch on analysis completion and provider boundaries, preserve eligible candidates across turns, and bind immutable execution attempts separately.
- [x] Provide shared Usage/Example help cards, requested-example generation, unavailable/retry states and visibility acknowledgments; gate automatic direction on completed-response reflection.
- [x] Record analysis/provider results, candidate/attempt outcomes, advisory response assessment, actual presentation and session-scoped assistance; overlap/unknown does not count as independent use.
- [x] Add owner-authenticated diagnostic pagination, separate private storage and bounded best-effort background writes with gap/closure records.
- [x] Apply `20261018111206_speaking_teaching_diagnostics` to hosted Supabase and pass transactional rollback checks. Only the pre-existing `private.content_payloads` informational advisor finding remains.
- [x] Pass focused teaching/help/assessment regressions without paid model calls.
- [x] Complete root lint/build/test: 1,111 API and 390 Web tests pass; 114 extension tests reuse the Turbo cache. One existing Starlette test-client deprecation warning remains.
- [x] Pass `speaking-help.browser.mjs` at 1440/390 px with synthetic auth/API/provider events: usage/example loading, per-level visible ACK, hidden/occluded suppression, stale request fencing, automatic-card retirement and no horizontal overflow; screenshots inspected.
- [x] Pass the existing `speaking.browser.mjs` at 1440/768/390 px, plus background/resume, denied microphone, takeover and deletion cases. Real browser AudioWorklet capture/playback uses synthetic provider/audio fixtures. Update its obsolete deletion URL assertion to accept the current `/loadout` route without requiring a query string.
- [x] Run one real Gemini/DeepSeek/Supabase browser session with synthetic identity/WAV input: seven canonical turns, six voice first replies ahead of analysis, one eligible cross-turn binding, real Usage/Example visibility ACKs and assisted-use attribution. Export 221 diagnostic events with a drained closure and no reported gaps; remove temporary database records. [Full evidence](design/benchmarks/teaching-live-20261018/run-01/README.md).
- [x] Address implicit-teaching answer priming: withhold selected wording from Gemini setup/implicit controls, assign the act to the learner, reject detected wording in recommendations and separate teaching attempts from opening/silence triggers. Post-response target disclosure deterministically fails compliance; otherwise assess the opportunity in the background.
- [x] Remove model character-counting from the normal Stage 4 evidence protocol: derive offsets from unique exact quotes, safely repair unambiguous wrong ranges, require valid ranges for repeated quotes, and log model/derived/repaired provenance. Stored evidence and Stage 5 remain strictly validated.
- [x] Address the live-probe capture backlog: PCM and high-frequency receipts bypass the provider/state lock, completed-playback writes run in the tracked background drain, and shutdown reconciles complete received ACKs. Retain microphone/control ordering, serialized provider sends, frame validation and original rate limits. Eight new mixed-stream/storage/shutdown regressions and 68 existing runtime/Gemini/coaching checks pass.
- [x] Verify the fixes with real providers: run-04 records voice-before-analysis and nine help visibility ACKs without `audio_rate`; ASR fragments leave its strategy coverage incomplete. Controlled run-05 records turn 3→4 eligible binding, learner-directed Gemini wording, passed target non-disclosure, `reflected`, a direction ACK and server-derived `[0,16)` evidence. Preserve its later persistence 503 and absent fifth-reply audio; do not label the whole session successful. Export 109/95 diagnostic events, drained with no reported gaps, and verify temporary-record deletion. [All attempts and per-turn logs](design/benchmarks/teaching-live-20261018/README.md).
- [x] After live sessions close, run final root lint/build/test sequentially: 1,179 API and 390 Web tests pass; 114 extension tests use the cache. One existing Starlette warning remains. Independent read-only review confirms exact quote slicing, actual strategy response/ACKs and the persistence-failure boundary.
- [ ] Qualify and diagnose intermittent persistence failures under live load; run-05's 503 occurred after strategy and quote evidence were committed, before a fifth reply was observed.
- [ ] Qualify physical-microphone timing, automatic-VAD injection races, natural teaching behavior and example quality across more cases. One bounded synthetic-speech live run does not establish latency distributions or learning effects.
- [ ] Schedule the existing server-only global diagnostic purge if a strict physical-retention deadline is required; current reads filter at 30 days and append prunes the same session.

See [the complete behavior and diagnostic contract](design/docs/STAGE_FOUR_TEACHING_CONTROL.md). A diagnostic timeline UI is not part of this delivery.

## Mission startup, silence and audio bursts — 2026-10-18

- [x] Defer opening until microphone mode is acknowledged; preserve text input during pending microphone permission and avoid duplicate openings after recovery.
- [x] Allow bounded PCM catch-up batches using a token bucket while continuing to reject oversized frames and sustained excessive input.
- [x] Add voice-only follow-ups after at least 15 seconds of silence following AI playback, capped at two per silent stretch; preserve speech/generation/playback and ownership fences, without creating learner turns.
- [x] Focused offline tests cover deferred/denied permission, audible opening, recovered sessions, burst limits, playback-aware pacing, prompt cap and end/takeover/delete fences.
- [x] Root lint/build/test pass: 1018 API and 382 Web tests ran successfully; 114 extension tests reused the Turbo cache. The opt-in live smoke now sends the initial microphone acknowledgment; no paid/live smoke was run for this change.
- [ ] Qualify real microphone/network catch-up and provider follow-up timing; synthetic tests do not establish acoustic quality or end-to-end latency.

## Mission speech-onset tuning — 2026-10-18

- [x] Increase Gemini onset confirmation from 100 to 300 ms, retaining low sensitivity, automatic interruption and the existing end-of-speech silence window.
- [x] Root lint/test/build pass; Web/extension tasks reused Turbo caches. Offline checks verify integration compatibility, not real-room false-interruption rates.
- [ ] Qualify short speech, deliberate interruption and background-noise false triggers with a real microphone; no measured improvement is claimed by offline tests.

## Chat empty-message visibility — 2026-10-18

- [x] Hide empty/whitespace saved messages and live fragments in Chat, including noise-triggered voice placeholders; show messages when text arrives and derive empty-state/scroll behavior from visible content.

Validation: root `pnpm lint`, `pnpm test`, and `pnpm build` pass (API/extension tasks reused Turbo caches). This presentation-only change was not tested against a live microphone/provider.

## Mission loading consistency — 2026-10-18

- [x] Replace generic loading cards with the Mission layout: task heading, voice workspace, composer and desktop language sidebar. Reuse page breakpoints and respect reduced motion.

- [x] Remove the leftover Speaking route fallback and unify Mission auth/workspace loading geometry, avoiding sequential skeleton layouts when entering from Loadout.


## Stage 1 video scroll and loading cleanup — 2026-10-18

- [x] Connect native wheel scrolling over the persistent video to the reader's center panel without blocking player controls.
- [x] Remove redundant extracted-expression loading copy while preserving skeletons and error/empty states.
- [x] Synthetic cross-origin iframe checks pass at desktop/mobile widths and with reduced motion: wheel up/down, player clicks, stable iframe and skeleton-only corpus loading. Root lint/build/test pass. Browser checks use synthetic cross-origin player content, not a live YouTube playback qualification.

## Stage 1 progressive reveal — 2026-10-18

- [x] Reveal new content by batch without remounting existing rows or the player.
- [x] Coalesce same-frame previews and cancel queued work on completion, retry or exit.
- [x] Bound animation work for long transcripts; preserve independent skeletons and reduced-motion support.
- [x] Desktop/mobile synthetic-stream browser checks pass, including finalization identity, playback seeking and reduced motion. Root lint/build/test pass (1495 tests). These checks do not establish a real-device frame-rate guarantee.

## Direct Stage 2 entry — 2026-10-17

Verification: root lint/build/test pass (1,495 tests). Fixture browser checks at 1440/390 px cover direct segment entry, first-sentence selection, old preparation-link replacement, Back to picker, preserved player DOM, no microphone request on entry, sign-in, refresh and invalid-link isolation. Real extension capture/provider behavior was not requalified.

Remove the mandatory Ready to practice screen. Confirming a segment enters Shadow directly (Quick by default); unauthenticated learners retain the existing sign-in gate and return target. The picker prefetches the selected segment’s Shadow route/code. Existing `/segments?segmentId=…&step=prepare` links replace into Shadow without a preparation history entry. Content-owned media, reference capture/cache, and account-owned save queues keep their existing ownership. Reference preparation remains available in Detailed; this does not auto-enable capture, playback, microphone or upload consent.

## Stage 2 Quick and Review — 2026-10-17

- [x] Allow Skip while Quick is paused: advance directly to the next sentence, or finish the round at the last sentence. Keep Resume primary and Redo hidden.

- [x] Unify Quick and Detailed primary actions on the shared purple button variant, removing Quick paint overrides and Detailed black recording buttons.

- [x] Hide Quick Redo while paused, leaving Resume as the restart action; preserve Redo availability in all other states and Detailed behavior.

- [x] Quick-only pause/countdown clarification: cancel unfinished audio on Pause, replay the current sentence on Resume, and wait 2 seconds after reference playback before opening the microphone. Preserve completed takes, Done/automatic saves and Detailed. Countdown/cancellation tests and recorder regressions pass (379 Web tests); synthetic browser verification covers prepare/record pauses and unchanged history counts.

- [x] Fix desktop Quick setup clipping: scroll the settings body independently and keep Start in a non-shrinking footer. Review shares the scrollable content boundary; Detailed is unaffected. Verified Start bounds and hit target at 1280×720 and 1024×600, including expanded settings; TypeScript and lint pass. User-reported hydration diff was an injected `data-eusoft-scrollable-element` attribute on the loading skeleton, absent from application markup.

- [x] Fix Review sibling key collision and Detailed desktop grid disruption; place the mode switch in the existing header. Verified 1440px desktop and 543px narrow layouts, real saved Review results without new duplicate-key errors, 376 Web tests, TypeScript and lint.

- [x] Implement the approved Quick/Review prototype and default to Quick; preserve the original Detailed component and style.
- [x] Use original sentence duration × 2 for recording with early Done; expand server decoding and trusted database duration validation. Hosted migration applied.
- [x] Reuse background persistence/analysis, bounded temporary replay, segment history, filters and existing three-layer evidence; allow learner-only analysis without Reference.
- [x] Cover long recordings, queue/filter/status boundaries and save/microphone recovery; verify desktop/mobile presentation with a synthetic browser fixture. Root test/lint/build pass: 1002 API, 376 Web and 114 extension tests. Real microphone/provider accuracy is not established by this fixture.


## Stage 2 practice refactor — 2026-10-12

- [x] Offline Rhythm CWT feasibility experiment (2026-10-16): independently implement continuous prominence from existing 10ms features, save full experimental learner curves, cache exact experimental Reference results, measure first/warm/cached computation, and record uncertainty/feature ablations. Six human clips plus two timing-only repeated-feature loads; 33 focused checks pass. [Report](design/benchmarks/rhythm-cwt-20261016/README.md).
- [ ] Rhythm validation: collect retained same-sentence Reference/Take evidence and independent human prominence annotations. The requested latest Take had no retained recording and cleaned analysis input; paired user accuracy remains untested. Production integration is now tracked separately below; validation against human labels is still outstanding.

- [x] Reduce analysis transport and repeated MFA setup: one learner upload for analysis plus consented retention, verified local worker handoff with durable fallback, bounded cleanup, versioned compiled dictionary reuse and file-change-aware verification. Cover consent, deletion, retention-only retry and cache corruption; benchmark cold and warm runs separately.

- [x] Distinguish saved-reference lookup from upload in the preparation card and recording guide; cover a capture arriving during lookup and desktop/mobile lookup presentation.

- [x] Remove Reference secondary ASR (2026-10-14): source-transcript MFA, explicit evidence basis, preserved audio/alignment checks, compatible pairing/status and independent reference cache version. Learner ASR/60/85 gates and original acquisition remain unchanged. Verification recorded in the refactor contract.

- [x] Correct Reference status copy (2026-10-14): distinguish uploaded/incomplete analysis from missing audio in both status surfaces, show content/alignment reasons, and label retries according to the existing operation. Keep validation and acquisition unchanged. Verification recorded in the refactor contract.

- [x] Add missing-reference guidance before new analyzed recordings (2026-10-14): Prepare reference uses existing acquisition; record buttons and shortcuts wait for upload, permit queued/processing reference analysis, and freeze the exact reference ID. Keep replay and local-only recording independent. No historical attachment/resume or new deletion button. Validation is recorded in the refactor contract.

- [x] Fix local API worker startup (2026-10-14): remove the four-script concurrency cap that prevented the fifth persistent reference worker from starting. A bounded five-script reproduction confirms all five start before any exits with the explicit concurrency setting. Root lint/build/test pass (883 API tests; unchanged Web/extension checks use cache). The missing local reference worker was started and verified claiming queued work; backlog completion and Ready for the selected take are not yet verified. Original reference acquisition is unchanged.

Target contract: [Stage 2 refactor](design/docs/STAGE_TWO_REFACTOR_CONTRACT.md). Execute these steps in order; the original-video reference acquisition module is reused unchanged.

- [x] Step 1: define deterministic word matching, <60% / 60–<85% / >=85% tiers, staged analysis, recognition feedback and text-support snapshots.
- [x] Step 2: implement backend word gate, durable intermediate results and sound-only/full analysis scope; verify the required stage-checkpoint migration locally; applied to the hosted database during step 3.
- [x] Step 3: implement persistence migrations, recognition feedback, text-support metadata and legacy result recovery; apply and verify both migrations on hosted Libitu.
- [x] Step 4: implement separate Listen/Record, concealed prompt/support snapshots, three-tier outcomes, recognition feedback and disabled analysis tabs; retain original reference acquisition.
- [x] Step 5: restore full-content practiced markers from surviving owned records plus pending takes; finish short-sentence navigation, paginated take restoration, stable selection and audio-only/full deletion recovery. The service-only directory RPC is applied to hosted Libitu.
- [ ] Step 6: complete root checks, desktop/mobile regression and implementation documentation.
- Step 1 verification: documentation contracts cross-checked against current schemas, learner worker, ASR and reference ownership. No runtime/API/database changes or runtime test claims.
- Step 2 verification: backend gate and local PostgreSQL queue fixtures pass, including partial mapped comparisons, ASR/checkpoint reuse and service-role permission/fencing checks. Root lint/build/test pass: 856 API tests pass (2 existing optional tests skipped), 338 Web and 114 extension tests pass (unchanged workspace checks use cache). No frontend presentation or reference acquisition change; step 2 itself did not apply hosted changes (applied in step 3).

- Step 3 verification: root lint/build/test pass (877 API pass, 2 existing optional tests skipped; 340 Web and 114 extension pass). Four local SQL fixtures pass under service_role. Hosted migrations `20261012123602_practice_word_gate` and `20261012123612_practice_support_feedback` applied successfully to `ulrdykwhggcaspylines`; columns, invoker/search-path/client privileges and rollback-only synthetic checkpoint/feedback/deletion smoke verified; no synthetic profiles remain. Advisors are unchanged with informational notices only. No application deployment, live model call or new UI acceptance is claimed. Step 4 now collects modern support metadata; old records retain legacy display.

- Step 4 verification: new practice-flow browser fixture and existing MediaRecorder/resource regression pass at 1440/390 px with synthetic microphone audio and fixture identity/player/server results. The new fixture verifies no mic request on Listen, one reference arm retained across sentence changes, text-support start/final peek positions, all three gates, recognition feedback without an override, single player ownership, short-sentence skip and historical result restore. Existing recorder regression verifies replacement/cancellation, late grants, native playback exclusion, visibility/pagehide/refresh and resource release. Screenshots inspected. Root-check final results are recorded in the refactor contract. No original-audio acquisition change, database migration, application deployment or live model/platform accuracy qualification in this step.

- Step 5 verification: root lint/build/test and desktop/mobile practice/history/recording checks are recorded in the refactor contract. `practice_directory_progress.sql` passes locally and against hosted Libitu with 1,100 synthetic sentences inside a rolled-back transaction. Owner/content isolation, duplicate takes, audio-only deletion and final record deletion are verified; no synthetic profiles remain. Original reference acquisition is unchanged; no application deployment. Step 6 remains the final wider regression milestone.

## Stage 2 directory, Ready and centered controls — 2026-10-13

Stage 2 direct component restoration (2026-10-13): at the user’s explicit request, copy SoundComparison.tsx, LayerComparison.tsx (including Rhythm and PitchOverlay), and LayerFocus.tsx verbatim from /Users/river/Documents/Libitu. Their internal presentation now matches that workspace byte for byte; existing shared CSS already matches. Own Sound conceal/reveal state in StageTwoShadowing via the original controlled props, scoped to the selected sentence/take. Keep prototype status badges, recording-state visibility, word gates and source/reference acquisition outside these restored components. Word differences remain in the separate word-check result; unavailable acoustic measurements remain blank in the data adapter, while the original Sound practice-target cues are retained. Verified: restored component files match the source workspace byte for byte; root lint/build/test pass. Desktop/mobile fixture browser regressions pass for Sound/Rhythm/Melody, original reveal controls, reference lifecycle, all word gates, recording-state visibility, history, cancellation and deletion. Browser checks used this worktree on port 3001 because port 3000 is running the main workspace; no user recording or hosted data was changed by these checks.

Stage 2 analysis state clarification (2026-10-13): verified the fetched origin/main at d84bd9d. Keep its internal Sound/Rhythm/Melody layout, diagrams and explanation panel; prototype styling applies only to compact layer status badges. Hide layers before recording, during microphone/encoding work and until the selected take has a durable word check (or completed legacy evidence). Then retain the exact 60/85 gates, show locks, pending ellipses, insufficient/interrupted dashes or colored evidence badges. Sound has no aggregate score: use a completion mark, with an asterisk for matched-only scope; Rhythm/Melody display real experimental similarity scores when present, otherwise a completion mark for available measurements. Existing unpaired learner evidence remains viewable. Deleted/no-analysis takes hide layers; retry/error controls remain available. Source/reference acquisition is unchanged. Verified: root lint/build/test (355 Web tests, API/extension suites) and 1440/390 px fixture browser checks cover hidden/checking/pending states, all three gates, original Sound controls, historical selection, cancelled replacement recording and deleted analysis. Screenshots inspected for desktop Sound and mobile Melody.

Stage 2 analysis appearance restoration (2026-10-13): restore the main-worktree presentation of the three analysis layers: 52 px tabs and the original Sound Shadow mode/Hide text/Reveal all toolbar; status badges follow the prototype as clarified below. Remove refactor-only mobile workspace and unmatched-word box overrides. Keep the 60/85% gates, disabled tabs, exact take/reference mapping and truthful unmatched-word notes. Sound review visibility stays local to the selected take; it does not alter recording support snapshots or the word-check result. Rhythm/Pitch drawing and LayerFocus were not restyled by this refactor. Verified: root lint/build/test and 1440/390 px browser regression, including original tab height, functional Sound Hide text/Reveal all and preserved gate/history behavior.


- [x] Display source text with right-aligned practiced, best reliable word-match and >=85% pass status; hide the directory text during recording by automatically folding the rail.
- [x] Extend progress reads over all surviving takes with keyset-paged count projection; keep owner/content isolation and deletion semantics without new schema.
- [x] Preserve completed Reference Ready over local preview/setup, with prototype green status styling and visible error/deletion states.
- [x] Center media buttons and the waveform separately; restore shared black Record/red Stop roles and media pill geometry.
- [x] Updated desktop/mobile practice regression covers auto-fold, shared paint, centered controls/waveform, best-match restoration, historical selection and highest-analysis deletion fallback. Browser-reference capture/upload/binding/refresh/delete regression passes; root lint/build/test passes (353 Web, 883 API, 114 extension). Hosted read-only REST count projection/join syntax check passes; no database migration or deployment.

## Stage 2 prototype appearance correction — 2026-10-12

- [x] Match the prototype’s expanded sentence list and narrow numbered rail; retain text-free practiced markers, short-sentence rules and keyboard/manual selection.
- [x] Remove “Try another take, or move to the next sentence.”, “Sentence timings are approximate.” and “Listen first, then record your voice.”
- [x] Restyle original-reference preparation as an integrated compact video/status card; retain actual extension setup, prepare/cancel/retry/delete and upload consent.
- [x] Match purple Record/red Stop styling with an elapsed timer and a live microphone waveform sharing the existing recorder stream; close the monitor on cleanup.
- [x] Match the upward Practice settings panel with segmented Speed/Text, loop checkbox and Sentence/Whole segment range; support outside click/Escape and portal selection.
- Verification is recorded in the refactor contract; the original refactor’s step 6 wider acceptance remains separate. No database or application deployment for this visual correction.

## Reference sentence identity — 2026-10-12

- [x] Reproduce saved-capture recovery returning `Sentence not found` when a raw cached caption sentence ID differs from the public derived blueprint view; confirm the mismatch on the reported video with read-only source checks.
- [x] Snapshot the same normalized sentence/segment view for reference recovery, capability and preparation; preserve exact bounds and source/owner validation, without rewriting semantic caches.
- [x] Hide the idle playback instruction when reference recovery or upload has an error; retain the alert and retry action.
- Verification: targeted API tests pass (50). The new regression previously failed with 404; it now covers empty recovery, prepare/recovery reuse, wrong-bound rejection, unknown-sentence rejection and cache immutability. Root lint/build/test pass (820 API, 338 Web, 114 extension; 1,272 total). Production-build `browser-reference-server.browser.mjs` passes at 1440/390 px, including error-state copy, read-only retry before capture, WAV upload, bound learner/reference analysis, refresh recovery and deletion. Auth, playback and server-analysis results are fixtures with synthetic audio. A read-only snapshot against the reported public video now finds its displayed sentence and exact 1,839–10,080 ms range. No live toolbar capture/upload, database write/migration or deployment was performed.

## Original video history — 2026-10-11

- [x] Record authenticated ready-video visits in existing owner-scoped content state, preserving progress and surfacing save failure/retry.
- [x] Add deduplicated Original videos to the personal page and Videos filtering to practice history; include existing owned Shadow/corpus video sources.
- [x] Open every original-video record at its canonical Stage 1 route; preserve account isolation and existing practice counts.
- [x] Complete desktop/mobile browser acceptance and record verification in the profile contract.

## Cross-page loading ownership — 2026-10-11

- [x] Remove the overlapping root and generic Corpus, Loadout and profile route skeletons; keep page-owned auth/data loading states and dedicated practice/speaking boundaries.
- [x] Verify cold Landing, Corpus, profile and Loadout entries show no unrelated generic loading shell; preserve the existing practice cold-entry skeletons.
- Verification: root lint/build/test pass (336 Web tests; other workspaces cached). A local-browser cold-entry check sees no generic loading shell on Landing, Corpus, profile or Loadout; client navigation to profile/Corpus/Loadout likewise shows only page-owned placeholders, and returning to Landing shows its hero without a skeleton. The production-build `workspace-loading.browser.mjs` passes Reader, segments, Shadow and import cold entries at 1440/390 px, including server first frame and delayed content. No backend or extension loading behavior changes.

## Stage 2 sentence-switch audio ownership — 2026-10-11

- [x] Keep the v4 extension session on URL-less `tabs.onUpdated` loading notifications and same-content sentence query changes. Release on verified document replacement or source exit.
- [x] Cover status-only loading in extension unit tests and sentence replacement plus real reload in the unpacked Chrome fixture.
- Verification: root lint/build/test pass (114 extension tests; unchanged API/Web tasks may use cache). The unpacked Chrome fixture retains the armed session after sentence `replaceState` and releases it after reload. That fixture does not invoke the real toolbar/tabCapture grant; live authorized sentence switching still needs manual acceptance after reloading the local extension and page.

## Routing and responsibility migration — 2026-10-10

The [architecture plan](design/docs/ROUTING_AND_RESPONSIBILITY_ARCHITECTURE.md) records target contracts and acceptance scenarios. R0–R5 are implemented; the user rejected compatibility in R3 and required R4 entry changes were included there. Real toolbar capture qualification remains separate.

- [x] Define business identities, routes, navigation/history rules, resource lifetimes, API changes, extension compatibility and rollback boundaries.
- [x] R0: implement shared URL parsing/building, distinct origin/auth return rules and complete Mission/report return links against legacy fixtures. Job-only entries recover their content without demo fallback; mismatched job/blueprint identities fail explicitly.
- [x] R1: add read-only content context and explicit failed-job retry intent; move analysis controls and speaking end/delete orchestration into service use cases with failure/concurrency checks. Add shared Web contracts; adopt them in the workspace controller during R2.
- [x] R2: extract the content controller and stable media host under existing URLs; prove playback, reference buffers, account isolation and root outbox lifetimes.
- [x] R3: directly enable canonical routes and extension v4; remove active legacy entry/protocol branches. Local route/resource and protocol validation recorded below; live toolbar capture still needs manual qualification.
- [x] R4 (folded into R3 by the direct-update instruction): switch link producers, use continuation v2 without v1 migration, launch extension import and reuse canonical content tabs.
- [x] R3 presentation follow-up: reuse the Reader skeleton at the import route boundary and during caption handoff/content resolution; show recoverable errors separately and use a neutral content-layout skeleton. Root lint/build/test pass (five existing lint warnings; 1305 tests, unchanged workspaces may use cache). `content-import.browser.mjs` passes at 1440/390 px with delayed handoff/resolve, reduced motion, no early player creation, failed-request retry and transient URL removal; loading/error screenshots inspected. `canonical-routes.browser.mjs` also passes at both sizes, including cold Shadow/auth, refresh and invalid-link isolation. Fixtures do not qualify live extension/YouTube timing.
- [x] R5: remove the retired v2 capture runtime and Web fallback, legacy entry loader/demo fallback and duplicate view/sentence controls; narrow the content controller to resolved IDs and update active browser fixtures/documentation. Validation is recorded below.

Acceptance: use canonical cold entries, matching import/handoff before media creation, failed-job refresh without retry, explicit generation retries, Shadow auth, browser history, stable media ownership, returnTo round trips, owner isolation, new-document release and obsolete-protocol rejection. Legacy job links and mixed-version compatibility were explicitly removed from scope. Deterministic fixtures do not establish real OAuth or live YouTube acceptance.

R3 verification (direct update, 2026-10-10): root lint/build/test pass (810 API, 362 Web, 133 extension tests; unchanged tasks may use Turbo cache; five existing Web lint warnings). Shared Web/extension JSON fixtures cover canonical content scope, wrong origins/ports/paths and display-only navigation; extension tests verify source API checks, sender/document/nonce isolation, obsolete-version rejection, new-document cleanup and canonical tab reuse after handoff expiry. Browser fixtures against the production build pass:

- `canonical-routes.browser.mjs`, 1440/390 px: direct Shadow auth, signed-in refresh, cold preparation, recoverable content failures on the picker, import with/without v4 handoff, transient input removal, malformed-link request isolation and root-query retirement.
- `content-workspace.browser.mjs`, 1440/390 px: failed-generation retry/recovery, actual back/forward between routes, stable iframe, owner-change microphone cleanup and root outbox completion after Mission navigation.
- `stage-two-navigation.browser.mjs`, 1440/768/390 px: shared iframe across Reader/picker/prepare/Shadow, sentence replacement, copied Mission origin, refresh/stale selections, controls and geometry. Desktop/mobile screenshots inspected.
- `caption-timing-recovery.browser.mjs`, 1440/390 px: paused application, active Shadow snapshot, missing extension, stale responses and nine observer failures; no semantic reanalysis.
- `stage-two-recording.browser.mjs`, 1440/390 px: real local MediaRecorder with synthetic microphone, pending/late grants, navigation/visibility cleanup and replay.
- `stage-two-buffered-reference.browser.mjs`, 1440/390 px: v4 fixture messages, source-owned buffer and local inference; actual AudioContext/AudioWorklet/PCM/WAV excludes pause/rate/generation gaps.
- `apps/extension/tests/workspace-v4.browser.mjs`: real unpacked Chrome scripts and sender metadata reject v2/v3, keep one armed session across content paths, and clear the session on reload. Content API responses are fixtures. Automated toolbar shortcuts did not produce the real Chrome capture grant in either headless or headful runs, so live toolbar/tabCapture qualification remains open. The default browser script explicitly tests only arm/navigation/reload; `LIBITU_V4_CAPTURE=1` requires a real working action gesture and additionally checks oscillator audio capture.

No hosted OAuth, live YouTube, paid provider, database migration or deployment was exercised. R5 has removed the unreachable v2/legacy loaders and reconciled active browser fixtures/documents; historical R0–R3 records describe their respective implementation stages. Web and extension 0.2.0 must update together, with the extension and existing documents reloaded.

R5 validation (2026-10-10): root lint/build/test pass for the cleanup (810 API, 334 Web, 106 extension tests; zero lint warnings). Removed test cases exclusively exercised deleted v2 or obsolete entry behavior; retained SSE, caption, cancellation and identity assertions now call current transport adapters. Production-browser checks pass for canonical routes, import skeleton/error/retry, Mission return links, workspace retry/account/outbox ownership, stage navigation, real MediaRecorder, caption recovery, and buffered local inference/AudioWorklet/PCM/WAV at desktop and 390 px. The final production build also passes invalid-client-URL → Retry (no public request) → Back recovery. Profile/history/continuation and browser-reference server upload/comparison/refresh/delete pass at 1440/390 px. The final Loadout suite passes with its 390 px primary flow plus multi-account, empty-corpus, Reader→Mission and pending Shadow save cases; earlier primary-flow runs also pass at 1440/768 px. Its fixture now uses current select controls/navigation labels and waits for completed guest-draft writes before ordinary login, while explicit pending-write/account-change tests remain intact. Unpacked v4 rejects old versions, retains same-content sessions and releases them on reload; this remains arm/navigation validation, not a real toolbar audio grant. Real unpacked extension entry/handoff/canonical-tab reuse and passive-caption observer browser fixtures pass; their Web/API/YouTube content is synthetic. The extension source verifier now reads `content.content_id`, matching the backend-shared JSON contract rather than the erroneous `content.id` fixture; shared-contract regression and both v4 browser checks pass. Other historical browser entries have been migrated to canonical URLs and syntax-checked; only the explicitly listed suites were run.

R0 verification: root lint/build/test pass (763 API, 345 web, 118 extension tests; unchanged tasks may use Turbo cache; five existing lint warnings). `navigation.browser.mjs` covers report/review/loadout links, refresh/back, retry/adjustment, exact auth return at 1440/390 px, plus job-only recovery, copied links in another tab and duplicate-parameter rejection without analysis requests. `analytics.browser.mjs` passes existing report flows at 1440/768/390 px and queued/partial/failed/insufficient-data states. Its reduced-motion assertion now accepts the existing global 0.01ms duration. Backend services, failed-job retry semantics, media persistence, extension v4 and new routes are not part of R0 acceptance.


R1 verification: root lint/build/test pass (810 API, 348 web, 118 extension tests; unchanged tasks may use Turbo cache). Shared DTO fixtures cover Web/API agreement; API regressions cover public projection, unavailable dependencies, inline/queue modes, retry races, fast second failures, queue-publication gaps, worker terminal-state rechecks and lifecycle failure ordering. `scripts/verify_processing_contract.py` passed 32-way creation/retry checks using isolated local PostgreSQL with a REST test adapter and Redis Lua executed in fakeredis/lupa. These are local storage/contract checks, not a hosted Supabase/Upstash, live-provider or OAuth qualification. No new page flow was activated in R1; the R2 follow-up below connects the Reader and verifies browser loading/history/media behavior. Lint retains five existing Web warnings; API tests retain the existing Starlette deprecation warning. One isolated Web run under concurrent build load hit the existing 20ms polling-test timing assumption; the subsequent full root suite passed, and no analytics behavior was changed in R1.

R2 verification: root lint/build/test pass (810 API, 360 Web, 118 extension tests; unchanged tasks may use Turbo cache; five existing Web lint warnings). Twelve controller tests cover read/ensure/retry intent, lost responses, source/job conflicts, bounded ready/404 reads, caption input reuse and cancellation. Production-build browser fixtures pass:

- `content-workspace.browser.mjs` at 1440/390 px: failed activation has no POST; lost retry uses counts 4 → 4 → 5; real back/forward and account switches release microphone tracks, retain the iframe and avoid public reanalysis; one pending save completes after navigation to Loadout, while the player is destroyed.
- `stage-two-navigation.browser.mjs` at 1440/768/390 px: Reader/picker/preparation/Shadow and sentence/layer changes retain the same iframe, range/speed/loop behavior and responsive geometry; reload and invalid selections recover safely. Desktop/mobile screenshots inspected.
- `caption-timing-recovery.browser.mjs` at 1440/390 px: paused Reader applies recovered timing, active Shadow keeps its old sentence/recorder, missing/stale extension and observer failures remain recoverable without semantic jobs.
- `stage-two-recording.browser.mjs` at 1440/390 px: actual MediaRecorder with a synthetic microphone covers hide/leave, pending permission and late grants, local replay and resource release.
- `stage-two-buffered-reference.browser.mjs` at 1440/390 px: one player and one authorization session across views; analyzed references are reused without new extraction, late extraction cannot change selection, layer changes retain DOM and avoid extra inference. Actual local inference produces both pitch curves; AudioContext → AudioWorklet → PCM → WAV checks pass. Its obsolete acoustic-panel wording assertions now target the existing word-row/pitch-overlay UI; source/cache/media assertions remain in place.

These runs use synthetic YouTube, auth, API and extension messages; they do not qualify live YouTube/OAuth or a deployed extension. No paid provider, database migration or deployment was invoked. Old URLs and local picker/preparation steps remain until R3; root save/upload ownership remains unchanged.

## Import-to-content extension identity correction — 2026-10-10

- [x] Reproduce `Invalid buffered audio request.` with the real unpacked extension after `/practice/import` → `history.replaceState` → canonical content. Chrome preserves the initial content-script `sender.url` while `sender.tab.url` changes; the former equality check rejected this valid flow.
- [x] Validate the sender origin and current tab identity, then verify the current top-level frame's URL, active lifecycle and `documentId` via `webNavigation.getFrame` before arming/probing or reading fresh captions. Replaced documents cannot initiate work. Public content/video verification and toolbar-only capture remain required.
- [x] Root tests: 1,253 pass (810 API, 334 Web, 109 extension; unchanged API task cached); extension lint/build pass. Real unpacked browser fixtures pass import→arm, same-content navigation, release on reload, cold-content re-arm, and passive fresh-caption reads after import navigation. Fixtures preserve real sender metadata but use synthetic content/API responses; no real toolbar audio stream was granted in these runs.

## Simplify Stage 2 skeletons — 2026-10-10

- [x] Keep only broad heading/sidebar/video/analysis regions, with simple selection/preparation blocks. Remove individual sentence rows, imitation controls, nested analysis panels and history placeholders; retain responsive ordering and reduced-motion support.
- Verification: root lint/build/test pass (1,265 tests; unchanged tasks may use cache). Existing `workspace-loading.browser.mjs` passes at 1440/390 px for Reader/segments/Shadow/import, including first frame, delayed content, reduced motion and responsive ordering. Simplified desktop/mobile Shadow screenshots inspected.

## Reference audio setup latency — 2026-10-10

- [x] Make v4 capability ping local; keep passive verified tab registration separate. Use one metadata-only identity read for explicit arm and share concurrent requests from the same owner/session.
- [x] Expose checking → preparing → armed → enabled; prompt the toolbar action only after acknowledgement. Preserve same-document/source ownership and actual toolbar-only authorization.
- [x] Reserve pending ownership before verification; cancel/reload/source/document changes fence late arming, and failed validation never shows ON?.
- Verification: root lint/build/test pass (816 API, 336 Web, 113 extension; 1,265 total). API tests prove one public metadata read, no blueprint/job reads, visibility/source conflict handling and no private fallback. Extension tests cover local ping, pending-arm deduplication, failed validation and cancellation/source/document/reload/tab-close fencing. Real unpacked `workspace-v4.browser.mjs` holds the identity response: ping returns without any fetch, initial arm issues one identity request, ON? appears only after validation, and document/path/reload ownership remains correct; no actual toolbar audio grant was exercised. `reference-setup.browser.mjs` passes delayed acknowledgement, cancel/late reply/retry at 1440/390 px. The existing buffered reference browser suite passes Stage 1 → preparation → Shadow at both sizes with actual local inference and AudioContext/AudioWorklet/PCM/WAV; extension entry/tab reuse and passive fresh-caption browser checks also pass. Synthetic media/auth/content fixtures apply to browser checks; a separate real local identity endpoint read returned 200 with only public metadata. No deployment or migration. Reload the extension and refresh the Web page to use the coordinated update.

## Content route loading boundary correction — 2026-10-10

- [x] Replace the shared layout's hard-coded practice skeleton with a pathname-aware fallback and reuse it at the content route loading boundary. Import→Reader keeps the Reader shell; segments/Shadow keep the practice shell.
- [x] Preserve the shared controller/media owner and the existing extension caption preflight; launch latency work is deferred at the user's request.
- Verification: root lint/build/test pass (810 API, 334 Web, 109 extension; unchanged API/extension test tasks cached). `workspace-loading.browser.mjs` passes at 1440/390 px for Reader, segments, Shadow and import, holding JavaScript before hydration and content/resolve responses afterward; painted skeletons never switch to the wrong stage. `content-import.browser.mjs` passes handoff/resolve, error/retry, reduced-motion and no-media-before-resolution checks. `content-workspace.browser.mjs` passes retry generations, stable iframe across navigation, account/microphone isolation and pending-save completion. Screenshots inspected. These checks use synthetic API/auth/media fixtures; no deployment or extension preflight change.

## Navigation prefetch and Stage 2 loading geometry — 2026-10-10

- [x] Audit internal links and imperative navigation. Add shared intent prefetch while retaining Next viewport behavior; warm Reader → selection → preparation → exact Shadow destinations, plus Shadow code during preparation. Cover known video-form, corpus/loadout, Mission/report and return destinations. Newly created content/session IDs remain dependent on successful business responses.
- [x] Remove the nested content-route loading boundary added in the preceding correction; retain pathname-aware shared-layout cold fallback. Ready Reader stays visible while the next route responds, with the existing iframe retained.
- [x] Replace generic practice placeholders with selection/preparation/Shadow structures, including responsive sentence navigation, media/operations, analysis and history. Preserve decorative-only loading and reduced-motion support.
- Verification: root lint/build/test pass (810 API, 334 Web, 109 extension; unchanged test tasks may use cache). Production-build `navigation-prefetch.browser.mjs` passes at 1440/390 px: requests precede clicks, delayed route responses preserve Reader and its iframe, and prefetch causes no import/session/recording effects. `workspace-loading.browser.mjs` passes Reader/segments/Shadow/import server-first-frame and delayed-content checks at both sizes, including decorative-only skeletons, responsive ordering, reduced motion and no horizontal overflow; screenshots inspected. `navigation.browser.mjs` and `content-workspace.browser.mjs` pass desktop/mobile return/history/auth, retry, persistent-media, account and outbox regressions. `stage-two-navigation.browser.mjs` also passes at 1440/768/390 px for selection/preparation/Shadow, sentence navigation, refresh and stable media. These checks use synthetic API/auth/media fixtures. Extension caption preflight and toolbar grant remain outside this change; no backend or extension behavior changed and no deployment was performed.

## Loading boundary correction — 2026-10-08

- [x] Make the inherited root route fallback stage-neutral instead of rendering ReaderLoadingShell for every destination.
- [x] Initialize valid Shadow deep links from server query parameters and show the practice skeleton through blueprint/auth loading; invalid segment IDs return to the reader.
- [x] Delayed API browser checks confirm no Stage 1 reader skeleton/content during Shadow loading and successful resolution for Shadow, Corpus and profile.

## Page loading skeletons — 2026-10-08

- [x] Replace Stage 2 dynamic-import text with a practice-shaped skeleton.
- [x] Add shared rows/cards skeletons and route loading shells; migrate main page/data fetch placeholders while retaining errors, empty results and operation progress.
- [x] Provide screen-reader loading status, decorative hidden shapes and reduced-motion support.
- Verification: root lint/build/test pass; delayed-response skeleton-to-content and reduced-motion checks pass for Corpus, Loadout, profile/history, Mission and analytics at 1440/390 px. Stage 2 ready-state mobile rendering passes; its dynamic-import fallback is wired to the practice skeleton.

## Stage navigation states — 2026-10-08

- [x] Stage 1/2 use shared secondary Button appearance like Stage 3/Corpus, retaining stage selection colors and existing handlers/disabled conditions.
- [x] Fixture browser checks at 1148/390 px verify matching idle/hover paint, disabled hover stability and persistent selected styling.

## Saved Shadow practice styling — 2026-10-08

- [x] Group saved-take metadata/actions in cards; use small shared buttons and outlined destructive actions, including reference deletion.
- [x] Clip shared button backgrounds inside transparent borders to remove exterior white halos.
- Verification: root lint/build/test pass; desktop/mobile production-preview fixture checks cover small button height, destructive variant/background clipping and save/load/retry/delete flows. Local dev preview was restarted after missing generated vendor chunks.

## Audio save notifications — 2026-10-08

- [x] Use a responsive fixed notification stack with blue processing and warm error states, icons and retry actions.
- [x] Distinguish read-only reference recovery from pending uploads, avoiding false entry notices/unload warnings.
- [x] Regression covers recovery versus upload counts; desktop/mobile fixture browser checks cover empty entry, failure notice, retry, save/history and logout.

## Stage 2 compact audio settings — 2026-10-08

- [x] Give sentence preparation a white outlined secondary button.
- [x] Consolidate three audio preferences and their explanations in a keyboard-accessible disclosure, preserving defaults, handlers and visible processing feedback.
- Verification: root lint/build/test pass (1,192 tests; five existing unused-symbol lint warnings). Fixture browser checks pass at 1440/827/390 px, including keyboard disclosure, unchanged initial checkbox states and no horizontal overflow. Real extension capture/upload is not exercised.

## Stage 1 loading feedback — 2026-10-08

- [x] Add route and region skeletons without delaying streamed content or changing acquisition/playback.
- [x] Preserve errors/retry and Saved states; respect reduced motion.
- Verification: root lint/build/test pass (1,192 tests; five existing lint warnings). Live extension latency and browser visual checks were not performed for this change.

## Stage 1 highlight/card correspondence — 2026-10-08

- [x] Derive highlights from the same merged list as sidebar cards and attach card identities.
- [x] Remove fragment fallback and reject inside-word matches.
- [x] Click a highlight to select the matching category and focus/scroll the corresponding card without seeking.
- Verification: root lint/build/test pass (311 Web tests, five existing lint warnings). Focused browser checks pass at 1440/390 px for saving, reload, deletion, Chunks/Idioms navigation, Saved retention, focused matching cards and unchanged playback position. Exact-source and false-fragment/inside-word regressions pass.

## Stage 1 saved-card highlighting — 2026-10-08

- [x] Include current-source saved items in memoized transcript annotation, updating after save, restoration and removal.
- [x] Add source-wording/metadata regression coverage and desktop/mobile save–reload–remove browser assertions.
- Verification: root lint/build/test pass (five existing unused-variable/import warnings); final Web rerun passes 310 tests. Focused browser save/reload/remove coverage passes at 1440/390 px. The full desktop fixture passes; the full mobile fixture stops at its separate active-logic-node assertion before reaching the new flow. An unrelated analytics polling timing test failed once under concurrent checks and passed on rerun.

## Loadout style follow-up — 2026-10-04

- [x] Keep draft feedback layout stable, use neutral textarea focus and outlined directional links without changing copy.
- [x] Verified unchanged form coordinates/dimensions across select opening, queued selection saves, typing and save completion at 1440/743/390 px. Neutral textarea focus and secondary 40 px return links pass. Root lint (two existing warnings), build and all 1,190 tests pass.

## Caption marker cleanup — 2026-10-04

- [x] Remove bracketed cues and repeated angle markers from new caption processing and cached transcript display.
- [x] Cover cue-only rows, spoken punctuation and multi-segment cues with source word offsets.
- Verification: root lint/build/test pass; final web rerun passes all 309 tests (1,190 total across API/web/extension). Lint retains two existing reader unused-import warnings. Cached-display regression covers split cue parts, sentence identity/time and withholding stale word indices.

## Select and directional controls — 2026-10-04

- [x] Migrate native selects, refine menu/trigger appearance and preserve the empty All sources choice.
- [x] Remove reader bottom gap and standardize directional action dimensions.
- [x] Nine screens pass at 1440/390 px; reader/shadow/loadout also pass at 743 px. Verified select keyboard/open/choose/Escape behavior, source reset, sorting, borderless options, bottom-edge geometry and 40 px directional buttons with 16 px icons/8 px gaps. Root lint (two existing unused-import warnings), build and all 1,186 tests pass.

## Shared application header — 2026-10-04

- [x] Unify main application headers and account actions; preserve mission controls.
- [x] Six application screens pass header alignment/navigation checks at 1440 and 390 px; Corpus/Profile also pass at 743 px. Root lint (two existing reader unused-import warnings), build and all 1,186 tests pass. Browser verification uses fixture identity/data.

## White page canvas — 2026-10-04

- [x] Make global and framed-page outer backgrounds white; preserve inner surfaces and spacing.
- [x] Extend the reader Stage 2 entry bar across the viewport without horizontal outer gutters.
- [x] Root lint/build and all 1,186 tests pass. Nine screens pass white-canvas and responsive checks at 1440/390 px; the reader footer reaches both viewport edges at 1440/743/390 px without horizontal overflow.

## Reader browser annotations — 2026-10-04

- [x] Match Corpus to stage navigation and make reference-audio activation clearly actionable.
- [x] Remove the reader reference frame, apply responsive outer gutters without a page border, balance the footer and standardize the saved-language button.
- [x] Shorten transcript labels to minute:second without changing playback precision; reserve timestamp/text spacing.
- [x] Verify the seven adjustments at 743, 390 and 1440 px with fixture rendering and measured spacing; timestamp regression, root lint/build and all 1,186 tests pass.

## Typography and control consistency — 2026-10-04

- [x] Load local Inter normal/italic variable fonts with license, swap and fallback support.
- [x] Share text-field/native/Radix select appearance while retaining existing geometry and semantics.
- [x] Consolidate generic purple selection tokens without replacing learning colors.
- [x] Add auxiliary pending-action feedback and remove redundant button-only paint.
- [x] Root lint/build and 1,185 tests pass; nine screens pass desktop/mobile actual-font, local-font-request and layout checks (18 combinations). Field validation/search/edit/native-select interactions pass.
- Verification and usage: [visual system](design/docs/VISUAL_SYSTEM.md).

## Shared button system — 2026-10-04

- [x] Introduce shared action variants and real-link navigation; preserve purple branding and existing dimensions.
- [x] Migrate web actions, retain separate selection controls, and share focus/pressed/disabled/reduced-motion states.
- [x] Add stable loading progress to key asynchronous submissions.
- [x] Root lint/build and 1,185 tests pass.
- [x] Desktop/mobile fixture acceptance at 1440/390 px: submit/link semantics, hover/focus, stable loading size, duplicate prevention, reduced motion, deletion confirmation and recording colors.
- Browser acceptance and usage: [button system](design/docs/BUTTON_SYSTEM.md).

## Visual consistency pass — 2026-10-03

- [x] Share the landing wordmark across existing web brand links, including mission/report gates.
- [x] Preserve purple primary buttons, semantic learning colors and existing layouts.
- [x] Consolidate warm surfaces, radii, elevation, focus and disabled appearance; respect reduced motion.
- [x] Root lint/build and 1,185 existing tests pass. Desktop/mobile fixture checks cover Landing, Blueprint, Shadow, Loadout, Speaking, Analytics, Corpus, Profile and History; the corpus interaction suite and profile regression assertions pass. Test-only local request forwarding avoids Clerk development-handshake redirects; no production authentication behavior changed.

## Landing page — implemented locally 2026-10-03

- [x] Implement the supplied prototype's visual direction as new React components and scoped CSS, without reusing prototype source.
- [x] Keep a source-free root as the landing page and preserve existing Stage 1 source/content/job/handoff links.
- [x] Validate and normalize pasted YouTube URLs; use the existing analysis lifecycle and omit unknown video titles/language.
- [x] Reuse real Clerk login/register/account controls and forced return URLs; retain same-tab video drafts through refresh/auth.
- [x] Verify responsive layout, keyboard/error states, real login/register modal switching and fixture-backed Stage 1 entry/reload.
- [x] Make Stage 1 anonymous access explicit and restore the prominent centered “or / Add to Chrome” entry from the prototype.
- [ ] Complete a real account login/OAuth round trip and authenticated account-menu acceptance.
- [ ] Configure the published Chrome Web Store listing when available; current page shows extension guidance.

Verification: root lint/build/test passed (761 API + 306 web + 118 extension tests; unchanged tasks may use Turbo cache). Six new entry regressions cover routing, URL normalization/rejection, external-store validation and resolve/job/blueprint integration. Browser checks cover 320/390/768/1440 px without horizontal overflow, actual Clerk forms, draft refresh, inline errors/Enter, footer focus, fixture-backed ready content and durable reload. Provider analysis and completed OAuth are not claimed. See [details](design/docs/LANDING_IMPLEMENTATION.md).

## Corpus library — implemented locally 2026-10-02

- [x] Add `/corpus`, real cross-source browsing, search, combined filters, sorting and grid/list views.
- [x] Persist guest/account edits with stable record keys; retain original source analysis and past session snapshots.
- [x] Add separate detail, selection, edit and confirmed delete actions, plus visible storage/network failures.
- [x] Merge selections into the latest account-bound Loadout draft atomically; preserve settings, reject overflow and uncertain session submissions.
- [x] Link the library from input, Loadout and the personal learning center.
- [ ] Separately implement Decks, evidence-based corpus usage aggregation and server-side list pagination.

Verification: root lint/tests, final production build and 18 focused corpus/storage regressions passed; full browser acceptance passed at 1440/390 px, covering selection, detail, edit/reload, failed PATCH retry, delete/reload, Loadout handoff and account isolation. Browser identity/API data were synthetic. A real owner-scoped Supabase read-only smoke passed. See [scope and verification](design/docs/CORPUS_LIBRARY_IMPLEMENTATION.md). Review scheduling remains excluded from MVP.

## Personal learning center — 2026-10-02

- [x] Add `/profile`, signed-in navigation, Clerk identity, responsive prototype-based layout and explicit signed-out/loading/error/empty states.
- [x] Aggregate real owner-scoped Shadow takes, participated Missions, saved corpus, recording duration, local-calendar streaks and 28-day/90-day/monthly activity.
- [x] Add unified paginated history, recoverable Mission links, safe source links and account-bound device-local learning continuation.
- [x] Design the simple history page with profile entry points, local-date groups, per-record time/status and server-side All / Shadowing / Missions filters before pagination; reset and fence pending reads on filter changes.
- [x] Keep ability dimensions unassessed and distinguish surviving saved-item additions from a permanent activity event log.
- [x] Integrate compatible Stage 5 reports as a separate latest-Mission summary and history report links; preserve null/zero, report lifecycle, version checks and read-only profile behavior.
- [x] Complete root checks and desktop/mobile browser acceptance for this increment.
- [ ] Separately implement validated ability assessment/trends, persistent learning goals, Decks/usage aggregation and cross-device reader position.

See [implementation and test boundaries](design/docs/PROFILE_IMPLEMENTATION.md).

Verification: root lint, production build and tests passed (617 API + 276 web + 112 extension = 1005 tests). All six profile browser acceptance groups passed at 1440/390 px: range/metric changes, accessible tables, keyboard dimensions, safe source navigation, missing-source abstention, history pagination/retry, empty/error/unknown-date states, delayed-response account isolation and signed-out return URLs. Eight screenshots were inspected. A read-only Supabase smoke verified the real projections with a nonexistent owner; a live unauthenticated request returned 401. Browser identity/API responses are synthetic fixtures, not real OAuth or production performance qualification.

Stage 5/profile integration (2026-10-02): production build passed using an isolated source snapshot to avoid concurrent build output collisions; root lint and 1,161 tests passed (755 API, 294 web, 112 extension). New feedback summary/state/legacy/ownership browser checks, all six existing profile groups, Analytics at three widths and the complete learner journey passed. The real profile-to-feedback join was checked read-only; the existing migration was not reapplied. The local feedback worker was started after confirming no backlog or queued jobs. No new paid-model verification was run.

## Stage 5 evidence-backed report — implemented locally 2026-10-01

The user accepted the [four-dimension report contract](design/docs/STAGE_FIVE_CONTRACT.md).

- [x] Freeze nullable scores, rubric, transfer denominator, final-user references and report lifecycle.
- [x] Persist immutable assessment input and leased, bounded report jobs with recovery and deletion fencing.
- [x] Evaluate the full final transcript with validated quotations and deterministic score aggregation.
- [x] Deliver responsive Analytics, source evidence, real suggestion saves and retry/adjust mission actions.
- [x] Verify API/worker/database and browser end → report → review/retry recovery; distinguish fixture identity from real OAuth.
- [ ] Independently calibrate model judgments with human-reviewed conversations before claiming assessment accuracy.

Verification: root lint/build/test passed (711 API + 282 web + 112 extension = 1,105 passing tests; two optional acoustic tests skipped). The feedback migration and real Supabase rollback tests passed. A real bounded DeepSeek assessment produced all four dimensions with 18/18 exact quotations validated; synthetic records were removed. Analytics and Stage 4 browser checks passed at 1440/768/390 px. See the linked contract for provider, fixture-identity and human-calibration boundaries.

## Stage 4 real-time conversation — implemented locally 2026-10-01

[Current implementation and verification](design/docs/STAGE_FOUR_IMPLEMENTATION.md) supersede the earlier proposal. The user selected Gemini Live for the current provider.

- [x] S4-00: Validate real Gemini Live text/audio and freeze normalized runtime/message/evidence contracts.
- [x] S4-F1/F2: Shared Voice/Chat workspace, continuous media controller, responsive controls and reduced motion.
- [x] S4-B1/B2: Durable versioned session documents, owner/lease fencing, real provider and role prompt.
- [x] S4-F3/B3: Text with voice, VAD/transcript boundaries, interrupt, manual reconnect, refresh recovery and explicit takeover.
- [x] S4-F4/B4: Traceable language observations, bounded hints and next-response policy, end/read-only review/delete. Provider transcript revisions are supported; manual editing and automatic logic-stage detection are not delivered.
- [x] S4-Q1-local: Root checks; real Gemini/DeepSeek/Supabase synthetic text and voice smoke; responsive Chrome capture/playback and complete Loadout/Shadow regression.
- [ ] S4-Q1-release: Physical-device/network/latency/cost qualification, complete live post-interruption turn acceptance, account-wide budgets, production supervision and real OAuth end-to-end acceptance.
- [ ] S4-follow-up: User transcript correction and evidence re-evaluation, if included in the next increment.

Verification: root lint/build/test passed (603 API + 267 web + 112 extension = 982 tests). Real Gemini interruption was observed; the bounded interruption probe did not verify the subsequent complete user/reply turn. See the implementation document for browser/provider test boundaries.

Stage 5 final assessment is delivered in the increment above. Stage 4 observations remain separate from its final report; no mastery score is fabricated.

## Sound prototype and workspace-order correction — 2026-09-29

- [x] Keep video and practice controls above the three-layer workspace.
- [x] Restore the ten Sound phenomenon filters, exact-occurrence inline badges/linking arcs, dictionary IPA on hover/focus and the color legend.
- [x] Preserve Reference / Your voice, measured vowel/boundary-pause data, tab state and hide/individual reveal.
- [x] Distinguish conditional rule targets and unavailable detectors from measured audio evidence.
- [x] Verify desktop/mobile interaction, exact-token safeguards and root quality checks.

Verification: root lint/build/test passed (240 web + 453 API + 112 extension = 805 tests). Registered-reference and browser-capture suites passed at 1440/390 px; Sound screenshots were inspected. Checks cover video-before-layers order, all phenomenon filters, exact highlighted word ranges, inline/link marks, unknown detectors, tab persistence, conceal/reveal/IPA, saved and learner-only evidence, and unchanged capture/server analysis and history recovery. Browser fixtures exercise display/state, not detector accuracy.

## Browser reference server analysis and compact workspace — 2026-09-29

- [x] Accept source-bound browser WAV references without an operator file grant; preserve private ownership, consent, retry and deletion.
- [x] Independently verify reference content, cache word prosody, bind each learner take and wait without exhausting retries.
- [x] Unify Sound/Rhythm to Reference / Your voice rows and Melody to normalized dual curves with word-linked pointer, keyboard and playback highlights.
- [x] Keep local acoustic previews; stop automatically loading the local alignment model.
- [x] Apply and verify the queue migration; document the superseded local-only default.
- [x] Complete final root, real-model/storage and desktop/mobile acceptance for this increment.

Verification: root lint/build/test passed (238 web + 453 API + 112 extension = 803 tests). Capture-server and registered-reference desktop/mobile regressions passed at 1440 and 390 px; screenshots were inspected. Local PostgreSQL queue/lease/ownership/deletion/wait tests passed, and the wait migration is applied. Actual synthetic speech ran through real reference ASR/MFA/VAD/F0, cached pairing, learner analysis, mismatch abstention, private Supabase storage, cleanup and deletion without a file-source grant. All synthetic rows/assets were removed. This does not establish live YouTube capture or acoustic detector accuracy.

See [implementation and test boundaries](design/docs/STAGE_TWO_BROWSER_REFERENCE_SERVER.md). The following September 26 section records the earlier local-only implementation; it is no longer the default flow.

## Browser reference word/phoneme alignment — 2026-09-26

- [x] Preserve capture identity and bind local VAD/F0 and alignment to one bounded raw clip and exact source sentence.
- [x] Publish basic measurements independently; retain bounded alignment retry and fence cancellation/late results.
- [x] Connect reference-only and local-reference/saved-learner word displays without requiring a registered server file source.
- [x] Verify the pinned browser phoneme model on actual audio input, privacy boundary, desktop/mobile interactions and root checks.

This follows the user's choice to align browser-captured references locally. Audio is not uploaded for this operation; only a source-bound dictionary request and static model downloads are needed. Alignment is conditioned on caption/lexicon targets, not independent content or pronunciation verification. Cross-engine scores and unvalidated sound detectors stay unavailable. See [implementation and verification](design/docs/STAGE_TWO_LOCAL_ALIGNMENT.md).

Verification completed 2026-09-26: root lint/build/test passed (230 web + 447 API + 112 extension = 789 tests; unchanged API/extension tasks reused caches). Actual Chrome Silero/Pitchy/Charsiu inference on synthetic speech passed at 1440 and 390 px, including nine reference words/30 phone intervals, reference-only display, compatible saved learner pairing, all three layers, cache reuse, sentence isolation and no reference upload. The existing file-reference desktop/mobile regression also passed. Screenshots were inspected. Player, extension transport, identity and saved learner analysis were fixtures; these checks do not establish live YouTube capture, physical-phone performance or human alignment accuracy. Separate real-model smoke checks covered repeated words, dictionary alternatives, silence abstention and 19.159-second input. An unrelated transcript still obtained a forced path, confirming why local content remains explicitly unverified.

## Stage 2 result recovery and partial evidence — 2026-09-24

- [x] Read saved analyses independently of the choice to upload/analyze future recordings.
- [x] Restore the latest take on initial entry and sentence changes; preserve manual selection through history refreshes and late saves.
- [x] Select new recordings by their exact acknowledged take ID and refresh a selected same-ID take when its save version changes.
- [x] Show learner-only Sound vowel-duration and boundary-pause measurements while leaving comparison scores empty.
- [x] Make REF/YOU evidence explicit across Sound/Rhythm/Melody for file reference plus local learner audio; label normalized Melody curves as not aligned word by word.
- [x] Complete regression, desktop/mobile browser and root lint/build/test acceptance for this increment.

Verification: root lint/build/test passed (447 API + 197 web + 112 extension = 756 tests; API/extension reused unchanged task caches). Desktop/mobile browser regressions passed for result recovery with consent off, same-ID invalidation, cancellation/manual-selection preservation, learner-only measurements, sentence isolation, content mismatch, deletion, existing Sound controls and persistence. Synthetic speech through Chrome microphone encoding and actual local Silero/Pitchy inference verified both local learner and file-reference displays before server completion; desktop/mobile screenshots were inspected. Server results/auth were fixtures, not new hosted or detector-accuracy checks. This increment changes result recovery and evidence display; it adds no acoustic detector, scoring formula or upload authorization. See [scope and evidence boundaries](design/docs/STAGE_TWO_SOUND_COMPARISON.md).

## Stage 2 paired layers and first Sound measurements — 2026-09-23

- [x] Match the prototype's paired text rows and per-layer feedback using one selected saved take.
- [x] Persist aligned phone timing and known/unknown boundary pauses in versioned results.
- [x] Add vowel timing and candidate linking-boundary timing comparisons, with experimental resemblance scores and coverage.
- [x] Add experimental Rhythm/Melody resemblance; retain solid dictionary stress dots and textual pause markers.
- [x] Keep unsupported realization checks unscored, old results readable and revoked-reference assessments hidden.
- [x] Verify real ASR/MFA, hosted result persistence/revocation/cleanup and desktop/mobile browser interactions.
- [ ] Validate actual weak-form, flap, elision, assimilation, glottal, Drop-D, H-dropping and voicing detectors against independent labels before releasing realization verdicts.

Verification: root lint/build/test passed (447 API + 197 web + 112 extension = 756 tests), paired-comparison and existing Sound-guide desktop/mobile browser suites passed, and hosted synthetic test rows/objects are zero after cleanup. See [scope and score definitions](design/docs/STAGE_TWO_SOUND_COMPARISON.md). This increment does not complete all M4b detectors.

## Stage 2 learner analysis — 2026-09-22

- [x] Separate remembered analysis opt-in from long-term recording retention; freeze purpose/sentence/reference at recording start.
- [x] Add private temporary uploads and persistent queue, leases, status/retry/cancel/delete APIs and cleanup reconciliation.
- [x] Gate MFA on independent ASR content matching; save reviewable mismatch/uncertain outcomes without invented alignment.
- [x] Add saved Rhythm/Melody word comparisons and history recovery, keeping measurements separate from scores.
- [x] Apply migration to the connected Supabase project; exercise actual PostgreSQL claim/reclaim/fencing/deletion and run API/web/worker tests.
- [x] Verify desktop/mobile recording, asynchronous completion, sentence isolation, refresh, mismatch and deletion with browser fixtures; inspect the mobile word display.
- [x] Verify actual ASR/MFA on licensed speech and the complete hosted round trip with synthesized speech, including both matched and mismatched content; remove fixture rows/objects.
- [ ] Provision production worker supervision/monitoring and evaluate real accents/alignments against independent human labels before any accuracy or assessment claim.

See [implemented pipeline and operational limits](design/docs/STAGE_TWO_PRACTICE_ANALYSIS.md). Browser fixtures use mocked API recognition results and do not replace actual acoustic checks.

Verification completed 2026-09-23: root lint/build/test passed (432 API + 197 web + 112 extension = 741 tests), and the final API/worker subset passed 24 tests. Both desktop/mobile browser suites passed for new analysis and existing recording history. Actual small.en → MFA → VAD/Praat processing matched and aligned all five words of the licensed CMU ARCTIC sentence “Will we ever forget it”; no human boundary-accuracy claim follows. The hosted synthetic-speech smoke passed real upload, independent recognition/alignment for both voices, saved paired results, mismatched-content abstention, ownership, revoked-reference masking, cleanup and deletion. Earlier runs encountered transient transport interruptions and a lost lease; the final bounded retry/recovery verification passed. PostgreSQL claim/reclaim/stale-write/cancel/delete tests passed; the disposable local database was stopped. Migration is applied; the private 8 MiB bucket and restricted grants were checked. Supabase advisors reported no warning/error, only pre-existing informational policy/index notices.

The pinned ASR revision and model content hash are verified and configured in the ignored local API environment. This establishes local functionality, not production worker hosting, live Clerk OAuth or calibrated pronunciation accuracy. Temporary input cleanup depends on an operational worker/storage service.


## Stage 2 server reference increment — 2026-09-22

- [x] Make Rhythm readable against sentence text: dictionary syllable-stress dots, phrase/pause bars and measured durations on both reference paths; expose approximate caption positions and retain unplaceable/learner pauses as audio times. Actual sentence-emphasis detection remains separate.
- [x] Simplify Rhythm styling per follow-up: three solid amber stress-dot sizes/shades, no gray/hollow dot category, compact prototype-style pause rows, and removal of the duplicate speech/pause chart.
- [x] Implement the confirmed A–D reference foundation: operator-owned source grants, private normalized assets, durable PostgreSQL queue/leases, full-sentence MFA adapter, VAD/F0/energy/duration measurements, authenticated result recovery and conditional three-layer file playback.
- [x] Verify real PostgreSQL lease/cancellation/deletion semantics, synthetic hosted storage round trip, desktop/mobile file playback/SSE recovery and existing practice persistence compatibility. Run actual VAD/F0 on 16 licensed clips and MFA on two nonzero-origin sentence cases; do not equate these with human-gold accuracy.
- [ ] Register actual permitted product sources and provision a production acoustic worker host; ordinary YouTube file acquisition is not enabled by this increment.
- [ ] Independently annotate/evaluate alignment and sound detectors before user pronunciation comparison or scores (E remains separate).

See [implementation, setup and verification](design/docs/STAGE_TWO_SERVER_REFERENCE.md). No placeholder comparison endpoint or completed detector claim.

Rhythm display verification: eight mapping/stress regressions cover clock origins, unknown/variant dictionary stress, wrong sentence/labels, sparse/non-monotonic caption timing, ambiguous pauses and quality gates. File-reference desktop/mobile browser checks cover text markers, sentence switching and shared dictionary loading. Local desktop/mobile checks exercise actual Silero/Pitchy inference, microphone replay and preserved layers; the real AudioWorklet/PCM/WAV regression passes. Synthetic fixtures verify rendering and timing plumbing, not linguistic accuracy.

## Shadow login and persistence (2026-09-19)

- [x] Gate Start shadowing, direct Stage 2 links and refresh on loaded Clerk identity; retain source, segment, sentence, settings and fragment through sign-in/sign-up.
- [x] Add owner-scoped durable attempts with idempotent create, source validation, paged history and deletion.
- [x] Add consented private learner recording upload, authenticated playback, byte/hash/container checks and recording-only deletion.
- [x] Save completed takes automatically with an optional retention checkbox and an account-bound bounded retry queue above stage navigation.
- [x] Apply the Supabase table/private bucket migration and verify real synthetic audio create/upload/read/retry/owner isolation/delete; remove synthetic fixtures.
- [x] Add API and web tests covering auth, consent, owner separation, retries, limits and deletion races.
- [x] Verify desktop/mobile login gating, return URL, save/retry across sentences, history after refresh, playback coordination and deletion with synthetic browser fixtures; inspect history screenshots.
- [ ] Verify hosted Clerk sign-in/registration completion with real credentials; test resource emitters are not real OAuth verification.
- [ ] Add durable offline pending-data recovery; cloud analysis and persisted descriptive evidence are now delivered by the 2026-09-22 increment above.
- [ ] Add scheduled interrupted-upload/deletion reconciliation, tombstone/backup retention, export and account-closure handling before production.

See [persistence contract](design/docs/STAGE_TWO_PERSISTENCE.md). This advances basic private attempt/history storage ahead of file references without completing the rest of F4.

Validation: root lint/build/test passed (393 API, 184 web and 112 extension tests). Supabase verification confirmed a private 8 MiB bucket, enabled table RLS and no remaining synthetic fixtures; security advisors returned no warning/error for the new objects. Browser fixture identity is intentionally separate from real Clerk/OAuth verification.

Existing Stage 2/caption browser suites now use a shared signed-in fixture and record-only API stubs. The navigation suite passed at 1440, 768 and 390 px; its loop assertion waits for the actual seek event rather than assuming a fixed browser-timer delay.

## Active Stage 2 architecture follow-up: file references

### Offline acoustic benchmark foundation (2026-09-13)

- [x] Define strict versioned offline sample/result contracts, independent evidence gates, provenance, units, uncertainty and synthetic/human separation; export JSON Schemas.
- [x] Acquire and checksum 16 licensed public adult speech clips (8 reference / 8 learner, 4 speakers, 49.107 seconds), retain source/permission records and a bounded reproducible downloader.
- [x] Add offline WAV integrity, speaker/source/recording split validation, exact result binding and target-level measurement/classification reports with missing-prediction denominators.
- [x] Add double-review/adjudication instructions and a separate, unexecuted 256-recording collection plan; leave all 64 seed annotation tasks pending.
- [ ] Expand the real corpus toward the proposed 200–300 recordings and complete independent human target selection, annotation and adjudication; freeze a versioned benchmark.
- [ ] Add a sufficiently sized speaker/source-disjoint test set, annotation agreement and confidence intervals; establish detector release thresholds.
- [ ] Connect a real offline alignment/feature engine and evaluate its output; this tool does not invoke MFA, ASR or acoustic detectors.

See [the executable benchmark](apps/api/benchmarks/acoustics/v1/README.md). Public source transcripts are unverified, existing source pronunciation scores are not imported as phenomenon labels, and the two source corpora have no paired reference/user text. Schema/synthetic regression success is not speech accuracy. Online file-reference F1–F4 and M4b remain pending.

Verification: all 16 original WAVs passed checksum, format and payload checks. The unrun result template and evaluation command reported 64 `not_evaluated` targets, zero eligible annotations and `release_ready=false`. The 115 new offline contract/integrity/metric regressions passed; root `pnpm lint`, `pnpm build`, and `pnpm test` passed with 382 API, 179 web and 110 extension tests (671 total). The API suite emitted an upstream Starlette/httpx deprecation warning. No paid provider, detector inference or learner UI test was needed for this offline-only increment; schema regeneration is checked against the committed exports.

### Stage 1 buffered-reference increment (2026-09-13)

- [x] Review `toneflow_audio_acquisition_flow.html` against the current JSON3 contract and actual Chrome/MFA capabilities; document unsupported claims and open questions.
- [x] Implement an explicitly enabled v3 source session across Stage 1, picker, preparation and Shadow; keep v2/v3 media ownership mutually exclusive.
- [x] Keep bounded PCM and actual audio/video-time coverage, rejecting seek/pause/buffer/rate/generation gaps and stale/evicted data; extract a real WAV from one complete run.
- [x] Show separate text, reference coverage and analysis readiness; prepare missing ranges through visible, cancellable 1× listening, while retaining basic practice access.
- [x] Reuse bounded reference analysis across stages and demand current/next sentences without whole-video preprocessing or invented Sound results.
- [ ] Verify actual Chrome toolbar authorization and target YouTube audio/boundary quality; synthetic browser playback cannot establish this.
- [ ] Resolve source permission for cloud upload/sharing, then implement the media API/storage/worker path and separately validated alignment/detectors. No such API was added in this local increment.

See [implementation and review](design/docs/STAGE_ONE_BUFFERED_REFERENCE.md). Product decisions now accept one explicit Chrome toolbar grant per same-document, same-source practice session and authenticated learner-data persistence. Third-party YouTube reference media may enter the server path only when the source rights permit it; the implemented local path still requires explicit activation and uploads no media.

Verification: root `pnpm lint`, `pnpm build`, and `pnpm test` passed, with 267
API, 175 web and 84 extension tests (526 total). The v3 browser suite passed
at 1440/390 px, including actual Silero/Pitchy inference, microphone recording
and replay, dual-speaker Rhythm/Melody, Sound abstention, shared analysis,
cross-stage session reuse, explicit missing-range preparation and no uploads.
A separate real AudioContext → AudioWorklet → PCM → WAV check passed with a
synthetic source, including pause/rate rejection and generation-gap handling.
Navigation passed at 1440/768/390 px; caption-timing availability states passed
at 1440/390 px. The dedicated Sound suite also passed at 1440/390 px, including
source selection, dictionary states, retry/cancellation, caching, keyboard
navigation and overflow. Earlier browser navigation attempts timed out; the
local development server was found unavailable during diagnosis. After
restarting it, the unchanged navigation timeout and functional assertions
passed. Failure-only request diagnostics were added without assuming all earlier
timeouts had the same cause. Updated preparation and Shadow screenshots were inspected.
The browser suites intercept player/API/extension boundaries; these checks do
not establish live YouTube capture or acoustic timestamp accuracy.

### Caption-first increment (2026-09-13)

Passive-player-response follow-up:

- [x] Replace independent `baseUrl + fmt=json3` fetching with a static `document_start` MAIN observer for the player's own fetch/XHR JSON3 responses, without exporting credentials or replaying requests.
- [x] Preserve bounded, source-bound handoff/recovery and distinguish observer missing, no observed response, network/empty/invalid/oversized response, response-read timeout and extension communication failure.
- [x] Complete observer/bridge regression and real-unpacked-extension fixture verification; record exact results below.
- [ ] Reload the updated extension and source page, then verify actual target-video JSON3 recovery and usable highlighting. Fixture success is not live YouTube validation.

The learner's `g2A6-5_EY7w` player request returned HTTP 200 JSON (53,031 compressed bytes) and the learner confirmed `tOffsetMs`. Read-only browser resource inspection found a matching base-parameter fetch without the player's added `pot`/client parameters. This establishes a working player source and a request-context mismatch, not a controlled proof that any single omitted parameter caused the other request to fail. The new path consumes player responses instead of guessing that context.

Passive-observer verification: root lint and production build passed; a forced, uncached full test rerun passed 556 tests (267 API, 179 web, 110 extension), including 23 observer cases. Actual unpacked-extension tests against intercepted fixtures passed with a background source tab, fetch/XHR text/JSON bodies preserved, home-to-watch navigation, late installation, stale responses, TTL and old-handoff independence. All eight subtitle requests across two isolated profiles came from explicit player-fixture requests; cache reads added none. The browser test exposed background-page timer throttling, so the reader now takes one immediate snapshot instead of polling. Web recovery checks passed eight desktop/mobile scenarios, including nine safe status messages at both widths; screenshots were inspected. These checks do not establish live YouTube recovery, and no live API/database/media request was made by the browser fixtures.

- [x] Capture the current video's bounded, sanitized JSON3 track before opening Stage 1 when the player has already returned it; wait briefly for the observer event, then preserve milliseconds and use the block-level fallback without delaying indefinitely.
- [x] When an English automatic track is advertised and captions are off, make a bounded best-effort CC/settings selection through YouTube's visible controls, restore the prior captions-off state after the read, and retain a safe fallback when private controls or trusted gestures reject it.
- [x] Carry structured captions through handoff, content resolution, queue/private source storage, worker previews and completed blueprints.
- [x] Share one sentence/word mapping between stages; distinguish provider word starts, estimated ends and legacy/block navigation.
- [x] Add local word highlighting with pause/seek/hidden-state cleanup, no missing-word interpolation and no page-level 50 ms state updates.
- [x] Show unavailable/partial word-timing notices in both stages; distinguish disabled/hidden highlights, preserve ordinary listening, and compute status locally from usable timing evidence.
- [x] Reuse semantic analysis for timing-only upgrades; keep source/video/language and sentence identity checks.
- [x] Recover old ready caches through a bounded fresh-caption bridge and timing-only API; show cached content first, reject changed source text without reanalysis, and preserve active Stage 2 practice until the learner returns to Stage 1.
- [x] Bound repeated network payload using opt-in SSE word deduplication, complete reconnect/poll/final snapshots and compressed final JSON; load Stage 2 code on demand.
- [x] Verify desktop/mobile Stage 1/2 rendering, word-clock seek/pause behavior and Sound hidden-text isolation with mocked browser/API boundaries; pass root lint, unit tests and production build.
- [ ] Validate actual JSON3 availability and sentence endpoints on the learner's target YouTube videos, including the `think about` example. Provider timestamps do not establish acoustic word ends.

No ASR, forced aligner, audio download or media-storage migration is added. The existing source-permission launch gate and file-reference F1–F5 work below remain pending. Regression and synthetic performance details are recorded in `design/docs/SENTENCE_SEGMENTATION.md`.

Availability-notice follow-up: root lint/build/test passed (241 API, 151 web,
49 extension; 441 tests). Dedicated mocked-browser checks at 1440/390 px passed
for both stages, including partial/unavailable timing, off/hidden text, sentence
switching, usable playback and no new requests; screenshots were inspected.

Old-cache recovery follow-up: root lint/build/test passed with 267 API, 161 web
and 61 extension tests (489 total). The API preserves all 14 starts in the user's
complete JSON3 excerpt and abstains on its final overlong estimated interval.
An actual unpacked-extension smoke with intercepted fixtures passed old-handoff
recovery, duplicate entry, block-only captions, timeout/retry, source isolation
and no matching tab. Existing timing-status and synthetic-microphone recording
browser regressions passed at 1440/390 px. A check of the real local Lisa Su
cache showed the new retry UI but an extension-response timeout; live JSON3
recovery still requires reloading the unpacked extension and the Web page.
Dedicated recovery browser checks passed all six 1440/390 px scenarios with
exit 0: cached content before the extension reply, deferred application until
Stage 1 is paused, Stage 2 microphone/recorder/player/selection preservation,
explicit exit to apply, absent-extension retry, and stale-source rejection.
Desktop/mobile pending-recovery screenshots were inspected. Parallel audio-buffer
work briefly invalidated shared interfaces/test stubs; it was preserved rather
than overwritten, and final type/lint/build checks were repeated after it settled.
The final shared-workspace test rerun passed 509 tests (267 API, 174 web,
68 extension), including additional tests from that parallel work.

The file-based target architecture is accepted but remains planned. The proposed acquisition default is selected-segment preparation, not whole-video downloading. Existing M1–M4a implementation and verification below remain valid for the local prototype. The caption-first increment above improves its basic playback path without implementing media ingestion. See [the architecture and acceptance criteria](design/docs/STAGE_TWO_FILE_REFERENCE_ARCHITECTURE.md).

- [x] Document the target, source limitations, selected-segment acquisition, learner flow, data/queue boundaries, and migration order.
- [ ] F1: validate an available authorized file source, actual range-fetch behavior/bytes, source time mapping, server acoustic parity, and latency on representative samples.
- [ ] F2: implement versioned segment/sentence assets, private media storage, persistent jobs, quality gates, and recovery.
- [ ] F3: use file references in Shadow, prefetch current/next sentences, remove reference-capture authorization from the normal flow, and apply the planned operation-button styling.
- [ ] F4: implement authenticated asynchronous learner analysis, attempt-bound navigation, optional retained recordings/history, and deletion controls.
- [ ] F5 / M4b: add independently checked word/phoneme alignment and individually evaluated detectors; keep unsupported observations unevaluated.

No media ingestion endpoint, storage migration, source download, server acoustic worker, or new button implementation was added by this documentation update. First-source availability and launch region remain open; do not assume arbitrary YouTube links provide authorized, range-readable audio.

## Milestone 0: keep the foundation green

- [x] Configure pnpm workspace and Turborepo
- [x] Restructure apps and shared packages
- [x] Initialize FastAPI routes and smoke tests
- [x] Add agent and product documentation
- [ ] Add a continuous integration workflow for install, lint, build, and test
- [x] Add web unit-test tooling and one feature-level test

Acceptance criteria:

- `pnpm lint`, `pnpm build`, and `pnpm test` pass from the repository root
- Generated files, dependencies, local environments, and secrets remain ignored

## Milestone 1: connect the web prototype to the API

- [x] Add a typed API client boundary in `apps/web`
- [x] Add development environment configuration for the API base URL
- [x] Replace direct demo rendering with loading, ready, failed, and unsupported states
- [x] Keep demo fixtures available for tests and local story states
- [x] Add contract tests for content resolve, job creation, job SSE/polling, and blueprint retrieval

Acceptance criteria:

- The Stage 1 page can resolve content, create or resume a job, and render its blueprint
- API failures produce a recoverable user-facing state
- Components do not import FastAPI implementation details

Verification notes:

- Stage 1 uses `apps/web/features/stage-one/api/stage-one-api.ts` for content resolve, job creation, SSE progress with polling fallback, and blueprint fetch.
- Stage 1 transcript lines and logic nodes seek the embedded YouTube player. Transcript clicks and playback time updates also activate the latest logic node at or before the current subtitle timestamp. The redundant Chapters UI and estimated chapter timestamps have been removed; the API field remains compatible with existing blueprints. Chunk and structure annotations remain usable when an extracted phrase spans adjacent caption lines.
- Contract coverage lives in `apps/api/tests/test_smoke.py`; web regression tests run through the root test command.

## Milestone 2: implement persistence and identity

- [x] Record the database and auth decisions in `DECISIONS.MD`
- [x] Add the initial relational schema and repository migration directory
- [x] Apply the schema to the hosted Supabase project and clear advisor warnings
- [ ] Replace in-memory repositories behind service interfaces
- [x] Add optional and required authenticated-user dependencies to FastAPI
- [x] Define anonymous local corpus keys and account-merge behavior
- [ ] Add authorization tests for corpus and speaking records

Acceptance criteria:

- Public processing cache data is separate from private learning data
- A learner cannot read or mutate another learner's corpus or sessions
- Anonymous Stage 1 remains usable
- Migrations can create a clean local database deterministically

Verification notes:

- Supabase, Clerk, and Upstash boundaries are defined in `design/docs/DATA_ARCHITECTURE.md`.
- Supabase project `ulrdykwhggcaspylines` has initial, Clerk RLS, processing-document, observability, and idiom-kind migrations applied. Prior advisor warnings were cleared by optimizing Clerk JWT policy expressions; the latest advisor recheck encountered a transport failure.
- Hosted Clerk Third-Party Auth still needs its final Supabase dashboard confirmation for direct Data API access. The corpus path instead verifies Clerk in FastAPI and uses a server-only repository with explicit owner filters. Real-token browser login integration remains unverified.
- Corpus persistence is connected; speaking repository replacement remains pending. New corpus tests cover owner-scoped queries, retry idempotency, cloud-edit preservation, private-source denial, and database failure without memory fallback.
- Auth return targets are explicitly set for login, registration, and cross-flow transfers using the full URL captured on click. Browser regression checks intercept both Clerk modal calls to verify their targets and check Create account hover colors; this does not replace a real credential/OAuth completion test.

## Milestone 3: build the YouTube extension entry

- [x] Correct multilingual ASR language detection using the explicit default audio index and audio language; cover reordered captions, non-English audio, ambiguous defaults and legacy single-language metadata.
- [ ] Verify the updated extension's entry and caption handoff on `-sKAMB10eh0` after manually reloading Libitu and refreshing YouTube. Local regression/manifest checks pass; browser automation cannot open Chrome's extension management page.

- [x] Choose extension build tooling and record the decision
- [x] Add Manifest V3 configuration and a direct toolbar action
- [x] Detect supported YouTube watch pages
- [x] Read video metadata and visible transcript text in the browser
- [x] Open or hand off to the Stage 1 experience
- [x] Add local cache restoration and unsupported-page behavior
- [x] Add player-control and toolbar one-click entry with SPA video detection
- [x] Open Stage 1 before captions/API work and recover the caption handoff on reload
- [x] Gate both extension entries on verified English video metadata

Acceptance criteria:

- The unpacked extension loads without manifest errors
- A verified English video reaches Stage 1 with no media upload
- Non-English or unknown-language videos, unsupported pages, and missing/mismatched video players show a specific reason and do not create a processing job. Missing browser captions on an English video may use the existing backend caption provider; unavailable captions ultimately produce an explicit unsupported state.

Verification notes:

- The first extension version is framework-free and validates `manifest.json` plus referenced files with `apps/extension/scripts/validate-extension.mjs`.
- Both entry points validate the current watch URL/player/title and video language, then open Stage 1 and acquire timestamped browser captions while the web page loads. The current supported-language list contains only `en`. The in-player entry stays disabled while checking and for non-English/unknown languages, exposes a hover reason, uses the existing Libitu icon in YouTube's lower-right control group, and reattaches when the player redraws its controls. Metadata/caption content-script messages are separate, and a missing receiver is injected once before retrying. Unsupported toolbar clicks show a badge/title and in-player message without opening another UI surface.
- Browser captions use a 15-minute `chrome.storage.session` handoff, a same-origin message bridge, and bounded waits. The web app creates the content/job after handoff, replaces its URL with durable IDs, and reuses them on Retry/reload. No media or transcript text is embedded in the launch URL.
- Six extension tests and four additional web tests cover language gating, launch ordering, duplicate clicks, missing receivers, source checks, worker restart, bridge cancellation, and bounded fallback. The real-unpacked-extension Playwright check uses a mocked YouTube SPA/API with YouTube's nested left/right control groups and verifies English enablement, non-English disablement and hover feedback, player-control mounting, page visibility before captions/API completion, navigation invalidation, reader reuse, caption delivery, failed-job Retry without re-resolving the source, durable URL restoration, and narrow-screen overflow. Observed development runs showed the player container and loading state between roughly three and eight seconds under varying development load; these are environment-dependent observations, not a live YouTube playback or model-completion benchmark or a latency guarantee.
- The broader pre-existing Stage 1 browser suite encountered timeouts around corpus restoration and navigation while the local Clerk integration logged session-refresh redirect loops. Real login/corpus browser verification remains environment-dependent; no Clerk credentials were changed as part of this entry optimization.

## Milestone 4: replace blueprint placeholders

- [x] Define the versioned blueprint structured-output schema
- [x] Add a deterministic caption-text processing baseline
- [x] Add a language-model adapter with timeout, retry, and bounded input/output
- [x] Cache jobs by normalized content key and analysis version
- [x] Persist job failure details that are safe to show to learners
- [x] Extract an evidence-checked corpus candidate pool and rank it by learner CEFR level
- [x] Recover pending queue jobs, isolate blueprint caches by analysis version, and reject obsolete work
- [x] Add worker readiness, processing stages, timestamps, timings, and bounded external requests
- [x] Move English subtitle punctuation and sentence segmentation to a local streaming formatter
- [x] Keep the YouTube player mounted while streamed transcript state changes
- [x] Preserve preview-to-final node identity and cancel disposed Stage 1 loading chains
- [ ] Add fixtures for malformed, short, long, and multilingual transcripts

Acceptance criteria:

- Reprocessing the same content and version returns the cached result
- A schema-invalid model response fails safely or retries within policy
- Tests do not require a paid model call

Verification notes:

- Different content IDs now produce source-specific titles, transcript lines, timestamps, and corpus candidates.
- DeepSeek JSON output is validated with Pydantic and retried at most twice for retryable provider or schema failures; automated tests inject a fake analyzer and make no paid calls.
- DeepSeek responses stream into a partial JSON parser and are still checked for truncation and schema errors before completion. Evidence-backed formatting variance is normalized, individually invalid corpus candidates are dropped when valid candidates remain, output budgets start at 32K and remain bounded at 64K, and provider diagnostics include completion-token usage without response or transcript content.
- The `mvp-v9` contract uses the repository-owned Stage 1 system prompt and extracts 16-32 bounded chunks, idioms, and structures with exact source evidence, usage/register/scenario/phonology metadata, CEFR level, and three quality scores. It omits subtitle text and sentence-boundary metadata; duplicate, low-quality, or transcript-unsupported candidates are discarded, while `GET /api/blueprints/{content_id}` applies read-time learner-level ranking and a three-kind-balanced result limit.
- All caption fragments within the explicit 240,000-character job limit remain eligible for evidence. Before punctuation, deterministic token cleanup removes standalone `um`, `uh`, `er`, and `ah`, merges caption continuations, and groups consecutive lines with the same timestamp. The resulting transcript is shared by sherpa-onnx, DeepSeek, Stage 1 display, and evidence checks; the raw caption payload remains stored.
- Reliably punctuated English captions bypass sherpa-onnx. Other captions reach the local model with external punctuation removed, then reuse source words and casing with only the model's normalized punctuation. Duplicate/conflicting marks and high-confidence opening discourse markers are normalized on every path; timestamps and non-filler words remain source-grounded, and invalid or unavailable model output falls back to conservative local merging.
- The backend owns `ANALYSIS_VERSION`; browser clients cannot submit it. Versioned Redis/Supabase reads prevent stale blueprints from crossing analysis versions.
- `pnpm dev` starts API and worker processes together. `/health/ready`, job stage fields, per-stage timings, and structured worker logs make stalled work diagnosable.
- Worker heartbeats include the loaded analysis version and model; readiness reports `stale` when API and worker processes are not running the same extraction contract.
- The Stage 1 web client shows the video immediately after a bounded passive caption preflight, consumes validated summary/logic/corpus and sentence-sized transcript previews over job SSE, and falls back to bounded polling after a stream disconnect. Source URL and YouTube origin state are initialized after hydration so the server and first client render remain identical. The YouTube API owns an imperative iframe inside a React-owned stable container, so transcript callback updates cannot remove the player. The extension never reconstructs or replays the subtitle request.
- Stage 1 subtitle auto-scroll runs only during active video playback. Paused or ended playback suspends alignment while keeping its control interactive; manual transcript scrolling creates a short alignment pause, and the auto-scroll control always toggles the setting, with alignment resuming when it is turned back on during active playback.
- Eight web regression tests cover cancellation, polling fallback, stale/duplicate previews, stable identities, and learner-level ranking. A mocked-API Playwright check at 1440px and 390px verified one job read, one SSE connection, one blueprint read, and preservation of corpus-card, logic-node, transcript-row, and player-iframe DOM identities across finalization; no real provider requests were made.
- Stage 1 recovers old shared URLs whose job or blueprint belongs to an obsolete analysis version by resolving the current server-owned job before retrying the blueprint read.
- A local benchmark on the 50,385-character Peter Thiel transcript formatted 475 caption rows into 645 timestamped sentences in 4.122 seconds on the development machine without calling DeepSeek.
- Production metadata on 2026-09-05 showed a 54,852-character transcript formatting in 12.491 seconds, then spending 230.952 seconds in DeepSeek and failing after repeated output truncation. The old 210-second browser deadline was shorter than the 251.5-second job. `mvp-v7` adds hard output-field limits, uses 32K then 64K, preserves earlier preview fields across provider attempts, waits up to ten minutes, and retains the preview during Retry. A regression test covers non-regressing previews; a paid live `mvp-v7` long-video run remains pending.
- A failed Stage 1 job remains read-only on initial page load; the visible Retry command explicitly resets and re-enqueues it instead of repeatedly reading the same failed job.
- The job-observability migration was applied to Supabase project `ulrdykwhggcaspylines`; post-migration advisors returned only expected informational notices.
- A consented live test completed `pending -> processing -> ready` in one attempt and persisted the result to Supabase.
- The YouTube transcript fallback was verified against a public captioned video without logging transcript content.

## Milestone 5: complete corpus and speaking

Loadout increment (2026-09-30): implements the [fixed contract](design/docs/LOADOUT_IMPLEMENTATION.md), independent setup/preview page, shared real corpus selection, account-bound local drafts, 3 structure / 5 shared chunk+idiom limits with at least one item, authenticated idempotent session creation and refresh recovery. Pending Shadow saves survive client-side navigation. The 2026-10-01 Stage 4 increment above adds real AI role-play, turn persistence and traceable usage observations.

- [x] Connect Stage 1 corpus list, create, and delete with local/account persistence
- [x] Open corpus cards with full source context and persist on-demand analysis details
- [x] Add the cross-content corpus library and saved-item editing interface
- [x] Build speaking loadout selection limits
- [x] Persist owner-checked, ordered loadout snapshots atomically with idempotent creation and authenticated recovery
- [x] Implement the role-play adapter and turn persistence
- [x] Detect selected-item use with transparent evidence
- [x] Generate four-dimension session feedback with supporting turns
- [x] Add end-to-end browser coverage for save, loadout, role-play and feedback (fixture source/auth/provider; real OAuth remains separate)

Acceptance criteria:

- A saved input item can be selected and detected in a speaking session
- Feedback references actual turns and distinguishes measurements from model judgments
- Reloading preserves signed-in state

Partial verification notes:

- Final Loadout root lint/build/test passed (494 API + 252 web + 112 extension = 858 tests; unchanged API/extension tasks reused caches). The frozen-code browser suite passed at 1440/768/390 px, including keyboard interaction, 200%-equivalent reflow, selection limits, guest/account draft recovery, failed-create retry, session recovery, Stage 1 save → loadout → session, and pending Shadow saves across navigation. Two-tab tests exercise real Web Lock contention, continuous typing, stable submission UUIDs, queued writes across SPA links and history Back/Forward, exit protection, and cancellation on account change. Screenshots were inspected. Browser auth/API fixtures do not establish real Clerk/OAuth integration.

- Loadout migration `20260930114115_speaking_loadout_sessions.sql` is applied. Transactional SQL assertions and `scripts/verify_speaking_loadout.py --run-live` passed against real Supabase, including service-only RPC privileges, shared idiom/chunk limits, concurrent retries, owner rejection, and snapshots surviving source edits/deletion. Synthetic fixtures were removed. Browser identity fixtures remain distinct from real Clerk/OAuth verification.

- Selection-card lifecycle is covered by the desktop/mobile browser check: outside dismissal, internal interactions, pin/unpin, replacement of a pinned card, and rejection of late responses for repeated text. New cards start unpinned with a fresh note and explanation tab.

- Corpus cards open a native modal with the original subtitle context and complete explanation/syntax tabs. Unsaved candidates use a page-session cache; new saves include that detail, while legacy saved items call AI only when detail is absent and persist the result to localStorage or the owner-scoped Supabase record. Desktop/mobile browser checks cover dialog bounds, source highlighting, tab switching, save-button isolation, cache reuse, and legacy hydration.

- Stage 1 supports manual transcript selection into a corpus analysis card. The backend exposes `/api/corpus/analyze-selection`, uses maintained explanation and seven-module syntax prompt sections, preserves short phrase boundaries by default, and accepts a completion only when it is an exact span of the current subtitle. The card omits boundary commentary for complete selections and shows a suggestion only when expansion is needed. Provider failures are explicit rather than disguised as generated analysis. Accepted expressions and structure templates use the same durable save path as extracted candidates, including learning metadata and slots.
- Anonymous saves survive reload in localStorage. Login claims guest records into an account-bound outbox and uploads them idempotently; acknowledged items are removed individually, existing cloud edits win, and failures keep unsynced data with a Retry action. Saved is scoped to the current video and uses delete icons, not add icons.
- Twelve corpus-storage web tests cover guest reload/removal, detail hydration, partial merge, account isolation, late-response cancellation, storage failure, uncertain saves, remote deletion failure, corrupt data, token ownership, and cross-tab write-loop prevention. Backend coverage verifies owner-scoped detail generation is persisted and generated only once.
- On 2026-09-04, all 19 web tests and 46 backend tests passed. Desktop/mobile browser checks verified guest save/reload/delete and trash icons even after a saved item's text changed; the four-tab layout was constrained to avoid scrolling/clipping the entire right panel. A live Supabase test verified idiom insert/list/update/delete, edit-preserving duplicate writes, and cross-owner rejection through the server repository. Synthetic data was cleaned up; real Clerk login/logout in the browser remains a separate unverified integration.

## Later milestones

- [ ] Intensive listening and local shadowing
  - [x] Define the backward-compatible Stage 1 to Stage 2 segment data contract
  - [x] Generate source-grounded segments with bounded durations and transcript fallbacks
  - [x] Wire completed blueprint segments through the web API adapter with legacy compatibility
  - [x] Add the Stage 1 bottom CTA entry point for segment selection
  - [x] Implement the Stage 2 segment picker with timeline and selection state
  - [x] Show Stage 2 readiness from actual segment/sentence availability
  - [x] Launch the selected segment into the Stage 2 shadow view
  - [x] Stage 2 Milestone 1: derive versioned sentence units and explicitly approximate caption bounds
  - [x] Stage 2 Milestone 1: sentence directory, previous/next, keyboard navigation, and URL selection recovery
  - [x] Stage 2 Milestone 1: independent play/pause/seek, one sentence-or-segment range, loop toggle, and supported playback speeds
  - [x] Share source-preserving server sentence rows between Stage 1 and Stage 2; merge broken candidates with local spaCy and keep complete long sentences intact
  - [x] Preserve append-only transcript previews, independent same-timestamp rows, and caption-based approximate timings
  - [x] Upgrade legacy blueprint display boundaries in a bounded local cache without paid semantic reanalysis
  - [ ] Expand the real-video boundary evaluation set across speakers and caption providers
  - [x] Stage 2 Milestone 2: browser-local microphone recording and recording lifecycle
  - [x] Stage 2 Milestone 3: one authorized Chrome practice audio session, automatic sentence reference capture, cache and playback continuity guards
  - [x] Stage 2 Milestone 3: local Silero/Pitchy analysis, quality gates, and Rhythm/Melody measurements and curves
  - [ ] Validate live YouTube capture and real-speaker acoustic quality across devices
  - [x] Stage 2 Milestone 4a: source-bound Sound rule candidates, dictionary coverage and expected/observed separation
  - [x] Stage 2 three-layer UI: persistent Sound/Rhythm/Melody tabs, layer shortcuts, word cards and central canvas/right focus layout
  - [ ] Stage 2 Milestone 4b: word/phoneme alignment and individually validated Sound detectors
- [ ] Reading workspace, starting with pasted text
- [ ] Article URL extraction after supported-source rules are defined
- [ ] Product analytics and privacy-reviewed event tracking
- [ ] Deployment, observability, backups, and production runbooks

Do not add spaced repetition or social features unless a new accepted decision changes MVP scope. Real-time voice role-play was accepted under the 2026-09-30 decision and is implemented locally in Stage 4 above. Server-side practice media follows the file-reference and learner-persistence decisions; it does not authorize unrestricted YouTube downloading.

Stage 2 Milestone 1 acceptance and verification:

- A learner can select any available sentence, navigate with Previous/Next or the directory keyboard controls, and hear either that sentence or the enclosing segment. First/last controls are disabled appropriately; empty sentence data retains segment playback.
- Entering, changing sentence/range, or refreshing stays paused. Play starts only through a playback action. Turning repeat off stops at the active range end; a paused player never restarts itself, and only one range owns looping.
- Sentence IDs survive reload with unchanged source data. Refresh restores valid segment/sentence selection without creating another analysis job. Obsolete selections recover safely while preserving source/job/level query parameters and the URL fragment.
- Unit coverage exercises caption continuations, shared timestamps, repeated sentences, source changes, URL preservation, pre-ready playback commands, rapid seeks, stale time samples, range completion, and recoverable seek failure. Browser coverage uses mock API/player fixtures at 1440, 768, and 390 px; live YouTube boundary accuracy and microphone processing are outside this milestone.
- On 2026-09-08, root `pnpm lint`, `pnpm build`, and `pnpm test` passed (46 web, 63 API, and 6 extension tests). Stage 1 browser regression passed at 1440/390 px; Stage 2 navigation and player geometry passed at 1440/768/390 px. Desktop/mobile screenshots were inspected, and `git diff --check` passed.

Shared sentence delivery (2026-09-09): implementation and measured verification are recorded in `design/docs/SENTENCE_SEGMENTATION.md`. New formatters preserve sentence boundaries and timing metadata through preview/final/personalization; regression coverage includes long windows, incomplete tails, repeated source words, local-provider failures, old-cache immutability, and segment containment. Verification passed: 98 API tests, 51 Web tests, 6 extension tests, lint/build, Stage 1 browser checks at 1440/390 px, and Stage 2 at 1440/768/390 px. One real public caption sample and its punctuation-stripped variant were measured without a paid analysis call. Multi-video human-labelled quality evaluation remains an ongoing task, not a claimed accuracy percentage.

Stage 2 Milestone 2 acceptance and verification:

- Record sentence requests audio-only microphone access on an explicit click and binds the take to the selected shared sentence ID. Requesting, recording, finishing, ready, and error states are visible; the learner can Stop, Cancel, Replay/Pause, Record again, and Delete.
- A 60-second auto-stop and a 5-second finalization deadline bound recording work. The final Blob is exposed only after the recorder's final data/stop events. Same-sentence cancellation or failure preserves the previous take; successful replacement revokes it once.
- Switching sentence, Back to segments, the Stage 1 header, page exit, and refresh discard temporary recordings. Range changes and hidden tabs cancel unfinished capture while retaining a finished same-sentence take. Late permission grants release their tracks immediately and cannot restore an abandoned recording.
- Reference playback, microphone capture, and replay are coordinated, including native YouTube play events. Recording and replay never resume automatically. Microphone streams, timers, listeners, and object URLs have explicit cleanup paths, including React Strict Mode remounts.
- Audio stays in page memory without server upload or browser-storage persistence. No acoustic result or score is attached to recording success. Permissions, missing/busy/disconnected devices, unsupported encoders, empty data, failed finalization, and replay failures remain recoverable.
- Twenty focused recorder tests cover races, final chunks, MIME fallback, elapsed timing, timeout, interruption, and resource release. `apps/web/tests/stage-two-recording.browser.mjs` passed at 1440/390 px using real Chrome MediaRecorder with synthetic microphone input and mocked reference/API data. It verified actual Blob encoding, decoding, playback and cancellation/retention behavior, and caught a Strict Mode audio source cleanup issue that was fixed. Screenshots were inspected. Physical microphones, Safari, and live YouTube interaction remain unverified.
- Final verification on 2026-09-09 passed root `pnpm lint`, `pnpm build`, and `pnpm test`: 71 web, 98 API, and 6 extension tests. Stage 2 sentence navigation passed at 1440/768/390 px after a retry of an initial page-load timeout during concurrent verification. Recording browser checks passed at 1440/390 px, and `git diff --check` passed.

Stage 2 Milestone 3 acceptance and verification:

- Enable practice audio plus one same-tab Chrome toolbar invocation opens the current practice session without autoplay or idle encoding. Normal sentence listening at 1× prepares each missing reference automatically. The extension checks origin, top frame, document/tab/session/clip identity and its private capture token, retains one authorized tab stream and audible monitor, and creates one bounded recorder per requested sentence. Sentence/hash changes retain the session; source/content/segment changes, document exit, lease expiration, disconnected tracks and worker restart close it. Metadata-only session recovery never persists audio.
- The web waits for the recorder before playback. Initial-position and elapsed/media-clock checks reject seeks, stalled playback, mid-capture buffering, rate changes, early pauses, missing samples and late results. Native play caused by a paused seek cannot start capture. Microphone Record/Replay cancels reference encoding before it starts; normal Pause, hidden tabs and sentence selection cancel only the clip. Range/loop/speed controls are temporarily disabled during capture. A completed capture continues the learner's requested loop without recapture. A healthy session survives clip failure/cancellation.
- A per-practice LRU cache holds up to 20 results keyed by content/source/shared sentence/bounds/analysis version. Switching sentences reuses features and lets already accepted work finish for its original key. One reference worker and a two-clip/12 MiB analysis queue bound work; raw reference bytes release on completion, while model-error retry may retain them for at most 60 seconds. Explicit Play can retry failed/insufficient references; ordinary loops do not repeatedly analyze. Exit/refresh clears cache and pending work. The microphone remains one temporary current-sentence take.
- Silero V5 / ONNX Runtime Web and Pitchy run locally in an abortable Worker with pinned, verified, same-origin assets. A source-bound panel shows loading/error/retry, quality-gated speaking span, internal pause counts/duration, pitch range, normalized relative contours and speech regions. Missing reference permits user-only analysis. Insufficient speech or pitch produces explicit abstention, never an invented score or silent fallback detector. This milestone adds no ASR, Sound detector, paid speech key, media upload or feature persistence.
- Initial M3 verification on 2026-09-09, before the session workflow revision: root lint/build/test passed with 102 web, 98 API and 25 extension tests (225 total). Web additions included 14 reference lifecycle tests and 17 signal/worker/client tests; the extension added 19 bridge/background/offscreen tests. Model/runtime asset preparation and actual ONNX inference passed. An actual unpacked-extension smoke verified the original arming/cancellation flow, metadata removal and no active stream/offscreen context, and caught an unbound service-worker timer error, which was fixed. In this environment CDP keyboard input did not invoke the browser's toolbar action in either headless or headed Chrome, so full `getMediaStreamId` → offscreen capture remains a manual-toolbar verification boundary.
- Initial M3 `stage-two-acoustics.browser.mjs` passed at 1440/390 px with actual Silero/Pitchy workers, same-origin model/WASM fetching, real Chrome microphone encoding and a generated artificial English voice. Extension messages and YouTube playback are simulated in that test. It checked absent extension, buffered playback, native rate/state events with stale getters, cancellation, late responses, sentence cleanup, measurements/charts and no media/feature API writes. Screenshots were inspected, including narrow-screen layout. Synthetic speech does not establish detector quality for learners.
- Regression browser checks passed: Stage 1 at 1440/390 px, M1 navigation at 1440/768/390 px, and M2 actual MediaRecorder with synthetic microphone at 1440/390 px. Live YouTube timing/ads, a physical microphone, real-speaker quality, Safari and production extension origins remain unverified. Setup and the exact shipped/planned boundaries are documented in `design/docs/STAGE_TWO_ACOUSTICS.md`.
- Initial M3 production smoke also passed at 1440/390 px against `next start` on an isolated local port, after the final build. It verified the bundled Worker and same-origin model/WASM path with actual Silero/Pitchy results, rather than relying solely on development-mode behavior. The temporary production server was stopped afterward. Source cleanup drops previous Blob/features when the analysis source is cleared; memoized charts avoid rebuilding on each playback clock tick.
- Session revision verification on 2026-09-09: root `pnpm lint`, `pnpm build` and `pnpm test` passed with 122 web, 98 API and 33 extension tests (253 total). Focused coverage includes 21 reference lifecycle cases, 11 reference-cache cases and 13 player-controller cases, alongside extension stream reuse, no idle encoder, clip cancellation ordering, stale identity, page lease and navigation checks. The actual unpacked v2 bridge passed `armed → closed`, metadata removal and no active offscreen document. The full toolbar-authorized two-clip capture remains the manual check described above.

- The revised v2 acoustic browser flow passed at 1440/390 px on the dev server: one grant without autoplay, automatic Play capture, failure/retry preserving the session, microphone/replay interlocks, first-capture loop continuation, same-session next sentence, cached return without another worker, paused-seek transient Play rejection, disable retaining features and exit clearing them. It runs actual local Silero/Pitchy and Chrome microphone encoding against generated speech, with simulated extension/YouTube boundaries and no media/feature API writes. M1 navigation passed at 1440/768/390 px, M2 recording at 1440/390 px and Stage 1 browser regression at 1440/390 px.
- The final v2 production build passed the same acoustic browser flow at 1440/390 px on an isolated `next start` server. The fixture now waits for asynchronous close-message delivery before asserting cleanup. Enabled-session controls and computed measurement/curve screenshots were inspected at both widths with no horizontal overflow. Content/segment/source URL key the practice component, so a changed source cannot inherit an old capture. The isolated server logged Clerk session-refresh redirect warnings; this anonymous fixture does not verify signed-in authentication. The temporary production server was stopped, and final `git diff --check` passed.

- Same-document handoff fix (2026-09-15): `StageOneReader` now owns the single `BufferedReferenceSession` and provides it through `BufferedReferenceProvider`; the dynamically mounted Stage 2 consumes that context as its canonical session, so it cannot fall back to the legacy `Practice audio` panel after the Stage 1 → Stage 2 transition. The extension keeps the same tab lease when a same-source URL update also reports a transient `loading` status, preserving the REC badge and one-time toolbar grant. Root lint, build and test passed with 382 API, 179 web and 110 extension tests; the buffered Stage 1 → Stage 2 browser flow passed at 1440/390 px.

Stage 2 Milestone 4 acceptance and verification:

- M4a adds the Sound guide for the selected shared sentence. The API obtains its text from the current server blueprint and returns versioned dictionary pronunciations, UTF-16 occurrence offsets and conditional rule candidates. It receives source identifiers only, never audio or arbitrary transcript text. Unknown or ambiguous words are labelled, punctuation blocks cross-word rules, and exceeded processing limits are explicit. All-uppercase abbreviations are not silently treated as ordinary words (`SAT` versus `sat`).
- The panel offers five phenomenon filters, source-span highlighting, a possible phone change, its conditions, and separate Reference/Your voice states. Missing, loading, failed and usable M3 audio never produce a detected Sound or pronunciation score. Switching sentences cancels stale requests; returning to a cached sentence reuses its guide. A dictionary/API failure keeps listening and recording usable and offers Retry sound guide.
- The prototype-aligned UI exposes Sound, Rhythm and Melody as separate accessible tabs and synchronized left-side shortcuts. Each layer has its own central canvas and right-side focus. Panels remain mounted when hidden, so tab changes preserve sentence selection, playing/recording state, Sound filters/selection/revealed hints, and cached results. Left/Right wrap between tabs; Home/End select the first/last tab. Tab changes do not seek, play, record or invoke another analysis.
- Sound word cards show dictionary IPA and conditional phenomenon badges; selecting a card or source occurrence updates its explanation and conditions. Hide text covers words, IPA and source-revealing detail, including the current Sound practice prompt and selected directory entry. Covered cards reveal individually; Reveal all restores the sentence. Rhythm contains speaking span and separate speech/pause timelines, while Melody contains relative pitch contours and pitch range. Both use the same existing analysis results and retain quality gates; empty plots do not fabricate measurements. Word stress and nuclear stress remain explicitly unevaluated. Video, playback, recording and practice-audio controls stay mounted together above the layer workspace. The video is followed by one neutral operation bar ordered as Play reference, Record/Stop, Replay mine, then Range/Loop/Speed; a compact reference-connection row and collapsed How It Works help follow it. Desktop uses a wrapping horizontal layout and mobile stacks the same groups without horizontal overflow. Long setup copy stays collapsed while errors remain directly visible.
- The first candidate baseline is deterministic dictionary/rule inference. It introduces no paid LLM call, additional API key, database migration or audio persistence. Backend and browser caches are bounded and version/source-specific. See `design/docs/STAGE_TWO_SOUND.md` for rules, licensing, limits and the detector release gate.
- M4b is still pending: no word/phoneme aligner, content-consistency check or validated allophone detector is connected. Require independently aligned reference/user audio and human-labelled, speaker-disjoint evaluation before reporting realized linking, weak forms, flaps, assimilation or elision. Text-rule test success is not an acoustic accuracy result.
- Verification on 2026-09-09: root lint/build/test passed; 130 web, 185 API and 34 extension tests passed (349 total). New coverage includes 87 Sound API/rule cases and eight web contract/cache/abstention cases. A read against an existing real-video blueprint returned source-matching flap/weak-form candidates and passed the actual frontend parser without reprocessing the video or uploading media.
- Sound browser checks exited successfully at 1440/390 px for filters, repeated occurrences, keyboard focus, empty/ambiguous/unknown states, retry, stale responses, cached return and overflow. Screenshots were inspected. Navigation passed at 1440/768/390 px and recording at 1440/390 px. The acoustic regression completed both viewport assertions, including real Silero/Pitchy results staying unevaluated for Sound, but its Node process retained a socket after Chrome exited and required termination (143). Treat that run as assertions passed with an unresolved test-teardown issue, not a clean full-suite exit. Browser API/player fixtures do not establish phonology or real-speaker detector accuracy.
- Three-layer UI verification on 2026-09-09: the initial root lint/build/test run passed with the unchanged 130 web, 185 API and 34 extension tests (349 total). Sound browser checks and the actual local Silero/Pitchy acoustic suite passed at 1440/390 px and both Node processes exited naturally with code 0. Desktop Sound/Rhythm and mobile Sound/hidden-text screenshots were inspected, along with all mobile layers and measured acoustic views. The checks cover presentation, shared state and local integration; they do not establish real-speaker acoustic accuracy.
- Navigation assertions passed at 1440/768/390 px and recording assertions passed at 1440/390 px. After their browser contexts closed, six identified helpers spawned by the test Chrome/GoogleUpdater processes retained inherited stderr sockets. Stopping only those test-owned helpers let both Node test processes exit with code 0; no forced Node exit or application lifecycle change was used. This demonstrates one source of test-process lingering in the current run; the exact cause of the earlier M4a acoustic teardown symptom was not established.
- UI review found that left-side shortcuts changed the layer without bringing its workspace into view. The shortcut handler now selects the layer and scrolls that workspace into view without controlling audio. Follow-up root lint and build passed after this correction. The updated Sound suite passed at 1440/390 px and exited naturally with code 0, including full tab-list visibility after a shortcut, unchanged guide/worker/player counts and retained DOM identities.
- Media layout follow-up: grouped the video and Play/Range/Loop/Speed controls beside Enable practice audio and microphone recording above all three analysis layers. Mobile stacks video/playback, reference setup and recording before the tabs. Root lint/build/test passed (349 tests); Sound/layout and actual MediaRecorder browser suites passed at 1440/390 px with exit 0. Screenshots were inspected, and the updated layout assertions verify media-before-analysis ordering, desktop adjacency, mobile stacking and preserved layer/player state.

Post-M3 production data and content-rights work (planned, not implemented):

- [ ] Define authenticated practice-attempt, assessment-evidence, learner-profile, recommendation-event, recording-object, purpose/consent, and deletion-state contracts. Keep self-reported and assessed levels separate; retain task conditions, evidence quality, reference/model versions, and uncertainty.
- [ ] Add optional learner recording upload for current cloud analysis and a separate long-term replay/history choice. Add access, export, deletion, retention, processor, and account-closure behavior. Keep model training or human review as a separate opt-in that defaults off.
- [ ] Add a licensed-content registry and ingestion path for rights-holder-supplied media/captions. Store one versioned reference clip/feature set per licensed sentence and reference it from learner attempts rather than duplicating it.
- [ ] Restrict ordinary YouTube persistence to approved locators, permitted metadata, sentence identities/bounds, and learner-owned attempts/results. Resolve D-003 before production; browser-local tab capture and DOM caption acquisition are not treated as proof of platform permission.
- [ ] Select the first concrete overseas countries and complete their privacy, copyright, consumer, child-safety, transfer, and platform checks. Mainland-China launch remains outside the current scope.


2026-09-30 layer guidance correction: restore the right-side Layer focus, Feedback and Tip cards for Sound, Rhythm and Melody. Sound guidance follows the selected phenomenon and uses the current sentence’s rule suggestions; conceal mode also hides word-specific sidebar text. Desktop places guidance beside the layer canvas; narrow screens place it below. The video remains above the workspace. Removing the experimental score sidebar did not authorize removing instructional guidance; no illustrative scores or detected-error claims are restored.

Verification for the September 30 correction: root lint/build/test passed (805 tests). Desktop 1440 px and mobile 390 px browser regression passed, including focus-card positioning, Sound filter synchronization, concealed-text protection, all three layer tips and saved-take recovery. Screenshots were inspected. The upload test now waits for observable state instead of assuming hashing completes within 10 ms.


2026-10-15 Reference retry repair: preparing the same browser capture after deletion/expiry now allocates a new deterministic generation; active generations remain idempotent and historical rows/take bindings are never revived. HTTP 410 during upload/status/retry clears stale readiness and stops polling, allowing explicit preparation again. MFA version probes use isolated temporary runtime directories, cache only exact successful version checks and distinguish process startup failures from version mismatches. The UI distinguishes alignment-service outages, timeouts and alignment failures from caption timing/coverage failures. Reference still uses source-transcript MFA with quality checks; acquisition and learner ASR/60–85 gates are unchanged.


2026-10-15: moved MFA version validation to both workers’ startup. Added regression coverage for successful multi-job startup, mismatch, process failure, missing executable and timeout before claims; sentence alignment rejects any version subprocess in its regression test. Offline analysis and the full acoustic smoke also validate once at entry; the latency benchmark preserves historical per-job probes only in its baseline.

Verification: root lint/build/test passed (926 API, 368 web, 114 extension). After restarting the local dev stack, both acoustic workers logged a successful MFA 3.3.9 startup check. No database migration or audio/result rewrite was required.


2026-10-15: unified Reference and learner server-analysis controls, default enabled, with account/browser-scoped persisted off. Kept historical audio retention independent and default disabled; updated both capture and registered-file entry paths, guidance, disclosures and browser regressions.

Unified-analysis verification: root lint/build/test passed. Desktop (1440 px) and mobile (390 px) browser regression passed for default-on analysis, separate default-off retention, persisted off after refresh, saved-result recovery, single combined learner upload and registered-file preparation/upload gating. Source capability resolves before browser-capture auto-upload to avoid preparing both adapters.


2026-10-15 Sound presentation: restore the supplied screenshot’s text-first default appearance. All shows candidate phonology marks/linking arcs without per-word acoustic measurement clutter, even after analysis completes. Vowel len. explicitly shows retained vowel durations; Linking shows measured boundary pauses. Keep the existing wrapping typography, IPA reveal, Reference/Your voice rows, guidance sidebar, tab state badges, Rhythm/Melody and server analysis/gates unchanged. This is a presentation adjustment, not a rollback of analysis or a fabricated pending state.


2026-10-15: learner acoustic analysis now runs independently of pending Reference analysis after the unchanged 60/85 word gate. Save the learner checkpoint before waiting; resume final comparison without downloading, decoding, ASR or MFA again. Queue claiming permits missing learner checkpoints even after ASR succeeds, including lease recovery. The hosted `parallel_learner_acoustics` migration updates the claim predicate only; owner, expiry, lease and service-role boundaries remain intact.

Learner workers preload one isolated resident `small.en` process before claiming jobs. Reuse the existing CPU/int8/two-thread model, English/beam-5/temperature-0 settings and reliability thresholds. Requests are serialized per worker, timeout at 180 seconds, and kill/reap the child on failure; the next request rebuilds it. Reference still uses source-transcript MFA; acquisition and audio/alignment quality rules are unchanged. Extra workers each retain their own model memory; parallelism requires both workers and sufficient CPU/RAM, and cold MFA lexicon initialization may still serialize.


Parallel-analysis verification (2026-10-15): root lint/build/test passed (941 API, 368 Web, 114 extension; unchanged Web/extension tasks cached). Disposable PostgreSQL with all repository migrations passed the queue regression, including crash recovery after ASR, durable acoustic checkpoint waiting, retry-budget preservation, stale leases, owner isolation and deletion. Hosted claim migration applied and verified: service role can claim, anon/authenticated cannot. Security advisor has no warning/error (existing informational private.content_payloads RLS-without-policy notice). Local dev stack restarted; both MFA startup checks passed and the learner worker confirmed resident ASR readiness before claiming. The real same-input ASR benchmark recorded 8.794 s → 5.490 s median across three runs, identical evidence, 2.839 s one-time startup; end-to-end parallel wall time remains unmeasured.


2026-10-15 parallel end-to-end measurement: three real storage/queue/inference/UI runs with 3.746-second synthetic speech completed in 50.746/80.131/57.191 s from Reference registration, or 37.342/71.490/48.306 s from learner audio PUT. MFA remains the largest compute stage (17–34 s/invocation). Run 2 found Reference result-save HTTPError causing backoff and repeated MFA; learner checkpoint resume avoided recomputation. Audio local cache hit throughout; final persist-to-display delay 1.161–2.961 s. Fixture auth/source and local environment limit generalization. No additional optimization was shipped in this measurement. Evidence/method/next candidates: design/benchmarks/stage-two-20261015/results.json and STAGE_TWO_REFACTOR_CONTRACT.md. Synthetic data/test page cleaned, regular dev restored.


- [x] Progressive server acoustics (2026-10-16): full eligible-Take frames; cached Reference signal; MFA-independent coarse F0/energy CWT; actual ASR/subtitle boundary provenance; durable checkpoints; preliminary/final UI transitions; unchanged exact gates and audio acquisition. Hosted schema migration applied.
- [x] Local compute benchmark: public 4.22s audio, three ASR→coarse runs 5.953/5.433/8.354s with no MFA; no upload/queue/DB/UI time included. [Method and results](design/benchmarks/progressive-acoustics-20261016/README.md).
- [ ] Target CPU deployment benchmark, under-load contention comparison and retained same-sentence user/Reference effect validation. Separate fast/fine worker lanes, CPU isolation and ASR/extraction parallelism are not implemented by the progressive-publication increment.

Progressive verification: root lint/build/test passed (964 API, 370 Web, 114 extension), followed by 42 focused API checks including Reference-MFA-failure fallback. Disposable PostgreSQL passed existing word-gate and new full-frame/preview checkpoint regressions; stale leases, immutable frames and parent deletion were covered. Hosted migration columns and service-only grants verified. Desktop 1440px/mobile 390px browser flow passed on the final dev code with screenshots under `/tmp/libitu-progressive-ui-final`; previews upgrade to original final layers, remain gated and disappear during replacement recording/deletion. Local API/Reference/learner workers are running; both MFA startup checks and resident ASR startup passed. `UV_FROZEN=true pnpm dev` avoids unnecessary dependency re-resolution after a transient GitHub model metadata timeout. Cloud application deployment and cloud end-to-end timing are not claimed.

## 2026-10-16 independent acoustic workers

Implemented: separate `stage_two_worker --lane fast|fine` processes, started together by `pnpm dev`. Fast handles learner ASR/word gates and server F0/energy/CWT for Takes and References; fine handles MFA and final comparisons. A service-only PostgreSQL lane claim and fenced handoff (`20261016111833_acoustic_worker_lanes`) preserve checkpoints, reset the downstream retry budget and invalidate the fast lease atomically. Each lane prioritizes eligible Takes over References. Fast startup preloads ASR without probing MFA; fine alone verifies MFA. Old combined entrypoints/claim RPCs reject use. Original audio acquisition, quality checks, recognition settings and 60%/85% thresholds are unchanged.

Local macOS scheduling: fine runs at nice 10 with native library threads capped at one; a separate supervisor pauses/resumes the MFA process group when the fast lane holds a shared activity lock. Parent heartbeats continue, locks release on crashes, and the supervisor reaps MFA if its owning worker exits. Active MFA timeout excludes pauses with a bounded additional 900 seconds of wall time. Empty queue polling does not pause MFA. Both workers must share the scheduler directory/account. This prioritizes first results and may extend fine completion under load; it is not hard CPU affinity. Optional disjoint Linux CPU sets and systemd templates are provided but not validated on a cloud host. No production worker deployment is implied.

Validation and timing: see [local lane comparison](design/benchmarks/worker-lanes-20261016/README.md). The local benchmark separates controlled CPU/queue timing from real hosted-storage/local-worker polling; browser paint and target-cloud timings are not inferred from either. Existing previews remain visible through fine processing/failure; no frontend redesign or new matching classes.

## 2026-10-17 submission latency increment

- [x] One multipart Take submission; transactional registration and durable-upload-before-queue finalization.
- [x] Independent history retention and safe replay after uncertain responses, input cleanup or retention failure.
- [x] Atomic feature/coarse publication plus fast-to-fine handoff, with lease and word-gate fences.
- [x] Disposable PostgreSQL registration/replay/deletion/rollback and atomic handoff regressions; migration applied to connected Supabase.
- [ ] Realtime/event-driven queue wakeups, async cloud storage, streaming microphone uploads and Reference prewarming remain separate future work.

Measurement and verification: [submission benchmark](design/benchmarks/submission-20261017/README.md).

Submission benchmark (2026-10-17): public 4.22s clip, prepared Reference, three alternating trials per mode using new checkpoint workers. Median submit 7.188→3.030s; word feedback rendered 18.550→11.918s; preliminary curves rendered 18.550→14.550s. Browser harness reuses production submission/polling/visual components; target-cloud and whole-practice-page performance are not inferred. Fixture rows/audio cleaned. Root lint/build/test passed (984 API, 370 Web, 114 extension); current desktop/mobile practice and browser-reference suites passed. Legacy file-reference suite still has a pre-submission obsolete UI assertion; see benchmark record.

## 2026-10-17 analysis status read latency

- [x] Consolidate status polling into a service-only statement snapshot; preserve 404 versus no-analysis null, owner/source access, deletion, expiry and local grant checks.
- [x] Return only current-sentence coarse evidence; keep raw private checkpoints out of the read response.
- [x] Test one-call behavior, comparison removal after revocation, local grant revalidation and SQL owner/deletion/source isolation; apply hosted migration.
- [x] Root lint/build/test pass (996 API, 370 Web, 114 extension).
- Timing evidence and scope: [result-query benchmark](design/benchmarks/result-query-20261017/README.md). Realtime, ASR tuning, streaming upload and asynchronous cloud storage remain separate work.

Result-query benchmark (2026-10-17): three alternating trials per mode with identical merged submission and prepared Reference. Median status request before preliminary output 0.828→0.272s; word feedback rendered 13.285→10.700s; preliminary curves rendered 14.089→12.017s from submission start. Read database round trips reduced from 3/5/7 to one. ASR remains the largest fast-path compute stage (5.665s median). Fixture rows/audio cleaned and hosted zero counts verified. Local browser harness scope and small-sample limits: [report](design/benchmarks/result-query-20261017/README.md).


## 2026-10-17 optional Reference for learner analysis

Reference preparation is optional. With server analysis enabled, a learner may record immediately without uploaded Reference audio; the Take freezes a null Reference identity and follows the existing word check, fast signal checkpoint, and fine learner alignment pipeline. It completes with learner measurements and no comparison score, without waiting for Reference. The unchanged below-60%, 60–<85% Sound-only, and >=85% all-layer gates still apply. Existing eligible References can be bound at recording start and use the paired flow. Active original-audio capture still blocks simultaneous microphone recording.

The UI describes optional Reference comparison and promotes completed learner-only fine results beyond the preliminary badge. Learner-only CWT tables omit the empty Reference column and determine uncertainty from learner evidence; absence of a comparison alone does not invalidate that evidence. Reference acquisition, quality checks, server-analysis preference and independent history-retention switch are unchanged. A Reference prepared after a null-reference Take is not retroactively attached in this increment. Existing backend nullable Reference support and worker completion are reused; no schema migration is required.

Verification: root lint/build/test passed (999 API, 370 Web, 114 extension). Reference-free practice browser regression passed at 1440px and 390px with synthetic microphone audio and fixture API results, including null-reference submissions, all matching tiers, preview-to-final display and history navigation. Worker regression verifies independent fast/fine completion without waiting or comparison scores; targeted service/worker tests passed 45 cases. These checks do not measure live inference accuracy or latency.

Paired Reference browser regression also passed at desktop/mobile: missing-Reference keyboard recording and cancel, original capture/upload, analysis retry without reacquisition, paired Take completion, independent retention preference, refresh and Reference deletion. Deletion now leaves new learner-only recording available.

2026-10-17 UI cleanup: remove the duplicate optional-Reference card above sentence practice. Reference preparation, status and retry remain in the existing upper Reference panel; sentence practice leads directly with the sentence and recording controls. Learner-only analysis and consent/retention settings are unchanged.

Duplicate Reference card removal verified: root lint/build/test pass; desktop/mobile browser Reference preparation, retry, recording, refresh and deletion regression passes. First browser attempt hit a page-navigation timeout during concurrent build; retry after build succeeded.

2026-10-17 presentation change: hide preliminary Rhythm/Melody curves and Preview badges in sentence practice. Word feedback remains immediate; eligible layers show a brief pending state until fine evidence is available. Failed/cancelled fine work shows unavailable rather than coarse fallback. Completed learner measurements remain viewable without a valid Reference. Fine layer presentation, background checkpoints, 60/85 gates, original acquisition and retention are unchanged. Earlier first-curve benchmarks describe the previous preview UI, not the current time to visible final layers.

Preview removal verified: root lint/build/test pass (371 Web; unchanged API 999 and extension 114 cached). Desktop/mobile practice browser regression passes at 1440/390px: coarse output renders only pending text and ellipsis badges, final results appear normally, matching gates/history/recording remain intact. Pending-layer screenshot inspected.

2026-10-17 final-layer benchmark after hiding Preview: three real 4.22s learner-only trials rendered full learner layers at 43.211/36.676/47.717s from submission start (median 43.211s), word checks at median 13.077s. Median after upload acknowledgment: 39.443s. Sampled MFA process interval 20.1–29.6s is the largest observed stage. Public audio, local CPU plus hosted Supabase, fixture auth/source and production render components; no inference accuracy/cloud performance claim. Duplicate old test workers removed before timing; fixtures cleaned afterward. [Evidence and limits](design/benchmarks/final-layers-20261017/README.md).


### 2026-10-17 Reference loading presentation cleanup

Remove the duplicate yellow preparation progress bar and amber preparation/analysis backgrounds in Shadow; keep the video playback progress indicator. Restore existing sentence References silently without a visible Checking state or analysis spinner. While availability is unresolved, show neutral Reference copy (or the existing extension-off/setup controls), then show the actual resolved status. Directory practice progress reports learner Takes and best word matches, not Reference availability; retain the cached background lookup and upload deduplication. Audio acquisition, recording availability and analysis gates are unchanged.

Validation: root lint/build and 371 web tests pass; desktop/mobile browser Reference recovery/upload regression passes. A focused browser run confirms transparent preparation background, no duplicate progress bar, retained video progress and cancellation pause. Root tests had 998 API passes and one CPU subprocess timing failure (missing PID file at the 0.3-second timeout); that exact test passed in isolation. The older full buffered-reference browser suite remains blocked by its pre-recording Rhythm-tab expectation, which conflicts with the current locked-layer UI; it was not counted as passing.

2026-10-17 Enable setup follow-up: show the setup spinner only during the extension handshake. Once armed and waiting for a toolbar click, stop the spinner, show “Click Libitu in Chrome’s toolbar”, and retain the setup instructions and Cancel action. The extension protocol, authorization and audio acquisition remain unchanged.

Enable follow-up verification: root lint/build/test passed (999 API, 371 Web, 114 extension tests). Desktop/mobile browser Reference regression holds the armed state before granting access and confirms no spinner, visible toolbar instructions and an enabled Cancel action, then completes upload and recovery.

Corpus detail v2 verification (2026-11-05): 44 targeted API tests, 513 Web unit tests, Web lint / TypeScript and production build passed. The new synthetic browser regression covers desktop guest and mobile account persistence plus Reader candidate detail: no eager Syntax, failure/retry, cached Syntax after reload, exact timestamp seek, safe follow-up rendering and explicit note persistence. Existing Corpus library mobile edit/filter/pagination regression passed. Screenshots under `output/playwright/corpus-detail-*-v2*.png` are local artifacts. The older Stage 1 all-in-one browser regression stops at playback-highlight restoration after visibilitychange (before detail); it is not claimed passed. Follow-up live sampling is recorded in design/benchmarks/corpus-detail-20261105/README.md; 46 focused API tests pass after its changes. Semantic consistency remains unaccepted and cost unmeasured.

2026-11-06 Shadow history compatibility: if subtitle regeneration changed a sentence ID, recover only a unique whitespace-normalized exact match to the recorded sentence text. Ambiguous or missing matches open the segment picker. Canonical navigation drops the recovery text.

2026-11-06 Corpus selection: Select all filtered results includes every matching record, including unloaded pages. Deselect filtered results removes only matching selections; hidden selections remain. Disable selection while search results are settling or corpus operations are pending. Existing delete confirmation and Stage 1 Saved synchronization apply.

2026-11-06 Corpus Loadout limit: the selection tray states a maximum of five total items including existing selections. More than five currently selected items disables Add to Loadout with an associated explanation; batch deletion stays unrestricted. Existing atomic merge validation still rejects a combined selection over five without truncation.


## Glossika vocabulary v4 — 2026-11-09

Completed: source symbol inventory, canonical normalization coverage repair and versioned v4 vocabularies. Next training must explicitly migrate/create the head and load the v4 contract; additional symbol coverage does not provide acoustic supervision. See `design/benchmarks/sound-glossika-20261108/vocab-v4/README.md`.


## Fresh IPA head v4 — 2026-11-09

Completed 549-row frozen-encoder training with random 117-token IPA heads, 3 seeds × 40 epochs. Same eight exposed regression recordings: base-unit error 32.68% versus previous full-data adaptation 31.48% and original 19.02%. Original model retained; no promotion. All 562 original outputs unchanged, external manifests identical and checkpoints reload-verified. See `design/benchmarks/sound-glossika-20261108/IPA-FRESH-V4.md`.


## IPA diagnostic v5 — 2026-11-09

Completed compatible-character localization (80 outputs, 1,434 differences; all acoustic verdicts pending), a source-track-held-out 499/50 split, and three fresh-v4-head 40-epoch trajectories. Validation-only selection chose epochs 40/40/38; selected and final external base-unit error both 31.80%. No demonstrated early-stopping benefit in this setup. Original model preserved; external scoring performed after selection release. Five external development recordings packaged for narrow Glossika review, still pending and excluded from selection. Speaker separation and new blind labels are not established. See `design/benchmarks/sound-glossika-20261108/IPA-DIAGNOSTIC-V5.md`.


## IPA listening page — 2026-11-09

Implemented loopback listening UI at localhost:8775 for the five pending external development recordings: playback/speed, exact IPA entry, uncertainty selections with source snapshots and manual playback anchors, browser autosave plus revision-checked atomic disk saves, JSON export and server download fallback. Existing labels/training remain unchanged; review completion is still pending. Backend and real Chromium desktop/mobile-viewport checks passed using a separate QA pack. See `design/benchmarks/sound-glossika-20261108/IPA-LISTENING-PAGE.md`.


## Reviewed external IPA intake v6 — 2026-11-09

Ingested all five completed local listening labels (revision 29). User explicitly confirmed take-a tie as linking metadata, drank r as ɹ, and both vacation final n as syllabic ṇ. Raw browser/disk review preserved; adjudicated development-only labels and audio hashes frozen separately. Re-evaluated existing models and 120 v5 checkpoints with a declared stress-excluding compatible selection score. Selected epochs 8/14/9: old eight-recording literal CER 48.01% vs final 51.80%, but base-unit error 36.72% vs 31.80%. No promotion, no optimizer updates; label-style and base-segment tradeoff remains unresolved. See `design/benchmarks/sound-glossika-20261108/IPA-REVIEW-V6.md`.


## Matched-label notation control v7 — 2026-11-09

Completed 362/97/90 source-group train/validation/test split from 549 Glossika clips; duplicate text/PCM links union source groups. Two label arms × three seeds × exactly 3,160 updates, identical paired initialization/batches/vocab/settings. Of 50 existing human-confirmed pairs, 26 differ literally and zero differ under explicit compatible notation; this is NOT a genuine acoustic-label repair experiment. Fixed-budget held-out compatible CER: book 31.13%, human-confirmed 30.89%; base-unit error 15.78% vs 15.54%. Small mean change, inconsistent seed direction, no stable benefit established. Test clips were used in older experiments; speaker-disjointness unknown. No further user annotation requested, no model promotion. See `design/benchmarks/sound-glossika-20261108/IPA-PAIRED-LABELS-V7.md`.


## Full IPA / Sound implementation plan — 2026-11-09

- [x] Produce source-grounded complete technical plan covering phone recognition and all 12 sound-event classes, data/annotation strategy, training and deployment. See `design/docs/SOUND_IPA_ACOUSTIC_MODEL_IMPLEMENTATION_PLAN.md`.
- [ ] D1/D2: obtain and audit professional labeled corpora; create speaker/session-aware frozen splits and new sealed evaluation.
- [ ] M1–M4: structured phone/attribute model, controlled partial unfreezing, three initial event subtypes then all 12 kinds with per-subtype evidence gates.
- [ ] I1/I2/O1: versioned evidence API, worker integration, dual-voice UI acceptance and measured deployment/rollback.

These are planned work packages; existing pilot runs do not satisfy their production gates.
