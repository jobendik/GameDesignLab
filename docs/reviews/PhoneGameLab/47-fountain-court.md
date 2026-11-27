---
id: PhoneGameLab/47-fountain-court
title: Fountain Court
was: 47-pipe-rotate (Pipe Rotate)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Tap pipe tiles on a 5×7 grid to rotate them until the top-left source connects to the bottom-right drain.

## Baseline assessment
58 lines: tiles filled with uniformly random shapes (many boards unsolvable, many solved by accident), line-segment
pipes on navy squares, no water, instant unexplained "Connected!", one beep, hardcoded offsets. Overall 2/10.

## Weaknesses identified
No generator (solvability by luck); a single source→sink goal that ignores most of the board; no flow feedback; no
levels, undo, par or identity; identical look to its sibling prototypes.

## Creative opportunities
Make the water real — it should visibly flood, drain and spill — and turn the goal into "feed every fountain and waste
nothing", which uses the whole board. A tiled Moorish courtyard gives it a look none of the siblings has.

## Planned improvements
Tree-growing generator with guaranteed solution; flooding simulation; leaks; multiple fountains; tap par and stars;
fixed and linked tiles for late-game logic; undo / reset / hint; level progress; landscape layout.

## Implemented improvements
- **Generator**: a growing-tree maze of channels (≤ 3 ports per tile) is grown from an interior spring over 70–100 % of
  the court, every dead end becomes a fountain, then tiles are turned by a seeded amount. Seeded by court number.
  20 tuned steps (3×3 → 7×9), endless after that.
- **Water**: breadth-first connectivity decides what is wet; a per-tile fill level then floods tile by tile from the
  spring (entry arm first, then the outlets), drains when cut off, splashes out of a tile you lift, and carries ripple
  dashes that always run downstream. Open ends of wet channels form pulsing puddles with a coral ring and drip.
- **Rules/depth**: win = every fountain running and zero leaks. Tap par is the exact number of quarter turns needed
  (★★★ = no wasted tap). Mossy tiles are set in place (deduction anchors on big courts); jewelled twins turn together
  for one tap; hint turns the next tile along the stream and pins it (−1 star); undo, reset, level select.
- **Identity**: sandstone tiles with carved grooves (baked sprites, rotated and lifted when tapped), cobalt zellige
  star background, brass frame, turquoise water, fountains with animated jets, octagonal spring pool.
- **Audio**: stone knock per turn, thud + wiggle on fixed tiles, bubbling pentatonic note as water *arrives* at each
  fountain (pitch = fountains running), drop when one runs dry, a filtered-noise water bed whose level follows the
  flow, dream music whose intensity follows fountains running.
- **Controls**: tap (touch/mouse); arrow-key cursor + Space; Z/R/H shortcuts. Board transposes in landscape.

## Test results
- Smoke (`tools/smoke.js 47-fountain-court`): pass.
- Gameplay test (`tests/PhoneGameLab/47-fountain-court.test.js`): pass — tap rotation + count, fixed spring, undo, reset,
  all-but-one keeps it unsolved with a dry fountain/leak, on-par solve → win + 3 stars + progress, next court clean,
  mossy tile immovable, twins turn together, hint costs a star, court 13 solved, best = 13.
- Screenshots inspected at 390×844 and 844×390 (courts 1 and 13 mid-solve), 1280×800 via smoke only.
- Subjective assessment from scripted play and code reading only (no human playtest).

## Remaining issues
- Tap = clockwise only; a tile needing three turns costs three taps (par accounts for it, but a two-finger/long-press
  counter-turn would be kinder).
- Solutions are not proven unique; an alternative leak-free layout also wins (never unfair, par may then be beatable).
- In landscape the transposed board turns tiles visually counter-clockwise.
- Only one round of visual iteration was needed/performed; desktop layout judged from the shared layout code + smoke.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Turning a tile and watching the water run on is immediately satisfying; full courts need real thought |
| Mechanical depth | 7 | Edge/anchor deduction, twins, tap par; no wrap-around or multi-spring courts |
| Game feel | 8 | Tile lift + eased quarter turn, splash, flood wave, fountain pop on arrival |
| Visual identity | 8 | Sandstone-on-cobalt courtyard is unlike any sibling |
| Animation quality | 8 | Progressive flooding/draining, downstream ripples, jets, leak puddles |
| Audio quality | 8 | Flow-reactive water bed, arrival notes carry progress, distinct fixed-tile thud |
| Controls | 8 | One tap, big tiles (≥ 46 px), keyboard cursor; no counter-clockwise turn |
| Onboarding | 8 | Pulsing ring on the first tile to tap; leaks and dry fountains explain themselves; one-off tips for moss/twins |
| Replayability | 7 | Endless seeded courts and star chase; no timed/daily variant |
| Performance | 9 | ≤ 63 tiles, baked tile sprites, one batched water path |
| Technical robustness | 8 | Clean reload/restart, resize/rotate re-lays out, loop stops with the engine |
| Overall polish | 8 | Cohesive from splash (live solved court) to win card |

## Next recommended action
Human playtest of courts 10–20 for difficulty; consider long-press to turn counter-clockwise and a uniqueness filter.
