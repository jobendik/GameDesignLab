---
id: PhoneGameLab/29-tiltwood
title: Tiltwood
was: 29-marble-maze (Marble Maze)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Guide a marble through a generated maze to a goal. The prototype had no rolling at all: the marble was dragged
directly under the finger, 8 px at a time, with wall checks.

## Baseline assessment
68-line prototype: DFS maze drawn as blue lines on black, a white circle that follows the pointer (no physics, no
inertia, no keyboard), a timer, one fixed size, no hazards, no levels, no score or best, v1 lifecycle. Overall 2/10.

## Weaknesses identified
Not a marble game (nothing rolls); zero risk; one board and done; unreadable hit detection at walls; no identity;
nothing to master; no feedback of any kind.

## Creative opportunities
Make it the wooden tilt-labyrinth toy: the player tips the *board*, not the ball. Give holes a physical counter-play
(hug the wall), make stars matter beyond points, and let par times reward clean lines.

## Planned improvements
Drag-to-tilt virtual board with visible tilt; fixed-step rolling physics; holes, stars, cup; generated boards with a
difficulty curve; par time; marbles as lives; wood/brass/felt identity; woody audio.

## Implemented improvements
- **Controls**: drag from anywhere — the touch-down point is the anchor, the drag vector is the tilt (ring + nub drawn
  under the finger); arrows/WASD on desktop; tilt eases in and levels out on release.
- **Physics** at 120 Hz in cell units: tilt acceleration, rolling drag (stronger when flat), speed cap, circle-vs-box
  wall collisions with restitution only above a threshold (no jitter when leaning on a wall), hole rims that tug a
  marble whose centre is over the edge. Marble dimples are rotated in 3D by the distance rolled.
- **Board is visibly tilted**: board shifts, its drop shadow moves the other way, wall tops parallax over their dark
  sides, the low side darkens / high side lights up, the marble's shadow and highlight slide.
- **Level design by generator**: DFS maze + light braiding, goal = farthest cell, stars in dead ends, holes placed
  against a wall of their cell (the far side is always a safe lane) — first only on the side passages to stars, from
  level 4 also on the main route, never two in a row. Sizes 4×5 → 6×9; landscape transposes the same board.
- **Depth**: stars are worth points *and* become the respawn checkpoint; par time (greedy star tour) gives an
  UNDER PAR bonus; NO SLIPS and ALL STARS bonuses; +1 marble every third level.
- **Feel/audio**: knock pitch and squash scale with impact speed, speed-dependent rolling rumble, star chime ladder,
  drop/thud for holes, tally lines with a rising arpeggio, level banner, music intensity follows stars and last marble.
- **Onboarding**: animated ghost-drag on the first board until the player tilts; level 1 has no holes.
- Three-marble run, score/best/stats card, clean restart, resize-safe (physics is resolution independent).

## Test results
- Smoke (`tools/smoke.js 29-tiltwood`): pass, 61 fps headless, survives landscape resize + blur.
- Gameplay test (`tests/PhoneGameLab/29-tiltwood.test.js`): pass — real mouse drag tilts and rolls the marble, key
  tilt, an in-page PD steering loop (tilt only, real physics) collects stars and clears level 1, a hole costs a
  marble and respawns at the checkpoint, three falls → game over, best recorded, clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, level 1, drag ring, levels 3 and 5).
- Subjective assessment from code + scripted play only (the autopilot clears levels 1–6 3–6 s under par); no human
  playtest, so tilt sensitivity and hole lane width are tuned by reasoning.

## Remaining issues
- Tilt is faked with shading/parallax, not true perspective.
- Late levels only add holes (cap 6×9); no moving hazards or new board elements after level 7.
- Level 1–2 mazes are small and can put the cup close to the start.
- Rolling sound is granular noise bursts rather than a continuous loop.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Rolling with inertia is immediately fun; holes create real tension |
| Mechanical depth | 7 | Wall-hugging, star detours vs par, checkpoints; no late-game new elements |
| Game feel | 8 | Knocks, squash, rumble, rim tug, parallax tilt all respond to speed |
| Visual identity | 9 | Birch/walnut/brass on felt; reads as a physical toy at thumbnail size |
| Animation quality | 8 | Rolling dimples, drop-in, sink, board pop, star bob |
| Audio quality | 7 | Informative pitches; rolling rumble is an approximation |
| Controls | 8 | Anchor-anywhere drag + keys; untested on a physical phone |
| Onboarding | 8 | Ghost drag, hole-free first board |
| Replayability | 7 | New boards every run, par/star mastery; plateau after level 7 |
| Performance | 9 | Two baked layers + a handful of draws; 61 fps headless |
| Technical robustness | 8 | Cell-unit physics survives resize/rotate; clean restart verified |
| Overall polish | 8 | Cohesive from splash to tally |

## Next recommended action
Human playtest on a phone to tune tilt gain and hole lanes; add one late-game element (e.g. sliding gate or bumper).
