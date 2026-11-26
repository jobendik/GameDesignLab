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
