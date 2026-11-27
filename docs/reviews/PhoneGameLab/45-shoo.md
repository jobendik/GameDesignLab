---
id: PhoneGameLab/45-shoo
title: Shoo!
was: 45-tap-clusters (Tap Clusters)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Tap a group of two or more touching same-coloured blocks to remove it; blocks above fall, empty columns close up;
bigger groups score more; the board is finite and ends when no group is left.

## Baseline assessment
56-line prototype: flat squares that vanish and teleport (no fall or slide), n² scoring with no preview, one beep, a
`setTimeout` game over with no notion of having done well or badly, no best score, fixed pixel layout. Overall 2/10.

## Weaknesses identified
No identity; the two satisfying moments of the genre (things dropping, columns closing) are not shown; nothing tells
the player a group's value before committing; no goal, so no end-board strategy; nothing changes between boards.

## Creative opportunities
Make the blocks creatures that *leave* instead of pop; show the value while the finger is down; turn the finite board
into a quota so leaving stragglers matters; add one blocker and one rescue tool that both feed the "grow it first" idea.

## Planned improvements
Birds on a roof; press-to-preview, release-to-shoo; quadratic scoring; per-roof quota + straggler/clean-sweep bonus;
pigeons; whistle; real gravity and ridge-sliding; chirp ladder; keyboard cursor; own sunrise look.

## Implemented improvements
- Original identity: sunrise sky with drifting clouds and a town skyline, terracotta tiled roof, chunky square birds
  whose crests differ per colour (shape-coded), live eyes that blink and widen; grumpy half-lidded pigeons. All in code.
- Gravity + column collapse you can watch: shooed birds take off in a ripple from the tap with flapping wings and
  feathers; the birds above wait for the ripple, flutter down with acceleration, squash and tap (pitch by column); when a
  column empties the stacks hop sideways along the ridge. Logic resolves instantly, so the next tap is never blocked.
- Bigger-group bonus: n·(n−1)·5 (2 → 10, 6 → 150, 12 → 660); the chirp ladder climbs one note per bird, flocks of 8+
  shake and whoosh; pressing shows a "+value" bubble and a ghost segment on the quota bar, sliding off cancels.
- End-board strategy: every roof has a seed quota; when no flock remains the roof is scored — +40 for each bird under
  ten left, +600 for a clean sweep — and you advance only if the quota is met (otherwise the run ends). Quotas were set
  from a simulation of random and greedy play (300 boards per configuration) so roof 1 forgives and later roofs need
  planning.
- Twists: pigeons never flock and count as stragglers, but bolt (+25) when a flock of 4+ leaves beside them; flocks
  of 9+ earn a whistle (max 3) that scares off any single bird — the tool for joining two flocks or saving a sweep.
- Progression: 4 colours → pigeons → 5 colours → more pigeons → 6 colours, with quotas tuned per roof.
- Controls: touch/mouse press-preview-release, mouse hover preview, arrows + Space cursor, W for the whistle; lone
  birds just flinch.
- Robust: column arrays (bottom-up) as the single source of truth, visuals chase it; portrait and wide layouts;
  sprites re-baked on resize; self-playing attract roof.

## Test results
- Gameplay test `tests/PhoneGameLab/45-shoo.test.js`: pass — hold shows size/value and removes nothing, release scores
  n(n−1)·5; lone bird stays; flock of 4 takes a pigeon (85) and the column closes; whistle (keyboard + click) removes
  one bird and gravity forms a flock; keyboard shoo; touch taps slide columns together, finish a clean sweep, pay the
  bonus and deal roof 2; missed quota → game over, best recorded; clean restart.
- Smoke: pass (60 fps headless, survives resize/blur).
- Screenshots inspected at 390×844, 844×390, 1280×800 (splash, preview bubble, mid-flight, falling stacks). Fixed:
  skyline too close to the sky colour to read.
- Subjective assessment from code reading, simulation and scripted play, not a human playtest.

## Remaining issues
- Roof 1's quota is passable with careless play (by design, but it makes the first minute low-stakes).
- No undo; the whistle is the only recovery tool and there is no preview of how the board will settle.
- Quotas for six-colour roofs come from simulation only; the difficulty step at roof 7 may be sharp.
- Whistle icon is serviceable rather than pretty; landscape roof strip is thin.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Instant, tactile, and the quota makes the last ten birds tense |
| Mechanical depth | 7 | Grow-before-shoo, column planning, pigeons, whistle timing; no undo/lookahead tools |
| Game feel | 8 | Take-off ripple, fluttering falls, squash, chirp ladder, preview bubble |
| Visual identity | 8 | Sunrise roof and crested square birds; distinct from its two grid siblings |
| Animation quality | 8 | Flap, blink, perk-up on hover, hop along the ridge, fly-out on roof clear |
| Audio quality | 7 | Chirp ladder scales with flock size; rest are engine presets |
| Controls | 8 | Preview/cancel on touch, hover on mouse, full keyboard; no input lock |
| Onboarding | 8 | First tap teaches; bar ghost shows why big flocks matter; pigeon hint on roof 2 |
| Replayability | 7 | Random roofs, rising quotas, sweep chase; one mode |
| Performance | 9 | ≤ 72 baked sprites + a few flyers and particles |
| Technical robustness | 8 | Instant logic, tested end/advance/fail paths, resize-safe, clean restart |
| Overall polish | 8 | Complete and cohesive |

## Next recommended action
Human playtest of roofs 3–8 for quota tuning; consider a one-step undo or a "settle preview" for expert play.
