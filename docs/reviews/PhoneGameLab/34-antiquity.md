---
id: PhoneGameLab/34-antiquity
title: Antiquity
was: 34-stack-runner (Stack Runner)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
A runner drags side to side on a scrolling road, picks up blocks, and each gap consumes one block from the stack; with no
blocks left the runner falls in.

## Baseline assessment
54-line prototype: coloured rectangles on black, gaps spanned the whole road so steering never mattered for them, every
gap cost exactly one block whatever its size, the stack was only a number, the 60-row track simply ran out, no walls at
all despite the brief, one beep, "score" was the stack count. Overall 2/10.

## Weaknesses identified
No routing decision, no reason to carry more than one block, no telegraphing, no end goal, no identity, finite track.

## Creative opportunities
Make the stack a physical thing you are responsible for; make tolls differ per lane so steering is the game; give the
blocks a destination so carrying more is a choice with a price.

## Planned improvements
Five-lane oblique road; per-lane wall heights and canal widths with the price printed on them; springy stack that topples
when thrown about; shrines that pay for the haul; lintels; fair generator; desert-ruin identity; tests.

## Implemented improvements
- **Core loop**: relative drag (or arrows) steers a mason ant; marble blocks on the road stack on its head (cap 12, extra
  blocks pay 5). A wall costs its printed height — blocks fly off as steps and the ant hops over; a canal costs one
  stepping stone per tile, plopping in one by one as it skips across. Too few blocks in the lane you took ends the run.
- **Own twist — the wobble**: the stack is a damped spring that lags behind sideways motion. Strain = lean × height; past
  the limit the top blocks slide off. A tall haul needs smooth, early steering; a creak, shaking blocks, a "!" and the
  ant's widening eyes warn before anything falls.
- **Reason to be greedy**: each section ends at a shrine that takes all but two blocks for 10 × level points each, with a
  progress bar to the next one. Cheap lanes, block trails and smooth lines pull in different directions.
- **Variety**: basalt lintels (level 3+) knock off everything above their clearance without killing; back-to-back
  wall/canal pairs (level 4+); full-width lintels (level 5+); longer sections and rising pace to level 11.
- **Fairness**: the generator keeps a conservative block budget per section so every toll row has a payable lane; a lane
  you cannot afford turns dark with a struck-out number and dashed stone slots turn maroon; hugging a lane edge next to a
  payable lane counts as that lane; steering locks while hopping or skipping so a twitch cannot drown you.
- **Identity**: sun-baked oblique view — orange dunes, tan paving, terracotta walls with long indigo shadows, turquoise
  canals, white marble blocks, a chunky indigo ant with scurrying legs. Baked ground and block sprites.
- **Audio**: pickup pops rise with stack height, staggered knocks for steps, bubbles for stones, creak under strain,
  minor-key driving music whose intensity follows level and load.
- Attract mode runs the same pilot the test uses; clean reset; resize re-layout.

## Test results
- Smoke (`node tools/smoke.js 34-antiquity`): pass, 61 fps headless, no errors.
- Gameplay test (`tests/PhoneGameLab/34-antiquity.test.js`): pass — real mouse drag moves the ant the expected number of
  lanes, arrow keys steer, pickups join the stack (block accounting invariant holds), a toll costs exactly its printed
  price, the shrine delivers and pays 10 × level, a real side-to-side drag with twelve blocks spills some, arriving
  empty-handed at a toll ends the run, best saved, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (splash, first wall, canal, level 4 walls and lintels).
- Subjective assessment is an informed judgement from code and scripted play — no human playtest.

## Remaining issues
- A tall stack rises up the screen and hides about three tiles of the ant's own lane ahead of it.
- The built-in pilot reaches level 4+ comfortably; the difficulty curve for a human thumb is unverified, and the wobble
  thresholds were tuned by reasoning rather than by feel.
- Lintel clearance is conveyed by a small "max N" label and by the slab's height; it is the least legible obstacle.
- No new obstacle types after level 5; later levels only get faster and longer.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Sweeping up blocks, paying tolls and nursing a swaying tower to the shrine is a clear, satisfying loop |
| Mechanical depth | 8 | Lane price vs block trail vs smooth steering; greed is paid for by the wobble and by lintels |
| Game feel | 8 | Springy stack, hop-over steps, plopping stones, spills, shake/hit-stop on death |
| Visual identity | 8 | Sunlit oblique ruins with long shadows; distinct from the rest of the collection |
| Animation quality | 8 | Leaning tower, scurrying legs, hop arcs, tumbling blocks, golden delivery burst |
| Audio quality | 7 | Informative pitches and strain creak; all engine presets |
| Controls | 8 | Relative drag with damping, lane-edge forgiveness, keyboard; steering lock during crossings |
| Onboarding | 8 | Prices are printed on obstacles; one-line toasts at the first wall, canal, lintel and spill |
| Replayability | 7 | Procedural sections, haul chase; content tops out around level 5 |
| Performance | 9 | Baked sprites, bounded entity lists, 60 fps headless |
| Technical robustness | 8 | Clean restart, resize, pause; verified by test and smoke |
| Overall polish | 8 | Cohesive start to finish |

## Next recommended action
Human playtest of wobble limits and pace; consider fading the stack when it covers an approaching toll row.
