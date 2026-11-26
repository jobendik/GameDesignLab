---
id: PhoneGameLab/02-crab-bop
title: Crab Bop
was: 02-whack-a-mole (Whack-a-Mole)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Whack-a-mole on a 3×4 grid: things pop out of holes, tap moles for points, tapping a bomb costs one of three lives, 30 s clock.

## Baseline assessment
47-line prototype named after and shaped like the fairground classic: emoji moles and bombs on dark ellipses, things
teleport in and out, `onTap` input (fires on release — late for a reflex game), hard-coded 46 px hit circles, flat
difficulty, one beep, no best score. Overall 2/10.

## Weaknesses identified
No anticipation or impact (instant appear/disappear); no reason to care about a missed mole; decoys distinguished only by
emoji; no ramp; no identity; pixel-fixed layout that breaks in landscape.

## Creative opportunities
Give the pop-ups personality and readable silhouettes; make "nothing escapes" the skill through a combo; add a target that
takes two hits and a decoy that tries to look like a target; reward a streak with a spectacle.

## Planned improvements
Original lagoon identity with procedural creatures; 60 s run in four tide phases with scripted surges; combo multiplier;
hermit (two bops), urchin and masked urchin decoys, golden crab → clock-freezing frenzy; hearts; keyboard grid; full test.

## Implemented improvements
- **Identity**: turquoise shallows with light shafts, drifting caustics and bubbles; nine sand mounds; crabs with stalk
  eyes that glance around and pac-man claws that snap; hermit crabs under a pink spiral shell; sulky purple urchins whose
  spikes ripple; all drawn procedurally (no emoji). Bounce music in G whose intensity follows the tide.
- **Readable decoys**: urchins differ from crabs by silhouette (spikes), colour and sound (low thunk on emerging vs a
  rising blip pitched per burrow). From the third phase some urchins hold cardboard crab claws and eyes on sticks — the
  body is still plainly an urchin, but a glance at the claws is no longer enough.
- **Combo**: every clean bop adds to the combo, ×2…×5 at 5/10/15/20; any crab that escapes (or an urchin touch) resets it,
  so the score rewards covering the whole board rather than camping. Pips under the multiplier show progress.
- **Variety**: hermit = first bop knocks the shell off (it stays up, startled), second scores 25; golden crab (two per
  run) = 50 and a 5 s Bubble Frenzy: clock frozen, urchins dive, crabs everywhere at double points.
- **Structure**: 60 s in four named phases (markers on the tide bar, banner + jingle), each opened by a scripted surge
  (row → X with an urchin in the middle → full board with two urchins); spawn gap .85→.36 s, up-time 1.35→.62 s,
  2→4 simultaneous. Three hearts; three prickles end the run early ("Prickled!"), otherwise "Tide's in!" with +50 per
  heart kept.
- **Feel**: `onDown` input resolved to the nearest burrow (whole cell is the hitbox); creatures rise with overshoot
  through a clipped burrow with a front lip, squash on impact, see stars and sink; sand puffs; star bursts, bubbles,
  score popups, combo ladder notes; red flash, shake, hit-stop and haptic on a prickle. Fairness: a crab can still be
  bopped for 0.14 s after it starts to duck; an urchin cannot hurt you during its first 0.1 s; burrows rest ≥ 0.28 s
  before reuse; never two urchin spawns in a row.
- Touch (multi-finger), mouse, and keyboard (QWE/ASD/ZXC or numpad, legend shown on desktop for the first seconds).

## Test results
- Smoke (`node tools/smoke.js 02-crab-bop`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test `tests/PhoneGameLab/02-crab-bop.test.js`: pass — natural spawning, touch bop +10, empty burrow harmless,
  keyboard bop, escape resets combo, ×2 after five and pays 20, hermit two-stage, gold → frenzy with frozen clock, three
  urchins (one masked) → hearts 3→0 → game over with best saved, clean restart, time-up ending with 150 heart bonus.
- Screenshots inspected at 390×844, 844×390, 1280×800 (splash, every creature kind, frenzy, late phase). Found and fixed
  a stretched background sprite that misaligned mounds and burrows, overlapping mounds in portrait, and a hermit shell
  that hid its face.
- Subjective assessment from reading code and scripted play only — no human playtest.

## Remaining issues
- Tempo numbers are tuned against a bot; the last phase may be too hot or too mild for real thumbs.
- Empty-burrow taps are free, so two-thumb mashing is only punished by urchin density, not directly.
- The top of a tall portrait screen is unused water (the grid sits low for thumb reach).
- One fixed 60 s mode; no endless variant.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Classic loop made lively by characters, surges and the frenzy pay-off |
| Mechanical depth | 7 | Combo upkeep vs decoy caution, two-hit hermits, masked decoys; no meta choices |
| Game feel | 8 | Overshoot rise, squash, stars, scaled shake/hit-stop, distinct prickle feedback |
| Visual identity | 8 | Recognisable lagoon and cast, fully procedural |
| Animation quality | 8 | Clipped rise/sink, glancing eyes, snapping claws, rippling spikes, dizzy stars |
| Audio quality | 7 | Per-burrow blips, decoy thunk, combo ladder, reactive music; preset-based |
| Controls | 8 | Whole-cell hitboxes, coyote time, urchin grace, touch/mouse/keys |
| Onboarding | 8 | Spikes read as "don't touch"; first 6 s are crabs only; three short how-to lines |
| Replayability | 7 | Score chase, random gold timing; fixed length and one mode |
| Performance | 9 | Baked seabed, ≤ 6 live creatures, 61 fps headless |
| Technical robustness | 8 | Clean restart, relayout on resize, tested end states |
| Overall polish | 8 | Cohesive start to finish; splash shows the cast |

## Next recommended action
Human playtest of phase tempo and urchin ratio; consider an endless "storm" mode after the tide comes in.
