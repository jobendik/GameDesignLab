---
id: games/pinball-wizard-3d
title: "Spire: The Climbing Table"
was: "SPIRE — The Pinball Wizard"
status: transformed
baseline: 3
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"SPIRE — The Pinball Wizard" was the 3D twin of the old Arcanum: a *pinball brawler* (you are the ball, flippers bat you
into enemies with wind-up attacks, a DASH button steers you, kill the crowned warden for a key, take the door, choose a
boon). Three.js r128 rendered a cute pastel low-poly arena (lavender walls, pink flippers, Baloo/Fredoka type) over a
Matter.js simulation; Google Fonts. The name borrows a famous song title and the concept a commercial game.

The lead's direction: give it its own name and identity and make it a real pinball table that is clearly different from
Arcanum — "a vertical 3D spire table with a camera that follows the ball up ramps to upper playfields". The kernel
kept: the name SPIRE, the cute pastel 3D look, and the idea of *climbing a tower*.

## Baseline assessment
3/10. The screenshot shows a round arena with crates/slimes, two flippers and a DASH button; the ball drains to "BALL
SAVER" messages within seconds. Not pinball (no plunger, lanes, ramps, targets or scoring), Matter.js flippers via
`setAngularVelocity` with a speed clamp as anti-tunnelling, a single fixed camera, no pause/auto-pause, no best score,
no seed/test hook, external font requests, emoji boons.

## Weaknesses identified
1. Not a pinball game; the DASH removes flipper skill. 2. Untrustworthy physics at speed. 3. Borrowed concept/name.
4. The 3D view added nothing (a flat arena seen at an angle). 5. Missing lifecycle basics.

## Creative opportunities
Use the third dimension for what 2D can't do: a **tower of playfields**. Three tiers stacked up and back — Courtyard,
Library, Belfry — each with its own flippers; ramps carry the ball *up* the spire and the camera rises with it; falling
off a tier only drops you one level, so height is both reward and safety net. The score multiplier is the altitude.

## Planned improvements
Full rewrite on a multi-tier version of the swept-safe solver built for Arcanum, 3D guided ramps/chutes between tiers,
height-following camera, rules around climbing (books → bell ramp → bell tolls → Storm multiball → floors), DOM HUD with
a tier indicator, procedural audio, controls, lifecycle, quality fallback, test hook, test, review.

## Implemented improvements
- **Physics**: each tier is its own 2D collider set (capsules/circles, grid broadphase) stepped at 120 Hz × 8 substeps;
  max 4.4 u per substep against ≥ 15 u contact depth → no tunnelling (verified on all three tiers). Torque flippers with
  surface-velocity impulses (cradles, post passes and live catches work as in Arcanum); flippers on every tier share
  the two buttons, as on real multi-level tables. Ramps and chutes are **3D guided paths**: the ball's speed changes with
  the path's height profile (`-g·dh/ds`), so weak shots stall and roll back, closed ramps bounce the ball back at the
  crest, chutes accelerate downhill. Ball–ball collisions per tier; ball search; out-of-bounds safety.
- **The spire** (three tiers, ×1 / ×2 / ×3 scoring):
  - *Courtyard* (main table, shooter lane, power plunger + skill shot on S‑K‑Y lanes): 3 pop bumpers, **Stair ramp**,
    **Tower loop** (orbits both ways with one-way exit gates), 3 **gargoyle** standups → *EXPRESS* (the next Stair shot
    goes straight to the Belfry), W‑I‑N‑D lanes → *UPDRAFT* outlane kickbacks, slings, bonus ×2…×5.
  - *Library* (own flippers, centre gap drops you back to the Courtyard): 3 **book** drop targets open the **Bell ramp**
    (closed ramp sends the ball back), a spinner loop, a bumper.
  - *Belfry* (own flippers, drops back to the Library): the **bell** — each toll is a growing jackpot; three tolls start
    the **Storm multiball**: every ball is blown down to the Courtyard, two more launch, the Stair is diverted and with
    the Tower loop lights jackpots, both → super jackpot on a gargoyle. When the storm ends the spire grows a **floor**
    (all values × floor).
  - Combos (major shots within 3.5 s), extra ball (lit by the second toll, collected on the Tower loop), 10 s ball save,
    multiball save, tilt meter with DANGER/TILT, end-of-ball bonus (climbs, tolls, loops, bumpers, lanes × bonus × floor).
- **Camera**: follows the height of the highest ball (smoothly blended between per-tier framings that fit each tier to the
  viewport), so it climbs *along the ramp* with the ball and comes back down when it falls; stays on the Courtyard during
  the storm; nudge kick and restrained shake.
- **Visuals**: pastel stacked tiers on masonry plinths with columns and cone caps, painted floor textures per tier
  (flagstones, bookshelves, bell rings), instanced walls/posts, extruded rounded flippers, lathe-turned bell that swings
  on a toll, glowing rails and translucent ramp beds (the next useful ramp pulses), drop targets that sink, lamp inserts,
  chrome balls with blob shadows, additive particles, floating score sprites, starry sky.
- **HUD** (DOM, Baloo 2): score pill, ball/bonus/floor line, a COURTYARD → LIBRARY → BELFRY tier indicator (row in
  portrait, column in landscape) showing where the ball is and which tiers are open, pop-in banners, launch hint.
- **Audio**: flipper solenoids, bumper pops pitched by tier and bumper, slings, drops, standups, lane blips, spinner
  ticks, ramp whoosh up / chute whoosh down, landing thumps, gate bonk, an inharmonic synthesized **bell** with long
  partials, fanfares, ball-save, tilt, drain; a rolling rumble following ball speed; lydian music whose arp rises an
  octave and changes timbre as the ball climbs, with drums in the storm. Mute button / M (remembered).
