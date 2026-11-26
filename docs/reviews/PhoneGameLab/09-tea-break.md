---
id: PhoneGameLab/09-tea-break
title: Tea Break
was: 09-brick-breaker (Brick Breaker)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Paddle-and-ball wall breaker: drag a paddle, keep the ball in play, remove every brick.

## Baseline assessment
60-line placeholder: random-hue rectangles, centre-point brick collision that tunnelled and always flipped `vy`, paddle
english that could send the ball nearly flat for ever, tap-to-launch only, one beep, emoji lives, one layout, a "win" after a
single wall, no best score. Overall 2/10.

## Weaknesses identified
Unreliable collisions; boring flat loops; no speed curve, levels, power-ups or feedback; no identity; no reason to aim.

## Creative opportunities
Make the *rally* (what happens between two paddle touches) the thing you play for; give bricks a tactile, edible identity so
destruction is crumbly and satisfying; let the theme name every mechanic.

## Planned improvements
Sub-stepped circle/box physics, paddle angle control, rally multiplier with a pierce reward, chain-reaction bricks, four
power-ups, eight layouts with looping difficulty, anti-loop safeguards, bakery identity, reactive audio.

## Implemented improvements
- **Physics**: ball advances in sub-steps of 0.7 r; closest-point circle/box test with true contact normals (corner hits
  deflect diagonally); wall, tray, net and brick responses are all separate and positionally corrected.
- **Control**: tray follows finger/mouse (damped, 38/s) or arrow keys; release / click / Space serves. Hit position maps to
  ±58° and tray velocity adds english. The tray sits 104 px above the bottom edge so the thumb never hides it.
- **Never boring**: minimum 30 % vertical speed after every bounce; after 8 s without a hit the ball "follows its nose"
  and curves toward the nearest biscuit (labelled on screen), so the last-brick hunt is short.
- **Speed curve**: base speed per tin (+13 px/s per tin), plus up to +36 % "heat" that builds per biscuit and cools on a
  lost ball or new tin.
- **Rally hook**: every biscuit eaten between two tray touches raises the multiplier (×1…×8, crunches climb a pentatonic
  ladder). Six in a row turns every ball PIPING HOT: it ploughs through biscuits without bouncing until it next touches
  the tray. Getting the ball behind the wall is now the goal.
- **Biscuits**: shortbread (1 hit), chocolate-dipped (2 hits, shell cracks off), jammy (always drops a power-up), popping
  candy (detonates its eight neighbours, chains).
- **Power-ups**: Split (each ball becomes three, max 7), Big Tray (12 s, timer bar), Doily Net (one free save), Spare Ball.
- **Progression**: eight named tins (Shortbread Stack → The Full Tin), then loops with more chocolate; clear bonus 100×tin.
- **Identity**: gingham tablecloth, parchment-lined tin, baked biscuit sprites, teal tray, cherry gobstopper; light theme.
- **Feel**: biscuits bounce into place, flash and crumble directionally; ball squashes along its heading and leaves a trail;
  tray squashes; hit-stop/flash on Piping Hot; slow-mo + star burst on the last biscuit; shake only for candy and long rallies.
- **Audio**: `bounce` music whose intensity follows heat, rally and ball count; tray pitch encodes hit offset.

## Test results
- Smoke (`node tools/smoke.js 09-tea-break`): pass, 61 fps headless, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/09-tea-break.test.js`): pass — drag moves tray, hold does not serve, release serves,
  a pointer-driven rally scores and builds a multiplier, power-ups apply, finishing the wall by play advances the tin,
  keyboard move/serve, missing the last ball ends the run, best recorded, clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (serve, mid-rally, Piping Hot, net, tin 2).
- Subjective assessment from scripted (autopilot) play and reading the code only — no human playtest.

## Remaining issues
- A tin takes ~45 s for a never-missing autopilot; a full three-life run is likely 2–4 minutes, at the long end of the brief.
- Rally resets on any ball touching the tray, so Split makes long rallies harder (intended trade-off, untested with humans).
- 844×390 landscape is playable but small (portrait-first stage, 265 px wide).
- No boss/moving bricks; variety after tin 8 comes only from extra chocolate and speed.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Proven loop; rallies behind the wall and Piping Hot runs are the highlight |
| Mechanical depth | 7 | Angle control, english, rally-vs-safety decisions, candy chains; power-ups are standard |
| Game feel | 8 | Sub-stepped contacts, squash, directional crumbs, pitch ladder, restrained shake/hit-stop |
| Visual identity | 8 | Recognisable bakery/gingham look, all procedural sprites |
| Animation quality | 7 | Bounce-in walls, squash/stretch, trails; power-up tokens are simple |
| Audio quality | 7 | Informative pitches and reactive music; all from engine presets |
| Controls | 9 | Direct, damped, thumb-safe; mouse, touch and keys all verified by test |
| Onboarding | 8 | Serve prompt + dotted serve line; multiplier read-out explains itself |
| Replayability | 7 | Eight layouts, looping difficulty, score chase |
| Performance | 9 | ≤ 60 sprites, bounded particles, 60 fps headless |
| Technical robustness | 8 | Clean restart, resize remaps balls/tray, timers via engine |
| Overall polish | 8 | Cohesive splash → play → card; no placeholder art |

## Next recommended action
Human playtest for tin length and ball speed; consider a moving "biscuit conveyor" tin and a ninth boss tin.
