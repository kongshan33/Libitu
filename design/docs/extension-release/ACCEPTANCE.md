# Extension release acceptance — 2026-11-06

## Result

**Native toolbar → tabCapture → non-silent PCM/WAV extraction and reload cleanup passed on retry.** This is a real Chrome capture of a synthetic test tone, not live YouTube or production qualification. No store upload or production deployment occurred. Publisher name, public email and domain are pending at the owner's request. See [store preparation](../../../CHROMEWEBSTORE.md).

Environment: macOS, Node 22.15.0, Playwright 1.61.1, Chrome for Testing 147.0.7727.15, isolated temporary profiles. Test content/identity responses are fixtures; extension loading, isolated bridges, document IDs and Chrome APIs are real. No microphone, paid model or real YouTube media was used.

| Check | Result | Evidence |
|---|---|---|
| Extension unit tests | 124/124 passed | `output/playwright/extension-release/unit.log` |
| Extension lint/build | Passed; manifest validates 14 referenced files | Terminal validation; existing validator is not a complete store package validator |
| `entry.browser.mjs` | Passed | `entry.log`: English-only gate, home/watch SPA entry, v4 handoff, canonical tab reuse, mobile fixture |
| `fresh-captions.browser.mjs` | Passed | `fresh-captions.log`: 5/5 and 3/3 timedtext/player requests; zero forbidden extra requests, zero real media requests |
| `workspace-v4.browser.mjs` without capture | Passed | `workspace.log`: import sender URL, verified arm, same-content paths, old protocols rejected, reload release, cold rearm/close |
| Capture via automated shortcut | **Not passed** | `shortcut-capture.log`: available → armed; no enabled event; 12-second timeout before PCM extraction |
| Earlier capture via native toolbar | Initially blocked; superseded by successful retry | Computer-control app selection timed out twice (30s/20s), then inventory timed out (15s). No toolbar click was issued; one prepared run expired after 28s and a gated setup attempt ended without its start signal. `capture.log` contains the gated setup failure, not a successful recording. |

Raw logs are local ignored artifacts, not the durable release record. [evidence.json](evidence.json) retains compact results and source SHA-256 hashes. The no-capture workspace suite was rerun after the harness corrections and passed; it explicitly reports action “not exercised” and clip null. Audio success comes only from the separate native capture run.

## Successful native retry

`output/playwright/extension-release/native-retry.log` records a passing run (exit 0) with native clicks on Enable audio and Chrome's Extensions menu → Libitu. Chrome displayed the tab-sharing indicator and delivered enabled/coverage events. The harness extracted and decoded a real WAV: **duration 0.4 seconds, RMS 0.10606619392750118**. Same-content paths retained ownership; full reload left zero offscreen documents and no active capture. Cold rearm and close also passed. No capture permission or PCM response was mocked.

Two fixture timing defects were corrected without changing production extension code: enabled is checked as an observed event rather than the last event (coverage can follow immediately), and extraction waits for a single continuous coverage range of at least 0.6 seconds before requesting its interior 0.4 seconds. The previous byte-count-only wait could request future, uncovered audio and correctly receive missing. Missing/error extraction results now fail immediately rather than waiting for a success timeout. Manual mode also waits for the native Enable audio click before arming, preserving the production 30-second authorization lease.

## Reproduction

From repository root, using the existing local runtime (override these paths on another machine):

```sh
export LIBITU_PLAYWRIGHT_MODULE=/Users/river/.npm/_npx/e41f203b7505f1fb/node_modules/playwright
export LIBITU_CHROMIUM_PATH='/Users/river/Library/Caches/ms-playwright/chromium-1217/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
node apps/extension/tests/entry.browser.mjs
node apps/extension/tests/fresh-captions.browser.mjs
node apps/extension/tests/workspace-v4.browser.mjs
```

## Native-toolbar capture acceptance

The harness now supports a manual action mode that leaves the temporary manifest's commands unchanged and does **not** synthesize the toolbar callback or grant. It still loads a temporary copy of the current source, uses synthetic identity metadata and plays a generated oscillator. It cannot establish live YouTube correctness or production permissions.

```sh
LIBITU_V4_CAPTURE=1 LIBITU_V4_HEADFUL=1 LIBITU_V4_MANUAL_ACTION=1 \
  node apps/extension/tests/workspace-v4.browser.mjs
```

1. In the isolated Chrome for Testing window, click **Enable audio** when `READY_FOR_NATIVE_ENABLE_CLICK` is printed (within two minutes). The harness then prepares the session and prints `READY_FOR_NATIVE_TOOLBAR_CLICK`.
2. Within 28 seconds, open Chrome's Extensions menu in **that test window** and click **Libitu** on the `v4 workspace fixture` tab (or click its pinned action). The arm lease is 30 seconds; rerun after a timeout. Do not use the personal Chrome profile.
3. Success requires the script to report a real Chrome action, a non-null clip, WAV duration between 0.39 and 0.41 seconds and RMS above 0.01. It then checks same-content retention and full reload cleanup: zero offscreen documents and no active captured tab. Arming alone is not a pass.
4. Save the result and browser version, then update this report only if all assertions pass. If capture fails, keep the failure/event log and do not disable Chrome's permission protections or mock `getMediaStreamId`/PCM to obtain a pass.

The test uses a 440 Hz oscillator rather than third-party content; it records no microphone. Its temporary profile and extension copy are removed by the normal cleanup path. A public release also requires live-source checks, documented content/platform rights, production origins and a final privacy disclosure review.
