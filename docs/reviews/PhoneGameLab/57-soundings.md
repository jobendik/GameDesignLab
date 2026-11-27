---
id: PhoneGameLab/57-soundings
title: Soundings
was: 57-minesweeper (Minesweeper)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Reveal cells on a mined grid; numbers count adjacent mines; flag the mines and clear everything else.

## Baseline assessment
45-line prototype: grey 9×9 grid, mines placed before the first tap (instant death possible), a `setTimeout`
long-press that raced the tap handler (a hold both flagged *and* revealed), no chord, no timer, no sizes, 50/50 guesses,
recursive flood fill, no best score, named after the classic. Overall 2/10.

## Weaknesses identified
Unfair first tap and forced guesses; broken touch flagging; no mode toggle for one-handed play; no difficulty ladder
or timing; grey-grid look with no identity; timers outside the engine clock.

## Creative opportunities
Re-skin the *meaning* of the numbers: a survey boat sounding an unknown bay, where a sounding counts nearby reefs and
flags are buoys — then make the touch layer and the board generator as trustworthy as a good commercial version.

## Planned improvements
Nautical-chart identity; tap/hold with a Sound/Buoy switch; chord and quick-buoy; first tap safe with an opening;
solver-backed no-guess generation; four sizes with unlocks and per-size best times; spyglass hint with a time cost.

## Implemented improvements
- **Touch**: tap = sound, hold 0.34 s = buoy (fires while held, with a filling ring and haptic); the Sound/Buoy switch
  swaps the two for one-thumb flagging; moving >14 px cancels; a buoyed square cannot be sounded. Tapping a number
  whose buoys are placed sounds the rest (chord); tapping one whose hidden squares must all be reefs buoys them.
  Keyboard: arrows + Space/Enter, F buoy, T switch, H spyglass, N new chart, 1–4 sizes.
- **Fair generation**: reefs are laid at the first tap, never in its 3×3; a constraint solver (single squares, subset
  pairs, global reef count) plays each candidate from the opening and the chart is re-rolled (≤ 800 tries / 60 ms)
  until it finishes with no guess. 24/24 sampled charts across all sizes were guess-free.
- **Ladder + records**: Cove 6×7/7 → Bay 7×9/12 → Strait 8×11/18 → Open Sea 8×13/24 reefs; clearing a size unlocks the
  next. Timer starts on the first sounding; best time per size is stored (`Lab.store`) and shown on its chip, and the
  engine best (lower is better) encodes "hardest size cleared, then time" so the catalog shows e.g. "Bay 0:58.2".
- **Spyglass**: uses the same solver on what is visible to mark one square the clues already settle ("clear" or
  "reef") for +15 s — a teaching aid rather than a free reveal.
- **Identity**: parchment chart with stains, rhumb lines, neatline and A–H / 1–13 margin labels; hatched "uncharted"
  tiles that shrink away in a ripple from the tap to watercolour sea (pale deep water, blue shallows carrying the ink
  numerals); bobbing red-and-white buoys; foam-ringed rocks; on a wreck the reefs surface one by one with a holed
  boat on the one you hit and wrong buoys crossed out; on a win a survey boat sails across the finished chart.
- **Audio**: bubble pitched by the number sounded, rising blips + splash for openings, drop/flip for buoys, low sea
  noise bed, puzzle music that builds as the chart fills.
- **Layout**: chart transposes in landscape with a side panel; 44–61 px squares at 390 px wide.

## Test results
- Smoke (`node tools/smoke.js 57-soundings`): pass, 61 fps headless.
- Gameplay test (`tests/PhoneGameLab/57-soundings.test.js`): pass — spyglass inert before the first tap, corner first
  tap safe with its neighbourhood open, reef count, no-guess flag, hold-to-buoy and lift, buoy protects a square,
  drag-off cancel, then a full Cove solved with touch taps using *only* solver-proven moves (Buoy switch, quick-buoy,
  chord), per-size best + unlock + encoded engine best, clean restart, locked size refuses, Bay selected, spyglass
  truth + 15 s, hold-to-sound in Buoy mode on a reef loses and records nothing, fresh retry.
- Screenshots inspected at 390×844, 844×390, 1280×800 (splash, untouched Cove, mid-game Open Sea with hold ring,
  Strait landscape, wrecked Bay on desktop); removed wave marks under numerals and trimmed how-to lines.
- Subjective assessment is from code + scripted play, not a human playtest.

## Remaining issues
- The no-guess search is time-boxed: on a very slow phone a large chart could fall back to the best candidate found
  (the spyglass then points at clear water instead of leaving a coin-flip).
- Densities top out at 23 % and 8×13 — expert players will want a harder tier; 44 px minimum cell rules out wider
  boards without pan/zoom.
- The win card shows the time in the message/stats rather than the engine's big score slot (per-size bests do not fit
  the engine's single best), so there is no count-up.
- No right-click flag on desktop (engine pointer events carry no button); use F, T or hold.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | The classic at its fairest: every chart is pure deduction, 30 s – 4 min per size |
| Mechanical depth | 7 | Faithful logic depth, chord/quick-buoy for speed; no new rule beyond the classic |
| Game feel | 8 | Ripple reveals, hold ring + haptic, buoy pop, staged wreck |
| Visual identity | 9 | Nautical chart is unmistakable and nothing like the grey grid |
| Animation quality | 7 | Tile peel ripple, bobbing buoys, surfacing reefs, victory boat |
| Audio quality | 7 | Number-pitched soundings, sea bed, reactive music |
| Controls | 9 | Tap/hold, mode switch, cancel-on-drag, chord, keyboard; verified by test |
| Onboarding | 8 | Two contextual tips, safe first tap, spyglass that teaches |
| Replayability | 8 | Random guess-free charts, four sizes, per-size time chase |
| Performance | 9 | Baked tiles; generation ≤ 60 ms once per chart |
| Technical robustness | 8 | Engine-clock timers only, clean restart/size change/resize |
| Overall polish | 8 | Cohesive; HUD best label is long on the largest size |

## Next recommended action
Human playtest of hold timing (0.34 s) on real phones; add a pan/zoom "Ocean" tier and a daily seeded chart.
