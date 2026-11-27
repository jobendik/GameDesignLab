---
id: PhoneGameLab2/sunny-soak
title: Sunny Soak
was: balloon-splash (Balloon Splash)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Throw water balloons at moving targets. The prototype was "tap the bouncing circles for 30 seconds": no throw, no
travel time, no targets with behaviour.

## Baseline assessment
28-line placeholder: hue-random circles bouncing in a box, tap-to-delete, one beep, hard 30 s timer, no best score,
no identity. Overall 2/10.

## Weaknesses identified
Nothing is thrown; no aiming skill; no fail pressure other than the clock; no feedback; no character.

## Creative opportunities
A heat-wave garden party where the targets *want* to be hit, each pal moving in character, and the fill-level of the
balloon as a physical risk/reward decision made with one thumb.

## Planned improvements
Lobbed balloons with flight time and area splash; tap vs hold-to-fill; limited tub; heat meter instead of a timer;
five pal behaviours introduced one per level; a pal you must not hit; late-game formations.

## Implemented improvements
- Pip stands on the deck with a tub of five balloons (refills one per ~1 s). Tap = quick small balloon; hold = fill a
  bigger one (wider splash ring shown live on the lawn, slower flight); hold past the wobble and it bursts over Pip
  (stun, balloon lost, streak lost). Throws are buffered during the 0.22 s re-arm.
- Balloons take 0.46–0.62 s to land, so you lead the target; a splash soaks everyone inside it: DOUBLE/TRIPLE bonuses,
  bullseye bonus, streak multiplier up to ×5 (a miss resets it).
- HEAT replaces the clock: it climbs by itself (faster each level), jumps when a pal leaves dry or Bolt gets wet, and
  every soak cools it; level-ups give relief. Full meter = "Phew — too hot!".
- Cast in character: Bun ambles, Momo hops in a sit-then-leap rhythm, Nori belly-slides fast, Olli hides under an
  umbrella that only a ≥ half-full balloon gets past, Bolt (warning sign, looks up scared when a balloon is coming)
  must stay dry. From level 4 crossings, level 6 conga lines of three, level 7 Bolt escorts a hot pal one lane over.
- Pals are flushed, droopy-eyed and sweating until soaked, then squash, cheer and scamper off dripping. Pip tracks the
  aim point, strains while filling, stretches on the throw, cheers on hits, goes dizzy when he bursts one on himself.
- Identity: bright mown lawn with flower dots and lane strips, wooden deck and hedge under a sky strip, candy
  balloons, fading puddles; sun icon that reddens and swells with the meter; orange haze as it gets critical.
- Audio: rising fill tone that warbles when over-full, splash pitched by size, streak ladder, zap, warning pulses,
  "funk" music whose intensity follows the heat. Live attract scene behind the splash card.

## Test results
- Smoke (`tools/smoke.js sunny-soak`): pass, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab2/sunny-soak.test.js`): pass — real tap leads and soaks a bunny (score/HUD/heat),
  hold fills, over-fill bursts, umbrella small vs big, one splash/two pals, Bolt penalty, dry escape, empty tub and
  refill, heat-out game over + best, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (play, splash, game over); fixed HUD contrast on the light
  theme, muddy "hot" tints, Pip's balloon overlapping the meter.
- Balance probe: an accurate single-target bot holds the heat flat for ~60 s and melts at level 8 after ~90 s; the
  first tuning pass (heat pinned at 0 through level 5) was retuned.
- Subjective assessment from scripted play and code reading only (no human playtest).

## Remaining issues
- Pointer only (no keyboard aiming).
- In 844×390 landscape the pals are small (≈38 px) and the lawn only fits three lanes.
- Pals are drawn front-on even when walking sideways (pals.js has no profile/walk pose).
- Heat climbs steeply from level 6; human tuning of that knee is untested.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Lead-and-lob is satisfying immediately; doubles and umbrellas give "one more" moments |
| Mechanical depth | 8 | Fill size vs time vs tub, leading five movement types, multi-splash lines, a no-hit pal |
| Game feel | 8 | Instant fill on touch, wobble warning, arc + shadow + landing ring, squash on soak, hit-stop on multis |
| Visual identity | 8 | Sunny garden-party look, unlike the other three in the batch |
| Animation quality | 8 | Hop cycle, belly slide, umbrella wobble, sweat/drip states, Pip's strain and stretch |
| Audio quality | 7 | Fill tone and pitched splashes carry information; small palette |
| Controls | 8 | One thumb, buffered, generous radii; no keyboard |
| Onboarding | 8 | Level 1 is only slow bunnies; each new pal is announced with a one-line toast |
| Replayability | 8 | Formations and five behaviours through level 7+, streak/score chase |
| Performance | 9 | ≤ 9 runners, baked backdrop, 60 fps headless |
| Technical robustness | 8 | Restart/resize clean, lost pointer-up handled, loop sound stops with the run |
| Overall polish | 8 | Cohesive loop; landscape is the weak viewport |

## Next recommended action
Human playtest of the level-6 heat knee and the over-fill window; consider a rare "sprinkler" pickup for late levels.
