# Glossary of transliterated identifiers

The code was written for a Russian-language product, so many identifiers are transliterated Russian words. Comments and docs are in English; the names were kept so the history stays readable and the mutation tests can anchor on exact source text.

## Files

| name | meaning |
|---|---|
| `rech.js` | speech: the pose-track baker |
| `personazh.js` | character: the first-edition drawing |
| `stili/` | styles (drawing versions); `stili/_kit.js` is the shared kit and the style contract |
| `kosoy`, `trapecii`, `grani`, `blok` | slanted cube, trapezoids, facets, block (the four geometric families) |
| `*2.js`, `*3.js` | detailed adults (20-23) and simple adults (24-27) of each family |
| `tools/vyravnivanie.mjs` | alignment: letters to audio |
| `tools/udar.json` | stress dictionary (`udar` = stress) |
| `tools/proverka/` | checks |
| `rot-vidno.mjs` | "mouth visible" |
| `skorost.mjs` | speed (frame cost) |
| `dvizhenie.mjs` | motion (events per minute) |

## Data

| name | meaning |
|---|---|
| `bukvy` | letters: `[who, t0, t1, char]` |
| `repliki` | lines of dialogue |
| `vopros`, `vosk` | the line is a question, an exclamation |
| `energy` | loudness at 100 Hz |
| `udar` | stress: `{word: index of the stressed letter}` |
| `zv` (`zvuki`) | sounds (phonemes) after letter-to-sound rules |
| `treki` | tracks (the baked arrays) |
| `poza(t)` | pose at time t |
| `udary` | beats (stressed syllables that drive nods and hand beats) |
| `storona` | side: 1 for the host on the left, -1 on the right |
| `L`, `A` | Lena (left host), Artem (right host) |

## Tempos (`Rech.STILI`)

| id | letter | meaning |
|---|---|---|
| `bylo` | A | "as it was": the original numbers |
| `chut` | B | "a bit" calmer |
| `spokoyno` | C | calm |
| `tiho` | D | quiet, very calm |

Selected tempo parameters: `rotSila` mouth strength, `skorost` mouth speed limit, `tishina` close the mouth after this much silence, `svyaz` connected speech, `kivok` nod strength, `morg*` blinks, `zhest*` gestures, `sakkada*` saccades, `dyhanie` breathing, `volosy*` hair.

## Drawing kit (`Kit`, `Stili`)

| name | meaning |
|---|---|
| `Stili.dobavit` | register a style |
| `Stili.scena` | draw the whole scene |
| `Stili.geroj` | draw one character |
| `Stili.schet` | count drawn shapes (fill, stroke and fillRect calls) |
| `fon`, `stol`, `telo`, `ruki` | background, table, body (with head), arms |
| `ramka` | close-up frame of the face |
| `nomer`, `imya`, `gruppa` | number, name, group |
| `Kit.rot` | mouth (`rot`) |
| `glaz`, `glazMil`, `busina` | eye, friendly eye, bead eye |
| `brov`, `brovDuga` | brow, arched brow |
| `lico` | face |
| `sdvig` | feature shift on head turn |
| `ruka`, `rukaV`, `kistV`, `dveRuki` | arm, adult arm, adult hand, both arms |
| `naGolovu` | move into head coordinates |
| `plashka`, `zal`, `mnogo`, `arka`, `yajco` | rounded rect, fill, rounded polygon, arch, egg |
| `zapisRta`, `bezRta` | record mouth calls, draw without the mouth (used by the visibility check) |
| `gladko`, `pruzhina`, `zamedlit`, `shum` | smooth, spring, rate-limit, noise (in `rech.js`) |
