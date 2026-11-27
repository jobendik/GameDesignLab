/* Phone Game Lab — shared engine v2  (documented in shared/ENGINE.md)
 *
 * One small dependency-free file that gives every phone game:
 *   shell (stage, HUD, splash, pause, game-over, toasts) · input (touch / multitouch / mouse / keys)
 *   frame-rate independent loop with pause, hit-stop, slow-mo, timers and tweens
 *   screen shake / flash / particles / floating text / confetti
 *   procedural audio: SFX presets, tones, noise, generative music with intensity layers
 *   persistent best scores + play history shared with the arcade launcher
 *   safe areas, high-DPI, reduced motion, perf meter, deterministic seed + test hooks
 *
 * v1 games keep working unchanged (same globals, same call signatures).
 */
(function (global) {
  'use strict';
  const Lab = {};
  global.Lab = Lab;
  const doc = document, TAU = Math.PI * 2;

  /* ------------------------------------------------------------------ identity + params */
  const segs = location.pathname.split('/').filter(Boolean);
  const gi = segs.lastIndexOf('games');
  const slug = gi >= 0 && segs[gi + 1] ? decodeURIComponent(segs[gi + 1]) : 'game';
  const labName = gi > 0 ? decodeURIComponent(segs[gi - 1]) : 'PhoneGameLab';
  Lab.id = labName + '/' + slug;
  const params = new URLSearchParams(location.search);
  Lab.params = params;

  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
  };
  Lab.store = {
    get: (k, d) => LS.get('gdl:' + Lab.id + ':' + k, d),
    set: (k, v) => LS.set('gdl:' + Lab.id + ':' + k, v),
  };

  /* ------------------------------------------------------------------ rng + math */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  Lab.rng = mulberry32;
  Lab.hash = hashStr;
  let random = Math.random;
  if (params.has('seed')) { random = mulberry32(+params.get('seed') || hashStr(params.get('seed'))); Math.random = random; }
  Lab.seeded = params.has('seed');
  Lab.random = () => random();
  Lab.rand = (a, b) => a + random() * (b - a);
  Lab.randInt = (a, b) => Math.floor(a + random() * (b - a + 1));
  Lab.chance = p => random() < p;
  Lab.choose = arr => arr[Math.floor(random() * arr.length)];
  Lab.shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; };
  Lab.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  Lab.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  Lab.lerp = (a, b, t) => a + (b - a) * t;
  Lab.map = (v, a, b, c, d) => c + (d - c) * Lab.clamp((v - a) / (b - a), 0, 1);
  Lab.damp = (a, b, lambda, dt) => Lab.lerp(a, b, 1 - Math.exp(-lambda * dt)); // frame-rate independent smoothing
  Lab.approach = (a, b, step) => a < b ? Math.min(a + step, b) : Math.max(a - step, b);
  Lab.wrap = (v, a, b) => { const r = b - a; return ((v - a) % r + r) % r + a; };
  Lab.angleDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
  Lab.TAU = TAU;
  Lab.fmt = n => { n = Math.round(n); const a = Math.abs(n); return a >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : a >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : a >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
  Lab.fmtTime = s => { s = Math.max(0, s); const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1); };

  const ease = Lab.ease = {
    linear: t => t,
    inQuad: t => t * t, outQuad: t => 1 - (1 - t) * (1 - t), inOutQuad: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    inCubic: t => t * t * t, outCubic: t => 1 - Math.pow(1 - t, 3), inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    outQuart: t => 1 - Math.pow(1 - t, 4), outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    inBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
    outBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    outElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (TAU / 3)) + 1,
    outBounce: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; },
    sine: t => .5 - Math.cos(t * Math.PI) / 2,
    inOutSine: t => .5 - Math.cos(t * Math.PI) / 2, inSine: t => 1 - Math.cos(t * Math.PI / 2), outSine: t => Math.sin(t * Math.PI / 2),
    inOutBack: t => t < .5 ? (Math.pow(2 * t, 2) * (3.5949095 * 2 * t - 2.5949095)) / 2 : (Math.pow(2 * t - 2, 2) * (3.5949095 * (t * 2 - 2) + 2.5949095) + 2) / 2,
    inExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
    pulse: t => Math.sin(t * Math.PI), // 0 → 1 → 0
  };

  /* ------------------------------------------------------------------ state */
  let canvas, ctx, stage, fxCanvas, fxCtx, dpr = 1, W = 0, H = 0;
  let hudEl, scoreEl, bestEl, titleEl, instrEl, pauseBtn, fpsEl;
  let opts = {}, restartCb = null;
  let mainLoop = null, running = false, paused = false, over = false, booted = false, splashUp = false;
  let clock = performance.now() / 1000, lastTs = 0, frames = 0;
  let timeScale = 1, slowT = 0, slowScale = 1, hitstopT = 0;
  let shakeMag = 0, shakeT = 0, shakeDur = 0, flashA = 0, flashDur = 0, flashT = 0, flashColor = '#fff';
  let lastScore = null, scoreSubmitted = false, exposed = null;
  const timers = [], tweens = [], autoHandlers = [], resizeCbs = [];
  const reduced = !!(global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  Lab.reducedMotion = reduced;
  Lab.safe = { top: 0, bottom: 0, left: 0, right: 0 };
  Lab.play = { x: 0, y: 0, w: 0, h: 0 };
  Lab.perf = { fps: 60, ms: 16, low: false };

  const input = {
    down: false, x: 0, y: 0, px: 0, py: 0, dx: 0, dy: 0,
    startX: 0, startY: 0, startT: 0,
    justDown: false, justUp: false,
    taps: [], keys: {}, pointers: [], swipeEarly: false,
    onDown: [], onUp: [], onMove: [], onTap: [], onSwipe: [], onKey: [],
    pressed(k) { return !!pressedKeys[k]; },
    /* -1/0/1 from arrows or WASD */
    axisX() { const k = input.keys; return ((k.ArrowRight || k.KeyD) ? 1 : 0) - ((k.ArrowLeft || k.KeyA) ? 1 : 0); },
    axisY() { const k = input.keys; return ((k.ArrowDown || k.KeyS) ? 1 : 0) - ((k.ArrowUp || k.KeyW) ? 1 : 0); },
  };
  let pressedKeys = {};
  Lab.input = input;

  /* ------------------------------------------------------------------ audio */
  const audioPrefs = LS.get('gdl:audio', { sfx: true, music: true });
  if (params.has('mute')) { audioPrefs.sfx = false; audioPrefs.music = false; }
  let ac = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null, unlocked = false;
  const lastPlayed = {}; let volMul = 1;
  function ensureAudio() {
    if (ac) return ac;
    try {
      const AC = global.AudioContext || global.webkitAudioContext; if (!AC) return null;
      ac = new AC();
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 18; comp.ratio.value = 5; comp.attack.value = .004; comp.release.value = .18;
      master = ac.createGain(); master.gain.value = .9;
      sfxBus = ac.createGain(); sfxBus.gain.value = audioPrefs.sfx ? 1 : 0;
      musicBus = ac.createGain(); musicBus.gain.value = audioPrefs.music ? .5 : 0;
      sfxBus.connect(master); musicBus.connect(master); master.connect(comp); comp.connect(ac.destination);
      const len = ac.sampleRate; noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; }
    return ac;
  }
  function unlockAudio() {
    if (unlocked) return; ensureAudio(); if (!ac) return;
    if (ac.state === 'suspended') ac.resume().catch(() => { });
    unlocked = true;
    if (music.pending) music.play(music.pending);
  }
  function tone(o) {
    if (!ac || !unlocked || !audioPrefs.sfx && !o.music) return;
    const t0 = ac.currentTime + (o.delay || 0), dur = o.dur || .1, vol = (o.vol == null ? .2 : o.vol) * volMul;
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(Math.max(20, o.f || 440), t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + dur * (o.slideAt || 1));
    if (o.detune) osc.detune.value = o.detune;
    const a = Math.min(o.a == null ? .004 : o.a, dur * .5);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t0 + a);
    if (o.hold) g.gain.setValueAtTime(vol, t0 + a + o.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + (o.hold || 0));
    let node = osc;
    if (o.lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(o.lp, t0); if (o.lp2) f.frequency.exponentialRampToValueAtTime(o.lp2, t0 + dur); f.Q.value = o.q || .7; node.connect(f); node = f; }
    node.connect(g); g.connect(o.music ? musicBus : sfxBus);
    osc.start(t0); osc.stop(t0 + dur + (o.hold || 0) + .03);
  }
  function noise(o) {
    if (!ac || !unlocked || !audioPrefs.sfx && !o.music) return;
    const t0 = ac.currentTime + (o.delay || 0), dur = o.dur || .1, vol = (o.vol == null ? .2 : o.vol) * volMul;
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const g = ac.createGain(), f = ac.createBiquadFilter();
    f.type = o.hp ? 'highpass' : o.bp ? 'bandpass' : 'lowpass';
    const f0 = o.hp || o.bp || o.lp || 4000;
    f.frequency.setValueAtTime(f0, t0); if (o.f2) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.f2), t0 + dur);
    f.Q.value = o.q || (o.bp ? 1.4 : .7);
    const a = Math.min(o.a == null ? .003 : o.a, dur * .6);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(o.music ? musicBus : sfxBus);
    src.start(t0, Math.random() * .5); src.stop(t0 + dur + .03);
  }
  const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function noteFreq(n) { // 'C4', 'F#5', 'Bb3' or midi number
    if (typeof n === 'number') return 440 * Math.pow(2, (n - 69) / 12);
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(n); if (!m) return 440;
    return 440 * Math.pow(2, (NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12 - 69) / 12);
  }
  const PENTA = [0, 2, 4, 7, 9];
  // nth step of a major-pentatonic ladder starting at C5: rising combos always sound musical
  function scaleFreq(i, base) { i = Math.max(0, Math.round(i)); return noteFreq((base || 72) + PENTA[i % 5] + 12 * Math.floor(i / 5)); }
  const SFX = {
    tap: p => tone({ f: 540 * p, f2: 760 * p, dur: .05, type: 'triangle', vol: .22 }),
    click: p => tone({ f: 1100 * p, dur: .022, type: 'square', vol: .07 }),
    tick: p => tone({ f: 1500 * p, dur: .018, type: 'sine', vol: .12 }),
    pop: p => { tone({ f: 380 * p, f2: 980 * p, dur: .07, vol: .32 }); noise({ dur: .035, vol: .1, hp: 2600 }); },
    bubble: p => tone({ f: 300 * p, f2: 1200 * p, dur: .09, vol: .22, slideAt: .8 }),
    coin: p => { tone({ f: 988 * p, dur: .07, type: 'square', vol: .09 }); tone({ f: 1319 * p, dur: .24, type: 'square', vol: .09, delay: .065 }); },
    gem: p => { tone({ f: 1320 * p, dur: .16, vol: .16 }); tone({ f: 1980 * p, dur: .22, vol: .1, delay: .05 }); tone({ f: 2640 * p, dur: .28, vol: .06, delay: .1 }); },
    pickup: p => tone({ f: 660 * p, f2: 1320 * p, dur: .1, type: 'triangle', vol: .2 }),
    hit: p => { noise({ dur: .08, vol: .3, lp: 2200, f2: 500 }); tone({ f: 190 * p, f2: 70 * p, dur: .1, type: 'triangle', vol: .38 }); },
    thud: p => { tone({ f: 130 * p, f2: 48 * p, dur: .16, vol: .5 }); noise({ dur: .05, vol: .14, lp: 700 }); },
    knock: p => { tone({ f: 240 * p, f2: 150 * p, dur: .05, type: 'triangle', vol: .32 }); noise({ dur: .02, vol: .12, bp: 1800 }); },
    bounce: p => tone({ f: 240 * p, f2: 520 * p, dur: .09, vol: .28 }),
    boing: p => tone({ f: 180 * p, f2: 620 * p, dur: .2, type: 'triangle', vol: .24, slideAt: .6 }),
    jump: p => tone({ f: 320 * p, f2: 720 * p, dur: .13, type: 'square', vol: .09, lp: 2400 }),
    land: p => { tone({ f: 150 * p, f2: 80 * p, dur: .07, vol: .3 }); noise({ dur: .04, vol: .1, lp: 900 }); },
    whoosh: p => noise({ dur: .22, vol: .2, bp: 500 * p, f2: 2600 * p, q: 1.2, a: .08 }),
    swish: p => noise({ dur: .11, vol: .18, bp: 2400 * p, f2: 900 * p, q: 1.6, a: .02 }),
    slide: p => noise({ dur: .09, vol: .1, bp: 1400 * p, f2: 2200 * p, q: 2 }),
    flip: p => { noise({ dur: .05, vol: .12, hp: 3000 }); tone({ f: 700 * p, f2: 500 * p, dur: .05, type: 'triangle', vol: .12 }); },
    drop: p => tone({ f: 700 * p, f2: 180 * p, dur: .14, vol: .22 }),
    shoot: p => { tone({ f: 880 * p, f2: 220 * p, dur: .1, type: 'sawtooth', vol: .1, lp: 3200 }); noise({ dur: .04, vol: .08, hp: 3000 }); },
    laser: p => tone({ f: 1500 * p, f2: 300 * p, dur: .16, type: 'square', vol: .08, lp: 4200 }),
    zap: p => { tone({ f: 200 * p, f2: 1600 * p, dur: .07, type: 'sawtooth', vol: .1 }); noise({ dur: .08, vol: .1, hp: 4000 }); },
    explode: p => { noise({ dur: .42, vol: .42, lp: 2800 * p, f2: 90 }); tone({ f: 120 * p, f2: 36, dur: .34, vol: .5 }); },
    boom: p => { noise({ dur: .7, vol: .5, lp: 1600 * p, f2: 50 }); tone({ f: 90 * p, f2: 28, dur: .55, vol: .6 }); },
    crunch: p => { noise({ dur: .09, vol: .26, bp: 1300 * p, q: .8 }); noise({ dur: .06, vol: .16, hp: 3600, delay: .03 }); },
    splash: p => { noise({ dur: .3, vol: .2, bp: 1800 * p, f2: 500, q: .6, a: .01 }); tone({ f: 500 * p, f2: 140, dur: .12, vol: .14 }); },
    glass: p => { for (let i = 0; i < 4; i++) tone({ f: (2200 + i * 730 + Math.random() * 300) * p, dur: .14 + i * .03, vol: .07, delay: i * .012 }); noise({ dur: .08, vol: .14, hp: 5000 }); },
    powerup: p => [0, 4, 7, 12, 16].forEach((s, i) => tone({ f: 440 * p * Math.pow(2, s / 12), dur: .1, type: 'square', vol: .07, delay: i * .05, lp: 3600 })),
    levelup: p => [0, 4, 7, 12].forEach((s, i) => tone({ f: 523.25 * p * Math.pow(2, s / 12), dur: i === 3 ? .34 : .12, type: 'triangle', vol: .2, delay: i * .09 })),
    win: p => { [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => tone({ f: 523.25 * p * Math.pow(2, s / 12), dur: i === 6 ? .5 : .13, type: 'triangle', vol: .2, delay: i * .1 })); [0, 4, 7].forEach(s => tone({ f: 261.6 * p * Math.pow(2, s / 12), dur: .6, vol: .1, delay: .6, type: 'sawtooth', lp: 1800 })); },
    lose: p => [0, -1, -3, -7].forEach((s, i) => tone({ f: 392 * p * Math.pow(2, s / 12), dur: i === 3 ? .5 : .18, type: 'triangle', vol: .2, delay: i * .16 })),
    error: p => { tone({ f: 160 * p, dur: .09, type: 'square', vol: .1, lp: 1200 }); tone({ f: 120 * p, dur: .14, type: 'square', vol: .1, delay: .1, lp: 1200 }); },
    hurt: p => { tone({ f: 420 * p, f2: 110 * p, dur: .2, type: 'sawtooth', vol: .14, lp: 2400 }); noise({ dur: .07, vol: .16, lp: 1600 }); },
    unlock: p => { tone({ f: 660 * p, dur: .07, type: 'triangle', vol: .18 }); tone({ f: 990 * p, dur: .18, type: 'triangle', vol: .18, delay: .08 }); },
    star: p => { tone({ f: 1568 * p, dur: .09, vol: .14 }); tone({ f: 2093 * p, dur: .3, vol: .12, delay: .07 }); },
    whistle: p => tone({ f: 900 * p, f2: 1800 * p, dur: .22, vol: .14, a: .03 }),
    heartbeat: p => { tone({ f: 70 * p, f2: 45, dur: .09, vol: .5 }); tone({ f: 60 * p, f2: 40, dur: .11, vol: .4, delay: .14 }); },
    warn: p => { tone({ f: 740 * p, dur: .09, type: 'square', vol: .07 }); tone({ f: 740 * p, dur: .09, type: 'square', vol: .07, delay: .15 }); },
    spring: p => tone({ f: 200 * p, f2: 900 * p, dur: .16, type: 'sine', vol: .22, slideAt: .5 }),
    snap: p => { noise({ dur: .02, vol: .26, hp: 2000 }); tone({ f: 1800 * p, f2: 600, dur: .03, vol: .14 }); },
    chime: p => [0, 7, 12, 19].forEach((s, i) => tone({ f: 880 * p * Math.pow(2, s / 12), dur: .5, vol: .07, delay: i * .03 })),
  };
  /* Lab.sfx(name, {pitch, vol, vary}) — plays a preset (vol is a 0..1.5 multiplier); identical sounds are rate-limited so bursts never clip. */
  Lab.sfx = function (name, o) {
    if (!unlocked || !audioPrefs.sfx || !ac) return;
    const fn = SFX[name]; if (!fn) return;
    const now = ac.currentTime; if (lastPlayed[name] && now - lastPlayed[name] < .028) return; lastPlayed[name] = now;
    const vary = o && o.vary != null ? o.vary : .04;
    volMul = o && o.vol != null ? o.vol : 1;
    try { fn(((o && o.pitch) || 1) * (1 + (Math.random() * 2 - 1) * vary)); } catch (e) { }
    volMul = 1;
  };
  Lab.sfxList = Object.keys(SFX);
  const audio = Lab.audio = {
    tone, noise, noteFreq, scaleFreq,
    /* play a pitched note: Lab.audio.note('E5', {type:'triangle', dur:.2, vol:.2}) */
    note(n, o) { tone(Object.assign({ f: noteFreq(n), dur: .18, type: 'triangle', vol: .2 }, o)); },
    /* rising pentatonic ladder — perfect for combos / chains: Lab.audio.combo(streak) */
    combo(i, o) { tone(Object.assign({ f: scaleFreq(i), dur: .16, type: 'triangle', vol: .22 }, o)); tone({ f: scaleFreq(i) * 2, dur: .1, vol: .06 }); },
    get sfxOn() { return audioPrefs.sfx; }, get musicOn() { return audioPrefs.music; },
    setSfx(on) { audioPrefs.sfx = !!on; LS.set('gdl:audio', audioPrefs); if (sfxBus) sfxBus.gain.value = on ? 1 : 0; },
    setMusic(on) { audioPrefs.music = !!on; LS.set('gdl:audio', audioPrefs); if (musicBus && ac) musicBus.gain.setTargetAtTime(on ? music.vol * music._duck : 0, ac.currentTime, .05); if (on && music.cfg && !music.timer) music.play(music.cfg); },
    get ctx() { return ac; },
    get unlocked() { return unlocked; },
  };
  /* Sustained sound for continuous things (rolling, wind, engine, charge):
   *   const h = Lab.audio.loop({noise:true, bp:600, q:1.2, vol:0})  or  ({type:'sawtooth', f:90, lp:800, vol:0})
   *   h.set({vol:.2, f:900}) every frame as state changes (smoothly ramped);  h.stop()  — loops also stop on restart / game over and mute while paused. */
  const loops = [];
  audio.loop = function (o) {
    o = o || {}; const h = { vol: o.vol || 0, dead: !ac || !unlocked, set() { }, stop() { } };
    if (h.dead) { h.set = function (v) { if (!h.dead || !ac || !unlocked) return; const n = audio.loop(Object.assign({}, o, v)); Object.assign(h, n); }; return h; }
    const g = ac.createGain(); g.gain.value = 0; const f = ac.createBiquadFilter(); let src;
    f.type = o.hp ? 'highpass' : o.bp ? 'bandpass' : 'lowpass'; f.frequency.value = o.hp || o.bp || o.lp || 2400; f.Q.value = o.q || .8;
    if (o.noise) { src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true; } else { src = ac.createOscillator(); src.type = o.type || 'sine'; src.frequency.value = o.f || 220; }
    src.connect(f); f.connect(g); g.connect(sfxBus); src.start();
    h.dead = false; h._g = g;
    h.set = function (v) { if (h.dead) return; const t = ac.currentTime; if (v.vol != null) { h.vol = v.vol; g.gain.setTargetAtTime(paused ? 0 : Math.max(0, v.vol), t, .04); } if (v.f != null) { if (o.noise) f.frequency.setTargetAtTime(Math.max(30, v.f), t, .04); else src.frequency.setTargetAtTime(Math.max(20, v.f), t, .04); } if (v.cutoff != null) f.frequency.setTargetAtTime(Math.max(30, v.cutoff), t, .04); };
    h.stop = function (fade) { if (h.dead) return; h.dead = true; const t = ac.currentTime; g.gain.setTargetAtTime(0, t, (fade || .08) / 3); try { src.stop(t + (fade || .08) + .1); } catch (e) { } const i = loops.indexOf(h); if (i >= 0) loops.splice(i, 1); };
    loops.push(h); h.set({ vol: h.vol }); return h;
  };
  function stopLoops() { while (loops.length) loops[0].stop(.05); }
  function muteLoops(m) { if (!ac) return; for (const h of loops) h._g.gain.setTargetAtTime(m ? 0 : h.vol, ac.currentTime, .04); }
  // v1 compat
  Lab.beep = function (freq = 440, dur = 0.06, type = 'square', gain = 0.05) { tone({ f: freq, dur: Math.max(.03, dur), type, vol: Math.min(.3, gain * 2.2), lp: type === 'square' || type === 'sawtooth' ? 3800 : 0 }); };
  Lab.buzz = function (p) { try { if (!reduced && navigator.vibrate && (unlocked || (navigator.userActivation && navigator.userActivation.hasBeenActive))) navigator.vibrate(p || 10); } catch (e) { } }; // browsers block vibrate before a user gesture

  /* ---- generative music: tiny step sequencer with per-game seeded riffs and intensity layers */
  const CH = { M: [0, 4, 7], m: [0, 3, 7], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], 7: [0, 4, 7, 10], sus: [0, 5, 7], add9: [0, 4, 7, 14] };
  const STYLES = {
    bounce: { bpm: 112, prog: [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']], lead: 'triangle', arp: 8, bass: 'beat', drums: 'pop', pad: .0, swing: .12 },
    chill: { bpm: 78, prog: [[0, 'M7'], [9, 'm7'], [2, 'm7'], [7, '7']], lead: 'sine', arp: 4, bass: 'long', drums: 'lofi', pad: .5, swing: .2 },
    drive: { bpm: 124, prog: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']], lead: 'sawtooth', arp: 16, bass: 'off', drums: 'four', pad: .25, swing: 0 },
    tense: { bpm: 104, prog: [[0, 'm'], [0, 'm'], [5, 'm'], [7, 'M']], lead: 'square', arp: 8, bass: 'pulse', drums: 'tick', pad: .2, swing: 0 },
    dream: { bpm: 66, prog: [[0, 'M7'], [5, 'M7'], [9, 'm7'], [5, 'add9']], lead: 'sine', arp: 4, bass: 'long', drums: 'none', pad: .8, swing: 0 },
    arcade: { bpm: 138, prog: [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M']], lead: 'square', arp: 16, bass: 'beat', drums: 'chip', pad: 0, swing: 0 },
    puzzle: { bpm: 92, prog: [[9, 'm7'], [5, 'M7'], [0, 'M'], [7, 'sus']], lead: 'sine', arp: 8, bass: 'long', drums: 'soft', pad: .3, swing: .1 },
    funk: { bpm: 104, prog: [[0, 'm7'], [5, '7'], [0, 'm7'], [10, 'M']], lead: 'square', arp: 16, bass: 'funk', drums: 'pop', pad: .1, swing: .22 },
    march: { bpm: 116, prog: [[0, 'M'], [5, 'M'], [0, 'M'], [7, '7']], lead: 'triangle', arp: 8, bass: 'beat', drums: 'march', pad: .1, swing: 0 },
    spooky: { bpm: 84, prog: [[0, 'm'], [1, 'M'], [0, 'm'], [6, 'M']], lead: 'triangle', arp: 4, bass: 'long', drums: 'tick', pad: .5, swing: 0 },
  };
  const music = Lab.music = {
    cfg: null, pending: null, timer: 0, step: 0, next: 0, vol: .5, level: .6, riff: null, _duck: 1,
    /* music.onBeat = (beatIndex, isDownbeat) => {…} fires on every quarter note in sync with the audio (cleared on restart);
       music.beatDur = seconds per beat — use both to lock spawns / pulses to the tune */
    onBeat: null, get beatDur() { return 60 / (music.bpm || 100); },
    styles: Object.keys(STYLES),
    /* Lab.music.play({style:'bounce', key:'C', bpm:112, seed:3, vol:.5}) */
    play(cfg) {
      if (typeof cfg === 'string') cfg = { style: cfg };
      cfg = Object.assign({ style: 'bounce' }, cfg);
      music.cfg = cfg;
      if (!unlocked || !ac) { music.pending = cfg; return; }
      music.pending = null;
      const st = STYLES[cfg.style] || STYLES.bounce;
      music.st = st; music.bpm = cfg.bpm || st.bpm;
      music.root = 48 + (NOTE_IDX[(cfg.key || 'C')[0]] || 0) + (/#/.test(cfg.key || '') ? 1 : /b/.test(cfg.key || '') ? -1 : 0);
      music.vol = cfg.vol == null ? .5 : cfg.vol;
      const r = mulberry32((cfg.seed == null ? hashStr(Lab.id) : cfg.seed) + 17);
      // seeded riff: 2 bars × 16 steps of chord-tone indices (-1 = rest); every game gets its own tune
      const dens = st.arp === 16 ? .62 : st.arp === 8 ? .78 : .9, stride = 16 / st.arp;
      music.riff = []; let prev = 0;
      for (let i = 0; i < 32; i++) {
        if (i % stride) { music.riff.push(-1); continue; }
        if (r() > dens && i % 16) { music.riff.push(-1); continue; }
        prev = Lab.clamp(prev + Math.round((r() - .45) * 3), 0, 6); music.riff.push(prev);
      }
      music.fill = Array.from({ length: 16 }, () => r());
      music.step = 0; music.next = ac.currentTime + .08;
      if (musicBus) musicBus.gain.setTargetAtTime(audioPrefs.music ? music.vol * music._duck : 0, ac.currentTime, .1);
      if (!music.timer) music.timer = setInterval(music.tick, 40);
    },
    stop() { if (music.timer) clearInterval(music.timer); music.timer = 0; music.cfg = null; music.pending = null; },
    /* 0..1 — adds/removes layers (drums, arps, octave lead). Tie it to danger, speed or combo. */
    intensity(v) { music.level = Lab.clamp(v, 0, 1); },
    duck(v) { music._duck = v; if (musicBus && ac) musicBus.gain.setTargetAtTime(audioPrefs.music ? music.vol * v : 0, ac.currentTime, .15); },
    tick() {
      if (!ac || !music.cfg || !audioPrefs.music || doc.hidden) { if (ac) music.next = Math.max(music.next, ac.currentTime + .05); return; }
      const st = music.st, spb = 60 / music.bpm / 4; let guard = 0;
      while (music.next < ac.currentTime + .14 && guard++ < 8) {
        const s = music.step, bar = Math.floor(s / 16) % st.prog.length, i16 = s % 16, lv = music.level;
        const [deg, q] = st.prog[bar], chord = CH[q], root = music.root + deg;
        const dl = Math.max(0, music.next - ac.currentTime) + ((i16 % 2) ? st.swing * spb : 0);
        const mt = o => tone(Object.assign({ music: true, delay: dl }, o)), mn = o => noise(Object.assign({ music: true, delay: dl }, o));
        // pad
        if (st.pad && i16 === 0) for (const c of chord) mt({ f: noteFreq(root + 12 + c), dur: spb * 15, type: 'triangle', vol: .035 * st.pad * 2, a: spb * 3, lp: 1400 });
        // bass
        const bf = noteFreq(root - 12);
        if (st.bass === 'beat' && (i16 === 0 || i16 === 8 || (i16 === 6 && lv > .5) || (i16 === 14 && lv > .7))) mt({ f: i16 === 6 || i16 === 14 ? bf * 1.5 : bf, dur: spb * 2.6, type: 'triangle', vol: .2 });
        if (st.bass === 'long' && i16 === 0) mt({ f: bf, dur: spb * 12, type: 'sine', vol: .2, a: .03 });
        if (st.bass === 'off' && i16 % 4 === 2) mt({ f: bf, dur: spb * 1.7, type: 'sawtooth', vol: .12, lp: 500, lp2: 180 });
        if (st.bass === 'pulse' && i16 % 2 === 0) mt({ f: bf, dur: spb * 1.2, type: 'square', vol: .07, lp: 420 });
        if (st.bass === 'funk' && [0, 3, 6, 10, 11, 14].includes(i16)) mt({ f: i16 === 11 ? bf * 2 : bf, dur: spb * 1.3, type: 'square', vol: .09, lp: 700, lp2: 220 });
        // riff
        if (lv > .15) {
          const n = music.riff[s % 32];
          if (n >= 0) {
            const semi = chord[n % chord.length] + 12 * Math.floor(n / chord.length);
            const f = noteFreq(root + 24 + semi);
            const lvVol = st.lead === 'sine' ? .1 : st.lead === 'triangle' ? .09 : .04;
            mt({ f, dur: spb * (st.arp === 16 ? 1.6 : 3.2), type: st.lead, vol: lvVol, lp: st.lead === 'sawtooth' ? 2600 : st.lead === 'square' ? 3000 : 0, lp2: st.lead === 'sawtooth' ? 700 : 0 });
            if (lv > .8 && i16 % 4 === 0) mt({ f: f * 2, dur: spb * 1.5, type: 'sine', vol: .035 });
          }
        }
        // drums
        if (lv > .35 && st.drums !== 'none') {
          const d = st.drums, kick = () => mt({ f: 150, f2: 42, dur: .16, vol: d === 'lofi' || d === 'soft' ? .3 : .42 }),
            snare = v => { mn({ dur: .12, vol: v, bp: 1900, q: .7 }); mt({ f: 210, f2: 150, dur: .07, vol: v * .7, type: 'triangle' }); },
            hat = v => mn({ dur: .028, vol: v, hp: 7000 });
          if (d === 'pop') { if (i16 === 0 || i16 === 8 || (i16 === 10 && music.fill[bar] > .5)) kick(); if (i16 === 4 || i16 === 12) snare(.13); if (i16 % 2 === 0) hat(i16 % 4 === 2 ? .05 : .028); }
          if (d === 'four') { if (i16 % 4 === 0) kick(); if (i16 === 4 || i16 === 12) snare(.11); if (i16 % 4 === 2) hat(.06); else if (lv > .7) hat(.02); }
          if (d === 'lofi') { if (i16 === 0 || i16 === 10) kick(); if (i16 === 4 || i16 === 12) snare(.09); if (i16 % 4 === 2) hat(.03); }
          if (d === 'soft') { if (i16 === 0) kick(); if (i16 % 4 === 2) hat(.025); if (i16 === 12 && lv > .6) snare(.05); }
          if (d === 'tick') { if (i16 % 4 === 0) hat(.04); if (i16 === 0 && lv > .5) kick(); if (lv > .75 && i16 % 2 === 0) hat(.02); }
          if (d === 'chip') { if (i16 % 8 === 0) mt({ f: 180, f2: 50, dur: .08, type: 'square', vol: .1 }); if (i16 % 8 === 4) mn({ dur: .06, vol: .08, hp: 2500 }); if (i16 % 2 === 0 && lv > .6) mn({ dur: .015, vol: .03, hp: 8000 }); }
          if (d === 'march') { if (i16 === 0 || i16 === 8) kick(); if ([4, 10, 12, 14, 15].includes(i16)) snare(i16 >= 14 ? .05 : .09); }
        }
        if (music.onBeat && i16 % 4 === 0) { const b = Math.floor(s / 4), fn = music.onBeat; setTimeout(() => { if (!paused && music.onBeat === fn) try { fn(b, b % 4 === 0); } catch (e) { console.error(e); } }, dl * 1000); }
        music.step++; music.next += spb;
      }
    },
  };

  /* ------------------------------------------------------------------ fx: particles, text, rings, confetti */
  const parts = [];
  const MAXP = 700;
  const fx = Lab.fx = {
    auto: true, list: parts,
    /* fx.burst(x,y,{n,color|colors,speed,spread,angle,life,size,gravity,drag,shape:'circle|square|star|spark|ring|shard',glow}) */
    burst(x, y, o) {
      o = o || {};
      let n = o.n == null ? 12 : o.n; if (Lab.perf.low) n = Math.ceil(n * .5); if (reduced) n = Math.ceil(n * .5);
      const sp = o.speed == null ? 220 : o.speed, spread = o.spread == null ? TAU : o.spread, ang = o.angle || 0;
      for (let i = 0; i < n && parts.length < MAXP; i++) {
        const a = ang + (random() - .5) * spread, v = sp * (.35 + random() * .65);
        parts.push({
          k: 0, x, y, vx: Math.cos(a) * v + (o.vx || 0), vy: Math.sin(a) * v + (o.vy || 0),
          life: (o.life == null ? .6 : o.life) * (.6 + random() * .4), t: 0,
          size: (o.size == null ? 4 : o.size) * (.6 + random() * .7), g: o.gravity == null ? 500 : o.gravity, drag: o.drag == null ? 1.6 : o.drag,
          color: o.colors ? o.colors[(random() * o.colors.length) | 0] : (o.color || '#fff'),
          shape: o.shape || 'circle', rot: random() * TAU, vr: (random() - .5) * 12, glow: o.glow || 0, fade: o.fade !== false, shrink: o.shrink !== false,
        });
      }
    },
    /* expanding ring shockwave */
    ring(x, y, o) { o = o || {}; if (parts.length < MAXP) parts.push({ k: 1, x, y, t: 0, life: o.life || .4, r0: o.r0 || 4, r1: o.r1 || 60, color: o.color || '#fff', w: o.width || 4 }); },
    /* floating text (score popups, PERFECT!, +combo) */
    text(x, y, str, o) { o = o || {}; if (parts.length < MAXP) parts.push({ k: 2, x, y, t: 0, life: o.life || .9, str: String(str), color: o.color || '#fff', size: o.size || 22, vy: o.vy == null ? -60 : o.vy, weight: o.weight || 800, outline: o.outline === undefined ? 'rgba(0,0,0,.35)' : o.outline, pop: o.pop !== false }); },
    /* directional sparks */
    sparks(x, y, angle, o) { fx.burst(x, y, Object.assign({ n: 8, shape: 'spark', spread: .9, angle, speed: 380, life: .32, gravity: 300, size: 3 }, o)); },
    /* soft dust puff */
    puff(x, y, o) { fx.burst(x, y, Object.assign({ n: 6, speed: 60, life: .5, gravity: -30, size: 7, drag: 3, color: 'rgba(255,255,255,.5)' }, o)); },
    clear() { parts.length = 0; },
    update(dt) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.t += dt;
        if (p.t >= p.life) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
        if (p.k === 0) { const d = Math.exp(-p.drag * dt); p.vx *= d; p.vy = p.vy * d + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
        else if (p.k === 2) { p.y += p.vy * dt; p.vy *= Math.exp(-2.2 * dt); }
      }
    },
    draw(c) {
      c = c || ctx;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i], u = p.t / p.life;
        if (p.k === 0) {
          const s = p.shrink ? p.size * (1 - u * u) : p.size; if (s <= .2) continue;
          c.globalAlpha = p.fade ? Math.min(1, (1 - u) * 1.6) : 1; c.fillStyle = p.color;
          if (p.glow) { c.shadowColor = p.color; c.shadowBlur = p.glow; }
          if (p.shape === 'circle') { c.beginPath(); c.arc(p.x, p.y, s, 0, TAU); c.fill(); }
          else if (p.shape === 'spark') { const l = Math.hypot(p.vx, p.vy) * .035 + s; const a = Math.atan2(p.vy, p.vx); c.strokeStyle = p.color; c.lineWidth = s * .8; c.lineCap = 'round'; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - Math.cos(a) * l, p.y - Math.sin(a) * l); c.stroke(); }
          else if (p.shape === 'ring') { c.strokeStyle = p.color; c.lineWidth = Math.max(1, s * .4); c.beginPath(); c.arc(p.x, p.y, s, 0, TAU); c.stroke(); }
          else { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); if (p.shape === 'star') { starPath(c, 0, 0, s * 1.3, 5, .5); c.fill(); } else if (p.shape === 'shard') { c.beginPath(); c.moveTo(-s, -s * .6); c.lineTo(s * 1.2, 0); c.lineTo(-s * .4, s * .8); c.closePath(); c.fill(); } else c.fillRect(-s, -s, s * 2, s * 2); c.restore(); }
          if (p.glow) c.shadowBlur = 0;
        } else if (p.k === 1) {
          const e = ease.outCubic(u); c.globalAlpha = 1 - u; c.strokeStyle = p.color; c.lineWidth = p.w * (1 - u) + .5;
          c.beginPath(); c.arc(p.x, p.y, p.r0 + (p.r1 - p.r0) * e, 0, TAU); c.stroke();
        } else {
          const sc = p.pop ? (u < .18 ? ease.outBack(u / .18) : 1) : 1;
          c.globalAlpha = u > .65 ? 1 - (u - .65) / .35 : 1;
          c.font = `${p.weight} ${Math.round(p.size * sc)}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
          if (p.outline) { c.lineWidth = Math.max(3, p.size * .18); c.strokeStyle = p.outline; c.lineJoin = 'round'; c.strokeText(p.str, p.x, p.y); }
          c.fillStyle = p.color; c.fillText(p.str, p.x, p.y);
        }
      }
      c.globalAlpha = 1;
    },
    /* celebratory confetti on the UI layer (keeps animating over the game-over card) */
    confetti(o) {
      o = o || {}; const n = reduced ? 24 : (o.n || 90), cols = o.colors || ['#ff5d73', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff9f1c'];
      for (let i = 0; i < n; i++) conf.push({ x: o.x == null ? random() * W : o.x, y: o.y == null ? -20 - random() * H * .3 : o.y, vx: (random() - .5) * (o.x == null ? 160 : 620), vy: o.y == null ? 120 + random() * 260 : -300 - random() * 520, r: random() * TAU, vr: (random() - .5) * 14, s: 5 + random() * 6, c: cols[i % cols.length], t: 0, life: 2.6 + random() * 1.6, w: random() * TAU });
    },
  };
  const conf = [];
  function drawConfetti(dt) {
    if (!fxCtx) return;
    if (!conf.length) { if (fxCanvas._dirty) { fxCtx.clearRect(0, 0, W, H); fxCanvas._dirty = false; } return; }
    fxCtx.clearRect(0, 0, W, H); fxCanvas._dirty = true;
    for (let i = conf.length - 1; i >= 0; i--) {
      const p = conf[i]; p.t += dt; if (p.t > p.life || p.y > H + 40) { conf.splice(i, 1); continue; }
      p.vy += 520 * dt; p.vy *= Math.exp(-1.4 * dt); p.vx *= Math.exp(-.9 * dt); p.x += (p.vx + Math.sin(p.t * 5 + p.w) * 50) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      fxCtx.save(); fxCtx.translate(p.x, p.y); fxCtx.rotate(p.r); fxCtx.scale(1, Math.cos(p.t * 9 + p.w)); fxCtx.globalAlpha = Math.min(1, (p.life - p.t) * 2);
      fxCtx.fillStyle = p.c; fxCtx.fillRect(-p.s, -p.s * .5, p.s * 2, p.s); fxCtx.restore();
    }
  }

  Lab.shake = function (mag, dur) { mag = (mag == null ? 8 : mag) * (reduced ? .2 : 1); if (mag >= shakeMag * (shakeDur ? Math.max(0, 1 - shakeT / shakeDur) : 0)) { shakeMag = mag; shakeDur = dur || .25; shakeT = 0; } };
  Lab.flash = function (color, dur, alpha) { flashColor = color || '#fff'; flashDur = dur || .14; flashT = 0; flashA = (alpha == null ? .5 : alpha) * (reduced ? .35 : 1); };
  Lab.hitstop = function (sec) { hitstopT = Math.max(hitstopT, reduced ? 0 : (sec == null ? .06 : sec)); };
  Lab.slowmo = function (scale, sec) { slowScale = scale == null ? .3 : scale; slowT = sec == null ? .5 : sec; };
  Object.defineProperty(Lab, 'timeScale', { get: () => timeScale, set: v => { timeScale = v; } });

  /* ------------------------------------------------------------------ timers + tweens (game clock, cleared on restart) */
  Lab.after = function (sec, fn) { const t = { t: sec, fn, every: 0, dead: false }; timers.push(t); return () => { t.dead = true; }; };
  Lab.every = function (sec, fn) { const t = { t: sec, fn, every: sec, dead: false }; timers.push(t); return () => { t.dead = true; }; };
  /* Lab.tween(obj, {x:100, alpha:0}, .3, {ease:'outBack', delay:0, onDone, onUpdate}) */
  Lab.tween = function (obj, to, dur, o) {
    o = o || {}; if (typeof o === 'string' || typeof o === 'function') o = { ease: o };
    const tw = { obj, to, from: null, dur: Math.max(.0001, dur), t: -(o.delay || 0), ease: typeof o.ease === 'function' ? o.ease : (ease[o.ease] || ease.outCubic), onDone: o.onDone, onUpdate: o.onUpdate, dead: false };
    tweens.push(tw); return { cancel() { tw.dead = true; }, get done() { return tw.dead; } };
  };
  function stepTimers(dt) {
    for (let i = 0; i < timers.length; i++) {
      const t = timers[i]; if (t.dead) continue; t.t -= dt;
      if (t.t <= 0) { if (t.every) t.t += t.every; else t.dead = true; try { t.fn(); } catch (e) { console.error(e); } }
    }
    for (let i = timers.length - 1; i >= 0; i--) if (timers[i].dead) timers.splice(i, 1);
    for (let i = 0; i < tweens.length; i++) {
      const tw = tweens[i]; if (tw.dead) continue; tw.t += dt; if (tw.t < 0) continue;
      if (!tw.from) { tw.from = {}; for (const k in tw.to) tw.from[k] = tw.obj[k]; }
      const u = Math.min(1, tw.t / tw.dur), e = tw.ease(u);
      for (const k in tw.to) tw.obj[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
      if (tw.onUpdate) tw.onUpdate(e);
      if (u >= 1) { tw.dead = true; if (tw.onDone) try { tw.onDone(); } catch (err) { console.error(err); } }
    }
    for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].dead) tweens.splice(i, 1);
  }

  /* ------------------------------------------------------------------ drawing helpers */
  const FONT = '"Fredoka","Baloo 2","Nunito",ui-rounded,"SF Pro Rounded","Segoe UI",system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif';
  Lab.FONT = FONT;
  Lab.font = (size, weight) => `${weight || 800} ${Math.round(size)}px ${FONT}`;
  function starPath(c, x, y, r, n, inner) { n = n || 5; inner = inner == null ? .5 : inner; c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * inner : r; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
  function parseColor(col) {
    if (col[0] === '#') { let h = col.slice(1); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; const n = parseInt(h.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
    const m = col.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2]] : [255, 255, 255];
  }
  const sprites = new Map();
  const draw = Lab.draw = {
    /* rounded-rect path */
    rr(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
    rect(c, x, y, w, h, r, fill, stroke, lw) { draw.rr(c, x, y, w, h, r || 0); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); } },
    circle(c, x, y, r, fill, stroke, lw) { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); } },
    line(c, x1, y1, x2, y2, color, lw) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = lw || 2; c.stroke(); },
    star(c, x, y, r, fill, n, inner) { starPath(c, x, y, r, n, inner); if (fill) { c.fillStyle = fill; c.fill(); } },
    poly(c, x, y, r, n, rot, fill) { c.beginPath(); for (let i = 0; i < n; i++) { const a = (rot || 0) + i * TAU / n; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } },
    heart(c, x, y, s, fill) { c.beginPath(); c.moveTo(x, y + s * .9); c.bezierCurveTo(x - s * 1.5, y - s * .1, x - s * .8, y - s * 1.1, x, y - s * .35); c.bezierCurveTo(x + s * .8, y - s * 1.1, x + s * 1.5, y - s * .1, x, y + s * .9); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } },
    /* text(c,'Hi',x,y,{size,color,align,baseline,weight,stroke,strokeW,shadow,maxWidth,font}) */
    text(c, str, x, y, o) {
      o = o || {}; c.font = o.font || Lab.font(o.size || 18, o.weight); c.textAlign = o.align || 'center'; c.textBaseline = o.baseline || 'middle';
      if (o.shadow) { c.fillStyle = o.shadow === true ? 'rgba(0,0,0,.35)' : o.shadow; c.fillText(str, x, y + Math.max(1.5, (o.size || 18) * .08), o.maxWidth); }
      if (o.stroke) { c.lineJoin = 'round'; c.lineWidth = o.strokeW || Math.max(3, (o.size || 18) * .16); c.strokeStyle = o.stroke; c.strokeText(str, x, y, o.maxWidth); }
      c.fillStyle = o.color || '#fff'; c.fillText(str, x, y, o.maxWidth);
    },
    /* vertical gradient fill of a rect: vgrad(c, x,y,w,h, ['#123','#456']) or [[0,'#123'],[.6,'#234'],[1,'#456']] */
    vgrad(c, x, y, w, h, stops) { const g = c.createLinearGradient(0, y, 0, y + h); stops.forEach((s, i) => Array.isArray(s) ? g.addColorStop(s[0], s[1]) : g.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(x, y, w, h); },
    /* soft radial glow blob */
    glow(c, x, y, r, color, alpha) { const [R, G, B] = parseColor(color); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${R},${G},${B},${alpha == null ? .6 : alpha})`); g.addColorStop(1, `rgba(${R},${G},${B},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); },
    /* full-stage background gradient */
    bg(c, top, bottom, mid) { draw.vgrad(c, -40, -40, W + 80, H + 80, mid ? [top, mid, bottom] : [top, bottom || top]); },
    /* soft drop shadow ellipse under things */
    shadow(c, x, y, rx, ry, alpha) { c.fillStyle = `rgba(0,0,0,${alpha == null ? .22 : alpha})`; c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry == null ? rx * .32 : ry), 0, 0, TAU); c.fill(); },
    /* vignette to focus the eye; cheap (cached sprite) */
    vignette(c, strength) { const s = Lab.sprite('__vig' + (strength || .35), 256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, w * .28, w / 2, h / 2, w * .72); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${strength || .35})`); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); c.drawImage(s, -40, -40, W + 80, H + 80); },
  };
  /* cached offscreen sprite: Lab.sprite('key', w, h, (g,w,h)=>{...}) → canvas (draw with drawImage(s,x,y,w,h)) */
  Lab.sprite = function (key, w, h, fn) {
    let s = sprites.get(key); if (s && s._dpr === dpr) return s;
    s = doc.createElement('canvas'); s.width = Math.max(1, Math.ceil(w * dpr)); s.height = Math.max(1, Math.ceil(h * dpr)); s._dpr = dpr; s.w = w; s.h = h;
    const g = s.getContext('2d'); g.scale(dpr, dpr); fn(g, w, h); sprites.set(key, s); return s;
  };
  /* Lab.sprite.clear() drops everything; Lab.sprite.clear('card:') drops only keys starting with that prefix */
  Lab.sprite.clear = prefix => { if (prefix == null) sprites.clear(); else for (const k of Array.from(sprites.keys())) if (k.indexOf(prefix) === 0) sprites.delete(k); };
  Lab.color = {
    parse: parseColor,
    hsl: (h, s, l, a) => a == null ? `hsl(${h},${s}%,${l}%)` : `hsla(${h},${s}%,${l}%,${a})`,
    alpha(col, a) { const [r, g, b] = parseColor(col); return `rgba(${r},${g},${b},${a})`; },
    mix(c1, c2, t) { const a = parseColor(c1), b = parseColor(c2); return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`; },
    /* amt in -1..1: darken / lighten */
    shade(col, amt) { return amt < 0 ? Lab.color.mix(col, '#000000', -amt) : Lab.color.mix(col, '#ffffff', amt); },
  };

  /* ------------------------------------------------------------------ shell */
  const ICON = {
    back: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="5" y="4" width="5" height="16" rx="1.6" fill="currentColor"/><rect x="14" y="4" width="5" height="16" rx="1.6" fill="currentColor"/></svg>',
  };
  function readSafe() {
    const p = doc.createElement('div');
    p.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    doc.body.appendChild(p); const cs = getComputedStyle(p);
    Lab.safe.top = parseFloat(cs.paddingTop) || 0; Lab.safe.right = parseFloat(cs.paddingRight) || 0; Lab.safe.bottom = parseFloat(cs.paddingBottom) || 0; Lab.safe.left = parseFloat(cs.paddingLeft) || 0;
    p.remove();
  }
  function resize() {
    readSafe();
    const vw = global.innerWidth, vh = global.innerHeight;
    let sw = vw, sh = vh;
    if (opts.orient === 'portrait') { sw = Math.min(vw, Math.round(vh * (opts.maxAspect || .68))); }
    else if (opts.orient === 'landscape') { sh = Math.min(vh, Math.round(vw * (opts.maxAspect || .68))); }
    stage.style.width = sw + 'px'; stage.style.height = sh + 'px';
    stage.style.left = Math.round((vw - sw) / 2) + 'px'; stage.style.top = Math.round((vh - sh) / 2) + 'px';
    stage.classList.toggle('lab-framed', sw < vw - 2 || sh < vh - 2);
    dpr = Math.min(opts.maxDpr || 2.5, global.devicePixelRatio || 1);
    while (dpr > 1 && sw * sh * dpr * dpr > 3.2e6) dpr -= .25; // pixel budget keeps low-end GPUs smooth
    const changed = W !== sw || H !== sh;
    W = sw; H = sh;
    for (const cv of [canvas, fxCanvas]) { cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    Lab.W = W; Lab.H = H; Lab.dpr = dpr;
    const full = sw >= vw - 2 && sh >= vh - 2;
    const st = full ? Lab.safe.top : 0, sb = full ? Lab.safe.bottom : 0, sl = full ? Lab.safe.left : 0, sr = full ? Lab.safe.right : 0;
    const hudH = 52 + st;
    Lab.play.x = sl; Lab.play.y = hudH; Lab.play.w = W - sl - sr; Lab.play.h = H - hudH - sb; Lab.hudH = hudH;
    if (changed) for (const f of resizeCbs) try { f(W, H); } catch (e) { console.error(e); }
  }
  Lab.onResize = fn => { resizeCbs.push(fn); };

  function fire(arr, a, b, c, d, e) { if (!arr) return; for (let i = 0; i < arr.length; i++) try { arr[i](a, b, c, d, e); } catch (err) { console.error(err); } }
  function fireAuto(type, a, b, c, d, e) { for (let i = 0; i < autoHandlers.length; i++) if (autoHandlers[i].type === type) try { autoHandlers[i].fn(a, b, c, d, e); } catch (err) { console.error(err); } }
  /* Lab.on('tap'|'down'|'up'|'move'|'swipe'|'key', fn) — like input.onTap but auto-removed on restart */
  Lab.on = function (type, fn) { autoHandlers.push({ type, fn }); };

  /* Lab.setTheme({bg,bg2,fg,accent,accent2,muted,light}) — retint the HUD/cards at runtime (e.g. day → night) */
  Lab.setTheme = function (th) {
    const root = doc.documentElement.style;
    for (const k of ['bg', 'bg2', 'fg', 'accent', 'accent2', 'muted']) if (th[k]) root.setProperty('--' + k, th[k]);
    if (th.light != null) doc.body.classList.toggle('lab-light', !!th.light);
  };
  function injectShell() {
    if (!doc.querySelector('meta[name=viewport]')) { const m = doc.createElement('meta'); m.name = 'viewport'; m.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover'; doc.head.appendChild(m); }
    doc.title = opts.title + ' — Phone Game Lab';
    doc.documentElement.lang = doc.documentElement.lang || 'en';
    const th = opts.theme || {};
    const root = doc.documentElement.style;
    if (th.bg) root.setProperty('--bg', th.bg);
    if (th.bg2) root.setProperty('--bg2', th.bg2);
    if (th.fg) root.setProperty('--fg', th.fg);
    if (th.accent) root.setProperty('--accent', th.accent);
    if (th.accent2) root.setProperty('--accent2', th.accent2);
    if (th.muted) root.setProperty('--muted', th.muted);
    if (th.bg) { let m = doc.querySelector('meta[name=theme-color]'); if (!m) { m = doc.createElement('meta'); m.name = 'theme-color'; doc.head.appendChild(m); } m.content = th.bg; }
    if (th.light) doc.body.classList.add('lab-light');

    stage = doc.createElement('div'); stage.className = 'lab-stage';
    canvas = doc.createElement('canvas'); canvas.className = 'lab-canvas'; canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', opts.title + ' game area');
    fxCanvas = doc.createElement('canvas'); fxCanvas.className = 'lab-fx';
    stage.appendChild(canvas); doc.body.appendChild(stage);
    ctx = canvas.getContext('2d'); fxCtx = fxCanvas.getContext('2d');
    Lab.canvas = canvas; Lab.ctx = ctx; Lab.stage = stage;

    hudEl = doc.createElement('div'); hudEl.className = 'lab-hud';
    hudEl.innerHTML = `<a class="btn lab-back" href="../../index.html" aria-label="Back to the lab">${ICON.back}</a>
      <div class="title"></div><div class="score" id="lab-score" aria-live="polite">0</div><div class="best" id="lab-best"></div>
      <button class="btn" id="lab-pause" aria-label="Pause">${ICON.pause}</button>`;
    stage.appendChild(hudEl); stage.appendChild(fxCanvas);
    scoreEl = hudEl.querySelector('#lab-score'); bestEl = hudEl.querySelector('#lab-best'); titleEl = hudEl.querySelector('.title'); pauseBtn = hudEl.querySelector('#lab-pause');
    titleEl.textContent = opts.title;
    pauseBtn.onclick = () => { unlockAudio(); if (over || splashUp) return; Lab.sfx('click'); Lab.pause(); };
    if (opts.hud === false) hudEl.classList.add('lab-hud-min');
    showBest();

    if (opts.instructions) { instrEl = doc.createElement('div'); instrEl.className = 'lab-instr'; instrEl.textContent = opts.instructions; stage.appendChild(instrEl); }
    if (params.has('fps')) { fpsEl = doc.createElement('div'); fpsEl.className = 'lab-fps'; stage.appendChild(fpsEl); }

    global.addEventListener('resize', resize, { passive: true });
    global.addEventListener('orientationchange', () => setTimeout(resize, 150));
    if (global.visualViewport) global.visualViewport.addEventListener('resize', resize, { passive: true });
    resize();

    /* ---- pointers (multitouch aware; first pointer drives the v1 single-touch fields) */
    const ptrs = new Map(); let primary = null;
    function xy(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) }; }
    function sync() { input.pointers = Array.from(ptrs.values()); }
    function hideHint() { if (instrEl && !instrEl._gone && !instrEl._sticky) { instrEl._gone = true; instrEl.classList.add('lab-fade'); } }
    canvas.addEventListener('pointerdown', e => {
      e.preventDefault(); unlockAudio();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { }
      if (paused) return;
      const p = xy(e), rec = { id: e.pointerId, type: e.pointerType || 'mouse', x: p.x, y: p.y, startX: p.x, startY: p.y, t0: performance.now(), swiped: false };
      input.pointerType = rec.type; // 'mouse' | 'touch' | 'pen' of the latest press
      ptrs.set(e.pointerId, rec); sync();
      if (primary == null || !ptrs.has(primary)) {
        primary = e.pointerId;
        input.down = true; input.justDown = true;
        input.x = input.px = input.startX = p.x; input.y = input.py = input.startY = p.y;
        input.dx = input.dy = 0; input.startT = rec.t0; input.pressT = e.timeStamp || rec.t0; // event time on the performance.now() clock (reaction games)
      }
      hideHint();
      fire(input.onDown, p.x, p.y, e.pointerId); fireAuto('down', p.x, p.y, e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (paused) return;
      const p = xy(e), rec = ptrs.get(e.pointerId);
      let dx = 0, dy = 0;
      if (rec) { dx = p.x - rec.x; dy = p.y - rec.y; rec.x = p.x; rec.y = p.y; }
      if (e.pointerId === primary || primary == null) {
        input.px = input.x; input.py = input.y; input.x = p.x; input.y = p.y;
        input.dx = input.x - input.px; input.dy = input.y - input.py;
        if (!rec) { dx = input.dx; dy = input.dy; }
      }
      if (rec && input.swipeEarly && !rec.swiped) {
        const sx = p.x - rec.startX, sy = p.y - rec.startY;
        if (Math.hypot(sx, sy) > 26) { rec.swiped = true; const dt = performance.now() - rec.t0; fire(input.onSwipe, sx, sy, dt, p.x, p.y); fireAuto('swipe', sx, sy, dt, p.x, p.y); }
      }
      fire(input.onMove, p.x, p.y, dx, dy, e.pointerId); fireAuto('move', p.x, p.y, dx, dy, e.pointerId);
    });
    function up(e) {
      const rec = ptrs.get(e.pointerId); if (!rec) return;
      ptrs.delete(e.pointerId); sync();
      const p = xy(e), now = performance.now();
      if (e.pointerId === primary) { primary = null; input.down = false; input.justUp = true; input.x = p.x; input.y = p.y; }
      if (paused) { fire(input.onUp, p.x, p.y, e.pointerId); fireAuto('up', p.x, p.y, e.pointerId); return; } // releases still arrive while paused so hold-to-charge games never get a stuck press (no tap/swipe though)
      const dt = now - rec.t0, dx = p.x - rec.startX, dy = p.y - rec.startY, dd = Math.hypot(dx, dy);
      if (dt < 300 && dd < 14) { input.taps.push({ x: p.x, y: p.y, t: now }); if (input.taps.length > 16) input.taps.shift(); fire(input.onTap, p.x, p.y, e.pointerId); fireAuto('tap', p.x, p.y, e.pointerId); }
      else if (dd > 30 && !rec.swiped) { fire(input.onSwipe, dx, dy, dt, p.x, p.y); fireAuto('swipe', dx, dy, dt, p.x, p.y); }
      fire(input.onUp, p.x, p.y, e.pointerId); fireAuto('up', p.x, p.y, e.pointerId);
    }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    doc.addEventListener('gesturestart', e => e.preventDefault());

    global.addEventListener('keydown', e => {
      unlockAudio();
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(e.key)) e.preventDefault();
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { if (paused) Lab.resume(); else if (!over && !splashUp) Lab.pause(); return; }
      if (e.key === 'm' || e.key === 'M') { const on = !(audioPrefs.sfx || audioPrefs.music); audio.setSfx(on); audio.setMusic(on); Lab.toast(on ? 'Sound on' : 'Sound off', 700); return; }
      if (splashUp && (e.key === 'Enter' || e.key === ' ')) { dismissSplash(); return; }
      if (over && overlayReady && (e.key === 'Enter' || e.key === ' ' || e.key === 'r' || e.key === 'R')) { Lab.restart(); return; }
      if (paused) { if (e.key === 'Enter' || e.key === ' ') Lab.resume(); return; }
      if (!e.repeat) { pressedKeys[e.key] = pressedKeys[e.code] = true; hideHint(); fire(input.onKey, e.key, e); fireAuto('key', e.key, e); }
      input.keys[e.key] = true; input.keys[e.code] = true;
    });
    global.addEventListener('keyup', e => { input.keys[e.key] = false; input.keys[e.code] = false; });
    global.addEventListener('blur', () => { input.keys = {}; autoPause(); });
    doc.addEventListener('visibilitychange', () => { if (doc.hidden) autoPause(); });
    if (instrEl) setTimeout(hideHint, 7000);
  }
  function autoPause() { if (running && !over && !splashUp && !paused && opts.autoPause !== false && !params.has('nopause')) Lab.pause(); }

  function showBest() {
    if (!bestEl) return; const b = Lab.best;
    bestEl.textContent = b == null ? '' : 'BEST ' + (opts.formatScore ? opts.formatScore(b) : Lab.fmt(b));
  }
  Object.defineProperty(Lab, 'best', { get() { const v = LS.get('gdl:best:' + Lab.id, null); return typeof v === 'number' ? v : null; } });
  /* Lab.submitScore(n, {lower:true}) → true when it is a new personal best */
  Lab.submitScore = function (v, o) {
    if (typeof v !== 'number' || !isFinite(v)) return false;
    const lower = (o && o.lower) || opts.lowerIsBetter, b = Lab.best;
    const better = b == null || (lower ? v < b : v > b);
    if (better) { LS.set('gdl:best:' + Lab.id, v); showBest(); }
    return better && b != null ? true : (better && v !== 0);
  };
  function trackPlay() {
    const rec = LS.get('gdl:recent', []).filter(x => x !== Lab.id); rec.unshift(Lab.id); LS.set('gdl:recent', rec.slice(0, 24));
    const plays = LS.get('gdl:plays', {}); plays[Lab.id] = (plays[Lab.id] || 0) + 1; LS.set('gdl:plays', plays);
  }

  /* ------------------------------------------------------------------ public lifecycle */
  /* Lab.init({title, instructions, restart, tagline, howto:[...], theme:{bg,bg2,fg,accent,accent2,light}, orient:'portrait'|'landscape'|'any',
   *           music:{style,key,bpm,seed}|'style', lowerIsBetter, formatScore, hud, autoPause, maxDpr}) */
  Lab.init = function (o) {
    opts = o || {}; opts.title = opts.title || 'Game';
    restartCb = opts.restart || null;
    injectShell();
    if (opts.music) music.play(opts.music);
    // bundled UI font: canvas text switches to it as soon as it is ready; baked sprites are rebuilt once
    try { if (doc.fonts && doc.fonts.load) Promise.all([doc.fonts.load('700 16px Fredoka'), doc.fonts.load('400 16px Fredoka')]).then(() => { sprites.clear(); Lab.fontReady = true; }).catch(() => { }); } catch (e) { }
    Lab.opts = opts;
    lastTs = performance.now();
    requestAnimationFrame(frame);
  };

  /* v2 entry point: shows the splash card (title, how-to, best), then calls restart().  v1 games simply call their start() directly. */
  Lab.boot = function () {
    booted = true;
    if (params.has('autostart')) { beginRun(); return; }
    splashUp = true;
    const o = doc.createElement('div'); o.className = 'lab-overlay lab-splash';
    const how = (opts.howto || (opts.instructions ? [opts.instructions] : [])).map(h => `<li>${h}</li>`).join('');
    const b = Lab.best;
    o.innerHTML = `<div class="lab-card">
        <div class="lab-kicker">${opts.kicker || 'Phone Game Lab'}</div>
        <h1>${opts.title}</h1>
        ${opts.tagline ? `<p class="lab-tag">${opts.tagline}</p>` : ''}
        ${how ? `<ul class="lab-how">${how}</ul>` : ''}
        ${b != null ? `<div class="lab-bestline">Best <b>${opts.formatScore ? opts.formatScore(b) : Lab.fmt(b)}</b></div>` : ''}
        <button class="lab-primary" id="lab-play">Play</button>
        <div class="lab-keys">tap anywhere · space</div>
      </div>`;
    o.addEventListener('pointerup', e => { e.preventDefault(); dismissSplash(); });
    stage.appendChild(o);
    // idle backdrop so the splash never sits on a blank canvas
    if (!mainLoop) { running = true; bgA = cssVar('--bg2', '#11172a'); bgB = cssVar('--bg', '#0b0f1a'); mainLoop = (dt, t) => { if (opts.attract) opts.attract(dt, t); else draw.bg(ctx, bgA, bgB); }; }
  };
  function cssVar(n, d) { const v = getComputedStyle(doc.documentElement).getPropertyValue(n).trim(); return v || d; }
  function dismissSplash() {
    if (!splashUp) return; splashUp = false; unlockAudio();
    stage.querySelectorAll('.lab-splash').forEach(e => { e.classList.add('lab-out'); setTimeout(() => e.remove(), 220); });
    Lab.sfx('tap'); beginRun();
  }
  function clearRun() {
    runId++; snap = null; stopLoops();
    timers.length = 0; tweens.length = 0; autoHandlers.length = 0; parts.length = 0; conf.length = 0;
    timeScale = 1; slowT = 0; hitstopT = 0; shakeMag = 0; flashA = 0;
    over = false; overlayReady = false; scoreSubmitted = false; paused = false;
    input.down = false; input.justDown = input.justUp = false; pressedKeys = {};
    stage.querySelectorAll('.lab-overlay:not(.lab-splash)').forEach(e => e.remove());
    stage.classList.remove('lab-paused');
    music.duck(1); music.onBeat = null;
  }
  function beginRun() {
    clearRun(); mainLoop = null; running = false;
    trackPlay();
    if (restartCb) restartCb();
  }

  Lab.loop = function (fn) {
    if (!booted && !mainLoop) trackPlay(); // v1 games: first loop() call counts as a play
    booted = true;
    mainLoop = fn; running = true; over = false;
  };
  Lab.stop = function () { running = false; };

  let snap = null, runId = 0, bgA = null, bgB = null;
  function takeSnap() { try { snap = doc.createElement('canvas'); snap.width = canvas.width; snap.height = canvas.height; snap.getContext('2d').drawImage(canvas, 0, 0); } catch (e) { snap = null; } }
  function frame(ts) {
    requestAnimationFrame(frame);
    const raw = Math.min(.05, Math.max(0, (ts - lastTs) / 1000)); lastTs = ts; frames++;
    const P = Lab.perf; P.ms += (raw * 1000 - P.ms) * .05; P.fps = 1000 / Math.max(1, P.ms);
    if (frames > 120) { if (P.ms > 26) P.low = true; else if (P.ms < 19) P.low = false; }
    if (fpsEl && frames % 15 === 0) fpsEl.textContent = P.fps.toFixed(0) + ' fps · ' + parts.length + 'p';
    drawConfetti(raw);
    if (paused) return;
    let sx = 0, sy = 0;
    if (shakeMag > 0) { shakeT += raw; const k = 1 - shakeT / shakeDur; if (k <= 0) shakeMag = 0; else { const m = shakeMag * k * k; sx = (Math.random() * 2 - 1) * m; sy = (Math.random() * 2 - 1) * m; } }
    if (over) {
      // game logic is frozen; the last scene is replayed from a snapshot so death bursts / shakes can finish
      if (!snap) takeSnap();
      if (snap && (parts.length || shakeMag > 0 || flashA > 0 || snap._dirty)) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(snap, sx * dpr, sy * dpr, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, sx * dpr, sy * dpr);
        fx.update(raw); fx.draw(ctx); snap._dirty = parts.length > 0 || shakeMag > 0 || flashA > 0;
        drawFlash(raw);
      }
      pressedKeys = {}; return;
    }
    if (!running || !mainLoop) { pressedKeys = {}; return; }
    let dt = raw * timeScale;
    if (slowT > 0) { slowT -= raw; dt *= slowScale; }
    if (hitstopT > 0) { hitstopT -= raw; dt = 1e-6; }
    clock += dt;
    stepTimers(dt);
    if (!running || !mainLoop) return; // a timer ended the run
    ctx.setTransform(dpr, 0, 0, dpr, sx * dpr, sy * dpr);
    try { mainLoop(dt, clock); } catch (e) { console.error(e); }
    if (over && !snap) takeSnap(); // clean snapshot: scene without particles
    fx.update(dt); if (fx.auto) fx.draw(ctx);
    drawFlash(raw);
    input.justDown = false; input.justUp = false; pressedKeys = {};
  }
  function drawFlash(raw) {
    if (flashA <= 0) return; flashT += raw; const k = 1 - flashT / flashDur; if (k <= 0) { flashA = 0; return; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = flashA * k; ctx.fillStyle = flashColor; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  }
  Lab.now = () => clock;
  Object.defineProperty(Lab, 'paused', { get: () => paused });
  Object.defineProperty(Lab, 'over', { get: () => over });
  Object.defineProperty(Lab, 'frames', { get: () => frames });

  Lab.setScore = function (v) { lastScore = v; if (scoreEl) { const s = typeof v === 'number' ? (opts.formatScore ? opts.formatScore(v) : Lab.fmt(v)) : String(v); if (scoreEl.textContent !== s) scoreEl.textContent = s; } };
  Lab.score = Lab.setScore;
  /* little pop animation on the HUD score (use on big gains) */
  Lab.bumpScore = function () { if (!scoreEl || reduced) return; scoreEl.classList.remove('lab-bump'); void scoreEl.offsetWidth; scoreEl.classList.add('lab-bump'); };
  /* replace the hint line under the HUD (objective text, combo, etc.) */
  /* Lab.hint(text) fades on the next touch; Lab.hint(text, {sticky:true}) stays until replaced; Lab.hint('') clears */
  Lab.hint = function (text, o) { if (!instrEl) { instrEl = doc.createElement('div'); instrEl.className = 'lab-instr'; stage.appendChild(instrEl); } instrEl._sticky = !!(o && o.sticky); instrEl._gone = false; instrEl.classList.toggle('lab-fade', !text); instrEl.textContent = text || ''; };

  let overlayReady = false;
  /* Lab.gameover({title, message, score, stats:[['Level',3],['Combo','x12']], win, neutral, lower, button, delay, sound}) */
  Lab.gameover = function (o) {
    if (over) return;
    o = o || {}; over = true; running = false; snap = null; stopLoops();
    const explicit = typeof o.score === 'number';
    let score = o.score;
    if (!explicit) { const m = /score\D{0,4}(-?\d+)/i.exec(o.message || ''); if (m) score = +m[1]; } // v1 games: "Score: 12"
    let isBest = false;
    if (typeof score === 'number' && !scoreSubmitted && o.submit !== false) { scoreSubmitted = true; isBest = Lab.submitScore(score, { lower: o.lower }); }
    const best = Lab.best, f = v => opts.formatScore ? opts.formatScore(v) : Lab.fmt(v);
    const win = !!o.win, token = runId;
    if (o.sound !== false) Lab.sfx(win ? 'win' : o.neutral ? 'chime' : 'lose'); // neutral: a run that simply finished (time up, all trials done)
    music.duck(.35);
    const stats = (o.stats || []).map(s => `<div class="lab-stat"><span>${s[0]}</span><b>${s[1]}</b></div>`).join('');
    const delay = o.delay == null ? (win ? 350 : 600) : o.delay * 1000;
    setTimeout(() => {
      if (token !== runId) return;
      if (win || isBest) fx.confetti();
      const el = doc.createElement('div'); el.className = 'lab-overlay lab-over' + (win ? ' lab-win' : '');
      el.innerHTML = `<div class="lab-card">
        <h2>${o.title || (win ? 'You win!' : o.neutral ? 'Finished!' : 'Game Over')}</h2>
        ${o.message ? `<p>${o.message}</p>` : ''}
        ${explicit ? `<div class="lab-final"><span>${o.scoreLabel || 'Score'}</span><b id="lab-final-n">0</b></div>` : ''}
        ${isBest ? '<div class="lab-newbest">★ New best!</div>' : (best != null && typeof score === 'number' ? `<div class="lab-bestline">Best <b>${f(best)}</b></div>` : '')}
        ${stats ? `<div class="lab-stats">${stats}</div>` : ''}
        <button class="lab-primary" id="lab-again">${o.button || (win || o.neutral ? 'Play again' : 'Try again')}</button>
        <div class="small"><a href="../../index.html">← Back to the Lab</a></div>
      </div>`;
      stage.appendChild(el);
      if (explicit) { // count-up
        const n = el.querySelector('#lab-final-n'), t0 = performance.now(), dur = reduced ? 1 : Math.min(900, 250 + Math.abs(score) * 4);
        (function tick() { if (!n.isConnected) return; const u = Math.min(1, (performance.now() - t0) / dur); n.textContent = f(Math.round(score * ease.outCubic(u))); if (u < 1) requestAnimationFrame(tick); else n.textContent = f(score); })();
      }
      setTimeout(() => { if (token === runId) { overlayReady = true; el.classList.add('lab-ready'); } }, 380); // guard against accidental instant restarts
      el.querySelector('#lab-again').onclick = () => { if (!overlayReady) return; unlockAudio(); Lab.sfx('tap'); Lab.restart(); };
    }, delay);
  };
  Lab.win = function (o) { if (typeof o === 'string' || o == null) o = { message: o || 'Nicely done.' }; Lab.gameover(Object.assign({ win: true }, o)); };

  Lab.restart = function () {
    if (splashUp) return;
    clearRun(); mainLoop = null; running = false;
    lastScore = null; trackPlay();
    if (restartCb) restartCb();
  };

  Lab.pause = function () {
    if (paused || over || splashUp) return; paused = true; muteLoops(true); music.duck(.25); stage.classList.add('lab-paused');
    const el = doc.createElement('div'); el.className = 'lab-overlay lab-pausecard';
    const how = (opts.howto || (opts.instructions ? [opts.instructions] : [])).map(h => `<li>${h}</li>`).join('');
    el.innerHTML = `<div class="lab-card">
        <div class="lab-kicker">Paused</div><h2>${opts.title}</h2>
        ${how ? `<ul class="lab-how">${how}</ul>` : ''}
        <button class="lab-primary" id="lab-resume">Resume</button>
        <div class="lab-row">
          <button class="lab-ghost" id="lab-re">Restart</button>
          <button class="lab-ghost" id="lab-sfx"></button>
          <button class="lab-ghost" id="lab-mus"></button>
        </div>
        <div class="small"><a href="../../index.html">← Back to the Lab</a></div>
      </div>`;
    const sb = el.querySelector('#lab-sfx'), mb = el.querySelector('#lab-mus');
    const label = () => { sb.textContent = 'Sound ' + (audioPrefs.sfx ? 'on' : 'off'); sb.setAttribute('aria-pressed', audioPrefs.sfx); mb.textContent = 'Music ' + (audioPrefs.music ? 'on' : 'off'); mb.setAttribute('aria-pressed', audioPrefs.music); };
    label();
    sb.onclick = () => { unlockAudio(); audio.setSfx(!audioPrefs.sfx); label(); Lab.sfx('click'); };
    mb.onclick = () => { unlockAudio(); audio.setMusic(!audioPrefs.music); label(); Lab.sfx('click'); };
    el.querySelector('#lab-resume').onclick = () => Lab.resume();
    el.querySelector('#lab-re').onclick = () => { Lab.restart(); };
    stage.appendChild(el);
  };
  Lab.resume = function () {
    if (!paused) return; paused = false; muteLoops(false); stage.classList.remove('lab-paused'); music.duck(over ? .35 : 1);
    stage.querySelectorAll('.lab-pausecard').forEach(e => e.remove()); lastTs = performance.now(); input.down = false;
  };

  /* Lab.toast(text, ms, {y:.2}) — y = vertical position as a fraction of the stage (default .38) */
  Lab.toast = function (text, ms, o) {
    const t = doc.createElement('div'); t.className = 'lab-toast'; t.textContent = text; t.style.animationDuration = ((ms || 900) / 1000) + 's'; if (o && o.y != null) t.style.top = (o.y * 100) + '%';
    (stage || doc.body).appendChild(t); setTimeout(() => t.remove(), ms || 900);
  };
  /* big centred banner: "LEVEL 3", "GO!", "PERFECT" */
  Lab.banner = function (text, o) {
    o = o || {}; const t = doc.createElement('div'); t.className = 'lab-banner'; t.textContent = text; if (o.color) t.style.color = o.color; if (o.y != null) t.style.top = (o.y * 100) + '%';
    t.style.animationDuration = ((o.ms || 1100) / 1000) + 's'; (stage || doc.body).appendChild(t); setTimeout(() => t.remove(), o.ms || 1100);
  };

  /* test hooks (inert for players) — tests read window.__lab.state and any object passed to Lab.expose() */
  Lab.expose = function (obj) { exposed = obj; };
  global.__lab = {
    get state() { return { id: Lab.id, running, paused, over, splash: splashUp, score: lastScore, best: Lab.best, frames, W, H, particles: parts.length }; },
    get game() { return exposed; },
    start() { if (splashUp) dismissSplash(); }, restart() { Lab.restart(); }, pause() { Lab.pause(); }, resume() { Lab.resume(); },
  };
})(window);
