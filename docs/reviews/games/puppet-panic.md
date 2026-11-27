---
id: games/puppet-panic
title: Puppet Panic — String-Pulling Charades
was: Puppet Panic — Physics Charades
status: transformed
baseline: 3
score: 7
updated: 2026-11-27
---
## Original concept and core mechanics
A "physics charades" show in five rounds: in a 45 s build phase you dropped circles, boxes and limbs on a stage and linked
or pinned them; in a 45 s act phase you dragged the pile (or pressed Wiggle / Hop / Flourish) while a simulated chat
"guessed" the secret word (SPIDER, TEAPOT…). Matter.js with its stock renderer and mouse constraint.

## Baseline assessment
Played with Playwright at 1280×800 and 390×844 (screenshots inspected). It ran without errors and the dark dashboard UI was
tidy, but the game underneath was hollow: "audience recognition" was a formula over part *counts* and bounding-box ratio
(two loose parts already read as 46 % CRAB), the bots' wrong guesses were canned per word, and the correct guess was a dice
roll once the counter passed 66 %. Nothing the player performed was actually seen. New parts fell under the bottom action
bar; on a phone the toolbar wrapped, the buttons overflowed ("Start Acting Space" on three lines), the chat and meter were
hidden, and Matter's mouse constraint gave no usable touch building. Timer ran off `performance.now()` inside
`afterUpdate`, no pause, no best score, six oscillator beeps, emoji icons, no test hook.

## Weaknesses identified
1. The core promise — *act it out and be understood* — was faked; scoring rewarded counting limbs, not performing.
2. Build phase was fiddly busywork (link tool, pin tool, budgets) before any fun; nothing in it was funny.
3. No real puppet: a heap of shapes has no body language, so there was nothing to read even for a human guesser.
4. Not playable on touch; layout broke in portrait; no pause / best / lifecycle; variable-step physics.
5. No party play at all despite being a party concept.

## Creative opportunities
- Make it a real marionette: a jointed wooden ragdoll on strings is instantly funny and has readable body language.
- Let the audience guess from *measured* pose and motion, so wrong guesses are honest feedback ("Scarecrow?" when your arms
  are out) and the right guess is earned.
- One finger per string on a phone; strings that hold when released so a mouse can still build a four-limb pose.
- A proper pass-and-play mode for the room, with the word hidden from the guessers.

## Planned improvements
Replace build+fake-recognition with a string-puppet performance game; 14 words across three tiers with real detectors;
tomatoes/strikes/streak structure; theatre art direction; procedural audio; party mode; full lifecycle, hook, test.

## Implemented improvements
- **New core**: an 11-part ragdoll marionette (no self-collision, pin joints, soft neck) with five strings — head, hands,
  feet. Drag a limb and the string *holds* where you let go; tap a held string to drop it; STAND / LET GO buttons. Strings
  saturate (pull stops growing past ~10 units of stretch) so conflicting pins settle instead of thrashing.
- **Real recognition**: eight pose detectors (hands up, scarecrow, starfish, sit, splits, nap, handstand, superhero) with
  fuzzy thresholds that must be *held*, and six motion detectors (wave, applause, jump, high kick, marching, cartwheel)
  that count genuine reversals / claps / landings / alternations / quarter-turns. The audience meter fills only from the
  target's detector; the crowd's speech bubbles name whichever *other* detector is firing, go "Ooh! I know this!" past
  50 %, heckle when you stand still.
- **Structure**: endless solo show, clock shrinking 27 s → 12 s, tiers unlock (acts 1–2 easy, 3–5 medium, 6+ everything),
  every 4th act is a DOUBLE BILL (two words on one clock, ×1.5), score = tier + 10/second left, streak multiplier to ×3,
  a flop = tomatoes (physical, they knock the puppet about) + a strike, three strikes ends the show. Best stored in
  `gdl:best:games/puppet-panic`.
- **Party · pass & play**: two teams, four 60 s turns, 44-word deck, word hidden behind HOLD TO PEEK, GOT IT / SKIP (2).
- **Look**: marionette theatre — cached curtain/valance/backdrop/boards, following spotlight, wooden jester puppet with a
  face that reacts (blink, "o" when flung, grin on success, X-eyes when tomatoed), twanging strings, silhouetted audience
  that bobs and jumps, roses + confetti, splats, per-word animated stick-figure pictogram on the word card, progress ring
  round the puppet's head. Bungee + Fredoka from the vendored fonts; no emoji.
