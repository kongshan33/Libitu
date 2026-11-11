# Understand the Libitu project

## Speech research P2 dictionary control completed — 2026-11-11

The paired E0b run changes only MFA dictionary coverage on the same nine complete recordings. It adds 109 compatible CMU words / 114 variants, preserves original dictionary entries and every input waveform, and reruns all four frozen encoders with the same heads and thresholds. Complete-chain F1 means rise from 22.22% to 71.43% (raw Wav2Vec2 Large), 74.29% (WavLM Base+), 77.14% (WavLM Large), and 71.43% (Whisper Small). A control classifications are unchanged; 252 offline research tests pass. Both sealed runs and 1,044 new predictions are retained; no training or API integration occurred.

Timing remains the limiting gate: joint correct-label/100ms F1 is only 40.95–42.86%. Buckeye target-center median error is 1.92 seconds, versus 6.8ms for these TIMIT examples. The cleaned Buckeye transcript has long intervals without listed words; whether it covers the complete recording remains unverified. P2 is still incomplete. Recover professional source metadata or validate automatic localization before expanding the 739-recording pool; keep 26 unexposed TIMIT speakers reserved. These 10 reference opportunities cannot rank backbones. [Paired report](/Users/river/Documents/speech-phenomena/reports/e0b-lexicon-pair.md).

## Speech research P2 first complete-recording diagnostic — 2026-11-11

The independent research repository completed the exposure audit and a fixed nine-recording E0b smoke on raw Wav2Vec2 Large, WavLM Base+/Large and Whisper Small, using all three original frozen heads and thresholds with zero training updates. A/B/C/D results, 444 predictions, source/code snapshots, errors and local compute budget are preserved in `speech-phenomena-store/runs/e0b-dev-v3-20261111`. All 248 research tests pass with Libitu reads blocked and empty data roots.

All 34 Buckeye speakers and 604/630 TIMIT speakers already have local event-experiment exposure; reserve the remaining 26 TIMIT speakers. Automatic candidates cover all 10 conservative reference opportunities in this smoke, but whole-recording rejection from MFA dictionary gaps (`tv's`, `coauthors`) removes 7/8 positive opportunities. All four complete-chain F1 means are 22.22%; this is a shared pipeline failure diagnosis, not evidence for backbone ranking. Expanded P2 remains incomplete: repair dictionary coverage under a new run, then repeat the fixed recordings before expanding the 739-recording development pool. No business API behavior changed. [Report](/Users/river/Documents/speech-phenomena/reports/e0b-first-pass.md).

## Speech research separated — 2026-11-11

P0/P1 of the accepted Speech Phenomena plan are complete locally. Active research is now `/Users/river/Documents/speech-phenomena` (independent Git/Python package/environment/tests); resource snapshots and original code are preserved under `/Users/river/Documents/speech-phenomena-store`. Removed 52 historical Python modules and 21 research test files from API ownership after hash verification; the old scripts directory contains a pointer only. Business Sound, ASR/MFA/worker behavior and original `.cache/sound-pilot` data are unchanged.

Verified 231 independent research tests at migration, including a run with old-checkout reads forbidden and empty data roots; 84 frozen metric rows/25,200 predictions reproduced; 42 reloaded heads give identical probabilities; six encoders pass two-real-clip feature checks with zero real-data optimizer updates. Root lint/build/test passed at migration (API 1,996; Web 540 and Extension 124 via valid cache). Preservation includes 22,497 files plus 29 public-seed resources and 7 remapped links; same-disk copies are not an independent-media backup. Git initialized, not committed or published. The P2 increment is described above; new training/MLflow/serving remain future work. [Acceptance report](/Users/river/Documents/speech-phenomena/docs/migration/REPORT.md).

## Supplemental event encoders — 2026-11-10

Whisper padding repair (2026-11-10): the common `padding=True` call produced 100 mel frames instead of the required 3,000. The Whisper-only adapter now explicitly zero-pads the waveform to the native 480,000-sample input before log-mel extraction, preserving the declared 30-second protocol and the first-50-frame readout. Four padding regressions plus 19 event tests pass. A real training clip passes the pinned encoder with `[1,80,3000]` input, all 13 finite `[1,50,768]` hidden states and finite classification-head gradients (zero optimizer updates). Resumed the supplement from existing data2vec artifacts; Whisper scores subsequently completed; see the verified supplement below and the independent research baseline report. Evidence: `.cache/sound-pilot/events-extra-v3-20261110/PADDING-FIX-PREFLIGHT.json`.

User-authorized supplement: pinned `openai/whisper-small` encoder (supervised ASR/translation) and `facebook/data2vec-audio-large` (raw self-supervised, not `-960h`). Implemented isolated runner `event_extra_probe.py`; queued after the active raw-Wav2Vec2 run to avoid CPU/RAM contention. Same immutable 1,600/600/600 split, five depths, three seeds and fixed probe budget. Whisper retains native 30-second zero padding and uses only the first 50 encoder frames; frame-center bookkeeping is not a physical receptive-field claim. No decoder or transcript prompt. Existing test exposure is disclosed. Supplement completed: pure-audio mean F1 is data2vec 82.85%/94.55% and Whisper 87.76%/94.80% (Buckeye/TIMIT), on the same exposed regression test; not end-to-end quality. Artifacts: `.cache/sound-pilot/events-extra-v3-20261110/`.

## Source-labeled flap benchmark preparation — 2026-11-10

Prepared a separate Buckeye/TIMIT event experiment without new user annotation. Pinned research mirrors contain 6,554 decoded records; 37 identical Buckeye duplicates are removed, one invalid audio/label-tail record quarantined. Buckeye covers 34 speakers and has 62.5 ms quantized timestamps; TIMIT's official sample matches both phone intervals and PCM. The frozen first comparison has 1,600 train / 600 development / 600 test candidate windows with speaker isolation and TIMIT official-test preservation. Conservative source-phone/lexicon mappings separately inventory flap, n-place assimilation and yod coalescence, retaining unknowns. Four frozen-encoder probe execution, test release, text-only control and automatic reports are implemented; the frozen-probe training/test runs have completed; see the immutable reports and the independent baseline index. No online Sound change or IPA-head replacement. See [data and run report](design/benchmarks/sound-events-20261109/REPORT.md).

## Full Glossika preparation v1 — 2026-11-09

All 145 tracks / 68.69 decoded minutes are accounted for and retained in a frozen data package. Exported 661 complete-IPA and 2,075 partial-IPA samples (40.63 clip minutes / 39.64 minutes of unique source coverage), plus 73 text-only auxiliary samples; 383 technical holds remain. The original 549 short-sentence clips are unchanged and 21 prior holds are recovered. Complete labels use CTC; partial phone/ending labels use a tested CTC sequence-presence objective that leaves other phones unknown. The 120-token vocabulary preserves the previous 117 IDs. All 2,736 training rows pass source-frame and label validation; seven real-audio gradient checks and 14 focused tests pass. Root lint/build/test pass (2,192 API tests). No optimizer updates or accuracy claim; SAA remains separate. Professional source labels require no repeated user listening. Remaining association issues, incomplete standalone-phone segmentation and external evaluation are explicit. See [data report and interfaces](design/benchmarks/sound-glossika-20261108/FULL-CORPUS-V1.md).

## Speech Accent Archive intake audit — 2026-11-09

Downloaded and hash-verified the complete pinned 1,242-row SAA research snapshot (9.862 hours). All audio decodes; 67 retrieved official transcriptions match the snapshot, and 21 sampled recordings match official audio. Narrow marks are plentiful, but only 13 complete labels encode under the 117-entry Glossika v4 vocabulary; 66 of 79 source inventory entries occur, with notation differences and 50 rows queued for character review. No independent acoustic IPA adjudication or training was performed. The corpus is a conditional supplemental-training candidate, with fixed-text, accent and noncommercial-license limits. See [audit and local review pack](design/benchmarks/sound-saa-20261109/REPORT.md).

## IPA adaptation diagnosis — 2026-11-09

A read-only audit localizes the 549-row model's regression to its updated output head, with encoder weights unchanged. On the eight exposed recordings, deterministic base-unit alignment gains 8 reference matches and loses 47, with insertions reduced by 1 (58 → 96 errors). Masking new token rows leaves 33.44% error; restoring the original 392 rows while retaining trained new rows returns to 18.69% (a one-unit notation/projection effect, not an improved model claim). The training labels lack several original phone symbols and heavily use Glossika modifiers; training budgets and utterance lengths also differ. Counts of emitted tap/glottal/modifier symbols are label diagnostics, not acoustic-event accuracy. All original inputs/checkpoints are preserved; no further training or online change. See [diagnosis and evidence](design/benchmarks/sound-glossika-20261108/IPA-ADAPTATION-DIAGNOSIS.md).

## Original Wav2Vec2 IPA-head adaptation completed — 2026-11-09

Completed six supervised runs from the pinned pretrained IPA head (50 reviewed / 549 full book-supervised rows, three seeds each, 40 fixed epochs, encoder frozen). Preserved all 392 original token IDs/weight rows at initialization and added 24 literal-label characters. Original model hashes and all 562 baseline predictions remain unchanged; all six trained heads reload exactly. On the eight previously exposed independent regression recordings, base IPA-unit error changes from 19.02% to 19.67% (50-row arm) / 31.48% (549-row arm); compatible CER changes from 26.99% to 27.46% / 48.86%. This run does not improve external performance despite better training fit. Its frozen scoring projection differs from the previous probe's segment metric; broad/narrow label-style mismatches remain explicit. No new blind labels, encoder updates, event heads or online model replacement. Lint/build pass; the full test retry after training passes 2,171 API tests (the first concurrent run hit an existing timing-sensitive heartbeat assertion). See [results, artifacts and limits](design/benchmarks/sound-glossika-20261108/IPA-ADAPTATION-V1.md).

## Completed four-encoder IPA representation pilot — 2026-11-09

The current IPA-only experiment completed all 60 fresh linear CTC probes: four frozen encoders, five depths, three seeds, identical 40-epoch budgets on 549 Glossika clips (490.55 seconds). Five eligible development recordings selected the layers; all selections were sealed before scoring eight independent project test recordings. Mean test base-segment error is 39.69% for Wav2Vec2Phoneme, 59.54% for WavLM Large, 63.60% for WavLM Base+ and 84.32% for HuBERT Large. Every seed's raw before/after IPA, checkpoints, losses, training fit and test metrics are retained. “Before” is a fresh random head, not the original pretrained decoder; encoders received zero updates. Wav2Vec2Phoneme's prior phonetic supervision, single-annotator small test and notation mismatch limit interpretation. The eight test recordings and seven sentence groups are registered as exposed. Root lint/build/test pass (2,161 API tests). See [results and protocol](design/benchmarks/sound-encoder-eval-20261109/IPA-PROBE-V3.md). Earlier preflight statements below are historical; online Sound detection and event supervision remain unchanged.

## Glossika literal-notation training export — 2026-11-09

The user's latest instruction makes Glossika source notation the output authority. A new `glossika-literal-v3` package preserves `⁼`, `ṇ`, legacy affricate ligatures, rhotic/offglide modifiers and combining marks; old v2 mappings and experiments remain unchanged. The 588 short sentences yield 549 training rows (50 previously reviewed audio/text pairs plus 499 book-supervised automatic associations), 490.54625 seconds, and a 62-entry CTC vocabulary. Thirty-nine ambiguous/multivariant/optional-segment rows are held separately. All training audio/label hashes and CTC lengths pass validation; six real examples pass loss/backward preflights on Wav2Vec2Phoneme, WavLM Base+, WavLM Large and HuBERT Large with zero optimizer steps. This is a new data version, not an expanded frozen evaluation, trained model or event supervision. The 8773 review pack is untouched. See [data format and scope](design/benchmarks/sound-glossika-20261108/DATASET-V3.md).

## Unified Sound encoder evaluation and held-out review pack — 2026-11-09

Wav2Vec2Phoneme, WavLM Base+, WavLM Large and HuBERT Large now have pinned local adapters, a shared fresh CTC-head protocol, five-layer feature caches for the same 49 train + 12 development clips, and real-audio backward preflights with zero encoder/optimizer updates. A separate 36-recording blind review page is running at `http://127.0.0.1:8773/`: 12 development recordings and 24 reserved CLB/RMS test recordings, with source/text/PCM isolation, durable autosave and checked export/import. No test features, trained new probe, accuracy ranking or online detector exists. Single-person labels, unknown upstream pretraining overlap and unverified Glossika speaker identity remain explicit. IPA development selection and sealed test scoring commands are implemented; localized event training and sufficient manual phone/ABX coverage remain pending. See [implementation and annotation guide](design/benchmarks/sound-encoder-eval-20261109/README.md).

## First Wav2Vec2 head-only fine-tuning run — 2026-11-08

Completed the user's requested experiment on all 49 reviewed Glossika candidates (46.73 seconds): frozen encoder, 408,975 output-head parameters, 40 epochs / 280 AdamW updates, final fixed checkpoint. Training-set literal character difference falls from 39.85% to 18.63% (655 reference characters), with 46 improved / 3 unchanged rows and 5 exact sequences. Twelve existing external development clips were decoded only after optimization; outputs show potential regression and have no complete IPA gold, so no external accuracy or production improvement is claimed. Original model/input hashes remain unchanged; all 61 original baseline outputs were reproduced and the saved trained head was reloaded exactly. A local playback page is available at `http://127.0.0.1:8772/`. See [experiment report](design/benchmarks/sound-glossika-20261108/FIRST-FINETUNE.md). Earlier zero-update statements below describe the preceding preflight stage.

## IPA reference and Glossika notation v2 — 2026-11-08

The user's official IPA chart now supplies a pinned 188-entry reference catalog, with main-chart, supplementary, extIPA and placement-variant scopes kept distinct. Source-specific Glossika notation maps unaspirated `⁼` to `˭`, preserves `ʴ` / `ʱ` and vowel offglides, and retains raw reviews. Eight notation holds are resolved: 49 CTC candidates remain in development, with sentence 23 still held for compound-affricate review. A new 392→399 vocabulary candidate preserves the original IDs; seven real-clip CTC backward checks pass with zero optimizer steps, and baseline models and metrics are unchanged. Root lint/build/test pass (2,088 API tests). This is label/encoding preparation, not a trained detector or accuracy gain. See [IPA inventory and mappings](design/benchmarks/sound-glossika-20261108/IPA-INVENTORY.md).

## Glossika reviewed intake and pretraining baselines — 2026-11-08

The user completed all 50 first-batch sentence reviews. A final source-bound snapshot is archived unchanged; the four initially incomplete fields were explicitly clarified and the newer saved draft already contains all confirmations. Materialized audio totals 47.756 seconds. There are 41 experimental CTC candidates and 9 notation holds, plus 15 unlocalized human event observations (not event-training labels).

Wav2Vec2Phoneme, ZIPA small and the newly pinned FP32 ZIPA large each completed all 50 originals. Literal IPA character differences are diagnostic only, not PER or accuracy. Wav2Vec2 decoded 17 tap symbols across the clips, both ZIPA variants zero, against 23 in the reviewed labels; these are unlocalized counts. A vocabulary-extension preflight preserves all 392 original Wav2Vec2 entries and head rows, adds 5 symbols, and passes frozen-encoder CTC backward checks with zero optimizer steps. No trained model or independent-test result exists. See [intake and baseline report](design/benchmarks/sound-glossika-20261108/REVIEWED-BASELINE.md).

## Glossika first review batch — 2026-11-08

Prepared all 588 sentence records with reversible IPA normalization candidates and a separate repair queue. The first track now has 50 padded 16 kHz mono sentence candidates, excluding its spoken title; independent local ASR supplies content-check clues. A loopback review page supports boundary/text/IPA review, optional 12-category event records, browser drafts, versioned disk backups and identity-checked export/import. All recordings remain unverified, with zero training-ready rows. Collection-level grouping prevents random within-source test splits. See [batch report](design/benchmarks/sound-glossika-20261108/BATCH-ONE.md).

The current experiment order is shared reviewed data, Wav2Vec2Phoneme IPA SFT, WavLM Base+ frozen-encoder event heads for the three bounded subtypes, and ZIPA large baseline comparison. These experiments are pending, not a claim that any model has won or that fine-tuning is already necessary. This supersedes the initial ZIPA-only adaptation recommendation below.

## Four-model listening comparison — 2026-11-08

Four local baselines completed the same 12 full original recordings (48 outputs). A standalone playback/comparison page exposes raw phones, attributes, hashes and versions; Azure remains unconfigured by user choice. No accuracy or detector claim. See [report](design/benchmarks/sound-model-pilot-20261107/MODEL-COMPARISON.md).

## Glossika training preparation and round-two review — 2026-11-08

The user submitted all 12 second-round target judgments: 8 present / 4 absent, with valid frozen identities and no crop issues. The original export is archived unchanged; this is same-person refinement, not independent gold or model accuracy. See [results](design/benchmarks/sound-model-pilot-20261107/ROUND-TWO-RESULTS.md).

The user explicitly permits training on their supplied Glossika materials. Current source inspection covers 145 MP3s (68.61 container minutes), a 100-page PDF and 588 indexed short-sentence entries. Raw book IPA, recording-specific labels and Sound events remain separate. Extraction damage, notation compatibility, a printed incorrect-pronunciation example and one MP3 decoder warning are recorded. No sentence alignment, acoustic labels, training run or online detector was completed by this inspection. See [dataset and fine-tuning plan](design/benchmarks/sound-glossika-20261108/PLAN.md); retain ZIPA primary / Allophant comparator and the three initial event subtypes while collecting data for all 12 product categories.

## Offline Sound model pilot A+B — 2026-11-07

The user requested another listening round. A separate 12-target pack now contains the original `letter`, `And you`, and `etc.` recordings plus 9 additional licensed human recordings, with four contexts per pilot category. Ten padded playback excerpts use cross-checked corpus autolabelling; two learner clips retain their complete short utterance. Every item preserves full-original playback, carries frozen source/target identity and starts without a human verdict. Draft export and copyable JSON backups are available. This is same-person target refinement, not an independent second annotator or detector evaluation. See [round-two pack](design/benchmarks/sound-model-pilot-20261107/ROUND-TWO.md).

