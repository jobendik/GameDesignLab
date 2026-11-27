---
id: PhoneGameLab/51-slidescape
title: Slidescape
was: 51-15-puzzle (15 Puzzle)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
The classic sliding-tile puzzle: a 4×4 tray of numbered tiles with one gap; tap a tile next to the gap to move it.

## Baseline assessment
42-line placeholder: flat blue squares with numbers, hardcoded layout, tiles teleport, one beep, a single board size,
one tile per tap, no par, no persistence, no keyboard. Solvable (shuffled by legal moves) but joyless. Overall 2/10.

## Weaknesses identified
No hook beyond the bare genre; no feel (teleporting tiles); no difficulty curve (always a deep 4×4 shuffle, a brutal first
ten seconds); nothing to look at; no reason to play twice.

## Creative opportunities
Turn the tiles into pieces of a picture the game paints itself; make sliding tactile (tiles follow the finger, whole
lines move); grade efficiency; start five slides from solved and grow to 5×5 with tiles that cannot move.

## Planned improvements
Procedural scenes, line slides as one move, drag/tap/keys, par and stars, level ladder 3×3 → 5×5 with bolted tiles,
persistence of level/stars/board, peek + number assists, gallery identity.

## Implemented improvements
- **Pictures drawn in code**: four families of flat paper-cut scenes (harbour with lighthouse and sailboats, night skyline,
  balloon sky over snow peaks, meadow with cottage, day or dusk) seeded by level number; each framed and hung on a dusky
  gallery wall with a spotlight. Tiles are baked sprites cut from the scene with a glazed bevel.
- **Line slides**: tapping or dragging any tile in the gap's row/column moves the whole line and counts as one slide —
  planning lines is how par is beaten. Tiles follow the finger along their axis, commit past 30 % (or on a tap) and
  spring back otherwise. Arrow keys work too.
- **Readability assists**: the gap shows a ghost of the missing piece; tiles that are home carry a gold pip and play the
  next note of a rising scale; *Peek* flashes the finished picture; *123* overlays tile numbers (remembered).
- **Curve**: scene 1 is five moves from solved; then 12, then full 3×3 shuffles; 3×4, 4×4, 4×5, 5×5; from scene 8 some
  tiles are bolted in place and block line slides; after scene 10 a six-step loop of large boards with 0–2 bolts.
  Shuffles are seeded walks of legal moves from the solved board (never reversing), so every board is solvable.
- **Scoring**: par from the shuffle (walk groups + 2 for shallow boards, 1.5 × Manhattan + 10 for full ones); 3 stars at
  par, 2 within 150 %; timer; undo refunds; per-scene stars, highest scene and the board in progress persist.
- **Finish**: seams dissolve into the whole picture, a sheen sweeps the glass, star bursts at the corners, then the win
  card with slides/par, time and stars and a "Next scene" button.

## Test results
- Smoke: pass.
- Gameplay test `tests/PhoneGameLab/51-slidescape.test.js`: pass — out-of-line tap refused, two-tile line slide = one
  move, undo by button and key, short drag springs back / long drag commits (mouse), arrow keys, number and peek toggles,
  scene 1 solved through real taps along a BFS solution, win card + best recorded, next scene clean, board in progress
  survives reload, reset, and all 18 first shuffles pass the permutation-parity solvability test (sizes and bolts checked).
- Screenshots inspected at 390×844, 844×390 and 1280×800 (play on three scene families, numbers overlay, bolted tile,
  splash).
- Subjective assessment from scripted play only (no human playtest).

## Remaining issues
- Par for full shuffles is a heuristic, not an optimum; three stars on 5×5 may be too hard or too easy for real players.
- Night-skyline and open-sky tiles can look alike; the 123 overlay is the intended answer but it is off by default.
- No fail state and no time pressure: it is a calm puzzle and lives on its star chase.
- Portrait layout leaves spare wall above and below a square board on tall phones.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | A sliding puzzle at heart, but watching a scene assemble and beating par with line slides is pleasant |
| Mechanical depth | 7 | Line slides, bolted tiles and par add planning to a known genre |
| Game feel | 8 | Finger-following tiles, spring-back, clack, home chime ladder, finishing sheen |
| Visual identity | 8 | Code-painted paper-cut scenes in a hung frame; unlike anything else in the lab |
| Animation quality | 8 | Damped slides, home pop, picture dissolve and sweep |
| Audio quality | 7 | Slide pitch by line length, rising home notes; music not state-reactive |
| Controls | 9 | Tap, drag, line slide, arrows, undo; generous and forgiving |
| Onboarding | 8 | First scene needs five obvious slides; ghost in the gap shows the goal |
| Replayability | 7 | Endless seeded scenes, stars, growing boards; no modes beyond that |
| Performance | 9 | Everything baked; ≤ 25 sprites drawn per frame |
| Technical robustness | 8 | Logic instant, animation cosmetic; resume, reset, resize and reload tested |
| Overall polish | 8 | Complete, cohesive loop |

## Next recommended action
Human playtest to calibrate par on 4×4/5×5; consider turning numbers on automatically after a minute without progress.
