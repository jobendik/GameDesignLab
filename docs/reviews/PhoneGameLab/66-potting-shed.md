---
id: PhoneGameLab/66-potting-shed
title: Potting Shed
was: 66-merge-idle (Merge Idle)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A 4×4 grid: tap an empty cell to buy a tier-1 item, drag equal tiers together to merge, coins tick up per second.

## Baseline assessment
35-line prototype: numbered hue squares, coins accrue with no goal, no end, no feedback beyond one beep, a `start()`
outside the splash flow, hard-coded pixel layout, no persistence despite being an "idle" game. Overall 2/10.

## Weaknesses identified
No objective (coins buy only more squares); no identity; drag had no lift, hover or snap feedback; nothing to discover;
tap-to-buy and drag shared the same gesture; nothing persisted; no session shape at all.

## Creative opportunities
Make merging serve something (orders), give sources a rhythm (generators with charges), let two chains feed a third
(production step), and make the board a place you come back to (persistent tray, almanac, shed level).

## Planned improvements
Cosy garden-bench identity; three six-tier chains + planters; order tags with rewards; charge-based generators; a day
clock for a 2–3 minute session; bustle multiplier; almanac and shed level persisted through `Lab.store`.

## Implemented improvements
- **Loop**: tap the seed sack / clay tub / beehive (6/5/4 charges, recharging) → drag two alike together → hand the
  result to one of three order tags (drag onto the tag, tap the item, or tap the tag). One run = one 150 s day; score =
  coins earned that day; the card reports orders, best make and almanac progress.
- **Production chain**: a grown plant (Seedling or better) dropped onto a plain Pot becomes a Planter worth 1.6× its
  parts; planter orders appear from shed level 3.
- **Bustle**: finishing orders within 14 s of each other raises a ×1.25…×3 multiplier with a visible decay bar.
- **Persistence**: tray contents, lifetime coins, discovered items (22-entry almanac strip) and day number are saved on
  every change. Lifetime coins raise the shed level (clay tub at 60, beehive at 200, richer sacks, bigger stock).
- **Onboarding without reading**: on a fresh save the clock waits; a pulsing ring marks the sack, then a travelling
  finger-dot shows the merge, then the delivery. The same guide returns as an idle hint after 7 s.
- **Feel**: lifted drag with shadow (offset above the finger on touch), target cell tint (green = will merge), mates
  pulse while you carry their partner, wanted items wear a gold ring, pop-in on spawn/merge, particles + ring + rumble
  scaled by tier, tags slide in/out and shake on a wrong delivery, generator squash, coin bursts.
- **Art**: 22 hand-drawn procedural items (baked sprites) with tier badges (shape + number, never colour only), paper
  tags, wooden tray, shed wall/bench backdrop, sun bar that crosses the sky.
- **Audio**: pentatonic ladder by tier on merges, distinct pop pitch per generator, coin + rising combo on orders,
  unlock/level-up stingers, dusk chime and last-five-seconds ticks; dream music that fills in towards dusk and with bustle.
- Layout: 5×6 portrait tray, transposed 6×5 with side panels on wide stages; keys 1–3 tap the generators.

## Test results
- Smoke (`node tools/smoke.js 66-potting-shed`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/66-potting-shed.test.js`): pass — touch stocking + charge spend, locked generator,
  mouse drag merge, swap, tutorial clock hold, drag delivery + HUD, tap delivery + bustle, plant+pot → planter, compost,
  level unlock, day end → card + best, save contents, restart with clean day but persisted tray/level/almanac.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (play mid-drag, deliveries with bustle, closing card, splash).
- Subjective assessment from reading the code and scripted play only (no human playtest).

## Remaining issues
- No offline progress: generators do not recharge while the game is closed (a true idle layer is absent by design —
  the "day" is the session).
- Shed level tops out at 6 and the almanac at 22; a long-term player runs out of new things after perhaps 10–15 days.
- Keyboard can stock the tray but cannot drag; mouse or touch is required for merging.
- On 844×390 the tray cells are ~55 px — usable, but the almanac strip becomes small.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Stock → merge → deliver is satisfying within seconds; orders give every merge a purpose |
| Mechanical depth | 7 | Charge budgeting across three sources, tray space, planter production, bustle timing; no hazards |
| Game feel | 8 | Lifted drag, merge-preview tint, tier-scaled pops, tag animations, generator squash |
| Visual identity | 8 | Sage shed + wooden tray + paper tags; 22 original drawn items |
| Animation quality | 7 | Damped snapping, pop-ins, fly-to-tag ghosts, sliding tags; items themselves are static sprites |
| Audio quality | 7 | Informative pitch ladder and stingers; relies on engine presets |
| Controls | 8 | Drag, tap-to-deliver and tap-tag shortcuts; generous drop zones; touch lift offset |
| Onboarding | 9 | Fresh save is guided by animated pointers with the clock held; nothing must be read |
| Replayability | 7 | Persistent tray, unlock ladder, almanac and best-day score; finite content |
| Performance | 9 | Sprites baked per size, ≤30 items, one background blit |
| Technical robustness | 8 | Save validated on load, layout transposes on rotate, timers via engine, clean day restart |
| Overall polish | 8 | Complete splash → day → tally → next day loop with live attract scene |

## Next recommended action
Add a fourth late chain (tools or preserves) and rare "market day" orders with two-step planters to extend the unlock
ladder past level 6; consider letting generators bank a few charges while away.
