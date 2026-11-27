---
id: games/mystic-potion-sort
title: Mystic Potion Sort
was: same
status: transformed
baseline: 5
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
An alchemy-themed liquid sort: tap a vial, tap another, the top run of one colour pours onto the same colour or into an
empty vial; a level is done when every vial is pure. Canvas board inside glassy DOM chrome.

**How it now differs from its former twin.** `unicorn-magic-sort` used to be the same puzzle in pastel. This game stays
the *pour-sorting* game and is built to be the definitive one in the lab (liquids, runs, capacity, patience and par).
Unicorn Magic Sort has been rebuilt as a different puzzle — single charms that *merge* up a ladder with chain reactions,
a wish to grant and an endless mode — so the two no longer share a rule set, a goal or a rhythm.

## Baseline assessment
Looked finished at a glance (glass panels, gradient vials, sigils on each layer) but the game underneath was thin:
- **Pour was a teleport**: layers swapped instantly with a puff of dots along a line; no vial moved.
- **Levels came from random reverse-pours** from the solved state: usually solvable but chunky and samey, "par" was an
  arithmetic guess (`colours × 5 + …`) so ★★★ was either automatic or unreachable; no real curve, nothing new after
  level ~10 except more colours, and every level was freely skippable with Next.
- Hint was a greedy heuristic that happily suggested dead ends; undo unlimited; no economy, no daily, no map.
- Six big buttons + four stat chips ate ~45 % of a 390×844 screen; landscape phones cut the board to a strip.
- No pause, no keyboard play beyond U/H/R/N, `localStorage` unguarded, no `gdl:best`, no test hook, system font only.
Overall 5/10: solid shell, forgettable puzzle, none of the genre's tactile pleasure.

## Weaknesses identified
1. The fantasy of the genre (tipping liquid from glass to glass) was missing. 2. No guarantee or measure of difficulty.
3. No rule beyond the genre default, so nothing to learn after ten minutes — and the phone collection's Decant already
does plain pour-sort with sizes/murk. 4. No reason to play well (fake par) or to come back. 5. Layout wasteful on phones.

## Creative opportunities
Lean into alchemy: vials that are physically tipped, corks that drop in, **rune seals** that only break when a named
potion is finished (ordering puzzles the genre rarely has), **veiled layers**, **stubby phials** as cramped buffers, a
stardust economy that makes undo/hint/extra-vial real decisions, and a date-seeded Daily Brew with a streak.

## Planned improvements
Real pour animation with level liquid; solver-verified generator with honest par and a 60-shelf curve in six chapters;
three rule twists introduced one chapter at a time; undo/hint/vial economy; stars, map, daily; compact responsive HUD;
full keyboard + drag; layered procedural audio and reactive music; persistence, pause, test hook, test, review.

## Implemented improvements
- **Pour you can watch**: the chosen vial lifts, swings so its lip sits over the target and tips exactly as far as its
  remaining volume requires (closed-form tilt from fill level); inside the tilted glass the liquid stays level (bands
  computed from the rotated-rectangle area), a stream falls to the rising surface with splashes, then the vial swings
  home. Pours on other vials can overlap; touching a busy vial snaps its animation so input is never blocked. It tips
  from whichever side keeps it on screen.
- **Rules**: classic run-pour (capacity 4) plus *veiled layers* (unknown until uncovered; undo keeps what you learned),
  *rune-sealed vials* (nothing in or out until a vial of the seal's potion is corked — the sigil on the wax tells you
  which), *stubby phials* (hold 2–3, can never be corked, so they are pure buffer space). Corked vials are locked.
- **Guaranteed-solvable levels**: every deal is a random fill accepted only if a weighted-A* solver (string states,
  canonical keys, bucket queue) sorts it under the same rules, veils and seals included. Par is the shortest of four
  searches (weights 2, 1.5, 1.25, 1). Three candidate deals per shelf; the one nearest the shelf's target par is kept.
  Measured for shelves 1–70: par 4 → 8 → 11…19 (ch. 1), 15–24 (veils), 18–28 (seals), 22–30 (phials), 24–35, 29–35;
  generation ≤ 220 ms worst case, typically < 20 ms; no shelf needed the relaxed fallback. Shelves 6 and every 10th are
  tight "one spare vial" bosses. After shelf 60 the Endless Cellar keeps generating.
- **Economy**: stardust ✦ — +2 per new star, +10 (+2 per streak day, max +10) for the Daily Brew. 5 free undos per
  attempt then 1 ✦ each; solver hints (3 free ever, then 3 ✦) drawn as a dotted arrow; one extra vial per attempt for
  12 ✦ which caps the rating at ★★. Restart is always free. Live rating in the HUD drops as you pass par / par + 30 %.
