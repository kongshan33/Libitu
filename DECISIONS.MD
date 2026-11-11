# Track Libitu decisions

## Validate transcript coverage and timing after dictionary repair — 2026-11-11

The single-variable dictionary experiment confirms a shared pipeline failure: the same four frozen models improve complete-chain F1 from 22.22% to 71.43–77.14%, with unchanged A control classifications. Do not attribute this change to learned representations. The same outputs only reach 40.95–42.86% joint correct-label/100ms F1; Buckeye timing drift remains substantial despite all recordings returning alignment outputs.

Preserve the two sealed runs and recover existing professional metadata or validate an automatic localization alternative before expanding the development matrix. Source times are post-prediction diagnostic evidence, never B/C/D inputs or a way to make an end-to-end result look better. Missing transcript coverage is not proof that professional phone labels are wrong; unexplained intervals stay unresolved. No new user listening, training or deployment is triggered. [Evidence](/Users/river/Documents/speech-phenomena/reports/e0b-lexicon-pair.md).

## Diagnose the shared E0b pipeline before expanding inference — 2026-11-11

The first nine-recording E0b run preserves all four backbones and three frozen seed heads, with no optimization or threshold selection. Keep unknown/unmatched outputs out of negative counts, count candidate/alignment-rejected positives as FN, and report conservative reference coverage separately from all source `dx` labels. Local exposure leaves 26 TIMIT speakers reserved; old test outputs remain regression evidence.

The smoke identifies shared MFA dictionary gaps that reject two complete recordings containing 7/8 reference positives. Use a new, single-variable dictionary-coverage repair run before expanding the 739-recording development pool or deciding on new training. A 22.22% complete-chain F1 across all four models is not a backbone ranking or twelve-phenomenon readiness result. Source-boundary scores and all artifacts remain preserved. [Evidence](/Users/river/Documents/speech-phenomena/reports/e0b-first-pass.md).

## Separate speech research before end-to-end evaluation — 2026-11-11

Accepted and implemented for P0/P1: use independent `/Users/river/Documents/speech-phenomena` code and `/Users/river/Documents/speech-phenomena-store` resources. Minimal relocation and baseline reproduction precede E0b; deep restructuring and service integration follow evidence, not the reverse. Keep historical labels/results/protocols byte-preserved and preserve original data while independent-media backup is absent. Research cannot import `app.*`; Libitu does not import the research package.

User-confirmed scope: reference-audio flap detection first, learner-domain qualification later; existing professional data only, no repeated user listening or paid annotation. E0b retains raw Wav2Vec2 alongside WavLM Large/Base+ and Whisper Small. The candidate and ASR adapters are separated without changing online business behavior. Passing migration does not establish model readiness; new training and service release were not part of this increment. [Plan](design/docs/SPEECH_PHENOMENA_EXECUTION_PLAN.md); [actual acceptance](/Users/river/Documents/speech-phenomena/docs/migration/REPORT.md).

## Supplemental event encoders — 2026-11-10

Whisper padding repair (2026-11-10): the common `padding=True` call produced 100 mel frames instead of the required 3,000. The Whisper-only adapter now explicitly zero-pads the waveform to the native 480,000-sample input before log-mel extraction, preserving the declared 30-second protocol and the first-50-frame readout. Four padding regressions plus 19 event tests pass. A real training clip passes the pinned encoder with `[1,80,3000]` input, all 13 finite `[1,50,768]` hidden states and finite classification-head gradients (zero optimizer updates). Resumed the supplement from existing data2vec artifacts; complete Whisper scores remain pending. Evidence: `.cache/sound-pilot/events-extra-v3-20261110/PADDING-FIX-PREFLIGHT.json`.

User-authorized supplement: pinned `openai/whisper-small` encoder (supervised ASR/translation) and `facebook/data2vec-audio-large` (raw self-supervised, not `-960h`). Implemented isolated runner `event_extra_probe.py`; queued after the active raw-Wav2Vec2 run to avoid CPU/RAM contention. Same immutable 1,600/600/600 split, five depths, three seeds and fixed probe budget. Whisper retains native 30-second zero padding and uses only the first 50 encoder frames; frame-center bookkeeping is not a physical receptive-field claim. No decoder or transcript prompt. Existing test exposure is disclosed. Syntax validation passes; actual model loading, extraction, training and scores remain pending. Artifacts: `.cache/sound-pilot/events-extra-v3-20261110/`.

## Correct Wav2Vec2 event comparator — 2026-11-10

The user explicitly requests the self-supervised Wav2Vec2 backbone, not Wav2Vec2Phoneme. Use pinned `facebook/wav2vec2-large-lv60` with a new event head. Removing the phoneme head does not undo encoder fine-tuning. Preserve the completed v1 run; v2 uses the identical 2,800-window manifest, fixed development-selection protocol, and hash-verified unchanged WavLM/HuBERT features. Existing tests are exposed, not newly blind. New results remain pending. Runner: `apps/api/scripts/sound_pilot/event_ssl_probe.py`; artifacts: `.cache/sound-pilot/events-ssl-v2-20261110/`.

## Compare acoustic events without prerequisite narrow IPA training — 2026-11-10

The user authorizes Buckeye/TIMIT flap preparation and a unified four-backbone comparison, with train/dev/test splitting handled by the agent and no further user annotation. Accept professional source-phone supervision, derive event labels only with explicit lexical/context evidence, and preserve all unresolved cases as unknown. Do not require a new narrow-IPA model first. Use frozen Wav2Vec2Phoneme, WavLM Base+, WavLM Large and HuBERT Large with identical samples and training budgets; text controls must derive features from the dictionary alone, never select pronunciations using observed phones. Existing professional labels are not new independently adjudicated event gold. Research mirrors require provenance/identity checks, duplicate isolation and time-unit audits; source defects are quarantined. The first experiment is localized flap-versus-retained-stop classification, not an end-to-end 12-class detector or production replacement. See [execution protocol](design/benchmarks/sound-events-20261109/README.md).

## Execute full-source preparation with typed supervision — 2026-11-09

The user authorizes executing the full Glossika preparation plan. Process and retain all 145 recordings, preserve the existing frozen short-sentence dataset, and create a new versioned package. Full transcriptions use CTC; explicitly partial phone/ending labels use the probability that the collapsed CTC sequence contains the annotated target, marginalizing unannotated context. Positive partial supervision alone is insufficient: future optimization must combine full supervision and an externally selected sampling policy. Text-only and tone materials stay auxiliary, without invented professional IPA or inferred negative event labels.

Accept source labels without repeated user listening. Audio association, font recovery, bounded segmentation and unresolved technical records remain engineering work. Preserve literal marks and append vocabulary IDs; do not silently replace old model vocabularies. Keep Glossika train-only and SAA separate in this preparation. All-track accounting does not imply every standalone demonstration or written example is now supervised; remaining holds and missing/truncated recordings are reported. Real-audio loss/gradient preflight uses zero optimizer steps. See [executed preparation](design/benchmarks/sound-glossika-20261108/FULL-CORPUS-V1.md).

## Accept source annotations without repeated user listening — 2026-11-09

The user accepts SAA's professional phonetic annotations as training supervision and explicitly declines another listening-confirmation step. Do not require the user to relisten or reapprove those labels. Apply the same source-first approach to the supplied Glossika material: source glyph recovery, audio/text association, decoding and target-completeness checks are engineering preparation, not a demand for new user phonetic annotation. Preserve source labels and flag only concrete unresolved technical items without blocking the rest of the corpus.

Assess the entire 145-track Glossika collection, including phonetic/word lists, endings and specialist chapters. The existing 549-row / 8.18-minute package is only the chapter 3 short-sentence export; it is not the full collection. Full-transcription, target-phone/ending-only and text/prosody-only materials require distinct supervision paths; do not label a complete word with only its target phone or claim generated completions are professionally annotated. This turn establishes the full-corpus preparation plan, not a new training run. See [scope and processing plan](design/benchmarks/sound-glossika-20261108/FULL-CORPUS-PREPARATION.md).

## Diagnose the IPA head before expanding supervision — 2026-11-09

The user requests identifying what adaptation learned and lost. Use existing frozen outputs, literal-label coverage, reference-anchored diagnostics and inference-only ablations of original/new head rows. Preserve all labels, checkpoints and scoring contracts. Treat ablations as post-hoc evidence on already exposed recordings, never select or deploy a mixed head from their score. Separate measured output changes from acoustic truth; token occurrence counts are not event accuracy, and budget/style/recording differences remain unresolved causal factors without a controlled follow-up.

## Adapt the existing Wav2Vec2 IPA head with literal supervision — 2026-11-09

The user authorizes a small supervised adaptation while preserving the original model and comparing independent recordings; no event head is included. Start from the pinned 392-token pretrained head, preserve every original token ID and weight row, and append only missing literal training characters. Freeze the encoder. Compare two separately initialized arms (50 reviewed / 549 full book-supervised clips), three seeds, fixed 40 epochs at learning rate 0.0001; report all arms rather than selecting on the external regression recordings. This is continuation of the original head, not another fresh-probe experiment.

Freeze explicit IPA scoring aliases before training and preserve raw source/output strings. Report literal, notation-compatible and base-unit errors separately; do not collapse genuinely different phones or infer missing narrow marks as verified negatives in broad references. The eight previously scored independent recordings remain exposed regression data. No newly completed blind labels were available at intake; remaining originals/drafts stay untouched. Keep original weights and prior experiments unchanged, and require independent evidence before claiming an improvement or deploying adapted weights.

## Prioritize IPA probes for representation comparison — 2026-11-09

The user redirects the next step from the A/B/C IPA/event/ZIPA plan to comparing Wav2Vec2Phoneme, WavLM Base+, WavLM Large and HuBERT Large through IPA outputs only. Use all 549 prepared Glossika rows and the literal 62-entry vocabulary. Freeze encoders and train fresh linear CTC heads with identical settings, five depths and three seeds; use only eligible development labels for layer selection. Snapshot the current 5 development / 8 test labels separately, seal every model selection before test scoring, and disclose the small incomplete test and notation mismatch. Only heads change; before/after means fresh-head training, not encoder fine-tuning. Register used test items as exposed. Do not wait for event labels or alter the original review drafts. See [IPA probe protocol](design/benchmarks/sound-encoder-eval-20261109/IPA-PROBE-V3.md).

## Use Glossika literal notation for the next training-data version — 2026-11-09

The user explicitly says IPA marks should follow Glossika and asks for fine-tuning-ready data. This supersedes the old v2 default conversions for the new export: preserve `⁼`, `ṇ`, `ʧ/ʤ/ʦ/ʣ`, `ʴ/ʱ`, offglides and tie bars. The user confirms that ṇ means syllabic n, with the dot directly underneath; retain that glyph in targets instead of replacing it with n̩. Preserve printed t͡ʧ without collapsing it. NFC composition and removal of layout whitespace are the only CTC projections; keep original strings and glyph-recovery provenance.

Use the provided book IPA as training supervision after source/audio association checks; a new manual transcription of every otherwise usable row is not required. Distinguish the prior user-reviewed audio/text subset from automatically associated book labels. Unprompted ASR checks words/timing only, never supplies IPA. Multiple book variants, optional segments, printed incorrect examples and unresolved audio associations remain in a separate review queue. The entire collection is train-only; random splitting cannot provide independent test evidence. Event fields remain unknown.

Create new data/vocabulary artifacts and fresh output heads. Preserve the 49-row experiment, prior outputs, sources and 8773 review drafts/protocol. Data preparation and real-audio gradient checks have zero optimizer updates and establish compatibility only. Word and specialist chapters remain a subsequent increment. See [v3 export](design/benchmarks/sound-glossika-20261108/DATASET-V3.md).

## Compare frozen acoustic checkpoints with fresh shared probes — 2026-11-09

The user approved a unified Wav2Vec2Phoneme / WavLM Base+ / WavLM Large / HuBERT Large evaluation and asked for independent listening samples. Keep the previous 49 Glossika items as training material and prior inspected external clips as development evidence. Reserve new CLB/RMS corpus speaker IDs and unseen prompts for the project test split; isolate sentence, recording and PCM groups. Do not imply unknown upstream pretraining exposure or unknown Glossika speaker identity has been resolved.

ABX does not require an IPA head; controlled IPA recognition does. Build fresh random linear CTC heads with the same frozen alphabet, layer-search budget and three seeds, without copying trained Wav2Vec2 output rows. Frozen-encoder feature extraction and backward-only checks are engineering validation, not new acoustic learning or accuracy. Compare available checkpoints with their prior supervision disclosed, not architectures in isolation. Choose layers on development labels and seal all model selections and human test labels before test scoring. Keep individual event labels, word windows and actual phone boundaries separate. Missing positive/negative training examples or ABX triplets remain unavailable results. No online integration or new acoustic realization claim follows from this preparation.

## Run a bounded first fine-tuning experiment on the 49 candidates — 2026-11-08

The user explicitly requests small-scale Wav2Vec2 fine-tuning now and comparison on real recordings. Proceed with head-only CTC supervised updates and a frozen encoder; do not block this engineering experiment on independent test-set collection. Freeze its hyperparameters before training, retain the original baseline, and keep all 49 clips labeled as training material. Record a saved, reloadable head checkpoint rather than describing a backward-only preflight as training.

Use the 12 existing external development clips only for post-training inference, not optimization or checkpoint selection. Their lack of full IPA gold and their prior use in base-model comparison prevent calling them an independent blind test. Report training-fit improvement and suspected external regressions together; do not ship the experimental weights or claim event detection quality. Preserve both successful and unsuccessful symbol outputs, without adding rounds to chase the development examples.

## Separate official IPA references from model and source vocabularies — 2026-11-08

Use the user-linked International Phonetic Association chart, its explicit Unicode fields and Unicode modifier definitions to build a versioned reference catalog. Distinguish main-chart IPA from supplements, extIPA, historical notations and source conventions. Do not automatically add every world-language symbol to a GA model head, or claim that token support proves sound detection.

The supplied book explicitly defines `⁼` as unaspirated: map it to `˭` only in the Glossika source adapter, never to no-audible-release `̚`. Preserve the book's `ʴ`, `ʱ` and vowel offglides with documented meanings; no global `ʴ→˞`, `ʱ→̤` or `d̪→ð` substitution. Keep raw labels, changes, surface reference and CTC projection separate. Canonical Unicode decomposition is permitted; compatibility normalization and blanket mark deletion are not. Preserve the original 392 token IDs and add only labels needed by the current eligible data. V2 resolves eight notation holds; sentence 23 stays held. Original review, v1 baseline scope and metrics remain immutable, and single-person confirmation does not become independent test evidence.

## Accept the first Glossika review without inflating evidence — 2026-11-08

The user said the batch was finished and explicitly confirmed the four initially missing fields. A subsequent disk snapshot already contains all 50 confirmations; archive those bytes rather than silently modifying the original draft. Treat unchanged book IPA as user-confirmed transcription with its original notation, not independent gold.

Retain the 15 optional phenomenon observations. Missing local times and cross-word tap examples do not satisfy the word-internal tap pilot or become negatives. Quarantine nine ambiguous/special-notation rows from initial CTC candidates. Do not conflate annotation completeness with a frozen phonetic contract.

Pretraining comparison now includes ZIPA large FP32 at a pinned revision/hash. Report literal character differences separately from phoneme or phenomenon accuracy; do not turn 1-CER into an accuracy claim. Wav2Vec2's 392 output entries and learned rows must be preserved in a proposed five-symbol extension. The 27-entry surface-character inventory is only a diagnostic artifact, not a replacement production vocabulary. CTC backward checks use no optimizer steps and yield no trained checkpoint. The small, related single-source batch remains development material, not an unseen validation/test set.

## Prepare shared data before three experiments — 2026-11-08

The user asked to begin data preparation before the three proposed experiments. Prepare a manageable first review batch plus a full source/normalization index. The next experiments are Wav2Vec2Phoneme supervised IPA adaptation, frozen WavLM Base+ features with localized heads for the agreed three subtypes, and ZIPA large as another pretrained baseline. Keep Allophant and existing outputs for comparison. This supersedes the earlier recommendation to start with ZIPA-only IPA training; no comparative winner or accuracy has been established.

Keep raw book IPA, normalized candidates, heard IPA and localized phenomena separate. Exclude a spoken track title explicitly; silence counts and ASR words never establish acoustic truth. Preserve incomplete/uncertain drafts and all backup versions. Group this unverified-speaker collection together for development until repeat/family/speaker checks support a narrower split; reserve genuinely unseen external sources for later evaluation. A single review can supply training supervision after label/inventory checks, but is not independent test gold. No model is trained by the preparation tool.

## Compare pretrained outputs before training — 2026-11-08

The user requested a visual comparison of real outputs from ZIPA, Allophant, Wav2Vec2Phoneme, Allosaurus and Azure, then explicitly chose the four local models first with Azure left unconfigured. Use the second-round originals, preserve raw outputs and separate optional human judgments. This authorizes offline inference/comparison, not an automatic accuracy claim or a decision that fine-tuning is necessary.

## User-supplied Glossika training scope — 2026-11-08

The user explicitly said the supplied Glossika audio/text may be used for training and asked that permission review not block the task. Treat this as task authorization for that supplied dataset, superseding the earlier exclusion/no-training scope for this material. Preserve source provenance; do not rewrite historical public-pilot usage records or treat this instruction as authorization to acquire other media or change learner-recording use.

The current increment assesses source readiness and records a concrete adaptation proposal: keep ZIPA primary and Allophant comparator; distinguish raw book IPA, verified recording-specific IPA and localized Sound labels; accommodate all 12 product categories while initially evaluating the three agreed subtypes. Professional demonstration is valuable supervision, but recording/notation matching, competing realizations, extraction errors and evaluation separation still require data work. No training or online evidence integration is claimed as completed.

The submitted second round has 12 valid same-person target judgments, 8 present / 4 absent. Preserve bytes and notes; absence applies to the selected target, but comments about elision do not automatically become independently verified Elision labels. Same-person refinement remains distinct from adjudicated test gold. See [results](design/benchmarks/sound-model-pilot-20261107/ROUND-TWO-RESULTS.md) and [training proposal](design/benchmarks/sound-glossika-20261108/PLAN.md).

## Sound model pilot authorization — 2026-11-07

User accepted A+B: ZIPA as primary candidate, Allophant as comparator, three limited families (coalescence, nasal place assimilation, word-internal T/D tap), and chose to do a first listening pass personally. Run only licensed public development clips in an isolated environment; preserve raw outputs separately from blind human reviews. Single-review labels remain non-gold. Existing 16 clips do not establish coverage or product accuracy. No online detector, training, score, recording or retention change is authorized by this increment. Record Intel macOS runtime overrides explicitly; require a supported environment and independent evaluation before deployment.

First-pass clarification: the user explicitly identified clip-09 as `but I'm` (display words 2–3) and confirmed that the 41 absent selections mean no occurrence heard anywhere in the clip. Preserve these as whole-clip screenings, not localized event negatives; do not invent missing reasons. Keep the original recovered export and hash-bound correction history. Six multiword positive spans remain separate from the limited word-internal pilot. Saving a draft must not be gated by eligibility for event evaluation. The initial no-tap decoding result does not authorize changing human labels, fitting thresholds to this pass, or presenting a production detector.

Second-round preparation: the user requested excerpts for the three existing candidate positions plus supplemental samples for another personal listening pass. Use licensed original human audio; preserve full playback and mark padded automatic alignment windows as playback aids only. Ask one localized question per item, with explicit uncertain/not-applicable options and optional notes. A new package/export identity isolates the round from the first pass; no prior judgments or model outputs are embedded. Same-person repeated listening remains refinement, not independent review or gold. Supplemental contexts do not imply known positive examples.

## Sound density and filtering scope — 2026-11-07

The user explicitly postponed audio phenomenon detection and evidence integration. This follow-up implements only the two requested presentation behaviors: at most two distinct category labels per word with actionable `+N` expansion, and strict 20% opacity for nonmatching inline marks/arcs after filtering. Hover, keyboard focus and selected arc state do not override the opacity. The shared explanation card exposes all categories at normal readability. This supersedes the earlier hover/focus opacity exception and does not convert the existing duplicated text-candidate rows into audio evidence.

## Sound html-2 reference and explicit overrides — 2026-11-07

The latest user instruction takes precedence over both prototypes and the updated v2.1 spec: Linking uses the same lower `‿` glyph everywhere and opens its exact explanation below the reading block; Vowel means voicing-conditioned relative vowel length, never a duration-measurement panel. The subsequent browser feedback restores paired Reference / Your voice rows: reference reading cues and learner practice targets, both explicitly unverified. Keep solid soft colors, shared counts and seven-row explanations below the selected row. Concealment follows each word’s native text width and keeps accessible reveal controls; revealing a word synchronizes both rows. An available reference audio source does not imply reference analysis exists for an old saved take; preserve unavailable evidence instead of borrowing a current result. The updated type rule restores shared Inter / `--font-ui` for IPA and metadata, superseding the earlier prototype’s monospaced annotations. Only Elision exposes subtype chips; other subtype semantics remain in the data and explanations.

Version derived guides as sound-rules-v3; emit vowel_length candidates only for unanimous dictionary readings with a primary-stressed vowel directly before one final obstruent. Keep v1/v2 readable, retain stored acoustic data without converting it into candidates, and allow length cues without reference audio. No changes to recording permissions, saved results or correctness scoring. See [updated contract](design/docs/STAGE_TWO_GA_SOUND_PLAN.md).

## Sound visual reference — 2026-11-07

