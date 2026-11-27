---
id: games/neon-burst
title: Neon Burst — One-Spark Chain Reaction
was: Neon Burst - Dopamine Rush
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Coloured orbs appear at random and expire after ~3 s; tap one for `100 × combo` points, a 30–100 particle burst,
screen shake and a white flash. Combo rises per hit and resets on a miss, an expiry or a drain bar. The kernel worth
keeping: **a tap that bursts, a pitch that climbs with the chain, a multiplier you can lose.**

## Baseline assessment
Bare sketch (2/10). Whack-a-mole with no end state: the run never finishes, so the score means nothing. Frame-count
simulation (twice as fast at 120 Hz), `setTimeout` spawner that keeps stacking across restarts, `shadowBlur` on every
particle, full-screen flash on every hit, no pause, no best score, no keyboard, no audio beyond two raw oscillators,
no layout handling beyond a resize that stretches nothing. The juice is unconditional: the same burst whatever you do.

## Weaknesses identified
1. No decision anywhere — the only skill is pointing speed, and the effects do not depend on how well you played.
2. No structure: no goal, no fail state, no progression, nothing to beat.
3. Feel is loud rather than good (flash + 30 px shake per tap), and it is not frame-rate independent.
4. "Neon orbs on black" with rainbow hues that mean nothing.
5. Missing lifecycle, persistence, controls and metadata.

## Creative opportunities
Its sibling `chroma-frenzy` is the reflex game; this one should be the **planning** game. Take "burst" literally: one
tap whose burst sets off the next. That turns the chain from "how fast did I tap" into "how well did I place and time
one spark", and it makes every effect a consequence of a choice — the cascade *is* the feedback.

## Planned improvements
Rewrite as a one-spark chain-reaction game: readable static constellations joined by moving bridges, bulb types with
different bursts, a quota per level, a run economy (spare sparks vs. multiplier), deterministic fixed-step simulation,
a solver that calibrates each level, pitch + colour ladders tied to the pop count, full lifecycle, test, review.

## Implemented improvements
- **Core loop**: hold to aim a ring (bulbs in range light up), release to drop the single spark. Every bulb caught
  bursts in turn. Pop the quota to clear; pop `k` is worth `10·k × multiplier`, so one long chain beats two short ones.
- **Boards you can read**: each level is a connected patch of constellations (arcs, lines, hex clusters, orbiting
  rings, sliding rows). Gaps between neighbours get a fixed link, a *sliding* link (a bulb that crosses the gap — the
  timing puzzle) or nothing (drifters may or may not carry it). Four bulb kinds, distinct in shape as well as colour:
  pip (plain), bass (wide, long blast), dart (fires two piercing bolts along a rotating axis that is drawn on the
  board), shell (armour: needs two *different* blasts). Types are introduced one per level with a one-line banner.
