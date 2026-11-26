---
id: PhoneGameLab/12-cold-snap
title: Cold Snap
was: 12-asteroids (Asteroids)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Inertial ship on a wrap-around field: rotate, thrust, shoot drifting rocks that split into smaller ones.

## Baseline assessment
43-line placeholder named after a commercial game: outlined circles on black, a ship that pointed at the finger (so the
finger covered it), hold-anywhere thrust, **double-tap to fire one bullet**, instant teleport-to-centre on death with no
invulnerability, a single wave followed by "win", emoji lives. Effectively unplayable one-handed. Overall 2/10.

## Weaknesses identified
Borrowed identity; three overloaded gestures on one finger; no aim/thrust separation; unfair respawn; no waves, scoring
depth or feedback.

## Creative opportunities
Inertia is the whole point of the genre, and water sells inertia better than vacuum (wake, glide, drag). Ice splitting is a
natural fit for "rocks that break". A reason to *enter* the debris field gives the drifting a purpose.

## Planned improvements
Floating one-thumb stick with a turn-only zone, auto-fire with light aim assist, wake and glide, berg → floe → chunk with
hit points, sinking sunstones for a decaying multiplier and a periodic sunburst, telegraphed charging enemy, escalating waves.

## Implemented improvements
- **Original identity**: top-down polar sea (baked teal water with caustic strokes and animated glints), faceted white ice
  with a translucent underwater skirt and crack lines per hit, an orange tug, amber sunstones, a narwhal-like Tusker.
- **One-thumb helm**: a stick appears wherever the thumb lands and follows it if it wanders. Under 22 px of travel only
  turns the bow; beyond that thrust ramps to full at 62 px. Keyboard: ←/→ turn, ↑ thrust. Verified by test.
- **Inertia**: 470 px/s² thrust, low drag when coasting (0.42/s) and higher under power, 315 px/s cap; foam wake and stern
  spray scale with speed/thrust; thrust-flip-fire-while-drifting works because turning is free.
- **Auto-fire** 4 shots/s only while targets exist, with an 11° aim assist onto the nearest ice in the bow cone; flares
  inherit some ship velocity and wrap.
- **Ice**: bergs (3 hits, 20) → two floes (2 hits, 50) → two chunks (1 hit, 100); children are kicked sideways from the
  shot direction; size-scaled crack audio, shards, rings, shake and hit-stop.
- **Hook**: 78 % of chunks leave a sunstone that sinks after 5.5 s (blinks from 4 s). Stones are magnetised within 74 px,
  give 25 × multiplier, and every 4 raise the multiplier (×1…×6). The multiplier melts one step if 7 s pass without a
  stone (bar shown). Every 8th stone fires a **Sunburst**: 16 real flares in a ring — the reward arrives exactly when you
  are deepest in the debris.
- **Escalation**: waves of 3 → 7 bergs, faster each wave, +100×wave clear bonus; from wave 3 a **Tusker** shows a dashed
  red line through your position for 1.25 s, then charges along it (3 hits, 150 pts and three stones); two at wave 7+.
- **Fair hits**: 2.4 s invulnerability bubble and a shockwave that shoves nearby ice away; bergs never spawn within 200 px.
- **Audio**: `drive` music with intensity tied to ice count/Tuskers/last life; soft sine "pip" for auto-fire; engine chug
  noise bursts while thrusting; rising pentatonic for stones.

## Test results
- Smoke (`node tools/smoke.js 12-cold`): pass, 61 fps headless.
- Gameplay test (`tests/PhoneGameLab/12-cold-snap.test.js`): pass (run 3× in a row) — small drag turns without thrust, long
  drag thrusts along the bow, glide after release, right-edge wrap, keyboard helm, stick-aimed auto-fire splits a berg
  (exact +20) and breaks all seven pieces, cleared sea → wave 2, sunstones magnetised/scored/chained, collision on the
  last life ends the run, best saved, clean restart.
- Bot run through the real stick (aim nearest ice, thrust for stones): wave 4, one life lost, 10.3 K in 100 s.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (wave 1, wave 4–5 density, Tusker warning and charge, splash).
- Subjective assessment from scripted/bot play only — no human playtest; stick feel on glass is unverified.

## Remaining issues
- Objects wrap when fully off-screen rather than being drawn on both edges, so there is a brief blind moment at the seams;
  the top seam also sits under the status strip.
- Ice does not collide with ice (pieces overlap visually in dense waves).
- Only one extra enemy type; no power-ups beyond the Sunburst.
- Aim assist strength and the turn-only dead zone need tuning with real thumbs.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Drift, flip and shatter is satisfying; stones pull you into trouble on purpose |
| Mechanical depth | 8 | Momentum management, stone greed vs safety, melting multiplier, telegraphed chargers |
| Game feel | 8 | Wake, glide, recoil, scaled cracks/shake, magnetised stones, sunburst |
| Visual identity | 8 | Teal sea, faceted ice and an orange tug: readable and unlike the genre's usual black |
| Animation quality | 7 | Wake, glints, wobble-in, blinking stones; ice is rigid polygons |
| Audio quality | 7 | Informative crack sizes and stone ladder; engine is noise bursts, not a real loop |
| Controls | 8 | One-thumb stick with separate turn/thrust zones, verified by test; untested on a device |
| Onboarding | 7 | Two-line opening prompt and visible stick rings; turn-vs-thrust still takes a few seconds to click |
| Replayability | 7 | Random waves, escalating count/speed, Tuskers, multiplier chase |
| Performance | 9 | ≤ ~30 polygons, 60 shots, 56 wake puffs; 60 fps headless |
| Technical robustness | 8 | Clean restart, resize rescales everything, stale-stick guard after pause |
| Overall polish | 8 | Cohesive theme and loop; a few seams (literally) remain |

## Next recommended action
Human playtest of stick dead-zone and aim assist; draw wrapped copies at the seams; add a second hazard (drifting fog bank or whirlpool).
