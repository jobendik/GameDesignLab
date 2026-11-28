---
id: games/bounce-dungeon
title: Bounce Dungeon
was: Bounce Dungeon — Improved Prototype
status: transformed
baseline: 4
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
A ball hero bounces around a dungeon room under gravity. One tap launches it upward and flips its horizontal direction,
with a dotted preview of the launch. Hitting slimes and bats while "spinning" (just after a tap) or stomping them kills
them; when the room is empty a portal opens; touching it offers three stat upgrades (bounce +12 %, magnet, +1 heart …).
Endless rooms, three hearts, coins as score, meta "best room" in localStorage.

## Baseline assessment
Played in headless Chromium at 390×844 (`bd-base-*.png` in the scratch dir). It ran and the preview arc was a good idea,
but: the "timing quality" (PERFECT/GOOD/OK/WEAK) came from a hidden `sin(t)` oscillator, so it was random to the
player; enemies had no attacks of their own — damage came from touching them at the wrong moment, which read as
arbitrary; the nine upgrades were flat percentages with no interactions; rooms never changed beyond counts; no boss, no
run arc, no end. No pause, no mute, no seed, no `gdl:best`, Norwegian rotate hint, system font, letterboxed 360×640 in
landscape. And `games/spire.html` was the same game with a different skin. Baseline 4.

## Weaknesses identified
1. The skill element (timing) was noise; the attack rule (spin window) was invisible.
2. No enemy behaviour worth reading; no telegraphs; contact damage felt unfair.
3. Upgrades without synergy, no build identity, no run arc or finale.
4. Identical to its sibling — no reason to exist twice in the arcade.
5. Missing every lifecycle/convention piece.

## Creative opportunities
Keep the one-tap "kick and turn around" ball and the honest preview arc, and make **bouncing itself the weapon**: every
wall/ceiling/crystal bounce charges the ball and a hit spends the charge, so the room's geometry becomes the attack
(bank shots). Hitting from above doubles it. Then give it a real roguelite structure: floors, bosses, relic tags.
**Difference from Spire (`games/spire.html`, now "Belfry Bounce"), stated plainly:** Bounce Dungeon is a *room-based combat
crawler* — a fixed arena, enemies with telegraphed attacks, bank-shot damage, a relic draft after every room and a boss
per floor; the verb is "kick + turn" and the tension is *aim*. Belfry Bounce is a *vertical ascent* — the camera climbs a
tower, the verb is "leap to the other wall on the beat", nothing is fought, and the tension is *rhythm and route*. Warm
torch-lit stone, Cinzel + Baloo vs. cold moonlit belfry, Bungee + Chakra Petch.

## Planned improvements
Charge/bank damage; PERFECT tied to bounce timing; 7 enemy types + 4 bosses with red telegraphs; 4 floors × (3 rooms +
boss); 19 relics with 5 tags and 3-piece set bonuses; meta unlocks by banked gold; daily seed; juggle multiplier;
lifecycle and conventions; adaptive room shape for landscape.

## Implemented improvements
- **Rewrite** (single file, ~600 dense lines, no dependencies), fixed 120 Hz step, dt-clamped, seeded `mulberry32`
  gameplay RNG (cosmetic particles use `Math.random`).
- **Verb**: tap = kick up and turn around (input queued, applied at the next step). A kick within 0.14 s after *any*
  bounce is **PERFECT**: 14 % higher and +1 charge; a gold ring around the ball shows the window, and the preview arc turns
  gold while it is open. The arc simulates the exact kick including wall reflections.
- **Bank shots**: walls, ceiling, crystals and knight shields add charge (pips around the ball, ball colour warms, full
  charge glows magenta); a hit deals `1 + charge` (×2 when landing on a foe from above = **CRUSH**, ×2 on stunned bosses)
  and spends the charge. Consecutive hits without touching the floor build a **juggle** multiplier for score.
- **Enemies** (each attack telegraphed in red for 0.55–1 s): Slime (bristles spikes), Bat (red aim line → dive), Skull
  Caster (charging orb + aim line → bolt), Powder Beetle (harmless, but explodes 0.8 s after death — a blast that also
  hurts foes), Shield Knight (shield arc tracks your side; hit it from above/behind; red arrow → floor dash), Splitter
  (splits into slimelings). Elites (gold ring, ×1.6 HP) from floor 3. Floor spikes from floor 2.
- **Bosses**: Gel King (crouch + landing marker → leap → two floor shockwaves; bristles in phase 2; summons), Bone
  Warden (rotating shield arc you bank off; 3/5-bolt fans with aim lines), Brood Mother (aim line → dive into a wall →
  stunned and WEAK ×2; summons bats), Dungeon Heart (orbiting stones that act as crystals; pulse rings with a
  marked safe gap; bolt spirals in phase 2; summons).
- **Run arc**: 4 floors with their own palette and name, 3 rooms + boss each (bots with perfect survival clear a run in
  3–6.5 min; real runs with deaths/learning are longer). Victory bonus for hearts left.
- **Relic drafts** after every room: 3 choices weighted toward tags you already own, or MEND (+1 heart / full heal after
  a boss / 15 gold). 19 relics over 5 tags (BANK, CRUSH, SPARK, EMBER, WARD); holding 3 of a tag activates a set bonus
  (e.g. RICOCHET: hits only halve charge; STORMCALLER: sparks jump twice). Cards show "BANK 2/3" synergy notes.
