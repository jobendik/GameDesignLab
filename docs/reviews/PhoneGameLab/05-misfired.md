---
id: PhoneGameLab/05-misfired
title: Misfired
was: 05-find-difference (Find the Difference)
status: transformed
baseline: 2
score: 7
updated: 2026-11-26
---
## Original concept and core mechanics
A grid of identical colour tiles with one slightly lighter tile; tap it. 45 s countdown, −3 s for a wrong tap, grid grows
every three finds.

## Baseline assessment
45-line prototype: flat HSL squares on black, a fixed +8 % lightness difference that never got harder (only the grid grew),
no feedback beyond a beep and a toast, tap-on-release, no best score, no splash, hard-coded pixel layout. Near-identical
code to its sibling "Odd One Out". Overall 2/10.

## Weaknesses identified
No difficulty curve in the actual skill (the shade gap was constant and always "lighter"); HSL steps are not perceptually
even, so some hues were far harder than others by accident; no identity; no game feel; a fixed-length timer with nothing to
play for after the first run.

## Creative opportunities
Make "one shade off" literal and fair by working in a perceptual colour space; give the tiles a material (glazed ceramic)
so the board is pleasant to stare at; turn the timer into something you can stoke; let the things you find accumulate.

## Planned improvements
OKLab-based colour pairs with a shrinking gap; time-bank survival instead of a fixed countdown; streak multiplier; batch
variants; pottery-studio identity; trophy shelf; proper feedback and audio; keyboard cursor; adaptive layout.

## Implemented improvements
- **Renamed "Misfired"**: a tray of glossy glazed tiles on warm plaster with window light, a slate tray, a wooden trophy
  shelf with a potted sprig. Light theme, lo-fi "chill" music whose intensity rises as the kiln cools.
- **Perceptually fair difficulty**: base/odd colours are generated in OKLCH and converted to sRGB (gamut-checked), so the
  gap means the same for every hue. The odd tile may differ in lightness, hue or chroma, in either direction. Gap decays
  from 0.15 (obvious) to a 0.017 floor around batch 28; grid grows 2×2 → 6×6.
- **Kiln-heat time bank** (20 s cap): right picks add 1.2–2.3 s (more when quick), wrong picks burn 2.5 s and crack the
  tile (a cracked tile cannot be punished twice). The clock is frozen while a new batch flips in. Time gain fades slowly
  after batch 20 so runs end.
- **Depth**: streak multiplier (×2…×5, a step every 4 unbroken finds, shown as pips), "quick!" ×1.5 bonus under 1.6 s;
  *mottled* batches (per-tile lightness noise) from batch 8 and *inlay* batches (only a small motif differs) from batch 14.
- **Anti-stall**: after 6 s on one batch a soft glint sweeps the odd tile (reduced time reward).
- **Feel**: instant press on pointer-down, shard burst + ring + score popup, ripple flip of the whole tray radiating from
  the tapped tile, pop-in when the grid grows, shake/crack/jolt on a wrong pick, heartbeat under 5 s, pentatonic ladder that
  climbs with the streak, banners for multiplier and grid milestones. Caught misfires fly to the shelf.
- **End**: the missed tile is revealed (others dim) before the card; stats: misfires, best streak, sharpest eye (smallest
  gap found, in %).
- Touch + mouse (pointer-down) + keyboard (arrows move a cursor, Space/Enter picks). `orient:"any"` layout derived from
  `Lab.play`: big tiles on desktop, full-height tray in landscape, shelf appears whenever there is room.

## Test results
- Smoke (`node tools/smoke.js 05-misfired`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/05-misfired.test.js`): pass — real touch on the odd tile scores and advances; wrong
  tile burns ~2.5 s, resets the streak, cannot be re-punished; 11-pick run grows the grid to 5×5, shrinks the gap, raises
  gains through the multiplier and refills the clock; keyboard cursor + Space; the clock drains; time-out ends the run
  and records best; restart fully resets.
- Screenshots inspected at 390×844, 844×390 and 1280×800: early play with a wrong pick, late 6×6 mottled batch, inlay
  batch, game-over card, splash.
- Subjective assessment is from reading the code and watching scripted play only — no human playtest.

## Remaining issues
- Colour is the mechanic, so it is inherently unfriendly to colour-vision deficiencies; lightness rounds remain readable,
  hue/chroma rounds may not. A "lightness only" option would fix this.
- The 0.017 floor was tuned by eye on screenshots, not on a range of phone panels; it may be too easy on OLED and too
  hard on a dim LCD.
- In 844×390 landscape the 6×6 tiles are ~46 px and the shelf is hidden; small labels bottom out at 11 px.
- The portrait layout leaves some unused wall above the shelf.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Immediate, satisfying "there it is" loop; tension builds as the bar stops refilling |
| Mechanical depth | 6 | Speed vs accuracy, streak protection, three batch types; still a single perceptual skill |
| Game feel | 8 | Pointer-down response, shard burst, ripple flip, cracks, bar jolt, heartbeat |
| Visual identity | 7 | Glazed tiles on slate in a sunlit studio; recognisable, though tiles are simple squares |
| Animation quality | 7 | Ripple flips, pop-ins, shelf fly-in, glint; no idle life on the board itself (deliberate) |
| Audio quality | 7 | Streak ladder, pitched pops, heartbeat, reactive music; all from engine presets |
| Controls | 8 | Whole-cell hitboxes, instant, keyboard cursor, short input lock only during the flip |
| Onboarding | 8 | First batch is a 2×2 with a huge gap; three how-to lines |
| Replayability | 7 | Random colours/axes/variants each run, score chase, "sharpest eye" stat |
| Performance | 9 | ≤ 36 tiles, one cached gloss sprite, no per-frame gradients |
| Technical robustness | 8 | Clean restart, layout recomputed on resize, timers via engine only |
| Overall polish | 7 | Coherent start to finish; decor is light |

## Next recommended action
Human playtest on real phones to tune the gap floor and time economy; add a colour-blind friendly "lightness only" mode.
