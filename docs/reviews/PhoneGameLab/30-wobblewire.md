---
id: PhoneGameLab/30-wobblewire
title: Wobblewire
was: 30-balance-beam (Balance Beam)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Keep a figure on a beam upright by tapping the left or right half of the screen while random nudges tip it.

## Baseline assessment
34-line prototype: a rectangle-and-circle "person" on a brown bar, angle accelerating away from zero, an 80 ms
`setTimeout` push per tap, an invisible random velocity kick every 1.5 s, survival time as score, no best, no art,
no sound. Overall 2/10.

## Weaknesses identified
Disturbances were invisible and unfair; no anticipation; no progression or goal; taps felt arbitrary (fixed impulse,
real-time timer); nothing to look at; no reason to play twice.

## Creative opportunities
A balancing act needs a character you fear for and a place to get to. Put a fox on a high wire, make every
disturbance something you can see coming, and reward *small* corrections so skill shows in the score.

## Planned improvements
Real inverted-pendulum model; hold-to-lean with tap impulse; telegraphed gusts, birds landing on the pole, swaying
rope; ropes between platforms as milestones; steady multiplier; paper-cut alpine identity; expressive fox.

## Implemented improvements
- **Physics** (120 Hz): `θ'' = K·sinθ + (gust + birds + sway + noise)·cosθ + lean·U − c·ω`. Gravity torque grows with
  the lean, so there is a real point of no return (~45°) and a fall at 62°. K eases in over the first 10 m.
- **Controls**: hold left/right half (multi-touch aware), arrows / A-D; a press adds a small instant shove so taps are
  crisp, the hold applies steady torque. On-screen lean pads light up within a frame; on the first metres the correct
  pad pulses with "hold".
- **Disturbances you can read**: gusts get 0.9 s of chevrons + wind streaks + whoosh from the windward side before a
  sin² push (scarf, ribbons and clouds blow); birds fly in, land on a pole end (thunk, pole droops, constant torque)
  and leave after ~5 s for a carry bonus; from rope 4 the rope itself sways under the feet. Gusts shoo the birds so
  the worst cases never stack unfairly.
- **Goal + progression**: ropes of 19 m → 46 m between pine-top platforms; each platform is a breather, a bonus, a
  new sky (five paper-cut palettes) and one new complication, announced by banner + toast.
- **Depth**: walking speed falls off with lean and the STEADY multiplier (×1–×5) builds only within ±8.5° and breaks
  beyond ±23°, so tight early taps score several times more than wild saves.
- **Character**: procedurally drawn fox — counter-swinging tail, counter-rotating head, stepping feet, flexing pole,
  blink, eyes that follow the lean, panic face, sweat, flailing tumble with slide-whistle.
- **Feel/audio**: camera rolls slightly with the lean, parallax ridges, heartbeat + red pulse in danger, footsteps
  pitched by speed, bird chirps, pentatonic multiplier steps, march music whose intensity follows danger.

## Test results
- Smoke (`tools/smoke.js 30-wobblewire`): pass (53 fps headless while other suites were running; no errors).
- Gameplay test (`tests/PhoneGameLab/30-wobblewire.test.js`): pass — touch tap shoves, mouse hold applies torque,
  keys lean; a bang-bang controller on the same lean input walks the rope, builds the multiplier and reaches rope 2;
  a gust produces torque in its direction; letting go tips past 1 rad and ends the run; best recorded; clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, calm walk, gust warning, bird on pole, danger
  pose, platform arrival, game-over card).
- Subjective assessment from code + scripted play only; no human playtest. The scripted controller holds ×5 almost
  permanently, so real difficulty for thumbs is an estimate.

## Remaining issues
- Tuning (K, lean torque, gust strength) is reasoned, not playtested; late ropes may be too hard or too easy.
- One fall ends the run — no second chance mechanic.
- Full-screen gradients each frame cost a few fps in software rendering.
- The view is from the front, so the destination platform is only seen in the last 2 m (the progress bar covers it).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Balancing an unstable toy is compelling within seconds |
| Mechanical depth | 7 | Pre-leaning into gusts, bird offsets, multiplier vs safety; single verb |
| Game feel | 8 | Instant tap shove, pole flex, camera roll, heartbeat |
| Visual identity | 9 | Paper-cut alps with shifting skies and a distinctive fox |
| Animation quality | 8 | Tail/head counter-motion, panic face, birds, tumble |
| Audio quality | 7 | Informative cues; march music is generic engine material |
| Controls | 8 | Hold + tap, multi-touch, keys, visible pads |
| Onboarding | 8 | Gentle first 10 m, pulsing "hold" pad teaches the counter-lean |
| Replayability | 7 | Random gusts/birds, rope milestones, score chase |
| Performance | 7 | 53–60 fps headless; several full-screen gradients per frame |
| Technical robustness | 8 | Fixed-step physics, clean restart, resize-safe layout |
| Overall polish | 8 | Complete loop with character and milestones |

## Next recommended action
Human playtest to tune instability and gust strength; consider a one-time "grab the rope" save and baked sky layers.
