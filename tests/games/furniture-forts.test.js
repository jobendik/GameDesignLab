// Furniture Forts: menu → PLAY (real tap) → real touch drags pull bookcases and a plank off the shelf into a fort (height meter moves) →
// second-finger tap and the R key turn a held piece → a piece dropped inside the fort pops up on top → pause freezes the build clock →
// READY: early-bird points, lights out, the pillow barrage is survived (SAFE + HEIGHT + COZY scored, no heart lost) → night 2 deals
// new pieces → left unrepaired, the escalating nights (dog theft, quake, toy rain) wake Sir Biscuit three times → game over card,
// best score stored → PLAY AGAIN restarts cleanly.
module.exports = {
  game: 'games/furniture-forts.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const scr = (x, y) => page.evaluate(([x, y]) => window.__gdl.toScreen(x, y), [x, y]);
    const slot = t => page.evaluate(t => window.__gdl.slotXY(t), t);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const glide = async (a, b, n = 8) => { for (let i = 1; i <= n; i++) { await touch('touchMove', [{ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n, id: 1 }]); await wait(16); } };
    // finger carries the piece ~26 px + half its height above the fingertip when it comes off the shelf, so aim the finger lower
    const dragTo = async (from, to, mid) => { await touch('touchStart', [{ x: from.x, y: from.y, id: 1 }]); await wait(30); await glide(from, to); await wait(120); if (mid) await mid(to); await touch('touchEnd', []); await wait(120); };
    const near = (a, b, tol) => Math.abs(a - b) <= tol;
    const piece = (s, type, i = 0) => s.pieces.filter(p => p.type === type)[i];

    // 1. menu → PLAY
    let s = await st(); expect(s.mode === 'menu', 'boots to the menu');
    await page.locator('#bPlay').tap(); await wait(150); s = await st();
    expect(s.mode === 'build' && s.night === 1 && s.hearts === 3 && s.score === 0 && s.pieces.length === 0, 'night 1 starts with an empty room');
    expect(s.tray.shelf === 2 && s.tray.plank === 1 && s.tray.table === 1 && s.tray.cushion === 2 && s.tray.bolster === 1, 'starter kit is on the shelf ' + JSON.stringify(s.tray));
    expect(s.forecast.join() === 'pillows' && s.buildLeft > 55 && s.height === 0, 'forecast shows pillows; build clock running');
    expect(await page.locator('#fore .chip').count() === 2 && !s.teddy.fallen, 'forecast chips are shown');

    // 2. real touch drags build the doorway fort (bookcase halves are 61 tall → finger sits 61 + 26 px·scale below the piece centre)
    const k = (await scr(0, 0)).y - (await scr(0, -1)).y;                                   // screen px per world unit
    const finger = async (x, y, hh) => { const p = await scr(x, y); return { x: p.x, y: p.y + hh * k + 26 }; };
    await touch('touchStart', [{ ...(await slot('shelf')), id: 1 }]); await wait(60); s = await st();
    expect(s.held != null && s.tray.shelf === 1 && s.pieces.length === 1 && s.pieces[0].ghost, 'touching a shelf slot lifts a bookcase off the shelf');
    await glide(await slot('shelf'), await finger(-72, -62, 61)); await wait(150); await touch('touchEnd', []); await wait(400); s = await st();
    let p = piece(s, 'shelf'); expect(s.held == null && p && !p.ghost && near(p.x, -72, 5) && near(p.y, -61, 4) && near(p.angle, 0, .05), 'bookcase stands where it was dropped ' + JSON.stringify(p));
    expect(s.height >= 120 && s.height <= 124, 'height meter reads the bookcase (' + s.height + ')');
    await dragTo(await slot('shelf'), await finger(72, -62, 61)); await wait(300);
    await dragTo(await slot('plank'), await finger(0, -150, 8)); await wait(700); s = await st();
    p = piece(s, 'plank'); expect(p && near(p.x, 0, 6) && near(p.y, -130, 4) && near(p.angle, 0, .05), 'plank settles across both bookcases ' + JSON.stringify(p));
    expect(s.height >= 136 && s.height <= 140 && s.tray.shelf === 0 && s.tray.plank === 0, 'fort is 138 tall');

    // 3. turning: a second finger while carrying, then the R key on a piece picked back up from the floor
    await dragTo(await slot('bolster'), await finger(-190, -70, 18), async to => { await touch('touchStart', [{ x: to.x, y: to.y, id: 1 }, { x: 40, y: 300, id: 2 }]); await wait(80); const q = await st(); expect(q.held != null && near(q.heldAngle, Math.PI / 2, .01), 'second finger turns the held piece'); await touch('touchMove', [{ x: to.x, y: to.y, id: 1 }]); await wait(260); });
    await wait(500); s = await st(); p = piece(s, 'bolster'); expect(p && near(Math.abs(Math.sin(p.angle)), 1, .06) && near(p.y, -62, 5), 'bolster stands on end ' + JSON.stringify(p));
    const bp = await scr(p.x, p.y); await touch('touchStart', [{ x: bp.x, y: bp.y, id: 1 }]); await wait(80); expect((await st()).held === p.id, 'touching a placed piece picks it up again');
    await page.keyboard.press('KeyR'); await wait(300); expect(near((await st()).heldAngle, Math.PI, .01), 'R turns it another quarter');
    await glide(bp, { x: bp.x, y: bp.y + 20 }, 3); await touch('touchEnd', []); await wait(500); s = await st(); p = piece(s, 'bolster'); expect(near(Math.abs(Math.cos(p.angle)), 1, .06) && near(p.y, -18, 4), 'bolster lies flat again ' + JSON.stringify(p));

    // 4. a piece let go inside other things pops up on top instead of exploding the fort
    await dragTo(await slot('cushion'), await finger(0, -44, 28)); await wait(700); s = await st();
    p = piece(s, 'cushion'); expect(p && !p.ghost && p.y < -150 && near(p.x, 0, 8), 'cushion dropped on Sir Biscuit lands on the roof ' + JSON.stringify(p));
    expect(s.teddy.x === 0 && near(s.teddy.y, -47, .5), 'Sir Biscuit is not disturbed while building');
    const h1 = s.height; expect(h1 > 185 && h1 < 200, 'height counts the cushion on the roof (' + h1 + ')');

    // 5. pause freezes the build clock
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
    await wait(350); expect((await st()).buildLeft === s.buildLeft, 'clock frozen while paused');
    await page.locator('#bResume').tap(); await wait(250); expect(!(await st()).paused && (await st()).buildLeft < s.buildLeft, 'resume continues');

    // 6. READY → lights out → the pillow barrage → safe
    await page.locator('#bReady').tap(); await wait(80); s = await st();
    expect(s.mode === 'siege' && s.score === 40, 'READY starts the night with a capped early-bird bonus (' + s.score + ')');
    await touch('touchStart', [{ ...(await scr(-72, -61)), id: 1 }]); await wait(60); expect((await st()).held == null, 'hands off during the night'); await touch('touchEnd', []);
    let seen = 0; for (let i = 0; i < 80 && (await st()).mode === 'siege'; i++) { await adv(.25); seen = Math.max(seen, (await st()).proj); }
    s = await st(); expect(seen >= 2, 'pillows flew (' + seen + ' in the air at once)');
    expect(s.mode === 'tally' && !s.breached && s.hearts === 3 && s.safeNights === 1, 'the fort held on night 1');
    const want = 40 + 100 + Math.round(s.height / 2) + Math.round(s.cozy * 100);
    expect(s.score === want && s.score > 200 && s.height > 130, 'SAFE + HEIGHT + COZY scored: ' + s.score + ' (height ' + s.height + ')');

    // 7. night 2 deals three new pieces and keeps the fort
    await adv(3); s = await st(); const inTray = Object.values(s.tray).reduce((a, b) => a + b, 0);
    expect(s.mode === 'build' && s.night === 2 && near(s.buildLeft, 40, 1) && inTray === 5 && s.pieces.length === 5, 'night 2: fort kept, 3 new pieces dealt (' + inTray + ' on the shelf)');
    expect(s.forecast.join() === 'pillows' && near(s.teddy.y, -47, .5), 'Sir Biscuit is tucked back in');

    // 8. never repaired, the escalating nights win: three wake-ups end the run
    const log = []; let sawDog = false, sawQuake = false;
    for (let n = 0; n < 14 && (await st()).mode === 'build'; n++) {
      const h0 = (await st()).hearts; await page.keyboard.press('Space'); await wait(30); expect((await st()).mode === 'siege', 'Space starts the night');
      for (let i = 0; i < 200 && (await st()).mode === 'siege'; i++) { await adv(.25); const q = await st(); sawDog = sawDog || q.dog; sawQuake = sawQuake || q.quake; }
      s = await st(); log.push(s.night + (s.hearts < h0 ? 'x' : 'ok')); expect(s.hearts === h0 - (s.breached ? 1 : 0), 'a breach costs exactly one heart'); await adv(3.1);
    }
    s = await st(); expect(s.mode === 'over' && s.hearts === 0 && s.night >= 4, 'three wake-ups end the run (' + log.join(' ') + ')');
    expect(sawDog && sawQuake && s.stolen >= 1, 'the dog came and stole furniture (' + s.stolen + '), the quake hit');
    await adv(1.5); await wait(120); expect(await page.locator('#ovOver').isVisible(), 'game-over card shown');
    expect((await page.locator('#fScore').textContent()) === String(s.score), 'final score shown');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/furniture-forts')));
    expect(stored === s.score && s.best === s.score && stored > 200, 'best score persisted (' + stored + ')');

    // 9. clean restart
    await page.locator('#bAgain').tap(); await wait(200); s = await st();
    expect(s.mode === 'build' && s.night === 1 && s.hearts === 3 && s.score === 0 && s.pieces.length === 0 && s.stolen === 0 && s.safeNights === 0 && s.proj === 0 && !s.dog, 'restart resets the run');
    expect(s.tray.shelf === 2 && s.tray.table === 1 && s.best === stored && !(await page.locator('#ovOver').isVisible()), 'starter kit back, best kept');
    await page.evaluate(() => window.__gdl.place('cushion', 62, -28)); await adv(.5); s = await st();
    expect(s.cozy > .1 && s.cozy < .5 && s.height >= 54, 'a cushion snug beside him registers as COZY (' + s.cozy.toFixed(2) + ')');
  },
};
