---
id: PhoneGameLab/25-goat-up
title: Goat Up
was: 25-stair-climb (Stair Climb)
status: transformed
baseline: 2
score: 7
updated: 2026-11-26
---
## Original concept and core mechanics
Tap the left or right half of the screen to climb a zig-zag staircase; the prototype simply demanded strict L/R
alternation and ended after three "slips".

## Baseline assessment
40-line placeholder: grey rectangles, a blue box for the climber, no timer at all (despite the pitch), no generation
(the stairs were always L,R,L,R so there was nothing to read), tap-on-release input, a beep, no best score. Overall 2/10.

## Weaknesses identified
Nothing to read or decide; no time pressure; no rhythm reward; no feedback, character, world or progression; left/right
zones were invisible; keyboard unsupported.

## Creative opportunities
The fun of this genre is reading the stairway ahead and drumming it out with two thumbs — so reward rhythm directly
(a flow multiplier with a musical note ladder), make the timer the single health resource, and make altitude visible.

## Planned improvements
Generated runs of left/right ledges, instant two-thumb input, a draining "puff" bar, flow multiplier, camps as stage
milestones, an original alpine paper-cut identity with an animated goat, sky that changes with altitude.

## Implemented improvements
- **Core**: every next ledge is up-left or up-right; tap that side (two thumb zones with on-canvas buttons, or ←/→ / A/D).
  Input is acted on the same frame (`onDown`), the hop is purely visual so taps are never dropped; a tap in the last
  0.14 s of a stumble is buffered.
- **One resource — PUFF**: drains continuously (rate rises every camp), +4.5 % per hop, −18 % and a 0.3 s daze for a
  wrong hop. Empty bar = run over. The bar does not drain before the first hop, and pauses for 1.4 s at camps.
- **FLOW**: consecutive hops inside a 0.72→0.46 s window build ×1…×5 (thresholds 8/20/36/56); each hop plays the next
  note of a pentatonic ladder that steps up with the tier; ×5 is "fever" (sparkles, +20 % refill). Ring around the badge
  shows the remaining window.
- **Rewards / milestones**: cowbells on ledges pay 5×flow and +9 % puff; a camp every 50 ledges refills puff, raises
  the pace and changes zone (Meadow → Pine Ridge → Snowline → Cloud Sea → Starfields → Aurora).
- **Fair generation**: long runs at first (≥5 for the opening), shorter and more irregular with altitude; about ten
  ledges always visible; the next ledge is outlined, the goat turns to face it, and for the first 8 ledges (and after
  every stumble) the correct thumb button glows.
- **Identity**: procedural woolly kid (squash/stretch, tucked legs, flopping ear, blink, cowbell, dizzy stars), baked
  turf/snow/crystal slabs per zone, three parallax mountain layers that sink away as you climb, drifting clouds, sun →
  moon, stars and aurora at altitude; HUD text colour follows the sky.
- **Audio**: note ladder for hops, cowbell chime pitched by flow, stumble thud, heartbeat that quickens as puff runs
  low, bleat + falling whistle on failure; "bounce" music whose intensity follows flow and danger.
- Splash shows the live world (attract), game-over card with ledges / top flow / camps.

## Test results
- Smoke (`node tools/smoke.js 25-goat-up`): pass, 59 fps headless, survives landscape resize + blur.
- Gameplay test (`tests/PhoneGameLab/25-goat-up.test.js`): pass — touch taps climb and score, flow rises, arrow keys,
  wrong hop penalty, idle drain, camp at ledge 50, loss by repeated wrong hops, best saved, clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800: splash, early play, stumble, camp banner, zones 3 and 5,
  game over. Fixed after inspection: alpha leak that hid the goat/HUD, white HUD text on a light sky, crude ridge
  shapes, overlapping flow text.
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- Difficulty numbers (needed hops/s per stage, flow window) are reasoned, not human-tuned.
- Purely a reading/rhythm game: no second verb or hazard type; variety comes from run patterns, zones and pace.
- In 844×390 landscape the portrait stage is narrow (playable, small).
- Past camp 5 the zone stays "Aurora" (no new scenery).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Read-and-drum loop works immediately; flow ladder makes fast clean runs satisfying |
| Mechanical depth | 6 | Speed-vs-accuracy with a multiplier and one resource; no further verbs |
| Game feel | 8 | Same-frame hops, squash/tuck, dust, note ladder, dazed stumble, buffered input |
| Visual identity | 8 | Distinct paper-cut alpine look, zone palettes, characterful goat |
| Animation quality | 7 | Goat secondary motion, sinking ledges, parallax; camp flag is simple |
| Audio quality | 7 | Informative pitches and reactive music; all synthesized presets |
| Controls | 8 | Two thumbs or keys, instant, buffered, visible zones |
| Onboarding | 8 | Glowing correct button for the first ledges; bar waits for the first hop |
| Replayability | 7 | Score chase via flow, random stairways, six zones; no modes |
| Performance | 9 | Baked slabs/ridges, ≤ 20 slabs drawn, 59 fps headless |
| Technical robustness | 8 | Clean restart, world in step units so resize is free, engine pause |
| Overall polish | 7 | Cohesive loop; later-zone scenery thins out |

## Next recommended action
Human playtest to tune stage pacing; consider one late-game ledge variant (e.g. a spring that skips three ledges) for
variety past camp 5.
