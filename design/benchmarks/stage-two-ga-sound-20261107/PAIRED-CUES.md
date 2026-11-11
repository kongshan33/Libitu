# Sound paired rows and word-width masks — 2026-11-07

The user's follow-up browser comment supersedes the single Reading cues flow in the html-2 prototype. Detailed now renders Reference reading cues and Your voice practice targets. Review uses corresponding Ref cues / Your targets lanes. Both are explicitly text/dictionary candidates; neither claims acoustic realization detection. The shared filter counts are not doubled.

Concealed Detailed words retain their native text width through an invisible, inaccessible inner text span. Their reveal buttons remain keyboard-accessible and retain the existing minimum touch size. Revealing either row reveals that word in both rows. IPA, candidate badges, linking controls, explanations and accessible labels stay concealed until their required words are revealed. Linking explanations appear directly below the selected voice row; the lower `‿` glyph and conditional Vowel length semantics are unchanged.

## Actual sentence findings

The user-selected saved take (2026-11-02 20:56:09, 19.7 seconds) shows 85.7% word match and no retained playback audio. Rhythm reports Reference unavailable and displays learner timing. The header's Reference audio ready status describes the current source, not reference analysis stored with this historical take. The old single Sound row was a shared text-rule cue flow, not a reference-only or learner-only audio result. The restored two rows do not fill this missing historical evidence or borrow another take's analysis.

## Verification

- Root `pnpm lint`: passed.
- Root `pnpm build`: passed (includes TypeScript validation).
- Root `pnpm test`: passed: API 1,996; Web 540; Extension 124.
- Updated the three existing browser regression scripts for paired rows, voice-specific arc labels, and native-width concealment; all pass Node syntax checks. These browser scripts were not rerun in this follow-up.
- Actual authenticated sentence: inspected single-row state and Rhythm's unavailable reference evidence, then observed both Reference / Your voice rows and their explicit evidence copy after the change.
- Final desktop and 390px mobile visual acceptance remains pending. Local development restart was initially interrupted by a blueprint-worker DNS failure; the web and API server were subsequently started separately. The browser connection then became unavailable; Chrome fallback also timed out. No final screenshot or mobile pass is claimed. Earlier acceptance reports cover earlier code only.

The change does not reanalyse recordings, overwrite take history, validate pronunciation detectors, deploy, or change scoring. Local implementation is complete; final responsive browser acceptance is outstanding.
