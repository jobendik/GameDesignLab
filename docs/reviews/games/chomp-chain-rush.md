---
id: games/chomp-chain-rush
title: Lantern Lasso
was: Chomp Chain Rush
status: transformed
baseline: 4
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A neon blob steered snake-style across a 7×10 grid. Each candy it ate added a segment in that candy's colour. Three
same-coloured segments at the front of the tail cleared for points. Red "drones" chased it, and a RUSH meter doubled
scores. Hitting a wall or its own tail ended the run, a star gave a one-hit shield, and a bomb stunned drones. It had a
daily seed and a canvas-drawn menu.

Note for the lead: despite the brief, this file was **not** a dot-eating maze chase. It was a snake/match-3 hybrid. Its
identity (a growing chain of coloured links, colour matches, pursuers, a little chomper) is what I kept.

## Baseline assessment
I played it in headless Chromium at all three viewports (`ccr-base-*.png` in the scratch dir). It ran, and the colour
matching was a nice idea, but:
- The 7×10 board was cramped and a wall bump killed you instantly, so most runs ended on a mis-swipe, not a decision.
- The drones walked greedily and had no telegraphs.
- Moving without eating copied the front colour down the tail and dropped the last one, so the tail's colours silently
  changed under you (bug).
- RUSH was just a score multiplier.
- Missing conventions: no pause button, CrazyGames SDK calls, system fonts, its own `ccr_best` key instead of
  `gdl:best`, no seed/autostart/test hook, no input buffering, swipes re-armed only on new touches.

Baseline 4.

## Weaknesses identified
1. Deaths came from controls (walls, self-collision, a single queued turn), not from the pursuers.
2. The chain was only a scoring device. It never interacted with the enemies.
3. Pursuers had no personality and no tells.
4. There was no structure beyond "score goes up" and no reason a run should feel different at minute 3.
5. Tail colour bug, missing lifecycle and conventions.

## Creative opportunities
Make the **chain itself the weapon and the wall**: close your own chain around a pursuer to snare it (a lasso), let the
chain block pursuers, and keep colour matches as a short-range tool. Turn it into a warm, original night-garden fiction
(firefly + paper lanterns + shadow moths) that looks nothing like the neon original or any famous maze game.

**How it differs from its sibling `games/maze-munch-rush.html` ("Vault Runner")**: Lantern Lasso is an **open-field
grid lasso game**. You never clear dots. Your body grows, and the whole game is about the geometry of your own trail:
wrap, tangle, loop, block. Vault Runner is a **corridor maze heist** with a fixed-size runner, procedurally carved mazes,
keys/doors/switches and one smart hunter AI. Their look, tempo and verbs differ: warm lanterns, rounded Fredoka type and
a lullaby loop here, versus a cold vault with mono type and a pulse bass loop there.

## Planned improvements
Lasso/snare verb, chain-as-wall, tangle rule, three telegraphed moth personalities, nights with quotas, hearts,
non-lethal walls, a 2-deep input buffer plus late-turn grace, swipe-anywhere, new identity and audio, and conventions.

## Implemented improvements
- **Rewrite** (single file, ~650 dense lines): 120 Hz fixed step, seeded `mulberry32` gameplay RNG (cosmetics use
  `Math.random`), 11×13 grid, render interpolation between cells.
- **Lasso**: when the head touches its own chain, the loop closes. Everything enclosed is captured: moths are SNARED
  (400×k² for k moths in one loop × chain multiplier), seeds and moon shields inside are collected, and each cell scores.
  The loop's lanterns burn away, so **length is the resource** (a snare ring needs ≥7 lanterns). The snared region
  flashes and the loop outline glows gold. Touching the very last lantern also closes a loop when it would enclose
  something, so a 7-lantern ring works the way you expect. A loop that encloses nothing just costs lanterns. It never
  kills.
- **Tangle**: a moth touching ≥2 lanterns is TANGLED and cannot move (strings are drawn to the lanterns). Wrapping is a
  deliberate act, because walking past a moth only touches one side, and it turns snaring a chaser into a readable
  two-step move: wrap, then close.
- **Chain is a wall**: moths path around your lanterns (BFS that treats lanterns as walls).
- **Flare**: 3+ same-coloured lanterns in a row at the front ignite. They are spent, and moths within 2 (3 for a 4-match)
  are stunned for 2.8 s. A stunned moth can be CHOMPed by running into it (worth less than a snare). Colour routing is
  therefore a choice between length (snares) and stuns.
- **Moths** (fair tells everywhere):
  - **Stalker** (red eyes): shortest-path hunter.
  - **Nibbler** (violet): seeks the middle of your chain, CHEWS for 0.45–0.6 s (jaws + red outline on the lantern), then
    snips. The snipped lanterns fall as recollectable seeds, and a chewing nibbler is a stationary snare target.
  - **Dasher** (orange): when it has a clear line within 7 cells it AIMS for 0.5–0.75 s (shaking, a red chevron lane
    shows the exact path), then dashes. If your chain crosses the lane it is BLOCKED and stunned.
  - All moths reach you only through a **lunge**: adjacent → 0.15–0.24 s wind-up with the target cell flashing → strike
    that cell. They never step into the cell you are about to enter.
- **Structure**: nights with a moth quota (2, 3, 4, 5, 5, 6 …), 1→4 moths alive, new mirrored hedge layout per night
  (seeded, connectivity- and dead-end-checked), faster moths/firefly, spawn telegraphs at the four nests (1.3 s swirl),
  a clear bonus, +1 heart every third night. Three hearts plus a moon-seed shield.
