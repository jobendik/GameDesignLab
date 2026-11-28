---
id: PhoneGameLab2/clatter-castle
title: Clatter Castle
was: castle-craft / "Castle Craft"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Castle Craft": a sandbox. Tap a palette swatch, tap the canvas to stamp a 30 px coloured square (wall, door, flag,
bush, window) anywhere; swipe down to undo. Score = number of blocks.

## Baseline assessment
A 30-line placeholder (2/10): blocks float in mid-air, no goal, no consequence, no character, score rewards spam.
A pure sandbox would stay weak on replayability.

## Weaknesses identified
- Nothing to aim for and nothing can go wrong; placement has no physicality.
- No pal, no fiction, no progression or saved output.

## Creative opportunities
- Keep the toy box, add *toy statics*: blocks drop onto what is below and must balance.
- Let the pals be both clients and inspectors: the request is tested by the pal in person, so their weight matters.
- Keep the creative pride: photograph finished builds and keep a gallery.

## Planned improvements
Gravity placement with a tipping model, three pal requests with escalating constraints, limited pieces and stars,
hearts, gallery via `Lab.store`, attract scene that shows the gallery.

## Implemented improvements
- **Toy box**: six wooden pieces (block, brick, pillar, plank, arch, roof). Drag one up from the box (or select it and
  press in the meadow, or keys 1–6 + arrows + Space); a dashed outline shows exactly where it will land; pieces drop
  onto whatever is below. Undo returns the top piece. Roofs are slippery (nothing stays on them); pieces dropped
  into water sink; a piece dropped on a sitting pal bonks off and is lost.
- **Statics**: every piece's weight plus what it carries (split across its supports, at the contact points) must
  stay over its contact span. Pieces near the limit wobble with a red outline, a failing piece shakes for 0.4 s, then
  clatters down with its load (cascades at 0.14 s steps). Overhangs need counterweights.
- **Jobs** (endless, random after the first three): *Perch* — Olli flies onto your build at the star; his weight is
  added, so a cantilever that held can still tip; later the star sits over a pond. *Bridge* — Pip runs it for real,
  climbing at most one block; from job 3 the far bank is a 1- then 2-block cliff, so the bridge needs stairs.
  *Shelter* — rain falls on Bun (later Bun and Momo); every sitter must be covered at head height.
  Score: 100 + 25/job + 30 per spare piece + 50 for no losses; up to three stars; a failed test costs a heart.
- **Gallery**: a successful build is "photographed" (flash + shutter), pinned as a polaroid in the sky for the run,
  and the last six are stored with `Lab.store("gallery")`; the splash screen rebuilds them (dropping in) as a gallery.
- Pals as actors: the client walks in, waves, watches the dragged piece, panics at wobbles, then performs the test
  (flight with flapping, a run with hops and drops, a splash, sitting wet and sad in the rain, cheering on success).
- Sunny meadow (`Pals.backdrop`) with river, cliff bank, wooden toy-box tray; chill music, intensity rising during
  tests; thud pitch by piece mass, clatter pitch falling through a cascade.

## Test results
- Automated-technical: `node tools/smoke.js PhoneGameLab2/games/clatter-castle` — pass (60–61 fps).
- Automated-gameplay: `node tools/run-tests.js clatter-castle` — pass, three consecutive runs (~44 s): real mouse drags
  from the box; an overhang falls in the river, a balanced one holds, a brick on its tip tips both; Olli perches on a
  pillar+block (score, HUD, next job); Pip crosses a plank bridge; no bridge → splash and a heart; block on Bun
  bonks off; pillars + plank keep Bun dry; three failures end the run; Enter restart is clean.
- Visual inspection: portrait, landscape, desktop, splash/gallery, a shelter fail and success, and a 2-block-cliff
  bridge run were captured and checked; fixes after the first rounds: star drawn over pieces, bubble moved next to
  the speaker and hidden during tests, hearts moved off the ground, slot minimum size, duplicate Bun, verdict text vs.
  toast overlap, bottom hint replaced by in-world text.
- Solvability: the bridge escalation was checked by hand (1-block bank: block + plank; 2-block bank: step block +
  pillar + plank — verified by a scripted run); a 2-pillar cantilever with a block counterweight solves the
  hardest perch. Not every random perch was proven solvable.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Portrait has a lot of empty sky on early jobs (the scene is sized for the tallest star).
- Statics are a toy model (no friction, no sliding, debris passes through standing pieces).
- Random perch jobs at high levels may occasionally be very hard; the shelter job is the easiest of the three.
- In 844×390 landscape the pieces are ~29 px: playable, but small.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Watching the pal try your build is the payoff; collapses are funny, not punishing |
| Mechanical depth | 7 | Balance, counterweights, stairs for Pip, piece budget vs. stars |
| Game feel | 7 | Drop with squash and thud, wobble anticipation, cascading clatter, shutter flash |
| Visual identity | 7 | Wooden toy blocks in a sunny meadow with polaroids; shares the backdrop helper with other pals games |
| Animation quality | 7 | Pal walk-in, flight, run/hop, splash, debris tumble; pieces themselves are rigid |
| Audio quality | 6 | Mass-pitched thuds and clatter ladder, test whistle, music intensity; fairly sparse |
| Controls | 7 | Drag with exact landing preview, tap-select alternative, keyboard, undo; slots ≥ 58 px |
| Onboarding | 7 | First three jobs introduce one request type each; first job is nearly free; in-world prompt |
| Replayability | 7 | Random jobs with rising stars/cliffs/ponds, stars to optimise, gallery of builds |
| Performance | 9 | ≤ ~12 pieces, O(n²) statics per frame, baked sprites; 60 fps |
| Technical robustness | 8 | Clean restart, game-clock timers, resize re-layout in world units, gallery storage guarded |
| Overall polish | 7 | Complete loop with gallery splash; empty sky and toy physics keep it below 8 |

## Next recommended action
Human playtest of the late perch/bridge jobs for fairness; add a fourth request type (a blueprint silhouette from
Olli) to vary the mid-game, and let the gallery be browsed from the splash with arrows.
