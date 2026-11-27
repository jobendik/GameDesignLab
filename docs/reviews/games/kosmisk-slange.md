---
id: games/kosmisk-slange
title: Kosmisk Slange
was: same (in-game title was "NEBULA")
status: transformed
baseline: 3
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A Norwegian-language clone of the best-known commercial snake-arena game: steer a worm toward the pointer, eat
coloured dots, hold to boost (burning length), die when your head touches another worm. Fifteen bots, a leaderboard
and a minimap. The kernel worth keeping: **a long glowing body on a dark sky, in Norwegian.**

## Baseline assessment
Playable but generic (3/10). Played at 1280×800: the Tailwind CDN is blocked, so the start screen is unstyled text;
the title reads "NEBULA" while the page is called Kosmisk Slange. Per-frame simulation (speed follows refresh rate),
O(snakes × segments) collision and O(snakes × food) eating every frame, `shadowBlur` on every dot, bots that only
chase the nearest dot and never avoid anything, instant death on a red square wall, no session end (you play until
you die, score = length), no pause, no audio, no best score, touch = "finger position relative to screen centre"
with every touch also boosting, an FPS counter in the HUD.

## Weaknesses identified
1. Identity: it is the commercial game with a Norwegian string table — nothing cosmic about it beyond the palette.
2. No depth beyond "eat, avoid": length is only a score; bots are furniture; no arc, no end, no reason to replay.
3. Frame-rate dependent, quadratic collision, no lifecycle (pause/blur/restart leave state behind), CDN dependency.
4. Touch control hides the snake under the finger and boosts constantly.

## Creative opportunities
Take "kosmisk" literally. A night sky has **constellations** and **gravity**; a serpent has a **long body**. Make the
body the tool: a star stays lit while your body lies on it, so a constellation is claimed by threading your whole
length through all its stars at once — length becomes reach, not just score. Let suns bend paths, give free speed
and guard rich dust. Give the night a shape: dusk → midnight meteor showers → dawn eating the sky inward.
(Deliberately different from the phone collection's *Ribbon Rodeo*, whose hook is encircling things with a loop,
and from this agent's other snake arena *Slurpentine* in `slithergar.html`, which is a fast three-life brawl about
thick-vs-thin biting; Kosmisk Slange is the slow, single-life, route-planning one.)

## Planned improvements
Full rewrite in plain JS/CSS: fixed-step simulation, ring-buffer bodies, spatial hashes, constellations, gravity
wells, five bot temperaments, a three-minute night with phases, real audio, Norwegian UI, lifecycle, test, review.

## Implemented improvements
- **Constellations (the hook)**: seven per night (nine named shapes: Kroken, Lynet, Ljåen, Kronen, Reven, Tranen,
  Nøkkelen, Harpen, Båten), from 4 to 6 stars. A star is lit for a serpent while any part of its body covers it,
  plus 2.5 s. All stars lit at once → the constellation is yours for the night: 100 × stars × (1 + ½ per one
  already owned), a burst of rich dust, drawn in your gold. Each label says whether you are "lang nok" or
  "krever lengde N", so growing has a visible purpose, and boosting at the right moment stretches your reach
  while shrinking you. The smallest one is placed just ahead of the spawn and fits the starting length, so the
  first 10 seconds teach the mechanic (hint + edge arrow). Rivals can claim them too.
- **Gravity**: four suns and a central black hole pull everything, speed you up to +50 % for free, and carry two
  counter-rotating rings of rich dust; the core kills. Skimming a core and getting out pays a "Nærpassering" bonus
  (10–40, pitch of the whoosh = how close).
- **The night (session arc)**: 3:00. *Skumring* (hunters leave you alone), *Midnatt* (two telegraphed meteor
  showers lay a line of rich dust; an edge arrow and the minimap show where; bots converge), *Daggry* (the sky
  shrinks from radius 2000 to 900 around the black hole; daylight outside scorches length instead of killing
  outright; unclaimed outer constellations fade). Sunrise ends the run with +2 per length and a placing bonus;
  dying ends it early with what you have. Score = "stjernelys".
- **Bots that read as characters**: *beiter* (grazer), *drømmer* (slow, half-attentive), *jeger* (leads your head
  and boosts to cut you off, in 7–12 s bursts; red brows and pupils while locked on), *stjernekikker* (threads
  constellations it is long enough for — a dashed line shows which star it is going for), *kretser* (orbits suns
  with a thin margin and sometimes burns). All share a probe-based avoidance (bodies, where other heads will be,
  cores, daylight) evaluated every third tick, with temperament-specific look-ahead, reaction time and occasional
  blind lapses, so they die believably (≈1 bot death every 3 s across the arena in a scripted night). Eyes look
  where they intend to go; they respawn after a few seconds, longer as the night goes on.
