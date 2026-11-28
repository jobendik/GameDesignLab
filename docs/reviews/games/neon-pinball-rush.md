---
id: games/neon-pinball-rush
title: Neon Pinball Rush
was: "Neon Pinball Rush - Mobile Prototype"
status: transformed
baseline: 4
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A portrait 390×700 canvas "pinball roguelite" prototype: one fixed neon box with two flippers (left/right screen halves), five
rotating layouts of bumpers, targets, "gates" and stars; score a per-round point goal to open a portal at the top, touch it, pick
one of three upgrades (flipper power, bumper value, ball saver…), next round. Three balls, procedural `tone()` beeps, Norwegian
landscape hint, own `localStorage` key.

The kernel worth keeping: **short rounds → portal → upgrade draft**, played on a phone in portrait. The lead's direction: it must
not become a third conventional table next to Arcanum and Spire, and must differ from its sibling Neon Pin Climb.

## Baseline assessment
4/10 — it ran, looked neon-pretty (screenshot at 390×844), and the round/upgrade loop existed, but:
- Physics: 120 Hz steps with a 6-step cap, flippers lerped to their target (no real angular velocity) plus a flat "kick" added on any
  touch, a 1180 u/s velocity clamp as the anti-tunnelling measure, a random anti-stuck shove. No cradle, shots barely depended on
  where the ball met the flipper.
- Goal was "reach N points" — you passively wait for bumpers to farm score; the portal then just has to be touched.
- Upgrades were nine flat stat bumps with no synergies; no bosses, no act structure, no end.
- Lifecycle: no pause, no auto-pause, no mute, no `?seed`, no test hook, `Math.random` everywhere, best score under a private key.

## Weaknesses identified
1. No goal you *aim* at — score thresholds reward waiting, not shooting.
2. Flipper physics fake; collisions only safe because of the speed clamp.
3. Upgrade drafts shallow, no build identity, no escalation or climax.
4. Missing conventions/lifecycle (pause, mute, seed, hook, best key, metadata, vendored fonts).

## Creative opportunities
Lean fully into the roguelite: a **one-thumb pinball room-crawler**. Each room is a single screen of *crystals* with HP — you
shatter them with flipper shots (breakout-like targets, pinball physics), then the portal opens and you must actually *shoot the
ball into it*. Drafts with synergies (split balls + shockwave bumpers, arc chains, phase ball), armoured crystals that need hard
hits, an **air-chain** multiplier for keeping the ball up without touching a flipper, and a boss — the **Warden** — every fifth room.

## Planned improvements
Full rewrite in one file: own fixed-step solver, room generator, draft system with rarities, boss, DOM cards, audio + music,
conventions, test, review.

## Implemented improvements
- **Physics**: 120 Hz ticks × 8 substeps (960 Hz). Every collider is a capsule (segment + radius) or circle; the ball moves ≤ 2.7
  units per substep at the 2600 u/s cap while the thinnest contact depth is 13 units, and flipper tips move ≤ 1.7 units per substep,
  so contacts cannot be skipped (300 random max-speed shots with flapping flippers in the test: zero overlaps > 3 units). Slow
  contacts lose restitution so the ball rolls instead of jittering.
- **Flippers**: torque model (3000 rad/s² to 22 rad/s, ≈50 ms stroke) on tapered capsules; the impulse uses the **surface
  velocity at the contact point**, so tip shots fly (≈2100 u/s) and base shots dribble. Holding cradles the ball in the crotch
  between slope and flipper; release lets it roll down for the next shot. **One-thumb**: any touch / Space / Z / X / arrows fires
  both flippers together.
- **Rooms**: 10 seeded templates (rows, ring, diamond, vee, pillars of bar crystals, pyramid, scatter, and from act II orbiting
  crystals, sliding rows and a broken wall). HP scales with depth; armoured gold crystals ignore soft hits (< 420 u/s). The portal
  shows the remaining crystal count, opens with a banner when the room is clear and pulls the ball in once it is close.
  Clearing pays a room bonus plus a par-time bonus.
- **Air chain**: every crystal hit without touching a flipper raises a ×0.25 multiplier on that ball (shown above it and in the
  HUD); hit-stop on long chains; the music arpeggio climbs an octave on high chains.
- **Draft**: 16 upgrades in three rarities (Heavy Core, Splitter, Twin Drop, Long Flippers, Overdrive, Arc Chain, Guardian, Center
  Post, Shockwave, Phase Ball, Patch Up, Greed, Portal Magnet, Comet, Fourth Card, Air Time) with stacking levels; 3 cards (4 with
  Fourth Card), one reroll token per act; boss drafts are rare/epic only and heal a heart.
- **The Warden** (room 5, 10, 15…): a hex core that sweeps the room behind two rotating shield arcs (moving colliders with correct
  surface velocity), HP bar, an eye that tracks the lowest ball, and **volt orbs** dropped at a flipper with a telegraphed landing
  marker — an idle flipper gets *shorted* for 1.2 s, a raised/stroking flipper *swats* the orb for points. The ball can also hit
  orbs out of the air. Three acts → RUN COMPLETE card, then optional endless.
- **Feel/visuals**: neon cyan/pink/gold on a violet hex floor; crystals are faceted hexes coloured by HP tier with squash on hit,
  shatter shards and rings; ball trail (orange with Comet), cached glow sprites (no `shadowBlur`), restrained shake/flash (off
  with reduced motion), room banners, floating score text; static playfield pre-rendered per resize. Side panels in landscape and
  desktop show the build and a how-to.