The user selected `design/prototypes/Stage 2 · Detailed (three-layer analysis)-html-1/` as the Sound style reference while explicitly preserving current content and logic. Apply its natural-width word flow, compact markers, uppercase group labels, monospaced secondary annotations and soft detail surfaces. This supersedes the initial GA plan's fixed-position filter layout and no-monospace presentation rule: active subtype content and cue widths may reflow, while word identity/order and all interactions stay unchanged. Keep the current shared neutral palette, GA taxonomy, actual IPA symbols and candidate evidence; do not import the mockup's older labels or semantic claims. Reading cues stay shared between Detailed and Review.

## GA-only Sound taxonomy and execution boundary — 2026-11-07

The user selected General American as Stage 2's initial supported learning target. Adopt [the GA Sound plan](design/docs/STAGE_TWO_GA_SOUND_PLAN.md): 12 top-level entries in four groups, T/D and H loss under Elision, separate Coalescence and T/D tap, and retained Voicing change and Vowel duration. Exclude a dedicated non-rhotic R-linking/intrusive-R entry; do not infer the source speaker's accent from the learning target.

The implementation gives both Reference and learner text candidates explicit non-confirmed styling, replacing the 2026-11-04 solid Reference-candidate convention while retaining shared Detailed/Review components and opt-in dense measurements. Unknown or unsupported evidence is not absence. Keep word totals distinct from per-vowel timing, preserve historical evidence and preserve the P1–P5 delivery boundaries. Validated acoustic realization remains separate M4b work. P1–P5 implementation and verification are recorded in [the delivery report](design/benchmarks/stage-two-ga-sound-20261107/REPORT.md). Multiple dictionary readings may support a conditional rule only when the relevant boundary phone agrees across every variant, or when a finite reviewed alternative pair is explicitly handled. Unknown legacy subtypes are not inferred from explanatory prose.

## Grounded classification and complete assessment — 2026-11-06

Separate deterministic phrase/span matching from contextual appropriateness.
Server candidates bind exact final-user text, revision and UTF-16 positions;
neither lexical detection nor structure completion awards usage credit alone.
Use fixed provider dimension/criterion keys and short request-scoped reference IDs,
then compile into the unchanged public report. DeepSeek's strict Beta function
schema is configurable and supplements local validation. A uniquely contained
exact span may replace an overlong quote without changing its semantic verdict.

Allow one targeted repair within 15 seconds after the initial 45-second request,
preserving valid siblings/ratings; unparseable output gets one regeneration.
Never fill missing scores, invent evidence, reinterpret insufficient data as zero,
or silently switch providers. Retain a validated partial report on repair failure.
Narrow redundant-brace/order normalization is audited; duplicate keys remain
invalid. Separate authored regression acceptance from broad teaching quality.
See [implementation evidence and remaining limits](design/benchmarks/text-quality-20261106/COMPARISON.md).

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

## Resolve historical Shadow sentences — 2026-11-06

Historical attempts carry sentence identity without segment identity. Resolve the sentence using the same buildSentenceUnits logic as Shadow, then replace the URL with the canonical segment/sentence selection. Do not guess a different sentence when the current blueprint no longer contains it.

## Corpus kind changes invalidate Syntax — 2026-11-06

Treat the current draft/saved kind as authoritative for Syntax routing. A kind change clears all old Syntax fields and summaries, aborts its request, and regenerates only while Syntax is visible. Keep the analysis view mounted to preserve the selected tab, Explain and follow-up drafts/history. Late results cannot overwrite the new kind; completion uses the latest persistence callback to retain newer saved fields/notes. Saving while pending stores an empty pending Syntax for later generation in Reader or Library.

Keep saved follow-up text in the existing usage note. Bound Reader thumbnail previews to 140 plain-text characters and two visible lines; show the full note in the shared Reader/Library My note section using the existing restricted Markdown renderer. Save failures must not display an unsaved answer as a durable note. No new schema, provider integration or migration.

## Corpus source evidence and learning expressions — 2026-11-06

Keep user-confirmed 16px section spacing and Use it before Meaning when applying design section 9.16. Store original selected/recommended text separately from normalized learning_text: remove context-specific inflections from phrases, preserve lexicalized forms and full-sentence wording. Learning title/IPA/stress/TTS share that target; Syntax analyzes the original inflection. Retain custom names and saved templates. Extend the existing v3 contract instead of adopting incompatible nested prompt drafts; retain existing field names for reusable patterns and stress text.

Generated follow-up suggestions select/toggle input, explicit Send triggers the request. Phrase Syntax has three analysis blocks plus translations; scenarios remain only in Explain. No speculative Pitfalls. Native modal close precedes React unmount to return focus; Add to corpus stays non-modal and pinnable. Omit unsupported comparisons/over-strong translations, narrowly recover one redundant JSON closing brace, and use the pinned dictionary only for provable regular IPA suffix corrections. The [real comparison](design/benchmarks/corpus-detail-20261106/COMPARISON.md) records latency costs and remaining model-quality limits.

## Extension store preparation — 2026-11-06

[CHROMEWEBSTORE.md](apps/extension/CHROMEWEBSTORE.md) now records every manifest permission, data flows/retention, listing and privacy drafts, and pending publisher/email/domain (owner specified 待定). [Acceptance](design/docs/extension-release/ACCEPTANCE.md) records 124 passing unit tests, extension lint/build, and real unpacked Chrome entry/fresh-caption/no-capture workspace fixture passes. Native toolbar → tabCapture → PCM passed on retry: actual native UI clicks produced a 0.4-second WAV with RMS 0.106066, retained ownership across same-content paths and released offscreen/capture on reload. Earlier shortcut/UI failures are historical; synthetic identity/test-tone coverage does not prove live YouTube or production behavior. The harness offers manual native-action mode without injecting shortcut commands, waits for native Enable audio before arming, accepts enabled followed by coverage, and waits for a fully covered extraction interval. No store submission or production readiness claim. Integrated Web server analysis is separate from extension capture and defaults on unless disabled; its uploads and 30-day reference expiry must be disclosed.

## Activity metric rendering — 2026-11-06

Animate the existing activity panel on metric changes instead of remounting its total and SVG with the same key. Keep exactly one active summary and chart, preserving keyboard focus, reduced motion and the existing date-range loading behavior.

## Extension bridge context invalidation — 2026-11-05

Buffered bridge runtime invalidation follow-up: wrap runtime sends in an async boundary so both synchronous context-invalidated exceptions and rejected promises follow the existing terminal connection-lost path. Do not silently reconnect or reacquire audio authorization; extension reload still requires refreshing the owning page.

## 2026-11-05: Bound extension handoff retention and permit language retries

Cache only concurrent language checks, not settled results, so explicit launch retries can recover from transient metadata absence without relaxing English-only validation. Use `chrome.alarms` (one minute, compatible with Chrome 116) plus startup/access cleanup for 15-minute caption handoffs. Deletion may be delayed by device sleep; TTL reads fail closed. Serialize handoff cleanup/writes, retain at most 16 records and 4 MiB of UTF-8 serialized keys/values, evict oldest first, and reject oversized individual payloads. Closing an import tab deletes its record; closing the source preserves a ready handoff with an import tab but removes an unfinished launch. Audio capture permissions and retention are unchanged.

## Neutral retry notices — 2026-11-05

Recoverable-error panels share a neutral surface, gray border and dark gray copy across Loadout, Corpus, learning history, reports and practice. Use 16px padding and vertical margins, 12px action gaps and shared button geometry. Error/alert semantics and retry handlers are preserved; destructive confirmations keep their existing treatment. Audio-save failures use the same neutral palette.


## Stable asynchronous feedback — 2026-11-05

Routine UI feedback shares a 600ms reveal threshold. Shared buttons disable and report busy immediately while retaining their idle label/geometry; only sustained operations show the loading overlay. Inline save/update notices reserve a small stable slot; floating practice-save/upload notices delay normal progress but surface errors immediately. Loadout draft saving uses the same helper. Request cancellation, persistence, unload protection, microphone permissions and recording countdowns remain immediate.

History pagination retains existing rows without appending temporary skeletons. Filter changes retain the previous list while awaiting replacement, reset pagination and reject aborted responses. Activity range changes retain the existing chart and its actual date caption until replacement arrives. Initial loads still use structural skeletons. Shadow takes avoid flashing an empty result before the selected sentence's history resolves. Extension caption-opening progress follows the same 600ms rule without delaying its request.

Mission hints share the 600ms threshold with routine progress. Keep retained help and visibility receipts intact, and let the target button own progress instead of inserting a duplicate footer sentence.


## Quiet Loadout draft saves — 2026-11-05

Routine local draft writes should complete without flashing a page-level sentence. Show a compact non-shifting status only after 600ms; keep storage failures actionable and retain pending-write unload protection.

## Corpus detail spacing and pronunciation — 2026-11-05

Shared detail sections now use 16px vertical padding (previously 24px), 8px heading gaps and tighter slot/comparison rows. Pronunciation Play sits beside its heading, independently of IPA/stress wrapping, across Reader detail, Add to corpus and Corpus library. Pronunciation now calls the server-only OpenAI Realtime read-aloud adapter with `gpt-realtime-2.1-mini` / `marin` and the existing `OPENAI_API_KEY`. The request is limited to 800 characters, 45 seconds and 60 seconds of 24kHz mono audio; the provider-reported transcript must match the requested words before a WAV is returned. No microphone or role-play session is involved. The UI marks AI voice, supports retry/stop, caches one audio clip for the open card, and stops playback/aborts browser requests when Explain hides or the card closes. No cross-user or persistent audio cache is added.

## Typography, spacing and interaction polish — 2026-11-05

Shared text/space tokens and semantic color aliases now unify current surfaces. Report H1 uses 30px/500, primary explanations 15px, helper text 13px, mono metadata 12px and transcript text 18px; report content gutters follow the 4px scale. Corpus cards use 20px padding/12px gaps. Empty Loadout logic groups are omitted; a filtered-empty result appears once with a recovery action. Coarse-pointer controls have 44px targets independently of layout breakpoints, including labelled Corpus checkboxes and timeline controls.

Content changes use an interruptible 160ms opacity animation without rekeying media/containers: Corpus results (120ms settling window), Quick start recommendations, preview targets, Explain/Syntax and Sound/Rhythm/Melody. Assessment underlines and score bars use transform feedback; reduced-motion preferences skip animations and cancel in-flight content feedback. No score values, acoustic data, recording/playback or provider configuration changes.

## One detail style for saved and unsaved corpus — 2026-11-05

Add to corpus reuses the Corpus detail CSS and content components, including its neutral backdrop, header, source context and scroll geometry. Remove the separate blue quotation, shadow and narrow selection-card styling. Keep selection-specific field editing, note draft and Save in the bottom management area. The selection card remains nonmodal, with a pointer-transparent backdrop, to preserve pin, outside dismissal and replacement by a new transcript selection; it also supports close and Escape. Shared responsive dimensions are clamped to the viewport.

## Corpus detail DeepSeek comparison — 2026-11-05

Corpus detail now supports a scoped `CORPUS_ANALYSIS_PROVIDER` switch. The current local API uses the official DeepSeek `deepseek-flash` model with the existing server-side credential; repository defaults retain Ark for compatibility. Explain, lazy Syntax and streamed follow-up share the selected provider. Other text/voice tasks keep their own configuration. Two same-prompt live rounds (12 requests) were substantially faster and retained rewrite difficulty in both sentence follow-ups. Grammar terminology, spatial-versus-temporal translation and template adherence still had errors; this is sampled improvement, not broad teaching acceptance. 53 focused API tests pass, including provider/credential isolation. See [comparison, complete outputs and timings](design/benchmarks/corpus-detail-20261105/DEEPSEEK_COMPARISON.md). Existing saved analyses refresh only on the existing explicit action.

## Corpus detail: speaking-first, on-demand analysis — 2026-11-05

Stage 1 and Corpus library share the same Explain/Syntax panels, source underlines and follow-up UI. Explain v2 adds a 60–120-character Chinese teacher note (prompt requirement), reusable speaking frames, collocations, text stress guidance and no speculative pitfalls in new Explain output. Usage scenarios appear once, as mono text. No default etymology or word-family content. Library cards preview the first saved speaking frame and show register alongside level.

`POST /api/corpus/analyze-selection` now generates Explain only and returns `schema_version=2`, `syntax_state=pending` plus an empty compatible syntax object. `/analyze-syntax` runs only on tab activation; phrase/chunk/idiom output is limited to internal structure, sentence role and nearby logic, while sentences/structures retain full analysis. Client requests are deduplicated while pending, abort on dismissal, and retain retryable failures. Saved Syntax uses the existing account-owned/guest corpus update boundary; unsaved candidates cache it for this visit. Legacy combined records remain readable, with an explicit Refresh explanation action and no automatic regeneration.

`POST /api/corpus/ask` streams actual provider SSE deltas with explicit done/error states. Requests carry bounded local context, a question up to 500 characters and at most six completed exchanges. The UI renders only escaped text, paragraphs/lists, emphasis and inline code; no HTML, images or links. Failed/truncated answers cannot be saved. Save as note explicitly appends to the existing usage note; an unsaved transcript selection instead labels this as a note draft until the item is saved. Follow-up history stays in the open detail and is not automatically persisted. Account changes/dismissal dispose its requests.

Initial redesign, before the DeepSeek comparison above: no database migration or provider change; existing Ark configuration was reused. Restart the API process to load new prompt files. A real Doubao follow-up tested one authored phrase and one full sentence across Explain, Syntax and streamed questions, with repeated calls and prompt fixes. Default Explain now leaves speculative pitfalls empty; placeholder and complete-selection boundary copy are application-owned. Transport/contract checks pass, but repeated Lite answers still sometimes alter meaning in follow-up rewrites, so teaching quality is not accepted as stable. Thinking-mode probes were slower and did not resolve every issue; Pro calls returned 404 and no model configuration was switched. See [live results, remaining failures and full prompt snapshots](design/benchmarks/corpus-detail-20261105/README.md). Latency is sampled API wall time; billing and broad model quality remain unqualified.


## Shared button geometry across features — 2026-11-05

Regular actions now use explicit shared sizes instead of legacy inherit geometry. Height tokens are 32/40/44px for sm/md/lg; text is 12/13/14px. Action groups use 44px/14px controls, 8px icon gaps and 12px control gaps across primary/secondary, button/link and loading states. Feature CSS no longer overrides regular button geometry. Icon-only controls, recording controls, navigation and filter/segmented controls retain task-specific geometry.

## Switch loaded content views without a server round trip — 2026-11-04

Use native pushState/replaceState only for the Reader/segment-picker/Shadow views of the currently mounted content workspace: all three canonical route pages render the same client workspace and have no distinct server data dependency. Preserve push/replace semantics, URL subscriptions, canonical refresh paths and existing reference/recording cleanup. Keep Shadow code preloading side-effect-free and include required styles in the shared content layout. Cross-content and external navigation continues through Next routing; this is not a generic shallow-navigation replacement.

## One Sound cue renderer across Detailed and Review — 2026-11-04

Review retains its multi-layer timeline but shares the revised Detailed Sound badge and SVG linking-arc components. Source-derived Reference cues are solid; unevaluated learner cues are dashed and carry “?”, including linking arcs. A linking cue belongs to an outgoing boundary and is not repeated on its final word. Reserve sufficient row/column space for these cues without changing acoustic values or treating a text-derived link as a detected realization.

## Revised Sound prototype supersedes the fixed guidance column — 2026-11-04

The newly supplied `Stage 2 · Detailed (three-layer analysis)-html (1)/Shadow.dc.html` is the requested Sound visual reference. Use full-width text flows and a collapsed-by-default Notes control with Feedback/Tip above the filters, superseding the earlier permanent right Sound guidance column. Follow its ten-color palette and solid Reference/dashed unevaluated learner cue treatment; filter by dimming unrelated marks while preserving text placement. Keep measured vowels opt-in, source-derived cues distinct from acoustic verdicts, existing concealment in both rows and mobile touch/keyboard access. The prototype's fixture data and other sections do not override application state, prior removals, left-panel layout or analysis logic.

## Sound exception to the neutral analysis redesign — 2026-11-04

The user's explicit restoration of the 2026-10-15 Sound version supersedes the neutral Sound badges and folded Sound guidance in visual section 9.12. Restore the existing phenomenon palette, linking arcs, text wrapping, IPA and persistent right guidance. Measurements remain opt-in through Vowel len. or Linking; no scores, detections or pending states are invented. Review retains its overview layout with matching colored phonology cues and no default VL clutter. Rhythm/Melody and the left panels keep the accepted current design.

A measured gap remains time on the shared axis, but must not enlarge the preceding word's label or interactive highlight. Separate the word hit area from trailing gap space without compressing silence or changing acoustic data. Unusually long stored word durations remain visible as measured, not silently rewritten by layout code.

## Preserve measured time and recover display evidence without audio — 2026-11-04

A word column includes its measured boundary interval when adjacent source words have compatible evidence. The voice duration baseline remains the word duration; boundary gaps are separate, with a dashed baseline for measured pauses. Readable text padding is layout only. A single-voice ruler uses that recording's timestamps, never the maximum of both voices. Pitch uses one path per voice and joins only across known continuous boundaries with consecutive voiced frames; unknown, missing and unvoiced intervals break it.

Legacy results may project 20ms display frames from retained private acoustic measurements on read. This changes display only, preserves saved scores/content checks, does not rewrite historical rows, and never fetches audio or reruns models. Query only owner-scoped terminal Takes with undeleted parents; revalidate a bound Reference before restoring its frames. No frames means no invented envelope. New worker output persists the same projection. History status uses a small owner-scoped embedded analysis summary rather than fetching full analyses per row.

## Readability takes precedence over fitting every word onscreen — 2026-11-04

User correction supersedes the strict duration-only column width from 9.14: reserve enough space for the complete word and tags at every zoom. Added label space must not inflate measured duration or stretch acoustic traces. Fit may retain horizontal overflow when the labels alone cannot fit; seconds ticks use the resulting column offsets. Keep selected-word measurements but remove the requested explanatory paragraphs. Completed analysis status and destructive controls belong to Takes; active work/failures alone get a small inline notice. Locked Review omits unavailable plotting controls rather than showing a disabled dashboard.

## Saved-take analysis uses shared word columns — 2026-11-04

Apply visual spec 9.12–9.15 to the main analysis region. The user's explicit left-panel exception takes precedence over the prototype's sidebar redesign. Preserve the previous Quick/Review control placement and removal of How It Works.

Reference and learner measurements share source-word columns, sized to the longer duration; each voice retains its own timing inside the column. With both voices visible, hide the seconds ruler because their recording clocks differ. Missing/unmatched measurements remain empty, not inferred from neighboring words. Prominence bars share the 0–0.88 display scale, cap larger values visually, and retain exact values in the readout.

Persist an optional 20ms display_frames array alongside existing 50ms signal outputs. Pitch is centered on the measured voice median and never bridged across unvoiced intervals; energy is a separate loudness envelope, not prominence or correctness. Old stored results remain valid and do not receive synthetic envelopes. A selected take is carried in takeId only within the same sentence; navigation to another sentence clears it.

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

## Motion follows state, not simulated activity — 2026-11-03

Use 120–200ms CSS feedback for state changes. Native dialog and persistent hidden Corpus panels progressively enhance entry/exit with discrete display transitions; unsupported browsers switch immediately. Hidden panels are inert. Keep tab containers mounted to preserve focus, animate their changing content only. Do not animate simulated microphone levels or delay actions to finish an animation. Preserve the actual audio-driven partner orb. Login/registration presentation remains the existing Clerk UI.

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


## Unified authentication entry, distinct flows — 2026-11-03

Per the user’s latest clarification, keep one Sign in header action with explicit login/registration switching inside Clerk. Set withSignUp and transferable to false on openSignIn so the login flow does not implicitly create an account. Retain forceRedirectUrl and signUpForceRedirectUrl for the initiating page. Use Clerk’s existing modal UI and validation.

## Landing section scrolling — 2026-11-02

Landing now uses viewport-height sections and native document scroll snapping,
with a sticky header, smooth anchor movement and a first-screen scroll cue.
Sections have a minimum height, so phone/zoom content can grow and remain readable.
The snap styles apply only while Landing is mounted; application routes retain
normal scrolling. Reduced motion uses immediate anchors and proximity snapping.
Existing section reveal animations remain on content, not on the snap targets.

## Landing motion and navigation polish — 2026-11-02

Use CSS Modules and existing tokens for the supplied Landing/Navigation artboards.
No animation dependency: scroll reveals progressively enhance browsers with
view timelines; other browsers show content normally. Per the user’s waveform correction, decorative wave motion loops continuously, and reduced motion disables both animation and hover
transforms. Keep Landing's separate header (signed-out How it works / Sign in;
signed-in My learning / account). Application navigation remains 64px with the
existing mobile bottom bar and separate Practice/Mission flows. Do not claim an
available Chrome store release when no configured install URL exists.

## Corpus presentation and progressive display — 2026-11-02

Replace the sidebar with six single-open filter popovers; retain OR within each
facet and AND across facets, real metadata and the existing >=4/5 High value rule.
Use neutral cards, text metadata and a purple inset outline only for selection.
Show 15 matching records initially, appending 15 per Load more. This is local
rendering pagination over the existing full collection, not server pagination.
Per-facet Clear affects one group; Clear all clears search/facets while retaining
the current content tab. Opening Loadout is primary until selections expose the
Add to Loadout tray, when the header link becomes secondary. Existing draft
limits, persistence, original analysis and account ownership are unchanged.

## Practice history presentation — 2026-11-02