- **Controls**: walls are non-lethal (bonk, stop, squash). A 2-deep turn buffer keeps a blocked turn for 0.6 s so you
  can pre-turn before a gap. **Late-turn grace**: a turn pressed ≤60 ms after a plain step re-routes that step.
  Swipe-anywhere: every 16–30 px of drag queues the next turn, so one continuous swipe can draw an L. A short tap turns
  toward the tap. Arrows/WASD on keyboard.
- **Look**: night garden, paper lanterns with per-colour glyphs (circle/diamond/triangle/square, so colour is not the
  only cue), firefly head with squash and eyes, moth silhouettes with distinct wing shapes, fireflies in the sky,
  per-night palettes, cached background and sprites.
- **Audio**: seed notes on a pentatonic ladder by colour and chain, flare chords, snare arpeggio that grows with k,
  tangle chirp, warn beeps on aim/chew, snip, bonk, hit, clear fanfare. A soft lullaby bass/pluck loop speeds up per
  night and adds a hi-hat when danger is near. Mute button + M.
- **Onboarding**: menu over an attract demo. Three how-to lines. Contextual hints (steer → eat → loop) and one-time tips
  on the first flare, tangle, nibbler and dasher.
- **Conventions**: vendored Fredoka; DOM cards with opaque backing (canvas HUD hidden behind them); pause button +
  Esc/P + auto-pause on blur/hidden; 44 px targets; portrait HUD on top, landscape/desktop HUD in the side margins;
  `prefers-reduced-motion` disables shake; `gdl:best:games/chomp-chain-rush`; `?seed`, `?autostart=1`, `?mute=1`,
  `?nopause=1`; `window.__gdl` (`state`, `manual`, `advance`, `dir`, `place`, `cheat`, `round`, `moth`).

## Test results
- **Automated-technical**: `node tools/smoke.js games/chomp-chain-rush` → pass, 61 fps.
- **Automated-gameplay**: `node tools/run-tests.js chomp-chain-rush` → pass, three consecutive runs (~2 s each,
  manual stepping). The test covers:
  - a real tap on PLAY;
  - a mouse swipe anywhere starts the firefly;
  - two buffered key turns apply in order;
  - a late turn is re-routed by the grace window;
  - three same-colour seeds flare: the chain shrinks by 3 and a nearby moth is stunned;
  - running into the stunned moth chomps it;
  - real key turns lay the chain around a moth and close the loop, which snares it and clears night 1;
  - night 2 starts with quota 3;
  - a Nibbler chews ≥0.4 s before biting, and the snipped lanterns become seeds;
  - a Dasher aims ≥0.5 s before dashing, and a sidestep that puts the chain across its lane BLOCKS it with no damage;
  - pause/resume/mute;
  - a Stalker's lunge takes the last heart: card, cause, stored best;
  - tap anywhere restarts the identical seeded garden;
  - pause → MENU.

  Scenario set-up (clearing hedges, placing moths/seeds/chain) uses `place`. Every outcome comes from real input.
- **Visual inspection**: menu, play (early, tangled moth, snare flash), run-over card, at portrait/landscape/desktop,
  opened and judged.
- **Balance bot** (scratch, heuristic: seek seeds, orbit nearby moths, close loops that capture): over 6 seeds × 240 s
  it made 2–6 snares and 0–3 chomps per run, reached nights 2–4, and took 0–6 hits, mostly while stopped after a bonk.
  Earlier iterations exposed and fixed three issues:
  - hits stunned moths, so you could chomp them for free;
  - moths stepped into the cell you were about to enter (unfair hits);
  - a 7-lantern ring could not close.
- **Subjective playtest**: informed judgement from code, bots and scripted screenshots only. No human hands.

## Remaining issues
- Snaring a free-moving Stalker needs a wrap at close range. It is learnable but the hardest verb, and needs human tuning
  (lunge window, Stalker speed, quota).
- After night 4 the mix of 3–4 moths has not been balance-tested beyond the bot.
- Moths are simple vector silhouettes. There are no death/capture animations beyond particles and the loop glow.
- Audio not ear-checked. The daily seed of the original was dropped (`?seed` exists, there is no daily mode).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Lasso/tangle/flare gives every lantern a purpose; nights give short goals |
| Mechanical depth | 8 | Length as a resource, colour routing (length vs stun), k² multi-snares, chain as shield vs dashers, nibbler bait |
| Game feel | 7 | Interpolated movement, bonk squash, hit-stop on snares, shake/flash scaled; tuned by reasoning |
| Visual identity | 7 | Warm lantern-and-moth night garden with glyph lanterns; recognisable, still simple shapes |
| Animation quality | 6 | Lantern sway, wing flaps, lunge lean, tangle jitter, loop glow; no frame animation |
| Audio quality | 6 | Information-carrying pitch ladders, adaptive lullaby; not ear-checked |
| Controls | 8 | 2-deep buffer, pre-turn hold, late-turn grace, swipe-anywhere chaining, non-lethal walls |
| Onboarding | 7 | Demo, 3-line how-to, staged hints and first-time tips per moth |
| Replayability | 7 | Seeded hedge layouts per night, escalating moth mix, score chase; no daily mode |
| Performance | 9 | Cached background/sprites, bounded particles, BFS on 143 cells; 61 fps headless |
| Technical robustness | 8 | Fixed step, pause/blur/resize safe, deterministic test incl. restart |
| Overall polish | 7 | Menu → nights → card → retry is seamless; art is clean but modest |

## Next recommended action
A human playtest of the Stalker wrap (lunge window 0.15–0.24 s and Stalker speed), then a capture animation (moth
spiralling into the loop) and a daily-seed mode.
