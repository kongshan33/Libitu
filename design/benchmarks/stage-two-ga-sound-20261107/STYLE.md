# Sound prototype styling

Historical delivery record. The user’s later html-2 / v2.1 request supersedes candidate styling and Vowel duration semantics; see [current Reading cues acceptance](READING-CUES.md).

Date: 2026-11-07. Visual reference: `design/prototypes/Stage 2 · Detailed (three-layer analysis)-html-1/Shadow.dc.html`. This follows the user's later request to change appearance while preserving the delivered GA content and logic.

## Changes

Production changes are limited to `SoundComparison.module.css`, `SoundExplorer.module.css` and `SoundCue.module.css`:

- Replace the 126px desktop / 116px mobile word cards with content-sized words and compact cue rows. Keep 19px sentence text, 44px mobile word targets, and the existing two-event / +N display.
- Move the existing linking arc visually between words, orient it like the prototype, and reserve its complete width in the word group. Preserve its dashed evidence and learner question mark.
- Use plain uppercase group labels, soft filter pills, small monospaced badges and secondary annotations. Retain the current neutral tokens and existing phenomenon colors.
- Remove inactive filter-context sizing and empty subtype-height reservations. The selected content remains visible; changing filter can naturally reflow the sentence while retaining word identity and order.
- Give reading details the prototype's soft surface and rounded spacing. Preserve focus indicators, reduced-motion handling and mobile control sizes.

No production TypeScript, API, taxonomy, rule, copy, state handler, saved evidence, scoring or media logic changed in this styling follow-up. The GA browser test replaces its former fixed-coordinate assertion with content-width, containment, stable word-order and restored-content checks; it also accepts a separate screenshot output folder.

## Verification

- Root `pnpm lint`, `pnpm build` and `pnpm test` passed. Web: 537 tests; API: 1,968 and Extension: 124, with the latter two test tasks replayed from Turbo cache.
- `ga-sound.browser.mjs` passed at 1400px and 390px with mobile touch emulation: filters/subtypes, candidate styling, word flow, keyboard details, concealed words/spans/notes, individual vowels, pace adjustment, minimum Review zoom/Fit, take switching, learner-only and partial matches, and no filtering-related media/analysis side effects.
- `analysis-timeline.browser.mjs` passed at 1400px and 390px, including the prototype's 27-word sentence, shared Detailed/Review cues, Notes, IPA, Rhythm/Melody, pauses, selection and history controls.
- `ga-sound-density.browser.mjs` passed for Detailed and Review at 390px: two visible events, +2, all four explanations reachable by keyboard.
- An extra narrow-screen check identified hidden IPA tooltips extending outside their words at 320px. The tooltip is now constrained to its word width and wraps, with complete dictionary IPA still available in the existing detail view.
- After that fix, all 13 controls passed overflow checks at 320px, 390px, 768px and 1400px; every reference word's focused IPA remained inside the viewport. See [responsive results](style-responsive-results.json).

The browser uses the existing synthetic account/audio fixture and actual GA dictionary/rule output. This verifies presentation and interaction, not physical-device behavior, microphone quality or acoustic-classification accuracy. Nothing was deployed.

## Screenshots

- [Desktop Sound](style-desktop.png)
- [Mobile filters](style-mobile-filters.png)
- [Mobile word comparison](style-mobile-words.png)
- [Mobile expanded reading](style-mobile-readings.png)
- [GA browser results](style-results.json)

Local complete artifacts and additional responsive-check output are under `output/playwright/sound-style/`. Reproduce with the existing Next server on port 3000 and `node apps/web/tests/helpers/quick-browser-fixture.mjs` on port 3011:

```sh
LIBITU_SCREENSHOT_DIR=output/playwright/sound-style/ga node apps/web/tests/ga-sound.browser.mjs
LIBITU_TEST_WIDTHS=1400,390 LIBITU_SCREENSHOT_DIR=output/playwright/sound-style node apps/web/tests/analysis-timeline.browser.mjs
node apps/web/tests/ga-sound-density.browser.mjs
```

Set `LIBITU_PLAYWRIGHT_MODULE` to an installed Playwright module when it is not available through normal module resolution.