- **Calibrated quota**: a brute-force solver tries a spark on the bulbs at three moments (cloned simulation, coarse
  steps, time-sliced over the previous level's banner). The best result is the level's par; the quota is what only a
  shrinking share of naive sparks reaches (85 % on level 1 → 8 %), clamped to 35–90 % of par. Every level is
  therefore known to be clearable, and the difficulty is measured rather than guessed.
- **Risk economy**: clearing with one spark raises the multiplier (×1→×9). Falling short lets you spend one of two
  spare sparks — which resets the multiplier. A spare can also be spent *mid-chain* to rescue a dying cascade, but only
  with a held press, so stray taps never burn one. Perfect (every bulb) returns a spare and pays ×1000; matching the
  solver's par is a MASTER SPARK. No spares and short = run over.
- **Feel**: fixed 60 Hz simulation; blasts grow in 0.22 s so a line pops as an arpeggio; each pop stamps its number
  in the chain; blast colour climbs a seven-step heat ramp with the pop count while the note climbs a pentatonic
  ladder; 70 ms hit-stop + chord on the pop that meets the quota; shake only for bass bulbs and capped at 6 px; giant
  `pops/quota` numerals behind the board punch when the quota falls. Reduced-motion disables shake, flash, hit-stop.
- **Look**: indigo light-table with a dot grid, flat bulbs with shape language, translucent rim-lit blast discs that
  overlap like soap film rather than particle soup; a segmented quota bar that fills in the heat colours.
- **Audio**: WebAudio only after a gesture; pop ladder with echo send, per-type layers (sub thump, dart zap, shell
  crack), quota chord, clear/perfect fanfares, short/fail cues, a quiet two-voice pad whose root changes per level and
  whose filter opens with the multiplier. Notes are spaced ≥ 42 ms so big cascades stay musical. Mute button + M.
- **Controls**: touch (press-drag-release), mouse (hover ring, click), keyboard (arrows/WASD move the ring, Space/Enter
  hold-release, P/Esc, M). Works in an iframe (focus on pointerdown, no `top`).
- **Lifecycle**: attract mode behind the menu (the game plays itself), pause button/keys/auto-pause on blur, resize
  rescales the live board, `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, `window.__gdl` (state, `simulate`,
  `bulbs`, `advance`, `manual`, `level`), best in `gdl:best:games/neon-burst`.

## Test results
- **Automated-technical**: `node tools/smoke.js neon-burst` — pass, 61 fps, no errors.
- **Automated-gameplay**: `node tools/run-tests.js neon-burst` — pass 3/3 consecutive runs (~4 s). Real CDP touch,
  mouse and keyboard: menu → play; press aims without firing, release fires; the chain pops exactly what the game's
  cloned simulation predicted; score equals the ladder + bonuses; multiplier ×2; wasted spark → SHORT → spare spent,
  multiplier ×1; quick mid-chain tap burns nothing, held press does; no spares → game over, best stored; restart
  deals the same seeded board; keyboard aim/fire; mute; pause freezes the clock.
- **Visual inspection**: portrait, landscape and desktop looked at in menu, aiming, mid-chain (levels 5/7/9/12),
  clear banner, SHORT prompt and game over. Fixed along the way: blown-out additive centres, unreadable banners over
  bulbs (outlined), hint text over bulbs (pill).
- **Balance probe** (scratch script): 2 seeds × 16 levels — share of naive taps that clear falls from ~90 % (L1–3)
  to 3–30 % (L10–16); par is ≥ 85 % of the board on most levels.
- **Subjective playtest**: informed judgement from code + scripted play, not a human playtest. Audio was not heard.

## Remaining issues
- Difficulty between neighbouring late levels is uneven (a fully linked board next to one with three timed gaps).
- The solver costs 150–850 ms of 4×-throttled CPU per level; it is sliced at 7 ms/frame but a slow phone may still
  see a short hitch as a late level loads.
- Bulbs are chunky on a 1280 desktop and boards hold fewer constellations there than a designer would hand-place.
- No colour-blind palette option (shapes differ, but the heat ramp is colour-only decoration).
- Audio mix is untested by ear.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | One tap, a 3–6 s cascade you caused, immediate next board; first level nearly always pays off |
| Mechanical depth | 8 | Placement + timing, four bulb behaviours, timed bridges, spare-vs-multiplier economy, par to chase |
| Game feel | 8 | Aim ring acknowledges the press in-frame; arpeggio pops, heat ramp, numbered stamps, hit-stop on quota |
| Visual identity | 8 | Soap-film blast discs in a heat ramp over an indigo light table; recognisable from a thumbnail |
| Animation quality | 7 | Eased blasts, pop-in/out, punching numerals, banners; bulbs themselves vanish rather than squash |
| Audio quality | 7 | Informative ladder, per-type layers, reactive pad — designed carefully but unverified by ear |
| Controls | 8 | Press-aim-release with range highlight; hover ring; full keyboard; held press guards the spare |
| Onboarding | 8 | Attract mode shows the idea; three-line how-to; one tip per new bulb; SHORT prompt explains the spare |
| Replayability | 8 | Seeded endless boards, multiplier streak, perfect/master goals, best score |
| Performance | 8 | ≤ ~65 bulbs, cached sprites, no per-frame allocation storms; solver is the one heavy step |
| Technical robustness | 8 | Fixed-step deterministic sim, clean restart, pause, resize rescale, storage guarded, test passes 3× |
| Overall polish | 8 | Splash → play → clear → game over → retry is seamless; nothing placeholder |
## Next recommended action
Human playtest on a phone for late-level fairness and the audio mix; then hand-tune the bridge odds per level and
consider a daily seeded board.
