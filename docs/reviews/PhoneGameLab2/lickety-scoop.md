---
id: PhoneGameLab2/lickety-scoop
title: Lickety Scoop
was: ice-cream-shop / "Ice Cream Shop"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Ice Cream Shop": three customers each want one of four flavour colours; tap a flavour, then tap the customer; a
customer whose timer runs out ends the run; 30-second shift.

## Baseline assessment
2/10. A ~30-line prototype: coloured rectangles, tap-colour-then-tap-target, no art, no feedback, instant game over on
the first walk-out, no progression.

## Weaknesses identified
- Pure colour matching with no skill beyond speed; no identity, no characters.
- Siblings already do order-assembly: Lantern Noodles (tap trays to build bowls, regulars) and Pop & Pour (swipe fruit
  into layered drinks). Physics stacking belongs to Cakewalk / Teeter Torte / Clatter Castle.

## Creative opportunities
- Make the *scooping itself* the skill: scoop size by holding, judged against the order.
- Stacking with a size rule (not physics): a scoop bigger than the one below topples the cone — precision now carries
  across the whole cone.
- Momo the always-hungry frog as the server who gulps every mistake.

## Planned improvements
Hold-to-size scooping with per-flavour speed, target and topple rings, graded scoops, ordered multi-scoop cones,
patience/hearts, a pal queue with personalities, flavour unlocks, cherries, full v2 loop, tests.

## Implemented improvements
- **Scooping to size**: press a tub and hold; a magnified scoop rolls up above the tub next to a dashed target ring
  (turns green inside the perfect window) and, from the second scoop, a red ring at the topple limit. Release to drop
  it on the cone (bounce landing). Perfect (±5 %) 30 · Good (±12 %) 15 · Sloppy 5. Flavours scoop at different speeds
  (chocolate slow, mint fast). Hold past 113 % and it bursts.
- **Stacking rule**: orders always go large → small; a placed scoop more than 8 % bigger than the one below topples the
  whole cone (scoops fly off, −3 s patience), so a sloppy big scoop early makes later scoops harder.
- **Momo**: the wrong flavour, a burst scoop or an unwanted scoop flies into Momo's mouth (Gulp!) — costs the streak;
  Momo watches the tub you hold, cheers served cones, panics at topples.
- **Customers**: Pip (impatient), Bun, Nori, Olli (patient), Bolt queue behind the counter; the front one's order card
  shows the cone bottom→top with S/M/L letters (not colour-only), ticks, and a patience bar; waiting pals lose patience
  at half speed and get flushed when nearly out. A walk-out costs one of three hearts.
- **Scoring**: scoop grades + tip (patience left, scoops, cherry), ×1.5…×3 for consecutive all-perfect cones, +40 for a
  perfect cone.
- **Progression** (every 4 cones): chocolate, mint, blueberry tubs open (locked tubs show "soon"); 2–3 then 2–4 then
  3–4 scoop cones; cherry-on-top orders (tap the jar) from level 4; shorter patience, more pals in line.
- Art/audio: seaside kiosk — mint/white scalloped awning, sky, sun, sailboat and sea through the window, wooden
  counter, frosty freezer tubs; scoops with drip rims, highlights and chips. Scoop slide pitch per flavour, pop pitch by
  size, rising chimes for perfect scoops, coin for serves, crunch for gulps; bounce music tied to the most impatient pal.
  Live attract scene where Momo serves by himself; `orient:"any"`; keys 1–5 hold-to-scoop, C for the cherry.

## Test results
- Automated-gameplay: `node tools/run-tests.js lickety-scoop` — pass, three consecutive runs (real mouse hold → graded
  scoop and HUD score; wrong flavour gulped; topple from a too-big scoop; burst; served cone paid; keyboard scoop;
  cherry order needs the jar (touch tap); three walk-outs end the run; clean restart).
- Automated-technical: `node tools/smoke.js lickety-scoop` — pass, 61 fps.
- Visual inspection: 390×844, 844×390, 1280×800 and splash, plus a 3-scoop cherry order mid-hold, captured and checked
  (three rounds: customers moved behind the counter, sea view added to the empty wall, magnified hold preview,
  cherry jar moved onto the counter, Momo's "stern" face while scooping softened).
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Landscape 844×390 is usable but the scene strip is shallow (small cone, small order card text).
- Hold-to-size is a timing skill; without the topple rule it would be thin — whether the rule reads for new players
  depends on the red ring and Momo's tip (untested on humans).
- No melting/rush-hour event late in the run; difficulty after level 6 only tightens patience.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | "Let go on the ring" is tense and satisfying; queues add juggling |
| Mechanical depth | 7 | Per-flavour speeds, topple rule chaining precision across scoops, streak risk |
| Game feel | 7 | Magnified wobbling scoop, bounce landings, topple scatter, Momo gulps |
| Visual identity | 8 | Seaside kiosk with sea view and pastel tubs; reads instantly as an ice-cream window |
| Animation quality | 7 | Scoop wobble/bounce, pals walk in/out with cones, gulp arcs |
| Audio quality | 7 | Pitch = flavour/size, chimes ladder on perfects; bounce music reacts |
| Controls | 8 | One press-and-hold; keyboard holds work too |
| Onboarding | 7 | Order card with S/M/L, rings explain themselves, Momo tips |
| Replayability | 7 | Random orders, unlocks, perfect streak chase |
| Performance | 8 | Baked background, few entities; smoke 61 fps |
| Technical robustness | 8 | Layout recomputed on resize; restart clean; test passes 3× |
| Overall polish | 7 | Complete loop; landscape is cramped |

## Next recommended action
Human playtest of patience pacing at levels 4–6; consider a late "hot afternoon" event (scoops melt while the cone waits).
