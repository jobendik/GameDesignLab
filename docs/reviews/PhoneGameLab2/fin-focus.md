---
id: PhoneGameLab2/fin-focus
title: Fin Focus
was: fishtastic / "Fishtastic"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A white circle follows your finger across a flat blue screen; coloured ovals drift sideways; touch one of the "target
colour" for a point, a wrong colour costs a point; 30-second timer.

## Baseline assessment
~30 lines. The dot teleports to the finger, fish are coloured ellipses, the target is a coloured square, no audio
beyond beeps, no character, no progression, no splash metadata.

## Weaknesses identified
- Teleporting control: no skill in reaching a fish.
- Colour-only targets (not accessible, no personality).
- Its sibling Reef Relief already owns "catch things underwater" (claw); Fish Fizz also uses Nori underwater.

## Creative opportunities
- Change the verb: Bolt the tinkerer photographs fish from a diving bell. Approach, frame, hold steady — a gentle
  shadowing skill instead of grabbing.
- Give each species a behaviour that demands its own approach.
- Make air the clock and depth the risk: rarer fish live deeper where air drains faster.

## Planned improvements
Brass diving bell with Bolt at the porthole, a camera viewfinder ahead of the bell, focus-to-snap, six species with
behaviours, album pages requested by the other pals, air/vents/jellies, a sloping sea from kelp shallows to a dark trench.

## Implemented improvements
- **Steering**: hold anywhere and the bell chases that point with lag and glide (speed scales with finger distance, so a
  finger near the bell creeps); arrows/WASD on keyboard. It bumps the seabed, the propeller spins with speed, the cable
  trails to the surface.
- **Photograph**: a bracketed viewfinder sits ahead of the bell on the side it faces. A wanted fish inside it while the
  bell moves slower than "gently" fills a focus ring (0.55 s); then click, flash, shutter noise, the album slot pops.
  Moving fast shows "Gently…" and drains the ring. Two wanted fish in one frame pay ×1.5; a dead-centre shot ×1.5.
- **Species**: Sunnyfin schools (shallow, 10), Stripey darts and changes course (20), Puffer counts only puffed — it
  puffs when you get close (30), Blushfin flees a fast bell — creep up (35), Peek Eels slide out of reef holes for ~2 s
  (40), Glowfins live in the dark deep and show only their lures (50). Jellies drift and zap the bell (−12 % air, knock-back).
- **Air clock**: drains faster with depth and with page number; a wanted photo gives +6 %, swimming through a vent's
  bubble column refills, a finished page refills fully plus a page bonus scaled by leftover air.
- **Album pages**: each page is requested by a different pal (Nori, Pip, Bun, Momo, Olli — shown in the HUD card);
  page n unlocks one more species and always asks for the newest; 4 photos from page 4; extra jellies per page; after
  page 6 the sea turns to night (the lamp matters everywhere).
- **Navigation**: edge-of-screen compass bubbles point to the nearest fish of each wanted species.
- **Bolt as actor**: looks at the fish in frame, `think` while focusing, `joy` on a snap, `dizzy` on a zap, sweats and
  looks scared when air is low; speech bubbles over the bell teach each species the first time it is wanted.
- **Look**: sunny sky and light rays, kelp shallows, coral-dotted sand slope, vents, reef holes, darkness with a warm
  lamp pool and glowing lures in the deep; HUD text retints between the bright surface and the dark depths.

## Test results
- Gameplay test (`node tools/run-tests.js fin-focus`): passed three times in a row (~14 s). Covers mouse-hold steering,
  "fast bell cannot focus", a steady snap (slot, exact centred score, HUD, air top-up), a double off-centre shot paying
  ×1.5, page completion → page 2 with full air and bonus, a flat puffer not counting vs. a puffed one counting, a
  blushfin fleeing a fast bell, a jelly zap, air running out, clean restart.
- Smoke (`node tools/smoke.js fin-focus`): pass, 61 fps.
- Screenshots inspected at 390×844, 844×390 and 1280×800 (shallows with focus ring, deep trench in the dark, splash),
  three rounds: HUD contrast against the sky (now retinted), tips moved from toasts into Bolt's bubble and drawn above
  the darkness, compass bubbles kept off the album card, seabed decor added, how-to line shortened.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Landscape shows less depth (the view is area-normalised), so the bell feels large on 844×390.
- Species populations are fixed; a photographed fish keeps swimming, so the sea never empties but also never changes.
- Night mode is just darker; a night-only species would make late pages more distinct.
- Air balance past page 6 is judged from the numbers only.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Hunting the wanted fish and settling into a shot is calm but satisfying |
| Mechanical depth | 7 | Species behaviours, double shots, centring, depth-vs-air routing |
| Game feel | 7 | Floaty steering, focus ring, flash + click + slot pop, zap knock-back |
| Visual identity | 8 | Brass bell with Bolt at the porthole, sloping toy ocean, lamp-lit trench |
| Animation quality | 7 | Swimming wobble, puffing, eels sliding out, bell tilt and squash; fish sprites are simple |
| Audio quality | 6 | Chill music tied to air, click/chime/zap/bubbles; no sustained bell hum |
| Controls | 7 | Hold-to-steer is forgiving; the "gently" threshold is clearly signposted |
| Onboarding | 8 | First page is shallow and easy; per-species tips; compass bubbles |
| Replayability | 7 | Random pages and species mix, unlock ramp, night pages |
| Performance | 8 | Baked fish sprites, culled drawing, ≤90 bubbles; 61 fps in smoke |
| Technical robustness | 8 | Clean restart verified; resize recomputes scale and camera; particles cleared before game over |
| Overall polish | 7 | Full loop with themed card; landscape framing is the weak spot |

## Next recommended action
Human playtest of air drain at pages 4–8; add a night-only species and a sustained bell/propeller hum.
