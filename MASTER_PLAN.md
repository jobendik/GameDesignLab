# Master Plan — GameDesignLab evolution

Goal: turn a pile of experimental prototypes into an arcade of games worth playing — every game the best version of
itself, on a launcher that feels like a product. This file is the strategy; `PROGRESS.md` is the live state;
`GAME_INVENTORY.md` / `GAME_REVIEWS.md` are generated per-game truth; `QUALITY_STANDARD.md` is the bar.

## Inventory (discovered from the filesystem, never hardcoded)
`node tools/discover.js` → 65 standalone games (`games/`), 70 phone minigames (`PhoneGameLab/`), 80 phone minigames
(`PhoneGameLab2/`, "Pocket Pals"), 2 archived superseded variants (`archive/`). 215 playable.

## Diagnosis at baseline (see `docs/baseline/`)
- **Phone collections (150 games)**: ~60-line placeholders on a 180-line shared helper. Flat shapes, one beep, no
  onboarding, no high scores, `setTimeout` leaks, two games crashed on load (`let top`). Many named after / modelled on
  commercial games. Effectively 1–2/10 each — but each holds a valid core idea.
- **Standalone games (65)**: far more developed (500–2,300 lines) but uneven: desktop-only controls, CDN
  dependencies (Tailwind, Google Fonts, three/matter/phaser from CDNs, an ad SDK, React+Babel in one), inconsistent
  lifecycle (pause/restart/resize), several borrowing commercial names (Zelda, Teyvat, Krunker, Last War), duplicates
  under odd file names, a launcher with a hand-maintained list that had drifted from the files.
- **No tests, no tooling, no shared feel/audio infrastructure.**

## Strategy
1. **Foundation first** (done): restructure, vendor every dependency, browser test tooling, a real shared phone
   engine (`shared/core.js` v2 — backward compatible), a mascot system for Pocket Pals, generated catalogs/docs.
2. **One gold-standard reference game** (done: Star Jar) that proves the engine and sets the bar.
3. **Transform every game individually, in parallel batches.** Each batch is owned by one agent that follows a written
   brief (`docs/briefs/`), plays the game in a real browser, redesigns, implements, looks at screenshots, writes a
   gameplay test and an honest review. Batches own disjoint files; generated catalogs avoid merge conflicts.
   The lead (main session) verifies every batch (full smoke + gameplay tests + contact-sheet inspection) before committing.
4. **The arcade** (`index.html` + `play.html` + lab launchers): data-driven from generated catalogs, real thumbnails,
   search/filters/favorites/recent/bests.
5. **Revisit**: games scoring < 8 in `GAME_REVIEWS.md` get a second pass; techniques discovered later flow back.

## Order of work
| Phase | Scope | Why this order |
|---|---|---|
| 0 | Foundation, tooling, engine v2, reference game | Everything else depends on it |
| 1 | Phone Game Lab 01–70 (waves of ~8 agents × 4 games) | Weakest games, biggest lift per unit of work, validates the engine |
| 2 | Arcade launcher + player shell (parallel with 1) | The front door |
| 3 | Pocket Pals 80 games (after `pals.js`) | Same pipeline + mascots; must differ from Phase 1 siblings |
| 4 | Standalone games (1–2 per agent; biggest solo) | Largest, riskiest edits — benefit from lessons of 1–3 |
| 5 | Second passes on everything < 8; cross-cutting polish; human-playtest feedback | Depth over breadth |

## Decisions (and why)
- **Standalone games moved to `games/` with kebab-case names**; two exact superseded duplicates moved to `archive/`.
  Nothing deleted; history preserved with `git mv`. Old root URLs break — accepted for a coherent structure.
- **Libraries and fonts vendored** (`vendor/`): CDNs made games fragile/offline-hostile and untestable in CI.
- **Phone engine stays one small script** copied into each lab's `shared/` (labs remain independently hostable);
  `tools/sync-shared.js` keeps the copies identical. No build step, no framework.
- **Standalone games stay single self-contained files** with their own tech; no forced common framework or style.
- **Catalogs, inventory and review index are generated** from the games' own metadata and per-game review files —
  hand-maintained lists are what drifted before.
- **Originality**: anything named after or imitating a specific commercial game gets its own name, fiction and look
  (genre mechanics stay). Phone Game Lab 2's borrowed virtual-pet fiction is replaced by the original Pocket Pals cast.
- **Honest scoring**: reviews separate automated verification from subjective judgement, and nobody here is a human
  playtester. Scores above 8 should be treated as hypotheses until a person plays.

## How to resume in a new session
1. Read `PROGRESS.md` (state + exact next action), then this file.
2. `node tools/discover.js` · `node tools/smoke.js` (≈10–15 min for everything; filter by substring) ·
   `node tools/run-tests.js` · `node tools/sync-shared.js --check` · `node tools/build-catalog.js --check`.
3. Pick the next batch from `GAME_INVENTORY.md` (status `baseline`), brief agents with the matching file in
   `docs/briefs/`, verify, regenerate (`build-catalog`, `thumbs`, `build-docs`), commit.