Apply the supplied history artboard within the existing profile CSS Module and
shared record rows. Mission status belongs in metadata, not a separate badge.
The toolbar count must describe loaded entries until pagination is exhausted;
the current API provides no total. This request is a visual adjustment: retain
newest-first server ordering and show it as text. The prototype's oldest-first
toggle is not implemented by reversing a partially loaded list.


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

This log records decisions that constrain product behavior or architecture. Add a dated entry when a change affects multiple apps, data ownership, privacy, API contracts, or delivery order.

## Stage 4 hint bundle cache and retained display — 2026-11-01

The first requested or eligible automatic hint may prepare all three levels in
one model call. Cache the validated bundle only in the owning live connection,
one context at a time. Public cards remain single-level and persisted help has
its existing shape. Context/version/target/support/activity checks apply equally
to cache hits and new generation. Failure is retryable; reconnect starts cold.
User decision: do not implement background pre-generation for now. Learners may
never request a hint, so speculative generation can waste model calls and cost.
Keep generation on demand (manual help or the existing eligible automatic
direction); do not add hint preparation to session-entry prerequisites. This is
not a queued next step; revisit only after an explicit decision.

During an upgrade the client may retain a prior ready card for the same context,
with delayed loading feedback after 600ms. This supersedes immediate blanking of
the old hint. Receipts must identify the painted old/new card explicitly, so
preparation and loading never count as exposure to the hidden levels. Speech,
drafts and changed contexts remove retained content and fence late results.

## Stage 4 alignment and historical stage ownership — 2026-11-01

Plan version does not define target visibility: absent explicit v1 support means
concealment, including before connection. Explicit legacy support remains a user
choice. New default auto-reveals require actual model assessment and presentation
on the current transcript revision; visibility receipts never create learner use.

Bind stage identity when requesting a response, then record a bounded private
marker only after its grounded question is actually presented. Public optional
`conversation.stage_markers` contains only exact source refs, stage indexes and
labels from the frozen Mission guide. Reconnect/end retain receipts; transcript
revisions invalidate stale markers. Missing historical markers stay missing.
This adds runtime JSON state, not a SQL schema migration or a learning metric.

Evidence details belong in the target panel. A current-stage cue belongs in the
top guide; transcript dividers contain only the stage name. Real provider/audio
acceptance is distinct from synthetic browser and contract regression results.

## Stage 4 Conversation redesign contract — 2026-10-31

Step 4 follow-up: the user authorized lightweight correction. Analyze a finalized
learner turn asynchronously; reserve a ready candidate before an unstarted normal
reply, without waiting for the analyzer or creating a correction-only response.
Also validate natural recasts already present in the actual partner reply.
A matching presentation receipt is required before live display; late candidates
are report-only. Store categories privately and freeze them through an additive
report-source whitelist. Preserve learner text, evidence counts and old jobs.

Step 3 history: the user explicitly authorized new protocol/runtime integration,
while leaving corrections to step 4. Protocol 1 is negotiated independently of
Mission version and initially advertised by OpenAI; Gemini stays legacy. A real
invitation gets a server UUID and UTF-16 quote refs. Reserve each automatic budget
before provider I/O; completion requires actual presentation. Speech/drafts close
automatic help, and only a visible matching result records hint exposure.

Step 2 history: the user authorized the UI and simulated-state verification,
explicitly excluding real-time runtime changes. Share display components between
the actual route and an opt-in preview, keep fixture controls/data outside the
live workspace, and retain truthful legacy help until the new protocol exists.
The preview must default to 404 without its server flag and make no speaking API
or microphone calls. Current controls retain their existing controller methods.

- **Status**: accepted design; state/data contract documented and step 2 UI with
  synthetic fixtures, step 3 runtime/schemas and step 4 recast/report integration
  implemented. The user requested these steps in order.
- **Presentation**: one replaceable help position; direction, opening words,
  then a complete example. No stacked meaning/pattern lesson or teaching-state
  labels in the conversation. Guidance wording invites rather than instructs.
- **Target-panel correction**: retain automatic reveal after a clearly confirmed
  partner model, and reveal actual learner-used targets. Otherwise hide until
  Show targets, including Guided. Mere generation/partial exposure is not a
  clear model; recorded independent/assisted-use semantics remain intact.
- **Timing interpretation**: one spoken simplification at about 8 eligible
  seconds plus one automatic direction at about 20 eligible seconds per
  question. The “one automatic level” limit applies to UI help. Opening words
  and examples are manual. Same-question rephrasing never resets budgets;
  speech/drafts retire help, and reconnect never replenishes automatic actions.
- **Data**: version the conversation protocol separately from frozen Mission
  Plans. Bind help to a question UUID/context revision; add optional
  simpler_question without rewriting old snapshots. Recasts reference actual
  learner text and validated partner delivery; only changed words are bold.
  Grammar/word-choice categories remain report-only, and transcripts stay intact.
- **Compatibility/scope**: preserve old data, exact retries, evidence and explicit
  legacy support behavior. Do not relabel legacy frames as short openings.
  This supersedes the earlier Stage 4 pause/provider-only restriction for this
  redesign, but does not implement Summary-only feedback or change providers.

See [the state/data specification](design/docs/STAGE_FOUR_CONVERSATION_CONTRACT.md)
for field shapes, transitions, protocol negotiation and acceptance cases. The
contract governs the implemented steps 1–4; step 5 real-audio/provider acceptance
remains separate from synthetic regression.

## Switch Mission realtime voice to OpenAI — 2026-10-30

- **Status**: accepted and implemented locally at the user's request.
- **Decision**: use OpenAI Realtime `gpt-realtime-2.1` with `marin`, reusing the
  existing server-side key. Keep Gemini selectable explicitly for legacy use;
  do not fall back to another provider silently. Doubao text workloads stay intact.
- **Consequence**: retain the server-owned socket, PCM24k browser contract,
  manual response creation, semantic VAD, playback-aware cancellation/truncation
  and final-text recovery. OpenAI Chat uses text-only responses. No data migration.
- **Scope**: supersedes the earlier Gemini default and the Stage 4 pause only for
  this provider migration and its verification. Other deferred teaching work stays
  deferred; historic Gemini results do not establish OpenAI learning outcomes.

## Finish Stage 3 before expanding Stage 4 — 2026-10-26

The user narrowed the next increment to Stage 3 and confirmed a fixed seven-day
Due-for-review interval with a visible explanation. Preserve existing Stage 4
work, but defer further demonstration, correction, Summary-only and live runtime
acceptance. Do not relabel Balanced or Light as Summary-only.

Stage 3 distinguishes an automatic proposal, manually pinned targets, explicit
logic choice and a custom scene. One resolved setup drives the preview and the
Start request. Shuffle preserves manual targets; starting the Hero explicitly
adopts its proposal. Free conversation first presents a zero-target/zero-logic
preview. Ordinary scene generation stays behind Start; custom-scene matching is
a bounded exception that can suggest logic without replacing targets.

Use nine catalog templates with family and stage-function metadata outside the
frozen LogicTemplate schema. Travel belongs to the daily recommendation family,
but remains its own saved scenario value. Existing saved templates and immutable
pending requests keep their original content and identities.

Recorded use includes validated learner evidence for independent and assisted
uses; zero qualifying independent Missions is not Never used. Due means seven
days since the latest recorded use only when the relevant evidence history is
complete. Pending assessments, incompatible/invalid evidence and truncation
produce unknown. Keep reliable-practice counts separate and read-only. Recent
video recommendations require actual video provenance and an explicit recency
window, never merely a saved timestamp from an arbitrary source.

The neutral design specification governs colors and typography over the older
prototype: black main actions, white Hero Start, purple selection borders,
neutral disabled states and no shadows. Prototype layout and interaction still
apply: inline Adjust, four independent Advanced rows and a shared corpus drawer.


## Freeze logic and separate demonstration from learner use — 2026-10-26

The user authorized the first Loadout follow-up milestone. New targeted plans
with a selected logic use version 2; omitted logic preserves the v1 path. Freeze
the full server-owned logic template, each target's nullable stage index and a
validated natural counterpart model line. All new targets use primary internally.
A logic or step change invalidates a v2 cache. Source ownership, exact retries,
creation acknowledgement and old snapshots retain their existing boundaries.

V2 defaults to one natural demonstration for each unused target, independent of
difficulty and the old support selector. Demonstration counts only after actual
presentation and validated reflection; a sent/bound instruction is not success.
Earlier independent use suppresses modeling. Performing the same communicative
task using other wording does not skip a v2 demonstration; topic changes and
closing still do. Frozen model lines guide the scene and may be adapted to the
current turn. Any earlier assistant target exposure prevents
redundant modeling, including partial/uncertain exposure, without inventing a
confirmed demonstration. Multiple targets in one stage and Any stage stay in
the same bounded scheduler. Stage progress reflects answered opportunities or
real use; neither skipped stages nor responses alone count as target usage.

Conceal v2 target wording until explicit reveal or actual modeling so the UI does
not silently invalidate independent-use evidence. Reveal records visual usage
support. Imitation means target use after an actual example, while visual help,
other prompted use and uncertainty remain separate. Session-scoped exposure does
not expire after one unrelated turn. No independent-mastery claim follows from
these counts. Legacy support policy remains unchanged for v1.

## Rebuild Loadout around local Quick start and five equal targets — 2026-10-25

- **Status**: accepted and implemented locally; final verification and hosted
  migration are tracked separately in `TASK.MD`.
- **Decision**: make Quick start the default entry, with up to three suggestions
  drawn from actual saved corpus. Use current functional tags, six server-provided
  logic templates and scenario-specific local scene seeds. Manual selection and
  the full-corpus drawer share one pool of at most five targets across kinds;
  Shuffle preserves those selections. New targets have equal user-facing
  priority and retain `primary` internally for existing planning/evidence APIs.
- **Persistence**: Free conversation has zero targets, null logic and no target
  plan. Both starts retain owner-bound drafts, account corpus checks, storage
  locks/CAS, immutable request retries and confirmed-create acknowledgement.
  Preserve old eight-item snapshots/requests and linked-round roles; do not
  reinterpret historical evidence or silently truncate saved drafts.
- **Scope**: the supplied development notes guide the Loadout redesign, without
  authorizing every proposed data/API/runtime change. Keep existing scenario,
  difficulty, feedback and support enums. Unknown usage is not Never used or Due;
  absent eligibility metadata does not exclude corpus. New taxonomy, Travel,
  Summary-only feedback, daily-life logic IDs and the proposed Stage 4
  once-per-target demonstration/once-per-error correction policy remain separate.
- **Supersedes**: the one-to-three primary plus zero-to-two opportunity selection
  budget for newly selected Loadout targets, and the original separate structure
  and expression budgets. Existing scene validation and Stage 4 support/evidence
  behavior remain governed by their current contracts.

## Scope the neutral redesign to practice workspaces — 2026-10-25

The user approved applying the supplied visual reference to the actual Stage 1,
segment picker and Stage 2 pages, including black primary buttons. This supersedes
the earlier purple-primary styling requirement only for these pages. Shared
Mission, corpus and profile styling is unchanged. Retain purple branding,
selection and playback accents, plus existing learning/error semantics.

Use the existing Enable reference audio setup in Stage 1, not the reference
mockup's independent audio player. Keep its actions, status, errors and temporary
buffer explanation (collapsible after enablement). The reference's text hiding,
subtitle masking, waveform examples and loading prescriptions do not authorize
behavior changes. Preserve Quick/Detailed/Review controls, permissions, recording,
analysis layers, retention, routes and responsive stacking.

Follow-up: center the three Stage pills on the workspace, with equal-width outer
header columns and a centered row on narrow screens. Remove the segment picker's
five-minute header badge as requested; keep segment durations and selection rules.
The user subsequently requested less horizontal whitespace: use 16 px desktop
and 12 px phone page insets instead of the reference's 32 px desktop insets.
Remove the outer 1280 px page cap and automatic margins: they created 80 px
side margins in a 1440 px viewport. Keep the 680 px Quick content width. Place the picker's Back
control on the right and remove only the Recommended badge's star icon.

2026-10-30 follow-up: unify Detailed and Review through one presentational
sentence directory and shared layout styles. Use the established 260 px expanded
directory and 56 px collapsed rail, with 32 px desktop / 44 px phone targets,
and a 680 px main content limit. Each mode retains its own fold state, selection,
filters, recording lifecycle and evidence; style sharing does not merge them.

Extend the same visual contract to central results and analysis: common action
sizes, 16 px internal / 24 px desktop section spacing, neutral status surfaces,
and neutral three-layer tabs with a purple selection underline. Keep the
Sound/Rhythm/Melody graph and word-evidence semantics, tab locks, keyboard
navigation, text disclosure and playback handlers. Put saved-analysis status
before the layers in both modes; collapse guidance according to available
analysis width rather than the full browser width.

## Acknowledge successful Mission creation before navigation — 2026-10-24

The device draft's `submission` is an uncertain network request, not a permanent
link to the last Mission. A successful create/retry must acknowledge its exact
owner/client ID and valid session ID, then remove only `submission` under the
existing owner-bound lock and expected-draft comparison. Persist before publishing
the unlocked draft, so quota errors retain the same recoverable request. Keep
targets, scene and settings; a later explicit Start generates a fresh client ID.
Closing/ending a conversation is not the acknowledgement trigger. In particular,
a retry of an already-completed Mission still releases the old device lock once
confirmed, and deleted source cards do not block that acknowledgement.

## Generate one scene and repair only failed fields — 2026-10-24

Supersedes full-response regeneration in the earlier deadline repair. Add optional
`candidate_count: 1 | 2` to planning, default two for existing callers. Automatic
Start explicitly requests one; compare/practice requests two. Saved plan version 1
accepts one to three candidates, retaining legacy reads and frozen Mission IDs.

A second model call returns an exact object of server-assigned repair task IDs.
Allow only known scene/target fields; a structurally mismatched target list may be
replaced as one bounded field. No model-selected paths or arbitrary patch actions.
Preserve all untouched values and run full schema, identity, role, no-disclosure,
frame and practice validation after merging. Collect independent original errors
together, including schema and practice failures. Canonicalize UUID identity/order
before assigning locations. More than 60 schema errors or unlocatable structure
stops safely; no hidden whole-plan regeneration. Transport errors still do not retry.
Repair context may include only affected scene headers and the original bounded
source inputs as untrusted data; rejected target answers are not echoed into the
system instruction or logs. This refines the earlier no-raw-output repair boundary.

Cache identity includes actual scene inputs and selected-source wording/metadata,
separate from Mission settings and the immutable uncertain-create signature.
Difficulty, feedback, template and support changes do not spend another generation.
A single owner-filtered corpus read replaces N per-target reads; durable save/create
snapshot checks remain authoritative. Browser cache is not a shared server cache.

Preparation timings use generated request IDs and fixed stage labels, including
success and failure. Return `Server-Timing` and `X-Request-ID`; browser Performance
entries retain only the latest bounded metric per stage. No content, owner/session
IDs or credentials enter timing logs. Provider timings cover the complete JSON
request; they are not first-token measurements. Gemini start remains separate.

## Align Mission planning schema and Ark deadlines — 2026-10-24

Separate the model-facing generation schema from the backward-compatible saved
plan schema: new sentence frames are mandatory strings, server-owned metadata is
omitted, and target IDs are constrained to the selection. New model frames use
one `{{target}}` marker, expanded only after target identity and role verification.
AI still supplies the surrounding frame and learner slots; the server cannot
invent a missing slot. Validate the expanded frame under the existing exact-word,
structure-anchor and 500-character rules. Reject duplicate/nested markers. Public
responses and stored plans contain expanded frames, and valid literal frames
remain compatible. Collect all safe semantic failures for the bounded repair;
never log source text or return rejected model output in the repair instruction.
Request two concise candidates. Give initial generation and its one permitted content repair one
shared 90-second deadline, with 120 seconds at the browser for the whole request.
A real five-target repair took 52.71 seconds; the earlier 45-second budget could
not complete it. Keep strict final validation, existing transport-error behavior,
legacy plan readability, and the 20-second Mission-create timeout unchanged.

## Use Doubao for current text analysis — 2026-10-23

Accepted at the user's request: replace text analysis with Doubao through
Volcengine Ark, using the supplied server-only `ARK_API_KEY`. Keep Gemini Live
voice on its existing Gemini credential. Default to the successfully probed
`doubao-seed-2-1-lite-260915`, configurable through `ARK_MODEL` (also accepting
an Ark inference endpoint ID). Use `ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3`
and the supplied Chat API contract: Bearer auth, JSON objects, SSE and
`thinking.type=disabled`. Keep task-specific token/time limits, strict validation
and explicit failure states. Do not silently fall back to Gemini or DeepSeek.
Retain saved results and historical evaluations; provider connectivity does not
prove equivalent model quality. Earlier DeepSeek notes describe historical work.

## Grounded review, linked practice and support history P3/P4 — 2026-10-20

Extend analysis to `speaking-feedback-v3` while keeping rubric v2 and historical
v1/v2 execution/results. Missed-opportunity rewrites are optional AI suggestions in
the same bounded assessment call. They require an actually presented opportunity,
the immediately following final learner reply, exact revision/range evidence and a
separate conservative content check. A rejected suggestion cannot erase valid scores
or count as actual language use.

Linked second rounds keep selected language and target roles, while changing concrete
details or exchanging the two distinct role strings. Compute changes on the server,
freeze parent/root IDs and parent item associations, and require an explicit support
choice. Preserve exact retry and uncertain-request recovery before checking deleted
or changed sources. Compare only existing compatible ready reports, without hidden
analysis calls, manufactured zeros or learning-gain scores.

New explicit-support sessions receive `speaking-evidence-v3` and immutable original
corpus IDs; do not backfill those claims into historical sessions. Support rule
`support-history-v1` accepts only ready v3 reports with separately recorded appropriate,
strictly independent references whose frozen language still matches the selected
card. Every primary target needs three Missions across two UTC dates of actual qualifying learner speech
and two scene families. Linked rounds and identical scenes do not manufacture
variety. Read at most 100 matching owner-bound reports and report truncation.
Suggest at most one level less support, require user application, and never write
mastery or comfort/focus/stretch states. These conservative thresholds are product
rules, not empirically validated learning criteria.

## Manual Mission support and model-then-transfer — 2026-10-20

Implement P2 with four explicit levels independent of difficulty: `model_frame`,
`model_label`, `label_only`, `no_hint`. New drafts default to `model_frame`;
missing/null settings preserve legacy sessions and submission identities. Initial
support is frozen atomically with the session through a separate supported-create
RPC; existing creation signatures remain unchanged. Runtime changes start from
version 0, use CAS and occur only between safe reply boundaries. A stale selector
or busy provider/playback returns an explicit retryable result, never an optimistic
setting that differs from the server.

The two modeling levels use a distinct `model_then_transfer` action. The AI uses
one target once in its own natural point, then asks for the learner's different
content. Implicit elicitation retains its strict no-disclosure contract.
Generated frames preserve target wording and blank slots; model reflection
requires exact, separate, ordered demonstration/question evidence. Semantic
quality remains an advisory judgment. All explicit support levels suppress
automatic help cards; the learner can still request help.

Keep sent controls, content compliance, actual presentation and learner use
separate. Publish only server-anchored UTF-16 demonstration spans. Partial audio
can establish possible exposure but cannot establish that a demonstration or
transfer question was heard. Reducing support never clears prior assistance.
Stage 4 and Stage 5 share the same narrow variant-grounding rule and conservative
attribution. Freeze support changes and teaching evidence for later review;
previous reports retain their original source and results. The later P4 increment offers explicit history-based support suggestions; automatic
support upgrades and mastery inference remain excluded.

## Expression-led Mission planning — 2026-10-20

The next follow-up separates system output failures from learner selection fit.
Recover locally validated model-content errors with at most one constrained
regeneration inside a shared 45-second model budget. Canonicalize target order
only when IDs and roles are complete and correct; never drop targets or weaken
final validation. Network/provider/timeout/storage failures do not trigger
automatic retries. Recommend two primary targets plus zero or one opportunity
target without reducing the allowed budget. Fit advice must name one validated
candidate and its actual per-target reasons; role/removal changes require the
learner's explicit action and preserve budget and draft-recovery rules.

The follow-up simplifies the default interaction to one **Start mission** action:
prepare a matching scene if necessary, select an eligible candidate and save/open
the Mission. Scene comparison remains an optional **Choose a scene myself**
section. Reuse a valid current choice or cached plan, prefer candidates with more
high-fit primary targets, and keep stable proposal order for ties. Low/unknown
primary fit still prevents creation. Persist the selected plan and exact creation
request before sending it; uncertain creation retries must not regenerate a plan.

The user accepted P0/P1 of [the revised Stage 3/4 plan](design/docs/STAGE_THREE_FOUR_MISSION_PLAN.md). New Loadout selects language first, with one to three primary targets and at most two opportunity targets across expressions and structures. Generate two or three candidate scenes, explain suitability, then freeze the confirmed scene, roles, target metadata and learner-directed trigger plans with the Mission. Preserve legacy drafts and idempotent recovery; never silently discard excess selections. A stale corpus snapshot requires a new plan before first creation.

P1 retains implicit elicitation. It prioritizes suitable primary targets and records sent, bound, reflected and actually presented opportunities separately. Skip/restore is a versioned runtime state; missing opportunities and skipped targets are not learner failures. Fix Stage 5's older two-turn-only attribution before adding demonstrations: actual expression/example visibility is session-scoped assistance, and uncertain timing is not independent use. Version the changed coverage contract, retain old report results and keep opportunity targets outside the primary denominator.

