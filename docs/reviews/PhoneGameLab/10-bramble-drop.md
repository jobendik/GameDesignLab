---
id: PhoneGameLab/10-bramble-drop
title: Bramble Drop
was: 10-bubble-shooter (Bubble Shooter)
status: transformed
baseline: 1
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Aim-and-shoot bubble matcher: fire coloured bubbles into a hex-packed ceiling, groups of three or more disappear.

## Baseline assessment
Did not run at all: a top-level `let top` collided with `window.top`, so the script threw before the first frame.
Behind that: no orphan dropping, a 200 px aim stub with no bounce preview, collision by "nearest empty cell anywhere",
no ceiling pressure (the board could only ever shrink), flat circles, one beep. Overall 1/10.

## Weaknesses identified
Broken; no pressure and therefore no loss condition in practice; no reason to plan a shot; no identity; no feedback.

## Creative opportunities
Make "what hangs from what" physical and readable (a bramble with fruit), turn the descending ceiling into a living
opponent that reacts to how well you play, and reward consecutive good shots.

## Planned improvements
Real hex grid with unbounded rows, swept shot + adjacency-aware snapping, full bounce preview with landing ghost,
cluster pop + orphan drop with separate scoring, real-time creep with push-back, streak multiplier, swap, dusk-garden identity.

## Implemented improvements
- **Grid**: offset hex rows (10/9) addressed by signed row index so new rows can grow above for ever; flood-fill clusters;
  anything not connected to the top row falls.
- **Shot**: swept in 0.42 r steps, wall reflection, slightly forgiving collision radius (0.83) so berries squeeze through
  gaps; snap prefers the nearest empty cell that touches the bramble. The same code drives the **aim preview**: animated
  dotted path through every bounce plus a landing ghost that lights up white when the shot would complete a trio.
- **Controls**: drag anywhere to aim, release to fling (release below the catapult cancels); mouse hover aims and click
  fires; arrows + Space; a shot released mid-flight is buffered. Tap the nest (or ↓/X) to swap the two berries in hand.
- **Pressure hook**: the bramble creeps down in real time, 3 px/s rising 0.16 px/s per row grown (cap 12). Every popped
  berry shoves it back 2.2 px and every *dropped* berry 6.5 px, so big drops are both the score and the survival play.
  Pick it nearly clean and it surges down to refill. A wasted shot makes it lunge a third of a row.
- **Scoring**: 10 per popped berry (+10 for each beyond three), drops worth 20, 40, 60 … 200 each, all times a streak
  multiplier ×1…×5 for consecutive shots that pop. Fifth and sixth berry kinds ripen at rows 10 and 26.
- **Fair loss**: crossing the hedge line stops the creep and arms a visible 2.6 s countdown; popping the offenders cancels it.
- **Identity**: dusk sky, tree line, hedge; the bramble is one merged dark silhouette with leaves; six berries with distinct
  markings (drupelets, star, segments, stripes, crescent, wheel) so colour is never the only cue; twig catapult with elastic.
- **Feel/audio**: neighbours jostle on landing; pops ripple outward by graph distance on a pentatonic ladder; fallen fruit
  thuds into the hedge on a rising scale with score pops; hit-stop/shake only for big drops; lo-fi `chill` music whose
  intensity follows how close the bramble is, heartbeat when it is close.

## Test results
- Smoke (`node tools/smoke.js 10-bramble`): pass, 61 fps headless.
- Gameplay test (`tests/PhoneGameLab/10-bramble-drop.test.js`): pass — creep, bounce preview, real drag-release shot that
  pops a trio and drops two hangers with exact scoring (30 + 20 + 40), ×2 on the next pop, wasted shot sticks and resets
  the streak, nest tap swaps without firing, keyboard fire, bramble creeps to the hedge → countdown → game over, clean restart.
- Tuning by a greedy bot using real pointer input (1.3 s per shot, 15 % random aim error): runs of roughly 95–150 s.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (opening, mid-game, danger, countdown, splash).
- Subjective assessment from scripted/bot play only — no human playtest.

## Remaining issues
- Run length has high variance: one lucky avalanche near the top row can clear most of the screen.
- No special berries (bombs, wild) — depth comes only from drops, streak and swap.
- The preview shows the complete path; expert players may find aiming too solved. A "short guide" hard mode would help.
- Top rows sit under the translucent HUD (a dark fade keeps the score legible).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Proven loop plus real-time pressure; drops are loud, generous and useful |
| Mechanical depth | 7 | Drop planning, streak protection, swap, bank shots; no specials |
| Game feel | 8 | Rippled pops, jostle, catapult recoil, rising scales, restrained shake |
| Visual identity | 8 | Dusk bramble with marked berries reads at thumbnail size |
| Animation quality | 7 | Pops, falls, reload hop, lunge wobble; bramble itself is static art |
| Audio quality | 7 | Pitch ladders carry chain size; reactive music; engine presets only |
| Controls | 8 | Drag/hover/keys, cancel zone, buffered shot, forgiving collision |
| Onboarding | 8 | Opening prompt, ghost cell that lights when a shot will pop |
| Replayability | 7 | Random brambles, escalating speed and colours, score chase |
| Performance | 9 | ≤ ~200 sprites, one merged silhouette path, 60 fps headless |
| Technical robustness | 8 | Clean restart, resize rescales the bramble, no timers outside engine |
| Overall polish | 8 | Coherent start to finish; countdown and banners feel finished |

## Next recommended action
Human playtest of creep speed and miss penalty; add one special berry and an optional short-guide mode.
