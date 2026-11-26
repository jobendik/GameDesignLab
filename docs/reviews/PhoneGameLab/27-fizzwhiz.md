---
id: PhoneGameLab/27-fizzwhiz
title: Fizzwhiz
was: 27-jetpack (Jetpack Hold)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Hold-to-thrust side scroller: hold to rise, release to fall, dodge "lasers", pick up coins.

## Baseline assessment
35-line imitation of a well-known jetpack runner: a blue circle, red rectangles spawned at random heights (often
unavoidable), coins read back out of the HUD DOM to score, death by leaving the screen, one beep. Overall 2/10.

## Weaknesses identified
Unfair random hazards with no patterns; floor and ceiling kill; no momentum feel; coins meaningless; no speed curve
tied to visibility; no identity, world, audio or progression.

## Creative opportunities
Hold-to-thrust is at its best when the safe line and the rewarding line differ — so pay the player for flying close
to danger, and cash that in as a power fantasy. Give the thrust a physical, funny source (a shaken soda bottle).

## Planned improvements
Authored hazard patterns with cap trails, safe floor/ceiling, FIZZ meter fed by close shaves, overdrive, two pickups
including a vehicle with different controls, original boardwalk-at-sundown identity, speed capped by look-ahead.

## Implemented improvements
- **Feel**: thrust −2300 u/s² vs gravity +1700, clamped speeds, safe boardwalk (running legs, landing squash + dust) and
  safe awning (bonk sparks); foam spray particles and a hiss while thrusting; lean, scarf and tail follow velocity.
- **Twist — FIZZ**: caps add 0.6 %, a *close shave* (passing within 22 u of a hazard) adds 20 % and +10. Full meter =
  **SHAKEN!** — 4.5 s of ×1.7 speed, invincibility, cap magnet and hazards smashed for +15; it ends with a shockwave
  that clears what is directly ahead plus 1.3 s of grace.
- **Hazards with their own look**: festoon wires (level, posts from floor/awning, gates, slaloms, diagonals, spinners),
  catherine wheels (pairs, zig-zags, bobbing later), firework rockets that track your height for 1 s, lock with a
  flashing marker and sight line for 0.45 s, then launch.
- **12 authored patterns**, unlocked over three tiers; each lays its caps along a safe route so the trail teaches the
  dodge (the spinner instead rings itself with caps as bait). First 10 s: caps only, then single level wires.
- **Pickups**: magnet (9 s) and a **bumper car** — tap flips it between boardwalk and awning, it absorbs one hit and
  lasts 14 s. One-button, but a different control scheme mid-run.
- **Fairness**: hit radius 13 u on a ~50 u fox, wheel/wire hitboxes inset, top speed capped to 1.3× the visible
  look-ahead so narrow portrait screens never outrun the view; on tall screens the pier is raised so the thumb rests
  on empty "under the pier" space instead of covering the action.
- **Progression**: every 400 m is a milestone (banner, pool of patterns widens, sky moves sunset → dusk → night with
  fireworks → dawn); score = metres + caps + bonuses.
- **Identity**: procedural fox with goggles and a strapped-on soda bottle, striped awning, plank boardwalk, parallax
  pier with roller coaster, turning Ferris wheel, tents and lamps; funk music whose intensity follows speed and FIZZ.
- **Audio**: cap pickups climb a pentatonic ladder while a streak lasts, shave = swish + star pitched by the meter,
  rocket warning/whoosh, crunch + glass for smashes.

## Test results
- Smoke (`node tools/smoke.js 27-fizzwhiz`): pass, 61 fps headless, survives landscape resize + blur.
- Gameplay test (`tests/PhoneGameLab/27-fizzwhiz.test.js`): pass 4/4 runs — close shave under a hanging wire, real
  pointer hold/release and Space thrust, in-page pilot collects 15+ caps along the trail, overdrive starts on a full
  meter and smashes a wire, overdrive ends, bumper car flips on a touch tap and absorbs a hit, unprotected hit ends the
  run, best saved, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800: splash, early play, overdrive, bumper car, night tier, game
  over. Fixed after inspection: tiny sprites in landscape (rescaled), short look-ahead in portrait (pier raised, speed
  cap), weak hazard contrast, HUD text size. An 80 s scripted run reached 609 m without errors.
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- Rockets, spinners and bobbing wheels were verified by code and one night-tier screenshot, not by a dedicated test.
- The under-pier area on portrait screens is plain.
- Pattern pool is 12; after ~1200 m variety comes only from speed and extra rockets.
- Cap economy and tier length (400 m) are reasoned, not human-tuned.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Punchy thrust, readable patterns, overdrive pay-off |
| Mechanical depth | 8 | Risk/reward shaves, meter management, vehicle with different control, magnet |
| Game feel | 8 | Foam jet, squash, lean, hit-stop on smashes, speed lines |
| Visual identity | 8 | Sundown boardwalk and soda-bottle fox are distinctive |
| Animation quality | 8 | Running/flying fox, scarf, turning Ferris wheel, spinning caps, flipping car |
| Audio quality | 7 | Informative ladders and warnings; synthesized presets only |
| Controls | 8 | Hold anywhere / Space; instant; generous hitboxes |
| Onboarding | 8 | Caps-only opening, HOLD prompt, cap trails teach each pattern |
| Replayability | 7 | Random pattern order, pickups, score chase; finite pattern pool |
| Performance | 8 | Baked sprites; particles bounded by the engine cap; 61 fps headless |
| Technical robustness | 8 | Unit world rescales on resize, clean restart, engine pause |
| Overall polish | 8 | Cohesive loop with milestones and a proper death tumble |

## Next recommended action
Human playtest for the FIZZ economy; add 4–6 more patterns and a second vehicle for runs past 1 km.
