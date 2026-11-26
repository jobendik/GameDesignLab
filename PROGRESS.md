# Progress

Live state of the project. Update at the end of every batch. (Counts: `node tools/build-docs.js` → `GAME_INVENTORY.md`.)

## State — 2026-11-26 (evening)
| Area | State |
|---|---|
| Foundation / tooling / engine v2 / mascots | ✅ done (see `CHANGELOG.md`) |
| Arcade launcher (`index.html`, `play.html`, lab launchers) | ✅ done and verified (9 tests in `tests/arcade/`) |
| Phone Game Lab (70) | 29 transformed + verified: 01–13, 17–22, 25–32, 37. In progress: 14, 23, 24. Not started: 15, 16, 33–36, 38–70 |
| Pocket Pals (80) | 0 transformed. `pals.js` + brief addendum ready. Not started |
| Standalone games (65) | 0 finished. In progress: neon-strike (rewritten, test failing), sproutys-garden (edited), neon-hagen (test only). Not started: the rest |

**Operational constraint:** the account's 5-hour usage limit has been hit three times; each time every running agent
dies mid-task (work on disk is kept, the lead commits it as "WIP checkpoint"). Run **at most ~4 agents at a time**,
give each a precise "what is on disk / what remains" resume message (SendMessage to the same agent id while this
session lives; otherwise start a fresh agent with the brief + the on-disk state), and verify + commit each batch as
it lands so nothing is lost when the limit hits.

## Batches
| Batch | Games | Status |
|---|---|---|
| PGL1-A | 01–04 | ✅ verified |
| PGL1-B | 05–08 | ✅ verified |
| PGL1-C | 09–12 | ✅ verified (agent died before its final report; lead ran tests + smoke) |
| PGL1-D | 13–16 | 13 ✅ · 14 `14-sparkmoth` rewrite on disk, no test/review · 15, 16 untouched prototypes |
| PGL1-E | 17–20 | ✅ verified |
| PGL1-F | 21–24 | 21, 22 ✅ · 23 `23-pogo-peak` test failing ("burr knocks Pip down") · 24 rewrite on disk under old slug, no test/review |
| PGL1-G | 25–28 | ✅ verified |
| PGL1-H | 29–32 | ✅ verified |
| ARCADE | launcher + player shell | ✅ verified |
| S1 | neon-hagen, sproutys-garden | neon-hagen: only a test file so far; sproutys-garden: edited, unverified, no test/review |
| S18 | neon-strike, breach-vector | neon-strike: rewritten, its test fails at "one core hit deals double damage"; breach-vector untouched |
| S19 | little-hero-adventure, star-trail-adventure | not started (agent only surveyed) |

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
1. Finish PGL1-D (14, 15, 16) and PGL1-F (23, 24); verify (`node tools/run-tests.js PhoneGameLab`, `node tools/smoke.js PhoneGameLab/`), thumbs for new slugs, `build-catalog`, `build-docs`, commit.
2. Finish S18, S1, S19 (standalone pilots). Check each through `play.html?g=games/<name>` as well as directly.
3. Phone Game Lab wave 2: 33–36 · 38–41 · 42–45 · 46–49 · 50–53 · 54–57 · 58–61 · 62–65 · 66–70.
4. Pocket Pals waves (80 games, 4 per batch) with the addendum brief; then the remaining standalone batches (list below).
5. After each collection: `node tools/thumbs.js <filter>`, prune stale thumbs, rebuild catalogs/docs, run `tests/arcade`.
6. Re-subscribe to PR activity for jobendik/GameDesignLab#5 once pushes become infrequent (it was unsubscribed to stop a push → empty-CI-event → wake loop).

## Known issues / watch list
- Headless smoke reports low fps for WebGL games (software rendering) — not a real-device signal.
- `games/neon-hagen` is blank offline (React + Babel + Tailwind from CDNs) until its transformation pass rewrites it.
- Standalone games still reference Google Fonts / Tailwind CDN / an ad SDK until their passes (listed per game in `GAME_INVENTORY.md`).
- Launcher wishes not yet provided by the catalog: `was` (old slug, to migrate favourites/recents), `orient`, real `strip` previews, proper categories for Pocket Pals (all 80 still say "Minigame" until transformed).
- Reviews repeatedly flag: no human playtest (all tuning is scripted), portrait games small in 844×390 landscape, late-game plateaus. Candidates for the second pass.
