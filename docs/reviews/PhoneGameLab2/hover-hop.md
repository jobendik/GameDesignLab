---
id: PhoneGameLab2/hover-hop
title: Hover Hop
was: go-up / Go Up
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Go Up": a ball auto-bounces on sliding bars while you drag to steer; height is the score; falling ends it.

## Baseline assessment
2/10 — a generic doodle-jump clone: no art, no feel, no progression, no pal.

## Weaknesses identified
Steering + auto-bounce is exactly what the finished sibling *Pogo Peak* does, and *Pine Kick* already owns charged jumps. Nothing rewards precision; bars never change.

## Creative opportunities
Remove steering entirely: one tap = one straight-up hop, so the only skill is *timing* against a moving target — and reward *how well* you land, not just whether.

## Planned improvements
Bolt the robot climbing hover pads to the moon; tap-to-hop; PERFECT/teeter landing grades; nuts as a risk/reward pickup; four zones with new pad behaviours.

## Implemented improvements
- Tap/click/Space/↑ hops Bolt straight up (magnet boots release — he does not inherit the pad's slide). Land on the pad above if it is under him; otherwise he falls back onto a lower pad if one catches him, or off the stack.
- Landing grade by offset from the pad's centre mark: PERFECT (<18%: star burst, ring, rising coin pitch, combo multiplier up to ×5 plus a growing perfect bonus), plain, or TEETER (>74%: Bolt windmills, the pad tips; hop again within ~0.9 s or he slips off).
- Nuts hang mid-gap every few pads: hop when your pad carries you under one (+25) — but the landing above must also line up.
- Input buffering (0.2 s before touchdown) and swept landing tests.
- Zones with banners and blended skies: Workshop (pegboard, gears, wrenches; gentle slides) → Rooftops (pause-at-the-ends pads, short fast pads, houses) → Cloud Deck (cloud pads sink under you with a visible timer, telegraphed wind gusts drift your hop) → Orbit (floatier gravity, pads that blink in and out every two beats of the music, planets and moon; HUD switches to light text).
- Bolt: squash on take-off/landing, jet flames on the way up, arms up when teetering, joy on perfects, dizzy tumble on a fall. "Oops! Bolt bonked down" card with height, perfects and best combo.
- Live attract demo (an AI that predicts the pad) behind the splash; `orient:"any"` with a capped play band and side decor in landscape.

## Test results
- Automated-gameplay: `tests/PhoneGameLab2/hover-hop.test.js` — touch tap → PERFECT + HUD, keyboard off-centre landing resets combo, rim teeter saved by a mouse-click hop, nut pickup, buffered tap, missed hop falls back onto the same pad, teeter slip ends the run, clean restart. Pads are frozen and placed by a hook so landings are deterministic; hop/landing physics are the game's own. Passed 3× in a row (~9 s).
- Automated-technical: `node tools/smoke.js hover-hop` passes.
- Visual inspection: portrait/landscape/desktop at heights 5, 23, 40 and 62 checked; fixed low-contrast PERFECT text, white pads on a pale cloud sky, a bland workshop wall, tiny Bolt.
- Subjective playtest: informed judgement from code + scripted play, not a human playtest.

## Remaining issues
- Moment-to-moment it is a single-verb timing game; depth comes from the landing grades and zone hazards, not from choices.
- Blink-pad timing (two beats on / two off) is untested by humans and may be harsh at 112 bpm.
- Landscape still shows fewer pads than portrait; side areas are decor only.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Instantly understood; perfect streaks are compelling |
| Mechanical depth | 6 | Landing grades, teeter, nut risk, sinking/blinking pads; one verb |
| Game feel | 7 | Squash, jets, star bursts, pitch ladder, pad tip on teeter |
| Visual identity | 7 | Four distinct zones with parallax decor, Bolt's hover pads |
| Animation quality | 7 | Teeter windmill, tumble fall, eased camera |
| Audio quality | 6 | Combo pitch, warn on teeter, zone level-up; stock presets |
| Controls | 8 | Tap anywhere, keyboard, input buffer, generous landing width |
| Onboarding | 8 | Static wide launch pad, slow first pads, centre mark shows the target |
| Replayability | 7 | Zones to reach, combo chase, best height |
| Performance | 8 | Bounded pads, no per-frame sprite rebuilds |
| Technical robustness | 8 | Clean restart, resize, theme restored on restart |
| Overall polish | 7 | Complete loop with live attract |

## Next recommended action
Human playtest of the Orbit blink rhythm; consider an occasional "fork" (two pads at one height) to add a choice.
