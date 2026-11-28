---
id: games/spire
title: Ticktock Tower
was: SPIRE — one-tap bounce roguelite
status: transformed
baseline: 4
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"SPIRE" was a reskin of Bounce Dungeon: a ball bouncing in a single-screen "floor" of the spire, one tap launching it up
and flipping its direction, a hidden sine oscillator grading taps PERFECT/GOOD/OK/WEAK, slimes/bats to smash, an XP bar
with "overdrive" level-ups, a portal to the next floor and the same nine flat stat upgrades. Despite the name, nothing
climbed.

## Baseline assessment
Played in headless Chromium at 390×844 (`sp-base-*.png` in the scratch dir). It ran and looked tidy (starfield, Bungee
type), but: the same game as `bounce-dungeon.html` with a different palette; timing quality was invisible noise; no
vertical ascent despite the title; Google Fonts loaded from the network; no seed, no `gdl:best`, no auto-pause; and the
title now clashes with "Spire: The Climbing Table" (`pinball-wizard-3d.html`). Baseline 4.

## Weaknesses identified
1. No identity: a duplicate of its sibling, and a name already used in the arcade.
2. The promised climb did not exist; "rhythm" was a hidden oscillator.
3. Upgrades without decisions; no route, no run arc, no finale.
4. External font requests; missing conventions.

## Creative opportunities
Take the word "spire" literally and make the *verb* about time: a vertical shaft you climb by leaping wall to wall,
where every leap lands on the next tick of a clock. That makes rhythm physical (the tick is when you land, the beat is
when hazards bite) and opens a route game that one tap can express: each leap keeps you in one of two interleaved
lanes; *not* tapping (slipping one brick) is the only way to change lane — so the lane you ride into a landing chooses
the door. **Difference from Bounce Dungeon, stated plainly:** Bounce Dungeon is a fixed-room combat crawler (aim bank
shots, fight telegraphed enemies and a boss per floor, relic after every room). Ticktock Tower has no combat at all: it
is a scrolling vertical ascent about **timing and route** — tap on the beat, read the landing glow, dodge pendulums and
moths by shifting your phase, choose forks by choosing when to slip, outclimb the rising dark. Cold moonlit
teal/brass clockwork vs. warm torch-lit stone; Bungee + Chakra Petch vs. Cinzel + Baloo; a metronome-driven score vs. a
drum loop.

## Planned improvements
Rename and re-theme; beat-quantised wall leaps; slip-to-switch-lanes; beat-patterned gear teeth, pendulums and moths;
a rising dark; 15 stairs in 5 zones with rising tempo; forks with typed stairs (shrine/font/gilded/storm/reliquary);
13 charms with tag sets; meta unlocks; daily tower; audio that is the clock; conventions.

## Implemented improvements
- **Rewrite** (single file, ~490 dense lines, vendored fonts only), fixed 120 Hz step; a beat clock inside the
  simulation; seeded `mulberry32` for the tower (cosmetics use `Math.random`).
- **Verb**: TAP leaps to the other wall, one brick up, immediately; the leap always lands on the first tick at least
  0.45 beat away (so an on-beat tap = a one-beat leap, an off-beat tap = a longer leap that lands a tick later — phase
  shifting is a tool). Taps are judged against the nearest tick: PERFECT ≤ 65 ms, GOOD ≤ 135 ms, else EARLY/LATE (combo
  lost). Taps in the last 0.2 s of a leap are buffered and judged by their real time.
- **Slip**: hang on past the tick (+150 ms grace) and you slip one brick per beat. A slip changes the lane parity —
  the route mechanic — and costs a brick, a beat and the combo.
- **Hazards, all pure functions of the beat**: gear-tooth bricks with 2/3/4-beat cycles (pips show the cycle, slots glow
  red half a beat before they bite, landing on or hanging on a biting brick costs a heart and knocks you down two
  bricks); missing bricks (fall to the next brick); pendulums whose blade crosses the leap path on alternating
  half-beats (blade turns red near centre); clock moths that cross a row on a 4-beat cycle after a red dashed warning.
  The rising dark (0.5→0.74 bricks/beat by zone) never sits more than 9 bricks below.
- **Readable trajectory**: while you cling, a dotted arc and a framed landing brick show where a tap *now* would land —
  blue safe, gold for gems/doors, red with "TEETH"/"NO BRICK" when it would hurt. An osu-style ring around the spark
  shrinks to the next tick.
- **Route**: every stair ends in two doors (STAIR, GILDED STAIR, STORM STAIR +12 BPM ×1.5 score, SHRINE → charm,
  FONT → heart, RELIQUARY → rare charm) labelled on the walls with "▲ YOUR LANE" on the door your current lane reaches;
  slip once to take the other one. 15 stairs over 5 zones (90 → 132 BPM) to the Twelfth Chime; a new zone mends a heart.
  A winning bot run takes ~5–5.5 min; real runs with deaths and learning are longer.
- **Charms** (13, 4 tags, sets at 3): e.g. Spring Heels (PERFECT leaps climb two bricks and switch lanes), Second Wind
  (tap early in a leap to turn back), Tempo Thief (PERFECT leaps push the dark down), Metronome (12-combo ward),
  Featherfall, Lodestone, Tithe Box. Sets: IN THE POCKET, WINGS, BASTION, MIDAS.
