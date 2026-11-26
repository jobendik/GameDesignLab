---
id: games/sproutys-garden
title: Sprouty's Garden
was: Sprouty's Garden
status: transformed
baseline: 2
score: 7
updated: 2026-11-26
---
## Original concept and core mechanics
A garden idle-clicker skeleton: a 4×3 grid of plots drawn as grey squares with a seedling emoji, tap a plot to add
25 % growth and 3 "seeds", buy Bee / Worm / Fairy helpers and two upgrades from a shop strip, a Sprouty mascot (a large
seedling emoji), prestige, offline earnings and a fake "2x with Ad" button behind a portal SDK stub.

## Baseline assessment
Ran, but was not a game (screenshots inspected at all three viewports). Tapping any plot always paid out; water was
displayed but did nothing; "harvest" was a counter nothing used; plots levelled up invisibly; there was no goal, no
fail state, no opposition and no end. The canvas was a fixed 800×600 letterboxed into the corner, so on a phone the
grid filled a third of the screen and the shop covered the rest; the side panel showed a hard-coded "Water 5 plots"
goal. It imported a Google font, used emoji for all art, `alert`/`confirm` dialogs, and logged fake "tuning" output
to the console. No audio, no pause, no keyboard. What was worth keeping: the name and mascot, the plot grid, watering
as the verb, the bee/worm/fairy helpers and a shop.

## Weaknesses identified
1. No decisions and no loop: every tap is equally good forever.
2. Resources (water, harvest) were decorative.
3. Layout unusable on a phone; placeholder emoji art; external font.
4. Monetisation scaffolding (ad button, portal SDK stub, prestige, offline popup) instead of play.
5. No lifecycle handling, no audio, no touch drag, no keyboard.

## Creative opportunities
- Make water a real, scarce budget so watering is a choice, and make the day a deadline so the garden is a
  time-management puzzle rather than a number going up.
- Give the garden enemies that suit it (slugs, beetles, crows) and plants that fight back, so it plays as a light
  defence game without copying lane-defence games.
