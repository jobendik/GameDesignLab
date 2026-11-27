// Bedtime Stacks: equal volumes merge and score, Olli slides as a piece and reads the wished volume (either side
// moving into the other), wrong volumes just block, dust bunnies and the golden book work, real swipe + keyboard
// input drive moves, a jammed rug ends the run, restart is clean.
const E = ['', '', '', ''];
module.exports = {
  game: 'PhoneGameLab2/games/bedtime-stacks/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const g0 = (await game(g => g.grid())).flat();
    expect(g0.filter(x => x === 'O').length === 1 && g0.filter(x => x === 'b1').length === 3, 'fresh rug: Olli + three Vol.1 books');
    const play = async (rows, wish, dir) => { await game((g, a) => { g.set(a.rows, a.wish); g.move(a.dir); }, { rows, wish, dir }); await wait(320); return game(g => ({ grid: g.grid(), score: g.score, reads: g.reads, wish: g.wish, moves: g.moves })); };
    // merge
    let s0 = await game(g => g.score), r = await play([['b1', 'b1', '', ''], E, ['', '', 'O', ''], E], 2, 'L');
    expect(r.grid[0][0] === 'b2' && r.score === s0 + 4, 'two Vol.1 merge into Vol.2 for 4 points');
    expect(r.grid.flat().filter(Boolean).length === 3, 'one new book arrives after a move');
    expect((await state()).score === r.score, 'HUD shows the score');
    // delivery: the wished book slides into Olli (Olli slides too)
    s0 = r.score; r = await play([E, E, ['b2', '', 'O', ''], E], 2, 'R');
    expect(r.reads === 1 && r.grid[2][3] === 'O' && r.grid[2][2] !== 'b2', 'Olli slid to the wall and read the wished volume');
    expect(r.score === s0 + 2 * 20 * 3 && r.wish === 3, 'a quick read scores 3 stars and Olli wishes for the next volume');
    // Olli slides into the book himself
    r = await play([E, E, ['', 'O', '', 'b3'], E], 3, 'R');
    expect(r.reads === 2 && r.grid[2][3] === 'O', 'Olli bumping into the wished volume reads it too');
    // a wrong volume is just a book: it stacks behind him
    r = await play([E, E, ['b1', '', 'O', ''], E], 3, 'R');
    expect(r.reads === 2 && r.grid[2][3] === 'O' && r.grid[2][2] === 'b1', 'wrong volume is not read; Olli blocks it');
    // dust bunny + golden book
    s0 = r.score; r = await play([E, E, ['d', '', 'O', ''], E], 3, 'R');
    expect(r.score === s0 + 5 && !r.grid.flat().includes('d'), 'dust bunny slid into Olli is hooted away');
    r = await play([['w', 'b4', '', ''], E, E, ['', '', 'O', '']], 3, 'L');
    expect(r.grid[0][0] === 'b5', 'golden book merges with any volume');
    // blocked move does nothing
    const m0 = r.moves; await game(g => { g.set([['b1', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['O', '', '', '']], 3); g.move('L'); }); await wait(250);
    expect(await game(g => g.moves) === m0, 'a swipe that moves nothing is not a move');
    // real input: mouse swipe right merges the top row, keyboard also moves
    await game(g => g.set([['', '', 'b1', 'b1'], ['', '', '', ''], ['', '', '', ''], ['O', '', '', '']], 3));
    await page.mouse.move(120, 420); await page.mouse.down(); await page.mouse.move(170, 424, { steps: 3 }); await page.mouse.move(240, 426, { steps: 3 }); await page.mouse.up(); await wait(350);
    expect((await game(g => g.grid()))[0][3] === 'b2', 'swipe right merged the top row');
    const m1 = await game(g => g.moves); await page.keyboard.press('ArrowUp'); await wait(300);
    expect(await game(g => g.moves) === m1 + 1, 'arrow key makes a move');
    // jam the rug: one legal move left, and it leads to a dead end whatever arrives
    await game(g => { g.set([['b3', 'b4', 'b3', 'b4'], ['b4', 'b3', 'b4', 'b3'], ['b3', 'b4', 'b3', 'b4'], ['b3', 'b5', 'O', '']], 9); g.move('R'); });
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    const s = await state(); expect(s.over, 'a jammed rug ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    const g1 = (await game(g => g.grid())).flat();
    expect(await game(g => g.reads === 0 && g.moves === 0 && g.wish === 2) && g1.filter(Boolean).length === 4, 'rug, wish and counters reset');
  },
};
