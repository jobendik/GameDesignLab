---
id: PhoneGameLab/38-tumblepeg
title: Tumblepeg
was: 38-plinko (Plinko)
status: transformed
baseline: 2
score: 7
updated: 2026-11-26
---
## Original concept and core mechanics
Drop a disc from the top of a peg board; it bounces down through staggered pegs into scoring slots at the bottom.

## Baseline assessment
57-line prototype named after a TV game: tap to "bet 10 coins", random sideways jitter on every peg hit (pure luck, no
agency), variable-timestep single-pass collisions, money/multiplier framing, no end state, one beep. Overall 2/10.

## Weaknesses identified
No decisions at all after the tap; gambling framing; physics noise injected with `Math.random`; no round structure, no
fail state, no best score; white dots on navy with canvas default font.

## Creative opportunities
Make the drop a real choice (deterministic physics + a short path preview), give the player something to do while the
marble falls (nudges), put targets *on* the board (glow pegs) so the route matters as much as the cup, and bolt a new
gadget onto the cabinet each round so the board keeps changing.

## Planned improvements
Toy-cabinet identity with no money imagery; quota rounds of five marbles; multiplier pegs; limited nudges; golden last
marble; gadgets (bumpers, catcher cup, spinner, sliding row, carousel cups); deterministic fixed-step world with a dry run.

## Implemented improvements
- Deterministic 240 Hz fixed-step marble physics (pegs, wall, cup dividers, kicking rubber bumpers, a rotating spinner
  bar with point velocity, a sliding peg row); no randomness in flight; a marble can never balance on a peg or wedge
  (wall gap wider than the marble, free jiggle if it ever stalls).
- The same `step()` runs dry for the dotted aim preview (first bounces) and for `dry(x)`, which the test uses to
  predict exact outcomes.
- Round structure: 5 marbles vs a quota (bar in the header, "Quota met" moment); miss it and the run ends; the fifth
  marble is golden and counts double (a built-in comeback).
- Decisions: three glow pegs (one always in the top rows, within aiming reach) add ×1 each to the marble that pings
  them; three cabinet thumps per round (tap left/right or arrow keys) shove the falling marble; the catcher cup returns
  the marble; carousel cups shift after every marble so the plan changes.
- Five authored rounds introduce the gadgets one at a time ("New: Spinner" toast), then endless rounds draw 3–4
  gadgets and a shuffled cup row with a rising quota.
- Identity: peach-and-denim toy cabinet with a coral frame, cream pegs, star glow pegs, glossy marbles with spin marks.
  Pegs ring like a kalimba (note = column/row, volume = impact), multiplier pings climb a pentatonic ladder, cup landings
  are pitched by value; shake/hit-stop/flash only on big landings.
- Live attract mode behind the splash (the cabinet plays itself); keyboard support (arrows aim/nudge, Space drops).

## Test results
- Smoke (`node tools/smoke.js 38-tumblepeg`): pass, 61 fps headless, survives resize/blur.
- Gameplay test `tests/PhoneGameLab/38-tumblepeg.test.js`: pass (20 s) — real mouse drag-release drop whose score equals
  the dry-run prediction, Space drop, tap + arrow-key nudges, golden last marble (doubled, exact) carrying the round over
  its quota → round 2 with bumpers, a deliberately poor last marble → "Quota missed" game over, best recorded, clean
  restart. Four marbles are played in real time; a `left` test hook skips the others.
- Screenshots inspected at 390×844 (aim, mid-fall with spinner/cup, splash) and 844×390.
- Dry-run tuning: 300 random drops per round to set quotas (random play clears rounds 1–2 comfortably, is roughly a coin
  flip by round 4 and falls short from round 6 without glow pegs/nudges/catches).
- Fun/feel is an informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- The board is chaotic by nature: after the first two or three bounces the landing cup is close to uniformly random,
  so skill shows mainly through glow-peg routing, nudges and catcher timing — a lucky/unlucky round still happens.
- Portrait-only layout: on an 844×390 landscape phone the cabinet is small (playable, not comfortable).
- One marble at a time; no multi-ball or between-round upgrade choice.
- Quotas were tuned by simulation only.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Drop → pings → nudge → landing is satisfying; quota gives every marble stakes |
| Mechanical depth | 6 | Aim via preview, glow-peg routing, 3 nudges, catcher timing; luck still large |
| Game feel | 8 | Peg pulses, musical pings, multiplier pop, scaled landing bursts, cabinet thump |
| Visual identity | 7 | Distinct peach/denim toy cabinet; simple shapes |
| Animation quality | 7 | Chute damping, peg/bumper pulses, sink-in, carousel slide, spin marks |
| Audio quality | 8 | Kalimba peg notes, pentatonic multiplier ladder, value-pitched landings, music intensity by round |
| Controls | 8 | Drag/keys aim, release/Space drop, half-screen nudge taps with cooldown and pips |
| Onboarding | 8 | Round 1 is plain and easy; gadgets introduced one per round with a toast |
| Replayability | 6 | Endless shuffled rounds and best score; no meta choices |
| Performance | 9 | One marble, ~80 colliders, baked board; 61 fps headless |
| Technical robustness | 8 | Board-space physics independent of resize, clean restart, state machine without timers |
| Overall polish | 7 | Complete loop with attract mode; landscape is weak |

## Next recommended action
Human playtest of quota pacing; consider a between-round pick (extra nudge / extra glow peg / wider catcher) to add
run-to-run strategy, and a landscape layout with side panels.
