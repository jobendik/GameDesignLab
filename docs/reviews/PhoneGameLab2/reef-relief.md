---
id: PhoneGameLab2/reef-relief
title: Reef Relief
was: clean-the-ocean / "Clean the Ocean"
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A claw slides left–right along the top of a flat blue screen; tap to drop it straight down; it grabs any grey square it
touches and brings it up for one point. Thirty-second timer, eight squares.

## Baseline assessment
~35 lines. Playable for one round but lifeless: linear claw, no weight, no hazards, no decisions, no audio beyond a beep,
squares for art, timer drawn in a corner, `Lab.win` with a string, no splash metadata, no best score.

## Weaknesses identified
- The claw had no physics: constant speed down and up regardless of what it carried.
- Nothing to avoid and nothing to choose between — every square was the same.
- No pressure beyond a countdown; no progression; no character.

## Creative opportunities
- Make the claw a real pendulum on a winch so that weight, sway and reel time become the game.
- Give the "clean the ocean" fiction teeth: the junk includes the thing that is causing the deadline (a leaking drum).
- Sea life as moving obstacles you must *not* touch, so the trash behind them becomes a timing problem.
- Nori, the precise penguin, as the winch operator who visibly strains, panics and celebrates.

## Planned improvements
Pendulum claw under a salvage boat; seven junk types with weight/value; creatures; oil-slick clock fed by leaking drums;
quota per haul; pick-one-of-three upgrades between hauls; four times of day; landscape support; streak multiplier.

## Implemented improvements
- **Physical claw**: sine pendulum swing; on tap the rope pays out along the swing with decaying angular follow-through;
  a grab closes the fingers with hit-stop and a rope stretch; the load then hangs and sways as a damped pendulum while it
  is reeled at `500/(1+0.9·weight)` px/s (a can zips, a tyre crawls, the drum takes ~4 s); the boat dips and heels,
  the winch loop drops in pitch, the rope vibrates and Nori leans, sweats (`hot`) and cranks.
- **The slick**: every drum on the seabed leaks blobs that feed an oil slick creeping along the surface toward the boat —
  the haul's clock. Hauling the heavy drum plugs the leak (slick rate falls by a third): slow now, more time later.
  A full slick below quota ends the run; at/above quota it ends the haul. The check waits for the claw, so a last grab counts.
- **Creatures**: fish, turtles (haul 3+) and jellies (haul 2+) wander between claw and junk. A grabbed creature is let go
  at once ("Sorry!") but adds 4 % slick and breaks the streak; a jelly zaps and stuns the claw for 0.9 s (+6 %).
  Ghost nets (haul 3+) hold a trapped fish that swims free with a heart and a bonus.
- **Upgrades**: after each haul pick one of three cards — Turbo Winch, Big Claw, Oil Boom, Fish Whistle (creatures
  sidestep the falling claw), Sonar Line (dotted prediction of the drop; level 2 rings the first thing it will hit).
- **Scoring**: value by weight (10–100), clean-grab streak ×1…×2, spotless-reef bonus scaled by slick left and haul.
- **Ramp**: more junk (8 → 15), higher quota share (50 → 75 %), faster swing, second drum at haul 4, more creatures;
  sky/sea palette cycles morning → noon → sunset → night (glowing jellies, HUD retinted with `Lab.setTheme`).
- **Nori as actor**: eyes track the claw, `think` while aiming, `wow` on a grab, `focus` + sweat on heavy loads,
  `scared` + open beak on a creature, cheer-hop on delivery, `sad` on the game-over frame.
- Layout from stage size (`orient:"any"`): the swing fan is computed so the whole seabed is reachable at 390×844,
  844×390 and 1280×800; entities keep normalised positions across resize. Keyboard: Space/↓ drops, 1–3 pick a card.
- Live attract scene behind the splash (the claw fishes by itself using the same predictor as the sonar).

## Test results
- Smoke (`node tools/smoke.js reef-relief`): pass, 61 fps.
- Gameplay test (`node tools/run-tests.js reef-relief`): pass three times in a row (26 s). Covers a genuinely timed drop
  on the live swing, tap and Space drops, can-vs-tyre reel speed, streak scoring, fish and jelly penalties, drum plugging
  the leak, quota → shop → card tap → haul 2, slick loss, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (play in three palettes, shop, splash); two rounds. Fixed: hint
  line colliding with seabed junk (now a toast), tiny HUD/boat in landscape, Nori hidden behind the gunwale.
- Subjective playtest: informed judgement from code + scripted play, not a human playtest.

## Remaining issues
- Jellies drift slowly, so one can sit over a piece of junk for several seconds (it is a timing window, but can feel stubborn).
- The drop cannot be steered or cancelled once released; a "let go" tap during a slow reel was considered and left out.
- Upgrades are picked, not bought — there is no economy to plan around; after ~13 hauls every upgrade is maxed.
- Balance beyond haul 6 is judged from the numbers only.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Timing the swing is instantly readable; drum/creature/quota tension gives each haul an arc |
| Mechanical depth | 7 | Drum-first vs quick cans, streak protection, upgrade builds; still a one-button game |
| Game feel | 8 | Follow-through, grab hit-stop, weight-dependent reel, boat heel, winch pitch, rope vibration |
| Visual identity | 8 | Toy salvage boat, four seas, procedural junk and creatures; recognisable from a thumbnail |
| Animation quality | 8 | Claw fingers, swaying load, Nori reactions, darting fish, pulsing jellies, card pop-in |
| Audio quality | 7 | Winch loop carries weight, combo ladder on streaks, zap/sorry cues, music tightens with slick |
| Controls | 8 | One tap anywhere / Space; sonar upgrade for precision; cards are large targets |
| Onboarding | 8 | First tap teaches; toasts explain creatures, quota and the leak when they first matter |
| Replayability | 7 | Random layouts, upgrade order, four palettes, escalating hauls; no meta-progression |
| Performance | 9 | Baked background and junk sprites, ≤46 bubbles, a few dozen entities; 61 fps in smoke |
| Technical robustness | 8 | Clean restart verified, resize keeps entities via normalised coords, loop audio stops on end |
| Overall polish | 8 | Splash attract, shop, banners, palette-aware HUD; no placeholder art left |

## Next recommended action
Human playtest of hauls 4–8 for slick/quota balance; consider a coin economy for the shop and a rare "treasure" piece
that is worth a lot but sits under a jelly.
