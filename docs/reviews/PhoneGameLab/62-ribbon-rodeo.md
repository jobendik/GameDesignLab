---
id: PhoneGameLab/62-ribbon-rodeo
title: Ribbon Rodeo
was: 62-slither (Slither)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Free-steering snake in an arena of AI snakes: eat orbs to grow, die when your head touches another body.

## Baseline assessment
48-line prototype named after and shaped like a commercial .io game: one-screen wrap-around field, three AI lines that
turned at random, no camera, no boost, no end to a run, single beep, flat strokes on black. Overall 2/10.

## Weaknesses identified
No identity of its own; bots with no intent; no risk/reward verb; no session arc, no score beyond orb count; steering only
toward the finger (which covers the snake); nothing to learn after 20 seconds.

## Creative opportunities
Make closing a loop the *verb* instead of a slow side-effect; give bots personalities you can read from their faces;
give the round a clock and a shrinking arena so every run builds to a finish.

## Planned improvements
Original kite-festival identity; floating stick with dash-for-tail; lasso mechanic; four bot temperaments with honest,
fallible sensing; 2:30 round with storm front; camera/zoom, minimap, leaderboard; reactive audio.

## Implemented improvements
- **Identity**: fighter kites with candy-striped ribbon tails over a baked patchwork valley (parallax fields, drifting
  clouds, kite shadows, a storm wall of cloud puffs). Sunny light theme, warm tint as sunset approaches.
- **Hook — the lasso**: crossing your own ribbon is harmless and closes a loop; bows inside count double and rival noses
  inside are snipped for double points. Encircling is now an instant, readable play instead of a waiting game.
- **Dash**: drag past the ring (or second finger / mouse button / Space) for +80 % speed, burning 6 tail per second that
  is dropped as bows behind you.
- **Bots**: grazers, scavengers, hunters and daredevils. They pick a want (bow, death pile, a rival's nose to cut off),
  then choose the clear heading nearest to it with four-sample feelers. Mistakes come from feeler length, reaction time,
  wobble and occasional blind ticks. Pupils look where they intend to turn, hunters grow brows and show "!" when locked on
  you. About 30 bot deaths per round in simulation, so the sky keeps changing.
- **Arc**: 150 s festival; storm front shrinks the arena from 0:25, respawns arrive longer and more predatory; podium
  bonus (+300/150/75) for surviving to sunset; win card for finishing #1. Death ends the run immediately.
- **Readability**: camera look-ahead, zoom tied to tail length, minimap with the storm radius, live top-3 leaderboard,
  spawn protection (blinking), generous nose hitbox, nose-to-nose resolved by tail length.
- **Feel/audio**: pentatonic pickup ladder, wind loop that follows speed, snip = snap + chime + hit-stop, lasso flash,
  music intensity from the clock and the nearest rival.
- Controls: floating touch stick, mouse (pointer = heading, button = dash), keyboard (arrows/A-D turn, Space/W dash).

## Test results
- Smoke (`tools/smoke.js 62-ribbon-rodeo`): pass.
- Gameplay test (`tests/PhoneGameLab/62-ribbon-rodeo.test.js`): pass — bots move, mouse steering, eating, dash cost,
  lasso of bows via pulsed keyboard circle (double score), rival snipped on our ribbon, death on a rival ribbon, clean
  restart, sunset finish with podium bonus.
- Headless full-round simulations on three seeds (bot death rate, growth, a non-reacting player dies in 27–74 s).
- Screenshots inspected at 390×844, 844×390 and 1280×800 (play with stick, splash).
- Subjective assessment from scripted play only (no human playtest).

## Remaining issues
- Bots never lasso; only the player has the trick (intentional, but a rival "roper" would add late-game variety).
- Dash-by-dragging-far can be triggered by an over-eager thumb; the ring and DASH label mitigate it.
- The field tile repeats visibly on desktop; ribbon tails pop slightly when a kite respawns off-screen.
- Balance (bot aggression curve, lasso minimum area) tuned by simulation, not by people.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Steering feels good immediately; lasso gives a goal beyond "eat" |
| Mechanical depth | 8 | Dash economy, cut-offs, loop size vs risk, arena shrink, podium maths |
| Game feel | 8 | Pickup ladder, snip hit-stop, lasso flash, wind loop, look-ahead camera |
| Visual identity | 8 | Striped ribbon kites over patchwork fields; nothing like the source |
| Animation quality | 7 | Flapping heads, eyes, bobbing bows; deaths are a burst, not a tumble |
| Audio quality | 7 | Informative ladder and wind; limited variety of event sounds |
| Controls | 8 | Stick/mouse/keys all first-class; dash on one thumb |
| Onboarding | 7 | Three lines + hint; lasso needs one accidental loop to click |
| Replayability | 8 | Random bots and spawns, score chase, podium, short rounds |
| Performance | 8 | ~0.05 ms per sim step headless; bbox-culled collision and drawing |
| Technical robustness | 8 | Clean restart, resize safe, particles handled across game over |
| Overall polish | 8 | Complete loop with attract scene; minor visual repeats |

## Next recommended action
Human playtest of dash-ring sensitivity and bot aggression; consider a rival that ropes and a tumble-down death animation.
