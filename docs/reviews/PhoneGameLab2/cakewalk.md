---
id: PhoneGameLab2/cakewalk
title: Cakewalk
was: cake-tower / "Cake Tower"
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
"Cake Tower": a rectangle swings left and right at the top of the screen; tap to drop it on the pile, the overhang is
sliced off, a total miss ends the run.

## Baseline assessment
A 30-line placeholder (2/10): flat rectangles on a dark background, no feel, no curve, no character — and the same
tap-to-drop stacker as the finished Phone Game Lab sibling **Teeter Torte** (pendulum crane, tipping cake).

## Weaknesses identified
- One input, one decision (when to tap); width slicing is the only consequence. No progression, no identity.
- Rebuilding it faithfully would duplicate Teeter Torte.

## Creative opportunities
- Keep "build a tall cake from falling layers", change the verb: the *pal carries the cake* and you walk him under
  each layer. The stack then has inertia, so how you move matters as much as where you end up.
- Momo (laid-back, hungry, surprisingly athletic) as the waiter balancing a plate on his head; Bun the baker tossing
  layers out of the kitchen hatch.

## Planned improvements
Catch-and-carry stacker with a springy tower, recipes that end in a cherry, hearts, late-game layer types and a hazard
to step away from, pals as actors, full v2 loop, landscape support, tests.

## Implemented improvements
- **New core**: drag (or arrow keys) to walk Momo; each toss shows a dashed drop line and a ring at the height of the
  cake top. Every layer is a damped spring on the one below (stiffness falls with height), so the tower lags when
  Momo sets off and whips when he stops. A layer whose centre passes the edge beneath slides off with everything
  above it. Tuned with a numeric model: a 5-layer cake survives a full dash, an 8-layer one does not.
- **Catch quality matters**: off-centre catches sit off-centre and eat sway margin; a perfect catch (within 8 u)
  snaps straight, calms the sway, and builds a streak bonus with a rising chime. Edge hits bounce off ("so close!").
- **Structure**: each cake is a recipe (3 → 8 layers, then the cherry); served cakes fly to the shelf beside the
  hatch; neatness sets the serving bonus and a neat cake (≥80 %) wins a heart back. Three hearts; a splat or a topple
  costs one.
- **Late-game variety**: jelly layers (softer spring), wide wafers (steadier, bigger target), pepper pots aimed at the
  cake (step away or ACHOO — a sneeze kicks the whole tower), two things in the air from cake 5, shorter flights and
  wider throws.
- **Pals as actors**: Momo leans into his run, squashes on every catch, watches the falling layer, sweats and panics
  as the red-flagged layer nears the edge, ends up wearing the cake; Bun winds up with the next layer overhead
  (preview), gasps at splats and cheers perfects.
- Mint-tile kitchen identity (baked background, awning hatch, shelf of served cakes), baked layer sprites with icing
  drips, march music whose intensity follows height and danger, creak ticks near the limit, attract-mode demo player,
  world in virtual units so resize/rotate never disturbs the cake, `orient:"any"`.

## Test results
- Automated-technical: `node tools/smoke.js PhoneGameLab2/games/cakewalk` — pass (61 fps).
- Automated-gameplay: `node tools/run-tests.js PhoneGameLab2/cakewalk` — pass, three consecutive runs (perfect
  catch + score, real drag to a far layer, miss costs a heart, pepper sneeze vs. dodge, cherry serves and lengthens
  the recipe, real pointer jerks topple a 7-layer cake, last heart ends the run, clean restart).
- Visual inspection: 390×844, 844×390, 1280×800 and the splash were captured and checked (two rounds; plate height,
  landscape scale and the empty wall were fixed after the first).
- Balance: a scripted follower (speed-capped, 80 ms reaction) lasts 50–77 s and reaches cake 3–5.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- On an 844×390 phone Momo is ~50 px tall; playable (the stage is wide) but the cake is small.
- The finger can cover Momo in portrait if the player drags on him rather than below the floor line.
- Only the top layer's sway is truly readable; mid-tower danger is shown by the red outline rather than felt.
- Keyboard control is serviceable, not as fine as a drag.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Catching is immediately readable; carrying a swaying 7-layer cake to a far ring is tense and funny |
| Mechanical depth | 8 | Speed vs. sway, catch accuracy vs. margin, pepper dodges while loaded, neatness for hearts |
| Game feel | 8 | Momentum on Momo, squash wave down the stack, lean, perfect ring + chime ladder, splats and stains |
| Visual identity | 8 | Mint-tile kitchen, awning hatch, frog waiter with a plate on his head; distinct from Teeter Torte |
| Animation quality | 8 | Springy tower, wind-up toss, serve arc to the shelf, debris tumble, pal moods |
| Audio quality | 7 | Pitch falls with height, combo ladder, creak ticks with danger, march music intensity |
| Controls | 8 | Direct drag with eased momentum, keys supported, generous catch window (centre over the top) |
| Onboarding | 8 | First layer drops straight onto the plate; ring + two in-world prompts teach the rest |
| Replayability | 8 | Random throws/recipes, escalating cakes, streak and neatness to optimise |
| Performance | 9 | Baked sprites, ≤ 9 springs at 120 Hz, bounded particles; 61 fps in smoke |
| Technical robustness | 8 | Unit-space world survives resize, clean restart, game-clock timing only, exposed hooks |
| Overall polish | 8 | Complete loop with live attract scene and a friendly "Splat!" card |

## Next recommended action
Human playtest of the sway tuning on a real phone (drag feel at 60 Hz touch sampling); consider a slightly larger
landscape scale by letting the hatch slide off-centre.
