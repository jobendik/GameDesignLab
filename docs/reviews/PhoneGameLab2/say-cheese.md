---
id: PhoneGameLab2/say-cheese
title: Say Cheese
was: happy-face / Happy Face
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Happy Face": a grid of yellow circle smileys, one has an upside-down mouth; tap it within 8 s; a wrong tap ends
the run. It restarted itself with `setTimeout`.

## Baseline assessment
A one-note visual search with a single difference type, instant death on a mis-tap, no identity.

## Weaknesses identified
Only one kind of difference (learned in two rounds), no feel, no stakes curve, `setTimeout` gameplay.

## Creative opportunities
Pals have a rich pose vocabulary (moods, arms, gaze, tilt, talking, bobbing): "spot the odd one" becomes "the class
photo is ruined by one pal who isn't doing the pose", with Bun as the photographer — and a temporal odd-one-out
(the pal bouncing off the beat) that no static grid could do. Distinct from Peekaboo Park (tells of hidden pals)
and Cheeky Brush (copying a design).

## Planned improvements
Photo-day fiction, many difference kinds unlocking over time, snap-on-fix pacing, film rolls as lives, streaks.

## Implemented improvements
- Groups of 6 → 20 pals on wooden risers in front of a roller backdrop; all share a base pose (mood, arms, party
  hats or not). Spoiler kinds unlock in order: frown, closed eyes, wrong arms, missing/extra hat, looking away,
  OFF-BEAT bouncer (everyone bobs to the 100 BPM funk, one is half a beat out), chatterbox (mouth moving), tilted head.
  Auto-blink is disabled for posers so a blink can never fake a "sleepy" spoiler.
- Mixed-species groups from photo 8; two spoilers from photo 10 (Bun warns "Two pals are off!").
- Bun snaps the moment every spoiler is fixed, so speed is the score: (50 + 25×time left) × streak (clean photos
  only, up to ×3). Countdown 7.2 s → 3.2 s, ring on the lens, rising beeps for the last 3 s.
- Wrong tap: that pal is startled ("Hey! −0.8s"), streak broken. Countdown runs out with a spoiler: blurry photo,
  film roll lost, Bun circles who it was (teaching). Three blurry photos: "Oops! Out of film".
- Polaroids: each photo is a real snapshot of the risers that flies to the album strip (blurry ones are washed out
  with a ✕). The fixed pal sparkles and cheers; the whole group jumps on a clean snap.
- Landscape puts the camera and Bun at the side and uses up to 3 wide rows; portrait uses tall groups.

## Test results
- Automated-gameplay (`tests/PhoneGameLab2/say-cheese.test.js`, 3 runs in a row, all pass ~16 s): real tap on a
  correct pal costs 0.8 s and scores nothing; real tap on the spoiler snaps the photo (HUD = score); two clean photos
  give streak 2; a forced off-beat spoiler's bob differs from the group's by > 0.5 at the same instant; a timed-out
  photo loses a roll and the streak; three blurry photos end the run with best recorded; restart is clean.
- Automated-technical: `tools/smoke.js say-cheese` passes (61 fps).
- Visual inspection: 390×844, 844×390, 1280×800 looked at; fixed thick shelf-like risers and small pals in portrait
  (portrait groups now stack taller than wide).
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- "Looking away" is the subtlest spoiler at small sizes on 20-pal groups; fair but hard.
- Endless difficulty tops out at 20 pals / 3.2 s around photo 14; after that only the mix varies.
- Hats are drawn on top of the pal (pals.js has no hat prop) — fine, but noted for the lead.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Quick, readable, funny; instant snap on a fix makes each photo a little burst |
| Mechanical depth | 6 | Many difference kinds incl. a rhythmic one, speed scoring, streaks; still a search game |
| Game feel | 7 | Flash + shutter, sparkles on fix, startled pals, group jump, polaroid fly-off |
| Visual identity | 7 | Photo-day gym: risers, roller backdrop, tripod camera, real polaroids |
| Animation quality | 7 | Groups drop in staggered, beat bobbing, hops, circle reveal on blurry photos |
| Audio quality | 6 | Funk music with intensity by photo, shutter click, rising countdown beeps |
| Controls | 8 | One tap, generous elliptical hit areas around each pal |
| Onboarding | 8 | Photo 1: six pals, one frown, Bun says what's wrong for the first four photos |
| Replayability | 6 | Random groups/poses; plateaus after ~photo 14 |
| Performance | 8 | Backdrop baked, ≤21 live pals, 61 fps |
| Technical robustness | 8 | Resize re-places the crowd, clean restart, no errors |
| Overall polish | 7 | Complete loop with album, stats (photos, fastest fix, best streak) |

## Next recommended action
Add late-game twists (spoilers who switch mid-countdown, a "copy the leader" pose that changes) to lift the plateau.