The user authorized an isolated ZIPA / Allophant comparison for coalescence, nasal place assimilation and word-internal T/D taps. Both models ran on the public 16-clip seed. The user's first pass has been recovered and clarified: 7 positive observations (1 single-word, 6 multiword), 41 whole-clip absence screenings, and 2 pending rows. The clip-09 span was corrected only after explicit user confirmation; original entries remain immutable. Whole-clip absence is not an event negative. A reproducible audit verifies source identity and every saved CTC head: neither run decoded a tap phone in any of the 16 clips, and Allophant's tap head decoded no positive. This is a diagnostic finding, not event accuracy or a universal model capability claim. Draft export no longer blocks on incomplete labels. Human adjudication, target localization, missing category coverage and individual detector evaluation remain pending; no online worker/UI/scoring integration is included. See [first-pass findings](design/benchmarks/sound-model-pilot-20261107/FIRST-PASS.md). This authorizes offline research following the earlier presentation-only deferral, not completion of M4b.

## Sound density and filtering — 2026-11-07

`All` now keeps at most two distinct category labels per word; a separate native `+N` button toggles the full category list in the existing explanation card. All candidate events remain in the explanations. Detailed and Review share this behavior. Nonmatching inline marks and linking arcs stay at 20% opacity even while hovered, focused or expanded; source words, status and explanation content remain readable. The user explicitly deferred audio phenomenon detection and evidence integration. See [verification](design/benchmarks/stage-two-ga-sound-20261107/DENSITY.md).

## Sound Reading cues v3 — 2026-11-07

Stage 2 Sound now follows the supplied html-2 prototype and updated v2.1 design specification, with the user’s two explicit corrections: all Linking controls share the filter’s lower `‿` arc and open the exact boundary explanation; Vowel length is a conditional shorter/longer learning cue before word-final voiceless/voiced obstruents, not a duration measurement. Reference reading cues and Your voice practice targets are shown in separate rows in Detailed and Review, with solid category marks, shared counts, Elision subfilters, Inter typography and seven-row explanations. Both rows are text/dictionary candidates, not verified audio realizations. Concealed words retain their native text width; revealing either row synchronizes the same word in both. The v3 dictionary contract retains v1/v2 decoding and saved acoustic adapters. See [current acceptance](design/benchmarks/stage-two-ga-sound-20261107/PAIRED-CUES.md). This supersedes the Sound presentation and vowel-display claims in the two earlier entries below.

## Sound visual alignment — 2026-11-07

Sound now follows the supplied `Stage 2 · Detailed (three-layer analysis)-html-1` prototype: natural-width word flow, plain uppercase group labels, compact cues, word-boundary arcs and surface-backed reading details. Inactive filter descriptions no longer reserve blank space. The 12-category GA content, subtype selection, evidence, concealment, measurements and media/history behavior are unchanged. The existing shared neutral palette and mobile touch targets remain in use. See [visual acceptance](design/benchmarks/stage-two-ga-sound-20261107/STYLE.md).

## GA Sound delivered — 2026-11-07

Stage 2 now targets General American with 12 grouped Sound filters, constrained subtypes, conditional v2 dictionary rules and shared Detailed/Review explanations. Reference and learner reading cues are explicitly unconfirmed; per-vowel measurements and legacy word totals have separate displays. Concealment covers the selected sentence's matching results and directory copy. Historical evidence remains take-bound, with no reanalysis or scoring change. P1–P5 are complete; [delivery evidence](design/benchmarks/stage-two-ga-sound-20261107/REPORT.md) records root checks and 1400px/390px browser acceptance. The [execution contract](design/docs/STAGE_TWO_GA_SOUND_PLAN.md) remains the scope reference. Validated acoustic realization detectors remain separate M4b work.

## Text quality and completeness — 2026-11-06

Stage 4 now reviews server-generated occurrence IDs; Stages 4/5 share exact-span,
bounded variant and structure grounding. Stage 5 uses fixed dimension/criterion
keys, frozen evidence IDs, local validation and at most one bounded repair.
DeepSeek strict function output is enabled by default; duplicate/ambiguous data
still fails local checks. Stage 1's logic-node string shape is explicit in its
prompt. Public reports, saved results, voice and assistance attribution retain
their existing contracts.

The same 30 authored cases repeated three times improved from 77/90 to 90/90
expected outcomes: teaching 62/72 → 72/72; complete provider assessment structures
10/15 → 15/15. Mean live teaching latency was 1.156s → 1.013s and assessment latency
5.584s → 4.195s. This is sampled adapter verification, not learner/production
acceptance. A fresh DeepSeek all-stage check passed 12/12; Doubao comparison is
blocked by HTTP 403 AccountOverdueError. See [full evidence and limits](design/benchmarks/text-quality-20261106/COMPARISON.md).

## Mission partner orb — 2026-11-07

The Voice orb now follows the inspected ElevenLabs homepage material: a locally served blue/green texture, sphere projection, four-octave FBM, simplex displacement and separate stationary overlay grain. The ambient clock runs at the reference 1.4 time scale; the circular silhouette stays fixed. A 128px velocity/pressure field and 512px dye field add audio-driven surface advection (three pressure iterations, .98 dissipation and 1.2 blur); unsupported half-float devices retain the noise-driven renderer. Actual playback and the existing authorized microphone supply low/mid/high FFT bands plus a visual RMS envelope, with 28ms attack / 160ms release. RMS noise floor remains .0015 and full scale .12; this never changes audio gain. Input feedback starts before server VAD. There is no animation pause button: ambient motion starts on entry and continues while offline or the call is paused. OS reduced motion, hidden tabs and offscreen content stop rendering. Use at least 2x supersampling, at most 60fps / 1024px; WebGL failure uses a static fallback. Assets and source provenance are in apps/web/public/orb/README.md. The lower-edge call button, mute control and conversation behavior remain unchanged. Exact live-call frame identity is not claimed because audio and accumulated interaction history differ.


## Text provider switch — 2026-11-06

Stage 1 extraction, Mission planning/teaching/help and Stage 5 assessment now select `TEXT_ANALYSIS_PROVIDER=deepseek` with `DEEPSEEK_MODEL=deepseek-flash` by default. The local ignored environment uses that selection and the existing DeepSeek credential. `ark` remains an explicit comparison/rollback option; missing credentials never fall back to the other provider. Corpus retains its independent switch, now also defaulting to DeepSeek. Existing `ARK_*` timeout/retry/input/output budgets remain shared for deployment compatibility. OpenAI Realtime voice and TTS retain their independent settings. Saved results are not regenerated.

Two alternating live rounds used authored input through the actual adapters, with unchanged prompts and validators. DeepSeek was faster in these samples, but teaching misclassified an exact phrase as a variant in both rounds, and Stage 5 produced incomplete reports for both providers. This is a local provider switch and sampled comparison, not broad teaching acceptance or production deployment. See [inputs, results, timings and limitations](design/benchmarks/text-providers-20261106/COMPARISON.md). Root lint/build/test pass (1,913 API tests); the development stack was restarted and queue readiness reports `deepseek-flash`.

## Neutral interface palette — 2026-11-06

Replace the warm UI gray ramp with neutral shared tokens: ink #0C0C0C, hover #262626, links #404040, descriptions #525252, muted text #6B6B6B, strong borders #D4D4D4, lines #E5E5E5, soft surfaces #EDEDED, cards #FAFAFA and video/dark inset #191919. Practice, Loadout, Mission, reports, skeletons, playback controls and dialog backdrops now inherit or reference these tokens instead of copied warm palettes or literals. The reference Rhythm envelope uses the shared soft gray. Sound phenomenon colors and status/brand palettes remain independent; saved content, layout and interactions are unchanged. The extension's existing gray UI already has equal RGB channels.

## Corpus scenario groups and neutral options — 2026-11-06

Library Scenario options and matching share a bounded English taxonomy: Work, Everyday, Discussions, Presentations, Interviews, Storytelling and Writing. Only groups present in the collection appear; Other keeps records without a recognized setting reachable. Known Chinese/English aliases merge, while register/function labels alone do not imply a setting. Saved metadata is unchanged. The Source group is collapsed by default. Option groups use the reference page's measured #EDEDED background and white selected states; text uses neutral #616161, and forced-colors selection retains an outline.

## Unified Corpus filter panel — 2026-11-06

Corpus library now groups the six existing facets into one Filters popover, following the supplied ElevenLabs Voice Library reference: neutral rounded controls, left-hand labels, gray option groups and white selected options. Selections apply immediately; Any clears one dimension, Clear all filters clears facets while preserving search, and the toolbar Clear all resets search/facets within the active tab. The trigger counts selected values. Multi-select OR/AND rules, sorting, selection and pagination remain unchanged. The panel uses native nonmodal popover dismissal with a manual fallback, viewport-clamped positioning, bounded scrolling, 44px narrow/coarse controls and reduced-motion support.

## Single input focus boundary — 2026-11-06

Text inputs, textareas and native selects use one inset black focus boundary without a shadow or layout shift. Composite Corpus search, follow-up prompts and Landing URL entry delegate focus paint to their outer group, suppressing the inner outline. Checkbox/radio/range/file controls and button focus behavior remain unchanged.

## Unified interface typeface — 2026-11-06

Replace the Geist Mono/system monospace stack with the existing locally bundled Inter UI typeface across metadata, corpus patterns, timestamps and analysis labels. Keep the legacy font token as an alias and remove direct feature-level monospace overrides. Font sizes, weights and content remain unchanged.

## Corpus deletion — 2026-11-06

Library selection supports confirmed batch deletion, including counts of selected items hidden by filters. Detail exposes Delete beside Edit item in the bottom action group with the same native confirmation. Successful removals notify mounted corpus consumers and other tabs to refresh Stage 1 Saved; failures retain remaining selections. Account changes stop the batch. Deletion affects personal corpus only, preserves source and old practice snapshots, and does not offer undo.

## Shadow history navigation — 2026-11-06

Shadow history links now open Stage 2 at the recorded sentence. The workspace resolves its segment from the current blueprint before mounting Shadow; missing historical sentences open the segment picker. Original video links still open Stage 1.

## Corpus kind routing and saved notes — 2026-11-06

Changing Add to corpus kind now invalidates the previous Syntax and cancels its request. An open Syntax tab regenerates immediately; Explain keeps generation lazy. The view preserves Explain, the active tab, follow-up history and note/question drafts. Saved kind also controls Reader and Corpus library detail, including a card saved before Syntax completes. Reader thumbnails show at most two lines of a bounded plain-text note preview; Reader and Library details share the complete escaped Markdown My note section. Existing note storage and source evidence are unchanged.

## Corpus detail v3 and prompt comparison — 2026-11-06

Corpus detail, Add to corpus and Library retain 16px section spacing and Use it before Meaning. V3 adds a normalized learning expression, meaning summary, generated question suggestions, Syntax summaries and phrase translations. Original source wording remains evidence; learning titles, pronunciation and audio use the normalized expression. Existing cards upgrade on explicit refresh; custom names/templates survive. Native modal dismissal restores focus; suggestions fill/toggle before explicit send; note actions acknowledge success in place. A pinned local dictionary checks provable redundant inflectional IPA suffixes; narrow JSON recovery and conservative comparison/translation omission handle observed provider failures.

The final 32 real DeepSeek Flash comparison calls averaged Explain 3.684s → 4.102s and Syntax 2.335s → 2.712s. Two streamed follow-ups started in 0.758s / 0.774s. This improves sampled completeness/consistency at a small latency cost, not universal teaching correctness. See [methods, failures, limits and artifacts](design/benchmarks/corpus-detail-20261106/COMPARISON.md).

## Extension store preparation — 2026-11-06

[CHROMEWEBSTORE.md](apps/extension/CHROMEWEBSTORE.md) now records every manifest permission, data flows/retention, listing and privacy drafts, and pending publisher/email/domain (owner specified 待定). [Acceptance](design/docs/extension-release/ACCEPTANCE.md) records 124 passing unit tests, extension lint/build, and real unpacked Chrome entry/fresh-caption/no-capture workspace fixture passes. Native toolbar → tabCapture → PCM passed on retry: actual native UI clicks produced a 0.4-second WAV with RMS 0.106066, retained ownership across same-content paths and released offscreen/capture on reload. Earlier shortcut/UI failures are historical; synthetic identity/test-tone coverage does not prove live YouTube or production behavior. The harness offers manual native-action mode without injecting shortcut commands, waits for native Enable audio before arming, accepts enabled followed by coverage, and waits for a fully covered extraction interval. No store submission or production readiness claim. Integrated Web server analysis is separate from extension capture and defaults on unless disabled; its uploads and 30-day reference expiry must be disclosed.

## Activity metric switching — 2026-11-06

Learning activity replaces its total and chart in place when switching metrics. Duplicate sibling React keys were removed; the shared interruptible opacity animation preserves the chart nodes and respects reduced motion. Date-range loading still retains the previous data until the new response arrives.

## Extension bridge context invalidation — 2026-11-05

The buffered-audio bridge now normalizes synchronous runtime invalidation (for example after extension reload) and rejected message promises into the existing connection-lost response. Probe/session/extraction state is released; pagehide cleanup also tolerates an invalidated extension. Existing pages must still be refreshed after reloading the extension to install the new bridge.

## Extension language retry and handoff retention — 2026-11-05

Language checks share only in-flight work; an explicit toolbar retry re-reads metadata after an unknown/failed result instead of retaining that result for the worker lifetime. English-only gating is unchanged. Caption handoffs remain readable for 15 minutes, with serialized cleanup on access, worker startup, a one-minute Chrome alarm, and import-tab closure. Closing a source before import creation cancels its pending handoff; closing it after creation preserves delivery to the import tab. Handoffs are capped at 16 records and 4 MiB of UTF-8 serialized keys/values, evicting oldest records first; this is an application budget, not Chrome's internal memory measurement. Deleted records cannot be resurrected by a late capture. Oversized data/storage failures produce retry guidance. The new `alarms` permission is solely for retention cleanup; browser sleep can delay deletion until wake, but expired reads remain rejected.

## Neutral retry notices — 2026-11-05

Recoverable-error panels share a neutral surface, gray border and dark gray copy across Loadout, Corpus, learning history, reports and practice. Use 16px padding and vertical margins, 12px action gaps and shared button geometry. Error/alert semantics and retry handlers are preserved; destructive confirmations keep their existing treatment. Audio-save failures use the same neutral palette.


## Stable asynchronous feedback — 2026-11-05

Routine UI feedback shares a 600ms reveal threshold. Shared buttons disable and report busy immediately while retaining their idle label/geometry; only sustained operations show the loading overlay. Inline save/update notices reserve a small stable slot; floating practice-save/upload notices delay normal progress but surface errors immediately. Loadout draft saving uses the same helper. Request cancellation, persistence, unload protection, microphone permissions and recording countdowns remain immediate.

History pagination retains existing rows without appending temporary skeletons. Filter changes retain the previous list while awaiting replacement, reset pagination and reject aborted responses. Activity range changes retain the existing chart and its actual date caption until replacement arrives. Initial loads still use structural skeletons. Shadow takes avoid flashing an empty result before the selected sentence's history resolves. Extension caption-opening progress follows the same 600ms rule without delaying its request.

Mission hints use the same reveal threshold while retaining current help until the replacement arrives. Target buttons own their progress, without a duplicate footer notice; legacy hint actions stay in place while pending. Hint visibility receipts, stale-result fencing and recording states are preserved.


## Quiet Loadout draft saves — 2026-11-05

Shuffle and other local draft edits no longer flash a save message. A compact status appears only after 600ms of pending persistence and stays outside document flow on mobile and desktop. Draft storage, unload protection and actionable save errors are unchanged.

## Corpus detail spacing and pronunciation — 2026-11-05

Shared detail sections now use 16px vertical padding (previously 24px), 8px heading gaps and tighter slot/comparison rows. Pronunciation Play sits beside its heading, independently of IPA/stress wrapping, across Reader detail, Add to corpus and Corpus library. Pronunciation now calls the server-only OpenAI Realtime read-aloud adapter with `gpt-realtime-2.1-mini` / `marin` and the existing `OPENAI_API_KEY`. The request is limited to 800 characters, 45 seconds and 60 seconds of 24kHz mono audio; the provider-reported transcript must match the requested words before a WAV is returned. No microphone or role-play session is involved. The UI marks AI voice, supports retry/stop, caches one audio clip for the open card, and stops playback/aborts browser requests when Explain hides or the card closes. No cross-user or persistent audio cache is added.

## Typography, spacing and interaction polish — 2026-11-05

Shared text/space tokens and semantic color aliases now unify current surfaces. Report H1 uses 30px/500, primary explanations 15px, helper text 13px, mono metadata 12px and transcript text 18px; report content gutters follow the 4px scale. Corpus cards use 20px padding/12px gaps. Empty Loadout logic groups are omitted; a filtered-empty result appears once with a recovery action. Coarse-pointer controls have 44px targets independently of layout breakpoints, including labelled Corpus checkboxes and timeline controls.

Content changes use an interruptible 160ms opacity animation without rekeying media/containers: Corpus results (120ms settling window), Quick start recommendations, preview targets, Explain/Syntax and Sound/Rhythm/Melody. Assessment underlines and score bars use transform feedback; reduced-motion preferences skip animations and cancel in-flight content feedback. No score values, acoustic data, recording/playback or provider configuration changes.

## Add to corpus shares the detail surface — 2026-11-05

Transcript selections now use the same dimensions, neutral backdrop, typography, 14px corners, source context, underline tabs and independent content scrolling as Corpus detail. Editable fields, the note draft and Save sit below the analysis. Pin and outside dismissal remain available; the card has an explicit close button and Escape support. It is positioned in the viewport through a portal so Reader columns cannot clip it.

## Corpus detail DeepSeek comparison — 2026-11-05

Corpus detail now supports a scoped `CORPUS_ANALYSIS_PROVIDER` switch. The current local API uses the official DeepSeek `deepseek-flash` model with the existing server-side credential; repository defaults retain Ark for compatibility. Explain, lazy Syntax and streamed follow-up share the selected provider. Other text/voice tasks keep their own configuration. Two same-prompt live rounds (12 requests) were substantially faster and retained rewrite difficulty in both sentence follow-ups. Grammar terminology, spatial-versus-temporal translation and template adherence still had errors; this is sampled improvement, not broad teaching acceptance. 53 focused API tests pass, including provider/credential isolation. See [comparison, complete outputs and timings](design/benchmarks/corpus-detail-20261105/DEEPSEEK_COMPARISON.md). Existing saved analyses refresh only on the existing explicit action.

## Corpus detail: speaking-first, on-demand analysis — 2026-11-05

Stage 1 and Corpus library share the same Explain/Syntax panels, source underlines and follow-up UI. Explain v2 adds a 60–120-character Chinese teacher note (prompt requirement), reusable speaking frames, collocations, text stress guidance and no speculative pitfalls in new Explain output. Usage scenarios appear once, as mono text. No default etymology or word-family content. Library cards preview the first saved speaking frame and show register alongside level.

