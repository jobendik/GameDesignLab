---
id: games/star-petal-ballstorm
title: Star Petal Cascade
was: Star Petal Ballstorm
status: transformed
baseline: 3
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A pastel reskin of the same "ballz" brick breaker as Neon Core Ballstorm: a unicorn launcher fires a stream of
"pearls" at numbered gem blocks that step down each turn; chests, bombs, rays, a coin shop, three near-identical
modes. What was its own: the **twilight, star-and-petal mood** and the pleasure of something small and bright
bouncing down through a field of pretty things.

## Baseline assessment
Thin and broken in ways that matter (3/10). Played at 390×844:
- The three boost buttons (Fire / Ray / Star) had **no cost and no cooldown** — pressing Star repeatedly deletes the
  board, so there was no game unless you chose not to press them.
- Balls were launched with `setTimeout`, collision resolution guessed the previous position as `v/60`, damage and
  drops used `Math.random`, there was a hard 18 s ball kill; nothing was frame-rate independent or reproducible.
- Every trail point of every ball built a radial gradient per frame and everything used `shadowBlur`.
- R restarted the run from any state (including menus), pause only half worked, no auto-pause, no `gdl:best`, no
  `gdl:controls`, emoji HUD, level mode was "survive 10 turns" with a number, the shop grind was copied from the
  sibling.
- Most importantly: it was the *same game* as Neon Core with different colours.

## Weaknesses identified
1. No identity of its own in play — a skin.
2. Self-defeating free boosts; no real fail pressure or decisions.
3. Fragile, non-deterministic physics; no tests possible.
4. Per-frame gradient/shadow cost; lifecycle and metadata gaps.

## Creative opportunities
Keep the mood, change the verb. Neon Core is "aim once, watch many, build a machine". Star Petal becomes the
opposite tempo: **one falling star at a time, gravity, and your hand on it all the way down** — a peg garden where
buds bloom when touched, golden moonbuds are the goal, stars are the budget, and a breath of wind lets you steer
the fall. Calm, legible, puzzle-like; the "storm" is the petal burst when a garden blooms.

## Planned improvements
Full rewrite as a limited-shot gravity peg game with real-time steering: deterministic 120 Hz swept circle physics,
seeded procedural gardens, moonbud goal, breath meter, lily-cup catcher, special buds, garden-to-garden star
economy, wind-chime audio, pastel sprite renderer, three layouts, hook + test + review.

## Implemented improvements
- **Loop**: drag from the moon to aim (dotted preview = the real path up to and just past the first bounce),
  release to drop one star. Every bud it touches blooms and scores `10 × n` for the n-th bud of the cascade (×3 for
  moonbuds), and the chime climbs a pentatonic scale with it. Woken buds stay as obstacles until the star is gone,
  then pop in order. Wake every **moonbud** to bloom the garden; run out of stars first and the run ends.
- **Breeze (the new verb)**: while a star falls, hold ◄ / ► (pads, either half of the garden, or arrow keys) to
  push it sideways. Breath is a meter (≈1.25 s per star); dew buds refill it. This is what turns a pachinko drop
  into something you play: save a star heading for the pond, lean it onto the last moonbud, guide it into the cup.
- **Garden pieces**: bell flowers (strong bumpers, +25 up to six times), twin buds (split the star — up to four in
  play), dew buds, and a drifting **lily cup** that returns a star it catches. 10 blooms in one drop = a bouquet
  (+1 star). The last moonbud triggers a short slow-motion and a ring.
- **Run structure**: six seeded layout families (staggered rows, rings, waves, rose curves, chevrons, spiral) in a
  shuffled order, topped up to ≥ 36 buds with a spacing rule so nothing can wedge; moonbuds 8 → 16; the cup
  narrows and speeds up; bonus stars per garden fall 3 → 2 → 1; pouch capped at 12. Bloom bonus
  `500 × garden + 100 × stars`. Best in `gdl:best:games/star-petal-ballstorm`, written whenever beaten.
- **Physics**: fixed 120 Hz; each step is a swept ray-vs-circle cast against every bud plus walls (earliest hit,
  reflect with restitution, continue with the remainder), speed-capped, minimum rebound so a star never rests on a
  bud, a 3 s no-progress rule that pops the woken buds under a juggling star and nudges it, 40 s hard cap. No
  gameplay randomness after garden generation, so the same seed + same aim replays exactly, and the preview and the
  test helper (`simDrop`) run the very same step function as the live star.
- **Look**: baked twilight sky, hills, pond and clouds; pre-rendered bud / bloom / bell / star sprites; petals as
  pooled particles (≤ 320); buds sway with the breeze; wind streaks; moonbuds carry a crescent and a pulsing ring so
  they are not colour-only. No per-frame gradients or shadows; 60 fps in software-rendered headless at all three
  viewports.
