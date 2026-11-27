---
id: PhoneGameLab/50-bolt-hole
title: Bolt Hole
was: 50-screw-puzzle (Screw Puzzle)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Tap coloured screws out of nine identical grey squares into three slots; three of a colour vanish. No plates ever moved,
nothing depended on anything else, and a full tray silently ignored taps.

## Baseline assessment
65-line placeholder: flat squares, hardcoded pixel layout, one beep, random deal with no solvability guarantee, no
feedback, no fail state, no persistence. Overall 2/10.

## Weaknesses identified
No physical logic (screws did not hold anything), no decisions beyond "tap what matches", could dead-end without telling
the player, no identity, no animation, no levels.

## Creative opportunities
Make the screws actually hold things: overlapping plates pinned through shared holes, burying each other, and a screw that
always has to go *somewhere* — so parking spots are the scarce resource and the order of work is the puzzle.

## Planned improvements
Layered plate model with shared holes; lift-and-park turns; generator + solver for guaranteed solvability and a true par;
turn budget with stars; undo/hint/restart; persistent levels; tactile acrylic-on-pegboard look with ratchet sounds.

## Implemented improvements
- **Rules**: a screw pins every plate whose hole it passes through; a solid part of a plate buries the holes and screws
  under it; lifting a screw drops any plate left without screws immediately (revealing holes); the screw must then be
  parked in an open empty hole — parking in a plate's own hole pins that plate again.
- **Generator + A\* solver**: every level is built from its number (plates stacked bottom-to-top so holes only sit over
  holes), solved with A\* (admissible heuristic: screws still pinning something) and the candidate closest to the level's
  target length is kept. Par is the proven optimum; generation takes 2–20 ms. Levels 1–30 measured: par 2 → 15.
- **Progression**: 3×4 board → 4×5 (lv 3) → 4×6 (lv 10); 1 → 6 plates; ten plate shapes; keyed sockets from level 6
  (brass-only / steel-only holes) and a third screw kind from level 13; levels that need a re-park are preferred.
- **Stakes**: turn budget (par + 34–50 %), live three-star read-out (3 = optimal), colour-zoned turn pips; out of turns =
  retry. Free undo (also refunds the turn), a solver-backed hint that caps the level at two stars, level browser arrows.
- **Feel**: screws unscrew as they rise (rotation tied to lift) with rising ratchet ticks, fly to the new hole and screw
  back in with a knock and ring; plates shudder when touched, sag on their last screw, hop and tumble off the board with a
  swish, thud and dust; valid holes pulse while a screw is held; buried screws answer with a red cross and a plate rattle.
- **Controls**: tap-tap, drag-and-drop (touch offset so the finger does not hide the screw), full keyboard (arrows +
  Space, Z undo, R restart, H hint). `orient:"any"`: the board transposes in landscape and controls move to the sides.
- **Persistence**: current level, highest unlocked and per-level stars in `Lab.store`; best = highest level cleared.

## Test results
- Smoke: pass (61 fps, resize/blur survived).
- Gameplay test `tests/PhoneGameLab/50-bolt-hole.test.js`: pass — lift/park costs a turn, undo by button and key, mouse
  drag, level 1 won by real taps along the solver's line (par → 3 stars, best recorded), next level loads clean, turn
  budget exhaustion loses, retry is clean, progress survives a reload, level 8 (keyed, 4×5) solved at par by taps, levels
  12/17/23 verified solvable with fast-solver par equal to the unpruned optimum.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (play mid-move with a falling plate, splash).
- Subjective assessment from scripted play and reading the levels only (no human playtest).

## Remaining issues
- Most generated levels have par equal to the screw count (+1 at best): the difficulty is choosing order and parking
  spots, not long shuffles. Hand-authored "aha" levels would be stronger than the generator's best pick.
- Deep stacks rely on translucency to show buried screws; three overlapping tints can get muddy.
- Difficulty plateaus around level 16 (par 11–15); no new element after the third screw kind.
- The solver hint shows one move, not the reasoning.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Each turn is a small physical decision; plates dropping is a steady reward |
| Mechanical depth | 7 | Order, parking and keyed sockets matter; few levels need long re-park chains |
| Game feel | 8 | Unscrew rotation, ticks, sag, tumble, thud; every tap answered |
| Visual identity | 8 | Tinted acrylic on cream pegboard, three distinct screw heads; unlike its siblings |
| Animation quality | 8 | Spring-damped plates, lift-linked rotation, eased fly-and-seat |
| Audio quality | 7 | Informative ratchet/knock/thud set; music is the stock funk groove, not reactive |
| Controls | 8 | Tap-tap, drag and keyboard; generous hit radius; free put-back |
| Onboarding | 8 | Level 1 is two taps with a pulsing first screw; rules appear one at a time |
| Replayability | 7 | Endless generated levels, star chase, level browser; plateau after ~16 |
| Performance | 9 | Baked plate/screw/hole sprites; generation ≤ 20 ms |
| Technical robustness | 8 | Logic is instant and animation cosmetic; clean restart, resize re-bakes, persistence tested |
| Overall polish | 8 | Complete loop with next-level card, stars and stats |

## Next recommended action
Human playtest of levels 6–15 for difficulty; add a tightness metric (share of first moves that keep par reachable) to the
generator's scoring, and one more late mechanic (e.g. a plate that must fall last).
