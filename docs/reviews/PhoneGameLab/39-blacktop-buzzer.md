---
id: PhoneGameLab/39-blacktop-buzzer
title: Blacktop Buzzer
was: 39-basketball (Basketball Flick)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Drag back from the ball and release to throw it at a hoop sliding left and right; ten shots, one point per basket.

## Baseline assessment
48-line prototype: a rectangle "hoop" with a hit-box instead of a rim (the ball teleports away on overlap), no arc
feedback, `setTimeout` resets, ten shots then "Done" with no best score, flat brown background, one beep. Overall 2/10.

## Weaknesses identified
No rim/backboard/net physics so there is no difference between a swish and a lucky overlap; aiming is blind; no pressure,
streak or progression; nothing reacts to a make; fixed hard-coded layout.

## Creative opportunities
The joy of basketball games is the swish versus the rattling rim-out, shooting in rhythm, and getting hot. A clock that
makes add to turns accuracy and tempo into the same resource; hiding half the arc after the warm-up makes reading a
parabola the skill.

## Planned improvements
Side-on street court with real rim physics; pull-back slingshot with arc preview; time attack with time back per make;
ON FIRE streak state; levels that change the shot (distance, bobbing hoop, wind); buzzer beaters.

## Implemented improvements
- Fixed-step (240 Hz) ball physics: two rim points, backboard capsule, floor; spin picked up from contacts; makes are
  detected by a swept crossing of the rim plane between the rim points, so swish / rim-in / bank / rim-out / airball
  all happen for real and are named on screen.
- Pull back anywhere (rubber-band indicator, power colour) with a dotted arc: full during the warm-up level and while
  on fire, only the rise otherwise. Keyboard aim (arrows + Space) as an alternative.
- Rapid fire: a new ball is ready 0.42 s after release and several can be in the air; the spot moves after every make.
- Scoring: 2, +1 swish, +1 bank, 3 from behind the chalk "+3" line; three makes in a row = ON FIRE (double points,
  flame trail, crackle loop, full arc) until a miss. Clock starts at 45 s, makes add 1–3 s (less at higher levels).
- Levels every four makes with a banner and one-line tip: deep spots + hidden descent, telescoping hoop that bobs,
  gusting wind (streaks + HUD arrow, included in the preview), faster hoop, stronger gusts.
- Buzzer beater: balls in flight at 0:00 still count (+5); the run ends when the last one lands ("Final buzzer").
- Identity: night blacktop baked per layout (star sky, lit skyline, chain-link fence, street-lamp cone with moths, speckled
  asphalt, chalk marks), leather ball sprite with seams, steel chain net on a damped spring that sways with the ball.
  Audio: chain jingle (noise + high partials rising with the streak), rim clang, backboard thud, floor bounce,
  heartbeat in the last five seconds, sawtooth buzzer; driving music whose intensity follows level, clock and fire.
- `orient:"any"`: the court widens up to 900 units on landscape/desktop (longer threes), portrait gets steep arcs.
- Live attract mode (the court shoots by itself behind the splash).

## Test results
- Smoke (`node tools/smoke.js 39-blacktop`): pass, 61 fps headless.
- Gameplay test `tests/PhoneGameLab/39-blacktop-buzzer.test.js`: pass (13 s) — tap is not a shot, solved real mouse
  pull swishes for 3 and adds time, flat pull airballs and resets the streak, three in a row → on fire and the next
  make is doubled, four makes → level 2, Space shoots, clock out → final buzzer, best recorded, clean restart.
- Screenshots inspected: 390×844 and 844×390 (play, on fire, level tip), 1280×800 (play), landscape splash.
- Fun/feel is an informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Difficulty differs by aspect ratio (wide screens have longer shots and more room for threes).
- On a short landscape phone the top of high arcs leaves the screen (an arrow marks the ball).
- Wind and hoop-bob levels were not reached by the scripted test; tuned by reasoning and solver runs only.
- A perfect shooter gains time faster than they spend it for the first levels (capped at 60 s; bonuses shrink later).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Quick shoot-again loop; swish vs rim rattle matters; clock keeps tempo |
| Mechanical depth | 7 | Arc reading, tempo vs accuracy, streak risk, deep-spot bonus, wind and moving hoop |
| Game feel | 8 | Net spring, hit-stop on swish, flame trail, named outcomes, buzzer shake |
| Visual identity | 8 | Recognisable night-court scene with lamp cone and chain net |
| Animation quality | 7 | Ball spin, net sway, telescoping pole, held-ball pop and bob; no characters |
| Audio quality | 8 | Chain jingle pitched by streak, distinct rim/board/floor sounds, heartbeat, buzzer |
| Controls | 8 | Pull anywhere, generous rim, 0.42 s reload, keyboard fallback |
| Onboarding | 8 | Level 1 shows the whole arc from close range; tips announce each change |
| Replayability | 7 | Score chase with streak/time economy; variety plateaus after level 6 |
| Performance | 9 | ≤ 7 balls, baked backdrop and ball sprite; 61 fps headless |
| Technical robustness | 8 | World-space physics survives resize, loops tied to run, clean restart |
| Overall polish | 8 | Complete splash → buzzer → card loop with attract mode |

## Next recommended action
Human playtest of the clock economy and partial-arc difficulty; add a late-game twist (moving shot spot, second hoop).
