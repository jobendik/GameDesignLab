# Quality Standard

The bar for every game in GameDesignLab. A game is not "done" because its code looks right — it is done when a
player would choose to play it again. Scores are 1–10 and must be justified with evidence (tests, screenshots,
playtest notes). Do not inflate: a technically correct but boring game is a 5.

## The twelve dimensions

| # | Dimension | What a 9–10 looks like |
|---|-----------|------------------------|
| 1 | Gameplay enjoyment | A clear core loop that is fun in the first 10 seconds and still interesting after 5 minutes |
| 2 | Mechanical depth | Real decisions, risk/reward, skill expression; mastery is visible in the score |
| 3 | Game feel | Every input acknowledged within a frame; anticipation, impact, follow-through; tuned, coherent feedback |
| 4 | Visual identity | A look you could recognise from a thumbnail; palette, shapes and type chosen for this game specifically |
| 5 | Animation quality | Things ease, squash, settle; state changes are animated, nothing pops or teleports without intent |
| 6 | Audio quality | Sounds carry information (pitch = size/speed/combo), layered, mixed, never grating; music fits and reacts |
| 7 | Controls | Precise, forgiving (buffering, coyote time, generous hitboxes), works with touch + mouse (+ keys where apt) |
| 8 | Onboarding | Understood without reading; the first interaction teaches; how-to ≤ 3 short lines |
| 9 | Replayability | Variation between runs, escalating challenge, a reason to beat your best |
| 10 | Performance | 60 fps on a mid-range phone; no GC hitches; bounded particle/entity counts |
| 11 | Technical robustness | Clean restart, pause/resume, resize/rotate, blur/focus, no console errors, no leaks across runs |
| 12 | Overall polish | Splash → play → game over → retry is seamless; nothing placeholder remains |

Scale anchors: **1–2** bare prototype · **3–4** playable but rough · **5–6** solid, forgettable · **7** good ·
**8** very good, would recommend · **9** excellent, commercial-minigame quality · **10** exceptional.

## Non-negotiables (every game)
- **Original identity.** Original name, look and sound. Genre mechanics are fine; recreating a specific commercial game
  (its name, characters, art, level layouts, music) is not. No third-party characters or brands.
- **Self-contained.** No CDN/network dependencies at runtime (libraries live in `vendor/`; system font stacks or bundled fonts).
  No ad/analytics SDKs. Works from `file://`-like static hosting.
- **Frame-rate independent** (dt-based, dt clamped), fixed-step physics where stability matters.
- **Clean lifecycle**: restart resets everything; pause/resume; survives resize, rotation, tab switch.
- **Input**: touch + mouse always; keyboard where it makes sense; hit targets ≥ 44 px; no hover-only affordances.
- **Layout**: 390×844 portrait, 844×390 landscape and 1280×800 desktop all usable; respects safe areas.
- **Audio**: starts only after a user gesture; mute/volume available; pleasant at length.
- **Accessibility**: readable contrast, not colour-only for critical information, honours `prefers-reduced-motion`.
- **Best score** persisted: phone games through `Lab.gameover({score})`; standalone games write
  `localStorage["gdl:best:games/<file-name-without-.html>"] = JSON.stringify(number)` (the arcade shows it).
- **Catalog metadata**: phone games set `title`, `tagline`, `category` in `Lab.init`; standalone games carry
  `<title>`, `<meta name="description">`, `<meta name="gdl:genre" content="Arcade, Physics">`,
  `<meta name="gdl:controls" content="touch, mouse, keyboard">`. Catalogs and launchers are generated — never hand-edit them.
- **A gameplay test** in `tests/<collection>/<slug>.test.js` (see `tools/run-tests.js`) that drives real play:
  start → score changes through genuine mechanics → lose/win condition → clean restart. Use deterministic seeds and
  exposed test hooks; never weaken a test to make it pass.
- **A review** in `docs/reviews/<collection>/<slug>.md` using the template in `docs/reviews/TEMPLATE.md`.

## Verification levels (always state which one applies)
1. **Automated-technical** — `tools/smoke.js`: loads, renders, survives input/resize/blur, no errors.
2. **Automated-gameplay** — `tools/run-tests.js`: mechanics, scoring, end conditions, restart verified by script.
3. **Visual inspection** — screenshots at the three reference viewports were looked at and judged.
4. **Subjective playtest** — an assessment of fun/feel. In this project that is an informed judgement made from
   reading the code and watching scripted play, *not* a human playtest; reviews must say so.
