---
id: PhoneGameLab2/pack-ice
title: Pack Ice
was: building-block-puzzle (Block Puzzle)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Drag one of three polyominoes onto an 8×8 grid; full rows and columns clear; the run ends when nothing fits.

## Baseline assessment
A 55-line copy of the well-known block-placement game: grey squares, piece hidden under the finger, no landing
preview, random unwinnable deals, one beep, no pal. The lab already has a finished take on this idea (Plot Twist, where
regions replace lines). Overall 2/10.

## Weaknesses identified
No identity, blind dragging, nothing to plan beyond rows/columns, unfair deals, no progression, no character — and
a second straight implementation would duplicate its sibling.

## Creative opportunities
Change the verb instead of the win rule: on ice, things slide. If pieces are pushed in from an edge and glide until
they bump, *where a piece can stop* becomes the puzzle — and a penguin is the obvious pusher.

## Planned improvements
Slide-in placement from four sides with a live landing preview; fish as a second objective feeding a pal power;
buoys that reshape the board each level; fair dealing; ice-rink identity; lots of slide/crack feedback.

## Implemented improvements
- **Slide, don't place.** Drag a tray piece toward any edge of the pond: the nearest edge (with hysteresis) and the
  lane under the finger are chosen, Nori waddles to that spot, and the preview shows the lane, the dashed landing
  silhouette and any row/column that would complete (gold). Release and the piece glides in until it bumps. Pockets
  can only be filled from the side that reaches them; a corked lane shows a red ✕ and the piece returns to the tray.
- **Fish → belly slide.** About a third of the pieces carry a frozen fish. Crack its line and the fish arcs into
  Nori's beak (+30). Five fish charge a belly slide (max 2 stored): drag Nori himself to a lane and he slides its whole
  length smashing every block — the rescue tool, and the only way out when no piece fits.
- **Scoring**: 1 per cell placed; 60 × lines² per crack, × streak (consecutive cracking moves, up to ×5); banners for
  doubles/triples/streaks.
- **Catches (levels)**: every 6 lines the marker buoys move (0→4 fixed posts that stop slides mid-board and count as
  filled for line purposes), pentominoes arrive at catch 3 and a 2×3 slab at catch 4, weighted heavier from catch 5.
  Buoy placement is re-rolled until a move exists; deals always contain a piece that can enter.
- **Nori is the actor**: follows the aim around the rim, frowns at corked lanes, shoves with a squash, cheers on
  cracks, gulps fish, bounces with a "Drag me!" bubble when charged, belly-slides (lie pose) through the lane, looks
  scared when the pond is over 60 % full or nothing fits.
- Feel: accelerating slide with duration by distance, knock pitched by distance, board nudge + ice chips on impact,
  staggered shatter with flash, pentatonic ladder on streaks. Pieces that cannot currently enter are dimmed in the tray.
- Layout: portrait stack (header, rink with rails, tray) and a three-column landscape/desktop layout; first deal is
  fixed and friendly, pulsing arrows on all four edges until the first move.

## Test results
- Smoke (`tools/smoke.js pack-ice`): pass.
- Gameplay test (`tests/PhoneGameLab2/pack-ice.test.js`, 3 consecutive passes): real drags slide a square from the top to
  the far wall and a bar from the right until it bumps the square; a drop away from the pond cancels; completing a row
  cracks it (exact score incl. fish bonus), deals a new tray and feeds Nori; dragging a charged Nori smashes a lane;
  a board where only one pocket is reachable ends the run after that move; clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (aiming, resting, buoys, charged Nori, splash). Fixed: desktop
  side columns clipped off-screen; banners moved off the board.
- Subjective assessment from scripted play and code reading only (no human playtest). No long balance probe.

## Remaining issues
- Pointer only (no keyboard placement).
- The lane preview washes out the blocks under it a little; the piece-in-hand thumbnail can overlap the silhouette.
- Difficulty over long runs is reasoned, not measured; strong players may last a long time before catch 5.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | The slide-and-bump is satisfying on move one; reading where things stop stays interesting |
| Mechanical depth | 8 | Four entry sides, overhangs, corked lanes, buoys, streak planning, a scarce rescue power |
| Game feel | 8 | Shove → glide → knock with nudge and chips; staggered cracks; fish arcs |
| Visual identity | 8 | Snowbanked rink, candy ice cubes with frozen fish, navy penguin; reads from a thumbnail |
| Animation quality | 7 | Slides, shatters, Nori's reactions and belly slide; tray refills simply pop |
| Audio quality | 7 | Slide/knock pitched by distance, glass cracks, combo ladder; no ambient layer |
| Controls | 8 | Edge + lane selection with hysteresis, lift on touch, full preview, cancel zone |
| Onboarding | 7 | Edge arrows, friendly first deal, live preview; the slide rule still needs one try to click |
| Replayability | 8 | Random deals, moving buoys, growing piece set, score/streak chase |
| Performance | 9 | Baked background and block sprites, ≤ 64 blits; 61 fps in headless smoke |
| Technical robustness | 8 | Logic commits instantly (animation is visual only), clean restart/resize, no errors |
| Overall polish | 8 | Complete loop with self-playing attract, themed end card |
## Next recommended action
Human playtest for long-run difficulty; add keyboard placement; a short animated hand on the very first drag.
