# Phone Game Lab engine (v2) — `shared/core.js` + `shared/style.css`

One dependency-free script. A game is a single `games/<slug>/index.html`. The canonical copy lives in
`PhoneGameLab/shared/`; `node tools/sync-shared.js` mirrors it to `PhoneGameLab2/shared/` (never edit the copy).

**Reference implementation: `PhoneGameLab/games/37-star-jar/index.html`** — read it before writing a game.

## Skeleton

```html
<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>My Game</title>
<link rel="stylesheet" href="../../shared/style.css"><script src="../../shared/core.js"></script>
</head><body><script>
(function(){ "use strict";            // ALWAYS wrap: globals like `top`, `name`, `status`, `parent`, `event` collide with window
Lab.init({
  title: "My Game", tagline: "One-line pitch.", category: "Arcade & Action",   // title/tagline/category feed the generated catalog
  howto: ["Drag to aim", "Release to fire"],                                  // ≤3 short lines, shown on splash + pause
  theme: { bg:"#0d0b24", bg2:"#2a1f5c", accent:"#9b8cff", accent2:"#ff8fc7" /*, light:true for bright games */ },
  orient: "portrait",                 // 'portrait' (stage ≤ 0.68 aspect, centred on desktop) | 'landscape' | 'any' (fills window)
  music: { style:"dream", key:"D" },  // optional generative music (see Audio)
  restart: start,                     // called for every new run
  // also: kicker (small label above the title), attract:(dt,t)=>{…} (draws the backdrop behind the splash card),
  //       theme.fg / theme.muted, lowerIsBetter, formatScore:n=>string, hud:false, autoPause:false, maxDpr
});
function start(){ /* reset ALL state here */  Lab.loop(frame); }
function frame(dt, t){ /* update + draw; dt seconds (≤0.05, ~0 during hit-stop), t = game clock */ }
Lab.boot();                           // splash → start().  (v1 games called start() directly; still supported)
})();
</script></body></html>
```

## Lifecycle rules
- `start()` must fully reset state — it runs on first play and on every restart. Register input handlers inside it.
- Timers: use `Lab.after(sec, fn)` / `Lab.every(sec, fn)` / `Lab.tween(...)` — they follow the game clock, pause with the
  game and are cancelled on restart. **Do not use `setTimeout`/`setInterval` for gameplay.**
- `Lab.gameover({title, message?, score, stats:[['Label',value],…], lower?})` / `Lab.win({...})` end the run: logic freezes, the last frame
  is kept as a backdrop while particles/shake finish, then the card appears (score count-up, best score, confetti on new best).
  `neutral:true` is for runs that simply finish (time up, all trials done): no lose jingle, "Finished!" / "Play again".
  Passing `score` records the personal best (`lower:true` for time/moves games; `Lab.init({lowerIsBetter:true, formatScore})`).
- Pause (button, Esc/P, tab hidden, window blur) is handled by the engine; nothing to do. `Lab.paused` is readable.
- `Lab.setScore(n|string)` updates the HUD; `Lab.bumpScore()` pops it; `Lab.hint(text)` sets the line at the bottom
  (fades on the next touch; `Lab.hint(text,{sticky:true})` stays until replaced);
  `Lab.toast(text, ms)`; `Lab.banner("LEVEL 3", {color, ms})`.

## Layout
`Lab.W, Lab.H` (CSS px, change on resize → `Lab.onResize(fn)`), `Lab.dpr`, `Lab.play {x,y,w,h}` (area below the HUD and inside safe
areas — keep gameplay-critical things inside it), `Lab.safe {top,bottom,left,right}`, `Lab.hudH`.
Scale everything from the stage size (e.g. `const S = Math.min(Lab.W/390, Lab.play.h/700)`), never hardcode pixel positions.
Test at 390×844 and 844×390 (and 1280×800 desktop).

## Input (`Lab.input`)
- State: `down, x, y, dx, dy, startX, startY, pressT` (press event time on the `performance.now()` clock), `justDown, justUp, pointers[] ({id,x,y,startX,startY})` (multitouch), `keys{}` (by `e.key` and `e.code`),
  `pressed('Space')` (this frame), `axisX()/axisY()` (arrows + WASD → -1/0/1).
- Handlers (assign arrays inside `start()`): `onDown/onUp/onTap [(x,y,id)]`, `onMove [(x,y,dx,dy,id)]`, `onSwipe [(dx,dy,ms,x,y)]`, `onKey [(key,e)]`.
  Or `Lab.on('tap'|'down'|'up'|'move'|'swipe'|'key', fn)` (auto-removed on restart).
- `Lab.input.swipeEarly = true` fires `onSwipe` as soon as the finger travels 26px (snappy swipe games) instead of on release.
- Every game must be fully playable by touch **and** mouse, and should support keyboard where it makes sense.
- Tap = <300ms and <14px travel. For action games prefer `onDown` (instant) over `onTap` (fires on release).