`POST /api/corpus/analyze-selection` now generates Explain only and returns `schema_version=2`, `syntax_state=pending` plus an empty compatible syntax object. `/analyze-syntax` runs only on tab activation; phrase/chunk/idiom output is limited to internal structure, sentence role and nearby logic, while sentences/structures retain full analysis. Client requests are deduplicated while pending, abort on dismissal, and retain retryable failures. Saved Syntax uses the existing account-owned/guest corpus update boundary; unsaved candidates cache it for this visit. Legacy combined records remain readable, with an explicit Refresh explanation action and no automatic regeneration.

`POST /api/corpus/ask` streams actual provider SSE deltas with explicit done/error states. Requests carry bounded local context, a question up to 500 characters and at most six completed exchanges. The UI renders only escaped text, paragraphs/lists, emphasis and inline code; no HTML, images or links. Failed/truncated answers cannot be saved. Save as note explicitly appends to the existing usage note; an unsaved transcript selection instead labels this as a note draft until the item is saved. Follow-up history stays in the open detail and is not automatically persisted. Account changes/dismissal dispose its requests.

Initial redesign, before the DeepSeek comparison above: no database migration or provider change; existing Ark configuration was reused. Restart the API process to load new prompt files. A real Doubao follow-up tested one authored phrase and one full sentence across Explain, Syntax and streamed questions, with repeated calls and prompt fixes. Default Explain now leaves speculative pitfalls empty; placeholder and complete-selection boundary copy are application-owned. Transport/contract checks pass, but repeated Lite answers still sometimes alter meaning in follow-up rewrites, so teaching quality is not accepted as stable. Thinking-mode probes were slower and did not resolve every issue; Pro calls returned 404 and no model configuration was switched. See [live results, remaining failures and full prompt snapshots](design/benchmarks/corpus-detail-20261105/README.md). Latency is sampled API wall time; billing and broad model quality remain unqualified.


## Shared button geometry across features — 2026-11-05

Regular actions now use explicit shared sizes instead of legacy inherit geometry. Height tokens are 32/40/44px for sm/md/lg; text is 12/13/14px. Action groups use 44px/14px controls, 8px icon gaps and 12px control gaps across primary/secondary, button/link and loading states. Feature CSS no longer overrides regular button geometry. Icon-only controls, recording controls, navigation and filter/segmented controls retain task-specific geometry.

## Consistent report action sizes — 2026-11-05

Report continuation actions use the shared ui-button-group geometry with explicit lg sizing: Retry this mission, Adjust loadout and New mission share 44px height, 14px text and common padding across button/link, primary/secondary and loading states. Legacy inherited controls remain opt-in to avoid changing unrelated layouts.

## Quiet initial loading — 2026-11-05

Initial data reads use skeletons or screen-reader-only status, without redundant visible loading copy: Review takes/analysis, Detailed progress, Corpus counts, profile history counts, Loadout draft/options and report comparison reads. Existing content stays visible during refresh. Upload, save, queued analysis, countdown, user-triggered button progress and error/retry feedback remain explicit.

## Page-shaped loading placeholders — 2026-11-05

Shadow loading now follows Quick setup versus Detailed/Review workspace structure, with no video in Review. Corpus loading uses the actual responsive 280px-minimum card grid (or rows in list view), including a compact heading/filter outline during auth loading. Loadout uses one dark Quick start placeholder instead of generic cards; draft loading remains a short status. Placeholders remain decorative with reduced-motion support.

## Workspace layout and navigation fixes — 2026-11-04

Corpus filter popovers now anchor to each pill, clamp to the viewport and update on scroll/resize. Detailed/Review primary and secondary practice actions share a 50px height and centered duration; Quick/Detailed Audio settings stays full-width and left-aligned when opened or closed. Pending-save notifications sit above mobile global navigation so they do not block its links. Removing the workspace main’s inherited 100dvh minimum eliminates the extra global-header-height document scroll on desktop Ingest/segments; the existing content scrollers and footer geometry remain.

Ingest, segments and Shadow render the same content workspace. Their internal navigation now updates native history through Next’s supported integration, reusing the ready blueprint/media instead of awaiting another RSC response. Shadow code warms when the picker opens and on Begin intent; its styles belong to the shared content layout. Canonical deep links, auth checks and cross-content/external navigation remain route-owned.

## Review shares Detailed Sound cues — 2026-11-04

Review and Detailed now render phonology badges and linking arcs through the same SoundCue components. Both use the same palette, badge typography, solid Reference cues, dashed unevaluated learner badges with “?” and dashed learner SVG arcs. Review places each link on its outgoing source boundary, reserves sufficient lane height/marker width and retains the shared acoustic timeline, selection, zoom and voice controls. No analysis data or left-panel behavior changes.

## Sound follows the revised Detailed prototype — 2026-11-04

Detailed Sound now follows `design/prototypes/Stage 2 · Detailed (three-layer analysis)-html (1)/Shadow.dc.html`: full-width Reference/Your voice text rows, 19px words, gray filter pills with a black active state, colored badges and SVG linking arcs. Learner practice targets use dashed marks with question marks; filtering dims other cues without dimming or reflowing the sentence. Vowel durations remain opt-in. IPA appears on hover/keyboard focus without reserving an empty text row. Notes folds Feedback/Tip above the filters instead of taking a permanent right column; its two columns stack on mobile. Review shares the updated phenomenon palette. Left panels, acquisition, analysis results and eligibility gates are unchanged; the alignment defect below remains open.

## Saved-take alignment audit — 2026-11-04

Read-only database inspection of take `b4b8631e-e26c-5edc-8a42-40d20b155762` found unreliable MFA word boundaries despite `alignment_status=aligned`, no quality issues and a completed analysis. MFA places `the` at 1.93–3.61s (DH 30ms + AH0 1650ms), then `same/way/I` at 6.65–6.95s. Independent saved ASR places `the` at 1.94–2.14s and `same way` at 2.14–3.08s. These are conflicting estimates, not verified word durations; ASR also absorbs silence into `in` and `I`, so it is not a drop-in precision replacement.

The saved VAD interval is 3.680–6.688s (3008ms); its 4.0–6.5s interior has 250 frames, no F0 and energy averaging approximately −64.51 dBFS in the linear-power domain. This supports a quiet interval in the recording, not its attribution to `the`. ASR suggests it follows `way`. The analysis input was cleaned at 2026-11-04 10:52:55 UTC, recording retention is `none`, and no Storage objects remain for this take; exact phonetic boundaries cannot be confirmed by replay. No analysis rows or application code were changed during this audit.

The current parser checks ordering, bounds and transcript tokens, but not cross-method timing disagreement or implausibly stretched/compressed phones. Downstream word duration, VAD pause attribution and word-level rhythm/pitch aggregation trust those boundaries. Earlier “true/measured interval” statements establish provenance and rendering only, not alignment accuracy. Alignment-quality validation and audio-backed realignment remain unimplemented.

## Sound presentation restored; pauses separated — 2026-11-04

Restored the accepted 2026-10-15 text-first Sound presentation: colored phenomenon badges, linking arcs, dictionary IPA on hover/focus, explicit Vowel len. and Linking measurements, and the right-hand Layer focus/Feedback/Tip panel (below on mobile). Filter chips wrap. All excludes per-word vowel measurements even for completed takes. Review keeps the shared timeline but uses the same phenomenon palette and default mark filtering. Rhythm/Melody retain their current plots and folded Notes; left panels and analysis gates are unchanged.

Timeline word labels, selection and playback highlights now exclude trailing pause space. The full recording axis, curves, envelope and ruler keep their stored scale; long gaps have a separate Pause label. Word hit areas exclude trailing gap space. The saved 1.68-second `the` duration and its 3.008-second pause attribution were subsequently found unreliable in the audit above; the layout change did not repair them. Stored alignment is unchanged.

## Shadow acoustic timeline completion — 2026-11-04

Detailed and Review share true word/boundary intervals, a recording-time ruler for the single visible voice, and continuous pitch paths across verified voiced word boundaries. Silence, unvoiced and unknown intervals still break paths. Text padding never adds measured duration. Selected-word readouts share sound markers and wrap compactly on narrow screens; saved take duration appears beside playback actions. Takes reads every analysis state in the same bounded list query and refreshes while listed work is queued/processing.

Saved legacy learner/reference measurements can supply real 20ms energy/pitch display frames on authenticated read, without audio downloads, ASR/MFA reruns, database rewrites or changed analysis scores. Raw 10ms frames stay server-side; deleted/revoked/missing evidence is not reconstructed. New analysis uses the same frame projection before persistence. The current learner-only take was verified against its actual stored evidence: 1,950 raw frames yield 975 display frames, including 398 voiced points. No synthetic historical envelope is used. Left panels are unchanged.

## Shadow readability and quiet states — 2026-11-04

Timeline columns now reserve measured text width in Detailed Rhythm/Melody and Review. Duration baselines, pitch and energy keep their true scale inside those columns; Fit stops shrinking when names need more room and permits horizontal scrolling. The seconds ruler accounts for label spacing. Removed the timeline explanation block, duplicate no-Reference paragraph and Takes privacy paragraph per user feedback. Completed analysis has no persistent status card; Takes holds its status and delete-analysis action. Processing/failure use a compact actionable notice. Review with no available layers omits the overview controls and empty plot; locked analysis is one line. Left panels remain unchanged.

## Shadow Detailed and Review timeline — 2026-11-04

Detailed follows visual specification 9.12–9.15 with an 820px main column, neutral recognition differences and sound tags, folded Feedback/Tip Notes, and shared Rhythm/Melody timelines. Review uses Overview with independent layer, saved-take and voice controls. Sentence directories retain their existing layout and behavior. View analysis opens the exact saved take in Review; selection survives mode changes. Quick still has only Audio settings; Review has neither preparation nor settings; How It Works stays removed.

The server now saves optional 20ms pitch/energy display frames with signal results. Both voices align by source word while retaining independent durations; unvoiced frames remain gaps, and prominence remains experimental. Historical analyses without these frames use their actual coarse pitch samples and explicitly omit unavailable energy envelopes. This is implemented locally, not deployed or validated as a pronunciation score.

## Shadow highlight and control placement — 2026-11-03

All caption playback highlights share line-soft backgrounds, ink-2 text and 3px corners in Ingest and all Shadow modes. Quick keeps only Audio settings beneath its setup card. Review shows neither Reference preparation nor Audio settings. Detailed retains both. Existing capture/session state and playback logic remain intact.

## Quiet Stage 1 word highlight — 2026-11-03

Stage 1 current words now use line-soft warm gray backgrounds with ink-2 text, 3px corners and no shadow. This replaces inverted black/white highlighting per user feedback. Font weight, horizontal spacing, corpus underlines and playback timing stay unchanged; Shadow styling is unaffected.

## Shared Shadow controls — 2026-11-03

Quick and Review now render the same quiet compact BufferedReferencePanel as Detailed. All three modes share AudioSettings with Server analysis / Keep recordings labels and busy-recording guards. The old Quick reference summary and duplicate settings markup are removed.

## Shadow compact reference and settings — 2026-11-03

Detailed Shadow reuses the same quiet compact reference layout as Ingest, retaining readiness titles, setup instructions, errors and reference actions. Audio settings show only checkbox labels; How It Works is removed. Quick settings use the same concise labels. Capture, retention and analysis behavior are unchanged.

## Visual corrections — 2026-11-03

Quick start retains a black card as an explicit product exception, with 14px geometry and inverse actions. Report action buttons use a single label and standard primary/secondary sizes. Active caption words use black with white text. Ingest reuses compact Reference audio controls without introductory copy; setup instructions and actionable errors remain visible.

## Shared visual consistency and interaction feedback — 2026-11-03

Shared primary controls now use black pills, and recording controls retain neutral colors. Quick start uses the light v2 surface; measurement charts distinguish reference/learner traces by solid/dashed strokes. Report styles remove the outer shadow and decorative score colors. Native dialogs, Corpus filters/selection tray, assessment content and saved-feedback icons use short CSS motion with reduced-motion fallback. Clerk appearance remains unchanged.

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


## Stage 4 target hint feedback — 2026-11-03

Target-card Hint retains the explicit selected target ID and the existing
question-versioned three-level flow in the shared conversation hint slot.
Its button now reports loading/retry/next-level state and disables unavailable
requests with an explanation (offline, speaking/draft, no question, busy/help
pending). Generic Need a hint? routing and generation remain unchanged. Compact
target actions share a baseline with no nested opportunity top margin.


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


## Signed-out authentication controls — 2026-11-03

Landing and shared application headers expose one Sign in action. The Clerk modal starts in sign-in mode and offers an explicit switch to Sign up and back. Sign-in-or-up and implicit sign-in-to-registration transfer are disabled; both flows retain the initiating URL. The reverted Clerk appearance customization remains removed.

## Landing section scrolling — 2026-11-02

Landing now uses viewport-height sections and native document scroll snapping,
with a sticky header, smooth anchor movement and a first-screen scroll cue.
Sections have a minimum height, so phone/zoom content can grow and remain readable.
The snap styles apply only while Landing is mounted; application routes retain
normal scrolling. Reduced motion uses immediate anchors and proximity snapping.
Existing section reveal animations remain on content, not on the snap targets.

## Landing and navigation presentation — 2026-11-02

Landing follows the supplied artboard: 1080px content, neutral cards, a joined
video-entry field, monochrome Chrome icon and black pill actions. CSS adds a
looping decorative waveform, staggered hero entry, supported scroll reveals and
hover feedback; reduced motion disables animations. The five waveform bars continuously alternate with staggered timing. URL validation, input drafts, auth return paths and truthful store
availability remain intact. Landing header links react to client-side sign-in changes. Shared navigation controls use neutral pills and
flow-context typography while retaining account-scoped routes and focus guards.

## Corpus library visual alignment — 2026-11-02

`/corpus` follows the supplied Corpus artboard and unified v2 reference: a 1440px
full-width shell, collection counts in the heading, top filter popovers, neutral
cards and black primary actions. Local rendering starts at 15 matching items and
Load more appends 15; search/sort still cover the complete loaded collection.
Selection survives filters, sorting and incremental display. The selected-items
tray clears mobile navigation, and becomes the primary action when present.
Existing detail/edit/delete, account boundaries and Loadout limits are retained.

## Practice history visual alignment — 2026-11-02

`/profile/history` now follows the supplied Practice history artboard: a white,
unboxed date-grouped list, outlined return link, one black New Mission action,
neutral filter pills, inline Mission state and separated pagination/footer.
The counter reports loaded entries while more pages exist. Newest-first ordering,
server-side filtering, account isolation and pagination/retry behavior remain intact.


## My learning and shared navigation — 2026-11-02

The supplied unified v2 visual reference is implemented for My learning: neutral
surface cards, compact duration labels, a next-step primary action, monochrome
activity bars, keyboard-operable assessment/series tabs and unboxed history rows.
Profile and Mission reports share `AssessmentTabs`; absent scores remain unassessed.
Overall learning dimensions remain descriptive, without an illustrative radar.

The root application layout now owns one global header: lowercase brand, left-aligned
Practice / Mission / Corpus / My learning sections and the existing Clerk account
menu under an initial avatar. Below 720px sections move to a fixed bottom bar.
Practice and Mission have separate named workflow steps. Recording and connected
conversation hide global sections; paused/ended conversation restores them. Focus
exits preserve the existing End mission confirmation and warn before leaving an
unfinished recording/message; they do not claim unsaved work has been persisted.
Practice reuses the account-owned saved source. Mission remembers the last visited
flow in sessionStorage per account; no-history entries remain Landing and Loadout
because dedicated entry lists do not exist. Landing retains its separate header.

This is a scoped visual migration, not a rewrite of all legacy global CSS or all
v2 product proposals. Existing provider, storage, reporting and permission rules
remain in force. Browser verification uses synthetic authenticated fixtures.


## Stage 4 targets visible from entry — 2026-11-01

User decision supersedes the earlier default concealment: show all target
expressions and their meanings from the start, including Guided, so learners
know which expressions to transfer into conversation. Keep manual Hide/Show
controls; confirmed models and observed uses still reveal their targets when
manual concealment is selected. Speaking does not hide target wording; only the
current question hint fades. Actual visible wording records exposure, never
learner use. Existing explicit legacy support choices remain unchanged.


```yaml
meta:
  contentType: Reference
  status: active
  updated: 2026-11-01
```

This file gives coding agents a fast, factual view of the repository. Read `AGENTS.md` first, then use this page to distinguish implemented behavior from planned product behavior.

## Loadout scene preparation recovery — 2026-10-31

The planner now uses request-local short target references and restores verified
corpus IDs before validation/persistence. Structure examples receive explicit
fixed anchors; field repair includes the bounded rejected value. This addresses
live reproductions of UUID copying errors and pronoun changes in saved sentence
structures, without relaxing target/frame/fit validation or extending retries.
The authenticated browser retry successfully saved and opened a three-target
Stakeholder alignment Mission. Voice remained offline; this checks preparation
and creation, not conversation or learning quality. See `TASK.MD` for regression checks.

## Stage 4 hint latency — 2026-11-01

Negotiated help now generates all three levels once on demand, validates the
whole bundle and keeps one private connection-local cache entry. Requests for the
same pending context share a task; cached upgrades publish only their requested
level. Context revisions, target/support changes, input and disconnect fence old
work. First-request generation remains on demand; background pre-generation is
explicitly deferred by user decision because learners may not request help and
unused generation would waste model calls. It is not an active follow-up or a
session-entry prerequisite. The frontend delays loading feedback by 600ms and
retains the previous ready hint during upgrades. Exposure follows the actual
painted card, including when switching Voice/Chat. Cache hit/generation diagnostics
support later latency measurements. `TASK.MD` records verification and limits.

## Stage 4 design alignment — 2026-11-01

The six audit gaps are implemented: default concealment also covers legacy
Missions without explicit support; confirmed modeling/use still auto-reveals.
Explicit v1 support choices remain intact. Actual Chat stage dividers now use
persisted, revision-valid presentation markers; old transcripts are not guessed
from today's stage. Evidence detail opens in the target panel, including mobile.
Chat hint typography/surface/padding now match the prototype through the runtime
wrapper. Confirmed silent rephrases show “Waiting for you”; the top stage guide
shows its known current-stage cue. No current stage means no invented cue.
See `TASK.MD` for verification; real provider quality and physical audio remain
separate acceptance work.

## Stage 4 Conversation UI — 2026-10-31