- **Meta**: banked gold unlocks 9 more relics (60 → 750 gold); best floor, conquests, relics x/19 on the menu; a
  **daily dungeon** (date-seeded) with its own best.
- **Feel**: hit-stop 20–110 ms and shake scaled to damage, particle counts scaled to damage, squash/stretch along
  velocity, CRUSH rebound, slow-mo on boss death and on your death, damage numbers sized by damage.
- **Audio** (WebAudio, after first gesture): bank bounces climb a scale with charge, hits climb with the juggle, coins
  climb within a room, distinct clang/zap/boom/warn; a D-minor drum-and-bass loop that thickens with live enemies and
  speeds up for bosses. Mute button + M.
- **Onboarding**: attract demo behind the menu; three short prompts in the first room (kick → bank first → crush) and a
  "RED = an attack is coming" prompt in room 2, each disappearing when done.
- **Conventions**: vendored fonts (Cinzel + Baloo 2); DOM cards with opaque backing (canvas HUD hidden behind them);
  pause button + Esc/P + auto-pause on blur/hidden; 44 px targets; portrait 360×560 rooms, landscape/desktop 600×400
  rooms with the HUD in the side margin; `prefers-reduced-motion` disables shake; `gdl:best:games/bounce-dungeon`;
  `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`; `window.__gdl` (`state`, `manual`, `advance`, `tap`, `pick`,
  `cheat`, `goto`, `enemy`).

## Test results
- **Automated-technical**: `node tools/smoke.js games/bounce-dungeon` → pass (61 fps headless).
- **Automated-gameplay**: `node tools/run-tests.js bounce-dungeon` → pass, three consecutive runs (≈3 s each, manual
  stepping). Real tap on DESCEND; real touch tap kicks (direction flips, vy ≈ −500); Space right after a bounce is PERFECT
  (+1 charge, higher); a wall bounce adds charge; a charged hit deals exactly 1 + charge (×2 if CRUSH) and spends it;
  clearing room 1 opens the 3-relic draft, a real tap picks one and room 2 starts; every attack state is entered
  straight from a telegraph state; pause/resume/mute; the Gel King telegraphs → leaps → two floor shockwaves; felling it
  shows BOSS TREASURE and key 4 = MEND FULLY → floor 2; never kicking ends the run (card, cause with floor, stored best,
  banked gold); tap-anywhere restart reproduces the seeded first room; pause → MENU → DAILY DUNGEON runs on today's seed.
  (`goto` is used to jump to the boss room; boss HP is lowered by the hook to finish it quickly.)
- **Visual inspection**: menu, draft, run-over, rooms on floors 1–4 incl. all four bosses, at portrait / landscape /
  desktop, opened and judged.
- **Balance bots** (scratch): an aiming bot that uses the same preview-arc logic as a player clears the full run with
  infinite hearts in 166–401 s; a dodge-only bot without god mode dies on floor 1–2; a bot that never taps still
  clears early rooms slowly (floor 1 is deliberately gentle).
- **Subjective playtest**: informed judgement from code, bots and scripted screenshots only — no human hands.

## Remaining issues
- Damage taken is high for players who do not read telegraphs; whether 3 hearts + MEND is the right budget needs humans.
- Reaching high fliers requires chaining kicks at the arc's apex; bots needed an anti-stall (fliers sink after 30 s in a
  room). A human may find some rooms slow; untested.
- Passive bouncing can kill floor walkers on floor 1 — intended as gentle onboarding, but it lowers early tension.
- Art is code-drawn and readable but simple (slimes are domes, knights are blocks); no animation frames beyond squash,
  flaps and blinks. Audio not ear-checked.
- No post-victory endless mode.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Immediate one-tap bounce; bank-shot aiming gives each hit intent; bosses are distinct set pieces |
| Mechanical depth | 8 | Charge vs. spend, CRUSH angles, PERFECT rhythm, shields as charge sources, beetle blasts, 19 relics with set bonuses |
| Game feel | 7 | Damage-scaled hit-stop/shake/particles, squash, slow-mo; tuned by reasoning, not by hand |
| Visual identity | 7 | Torch-lit brick rooms with per-floor palettes, warm ball vs. red danger language; simple shapes |
| Animation quality | 6 | Squash/stretch, flapping, spikes growing, stun stars, pulsing heart; enemies are mostly static silhouettes |
| Audio quality | 6 | Charge/juggle/coin ladders, layered hits, adaptive loop; not ear-checked |
| Controls | 8 | One tap everywhere, honest preview arc, PERFECT window after every bounce, 44 px UI |
| Onboarding | 7 | Demo, 3-line how-to, four contextual prompts; boss mechanics learned by dying |
| Replayability | 8 | Seeded rooms, relic builds/sets, unlocks, daily dungeon, score chase |
| Performance | 9 | Cached background and glow sprites, capped particles/bolts; 61 fps headless |
| Technical robustness | 8 | Fixed-step, pause/blur/resize safe, deterministic test incl. restart; room shape fixed until next room on rotate |
| Overall polish | 7 | Menu → run → draft → boss → card → retry seamless; some art still programmer-grade |

## Next recommended action
Human playtest of hearts budget and boss HP; then add one more animation pass (enemy walk cycles, hit recoil) and an
endless "deeper" mode after the Dungeon Heart for players who conquer it.
