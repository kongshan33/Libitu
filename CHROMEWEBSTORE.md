# Chrome Web Store — Libitu

Last updated: 2026-11-06 (Asia/Shanghai). Manifest version: 0.2.0; protocol: v4; minimum Chrome: 116.

**Status: draft, not submitted and not ready for public distribution.** Publisher name, public contact email and production domain are **待定**, as specified by the owner. This document describes the current working tree, including the new alarms permission, handoff cleanup and sized icons. No store registration, agreement acceptance, payment or publication has been performed.

## Store listing draft

- Name: **Libitu** (matches manifest).
- Single purpose: Help learners turn supported English YouTube videos into caption-based English speaking practice in Libitu.
- Primary language: English.
- Proposed category: Education, if available in the current dashboard; otherwise select the closest available category with the publisher. Not yet selected.
- Proposed short description: **Open supported English YouTube videos in Libitu to study useful phrases and practice speaking.**
- Current manifest description: “Collect useful phrases from any YouTube video, practice saying them, and use them in realistic AI conversations.” **Revise before submission:** “any YouTube video” overstates language/caption coverage. The proposed description above is narrower; this preparation task has not changed product copy.

Detailed description draft (store-facing copy):

> Turn supported English YouTube videos into speaking practice with Libitu.
>
> Open a video using the Libitu button in the player or Chrome toolbar. Libitu checks the video's language and uses available captions to open the learning workspace, where you can study useful phrases and practice selected sentences.
>
> For reference audio, first enable practice audio in the Libitu workspace, then click Libitu in Chrome's toolbar on that same tab. You can stop the connection from the toolbar or workspace. Reference audio availability depends on the source and browser; ads and other sounds in the tab may also be captured.
>
> English videos only. Caption availability varies. Reference audio capture requires Chrome 116 or later and an explicit toolbar action. The current development build requires Libitu running locally; a public service URL is not yet configured.
>
> The extension transfers captions and selected reference audio to the Libitu web app. Web server analysis can upload reference clips when enabled; it is a separate setting from enabling browser audio capture. Please review the privacy notice and your analysis settings before use.
>
> Support contact: 待定. This draft must be completed before publication.

## Permissions justification

These descriptions account for every current manifest permission. They are implementation evidence, not proof that every permission is minimal under every supported Chrome version. Re-test permission reductions before packaging.

| Permission | Type | Purpose / evidence |
|---|---|---|
| `activeTab` | permissions | Supports the explicit toolbar invocation used to authorize access to the selected practice tab; does not authorize automatic/background capture. See `apps/extension/src/buffer-capture.js`, `onToolbarClick`. |
| `scripting` | permissions | Reads current video language and sanitized observed captions in YouTube's page context; recovers an ordinary missing entry content script. No arbitrary user-supplied code or remote script execution. See `background.js`. |
| `storage` | permissions | Stores temporary caption handoffs, content-tab mappings and capture ownership metadata in `chrome.storage.session`. Raw PCM is not persisted there. |
| `alarms` | permissions | Runs a one-minute expired-caption handoff sweep even after the worker has slept; startup/access also clean expired records. No unrelated scheduling. |
| `tabs` | permissions | Queries matching already-open YouTube tabs for timing recovery, reads tab URLs and reuses the matching Libitu tab. It does not collect full browsing history. Review whether existing host permissions cover all metadata needs before final release. |
| `tabCapture` | permissions | Obtains audio from the explicitly authorized Libitu practice tab for selected-sentence reference playback/analysis. Does not capture microphone, screen video or other tabs. |
| `offscreen` | permissions | Hosts the audio stream, audio processing and bounded in-memory reference buffer outside a popup, while preserving audible playback. |
| `webNavigation` | permissions | Verifies current top-frame URL/document identity and releases capture on full-document navigation, preventing stale pages from owning audio. |
| `https://www.youtube.com/*` | host_permissions | Installs the early passive caption observer and player entry across YouTube SPA navigation; reads current supported video metadata/captions. Broad paths are needed for home-to-watch navigation. |
| `http://localhost:3000/*` | host_permissions | Current Libitu web origin: import caption handoff and document-bound practice-audio bridge. Development-only destination, not a production site. |
| `http://localhost:8000/*` | host_permissions | Reads public `/api/content/{id}/identity` metadata to verify the video/content association; request omits credentials and times out after three seconds. Development-only API. |

Remote code declaration draft: **No** for the extension package. Its scripts/worklet are bundled. Caption JSON and public identity JSON are data, not executable code. The separately hosted Libitu web app is a distinct surface and must have its own accurate service disclosures.

