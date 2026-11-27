---
id: PhoneGameLab/54-hedgeroll
title: Hedgeroll
was: 54-maze (Maze)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Swipe through a generated grid maze to a goal square; the prototype already slid the player until it hit a wall.

## Baseline assessment
40-line prototype: grey block maze, a yellow dot that teleported, one fixed 11×11 size, no guarantee the goal could be
*stopped on* (sliding could overshoot it forever), no move counter, no levels, one beep. Overall 2/10.

## Weaknesses identified
Slide rule not designed around (unsolvable layouts possible); no feedback or animation; no identity; no progression,
scoring, undo or persistence; portrait-only hard-coded layout; duplicated the collection's other maze (29-tiltwood).

## Creative opportunities
Lean into "roll until you bump" as the whole puzzle (it is nothing like the tilt-physics sibling), give it a hero that
obviously rolls, a place worth looking at, and a solver so every level is provably fair and has a real par.

## Planned improvements
Hedgehog in a topiary garden; thin-wall mazes knocked open into lawns; BFS-proven solvability and par; stars; moss, acorn +
gate and molehill tunnels as later mechanics; undo / restart / hint; time-of-day palettes; persistence; landscape layout.

## Implemented improvements
- **Rule + generator**: depth-first maze with a level-dependent share of hedges removed; a BFS over (cell, has-acorn)
  proves solvability, places the burrow so the optimal roll count hits the level's target (3 → 12) and yields par. Up to
  60 seeded candidates per level, ~0.5 ms each; levels are generated forever from the level number.
- **Mechanics ladder**: plain rolls (1–3) → sticky moss that stops a roll (4+) → acorn that opens a gate, with the burrow
  guaranteed to sit behind it (7+) → molehill pairs that pop you out still rolling (11+); boards grow 4×5 → 7×9.
- **Par + stars**: rolls ≤ par = ★★★, par+2 = ★★, hint caps at ★★; best stars per garden and a running total persist
  (`Lab.store`), with previous/next garden buttons for replaying.
- **Controls**: early-firing swipes, tap-a-direction, arrows/WASD; two-move input buffer during a roll; blocked swipes
  give a nudge + tick and cost nothing; undo (Z), restart (R), hint (H), `[` `]` to change garden.
- **Feel**: the hog curls into a spinning ball, accelerates, bumps with squash, leaf shards and a thud whose pitch and
  shake scale with roll length; moss squelch, acorn pickup → gate unlock ring, molehill pop, burrow dive with star chimes;
  filtered-noise roll loop; march music whose intensity follows rolls used.
- **Identity**: baked top-down garden (checkered lawn, tufts, layered leafy hedges with blossom, gravel), procedural
  hedgehog/acorn/gate/burrow art, four times of day (dusk retints the HUD and adds fireflies).
- **Layout**: board transposes in landscape with a side panel; splash backdrop is the game solving itself.

## Test results
- Smoke (`node tools/smoke.js 54-hedgeroll`): pass, 61 fps headless, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/54-hedgeroll.test.js`): pass — blocked swipe costs nothing, mouse swipe rolls to
  the predicted stop, undo/restart, keyboard solve in par → 3 stars + win card + saved progress, hint direction + 2-star
  cap with touch taps, gardens 8 (acorn/gate) and 11 (molehills) solved by swipes, level select.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, gardens 1/5/8/11); fixed a hidden snout, a wrapping
  how-to line and tight side margins.
- Par curve checked for gardens 1–30 (3,3,4,5,6,6,7,8,8,9,10,10,11,12…).
- Subjective assessment is from code + scripted play, not a human playtest.

## Remaining issues
- Difficulty plateaus at par 12 on 7×9 from garden 14; later gardens vary by seed and mechanic mix only.
- Par is the optimum, so three stars always means a perfect solution — strict for casual players (hint/undo soften it).
- Moss/molehills are placed randomly; some are decoration rather than part of the shortest route.
- 7×9 cells are ~49 px on a 390 px phone: fine for swiping, small for the tap-a-direction alternative.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Roll-until-bump is instantly readable and each garden is a tidy 20–60 s puzzle |
| Mechanical depth | 7 | Four interacting rules, optimal-par chase; no moving hazards |
| Game feel | 8 | Curl, acceleration, length-scaled bump, buffered input, nudge on blocked moves |
| Visual identity | 8 | Distinct sunny topiary look, time-of-day palettes, characterful hero |
| Animation quality | 7 | Rolling/idle/blink/squash, gate fade, burrow dive; no turn animation |
| Audio quality | 7 | Pitch-by-length bumps, roll loop, distinct cue per mechanic, reactive march |
| Controls | 9 | Swipe, tap or keys; early swipe detection; buffer; undo/restart/hint |
| Onboarding | 8 | Garden 1 is three rolls; one on-canvas tip when each mechanic first appears |
| Replayability | 7 | Endless generated gardens, stars to perfect; no daily/timed mode |
| Performance | 9 | One baked background + a few paths per frame; generation ≈ 1 ms |
| Technical robustness | 8 | Clean restart/level change, resize transposes the board, timers via engine |
| Overall polish | 8 | Cohesive from splash demo to win card |

## Next recommended action
Human playtest of the par strictness; consider a roaming snail obstacle or one-way arches for gardens 15+.
