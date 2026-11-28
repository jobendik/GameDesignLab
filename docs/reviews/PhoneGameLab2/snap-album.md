---
id: PhoneGameLab2/snap-album
title: Snap Album
was: jigsaw-puzzles / Jigsaw Puzzles
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
Drag pieces to complete a picture. The prototype was a 3×3 grid of numbered coloured squares you swapped; no picture,
no jigsaw shapes, no clock, no pal.

## Baseline assessment
A sliding-tile placeholder: nothing to look at, no feel, no fail state, no progression, no audio.

## Weaknesses identified
No real puzzle pieces, no picture, no reason to hurry, no escalation, numbers on tiles removed all reasoning.

## Creative opportunities
Olli (the bookish puzzle-solver) keeping the pals' photo album; pictures painted procedurally from the cast, so each
photo is a little scene of a different pal; a pal who wanders onto the table as the action twist.

## Planned improvements
Procedurally cut jigsaw pieces with tabs/blanks; procedurally painted photos; one setting-sun clock for the whole run
that each finished photo refills; first-drop streak scoring; rotation and a pest as late twists; fading ghost image.

## Implemented improvements
- **Pieces**: every inner edge gets a random tab or blank with slightly varied size/offset; border pieces are flat. Each
  piece is baked once (picture clip, ink outline, light bevel, separate shadow sprite). Pieces wait at ~70 % size in a
  linen tray and grow to full size when lifted or laid on the frame; held pieces lift with a deeper shadow.
- **Six painted photos**: Momo's pond, Nori's ice slide, Bun's carrot patch, Bolt's launch night, Pip at the beach, the big
  picnic with the whole cast; after that, random repeats with new cuts and seeds. A polaroid thumbnail sits beside Olli.
- **Clock**: 60 s of daylight for the run; a finished photo pays 20 pts/piece and +8 s + 2.2 s/piece (capped at 99 s).
  Sizes grow 3×3 → 3×4 → 4×4 → 4×4 → 4×5 → 5×5 → 5×6, so daylight drains steadily; the last 10 s tick.
- **Streak**: each snap scores 10 + 4 per streak step (max +40), chimes up the combo ladder; a wrong drop on the frame
  resets it ("Streak lost"); a right spot but wrong rotation only wiggles ("Turn it!").
- **Twists**: ghost image fades (42 % → 22 % → 10 %); photo 3+ deals rotated pieces (tap to turn, R/Space on keyboard, or a
  second finger while holding; a piece lying upright on its slot snaps); photo 4+ Pip peeks in with a "!" bubble and
  then dashes across the tray, scattering and spinning loose pieces — tap him while he peeks to shoo him (+15).
- **Olli** watches the held piece / Pip, thinks while you drag, cheers snaps, flinches at wrong drops, panics at dusk.
- Camera flash + caption banner + daylight toast on every finished photo; attract mode assembles a photo behind the splash.

## Test results
- Automated-gameplay: `tests/PhoneGameLab2/snap-album.test.js` — real mouse drags snap pieces (+10, +14 streak), a
  wrong drop resets the streak, a touch tap does not rotate on photo 1, finishing pays the exact bonus and daylight,
  photo 2 has 12 pieces, photo 3 deals rotated pieces that tapping turns and snaps, tapping peeking Pip shoos him (+15),
  sunset ends the run with a best score, Enter restarts cleanly. Passed 3/3 consecutive runs (~13.5 s).
- Automated-technical: `node tools/smoke.js snap-album` passes, 61 fps.
- Visual inspection: screenshots at 390×844, 844×390 and 1280×800 (photo 1 mid-drag, photo 5 with Pip peeking, splash).
  Fixed: tray crowding (smaller tray scale).
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- With 20+ pieces the landscape tray gets crowded and pieces overlap; you can sort them, but it is busy.
- Some pictures have large plain areas (sky, sand) whose pieces are only placeable by shape — real jigsaw difficulty, but
  late photos with a faint ghost can feel slow on a phone.
- No snap-to-neighbour (pieces only lock into the frame), which a jigsaw purist might expect.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Satisfying snap loop with a clock that pushes; first photo plays in ~20 s |
| Mechanical depth | 6 | Edges-first strategy, streak protection vs. guessing, shooing Pip vs. placing, rotation reading |
| Game feel | 7 | Lift/grow, deep shadow, damped snap, combo chime ladder, camera flash, wobble on wrong drop |
| Visual identity | 8 | Wooden table, linen tray, purple album frame, painted pal photos, polaroid thumbnail |
| Animation quality | 7 | Pieces deal out of the tray, scale/rotation ease, Pip runs with bob and tilt, Olli reacts |
| Audio quality | 6 | Combo ladder pitch on snaps, rotation click pitch, warn/whoosh for Pip, dusk ticking; puzzle music intensifies |
| Controls | 7 | Generous grab boxes, drag offset kept, tap-to-turn, second-finger turn, keyboard R/Space |
| Onboarding | 7 | Photo 1 has no rotation and a strong ghost; twists arrive one per photo |
| Replayability | 7 | Random cuts/scatter, growing photos, clock + streak chase |
| Performance | 9 | All pieces baked to sprites; 61 fps in smoke |
| Technical robustness | 8 | Clean restart, resize re-layouts and re-scatters, no timers outside the game clock |
| Overall polish | 7 | Complete loop with attract, friendly "Sunset!" card and stats |

## Next recommended action
Human playtest of photos 5–7 on a phone to tune tray crowding and daylight refill; consider neighbour-snapping clusters.
