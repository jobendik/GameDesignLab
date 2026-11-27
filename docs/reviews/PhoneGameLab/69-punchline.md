---
id: PhoneGameLab/69-punchline
title: Punchline
was: 69-piano-tiles (Piano Tiles)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Black tiles scroll down four white lanes; tap each before it leaves, never tap an empty lane. Named after and shaped
like a specific commercial game.

## Baseline assessment
35-line prototype: random lanes, a beep whose pitch depended on the lane (no tune), instant death, taps only registered
in the bottom quarter, speed +2 px/s per tile forever, black-on-white look copied from the genre's best-known title.
Overall 2/10.

## Weaknesses identified
No music in a music game; borrowed name and look; unforgiving and unexplained failure; no holds, no structure, no
milestones; tap-on-release input; fixed-pixel layout.

## Creative opportunities
Make the taps literally perform real melodies, give the genre a place where timing is rewarded rather than demanded,
and find a look of its own — a music-box paper roll instead of piano keys.

## Planned improvements
Original name/identity; five public-domain tunes as note data; synthesised music-box voice; comb "ring zone" twist;
hold slots; per-tune speed ramps; three slips instead of sudden death; deterministic chart and test hooks.

## Implemented improvements
- **Your taps are the music**: every hole is the next note of Ode to Joy, Minuet in G, Sakura, Greensleeves or In the
  Hall of the Mountain King (all public domain, transcribed as note arrays). Each tap synthesises a music-box voice
  (sine + octave triangle + pick click) and, on the first note of each bar, a bass note from the tune's chord roots —
  there is no backing track, so the tempo you hear is the tempo you play.
- **Twist — the brass comb**: a hole may be tapped any time it is on the roll (1 point), but tapped while crossing the
  comb it rings with an octave shimmer and scores 2–8, growing with an "in tune" flow of consecutive ringing notes.
  Early taps are safe but dull; riding holes down to the comb is the risk/reward and also what makes the rhythm right.
- **Holds**: notes of two beats or more are long slots that fill while held and pay +3; multi-touch and key holds work.
- **Fairness**: three slips (wrong lane or a hole sliding off) instead of instant death; the roll waits for the first
  tap; a missed hole makes the box catch and wind back a beat so misses do not snowball; a bounced double-tap is
  forgiven; a flawless tune winds one slip back.
- **Structure**: tile height = note length so the rhythm is visible; bar lines and bar numbers are printed on the roll;
  each tune has a printed title header, starts faster than the last (+12 BPM) and accelerates as it goes; the set loops.
- **Identity**: parchment roll with sprocket holes between walnut rails, ink-blue slots, brass comb whose teeth twang,
  slip rivets and BPM/flow read-out on the top rail. Input on press (not release); D F J K / 1–4 / arrows on keyboard.

## Test results
- Smoke (`node tools/smoke.js 69-punchline`): pass, 60 fps headless, no errors.
- Gameplay test (`tests/PhoneGameLab/69-punchline.test.js`): pass — roll waits for first tap, free wrong tap before
  start, real touches on the comb ring and build flow (exact scores asserted), early tap scores 1 and breaks flow, lane
  key, wrong-lane slip, missed-hole slip, mouse-held long slot pays its bonus, tune completion → next tune + bonus +
  faster tempo, three slips → game over with best, clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (waiting state, mid-tune with a hold filling, tune header,
  after a miss).
- Subjective assessment from reading the code and scripted play only (no human playtest); the transcriptions were
  checked bar by bar on paper but the audio was not listened to by a person.

## Remaining issues
- No chords/double holes (kept out so the game stays fully playable with one mouse pointer).
- Synth voice is simple; no reverb or velocity.
- On 844×390 only ~4 beats of roll are visible above the comb; fast tunes are noticeably harder there.
- Mountain King at loop 2 speeds is probably beyond most players — intended as the wall, but untuned by humans.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Playing a recognisable tune with your own taps is immediately rewarding |
| Mechanical depth | 7 | Comb timing vs. safety, flow bonus, holds; lanes themselves are read-and-tap |
| Game feel | 8 | Press-time response, twanging comb teeth, ring bursts, lane flashes, wind-back on a miss |
| Visual identity | 8 | Paper roll, walnut and brass — nothing like the genre's black-and-white default |
| Animation quality | 7 | Punch-out fades, hold fill, comb pluck; the roll itself is plain scrolling |
| Audio quality | 8 | Real melodies with bass, ring shimmer as reward, pitch-meaningful by construction |
| Controls | 8 | Lane-wide hit areas, multi-touch, keys, bounce forgiveness |
| Onboarding | 8 | Roll waits with a TAP marker on the first hole; one toast explains the comb |
| Replayability | 7 | Five tunes, rising tempo, flow/ring % to improve; fixed set order |
| Performance | 9 | One background blit, ≤15 slots on screen |
| Technical robustness | 8 | Deterministic chart, engine timers, pruned tile list, clean restart verified |
| Overall polish | 8 | Complete loop with a self-playing attract roll |

## Next recommended action
Add two-note chords on a second pointer as an optional "duet" setting and a tune picker once all five are cleared.
