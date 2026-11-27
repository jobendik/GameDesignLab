---
id: games/power-wash-royale
title: Power Wash Royale
was: same
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Three stacked canvases: a random colour-tile floor, a grey "dirt" layer erased with `destination-out`, and an
entity layer. A dot eases toward the mouse and, while the button is held, emits water particles that punch holes
in the dirt; a second dot wanders at random spraying constantly. Two percentages tick up. The kernel worth keeping:
**grime disappearing under your pointer while someone else is taking the same grime from you.**

## Baseline assessment
Bare sketch (2/10). No start, no end, no winner — the percentages just climb until the floor is clean. Frame-count
simulation (speed depends on refresh rate), a `getImageData` call per particle per frame, the map regenerates on
every resize (twice — two resize handlers), `cursor:none` with a DOM ring that touch never moves, scoring that
credits full brush area for any overlap, a bot that sprays walls, nothing underneath worth revealing, no audio,
no pause, no best, no touch layout.

## Weaknesses identified
1. No game structure: no round, no stakes, no result, nothing to replay for.
2. The clean layer is random squares — the reveal, which is the whole pleasure of power washing, has no payoff.
3. Erasing is binary holes from particles that land wherever; nothing to manage (no pressure, nozzle, grime types).
4. The rival is random noise, so "royale" means nothing.
5. Performance and lifecycle problems listed above.

## Creative opportunities
Take the title literally: an elimination tournament of washers on one surface, scored by who removed the most
grime, with a mural that comes back to life as everyone works. Make the stream itself the skill — a pressure gauge
that rewards staying on dirt, a second nozzle for a second kind of grime, hidden things under the dirt — and make
every round end with the whole picture rinsed clean so even a loss ends on the satisfying frame.

## Planned improvements
Rewrite on a thickness grid (not particles): direct-manipulation brush under the finger with a speed-limited
washer trailing it; pressure, fan/jet, mud and stains; three purposeful rivals; 50 s rounds 4 → 3 → 2 with the
lowest share eliminated, then tougher cups; four procedural murals; real audio; full lifecycle; test; review.

## Implemented improvements
- **Core washing**: a 4-unit grime grid (240×150 cells, rotated for portrait) stores thickness; the brush removes
  thickness with a soft falloff and is stamped along the swept segment, so thin films and crisp cleaned edges emerge
  naturally. Dust, darker mud blobs and speckled black **stains** (10× resistant to the fan). The cleaning spot is
  wherever you point, clamped to the lance's reach; the washer runs after it at a fixed speed, so position and
  route matter.
- **Pressure**: rises while the stream is actually removing grime, bleeds when it hits clean ground; it scales
  brush radius and power, is drawn as a ring around the spot and as the tank on the washer's back, and chimes at
  MAX. Efficient routes are visibly, audibly stronger.
- **Nozzles**: FAN (wide) and JET (narrow, long reach, ~4× power — the only thing that shifts stains). Button
  (reachable by the other thumb while spraying), Q/E/Shift/Space, right-click. A contextual hint appears the first
  time you grind a stain with the fan.
- **Hidden things**: four gems (bonus share + 50 points) and two TURBO bolts (5 s of oversized max-pressure stream)
  lie under the grime and glint through it now and then; whoever uncovers them gets them.
- **Rivals**: SUDS (fast, sloppy), MOPSY (slow, thorough), DRIP (stain hunter). Each picks the dirtiest reachable
  block (coarse density map kept up to date as cells are cleaned), avoids crowds, wobbles its sweep, and obeys the
  same pressure/reach/speed rules. Streams shove other washers and sap their pressure; bodies collide.
- **Royale structure**: round 1 four washers, lowest share is OUT; round 2 three; round 3 the final. Win it and a
  tougher cup starts (bot skill +0.18 per cup; cup 1 is deliberately gentler). Score = share × round × cup, place
  bonuses, gems, champion bonus. The share bar under the HUD shows everyone live, hatches whoever is in the drop
  zone, and a red warning tells you when that is you.
- **The reveal**: four procedural murals (Koi Plaza, Sunburst Court, Chalk Street, Garden Mosaic) with seeded
  detail; a wet-sheen trail follows every stream; at the whistle a sparkling diagonal rinse clears whatever is left
  so the results card always sits over the finished picture. The menu runs an attract mode with the rivals washing.
