---
id: games/little-hero-adventure
title: Thimble & the Bramble King
was: Zelda Lite Adventure
status: transformed
baseline: 2
score: 7
updated: 2026-11-26
---
## Original concept and core mechanics
A third-person three.js sketch titled "Zelda Lite": a blue-tunic hero with sword and shield walks (tank controls) over
a 200×200 green plane, swings at red blobs and collects green "rupees". The concept worth keeping: a small hero, a
blade, a bright low-poly overworld, enemies to fight and things to pick up.

## Baseline assessment
Played in headless Chromium at the three reference viewports (screenshots in the agent scratch dir).
- Borrowed identity: franchise name in the title, rupees, tunic/shield hero.
- No goal, no win, no progression. Losing called `alert()` and `location.reload()`.
- Enemies had no attacks — they hurt on proximity with no telegraph, and the hit pushed the hero 2 units instantly.
- Tank controls; the touch stick was quantised to four directions; attack animation ran on its own rAF chain.
- Nothing was dt-based (per-frame constants), no pause, no restart, no audio, no best score, no metadata.
- Trees/rocks had no collision; 110 separate shadow-casting meshes; one new geometry+material per particle.
Overall: a bare prototype (2/10).

## Weaknesses identified
1. Unfinished: no objective, no end states, hard reload on death.
2. Combat had no reads or decisions — nothing to dodge, nothing to learn.
3. Controls: tank steering, 4-way touch, no dodge, no aim help.
4. Not original.
5. No lifecycle (pause, restart, dt), no audio, no persistence.

## Creative opportunities
- Shrink the scale: the "little hero" becomes literally tiny — a mouse knight in a garden, with a thimble for a helmet,
  a sewing needle for a sword and a coat button for a shield. Enemies are burrs, puffcaps and beetles.
- A compact, non-linear quest that fits a five-minute arcade session: three shrines in any order, a gate, a boss.
- "Red marks on the ground show where a hit lands" as the single combat rule, so every hit taken is the player's read.
- A world that visibly heals: each Lantern Bloom opens and glows when its guards are cleared.

## Planned improvements
Full rewrite on the same stack (three.js r128 + nipplejs): original fiction, 360° camera-relative movement, 3-hit combo
with aim assist, dodge roll with i-frames, unlockable charged Whirl, three enemy types with telegraphed attacks, seed
deflection, shrine ambush waves, boon progression, boss with armour/daze windows, pickups, hidden collectibles, score,
continue, NG+ loop, procedural audio and music, full lifecycle, touch UI, test hook, test.

## Implemented improvements
**Design / mechanics**
- Hand-laid island (start glade → crossroads → Fern Hollow, Reed Pond, Old Well → bramble gate → arena). Shrines can be
  done in any order; ambush waves scale with how many blooms are already awake.
- Boons: 1st bloom +1 heart, 2nd unlocks the Whirl (hold swing, release), 3rd +1 heart and opens the gate. Every bloom
  fully heals and is a continue point ("Regrow" halves the score).
- Hero: analog movement with fast acceleration, 3-hit combo (third hit is wider, 2 damage, big knockback), buffered
  inputs, aim assist toward the nearest enemy / seed / dandelion, roll with i-frames and cooldown, charged Whirl AoE.
- Enemies only hurt through telegraphed attacks: Thornling (ground line → lunge → recovery), Puffcap (inflates → slow
  seed that can be batted back at it for 2 damage), Beetle brute (ground circle → slam). Hitting a winding-up thornling
  interrupts it, so aggression is a real option.
- The Bramble King: thorn-armoured (hits clink off) except while dazed. Charge (line telegraph, crashes into the arena
  wall → long daze), leap-slam (circle telegraph → short tired window), seed ring (deflected seeds pierce armour),
  summons in later phases; three phases with faster cadence and double rings.
- Pickups: dew (magnet, rising-pitch chain bonus), honey jars (pity-timed heal drops), five hidden lost buttons.
- Score = kills + dew chains + blooms + buttons + boss + time / hearts / no-continue bonuses; best persisted to
  `gdl:best:games/little-hero-adventure` whenever beaten. Winning offers "Next season" (NG+: tougher, ×1.5 score).
