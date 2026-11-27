---
id: games/neon-core-ballstorm
title: Neon Core Ballstorm
was: same
status: transformed
baseline: 4
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A "ballz"-style brick breaker in a neon skin: drag to aim, release a stream of balls at numbered blocks, the grid
steps down a row each turn, lose when a block reaches the line. Around it sat a large meta shell: three modes
(endless / daily / 20 "levels"), a coin shop with nine permanent upgrades, palette cosmetics, four consumable boosts
and a settings screen. The kernel worth keeping: **one aimed line turning into a storm of ricochets.**

## Baseline assessment
Playable but hollow (4/10). Driven with Playwright at 390×844 and 844×390: the first shot works, the look is
pleasant, and then the problems show.
- **Performance**: every brick, ball, particle and pickup set `shadowBlur` and built a fresh gradient every frame;
  150 balls ran at **8.7 fps portrait / 4.0 fps landscape** (headless). This is the fps flag from the smoke run.
- **Physics**: discrete circle-vs-rect overlap with sub-steps and a wall-clock (`performance.now`) 70 ms per-brick
  hit cooldown, so damage depended on frame rate; "fast-forward" multiplied ball speed (changing outcomes); balls were
  force-killed after 18 s; split balls and pickups used `Math.random`; chain effects ran on `setTimeout`.
  Nothing was reproducible and there was no `?seed`.
- **Design**: it shared its whole rule set with Star Petal Ballstorm (same grid, same specials, same shop). Depth was
  bought in a shop between runs rather than earned in the run; the four boosts were free "skip the problem" buttons;
  "Level mode" drafted with `Math.random` and was mostly the same board. The aim preview faked brick bounces with a
  point test, so it lied about the first bounce.
- **Housekeeping**: no `gdl:best` key, no `gdl:controls`, emoji HUD, auto-pause missing, HUD wrapped to two rows on a
  phone, keyboard could fire but not aim.

## Weaknesses identified
1. Unplayable frame rate exactly when the game should peak (many balls).
2. Frame-rate dependent, non-deterministic collision; preview not trustworthy.
3. No run structure: an endless treadmill plus a grind shop; no bosses, no build decisions inside a run.
4. Identity: a palette swap of its sibling.
5. Touch aiming put the finger on top of the thing being aimed at.

## Creative opportunities
Make this the *definitive turn-based aim-and-ricochet roguelike*: a run you can read (boss every 10 turns, module
draft every 4), where the storm you fire on turn 30 is visibly the build you chose, and where the aim line can be
trusted to the pixel. The sibling game (Star Petal) moves to a different verb entirely — see "Difference from Star
Petal" below.

## Planned improvements
Rewrite on a fixed-step, swept, seeded simulation in world units; replace shop/modes/boosts with an in-run draft,
integrity instead of instant death, bosses and special blocks; exact preview; speed/recall; cached-sprite renderer;
real audio; three layouts; test hook, test, review.

## Implemented improvements
- **Simulation**: 120 Hz fixed step in a 420×584 world, independent of resolution. Each packet is advanced by a
  *swept* cast — earliest contact against walls and the rounded Minkowski box of every block in the cells its path
  crosses (faces and true corner arcs), reflect, continue with the remaining distance — so nothing tunnels at any
  speed and speed-up is simply more ticks per frame (×2/×4, auto ×8 on very long volleys), never a different result.
  Anti-stall: a reflection can never leave a packet flatter than ~6° or perfectly vertical, and a packet that touches
  no block for 4 s drifts home. All gameplay randomness comes from one seeded generator (`?seed=`), effects use a
  separate cosmetic RNG; identical input reproduces a volley exactly (tested).
- **Aim**: the preview is traced with the same cast as the packets: first segment, the bounce point, the outgoing
  leg (Deep Scope adds bounces), and the block that will be hit is outlined. Mouse: point and click. Touch: drag on
  the grid, or **slide in the empty zone under the board** for relative fine aim with the finger off the grid.
  Keyboard: ←/→ (Shift = fine), Space. Dragging below the deck cancels.
- **Turn structure**: blocks that cross the firewall cost integrity (3 pips; a boss costs 2) instead of ending the
  run outright; the last row pulses and beeps. First packet home sets the next launch position. SPEED and RECALL
  buttons (Space / R).
- **Blocks and pickups**: normal, reinforced (double), **plated** (immune from below — bank it), **bomb** (explodes
  for 80% of its size), **regen** (heals every turn, so it is a priority); +1 rings, row/column beams (fire on every
  pass) and scatter nodes. Block colour encodes toughness *relative to your current packet count*.
- **Draft**: after turns 2, 6, 10 … pick 1 of 3 from 12 modules (Packet Surge, Ricochet Charge, Zenith Burn, Drill /
  Burst / Fork rounds, Arc Link, Glitch Crit, Cascade, Firewall Burn, Deep Scope, Patch), stackable, plus 4 rare
  ones (Rebound Deck, Heavy Packets, Bastion, Packet Flood) from boss kills or a 16% slot. They pull in different
  directions — bank-shot builds (Ricochet/Zenith), special-round builds, board-control builds (Cascade/Burn) — and
  the build is always visible as chips.
- **Bosses** every 10 turns (2×2, 13× block HP): Bulwark (plated), Replicator (prints a block each turn), Amplifier
  (new rows +50%). A kill shockwaves the grid for 35%, repairs 1 integrity and opens a rare draft. Balance bots show
  bosses are the gates where runs end.