Step 2 applies the supplied neutral Conversation design to the actual speaking
route: stage navigation/guide, current-utterance Voice, text-first Chat, neutral
microphone controls and responsive targets. Staged targets reveal after confirmed
modeling or valid learner use; Show/Hide targets reveals the rest explicitly.
Existing v1 support and visibility receipts are retained.

Shared presentation components also drive an explicitly synthetic preview at
`/dev/conversation`, available only with server `LIBITU_CONVERSATION_PREVIEW=1`.
It covers progressive hints, silence/rephrase, recasts and connection states
without accessing a microphone, provider or learner storage. Step 3 now negotiates Conversation protocol 1 on OpenAI and connects actual
question identity, eligible-silence timers, spoken simplification and progressive
help with visibility receipts. Unnegotiated clients and Gemini keep legacy help.
Optional simpler questions preserve old serialized Mission plans. Step 4 connects
asynchronous minimal recasts to actual partner delivery and presentation receipts.
Voice shows only the current eligible recast; Chat retains confirmed recasts next
to their source turns. Only changed words are bold. Grammar/word-choice categories
and explanations are confined to frozen reports; transcripts and use counts stay
unchanged. Optional report snapshots preserve old sessions and exact retries.
Runtime tests use injected providers; this is not model-quality or human microphone
acceptance.
See `TASK.MD` and [implementation notes](design/docs/STAGE_FOUR_IMPLEMENTATION.md).

## Stage 4 Conversation contract — 2026-10-31

The user reopened Stage 4 for the supplied Conversation redesign, starting with
state/data contracts. [The new contract](design/docs/STAGE_FOUR_CONVERSATION_CONTRACT.md)
defines question identity, one-position help, eligible-silence timing, simpler
questions, evidence-linked recasts and legacy compatibility. Step 1 was documentation only. Steps 2–4 now implement the UI, negotiated
question/help runtime and recast/report path described above. The existing
15-second/two-follow-up runtime remains only for unnegotiated sessions.

The accepted target-panel correction retains automatic reveal after a clearly
confirmed partner demonstration, as well as actual learner use; other targets
stay hidden until requested. Guided uses the same new default. The 8/20-second
design permits one spoken simplification plus one automatic direction per
question; opening words/examples require clicks. Implementation and validation
follow the ordered queue in `TASK.MD`, not the earlier Stage 4 pause below.

## Mission voice provider — 2026-10-30

Mission now defaults to OpenAI Realtime (`gpt-realtime-2.1`, voice `marin`),
using the existing server-only `OPENAI_API_KEY`. The ignored local configuration
also selects OpenAI; Gemini remains an explicit legacy option. The user reopened
Stage 4 only for this provider migration, not the deferred teaching expansion.
Doubao continues to own planning, analysis, help and assessment.

Reuse the existing authenticated socket, PCM24k audio, server-owned response
controls, cancellation/truncation, presentation receipts and acknowledged-text
recovery. OpenAI Chat requests text only; voice requests audio plus its transcript.
The local SOCKS proxy required `python-socks[asyncio]`, now a declared dependency.
Real bounded synthetic speech passed setup, opening audio, cancel/truncate,
VAD/transcription, subsequent audio, text mode and fresh-connection history input.
Physical microphone/speaker quality and OpenAI teaching outcomes remain unverified.
See `design/docs/STAGE_FOUR_IMPLEMENTATION.md` and `TASK.MD` for checks.

## Stage 3 reference completion — 2026-10-26

The current increment follows the supplied Stage 3 development notes, Quick
start prototype and neutral design specification. The user explicitly paused
further Stage 4 implementation and runtime acceptance. Existing Stage 4 work
below is retained with its recorded validation limits.

Stage 3 now has nine logic templates, family/stage-function metadata and Travel.
Catalog metadata is separate from frozen Mission templates, preserving old
snapshots and exact retries. Custom-scene matching is an authenticated, bounded
suggestion request, separate from generating a Mission. Recorded-use filtering
uses an explicitly documented fixed seven-day interval; uncertain history must
remain unknown rather than Never used. Practice reliability remains a separate
three-Mission/two-date/two-scene-root measure, not mastery.

Current implementation and validation status: `TASK.MD`. Summary-only feedback
is unavailable pending Stage 4; old Balanced drafts remain compatible. These
Stage 3 changes supersede older six-template/no-Travel/no-review statements.


## Logic-constrained Mission milestone — 2026-10-26

The first follow-up milestone connects equal-priority target selection to a
version 2 scenario plan, frozen logic steps and target stage assignments. New
logic selections enter the actual planner and invalidate its cache; old version
1 sessions and exact pending retries retain their original contracts. Linked
v2 rounds preserve the parent's logic and placements while changing the scene.

Stage 4 schedules one natural demonstration per unused target across difficulty
levels, with actual presentation and reflection required for a confirmed demo.
Independent use before exposure suppresses that target's demonstration. Stage
coverage is derived from opportunities and learner responses; a replied-to
question is not a target use. The sidebar initially conceals target wording;
explicit reveal records visual assistance. Reports distinguish independent use,
imitation after a confirmed example, other assistance and uncertain exposure.
These are observed-use records, not mastery or teaching-effect measurements.

Automated cross-layer checks and real Ark/Supabase planning pass. Real Gemini
demonstration-to-imitation acceptance is still open: the latest bounded text run
delivered a target-bearing reply and question, but effect assessment was
unavailable and returned `unknown`. It was correctly excluded from confirmed
demonstration and imitation counts; the underlying provider error is unclassified.
Verification and hosted migration status are recorded in `TASK.MD`. This
milestone supersedes the earlier demonstration deferral below only for v2;
taxonomy, review ranking, Travel, Summary-only, correction and streaming remain
outside the increment.

## Mission Loadout Quick start — 2026-10-25

Loadout now leads with a local Quick start suggestion: up to three real saved
items, their suggested logic stages, a scene seed and the current preferences.
The deterministic helper uses existing functional tags and the six available
logic templates; Shuffle rotates available suggestions without replacing manual
targets. Manual selection uses one shared pool of up to five chunks, idioms or
structures. New targets have equal priority in the UI and use the existing
`primary` role internally. The full-corpus drawer shares the page's selection,
and Advanced contains existing preferences, scene comparison, logic, support and
practice history.

Free conversation creates a session with no targets, logic or target plan.
Starting still requires sign-in; targeted starts require synced account-owned
corpus. Draft ownership, storage locks, source validation, immutable retries and
confirmed-create acknowledgement remain in place. Local suggestions make no
model request; targeted Start retains the existing scene planner and fit checks.

The supplied development notes are a scoped reference, not a completed roadmap.
This change does not add the proposed functional taxonomy, usage/review labels,
Travel scenario, Summary-only feedback or new daily-life logic IDs. Stage 4's
proposed once-per-target demonstration and once-per-error correction rules are
not implemented by this redesign; the existing support/evidence policy remains.

Root lint/build/test and desktop/mobile fixture checks pass.
`20261025123200_loadout_quick_start_targets` is applied to hosted development;
its synthetic rollback checks pass. Free-conversation reports keep transfer
not applicable, and Retry/Adjust retain the free mode.
See `TASK.MD` and [the Loadout contract](design/docs/LOADOUT_IMPLEMENTATION.md).

## Practice workspace visual refresh — 2026-10-25

Stage 1, segment selection and Stage 2 now use the supplied ElevenLabs-style
reference: white canvas, warm neutral surfaces, lighter typography, pill controls
and black primary actions. The theme is scoped to these workspace pages and their
loading shells. Stage 1 keeps the video and existing Enable reference audio
component, with the summary above the video and underlined transcript highlights;
there is no separate audio player. Segment selection uses neutral cards and a
single purple selection color. Quick, Detailed and Review keep their settings,
recording/authorization flows, history and analysis; learning/error colors remain.
The shared header now centers the Stage navigation independently of the title
and account controls, including its stacked narrow-screen layout. The segment
picker no longer shows the redundant five-minute badge.
Following the user's spacing feedback, practice workspace horizontal insets are
16 px on desktop and 12 px on phones. The picker places Back on the right and
uses a text-only Recommended badge.
The outer workspace fills the viewport; the previous 1280 px cap and automatic
side margins have been removed to address the user's 80 px margin report.
Detailed and Review now share the sentence-directory presentation: 260 px on
desktop when expanded, a 56 px numbered rail when collapsed, matching controls,
and the same narrow-screen stacking. Both use a 680 px main content limit.
Detailed retains its recording-driven fold; Review retains filters and take
metadata. Selection, playback and analysis behavior are unchanged.
The central result/actions area and Sound/Rhythm/Melody workspace also share
spacing, typography and controls. Both place saved-analysis status before the
layers, use neutral tabs with a purple selected underline, and keep comparison
evidence colors. Guidance stacks beneath charts when the analysis area narrows.
See `TASK.MD` for validation and fixture limitations.

## Release confirmed Mission starts — 2026-10-24

Loadout now clears its pending creation request after a verified successful
create or retry, before navigating to the Mission. The response must match the
account and original client request ID. Confirmation is persisted under the
existing draft lock/CAS before the UI is unlocked; failures retain the exact
retry request. Targets, scenes and settings remain available for a new Mission.
Previously successful requests stayed pending forever, so returning after ending
a Mission replayed the old ID and kept setup controls locked. No API/database or
cancelled startup-optimization change is included. Verification is in `TASK.MD`.

## Mission preparation latency P0/P1 — 2026-10-24

One-button Start now requests one scenario; manual comparison and linked practice
request two. Existing one-to-three-candidate plans remain readable. Planning v5
makes at most one field repair: verified good fields/scenes stay unchanged, the
server chooses patch locations, and the complete merged plan must validate.
Original schema, semantic and practice errors are collected together. Malformed
JSON or an unlocatable structure fails with selection retained, without a full
regeneration. The shared 90-second model / 120-second browser limits remain.

Selected corpus inputs use one owner-filtered batch read. The browser reuses a
matching plan across difficulty, feedback, logic-template and support changes;
scene preferences, target order/roles and source content invalidate it. Exact
uncertain-create replay still takes precedence. A fresh five-target startup now
uses five database HTTP requests (one input read, one plan save, one creation,
two workspace reads), previously nine; this excludes corpus bootstrap and auth.
Server phase timings and correlated request IDs reach browser Performance
measures, including cache hit/miss and click-to-ready. No learner text is logged.

The single-scene migration is applied to the connected development database.
A five-target synthetic Ark request validated in 18.01 seconds (13.85 generation
+ 4.11 local repair); an injected one-field repair took 2.46 seconds. A separate
three-target hosted persistence smoke passed with planning 11.47 seconds,
creation 0.32 seconds and workspace read 0.63 seconds, then removed all synthetic
records. These samples verify the pipeline, not latency percentiles, teaching
quality or Gemini voice. See `TASK.MD` and
`design/benchmarks/mission-planning-20261024/` for verification.

## Loadout planning timeout repair — 2026-10-24

Loadout generation and one-button Start share the same planner. A live browser
reproduction timed out under its former 45-second model budget. New planning now
requests two concise candidates with mandatory non-null sentence frames in the
model-facing schema, while legacy stored plans remain readable. AI frames use a
target placeholder that the server expands from the verified saved expression,
then validates; this prevents the model from silently rewriting selected words.
Repair receives all safe semantic error locations. The two-attempt
shared budget is 90 seconds; browser planning allows 120 seconds and shows that
wait explicitly. Mission creation retains its 20-second timeout and exact retry
identity. The signed-in browser successfully generated and saved the original
five-target plan and opened its ready Mission. 226 focused API tests and 27 Web
tests pass; microphone/runtime verification is outside this repair. Details are
recorded in `TASK.MD`.

## Doubao text-provider migration — 2026-10-23

All former DeepSeek text requests now use Doubao through Volcengine Ark:
Stage 1 streaming blueprints, selection explanations, Mission planning, background
teaching analysis, explicit help and Stage 5 assessment. `ARK_API_KEY` is server-only;
`ARK_MODEL` defaults to `doubao-seed-2-1-lite-260915` and `ARK_BASE_URL` to
`https://ark.cn-beijing.volces.com/api/v3`. OpenAI Realtime now handles voice (2026-10-30); Gemini is optional.
Text timeout and Stage 1 budgets use `ARK_*`. Obsolete `DEEPSEEK_*` and
`GEMINI_TEXT_*` entries are ignored. Requests disable thinking and retain existing
JSON/evidence validation, retries, streaming previews and bounded failure handling.
Existing cached blueprints, reports and historical provider verification records
remain unchanged. The supplied key can generate JSON with the Lite model; the
Pro model in the supplied example returns `ModelNotOpen`. Real synthetic checks
pass for streaming blueprints, selection explanations, teaching analysis (after an
initial transport failure) and a complete three-turn assessment. Root lint/build/test
pass (1,589 API, 429 cached Web, 114 cached extension tests). No learner records or
database writes were involved; this migration does not establish model or teaching
quality. Verification details are tracked in `TASK.MD`.

## Linked practice and evidence-based support P3/P4 — 2026-10-20

P3 adds separately validated missed-opportunity rewrites, explicit second rounds with
changed details or swapped roles, and factual comparison of existing ready reports.
Rewrites quote the learner's actual reply to a presented opportunity and remain AI
suggestions, never observations or scores. P4 reads repeated reliable independent
evidence and offers a user-applied reduction of one support level; it does not infer
mastery. Every primary target needs three Missions, two UTC practice dates and two
scene families. See [the contract](design/docs/STAGE_THREE_FOUR_MISSION_PLAN.md).

New explicit-support sessions freeze original corpus IDs and an evidence version;
legacy sources and retries retain their identities and are not retrospectively
upgraded. Migrations `20261020094401_speaking_linked_practice` and
`20261020094408_speaking_support_history` and the evidence-date follow-up
`20261020094938_speaking_support_evidence_dates` are applied to the connected development
database. Both new and all three previous SQL rollback suites pass locally and
hosted. Application and browser verification is tracked in `TASK.MD`; no application
deployment or learning-effect validation is implied.

## Mission demonstrations and manual support P2 — 2026-10-20

P2 adds four explicit support levels independent of difficulty: `model_frame`,
`model_label`, `label_only` and `no_hint`. New drafts start with model plus frame;
old absent/null settings keep legacy behavior. Learners change support manually.
The two modeling levels use a separate `model_then_transfer` policy: one natural
use in the AI's own response, followed by a question inviting different learner
content. Reduced levels retain implicit elicitation without selected wording.
Every explicit level suppresses automatic help cards; requested help stays available.

Server-validated sentence frames, revision-bound UTF-16 demonstration highlights,
versioned safe-boundary support changes and frozen presentation evidence are
implemented. Hiding support does not erase earlier assistance; partially played
demonstrations carry possible exposure and cannot establish independent use.
Stage 4 and Stage 5 share conservative contraction/inflection variant validation.
There is no automatic mastery-based upgrade, semantic-paraphrase matching claim
or measured teaching-effect result. See [the Mission contract](design/docs/STAGE_THREE_FOUR_MISSION_PLAN.md).

Migration `20261020090509_speaking_support_and_demonstrations` is applied to the
connected development database. New and existing planning/feedback SQL rollback
contracts pass locally and on hosted Supabase. Root lint/build/test pass:
1,384 API, 423 Web and 114 extension tests. Existing planning/help and
loadout/analytics browser regressions pass with synthetic fixtures; dedicated
support acceptance passes at 1440/390 px, including cold no-hint, legacy opt-in,
actual visibility after menu animations and explicit help. A real DeepSeek/Supabase probe
passes after fixing an overly strict terminal-punctuation frame check; all synthetic
records are removed. Its runtime receipts are fixtures, not live Gemini or learner
evidence. See [verification details](design/benchmarks/mission-support-20261020/README.md).

## Expression-led Mission planning — 2026-10-20

P0/P1 connects selected language to generated scenarios and frozen, target-specific opportunity plans. New Loadout uses one to three primary targets plus up to two opportunity targets. Its default Start mission action generates or reuses a suitable scene, saves the Mission and opens it; manual scene comparison is optional. Uncertain creation retries reuse the saved request before generating another plan. Stage 4 keeps asynchronous implicit teaching, adds planned primary-target priority, records actual opportunity delivery, and supports skip/restore. Stage 5 freezes complete presentation provenance and excludes skipped or unoffered targets from learner-failure claims. P2 adds demonstrations and manual support; the P3/P4 section above records the later review, linked-round and history increment. See [the implementation contract](design/docs/STAGE_THREE_FOUR_MISSION_PLAN.md) and `TASK.MD` for verification and migration status.

Selection guidance recommends two primary targets plus zero or one opportunity
target while retaining the full allowed budget. Recoverable generated-content
errors get at most one constrained regeneration inside a shared 45-second model
budget; final validation stays strict. System errors keep the selection and offer
retry. Scene-fit advice names one validated candidate and its target-specific
reasons, with explicit role/removal actions rather than automatic target changes.

The two development-database migrations are applied. A bounded real DeepSeek/Supabase probe passed scenario generation, snapshot creation, stale-plan rejection, recovery and feedback freezing; all synthetic records were removed. Runtime opportunity events in that probe are fixtures, so it does not qualify Gemini teaching behavior or learning effects. See [the integration evidence](design/benchmarks/mission-planning-20261020/README.md).

## Mission teaching control and private diagnostics — 2026-10-18

Doubao text analysis observes each finalized learner utterance with frozen context while OpenAI Realtime replies independently. The first two substantive learner utterances default to observation; subsequent automatic teaching needs a contextual recommendation, one pending target, bounded cross-turn eligibility and separate attempt/cooldown counters. Analysis completion now wakes safe-boundary dispatch. Immutable sent attempts, completed-response assessment and actual presentation are recorded separately.

Voice and Chat share requested Usage/Example cards; automatic direction appears only after the AI reply is assessed as reflecting the teaching intent. Actual expression/example exposure remains assisted for the rest of that Mission; overlap/unknown provenance is not labeled independent. Detailed traces are owner-readable through GET `/api/speaking/sessions/{id}/diagnostics`, separate from the runtime snapshot. There is no diagnostic timeline UI. The hosted `20261018111206_speaking_teaching_diagnostics` migration and rollback checks pass. Root lint/build/test pass (1,111 API, 390 Web, 114 cached extension tests); hint-card browser checks pass at 1440/390 px with synthetic auth/API/provider events and inspected screenshots. Readable retention is 30 days, with same-session append cleanup and no scheduled global physical purge. See [behavior, API and reliability limits](design/docs/STAGE_FOUR_TEACHING_CONTROL.md).

