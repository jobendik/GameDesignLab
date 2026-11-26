// Inkstride: keys and pad touches switch ink instantly, matching a gate scores and builds combo, a last-moment switch
// is a PERFECT worth double, tempo and multiplier ramp with clean play, wrong ink costs hearts and ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/32-inkstride/index.html', timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.hearts === 3 && g.passed === 0 && g.gates.length > 0), 'three hearts, gates approaching');
    const v0 = await game(g => g.speed), KEYS = ['ArrowLeft', 'ArrowDown', 'ArrowRight'];
    const next = () => game(g => g.gates[0]), waitPassed = async n => { for (let i = 0; i < 200 && (await game(g => g.passed)) < n && !(await state()).over; i++) await wait(25); };
    // 1) keyboard: become the first gate's ink, pass it
    let g1 = await next(); expect(!g1.cols.includes(await game(g => g.color)), 'the first gate needs a switch');
    await page.keyboard.press(KEYS[g1.cols[0]]);
    expect(await game(g => g.color) === g1.cols[0], 'a key switches ink at once'); await waitPassed(1);
    expect(await game(g => g.passed === 1 && g.score === 10 && g.combo === 1 && g.hearts === 3), 'matching the gate scores 10 and starts a combo');
    // 2) touch: tap the pad of the next gate's ink
    let g2 = await next(); const xy = await game((g, i) => g.padXY(i), g2.cols[0]); await page.touchscreen.tap(xy[0], xy[1]);
    expect(await game(g => g.color) === g2.cols[0], 'tapping a pad switches ink'); await waitPassed(2);
    expect(await game(g => g.passed === 2 && g.score === 20), 'second gate passed');
    // 3) PERFECT: switch only when the gate is almost on the blob
    await page.evaluate(() => { window.__auto = 0.09; (function tick() { requestAnimationFrame(tick); const g = __lab.game; if (!g || !window.__auto) return; const n = g.gates[0]; if (n && n.eta < window.__auto && !n.cols.includes(g.color)) g.select(n.cols[0]); })(); });
    await waitPassed(4);
    const pf = await game(g => ({ p: g.perfects, s: g.score })); expect(pf.p >= 1, 'a last-moment switch counts as PERFECT'); expect(pf.s >= 20 + 20 + 10, 'PERFECT pays double (' + pf.s + ')');
    // 4) keep matching (early switches): combo multiplier and tempo climb
    await page.evaluate(() => { window.__auto = 0.5; });
    for (let i = 0; i < 400 && (await game(g => g.passed)) < 20; i++) await wait(100);
    const mid = await game(g => ({ c: g.combo, m: g.mult, t: g.tier, v: g.speed, s: g.score, h: g.hearts }));
    expect(mid.c >= 20 && mid.m >= 3, 'clean play builds the combo multiplier'); expect(mid.t >= 2 && mid.v > v0 + 40, 'tempo ramps up'); expect(mid.h === 3, 'no hearts lost while matching');
    expect((await state()).score === (await game(g => g.score)), 'HUD score matches');
    // 5) wrong ink: every gate is deliberately missed
    await page.evaluate(() => { window.__auto = 0; });
    const pickWrong = () => game(g => { const n = g.gates[0]; if (n && n.cols.includes(g.color)) g.select([0, 1, 2].find(i => !n.cols.includes(i))); });
    const p0 = await game(g => g.passed); await pickWrong();
    for (let i = 0; i < 200 && (await game(g => g.hearts)) === 3; i++) { await pickWrong(); await wait(25); }
    expect(await game(g => g.hearts === 2 && g.combo === 0), 'the wrong ink costs a heart and the combo');
    expect((await game(g => g.passed)) === p0, 'a missed gate does not count');
    for (let i = 0; i < 600 && !(await state()).over; i++) { await pickWrong(); await wait(25); }
    const s = await state(); expect(s.over, 'three misses end the run'); expect(s.best === s.score && s.best >= mid.s, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.passed === 0 && g.combo === 0 && g.tier === 1 && g.perfects === 0 && Math.abs(g.speed - 300) < 5), 'hearts, combo, tempo reset');
  },
};
