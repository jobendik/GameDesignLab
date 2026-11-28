// Flutterbun: Bun hovers until the first tap; a real tap on the left half flaps up-left, the right half up-right, both
// halves together a straight strong boost; flapping (via the game's flap, steered at the next gap from live state)
// threads leaf shelves for 10 each, "Clean!" middle passes add 5 and build a streak; a carrot pays 5; a dandelion puff
// saves one bonk; bonking a shelf ends the run, as does fluttering down off the screen; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/flutterbun/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'running after autostart');
    let b0 = await game(g => g.bun); await wait(500);
    expect(!(await game(g => g.started)) && Math.abs((await game(g => g.bun)).y - b0.y) < 10, 'Bun hovers until the first tap');
    // 1) real taps: left half → up-left, right half → up-right
    await page.touchscreen.tap(60, 600); await wait(40);
    let b = await game(g => ({ ...g.bun, kind: g.lastFlap })); expect(b.kind === 'left' && b.vx < -60 && b.vy < -200, 'a left tap flaps up-left');
    await wait(250); await page.touchscreen.tap(330, 600); await wait(40);
    b = await game(g => ({ ...g.bun, kind: g.lastFlap })); expect(b.kind === 'right' && b.vx > 30 && b.vy < -200, 'a right tap flaps up-right');
    await wait(250); await page.touchscreen.tap(60, 600); await page.touchscreen.tap(330, 600); await wait(30);
    b = await game(g => ({ ...g.bun, kind: g.lastFlap })); expect(b.kind === 'both' && b.vy < -380 && Math.abs(b.vx) < 60, `both halves together give a straight strong boost (${Math.round(b.vx)}, ${Math.round(b.vy)})`);
    // 2) steer through gaps (decisions from live state, every flap through the game's own flap)
    const fly = (ms, until) => page.evaluate(([ms, until]) => new Promise(res => { const g = __lab.game, t0 = performance.now(); let last = 0; (function f() { const s = g.next(), b = g.bun, now = performance.now();
      if (b.dead || g.passed >= until || now - t0 > ms) return res({ passed: g.passed, dead: b.dead });
      if (s && now - last > 110 && b.vy > -60 && (b.y - s.y > 70 || Math.abs(b.x - s.gx) < s.gw * .25)) { last = now; g.flap(Math.abs(b.x - s.gx) < 18 ? 0 : Math.sign(s.gx - b.x)); }
      requestAnimationFrame(f); })(); }), [ms, until]);
    await game(g => g.clearHazards());
    let r = await fly(15000, 4);
    let s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, passed: __lab.game.passed, cleanN: __lab.game.cleanN, carrots: __lab.game.carrots }));
    expect(!r.dead && s.passed >= 4, `threading gaps passes shelves (${s.passed})`);
    expect(s.score === s.passed * 10 + s.cleanN * 5 + s.carrots * 5 && s.hud === s.score, `10 per shelf, +5 per clean pass and carrot (${s.score} = ${s.passed}/${s.cleanN}/${s.carrots})`);
    expect(s.cleanN >= 1, 'steering through the middle earns clean passes');
    // 3) a dandelion puff saves one bonk
    await game(g => { g.shield = true; });
    const n0 = await game(g => g.next());
    await page.evaluate(() => new Promise(res => { const g = __lab.game, t0 = performance.now(); let last = 0; (function f() { const s = g.next(), b = g.bun, now = performance.now();
      if (!g.shield || b.dead || now - t0 > 6000) return res(); if (now - last > 120 && b.vy > -60) { last = now; const wall = s.gx > 195 ? s.gx - s.gw / 2 - 40 : s.gx + s.gw / 2 + 40; g.flap(Math.abs(b.x - wall) < 20 ? 0 : Math.sign(wall - b.x)); } requestAnimationFrame(f); })(); }));
    s = await game(g => ({ shield: g.shield, dead: g.bun.dead })); expect(!s.shield && !s.dead, 'the puff pops and Bun survives the bonk');
    expect(!(await state()).over, 'the run goes on');
    // 4) a bonk without a puff ends the run
    const final = await game(g => g.score);
    await page.evaluate(() => new Promise(res => { const g = __lab.game, t0 = performance.now(); let last = 0; (function f() { const s = g.next(), b = g.bun, now = performance.now();
      if (b.dead || now - t0 > 8000) return res(); if (now - last > 120 && b.vy > -60) { last = now; const wall = s.gx > 195 ? s.gx - s.gw / 2 - 40 : s.gx + s.gw / 2 + 40; g.flap(Math.abs(b.x - wall) < 20 ? 0 : Math.sign(wall - b.x)); } requestAnimationFrame(f); })(); }));
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(100);
    s = await state(); expect(s.over && s.best >= final && s.best > 0, 'bonking a leaf ends the run and records the best');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => !g.started && g.passed === 0 && g.carrots === 0 && !g.shield && Math.abs(g.bun.y) < 10), 'Bun is back on the flowerpot');
    // 5) not flapping at all: Bun flutters down off the screen
    await page.keyboard.press('ArrowUp');
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    expect((await state()).over && await game(g => g.bun.y > 0), 'without flaps Bun falls and the run ends');
  },
};
