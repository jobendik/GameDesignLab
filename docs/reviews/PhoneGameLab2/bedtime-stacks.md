---
id: PhoneGameLab2/bedtime-stacks
title: Bedtime Stacks
was: 2048 (2048)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Swipe a 4×4 grid; equal tiles slide together and merge into the next value. The prototype was a bare clone named after
the commercial game.

## Baseline assessment
30-line clone: hue-coded squares, no animation (tiles teleport), one beep, no best score, no identity, legacy
`instructions` API. Overall 2/10.

## Weaknesses identified
Named after and identical to an existing game; no feedback on slides or merges; no goal besides "bigger number"; no
character; a finished sibling (`PhoneGameLab/43-plumpling`: chain merges, a fixed gold plate, move-budget orders,
burnt tiles, undo) already covers the genre-pure take.

## Creative opportunities
Put the pal *on the board*. Olli the owl is a sliding piece: a wall you cannot pass and the place every wanted book
has to reach. That changes how a merge board is read (rows are split by a wall that moves with every swipe).

## Planned improvements
Olli as a board piece with a wish; reading removes the book and buys space; quick-read stars; later nuisances
(dust bunnies) and a reward piece (golden book); a reading-nook identity; reactive music; full test.

## Implemented improvements
- Rewrite on the v2 engine (≈300 lines): tweened slides (0.12 s), merge pops, spawn pop-ins, two-move input buffer,
  blocked swipes bump the board instead of counting as a move; swipe (early-fire), arrows and WASD.
- **Olli is a piece.** He slides with every swipe and nothing passes him. Slide the volume in his thought bubble into
  him (or slide him into it) and he reads it: the book leaves the rug, no new book arrives that move, he cheers and
  wishes for the next, higher volume. The wished volumes on the rug are outlined in gold; Olli looks at the nearest.
- Quick-read stars (3/2/1, move-based, shown draining on the wish card) multiply the read bonus — a soft goal instead
  of Plumpling's hard move budget.
- Chapters: every third story a "Chapter N" milestone and a golden book that merges with anything.
- Dust bunnies from the third story on: they never merge and clog a cell until slid into Olli, who hoots them away.
- Olli acts: looks along the swipe, leans while sliding, squashes on stopping, wow when his volume appears, cheers and
  hops when he reads, scared when ≤ 2 cells are free (rug outline pulses), sleepy with drifting z's when you idle,
  sad on the jam.
- Identity: night reading nook — indigo boards, moonlit window patch, amber lamp glow, plum rug with tassels, baked
  pastel hardbacks with spines/ribbons, a wish card and a trophy shelf that fills with the spines of read volumes.
- Audio: slide, pitch-laddered merges, page flip + chime on a read, whoosh for dust, "dream" music whose intensity
  follows how full the rug is.
- Live attract mode behind the splash (the board plays itself).

## Test results
- Smoke (`tools/smoke.js bedtime-stacks`): pass, 61 fps headless, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab2/bedtime-stacks.test.js`): pass — merge + score + HUD, both delivery directions,
  wrong volume blocks, dust, golden book, blocked swipe, real mouse swipe, keyboard, jam → game over + best, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (play, splash, game over); fixed splash wrapping, a label
  collision on desktop, hint overlap in landscape, unused space in portrait.
- Balance probe: a one-ply greedy bot lasts 70–105 moves / 5–8 stories over three seeds (≈1.5–2.5 min at human pace).
- Subjective assessment from scripted play and code reading only (no human playtest).

## Remaining issues
- No undo; a planned-ahead misread of how Olli splits a row can end a run abruptly.
- The thought-bubble book is small at 390 px (the wish card carries the readable version).
- Late game adds dust and higher wishes but no new piece after chapter 2.
- Portrait leaves a band of floor under the shelf on very tall phones.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Familiar loop with a goal you can see and reach every 10–20 moves |
| Mechanical depth | 8 | Moving wall + delivery from either side + star timing + dust/golden pieces change line reading |
| Game feel | 8 | Tweened slides, pops, bump on blocked moves, hop/cheer, buffered input |
| Visual identity | 8 | Night reading nook with baked hardbacks; nothing like a number grid |
| Animation quality | 7 | Slides, pops, Olli's squash/lean/hop, shelf growth; merges have no in-between frame |
| Audio quality | 7 | Informative ladder and flip/chime; small palette |
| Controls | 9 | Early-fire swipes, keys, buffer; blocked moves are free |
| Onboarding | 8 | Three lines, gold outline + "Now slide it into Olli!" on the first wished volume |
| Replayability | 7 | Score/star chase, random arrivals; one mode |
| Performance | 9 | 16 cells, cached sprites, 60 fps |
| Technical robustness | 8 | Clean restart, resize re-layout, all timers on the game clock |
| Overall polish | 8 | Cohesive from attract to game-over card |

## Next recommended action
Human playtest of the difficulty curve; consider one earned "bookmark" undo per chapter and a new piece for chapter 4+.
