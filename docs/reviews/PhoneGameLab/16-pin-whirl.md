---
id: PhoneGameLab/16-pin-whirl
title: Pin Whirl
was: 16-knife-throw (Knife Throw)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Tap to throw a blade into a rotating round target; a throw that hits a blade already stuck ends the run; fill the
target to advance; small bonus items sit on the rim.

## Baseline assessment
60-line prototype modelled on a well-known commercial knife-throwing game (log, knives, apples). Constant rotation with a
random sign, collisions tested with a muddled angle formula, grey rectangles for knives, tap-on-release input, no
feedback on hit or failure, no stage identity, no bosses, no best score. Overall 2/10.

## Weaknesses identified
Borrowed look; one rotation behaviour; instant unexplained game over; bonus targets with no purpose; laggy input.

## Creative opportunities
A sewing-table setting turns every element into something tactile and original: pincushions shaped like fruit, glass-
headed pins, buttons as bonus targets that buy a thimble (a forgiving second chance), bobbins as boss guards — and a
deliberate reward for the riskiest thing the genre offers: landing right next to another pin.

## Planned improvements
Instant, buffered tosses; authored spin patterns per stage; SNUG/RAZOR proximity bonus; buttons → thimble economy; boss
cushions with orbiting blockers; musical scale per stage; felt-and-linen identity.

## Implemented improvements
- **Input**: toss on pointer-down or Space/Enter/↑; a tap during flight is buffered 0.2 s; next pin is ready in 0.11 s.
- **Stages**: 6–10 pins each; spins are steady → reversed with pre-stuck grey pins → surging → stop-and-go → swaying →
  sudden flips (cushion wobbles and ticks 0.4 s before reversing), speed rising with stage; label names cushion and spin.
- **Boss every 5th stage**: a big strawberry cushion with more pins, three buttons, telegraphed reversals and one or two
  bobbins orbiting at their own speeds that block the landing spot (they turn red while blocking). Clearing it pays 200+
  and a thimble.
- **Risk/reward**: landing within 0.27 rad of a neighbour is SNUG (+5), within 0.185 rad RAZOR (+15); the prick threshold
  (0.118 rad) matches where the glass heads visibly touch.
- **Buttons & thimbles**: hitting a rim button pops it (+20); every fifth button grants a thimble (max 2) that absorbs one
  prick or block — the pin bounces off, the run continues.
- **Feel**: cushion dents and recoils on every hit, pins settle with an elastic wiggle, felt puffs, sparks/shake/hit-stop
  on a prick with the pin ricocheting away in slow-mo, cushions pop out/in between stages, quiver strip shows pins left.
- **Audio**: each pin of a stage plays the next step of a rising pentatonic scale over a soft knock (finishing the cushion
  finishes the phrase), coin for buttons, star for snug/razor, glass for a prick, lo-fi "chill" music that fills in as the
  quiver empties.
- **Look**: woven linen with cross-stitches and a red running-stitch border; five baked cushion designs (Tomato,
  Blueberry, Lemon, Plum, Mint) plus the Strawberry boss, with fixed lighting over the rotating fabric.

## Test results
- Smoke: pass (60 fps headless, survives resize/blur).
- Gameplay test `tests/PhoneGameLab/16-pin-whirl.test.js`: pass — cushion spins; a tap sticks a pin exactly at the bottom
  angle (+10); Space works; 0.22 rad neighbour = SNUG (+5), 0.15 rad = RAZOR (+15); button hit collects (+20); emptying the
  quiver clears the stage with a bonus; a thimble absorbs one prick; the next prick ends the run; best saved; clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, stages 1/3/boss, prick, game over).
- A frame-perfect timing bot clears stages 1–5 in ~16 s and dies on the first swaying stage, so the spin patterns do
  defeat naive prediction. Human pacing is an informed guess — **no human playtest**.

## Remaining issues
- Stages are short for a precise player; later stages mainly raise speed and reuse the five pattern types.
- Bobbin blocking uses a fixed angular window rather than true shape overlap.
- Pins are thin at phone size in landscape (portrait-framed stage).
- No visual "stage map"; progress is the stage number only.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | One-tap timing with immediate, readable consequences; stages take seconds |
| Mechanical depth | 7 | Spin reading, snug/razor greed, button targeting, thimble economy, boss blockers |
| Game feel | 8 | Dent/recoil, elastic pin settle, scale-per-pin audio, ricochet on failure |
| Visual identity | 9 | Fruit pincushions on linen with buttons and thimbles — unmistakably its own |
| Animation quality | 7 | Pop in/out, wobble warning, bouncing pin; pins themselves are simple |
| Audio quality | 8 | The rising scale makes each cushion a little tune; clear cues for every outcome |
| Controls | 9 | Instant on press, buffered, keyboard supported |
| Onboarding | 8 | "Tap anywhere to toss", empty first cushion, guide line and landing notch |
| Replayability | 7 | Score chase and deeper stages; limited pattern pool |
| Performance | 9 | Baked sprites, a few dozen draws per frame |
| Technical robustness | 8 | Clean restart, resize re-layout, tweens/timers on the game clock |
| Overall polish | 8 | Cohesive, tactile, nothing placeholder |

## Next recommended action
Human playtest for timing windows; add two more spin behaviours and a second boss type for stages 10+.
