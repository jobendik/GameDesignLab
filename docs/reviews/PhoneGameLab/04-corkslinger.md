---
id: PhoneGameLab/04-corkslinger
title: Corkslinger
was: 04-quick-draw (Quick Draw)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Western quick-draw: wait for "DRAW!", then tap faster than a bandit whose reaction is random; tapping early loses the round.

## Baseline assessment
36-line prototype: two cowboy emoji on a brown fill, green flash for the signal, `onTap` (release-time) measurement, an
opponent with a random 280–520 ms time and no personality, an endless tally with no end state, no best score, and the
same loop as its neighbour 03-reaction-duel. Overall 2/10.

## Weaknesses identified
No opponent identity or progression; nothing to read or learn; inaccurate timing; no fail state or goal; emoji art;
indistinguishable from game 03.

## Creative opportunities
Take the *duel* half of the pair (03 keeps pure measurement): a ladder of rivals who each try a different way of making
you fire early — or late — so the skill becomes reading a character, not just reacting to a colour.

## Planned improvements
Original toy-theatre identity with procedural peg dolls; eight named rivals with rising speed and distinct tricks; one
real signal (flag + bell) among feints; a cheat you are allowed to punish; three lives; laps; press-time measurement;
score for speed, close calls and KOs; full test.

## Implemented improvements
- **Identity**: a wooden cut-out stage at sunset — drapes, clouds on strings, layered mesas, plank floor, a bell tower
  with a cuckoo door. Duelists are weeble-wobble peg dolls (parametric body, skin, five hat types, moustache, mask, badge)
  holding pop-guns whose corks fly on strings. Nothing gets hurt: losers wobble, topple, see stars and lose their hats.
- **One true signal**: the red DRAW! pennant shoots up and the bell swings and dings. Everything else is a trick.
- **Ladder of eight** (name board drops in with each rival's tell; progress dots top-right):
  Dozy Dot (620 ms, clean) → Twitchy Tess (fake reaches) → Cuckoo Clive (cuckoo pops from the tower) → Windy Wyn
  (tumbleweed + whistle) → Sneaky Pete (often reaches *before* any bell, with a "!" and a creeping arm — firing at him then
  is legal and pays a bonus) → Double Daisy (two corks) → Silent Sid (bell muffled: flag only, plus phantom dings) →
  Marshal Brass (290 ms, two corks, everything). Clearing all eight starts a faster lap (×0.87) and returns a cork.
- **Rules**: fire before the signal and the cork plops out on its string (lose one of three corks); fire after it but
  slower than the rival and you are out-drawn (lose a cork); beat their time to wobble or topple them. A rival stays
  until beaten. Zero corks ends the run.
- **Scoring**: 100 + (400 − your ms) per won draw, +50 "by a whisker" (< 45 ms margin, with slow-mo), +100 for catching
  the cheat, KO bounty rising up the ladder, lap bonus; all multiplied on later laps. End card: toppled, fastest draw,
  closest call.
- **Feel**: fire on pointer-down / Space; reaction measured with `performance.now()` against the signal frame; shot,
  recoil, cork flight (85 ms), hit-stop, shake, stars, hat physics, sprung wobble; both times shown on plaques under
  the dolls; pitch of the win note tracks your speed. Music drops to a bare pad during the stand-off and comes back
  after each shot. Taps during intros and the first 0.4 s of a stand-off are ignored; a pause mid-duel replays the round.
- Portrait and wide layouts; touch, mouse, keyboard.

## Test results
- Smoke (`node tools/smoke.js 04-corkslinger`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test `tests/PhoneGameLab/04-corkslinger.test.js`: pass — intro tap ignored, early fire = foul (−1 cork, no
  score), natural bell raises the flag, real tap out-draws and topples rival 1 with measured ms and bounty, next rival
  enters, four feints leave the flag down, Space fires, slow hand is out-drawn, Sneaky Pete's reach (no flag) can be
  punished, Double Daisy needs two hits, last cork lost → game over with best saved, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (stand-off, feints, draw, hit, KO of the player, cheat, foul,
  splash); fixed punched-out clouds, undersized portrait scale, dolls wobbling *toward* the shot, wrapped tagline.
- Subjective assessment from reading code and scripted play only — no human playtest.

## Remaining issues
- Rival speeds (620→290 ms) are set from typical reaction figures plus phone latency, not from playtests; the back half
  may be too hard or too easy on a given device.
- Silent Sid's phantom dings are audio-only, so they do nothing for muted or deaf players (his round is simply easier).
- Portrait leaves a band of empty sky between the name board and the bell tower.
- Dolls share one body shape; variety comes from colour, hat and face only. No between-duel story or unlocks.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Tense stand-offs, funny failures, a new trick every rival |
| Mechanical depth | 7 | Reading tells, resisting feints, punishing the cheat; core is still one button |
| Game feel | 8 | Instant shot, recoil, cork flight, hit-stop, wobble physics, hat pop, slow-mo on close calls |
| Visual identity | 9 | Toy-theatre stage and peg dolls are distinctive and fully procedural |
| Animation quality | 8 | Sprung dolls, swinging bell, flag pop, cuckoo, tumbleweed, cork strings, falling hats |
| Audio quality | 7 | Bell, pops, knocks, cuckoo, whistle, speed-pitched win note; preset-based synthesis |
| Controls | 8 | Press-time measurement, anywhere-tap or Space, grace windows, pause-safe |
| Onboarding | 8 | First rival is slow and trick-free; each name board states the next trick in one line |
| Replayability | 7 | Ladder + laps + score chase; rival order is fixed |
| Performance | 9 | One baked stage sprite, two dolls, a few corks; 61 fps headless |
| Technical robustness | 8 | Clean restart, relayout on resize, pause voids the round; tested |
| Overall polish | 8 | Cohesive from splash (dolls on stage) to game-over card |

## Next recommended action
Human playtest to calibrate rival speeds per device; add a visual cue for Sid's phantom ding and a shuffled "encore" ladder.
