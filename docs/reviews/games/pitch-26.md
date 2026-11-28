---
id: games/pitch-26
title: Floodlight Fives
was: PITCH 26 — Football
status: transformed
baseline: 3
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"PITCH 26" (a name echoing a commercial yearly football franchise) was a 6-a-side top-down match: a portrait-only 9:16 stage,
the whole pitch on screen, a fixed joystick + PASS/SHOOT/RUN/TACKLE buttons, AI that chased the ball or drifted back to a
home position, one 3-minute match vs "Blue", rematch.

## Baseline assessment
Played headless at all three viewports (`p26-base-*.png` in the scratch dir). It ran, but players were ~8 px dots on a
whole-pitch view with the scoreboard covering the top goal; desktop and landscape showed a narrow portrait strip with touch
buttons and no keyboard hint; physics advanced per frame (not dt-based); the AI had no off-ball positioning (formation
anchor + lerp to ball), shots/passes were dice rolls (`Math.random() < 0.45`), the keeper slid along the line and lunged at
anything within 60 px; four buttons where tackling was a separate verb; Google Fonts; no pause, best score, seed, test hook
or ending beyond "rematch". Baseline **3**.

## Weaknesses identified
1. No football in the AI: nobody found space, marked, covered or pressed; passes ignored lanes.
2. Tiny unreadable view, wrong in landscape/desktop; scoreboard over the goal.
3. Controls: four buttons, no charge/aim, no first-time play, no assists.
4. One match and done — nothing to come back for. Borrowed-sounding name, generic red vs blue.
5. Missing lifecycle/conventions; frame-rate dependent.

## Creative opportunities
Make it **five-a-side cage football under floodlights**: the boards are in play (no throw-ins, wall passes and rebounds
are part of the game), a tight 900×560 pitch that fits a phone with a following camera, and a **three-round knockout cup**
(8 invented clubs) as the reason to play again. Identity: night turf, amber-trimmed boards, four floodlight masts that
throw four faint shadows under every player.

**How it differs from Pocket Arcade Football (`games/pocket-football.html`, now "Bottle Cap Derby")**: Floodlight Fives is
a real-time team sim — you steer one of five players with a stick, the other nine are AI with roles, and the skill is
reading play (passing lanes, pressing, timing tackles). Bottle Cap Derby is a calm turn-based tabletop game — you flick
bottle caps on a kitchen table and the skill is aim and physics (angles, rebounds, blocking). No overlap with Postage
Stamp (free kicks), Volley Garden (first-time volleys) or Plop Shot (target toss): this is the only full team match.

## Planned improvements
Rewrite: fixed-step sim, rotating camera view, role/formation AI with support-spot search, marking, pressing with telegraphed
lunges, a reacting keeper; 3-button controls with charge/aim/through-ball/first-time buffering; cup structure; replays;
audio bed; conventions.

## Implemented improvements
- **Rewrite** (single file, ~1,200 lines, no dependencies). Fixed 60 Hz step, dt-clamped, slow-mo/hit-stop applied to the
  sim clock; seeded `mulberry32` for all gameplay decisions, reseeded per match so runs reproduce.
- **View**: one world, two projections — portrait rotates the pitch so you always attack *up*; landscape/desktop attack
  right. A following camera with possession lead; zoom tuned per viewport (players ≈ 12–20 px); radar mini-map.
- **AI** (all ten players, including your nine team-mates/opponents):
  - *Off the ball in possession*: each player scores 13 candidate spots around a ball-shifted formation slot (openness,
    passing-lane clearance from the carrier, progress, not crowding team-mates) every ~0.4 s and runs there.
  - *Defending*: nearest player presses goal-side of the ball and attempts lunges; the second covers between ball and goal;
    the rest mark goal-side/ball-side of the most dangerous attackers, blended with a compact shifted block.
  - *Carrier*: decides every 0.2–0.5 s (faster when pressed) between a shot (distance × goal-mouth angle × blocked-lane
    quality), the best pass (progress + openness + a lane check that subtracts how far each opponent can run before the ball
    arrives; through balls for forwards) and dribbling (goal attraction with opponent/board repulsion).
  - *Loose ball*: interception-time race on a predicted ball path; pass receivers run onto the ball.
  - *Keeper*: stands on the ball–goal bisector, comes off the line as play approaches, claims loose balls in the box when it
    wins the race, reacts to shots after a skill-based delay and dives toward the predicted crossing point; catches slow
    shots, parries hard ones; distributes after ~0.8 s.
  - Opponent skill rises by round and club rating (reaction, decision speed, tackle odds, accuracy).
- **Tackling with a tell**: AI lunges are preceded by a 0.12–0.22 s red-ring crouch; the lunge goes where the ball *was*,
  so cutting away beats it (the tackler stumbles). Tackles from behind succeed less (shielding).
- **Controls**: floating stick (touch or mouse drag on the left), PASS / SHOOT / RUN buttons (44 px+), keyboard WASD/arrows
  + J/K/Shift. With the ball: PASS tap = assisted ground pass (stick direction weighted, none = best option), hold = lofted
  through ball; SHOOT hold charges (ring meter; >93 % = over-hit risk), release fires at the far corner from the keeper or
  the corner the stick points to, with error from pressure, over-hitting and awkward body shape. Without the ball: SHOOT =
  poke tackle (close) or slide, PASS = switch player. Releasing SHOOT/PASS just before the ball arrives = first-time
  shot/pass (0.35 s buffer). Auto-switch to the best interceptor; control follows your passes; sprint with stamina arc.
