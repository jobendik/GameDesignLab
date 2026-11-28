// Bumpy Bus: holding the screen drives and letting go brakes; stopping on a bus stop picks a pal up onto the roof
// (score, HUD); driving past a stop misses it; a rider in the air lands back on the rack if you keep driving but
// flies off the front if you brake; a fast run over bumps throws riders off the rack's surface (landing impacts);
// stopping at the campsite delivers everyone, adds daylight and starts stage 2; sundown ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/bumpy-bus/index.html',
  timeout: 70000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await game(fn)) return true; await wait(30); } return false; };
    // drive (exposed throttle, same code path as holding) until the predicted braking point reaches x, then let go
    const stopAt = (x) => page.evaluate(x => new Promise(res => { const g = __lab.game, t0 = performance.now(); g.gas(true); (function f() { const b = g.bus; if (b.x + b.vx * b.vx / (2 * 620) + b.vx * .02 >= x && !b.air) g.gas(false); if (!g.gasOn && b.vx < 1 && !b.air) return res(b.x); if (performance.now() - t0 > 15000) return res(null); requestAnimationFrame(f); })(); }), x);
    expect((await state()).running, 'running after autostart');
    let s = await game(g => ({ r: g.riders(), day: g.day, st: g.stage }));
    expect(s.r.length === 1 && s.r[0].id === 'bun' && s.st === 1 && s.day > 50, 'stage 1: Bun on the roof, ~55 s of daylight');
    // 1) real input: holding the mouse drives, letting go brakes to a stop
    const x0 = await game(g => g.bus.x);
    await page.mouse.move(200, 400); await page.mouse.down(); await wait(900);
    s = await game(g => g.bus); expect(s.vx > 150 && s.x > x0 + 80, `holding drives (${JSON.stringify(s)})`);
    await page.mouse.up(); expect(await until(g => g.bus.vx === 0, 3000), 'letting go brakes to a stop');
    // 2) stop on the first bus stop: pick-up
    const stop1 = await game(g => g.stops().find(s => s.st === 'wait'));
    await game((g, x) => g.place(x, 0), stop1.x - 500);
    const at = await stopAt(stop1.x);
    s = await page.evaluate(() => ({ r: __lab.game.riders().length, score: __lab.game.score, hud: __lab.state.score, st: __lab.game.stops()[0] }));
    const st1 = await game((g, x) => g.stops().find(s => Math.abs(s.x - x) < 1), stop1.x);
    expect(Math.abs(at - stop1.x) < 46 && st1.st === 'picked' && s.r === 2 && s.score >= 50 && s.hud === s.score, `stopped on the sign (${at} vs ${stop1.x}): pal aboard, scored`);
    // 3) a rider in the air while you keep driving lands back on the rack
    await game(g => { g.place(g.bus.x + 40, 430); g.gas(true); g.launch(1, -300); });
    expect(await until(g => g.riders()[1] && g.riders()[1].st === 'seat', 3000) && (await game(g => g.lostN)) === 0, 'kept driving: the rider lands back on the rack');
    // 4) ... but braking under them throws them off the front
    await game(g => { g.place(g.bus.x, 400); g.launch(1, -450); g.gas(false); });
    expect(await until(g => g.lostN === 1, 3000), 'braking while a rider flies: they bounce off');
    expect(await until(g => g.riders().length === 1 && g.riders()[0].id === 'bun', 3000), 'only Bun is left aboard');
    // 5) the second stop: drive straight past it -> missed
    const stop2 = await game(g => g.stops().find(s => s.st === 'wait'));
    await game((g, x) => { g.place(x - 300, 400); g.gas(true); }, stop2.x);
    expect(await until((g) => g.stops().some(s => s.st === 'missed'), 4000), 'driving past a stop misses it');
    // 6) campsite: stop there -> delivered, daylight up, stage 2
    const camp = await game(g => g.stations().find(s => !s.done)); const d0 = await game(g => g.day); const sc0 = await game(g => g.score);
    await game((g, x) => { g.gas(false); g.place(x - 600, 0); }, camp.x);
    await stopAt(camp.x);
    expect(await until(g => g.stage === 2, 3000), 'stopping at the campsite starts stage 2');
    s = await game(g => ({ del: g.delivered, day: g.day, score: g.score, r: g.riders().length }));
    expect(s.del === 1 && s.r === 0 && s.day > d0 + 20 && s.score > sc0 + 90, `delivered Bun, daylight added (${JSON.stringify(s)})`);
    // 7) bumps at full speed throw riders up off the rack (genuine landing impacts)
    const stop3 = await game(g => g.stops().find(s => s.st === 'wait'));
    await game((g, x) => g.place(x - 500, 0), stop3.x); await stopAt(stop3.x);
    expect(await game(g => g.riders().length === 1), 'picked up a stage-2 rider');
    const thrown = await page.evaluate(() => new Promise(res => { const g = __lab.game, t0 = performance.now(); g.gas(true); (function f() { if (g.riders().some(r => r.st !== 'seat') || g.lostN > 1) return res(true); if (performance.now() - t0 > 12000) return res(false); requestAnimationFrame(f); })(); }));
    expect(thrown, 'flat-out driving over the bumps throws a rider into the air');
    // 8) sundown
    await game(g => { g.gas(false); g.setDay(.3); });
    expect(await until(g => __lab.state.over, 3000), 'sundown ends the run');
    s = await state(); expect(s.best >= s.score && s.score > 0, 'best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(400);
    s = await page.evaluate(() => ({ st: __lab.state, g: { score: __lab.game.score, stage: __lab.game.stage, r: __lab.game.riders(), lost: __lab.game.lostN, del: __lab.game.delivered, day: __lab.game.day, x: __lab.game.bus.x } }));
    expect(s.st.running && !s.st.over && s.g.score === 0 && s.g.stage === 1 && s.g.r.length === 1 && s.g.lost === 0 && s.g.del === 0 && s.g.day > 50 && s.g.x < 200, 'restart is clean');
  },
};
