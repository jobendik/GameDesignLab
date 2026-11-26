---
id: games/star-trail-adventure
title: Star Trail Adventure
was: Star Trail Adventure (source file originally "Plumber")
status: transformed
baseline: 4
score: 7
updated: 2026-11-26
---
## Original concept and core mechanics
A 2.5D side-scrolling platformer rendered with three.js: run/jump with coyote time and buffering, a five-world map
with branching nodes and secret exits, procedurally generated stages, ranks. The concept worth keeping: a
"star trail" of short platforming stages with collectibles, checkpoints, ranks and things to find off the main path.

## Baseline assessment
Played in headless Chromium (title → map → stage 1-1, screenshots in the agent scratch dir).
- It imitated a famous plumber platformer wholesale: red-capped hero, `goomba`/`koopa` enemies with shell kicking,
  green pipes, `?` blocks, mushroom / fire-flower / star power-ups, flag-pole goals, 100-coin 1-ups, an overworld map
  with fortress nodes, even the HUD layout. Metadata wrongly described it as a "3D pipe-connection puzzle".
- Loaded Press Start 2P from Google Fonts at runtime; colours washed out by sRGB output on linear-authored materials.
- Stages were random strips with little authored intent; the first enemy killed the scripted run within seconds.
- Touch UI showed the stage pad and the map pad at once; no pause, no mute, no auto-pause; `setTimeout` music.
- The underlying controller (acceleration, coyote, buffer, apex gravity) was decent.
Overall 4/10: functional but derivative, generic and unsafe to ship.

## Weaknesses identified
1. Not original in name-of-things, characters, enemies, items or structure.
2. Level design was procedural filler; no authored course.
3. "3D" was cosmetic — a flat lane with no depth to read.
4. Lifecycle gaps (pause, mute, restart, external font), confusing overlapping touch controls.

## Creative opportunities
- Make the title literal: a constellation line strung from island to island across a night sky that lights up behind
  you; the hero is a little star-lamp whose antenna star shows whether the air-dash is ready.
- Go properly 3D with a camera that turns with the trail so the player never has to steer it.
- Replace enemies/power-ups with pure traversal: movers, crumbling tiles, bounce pads, sweepers, urchins, dash gaps.
- Keep ranks, secrets and unlock progression from the original, compressed into three authored trails.

## Planned improvements
Full rewrite (three.js r128 module, no importmap/CDN): fixed-step 3D character controller, authored trails built with a
turtle-style course builder, shards / hidden comets / lamps / beacon, sparks as lives, ranks and persistent bests,
auto-heading camera with blob shadow and landing ring, touch stick + JUMP/DASH, procedural audio, test hook and a bot
that proves every course is completable.

## Implemented improvements
**Movement (120 Hz fixed step, render-interpolated)**: fast ground acceleration/deceleration with softer air control,
variable-height jump (cut gravity ×2.5 on release, heavier fall gravity), 0.11 s coyote time, 0.13 s jump buffer,
0.2-unit edge forgiveness on landings, one air-dash per jump (recharged by ground, bounce pads) that is also usable
on the ground, moving-platform carry and upward-platform jump boost, head bumps and wall push-out.
**Depth perception / camera**: dark blob shadow projected straight down onto the surface below plus a bright landing
ring whenever airborne; camera sits behind Lumi along the trail's heading and rotates smoothly at corners, follows
ground height rather than every hop, pulls back and widens FOV in portrait; Q/E, mouse drag or a right-side touch
drag add a look offset that eases back.
**Courses**: three hand-authored trails (First Light → Driftway → The Crown) that introduce one idea at a time —
gaps, a forward mover, an urchin, a bounce pad, a sweeper, an elevator; then dash gaps, crumbling tiles, side movers;
then a climbing spiral with double bounce and combinations. Each has 43–47 shards (rows on islands, arcs over gaps
that trace the jump), three comets off the main line (behind the start, on side islands, above bounce pads and
sweepers), two or three lamps (checkpoints that refill sparks) and a beacon finish.
**Goals**: three sparks per trail; fall or hazard costs one and respawns at the last lamp; zero → fail card. Clearing
scores shards + comets + time bonus + sparks, gives a C–S rank, unlocks the next trail; sum of trail bests is written
to `gdl:best:games/star-trail-adventure`.
**Identity / feel**: indigo-to-magenta sky dome, star field, pastel floating islands with glowing rims and tapered
undersides (static geometry merged into two meshes), constellation line that turns gold as you progress, squash and
stretch, sparkle trail, dash burst, shake and flash on hits. Bungee / Space Grotesk / JetBrains Mono UI.
**Audio**: jump, land (scaled by fall speed), dash, shard chimes climbing a pentatonic scale per chain, comet
arpeggio, lamp, bounce, crack/crumble, fall, clear/fail; a lydian arpeggio whose bass, pulse and shimmer layers join
as trail progress rises; mute button + M; audio only after a gesture.
**Lifecycle**: pause (button, Esc/P, blur/hidden), R quick-restart, clean stage rebuild with disposal, resize-safe,
adaptive pixel-ratio drop on slow devices, reduced-motion handling, metadata, no external requests.

