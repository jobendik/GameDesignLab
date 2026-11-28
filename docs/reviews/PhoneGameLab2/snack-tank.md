---
id: PhoneGameLab2/snack-tank
title: Snack Tank
was: hungry-fish / "Hungry Fish"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Hungry Fish": drag a fish past grey rock circles to a food dot; touching a rock ends the run; reaching the food
regenerates the level with one more rock.

## Baseline assessment
2/10. A ~20-line prototype: the fish teleports to the finger (so the rocks are trivially avoidable or instantly fatal),
no art, no splash/end loop, no scoring beyond a level counter.

## Weaknesses identified
- The "maze" has no skill: the fish follows the finger exactly.
- Several finished siblings already own the underwater space with other verbs: Top Frog (eat to grow), Fin Focus
  (photograph), Reef Relief (claw out junk), Fish Fizz (bubble shooter). A "be the fish" game would collide with Top Frog.

## Creative opportunities
- Flip the point of view: you are the *feeder*. Fish are hungry, and fussy; food sinks in different ways; fish move.
- Bolt (tinkerer) running the pet shop aquarium gives a reason, a character on the rim, and gadget hazards (bubbler).

## Planned improvements
Tap-to-drop with per-snack sink physics, species ↔ snack matching, hunger rings and tummy pips, grow-and-leave loop,
streak multiplier, tank levels with new kinds and hazards, Bolt as an actor, full v2 loop, tests.

## Implemented improvements
- **Core verb**: tap the water — Bolt zips along the rim and drops the snack he is holding (shown in his hand, the
  next two in the panel). Pellets plunge, flakes flutter slowly, algae wafers glide sideways, shrimp sink steadily, so
  every drop is a lead-the-target decision. A matching fish within reach noses toward its snack (generous); a
  non-matching fish bumps it sideways once — a bumped snack that still reaches the right fish is a ×2 "Bank!".
- **Pressure**: each fish has a hunger ring in its thought bubble (green → amber → shaking red); empty = the fish
  sulks on the sand and one of three hearts is lost. Snack choice in the queue is weighted toward hungry fish.
- **Loop**: three snacks (four from tank 4) grow a fish: it wiggles, swims off (+50 × tank) and a baby arrives.
  Four grown fish = next tank: 3 → 5 fish, 2 → 4 kinds (Leafy at tank 2, Blush at tank 3), faster hunger, the greedy
  PUFFER that gulps any snack (route drops around it) at tank 4, a BUBBLER column that lifts snacks at tank 5, night
  lights at tank 6. Streak multiplier ×1…×5 (+1 per two clean feeds); a wasted or gulped snack breaks it.
- **Bolt as actor**: rolls on a rail wheel, looks at the last snack, throws with arms up, cheers grown fish, frets when a
  ring is low, slumps on a hangry fish; speech-bubble tips introduce each new rule once.
- Art/audio: baked shop wall + cabinet tank, light shafts, sand with pebbles and a castle, swaying leafy kelp, rising
  bubbles; procedurally drawn fish that turn by squashing through the flip, open their mouth to chomp, frown when
  bumped. Drop plips pitched per snack, bubbles rising in pitch with the streak, combo ladder notes, low-hunger tick,
  funk music whose intensity follows the hungriest fish. Live attract tank behind the splash; `orient:"any"`.

## Test results
- Automated-gameplay: `node tools/run-tests.js snack-tank` — pass, three consecutive runs (real touch tap drops a snack
  that sinks onto the matching fish; wrong fish bumps it and it is wasted, streak lost; streak multiplier 10+20+20+30;
  third snack grows the fish +50; fourth grown fish opens tank 2 and babies arrive; keyboard drop; puffer at tank 4;
  hangry fish costs a heart; three hearts end the run; clean restart).
- Automated-technical: `node tools/smoke.js snack-tank` — pass, 61 fps.
- Visual inspection: 390×844, 844×390, 1280×800, splash and tank 6 (night, puffer) captured and checked (two rounds;
  fish enlarged, leafy kelp, night overlay moved under the fish so they glow instead of dimming).
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Pellets in a tall portrait tank take ~4 s to reach the sand; fine for leading, but a waste is noticed late.
- Landscape (844×390) is shallow: fish and bubbles are small and Bolt is squeezed between panel and rim.
- Difficulty beyond tank 6 only rises through hunger speed; no further new hazard.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Leading a sinking snack onto a moving fish is satisfying; the queue keeps you juggling |
| Mechanical depth | 7 | Four sink behaviours, bumps/bank shots, puffer routing, prioritising the hungriest |
| Game feel | 7 | Instant drop, chomps, bumps, sulks; streak pitch ladder |
| Visual identity | 7 | Cosy shop aquarium with Bolt on the rim — distinct from the open-sea siblings |
| Animation quality | 7 | Fish wag, turn, chomp, sulk, wiggle when grown; kelp sway; Bolt throws |
| Audio quality | 7 | Pitch carries streak and snack; funk intensity follows hunger |
| Controls | 8 | One tap anywhere in the water; keyboard aim + space |
| Onboarding | 7 | Wanted snack drawn in each fish's bubble; Bolt explains each new rule once |
| Replayability | 7 | Random fish/queues, six escalating tanks, hearts make runs vary |
| Performance | 8 | Small entity counts, baked background; smoke 61 fps |
| Technical robustness | 8 | Resize remaps the tank; clean restart; test passes 3× |
| Overall polish | 7 | Complete loop; landscape is a bit cramped |

## Next recommended action
Human playtest of hunger pacing at tanks 4–6; consider one more late hazard (a snail on the glass, a current).
