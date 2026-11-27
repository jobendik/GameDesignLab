// Neon Core Ballstorm: menu → START (real tap) → a mouse drag aims at a chosen block (the preview names it and the first packet
// really bounces where the preview said) → the volley damages blocks, the turn advances, rows descend → speed key + RECALL button →
// module draft after turn 2 (tap a card, the build changes) → keyboard aim + fire → pause freezes the simulation → a 250-packet
// storm never leaves the walls or ends up inside a block and always comes home → touch "slide to fine-aim" under the board →
// wasted volleys let rows cross the firewall → integrity runs out → CORE BREACHED, best stored → RUN AGAIN restarts cleanly →
// the same seed replays identically.
module.exports = {
  game: 'games/neon-core-ballstorm.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const pt = (a, d) => page.evaluate(([a, d]) => window.__gdl.aimPoint(a, d), [a, d || 150]);
    const finish = async () => { for (let i = 0; i < 600; i++) { const s = await st(); if (s.mode !== 'volley' && s.mode !== 'settle') return s; await adv(.25); } throw new Error('volley never ended'); };
    const shootAt = async a => { let p = await pt(a, 90); if (p.x < 6 || p.x > page.viewportSize().width - 6) p = await pt(Math.PI - a, 90);   // a press outside the viewport is ignored by the browser: mirror the shot
      await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.up(); };
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    const opening = async () => {            // START, then one aimed volley at the lowest block nearest the launcher; returns a signature of the result
      await page.locator('#bPlay').tap(); await wait(120); await page.evaluate(() => window.__gdl.manual(true));
      const s0 = await st(), low = Math.max(...s0.bricks.map(b => b.r)), tgt = s0.bricks.filter(b => b.r === low).sort((a, b) => Math.abs(a.c - 3) - Math.abs(b.c - 3))[0];
      const a = Math.atan2(566 - (tgt.r + .5) * 60, (tgt.c + .5) * 60 - s0.lx), p = await pt(a);
      await page.mouse.move(p.x, p.y); await page.mouse.down(); await wait(80); const s1 = await st();
      await page.mouse.up(); return { s0, s1, tgt, a };
    };

    // 1. menu → START
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#ovMenu').isVisible(), 'boots to the menu');
    const o = await opening(); s = o.s0;
    expect(s.turn === 1 && s.score === 0 && s.balls === 3 && s.fw === 3 && s.bricks.length >= 2 && s.picks.length >= 1 && s.seed === 7, 'fresh seeded run: 3 packets, 3 integrity, two rows');
    expect(!(await page.locator('#ovMenu').isVisible()), 'menu closed');

    // 2. the drag aims; the preview names the block it will hit; the first packet bounces exactly there
    const initial = JSON.stringify([s.bricks, s.picks]), tgt = o.tgt;
    expect(Math.abs(o.s1.ang - o.a) < .01 && o.s1.mode === 'aim', 'holding the pointer aims at it (' + o.s1.ang.toFixed(3) + ')');
    expect(o.s1.first && o.s1.first.c === tgt.c && o.s1.first.r === tgt.r && o.s1.preview.length >= 6, 'preview highlights the block under the aim line and shows the bounce');
    s = await st(); expect(s.mode === 'volley' && s.toFire === 3, 'release fires the stream');
    let hit = null; for (let i = 0; i < 400 && !hit; i++) { await adv(1 / 120); const t = await st(); if (t.hits > 0) hit = t; }
    expect(hit, 'a packet reached a block');
    const now = hit.bricks.find(b => b.c === tgt.c && b.r === tgt.r), d = Math.hypot(hit.ballsXY[0][0] - o.s1.preview[2], hit.ballsXY[0][1] - o.s1.preview[3]);
    expect((!now && tgt.hp === 1) || (now && now.hp === tgt.hp - 1), 'the aimed block lost exactly 1 hp');
    expect(d < 8 && hit.score > 0, 'first bounce is where the preview drew it (' + d.toFixed(1) + ' units off)');
    s = await finish();
    expect(s.turn === 2 && s.mode === 'aim' && s.balls >= 3 && s.flying === 0, 'all packets home, turn 2');
    expect(Math.max(...s.bricks.map(b => b.r)) <= 3 && s.bricks.some(b => b.r === 1), 'rows stepped down and a new row arrived');
    const sig = JSON.stringify([s.score, s.lx, s.balls, s.bricks, s.picks]);

    // 3. speed key + RECALL button; the draft opens after turn 2
    await shootAt(2.9); await adv(.4); s = await st(); expect(s.mode === 'volley' && s.flying > 0 && s.speed === 1, 'second volley in flight');
    await page.keyboard.press('Space'); s = await st(); expect(s.speed === 2 && s.userSpeed === 2, 'Space speeds the volley up');
    await wait(60); expect(!(await page.locator('#bRecall').isDisabled()), 'RECALL is live during a volley'); await page.locator('#bRecall').tap(); await adv(1.2);
    s = await st(); expect(s.mode === 'draft' && s.flying === 0 && s.turn === 3, 'RECALL brings the packets home and ends the turn');
    expect(s.draft.length === 3 && new Set(s.draft).size === 3 && await page.locator('#ovDraft').isVisible() && await page.locator('.dc').count() === 3, 'three different modules on offer');
    const pickId = s.draft[1], balls0 = s.balls; await page.locator('.dc').nth(1).tap(); await adv(.1); s = await st();
    expect(s.mode === 'aim' && s.ups[pickId] === 1 && !(await page.locator('#ovDraft').isVisible()), 'tapped module ' + pickId + ' is installed');
    expect(pickId === 'balls' ? s.balls > balls0 : s.balls === balls0, 'packet count reflects the pick');
    await wait(60); expect((await page.locator('#build .chip').count()) === 1, 'build chip shown');

    // 4. keyboard: arrows aim, Space fires
    const a0 = s.ang; await page.keyboard.down('ArrowLeft'); await wait(220); await page.keyboard.up('ArrowLeft'); s = await st();
    expect(s.ang > a0 + .05 && s.mode === 'aim', 'ArrowLeft swings the aim left (' + (s.ang - a0).toFixed(2) + ' rad)');
    await page.keyboard.press('Space'); expect((await st()).mode === 'volley', 'Space fires'); s = await finish();
    if (s.mode === 'draft') { await page.locator('.dc').first().tap(); await adv(.1); }

    // 5. pause freezes the simulation
    await page.evaluate(() => window.__gdl.manual(false)); await shootAt(1.9); await wait(150);
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
    await wait(300); expect((await st()).tick === s.tick, 'no ticks while paused');
    await page.locator('#bResume').tap(); await wait(250); expect(!(await st()).paused && (await st()).tick > s.tick, 'resume continues');
    const m0 = (await st()).muted; await page.keyboard.press('KeyM'); expect((await st()).muted !== m0, 'M toggles mute'); await page.keyboard.press('KeyM');
    await page.evaluate(() => window.__gdl.manual(true)); s = await finish(); if (s.mode === 'draft') { await page.locator('.dc').first().tap(); await adv(.1); }

    // 6. physics under load: 250 packets stay inside the walls, never end up inside a block, and every one comes home
    await page.evaluate(() => window.__gdl.cheat({ balls: 250 })); s = await st(); expect(s.mode === 'aim' && s.balls === 250, 'storm loaded');
    const turn0 = s.turn, kills0 = s.kills; await shootAt(.42); let peak = 0, bad = 0, vt = 0;
    for (let i = 0; i < 1200; i++) { await adv(.1);
      const r = await page.evaluate(() => { const g = window.__gdl, s = g.state, C = g.const; let bad = 0;
        for (const [x, y, , , free] of s.ballsXY) { if (x < C.R - .02 || x > C.WW - C.R + .02 || y < C.R - .02 || y > C.LY + .02) bad++;
          if (!free) for (const b of s.bricks) { const x0 = b.c * 60 + 3, y0 = b.r * 60 + 3, sz = 60 * b.w - 6; if (x > x0 && x < x0 + sz && y > y0 && y < y0 + sz) bad++; } }
        return { bad, n: s.flying, mode: s.mode, vt: s.vt }; });
      bad += r.bad; peak = Math.max(peak, r.n); if (r.mode !== 'volley') break; vt = r.vt; }
    expect(bad === 0, 'no packet escaped the walls or tunnelled into a block (' + bad + ' violations)');
    expect(peak >= 100, 'hundreds of packets were in flight (peak ' + peak + ')');
    s = await finish(); if (s.mode === 'draft') { await page.locator('.dc').first().tap(); await adv(.1); s = await st(); }
    expect(s.turn === turn0 + 1 && s.flying === 0 && vt < 120 * 80 && s.kills > kills0, 'the storm ended by itself after ' + (vt / 120).toFixed(1) + ' s of simulation and deleted blocks');

    // 7. touch: sliding under the board fine-aims without covering the grid; lifting fires
    s = await st(); expect(s.mode === 'aim', 'aiming again'); const vp = page.viewportSize(), ty = vp.height - 130, a1 = s.ang;
    await touch('touchStart', 260, ty); await wait(40); await touch('touchMove', 230, ty); await wait(40); await touch('touchMove', 200, ty); await wait(60); s = await st();
    expect(Math.abs((s.ang - a1) - 60 * .0062) < .02 && s.mode === 'aim', 'a 60 px slide turned the aim ' + (s.ang - a1).toFixed(3) + ' rad to the left');
    await touch('touchEnd'); await wait(60); expect((await st()).mode === 'volley', 'lifting the finger fires'); s = await finish();

    // 8. waste every volley (fire flat, recall at once) → rows cross the firewall → integrity runs out
    let fwSeen = 99, breaches = 0;
    for (let i = 0; i < 80; i++) { s = await st(); if (s.mode === 'over') break; if (s.fw < fwSeen) { if (fwSeen !== 99) breaches++; fwSeen = s.fw; }
      if (s.mode === 'draft') { await page.locator('.dc').first().tap(); await adv(.1); continue; }
      if (s.mode === 'aim') { await shootAt(3.0); await page.keyboard.press('KeyR'); } await adv(.5); }
    s = await st(); expect(s.mode === 'over' && s.fw <= 0 && breaches >= 1, 'blocks crossing the firewall end the run (turn ' + s.turn + ')');
    await wait(150); expect(await page.locator('#ovOver').isVisible() && (await page.locator('#oScore').textContent()) === String(s.score), 'CORE BREACHED card shows the score');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/neon-core-ballstorm')));
    expect(stored === s.best && stored >= s.score && stored > 0, 'best score persisted (' + stored + ')');

    // 9. clean restart
    await page.locator('#bAgain').tap(); await wait(150); s = await st();
    expect(s.mode === 'aim' && s.turn === 1 && s.score === 0 && s.balls === 3 && s.fw === 3 && s.fwMax === 3 && Object.keys(s.ups).length === 0 && s.flying === 0 && !s.boss && s.kills === 0, 'restart resets the run');
    expect(s.best === stored && !(await page.locator('#ovOver').isVisible()) && (await page.locator('#build .chip').count()) === 0, 'best kept, card gone, build cleared');
    expect(JSON.stringify([s.bricks, s.picks]) === initial, 'same seed deals the same opening board');

    // 10. determinism: reload, replay the opening volley, get the identical result
    await page.reload({ waitUntil: 'load' }); await wait(300); await opening(); s = await finish();
    expect(JSON.stringify([s.score, s.lx, s.balls, s.bricks, s.picks]) === sig, 'replaying the same aim on the same seed reproduces the volley exactly');
  },
};
