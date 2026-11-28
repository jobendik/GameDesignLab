---
id: PhoneGameLab2/echo-jam
title: Echo Jam
was: find-pattern / "Find Pattern"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
Four coloured squares on a dark screen flash a sequence; tap it back; each success adds a step; one mistake ends the run.
A 30-line copy of the classic colour-button memory toy.

## Baseline assessment
Playable but anonymous: flat rectangles, `Lab.beep` tones, no splash metadata, no pause/resize handling, one mistake ends
everything, no rhythm, no variety — round 12 plays exactly like round 2.

## Weaknesses identified
- Pure colour-button copy with no identity or character.
- Nothing changes except length; no skill beyond rote memory; harsh single-mistake fail.
- Tones were plain beeps; no music; no feedback on success beyond the next flash.

## Creative opportunities
- Turn the buttons into a pal band: each pal is a voice (timbre + pitch + pad symbol), so the tune is something you
  *hear* and the pals are actors who play, listen, flinch and celebrate.
- Call-and-response twists that change the rule, not just the length.
- A beat to play along to, so tempo and timing add a second skill on top of memory.

## Planned improvements
Toy-theatre stage, Olli as conductor with a speech bubble that carries all instructions, a growing tune, three hearts,
twists (Backwards, Swap, New note, Swap+Backwards), on-beat double scoring, Bolt joining at song 6, tempo ramp.

## Implemented improvements
- **The band**: Momo (bongos, low croak), Nori (xylophone, marimba sine), Pip (snare, chirpy square), Bun (bells,
  bell harmonic), later Bolt (keytar, filtered saw). Pitches G3 C4 E4 A4 D5 (pentatonic, so any tune is sweet). Each pal
  stands on a drum pad in its colour with a distinct white symbol (● ▲ ★ ♥ ◆) so colour is never the only cue.
- **Call and response**: Olli counts in two baton ticks, the band plays one note per beat, then "Your turn!". Tapping
  a pal plays it (hop, cheer arms, note glyph, glow, spotlight). A cleared song makes the band play your tune back in
  eighth notes while the crowd jumps; the next song is the same tune plus one note.
- **Twists** (announced by banner + Olli + a chip next to the song label): BACKWARDS (song 4 first) — play it last note
  first; SWAP (song 7) — two pals hop seats after the call (the note follows the pal; two swaps after song 12);
  NEW NOTE (song 9) — Olli plays only the newest note; from song 11 SWAP + BACKWARDS. Twist songs pay double.
- **Groove**: the beat keeps running through your turn (baton, footlights, tune-dot pulse, backing music restarted at
  the song's tempo); a note within ±20 % of a beat scores 20 instead of 10 and builds a groove streak.
- **Fair failure**: a wrong pal plays a sour note, the right pal lights up, Olli goes dizzy, a heart is lost and the call
  replays from the top (a New-note song replays in full). A flawless twist song wins a heart back ("Encore!").
- **Ramp**: tune +1 note per song, tempo 92 → 140 bpm, Bolt joins at song 6 (five voices), twists mix after song 10.
- Layout: two risers in portrait, one row in landscape/desktop (`orient:"any"`), Olli in a side panel in landscape.
  Keyboard: number keys = seats left to right. Live attract scene (the band auto-plays) behind the splash.

## Test results
- Gameplay test (`node tools/run-tests.js echo-jam`): passed three times in a row (~55 s). Covers on-beat (20) vs
  off-beat (10) scoring at measured beat phases, real taps clearing a song, the tune growing by one note, a wrong pal
  costing a heart and replaying the call, BACKWARDS played on the number keys (with the heart won back and double pay),
  SWAP moving two pals with taps landing on their new seats, three mistakes ending the run, clean restart.
- Smoke (`node tools/smoke.js echo-jam`): pass, 61 fps.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (call, turn, swap song with Bolt, oops, clear, splash), three
  rounds of fixes: speech bubble mis-anchored (Pals.bubble takes a centre), pals too small in portrait, pads overlapping,
  instruments covering faces.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Because the backing music restarts at each song's tempo there is a tiny seam between songs.
- The on-beat window is judged on the game clock; with music on it matches the backing within a frame or two, but it is
  not latency-compensated.
- Twist selection is random after song 10; no hand-authored "song book".
- Memory games stay a little samey for players who fail early (songs 1–3 are always plain echoes).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Classic hook plus hearing the tune; twists make songs 4+ feel different |
| Mechanical depth | 7 | Memory + rule twists + on-beat timing for score; swaps test pal identity not position |
| Game feel | 7 | Hop/cheer/glow on each note, sour note + correct-pal hint on errors, tune playback reward |
| Visual identity | 8 | Toy-theatre stage, curtains, spotlights, crowd silhouettes, pals with instruments |
| Animation quality | 7 | Hops, swap arcs, baton on the beat, crowd jumps; pals otherwise fairly static |
| Audio quality | 8 | Five distinct timbres in a pentatonic set, backing music at the song tempo, ticks, sour note |
| Controls | 8 | Large tap zones per pal, number keys, input only accepted in the turn |
| Onboarding | 8 | Olli's bubble tells you what to do at every phase; twists are bannered |
| Replayability | 6 | Random tunes and twist order, tempo ramp; still fundamentally a length chase |
| Performance | 9 | Baked stage and spotlight sprites, few entities; 61 fps in smoke |
| Technical robustness | 8 | Clean restart verified; resize re-seats the band; no timers outside the game clock |
| Overall polish | 7 | Complete loop with themed card; minor music seam between songs |

## Next recommended action
Human playtest of the on-beat window and the tempo ramp; consider hand-authored "songs" that end with a finale.
