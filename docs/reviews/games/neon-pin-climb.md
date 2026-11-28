---
id: games/neon-pin-climb
title: Neon Pin Climb
was: "Neon Pin Climb — learning prototype"
status: transformed
baseline: 3
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A "learning-only" vertical neon pinball: ten fixed 760-unit modules stacked upward, each with a flipper pair, a few diagonal rails,
three bumpers and a horizontal "gate" line at its top. Gravity is inverted in the code's y-up world, the camera follows the ball,
a 60 s clock gains seconds at each gate; falling far below the camera teleports the ball to the last checkpoint (−4 s). All
flippers move together from left/right screen halves. DOM pills for TIME / LEVEL / SCORE, a disclaimer card naming a commercial game.

Kernel kept: **climb a tower of flipper floors against a clock, gates buy time**. Neon cyan/magenta/gold, big floor numbers.

## Baseline assessment
3/10 (screenshot at 390×844 and code read):
- The "climb" was mostly automatic: bumpers add a constant upward impulse (+115) and every flipper hit adds a flat +210…680 upward
  kick on top of the collision, so mashing climbs; gates are wide horizontal lines you cross by accident.
- Physics: single variable-dt step per frame with three collision passes, velocity clamp, lerped flippers, a hard x clamp to stop
  wall escapes — tunnelling possible at low frame rates.
- Ten modules then nothing ("FINAL" gate); no game-over handling worth the name, no best score, no pause/mute/seed/hook,
  disclaimer text on the title card, Inter/system fonts.

## Weaknesses identified
1. No skill in the climb — the up-kicks play for you.
2. Unsafe physics and frame-rate dependence.
3. Finite, identical modules; no reason to replay.
4. Lifecycle/conventions missing; placeholder copy.

## Creative opportunities
A real **vertical time-attack**: each floor's flipper pair is also the ceiling of the floor below. You climb by *shooting the ball
up a side lane* (an orbit-like shot) over a one-way lid onto the next floor; miss the flippers and the ball falls through the
centre gap **back down to the floor below** — no lives, only lost height and lost time. Procedural endless floors with zones,
charge targets and time crystals give side goals that buy time.

## Planned improvements
Rewrite: shared fixed-step capsule solver with torque flippers, tower topology (lanes, caps, one-way lids, slopes = ceiling of the
floor below), seeded lazy floor generator, clock/streak/charge rules, canvas HUD, cards, audio + music, conventions, test, review.

## Implemented improvements
- **Physics**: 120 Hz × 8 substeps (960 Hz); ball ≤ 2.7 units per substep at the 2600 u/s cap vs ≥ 13 units of contact depth;
  flipper tips ≤ 1.7 units per substep; only floors k−1…k+1 are collided. 300 random max-speed shots in the test: no overlap > 3.
  Slow contacts lose restitution (rolling, cradling); a deterministic sim RNG adds tiny bumper jitter so nothing can bounce
  perfectly vertically forever; a ball balanced on a resting flipper pivot is rolled off.
- **Flippers**: torque model (3000 rad/s², 22 rad/s cap, ≈50 ms stroke) with surface-velocity impulses — no artificial up-kick
  any more; climbing height comes only from where and when you hit the ball. Independent **left / right** (screen halves,
  multi-pointer; Z/←/A/Shift, X/→/D/Slash; Space/↑ both). Holding cradles the ball at the base.
- **Tower topology** (560-unit floors): outer walls; each side has a lane with a widened mouth whose inner wall stops short, so the
  **underside of the next floor's flipper and slope funnels rising balls outward into the lane**; a two-part cap throws the ball
  inward onto the next floor; a **one-way lid** lets it up but holds anything falling from above and feeds it to the flippers.
  The centre gap between a floor's flippers is the way back down (and a hard, legal way up). Floor 0 drains out of the tower
  base: −3 s and relaunch.
  Shot-mapping by script: from a ball rolling off the inlane, the left flipper climbs in ≈95 ms of timing windows and the right in
  ≈55 ms on floor 0 (tutorial floors keep the shot corridors free of targets).
- **Floors**: seeded per floor, generated lazily (endless): kits — intro, triad bumpers, pachinko pegs, posts, a rotating spinner
  bar, a sliding blocker (zone 2+), orbiting bumpers (zone 2+); three **charge targets** per floor (all three: CHARGED, +4 s now and
  +3 s on the climb from it), a floating **+2 s time crystal**; from floor 3 a lane may be **closed** (solid red lid, ✕ marker).
  Zones every 5 floors recolour the tower and pay +6 s; the climb bonus shrinks from +8 s to +4 s with height.
- **Scoring**: 1,000 × floor per climb, multiplied by a **streak** (×0.5 per consecutive climb without falling, up to ×5); targets,
  pegs, bumpers, crystals. Best score (`gdl:best:games/neon-pin-climb`) and top floor are stored and shown.
