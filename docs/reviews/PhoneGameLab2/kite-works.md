---
id: PhoneGameLab2/kite-works
title: Kite Works
was: make-a-kite / Make a Kite
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Make a Kite": scribble paint onto a white diamond, press FLY, drag the kite around to dodge white circles.

## Baseline assessment
Painting was cosmetic and the flight ignored it; the kite followed the finger like a cursor (no wind, no kite), and the
only rule was "don't touch a circle".

## Weaknesses identified
Creative and skill halves were disconnected; no physics fantasy, no progression, no identity, no audio.

## Creative opportunities
Make the build *matter*: a forecast that changes each run, design choices with honest trade-offs, and a sky made of
visible wind lanes where those trade-offs play out.

## Planned improvements
Workshop with shape / tail / paint and live stats; forecast (Calm / Breezy / Gusty); lift-vs-weight flight model in wind
lanes; strain and gust wobble; stars, ribbon-ring chains, gulls; patches as lives; 75 s flight.

## Implemented improvements
- **Workshop**: Bolt with a wrench gives a forecast tip in a bubble; pick Diamond (lift 1.15, fragile, wobbly) / Delta
  (balanced) / Box (heavy, steady, unbreakable), Short / Medium / Long tail (steadier but heavier), five colours and four
  patterns (plain, stripes, dots, stars). Live bars for Lift / Steady / Tough / Weight; the painted kite previews in the
  breeze. The last design is remembered (`Lab.store`).
- **Flight model**: hold and slide to set a target altitude; the kite only climbs where lift × wind exceeds its weight
  and sinks in lanes too weak for it; responsiveness drops with tail weight; gusts shake it in proportion to
  (wind − 0.9) × (1 − steady); lanes above (tough + 0.35) fill a STRAIN meter (ticking, rising pitch) → snap.
- **Wind lanes**: 3–4 bands per sky segment, drawn as streaks whose speed and colour show strength (white breeze, blue
  strong, grey storm with cloud scallops). Every segment has one lane any kite can hold. Calm days are mostly weak lanes,
  gusty days have storms and stronger gusts; storms and gulls increase through the flight.
- **Collecting**: stars +10 along good lanes, ribbon rings +25 × chain (up to ×5, a missed ring breaks it), +1 per 10 m.
  Gulls, ground bumps and snaps cost a patch (3), with a tumble and 1.8 s of grace.
- **Pals**: Bolt builds, then runs along the hill holding the string (sag eases as strain rises; mood follows strain);
  Pip, Nori and Momo cheer from the hill when you collect, flinch when you lose a patch.
- End card names your build and the day ("Delta kite, long tail, on a gusty day"). Attract mode flies a bot kite.

## Test results
- Automated-gameplay: `tests/PhoneGameLab2/kite-works.test.js` — touch taps on Diamond / Long / colour / pattern change
  the design and its stats in the right direction, Fly! launches, a held mouse steers the kite into stars (+10 each), a
  too-weak lane makes it sink despite the pull and the ground bump costs a patch, a storm lane builds strain and snaps
  the diamond, the timer ends the run with a best score, Enter restarts into the workshop with the design remembered.
  Passed 3/3 consecutive runs (~12.6 s).
- Automated-technical: `node tools/smoke.js kite-works` passes.
- Visual inspection: workshop at 390×844 / 844×390 / 1280×800, flight on a calm day (delta) and a gusty day (box), splash.
  Fixed: forecast bubble overlapping the preview kite, cramped stat rows, Fly! clipped in landscape, storm clouds
  drawing over the HUD, kite too small in flight.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- The workshop is choice-based, not free drawing; creativity is limited to shape/tail/colour/pattern.
- Storm lanes are flat grey bands (no lightning or rain animation).
- The sky is mostly empty space by nature; there is no wind-lane preview beyond the visible screen.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Reading lanes and surfing strong ones feels kite-like; collecting chains is satisfying |
| Mechanical depth | 7 | Build vs. forecast trade-offs, lift/weight lanes, strain management, ring chains vs. safety |
| Game feel | 7 | Kite sways and wobbles by steadiness, string sag, tumble on loss, strain ticks with rising pitch |
| Visual identity | 7 | Painted kites with bows, streaked wind lanes, sunny hill with pals; changes per forecast |
| Animation quality | 7 | Tail bows wave, Bolt jogs, fans hop on collects, gulls flap |
| Audio quality | 6 | Coin pitch ladder on stars, combo chime on rings, strain ticks, snap/whoosh; dream music intensifies with strain |
| Controls | 7 | Hold-anywhere altitude control with target marker, arrow keys, large workshop buttons |
| Onboarding | 7 | Forecast tip from Bolt, stat bars explain choices, flight hint and a safe first segment |
| Replayability | 7 | Random forecast each run invites a different build; escalating storms and gulls |
| Performance | 9 | Few draw calls, bounded streak particles and items |
| Technical robustness | 8 | Clean restart, resize-safe layout, game-clock only, exposed hooks for every system |
| Overall polish | 7 | Complete workshop → flight → card loop, attract flight |

## Next recommended action
Human playtest to tune sink/strain rates per forecast; add lightning flashes to storm lanes and a free-draw decal slot.
