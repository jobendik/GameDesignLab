---
id: PhoneGameLab2/stew-patch
title: Stew Patch
was: brick-blast / "Brick Blast"
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
"Brick Blast": a 10×8 grid of four flat colours; tap a group of 2+ touching bricks to remove it, bricks above fall,
score = n², twelve moves and the run ends.

## Baseline assessment
A 42-line placeholder (2/10): no splash loop, no feedback, no animation, a fixed 12-move budget with no goal, pure
luck in which groups exist. Same genre as the already finished Phone Game Lab sibling **Shoo!** (tap-a-flock SameGame).

## Weaknesses identified
- No decisions beyond "tap the biggest group"; nothing to plan towards, no difficulty curve, no fail state worth the name.
- No identity, no character, hardcoded pixel layout, v1 engine calls.
- As a collapse game it would simply duplicate Shoo!.

## Creative opportunities
- Keep the verb (tap a group of touching, matching things) but change the *consequence*: nothing falls — the board
  grows back from its neighbours, so removing a group is also a way of planting.
- A gardener pal (Bun) and a queue of hungry pals give the pulls a purpose (orders) and a budget (days).

## Planned improvements
Living-garden regrowth rule with a faithful peek preview, orders that need one big pull, a day budget that orders
refill, late crops/hazards, Bun as an actor, full v2 loop, tests.

## Implemented improvements
- **New core rule**: a pulled plot is taken by whichever crop touches it most (8 surrounding plots vote, the bigger
  patch wins ties), creeping two plots deep; the middle of a very big pull is re-sown at random. Weeding the two
  carrots between two cabbage patches fuses them into one field. No gravity, no refill from above — a different game
  from Shoo!.
- **Hold to peek**: pressing a patch lifts it and shows, plot by plot, exactly what will grow back ("?" = wild), with
  the pull size against the matching order; slide to scrub other patches, slide off the bed to cancel. Tap = pull.
- **Orders**: two pals at the gate each want "N+" of a crop *in one pull*; N rises by one with every order (4, 5, 6 …).
  Every pull costs a day, a filled order pays three back (cap 12). Each new order sows three seeds of its crop.
  Progress bars show the biggest patch of each ordered crop; a ready order's card turns green.
- **Late-game variety**: blueberries (5th crop) after three orders; golden veg (doubles a pull) after two; molehills
  after six (block growth, flattened by a 4+ pull next door); the lawn warms to dusk as days run low.
- **Bun as actor**: hops out to every pull (stretch in the air, squash on landing), looks at the finger, gasps at big
  pulls, cheers on orders, frets when two days are left, slumps at sundown; speech-bubble tutorial for the first moves.
- Scoring n(n+1)/2 per pull, ×2 golden, +50 bumper (15+), order bonus 10×N + 5 per extra veg.
- Baked veg sprites and lawn, plot tiles that fuse into fields, pot that bounces as veg fly in, pitch-coded sounds,
  music intensity tied to days left, attract mode, `orient:"any"` with a side-panel landscape layout, keyboard cursor.

## Test results
- Automated-technical: `node tools/smoke.js stew-patch` — pass (61 fps).
- Automated-gameplay: `node tools/run-tests.js stew-patch` — pass, three consecutive runs (regrowth rule incl. tie-break
  and wild middle, scoring, order fill + day refund, golden veg, molehills, touch tap, hold-peek + cancel, keyboard,
  5th crop unlock, out-of-days end, clean restart).
- Visual inspection: 390×844, 844×390, 1280×800 and the splash card were captured and checked (two rounds).
- Balance: a scripted random player lasts 6–23 pulls (0–8 orders); a greedy player that uses the peek data lasts
  40–75 pulls (20–32 orders), so skill is strongly visible in the score.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- The regrowth rule is learned through the peek rather than stated; a first-time player may need a few pulls to see
  why the bigger field wins a tie.
- The first four or five orders are often ready the moment they arrive (intended warm-up, but slightly automatic).
- Peek badges are small (≈20 px) on an 844×390 phone.
- No undo; a mis-tap costs a day.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Growing a field and cashing it in one pull is satisfying; every pull visibly reshapes the garden |
| Mechanical depth | 8 | Weeding vs. harvesting, two competing orders, tie-breaks by field size, day budget; bots show a wide skill range |
| Game feel | 8 | Instant press preview, staggered pop-out, veg arc into a bouncing pot, regrowth in waves, Bun hop with squash |
| Visual identity | 8 | Sunny kitchen garden, fused pastel plot tiles, hand-drawn veg; reads from a thumbnail |
| Animation quality | 8 | Sprouts → outBack growth, swaying crops, card slide/pulse, pal reactions |
| Audio quality | 7 | Pitch tracks pull size, rising pops into the pot, order chime; music tightens as days drop |
| Controls | 8 | Tap, hold-and-scrub peek with cancel, keyboard cursor; whole-cell hit targets (≥46 px) |
| Onboarding | 7 | Bun's speech bubbles teach tap → regrow → peek in three moves; rule nuance learned by peeking |
| Replayability | 8 | Random gardens, rising orders, late crops/hazards, clear best-score chase |
| Performance | 9 | Baked sprites, 42 cells, bounded particles; 61 fps in smoke |
| Technical robustness | 8 | Clean restart, resize-safe layout, no timers outside the game clock, exposed hooks |
| Overall polish | 8 | Complete loop with attract scene and friendly "Sun's down!" card |

## Next recommended action
Human playtest of the first minute to confirm the regrowth rule lands without reading; consider a one-step undo.
