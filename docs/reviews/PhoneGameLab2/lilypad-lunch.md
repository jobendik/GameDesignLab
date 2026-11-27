---
id: PhoneGameLab2/lilypad-lunch
title: Lilypad Lunch
was: brick-breaker / "Brick Breaker"
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
"Brick Breaker": drag a paddle, a constant-speed ball reflects off it and removes rectangles; three lives.

## Baseline assessment
A 34-line placeholder (2/10): tunnelling collisions, the ball can be dragged into a flat loop, no feedback, no levels,
hardcoded layout. The finished Phone Game Lab sibling **Tea Break** already is the genre-pure paddle-and-ball game.

## Weaknesses identified
- Nothing but reflection: no aim skill beyond "be under the ball", no risk/reward, no character.
- Would duplicate Tea Break if merely polished.

## Creative opportunities
- Make the pal the ball: Momo is "laid-back, hungry, surprisingly athletic" — a frog on a lily-pad trampoline.
- Gravity arcs + eat-through targets turn "break one brick per touch" into "plan an arc through a whole row".

## Planned improvements
Gravity hop physics with pad-offset aiming, eat-through fruit with a per-hop gulp chain, hard fruit as the only
"bricks", bees, a power-up, tree-by-tree escalation, Momo as a fully reactive actor, v2 loop and tests.

## Implemented improvements
- **Different game from the sibling**: Momo falls under gravity and is launched to the same apex on every bounce; where
  he lands on the pad sets his sideways speed (edge = far), plus a little pad-velocity english. Ripe fruit is eaten on
  the way through (generous tongue reach), so the skill is threading arcs, not waiting for ricochets.
- **Gulp chain**: each fruit in the same hop is worth 10 × chain (cap ×8); landing with 4+ pays a "Feast!" bonus.
- **Green fruit** bonks Momo back (the one reflecting "brick"), then ripens. **Bees** patrol under the tree: a sting
  makes him dizzy, kills the chain and drops him straight down — you must still catch him. **Golden peach** drifts by
  once per tree: BIG MOMO for 8 s (bigger reach, crushes green fruit).
- **Escalation**: six fruit layouts cycle; tree 2 adds bees and green fruit, tree 4 swaying vines, trees 5/7 a smaller
  pad; a lily (life) returns every third tree; four times of day. A lonely last fruit drifts down to him after 7 s.
- **Momo as actor**: stretches with speed, squashes on the pad, tilts into his arc, looks where he is going, opens wide
  near fruit, tongue flicks out to each catch, beams on chains, panics when the pad is far, spins stars when stung,
  sinks behind the water on a miss and climbs back onto the pad.
- Layout from normalised fruit coordinates (`orient:"any"`: portrait, landscape and desktop all fill the stage),
  sub-stepped physics, mouse-hover/drag/touch/arrow keys, boing pitched by landing offset, rising gulp ladder,
  attract mode with an autopilot.

## Test results
- Automated-technical: `node tools/smoke.js lilypad-lunch` — pass.
- Automated-gameplay: `node tools/run-tests.js lilypad-lunch` — pass, three consecutive runs (real mouse / touch /
  keyboard pad control, autopilot play eating fruit with HUD in sync, chain 10+20, green-fruit bonk + ripen, bee
  sting, centre vs edge bounce, tree clear → tree 2 with a bee, three splashes → game over, clean restart).
- Visual inspection: 390×844 (trees 1 and 4), 844×390, 1280×800 looked at; reed colour, fruit size and the pad ripple
  were fixed after the first round.
- Subjective playtest: informed judgement from code and scripted/autopilot play, not a human playtest.

## Remaining issues
- Difficulty for a human is estimated, not measured: the autopilot never misses, so the life economy is untested by hand.
- The middle of the portrait stage is intentionally empty air (manoeuvring room) and looks a little bare on tree 1.
- No pad-size or speed option for accessibility; reduced-motion relies on the engine's automatic scaling.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Immediate bounce-and-gulp loop; a full-row gulp is a clear high point |
| Mechanical depth | 7 | Arc aiming by landing offset, chain routing, bees/green fruit to read; less depth than a full power-up brick breaker |
| Game feel | 8 | Squash/stretch, pad dip + ripple, tongue flick, hit-stop on bonks, splash burst |
| Visual identity | 8 | Canopy, cattails, lily pad, grumpy green fruit; four palettes |
| Animation quality | 8 | Momo's pose follows velocity and state; fruit sway, pop-in and reel-in |
| Audio quality | 7 | Boing pitch = landing offset, gulp ladder = chain, sting/splash distinct; funk bed scales with tree |
| Controls | 8 | Absolute drag/hover, keys, generous pad edge (+¾ body) and tongue reach |
| Onboarding | 8 | Momo launches himself above fruit; one toast about edge steering if nothing is eaten |
| Replayability | 7 | Layout cycle, random green fruit, bees and sway; plateaus after tree 8 |
| Performance | 9 | Baked background/fruit sprites, ≤70 fruit, bounded particles |
| Technical robustness | 8 | Sub-stepped swept pad test, resize remaps positions, clean restart |
| Overall polish | 8 | Complete loop, attract autopilot, friendly "Splash!" card |

## Next recommended action
Human tuning pass on hop speed and pad width; add one more late hazard (e.g. a drifting current) past tree 8.
