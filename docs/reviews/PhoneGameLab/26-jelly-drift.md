---
id: PhoneGameLab/26-jelly-drift
title: Jelly Drift
was: 26-flappy (Flappy Tap)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
One-button gap threader: tap for an upward impulse, gravity does the rest, pass through gaps in pillars for a point each.

## Baseline assessment
30-line clone named after and shaped like a well-known commercial game (yellow ball, green pipes on cyan). Tap fired on
release, constant gap and spacing, exact-circle hitbox, death by leaving the screen, one beep, no best score. Overall 2/10.

## Weaknesses identified
No identity of its own; input lag (tap-on-release); nothing to master beyond survival; no difficulty curve; instant
unexplained deaths; no feedback or world.

## Creative opportunities
Give the flap a second half: what you do *between* pulses. A jellyfish is the natural owner of a "pulse", and its bell
can spread like a parachute — so holding becomes a glide, and the reef can be built from obstacles that need it.

## Planned improvements
Original underwater identity and creature; pulse + hold-to-drift; pearls on the centre line for a combo; gate variety by
depth tier; a shield pickup for one mistake; fair hitboxes; get-ready state.

## Implemented improvements
- **Twist on the flap**: tap = pulse (instant, on pointer-down / Space / ↑ / W). Keep holding and, once the pulse is
  spent, the bell spreads: gravity ×0.16 and sink speed capped at 62 u/s. Release to sink normally (max 460 u/s).
- **Reef built for it**: coral gaps (static) → sliding sea-whips from depth 3 (gap centre oscillates, chevrons show the
  direction) → long rock tunnels from depth 4 that reward a level glide and carry three pearls.
- **THREAD combo**: each gap has a pearl on its centre line; consecutive pearls pay +1…+5 with a rising pentatonic
  ladder; skipping one resets the thread. Mastery (centre line every time) is worth ~5× a survival-only run.
- **Bubble shield**: occasionally floats on the far side of the lane from the next gap — a detour that absorbs one hit
  (pop, 1.4 s of blinking invulnerability, bounces off the seabed).
- **Fairness**: hit radius 13 u against a ~44 u bell, pillar hitbox inset, the surface is a soft ceiling, the first two
  gaps are extra wide and level with the start, vertical change between gaps is bounded by tier, the run waits for the
  first pulse, lethal seabed is signposted with urchins.
- **Progression**: every 8 gaps is a depth tier (banner, faster scroll, tighter gaps, new gate types); the water blends
  Sunlit Shallows → Kelp Garden → Twilight Shelf → Glow Trench.
- **Identity & animation**: procedural moon jelly — bell squashes on a pulse and widens on a glide, four damped tentacle
  chains trail against the motion, blinking face that gapes when sinking fast and closes its eyes while drifting, ink
  cloud and X-eyes on a hit; light shafts, parallax reef silhouette, swaying kelp, fish, rising bubbles, baked pillars.
- **Audio**: bloop per pulse (pitch creeps up with the thread), swish when the bell opens, tick per gap, chime ladder for
  pearls, pop/glass for the shield; "chill" music whose layers follow depth and thread.

## Test results
- Smoke (`node tools/smoke.js 26-jelly-drift`): pass, 61 fps headless, survives landscape resize + blur.
- Gameplay test (`tests/PhoneGameLab/26-jelly-drift.test.js`): pass 3/3 runs — touch tap and Space pulse, real
  pointer-hold glide (capped sink, release restores it), an in-page pilot using the game's own pulse/hold actions threads
  9+ gaps, pearls add combo points, tier rises, shield absorbs one hit, seabed ends the run, best saved, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800: splash, get-ready, depth 1–2 play, tunnel in the Glow Trench,
  death. A 42 s scripted run reached 27 gaps / depth 4 without errors.
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- Tunnel art is a plain slab compared with the coral pillars.
- Tier pacing (8 gaps, gap 236→136 u) is reasoned from the pulse height (≈60 u), not human-tuned.
- Only three gate types; no late-game surprises beyond tighter numbers after depth 8.
- In 844×390 landscape the portrait stage is narrow (playable, small).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Familiar loop made calmer and more controllable by the glide; pearls give every gap a target |
| Mechanical depth | 7 | Two verbs, combo line, shield detour, three gate behaviours |
| Game feel | 8 | Same-frame pulse, bell squash/spread, trailing tentacles, hit-stop + ink on death |
| Visual identity | 8 | Recognisable pink jelly on turquoise-to-violet water; original pillars and seabed |
| Animation quality | 8 | Tentacle chains, expressive face, swaying kelp, moving gates |
| Audio quality | 7 | Informative pitches, calm reactive music; presets only |
| Controls | 8 | One finger, instant, generous hitbox; keyboard equivalent |
| Onboarding | 8 | Get-ready hover with two-line prompt, trivially wide first gaps |
| Replayability | 7 | Thread chase + tiers; no modes or unlocks |
| Performance | 9 | Baked pillars/reef, ≤ 5 gates live, 61 fps headless |
| Technical robustness | 8 | Unit-based world rescales on resize, clean restart, engine pause |
| Overall polish | 8 | Cohesive start to finish |

## Next recommended action
Human playtest for tier pacing; add one late gate type (e.g. a current that pushes up or down) and richer tunnel art.
