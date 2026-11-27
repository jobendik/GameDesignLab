// Power Wash Royale: menu → PLAY (real tap) → countdown → a real touch drag blasts grime (dirt under the finger goes, share and
// pressure rise, the washer runs after the stream) → a stain shrugs off the fan and vanishes under the JET (nozzle button) →
// keyboard spraying and nozzle key → pause freezes the clock → the round is played out with a touch-driven sweep → results card:
// ranked shares, lowest rival eliminated, points banked → round 2 with three washers → doing nothing makes you lowest → OUT,
// final score and best stored → PLAY AGAIN restarts cleanly.
module.exports = {
  game: 'games/power-wash-royale.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const scr = (x, y) => page.evaluate(([x, y]) => window.__gdl.toScreen(x, y), [x, y]);
    const dirtAt = (x, y) => page.evaluate(([x, y]) => window.__gdl.dirtAt(x, y), [x, y]);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    const touchW = async (type, x, y) => { const p = await scr(x, y); await touch(type, p.x, p.y); };

    // 1. menu → PLAY → countdown
    let s = await st(); expect(s.mode === 'menu', 'boots to the menu');
    await page.locator('#bPlay').tap(); await wait(120); s = await st();
    expect(s.mode === 'intro' && s.cup === 1 && s.round === 1 && s.score === 0 && s.washers.length === 4 && s.clean === 0, 'round 1 intro with four washers and a filthy mural');
    expect(s.portrait && s.world.w === 600 && s.world.h === 960 && s.gems.length === 6, 'portrait world on a phone');
    const you0 = s.you; await touchW('touchStart', you0.x, you0.y); await adv(.5); expect((await st()).you.removed === 0 && !(await st()).you.spray, 'no washing during the countdown'); await touch('touchEnd');
    await adv(2.2); s = await st(); expect(s.mode === 'play' && s.time > 48.5 && s.time <= 50, 'WASH! starts the 50 s round');

    // 2. a real touch drag cleans what is under the finger
    const tx = you0.x < 300 ? you0.x + 70 : you0.x - 70, ty = you0.y < 480 ? you0.y + 70 : you0.y - 70, d0 = await dirtAt(tx, ty);
    expect(d0 > 40, 'grime under the target (' + d0.toFixed(0) + ')');
    await touchW('touchStart', tx, ty); await wait(60); s = await st(); expect(s.you.spray, 'holding sprays');
    for (let i = 0; i < 24; i++) { await touchW('touchMove', tx + Math.cos(i * .5) * 34, ty + Math.sin(i * .5) * 34); await wait(30); }
    await touchW('touchMove', tx, ty); await wait(250); s = await st();
    expect((await dirtAt(tx, ty)) === 0 && s.you.removed > 3000 && s.you.share > 0 && s.clean > 0, 'grime is gone under the finger; share ' + (s.you.share * 100).toFixed(0) + '%');
    expect(s.you.p > .55, 'staying on dirt built pressure (' + s.you.p.toFixed(2) + ')');
    await touch('touchEnd'); await wait(60); expect(!(await st()).you.spray, 'letting go stops the water');

    // 3. the washer runs after a far-away stream (from here the test steps the simulation itself so the round is reproducible)
    await page.evaluate(() => window.__gdl.manual(true));
    const far = { x: 300, y: 480 }; s = await st(); const dist0 = Math.hypot(s.you.x - far.x, s.you.y - far.y);
    await touchW('touchStart', far.x, far.y); await adv(1); s = await st(); const dist1 = Math.hypot(s.you.x - far.x, s.you.y - far.y);
    expect(dist1 < dist0 - 100 && Math.hypot(s.you.px - s.you.x, s.you.py - s.you.y) <= 136, 'washer ran ' + (dist0 - dist1).toFixed(0) + ' units; stream stays within reach');

    // 4. stains: the fan barely scratches them, the JET erases them
    const stain = await page.evaluate(() => { const g = window.__gdl, s = g.state, me = s.you; let best = null, bv = 1e9; for (const p of g.stains()) { let near = 1e9; for (const w of s.washers) if (w.name !== 'YOU') near = Math.min(near, Math.hypot(w.x - p.x, w.y - p.y)); const v = Math.hypot(me.x - p.x, me.y - p.y) - near * .8; if (v < bv) { bv = v; best = p; } } return best; });
    expect(stain, 'there are stains on the mural');
    await touchW('touchMove', stain.x, stain.y); for (let i = 0; i < 40; i++) { s = await st(); if (Math.hypot(s.you.x - stain.x, s.you.y - stain.y) < 120 && Math.hypot(s.you.px - stain.x, s.you.py - stain.y) < 2) break; await adv(.1); }
    const s0 = await dirtAt(stain.x, stain.y); await adv(.7); const s1 = await dirtAt(stain.x, stain.y);
    expect(s0 > 150 && s1 > 110 && s1 < s0, 'fan only wears a stain down slowly (' + s0.toFixed(0) + ' → ' + s1.toFixed(0) + ')');
    { const fp = await scr(stain.x, stain.y), nb = await page.locator('#bNoz').boundingBox(), pts = [{ x: fp.x, y: fp.y, id: 1 }, { x: nb.x + nb.width / 2, y: nb.y + nb.height / 2, id: 2 }];   // other thumb taps the nozzle button while the first finger keeps spraying
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts }); await wait(60); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [pts[0]] }); await wait(40); }
    s = await st(); expect(s.you.spray && s.ptrDown, 'first finger keeps spraying while the thumb taps'); expect(s.you.jet && await page.locator('#bNoz.jet').count() === 1, 'nozzle button switches to JET');
    await touchW('touchMove', stain.x, stain.y); await adv(.5); expect((await dirtAt(stain.x, stain.y)) === 0, 'the jet erases the stain');
    await touch('touchEnd'); await wait(40);

    // 5. keyboard: D sprays and walks right, Q switches back to the fan, M mutes
    s = await st(); const kx = s.you.x; await page.keyboard.press('KeyQ'); expect(!(await st()).you.jet, 'Q switches back to FAN');
    const dir = kx < 300 ? 'KeyD' : 'KeyA'; await page.keyboard.down(dir); await wait(40); await adv(.8); s = await st();
    expect(s.you.spray && Math.abs(s.you.x - kx) > 60, 'holding ' + dir + ' sprays and walks (' + (s.you.x - kx).toFixed(0) + ')'); await page.keyboard.up(dir); await adv(.1); s = await st(); expect(!s.you.spray, 'releasing the key stops ' + JSON.stringify({ ptr: s.ptrDown, mode: s.mode }));
    const m0 = await page.locator('#bMute.off').count(); await page.keyboard.press('KeyM'); expect(await page.locator('#bMute.off').count() !== m0, 'M toggles mute'); await page.keyboard.press('KeyM');

    // 6. pause
    await page.evaluate(() => window.__gdl.manual(false)); await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
    await wait(350); expect((await st()).time === s.time, 'clock frozen while paused');
    await page.locator('#bResume').tap(); await wait(250); expect(!(await st()).paused && (await st()).time < s.time, 'resume continues'); await page.evaluate(() => window.__gdl.manual(true));

    // 7. play the round out: a scripted player picks the dirtiest spot nearby and drags the real touch point straight to it
    const drive = dt => page.evaluate(dt => { const g = window.__gdl, s = g.state, y = s.you, W = s.world; const d = window.__drv || (window.__drv = { x: y.px, y: y.py, tx: y.px, ty: y.py });
      const val = (x, yy) => { let v = 0; for (const o of [[0, 0], [14, 0], [-14, 0], [0, 14], [0, -14]]) v += Math.min(110, g.dirtAt(x + o[0], yy + o[1])); return v / 5; };
      if (Math.hypot(d.tx - d.x, d.ty - d.y) < 10 || val(d.tx, d.ty) < 12) { let bv = -1; for (const R of [36, 80, 140, 230, 340, 520]) for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 + R, x = d.x + Math.cos(a) * R, yy = d.y + Math.sin(a) * R; if (x < 12 || yy < 12 || x > W.w - 12 || yy > W.h - 12) continue; const v = val(x, yy) / (1 + R / 160); if (v > bv) { bv = v; d.tx = x; d.ty = yy; } } }
      const dx = d.tx - d.x, dy = d.ty - d.y, l = Math.hypot(dx, dy) || 1, m = Math.min(l, 260 * dt); d.x += dx / l * m; d.y += dy / l * m; return g.toScreen(d.x, d.y); }, dt);
    s = await st(); await touchW('touchStart', s.you.px, s.you.py);
    for (let i = 0; i < 700 && (await st()).mode === 'play'; i++) { const p = await drive(.1); await touch('touchMove', p.x, p.y); await adv(.1); }
    await touch('touchEnd'); s = await st(); expect(s.mode === 'rinse' && s.clean > .7, 'round over with most of the mural clean (' + (s.clean * 100).toFixed(0) + '%)');
    const rank = s.you.rank, share = s.you.share, gems = s.you.gems; expect(rank <= 3 && share > .2, 'active play keeps you out of last place (rank ' + rank + ', ' + (share * 100).toFixed(0) + '%)');
    await adv(1.6); await wait(150); s = await st(); expect(s.mode === 'result' && await page.locator('#ovRes').isVisible() && s.clean > .999, 'results card over the fully rinsed mural');
    const want = Math.round(share * 1000) + (rank === 1 ? 250 : rank === 2 ? 100 : 0) + gems * 50;
    expect(s.score === want && s.last.pts === want && s.score > 200, 'points banked: share + place + gems = ' + s.score);
    expect(await page.locator('#rows .rw').count() === 4 && await page.locator('#rows .rw.out').count() === 1 && (await page.locator('#rows .rw.out .nm').textContent()) === s.last.elim && s.last.elim !== 'YOU', 'lowest rival (' + s.last.elim + ') is marked OUT');

    // 8. round 2: three washers, fresh grime
    await page.locator('#bNext').tap(); await wait(120); s = await st();
    expect(s.mode === 'intro' && s.round === 2 && s.washers.length === 3 && s.clean === 0 && s.score === want && !s.washers.some(w => w.name === s.last.elim), 'round 2 starts without ' + s.last.elim);

    // 9. do nothing → lowest share → OUT → best stored
    await adv(2.5); for (let i = 0; i < 80 && (await st()).mode === 'play'; i++) await adv(1);
    s = await st(); expect(s.mode === 'rinse' && s.you.rank === 3 && s.you.removed === 0, 'idle washer ends last');
    await adv(1.6); await wait(150); s = await st(); expect(s.mode === 'over' && s.last.out && await page.locator('#overBox').isVisible(), 'lowest share is eliminated — run over');
    expect((await page.locator('#fScore').textContent()) === String(s.score) && (await page.locator('#bNext').textContent()) === 'PLAY AGAIN', 'final score shown');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/power-wash-royale')));
    expect(stored === s.score && s.best === stored && stored >= want, 'best score persisted (' + stored + ')');

    // 10. clean restart
    await page.evaluate(() => window.__gdl.manual(false));
    await page.locator('#bNext').tap(); await wait(150); s = await st();
    expect(s.mode === 'intro' && s.cup === 1 && s.round === 1 && s.score === 0 && s.washers.length === 4 && s.clean === 0 && s.wins === 0 && s.you.removed === 0 && !s.you.jet, 'restart resets the run');
    expect(s.best === stored && !(await page.locator('#ovRes').isVisible()) && s.gems.every(g => !g.taken), 'best kept, card gone, gems re-hidden');
  },
};
