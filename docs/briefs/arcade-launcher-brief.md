# Brief: the GameDesignLab arcade launcher

Build the front door of GameDesignLab: a premium, fast, browser-native arcade that showcases ~215 games
(65 standalone games + two phone-first minigame collections) without overshadowing them.

## Deliverables (you own exactly these files)
- `index.html` — the main arcade (replace the current one entirely; single self-contained file, inline CSS/JS).
- `play.html` — a thin player shell that hosts a **standalone** game (`games/*.html`) in an iframe.
- `PhoneGameLab/index.html` and `PhoneGameLab2/index.html` — each collection's own lightweight launcher.
- `tests/arcade/*.test.js` — browser tests for the launcher (see `tools/run-tests.js` header for the format; use
  `mobile:false` / a `viewport` as needed and `query:''`).
Do not touch anything else (no games, no `shared/`, no `tools/`, no catalogs, no docs). No git state changes
(no add/commit/checkout/stash). Other agents are editing games in this checkout right now.

## Data you build on (all generated — never edit, never hardcode game lists or counts)
- `catalog.js` → `window.GDL_CATALOG = { count, games: [{ id, path, collection, title, desc, genre[], controls[], n?, v2?, score?, status?, thumb?, strip? }] }`
  - `collection`: `arcade` (standalone, landscape-ish, thumbs 480×300) | `PhoneGameLab` | `PhoneGameLab2` (portrait, thumbs 300×477)
  - `score` = reviewed quality 1–10 (present only for games that have been through the transformation pass);
    `v2:true` marks phone games already rebuilt on the new engine. Use these for "featured"/"fresh" curation —
    e.g. feature the highest-scored games; never invent ratings.
  - `thumb` may be missing for some games → design a graceful procedural placeholder (seeded from the id).
  - `strip` (optional): 4 gameplay frames side by side in one JPEG → animate on hover/focus/long-press as a preview.
- `PhoneGameLab/shared/catalog.js` and `PhoneGameLab2/shared/catalog.js` → `window.LAB_GAMES = [{ cat, items: [{ n, slug, t, d, v2, score, thumb }] }]`
  (game URL = `games/<slug>/index.html`; `thumb` is relative to the lab folder).
- Player data in `localStorage` (JSON values), written by the games/engine and by you:
  - `gdl:best:<id>` number — personal best (show it on cards / detail when present)
  - `gdl:recent` array of ids, most recent first; `gdl:plays` map id → count (phone games write these themselves;
    **you** must record them for standalone games when one is launched)
  - `gdl:favs` array of ids — yours to define and maintain
- Collections have names beyond their folders: `PhoneGameLab` = "Phone Game Lab" (70 phone-first takes on classic
  genres); `PhoneGameLab2` = "Pocket Pals" (80 cozy, character-driven minigames with an original mascot cast).
  The whole site is "GameDesignLab".

## Experience requirements
- **Showcase first.** Real gameplay thumbnails are the heroes. A featured area up top (curated from `score`), then
  "Continue playing" (recent), "Favorites", and the full library. Sections that would be empty are not shown.
- **Find anything fast**: instant search (title/desc/genre, forgiving), genre chips derived from the data,
  collection switch (All / Arcade / Phone Game Lab / Pocket Pals), control/device filter (touch-friendly, keyboard),
  sort (featured, A–Z, recently played, top rated). State lives in the URL hash so back/forward and deep links work.
  A "Surprise me" random pick. Result count is computed, never hardcoded.
- **Cards**: thumbnail, title, one-line description, genre, control icons (touch / mouse / keyboard as small inline
  SVGs), personal best if any, favorite toggle, a subtle quality badge for reviewed games. Phone-collection cards are
  portrait; standalone cards are landscape — make the mixed grid look intentional. Hover/focus: gentle lift and, when
  `strip` exists, an animated preview.
- **Launching**: standalone games open through `play.html?g=<id>`; phone games open directly at their `path`
  (their engine already provides HUD, back button and pause). Launch must feel instant; record recent/plays for
  standalone games.
- **`play.html`**: full-viewport iframe of the game with a small, unobtrusive floating control cluster (back to
  arcade, title, favorite, fullscreen, reload) that fades when idle and never blocks gameplay; a consistent loading
  state (blurred thumb + title + spinner until the iframe `load`s, then fade); focuses the iframe so keyboard works
  immediately; `allow="fullscreen; autoplay; gamepad"`; handles unknown ids gracefully; Esc does **not** steal from
  games. Shows the control hints (`controls`) and description briefly on load. Must not break games that use
  pointer lock, audio or `localStorage` (same-origin iframe, no sandbox attribute).
- **Phone lab launchers**: same design language, lighter: header with collection identity, search, category sections
  from `LAB_GAMES`, portrait cards with thumbs + best scores, and a link up to `../index.html`. They must work when the
  lab folder is hosted on its own (only depend on files inside the lab folder; treat missing thumbs gracefully).
  Give "Pocket Pals" a warmer, more playful skin than "Phone Game Lab" via CSS variables.
- **Design**: confident, modern, a little playful; *not* a wall of neon. Dark, slightly warm base with one or two
  accent colours; excellent typography from system font stacks (no web fonts, no CDNs, no external requests at all);
  generous spacing; crisp at 360 px wide, great at 1440 px. Motion is quick and purposeful and disabled under
  `prefers-reduced-motion`. It must feel like a product, not a demo page.
- **Performance**: 215 cards must scroll at 60 fps on a phone: lazy-load images (`loading="lazy"`, intrinsic
  sizes to avoid layout shift), `content-visibility` where useful, no layout thrash on search (filter by toggling,
  or render in chunks), no heavy blur stacks.
- **Accessibility**: semantic landmarks, real links/buttons, visible focus, full keyboard operation (`/` focuses
  search, arrows/tab move through cards, Enter plays, `f` favorites), alt text, contrast ≥ 4.5:1 for text, 44 px
  touch targets, works with 200% zoom.
- **Robustness**: works if `localStorage` throws; if `catalog.js` is missing show a helpful message; no console errors.

## Process
1. Look at the data (`catalog.js`) and a sample of `thumbs/`. Sketch the layout before coding.
2. Build, then **look at it** in a real browser: write a small Playwright script (Chromium + Playwright are
   preinstalled: `require('playwright')`; serve the repo with `require('./tools/serve').listen(0)`), capture
   screenshots at 390×844, 820×1180 and 1440×900 for the home view, a search, a filtered view, favorites/recent
   populated (seed `localStorage`), and `play.html` loading + loaded. Open the PNGs with the Read tool, critique
   them like an art director, and iterate until it looks like a product you would ship. At least three rounds.
3. Write tests: catalog renders every game exactly once; search and each filter narrow correctly and restore;
   hash state round-trips; favorite toggling persists and populates the Favorites section; launching a standalone
   game goes through `play.html`, loads the iframe and records `gdl:recent`; phone lab launchers list every item
   of their `LAB_GAMES`; no console errors. Run with `node tools/run-tests.js arcade`.
4. Put scratch files under `/tmp/claude-0/-home-user-GameDesignLab/793e20e9-278b-53d6-9c6b-b1bb40257a04/scratchpad/agent-arcade/`, never in the repo.

## Final message
What you built (5–10 lines), test status, anything unfinished, and any data you wish the catalog provided.
