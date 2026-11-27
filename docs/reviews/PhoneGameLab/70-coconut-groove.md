---
id: PhoneGameLab/70-coconut-groove
title: Coconut Groove
was: 70-rhythm-lane (Rhythm Lane)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Four lanes; a rectangle spawns in a random lane every 0.5 s and falls; tap the lane when it crosses a red line; eight
misses end the game.

## Baseline assessment
35-line prototype: no music at all, so nothing to be "on the beat" of; random notes; pixel-distance scoring; taps
registered on release; speed crept up until unreadable; neon rectangles on black; one beep. Overall 2/10.

## Weaknesses identified
A rhythm game without rhythm; no timing windows or judgement feedback; no combo; no note types; no song structure or
ending; release-time input; fixed-pixel layout.

## Creative opportunities
Sequence an original track inside the game and derive the chart from its lead line, so notes are musically true;
graded hit windows on a single clock; ribbons and slides; a set with a beginning, a build and an end.

## Planned improvements
Steel-band-at-sunset identity; three sequenced calypso tunes; chart = lead melody; PERFECT/GOOD/EARLY/MISS; ribbons and
slides; combo multiplier; groove meter fail state; rank on completion; deterministic chart + judging hook for tests.

## Implemented improvements
- **Own sequenced music**: bass tresillo, off-beat chord stabs, shaker, kick, rim and a soft lead are generated from
  chord progressions and scheduled ~120 ms ahead against one song clock. The chart is the lead line (255 notes over
  2:17), so every note lands on something audible; a hit adds a bright steel-pan strike at that note's pitch.
- **Timing**: note positions, audio scheduling and judging share the song clock; presses are time-stamped between
  frames (and shifted by half the reported audio output latency). PERFECT ±55 ms, GOOD ±130 ms; 130–240 ms early is an
  EARLY miss (stops mashing); stray taps elsewhere are free; un-hit notes miss 130 ms after the beat.
- **Note types**: taps; ribbons (keep the pan covered until the tail, 0.28 s of grace, ticks score while held, HELD!
  bonus); slides (the ribbon bends to a neighbouring pan in its second half and the finger or second key must follow);
  doubles two lanes apart in the last tune.
- **Structure**: Low Tide (100 BPM) → Mango Sky (112) → Bonfire (126), each with a 3-2-1-GO count-in and a faster note
  approach; patterns step from half notes to syncopated eighths. Fixed seeds make the set identical every run.
- **Stakes**: combo ×2/×3/×4 at 10/25/50; groove meter fills on hits and drains on misses/drops — empty ends the run;
  completing the set ends neutrally with rank S/A/B/C, accuracy, max combo and perfect count.
- **Feel/look**: baked sunset with sun, sea glints and palms; four steel pans that squash and glow in their lane colour
  (red on a miss); beat-pulsing horizon and hit line; rings and sparks sized by judgement; big judgement word and ghosted
  combo counter; note and pan sizes scale down on short stages.
- Controls: touch (multi-touch), mouse, D F J K; input on press.

## Test results
- Smoke (`node tools/smoke.js 70-coconut`): pass, 61 fps headless, no errors.
- Gameplay test (`tests/PhoneGameLab/70-coconut-groove.test.js`): pass — deterministic sorted chart; exact-time hook
  hits judged PERFECT (100) / GOOD at +90 ms (50) / EARLY at −200 ms; stray tap free; real touch and real key on the
  beat register; untouched note auto-misses; mouse-held ribbon completes; unheld ribbon drops; mouse-followed slide
  completes; ten in a row gives ×2; empty groove → loss with best; clean restart; end of set → neutral finish.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (tunes 1–3, a slide in progress, finish card).
- Subjective assessment from reading the code and scripted play only (no human playtest). **The music has not been
  listened to by a person**; harmony is pentatonic-over-diatonic and should be safe, but the mix is untested by ear.

## Remaining issues
- Audio/visual sync relies on frame-clock scheduling plus half the reported output latency; there is no manual
  calibration screen, so Bluetooth headphones will feel late.
- Melodies are generated, not composed — pleasant but not memorable; three tunes share one arrangement template.
- Doubles in tune 3 cannot be played with a single mouse pointer (keyboard or two fingers needed).
- Fixed set order; no difficulty selection.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Playing the lead over a band with graded feedback and a rising set |
| Mechanical depth | 8 | Two timing grades, anti-mash rule, ribbons, slides, doubles, combo vs. groove management |
| Game feel | 8 | Press-time strikes, squashing pans, rings/sparks by grade, beat pulses |
| Visual identity | 8 | Sunset steel band — warm, not neon-on-black; distinct from Punchline |
| Animation quality | 7 | Bending ribbons, pan squash, count-in pop; background is static apart from pulses |
| Audio quality | 7 | Full sequenced arrangement that the chart is derived from; generated tunes, unheard by a human |
| Controls | 8 | Lane-snapping touch/mouse, keys, multi-touch, between-frame time-stamps |
| Onboarding | 7 | Count-in and slow first bars teach by doing; ribbons/slides explained only in the how-to |
| Replayability | 7 | Learnable fixed set, rank and score chase; only one set |
| Performance | 9 | One background blit, ≤12 notes on screen, events scheduled incrementally |
| Technical robustness | 8 | Single clock, deterministic chart, clean restart and both endings verified |
| Overall polish | 8 | Splash with self-playing attract, three-tune set, two distinct end cards |

## Next recommended action
Have a person listen and tune the mix; add a latency calibration tap-test and a second, harder set.
