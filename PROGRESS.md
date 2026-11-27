# Progress

Live state of the project. Update at the end of every batch. (Counts: `node tools/build-docs.js` → `GAME_INVENTORY.md`.)

## State — 2026-11-27 (morning)
| Area | State |
|---|---|
| Foundation / tooling / engine v2 / mascots | ✅ done (see `CHANGELOG.md`) |
| Arcade launcher (`index.html`, `play.html`, lab launchers) | ✅ done and verified (9 tests in `tests/arcade/`) |
| Phone Game Lab (70) | 46 verified: 01–46 (37 = Star Jar). In progress: 47, 50. Not started: 48, 49, 51–70 |
| Pocket Pals (80) | 0 transformed. `pals.js` + brief addendum ready. Not started |
| Standalone games (65) | 7 verified: neon-hagen, sproutys-garden, neon-strike (Static Bloom), breach-vector, little-hero-adventure (Thimble & the Bramble King), star-trail-adventure, furniture-forts. In progress: power-wash-royale. Not started: 57 |

**Operational constraint:** the account's 5-hour usage limit keeps getting hit (seven times so far); each time every
running agent dies mid-task (work on disk is kept; the lead commits it as "WIP checkpoint"). Run **at most 4 agents at a
time**, tell each to finish one game completely before starting the next, give each a precise "what is on disk / what
remains" resume message (SendMessage to the same agent id while this session lives; otherwise start a fresh agent
with the brief + the on-disk state), and verify + commit each batch as it lands.

## Batches
| Batch | Games | Status |
|---|---|---|
| PGL1 01–45 | 11 batches | ✅ verified |
| PGL1 46–49 | live-wires, fountain-court, water-sort, ball-sort | 46 ✅ · 47 rewrite on disk, no test/review · 48, 49 prototypes |
| PGL1 50–53 | bolt-hole, 15-puzzle, tetris, block-blast | 50 rewrite on disk, no test/review · 51–53 prototypes |
| PGL1 54–57 | maze, laser-mirror, lights-out, minesweeper | prototypes (agent has only read the brief) |
| ARCADE | launcher + player shell | ✅ verified |
| S1 | neon-hagen, sproutys-garden | ✅ verified |
| S2 | furniture-forts, power-wash-royale | furniture-forts ✅ · power-wash rewritten, no test/review |
| S18 | neon-strike, breach-vector | ✅ verified |
| S19 | little-hero-adventure, star-trail-adventure | ✅ verified |

### Planned batches (not started)
**Phone Game Lab, remaining** (brief: `docs/briefs/phone-game-brief.md`), 4 games each:
58–61 · 62–65 · 66–70 (5 games)

**Pocket Pals** (briefs: phone-game-brief + `pocket-pals-addendum.md`), 80 games alphabetical, 4 per batch (20 batches):
`ls PhoneGameLab2/games | xargs -n4`

**Standalone** (brief: `docs/briefs/standalone-game-brief.md`), related games paired so they get differentiated:
S3 physics-charades + puppet-panic · S4 mystic-potion-sort + unicorn-magic-sort ·
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
1. Finish the in-progress batches above (46–49, 50–53, 54–57, S2); verify each (`node tools/run-tests.js <slug>`,
   `node tools/smoke.js <slug>`, `node tools/thumbs.js <slug>`, look at a contact sheet), `build-catalog`, `build-docs`, commit.
2. Phone Game Lab 58–61 · 62–65 · 66–70.
3. Pocket Pals waves (80 games, 4 per batch) with the addendum brief; then the remaining standalone batches (list above).
4. After each collection: prune stale thumbs, rebuild catalogs/docs, run `node tools/run-tests.js arcade`.
5. Second pass on anything scored < 8 and on the recurring review themes (late-game plateaus, landscape-phone sizing, audio never heard by a human).
6. Re-subscribe to PR activity for jobendik/GameDesignLab#5 once pushes become infrequent (unsubscribed to stop a push → empty-CI-event → wake loop).

## Known issues / watch list
- Headless smoke reports low fps for WebGL games (software rendering) — not a real-device signal.
- `games/neon-hagen` is blank offline (React + Babel + Tailwind from CDNs) until its transformation pass rewrites it.
- Standalone games still reference Google Fonts / Tailwind CDN / an ad SDK until their passes (listed per game in `GAME_INVENTORY.md`).
- Launcher wishes not yet provided by the catalog: `was` (old slug, to migrate favourites/recents), `orient`, real `strip` previews, proper categories for Pocket Pals (all 80 still say "Minigame" until transformed).
- Reviews repeatedly flag: no human playtest (all tuning is scripted), portrait games small in 844×390 landscape, late-game plateaus. Candidates for the second pass.
