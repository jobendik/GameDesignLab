---
id: PhoneGameLab/46-live-wires
title: Live Wires
was: 46-connect-dots (Connect Dots)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Listed as "draw paths to link same-coloured dots without crossing, filling the board". The 44-line prototype was actually
a different toy: a 6×8 grid of random coloured circles where dragging through same-coloured neighbours removed them for
`length²` points, with no end, no goal and no levels.

## Baseline assessment
Flat circles on a navy rectangle, hardcoded pixel offsets, no splash metadata, no fail/win state, no best score, one
beep, drag input that silently ignored fast movements. Overall 2/10.

## Weaknesses identified
No puzzle (random board, nothing to solve); no progression; no feedback beyond a line; no undo; layout broke off 390 px;
identity was "generic dots".

## Creative opportunities
Make it the routing puzzle the catalogue promised, with a guaranteed-solvable generator, and give routing a physical
home: a single-layer circuit board is exactly a "no crossings, use every pad" problem.

## Planned improvements
Generator that builds a full routing first; live re-routing (crossing cuts, backing off restores); stroke par and stars;
persistent level progress with level select; undo / clear / hint; PCB identity with travelling pulses on live wires.

## Implemented improvements
- **Generator**: starts from a board tiled with straight wires and mutates it ~3–8k times (an end steals the neighbouring
  end of another wire, wires merge end-to-end or split), keeping a full, non-self-touching cover at every step, so every
  board is solvable and reads cleanly. Best of five candidates by bend count; seeded by level number (board 12 is always
  the same board). 18 hand-tuned size/pair steps (4×4/3 pairs → 7×9/7 pairs), then endless 7×9.
- **Drawing**: drag from a terminal or from anywhere on an existing wire; the head walks pad-by-pad toward the finger so
  fast drags never skip; backtracking shortens; crossing another wire cuts it *tentatively* (it snaps back if you
  retreat); looping onto yourself trims the loop; a rubber lead follows the finger past the last pad.
- **Depth**: stroke par (one stroke per wire = ★★★, +2 = ★★); inline bulbs that only accept their own colour on bigger
  boards; hint lays one correct wire (animated) and costs a star; undo per stroke, clear, level select (‹ ›, arrows).
- **Identity**: matte-green PCB with etched decorative traces and silkscreen labels, gold terminals with a glyph per
  colour (never colour-only), enamel wires with highlight + drop shadow, white pulses that travel along every live wire,
  pad tinting that shows coverage, "cover every pad" rings on forgotten pads, tutorial ghost dot on board 1.
- **Audio**: ticks that rise in pitch with wire length, two-note "contact" on linking, snap + sparks on a cut, chime on
  a bulb, pentatonic chase on power-up; puzzle music whose intensity follows board coverage.
- **Loop**: win card per board (board number as score → best = highest board cleared, strokes/par, rating, total stars),
  "Next board" continues; progress in `Lab.store`. `orient:"any"` with a transposed board + side panels in landscape.

## Test results
- Smoke (`tools/smoke.js 46-live-wires`): pass, 61 fps headless, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/46-live-wires.test.js`): pass — real mouse drags lay wires, crossing cuts, undo /
  clear, full solve → win + 3 stars + progress saved, next board clean, hint → 2 stars, level select.
- Screenshots inspected at 390×844, 844×390, 1280×800 (boards 1, 11, 17, splash, win card), two rounds.
- Subjective assessment from scripted play and code reading only (no human playtest).

## Remaining issues
- Solutions are not checked for uniqueness; a board can have a second valid routing (any full cover wins, so it is never
  unfair, but a hint may contradict a valid partial routing).
- No bridges/holes; late boards vary only by seed, pair count and bulbs.
- The splash dims the attract board so much that the live demo behind it is barely visible.
- HUD shows "Lv n" and the board label repeats it.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Proven routing loop; boards are clean and solvable, from 20 s (4×4) to a few minutes (7×9) |
| Mechanical depth | 7 | Real deduction on big boards, stroke par, bulbs; no bridges or special tiles |
| Game feel | 8 | Head follows the finger within a frame, rubber lead, tentative cuts, pops, pulses |
| Visual identity | 8 | PCB look is distinct in the collection; glyph + colour terminals |
| Animation quality | 8 | Pad tint easing, travelling pulses, terminal pops, animated hint, board intro |
| Audio quality | 7 | Informative pitch ladder and distinct events; no continuous "current" bed |
| Controls | 8 | Drag-anywhere, fast-drag walking, 48 px buttons, keyboard shortcuts, mouse + touch |
| Onboarding | 8 | Ghost dot demonstrates the first wire; "cover every pad" explains the second rule when hit |
| Replayability | 7 | Endless seeded boards, stars to perfect; no daily/timed mode |
| Performance | 9 | ≤ 63 pads, ≤ 9 wires, baked background; generator < 10 ms |
| Technical robustness | 8 | Clean reload/restart, resize cancels a stroke and transposes the board, progress persisted |
| Overall polish | 8 | Cohesive splash → board → card → next board |

## Next recommended action
Human playtest of the difficulty curve; add a uniqueness filter (small solver) and bridge tiles for late boards.
