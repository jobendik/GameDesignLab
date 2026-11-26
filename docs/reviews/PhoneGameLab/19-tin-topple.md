---
id: PhoneGameLab/19-tin-topple
title: Tin Topple
was: 19-cannon (Cannon)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Drag from a cannon to set angle and power, release to lob a ballistic shot at targets; limited shots.

## Baseline assessment
60-line prototype: five bullseye circles scattered at random (often overlapping or unreachable), a grey rectangle
cannon, a full-length trajectory preview that removed all skill, ten shots, one beep. Overall 2/10.

## Weaknesses identified
Targets had no relation to each other, so there was no puzzle; the full preview solved every shot; nothing reacted to
being hit; random layouts could be unfair; no levels, no stakes, no identity. It also shared its whole verb with the
archery prototype next door.

## Creative opportunities
Make the cannon a demolition puzzle: structures whose materials behave differently, so one well-placed ball can do
the work of three; make the ball count the score; give it a toy-box look that is nothing like the archery meadow.

## Planned improvements
Deterministic fixed-step world; card/wood/steel/spring/BANG blocks; support-loss drops and squashing; authored forts
with a ball allotment; spare-ball and multi-bot scoring; three lives; tin-bot targets with character; partial preview
plus last-shot ghost; toy-room art and funk music.

## Implemented improvements
- **World rules** (120 Hz, pure data): card breaks on any solid hit, wood takes two (or one fast one), steel deflects,
  spring blocks return the ball with extra speed for bank shots, BANG boxes explode and chain. A destroyed block lets
  the ball punch through with reduced speed. Anything that loses its support falls straight down; falling blocks
  squash bots, heavy landings break card and set off BANG boxes, bots that drop more than a block are bonked.
- **Ten authored forts** teaching one idea at a time (stack → house of cards → BANG → steel wall + lob → spring bank →
  drop the slab → thread the gap to a chain → high shelf → two-storey house → finale), each verified by a dry-run
  solver that steps the same rules: all are solvable inside their allotment and stable until hit.
- **Stakes and score**: 2–5 balls per fort; spare balls bank +300 each; bots are 500 × the number bonked by that ball;
  running out costs one of three lives and rebuilds the fort; clearing fort 10 wins with a life bonus.
- **Aiming**: pull back anywhere (or arrows + Space); the guide shows only the first ~0.6 s of flight, the previous
  shot stays as a faint dotted ghost so you can correct from it; rolling balls only nudge bots (no cheap roll kills).
- **Feel**: cannon recoil squash and wheel kick, smoke and muzzle sparks, per-material impact sounds (wood knock, tin
  clang, spring boing, card snap), falling blocks tilt and thud with dust and shake, BANG gets flash, ring, hit-stop;
  bonks pop into rings and squares with a rising chime per multi-kill; forts drop in with a staggered bounce.
- **Identity**: striped nursery wallpaper, curtained window, wooden table with drawers, painted blocks with embossed
  shapes, wind-up tin bots that track the ball, raise their arms and rattle their antennae when it comes close.
- Works at any aspect (world fits width in portrait, height in landscape); splash shows the first fort.

## Test results
- Smoke (`tools/smoke.js 19-tin-topple`): pass, 61 fps headless, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/19-tin-topple.test.js`): pass (34 s) — tap does not fire; solver-aimed real
  drags bonk bots and score; fort clear banks spare balls and builds fort 2; Space fires; wasting all balls costs a
  life and rebuilds; third loss → game over with best saved; clean restart; clearing fort 10 → win.
- Level audit (scratch script over the game's `plan`/`stats` hooks): 10/10 forts cleared by a greedy solver within
  their allotment; 0 forts unstable at rest; share of the 825-shot grid that one-shots a fort ranges from 24–43 % on
  the three tutorial forts down to 0–6 % on forts 4, 5, 8, 9 and 10 (fort 7's chain is 13 %).
- Screenshots inspected at 390×844, 844×390, 1280×800 (aiming, explosion, clear banner, forts 1/3/5/9/10).
- Feel judged from code and scripted play only — no human playtest.

## Remaining issues
- No rotation or toppling: blocks fall straight down. Readable and deterministic, but less dramatic than rigid bodies.
- Ten forts only; after a win the replay value is the score (spare balls, multi-bonks), not new content.
- In portrait the world is scaled to 0.8 — bots are ~21 px tall; fine on a phone but not generous.
- Fort 7 can be chain-cleared by any lob into the gap; difficulty order past fort 5 is by design intent and solver
  statistics, not human data.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Chain reactions and squashes deliver; each fort is a small aha |
| Mechanical depth | 8 | Five materials, support logic, bank shots, ball economy, multi-bonk scoring |
| Game feel | 8 | Recoil, per-material audio, tilt-and-thud drops, scaled explosion feedback |
| Visual identity | 8 | Distinct toy-room look; bots have personality |
| Animation quality | 7 | Bots react, forts drop in, blocks tilt; no true tumbling |
| Audio quality | 7 | Material-specific impacts and combo chimes; cannon is punchy; music reacts mildly |
| Controls | 8 | Pull anywhere, ghost of last shot, keyboard alternative, tap-safe |
| Onboarding | 8 | Gesture hint, three generous tutorial forts introduce one rule each |
| Replayability | 6 | Fixed forts; score chase only |
| Performance | 9 | Baked block sprites, tiny world, 61 fps headless |
| Technical robustness | 9 | Deterministic rules shared by game and solver; clean restart/resize; game-clock timers |
| Overall polish | 8 | Cohesive from splash to win card |

## Next recommended action
Human playtest of forts 5–10; add a second pack of forts (or a daily generated one) and a star rating per fort.
