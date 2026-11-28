---
id: games/neon-galaxy
title: "Neon Galaxy: Ore Run"
was: "Neon Galaxy .io"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A Norwegian/English space ".io demo" on the Tailwind CDN: a neon outline ship flies toward the mouse, click/touch to
shoot, 50 grey wireframe asteroids split and drop yellow XP diamonds, five red enemy ships chase you when you are
within 800 units, levelling up adds a spread shot and heals. Death is an `alert("GAME OVER")` that resets the stats.
The kernel worth keeping: **a neon vector ship in an asteroid field, shooting rocks for loot while rival ships
interfere.**

## Baseline assessment
A bare prototype (2/10). With the CDN blocked, the start screen is unstyled and both control hints render on top
of each other. The asteroids spawn 500+ units away, so the first screen is an empty grid with a ship on it. The
world edge is a red square that clamps you. Enemies hover and shoot when they face you, with no other behaviour.
Health bars rotate with the ships, every touch also counts as a shot, there is no structure or goal beyond levelling
up, game over is a blocking `alert()`, and there is no audio, pause, best score or real touch layout.

## Weaknesses identified
1. No goal, no session, no end: XP and levels mean nothing.
2. Shooting rocks for diamonds that fly into you is the whole loop: no decisions.
3. Enemies are turrets on wheels; nothing to read or outplay.
4. Broken presentation (CDN, overlapping hints, alert), no touch design, no audio, frame-dependent timers.

## Creative opportunities
The lead's brief: make this the **ship** arena of the pair, unlike Cosmic Devourer's eat-and-grow. The idea: a
haul-and-bank salvage run. Ore does not go into a number; it hangs off your ship on a glowing tether. The tether
makes you heavier and longer, rivals can shoot it loose, and it only counts once you drag it into the Forge.
Carry-and-bank gives every trip a risk/reward choice, and the tether is a strong visual hook. Sectors with
quotas and an upgrade between each give the run a shape.

## Planned improvements
Rewrite: fixed-step sim, circular sector with a central Forge, auto-turret + pulse, tether physics, splitting
asteroids with rich/golden veins, three rival temperaments that mine, loot, bank and raid, five sectors with
quotas and upgrade picks, neon look, music and SFX, touch/mouse/keyboard, minimap and edge arrows, spatial hash,
lifecycle, test, review.

## Implemented improvements
- **Core loop:** your turret fires automatically (rocks by default, any ship that is hunting you or shot you,
  and pirates), so the skill is where you fly. Cracked rocks split large → medium → small and spill ore: blue (1),
  magenta from veined rocks (2), gold from golden rocks (3). Ore is pulled in by a magnet and joins the tether as a
  chain of crystals. Every link adds weight (less top speed and acceleration) and the camera zooms out as the chain
  grows. Fly into the Forge and the tether zips in link by link, worth 10 points per ore value. Ore you have not banked
  when the sector horn blows is lost.
- **The tether is a target:** a hostile bullet that hits a link cuts the chain there and the cut ore drifts loose
  for anyone to grab (you hear a falling glass chime and see "TETHER CUT −n"). Your shots do the same to pirates and to
  anyone you are fighting.
- **Pulse** (second finger, PULSE button, click, Space/E/Shift; 5 s cooldown): a shockwave that shoves ships and
  rocks, deletes enemy bullets and snaps the tethers of every ship it reaches. Stealing ore is now a choice, and the
  ship you stole from turns on you.
- **Rivals:** miners (amber) work rocks and bank when greedy enough, scavengers (lime) chase loose ore and cut chains,
  pirates (red) hunt the longest tether in range, you included, circle it and fire at it. Bots react on a delay,
  aim with temperament-dependent error, retaliate when hit, bank early when the horn nears and flee to the Forge
  when damaged. Their stray fire passes through ships they are not fighting, so you are never ganked by crossfire.
  Intent sits over every ship (☠ hunting, » banking, ◆ looting, ◇ mining, + fleeing, plus tether length), and a
  pirate hunting you draws a red dashed line at you, shows a red edge arrow and a bigger minimap dot.
- **Structure:** five sectors of 70 s, quota 28 → 38 → 48 → 58 → 68 ore, 3 → 7 rivals with more pirates and
  tougher hulls. Meeting the quota early pays +50 % for surplus ore. Clearing a sector gives 100 × sector bonus and
  a choice of 3 upgrades from 9 (Twin Cannons, Overclock, Long Tether, Graphene Tether, Hull Plating, Ore Magnet,
  Capacitor, Afterburner, Railshot; stackable, capped), then 35 % hull repair. Missing the quota voids the contract,
  hull 0 wrecks the skiff, and clearing sector 5 adds a hull bonus. Kills are worth 40.
- **Readability:** HUD with score/best, sector and clock (red in the last 10 s), a quota bar that turns gold when
  met, hull and tether meters, a "banked this sector" leaderboard on wide screens, minimap (Forge, rocks, rivals),
  edge arrows to the Forge (gold while you carry ore, with distance) and to threats and loaded rivals. A red
  vignette shows when hull is critical. Contextual hints cover flying, first ore, a full tether, pirates, ten seconds
  left, low hull and a cut tether.
