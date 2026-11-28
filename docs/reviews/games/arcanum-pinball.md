---
id: games/arcanum-pinball
title: "Arcanum: The Spellbound Table"
was: "ARCANUM — Pinball Wizard"
status: transformed
baseline: 3
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"ARCANUM — Pinball Wizard" was a top-down *pinball brawler* in the mould of a commercial game: you are the ball, flippers
bounce you into enemies with a wind-up/attack state machine, a mana-powered DASH lets you steer mid-air, kill the key
holder, grab the key, enter the portal, pick a boon, next floor. Matter.js physics, neon canvas art, Google Fonts.

The lead's direction for this pass: make it a **real pinball table** with its own name and identity, clearly different
from its sibling `pinball-wizard-3d` ("SPIRE"). The kernel kept: the arcane neon look (cyan / magenta / gold, Cinzel),
the hex-and-rune mysticism, and the idea that the ball is a spell.

## Baseline assessment
3/10. Screenshots at 390×844 show a drained ball within 2.5 s of starting with no input; the "table" is an empty box with
a funnel, two flippers and floating hexagon enemies. Problems seen in play and code:
- Not pinball: no plunger, no ramps/orbits/targets/lanes, no score in the pinball sense; the dash steers the ball, which
  removes the skill of flipping. Borrowed concept and the "Pinball Wizard" name (a famous song title).
- Physics: Matter.js flippers driven by `setAngularVelocity`, a velocity clamp as "anti-tunnelling", 60 Hz steps with a
  5-step guard — fast balls could clip flippers; no live catch or cradle possible.
- Lifecycle: no pause, no auto-pause, no best score (comment says storage is blocked), no `?seed`, no test hook, emoji
  boons, Google Fonts (external requests), `Math.random` everywhere.

## Weaknesses identified
1. Not a pinball game at all — no table rules, no shot-making.
2. Physics not trustworthy at speed; flipper feel arbitrary.
3. No identity of its own (concept and name borrowed).
4. No lifecycle/robustness basics; external font requests.

## Creative opportunities
A compact but *complete* arcane table where the playfield reads like a spellbook: drop the runes to open the Eye, the Eye
casts spells (modes), standing runes light ritual locks, three locks summon multiball out of the summoning circle that is
painted on the playfield, and four spells unlock the Archmage wizard mode. A real DMD tells the story.

## Planned improvements
Full rewrite: own fixed-step physics with torque flippers, a laid-out table (orbits, ramps, drop bank + sinkhole, pop
bumpers, slings, standups, top and lower lanes, spinner, one-way gates, kickbacks, shooter lane), a complete rule set,
DMD, procedural audio and music, touch/mouse/keyboard controls, lifecycle, test hook, test, review.

## Implemented improvements
- **Physics** (own solver, no Matter.js): 120 Hz ticks × 8 substeps (960 Hz). Every collider is a capsule or circle; the
  ball moves ≤ 4.4 units per substep at the 4200 u/s cap against ≥ 15 units of contact depth, so it cannot tunnel
  (verified: 220 random max-speed shots with flippers flapping, ~8,000 samples, zero penetrations > 4 units). Grid
  broadphase; restitution goes to zero for slow contacts so the ball rolls instead of jittering; ball–ball collisions.
- **Flippers**: torque model (2900 rad/s² up to 27 rad/s, 1700 rad/s² return), full stroke ≈ 45 ms; tapered capsule
  whose *surface velocity* drives the impulse, so tip shots are hotter than base shots, a held flipper **cradles** the ball
  in the inlane crotch, releasing and re-flipping (drop catch / post pass) works, dead-flipper bounces are soft.
  Shot-mapping by script shows every major shot (both ramps, both orbits, the Eye drops, standups, bumpers) is reachable
  from a flipper with 5–15 ms timing windows depending on the feed — real pinball difficulty, tuned so it is attainable.
