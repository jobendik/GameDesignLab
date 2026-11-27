---
id: PhoneGameLab/60-petal-count
title: Petal Count
was: 60-sudoku (Mini Sudoku)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Mini sudoku: fill a 4×4 grid so each row, column and 2×2 box holds 1–4. Tap a cell, then a number.

## Baseline assessment
60-line prototype: one fixed solution with rows/columns swapped, eight random cells blanked (often several valid
answers, though only "any valid grid" was checked), no notes, no undo, no timer, grey grid, one beep. 2/10.

## Weaknesses identified
Ambiguous puzzles, one tiny size, no pencil marks, no feedback on clashes, hard-coded layout, no identity, no best.

## Creative opportunities
Replace digits with flowers whose *petal count is the number*: one drawing function yields nine distinct, countable,
colour-coded symbols, and a planter with timber-edged beds explains the box rule without a word.

## Planned improvements
Real generator with unique, guess-free puzzles at 4×4 / 6×6 / 9×9; notes; clash and optional mistake feedback;
explanatory hint; both input orders; per-size best times; saved beds; garden identity with a digit toggle.

## Implemented improvements
- Generator: a random solved grid (MRV backtracking) is dug out cell by cell while a singles-only solver (hidden +
  naked singles) can still finish it — so every bed has exactly one solution and never needs a guess. 4×4 keeps 5
  givens, 6×6 about 10, 9×9 about 29; worst measured generation < 10 ms.
- Flowers: 1–9 petals in nine colours from one function; each value also has its own pitch when planted. A
  1·2·3 toggle overlays digits (and switches seeds to digits); the palette shows how many of each remain.
- Input: tap a cell then a flower, or tap a flower first to "arm" it and plant it cell after cell; arrows + digit
  keys, Z undo, N seeds, H hint, Backspace erase.
- SEEDS (pencil marks) in a mini grid per cell; planting clears that seed from the row, column and bed.
- Feedback: selected row/column/bed tinted, same flowers ringed; clashes always get a dashed red ring; completed
  rows/columns/beds flash with a rising arpeggio. CHECK (opt-in) wilts a wrong flower and counts a slip.
- Hint: removes a wrong flower if there is one, otherwise plants the next forced flower, highlights its unit and
  says why ("its only spot in this row").
- Undo (200 steps), erase, NEW BED with a confirm tap; each size keeps its own bed in progress across reloads.
- Clock in the HUD; best time per size in storage (shown beside the tabs); the 6×6 time is the engine best
  (`lower:true`). First win on 4×4 steers the next run to 6×6.
- Identity: striped spring lawn with daisies, timber planter, dark soil; bloom wave + petals on a win; puzzle music
  whose intensity follows how full the bed is. Live self-planting bed behind the splash.

## Test results
- Smoke: pass (60 fps headless, no errors, survives resize/blur).
- Gameplay test `tests/PhoneGameLab/60-petal-count.test.js`: pass — 30 generated boards proven unique, guess-free
  and valid; cell→flower and flower→cell planting; clash flag; undo; seeds + auto-clear; CHECK slip; erase; hint;
  reload persistence; 4×4 win by taps; 6×6 win by keyboard with best time recorded; size tabs keep beds.
- Screenshots inspected at 390×844 (4×4, 6×6 digits + check, 9×9 with seeds) and 844×390 (6×6 play, win card);
  1280×800 captured but only the shared layout path was reviewed.
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- Singles-only puzzles are easy for sudoku regulars; there is no harder tier (pairs, pointing).
- 7/8/9 petals are told apart mostly by colour at 9×9 phone size (the digit toggle covers this).
- 9×9 palette buttons are 38 px wide on a 390 px phone — under the 44 px guideline.
- The engine has one best slot, so only the 6×6 time appears on the splash/HUD; other sizes show theirs in-game.
- A 9×9 takes far longer than the 1–3 minute target (it is saved, but it is not a "minigame" session).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Fair, quick logic puzzles with a charming skin |
| Mechanical depth | 7 | Three sizes, notes, optional checking; singles-only ceiling |
| Game feel | 8 | Flowers pop in with their own note, unit flashes, bloom wave |
| Visual identity | 8 | Petal-count flowers in a timber planter — not a grey grid |
| Animation quality | 7 | Grow-in, unit pulses, swaying bloom; modest otherwise |
| Audio quality | 7 | Value-pitched planting, arpeggios, reactive puzzle music |
| Controls | 8 | Two input orders, full keyboard, undo/erase; small 9×9 palette |
| Onboarding | 8 | 4×4 first with a one-line rule; hints explain themselves |
| Replayability | 8 | Endless boards, three sizes, best times |
| Performance | 9 | Sprites cached; generation < 10 ms |
| Technical robustness | 8 | Beds persist per size; clean restart; resize re-lays out |
| Overall polish | 8 | Cohesive; win cards differ slightly between sizes |

## Next recommended action
Add a "tricky" tier (allow pairs/pointing in the generator's solver) and human-test flower legibility at 9×9.
