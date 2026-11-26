---
id: PhoneGameLab/13-suds-patrol
title: Suds Patrol
was: 13-twin-stick (Twin-Stick Arena)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Twin-stick arena shooter: left thumb moves, right thumb picks the firing direction, enemies walk in from the edges.

## Baseline assessment
60-line prototype: blue circle vs. red circles on black, one enemy type, random trickle spawning with no waves, raw
`pointer*` listeners re-added on every restart (leaked handlers), no feedback beyond beeps, emoji heart counter, no best
score, unusable with mouse/keyboard. Overall 2/10.

## Weaknesses identified
No enemy variety, telegraphs or progression; sticks invisible until touched and fixed to screen halves with no dead zone;
no desktop controls; nothing to decide besides "shoot the nearest dot"; no identity.

## Creative opportunities
A bright, toy-like setting instead of neon-on-black; pickups that pull the player back into danger; a short upgrade
draft between waves so every run builds a different weapon; one-thumb accessibility through auto-aim.

## Planned improvements
Floating dual sticks on true multitouch + WASD/mouse + auto-aim fallback; five grime species with telegraphs and a boss;
authored wave director; sparkle pickups with a combo multiplier; 1-of-3 upgrade draft; original bathroom-floor identity.

## Implemented improvements
- **Controls**: two floating sticks read from `Lab.input.pointers` by pointer id (either thumb can start anywhere, base
  follows long drags, dead zones); portrait phones get a dedicated "bath mat" strip so thumbs do not cover the arena;
  WASD/arrows + mouse aim (hold to fire); when the aim input rests the wand auto-aims at 62% fire rate, so the game is
  playable one-handed or keyboard-only while manual aim stays clearly better.
- **Enemies** (all procedural sprites with googly eyes that track the player): Blob (chaser), Dust Bunny (fast weaver),
  Mildew (keeps range, swells and shows a dotted line before spitting goo; 3-way from wave 7), Drain Slug (shows a red
  lane, locks it for 0.3 s, dashes, is dizzy afterwards — hits a wall and it is stunned longer), Gunk (splits into three
  blobs), and The Clog (boss every 5th wave: ring bursts, summons, charges; health bar).
- **Readability**: every spawn is a growing puddle with a closing ring ~1 s ahead; goo is pink-rimmed purple on white
  tiles; player bubbles can pop goo.
- **Depth**: kills drop sparkles that expire — scooping them keeps the streak alive, and the streak sets a ×1–×8
  multiplier for kills and sparkles; nine stackable upgrades (fire rate, streams, size/damage, pierce, ricochet, speed,
  magnet, chain pop, heart) drafted 1-of-3 after each wave.
- **Feel**: wand recoil, squash/flash/knock-back on hit, splat decals, pop rings, hit-stop and shake scaled to enemy size,
  slow-mo boss kill, hurt shock-wave that shoves grime away and clears nearby goo, i-frames with blink, low-health heartbeat.
- **Audio**: soft bubble shots (pitch drops with Big Bubbles), pops pitched by enemy size, pentatonic ladder for the
  streak, warnings per telegraph type, bouncy generative music whose intensity follows the crowd.
- **Loop**: splash → waves with banners → draft → … → "Washed up" card with wave, best combo, kills; clean restart.

## Test results
- Smoke (`tools/smoke.js 13-suds-patrol`): pass, 60 fps headless, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/13-suds-patrol.test.js`): pass — CDP two-finger input moves and aims at the same
  time, aimed bubbles kill and score, WASD + mouse, wave clear → draft → tap applies an upgrade, grime contact → game
  over, best saved, clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800: play, enemy line-up with telegraphs, draft (stacked and
  side-by-side), splash, game over.
- Difficulty tuned with a scripted kiting bot over several seeds (auto-aim only, random upgrades: dies around waves 4–6;
  with strong upgrade picks it survives much longer). Subjective judgement from code and scripted play, **no human playtest**.

## Remaining issues
- Balance rests on bot runs: upgrade power vs. enemy HP growth past wave ~10 is unverified by people.
- On large desktop windows the arena is roomy, so early waves are easier than on a phone.
- Boss has three attacks that cycle in a fixed order; later bosses only scale numbers.
- No dash/secondary ability; the hurt shock-wave is the only panic tool.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Shoot → scoop → draft loop works from wave 1; waves take 15–25 s |
| Mechanical depth | 8 | Five behaviours to prioritise, combo-vs-safety pickup tension, nine stackable upgrades |
| Game feel | 8 | Recoil, squash, flash, knock-back, decals, scaled shake/hit-stop |
| Visual identity | 8 | Bath-tile arena, soap hero, googly grime — recognisable, not neon |
| Animation quality | 7 | Wobble, spawn pop-in, wind-ups, dizzy eyes; no multi-frame character animation |
| Audio quality | 7 | Informative pitches and streak ladder; limited by preset palette |
| Controls | 8 | Real multitouch floating sticks, mouse/keys, auto-aim fallback; untested on hardware |
| Onboarding | 8 | Ghost sticks labelled MOVE / AIM + FIRE, trivially easy first wave, one new enemy per wave |
| Replayability | 8 | Random drafts and wave mixes, bosses, score/combo chase |
| Performance | 9 | Baked sprites, bounded lists (≤30 enemies, 160 bubbles, 70 goo), 60 fps headless |
| Technical robustness | 8 | Clean restart, resize re-layout with clamping, sticks survive pause/draft |
| Overall polish | 8 | Cohesive from splash to game-over card |

## Next recommended action
Human playtest on a phone for stick feel and wave-6+ balance; add a second boss pattern set.
