// Purlwise: every pattern is line-solvable (unique), drag strokes knit/skip/erase and lock to a line, finished lines
// auto-skip, undo works, CHECK catches a wrong stitch, hints place a correct forced cell, progress survives a reload,
// completing the chart wins with a rating, and the next pattern starts clean.
module.exports = {
  game: 'PhoneGameLab/games/59-purlwise/index.html',
  async run({ page, expect, wait, state, game }) {
    const info = () => game(g => { const N = g.size, cells = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) cells.push(g.cell(r, c)); return { N, sol: g.sol, grid: g.grid, cells }; });
    const drag = async (a, b) => { await page.mouse.move(a.x, a.y); await page.mouse.down(); if (b) await page.mouse.move(b.x, b.y, { steps: 4 }); await page.mouse.up(); await wait(60); };
    const press = async id => { const b = await game((g, id) => g.buttons.find(b => b.id === id), id); await page.mouse.click(b.x, b.y); await wait(100); };
    const solve = async () => {   // knit every remaining stitch with real strokes: runs of empty cells by drag, leftovers by tap
      let I = await info(); const N = I.N;
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (I.sol[r * N + c] !== '1' || I.grid[r * N + c] !== '0') continue; let e = c; while (e + 1 < N && I.sol[r * N + e + 1] === '1' && I.grid[r * N + e + 1] === '0') e++;
        await drag(I.cells[r * N + c], e > c ? I.cells[r * N + e] : null); if ((await game(g => g.mode)) !== 'play') return; I = await info(); c = e; }
      for (let i = 0; i < N * N; i++) if (I.sol[i] === '1' && I.grid[i] !== '1') { await drag(I.cells[i]); if ((await game(g => g.mode)) !== 'play') return; }
    };
    expect((await state()).running, 'running after autostart');
    expect(await game(g => g.level === 1 && g.size === 5 && g.mode === 'play' && !g.check), 'starts on pattern 1 (5×5), check off');
    const sizes = await game(g => { const o = []; for (let n = 1; n <= 45; n++) o.push(g.proof(n)); return o; });
    expect(sizes.every(s => s >= 5) && sizes[0] === 5 && sizes[44] === 10 && sizes.includes(7) && sizes.includes(8), 'all 45 patterns are solvable by line logic (unique), 5×5 → 10×10');
    let I = await info(); const N = I.N, at = (r, c) => I.cells[r * N + c];
    // row 1 of the heart is a full line: one stroke knits five, the row reads done, and a wobbly drag stays on its row
    await drag(at(1, 0), { x: at(1, 4).x, y: at(1, 4).y + 30 });
    expect((await game(g => g.grid)).slice(5, 10) === '11111' && (await game(g => g.done.rows[1])), 'a stroke knits a full row and locks to it');
    expect((await game(g => g.grid)).slice(10, 15) === '00000', 'the stroke did not leak into the next row');
    // SKIP tool marks gaps, dragging the same tool over them erases, undo restores
    await press('skip'); expect((await game(g => g.tool)) === 2, 'skip tool selected');
    await drag(at(4, 0), at(4, 1)); expect((await game(g => g.grid)).slice(20, 22) === '22', 'skip stroke marks two gaps');
    await drag(at(4, 0), at(4, 1)); expect((await game(g => g.grid)).slice(20, 22) === '00', 'same tool over marks erases them');
    await press('undo'); expect((await game(g => g.grid)).slice(20, 22) === '22', 'undo brings the marks back');
    await press('undo'); await press('knit');
    // CHECK on: a wrong stitch is caught (turned into a gap) and counted
    await press('check'); expect(await game(g => g.check), 'check toggled on');
    await drag(at(4, 0)); expect((await game(g => g.grid))[20] === '2' && (await game(g => g.slips)) === 1, 'check catches a wrong stitch as a slip');
    // hint places one cell that agrees with the answer
    const g0 = await game(g => g.grid); await press('hint'); const g1 = await game(g => g.grid), sol = I.sol;
    const diff = [...g1].map((v, i) => v !== g0[i] ? i : -1).filter(i => i >= 0);
    expect(diff.length === 1 && (g1[diff[0]] === '1') === (sol[diff[0]] === '1') && (await game(g => g.hints)) === 1, 'hint sets exactly one correct cell');
    // reload keeps the chart
    await page.reload({ waitUntil: 'load' }); await wait(500);
    expect((await game(g => g.grid)) === g1 && (await game(g => g.slips)) === 1 && (await game(g => g.check)), 'chart, slips and check option restored after reload');
    // finish it
    await solve(); expect((await game(g => g.mode)) === 'won', 'all clues satisfied → pattern won');
    expect(await game(g => [...g.grid].every((v, i) => (v === '1') === (g.sol[i] === '1'))), 'the knitted chart equals the picture');
    expect((await game(g => g.rating())) === 2, 'one slip + one hint → two stars');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(200);
    const st = await state(); expect(st.over && st.best === 1, 'win card shown, best pattern recorded');
    const pr = await game(g => g.progress); expect(pr.max === 2 && pr.lvl === 2 && pr.stars[1] === 2 && pr.times[1] >= 0, 'progress saved');
    await wait(1000); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 2, 'restart runs the next pattern');
    expect(await game(g => g.level === 2 && /^0+$/.test(g.grid) && g.slips === 0 && g.hints === 0 && g.hist === 0 && g.time < 2), 'pattern 2 starts clean');
    await press('check'); await solve(); expect((await game(g => g.mode)) === 'won' && (await game(g => g.rating())) === 3, 'a clean solve earns three stars');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(200);
    expect((await state()).over && (await game(g => g.progress)).stars[2] === 3, 'second win recorded');
  },
};
