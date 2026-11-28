---
id: games/maze-munch-rush
title: Vault Runner
was: Maze Munch Rush — Mobile Arcade Prototype
status: transformed
baseline: 4
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A glowing ball ran a hand-authored 19×25 dot maze while four "sentinels" chased it:
- **Sentinels**: HUNTER chased directly, AMBUSH aimed four tiles ahead, GUARD guarded zones, WANDER moved partly at
  random.
- **Pellets**: four corner power pellets made the sentinels edible. The pellets came in four colours, and runs of one
  colour built a chain multiplier and a RUSH meter.
- **Scoring**: near-misses scored, and clearing the maze refilled the same layout with faster enemies.

Daily seed, canvas-drawn menu.

## Baseline assessment
I played it headless at all three viewports (`mmr-base-*.png` in the scratch dir). It ran, but:
- **Derivative**: it was a close recreation of the famous dot-eating maze game. Yellow-ish eater, four ghosts with
  that game's four classic personalities, corner power pellets that turn ghosts edible, a symmetric dot maze with a
  ghost house in the middle.
- **Movement** turned only inside a ±0.08-tile window at tile centres, with no pre-turn hold beyond the last swipe and
  no post-turn grace. At high speed or with frame hitches, turns could be missed. That is the "controls_fixed" pain
  point from the file name.
- **Repetition**: the maze never changed. The colour chain was noise on top of eating everything.
- **Conventions missing**: CrazyGames SDK calls, its own storage keys, no pause button, no `gdl:best`, no test hook.

Baseline 4.

## Weaknesses identified
1. Identity borrowed from a commercial game (look, cast, power-pellet reversal, layout).
2. Missed turns. Touch only partly worked.
3. One fixed maze, and the goal was just to clear every dot. No decisions beyond route order.
4. Enemy AI was greedy Manhattan steering with random noise. No telegraphs.

## Creative opportunities
Keep the genre (corridor chase, collectibles, pursuers) but change the fantasy and the goal: a **heist**. Every floor is
a freshly carved vault, you need specific **keycards** and then the **exit**, **switches** flip gate pairs to reshape the
maze for you *and* the guards, and the guards are an actual security team with readable methods. No power-pellet
reversal: an **EMP** charge stuns but never lets you eat anyone.

**How it differs from its sibling `games/chomp-chain-rush.html` ("Lantern Lasso")**:

| | Vault Runner | Lantern Lasso |
|---|---|---|
| Space | Corridor maze, rebuilt procedurally every floor | Open garden grid |
| You | A fixed-size runner on a route-and-evade objective run (keys → door) | A body that grows |
| Core verb | Routing, timing switches, breaking line of sight | Wrapping your chain around enemies |
| Enemies | One smart AI team that hunts by scent, prediction and sight | Moths you snare |
| Look and sound | Cold steel/gold vault, Chakra Petch + JetBrains Mono, minor-key pulse bass | Warm lanterns, rounded type, lullaby |

## Planned improvements
Procedural braided mazes, keycards/exit/alarm, switch gates, three guard personalities with telegraphs, a robust
movement core (pre-turn, cornering grace, instant reverse), swipe-anywhere, EMP, landscape via board rotation, new
identity and audio, conventions.

## Implemented improvements
- **Rewrite** (single file, ~530 dense lines): 120 Hz fixed step, seeded `mulberry32` gameplay RNG (cosmetics use
  `Math.random`).
- **Procedural vaults**: 15×21 tile maze carved by recursive backtracking on a 7×10 cell grid, then **braided**. ~88 % of
  dead ends get a new opening plus a few extra loops, so chases have escape routes.
  - The exit sits in the top rows, far from the start.
  - Keycards (1/2/3 by floor) are placed greedily far from the start, the exit and each other.
  - EMP cells and guard docks (≥14 steps from the start) are placed too.
  - From vault 2: one or two switches and 4–8 two-colour gates. The generator rejects any layout where a key, the exit,
    a switch or a pickup is unreachable in *either* gate state.
  - Glints lie in runs along ~60 % of corridors, not on every tile, so the look is not a dot-grid.
