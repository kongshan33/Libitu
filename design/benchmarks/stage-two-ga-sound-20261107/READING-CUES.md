# Sound Reading cues v3 acceptance

> Superseded in row layout and concealment by the later [paired-row follow-up](PAIRED-CUES.md). The results below describe the earlier single-flow version.

Date: 2026-11-07. This supersedes the Sound presentation in REPORT.md and STYLE.md; those files retain the earlier delivery evidence.

## Reference and user overrides

The visual reference is `design/prototypes/Stage 2 · Detailed (three-layer analysis)-html-2/Shadow.dc.html`, together with `design/docs/libitu_设计规范_v2_1_统一版_.md`. The user's latest message overrides two conflicting prototype details:

- Every Linking control uses the filter's lower `‿` arc. It is a native button, separate from the word button. Mouse, touch and Enter activate the exact boundary explanation below the reading block/timeline; activating it again closes it. `aria-controls` and `aria-expanded` connect the trigger and card.
- Vowel length is a conditional learning cue about relative vowel length before final voiceless/voiced consonants. It no longer displays saved milliseconds, duration bars or pace-adjusted comparisons, and does not require a reference recording.

## Implemented result

Detailed has one natural-width Reading cues flow, without duplicate Reference/Your voice candidate streams. Detailed and Review share the solid soft-color badges, actual sound changes, four filter groups / 12 categories plus All, category dots/counts, Elision subfilters, empty states and explanation content. Candidate counts deduplicate alternative realizations; they are not counts of observed audio events. Only Elision exposes subtype chips in this design; other subtype metadata remains available in explanations.

All typography uses the shared Inter UI font, including IPA, badges and metadata. Candidate badges no longer use dashed borders or question marks. The explanatory card has seven semantic description-list rows; 130px labels on desktop become a single column on mobile. Interactive targets are at least 44px on mobile/coarse pointers. Hidden text also conceals source-specific cues, counts, boundary labels, explanations, matching text and directory copy.

Derived guides now use `sound-rules-v3`. Vowel candidates require every dictionary reading to agree on a primary-stressed vowel immediately before one final obstruent. The rule distinguishes `before_voiceless` / `before_voiced`, anchors the dictionary vowel and explains relative `shorter` / `longer` under similar stress, rate and phrase position. It abstains for unknown or relevant ambiguous readings, unstressed vowels, open syllables, sonorant endings and complex codas. This is deliberately bounded coverage, not general pronunciation detection.

V1/V2 guides remain readable. Their fields and saved acoustic `vowel_length` assessments are never upgraded into V3 length candidates. Existing saved per-vowel/word-total adapters and historical recording evidence remain intact. There is no new upload, provider call, microphone permission, score or saved-record rewrite.

Linguistic scope was checked against [Coretta's primary research review of the voicing effect](https://stefanocoretta.github.io/phd-thesis/s-ve.html) and the [UCL Wells phonetics lecture on pre-fortis clipping](https://www.phon.ucl.ac.uk/home/wells/p201-3-lecture-new.pdf). The rule's restricted dictionary coverage is an implementation choice; it does not claim that every GA context behaves identically or that voicing must persist throughout a final consonant.

## Verification

- Root `pnpm lint`, `pnpm build`, `pnpm test`: see `reading-cues-evidence.json` for final outcomes. Unit counts: API 1,996, Web 540, Extension 124. The existing Starlette TestClient deprecation warning remains.
- API Sound suite: 143 passing tests, including 28 new vowel-rule cases. Positive pairs cover bit/bid, beat/bead, cap/cab, back/bag, safe/save, face/phase, rich/ridge and final-stressed about/indeed. Negative cases cover unknown, ambiguous, unstressed, open and complex-coda words. Tests also distinguish final phones from final letters and following words.
- Web rules/contract tests cover versioned validation, v1/v2 preservation, candidate-count deduplication and rejection of saved timing as a source of reading cues. Historical adapter tests remain in place.
- `ga-sound.browser.mjs`: Chrome at 1400px and 390px touch emulation; Detailed/Review, same lower glyph, two distinct linking boundaries, keyboard/toggle behavior, seven-row explanations, shorter/longer cues, no-reference and partial-match takes, filter resets, hidden text with Notes expanded, stable media/request activity, shared filter typography, minimum zoom/Fit and no page overflow.
- `ga-sound-density.browser.mjs`: 390px Detailed/Review; two visible events plus +2, with all four synthetic density events reachable by keyboard. Added cues are explicitly layout fixtures, not linguistic examples.
- `analysis-timeline.browser.mjs`: 1192px and 390px; shared badge styles, IPA focus, Notes, long-sentence wrapping, recording action geometry, settings position, Rhythm/Melody curves, shared selection, take isolation, voice toggles, zoom and drag. Legacy synthetic v1 cues remain supported.

## Screenshots

- [Desktop filters and Reading cues](reading-cues-detailed-all-1400.png)
- [Desktop linking explanation](reading-cues-detailed-linking-1400.png)
- [Mobile filters and Reading cues](reading-cues-detailed-all-390.png)
- [Mobile vowel-length explanation](reading-cues-detailed-vowel-390.png)
- [Review linking explanation on mobile](reading-cues-review-linking-390.png)

## Evidence limits

Browser checks use local fixture APIs, synthetic saved timing and actual dictionary/rule candidates. They validate rendering, source identity and interaction behavior; they do not establish real microphone quality, physical-phone behavior, acoustic realization detection, teaching effectiveness or production deployment. No external account records were changed.
