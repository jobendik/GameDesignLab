---
id: games/orbit-drift-3d
title: Orbit Drift 3D — Ringstream
was: Orbit Drift 3D — Three.js Sling Prototype
status: transformed
baseline: 3
score: 7
updated: 2026-11-27
---
## Original concept and core mechanics
A three.js port of the 2D sling prototype: the same six rooms rebuilt as a grey glass box, with the orbit rings
tilted into depth. A sphere rides a ring, one tap releases it along the tangent under downward gravity, touching
another ring's tube latches it, reach the portal. Chase / wide / top camera toggle, Zen and "Endless" buttons.

This is the 3D half of a pair. Its sibling `orbit-drift-sling` (*Slingshot Voyage*) is now the precise one-tap,
top-down game: no steering, read the predicted path, time the release. **This** game takes the opposite pole and the
thing only 3D can give — speed and depth: you *steer* a probe down an endless stream of ring gates, and the "orbit /
sling" idea survives as the planet set-piece (dive through the band around a planet for a slingshot).

## Baseline assessment
Rough prototype, 3/10. It ran, but the third dimension made the original idea worse rather than better: with a
fixed tap-to-release input the player cannot judge whether a tilted ring's tangent lines up with another ring in
depth, the trajectory dots ignored most forces, and the camera could not show the release plane and the target at
once. Grey translucent walls, HUD panels over a third of a phone screen, portrait unusable, new `Vector3`s every
frame in the camera, no score, no best, no pause, no mute, no touch layout, four debug buttons.

## Weaknesses identified
1. The 2D design does not read in 3D: one-tap timing needs a view where the launch tangent is legible; here it never is.
2. Two games with the same rooms and rules — the 3D one had no reason to exist.
3. No structure (timer only), no fail pressure, no replay hook, unvalidated random "Endless" rooms.
4. No spectacle: flat lighting, grey box, static camera; nothing about it says speed or space.
5. Lifecycle and platform gaps (pause, best, mute, touch, portrait, frame-rate independence, slow-GPU fallback).

## Creative opportunities
- Use depth for what it is good at: rings rushing toward you, a chase camera that banks, FOV that opens with speed.
- Keep "orbit / sling" as a risk-reward set-piece instead of the whole control scheme: a planet beside the stream
  with a safe ring and a dangerous, lucrative slingshot band hugging its limb.
- One meter instead of lives: charge that rings refill and time drains, so failure is gradual and fair.
- A reticle on the next ring's plane, so depth never has to be guessed.

## Planned improvements
Rewrite as an endless ring-gate flight with steer-anywhere controls, combo/perfect/graze/slingshot scoring, sector
ramp, bloom + automatic quality fallback, full audio and lifecycle; deterministic seeded course and stepping hook.

## Implemented improvements
**Game (complete rewrite; three.js 0.160 ES module from `vendor/`, import map, no network)**
- The probe flies forward on its own; you steer it in the cross-section. Mouse = absolute (the probe follows the
  cursor), touch = relative drag anywhere (the finger never covers the probe), arrows / WASD move the aim. The
  probe follows the aim on a slightly under-damped spring, so it leans and drifts into turns.
- **Rings**: thread one to recharge (+12), hit the inner 40 % for PERFECT (+17, double combo, FOV kick). Combo raises
  the multiplier (×8 at 28) *and* your speed, so good play makes the game faster. A miss costs charge and the combo.
- **Charge** drains with time (faster each sector) and is the only life bar: rocks (−26) and planets (−38) hurt but
  do not end the run outright; 1.2 s of invulnerability and a knock-away follow a hit. Empty charge ends the run.
- **Planet set-piece** every sector (ring 11, 31, …): the safe ring sits beside a planet; the orange band hugging the
  planet is the alternative gate — SLINGSHOT: +500×mult, +3 combo, +28 charge and a speed surge. The planet pulls
  you in as you pass, so the band has to be held against gravity; touching the planet is the biggest hit in the game.
- **Rocks** appear from ring 6 and thicken per sector; the straight line between ring centres is always left clear
  (fair), cutting close scores GRAZE (+60×mult, +3 charge).
- **Sectors** of 20 rings: more speed (24 → 66 u/s), wider weave, smaller rings (2.5 → 1.55), moving rings from
  sector 3, denser rocks, faster drain; each new sector gives +22 charge, a banner, a new palette (blue → violet →
  teal → amber) and a faster score tempo. The whole course is a pure function of `(seed, ring index)`.
- **Readability in depth**: the next ring is brightened and pulses, a reticle sits on its plane where the probe will
  cross (white → green inside → gold in the perfect zone → orange in the slingshot band), a faint thread joins the
  next seven ring centres, rings fade out of fog so only ~8 are in view.

**Feel / look** — chase camera that lags, banks with lateral speed and widens FOV with speed and surges; additive
trail ribbon; ring pass = flash + expansion + sparks thrown past the camera; speed streaks whose length and
brightness follow speed; hit = shake, red vignette, debris; low charge = pulsing vignette + beeps. Faceted rocks
with red halos (red = danger, as in the 2D sibling), banded and ice planets with atmosphere shells, star sphere,
six nebula sprites and a far sun that ride with the camera. UnrealBloom at full quality.