- **Controls**: halves of the screen = flippers (multi-touch), hold & release or pull down to launch, swipe up to nudge;
  Z/X/←/→/Shift, Space/↓ hold to launch, Space/↑/C/A/D nudge, P/Esc pause, M mute; NUDGE button in landscape/desktop.
- **Robustness**: `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, `window.__gdl` with `manual`/`advance` stepping;
  frame-rate-independent fixed ticks (up to 30 per frame); **automatic quality fallback** lowers the pixel ratio
  (1.5 → … → 0.6) when frames stay slow, never the simulation; pause card + auto-pause; resize-safe; clean restart; best
  in `gdl:best:games/pinball-wizard-3d`; vendored fonts, no external requests; focusable canvas for iframe keys.

### Difference from Arcanum (`arcanum-pinball`)
SPIRE is a **vertical, three-level 3D table about altitude**: climbing up ramps to upper playfields with their own
flippers, a camera that follows, a score multiplier per tier, falling back one level, bell tolls and "floors" as
progression. Arcanum is a **single flat 2D arcade table about spell modes**: a mode wheel at the Eye, ramp locks for
the Ritual multiball, an Archmage wizard mode, and a dot-matrix display. Different shots, different goals, different
presentation (cute pastel 3D + DOM HUD vs dark neon 2D + DMD).

## Test results
- **Automated-gameplay** (`node tools/run-tests.js pinball-wizard-3d`, ~21 s, passed 3 runs in a row): menu → PLAY tap;
  real pointer hold charges / pull-down draws / release launches, ball save arms; Z+X raise all six flippers to their
  stops and back; 360 max-speed shots across the three tiers never tunnel; NEW GAME from the pause card; a fast Stair
  shot is captured, arrives in the Library and the camera climbs (height > 170); a Library bumper scores double; a weak
  Stair shot rolls back; the Bell ramp is closed and returns the ball until the three books drop, then reaches the
  Belfry and resets the books; Belfry drain → Library, Library drain → Courtyard without losing the ball; gargoyles
  light EXPRESS and the Stair lands in the Belfry; bell tolls start the Storm with 3 balls all in the Courtyard and the
  camera back down; a diverted Stair shot is a jackpot; swipe-up nudge, quick nudges TILT; all balls drain through the
  bonus to game over, card shown, best persisted; PLAY AGAIN resets everything; P pauses (no ticks); same seed + same
  inputs → identical result.
- **Automated-technical** (`node tools/smoke.js pinball-wizard-3d`): ok, ~33 fps software-rendered headless, no errors.
- **Shot maps** (scripted flips at 10 ms steps from realistic feeds): every feature is reachable from that tier's
  flippers — Courtyard: Stair, Tower loop, gargoyles, bumpers; Library: Bell ramp, books, loop; Belfry: bell.
- **Visual inspection**: menu (portrait), Courtyard (portrait), Library and Belfry (portrait/landscape/desktop), storm
  multiball (portrait/landscape). Fixed from what was seen: overlapping express/divert rails, score unreadable over the
  Library plinth (pills), flippers cropped in landscape (fit margins), bell reading as a cone (hung toward the player),
  tier indicator covering the right orbit in portrait (moved to a row), oversized banner in landscape.
- **Subjective playtest**: informed judgement from scripted play and screenshots — not a human playtest; audio unheard.

## Remaining issues
- Headless software rendering runs ~33 fps; real-GPU frame rate on a phone has not been measured (the quality fallback
  exists for that). Shadows are blob sprites, not real shadows.
- The Courtyard is narrow in 844×390 landscape; the ramp rails cross the upper Courtyard visually.
- Tolls are fairly easy once in the Belfry (the hard part is getting there); balance is scripted, not human-tuned.
- No high-score initials; single player.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Climbing is a clear, motivating goal; each tier is a new mini-table; falling back one tier keeps runs alive. |
| Mechanical depth | 7 | Altitude multiplier vs. safety, express shortcut, closed/open ramps, storm jackpots, nudge/tilt, cradling. |
| Game feel | 7 | Same torque flippers/solver as Arcanum; ramps that stall and roll back; camera rides the ramps. |
| Visual identity | 7 | A pastel tower of playfields with bell, books and courtyard — recognisable; geometry is simple. |
| Animation quality | 7 | Camera climb, swinging bell, sinking books, bumper squash, popping banners, rising score sprites. |
| Audio quality | 6 | Layered procedural SFX incl. a synthesized bell; music climbs with the ball; not heard by a human. |
| Controls | 7 | Same scheme as Arcanum on every tier; multi-touch halves, plunger hold/pull, swipe nudge, keys. |
| Onboarding | 6 | 3-line how-to, banners name each goal ("KNOCK DOWN THE 3 BOOKS"), tier indicator; rules card. |
| Replayability | 7 | Floors raise values each storm, express routes, extra ball, best score. |
| Performance | 6 | Instancing, cached textures, bounded particles/sprites, adaptive pixel ratio; 33 fps in software rendering. |
| Technical robustness | 8 | Deterministic seeded sim, multi-tier tunnelling test, pause/auto-pause, resize, clean restart, 3× passing test. |
| Overall polish | 7 | Menu → climb → storm → bonus → game over → again is seamless; nothing placeholder remains. |

## Next recommended action
Measure on a real phone GPU (and tune the quality fallback thresholds), then a human playtest to balance Library →
Belfry difficulty and the toll requirement; consider a per-floor visual change to the tower (new tier art per floor).