- **Camera**: frames the current floor (its flippers plus the next floor's flipper zone) and only follows the ball when it leaves
  that band, so the flippers you need are always on screen; side panels (run stats, how-to) on wide screens.
- **Feel/visuals**: zone-coloured neon rails with cached glow sprites, giant faint floor numbers, animated lane chevrons on the
  climb route, bumper squash and flash, target glow, crystal bob, ball trail, particles, rings, CLIMB / FLOOR / ZONE banners,
  shake/flash (off with reduced motion), red pulsing clock under 10 s.
- **Audio** (WebAudio after the first gesture): flipper clack, wall ticks by impact, bumper pops pitched by size, pegs pitched by x
  position (a pachinko scale), target notes rising per target, charge chord, crystal chime, climb arpeggio transposed by floor,
  fall/drop sweeps, hurry ticks under 10 s; music whose tempo rises with height and adds a hurry layer. Mute button / M.
- **Conventions**: `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`; `window.__gdl` (state, `manual`, `advance`, flip, place,
  cheat, start, geom, Y); pause button + P/Esc + auto-pause on blur/hidden; vendored fonts (Bungee, Rajdhani); cards opaque with the
  canvas dimmed and its HUD hidden behind them; focusable canvas for the iframe. Disclaimer copy removed.

### How it differs from the other pinball games
- **vs Arcanum / Spire** (conventional tables with plungers, ramps, modes, multiball, DMD/rules): Pin Climb has no balls/lives and
  no rule set — it is an endless, procedurally generated *time-attack ascent* where failure means falling down the tower.
  Spire also climbs, but on a fixed 3D table with stacked upper playfields reached by ramps; here every floor is identical in
  structure and the goal is pure altitude against a clock.
- **vs Neon Pinball Rush**: Rush is static single-screen rooms, one-thumb (both flippers together), hearts and an upgrade draft;
  Pin Climb scrolls continuously, uses independent left/right flippers for aimed lane shots, has no upgrades and a clock instead of
  lives.

## Test results
- **Automated-gameplay** (`node tools/run-tests.js neon-pin-climb`, ~33 s, passed 3 runs in a row): menu → CLIMB tap; real mouse
  hold on the left half raises only the left flipper (mid-stroke at 25 ms, at the stop by 60 ms), the right half only the right;
  Z/X/Space; cradle at the base; 300 random 2600 u/s shots — no tunnelling (>10,000 samples); a ball rolling off the inlane and
  flipped with a swept delay climbs a lane to floor 1 (+8 s, +1,000) and stays there; the one-way lid holds a falling ball and feeds
  floor 1; falling through floor 1's gap returns to floor 0 and resets the streak; three targets charge the floor (+4 s); a crystal
  adds +2 s; a closed lane's lid blocks a hard climb; draining out of the base costs 3 s; the clock reaching 0 ends the run (card,
  best persisted); PLAY AGAIN resets; P pauses (tick frozen) and RESUME continues; same seed + inputs → identical replay.
- **Automated-technical** (`node tools/smoke.js games/neon-pin-climb`): ok, 61 fps, no errors.
- **Visual inspection**: menu, floor 0→1 climb, a zone-2 floor with spinner/closed lane and the red hurry clock, at 390×844,
  844×390 and 1280×800. Fixed from what was seen and scripted: the camera hid the current flippers (now floor-framed), the cap formed
  a ball trap with the wall (now a closed wedge), the closure marker sat at the wrong end of the lane, banner spanning the side panels.
- **Subjective playtest**: informed judgement from shot maps, a scripted flipper bot and screenshots — not a human playtest. The bot
  (flips whenever a descending ball is over a flipper) reaches floors 2–4 in 75–100 s runs; earlier bot runs exposed a perfectly
  vertical bumper loop and a ball balanced on a pivot, both fixed. Audio not listened to.

## Remaining issues
- Lane shots need 50–100 ms timing; casual players may stall on floors 0–2 until they learn the cradle-and-release rhythm — needs
  a human tuning pass (start time 45 s, +8 s per climb).
- Floors are kit-based and share one shell; after ~10 floors the variety thins (no moving lanes, no special floors or bosses).
- At 844×390 the tower is 222 px wide — legible but small.
- No ball spin; audio mix unheard.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Clear "shoot up the lane, beat the clock" loop; falling a floor is a sharp, readable setback. |
| Mechanical depth | 7 | Aimed lane shots by timing/contact point, cradle control, charge-vs-climb choice, streak risk, closed lanes. |
| Game feel | 7 | Torque flippers, honest physics (no fake kicks), climb fanfare + flash, bumper pops. |
| Visual identity | 7 | Neon tower with zone palettes and giant floor numbers; recognisable thumbnail. |
| Animation quality | 6 | Lane chevrons, squash/flash, crystal bob, banners, camera easing; few bespoke animations. |
| Audio quality | 6 | Informational procedural SFX (peg scale, target ladder, floor-transposed climb) + tempo-rising music; unheard. |
| Controls | 8 | Independent halves with multi-pointer, full keyboard, 44 px buttons, iframe focus. |
| Onboarding | 7 | Three-line card, banner "shoot up a side lane", lit chevrons on the route, how-to panel on wide screens. |
| Replayability | 7 | Endless seeded tower, zones, streaks, best score + top floor. |
| Performance | 8 | 61 fps in smoke; only 3 floors collided/drawn, cached glows, bounded particles. |
| Technical robustness | 8 | Deterministic sim, pause/auto-pause, resize, clean restart, test 3× green, smoke clean. |
| Overall polish | 7 | Menu → climb → time up → again is seamless; no placeholder copy left. |

## Next recommended action
Human phone playtest to tune time economy and lane windows; add special floors every zone (a moving lane, a magnet floor, a
"boss gate" that needs a charged floor) to keep variety past floor 10.
