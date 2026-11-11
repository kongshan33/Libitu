# Research moved

The active speech research package and its tests now live in the independent
[Speech Phenomena repository](/Users/river/Documents/speech-phenomena).

Use that repository's README and environment. `scripts.sound_pilot.*` is no
longer an API entrypoint, and API tests no longer collect research experiments.

Original code/tests are preserved with hashes under
`/Users/river/Documents/speech-phenomena-store/legacy/retired-api-code` and the
byte-preserved `legacy-workspace` snapshot. Existing `.cache/sound-pilot` data
remains untouched as an additional retained copy. No model or online Sound
behavior was changed by this separation.

See [migration report](/Users/river/Documents/speech-phenomena/docs/migration/REPORT.md).
