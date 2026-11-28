---
id: PhoneGameLab2/volley-garden
title: Volley Garden
was: football / Football
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Football": swipe to kick a still ball past a keeper sliding left-right. One rectangle keeper, a dot ball, `setTimeout` resets, no end state.

## Baseline assessment
2/10 — no fail/win, no feel, setTimeout gameplay, no art, no pals, a commercial-app knock-off.

## Weaknesses identified
Static ball makes the swipe trivial; keeper is a metronome, not an opponent; no progression or session length; nothing to differ from the finished sibling *Postage Stamp* (behind-the-ball free kicks with curl, wall and stamps).

## Creative opportunities
Change the rule, not the skin: the ball is **never still**. Teammates cross it in and you strike first time, so timing (contact) joins direction and pace. A keeper who reads your habits gives the duel a mind-game.

## Planned improvements
Back-garden kickabout with Pip (striker, drawn from behind), Nori (keeper), Momo and Bun (crossers); four cross types; chalk-ring timing cue; keeper with reaction delay + dive; streak multiplier; 75 s match in four spells.

## Implemented improvements
- Crosses: rolled, lobbed, bounced, looped high (header). Each is aimed through a chalk ring; Pip runs onto it.
- One swipe = shot: direction is the swipe's line extended to the goal, pace is swipe speed (fires mid-swipe after ~60 px, so timing is honest). Contact quality = distance from ring centre: SWEET (true, quicker, harder to read), scuffed (sprays wide / balloons over the bar).
- Ball in the air at contact = VOLLEY (×2); high balls are headers; golden balls (spell 3+) ×2; consecutive goals multiply up to ×5; corners +5.
- Nori reacts after a delay that shrinks over the match, dives along an arc (tilt, lift), parries saves out; he remembers your last four shots and leans toward your favourite side before each cross.
- Spells (banners + whistle): Warm-up → Bouncers → High balls (+golden) → Nori's finest; music intensity follows spell and streak; last-10-s tick; full-time neutral end card with goals/shots, volleys, best streak.
- Pip turns round to cheer on goals (front view), droops on misses; speech bubbles (Nori "Mine!", Pip "Hat-trick!"); net bulges where the ball hits; arrows/WASD + Space shoot left/centre/right.
- Live attract demo behind the splash; layout from `Lab.play`, `orient:"any"` (goal widens in landscape).

## Test results
- Automated-gameplay: `tests/PhoneGameLab2/volley-garden.test.js` — whiff, real mouse-swipe goal past a slow keeper, HUD sync, volley flag + double pay, keyboard soft shot saved by a sharp keeper (streak reset), full time, clean restart. Passed 3× in a row (~18 s).
- Automated-technical: `node tools/smoke.js volley-garden` passes (61 fps).
- Visual inspection: portrait/landscape/desktop screenshots checked; fixed Pip hiding the ring, tiny ball, oversized six-yard box, empty bottom third.
- Subjective playtest: informed judgement from code + scripted play, not a human playtest.

## Remaining issues
- Pip's back view is hand-drawn (pals.js is front-only); it reads as Pip but is simpler than the shared art.
- Keeper tuning is from arithmetic, not from human play; mid-game difficulty may need a nudge.
- No vertical aim — height comes from cross type and contact, not from the swipe.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Timing a moving ball + picking a corner is immediately satisfying |
| Mechanical depth | 7 | Contact quality, volley/header risk, keeper habit-reading, streak multiplier |
| Game feel | 7 | Hit-stop + stars on sweet contact, net bulge, parries, shake scaled to multiplier |
| Visual identity | 7 | Mown-stripe back garden, wooden goal, flowerbeds; cozy and readable |
| Animation quality | 7 | Keeper dive arc, Pip kick/turn/cheer, crosser toss, squash |
| Audio quality | 6 | Pitch carries power/streak; combo ladder; whistle per spell; stock presets |
| Controls | 7 | Mid-swipe firing, generous ring, keyboard alternative |
| Onboarding | 7 | Ring brightens when strikable; three how-to lines |
| Replayability | 7 | Varied crosses, spells, multiplier chase, best score |
| Performance | 8 | Baked background, bounded particles, 61 fps in smoke |
| Technical robustness | 8 | Clean restart, resize, pause; tests pass 3× |
| Overall polish | 7 | Complete loop with live attract scene |

## Next recommended action
Human playtest the keeper curve; consider a swipe-curve (bend) on headers only, or a defender pal sliding across in the last spell.