- **Feel**: fixed 60 Hz step; camera leads the head and zooms out with √length; eaten dust is inhaled toward the
  mouth; pentatonic chime rises with the eating streak; each star rings one step higher and a claimed constellation
  plays the whole arpeggio; rings/sparks on claims and deaths; spawn ghosting; restrained shake (off with
  reduced-motion).
- **Look**: serpents are dark nebula ribbons with a luminous spine, twinkling bead-stars and a comet-crested head
  (not the commercial game's striped circle chain); parallax star tiles; additive dust sprites (cached glows, no
  `shadowBlur`); suns with coronas, a swirling black hole; peach daylight beyond the rim; Cinzel + Space Grotesk.
- **Audio**: procedural WebAudio — slow pad + sparse bell arpeggio (faster and an octave up at dawn), boost wind,
  horn for meteor showers and dawn, last-ten-seconds ticks; M / button mutes; starts on first gesture.
- **Controls**: mouse — the head follows the pointer, hold to boost; touch — drag anywhere is a floating stick,
  second finger or the FART button boosts; keys — ←/→ or A/D turn, Space/Shift/↑ boost, P/Esc pause, M mute,
  Enter/Space start. Canvas takes focus on start (works in the arcade iframe).
- **Norwegian (bokmål) throughout**: menu, hints, toasts, causes of death, end card, aria labels; `lang="nb"`.
- **Tech**: no network; ring-buffer bodies (no per-frame allocation), 56-unit segment hash rebuilt per tick,
  80-unit pellet hash, ≤1500 pellets, ≤440 particles; 0.06–0.12 ms per simulation step in headless Chromium with
  12 serpents of up to ~390 segments. Pause on button/P/Esc/blur/hidden; clean restart; resize-safe; best score in
  `gdl:best:games/kosmisk-slange`; `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, `?night=<s>` (tests),
  `window.__gdl` (state, `advance`, `manual`, `toScreen`, `safe`, `dust`).

## Test results
- **Automated-technical**: `node tools/smoke.js kosmisk` passes (59–61 fps, no errors; a restart crash from a
  stale segment hash found by the lead's smoke run was fixed).
- **Automated-gameplay**: `tests/games/kosmisk-slange.test.js` passes three times in a row (≈19 s): menu with HUD
  hidden → tap start → mouse threads the starter constellation (stars light, claim, +400) → dust eaten, growth →
  boost burns segments → keyboard turn/hold/boost → touch stick + second finger → a mouse-driven dust-seeking
  driver survives a shortened night through dawn to sunrise (bonus maths, end card, stored best) → restart →
  flying into a sun ends the run without bonus → Enter restarts → pause freezes the clock.
- **Visual inspection**: screenshots at 390×844, 844×390 and 1280×800 looked at — menu, constellation in progress,
  claim moment, sun with dust rings, mid-night, dawn crowding around the black hole, both end cards.
- **Subjective playtest**: an informed judgement from scripted play and screenshots, not a human playtest.

## Remaining issues
- World labels and the big toast can overlap each other or sit under the top HUD for a moment.
- The stargazer bots do not account for corners when judging whether they are long enough, so they sometimes fail
  a constellation twice before getting it (reads as fallibility, but it is not deliberate).
- Bot lethality is fairly high for a "serene" game late in the night; balance was tuned from scripted runs only.
- No haptics; no colour-blind alternative to hue for telling rivals apart (names are shown).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | First constellation inside ten seconds; eat/grow loop always has a next target |
| Mechanical depth | 8 | Length as reach, boost-to-stretch, gravity slingshots, contested constellations, dawn squeeze |
| Game feel | 7 | Inhale, chimes, rings, camera lead; no hit-stop, deaths could land harder |
| Visual identity | 8 | Nebula-ribbon serpents, gold constellations, peach daylight rim — recognisable from a thumbnail |
| Animation quality | 7 | Twinkle, pulsing cores, claim rings, eased toasts; bodies are stroked paths without squash |
| Audio quality | 8 | Pitch carries streak / star index / closeness; generative pad shifts at dawn; never harsh |
| Controls | 8 | Pointer, floating stick + second finger/button, keys; verified by test on all three |
| Onboarding | 8 | Three-line card, starter constellation with hint and arrow, contextual one-line tips |
| Replayability | 8 | Seeded sky layout, seven constellations to route, placing bonus, best score |
| Performance | 9 | ≈0.1 ms/step, spatial hashes, cached sprites, bounded pools |
| Technical robustness | 8 | Fixed step, pause/blur/resize/restart tested, deterministic under `?seed` + manual stepping |
| Overall polish | 8 | Coherent Norwegian presentation from menu to sunrise card |

## Next recommended action
A human playtest of the night's pacing (bot lethality after midnight, how many constellations a focused player
gets), then label de-overlapping and a harder "lang natt" variant with more suns.
