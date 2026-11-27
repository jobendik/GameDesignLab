---
id: games/brink-edge-rush
title: BRINK · Edge Rush
was: BRINK · Edge Rush (same slug; orbital two-button version)
status: transformed
baseline: 5
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A neon "graze the edge" survival game: rings with gaps collapsed onto a reactor core while a craft, steered left/right
around a fixed orbit, had to be inside a gap when each ring arrived. How close the craft was to the gap edge gave a
graze tier (SAFE…INSANE) feeding a multiplier, a combo and a Surge meter; a full Surge was spent with a second button on
a slow-motion, wall-burning Overdrive. A daily seed with an "anomaly" pattern bias, ranks, a combo shield and a
procedural reactive soundtrack sat around it.

## Baseline assessment
Played in headless Chromium at 390×844 (screenshots `*-base-*.png` in the scratch dir). It ran, looked like a tidy
neon prototype and the graze tiers were a genuinely good idea. But: it was **not** a one-button game (two steer zones +
an Overdrive button/Space, three verbs); a forced, unrecorded tutorial run sat in front of the first real run; no pause
button, no auto-pause on blur, no `gdl:best` key, no test hook or seed; type was a Windows-only system face; the HUD and
menus were drawn into the canvas with tiny text; and — the big one — its sibling `brink-reactor` was the *same* game
(same ring, same core, same palette, same audio engine, same code) with lanes bolted on. Guarded CrazyGames SDK calls and
a block of SDK deployment notes were embedded. Honest baseline: 5 — a competent prototype with no reason to exist next
to its twin.

## Weaknesses identified
1. Two near-identical games; Edge Rush was the thinner one.
2. Three inputs on a concept sold as pure reflex; on a phone the Overdrive button competed with the steer thumbs.
3. Portrait wasted most of the screen: the ring is as wide as the short side, the look-ahead tiny.
4. Tutorial-first onboarding; "CORE COLLAPSE" told you nothing about why you died.
5. Lifecycle gaps (pause, blur, best key, hooks), platform-SDK residue, no vendored fonts.

## Creative opportunities
The whole design is topologically "a wall with a gap arrives; be in the gap; closer to the lip is better". Unrolled
into a line and given a single analogue verb (hold = climb, release = dive) it becomes a *skimming* game: the dart is
always moving, so the question at every gate is how late you dare to arrive at the lip. That keeps every Edge Rush system
(tiers, chain, shield, Surge, anomalies, ranks) and leaves the orbital, core-centred structure to **Reactor**.
**The difference, stated plainly: Edge Rush is the hold game — a linear, seeded gate course you thread with a
continuous analogue line and score per gate by how thinly you shave it. Reactor is the tap game — a closed, persistent
orbital arena you clean up with discrete late hops.** Cool cyan/magenta horizontal speed vs. warm amber circular pressure.

## Planned improvements
One button; distance-seeded fair course generator with more pattern families; automatic Rush instead of a second
verb; in-run coaching instead of a tutorial; readable death; a meta layer (feats) beyond the best score; DOM menus;
full lifecycle + conventions; own look and type; a deterministic test.

## Implemented improvements
- **Rewritten as a one-button skimmer** (single file, ~330 dense lines, no dependencies). Hold (any pointer, Space, Up,
  W, Enter) climbs, release dives; 28 Hz velocity smoothing gives a rounded zig-zag with no perceptible latency (input is
  applied on the next 120 Hz step). Rails are safe to slide on (sparks + tick sound) so only gates kill.
- **Course generator by distance, not time**: 11 pattern families (intro, single, stair, zigzag, tunnel, narrow, burst,
  twin-gap with a narrow gold ×2 "jackpot" gap, swaying gap that settles before arrival, shutter that opens on approach,
  breather). Every gap is placed within `climb × time-to-gate × 0.8` of the previous one, so a course is always
  passable; the Rush changes speed but never the layout, so the Daily course is identical for everyone. Climb speed,
  scroll speed, gap size and cadence all ramp with distance. Eight daily anomalies bias one family.
- **Graze scoring kept and sharpened**: five tiers from the clearance to the lip; a visible graze zone glows inside each
  gap; chain breaks only after two lazy passes in a row; multiplier holds while you keep grazing; chain 12 arms a one-hit
  Edge Shield; arriving from behind a wall at the last moment pays a CLUTCH bonus.
- **Rush**: a full Surge auto-ignites 3.6 s of ×1.35 speed, ×2 score and wall-burning; grazing during it still pays
  double, so the skilful line is still the gap. Ends with a short grace window.
