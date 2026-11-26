---
id: games/neon-strike
title: Static Bloom
was: Neon Krunker: Overdrive (in-game "NEON STRIKE")
status: transformed
baseline: 3
score: 7
updated: 2026-11-26
---
## Original concept and core mechanics
A three.js first-person shooter on an endless neon grid: WASD + pointer-lock mouse, hold-to-fire hitscan rifle, red boxes
that walk straight at you and drain health on contact, +100 per kill, instant respawn on death.

## Baseline assessment
Played in headless Chromium (pointer lock works there) and read in full. It ran, and the shooting loop technically worked,
but it was a tech demo: 8 identical boxes that slide toward the camera; no waves, no end state (death teleports you after
2 s and keeps the score), no reload time (R refills instantly), no audio at all, no touch input, no pause, bloom at
strength 2.5 that turned the viewmodel stripe into a screen-wide cyan smear (see baseline screenshot), a Google-Fonts
`@import`, per-shot geometry/material allocation, `setTimeout`-driven effects, and a title borrowing a commercial game's name.

## Weaknesses identified
1. No game: no objective, no escalation, no failure, no best score. 2. One enemy with one behaviour (walk at player).
3. Gunplay had no information: no recoil pattern, no spread, no crits, no audio. 4. Nothing rewarded movement.
5. Desktop-only; unusable on a phone. 6. External request, borrowed name, no metadata, blown-out post-processing.

## Creative opportunities
Keep "fast neon arena FPS" but give it its own fiction and a loop built around motion: enemies shatter into shards that
must be physically swept up before they fade, and those shards are score, multiplier upkeep and ammunition for the heavy weapon.

## Planned improvements
Original identity; round arena with cover and jump platforms; four construct types with telegraphed, dodgeable attacks;
wave director; flow multiplier; shards → Nova charge; pad pickups under light beams; full gun feel; procedural audio and
adaptive music; twin-stick touch with auto-fire; pause/auto-pause; best score; tests.

## Implemented improvements
- **Identity**: renamed *Static Bloom* (Dead Channel Arena). Circular broadcast arena with a procedural ring/spoke floor
  shader, gradient sky with a broken halo and distant masts, faceted crystal constructs, mint/rose/amber/violet palette,
  Chakra Petch + JetBrains Mono from the vendored fonts. No external requests.
- **Loop**: endless waves built from a budget (drifters, wisp packs, lancers from wave 2, bulwarks from wave 4, a Prime
  Bulwark every 5th), telegraphed spawns, 5 s breaks with a clear bonus and +12 integrity. Death ends the run → results
  (score, wave, kills, accuracy, top flow) → restart. Best persisted to `gdl:best:games/neon-strike`.
- **Enemies**: Drifter (weaving chaser, wind-up → lunge → recover, limited attack tokens so early waves are fair), Lancer
  (keeps range, strafes, shows an aim line, fires a burst of slow bolts with wave-scaled lead), Wisp (orbits then
  dive-bombs), Bulwark (slow turn rate, front plating absorbs 70 %, exposed back core ×2.5, lobs mortars with ground
  telegraphs, slams a shockwave you must jump). Core hits interrupt drifter wind-ups and lancer charges.
- **Reasons to move**: shards (magnetised at 5 m, fade after 9.5 s) give score × flow, refresh the flow timer and charge
  the Nova launcher; pickups (Repair, Overdrive, Nova cell) appear on five pads under tall beams; every attack is
  dodgeable by movement; dash has i-frames and pays a DODGE bonus; jumping a shockwave pays CLEARED.
- **Gunplay**: 32-round arc carbine with spread bloom and recovering recoil, dynamic crosshair (turns red on target),
  muzzle flash sprite + light, pooled tracers, impact sparks, hit / crit / kill markers, enemy flash + knockback + scale
  punch + stagger, shatter bursts, tiny hit-stop on kills, score pops, damage-direction arcs, low-health pulse, reload ring.
  Nova: arcing explosive with knockback (RMB / F / touch button).
- **Movement**: buffered jump with coyote time and one air jump, 0.17 s dash on a 1.3 s cooldown, air control, view bob,
  strafe roll, landing dip, FOV kick (all scaled down under `prefers-reduced-motion`).
- **Audio**: WebAudio only after a gesture. Layered shot (noise + square + sub; pitch rises on the last quarter of the
  magazine), hit/crit ticks, plating ping, shatter that climbs a semitone per flow level, panned/attenuated enemy tells
  (charge, wind-up, mortar whistle, slam), shard pickups that run up a scale, and a 118 BPM step-sequenced track whose
  bass/kick/hat/snare/arp layers follow enemy count and Overdrive; heartbeat under 30 HP. Mute button + M, persisted.
