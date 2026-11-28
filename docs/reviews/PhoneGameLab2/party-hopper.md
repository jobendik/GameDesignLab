---
id: PhoneGameLab2/party-hopper
title: Party Hopper
was: dress-up / "Dress Up"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Dress Up": drag five coloured shapes (two hats, two glasses, a bow tie) from a tray onto a yellow circle face.
Free play; the score is the number of placed items.

## Baseline assessment
2/10. A toy with no goal, no character, items float wherever they are dropped, score rewards spam.

## Weaknesses identified
- Nothing to aim for, no reason to replay, no reaction from the character.
- Placement is freeform, so outfits look broken; no outfit structure (slots).

## Creative opportunities
- Keep the toy (drag clothes onto a pal) and add a light, readable goal: party invitations with themes.
- Make the model an actor with an opinion: Pip (bold, impatient) reacts to every piece and won't wait forever.
- Keep creative pride: a photo of every good look, a gallery that survives the run.

## Planned improvements
Slot-snapping outfits on Pip, 25 themed pieces, invitations with escalating rules, live reactions, patience timer,
party judging by the host pals, polaroid gallery via `Lab.store`.

## Implemented improvements
- **Wardrobe**: five slots (head, eyes, neck, body, hand) × five themes (beach, snow, space, fancy, spooky) = 25
  procedurally drawn pieces (sun hat, bobble hat, space helmet, top hat, witch hat; sunglasses, ski goggles, visor,
  monocle, mask; lei, scarf, medal, bow tie, bat charm; swim ring, puffy vest, jetpack, tutu, vampire cape; ice
  cream, cocoa, toy rocket, teacup, lantern), layered behind/in front of Pip (capes, jetpack tanks, swim ring).
  Drag from the trunk onto Pip or simply tap a piece; tap a worn piece to cycle six colours; drag it off to remove.
  Keyboard: arrows pick tab/piece, Space wears, C recolours, X removes, G goes.
- **Invitations**: eight parties per day, each from a host pal (Momo's beach bash, Nori's snow ball, Bolt's star camp,
  Bun's tea party, Olli's sleepover). From party 4: two themes at once (both must appear), "2+ purple" colour rules;
  from party 6: bans ("no hats"). Pip's patience shrinks from 42 s to ~22 s.
- **Judging**: on-theme +2 per slot, the opposite theme (beach↔snow, fancy↔spooky) −1, a banned slot −3, colour rule
  +2; 0–3 stars. Score = stars×100 + 4/second of patience left + a streak bonus for consecutive 3-star looks.
  Running out of patience sends Pip as he is; three no-star parties close the day early.
- **Pals as actors**: Pip cheers and hops at on-theme pieces, shivers/sulks at the opposite theme, frowns at bans,
  watches the piece you drag, gets flushed and stern as patience runs out, then struts in at the party where the
  host and a random guest gasp, cheer or look baffled while the stars pop in; a camera flash snaps the polaroid.
- **Gallery**: 2–3 star looks hang as polaroids on the closet string for the run; the last eight are stored with
  `Lab.store("looks")` and the splash screen models them in turn.
- **Identity**: warm closet (striped/dotted wallpaper, rug stage, wooden trunk with tabs), party scenes from the
  shared backdrops (beach, snow, night, golden, dusk), chill music whose intensity rises as patience falls.

## Test results
- Automated-technical: `node tools/smoke.js party-hopper` — pass.
- Automated-gameplay: `node tools/run-tests.js party-hopper` — pass three runs in a row (~29 s): mouse drag of a hat
  onto Pip, drop elsewhere ignored, tap recolours, drag-off removes, tap-to-wear fills all slots, eight judging rules
  checked, GO → party with 3 stars, score, HUD and a polaroid, next invitation; party 8 ends the day with the neutral
  "What a day!" card; three impatient no-star parties end the run; restarts are clean.
- Visual inspection: portrait, landscape, desktop, a 3-star party scene, a double-theme/colour/ban invitation and the
  splash checked. Fixes: the spooky neck charm read badly and was redrawn as a bat, tab strip inset from the trunk
  frame, invitation rule text shortened and width-limited, how-to lines shortened.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- With icons shown and pieces this readable, a 3-star look is easy; the challenge is mostly speed and the later
  colour/ban rules. A day is a fixed eight parties.
- Pip is the only model (by design); hand props float near the hand rather than being gripped.
- In 844×390 landscape Pip is ~110 px tall; the trunk tiles stay comfortable.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Racing an impatient fox through themed outfits with live reactions is charming |
| Mechanical depth | 5 | Theme/opposite/colour/ban rules and patience; mostly a speed-sort |
| Game feel | 7 | Snap ring + pop per slot, hearts on good picks, hop, flash and stars at the party |
| Visual identity | 8 | 25 hand-made pieces on Pip, cosy closet, polaroid string |
| Animation quality | 7 | Pip reacts/hops/taps his foot, guests react, stars pop, polaroids sway |
| Audio quality | 6 | Chimes pitched by slot, ticking when impatient, star ladder, camera click |
| Controls | 8 | Drag or tap, recolour by tap, drag off, big tiles, keyboard path |
| Onboarding | 8 | Icons on the invitation, live reactions teach the rules, first-time bubbles |
| Replayability | 6 | Random invitations, rising rules, gallery to fill; fixed day length |
| Performance | 8 | Baked background and polaroids; little else on screen |
| Technical robustness | 8 | Clean restarts, resize re-layout, guarded storage, demo isolated |
| Overall polish | 7 | Complete loop with themed end cards and a persistent gallery |

## Next recommended action
Add a "secret wish" per host (a favourite piece worth a bonus star) and a weekly gallery wall to deepen replay.
