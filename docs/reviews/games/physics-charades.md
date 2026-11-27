---
id: games/physics-charades
title: Physics Charades — Pose or Splat
was: PHYSICS CHARADES
status: transformed
baseline: 2
score: 7
updated: 2026-11-27
---
## Original concept and core mechanics
A 440-line Matter.js sketch: a fixed 300 px chat sidebar showing "ACT OUT: SPIDER", and a stage where you dropped random
boxes and circles, linked them with floppy constraints and dragged the result around. Fake chat "users" posted canned
wrong guesses whenever a movement counter passed 20, and each post had a 15 % chance of being the win.

## Baseline assessment
Played with Playwright (screenshots at 390×844 and 1280×800 inspected). A bare prototype: the clock read "01:59" forever,
winning was a dice roll unrelated to what you built, the result card always credited "User_88", there was no score, no
fail state, no restart beyond "Next Word", no sound, no touch support (hover tooltips, Matter mouse constraint only), and
on a phone the sidebar ate 40 % of the width and the toolbar ran off-screen. Resize left the canvas stretched. It was
also the same idea as its bigger sibling `puppet-panic`, only less of it.

## Weaknesses identified
1. No game: no goal that the player's actions could reach or miss, no scoring, no end.
2. The "audience" was random; nothing was recognised.
3. Unplayable on touch and broken in portrait; no lifecycle, audio, persistence or metadata worth the name.
4. Redundant next to Puppet Panic.

## Creative opportunities
Keep the physical comedy of acting a word out with a wobbly body, but change the verb so it is not a second puppet
sandbox: a *reaction* charade. The word arrives as a hole in a wall; the body is snapped, limb by limb, into the shape.
Physics decides whether you actually fit: limbs are spring-driven and overshoot, so a late change clips the wall.

## Planned improvements
Rewrite as a quick-fire "strike the pose" arcade game with exact scoring, three lives, escalating speed, a pose
vocabulary to learn, an early-slam risk/reward button, game-show art direction, procedural audio, full lifecycle,
test hook and gameplay test.

## Implemented improvements
- **New core loop**: a foam wall with a pose cut out of it rolls down a runway toward a contestant on a podium. Tap the
  left/right arm or leg side of the screen (or Q/E/A/D) to step that limb through its positions — arms: down, out,
  flexed, up; legs: straight, wide, knee up. At impact every limb's *actual* angle is compared with the cut-out (±26°).
- **Physics that matters**: the contestant is a 10-body Matter ragdoll whose joints are driven by under-damped angular
  springs, so limbs swing, overshoot and settle over ~½ s. A fidget in the last moments leaves a limb mid-swing and it
  clips the wall even though its target is right (verified in the test). On a miss the springs are cut, gravity is
  switched on, and the body is flung off the podium into the pool; per-limb ✓/✗ marks show what clipped.
- **Charades layer**: 18 named poses (AEROPLANE, CACTUS, FLAMINGO, TRAFFIC COP, KUNG FU…) introduced in four tiers,
  plus random FREESTYLE holes from wall 10. Once a word has been seen it can come back as a **FROM MEMORY** wall: the hole
  is hidden under a tarp showing only the word until the last third of the approach, for double points.
- **Risk/reward**: BRING IT! (button or Space) slams the wall in immediately for up to +150 — but only if your limbs have
  finished wobbling. Streak multiplier +10 % per wall (to ×3). Approach time shrinks 5.6 s → 1.9 s over ~32 walls, music
  tempo follows. Three lives; best stored in `gdl:best:games/physics-charades` and shown in HUD, menu and game over.
- **Look**: saturated game-show studio — sunburst backdrop, perspective runway with scrolling chevrons, speckled foam
  walls that change colour every five walls (hole cut with `destination-out` into a cached sprite), hazard-striped
  podium, animated pool, helmeted orange contestant whose face goes wide-eyed as the wall closes in. Bebas Neue + Baloo 2.
