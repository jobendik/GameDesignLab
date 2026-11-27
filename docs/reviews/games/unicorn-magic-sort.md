---
id: games/unicorn-magic-sort
title: Unicorn Magic Sort
was: same title — was a pastel reskin of the pour-sort in mystic-potion-sort
status: transformed
baseline: 4
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
A pastel unicorn-themed liquid sort built in DOM/SVG: tap a bottle, tap another, the top run of one colour pours across;
finish when every bottle is one colour. 120 numbered levels, undo, hint, level jump.

**How it now differs from Mystic Potion Sort.** The two were one puzzle in two skins. Mystic keeps (and deepens) the
pour-sort: liquids move in *runs*, only onto the *same colour*, and the goal is to *separate*. Unicorn Magic Sort is now
a **merge-sort**: you move *one charm at a time*, it may land on *anything* with room, and the goal is to *combine* —
twins fuse into the next charm on a seven-step ladder (dewdrop → blossom → star → moon → heart → rainbow → unicorn
horn), fusions chain down the jar, and each level is a wish for specific charms. It also has an endless score mode.
Different unit of movement, different placement rule, different goal, different end state, different tempo.

## Baseline assessment
- **Levels were not guaranteed solvable**: a random shuffle of colours into bottles plus random cell swaps — no check.
  With two spare bottles most deals happen to work, but nothing proved it, and "stars" used a made-up target.
- Pour = a tilted gradient bar that flashed between bottles; the whole board was rebuilt with `innerHTML` on every tap.
- Hint was a first-legal-move heuristic; any level could be skipped with Next; no pause, no keyboard, no touch polish.
- On 390×844 the toast and the bottom buttons overlapped (visible in the baseline screenshot), layers overflowed the
  glass outline, and in landscape the board was a sliver.
- `localStorage` unguarded (throws in private mode), no `gdl:best`, no test hook, viewport blocked zoom, emoji-dependent
  UI, full-screen animated blur layers (17 fps in the headless smoke run once rebuilt on the same CSS).
Overall 4/10: charming wallpaper, but the same game as its sibling with a weaker engine and possible dead levels.

## Weaknesses identified
1. No identity as a *game* (a twin of Mystic). 2. Unverified levels. 3. No feel: nothing travelled, landed or reacted.
4. No goal variety or score chase. 5. Broken small-screen layout, no keyboard, no persistence safety.

## Creative opportunities
The theme is about wishes and transformation, so make sorting *create* things: charms that fuse upward into a unicorn,
a unicorn who states her wish in a speech bubble, sleepy charms that must be woken by their twin, a wand that grows a
charm, chain reactions as the big "magic" moment, and an endless gift-placing mode for score chasers.

## Planned improvements
New merge rule set + solver + generator with a tuned 40-wish curve; Rainbow Rush endless mode; persistent charm
elements that fly, land, pop and sparkle; pentatonic bells whose pitch follows the charm tier and chain; responsive
layout with side rails in landscape; keyboard; pause; persistence; test hook, test and review.

## Implemented improvements
- **Rules**: jars hold 3–5 charms. Tap a jar to lift its top charm, tap another to drop it: any jar with room accepts
  it, and a *full* jar still accepts a twin. Twins fuse into the next tier in the lower charm's slot; if the result now
  sits on its own twin it fuses again (chains). *Sleepy* charms (grey, "z z") cannot be lifted — and trap everything
  under them — until a twin is dropped on them. Wishes ask for one, two or three of a charm; because twins always
  fuse, multi-charm wishes force you to keep finished charms in different jars.
- **Wishes (40 + endless Dreamland)**: four chapters — 3 jars/2 charms up to 6 jars/19 charms/4 sleepers and a unicorn
  horn. Each deal splits the wished-for charms into smaller ones, deals them with no twins touching, and is **kept only
  if an A\* solver grants the wish under the real rules**; par is the shorter of two searches. Measured for wishes
  1–50: par 1, 1, 4, 4, 4, 5, 6, 7, 8, 7 then 7–12 (sleepers), 8–15, 14–16; generation ≤ 230 ms worst case, usually
  < 20 ms; no wish needed the relaxed fallback. ★★★ = par, ★★ = par + 25 %.
- **Help with a cost**: undo is free and unlimited (it also refunds a wand); a hint lights the jar to lift from and
  puts an arrow on the target but caps the wish at ★★; the wand grows any top charm one tier (also ★★ cap). Three
  wands to start, one more for every new ★★★. Wishes 1–2 are guided by a free hint.
