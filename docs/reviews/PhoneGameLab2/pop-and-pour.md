---
id: PhoneGameLab2/pop-and-pour
title: Pop & Pour
was: fruit-boom / Fruit Boom
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Fruit Boom": swipe through flying fruit to slice it, avoid bombs. Coloured circles, a white trail, one-hit bomb death.

## Baseline assessment
2/10 — a direct knock-off of a commercial slicer: blades and bombs, no art, no progression, no pals.

## Weaknesses identified
Pure "hit everything" loop with no decisions; bombs are the only rule; violent fiction that does not fit the cozy collection; finished sibling *Facet* already owns "cut everything except the red stone".

## Creative opportunities
Keep the swipe-through-flying-things verb but change the rule: make the player *choosy*. A juice bar where drinks are layered gives every pop a right and wrong answer and gives the pal a job.

## Planned improvements
Bun's seaside juice stand; customers order layered drinks; only the next layer may be popped; bees as the hazard; patience + walk-outs as the fail state.

## Implemented improvements
- Swipe through fruit to POP it; its juice arcs into the glass and the layer fills with a wavy surface.
- Orders shown as a ticket bubble (bottom layer first, with fruit icons — not colour-only), the next layer pulses, and a fruit cue floats by the glass.
- Wrong fruit = "Blech!": the drink is poured away, combo reset, patience knocked. Unneeded fruit can simply fall — no penalty — so the skill is picking the right fruit out of a crowded toss.
- Two or more correct layers in one swipe = DOUBLE POUR bonus; combo multiplier (every 3 correct pours, up to ×5); serving pays per layer + a tip from remaining patience.
- Bees drift through from the 3rd drink; swiping one stings Bun and spills the glass.
- Customers Pip (impatient), Momo, Nori, Olli (patient), Bolt with their own patience; they walk in, fret (angry + flushed) when patience is low, walk off happy with their drink (hearts) or sad. Three walk-outs → "Oops! Closing time".
- Progression: drinks grow from 2 to 5 layers; banana then plum come into stock (crates on the counter show stock), rainbow starfruit wild layer, busier tosses, more bees; banners at milestones; funk music intensity follows level and patience.
- Live attract demo behind the splash; `orient:"any"`.

## Test results
- Automated-gameplay: `tests/PhoneGameLab2/pop-and-pour.test.js` — real mouse swipes: right layer scores + HUD, wrong layer spills, double pour bonus, completing an order serves, bee spills, three walk-outs end the run, clean restart and tosses resume. Passed 3× in a row (~11 s).
- Automated-technical: `node tools/smoke.js pop-and-pour` passes.
- Visual inspection: portrait/landscape screenshots checked; fixed the glass overlapping Bun, a stray stroke across the glass, small pals and an empty counter (now stock crates).
- Subjective playtest: informed judgement from code + scripted play, not a human playtest.

## Remaining issues
- Landscape stage is short: pals and ticket are smaller than in portrait.
- Bun holds an invisible cup pose ("hold" arms) while the glass sits on the counter.
- Toss weighting (55% needed fruit) is tuned by reasoning, not by human play.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Selective popping under a patience clock is tense and readable |
| Mechanical depth | 7 | Order sequencing, double pours, bees in the toss, patience vs. combo |
| Game feel | 7 | Juice bursts, ring, pour arc, wavy fill, pitch rises with layer count |
| Visual identity | 7 | Striped awning, beach, procedural fruit with distinct silhouettes |
| Animation quality | 7 | Customers walk/fret/leave, Bun reacts, fill eases |
| Audio quality | 6 | Rising pop pitch per layer, combo ladder, chime on double pour; stock presets |
| Controls | 8 | Generous hit radius, swipe ribbon, no penalty for empty swipes |
| Onboarding | 7 | First drinks are 2 layers of 3 fruits; ticket + cue make the rule visible |
| Replayability | 7 | Growing orders, new stock, varied customers |
| Performance | 8 | Baked fruit sprites, bounded entities |
| Technical robustness | 8 | Clean restart, resize, smoke + 3× tests |
| Overall polish | 7 | Complete loop with live attract scene |

## Next recommended action
Human playtest of patience timings; consider a second glass at the late game (two customers at once).
