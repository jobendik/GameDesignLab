---
id: games/chroma-frenzy
title: Chroma Frenzy — Two-Ink Reflex Rush
was: Neon Dopamine Rush — Chroma Frenzy
status: transformed
baseline: 4
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A smiley blob slides along the bottom of the screen under the pointer. Gems in five colours rain down, red/orange
spikes kill on touch, collecting the same colour repeatedly builds a "colour chain", skimming a spike is a near miss,
and a white power orb grants a five-second FRENZY (shield, magnet, slow motion). The kernel worth keeping: **steer a
little face through a rain of coloured things, where colour matters, danger pays, and frenzy is the release.**

## Baseline assessment
Playable but shallow (4/10). It had dt-based movement, a WebAudio beat and a daily seed — more finished than its
sibling. But colour was decoration: every gem is good, so the "chain" is whatever happened to fall on you; the best
strategy is to hoover everything and dodge the two-in-ten red things. One-hit death with no feedback beyond a flash,
score that ticks up for merely surviving, ~165 minified lines with CrazyGames SDK hooks, `nr2_*` storage keys instead of
the arcade's best key, no pause button, keyboard that teleports the target 160 px, gradients rebuilt every frame,
five glowing colours on near-black with a starfield — the default "neon" look.

## Weaknesses identified
1. Colour never forces a decision; the title mechanic does nothing.
2. Frenzy is a pickup that falls from the sky, not something earned by play.
3. Score accrues for idling; the multiplier is a slow float nobody can read.
4. Instant death makes the near-miss mechanic a bad bet, so nobody would use it.
5. Generic look, unreadable long-line source, ad-SDK calls, wrong storage key, weak lifecycle.

## Creative opportunities
Its sibling `neon-burst` became the *planning* game (one placed spark, a cascade you watch). This one should be the
opposite: a **reflex** game with no waiting at all, where the colour is *yours* to switch. Reduce five colours to two
inks and make every falling thing food or poison depending on which ink you are wearing — then authored patterns can
demand flips on purpose, late flips can be rewarded, and FRENZY ("every ink is food") becomes the pay-off for a streak.
Two inks also suggest a look nobody else in the arcade has: a two-colour risograph print on cream paper.

## Planned improvements
Rewrite around ink polarity: drag to steer, tap to flip; authored phrase generator; streak multiplier with rising
thresholds and a drain; three lives with tempo knock-back; earned frenzy; snap / close / thread bonuses; print-shop
art direction with shape-coded inks; tempo-locked music with layers; lifecycle, hooks, test, review.

## Implemented improvements
- **Core loop**: coral is always a circle, blue always a square — the blob morphs between them. Matching shapes are
  swallowed (10 × multiplier, streak +1); the wrong ink costs a life, the streak, the multiplier and 20 % of the
  tempo, with 1.3 s of mercy. Nothing scores for merely surviving.
- **Authored print run**: a seeded generator strings phrases that track which ink you should be wearing, so flips are
  demanded deliberately — streams, alternations (every 3 / 2 / 1), parallel pairs (pick one, or weave both), braids,
  full-width bars you must *thread* in the right ink, split bars (move or flip), checker rows, and spike escorts.
  The first five phrases are a silent tutorial (your ink → the other ink → alternation → a choice → a bar). Spacing
  stretches with tempo so forced flips never come faster than ~0.2 s.
- **Skill expression**: SNAP (swallow within 0.32 s of a flip: double points, double meter), CLOSE (skim a wrong
  shape), THREAD (+50, streak +2). Multiplier steps need ever longer streaks (8, 18, 30 … 120 for ×9) and a 2.6 s
  drain bar drops one step if you stop eating. Tempo climbs with time and multiplier; a hit knocks it back — the
  game speeds up exactly as fast as you can hold it.
- **Earned FRENZY**: the meter fills from catches, snaps, skims and threads. Frenzy floods the sheet with a third
  ink (gold), turns everything — spikes included — into food at ×2, magnetises it, returns a life, and ends with a
  beat of invulnerability so magnetised leftovers cannot ambush you.
- **Feel**: flips are instant (mouse-down, key-down, second finger on contact; a lone tap on release) with a squash,
  a ring in the new shape and a pitch per ink; swallow = bulge + flat ink splat + next note of a pentatonic run in
  that ink's timbre; hit = 90 ms hit-stop, 9 px shake, a stain left on the paper that scrolls away, music ducked
  through a low-pass. Wrong-ink shapes near you get a small ✕ so danger is not colour-only.
