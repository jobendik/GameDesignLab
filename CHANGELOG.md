# Changelog

Newest first. One entry per coherent, verified batch of work.

## 2026-11-27 — Phone Game Lab complete (70/70) + 12 standalone games + first Pocket Pals game
- **Phone Game Lab 33–70** rebuilt (38 more games; the collection is now entirely on engine v2): Snug, Antiquity,
  Teeter Torte, Plumb Line, Tumblepeg, Blacktop Buzzer, Brass Pocket, Postage Stamp, Bamboo Span, Plumpling, Haberdash,
  Shoo!, Live Wires, Fountain Court, Decant, Tall Order, Bolt Hole, Slidescape, Tideglass, Plot Twist, Hedgeroll,
  Glasswright, Shuteye Street, Soundings, Alphabroth, Purlwise, Petal Count, Lantern Tail, Ribbon Rodeo, Big Drip,
  Last Slice, Pocket Reef, Potting Shed, Lantern Noodles, Chute First, Punchline, Coconut Groove — plus 14 Sparkmoth,
  15 Facet, 16 Pin Whirl, 23 Pogo Peak, 24 Spindle Drop from the first wave. All 70 pass smoke; every game has a
  gameplay test and a review. Before/after contact sheets: `docs/baseline/phone-game-lab.jpg` → `docs/after/phone-game-lab.jpg`.
- **Standalone games rebuilt** (12): Neon Hagen, Sprouty's Garden, Static Bloom (was "Neon Krunker"), Breach Vector,
  Thimble & the Bramble King (was "Zelda Lite"), Star Trail Adventure (was a plumber-platformer clone), Furniture Forts,
  Power Wash Royale, Puppet Panic, Physics Charades — Pose or Splat, Mystic Potion Sort, Unicorn Magic Sort. All
  self-contained (no CDNs, fonts vendored, ad SDK removed), with touch controls, tests and reviews.
- **Pocket Pals**: first game on the mascot cast, Bedtime Stacks (was "2048").
- **Bugs found by verification**: Tideglass slow-drag soft drop was speed-gated (fixed in the game); Scribble Siege
  and Tumblepeg had racy/off-screen test steps (fixed in the tests, not weakened). A full-suite re-run found no other
  flaky tests.
- **Engine**: releases delivered while paused, `Lab.fmt` up to Qa, `Lab.audio.now()/latency`, keys readable inside
  `onKey`, count-up rounding, pointer type, docs for level puzzles / test timing / baked backgrounds.

## 2026-11-26 — Arcade launcher + Phone Game Lab wave 1 (29 games)
- **Arcade** (`index.html`): data-driven from the generated catalog — featured by review score, continue playing,
  favorites, instant search, genre / collection / control filters, sorts, URL-hash state, "Surprise me", keyboard
  navigation, real gameplay thumbnails with seeded placeholders. **Player shell** (`play.html`) hosts standalone
  games in an iframe with loading state, back / favorite / fullscreen / restart. **Collection launchers** for
  Phone Game Lab and Pocket Pals (self-contained). Nine browser tests.
- **Phone Game Lab 01–13, 17–22, 25–32** rebuilt from ~50-line placeholders into original games on engine v2, each
  with its own name and identity, a gameplay test and a scored review (baseline 1–2 → 7–8, scripted-play judgement):
  Splodge, Crab Bop, Flinch, Corkslinger, Misfired, Odd Mood, Beetle Box, Swindle, Tea Break, Bramble Drop,
  Scribble Siege, Cold Snap, Suds Patrol, Windfletch, One Breath, Tin Topple, Frostfoot, Paper Rapids, Sundown Sprint,
  Goat Up, Jelly Drift, Fizzwhiz, Hollowlight, Tiltwood, Wobblewire, Sinkstones, Inkstride (+ Star Jar).
- **Engine additions driven by the rewrites**: sticky hints, more easings, sprite eviction by prefix, neutral run
  endings, press timestamps, sustained audio loops, music beat callback, per-call SFX volume, runtime theme changes,
  positioned toasts/banners; docs for `attract`, world-space particles and baked backgrounds.

## 2026-11-26 — Phase 0: foundation
- **Restructure**: 65 standalone games moved to `games/` with clean kebab-case names; `bouce_dungon.html` and the
  pre-fix `busy-beavers.html` archived as superseded duplicates; `MagicSort.tsx` (non-playable React source) archived;
  idea list moved to `docs/`. No game deleted.
- **Dependencies vendored**: three.js r128 + 0.160 (with post-processing addons), matter-js 0.19, phaser 3.90,
  nipplejs, and 13 open-licensed font families (`vendor/fonts/fonts.css`). Games repointed from CDNs.
- **Tooling** (`tools/`): `serve.js` (static server), `discover.js` (filesystem inventory), `smoke.js` (headless
  Chromium: load/render/input/resize/blur checks for every game), `run-tests.js` (gameplay test runner),
  `shot.js` (3-viewport screenshots), `contact-sheet.js`, `thumbs.js` (launcher thumbnails), `build-catalog.js`
  (generated catalogs), `build-docs.js` (generated inventory/review index), `sync-shared.js`.
- **Baseline captured**: `docs/baseline/` — smoke report for all 217 files (214 loaded cleanly; `NeonHagen` blank
  without CDNs, two phone games crashed on `let top`) and contact sheets of every game before changes.
- **Phone engine v2** (`PhoneGameLab/shared/core.js`, mirrored to `PhoneGameLab2/shared/`), backward compatible
  with all 150 v1 games: stage with portrait/landscape framing, safe areas and DPR budget; HUD, splash, pause
  (button/Esc/auto on blur), game-over card with score count-up, best score and stats; multitouch + keyboard input;
  dt-clamped loop with hit-stop, slow-mo, shake, flash; timers and tweens on the game clock; particles, rings,
  floating text, confetti; drawing/colour helpers and sprite cache; procedural audio (45 SFX presets, tone/noise
  synth, pentatonic combo ladder, 10-style generative music with intensity layers, persistent mute); personal bests
  and play history in `localStorage` (shared with the arcade); reduced-motion support; `?seed`/`?autostart`/`?fps`
  and `window.__lab` test hooks; bundled Fredoka typeface.
- **Pocket Pals** (`PhoneGameLab2/shared/pals.js`): six original procedural mascots with nine moods, squash,
  arms, eye-look, blinking and breathing, plus six cozy backdrops — the new identity of Phone Game Lab 2.
- **Reference game**: `PhoneGameLab/games/37-star-jar` (was `37-suika-merge`) rebuilt from scratch with a gameplay
  test and review (2 → 8).
- **Docs**: `QUALITY_STANDARD.md`, `MASTER_PLAN.md`, `PROGRESS.md`, generated `GAME_INVENTORY.md` / `GAME_REVIEWS.md`,
  briefs for parallel work in `docs/briefs/`, review template in `docs/reviews/`.
