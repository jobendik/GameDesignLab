---
id: games/breach-vector
title: Breach Vector
was: BREACH VECTOR — Advanced Tactical Prototype
status: transformed
baseline: 4
score: 7
updated: 2026-11-26
---
## Original concept and core mechanics
A top-down 2D-canvas "tactical breach" prototype: WASD + mouse aim, four weapons on number keys, frag grenade, dash,
melee takedown, a sight-polygon fog of war, noise rings, terminals that unlock doors, five enemy roles, two hand-built
maze levels with "hack A/B, kill the captain, reach extraction".

## Baseline assessment
Played with Playwright at the three viewports and read in full. The systems list was long but the game did not hold
together: guards had no visible vision cones and detection was instant and binary, so stealth could not be read or
played; once any guard had been `alerted` the HUD said SEARCHING forever; being detected *removed* the fog and lit the
whole map; guards steered with feelers and stuck on walls in the maze; doors could only be opened by terminals (nothing
was ever "breached"); no score, rating, best, pause, touch input or audio beyond single beeps; the portrait layout was
broken (panels overlapped and ran off-screen); the canvas transform was wrong at DPR > 1; the menu contained a
"design note" about placeholder art; "Return to Base" reloaded the page; every vector operation allocated.

## Weaknesses identified
1. Enemy awareness unreadable → no real stealth decisions. 2. No door/room verbs despite the title. 3. No mission
structure beyond two static maps, no scoring or reason to replay. 4. AI navigation unreliable. 5. Desktop-only, broken
on phones. 6. Huge HUD panels over the playfield, no onboarding. 7. Lifecycle gaps (pause, restart, best, hi-DPI).

## Creative opportunities
Make line of sight the whole game: show every cone, meter every glance, and make each door a choice between quiet and
violent entry. Wrap it in short generated missions with a banked score so a run is worth repeating.

## Planned improvements
Readable awareness model; open-quietly vs dash-breach doors; silent takedowns and a suppressed pistol; flashbang;
grid path-finding; seeded facility generator with three mission types, locked final room, response team on exfil;
debrief with grade, bonuses and perk choice; compact HUD; twin-stick touch; audio and alert-driven score; tests.

## Implemented improvements
- **Rewritten from scratch** (plain JS, numeric math, pooled arrays, no per-frame vector allocation), keeping the name,
  the fog-of-war sight polygon, the enemy roles and the hack → kill → extract idea.
- **Awareness you can read**: every visible guard draws its real, wall-clipped vision cone (white idle, amber
  suspicious, orange searching, red combat). Standing in a cone fills a `?` ring over the guard and an arc around the
  player pointing at whoever is noticing; rate depends on distance, sneaking, movement and prior suspicion; it drains
  out of sight. States: idle (patrol/hold) → suspicious (walks over to look) → combat → search → calm. A newly alerted
  guard takes 0.8 s to call out (ring shown) — kill it first for SILENCED. Guards hear footsteps, dashes, loud guns,
  breaches and explosions (halved through walls), find bodies, open doors, and path with A* on a nav grid.
- **Fog of war that helps**: walls and doors are always drawn (you carry the blueprint), guards only when in line of
  sight; unseen guards leave a fading ghost at their last seen spot and audible footstep ripples nearby.
- **Breaching**: E opens/closes a door silently; dashing into a closed door slams it, stuns everyone inside who can see
  it, makes a loud noise and gives a short slow-motion window. Flashbang (RMB/G) stuns in line of sight. Stunned or
  unaware guards, or any guard approached from behind, can be taken down with E; otherwise E is a shove.
- **Weapons**: suppressed P-9 (quiet, ×4 damage on unaware targets = one-shot kills) and a loud VK carbine; reloads,
  spread bloom, limited reserves, enemy drops. Heavies carry a frontal shield, marksmen telegraph with a laser,
  flankers path to your side, the Commander rallies the whole floor. Explosive barrels chain; crates are destructible cover.
- **Mission structure**: seeded generator builds a 3×2 → 4×3 room grid (spanning tree + loop doors + open archways),
  cover, patrols and pickups, validated with the path-finder. Missions cycle Data Raid (hold-to-hack nodes),
  Decapitation (kill the Commander) and Demolition (plant a charge, 45 s to get out); from op 2 the final room is behind
  a security door whose switch is elsewhere. Completing objectives sends a response team to hunt you to the exfil zone.
- **Run + scoring**: kills 50–300, unseen +50, takedown +100, silenced +40, objectives 300, extraction, time vs par,
  GHOST (never in combat), Untouched, Pacifist; S–C grade; pick 1 of 3 perks (9 kinds, stack ×2); health and ammo
  carry over; death ends the run. Best saved to `gdl:best:games/breach-vector` and shown in HUD, menu and results.
