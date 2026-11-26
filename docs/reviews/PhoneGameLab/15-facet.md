---
id: PhoneGameLab/15-facet
title: Facet
was: 15-fruit-slice (Fruit Slice)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Swipe across things thrown up from the bottom of the screen to slice them; avoid the bombs; three misses end the run.

## Baseline assessment
45-line prototype imitating a well-known commercial fruit-slicing game (name, fruit emoji, bomb emoji). "Slicing" was a
distance check against trail midpoints, so a resting finger sliced everything; sliced items simply vanished; a 4 px
white polyline for a trail; one beep; no combo, no progression, no best score. Overall 2/10.

## Weaknesses identified
Borrowed identity; no cut at all (objects disappear); no feel in trail or impact; holding still wins; no depth.

## Creative opportunities
Make the cut *real*: split the object along the exact line the player drew. Once cuts are geometry, re-cutting pieces
becomes a mechanic of its own, and a gem-cutting theme gives both a reason (facets) and a look (low-poly stones).

## Planned improvements
Convex-polygon splitting, re-cuttable pieces with rising value, chain multiplier, centre-cut bonus, original hazard and
power stone, tapered blade ribbon, jeweller's-velvet identity.

## Implemented improvements
- **True cuts**: every stone is a convex polygon. The blade's entry and exit points are tracked in the stone's own
  rotating frame and the polygon is split along that line; halves get their own centroid, mass centre, spin and a push
  apart along the cut normal. Area is conserved (verified by test). Slivers under 10% are treated as grazes.
- **Re-cutting**: stone → halves → quarters → slivers (10 / 15 / 25 points); one toss can be worth seven cuts.
- **Skill bonuses**: cuts within 0.7 s chain into a ×1–×6 multiplier with an end-of-chain bonus; a cut that divides a
  stone 40–60% is CLEAN (+50%, gold ring, higher note).
- **Hexstone** (original hazard): dark, spiky, red-veined, pulsing aura, announced by a low warning — cutting it costs
  a life and breaks the chain. **Star diamond**: rare white stone; cutting it gives ~4 s of slow-motion, double-value play.
- **Rules/fairness**: only *uncut* stones that fall cost a life (pieces never do); a tap or a resting finger never cuts;
  the first few drops before any cut are free; 3 lives.
- **Pacing**: volleys grow from 1 to 5 stones, hexstones from the 5th volley, every 6th volley is a hex-free RUSH stream,
  "LOT n" milestones shorten the gaps.
- **Blade**: three-layer tapered ribbon (glow, haze, white core) that warms from teal to gold to orange with the
  multiplier; entry sparks the instant the blade touches a stone, cut sparks along the line, shard dust in the gem colour,
  fresh cut edges flash white, 22 ms hit-stop on whole-stone cuts.
- **Audio**: speed-pitched swish, glassy sine "tink" that rises for smaller pieces and clean cuts, pentatonic chain
  ladder, glass + boom for hexstones, funk music that follows lot, multiplier and brilliance.
- **Look**: emerald velvet with gold stitching; faceted gems in seven colours whose crown facets are shaded by their
  angle to a fixed light, so they flash as they spin.

## Test results
- Smoke: pass (60 fps headless, survives resize/blur).
- Gameplay test `tests/PhoneGameLab/15-facet.test.js`: pass — tap does not cut; a real mouse swipe yields two pieces
  whose areas sum to the original and that lie on either side of the swipe; centre cut = CLEAN; one stroke re-cuts both
  halves (chain, higher value); off-centre swipe = uneven pieces, no bonus; pieces fall free; hexstone and dropped whole
  stones cost lives → game over; best saved; clean restart; director tosses on its own.
- Screenshots inspected at 390×844 and 844×390 (splash, early play, busy late play, hexed).
- A scripted swiper cut 109 times in 35 s at 60 fps. Feel is judged from code and scripted play — **no human playtest**.

## Remaining issues
- Scores inflate quickly for chain-heavy play (×6 × CLEAN); balance between chain and clean bonuses is untuned by people.
- The blade ribbon is drawn from raw pointer samples; at very low touch sampling rates it can look angular.
- Landscape is portrait-framed (small). No keyboard control (not meaningful for a swipe game).
- Stones do not collide with each other.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Cutting exactly where you swipe, then chasing the pieces, is immediately satisfying |
| Mechanical depth | 8 | Re-cut greed vs. incoming stones, clean-cut aim, chain timing, hexstone avoidance |
| Game feel | 8 | Entry sparks, split-and-spin, edge flash, hit-stop, layered blade |
| Visual identity | 8 | Low-poly gems on velvet; no trace of the fruit template |
| Animation quality | 8 | Light-reactive facets, twinkles, tumbling pieces, tapered trail |
| Audio quality | 7 | Informative glassy pitches and chain ladder; synthesized only |
| Controls | 8 | Touch + mouse swipes, entry/exit tracking, forgiving lift-inside commit |
| Onboarding | 8 | Animated swipe hint, free first drops, one stone at a time to start |
| Replayability | 8 | Score chase with three skill axes; rush volleys and star diamonds vary the rhythm |
| Performance | 9 | ≤ ~60 polygons with ≤ 9 facets each; 60 fps headless |
| Technical robustness | 8 | Clean restart, game-clock timers, resize safe |
| Overall polish | 8 | Cohesive; a tray/collection meta is absent |

## Next recommended action
Human playtest on a phone for cut latency and score balance; consider a combo for cutting several stones in one stroke.
