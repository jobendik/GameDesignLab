---
id: PhoneGameLab/31-sinkstones
title: Sinkstones
was: 31-disappearing-tiles (Vanishing Tiles)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
A 4×6 grid of tiles that randomly fade out and respawn; tap an adjacent tile to step, die if you step on (or stand
on) a missing one. Score = steps.

## Baseline assessment
41-line prototype: flat blue squares on black, a yellow rectangle as the player, random per-tile lifetimes with no
pattern, nowhere to go, instant unexplained death, one beep, no best score. Overall 2/10.

## Weaknesses identified
No goal and no pattern, so nothing to learn or plan; survival was luck; tap-only on release; no telegraphing; no
character, no sound, no progression.

## Creative opportunities
"Tiles vanish" is far more interesting as *memory*: show the safe stones, take them away, and make the player walk
the picture in their head while the ground under them is impatient.

## Planned improvements
Reveal-then-sink memory path; crossing a pond as the goal; patience timer on the current stone; lives; streak
multiplier; night-pond identity with a flame character; musical path.

## Implemented improvements
- **Core loop**: each pond generates a self-avoiding path from the near bank to the far bank. Stones rise one by one
  (each with its own kalimba note), hold, then sink. All cells then look identical (a faint ring). Hop from memory;
  a remembered stone resurfaces, lights up and replays its note, so a clean crossing plays the melody back.
- **Movement under pressure**: the stone you stand on has a visible patience ring (wobble, ticks, vignette) and
  sinks if you linger; left stones sink behind you; SWIFT bonus for beating par.
- **Fair failure**: three flames. Water/timeout costs one, returns you to the last safe stone and makes its unvisited
  true neighbours glint as a hint. Pond 1 also shimmers the next true stones as a tutorial.
- **Depth**: streak multiplier (×1–×6, every 5 stones, carried across ponds, reset by a miss); firefly side-stones
  off the route (bonus; three rekindle a lost flame or pay +150); cracked decoy stones from pond 5 that rise with
  the path but crumble; FLAWLESS bonus; grids 3×4 → 5×7 with longer runs, faster reveals, shorter patience.
- **Controls**: touching the neighbouring stone hops instantly on pointer-down; otherwise a tap hops toward the tap
  and a 26 px swipe hops in the swipe direction; arrows/WASD; one hop is buffered; walk along the bank to line up.
- **Identity**: moonlit teal pond, baked mossy stone sprites, reeds, stone lanterns that light when a pond is
  crossed, a flickering flame with eyes whose tip trails behind hops; splash + hiss + steam when doused; chill
  music whose intensity follows pond number and patience.

## Test results
- Smoke (`tools/smoke.js 31-sinkstones`): pass, 61 fps headless, no errors.
- Gameplay test (`tests/PhoneGameLab/31-sinkstones.test.js`): pass — input ignored during the reveal, key hops and a
  real touch on a stone score and build a streak, lingering costs a flame and respawns in place, finishing the path
  clears the pond with a bonus and starts pond 2, water hops drain the flames → game over, best recorded, clean
  restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, reveal, mid-crossing, pond 6 with decoy and
  fireflies, game over).
- Subjective assessment from code + scripted play only; no human playtest, so reveal speed and patience values for
  later ponds are estimates of what memory can handle.

## Remaining issues
- Small ponds leave tall empty banks on a phone; the HUD strip is tight in the 265 px landscape stage.
- Transition between ponds is a scroll illusion (ripples + flame move) rather than a true camera move.
- Fireflies stay visible after the stones sink, which makes their stone easy; arguably too generous.
- No endless-mode variety beyond pond 8's parameters.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Watch → recall → hop is tense and satisfying; melody payoff |
| Mechanical depth | 7 | Streak, firefly detours, decoys, patience; one path per pond |
| Game feel | 8 | Instant hops, squash, rings, notes, douse splash and hiss |
| Visual identity | 8 | Night pond with a single warm light; distinct from siblings |
| Animation quality | 8 | Rising/sinking stones, flame flicker and trail, lantern glow |
| Audio quality | 8 | Path-as-melody carries real information; ticks rise with urgency |
| Controls | 8 | Down-to-hop, tap, swipe, keys, buffer |
| Onboarding | 8 | Pond 1 is 3×4 with shimmer hints; "remember… / go!" prompts |
| Replayability | 7 | Random paths, growing ponds, streak chase |
| Performance | 9 | Baked stones, ≤35 cells, 61 fps headless |
| Technical robustness | 8 | Engine timers only, clean restart verified, resize re-lays out |
| Overall polish | 8 | Complete loop; a few layout compromises |

## Next recommended action
Human playtest of reveal/patience pacing; consider hiding fireflies after the sink and adding a true camera scroll.
