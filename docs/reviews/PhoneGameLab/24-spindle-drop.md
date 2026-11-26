---
id: PhoneGameLab/24-spindle-drop
title: Spindle Drop
was: 24-helix-fall (Helix Fall)
status: transformed
baseline: 1
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
A ball falls down a tower of rotating rings; the player drags to rotate the tower so the ball drops through gaps and
avoids "kill" rings.

## Baseline assessment
57-line prototype imitating a commercial game: flat pie wedges drawn on top of each other (no tower, no depth), the
collision used the raw rotation value for every ring so gaps did not match what was drawn, whole rings were lethal at
random, rings vanished at an arbitrary y, no feedback, no best score. Barely playable. Overall 1/10.

## Weaknesses identified
No sense of a 3-D object (the entire appeal of the genre); collision/visual mismatch; unfair random deaths; no streak
reward; borrowed name and look.

## Creative opportunities
Make the tower a physical toy you want to twist: discs with real thickness on a wooden spindle. Give falling a rising
payoff, and add something of its own that turns alignment into timing.

## Planned improvements
Convincing pseudo-3D renderer; wedge-accurate collision; plunge streak + smash; studded hazard wedges (shape, not just
colour); gems as a streak-vs-bank choice; self-turning clockwork discs; finite levels with a goal plate; toy identity.

## Implemented improvements
- **Pseudo-3D tower**: orthographic 2.5-D. Each disc is 12 wedges rendered as (1) viewer-facing cut faces, (2) outer
  wall strips on the front half shaded like a lit cylinder from a per-colour shade table, (3) merged elliptical top
  faces with a bevel highlight, (4) bounce marks, studs and gems depth-sorted. Discs are painter-sorted bottom-to-top
  with spindle segments (wood gradient, grain rings, footprint lip) and the marble slotted between them; the marble
  casts a height-scaled shadow on the wedge below. Passed discs lift, swell and fade.
- **Collision that matches the picture**: the wedge under the marble is computed from the same angle the renderer uses;
  studded wedges have ~4.5° of mercy at their edges; landing uses a swept plane test.
- **Plunge + smash**: floors passed without a bounce pay 10, 20, 30…; at three the marble glows hot (trail, glow, ring)
  and smashes the next disc it meets, studs included (shards, hit-stop, shake). Pitch climbs with each floor.
- **Own twists**: clockwork discs (walnut with gold teeth, from level 2) keep turning on their own, so plunges need
  timing; gems sit on wedges — bounce to bank +25 and end the plunge, or keep falling.
- **Structure**: levels of 12, 15, 18… floors ending on a chequered goal plate; level-clear burst, bonus and a new
  two-tone palette with matching polka-dot wallpaper; a side rail shows progress down the tower.
- **Fair start**: the first disc always has wood under the marble and a wide gap a short twist away; no studs on the
  first three floors.
- **Identity/audio**: nursery toy look (birch spindle, painted wood, glass marble sprite), wooden "knock" bounces,
  glass shatter on death, funk groove whose intensity follows the plunge.
- Controls: 1:1 horizontal drag (≈ one turn per screen width) with light smoothing, arrows/A-D; haptics only after
  the first touch.

## Test results
- Smoke (`tools/smoke.js 24-spindle-drop`): pass, ~60 fps headless, no errors, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/24-spindle-drop.test.js`): pass ×7 — real mouse drag twists by the expected
  angle, arrow keys twist, the marble bounces until a gap is offered, a real drag to the gap clears a floor and scores,
  scripted play reaches the goal plate (level 2), chains plunges, smashes a disc, studs end the run, best recorded,
  restart resets.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, start, mid-level, goal plate, level 2 smash, game
  over). Fixed after inspection: marble moved further out from the spindle and enlarged, level-2 coral clashed with the
  red studs (now periwinkle), clockwork discs clashed with the mustard palette (now walnut + gold teeth), how-to wrap.
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- Projection is orthographic: no perspective foreshortening down the tower, and the marble passes in front of the
  spindle at the top of its bounce.
- One hit ends the run (genre norm); there is no shield or continue.
- Clockwork discs were verified by test/smoke at level 2 but not captured in a screenshot.
- Difficulty curve tuned by reasoning and an autopilot (which clears a level in seconds); human pacing unverified.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Twist-and-drop is instantly legible; plunges and smashes are the payoff |
| Mechanical depth | 7 | Streak vs. safety, gem banking, clockwork timing; single hazard type |
| Game feel | 8 | Squash, shadow, hot-marble glow/trail, shards, hit-stop, rising pitch |
| Visual identity | 9 | The tower reads as a solid toy; palettes per level; distinctive thumbnail |
| Animation quality | 8 | Discs lift and fade, studs/gems depth-sorted, level wipe |
| Audio quality | 7 | Wooden knocks, glass, plunge ladder; engine presets |
| Controls | 8 | Direct 1:1 twist, keys, generous stud edges |
| Onboarding | 8 | Safe first disc, "DRAG TO TWIST" prompt, studs appear after three floors |
| Replayability | 7 | Random towers, escalating levels, score chase; no modes |
| Performance | 8 | ~10 visible discs × ≤ 40 small paths, one gradient per frame, 60 fps headless |
| Technical robustness | 8 | Unit-space geometry recomputed on resize, engine timers only, clean restart |
| Overall polish | 8 | Cohesive; perspective and more hazard variety would lift it further |

## Next recommended action
Human playtest of twist sensitivity and level length; consider a second hazard (a sliding stud wedge) and slight
perspective scaling of lower discs.