- **Controls**: pointer lock + WASD/arrows on desktop with a fallback if lock is refused, aim-speed setting; on touch a
  floating left stick, right-side drag look, FIRE/JUMP/DASH/NOVA buttons, auto-fire when the crosshair is on a construct
  and a small bullet magnetism cone. Radar disc for off-screen threats and pickups.
- **Lifecycle/tech**: sim is `update(dt)` with 1/30 s sub-steps (≤0.1 s per frame); all timers are sim-time; everything
  pooled (particles in one Points cloud, instanced shards, tracers, bolts, rings, enemy meshes); adaptive resolution;
  pause button + P/Esc + auto-pause on blur/hidden/pointer-unlock; resize/rotate safe; `?seed`, `?autostart`, `?mute`,
  `?nopause`; inert `window.__gdl` hook.

## Test results
- **Automated-technical** `node tools/smoke.js games/neon-strike`: pass (WARN low fps = 18 in software WebGL, expected).
- **Automated-gameplay** `node tools/run-tests.js games/neon-strike`: pass, 3 consecutive runs (~26 s). Covers menu →
  click start with pointer lock, W/Space/Shift movement, one real mouse shot = 40 on the core and 20 on the body,
  sustained fire clearing wave 1, flow multiplier rising, wave 2 starting, Nova blast multi-kill, pad pickup, P pause /
  resume button / hidden-tab auto-pause / frozen sim, resize, passive player dying, best persisted, clean restart, and
  in a second phone-sized touch context: tap start, left stick, right-drag look, auto-fire, JUMP button, pause button.
  (Headless Chromium fires a bogus mousemove on each button press under pointer lock; the test aims after pressing.)
- **Visual inspection**: screenshots of menu, combat, wave banners, pause and game-over at 390×844, 844×390 and 1280×800
  were opened and judged; three rounds of fixes came from them (oversized black viewmodel, blown-out enemy flashes and
  bloom, fat tracers, sky noise, HUD/banner overlaps on phones).
- **Subjective playtest**: informed judgement from code and scripted play only — no human has played it.

## Remaining issues
- Never played by a human with a real mouse or real thumbs; aim speed, touch look acceleration and difficulty curve are
  reasoned, not felt. Touch FPS aiming is inherently weaker than mouse; auto-fire and magnetism compensate but a phone
  run will score lower.
- Real GPU performance is unmeasured (software WebGL gives ~18 fps at 1280×800). Bloom on low-end phones relies on the
  adaptive resolution scaler.
- Constructs are primitive solids; they read clearly but are not characterful up close. One arena, one weapon + Nova.
- Enemies steer with push-out collision only (no path-finding); they can briefly slide along a pillar.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Clear shoot → sweep shards → Nova loop with pressure from four enemy types; unproven by human play |
| Mechanical depth | 7 | Core crits, interrupts, flank-the-bulwark, dash i-frames, jump-the-shockwave, flow upkeep, pickup routing |
| Game feel | 7 | Recoil, spread, flash, tracers, markers, knockback, hit-stop, shake, FOV kick — all dt-based; tuned by eye from stills |
| Visual identity | 7 | Distinct ringed arena, halo sky and palette; enemies are simple faceted solids |
| Animation quality | 6 | Spawn scale-in, wind-ups, viewmodel sway/kick/reload, rings; no skeletal or secondary animation |
| Audio quality | 7 | Informative layered SFX with panning and an intensity-driven sequenced track; synthetic timbres only |
| Controls | 7 | Buffered/coyote jump, pointer-lock fallback, aim-speed setting, workable twin-stick with auto-fire; untested on hardware |
| Onboarding | 7 | Three-line how-to, contextual one-time hints, wave banners name the new threat |
| Replayability | 7 | Seeded-random waves, escalating mix, Prime waves, flow-driven score chase and best; single arena |
| Performance | 6 | Fully pooled, adaptive resolution; real-device fps not measured |
| Technical robustness | 8 | Clean restart, pause/auto-pause, resize, lock fallback, no console errors, test + smoke pass |
| Overall polish | 7 | Menu → play → results → retry is seamless; a few HUD overlaps remain on very small landscape screens |

## Next recommended action
Human playtest on a desktop mouse and a real phone to tune aim speed, touch look and waves 1–6; then a second arena
layout and a second primary weapon.
