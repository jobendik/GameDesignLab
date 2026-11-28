---
id: PhoneGameLab2/gobblepot
title: Gobblepot
was: hole-chase / "Hole Chase"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Hole Chase": drag a black hole over random coloured circles; anything smaller than the hole is swallowed and the hole
grows; 30-second timer. A placeholder take on a well-known commercial "hole swallows the city" game.

## Baseline assessment
2/10. A ~25-line prototype: v1 engine calls, no splash/end card, flat circles, no art, no goal (the timer simply
ends), absolute finger-under-hole control that hides the hole, no decisions beyond "touch everything".

## Weaknesses identified
- Imitates a specific commercial game with no twist of its own; no identity or character.
- No reason to choose *what* to eat or in which order — growth is the only goal and it is automatic.
- Control puts the finger on top of the thing you need to see.

## Creative opportunities
- Fiction: a storm dumped everybody's clutter in Bun's garden; Bun (tidy gardener) rides the rim of a magic pot.
- Make ORDER matter: reward eating in rising size, so a big pot sweeping over leaves hurts itself.
- Gardens give natural hazards the commercial game does not have: flowers you must not eat, a napping friend.

## Planned improvements
Relative-drag control, size-gated gobbling with suction and wobble, the tidy ladder, per-garden goal and sunset clock,
four handcrafted gardens then endless mixes, Bun as an actor, baked toy art, full v2 loop, tests.

## Implemented improvements
- **Control**: drag anywhere — the pot follows the finger's *movement* (×1.15, damped), so the finger never covers it;
  arrow keys / WASD steer too. Clamped to the lawn.
- **Gobbling**: anything whose radius is < 88 % of the mouth slides in (gentle suction near the rim, spins down into
  the swirl clipped to the hole); bigger things wobble with a knock ("Too big! Gobble more first."). Area-based growth.
- **The tidy ladder (the twist)**: each gobble the same size or bigger keeps the ladder; a size step up raises the
  multiplier (×2…×8); anything smaller drops it to ×1. Items on the next rung twinkle; an 8-icon ladder strip and the
  ×N sit in the panel. Clean the small stuff first, then climb leaf → acorn → apple → flowerpot → bucket → gnome →
  wheelbarrow → bench.
- **Gardens**: tidy goal by value (60 % → 80 %) before the sun (30 s → 25 s) sets; emptying a garden ends it early;
  bonus for margin over the goal, time left and tulips kept. Front Lawn → Tulip Walk (tulip beds: −3 s and the
  ladder) → Windy Orchard (telegraphed gusts push light litter and blow fresh leaves in) → Momo's Nap (a napping Momo
  on a picnic blanket; a huge pot spits him out, cross, −4 s) → endless mixed yards.
- **Bun as actor**: rides the back rim, leans and hops with speed, looks where she is going, holds a star wand, gasps
  at big gobbles, cheers high ladders, looks sad at tulips, gets scared in the last seconds; speech-bubble tutorial.
- Art: striped spring lawn framed by a hedge (baked), procedurally drawn toy clutter (baked per size), lavender swirl
  with spiral arms and orbiting sparkles. Pitch-coded pops (bigger = lower), combo ladder notes, thuds and shake scaled
  to size, last-5-seconds ticks, bounce music whose intensity follows the sun. Live attract scene behind the splash.
  `orient:"any"` with a side panel in landscape.

## Test results
- Automated-gameplay: `node tools/run-tests.js gobblepot` — pass, three consecutive runs (real mouse drag steers and
  gobbles, score/HUD/growth, ladder ×2/×3 and reset, too-big gnome, tulip penalty, Momo spit-out, keyboard steering,
  emptied garden → next garden with beds, sunset below goal ends the run, clean restart).
- Automated-technical: `node tools/smoke.js gobblepot` — pass, 61 fps.
- Visual inspection: 390×844, 844×390, 1280×800, splash and the Momo's Nap garden captured and checked (two rounds;
  fixed overlapping goal tick/label, item shadows, how-to wrapping, free gobbles under the start position).
- Balance: scripted greedy bots (perfect aim, 380 px/s) clear garden 1 in ~10 s and reach gardens 2–7; they lose to
  tulip penalties because they ignore the beds, which a human will not. Times were trimmed from 35 s to 30 s.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- The ladder is the depth; how readable it is to a first-time player rests on the twinkles + bubbles (untested on humans).
- Only one layout per garden type (random placement inside it); no scrolling bigger worlds.
- Large-landscape desktop panel has spare vertical space.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Gobble-and-grow is instantly satisfying; the goal + sunset adds pressure |
| Mechanical depth | 7 | Ladder ordering vs. sweeping, tulip routing, when to tackle big pieces |
| Game feel | 7 | Suction, spin-down, size-scaled pops/thuds/shake, pulse on gobble |
| Visual identity | 8 | Toy garden, lavender swirl, Bun on the rim — distinct from the hole genre's look |
| Animation quality | 7 | Eased pot growth, wobbling too-big items, Bun hop/lean, Momo's hop |
| Audio quality | 7 | Pitch = size, combo ladder notes, ticking sunset; bounce music tied to time |
| Controls | 8 | Relative drag never hides the pot; keyboard works |
| Onboarding | 7 | Three how-to lines plus contextual Bun bubbles and next-rung twinkles |
| Replayability | 7 | Random gardens, escalating hazards, score heavily skill-driven |
| Performance | 8 | Baked sprites, bounded items; smoke 61 fps |
| Technical robustness | 8 | Resize remaps the garden, clean restart, test passes 3× |
| Overall polish | 7 | Complete loop; a few UI corners (desktop panel) are plain |

## Next recommended action
Human playtest of the ladder readability; consider a short "ladder" demo in the first garden.
