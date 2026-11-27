---
id: games/furniture-forts
title: Furniture Forts
was: same
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A matter.js sandbox: four emoji buttons spawn a crate, plank, fridge or wheel; you drag them with matter's mouse
constraint around a yellow box ("the TV") on a floating grey shelf; after 20 s red cannonballs fly in for 15 s and
if the box touches the green floor you lose. The idea worth keeping: **build under time pressure, then watch your
build get tested**, with one fragile thing to protect.

## Baseline assessment
Bare prototype (2/10). 299 lines using matter's debug renderer: flat rectangles, emoji buttons, no audio, no score,
no best, no pause. `onmousedown`-only spawn buttons (no touch spawn), `location.reload()` on every resize and for
restart — at 390×844 with touch emulation the page reloads in a loop and `tools/shot.js` crashes. Timers are
`setInterval`s that keep running in a hidden tab. One round, one threat, no reason to play twice. Pieces spawn in a
pile at the top and the mouse constraint flings them through each other.

## Weaknesses identified
1. Broken on phones (no touch spawn, reload loop), no lifecycle at all.
2. No game: unlimited pieces, a single 15 s barrage, win/lose and done. Nothing to decide, nothing to master.
3. Dragging a solid body through a stack demolishes it — building is a fight with the physics.
4. Zero identity (debug colours, "TV" is a yellow box), zero audio, zero feedback.

