---
id: PhoneGameLab2/huddle-up
title: Huddle Up
was: happy-connect / Happy Connect
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Happy Connect": drag through 3+ adjacent matching smiley circles on a 7×7 grid, 15 moves, gravity refill.

## Baseline assessment
A bare chain-matcher with programmer-art faces, no feedback, no goal beyond 15 moves.

## Weaknesses identified
No identity, no decisions, no progression; and the drag-a-chain verb is already taken in the collection by Sweet
Circuit (matching chains + loops), Lantern Lane (timed paths) and Live Wires (non-crossing routing).

## Creative opportunities
"Connect matching faces" also names the pair-reachability puzzle family: two equal faces connect if a line with at
most two bends joins them through empty space. That is a different puzzle (clearing sightlines), and the fiction
writes itself: twins at a picnic run to each other and hug.

## Planned improvements
Pals on picnic blankets, twin pairs, ≤2-bend paths, timed picnics with escalating rules, real actor animation.

## Implemented improvements
- **Core**: tap a pal, then its twin (same pal on the same blanket). A segment-BFS finds a path with ≤2 bends through
  open grass, including round the outside of the field; the twins run along a bunting rope, hug (heart), and float to
  Nori's huddle. Wrong pal = selection moves (no penalty); boxed-in twins shake and say "Can't reach!".
- **Kinds = pal × blanket pattern** (gingham / diagonal stripes / dots): 6 → 18 kinds, readable by species and
  pattern, never colour alone.
- **Picnic progression**: 1) 6×7 one blanket, 2) stripes join, 3) the field SLIDES down after every hug, 4) SNOOZERS
  (tucked under a duvet with Zz; cannot be picked until a hug next to them wakes them, +bonus), 5) dots + slide left
  + snoozers, then endless picnics on 8×10 with rotating slide directions, more snoozers and shorter clocks.
- **Clock and combos**: Nori's stopwatch (also drawn in his flipper); each hug +2 s; hugs within 3 s chain a
  multiplier (up to ×5); clear bonus = 50×picnic + 5×seconds left. Hint button (or H) highlights a pair for −6 s.
  Dead fields auto-reshuffle (tiles fly to new spots); if only snoozers' twins remain, everyone wakes.
- Orientation-aware: landscape transposes the field (and transposes live on rotation) and the panel becomes a side
  column showing the growing huddle of pals who have hugged. Keyboard: arrows + Space/Enter, H for hint.
- Pals as actors: selected pal stands up and waves, twins run/hug/float off, Nori looks at the selection, panics
  (sweat, scared) under 10 s, cheers on combos, whistles on reshuffle.

## Test results
- Automated-gameplay (`tests/PhoneGameLab2/huddle-up.test.js`, 3 runs in a row, all pass ~7 s): real touchscreen
  taps select and hug a reachable pair (score = HUD, tiles gone); different pals only move the selection; boxed-in
  twins cannot hug; clearing picnic 1 advances to picnic 2 with a fresh 48-pal field; picnic 3's down-slide leaves
  every column settled; picnic 4 has six snoozers that can't be picked and a neighbouring hug wakes one; hint costs
  6 s; the clock running out ends the run with best recorded; restart is clean.
- Automated-technical: `tools/smoke.js huddle-up` passes (61 fps), including the landscape resize (transpose path).
- Visual inspection: 390×844, 844×390, 1280×800 and splash looked at; fixed indistinct snoozers (added the duvet +
  Zz), off-screen score pop-ups, and an empty landscape side panel (now the huddle).
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Landscape phones get ~38 px tiles on the 8×10 picnics: tappable but below the 44 px guideline.
- Pals on the field are baked sprites (no idle blinking) for performance; only the selected/animating ones are live.
- Board deals are random (no authored layouts); difficulty spikes depend on the deal.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Scanning for twins with a clear line is compelling; the hug payoff is charming |
| Mechanical depth | 7 | Clearing order matters (sightlines, slides, waking snoozers); combo vs. careful play |
| Game feel | 7 | Hop on select, shake on blocked, bunting draw-on, hearts, chime ladder on combos |
| Visual identity | 7 | Sunny mown meadow, real cloth patterns, bunting; distinct from the other puzzle games |
| Animation quality | 7 | Twins run along the actual path, hug, float to the huddle; tiles slide and re-deal eased |
| Audio quality | 6 | Preset SFX with pitch per pal/combo, bounce music with intensity tied to the clock |
| Controls | 7 | One tap per pal, generous cells, keyboard cursor; small tiles on landscape late game |
| Onboarding | 8 | Picnic 1 is one blanket, six pals; each new rule is introduced alone with a toast |
| Replayability | 7 | Endless picnics with rotating slides and more snoozers; random deals |
| Performance | 8 | Baked blanket/pal sprites, bounded effects, 61 fps |
| Technical robustness | 8 | Live transpose on rotation, reshuffle guarantee, clean restart; no errors |
| Overall polish | 7 | Complete loop with stats (picnics, hugs, best combo) |

## Next recommended action
Authored early deals (guaranteed satisfying long-way-round paths) and a bigger tile size budget for landscape phones.