- **Sound**: bell-like chimes (three partials) pitched by cascade position, deeper bell flowers, twin / dew / cup /
  pond / bloom voices, a filtered-noise breeze that follows your input, and a slow four-chord pad with sparse
  sparkle notes. Mute button / M (remembered), starts on first gesture.
- **Lifecycle / layout**: pause (button, P/Esc, auto on blur/hidden), clean restart, resize-safe, reduced motion
  honoured, portrait stack with thumb-sized breeze pads, side-panel layout for landscape/desktop, vendored fonts
  (Fredoka / Baloo 2), no external requests, `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, `window.__gdl` with
  `manual` / `advance`.
- **Title** changed to *Star Petal Cascade* (file name kept) because the game is no longer a ball-stream shooter.

### Difference from Neon Core Ballstorm
| | Neon Core Ballstorm | Star Petal Cascade |
|---|---|---|
| Verb | aim once, then watch / speed / recall | aim, then steer the fall in real time |
| Physics | zero gravity, perfect ricochets, hundreds of packets | gravity, one star (up to four), restitution |
| Structure | endless descending rows, bosses, module draft | discrete gardens, limited stars, clear the moonbuds |
| Pressure | rows reaching the firewall | the star budget |
| Tempo / mood | escalating storm, synth loop | calm, wind chimes |

## Test results
- **Automated-gameplay** (`node tools/run-tests.js star-petal-ballstorm`, ~9 s, passed 4/4 consecutive runs): menu →
  Play; held pointer sets the angle; after `2j+1` ticks the star is on the previewed path to < 1e-6 units; the drop
  wakes exactly the buds/moonbuds `simDrop` predicts, score and stars follow, woken buds are removed; dragging
  above the moon cancels; holding → adds exactly `560 × t` to the star's horizontal speed and drains breath by
  `0.8 × t`; the ◄ pad and a touch on the garden's right half set the wind; pause freezes ticks; mute; a star
  dropped on a predicted line lands in the lily cup and returns; the garden is cleared (bonus, garden 2 with 9
  moonbuds, +3 stars, twin bud present); stars are thrown away until the end card appears with the stored best;
  Play again resets to the same seeded garden; reload + same aim reproduces the first drop exactly.
- **Automated-technical** (`node tools/smoke.js star-petal-ballstorm`): ok, 61 fps, no errors or external requests.
- **Visual inspection**: looked at splash, aim, breeze drop, garden 3, bloom finale at 390×844; finale at 844×390;
  aim at 1280×800. Fixed from what was seen: oversized bloom sprites (bigger than their collision), clipped HUD
  label, sparse rose/spiral gardens (top-up pass added).
- **Subjective playtest**: informed judgement from scripted play, bots and screenshots — not a human playtest.

## Remaining issues
- Balance is bot-estimated: random aim with no breeze clears 0–1 gardens; a brute-force "simulate every angle"
  helper clears a dozen. Where a human with preview + breeze lands, and whether late gardens ramp enough, needs
  people.
- At 844×390 the garden is ~250 px wide (6 px buds): playable, but this is a portrait game.
- One preview segment only; there is no zoom or fine-aim loupe for touch (the ◄ ► pads double as fine aim).
- Layout families repeat after six gardens with different seeds; no hand-authored set pieces.
- The peg-clearing genre is familiar; the breeze and the garden fiction are what is its own.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Aim → cascade → steer is fun from the first drop; chime ladder and blooms make every bounce pay |
| Mechanical depth | 7 | Angle choice, breath budget, cup timing, twin/bell routing, star economy across gardens; first-bounce preview limits planning |
| Game feel | 8 | Immediate breeze response with streaks, sway and sound; pop/bloom, rings, slow-motion on the last moonbud, petal burst |
| Visual identity | 8 | Twilight pastel garden, moon launcher, lily cup — unmistakably not its neon sibling |
| Animation quality | 7 | Buds sway and pop, ordered clearing, petals flutter with drag; star is a rotating sprite, cup is simple |
| Audio quality | 8 | Chimes carry cascade position, breeze noise follows input, soft pad; cohesive and calm |
| Controls | 8 | Mouse, touch drag, thumb pads, both screen halves, full keyboard; cancel gesture; ≥ 44 px targets |
| Onboarding | 8 | Three-line splash, "drag to aim" and "hold to blow a breeze" prompts appear exactly when relevant |
| Replayability | 7 | Seeded gardens, score chase, star economy; no meta layer, six layout families |
| Performance | 9 | Sprite-based, ≤ 320 particles, 60 fps headless at all viewports |
| Technical robustness | 8 | Deterministic fixed-step sim shared by preview/helper/live play; pause/blur/resize/restart tested; no console errors |
| Overall polish | 8 | Splash → play → bloom → next garden → end → retry is seamless; nothing placeholder |

## Next recommended action
Human balance pass on stars-per-garden and breath length; add two or three hand-shaped set-piece gardens (moving
buds, a second cup) for gardens 7+ so late play introduces new ideas rather than only tighter numbers.
