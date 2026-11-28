---
id: games/slithergar
title: Slurpentine
was: SlitherGar.io
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"SlitherGar.io": a mash-up of the two best-known commercial .io games — a worm that steers toward the pointer, eats
dots, boosts, and grows "Agar.io style mass" (its width creeps up with a log of the score) in a neon arena with bots,
a top-5 leaderboard and a minimap. One resource ("Mass"), score = mass, game over on any head-into-body contact,
restart from a start box. The kernel worth keeping: **a snake arena where getting thicker matters, not only longer.**

## Baseline assessment
2/10 (from the original 815-line source at the foundation commit). The name and HUD wording lean on the two commercial
games; width was cosmetic (a log curve of the same single number), so the "hybrid" had no mechanical consequence;
per-frame simulation, O(n²) collision, no session end, no pause/lifecycle, no audio, no best score, touch was a
single finger-follows-screen-centre scheme. A previous agent on this pass rewrote it into *Slurpentine* (≈540 lines,
smoke passing) and was cut off before writing a test or review; this pass took over from that state.

**State on takeover (played in Chromium at 1280×800 and 390×844 with a scripted driver, screenshots inspected):**
playable and coherent, not half-finished. Menu → 2:30 round → three lives → results card all worked; bots, chopsticks,
sinking broth, gulp, dash, minimap, edge arrows and leaderboard were in and behaving. Gaps found: the results card
showed LONG 0 / FAT 0 whenever the run ended in death (it reported the dead noodle's current size); bot name labels
could draw under the top HUD (timer); the `__gdl.food()` helper picked pellets inside the head's turning circle, so a
driver orbited a pellet forever; no gameplay test, no review.

## Weaknesses identified
1. (Baseline) identity borrowed from two commercial games; "mass" was only a number.
2. (Baseline) no arc, no end, no reason to replay; frame-rate dependent; quadratic collision.
3. (Takeover) end-card stats meaningless after a loss; a little HUD/label overlap; untested.

## Creative opportunities
Make the hybrid real by splitting the two .io resources into **two separate stats with separate risks** — and give
them a fiction that is not a neon void: noodles brawling in a bowl of ramen. Long = score, reach and a wall to knot
others on, but a long tail is a long target. Fat = teeth and armour (a noodle 1.3× thicker bites straight through a
thinner body and swallows it head-on), but fat is slow, digests away, burns when you dash, and the chopsticks reach
for the fattest noodle. This makes it a clearly different game from its siblings: *Kosmisk Slange* (serene, single
life, route-planning around constellations and gravity), the phone collection's *Ribbon Rodeo* (lasso/encircle) and
*Big Drip* (raindrops merging on a bus window).

## Planned improvements
Keep the previous agent's design (it is sound) and finish it: fix the end-card stats, keep labels clear of the HUD,
make the test hook's food helper usable by a driver, write a deterministic gameplay test that drives real touch and
keyboard input through every verb and both end states, run a small balance sim, write this review.

## Implemented improvements
Design (by the previous agent, verified and kept):
- **Two resources.** Greens (green onion rings) → LONG; meat (chashu) → FAT. Radius follows fat
  (`7 + 1.7·√mass`, capped), speed falls with thickness, turn rate falls with radius, fat digests at 1.2 %/s.
- **Fat bites thin.** Head into a body ≥1.3× thinner severs it there (tail spills as food, +3/segment up to 150);
  head-on with a much thinner head swallows it whole (+100). Among equals the classic rule holds: head into body =
  knotted. Equal heads bonk and bounce instead of both dying.
- **Verbs:** steer; DASH (×1.6, burns fat first, then length, dropping crumbs others can eat); GULP (swallow 30 % of
  your own tail into fat right now — the long-to-fat conversion that sets up a bite).
- **Chopsticks** target the fattest noodle: a dashed ring stalks it for 2.6 s with an accelerating tick, locks red,
  then snaps — head inside = plucked, body inside = tail cut. Later in the round they come faster and in pairs.
- **Session:** a 2:30 lunch rush with three servings (lives). From 66 % the broth sinks (bowl radius 1500 → 880) and
  the music switches to rush mode; last-10-s ticks. End bonus = final weight + place bonus (300/150/75) + 50 per
  serving left. Best in `localStorage['gdl:best:games/slithergar']`, shown on menu and cards.
- **Bots** (nine, five temperaments — nibbler, glutton, biter, racer, coward) with sight, reaction time, lapses,
  size-misjudgement (`err`), fear radius and dash habits. Intent is visible: eyes look at the goal, a mouth with teeth
  opens when hunting/biting, sweat drops when fleeing; thinner noodles draw a dashed white outline (▼ prey), fatter
  ones a red outline and red head (▲ threat).
- **Camera** leads the head and zooms out with √length and girth; edge arrows for nearby chopsticks and fatter heads;
  bowl-shaped minimap; live "biggest in the bowl" board.
- **Performance:** ring-buffer bodies (Float32Array ×1024), segment spatial hash (64-unit cells, rebuilt once per
  step, every second segment), pellet grid (80-unit cells), pre-rendered sprites, one radial gradient per frame,
  bounded particles/floaters, fixed 60 Hz step with dt clamp.
- **Audio:** procedural WebAudio — pentatonic bass/lead loop with menu/play/rush modes, slurp plucks that climb with
  the eating streak (meat lower/square, greens higher/sine), chomp crunch scaled by bite size, gulp, knot, bonk,
  chopstick warning ticks that speed up, snap, horn, win/lose jingles; dash hiss; mute (button / M / `?mute=1`).
- **Controls:** mouse (point, hold = dash, right-click = gulp), touch (drag anywhere = floating stick, DASH button or a
  second finger = dash, GULP button), keyboard (←/→ or A/D turn, Space/Shift/↑/W dash, E/Q/S/↓ gulp, P/Esc pause,
  M mute, Enter/Space start). Pause button + auto-pause on blur/hidden (`?nopause=1` disables).
- **Cards** have an opaque cream backing; while a card is up the DOM HUD, leaderboard, hint and touch buttons are
  hidden and the canvas skips floaters, toasts, names, arrows and minimap.

This pass:
- End card shows **LONGEST / FATTEST** of the run (peak tracking) instead of the current size, which was 0/0 after a
  loss.
- Bot name labels are not drawn in the top 96 px, so they no longer sit under the timer/score pills.
- `__gdl.food()` (test hook only) skips pellets inside the head's turning circle and prefers ones ahead, so drivers
  don't orbit; `state` also exposes `peakN`/`peakM`.
- `tests/games/slithergar.test.js` written (below).

## Test results
- **Automated-gameplay** `node tools/run-tests.js slithergar` → pass, 3 consecutive runs on the final build
  (≈35–40 s each, identical results: the test steps the simulation itself and waits one frame after each touch move
  because Chromium delivers touch moves rAF-aligned). 390×844 mobile context with real CDP touch:
  tap DIG IN → a touch drag turns the noodle → greens raise LONG and score → meat raises FAT and radius →
  a second finger on DASH sprints ×1.6 and drops fat crumbs, releasing stops it → two-finger GULP converts 30 % of
  the tail into fat → E during the gulp cooldown does nothing → ←, Space, E (after cooldown), M work → a fat noodle
  steers its head into a thinner noodle and bites it → pause button freezes the real-time clock, resume continues →
  the 60 s test round (`?round=60`) is played out by a driver that dodges chopsticks and fatter heads: broth sinks,
  chopsticks appear, the clock runs out → BOWL EMPTY! card, bonus = size + place + servings, score stored as best,
  card shows peak size → ANOTHER BOWL resets everything → a thin noodle rams fatter ones until three servings are
  gone → SLURPED UP card, best kept → Enter starts a fresh bowl. Also checked against seeds 3, 5, 11, 21 during
  development.
- **Automated-technical** `node tools/smoke.js slithergar` → ok, 61 fps, no errors.
- **Visual inspection**: menu, early/mid/late round and both end cards at 1280×800 and 390×844, landscape 844×390.
- **Balance sim** (scratch script, full 2:30 rounds, cautious scripted player that only eats and dodges): seeds 1–4 all reached the bell (0–2 servings lost: chopsticks, a swallow, a knot), scores 644 / 669 / 862 / 1,687, places 8 / 7 / 5 / 1, peak length 164–217, peak fat 39–71. Eating alone keeps you alive but mid-table; first place came from the run that picked off seven thinner noodles.
- **Subjective playtest**: informed judgement from scripted play and screenshots, not a human playtest.

## Remaining issues
- A passive eater survives but finishes mid-table (sim places 5–8); ranking needs bites. Intended, but the place
  bonus may feel out of reach to cautious players.
- Dying in the last seconds with servings left forfeits the size and place bonus (you are respawning at the buzzer).
- Wall-sliding along the rim pins the heading toward the inside; you cannot turn into the rim (by design), which can
  feel sticky at first.
- Bots never use GULP to set up a bite on purpose beyond a random chance; temperaments are readable but not deep.
- The scripted driver orbits less with the fixed food helper, but real human feel (turn radius vs pellet spacing) is
  untested by a person.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Constant small decisions: eat greens vs meat, when to gulp, whether a passing noodle is prey or threat; chopsticks punish greed. |
| Mechanical depth | 7 | Two resources with opposed risks, bite/swallow/knot rules, gulp conversion, dash burning fat; five bot temperaments. |
| Game feel | 7 | Hit-stop on bites, shake, inhale particles, bulging gulp, bonk bounce, streak-pitched slurps; tuned, not noisy. |
| Visual identity | 8 | Ramen bowl with oil sheen, naruto, nori, egg, noodles with faces; cream/ink sticker UI — nothing like the source games. |
| Animation quality | 7 | Smooth bodies, looking eyes, opening mouths, sweat drops, chopstick stalk/lock/snap; static decor. |
| Audio quality | 7 | Layered procedural SFX carrying information (streak pitch, bite size, warning tempo) and a three-mode loop. |
| Controls | 7 | Mouse, floating touch stick with two-finger dash and buttons, full keyboard; rim slide can feel sticky. |
| Onboarding | 7 | Three-line menu rules, staged in-game hints (steer, food types, prey/threat outlines, gulp, dash), outline legend. |
| Replayability | 7 | Fixed 2:30 sessions, best score, place bonus; seeded bowls vary bot names/positions. No modes or meta. |
| Performance | 8 | Spatial hashes, ring buffers, sprite cache; smoke 61 fps with ~10 noodles and ~1,500 pellets. |
| Technical robustness | 8 | Fixed step, clean restart, pause/blur, resize, deterministic seeded test passing 3×; no console errors. |
| Overall polish | 7 | Coherent and finished; minor rough edges listed above. |

## Next recommended action
A human playtest on a phone to tune green density/turn radius and the chopstick cadence; then consider making bots
gulp deliberately before a bite, and a short "fattest at the bell" bonus so late deaths hurt less.
