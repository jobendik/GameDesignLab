---
id: PhoneGameLab/33-snug
title: Snug
was: 33-shape-gate (Shape Gate)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Morph your shape to fit through approaching gates: a tap cycled circle → square → triangle while gates scrolled in from the
right; the wrong shape at a gate ended the run.

## Baseline assessment
38-line prototype: flat shapes on black, cycle-only input (the right shape was often two taps away), pre-generated list of
20 gates and then nothing, "score" was elapsed time, instant unexplained death, one beep, no best score. Overall 2/10.

## Weaknesses identified
Cycling instead of choosing made the control itself the obstacle; gates overlapped at speed; no telegraphing, no feedback
on a pass, no progression, no identity, the run simply ran out of gates after ~15 s.

## Creative opportunities
Make the morph real (the outline actually flows between shapes), give direct one-thumb control, turn "which shape?" into a
reading game with gates that hide, forbid, lie and change their mind, and reward nerve with a last-moment bonus.

## Planned improvements
Direct shape keys; perspective road so several gates are readable at once; stage-by-stage gate tricks; SNAP risk/reward;
streak multiplier; three lives; risograph-poster identity; pitched audio; attract mode; tests.

## Implemented improvements
- **Controls**: one big key per shape (direct pick on press, nearest-key hit test), tap the road to cycle, keys 1-4 /
  A-S-D-F / arrows. The first three gates bounce an arrow over the right key.
- **Real morphing**: every shape is a 120-sample polar radius table; the body's outline damps from one table to the next,
  so it visibly flows circle → square → triangle → star, with pop, squeeze-through and hurt wobble.
- **Readable road**: gates stand on a perspective road, so 4-5 upcoming cut-outs are visible; passed gates rush past the
  camera and fade. The body's face gapes when its current shape will not fit the next gate.
- **One new trick per stage**: TWINS (back-to-back gates), PEEKABOO (a "?" shutter irises open late), NO ENTRY (an arch
  with a prohibition sign: be anything else), SWITCHEROO (a pulsing badge, then the cut-out flips) plus a fourth shape
  and a fourth key, paint colours that stop matching the cut-out, then FULL HOUSE with everything mixed and rising speed.
- **Scoring**: 10 × streak multiplier (x2…x6, one step per six clean gates); SNAP — morphing in the last 0.26 s pays
  +15 × multiplier; stage bonus. Three hearts, one back per cleared stage.
- **Identity**: two-colour risograph poster — mustard paper, navy ink outlines with an offset "mis-registration" shadow,
  halftone sun and ground baked into one sprite. Each shape has its own colour and its own note.
- **Audio**: per-shape morph notes, rising pentatonic ladder on streaks, snap/coin on SNAP, crunch on a misfit, arcade
  music whose intensity follows speed and multiplier.
- Engine lifecycle: attract scene behind the splash (the body auto-morphs), clean reset, resize re-layout, neutral HUD strip.

## Test results
- Smoke (`node tools/smoke.js 33-snug`): pass, 61 fps headless, no errors.
- Gameplay test (`tests/PhoneGameLab/33-snug.test.js`): pass — real touch taps on the keys, keyboard, road-tap cycling,
  first gate scores 10, a misfit costs a life and the streak, late morphs register as SNAPs, x2 at six, stage 1 → 4 with
  life refund and speed-up, three misfits end the run, best saved, clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, start, mid-play, stage 5 with NO ENTRY gates).
- Subjective assessment is an informed judgement from code and scripted play — no human playtest.

## Remaining issues
- After stage 6 the only escalation is speed (capped at ~2.6× the opening pace); no new gate types beyond that point.
- Lying paint colours are subtle — players who already read the cut-out, not the card colour, will barely notice them.
- In 844×390 landscape the portrait stage is narrow and the keys shrink to ~46 px.
- SNAP timing has not been tuned by human hands; 0.26 s may be generous or stingy on a real phone.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Immediate read-and-react loop; stage tricks keep changing the question being asked |
| Mechanical depth | 7 | SNAP risk/reward, multiplier upkeep, four gate behaviours; still a single-axis decision |
| Game feel | 8 | Morph flow, squeeze, shard burst, hit-stop on misfit, per-shape notes |
| Visual identity | 9 | Riso poster look is unlike anything else in the collection |
| Animation quality | 8 | True outline morph, iris shutter, flip squash, key presses, gates rushing past |
| Audio quality | 7 | Informative pitches and streak ladder; built from engine presets |
| Controls | 9 | Direct pick on press, generous hit test, three input methods |
| Onboarding | 8 | Bouncing arrow for the first gates; every new trick gets a banner and one-line toast |
| Replayability | 7 | Random gate streams, score chase; content tops out at stage 6 |
| Performance | 9 | Baked background, ≤ 10 gates alive, 60 fps headless |
| Technical robustness | 8 | Clean restart, resize, pause; verified by test and smoke |
| Overall polish | 8 | Cohesive from splash to game over |

## Next recommended action
Human playtest of SNAP window and stage lengths; add a seventh trick (e.g. gates that drift sideways into two-lane choices).