A bounded live Gemini/DeepSeek/Supabase browser probe now records seven canonical learner turns (six voice, one typed). All six voice first replies began before their analysis started; one policy from turn 5 bound while eligible to turn 6. Its content assessment was `not_reflected`, and Gemini named the expression despite the implicit-teaching constraint, so cross-turn delivery passed but teaching compliance did not. Usage/Example visibility acknowledgments and subsequent assisted use were recorded. An invalid model quote offset was rejected and retained only as uncertain lexical evidence. Synthetic identity and WAV input do not qualify real sign-in, physical microphones or general teaching quality. Temporary database records were removed; [full per-turn model, execution and presentation logs](design/benchmarks/teaching-live-20261018/run-01/README.md) retain the evidence.

The follow-up fix removes selected wording from Gemini's initial mission configuration and implicit controls, assigns the communicative act explicitly to the learner, and separates teaching attempts from opening/silence triggers. Deterministic target-disclosure checks run after the response before advisory effect assessment; they do not delay or buffer audio. Stage 4 analysis now requests exact quotes and derives their UTF-16 ranges from unique occurrences in the frozen learner text. Wrong ranges can be repaired only when unambiguous; repeated quotes and persisted evidence retain strict validation. Logs expose anchor provenance and deterministic/advisory assessment sources. No public API schema or database migration is needed.

A later live probe stopped before strategy coverage with `audio_rate`. PCM and high-frequency playback/display receipts now bypass the provider/state lock; completed-playback writes run in the tracked background drain, and shutdown reconciles already-received complete ACKs. Microphone/text controls retain single-reader ordering; provider writes, frame validation and rate limits remain unchanged. The failed run remains in [its own report](design/benchmarks/teaching-live-20261018/run-03/README.md), separate from any later successful coverage.

Post-fix live evidence is [recorded separately](design/benchmarks/teaching-live-20261018/README.md). Run-04 completed without `audio_rate`: three finalized voice turns began audio before analysis, but four unconfirmed ASR fragments left strategy/quote coverage incomplete. Run-05 used preregistered typed inputs with real audio: one policy crossed turn 3→4 while eligible, Gemini asked the learner to frame the compromise without supplying the expression, and the deterministic check plus advisory assessment passed. An actual direction ACK and unique server-derived quote `[0,16)` were persisted. Its first analysis overlapped 20 incoming audio packets; a later persistence 503 prevented a fifth reply, so this is bounded feature evidence, not a wholly successful session or broad reliability claim. Both journals drained with zero reported gaps and temporary records were removed. Prewritten target use does not establish teaching causality.

Final post-fix root checks ran after the live sessions: lint/build/test pass, including 1,179 API and 390 Web tests, with 114 extension tests replayed from cache. One existing Starlette deprecation warning remains. No deployment was performed.

## Mission startup, silence and audio bursts — 2026-10-18

AI opening now follows the browser's initial microphone-mode acknowledgment, avoiding cancellation/silent delivery during startup. Voice-enabled connections give a brief follow-up after at least 15 seconds of silence following generation and acknowledged playback, capped at two until nonblank user input. Speech/transcription, generation, playback and lifecycle gates prevent competing prompts; microphone-off Chat does not auto-prompt. A bounded token bucket tolerates short audio catch-up batches while retaining sustained-rate protection. Timers/budgets reset on reconnect; real microphone/provider timing remains unmeasured.

## Mission speech-onset tuning — 2026-10-18

Gemini automatic voice detection now requires a 300 ms speech onset instead of 100 ms to reduce brief background-noise interruptions. Low sensitivity, automatic barge-in and the 1200 ms end-of-speech silence window remain in place. New connections use the setting; the tradeoff is potentially slower deliberate interruption or missed very short utterances. Real microphone/noise effectiveness remains unmeasured.

## Chat empty-message visibility — 2026-10-18

Chat renders saved messages and live transcript fragments only when they contain non-whitespace text. Noise-triggered voice placeholders stay hidden and appear normally when transcription arrives. Empty-state and scroll behavior follow visible messages; runtime storage and turn handling are unchanged.

## Mission loading consistency — 2026-10-18

Replace generic loading cards with the Mission layout: task heading, voice workspace, composer and desktop language sidebar. Reuse page breakpoints and respect reduced motion.

Mission entry now retains Loadout during route navigation and uses one consistent Mission skeleton for authentication and workspace loading. The leftover generic Speaking route fallback has been removed; errors and retry remain explicit.


## Stage 1 video scroll and loading cleanup — 2026-10-18

The persistent media host now relays native iframe scroll chaining into Stage 1's independently scrolling center panel. The iframe remains mounted and unobscured; narrow layouts retain ordinary document scrolling. Empty extracted-corpus regions show skeletons without redundant loading copy; failure and Saved empty states remain explicit.

## Stage 1 progressive reveal — 2026-10-18

Stage 1 now reveals newly committed summary, logic, transcript and corpus content with a short downward stagger. Stable identities prevent existing rows from replaying during streaming/finalization. Same-frame previews coalesce into a non-urgent React update; completion and cancellation discard queued previews. Empty regions retain independent skeletons. Animations use opacity/translation only, cap batch work and delay, and respect reduced motion; data availability is not gated by animation.

## Direct Stage 2 entry — 2026-10-17

Remove the mandatory Ready to practice screen. Confirming a segment enters Shadow directly (Quick by default); unauthenticated learners retain the existing sign-in gate and return target. The picker prefetches the selected segment’s Shadow route/code. Existing `/segments?segmentId=…&step=prepare` links replace into Shadow without a preparation history entry. Content-owned media, reference capture/cache, and account-owned save queues keep their existing ownership. Reference preparation remains available in Detailed; this does not auto-enable capture, playback, microphone or upload consent.

## Stage 2 Quick and Review — 2026-10-17

Desktop setup follow-up: Quick settings scroll within the workspace, with Start kept in a separate footer so it remains accessible in short windows. Review also scrolls within its available height; Detailed layout is unchanged.

Follow-up: place the mode switch inside Detailed’s existing header so it does not consume a row of the outer reader grid. Keep the original practice area and layer styles. Review gives the sibling word-result and analysis components distinct take-scoped keys, preventing duplicate-key reconciliation errors.

Stage 2 defaults to Quick, with range selection, optional short-sentence skipping, playback/text settings, sequential listening and recording, background analysis, round summaries and targeted practice. Each recording lasts twice the original sentence duration (independent of playback speed), or ends early with Done. Quick waits through a visible 2-second preparation countdown after playback; Pause discards unfinished audio and Resume replays the current sentence. Completed takes and Detailed behavior are unchanged. Detailed retains the original component and styles. Review restores segment history, filters results, selects takes, replays available audio and reuses existing three-layer evidence; absent Reference still permits learner-only analysis.

The recorder, API, decoder and database now support the source-derived Quick duration. Migration `20261017121513_quick_shadowing_duration` is applied to hosted Libitu; application deployment is separate. Existing upload byte limits and retention consent remain. Validation: root test/lint/build pass (1002 API, 376 Web, 114 extension tests); desktop/mobile browser checks used synthetic media/API fixtures, including 90-second recording and save recovery. No pronunciation accuracy claim follows from these checks.


## Current objective

Build the smallest reliable loop from a supported YouTube video to a saved corpus item and an AI speaking session. Keep reading and intensive listening compatible with the architecture, but do not let them delay the first complete loop.

The provisional launch market is overseas. Mainland-China-specific hosting and regulatory work is outside the current launch scope; target-country privacy, consumer, copyright, and platform obligations still apply.

Stage 2 browser-captured references can now be uploaded for private server source-transcript MFA/VAD/F0 analysis without a file-source registration. Source-aligned reference prosody is cached and paired with the exact saved learner take. Sound/Rhythm each use two compact Reference / Your voice rows; Melody uses one normalized chart with linked full-word labels and playback highlighting. Registered file adapters remain supported. General remote acquisition and validated pronunciation detection remain planned. See [current implementation](design/docs/STAGE_TWO_BROWSER_REFERENCE_SERVER.md).

## Repository status

Offline Rhythm CWT experiment (2026-10-16): independent PyWavelets analysis reuses full 10ms MFA/F0/energy evidence and reports continuous, uncalibrated relative prominence with uncertainty. Six human clips measured about 13–17ms median incremental computation; the latest user's bound Reference was included, but its Take audio had already been cleaned and no paired user result could be reconstructed. Public learner probes retain the existing 60/85 gates. That experiment did not modify production; the separately approved progressive integration below now persists full server frames and publishes CWT previews. Accuracy remains unmeasured without human labels. See [results and limitations](design/benchmarks/rhythm-cwt-20261016/README.md).

Analysis latency optimization (2026-10-14): consented retention and learner analysis share one browser upload. Analysis is durably queued before retention finishes; retention retries do not recreate completed/cleaned analysis inputs. Reference and learner workers prefer a hash-verified, account/job/purpose-scoped local handoff (30-minute TTL, 256 MiB bound), falling back to private cloud storage on another host or cache loss. MFA reuses versioned compiled lexicons with cross-process build locks; audio, model extraction and outputs remain job-local. Model hash checks are reused within a process and invalidated on file changes. MFA binary version is checked once at worker startup, before queue claims; sentence alignment does not run a version probe. Source acquisition, quality checks, evidence identity, learner ASR and 60/85 gates are unchanged. No database migration is required.

Reference recovery status (2026-10-14): entering a sentence displays “Checking reference…” during the read-only saved-reference lookup. Uploading appears only during actual reference upload work. The recording guide also waits for lookup before offering preparation. Acquisition, upload and recording gates are unchanged.

Reference source-transcript alignment (2026-10-14): new references skip independent ASR and align the immutable source sentence directly with MFA. Preserve audio integrity/quality and ordered, bounded, plausible-duration word/phone coverage checks. Results explicitly use `content.status=source_transcript`, never fabricated ASR `matched` evidence. Cached comparisons and frontend reference measurements accept this basis; historical verified references retain their old basis. New references use `reference-source-transcript-v2` plus acoustic engine identity, independent of learner ASR configuration. Latest-capture recovery excludes older policy/engine results; existing historical takes and objects are not rewritten. Learner ASR, 60/85 gates, capture acquisition and retention remain unchanged. No schema migration is required.

Reference status copy (2026-10-14): the preparation card and recording guide share sentence-specific server status. Uploaded references with incomplete content/alignment checks show the reason and Retry reference analysis without another upload disclosure. Pending analysis, upload incomplete, cancellation, deletion, expiry and Ready remain distinct. Registered references use the same status descriptions. Existing acquisition, recording eligibility and exact reference content checks are unchanged; tolerant reference validation is a proposal, not implemented.

Stage 2 reference recording guidance (2026-10-14): when server recording analysis is enabled, require an uploaded, unexpired reference for the selected content/segment/sentence before opening the microphone. Show Prepare reference beside the recording flow; reuse the existing extension authorization, 1× preparation, consent and upload/retry paths. Queued/processing references with uploaded audio allow recording, and the new take freezes that reference ID at recording start. Failed/deleted/expired or incomplete sentence results require preparation/retry. Local-only practice remains available with server analysis off. Historical takes are never rebound; the proposed one-time attachment/resume implementation was withdrawn before migration deployment at the user's request.

Stage 2 development worker startup (2026-10-14): the API dev script explicitly removes pnpm's default four-script concurrency limit so all five persistent services start, including the reference acoustic worker. Previously the fifth script could wait indefinitely while reference jobs remained queued and eligible learner jobs waited for their bound reference. Reference acquisition and analysis gates are unchanged.

Stage 2 direct component restoration (2026-10-13): at the user’s explicit request, copy SoundComparison.tsx, LayerComparison.tsx (including Rhythm and PitchOverlay), and LayerFocus.tsx verbatim from /Users/river/Documents/Libitu. Their internal presentation now matches that workspace byte for byte; existing shared CSS already matches. Own Sound conceal/reveal state in StageTwoShadowing via the original controlled props, scoped to the selected sentence/take. Keep prototype status badges, recording-state visibility, word gates and source/reference acquisition outside these restored components. Word differences remain in the separate word-check result; unavailable acoustic measurements remain blank in the data adapter, while the original Sound practice-target cues are retained.

Stage 2 analysis state clarification (2026-10-13): verified the fetched origin/main at d84bd9d. Keep its internal Sound/Rhythm/Melody layout, diagrams and explanation panel; prototype styling applies only to compact layer status badges. Hide layers before recording, during microphone/encoding work and until the selected take has a durable word check (or completed legacy evidence). Then retain the exact 60/85 gates, show locks, pending ellipses, insufficient/interrupted dashes or colored evidence badges. Sound has no aggregate score: use a completion mark, with an asterisk for matched-only scope; Rhythm/Melody display real experimental similarity scores when present, otherwise a completion mark for available measurements. Existing unpaired learner evidence remains viewable. Deleted/no-analysis takes hide layers; retry/error controls remain available. Source/reference acquisition is unchanged.

Stage 2 analysis appearance restoration (2026-10-13): restore the main-worktree presentation of the three analysis layers: 52 px tabs and the original Sound Shadow mode/Hide text/Reveal all toolbar; status badges follow the prototype as clarified below. Remove refactor-only mobile workspace and unmatched-word box overrides. Keep the 60/85% gates, disabled tabs, exact take/reference mapping and truthful unmatched-word notes. Sound review visibility stays local to the selected take; it does not alter recording support snapshots or the word-check result. Rhythm/Pitch drawing and LayerFocus were not restyled by this refactor.


Stage 2 directory and state follow-up (2026-10-13): the expanded directory shows sentence text plus practiced/unpracticed, highest reliable word match and an exact >=85% word-pass marker in the upper right. During microphone request, recording and encoding it folds into the numbered rail; afterwards it restores the learner’s manual fold preference. The existing progress API also reads owner/content-scoped durable word-check counts in keyset pages, excluding deleted takes/analyses and unreliable/legacy checks; no migration is needed. Deleting playback audio preserves counts, while deleting the winning analysis/take falls back to the next surviving best. Completed saved references remain Ready while local preview work runs or fails; explicit source errors/deletions remain visible. Shared black/red media buttons and the waveform are separately centered. Original acquisition and analysis gates remain unchanged.

Stage 2 practice refactor (2026-10-12): steps 1–5 are documented in [STAGE_TWO_REFACTOR_CONTRACT.md](design/docs/STAGE_TWO_REFACTOR_CONTRACT.md). The approved target uses <60% word-check only, 60–<85% Sound-only and >=85% all-layer scope, separate Listen/Record, sentence text and practiced/best-word-match navigation and recognition feedback that does not override eligibility. New backend learner jobs use practice-gated-v3 with durable word checks and measurement checkpoints; existing v2 jobs retain their exact-word pipeline. Checkpoint and support/feedback migrations are applied to the hosted Libitu database. The API now stores immutable versioned text-support snapshots and owner-bound, idempotent recognition-error feedback without changing tiers; old request hashes and legacy text visibility remain compatible. The new local practice UI defaults to hidden text, separates Listen/Record, saves recording-start/final-peek snapshots, reveals word differences, disables ineligible layers and records recognition feedback without changing gates. New gated measurements map onto the source word axis with unmatched gaps; legacy results remain viewable. Full-content practiced restoration uses a service-only scalar aggregation over surviving owned records, merged with page-lifetime pending takes. Its migration is applied to hosted Libitu. Short-sentence/segment boundaries, paginated history restoration, per-sentence manual take selection, late saves and audio-only/full deletion recovery are implemented and verified locally at desktop/mobile. Stable video folding retains one player. Step 6 (final wider regression) remains pending; the API/worker application deployment is separate from the completed database migration. Original-video reference acquisition is unchanged.

Stage 2 prototype appearance correction (2026-10-12): the sentence directory folds from 260 px into a 56 px numbered rail while retaining practiced markers and manual navigation. The video/reference preparation share a compact card with actual setup/preparation/analysis/ready/error states and telemetry-based preparation progress. Recording uses the shared black Record/red Stop media buttons and a live waveform derived from the recorder’s existing microphone stream. Practice settings opens upward with segmented speed/text controls, a loop checkbox and the existing range select. The three requested redundant sentences are removed. Original reference acquisition, consent, bound take analysis and persistence remain unchanged; no new database or application deployment is involved.

Reference sentence identity correction (2026-10-12): reference capability, saved-capture recovery and preparation snapshot the same derived blueprint view used by the public blueprint route. Recovered caption timing can change sentence identities without rewriting cached semantic analysis; references no longer search those raw cached rows for a displayed sentence. Exact server-owned sentence/bounds, access and upload validation remain enforced. The browser reference panel suppresses its idle playback instruction when recovery/upload has an error.

Original video history (2026-10-11): `/profile` now has an Original videos section, and `/profile/history` supports Videos alongside the unified list. Authenticated ready-content visits update the existing `user_content_states` record; surviving owned Shadow/corpus sources also populate the list. One row per public YouTube content ID opens `/practice/{contentId}` directly in Stage 1. No new migration, playback, analysis request, practice-count or streak inflation is introduced. Failed visit saves offer Retry; account switching does not adopt an already mounted source. See [profile implementation](design/docs/PROFILE_IMPLEMENTATION.md).

Routing and responsibility architecture (2026-10-10): R0–R5 are implemented. At the user's request R3 directly replaces root query learning URLs with `/practice/import` and content-based Reader/segments/Shadow routes, and enables extension v4 only (extension 0.2.0). No legacy route adapter, dual protocol or entry switch remains active. R4's required link producers, content-tab mapping and owner-bound continuation v2 are included; old continuation records are ignored. The content layout retains the controller, reference cache and actual MediaHost across navigation; public content reads/retry semantics and root save ownership remain unchanged. R5 removes the retired v2 capture runtime, Web fallback and legacy entry loader; route state comes from the URL and the content controller accepts resolved IDs only. Invalid client-side links clear prior activation state so Back can recover. Extension source verification reads the shared public `content.content_id` contract. After an import SPA transition, the original sender URL is used only for origin checks; the live top-level document URL and document ID establish current content ownership. Web/extension must update together. Verification and the outstanding real-toolbar tabCapture boundary are tracked in TASK.MD. No database migration or deployment was performed.

Reference setup latency correction (2026-10-10): v4 `ping` is a local capability probe. Explicit `arm` performs one read of `/api/content/{id}/identity`, using public metadata without blueprint/job reads; concurrent identical arms share that check. Passive content-tab reuse uses a separate verified `register` action. The Web UI stays in preparing until the extension acknowledges armed; cancellation, document/source changes and late results cannot re-arm a closed setup. Toolbar capture authorization is unchanged. Reload the extension and Web page together.

