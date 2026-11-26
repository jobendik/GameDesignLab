---
id: PhoneGameLab/20-frostfoot
title: Frostfoot
was: 20-endless-runner (Endless Runner)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Side-scrolling auto-runner: tap to jump over ground obstacles, swipe down to slide under high ones, speed creeps up.

## Baseline assessment
44-line prototype: a blue rectangle on a flat strip, red rectangles spawned on a random timer (unfair overlaps were
possible), fixed-height jump triggered on release (`onTap`), no buffering, pixel-exact hitboxes, instant silent
"Crash". No world, no character, no best distance. Overall 2/10.

## Weaknesses identified
Jump fired on finger-up and could not be shaped; random spawns ignored reaction time; nothing to do but survive;
no character or scenery to give the speed any meaning; hard-coded layout; death without feedback.

## Creative opportunities
A runner lives on its character and its jump. Give it a creature with real secondary motion, a jump with the full
forgiveness kit, patterns that are authored rather than rolled, and one resource that turns risk into a power moment.

## Planned improvements
Variable jump, flip jump, slide/dive, coyote + buffer; chunked patterns in time units; ember → Blaze loop; parallax
world with zones and milestone flags; procedural animated runner; sub-stepped physics; autopilot-verified patterns.

## Implemented improvements
- **The jump**: fires on touch-down; hold for height (hop 87 u → leap 156 u), second press in the air is a flip jump,
  90 ms coyote time off crevasse edges, 130 ms buffer before landing, a flip can even rescue a fall. Swipe down slides
  (hold to stay low) or, in the air, dives into a slide; a swipe cancels the hop its own press started.
  Keyboard: Space/↑/W and ↓/S. Physics is sub-stepped at ≤1/120 s so hop heights are identical at any frame rate.
- **Fairness**: inset hitboxes, crevasse lips with toe-hold, obstacle spacing authored in seconds so reaction windows
  hold as speed ramps (330 → up to 640 u/s over 95 s, capped by how far ahead the screen shows — portrait tops out
  slower than landscape so look-ahead never drops below ~0.8 s).
- **Authored chunks** in four tiers (21 patterns): spikes, tall blocks, wide ridges, gates (slide or leap), wall gates
  (slide only), crevasses, and combinations (hop–slide–hop, double crevasse, block-into-wall dive, triple hops).
  The opening is scripted: one spike labelled TAP, one gate labelled SWIPE DOWN; the first block says HOLD.
- **Embers and Blaze**: embers trace the riskier lines (arcs over gaps, low rows under gates, a ladder that needs the
  flip). Eighteen fill the scarf and ignite Blaze — 5 s faster, invincible, smashing obstacles for +50 and bridging
  crevasses — followed by a 0.9 s grace. Score = metres + embers (10, 20 in Blaze) + smashes.
- **Frostfoot**: an original procedural snow sprite — squash/stretch body, spring-lagged ears, cycling feet, blink,
  wide eyes when falling, a seven-segment scarf rope that streams behind and turns to flame in Blaze, flip rotation,
  slide pose with snow spray, landing puffs, tumble with X-eyes on a crash.
- **World**: three baked parallax layers (peaks, hills with pines, near pines), drifting snow, speed streaks, four
  zones that cross-fade (Dawn, Morning, Dusk, Aurora with animated ribbons), flags every 250 m and one at your best
  distance. Chiptune music that thickens with time and Blaze; pitch-laddered ember pickups; glass-shatter smashes.

## Test results
- Smoke (`tools/smoke.js 20-frostfoot`): pass, 61 fps headless, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/20-frostfoot.test.js`): pass (26 s) — touch tap jumps; short vs held key press
  give measurably different apexes; flip jump higher still; slide, air-dive → slide; pointer swipe-down cancels the hop
  and slides; buffered jump on landing; coyote jump off a crevasse edge; embers collect and score; Blaze smashes a
  block; an autopilot using only jump/hold/slide survives 12 s of tier-2 chunks; unattended runner crashes → game
  over with best saved; clean restart.
- Scratch autopilot runs: 75 s in landscape (1035 m, tier 3, 628 u/s) and 70 s in portrait (789 m) without a crash,
  so every authored pattern is passable at speed.
- Screenshots inspected at 390×844, 844×390, 1280×800 (dawn, morning cross-fade with crevasse, dusk wall gate, Blaze,
  splash, game over).
- Feel judged from code and scripted play only — no human playtest. Real touch swipes were exercised through
  mouse-type pointer drags, not a touchscreen.

## Remaining issues
- A swipe-down from the ground still shows a few frames of hop before the dive (the press must jump instantly).
- Portrait shows ~0.8 s ahead at top speed; playable for the bot, likely demanding for people late in a run.
- Terrain is flat (crevasses only) — no slopes or platforms; one-hit death with no shield other than Blaze.
- During a zone cross-fade both suns are briefly visible.
- The lower third of the portrait screen is plain snow (thumb area).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Tight hop/slide rhythm, ember lines pull you into risk, Blaze is a real payoff |
| Mechanical depth | 8 | Three verbs + variable height, authored combos, resource-driven power state |
| Game feel | 8 | Instant jump, squash/stretch, puffs, spray, hit-stop crash, smash shards |
| Visual identity | 9 | Pastel arctic palette, red scarf silhouette, four moods |
| Animation quality | 9 | Ears, scarf rope, feet cycle, flip, slide pose, tumble — all procedural |
| Audio quality | 7 | Pitch-laddered embers, footsteps, reactive chiptune; obstacle approach is silent |
| Controls | 8 | Coyote, buffer, variable height, dive; swipe/hop compromise noted above |
| Onboarding | 8 | Scripted first spike and gate with in-world labels, HOLD on first block |
| Replayability | 8 | Random chunk order, speed ramp, zones, best-distance flag to chase |
| Performance | 9 | Baked layers and obstacle sprites, bounded lists, 61 fps headless at phone size |
| Technical robustness | 8 | Sub-stepped physics, resize re-layout, clean restart, game-clock timers |
| Overall polish | 8 | Splash runs the live scene; themed death messages and stats |

## Next recommended action
Human playtest of swipe feel and late-run speed in portrait; add gentle slopes or floating platforms and an approach
whoosh for wall gates.
