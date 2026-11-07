# Mission orb reference assets

The user requested a reproduction of the ElevenLabs homepage Voice orb. These two assets were inspected and saved from that public page on 2026-11-07:

- `blue-green.jpg`: https://eleven-public-cdn.elevenlabs.io/marketing_website/_next/static/media/agents-8.e6a8556e.jpg
- `grain.png`: https://eleven-public-cdn.elevenlabs.io/marketing_website/_next/static/media/noise.24b8225d.png

Both are served locally; the Mission page makes no request to ElevenLabs. Original assets remain attributable to ElevenLabs; this record does not assert an open-source license for them.

The local renderer follows the observed sphere projection (scale .9, power 1.1), four-octave FBM (scale 3.25, power 2.75, amplitude .65), simplex displacement (scale .65, amplitude .15, speed .25), fixed 1.4 time scale, internal audio ring and separate 50% overlay grain. Audio also injects radial pulses into a local 128px velocity/pressure and 512px dye field with three pressure iterations, .98 dissipation and 1.2 blur; half-float rendering is optional. Standard simplex noise is MIT-licensed, with its notice included in `features/speaking/orb-simplex.ts`.

Reference inspection: https://elevenlabs.io/ and the public OrbShader chunk `24594.8adae7b2f2174cea.js`. Reference frame sequence is in `output/mission-orb/reference-sequence/` (24 frames over 5.18 seconds). Local audio uses Libitu's actual playback and authorized capture graphs, with stronger quiet-speech normalization. This is not a claim of frame-identical live-call output: provider audio, microphone processing and accumulated interaction history differ.
