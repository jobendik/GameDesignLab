---
id: games/cosmic-devourer
title: Cosmic Devourer
was: same file; in-game title was "COSMIC DEVOURER ARENA"
status: transformed
baseline: 3
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A single-screen "eat smaller blobs" arena in the well-known commercial cell-eating mould: a glowing dot follows the
mouse, 22 coloured bots wrap around the screen edges, touching a smaller one eats it, a bigger one shrinks you by
16 %. Bolted on top are loot gems with fake gravity bouncing on the screen floor, an XP bar with random "upgrades",
a combo counter, DOM pop-ups for every gem and a "HUNT" arrow. The kernel worth keeping: **growing by devouring things
in space, with a leaderboard of named rivals.**

## Baseline assessment
Playable but hollow (3/10). There is no world (the arena is the browser window, objects wrap), no camera, no end, no
death and no score that means anything; you cannot lose, you only shrink. Simulation is per-frame (speed follows the
refresh rate), every entity rebuilds radial gradients every frame, every gem spawns a DOM node, bots are three-line
state machines (chase/orbit/farm) with no fear or intent, the level-up "upgrades" are invisible random stat bumps, it
is mouse-only (`cursor:none`, no touch, no keyboard), no pause, no mute, no best score, and the look (neon blobs,
"LOOT", "JACKPOT", "DOPAMINE" comments in the code) is a generic clone with no identity.

## Weaknesses identified
1. No session structure: nothing to win, nothing to lose, no reason to replay.
2. Mechanically it is the commercial formula with nothing of its own; bots are furniture.
3. No world, camera or zoom, so size never changes how you see or play.
4. Mouse-only, frame-rate dependent, DOM-heavy, no lifecycle.

## Creative opportunities
Take "devourer in space" literally and make the player a **black hole**: mass is gravity. Your pull drags dust into a
spiralling accretion disk, bigger holes visibly bend your path and trap you in their well, stars can only be torn
apart once you outweigh them, and the whole round counts down to the death of the galaxy's core sun — the one meal
big enough to stop the supernova. That gives the eat-and-grow genre a hook the collection does not have yet (Big Drip
is surface-tension drops, Kosmisk Slange is constellation-drawing serpents, Slithergar is noodle girth).

## Planned improvements
Full rewrite on a fixed 60 Hz step: circular 2,300-unit arena with smooth camera and size-tied zoom; gravity-driven
accretion with spatial hashing; hole-vs-hole gravity, swallowing, tidal stripping and gravity-well traps; rocks, stars
(tidal disruption) and the core sun; 20 rivals with temperaments and visible intent; lunge as the secondary action;
a 3-minute cycle with a critical phase and supernova; seeds (lives); minimap and edge indicators; warped spacetime
grid; procedural audio; full input set and lifecycle; test; review.

## Implemented improvements
- **Gravity is the mechanic.** Every hole pulls dust within ~6 horizon radii with a tangential swirl, so matter
  visibly spirals in before it crosses the horizon. Bigger holes pull smaller ones; inside about 3.4 radii of a bigger
  hole your thrust is sapped (a red vignette and "Caught in a gravity well — LUNGE out!"), and holes within two radii
  of something more than twice their mass are tidally stripped, their matter streaming across. A hole is swallowed
  when its centre comes within the eater's horizon plus half its own radius, and is drawn being spaghettified as it goes.
- **Food chain:** 1,000 dust motes in nine nebula pockets, 90 tumbling rocks and seven stars. A star only yields
  (tidal disruption: it stretches toward you and pours its mass in over 1.2 s) when you are 1.12× its mass; touching
  one too early burns you, and the hint tells you the mass you need. Large holes slowly evaporate (Hawking radiation),
  which caps runaway giants. A director sizes new rivals around the player so there is always prey and always a threat.
- **Rivals:** 20 named singularities with five temperaments (hunter, glutton, skittish, bully, drifter) that differ in
  speed, fear, greed, reaction time, judgement noise, lunge use and patience. Intent shows on screen: ◎ hunting (with
  a dashed red line toward the target — bright when it is you), ! fleeing, ★ going for a star. They misjudge sizes,
  give up chases, ignore prey far too small to bother with, and get dragged into bigger wells like you do.
- **The cycle:** three minutes. At 2:00 the core goes critical. It flares, shrinks from 900 to 430 mass and sprays rich
  gold matter (a risky feeding ground near a burning core), while the HUD shows "EAT AT n". Reach 1.1× its mass and
  touch it to swallow the sun: the run ends with 600 bonus points and mass ×2. Otherwise it goes supernova: a
  shockwave sweeps the arena, stripping 12–50 % of each hole's mass depending on how close it is, and the run ends.
  Score = points banked from devouring rivals and tearing stars apart + surviving mass (×1.5 if you are the heaviest).
  You have three seeds (lives). Being swallowed costs your mass, and you are reborn small somewhere safe. The fourth
  swallow ends the run with banked points + ¼ of peak mass.
- **Readability:** the spacetime grid warps around every mass. Bigger rivals wear a red spiked rim, prey a dashed
  green rim and equals a thin white one, so colour is never the only cue. Mass is printed inside each horizon. The
  minimap shows the core, stars and the shockwave, and edge arrows point to off-screen threats (!), prey, edible
  stars (★) and the critical core with its target mass. A leaderboard appears on wide screens, rank and seeds always.
- **Look:** black horizons with a tilted, rotating accretion disk that passes in front of and behind the hole,
  photon ring, glow, parallax nebulae and stars, a pulsing core with flares when critical, supernova flash and
  shockwave. Orbitron + Space Grotesk; dark violet palette with a warm core. The menu runs the live galaxy behind the card.
