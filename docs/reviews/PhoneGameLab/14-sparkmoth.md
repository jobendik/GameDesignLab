---
id: PhoneGameLab/14-sparkmoth
title: Sparkmoth
was: 14-bullet-hell (Bullet Hell)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Drag a ship to dodge bullets for as long as possible; random rings, aimed shots, walls with a gap and a spiral.

## Baseline assessment
45-line prototype: the ship snapped to 30 px above the finger, patterns were picked at random every frame-ish with no
telegraph (rings could spawn on top of the player), one hit ended the run, hue-coded dots on a smeared black
background, score = time × 10, no best score, no sound beyond nothing at all. Overall 2/10.

## Weaknesses identified
Unfair spawns, no authored escalation, no reason to take risks, thumb covers the action, zero identity, no audio.

## Creative opportunities
Bullets *are* fireworks: shells that whistle up to a marked point before bursting are a natural, beautiful telegraph, and
"a moth drawn to the light" is a natural reason to graze.

## Planned improvements
Drag-relative movement, tiny explicit hitbox, graze → multiplier + flare (auto-bomb), nine authored named patterns in
three acts with an encore loop, three lives, dusk-festival identity.

## Implemented improvements
- **Movement**: the moth copies the thumb's motion at 1.2× from wherever it is (finger never covers it); arrows/WASD with
  Shift for slow precise movement; mouse drag works the same way.
- **Hitbox**: only the 3 px pink-white heart can be hit (sparks collide at 62% of their radius); wings are cosmetic.
- **Skim system**: each spark passing within ~21 px counts once: +points, raises heat (×1–×5 multiplier that decays when
  you play safe) and charges the glow ring around the moth. Full ring = flare armed: the next hit is absorbed, every spark
  on screen becomes points. While armed, skims are worth double — greed is rewarded.
- **The show**: Peony, Salute, Willow · Pinwheel, Waterfall, Crossette · Comets, Chrysanthemum, Grand Finale — rings,
  aimed fans, gravity-drooping streams, a reversing spiral, walls whose gap wanders reachably, sparks that stop and split,
  line-telegraphed fast trains, triple offset rings and a combination finale. Shells show a shrinking reticle for 0.9 s,
  lanterns glow for 1 s before firing, comets draw a dashed line for 0.75 s. After the finale: ENCORE (faster, denser, +1 life).
- **Fairness**: 3 lives, 2.3 s of blinking invulnerability and a sky-clear after a hit; the first pattern is five slow rings.
- **Feel/audio**: whistle per shell, soft pitched booms, skim ticks whose pitch climbs with the multiplier, chime/flash/
  slow-mo flare, shake + hit-stop on damage, "drive" music whose intensity follows act, encore and heat.
- **Look**: baked dusk sky with moon, stars, rooftops and a lantern string; glowing spark sprites in seven colours; progress
  pips for the nine patterns; act banners.

## Test results
- Smoke: pass (60 fps headless, survives resize/blur).
- Gameplay test `tests/PhoneGameLab/14-sparkmoth.test.js`: pass — CDP touch drag moves the moth by exactly 1.2× the drag
  and away from the finger, keys move, the show spawns sparks, survival scores, single skim counted once, skim stream arms
  the flare and raises the multiplier, flare absorbs a hit and clears the sky for points, three unshielded hits end the run,
  best saved, clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, several patterns, game over).
- A look-ahead dodge bot (never skims) loses about one life per loop at tier 1, so the patterns are all survivable;
  human difficulty is an informed guess — **no human playtest**.

## Remaining issues
- Tier-1 density is moderate by genre standards; real pressure arrives in the encore.
- Flare triggers automatically on hit; there is no manual bomb.
- Patterns do not adapt to landscape (the stage is portrait-framed there, which works but is small).
- Leftover sparks from one pattern overlap the start of the next by design; not tuned by people.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Clear dodge loop with distinct, named set pieces every ~10 s |
| Mechanical depth | 8 | Skim risk/reward drives both score multiplier and survival resource |
| Game feel | 8 | 1:1 drag, skim sparks/ticks, flare slow-mo, weighty hit feedback |
| Visual identity | 9 | Fireworks-as-bullets over a festival skyline; reads from a thumbnail |
| Animation quality | 7 | Wing flap/tilt, shell trails, lantern warm-up; sparks themselves are simple |
| Audio quality | 7 | Whistles, booms, climbing skim ticks; music reacts to act and heat |
| Controls | 9 | Relative drag with offset, keyboard with focus-slow, tiny honest hitbox |
| Onboarding | 8 | In-world hint, glowing heart, trivially easy first pattern |
| Replayability | 8 | Score/multiplier chase, encore tiers; pattern order is fixed (learnable) |
| Performance | 9 | Sprite-baked sparks, ≤520 bullets, 60 fps headless |
| Technical robustness | 8 | Clean restart, resize clears and re-lays out, timers on game clock |
| Overall polish | 8 | Coherent start to finish |

## Next recommended action
Human playtest for tier-1 density and flare economy; consider a manual flare (two-finger tap / Space).
