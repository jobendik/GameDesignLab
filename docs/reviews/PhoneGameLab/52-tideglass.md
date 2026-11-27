---
id: PhoneGameLab/52-tideglass
title: Tideglass
was: 52-tetris (Tetris)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A falling-tetromino stacker named after and coloured like the best-known commercial one: swipe to move one column,
swipe up to rotate, swipe down to drop, clear full rows.

## Baseline assessment
39-line placeholder: one swipe = one column (unplayable at speed), no ghost, hold, preview, lock delay, wall kicks or
bag; pure-random pieces; rows vanish instantly; one beep; hardcoded layout; a commercial name. Overall 2/10.

## Weaknesses identified
Touch controls made precise placement impossible; nothing softened misdrops; no game feel; no identity of its own; no
difficulty structure beyond speed-by-score; no keyboard.

## Creative opportunities
Controls are the whole game on a phone: make the piece track the finger. Give the genre one mechanic of its own that
changes how you stack, and an identity that is not neon blocks.

## Planned improvements
Finger-tracking controls with flick/tap/hold gestures and full keyboard; modern stacker fundamentals; the Tide mechanic;
sea-glass identity; speed levels, shards and pebble rows for late-game variety.

## Implemented improvements
- **Original identity**: "Tideglass" — frosted sea-glass pieces (own colour mapping, nine baked rounded cells) sinking
  into a tide pool set in a sand tray, moving caustic lines, glass/knock/splash sounds, breezy music whose intensity
  follows stack height.
- **The twist — the Tide**: clearing rows fills an 8-line meter (a run starts with one charge). Calling the tide sweeps
  a wave through the well and packs every column down, closing all buried holes; rows completed that way clear at ×1.5.
  It changes strategy: stack rough and fast and cash in, or keep it as a lifeline.
- **Touch controls**: drag anywhere — the piece follows in exact column steps and re-anchors at walls so reversing
  responds immediately; tap rotates (left half counter-clockwise, right half clockwise); a slow downward drag sinks row
  by row; a flick (≥56 px within 110 ms) hard-drops at once; swipe up or tap the box to hold; a gesture never carries
  over to the next piece. Keyboard: arrows with DAS 160 ms / ARR 35 ms, Z/X/Up, Space, C/Shift, T.
- **Fundamentals**: 7-bag, ghost piece, hold, three-piece preview, generic wall/floor kicks, 0.5 s lock delay with up to
  14 move resets, hidden spawn rows, soft-drop/hard-drop points, combos, back-to-back fours, clean-sweep bonus.
- **Progression**: level every 8 lines (gravity ×0.83 per level); from level 4 the bag gains 3-cell glass shards; from
  level 5 the sea pushes up pebble rows (every 9, then 7, then 5 pieces) with a countdown under the well.
- **Feel**: eased column steps and rotation, drop trail, lock flash and sand puff, rows dissolve outward from the centre
  with shards, survivors fall in, hit-stop/shake/flash on fours, pulsing lock-delay, red surf when the stack is high.

## Test results
- Smoke: pass.
- Gameplay test `tests/PhoneGameLab/52-tideglass.test.js`: pass — mouse drag moves exactly N columns and back, drag is
  not a tap, touch taps rotate both ways, slow drag soft-drops without locking, swipe up holds, flick hard-drops, arrow
  keys and Space, a completed row clears/scores/charges, tide refused below a full meter, tide packs columns, tide-made
  row clears with bonus, pebble row arrives after 9 pieces at level 5, top-out ends the run with best recorded, restart
  resets everything.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (stack with pebbles and ghost, tide wave, tide clear, splash).
- Subjective assessment from scripted play only; the touch thresholds were tuned by reasoning, not on a real phone.

## Remaining issues
- Landscape phones (844×390): the 20-row well is height-bound, cells are ~16 px. Playable through relative drags but small.
- Rotation uses a generic kick list, not a full SRS table; no spin detection/bonuses.
- Tap-to-rotate fires on release (needed to tell taps from drags), ~1 frame slower than a button.
- Tide balance (8 lines, start charged) is untested with real players; it may be too generous early.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | A proven loop with responsive handling and a satisfying panic button |
| Mechanical depth | 8 | Hold, combos, back-to-back, plus tide timing and pebble pressure |
| Game feel | 8 | Eased steps, trails, dissolves, hit-stop on fours, wave sweep |
| Visual identity | 8 | Sea glass in a tide pool; nothing like the genre's usual look |
| Animation quality | 8 | Row dissolve, fall-in, tide settle, lock pulse |
| Audio quality | 7 | Informative pitches and combo ladder, reactive music; stock presets |
| Controls | 8 | Finger-tracking drag, flick, tap, hold, DAS/ARR keys; untested on hardware |
| Onboarding | 7 | Three short lines; tide starts charged and glowing so it gets discovered |
| Replayability | 8 | Score chase, speed levels, shards and pebbles change the late game |
| Performance | 9 | Baked cells and background; ≤ 220 sprite draws |
| Technical robustness | 8 | Clean restart, resize re-layout, gesture re-anchoring across spawns |
| Overall polish | 8 | Cohesive from splash to game over |

## Next recommended action
Playtest on a phone to tune drag step, flick threshold and tide cost; add a compact 10×16 well for landscape phones.