- **Rainbow Rush**: five jars of five. A glowing gift charm (next one previewed in the unicorn's speech bubble) must be
  dropped each turn; fusions score 10 × 2^tier × chain step; a unicorn horn gallops off for +2000 and frees its slot.
  Sparkles (start 3, +1 per chain, +2 per unicorn, max 9) pay for jar-to-jar swaps. The run ends when the gift fits
  nowhere and no swap can help. Best score is saved and shown on the menu; `?seed` fixes the gift sequence.
- **Feel**: charms are persistent DOM nodes moved by transforms — lift with a wobble, glide over, fall, squash on
  landing, the consumed twin sinks into its partner which pops a size up with a ring of sparkles; chains play one step
  at a time with rising bells and "Chain ×3!" callouts. Game logic is instant and the show is a cancellable timeline,
  so the next tap never waits (it fast-forwards the previous animation). Valid target jars glow gold while a charm is
  held; refused drops shake the jar and say why.
- **Audio**: pentatonic bell per fusion pitched by tier and chain step, pick-up blip pitched by tier, landing thud,
  wand glissando, unicorn fanfare, star dings; a soft music-box waltz that rests every fourth phrase. Sound/music
  toggles, `M`, `?mute=1`; audio starts on the first gesture and suspends on pause/hidden.
- **Look & layout**: the original pastel sky, rainbow and unicorn art kept (the unicorn now presents each wish);
  seven charm glyphs drawn as SVG symbols with dark-on-pastel contrast (shape, not colour, identifies the tier), a
  ladder strip showing "2 alike = next"; Fredoka/Baloo 2 (vendored); compact top bar; side rails at 844×390; jars
  sized from the available board. Removed full-screen animated layers and backdrop blurs (smoke 17 → 56–61 fps).
- **Controls**: tap/click jars (whole column is the target); keys ←/→ + Space/Enter, 1–6 to tap a jar, Z undo, H hint,
  W wand, S swap, R restart, P/Esc pause, M mute, Enter for next. Verified working inside `play.html`'s iframe.
- **Robustness**: guarded storage, `gdl:best:games/unicorn-magic-sort` = highest wish granted, pause + auto-pause on
  hidden, ResizeObserver relayout, `prefers-reduced-motion`, `?seed`, `?autostart=1`, `?mute=1`, `?nopause=1`,
  `window.__gdl` (state, jarXY, solve, settle, goto, rush, gen).

## Test results
- **Smoke** (`node tools/smoke.js unicorn-magic-sort`): pass, 56–61 fps.
- **Gameplay** (`tests/games/unicorn-magic-sort.test.js`, 25 s, run four times): pass — menu → PLAY, lift/put back,
  tutorial fuse grants wish 1 → win card, ★★★, bonus wand, best key; wishes 2–3 by real taps (charm count falls, DOM
  matches model); refused drop on a full jar, undo, hint caps rating, wand grows a charm and undo refunds it; sleepy
  charm cannot be lifted and a sleeper wish is granted; keyboard cursor/number keys, Esc/P pause, restart; Rainbow
  Rush: fusing scores, preview becomes the gift, sparkle swaps, deliberately bad play fills the jars → game over,
  best stored, no input afterwards, clean replay with the same seeded gifts; reload keeps progress.
- **Screenshots inspected** at 390×844, 844×390, 1280×800: splash, tutorial, wish 27 with a held charm and sleepers,
  wish 13 with a hint, wish 35 in landscape, Rush mid-fusion, win card. Fixes from looking: jars were pinned to the
  bottom of a tall board, hint arrow floated too high, the next gift only appeared after the previous animation.
- **Iframe**: `play.html?g=games/unicorn-magic-sort` — keys work after pressing Play, pause/resume fine.
- **Subjective**: judged from scripted play, screenshots and code reading — not a human playtest; audio not heard.

## Remaining issues
- Par is usually just the number of fusions needed (the solver finds a route where every move fuses), so ★★★ means
  "never waste a move"; later wishes would be meatier with more deliberate digging (deeper sleepers, fewer jars).
- Rush is generous early (25 cells); it needs a human pass on pacing — tier-4 gifts after 2,500 points is the only ramp.
- Portrait leaves empty space above and below five jars (charm size is width-limited).
- A wish for two charms can be undone by fusing them together — intended, explained once, but it may surprise.
- Audio mix unverified by ear.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Fusing is rewarding on move one; chains are a real "ooh"; two modes with different rhythms |
| Mechanical depth | 7 | Order, space and sleepers matter and Rush has a risk/reward swap economy; wishes are gentler than Mystic's shelves |
| Game feel | 8 | Lift-wobble, glide, squash, pop, sparkles, stepped chains with rising bells; input never blocked |
| Visual identity | 8 | Pastel kingdom, glossy charm bubbles with their own glyphs, the unicorn voicing each wish |
| Animation quality | 8 | Everything travels and settles; unicorn fly-off; star pops; jars themselves are static |
| Audio quality | 7 | Tier- and chain-pitched bells, music-box waltz with rests; not verified by ear |
| Controls | 8 | Column-wide tap targets, gold target glow, full keyboard; no drag gesture |
| Onboarding | 9 | Wish stated with icons, guided first two wishes, ladder strip, one-time tips for sleepers and multi-wishes |
| Replayability | 8 | 40 wishes + endless Dreamland with stars, wands to earn, Rainbow Rush high score |
| Performance | 8 | 56–61 fps in smoke after removing full-screen blur/animation; ≤ 26 persistent nodes, short-lived sparkles |
| Technical robustness | 8 | Test covers both modes, restart, pause, reload; guarded storage; cancellable timeline keeps DOM = model |
| Overall polish | 8 | Menu → wish → card → next and Rush → game over → again are seamless; map, pause, toggles present |

## Next recommended action
Human playtest of Rush pacing and audio; add a drag gesture and one more wish twist (e.g. a locked jar that opens when
a given charm is made) to give chapters 3–4 more to dig through.