Stage 2 sentence-switch capture correction (2026-10-11): the extension no longer treats a URL-less tab `loading` status as a document exit. Sentence/query changes retain the content/document-owned practice-audio session; source URL changes, top-level document commits, pagehide, tab closure and lease expiry still release it. The Web sentence control continues to suspend only the old sample and update the local URL selection. The live toolbar grant remains a separate manual acceptance boundary.

Cross-page loading correction (2026-10-11): the root generic route fallback and the generic Corpus, Loadout and profile route fallbacks are removed. These destinations render their own page shell and auth/data placeholders directly; Landing renders immediately. Client navigation keeps the prior page until the destination commits, avoiding the previous root → route → page placeholder sequence. The dedicated import/content workspace and speaking fallbacks remain in their owning boundaries.

Import loading correction (2026-10-10): `/practice/import` reuses the Reader skeleton for both route loading and pending caption handoff/content resolution. It creates no player while waiting; failures show a separate error/retry panel. The shared content layout chooses its cold-entry skeleton from the target pathname: Reader uses the Reader shell; segments/Shadow use skeletons matching their respective page structures. Once content is ready, internal navigation retains that content while the next route loads; no nested content-route loading boundary replaces it. The fallback reads no search parameters or workspace data. Caption/resolve/analysis sequencing and the persistent media owner are unchanged.

Navigation prefetch (2026-10-10): internal links retain viewport prefetch and warm their full destination on pointer, keyboard or touch intent. Ready Reader warms segment selection; selection warms preparation; preparation warms the exact Shadow route and component code. Known form/action destinations also warm on intent or overlap existing confirmation work. New session/content IDs still require successful creation/resolution before navigation. Prefetch never mounts destination client effects, resolves captions, creates sessions or starts recording. Stage 2 skeletons show only the broad selection/preparation/Shadow layout: a heading, sidebar, video and analysis block as applicable. Per-sentence rows, imitation controls and nested analysis/history details are omitted at the user’s request; responsive ordering is retained.

Route loading correction (2026-10-08): the shared root loading boundary is stage-neutral. Valid Stage 2 deep links initialize the reader directly in Shadow and retain the practice skeleton through blueprint/auth loading; invalid segments return to the reader.

Page loading skeletons (2026-10-08): Stage 2 lazy-code loading uses a practice-shaped skeleton instead of Opening practice text. Corpus, Loadout, profile/history, mission and analytics route/data loading use shared accessible skeletons, including saved-take/history/analysis sections. Reduced motion disables pulse. Empty/error states, save/upload progress and asynchronous assessment status remain explicit.

Saved Shadow practice presentation (2026-10-08): saved takes use bordered cards with separate metadata/actions, small shared buttons and an outlined destructive variant. Reference deletion uses the same variant. Shared button background clipping removes the white halo outside inset edges without changing control dimensions.

Audio save notifications (2026-10-08): pending reference uploads and practice saves share a fixed, responsive notification stack. Blue processing cards and warm error cards use icons, concise headings and retry actions without shifting content. Read-only reference recovery does not count as an upload or trigger an unload warning. Empty queues show no notice; completion removes it. Client-side navigation preserves active saves.

Stage 2 audio preferences (2026-10-08): reference analysis, recording analysis and recording retention share a collapsed Audio settings disclosure. Existing choices and explanatory copy are preserved; processing status, errors and recovery actions remain visible. Prepare-this-sentence uses the outlined secondary button.

Stage 1 loading feedback (2026-10-08): the root route now has a server-renderable loading shell; empty transcript, logic and extracted-expression regions show decorative skeletons only while loading. Each region yields to real streamed content immediately; errors/retry, Saved, player ownership and extension caption preflight remain unchanged. Reduced-motion preferences disable the pulse. This improves pending-state feedback, not network/provider latency or pre-response browser blank time.

Stage 1 card correspondence (2026-10-08): annotations and the sidebar now use the same merged candidate/saved list. Exact source phrases with word boundaries carry card identities; unrelated partial phrases are no longer highlighted. Clicking a highlight selects its category (or retains Saved for a saved card), scrolls/focuses the matching card and does not seek playback.

Stage 1 saved-card highlighting (2026-10-08): transcript annotations derive from extraction candidates plus the current source’s saved corpus. Manual saves, restored records and removals update highlights using source wording while retaining caption text, sentence identity and word timing.


Loadout draft-save feedback now reserves its space while hidden, avoiding form movement on input and option changes. Textarea focus uses a neutral thin outline, and directional links default to the same outlined secondary appearance as directional buttons. All user-facing wording and destinations remain unchanged; the proposed Learn terminology is not adopted.


All visible selects use the shared Radix components, including Loadout settings/source and Corpus sorting. Menus use borderless option highlights, a light panel edge/shadow and inset trigger arrows. DirectionButton/DirectionLink standardize back/next actions at 40 px with 16 px icons; multiline navigation cards keep their card geometry. Reader outer bottom padding is removed and shell height fills the remaining viewport, placing its entry bar against the bottom edge.


Caption cleanup (2026-10-04): English caption normalization removes square-bracket non-speech cues (including their contents), stray square brackets and repeated angle speaker markers before analysis. The web adapter also cleans cached transcript text before corpus annotation. Spoken JSON3 offsets remain source-based; sentence timestamps and identities are preserved for cached display.

Shared application header (2026-10-04): Corpus, My learning/history, Loadout, saved mission, conversation and analytics reuse AppHeader with identical responsive gutters, navigation destinations, active styling and account controls. Mission-specific controls remain in their own content toolbar. Landing and reader retain their specialized entry/stage navigation.

Reader footer follow-up (2026-10-04): the Stage 2 entry bar spans the viewport horizontally, canceling the reader gutter only for this footer. Its content keeps internal padding; other reader sections retain their responsive gutters.

Page canvas follow-up (2026-10-04): the global background and framed page wrappers now use white, including reader, loadout, speaking, analytics and profile/history gutters. Inner warm-neutral surfaces and responsive spacing remain unchanged.

Reader annotation follow-up (2026-10-04): the user approved responsive outer spacing for the reader (16 px, 12 px below 640 px, 8 px below 400 px) without a page border. Corpus now matches the stage navigation links; reference-audio enable actions have a white outlined surface and the reader reference panel has no outer frame. Transcript labels show minute:second values while seeking retains precise timings; timestamps have their own nonshrinking column. The saved-language action uses the standard small button, and shell height accounts for both outer gutters so the footer remains vertically balanced.

Visual-system follow-up (2026-10-04): Inter normal/italic variable fonts are bundled locally and loaded by the root layout. Shared text fields/native and Radix selects own focus, error, placeholder and disabled appearance while keeping existing dimensions. Purple selection tokens unify generic selection controls; learning colors remain separate. Auxiliary async actions now expose pending feedback, and obsolete button-only paint has been removed. Root checks and desktop/mobile fixture checks across nine screens pass; fixtures do not verify real providers. See [the visual system](design/docs/VISUAL_SYSTEM.md).

Shared button system (2026-10-04): web actions now use shared Button/ButtonLink roles, preserving purple primary actions and existing control geometry. Secondary, soft, ghost, destructive and recording actions share focus, disabled, pressed and reduced-motion behavior. Key asynchronous actions preserve their idle footprint while showing disabled loading progress. Selection controls remain separate. Desktop/mobile fixture button checks pass at 1440/390 px, including stable loading size and recording/destructive states. See [usage and verification](design/docs/BUTTON_SYSTEM.md).

Visual consistency pass (2026-10-03): existing web headers and signed-out mission/report gates now share the landing `libitu.` wordmark, preserving their contextual sizes and tagline positions. Warm-neutral surfaces, radius tiers, lighter popover/dialog shadows, keyboard focus and reduced-motion feedback use shared tokens. Existing purple primary actions and all learning/status colors remain. Grid structure, spacing, dimensions and responsive breakpoints are unchanged; the existing font stack remains to avoid a font-metric migration. Extension toolbar bitmap branding is unchanged in this web pass. Root lint/build and 1,185 tests pass; desktop/mobile fixture rendering and corpus/profile regressions pass. Browser verification uses synthetic identity/content and does not constitute real login, media or provider acceptance.

Landing page (2026-10-03): `/` now introduces Libitu with a validated video form, optional Shadow explanation, illustrative language-transfer example and real Clerk account controls. Source/content/job/handoff query links retain the existing Stage 1 workspace. Pasted watch/share/mobile/Shorts URLs normalize to a canonical video URL; missing titles no longer borrow demo metadata. Same-tab input drafts survive refresh and authentication redirects. The prominent prototype-style “or / Add to Chrome” entry opens a verified configured store URL or clearly labelled installation guidance. Stage 1 explicitly says no sign-in is required. Root lint/build/tests and responsive browser checks passed. Real Clerk login/register forms and switching were verified; completed OAuth/email login remains a separate acceptance check. See [implementation and verification](design/docs/LANDING_IMPLEMENTATION.md).

YouTube multilingual language gate (2026-10-02): the extension honors `defaultAudioTrackIndex` and the default track's language identifier before caption fallbacks. It no longer treats the first ASR caption as the spoken language when several dubbed languages exist, or assumes the first `hasDefaultTrack` identifies the audio default. Ambiguous multilingual metadata remains unsupported. The reported Lisa Su video (`-sKAMB10eh0`) supplied the regression structure; 118 extension tests and manifest validation pass. Live verification of the updated extension requires a manual extension reload and source-page refresh.

Corpus library (2026-10-02): `/corpus` now provides cross-source search, OR-within/AND-between filters, recency/value/transferability/alphabetical sorting, grid/list layouts, stable multi-selection, source-backed detail, persisted editing/deletion and bounded merging into the existing Loadout draft. Guest and authenticated storage share the existing corpus boundary. Decks, corpus usage aggregation and review scheduling remain outside this increment. See [implementation and verification](design/docs/CORPUS_LIBRARY_IMPLEMENTATION.md).

Stage 5 (2026-10-01): completed missions now open `/speaking/[sessionId]/analytics`. Four-dimension reports use a frozen transcript, exact quoted evidence, deterministic score aggregation and a durable DeepSeek assessment worker. Reports recover after refresh; selected-language observations distinguish prompted use, uncertain data stays unscored, up to three conservative refactors can be saved to corpus, and retry/adjust actions preserve the previous mission and existing drafts. The feedback migration is applied; real provider/storage and responsive browser checks passed. Human rubric calibration and production qualification remain pending. See [contract, operation and verification](design/docs/STAGE_FIVE_CONTRACT.md).

Personal learning center (2026-10-02): `/profile` and `/profile/history` now show Clerk account information, separate saved Shadow takes and participated Missions, corpus counts, recorded Shadow duration, local-calendar streaks, real activity trends and paginated practice history. The history page has server-side All / Shadowing / Missions filters, local-date groups, times, practice status, source/report links and retryable incremental loading. Authenticated FastAPI reads existing owner-scoped records; no new assessment or database schema is introduced. A separate card now reads the latest compatible four-dimension Stage 5 report, and completed Mission history opens Analytics. These reads never request assessment or convert session scores into general ability. Account-bound browser continuation restores ready source/segment/sentence locations; older saved attempts link back to their source. Ability dimensions remain explicitly unassessed. Corpus navigation now opens the independent `/corpus` management page. See [scope and verification](design/docs/PROFILE_IMPLEMENTATION.md).

Stage 4 (2026-10-01): `/speaking/[sessionId]` now provides the shared Voice/Chat workspace, continuous Gemini Live voice with automatic turns and interruption, text input, recoverable transcripts, selected-language evidence, asynchronous DeepSeek analysis and a deterministic next-response teaching controller. Owner-scoped Supabase CAS storage, one-use runtime tickets, takeover/end/delete fencing and interrupted-playback recovery are implemented; the migration is applied. Real text/voice + analyzer + database smoke checks and responsive browser checks passed. Stage 5 reports are implemented above; manual transcript editing and production performance qualification remain separate. See [implementation, configuration and verification limits](design/docs/STAGE_FOUR_IMPLEMENTATION.md).

Speaking loadout (2026-09-30): `/loadout` now uses the shared real corpus with scenario, goal, difficulty, feedback and optional logic settings. Chunks/idioms share five expression slots, structures have three, and at least one item is required. Account-bound browser drafts survive refresh and login. Authenticated creation persists ordered language snapshots atomically through Supabase, with idempotent retries and an owner-scoped session preparation page. The migration is applied; real database/RPC/API snapshot, ownership and concurrent-retry checks passed with isolated synthetic accounts. The Stage 4 increment adds real role-play and turn persistence; Stage 5 above adds final assessment. See [contract and verification](design/docs/LOADOUT_IMPLEMENTATION.md).

Sound/layout correction (2026-09-29): video and practice controls remain above the three-layer workspace. Sound now restores all ten prototype phenomenon filters, two marked text flows, exact-occurrence highlights, linking arcs, inline badges, hover/focus dictionary IPA and the color legend. Both rows support hide/individual reveal. Five existing rule types supply possible-reading targets; vowel/pause timings remain measured data. Additional acoustic realization detectors are still unavailable.

Browser reference server analysis and compact workspace (2026-09-29): implements the flow above. This supersedes the default local-only alignment and earlier duplicate measurement/score-sidebar layout; older dated entries below are historical. The new reference-wait migration is applied to the connected project. Root lint/build/test (803 tests), desktop/mobile browser acceptance and real synthetic reference/learner ASR/MFA/storage/cleanup smoke checks passed.

Browser reference alignment (2026-09-26): the local PCM reference path now feeds a browser Worker for caption-conditioned word/phoneme alignment, alongside its existing Silero/Pitchy measurements. The same bounded captured clip owns both results; basic measurements publish before alignment finishes. Local reference words can be displayed alone or paired in the browser with the matching saved learner word sequence. Reference audio and derived alignments remain page-local. No server file-source registration is needed for this path. Forced alignment does not independently verify spoken content, and cross-engine scores remain empty. See [runtime, limits and verification](design/docs/STAGE_TWO_LOCAL_ALIGNMENT.md).

Stage 2 result recovery and partial evidence (2026-09-24): reading an existing analysis is independent of consent to analyze new recordings. Initial entry and sentence changes restore the latest saved take; history refreshes and late saves preserve a manual selection. A new recording enters the workspace through its exact acknowledged take ID, and a changed save version refreshes the same selected ID. Learner-only Sound now displays available vowel-duration and boundary-pause measurements with empty comparison scores. File reference plus local learner audio shows explicit REF/YOU states across all three layers; its Melody curves use normalized sentence time and are not aligned word by word. This display/state increment adds no detector or upload authorization. Root lint/build/test and desktop/mobile result, Sound and persistence regressions passed; synthetic microphone recordings also ran actual local Silero/Pitchy inference. See [the increment](design/docs/STAGE_TWO_SOUND_COMPARISON.md).

Three-layer paired comparison (2026-09-23): saved takes now show Reference / Your recording in Sound, Rhythm and Melody using the prototype layout. New `practice-comparison-v2` results retain aligned phone durations and boundary timing, with experimental vowel-timing, boundary-pause, Rhythm and Melody resemblance scores plus coverage. Eight Sound realization checks remain unsupported and unscored; there is no overall Sound grade or observed stress detector. Revoked references also hide nested assessments. See [implemented checks, formulas and limits](design/docs/STAGE_TWO_SOUND_COMPARISON.md).

Learner analysis (2026-09-22): purpose-specific opt-in, temporary private input, durable PostgreSQL worker jobs, independent local ASR content checks before MFA, per-word duration/pause/relative-pitch comparison and saved results are implemented. Historical results recover after refresh; cancellation and deletion fence late workers. Paired reference output requires a matching permitted file source, while learner-only measurements work independently. No pronunciation score, observed stress classifier or general YouTube reference upload is enabled. See [setup, lifecycle and limits](design/docs/STAGE_TWO_PRACTICE_ANALYSIS.md).

Rhythm text display (2026-09-22): local and file-reference practice now show sentence text with dictionary syllable-stress dots and detected pause bars/durations. All syllables use three sizes of solid amber dots, dark to light for primary/secondary/unstressed dictionary stress, including single-syllable words. Alternative stress patterns remain unknown. Compact REF phrase rows carry pause bars and durations; the duplicate speech/pause timeline is removed. MFA positions and approximate caption positions are identified separately. Unplaceable reference pauses and all learner pauses retain audio-relative times; actual sentence emphasis and learner word alignment remain unevaluated. Sound and Rhythm share one dictionary request/cache per practice.

Server reference preparation (2026-09-22): operator-registered permitted file sources now support automatic selected-segment preparation, private normalized WAV assets, a PostgreSQL-backed acoustic worker queue with leases/retry/cancellation/deletion, incremental sentence measurements and authenticated SSE/status recovery. Stage 2 uses file playback/current-next prefetch and displays reference measurements in all three layers when a permitted source exists. Ordinary YouTube sources keep the local flow. This foundation was followed by the learner-analysis increment above; validated sound detectors remain planned. The migration is applied; real synthetic storage and desktop/mobile browser checks passed. All 16 licensed seed clips ran real VAD/F0 measurements; two clips also passed real MFA word/phone alignment (accuracy remains unlabelled). See [implementation and operational limits](design/docs/STAGE_TWO_SERVER_REFERENCE.md).


Shadow login and practice persistence (2026-09-19): clicking Start shadowing now requires Clerk sign-in and preserves the selected source/segment/sentence return URL. Completed takes save account-owned practice records; optional, explicitly selected recording retention stores learner audio in a private Supabase bucket. Sentence history supports replay and record/audio deletion after refresh. A bounded page-level outbox retries failed saves across sentence/stage navigation; unacknowledged data is still page-local and is released on refresh/exit/account change. The schema/bucket migration is applied and a synthetic live storage round trip passed. Browser authentication fixtures do not prove real Clerk/OAuth completion. Browser-only acoustic measurements are still not saved. The later reference and learner pipelines add server evidence; durable offline pending saves and production account-deletion/retention jobs remain separate work. See [contract and limits](design/docs/STAGE_TWO_PERSISTENCE.md). This supersedes earlier blanket descriptions of all Stage 2 learner audio being temporary.

An offline acoustic benchmark foundation is now available under `apps/api/benchmarks/acoustics/v1`: versioned Pydantic/JSON Schema contracts, source/audio integrity and split checks, target-level metrics, independent annotation instructions, and 16 licensed public speech clips (4 adult speakers, 49.107 seconds, all dev). Its 64 annotation work items remain pending; no human phenomenon gold labels, detector inference, accuracy claim, or online integration was added. A separate 256-recording collection plan is unexecuted. See [the benchmark](design/docs/STAGE_TWO_ACOUSTIC_BENCHMARK.md); F1–F4 now have the bounded implementations described above; source expansion and validated M4b detectors remain pending.

