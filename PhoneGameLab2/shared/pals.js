/* Pocket Pals — the original mascot cast of Phone Game Lab 2 (documented in shared/PALS.md).
 * Pure Canvas 2D, no assets.  Pals.draw(ctx, who, x, y, size, opts)  draws a pal centred on (x, y); size = body height.
 *   who:  'pip' fox · 'bun' bunny · 'momo' frog · 'nori' penguin · 'olli' owl · 'bolt' robot
 *   opts: { mood:'happy'|'joy'|'wow'|'sad'|'angry'|'sleepy'|'focus'|'think'|'dizzy'|'scared', look:[x,y] (-1..1), t (seconds → auto blink + breathing),
 *           blink:0..1, squash:-.4...4 (>0 = squashed flat), tilt (rad), flip, arms:'down'|'up'|'wave'|'cheer'|'hold', talk:0..1 (mouth open),
 *           shadow:true, alpha, tint (overrides body colour), pose:'lie' (belly-slide, head toward +x; combine with flip),
 *           hot:0..1 (flushed + sweat), wet:0..1 (drips), clipY (local y in px from the pal's centre: nothing is drawn below it — peek from behind things) }
 * Returns anchor points in canvas coordinates for props: { handL:[x,y], handR:[x,y], head:[x,y] (top), mouth:[x,y], feet:[x,y] }.
 */
