---
id: PhoneGameLab/43-plumpling
title: Plumpling
was: 43-2048 (2048)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Swipe to slide every tile on a 4×4 board; equal tiles merge; one new tile per move; lose when nothing can move.

## Baseline assessment
58-line prototype carrying a commercial game's name, numbers and rules: tiles teleport (no slide or merge animation),
hue-coded flat squares, swipe only on release, one beep, no undo, no keyboard, no best score, hard-coded pixel layout.
Overall 2/10.

## Weaknesses identified
No identity of its own; no motion at all, which is the whole pleasure of the genre; nothing to aim for except "bigger";
no forgiveness; very long flat sessions.

## Creative opportunities
Make sliding tactile (squash on the wall, pop on merge); let merges cascade so one swipe can sing; give the board a
*place* that matters so position is a goal, not just a habit; make failure pressure come from the player's own misses.

## Planned improvements
Tiers 1,2,3… instead of powers of two; chain squish; guest orders on a gold plate with a move budget; burnt dumplings
for missed orders; undo charges; buffered swipes; rush that raises arrivals; own lacquer-tray look and sound.

## Implemented improvements
- Original identity: aubergine cloth with a wave pattern, dark lacquer tray with a gold line, pastel dumplings with
  faces and their size number (gold rim from size 7), a fussy cat guest who sweats, scowls and hops; all drawn in code.
- Silky motion: every tile is an object that slides (ease-out, 110 ms) with stretch in flight, squashes against what
  stops it, pops on merge and springs in when it arrives; a blocked swipe bumps the whole tray and costs nothing.
- Twist 1 — chain squish: merging is a stack rule, so `1 1 2 3` collapses into one `4` in a single swipe; link *n* pays
  ×n and plays the next note up (one note per link, pitched by size), with "×3" popups and light shake.
- Twist 2 — orders: the guest wants one exact size resting on the gold plate within a move budget (badge on the plate
  shows size + remaining-move arc; the card repeats it with a bar). Serving removes the dumpling (space!), pays
  4×size + 2 per spare move and, every second order, an undo charge. A missed order leaves a burnt dumpling that only
  clears by sliding two burnt ones together. Plates start on edge cells and move inward after five orders.
- Curve: orders climb 3,3,4,3,4,5… with budgets 10→330; one arrival per move, alternating one/two after two orders,
  always two after six ("Rush hour"), with more 2s and the odd 3 among arrivals.
- Forgiveness/controls: swipes fire after 26 px (not on release), arrows/WASD, three-deep swipe buffer during the
  slide, undo button (touch/mouse) or U/Z/Backspace with up to three charges.
- Robust: rules are a pure `plan(dir)` → apply; logic resolves instantly while visuals catch up (events are flushed
  when the next move starts); layout for portrait and wide stages; sprites re-baked on resize; live attract board.

## Test results
- Gameplay test `tests/PhoneGameLab/43-plumpling.test.js`: pass — real mouse swipe chain-merges `1 1 2 3 → 4` for
  exactly 68; blocked swipes are free; keyboard move serves an order with the right payout and a new plate; an expired
  order burns; two burnt crumble; touch tap on Undo restores tray and score; jammed tray → game over, best recorded;
  clean restart.
- Smoke: pass (60 fps headless, survives resize/blur).
- Balance probe: a greedy bot that ignores orders (12 seeded runs) jams after 52–133 moves with 4–11 burnt — ignoring
  the guest is what kills you; no human tuning beyond that.
- Screenshots inspected at 390×844, 844×390, 1280×800 (splash + mid-game). Fixed: toasts covering the Undo button
  (messages now live in the order card), two-line how-to rows.
- Subjective assessment from code reading and scripted play, not a human playtest.

## Remaining issues
- Undo does not restore the random arrivals, so it can be used to re-roll a spawn.
- Portrait leaves ~120 px unused under the Undo button; the tray is width-limited there.
- Dumplings do not blink or react to danger; the guest carries all the character animation.
- Late-game (orders of 8+) is untested by humans; budgets there are estimates.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Big chain swipes feel great; orders give every few moves a purpose |
| Mechanical depth | 8 | Corner-building vs. plate positioning vs. burnt clean-up; undo economy |
| Game feel | 8 | Slide/stretch/squash/pop, rising chain notes, bump on blocked moves |
| Visual identity | 8 | Lacquer tray + pastel dumplings + cat guest; nothing like the source game |
| Animation quality | 8 | Per-tile easing, serve fly-off, plate pop-in, guest moods |
| Audio quality | 7 | Informative chain ladder and serve/burn cues; tile sounds are engine presets |
| Controls | 9 | Early-fire swipes, keys, buffer, undo; verified with mouse, touch and keyboard |
| Onboarding | 7 | First order is an easy 3 with a sticky hint; orders still need the how-to line |
| Replayability | 8 | Random plates/arrivals, escalating orders and rush tiers, score + chain chase |
| Performance | 9 | ≤ 20 sprites; everything baked |
| Technical robustness | 8 | Pure rules, flush-on-move, tested undo/jam/restart, resize-safe |
| Overall polish | 8 | Coherent; a little empty space in portrait |

## Next recommended action
Human playtest of order budgets from size 6 up; consider snapshotting the RNG so undo cannot re-roll arrivals.
