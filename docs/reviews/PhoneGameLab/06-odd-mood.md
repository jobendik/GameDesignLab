---
id: PhoneGameLab/06-odd-mood
title: Odd Mood
was: 06-odd-one-out (Odd One Out)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
A grid of identical emoji faces with one different emoji; tap it. 45 s countdown, −3 s for a wrong tap.

## Baseline assessment
40-line prototype, a copy of "Find the Difference" with system emoji instead of colours: no art of its own (and emoji
render differently per platform), no difficulty curve beyond grid size, no feedback, no best score, hard-coded layout.
Overall 2/10.

## Weaknesses identified
Identical to its sibling in structure, pressure and look; borrowed art; the "expression" skill was really glyph matching;
nothing reacted to the player.

## Creative opportunities
Make the faces real, procedural characters so "expression" becomes a tunable parameter space; let distractors (colour,
shape, costume, movement) grow while the mood difference shrinks; give the crowd life and let it react to being read.

## Planned improvements
Procedural blob folk with a parametric expression system; per-crowd fuse + hearts (a different pressure model from
Misfired's time bank); tiered mood pairs; crowd reactions; teal sticker-sheet identity; adaptive crowd layout.

## Implemented improvements
- **Renamed "Odd Mood"**, fully procedural cast: 5 body shapes × 8 colours × 6 accessories (tuft, ears, antennae, cap,
  bow, none), drawn with ink outlines, feet, shadows and idle bob/sway. No emoji anywhere.
- **Expression system**: 13 moods assembled from mouth curve/openness/asymmetry, eye openness (closed arcs, half lids,
  wide), pupil direction, brow tilt/lift and winks. Mood pairs come in three tiers: obvious (cheerful vs gloomy),
  medium (cheerful vs calm) and subtle (a wink, a smirk with one raised brow, a sideways glance, a pout).
- **Escalation on two axes**: crowds grow 4 → 30 and pick up distractors (clones → mixed colours at round 4 → mixed
  shapes and costumes at 7 → *restless* crowds that swap places from 13) while the pairs move down the tiers.
- **Pressure model distinct from Misfired**: three hearts and a per-crowd fuse (9.5 s shrinking to 4.6 s) that burns
  in from both ends. A wrong tap costs a heart but the crowd stays (the rejected face greys out and cannot be punished
  again); a burnt fuse costs a heart, spotlights the answer and deals a new crowd. Six in a row wins a heart back.
- **Scoring**: 50–150 by fuse remaining × streak multiplier (up to ×2.5).
- **Feel**: the found one hops with squash/stretch and a star burst while everyone else turns their eyes to it; leavers
  shrink out as the next crowd pops in with stagger; "nope" head-shake on a wrong tap; flash + shake on a lost heart;
  fuse ticks rise in pitch in the last 2.5 s; bouncy music intensity follows the fuse and the last heart; milestone banners.
- A caption names the crowd's mood ("A sleepy crowd… with one exception"), which teaches what to look for.
- Touch + mouse (nearest-character hit test, generous radius) + keyboard cursor. `orient:"any"`: the grid picks the
  orientation that yields the biggest characters and stays clustered on wide screens.

## Test results
- Smoke (`node tools/smoke.js 06-odd-mood`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/06-odd-mood.test.js`): pass — exactly one odd mood per crowd; real touch on it
  scores and advances; wrong tap costs one heart once and keeps the crowd; the fuse burns; time-out costs a heart, reveals
  and re-deals; six in a row restores a heart; fast spots out-score slow ones; crowd grows to 12; keyboard pick; last
  heart ends the run with best recorded; clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (early crowd with a wrong tap, 20- and 25-strong costume
  crowds with subtle pairs, time-out spotlight, splash), re-checked after the engine switched to the Fredoka typeface.
- Subjective assessment is from reading the code and watching scripted play only — no human playtest.

## Remaining issues
- Difficulty of the subtle tier at 25–30 faces is tuned by eye; the 4.6 s fuse floor may be too harsh or too kind.
- In 844×390 landscape the characters are small (≈ 45 px tall at 20 faces), though hit radii stay ≥ 26 px.
- Faces never blink or glance around (deliberately, so idle animation can't be mistaken for the odd mood); the crowd is
  alive only through body motion.
- The restless mode swaps one random pair at a time; it adds scanning load but is not a designed pattern.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Reading a crowd of characters is immediately fun; reactions reward every find |
| Mechanical depth | 7 | Speed/accuracy trade, heart economy, two escalation axes; still one core verb |
| Game feel | 8 | Hop + burst + crowd gaze, head-shake, spotlight reveal, staggered pop-in/out |
| Visual identity | 8 | Distinct sticker-style cast on teal; recognisable from a thumbnail |
| Animation quality | 8 | Grounded squash/stretch, bob/sway, eased slot swaps, transitions between crowds |
| Audio quality | 7 | Streak ladder, pitched fuse ticks, reactive music; presets only |
| Controls | 8 | Nearest-face hit test on pointer-down, keyboard cursor, no input lock beyond pop-in |
| Onboarding | 8 | First crowd is four clones, cheerful vs gloomy, with a caption naming the mood |
| Replayability | 8 | 24 mood pairs × random cast × modes; score and streak chase |
| Performance | 8 | ≤ 30 characters drawn as vector paths per frame; 61 fps headless |
| Technical robustness | 8 | Clean restart, layout recomputed on resize, engine timers only |
| Overall polish | 8 | Cohesive from splash crowd to spotlight ending |

## Next recommended action
Human playtest to tune the subtle tier and the fuse floor; consider designed crowd choreography for the restless mode.
