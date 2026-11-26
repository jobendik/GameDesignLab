---
id: PhoneGameLab/42-bamboo-span
title: Bamboo Span
was: 42-bridge-build (Bridge Build)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
One-button timing: hold to grow a vertical bridge, release, it tips over; if its tip lands on the next platform the
hero walks across, otherwise falls.

## Baseline assessment
62-line prototype: grey rectangles on navy, a yellow square hero, a 4 px white line for the bridge, constant random gaps,
no perfect zone, no pickups, no audio beyond nothing at all, instant unexplained death, leftover dead code in the draw
path, no best score. Overall 2/10.

## Weaknesses identified
No identity (and the layout of an existing commercial stick-bridge game); nothing to do while the hero walks; a single
outcome per landing (pass/fail) so no risk/reward; flat difficulty; an accidental tap kills the run; no feedback for
length other than watching the line; unbounded platform list; portrait-only maths.

## Creative opportunities
Make length *audible*; give the crossing itself a job; let the player gamble on distance; turn pickups into a
forgiveness tool rather than plain points; make the world change as the run goes on.

## Planned improvements
Bamboo that grows node by node with a rising click ladder; a pangolin that curls up and rolls (so "can't stop at the
end of the stalk" makes sense); perfect mat + streak; two-pillar LEAP; hop while rolling for fireflies → lantern rescue;
drifting islets, gold bamboo, crumbling pillars, crows; four valleys with different light.

## Implemented improvements
- Original identity: misty karst valley drawn in code (two parallax peak layers, baked limestone pillars with grass caps,
  drifting cloud bands), a scaled pangolin (standing sprite + rolling ball sprite), jade/cream/vermilion palette that
  crossfades through Dawn Mist → Jade Noon → Amber Dusk → Moon Hush every 10 pillars (HUD retinted for the night valley).
- Feel: stalk grows segment by segment with leaves and a live shoot tip; each node plays the next note of a pentatonic
  ladder plus a wood tick, so players learn to *count* a gap; toppling uses angular acceleration and a damped bounce on
  landing; dust, shake, squash on arrival, a little joy-hop after a perfect; unsupported stalks sag under the pangolin
  before it rolls off the tip.
- Risk/reward: red mat (±7 units) = PERFECT with a streak (2…5 points, rising chime); a stalk long enough to reach the
  second pillar is a LEAP (points ×2, skips a pillar); tiny star-topped pillars pay +2.
- The crossing is active: tap (buffered) to hop for fireflies; five light a lantern that rescues one fall; crows hover
  at rolling height from pillar 14 — bonk one and you lose the streak and two fireflies.
- Curve: first three pillars are fixed, wide and show a dashed "tip goes here" band on the stalk; then gaps widen
  (44–178), pillars narrow (100→46), growth speeds up (150→212 u/s); drifting islets from pillar 8, gold bamboo (×1.45
  growth, signposted) from 12, crows from 14, crumbling pillars with a visible countdown from 18.
- Fairness: ±3 unit edge tolerance; a release under 14 units just shrivels the shoot back; holding through the arrival
  is buffered; hops are buffered 140 ms; a finger lifted while paused cannot leave the stalk growing.
- Robust: world units + camera, layout from `Lab.play` (orient "any": landscape shows 6–7 pillars ahead), sprites keyed
  by scale and cleared on resize, particles shifted with the camera, keyboard (Space/Up/Enter hold), `Lab.expose` hooks.

## Test results
- Gameplay test `tests/PhoneGameLab/42-bamboo-span.test.js`: pass — mouse hold → perfect (+2, streak 1); touch tap is
  forgiven; keyboard hold + hop catches a firefly; LEAP skips a pillar and pays double; lantern rescue; fall → game over,
  best recorded; clean restart.
- Smoke `tools/smoke.js 42-bamboo-span`: pass (61 fps headless, survives resize/blur).
- Screenshots inspected at 390×844, 844×390 and 1280×800: splash, first pillars with tutorial band, mid-run (dusk,
  drifting islets, gold bamboo) and pillar 31 (moon valley, crows, lit lantern). Fixed after round one: oversized sun in
  landscape, two-line tagline, unreadable unlit lantern icon, a noisy foreground layer.
- Subjective assessment is from reading the code and watching scripted play, not a human playtest.

## Remaining issues
- In portrait the second pillar is often off-screen, so LEAP is mostly a landscape/desktop (or memory) play.
- Drifting islets are judged at the moment the stalk lands; there is no extra telegraph of where the islet will be.
- One song style for the whole run (intensity rises with distance and streak, but the night valley has no theme of its own).
- No human tuning of the late curve (crumble timers, crow frequency).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Hold-release-roll loop is immediate; perfect streaks and hops keep every crossing busy |
| Mechanical depth | 7 | Centre vs safe, LEAP gamble, firefly/crow hops, lantern economy; still a one-button game |
| Game feel | 8 | Audible growth ladder, topple + bounce, sag before a fall, hit-stop and ring on perfects |
| Visual identity | 9 | Karst valley and pangolin are unmistakable in a thumbnail; four lighting moods |
| Animation quality | 8 | Growing shoot, rolling ball, squash, lantern float, drifting/sinking pillars |
| Audio quality | 8 | Pitch = length, streak ladder, firefly arpeggio, heartbeat on crumbling pillars, reactive music |
| Controls | 8 | Touch, mouse and keyboard; buffered holds and hops; forgiven taps |
| Onboarding | 8 | Fixed first gaps with a target band; firefly hint appears when the first one does |
| Replayability | 7 | New pillar kinds to pillar 18+, valleys, streak/leap score chase; no modes |
| Performance | 9 | Everything baked; ≤ 12 pillars and a handful of particles on screen |
| Technical robustness | 8 | Clean restart, resize re-bakes, pause-safe input, tested rescue/fail paths |
| Overall polish | 8 | Coherent from splash (live scrolling valley) to game-over stats |

## Next recommended action
Human playtest of pillars 15–40; consider a small ghost of the second pillar at the screen edge in portrait so LEAPs
can be read there too.
