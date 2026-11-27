---
id: PhoneGameLab/56-shuteye-street
title: Shuteye Street
was: 56-lights-out (Lights Out)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
The classic toggle toy: tapping a cell flips it and its four neighbours; turn every light off.

## Baseline assessment
28-line prototype: one fixed 5×5 grid of flat squares scrambled by seven random taps, a move counter with no target, no
undo, no levels, no reason for the theme, one beep, named after the commercial toy. Overall 2/10.

## Weaknesses identified
No identity (and a borrowed name); no difficulty curve; the move count meant nothing without a par; no help when
stuck; no variants; no feedback about *which* cells a tap will flip; portrait-only hard-coded layout.

## Creative opportunities
A setting where flipping neighbours makes sense (knocking wakes the flat next door), a solver so par and hints are
exact, and rule variants that reuse the same linear algebra: other neighbourhoods and three-step lamps.

## Planned improvements
Townhouse-at-dusk identity; generated houses with exact par; stars; hint that shows one correct knock; press preview;
diagonal and all-around neighbourhoods; three-state lamps; undo/restart; persistence; landscape layout.

## Implemented improvements
- **Solver**: Gaussian elimination mod 2 / mod 3 plus an exhaustive null-space search returns the *fewest* knocks from
  any position. It sets par at load and drives the hint (one knock from an optimal solution, from wherever you are).
- **Generator**: each house number is a dark house knocked awake by seeded random knocks (so always solvable); 30
  candidates per house, keeping the one whose optimum matches the target. 22 hand-tuned specs (3×3 par 1 → 5×7 par 11),
  then an endless cycle of the late variants with par rising to 14.
- **Variants**: orthogonal neighbours (1–6), diagonal knocks (7+), three-step lamps bright → dim → off with knock
  counts mod 3 (11+), "busybody" houses where all eight neighbours flip (16+); a 3×3 rule card always shows the shape.
- **Touch**: press previews the windows that will flip (outlines), release knocks, sliding off cancels; arrows + Space
  with a visible cursor; undo (Z), restart (R), hint (H), `[` `]` for houses. Par knocks ★★★, par+2 ★★, hint caps ★★.
- **Identity**: baked dusk sky, skyline, brick townhouse with door and a number plaque that *is* the level; windows
  are baked sprites with curtains and six silhouettes (cat, plant, night-owl, lamp…); dim lamps show a half-drawn
  blind so the three states are not colour-only; additive lamp-glow on the brickwork; a moon that watches and falls
  asleep on a win while "z"s drift off the roof.
- **Feel + audio**: knock thud, ring ripple, staggered flicker per window with a sine blip pitched by floor and
  brightness; lullaby phrase on a win; chill 72-bpm music whose layers thin out as the house goes dark.
- **Layout**: building transposes in landscape with a side panel; splash backdrop is a house solving itself.

## Test results
- Smoke (`node tools/smoke.js 56-shuteye`): pass, 61 fps headless.
- Gameplay test (`tests/PhoneGameLab/56-shuteye-street.test.js`): pass — par equals solver optimum, a click flips
  exactly the neighbourhood, undo, slide-off cancel, touch solve in par → 3 stars + saved progress, hint is an optimal
  knock, keyboard-cursor solve → 2 stars, three-step cycle + restart + solve (house 11), diagonal (7) and all-around
  (16) shapes verified and solved, wasted knocks → 1 star, next house loads clean.
- Generator/solver swept for houses 1–40: every par on target, worst build+solve 10 ms.
- Screenshots inspected at 390×844, 844×390, 1280×800 (splash, houses 1/13/15/18); fixed dead ground below small
  houses (house now stands on the street line) and a wrapping tagline.
- Subjective assessment is from code + scripted play, not a human playtest.

## Remaining issues
- It is still a pure logic toy: without learning the "chase the lights" idea, mid houses come down to hint + undo.
- Null-space search is capped (12 basis vectors mod 2, 7 mod 3); beyond that par could exceed the true optimum
  (not reached by any current spec).
- In landscape 5-wide houses give ~46 px windows — usable, slightly under the 48 px I would like.
- No animation of the residents themselves (silhouettes are static).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Proven toy made friendlier; satisfying to watch a house go dark |
| Mechanical depth | 7 | Four rule variants, exact par, optimal hints; inherently abstract |
| Game feel | 8 | Press preview, staggered flicker, knock ripple, pitched blips |
| Visual identity | 9 | Dusk townhouse with lamplit silhouettes is distinctive and cosy |
| Animation quality | 7 | Flicker cross-fades, pops, moon reaction; static residents |
| Audio quality | 8 | Floor/brightness-pitched blips, lullaby win, music that quiets with the house |
| Controls | 9 | Preview-then-commit taps with cancel, keyboard cursor, undo/restart/hint |
| Onboarding | 8 | House 1 is one knock; rule card + one tip per variant |
| Replayability | 7 | Endless houses, star chase across variants |
| Performance | 9 | Baked sprites; solver ≤ 10 ms on demand |
| Technical robustness | 8 | Clean reload/restart/resize; solver verified against generator |
| Overall polish | 8 | Cohesive from plaque to moon |

## Next recommended action
Human playtest of houses 9–14 for frustration; consider a "limited knocks" challenge mode and animated residents.
