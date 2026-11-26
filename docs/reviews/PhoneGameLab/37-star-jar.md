---
id: PhoneGameLab/37-star-jar
title: Star Jar
was: 37-suika-merge (Suika Merge)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Drop-and-merge physics toy: tap to drop a circle, equal circles merge into the next size, lose when the pile passes a line.

## Baseline assessment
66-line prototype: flat hue-coded circles, one-pass collision (piles jittered and sank into each other), tap-only drop with
no aiming feedback, instant unexplained game over, single beep, no best score. Overall 2/10.

## Weaknesses identified
Unstable physics; no anticipation or impact; no identity (named after and shaped like an existing commercial game); no
progression feedback; game over triggered by any slow body near the line with no warning.

## Creative opportunities
Give the bodies character, make chains musical, make the jar's fullness audible, reward the rare top-tier fusion spectacularly.

## Planned improvements
Stable solver; drag-aim with guide; original cozy-space identity; chain multiplier; overflow countdown; supernova; reactive music.

## Implemented improvements
- Fixed-step (120 Hz) solver with mass-weighted separation, restitution and tangential friction — piles settle and roll.
- Drag/keys to aim with a damped holder, drop guide, next-piece preview, 0.42 s cooldown.
- Original identity: eleven celestial bodies (Dust → Sun) with baked gradient sprites, surface detail and sleepy faces that
  blink, look where they roll and gape while falling; twinkling starfield, glass jar, evolution strip.
- Fusion feedback: squash on impact, pop-in, particles, shockwave ring, neighbour shove, score popups, hit-stop and shake
  scaling with tier, pentatonic chime ladder that climbs with tier + chain.
- Chain multiplier (fusions within 1 s, capped ×8); banners for newly discovered big bodies.
- Two Suns → SUPERNOVA: slow-mo, flash, clears nearby bodies with a ×10 bonus.
- Fair loss: overflow line arms a visible 2.2 s countdown with warning pulses.
- Dreamy generative music whose intensity tracks jar fullness; best score, stats, pause, restart via engine.

## Test results
- Smoke: pass (60 fps headless, no errors, survives resize/blur).
- Gameplay test `tests/PhoneGameLab/37-star-jar.test.js`: pass — drop, deterministic fusion + scoring, touch drop,
  overflow → game over, best persisted, clean restart.
- Screenshots inspected at 390×844 and 1280×800 (splash, play, pause, game over).
- Subjective assessment from scripted play only (no human playtest).

## Remaining issues
- Chain multiplier can be sustained by rapid centre-dropping early on; could decay per drop instead of per second.
- No rotation-based rolling friction; very tall piles can creep slightly.
- Landscape 844×390 is playable but the jar is small (portrait-first design).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Proven loop; chains and shoves create "one more drop" moments |
| Mechanical depth | 7 | Placement, shove physics, chain timing; no power-ups or modes |
| Game feel | 8 | Squash, pop, ring, hit-stop, shake and pitch all scale with tier |
| Visual identity | 8 | Distinct cozy-space look with characterful bodies |
| Animation quality | 8 | Blink/look/gape faces, pop-ins, damped holder |
| Audio quality | 8 | Musical fusion ladder, reactive music, informative pitches |
| Controls | 8 | Drag, tap or keys; damped aim; cooldown shown by ghosted holder |
| Onboarding | 8 | Three-line splash; first drop teaches the rest |
| Replayability | 7 | Score chase + discovery strip; no daily/variant modes |
| Performance | 9 | 60 fps with baked sprites; O(n²) pairs fine at ≤ 60 bodies |
| Technical robustness | 8 | Clean restart, resize clamps bodies, engine pause |
| Overall polish | 8 | Cohesive start to finish |

## Next recommended action
Human playtest for difficulty pacing; consider a "zen" (no overflow) mode and per-drop chain decay.