P2 is now implemented as the separate model-then-transfer action and four manual support levels described above. The later P3/P4 entry above adds grounded rewrites, associated second rounds and explicit history-based support suggestions. No teaching-effect or mastery claim follows from software tests or one successful provider probe.

## Mission teaching control and private diagnostics — 2026-10-18

Keep Gemini's voice response independent of DeepSeek. Analyze finalized learner revisions from the first turn, but reserve the first two substantive utterances for observation; explicit wording help is exempt. Automatic teaching requires a contextual opportunity and uses one pending candidate, a 45-second/source-plus-two-user-turn lifetime, a two-substantive-turn cooldown and at most two bound automatic attempts per target. Wake dispatch when either analysis or the provider turn completes. Preserve immutable sent attempts independently of replaceable candidates; sent/bound does not mean reflected or delivered.

The first real-provider probe exposed target-answer priming and model offset errors. Withhold selected wording from Gemini's setup and implicit controls; send only the communicative task the learner should perform and a contextual question. Keep the target in private immutable assessment metadata. Deterministically detected target disclosure fails compliance before advisory model assessment, without buffering or delaying voice. Opening/silence controls do not supersede a pending teaching Attempt. For new Stage 4 evidence, let the server derive UTF-16 offsets from a unique exact quote; accept supplied ranges to disambiguate repetitions and repair incorrect ranges only when the quote is unique. Record anchor provenance and retain strict validation of stored evidence and Stage 5 inputs.

A follow-up live probe stopped on `audio_rate` before strategy execution. PCM/ping/playback/display receipts must not wait for the provider/state operation lock used during database writes. Keep single-reader order for microphone/text controls, existing provider-send serialization and unchanged input rate limits; move completed-playback writes into the tracked background exposure drain. At shutdown, reconcile locally received complete ACKs so delayed storage cannot falsely mark fully heard replies interrupted. Preserve failure/unknown-write diagnostics instead of claiming durable receipt before storage succeeds.

Offer shared direction, usage and explicitly requested example help. Only a completed response assessed as reflecting the policy can produce an automatic direction card. Record actual visible levels and acknowledged expression delivery; target/example exposure remains assisted within the current Mission. Overlapping presentation is uncertain, never retroactive proof of independent or prompted performance. Explicit help has its own request path and must remain available outside automatic teaching budgets.

Store detailed provider content and execution diagnostics in an owner-authorized journal separate from public workspace snapshots and CAS state. Use bounded background writes with idempotent event IDs, gap records and bounded draining; do not promise exactly-once delivery. Reads retain 30 days from insertion, appends prune expired events for that session, and session deletion cascades. The global purge RPC is present but unscheduled, so 30-day physical deletion of inactive-session diagnostics is not guaranteed. The hosted migration is applied; application rollout and live quality/timing qualification remain separate. See [the implementation contract](design/docs/STAGE_FOUR_TEACHING_CONTROL.md).

## Mission startup, silence and audio bursts — 2026-10-18

The user chose voice-only automatic conversation advancement: after AI playback, wait 15 seconds and offer a brief follow-up, with at most two until the learner responds. Implement server-owned controls guarded by speech/transcription, generation, playback and runtime ownership; never synthesize user evidence. Idle detection and triggering use a roughly two-second heartbeat, so the observed delay may be a few seconds longer; connection-local timers/counters reset on reconnect. Start an empty conversation only after initial microphone mode is acknowledged; pending permission cannot block typed input. Replace the fixed one-second audio count with five seconds of bounded PCM burst credit and a 60 KB/s refill for nominal 48 KB/s audio. Keep existing frame, idle and connection limits.

## Mission speech-onset tuning — 2026-10-18

Use the provider's documented onset-confirmation duration (`prefixPaddingMs = 300`) to make brief-noise barge-in less sensitive. Keep low start/end sensitivity, the 1200 ms silence window and automatic interruption. Accept potentially slower deliberate barge-in and missed very short utterances; do not claim measured acoustic improvement without real-microphone evaluation. Existing connections must reconnect to receive the new setup.

## Chat empty-message visibility — 2026-10-18

Filter blank saved messages and live fragments only at the Chat presentation boundary. Keep runtime placeholders for turn identity and later transcription; render nonblank messages regardless of finalization status.

## Mission loading consistency — 2026-10-18

Extend the prior route-loading cleanup to Speaking: keep the current Loadout UI while the destination route resolves, then use the same Mission shell for auth and workspace loading. Do not add delays or hide loading errors.


## Persistent reader video scrolling — 2026-10-18

Keep the shared iframe in its stable media host. Cross-origin wheel events do not bubble through the slot's React tree, so use native scroll chaining on the host and relay its displacement into the reader's scroll container. Do not overlay the video, disable pointer events, or reparent/reload it to restore scrolling. Enable the relay only when Stage 1 has an independently scrollable center panel; document-scrolling layouts use native behavior.

## Stage 1 progressive reveal — 2026-10-18

Use real data arrival as the reveal boundary, with 320 ms opacity/translation entrances and 40 ms row offsets capped at 240 ms. Animate at most twelve new items per region per commit; remaining items are available immediately. Do not delay network processing, type out text, animate layout dimensions or replay unchanged identities. Coalesce same-frame preview snapshots and schedule their React updates as transitions, while preserving failure/retry state and cancelling pending preview frames on completion or cleanup. Reduced motion disables entrances and skeleton pulses.

## Direct Stage 2 entry — 2026-10-17

Remove the mandatory Ready to practice screen. Confirming a segment enters Shadow directly (Quick by default); unauthenticated learners retain the existing sign-in gate and return target. The picker prefetches the selected segment’s Shadow route/code. Existing `/segments?segmentId=…&step=prepare` links replace into Shadow without a preparation history entry. Content-owned media, reference capture/cache, and account-owned save queues keep their existing ownership. Reference preparation remains available in Detailed; this does not auto-enable capture, playback, microphone or upload consent.

## Stage 2 Quick and Review — 2026-10-17

Follow-up: place the mode switch inside Detailed’s existing header so it does not consume a row of the outer reader grid. Keep the original practice area and layer styles. Review gives the sibling word-result and analysis components distinct take-scoped keys, preventing duplicate-key reconciliation errors.

Implement `design/prototypes/libitu_quick_shadowing_and_review.html` as Quick and Review, defaulting to Quick, while preserving the original Detailed component and styles. User clarification supersedes the prototype's silence detection and Reference lock: record for twice the original sentence duration with early Done; show eligible learner-only layers when Reference is missing. Reuse real word checks and acoustic evidence, never prototype example scores or unimplemented sound judgments.

Quick may record without Reference; freeze an available uploaded Reference ID at recording start. Detailed keeps its original preparation behavior and 60-second recorder default. Per-take duration is checked against trusted source bounds by the API, decoder and database, with a one-second tolerance and the legacy 61-second floor. Hosted migration: `20261017121513_quick_shadowing_duration`. Existing upload byte limits and consent are unchanged.

Quick-only clarification (2026-10-17): Pause or tab hiding cancels and discards an unfinished recording; completed takes remain saved. Resume always replays the current sentence. Reference/video playback ends with a visible 2-second preparation countdown before requesting the microphone. Cancellation, mode changes and stale timer callbacks cannot start a late recording. The countdown is excluded from the original-duration × 2 recording budget; Done and automatic completion still save. Detailed behavior is unchanged. Temporary audio replay is capped at 30 takes / 64 MiB and does not survive reload; later account playback requires explicit retention. Browser acceptance uses synthetic inputs and does not validate model accuracy.


## Accepted Stage 2 refactor contract

### 2026-10-16: Publish coarse server signals before MFA

- **Status**: approved and implemented locally; hosted checkpoint migration applied, remote application deployment separate.
- **Decision**: introduce durable complete learner frames and `coarse_ready` on >=85% new Takes. Coarse uses only shared server F0/energy; no browser features or duration channel. User ASR word timestamps and saved Reference subtitle timestamps carry `boundary_source`; missing/unreliable word intervals yield only sentence curves. Identical aggregation and explicit sensitivity diagnostics apply on both sides.
- **Evidence**: [local computation report](design/benchmarks/progressive-acoustics-20261016/README.md). Continuous relative prominence remains uncalibrated; no strong/weak classification, stress detector or correctness score. Lengthening remains uncertain until duration evidence exists.
- **Persistence**: full raw frames survive analysis-audio cleanup and support retries, but analysis/parent deletion removes them. Reference caches use a new policy version and immutable input/engine identity. Old missing energy is not reconstructed. Owner/lease fences and service-only SQL grants remain.
- **Delivery**: publish before MFA in existing workers, then upgrade to original final layer rendering with additional experimental Rhythm prominence. Keep beam 5 and exact gates. Dedicated worker lanes, CPU isolation, ASR/extraction concurrency and target-instance timing remain follow-ups; this increment does not promise cloud end-to-end latency.
- **Supersedes**: the earlier offline-only restriction for the newly approved integration. The offline benchmark remains historical evidence and its standalone code remains separate.

### 2026-10-16: Evaluate CWT prominence offline before product integration

- **Status**: accepted for offline experimentation only.
- **Decision**: reuse MFA boundaries and complete 10ms F0/energy, implement an independent PyWavelets baseline without importing the full Wavelet Prosody Toolkit, and output continuous relative prominence plus uncertainty. No strong/weak classification or correctness probability before human annotation and calibration.
- **Evidence**: [experiment](design/benchmarks/rhythm-cwt-20261016/README.md) measures low incremental computation but exposes edge and duration-weight sensitivity. The latest requested Take's audio was already cleaned, so no user-pair effect claim is possible.
- **Consequence**: full curves and exact Reference caches are local experiment artifacts. Leave production workers, persistence, acquisition and 60/85 gates unchanged. A future approved integration must persist eligible new-Take full frames before audio cleanup, reuse Reference evidence/cache identity, and preserve deletion/expiry. Historical word summaries cannot reconstruct missing energy curves.

### 2026-10-12: Gate learner analysis in three tiers and preserve reference acquisition

- **Status**: accepted target; contract, backend gate and persistence implemented; database migrations applied to hosted Libitu; new practice UI and directory/navigation/history implemented and verified locally; final wider regression and application deployment pending.
- **Decision**: <60% ends after word matching; 60–<85% permits matched-word Sound only; >=85% requests all three layers. Use exact counts rather than rounded percentages. Recognition-error feedback preserves ASR and never changes the tier. Listen and Record are independent; the directory follows the 2026-10-13 text/best-match revision; fewer than four words skip automatic navigation. Keep existing reference acquisition and privacy choices.
- **Contract**: [algorithms, state, API and metadata](design/docs/STAGE_TWO_REFACTOR_CONTRACT.md). Preserve existing reference verification; do not apply learner thresholds to it. Partial recognition must map measured words explicitly rather than force missing expected words into learner audio. Existing detectors remain the capability boundary. Step 4 removes pre-gate local learner acoustic inference from the new practice flow; source reference previews/acquisition remain unchanged. Text-for-next-take settings never hide or rewrite a displayed result. Historical replay selects its exact take and does not inherit the latest local clip.
- **Progress/history**: derive practiced from surviving owned records plus content-scoped pending outbox takes. A service-only, invoker scalar JSON aggregate avoids Data API row limits without adding a second progress store. Keep manual selection per sentence and account; paginated refresh loads through the selected older take. Audio-only deletion retains progress and result selection. Full deletion reconciles to the latest surviving take, clearing the local saved clip when that exact record is deleted; the last deletion returns to concealed practice.
- **Delivery**: contract → backend gate → persistence/feedback → practice UI → navigation/history → regression. Step 2 includes the minimal queue/checkpoint migration required for durable stages; recognition feedback and text-support storage are implemented in step 3, with both migrations applied and verified online. Include visible_source_indices_at_start to distinguish pre-recording visibility from later peeks; snapshots are immutable and outbox retries deep-copy nested metadata. Legacy payload fingerprints remain unchanged. New jobs use practice-gated-v3; existing v2 jobs/results and reference verification remain unchanged.

### 2026-10-12: Match the approved Stage 2 prototype’s control presentation

- **Status**: implemented locally; original acquisition, assessment gates and consent remain unchanged.
- **Decision**: use a 206 px expanded/56 px collapsed sentence rail, compact integrated video/reference status card, purple Record/red Stop controls and upward settings with segmented speed/text choices. Remove the three user-specified redundant sentences. Keep the existing real status/retry/error evidence instead of prototype demo timing or invented readiness.
- **Waveform**: show live amplitude from the recorder’s already authorized stream. The monitor never requests another microphone, routes audio to speakers, uploads data or starts acoustic inference. Disconnect its nodes, cancel its animation frame and close its AudioContext on stop/cancel/navigation/unmount. Silence remains flat; it is not an assessment.

### 2026-10-13: Show sentence text and durable best word match; restore shared controls

- **Decision**: supersede the previous no-text/no-score directory and purple Record styling. Show sentence text and upper-right practiced/unpracticed, highest reliable word-match percentage and exact >=85% pass status. Collapse during microphone request, recording and encoding; restore the manual preference afterwards. These are word-match markers, not pronunciation grades.
- **Data**: extend the existing progress response from existing durable checks, reading bounded keyset pages under owner/content filters. Ignore unreliable/legacy/deleted evidence; deleting playback audio preserves progress while deleting a winning analysis/take recomputes the maximum. Recognition feedback never changes it. No migration or new analysis request is necessary.
- **Reference and controls**: completed server references remain Ready despite local preview work/setup. Keep errors/deletion visible. Center the wrapping control group and waveform separately; use shared black Record/red Stop media pills without page-specific paint overrides. Original acquisition and media ownership remain unchanged.

## Proposed architecture

### 2026-10-09: Separate content navigation from learning runtime ownership

- **Status**: R0–R5 implemented; R3 direct-update decision below supersedes the proposed compatibility strategy.
- **Proposal**: adopt content-based Reader/Shadow routes with one content runtime and stable media host; keep account-bound saves above route changes. Add a read-only content-context endpoint and explicit failed-job retry intent, and collect multi-step analysis/speaking actions into services. Migrate extension URL identity through a versioned protocol while retaining old entry paths.
- **Reason**: root query routing, duplicate view state and URL-coupled extension sessions prevent independent navigation changes; current return links lose origin context and job-only entry interpretation is inconsistent.
- **Consequence**: deliver R0–R5 in the [architecture proposal](design/docs/ROUTING_AND_RESPONSIBILITY_ARCHITECTURE.md), with identity, media, history, auth and mixed-version acceptance before canonical link rollout. No provider, database schema, visual terminology or media-consent change is approved by this proposal.
- **Relationship**: the accepted root-link compatibility, anonymous Reader, authenticated Shadow and cross-page save decisions remain in force. This proposal does not mark new routes or APIs as implemented or supersede current product behavior.

## Accepted decisions

Stage 2 direct component restoration (2026-10-13): at the user’s explicit request, copy SoundComparison.tsx, LayerComparison.tsx (including Rhythm and PitchOverlay), and LayerFocus.tsx verbatim from /Users/river/Documents/Libitu. Their internal presentation now matches that workspace byte for byte; existing shared CSS already matches. Own Sound conceal/reveal state in StageTwoShadowing via the original controlled props, scoped to the selected sentence/take. Keep prototype status badges, recording-state visibility, word gates and source/reference acquisition outside these restored components. Word differences remain in the separate word-check result; unavailable acoustic measurements remain blank in the data adapter, while the original Sound practice-target cues are retained.

Stage 2 analysis state clarification (2026-10-13): verified the fetched origin/main at d84bd9d. Keep its internal Sound/Rhythm/Melody layout, diagrams and explanation panel; prototype styling applies only to compact layer status badges. Hide layers before recording, during microphone/encoding work and until the selected take has a durable word check (or completed legacy evidence). Then retain the exact 60/85 gates, show locks, pending ellipses, insufficient/interrupted dashes or colored evidence badges. Sound has no aggregate score: use a completion mark, with an asterisk for matched-only scope; Rhythm/Melody display real experimental similarity scores when present, otherwise a completion mark for available measurements. Existing unpaired learner evidence remains viewable. Deleted/no-analysis takes hide layers; retry/error controls remain available. Source/reference acquisition is unchanged.

Stage 2 analysis appearance restoration (2026-10-13): restore the main-worktree presentation of the three analysis layers: 52 px tabs and the original Sound Shadow mode/Hide text/Reveal all toolbar; status badges follow the prototype as clarified below. Remove refactor-only mobile workspace and unmatched-word box overrides. Keep the 60/85% gates, disabled tabs, exact take/reference mapping and truthful unmatched-word notes. Sound review visibility stays local to the selected take; it does not alter recording support snapshots or the word-check result. Rhythm/Pitch drawing and LayerFocus were not restyled by this refactor.


### 2026-10-12: Reference snapshots use the displayed server sentence view

The public blueprint route derives source-bound sentences and segments from current caption timing while keeping persisted semantic analysis immutable. Reference recovery/capability/preparation must resolve against that same projection rather than raw stored rows, so a valid displayed sentence can be captured and recovered by its exact ID and bounds. A missing saved reference returns null only after current sentence validation; unknown sentences and changed bounds remain errors. The UI must not show its idle playback instruction alongside a recovery/upload failure. No client-supplied sentence text, ID alias, cache rewrite or new media permission is introduced.

### 2026-10-11: Retain original video records with direct Stage 1 entry

- **Decision**: add original-video records to the personal page and unified history, with a Videos filter and one record per source. The record opens the canonical `/practice/{contentId}` Reader route without restoring a Shadow segment/sentence.
- **Data**: authenticated ready workspace visits upsert only owner, content and last-opened timestamp in existing `user_content_states`; preserve its mode/progress. Surviving owner-scoped Shadow and corpus sources supply earlier video associations. Public catalogue entries alone are never personal history.
- **Boundary**: only public YouTube content supported by the current Reader is listed. Visits do not imply completed viewing or practice, and do not add duration, streaks or scores. GET profile/history remains read-only; a separate authenticated PUT records a workspace visit. Guest/account changes never claim the previous identity’s mounted source. No migration or paid/model/media operation is added.

### 2026-10-11: Give general pages one visible loading owner

The root `loading.tsx` and generic Corpus, Loadout and profile route fallbacks stacked ahead of page-owned auth/data placeholders during navigation. Remove those broad fallbacks for these synchronous page shells: a client transition may keep the prior page until commit, then the destination renders its own loading regions. Landing has no business-data loading state. Keep import/content workspace and speaking fallbacks where server work can suspend before the page shell exists. This supersedes the earlier decision to retain a stage-neutral root fallback, without changing content processing, auth gating or media lifetime.

### 2026-10-11: Release practice audio on document identity, not a loading hint

An update event containing only `status: loading` does not establish that the top-level Chrome document or content source changed. Keep the existing content-owned v4 session through same-document sentence and query updates. Close it when a different content URL is reported, `webNavigation.onCommitted` establishes a new top-level document, the page exits, the tab closes, or the existing timeout/error rules apply. This restores the accepted one-authorization-across-sentences contract without broadening capture permission; the toolbar gesture remains required to start capture.

### 2026-10-10: Verify the current Chrome document after SPA import

Chrome content-script messages can retain the document's initial `sender.url` after History API navigation. Use that value for origin validation, the current tab for content identity, and `webNavigation.getFrame` to verify that the active top-level document still has the sender's document ID and requested content URL. Apply the same boundary to buffered-audio arming/probes and fresh-caption reads. Do not infer audio authorization from successful arming; the Chrome toolbar action remains required. Browser regressions must cover import→content in one document as well as cold canonical entries.

### 2026-10-10: Finish route migration with one active implementation per responsibility

Remove the v2 capture runtime, its Web hook/panel and the old resolve/job/blueprint entry loader. Import owns transient captions and content resolution; the content controller accepts a resolved content ID and owns public reads/processing observation and explicit retries. Content-owned v4 capture/cache resources serve both Reader preparation and Shadow. Read stage, segment and sentence selection from the URL; keep local state only for interaction controls. Invalid client-side URLs clear the previous activation/retry identity so browser Back can recover safely. Extension source verification uses `content.content_id` from the shared public API contract; reuse that JSON in extension regression tests to prevent independently mocked field drift. Historical records remain as history, while current instructions and executable fixtures use canonical routes and v4. This does not delete stored content, introduce schema changes or qualify real toolbar capture.

### 2026-10-10: Separate reference capability probing from verified arming

The user approved removing duplicate serial identity checks from Enable reference audio. Keep `ping` local and side-effect free; perform one fresh public metadata check for a new `arm`, retain current-document validation, and share pending work for duplicate arms owned by the same session. `/api/content/{id}/identity` returns the existing public content projection without reading analysis/jobs or creating processing. Keep verified tab-reuse registration separate as `register`; an availability response is not proof of content identity. Web state distinguishes checking, preparing, armed and enabled, and only the real armed acknowledgement prompts the toolbar click. Reserve pending ownership before I/O so cancellation/navigation can invalidate late results. Actual capture still requires the explicit toolbar gesture. This is a direct coordinated Web/API/extension update, with no legacy endpoint fallback or database migration.

### 2026-10-10: Prefetch known destinations and preserve ready workspace content

Warm internal routes on hover, focus or touch while retaining Next link viewport prefetch. Warm the next valid workspace step when its inputs are ready, and preload Shadow code during preparation without mounting it. Unknown IDs are not guessed: session creation and content resolution still complete before their destinations become available. Route prefetch must remain read-only and must not activate import, processing, microphone or session client effects. Remove the nested content-route `loading.tsx` introduced in the preceding correction: the shared layout owns cold-entry fallback, while ready workspace navigation retains the current content and persistent media. Match Stage 2 placeholders to selection/preparation/Shadow geometry and responsive ordering, with decorative shapes and reduced-motion support. The user’s subsequent simplification keeps only broad regions and removes imitation controls, repeated sentence rows and nested analysis/history details. Extension launch/preflight latency remains deferred.

