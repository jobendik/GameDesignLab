---
id: PhoneGameLab/01-splodge
title: Splodge
was: 01-tap-frenzy (Tap Frenzy)
status: transformed
baseline: 2
score: 8
updated: 2026-11-26
---
## Original concept and core mechanics
Reflex tapper: circles appear at random positions and shrink away; tap as many as possible before a 30 s clock ends.

## Baseline assessment
48-line prototype. Hue-random circles on a blank canvas, input on `onTap` (fires on release, so every hit felt late),
hitbox equal to the shrinking visual radius (late taps were unfair), fixed 30 s with no stakes, one beep, no best score,
no splash or stats, misses counted but meaningless. Overall 2/10.

## Weaknesses identified
Laggy input; shrinking hitboxes; no reason to choose one target over another; flat difficulty; no identity; no feedback
beyond a beep; nothing persisted; nothing to look at when the run ends.

## Creative opportunities
Make every tap leave something behind; make "which target next?" a real decision; turn the fixed clock into a resource
the player fights for; let pitch and silhouette (not only colour) identify targets.

## Planned improvements
Paint-on-paper identity with persistent splats; time bank instead of fixed clock; same-colour chain multiplier; layered
escalation (more paints, 3-tap big blobs, dripping blobs, rainbow wild blobs); instant `onDown` input with generous hit
radius and forgiveness; reactive music; splash backdrop; full test.

## Implemented improvements
- **Identity**: cream paper sheet taped to a craft mat; five paints, each with its own silhouette (circle, squircle,
  triangle, six-petal, star) so chains are readable without colour vision; pops stamp multiply-blended splats, chains are
  joined by finger-painted strokes, dried blobs leave a crust ring — the run ends as a painting behind the score card.
- **Time bank**: 20 s start, 30 s cap. Each pop refunds a slice tied to the current spawn interval (generous in layer 1,
  below break-even from about layer 5), a dried blob spills 1.5 s, a stray tap 0.5 s. The clock does not start until the
  first, pulsing "tap!" blob is popped.
- **Chain**: same paint in a row multiplies points up to ×6; a different paint restarts at ×1, a miss or dried blob
  drops it. Spawns are biased 30 % toward repeating the last colour so chains are always on offer but must be chosen
  against blobs that are about to dry. Fresher pops score more (10–20 base).
- **Escalation** ("layers", progress pips on the sheet, ribbon announcing what is new): 3→4→5 paints, big blobs that
  take three taps, dripping blobs that slide and leave a trail, rainbow wild blobs (+2.5 s, extend any chain), spawn
  interval .95→.36 s, drying time 2.6→1.15 s. Each new layer washes the old paint back so wet blobs stay readable.
- **Feel**: `onDown` input; hit radius = blob + 15 px (min 32 px), nearest-blob resolution, 0.2 s forgiveness on the
  spot of a blob that just went; pop-in with overshoot, wobble, late-life jitter and a drying ring that turns red;
  droplets, ring, score popup, bar bump; hit-stop and shake only for big blobs; time bar shakes red on a spill.
- **Audio**: pop pitch per paint, pentatonic ladder climbing with the chain, soft plip on spawn, ticking that speeds up
  under 6 s, funk backing whose intensity follows layer and danger.
- Works with touch (multi-finger), mouse; layout recomputed and painting re-rendered from stored marks on resize;
  `orient:"any"` so landscape phones get a full-width sheet.

## Test results
- Smoke (`node tools/smoke.js 01-splodge`): pass, 61 fps headless, no errors, survives resize/blur.
- Gameplay test `tests/PhoneGameLab/01-splodge.test.js`: pass — clock waits for first pop, pop scores, same-colour chain
  ×2 pays more and paints a stroke, different colour restarts chain, stray tap −0.5 s, big blob needs 3 taps, dried blob
  −1.5 s, layer 2 after 10 pops, auto-spawn, empty clock → game over with best saved, clean restart. All via real touch input.
- Screenshots inspected at 390×844, 844×390, 1280×800 (splash, early play, layer 3, game over); fixed low-contrast
  popups, lollipop-looking splat streaks, unreadable late-game paper (added layer wash + blob halo), blank splash backdrop.
- Subjective assessment from reading code and scripted play only — no human playtest.

## Remaining issues
- Balance of the refund curve is tuned from a scripted bot (which never misses), not from human runs; real sessions may
  end earlier than the intended 60–100 s.
- On a 1280×800 desktop the sheet is large; mouse travel makes high layers harder than on a phone.
- No keyboard control (free-position targets do not map to keys).
- Multiply blending of five paints gets muddy mid-layer; the wash only happens on layer change.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Immediate, tactile popping; chain-vs-urgency choice keeps it interesting |
| Mechanical depth | 7 | Target ordering, freshness bonus, time economy; still a reflex game at heart |
| Game feel | 8 | Instant input, overshoot/wobble, droplets, bar reactions, scaled shake/hit-stop |
| Visual identity | 8 | Paper-and-paint look with per-colour silhouettes; the run literally becomes a painting |
| Animation quality | 7 | Pop-in, squash on big blobs, ribbon, drying ring; splats themselves appear instantly |
| Audio quality | 7 | Pitch per paint + chain ladder + reactive music; built from engine presets |
| Controls | 8 | Generous radius, nearest-blob pick, post-pop forgiveness, multi-touch |
| Onboarding | 8 | Clock waits on a pulsing "tap!" blob; layer ribbons introduce each new rule |
| Replayability | 7 | Score chase with chain mastery and a different painting each run; one mode |
| Performance | 9 | Paint is baked to an offscreen sheet; ≤ 9 live blobs; 61 fps headless |
| Technical robustness | 8 | Clean restart, marks re-rendered on resize, engine pause; tested |
| Overall polish | 8 | Cohesive from splash backdrop to game-over painting |

## Next recommended action
Human playtest of the time-refund curve and miss penalty; consider a zen "free paint" mode and a share-your-painting button.
