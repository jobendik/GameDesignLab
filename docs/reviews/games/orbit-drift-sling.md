---
id: games/orbit-drift-sling
title: Orbit Drift — Slingshot Voyage
was: Orbit Drift — Sling & Tap Prototype
status: transformed
baseline: 4
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A one-tap momentum toy: a dot rides a rotating ring, a tap releases it along the tangent, touching another ring
latches it, reach the portal. Six single-screen rooms (960×540) with walls, platformer-style downward gravity,
bumpers, push/pull fields, a portal pair and an optional "berry"; a Zen toggle and a seeded "Endless" button. The
kernel worth keeping: **timing a release so that momentum carries you from one orbit to the next.**

This is the 2D half of a pair. Its sibling `orbit-drift-3d` is now *Ringstream*, a steer-it-yourself endless flight
through ring gates (speed, near-misses, flow). **This** game is the opposite pole: no steering at all, one button,
a top-down star chart you read like a putt — the precise, readable orbital-slingshot game.

## Baseline assessment
Playable prototype, 4/10. It ran without errors and the release → latch loop worked, but: the room is letterboxed to
a 390×220 strip on a phone (unplayable in portrait); "orbit" was really a conveyor ring in a walled room with
downward gravity, so there was nothing orbital about the flight; the trajectory hint ignored fields and the ring's
real launch speed, so it lied; six rooms then a loop, no score beyond a timer, no best, no lives/stakes (tap to
restart the room), no pause, no mute, `shadowBlur` on every stroke, per-frame gradient allocation, particles spliced
out of arrays, system-font HUD with four debug-ish buttons (Restart / Zen / Endless / Next).

## Weaknesses identified
1. Not usable on a phone: fixed landscape room, tiny hit feedback, HUD panels covering a third of a portrait screen.
2. The core decision was thin: one fixed launch speed, a short misleading hint line, walls to bounce off — success
   was trial and error rather than reading the shot.
3. No structure: no scoring, par, progression curve, fail state or reason to replay; "Endless" was unvalidated
   random rooms that could be impossible.
4. No real gravity: the title promises orbits and slingshots, the physics delivered a pinball room.
5. Lifecycle gaps: no pause, no best score, no mute, no test hook, frame-loop simulation with `dt` clamp only.

## Creative opportunities
- Make the dotted line *the* interface: an exact prediction, always answering "what does a tap do right now?".
- Real n-body-ish gravity so paths bend, dark stars give gravity assists and gas giants hold on to you.
- Golf structure: every release is a stroke, each sector has a par; skipping a world is the hero play.
- A course that turns itself upright on a portrait phone (space has no "down").
- A solver that guarantees every generated sector is fair, so the voyage can be endless.

## Planned improvements
Rewrite around a fixed-step gravity simulation shared by the game and its predictor; authored lessons then generated
sectors validated by a solver; hull/fuel/par/streak economy; follow-camera with portrait rotation; timing grace;
full audio; lifecycle, best score, test hook.

## Implemented improvements
**Rules (complete rewrite, same one-tap identity)**
- Top-down sectors of worlds with capture rings. Tap in orbit = sling along the tangent. Flight is real gravity
  (every world, dark star and gas giant pulls, fixed 120 Hz semi-implicit step). Crossing a ring = capture (orbit
  direction comes from your approach), dark stars and rocks destroy you, flying into the gold gate clears the sector.
- **The dotted path is exact**: it is produced by the same step function as the simulation (including worlds that
  move), so green always means a catch. In flight, white shows where you are coasting and **orange shows what a burn
  would do** — one rule everywhere: *the dots show what a tap does now*.
- **Fuel burn**: a second tap in flight spends a fuel cell for +200 u/s. Gas giants are too heavy for a plain sling
  (you loop back), refuel you on every capture and so can never soft-lock; burning low in the well goes further
  (a real Oberth effect the orange path makes visible).
- **Golf scoring**: slings vs par, a draining speed bonus bar, flawless bonus, +250 per sling under par (long shots
  that skip a world are possible but the predictor only sees ~1.6 s ahead, so the boldest ones are blind),
  shards placed by the solver on the *edge* of real catch windows (braver release), graze bonus for skimming
  hazards, "SMOOTH" bonus for a tangential capture, clean-sector streak multiplier up to ×3.
- **Stakes**: 3 hulls for the voyage; a crash or a drift into the void costs one and puts you back in orbit round
  your last world 0.6 s later (stroke counted, streak broken). Five shards repair a hull. Flawless par earns fuel.
- **Course**: eight authored lessons with a deliberate curve and slower orbits (First Light → Dogleg → Dark
  Neighbour → Escape Velocity → Carousel → The Belt → Slingshot Alley → Clockwork), then endless seeded sectors
  whose world count, orbit speed, movers, belts, dark stars and minimum window width ramp for 22 sectors. Every
  sector — authored or generated — is checked by a solver (each hop must have a fair release window for both orbit
  directions, and at two times when things move) and regenerated if not (typically < 40 ms).
- Start-at-sector chips (5, 9, 15, 21) unlock on the menu as you reach them.

**Feel and fairness**
- Timing grace instead of luck: a tap up to ~120 ms late in the first sectors (50 ms later on) or 50 ms early still
  takes the catch that was on screen; burns get the same grace from a 16-step state history. 0.2 s input lock after
  a respawn/capture so a panic double-tap cannot throw away a hull. Respawn puts you a quarter-orbit *before* the
  failed angle.
- Capture: 50 ms hit-stop, ring pulse, sparks along the ring, shake, rising pentatonic chime. Burn: flame, orange
  trail, shake, roar. Gate: gold flash, implosion burst, arpeggio, banner with the breakdown. Score pops on change.