- **Table**: shooter lane with power plunger and one-way gate; S‑O‑L top lanes (lane change with the flippers) → bonus
  multiplier up to 6×; three pop bumpers; left/right orbits with one-way exit gates and a spinner; two crossing ramps
  (guided wireform with incline physics — weak shots roll back out); 3-rune drop bank guarding **the Eye** sinkhole;
  three standing runes; slingshots; W‑A‑R‑D inlane/outlane rollovers lighting outlane **ward kickbacks**.
- **Rules**: skill shot (lit top lane on the plunge, 500K+); **four spells** started at the Eye — EMBER (ramps),
  FROST (orbits), TEMPEST (bumpers, lightning arcs), CHRONO (simulation slows to 0.62× — any shot); spells time out
  (+10 s by re-shooting the Eye); **Ritual multiball** from 3 virtual ramp locks — balls burst out of the summoning
  circle, ramps light jackpots, both → super jackpot at the Eye; **Archmage** wizard mode after four spells (2-ball,
  every shot 1M, spell level rises); combos for major shots within 3.5 s; extra ball lit at the left orbit after two
  spells; 10 s ball save (and multiball add-a-ball save); end-of-ball bonus count-up × multiplier; **tilt** meter with
  DANGER warnings, TILT kills flippers/bumpers and the bonus; ball search for stuck balls; 3 balls.
- **DMD**: 128×32 dot-matrix rendered to a tiny canvas, upscaled through a cached dot mask with bloom; score, ball,
  multiplier, locks, mode timers and progress, event scenes (JACKPOT, CAST EMBER, TILT…), bonus count. Above the table
  in portrait, beside it in landscape/desktop with a spellbook status panel and a control legend.
- **Visuals**: static playfield pre-rendered once per resize (summoning circle with runes, neon rails, rubbers, aprons),
  ramp overlay layer above the balls, insert lamps (arrow inserts per shot coloured by state priority: jackpot › mode ›
  lock › extra ball), raised balls on ramps, table nudge spring, restrained shake/flash (off under reduced motion).
- **Audio** (WebAudio, after first gesture): flipper solenoid clack + thump, stop/rest clicks, pops pitched per bumper
  (octave up in TEMPEST), sling snaps, drop clunks and reset, standup bells, lane blips, spinner ticks whose pitch follows
  spin speed, ramp whoosh + made arpeggio / fail drop, orbit sweep, Eye swirl and kickout, lock chords, spell casts,
  jackpot/extra-ball fanfares, ball save shimmer, tilt buzzer, drain and game-over phrases; a continuous **rolling
  rumble** filtered by ball speed (brighter on ramps); generative dorian music whose tempo/layers follow
  idle → play → spell → multiball. Mute button / M, remembered.
- **Controls**: touch/mouse — left/right half of the screen = flippers (multi-touch), hold & release or pull down to
  launch, swipe up to nudge (direction from the swipe); keyboard — Z/X, ←/→, Shift; Space/↓/Enter hold to launch;
  Space/↑/C nudge in play, A/D side nudges; P/Esc pause; M mute. NUDGE button in landscape/desktop.
- **Lifecycle / conventions**: `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`; `window.__gdl` (state, `manual`,
  `advance`, flip/plunge/nudge/place/cheat, geometry); pause card (button, P/Esc, auto on hidden/blur), clean restart,
  resize-safe, best in `gdl:best:games/arcanum-pinball` shown on the DMD and side panel; vendored fonts only, no
  external requests; canvas is focusable for iframe keyboard play; cards have opaque panels and the canvas dims behind.

### Difference from SPIRE (`pinball-wizard-3d`)
Arcanum is a **flat, single-level 2D arcade table** about *spell modes and a multiball ritual* on one screen, read from a
DMD, with crossing ramps and orbit loops. SPIRE is a **tall 3D vertical table** whose camera climbs with the ball up
ramps to stacked upper playfields — a climb/ascent rule set rather than a mode wheel. See its review.

