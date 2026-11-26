# Pocket Pals — the cast and world of Phone Game Lab 2

Phone Game Lab 2 is **Pocket Pals**: 80 cozy, character-driven minigames starring an original mascot cast.
(The prototypes were modelled on a commercial virtual-pet app's minigames; every game here gets its own name, look and
twist, and the stars are *our* characters.) `shared/pals.js` draws them procedurally — include it after `core.js`:

```html
<script src="../../shared/core.js"></script><script src="../../shared/pals.js"></script>
```

| id | Name | Species | Personality (use it!) | Colours |
|----|------|---------|----------------------|---------|
| `pip` | Pip | fox kit | bold, impatient, loves speed and dares | orange / cream |
| `bun` | Bun | bunny | gentle, tidy, a little anxious; gardener and baker | lavender / pink |
| `momo` | Momo | frog | laid-back, hungry, surprisingly athletic | mint / pale green |
| `nori` | Nori | penguin | precise, competitive, obsessed with sliding and fish | navy / white / orange |
| `olli` | Olli | owl | bookish puzzle-solver, night-time and stars | brown / cream / amber |
| `bolt` | Bolt | robot | curious tinkerer; music, gadgets, space | yellow / cyan |

## API
`Pals.draw(ctx, who, x, y, size, opts)` — centred on (x, y); `size` is the body height in px (ears/antenna extend above).
- `mood`: `happy` `joy` `wow` `sad` `angry` `sleepy` `focus` `dizzy` `scared`
- `t`: pass the game clock for automatic blinking + breathing · `look:[x,y]` (−1..1) eye direction · `blink:0..1`
- `squash` (−.4…+.4; positive = flattened, pivot at the feet — use on landings/jumps) · `tilt` (radians) · `flip`
- `arms`: `down` `up` `wave` `cheer` `hold` · `talk:0..1` mouth open · `shadow:false` · `alpha` · `tint`
- `Pals.cast[id]` → `{name, kind, body, dark, belly, accent, cheek}` (build palettes from these) · `Pals.list` · `Pals.ink`

`Pals.backdrop(ctx, W, H, t, {scene, ground})` draws a cozy sky + sun + drifting clouds + hills and returns the ground Y.
Scenes: `meadow` `dusk` `night` `snow` `beach` `candy`. Use it as a base or draw your own world in the same spirit.

## House style for the collection
- Warm, rounded, toy-like; pastel-leaning palettes with one saturated accent; chunky outlines only where needed
  (`Pals.ink` = `#2b2340` for dark details, never pure black). Light themes are welcome (`theme:{light:true}`).
- The pal is an *actor*: it reacts (looks at the action, cheers on combos, flinches on misses, celebrates on the
  game-over card moment), it has weight (squash on land, stretch on jump), and the game's fiction is about it.
- Pick the pal whose personality fits the game; a game may feature several (rivals, customers, team-mates).
- Kicker for the splash card: pass `kicker: "Pocket Pals"` to `Lab.init`.
- Friendly failure: "Oops!" beats "GAME OVER"; keep stakes playful. Still make it a real game with real skill.
- Sound: bright, soft, musical (`bounce`, `chill`, `puzzle`, `dream`, `funk`, `march` music styles suit most).
