---
id: games/neon-hagen
title: Neon Hagen
was: Neon Hagen
status: transformed
baseline: 1
score: 7
updated: 2026-11-26
---
## Original concept and core mechanics
A "co-op flower-blooming garden": a glowing spirit drifts with floaty physics around a dark 3000×3000 field and
flowers bloom while it is near them. Giant flowers only opened when two players stood beside them. Players, chat and
voice were meant to sync through Firebase. Written as a React component compiled in the browser by Babel, styled with
the Tailwind CDN.

## Baseline assessment
Broken. Every dependency (React, ReactDOM, Babel, Tailwind) came from a CDN that is not available, so the page rendered
a blank dark screen at all three viewports (screenshot inspected). Reading the source: even with the CDNs it was a toy,
not a game — Firebase was stubbed out, so there were never other players, which made all 15 giant flowers permanently
unopenable; there was no score, no fail state, no end, no audio, no pause, no keyboard control, and the canvas was
resized every frame. What was charming: the nocturnal mood, a light that makes things bloom by presence alone, floaty
drifting, and big flowers that need company.

## Weaknesses identified
1. Did not run at all (CDN React/Babel/Tailwind).
2. No loop: nothing to win, lose, chase or improve at.
3. The one interesting idea (giant flowers need a partner) was impossible in single-player.
4. No feedback, no audio, no onboarding, Norwegian-only UI strings, dead chat and mic buttons.
5. Allocated a canvas resize and a gradient every frame; per-frame React state updates.

## Creative opportunities
- Replace "a second player" with companions you earn: each bloom frees a firefly that follows you, and the big flowers
  need fireflies delivered. The partner idea survives and becomes the progression.
- A trail of followers is a natural risk/reward object: the longer it is, the more it is worth and the easier it is to lose.
- Light versus dark as the health system and the camera: the wisp's glow is both the timer and how far you can see.
- A musical game: blooms as notes that climb with the chain.

## Planned improvements
Full rewrite in plain JS + Canvas 2D, single self-contained file; nights as escalating rounds; glow as a draining
life bar refilled by blooming; firefly tail and Moonblooms; Shades that eat the tail; a Flare with a real cost;
chain multiplier; dawn payoff; procedural audio; touch stick + mouse + keyboard; pause, mute, best score, test hook.

## Implemented improvements
- **Rewrite**: no libraries, no network. Fixed 60 Hz simulation step with dt clamp, DPR-aware canvas, cached sprites
  (flowers, buds, glows, ground pattern), pooled particles, bounded entity counts.
- **Core loop**: glide over buds (proximity charge, about 0.3 s) to bloom them. Each bloom scores, refills glow, extends
  the chain and frees a firefly that joins a trailing tail (max 24). Carry fireflies to a Moonbloom, which shows one pip
  per firefly it needs; when full it opens with a shockwave, becomes a lit sanctuary Shades cannot enter and sprouts a
  ring of new buds. All Moonblooms open brings dawn: the rest of the garden blooms in a wave, glow is banked as bonus,
  and a larger, darker night begins.
- **Pressure**: glow drains faster every night (not at all before the first bloom on night 1); at zero the run ends.
  The visible radius shrinks with glow, so unbloomed buds sink into the dark while everything you have woken stays lit.
- **Enemies**: Shades (night 2+) home on the nearest part of the tail; touching it snips the tail there and the cut
  fireflies scatter and can be re-collected for a few seconds. Touching the wisp costs 14 glow, scatters everything and
  breaks the chain. Darters (night 4+) telegraph a line, then dash.
- **Flare**: spend 3 fireflies to banish Shades in a radius and instantly bloom every bud in it — a defensive tool that
  is also profitable in a dense cluster.
- **Scoring**: chain multiplier up to ×5 (2.8 s window, ring timer around the wisp), per-night scaling, Moonbloom and
  dawn bonuses. Best score in `gdl:best:games/neon-hagen`, shown in HUD, menu and game over.
- **Feel**: squash on the wisp, eased bloom with overshoot, light pools, rings, sparks, score pops, slow-motion on
  Moonbloom opening and on hits, screen shake, vibration; all reduced under `prefers-reduced-motion`.
- **Audio**: WebAudio only after a gesture. Evolving four-chord pad whose filter opens with glow and garden life,
  pentatonic bloom plucks that climb with the chain, delivery bells, Moonbloom arpeggio, dawn fanfare, hit/snip/flare
  sounds, heartbeat when glow is low, sparse crickets, feedback delay for space. Mute button + M, remembered.
