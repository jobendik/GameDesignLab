// Star Petal Cascade: menu → Play (real tap) → a held pointer aims from the moon and the dotted preview is the star's real path →
// release drops one star; buds bloom, moonbuds count down, score rises exactly as the physics predicts, woken buds are cleared →
// holding → blows a breeze that accelerates the star and drains breath; the on-screen breeze pad and a touch on the garden do
// the same → pause freezes the fall → a star dropped into the drifting lily cup comes back → the garden is cleared (bonus, next
// garden, more moonbuds) → stars are thrown away until none are left → "The garden sleeps", best stored → Play again restarts
// cleanly on the same seeded garden → a reload replays the first drop identically.
module.exports = {
  game: 'games/star-petal-ballstorm.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const pt = (a, d) => page.evaluate(([a, d]) => window.__gdl.aimPoint(a, d), [a, d || 130]);
    const hold = async a => { const p = await pt(a); await page.mouse.move(p.x, p.y); await page.mouse.down(); await wait(50); };
    const drop = async a => { await hold(a); await page.mouse.up(); };
    const until = async (ok, what) => { for (let i = 0; i < 900; i++) { const s = await st(); if (ok(s)) return s; await adv(.1); } throw new Error('never reached: ' + what); };
    const idle = () => until(s => s.mode !== 'drop' && s.mode !== 'settle', 'end of drop');
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    const opening = async () => {               // Play, then the first drop at the angle the helper rates best; returns what happened
      await page.locator('#bPlay').tap(); await wait(120); await page.evaluate(() => window.__gdl.manual(true));
      const s0 = await st(), a = await page.evaluate(() => window.__gdl.bestAngle());
      await hold(a); const s1 = await st(), pred = await page.evaluate(a => window.__gdl.simDrop(a), s1.ang); await page.mouse.up(); return { s0, s1, a, pred };   // predict for the angle the pointer really produced
    };

    // 1. menu → Play
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#ovMenu').isVisible(), 'boots to the menu');
    const o = await opening(); s = o.s0;
    expect(s.mode === 'aim' && s.garden === 1 && s.score === 0 && s.stars === 8 && s.moonAll === 8 && s.moonLeft === 8 && s.pegs.length >= 34 && s.seed === 7, 'garden 1: 8 stars, 8 sleeping moonbuds, ' + s.pegs.length + ' buds');
    expect(s.pegs.filter(p => p.type === 'moon').length === 8 && s.pegs.some(p => p.type === 'bell') && s.pegs.some(p => p.type === 'dew'), 'moonbuds, bell flowers and a dew bud are planted');
    const initial = JSON.stringify(s.pegs), pegs0 = s.pegs.length;

    // 2. aim: the pointer sets the angle, the preview is the true path, the drop does what the physics says
    expect(Math.abs(o.s1.ang - o.a) < .01 && o.s1.mode === 'aim' && o.s1.previewHit >= 1, 'holding the pointer aims from the moon (' + o.s1.ang.toFixed(3) + ' rad)');
    s = await st(); expect(s.mode === 'drop' && s.stars === 7 && s.balls.length === 1, 'release drops one star');
    const j = Math.min(4, o.s1.previewHit - 1); await adv((2 * j + 1) / 120); s = await st();
    const off = Math.hypot(s.balls[0].x - o.s1.preview[j * 2], s.balls[0].y - o.s1.preview[j * 2 + 1]);
    expect(off < 1e-6, 'the star is exactly on the previewed path (' + off.toExponential(1) + ' units off)');
    s = await until(t => t.mode !== 'drop', 'star lands');
    expect(o.pred.moon + o.pred.bud >= 3 && s.combo === o.pred.moon + o.pred.bud && s.moonLeft === 8 - o.pred.moon, 'cascade of ' + s.combo + ' buds, ' + o.pred.moon + ' moonbuds — as simulated');
    expect(s.score >= 10 * s.combo && s.stars === 7 + o.pred.caught + (s.combo >= 10 ? 1 : 0), 'score ' + s.score + ' banked; stars ' + s.stars);
    expect(s.pegs.filter(p => p.lit).length === s.combo, 'woken buds stay in bloom until the star is gone');
    s = await idle(); expect(s.mode === 'aim' && s.pegs.length === pegs0 - s.combo && !s.pegs.some(p => p.lit), 'woken buds are cleared from the garden');
    const sig = JSON.stringify([s.score, s.stars, s.moonLeft, s.pegs]);

    // 3. breeze: find a line with a long free fall, then hold → and watch the star accelerate while breath drains
    let free = { hit: 0, a: 1.57 }; for (let a = .5; a < 2.7; a += .1) { await hold(a); const t = await st(); if (t.previewHit > free.hit) free = { hit: t.previewHit, a }; const up = await page.evaluate(() => window.__gdl.toScreen(210, 20)); await page.mouse.move(up.x, up.y); await page.mouse.up(); }
    s = await st(); expect(s.mode === 'aim' && s.stars >= 1, 'dragging back above the moon cancels the aim (still ' + s.stars + ' stars)');
    expect(free.hit * 2 > 34, 'found a free-fall line (' + free.hit * 2 + ' ticks)');
    await drop(free.a); await adv(5 / 120); const v0 = (await st()).balls[0].vx;
    await page.keyboard.down('ArrowRight'); await wait(40); await adv(20 / 120); s = await st();
    expect(s.wind === 1 && Math.abs(s.balls[0].vx - v0 - 560 * 20 / 120) < .5, 'breeze pushed the star right by ' + (s.balls[0].vx - v0).toFixed(1) + ' u/s');
    expect(Math.abs(s.breath - (1 - 20 / 120 * .8)) < 1e-6, 'breath drained to ' + s.breath.toFixed(3));
    await page.keyboard.up('ArrowRight'); await wait(40); await adv(.05); const b1 = (await st()).breath; expect((await st()).wind === 0 && Math.abs(b1 - s.breath) < 1e-9, 'letting go stops the breeze');
    const bb = await page.locator('#bL').boundingBox(); await touch('touchStart', bb.x + bb.width / 2, bb.y + bb.height / 2); await wait(60); await adv(.05);
    s = await st(); expect(s.wind === -1 && s.breath < b1 && await page.locator('#bL.on').count() === 1, 'the breeze pad blows left'); await touch('touchEnd'); await wait(60); expect((await st()).wind === 0, 'pad released');
    const vp = page.viewportSize(); await touch('touchStart', vp.width * .8, vp.height * .5); await wait(60); expect((await st()).wind === 1, 'touching the right half of the garden blows right'); await touch('touchEnd'); await wait(60);
    s = await idle();

    // 4. pause freezes the fall
    if (s.mode === 'aim') { await page.evaluate(() => window.__gdl.manual(false)); await drop(1.4); await wait(120);
      await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
      await wait(300); expect((await st()).tick === s.tick, 'no ticks while paused');
      await page.locator('#bResume').tap(); await wait(250); expect(!(await st()).paused && (await st()).tick > s.tick, 'resume continues');
      const m0 = (await st()).muted; await page.keyboard.press('KeyM'); expect((await st()).muted !== m0, 'M toggles mute'); await page.keyboard.press('KeyM');
      await page.evaluate(() => window.__gdl.manual(true)); s = await idle(); }

    // 5. the lily cup: a star that lands in it comes back
    const cancel = async () => { const up = await page.evaluate(() => window.__gdl.toScreen(210, 20)); await page.mouse.move(up.x, up.y); await page.mouse.up(); };
    let cup = false; const before = await st();
    for (let i = 0; i < 80 && !cup; i++) { const list = await page.evaluate(() => { const g = window.__gdl, out = []; for (let a = .3; a < 2.84; a += .01) { const r = g.simDrop(a); if (r.caught > 0 && r.moon + r.bud < 9) out.push(a); } return out; });
      for (const a of list) { await hold(a); const r = await page.evaluate(() => window.__gdl.simDrop(window.__gdl.state.ang)); if (r.caught > 0 && r.moon + r.bud < 9) { await page.mouse.up(); cup = true; break; } await cancel(); }
      if (!cup) await adv(.2); }
    expect(cup, 'a line into the lily cup exists'); s = await until(t => t.mode !== 'drop', 'cup drop lands');
    expect(s.caught === before.caught + 1 && s.stars === before.stars, 'star caught by the lily cup: pouch still ' + s.stars); s = await idle();

    // 6. wake every moonbud → garden in bloom → garden 2
    for (let i = 0; i < 40 && s.mode === 'aim' && s.garden === 1; i++) { const a = await page.evaluate(() => window.__gdl.bestAngle()); await drop(a); s = await idle(); }
    expect(s.mode === 'clear' && s.garden === 1 && s.moonLeft === 0 && s.pegs.length === 0, 'last moonbud woken: the whole garden bursts into bloom');
    const sc = s.score, stars = s.stars; expect(sc >= 500 + 100 * stars, 'bloom bonus banked (' + sc + ')');
    s = await until(t => t.mode === 'aim', 'garden 2'); expect(s.garden === 2 && s.moonAll === 9 && s.moonLeft === 9 && s.pegs.length >= 34 && s.stars === Math.min(12, stars + 3) && s.score === sc, 'garden 2: 9 moonbuds, +3 stars');
    expect(JSON.stringify(s.pegs) !== initial && s.pegs.some(p => p.type === 'twin'), 'a different layout with a twin bud');

    // 7. throw the stars away → none left with moonbuds still asleep → the garden sleeps
    for (let i = 0; i < 120; i++) { s = await st(); if (s.mode === 'over') break; if (s.mode !== 'aim') { await adv(.2); continue; }
      const a = await page.evaluate(() => { const g = window.__gdl; let best = 1.57, bv = 1e9; for (let a = .25; a < 2.9; a += .03) { const r = g.simDrop(a), v = r.moon * 100 + r.caught * 50 + r.bud; if (v < bv) { bv = v; best = a; } } return best; }); await drop(a); }
    s = await st(); expect(s.mode === 'over' && s.stars === 0 && s.moonLeft > 0, 'out of stars with ' + s.moonLeft + ' moonbuds asleep (garden ' + s.garden + ')');
    await wait(150); expect(await page.locator('#ovOver').isVisible() && (await page.locator('#oScore').textContent()) === String(s.score), 'end card shows the score');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/star-petal-ballstorm')));
    expect(stored === s.best && stored === s.score && stored >= sc, 'best score persisted (' + stored + ')');

    // 8. clean restart on the same seeded garden
    await page.locator('#bAgain').tap(); await wait(150); s = await st();
    expect(s.mode === 'aim' && s.garden === 1 && s.score === 0 && s.stars === 8 && s.moonLeft === 8 && s.combo === 0 && s.caught === 0 && s.balls.length === 0 && s.breath === 1, 'restart resets the run');
    expect(s.best === stored && !(await page.locator('#ovOver').isVisible()) && JSON.stringify(s.pegs) === initial, 'best kept, card gone, same seeded garden');

    // 9. determinism: reload and replay the first drop
    await page.reload({ waitUntil: 'load' }); await wait(300); await opening(); s = await idle();
    expect(JSON.stringify([s.score, s.stars, s.moonLeft, s.pegs]) === sig, 'same seed + same aim reproduces the drop exactly');
  },
};
