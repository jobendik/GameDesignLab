---
id: PhoneGameLab/36-plumb-line
title: Plumb Line
was: 36-sky-high (Sky High Stack)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A floor slides left-right above a tower; tap to set it; only the part overlapping the floor below is kept; no overlap
ends the run. Score = floors.

## Baseline assessment
33-line prototype: hue-cycled rectangles on a blue gradient, constant-speed ping-pong, `onTap` (fires on release) so
every placement lagged the finger, width could only shrink, speed +10 per floor forever, one beep, no best score, and
it played identically to its neighbour 35-cake-tower. Overall 2/10.

## Weaknesses identified
Input latency in a pure timing game; a one-way death spiral with no reward for precision; no feedback about how far off
a placement was; no variety or milestones; no identity.

## Creative opportunities
Lean into precision as the fantasy: an architect's drawing where every floor is measured, the plumb bob tells you the
truth, and exactness is the only way to win width back. Let the building change character as it climbs.

## Planned improvements
Placement on press; perfect window with visible cue; streak growth; lobby milestones every ten floors; a new plate
motion and facade per zone; blueprint identity with ruler and dimensions; tests. Keep it clearly unlike Teeter Torte:
no physics, no lives, instant stamp, endless.

## Implemented improvements
- **Input**: placement on press (touch, mouse, space/enter) — the floor stamps where it is, no fall, no delay.
- **Precision loop**: overhang is sliced off as a red-pencil dashed offcut with its size in metres; a PERFECT
  (± 0.4 m + 1.2 % of width) snaps true. From the third perfect in a row each one cantilevers the floor wider
  (0.8, 1.0, 1.2 … 2.0 m, up to the 20 m lot), with three diamond pips and a "GROWING ×n" readout. A plumb bob hangs
  from the gliding plate over a centre mark and lights up, with a ring, inside the perfect window; dashed plumb lines
  rise from the edges of the top floor.
- **Zones**: every tenth floor is a SKY LOBBY (cornice, +3.6 m, 50 × zone bonus) and opens a zone with its own facade
  line-work and plate motion — STEADY, SWING (sine), EXPRESS (one-way passes), STUTTER (stop-go), GUSTS (surging speed),
  FEINT (telegraphed fake reversals), FLICKER (the plate fades in and out) — then the cycle repeats faster (185 → 440 u/s).
- **Identity**: an elevation drawing — cobalt paper with a drafting grid, white line-work floors with seven window
  patterns aligned on a common grid, altitude ruler with floor numbers, dimension line and width in metres over the
  plate, a title block and outlined neighbours at street level, outlined clouds, then registration-mark stars and a
  moon as the paper darkens to night with height. The active plate is the only solid colour on screen.
- **Audio**: sine ladder that climbs with the perfect streak, a snap whose pitch drops with the size of the offcut,
  soft puzzle music whose layers follow streak and zone.
- Scoring 10 per floor, +10 +5 × streak for perfects, lobby bonus; game-over card reports floors, height in metres and
  best perfect run, and how far the last floor missed by. Attract mode drafts a tower by itself; virtual-unit layout.

## Test results
- Smoke (`node tools/smoke.js 36-plumb`): pass, 61 fps headless, no errors.
- Gameplay test (`tests/PhoneGameLab/36-plumb-line.test.js`): pass (13 s) — a real tap sets and scores a floor and keeps
  exactly the overlap; a 3 m offset is sliced by exactly its overhang and breaks the streak; perfects keep width; the
  third perfect grows it by 0.8 m; floor 10 is a lobby that opens zone 2 (SWING) and widens the floor; a floor set clear
  of the tower ends the run without being built; best saved; clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (start, floor 34 in STUTTER, floor 58 at night in FEINT).
- Subjective assessment is an informed judgement from code and scripted play — no human playtest.

## Remaining issues
- A full-width plate travels partly off-screen at the ends of its glide on a 390 px phone.
- One miss ends the run by design; there is no second chance, which may feel abrupt after a long climb.
- FEINT and FLICKER were only exercised by the scripted pilot; their fairness for human reaction times is unverified.
- The perfect window is generous at full width (± 6.4 u) — strong players may sit at 20 m until the speed cap bites.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Pure one-tap timing with immediate, legible consequences and a way to recover |
| Mechanical depth | 7 | Streak growth vs risk, seven motion patterns to learn; still a single input |
| Game feel | 8 | Instant stamp, flash, offcut with measurement, streak ladder, hit-stop on perfects |
| Visual identity | 9 | Blueprint elevation is unmistakable and unlike its bakery sibling |
| Animation quality | 7 | Deliberately restrained: plate fade-in, offcuts, pips, camera ease; little secondary motion |
| Audio quality | 7 | Clean sine ladder and informative snap; engine presets only |
| Controls | 9 | Acts on press, three input methods, clear aiming aids |
| Onboarding | 8 | One line of text on the first floor; the bob and mark explain the rest |
| Replayability | 8 | Zone cycle with rising pace, streak mastery, height chase |
| Performance | 9 | Simple fills and strokes, ≤ 30 floors drawn, 60 fps headless |
| Technical robustness | 8 | Virtual units survive resize; verified by test and smoke |
| Overall polish | 8 | Cohesive start to finish |

## Next recommended action
Human playtest of FEINT/FLICKER fairness and the perfect window; consider a zoom-out of the finished tower on the
game-over card.
