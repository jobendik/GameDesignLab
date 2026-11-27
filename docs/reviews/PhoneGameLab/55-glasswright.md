---
id: PhoneGameLab/55-glasswright
title: Glasswright
was: 55-laser-mirror (Laser Mirror)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Tap mirrors on a grid to flip them between "/" and "\" so a laser from one corner reaches a target in the other.

## Baseline assessment
54-line prototype: five mirrors scattered at random on a fixed 6×6 grid with no check that any arrangement reaches the
target (most boards were unsolvable or already solved), a 2 px red polyline for the beam, grey wireframe grid, one beep,
no levels, scoring or persistence. Overall 2/10.

## Weaknesses identified
No solvability guarantee; no level structure or difficulty curve; the beam did not read as light; mirrors snapped with no
tactility; one mechanic only; no identity; fixed portrait layout.

## Creative opportunities
Make the light the star (additive beams that blend), make mirrors feel like objects you swivel, and grow the rule set
slowly — colours, split glass, tinted panes, ring pairs, blended colours — on boards built backwards from a solution.

## Planned improvements
Constructive generator with a traced proof; four-position swivel mirrors (tap or drag) where edge-on lets light pass;
RGB bitmask colours; par on mirrors touched; undo/restart/hint; brass-and-glass night-workshop identity; persistence.

## Implemented improvements
- **Light model**: beams carry an R|G|B mask, are traced through mirrors (— \ | /), splitters (reflect + pass), tinted
  panes (mask), ring pairs (teleport) and blocks, with loop protection; lanterns light only on *exactly* their colour, so
  two beams can blend (red + blue → magenta) or spoil each other.
- **Generator**: walks each beam from its lamp, laying turns, a splitter branch, panes and rings on cells no earlier
  beam uses, joins a second beam onto an existing lantern for blends, adds edge-on "slip past" mirrors on beam paths,
  decoys and blocks, scrambles the swivels, then *traces the stored solution* and rejects anything unsolved, already
  solved or trivial. ≤ 2 ms per bench; endless from the level number. Curve: 1 mirror → 13 pieces across benches 1–24,
  one new idea every four benches, 5×6 → 6×9.
- **Tactile mirrors**: tap = 45° clockwise with a pop and a click pitched by angle; or grab the bar and drag it round —
  it follows the finger, the light updates live and the win waits for release. Keyboard: arrows select, Space turns.
- **Par + stars**: par = mirrors that start wrong; consecutive turns of one mirror count as one touch; ≤ par ★★★,
  par+2 ★★, hint caps at ★★. Undo reverts a whole touch, restart resets the bench, hint rings one wrong mirror with a
  ghost of its solved angle. Stars and unlocked benches persist; prev/next to replay.
- **Look + sound**: beams are three additive strokes with travelling pulses and landing flares, so overlaps genuinely
  mix; brass lamps, silvered bars on brass pivots, glass panes, lanterns that bloom with rotating rays; R/G/B pips on
  lamps, panes and lanterns so colour is never the only cue; a wrong-coloured lantern shows what it is getting, crossed
  out. Pentatonic chime per lantern (pitch = which lantern), dream music whose layers follow lanterns lit.
- **Layout**: board transposes in landscape with a side panel; splash backdrop is the game solving itself.

## Test results
- Smoke (`node tools/smoke.js 55-glasswright`): pass, 61 fps headless.
- Gameplay test (`tests/PhoneGameLab/55-glasswright.test.js`): pass — mouse drag swivels both ways, live light during a
  drag with the win held until release, undo, par win → 3 stars + saved progress, hint + 2-star cap, grouped touches,
  wasted touches → 1 star, restart, keyboard solve, and benches 13/17/21/24 (splitter, panes, rings, blending) solved
  with touch taps with every lantern receiving exactly its colour.
- Generator swept for benches 1–40 (all built first-pass, worst 2 ms). A sweep caught a real bug (a pane before the
  splitter could zero a branch and create a lantern needing "no colour"); fixed and re-swept.
- Screenshots inspected at 390×844, 844×390, 1280×800 (splash, benches 1/15/20/24).
- Subjective assessment is from code + scripted play, not a human playtest.

## Remaining issues
- Mirrors never move, only swivel: late benches get busier rather than deeper, and trial-and-error can solve them
  (par is what demands thought).
- Par is the generator's solution, not a proven optimum — occasionally an alternative solution beats it.
- A splitter turned flat is hard to tell from a mirror at a glance on 6-wide boards (only the cyan gem differs).
- Bench 1 is solved by a single tap (deliberate, but very slight).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Turning glass and watching light re-route is satisfying from the first tap |
| Mechanical depth | 7 | Five piece types, edge-on trick, exact colour blending; swivel-only puzzles |
| Game feel | 8 | Drag-to-swivel with live light, pops, clicks, lantern blooms |
| Visual identity | 8 | Brass + glass on plum felt, additive light that mixes — reads from a thumbnail |
| Animation quality | 7 | Eased swivels, pulses along beams, lantern rays; no beam "travel" on change |
| Audio quality | 7 | Pitch-coded clicks and lantern chimes, reactive dream music |
| Controls | 9 | Tap, drag or keyboard; ≥ 57 px cells; undo/restart/hint |
| Onboarding | 8 | One-tap first bench, one tip per new piece, pips explain colours |
| Replayability | 7 | Endless benches, star chase; no editor/daily |
| Performance | 9 | ≤ 40 segments, baked glow sprites and background |
| Technical robustness | 8 | Solution-traced generator, clean reload/restart/resize |
| Overall polish | 8 | Cohesive; splitter legibility is the main blemish |

## Next recommended action
Add draggable (placeable) mirrors from a tray for benches 25+, and compute a true optimum for par with a small search.