- **Audio**: WebAudio after the first gesture: flipper clack + thump, crystal hits and shatters pitched up a pentatonic scale by the
  air chain, armour clinks, bumper pops, portal chord, portal whoosh, ball save shimmer, drain, boss hits pitched by remaining HP,
  orb drop/short/swat, draft pick, game-over and victory phrases; a lookahead-scheduled A–F–C–G bass + arpeggio that speeds up per
  act and adds a pulse in boss rooms. Mute button / M (remembered).
- **Conventions**: `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`; `window.__gdl` (state, `manual`, `advance`, flip, place,
  spawn, cheat, pick, reroll, start, geom); pause button + P/Esc + auto-pause on blur/hidden; best in
  `gdl:best:games/neon-pinball-rush` (saved during play, on clear and at game over) shown in HUD and cards; vendored fonts only;
  cards have opaque panels and the canvas dims and hides its HUD behind them; focusable canvas for keyboard play in the iframe.

### How it differs from the other pinball games
- **vs Arcanum / Spire** (real tables): no plunger, no ramps/orbits/modes/DMD; there is no "table" to learn — each room is a
  procedurally built, 30–90 s *objective* (shatter crystals, then hit the portal), and the run is a roguelite with drafts, hearts,
  acts and a boss.
- **vs Neon Pin Climb**: Rush is static single-screen rooms, one-thumb (both flippers together), hearts and a build that grows;
  Pin Climb is a continuously scrolling vertical time-attack with independent left/right flippers, no upgrades and a clock instead
  of lives.

## Test results
- **Automated-gameplay** (`node tools/run-tests.js neon-pinball-rush`, ~16 s, passed 3 runs in a row): menu → PLAY tap; real mouse
  hold raises both flippers mid-stroke at 25 ms and at the stop by 60 ms, release returns them, Space does the same; cradle at the
  left flipper base and roll-out on release; 300 random 2600 u/s shots — no tunnelling (>8,000 samples); flipper-tip shot leaves at
  > 1200 u/s upward; ball contact chips a 2-HP crystal, second hit shatters it, air chain builds; a soft hit glances off a gold
  crystal, a hard one cracks it; the last crystal opens the portal, shooting into it clears the room, the draft shows 3 distinct
  cards, reroll spends the token, a real tap on a card adds it to the build and starts the next room; the Warden loses HP to ball
  hits, a volt orb shorts an idle flipper (which then ignores input), a raised flipper swats the next orb, killing it opens the
  portal; three drains end the run with the card visible and best persisted; PLAY AGAIN resets; P pauses the real-time loop and
  RESUME continues; same seed + same inputs → identical replay.
- **Automated-technical** (`node tools/smoke.js games/neon-pinball-rush`): ok, 61 fps, no errors.
- **Visual inspection**: menu, room play, act-II room with mixed HP tiers and armoured crystals, the Warden with orb telegraph,
  draft card — at 390×844, 844×390 and 1280×800. Fixed from what was seen: gold-crystal HP numbers unreadable (now outlined),
  ball-save label overlapping the drain label, the room floating mid-screen in portrait (now top-anchored so the slack is in the
  thumb zone), landscape/desktop empty sides (build + how-to panels).
- **Subjective playtest**: informed judgement from a scripted flipper bot and screenshots — not a human playtest. The bot (flips
  whenever a descending ball is over a flipper) clears rooms 1–4 in 30–70 s each without draining, then (before tuning) lost to the
  Warden — that drove the boss tuning (fewer, slower, telegraphed orbs; swat mechanic; act-I HP 12). After tuning the same bot beats
  the act-I Warden in ~2 min losing one heart, and act-II rooms take it 1.5–3 min. Audio not listened to.

## Remaining issues
- Difficulty is tuned by bot only; ordinary rooms may be too forgiving for good players before act II (drain gap is the only
  danger), while the Warden spikes. Needs human tuning.
- One-thumb means both flippers always fire together; there is no aim-by-side choice — deliberate, but it caps skill expression
  to timing and contact point.
- Ball has no spin; no nudge.
- Crystals are vector hexes; no bespoke art per act beyond the HP palette.
- Audio mix and music unheard by a human.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Every room is an aimable goal, then a portal shot; drafts every 30–90 s keep a pull. |
| Mechanical depth | 7 | Contact-point aim, cradle, air chain, armour needing hard hits, orb swats, synergetic builds. One-thumb limits side choice. |
| Game feel | 7 | Torque flippers with surface-velocity impulses, hit-stop on chains, shatter shards, pitched chain hits. |
| Visual identity | 7 | Neon hex crystals with HP tiers, Warden with shield arcs and tracking eye; readable at 390 px. |
| Animation quality | 6 | Squash on hits, shatters, ring pulses, portal swirl, banners; little bespoke animation beyond that. |
| Audio quality | 6 | Layered procedural SFX carrying chain/HP information + reactive music; unheard. |
| Controls | 8 | Hold anywhere = both flippers, multi-touch safe, full keyboard, 44 px buttons, iframe focus. |
| Onboarding | 7 | Three-line menu, portal shows crystals left, banners name the goal, side how-to on wide screens. |
| Replayability | 7 | Seeded rooms from 10 templates, 16 upgrades with rarities, three acts + endless, best score. |
| Performance | 8 | 61 fps in smoke; cached static layer and glow sprites, pooled bounded particles, 960 Hz solver with tiny collider counts. |
| Technical robustness | 8 | Deterministic seeded sim, pause/auto-pause, resize, clean restart, test passes 3× in a row, smoke clean. |
| Overall polish | 7 | Menu → rooms → draft → boss → over/victory is seamless; no placeholder text. |

## Next recommended action
Human phone playtest to tune room HP curve vs. drain danger and Warden pacing; add 2–3 more boss variants (one per act) and an
event room type (shop/curse) between acts to deepen build decisions.
