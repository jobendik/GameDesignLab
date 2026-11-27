---
id: PhoneGameLab/59-purlwise
title: Purlwise
was: 59-nonogram (Nonogram)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Picture-logic (nonogram): fill grid cells so the runs in every row and column match the number clues.

## Baseline assessment
53-line prototype: one 5×5 board of random noise (often several solutions, never a picture), tap-to-fill with a
`setTimeout` long-press for crosses, multi-line column clues drawn with `\n` (which canvas ignores), win only on the
exact hidden random board, grey squares, one beep. 2/10.

## Weaknesses identified
Ambiguous puzzles; no drag input; no picture, so no payoff; broken clue rendering; no undo, hint, sizes, progress or
identity.

## Creative opportunities
A nonogram grid *is* a knitting chart: filled cells become V stitches, the reveal becomes a swatch in variegated yarn,
and symmetric procedural motifs look like real Fair Isle patterns.

## Planned improvements
Authored pictures + procedural motifs, all proven by a line solver; stroke input with line lock; non-spoiling
feedback with optional checking; hint from the same solver; undo/clear; stars, times, persistence; knit identity.

## Implemented improvements
- 27 authored pictures (5×5, 7×7, 8×8, 10×10) interleaved with generated 8-way symmetric motifs (6×6, 8×8, 9×9), then
  endless 10×10 motifs after pattern 30. Every puzzle is accepted only if row/column logic alone solves it, which
  also proves the solution unique (authored set filtered offline; motifs proven at load, < 7 ms).
- Strokes: press a cell and drag — the stroke locks to the row or column it set off along, paints only empty cells
  (or erases only its own kind if it began on one), plays a rising scale and shows a run-count bubble above the
  finger. KNIT / SKIP toggle (X or Space on keyboard).
- Feedback that doesn't spoil: a line whose runs read like its clue dims and auto-skips its gaps (compared with the
  clue, never the answer). CHECK is an opt-in toggle: a wrong stitch is caught immediately and counts as a slip.
- Hint: removes a wrong mark if there is one; otherwise highlights the line that forces the most and places one of
  its forced cells. Undo (80 strokes), clear (undoable). ★★★ = no slips or hints.
- Reveal: clues and grid fade, stitches recolour along a diagonal wave into a two-colour variegated yarn with a
  pentatonic run, corner confetti, and a woven name tag pops in before the win card.
- Identity: baked cranberry knit backdrop, oatmeal swatch with running-stitch border, chunky teal V stitches,
  mustard trim, dream music whose intensity follows finished lines.
- Progress, stars, best times, the CHECK option and the chart in progress all persist; ‹ › revisit patterns.
- Onboarding: the first three patterns carry one-line tips and the full-line clue pulses on pattern 1.

## Test results
- Smoke: pass (60 fps headless, no errors, survives resize/blur).
- Gameplay test `tests/PhoneGameLab/59-purlwise.test.js`: pass — 45 patterns proven line-solvable, stroke + line
  lock, skip/erase/undo, CHECK slip, hint correctness, reload persistence, win by real strokes, rating, clean next
  pattern, clean 3★ solve.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (early play, 10×10 mid-play, reveal).
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- 10×10 cells are ~28 px on a 390 px phone (strokes are forgiving, single taps less so); no zoom.
- Line-solvable only: no puzzles needing look-ahead, so experts will find the ceiling low; nothing above 10×10.
- Pictures are single-colour silhouettes until the reveal; motifs are abstract.
- Portrait leaves unused space above/below big charts because width is the limit.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Fair logic puzzles with a picture payoff every 1–4 minutes |
| Mechanical depth | 7 | Genuine deduction; optional checking; line-logic ceiling |
| Game feel | 8 | Locked strokes, per-stitch notes, count bubble, pops, line chimes |
| Visual identity | 8 | Knitting chart look is specific and consistent |
| Animation quality | 7 | Stitch pops, clue pulses, diagonal recolour wave, name tag |
| Audio quality | 7 | Stroke scale, line chimes, reveal run; reactive dream music |
| Controls | 8 | Drag/tap, tool toggle, keys, undo; small cells at 10×10 |
| Onboarding | 7 | Tips on the first three patterns; rules still need a moment |
| Replayability | 8 | 30 curated patterns then endless motifs; stars and best times |
| Performance | 9 | Baked sprites; solver < 7 ms |
| Technical robustness | 8 | Reload restores the chart; clean level changes; resize re-lays out |
| Overall polish | 8 | Cohesive, including a live demo behind the splash |

## Next recommended action
Human playtest of the 10×10 touch precision; consider pinch/zoom or a magnifier, and multi-colour pictures.