- Let the mascot carry the lives (leaves on Sprouty's head) and the tutorial (speech bubble).
- Swiping across a row of ripe crops is a naturally satisfying touch gesture — build the combo on it.
- Contrast with Neon Hagen: bright daytime storybook look, discrete grid tapping, economy and planning.

## Planned improvements
Rewrite as a day-by-day market garden: plant → water → harvest against a sunset deadline and a rising market order;
five crops with different roles; pests; a night shop built from the original helpers; three leaves as lives;
hand-drawn vector art; procedural audio and music; responsive layout; touch swipe, mouse and keyboard.

## Implemented improvements
- **Rewrite** in plain JS + Canvas 2D with a DOM HUD. No external requests (vendored Fredoka / Baloo 2), no SDK stubs,
  no dialogs. Fixed 60 Hz step, DPR-aware, capped particles and pests.
- **Core loop**: tap soil to plant the selected seed, tap again to water (the can holds 5 and refills over time), wait,
  tap to harvest. Seeds left thirsty for 15 s wilt. Each 50 s day (60 s on day 1) has a market order; the sun crosses
  the sky as the clock and the HUD counts down. Miss the order and Sprouty loses one of three leaves; a bumper day
  (150 %) regrows one. Score is everything earned plus day bonuses; best in `gdl:best:games/sproutys-garden`.
- **Crops with roles** (unlocking days 1–5): Radish (fast, cheap), Carrot (slower, better), Sunflower (permanent:
  speeds up neighbours and drips water into the can), Pumpkin (slow, drinks twice, sells big, a pest magnet),
  Snapdragon (permanent: chomps pests within reach). Shovel to dig up a plant.
- **Combo**: harvests within 1.6 s chain up to ×2, so letting a row ripen together and sweeping it pays more — while
  ripe crops are exactly what crows and slugs want.
- **Pests**: slugs (two taps), beetle pairs/trios (fast, one tap), crows that circle a ripe crop with a shrinking
  warning ring before diving (tap to shoo). Frequency and mix scale with the day.
- **Night shop**: three random offers from Bee Hive (growth), Worm Crew (value), Garden Fairy (auto-picks), Bigger
  Can, Well Pump, Scarecrow, Leaf Tonic, with rising prices — the original helpers, now with distinct effects.
- **Controls**: tap and swipe (a drag acts on each plot it enters and bonks pests it crosses), mouse, and full
  keyboard (arrows move a cursor, Space acts or bonks, 1–6 pick seeds, 1–3 buy at night, P/Esc pause, M mute).
- **Art and feel**: original outlined vector art for Sprouty (expressions: happy, cheering, worried, sad; visibly
  loses leaves), all crops, pests, bees, fairy and watering can; squash-and-pop on planting and harvest, coins that fly
  to the purse, splashes, dirt, sparkles on ripe crops, thirst bubbles that turn urgent (shape, shake and "!" as well
  as colour), sky that turns to evening and night.
- **Audio**: WebAudio after first gesture. Planting, watering, harvest notes that climb a major scale with the combo,
  coin, bonk, squish, chomp, crow caw, wilt, deny, last-10-seconds ticks, day-end jingles, plus a small generative
  bass-and-marimba loop that speeds up near sunset and calms at night. Mute button, remembered.
- **Onboarding**: day 1 is radishes only with a five-step speech-bubble tutorial and a pulsing target plot; the first
  slug is delayed and announced; each new seed is introduced by one sentence and a tray animation.
- **Layout**: 3×4 grid in portrait, 4×3 in landscape (same adjacency, transposed); the seed tray moves to the right
  edge in phone landscape; Sprouty sits below the field in portrait and beside it when wide; safe-area insets.
- Lifecycle: pause button/keys, auto-pause on hidden tab or blur, clean restart, resize-safe, `?seed`, `?autostart=1`,
  `?mute=1`, `?nopause=1`, inert `window.__gdl` hook.

## Test results
- **Automated-technical** (`node tools/smoke.js sproutys`): pass, 61 fps headless, no errors, no external requests.
- **Automated-gameplay** (`node tools/run-tests.js games/sproutys`): pass (≈8 s). Real taps plant, water and harvest;
  real CDP swipes plant/water/harvest a row and build a ×1.2 combo with exact coin values; locked seed refused; the
  can's 5-splash limit and refill; wilting and clearing; a slug needs two taps, an ignored one eats the crop;
  keyboard cursor, planting and shovel; pause freezes the clock; sunset with the order filled → night shop purchase →
  day 2 with carrots unlocked; three missed orders cost three leaves and end the run; best stored; clean restart.
  The script delays the random pest director through a test-only hook so the sequence is deterministic.
- **Visual inspection**: menu, early day 1, a busy day 5 (all three pest types, every crop), night shop and game over
  were looked at in portrait, landscape and desktop. Fixed from what I saw: sun hidden behind the HUD (added a
  countdown and lowered the arc), tiny water pips (added a number on the can), speech bubble covering Sprouty's
  leaves in wide layouts, menu overlay too dark.
- **Subjective playtest**: not a human playtest. Balance comes from a scripted bot: at about 1.1 actions per second
  it loses its last leaf on day 8–9 (roughly 7 minutes); at 2 actions per second it reaches day 11–17. Quotas, prices
  and pumpkin value were retuned once after the first bot run showed the economy was about eight times too generous.

## Remaining issues
- A good run is long (7–12 minutes) and the last days of a strong run are a slow decline rather than a climax.
- After all upgrades are maxed the shop only offers Leaf Tonic; late nights have little to decide.
- Pest variety is three types; the snapdragon plus fast tapping handles all of them the same way.
- Balance is bot-derived and the audio mix has never been listened to.
- Keyboard play is complete but slower than touch; there is no hold-to-repeat action across plots.
- With two fingers each new touch acts once, but only the first finger swipes.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Plant/water/harvest under a deadline with interruptions is a proven loop; untested with people |
| Mechanical depth | 7 | Water budget, crop roles and adjacency, combo timing versus pest risk, shop choices |
| Game feel | 7 | Every tap answers with pop, particles and sound; swipe harvesting; judged from stills and code |
| Visual identity | 8 | Cohesive outlined storybook style, expressive mascot, readable at 98 px plots |
| Animation quality | 7 | Sway, bob, squash, chomp lunge, crow circling, flying coins; pests have simple cycles |
| Audio quality | 6 | Full SFX set and adaptive loop by design; never heard, music is simple |
| Controls | 8 | Tap, swipe, mouse and keyboard all scripted-tested; hit areas are whole cells |
| Onboarding | 8 | Step-by-step first day with highlighted plot, staged unlocks, one-line tips |
| Replayability | 7 | Random shop offers and pest timing, rising orders, best score; one map, runs converge late |
| Performance | 8 | 60 fps headless, light vector drawing, bounded entities; not profiled on a phone |
| Technical robustness | 8 | Fixed step, pause/blur/resize, restart tested, storage guarded, no dialogs |
| Overall polish | 7 | Menu → day → shop → game over → retry is seamless; no placeholders |

## Next recommended action
Human playtest of days 1–6 to set quotas, then shorten the tail: steeper orders after day 8 or a fixed 10-day season
with a final score, and add two or three late shop items (a second seed tier, a rain-barrel ability) so nights stay
interesting once the basic helpers are maxed.
