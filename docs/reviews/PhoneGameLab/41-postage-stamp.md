---
id: PhoneGameLab/41-postage-stamp
title: Postage Stamp
was: 41-goal-flick (Goal Flick)
status: transformed
baseline: 2
score: 7
updated: 2026-11-27
---
## Original concept and core mechanics
Swipe to kick a ball up a top-down pitch, past three sliding defenders, into a goal strip; eight shots.

## Baseline assessment
45-line prototype: top-down circles, drag-back velocity with "curl" taken from where the finger happened to be on the
screen (not from the swipe), defenders that end the shot on any overlap, `setTimeout` resets, eight shots then "Done",
no keeper, no best score. Overall 2/10.

## Weaknesses identified
The headline mechanic (curving the ball) was not actually controllable; no keeper or wall to beat; no reason to aim
anywhere in particular; no pressure or progression; flat green rectangle with default font.

## Creative opportunities
A free kick is a tiny puzzle: wall, keeper, a corner to hit. Let the gesture be the shot (end point = target, speed =
power, bow = curl) so the ball flies the shape the player drew, and give the corners literal stamps to frank — the
football phrase "postage stamp" becomes the theme and the print-poster look.

## Planned improvements
Behind-the-ball 3D view; swipe-path shooting with real curl; wall that blocks and jumps; keeper with a visible tell,
reaction delay and reach; stamp targets; lives + streak structure (clearly different from the timed, side-on, pull-back
basketball sibling); escalating kicks (distance, angle, wind, sliding stamps).

## Implemented improvements
- World in metres with a pitched pinhole camera; `layout()` searches camera height/distance so the ball-to-crossbar
  framing matches the stage aspect (high and steep on portrait, low and far on landscape).
- Shot model: the release point is un-projected onto the goal plane and becomes the target; swipe speed sets ball speed
  (flight time 0.55–1.6 s); the bow of the last 0.45 s of the path sets a sideways acceleration, with the launch solved
  so the ball still arrives at the target — it goes round or over the wall along the drawn curve. Wind is *not*
  compensated. Fixed 240 Hz step with plane-crossing tests for wall, keeper and goal frame (posts/crossbar rebound,
  "in off the post" bonus).
- Opposition: 2–5 man wall on the line to one side that jumps from level 4; keeper who stands off-centre away from the
  wall and leans (the tell), reacts after 0.43→0.17 s, moves at 2.9→5.4 m/s, reaches less high than low, and takes a
  first step the wrong way when the ball is bent.
- Structure: three lives (saved / blocked / woodwork / wide / over); goal 100 × streak (to ×5), franked stamp +200×,
  bender +50×, in-off-the-post +50×; gold stamps give a life back. Level every two goals: wall, distance and angle,
  jumping wall and sliding stamps, wind, bigger wall, quicker keeper, long range.
- `stepShot()` also runs dry: `tryShot` / `plan` find targets for the tests.
- Identity: three-ink poster — cream paper with grain, teal mown bands, navy stand with a dotted crowd that hops on a
  goal, red boards, flat cut-out players, perforated stamps that get a postmark, rotated block-letter verdicts
  ("FRANKED · BENDER"). Audio: boot thud + whoosh by power, net swish and crowd swell, woodwork ring, groan on a miss,
  referee whistle per kick, march music with streak-driven intensity.
- First kick shows an animated dotted swipe to the stamp; keys 1/2/3 or arrows give simple keyboard kicks; live attract.

## Test results
- Smoke (`node tools/smoke.js 41-postage`): pass, 61 fps headless.
- Gameplay test `tests/PhoneGameLab/41-postage-stamp.test.js`: pass (13 s) — tap is not a kick; real mouse swipe to the
  planned stamp target → goal + franked (300) with the aim matching the release point; second goal ×2 and level 2 wall;
  bowed swipe produces curl of the right sign and a wide ball costs a life; shot at the keeper is saved; keyboard kick;
  three misses → "Full time"; best recorded; clean restart.
- Screenshots inspected at 390×844 (first-kick prompt, level-5 kick with wall/wind/dive), 844×390 and 1280×800 run;
  first pass led to a camera-distance search for landscape, a lower stand, a bigger ball with a trail and legible HUD.
- Fun/feel is an informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- End-point targeting is very direct: with a steady hand the early levels are easy; difficulty comes from speed
  (fast swipes are sloppy), the wall, wind and the late keeper. Not yet validated with real thumbs.
- The wall hides part of the goal on portrait (true to life, but the low stamp can be obscured).
- Keeper animation is a leaning cut-out; no catch/parry variety. Net does not bulge at the ball, it only shivers.
- Keyboard play is a three-target fallback, not full control.
- Levels beyond 9 only vary by random distance/angle/wind.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Draw-the-shot is immediately readable; bending one round the wall into a stamp is the hook |
| Mechanical depth | 7 | Power vs accuracy, over vs round the wall, reading the keeper's lean, wind, moving stamps |
| Game feel | 7 | Kick thud/shake, trail, hit-stop + crowd hop on goals, postmark pop, woodwork ring |
| Visual identity | 8 | Three-ink poster look unlike anything else in the collection |
| Animation quality | 6 | Wall jump, keeper lean/dive, stamp pop; figures are stiff cut-outs |
| Audio quality | 7 | Distinct outcome sounds and crowd noise; music generic march |
| Controls | 7 | One gesture does everything; only the last 0.45 s counts so hesitant starts are forgiven |
| Onboarding | 8 | Animated first-kick swipe to a big stamp, no wall, slow keeper |
| Replayability | 7 | Randomised kicks, streak multiplier, life-back stamps |
| Performance | 9 | A handful of projected shapes per frame; 61 fps headless |
| Technical robustness | 8 | World-space simulation, camera recomputed on resize, no gameplay timers |
| Overall polish | 7 | Complete loop with attract mode; character animation is the weak spot |

## Next recommended action
Human playtest on a phone for swipe sensitivity (power curve, curl gain); add keeper catch/parry poses and a net bulge.
