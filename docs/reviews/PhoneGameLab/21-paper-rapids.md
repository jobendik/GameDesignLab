---
id: PhoneGameLab/21-paper-rapids
title: Paper Rapids
was: 21-lane-dodger (Lane Dodger)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Three-lane dodger: swipe or tap to change lane, avoid blocks coming down the screen, grab coins.

## Baseline assessment
36-line prototype: coloured rectangles on a dark field, swipe registered only on release, purely random spawns (unfair
walls possible in principle, mostly trivially empty), instant death with no warning, score = time, one beep. Near-identical
to its sibling 22-traffic-dodge. Overall 2/10.

## Weaknesses identified
Laggy input (swipe on release); no pattern design; no risk/reward — the best strategy was to sit still; no identity,
no feedback, no progression, no best score.

## Creative opportunities
A lane dodger is only interesting if staying in danger is worth something: reward *late* dodges. Give the lanes a
physical reason to exist (river channels) and build a tactile paper-craft world around a folded boat.

## Planned improvements
Instant lane hops (early swipe, drag-on for double hops, tap sides, keys); authored, always-solvable waves; close-shave
scoring with a decaying multiplier; two-hit hull; speed tiers with visible palette changes; original paper diorama look.

## Implemented improvements
- **Controls**: `swipeEarly` hop after 26 px, keep dragging to hop again in the same gesture, side taps, arrows/A-D.
  The logical lane changes on the input frame; the hull follows in 0.11 s with lean, squash and a splash. Bank bumps
  acknowledge blocked inputs. Forgiving hitboxes (extra slack at the pointed stern).
- **Close shaves**: leaving a channel within a speed-scaled window before the obstacle passes pays a bonus (double for
  a RAZOR) and raises NERVE ×1–6, which decays every 5 s — safe play scores, brave play scores much more.
- **Wave planner**: singles, pairs, zig-zags, two-lane logs and ducks that paddle into a neighbouring lane (telegraphed
  by chevrons and a quack ~1 s ahead). Every row is reachable from the previous safe lane; petals trace the safe line,
  the odd petal sits behind a rock to tempt a late hop.
- **Progression**: a new "reach" every 12 rows — faster water, tighter gaps, new wave types, new water/bank palette
  (Meadow Brook → Blue Lagoon → Lilac Bend → Deep Run → Indigo Rapids), banner + jingle.
- **Fairness**: two hull points, 1.7 s of mercy after a hit, rare lifebuoy when damaged; first rows are slow singles.
- **Identity**: cut-paper banks with scrolling wavy edges, daisies and reeds, origami boat with a foam wake that
  remembers its path, baked paper sprites with offset shadows; bouncy generative tune whose intensity follows reach
  and nerve; hop pitch tells the lane, petal pickups climb in pitch, shaves ring up a pentatonic ladder.
- Game-over card with rows, close shaves and best nerve; best score via the engine.

## Test results
- Smoke (`tools/smoke.js 21-paper-rapids`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/21-paper-rapids.test.js`): pass ×3 — key, early-swipe, drag-on double hop and tap
  input; rows score through real dodging; scripted late dodges register close shaves; two crashes capsize; best
  persisted; restart fully resets.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, early play, reach 3, duck telegraph, nerve pill,
  game over). Fixed after inspection: wake drawn as a ribbon, larger boat, haze edge in landscape, how-to wrapping.
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- Splash sits on a plain gradient (no attract scene).
- Landscape phones get a narrow portrait stage (playable, small).
- Only three obstacle families; no boss/finale — the run is an endless score chase.
- Close-shave windows were tuned by reasoning and scripted play, not by human hands.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Dodging is instantly readable; shaves make every rock a small dare |
| Mechanical depth | 7 | Timing-based risk/reward with a decaying multiplier; no meta or power-ups beyond the buoy |
| Game feel | 8 | Zero-latency hops, lean/squash/splash, hit-stop on razor shaves, wake ribbon |
| Visual identity | 8 | Paper-craft river with shifting palettes; recognisable at thumbnail size |
| Animation quality | 7 | Boat, ducks, petals and foam all move; obstacles themselves are mostly static |
| Audio quality | 7 | Informative pitches, quack telegraph, reactive music; all engine presets |
| Controls | 9 | Early swipe, chained drag, taps, keys; forgiving hitboxes |
| Onboarding | 8 | Slow single rocks first; petals show the safe line; three short how-to lines |
| Replayability | 7 | Random waves from a pattern set, best score, nerve chase |
| Performance | 9 | Baked sprites, deterministic decor without arrays, ≤ ~25 entities |
| Technical robustness | 8 | Clean restart, layout recomputed on resize, engine timers only |
| Overall polish | 8 | Cohesive splash → play → card; small rough edges listed above |

## Next recommended action
Human playtest of the shave window and reach pacing; add an attract scene behind the splash and a fourth obstacle
family (whirlpool that drifts you one lane) for reaches 5+.
