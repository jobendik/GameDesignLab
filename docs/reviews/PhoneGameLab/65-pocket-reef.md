---
id: PhoneGameLab/65-pocket-reef
title: Pocket Reef
was: 65-idle-clicker (Idle Clicker)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Idle clicker: tap a big object for currency, buy generators that earn per second, watch numbers rise.

## Baseline assessment
45-line prototype: a brown circle labelled as a cookie (a specific commercial game's motif), four fixed-width upgrade
columns that overflowed on a phone, no saving, no offline progress, no prestige, no feedback beyond a beep, numbers
printed raw. Overall 2/10.

## Weaknesses identified
Nothing to look at; production invisible; text overflow at 390 px; progress lost on reload; no long-term loop; no
number formatting; tap had no juice; identity borrowed.

## Creative opportunities
Make the generators *be* the scene: a reef that fills with the creatures you own, each visibly sending pearls to the
counter, so the screen itself is the progress bar.

## Planned improvements
Original reef identity; clam tap object; seven-creature ladder with milestones and synergies; visible production;
tidy canvas shop with tabs, scrolling and buy ×1/×10/max; golden bubbles; offline progress; prestige; persistence.

## Implemented improvements
- **Tap object**: a clam that snaps open, squashes, spits a pearl that arcs to the counter; pitch climbs with tap
  streak, combo chimes, popup value; tap = 2^polish × starfish + 3 % of production, so tapping never becomes pointless.
- **Ladder**: Shrimp → Clownfish → Seahorse → Turtle → Octopus → Manta → Whale (cost ×1.15 per purchase). ×2 milestones
  at 10/25/50/100/…; six synergies ("each Shrimp: Clownfish +1 %"), leveled Pearl polish and Kelp forest (+25 % all).
- **Visible production**: owned creatures (capped per kind) live in the tank with their own motion — shrimp hop,
  clownfish circle anemones, seahorses hang in swaying kelp, turtles and mantas cruise, octopuses bob, a whale drifts
  behind — and each puffs pearls up to the counter. Starfish from prestige sit on the sand.
- **Golden bubble** every 40–70 s: lump sum (45 s of production) or ×5 frenzy for 15 s.
- **Respect for time**: saves every 5 s / on purchase / on pagehide through `Lab.store`; time away (closed, paused or
  backgrounded) pays 50 % for up to 2 hours with a "while you were away" toast.
- **Prestige**: TURN THE TIDE (two-tap confirm) trades the reef for starfish = ⌊√(tide pearls / 100K)⌋, +10 % each
  forever; shown through the engine's win card with lifetime pearls as the score. First starfish ≈ 3–4 minutes.
- **UI**: sand-coloured canvas panel with three tabs, scrollable rows (drag or wheel), affordability progress on every
  buy button, buy ×1/×10/MAX toggle, locked "???" teasers; portrait puts the panel below, landscape beside the tank.
  Number formatting through `Lab.fmt` up to 10K and K/M/B/T/Qa… suffixes beyond.
- Dream music whose intensity follows log(production); bubble/pickup/level-up sounds with pitch by tier.

## Test results
- Smoke (`tools/smoke.js 65-pocket-reef`): pass.
- Gameplay test (`tests/PhoneGameLab/65-pocket-reef.test.js`): pass — real taps on the clam and panel buttons, first
  purchase and idle income, price growth, ×10 + milestone, polish, synergy maths, idle minute, offline hour at 50 %,
  2-hour cap, prestige confirm → win card → starfish bonus, persistence across reload, two-tap erase.
- Progression simulated (4 taps/s, greedy buying): 1K at 53 s, 100K (first starfish) at ~3.5 min, 7 starfish at 10 min.
- Screenshots inspected at 390×844, 844×390 and 1280×800.
- Subjective assessment from scripted play only (no human playtest).

## Remaining issues
- The pause-menu "Restart" reloads the save instead of wiping it (deliberate for an idle game; erasing lives in the
  Tide tab), which bends the collection's "restart resets everything" rule.
- No content beyond the whale; late tides only get faster. No achievements or per-creature upgrades.
- Landscape phone tank is crowded once every kind is owned; creatures do not interact with each other.
- Offline pay uses the device clock (trivially cheatable; acceptable for a single-player toy).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | First shrimp in 10 s, a new creature every minute, a tank that visibly fills |
| Mechanical depth | 7 | Milestones, synergies, tap vs idle balance, prestige timing; shallow beyond tide 3 |
| Game feel | 8 | Clam snap, flying pearls, pitch streaks, counter bump, banners for newcomers |
| Visual identity | 8 | Bright hand-drawn reef; the scene is the progress display |
| Animation quality | 8 | Seven creatures with distinct motion, swaying kelp, light rays, clam |
| Audio quality | 7 | Informative tap ladder and tiered purchase pitch; no ambience loop |
| Controls | 8 | Whole tank is the tap target; scroll/tap separation; keys 1–7 and Space |
| Onboarding | 8 | "tap the clam" prompt, progress fill on the next purchase, locked teasers |
| Replayability | 7 | Prestige loop with permanent growth; limited novelty after the whale |
| Performance | 9 | ≤ 34 vector creatures, baked reef, bounded pearls |
| Technical robustness | 8 | Save validation, timestamps, pagehide save, resize-safe normalised tank |
| Overall polish | 8 | Tidy at 390 px, complete splash → tide → new tide loop |

## Next recommended action
Add a second prestige layer or per-creature upgrades for tides 3+, and an underwater ambience loop.
