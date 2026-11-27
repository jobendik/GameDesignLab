// Haberdash: real drags swap and match, bad swaps bounce back for free, a ribbon button clears its row (and mends a
// hole), four in a row makes a power button and fills an order (level up), keyboard swaps work, a dead board
// reshuffles, running out of moves ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/44-haberdash/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const idle = () => page.waitForFunction(() => window.__lab.game.phase === 'idle', null, { timeout: 12000 });
    const drag = async (a, b) => { await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2); await page.mouse.move(b.x, b.y); await page.mouse.up(); await wait(250); await idle(); };
    const base = () => { const m = []; for (let r = 0; r < 8; r++) { m.push([]); for (let c = 0; c < 7; c++) m[r].push((c + 2 * r) % 5); } return m; };
    await idle();
    let s = await game(g => ({ moves: g.moves, goals: g.goals, level: g.level, n: g.board.filter(v => v >= 0).length }));
    expect(s.level === 1 && s.moves === 14 && s.goals.length === 1 && s.goals[0].need === 14 && s.n === 56, 'order 1: one colour goal, 14 moves, full board');
    // 1) a real drag on a suggested pair matches, scores and costs one move
    let h = await game(g => g.hint()); expect(h && h.length === 2, 'a valid swap exists');
    await drag(h[0], h[1]);
    s = await game(g => ({ moves: g.moves, score: g.score, n: g.board.filter(v => v >= 0).length }));
    expect(s.moves === 13 && s.score >= 30 && s.n === 56, 'match clears, refills and costs a move'); expect((await state()).score === s.score, 'HUD score updated');
    // 2) a swap that matches nothing bounces back for free
    let m = base(); m[7] = [0, 0, 2, 0, 3, 4, 0]; m[6][2] = 0;   // contains one valid swap elsewhere, so no reshuffle
    await game((g, m) => { g.setBoard(m); g.setGoals([['k', 5, 99]]); }, m);
    const p00 = await game(g => g.cellXY(0, 0)), p01 = await game(g => g.cellXY(0, 1));
    await drag(p00, p01);
    s = await game(g => ({ moves: g.moves, b: g.board })); expect(s.moves === 13 && s.b[0] === 0 && s.b[1] === 1, 'non-matching swap is undone and free');
    // 3) ribbon button in a match clears its whole row and mends the hole under it
    m = base(); m[7] = [10, 0, 2, 1, 3, 4, 1]; m[6][2] = 0;
    await game((g, m) => { g.setBoard(m); g.setHole(7, 6); }, m);
    let before = await game(g => g.score); expect(await game(g => g.holes) === 1, 'hole placed');
    await drag(await game(g => g.cellXY(6, 2)), await game(g => g.cellXY(7, 2)));
    s = await game(g => ({ score: g.score, holes: g.holes, moves: g.moves }));
    expect(s.score - before >= 70 && s.moves === 12, 'ribbon blast scores the whole row (got ' + (s.score - before) + ')'); expect(s.holes === 0, 'the blast mended the hole at the far end of the row');
    // 4) four in a row makes a power button; filling the order advances to order 2 with a spare-move bonus
    m = base(); m[7] = [0, 0, 2, 0, 3, 4, 0]; m[6][2] = 0;
    await game((g, m) => { g.setBoard(m); g.setGoals([['k', 0, 3]]); }, m);
    before = await game(g => g.score);
    await drag(await game(g => g.cellXY(6, 2)), await game(g => g.cellXY(7, 2)));
    await page.waitForFunction(() => window.__lab.game.level === 2, null, { timeout: 12000 }); await idle();
    s = await game(g => ({ specials: g.specials, score: g.score, moves: g.moves, goals: g.goals }));
    expect(s.specials >= 1, 'a 4-match leaves a power button'); expect(s.score - before >= 40 + 11 * 60, 'spare moves pay a bonus');
    expect(s.moves === 16 && s.goals.length === 2, 'order 2 has two goals and a fresh move budget');
    // 5) keyboard: move the cursor to a suggested pair and swap
    h = await game(g => g.hint()); await page.keyboard.press('Enter');
    const go = async (dr, dc) => { for (let i = 0; i < Math.abs(dr); i++) await page.keyboard.press(dr > 0 ? 'ArrowDown' : 'ArrowUp'); for (let i = 0; i < Math.abs(dc); i++) await page.keyboard.press(dc > 0 ? 'ArrowRight' : 'ArrowLeft'); };
    await go(h[0].r - 4, h[0].c - 3); await page.keyboard.press('Space'); await go(h[1].r - h[0].r, h[1].c - h[0].c); await wait(250); await idle();
    expect(await game(g => g.moves) === 15, 'keyboard swap plays a move');
    // 6) a board with no possible swap reshuffles itself
    const dead = []; for (let r = 0; r < 8; r++) { dead.push([]); for (let c = 0; c < 7; c++) dead[r].push((c + 2 * r) % 6); }
    await game((g, m) => g.setBoard(m), dead); expect(await game(g => g.hint()) === null, 'crafted board has no swap');
    await game(g => g.check()); expect(await game(g => g.phase) === 'shuffle', 'reshuffle starts'); await wait(300); await idle();
    expect(await game(g => g.hint()) !== null, 'after the reshuffle a swap exists');
    // 7) out of moves → game over
    await game(g => { g.setMoves(1); g.setGoals([['hole', 0, 99]]); });
    h = await game(g => g.hint()); await page.touchscreen.tap(h[0].x, h[0].y); await wait(120); await page.touchscreen.tap(h[1].x, h[1].y);
    for (let i = 0; i < 60 && !(await state()).over; i++) await wait(200);
    const o = await state(); expect(o.over, 'unfilled order with no moves ends the run'); expect(o.best >= o.score && o.score > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(400); await idle();
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    s = await game(g => ({ level: g.level, moves: g.moves, specials: g.specials, holes: g.holes })); expect(s.level === 1 && s.moves === 14 && s.specials === 0 && s.holes === 0, 'level and counters reset');
  },
};