- **Feel**: muzzle sparks and kick, hit flashes and knockback, blood/scorch decals, bodies, screen shake, breach
  slow-mo, flash whiteout, floating score labels, objective edge arrow, minimap.
- **Audio**: procedural SFX (soft suppressed shot vs sharp carbine, distance-attenuated enemy fire, takedown, door,
  breach, flashbang ring, hack ticks that rise in pitch, `?`/`!` stingers) and a tension score whose pulse, hats, bass
  and snare follow hidden → suspicious → searching → combat. Mute button + M; audio starts on first gesture.
- **Controls**: WASD/arrows, Shift sneak (C toggles), mouse aim/fire, RMB/G flash, Space dash, E context, F melee, Q/1/2
  swap, R reload, P/Esc pause. Touch: floating left stick (ease off = sneak), right stick aims and fires only near the
  rim, contextual ACT button, DASH/FLASH/SWAP. Responsive HUD for 390×844, 844×390, 1280×800; hi-DPI correct.
- **Lifecycle**: pause button/keys, auto-pause on blur/hidden, clean restart, dt sub-stepped sim (1/40 s), `?seed`,
  `?autostart`, `?mute`, `?nopause`, inert `window.__gdl` hook; fonts from `vendor/`, no external requests.

## Test results
- **Automated-technical** `node tools/smoke.js games/breach-vector`: pass, 61 fps.
- **Automated-gameplay** `node tools/run-tests.js games/breach-vector`: pass on repeated runs (~6 s). Drives menu →
  deploy, D / Shift+D movement, fog hides guards, E opens and closes a door, dash breaches it, awareness fills in a cone
  and drains out of sight, facility calms, silent takedown from behind, one-click unseen pistol kill with real mouse
  aim, full detection → COMBAT and incoming damage, right-click flashbang stun, Q swap + carbine kill, hold-E hacks,
  exfil phase with response team, extraction → debrief with three perks → op 2 (Decapitation, locked door + switch,
  commander present), real-time loop, P/Resume/hidden/Esc pause, resize, death, best persisted, clean restart, and a
  touch context (tap deploy, left stick, sneak, gentle aim vs rim fire, ACT opens a door, pause button). The test
  teleports the operator between set-pieces with the hook; walking a whole mission by path is not automated.
- **Visual inspection**: screenshots of menu, stealth, combat, takedown, hack, breach, exfil, debrief and game-over at
  all three viewports were opened and judged; fixes made from them (map too dark, walls lost under fog, oversized hint
  banners, minimap/weapon/alert overlaps on phones, prompt duplicating the ACT button).
- **Subjective playtest**: informed judgement from code and scripted play only — no human has played it.

## Remaining issues
- Balance is reasoned, not felt: detection rates, guard damage (softened once after a scripted death in ~4 s in the
  open), perk values and the 45 s demolition timer need human tuning. Later ops (heavies + marksmen) are untested by play.
- Generated rooms are all the same cell size; layouts vary in doors, cover and patrols rather than in architecture.
- Combat AI has no cover use or retreat; guards advance, strafe, flank or hold.
- On phones the view is zoomed out (0.66×), so guards are small; portrait is playable but landscape is better.
- One-time hints reuse the banner and can stack if several trigger within a couple of seconds.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Sneak / breach / improvise loop with clear stakes and short missions; unproven by human play |
| Mechanical depth | 8 | Cones, noise, bodies, callouts, door choice, stun → takedown, quiet vs loud guns, shields, perks |
| Game feel | 7 | Kick, flashes, knockback, shake, breach slow-mo, stingers; top-down shapes limit impact |
| Visual identity | 7 | Coherent blueprint/ops-screen look, shape-coded enemies, state-coloured cones; abstract art |
| Animation quality | 6 | Doors, rings, meters and lunges animate; actors are rigid shapes |
| Audio quality | 7 | Informative SFX and a four-level reactive tension score; all synthetic |
| Controls | 7 | Full keyboard/mouse set, contextual E, twin-stick touch with sneak and safe aim; not tested on hardware |
| Onboarding | 7 | Three-line how-to, contextual prompt, one-time tips at the moment they matter |
| Replayability | 8 | New facility per mission, three mission types, escalating roster, grades, bonuses, perks, best score |
| Performance | 8 | 61 fps in smoke, bounded pools, culled sight rays; one full-screen fog composite per frame |
| Technical robustness | 8 | Validated generator, pause/auto-pause, resize, hi-DPI, clean restart, test + smoke pass |
| Overall polish | 7 | Menu → mission → debrief → perk → next / death → retry is seamless; phone HUD is dense |

## Next recommended action
Human playtest of ops 1–5 on desktop and phone to tune detection and damage, then add room-shape variety (merged halls,
corridors) and cover-seeking combat AI.
