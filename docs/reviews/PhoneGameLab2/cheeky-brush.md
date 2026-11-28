---
id: PhoneGameLab2/cheeky-brush
title: Cheeky Brush
was: face-designer / "Face Designer"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Face Designer": pick one of seven colours, drag to draw 8 px lines clipped to a flat yellow oval face. Free play,
no score, no end.

## Baseline assessment
2/10. A finger-paint toy with no goal, no character and no feedback; the paint covers the features; the palette sits
where `Lab.hint` would be.

## Weaknesses identified
- Nothing to aim for, nothing to judge, no session shape, no replay reason.
- Painting area is tiny on a phone and the "face" is a placeholder.

## Creative opportunities
- Face painting at a fair: real pals queue, each asks for a design; you copy it on their cheek or forehead.
- A likeness score that is generous but honest (coverage × tidiness, colour-aware) turns the toy into a skill game.
- A camera that zooms onto the cheek gives a big painting surface, then pulls back for a "mirror" reveal.

## Planned improvements
Design library with tiers, guided → freehand progression, ticklish (moving) faces, likeness scoring with stars,
time-attack fair with time bonuses, Olli as host with a hand mirror.

## Implemented improvements
- **Paint**: six glossy paints on a wooden palette (keys 1–6), thick round brush, undo (Z), DONE (Enter). Strokes
  are stored in the face's own coordinates, so they stay put when the face moves. The customer's eyes follow the
  brush and they giggle (closed-eye joy, little wobble) when you paint long strokes.
- **Orders**: 12 designs in three tiers — heart, star, lightning bolt, spiral; sunshine, whiskers, moon & star, fish;
  rainbow (3 colours), flower (2), butterfly (3), paw print. Customers rotate Nori, Pip, Bun, Momo; cheek or forehead.
  The first three show a dotted guide, the next three a faint one, then freehand; from the 7th customer faces wiggle
  (stronger each time).
- **Likeness**: target and painting are rasterised to 64×64 masks per colour; coverage (right colour 1, wrong colour
  0.4, 2-cell tolerance) × (0.35 + 0.65 × tidiness). Stars at 80/60/35 %. Score = likeness + 50 for 3 stars (+10 per
  streak) or +20 for 2; time bonus +8/+4/+1 s on a 90 s fair clock — neat and fast keeps the stall open longer.
- **Reveal**: DONE eases the camera from the close-up to a full view; Olli walks in with a hand mirror, the customer
  looks, cheers or frowns, stars pop, Olli comments; the customer walks off and the next one walks in and the camera
  dives back onto the paint zone.
- **Identity**: striped fair tent, bunting in the paint colours, wooden palette, cream order card with a live preview
  of the design; dream music that intensifies in the last 30 s; ticking under 10 s.

## Test results
- Automated-technical: `node tools/smoke.js cheeky-brush` — pass.
- Automated-gameplay: `node tools/run-tests.js cheeky-brush` — pass three runs in a row (~16 s): mouse strokes paint
  in the selected colour, undo removes, a traced heart scores ≥ 80 % (3 stars, score, HUD, +8 s), a blue scribble on a
  yellow star scores < 50 %, the likeness metric (exact ≈ 100, wrong colour < 40, one arc of three partial), time-up
  shows the neutral "The fair is closing!" card, restart is clean.
- Visual inspection: portrait, landscape, desktop close-ups and mirror reveals, splash. Fixes: close-up was so zoomed
  the face became abstract (zoom reduced), a second Olli on the landscape card during the reveal, bubble colliding
  with the stars (moved over Olli in the reveal), mirror view enlarged in portrait.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- The likeness thresholds were tuned against scripted traces, not real fingers; freehand designs may feel strict or
  lenient to real players.
- Paint goes over the pal's features if you stray (no masking under eyes); designs avoid the eyes by placement.
- Bolt and Olli are never customers (robot screen face / Olli is the host).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Copy-the-design with a mirror payoff is satisfying and calm, with a clock for tension |
| Mechanical depth | 6 | Speed vs. neatness, colour switching, fading guides, moving faces |
| Game feel | 7 | Glossy strokes, giggles, camera pull-back, stars and confetti, time bonus toast |
| Visual identity | 8 | Fair stall, giant close-up of a pal's cheek, bunting in paint colours |
| Animation quality | 7 | Camera easing, walk-in/out, wiggle, mood changes, star pops |
| Audio quality | 6 | Brush swish/slide, pitched palette ticks, verdict stingers, last-10-s ticks |
| Controls | 7 | Direct finger painting, big swatches, undo/DONE ≥ 52 px, keyboard shortcuts |
| Onboarding | 8 | Dotted guide on the first customers, card preview, contextual bubbles |
| Replayability | 7 | 12 designs × zones × customers, time-attack scoring, ticklish late customers |
| Performance | 8 | Mask rasterising only on DONE (64×64), baked background |
| Technical robustness | 8 | Clean restart, resize re-layout, face-relative strokes survive the camera |
| Overall polish | 7 | Complete fair loop with themed close |

## Next recommended action
Human playtest to tune likeness thresholds; add symmetric "both cheeks" designs and customer-specific favourites.