### 2026-10-10: Present import waiting within the workspace loading shell

The import route receives transient captions and resolves a stable content ID before mounting the content runtime. Keep this sequencing and show the existing Reader skeleton throughout route loading, caption handoff and resolution. Show failures and retry separately; successful resolution immediately replaces the transient URL. The shared content-layout cold-entry fallback follows the destination pathname without reading search parameters or workspace data: Reader retains the Reader shell; segments/Shadow receive their matching structural skeletons. The follow-up removes the nested content-route loading boundary so ready content remains visible during internal navigation. This corrects the initially hard-coded practice fallback, which could appear between import and Reader. The root fallback remains stage-neutral; the content provider and media host remain in the shared layout. This corrects R3 presentation without introducing a delay, player, processing request or protocol change.

### 2026-10-10: Replace learning routes and extension protocols directly

The user explicitly rejected backward compatibility during R3. This supersedes the earlier dual-protocol, legacy-root adapter, v1 continuation migration and entry-switch requirements. Web and extension are one coordinated release: `/` is Landing, input enters `/practice/import`, and content lives at `/practice/{contentId}` with `/segments` and `/shadow` children. The import page consumes matching handoff captions before mounting media. Existing root query bookmarks and job-only links are unsupported; no automatic translation or old-protocol fallback is installed. New extension launches go directly to import. Existing content, corpus and practice records remain intact; their links use canonical content IDs.

Only v4 buffer/handoff/timing bridges are enabled. Capture binds exact origin, Chrome sender tab/document, an isolated bridge's per-document nonce, content ID, canonical video ID and capture session ID. The extension checks content→video against the public read-only API before arming, and still requires an explicit same-tab toolbar action. Steps, sentences and level changes do not invalidate the binding; content/document changes and worker restart do. New-document detection uses Chrome webNavigation in addition to pagehide and lease expiry. Public reads and nonce correlation do not grant media permission.

R4's necessary link producers, extension tab reuse and continuation v2 writes are pulled into R3 so no live entry emits an unsupported address. v1 continuation records are ignored, not migrated; root account/outbox ownership and persisted practice records are unchanged. R5 removes the retired capture runtime and old entry loader and reconciles active documentation/fixtures. This is a local implementation change, not deployment or live-media qualification.


### 2026-10-10: Give the content workspace one media owner

The content controller owns activation, source validation, processing observation, explicit retry intent and immutable blueprint publication. It reuses available results even when an older job failed; only missing processing can be ensured automatically, and lost retry responses retain the observed attempt count. Existing caption input is consumed only when needed and matching; available results do not trigger new semantic analysis.

One content-scoped MediaHost keeps the same actual iframe while Reader, preparation and Shadow register their display position and control callbacks. The host follows the existing layout using measured slots and scroll clipping, without reparenting or changing portal containers. Leaving a view pauses and clears its range; leaving the content destroys the player. Normalize the legacy source URL before creating media resources so v3 extension identity remains stable.

The workspace owns reference buffers, owner-scoped analysis caches and deferred caption updates. Active Shadow keeps its original sentence snapshot; only paused Reader accepts recovered timing. Account changes reset private Shadow resources and fence Reader detail callbacks without reloading public analysis. PracticePersistence remains above the workspace so accepted saves/uploads can finish after navigation. R2 retains legacy query URLs and local picker/preparation states; new routes and push-history rules remain R3 work.

### 2026-10-10: Make content reads passive and processing retries conditional

`GET /api/content/{content_id}` exposes only public YouTube metadata and current-version processing summaries, with `no-store`; it never resolves captions or starts work. Durable visibility governs when configured, and storage failures produce a safe 503 instead of apparent absence. A blueprint can be available independently of an older failed job. Missing source metadata is recoverable only from a valid normalized video key, never from demo content.

Explicit `retry_failed=false` preserves failures. `true` requires the observed `expected_attempt_count`; an atomic status/count comparison reserves the next attempt, stale counts return current state and future counts conflict. `attempt_count` now identifies an accepted processing attempt: creation reserves 1 and retry reserves the next count; worker startup does not increment it again. PostgreSQL conditional PATCH and Redis Lua implement the storage boundary without a schema migration. Durable state wins over stale Redis job state, and delayed cache publishers cannot regress a generation or terminal state. Omitted fields retain legacy adapter retry behavior; the Reader now adopts the new contract through the R2 content controller.

Practice analysis reads/control/deletion are service use cases with ownership and tombstone-before-audio ordering. Speaking end/delete commit durable state and fence late writers before best-effort local cleanup. End still attempts feedback after local cleanup failure; feedback failures are repaired by the existing reconciliation worker and do not undo completion. Deployment must upgrade the API and blueprint worker together because attempt reservation moved from worker startup to the command boundary. Hosted deployment and operational recovery qualification remain pending.

### 2026-10-10: Separate learning origin from authentication return in legacy routes

One shared parser/builder owns current root learning URLs. Reject ambiguous or malformed entries, resolve standalone job IDs through the existing job read, and verify job/content/blueprint association. Browser entry parsing never supplies demo content when identity is absent. A learning origin may point to learning, Corpus or profile/history; it excludes nested return chains and transient job/caption handoffs. Mission configuration, conversation, reports, retries and draft adjustments propagate that same sanitized origin. Authentication uses a distinct return rule that preserves the initiating supported page, query and fragment, including Mission/report pages. Links expose their complete destination in href so copying and new-tab navigation preserve origin. This R0 decision does not introduce canonical practice routes, change media lifetimes or implement the planned backend content-context/retry contracts.

### 2026-10-08: Bind transcript highlights to visible corpus cards

Use the same merged candidate/saved corpus list for Stage 1 annotations and sidebar cards. Match complete source wording with word boundaries rather than guessing from partial fragments. Each annotation carries its card identity; activation selects the card’s category, scrolls and focuses it, preserving Saved when appropriate. Highlight activation does not seek the player; timestamps and ordinary sentence text retain playback navigation.


### 2026-10-04: Stabilize draft feedback without renaming flows

Loadout draft-save feedback now reserves its space while hidden, avoiding form movement on input and option changes. Textarea focus uses a neutral thin outline, and directional links default to the same outlined secondary appearance as directional buttons. All user-facing wording and destinations remain unchanged; the proposed Learn terminology is not adopted.


### 2026-10-04: Unify selects and directional controls

All visible selects use the shared Radix components, including Loadout settings/source and Corpus sorting. Menus use borderless option highlights, a light panel edge/shadow and inset trigger arrows. DirectionButton/DirectionLink standardize back/next actions at 40 px with 16 px icons; multiline navigation cards keep their card geometry. Reader outer bottom padding is removed and shell height fills the remaining viewport, placing its entry bar against the bottom edge.


### 2026-10-04: Exclude caption cues from spoken text

Remove square-bracket cues such as `[clears throat]` entirely and strip `>>` / `<<` speaker markers and stray square brackets. Apply this before English caption analysis and when adapting cached transcripts for both learning stages. Keep spoken punctuation, source timing and existing cached sentence identity; do not reanalyze stored blueprints merely for display cleanup.

### 2026-10-04: Share application navigation

Use AppHeader for Corpus, My learning/history and mission preparation/conversation/report pages. All share Practice, Corpus, Mission and My learning links in that order, plus a single account area. Use 32/20/16 px horizontal gutters at desktop/900 px/480 px breakpoints. Keep workflow actions in a separate content toolbar. Landing and reader keep their dedicated navigation.


### 2026-10-04: Use white page canvases

Reader footer follow-up (2026-10-04): the Stage 2 entry bar spans the viewport horizontally, canceling the reader gutter only for this footer. Its content keeps internal padding; other reader sections retain their responsive gutters.

The user requested white outer backgrounds across framed pages. Global body and feature page wrappers use the white primary background; warm-neutral secondary surfaces remain available inside content. Preserve existing gutters and layout. This supersedes the former warm page-background recommendation.

### 2026-10-04: Apply reader-specific spacing from browser review

The user explicitly requested responsive outer margins and targeted button/spacing corrections, superseding the earlier blanket geometry-preservation rule for this reader follow-up. Use 16/12/8 px gutters without adding a page frame. Display transcript positions as minute:second only; keep precise source timing for playback and synchronization.

### 2026-10-04: Load Inter and finish control consistency

- **Decision**: the user explicitly approved real Inter loading, superseding the earlier temporary system-font boundary. Bundle licensed normal/italic variable fonts locally; use swap and a metric-adjusted fallback. Preserve monospace teaching text and system fallbacks for unsupported scripts.
- **Scope**: retain existing layout and control geometry, adapting overflow constraints only where actual font metrics require it. Share field states and generic purple selection tokens, retain learning colors, finish auxiliary action feedback and remove redundant button paint.
- **Boundary**: visual fixtures do not constitute real authentication, recording/provider or production acceptance. See [usage and checks](design/docs/VISUAL_SYSTEM.md).

### 2026-10-04: Share semantic button roles while preserving geometry

- **Decision**: retain purple primary actions; use shared secondary, soft, ghost, danger, danger-solid and black recording roles, with red active recording.
- **Boundary**: preserve existing dimensions through explicit inherited sizes; ordinary radius is 8 px, media pills/circles remain. Tabs, filters, switches and selectable cards are separate controls. Navigation stays a real link.
- **Behavior**: loading preserves idle content space, disables repeated native clicks and exposes busy state. Share focus, hover, pressed, disabled and reduced-motion styling. See [usage](design/docs/BUTTON_SYSTEM.md).

### 2026-10-03: Unify visual styling while retaining purple actions and layout

- **Decision**: the user approved a first styling pass based on the visual review, explicitly retaining the purple brand, purple primary buttons and learning semantic colors. Reuse the landing `libitu.` wordmark across existing web brand links; preserve contextual scaling and tagline placement.
- **Scope**: warm-neutral surfaces, shared radius tiers, restrained elevation, typography weights and consistent keyboard/disabled/motion feedback. No changes to grids, spacing, control dimensions, responsive breakpoints or product behavior. Existing black recording/conversation controls retain their roles.
- **Boundary**: the ElevenLabs reference does not authorize monochrome branding, universal pill controls, oversized display typography or new integrations. Keep the current font stack in this pass; loading a new face needs separate layout verification. Extension toolbar bitmap branding remains unchanged.

### 2026-10-03: Introduce a landing page without migrating reader URLs

- **Decision**: rebuild the provided ToneFlow prototype's visual direction in the web app using the existing Libitu brand and shared tokens; do not copy its HTML/CSS/JavaScript. Keep `/` as the landing page unless a nonempty `sourceUrl`, `contentId`, `jobId` or `handoffId` selects the existing reader. Marketing parameters alone never start demo processing.
- **Entry**: normalize supported YouTube URL forms before navigation; the existing backend handles captions/jobs/failures. A pasted URL does not prove language and must not inherit a demo title. Shadow remains optional before a speaking mission.
- **Authentication**: reuse Clerk's real modals, signed-in controls and forced current-URL redirects for login and registration. Retain only the bounded input draft in same-tab session storage; do not infer or simulate identity. Existing guest corpus and private-route ownership remain unchanged.
- **Publication**: keep the prototype-style “Add to Chrome” entry visible. Open a store only when `LIBITU_CHROME_STORE_URL` is a valid HTTPS Chrome Web Store detail listing; otherwise link to installation guidance and label the store release as coming soon. No fake installation/privacy/terms targets, fabricated product results, provider claims or deployment are introduced.

### 2026-10-02: Do not infer spoken language from multilingual ASR ordering

- **Decision**: preserve explicit video/audio language metadata priority, then use the caption renderer's valid `defaultAudioTrackIndex` and that audio track's language identifier. `hasDefaultTrack` is a caption-default signal and may occur on every dubbed audio track; use it as a fallback only when unambiguous.
- **Fallback**: a unique ASR language remains useful for older single-source metadata. Multiple ASR languages without an identifiable default audio language remain unknown; neither the first caption nor an English translation proves spoken English. The supported-language list remains English only.
- **Verification**: sanitized metadata from the reported Lisa Su video reproduces the old Arabic misclassification and passes the corrected English-default regression. Live caption acquisition remains a separate verification step.

### 2026-10-02: Deliver the first usable corpus management library

- **Status**: accepted following the user's approval of the proposed first increment.
- **Decision**: `/corpus` reuses existing local/account storage, source analysis and Loadout. Card bodies open details; separate checkboxes select stable saved keys. Facets use OR within a dimension and AND between dimensions. High value means an existing learning-value score of at least 4/5; unknown scores/dates remain unknown.
- **Editing**: first version edits expression/template, meaning, usage note, functional tags and structure slots. Preserve source context and analysis as explicitly original evidence, stable import keys, and existing session snapshots. Kind/difficulty/register/scenario/quality-score editing is outside this version. Account edits require a confirmed server record; failed writes retain the editor draft and never claim success.
- **Loadout**: merge under the existing browser draft lock with the latest settings and account identity. Reject unavailable references, more than 3 structures or 5 shared expressions, and a pending idempotent session submission; never truncate selections. Preserve guest-adoption and existing account-draft rules.
- **Scope**: no new database tables or provider integration. Decks, corpus usage aggregation, review scheduling and server-side list pagination remain separate.

### 2026-10-02: Keep practice history a focused record list

- **Status**: implemented following the user's request for a simple history page reachable from the personal page.
- **Decision**: use one chronological list with All / Shadowing / Missions filters, local-date headings and per-record time, duration or turn count, practice state and one destination. Apply the kind filter before pagination in the authenticated API; filter changes clear the old list and cancel its reads.
- **Scope**: completed Missions open Stage 5 reports, other Missions open their conversation, and Shadow takes return to their available source. This page does not introduce recording replay, exact-take restoration, deletion, score trends or a new assessment request. Existing account isolation, counting and source-visibility boundaries remain in force.

### 2026-10-02: Surface Stage 5 session feedback in the private profile

- **Status**: accepted following the user’s request to inspect and integrate the completed scoring work.
- **Decision**: integrate the existing Stage 5 implementation and show its latest compatible ready/partial report separately from the five general learning dimensions. Sort reports by final learner practice time, not retry time. Preserve real zero scores and null abstentions, and link completed Mission history to Analytics with explicit pending/failed/legacy states.
- **Ownership and cost**: read the minimal report projection through owner-filtered sessions; never expose transcripts, citations or worker internals in the profile response. Viewing the profile never creates or retries assessment jobs. Stage 5 generation remains the existing end/request plus worker lifecycle.
- **Boundary**: no general ability inference, cross-session score trend or new rubric. Existing reports must match the current rubric/analysis versions and dimension contract. Human calibration and production worker qualification remain separate. See [profile integration](design/docs/PROFILE_IMPLEMENTATION.md).

### 2026-10-02: Deliver a private learning center from saved activity

- **Status**: accepted following the user's request to implement the analyzed first version.
- **Decision**: follow the profile prototype's identity, dimensions, activity, shortcuts and recent-practice hierarchy. Keep five dimensions explicitly unassessed; replace illustrative score curves with real saved-activity counts. Do not infer ability, weakest dimensions, total learning time or a personal learning goal from record counts.
- **Counting**: a Shadow take is one non-deleted attempt; a practiced Mission has at least one finalized nonempty learner contribution. Recording time is Shadow audio only. Streaks use those practice events and the browser's IANA timezone, retaining a run ending yesterday. Corpus additions count currently surviving saved items by creation date; missing timestamps remain unknown.
- **Ownership and continuity**: use authenticated owner-filtered server reads with private/no-store responses. Browser continuation belongs to one account and ready source; account switching does not adopt the previous account's open source. Older attempts without a segment identity reopen Stage 1, with no automatic playback. No new schema, AI call, media acquisition or public profile is included.
- **Scope**: `/profile/history` aggregates existing records; the corpus shortcut opens the existing `/loadout#corpus` picker. Full library management, cross-device reading position and validated assessment remain separate. See [implementation](design/docs/PROFILE_IMPLEMENTATION.md).

### 2026-10-01: Build evidence-backed Stage 5 reports

- **Status**: accepted and implemented locally; [verification and limits](design/docs/STAGE_FIVE_CONTRACT.md).
- **Decision**: four dimensions only: task fit, language transfer, scenario fit and naturalness. AI rates explicit rubric criteria with exact user quotations; the server calculates normalized scores. Transfer counts unique selected items used appropriately, with prompted and independent observations shown separately. Missing/uncertain evidence is not zero. No fluency, pronunciation, overall ability or mastery score.
- **Lifecycle**: freeze the completed mission's settings, transcript and teaching exposures in an owner-scoped durable report job. A separate leased worker reassesses the whole final transcript, including turns whose Stage 4 analysis never finished. Idempotent requests, bounded retries and deletion fencing protect recovery.
- **Experience**: four cards, evidence-linked details, at most three meaning-preserving refactors, real corpus saves and a new-session retry with the original settings. Optional logic observations are separate from goal achievement. Preserve existing account drafts when adjusting loadout.
- **Reference**: [frozen contract](design/docs/STAGE_FIVE_CONTRACT.md). Model judgments remain explicitly AI assessments; human rubric calibration is separate from software acceptance.

### 2026-10-01: Deliver Gemini Live with asynchronous teaching control

- **Status**: accepted provider choice and implemented locally; see [implementation and verification](design/docs/STAGE_FOUR_IMPLEMENTATION.md).
- **Decision**: user selected Gemini Live. Use server-owned WebSocket audio/control with a shared Voice/Chat mission; DeepSeek analyzes finalized learner speech asynchronously. A deterministic controller adjusts a subsequent eligible response, with one target, cooldown, evidence and exposure bounds.
- **Data**: preserve immutable Loadout language snapshots, finalized messages and quoted UTF-16 evidence in an owner-scoped CAS document. One-use connection tickets, runtime leases, explicit takeover and end/delete fencing prevent old connections from writing. No app raw-audio archive or invented scores.
- **Provider boundary**: Gemini setup cannot be edited in place; inject private teaching context only at an idle boundary. Text view suppresses playback of native audio. Incomplete playback is marked interrupted and excluded from reconnect history; no exact Gemini audio/text truncation is claimed.
- **Remaining**: manual transcript editing, automatic logic-stage progress, Stage 5 assessment and production/device/cost qualification are separate. This resolves provider selection in D-010; its operating qualification remains open.

### 2026-09-30: Include real-time voice in the first Stage 4 delivery

- **Status**: scope accepted by the user; analysis and design only, not implemented.
- **Decision**: Stage 4 includes continuous listening, automatic turn-taking and interrupting the AI. Keep text input available in the same conversation.
- **Supersedes**: the earlier text-only MVP / voice-later scope and voice-role-play exclusion. This does not change the completed Loadout increment or imply that real-time infrastructure already exists.
- **Design proposal**: combine the Stage 4 prototype's scenario, optional logic and training sidebar with the supplied voice-orb and transcript references. Voice/Chat should share session and media state.
- **Still proposed**: provider, transport adapter details, fields/endpoints, retention settings and measured latency/cost limits. The reference images do not select ElevenLabs as the provider.
- **Reference**: [Stage 4 design and implementation plan](design/docs/STAGE_FOUR_IMPLEMENTATION_PLAN.md).

### 2026-09-30: Implement speaking loadout with bounded language and durable snapshots

- **Status**: accepted and implemented; validation recorded in the linked contract.
- **Decision**: chunks and idioms share five expression slots, structures have three slots, and at least one saved corpus item is required in total. Logic is optional. Use the existing scenario, difficulty and feedback enums. Loadout may be entered without completing Shadow.
- **Draft ownership**: keep versioned browser-local drafts keyed by account, bind a guest draft once on login, and preserve an existing account draft until the learner explicitly adopts the incoming draft. Logout/account switches do not transfer account-bound drafts. This resolves the loadout-draft portion of D-006; history/progress merge remains pending.
- **Persistence**: require verified identity and confirmed account corpus IDs at creation. Validate ownership, kind counts and duplicate IDs on the server. Persist session settings and ordered language snapshots atomically with an owner-bound idempotency key. Later corpus edits/deletions cannot rewrite the session.
- **Scope**: implement the loadout and recoverable session preparation page. Real role-play, turn history, detection and feedback remain planned; no new model invocation or voice integration is included. Preserve pending Shadow saves across client-side route navigation.
- **Reference**: [fields, API and acceptance](design/docs/LOADOUT_IMPLEMENTATION.md).

### 2026-09-29: Analyze browser references on the server and unify the workspace

- **Status**: accepted by the user and implemented.
- **Decision**: browser acquisition and server analysis are separate steps. A captured, source-bound sentence can enter the private reference queue with purpose-specific opt-in; it does not need an operator file-source grant. Reuse independently verified reference ASR/MFA/VAD/F0 prosody for matching learner attempts. Pending references hold the learner queue without consuming retries.
- **Presentation**: Sound/Rhythm contain only Reference / Your voice rows. Melody uses a median-relative pitch scale and a shared word axis, with full linked text beneath the chart. Keep video and shared controls above the layers. Retain the prototype’s Sound phenomenon filter strip, inline word badges, linking arcs and legend; highlight exact occurrences and preserve filters/reveal state across layer changes. Display available rule suggestions as possible readings, learner targets as unevaluated and measured vowel/pause timings separately. Remove duplicate central evidence panels and the score sidebar.
- **Supersedes**: local-only browser alignment as the default and the earlier score/filter workspace. Quick local acoustic previews and registered file adapters remain; no pronunciation detector is implied. See [contract and verification](design/docs/STAGE_TWO_BROWSER_REFERENCE_SERVER.md).

