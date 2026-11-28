---
id: PhoneGameLab2/strum-corner
title: Strum Corner
was: guitar-ace / Guitar Ace
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Guitar Ace": four lanes of random falling rectangles, tap the lane when one crosses a line, eight misses end it.
No music, no rhythm (notes were spawned by `Math.random` every frame), no identity.

## Baseline assessment
Not a rhythm game: nothing to listen to, nothing on a beat, a plain lane-tapper; a commercial-app knock-off name.

## Weaknesses identified
No audio sync, no judging windows, no chart, no progression, no feedback, no character.

## Creative opportunities
The collection already has lane rhythm (Coconut Groove), a tile tune (Punchline) and a memory band (Echo Jam).
A guitar's real verb is the *stroke*: down, up, slap, let it ring. A busker's real stakes are the crowd.

## Planned improvements
One strum ribbon; the pick's point is the stroke direction; strums play the chords over a sequenced backing; the
crowd is both the health meter and the score multiplier.

## Implemented improvements
- **Strokes as the verb**: swipe down (orange pick pointing down), swipe up (cyan pick pointing up), tap (yellow
  slap disc), and a pick with a tail = down-strum held through the tail (a sustained hum loop that cuts on release).
  Shape + direction + colour, never colour alone. Keyboard: ↓/S, ↑/W, Space, holding ↓ for held chords.
- **Your strums are the chords**: the game sequences only kick/cajón/shaker/bass; each strum plays a staggered
  six-string chord of the bar (down = low→high, up = high→low, brighter); a miss leaves a hole in the song.
- **Timing**: one game clock for scheduling (120 ms look-ahead), drawing and judging; presses are time-stamped
  between frames from the pointer event; direction resolves after 13 px of travel; PERFECT ±60 ms, GOOD ±130 ms,
  130–220 ms early is a miss (anti-mash), stray strums are free (a muted scratch).
- **Crowd = meter + multiplier**: vibe 0–100; each 12 vibe draws a pal to walk in and stop (up to 8, later ones
  are tinted cousins); each listener adds ×0.25. Low vibe and they shrug and walk off; empty corner = "Oops!".
  Perfect strums make listeners toss coins that arc into the guitar case; 16-streaks cheer; applause bonus per song.
- **Set of four songs** at four times of day (morning, lunch, golden hour, streetlights; 92→128 BPM): song 1 downs,
  song 2 adds up-strums (D-DU-UDU), song 3 slaps + held chords, song 4 quick down-up flicks. Fixed-seed charts.
- Bolt is the actor: strumming arm animates per stroke direction, counts in "1 2 3 4!", flinches on misses,
  sweats when the crowd thins, cheers on streaks. Listeners bob on the beat when happy, nod off when bored.

## Test results
- Automated-gameplay (`tests/PhoneGameLab2/strum-corner.test.js`, run 3× in a row, all pass ~31 s): real mouse
  swipes resolve to D/U/slap; a real down-swipe timed onto a down pick scores (HUD matches); wrong direction is a
  miss that drains vibe; a perfect streak raises vibe and draws ≥5 listeners (multiplier up); a held chord played on
  the keyboard and held through its tail pays the ring bonus; zero vibe ends the run; best recorded; restart clean;
  finishing the set shows the win card.
- Automated-technical: `tools/smoke.js strum-corner` passes (61 fps).
- Visual inspection: 390×844, 844×390, 1280×800 and the splash were looked at; fixed listeners running off the
  portrait edges (two-row portrait crowd), HUD panel overlapping Bolt in landscape, empty upper half in portrait.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Charts are generated from bar templates, not composed: they groove but are not memorable melodies.
- Judging of real touch timing on device latency is untested on hardware.
- Up-swipes near the bottom edge of some phones may collide with the OS home gesture (the whole screen accepts strokes, so players can strum higher).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Strumming direction on a groove is satisfying; the crowd gives a reason to care about streaks |
| Mechanical depth | 6 | Direction + timing + holds; the multiplier rewards consistency; no branching choices |
| Game feel | 7 | Chord on every stroke, ring glow, picks burst, arm animation, coin arcs, flinch on miss |
| Visual identity | 7 | Brick street corner whose time of day changes per song, wooden fretboard ribbon, guitar-pick notes |
| Animation quality | 7 | Walking-in/out crowd, beat bobbing, strum arm, count-in bubble, background cross-fade |
| Audio quality | 7 | Sequenced backing + player-made chords, sustained hum on holds, applause scaled by crowd |
| Controls | 7 | Swipe anywhere, forgiving direction threshold, press-and-hold counts as a down-strum, keyboard |
| Onboarding | 7 | Song 1 is only down-strums at 92 BPM; each song announces its new stroke |
| Replayability | 6 | Fixed set to master; score chases perfect % and crowd size; no endless mode |
| Performance | 8 | Baked backgrounds, bounded coins/listeners, 61 fps in smoke |
| Technical robustness | 8 | dt clock, resize relayout, restart reset, no errors across 3 test runs + smoke |
| Overall polish | 7 | Complete splash → set → win/lose loop with rank text and stats |

## Next recommended action
Hand-compose one signature tune per song and add an endless "encore" after the set for score chasers.
