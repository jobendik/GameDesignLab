---
id: PhoneGameLab2/topping-toss
title: Topping Toss
was: donut-spin / "Donut Spin"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Donut Spin": tap to throw a knife into a spinning donut; hitting a knife already stuck ends the run; 8 knives = win.
A 30-line knife-hit clone with grey rectangles.

## Baseline assessment
2/10. Knives (wrong for a cozy collection), no feedback, no levels or spin patterns, one-hit loss, no character.
The genre-pure version exists as Phone Game Lab's *Pin Whirl* (avoid pins; snug bonuses, buttons, thimbles, bosses).

## Weaknesses identified
- A single rule (avoid what is stuck) and nothing to aim *for*.
- No reason to keep a run going beyond eight throws; knives.

## Creative opportunities
- Gentle projectile: donut toppings, tossed by Bun the baker.
- Change the rule: toppings *match*. Three of a kind in a row around the ring are eaten — by Momo, the hungry frog,
  peeking through the donut hole. That pulls the player toward the crowd instead of away from it.

## Planned improvements
Match-3 around a spinning ring, pairs/links made visible, chain bonus, next-piece preview with a swap, orders per
donut with escalating spin patterns, candles and wild sprinkle stars, hearts instead of instant loss.

## Implemented improvements
- **Toss & match**: tap anywhere to toss the topping Bun is holding onto the bottom of the donut (a marker shows the
  landing point). A topping landing touching two of its kind in a row (either side) completes a run: Momo's tongue
  zips out of the hole and eats them one by one (rising crunch ladder). Runs of 4–5 pay more. A head-on landing
  (closer than ~1.5 topping widths) bonks off and costs a heart.
- **Readable state**: touching same-kind neighbours are joined by a glaze bridge in their colour; a pair pulses.
- **Chain**: eats on consecutive tosses multiply (x2…x5); a toss that only places a piece ends the chain — so the
  skilled line is to set up several pairs (crowding the ring, raising bonk risk) and then cash them in back-to-back.
- **Queue**: the next topping is shown in the swap bubble; one swap per toss (tap the bubble, or S / ↓).
  The generator favours kinds that currently have a pair (40%), and a sprinkle star (wild) comes every ~9+ tosses.
- **Orders**: each donut asks Momo to eat 9, 12, 15… toppings. Spins progress steady → faster → surging → swaying →
  stop-and-go → flips with a wobble-and-tick warning, then random. Kinds grow 3 → 4 → 5; candles (never eaten,
  can't be landed on) from order 4. Finishing an order rolls the donut off-screen and a new flavour of glaze rolls in;
  a donut with no bonks returns a heart.
- **Pals as actors**: Momo watches the incoming topping, gasps at pairs, beams while eating, flinches at bonks and is
  sad at the end; Bun squashes on each toss, cheers on eats, flinches on bonks and gives first-time tips in a bubble.
- **Identity**: candy-striped bakery wall, checked tablecloth counter, glazed donut (six glaze flavours) with baked
  sprinkles, chunky distinct topping shapes (cherry pair, blueberry cluster, choc square, marshmallow, lemon star) so
  kinds never rely on colour alone. Bounce music whose intensity follows how crowded the ring is.

## Test results
- Automated-technical: `node tools/smoke.js topping-toss` — pass.
- Automated-gameplay: `node tools/run-tests.js topping-toss` — pass three runs in a row (~10 s): real taps toss;
  three-in-a-row is eaten (+30, order progress), a pair waits, swap button swaps, consecutive eats chain (30 → 60),
  a sprinkle star completes a trio, a head-on toss bonks (heart), a toss timed into a gap on a spinning donut lands
  cleanly, a filled order pays a bonus and rolls in order 2, two more bonks end the run, Enter restart is clean.
- Visual inspection: portrait, landscape, desktop, splash and order 8 (chocolate glaze, candles) were checked. Fixes:
  the choc "drop" read badly and became a choc square, the held topping moved off Bun's face, basket redrawn, HUD card
  text overlapped the hearts in landscape (moved onto the progress bar), swap label clipped on desktop, donut enlarged
  and centred in portrait, link bridges added after a scripted run showed pairs were hard to read.
- A scripted bot (tossing into clear gaps with ~50 ms reaction lag) bonked often; it does not lead the spin, so it
  says little about human difficulty, but it motivated the more generous linking distance.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Difficulty for real players is untested: the matching window (~0.35 s at order-1 speed) may feel tight to some.
- The ring can clog with unmatched kinds; the only relief is the swap and the biased generator.
- Rolling donut transition is simple; Momo rides along inside the hole.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Aim-for-the-crowd tension and Momo's tongue payoff are a real loop |
| Mechanical depth | 7 | Set-up vs. clutter, chains, swap planning, spin patterns, wilds and candles |
| Game feel | 7 | Squash on toss, wobble on landing, tongue snap with crunch ladder, bonk shake/flash |
| Visual identity | 8 | Bakery counter + glazed donut + frog-in-the-hole is distinctive at thumbnail size |
| Animation quality | 7 | Pop-in toppings, wobbles, tongue extension, donut roll transition, pal moods |
| Audio quality | 6 | Pitched pops per kind, crunch ladder, tick on flips; preset-based |
| Controls | 7 | One tap, 180 ms toss buffer, swap button ≥ 60 px, keyboard |
| Onboarding | 7 | Three short lines, landing marker, link bridges, first-time bubbles |
| Replayability | 7 | Orders escalate through six spin patterns, more kinds, candles; chain/score chasing |
| Performance | 8 | Baked donut/topping/background sprites, tiny entity counts |
| Technical robustness | 8 | Clean restart, resize re-layout, demo attract isolated, guarded timers |
| Overall polish | 7 | Complete loop, themed copy, order banners, confetti on finished donuts |

## Next recommended action
Human playtest of the matching window and the clog rate; consider a "Momo leans out and nibbles one stray topping"
rescue every few orders, and a boss-style order (two-ring donut).
