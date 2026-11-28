# Prompt template for a Pocket Pals batch (lead's reference — fill in BATCH, SCRATCH)

You are transforming four phone minigame prototypes in the repository at /home/user/GameDesignLab into polished,
original, genuinely fun games for the "Pocket Pals" collection (`PhoneGameLab2/`).

Start by reading `docs/briefs/phone-game-brief.md` in full, then `docs/briefs/pocket-pals-addendum.md`, and follow both
exactly (they tell you what else to read — `PhoneGameLab2/shared/PALS.md`, `pals.js`, `PhoneGameLab/shared/ENGINE.md` —
the process, the lessons learned, the hard rules and the format of your final message). Read two finished Pocket Pals
games as references for how pals are used as actors (e.g. `stew-patch`, `clatter-castle`, `peekaboo-park`, `echo-jam`).

BATCH (folder names under `PhoneGameLab2/games/`, the prototype's one-line idea, and any finished sibling to differ from)

Standing notes:
- Every game stars Pocket Pals drawn with `Pals.draw(...)` (include `<script src="../../shared/pals.js"></script>` after
  core.js), follows the warm toy-like house style, passes `kicker: "Pocket Pals"` and a real `category` (Puzzle, Arcade,
  Sports, Skill, Creative, Music, Runner, Strategy). The pal is an actor, not a sticker; use different pals across the batch.
- Where a sibling exists (search `PhoneGameLab/games/` and `PhoneGameLab2/games/` for finished games with `Lab.boot()`),
  change the verb or the rule, not just the skin. Rename each game and its folder (plain `mv`) to an original name;
  remove references to commercial characters (e.g. "Tom").
- Tests: Playwright's touchscreen only taps (drive drags with mouse pointer events); `mouse.down()` at a negative
  coordinate is ignored; keep each test < ~60 s; the end card ignores Enter for ~1.5 s; never assert on a value genuine
  play can change inside your polling window (check it at the moment it must hold, read related values atomically);
  run each finished test three times in a row.
- Engine: `Lab.hint` collides with bottom-anchored controls; `Lab.toast/banner` take `{y}`; `Lab.gameover({neutral:true})`
  for runs that simply end; `theme.light:true` gives dark HUD text; call `Lab.setScore` after every score change; keep
  in-game HUD panels below `Lab.play.y + ~12`; make sure every file ends with `</script></body></html>`.
- Aim for 350–700 lines per game; plan late-game variety up front; `orient:"any"` where the design fills landscape.
- Tests in `tests/PhoneGameLab2/<slug>.test.js`, reviews in `docs/reviews/PhoneGameLab2/<slug>.md`.
- Scratch directory: SCRATCH (create it). If `pals.js` lacks something, draw it on top and tell the lead.
- Other agents share this checkout and the 4-core machine: one browser process at a time, filter runs to your slugs,
  no git commands that change state.
- A usage limit may cut you off: finish each game completely (game → screenshots → test → review) before the next,
  and be economical with tokens.