- **Look**: cream paper strip with grain, lane perforations and scrolling sprocket ticks on a navy halftone desk;
  flat inks with hard offset shadows; Bebas Neue poster type; cards with two-ink offset shadows.
- **Audio**: 16th-note scheduler whose BPM follows the tempo; kick + bass always, snare at ×2, hats at ×3, arpeggio
  at ×4, octave lead in frenzy. Mute button + M; starts on first gesture.
- **Controls**: touch (relative drag ×1.25 so the thumb never covers the blob; tap / second thumb flips), mouse
  (move = steer, click = flip), keyboard (A/D or arrows, Space/W/↑ flips, P/Esc, M). Iframe-safe.
- **Lifecycle**: attract mode (an autopilot plays behind the menu), pause button/keys/auto-pause, resize-safe,
  fixed 60 Hz simulation, `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, `window.__gdl` (state, `advance`,
  `manual`, `toScreen`), best in `gdl:best:games/chroma-frenzy`. CrazyGames hooks and `nr2_*` keys removed.

## Test results
- **Automated-technical**: `node tools/smoke.js chroma-frenzy` — pass, 61 fps, no errors.
- **Automated-gameplay**: `node tools/run-tests.js chroma-frenzy` — pass, 7 consecutive green runs after one real
  failure that exposed two things: the test let real time run before taking over the clock (fixed in the test), and
  frenzy could end with a magnetised wrong-ink shape on top of you (fixed in the game with the grace window). Covers:
  real touch drag steers without flipping; catches score 10 each; quick tap / second finger / click / Space flip;
  arrows steer; eight in a row = ×2; wrong ink = life, streak, multiplier and tempo lost; scripted player reaches
  FRENZY, both inks eaten safely, life restored; pause freezes the clock; mute; three wrong inks = MISPRINT, best
  stored; restart resets and replays the same seeded run.
- **Visual inspection**: portrait, landscape and desktop looked at in menu, early play, frenzy, hit, late game and
  game over. Fixed: multiplier racing to ×9 in 15 s, SNAP labels piling up, first-touch flip wart (now tap-on-release).
- **Subjective playtest**: informed judgement from code and scripted play, not a human playtest. A perfect bot
  holds ×9 for 90 s, so the ceiling is set by human reading speed; where the wall really sits is untested. Audio unheard.

## Remaining issues
- Difficulty for real hands is a guess: tempo ramp (0.017/s to 2.5×) and the 0.2 s flip floor need human tuning.
- Landscape phone uses a 240 px strip (playable, small); the game is at its best in portrait.
- Skims are rare outside rows and braids; the bonus may be too quiet to notice.
- No colour-blind setting beyond the circle/square shape coding and the ✕ marker.
- One-finger play costs a short lift to flip; two thumbs is clearly the better grip and only the menu says so.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Steer + flip is busy in the first five seconds; phrases keep changing what the hands must do |
| Mechanical depth | 7 | Polarity, late-flip snaps, threads, pair/row routing, drain and tempo knock-back; one verb more would help |
| Game feel | 8 | Instant flips with morph and squash, bulge and note on every catch, hit-stop + stain + ducked music on a hit |
| Visual identity | 9 | Two-ink riso poster with a gold frenzy flood; unlike anything else in the arcade, legible at a glance |
| Animation quality | 7 | Morphing blob, tilt, trail, splats, punchy labels; falling shapes themselves are static |
| Audio quality | 7 | Tempo-locked layered beat, ink-specific voices — carefully built, unverified by ear |
| Controls | 8 | Relative drag, instant second-thumb flip, mouse and keys; single-finger flip has tap latency |
| Onboarding | 8 | Silent five-phrase tutorial, device-specific hints, attract mode, three-line how-to |
| Replayability | 8 | Seeded endless run, flow-state tempo, multiplier to protect, best score |
| Performance | 9 | Flat fills only, < 60 shapes, cached paper, capped particles; 61 fps in smoke |
| Technical robustness | 8 | Fixed-step deterministic sim, clean restart, pause, resize, guarded storage, test green 7× |
| Overall polish | 8 | Menu → run → MISPRINT → retry is seamless; nothing placeholder |
## Next recommended action
Human playtest on a phone to tune the tempo ramp and flip floor, then consider a third verb (e.g. a hold-to-split
stance that eats both inks at half points) and a daily seeded run.
