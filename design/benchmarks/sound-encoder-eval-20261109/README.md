# Sound encoder evaluation — first infrastructure and annotation batch

Implemented locally on 2026-11-09. The four real checkpoints are downloaded,
SHA-verified and running through one frozen-encoder interface. All four have
cached the same 49 training clips and 12 development clips. **No quality winner,
new trained head, test prediction or event detector is claimed.**

Listening page: **http://127.0.0.1:8773/**. The page contains 36 new recordings,
114.29 seconds in total, with full audio, padded target playback and blank
recording-specific IPA fields. It never includes model predictions or previous
human answers. The official user pack has no QA annotations.

## What is complete

- Pinned Wav2Vec2Phoneme, WavLM Base+, WavLM Large and HuBERT Large adapters;
  strict tensor loading, evaluation mode, zero trainable encoder parameters.
- Five layer positions at 0/25/50/75/100% depth: 0/3/6/9/12 for Base+ and
  0/6/12/18/24 for the three large checkpoints. This is a bounded first sweep,
  not an exhaustive search of every hidden layer.
- Shared, **freshly initialized linear CTC heads** with a frozen 111-entry
  alphabet (blank plus NFD characters from the pre-existing vocabulary and
  training labels). No pretrained Wav2Vec2 output rows are copied. Head sizes
  are 85,359 parameters for Base+ and 113,775 for the large encoders; input
  dimensions differ, while structure, targets and optimization budget match.
- Real-audio preflight on three training clips × four models × five layer
  positions: finite CTC losses and head gradients, unchanged head parameters,
  zero optimizer steps. Binary event-head gradients also pass, using synthetic
  fixture labels **only for an engineering check**.
- CTC training/development-selection command: fixed 40 epochs, 3 seeds,
  identical settings. Development IPA selects a layer; test answers are
  partitioned out before training/selection validation. Nothing is trained by
  the extraction or preflight commands.
- Character, surface-segment and base-segment edit diagnostics; aligned-mark
  precision/recall/F1; fixed-threshold event precision/recall/F1 and average
  precision; angular-DTW ABX with matched contexts and explicit within/across
  speaker conditions. Empty triplets or one-class event samples produce
  unavailable results, never a perfect score.
- A sealed IPA test-release command requires all four saved development
  selections, the expected seeds, checkpoint hashes and reviewed test statuses.
  Once frozen, the normal training command rejects more tuning in that
  experiment. Test scoring uses the frozen head/layer selections.
- Model-blind listening UI with server autosave, immutable historical versions,
  atomic latest snapshot, stale-tab conflict rejection, browser backup, actual
  JSON download, copyable fallback and identity-checked import.

## Data separation

| Partition | Audio rows | Speakers/source | Purpose |
|---|---:|---|---|
| Train | 49 | Previously reviewed Glossika track, 46.73 s | IPA probe training |
| Development | 12 | CMU Arctic BDL and SLT, new sentences | Layer/threshold selection after annotation |
| Reserved test | 24 | CMU Arctic CLB and RMS, new sentences | Evaluation after selection is frozen |

Each development subtype has 4 recordings; each test subtype has 8. These are
**candidate-context counts**, not positive/negative label counts. The three
subtypes remain word-internal /t,d/ tap, /t,d/+j coalescence, and /n/ place
assimilation before bilabial/velar consonants. The two speakers within each
partition read the same prompts to support context-controlled comparisons;
there is no prompt overlap across partitions.

The builder excludes normalized text from the earlier public seed, second-round
recordings and all 588 exposed book entries, and checks prior PCM hashes.
Speaker IDs, sentence groups, recording groups and PCM cannot cross partitions.
See [selection](ANNOTATION-SELECTION.json), [source lock](sources.lock.json),
[exposure input hashes](EXPOSURE-INPUTS.json) and [dataset audit](DATASET-SUMMARY.json).

Boundaries on this independence claim:

- CLB/RMS are held out from our previous project experiments. Upstream model
  pretraining overlap is unknown; this is not a guarantee of globally unseen
  audio. There are only two test speakers in this initial batch.
- Glossika speaker identity remains unverified. The entire source collection
  stays in training; disjoint corpus IDs do not prove real-world speaker identity.
- This is another first-person annotation round on new samples, not a second
  independent annotator or adjudicated gold. Uncertain cases stay uncertain.
- RMS `.lab` and Festival `.utt` files use different silence segmentation and
  timing. Playback crops require exact correspondence of all non-silence phone
  names, then use the `.lab` times. Other sources pass the original exact
  cross-check. Neither pathway creates verified phonetic boundaries.

## What the annotator should do

1. Enter a name/code and listen to the full recording and target excerpt.
2. Choose present, absent, uncertain or not applicable **at the highlighted
   target**, then check audio clarity and correct the actual sentence text.
3. Expand the target-time section and check the suggested word/phrase range.
   Correct it if needed. This is an event-analysis window, not a closure or
   single-phone duration measurement.
4. For IPA evaluation, transcribe and confirm the **whole actual utterance**.
   Target-only IPA is optional and never substituted for whole-sentence labels.
   Missing/uncertain IPA may be saved without being treated as a gold target.
5. Fine phone symbol/context/timing is optional in this pass. Strict ABX still
   needs these human-verified intervals and enough valid contrast triplets;
   ordinary phenomenon judgments alone do not satisfy that requirement.