- **Objective loop**: grab every keycard. The vault door's lamps turn green as you do, and the last one opens the door
  and raises the **alarm**: red border, guards +12 % speed, patrolling Sweepers sprint toward the key spot, faster
  music. Reach the door to crack the vault and earn the floor bonus plus a time bonus (par 55 s + 15 s per key), with
  +1000 for every glint. +1 life every second vault.
- **Guards** (distinct and readable, every threat telegraphed):
  - **Hound** (orange hexagon): follows your *scent*, the tile you stood on ~1.7 s ago (shorter on later floors). The
    scent is drawn as fading orange dots, so you can see exactly where it will walk. Within 3 tiles it goes straight for
    you.
  - **Warden** (violet square): an interceptor. It works out your shortest path to your current objective (nearest
    keycard, or the door once open) and heads for the tile ~6 steps ahead of you on it. That tile is marked with a
    pulsing violet **reticle**, which teaches you to detour. Within 3 tiles it chases directly.
  - **Sweeper** (lime circle with a searchlight cone): patrols at random. If it has a clear straight line to you within
    8 tiles it **alerts** (0.38–0.55 s, standing still, red "!"), then sprints at 8.2 tiles/s to where it last saw you,
    for up to 2.6 s. Break line of sight and it gives up.
  - Guards boot at their docks with a blink (1.6 s + stagger). They path with BFS that respects gates and refuses to
    reverse unless reversing is ≥4 steps shorter. A bug where the hound wandered away from a target directly behind it
    was found and fixed.
- **Switches**: stepping on one flips every gate pair. Guards cannot pass closed gates, so you can cut a chaser off.
  Entities caught mid-corridor by a slamming gate bounce back.
- **EMP**: one charge at the start, pickups add more (max 2). Space/E or the 76 px EMP button stuns guards within 4.6
  tiles for 3.2 s.
- **Movement core**: exact centre-crossing integration (no epsilon windows), so no turn is ever skipped at any speed.
  - **Pre-turn**: a swiped or pressed turn is held until the next junction where it is possible.
  - **Instant reverse.**
  - **Cornering grace**: a turn pressed up to 0.32 tiles past a junction snaps into the side lane, keeping the distance
    travelled.
  - **Swipe-anywhere**: every 14–28 px of drag queues the next turn, so one finger stroke can chain two turns. A short
    tap turns toward the tap.
  - Landscape/desktop **rotate the board 90°**, so the 15×21 vault stays big. Input is mapped from screen to board, so
    "swipe up" always means up on screen.
- **Score**: glints 10 × run multiplier (×2…×5 for unbroken glint runs), keycards 500, EMP cells 100, vault bonus 1000
  × floor + time bonus.
- **Look**: cold vault (graphite floor, plum steel walls with gold trim and rivets), a mint-white masked cat burglar
  with a swishing tail, three robot silhouettes with different eyes, gold keycards, a rotating vault-door wheel,
  violet/blue gate bars.
- **Audio**: square-wave glint ticks climbing a minor scale with the run, keycard chord, door-open rumble, switch clack,
  EMP sweep, two-tone alert, caught buzzer. A pulse-bass loop speeds up per floor, adds a danger arpeggio when a guard
  is near or alerted, and doubles tempo with an alarm ping once the vault is open. Mute button + M.
- **Onboarding**: menu over an attract demo (the runner cracks vaults by itself). Three how-to lines. Contextual
  prompts (swipe, keycard → door, alarm) and one-time tips at the first Sweeper alert, EMP pickup and switch.
- **Conventions**: vendored fonts; DOM cards with opaque backing (HUD and EMP button hidden behind them); pause button
  + Esc/P + auto-pause on blur/hidden; `prefers-reduced-motion` disables shake; `gdl:best:games/maze-munch-rush`;
  `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`; `window.__gdl` (`state`, `manual`, `advance`, `want`, `walk`,
  `emp`, `place`, `cheat`, `floor`).

