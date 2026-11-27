// Orbit Drift 3D — Ringstream: menu → LAUNCH (real tap) → real mouse steering threads the first rings (score, combo, PERFECTs, speed)
// → arrow keys move the aim → a real touch drag steers relatively → steering wide misses a ring (combo reset, charge lost)
// → at the planet the probe is steered into the orange band: SLINGSHOT (surge, +score) → flying into a rock costs charge
// → pause freezes the clock → flying wide of everything drains the charge: game over, best stored → FLY AGAIN restarts cleanly.
// The simulation is stepped by the test (manual/advance) so software-rendered WebGL frame rate does not matter.
module.exports = {
  game: 'games/orbit-drift-3d.html',
  query: '?seed=7&nopause=1&mute=1&q=0',
  timeout: 170000,
  viewport: { width: 320, height: 568 },   // small phone: keeps software-rendered WebGL frames (and so the test) quick
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const aim = async (x, y) => { const q = await page.evaluate(([x, y]) => window.__gdl.toPointer(x, y), [x, y]); await page.mouse.move(q.x, q.y); };
    // fly with the mouse held on the next ring's centre until `stop(state)` says so
    const thread = async (stop, max, msg) => { for (let i = 0; i < (max || 400); i++) { const [s, q] = await page.evaluate(() => { const s = window.__gdl.state; return [s, window.__gdl.toPointer(s.next.x, s.next.y)]; }); if (s.mode !== 'play' || stop(s)) return s; await page.mouse.move(q.x, q.y); await adv(.06); } throw new Error('expect failed: timed out waiting for ' + msg); };
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });

    // 1. menu → LAUNCH
    let s = await st(); expect(s.mode === 'menu', 'boots to the menu');
    await page.locator('#bPlay').tap(); await wait(150); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.energy === 100 && s.combo === 0 && s.nextIndex === 0 && s.sector === 0, 'run starts with full charge at ring 1');
    await page.evaluate(() => window.__gdl.manual(true));
    const z0 = s.ship.z; await adv(.5); s = await st(); expect(s.ship.z < z0 - 8 && s.speed > 20, 'the probe flies forward on its own');

    // 2. mouse steering threads rings: score, combo, perfects, speed
    s = await thread(q => q.nextIndex >= 5, 400, 'five rings');
    expect(s.rings === 5 && s.missed === 0 && s.score >= 500 && s.combo >= 5 && s.perfects >= 3 && s.mult >= 2, 'five rings threaded: score ' + s.score + ', combo ' + s.combo + ', ' + s.perfects + ' perfect');
    expect(s.energy > 85 && s.speed > 25, 'rings keep the charge up (' + s.energy.toFixed(0) + ') and the combo adds speed (' + s.speed.toFixed(1) + ')');

    // 3. keyboard moves the aim
    let t0 = s.target.x; await page.keyboard.down('ArrowLeft'); await adv(.3); await page.keyboard.up('ArrowLeft'); s = await st();
    expect(s.target.x < t0 - 4, 'ArrowLeft pushes the aim left (' + t0.toFixed(1) + ' → ' + s.target.x.toFixed(1) + ')'); const tk = s.target.x; await adv(.2); expect(Math.abs((await st()).target.x - tk) < .01, 'aim holds when the key is released');

    // 4. a real touch drag steers relatively (the finger never has to cover the probe)
    s = await st(); t0 = s.target; await touch('touchStart', 100, 400); await touch('touchMove', 160, 360); await touch('touchMove', 220, 320); await wait(60); s = await st();
    expect(s.target.x > t0.x + 5 && s.target.y > t0.y + 3, 'dragging right/up moves the aim right/up by the drag distance'); await adv(.9);
    const sh = (await st()).ship; expect(Math.abs(sh.x - s.target.x) < 1.2 && Math.abs(sh.y - s.target.y) < 1.2, 'the probe eases onto the aim'); await touch('touchEnd');

    // 5. flying wide of a ring: miss, combo reset, charge penalty
    s = await thread(q => q.combo >= 3 && q.ship.z - q.next.z > 20, 200, 'a combo to lose'); const n0 = s.nextIndex, m0 = s.missed;
    for (let i = 0; i < 80 && (s = await st()).nextIndex === n0; i++) { await aim(s.next.x > 0 ? s.next.x - 8 : s.next.x + 8, s.next.y); await adv(.05); }
    expect(s.nextIndex === n0 + 1 && s.missed === m0 + 1 && s.combo === 0 && s.mult === 1, 'missed ring: combo and multiplier reset');

    // 6. the planet set-piece: dive through the orange band for a slingshot
    s = await thread(q => !!q.next.planet, 400, 'the planet ring'); expect(s.nextIndex === 10 && s.slings === 0, 'planet waits beside ring 11');
    const pl = s.next.planet, a = Math.atan2(s.next.y - pl.y, s.next.x - pl.x), d = (pl.lane[0] + pl.lane[1]) / 2, sc0 = s.score;
    for (let i = 0; i < 120 && (s = await st()).nextIndex === 10; i++) { await aim(pl.x + Math.cos(a) * d, pl.y + Math.sin(a) * d); await adv(.05); }
    expect(s.slings === 1 && s.surge > 5 && s.score >= sc0 + 500 && s.hits === 0, 'SLINGSHOT: surge ' + s.surge.toFixed(0) + ', +' + (s.score - sc0)); const vS = s.speed; await adv(.4); expect((await st()).speed > vS + 3, 'the surge throws the probe forward');

    // 7. rocks: steering into one costs charge and breaks the combo
    let hit = false;
    for (let i = 0; i < 600 && !hit; i++) { s = await st(); if (s.mode !== 'play') break; const r = s.rocks.filter(k => k.z > s.next.z - 1).sort((p, q) => q.z - p.z)[0]; if (r) await aim(r.x, r.y); else await aim(s.next.x, s.next.y); const e0 = s.energy; await adv(.05); const q = await st(); if (q.hits > s.hits) { hit = true; expect(q.energy < e0 - 20 && q.combo === 0, 'rock hit: charge ' + e0.toFixed(0) + ' → ' + q.energy.toFixed(0) + ', combo gone'); } }
    expect(hit, 'a rock could be hit'); s = await thread(q => q.energy > 60, 400, 'recovery through rings'); expect(s.mode === 'play', 'threading rings recharges after the hit');

    // 8. pause freezes the clock (real time)
    await page.evaluate(() => window.__gdl.manual(false)); await page.keyboard.press('KeyP'); await wait(100); s = await st(); expect(s.paused, 'P pauses');
    t0 = s.t; await wait(400); expect((await st()).t === t0, 'nothing moves while paused'); await page.locator('#bResume').tap(); await wait(100); expect(!(await st()).paused, 'RESUME continues');
    await page.evaluate(() => window.__gdl.manual(true));

    // 9. flying wide of everything: the charge runs out → game over, best stored
    await page.mouse.move(316, 564); const before = (await st()).score;
    for (let i = 0; i < 80 && (s = await st()).mode === 'play'; i++) await adv(.5);
    expect(s.mode === 'over' && s.energy === 0 && s.score >= before && s.best === s.score && s.score > 1500, 'charge depleted: over with ' + s.score + ' as the new best');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/orbit-drift-3d'))) === s.score, 'best persisted for the arcade');
    expect(await page.locator('#over.show').count() === 1 && (await page.locator('#oScore').textContent()) === String(s.score), 'game-over card shows the score'); const final = s.score;

    // 10. clean restart
    await wait(300); await page.locator('#bAgain').tap(); await wait(150); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.energy === 100 && s.combo === 0 && s.rings === 0 && s.missed === 0 && s.slings === 0 && s.hits === 0 && s.nextIndex === 0 && s.sector === 0 && s.best === final, 'FLY AGAIN: fresh run, best kept');
    expect(await page.locator('#over.show').count() === 0, 'card dismissed');
  },
};
