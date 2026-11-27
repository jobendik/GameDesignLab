---
id: PhoneGameLab/61-lantern-tail
title: Lantern Tail
was: 61-snake (Snake)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Grid snake: steer a growing line around a square, eat to grow, die on walls or yourself.

## Baseline assessment
35-line prototype: green squares on black, swipe-on-release only (no keys, no buffering), a turn could be overwritten
before the step so quick double-turns killed you, score = length, fixed speed, no best, no reason to play twice. 2/10.

## Weaknesses identified
Input feel (the whole genre), no progression, no decision beyond "don't crash", no identity, cell-snapping movement.

## Creative opportunities
Make the tail a stake instead of a score: lanterns strung behind a paper dragon are worth nothing until you let them
float away, and the payout is triangular — so the genre's natural tension (long tail = danger) becomes a
push-your-luck choice, and letting go doubles as the escape tool.

## Planned improvements
Smooth movement, buffered/forgiving input on every device, LET GO banking with triangular value, nights that add
speed, crates and drifting lanterns, golden timed lanterns, festival-at-dusk identity.

## Implemented improvements
- **LET GO**: the tail scores 0 until released; releasing n lanterns banks 10·(1+…+n)·night, floats them into the
  sky (staggered rising arpeggio, flash, banner for 10+) and leaves a bare head. The button shows the live payout
  and pulses faster as the stake grows. Crashing burns the tail; the game-over card says how much was never banked.
- Input: two buffered turns, reversals ignored, a 0.15 s grace beat at any obstacle (head squashes; a late turn
  still saves you; a turn into a wall is dropped if straight on is clear). Drag-swipes register several turns per
  drag, tap beside the head to turn toward the tap, arrows/WASD, Space/Enter to let go.
- Movement is interpolated between cells; the head eases its rotation; new lanterns pop in; the tail ripples on
  every pickup.
- Nights: banked lanterns fill a meter; each night is faster (5.2 → 9.5 cells/s), multiplies payouts, and drops
  two crates (blinking "!" telegraph, never next to the head, never touching each other or the edge lanes). From
  night 3 some lanterns hop to a neighbouring cell every 1.5 s. Golden lanterns appear on a timer ring for 7.5 s
  and add three at once.
- Identity: plum dusk square with warm bokeh, glowing paper lanterns in six colours on a gold string, a red-and-gold
  paper dragon head, wooden crates; funk music whose intensity follows tail length and night.
- Audio carries state: pickup pitch climbs with tail length, release plays one note per lantern.
- Board is 12×(up to 18) in portrait and (up to 20)×11 in landscape/desktop; LET GO sits under the thumb.
- Splash shows the game playing itself with a small greedy pilot.

## Test results
- Smoke: pass (60 fps headless, no errors, survives resize/blur).
- Gameplay test `tests/PhoneGameLab/61-lantern-tail.test.js`: pass 3/3 runs — reverse ignored, buffered double
  turn, lanterns eaten by real arrow-key steering, tail worth 0 until LET GO, exact triangular payout via touch
  button and via Space, sub-3 release refused, mouse swipe and touch tap steering, night advance (speed, crates,
  multiplier), crash → game over with banked best, clean restart.
- Screenshots inspected at 390×844 (play, release, splash), 844×390 (play, game over) and 1280×800 (night 3).
- Subjective assessment from code reading and scripted play only (no human playtest). The grace beat and
  drifting lanterns were not exercised by the automated test.

## Remaining issues
- Night 1 has no clock, so a patient player can build a very long tail slowly; only board space pushes back.
- Crates are the only standing hazard; after about night 7 nothing new appears besides speed.
- The square is dim by design; on a poor screen the tiles and crates could use more contrast.
- Desktop cell size is capped at 46 px, leaving margin around the board on large windows.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Push-your-luck banking makes every lantern a decision |
| Mechanical depth | 8 | Triangular stake, release as escape, night multiplier vs. risk |
| Game feel | 8 | Smooth motion, buffering, grace squash, sky release |
| Visual identity | 8 | Paper dragon and lantern string at dusk; own look |
| Animation quality | 8 | Interpolation, tail ripple, pop-ins, floating release, crate drops |
| Audio quality | 7 | Length-pitched pickups, per-lantern release notes, reactive funk |
| Controls | 9 | Swipe-drag, tap-to-turn, keys; forgiving at walls |
| Onboarding | 8 | Three-line splash, start toast, LET GO tip at three lanterns |
| Replayability | 8 | Score chase with real variance; late nights thin on novelty |
| Performance | 9 | Baked sprites, tiny entity counts |
| Technical robustness | 8 | Clean restart, resize keeps the grid, engine pause |
| Overall polish | 8 | Cohesive splash → play → game over |

## Next recommended action
Human playtest of pacing; consider a slow "wind" timer on night 1 and a late-night hazard (moving cart).
