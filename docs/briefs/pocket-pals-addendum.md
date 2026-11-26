# Addendum for Phone Game Lab 2 ("Pocket Pals") batches

Everything in `docs/briefs/phone-game-brief.md` applies. In addition:

- Read `PhoneGameLab2/shared/PALS.md` and skim `PhoneGameLab2/shared/pals.js`. Every game in this collection stars
  one or more of the Pocket Pals (include `pals.js` after `core.js`) and follows the house style there. Pass
  `kicker: "Pocket Pals"` to `Lab.init`.
- These prototypes were modelled on a commercial virtual-pet app's minigames. Any reference to that app's
  characters or names (e.g. "Tom") must go: rename the game (and its folder, plain `mv`, no numeric prefix in this
  lab) and make the fiction ours.
- Many concepts here also exist in `PhoneGameLab/games/` (brick breaker, 2048-style merging, bubble shooter, memory,
  maze, basketball, tower stacking, flappy, runner…). Those are being rebuilt in parallel as genre-pure arcade takes.
  Your version must be a *different game*: lean on the pal, the fiction and a distinct mechanical twist. If a sibling
  already exists as a v2 game (its file contains `Lab.boot()`), open it and deliberately differ from it.
- Tests go in `tests/PhoneGameLab2/`, reviews in `docs/reviews/PhoneGameLab2/`.