Stage 1/2 now share an explicitly enabled, source-owned local audio buffer (v3). Valid continuous 1× playback supplies PCM coverage; the selected segment reports actual sentence coverage, permits visible/cancellable preparation, and reuses current/next reference analysis across stages. It consumes the existing JSON3 sentence/word mapping without pretending provider word starts establish acoustic ends or phoneme realization. No server audio ingestion, MFA, Realtime or cross-user audio cache was added. See [the implemented flow and limits](design/docs/STAGE_ONE_BUFFERED_REFERENCE.md). This is a local correction to the supplied capture-flow proposal; the file target is now available conditionally for operator-registered permitted sources.

The web app, API and extension are currently local development versions. Work and
verification target that local setup, not a deployed production website.

| Area | Current state | Next meaningful outcome |
|---|---|---|
| Monorepo | pnpm workspace and Turborepo configured | Keep root commands green |
| Web | Stage 1 corpus persistence, Loadout drafts, Stage 4 Voice/Chat and Stage 5 evidence-linked reports with retry/adjust actions, plus private activity/history and latest-report summaries; pending Shadow saves survive client-side route changes | Complete real OAuth acceptance; add Decks and corpus usage aggregation |
| API | FastAPI routes, Clerk identity, recoverable queued blueprint workers, local subtitle punctuation, stage timing, YouTube fallback, and live Doubao text analysis | Add rate limits and external metrics export |
| Extension | YouTube player-control button and toolbar action verify English video metadata, perform a bounded passive caption preflight, then open Stage 1; session handoff preserves browser captions | Harden caption acquisition across YouTube UI variants and add playback controls |
| Shared packages | Types, pure core helpers, UI tokens, config | Add only contracts used by two or more apps |
| Auth | Clerk UI, Next.js middleware, and FastAPI identity verification are configured locally | Finish hosted Clerk-Supabase trust setup and add real-token integration tests |
| Database | Supabase persists content, jobs, blueprints, corpus, speaking snapshots/transcripts/evidence and leased immutable-input assessment reports | Qualify operational recovery, retention and production supervision |
| Cache | Upstash queue, versioned blueprint keys, pending-job recovery, bounded requests, worker heartbeat, and locks implemented | Add rate limiting and a durable retry scheduler |
| AI | Local caption cleanup, Doubao text semantic blueprints, OpenAI Realtime conversation/teaching control and bounded Doubao text session assessment with validated quotes | Calibrate conversation judgments against independent human-reviewed examples |

## Product references

- `design/docs/Libitu_Design_Spec.md`: product behavior and interaction requirements
- `design/docs/MVP_SYSTEM_DESIGN.md`: architecture, state, and data flow
- `design/docs/BACKEND_SYSTEM_DESIGN.md`: API implementation boundary
- `design/docs/DEVELOPMENT_ROADMAP.md`: dependency-ordered delivery plan
- `DECISIONS.MD`: accepted decisions and unresolved choices
- `TASK.MD`: current task queue and acceptance criteria

## Definition of the first complete release

The release is coherent when a learner can:

1. Start from a supported YouTube page
2. Receive or restore a cached blueprint without mandatory login
3. Save at least one chunk or structure
4. Create a speaking session with selected corpus items
5. Complete turns and receive evidence-based feedback
6. Reload and recover the state promised for anonymous or signed-in use

## Current constraints

- Never upload or persist third-party YouTube audiovisual media without sufficient content and platform rights
- Allow authenticated learner recordings and derived learning records to use server storage under purpose-specific analysis, retention, deletion, and model-training choices
- Do not claim an integration exists until code and tests prove it
- Keep API schemas explicit and version processing output with `analysis_version`
- Preserve provider boundaries for auth, persistence, captions, and language models
- Exclude spaced repetition from MVP work

## Implementation notes

- Caption-first timing (2026-09-13): an early, top-frame MAIN-world observer passively copies the current video's English JSON3 responses from the player's own fetch/XHR requests. It never reconstructs/replays signed URLs or generates tokens. A launch may best-effort select an advertised English automatic track through visible controls, records the prior selection when possible, restores the prior caption state after the read, gives the observer up to six seconds to see the player's response, then performs only the existing bounded DOM/server-caption fallback before creating Stage 1. It never waits indefinitely or adds a second polling delay. The observer retains only bounded current-video tracks, discards stale SPA responses and distinguishes missing observer, unobserved captions and acquisition/format failures. Private YouTube menus and trusted-gesture requirements can make automatic selection or restoration fail; JSON3 without offsets remains usable block timing. Live target-video recovery after this change still requires verification.
- Rich sources produce shared `sentence-v3` rows with caption-origin word starts and explicitly estimated/nullable word ends. Legacy plain-text `sentence-v2` navigation remains compatible. Stage 1/2 use one source-token mapping; missing, ambiguous or very long estimated word intervals do not receive fabricated highlighting. Basic embedded playback does not wait for audio analysis. The 50 ms word clock updates local classes rather than page state; Stage 2 code is dynamically loaded.
- Stage 1 shows word-timing availability beneath its subtitle controls; Stage 2 shows it beneath the selected sentence. Notices use the exact highlighting eligibility gate, distinguish unavailable/partial data from switched-off/hidden text, and never block playback. Coverage is memoized from current captions, not recomputed on playback ticks, and adds no network request.
- Old-cache timing recovery is a separate, non-blocking enhancement after the completed blueprint is visible. A bounded extension request reads fresh JSON3 from an already open, matching YouTube tab without depending on the old handoff. A timing-only API accepts matching video/language and unchanged source words, preserves the original source text and semantic analysis, and saves only caption timing. Failed acquisition or validation keeps listening available and offers an explicit retry. Stage 1 applies recovered views while paused; an active Stage 2 keeps its sentence/recording snapshot and asks the learner to return to Stage 1 before applying the update. No automatic reload, new analysis job or media capture is involved.
- Raw caption metadata accompanies private source text and queued content; new blueprint documents retain timing metadata. Timing-only changes reuse existing semantic analysis through a bounded derived-view cache, with a separate caption fingerprint. Different source words cannot inherit old timing. Final JSON is gzip-compressed when accepted; an opt-in SSE protocol sends unchanged word timings only once per connection, with full reconnect snapshots and client-side identity-checked restoration. Live YouTube endpoint coverage and acoustic word-end accuracy remain unverified; see `design/docs/SENTENCE_SEGMENTATION.md`.

- Stage 1 resolves content, creates or resumes a processing job, streams validated job previews over SSE, and fetches the completed blueprint through `apps/web/features/stage-one/api/stage-one-api.ts`.
- Initial load and Retry share one abortable effect. Cleanup cancels fetch, SSE, and polling; cancellation never falls back to polling. Identical previews are suppressed. Preview and final corpus items share content-derived UI identities, a learner-level ranking policy, a 12-item limit, and source-evidence highlighting. Logic IDs and timestamps remain stable across finalization, and cached ready jobs skip stale previews. Normal streaming updates and development Strict Mode remain enabled.
- Web regression tests run with Node 22.15+ via `pnpm --filter @libitu/web test`, using built-in test mocks without paid providers. The optional `apps/web/tests/stage-one-render.browser.mjs` check uses Playwright and an existing dev server to verify DOM identity and request counts on desktop/mobile; `LIBITU_PLAYWRIGHT_MODULE` can select an externally installed Playwright runtime.
- Stage 1 uses the YouTube IFrame API for timestamp seeking. Transcript lines and logic nodes seek the same stable player; transcript clicks and normal playback select the latest timestamped logic node at or before the active subtitle. Streamed transcript callback changes do not destroy the iframe. The redundant Chapters UI and inferred chapter timestamps are removed; `chapters` remains in the backend contract for compatibility with cached blueprints.
- Stage 1 transcript selection now opens an analysis card on mouseup. The card sends the selected span plus the current, previous, and next subtitle lines to `/api/corpus/analyze-selection`; the configured Doubao text adapter follows separate explanation and seven-module syntax task sections, explains the exact selection in context, and validates any boundary expansion against the current subtitle. Complete selections show no redundant boundary message; only `needs_expansion` renders a suggested unit and reason. Explanation stays first, syntax remains available, inferred chips are editable, and accepted expressions or reusable structures use the same local/account save flow as extracted candidates. Provider failures are visibly labelled and never replaced with fabricated meanings or IPA.
- Stage 1 exposes source-grounded practice segments, a bottom Stage 2 CTA, and a timeline/card picker. Stage 2 Milestone 1 adds a sentence directory, previous/next and keyboard navigation, separate play/pause/seek, mutually exclusive sentence or segment looping, and the playback speeds reported by YouTube. Preparation reports the actual available sentence count without simulated audio-analysis progress. Switching a sentence or range pauses playback; entering or refreshing Stage 2 restores the selected sentence without autoplay.
- Stage 1 and Stage 2 share server-finalized transcript rows: `sentence-v2` for plain captions and `sentence-v3` for structured caption sources. The local spaCy small English pipeline conservatively merges incomplete punctuation candidates; complete long sentences are not split into child units or cut at a word limit. Each row carries a source/timing fingerprint, normalized source token range, boundary provenance/confidence, and caption-estimated start/end. Same-timestamp sentences and repeated text remain independently selectable. Stage 2 consumes versioned rows directly; wholly legacy client responses retain the previous navigation fallback. `stage`, `segmentId`, and `sentenceId` recover selection, stale sentence IDs fall back safely, and timings remain approximate rather than acoustic evidence.
- Existing blueprints receive a bounded, process-local cached sentence view on read without new Doubao text calls or changes to persisted semantic analysis and personal corpus snapshots. Legacy punctuation is treated as uncertain, and lost internal caption anchors cannot be recovered. New worker results retain the richer source anchors and the exact sentence metadata through SSE, finalization, and personalization. See `design/docs/SENTENCE_SEGMENTATION.md` for evaluation and limitations.
- Stage 2 pure sentence and playback-controller tests run in the normal web suite. `apps/web/tests/stage-two-navigation.browser.mjs` uses an existing dev server and mocked API/player to exercise desktop, tablet, and mobile navigation, looping, playback speed, and refresh recovery. Real YouTube seek precision is not established by the mock.
- Stage 2 Milestone 2 adds microphone recording for the selected shared sentence ID, with permission/error states, Stop/Cancel, a timer, and local Replay/Re-record/Delete. Browser MediaRecorder produces one temporary take for the current sentence, capped at 60 seconds. A new successful take replaces the old one; cancellation or failure preserves the previous take. Changing sentences or leaving/refreshing Stage 2 clears the take, and hiding the tab cancels unfinished capture. Audio is held in a Blob/object URL in page memory only; microphone tracks, timers, and playback resources are released on cancellation and exit. Reference playback is paused during recording, and replay/reference playback are mutually exclusive. This M2 increment adds no media upload, model call, score, or recording history. The M3 implementation described below adds local reference access and Rhythm/Melody measurements; Sound detectors and the Stage 3 mission remain planned.
- Recorder lifecycle tests run in the normal web suite. `apps/web/tests/stage-two-recording.browser.mjs` additionally checks actual Chrome encoding/decoding/replay with synthetic microphone input and mocked API/YouTube playback at desktop/mobile widths. This verifies the local media path without recording a person; physical microphone permissions/devices, Safari, and live YouTube interaction still need manual checks.
- Stage 2 Milestone 3 adds browser-local reference capture and acoustic comparison. On Chrome 116+, Enable practice audio plus one same-tab toolbar invocation opens a practice audio session without autoplay. Normal sentence listening at 1× automatically prepares each missing reference; sentence changes reuse authorization and an in-memory cache of up to 20 reference results. Microphone recording/replay cancels any active reference clip. The tab stream remains connected between clips, but no idle MediaRecorder or retained PCM runs. Leaving/refreshing closes the session and clears its cache. Playback discontinuities and invalid/late captures fail explicitly. Both reference and microphone clips are analyzed asynchronously with self-hosted, pinned Silero V5 / ONNX Runtime Web and Pitchy. The panel shows quality-gated speaking span, internal pauses, pitch range and speaker-relative curves, with no ASR, Sound detector or pronunciation score. This is automatic preparation during listening, not ingestion-time preprocessing. No additional API key is needed; initial model/runtime assets total approximately 13 MiB before compression/cache. Stage 1 and the dynamically mounted Stage 2 consume one page-level reference context, and same-source history updates with transient loading status keep the extension lease and REC badge alive. See `design/docs/STAGE_TWO_ACOUSTICS.md` for setup and validation limits.
- The local-only M2/M3 media lifetime remains the implemented prototype. The accepted production direction permits authenticated learner attempts, recordings, versioned assessment evidence, and progress profiles to persist on the server. Upload for immediate analysis, keeping a recording for later playback, and using it for model training are separate purposes and controls; training is opt-in and off by default. Unlicensed YouTube reference audio is not a server asset. Ordinary YouTube practice stores the video locator and sentence bounds; licensed content supplied directly by its rights holder may be ingested once, split into shared reference clips, and reused by learner attempts without duplicating the reference audio per user.
- Stage 2 Milestone 4 now has a text-only Sound guide: a pinned, vendored CMU pronunciation dictionary and conservative rules suggest linking, weak forms, within-word flaps, coalescent assimilation and cluster elision. A sentence-bound API reads the finalized server sentence; the web highlights the exact occurrence, offers filters and explanations, shows unknown/multiple dictionary readings, and caches up to 20 guides for the current practice. Original and learner recordings have separate explicit Sound abstention states. This adds no new API key or paid LLM call. M4's aligned, individually validated acoustic detectors remain unfinished; usable M3 VAD/pitch is not Sound evidence. See `design/docs/STAGE_TWO_SOUND.md`.
- Stage 2 now presents Sound, Rhythm and Melody as three distinct persistent tabs, with matching left-side shortcuts, a central layer canvas and a right-side layer focus. Sound has dictionary-IPA word cards, conditional phenomenon badges, filters, source-bound detail, Hide text, individual word reveal and Reveal all. Rhythm shows dictionary syllable stress, text-anchored reference pauses and saved learner word timing; Melody shows relative pitch contours and pitch range. All three share the current sentence, recording and existing analysis/cache state; tab changes preserve guide filters and hints without playing audio or restarting analysis. Left/Right, Home and End navigate the tab list. The shared practice area stays above the layer workspace: the video comes first, followed by one neutral operation bar containing Play reference, Record/Stop, Replay mine, Range, Loop and Speed. Reference-audio connection appears as a compact status row below the controls, setup details are collapsed under How It Works, and actionable errors remain visible. Desktop keeps the controls on one wrapping row; mobile stacks the same groups without changing their order. This layout follows `design/prototypes/toneflow_stage2_three_layer.html` and the control styling in `design/docs/DESIGN.md` without adding illustrative scores, word-stress marks or unimplemented detectors.
- Transcript annotations use amber for chunks and teal for structures. The API emits annotations for new analyses, while the web adapter reconstructs split-caption annotations for cached blueprints.
- Stage 1 auto-scroll follows the active playback subtitle only while the video is playing. Paused or ended playback suspends alignment while leaving the control available to change the setting; manual transcript scrolling still creates a temporary pause, but the auto-scroll control continues to toggle on/off and turning it back on resumes alignment during active playback.
- Selection cards dismiss on outside pointer interaction unless pinned with the top-right pin toggle. Each new transcript selection replaces the old card, resets pin/note/tab state, and gets a unique identity so late analysis or save completions cannot overwrite or dismiss the new card. Desktop/mobile browser regression coverage checks dismissal, pinning, replacement, and stale responses.
- `apps/web/features/stage-one/data/stage-one-demo.ts` is now a fixture only; the Stage 1 component does not import it directly.
- In queue mode, processing jobs return `pending`, are pushed to Upstash, and are consumed by `apps/api/app/workers/blueprint_worker.py`. Tests use the deterministic inline path and never call a paid model.
- `pnpm dev` starts the API server and blueprint worker together. `/health/ready` reports a missing or unreachable queue worker instead of allowing silent pending-job accumulation.
- The worker prefers browser-provided captions, falls back to `youtube-transcript-api`, and asks Doubao for validated JSON blueprint output.
- Analysis version selection is server-owned. Job IDs and blueprint cache keys include the active version; pending jobs are safely re-enqueued and obsolete queued versions fail without a model call.
- Stage 1 detects missing current-version blueprints behind old shared job URLs and resolves the server-owned active job instead of retrying the stale job forever.
- Jobs expose their current processing stage, timestamps, per-stage milliseconds, and an ephemeral validated analysis preview. The worker publishes cumulative local subtitle batches before consuming Doubao text SSE, handles two jobs concurrently by default, and emits structured lifecycle logs without transcript content.
- `mvp-v9` loads the maintained Stage 1 system prompt from `apps/api/app/prompts/stage_one_system.txt` and asks Doubao text for 16-32 evidenced chunks, idioms, and structures plus summary, chapters, logic, key points, and scenarios. Every generated text field has a hard word bound and the prompt forbids transcript reproduction. Candidates retain usage, register, scenario, phonology, pattern-family, CEFR, and quality-score metadata; blueprint reads rank and return a three-kind-balanced subset for the requested learner level without rerunning the model.
- English transcript normalization removes only standalone `um`, `uh`, `er`, and `ah` tokens and joins caption continuations. Independent complete sentences are no longer combined solely because they share a timestamp. The finalized source words are shared by Doubao text, displayed subtitles, and evidence validation; raw caption text remains stored as the source payload.
- English subtitles with reliable source sentence punctuation bypass sherpa-onnx and receive deterministic normalization. Other subtitles are sent to the local INT8 model without external sentence punctuation; model punctuation is attached to the original source words, model casing is ignored, and all paths normalize duplicate/conflicting marks and high-confidence opening discourse markers. Missing models, unsupported languages, or alignment failures use conservative deterministic merging.
- Stage 1 displays the source video immediately and streams locally formatted sentence batches from `/api/jobs/{job_id}/events`, then progressively fills Doubao text summary, logic, and evidenced corpus candidates; browser polling remains a disconnect fallback. One-job input is explicitly capped at 240,000 characters, and semantic-only output budgets scale from 32K to a bounded 64K retry without carrying transcript sentence metadata. Retry previews are monotonic, so a fresh provider attempt cannot clear fields already shown. The browser waits up to ten minutes for an active long job and keeps its last preview during explicit Retry.
- A 2026-09-05 production diagnosis found that the latest 54,852-character failed transcript spent 12.491 seconds formatting and 230.952 seconds in DeepSeek before `analysis_response_truncated`; total job time was 251.5 seconds. The former browser deadline was 210 seconds, so it could report failure while the worker was still active. This evidence drove the `mvp-v7` output bounds, 32K/64K budgets, monotonic previews, and longer client deadline.
- The Chrome extension adds a Libitu icon button to the YouTube player's lower-right control bar and uses the toolbar action for the same launch. Both inspect YouTube's video-language metadata against an explicit supported-language list, currently `en` only. The player button stays disabled while checking and for non-English or unknown languages; its hover hint explains why. Unsupported toolbar clicks show an action badge/title and an in-player message without launching. URL, video DOM, and SPA navigation checks still guard entry; player-control redraws reattach the button, and repeated clicks focus the existing Stage 1 tab.
- Stage 1 opens after lightweight metadata validation, before caption capture or API calls. A random handoff ID refers to a 15-minute extension-session record; the same-origin web bridge delivers browser captions with bounded waits and the existing backend caption fallback. Transcript text stays out of the URL. Stage 1 owns content/job creation, replaces handoff parameters with durable content/job IDs, and preserves abortable loading, explicit Retry, and streamed previews.
- Missing captions produce an unsupported state instead of returning the old Anthropic demo blueprint.
- Private corpus and speaking endpoints derive ownership from a verified Clerk user instead of accepting a client-provided `user_id`.
- Anonymous corpus saves use `libitu:corpus:v1` in localStorage. Login atomically claims guest items into an account-specific pending outbox, merges with the account list, and acknowledges each successful upload separately. Source/kind/phrase keys deduplicate retries; existing cloud edits win. Logout and account switches never expose or transfer another account's pending items. Failed sync remains visible and retryable, and storage failures are not reported as successful saves.
- Saved shows this video's stored snapshots, independent of the currently ranked candidate pool. Saved cards use a delete icon; other tabs show a check for saved items and a plus for unsaved items. Clicking any corpus card opens a full explanation/syntax dialog with the captured subtitle and adjacent context. Candidate details are cached for the page session without saving the item; saving carries that detail into local/account persistence. Legacy saved items generate their missing detail on first open and persist it, so later opens are cache hits. Full learning metadata, reusable slots, context, and analysis survive reload. The cross-source `/corpus` library now adds filtering, selection, persisted editing/deletion and Loadout handoff.
- Configured corpus requests use the Supabase server repository with explicit owner filters, verified source access, and idempotent inserts. Queue mode without a database returns 503; only unconfigured inline development/tests retain the in-memory adapter. The frontend never receives a Supabase secret or writes with an unverified user ID.
- Supabase project `ulrdykwhggcaspylines` has the initial, Clerk RLS, processing-document, job-observability, and idiom-kind migrations applied. Prior advisors reported only intentional private-schema RLS and unused-index informational notices; the latest advisor recheck encountered a transport failure.
- The Next.js app includes Clerk middleware, provider wiring, and sign-in controls. Hosted Supabase Third-Party Auth still requires its final dashboard save before Clerk tokens can be used directly with the Data API.
- Account buttons capture the full current browser URL at click time and pass it as Clerk's forced return target for both sign-in and sign-up, including transfers between the two flows. Source/job/content parameters and fragments are preserved without reading browser state during server rendering. Primary-button hover/focus uses defined design tokens.
- Upstash stores the processing queue, short-lived content/job/blueprint state, and processing locks. These keys expire and are not the durable source of truth.
- The Supabase processing-document migration is applied and the server repository is active for content, private transcripts, jobs, and blueprint documents.
- A live end-to-end queue test reached `ready` after one attempt and persisted four logic nodes and six corpus candidates. The YouTube fallback separately fetched 1,847 timestamped caption lines from a public test video.
- `design/docs/DATA_ARCHITECTURE.md` defines Supabase, Clerk, and Upstash responsibilities.