Changes save to `.cache/sound-pilot/encoder-benchmark-v1/reviews/`. `latest.json`
contains a revision envelope; `/api/export` downloads the contained draft.
If the user reports completion, read and validate this local draft; exporting
is a backup, not the only way to recover the work. Never use the separate
`encoder-review-qa` annotations as real evidence.

## IPA and event evaluation limits

The CTC head emits NFD characters to retain marks. Character error is explicitly
separate from the surface-segment edit diagnostic. The versioned segment parser
groups combining marks and modifiers, joins explicitly tied affricates, and
leaves untied vowel sequences as separate segments. It does not silently map
book conventions such as `ʴ`, `ʱ` or `d̪` to a different sound. Prosody is excluded
from segment metrics; raw transcription is retained. These conventions must be
considered when interpreting scores rather than calling `1 − CER` accuracy.

New held-out symbols never expand the alphabet after testing; their errors
remain visible. Wav2Vec2Phoneme's encoder has already received phonetic task
supervision while the other three checkpoints are self-supervised backbones.
This experiment compares available **checkpoints**, not architecture in isolation.

The 49 training rows currently lack approved localized event-training examples
for all three subtypes. Event metric functions and a common binary-head
preflight exist, but supervised event-head training, threshold selection and
event test scoring remain pending. Do not repurpose development/test judgments
as training labels. Add a separate training batch when coverage is known.

ABX uses actual feature frame centers, with a 320-sample stride and 400-sample
receptive field for these configurations. A phone window containing no frame
centers is flagged rather than claiming millisecond precision. Matched-context
positive/negative coverage is not guaranteed by this first batch. Test ABX uses
the already frozen IPA-selected layer; no test-driven ABX layer search occurs.

## Actual execution evidence

| Encoder | Train + development clips | Retained layer width | Feature inference time |
|---|---:|---:|---:|
| Wav2Vec2Phoneme | 61 | 1,024 | 33.39 s |
| WavLM Base+ | 61 | 768 | 12.93 s |
| WavLM Large | 61 | 1,024 | 37.77 s |
| HuBERT Large | 61 | 1,024 | 44.21 s |

Each processed 78.33 seconds of the same audio; test feature count is zero.
Times are a single FP32 CPU pass with two PyTorch threads, excluding model load,
while other local work ran. They are operational observations, not a controlled
speed benchmark. Runtime: Intel macOS, Python 3.11.14, PyTorch 2.2.2,
Transformers 4.41.2. Existing isolated pilot dependencies were reused; no online
API dependency was changed. All 196 model/training-row combinations also pass shared-alphabet coverage,
surface parsing and CTC minimum-frame checks with no optimizer steps. See
[label preflight](LABEL-PREFLIGHT.json), [feature evidence](FEATURE-SUMMARY.json),
[preflight](PREFLIGHT.json), [protocol](protocol.json) and [annotation readiness](READINESS.json).

A separate temporary synthetic fixture also exercised 15 CTC training trials,
checkpoint saving/reloading and development-only selection, asserting that test
answers were discarded. Those fixture weights were deleted with the temporary
directory; no real-corpus optimizer step was taken in this increment. See
[trainer fixture](TRAINER-FIXTURE.json).

Validation: root `pnpm lint`, `pnpm build`, `pnpm test` pass (2,123 API tests in
that run; web/extension results reused from cache). The final focused encoder
suite passes all 26 tests, including sealed-release coverage. Browser QA uses a separate local copy:
1400px desktop and 390px emulation, real playback progression, disk autosave,
reload recovery, actual downloaded JSON, re-import and keyboard navigation.
The corrected 390px page has `scrollWidth == innerWidth == 390`; navigation
buttons are 173 × 48px. No physical-phone or independent listening accuracy
acceptance is claimed. Screenshots are under `output/playwright/sound-encoder/`.

## Reproduce

From `apps/api`, using the existing dedicated environment:

```sh
../../.cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.encoder_models all
../../.cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.encoder_benchmark preflight
../../.cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.encoder_benchmark extract
../../.cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.encoder_review --port 8773
../../.cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.encoder_evaluate readiness
```

The builder `encoder_dataset` refuses to overwrite an existing review site.
For a rebuild, use a new empty `--root` and compare identities; never replace
the user's review directory. Source audio and models live only in ignored caches.

After annotation, export a draft JSON and use a new output directory per model:

```sh
../../.cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.encoder_benchmark train-ctc \
  --model wavlm-base-plus --labels /absolute/path/to/sound-encoder-review.json \
  --out ../../.cache/sound-pilot/encoder-benchmark-v1/experiments/wavlm-base-plus
```

Repeat for `wav2vec2-phoneme`, `wavlm-large` and `hubert-large`. Then:

```sh
../../.cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.encoder_evaluate freeze \
  --labels /absolute/path/to/sound-encoder-review.json \
  --experiments ../../.cache/sound-pilot/encoder-benchmark-v1/experiments
../../.cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.encoder_evaluate score
```

These later training/scoring steps have not been run. A failed coverage gate
must remain visible; it is not a reason to move held-out examples into training.

Primary references: [Wav2Vec2Phoneme card](https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft),
[WavLM Base+](https://huggingface.co/microsoft/wavlm-base-plus),
[WavLM Large](https://huggingface.co/microsoft/wavlm-large),
[HuBERT Large](https://huggingface.co/facebook/hubert-large-ll60k),
[SUPERB methodology](https://arxiv.org/abs/2105.01051),
[ZeroSpeech ABX metrics](https://zerospeech.com/tasks/task_1/metrics/).
