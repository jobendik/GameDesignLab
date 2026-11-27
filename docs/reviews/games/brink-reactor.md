---
id: games/brink-reactor
title: BRINK · Reactor
was: BRINK · Reactor (same slug; three-lane, five-input variant of Edge Rush)
status: transformed
baseline: 4
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
"Reactor" was Edge Rush with lanes: the same collapsing gapped rings around the same core, but the craft could also
switch between three orbit radii (outer lanes scored more), high-tier grazes "carved" the wall (widened the gap or
cracked a new one), and Overdrive turned the craft into a blade that cut through walls. Same ranks, tiers, audio
engine, palette and code base as its sibling.

## Baseline assessment
Played in headless Chromium at 390×844 (`brink-reactor-base-*.png` in the scratch dir). It ran, but it was the weaker
of the twins: five inputs (rotate left, rotate right, lane up, lane down, Overdrive) on a phone, with swipe gestures
fighting the hold-to-rotate zones and two extra on-screen arrow buttons; three stacked rings of walls were hard to read;
the carving idea — the one thing that was its own — was nearly invisible because every wall left the screen a second
later. A forced tutorial run, no pause button, no auto-pause, no `gdl:best`, system fonts, guarded CrazyGames calls and
SDK notes. Visually indistinguishable from Edge Rush in a thumbnail. Baseline 4.

## Weaknesses identified
1. No identity of its own: same structure, look and sound as Edge Rush.
2. Control overload; nothing "one-button" about it.
3. Carving had no consequence — walls were gone before the cut mattered.
4. Lane multipliers created a dominant strategy (sit outside) rather than a decision.
5. Same lifecycle/convention gaps as its sibling.

## Creative opportunities
Keep what was uniquely Reactor's — a core, rings you switch between, cutting obstacles apart, the blade — and build the
structure around making the cut *matter*: make the obstacles **persistent**. An orbit is a closed track, so a plate you
do not carve is still there next lap. That gives a loop no linear runner can have: the arena fills with your unsolved
problems, and precision is how you clean it.
**Difference from Edge Rush, stated plainly: Edge Rush is the hold game (continuous analogue line through a seeded
linear course, scored per gate by clearance). Reactor is the tap game (discrete, timing-only hops on a closed two-ring
arena whose plates persist, get carved, get re-seated and reverse direction).** Different verb, different structure,
different palette (warm amber/teal, round, hazard-striped vs. cool cyan/magenta speed lines), different type and music.

## Planned improvements
One tap; two rings; persistent plates with hit points; graze = how late you hop (or how tightly you tuck in behind);
carving removes plates; pressure system so there is no safe ring; polarity flips; blade as a relief valve; feats and
career stats; own art direction and audio; lifecycle, conventions, deterministic test.

## Implemented improvements
- **Rewritten as a one-tap orbital arena** (single file, ~330 dense lines, no dependencies). The spark orbits by itself;
  a tap (any pointer, Space, Enter, arrows, W/S) hops to the other ring. Taps are queued in the event handler and
  applied at the start of the next 120 Hz step, before movement.
- **Graze = lateness, measured in seconds** so it means the same at every orbit speed: hopping within 0.30 s of a
  plate's leading end scores SAFE…INSANE (the last 35 ms *inside* the glow still counts — a built-in coyote window);
  landing within 0.22 s behind a plate's trailing end is a TUCK. A bright "approach lane" in front of every plate shows
  the scoring zone. Hopping much too early is safe but pops "EARLY" and two of those drop the chain.
- **Carving with consequence**: plates have 2–4 hit points (pips); GREAT cracks, PERFECT/INSANE cut deeper; a plate
  at zero shatters and is gone for good. Unsolved plates stay, lap after lap, so the arena becomes a rhythm you learn —
  until you carve one and the rhythm changes.
- **No safe ring**: new plates are placed (with a blinking ghost and a clang when they go live, never within 0.78 s of
  the spark) on the ring the spark will be riding when it gets there, and a pressure timer re-seats a plate the spark
  would simply pass onto its ring (ghost + radial streak). All plates keep an angular gap of at least a 0.26–0.40 s hop
  window from every other plate, so any ring assignment is passable.
- **Polarity flip** every 22–32 s: warned with rotating red arrows and a siren, executed only when nothing is close
  behind the spark; the orbit reverses and every plate is now met from its other end.
- **Blade**: a full charge ring auto-ignites 4.2 s of cutting straight through plates at ×2; charge comes mainly from
  good hops, so careless play rarely sees it. **Fuse**: a 10-chain arms one free hit.