- **Audio**: string plucks pitched by height, wooden clacks scaled by impact speed, rising meter ticks, crowd murmurs,
  fanfare + applause, sad trombone + splats, last-5-seconds ticks, and a music-box waltz that speeds up with the act.
  Starts on first gesture; mute button + M; `?mute=1`.
- **Controls**: pointer events with multi-touch (one finger per string, verified with two simultaneous CDP touches), mouse,
  and keyboard (1–5 / Tab pick a string, arrows / WASD move it, X drop, Space stand, R let go, P / Esc pause, M mute,
  Enter start). Canvas takes focus on pointer-down so keys work inside the arcade iframe.
- **Lifecycle**: fixed 60 Hz stepping with accumulator, pause button + P/Esc + auto-pause when hidden, resize-safe layout
  for portrait / short landscape / desktop with safe-area insets, clean restart, reduced-motion honoured,
  `?seed`, `?autostart=1`, `?nopause=1`, `window.__gdl` (`state`, `manual`, `advance`, `toScreen`, `force`).

## Test results
- **Automated-technical**: `node tools/smoke.js puppet-panic` → ok, 61 fps, no errors.
- **Automated-gameplay**: `node tools/run-tests.js puppet-panic` → pass (≈9 s). Real mouse drags pull a string, release
  holds, tap drops; a deliberately wrong pose makes the crowd shout that pose and scores nothing; the dealt word is then
  performed with mouse input and scores; keyboard strings; pause freezes the clock; three ignored acts → tomatoes, three
  strikes, game-over card, stored best; ENCORE resets; party hand-off, hidden word, peek, GOT IT, SKIP, 60 s turn swap.
- A scratch script additionally performed **all 14 words** with real mouse input (all recognised, 1.3–6 s each) and a
  two-finger touch drag of both hands.
- **Visual inspection**: menu, play, success, fail, game over and party screens looked at in 390×844, 844×390, 1280×800.
- **Subjective playtest**: informed judgement from code and scripted play only — no human has played it, and the audio
  has not been listened to.

## Remaining issues
- Detector thresholds were tuned by script, not by hands: some words may be easier (wave, sit) or fussier (starfish with a
  mouse = four drags) than their tier suggests.
- Marching with a single pointer is slow (lift, drop, lift, drop); it shines only with two fingers.
- No joint limits: elbows and knees bend both ways (funny, but occasionally a limb passes through the torso).
- Party mode has no word-pack choice or configurable turn count; team scores are not persisted.
- Music is a single 8-bar waltz; it may wear thin in long sessions.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Pulling strings is funny within seconds and the crowd reacts to what you really do; unverified by humans |
| Mechanical depth | 7 | 14 detectors, hold-vs-drag planning, speed bonus, streak, double bills; no deeper meta |
| Game feel | 7 | Elastic strings, twang, clacks, rings, roses, tomatoes that physically hit; tuned by script only |
| Visual identity | 8 | A coherent marionette theatre you would recognise from a thumbnail |
| Animation quality | 7 | Physics does most of it; face states, bobbing crowd, banner/card pops, animated pictograms |
| Audio quality | 6 | Layered procedural SFX with informative pitch + adaptive waltz; never listened to |
| Controls | 7 | Multi-touch strings, mouse, full keyboard; generous pick radius; no joint limits |
| Onboarding | 7 | Three-line how-to, first word is always WAVE, pictogram + one-line hint on every card |
| Replayability | 7 | Seeded variety, escalating clock/tiers, best score, party mode for groups |
| Performance | 8 | 11 bodies, cached background, bounded particles; 61 fps in headless smoke |
| Technical robustness | 8 | Fixed step, pause/blur, resize, clean restart, deterministic hook, gameplay test |
| Overall polish | 7 | Menu → show → game over → encore is seamless; party mode is plainer than solo |

## Next recommended action
A human playtest on a phone to retune detector thresholds and clock lengths per word, then add elbow/knee limits and a
second music phrase.