**Feel**: hit-stop, restrained shake, white hit flash, knockback, leaf/dust particles (one instanced mesh), swing arc,
squash/stretch on every enemy state, floating score text, hurt vignette, objective chevron at the hero's feet.
**Visual identity**: warm storybook garden — flat-shaded vertex-coloured ground, giant toadstools/clover/daisies,
bramble arena, glowing blooms. All static decor is merged into one mesh and each enemy is one mesh, so draw calls stay
low. Fredoka / Baloo 2 UI in a cream-and-ink sticker style.
**Audio**: WebAudio only after a gesture; layered SFX (combo-pitched hits, chain-pitched dew, telegraph blips, clinks,
slams, roar) and a generative 8-bar tune whose drums fade in with danger; faster minor boss theme; mute button + M.
**Lifecycle / platform**: dt-clamped sub-stepped sim, pause (button, Esc/P, blur/hidden), clean restart, resize-safe
camera that pulls back in portrait, touch stick + SWING/ROLL buttons with safe-area insets, mouse (click swing,
right-click roll), reduced-motion handling, metadata, no external requests.

## Test results
- **Automated-gameplay** (`node tools/run-tests.js little-hero-adventure`): pass. Real keys for walk/swing/roll/pause;
  an input-only bot then kills a thornling, collects dew, clears two ambush waves to wake a bloom (+heart, best
  persisted), is defeated by real enemy attacks when it stops defending, continues, restarts via the pause menu,
  verifies the boss's armour, beats the Bramble King with dodges and daze-window hits, and starts NG+.
  The win leg uses the `setup` hook to skip the three shrines (documented in the test).
- **Automated-technical** (`node tools/smoke.js little-hero-adventure`): pass, no errors (low-fps warning only:
  software WebGL, 6–8 fps headless).
- **Visual inspection**: title, play, ambush, bloom, gate, boss, end card looked at in portrait / landscape / desktop.
- **Subjective playtest**: informed judgement from code and bot-driven play, not a human playtest. A perfect-reaction
  bot wakes all three blooms in ~70 s and beats the boss in ~55 s; a human should take roughly 4–6 minutes.

## Remaining issues
- Difficulty and audio mix are untested by human hands/ears; the bot's reflexes say little about how hard it feels.
- Tall toadstool caps can hide the hero when standing directly behind them (no occlusion fade).
- Real-device frame rate not measured (headless is software-rendered); one 1024 shadow map + ~100 draw calls.
- Enemy variety is three types plus the boss; no map/minimap (the chevron and the paths carry navigation).
- The boss faces away from the camera when the hero is north of him.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Clear loop (explore → ambush → bloom → boss) with readable fights; fun judged from bot play only |
| Mechanical depth | 7 | Combo, roll, interrupt, deflect, Whirl, armour windows; three enemy types is modest |
| Game feel | 7 | Hit-stop, knockback, flashes, buffered inputs, aim assist; tuned by reading, not by hand |
| Visual identity | 7 | Thimble-helmed mouse and toy-garden palette are distinctive; some decor (ferns) is rough |
| Animation quality | 6 | Procedural run/swing/roll, squash-stretch states, bloom opening; no blended limb animation |
| Audio quality | 6 | Informative layered SFX and reactive music, never heard by a human |
| Controls | 7 | Analog 360° on stick/keys, buffering, generous arcs; touch layout checked only in screenshots |
| Onboarding | 7 | 3-tile how-to, contextual hints, objective line and chevron; armour hint appears on first clink |
| Replayability | 6 | Score chase, free shrine order, hidden buttons, NG+; the map itself is fixed |
| Performance | 7 | Merged/instanced geometry, pooled particles and telegraphs, adaptive fallback (drops shadow pass + pixel ratio after 3 s below ~25 fps); unmeasured on hardware |
| Technical robustness | 8 | Pause/blur, restart, continue, resize, dt sub-steps, zero console errors in test + smoke |
| Overall polish | 7 | Title → play → end → retry is seamless; a few rough edges listed above |

## Next recommended action
Human playtest on a phone for difficulty, stick feel and audio mix; then add occlusion fading for toadstools and a
fourth enemy (a shielded beetle that must be flanked) to deepen the mid-game.
