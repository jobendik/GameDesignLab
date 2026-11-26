---
id: PhoneGameLab/23-pogo-peak
title: Pogo Peak
was: 23-doodle-jump (Doodle Jump)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Vertical jumper: a ball auto-bounces on platforms, the player steers left/right, the screen scrolls up, falling ends the run.

## Baseline assessment
36-line prototype named after a commercial game: yellow circle, green bars, velocity-chasing drag that overshoots,
one platform type (some sliding), platforms removed and re-added with unbounded random gaps, no hazards, no feedback, a
single beep, no best score. Overall 2/10.

## Weaknesses identified
Borrowed name and no identity; mushy steering; nothing to do but go up; no variety, no milestones, no risk/reward; the
loss is abrupt and silent.

## Creative opportunities
Without tilt the game needs a steering scheme that is precise in one thumb, and something for the player to *do* in the
air. A pogo stick explains the bounce and suggests the twist: dive on purpose.

## Planned improvements
Original character and world; relative-drag steering with wrap; platform families; knock-down hazards; a slam / power
bounce mechanic with a streak; altitude zones as milestones; balloon power-up; personal-best line in the world.

## Implemented improvements
- **Identity**: Pip, a round chick in a bobble hat on a pogo stick (procedural: squash/stretch, spring compression,
  lagging scarf, flapping wings, blinking eyes that follow motion, dazed crosses). Five altitude bands with their own sky
  gradients and ledge styles — Meadow, Pinewood, Snowline, Cloud Sea, Starfield — with sinking ridges, parallax clouds and
  stars, altitude ticks every 25 m and an orange BEST line at the player's record height.
- **Controls**: relative drag (1.45× gain, lightly damped, wraps at the screen edges), arrows/A-D on keyboard; landing
  uses a swept foot test with 11 u of side forgiveness so fast falls never tunnel.
- **The SLAM**: flick down (or Down/S/Space) to dive. A slam landing is a power bounce (≈1.5× height), pops burrs and
  crows from above for double points and builds a slam streak (+5 per step, capped); a mistimed slam drops you past
  the ledge. Mastery roughly doubles climbing speed.
- **Platforms**: solid ledges, cracked crumblers (one bounce), drifting clouds, bounce-shrooms (super jump). The main
  chain is always within a normal bounce; crumbling decoys, hazards and star arcs are added around it.
- **Hazards that do not insta-kill**: burrs and crows knock Pip down and daze him for half a second (1.3 s of mercy
  afterwards); you lose only by falling off the screen. Landing on a hazard pops it.
- **Treats**: star arcs (+10), a balloon every ~200 m (1.7 s lift-off, invulnerable).
- **Progression**: gaps widen, ledges narrow, more movers/crumblers/hazards with height; zone banners + jingle + bonus.
- **Audio**: bounce pitch by ledge type, spring, slam boing + rising combo ladder, star pickups climbing in pitch,
  chiptune whose intensity follows zone and streak.
- Score = height in metres + bonuses; card shows height, best slam streak and stars.

## Test results
- Smoke (`tools/smoke.js 23-pogo-peak`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/23-pogo-peak.test.js`): pass (5 of 5 consecutive runs in its final form). The
  test exposed a real bug — at bounce-shroom speed Pip could tunnel through a burr in one frame — fixed with a swept
  body test for hazards, stars and balloons. Covers:
  auto-bounce, real mouse drag steering, arrow keys and screen wrap, Down-key slam and flick-down slam, power bounce +
  streak, scripted climbing raises height and score, chained slams, a spawned burr dazes instead of killing, falling
  off-screen ends the run, best recorded, restart resets.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, start, Pinewood, Snowline, Cloud Sea, game over).
  After inspection: rescaled metres and zone heights (a slam-chaining autopilot climbed far too fast), first-run prompt
  now times out, how-to lines shortened for the wider bundled font.
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- The flick-down gesture is taught only by the how-to card; a first-slam tutorial moment would help.
- Zone thresholds and the slam bonus were tuned against an autopilot, not human hands.
- Starfield (1000 m+) was not reached in screenshots; it reuses the same ledge families with a new palette.
- A standing-still player bounces on the meadow forever (no idle fail) — intentional, but there is no nudge to start.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Readable from the first bounce; slams make descents active |
| Mechanical depth | 8 | Slam timing risk/reward, streaks, hazard pops, route choice among ledge types |
| Game feel | 8 | Instant steering, squash/stretch, spring compression, rings, shake scaled to streak |
| Visual identity | 8 | Characterful mascot; five clearly different altitude bands |
| Animation quality | 8 | Scarf lag, wings, eyes, shroom ping, crumbling ledges, flapping crows |
| Audio quality | 7 | Pitch carries ledge type and streak; engine presets only |
| Controls | 8 | Relative drag + wrap + keys; flick detection tolerant; forgiving landings |
| Onboarding | 7 | Wide dense meadow ledges and a drag prompt; slam is text-taught |
| Replayability | 8 | Random climbs, zones to reach, record line in the world |
| Performance | 9 | Baked ledge sprites, ≤ ~40 entities, slot-based scenery |
| Technical robustness | 8 | Unit-space world rescales on resize; clean restart; engine timers only |
| Overall polish | 8 | Cohesive loop; tutorialisation of the slam is the gap |

## Next recommended action
Human playtest of slam discoverability and zone pacing; add a one-time in-world slam prompt above the first bounce-shroom.
