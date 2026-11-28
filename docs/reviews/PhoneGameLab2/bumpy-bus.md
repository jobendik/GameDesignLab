---
id: PhoneGameLab2/bumpy-bus
title: Bumpy Bus
was: hit-the-road / Hit The Road
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Hit The Road": top-down three-lane road, swipe to change lane, dodge red rectangles, collect yellow circles; one
crash ends the run.

## Baseline assessment
A bare lane-dodger with no art, no ramp and no identity — and the collection already has two top-down road games
(Sundown Sprint: steering + throttle with close passes; Paper Rapids: three-channel hops with close shaves).

## Weaknesses identified
Random spawns (unfair overlaps), no progression, no stakes beyond one-hit death, nothing to learn.

## Creative opportunities
Keep "drive down the road and deal with what's on it", but change the verb: a side-view country road where the only
control is speed, and the cargo is your friends riding on the roof rack.

## Planned improvements
One-thumb throttle/brake, bus stops and campsites as goals, roof riders as fragile cargo, daylight as the clock.

## Implemented improvements
- **Verb**: hold = drive, release = brake (keys: Space/→/↑/D/W). Fixed 1/120 s physics; the bus follows the ground
  until its curvature × speed² exceeds gravity, then it flies (crests and bumps launch it at speed; gaps always).
- **Riders**: pals sit on the rack. A landing impact above a threshold throws them up (lighter pals higher); in the
  air they keep their own speed, so if you brake under them they sail off the front ("Oops! Momo bounced off!"),
  if you keep driving they drop back onto the rack. The core skill: speed for daylight vs. smoothness for riders,
  and never stamping the brake while someone is airborne.
- **Goals**: stop on a bus stop (±46 u, Perfect Stop within ±14) to pick a pal up; drive past and they wave goodbye.
  Campsites deliver everyone (100 × stage each, +50 each for a stage without losses) and buy daylight (30 s, shrinking
  each stage to a 16 s floor) — so runs end. "STOP AHEAD" signs 420 u before each stop; a route strip shows stops
  (pal colours, picked/missed) and the campsite. Big air pays a bonus when riders are aboard.
- **Stages**: 1 rolling hills and small bumps; 2 potholes, tall bumps, slopes; 3 crests that launch you; 4+ creeks
  with broken bridges (fall short = splash, back up, −4 s). Sky shifts morning → noon → golden → dusk → stars, and
  darkens as daylight runs low.
- Pip drives in the cab window (focus on the gas, wow on hard braking, joy in the air); riders cheer in the air with
  the bus, panic when thrown, spin dizzy when they fall; lost pals sit dazed by the road. Engine loop pitch follows
  speed, brake squeal when riders are aboard, thuds scaled by impact.
- Portrait shows a big HOLD TO DRIVE pedal (pressed state) in the earth below the road; landscape uses `orient:"any"`.

## Test results
- Automated-gameplay (`tests/PhoneGameLab2/bumpy-bus.test.js`, 3 runs in a row, all pass ~17 s): real mouse hold
  drives and release brakes to a stop; a throttle-controlled stop on the first sign picks up a pal (score = HUD);
  a launched rider re-seats when you keep driving but is lost when you brake under them; driving past a stop misses
  it; stopping at the campsite delivers, adds daylight and starts stage 2; flat-out driving over stage-2 terrain
  throws a rider into the air through genuine landing impacts; sundown ends the run; restart is clean.
- Automated-technical: `tools/smoke.js bumpy-bus` passes (61 fps).
- Visual inspection: 390×844, 844×390, 1280×800, a stage-4 creek and the splash were looked at; fixed the missing
  route strip in portrait (station not generated yet), empty earth in portrait (strata, pebbles, pedal), a flat
  blue creek (now a ravine with water and broken planks).
- Scripted bot check (scratch): a careful driver that never brakes with riders in the air reached stage 2 in ~25 s
  with riders thrown 4–9 times and none lost.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Terrain is random within stage rules; some stretches are dull rolling hills.
- Release = brake makes "coasting" impossible; deliberate for precise stops, but some players may expect coasting.
- Riders are drawn upright with the bus tilt; no seat-belt/grab animation on near misses.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | The "go fast but don't brake under flying friends" tension is immediate and funny |
| Mechanical depth | 7 | Speed vs. smoothness vs. daylight, precise stops, creek run-ups |
| Game feel | 7 | Squash on landings, dust, shake by impact, riders' panic, engine pitch, squeal |
| Visual identity | 7 | Side-view storybook country road, camp bus, time-of-day skies |
| Animation quality | 7 | Wheels, tilt, riders tumbling/re-seating, flags, campers waving |
| Audio quality | 6 | Engine/brake loops tied to state; presets for the rest; bounce music with intensity |
| Controls | 7 | One thumb, instant response; braking distance learnable; no coast |
| Onboarding | 7 | Stage 1 is gentle; signs warn of stops; pedal affordance in portrait |
| Replayability | 6 | Escalating stages and shrinking daylight; random terrain |
| Performance | 8 | Point-array terrain trimmed behind, bounded decor, 61 fps |
| Technical robustness | 8 | Fixed-step physics, resize-safe, clean restart, no errors |
| Overall polish | 7 | Complete loop; stats (delivered, bounced off, perfect stops) |

## Next recommended action
Hand-author a few signature terrain set pieces per stage (double crests, ramp + creek combos) and add coasting on a
second gesture if playtests ask for it.
