---
id: PhoneGameLab2/ice-dunk
title: Ice Dunk
was: basketball (Basketball)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Flick a ball into a moving hoop against a 30-second clock. Drag back, release, gravity arc, +1 per basket.

## Baseline assessment
34-line placeholder: orange circle, a yellow line for a hoop, a hitbox that counted any pass through a strip, a
slingshot with no preview, one beep, no best score. Overall 2/10.

## Weaknesses identified
No rim/physics, no feedback, no identity, no progression; and the genre-pure arced take already exists as a finished
sibling (`PhoneGameLab/39-blacktop-buzzer`: side-on, gravity arcs, rim/net physics, on-fire streak, wind).

## Creative opportunities
Make the pal the ball. Nori "is obsessed with sliding and fish": seen from above he belly-slides across a frozen pond
and dunks *himself* into a fishing hole. No gravity — the skill becomes angles, bank shots and routes.

## Planned improvements
Top-down slide physics with banks; time-attack with time won back per dunk; bank multipliers; fish to route through;
rinks that change every four dunks; push or pull-back aiming plus keyboard; full pal animation states.

## Implemented improvements
- Fixed-step (240 Hz) slide physics: constant launch speed, gentle friction, restitution off snowbanks and rounded ice
  blocks, snowman bumpers that re-energise the slide. Misses end when he runs out of speed: dizzy stars, hop home.
- Aim by dragging anywhere — push toward the target *or* pull back like a slingshot (mode is locked by the first
  movement) — or arrow keys + Space. A dotted guide shows the first 300 px and a short stub after the first bank, so
  near holes are easy and long/banked lines need judgement. A launch released during the return is buffered.
- Scoring: dunk 10 × (banks + 1, up to ×4 "TRICK SHOT") × streak multiplier (every 3 dunks, up to ×3); bumper +5;
  fish +5 and +0.5 s, golden fish by the side walls +15 and +1 s — longer routes are worth planning.
- Clock: 40 s, a dunk returns 3.0 s shrinking to 1.5 s by rink, cap 60; a slide still moving at 0:00 can be a
  buzzer-beater. Last 8 s tick and pulse.
- Rinks (every 4 dunks, banner + one-line toast): ice block → drifting hole → sliding ice → snowman bumpers + slider →
  smaller hole with three randomised obstacle patterns, faster movers.
- Nori acts: leans and squashes while you aim and looks down the line, stretches on launch, squashes and goes "wow"
  on each bank, spins into the hole with a splash, swims back as a shadow under the ice, pops out at the start
  holding a fish and cheering; dizzy then glum on a miss; scared in the last seconds. Momo and Olli watch from
  behind the snowbank and cheer, gasp or wince.
- Identity: pale ice with skate scratches and light bands, fat white snowbank, pines in the margins, orange flag and
  fish, navy clock pill. Slide noise loop tied to speed, knock pitch rising per bank, splash + chime, "march" music
  that tightens as the clock drains. Live attract scene.

## Test results
- Smoke (`tools/smoke.js ice-dunk`): pass.
- Gameplay test (`tests/PhoneGameLab2/ice-dunk.test.js`): pass — real push-drag dunk (+10, time back, HUD), real
  pull-back drag dunk, one-bank route found by simulation scores double, block stops the direct line and the miss
  resets the streak and returns Nori, fish pickup, level 2 after four dunks, keyboard launch, clock-out end + best,
  clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (rinks 1–4, aiming, mid-slide, game over).
- A simulation-driven bot clears rinks 1–2 without missing and starts missing once hole/blocks move (as intended).
- Subjective assessment from scripted play and code reading only (no human playtest).

## Remaining issues
- Rink 1 in portrait is visually sparse (a lot of bare ice).
- The sliding pose is the front-facing sprite rotated head-first; a true belly-slide pose would read better.
- Launch speed is fixed: there is no power control, so depth comes from angle, timing and route only.
- Landscape phones get a wide, short rink with small pieces (≈ 0.67 scale).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Aim–slide–splash loop is quick and readable; banks feel clever |
| Mechanical depth | 8 | Bank multiplier vs safe line, fish routes, moving hole/blocks timing, streak |
| Game feel | 8 | Squash on banks, trail, splash, swim-back, hit-stop on bank dunks, buffered launch |
| Visual identity | 8 | Top-down frozen pond; clearly not the side-on sibling |
| Animation quality | 8 | Seven Nori states with transitions, spectators, wiggling fish, pop-in obstacles |
| Audio quality | 7 | Speed-tied slide loop and rising bank knocks; modest variety |
| Controls | 8 | Push or pull, anywhere on screen, keyboard; guide is honest |
| Onboarding | 8 | First hole is dead ahead; each rink's twist is announced |
| Replayability | 7 | Six rink stages then randomised mixes; score/bank chase |
| Performance | 9 | A handful of entities, baked rink, 60 fps |
| Technical robustness | 8 | Restart/resize remap, timers on game clock, loop stops with run |
| Overall polish | 8 | Complete loop with character throughout |

## Next recommended action
Human playtest of the time economy; consider a power pull (short/long slides) and a "frozen fish wall" rink for 7+.
