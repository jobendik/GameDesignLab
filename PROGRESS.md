# Progress

Live state of the project. Update at the end of every batch. (Counts: `node tools/build-docs.js` → `GAME_INVENTORY.md`.)

## State — 2026-11-28 (morning)
| Area | State |
|---|---|
| Foundation / tooling / engine v2 / mascots | ✅ done (see `CHANGELOG.md`) |
| Arcade launcher (`index.html`, `play.html`, lab launchers) | ✅ done and verified (9 tests in `tests/arcade/`) |
| Phone Game Lab (70) | ✅ all 70 transformed and verified |
| Pocket Pals (80) | 14 verified: bedtime-stacks, sunny-soak, ice-dunk, jampoline, stew-patch, lilypad-lunch, ramp-scamp, fish-fizz, gulp-and-float, pack-ice, pier-pressure, flicknic, cakewalk, reef-relief. In progress: sweet-circuit (renamed candy-connect, still prototype), castle-craft, cats-and-cans, pine-kick (renamed climber-tom, still prototype), connect, cupid-tom. Not started: 60 |
| Standalone games (65) | 21 verified (see `GAME_INVENTORY.md`). In progress: slithergar (rewritten, no test/review), cosmic-devourer, neon-galaxy. Not started: 41 |

**Operational constraints**
- The account's 5-hour usage limit is hit every ~40–60 minutes of 4-agent work (thirteen times so far); every running
  agent dies mid-task (work on disk is kept; the lead commits it as "WIP checkpoint").
- On 2026-11-27 the weekly limit for the original model was reached (resets 2026-12-02); work continues on another
  model. Agents started on the old model cannot be resumed until then — start fresh agents with the brief plus a
  precise "what is on disk / what remains" note instead.
- Run at most 4 agents at a time; each finishes one game completely before starting the next. Verify each new test
  3 times in a row before calling it verified; never chain a commit after `| tail` of a test run.

## Batches in flight
| Batch | Games | Status |
|---|---|---|
| PP4 | cakewalk ✅, sweet-circuit, castle-craft, cats-and-cans | fresh agent |
| PP5 | reef-relief ✅, pine-kick, connect, cupid-tom | fresh agent |
| S9 | kosmisk-slange ✅, slithergar | fresh agent finishing slithergar |
| S10 | cosmic-devourer, neon-galaxy | fresh agent |

### Planned batches (not started)
**Pocket Pals** (briefs: phone-game-brief + `pocket-pals-addendum.md`), 80 games alphabetical, 4 per batch (20 batches):
`ls PhoneGameLab2/games | xargs -n4`

**Standalone** (brief: `docs/briefs/standalone-game-brief.md`), related games paired so they get differentiated:
S7 brink-edge-rush + brink-reactor ·
S11 arcanum-pinball + pinball-wizard-3d · S12 neon-pinball-rush + neon-pin-climb · S13 bounce-dungeon + spire ·
S14 chomp-chain-rush + maze-munch-rush · S15 pitch-26 + pocket-football · S16 the-grid-war + the-global-dig ·
S17 swarm-logic + neon-survivor-overdrive · S20 painted-wilds (solo) · S21 lysarkivet (solo) · S22 neon-ash (solo) ·
S23 word-forts + exquisite-corpse · S24 tiny-detective-cafe + tiny-tactics-cards · S25 last-war-ultimate + lumberjack-idle-empire ·
S26 busy-beavers + bloom-bureau · S27 grapple-gliders + hyper-dash · S28 neon-nexus-omega + neon-runner-overdrive ·
S29 aura-rooms + the-elevator · S30 svev-miner + void-drift · S31 frequency + sonar-abyss · S32 pulsar + ricochet-brawlers ·
S33 unscrew-it + the-tower · S34 pinata-pop + lumis-luminescence

## Exact next actions
1. Finish the batches in flight; verify each (tests ×3, smoke, thumbs, look at screenshots), `build-catalog`, `build-docs`, commit.
2. Pocket Pals: 19 more batches of 4 (alphabetical: `ls PhoneGameLab2/games | xargs -n4`), prompt = phone brief +
   `pocket-pals-addendum.md` + the sibling-differentiation note (see the PP1 prompt pattern: name any finished
   Phone Game Lab sibling to differ from, require a real `category`, `kicker: "Pocket Pals"`).
3. Remaining standalone batches (list above), 2 games per agent, biggest files solo.
4. After each collection: prune stale thumbs, rebuild catalogs/docs, `node tools/run-tests.js arcade`, refresh `docs/after/` sheets.
5. Second pass on anything scored < 8 and on the recurring review themes (late-game plateaus, landscape-phone sizing,
   audio never heard by a human, bot-tuned balance).
6. Re-subscribe to PR activity for jobendik/GameDesignLab#5 once pushes become infrequent.

## Known issues / watch list
- Headless smoke reports low fps for WebGL games (software rendering) — not a real-device signal.
- `games/neon-hagen` is blank offline (React + Babel + Tailwind from CDNs) until its transformation pass rewrites it.
- Standalone games still reference Google Fonts / Tailwind CDN / an ad SDK until their passes (listed per game in `GAME_INVENTORY.md`).
- Launcher wishes not yet provided by the catalog: `was` (old slug, to migrate favourites/recents), `orient`, real `strip` previews, proper categories for Pocket Pals (all 80 still say "Minigame" until transformed).
- Reviews repeatedly flag: no human playtest (all tuning is scripted), portrait games small in 844×390 landscape, late-game plateaus. Candidates for the second pass.
