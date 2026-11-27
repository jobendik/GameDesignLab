---
id: PhoneGameLab/53-plot-twist
title: Plot Twist
was: 53-block-blast (Block Blast)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A clone of a commercial block-placement game: drag one of three polyominoes onto an 8×8 grid; full rows and columns clear.

## Baseline assessment
58-line placeholder with the commercial game's name and rules: grey squares, pieces drawn tiny and hidden under the
finger while dragging, no preview of where a piece will land, no combos, unwinnable trays dealt at random, one beep,
hardcoded layout. Overall 2/10.

## Weaknesses identified
No identity of its own; dragging was blind; nothing to plan beyond rows/columns; random deals could end a run unfairly;
no progression, no feedback, no keyboard.

## Creative opportunities
Change what "a line" is. If the board itself is divided into irregular regions that must be filled, the map becomes the
puzzle and can change during a run. Make rotation a scarce resource instead of absent or free.

## Planned improvements
Plots instead of rows/columns; twist tokens; streak and multi-plot multipliers; seasons that re-dig the plots; fair
dealing; garden identity; proper drag with lifted piece and landing preview; keyboard play.

## Implemented improvements
- **New clear rule**: the 8×8 bed is hedged into irregular plots (seeded growth from spread seeds, smallest-first, slivers
  merged). Plant every cell of a plot and it blooms and clears: 10 points per cell, × number of plots bloomed by the
  piece, × streak (consecutive blooming placements, up to ×4). Emptying the bed pays a bonus.
- **Twists**: tap a tray piece to rotate it 90° — it costs a twist token (start with 3, max 5, one earned per three plots
  bloomed). Symmetric pieces twist for free (nothing changes); a piece that only fits after a twist shows a twist badge.
- **Seasons**: every 8 blooms (10 in year two…) the season turns: the hedges cross-fade into a new layout of bigger
  plots (5 → 10 cells), anything that is already complete blooms as a ×1.5 re-dig bonus, the lawn/soil/hedge palette
  changes (spring, summer, autumn, winter) and heavier pieces (5-bars, big corners, 2×3, plus, 3×3) get likelier.
- **Fairness**: a fresh tray always contains at least one piece that fits; unplaceable pieces are dimmed; the run ends
  only when nothing fits and no affordable twist would help.
- **Controls**: drag from the tray — the piece grows to board scale and floats above the finger; a snapped preview shows
  the landing cells and every plot that would bloom glows; an invalid drop glides back. Keyboard: 1–3 select, arrows
  move, R/T twist, Space/Enter plant.
- **Identity and feel**: top-down garden (mown lawn, timber bed, tinted soil plots with hedges, round flower tiles in six
  colours); tiles pop in when planted, bloomed tiles swell, spin and fade with petal bursts and a ring; pentatonic
  ladder that climbs with the streak; calm puzzle music that gains layers with the seasons. `orient:"any"` with the tray
  beside the bed in landscape.

## Test results
- Smoke: pass.
- Gameplay test `tests/PhoneGameLab/53-plot-twist.test.js`: pass — plots partition the bed (≥3 cells each), mouse drag
  plants and scores, occupied drop refused, tap twists and spends a token, symmetric twist free, no token no twist,
  completing a plot clears it for exactly 10/cell, streak ×1.5 on the next bloom, season turn re-digs the plots, keyboard
  planting, clear-garden bonus, no-room game over with best recorded, clean restart.
- Balance probe (scripted, not in the suite): a random-placement bot dies after ~20 pieces; a one-ply greedy bot lasts
  44–52 pieces and reaches the third/fourth season with 2,300–2,500 points.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (mid-game with blooms, drag preview, season change, splash).
- Subjective assessment from scripted play only (no human playtest).

## Remaining issues
- Plot sizes after a re-dig vary a lot (3–11 cells); an occasional huge plot can feel unfair late on.
- Four soil tints separated by hedges read well, but colour-blind players rely on the hedges alone.
- Flower colour is cosmetic; a same-colour-plot bonus was considered and left out to keep the rules to three lines.
- The season change happens instantly under a banner; a short pause would make the re-dig easier to read.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Reading an irregular map and setting up double blooms is fresher than rows and columns |
| Mechanical depth | 8 | Plot geometry, streak timing, scarce rotations, re-dig bonuses |
| Game feel | 8 | Lifted drag, glowing would-bloom preview, petal bursts, chime ladder |
| Visual identity | 8 | A garden seen from above with four seasonal palettes; nothing like the source game |
| Animation quality | 7 | Plant pop, bloom swell/spin/fade, hedge cross-fade; tray deal is plain |
| Audio quality | 7 | Pitch by piece size and streak; music layers by season |
| Controls | 8 | Finger-offset drag with snap preview, tap twist, full keyboard |
| Onboarding | 8 | Three short lines; the first completed plot explains the rule |
| Replayability | 8 | New plot map every run and every season, score chase, escalating pieces |
| Performance | 9 | Board, tiles and lawn are baked; ≤ 64 sprites per frame |
| Technical robustness | 8 | Instant logic, clean restart, resize re-bakes, fair-deal guard |
| Overall polish | 8 | Cohesive loop with meaningful game-over stats |

## Next recommended action
Human playtest for season length and late plot sizes (consider capping plots at 9 cells); try a "bouquet" bonus for
plots planted in a single colour.
