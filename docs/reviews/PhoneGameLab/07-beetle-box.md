---
id: PhoneGameLab/07-beetle-box
title: Beetle Box
was: 07-memory-match (Memory Match)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Classic pairs: a 4×4 grid of face-down cards, flip two, matching pairs stay, win when all are matched (time shown).

## Baseline assessment
50-line prototype: emoji on flat rectangles, cards changed colour instead of flipping, a `setTimeout` input lock of
550 ms after every second card (taps were swallowed), one fixed board, no score, no fail state, no levels. Overall 2/10.

## Weaknesses identified
No flip animation or feel; sluggish because of the lock; borrowed emoji art; no reason to play twice (one board, no
scoring); timing done with `setTimeout`, so pause/restart could corrupt state.

## Creative opportunities
Memory games are usually punished by luck (blind first flips). Separating *guessing* from *forgetting* makes lives fair.
Procedural specimens allow look-alike species as a difficulty lever, and "beetles don't sit still" suggests a telegraphed
card swap as a twist that tests memory updating rather than raw recall.

## Planned improvements
Real flip; procedural card art; pins (lives) lost only on careless misses; combo scoring; a drawer-by-drawer level curve
with look-alikes and scuttling cards; museum-drawer identity; no input lock.

## Implemented improvements
- **Renamed "Beetle Box"**: walnut drawer with grain, moss-felt tray, kraft card backs with a stamped lattice and beetle
  seal, cream specimen cards. Beetles are generated in code: 8 colourways × 5 body plans (ladybird, longhorn, shield,
  stag, scarab) × 6 wing patterns, with legs, antennae, mandibles/horns, shading and sheen; faces are baked per drawer.
- **Flip with weight**: horizontal squash through edge-on, lift, shear, moving shadow, back/front swap at 90°, flip
  sounds pitched by first/second card. Cards are dealt in from below with stagger and swept away on a clear.
- **No input lock**: the result is decided on the second tap; a third tap instantly turns a showing mismatch back and
  flips the new card.
- **Fair lives**: 4 pins. A miss is free unless the second card had been seen before or the first card's partner had
  ("you'd seen that!" + red frames) — only forgetting costs a pin. One pin returns per cleared drawer.
- **Scoring**: 100 × combo (consecutive pairs, capped ×6, carries across drawers); clear bonus = 50 per pin + time
  bonus against a 4.5 s-per-pair par + 250 for a flawless drawer.
- **Level curve**: 6 → 12 → 16 → 20 cards with look-alike families (same colour and body, different wings) → restless
  drawers where two face-down cards wiggle (0.6 s telegraph) then visibly swap slots every 9→4.5 s (meter in the HUD) →
  24 and 30 cards. Endless after drawer 7 with faster scuttling.
- **Feedback**: gold ring + star burst + pin head and sheen sweep on a match, pentatonic combo ladder, shake on a miss,
  pin HUD pop, banners ("Flawless!"), music intensity follows progress/combo/last pin; on a loss every card is revealed.
- Touch + mouse (pointer-down, full-cell hitboxes) + keyboard cursor; `orient:"any"` picks the grid orientation that
  gives the largest cards.

## Test results
- Smoke (`node tools/smoke.js 07-beetle-box`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test (`tests/PhoneGameLab/07-beetle-box.test.js`): pass — deck integrity (each species twice); real touches
  flip and match (+100, combo); blind miss is free; third tap dismisses a mismatch immediately; careless miss costs a
  pin; combo doubles the next pair; clearing deals a 12-card drawer with bonus and a pin back; scuttle swaps two slots;
  keyboard flip; last pin lost ends the run with best recorded; clean restart.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (drawer 2 with a careless miss, restless 24-card drawer
  mid-scuttle with ×5 combo, 30-card drawer, splash), checked with the Fredoka typeface.
- Subjective assessment is from reading the code and watching scripted play only — no human playtest.

## Remaining issues
- Sessions run longer than the 1–3 minute target for good players (a flawless run through drawer 6 is ~4–5 minutes).
- In 844×390 landscape the 24/30-card drawers have ~46 px-wide cards; beetle patterns get small.
- The "careless" rule is explained in one how-to line and by the in-game popup only; some players may not infer why a
  particular miss was free.
- Matched cards stay on the tray (dimmed); there is no end-of-drawer collection view or species names.
- Scuttle pairs are chosen among near neighbours at random, not designed to be maximally readable.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Snappy pairs with a fair miss rule; restless drawers add real tension |
| Mechanical depth | 7 | Explore-vs-commit decisions, combo preservation, tracking swaps, look-alikes |
| Game feel | 8 | Weighted flip, buffered taps, match bursts, deal/sweep transitions |
| Visual identity | 8 | Specimen-drawer look with generated beetles; distinct from the rest of the batch |
| Animation quality | 8 | Flip with shear and shadow, staggered deal, wiggle telegraph, lifted swaps, sheen sweep |
| Audio quality | 7 | Pitched flips, combo ladder, scuttle ticks, reactive music; presets only |
| Controls | 8 | Pointer-down, generous cells, no lock, keyboard cursor |
| Onboarding | 7 | Six-card first drawer and a hint line; the careless rule needs a moment to click |
| Replayability | 7 | Random species/decks, score and combo chase, endless tail; no alternative modes |
| Performance | 9 | Baked card sprites (cache cleared per drawer), ≤ 30 drawImage calls per frame |
| Technical robustness | 8 | Engine timers only, clean restart, layout recomputed on resize |
| Overall polish | 8 | Cohesive, with a clear hook of its own |

## Next recommended action
Human playtest of the careless rule's legibility and of scuttle frequency; consider naming species on the clear screen.