(function (global) {
  'use strict';
  const TAU = Math.PI * 2;
  const CAST = {
    pip: { name: 'Pip', kind: 'fox', body: '#ff8a3d', dark: '#d9621a', belly: '#fff1dc', accent: '#3b2a2a', cheek: '#ff6b6b' },
    bun: { name: 'Bun', kind: 'bunny', body: '#b9a3ff', dark: '#8f76e6', belly: '#f4eeff', accent: '#ff8fb8', cheek: '#ff8fb8' },
    momo: { name: 'Momo', kind: 'frog', body: '#5fd39a', dark: '#36a873', belly: '#eafff0', accent: '#2a6b4a', cheek: '#ffb37a' },
    nori: { name: 'Nori', kind: 'penguin', body: '#2f3d73', dark: '#1e2850', belly: '#ffffff', accent: '#ffa62b', cheek: '#ff9aa8' },
    olli: { name: 'Olli', kind: 'owl', body: '#b57a45', dark: '#8a5a2f', belly: '#f7e3c4', accent: '#ffb52e', cheek: '#ff9d7a' },
    bolt: { name: 'Bolt', kind: 'robot', body: '#ffd23f', dark: '#e0a91a', belly: '#fff6cf', accent: '#3ec5ff', cheek: '#ff8a5c' },
  };
  const INK = '#2b2340';
  function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot || 0, 0, TAU); }
  function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0) / 4294967296; }

  function draw(c, who, x, y, size, o) {
    o = o || {}; const p = CAST[who] || CAST.pip, s = size / 2, kind = p.kind, t = o.t || 0, mood = o.mood || 'happy';
    const body = o.tint || p.body;
    let sq = o.squash || 0; if (o.t != null) sq += Math.sin(t * 2.4 + hash(who) * 6) * .018; // breathing
    let blink = o.blink || 0;
    if (o.t != null && !o.blink) { const ph = (t * .31 + hash(who)) % 1; if (ph > .955) blink = 1 - Math.abs((ph - .9775) / .0225); }
    if (mood === 'sleepy') blink = Math.max(blink, .62);
    const lx = o.look ? Math.max(-1, Math.min(1, o.look[0])) : 0, ly = o.look ? Math.max(-1, Math.min(1, o.look[1])) : 0;
    const lie = o.pose === 'lie';
    c.save(); c.translate(x, y); if (o.alpha != null) c.globalAlpha *= o.alpha;
    if (o.clipY != null) { c.beginPath(); c.rect(-size * 2, -size * 3, size * 4, size * 3 + o.clipY); c.clip(); }
    if (o.shadow !== false) { c.fillStyle = 'rgba(20,10,40,.18)'; if (lie) ell(c, 0, s * .98, s * 1.1, s * .13); else ell(c, 0, s * 1.04, s * .78 * (1 + sq * .6), s * .14); c.fill(); }
    if (o.tilt) c.rotate(o.tilt);
    if (o.flip) c.scale(-1, 1);
    if (lie) { c.translate(0, s * .12); c.rotate(Math.PI / 2); } // belly-slide: head points toward +x (or -x when flipped)
    c.translate(0, s); c.scale(1 + sq * .7, 1 - sq); c.translate(0, -s); // squash from the feet
    c.lineCap = 'round'; c.lineJoin = 'round';

    /* ---- behind the body: tails, ears */
    if (kind === 'fox') {
      c.fillStyle = p.dark; c.beginPath(); c.moveTo(s * .45, s * .55); c.quadraticCurveTo(s * 1.5, s * .7, s * 1.25, -s * .25); c.quadraticCurveTo(s * .9, s * .25, s * .35, s * .2); c.fill();
      c.fillStyle = p.belly; c.beginPath(); c.moveTo(s * 1.25, -s * .25); c.quadraticCurveTo(s * 1.42, s * .1, s * 1.2, s * .32); c.quadraticCurveTo(s * 1.05, s * .05, s * 1.25, -s * .25); c.fill();
      for (const d of [-1, 1]) { c.fillStyle = body; c.beginPath(); c.moveTo(d * s * .2, -s * .72); c.lineTo(d * s * .62, -s * 1.38); c.lineTo(d * s * .86, -s * .52); c.closePath(); c.fill(); c.fillStyle = p.accent; c.beginPath(); c.moveTo(d * s * .52, -s * 1.16); c.lineTo(d * s * .62, -s * 1.38); c.lineTo(d * s * .71, -s * 1.1); c.closePath(); c.fill(); c.fillStyle = p.belly; c.beginPath(); c.moveTo(d * s * .4, -s * .76); c.lineTo(d * s * .6, -s * 1.08); c.lineTo(d * s * .72, -s * .66); c.closePath(); c.fill(); }
    } else if (kind === 'bunny') {
      const flop = Math.sin(t * 2) * .05;
      for (const d of [-1, 1]) { c.save(); c.translate(d * s * .34, -s * .78); c.rotate(d * (.16 + (d > 0 ? .5 + flop : 0))); c.fillStyle = body; ell(c, 0, -s * .55, s * .2, s * .62); c.fill(); c.fillStyle = p.accent; c.globalAlpha *= .55; ell(c, 0, -s * .52, s * .09, s * .44); c.fill(); c.restore(); }
      c.fillStyle = p.belly; ell(c, s * .78, s * .55, s * .2, s * .2); c.fill();
    } else if (kind === 'owl') {
      for (const d of [-1, 1]) { c.fillStyle = p.dark; c.beginPath(); c.moveTo(d * s * .3, -s * .8); c.lineTo(d * s * .78, -s * 1.2); c.lineTo(d * s * .8, -s * .5); c.closePath(); c.fill(); }
    } else if (kind === 'robot') {
      c.strokeStyle = p.dark; c.lineWidth = s * .08; c.beginPath(); c.moveTo(0, -s * .9); c.lineTo(0, -s * 1.28); c.stroke();
      c.fillStyle = (o.t != null && Math.sin(t * 6) > 0) || mood === 'joy' || mood === 'wow' ? p.accent : '#ff5d73'; ell(c, 0, -s * 1.34, s * .12, s * .12); c.fill();
    }

    /* ---- feet */
    c.fillStyle = kind === 'penguin' || kind === 'owl' ? p.accent : p.dark;
    for (const d of [-1, 1]) { ell(c, d * s * .36, s * .96, s * .24, s * .11); c.fill(); }

    /* ---- arms (behind body when down) */
    const arms = o.arms || 'down', wave = Math.sin(t * 9) * .35;
    const armA = d => arms === 'up' || arms === 'cheer' ? -2.3 + (arms === 'cheer' ? Math.sin(t * 12 + d) * .2 : 0) : arms === 'wave' ? (d > 0 ? -2.2 + wave : .35) : arms === 'hold' ? -1.2 : .35;
    const drawArm = d => { c.save(); c.translate(d * s * .74, s * .08); c.rotate(d * armA(d)); c.fillStyle = kind === 'penguin' ? p.dark : body; ell(c, 0, s * .26, s * (kind === 'penguin' ? .16 : .13), s * .3); c.fill(); c.restore(); };
    if (arms === 'down') { drawArm(-1); drawArm(1); }

    /* ---- body */
    c.fillStyle = body;
    if (kind === 'robot') { rr(c, -s * .82, -s * .92, s * 1.64, s * 1.86, s * .42); c.fill(); }
    else { c.beginPath(); c.moveTo(0, -s); c.bezierCurveTo(s * .72, -s, s * .98, -s * .3, s * .92, s * .3); c.bezierCurveTo(s * .86, s * .86, s * .46, s, 0, s); c.bezierCurveTo(-s * .46, s, -s * .86, s * .86, -s * .92, s * .3); c.bezierCurveTo(-s * .98, -s * .3, -s * .72, -s, 0, -s); c.fill(); }
    // soft top-left sheen + bottom shade
    c.save(); c.clip();
    c.fillStyle = 'rgba(255,255,255,.16)'; ell(c, -s * .35, -s * .62, s * .5, s * .3, -.5); c.fill();
    c.fillStyle = 'rgba(0,0,30,.08)'; ell(c, s * .1, s * 1.05, s * 1.2, s * .5); c.fill();
    /* belly / face patches */
    c.fillStyle = p.belly;
    if (kind === 'penguin') { c.beginPath(); c.moveTo(0, -s * .62); c.bezierCurveTo(s * .7, -s * .78, s * .82, s * .2, s * .5, s * .9); c.lineTo(-s * .5, s * .9); c.bezierCurveTo(-s * .82, s * .2, -s * .7, -s * .78, 0, -s * .62); c.fill(); }
    else if (kind === 'fox') { ell(c, 0, s * .62, s * .5, s * .46); c.fill(); c.beginPath(); c.moveTo(-s * .95, -s * .05); c.quadraticCurveTo(-s * .4, s * .0, 0, s * .34); c.quadraticCurveTo(s * .4, s * .0, s * .95, -s * .05); c.lineTo(s * .95, s * .5); c.lineTo(-s * .95, s * .5); c.closePath(); c.fill(); }
    else if (kind === 'robot') { rr(c, -s * .6, -s * .58, s * 1.2, s * .78, s * .2); c.fillStyle = '#1e2440'; c.fill(); c.fillStyle = p.dark; for (const d of [-1, 1]) { ell(c, d * s * .6, s * .72, s * .06, s * .06); c.fill(); } rr(c, -s * .28, s * .46, s * .56, s * .22, s * .08); c.fillStyle = p.belly; c.fill(); }
    else if (kind === 'owl') { ell(c, 0, s * .58, s * .5, s * .46); c.fill(); c.strokeStyle = p.dark; c.lineWidth = s * .045; c.globalAlpha *= .5; for (let r = 0; r < 2; r++) for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(i * s * .22 + (r ? s * .11 : 0), s * (.46 + r * .2), s * .09, .2, Math.PI - .2); c.stroke(); } c.globalAlpha /= .5; }
    else { ell(c, 0, s * .6, s * .54, s * .46); c.fill(); }
    c.restore();
    if (arms !== 'down') { drawArm(-1); drawArm(1); }

    /* ---- face */
    const frog = kind === 'frog', robot = kind === 'robot';
    const ey = frog ? -s * .74 : robot ? -s * .2 : -s * .2, ex = frog ? s * .42 : s * .36, er = s * (frog ? .2 : kind === 'owl' ? .19 : .145);
    if (frog) for (const d of [-1, 1]) { c.fillStyle = body; ell(c, d * ex, ey, s * .3, s * .3); c.fill(); c.fillStyle = '#fff'; ell(c, d * ex, ey, s * .23, s * .23); c.fill(); }
    if (kind === 'owl') for (const d of [-1, 1]) { c.fillStyle = p.belly; ell(c, d * ex, ey, s * .33, s * .33); c.fill(); }
    const big = mood === 'wow' || mood === 'scared' ? 1.25 : 1, eyeCol = robot ? p.accent : INK;
    for (const d of [-1, 1]) {
      const cx = d * ex + lx * er * .45, cy = ey + ly * er * .4;
      c.fillStyle = eyeCol; c.strokeStyle = eyeCol; c.lineWidth = s * .075;
      if (mood === 'joy') { c.beginPath(); c.arc(d * ex, ey + er * .35, er * .95, Math.PI * 1.12, Math.PI * 1.88); c.stroke(); }
      else if (mood === 'dizzy') { c.lineWidth = s * .06; c.beginPath(); for (let a = 0; a < 9; a += .4) { const r = er * a / 9 * 1.1; c.lineTo(d * ex + Math.cos(a + t * 8) * r, ey + Math.sin(a + t * 8) * r); } c.stroke(); }
      else if (blink > .55) { c.beginPath(); c.moveTo(d * ex - er, ey + er * .1); c.quadraticCurveTo(d * ex, ey + er * (mood === 'sleepy' ? .5 : .35), d * ex + er, ey + er * .1); c.stroke(); }
      else {
        ell(c, cx, cy, er * big * (robot ? 1.05 : 1), er * big * (1 - blink * .8) * (robot ? .8 : 1.12)); c.fill();
        if (!robot) { c.fillStyle = '#fff'; ell(c, cx - er * .3, cy - er * .38, er * .34, er * .34); c.fill(); ell(c, cx + er * .3, cy + er * .3, er * .15, er * .15); c.fill(); }
        else { c.fillStyle = 'rgba(255,255,255,.75)'; ell(c, cx - er * .25, cy - er * .25, er * .25, er * .2); c.fill(); }
      }
      // brows
      if (mood === 'angry' || mood === 'focus' || mood === 'sad' || mood === 'scared') {
        c.strokeStyle = robot ? p.accent : INK; c.lineWidth = s * .07; const up = (mood === 'sad' || mood === 'scared') ? 1 : -1; c.beginPath();
        c.moveTo(d * (ex - er * 1.1), ey - er * (1.55 + up * .35)); c.lineTo(d * (ex + er * 1.0), ey - er * (1.55 - up * .35)); c.stroke();
      }
    }
    // cheeks
    if (!robot) { c.fillStyle = p.cheek; c.globalAlpha *= .45; for (const d of [-1, 1]) { ell(c, d * s * .56, (frog ? -s * .28 : ey + s * .26), s * .13, s * .08); c.fill(); } c.globalAlpha /= .45; }
    // nose / beak
    const my = frog ? -s * .22 : robot ? s * .0 : ey + s * .3;
    if (kind === 'fox') { c.fillStyle = INK; ell(c, 0, ey + s * .2, s * .075, s * .055); c.fill(); }
    if (kind === 'bunny') { c.fillStyle = p.accent; ell(c, 0, ey + s * .19, s * .06, s * .045); c.fill(); }
    if (kind === 'penguin' || kind === 'owl') { c.fillStyle = p.accent; c.beginPath(); c.moveTo(-s * .12, ey + s * .16); c.lineTo(s * .12, ey + s * .16); c.lineTo(0, ey + s * (kind === 'owl' ? .36 : .32) + (o.talk || 0) * s * .08); c.closePath(); c.fill(); }
    // mouth
    const talk = o.talk || 0; c.strokeStyle = robot ? p.accent : INK; c.fillStyle = robot ? p.accent : '#7a2a3a'; c.lineWidth = s * .065;
    if (kind !== 'penguin' && kind !== 'owl') {
      const mw = s * (frog ? .42 : .17);
      if (mood === 'wow' || mood === 'scared' || talk > .3) { ell(c, 0, my + s * .05, mw * (frog ? .5 : .75), s * (.07 + Math.max(talk, mood === 'wow' || mood === 'scared' ? .6 : 0) * .12)); c.fill(); }
      else if (mood === 'sad') { c.beginPath(); c.arc(0, my + s * .16, mw, Math.PI * 1.2, Math.PI * 1.8); c.stroke(); }
      else if (mood === 'think') { c.beginPath(); c.moveTo(-mw * .45, my + s * .08); c.quadraticCurveTo(0, my + s * .03, mw * .5, my + s * .1); c.stroke(); } // gentle concentration: small off-centre mouth, no brows
      else if (mood === 'angry' || mood === 'focus' || mood === 'dizzy') { c.beginPath(); c.moveTo(-mw * .8, my + s * .06); c.lineTo(mw * .8, my + s * .06); c.stroke(); }
      else if (mood === 'joy') { c.beginPath(); c.moveTo(-mw, my); c.quadraticCurveTo(0, my + s * .3, mw, my); c.closePath(); c.fill(); c.fillStyle = '#ff8fa3'; ell(c, 0, my + s * .11, mw * .45, s * .05); c.fill(); }
      else { c.beginPath(); c.arc(0, my - s * .02, mw, Math.PI * .15, Math.PI * .85); c.stroke(); }
    } else if (mood === 'joy' || mood === 'wow' || talk > .3) { c.fillStyle = '#7a2a3a'; c.beginPath(); c.moveTo(-s * .09, ey + s * .34); c.lineTo(s * .09, ey + s * .34); c.lineTo(0, ey + s * .46); c.closePath(); c.fill(); }
    if (mood === 'scared' || mood === 'sad' && o.tear) { c.fillStyle = '#8fd8ff'; ell(c, s * .62, ey - s * .1 + ((t * 1.5) % 1) * s * .3, s * .05, s * .08); c.fill(); }
    if (o.hot) { const h = Math.min(1, o.hot); c.fillStyle = '#ff5a5a'; c.globalAlpha *= .35 * h; for (const d of [-1, 1]) { ell(c, d * s * .56, (frog ? -s * .28 : ey + s * .26), s * .2, s * .13); c.fill(); } c.globalAlpha /= .35 * h;
      c.fillStyle = '#9fe3ff'; const k = (t * 1.2 + hash(who)) % 1; ell(c, -s * .7, -s * .55 + k * s * .5, s * .055 * h, s * .09 * h); c.fill(); if (h > .6) { const k2 = (t * 1.2 + hash(who) + .5) % 1; ell(c, s * .72, -s * .5 + k2 * s * .5, s * .05, s * .08); c.fill(); } }
    if (o.wet) { c.fillStyle = 'rgba(120,200,255,.85)'; for (let i = 0; i < 4; i++) { const k = (t * 1.6 + i * .27 + hash(who)) % 1, dx = (i - 1.5) * s * .42; c.globalAlpha *= (1 - k) * Math.min(1, o.wet); ell(c, dx, s * (.3 + k * .75), s * .045, s * .08); c.fill(); c.globalAlpha /= (1 - k) * Math.min(1, o.wet) || 1; } }
    // anchor points (canvas coordinates) so games can attach props
    const M = c.getTransform(), pt = (lx2, ly2) => { const q = M.transformPoint(new DOMPoint(lx2, ly2)), i = c.getTransform(); return [q.x / (global.Lab && Lab.dpr || 1), q.y / (global.Lab && Lab.dpr || 1)]; };
    const hand = d => { const a = d * armA(d), bx = d * s * .74, by = s * .08; return pt(bx - Math.sin(a) * s * .5, by + Math.cos(a) * s * .5); };
    const anchors = { handL: hand(-1), handR: hand(1), head: pt(0, -s * (kind === 'bunny' ? 1.05 : 1)), mouth: pt(0, my + s * .05), feet: pt(0, s) };
    c.restore();
    return anchors;
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  /* Cozy world backdrops shared by the collection: Pals.backdrop(ctx, W, H, t, {scene:'meadow'|'dusk'|'night'|'snow'|'beach'|'candy', ground:0..1})
   * Draws sky + sun/moon + drifting clouds + two hill layers; returns the ground Y in px. Cheap enough to call every frame. */
  const SCENES = {
    meadow: { sky: ['#8fd3ff', '#d9f4ff'], hill: ['#8ed081', '#5fb86b'], sun: '#fff3b0', cloud: 'rgba(255,255,255,.9)' },
    dusk: { sky: ['#ff9a8b', '#ffd6a5'], hill: ['#c06c84', '#6c5b7b'], sun: '#fff1c1', cloud: 'rgba(255,240,230,.75)' },
    night: { sky: ['#1b1f4b', '#3d3a7a'], hill: ['#2e3a6b', '#1f2750'], sun: '#fdf6c3', cloud: 'rgba(200,205,255,.25)', stars: true },
    snow: { sky: ['#bfe3ff', '#f2fbff'], hill: ['#ffffff', '#dcefff'], sun: '#ffffff', cloud: 'rgba(255,255,255,.95)' },
    beach: { sky: ['#6ed3f5', '#d5f7ff'], hill: ['#ffe3a3', '#f5c871'], sun: '#fff7c2', cloud: 'rgba(255,255,255,.9)', sea: '#3fb8e0' },
    candy: { sky: ['#ffc8e8', '#fff0c9'], hill: ['#ff9ecb', '#c79bff'], sun: '#fffbe0', cloud: 'rgba(255,255,255,.85)' },
    golden: { sky: ['#ffb347', '#ffe9b0'], hill: ['#9ec26a', '#6f9e52'], sun: '#fff6d5', cloud: 'rgba(255,250,235,.8)' },
  };
  function backdrop(c, W, H, t, o) {
    o = o || {}; const sc = SCENES[o.scene] || SCENES.meadow, gy = H * (o.ground == null ? .78 : o.ground);
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, sc.sky[0]); g.addColorStop(.75, sc.sky[1]); c.fillStyle = g; c.fillRect(-40, -40, W + 80, H + 80);
    if (sc.stars) { c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { const hx = (i * 97.13) % 1 * W + (i * 53) % W, hy = (i * 61.7) % (gy * .9); c.globalAlpha = .3 + .5 * Math.abs(Math.sin(t * (.6 + i % 5 * .3) + i)); c.fillRect(hx % W, hy, 1.6, 1.6); } c.globalAlpha = 1; }
    const sx = W * .78, sy = H * .16, sr = Math.min(W, H) * .075; c.fillStyle = sc.sun; c.globalAlpha = .25; ell(c, sx, sy, sr * 1.9, sr * 1.9); c.fill(); c.globalAlpha = 1; ell(c, sx, sy, sr, sr); c.fill();
    c.fillStyle = sc.cloud; for (let i = 0; i < 4; i++) { const cw = W * (.22 + (i % 3) * .06), cx = ((i * .31 * W + t * (6 + i * 3)) % (W + cw * 2)) - cw, cy = H * (.1 + i * .075); ell(c, cx, cy, cw * .5, cw * .16); c.fill(); ell(c, cx - cw * .2, cy - cw * .08, cw * .22, cw * .16); c.fill(); ell(c, cx + cw * .16, cy - cw * .1, cw * .26, cw * .19); c.fill(); }
    if (sc.sea) { c.fillStyle = sc.sea; c.fillRect(-40, gy - H * .09, W + 80, H * .1); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 5; i++) c.fillRect(((i * .23 * W + t * 14) % (W + 60)) - 30, gy - H * .08 + i * 5, 38, 2); }
    for (let l = 0; l < 2; l++) { c.fillStyle = sc.hill[l]; c.beginPath(); c.moveTo(-40, H + 40); const base = gy - (1 - l) * H * .05; for (let x = -40; x <= W + 40; x += 20) c.lineTo(x, base + Math.sin(x * (.008 + l * .004) + l * 2.1) * H * (.03 - l * .012)); c.lineTo(W + 40, H + 40); c.closePath(); c.fill(); }
    return gy;
  }

  /* Thought / speech bubble: Pals.bubble(ctx, x, y, w, h, {tailX, tailY, thought:true, fill, stroke}) — (x,y) is the bubble centre;
   * the tail points at (tailX,tailY). Draw your icon/text on top afterwards. */
  function bubble(c, x, y, w, h, o) {
    o = o || {}; const r = Math.min(w, h) * .38, fill = o.fill || '#fffdf7', stroke = o.stroke === undefined ? INK : o.stroke, tx = o.tailX == null ? x : o.tailX, ty = o.tailY == null ? y + h : o.tailY;
    c.save(); c.lineJoin = 'round'; c.lineWidth = o.lineWidth || 2.5; c.fillStyle = fill; if (stroke) c.strokeStyle = stroke;
    const ang = Math.atan2(ty - y, tx - x), ex = x + Math.cos(ang) * w * .42, eyy = y + Math.sin(ang) * h * .42;
    if (o.thought) { for (let i = 1; i <= 2; i++) { const k = i / 3, bx = ex + (tx - ex) * k, by = eyy + (ty - eyy) * k, br = r * (.34 - i * .09); ell(c, bx, by, br, br); c.fill(); if (stroke) c.stroke(); } }
    else { const nx = -Math.sin(ang) * r * .5, ny = Math.cos(ang) * r * .5; c.beginPath(); c.moveTo(ex + nx, eyy + ny); c.lineTo(ex + (tx - ex) * .8, eyy + (ty - eyy) * .8); c.lineTo(ex - nx, eyy - ny); c.closePath(); c.fill(); if (stroke) c.stroke(); }
    rr(c, x - w / 2, y - h / 2, w, h, r); c.fill(); if (stroke) c.stroke();
    if (!o.thought) { const nx = -Math.sin(ang) * r * .42, ny = Math.cos(ang) * r * .42; c.beginPath(); c.moveTo(ex + nx, eyy + ny); c.lineTo(ex + (tx - ex) * .5, eyy + (ty - eyy) * .5); c.lineTo(ex - nx, eyy - ny); c.closePath(); c.fill(); }
    c.restore();
  }
  global.Pals = { draw, backdrop, bubble, cast: CAST, list: Object.keys(CAST), scenes: Object.keys(SCENES), ink: INK, colors: who => CAST[who] || CAST.pip, pick: seed => Object.keys(CAST)[Math.floor(Math.abs(seed)) % 6] };
})(window);
