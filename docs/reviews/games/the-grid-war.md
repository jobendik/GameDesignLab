---
id: games/the-grid-war
title: The Grid War — Supply Lines
was: THE GRID WAR (TheGridWar.html)
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A full-screen grid of 20 px cells. Click/drag paints cells cyan; a `setInterval` "virus" turns random cells red,
faster next to existing red. Two DOM pills show the percentages and a fake "1,420 Live Players (Simulated)" counter
sits in the corner. The idea worth keeping is **you versus a spreading enemy, claimed cell by cell with your finger**.

## Baseline assessment
Bare sketch (2/10). No goal, no end, no score, no restart. Painting is free and unlimited, so it is scribbling, not
play; fast drags leave gaps (only the cell under each event is painted); the "AI" is random noise with no intent;
red can overwrite you but there is no way to fight back other than painting over it. Resize keeps a ragged grid,
the loop is frame-count based, no pause, no best, no metadata worth the name, a fake live-player counter.

## Weaknesses identified
1. No objective or end state, so nothing to win or replay.
2. Unlimited free painting: no decisions, no cost, no risk.
3. The rival has no behaviour to read or counter.
4. Gaps in strokes, no touch-specific layout, no feedback beyond particles, two thin sounds.
5. Lifecycle and conventions missing (pause, restart, best, seeds, hook, reduced motion, safe areas).

## Creative opportunities
Make territory *mean* something: land only counts while it is wired back to a core. That one rule turns painting
into drawing supply lines, creates a reason to attack (cut their line and everything past it dies) and a reason to
defend, and makes the rival's tendrils readable threats. Add the classic "wall it off" grab for big moments, an ink
budget so every stroke is a choice, and cores to storm so a sector ends with a bang.

## Planned improvements
Rewrite as a fixed 28×16 board (rotated for portrait) with ink, adjacency-only claims, supply/decay, fortifying
cells, enclosures, relays, cores with HP, a goal-driven rival, sector progression, real audio, full lifecycle, test,
review. Remove the fake player counter.

## Implemented improvements
- **Supply lines**: every turn the game floods out from each side's cores; cells not linked back flicker and
  crumble 0.35–1.1 s later. Cutting a red line therefore deletes everything beyond it ("CUT! n CRUMBLE", +2 per cell),
  and the same can happen to you ("Your line was cut"). A visible pulse travels outward from each core along the
  network, so what is linked is readable at a glance.
- **Ink**: claims cost ink (neutral 1, relay 3, red cell 2 per hit, core 3 per hit); 30 max, 7/s refill, +2.4/s
  per linked relay. Shown as a bar and as a ring around the finger/cursor while drawing.
- **Claims only touch linked land**; strokes are traced at 0.3-cell steps so fast drags never skip cells; holding on
  a red cell or core keeps hitting it (every 0.11 s). Linked cells fortify over time (inner mark grows) and take
  extra hits to break, so old land is sturdy and fresh tendrils are fragile.
- **Enclosure**: any pocket of ground no longer connected to an opposing core (map edges count as walls) flips to
  the side that sealed it, with a ripple, chord and score. Applies to the rival too.
- **Cores and relays**: hold on a red core to drain its HP ring (it repairs if you let go); captured cores become
  yours. Relays (amber) boost ink. Point-symmetric procedural walls/relays so both sides face the same terrain.
- **Rival**: picks goals (defend a threatened core, nearest relay, your best cut point found from your supply tree,
  your core, open ground) and grows a tendril toward them by always hitting the frontier cell nearest the goal, with
  some blob growth. Sector n: rate 3 + 0.95(n−1) actions/s (cap 9), more ink, 2 cores from sector 3, 3 from 5,
  stronger home cells from 4.
- **Structure**: 100 s sectors; take every red core to win (or hold more ground at the whistle). Score: claims,
  enclosures, cuts, relays (+25), cores (+300), time bonus 6/s left, sector bonus 250×n. Run ends when your last
  core falls or you hold less ground at time-out. Results card with breakdown; final card with score/sectors/best.
- **Look**: neon "circuit board" identity in Orbitron/Rajdhani, cyan squares vs red diamonds (shape cue, not colour
  only), hatched walls, pop-in with overshoot, crumble flicker, particles (pooled, 260 cap), floating callouts,
  restrained shake (off under reduced motion), onboarding beacon on your core in sector 1, frontier dots showing
  where you can claim. The menu runs an attract match behind the card.
