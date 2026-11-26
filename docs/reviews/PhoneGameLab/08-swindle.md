---
id: PhoneGameLab/08-swindle
title: Swindle
was: 08-shell-game (Cups & Ball)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Shell game: a ball is shown under one of several cups, the cups are shuffled, tap the cup that hides the ball. Streak
counter; one wrong pick ends the run.

## Baseline assessment
60-line prototype: red trapezoids on a flat background; "shuffling" teleported two adjacent cups every 0.5 s (array
swap, no motion at all, so the ball could not actually be followed); hard-coded 60 px hitboxes and pixel layout; instant
death on the first miss; a beep and a "✓" toast. Overall 2/10.

## Weaknesses identified
The core skill (visual tracking) did not exist because nothing moved; no readability, no escalation other than more
swaps; no stakes beyond sudden death; no identity; no feedback on where the ball really was.

## Creative opportunities
Make the shuffle the star: readable depth arcs first, then deception that is always *visible* (tempo changes, feints,
simultaneous moves, a pearl that rolls between tilted cups). Give the swindle a face and a voice so each new trick is
announced in character. Put something on the table: credit, a growing pot, and a reward for confidence.

## Planned improvements
Move-queue shuffle system with eased arcs; escalating repertoire; three coins of credit; pot × streak × quick-pick
scoring; carnival-booth identity with a talking swindler; reveal that always shows the truth; touch/mouse/keyboard.

## Implemented improvements
- **Renamed "Swindle"**: dusk fairground booth — crimson scalloped awning, twinkling string lights, wooden counter,
  striped cloth, enamel cups with a navy rim and red star (one baked sprite, so cups are truly identical), a golden
  pearl, and a moustachioed swindler in a straw boater whose eyes follow his hands and whose patter sits in a speech
  bubble. Funk bassline whose intensity follows round, shuffle and last coin.
- **Readable shuffles**: every move is an eased animation along a depth arc — one cup passes in front (larger, drawn
  last), the other behind — with moving shadows, squash on landing, and whoosh/swish pitched by speed.
- **Escalating, announced tricks**: plain swaps → tempo changes and hesitations (round 4) → *feints* that turn back
  (round 3) → *double swaps* with four cups (round 5) → three-cup *carousel* (round 7) → the *sneak* (round 9): two cups
  tilt and the pearl visibly rolls across — or the tilt is a bluff. 3 → 4 → 5 cups, 3 → 14 moves, 0.62 → 0.26 s per move.
  The swindler names each trick the first time it appears; 65 % of moves involve the pearl's cup so shuffles stay relevant.
- **Stakes**: three coins of credit; pot = 10 + 5 per round; streak multiplier +0.25 per consecutive win (to ×3);
  quick-pick bonus up to ×2 that drains over ~3 s of hesitation (meter under the table). A miss costs a coin and the
  streak and the same round is replayed.
- **Honest reveal**: the chosen cup lifts; on a miss the true cup lifts too, so the player always sees where it went.
  Star burst, ring, coin sound and combo note on a win; thud, shake and flash on a miss.
- No redundant "show" phase after round 1: the reveal already told the player where the pearl is.
- Controls: tap/click a cup (nearest cup within a generous band), number keys by position, or arrows + Space.
  `orient:"any"`: cup spacing, table height and the swindler scale from `Lab.play`; the bubble moves beside his head
  when the stage is wide and short.

## Test results
- Smoke (`node tools/smoke.js 08-swindle`): pass, 60 fps headless, no errors, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/08-swindle.test.js`): pass — pearl shown first; taps ignored during the shuffle;
  swaps observed and slots remain a valid permutation; real touch on the pearl's cup wins with a quick bonus; a drained
  bonus pays exactly pot × streak; wrong cup costs a coin and the streak and replays the round; number-key pick; fourth
  cup joins at round 4; last coin lost ends the run with best recorded; clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (mid-swap, winning reveal, five-cup pick with quick meter,
  sneak in progress, losing reveal, splash) with the Fredoka typeface; no text overflow.
- A scripted jump from 3 to 5 cups exposed a slot-gap bug during development (fixed: cups are added until the count
  matches). Subjective assessment is from reading the code and watching scripted play only — no human playtest.

## Remaining issues
- Top-speed difficulty (five cups, 14 moves at 0.26 s) is untested on humans; it may plateau too hard or too easy.
- The sneak tilts cups about their base centre, so the "gap" is suggested rather than physically opened; the rolling
  pearl is drawn in front and is clearly visible, but the motion could be more convincing.
- The swindler has no hands; cups move by themselves. His eyes and patter carry the character.
- No win-back of coins; a run is strictly three mistakes. Sessions are ~2–3 minutes.
- At 844×390 the five-cup row has ~48 px cups; fine to tap, less room for arcs.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | The tracking skill finally exists and escalates; reveals are tense and funny |
| Mechanical depth | 7 | Repertoire of five move types, tempo play, quick-pick risk vs certainty, streak stakes |
| Game feel | 8 | Depth arcs, squash, pitched whooshes, lift-with-tilt reveals, bursts and shake scaled to outcome |
| Visual identity | 9 | Instantly recognisable booth and character; coherent palette |
| Animation quality | 8 | Eased arcs with depth sorting, pop-in cups, tilting sneak, bobbing figure, twinkling lights |
| Audio quality | 7 | Speed-pitched moves, knocks, coins and combo notes, reactive funk; engine presets only |
| Controls | 8 | Nearest-cup hit band, number keys, cursor; input cleanly gated by phase |
| Onboarding | 8 | Opens by showing the pearl and three slow swaps; tricks are announced in patter |
| Replayability | 7 | Random plans every round, score chase; no alternate modes or meta-progression |
| Performance | 9 | ≤ 5 sprites + vector backdrop per frame; 60 fps headless |
| Technical robustness | 8 | Engine timers/tweens only, clean restart, resize-safe; one cup-count bug found and fixed |
| Overall polish | 8 | Strong start-to-finish presentation |

## Next recommended action
Human playtest of the speed ceiling and of sneak readability; add visible hands or a cloth flourish for the swindler.