## Data flows and retention

| Data | Flow / use | Retention and deletion |
|---|---|---|
| Current video ID, URL, title, detected language | YouTube page → extension → Libitu import URL. The title/source URL/language are URL parameters; subtitle text is not. Browser/web-server URL logging and browser history are outside the extension handoff TTL. | Handoff metadata shares the 15-minute record TTL. A content-tab mapping stores content/video/document IDs until tab closure or browser session reset; it is not a transcript. |
| Observed caption JSON3 | A MAIN-world observer passively copies the player's already-requested eligible English, untranslated JSON3. It does not reconstruct signed requests or generate tokens. Safe text/timing fields cross to the extension. | Page-memory cache: 15 minutes, up to four entries, 2 MiB per response and 4 MiB total; source navigation clears stale state. Browser scheduling can delay physical cleanup. |
| Caption handoff | Sanitized caption track and/or DOM transcript → session storage → same-origin import bridge → web content/analysis flow. Signed subtitle URLs/credentials are not included. | 15-minute read TTL; cleanup on access/startup/one-minute alarm, and import-tab close. Up to 16 records and 4 MiB UTF-8 serialized keys/values; oldest evicted first. Closing the source before import creation cancels the pending handoff; afterwards it preserves delivery. Sleep can delay deletion, but expired reads fail closed. |
| Timing recovery | Web asks for matching captions; worker verifies content identity and looks only for an already-open matching YouTube tab. | Uses bounded page cache/request state; no new video tab or playback is started by this recovery path. |
| Playback telemetry and capture ownership | Web → isolated bridge → worker/offscreen, including content/video/document/session IDs, playback time/rate/state and bounded extraction requests. Used to enforce ownership and decide which audio spans are eligible. | Live capture metadata in memory; minimal ownership in session storage for cleanup. Worker restart clears orphan media. No extension analytics endpoint found. |
| Reference audio | Explicit same-tab toolbar action → real tab audio stream → offscreen mono PCM buffer → selected WAV/base64 → verified Libitu document. Extension does not itself upload these bytes. Other audio in that same tab, including ads, is not automatically separated. | Buffer bounded to 64 MiB / ten minutes. Session: 45-second heartbeat lease and 30-minute maximum. Disable, full document/content change, tab close or worker recovery clears media. Hidden/ineligible playback stops retaining new samples. Same-content Reader/segments/Shadow navigation preserves the connection. |
| Extracted audio | A covered interval of up to 60 seconds is encoded as WAV and delivered to Web. Four pending extractions, 512 request IDs per session; maximum WAV 24 MiB. | The extension does not keep an audio archive. Web-side pending uploads/caches and server storage have independent lifetimes. Closing the tab cannot delete audio already uploaded. |
| Web/server reference analysis | Web's Server analysis preference gates reference upload through authenticated `/api/references/captures` and reference audio endpoints. **The preference defaults on unless explicitly set off** in current code; do not describe it as default-off consent. | Server reference records receive a 30-day expiry; expired/deleted references are denied and cleanup runs separately. Earlier deletion is available through the reference deletion API/UI. Do not promise instant physical deletion from backups or all operational caches. |
| Downstream caption analysis | Web/API processing may persist content/blueprints and send caption text to configured text-analysis services (repository default Ark/Doubao). | Not covered by the extension's 15-minute deletion promise. Production provider, persistence, backup and deletion policies need confirmation before publishing a complete service privacy policy. |

Owning evidence: `apps/extension/src/{background,youtube-caption-observer,content-identity,buffer-capture,buffer-offscreen,buffer-pcm}.js`; `apps/web/features/stage-two/persistence/PracticePersistence.tsx`; `apps/web/features/stage-two/server-reference/{capture-uploads,api}.ts`; `apps/api/app/services/reference_service.py`; `design/docs/STAGE_TWO_BROWSER_REFERENCE_SERVER.md`.

## Privacy / dashboard disclosure worksheet

**Do not select “no data handled.”** The extension handles selected browsing context, website content and tab audio even though it has no direct audio-upload endpoint. Production disclosure must cover the integrated web/server flow too.