## Test results
- **Automated-gameplay** (`node tools/run-tests.js star-trail-adventure`): pass. Real key events verify running,
  tap-vs-hold jump height, a single air-dash and pause/resume; an input-only bot collects shards, lights the first
  lamp, then the test runs off an edge (spark lost → respawn at lamp → fail card → clean retry) and the bot clears all
  three trails start to beacon, checking score, rank, unlock and persisted total best after each.
- **Automated-technical** (`node tools/smoke.js star-trail-adventure`, also `--mobile`): pass, 29–46 fps in software
  WebGL, no errors.
- **Visual inspection**: title, all three trails mid-course, jump with shadow/ring, end card at desktop; play and
  title at portrait and landscape.
- **Subjective playtest**: informed judgement from code and bot runs, not a human playtest. The bot clears each trail
  in 24–29 s without a fall; par times are 55 / 75 / 95 s.

## Remaining issues
- Jump and dash tuning, camera turn speed and touch stick feel have not been felt by a human.
- Three trails is about four minutes of first-time content; replay value rests on ranks and comets.
- No enemies and no wall-jump/ledge-grab — traversal is jump + dash only.
- Platforms are axis-aligned boxes; no slopes or rotating geometry. The camera does not avoid occluders (rare:
  the spiral in The Crown keeps overhead islands away from the line of sight).
- Audio mix unheard.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Immediate run-and-jump loop with a clear goal line; three authored trails with steady new ideas |
| Mechanical depth | 6 | Variable jump + dash + timing hazards; routes for comets and time, but a small move set |
| Game feel | 7 | Coyote, buffer, edge forgiveness, squash/stretch, landing ring; values tuned analytically and by bot |
| Visual identity | 8 | Night-sky islands, glowing rims, constellation trail and star-lamp hero are recognisable at a glance |
| Animation quality | 6 | Procedural squash, feet, scarf, bobbing pickups, crumble shake; no authored character animation |
| Audio quality | 6 | Chained chimes, layered progress-reactive music; never heard by a human |
| Controls | 7 | Camera-relative analog movement on keys and touch, auto camera; untested on a real phone |
| Onboarding | 7 | Contextual one-line hints at the islands where each skill is first needed; shard arcs show jump paths |
| Replayability | 6 | Ranks, nine comets, time bonus, total best; content is fixed and short |
| Performance | 8 | No shadow maps, merged static geometry, instanced shards/particles; 30–46 fps even software-rendered |
| Technical robustness | 8 | Fixed-step sim, pause/blur, rebuild+dispose per start, zero console errors in test and smoke |
| Overall polish | 7 | Title → trail → rank card → next trail flows cleanly; a few rough edges above |

## Next recommended action
Human playtest on a phone to tune jump arc, dash length and camera turn rate; then add a fourth trail built around a
new verb (wall-kick or a grapple star) and ghost replays of the player's best run.