- Camera frames the probe, its world and the next two stops with smoothed zoom; on a portrait screen the whole
  course is rotated 90° so "forward" is up (rotation is tweened on resize).

**Look** — deep-space navy with a per-sector nebula wash (flattened once per sector), parallax starfields, cached
shaded planet sprites (banded gas giants), dark stars with a magenta rim and in-falling field rings, crimson faceted
rocks with glow, gold gate and shards, cyan dart with additive ribbon trail. Orbitron/Rajdhani/Chakra Petch from the
bundled fonts. Colour is never the only cue: catch = ring marker + highlighted target ring, crash = ✕ marker.

**Audio** (WebAudio, starts on first gesture, M / button mutes, `?mute=1`) — flight voice (triangle + band-passed
noise) whose pitch and brightness follow speed; a lock blip the moment the path acquires a catch; release chirp;
capture thunk + chime climbing a pentatonic scale with each new world; shard arpeggio; burn roar; crash / lost
stings; gate arpeggio; generative ambient score (pads + echoing plucks) that thickens with the clean-sector streak
and transposes per sector. Context is suspended on pause.

**Lifecycle / tech** — menu → play → game over → retry without reloads; pause button + P/Esc + auto-pause when
hidden; resize/rotate safe; `prefers-reduced-motion` drops shake/flash/particles; pooled particles, typed-array
trail and predictor buffers, no `shadowBlur`, no per-frame gradients; best in `gdl:best:games/orbit-drift-sling`
(furthest sector in `gdl:save:…`); `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`; `window.__gdl`
(`state`, `manual`, `advance`, `seek`, `toScreen`, `sector`). Keyboard: Space/Enter/↑/X act, P/Esc pause, M mute,
R restart (paused / game over). Works focused inside an iframe; no `window.top`.

Removed on purpose: walls, bumpers, push/pull fields, the portal pair, Zen mode and the Next/Endless debug buttons —
they belonged to the pinball-room reading of the idea; hull + respawn replaces Zen.

## Test results
- **Automated-technical**: `node tools/smoke.js orbit-drift-sling` → ok, 61 fps in headless Chromium (was 27 before
  the nebula layer was flattened).
- **Automated-gameplay**: `node tools/run-tests.js orbit-drift-sling` → pass (≈5 s). Real touch taps + keyboard with
  the simulation stepped deterministically: menu → launch → late-tap grace → predicted catch is the catch that
  happens → gate clear, bonus, fuel, next sector → keyboard sling → void sling costs a hull, respawn → sectors 2–3
  played out → gas-giant burn spends fuel and breaks free → pause freezes time → three losses end the voyage, best
  persisted → clean restart.
- **Visual inspection**: screenshots at 390×844, 844×390 and 1280×800 looked at for menu, sector start, locked
  path, flight, burn path, sector clear, miss, game over and pause, plus sectors 6–9 in landscape. Fixed from
  them: HUD wrapping in portrait, slashed-zero score font, hint covering the start world, dim rocks, mute glyph.
- **Subjective playtest**: none by a human. Judgement comes from reading the code, scripted play with real input
  and three bots: a perfect bot clears 10+ sectors on par; a bot that reacts 80–140 ms after the lock appears
  reaches sector 8–12; one that reacts 80–280 ms late reaches sector 5 (before the early-sector easing it died in
  sector 2). Audio was not listened to.

## Remaining issues
- Audio mix and the generative music are unverified by ear.
- The sector banner sits over the upper-middle of the field for ~1.4 s and can cover the first target briefly.
- Dark stars mostly act as hazards that bend shots; the generator does not yet *require* a gravity assist, so the
  showpiece slingshot only happens when a player goes looking for an under-par line.
- A straight hole-in-one on the gate is available whenever it is in line of sight and within predictor range.
- Generated sectors with many movers occasionally take a few solver attempts (worst seen ≈ 100 ms, hidden by the
  gate flash).
- No colour-blind palette option (markers and ring highlights are shape cues, the dot colour itself is not).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Watch the arc sweep, tap, get caught — readable in seconds; chaining quick releases for the speed bar has flow. Not human-tested. |
| Mechanical depth | 8 | Release timing, par/skip lines, burn timing in a gravity well, edge-of-window shards, graze risk, fuel and hull economy across a run. |
| Game feel | 8 | Zero-latency release on pointerdown, hit-stop/pulse/sparks on capture, trail, burn kick, timing grace both ways. |
| Visual identity | 8 | Coherent star-chart look with distinct languages for friend (cyan/green), goal (gold) and danger (magenta/red). |
| Animation quality | 7 | Eased camera and zoom, ring pulses, flowing dots, pops; world sprites are static discs, respawn is a simple burst. |
| Audio quality | 7 | Informative and layered by design (speed-pitched flight voice, lock blip, climbing chimes, adaptive score) but unheard. |
| Controls | 9 | One input everywhere (tap / click / Space), generous but honest grace, anti-double-tap locks, ≥44 px buttons. |
| Onboarding | 8 | Three-line how-to, sector 1 teaches in two taps, one-line hints introduce each new element, slow early orbits. |
| Replayability | 8 | Endless validated sectors with a 22-sector ramp, seeded runs, streak multiplier, start-at-sector unlocks, best score. |
| Performance | 8 | 61 fps software-rendered at 1280×800; pooled/typed buffers; prediction is ≤ 3 × 192 steps per frame. |
| Technical robustness | 8 | Deterministic fixed step, clean restart, pause/visibility, resize/rotation, storage guarded, test covers the full loop. |
| Overall polish | 8 | Menu → play → clear banners → game over → retry is seamless; nothing placeholder; a few rough edges listed above. |
## Next recommended action
Human playtest for timing feel and audio balance; then teach the generator to build one "assist required" hop per
late sector (solver already has what it needs) and add a daily-seed voyage.
