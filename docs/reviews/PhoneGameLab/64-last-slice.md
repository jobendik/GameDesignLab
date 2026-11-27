---
id: PhoneGameLab/64-last-slice
title: Last Slice
was: 64-tower-defense (Tower Defense)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Tower defence: enemies follow a fixed path; tap to place auto-firing towers; lose when too many get through.

## Baseline assessment
50-line prototype: one tower type placed anywhere by a single tap (constant misfires), one enemy type, endless identical
waves, gold/lives/wave crammed into the score text, placeholder health bars, circles on dark green. Overall 2/10.

## Weaknesses identified
No decisions (one tower, one enemy); placement by raw tap with no preview or confirmation; no upgrades, no selling, no
wave rhythm, no speed control, no win; nothing readable on a phone; no identity.

## Creative opportunities
A picnic blanket is a natural grid; condiments make instantly readable towers with distinct silhouettes; the pie as an
eight-slice life bar; a call-early economy to reward confidence.

## Planned improvements
Four role-distinct towers with three tiers; five bug types + boss; generated trail; build/wave rhythm with early-call
bonus and next-wave preview; two-tap touch placement with range preview; 2× speed; win ladder; cozy picnic identity.

## Implemented improvements
- **Towers**: Shaker (fast, cheap, hits air, halved or worse by armour) · Pepper (lobbed splash, ground only) · Honey
  (slow aura 35–55 %, tier 3 burns) · Popper (long-range sniper, ignores armour, hits air, targets the toughest).
  Each has three tiers (stars), 70 % sell refund, recoil/pop animation.
- **Bugs**: ants, sprinting fire ants, armoured beetles (blue bar), wasps that fly a straight line over the blanket,
  grubs that split into three mites, and a stag-beetle boss (waves 6 and 12, eats three slices).
- **Rhythm/economy**: twelve waves; build any time; when a wave has marched in a 16 s countdown starts and the button
  offers "CALL WAVE n +sugar" (2 sugar and score per second skipped). Kill bounties, wave-clear bonus, mini-bug preview
  of the next wave on the button so the build phase is an informed choice. 2× speed toggle.
- **Maps**: a fresh serpentine crumb trail is generated every run (portrait 8×12, landscape 13×7), baked into a gingham
  blanket sprite; all simulation is in cell units so rotation/resizing mid-run is safe.
- **Touch UI that cannot misfire**: tap a square (highlight + range ring) then a card, or arm a card and tap squares;
  trail squares refuse; tap a tower for upgrade/sell with stat deltas; hover preview and 1–4 / U / X / N / F keys on desktop.
- **Arc**: win → "Next picnic" (+18 % bug health, score multiplier); lose → one picnic easier. Slices left pay a bonus.
- **Identity/feel**: red gingham on grass, hand-drawn condiments and bugs, pie that loses slices, sneeze clouds, cork
  tracers, march music whose intensity follows the swarm, pitch by bug size on squash.

## Test results
- Smoke (`tools/smoke.js 64-last-slice`): pass.
- Gameplay test (`tests/PhoneGameLab/64-last-slice.test.js`): pass — both placement flows by real touch taps, trail
  refusal, wave start, kills → sugar/score, early-call bonus arithmetic, upgrade, sell, speed, undefended loss, clean
  restart, full win over 12 waves and level unlock.
- Strategy simulations (no towers / shaker spam / greedy mix, picnic 1–2) used to balance armour, costs and wave mix:
  undefended loses on wave 2, greedy play wins picnic 1 with 1–4 slices, picnic 2 needs better than greedy.
- Screenshots inspected at 390×844, 844×390 and 1280×800.
- Subjective assessment from scripted play only (no human playtest).

## Remaining issues
- Shaker spam with upgrades can still scrape through picnic 1; balance comes from bots, not people.
- No targeting-mode choice per tower; honey and pepper have no answer to wasps by design, which the UI states only as
  "fast · air" / "pierce · air" notes (landscape cards) — portrait cards omit the note for space.
- A full run is 4–6 minutes at 1× (2–3 at 2× with early calls): longer than the collection's usual session.
- Landscape phone (844×390) squares are 46 px: usable but snug.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Proper build/wave loop with tension from early calls and the boss |
| Mechanical depth | 8 | Four roles, armour/air/split counters, tiers, selling, greed vs safety |
| Game feel | 7 | Recoil, clouds, tracers, pie bump and shake; individual hits are small |
| Visual identity | 9 | Gingham blanket, condiments and pie read instantly and look like nothing else here |
| Animation quality | 7 | Leg wiggle, wing flap, grub crawl, tower pops; no death animations beyond bursts |
| Audio quality | 7 | Rate-limited shots, pitch by size, march intensity; few unique timbres |
| Controls | 9 | Two-tap placement with preview, both orders supported, keyboard shortcuts |
| Onboarding | 8 | On-board prompts for the first build, wave preview, clear costs |
| Replayability | 8 | New trail every run, picnic ladder, score chase |
| Performance | 9 | Baked board, ≤ 60 bugs, trivial per-frame cost |
| Technical robustness | 8 | Cell-unit sim survives rotation; clean restart; level stored via Lab.store |
| Overall polish | 8 | Cohesive, complete loop with attract scene |

## Next recommended action
Human balance pass on picnic 1–3; add per-tower targeting toggle and a portrait-size role note on the cards.