| Dashboard category | Current evidence / proposed disclosure |
|---|---|
| Website content | Yes: video metadata, captions, text/timing and explicitly authorized tab reference audio. Web can send text/audio onward for analysis. |
| Web history / browsing context | Selected YouTube source URLs and matching open-tab URLs are read. No general history API or persistent whole-browser history collector. Disclose URL handling; do not claim “never reads browsing data.” |
| User activity | Playback timing/state and explicit launch/capture actions are processed to provide the feature; no separate extension analytics upload found. |
| Personally identifiable / authentication info | Extension identity request omits credentials; no extension login/token store. The web app has authenticated accounts and server ownership. Integrated service disclosure is still required. |
| Personal communications / health / financial / location | No dedicated collector found in extension code. Captured tab content is not semantically filtered; avoid a blanket guarantee that arbitrary captions/audio can never contain personal information. |

Operator certifications (not submitted; owner must confirm actual operations):

- [ ] Data is not sold to third parties.
- [ ] Data is used only for the disclosed core functionality.
- [ ] Data is not used to determine creditworthiness or for lending.

## Privacy notice draft

This is reviewable text, **not a published privacy policy**. Publisher/contact/production processing details must be completed before use.

Libitu processes the selected YouTube video's URL, title, language and available captions to open speaking practice. It reads matching open tabs to reconnect to the selected source. Caption text is transferred to the Libitu web app, where content analysis and persistence may take place.

Reference audio is captured only after enabling practice audio and invoking Libitu from Chrome's toolbar on the same practice tab. The extension buffers tab audio locally and sends requested sentence clips to that Libitu page. It does not record your microphone. Sounds elsewhere inside the captured tab may also be included.

The web app's Server analysis setting is separate from browser capture authorization and currently defaults on unless disabled. When enabled, reference clips may be uploaded to Libitu's authenticated API and private storage for analysis. Disabling future analysis does not delete already-submitted clips. Server reference records expire after 30 days or can be deleted earlier; service cleanup and backup schedules require separate disclosure. Learner microphone recordings and account services belong to the web app and have separate controls.

Caption handoffs expire after 15 minutes and are cleaned periodically and on relevant tab closure. Browser sleep can delay cleanup. Audio buffers are bounded and released on disable, full page/content change, tab closure, worker recovery or session expiry. Removing/reloading the extension does not delete data already sent to the web service, browser history or external systems.

The extension package contains no third-party analytics client, cloud-sync storage or direct audio-upload API. This does not imply the integrated web service has no third-party processors: the production operator must list the deployed authentication, storage and text-analysis services and their policies before publication.

Publisher: 待定. Privacy contact: 待定. Public policy URL: 待定. Policy changes must be reflected here and in the store disclosures before the corresponding release.

## Assets, distribution and publisher

| Item | Status |
|---|---|
| 16/32/48/128 PNG icons | Present: `apps/extension/icons/icon-{size}.png`; manifest/action use sized files. |
| Store screenshot, 1280×800 or 640×400 | Pending. Synthetic test pages are not representative product screenshots. |
| Promotional images | Pending / optional. |
| Clean release ZIP | Pending; current build validates source, it does not package a release. |
| Publisher / public email / production domain | 待定 (owner response). |
| Public privacy-policy URL / support URL | 待定; do not use localhost. |
| Visibility / regions / pricing | Not selected. |

## Browser acceptance and release gates

See [acceptance report](design/docs/extension-release/ACCEPTANCE.md) for commands, scope and evidence.

- [x] Real unpacked Chrome: English-gated entry, SPA navigation, caption handoff and canonical tab reuse with fixtures.
- [x] Real unpacked Chrome: v4 bridge, original import sender URL, same-content navigation, old-version rejection, reload cleanup, rearm/close without capture.
- [x] **Real toolbar → tabCapture → non-silent PCM/WAV extraction:** passed on native retry in Chrome for Testing 147.0.7727.15. WAV: 0.4 seconds, RMS 0.106066; same-content retention and full reload release passed. Uses a synthetic test tone and identity fixture, not live YouTube or production qualification. Earlier shortcut/UI failures remain historical evidence.
- [ ] Live YouTube DOM/caption coverage and real-source capture rights/behavior.
- [ ] Production HTTPS origins configured consistently across manifest and bridges.
- [ ] Permission-minimization check, accurate final short description, clean ZIP, screenshots, public privacy/support contacts.
- [ ] Production provider/retention/deletion disclosures and operator certifications.

## Version / review history

| Version | Date | Changes | Status |
|---|---|---|---|
| 0.2.0 | 2026-11-06 | Existing v4 local extension; working tree adds retry/retention fixes, invalidation handling and sized icons. | Draft, no submission |

No review/rejection correspondence is recorded here. Publication must wait for the unchecked gates; the current evidence is not store approval.

Official reference checked: [Chrome Web Store privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy) (single purpose, permission justification, remote-code declaration and disclosure consistency).
