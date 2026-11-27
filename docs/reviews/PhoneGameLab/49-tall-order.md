---
id: PhoneGameLab/49-tall-order
title: Tall Order
was: 49-ball-sort (Ball Sort)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Tap a tube, then another, to move its top ball; sort six colours of balls into tubes.

## Baseline assessment
45 lines and the same skeleton as its sibling 48: flat circles in stroked boxes, balls teleport, and — because any ball
could be dropped on any other — no rule at all, so the "puzzle" was only patience. One random deal, no levels, no undo,
hardcoded layout. Overall 2/10.

## Weaknesses identified
No constraint (nothing to think about); indistinguishable from Water Sort; no movement, weight or sound to the pieces;
no progression or reason to play well.

## Creative opportunities
Re-frame it as a different toy with a different rule so the two sorting games stop being twins: a wooden ring stacker
where *size* decides where a ring may land and *colour* decides where it belongs.

## Planned improvements
Size-ordering rule; rings that hop and settle; hold pegs; reversible-walk generator with an A* par and hint; level
progress and stars; a warm wooden-toy look and knock-on-wood sound, clearly unlike Decant's glass and glug.

## Implemented improvements
- **Rule**: a ring lands only on an empty peg or on a ring at least as wide; any colour. Goal: every peg one colour,
  widest at the bottom. That inverts the usual sort — narrow rings are free agents, wide rings need a clear peg — so
  the play is about digging out and seating the wide rings. Finished pegs get a gold star but are never locked (a
  found counter-example showed that some positions need a finished peg to lend a ring).
- **Hold pegs**: short pegs that take exactly one ring of any size (from toy 6).
- **Generator**: starts from the solved toy and takes a loop-erased random walk of legal hops; every hop is reversible,
  so every scramble is solvable and the walk length bounds the distance home. A bucketed A* (heuristic: rings not yet
  seated) checks the true distance every three steps and stops the walk when it reaches the toy's target; par is the
  A* optimum (weighted A* / walk length when the exact search would be too big). 16 tuned steps (2 colours × 3 sizes →
  5 colours × 4 sizes on six pegs), then an endless cycle; par 6 on toy 1, ~12–28 late.
- **Feel**: the tapped ring lifts and bobs above its peg, markers show every peg that would accept it, the hop is a
  carry-then-drop arc that ends in a squash, a dust puff and a knock pitched by ring width (wide = low); the stack
  underneath gives a little; refused drops wiggle and thud; finished pegs pop a star with a rising note; the win runs
  a squash wave up every stack.
- **Help/loop**: undo and restart (rings fly home), A* hint as a dotted arrow (−1 star), stars (≤ par ★★★, ≤ par + 3
  ★★), level select, win card per toy with best = highest toy cleared, progress in `Lab.store`.
- **Identity**: painted wooden rings with a glyph per colour, birch pegs on a chunky base, sunny spotted play mat,
  wooden-block buttons, bouncy music that fills in as pegs are finished. Keys 1–6 pick pegs, Z/R/H.

## Test results
- Smoke (`tools/smoke.js 49-tall-order`): pass.
- Gameplay test (`tests/PhoneGameLab/49-tall-order.test.js`, 15 s): pass — lift / put back / hop, size rule refuses a
  wide ring on a narrow one, undo, restart, solver route (= par) finishes toy 1 → win + 3 stars + progress, next toy
  clean, hold peg holds one and refuses a second, hint is a legal hop and costs a star, toy 6 finished, best = 6.
- Screenshots inspected at 390×844 (toys 4 and 13) and 844×390 (toy 16), two rounds; generation timed for toys 1–30.
- Subjective assessment from scripted play and code reading only (no human playtest).

## Remaining issues
- Level generation runs the solver synchronously: usually < 130 ms, but up to ~370 ms on a desktop for the biggest toys
  (a visible hitch on a slow phone when the toy loads).
- Difficulty by par is not monotonic late (12–28 moves): the random walk sometimes stops on an easy position.
- One row of four pegs in portrait leaves empty mat above and below; rings are ~24 px tall there.
- The rule is new to players; only the landing markers and the refusal wiggle teach it (no scripted tutorial).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | A fresh, readable rule; short toys with a clear "seat the big ones" arc |
| Mechanical depth | 8 | Size rule + hold pegs + unlocked finished pegs give real look-ahead; exact par on most toys |
| Game feel | 8 | Lift/bob, arc, squash, pitched knock, stack give, star pop |
| Visual identity | 8 | Wooden toy on a sunny mat; nothing like its former twin |
| Animation quality | 8 | Carry-then-drop hop, squash wave, rings fly home on undo/restart |
| Audio quality | 7 | Knock pitch = ring width, distinct refuse/finish sounds; small palette |
| Controls | 8 | Column-wide tap targets, landing markers, number keys |
| Onboarding | 7 | Toy 1 is six moves and markers show legal pegs, but the size rule is only stated in the how-to |
| Replayability | 7 | Endless seeded toys, stars; late difficulty uneven |
| Performance | 7 | Trivial rendering; solver hitch at load on the largest toys |
| Technical robustness | 8 | Clean restart/reload, resize re-lays out, moves stay consistent during flights |
| Overall polish | 8 | Complete, cohesive loop |

## Next recommended action
Move generation into time-sliced steps (or cache the next toy during the win card); human playtest of the rule's
onboarding; consider a first-toy ghost hint.