- **Audio**: procedural WebAudio. The stream is a filtered-noise loop whose brightness follows pressure, with a low
  scrub layer that follows how much grime is coming off (clean ground sounds thin, thick mud sounds heavy) and a
  whistle-y band for the jet; quiet crowd hiss for rivals; gem, turbo, max-pressure, nozzle, countdown, whistle,
  shimmer, win/lose stingers; a light marimba loop that speeds up for the last ten seconds.
- **Lifecycle and conventions**: fixed 60 Hz step, sim-time timers, pause (button, P/Esc, hidden tab), clean
  restart, resize/rotate re-lays-out and redraws the mural deterministically, reduced-motion respected, safe areas,
  three layouts, `?seed` / `?autostart=1` / `?mute=1` / `?nopause=1`, `window.__gdl` (state, advance, manual,
  toScreen, dirtAt, stains, aim), best in `gdl:best:games/power-wash-royale`, canvas focuses itself in the iframe.

## Test results
- **Automated-gameplay** `node tools/run-tests.js power-wash-royale` → pass (21 s; five consecutive passes on
  the final build). Real CDP touch: countdown blocks washing; a drag removes the grime under the finger and raises
  share and pressure; the washer chases a far stream within reach; a stain survives the fan and is erased by the
  jet after a genuine two-finger press on the nozzle button; keyboard spray/nozzle/mute; pause freezes the clock;
  a scripted player finishes round 1 by dragging the touch point to the dirtiest nearby spot (1st, 34–38 %); the
  card ranks four washers, marks the lowest rival OUT and banks exactly share + place + gems; round 2 has three
  washers; idling ends last → OUT → final score and best stored; PLAY AGAIN resets everything.
- **Automated-technical** `node tools/smoke.js power-wash-royale` → ok, 61 fps, no errors.
- **Visual inspection**: menu, early/mid/late round, rinse, results and game-over cards looked at in 390×844,
  844×390 and 1280×800.
- **Balance sim** (scratch script): a competent scripted player (fan only, 260 u/s) takes 31–43 % in round 1 and
  typically wins 2–4 cups before the bots outpace it; an idle player is out in round 1.
- **Subjective playtest**: informed judgement from scripted play and screenshots, not a human playtest.

## Remaining issues
- With four washers a 50 s round usually ends on time at ~85–90 % clean rather than "SPOTLESS"; the rinse covers
  it, but the last ten seconds can be a hunt for scraps.
- The grime layer is upscaled from a 4-unit grid, so edges are soft rather than crisp at desktop size.
- Rivals never use shoving deliberately; jostling is incidental.
- Touch has no way to reposition without spraying (by design: hold = go + spray), so crossing clean ground always
  costs a little pressure.
- Bot difficulty beyond cup 3 is extrapolated, not played.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Wiping grime off a bright mural is immediately pleasant; the live share bar and drop zone give it urgency |
| Mechanical depth | 7 | Route efficiency via pressure, fan/jet choice, stains, gems/turbo, crowd avoidance; still a fairly simple race |
| Game feel | 8 | Zero-latency brush under the finger, wet trail, mist and flecks, pressure ring, stream sound that tracks the work |
| Visual identity | 8 | Four distinct murals under brown grime, chunky top-down washers with emblems; grime edges are a little soft |
| Animation quality | 7 | Walk cycles, stream jitter, rinse sweep, bar tweens, banners; washers are simple shapes |
| Audio quality | 8 | Informative layered spray, clear stingers, music that reacts to the clock; all synthesized |
| Controls | 8 | One-finger hold-and-drag, thumb nozzle button, mouse + right-click, full keyboard play |
| Onboarding | 8 | Three-line card over an attract mode, countdown, first-drag hint, contextual jet hint, drop-zone warning |
| Replayability | 8 | Seeded grime, four murals, three rival personalities, elimination ladder, escalating cups, best score |
| Performance | 9 | Typed-array grid, one 240×150 putImageData per frame, cached mural, 240-particle cap; 61 fps headless |
| Technical robustness | 8 | Fixed-step sim, clean restart, pause/visibility/resize/rotate handled, repeatable test |
| Overall polish | 8 | Menu → countdown → round → rinse → results → next is seamless; nothing placeholder remains |
## Next recommended action
Human playtest for the cup 2–4 curve and round length; consider a sharper grime render (2-unit grid or an edge
shader pass) and one deliberate rival behaviour (a bot that defends its patch by shoving).
