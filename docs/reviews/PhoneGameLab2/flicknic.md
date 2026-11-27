---
id: PhoneGameLab2/flicknic
title: Flicknic
was: busy-bugs (Busy Bugs)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Bugs converge on the picnic food from all sides; tap them before they arrive; three misses end the run.

## Baseline assessment
27-line placeholder: black dots homing on a yellow disc, tap-to-delete with an 18 px hit radius, "Life: 3" in a
corner, one beep, no waves, no best score, no character. Overall 2/10. (The lab's other picnic game, Last Slice, is a
tower defence; this one had to stay a direct-action game.)

## Weaknesses identified
Tapping dots has no skill curve, no direction, no consequences between bugs; a miss is instantly permanent; nothing
changes over time; no identity.

## Creative opportunities
Make the swipe a physical flick with a direction, so bugs become projectiles; let a stolen slice be won back; give
each bug a different answer; let the anxious baker be the panic button.

## Planned improvements
Directional flicks with bowling chains; thief-and-rescue instead of lives; five bug behaviours; friendly ladybirds;
Bun's pan as a charged screen-clear; scripted, escalating waves; gingham-blanket identity.

## Implemented improvements
- **Flick**: any swipe segment that crosses a bug launches it along the swipe at 0.62× finger speed (clamped); it
  decelerates, and if it stops on the blanket it is only dazed for 0.9 s and walks on. Tapping a bug gives a weak
  outward boop. A white swipe trail and sparks answer every stroke.
- **Bowl**: a flying bug that hits another passes its momentum on billiard-style (×2, ×3, … score and a rising
  pentatonic ladder); ants arrive in single-file lines precisely so they can be bowled. Flyers bounce off the plate.
- **Rescue**: a bug reaching the plate takes the nearest slice and walks back out with it; flicking (or bowling) the
  thief sends the slice arcing back (+25). Only slices carried off the blanket are lost; eight lost ends the run.
- **Cast**: ants; beetles (first flick only flips them for 2.8 s, the second launches a heavy ball that ploughs
  through a line; an upright beetle also stops a flying ant); grasshoppers (move in hops, un-flickable in the air);
  wasps (fly in, circle 1.7 s, dive, leave fast); ladybirds (friends, marked with a heart — flick one and the jam jar
  empties; left alone they return a lost slice or pay +50).
- **Bun is the actor**: sits behind her cake watching the nearest bug, trembles with arms up when one is close or a
  slice is walking away, beams on rescues and chains, droops when a slice is lost. Shoos and chains fill the jam jar;
  when full she bounces with pan and spoon and a "Tap me!" bubble — tap her and every bug on the blanket is blown away.
- **Waves**: generated from patterns (singles, lines of 3–5, beetle-led columns, pincers, hop/wasp singles, rings)
  with a guaranteed introduction for each new bug (waves 2, 3, 5, 6) and one-line tips queued so they never overlap;
  speed and density rise each wave; "No crumbs lost" bonus 50 × wave. Arrival time is normalised to screen size so
  portrait and landscape are equally hard. Bugs never come from straight behind Bun.
- Presentation: baked gingham blanket on grass, strawberry cake that visibly loses wedges and leaves crumbs,
  procedurally drawn bugs with wiggling legs, "march" music rising with the wave, wasp buzz loop, attract demo.

## Test results
- Smoke (`tools/smoke.js flicknic`): pass.
- Gameplay test (`tests/PhoneGameLab2/flicknic.test.js`, 3 consecutive passes): wave 1 sends ants; real swipe flicks an
  ant out (score/HUD); one swipe makes an exact ×3 chain (10 + 30); ant steals a slice and a swipe returns it; an
  escaped thief costs a slice; beetle flips then flies; ladybird penalty; full jar + tap on Bun clears three ants;
  wave 2 starts; eight slices lost → game over + best; clean restart.
- Screenshots inspected at 390×844, 844×390, 1280×800 (mixed cast, chain, thieves, flipped beetle, full jar, splash).
  Fixed: overlapping tip toasts (now queued), cake and Bun enlarged.
- Subjective assessment from scripted play and code reading only (no human playtest). No long balance probe.

## Remaining issues
- Pointer only (no keyboard — a swipe game).
- Scribbling wildly around the cake is a workable low-score strategy until wasps and hoppers arrive; chains,
  ladybirds and beetles reward aim but do not forbid it.
- Late waves (8+) are tuned by reasoning; grasshopper timing has not been felt by a human hand.
- On large desktop stages the blanket is roomy and bugs are small relative to it.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Flicking is tactile at once; a three-ant strike is a small delight |
| Mechanical depth | 8 | Direction and force matter, chains, two-step beetles, timing hoppers, rescue priorities, a charged clear |
| Game feel | 8 | Trail, sparks, billiard knocks with combo ladder, hit-stop on long chains, slices arcing home |
| Visual identity | 8 | Gingham top-down picnic with a lavender bunny and a cake that disappears by the wedge |
| Animation quality | 7 | Leg wiggle, hops with shadows, flipped beetles kicking, Bun's reactions; bugs do not turn smoothly |
| Audio quality | 7 | Pitch by flick force and chain length, wasp buzz, march music; steal/lost cues are plain |
| Controls | 8 | Swept swipe test with generous radius, tap fallback, works with mouse and touch |
| Onboarding | 8 | Five lone ants first, each new bug introduced alone with a queued tip |
| Replayability | 8 | Pattern-generated waves, chain chasing, rescue drama |
| Performance | 9 | ≤ ~30 bugs, baked background; 60 fps in headless smoke |
| Technical robustness | 8 | Clean restart, resize-safe layout, sub-stepped flyers, loop stopped on game over |
| Overall polish | 8 | Complete loop, attract demo, themed end card |
## Next recommended action
Human playtest of waves 6–10; consider a small "aim line" tutorial ghost on wave 2's first ant column.
