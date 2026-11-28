---
id: PhoneGameLab2/return-to-sender
title: Return to Sender
was: destroy-aliens / "Destroy Aliens"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Destroy Aliens": a 40-line space-invaders clone. Drag a ship, it auto-fires; an 18-alien grid sways and steps down;
red bullets fall; one hit ends the run, reaching the bottom ends the run, clearing the grid "wins".

## Baseline assessment
2/10. Black screen with rectangles, no waves, no difficulty curve, one-hit death, `Math.random` fire with no telegraph,
`Lab.beep` as the only sound. The genre-pure version already exists as Phone Game Lab's *Scribble Siege* (drag + auto
fire, star multiplier, eraser bomb), so a reskin was not an option.

## Weaknesses identified
- Shooting is automatic: the only decision is where to stand.
- No identity, no character, no progression, unfair instant death.

## Creative opportunities
- Change the verb: no gun. Bolt (gadgets, space) has a **tractor beam** and the invaders themselves are the ammo.
- Add a matching rule so every shot is a choice (which colour to pull, where to send it), borrowing a puzzle layer
  that the sibling does not have.
- Make the fiction gentle: moon jellies drifting onto Bun's garden get *sent home*, not destroyed.

## Planned improvements
Hold-to-beam / release-to-fling on one finger, colour patches that pop together, streak multiplier, telegraphed
drips, waves with new jelly types every couple of waves, a boss every fifth wave, hearts, a danger line.

## Implemented improvements
- **Beam & fling**: press under a column — Bolt zips there and his beam pulls the column's lowest jelly into his arms;
  slide to aim, let go to fling it straight up. A quick tap is buffered (the jelly is thrown back the moment it
  arrives). Keyboard: arrows + hold Space/Up.
- **Matching**: a jelly hitting one of its colour pops the whole 4-connected patch with a rippling cascade
  (10·n(n+1)/2 points, pentatonic pop ladder); a wrong colour pops only the jelly it hits and breaks the streak; a
  miss breaks it too. Matched throws in a row multiply (x2…x5).
- **Waves** (formation sways and steps down, speeding up as it thins): 2 colours → 3 → 4 → 5; pot-helmet jellies
  from wave 3 (can't be beamed — keep the beam on them ~1 s to tug the pot loose, or knock it off with a throw);
  divers that peel off at Bolt (beam them for a "Nice catch!" bonus); rainbow jellies (wild ammo, bridge colours in
  the formation); fizzy jellies from wave 6 (3×3 burst, chainable); a shooting-star saucer that pays 150 and a heart;
  **Big Wobble** every 5th wave — a mother jelly that refills the top row every 3.4 s and spits a telegraphed 3-way
  spread until it is hit 5/8/11… times, then the whole formation pops with it.
- **Fairness**: drips are telegraphed (jelly wobbles and grows a droplet for 0.75 s, a ground shadow grows under the
  falling drop), three hearts with 1.6 s invulnerability, a held jelly shields Bolt from a drip (and is lost), thrown
  jellies wipe drips out of the air, the landing line is drawn and turns red as the formation sinks.
- **Pals as actors**: Bolt leans into his moves, raises his arms to catch, looks at the incoming jelly or the nearest
  drip, gets dizzy and dripping wet when gooped, cheers on big pops and wave clears, comments in speech bubbles
  (first-time tips). Bun peeks from the cabbages, trembles when the formation gets low, cheers on clears.
- **Identity**: baked starry night with moon and hills, glossy pastel jellies with a belly symbol per colour (heart,
  drop, star, moon, flower — not colour-only), cyan beam with rising rings, funk music whose intensity follows the
  formation's height. Landscape/desktop use a 9-column formation with the HUD and Bun beside the field.

## Test results
- Automated-technical: `node tools/smoke.js return-to-sender` — pass (61 fps).
- Automated-gameplay: `node tools/run-tests.js return-to-sender` — pass three runs in a row (~19 s). Real mouse
  input beams and flings; matching patch pops 6+1 for 210; mismatch pops one and resets the streak; a short beam
  clonks off a pot, a throw knocks it off, a long beam pries it and brings the jelly down; an emptied formation clears
  the wave and the next arrives; a drip costs a heart; a sunk formation ends the run; restart is clean.
- Visual inspection: portrait, landscape, desktop at waves 1/3/5/6/8 (boss), splash and game-over card checked.
  Fixes made: replaced the busy shared backdrop (clouds/moon behind the formation and HUD) with a baked night sky,
  moved the moon into empty space, reduced same-colour clumping in later waves, added a bush in front of Bun.
- Scripted 45 s greedy bot reached wave 3 with one heart left (it never dodges). It exposed a softlock — only
  helmeted jellies left, nothing beamable — fixed with the tug-the-pot-off beam.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- On 844×390 landscape the jellies are ~27 px: readable, but small.
- Portrait starts with a lot of empty sky below the formation (it is the formation's runway).
- Wave 1 scores very large patches easily; scores scale steeply (by design, but numbers inflate fast).
- Big Wobble is the only boss pattern; it repeats every five waves with more hit points.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Pull–aim–fling is tactile and the cascading patch pops are satisfying |
| Mechanical depth | 7 | Ammo choice, colour patches, helmets, streaks, holding vs. drip risk |
| Game feel | 7 | Beam with rings and hum rising during the pull, squash on catch/throw, ripple pops, hitstop on big patches |
| Visual identity | 7 | Night garden, glossy symbol jellies, cyan beam; clearly not the notebook sibling |
| Animation quality | 7 | Jelly wobble/swell telegraphs, pot wiggle, Bolt lean/arms/moods, Bun trembling |
| Audio quality | 6 | Beam hum, combo pop ladder, knock pitch rises while prying, music intensity; leans on presets |
| Controls | 7 | One finger, absolute column targeting, buffered quick throw, keyboard; aim is fixed-vertical |
| Onboarding | 7 | 3-line how-to plus contextual first-time bubbles (beam, match, pots, divers) |
| Replayability | 7 | New jelly type every wave or two, saucer, boss every 5th wave, streak chasing |
| Performance | 8 | Baked sky and jelly sprites, bounded entities; 61 fps in smoke |
| Technical robustness | 8 | Clean restart, resize re-lays out the field, pause-safe timers, demo attract isolated from the run |
| Overall polish | 7 | Complete loop with themed game-over lines and stats |

## Next recommended action
A second boss pattern and a short "pot armour" wave intro; consider angled flings (drag-release direction) for
late-game skill; enlarge the landscape field by cutting a row there.
