---
id: PhoneGameLab/40-brass-pocket
title: Brass Pocket
was: 40-pool (Pool)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Drag from the cue ball to aim and set power, release to hit; knock six balls into six pockets.

## Baseline assessment
53-line prototype: variable-timestep physics with frame-rate dependent friction, pockets that were circles drawn on top of
the cushion with no mouth, a dashed line pointing where you drag (no idea what the object ball will do), score read back
from the DOM, no limit on shots so no way to lose, hard-coded full-screen table. Overall 2/10.

## Weaknesses identified
No objective or pressure; no aiming information; unstable collisions at speed; no identity; nothing for position play to
matter for; portrait-only pixel layout.

## Creative opportunities
Solo pool needs an economy. Making shots the currency — a pot pays its shot back, a miss does not — turns every shot into
"can I make this?" and makes leaving the cue ball well worth real points. One rule borrowed from the genre (a ball that
must go last) adds planning without a rule book.

## Planned improvements
Accurate fixed-step collisions; ghost-ball aiming; shot economy with streak multiplier; brass-ball-last rule; authored
ladder of racks (straight pots → cuts → brass → break → posts) then procedural racks; rotating table for landscape.

## Implemented improvements
- Physics: 240 Hz fixed step, equal-mass ball collisions (restitution 0.95) with positional correction, linear + constant
  rolling friction (soft taps die quickly, breaks travel about three table lengths), cushions (0.78), six pockets with
  mouths (cushion clamp is skipped near a pocket), brass posts as static bumpers. Spin-free but exact, so stun/tangent
  position play works.
- The same `step()` runs on a cloned table for `simulate(angle, power)`; `solve()` builds ghost-ball candidates per
  ball/pocket and verifies them by dry run (used by the test; live and dry results are identical).
- Aiming: drag back anywhere (direction = shot, length = power, tap = cancel), dashed line to a ghost ball, object-ball
  departure line scaled by cut and power, cue-ball tangent line, cushion/post reflection; cue stick draws back with power
  and follows through; power bar. Keyboard: arrows aim (Shift = fine) and set power, Space shoots.
- Shot economy: start with 4 (max 9); −1 per shot, +1 per potted ball, +2 and a bonus per cleared rack, −1 scratch,
  −2 brass ball early (re-spotted). Out of shots with balls up = game over.
- Scoring: 100 × streak multiplier (consecutive potting shots, up to ×5) × balls-this-shot, +50×mult for a banked pot,
  brass last 300×mult, rack bonus 250 + 50 per shot in hand.
- Six authored racks with one-line tips where a rule appears, then endless procedural racks (more balls, 1–3 posts).
- Identity: back-room table — burgundy baize with felt noise and lamp pool, walnut rails with grain and brass sights,
  brass pocket rings that flash, ivory cue ball, muted numbered balls whose number spot rolls over the ball, brass ball
  with a star. Audio: pitched clack scaled by impact, cushion thud, brass-post ting, pocket drop, rolling-noise loop that
  follows total ball speed, lounge music whose intensity follows the streak.
- `orient:"any"`: the table is simulated upright and drawn rotated on landscape/desktop (numbers stay upright).
- Attract mode: the table plays itself behind the splash.

## Test results
- Smoke (`node tools/smoke.js 40-brass`): pass, 61 fps headless.
- Gameplay test `tests/PhoneGameLab/40-brass-pocket.test.js`: pass (14 s) — tap is not a shot; solver-aimed real mouse
  drag pots (+100, shot refunded); miss costs a shot and resets the streak; rack cleared → +2 shots, bonus, rack 2;
  early brass → −3 shots, re-spot, no points; keyboard shot; out of shots → game over; best recorded; clean restart.
- Screenshots inspected at 390×844 and 844×390 (aiming with posts and brass ball, after a break), plus 1280×800 run.
- Fun/feel is an informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- No spin (follow/draw/english), by design; cue-ball control is power and angle only.
- Angle precision depends on drag length; soft shots are aimed with a short lever (keyboard Shift-aim is the fine tool).
- A lucky break in rack 6 can drop the brass ball early (it is placed behind the rack to make that rare).
- Procedural racks are random scatter; they are not checked for solvability beyond spacing.
- No undo/hint feature even though the solver exists.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Pool physics that behave; every shot matters because shots are the currency |
| Mechanical depth | 8 | Cut angles, position play, streak vs safe pot, bank bonus, brass-last planning, posts |
| Game feel | 8 | Cue follow-through, pitched clacks, pocket flash/ring, hit-stop on hard hits and multi-pots |
| Visual identity | 8 | Burgundy/walnut/brass table reads at a glance; rolling number spots |
| Animation quality | 7 | Rolling spots, sink-in, stick draw/follow-through; few flourishes otherwise |
| Audio quality | 7 | Informative impacts and rolling loop; music is generic lounge |
| Controls | 8 | Drag-anywhere with ghost ball; cancel by returning; keyboard alternative |
| Onboarding | 8 | Rack 1 is three near-straight pots with a "drag back to aim" prompt; rules arrive one per rack |
| Replayability | 7 | Endless racks and streak-driven score; no daily/puzzle variants |
| Performance | 9 | ≤ 10 balls, baked table; solver runs only in tests |
| Technical robustness | 8 | Table-space simulation independent of layout/rotation; state machine without timers |
| Overall polish | 8 | Complete loop with attract mode and both orientations |

## Next recommended action
Human playtest of the shot economy (start 4 / cap 9); consider a called-pocket bonus and a one-per-rack hint using the solver.
