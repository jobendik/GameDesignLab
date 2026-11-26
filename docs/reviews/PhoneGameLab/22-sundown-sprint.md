---
id: PhoneGameLab/22-sundown-sprint
title: Sundown Sprint
was: 22-traffic-dodge (Traffic Dodge)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Top-down traffic weaving: drag left/right to steer a car through slower traffic; a touch ends the run.

## Baseline assessment
27-line prototype: grey rectangle road, red rectangle traffic spawned at random x (overlapping, sometimes impassable),
absolute drag (car teleports to the finger), score = time, instant death, no sound beyond nothing at all, no best score.
Mechanically a twin of 21-lane-dodger. Overall 2/10.

## Weaknesses identified
No speed, no agency beyond x; unfair random walls; no reward for driving well; no identity or feedback; identical loop to
its sibling.

## Creative opportunities
Make it a *driving* game rather than a dodger: analog steering, a throttle, traffic that behaves like traffic, and an
arcade-racer clock so that speed and nerve — not mere survival — are what the score measures.

## Planned improvements
One-thumb throttle (hold) + relative-drag steering; checkpoint timer as the fail state; close-pass bonus that buys time;
non-lethal spin-outs; lane-changing traffic with indicators; time-of-day stages; warm desert-dusk look.

## Implemented improvements
- **Controls**: touch/hold = accelerate, lift = brake, relative drag = analog steering (1.25× gain, damped car with yaw
  and body jiggle); arrows/A-D steer and Up/W/Space accelerate. Sand shoulders are drivable but slow — an escape route.
- **Clock loop**: 24 s to start; each checkpoint adds time (14 s shrinking to 7 s) while stages lengthen and traffic
  thickens, so a run lasts ~1–2 minutes and ends by attrition, not by one mistake.
- **Close passes**: overtaking with < 15 px of flank clearance at speed pays 30×combo (50× for a "paint swap" under
  6 px), +0.4/0.7 s on the clock and raises a CLOSE combo (×9, 3.6 s to keep alive). Plain overtakes pay +10.
- **Crashes**: spin-out animation, speed cut to 30 %, 1.7 s of mercy, combo lost, the other car is shunted aside.
- **Traffic**: sedans, vans and long trucks with lane-dependent speeds, follow logic (no rear-ending), band limits so a
  wall never spawns, and from stage 2 cars that indicate (amber flashers + tick) and drift a lane.
- **Identity**: plum asphalt, sand shoulders with scrub, cacti and long evening shadows, baked car sprites, low-sun
  tint; each stage moves the clock of the day (Golden Hour → Sunset → Dusk → Night with headlights → Daybreak).
- **Feel/audio**: rev-pitched engine pulses, brake-light glow, speed streaks, sparks on close passes, pentatonic combo
  ladder, warning beeps under 5 s, "drive" music whose intensity follows speed.
- HUD: clock pill with stage progress bar, analog speedo, combo pill; game-over card with distance, close passes, top speed.

## Test results
- Smoke (`tools/smoke.js 22-sundown-sprint`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/22-sundown-sprint.test.js`): pass ×4 — real mouse hold accelerates, drag and
  arrow keys steer, lifting stops accelerating; scripted driving overtakes cars, lands close passes that add points and
  time; first checkpoint advances the stage and adds time; steering into traffic causes a non-fatal spin-out; an
  expired clock ends the run; best recorded; restart fully resets.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, golden hour, dusk crash, night, game over). Fixed after
  inspection: hint overlapping the speedo in landscape (now an in-canvas prompt), headlight cone hidden by the night
  overlay, thinner lane paint, cactus decor, stat label wrapping.
- A deliberately sloppy autopilot (13 crashes, 44 close passes) lasted 98 s and reached stage 6.
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- The road is straight and flat — no curves, junctions or oncoming traffic.
- Engine sound is built from short engine-preset tones (the engine has no sustained voice); pleasant but simple.
- A momentary four-abreast wall is theoretically possible after lane changes; the shoulder keeps it passable.
- Time economy tuned with an autopilot, not with human players.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Throttle + skim loop is immediately satisfying; the clock keeps pressure on |
| Mechanical depth | 8 | Speed vs. safety, flank precision, combo upkeep, shoulder escapes, reading indicators |
| Game feel | 8 | Damped analog steering with yaw, sparks, hit-stop, spin-outs, rev audio |
| Visual identity | 8 | Warm dusk palette, time-of-day stages, distinctive car sprites |
| Animation quality | 7 | Yaw, spin, lane drifts, streaks; scenery is simple |
| Audio quality | 7 | Informative engine/whoosh/combo pitches; no bespoke samples |
| Controls | 8 | One-thumb throttle + relative drag; keys; forgiving hitboxes |
| Onboarding | 8 | "HOLD TO GO" prompt, empty road for the first seconds |
| Replayability | 8 | Score/stage chase, varied traffic, escalating stages |
| Performance | 9 | ≤ ~14 vehicles, baked sprites, slot-based decor |
| Technical robustness | 8 | Lane/road units survive resize; engine timers only; clean restart |
| Overall polish | 8 | Cohesive; scenery and audio could go further |

## Next recommended action
Human playtest of the time economy; add gentle road curves and a rare oncoming-lane stage for variety.
