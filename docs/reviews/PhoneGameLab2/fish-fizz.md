---
id: PhoneGameLab2/fish-fizz
title: Fish Fizz
was: bubble-shooter / "Bubble Shooter"
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
"Bubble Shooter": tap to fire a coloured circle into a square grid of circles; 3+ of a colour touching are removed.

## Baseline assessment
A 54-line placeholder (2/10): square grid, no aim preview, no hanging-drop rule, no pressure, no end, no feedback.
The Phone Game Lab sibling **Bramble Drop** is the genre-pure hex-grid slinger (creeping ceiling, hanging drops).

## Weaknesses identified
- Grid snapping is the whole game; without it nothing is left. No reason to care where a miss lands.
- No character, no fiction; a polished version would simply be Bramble Drop again.

## Creative opportunities
- Throw the grid away: under water, bubbles are *buoyant bodies* that crowd against a ceiling. Matching then creates
  motion (things float up to fill holes), and motion creates new matches — chain reactions come from physics.
- Nori ("precise, competitive, obsessed with fish") dives under the ice: fish trapped in bubbles are the reward.
  (Top-down ice already belongs to Ice Dunk, so this one is a side-on underwater scene.)

## Planned improvements
Buoyant circle-pile physics, armed cluster detection, fizz-chain scoring, shot-count seeping with chain relief,
fish/ice/puffer/jellyfish, swap, exact first-contact aim guide, Nori as actor, v2 loop and tests.

## Implemented improvements
- **No grid**: every bubble is a body with buoyancy, drag and soft collisions (120 Hz, 3 iterations). A shot flies
  straight (swept, wall bounces), shoves what it hits and joins the crowd.
- **Bursts and fizz chains**: 3+ touching of one colour burst once the contact has held for two checks (~0.2 s), so
  nothing pops on a glancing touch. Survivors float up; new clusters that form within 1.5 s raise the chain (×2, ×3…).
  A chain of 3 loads a **puffer** (area bomb) as the next shot.
- **Pressure**: every 6 shots (5 → 4 → 3 at later levels) a new row seeps through the ice and grows in, pushing the
  crowd down; shots that cause a chain of 2+ do not count. Pips under the rope show shots left; the ice creaks one
  shot before. A bubble resting below the rope for 1.8 s ends the dive. A nearly empty ceiling triggers a fresh row
  (+100 if you emptied it).
- **Fish** (≈1 in 7 bubbles) swim down to Nori when freed (+25 × chain). **Ice chunks** (level 2+) never match and
  break when a neighbour bursts. **Jellyfish** (level 3+, two at level 5) drift below the rope and bounce shots.
  Colours 4 → 5 → 6, each with its own glyph. Level every 45 bubbles.
- **Controls**: drag (or mouse-hover) to aim with a dotted guide and a ghost at first contact, release to blow; tap
  Nori to swap his two bubbles; arrows + Space / ↓ on keyboard. The next colour is always one that is present.
- **Nori as actor**: leans and looks along the aim, puffs up and squashes when he blows, watches fish swim in and gulps,
  cheers on chains, goes wide-eyed when the crowd nears the rope and tearful when it crosses.
- Identity: side-on teal water with light shafts, sand and kelp, a white ice sheet that carries the HUD, glassy
  bubbles; plops and a chain ladder in sound, music intensity follows chain and level. `orient:"any"` (positions are
  remapped on resize; bubble size follows stage area).

## Test results
- Automated-technical: `node tools/smoke.js fish-fizz` — pass.
- Automated-gameplay: `node tools/run-tests.js fish-fizz` — pass, three consecutive runs (stable opening crowd,
  buoyancy, real tap → burst → score with HUD in sync, fresh-row bonus, fish delivery, ice break, staged float-up
  chain ×2, six plain shots → seep, swap, keyboard aim/shoot, crowd below the rope → game over, clean restart).
  The test caught a real bug (HUD missed the +100 clear bonus), now fixed.
- Autopilot runs (aims at the lowest bubble of its colour): level 4 after ~45 s with the crowd growing (42 bubbles
  portrait / 62 landscape) — pressure builds with level as intended.
- Visual inspection: 390×844 (level 1 and level 4), 844×390, 1280×800.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Physics makes exact outcomes less predictable than a grid: precise players may miss guaranteed "snap" placement.
- Seeped rows have random colours and can burst by luck (they score, though they rarely chain).
- O(n²) collision is fine at the ~110-bubble capacity but was not profiled on a low-end phone.
- Landscape has a wide, shallow crowd (only ~5 rows to the rope), which plays faster than portrait.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Bursts that make the crowd surge upward are satisfying; chains feel earned yet surprising |
| Mechanical depth | 8 | Set-ups for float-up chains, shove shots, swap, puffer timing, ice/jelly obstacles, seep relief via chains |
| Game feel | 8 | Jiggle on impact, armed swell before a burst, bubbles/rings, hit-stop and shake scaled to chain |
| Visual identity | 8 | Under-ice scene with HUD on the ice sheet; glyph-marked glass bubbles |
| Animation quality | 8 | Living pile, growing seep row, swimming fish, reactive Nori, jelly wobble |
| Audio quality | 7 | Chain-pitched pops and ladder, creak warning, puffer boom; reactive puzzle music |
| Controls | 8 | Aim-anywhere drag with exact first-contact guide, mouse hover, swap on Nori, keys |
| Onboarding | 7 | Familiar genre, guide line, "tap Nori to swap" prompt; seep pips are unexplained but observable |
| Replayability | 8 | Physics variety, levels add colours/hazards/pressure, chain and fish chase |
| Performance | 8 | Baked sprites, ≤~120 bodies, 9k pair checks per step |
| Technical robustness | 8 | Fixed-step sim, swept shot, resize remap, clean restart; test-found HUD bug fixed |
| Overall polish | 8 | Complete loop, attract autopilot, friendly "Brr!" card |

## Next recommended action
Human balance pass on seep intervals per level; consider a spatial hash if capacity is ever raised.
