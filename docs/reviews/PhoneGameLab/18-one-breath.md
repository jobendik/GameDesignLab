---
id: PhoneGameLab/18-one-breath
title: One Breath
was: 18-sniper-timing (Sniper Timing)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
A timing game: a marker sweeps back and forth and you tap once when it is over the target; ten rounds, count the hits.

## Baseline assessment
50-line prototype: a blue bar bouncing along a strip, a red rectangle labelled "Target", a `setTimeout` between rounds,
"Hit!/Miss" toasts and one beep. No tension, no feedback, no fail state other than the round counter. Overall 2/10.

## Weaknesses identified
One linear sweep is solved after two rounds; no stakes per shot; nothing to manage between taps; hits are not an event;
generic marksman framing with no identity; gameplay timer outside the game clock.

## Creative opportunities
Turn the "marker" into the player's own unsteady aim, make steadiness a resource (breath) so the single input has a
hold phase and a release moment, and make the target something worth hearing: a gong whose tone tells you how true the
shot was.

## Planned improvements
Scope view with figure-eight sway; hold-to-steady / release-to-fire; breath gauge, heartbeat kicks and gasp penalty;
shot clock; graded hits; swinging gongs, mist and chain rounds; synthesised gong; moonlit valley identity.

## Implemented improvements
- **One input, two stages**: HOLD holds your breath — the sway slows to half speed and tightens, a heartbeat starts to
  thump (each beat kicks the sight, faster and harder as the gauge empties); RELEASE fires. Run out of breath and you
  gasp: the shot is stood down, aim goes wild for 1.3 s and you must recover. A tap is a legal snap shot.
- **Sway that is always fair**: the aim traces a figure-eight through the gong's centre with a small drifting error
  term, rotated per round, so every pass can hit but not every pass offers a dead centre — wait or take it?
- **Stakes**: shot clock on the rim (9.5 s → 5 s), three lives, graded hits (clipped ×1 / clean ×2 / dead centre ×3,
  plus time bonus and a dead-centre streak bonus); every third consecutive dead centre restores a life.
- **Escalation**: level every three gongs — smaller gongs, faster/wider sway, swinging gongs from level 3, drifting
  mist banks from 4, and each level from 2 ends in a **chain** of two or three gongs rung on one life with only +3 s
  and whatever breath is left; whip-pans between sites; four colour moods cycle with the level.
- **A hit is an event**: recoil kick with spring recovery, muzzle flash, crack with a valley echo, 0.12 s of flight,
  then hit-stop, sparks, shock rings, a vibrating dented gong and an additive gong voice (five inharmonic partials,
  pitched by gong size, long and pure for dead centre, short and clanky for a clip); dead centre adds slow-mo and chime.
- **Identity**: brass spyglass with engraved rim, mil-dot reticle that warms when on target, parallax ridges, moon,
  rock spires with a timber gong frame, out-of-focus pine boughs, naked-eye valley behind the scope. Tense pulse music
  whose intensity follows breath-holding and the clock. Layout for portrait, landscape and desktop; Space works as the
  single button.

## Test results
- Smoke (`tools/smoke.js 18-one-breath`): pass, 61 fps headless, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/18-one-breath.test.js`): pass — pointer hold drains breath, release on target
  rings and scores, Space does the same, off-target release costs a life, breath-out gasps without firing, clock
  expiry costs a life, third loss ends the run with best saved, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (aiming, chain round with mist, result text, splash, game over).
- Tension and difficulty judged from code and scripted play only — no human playtest.

## Remaining issues
- Sway/level tuning is analytical (pass windows computed from speed and radius); late levels may need human tuning.
- Mist is only visual cover; there is no wind or bullet drop (kept deliberately out to stay distinct from Windfletch).
- Heartbeat haptics rely on `navigator.vibrate`, absent on iOS.
- In portrait the lower third is intentionally quiet (thumb zone + coaching text).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Hold–wait–release produces real tension from the first gong |
| Mechanical depth | 7 | Breath budgeting, pass selection, chains, streak-for-life; still a one-button game |
| Game feel | 8 | Recoil, delay, hit-stop, vibrating gong, graded audio; heartbeat kicks |
| Visual identity | 8 | Brass scope over a moonlit valley; readable gold-on-teal |
| Animation quality | 7 | Whip-pans, parallax sway, gong swing/vibration; scenery itself is static |
| Audio quality | 9 | Additive gong voice carries size and accuracy; echoing shot, heartbeat, reactive music |
| Controls | 8 | Hold/release anywhere or Space; pause-safe (never fires on resume); gasp is forgiving |
| Onboarding | 8 | Contextual HOLD → RELEASE coaching for the first three gongs; first gong is huge |
| Replayability | 7 | Random sway orientation, sites, mist, chains; score and streak chase |
| Performance | 9 | A few paths and one baked frame per draw; 61 fps headless |
| Technical robustness | 8 | Unit-space world survives resize; game-clock timers only; clean restart |
| Overall polish | 8 | Splash scene, panel messaging, themed game-over |

## Next recommended action
Human playtest of levels 5+; consider a rare "wind chime" bonus target and per-site scenery variety.
