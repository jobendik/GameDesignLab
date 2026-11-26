---
id: PhoneGameLab/32-inkstride
title: Inkstride
was: 32-color-path (Color Path)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
A runner at a fixed spot; coloured tiles scroll toward it; the runner's colour must match the tile it stands on.
One tap cycled through four colours.

## Baseline assessment
39-line prototype: back-to-back random colour rows with no gaps, a single tap that *cycles* four colours (up to
three taps per row at 240 px/s — effectively unplayable), instant death, flat rectangles, score = time, no best.
Overall 2/10.

## Weaknesses identified
Cycle-to-select makes the right colour unreachable in time; no rhythm, no spacing, no telegraphing; colour-only
information; instant fail; nothing to master; no identity.

## Creative opportunities
Direct selection turns it into a rhythm-of-recognition game. Make *when* you switch matter (late = better), give
the stream musical structure, and give each ink a shape so the blob itself changes form.

## Planned improvements
Three direct pads; gates in phrases with breathing gaps; PERFECT late-switch bonus; combo multiplier; hearts; tempo
ramp with rubber-band; gate variants; risograph identity; colour + shape coding.

## Implemented improvements
- **Controls**: three large ink pads (the whole screen is three columns, so no tap misses), arrows / A-S-D / 1-2-3,
  acting on pointer-down; 75 ms of coyote time rescues a slightly late tap.
- **Structure**: gates arrive in phrases — runs, alternations, stairs, randoms — with a longer breath after each;
  speed 300 → 620 px/s and gap 1.05 → 0.44 s driven by a "heat" value that drops 8 on a miss (rubber-band), then
  keeps creeping. TEMPO tiers every 14 gates add two-ink gates (either works) and veiled gates that flip open late.
- **Depth**: a dashed band above the blob marks the last 0.19 s — a needed switch made inside it is a PERFECT for
  double points; combo multiplier ×1–×5 (every 8); +1 heart every 25 combo; three hearts instead of instant death.
- **Readability**: each ink is also a shape (circle / triangle / square) on gates, pads and the blob's own body, so
  nothing is colour-only; the first gates pulse the correct pad with "tap".
- **Identity**: risograph print — cream paper, three spot inks multiplied in the background, offset "misregistered"
  shadows, ink-dark outlines, ruler ticks that sell the speed, an ink trail that records every switch.
- **Feel/audio**: pop + ring + splash on switch, gate bursts apart on a pass, hop and squash on the blob, pass note
  pitched by ink and multiplier (PERFECT adds an octave sparkle), shake + hit-stop + grey shards on a miss, funk
  music whose intensity follows tempo and combo.

## Test results
- Smoke (`tools/smoke.js 32-inkstride`): pass, 61 fps headless, no errors.
- Gameplay test (`tests/PhoneGameLab/32-inkstride.test.js`): pass — key and pad touch switch ink immediately and
  pass gates for 10 each, a 0.09 s-late switch registers PERFECT and pays double, 20 clean gates raise multiplier
  (≥×3), tier and speed, wrong ink costs a heart + combo and does not count, three misses end the run, best
  recorded, clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, first gate with coaching, tempo 4 with PERFECT,
  veiled gate, game over).
- Subjective assessment from code + scripted play only; no human playtest, so the top tempo and veiled-gate reveal
  time (≥0.42 s) are estimates of human reaction limits.

## Remaining issues
- Gates are not synchronised to the music's beat (the engine sequencer has no beat callback), so "rhythm" is felt
  through spacing only.
- After tempo 5 the only new pressure is more veiled gates; no fourth ink or new gate type.
- In the 265 px landscape stage everything is small (portrait-first).
- A resize mid-run rescales speed but not existing gate spacing (brief unevenness).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Read-tap-pass loop flows; phrases give it a pulse |
| Mechanical depth | 7 | PERFECT timing risk, combo, dual/veiled gates; shallow beyond tempo 5 |
| Game feel | 8 | Instant switch feedback, bursts, hit-stop on miss |
| Visual identity | 9 | Risograph look is distinctive and coherent |
| Animation quality | 7 | Blob hop/squash/blink, gate split and flip; simple run cycle |
| Audio quality | 7 | Pitched passes carry ink + multiplier; not beat-locked |
| Controls | 9 | Direct pads, full-width columns, keys, coyote time |
| Onboarding | 8 | Pulsing pad + shape matching explains itself in two gates |
| Replayability | 7 | Random phrases, score/combo/perfect chase |
| Performance | 9 | Few draw calls, bounded gates/trail, 61 fps headless |
| Technical robustness | 8 | Clean restart verified; minor resize caveat |
| Overall polish | 8 | Complete, cohesive loop |

## Next recommended action
Human playtest for top-tempo fairness; lock gate arrivals to a beat if the engine exposes one; add a late-game twist.