- **Scoring**: +1 per hit, 10 × chain per block (chain = blocks deleted this volley, capped ×15), clean-sweep and
  boss bonuses; best stored in `gdl:best:games/neon-core-ballstorm` every time it is beaten.
- **Difficulty**: block HP `0.9·t·1.05^t·(1+(t/23)^3)`. Scripted players over several seeds: a preview-guided bot
  ends around turn 28–57 (median ≈ 49), random aim around 18–42 (median ≈ 23).
- **Rendering**: background, block tiles (per colour) and packet glows are pre-rendered sprites; trails are one
  stroked path; particles are pooled rects (≤ 260). No per-frame `shadowBlur` or gradients. **60 fps with 150–256
  packets in flight at ×2** in software-rendered headless Chromium (worst frame 16.8 ms), up from 4–9 fps.
- **Audio**: hit blips climb a pentatonic scale through the volley, block deletions step up with the chain, distinct
  voices for plate "tink", beams, bombs, arcs, pickups, breach, draft, boss; a generative bass/arp loop whose filter
  opens while a volley is in flight and drops to a pulse while aiming. Mute button / M, remembered; starts on gesture.
- **Lifecycle / layout**: pause (button, P/Esc, auto on blur/hidden), clean restart, resize-safe (sprites rebuilt,
  simulation untouched), reduced-motion honoured, portrait stack and side-panel landscape/desktop layouts, no
  external requests, vendored fonts, focusable canvas for iframe keyboard play.

### Difference from Star Petal Ballstorm
Neon Core is **turn-based, zero-gravity, many balls, endless-with-bosses roguelike**: you aim once, then watch and
plan a build. Star Petal is rebuilt as a **gravity peg garden**: one falling star at a time, steered in real time
with a breeze, limited stars per hand-shaped garden, puzzle scoring. Different verb, tempo, physics and structure.

## Test results
- **Automated-gameplay** (`node tools/run-tests.js neon-core-ballstorm`, passes in ~5 s): menu → START; mouse-held
  aim equals the requested angle, preview names the target and the first packet bounces < 8 units from the drawn
  bounce point; block loses exactly 1 hp; turn advances and rows descend; Space speed-up; RECALL button; draft opens
  after turn 2, tapped card is installed and shown; keyboard aim + fire; pause freezes ticks; mute; a 250-packet
  storm checked every 0.1 s — no packet outside the walls or inside a block, peak ≥ 100 in flight, volley ends by
  itself; touch slide-to-aim turns the aim by the expected amount and fires on lift; wasted volleys → breaches →
  CORE BREACHED card, best persisted; RUN AGAIN resets everything and deals the same seeded board; reload + replay
  reproduces the first volley exactly.
- **Automated-technical** (`node tools/smoke.js neon-core-ballstorm`): ok, 61 fps, no errors or external requests.
- **Visual inspection**: looked at splash, aim, volley, draft, boss, late-game storm at 390×844, and aim/volley at
  844×390 and 1280×800. Fixed from what was seen: firewall pips colliding with the launcher (removed), sparse early
  boards (density raised), finger-on-board aiming (slide zone added).
- **Subjective playtest**: informed judgement from scripted play, bots and screenshots — not a human playtest.

## Remaining issues
- Late volleys with Rebound Deck can run 40–80 s of simulation (a hard recall fires at 80 s); auto speed-up makes
  that ~15 s of real time, which is still long if you do not press RECALL.
- Balance is tuned by two bots, not people; individual modules (Cascade, Burst at max stacks) are probably stronger
  than the positional ones (Ricochet).
- No daily seed or meta-progression (deliberately removed); the 844×390 board is small (38 px cells) though legible.
- Colour is backed by icons/shape for special blocks, but toughness tiers are colour-only (the number is the real
  information).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Aim → storm → draft loop is immediately readable and the storm is the reward; bosses give the run a shape |
| Mechanical depth | 8 | Exact bank shots, plated/regen targets, landing position, 16 stackable modules; preview-guided bot doubles random aim |
| Game feel | 7 | Per-hit flash/pop, chain numbers, rings, shake, hit pitch ladder; no hit-stop, launcher has little anticipation |
| Visual identity | 8 | Consistent cyan/magenta circuit look, gold boss, charged gold storms read from a thumbnail |
| Animation quality | 7 | Rows ease down, pickups bob, packets glide home, toasts; block deaths are particle bursts only |
| Audio quality | 7 | Informative pitch (volley progress, chain), layered events, reactive loop; synthesised and fairly plain |
| Controls | 8 | Mouse, direct touch, off-board slide aim, full keyboard, cancel; one-frame response; 44 px+ targets |
| Onboarding | 8 | Three-line splash, animated "drag to aim" on first run, preview teaches bounces, boss/draft toasts explain themselves |
| Replayability | 8 | Seeded variety, build routes, boss rotation, visible best; no meta layer |
| Performance | 9 | 60 fps with 250+ packets in software rendering; pooled effects, cached sprites, no per-frame allocation storms |
| Technical robustness | 8 | Fixed-step deterministic sim, swept collision, pause/blur/resize/restart tested, no console errors |
| Overall polish | 8 | Splash → run → draft → breach → retry is seamless; nothing placeholder; long late volleys are the rough edge |

## Next recommended action
A human balance pass on module strength and the turn-20/30 boss gates; consider a per-packet charge limit (or a
visible volley timer) instead of the 80 s recall cap, and a small death animation for blocks.