- **Look:** a neon vector style drawn with double strokes rather than shadowBlur: skiffs with engine flames,
  violet wireframe rocks with magenta/gold veins, glowing crystal tethers, a twin rotating hexagon Forge that flares
  when you bank, a magenta sector rim, parallax stars and soft nebulae. Saira Condensed + Rajdhani.
- **Audio:** an engine hum (pitch = speed, filter = throttle), a synth bass/hat loop that speeds up in the last 15 s,
  laser chirps (yours brighter), rock ticks and cracks sized by tier, a pickup note that climbs the scale as the
  tether fills, banking arpeggio, quota chord, tether-cut chime, hull thud, pulse whoomp, explosions, sector horn.
  Mute button and M.
- **Controls:** mouse steers toward the pointer (speed by distance) and click pulses. Touch: drag anywhere for a
  floating stick; tap, second finger or the PULSE button pulses. WASD/arrows, Space/E/Shift, 1/2/3 to pick upgrades,
  P/Esc, M. Focus works in the arcade iframe.
- **Tech:** Tailwind CDN removed (hand-written CSS), Norwegian strings replaced. Fixed 60 Hz step with dt clamp;
  a uniform-grid spatial hash for rocks, ships and tether links against up to 420 pooled bullets; pooled ore and
  particles; 0.06 ms per step. `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`; `window.__gdl` (state, advance,
  manual, toScreen, looseOre); best in `gdl:best:games/neon-galaxy`. Cards are opaque and hide the HUD behind them.

## Test results
- **Automated-gameplay** (`node tools/run-tests.js neon-galaxy`, three consecutive passes, ~26 s): DEPLOY by tap →
  a CDP thumb-stick drag flies the skiff → flying to rocks lets the auto-turret crack them and 4+ ore rides the
  tether → flying into the Forge banks it (score = ore × 10 + wrecks × 40) → a second finger fires the pulse → W
  flies, M mutes, P pauses (clock frozen in real time), resume → the stick pilot meets the sector 1 quota (43/28)
  → the horn opens the upgrade card, and the score adds the sector and surplus bonus exactly → tapping an upgrade
  starts sector 2 with it applied and a pirate present → idling ends the contract (quota void) → end card, best
  stored → NEW CONTRACT resets everything. Deterministic under `?seed=5`.
- **Automated-technical** `node tools/smoke.js games/neon-galaxy` → pass.
- **Visual inspection** at 390×844, 844×390, 1280×800: menu card, early sector, tether + rivals in landscape, upgrade card.
- **Balance probe:** a scripted pilot that never pulses or dodges reaches sector 4–5 and dies there to pirates.
  Sector 1 is generous (60–80 ore against 28), and from sector 3 the quota and the pirates press.
- **Subjective playtest:** informed judgement from scripted play and screenshots, not a human playtest.

## Remaining issues
- Combat is automatic: the depth is in routing, banking timing and pulse use, not aiming. Some players will want
  manual aim (for example hold to aim at the pointer).
- Upgrades are stat bumps; none changes how you play the way a new verb would.
- The attract mode behind the menu is mostly empty space at that zoom.
- Bots never use the Forge as a choke point (pirates could camp it), which would add late-sector tension.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Crack, collect, haul, bank in the first 20 s; every trip asks "one more rock or bank now?" with pirates as pressure |
| Mechanical depth | 7 | Tether weight vs. capacity, chain cutting both ways, pulse theft with retaliation, quota surplus, nine stacking upgrades |
| Game feel | 7 | Snappy thrust, zipping bank, cracking rocks with shake, tether sway, pulse ring; auto-fire lowers the moment-to-moment punch |
| Visual identity | 7 | Clean neon vector look with the glowing tether and hex Forge as the signature; still a familiar vector-space palette |
| Animation quality | 6 | Rope physics, flames, Forge flare, rotating rocks; card pops; ship hits are a white flash rather than a reaction |
| Audio quality | 7 | Pickup scale that fills with the tether, banking arpeggio, cut chime and tempo-up music carry information |
| Controls | 7 | Floating stick, second finger/button, mouse, keys all verified; auto-turret keeps phone play to one thumb |
| Onboarding | 7 | Three-line card, Forge arrow from second one, hints for every new situation; quota bar makes the goal obvious |
| Replayability | 7 | Seeded sectors, random upgrade offers, rising quotas, score chase; five sectors is a 6-minute run |
| Performance | 8 | Spatial hash + pools, 0.06 ms per step, ~55–60 fps in software rendering |
| Technical robustness | 8 | Fixed step, pause/blur/visibility, clean restart, deterministic tests, no console errors, no CDN |
| Overall polish | 7 | Menu → sectors → upgrade → end → again is seamless; menu backdrop and upgrade variety are the thin spots |

## Next recommended action
Add one or two upgrades that change verbs (for example a tractor beam that drags loose ore from range, or a decoy
that pirates chase), and let pirates camp the Forge in sectors 4–5. Then playtest whether sector 1 should be shorter.

## How it differs from Cosmic Devourer
Cosmic Devourer is an eat-to-grow gravity game: you are the mass, size is power and the threat is being swallowed.
Neon Galaxy is a ship game with a fixed-size skiff: you shoot, haul and bank. Your "size" is cargo you can lose
and must deliver, the threat is losing your haul, and progress comes from sectors, quotas and upgrades.
