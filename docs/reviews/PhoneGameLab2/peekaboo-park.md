---
id: PhoneGameLab2/peekaboo-park
title: Peekaboo Park
was: cats-and-cans / "Cats & Cans"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Cats & Cans": a cat is shown under one of three cans, the cans swap a few times, tap the can with the cat.
`setTimeout` for flow, no end state, score = correct guesses.

## Baseline assessment
A 40-line placeholder (2/10) and a straight shell game — which the finished Phone Game Lab sibling **Swindle** already
does well (cups, feints, carousels). Cats are not in the Pocket Pals cast.

## Weaknesses identified
- One verb (follow the shuffle) that Swindle owns; no failure, no curve, no character.
- Timing via `setTimeout`; global script; no pal.

## Creative opportunities
- Keep "something is hidden under one of several covers, pick the right one", change the verb to hide-and-seek:
  the hiders are the pals themselves and they give themselves away with *tells*.
- Pip (bold, impatient) as "it"; every other pal hides and has its own giggle.

## Planned improvements
Count-in scatter, per-pal tells, spatial search cost, misses that cost time, decoys and spooked hiders later,
dusk timer, bench of found pals, full v2 loop, landscape support, tests.

## Implemented improvements
- **Loop**: Pip counts to three with his paws over his eyes; the park dims and the hiders scurry to bushes, pots,
  barrels, reeds, crates and stumps (you can half-track them). Then each hider gives a tell every ~2–5 s: a *peek*
  (the pal rises behind its cover — ears, eyes or head depending on round), a *rustle* (shake + leaves), or a
  *giggle* in its own voice (Bun's titter, Momo's croak, Nori's squeak, Olli's hoot, Bolt's beeps) with drifting
  notes. Tap a spot: Pip dashes there (travel time grows with distance; one tap is buffered) and rummages.
- **Stakes**: a wrong spot costs 2 s of daylight and the streak; a find pays 100 + round bonus + streak bonus +
  speed share; clearing a round pays 10 per second left. Dusk (timer) ends the run.
- **Curve**: 2 → 5 hiders, 6 → 13 spots, darker and faster count-ins, shyer peeks; from round 3 wind gusts rustle
  every bush in a visible sweep, from round 4 birds land on spots and a hider next to a wrong search may get spooked
  and dash to a new spot (visible streak + giggle), from round 5 a squirrel's tail pokes out of empty spots.
- **Actors**: Pip counts (eyes shut), dashes, rummages, scowls at empty spots, sweats near dusk, cheers finds, droops
  when the hiders win; found pals leap out and fly to the bench at the top where they cheer; at dusk the remaining
  hiders pop up laughing.
- Identity: striped golden-hour lawn with hedge, bench and flowers that tints toward violet as the daylight bar
  drains; depth-sorted, baked cover sprites; puzzle music whose intensity follows the remaining light.
  `orient:"any"`.

## Test results
- Automated-technical: `node tools/smoke.js PhoneGameLab2/games/peekaboo-park` — pass (61 fps).
- Automated-gameplay: `node tools/run-tests.js peekaboo-park` — pass, three consecutive runs (~20 s): taps during the
  count are ignored; tells occur over time; a real tap on an empty spot costs ≥ 2 s and the streak; real taps on the
  hiders' spots find them (score, streak, HUD); round clear → round 2 with more pals and spots; dusk ends the run,
  best recorded; Enter restart is clean and a fresh find scores.
- Visual inspection: portrait count-in (scatter visible through the dim), a peek tell on desktop, round 6 with wind and
  a giggle in portrait/landscape, splash. Fixes after review: warm band behind the HUD (contrast), slower spread-out
  scatter, cover size cap on desktop, spots kept clear of the bench in landscape, shorter tagline.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- No keyboard play (tapping spots only).
- The giggle notes are subtle; with sound muted the game relies on peeks and rustles (still fully playable).
- Portrait round 1 has only six spots on a tall lawn and looks sparse.
- Tell frequency is random per hider; an unlucky hider can stay quiet for ~5 s in late rounds.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Watching for the twitch then pouncing is satisfying; the count-in peek adds a memory layer |
| Mechanical depth | 7 | Tell reading vs. decoys, travel cost, misses cost time and can spook hiders, streak bonus |
| Game feel | 7 | Dash, rummage shake, leap-out burst, combo ladder, distinct voices |
| Visual identity | 7 | Golden-hour lawn turning to dusk, bench of cheering pals; covers are simple shapes |
| Animation quality | 7 | Scatter hops, peeks behind cover, dash streaks, arc to the bench |
| Audio quality | 7 | Per-pal giggles carry identity, rising find ladder, gust whoosh, music intensity with dusk |
| Controls | 7 | Generous cover hit areas, buffered tap; no keyboard |
| Onboarding | 7 | Count-in caption ("peek!"), first-round prompt, round 1 has two loud hiders |
| Replayability | 7 | Random layouts, pals and tells; decoys and spooking keep later rounds fresh |
| Performance | 9 | Baked lawn and cover sprites, ≤ 13 spots; 61 fps |
| Technical robustness | 8 | Game-clock timers, clean restart, resize-safe normalized positions, exposed hooks |
| Overall polish | 7 | Complete loop with attract demo and friendly ending |

## Next recommended action
Human playtest for tell frequency and decoy fairness; consider a guaranteed tell per hider within 4 s and an
optional "listen" mode that makes giggles directional with stereo panning.
