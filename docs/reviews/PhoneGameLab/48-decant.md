---
id: PhoneGameLab/48-decant
title: Decant
was: 48-water-sort (Water Sort)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Tap a tube, then another, to pour the top colour across; sort five colours into seven tubes.

## Baseline assessment
55 lines: coloured rectangles in stroked boxes, liquid teleports, one random 5-colour deal every time (no levels, no
solvability check), no undo, unexplained "Sorted!", hardcoded y = 180 layout that breaks on any other screen. It was also
the same skeleton as its sibling 49. Overall 2/10.

## Weaknesses identified
No pouring (the whole fantasy of the genre), no progression, no par or reason to play well, no way back from a mistake,
no identity of its own, colour-only information.

## Creative opportunities
Make the pour the star: a bottle that lifts, tips and empties with a level surface and a glug that rises as the target
fills. Give the puzzle rules of its own (bottle sizes, hidden layers) so it is not just the genre default.

## Planned improvements
Real pour animation and sound; solver-verified levels with a pour par; bottle sizes and murky layers; undo / restart /
solver hint; level progress and stars; a bright cordial-shop look distinct from the other three games in the batch.

## Implemented improvements
- **Pour**: the source lifts, travels so its mouth sits over the target and tips further as it empties; liquid inside the
  tilted glass is drawn as world-level bands (clip + counter-rotation); a stream arcs from the lip to the rising surface;
  splashes, slosh on landing, a cork that drops in when a bottle is finished. One tap can be buffered during a pour.
- **Rules of its own**: bottles hold 3, 4 or 5 measures and a flavour only finishes when it fills a bottle of exactly
  its amount to the brim (so the small and tall bottles have to be freed for the right flavours); murky bottles hide
  everything under the top flavour until it is poured off (undo keeps what you have learned).
- **Levels**: 16 tuned steps (2 flavours → 8 flavours / 10 bottles, sizes from shelf 4, murk from shelf 6), then an
  endless cycle. Each deal is seeded by shelf number and accepted only if the built-in solver sorts it; par is the
  exact minimum (breadth-first) for small shelves and the best route found by depth-limited search for large ones.
  Generation measured at ≤ 100 ms for shelves 1–30.
- **Help**: undo, restart, hint (the solver's next pour is shown as a dotted arrow, −1 star), "no pours left" warning
  with a blinking UNDO, stars (≤ par ★★★, ≤ par + 3 ★★), level select.
- **Identity/audio**: lilac wall with window light, white shelf with brass brackets, clear glass with highlights, eight
  cordials each with a white glyph per measure (not colour-only); glass clink on select, glug tones whose pitch follows
  the target's fill level plus a filtered trickle, cork pop + rising note per finished bottle, chill music that fills
  out as bottles are corked.
- **Controls**: tap/click bottles (whole column is the target), keys 1–0 pick bottles, Z/R/H. Two shelves in portrait,
  one long shelf in landscape.

## Test results
- Smoke (`tools/smoke.js 48-decant`): pass.
- Gameplay test (`tests/PhoneGameLab/48-decant.test.js`, 37 s): pass — select/deselect, real pour moves the top run,
  illegal pour refused, undo, restart, solver route sorts shelf 1 → win + progress, next shelf clean, mixed sizes on
  shelf 4 with a legal hint (−1 star), murky layer revealed on shelf 6, best = highest shelf.
- Screenshots inspected at 390×844 and 844×390 (mid-pour close-up, shelves 3, 9 and 14), two rounds (landscape bottle
  size fixed after the first). Desktop via the same landscape layout + smoke.
- Subjective assessment from scripted play and code reading only (no human playtest).

## Remaining issues
- Par on big shelves is "best found", not proven minimal, so it wobbles (shelf 14 par 34 vs shelf 15 par 22) and can
  be beaten.
- Murky deals are solvable with full information but can force an undo when a guess goes wrong.
- No animation for undo (liquid snaps back with a slosh).
- Late shelves reuse five configurations with new seeds.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | The genre loop with a pour that is a pleasure to trigger; sizes add a real planning layer |
| Mechanical depth | 7 | Size-matching and hidden layers on top of the classic rules; par chase |
| Game feel | 8 | Lift, tip, stream, rising glug, slosh, cork pop; buffered tap |
| Visual identity | 8 | Bright lilac cordial shop, unlike the other three and the siblings |
| Animation quality | 8 | Level liquid in a tilted bottle, growing stream, cork bounce, hops on win |
| Audio quality | 8 | Glug pitch tracks the fill level; distinct select / refuse / cork / stuck sounds |
| Controls | 8 | Column-wide targets, tap-to-switch selection, number keys |
| Onboarding | 8 | Shelf 1 is two flavours; one-off tips when sizes and murk first appear |
| Replayability | 7 | Endless seeded shelves and stars; configurations repeat late |
| Performance | 8 | ≤ 10 bottles; solver ≤ 100 ms at load, hint search on demand |
| Technical robustness | 8 | Clean restart/reload, resize re-lays out, loop silenced when idle |
| Overall polish | 8 | Cohesive, complete loop |

## Next recommended action
Human playtest of shelves 9–16; replace the best-found par with an A* bound for large shelves; animate undo.