2026-09-30 layer guidance correction: restore the right-side Layer focus, Feedback and Tip cards for Sound, Rhythm and Melody. Sound guidance follows the selected phenomenon and uses the current sentence’s rule suggestions; conceal mode also hides word-specific sidebar text. Desktop places guidance beside the layer canvas; narrow screens place it below. The video remains above the workspace. Removing the experimental score sidebar did not authorize removing instructional guidance; no illustrative scores or detected-error claims are restored.


2026-10-15 Reference retry repair: preparing the same browser capture after deletion/expiry now allocates a new deterministic generation; active generations remain idempotent and historical rows/take bindings are never revived. HTTP 410 during upload/status/retry clears stale readiness and stops polling, allowing explicit preparation again. MFA version probes use isolated temporary runtime directories, cache only exact successful version checks and distinguish process startup failures from version mismatches. The UI distinguishes alignment-service outages, timeouts and alignment failures from caption timing/coverage failures. Reference still uses source-transcript MFA with quality checks; acquisition and learner ASR/60–85 gates are unchanged.


MFA startup validation (2026-10-15): both reference and learner workers check the pinned MFA version before reconciling or claiming jobs. A startup failure exits with a service-level diagnostic and leaves queued jobs untouched. Each sentence invokes alignment directly, retaining audio/model integrity, quality checks and versioned result caches. Restart workers after changing the installed MFA runtime.


Stage 2 unified analysis (2026-10-15): Audio settings now has one Server analysis switch for captured/registered Reference and new learner takes, default on. A versioned browser/account preference explicitly remembers off; legacy separate preferences are superseded. Historical recording retention remains separate and default off. Turning analysis off prevents new capture registration, registered-file preparation/upload/retry and learner analysis; submitted tasks continue and saved results remain readable. Microphone activation and original audio acquisition remain explicit.


2026-10-15 Sound presentation: restore the supplied screenshot’s text-first default appearance. All shows candidate phonology marks/linking arcs without per-word acoustic measurement clutter, even after analysis completes. Vowel len. explicitly shows retained vowel durations; Linking shows measured boundary pauses. Keep the existing wrapping typography, IPA reveal, Reference/Your voice rows, guidance sidebar, tab state badges, Rhythm/Melody and server analysis/gates unchanged. This is a presentation adjustment, not a rollback of analysis or a fabricated pending state.


2026-10-15: learner acoustic analysis now runs independently of pending Reference analysis after the unchanged 60/85 word gate. Save the learner checkpoint before waiting; resume final comparison without downloading, decoding, ASR or MFA again. Queue claiming permits missing learner checkpoints even after ASR succeeds, including lease recovery. The hosted `parallel_learner_acoustics` migration updates the claim predicate only; owner, expiry, lease and service-role boundaries remain intact.

Learner workers preload one isolated resident `small.en` process before claiming jobs. Reuse the existing CPU/int8/two-thread model, English/beam-5/temperature-0 settings and reliability thresholds. Requests are serialized per worker, timeout at 180 seconds, and kill/reap the child on failure; the next request rebuilds it. Reference still uses source-transcript MFA; acquisition and audio/alignment quality rules are unchanged. Extra workers each retain their own model memory; parallelism requires both workers and sufficient CPU/RAM, and cold MFA lexicon initialization may still serialize.


Parallel-analysis verification (2026-10-15): root lint/build/test passed (941 API, 368 Web, 114 extension; unchanged Web/extension tasks cached). Disposable PostgreSQL with all repository migrations passed the queue regression, including crash recovery after ASR, durable acoustic checkpoint waiting, retry-budget preservation, stale leases, owner isolation and deletion. Hosted claim migration applied and verified: service role can claim, anon/authenticated cannot. Security advisor has no warning/error (existing informational private.content_payloads RLS-without-policy notice). Local dev stack restarted; both MFA startup checks passed and the learner worker confirmed resident ASR readiness before claiming. The real same-input ASR benchmark recorded 8.794 s → 5.490 s median across three runs, identical evidence, 2.839 s one-time startup; end-to-end parallel wall time remains unmeasured.


2026-10-15 parallel end-to-end measurement: three real storage/queue/inference/UI runs with 3.746-second synthetic speech completed in 50.746/80.131/57.191 s from Reference registration, or 37.342/71.490/48.306 s from learner audio PUT. MFA remains the largest compute stage (17–34 s/invocation). Run 2 found Reference result-save HTTPError causing backoff and repeated MFA; learner checkpoint resume avoided recomputation. Audio local cache hit throughout; final persist-to-display delay 1.161–2.961 s. Fixture auth/source and local environment limit generalization. No additional optimization was shipped in this measurement. Evidence/method/next candidates: design/benchmarks/stage-two-20261015/results.json and STAGE_TWO_REFACTOR_CONTRACT.md. Synthetic data/test page cleaned, regular dev restored.


2026-10-16 progressive acoustics: new >=85% Takes persist complete 10ms server F0/energy, then publish `coarse_ready` before MFA. Reference publishes and caches server signals before source-transcript MFA; two sides share computation and aggregation, using ASR/subtitle boundaries with explicit provenance. Preview uses F0+energy only; fine MFA adds Sound, existing final layers and optional duration-aware relative prominence. The UI labels preliminary results and uncertainty, polls at one second, and retains previews after fine-analysis failures. Historical missing frames are not reconstructed. Hosted migration `20261016101306_progressive_acoustic_checkpoints` applied; remote application deployment remains separate. Existing worker topology is unchanged; CPU-isolated queues and ASR/extraction parallelism remain planned. Local compute-only evidence and limitations: [report](design/benchmarks/progressive-acoustics-20261016/README.md).

## 2026-10-16 independent acoustic workers

Implemented: separate `stage_two_worker --lane fast|fine` processes, started together by `pnpm dev`. Fast handles learner ASR/word gates and server F0/energy/CWT for Takes and References; fine handles MFA and final comparisons. A service-only PostgreSQL lane claim and fenced handoff (`20261016111833_acoustic_worker_lanes`) preserve checkpoints, reset the downstream retry budget and invalidate the fast lease atomically. Each lane prioritizes eligible Takes over References. Fast startup preloads ASR without probing MFA; fine alone verifies MFA. Old combined entrypoints/claim RPCs reject use. Original audio acquisition, quality checks, recognition settings and 60%/85% thresholds are unchanged.

Local macOS scheduling: fine runs at nice 10 with native library threads capped at one; a separate supervisor pauses/resumes the MFA process group when the fast lane holds a shared activity lock. Parent heartbeats continue, locks release on crashes, and the supervisor reaps MFA if its owning worker exits. Active MFA timeout excludes pauses with a bounded additional 900 seconds of wall time. Empty queue polling does not pause MFA. Both workers must share the scheduler directory/account. This prioritizes first results and may extend fine completion under load; it is not hard CPU affinity. Optional disjoint Linux CPU sets and systemd templates are provided but not validated on a cloud host. No production worker deployment is implied.

Validation and timing: see [local lane comparison](design/benchmarks/worker-lanes-20261016/README.md). The local benchmark separates controlled CPU/queue timing from real hosted-storage/local-worker polling; browser paint and target-cloud timings are not inferred from either. Existing previews remain visible through fine processing/failure; no frontend redesign or new matching classes.

## 2026-10-17 consolidated practice submission

The analysis-enabled browser outbox now sends metadata and audio in one authenticated multipart request to `POST /api/practice/attempts/submit`. Profile/Take/analysis registration is transactional; audio remains durable in private storage before queueing. The response is the small persisted Take acknowledgment. Explicit history retention stays independent and reuses the same incoming bytes. Uncertain responses reuse the immutable identity; retrying retention does not reset or reupload a completed analysis.

Fast workers immediately publish word checks, then atomically save raw measurements and coarse output and hand off to fine. Reference coarse results use the same atomic handoff. Original audio acquisition, quality checks, ASR settings, exact 60%/85% gates, and history consent are unchanged. Hosted migration: `20261017091904_consolidated_practice_submission`. No cloud application deployment is implied. Timing method and measurements: [submission benchmark](design/benchmarks/submission-20261017/README.md).

Submission benchmark (2026-10-17): public 4.22s clip, prepared Reference, three alternating trials per mode using new checkpoint workers. Median submit 7.188→3.030s; word feedback rendered 18.550→11.918s; preliminary curves rendered 18.550→14.550s. Browser harness reuses production submission/polling/visual components; target-cloud and whole-practice-page performance are not inferred. Fixture rows/audio cleaned. Root lint/build/test passed (984 API, 370 Web, 114 extension); current desktop/mobile practice and browser-reference suites passed. Legacy file-reference suite still has a pre-submission obsolete UI assertion; see benchmark record.

## 2026-10-17 consolidated analysis status reads

Analysis polling now uses one service-only `practice_analysis_read_snapshot` RPC to read the owned Take, analysis and current-sentence Reference data in a single statement snapshot. Projection omits raw Take frames, learner checkpoints, Reference measurements/phoneme arrays and unrelated sentences. Source visibility/ownership and parent deletion are checked in SQL; expiry, live local source grants and exact sentence text/timing remain checked in the service. The existing AnalysisView, gates and UI polling interval are unchanged. Mutation responses share the same formatter and resolve Reference once. Hosted migration: `20261017094154_practice_analysis_read_snapshot`. Benchmark: [status-read comparison](design/benchmarks/result-query-20261017/README.md).

Result-query benchmark (2026-10-17): three alternating trials per mode with identical merged submission and prepared Reference. Median status request before preliminary output 0.828→0.272s; word feedback rendered 13.285→10.700s; preliminary curves rendered 14.089→12.017s from submission start. Read database round trips reduced from 3/5/7 to one. ASR remains the largest fast-path compute stage (5.665s median). Fixture rows/audio cleaned and hosted zero counts verified. Local browser harness scope and small-sample limits: [report](design/benchmarks/result-query-20261017/README.md).


## 2026-10-17 optional Reference for learner analysis

Reference preparation is optional. With server analysis enabled, a learner may record immediately without uploaded Reference audio; the Take freezes a null Reference identity and follows the existing word check, fast signal checkpoint, and fine learner alignment pipeline. It completes with learner measurements and no comparison score, without waiting for Reference. The unchanged below-60%, 60–<85% Sound-only, and >=85% all-layer gates still apply. Existing eligible References can be bound at recording start and use the paired flow. Active original-audio capture still blocks simultaneous microphone recording.

The UI describes optional Reference comparison and promotes completed learner-only fine results beyond the preliminary badge. Learner-only CWT tables omit the empty Reference column and determine uncertainty from learner evidence; absence of a comparison alone does not invalidate that evidence. Reference acquisition, quality checks, server-analysis preference and independent history-retention switch are unchanged. A Reference prepared after a null-reference Take is not retroactively attached in this increment. Existing backend nullable Reference support and worker completion are reused; no schema migration is required.

Verification: root lint/build/test passed (999 API, 370 Web, 114 extension). Reference-free practice browser regression passed at 1440px and 390px with synthetic microphone audio and fixture API results, including null-reference submissions, all matching tiers, preview-to-final display and history navigation. Worker regression verifies independent fast/fine completion without waiting or comparison scores; targeted service/worker tests passed 45 cases. These checks do not measure live inference accuracy or latency.

2026-10-17 UI cleanup: remove the duplicate optional-Reference card above sentence practice. Reference preparation, status and retry remain in the existing upper Reference panel; sentence practice leads directly with the sentence and recording controls. Learner-only analysis and consent/retention settings are unchanged.

2026-10-17 presentation change: hide preliminary Rhythm/Melody curves and Preview badges in sentence practice. Word feedback remains immediate; eligible layers show a brief pending state until fine evidence is available. Failed/cancelled fine work shows unavailable rather than coarse fallback. Completed learner measurements remain viewable without a valid Reference. Fine layer presentation, background checkpoints, 60/85 gates, original acquisition and retention are unchanged. Earlier first-curve benchmarks describe the previous preview UI, not the current time to visible final layers.

2026-10-17 final-layer benchmark after hiding Preview: three real 4.22s learner-only trials rendered full learner layers at 43.211/36.676/47.717s from submission start (median 43.211s), word checks at median 13.077s. Median after upload acknowledgment: 39.443s. Sampled MFA process interval 20.1–29.6s is the largest observed stage. Public audio, local CPU plus hosted Supabase, fixture auth/source and production render components; no inference accuracy/cloud performance claim. Duplicate old test workers removed before timing; fixtures cleaned afterward. [Evidence and limits](design/benchmarks/final-layers-20261017/README.md).


### 2026-10-17 Reference loading presentation cleanup

Remove the duplicate yellow preparation progress bar and amber preparation/analysis backgrounds in Shadow; keep the video playback progress indicator. Restore existing sentence References silently without a visible Checking state or analysis spinner. While availability is unresolved, show neutral Reference copy (or the existing extension-off/setup controls), then show the actual resolved status. Directory practice progress reports learner Takes and best word matches, not Reference availability; retain the cached background lookup and upload deduplication. Audio acquisition, recording availability and analysis gates are unchanged.

2026-10-17 Enable setup follow-up: show the setup spinner only during the extension handshake. Once armed and waiting for a toolbar click, stop the spinner, show “Click Libitu in Chrome’s toolbar”, and retain the setup instructions and Cancel action. The extension protocol, authorization and audio acquisition remain unchanged.

2026-11-06 Shadow history compatibility: if subtitle regeneration changed a sentence ID, recover only a unique whitespace-normalized exact match to the recorded sentence text. Ambiguous or missing matches open the segment picker. Canonical navigation drops the recovery text.

2026-11-06 Corpus selection: Select all filtered results includes every matching record, including unloaded pages. Deselect filtered results removes only matching selections; hidden selections remain. Disable selection while search results are settling or corpus operations are pending. Existing delete confirmation and Stage 1 Saved synchronization apply.

2026-11-06 Corpus Loadout limit: the selection tray states a maximum of five total items including existing selections. More than five currently selected items disables Add to Loadout with an associated explanation; batch deletion stays unrestricted. Existing atomic merge validation still rejects a combined selection over five without truncation.


## Glossika vocabulary v4 — 2026-11-09

Prepared Glossika literal vocabulary v4: source inventory plus canonical Unicode closure, 117-token custom / 481-token adapted vocabularies; old IDs and experiments preserved. All 549 labels and 92 source cases pass original/NFC/NFD round trips. No retraining or model switch. See `design/benchmarks/sound-glossika-20261108/vocab-v4/README.md`.


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


## IPA and Sound model technical design — 2026-11-09

Delivered the full implementation proposal in `design/docs/SOUND_IPA_ACOUSTIC_MODEL_IMPLEMENTATION_PLAN.md`: shared encoder, surface-phone CTC and source-profile supervision, masked attributes, local event heads plus fine-time acoustic branch, professional-corpus ingestion, all 12 Sound kinds, evaluation gates and worker/API/UI deployment. This is a design deliverable, not implementation or model promotion. New corpora, structured model, detectors and evidence API remain pending. User is not required to supply further annotations; missing event gold requires suitable professional data or independent expert work, not model-generated truth.