- **Cup**: pick one of 8 invented clubs (stars + formation; weaker clubs multiply points up to ×1.15); QF → SF → Final
  with other ties simulated and a bracket card; 2-minute matches; level at full time = **golden goal**. Cup points: goals
  100 (+50 first-time, +50 long range, +50 for a 3+ pass move), win bonus by round, clean sheet, +1000 for the cup.
  Best in `gdl:best:games/pitch-26`, cups won on the menu.
- **Feel**: goal slow-mo + shake + net shake + confetti in kit colours, post/bar hit-stop, then a 0.5× **replay** of the
  last ~3.5 s (letterboxed, tap to skip); kick puffs, ball trail on hard shots, height via scale + four floodlight shadows.
- **Audio** (WebAudio after first gesture): kick thump pitched by power, touch, board thud by impact speed, post ring, glove
  slap, net swish, whistles; a crowd bed whose level and brightness follow how close the ball is to either goal, "ooh"s on
  near-misses, roar on goals, a quiet terrace-chant motif. Mute button + M; attract-mode match is silent.
- **Onboarding**: attract match behind the menu; how-to in 2 lines; three contextual tips in the first matches (run/pass →
  shoot in the final third → tackle/switch), each gone once done.
- **Conventions**: vendored fonts (Bebas Neue, Saira Condensed, JetBrains Mono); DOM cards with opaque panels (HUD, touch
  controls, tips hidden behind them; touch controls hidden during replays); pause button + Esc/P + auto-pause on blur/hidden;
  `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`; `window.__gdl` (`state`, `manual`, `advance`, `place`, `freeBall`,
  `setClock`, `setScore`, `setSkill`, `auto`, `face`); static pitch baked to an offscreen canvas (61 fps headless).

## Test results
- **Automated-gameplay**: `node tools/run-tests.js pitch-26` → pass three consecutive runs (≈6 s). Real taps on a club,
  START, KICK OFF; a mouse-driven stick drag runs the kick-off taker upfield with the ball; a real tap on PASS plays a pass
  to a team-mate and control switches; a K charge + ArrowRight release shoots across a keeper (placed at the near post by
  the hook) → GOAL, points; replay plays and a tap skips it; opponents kick off; K beside their carrier wins a tackle; our
  keeper steps toward the ball side; P pauses (clock frozen), RESUME; full time ahead → WIN card → semi-final with a sharper
  opponent; a defeat → cup-over card, best stored; NEW CUP resets; level at full time → golden goal, a goal ends the match.
  (The hook positions players for the shot/tackle/keeper checks and sets score/clock for the endings.)
- **Automated-technical**: `node tools/smoke.js games/pitch-26` → pass, 61 fps.
- **AI-vs-AI simulation** (scratch script, `auto` mode): typical 2-minute matches end 0–3 goals each with 7–14 shots,
  100–180 passes, ~20 % of passes intercepted, 4–11 tackles; a 5★ final opponent beats a 3★ AI side most of the time.
- **Visual inspection**: menu, bracket, kick-off, goal, replay, full-time, semi-final bracket and cup-over cards at
  390×844; play at 844×390 and 1280×800 — opened and judged.
- **Subjective playtest**: judgement from code, simulations and scripted screenshots only — no human hands on it.

## Remaining issues
- Difficulty curve is reasoned from AI-vs-AI sims, not from humans with thumbs; the final may be too hard or too soft.
- No fouls, penalties or half-time switch; the user never controls the keeper.
- AI still over-passes sideways at times and two players can converge on a loose ball near the boards.
- Players are drawn top-down from primitives (legs swing, slide pose, dizzy stars) — readable but not animated characters.
- Audio not ear-checked.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Instant kick-off, readable passing game, goals feel earned; tension from golden goal and knockout |
| Mechanical depth | 7 | Lanes, through balls, first-time play, charge/over-hit, shielding, dodging telegraphed lunges, wall passes |
| Game feel | 7 | Slow-mo, hit-stop on woodwork, replay, power-scaled kick audio/shake; touch has no haptics |
| Visual identity | 7 | Floodlit cage: amber-trimmed boards, four-way floodlight shadows, kit colours per club |
| Animation quality | 6 | Leg swing, slide, lunge tell, net shake, confetti; players are primitive shapes |
| Audio quality | 6 | Layered, information-carrying SFX and a reactive crowd; not ear-checked |
| Controls | 7 | Floating stick + 3 buttons + keyboard, aim/pass assists, buffering, auto-switch |
| Onboarding | 7 | Attract match, 2-line how-to, three contextual tips |
| Replayability | 7 | 8 clubs with multipliers, seeded brackets, score chase, cups won |
| Performance | 8 | Baked pitch, bounded FX, one path prediction per step; 61 fps headless |
| Technical robustness | 8 | Fixed step, deterministic seeded test incl. restart, pause/blur/resize/rotate safe |
| Overall polish | 7 | Menu → bracket → match → replay → full time → cup summary flows cleanly |

## Next recommended action
Human playtests on a phone to tune opponent skill per round and the tackle odds; then add a penalty shoot-out as an
alternative to golden goal and simple player sprites (run cycle, celebration pose).