- **Controls**: floating touch stick anywhere (base follows the thumb), hold-mouse to steer toward the pointer,
  WASD/arrows; Flare on an 84 px button, Space/F; P/Esc pause, auto-pause on hidden tab/blur.
- **Onboarding**: night 1 has no enemies and a trail of buds leading to the Moonbloom; contextual one-line hints
  (drift → bloom → deliver → flare) that disappear once done; edge arrows point to Moonblooms (with the count still
  needed, gold when you carry enough), nearby Shades and the nearest bud.
- **Layout**: zoom derived from the short side; HUD and menus adapt to 390×844, 844×390 and 1280×800; safe-area insets.
- Metadata, English UI (title kept), `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`, inert `window.__gdl` hook.

## Test results
- **Automated-technical** (`node tools/smoke.js neon-hagen`): pass, 61–62 fps headless, no errors, no external requests.
- **Automated-gameplay** (`node tools/run-tests.js games/neon-hagen`): pass (≈10 s). Menu → real tap on PLAY → a real
  CDP touch-stick drag blooms buds, builds a chain and delivers fireflies → Moonbloom opens → dawn → night 2 with Shades
  → keyboard steering → Flare refused under 3 fireflies and costs exactly 3 → Shade hit (−14 glow, chain reset, tail
  scattered) → pause freezes time (key, button, Esc) → glow runs out → game-over card and stored best → clean restart.
  One assertion was corrected after it failed intermittently: a flare also blooms nearby buds a moment later and each
  frees a firefly, so the check is now "3 spent, plus one per bloom gained" (skipped only if a Shade snips the tail in
  the same 80 ms). That was a race in the test, not a game fault; passed 3 of 3 consecutive runs afterwards.
- **Visual inspection**: screenshots looked at for menu, night 1 dawn, night 3 mid-play, low glow with Shades, game
  over, at portrait, landscape and desktop. Fixed from what I saw: washed-out dawn (lingering flash + flat tint), buds
  too dim, edge arrows colliding with the Flare button, fireflies too small.
- **Subjective playtest**: not a human playtest. Judgement from reading the code, watching scripted play and bot runs:
  a perfect greedy bot dies on nights 9–12 (6–10 min); a deliberately sloppy bot on nights 7–9. A real player will be
  well below that; I estimate nights 4–6 in a 3–4 minute run, but that is unmeasured.

## Remaining issues
- Difficulty is tuned from bots, not people; early nights may be too gentle for good players and the mid-game ramp
  is a guess.
- Only two enemy types and one objective type; nights differ in size and count more than in kind.
- Hold-mouse steering works but keyboard is the better desktop control; there is no gamepad support.
- Audio was never heard (headless); mix levels are reasoned, not listened to.
- Darters and nights 4+ were verified by bot/state only, not by looking at screenshots.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Clear bloom → gather → deliver loop with a payoff each night; unproven with real players |
| Mechanical depth | 7 | Tail length as risk, flare as cost/benefit choice, chain routing, sanctuary positioning |
| Game feel | 7 | Immediate response, eased blooms, slow-mo, shake, pops; tuned by eye from stills, not by hand |
| Visual identity | 8 | Distinct lit-versus-dark neon garden; garden visibly comes alive; consistent palette and type |
| Animation quality | 7 | Overshoot blooms, breathing buds, wobbling Shades, dawn wave; Shade art is simple |
| Audio quality | 6 | Layered and informative by design (chain pitch, heartbeat) but never listened to |
| Controls | 7 | Touch stick, mouse, keyboard all tested by script; mouse steering is the weakest |
| Onboarding | 8 | Enemy-free first night, guiding bud trail, short contextual hints, edge arrows |
| Replayability | 6 | Seeded random gardens, escalating nights, best score; limited enemy/objective variety |
| Performance | 8 | 60 fps headless, sprite caching, pooled particles, capped entities; not profiled on a phone |
| Technical robustness | 8 | Fixed step, pause/blur/resize handled, clean restart tested, storage guarded |
| Overall polish | 7 | Menu → play → dawn → game over → retry is seamless; nothing placeholder left |

## Next recommended action
A human playtest to tune glow drain and Shade pressure for nights 2–5, then add one more night modifier (for example
a wind that drifts the tail, or frost that re-closes blooms) so later nights differ in kind, not only in size.