### 2026-09-24: Recover saved analyses independently of future-upload consent

- **Status**: accepted and implemented; local regression acceptance passed.
- **Decision**: the choice to analyze new recordings controls future uploads, not access to existing results. Restore the latest take on initial entry or sentence change, preserve manual selection through history refreshes and late saves, and bind new-take selection to its exact save acknowledgement. Refresh a selected same-ID take when its save version changes.
- **Evidence display**: show available learner-only Sound vowel durations and boundary pauses without a comparison score. For file reference plus local learner audio, identify REF/YOU evidence in every layer and present Melody curves on normalized sentence time without claiming word alignment. Saved, aligned paired results retain their existing comparison contract.
- **Boundary**: no new detector, scoring formula, audio upload permission or automatic reanalysis. Root checks and desktop/mobile browser acceptance passed, including actual local inference on synthetic speech. See [the display increment](design/docs/STAGE_TWO_SOUND_COMPARISON.md).

### 2026-09-23: Compare all three layers without fabricating Sound realization

- **Status**: accepted and implemented as an initial measurement increment.
- **Decision**: use paired Reference / Your recording text rows for a selected saved take. Publish versioned, explicitly experimental resemblance for vowel timing, candidate consonant–vowel boundary pauses, word timing and relative pitch; save coverage and abstention states. Do not publish an overall Sound grade or label forced-alignment phones as actual IPA.
- **Consequence**: `practice-comparison-v2` adds phone durations, boundary timing and assessment to existing result JSONB. Old results remain readable, new recordings are required for new evidence. Reference revocation hides nested assessments as well as reference measurements. Weak-form, flap, elision, assimilation, glottal, Drop-D, H-dropping and voicing classification remain pending validation.
- **Details**: [score definitions and evidence limits](design/docs/STAGE_TWO_SOUND_COMPARISON.md).

### 2026-08-30: Use pnpm workspace and Turborepo

- **Status**: accepted
- **Decision**: use pnpm for workspace dependency management and Turborepo for root task orchestration
- **Reason**: the repository contains multiple JavaScript applications and shared packages with independent build tasks
- **Consequence**: use `pnpm-lock.yaml`; root `pnpm lint`, `pnpm build`, and `pnpm test` are the standard verification commands

### 2026-08-30: Organize by deployable app and shared ownership

- **Status**: accepted
- **Decision**: keep web, API, and extension code in `apps`; keep reusable types, pure logic, UI tokens, and config in `packages`
- **Reason**: each deployable surface has different runtime constraints
- **Consequence**: browser-only logic stays out of shared server-safe packages; FastAPI models remain in the API until contract generation is deliberate

### 2026-08-30: Prioritize the input-to-speaking loop

- **Status**: accepted
- **Decision**: the first release prioritizes YouTube blueprint, corpus save, speaking loadout, role-play, and feedback
- **Reason**: this is the smallest flow that tests Libitu's core value
- **Consequence**: reading and intensive listening remain architectural requirements but can ship after the first complete loop

### 2026-08-30: Keep Stage 1 available without login

- **Status**: accepted
- **Decision**: anonymous learners can view Stage 1 and retain eligible local state
- **Reason**: learners should experience product value before account creation
- **Consequence**: private persistence and account merge need explicit rules; public cache data must remain separate from user-owned records

### 2026-08-30: Keep media processing local

- **Status**: accepted
- **Decision**: YouTube audio, video, and microphone recordings never reach Libitu servers
- **Reason**: this reduces privacy, compliance, storage, and platform-policy risk
- **Consequence**: the extension sends accessible transcript text and derived metadata only; unsupported captions produce an explicit failure state

### 2026-08-30: Exclude spaced repetition from MVP

- **Status**: accepted
- **Decision**: do not build review scheduling or calendar-based revision in the MVP
- **Reason**: first validate whether input language transfers into speaking output
- **Consequence**: corpus filters and speaking reuse take priority over review algorithms

### 2026-08-30: Treat integrations as provider boundaries

- **Status**: accepted
- **Decision**: auth, database, captions, and language-model integrations use narrow adapters or dependencies
- **Reason**: provider choices remain unresolved and should not leak through product code
- **Consequence**: documentation must label likely providers as planned until implementation and tests exist

### 2026-09-01: Start the extension with framework-free Manifest V3

- **Status**: accepted
- **Decision**: implement the first Chrome extension increment with native MV3 files and a manifest validation script instead of a bundled React/Vite app
- **Reason**: the immediate milestone needs a loadable YouTube entry and API handoff, not a complex extension UI stack
- **Consequence**: `apps/extension` can be loaded directly as an unpacked extension; introduce build tooling only when browser UI complexity or shared UI reuse justifies it

### 2026-09-01: Use Supabase Postgres for durable data

- **Status**: accepted
- **Decision**: use Supabase Postgres with repository-owned SQL migrations, RLS on exposed tables, and an unexposed `private` schema for source payloads
- **Reason**: Libitu needs relational ownership, versioned public processing data, enforceable private-user isolation, and a managed path to backups and observability
- **Consequence**: `supabase/migrations` is the schema source of truth; public processing data remains distinct from private learning records; hosted deployment still requires a dedicated Libitu Supabase project

### 2026-09-01: Use Clerk as the identity provider

- **Status**: accepted
- **Decision**: use Clerk for sign-in and session issuance; FastAPI verifies Clerk session JWTs and derives ownership from the `sub` claim
- **Reason**: Clerk supports the Next.js and Chrome extension surfaces while keeping password and session management outside Libitu
- **Consequence**: application user IDs are Clerk IDs stored as `text`; clients cannot choose `user_id`; Supabase RLS policies use `auth.jwt()->>'sub'`; anonymous Stage 1 remains available

### 2026-09-01: Use Upstash Redis only for ephemeral coordination

- **Status**: accepted
- **Decision**: use Upstash Redis for rate limits, short-lived processing locks, idempotency hints, and polling acceleration
- **Reason**: these workloads need low-latency expiry but must not become durable product state
- **Consequence**: Postgres remains authoritative for jobs, blueprints, corpus, sessions, turns, and feedback; every Redis-backed flow must recover after cache loss

### 2026-09-01: Separate corpus extraction from learner-level ranking

- **Status**: accepted
- **Decision**: generate one content-level pool of evidenced corpus candidates, label each candidate with CEFR difficulty and quality scores, and personalize the visible subset when the blueprint is read
- **Reason**: language-model analysis is expensive and cacheable by content, while learner level is private and can change; putting level in the generation job would duplicate analysis and mix user concerns into public processing state
- **Consequence**: the `mvp-v2` analysis contract stores up to 24 candidates; blueprint reads return a limited chunk/structure-balanced set ranked for an optional learner level, and later user-profile integration can pass that level without regenerating content

### 2026-09-02: Keep analysis version and queue recovery server-owned

- **Status**: accepted
- **Decision**: FastAPI selects the active analysis version; clients submit only `content_id`, while job IDs, Redis blueprint keys, and Supabase reads are version-specific
- **Reason**: independently versioned extension and web clients created stale jobs and could read a blueprint generated under a different contract
- **Consequence**: pending jobs are re-enqueued idempotently, obsolete queued versions fail without invoking the model, and changing `ANALYSIS_VERSION` invalidates reads without requiring coordinated browser releases

### 2026-09-02: Fail DeepSeek output by cause and salvage safe formatting variance

- **Status**: accepted
- **Decision**: distinguish provider rejection, timeout, truncation, malformed JSON, and schema errors; normalize only bounded formatting differences that retain transcript evidence
- **Reason**: JSON mode guarantees JSON syntax but not the application schema, and one malformed candidate should not be hidden behind an undiagnosable generic error
- **Consequence**: jobs expose actionable safe error messages, worker logs retain field-level diagnostics without model content, and user-triggered retries receive a larger bounded output budget

### 2026-09-02: Use DeepSeek V4 Flash for the mvp-v3 extraction contract

- **Status**: superseded by the compact `mvp-v4` response contract below
- **Decision**: use `deepseek-v4-flash` for Stage 1 and require a mixed pool targeting 8-16 complete chunks plus 4-8 reusable structures
- **Reason**: Stage 1 benefits from lower latency and cost, while extraction quality depends more on full-transcript evidence, explicit selection constraints, and deterministic validation than on using the Pro tier alone
- **Consequence**: `mvp-v3` invalidates earlier blueprint reads, evaluates up to 2,000 caption fragments, filters low-quality chunks, and renders merged sentence-sized transcript lines with conservative punctuation

### 2026-09-02: Keep complete transcript sentences out of the mvp-v4 response

- **Status**: superseded by local transcript formatting in `mvp-v5`
- **Decision**: continue using `deepseek-v4-flash`, but request only short exact sentence-end text anchors and terminal punctuation alongside 12-20 corpus candidates; reconstruct display sentences from the original caption fragments in the API
- **Reason**: repeating a 20,576-character transcript inside the blueprint JSON caused both the 8K and 12K output attempts to end with `finish_reason=length`, while several generated fields were discarded by the application schema
- **Consequence**: `mvp-v4` invalidates the oversized `mvp-v3` contract, guarantees displayed words come from source captions, can split sentences inside a caption row, validates ordered full-transcript coverage, falls back to local merging for bad anchors, and logs completion-token diagnostics for future truncation analysis

### 2026-09-02: Stream validated analysis previews to Stage 1

- **Status**: accepted
- **Decision**: consume DeepSeek Chat Completions as SSE, parse partial JSON server-side, publish only closed Pydantic-valid preview fields through a job SSE endpoint, and retain polling as the browser fallback
- **Reason**: DeepSeek V4 Flash supports a 1M context and 384K maximum output, but streaming changes perceived latency rather than capacity; users should see the video and trustworthy completed sections while the final blueprint is still generating
- **Consequence**: the main request uses `stream: true`; Stage 1 first renders cumulative locally formatted subtitle batches, then progressively renders summary, logic, chapters, and transcript-evidenced candidates. The final blueprint still requires complete JSON and full validation. Input is not silently truncated, the per-job limit is 240,000 characters, and the semantic-only response has a bounded output retry

### 2026-09-03: Format subtitles locally and keep DeepSeek semantic-only

- **Status**: accepted
- **Decision**: use the English sherpa-onnx online punctuation INT8 model in bounded overlapping windows before DeepSeek, validate that only punctuation and casing changed, and omit subtitle boundaries from the `mvp-v5` DeepSeek response
- **Reason**: sentence-boundary arrays grew with video duration, delayed the first useful UI, and repeatedly caused otherwise valid semantic blueprints to be truncated; subtitle formatting does not require generative reasoning
- **Consequence**: the worker adds a `formatting_transcript` stage, publishes cumulative sentence previews through the existing job SSE stream, feeds the formatted transcript to DeepSeek for better semantic context, and falls back to deterministic pause/length merging when the local model is absent, unsupported, or fails source-word alignment. The sherpa model files are local deployment assets and are never stored in Git
- **Supersedes**: the `mvp-v4` sentence-end anchor contract

### 2026-09-03: Use the maintained extraction prompt and add idioms

- **Status**: accepted
- **Decision**: load the Stage 1 DeepSeek system prompt from a repository-owned text file and make `idiom` a first-class corpus kind alongside `chunk` and `structure`
- **Reason**: idioms have different canonical-text and evidence rules from verbatim chunks, while prompt-owned usage, register, scenario, phonology, and pattern-family fields need explicit schema support instead of being discarded
- **Consequence**: `mvp-v6` invalidates earlier blueprint caches, accepts 16-32 candidates, preserves the expanded learning metadata, reserves read-time result capacity for all available kinds, and extends personal-corpus validation and storage constraints to idioms
- **Supersedes**: the `mvp-v5` two-kind extraction contract

### 2026-09-03: Explain the learner's exact selection before recommending a save unit

- **Status**: accepted
- **Decision**: treat selected transcript text as the primary explanation target, use adjacent subtitles only as semantic evidence, and preserve the selected boundary unless the model identifies an objectively broken edge whose completion is an exact span of the current subtitle
- **Reason**: a learner often selects a short but valid phrase because its contextual meaning is unclear; expanding every short selection into a sentence hides the answer they asked for and produces noisy corpus entries
- **Consequence**: `/api/corpus/analyze-selection` uses the configured DeepSeek adapter, returns context-specific explanation plus a detailed phrase-or-sentence syntax contract, validates model-proposed expansions against subtitle evidence, and labels provider fallbacks instead of fabricating meaning or IPA

### 2026-09-04: Preserve Stage 1 identity through streamed finalization

- **Status**: accepted
- **Decision**: use content-derived corpus UI identities and consistent logic IDs across previews and final results, apply the same learner-level selection policy to previews, and give each page load one abortable lifecycle shared with Retry
- **Reason**: preview-only IDs forced React to remount cards and logic nodes, unranked previews changed abruptly at completion, and ignoring stale callbacks left fetch/SSE/polling work alive
- **Consequence**: finalization updates existing DOM nodes when evidence is unchanged; selected nodes and local saves survive; duplicate previews are suppressed; aborting a load closes its stream and does not trigger fallback polling. Development Strict Mode and progressive rendering remain enabled. Server-side blueprint IDs and analysis versions are unchanged

### 2026-09-04: Use one timestamped logic navigation

- **Status**: accepted
- **Decision**: remove the separate Chapters region from Stage 1 and keep Logic Flow as the content navigation
- **Reason**: chapters identify topics, while logic nodes explain progression and relationships. Current chapters have labels but no source timestamps, so inferred chapter navigation duplicates logic with weaker evidence
- **Consequence**: delete frontend chapter-time inference and UI. Retain the `chapters` field in the current extraction contract and cache documents for compatibility; this change does not trigger paid reprocessing

### 2026-09-04: Persist and merge personal corpus by verified account

- **Status**: accepted
- **Decision**: save guest corpus locally, persist signed-in corpus through authenticated FastAPI to Supabase, and automatically import guest saves into the first signed-in account
- **Reason**: React state does not survive reload, and private learning data must be separated from shared blueprint candidates
- **Consequence**: claim guest records into an account-specific local outbox before upload, acknowledge entries individually, and deduplicate using account plus source/kind/phrase-derived keys. Existing cloud edits win; failures remain retryable without clearing pending data. Account switches abort stale work and cannot claim another account's pending entries. Saved uses actual current-video records and delete icons; other tabs use plus/check states. Speaking drafts, history, and progress merge rules remain pending

### 2026-09-04: Return authentication to the initiating reader URL

- **Status**: accepted
- **Decision**: capture the current browser URL when opening authentication and supply it as the forced redirect for both login and registration, including transfers between them
- **Reason**: Stage 1 context lives in query parameters; returning to the default home URL loses the active source and job
- **Consequence**: preserve the full same-origin browser URL, including query parameters and fragment, using Clerk's modal options. Do not derive the return target from an arbitrary query-string redirect or read browser state during server rendering

### 2026-09-05: Bound long-video output and preserve retry previews

- **Status**: accepted
- **Decision**: version the compact semantic contract as `mvp-v7`, impose word limits on every generated field, start output at 32K with one 64K retry, and merge streamed retry previews monotonically
- **Reason**: a 54,852-character production transcript fit comfortably within model and application input limits, but both locally bounded output attempts truncated after 230.952 seconds of analysis. The 251.5-second job also exceeded the browser's former 210-second deadline, while a provider retry restarted partial JSON from the beginning and temporarily erased visible fields
- **Consequence**: cached `mvp-v6` blueprints remain immutable while new reads resolve `mvp-v7`; long active jobs may remain connected for up to ten minutes. A provider retry can add preview fields but cannot clear prior summary, logic, chapters, or candidates. Explicit browser Retry retains the latest preview. Inputs above 240,000 characters still fail explicitly until split analysis is implemented

### 2026-09-05: Open Stage 1 from two entries before caption and API work

- **Status**: accepted
- **Decision**: use a button in the YouTube player's lower-right control bar and the browser toolbar action as equivalent one-click entries; open Stage 1 immediately after validating lightweight video metadata, and hand browser captions to the web app asynchronously
- **Reason**: caption polling and sequential content/job requests delayed the entire visible experience; placing the entry with the player controls keeps the action attached to the video and removes the mandatory side-panel interaction
- **Consequence**: the control uses the Libitu icon, follows YouTube's control dimensions, and reattaches after player-control redraws. A random ID references a 15-minute browser-session handoff with origin/source checks. Stage 1 owns content/job creation and replaces the temporary URL with durable IDs for refresh and retry. Missing captions use the existing backend fallback; missing videos never launch processing. YouTube SPA navigation invalidates in-flight caption capture, and repeated entry clicks reuse the open Stage 1 tab. The extension has no side panel; unsupported toolbar clicks use the action badge and title. Faster page visibility does not imply faster model completion

### 2026-09-06: Normalize fillers and shared timestamps before analysis

- **Status**: accepted
- **Decision**: after parsing English captions, deterministically remove only standalone `um`, `uh`, `er`, and `ah` tokens, merge caption continuations, and group consecutive formatted lines that share a source timestamp. Use the normalized transcript for punctuation, DeepSeek, Stage 1 display, and corpus evidence validation while retaining the raw caption payload.
- **Reason**: filler-free display text is easier to read, and one downstream transcript keeps generated `source_text` evidence identical to what learners can see and select. Token equality prevents false removals inside words such as `umbrella`.
- **Consequence**: `mvp-v8` invalidates `mvp-v7` blueprint caches. Punctuation alignment preserves all remaining source words, same-timestamp sentences share one playback row, and filler-only inputs fail explicitly instead of reverting to the raw transcript.

### 2026-09-06: Make subtitle punctuation source-aware

- **Status**: accepted
- **Decision**: treat captions with consistent sentence-ending punctuation as authoritative and skip sherpa-onnx. For captions that need punctuation, remove external sentence marks from the model input, reuse the original source words and casing, and apply only normalized model punctuation. Normalize duplicate or conflicting marks and a small set of high-confidence opening discourse markers on every path.
- **Reason**: YouTube can supply either manually punctuated or automatic unpunctuated tracks. Sending both through the same punctuation pass can duplicate marks, accept incorrect model casing, and produce errors such as `ON, the other hand,,`.
- **Consequence**: `mvp-v9` invalidates `mvp-v8` blueprint caches. Reliable source sentence boundaries are preserved, model alignment still rejects changed word sequences, and DeepSeek, evidence validation, and Stage 1 display continue to share the same finalized transcript.

### 2026-09-06: Gate extension launch on verified video language

- **Status**: accepted
- **Decision**: classify the active YouTube video from its own audio/video and caption-track metadata against an explicit supported-language list, initially English (`en`) only. Do not use browser UI language or title text as evidence.
- **Reason**: the current formatter, analysis prompt, and learning experience are English-specific. Rejecting unsupported input before Stage 1 avoids misleading results while keeping the entry ready for additional languages later.
- **Consequence**: the player button is disabled while language is being checked and whenever the language is non-English or unknown, with a hover explanation. The toolbar action applies the same gate and reports failure through its badge/title plus an in-player message. Language detection runs in parallel with lightweight metadata validation, normalized English codes are passed to Stage 1, and captions/API work remain deferred until after launch.

### 2026-09-06: Persist corpus detail and hydrate legacy saves on demand

- **Status**: accepted
- **Decision**: store the complete explanation, syntax analysis, and captured subtitle context with saved corpus items; request and persist this detail only when an existing saved item lacks it
- **Reason**: a summary card is sufficient for scanning but not for later study, while eagerly analyzing every extracted candidate spends model time on language the learner may never inspect or save
- **Consequence**: corpus card bodies open a full detail modal and save/delete icons remain independent actions. Unsaved candidates use a page-session cache and are not added by viewing. New saves carry cached detail into localStorage or Supabase; owner-authenticated legacy hydration uses `POST /api/corpus/{item_id}/analysis-detail`, and the nullable `analysis_detail` JSONB column preserves backward compatibility. Repeated opens are cache hits

### 2026-09-08: Deliver Stage 2 sentence navigation before audio analysis

- **Status**: accepted
- **Decision**: implement Stage 2 Milestone 1 against the existing completed transcript/segment contract. Derive sentence units in the browser, preserve source token ranges, and use versioned source/timing fingerprints for sentence identity. Mark caption-interpolated sentence times as approximate. Keep microphone and reference-media processing in the browser under the existing media boundary.
- **Reason**: sentence switching and controllable playback can be delivered without a new model, audio pipeline, database migration, or an unverified claim that captions provide word alignment. Existing displayed captions may merge rows and remove fillers; their token positions are not raw acoustic token positions.
- **Consequence**: selecting a sentence or playback scope pauses and seeks. One controller owns the active sentence or segment range; loop on/off cannot start paused playback. `seekTo` is paused by default, while Stage 1 timestamp actions explicitly request autoplay to preserve their behavior. Supported speeds come from the player, and the displayed speed follows its actual rate event. The existing URL stores the segment/sentence selection for refresh recovery. Preparation shows real sentence availability; microphone recording and Sound/Rhythm/Melody results are not simulated. General American remains the initial planned phonology target, and LLM output can propose rule candidates only; actual sound realization and any scoring require separately validated acoustic evidence in later milestones.

### 2026-09-09: Share one sentence boundary between Stage 1 and Stage 2

