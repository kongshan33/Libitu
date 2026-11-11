# Five-recording IPA listening page

Local URL: http://localhost:8775

Start from the repository root:

```sh
PYTHONPATH=apps/api apps/api/.venv/bin/python -m scripts.sound_pilot.ipa_listening
```

The service binds only to loopback. Phone-sized browser layout is supported, but the URL is local to the computer running the service; this is not a LAN or hosted mobile deployment.

## Workflow

Play any of the five development recordings, adjust playback speed, enter the actual IPA in Glossika notation, and optionally insert symbols from the palette. Select IPA text to mark uncertainty, or add a listening question without transcribing it first. Each question stores the original IPA snapshot, Unicode-code-point selection offsets, the current playback position and a note. The playback position is user captured, not an automatic phoneme boundary. Editing IPA makes old marks visibly stale rather than silently moving them.

Statuses are pending, uncertain and confirmed. Confirmation requires nonempty IPA and no outstanding uncertainty marks. Source/model references are not displayed or served. The page does not change labels used by training or automatically promote user answers to acoustic gold.

## Persistence and export

Every edit is immediately stored in browser localStorage, then debounced to an atomic local JSON save. The local server keeps revision snapshots and `latest.json` under:

`.cache/sound-pilot/ipa-diagnostic-v5-20261109/listening-review/page-reviews/`

Server requests use a session token, same-origin/loopback checks and revision comparison. Stale concurrent writes receive a conflict rather than overwrite newer data. Failed storage/network saves are visible; dirty browser drafts survive refresh and can be exported. Conflicting local and server drafts are not merged automatically: export each before refreshing.

“导出 JSON” includes all current browser entries, exact IPA Unicode, uncertainty snapshots and unsynced state. “备用下载” serves the latest successfully saved local JSON as an attachment. Original CSV, audio, old references and training results remain unchanged. The agent can read local saves directly after review, even if a download does not appear.

## Validation

- Backend tests: exact Unicode round-trip, restart recovery, revision conflict, uncertainty validation, same-origin token rejection, unavailable reference-file route and ranged audio retrieval.
- Real Chromium on an isolated copied pack: audio playback, five valid audio metadata loads, text selection and uncertainty note, refresh restoration, stale-mark warning, confirmation/progress, client JSON download and server attachment download.
- Save-request failure simulation: edit → failed server save → refresh → browser draft restoration → successful retry. Export payloads verified on disk.
- Desktop 1440×1100 and mobile viewport 390×844 visually checked; mobile overflow assertion passed. These are browser viewport checks, not physical-phone acceptance.
- Evidence: `output/playwright/ipa-listening/`. Test annotations are under `.cache/sound-pilot/ipa-listening-page-qa/`; the actual pack remains untouched.
