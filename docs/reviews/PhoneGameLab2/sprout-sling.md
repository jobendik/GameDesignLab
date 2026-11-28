---
id: PhoneGameLab2/sprout-sling
title: Sprout Sling
was: jungle-shot / Jungle Shot
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Jungle Shot": drag back to aim, release to fire a ball at five red circles; eight shots.

## Baseline assessment
Rectangles and circles on dark green; no feel, no sound, no reason to replay; a shooting-gallery fiction that does not
fit the cozy collection.

## Weaknesses identified
Targets just disappear (nothing changes in the world), no choices beyond aim, no progression, no identity; overlaps
Bun Voyage (lobbing) and Tin Topple (cannon physics) in verb.

## Creative opportunities
Make the shot *constructive*: you plant, and what you plant changes the playfield for every later shot.

## Planned improvements
Seed slingshot; typed soil mounds; plants that become terrain (bouncy fronds, trampoline cups, solid crowns with fruit);
a seed bag across clearings with refunds for skill; clearings that add nests, canopy, wind, a pillar, a swinging sloth.

## Implemented improvements
- **Shot**: drag back anywhere (relative drag, generous), a stretched leaf band and pouch, a power % and a *short* dotted
  guide (first ~0.3 s of the arc only). Arrow keys aim / Space fires. Fixed-step (120 Hz) physics with restitution and
  friction, wind and a time-correct sloth pendulum.
- **Mounds** take only their own seed (palm / bloom / fruit, shown on a sign; the mounds that fit the seed in the sling
  glow). A seed that settles near a matching mound still takes; a wrong seed bounces off ("Wants palm!").
- **Plants are terrain**: palm = trunk + springy fronds, bloom = stem + trampoline cup (always springs seeds high),
  fruit tree = trunk + leafy crown that hangs three fruits (+25 each, collect them with later shots). Planting order
  matters — a palm can block a far mound or be the bank shot to it.
- **Scoring**: plant 100, bullseye +50 and the seed refunded, trick (bounced off something you grew) ×2, clearing bonus
  150 × clearing and +3 seeds. One bag of 10 seeds for the run; empty bag → "Out of seeds!".
- **Clearings**: 1 flat → 2 a branch nest high in a tree → 3 canopy overhang + wind (drifting leaves and an arrow) →
  4 a rock pillar right in front of the sling (lob or bank) → 5+ a sleepy sloth swinging on a vine, more mounds/nests.
- **Pals**: Pip slings (watches the seed, cheers plants, droops at misses); Olli moves into each palm, Momo lounges in each
  bloom (bounces when a seed hits the cup), Bun picks fruit under each fruit tree.
- Layered jungle backdrop with light shafts, vines, foreground monstera leaves; chill music that lifts per clearing.
  Attract mode: Pip plants on his own behind the splash using the solver.

## Test results
- Automated-gameplay: `tests/PhoneGameLab2/sprout-sling.test.js` — a real mouse drag-back slings a seed that plants and
  scores; a seed dropped on the new plant bounces off it (terrain); a wrong-kind seed is refused; arrow keys + Space
  aim and fire; regrowing every mound clears the clearing; clearing 2 has three mounds incl. a branch nest; running out of
  seeds ends the run with a best score; Enter restarts cleanly. Passed 3/3 consecutive runs (~12.5 s).
- Automated-technical: `node tools/smoke.js sprout-sling` passes.
- Visual inspection: 390×844, 844×390, 1280×800 at clearing 1 and clearing 5 (canopy, pillar, sloth, wind), splash.
  Fixed: portrait world was too tall and the pals tiny (narrower/taller world fit, bigger pals), the pillar overlapped the
  sling in portrait, the canopy read as a flat green block, fruits floated unattached.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Portrait phones are narrow, so later clearings have only 2–3 mounds there (more in landscape).
- Plant geometry is not guaranteed to leave every mound reachable; the pillar/canopy are sized conservatively and the
  bloom always springs, but a rare layout could need a bank shot.
- The guide hides wind, so the first windy clearing can feel arbitrary until players read the leaves.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Satisfying "plop → sprout" moment; the world filling with pals is its own reward |
| Mechanical depth | 7 | Seed-type routing, plant order (block vs. bank), bullseye refunds, tricks, fruit detours, wind |
| Game feel | 7 | Stretch band with tick feedback, seed trail, bounce sounds by surface, sprout burst, plant bob |
| Visual identity | 7 | Layered jungle, light shafts, monstera corners, wooden stump sling, typed seeds and signs |
| Animation quality | 7 | Plants grow with outBack, fronds sway, sloth swings, pals pop into plants and react to hits |
| Audio quality | 6 | Whoosh pitch by power, surface-specific knocks/boings, rising chime per plant, chill music |
| Controls | 7 | Drag anywhere, clamped pull, short guide, keyboard aim; one seed at a time keeps it readable |
| Onboarding | 7 | Clearing 1 is two flat mounds with a sticky hint; each new hazard gets a toast |
| Replayability | 7 | Random layouts and seed order, escalating clearings, seed economy rewards precision |
| Performance | 8 | Baked backdrop, fixed-step with small solid lists; solver only runs in attract/tests |
| Technical robustness | 8 | Clean restart, world letterboxed on resize, shared physics for play/guide/solver |
| Overall polish | 7 | Complete loop with attract, friendly end card and stats |

## Next recommended action
Human playtest of clearings 3–6 for wind strength and portrait mound count; consider a reachability check in generation.
