// Pack Ice: real drags push pieces in from an edge and they slide until they bump (far wall, another block); a drag released
// away from the pond cancels; completing a row cracks it, scores and sends its frozen fish to Nori; dragging a charged Nori
// to a lane belly-slides through its blocks; when nothing can enter the pond the run ends; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/pack-ice/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const { bx, by, cell, side, slots, home } = await game(g => g.geo), E = '........';
    const dragTo = async (from, x, y) => { await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(from.x, from.y - 30, { steps: 2 }); await page.mouse.move(x, y, { steps: 6 }); await wait(60); await page.mouse.up(); };
    await game(g => g.setTray([['##', '##'], ['####'], ['#']]));
    // 1) a square pushed in from the top glides to the far wall
    await dragTo(slots[0], bx + cell * 1, by - cell * .5); await wait(600);
    let s = await page.evaluate(() => ({ grid: __lab.game.grid(), score: __lab.game.score, hud: __lab.state.score, tray: __lab.game.tray(), moves: __lab.game.moves }));
    expect(s.grid[6] === '##......' && s.grid[7] === '##......' && s.grid[5] === E, 'the square slid from the top edge down to the bottom rows');
    expect(s.score === 4 && s.hud === 4 && s.tray[0] === 0 && s.moves === 1, 'placing scores one point per cell and uses the tray piece');
    // 2) a bar pushed in from the right stops against the square
    await dragTo(slots[1], bx + side + cell * .5, by + cell * 7.5); await wait(600);
    s = await game(g => ({ grid: g.grid(), score: g.score })); expect(s.grid[7] === '######..', 'the bar slid left along the bottom row until it bumped the square'); expect(s.score === 8, 'score 8');
    // 3) releasing away from the pond cancels
    await dragTo(slots[2], slots[1].x, slots[1].y + 10); await wait(200);
    s = await game(g => ({ tray: g.tray(), moves: g.moves })); expect(s.tray[2] === 1 && s.moves === 2, 'a drop outside the pond returns the piece');
    // 4) completing a row cracks it; the frozen fish goes to Nori
    await game(g => g.setGrid(['........', '........', '........', '........', '........', '........', '........', 'f######.']));
    await dragTo(slots[2], bx + cell * 7.5, by - cell * .5); await wait(700);
    s = await game(g => ({ grid: g.grid(), score: g.score, lines: g.lines, streak: g.streak, tray: g.tray() }));
    expect(s.lines === 1 && s.grid[7] === E && s.streak === 1, 'the full row cracked'); expect(s.score === 8 + 1 + 60 + 30, 'line + fish bonus scored');
    expect(s.tray.every(n => n > 0), 'an empty tray is dealt three new pieces');
    for (let i = 0; i < 25 && await game(g => g.meter) < 1; i++) await wait(100);
    expect(await game(g => g.meter === 1 && g.fish === 1), 'Nori ate the fish');
    // 5) belly slide: drag Nori to a lane
    await game(g => { g.setGrid(['........', '........', '........', '##.##...', '........', '........', '........', '........']); g.charge = 1; }); await wait(300);
    const sc = await game(g => g.score); await dragTo(home, bx - cell * .5, by + cell * 3.5); await wait(900);
    s = await game(g => ({ grid: g.grid(), score: g.score, charge: g.charge })); expect(s.grid[3] === E && s.charge === 0 && s.score === sc + 32, 'Nori slid along the row and smashed its four blocks');
    // 6) nothing fits → frozen solid
    await game(g => { g.setGrid(['.######.', '#.######', '##.#####', '###.####', '####.###', '#####.##', '######.#', '.#######']); g.setTray([['#'], ['####'], ['####']]); });
    expect(await game(g => g.canMove()), 'one pocket is still reachable'); const before = await game(g => g.score);
    await dragTo(slots[0], bx + cell * .5, by - cell * .5);
    for (let i = 0; i < 25 && !(await state()).over; i++) await wait(200);
    s = await state(); expect(s.over, 'no piece can enter the pond: the run ends'); expect(s.best >= before + 1 && s.best > 0, 'best score recorded');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.grid().every(r => r === '........') && g.lines === 0 && g.level === 1 && g.meter === 0 && g.charge === 0 && g.tray().every(n => n > 0)), 'pond, counters and tray reset');
  },
};
