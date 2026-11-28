---
id: PhoneGameLab2/flutterbun
title: Flutterbun
was: flappy-tom / "Flappy Tom"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A yellow circle on a blue screen; tap to flap upward against gravity; green pipe pairs scroll in from the right with a
gap; a point per pipe passed; touching a pipe or the floor/ceiling ends the run. A copy of a well-known one-button
flapper, named after a commercial pet app's character.

## Baseline assessment
~25 lines, borrowed name, no art, no audio beyond beeps, fixed difficulty, harsh first second (no grace), no metadata.

## Weaknesses identified
- It recreated a specific commercial game and referenced another app's character — both must go.
- Siblings Jelly Drift (tap pulse + hold glide, horizontal) and Fizzwhiz (hold thrust, horizontal) already cover
  one-button horizontal flight in the arcade.
- No progression, no variety, no character.

## Creative opportunities
- Change the verb, not just the skin: two wings, steered by which side you tap, flying UP instead of sideways, so every
  gap becomes a lateral positioning problem.
- Bun the gardener and a beanstalk that grew overnight give a reason to climb and a set of height zones.

## Planned improvements
Vertical climb up a beanstalk; left/right/both taps; leaf shelves with gaps; clean-pass streak; carrots; dandelion shield;
zones with sliding gaps, bees, wind and star mobiles; morning-to-night sky; Bun with petal wings as the actor.

## Implemented improvements
- **Two-wing flapping**: left half = flap up-left, right half = up-right (lateral speed builds and decays with air drag),
  both halves within 0.2 s (or ↑/W/Space) = a straight, stronger boost that cancels drift. ←/A and →/D on keyboard.
  The flapping wing beats, Bun stretches on every flap, petals puff off, the flap sound is pitched by side.
- **Grace start**: Bun hovers on her flowerpot with pulsing "◀ tap / tap ▶" boxes until the first tap; the first three
  shelves have very wide, centred gaps.
- **Scoring**: 10 per shelf, +5 for a "Clean!" pass through the middle 40 % of the gap (the clean streak climbs the
  combo ladder and shows in the HUD), carrots +5. Height in metres shown top-left.
- **Zones** (by shelves passed): Garden (still leaf shelves) → Beanstalk at 12 (sliding gaps, bumblebees) → Cloudland at
  30 (cloud shelves, wind bands with drifting arrows push you sideways) → Starry Night at 50 (night branches, swinging
  star mobiles, gaps narrowing to 104 u). Each zone is bannered, retints the sky and the HUD.
- **Dandelion puff** every 14 shelves, placed off the safe line (a risk to fetch): it saves one bonk with a bounce.
- **Fail**: bonking a shelf, bee or star (dizzy tumble, hit-stop, shake) or fluttering off the bottom of the screen.
  Card: "Oops! Bun bonked a leaf" with height, shelves, best clean streak and carrots.
- **Bun as actor**: looks where she's going, `wow` on each flap, `think` while gliding, `scared` when falling fast,
  `joy` on passes, `dizzy` when bonked; tilts with lateral speed. A live attract scene flies by itself.

## Test results
- Gameplay test (`node tools/run-tests.js flutterbun`): passed three times in a row after its last edit (~11 s). Covers the
  hover-until-first-tap grace, real left/right/both taps (direction and kind), steering through ≥4 gaps with exact scoring
  (10 per shelf + 5 per clean pass and carrot, HUD in sync), at least one clean pass, a dandelion saving a bonk, a bonk
  ending the run, clean restart, and falling without flaps ending the run. An earlier version was flaky because two
  sequential Playwright taps sometimes landed >0.14 s apart; the both-sides window is now 0.2 s and the test checks the
  flap kind instead of a gravity-sensitive speed.
- Smoke (`node tools/smoke.js flutterbun`): pass, 61 fps.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (garden, beanstalk with hazards, night, splash): fixed a dead
  sample hook, Bun's stern `focus` face (now `think`/`wow`), added leaves to the background stalk.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Portrait-only: on an 844×390 landscape phone the stage is small (265 px wide) — a vertical climb cannot use the width.
- Bun's own ears cannot be animated through `Pals.draw`, so the wings are drawn petals behind her rather than flapping
  ears (the original idea).
- Hazards are drawn simply (bee, wind arrows, star); no boss or set-piece moments.
- Balance after shelf 60 is judged from the numbers only.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Steering by side makes every gap a small decision; quick retries |
| Mechanical depth | 7 | Lateral momentum, straight boosts, clean-streak line, wind and moving gaps |
| Game feel | 7 | Wing beat + stretch per flap, side-pitched flaps, tumble on bonk |
| Visual identity | 7 | Beanstalk, leaf/cloud/branch shelves, sky from morning to stars; simple hazards |
| Animation quality | 7 | Wings, tilt, squash, swinging stars, bobbing carrots |
| Audio quality | 6 | Bouncy music with intensity, combo ladder on clean passes; few bespoke sounds |
| Controls | 8 | Two big halves, instant `onDown`, generous hitbox, keyboard support |
| Onboarding | 8 | Hover start with tap boxes; first shelves wide and centred |
| Replayability | 7 | Random gap walk, four zones, clean streaks and best score |
| Performance | 9 | Few entities, no per-frame sprites to bake; 61 fps |
| Technical robustness | 8 | Clean restart verified, resize-safe layout from stage width, theme per zone |
| Overall polish | 7 | Complete loop; landscape phones get a small stage |

## Next recommended action
Human playtest of the Cloudland wind strength and the night mobiles; consider a short "summit" set piece every 25 shelves.