- **Energy cells** appear behind plates (tuck lures) or in the open; they pay and charge a little.
- **Feel**: hit-stop + slow-motion on PERFECT/INSANE, shards along the whole carved arc, hop streak between rings,
  comet tail, plate flash on hit, heat tint and pulsing core as a plate closes in, killer plate turns red on death.
  Hop sound pitch tells you which ring you are on; graze bells climb a scale with the chain and tier; industrial
  half-time pulse that adds layers with charge/heat/progress. `prefers-reduced-motion` honoured.
- **Readable failure**: "Ran into a plate" vs "Hopped into a plate", lap number, red plate; retry by tapping anywhere.
- **Meta**: 8 ranks from best score (spark colour), 8 feats, career plates-cut and laps on the menu, laps counter in
  the core.
- **Onboarding**: attract demo behind the menu; three prompts that disappear once done (hop, hop late, carve); the menu
  itself starts on any tap/Space.
- **Conventions**: vendored fonts (Orbitron + Chakra Petch), all SDK code/notes removed, DOM cards (44 px+ targets,
  short-landscape layout), pause button + Esc/P + auto-pause on blur/hidden, mute button + M,
  `gdl:best:games/brink-reactor`, `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, `window.__gdl`
  (`state`, `manual`, `advance`, `tap`).

## Test results
- **Automated-technical**: `node tools/smoke.js brink-reactor` → pass.
- **Automated-gameplay**: `node tools/run-tests.js brink-reactor` → pass, three consecutive runs (≈17 s each). Real tap on
  START; a real touch tap 0.2 s before the first plate hops and scores CLOSE with the plate intact; a Space hop 50 ms
  before the next one is PERFECT and removes that plate; an early hop earns nothing; a keyboard pilot carves until the
  blade ignites and cuts through a plate; a natural polarity flip reverses the measured direction of travel;
  pause/resume/mute; not hopping ends the run on a plate; card, stored best and feats; tap-anywhere restart with the
  same seeded first plate; menu background tap starts a run.
- **Visual inspection**: menu, play (portrait, landscape, desktop) and run-over screenshots opened and judged.
- **Balance bots** (scratch): hop-timing bots with zero jitter survive 300 s on every seed (the arena is always
  passable); a bot that hops 0.5 s early dies within 20–90 s by hopping into the previous plate; bots with ±0.16–0.2 s
  timing error die between 3 s and 2 min. Live plates settle at 3–4.
- **Subjective playtest**: informed judgement from code, bots and scripted screenshots only — no human hands.

## Remaining issues
- A metronomic player who always hops mid-gap can survive a long time at low score; escalation is speed and rhythm
  changes only. It needs a human to say whether minutes 3+ stay tense or become a trance.
- Timing windows (0.30 s graze band, 35 ms inset) are reasoned, not felt; INSANE may be too generous or too stingy.
- Re-seated plates are the least readable event (ghost + streak + beep); a stronger telegraph may be needed.
- Audio not ear-checked. Canvas HUD does not offset for landscape notches. Portrait leaves the lower third empty.
- No daily mode here (kept as Edge Rush's feature on purpose).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | One tap, immediate; lap rhythm you learn and then deliberately break by carving |
| Mechanical depth | 7 | Late hop vs tuck, plate HP, persistence, re-seating, flips, blade/fuse; single verb, two rings |
| Game feel | 8 | Input applied within one 120 Hz step, hit-stop/slow-mo/shards/pitch scale with tier; untested by hand |
| Visual identity | 8 | Amber hazard plates on teal rings around a glowing core — recognisable and unlike its sibling |
| Animation quality | 7 | Hop streaks, shards, ghost plates, pulsing core, flip arrows; plates themselves are static arcs |
| Audio quality | 7 | Ring-coded hop blips, chain-scaled bells, layered pulse; not ear-checked |
| Controls | 9 | One tap anywhere on touch/mouse/keys; time-based windows and a 35 ms coyote inset |
| Onboarding | 8 | Demo, approach lanes, three vanishing prompts, tap-anywhere menu |
| Replayability | 7 | Emergent arenas, ranks, feats, career stats; one mode, no daily |
| Performance | 9 | A handful of arcs + capped particles; 60 fps headless software |
| Technical robustness | 9 | Fixed-step sim, pause/blur/resize safe, restart and seeding verified by test |
| Overall polish | 8 | Menu → play → card → retry seamless; no placeholder or SDK residue |
## Next recommended action
Human feel pass on the graze window and re-seat telegraph; then add a late-game hazard that punishes pure mid-gap
metronome play (e.g. a slow sweeping rod on one ring) if minutes 3+ prove too calm.
