// Stew Patch: pulling a patch scores and costs a day, bare plots regrow as their neighbours (8-way vote, bigger patch wins
// ties, two plots deep, wild in the middle), an order is filled by one pull that is big enough (+3 days), golden veg
// doubles, molehills are flattened by a 4+ pull next door, real touch / hold-to-peek / keyboard input work, the fifth
// crop unlocks after three orders, running out of days ends the run, restart is clean.
const A = [[2, 2, 0, 0, 2, 2], [2, 2, 2, 2, 2, 2], [3, 3, 3, 3, 3, 3], [1, 1, 1, 1, 1, 1], [3, 3, 3, 3, 3, 3], [1, 1, 1, 1, 1, 1], [3, 3, 3, 3, 3, 3]];
module.exports = {
  game: 'PhoneGameLab2/games/stew-patch/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const f = await game(g => ({ days: g.days, o: g.orders(), full: g.grid().flat().every(k => k >= 0 && k <= 3), n: g.grid().flat().length }));
    expect(f.days === 6 && f.n === 42 && f.full, 'fresh patch: 42 plots of four crops, six days');
    expect(f.o[0].need === 4 && f.o[1].need === 5 && f.o[0].k !== f.o[1].k, 'two different orders, 4+ and 5+');
    // weeding: the two carrots between the cabbages regrow as cabbage and join the field
    let r = await game((g, A) => { g.set(A, { days: 5, orders: [[2, 12], [0, 9]] }); const p = g.plan(0, 2), ok = g.harvest(0, 2); return { p, ok, grid: g.grid(), size: g.size(0, 0), score: g.score, days: g.days, served: g.served }; }, A);
    expect(r.p['0,2'] === 2 && r.p['0,3'] === 2, 'peek: carrots between cabbages will regrow as cabbage');
    expect(r.ok && r.grid[0][2] === 2 && r.grid[0][3] === 2 && r.size === 12, 'pulled plots regrew as the neighbouring crop: one field of 12');
    expect(r.score === 3 && r.days === 4 && r.served === 0, 'a pull of 2 scores 3 and costs a day');
    await wait(150); expect((await state()).score === 3, 'HUD shows the score');
    // one pull big enough fills the order
    r = await game(g => { g.harvest(0, 0); return { grid: g.grid(), score: g.score, days: g.days, served: g.served, o: g.orders() }; });
    expect(r.served === 1 && r.days === 6, 'a pull of 12 cabbages fills the 12+ order: +3 days');
    expect(r.score === 3 + 78 + 120, 'pull value 78 plus order bonus 120');
    expect(r.grid[0].concat(r.grid[1]).every(k => k === 3), 'corn crept two rows deep into the bare soil');
    expect(r.o[0] === null && r.o[1].k === 0, 'the filled order leaves, the other stays');
    await wait(1100); expect((await game(g => g.orders()))[0].need === 6, 'the next customer wants more (6+)');
    // tie → the bigger patch wins;  deep middle → wild
    r = await game(g => { const rows = Array.from({ length: 7 }, (_, i) => [1, 1, i === 3 ? 0 : 2, 3, 3, 3]); g.set(rows, { orders: [[4, 30], [4, 30]] }); return g.plan(3, 2); });
    expect(r['3,2'] === 3, 'three corn vs three beet neighbours: the bigger field takes the plot');
    r = await game(g => { const rows = Array.from({ length: 7 }, (_, i) => Array(6).fill(i === 6 ? 1 : 0)); g.set(rows, { days: 9, orders: [[2, 30], [3, 30]] }); const p = g.plan(0, 0), s0 = g.score; g.harvest(2, 2); return { p, gain: g.score - s0, grid: g.grid() }; });
    expect(r.p['5,0'] === 1 && r.p['4,3'] === 1 && r.p['3,3'] === -2 && r.p['0,0'] === -2, 'neighbours creep two plots deep; the middle is re-sown wild');
    expect(r.gain === 36 * 37 / 2 + 50, 'a 36-plot bumper crop scores 666 + 50');
    expect(r.grid.flat().every(k => k >= 0) && r.grid[5].every(k => k === 1) && r.grid[4].every(k => k === 1), 'the patch is full again');
    // golden veg doubles; molehill is flattened by a 4+ pull beside it, and cannot be pulled itself
    r = await game((g, A) => { g.set(A, { days: 5, orders: [[4, 30], [4, 30]], star: [0, 3] }); const s0 = g.score; g.harvest(0, 2); return g.score - s0; }, A);
    expect(r === 6, 'golden veg doubles the pull');
    r = await game((g, A) => { const rows = A.map(x => x.slice()); rows[1][2] = -1; g.set(rows, { days: 5, orders: [[4, 30], [4, 30]] }); const d0 = g.days, bad = g.harvest(1, 2), d1 = g.days, p = g.plan(1, 0); g.harvest(1, 0); return { bad, same: d0 === d1, inPlan: '1,2' in p, after: g.grid()[1][2] }; }, A);
    expect(r.bad === false && r.same, 'a molehill cannot be pulled and costs nothing');
    expect(r.inPlan && r.after >= 0, 'a 4+ pull beside the molehill flattens it and crops grow there');
    // real input: touch tap pulls; mouse hold peeks and sliding off cancels; keyboard cursor pulls
    await game((g, A) => g.set(A, { days: 9, orders: [[4, 30], [4, 30]] }), A);
    let m0 = await game(g => g.moves); const [x, y] = await game(g => g.xy(3, 2));
    await page.touchscreen.tap(x, y); await wait(200);
    expect(await game(g => g.moves) === m0 + 1 && (await game(g => g.grid()))[3][2] === 3, 'tapping the beet row pulls it; corn grows back');
    const [x2, y2] = await game(g => g.xy(5, 3));
    await page.mouse.move(x2, y2); await page.mouse.down(); await wait(200);
    expect(await game(g => g.press) === 6, 'holding a patch peeks at it (6 beets)');
    await page.mouse.move(x2, 20, { steps: 4 }); await page.mouse.up(); await wait(100);
    expect(await game(g => g.moves) === m0 + 1 && await game(g => g.press) === 0, 'sliding off the bed cancels the pull');
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('Space'); await wait(150);
    expect(await game(g => g.moves) === m0 + 2, 'keyboard cursor + space pulls a patch');
    // three orders filled → blueberries arrive
    for (let i = 0; i < 2; i++) { await game((g, A) => { g.set(A, { days: 6, orders: [[2, 4], [0, 30]] }); g.harvest(1, 0); }, A); await wait(1050); }
    r = await game(g => ({ served: g.served, types: g.types, o: g.orders(), grid: g.grid().flat() }));
    expect(r.served === 3 && r.types === 5 && r.o[0].k === 4 && r.grid.filter(k => k === 4).length >= 1, 'after three orders the fifth crop is ordered and sown');
    // last day → the run ends
    await game((g, A) => { g.set(A, { days: 1, orders: [[4, 30], [3, 30]] }); g.harvest(0, 2); }, A);
    expect(await game(g => g.days) === 0, 'out of days');
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    const s = await state(); expect(s.over, 'running out of days ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    expect(await game(g => g.days === 6 && g.moves === 0 && g.served === 0 && g.types === 4 && g.score === 0 && g.grid().flat().every(k => k >= 0 && k <= 3)), 'days, orders, crops and counters reset');
  },
};
