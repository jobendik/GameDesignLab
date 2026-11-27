---
id: PhoneGameLab/35-teeter-torte
title: Teeter Torte
was: 35-cake-tower (Cake Tower)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Tap to drop a "swinging" layer onto a tower; the overhang is trimmed and the next layer is that much narrower; a
complete miss ends the run.

## Baseline assessment
36-line prototype: the layer did not swing, it slid left-right at constant speed and teleported onto the stack on tap —
mechanically identical to its neighbour 36-sky-high. Flat hue-cycled rectangles on dark purple, no fall, no weight, no
goal, one beep, no best score. Overall 2/10.

## Weaknesses identified
No pendulum, no physics, nothing cake-like; a width that only ever shrinks (a death spiral with no recovery); no
milestones; indistinguishable from the other stacker in the collection.

## Creative opportunities
Take "swinging" and "cake" literally: a real pendulum whose bob keeps its velocity, a soft tower that sways and can go
over, and bakery orders that give the run a rhythm of small finished things.

## Planned improvements
Pendulum crane with carried momentum; springy tower with lean and topple; orders with a cherry to finish; special layers;
perfect-drop regrowth; aim ghost for the first orders; pastel patisserie identity; tests.

## Implemented improvements
- **Pendulum drop**: the layer hangs from a brass crane on a rope and is released with the bob's true velocity, then
  falls under gravity (sub-stepped) — so you let go early, and by a different amount as the swing speeds up. The first
  two orders show a dashed ghost of where it would land right now (it turns red inside the perfect window).
- **Springy tower**: the whole cake pivots on the stand as a damped spring. Each landing shoves it by the layer's
  sideways speed and off-centre weight; the pile's centre of mass sets a standing lean; it sways slower and wider with
  every layer; past ~10° it goes over (TIMBER — costs a spare, the same order restarts). Dropping against the sway calms
  it, dropping with it feeds it; waiting it out burns the freshness bonus.
- **Slicing and recovery**: overhang is cut off as a tumbling slice and the next layers come narrower; a PERFECT (±7 u)
  snaps true, keeps full width, wins back 6 % and builds a streak with a rising chime. A narrow layer dropped wide
  slips off and costs a spare cherry (three spares, one back every second order).
- **Orders**: each cake is a recipe on a chalkboard ticket — 4 to 9 layers then the cherry (dead centre: +50) — served
  for a bonus (order number + neatness + freshness), then a fresh stand slides in. New recipe wrinkles arrive one at a
  time: jelly layers (shove harder, damp less, visibly jiggle), a drifting crane, tapering wedding tiers, dense fudge
  (steadies the cake), a swing that swells and shrinks, then random mixes with a faster, wider swing.
- **Identity**: pastel patisserie — striped pink wall, shelf of jars, bunting, mint counter, porcelain stand; six sponge
  flavours with icing drips, sprinkles, cream line and cut faces; every layer has a tiny face that squints on impact and
  gapes when the cake leans.
- **Feel/audio**: squash wave down the cake on landing, crumbs and slice debris that splat on the counter, shake scaled
  to landing speed, hit-stop + stars on a perfect, boing for jelly, creak when teetering, bouncy music that thickens with
  height.
- Virtual-unit layout (resize never disturbs the cake), attract mode that bakes by itself, clean reset.

## Test results
- Smoke (`node tools/smoke.js 35-teeter`): pass, no errors.
- Gameplay test (`tests/PhoneGameLab/35-teeter-torte.test.js`): pass (20 s) — a real tap releases the layer and it lands
  and scores; a centred drop is PERFECT with no slice; four layers + cherry serve order 1 and bring a five-layer order on a
  fresh stand; an off-centre drop is sliced and narrows the cake; a narrow layer dropped wide misses and costs a spare; a
  hard shove (test hook) topples the tower, costs a spare and restarts the order; no spares ends the run; best saved;
  clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (start with aim ghost, order 3 with jelly, order 5 wedding
  tiers leaning).
- Subjective assessment is an informed judgement from code and scripted play — no human playtest.

## Remaining issues
- Full-width layers cannot miss the cake at all (the swing is narrower than the layer), so early mistakes only cost
  width; the first real danger appears once the cake has been trimmed. Deliberate, but it makes orders 1-2 very safe.
- The topple threshold, shove strength and lean factor were tuned by calculation and a scripted pilot, not by hand; the
  "drop against the sway" skill may be subtler than intended on a real phone.
- The release lead grows with swing speed; without the ghost (order 3+) the first few drops of a session may feel harsh.
- 844×390 landscape shows the portrait stage narrow in the middle.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | The swing-lead-drop rhythm is satisfying; finished cakes give frequent small wins |
| Mechanical depth | 8 | Lead timing, counter-sway drops, patience vs freshness, layer types that change the physics |
| Game feel | 8 | Carried momentum, squash wave, slices, teeter and topple all read physically |
| Visual identity | 9 | Characterful pastel bakery; clearly not the other stacker |
| Animation quality | 8 | Rope swing, jelly jiggle, faces, tumbling debris, stand slide-in |
| Audio quality | 7 | Pitch rises with height and streak; engine presets only |
| Controls | 8 | One tap anywhere / space, answered on press; no buffering needed |
| Onboarding | 8 | Aim ghost for two orders, one-line toasts for each new wrinkle |
| Replayability | 8 | Random recipes and modifiers, streak and neatness chase |
| Performance | 8 | Layers are drawn procedurally each frame (≤ 10 + debris); 60 fps headless |
| Technical robustness | 8 | Virtual units survive resize; verified by test and smoke |
| Overall polish | 8 | Cohesive start to finish |

## Next recommended action
Human playtest of lead distance and topple tuning; consider a short ghost flash on the first drop of every order.
