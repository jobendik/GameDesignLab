// Cosmic Devourer: menu → AWAKEN (real tap) → a CDP thumb-stick drag steers the hole → a second finger lunges (costs mass,
// speeds it up) → keyboard steering + Space lunge + M mute → the hole's gravity pulls dust into its horizon (mass grows) →
// pause freezes the cycle clock → a stick-driven hunt swallows a smaller rival (banked points) → the scripted pilot plays the
// whole three-minute cycle: the core goes critical and shrinks, the supernova shockwave fires, the result card shows the
// score formula and the best is stored → AWAKEN AGAIN resets → steering into a bigger hole gets you devoured → card again.
module.exports = {
  game: 'games/cosmic-devourer.html',
  query: '?seed=4&nopause=1&mute=1',
  timeout: 170000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const BX = 110, BY = 640;                                          // where the steering thumb rests
    const frames = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));   // pointermoves are frame-aligned
    const finger = async (dx, dy) => { await touch('touchMove', [{ x: BX + dx * 60, y: BY + dy * 60, id: 1 }]);   // …and wait until the game has seen it, so stepping stays deterministic
      for (let k = 0; k < 20; k++) { await frames(); const q = await page.evaluate(() => window.__gdl.state.stick); if (!q.on || (Math.abs(q.dx - dx * 60) < 1.5 && Math.abs(q.dy - dy * 60) < 1.5)) break; } };

    // 1. menu → AWAKEN
    let s = await st(); expect(s.mode === 'menu' && s.card === 'ovMenu', 'boots to the menu card');
    await page.evaluate(() => window.__gdl.manual(true));             // from here the test steps the simulation itself
    await page.locator('#bPlay').tap(); await wait(120); s = await st();
    expect(s.mode === 'play' && s.card === null && Math.abs(s.mass - 22) < .5 && s.clock < .5 && s.holes.length === 20 && s.core.m === 900, 'awakened: mass 22, 20 rivals, stable core');

    // 2. thumb stick: press and drag right → the hole accelerates right
    s = await st(); const x0 = s.you.x;
    await touch('touchStart', [{ x: BX, y: BY, id: 1 }]); await frames(); await finger(.5, 0); await finger(1, 0);
    await adv(1); s = await st();
    expect(s.you.dx > .95 && s.you.th > .9 && s.you.x > x0 + 150, 'stick drag drives the hole right (' + (s.you.x - x0).toFixed(0) + ' units)');

    // 3. a second finger lunges: mass is spent, speed jumps
    const m0 = s.mass, v0 = Math.hypot(s.you.vx, s.you.vy);
    await touch('touchStart', [{ x: BX + 60, y: BY, id: 1 }, { x: 300, y: 300, id: 2 }]); await touch('touchMove', [{ x: BX + 60, y: BY, id: 1 }]); await frames();   // CDP: a move without finger 2 lifts it
    await adv(.05); s = await st(); const v1 = Math.hypot(s.you.vx, s.you.vy);
    expect(s.mass < m0 - .3 && s.you.lungeT > 0 && v1 > v0 * 1.6, 'second finger lunges: mass ' + m0.toFixed(1) + '→' + s.mass.toFixed(1) + ', speed ' + v0.toFixed(0) + '→' + v1.toFixed(0));
    await touch('touchEnd', []); await frames(); await adv(1.3);

    // 4. keyboard: hold W → up; Space lunges again; M toggles mute
    s = await st(); const y0 = s.you.y; await page.keyboard.down('KeyW'); await wait(30); await adv(.8); s = await st();
    expect(s.you.y < y0 - 120 && s.you.dy < -.95, 'W steers up'); const m1 = s.mass;
    await page.keyboard.press('Space'); await wait(30); await adv(.05); s = await st(); expect(s.mass < m1 - 1 && s.you.lungeT > 0, 'Space lunges'); await page.keyboard.up('KeyW');
    const mu = await page.locator('#bMute.off').count(); await page.keyboard.press('KeyM'); expect(await page.locator('#bMute.off').count() !== mu, 'M toggles mute'); await page.keyboard.press('KeyM');

    // 5. pause freezes the cycle
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && s.card === 'ovPause', 'P pauses');
    await page.evaluate(() => window.__gdl.manual(false)); await wait(400); expect((await st()).clock === s.clock, 'real-time loop leaves the clock frozen while paused'); await page.evaluate(() => window.__gdl.manual(true));
    await page.locator('#bResume').tap(); await wait(100); await adv(.5); { const q = await st(); expect(!q.paused && q.card === null && q.clock > s.clock + .4, 'resume'); }

    // the pilot: flee spiked rims, hunt dashed rims / edible stars / the core when big enough, else drift to the densest dust
    const pilot = () => page.evaluate(() => { const g = window.__gdl, s = g.state, y = s.you; if (!y || !y.alive) return null;
      let tx, ty, lunge = false, th = null, td = 1e9;
      for (const h of s.holes) { if (h.dying || h.m < y.m * 1.12) continue; const d = Math.hypot(h.x - y.x, h.y - y.y) - h.r; if (d < 300 + h.r * 1.5 && d < td) { td = d; th = h; } }
      if (th) { tx = y.x + (y.x - th.x); ty = y.y + (y.y - th.y); const rr = Math.hypot(tx, ty); if (rr > 1900) { tx -= tx / rr * 600; ty -= ty / rr * 600; } lunge = td < 120 || y.caught; }
      else { let best = null, bv = 0; for (const h of s.holes) { if (h.dying || h.m * 1.15 > y.m || h.shield > 0) continue; const d = Math.hypot(h.x - y.x, h.y - y.y), v = h.m / (d + 200); if (s.holes.some(o => o.m > y.m && Math.hypot(o.x - h.x, o.y - h.y) < o.r + 120)) continue; if (d < 900 && v > bv) { bv = v; best = { x: h.x + (h.x - y.x) * .15, y: h.y + (h.y - y.y) * .15 }; } }
        for (const t of s.stars2) { if (t.m * 1.12 > y.m) continue; const d = Math.hypot(t.x - y.x, t.y - y.y), v = t.m * 1.5 / (d + 200); if (d < 1500 && v > bv) { bv = v; best = t; } }
        if (s.crit && s.core.alive && y.m > s.core.m * 1.1) best = s.core;
        if (best) { tx = best.x; ty = best.y; lunge = Math.hypot(tx - y.x, ty - y.y) < y.r * 3 + 120 && best !== s.core; }
        else { let bd = -1; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283, x = y.x + Math.cos(a) * 350, yy = y.y + Math.sin(a) * 350; if (Math.hypot(x, yy) > 2050) continue; const n = g.dustNear(x, yy, 220); if (n > bd) { bd = n; tx = x; ty = yy; } } } }
      const l = Math.hypot(tx - y.x, ty - y.y) || 1; return { dx: (tx - y.x) / l, dy: (ty - y.y) / l, lunge: lunge && y.lungeCd <= 0 && y.m > 17 }; });
    const lb = await page.locator('#bLunge').boundingBox(), LB = { x: lb.x + lb.width / 2, y: lb.y + lb.height / 2 };
    expect(lb.width >= 44, 'LUNGE button shown for touch');
    const fly = async (secs, until) => { await touch('touchStart', [{ x: BX, y: BY, id: 1 }]); await frames();
      for (let i = 0; i < secs * 4; i++) { const p = await pilot();
        if (!p) { if ((await st()).mode === 'over') break; await adv(.25); if (await page.evaluate(() => { const s = window.__gdl.state; return s.you && s.you.alive && !s.stick.on; })) { await touch('touchStart', [{ x: BX, y: BY, id: 1 }]); await frames(); } continue; }
        await finger(p.dx, p.dy);
        if (p.lunge) { const f1 = { x: BX + p.dx * 60, y: BY + p.dy * 60, id: 1 }; await touch('touchStart', [f1, { x: LB.x, y: LB.y, id: 2 }]); await touch('touchMove', [f1]); await frames(); }   // thumb hits LUNGE
        await adv(.25); if (until && await until()) break; }
      await touch('touchEnd', []); await frames(); };

    // 6. gravity feeds you, and a stick-driven hunt swallows a smaller rival
    s = await st(); const dust0 = s.dustEaten, mass0 = s.mass;
    await fly(10); s = await st();
    expect(s.mass > mass0 + 4 && s.deaths === 0 && s.dustEaten > dust0, 'growing: ' + (s.dustEaten - dust0) + ' motes, ' + s.devoured + ' rivals; mass ' + mass0.toFixed(0) + '→' + s.mass.toFixed(0));
    await fly(70, async () => (await st()).devoured > 0); s = await st();
    expect(s.dustEaten > dust0 + 8, 'gravity pulled ' + (s.dustEaten - dust0) + ' motes of dust into the horizon');
    expect(s.devoured >= 1 && s.banked >= 20, 'swallowed a rival (' + s.devoured + ', banked ' + s.banked + ', mode ' + s.mode + ', clock ' + s.clock.toFixed(1) + ', mass ' + s.mass.toFixed(0) + ')');
    expect(s.holes.some(h => h.mood === 'hunt') || s.holes.some(h => h.mood === 'flee'), 'rivals show intent: ' + [...new Set(s.holes.map(h => h.mood))].join(','));

    // 7. play out the cycle: critical core → supernova → result (a devoured pilot is reborn from a seed and keeps flying)
    await fly(110, async () => (await st()).clock > 125); s = await st();
    expect(s.mode === 'play' && s.crit && s.core.m < 900 && await page.locator('#hud.crit').count() === 1, 'core went critical and is shrinking (' + s.core.m.toFixed(0) + ', ' + s.deaths + ' rebirths so far)');
    await fly(90, async () => { const q = await st(); return q.mode === 'nova' || q.mode === 'over'; }); s = await st();
    if (s.mode === 'nova') { expect(s.shock > 0 && !s.core.alive, 'supernova shockwave'); await fly(15, async () => (await st()).mode === 'over'); }
    await wait(200); s = await st(); const r = s.result;
    expect(s.mode === 'over' && r && s.card === 'ovEnd', 'cycle ended: ' + (r && r.kind) + ' after ' + s.deaths + ' rebirths');
    if (r.kind === 'nova') expect(r.score === r.banked + Math.round(r.mass * (r.rank === 1 ? 1.5 : 1)) && r.mass > 0, 'score = banked + mass (×1.5 if #1): ' + r.score + ' (rank ' + r.rank + ')');
    if (r.kind === 'sun') expect(r.score === r.banked + r.mass * 2 && r.banked >= 600, 'ate the sun: ' + r.score);
    expect(r.kind !== 'dead', 'the pilot reached the end of the cycle');
    expect((await page.locator('#eScore').textContent()) === String(r.score), 'card shows the score');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/cosmic-devourer')));
    expect(stored === r.score && s.best === stored, 'best stored (' + stored + ')');

    // 8. clean restart
    await page.locator('#bAgain').tap(); await wait(150); s = await st();
    expect(s.mode === 'play' && s.clock < .5 && Math.abs(s.mass - 22) < .5 && s.devoured === 0 && s.banked === 0 && s.dustEaten === 0 && s.lives === 3 && s.holes.length === 20 && s.core.alive && s.card === null && s.result === null, 'AWAKEN AGAIN resets the run');

    // 9. steer into the biggest rival: devoured → reborn from a seed (banked kept) → … → the last seed ends the run
    await adv(4); let reborn = false;
    for (let i = 0; i < 1200 && (await st()).mode !== 'over'; i++) { s = await st();
      if (s.mode === 'play' && s.you && s.you.alive) { const big = s.holes.reduce((a, b) => b.m > a.m ? b : a); const dx = big.x - s.you.x, dy = big.y - s.you.y, l = Math.hypot(dx, dy) || 1;
        if (i === 0 || !(await page.evaluate(() => window.__gdl.state.stick.on))) { await touch('touchStart', [{ x: BX, y: BY, id: 1 }]); await frames(); }
        await finger(dx / l, dy / l); if (s.deaths === 1 && !reborn) { reborn = true; expect(Math.abs(s.mass - 22) < 3 && s.lives === 2 && s.you.shield > 0, 'reborn from a seed: mass 22, 2 seeds left, shielded'); } }
      await adv(.25); }
    await touch('touchEnd', []); await wait(150); s = await st();
    expect(reborn && s.mode === 'over' && s.result.kind === 'dead' && s.deaths === 3 && s.lives === 0 && s.card === 'ovEnd' && (await page.locator('#eTitle').textContent()) === 'DEVOURED', 'devoured four times: run over');
    expect(s.result.score === s.result.banked + Math.round(s.result.peak * .25) && (await page.locator('#eScore').textContent()) === String(s.result.score), 'final score = banked + ¼ of peak mass: ' + s.result.score);
    expect(s.best === stored, 'best kept after a worse run');
  },
};