- **Status**: accepted
- **Decision**: use the pinned CPU spaCy `en_core_web_sm` pipeline after punctuation restoration to conservatively merge broken model candidates. Keep one sentence layer, preserve complete long sentences across processing windows, and publish confirmed rows with source token ranges, stable IDs, boundary provenance, and approximate caption-derived times. Stage 2 consumes these rows directly.
- **Reason**: display-length guards and repeated frontend punctuation splitting turned formatting choices into false practice boundaries. A shared source-preserving contract simplifies both stages without an audio upload or another generative-model call.
- **Consequence**: replace 30/35-word forced sentence endings with bounded inference windows and a provisional tail. Preserve emitted SSE prefixes even if a later model window fails. Retain source punctuation conservatively and mark unfinished tails unresolved. Keep `segmentation_version` separate from semantic `analysis_version`; legacy blueprints receive bounded in-process cached derived views, retaining stored semantic results and personal corpus snapshots. Cold legacy reads still incur local processing. Syntax evidence does not guarantee semantic completeness or improve acoustic timing. Deployment requires the pinned Python model package, with explicit local fallback when unavailable.
- **Supersedes**: same-timestamp output grouping in the 2026-09-06 normalization decision and browser-owned sentence boundaries in Stage 2 Milestone 1; other playback/media constraints remain in effect.

### 2026-09-09: Keep Stage 2 recording temporary and tied to one sentence

- **Status**: accepted
- **Decision**: deliver Milestone 2 with the browser's MediaRecorder and explicit microphone permission, keeping one temporary take for the currently selected shared sentence ID. Use supported MIME formats or the browser default, cap each take at 60 seconds, and keep audio in page memory without upload or persistence.
- **Reason**: learners need a complete record/replay loop before acoustic comparison. A single current take gives an explicit resource lifetime and avoids introducing retention, history, or server processing into this milestone.
- **Consequence**: start pauses reference audio and replay; Stop finalizes the recording asynchronously before exposing replay. Re-recording preserves the previous successful take until replacement succeeds. Cancel, permission rejection, or recorder failure must not erase that previous take. Sentence changes invalidate pending permissions and recorder callbacks and remove the old take. Range changes and hidden tabs cancel unfinished capture but retain a completed take for the same sentence. Page exit, Stage 1 navigation, and refresh release all tracks and temporary playback resources. Native YouTube playback events are also guarded during capture; replay and reference playback cannot run together through the app controls. Capability, permission, device, encoding, and replay errors remain visible and recoverable. No sound phenomenon, prosody, or pronunciation quality is inferred from recording success.

### 2026-09-09: Keep Stage 2 acoustic comparison local and descriptive

- **Status**: accepted
- **Decision**: implement Stage 2 Milestone 3 with Chrome tabCapture/offscreen reference recording, Silero V5 on ONNX Runtime Web, and the MIT-licensed Pitchy 4.1.0 release. Fetch pinned model/runtime assets from the app origin; keep both recordings and derived features in transient browser memory. Use no mandatory Whisper or speech API key.
- **Reason**: the embedded YouTube player exposes control and timing but no PCM stream. Capturing the active Stage 2 tab through an explicit extension invocation obtains local reference audio while retaining the existing no-media-upload boundary. A rule-inference LLM does not establish actual sound realization or learner pronunciation quality.
- **Consequence**: require Chrome 116+ and the updated extension for reference capture, with explicit same-tab toolbar invocation and one bounded capture at a time. Validate playback continuity at 1×; trim approximate setup offsets before analysis. Session authorization, cache lifetime and automatic clip capture follow the subsequent practice-session decision below. Local asynchronous workers measure speech span, internal pauses and speaker-relative pitch with separate rhythm/pitch quality gates. Equal normalized positions do not imply word alignment. Do not generate an overall score, identify Sound phenomena, or claim content consistency or validated detector accuracy. First-use model/runtime download is approximately 13 MiB; deploy generated public assets alongside the app. New model versions or cloud services require a deliberate subsequent decision.

### 2026-09-09: Prepare reference audio automatically within one practice session

- **Status**: accepted
- **Decision**: replace per-sentence Capture reference with Enable practice audio and one explicit Chrome toolbar authorization for the current Stage 2 practice. Retain the tab stream and audible monitor between sentences; create a fresh MediaRecorder only while an eligible uncached sentence plays. Use protocol v2 with separate session and clip identities.
- **Reason**: the application should prepare references as part of listening. Requiring a toolbar action for every sentence interrupts practice, while Chrome's initial extension invocation remains necessary. The browser-local media boundary still rules out assuming that the server already owns reference audio.
- **Consequence**: enabling alone never plays or records. Sentence selection reuses the session; source/content/segment changes and document exit close it. Microphone/replay, Pause and hidden tabs cancel only the active clip. No idle audio chunks or PCM accumulate. A 45-second web heartbeat lease and independent 30-minute maximum bound the session; extension worker restart closes the old stream. Up to 20 reference results are cached in page memory, with one analysis worker and at most two queued/active raw clips totaling 12 MiB in the analysis cache. Successful analysis drops raw bytes; failed-analysis retry holds them for at most 60 seconds and may evict them earlier. Cache keys include source, shared sentence ID, bounds and analysis version. Explicit Play retries unusable references, while ordinary loops reuse cached results. Leaving/refreshing clears all references. The microphone still keeps only the current sentence's temporary take. No ingestion-time audio preparation, media upload, new API key or database persistence is introduced.
- **Supersedes**: the initial M3 per-sentence toolbar workflow and reference-feature clearing on every sentence change.

### 2026-09-09: Persist learner practice data and separate licensed reference media

