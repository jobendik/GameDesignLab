// Sundown Sprint: hold = throttle, drag/keys = analog steering, overtakes and close passes score and buy time,
// checkpoints advance the stage and add time, crashes spin you out (no death), the clock ends the run, restart is clean.
const PILOT = `(ms, mode) => new Promise(res => {
  const g = window.__lab.game, t0 = performance.now();
  (function tick() {
    if (performance.now() - t0 > ms || !g.alive) return res();
    const tr = g.traffic().filter(c => c.ahead > -(c.l + 90) && c.ahead < 700), PW = .56;
    const hits = (c, x) => Math.abs(c.x - x) < (c.w + PW) / 2 + .1 || (c.chg >= 0 && Math.abs(c.chg + .5 - x) < (c.w + PW) / 2 + .1);
    const clear = x => { let m = 9999; for (const c of tr) if (hits(c, x)) m = Math.min(m, c.ahead); return m; };
    if (mode === 'crash') { const c = tr.find(c => c.ahead > 0); if (c) g.steerTo(c.x); }
    else {
      let best = g.x, bs = -1e9;
      for (let x = .4; x <= 3.61; x += .2) { const s = Math.min(clear(x), 600) - Math.abs(x - g.x) * 40; if (s > bs) { bs = s; best = x; } }
      if (mode === 'close') { // hug the flank of the next car on whichever side is open
        const c = tr.find(c => c.ahead > -40 && c.ahead < 420 && c.chg < 0);
        if (c) { const off = (c.w + PW) / 2 + .075, opts = [c.x - off, c.x + off].filter(x => x > .3 && x < 3.7 && !tr.some(o => o !== c && o.ahead < 500 && hits(o, x)));
          if (opts.length) best = opts.sort((a, b) => Math.abs(a - g.x) - Math.abs(b - g.x))[0]; }
      }
      g.steerTo(best);
    }
    requestAnimationFrame(tick);
  })();
})`;
module.exports = {
  game: 'PhoneGameLab/games/22-sundown-sprint/index.html',
  async run({ page, expect, wait, state, game }) {
    const pilot = (ms, mode) => page.evaluate(`(${PILOT})(${ms}, '${mode}')`);
    expect((await state()).running, 'game running after autostart');
    const v0 = await game(g => g.speed), x0 = await game(g => g.x);
    expect(await game(g => g.time) > 20, 'clock starts with a generous allowance');
    // --- real input: hold = throttle, drag = steer (relative), lift = brake, arrow keys steer
    await page.mouse.move(195, 620); await page.mouse.down(); await wait(900);
    const v1 = await game(g => g.speed);
    expect(await game(g => g.throttle) && v1 > v0 + 150, 'holding accelerates (' + v0.toFixed(0) + ' → ' + v1.toFixed(0) + ')');
    await page.mouse.move(255, 620, { steps: 5 }); await wait(250);
    const x1 = await game(g => g.x); expect(x1 > x0 + .6, 'dragging right steers right (' + x1.toFixed(2) + ')');
    await page.mouse.up(); await wait(700);
    expect(await game(g => g.speed) < v1 + 60 && !(await game(g => g.throttle)), 'lifting stops accelerating');
    await page.keyboard.down('ArrowLeft'); await wait(350); await page.keyboard.up('ArrowLeft'); await wait(150);
    expect(await game(g => g.x) < x1 - .5, 'ArrowLeft steers left');
    // --- drive: overtakes + close passes score and add time
    await page.mouse.move(195, 620); await page.mouse.down();
    const tBefore = await game(g => g.time);
    await pilot(9000, 'close');
    const d1 = await game(g => ({ score: g.score, dist: g.dist, pass: g.passN, close: g.closeN, time: g.time, crashes: g.crashes }));
    expect(d1.pass >= 3, 'cars get overtaken (' + JSON.stringify(d1) + ')');
    expect(d1.close >= 1, 'skimming a flank at speed counts as a close pass');
    expect(d1.score > d1.dist / 20 + 20, 'overtakes add bonus points on top of distance');
    expect(d1.time > tBefore - 9.6 + d1.close * .39 - .3, 'close passes buy time');
    expect(Math.abs((await state()).score - Math.floor(await game(g => g.score))) <= 30, 'HUD follows the score');
    // --- checkpoint: stage advances and the clock jumps
    let last = d1.time, jumped = false;
    for (let i = 0; i < 40 && (await game(g => g.stage)) < 1; i++) { await pilot(500, 'safe'); const t = await game(g => g.time); if (t > last + 5) jumped = true; last = t; }
    expect(await game(g => g.stage) >= 1, 'reaching the checkpoint starts stage 2');
    expect(jumped || (await game(g => g.time)) > last, 'checkpoint adds time');
    // --- crash: spin out, lose speed, keep going
    const c0 = await game(g => g.crashes);
    for (let i = 0; i < 30 && (await game(g => g.crashes)) === c0; i++) await pilot(400, 'crash');
    expect(await game(g => g.crashes) > c0, 'steering into traffic causes a crash');
    expect(await game(g => g.alive) && await game(g => g.combo) === 0 && await game(g => g.inv) > 0, 'a crash spins you out but does not end the run');
    // --- the clock is the only way to lose
    await page.mouse.up();
    await game(g => { g.time = 1.2; });
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(250);
    const s = await state(); expect(s.over, 'running out of time ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score < 30, 'restart gives a clean run');
    const g0 = await game(g => ({ stage: g.stage, close: g.closeN, pass: g.passN, crashes: g.crashes, time: g.time, n: g.traffic().length, dist: g.dist }));
    expect(g0.stage === 0 && g0.close === 0 && g0.pass === 0 && g0.crashes === 0 && g0.time > 22 && g0.n <= 1 && g0.dist < 400, 'state fully reset (' + JSON.stringify(g0) + ')');
  },
};