## Creative opportunities
The fantasy people already own: the living-room cushion fort and the household that wrecks it. That gives a
protected character with a face, threats that are funny instead of generic (pillow fight, the dog, the washing
machine's spin cycle, a tipped toy box), a forecast so building is a response to a known problem, and a fort that
*persists* so each night is repair-and-improve rather than start-again.

## Planned improvements
Rewrite as a night-by-night run: forecast → timed build from a limited shelf of pieces → hands-off siege → tally
(SAFE + HEIGHT + COZY) → next night with a few new pieces; three wake-ups end the run. Ghost-carry placement so
building is precise on a phone. Four threats that each defeat a different lazy fort. Own art, own audio, full
lifecycle, test, review.

## Implemented improvements
- **Loop**: Sir Biscuit (a teddy in a nightcap) sleeps on a pouf. Each night shows *tonight's trouble* as chips and
  as animated chevrons on the side it will come from. Build clock 60 s on night 1, 40 s after; READY early for a
  capped early-bird bonus. Then lights out: the room dims, a night-light glows from the fort, and the plan plays.
  If any threat touches him, or he ends up on the floor, he wakes (slow-mo, squeak, stars, one heart). Three hearts.
- **Threats** (seeded, escalating without bound): *pillows* (ballistic, aimed at him, every third one lobbed over
  the walls from night 3, heavier and faster each night); *the dog* (runs in along the floor, hops the pouf to get
  him — and **steals the first piece of furniture that blocks him**, dragging it out of the room, so the outer layer
  is bait and what holds up your roof matters); *spin-cycle quake* (swept-frequency sideways acceleration applied as
  a pseudo-force plus hops — tall towers topple, late quakes shake him off the pouf unless he is wedged in); *toy
  rain* (bouncy balls and blocks from above — needs a roof without gaps).
- **Pieces and budget**: 7 furniture types with distinct mass/friction/shape (bookcase, low table as a compound
  ∩ body, toy chest, beanbag, plank, bolster, cushion). Starter kit of 7, then 3 (later 2) seeded pieces a night,
  capped at 28. The fort and its rubble persist; stolen pieces are gone.
- **Scoring with tension**: per safe night `100·n` SAFE + `height·n/2` HEIGHT (dashed flag line shows it live) +
  `cozy%·n` COZY (13 rays from him; a ray counts only if the *first* thing it meets is soft). Hard shells survive,
  tall towers and cushion linings score — and tall/soft is exactly what the quake, pillows and dog punish.
- **Controls**: drag from the shelf or pick up any placed piece (generous bounds pick). A carried piece is a ghost
  that passes through everything and auto-straightens to 90°; it turns solid on release, and if released inside
  something it pops up on top instead of exploding the stack. Turn: TURN button, second-finger tap, R/Q/E, right
  click or wheel. Space/Enter = READY, P/Esc pause, M mute. On touch the piece rides above the fingertip.
- **Feel**: pop on pick/place, mass-pitched wood knocks vs. soft cushion thumps scaled by impact speed, feathers and
  squash on pillow hits, dust, bounded screen shake, slow-motion on a breach, confetti + staggered score floaters.
- **Look**: cut-away storybook bedroom (indigo star wallpaper, moon window, lamp glow, plank floor, dark hallway
  beyond the door frames), thick ink outlines, hand-drawn furniture with books/tufting/grain, animated dog and bear
  (sleeping z's, wide eyes when things land nearby, X-eyes when bonked). Baloo 2 + Bungee from the vendored fonts.
- **Audio**: procedural WebAudio — music-box lullaby while building, a pizzicato ostinato that speeds up with the
  night number during the siege, whooshes, barks/whine, quake rumble with LFO, toy plinks pitched by size, timer
  ticks, safe/breach/fanfare stingers. Starts on first gesture, suspends on pause, mute button + M + `?mute=1`.
- **Lifecycle**: fixed 60 Hz step with accumulator (all timers are sim-time), pause button/keys/auto-pause on hidden
  tab, restart builds a fresh engine, resize/rotate re-lays-out without touching state, `prefers-reduced-motion`
  cuts shake and slow-mo, safe-area padding, landscape layout moves the shelf to a side column.
- **Conventions**: `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, `window.__gdl` (state, advance, toScreen,
  slotXY, place), best in `gdl:best:games/furniture-forts`, no `window.top`, stage focuses itself on pointerdown.

## Test results
- **Automated-gameplay** `node tools/run-tests.js furniture-forts` → pass (11 s, three consecutive runs). Real CDP
  touch drags build a bookcase-plank fort, second finger and R turn a held piece, drop-inside pops up, pause freezes
  the clock, READY → pillows fly → fort holds → exact SAFE+HEIGHT+COZY score, night 2 deals 3 pieces, then with no
  repairs the escalating nights (dog theft and quake observed) take three hearts → game-over card → best stored →
  clean restart.
- **Automated-technical** `node tools/smoke.js furniture-forts` → ok, 61 fps, no errors.
- **Visual inspection**: looked at splash, empty night 1, built fort, siege, tally, dog, game over at 390×844,
  844×390 and 1280×800.
- **Balance sim** (scratch script, 4 seeds): no fort → dead on night 3; the hinted starter fort never repaired →
  dead by night 5–6; a seven-piece fort never repaired → dead by night 7–9.
- **Subjective playtest**: informed judgement from scripted play and screenshots, not a human playtest.

## Remaining issues
- Not human-tuned: build-clock length, dog strength and quake curve come from simulation of un-repaired forts; a
  skilled repairing player may last long enough for late nights (4 threats, ~20 s sieges) to feel samey.
- Portrait leaves a tall strip of empty wall above the fort (the room is width-limited); it is used for the
  forecast, hints and banners but the fort itself is small on a phone (cushion ≈ 34 px; pick tolerance compensates).
- The siege is watch-only by design; there is no fast-forward.
- Building cannot be done with the keyboard alone (keys are shortcuts for turn/ready/pause/mute) — deliberate for a
  drag-and-stack game.
- matter.js stacks can creep slightly over many nights; pieces are never put to sleep.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Build → hold-your-breath siege → tally is a strong loop; the dog stealing your keystone is a genuine laugh/groan moment |
| Mechanical depth | 8 | Forecast-driven building, bait vs. anchor, hard shell vs. cozy lining vs. height, limited pieces, persistent damage |
| Game feel | 8 | Ghost carry is precise; mass-aware impact audio, feathers, slow-mo breach; siege itself is non-interactive |
| Visual identity | 8 | Recognisable cut-away bedroom with outlined storybook furniture, bear and dog; portrait framing is a bit empty |
| Animation quality | 7 | Physics does most of it; bear/dog/pillow squash, banners and floaters animate; furniture itself is rigid |
| Audio quality | 7 | Two music moods, informative impact sounds, character stingers; all synthesized, lullaby loop is short |
| Controls | 8 | Touch/mouse drag with four ways to turn, pop-up drop resolution, generous picking; no keyboard-only building |
| Onboarding | 8 | Three-line card, dashed silhouettes of a first fort, forecast chips + in-world chevrons, contextual hints nights 1–3 |
| Replayability | 8 | Seeded threat mixes and piece deals, unbounded escalation, score with three competing bonuses, best saved |
| Performance | 9 | ≤ 28 pieces + ≤ ~30 projectiles, 170-particle cap, cached background; 61 fps in headless smoke |
| Technical robustness | 8 | Fixed-step sim, clean engine rebuild on restart, pause/visibility/resize handled, test passes repeatedly |
| Overall polish | 8 | Splash → play → game over → retry is seamless; nothing placeholder remains |
## Next recommended action
Human playtest of nights 6–12 to tune the late curve; consider a fast-forward during sieges and one late-game
threat (e.g. a balloon that lifts the top piece) to keep long runs fresh.