## Test results
- **Automated-technical**: `node tools/smoke.js games/maze-munch-rush` → pass, 61 fps.
- **Automated-gameplay**: `node tools/run-tests.js maze-munch-rush` → pass, three consecutive runs (~2 s each, manual
  stepping). The test covers:
  - a real tap on PLAY;
  - guards boot visibly;
  - a mouse swipe anywhere starts the runner;
  - **pre-turn**: a turn pressed two tiles early is held past a blind tile and taken exactly at the junction;
  - **cornering grace**: a turn 0.2 tiles past a junction snaps into the lane at the same distance;
  - an in-page pilot (steering only through the player's turn input) collects glints and the keycard, which opens the
    vault, and the door cracks it;
  - vault 2 has 2 keys, a switch and gates, and stepping on the switch flips a gate's walkability;
  - Space fires the EMP and stuns a guard;
  - the Warden's reticle lies between the runner and the keycard (by BFS distance), not on the runner;
  - the Sweeper holds its alert ≥0.35 s in place before sprinting, then catches a runner who stays in sight: a life is
    lost and actors reset with guards rebooting;
  - pause/resume/mute;
  - the Hound takes the last life: card, cause, stored best, game buttons hidden;
  - tap anywhere restarts the identical seeded vault;
  - pause → MENU.

  Removing or placing guards uses `place`. Every outcome comes from real input.
- **Landscape mapping** (scratch script at 844×390): screen up/down moved the runner up/down on the rotated board.
- **Visual inspection**: menu, vault 1–2 play with guards/gates/scent/reticle, run-over card at portrait / landscape
  (rotated) / desktop, opened and judged.
- **Balance bot** (scratch, objective-seeking with a guard-proximity path penalty and EMP at <2.2 tiles): over 6 seeds
  it cleared vault 1 every time and reached vaults 2–4 in 25–70 s. Its deaths were head-on runs into Wardens and Hounds
  it had no lookahead for. That says the guards are effective. Whether they are too effective for humans is unproven.
- **Subjective playtest**: informed judgement from code, bots and scripted screenshots only. No human hands.

## Remaining issues
- **Difficulty**: possibly harsh from vault 2 (Warden + Hound pincer in a 1-wide maze). Speeds were eased once (Warden
  ×0.9, runner +0.3 tiles/s), but this needs a human pass.
- **Switch tactics**: the bot ignores them, so their strength is untested.
- **Art**: guards are geometric silhouettes and the runner has no run cycle beyond bob and tail.
- **Rotation**: rotating mid-run rotates the board under the player. That is correct, but it can surprise.
- Audio not ear-checked. The original daily mode was dropped.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Clear heist goal per floor, alarm escape beat, readable chases |
| Mechanical depth | 7 | Scent/intercept/line-of-sight guards to read, gate flips to cut pursuers off, EMP timing, glint runs vs. route risk |
| Game feel | 7 | Exact cornering, instant reverse, shake/flash on catches/keys/EMP, alarm escalation |
| Visual identity | 7 | Vault-heist look (gold-trimmed steel, cat burglar, robots, keycards) far from the source game |
| Animation quality | 6 | Bob, tail swish, guard hover, alert shake, door wheel spin; no frame animation |
| Audio quality | 6 | Glint run pitch ladder, adaptive bass/danger/alarm layers; not ear-checked |
| Controls | 8 | Pre-turn hold, 0.32-tile cornering grace, swipe-anywhere chaining, landscape rotation |
| Onboarding | 7 | Demo, 3-line how-to, contextual prompts and first-time tips |
| Replayability | 8 | Fresh braided vault every floor, scaling keys/gates/guards, score chase |
| Performance | 9 | Cached maze, tiny BFS fields, bounded fx; 61 fps headless |
| Technical robustness | 8 | Fixed step, generator validates both gate states, pause/blur/resize safe, deterministic restart |
| Overall polish | 7 | Menu → vaults → caught/reset → card → retry seamless; art still simple |

## Next recommended action
A human playtest of vaults 2–4 to tune Warden/Hound speed and the scent lag. Then a Sweeper-aware "hide" behaviour
(dark alcoves) and a short run cycle for the burglar.
