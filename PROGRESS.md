# Progress

Live state of the project. Update at the end of every batch. (Counts: `node tools/build-docs.js` → `GAME_INVENTORY.md`.)

## State — 2026-11-26
| Area | State |
|---|---|
| Foundation / tooling / engine v2 / mascots | ✅ done (see `CHANGELOG.md`) |
| Phone Game Lab (70) | 1 transformed (Star Jar). Wave 1 (games 01–32) **in progress** by 8 parallel agents |
| Pocket Pals (80) | 0 transformed. `pals.js` + brief addendum ready. Not started |
| Standalone games (65) | 0 transformed. Dependencies vendored, metadata seeded, brief ready. Not started |
| Arcade launcher (`index.html`, `play.html`, lab launchers) | **in progress** (1 agent). Old `index.html` still has stale links until it lands |

## Batches
| Batch | Games | Owner | Status |
|---|---|---|---|
| PGL1-A | 01–04 | agent | running |
| PGL1-B | 05–08 | agent | running |
| PGL1-C | 09–12 | agent | running |
| PGL1-D | 13–16 | agent | running |
| PGL1-E | 17–20 | agent | running |
| PGL1-F | 21–24 | agent | running |
| PGL1-G | 25–28 | agent | running |
| PGL1-H | 29–32 | agent | running |
| ARCADE | launcher + player shell | agent | running |
| S1 | neon-hagen, sproutys-garden | agent | running |
| S18 | neon-strike, breach-vector | agent | running |
| S19 | little-hero-adventure, star-trail-adventure | agent | running |

### Planned batches (not started)
**Phone Game Lab wave 2** (brief: `docs/briefs/phone-game-brief.md`), 4 games each:
33–36 · 38–41 · 42–45 · 46–49 · 50–53 · 54–57 · 58–61 · 62–65 · 66–70 (5 games)

**Pocket Pals** (briefs: phone-game-brief + `pocket-pals-addendum.md`), 80 games alphabetical, 4 per batch (20 batches):
`ls PhoneGameLab2/games | xargs -n4`

**Standalone** (brief: `docs/briefs/standalone-game-brief.md`), related games paired so they get differentiated:
S2 furniture-forts + power-wash-royale · S3 physics-charades + puppet-panic · S4 mystic-potion-sort + unicorn-magic-sort ·
S5 neon-core-ballstorm + star-petal-ballstorm · S6 orbit-drift-3d + orbit-drift-sling · S7 brink-edge-rush + brink-reactor ·
S8 neon-burst + chroma-frenzy · S9 kosmisk-slange + slithergar · S10 cosmic-devourer + neon-galaxy ·
S11 arcanum-pinball + pinball-wizard-3d · S12 neon-pinball-rush + neon-pin-climb · S13 bounce-dungeon + spire ·
S14 chomp-chain-rush + maze-munch-rush · S15 pitch-26 + pocket-football · S16 the-grid-war + the-global-dig ·
S17 swarm-logic + neon-survivor-overdrive · S20 painted-wilds (solo) · S21 lysarkivet (solo) · S22 neon-ash (solo) ·
S23 word-forts + exquisite-corpse · S24 tiny-detective-cafe + tiny-tactics-cards · S25 last-war-ultimate + lumberjack-idle-empire ·
S26 busy-beavers + bloom-bureau · S27 grapple-gliders + hyper-dash · S28 neon-nexus-omega + neon-runner-overdrive ·
S29 aura-rooms + the-elevator · S30 svev-miner + void-drift · S31 frequency + sonar-abyss · S32 pulsar + ricochet-brawlers ·
S33 unscrew-it + the-tower · S34 pinata-pop + lumis-luminescence

## Exact next actions
1. When wave 1 agents finish: `node tools/smoke.js PhoneGameLab/` + `node tools/run-tests.js PhoneGameLab` →
   inspect contact sheet → fix/return anything weak → `build-catalog` + `build-docs` → commit.
2. Launch wave 2: Phone Game Lab 33–70 (38 games, skip 37) in batches of 4 with `docs/briefs/phone-game-brief.md`.
3. Launch Pocket Pals waves (80 games, batches of 4) with the addendum brief.
4. Launch standalone waves (1–2 games per agent) with `docs/briefs/standalone-game-brief.md`.
5. Regenerate thumbnails (`node tools/thumbs.js`) once a collection is transformed; rebuild catalogs; verify launcher tests.

## Known issues / watch list
- Headless smoke reports low fps for WebGL games (software rendering) — not a real-device signal.
- `games/neon-hagen` is blank offline (React + Babel + Tailwind from CDNs) until its transformation pass rewrites it.
- Standalone games still reference Google Fonts / Tailwind CDN / an ad SDK until their passes (listed per game in `GAME_INVENTORY.md`).
- Engine font changed to bundled Fredoka after wave 1 started — check wave 1 games for text overflow during verification.
