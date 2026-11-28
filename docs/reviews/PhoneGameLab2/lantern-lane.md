---
id: PhoneGameLab2/lantern-lane
title: Lantern Lane
was: connect / "Connect"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A fixed 5×5 grid with four pairs of coloured dots; drag a path from a dot to its twin; paths may not cross; the board is
solved when all pairs are linked and every cell is covered.

## Baseline assessment
~45 lines, one hard-coded puzzle, no metadata or IIFE, no feedback, no sound, `Lab.win("Solved!")` with a string.
Mechanically identical to the finished siblings' genre (Live Wires in PhoneGameLab, Sweet Circuit in progress here).

## Weaknesses identified
- One puzzle, no progression, no reason to replay.
- Same rules as Live Wires (non-crossing, cover-the-board), so it would be a duplicate.
- No character, no fiction, no failure state.

## Creative opportunities
- Keep "drag a path from each thing to its match" but move the puzzle from space to **time**: paths may cross; the
  pals then all walk at once, one stone per beat, and must never meet.
- Waits as a second tool: a pal that waits a beat changes every crossing downstream.
- Olli (the bookish puzzle-solver, night-time) as the guide; the other five pals as the walkers, each with a house.

## Planned improvements
Simultaneous-walk rule with meet/head-on collisions; per-pal waits; 12 generated nights that are guaranteed solvable
and guaranteed to trap the obvious routes; lanterns as lives; fireflies, first-try and tidy-route bonuses.

## Implemented improvements
- **Rules**: drag from a pal to the cottage with their face (backtrack by dragging back; drag from a pal again to
  redraw; grab any stone of a path to cut it there). Paths may cross and share stones; other pals' houses block.
  Press Walk (or Enter/Space): everyone steps together. Two pals on one stone on the same beat, or swapping stones
  head-on, BUMP: both go dizzy, a lantern goes out, the spot is ringed in red and the beat numbers of the two paths
  are shown so you can see why. Paths are kept for the retry. Tap a pal to cycle a 0–3 beat wait.
- **Generator** (instant): places hedges/ponds/lamps, then plans each pal's path through a time-indexed reservation
  table (no shared stone per beat, no head-on swaps, houses never on other paths), puts the houses at the path ends,
  and keeps the night only if the BFS-shortest routes with no waits *would* bump. Night 1 is the tutorial exception.
  Ramp: 2 → 5 pals, 5×6 → 7×9 boards, longer routes, built-in waits from night 4.
- **Scoring**: 100 + 20 × night; fireflies (night 5+, placed off the obvious routes) +30 each; first try +50 and a lantern
  back (cap 3); tidy routes (total beats ≤ the generator's solution) +40. 12 nights → `Lab.win`; 0 lanterns → game over.
- **Actors**: pals look toward home, `think` while their path is drawn, hop with their own note each beat while walking,
  carry lanterns (prop on the hand anchor), go dizzy on a bump, cheer on a clear; the house window shows the owner
  sleeping (dark) and lights up with a happy face when they arrive. Olli on a signpost talks in a bubble (tips per night,
  who bumped and why, bonus breakdown) and follows your finger.
- Identity: indigo village night, lavender cobbles, round hedges with berries, moon-reflecting ponds, flickering lamps,
  cottages roofed in each pal's colour; dreamy music that rises during a walk. Landscape transposes tall boards and moves
  Olli + buttons to a side panel.
- Live attract scene: generated nights solved and walked automatically.

## Test results
- Smoke (`node tools/smoke.js lantern-lane`): pass.
- Gameplay test (`node tools/run-tests.js lantern-lane`): pass three times in a row (28 s). Real mouse drags draw every
  path (backtrack verified), Walk refused while incomplete, the solution clears night 1 and scores (HUD agrees), night 2's
  shortest routes bump (lantern lost, mark set, paths kept), taps cycle waits, the solution clears night 2 on the
  second try, repeated bumps on night 3 empty the lanterns and end the run, best recorded, Enter restart is clean.
- Generator check: all 12 nights build in ≤ 2 ms; naive routes collide on every night ≥ 2 (asserted by the test for 2–3).
- Screenshots inspected at 390×844, 844×390, 1280×800 (planning with beat numbers, a bump, splash). Fixed: bubble text
  overflow in the narrow landscape panel (now measured and shrunk), wrapping how-to lines, a non-font pause glyph.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Difficulty is shallow for puzzle fans: most nights need one wait or one detour; the generator does not grade puzzles
  by how many conflicts the obvious routes have.
- Landscape panel is roomy on desktop but Olli is small at 844×390.
- No undo beyond backtracking/redrawing; no per-night star record or level select.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | The "everyone moves at once" reveal is satisfying; bumps are funny rather than punishing |
| Mechanical depth | 6 | Timing + waits + detours is a genuinely different puzzle; nights rarely need more than 1–2 fixes |
| Game feel | 7 | Per-beat hops and notes, bump stars/shake/hit-stop, house windows lighting up |
| Visual identity | 8 | Cozy night village with face-windowed cottages; reads instantly and differs from both siblings |
| Animation quality | 7 | Eased steps, bob, hop, bubble pop, pulsing Walk button; static board otherwise |
| Audio quality | 6 | Each pal its own pitch, chime on completion, combo on arrivals; stock presets |
| Controls | 7 | Drag/backtrack/cut, tap for waits, Enter/Space and R; diagonal flicks resolved to a walkable step |
| Onboarding | 7 | Olli's per-night tips introduce one idea at a time; bump explains itself with marks and beat numbers |
| Replayability | 6 | Generated nights and bonuses; a 12-night run is the same structure each time |
| Performance | 8 | Board baked per night; ~10 Pals.draw calls per frame |
| Technical robustness | 8 | Clean restart, resize re-lays out (and transposes), no errors in three runs |
| Overall polish | 7 | Full loop with win and lose, attract scene, explained bonuses |

## Next recommended action
Grade generated nights by the number of conflicts in the obvious routes and add a late mechanic (one-way gates or a
bridge that only one pal may use per beat) for nights 9–12.