- **Feel**: hit-stop and slow-motion on PERFECT/INSANE and CLUTCH, squash on the dart, pitch that climbs a pentatonic
  scale with the chain plus a noise "shave" layer on high tiers, per-tier sparks thrown backwards with the scroll, an
  engine drone that rises while you hold, danger tint when you are lined up with a wall, shards on burn/shield.
  `prefers-reduced-motion` removes shake/hit-stop and softens flashes.
- **Failure is readable**: the card says "Clipped the edge by a hair" or "Missed the gap" and the gate number; retry is
  a tap anywhere / Space 0.35 s after the card appears.
- **Meta**: 8 ranks from the best score (trail colour), 8 persistent feats shown on the menu and announced on the run
  card, daily best + streak, daily/endless switch on the run card.
- **Onboarding**: no tutorial run; an attract demo flies the course behind the menu; three one-line prompts appear only
  until the player has held, released and grazed (first three runs).
- **Conventions**: `../vendor/fonts/fonts.css` (Saira Condensed + JetBrains Mono), no SDK code or notes left, DOM
  menu/pause/run cards (44 px+ targets, short-landscape layout), pause button + Esc/P + auto-pause on blur/hidden,
  mute button + M, `gdl:best:games/brink-edge-rush`, `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`,
  `window.__gdl` (`state`, `manual`, `advance`, `input`), non-uniform world scaling so look-ahead (~1.1–1.3 gate
  spacings) is the same in portrait, landscape and desktop.

## Test results
- **Automated-technical**: `node tools/smoke.js brink-edge-rush` → pass (61 fps headless).
- **Automated-gameplay**: `node tools/run-tests.js brink-edge-rush` → pass, three consecutive runs (≈9 s each). The test
  taps ENDLESS, checks touch-hold/release and Space on the real input path, pilots real gates with the keyboard until
  grazes pay out, charges a Rush and burns a wall with it, pauses/resumes/mutes, dies on a wall, checks the card and
  the stored best, restarts by tapping and verifies the same seed deals the same course, then starts a Daily run.
- **Visual inspection**: menu, play and run-over screenshots at 390×844, 844×390 and 1280×800 were opened and judged.
- **Balance bots** (scratch, not in the repo): a frame-perfect pilot survives 200 s+ on every seed tried (course is
  fair); pilots with 50/67/100/133 ms decision quanta and aim noise last roughly 190 s / 110 s / 75 s / 35 s and score
  ~250k / 30k / 10k / 2k — a smooth skill gradient across the rank ladder.
- **Subjective playtest**: informed judgement from code, bots and scripted screenshots only — no human hands.

## Remaining issues
- Never felt by a human: climb speed, smoothing and tier widths are tuned from bots; the INSANE window (≈3 px on a
  phone) may be closer to luck than skill.
- The Rush is automatic, so there is no "when do I spend it" decision; that was the price of one button.
- Portrait uses a band of ~56 % of the height; the rest carries HUD only.
- Audio was not listened to (procedural, derived from the original's engine); mix levels are unverified by ear.
- Canvas HUD does not offset for landscape notches (DOM buttons and cards do).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Immediate hold/release loop; every gate is a small dare; runs of 20–120 s with instant retry |
| Mechanical depth | 7 | Tiered grazes, chain/shield, jackpot gaps, clutch bonus, Rush routing; still one verb and one obstacle type |
| Game feel | 8 | 120 Hz input, hit-stop/slow-mo/pitch/sparks scale with tier; untested by hand |
| Visual identity | 7 | Cool neon gate course with glowing lips, gold gaps and a zig-zag ribbon; clean rather than lavish |
| Animation quality | 7 | Eased cards, squash, shards, swaying/shutter gates, streak parallax |
| Audio quality | 7 | Reactive sequencer + informative graze pitch + engine drone; not ear-checked |
| Controls | 9 | One button on touch, mouse and keyboard; safe rails; forgiving hit radius vs. visual radius |
| Onboarding | 8 | Attract demo, two-line how-to, prompts that vanish once done |
| Replayability | 8 | Daily anomaly + streak, endless seeds, ranks, 8 feats, escalating families |
| Performance | 9 | Rect-based drawing, cached glows, capped particles/pops; 61 fps headless software |
| Technical robustness | 9 | Fixed-step sim, pause/blur/resize safe, clean restart and seed determinism verified by test |
| Overall polish | 8 | Menu → play → card → retry is seamless; no placeholder or SDK residue |
## Next recommended action
A human feel pass on climb speed and the PERFECT/INSANE windows; then consider one extra obstacle type (a drifting mine
between gates) to give the line something to think about besides the next gap.
