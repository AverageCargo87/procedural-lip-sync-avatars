# Mouth honesty metric and its mutation tests

## Why "honest"

The first lip-sync check in this project compared the mouth with the same letters and formula the mouth was computed from. It scored 100% on deliberately broken versions, because the code under test zeroed the mouth at exactly the points the check sampled. A check that reads the animation's own inputs can only agree with the animation.

The metric in `tools/proverka/honesty.mjs` therefore uses **the clean voice as the reference**: voice activity and silences from the waveform, and the acoustic closure of "p" from a dip in the 800-4000 Hz band of a short-time Fourier transform. Letters are used only to know which host owns a line and which sound a vowel is meant to be.

It is a JavaScript port of the original Python/scipy implementation. On the demo clip the port reproduces the original value for value: all 12 checks, all 4 tempos (48 of 48 numbers identical, cross-checked on 2026-11-20 by running the original script on tracks exported with `node tools/proverka/honesty-cli.mjs all --dump <dir>`).

## The 12 checks

| id | what fails it | bar |
|---|---|---|
| `pauses` | a real pause in the voice (>= 0.25 s) while the owner's mouth is open > 0.12 for > 0.1 s | 0 |
| `silence` | a silence (>= 0.16 s below -55 dB) while either mouth is open > 0.12 for > 0.1 s | <= 2 |
| `listener` | the partner's mouth opens outside its own lines | max < 0.02 |
| `listener-voice` | the same, but only where the clean voice is also silent | max < 0.02 |
| `vowels` | a vowel never reaches 40% of its loudness-scaled target opening (+-40 ms tolerance) | >= 97% |
| `round` | "o", "u" without lip rounding >= 0.5 | >= 85% |
| `spread` | "i", "e", "y" without lip spread >= 0.3 | >= 85% |
| `p-closed` | the mouth is not closed (< 0.08) at the acoustic closure of "p" | >= 90% |
| `closure-p90` | closures inside loud speech last too long | p90 <= 0.16 s |
| `speed-p99` | the mouth jumps between 30 fps frames | p99 <= 0.36 |
| `speed-max` | the single largest jump between 30 fps frames | <= 0.46 |
| `jitter` | open/close direction reversals per second while speaking | median <= 12 |

## Results on the demo clip

`npm run honesty`, measured 2026-11-20 (42 s, two hosts, 7 lines):

| check | A original | B a bit calmer | C calm | D very calm |
|---|---|---|---|---|
| pauses (of 12) | 0 | 0 | 0 | 0 |
| silences (of 18) | 0 | 0 | 0 | 0 |
| listener max open | 0 | 0 | 0 | 0 |
| vowels reached (n=174) | 1.000 | 0.989 | 0.971 | **0.966** |
| o, u rounded (n=27) | 0.963 | 0.963 | 0.963 | 0.963 |
| i, e, y spread (n=51) | 0.961 | 0.961 | 0.961 | 0.961 |
| p closed (n=10) | 1.0 | 1.0 | 1.0 | 1.0 |
| closure p90, s | 0.098 | 0.092 | 0.092 | 0.092 |
| speed p99 | 0.297 | 0.255 | 0.215 | 0.180 |
| speed max | 0.331 | 0.290 | 0.256 | 0.222 |
| jitter, reversals/s | 3.0 | 2.6 | 1.8 | 1.3 |
| **passed** | **12/12** | **12/12** | **12/12** | **11/12** |

Tempo D is the slowest mouth; on this clip it misses the vowel bar by 0.4 points. The test suite asserts exactly this, so the gap stays documented instead of being tuned away.

## Mutation tests

`npm run mutants` and `test/mutants.test.mjs` break the animation on purpose and require the metric to fail the check aimed at that bug. Results on tempo A (13 of 13 targeted mutants are caught on every tempo):

| kind | mutant | what is broken | failed checks |
|---|---|---|---|
| src | `all-vowels-a` | every vowel uses the shape of "a" | round, spread |
| src | `no-lip-closure` | no forced closure on m, b, p | p-closed |
| src | `weak-mouth` | opening x0.42 | vowels |
| src | `slow-mouth` | mouth speed limit 2/s instead of 7-10 | vowels |
| src | `no-rounding` | o and u do not round | round |
| src | `long-closure` | m, b, p closure three times wider | vowels, closure-p90 |
| post | `flapper` | only the jaw moves | round, spread |
| post | `hangs-open` | open 0.5 s before and after each line | pauses, silence, listener, listener-voice, speed-max |
| post | `listener-chews` | the listener moves the mouth | pauses, silence, listener, listener-voice, speed-p99, speed-max |
| post | `jitter` | +-0.05 on every 120 Hz frame | jitter |
| post | `late-150ms` | the whole mouth runs 150 ms late | pauses, silence, round, p-closed |
| data | `no-aligner-even` | letters spread evenly over each line | pauses, silence, round, p-closed |
| data | `no-aligner-words` | TTS word timestamps split evenly into letters | pauses, silence, vowels, closure-p90 |
| src | `no-silence-close` | soft tempos stop force-closing after 0.12 s of silence | **none: documented survivor** |

13 of 13 targeted mutants are caught. The survivor is a real blind spot: that mechanism acts in gaps shorter than the 0.16-0.25 s the pause checks look at (on this clip it changes the open value by up to 0.47 over about 2 s in total). A short-pause check is on the roadmap; until it exists, a test asserts that the mutant still survives, so the documentation cannot quietly overclaim.

The two `data` mutants double as the case for the aligner: the same baker fed with naive letter timing fails 4 of 12 checks, while the aligned timing passes all 12, with or without TTS word timestamps.

## Mouth visibility in the drawing

The metric checks the track; `npm run measure:mouth` (`tools/proverka/rot-vidno.mjs`) checks the drawing. For every style and host it renders 252 poses (7 sounds x 9 head poses x 4 arm poses) with and without the mouth and compares the changed pixels with the mouth drawn alone. It also measures the width of "a" on a 360 px wide stage and counts light pixels inside a closed "m".

Measured 2026-11-20 in headless Chrome:

| styles | mouth visible, worst pose | "a" width at 360 px | teeth on "m" |
|---|---|---|---|
| 24-27 simple adults | 97.9-100% | 19.1-27.8 px | 0 |
| 20-23 detailed adults | 98.2-99.9% | 20.6-22.5 px | 0 |
| 7-10 geometric originals | 98.5-100% | 20.1-28.3 px | 0 |

The worst case (97.9%) is Artem in style 24 on "t, d, n" with the body leaning away; the tool prints the worst pose for every host.

## Frame cost

`npm run measure:speed`: one full scene (both hosts, background, table) at 960 px, median of 240 frames on the real track, headless Chrome on a desktop PC, measured 2026-11-20:

| styles | median ms per frame |
|---|---|
| 7-10 geometric originals | 1.5-2.4 |
| 24-27 simple adults | 2.2-2.8 |
| 20-23 detailed adults | 4.4-5.6 |

No blur or shadow filters are used, so the cost does not depend on the browser's filter implementation. Phone timings were not measured.
