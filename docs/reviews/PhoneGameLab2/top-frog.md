---
id: PhoneGameLab2/top-frog
title: Top Frog
was: fishy-frenzy / "Fishy Frenzy"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A pale oval follows the finger (teleporting) among coloured ellipses that slide sideways; touching a smaller one grows
you, touching a bigger one ends the game.

## Baseline assessment
~25 lines; no movement skill (the player teleports), random sizes with no readable threat, instant death, no audio,
no character, no progression beyond size.

## Weaknesses identified
- Teleport control removes all skill; danger is unreadable (sizes are close, no telegraph).
- The sibling Big Drip (PhoneGameLab 63) already does "slide around, swallow smaller, flee bigger".
- Two underwater siblings in this batch (Fin Focus) and Reef Relief / Fish Fizz already use side-view seas.

## Creative opportunities
- A frog that swims in kicks and eats with her tongue: two verbs that change *how* you hunt and flee.
- Hunters that telegraph lunges so that fleeing is a dodge, not a guess.
- A pecking order that visibly flips as Momo grows; a predator from above (heron) and somewhere to hide (lily pads).
- A top-down pond (not a side-view sea) so it looks nothing like Fin Focus.

## Planned improvements
Top-down lily pond; Momo kick-swims (press-aim, release-kick, hold for power); auto tongue; nine critter types from gnat to
turtle; hunters stalk → wind-up → lunge; heron strikes from tier 3; lily pads hide; three hearts; tier names and a
day-to-night palette; pecking-order strip in the HUD.

## Implemented improvements
- **Kick swimming**: press anywhere → Momo turns to the pointer and coils (squash, aim arrow growing with charge);
  release → kick of 160–490 u/s, then a glide with water drag; a ring splashes behind. Arrows/WASD kick in that direction,
  Space kicks forward.
- **Tongue**: the nearest snack-sized critter within reach and roughly ahead is snapped automatically (tongue shoots out,
  pulls the prey in, crunch pitched by prey size). Gulps within 1.6 s build a combo (×1.25 per step, up to ×3) with the
  rising combo ladder. Good kicks line up chains.
- **Pecking order**: a critter is a snack below 92 % of Momo's size, a threat above 108 % (hunters only); in between it
  just bumps you away. The HUD strip shows all nine critters by size with Momo's marker: snacks coloured, threats pink,
  "not yet" grey, plus progress to the next tier. When Momo outgrows a hunter a toast says so and it sweats and flees.
- **Hunters** (perch, pike, catfish, turtle) roam, stalk when they see you, then WIND UP for 0.65 s (shake, red "!",
  red eyes, dashed lunge line) and LUNGE along a locked line — a sideways kick dodges ("Dodge!").
- **Heron** (from Splashy Momo): its shadow crosses the pond, a red target tracks Momo, locks (blinks) and strikes. Under a
  lily pad Momo is hidden (also from hunters); in the open she is caught.
- **Caught** = hit-stop, shake, "Bleh! Spat out!": Momo shrinks to 70 % mass, is invulnerable for 2.4 s (blinking) and loses
  a heart. Three hearts.
- **Growth arc**: Froglet → Little → Splashy → Big → Huge Momo → Pond King; the camera zooms out as she grows, the water
  shifts from morning mint to night blue (HUD retinted), critter spawns follow her size so snacks and threats both exist.
- **Momo as actor**: `focus` while coiling, `wow` + open mouth while the tongue is out, `joy` after a gulp, `scared` when a
  hunter winds up nearby, `dizzy` after being spat out; squash on charge and stretch on the kick.

## Test results
- Gameplay test (`node tools/run-tests.js top-frog`): passed five times in a row after its last edit (~21 s); one earlier
  failure came from asserting a critter count that spawning can change (fixed to track the eaten critter's id). Covers real
  press-hold-release kicks (direction and hold-for-power), tongue gulps (score, HUD, growth), a ×1.25 combo, a too-big newt
  bumping Momo, a lunging perch catching her (heart, shrink, invulnerability), growing to Splashy Momo flipping the perch
  from threat to snack, the heron missing Momo under a pad and catching her in the open, the third catch ending the run,
  clean restart.
- Smoke (`node tools/smoke.js top-frog`): pass, 61 fps.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (Froglet, Splashy Momo with a pike, Pond King at night with the
  heron target, splash); fixes: zoom/Momo too small, HUD text unreadable at night (retint), how-to lines too long.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Momo is drawn with the pals' front-facing art rotated toward her heading (`pose:'lie'` + `tilt`), so heading "up" reads as
  a standing frog rather than a swimming one; acceptable stylisation, but a true top-down frog would sell the pond better.
- The world is an open square pond; no currents or reed mazes to use when fleeing.
- Past Pond King only the heron and turtles threaten; the very late game is easier than tiers 3–5.
- Critters are drawn procedurally every frame (fine at ~30 entities, 61 fps in smoke).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Kick-and-snap chains feel good; lunges and heron strikes give real scares |
| Mechanical depth | 7 | Charge vs speed of response, combo routing, dodging telegraphed lunges, hiding |
| Game feel | 7 | Coil squash, kick ring, tongue snap, crunch pitch, hit-stop on catches |
| Visual identity | 7 | Top-down toy pond, lily flowers, day-to-night water; critters simple but varied |
| Animation quality | 7 | Swimming wobble, tails, wind-up shake, heron shadow; Momo rotates rather than swims |
| Audio quality | 6 | Funk music tied to danger/tier, size-pitched crunches, warn cues; no water ambience loop |
| Controls | 7 | One-thumb press/release with aim arrow; keyboard kicks; auto tongue keeps it simple |
| Onboarding | 8 | First toast, pecking-order strip, heron tip, "snack now" toasts |
| Replayability | 7 | Random spawns tuned to size, six tiers, best score; late game flattens |
| Performance | 8 | Culled drawing, bounded critter count (~18–30), 61 fps |
| Technical robustness | 8 | Clean restart verified, theme reset, particles cleared before game over |
| Overall polish | 7 | Complete loop with themed card; Momo's top-down look is the compromise |

## Next recommended action
Human playtest of tiers 3–5 (lunge timing vs kick power); add reed beds/currents and a late-game threat beyond the heron.
