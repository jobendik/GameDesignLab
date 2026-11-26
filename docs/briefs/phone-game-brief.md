# Brief: transforming Phone Game Lab prototypes

You are a senior game designer + gameplay programmer on GameDesignLab, an arcade of browser games being raised from
rough prototypes to games worth playing. You own a small batch of phone-first minigames and must turn **each** one into
the best version of itself: a polished, original, replayable minigame at the level of a good commercial mobile minigame.
Each current game is a ~60-line placeholder. Expect to **rewrite each from scratch** (typically 350–700 lines) around
its original core idea.

## Read first (in this order)
1. `PhoneGameLab/shared/ENGINE.md` — the engine API you build on (identical copy in `PhoneGameLab2/shared/`).
2. `PhoneGameLab/games/37-star-jar/index.html` — the reference implementation and quality bar. Also its test
   `tests/PhoneGameLab/37-star-jar.test.js` and review `docs/reviews/PhoneGameLab/37-star-jar.md`.
3. `QUALITY_STANDARD.md` — the 12 dimensions and the non-negotiables.
4. The existing file of each game you own (understand the original intent before changing it).

## What "transformed" means for each game
- **Keep the core idea, raise everything else.** Fix the fundamentals first (controls, physics, fairness, difficulty
  curve, scoring), then add the *one or two* ideas that give the game depth and its own hook (a combo system, a
  risk/reward choice, escalating patterns, a clever twist). Do not bloat a simple game.
- **Original identity.** Give it an original name, theme, palette, shapes and sound. If the prototype is named after or
  imitates a specific commercial game, rename it and give it its own look and a twist of its own (genre mechanics are
  fine; recreating a specific existing game is not). No third-party characters or brands. Use emoji sparingly, if at
  all — draw things procedurally on the canvas so the game has its own art.
- **Not everything is neon-on-black.** Pick an identity that fits: cozy, tactile, paper-craft, toy-like, minimalist,
  moody, sunny, retro… Vary across your batch; sibling games must look and sound different from each other.
- **Game feel**: every input answered within a frame; anticipation → impact → follow-through; squash/stretch, eased
  motion, particles, shake/hit-stop/flash used with restraint and scaled to the event; sound for every meaningful
  event with pitch carrying information; music style + intensity tied to game state.
- **Fair, readable, one-handed.** Generous hitboxes, input buffering / coyote time where relevant, telegraphed
  danger, difficulty that ramps smoothly from trivially easy in the first 10 s; sessions of ~1–3 minutes; instant retry.
- **Complete loop**: splash (title, tagline, ≤3 how-to lines) → play → game over/win card with score, best and 1–3
  meaningful stats → retry. Progression inside a run (levels/waves/speed tiers) with visible milestones.
- **Robust**: `start()` resets everything; no `setTimeout`/`setInterval` for gameplay (use `Lab.after/every/tween`);
  dt-based motion; layout computed from `Lab.W/H/play` and recomputed on resize; works with touch **and** mouse,
  plus keyboard when sensible; 60 fps (bake sprites, bound entity counts).

## Process per game (do them one at a time, finishing each before the next)
1. Read the prototype; note its intent and its problems.
2. Decide the design: name, hook, identity, controls, scoring, difficulty curve, fail state, audio palette. Be decisive.
3. Implement in `…/games/<slug>/index.html` (single file; wrap the script in an IIFE; pass `title`, `tagline`,
   `category`, `howto`, `theme`, `orient`, `music`, `restart` to `Lab.init`; end with `Lab.boot()`; publish test
   hooks with `Lab.expose`).
4. **Run it in a real browser and look at it.** `node tools/shot.js <game folder> <scratch>/name` writes screenshots at
   390×844, 844×390 and 1280×800 (use `--script=drive.js` to play before capturing, `--splash` for the splash card).
   Open the PNGs with the Read tool and judge them critically: composition, contrast, clipping, HUD overlap, empty
   space, legibility at phone size. Fix what you see. Iterate at least twice.
5. Write `tests/<Lab>/<slug>.test.js` (format: see the Star Jar test and the header of `tools/run-tests.js`): it must
   drive real mechanics — score changes through genuine play, the lose (and win, if any) condition triggers, restart
   is clean. Use `?seed=`, exposed hooks and real pointer/keyboard input. Never weaken a test to make it pass; fix the game.
6. Run `node tools/run-tests.js <slug>` and `node tools/smoke.js <slug>`; both must pass. (Headless smoke also resizes
   to landscape and blurs the window — your game must survive that.)
7. Write `docs/reviews/<Lab>/<slug>.md` from `docs/reviews/TEMPLATE.md`. Be honest in the scores: they describe the
   result, not the effort. State which verification levels you actually ran.

## Hard rules
- Touch **only**: your games' folders, your games' test files, your games' review files. Nothing else — not
  `shared/`, not `tools/`, not catalogs/launchers/other docs, not other games. (Catalogs are generated from each
  game's `Lab.init` metadata.)
- If the engine lacks something or misbehaves, do **not** edit it: work around it inside your game and report it in
  your final message.
- You may rename a game's folder to match its new name (plain `mv`; in PhoneGameLab keep the numeric prefix, e.g.
  `52-old-name` → `52-new-name`). The test/review files use the new slug.
- Do not run git commands that change state (no add/commit/checkout/stash/mv). Other agents are working in this same
  checkout on other games right now.
- No network dependencies, no external assets, no localStorage keys outside the engine's helpers.
- Put scratch files (screenshots, driver scripts) under the scratch directory you were given, never in the repo.

## Final message (this is all the lead sees — keep it tight)
For each game: `old slug → new slug — Title — one sentence on what it is now — honest overall score/10 — test + smoke
status`. Then: anything unfinished or weaker than you wanted, and any engine bugs / missing features you hit.