**Quality fallback** — three levels (bloom + DPR ≤ 2 → no bloom, DPR ≤ 1.5 → DPR 1, fewer streaks/particles). A
frame-time average above ~24 ms for 1.6 s steps down one level and never back up; `?q=0|1|2` pins a level.
Verified in software-rendered headless Chromium: 2 → 1 → 0 within 4.5 s while the simulation kept real time.
Logic runs at a fixed 120 Hz step (up to 16 steps per frame), so slow frames do not change the game.

**Audio** — engine drone (two detuned saws through a low-pass) and wind whose pitch and brightness rise with
speed; ring chimes climbing a pentatonic scale with the combo, extra octave sparkle for PERFECT; slingshot riser +
arpeggio; graze zip; miss thud; impact; low-charge beeps; sector fanfare; a driving arpeggio whose tempo rises per
sector and whose layers thicken with the combo. Starts on first gesture, M / button / `?mute=1`, suspended on pause.

**Lifecycle / tech** — menu (with a live fly-through behind it) → play → game over → retry without reload; pause
button + P/Esc + auto-pause when hidden; resize/rotate safe (portrait widens the vertical FOV); typed-array pools
for particles, trail and streaks, pooled ring/rock/planet meshes, no per-frame allocation in the step; reduced
motion drops roll, shake, FOV kicks and most particles; best in `gdl:best:games/orbit-drift-3d`; `?seed`,
`?autostart=1`, `?nopause=1`; `window.__gdl` (`state`, `manual`, `advance`, `toPointer`). No `window.top`.

Removed on purpose: the box rooms, tap-to-release orbits, bumpers/fields/portals, Zen, camera toggle and the debug
buttons — that game is now done properly, in 2D, by the sibling.

## Test results
- **Automated-technical**: `node tools/smoke.js orbit-drift-3d` → ok (software WebGL: 12–16 fps, as expected).
- **Automated-gameplay**: `node tools/run-tests.js orbit-drift-3d` → pass (≈37 s; `?q=0`, 320×568, simulation
  stepped by the test). Real mouse moves thread five rings (score, combo, perfects, speed) → arrow key moves the
  aim → real touch drag (CDP touch events) steers relatively → a ring is missed (combo/multiplier reset) → the
  planet band gives a SLINGSHOT with surge → a rock hit costs charge → pause freezes time → flying wide drains the
  charge: game over, best persisted → clean restart.
- **Visual inspection**: screenshots looked at for menu, early rings, planet approach, post-slingshot, rock field,
  sector 3 and game over, at 1280×800 (medium and full-bloom quality), 390×844 and 844×390. The first pass showed
  a trail ribbon that filled the lower screen, a flame sprite hiding the probe, a milky nebula wash and an
  over-bright sun; all four were fixed (thin short ribbon, small flame, higher camera so the probe is seen from
  above, dimmer sky, gentler bloom) and re-shot.
- **Subjective playtest**: none by a human, and none on a real GPU — feel, speed and audio are judged from code,
  scripted play and stills. A scripted "perfect" pilot holds 97 % charge through three sectors; difficulty for a
  human at sector 5+ (53 u/s, 0.6 s between rings, full weave) is an estimate.

## Remaining issues
- Never seen at 60 fps: tuning of spring, camera lag, FOV kicks and bloom strength needs a real device pass.
- Early game may be too gentle (charge is hard to lose in sector 1); the ramp is where the challenge comes from.
- One set-piece type (planet) per sector; no boss-like variation (ring tunnels, split paths) yet.
- At quality 0 the look is clean but plain (no bloom); rings and reticle still read well.
- Mouse control is absolute and needs no click, so inside the arcade iframe keyboard steering needs focus (the
  canvas takes focus on launch and on any click).
- The slingshot hint is shown before every planet until the first slingshot is taken.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Thread–perfect–faster loop with a clear set-piece; untested by a human and gentle in the first sector. |
| Mechanical depth | 7 | Centre vs safe pass, speed-from-combo feedback, graze lines, ring-or-slingshot choice against planet gravity. |
| Game feel | 7 | Spring-drift steering, banking camera, FOV/surge, ring bursts, streaks; all tuned blind at 12 fps. |
| Visual identity | 8 | Bloomed ring stream, banded planet with glowing band, sector palettes; distinct from the 2D chart look. |
| Animation quality | 7 | Rings expand/fade, probe banks and pitches, palette cross-fades, callouts animate; rocks only tumble. |
| Audio quality | 7 | Speed-pitched engine, combo-pitched chimes, tempo-by-sector score — designed to inform, unheard. |
| Controls | 8 | Absolute mouse, relative touch drag, keys; honest reticle; generous ring edge (+0.12) and i-frames. |
| Onboarding | 8 | Three-line how-to, opening hint matched to the input device, first ring dead ahead, planet hint. |
| Replayability | 7 | Seeded endless course, sector ramp, multiplier chase, best score; variety limited to one set-piece type. |
| Performance | 7 | Pooled everything, 3-level automatic fallback proven in software GL; real-device frame rate unmeasured. |
| Technical robustness | 8 | Fixed-step sim independent of frame rate, pause/visibility/resize, bloom load guarded, full-loop test. |
| Overall polish | 7 | Seamless menu → run → game over → retry, nothing placeholder; needs a tuning pass on hardware. |
## Next recommended action
Play it on a phone and a desktop GPU: tune steering spring, camera and sector-1 drain; then add a second set-piece
(a ring tunnel through an asteroid belt, or twin planets with a figure-eight slingshot) to vary sectors.
