---
id: PhoneGameLab2/jampoline
title: Jampoline
was: berry-bounce (Berry Bounce)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Tap to drop a berry; it bounces off three randomly tilted platforms and, with luck, lands in a basket.

## Baseline assessment
45-line placeholder: the only input was "drop", so the outcome was decided by the random layout, not the player;
unswept collision, flat rectangles, one beep, instant game over on the first miss, no best score. Overall 2/10.

## Weaknesses identified
No agency (pure luck), unfair one-miss failure, no feedback or identity, no progression.

## Creative opportunities
Hand the platforms to the player: draw a springy leaf in the air and the berry bounces off it like a ball off a
bat. Bun, the anxious gardener-baker, is the natural owner of the basket and reacts to every near miss.

## Planned improvements
Player-drawn one-bounce leaves with an honest bounce trace; hearts instead of sudden death; pies as levels; level
furniture that keeps the "platforms" idea (mushrooms, hanging logs); moving basket, multiple berries and wind later.

## Implemented improvements
- **Draw the platform.** Drag anywhere to draw a leaf (≤ 130 px); a tap makes a flat one. Up to two leaves are out at
  once (the oldest is replaced), each is spent after one bounce or 6 s. Fixed-step (240 Hz) circle-vs-capsule physics.
- **Honest trace.** While you drag, each berry that would touch the draft leaf has its bounce traced in dots using the
  very same step function as play (gold dots + Bun's "wow" face when it ends in the basket). The berry keeps falling
  while you adjust, so it is a speed/accuracy trade; from pie 5 the trace is cut to 0.8 s.
- Berries wobble on the bramble before dropping (telegraph); the first one of a run hangs right over the basket.
  Blueberries start with downward speed; golden berries are worth ×3 and give a heart back.
- Hearts ×3 instead of sudden death; six berries bake a pie = level up, with a banner and a one-line intro of what
  changes: tall bouncy mushrooms (+5 trick points per bounce), hanging logs (dull deflectors) and two berries at a
  time, Bun pacing, wind gusts with streak telegraph, smaller basket and three at once.
- Scoring: 10 + tricks, +10 for a double leaf bounce, streak multiplier every 5 catches up to ×4.
- Bun acts: watches the lowest berry, leans the basket up to 30 px toward a ballistic guess of where it will land
  (forgiveness that reads as character), throws her arms up when one is heading for the grass, squashes and beams on
  a catch, flinches with a tear on a splat, hops when a pie is done; the basket visibly fills and shows n/6.
- Identity: honey-yellow golden-hour sky, sage hills, bramble along the top, crimson/blue/gold berries, bright
  leaves that spring and fade, jam splats left on the grass. Boing pitched by impact speed, rising pops as the basket
  fills, "bounce" music that thickens with level and lost hearts. Live attract scene that plays itself.

## Test results
- Smoke (`tools/smoke.js jampoline`): pass.
- Gameplay test (`tests/PhoneGameLab2/jampoline.test.js`): pass — straight catch (+10, HUD), splat (heart, streak),
  a leaf drawn with a real mouse drag at the angle the trace approves bounces the berry in, spent-leaf rule, tapped flat
  leaf bounces a berry upward, mushroom trick points, six berries → pie/level 2 with streak multiplier, third splat →
  game over + best, clean restart. Writing this test exposed a real bug (the drag's start point drifted after the
  first move), now fixed.
- Screenshots inspected at 390×844, 844×390, 1280×800 (drafting with trace, furniture levels, game over).
- Balance probe: a bot that reads the trace perfectly (one leaf per berry) bakes three pies in ~80 s without losing
  a heart; early cadence was tightened afterwards (shorter hang, two berries from pie 3).
- Subjective assessment from scripted play and code reading only (no human playtest).

## Remaining issues
- The full-length trace at pies 1–4 may make single berries too easy for practised players; the pressure there comes
  only from time. Needs human tuning.
- The trace assumes a still world: with Bun pacing or wind it is a guide, not a guarantee (intended, but unexplained).
- Pointer only; no keyboard play.
- Portrait leaves a tall band of empty sky early on (it fills from pie 2).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Drawing a leaf and watching the berry arc into the basket is immediately satisfying |
| Mechanical depth | 8 | Angle + position + timing, double bounces, trick routes via mushrooms, multi-berry triage |
| Game feel | 8 | Leaf springs, berry squash, basket fills, pitch-by-speed boing, shake on splat |
| Visual identity | 8 | Golden-hour orchard; distinct from the batch's night nook, lawn and ice |
| Animation quality | 8 | Wobble telegraph, spring/fade leaves, Bun's lean, hop, flinch |
| Audio quality | 7 | Informative but small palette |
| Controls | 8 | One-finger draw or tap, generous clamps; no keyboard |
| Onboarding | 8 | First berry is a free catch; the trace teaches the bounce without text |
| Replayability | 7 | Five escalating twists then randomised furniture; score/streak chase |
| Performance | 9 | ≤ 3 berries, trace ≤ 3 × 1000 light steps per frame while dragging, baked backdrop |
| Technical robustness | 8 | Restart/resize remap, timers on game clock |
| Overall polish | 8 | Complete, characterful loop |

## Next recommended action
Human playtest of the trace length vs difficulty; consider a "no-trace" hard mode and a bird that steals slow berries.
