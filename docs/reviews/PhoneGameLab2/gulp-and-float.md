---
id: PhoneGameLab2/gulp-and-float
title: Gulp & Float
was: bubble-up (Bubble Up)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Float upward in a bubble, steer left/right, dodge spikes that fall from above; score is time survived.

## Baseline assessment
25-line placeholder: a circle glued to the finger x (no inertia at all), red triangles spawned at random, one-hit
death, score = seconds × 10, flat navy background, no sound, no pal. Overall 2/10.

## Weaknesses identified
No "float" (the bubble teleports to the finger); nothing to want except not dying, so the best strategy is to hide;
no telegraphing; no progression or variety; no identity or character.

## Creative opportunities
Make the bubble itself the stat: a size that is at once multiplier, spare life and handicap, fed by something the
pal obviously wants (a frog and fireflies). Tie the inertia to that size. Turn the climb into a journey with zones.

## Planned improvements
Spring-follow steering; tongue-gulped fireflies; four bubble sizes; pop-a-layer damage; near-miss bonus; five altitude
zones each adding a hazard family; warnings for everything that falls; Momo acting inside the bubble; day-to-night palette.

## Implemented improvements
- **Floaty inertia**: the bubble is an under-damped spring chasing the finger (or arrow keys): it lags, overshoots a
  little, bounces softly off the leafy walls, stretches with speed and wobbles after events. Stiffness drops with size,
  so a ×4 bubble is noticeably lazier than a ×1.
- **Gulp to grow (the reason to take risks)**: Momo's tongue snaps any firefly within reach; three gulps blow the
  bubble one size up (×1…×4, pips under the bubble show progress, golden fireflies fill it at once). Size multiplies
  altitude points and gulp points, rises 5 % faster per size, and is a spare layer: a prickle pops one layer (1.5 s
  of blinking safety, streak lost), the last pop ends the run. Fireflies are placed at vine tips and inside curtain
  gaps; a firefly streak adds up to +10 per gulp; near misses pay "close!".
- **Five zones** with banners, palette cross-fades and music intensity: Lily Pond (single burrs), Bramble Thicket
  (thorny arms from the walls, gates), Treetops (bumblebees crossing on a sine, wind bands that shove big bubbles
  further), Cloud Tops (hail curtains with one gap, staircases), Starlight (diagonal falling stars with a dashed path
  warning; HUD flips to light text). Spawn rhythm tightens to 700 m and adds doubles beyond. Vines and curtains are
  generated against a guaranteed open channel so every pattern is passable at ×4.
- **Momo is the actor**: looks at the nearest prickle or firefly, goes wide-eyed when one is close, cheers and
  stretches on a gulp, leans against the drift, goes dizzy when a layer pops, and tumbles out arms-up on the last pop.
- Every faller is telegraphed (blinking marker at the top/side edge for 0.7–1.3 s). Opening 4.5 s is hazard-free
  with a firefly trail that teaches gulping; first prickles are slow.
- Audio: pentatonic ladder on gulp streaks, bubble/pop pitched by size, wind loop inside gusts, "chill" music whose
  intensity steps up per zone. Live attract demo (autopilot) behind the splash card.

## Test results
- Smoke (`tools/smoke.js gulp-and-float`): pass.
- Gameplay test (`tests/PhoneGameLab2/gulp-and-float.test.js`, 3 consecutive passes): real drag shows spring lag then
  settles; climbing scores; three fireflies → ×2 and HUD matches; prickle at ×2 pops one layer without ending the run;
  real drag dodges a prickle; wind displaces the bubble; prickle at ×1 ends the run and records best; clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (pond start, treetops with vine/bee/wind, starlight with
  curtain + gate + falling star, splash). Fixed: bubble rim contrast on pale skies, pond visible at launch, bubble size.
- Subjective assessment from scripted play and code reading only (no human playtest). No long balance probe was run.

## Remaining issues
- Portrait-only by design (a vertical climb); on an 844×390 landscape phone the stage is a small centred column.
- Wind bands are drawn as plain translucent rectangles; they read clearly but are the least pretty element.
- Balance past ~700 m is tuned by reasoning, not by measured play.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Drift-and-gulp is pleasant at once; greed for the next size keeps pulling you toward danger |
| Mechanical depth | 7 | Size as multiplier/life/handicap, streaks, near-miss bonus; steering is the only verb |
| Game feel | 8 | Spring lag, stretch, wobble, tongue snap, layered pop with hit-stop |
| Visual identity | 8 | Bubble + frog silhouette, leafy chimney, five-palette afternoon-to-night climb |
| Animation quality | 8 | Momo reacts continuously; bubble deforms; warnings pulse; tumble-out ending |
| Audio quality | 7 | Informative pitches and a wind loop; hazards themselves are quiet |
| Controls | 8 | Absolute drag with spring, keyboard arrows, forgiving hit radius and tongue reach |
| Onboarding | 8 | Firefly trail before any hazard; one hint line; warnings teach the fallers |
| Replayability | 7 | Random patterns per zone, score chase via multiplier; no meta progression |
| Performance | 8 | ≤ ~40 entities, baked burr/bee sprites, one gradient per frame; 61 fps in headless smoke |
| Technical robustness | 8 | Clean restart, resize handled once, loops stopped on death, no errors |
| Overall polish | 8 | Complete loop with live attract, zone banners, themed game-over text |
## Next recommended action
Human playtest of the 400–800 m band to tune curtain/wind density; feather the wind band edges.
