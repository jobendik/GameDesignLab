// Plumpling: swipes slide and chain-merge, blocked swipes cost nothing, orders are served from the gold plate,
// missed orders burn, two burnt crumble, undo restores, a jammed tray ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/43-plumpling/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let s = await game(g => ({ n: g.tileCount, o: g.order, undos: g.undos }));
    expect(s.n === 2 && s.o.tier === 3 && s.o.left === 10 && s.undos === 2, 'starts with two dumplings and an order for a 3');
    const E = [-1, -1, -1, -1];
    const swipe = async (dx, dy) => { const p = await game(g => g.cellXY(1.5, 1.5)); await page.mouse.move(p.x, p.y); await page.mouse.down(); for (let i = 1; i <= 5; i++) await page.mouse.move(p.x + dx * i / 5, p.y + dy * i / 5); await page.mouse.up(); await wait(450); };
    // 1) chain squish with a real swipe: 1 1 2 3 → 4 in one move, links pay 4·1 + 8·2 + 16·3
    await game((g, E) => { g.setOrder({ r: 3, c: 3, tier: 9, left: 99 }); g.set([[1, 1, 2, 3], E, E, E]); }, E);
    const s0 = await game(g => g.score);
    await swipe(-90, 6);
    s = await game(g => ({ grid: g.grid, score: g.score, chain: g.bestChain, n: g.tileCount, moves: g.moves }));
    expect(s.grid[0][0] === 4, 'whole row squishes into one 4 (got ' + s.grid[0] + ')');
    expect(s.score - s0 === 68 && s.chain === 3, 'chain links score 4+16+48 (got ' + (s.score - s0) + ')');
    expect(s.n === 2 && s.moves === 1, 'one new dumpling arrives after a move');
    expect((await state()).score === s.score, 'HUD score updated');
    // 2) a blocked swipe is free
    await game((g, E) => g.set([[5, -1, -1, -1], E, E, E]), E);
    await swipe(-90, 0); await swipe(0, -90);
    s = await game(g => ({ n: g.tileCount, moves: g.moves })); expect(s.n === 1 && s.moves === 1, 'swiping into a wall spawns nothing and costs no move');
    // 3) keyboard + serving an order
    await game((g, E) => { g.set([E, E, [-1, -1, 2, 2], E]); g.setOrder({ r: 2, c: 0, tier: 3, left: 5 }); }, E);
    const s1 = await game(g => g.score);
    await page.keyboard.press('ArrowLeft'); await wait(900);
    s = await game(g => ({ served: g.served, score: g.score, o: g.order, grid: g.grid }));
    expect(s.served === 1, 'a 3 parked on the plate is served');
    expect(s.score - s1 === 8 + 32 + 4 * 2, 'serve pays 4×size plus 2 per spare move (got ' + (s.score - s1) + ')');
    expect(!(s.o.r === 2 && s.o.c === 0) && s.o.left === s.o.total, 'a fresh order appears on another cell');
    expect(s.grid.flat().filter(v => v === 3).length === 0, 'the served dumpling left the tray');
    // 4) missed order burns; two burnt crumble
    await game((g, E) => { g.set([[4, -1, -1, -1], E, E, E]); g.setOrder({ r: 3, c: 3, tier: 7, left: 1 }); }, E);
    await page.keyboard.press('ArrowRight'); await wait(700);
    s = await game(g => ({ missed: g.missed, grid: g.grid })); expect(s.missed === 1 && s.grid.flat().includes(0), 'running out of moves leaves a burnt dumpling');
    await game((g, E) => { g.setOrder({ r: 3, c: 3, tier: 9, left: 99 }); g.set([[0, -1, 0, -1], E, E, [-1, 6, -1, -1]]); }, E);
    const before = await game(g => ({ grid: g.grid, score: g.score, undos: g.undos }));
    await page.keyboard.press('a'); await wait(600);
    s = await game(g => ({ grid: g.grid, score: g.score })); expect(!s.grid.flat().includes(0) && s.score === before.score + 8, 'two burnt ones crumble away');
    // 5) undo via a touch tap on the button
    const b = await game(g => g.button); await page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); await wait(400);
    s = await game(g => ({ grid: g.grid, score: g.score, undos: g.undos }));
    expect(JSON.stringify(s.grid) === JSON.stringify(before.grid) && s.score === before.score && s.undos === before.undos - 1, 'undo restores the tray and spends a charge');
    // 6) jam → game over
    await game(g => g.set([[5, 6, 5, 6], [6, 5, 6, 5], [5, 6, 5, 6], [5, 6, 5, -1]]));
    await page.keyboard.press('ArrowRight');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(150);
    const o = await state(); expect(o.over, 'a tray with no moves ends the run'); expect(o.best >= o.score && o.score > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    s = await game(g => ({ n: g.tileCount, served: g.served, missed: g.missed, undos: g.undos, moves: g.moves, o: g.order }));
    expect(s.n === 2 && s.served === 0 && s.missed === 0 && s.undos === 2 && s.moves === 0 && s.o.tier === 3, 'tray reset after restart');
  },
};