## Game feel
`Lab.shake(mag=8, dur=.25)` · `Lab.flash(color, dur, alpha)` · `Lab.hitstop(sec=.06)` · `Lab.slowmo(scale=.3, sec=.5)` · `Lab.timeScale` · `Lab.buzz(ms)` (haptic)
- `Lab.fx.burst(x,y,{n,color|colors,speed,spread,angle,life,size,gravity,drag,shape:'circle|square|star|spark|ring|shard',glow})`
- `Lab.fx.ring(x,y,{r0,r1,color,life,width})` · `Lab.fx.text(x,y,"+10",{color,size,life})` · `Lab.fx.sparks(x,y,angle,{…})` · `Lab.fx.puff(x,y,{…})`
- `Lab.fx.confetti()` (UI layer) · particles draw automatically after your frame (`Lab.fx.auto=false` + `Lab.fx.draw(ctx)` to layer manually).
- `Lab.tween(obj,{x:10,scale:1},.3,{ease:'outBack',delay,onDone})` · `Lab.ease.` `linear inQuad outQuad inOutQuad inCubic outCubic inOutCubic outQuart inExpo outExpo inBack outBack inOutBack outElastic outBounce inSine outSine inOutSine (= sine) pulse (0→1→0)`
- `Lab.damp(current,target,lambda,dt)` for frame-rate independent smoothing. All motion must be dt-based.
- Honour `Lab.reducedMotion` for anything intense you draw yourself (shake/flash/hitstop already scale down automatically).

## Audio (procedural, autoplay-safe, user can mute sound/music in the pause menu or with M)
- `Lab.sfx(name,{pitch})` presets: tap click tick pop bubble coin gem pickup hit thud knock bounce boing jump land whoosh swish slide flip
  drop shoot laser zap explode boom crunch splash glass powerup levelup win lose error hurt unlock star whistle heartbeat warn spring snap chime
- `Lab.audio.combo(n)` — rising pentatonic ladder for streaks/chains. `Lab.audio.note('E5',{type,dur,vol})`, `Lab.audio.tone({f,f2,type,dur,vol,delay,lp})`,
  `Lab.audio.noise({dur,vol,lp|hp|bp,f2})` for custom sounds. Vary pitch with game state (size, speed, combo) so audio carries information.
- Music: `music:{style, key, bpm?, seed?, vol?}` in `Lab.init`; styles: bounce chill drive tense dream arcade puzzle funk march spooky.
  `Lab.music.intensity(0..1)` adds/removes layers — tie it to danger / speed / progress. (`win`/`lose` jingles play automatically.)

## Drawing helpers (`Lab.draw`, plain Canvas 2D via `Lab.ctx`)
`rr, rect(c,x,y,w,h,r,fill,stroke,lw), circle, line, star, poly, heart, text(c,str,x,y,{size,color,align,weight,stroke,shadow}), vgrad,
glow(c,x,y,r,color,alpha), bg(c,top,bottom,mid?), shadow(c,x,y,rx,ry,alpha), vignette(c,strength)` ·
`Lab.sprite(key,w,h,(g,w,h)=>{…})` caches expensive procedural art (draw with `drawImage(s,x,y,s.w,s.h)`; `Lab.sprite.clear('prefix')` evicts by key prefix) ·
`Lab.color.{shade(col,±amt),mix,alpha,hsl}` · `Lab.font(size,weight)`.
A sprite has a logical size (`s.w`,`s.h`); to bake a full-stage background that survives screen shake, bake it at
`W+80 × H+80` and draw it at `(-40,-40, s.w, s.h)` — never stretch a `W×H` sprite. Rebuild on `Lab.onResize`.
Avoid per-frame `shadowBlur` on many objects and per-frame gradient creation for many objects — bake into sprites.

## Math / utils
`rand(a,b) randInt(a,b) chance(p) choose(arr) shuffle(arr) clamp lerp map damp approach wrap angleDiff dist TAU fmt(n) fmtTime(s)
rng(seed) hash(str)` · `Lab.store.get/set(key,val)` (per-game persistent storage) · `Lab.best` · `Lab.submitScore(n,{lower})`.

## Testing hooks
- URL params: `?autostart=1` (skip splash) `?seed=123` (deterministic `Math.random`/`Lab.rand`) `?nopause=1` `?mute=1` `?fps=1`.
- `window.__lab.state` → `{running, paused, over, splash, score, best, frames, …}`; `__lab.start()/restart()/pause()/resume()`.
- `Lab.expose({...})` publishes game internals/actions as `__lab.game` so tests can drive real gameplay deterministically
  (e.g. `{ get score(){…}, get lives(){…}, drop(x){…} }`). Every v2 game must expose enough to verify score, lose/win and restart.