- **Audio**: claim blips climb a pentatonic scale along a stroke; cell flip crunch; chip ticks; deny/no-ink thuds;
  cut sting; crumble noise scaled by size; enclosure arpeggio scaled by size; core hits drop in pitch as HP falls;
  core alarm; capture/loss/win/lose stingers; countdown ticks; a bass + arpeggio loop that turns harsher when the
  static holds more ground and speeds up in the last 20 s. Mute button + M; starts on first gesture.
- **Lifecycle/conventions**: fixed 60 Hz step, pause (button/P/Esc/hidden tab), clean restart, resize/rotate
  re-lays out (portrait rotates the board so you play bottom-to-top), safe areas, 44 px buttons, HUD hidden behind
  cards with opaque card backing, `?seed` `?autostart=1` `?mute=1` `?nopause=1`, `window.__gdl` (state, advance,
  manual, toScreen, cell, grid, cores, plus `setAI`/`bot` for balance sims), best in `gdl:best:games/the-grid-war`.

**Closest neighbour:** *Power Wash Royale* (also "own the most of a surface against rivals"). There, every stroke is
free-form erasing scored by share; here land is a connected network that can be severed, enclosed and stormed,
against one strategic rival, and sectors are won by capturing cores rather than by percentage.

## Test results
- **Automated-gameplay** `node tools/run-tests.js the-grid-war` → pass (≈6 s), three consecutive passes. Real tap on
  DEPLOY; mouse-pointer drag claims a line and spends ink; tap on unconnected ground is refused; a line to the top
  edge plus one sealing tap encloses the strip behind it; a replanning push through neutral and red cells to the red
  core and holding on it captures it; red land is swept, SECURED card, best saved; sector 2 carries the score;
  arrow keys steer the cursor and claim; P pauses and the clock freezes; idling loses the grid; final card shows the
  stored best; PLAY AGAIN resets everything.
- **Automated-technical** `node tools/smoke.js the-grid-war` → pass, 61 fps.
- **Visual inspection**: screenshots at 390×844, 844×390 and 1280×800 (menu, mid-game, drag with ink ring, results)
  were looked at; floating-text overlap and a banner showing through the card were fixed after looking.
- **Balance sims** (rival brain on the cyan side, 3 seeds): idle player loses sector 1 in 39–53 s; a 4-actions/s
  bot wins sector 1 on time and dies in 2–3; 6/s reaches sector 3–4; 8/s reaches 4–6.
- **Subjective playtest**: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Difficulty tuned against bots, not people; a skilled human may find sectors 1–2 easy and the late curve steep.
- The rival does not plan enclosures deliberately; it seals pockets only by accident.
- Cells are ~24 px on a phone in portrait: drags are comfortable, single taps on a precise cell less so.
- No distinct sector events/maps beyond more cores, walls and speed.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Drawing a line, cutting theirs and watching it crumble is satisfying within seconds; sectors end decisively |
| Mechanical depth | 7 | Ink budget, supply cuts, fortification, enclosures, relays, core siege: real routing decisions |
| Game feel | 6 | Pop-in, crumble, rising stroke pitch, hit-flash, shake; no hit-stop, core siege could hit harder |
| Visual identity | 7 | Coherent neon circuit look, shape-coded sides, readable network pulse |
| Animation quality | 6 | Overshoot pop, ripple enclosures, flicker decay; cores and relays only lightly animated |
| Audio quality | 6 | Informative layered SFX and reactive loop; simple synthesis, not tested by ear |
| Controls | 7 | Gapless drag, hold to siege, keyboard cursor; small cells for taps on phones |
| Onboarding | 7 | Three-line card, beacon on the core, frontier dots, contextual hints |
| Replayability | 7 | Seeded procedural sectors, escalating rival, score/best chase |
| Performance | 8 | 448-cell board, pooled particles, cached background; smoke 61 fps |
| Technical robustness | 8 | Fixed step, pause/blur/resize/rotate, clean restart, no errors in test/smoke |
| Overall polish | 7 | Menu → sector → results → next → game over → retry all seamless; no placeholders |

## Next recommended action
Human playtest on a phone to tune rival speed per sector and ink refill; then give the rival a deliberate
enclosure move and add one sector twist (moving walls or a neutral "storm" that erodes unfortified cells).
