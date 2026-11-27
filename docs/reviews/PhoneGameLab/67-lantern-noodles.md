---
id: PhoneGameLab/67-lantern-noodles
title: Lantern Noodles
was: 67-cooking-serve (Cook & Serve)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Three pans and three customers: tap a pan to cook a random colour, drag the cooked disc to the customer who wants that
colour before their patience bar empties; three mistakes end the game.

## Baseline assessment
45-line prototype: coloured circles for food and people, the pan picked its own random colour (so the player could not
actually fulfil an order on purpose), dragging had no visual, burnt pans could never be cleared, one beep. Overall 2/10.

## Weaknesses identified
No agency over what gets cooked; no readable orders; no assembly; no progression or day structure; no feedback;
colour-only information; fixed pixel layout; `start()` outside the splash flow.

## Creative opportunities
Readable multi-part orders that the player assembles; a combo for clean, fast service; new recipe parts per day; and one
idea of its own — regulars who order "the usual", turning a reflex game into a small memory gamble.

## Planned improvements
Night-market noodle cart for little spirits; nine ingredient trays unlocking over six days; live order ticking; patience
bars; combo and speed tips; regular's hidden "usual" (×2 if remembered, peek costs patience); day receipt; three lanterns
as lives.

## Implemented improvements
- **Assembly chain**: order bubble shows broth + base on the top row and up to three toppings below. Tap trays in any
  order; duplicates and second broths/bases are refused with a wiggle. Bubbles tick off parts as the bowl fills and fade
  when the bowl no longer fits them; a matching bubble turns green and the bowl glows with "SERVE!".
- **Serving**: tap the bowl (goes to the least patient match) or the customer; keys 1–9 / Space / Backspace mirror it.
  Nobody is punished for a mistaken tap — only for binning a bowl (combo reset) or a walk-out (lantern lost).
- **Scoring**: price by size + tip by remaining patience, ×(1 + 10 % per combo step, max ×2), ×2 for a remembered usual.
- **Regulars**: from day 2 a straw-hatted regular visits twice; the second bubble says "the usual!". Serve from memory
  for double pay, or tap the bubble to reveal it for −30 % patience.
- **Days**: 7 → 21 customers, shrinking patience and arrival gaps; mushroom (day 2), red broth (3), rice (4), chili (5),
  swirl cake (6). A paper receipt closes each day; a day with no walk-out and no binned bowl relights a lantern.
- **Onboarding**: day 1 starts with one plain bowl, patience frozen until the first serve, and a pulsing frame on the
  next tray / the bowl for the first two customers.
- **Art & feel**: baked night sky with bokeh, striped awning behind the HUD, swaying paper lanterns, six spirit
  customers with moods (content → flat → fuming, happy hop on serve), a layered bowl that shows what is in it, squashing
  trays, flying bowl, coin stars; splash/swish/pop per ingredient, coin pitch by tip, rising combo ladder, low-patience
  ticks, funk music whose intensity follows the queue and the most impatient customer.
- Layout: portrait trays in two rows; wide stages put a 3×3 tray panel on the right and scale up to desktop.

## Test results
- Smoke (`node tools/smoke.js 67-lantern`): pass, 61 fps headless, no errors.
- Gameplay test (`tests/PhoneGameLab/67-lantern-noodles.test.js`): pass — tutorial patience hold, locked tray, touch
  assembly with duplicate refusal, bowl-tap serve + HUD, unwanted bowl not served, bin resets combo, customer-tap serve,
  walk-out costs a lantern, receipt → day 2 unlock, usual served from memory pays ≥ double, peek reveals at a patience
  cost, three walk-outs → game over with best, clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (day 2, day 4, day 6 with all trays, receipt, game-over card).
- Subjective assessment from reading the code and scripted play only (no human playtest).

## Remaining issues
- After day 6 the game only gets faster and busier; there are no new mechanics (no cooking timers or special customers).
- The regular's order is the only memory element and appears once per day; it could be richer (several regulars).
- Ingredient icons carry no text labels — the names only appear in the "New:" toast and the receipt.
- Difficulty tuning (patience vs. day) is from scripted play, not human sessions.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Tight read → build → serve loop with constant small wins and visible pressure |
| Mechanical depth | 7 | Triage between three patience bars, combo protection, the usual's memory/peek gamble |
| Game feel | 8 | Squashing trays, live ticks, glowing bowl, flying serve, hop, shake on walk-out |
| Visual identity | 8 | Night market, lantern lives, spirit customers; distinct from the rest of the batch |
| Animation quality | 8 | Spirits rise/sink behind the counter, bubbles pop, lanterns sway, receipt drops in |
| Audio quality | 7 | Per-ingredient sounds and informative pitches; built from engine presets |
| Controls | 8 | Large trays, any-order taps, two ways to serve, full keyboard |
| Onboarding | 8 | Frozen first patience, pulsing next step, bubbles that tick themselves |
| Replayability | 7 | Random orders and regulars, six unlock days, score chase; plateaus after day 6 |
| Performance | 9 | Baked background and icons, ≤3 customers, few particles |
| Technical robustness | 8 | Engine timers only, resize re-layout, clean restart verified |
| Overall polish | 8 | Complete loop with receipt interstitials and live attract scene |

## Next recommended action
Add one late mechanic (e.g. a dumpling steamer with a cook timer from day 7) and a second regular so the memory idea
grows with the days.
