---
id: PhoneGameLab/17-windfletch
title: Windfletch
was: 17-bow-arrow (Bow & Arrow)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Side-on archery: drag back from the bow, release to shoot a ballistic arrow at a target on the far side.

## Baseline assessment
61-line prototype: a brown arc for a bow, a flat circle target that drifted up and down, five arrows and then an abrupt
"Out of arrows". The drag had no trajectory feedback, the arrow teleported away on a hit, one beep, hard-coded pixel
positions, no best score. Overall 2/10.

## Weaknesses identified
No aiming feedback or sense of drawing a bow; hits and misses felt the same; five shots made a 20-second session with
no progression; scoring had no depth (no reason to aim for the centre beyond +25); nothing identified it as a game.

## Creative opportunities
Make wind the thing you read (and make the whole scene show it), make arrows a life economy so accuracy extends the
run, and give experts an optional harder line through the air.

## Planned improvements
Fair-ground identity with a little archer; fixed-step ballistics with wind; partial aim guide; arrows as lives with
gold refunds; streak multiplier; ranges that escalate every three hits; balloon "through shots"; keyboard play.

## Implemented improvements
- **Draw feel**: pull back anywhere; the hooded archer leans, the limbs bend, the string and nocked arrow follow the
  pull, a creak ladder rises with draw weight, a dial shows power, and holding a full draw too long makes the hand tremble.
  Release: twang, string vibration, follow-through lean, arrow trail.
- **Wind as a real force** (horizontal acceleration, up to ~0.9 g): the dotted guide shows only the first, wind-less
  42 % of the arc. Wind is readable three ways — bunting pennants, drifting seeds/clouds/grass, and a numbered gauge.
- **Arrow economy**: arrows are lives. A hit keeps the arrow, a miss costs one, gold returns one (max 6).
- **Scoring**: ring 50/30/20/10 × streak (consecutive hits, up to ×5). Tethered balloon is worth 25 × streak and, if the
  same arrow goes on to hit the target, doubles it ("THROUGH SHOT") — a two-point trajectory puzzle.
- **Ramp**: every 3 hits is a new range — farther and smaller, wind from range 2, bobbing targets on a rail from 3,
  gusting wind from 6. Targets are always inside the bow's reach envelope on any aspect ratio.
- **Impact**: arrows stay stuck and quiver in the boss, straw sparks, target rocks on its post, gold gets hit-stop,
  ring, stars, chime and a warm flash; pitch of the thud rises toward the centre; streak plays a pentatonic ladder.
- **Identity**: sunny paper-craft meadow baked into one sprite (hills, trees, striped tents, daisies), original hooded
  archer with a feather, folk-bounce music whose intensity follows range, streak and a nearly empty quiver.
- Layout derives from stage size (portrait, landscape, desktop); bow strength is tied to range width so difficulty is
  aspect-independent. Splash shows the live scene. Keyboard: ↑/↓ tilt, hold Space to draw, release to loose.

## Test results
- Smoke (`tools/smoke.js 17-windfletch`): pass, 61 fps headless, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/17-windfletch.test.js`): pass — real pointer drags hit and score, streak ×2
  verified, miss costs an arrow and resets the streak, tap does not fire, wind present at range 4 and a compensated
  shot hits, Space fires, empty quiver → game over with best saved, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (play at ranges 2 and 5, splash, game over).
- Feel judged from code and scripted play only — no human playtest.

## Remaining issues
- Portrait keeps the action in the lower half; the tall sky is scenery (clouds, sun, bunting).
- Wind difficulty is tuned by reasoning and a solver, not by human hands; ranges 6+ may be too hard or too easy.
- No touch-specific haptic patterns beyond short buzzes; no left-handed mirror option.
- The balloon is optional depth; some players may never notice the through-shot bonus without the popup.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Draw–release–thunk loop is immediately satisfying; wind keeps each shot a small problem |
| Mechanical depth | 7 | Angle/power trade-offs, wind reading, through shots, arrow economy; single verb |
| Game feel | 8 | Bow bend, creak ladder, tremble, twang, stuck quivering arrows, scaled gold celebration |
| Visual identity | 8 | Cohesive paper-craft fair; recognisable archer and bunting |
| Animation quality | 8 | Archer lean/blink, string vibration, target wobble, pennants/grass/seeds driven by wind |
| Audio quality | 7 | Informative pitches, streak ladder, reactive music; flight itself is quiet |
| Controls | 8 | Pull anywhere, damped aim, tap-safe, keyboard alternative |
| Onboarding | 8 | Animated "pull back" gesture until the first shot; first target is a gift |
| Replayability | 7 | Random targets/wind/balloons, streak chase; no modes |
| Performance | 9 | One baked backdrop, a handful of entities, 61 fps headless |
| Technical robustness | 8 | Clean restart, resize re-layout, pause-safe aim, fixed-step flight |
| Overall polish | 8 | Splash scene → play → card all on theme |

## Next recommended action
Human playtest of wind strength at ranges 4–8; consider a rare moving "golden goose" target and a mirrored layout.