## Test results
- **Automated-gameplay** (`node tools/run-tests.js arcanum-pinball`, ~37 s, passed 3 runs in a row): menu → PLAY tap;
  real pointer hold charges the plunger, pull-down draws it further, release launches (≈2,070 u/s) and the 10 s ball
  save arms; Z flipper mid-stroke at 25 ms (ω 27 rad/s), at the stop at 55 ms, back at rest; X raises the right one;
  a ball dropped on a raised flipper cradles at the base and rolls on release; 220 max-speed shots with flippers
  flapping — no tunnelling; fast right-ramp shot rides the wireform into the right inlane, a weak left-ramp shot rolls
  back out; left orbit loop scores; drops → Eye → EMBER cast → three ramps master it → drops reset; standing runes →
  lock lit ×3 → Ritual multiball with 3 balls → ramp jackpot; a flipper bot scores through real flips; swipe-up nudge
  raises the tilt meter, more nudges TILT (dead flippers); all balls drain through end-of-ball bonus → game over card,
  best persisted; PLAY AGAIN resets everything; P pauses (no ticks); same seed + same inputs → identical path & score.
- **Automated-technical** (`node tools/smoke.js arcanum-pinball`): ok, 61 fps, no errors, no external requests.
- **Visual inspection**: looked at splash (desktop), play / multiball / spell-cast states at 390×844, 844×390 and
  1280×800. Fixed from what was seen: control buttons overlapping the bumpers in landscape (moved to the screen corner),
  NUDGE button covering the drain in portrait (removed there; swipe-up), weak cradle position (inlane guides extended
  to the pivots), ramp mouths far too tight (±3 units → ±17 with flares), orbits unreachable (entrances raised, a flare
  post and the gate end-caps were in the shot line).
- **Subjective playtest**: informed judgement from scripted shot-maps, bots and screenshots — not a human playtest. The
  audio was written and exercised but not listened to.

## Remaining issues
- Difficulty is real-pinball hard: 5–15 ms shot windows; a casual phone player will mostly hit bumpers and drops at
  first. The outlanes drain often without the ward. Tuned by script only.
- Ball has no spin/rolling model (friction is linear), so slides and english are approximations.
- At 844×390 the table is 207 px wide — playable and legible thanks to the side panel, but small.
- Single player; no high-score initials table, no match/replay feature.
- Audio mix and music have not been heard by a human.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | A recognisable pinball loop from the first plunge; spells and multiball give goals beyond score. Hard. |
| Mechanical depth | 8 | Cradle, post pass, nudge/tilt risk, skill shot, combos, mode stacking choices, ward management, bonus X. |
| Game feel | 7 | Torque flippers with surface-velocity impulses, solid collisions, rolling rumble, nudge spring; no ball spin. |
| Visual identity | 7 | Arcane neon table with summoning circle, rune inserts and amber DMD — recognisable; art is vector-simple. |
| Animation quality | 6 | Flippers, spinner, drop targets, lamps, raised ramp balls, particles; few bespoke animations (no drop-target fall anim). |
| Audio quality | 6 | Layered procedural SFX with information (pitch per bumper/spinner speed, rumble by speed) + reactive music; unheard. |
| Controls | 7 | Halves-of-screen flippers with multi-touch, hold/pull plunger, swipe nudge; full keyboard; iframe focus. |
| Onboarding | 6 | Three-line how-to on the card, DMD prompts every goal ("SHOOT THE RAMPS"), lit arrows; rules need a read. |
| Replayability | 7 | Mode wheel, multiball, wizard mode with rising spell level, best score; one table only. |
| Performance | 8 | 61 fps in smoke; static layers cached, 960 Hz physics with grid broadphase, bounded particles. |
| Technical robustness | 8 | Deterministic seeded sim, pause/auto-pause, resize, clean restart, ball search, test passes 3× in a row. |
| Overall polish | 7 | Splash → play → bonus → game over → again is seamless; side panel and DMD scenes; no placeholder text. |

## Next recommended action
Human playtest on a phone to tune difficulty (outlane width, ball-save length, ramp decel) and listen to the mix; then
add a drop-target fall animation, a ball-spin approximation, and a high-score initials entry on the DMD.
