---
id: PhoneGameLab/03-flinch
title: Flinch
was: 03-reaction-duel (Reaction Duel)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Reaction test: the screen is red, turns green after a random wait, tap as fast as you can; tapping early fails the attempt.

## Baseline assessment
33-line prototype: full-screen colour fills, input on `onTap` (measured on finger *release*, inflating every reading by the
tap duration), no rounds, no session, best kept only in a variable, no game-over, and indistinguishable in concept from
its neighbour 04-quick-draw. Overall 2/10.

## Weaknesses identified
Inaccurate measurement; nothing to do after one reading; no escalation; colour-only signal; no persistence; no identity;
duplicate of game 04.

## Creative opportunities
Lean fully into *measurement* (04 takes the duel): make the device itself the character, show the reaction physically,
give a session a shape (eight trials → one average to beat) and let the machine try to make you flinch.

## Planned improvements
Lab-instrument identity; press-time measurement with `performance.now()`; 8-trial session scored by average (lower is
better) with persistent best average and best single trial; escalating feints; flinch penalty and lock-out; paper tape of
results; rank titles.

## Implemented improvements
- **Identity**: a slate-blue enamelled "Reflexometer": cream panel meter (0–600 ms, green/amber/red bands, BEST and AVG
  markers), a big jewel lamp in a chrome bezel, STANDBY/FAULT indicator lamps, three flinch bulbs, a status window and a
  paper tape that prints each trial in monospace. All procedural, baked into one panel sprite.
- **The reading is physical**: on green the meter needle sweeps in real time and freezes where you tapped; the number
  bursts out of the lamp; the chime's pitch tracks speed; sub-215 ms gets a hit-stop and sparkle.
- **Accurate timing**: reaction = `performance.now()` at pointer-*down* (or Space/Enter) minus the timestamp of the frame
  that lit the lamp; game-clock effects cannot distort it; a pause/tab switch mid-trial voids and re-arms the trial;
  under 90 ms is treated as guessing.
- **Session**: 8 trials, score = average ms (engine `lowerIsBetter`, HUD shows the running average, BEST persists);
  best single trial persists separately and is marked on the meter; end card gives a rank (Sloth → Hummingbird), best
  trial, spread (±sd) and flinches, with the delta to the previous personal best.
- **Escalating feints** (the hook): trials 1–2 clean; 3–4 one mild feint (side lamp + relay click, needle twitch);
  5–6 one or two including the big lamp glowing red or amber and a panel thump; 7–8 two or three including filament
  flicker, with shorter or much longer waits. Feints never fire within 0.32 s of the real signal. Green is the only "go"
  and also shows the word GO (red shows ✕), so it is not colour-only.
- **Stakes**: tapping on anything but green is a flinch — the trial prints as 500, a bulb lights, buzzer and shake;
  three flinches lock the machine with no score. Sleeping past 600 ms prints 600.
- Quiet tension: faint tick while waiting, music drops to pad-only while armed and returns between trials.
- Portrait and wide layouts (meter left / lamp right) with their own proportions; touch, mouse, Space/Enter.

## Test results
- Smoke (`node tools/smoke.js 03-flinch`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test `tests/PhoneGameLab/03-flinch.test.js`: pass — arming taps ignored, natural wait → green → real tap
  recorded (140–600 ms), HUD average, slower key press reads slower, later trials plan feints, red feint does not start
  the clock and tapping it is a 500 ms flinch, no tap → 600, eight trials → game over with score = average stored as
  best, clean restart, three flinches → lock-out leaving best untouched.
- Screenshots inspected at 390×844, 844×390, 1280×800 (first trial, result, feint, green, game over); fixed tape
  overlapping the flinch label in both layouts, overlapping BEST/AVG markers, dead space in portrait.
- Subjective assessment from reading code and scripted play only — no human playtest.

## Remaining issues
- Readings include display + touch latency (as on any web reaction test); numbers run ~30–60 ms above lab values.
- A run is short (~40 s); depth is in beating your own average, there are no alternative modes (e.g. audio-only).
- Feint mix is random per run, so two runs are not strictly comparable in difficulty.
- The amber big-lamp feint relies on colour plus the absence of the word GO; a distinct glyph would help further.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Tense waits, satisfying needle-stop reveal, "one more run" to shave the average |
| Mechanical depth | 6 | Composure under feints is a real skill, but it is still a one-button test |
| Game feel | 8 | Needle sweep/freeze, lamp pop, pitch-mapped chime, buzzer + shake on flinch |
| Visual identity | 9 | The instrument is unmistakable and unlike anything else in the lab |
| Animation quality | 7 | Sprung needle, lamp fades, tape print-in; panel itself is static |
| Audio quality | 7 | Relays, bell, buzzer and tick fit the fiction; all synthesised from engine primitives |
| Controls | 8 | Press-time measurement, anywhere-tap, keys; arming grace prevents carry-over taps |
| Onboarding | 8 | First trial states the rule in the status window and has no tricks |
| Replayability | 7 | Personal-best average and single-trial best; no modes or daily variation |
| Performance | 9 | One baked panel sprite, a handful of draws per frame |
| Technical robustness | 8 | Pause/blur voids the trial; lock-out never writes a score; tested |
| Overall polish | 8 | Cohesive, complete loop with rank card |

## Next recommended action
Human playtest of feint fairness; add an optional "sound only" and "5-trial sprint" mode; distinct glyphs per feint colour.
