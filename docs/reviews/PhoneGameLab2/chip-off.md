---
id: PhoneGameLab2/chip-off
title: Chip Off
was: ice-smash / "Ice Smash"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Ice Smash": a 6×6 grid of ice squares; a tap shatters the 3×3 around it; 15 taps; clear the grid to win.

## Baseline assessment
2/10. A ~25-line prototype: flat cyan squares, no animation or sound, v1 engine calls, and no real decision — any
reasonable tapping pattern clears the grid.

## Weaknesses identified
- No decisions, no identity, no character, no fail tension beyond counting taps.
- Ice siblings exist: Pack Ice (Nori slides polyomino blocks into a rink) and Ice Dunk (Nori belly-slides into a hole);
  Cold Snap in Phone Game Lab is an ice-breaking shooter. A third Nori ice game or another "smash everything" would collide.

## Creative opportunities
- Turn "break ice blocks with limited taps" into carving: an ice-sculpture contest where the ice you must keep is
  drawn as a chalk plan, and gravity does most of the smashing for you.
- Pip (bold, loves dares) with a mallet; Olli, Nori and Bolt as judges holding up score cards.

## Planned improvements
Support/gravity rule with chunk falls, hold-to-preview, chisel budget from a greedy solver, judged results with
snowflake lives, shape progression, hard ice and sweets, Pip + judges as actors, full v2 loop, tests.

## Implemented improvements
- **The rule (the twist)**: the block stands on a wide stand; Pip has scored the chalk line, so spare ice is held up
  only by spare ice connected down to the stand, and the sculpture only by sculpture. Chip one cell and every spare
  piece no longer connected falls as a rigid chunk, tumbles and shatters on the snow. The skill is finding the
  necks/feet whose removal drops the biggest slabs. Chipping a sculpture cell (or its neck) drops sculpture too.
- **Hold to preview**: pressing a cell jiggles it and tints exactly what would fall (gold = spare, red = sculpture) with
  a "N blocks fall" / "−N sculpture!" label; release chips, slide off cancels. Keyboard cursor + space.
- **Budget and judging**: chisels = what a greedy carver needs + 2–3; a clock (45 s → 28 s). The sculpture ends when no
  spare ice is left, chisels run out or time is up. Three judges flip up cards (10 − 1.5 per lost sculpture block −
  0.6 per leftover spare block, each judge a little stricter/kinder); points = card average ×20 + chisels left ×10 +
  seconds left ×2. Average under 6 melts one of three snowflakes.
- **Scoring in play**: each falling chunk pays 5 per block, doubled for 5+ ("Timber!"); frozen sweets in spare ice pay
  +40 if they fall in a chunk (Pip catches them) and are lost if chipped directly.
- **Progression**: eight hand-made shapes (Heart, Pine Tree, Mushroom, Fox Head, Snowman, Fish, Duck, Rocket — all
  validated so both lattices start supported), then random later shapes; hard blue ice (two hits) from the third
  sculpture growing to 8 cells; more sweets; shorter clocks.
- **Actors**: Pip hops to the side of each chip and swings a mallet, gasps at lost sculpture, cheers big chunks and
  good marks; the judges watch the block, gasp, go "wow" at Timber!, and react to their own cards.
- Art/audio: twilight winter fair with string lights, stars, snow and lilac hills; baked glassy ice tiles (white
  sculpture, pale-blue spare, deep-blue hard), dashed pink chalk outline; glass chips pitched by height, crunch/boom
  landings scaled by chunk size with shake and hit-stop, ticking clock, march music tied to the clock. Live attract
  scene where a bot carves. `orient:"any"` with the judges' panel at the side in landscape.

## Test results
- Automated-gameplay: `node tools/run-tests.js chip-off` — pass, three consecutive runs (real tap chips and spends a
  chisel; preview predicts a full drop exactly; real mouse hold + release chips; all spare falls, sculpture stands,
  chunk score; judges' cards; next sculpture; chipping the Heart's neck drops its top; hard ice two hits; sweets caught
  in a chunk; time-out with spare ice melts a snowflake; three end the run; clean restart).
- Automated-technical: `node tools/smoke.js chip-off` — pass, 61 fps.
- Visual inspection: 390×844, 844×390, 1280×800, splash, the judging moment and a hold preview captured and checked
  (three rounds). Found and fixed: the first support rule (plinth under the base only, ice glued to the sculpture)
  almost never dropped anything — replaced by the scored-line rule; two shapes were disconnected from their stems
  (whole sculpture fell on the first chip) — all shapes are now validated; Pip moved under the block in portrait.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Once the rule is understood the optimal cuts are fairly readable; the chisel budget (+2) is what keeps it tense, and
  a greedy solver is not optimal, so experts may find budgets generous.
- Landscape panel text is small at 844×390.
- After the eighth shape the later sculptures reuse the same shapes (random), only harder ice and a shorter clock.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Dropping a whole slab with one chip is very satisfying; judges' cards land well |
| Mechanical depth | 7 | Cut planning, chisel economy, sweets vs. direct chips, hard ice, clock |
| Game feel | 8 | Preview jiggle, chunk tumble + size-scaled crunch/boom/shake/hit-stop |
| Visual identity | 8 | Twilight winter fair, glassy tiles, pink chalk plan — unlike the bright Nori ice games |
| Animation quality | 7 | Rigid chunk fall/rotation, shatter, Pip hop + mallet, judges' cards pop |
| Audio quality | 7 | Pitch by height and chunk size; march intensity follows the clock |
| Controls | 8 | Tap to chip, hold to preview, slide off to cancel; keyboard cursor |
| Onboarding | 7 | Chalk outline reads at once; preview teaches the rule; Pip's tips |
| Replayability | 6 | Eight shapes + random hard ice/sweets; shapes repeat later |
| Performance | 8 | Baked tiles/background, small grid; smoke 61 fps |
| Technical robustness | 8 | Layout recomputed on resize; restart clean; test passes 3× |
| Overall polish | 7 | Complete contest loop; landscape panel small |

## Next recommended action
More shapes (or procedurally generated silhouettes) and a tighter budget mode ("par" taps) for experts.
