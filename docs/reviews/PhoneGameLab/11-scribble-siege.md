---
id: PhoneGameLab/11-scribble-siege
title: Scribble Siege
was: 11-space-invaders (Space Invaders)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Fixed shooter: slide a ship along the bottom, shoot a formation that marches sideways and steps down.

## Baseline assessment
65-line placeholder named after and laid out like a specific commercial game: coloured rectangles in an 8×4 grid, tap for
every shot (fire on release, 0.18 s cooldown), absolute-drag ship under the thumb, random un-telegraphed enemy shots,
identical waves, no feedback beyond beeps, emoji lives. Overall 2/10.

## Weaknesses identified
Borrowed identity; tiring tap-to-fire; finger covers the ship; no enemy variety, telegraphing, shields, power-ups or boss;
nothing to do except hold still and tap.

## Creative opportunities
A notebook-margin world makes the cast (doodles), the bunkers (sticky notes) and the super weapon (an eraser) all come from
one idea; auto-fire frees the single thumb for movement, so the depth can come from *where you choose to stand*.

## Planned improvements
Relative drag + auto-fire; four enemy kinds with wind-up tells; divers; boss every fourth wave; star-catching multiplier
that also charges an eraser bomb; sticky-note cover; power-ups; hand-drawn "boiling line" art; marching audio.

## Implemented improvements
- **Original identity**: ruled paper with margin, punched holes and idle doodles; every sprite is jittered ink line art with
  highlighter fill, baked in two "boil" frames; pencil-rocket player; red ink drops for enemy fire; light theme.
- **Controls**: drag anywhere moves the rocket by 1.25× finger travel (relative, thumb never covers it); mouse hover is
  absolute; arrows/A-D; continuous auto-fire (3.4 shots/s) with a soft tick rather than a zap.
- **Cast**: Blots (march), Spikes (wind up, then spit *aimed* dark ink), Crates (two hits, crack), Flaps (peel off, dive at
  the rocket, drop a shot, loop back; worth double mid-dive). Every shot is preceded by a 0.32 s wind-up pose.
- **Formation**: smooth sway + step-down, speed ×3.1 as it thins, "breathing" column spacing from page 2, footstep drum
  whose tempo is the formation speed; reaching the notes shreds them, reaching the rocket ends the run.
- **Waves**: 3 escalating formations then **The Big Smudge** (telegraphed 5/7-way fan, triple aimed burst, dive-bombing
  escorts below half health, HP bar); pages repeat with extra rows, more Crates/Flaps, faster and denser fire.
- **Hook**: erased doodles shed stars. Catching them builds a multiplier (×1…×5, three stars per step; a dropped star costs
  a step, a hit resets it) and charges the **Eraser** (11 stars): button, second finger, or Space — a giant rubber sweeps
  the page, deletes all ink and takes a hit off everything (10 off the boss). Stars fall through the line of fire: risk/reward.
- **Cover and pick-ups**: three sticky notes soak five shots each (visible bite holes), restored each page; Twin Leads,
  Ink Shield, Extra Life drops.
- **Feel**: wind-up squash, hit flashes, eraser-crumb bursts, rocket tilt and recoil, hit-stop + flash + shake on player hit,
  slow-mo and triple ring on the boss; `march` music intensity follows wave progress and danger.

## Test results
- Smoke (`node tools/smoke.js 11-scribble`): pass, 61 fps headless.
- Gameplay test (`tests/PhoneGameLab/11-scribble-siege.test.js`): pass — hover and relative drag (exact 1.25× travel), keys,
  pointer-driven play that kills by auto-fire and scores, star chain + eraser charge, ERASE button wipes ink and doodles and
  advances the wave, wave 2 composition, boss damage from shots and eraser, death on last life, best saved, clean restart.
- Bot run (hover + dodge, real pointer input): wave 6, ×5, no lives lost in 100 s before the final fire-rate bump — the
  opening pages are gentle; difficulty for humans is an estimate.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (waves 1/3/6, boss, eraser sweep, splash).
- Subjective assessment from scripted/bot play only — no human playtest.

## Remaining issues
- Difficulty beyond page 2 is extrapolated, not played; the first page may be too easy for experienced players.
- Boss has three patterns and no second form; escorts that survive rejoin a formation that overlaps the boss.
- Using the eraser needs a second finger or a thumb lift (deliberate risk, but untested on a real phone).
- Sticky notes do not block the player's own shots (friendlier, less tactical).
- Chrome logs a console error if `Lab.buzz` runs before the first tap (possible with `?autostart=1` + auto-fire); the game
  guards its own haptics with `navigator.userActivation`.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Constant shooting, clear targets, star chase gives every second a decision |
| Mechanical depth | 8 | Positioning for stars vs safety, multiplier upkeep, eraser timing, divers, boss tells |
| Game feel | 8 | Tells, flashes, crumbs, tilt/recoil, big eraser sweep; restrained shake |
| Visual identity | 9 | Boiling ink doodles on ruled paper are unmistakable in a thumbnail |
| Animation quality | 8 | Two-frame boil, walk/wing cycles, fly-ins, dive spins, eraser sweep |
| Audio quality | 7 | Footstep drum tied to speed, chain ladder; presets only |
| Controls | 8 | Relative drag verified exact; eraser reachable three ways |
| Onboarding | 8 | Auto-fire means the first drag already plays; opening prompt; "eraser ready!" call-out |
| Replayability | 7 | Escalating pages, boss, score multiplier; patterns are fixed per wave |
| Performance | 9 | Baked sprites, ≤ 70 bullets, 60 fps headless |
| Technical robustness | 8 | Clean restart, resize remaps entities, engine timers only |
| Overall polish | 8 | Cohesive theme from splash to game-over titles |

## Next recommended action
Human playtest of pages 2–3; add a second boss doodle and a formation pattern that splits in two.
