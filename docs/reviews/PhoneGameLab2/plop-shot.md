---
id: PhoneGameLab2/plop-shot
title: Plop Shot
was: goal / Goal!
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Goal!": a cursor sweeps left-right under a goal; tap when it lines up with one of five targets; 8 shots.

## Baseline assessment
2/10 — one-axis timing with no flight, no feedback, no progression; football framing duplicates this batch's *Volley Garden*.

## Weaknesses identified
Targets never change; the shot has no flight or outcome animation; a second football game in the same batch.

## Creative opportunities
Keep the precision core (time a moving sight at targets inside a frame) but make it a different sport and a two-axis gesture: a Pocket Pals sports-day beanbag toss at a painted target wall.

## Planned improvements
Press-hold-release aiming (column, then height); holes of different size/value; events with a par; wind, sliding and spinning targets; Olli throws, Nori judges, the cast cheers.

## Implemented improvements
- One gesture, two decisions: the sight sweeps across the wall (eased ping-pong); PRESS fixes the column; while held the sight climbs and falls back; RELEASE throws at that height. Space works the same way.
- Bag flies in an arc toward the wall; outcome judged on arrival against the holes' current positions (so moving holes must be led): through the middle = SWISH (+50%), in = PLOP, clipping the rim = LUCKY (60%), else it thuds into the wood and slides down to the grass pile.
- Hot streak: every 3 consecutive holes adds +0.5× (to ×2.5); Olli flushes as he heats up.
- Six events, each 5 bags with a par shown as a progress bar: Warm-up → Quick sight → Windy (windsock + ghost ring showing the drift) → Sliding panel (moving bullseye) → Spinning wheel → Nori's Final (wind + slide), then endless "Encore" mixes with rising par and faster sights. Falling short of par ends the run ("Oops! Short of par" with events cleared, plops, swishes).
- Olli (thrower) holds the bag, concentrates (think → focus while holding), throws, cheers or droops; Nori waves a judge's flag on hits and bobs to the march; Bun, Momo, Pip and Bolt cheer from a bench (from the grass beside the wall in landscape).
- Sports-day backdrop: bunting, running-track lanes, throwing line, painted wall with sunburst.
- Live attract demo; `orient:"any"`.

## Test results
- Automated-gameplay: `tests/PhoneGameLab2/plop-shot.test.js` — a real mouse press/hold/release timed against the sweeping sight plops through the 25 hole (HUD sync, streak), a quick tap thuds into the wood, Space hold/release throws, beating par advances to the next event with fresh bags, missing par ends the run, clean restart. Passed 3× in a row (~21 s).
- Automated-technical: `node tools/smoke.js plop-shot` passes.
- Visual inspection: portrait/landscape/desktop at events 1, 5 and 6 checked; fixed an empty track area (bench of spectators), the event pill covering the sight marker in landscape, the sliding bullseye overlapping a 10 hole.
- Bugs found by the test and fixed: a quick tap threw from below the wall ("out"); `setPar` mutated the shared event table so a restart kept the changed par.
- Subjective playtest: informed judgement from code + scripted play, not a human playtest.

## Remaining issues
- Bags in the pile are cosmetic (no knock-ins); later variety is target motion and wind, not new rules.
- Par values are reasoned, not playtested.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Press-hold-release is tactile; leading the moving bullseye is satisfying |
| Mechanical depth | 7 | Hole value vs. size, swish vs. lucky, streak, wind compensation, par pressure |
| Game feel | 7 | Plop ring + stars, hit-stop on bullseyes, flag waves, crowd cheers |
| Visual identity | 7 | Sports-day palette, bunting, track, painted wall |
| Animation quality | 7 | Throw arc with shrink and shadow, pals react, bags slide down the wood |
| Audio quality | 6 | Plop pitch by hole value, combo ladder, whistle per event; stock presets |
| Controls | 8 | One gesture, keyboard parity, generous hole radius |
| Onboarding | 7 | Event 1 is static and slow; the sight's two phases are visible |
| Replayability | 7 | Six distinct events then endless encores, best score |
| Performance | 8 | Baked background and wall |
| Technical robustness | 8 | Clean restart (event table copied), resize, tests 3× |
| Overall polish | 7 | Complete loop with live attract |

## Next recommended action
Human playtest pars; consider bags on the ledge that later bags can knock through (a pool-like bonus).