- **Structure**: splash (Play/Continue, Daily Brew, Shelf Map, two-line how-to) → play → win card (animated stars, pours
  vs par vs best, stardust earned) → next; map of all shelves with stars, locked beyond the frontier; pause card.
  Shelf 1 is a guided tutorial (sticky arrow from the solver); each twist explains itself once in the status pill.
- **Controls**: tap-tap, drag from vial to vial, whole column is the hit target, valid targets get a gold marker while a
  vial is held; keyboard: arrows + Space/Enter cursor, 1–0 direct pick, Z/U undo, H hint, V vial, R restart, P/Esc
  pause, M mute, Enter for next. Focus returns to the canvas after button presses (works inside the arcade iframe).
- **Audio**: glass clink on pick-up, glugs whose pitch climbs with the receiving vial's fill over a filtered trickle,
  cork pop plus a chime that rises with each vial finished, shimmer when a seal shatters, reveal swell, star dings, win
  arpeggio; a slow generative dorian arpeggio over a drone that adds voices as more vials are corked. Separate sound /
  music toggles, `M`, `?mute=1`; context is created on the first gesture and suspended on pause/hidden.
- **Look**: Cinzel + Space Grotesk (vendored), shelves, drifting motes, cached liquid gradients, path-drawn sigils (12
  shapes, no font dependence) so colour is never the only cue; compact HUD — the board now gets ~70 % of a phone screen;
  side rails in landscape; up to three shelf rows chosen to maximise vial size.
- **Robustness**: storage wrapped in try/catch; `gdl:best:games/mystic-potion-sort` = highest shelf cleared; dt-clamped
  update separate from draw; rAF stops while paused/hidden; ResizeObserver relayout; `prefers-reduced-motion` shortens
  pours and thins particles; particles pooled (≤ 240); `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, `window.__gdl`.

## Test results
- **Smoke** (`node tools/smoke.js mystic-potion-sort`): pass, 61 fps.
- **Gameplay** (`tests/games/mystic-potion-sort.test.js`, 27 s): pass — menu → PLAY, selection rules, refused pour,
  tutorial-arrow pour with animation settling, undo, shelf 1 sorted by real taps → win card/stars/stardust/best key,
  clean next shelf, hint charge, extra vial cost + rating cap, drag-pour, keyboard cursor/number keys, Esc/P pause,
  restart, paid sixth undo, veiled shelf (every uncovered layer revealed), sealed shelf (refuses, then opens), stubby
  phials left empty, reload keeps progress, Daily Brew identical for the same seed / different for another, pays once.
- **Screenshots inspected** at 390×844, 844×390, 1280×800: splash, tutorial, mid-pour (shelf 34), 13-vial shelf 56
  with a selection, shelf 48 near the end with corks + hint arrow, win card. Two fixes came from looking (pouring vial
  clipped at the screen edge; vials too small on desktop).
- **Subjective**: judged from scripted play, screenshots and code reading — not a human playtest; audio was not heard.

## Remaining issues
- Par is "best found by four searches", not proven optimal on the big shelves; a sharp player may beat it by a pour.
- Veiled shelves are verified with full information; a blind guess can still strand you (undo/restart/hint recover).
- Audio balance and the music loop are unheard by a human; the music is deliberately quiet for that reason.
- The tilted vial overlaps its neighbours during a pour (reads fine, but busy on 13-vial shelves).
- No colour-blind palette switch (sigils carry the information instead); the chain "X" on sealed vials is a little noisy.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | The pour is satisfying in itself; par-chasing and three twists keep shelves from blurring together |
| Mechanical depth | 8 | Seals add ordering, veils add risk, phials squeeze space; economy turns undo/hint/vial into choices |
| Game feel | 8 | Lift → tip → stream → cork with pitch-tracking glugs; input never locked; snap-on-touch buffering |
| Visual identity | 8 | Night-violet alchemy shelf, sigil-stamped potions, wax seals, corks; clearly its own game now |
| Animation quality | 8 | Level liquid in a tilting vial, eased swing, cork drop with settle, star pops; veil reveal is only a puff |
| Audio quality | 7 | Informative and layered by design, reactive music; not verified by ear |
| Controls | 9 | Tap, drag, full keyboard, column-wide targets, target markers, re-select on mismatch |
| Onboarding | 8 | Guided first shelf, two-line how-to, one-time tips per twist |
| Replayability | 8 | 60 shelves + endless, stars per shelf, daily with streak, stardust to earn back |
| Performance | 9 | 61 fps in smoke; cached gradients, pooled particles, ≤ 220 ms generation |
| Technical robustness | 8 | Pause/hidden/resize/reload covered by test + smoke; storage guarded; deterministic seeds |
| Overall polish | 8 | Splash → play → win → next is seamless; map, pause, toggles all present |

## Next recommended action
Human listening pass on the mix; consider an optimal-par proof for small shelves (label "perfect" when matched) and a
weekly "sealed gauntlet" using the daily generator with three seals.
