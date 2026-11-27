---
id: PhoneGameLab/68-chute-first
title: Chute First
was: 68-sort-baskets (Sort Baskets)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Coloured dots fall at random x positions; four baskets sit along the bottom; tapping a basket swaps it with its right
neighbour so the matching colour is under the dot. Five misses end the game.

## Baseline assessment
35-line prototype: the only verb (swap with the right-hand neighbour) made it nearly impossible to line up a specific
basket in time, items overlapped, colour was the only cue, nothing escalated but fall speed, one beep. Overall 2/10.

## Weaknesses identified
Indirect, slow verb; no telegraphing; colour-only information; no streak or reward for speed; no rule variety;
fixed-pixel basket strip; `start()` outside the splash flow.

## Creative opportunities
Sorting is most fun when the *rule* is the puzzle. Make the verb instant (a flick) and spend the design on rule changes:
more categories, a different attribute, negation, "everything else", shuffles and memory.

## Planned improvements
Top-down sorting table with four chutes; flick / tap / arrow-key verb; per-block timer ring; rounds that change the
rule; streak multiplier and speed score; three lives; pips on blocks so colour is never the only cue.

## Implemented improvements
- **Verb**: a block drops onto the turntable; flick it (swipe fires after 26 px), tap a chute, or press an arrow key.
  The next block drops immediately, so pace is set by the player; the ring around the table is the per-block limit
  (3.1 s in round 1 → 1.15 s late).
- **Rules** (shown as labels inside the chutes and announced inside the turntable): two colours → three → four →
  two shapes (colour is now a decoy) → "blue / NOT blue" → four shapes → "two colours + THE REST" → "NOT square", then
  random rule types forever. From round 9 every other round shuffles the chutes mid-round ("SWITCH!", with a pause and
  card flip); from round 10 some rounds are memory rounds whose labels fade to "?" after four blocks and reappear for a
  moment after a mistake.
- **Scoring**: 10 + up to 10 for speed, × multiplier (every 5 in a row, max ×5, shown as five pips); a round without a
  mistake pays 50 × round. A wrong chute or a timeout costs one of three lives and flashes the chute that was right.
- **Readability**: blocks carry 1–4 dice pips per colour and the colour chips in the labels carry the same pips;
  shape labels are grey (any colour); closed chutes are visibly hatched; NEXT preview shows three upcoming blocks.
- **Feel**: drop-in with overshoot, finger-follow before the flick, 130 ms flight with spin, chute gulp and glow,
  score pops beside the chute, pentatonic ladder that climbs with the streak, ticking as the ring empties, shake/flash
  on mistakes, card-flip label changes, perfect-round confetti burst.
- **Onboarding**: the first two blocks show a ghost fingertip sliding toward the right chute.
- Sunny toy-factory identity (yellow stripes, navy outlines, conveyor arms), marching-toy music whose intensity follows
  round and time pressure; layout derives from the stage and works in portrait, landscape and desktop.

## Test results
- Smoke (`node tools/smoke.js 68-chute`): pass, 61 fps headless, no errors.
- Gameplay test (`tests/PhoneGameLab/68-chute-first.test.js`): pass — mouse swipe, touch chute tap and arrow key each
  sort a block; closed chute ignored; wrong flick and timeout cost lives; ×2 after five; round 1 → 2 opens a third
  chute; NOT-rule and shape-rule answers verified block by block; mid-round switch moves labels; three mistakes → game
  over with best; clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (rounds 1, 3, 5 intro, 7, 8 after a mistake, memory round 10,
  splash, game-over card).
- Subjective assessment from reading the code and scripted play only (no human playtest).

## Remaining issues
- Rule types never combine two attributes at once (e.g. "red squares"); late variety comes from switches, fading labels
  and speed only.
- Portrait leaves unused floor above and below the cross of chutes.
- Red/green are distinguished by pips (1 vs 4) but the pips are small on the 26 px NEXT previews.
- Timer tuning for rounds 10+ comes from scripted play; it may be too tight or too loose for humans.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Instant verb, self-set pace and a new rule every ~20 s keep it fresh |
| Mechanical depth | 7 | Rule parsing under time, streak protection, decoy attributes, memory rounds |
| Game feel | 8 | Drop, follow, spin-flight, gulp, glow, ladder; mistakes teach by flashing the right chute |
| Visual identity | 8 | Bold yellow/navy toy look, pipped blocks, distinct from siblings |
| Animation quality | 7 | Card flips, drop overshoot, fly-in tweens; blocks themselves are static sprites |
| Audio quality | 7 | Streak ladder, ticks, flips; preset-based |
| Controls | 9 | Swipe, tap or keys; early swipe detection; closed chutes ignore input |
| Onboarding | 8 | Ghost fingertip, rule shown in the table, wrong answers reveal the right chute |
| Replayability | 8 | Endless generated rule rounds, shuffles, memory rounds, score/multiplier chase |
| Performance | 9 | One background blit, a handful of sprites and tweens |
| Technical robustness | 8 | Rule generator guarantees exactly one valid chute per block; clean restart verified |
| Overall polish | 8 | Complete loop with live attract scene and informative game-over text |

## Next recommended action
Add compound rules ("red squares" vs "the rest") for rounds 12+, and a colour-blind toggle that enlarges the pips.
