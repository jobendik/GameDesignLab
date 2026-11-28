// Clatter Castle: pieces dragged from the toy box with the mouse drop onto what is below; an overhang without a
// counterweight clatters into the river while a counterweighted one holds; Olli perches on a tall enough build (job
// done, score); Pip runs a plank bridge for real and a missing bridge drops him in the river (heart lost); a block
// dropped on Bun is a "Bonk!" (piece lost); a roof on two pillars keeps Bun dry in the rain; three failed jobs end the
// run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/clatter-castle/index.html',
  timeout: 80000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    for (let i = 0; i < 20 && (await game(g => g.phase)) !== 'build'; i++) await wait(100);
    async function drop(t, x) {
      const s = await game((g, t) => g.slot(t), t), px = await game((g, a) => g.px(a[0], a[1]), [t, x]), py = await game(g => g.py(5));
      await page.mouse.move(s[0], s[1]); await page.mouse.down(); await page.mouse.move(px, py, { steps: 8 }); await page.mouse.up();
      for (let i = 0; i < 30 && !(await game(g => g.settled)); i++) await wait(60); await wait(450);
    }
    const press = async t => { const s = await game((g, t) => g.slot(t), t); await page.mouse.click(s[0], s[1]); };
    const waitPhase = async (ph, n) => { for (let i = 0; i < (n || 80) && (await game(g => g.phase)) !== ph; i++) await wait(100); return game(g => g.phase); };
    // 1. statics: an overhang past the bank falls in; pulled back it holds; a heavy brick on the far end tips it
    await game(g => g.setJob('perch', { tray: { plank: 2, brick: 1 }, star: [7, 6], river: [3, 8] }));
    await drop('plank', 1.5);
    let s = await game(g => ({ n: g.pieces.length, lost: g.lost, tray: g.tray }));
    expect(s.n === 0 && s.lost === 1 && s.tray.plank === 1, 'a plank hanging mostly over the river clatters in (' + JSON.stringify(s) + ')');
    await drop('plank', .5);
    s = await game(g => ({ p: g.pieces, lost: g.lost }));
    expect(s.p.length === 1 && s.p[0].y === 0 && s.lost === 1, 'a plank with its middle over the bank holds');
    await drop('brick', 2.5);
    s = await game(g => ({ n: g.pieces.length, lost: g.lost }));
    expect(s.n === 0 && s.lost === 3, 'a brick on the overhanging end tips the plank and both fall');
    // 2. perch: Olli flies onto a tall enough build
    await game(g => g.setJob('perch', { tray: { pillar: 1, block: 2 }, star: [4, 2.5] }));
    await drop('pillar', 3.5); await drop('block', 3.5);
    s = await game(g => ({ p: g.pieces, score: g.score, job: g.job }));
    expect(s.p.length === 2 && s.p[1].y === 2, 'the block lands on top of the pillar');
    await press('test'); expect(await waitPhase('result') === 'result', 'test runs');
    let v = await game(g => ({ v: g.verdict, score: g.score, pal: g.pal }));
    expect(v.v.ok && v.score > s.score && Math.abs(v.pal.x - 4) < .6 && v.pal.y >= 3 - .01, 'Olli perched on the build: job done (' + JSON.stringify(v) + ')');
    expect((await state()).score === v.score, 'HUD shows the score');
    expect(await waitPhase('build') === 'build' && (await game(g => g.job)) === s.job + 1, 'next job arrives');
    // 3. bridge: a plank across the river, Pip runs it
    await game(g => g.setJob('bridge', { tray: { plank: 1, block: 1 }, river: [2.5, 5.5] }));
    await drop('plank', 2);
    const sc = await game(g => g.score);
    await press('test'); await waitPhase('result', 60);
    v = await game(g => ({ v: g.verdict, score: g.score, hearts: g.hearts, pal: g.pal }));
    expect(v.v.ok && v.score > sc && v.hearts === 3 && v.pal.x > 8, 'Pip ran across the plank bridge');
    // 4. no bridge: Pip falls in, a heart is lost
    await waitPhase('build');
    await game(g => g.setJob('bridge', { tray: { block: 1 }, river: [2.5, 5.5] }));
    await press('test'); await waitPhase('result', 60);
    v = await game(g => ({ v: g.verdict, hearts: g.hearts, pal: g.pal }));
    expect(!v.v.ok && v.hearts === 2 && v.pal.y < 0, 'with no bridge Pip ends up in the river and a heart is lost');
    // 5. shelter: bonk, then a roof on two pillars keeps Bun dry
    await waitPhase('build');
    await game(g => g.setJob('shelter', { tray: { block: 1, pillar: 2, plank: 1 }, sit: [{ who: 'bun', x: 4 }] }));
    await drop('block', 3.5);
    s = await game(g => ({ n: g.pieces.length, lost: g.lost })); expect(s.n === 0 && s.lost === 1, 'a block dropped on Bun bonks off and is lost');
    await drop('pillar', 2.5); await drop('pillar', 4.5); await drop('plank', 2.5);
    s = await game(g => g.pieces); expect(s.length === 3 && s[2].y === 2, 'plank roof rests on both pillars');
    await press('test'); await waitPhase('result', 60);
    v = await game(g => ({ v: g.verdict, hearts: g.hearts })); expect(v.v.ok && v.hearts === 2, 'Bun stayed dry: job done');
    // 6. two more failed jobs end the run
    for (let k = 0; k < 2; k++) { await waitPhase('build'); await game(g => g.setJob('bridge', { tray: { block: 1 }, river: [2.5, 5.5] })); await press('test'); await waitPhase('result', 60); }
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const o = await state(); expect(o.over, 'third failed job ends the run'); expect(o.best >= o.score && o.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(600);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.job === 0 && g.lost === 0 && g.pieces.length === 0 && g.kind === 'perch'), 'hearts, job and build reset');
    await waitPhase('build'); const t0 = await game(g => g.tray); const first = Object.keys(t0).find(k => t0[k] > 0);
    await drop(first, 3); expect((await game(g => g.pieces.length)) === 1, 'a fresh piece drops onto the new meadow');
  },
};
