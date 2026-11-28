---
id: PhoneGameLab2/pine-kick
title: Pine Kick
was: climber-tom / "Climber Tom"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
Tap to jump from one wall to the other while red triangles scroll down; touching a spike on your side ends the run.
A yellow circle, two grey strips, a constant scroll, score = time.

## Baseline assessment
~30 lines, no metadata, no viewport/IIFE, `start()` called directly. Every jump was identical (fixed horizontal
tween), so the only decision was "tap now or later"; spikes could not be avoided once you were committed; no art,
no sound, no progression. Named after the commercial app's character.

## Weaknesses identified
- Binary input with no skill expression; the jump never varied.
- Hazards were arbitrary — no reading ahead, no landing choice.
- No pressure besides the scroll, no feedback, no character.

## Creative opportunities
- Make the jump analog: the hold time decides *where* on the far wall you land, so every kick is a read of the wall ahead.
- Turn the walls into living trunks with surfaces that change the rules (slippery moss, sticky sap, branches).
- Pip (bold, loves dares) is the perfect climber; reward dares mechanically.
- Must differ from Goat Up (PhoneGameLab/25): that is left/right rhythm tapping up discrete ledges with a puff bar.
  Pine Kick is a continuous physics climb with charge-to-aim kicks and hazards on two walls.

## Planned improvements
Hold-to-coil kick with real ballistics; brambles as the lethal spikes; grip that fades so Pip slides; a camera that
climbs on its own once you start; zones with new surfaces/hazards; acorns and close-call bonuses; best-height flag.

## Implemented improvements
- **Analog kick**: hold to coil (0.8 s to full), release to kick. Launch speed 560→1060 u/s with fixed sideways speed,
  so a tap lands ~2 m up the far trunk and a full coil ~11 m (and does a somersault). Physics at 120 Hz substeps.
- **Grip**: Pip holds for 0.3 s, then slides faster and faster (to ~5 m/s); dawdling or coiling too long costs height.
- **Climbing view**: creeps upward once the first kick is made (28 → 108 u/s with height); dropping out of the bottom
  ends the run, with a pulsing red edge and warning beeps as you get close.
- **Hazards by zone (every 100 m, banner + bonus)**: Roots (sparse brambles) → Low Boughs (branches: descending onto one
  is a perch with no slide; hitting the underside of a far-side branch bonks Pip back) → Mossy Middle (moss: fast slide,
  sap: no slide) → Pinecone Ledge (cones dropped down a trunk after a 1 s "!" warning; kick away or get knocked down)
  → Windy Crown (gusts with leaves and an arrow; wind changes flight time and therefore landing height) → Starry Top.
- **Risk/reward**: acorns float mid-gap on bold arcs, chained kick after kick (5 × chain, cap ×5), golden pinecones 50;
  landing within a whisker of a bramble is a CLOSE CALL (+15). Score = metres + bonuses; best height flagged on the trunk.
- **Onboarding**: the aim preview shows the whole arc and landing ring for the first metres, shrinking to 30 % by 160 m;
  Momo at the base dares Pip in a speech bubble; sticky hint until the first kick.
- **Pip as actor**: crouch-squash and `focus` + sweat while coiling, stretch on kick, `wow`/`joy` in the air, somersault
  on a full coil, squash on landing, `scared` on moss or near the bottom, `dizzy` after a cone or bonk, tumbles on a bramble.
- Identity: warm pine-bark plates, a gap of sky that runs morning → noon → sunset → dusk → starry night, parallax
  background trunks, clouds and a sinking forest; funk music whose intensity follows zone + danger; charge tone rising
  in pitch, slide/wind noise loops. `orient:"any"` (trunks centred, scenery fills the sides on landscape/desktop).
- Live attract scene: the same physics with an autopilot that uses the trajectory predictor.

## Test results
- Smoke (`node tools/smoke.js pine-kick`): pass, 61 fps.
- Gameplay test (`node tools/run-tests.js pine-kick`): pass three times in a row (15 s). Real mouse holds (60 ms vs 900 ms)
  prove hold time sets landing height; Space kicks; metres reach the HUD; acorn on the arc; close-call bonus; branch
  perch with no slide; pinecone knock; bramble ends the run; best recorded; Enter restart is clean; sliding out of the
  climbing view ends a run.
- Screenshots inspected at 390×844, 844×390, 1280×800 (play, charging preview, night zone with wind and moss, splash).
  Fixed after looking: brick-like bark → long pine plates, thin brambles → chunky vine with red spikes and warning band,
  empty gap → parallax trunks, low-contrast HUD → pill, howto line overflow, night chain text contrast.
- Autopilot balance runs (perfect predictor, 150–250 ms reaction): 840–974 m in 60–70 s, no position without a safe
  kick. Found and fixed a soft-lock: a branch directly above Pip on his own trunk bonked every kick.
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Landscape stage is short (S≈0.6): Pip is small and you see less of the wall ahead than on portrait.
- After Starry Top (600 m) nothing new appears; only density and the view speed rise.
- Bonk and the wind are learned by failing; there is no explicit tutorial for them beyond the toast/arrow.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Every kick is a quick read-and-commit; the climbing view keeps it tense |
| Mechanical depth | 7 | Analog charge, slide vs speed, surfaces, branches, wind, acorn chains, close-call dares |
| Game feel | 7 | Squash/stretch, somersault, bark chips, hit-stop on dares and brambles, rising charge tone |
| Visual identity | 7 | Twin pines with a sky that turns to night; readable hazards; somewhat simple backgrounds |
| Animation quality | 7 | Pal reacts continuously; eased camera; cones and leaves animated |
| Audio quality | 6 | Pitch carries charge/acorn chain; funk music with intensity; stock presets otherwise |
| Controls | 8 | One-thumb hold/release, Space too; held press carries across a landing; tap buffer in the air |
| Onboarding | 7 | Full-arc preview early, shrinking later; Momo's dare; 3 short lines |
| Replayability | 7 | Generated trunk each run, best-height flag, score chase; late game plateaus in novelty |
| Performance | 8 | 61 fps in smoke; baked bark/forest/cloud/acorn sprites; bounded lists |
| Technical robustness | 8 | Restart clean, resize recomputes scale, keys/pointer release polled, no errors |
| Overall polish | 7 | Complete loop with live attract, banners, stats card (height, acorns, close calls) |

## Next recommended action
Add one late-game twist after 600 m (e.g. swaying trunk tops that change the gap width) and a landscape layout that
shows more of the climb.
