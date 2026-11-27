---
id: PhoneGameLab/63-big-drip
title: Big Drip
was: 63-agar (Agar.io)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Eat-to-grow blob arena: drag to move, absorb smaller blobs and pellets, avoid bigger blobs.

## Baseline assessment
39-line prototype carrying a commercial game's name: one fixed screen, blobs that bounce like billiard balls with no
behaviour, radius as score, instant death, one beep, flat circles on navy. Overall 2/10.

## Weaknesses identified
Borrowed identity; no AI at all; no verb besides moving; nothing in the environment; no camera or sense of scale; no end
to a run; no way to tell predator from prey except by squinting at radii.

## Creative opportunities
Raindrops coalescing on glass is the natural metaphor for the genre and brings its own hazards (a wiper, a heater vent)
that punish being big — the opposite pressure to the core loop.

## Planned improvements
Night-window identity; mass management through a fling/split; wiper and vents; honest predator/prey read-outs; bots with
temperaments and misjudgement; 2:30 shower with three lives, ranking and podium bonus; edge indicators; reactive audio.

## Implemented improvements
- **Identity**: rain on a night-bus window — baked bokeh city lights, condensation tile, refractive drop sprites with
  rims and highlights, faces that look where they slide; lo-fi "chill" music and a rain-noise loop.
- **Verbs**: slide (speed falls with mass) and FLING (tap / click / Space: every piece ≥ 40 throws half its water
  forward; pieces repel for 6 s, then drift together and merge; max four pieces).
- **Hazards**: a windscreen wiper sweeps a marked fan (2.4 s telegraph with banner, direction arrow and "GET OUT /
  you're clear"), smearing 40 % of any drop into loose beads it cannot re-eat for 1.6 s and ploughing the mist into a
  ridge; three warm vents evaporate 11 %/s — deadly for the fat, a refuge for the small. Rain falls denser in the fan.
- **Read-outs**: dashed spinning ring + brows + open mouth = can swallow you; soft ring = you can swallow it; worried
  faces on fleeing drops; off-screen threat arrows and meal dots; top-3 ranking with your place.
- **Bots**: timid, bold, hunter and drifter. They flee/chase through their own size misjudgement (±5–30 %), hunters fling
  at prey, wary ones leave the fan when the wiper warns, bold ones do not. Newcomers arrive bigger and meaner later.
- **Arc**: 150 s shower, DOWNPOUR at half-time (more mist, faster wiper), three lives with safe respawn + shield, podium
  bonus (+500/250/100), win card for finishing biggest. Score = water swallowed.
- Controls: floating stick + tap (touch), pointer + click (mouse), WASD/arrows + Space. Smooth camera, zoom from mass
  and piece spread.

## Test results
- Smoke (`tools/smoke.js 63-big-drip`): pass.
- Gameplay test (`tests/PhoneGameLab/63-big-drip.test.js`): pass — bots move, mouse steering, beads and a smaller drop
  eaten, fling split + re-merge, vent evaporation, wiper telegraph + smear, three lives lost → game over, clean restart,
  timed finish with bonus.
- Autopilot simulations of full rounds on two seeds (growth curves, wiper effect, survival) used for balancing.
- Screenshots inspected at 390×844, 844×390 and 1280×800.
- Subjective assessment from scripted play only (no human playtest).

## Remaining issues
- Tapping to fling on touch while not dragging also stops the drop for a moment (stick release = brake).
- Bots do not use vents deliberately as hiding places; they only avoid them.
- The bokeh backdrop is static (no parallax); a headless browser reports a phantom pointer at (0,0) until the mouse moves.
- Balance tuned by simulation, not by people.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Chase/flee is immediately legible; wiper creates shared panic and feeding frenzies |
| Mechanical depth | 8 | Fling timing, staying small vs big, fan as risky pasture, vents as shelter |
| Game feel | 7 | Pops, wobble, hit-stop on big meals, smear shake; fling could be juicier |
| Visual identity | 8 | Night glass with bokeh and refractive drops; distinct from every sibling |
| Animation quality | 7 | Squash on motion, pop on merge, moods on faces; wiper is a plain bar |
| Audio quality | 7 | Pitch = size on swallow, rain loop, wiper sweep tone, reactive music |
| Controls | 8 | Three input schemes; fling on the same thumb |
| Onboarding | 8 | Rings/faces explain who eats whom; wiper banner says what to do |
| Replayability | 8 | Random field, varied bots, score + podium chase |
| Performance | 8 | ~0.1 ms per sim step; sprites for drops/beads; culled drawing |
| Technical robustness | 8 | Clean restart, resize rebuilds backdrop, lives/respawn tested |
| Overall polish | 8 | Complete loop with attract scene and readable HUD at 390 px |

## Next recommended action
Human playtest of early-game safety and fling feel; give sly bots vent-hiding and add a second hazard pattern late on.