- **Meta**: banked gems unlock 5 more charms (40 → 400); best height, chimes reached; **daily tower** (date seed).
- **Audio**: the music is the clock — tick/tock on every beat scheduled against the simulation's beat clock, a zone-keyed
  bass line, hats/snare/arpeggio layers that join as the combo grows; leap chimes climb a pentatonic scale with the
  combo (PERFECT louder than GOOD; OFF is a wooden thunk); a low drone swells as the dark closes in.
- **Feel**: squash on landing, combo popups, rings and bursts scaled by judgement, shake/flash only on hits (no
  hit-stop — it would break the rhythm), `prefers-reduced-motion` disables shake.
- **Onboarding**: count-in (the clock ticks, nothing slips or rises until your first tap), "TAP ON THE TICK" prompt, then
  three prompts in the first stair (one tap per tick → slipping → red landing glow).
- **Conventions**: title/description/genre/controls metadata, Google Fonts removed, DOM cards with opaque backing (canvas
  HUD hidden behind them), pause button + Esc/P + auto-pause on blur/hidden with a 2-beat count-in on resume, mute
  button + M, 44 px targets, landscape/desktop HUD in the side margin with a moonlit exterior, `gdl:best:games/spire`,
  `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, `window.__gdl` (`state`, `manual`, `advance`, `tap`, `pick`,
  `cheat`, `cell`, `out`, `haz`, `predict`).

## Test results
- **Automated-technical**: `node tools/smoke.js games/spire` → pass (61 fps headless).
- **Automated-gameplay**: `node tools/run-tests.js spire` → pass, three consecutive runs (≈3 s each, manual stepping).
  Real tap on CLIMB; nothing slips or rises during the count-in; a real touch tap on the tick is PERFECT and lands exactly
  one tick later one brick up; an off-beat Space tap is judged OFF, breaks the combo and lands on the second tick;
  hanging on slips one brick only after the grace window while the dark rises; a leap the preview flags as teeth,
  delayed by half a beat, lands on the same brick unharmed; a flagged leap taken on purpose bites (−1 heart, knocked down);
  over several forks the pilot enters the *other* door each time, at least once by slipping on purpose; a shrine ends in
  a charm draft picked with a real tap (count-in follows); pause/resume/mute; not tapping ends the run (card, stored best,
  banked gems, route shown); tap-anywhere restart reproduces the seeded first fork; pause → MENU → DAILY TOWER runs today's
  seed.
- **Visual inspection**: menu, draft, run-over, a fork with doors, the Gearworks with teeth/pendulums/voids, the summit,
  at portrait / landscape / desktop, opened and judged.
- **Balance bots** (scratch): a pilot that taps on the tick (±30 ms) and uses the landing prediction to shift phase wins
  2 of 5 seeds in 293–334 s and dies on stairs 3–14 otherwise; a pilot that never reads the preview dies on stair 2–4.
- **Subjective playtest**: informed judgement from code, bots and scripted screenshots only — no human hands.

## Remaining issues
- Timing windows and the 0.45-beat quantisation are reasoned, not felt; audio latency on real phones may need a
  calibration offset (not implemented).
- The preview only covers the landing brick; pendulums/moths must be read directly (the bot used an internal predictor).
- Spring Heels/Second Wind change lanes, which the "YOUR LANE" door marker does not anticipate.
- The tower's art is clean but sparse (bricks, gears, arches); no character animation beyond the clock-hand spark.
- Audio not ear-checked; the run's late zones may be too fast at 132+12 BPM for some players.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Immediate tap-on-the-tick climb; the dark and the forks give every few seconds a decision |
| Mechanical depth | 7 | Phase shifting, lane switching by slipping, beat-patterned teeth, route typing, charms that bend the rules |
| Game feel | 7 | Instant leap, landing on the tick, chimes climbing with combo, squash/rings; no hand-tuning |
| Visual identity | 7 | Moonlit clock-tower shaft, brass gears, red teeth, golden spark with a clock hand; a recognisable silhouette |
| Animation quality | 6 | Arcs, squash, swinging pendulums, flapping moths, beat ring, tendrils of the dark; static bricks |
| Audio quality | 7 | Beat-accurate tick/tock clock, layered by combo, pentatonic leap chimes, dark drone; not ear-checked |
| Controls | 8 | One tap anywhere/any key, buffered taps judged by real time, generous grace before slipping |
| Onboarding | 7 | Count-in, honest landing glow, three staged prompts; lanes/doors need one fork to "click" |
| Replayability | 8 | Seeded towers, route choices, charm builds and sets, unlocks, daily tower, score chase |
| Performance | 9 | Only visible rows drawn, cached background tile and glow sprites, capped particles; 61 fps headless |
| Technical robustness | 8 | Beat clock inside the fixed-step sim, pause/blur/resize safe, deterministic test incl. restart |
| Overall polish | 7 | Menu → climb → forks → draft → card → retry seamless; finale is a static clock face |

## Next recommended action
Human rhythm playtest (windows, tempo curve, a latency-offset setting), then add a pendulum/moth "danger along the arc"
tint to the preview and an animated finale (the bell actually tolling twelve).
