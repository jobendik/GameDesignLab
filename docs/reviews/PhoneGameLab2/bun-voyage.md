---
id: PhoneGameLab2/bun-voyage
title: Bun Voyage
was: cupid-tom / "Cupid Tom"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
Drag back and release to fire an arrow from the bottom centre at hearts bouncing in the upper half; 30-second timer;
one point per heart.

## Baseline assessment
~30 lines, no metadata or IIFE, line-drawn arrows, circle hearts, `Lab.beep`, timer text in a corner. Named after the
commercial app's character; mechanically a weaker copy of Windfletch (PhoneGameLab/17, draw-back archery).

## Weaknesses identified
- Aim-and-fire at random bouncers: no reading, no leading, no choices.
- No failure state beyond a timer, no progression, no character.
- Too close to Windfletch's control scheme.

## Creative opportunities
- Turn "shoot at flying things" into "deliver to flying things": the target must *receive* the projectile, so the
  arc's hang time and the target's motion become the skill.
- Orders give each throw a decision (which balloon does this bake belong to?) and a stake (hungry pals drift off).
- Bun (gentle, tidy, anxious baker) is the natural thrower; the rest of the cast ride the balloons.

## Planned improvements
Touch-the-apex lob with a preview arc; balloons with passengers and orders; wrong-bake refusals; hearts for hungry
balloons; swap the held bake; combo/swish/height scoring; rounds with wind, a third bake, double orders, gusts, geese.

## Implemented improvements
- **Lob**: touch (and drag to adjust) the point where the lob should peak; release throws. Hang time is
  √(2h/g), so higher baskets need more lead. Preview shows the windless arc and a reticle. Keyboard: arrows move
  the reticle, Space/Enter throws, X/Shift swaps.
- **Catching**: the passenger catches a bake that floats into the basket zone; one that comes down from above hits
  the envelope and bounces off; one rising fast smacks the basket bottom. Wrong bake → "Not cake!", tossed back.
- **Orders & choice**: bread/cake (pie from round 3) drawn as distinct shapes; the bake in Bun's paws and the one on the
  counter can be swapped by tapping Bun or the counter. The queue favours wanted bakes and re-stocks the counter if
  nothing in hand is wanted. A balloon that leaves with an open order costs a heart; three hearts.
- **Scoring**: (10 + height bonus) × combo (×5 cap) per delivery, +5 swish (dead-centre, no bounce), +20 per completed
  order; round bonus 50 × round. Combo breaks on a splat, a wrong bake or a hungry balloon.
- **Ramp**: round quota 4, then +3+round; more and faster balloons (up to 4); wind from round 2 (bunting and chevrons
  show it; the preview ignores it); pie + double orders round 3; gusts and goose flocks that knock bakes away round 4+.
- **Actors**: Bun looks at the reticle (`think`), crouches, throws (arms up, stretch), cheers on combos, frowns on
  splats, and gets flushed/`scared` as unserved balloons near the edge. Passengers peek over the rim, look at Bun,
  cheer when served, scowl at the wrong bake, droop when they leave hungry.
- Identity: sunny pastel morning, pink-striped stall with bunting, cream village towers, balloons striped in each
  passenger's colours, wicker baskets that show the delivered bakes; bounce music that rises with Bun's nerves.
- Live attract scene with an autopilot using the same lead solver as the tests.

## Test results
- Smoke (`node tools/smoke.js bun-voyage`): pass, 61 fps.
- Gameplay test (`node tools/run-tests.js bun-voyage`): pass three times in a row (10 s). Real mouse press/release leads
  a moving balloon and delivers (HUD agrees), combo builds, wrong bake refused and combo broken, tapping Bun swaps,
  stray lob splats, tailwind moves the lead point upwind by >40 px and the corrected lob delivers, quota opens round 2,
  hungry balloon costs a heart, last heart ends the run, best recorded, Enter restart is clean.
- Screenshots inspected at 390×844, 844×390, 1280×800 (play, aim preview, round 4 with geese and wind, splash). Fixed:
  the envelope blocked every descending lob (switched to apex lobs + catch zone), a tossed-back bake re-caught itself
  in a loop (crashed the page), stalls with no wanted bake (swap + restock), tiny landscape scale, held bake over
  Bun's face, slow pacing (round 4 now at ~45 s of good play).
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- The preview reticle makes early rounds easy; the challenge relies on balloon speed, wind and juggling orders.
- Geese fly low; they rarely matter unless you lob across them.
- Mid-screen sky in portrait is empty between the balloon band and the stall.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Leading a bobbing basket and watching the pal catch it is satisfying; order juggling adds pressure |
| Mechanical depth | 7 | Lead + hang time, wind, swap decision, combo/swish/height, hungry-balloon triage |
| Game feel | 7 | Wind-up squash, whoosh pitched by height, catch stars, combo ladder, envelope boing |
| Visual identity | 7 | Bright bakery-under-balloons look, distinct bake shapes; backgrounds fairly plain |
| Animation quality | 7 | Swaying balloons, bunting in the wind, reacting passengers, rising delivered balloons |
| Audio quality | 6 | Pitch carries combo and height; stock presets; music intensity follows nerves |
| Controls | 8 | One touch: press, adjust, release; generous catch zone; throw buffering; keyboard too |
| Onboarding | 7 | Preview arc + reticle teach the lob; round toasts introduce wind, pie, geese |
| Replayability | 7 | Random riders/orders/wind, escalating rounds, score chase |
| Performance | 8 | 61 fps; bakes and envelopes baked as sprites; bounded entities |
| Technical robustness | 8 | Clean restart, resize rescales the balloon band, no errors in three runs |
| Overall polish | 7 | Complete loop with live attract and stats (deliveries, best combo, swishes) |

## Next recommended action
Add a late-round twist that changes the throw (e.g. a VIP balloon that only accepts swishes, or a basket that opens
and closes) and fill the portrait mid-sky with scenery that drifts with the wind.
