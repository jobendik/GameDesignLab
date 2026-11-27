---
id: PhoneGameLab/58-alphabroth
title: Alphabroth
was: 58-word-search (Word Search)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Word search: drag across a letter grid to find the hidden words on a list.

## Baseline assessment
55-line prototype: the same eight words every time, three directions, the selection was whatever cells the finger
happened to brush (diagonals were nearly impossible), grey squares, one beep, no timer, no best, no persistence. 2/10.

## Weaknesses identified
No word bank, no generator worth the name (random fill could duplicate words), unusable drag selection, no reason to
replay, no identity, layout from hard-coded pixels.

## Creative opportunities
Alphabet soup is a ready-made, tactile setting for a letter grid; a word that is *not* on the list gives the genre a
second layer; one note per letter turns each find into a little scale.

## Planned improvements
Themed word bank, 8-direction overlap-seeking generator with a uniqueness check, snapped noodle selection (drag or
tap–tap), simmer streak, secret ingredient + last-ladle countdown, stars, persistence, soup-pan identity.

## Implemented improvements
- 16 themes × 28 words (448 common words) embedded; each bowl draws its menu and one **secret ingredient** from a theme.
- Generator seeded by bowl number: longest words first, placements that overlap existing letters preferred (75 %),
  decoy fill drawn from the words' own letters, then verified so every word (and the secret) occurs exactly once in
  all eight directions; a small rude-word filter re-rolls the fill. Worst case measured < 3 ms.
- Difficulty curve: 6×6 with 5 words reading right/down → diagonals → 8×8 with backwards words → 9×9/10 words →
  10×10/12 words from bowl 13; themes rotate and re-deal on each cycle.
- Selection: the noodle starts on a letter and snaps to the nearest of 8 directions with its length taken from the
  projection of the finger, so sloppy drags still read; live preview pill of the letters; either direction counts;
  tap first letter then last letter works as well; wrong picks wobble and fade, no penalty.
- Simmer streak: finds within 12 s multiply ×2…×5 (bar drains in the header). Par time per bowl, time bonus.
- Secret ingredient: letter boxes fill in as the menu is cleared; once the menu is done a 20 s "last ladle" gives a
  final shot at it (SERVE ends early). Stars: finished / under par / secret found. Where it was is shown at the end.
- TASTE hint rings an unfound word's first letter for +10 s.
- Feel: letters bob in the broth and hop one by one as a word comes out (rising pentatonic note per letter, pitched
  up by the streak), particle splash, strike-through on the menu, bubbles, music intensity follows progress.
- Progress (bowl, stars) and the bowl in progress (found words, clock, score) persist; ‹ › revisit cleared bowls.
- First bowl shows a ghost noodle tracing a word until the first find. Portrait, landscape and desktop layouts.

## Test results
- Smoke: pass (61 fps headless, survives resize/blur, no errors).
- Gameplay test `tests/PhoneGameLab/58-alphabroth.test.js`: pass — generator invariants for 40 bowls, non-word drag,
  snapped drag, ×2 streak, reverse drag, touch tap–tap, hint, reload persistence, ladle → secret → 3★ win, best
  recorded, clean next bowl, ladle timeout → 2★.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (splash, early play, late 10×10 board, last ladle).
- Subjective assessment from code reading and scripted play only (no human playtest).

## Remaining issues
- Words are single common nouns; no multi-word phrases, and a theme repeats after 16 bowls (with a different deal).
- Difficulty tops out at 10×10/12 words; there is no hard mode (e.g. no menu, only the theme).
- 10×10 cells are ~36 px on a 390 px phone: fine for dragging, tight for the tap–tap alternative.
- Par times are estimates, not tuned on players.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Proven loop made brisk by the streak and the secret-word climax |
| Mechanical depth | 6 | Streak pacing and secret hunting add choices; still a word search |
| Game feel | 8 | Snapped noodle, per-letter notes, hops, splash; every pick answered |
| Visual identity | 8 | Enamel pan of tomato broth on gingham; reads from a thumbnail |
| Animation quality | 7 | Bobbing letters, draw-on noodles, hop waves, sink on finish |
| Audio quality | 7 | Rising scale carries length and streak; bounce music reacts to progress |
| Controls | 9 | Drag in either direction, forgiving snap, tap–tap fallback, mouse + touch |
| Onboarding | 8 | Ghost gesture on bowl 1; three short how-to lines |
| Replayability | 7 | Endless themed bowls, stars, best score; no daily/hard variants |
| Performance | 9 | Baked pan and letter sprites; generation < 3 ms |
| Technical robustness | 8 | Reload restores the bowl; clean restart; resize re-lays out |
| Overall polish | 8 | Cohesive from splash (live demo board) to win card |

## Next recommended action
Human playtest to tune par times and streak window; consider a "blind menu" hard mode and phrase-based secrets.