- **Status**: accepted
- **Decision**: permit authenticated server storage of learner recordings, versioned assessment evidence, feedback, progress, level estimates, and recommendation inputs. Treat current cloud analysis, long-term recording retention, and model training or human review as separate purposes and controls; model training and human review are opt-in and off by default. Retain third-party YouTube reference audio on the server only when Libitu has sufficient content and platform rights. Build a separate licensed-content ingestion path from rights-holder-supplied source files and captions.
- **Reason**: longitudinal comparison, cross-device history, level estimation, and recommendation need durable learner evidence. They do not require copying the same reference audio into every user record. A local-only rule blocks useful account features, while local browser capture does not itself grant permission to store or process YouTube media. YouTube permits official embedded playback but its current policies restrict unapproved audiovisual downloading/caching, audio-video separation, scraping, and some derived uses; official caption download requires permission to edit the video.
- **Consequence**: ordinary YouTube practice stores the video/source locator, sentence identity/bounds, permitted metadata, and private learner attempts/results. It uses the official embedded player and does not promote a captured reference clip into durable storage. Licensed sources are ingested once; reference clips/features belong to the content version and user attempts reference them by ID. Private learner audio uses encrypted object storage, verified ownership, bounded signed delivery, purpose and consent records, processor restrictions, retention/deletion jobs, export, and account-deletion handling. Assessments retain task conditions, evidence quality, model/reference versions, and uncertainty; current Silero/Pitchy results cannot determine CEFR. Self-reported and assessed levels stay separate. Deleting optional audio preserves valid derived history where possible. See [YouTube Terms](https://www.youtube.com/static?template=terms), [Developer Policies](https://developers.google.com/youtube/terms/developer-policies), and [caption download authorization](https://developers.google.com/youtube/v3/docs/captions/download).
- **Supersedes**: the permanent product interpretation of “never upload microphone recordings” and “all microphone processing stays local.” It does not change the currently implemented local M2/M3 flow or authorize existing YouTube tab capture for production.

### 2026-09-09: Target overseas markets first

- **Status**: accepted
- **Decision**: treat overseas markets as the provisional first launch scope and defer mainland-China-specific deployment and compliance work.
- **Reason**: the current YouTube-centred product and content strategy are better evaluated against the actual initial overseas markets before adding a separate mainland content, hosting, and regulatory plan.
- **Consequence**: do not claim global compliance. Before launch, select concrete target countries and complete their privacy, consumer, copyright, child-safety, tax, and platform reviews. Use a strong baseline for purpose limitation, access/export/correction/deletion, retention, recommendation controls, processor contracts, security, and international transfers. Mainland launch requires a separate decision and workstream.

### 2026-09-09: Separate Stage 2 Sound suggestions from acoustic detection

- **Status**: accepted
- **Decision**: deliver M4a with the pinned full CMUdict data and conservative deterministic text/phoneme rules for General American. Resolve selected sentence text on the server; return dictionary variants, exact occurrence anchors and conditional candidates. Keep reference/user Sound realization explicitly unevaluated until M4b has alignment and validated detectors.
- **Reason**: existing Silero/Pitchy results have no word or phoneme correspondence. LLM reasoning and dictionary stress cannot prove sentence prominence or actual allophones, and there is no labelled detector evaluation set in the repository. A reproducible rule baseline makes the annotation UI and counterexamples testable without a new paid service.
- **Consequence**: add a read-only sentence Sound endpoint and per-practice guide cache. Vendor the permissively licensed dictionary data with its license, upstream commit and checksum; do not ship the GPL Python wrapper. Unknown and ambiguous dictionary readings abstain from phone-dependent rules. Do not claim a 95% annotation/detector accuracy or turn absent acoustic evidence into incorrect pronunciation. An LLM may later refine rule candidates through a separate versioned, validated text-only adapter; it is not implemented in this increment. User-data persistence and licensed reference ingestion remain subsequent milestones.

### 2026-09-09: Present Stage 2 as three persistent practice layers

- **Status**: accepted
- **Decision**: follow the three-layer prototype's Sound, Rhythm and Melody organization with independently accessible tabs, synchronized left shortcuts, a central canvas and a right-side layer focus. Reuse current dictionary/rule and acoustic results; preserve the existing media controls. The subsequent media-layout decision places them together above the layer workspace.
- **Reason**: the combined Timing & pitch panel obscured Rhythm and Melody as distinct practice goals. Separating the views makes the prototype's learning flow available with the evidence the application already has.
- **Consequence**: keep panels mounted during tab changes and share the existing per-recording analysis and reference cache. Preserve sentence, playback, recording, guide filters, selection and revealed hints; tab keyboard controls use Left/Right, Home and End without invoking media actions. Sound adds dictionary-IPA word cards, conditional badges and Hide text/individual reveal/Reveal all. Rhythm displays timing/pauses and Melody displays relative pitch/range. Prototype example scores, stress labels and detected errors are not copied into live results; word stress, nuclear stress and M4b Sound detectors remain unevaluated. This is a presentation increment with no new model, endpoint, media persistence or API key.

### 2026-09-09: Target file-based reference preparation for smooth Shadow practice

- **Status**: accepted target architecture; implementation is planned, not delivered by this documentation change.
- **Decision**: replace real-time tab capture as the target reference path with authorized media files, versioned sentence assets, and precomputed features. In response to the segment-download discussion, the proposed default checks source/cache availability at content entry and acquires only the selected practice segment plus bounded context when the learner confirms that segment. Whole-video acquisition is not the default; actual partial transfer depends on source/container capabilities.
- **Reason**: reference preparation should not require an extension authorization, a mandatory 1× listening pass, or repeated work for each learner. Segment-first preparation reduces unused acquisition and processing while preserving the existing YouTube entry and basic practice flow.
- **Consequence**: prioritize source feasibility, persistent media jobs/assets, and file-based frontend playback before additional M4b detectors. Keep recording immediately replayable locally and cloud results asynchronous. Reference and learner computations use pinned compatible versions and independent evidence gates. Text-only LLM rule inference remains separate from acoustic observation. Missing source permission or range capability is explicit; no hidden tab-capture or unlimited full-download fallback. Ordinary YouTube sources retain official playback/basic practice when file reference capability is unavailable.
- **Boundary**: rights-holder source files and authorized provider interfaces are preferred. This decision does not grant permission to download arbitrary YouTube media, create infrastructure, or treat file availability as validated pronunciation detection. Microphone permission remains browser-controlled. Long-term user audio and training choices remain separate under the earlier persistence decision.
- **Supersedes**: the browser-only restriction and Enable practice audio/real-time listening requirement as the future production default. The local M3 implementation and its recorded verification remain implementation truth until migration. See [the detailed proposal](design/docs/STAGE_TWO_FILE_REFERENCE_ARCHITECTURE.md) for defaults, open questions and F1–F5 acceptance.

### 2026-09-13: Prefer available source-caption timing before acoustic alignment

- **Status**: accepted and implemented for the caption/basic-practice path.
- **Decision**: prefer a bounded current-video JSON3 caption request in the extension, retain millisecond event and text-segment offsets, and share one source-preserving sentence/word mapping between Stage 1 and Stage 2. JSON3 is a format, not proof of word granularity. Missing/ambiguous offsets retain block/plain-caption fallback; no ASR or forced alignment is a prerequisite for basic listening or caption highlighting.
- **Reason**: the old browser/string path lost subsecond and duration information and then interpolated word positions. Existing provider offsets can improve navigation/highlighting without acquiring reference audio.
- **Consequence**: distinguish provider starts from estimated ends; never interpret a start-to-start delta as measured silence. Unknown ends and estimated intervals over two seconds do not produce continuous word highlighting. Text/word index, video and language checks prevent unrelated timing from being attached. Source display duration cannot extend an estimated sentence across a following event. Source timing is not Sound realization, phoneme alignment or a guaranteed no-clipping boundary.
- **Cache and delivery**: preserve the semantic analysis version. Rich `sentence-v3`/caption fingerprints and an eight-entry derived-view cache permit timing-only updates without another model call; changed spoken text requires its own analysis. Store a versioned YouTube-only JSON envelope in the existing private `source_text` field, never public metadata or signed request URLs. New blueprint documents retain words. Use optional per-connection SSE word deduplication (legacy clients retain full snapshots), gzip for non-SSE JSON and a local word clock with lazy Stage 2 code.
- **Availability UX**: local development Stage 1/2 explicitly label unavailable or partial word timing using the same eligibility checks as actual highlighting. Turning highlighting off and concealing practice text are separate display states, not evidence of missing timing. Notices never trigger fetching/reanalysis, promise recovery, expose concealed words, or gate normal playback.
- **Boundary**: no audio acquisition/upload, token-generation workaround, database migration, or production caption-rights approval is introduced. ASR/alignment and authorized file references remain separate capability-dependent work. Existing pending source/retention decisions still apply.

### 2026-09-13: Recover missing timing without blocking cached practice

- **Status**: accepted
- **Decision**: keep ready-cache rendering independent from a fresh-caption recovery request. For a ready YouTube blueprint without usable word timing, ask the installed extension once per source to read the matching, already open video tab. Send sanitized JSON3 to a dedicated timing-only endpoint; never route recovery through content resolution, job creation or semantic reanalysis.
- **Reason**: a ready `contentId` URL and a reused extension handoff could bypass caption acquisition indefinitely. A video can have genuine JSON3 word offsets while Libitu's old source and blueprint still contain no word timing.
- **Consequence**: require matching video/language and the same normalized spoken sequence in the stored source and blueprint before a timing update. Preserve stored source text, public metadata, semantic documents and personal corpus. Persist the private caption envelope and refresh source caches without changing the analysis version. Missing tabs, unavailable tracks, mismatched words and persistence failures retain the visible cache, with bounded work and explicit retry rather than automatic retry loops.
- **Practice safety**: apply a recovered blueprint only in the paused Stage 1 reader. An active Stage 2 retains its original sentence IDs, bounds, recorder and reference session; show that timing is ready and ask the learner to return to Stage 1 to apply it. No automatic refresh or hidden recording deletion. Source-bound Sound requests must remain compatible with that old sentence snapshot after the timing update.
- **Boundary**: no new media acquisition, ASR, model API charge, database schema, extension permission, production deployment or guarantee of YouTube endpoint availability. The informational timing notice itself still computes local evidence; recovery has a separate lifecycle and status.

### 2026-09-13: Implement the corrected Stage 1 capture flow locally

- **Status**: implemented local increment responding to the supplied flow; cloud acquisition/sharing remains pending.
- **Decision**: use one explicit same-tab extension grant, an offscreen AudioWorklet PCM buffer and verified continuous 1× playback intervals. Keep the session and local reference feature cache above Stage 1/picker/preparing/Shadow branches. Let the learner inspect coverage, visibly prepare missing ranges, and enter practice without waiting for every analysis layer.
- **Reason**: JSON3 starts already support shared sentence positioning, but the supplied HTML incorrectly assumes unprompted capture, service-worker recording, precise word ends, a `--use_word_timestamps` MFA flag, and reusable alignments across different captures. It also equates video time with recording offsets and proposes accelerated silent capture.
- **Consequence**: retain actual PCM-to-video mappings, per-capture identity, bounded data and one media owner. Extract one fully covered continuous run and prefer the latest complete capture when relistening. Preserve local Silero/Pitchy measurements and Sound abstention. No new media upload, server storage, Realtime integration or aligner is included. First-grant UX and rights for cloud/shared media were raised for clarification; while unanswered, only explicit local activation is implemented.
- **Relationship**: changes the current local prototype, not the availability of permission-cleared source files. The file target remains planned and is still required for a flow without tab-capture authorization or real-time capture waits. See [implementation and limits](design/docs/STAGE_ONE_BUFFERED_REFERENCE.md).

### 2026-09-13: Read player subtitle responses instead of rebuilding dynamic requests

- **Status**: accepted; local implementation, live post-change verification pending.
- **Decision**: install a top-frame, `document_start` MAIN observer on YouTube pages, including non-watch SPA entry pages. Passively copy only current-video, English, non-translated JSON3 fetch/XHR responses. Let the original player create request parameters and consume its own response; never synthesize, export, persist or replay signed URLs/tokens.
- **Reason**: a target video's player returned word-timed JSON3 while the independent base-URL fetch lacked parameters present in the player request. The old path also collapsed unrelated acquisition and bridge failures into one unavailable notice.
- **Consequence**: cache sanitized bounded caption tracks in current-page memory with video/language/track and navigation-generation isolation, finite size/concurrency/time/retention limits, and stale-response rejection. Read response clones or independent XHR completion listeners without aborting the player's request. MAIN wrappers are best-effort and must coexist with page/extension wrappers, not freeze platform APIs. A late installation cannot recover historical response bodies; ask for a source-page refresh. No observed request asks the learner to enable English captions, not to wait indefinitely or trigger automatic caption toggling.
- **Delivery**: retain current content/job/handoff and timing-only API contracts, non-blocking cached Stage 1 and deferred Stage 2 application. Errors are safe cause enums, never signed network errors. No new extension permission, audio/ASR pipeline, model invocation, database schema or deployment is introduced; production source authorization remains pending under D-003.
- **Launch timing**: the initial extension click may wait up to six seconds for the observer cache/event, then uses the existing DOM/provider fallback and opens Stage 1. This is a bounded wait for a player-owned response, not a `pot` extraction or subtitle-request replay.
- **Caption control**: before that wait, the extension may best-effort select an advertised English automatic track through visible YouTube controls; if it changes an active user-selected track, it records the selected label and attempts to restore it after the read. If captions were off, the changed captions-off state is restored. Menu changes, trusted-gesture requirements and missing controls remain expected failure modes.
- **Verified implementation detail**: read one immediate page-memory snapshot. A real unpacked-extension fixture with the YouTube source tab in the background exposed throttling of a proposed 200 ms polling loop; removing that wait avoids misclassifying an unobserved response as an injection timeout. Deterministic and isolated-browser checks pass; live target-video verification remains separate.
- **Supersedes**: the independent advertised `baseUrl + fmt=json3` acquisition mechanism, not the shared timing contract or its acoustic limitations.

### 2026-09-13: Establish offline acoustic evidence before detector scoring

- **Status**: accepted; initial tooling and licensed development seed implemented, human annotation and quality evaluation pending.
- **Decision**: keep an offline Pydantic/JSON Schema manifest and result contract with exact audio/text identity, independent reference/learner records, separate rule candidates and human annotations, per-sample quality/content/alignment gates, and explicit measurement/detection/abstention states. Use public speech with verified source licenses for the first local seed, not Glossika content without project-specific permission.
- **Reason**: a continuous signal or forced alignment does not prove a realized phenomenon, a rule score is not a calibrated probability, and synthetic regression tests cannot validate real-speaker accuracy.
- **Consequence**: bootstrap with 16 adult clips from CMU ARCTIC and SpeechOcean762, all development-only and unpaired, with hashes/attribution and pending annotations. Keep raw media in ignored local cache. Train/dev/test cannot share speakers, source groups, source records or identical audio; missing predictions remain in coverage denominators. Only adjudicated human annotations enter human metrics. Confidence requires recorded calibration provenance, while empty/small/development/synthetic reports never approve product release. A separate 256-recording plan is not completed collection. Drop-D is an Elision subtype; no cross-phenomenon total score is generated.
- **Boundary**: no model training, acoustic inference, online API/media persistence, new provider or F1–F5 completion. This independent baseline work can proceed alongside the accepted file-reference delivery order. See [benchmark scope](design/docs/STAGE_TWO_ACOUSTIC_BENCHMARK.md).

### 2026-09-19: Require login at Shadow entry and persist learner attempts

- **Status**: accepted and implemented for basic records and optional recording retention.
- **Decision**: keep Stage 1/segment selection anonymous; require sign-in when the learner clicks Start shadowing and on direct Shadow URLs. Preserve the same-origin source/segment/sentence URL for both login and registration. Mount recording only for a loaded signed-in identity and request microphone permission only on Record.
- **Persistence**: automatically save each completed take's source snapshot and browser-reported conditions through owner-verified FastAPI. Offer an off-by-default checkbox to retain new recordings privately until deletion, with versioned consent captured at recording start. This does not enable training/human review or cloud acoustic analysis. Authenticated history supports playback and separate audio/record deletion.
- **Reliability**: use immutable account-bound attempt IDs, a private bucket and bounded uploads; retries do not duplicate records. A page-level outbox continues across sentence/stage navigation, surfaces failures and warns before unload. Pending data is not durable offline and is released on account change. Tombstones prevent deleted attempts/audio from being resurrected by late retries; scheduled reconciliation and production retention/account closure remain follow-ups.
- **Delivery order**: basic attempt/recording persistence and this login gate proceed now on the existing source path, before F1–F3 completion. File acquisition and server assessment remain planned.
- **Supersedes**: anonymous entry into the Shadow recording workspace and the permanent interpretation of the earlier M2/M3 temporary-learner-audio rule. Anonymous Stage 1 and local reference-media boundaries remain in place. See [contract](design/docs/STAGE_TWO_PERSISTENCE.md).

### 2026-09-22: Execute the revised server reference pipeline

- User confirmed the acoustic pipeline review and authorized implementation of its A–D reference foundation.
- Keep shared sentence identity; source permission and media availability remain independent of caption availability and learner recording retention.
- Use operator-managed file/hash grants, private normalized reference assets, existing Clerk identity and a durable PostgreSQL queue with fenced worker writes. PostgreSQL polling avoids adding a second queue write; SSE carries committed results and status queries recover interruptions.
- Default references expire within 30 days or earlier grant expiry; unfinished uploads expire after one day. Keep grant/analysis cache identities private by account, with no cross-user sharing in this increment.
- Preserve measured data, rule candidates and independently verified observations as separate concepts. No inferred actual IPA, uncalibrated confidence or pronunciation scoring. User cloud comparison remains stage E.
- Implementation and known operational limits: [server reference pipeline](design/docs/STAGE_TWO_SERVER_REFERENCE.md).

### 2026-09-22: Anchor Rhythm marks to text without inventing acoustic stress

- **Status**: accepted implementation of the requested Rhythm display update.
- **Decision**: use three sizes of solid amber dots, dark to light for dictionary primary/secondary/unstressed syllables, including single-syllable words; retain unknown marks for conflicting/missing patterns. The user's follow-up removes gray/hollow dots and the redundant speech/pause chart. Pause rows use the prototype's compact REF label, phrase blocks, thin vertical bars and durations. Label this as word stress, not observed sentence emphasis. Place detected ≥200 ms pauses between phrases only when the reference timing supports a unique adjacent-word boundary.
- **Consequence**: convert segment-relative alignment to sentence time; local caption positions remain approximate. Estimated word ends never establish silence. Unmapped reference pauses and all learner pauses remain timed entries without guessed text positions or correctness colors. Share Sound's dictionary request/cache; no new classifier, upload or score.


### 2026-09-22: Analyze learner recordings asynchronously under a separate purpose

- **Status**: accepted and implemented following the user's request to deliver asynchronous learner analysis, content/word alignment and saved Rhythm/Melody comparisons.
- **Decision**: remember an account/browser analysis choice separately from optional playback retention. Upload only completed consented takes, use durable PostgreSQL jobs, and keep temporary inputs for completion/review cleanup or a maximum 24-hour retry window subject to worker availability. Retain derived results until user deletion; no training/human review.
- **Evidence**: independent local small.en ASR receives no expected-text hint; exact normalized content matching gates MFA. Compare only independently measured compatible reference/learner words. Weak recognition, mismatches and unavailable references remain explicit. Durations, pauses and relative pitch are descriptions, not observed stress or pronunciation grades.
- **Reliability**: immutable attempt/input/reference identities, owner-scoped private storage, lease fencing, parent deletion triggers and retryable cleanup. Pending browser uploads remain page-local; server jobs survive navigation and refresh after upload acknowledgement.
- **Boundary**: no new paid speech API key, arbitrary YouTube media upload, acoustic detector accuracy claim, production deployment or automatic level/recommendation model. Production operations and human evaluation remain pending. See [implementation](design/docs/STAGE_TWO_PRACTICE_ANALYSIS.md).
- **Supersedes**: earlier status statements that all cloud learner analysis remains planned; their historical validation scope is unchanged.

### 2026-09-26: Align browser-captured reference audio on the learner's device

- **Status**: accepted and implemented; functional verification recorded in `TASK.MD`, independent accuracy evaluation remains pending.
- **Decision**: connect the already captured reference PCM to a browser-local acoustic word/phoneme aligner. Do not require server file-source registration for local reference measurements or source-compatible word-by-word display. Keep source-processing grants distinct from Chrome tab-capture permission.
- **Data flow**: use the same bounded clip for Silero/Pitchy and phoneme alignment, retain capture/source/text/model identity, release raw bytes after completion, and keep results only in the page cache. Fetch dictionary targets and pinned static model assets without sending reference audio or alignment results to a server.
- **Evidence**: forced alignment locates dictionary targets under the expected caption text; it is not independent ASR or observed phoneme recognition. Display local boundaries and measurements with this provenance. Pair with a saved learner result only for an exact compatible word sequence and verified learner alignment. Do not reuse server scores for the new local reference or infer realized speech phenomena from target labels.
- **Supersedes**: wording that three-layer comparison inherently requires file-based original audio. Registered files remain a condition of the current server reference ingestion path, not of local alignment/display. Existing learner upload consent and source rights boundaries are unchanged.
- **Reference**: [browser-local alignment](design/docs/STAGE_TWO_LOCAL_ALIGNMENT.md).

## Pending decisions

| ID | Decision | Needed before | Required evidence |
|---|---|---|---|
| D-003 | Approved YouTube caption/metadata acquisition and retention path | Production YouTube launch | YouTube approval or documented API/rightsholder route, retention limits, takedown behavior |
| D-004 | Language-model provider and output contract | Real processing milestone | Structured output, latency, cost, data policy |
| D-005 | API contract sharing method | Web integration milestone | OpenAPI generation versus maintained TypeScript contracts |
| D-006 | Remaining anonymous history/progress merge rules (corpus and loadout drafts accepted above) | Speaking/history milestones | Progress conflicts, consent, retention |
| D-007 | Exact learner recording, transcript, assessment, log, and backup retention schedules | Production practice persistence | Target-country review, user research, deletion behavior, operating cost |
| D-008 | Initial overseas launch countries and regional infrastructure | Production launch | Market priority, content availability, privacy/consumer rules, latency and cost |
| D-009 | First authorized file source and scope of full YouTube reference support | File-reference F1 and production coverage commitment | Available source files/API, content and platform rights, tested partial-transfer behavior and costs |
| D-010 | Stage 4 operating qualification; Gemini provider selected and implemented | Production release | Complete post-interruption live turns, device/network latency, account budgets, cost and provider retention settings |

### 2026-09-09: Keep Stage 2 media actions together above analysis

- **Status**: accepted
- **Decision**: place video, playback, reference-audio setup and microphone recording in one shared operation area above Sound/Rhythm/Melody. Use video and playback on the left and reference setup/recording on the right on desktop; stack them in the same order on mobile.
- **Reason**: the learner repeatedly listens and records while watching the source; these actions need to remain close to the video rather than separated by the analysis panels.
- **Consequence**: change layout and document order only. Keep one player, recorder and reference-capture session mounted across layer switches; preserve all existing media safeguards and analysis state.

## Decision entry template

```markdown
### YYYY-MM-DD: Decision title

- **Status**: proposed, accepted, superseded, or rejected
- **Decision**: one concrete choice
- **Reason**: evidence and tradeoff that led to the choice
- **Consequence**: code, data, product, and operational effects
- **Supersedes**: optional earlier decision
```


2026-09-30 layer guidance correction: restore the right-side Layer focus, Feedback and Tip cards for Sound, Rhythm and Melody. Sound guidance follows the selected phenomenon and uses the current sentence’s rule suggestions; conceal mode also hides word-specific sidebar text. Desktop places guidance beside the layer canvas; narrow screens place it below. The video remains above the workspace. Removing the experimental score sidebar did not authorize removing instructional guidance; no illustrative scores or detected-error claims are restored.


### 2026-10-08: Show progressive reader loading placeholders

- **Status**: accepted and implemented.
- **Decision**: render a lightweight route fallback and decorative skeletons only for empty loading regions; existing status messages own progress and errors.
- **Consequence**: no artificial completion percentages, minimum delay, extra requests, player remounts or extension preflight changes. Disable animation for reduced motion. Pre-response navigation latency remains outside this UI change.

### 2026-10-14: Prepare reference before new analyzed takes

- **Status**: accepted and implemented.
- **Decision**: server-analyzed recording requires uploaded reference audio for the selected source and sentence; reference analysis may still be queued or processing. Guide preparation next to Record and retain explicit microphone activation. Local-only recording with server analysis off remains supported.
- **Reason**: avoid saving new analyzed takes without a reference while allowing reference and learner word checking to overlap.
- **Consequence**: freeze reference identity at recording start; reject unavailable/expired/mismatched references in both button and keyboard entry. Existing acquisition/consent/storage behavior stays intact. The user withdrew historical one-time binding/resume, requested direct cleanup of old unbound takes, and requested no new deletion button. The withdrawn migration was never applied.


### 2026-10-14: Separate reference upload and analysis feedback

- **Status**: accepted and implemented for status presentation.
- **Decision**: uploaded audio with incomplete analysis must state that audio is present, explain the selected sentence's content/alignment failure and offer an analysis retry without new-upload copy. Keep queued/processing, Ready, deleted/expired and unuploaded states distinct.
- **Boundary**: no acquisition, recording gate, server content check, migration or deployment change. Tolerant reference matching and partial word comparisons remain proposed pending implementation authorization.


### 2026-10-14: Reduce duplicate audio transport and MFA setup

- **Status**: user-authorized and implemented.
- **Decision**: receive learner bytes once when both analysis and recording retention are selected, validate both immutable registrations before writing, queue analysis first, then retain the same bytes. Keep separate private objects and consent/deletion lifecycles. A retention retry may finish after analysis input cleanup without restarting analysis.
- **Local handoff**: API and worker share a configured private directory when colocated. Scope entries by purpose, account, task and audio digest; verify bytes on read. Local files expire after 30 minutes, are bounded to 256 MiB and participate in deletion/cleanup. Cloud persistence still precedes durable job acknowledgment; another host or cache miss downloads the durable input. This is a cache, not a second queue.
- **MFA**: cache compiled lexicons by pinned engine/model/dictionary identity; allow concurrent readers and exclusively lock initialization/repair. Keep input audio, acoustic model extraction and result files task-local. Reuse hash/version checks until file metadata changes. Do not alter acoustic outputs, source acquisition, learner ASR or 60/85 thresholds. Full persistent MFA/ASR model servers remain separate future work.

### 2026-10-14: Distinguish reference lookup from upload

- **Status**: implemented status correction.
- **Decision**: read-only recovery on sentence entry displays “Checking reference…”, including when captured audio is queued behind that lookup. Only actual encoding/upload work displays “Uploading reference audio…”. Do not offer missing-reference preparation in the recording guide until lookup settles. Keep acquisition, queued-upload protection and recording gates unchanged.

### 2026-10-14: Align reference audio directly to source transcripts

- **Status**: accepted by the user and implemented.
- **Decision**: remove secondary ASR from browser and registered-file reference analysis, including uncached file fallback. Use the immutable source transcript for MFA; keep audio quality, identity, interval ordering/bounds, word duration (25–3000 ms) and phone coverage checks. Do not equate forced alignment with independently recognized content or observed pronunciation realization.
- **Evidence**: use `source_transcript` separately from legacy ASR `matched`; empty recognized transcript and explicit provenance reason. Learner ASR and exact 60/85 word gates remain unchanged.
- **Caching**: use a reference-only policy version (`reference-source-transcript-v2`) plus measurement engine/model identity. New reference cache keys no longer depend on learner ASR. Latest-capture restoration excludes outdated reference policies/engines. Read historical verified results as such; do not rewrite existing takes/results or silently bind another reference.
- **Boundary**: no capture/acquisition, consent/retention or schema change. Reference processing still depends on MFA and acoustic quality, not a promise that all captions are correct. This supersedes the proposed Reference 60/85 tolerance scheme and the earlier reference exact-ASR prerequisite.


2026-10-15 Reference retry repair: preparing the same browser capture after deletion/expiry now allocates a new deterministic generation; active generations remain idempotent and historical rows/take bindings are never revived. HTTP 410 during upload/status/retry clears stale readiness and stops polling, allowing explicit preparation again. MFA version probes use isolated temporary runtime directories, cache only exact successful version checks and distinguish process startup failures from version mismatches. The UI distinguishes alignment-service outages, timeouts and alignment failures from caption timing/coverage failures. Reference still uses source-transcript MFA with quality checks; acquisition and learner ASR/60–85 gates are unchanged.


2026-10-15: check MFA version at process startup before either acoustic worker accepts queue work, not in engine.align. Fail startup clearly without consuming or failing individual jobs. Keep model integrity and audio/alignment quality checks, learner ASR/60–85 rules and cache identity unchanged. The runtime is provisioned for the worker lifetime; replacing it requires worker restart. This supersedes lazy per-alignment version probing.


2026-10-15: user requested one default-on Server analysis setting for Reference and new recordings, replacing the two independent opt-in preferences. Keep recording retention separate/default off. Use a new versioned per-account browser preference; old absent keys cannot distinguish never configured from off, so legacy keys do not determine the new default. Off controls future work, not deletion/cancellation of already submitted tasks or access to historical results. Capture, microphone and playback permissions remain unchanged.


2026-10-15 Sound presentation: restore the supplied screenshot’s text-first default appearance. All shows candidate phonology marks/linking arcs without per-word acoustic measurement clutter, even after analysis completes. Vowel len. explicitly shows retained vowel durations; Linking shows measured boundary pauses. Keep the existing wrapping typography, IPA reveal, Reference/Your voice rows, guidance sidebar, tab state badges, Rhythm/Melody and server analysis/gates unchanged. This is a presentation adjustment, not a rollback of analysis or a fabricated pending state.


2026-10-15: learner acoustic analysis now runs independently of pending Reference analysis after the unchanged 60/85 word gate. Save the learner checkpoint before waiting; resume final comparison without downloading, decoding, ASR or MFA again. Queue claiming permits missing learner checkpoints even after ASR succeeds, including lease recovery. The hosted `parallel_learner_acoustics` migration updates the claim predicate only; owner, expiry, lease and service-role boundaries remain intact.

Learner workers preload one isolated resident `small.en` process before claiming jobs. Reuse the existing CPU/int8/two-thread model, English/beam-5/temperature-0 settings and reliability thresholds. Requests are serialized per worker, timeout at 180 seconds, and kill/reap the child on failure; the next request rebuilds it. Reference still uses source-transcript MFA; acquisition and audio/alignment quality rules are unchanged. Extra workers each retain their own model memory; parallelism requires both workers and sufficient CPU/RAM, and cold MFA lexicon initialization may still serialize.

## 2026-10-16 independent acoustic workers

Implemented: separate `stage_two_worker --lane fast|fine` processes, started together by `pnpm dev`. Fast handles learner ASR/word gates and server F0/energy/CWT for Takes and References; fine handles MFA and final comparisons. A service-only PostgreSQL lane claim and fenced handoff (`20261016111833_acoustic_worker_lanes`) preserve checkpoints, reset the downstream retry budget and invalidate the fast lease atomically. Each lane prioritizes eligible Takes over References. Fast startup preloads ASR without probing MFA; fine alone verifies MFA. Old combined entrypoints/claim RPCs reject use. Original audio acquisition, quality checks, recognition settings and 60%/85% thresholds are unchanged.

Local macOS scheduling: fine runs at nice 10 with native library threads capped at one; a separate supervisor pauses/resumes the MFA process group when the fast lane holds a shared activity lock. Parent heartbeats continue, locks release on crashes, and the supervisor reaps MFA if its owning worker exits. Active MFA timeout excludes pauses with a bounded additional 900 seconds of wall time. Empty queue polling does not pause MFA. Both workers must share the scheduler directory/account. This prioritizes first results and may extend fine completion under load; it is not hard CPU affinity. Optional disjoint Linux CPU sets and systemd templates are provided but not validated on a cloud host. No production worker deployment is implied.

Validation and timing: see [local lane comparison](design/benchmarks/worker-lanes-20261016/README.md). The local benchmark separates controlled CPU/queue timing from real hosted-storage/local-worker polling; browser paint and target-cloud timings are not inferred from either. Existing previews remain visible through fine processing/failure; no frontend redesign or new matching classes.

## 2026-10-17: consolidate submission and coarse publication

Use one multipart request for analysis-enabled Takes, retaining the original UUID/idempotency hash and frozen source snapshot. Keep the old endpoints for compatibility and record-only saves. A service-only transaction registers the profile, Take and analysis together. Upload to durable object storage before a second fenced transaction queues work; the TTL/evictable local cache is not a durable queue authority. Return a Take acknowledgment rather than rebuilding an AnalysisView during submission.

Keep word-check publication separate so learners can see the first result immediately. Combine subsequent raw features, coarse signal and fine-lane handoff in one transaction; a failed handoff rolls back its checkpoint. Retention consent remains the independent `attempt.recording` field, and a retention-only retry must not reset or restore cleaned analysis inputs. No threshold/model/acquisition changes accompany this optimization.

## 2026-10-17: one statement snapshot for analysis polling

Replace serial Take/analysis/Reference reads with a stable security-invoker RPC, callable only by service_role. Scope by the authenticated owner and omit deleted parents; join the Reference owner and source visibility in the same statement. Keep live operator file-grant validation in Python because those grants are local configuration. Do not cache authorization or reuse a snapshot across polls.

Return a bounded projection of current-sentence Reference coarse evidence rather than all segment frames. Reuse the existing result/layer formatter and response schema. This changes read latency, not recording, matching tiers, audio acquisition, worker computation or retention consent. A deletion/source change committed before the next query is observed by that query; the HTTP response already in flight is not claimed to be retractable.


## 2026-10-17 optional Reference for learner analysis

Reference preparation is optional. With server analysis enabled, a learner may record immediately without uploaded Reference audio; the Take freezes a null Reference identity and follows the existing word check, fast signal checkpoint, and fine learner alignment pipeline. It completes with learner measurements and no comparison score, without waiting for Reference. The unchanged below-60%, 60–<85% Sound-only, and >=85% all-layer gates still apply. Existing eligible References can be bound at recording start and use the paired flow. Active original-audio capture still blocks simultaneous microphone recording.

The UI describes optional Reference comparison and promotes completed learner-only fine results beyond the preliminary badge. Learner-only CWT tables omit the empty Reference column and determine uncertainty from learner evidence; absence of a comparison alone does not invalidate that evidence. Reference acquisition, quality checks, server-analysis preference and independent history-retention switch are unchanged. A Reference prepared after a null-reference Take is not retroactively attached in this increment. Existing backend nullable Reference support and worker completion are reused; no schema migration is required.

2026-10-17 UI cleanup: remove the duplicate optional-Reference card above sentence practice. Reference preparation, status and retry remain in the existing upper Reference panel; sentence practice leads directly with the sentence and recording controls. Learner-only analysis and consent/retention settings are unchanged.

2026-10-17 presentation change: hide preliminary Rhythm/Melody curves and Preview badges in sentence practice. Word feedback remains immediate; eligible layers show a brief pending state until fine evidence is available. Failed/cancelled fine work shows unavailable rather than coarse fallback. Completed learner measurements remain viewable without a valid Reference. Fine layer presentation, background checkpoints, 60/85 gates, original acquisition and retention are unchanged. Earlier first-curve benchmarks describe the previous preview UI, not the current time to visible final layers.


### 2026-10-17 Reference loading presentation cleanup

Remove the duplicate yellow preparation progress bar and amber preparation/analysis backgrounds in Shadow; keep the video playback progress indicator. Restore existing sentence References silently without a visible Checking state or analysis spinner. While availability is unresolved, show neutral Reference copy (or the existing extension-off/setup controls), then show the actual resolved status. Directory practice progress reports learner Takes and best word matches, not Reference availability; retain the cached background lookup and upload deduplication. Audio acquisition, recording availability and analysis gates are unchanged.

2026-10-17 Enable setup follow-up: show the setup spinner only during the extension handshake. Once armed and waiting for a toolbar click, stop the spinner, show “Click Libitu in Chrome’s toolbar”, and retain the setup instructions and Cancel action. The extension protocol, authorization and audio acquisition remain unchanged.

2026-11-06 Shadow history compatibility: if subtitle regeneration changed a sentence ID, recover only a unique whitespace-normalized exact match to the recorded sentence text. Ambiguous or missing matches open the segment picker. Canonical navigation drops the recovery text.

2026-11-06 Corpus selection: Select all filtered results includes every matching record, including unloaded pages. Deselect filtered results removes only matching selections; hidden selections remain. Disable selection while search results are settling or corpus operations are pending. Existing delete confirmation and Stage 1 Saved synchronization apply.

2026-11-06 Corpus Loadout limit: the selection tray states a maximum of five total items including existing selections. More than five currently selected items disables Add to Loadout with an associated explanation; batch deletion stays unrestricted. Existing atomic merge validation still rejects a combined selection over five without truncation.


## 2026-11-09 — Proposed IPA / Sound acoustic architecture

Status: technical proposal, not a released implementation. Prefer the pinned Wav2Vec2Phoneme encoder as the initial baseline; evaluate a structured surface-phone CTC head, source-profile auxiliary supervision, masked attribute heads and localized event heads. Retain WavLM variants as event-task challengers rather than assuming IPA ranking transfers. Keep Glossika source notation in raw data and display, while separating acoustic units, prosody, boundaries and event evidence. Do not require the user to annotate more data; use professional labeled corpora and independently qualified event review when needed. Never relabel automatic predictions as human corrections. Full detail and gates: `design/docs/SOUND_IPA_ACOUSTIC_MODEL_IMPLEMENTATION_PLAN.md`.
