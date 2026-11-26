---
id: PhoneGameLab/28-hollowlight
title: Hollowlight
was: 28-cave-flyer (Cave Flyer)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Fly through a scrolling cave whose walls narrow over time; touching a wall ends the run. (The prototype's text said
"drag up/down" and set the dot's height directly from the finger.)

## Baseline assessment
35-line placeholder: a blue dot teleported to the finger's y, a per-pixel random-walk cave (jagged noise, could pinch
shut faster than a finger can move), integer-pixel scrolling tied to frame rate, instant death, score = time, no audio
worth the name, no best score. Overall 2/10.

## Weaknesses identified
No flight model (so no skill); unfair noise walls; frame-rate dependent scroll; one-touch death in a game about
grazing walls; nothing to collect or decide; no atmosphere although a cave begs for one.

## Creative opportunities
A cave is dark. Make seeing the mechanic: a creature that *is* the light source, whose light is also its health, and
whose every wingbeat throws an echo of light down the tunnel. Then the narrowing cave is frightening for the right reason.

## Planned improvements
Hold-to-rise flight with inertia; smooth, fair, generated tunnel with telegraphed spikes; darkness with a glow radius
and echo pulses; one GLOW resource (sight + health); motes and risky blooms; depth zones; quiet, eerie audio.

## Implemented improvements
- **Flight**: hold = −1150 u/s² lift, release = +820 gravity, exponential drag and a ±390 clamp — soft, floaty inertia
  (pointer, Space, ↑ or W). Run waits, hovering, for the first press.
- **Light / echo**: the scene is drawn fully and then covered by a half-resolution darkness mask (74 % → 95 % opaque
  with depth) with a hole the size of the moth's glow; every press (0.28 s cooldown) launches an expanding ring that
  cuts a moving band out of the mask, so the tunnel ahead is revealed for a moment. The echo's pitch reports the tunnel
  width 200 u ahead (higher = tighter) and it repeats twice, fading.
- **One resource — GLOW**: sight radius and health at once. Fades 2 %/s (more with depth); motes +3.5 %, wall-hugging
  blooms +20 % and +25 points; a wall costs 30 %, bounces you off and gives 1.1 s of invulnerability; at zero the run
  ends. Above 85 % you are RADIANT and distance scores double — a reason to stay greedy for motes.
- **Fair cave**: one column per 12 u from a damped spring following random targets (slope-limited), width 68 % → 30 %
  of the band (never below 128 u), gentle value-noise roughness, stalactite/stalagmite teeth that always leave ≥ ~90 u
  and carry a bright glowing tip visible through the dark; fungi specks trace the walls faintly; motes follow a smooth
  line through the open part, so they double as a guide. The first 500 u are straight and wide.
- **Progression**: every 300 m a new zone (Mossy Hollow → Crystal Vein → Ember Narrows → The Deep Dark) with its own
  rock/rim colours, darker ambient, faster fade, more teeth; scroll 170 → 300 u/s.
- **Identity & animation**: warm gold moth (two wing pairs that beat fast under lift and idle otherwise, antennae,
  tilt, light-dust trail, X-eye on a hit) against cold contour-banded rock with a lit rim; parallax far formations,
  drifting dust; red pulse and heartbeat when the glow is nearly gone; on death the light closes in.
- **Audio**: sparse "spooky" music whose layers follow depth and danger, wing flutter while lifting, echo pings,
  a pentatonic mote chain, low glass + thud for wall hits.
- Tall screens keep a ≤ 600 u cave band (solid rock above and below), so vertical travel is the same on every device.

## Test results
- Smoke (`node tools/smoke.js 28-hollowlight`): pass, 61 fps headless, survives landscape resize + blur.
- Gameplay test (`tests/PhoneGameLab/28-hollowlight.test.js`): pass 3/3 runs — real pointer hold/release and Space,
  one echo per press, an in-page pilot using the game's hold/press actions flies 70 m without touching a wall, distance
  and motes score, a mote restores glow, glow fades, sinking into the floor costs ~30 % with invulnerability, repeated
  scraping ends the run, best saved, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800: splash, zone 1, Ember Narrows, Deep Dark at low glow, plus a
  70 s scripted run (480 m, alive). Fixed after inspection: moth washed out by its own aura (now drawn after the light
  pass, larger), scattered motes (now a smooth line), glow economy far too generous.
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- Fade/mote economy is reasoned from one scripted pilot; needs human tuning, especially past 900 m.
- The darkness mask is a full-screen composite each frame; fine in headless Chromium, unverified on a low-end phone.
- No forks or moving hazards; variety comes from the tunnel shape, teeth, blooms and darkness.
- The echo is automatic on every press, so there is no cost or timing decision attached to it.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Tense, calm flying; the dark makes ordinary tunnel-threading feel new |
| Mechanical depth | 7 | Glow as sight+health, risky blooms, radiant bonus; single hazard family |
| Game feel | 8 | Soft inertia, echo rings, hit-stop and glow burst on impact, light closing in on death |
| Visual identity | 9 | Dark mask with echo bands, warm moth vs cold rimmed rock — recognisable at a glance |
| Animation quality | 7 | Wings, trail, rings, pulsing motes; moth is small and simple |
| Audio quality | 8 | Echo pitch carries tunnel width; restrained, moody mix |
| Controls | 8 | One finger / Space, instant, forgiving hitbox, three-hit economy |
| Onboarding | 8 | Hover start with two-line prompt, wide straight opening, bright early cave |
| Replayability | 7 | Random caves, score chase with radiant bonus; no modes |
| Performance | 8 | ~110 columns, baked glows, half-res mask; 61 fps headless |
| Technical robustness | 8 | World rescales on resize, clean restart, engine pause |
| Overall polish | 8 | Cohesive mood from splash to game over |

## Next recommended action
Human playtest for the glow economy; add forks (an island with a mote-rich risky branch) and verify the mask cost on a
real mid-range phone.