- **Audio (WebAudio, after first gesture):** a drone whose pitch drops as you grow, filtered "space wind" that
  follows speed, a heartbeat that quickens as a bigger hole closes in, pentatonic plucks for accretion that climb with
  a feeding streak and drop an octave as you get heavier, rock crunches, a devour thump sized by the victim, a lunge
  whoosh, star-disruption shimmer, critical-phase alarm and bass pulse, countdown ticks, supernova boom, sun-swallow
  chord. Slow pad music changes for the critical phase. Mute button and M.
- **Controls:** mouse steering (speed by distance) with click to lunge; touch: drag anywhere for a floating thumb
  stick, quick tap, second finger or the LUNGE button to lunge; keyboard WASD/arrows + Space/Shift/J; P/Esc pause;
  M mute. Canvas focuses itself inside the arcade iframe; the phantom (0,0) pointermove is ignored.
- **Tech:** fixed 60 Hz step with dt clamp and hit-stop, typed-array dust pool + uniform grid spatial hash
  (~0.12 ms per step), pooled particles, cached sprites, three layouts with safe areas, reduced motion respected,
  `?seed` (deterministic simulation), `?autostart=1`, `?mute=1`, `?nopause=1`, `window.__gdl` (state, advance,
  manual, toScreen, dustNear), best in `gdl:best:games/cosmic-devourer`. Cards are opaque and hide the HUD behind them.

## Test results
- **Automated-gameplay** (`node tools/run-tests.js cosmic-devourer`, three consecutive passes, 73–84 s): menu → AWAKEN
  by tap; a real CDP thumb-stick drag drives the hole; a second finger lunges (mass spent, speed ×2.6); W steers, Space
  lunges, M mutes; P pauses and the real-time loop leaves the clock frozen; a stick-driven pilot (flee spiked rims,
  chase dashed rims, LUNGE button with the other thumb) grows, pulls in dust and swallows a rival; the core goes
  critical and shrinks; the cycle ends with a supernova and the card's score equals banked + mass; best is stored;
  AWAKEN AGAIN resets everything; steering into the biggest hole gets you reborn (mass 22, 2 seeds, shielded) and the
  fourth swallow ends the run with banked + ¼ peak. Deterministic under `?seed=4` (finger moves are confirmed before stepping).
- **Automated-technical** `node tools/smoke.js games/cosmic-devourer` → pass (61 fps headless).
- **Visual inspection** at 390×844, 844×390 and 1280×800: menu card, early play, crowded mid-game, critical core with
  gold rush, supernova HUD and minimap, result and devoured cards.
- **Balance probing:** scripted pilots over several seeds. Before the economy changes, bots raced to 1,400+ mass in
  a minute. With bot accretion at 60 %, rubber-band evaporation and the director, the pilot ends runs with
  300–1,300 mass and eats the sun in some.
- **Subjective playtest:** informed judgement from scripted play and screenshots, not a human playtest.

## Remaining issues
- The scripted pilot dies 1–3 times a run; humans should do better, but the mid-game can still feel crowded with
  threats, and the right number of rivals is a tuning question that needs real players.
- Bots never go for the core, so the swallow-the-sun ending is never contested.
- Mobile performance is judged from headless software rendering (≈57–61 fps). The background (nebulae + star tile) is
  the main fill cost.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Fast first seconds (dust spirals in), a real hunt/flee loop, a timed climax with a choice: race for the sun or stay clear of the blast |
| Mechanical depth | 7 | Gravity wells, lunge as escape or catch at a mass cost, star thresholds, gold rush near a burning core, evaporation upkeep, seeds |
| Game feel | 7 | Swirling accretion, spaghettification, hit-stop on devour, shake, vignette when caught; lunge recoil plume |
| Visual identity | 8 | Tilted accretion disks, warped spacetime grid, flaring core; recognisable from a thumbnail and unlike the other arenas |
| Animation quality | 7 | Growth eases, victims stretch into the eater, stars stretch during disruption, disks spin; HUD is static |
| Audio quality | 7 | Layered and informative (pitch = mass, heartbeat = threat, plucks = feeding streak); untested on a real speaker |
| Controls | 7 | Mouse, floating stick, second finger/button, keys all work; steering is responsive, the well slows you on purpose |
| Onboarding | 7 | Three-line card plus contextual hints (steer, spiked rims, caught, too hot, core collapsing); rims explain size without numbers |
| Replayability | 7 | Seeded galaxies, temperament mix, two distinct endings, score tied to risk; best score shown |
| Performance | 7 | Spatial hash, typed arrays, pooled particles; 0.12 ms/step; background fill is the cost on weak GPUs |
| Technical robustness | 8 | Fixed step, pause/blur/visibility, resize, clean restart, deterministic tests, no console errors |
| Overall polish | 7 | Menu → play → rebirth → supernova/sun → card → again is seamless; balance needs human tuning |

## Next recommended action
A human playtest focused on the first 60 seconds (threat density vs. prey) and on whether the swallow-the-sun race
is reachable often enough. Consider letting one late-game giant bot contest the core, with its intent shown.

## How it differs from Neon Galaxy
Cosmic Devourer is an eat-to-grow gravity game: you are the mass, size is power and the threat is being swallowed.
Neon Galaxy (the other space arena) is a ship game with a fixed-size skiff: you shoot, haul ore on a tether and
bank it at the Forge against sector quotas, with upgrades between sectors.
