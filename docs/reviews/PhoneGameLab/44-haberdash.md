---
id: PhoneGameLab/44-haberdash
title: Haberdash
was: 44-match-3 (Match 3)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Swap two adjacent pieces on a grid to line up three or more of a kind; matches clear, pieces fall, new ones arrive.

## Baseline assessment
61-line prototype: flat coloured circles on navy, tap-tap only, the board snaps to its new state on a `setInterval`
(no swap, clear or fall animation), no cascade feedback, no specials, no dead-board handling, 20 moves then "Done",
vertical matches double-count, gems can spawn pre-matched. Overall 2/10.

## Weaknesses identified
No objective beyond a counter; no identity; no motion; no reward for bigger matches; input that ignores drags; timers
outside the game clock; colour as the only discriminator.

## Creative opportunities
A sewing-box theme gives natural piece shapes (buttons), natural blockers (yarn tangles), a natural "jelly" layer
(holes to mend) and a natural level wrapper (an order ticket).

## Planned improvements
Proper phase machine (swap → clear → fall → cascade), specials for 4/L/5, order objectives with moves, reshuffle,
drag + tap + keyboard input with buffering, own denim-and-linen look, cascade audio ladder.

## Implemented improvements
- Original identity: stitched denim backdrop, a linen swatch as the board, kraft order ticket; six buttons that differ
  in shape as well as colour (disc, square, flower, hexagon, heart, star) with rims, holes and thread, all baked in code.
- Cascades: tiles really fall (gravity, squash on landing, per-column tap pitch), every cascade step multiplies the
  score, climbs a pentatonic ladder, raises the pop pitch and shows "Cascade ×n".
- Specials: 4-match → Ribbon (clears its row or column, arrow drawn along the line), L/T → Pin button (3×3), 5-match →
  Prism (swap with a colour to take all of it; if blasted it takes the most common colour); specials chain into each
  other and special+special swaps fire both.
- Objective structure: generated order tickets — collect colours, mend holes (match over torn cells), clear yarn
  tangles (match beside them) — with a move budget; collected pieces fly to the ticket and tick the counter down;
  spare moves pay 60 each; orders 1–4 teach one idea at a time, later orders mix goals with a rising work-per-move
  ratio and a sixth colour; an unfilled order ends the run.
- Dead boards: after every turn the game looks for a legal swap and reshuffles (animated, never into a ready-made
  match) when there is none; boards are dealt without matches and with at least one move.
- Controls: drag a button towards a neighbour (fires at a third of a cell), or tap-tap, or arrows + Space; a swap made
  during a cascade is buffered; bad swaps animate back for free; idle hint wiggle after 6 s; low-move warning pulse.
- Robust: all timing on the game clock, flat-array board with pure match/move finders, layout for portrait and wide
  stages, sprites re-baked on resize, self-playing attract board.

## Test results
- Gameplay test `tests/PhoneGameLab/44-haberdash.test.js`: pass — real drag match (move spent, board refilled, HUD
  score); non-matching swap undone for free; ribbon in a match clears its row and mends a hole; a 4-match creates a
  power button and fills the order → order 2 with spare-move bonus; keyboard swap; crafted dead board reshuffles into
  a playable one; touch tap-tap on the last move → game over, best recorded; clean restart.
- Smoke: pass (60 fps headless, survives resize/blur).
- Screenshots inspected at 390×844, 844×390, 1280×800 (deal, mid-cascade, specials + holes + tangles). Fixed: a draw
  bug that hid every button before the first swap, board wider than the phone stage, flower button reading as a star.
- Subjective assessment from code reading and scripted play, not a human playtest.

## Remaining issues
- Level budgets from order 5 on are calculated, not play-tuned; difficulty may be swingy with unlucky refills.
- No special+prism super-combos beyond "fire both"; no end-of-level conversion of spare moves into blasts.
- Ribbon art covers the button's holes; the pin button could read more clearly at 40 px cells in landscape.
- One mistake ends the run (no lives), which keeps sessions short but is strict.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Reliable genre loop with cascades that feel and sound rewarding |
| Mechanical depth | 7 | Specials, three goal types, move economy; combos are basic |
| Game feel | 8 | Swap/clear/fall phases, squash, fliers, shake and ladder scale with cascade |
| Visual identity | 8 | Denim, linen and buttons; shape-coded pieces; not another gem board |
| Animation quality | 8 | Falling, pop-out, special pop-in, reshuffle glide, hint wiggle |
| Audio quality | 7 | Cascade ladder and distinct special sounds; mostly engine presets |
| Controls | 8 | Drag, tap-tap, keyboard, buffered swap; all three verified by test |
| Onboarding | 8 | First order is one colour; holes and tangles each get their own order and hint |
| Replayability | 7 | Endless generated orders and score chase; single mode, no meta |
| Performance | 9 | 56 baked sprites, bounded particles and fliers |
| Technical robustness | 8 | Phase machine on the game clock, reshuffle, clean restart, resize-safe |
| Overall polish | 8 | Complete loop with ticket UI; a few art details could go further |

## Next recommended action
Human playtest of orders 5–10 to tune budgets; add prism+special combos and a spare-move "frenzy" at order end.