- **Feel**: hit-stop and shake on a splat, hop + flash + confetti on a pass, pop-in score/bonus text, state pips beside
  each limb, pulsing rings on the limbs until the first few taps.
- **Audio**: rubbery boings whose pitch encodes limb and position, accelerating approach ticks, slam riser, pass chime
  that climbs a semitone per streak, crunch + slide whistle + splash on a miss, and a bouncy bass/kick/hat vamp that
  speeds up with the wall count. First-gesture start, mute button + M, `?mute=1`.
- **Controls**: touch (tap = next position, swipe down = previous), mouse, keyboard (Q/E/A/D or U/O/J/L, Shift = back,
  Space = slam, P/Esc pause, M mute, Enter start). Canvas grabs focus on pointer-down for the arcade iframe.
- **Lifecycle**: fixed 60 Hz step, pause button + keys + auto-pause on hidden tab, layouts for portrait / short landscape
  / desktop with safe areas, clean restart, reduced-motion honoured, `?seed`, `?autostart=1`, `?nopause=1`,
  `window.__gdl` (`state`, `manual`, `advance`, `limbXY`).

## Test results
- **Automated-technical**: `node tools/smoke.js physics-charades` → ok, no errors.
- **Automated-gameplay**: `node tools/run-tests.js physics-charades` → pass (≈5 s, 390×844 touch). Real taps match
  wall 1 (100 pts, best stored); keys + Shift-back + Space slam on wall 2 (bonus and ×1.1 streak maths checked); swipe
  down steps back; a last-moment fidget leaves the arm >26° off with the right target and the wall splats it; life lost,
  ragdoll leaves the podium, respawn; P freezes the wall; two more splats → game-over card and persisted best; AGAIN
  resets and the seed deals the same first wall.
- A scratch script also played 12 consecutive walls perfectly (including FREESTYLE and a FROM MEMORY wall).
- **Visual inspection**: menu, far wall, near wall, pass, splat, tarp wall and game over looked at in 390×844; near wall
  and menu in 844×390; pass in 1280×800.
- **Subjective playtest**: informed judgement from code and scripted play only — not played by a human, audio not heard.

## Remaining issues
- Tap-to-cycle means up to three taps per arm; a direct "drag the limb to the slot" gesture might feel better and is not
  implemented (swipe-down-to-step-back is the only shortcut).
- The speed curve and the 26° tolerance are tuned by script; the late game (≈2 s walls) may be too hard or too easy.
- A splat costs ~2.6 s of ragdoll + respawn; funny the first times, possibly slow later.
- Desktop shows large empty margins either side of the runway.
- One mode only; no daily seed or pose-book screen to browse the vocabulary.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Readable in seconds, tense as the wall looms, funny on failure; human fun unverified |
| Mechanical depth | 7 | Reading the hole, tap economy, settle time vs. slam bonus, memory walls, streak pressure |
| Game feel | 7 | Springy limbs, hit-stop, shake, hop, confetti, looming perspective; script-tuned |
| Visual identity | 8 | Loud game-show look, distinct from its theatre sibling and recognisable in a thumbnail |
| Animation quality | 7 | Physics-driven limbs and ragdoll, wall perspective, tarp slide, text pops; few bespoke anims |
| Audio quality | 6 | Informative pitched SFX and tempo-scaling vamp; never listened to |
| Controls | 7 | Big tap quadrants, keys with reverse, slam button; no direct-drag posing |
| Onboarding | 8 | First three walls are arms-only symmetric poses at 5.6 s; rings + pips; three-line how-to |
| Replayability | 7 | Seeded variety, 18 poses + freestyle, memory walls, speed ramp, best score |
| Performance | 8 | 10 bodies, cached background and wall sprites, bounded particles |
| Technical robustness | 8 | Fixed step, pause/blur, resize, clean restart, deterministic hook, gameplay test |
| Overall polish | 7 | Menu → run → game over → again is seamless; single mode |

## Next recommended action
Human playtest on a phone to tune the speed curve and tolerance, then try direct-drag posing and a "pose book" on the menu.
