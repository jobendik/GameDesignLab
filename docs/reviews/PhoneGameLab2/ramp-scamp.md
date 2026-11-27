---
id: PhoneGameLab2/ramp-scamp
title: Ramp Scamp
was: bridge / "Bridge"
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
"Bridge": hold to grow a stick, release, it falls across a gap, a dot walks over; too short = splash. One gap, no ramp-up.

## Baseline assessment
A 31-line placeholder (2/10): no overshoot rule, no feedback, the hero walks through the bridge tip, fixed layout.
The Phone Game Lab sibling **Bamboo Span** already is the polished "hold to grow, topple, cross" game.

## Weaknesses identified
- Single input with a single judged quantity (length) and unlimited thinking time: no pressure, no second axis of skill.
- Nothing for a character to do; would duplicate Bamboo Span if only polished.

## Creative opportunities
- Pip is "bold, impatient, loves speed and dares": he should never stop. Make the bridge a ramp he hits at speed.
- Judge an *angle* for a ballistic jump instead of a length, in real time, with a visible predicted arc.

## Planned improvements
Real-time runner with hinged ramps, exact arc preview that degrades with speed, bullseye/perfect multiplier, acorn
lines on the daring arc, new gap types per speed tier, lives with a quick rescue, Pip reacting to his own fate.

## Implemented improvements
- **New rule set**: Pip skateboards continuously; holding tilts the *next* ramp (100°/s up to 66°, ratchet clicks rising
  in pitch), releasing locks it, and he launches whenever he reaches it. Too flat = short, too steep = stall or
  overshoot. The ramp ahead can be pre-set while he is still in the air.
- **Dotted arc preview** from the same fixed-step simulation as the real jump (exact, including wind and mushroom
  bounces); full at speeds 1–2, 60 % at 3–4, 36 % after — judgement gradually replaces reading.
- **Perfect mat** on every deck (±16 units): consecutive perfects raise the multiplier to ×5; scrambling up an edge
  ("Phew!") saves the jump but breaks the streak.
- **Acorns** hang on the brave line: when a high lob reaches the same mat as the low arc the acorns are on the lob;
  all three = "Stylish! +15".
- **Gap variety by tier** (every six gaps, +speed): flat gaps you must *not* touch (tier 1+), bounce mushrooms that
  split the jump into two arcs (2+), head/tail wind with a pennant and streaks (4+), narrower mats; the camera pulls
  back as speed rises so portrait phones keep the landing deck in view. A life returns every second tier.
- **Generator solves every gap** before placing it (decks are positioned at the simulated landing of a chosen angle,
  with clearance checks), so no impossible jumps: the autopilot using the stored angle cleared 57 gaps without a miss.
- **Pip as actor**: leans on the ramp, stretches off the lip, grins on the way up, and — because the game already
  knows whether the jump will land — panics and flails from the apex when it will not; cheers on perfects; floats
  back on a balloon, dizzy, after a tumble.
- Autumn treetop identity (parallax crowns, plank decks, red board), world-space particles, `orient:"any"`,
  hold with touch / mouse / Space, attract mode.

## Test results
- Automated-technical: `node tools/smoke.js ramp-scamp` — pass.
- Automated-gameplay: `node tools/run-tests.js ramp-scamp` — pass, three consecutive runs after the last change
  (real mouse hold-and-release tilts and locks the ramp and clears gap 1; Space tilts the next; autopilot through the
  same input path clears five gaps with a perfect streak and HUD in sync; wrong angles cost lives; third tumble ends
  the run; clean restart).
- Long autopilot run (≈60 s, to tier 9 with wind and mushrooms): 57 gaps, no lives lost.
- Visual inspection: 390×844 (early and top speed), 844×390, 1280×800; heart spacing, portrait horizon and the
  top-speed look-ahead (zoom-out) were fixed after looking.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- The ramp only ratchets up: an over-tilted ramp cannot be corrected (deliberate, but harsh for a first-timer).
- At top speed in portrait Pip is drawn small (zoom 0.7) and decisions come every ~1.2 s — exciting but demanding.
- Human difficulty is estimated; hold rate (100°/s) and deck lengths may want tuning by hand.
- No obstacles in the air (birds, branches) — variety comes from gap types only.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Hold-release rhythm against a runner who will not wait; perfect chains feel great |
| Mechanical depth | 8 | Angle judgement, two-arc choice for acorns, flat/mushroom/wind gaps, pre-setting the next ramp in flight |
| Game feel | 8 | Ratchet clicks, launch whoosh, landing squash/dust, hit-stop on perfects, camera pull-back |
| Visual identity | 8 | Golden-hour autumn treetops, distinctive from the misty sibling |
| Animation quality | 8 | Pip's pose follows state and predicted outcome; mushroom squash, pennant, speed lines |
| Audio quality | 7 | Angle-pitched clicks and whoosh, streak ladder, drive music intensity by tier |
| Controls | 8 | One hold anywhere (touch/mouse/Space), exact preview; no way to lower a ramp |
| Onboarding | 8 | Long first deck, three easy gaps, full preview, sticky-free hint |
| Replayability | 8 | Procedural solvable gaps, tiered mechanics, multiplier chase |
| Performance | 9 | Fixed 120 Hz step, a handful of decks, cached preview per angle |
| Technical robustness | 8 | Deterministic sim shared by generator/preview/play, resize-safe, clean restart |
| Overall polish | 8 | Complete loop, attract autopilot, friendly "Wipeout!" card |

## Next recommended action
Human tuning of hold rate and early deck lengths; consider airborne obstacles past tier 6.
