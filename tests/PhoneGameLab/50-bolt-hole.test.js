// Bolt Hole: lifting a screw and parking it costs a turn, plates drop when unpinned, the solver's solution wins the
// level, undo/drag/keyboard work, wasting the turn budget loses, progress persists, later levels are solvable at par.
module.exports = {
  game: 'PhoneGameLab/games/50-bolt-hole/index.html',
  async run({ page, expect, wait, state, game }) {
    const tap = async p => { const [x, y] = await game((g, p) => g.xy(p), p); await page.touchscreen.tap(x, y); await wait(70); };
    const solveAll = async () => { for (let i = 0; i < 40 && !(await game(g => g.done)); i++) { const [p, q] = (await game(g => g.solution))[0]; await tap(p); if (!(await game(g => g.done))) await tap(q); } };
    expect((await state()).running, 'running after autostart');
    expect(await game(g => g.level === 1 && g.moves === 0 && g.plates === 1 && g.par === 2), 'level 1 is a one-plate, two-turn tutorial');
    // tap-tap move
    let [p, q] = (await game(g => g.solution))[0];
    await tap(p); expect(await game(g => g.held) === p, 'tapping a screw lifts it');
    expect((await game(g => g.targets())).includes(q), 'solver target is a legal parking hole');
    await tap(q); expect(await game((g, q) => g.moves === 1 && g.held === -1 && g.screws.includes(q), q), 'parking the screw costs one turn');
    // undo (button, then key)
    const ub = await game(g => g.button('undo')); await page.touchscreen.tap(ub[0], ub[1]); await wait(80);
    expect(await game((g, p) => g.moves === 0 && g.screws.includes(p) && g.undoDepth === 0, p), 'undo restores the screw and refunds the turn');
    // drag move with the mouse
    const a = await game((g, p) => g.xy(p), p), b = await game((g, q) => g.xy(q), q);
    await page.mouse.move(a[0], a[1]); await page.mouse.down(); await page.mouse.move((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, { steps: 4 }); await page.mouse.move(b[0], b[1], { steps: 4 }); await page.mouse.up(); await wait(80);
    expect(await game((g, q) => g.moves === 1 && g.screws.includes(q), q), 'dragging a screw to a hole parks it');
    await page.keyboard.press('z'); await wait(60); expect(await game(g => g.moves) === 0, 'Z undoes');
    // win level 1 by following the solver
    await solveAll(); await wait(1500);
    let s = await state(); expect(s.over && s.best === 1, 'clearing every plate wins and records level 1');
    expect(await page.evaluate(() => !!document.querySelector('.lab-win')), 'win card shown');
    expect(await game(g => g.plates === 0 && g.moves === g.par && g.stars === 3), 'optimal clear = par = 3 stars');
    await wait(500); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over, 'next level starts');
    expect(await game(g => g.level === 2 && g.moves === 0 && g.plates === 2), 'level 2 loaded clean');
    // lose: shuttle one harmless screw back and forth until the budget is gone
    const scr = await game(g => g.screws); let pick = -1, spot = -1;
    for (const c of scr) { await tap(c); if (await game(g => g.plates) === 2 && (await game(g => g.targets())).length) { pick = c; spot = (await game(g => g.targets()))[0]; await tap(c); break; } await page.keyboard.press('z'); await wait(60); }
    expect(pick >= 0 && await game(g => g.moves === 0 && g.held === -1), 'found a screw that can move without freeing a plate (and putting it back is free)');
    const budget = await game(g => g.budget);
    for (let i = 0; i < budget && !(await game(g => g.done)); i++) { await tap(i % 2 ? spot : pick); await tap(i % 2 ? pick : spot); }
    await wait(2000); s = await state(); expect(s.over, 'running out of turns ends the level');
    expect(await page.evaluate(() => !document.querySelector('.lab-win')) && await game(g => g.plates) > 0, 'that is a loss, not a win');
    await page.keyboard.press('Enter'); await wait(500);
    expect(await game(g => g.level === 2 && g.moves === 0 && g.plates === 2 && !g.done), 'retry reloads the same level cleanly');
    // persistence across reload
    await page.reload({ waitUntil: 'load' }); await wait(500);
    expect(await game(g => g.level) === 2, 'progress persists');
    // later levels: keyed sockets, bigger board, solver-verified par
    await game(g => g.setLevel(8)); await wait(400);
    expect(await game(g => g.kinds === 2 && g.grid[1] === 5 && g.solution.length === g.par), 'level 8 has two screw kinds and a par-length solution');
    await solveAll(); await wait(1500); s = await state();
    expect(s.over && s.best === 8 && await game(g => g.moves === g.par), 'level 8 solved at par through real taps');
    for (const lv of [12, 17, 23]) { const r = await game((g, lv) => g.parOf(lv), lv); expect(r[0] === r[2] && r[0] >= 9, 'level ' + lv + ' is solvable and fast-solver par is optimal: ' + r); }
  },
};
