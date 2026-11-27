// Petal Count: generated beds have exactly one solution and need no guessing; planting by cell-then-flower and
// flower-then-cell works; clashes show; seeds (notes) clear when a peer is planted; CHECK counts a slip; the hint plants
// a correct flower; undo/erase work; a bed survives a reload; finishing wins, records the per-size best, restarts clean.
module.exports = {
  game: 'PhoneGameLab/games/60-petal-count/index.html',
  async run({ page, expect, wait, state, game }) {
    const S = () => game(g => ({ n: g.size, grid: g.grid, sol: g.sol, given: g.given, sel: g.sel, btn: g.buttons, cells: Array.from({ length: g.size * g.size }, (_, i) => g.cell(i)) }));
    const press = async id => { const b = (await game(g => g.buttons)).find(b => b.id === id); await page.mouse.click(b.x, b.y); await wait(50); };
    const tapCell = async i => { const c = await game((g, i) => g.cell(i), i); await page.mouse.click(c.x, c.y); await wait(40); };
    const plant = async (i, v) => { if ((await game(g => g.sel)) !== i) await tapCell(i); await press('f' + v); };
    const empties = I => [...I.grid].map((v, i) => v === '0' ? i : -1).filter(i => i >= 0);
    expect((await state()).running, 'running after autostart');
    expect(await game(g => g.size === 4 && g.mode === 'play'), 'first run starts on the 4×4 window box');
    const gen = await game(g => { const out = [], GEO = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };
      for (const n of [4, 6, 9]) for (let s = 1; s <= (n === 9 ? 6 : 12); s++) { const z = g.generate(n, s * 131 + n), [h, w] = GEO[n];
        if (g.countSolutions(z.puz, n, 2) !== 1) out.push('not unique ' + n + '/' + s); if (!g.singlesSolve(z.puz, n)) out.push('needs a guess ' + n + '/' + s);
        for (let i = 0; i < n; i++) { const row = new Set(), col = new Set(), box = new Set(); for (let j = 0; j < n; j++) { row.add(z.sol[i * n + j]); col.add(z.sol[j * n + i]); box.add(z.sol[((i / (n / w) | 0) * h + (j / w | 0)) * n + (i % (n / w)) * w + j % w]); } if (row.size !== n || col.size !== n || box.size !== n) out.push('bad solution ' + n + '/' + s); }
        if (z.puz.some((v, i) => v && v !== z.sol[i]) || z.puz.filter(v => v).length > n * n * .5) out.push('givens ' + n + '/' + s); }
      return out; });
    expect(gen.length === 0, 'generator: ' + gen.slice(0, 3).join('; '));
    let I = await S(); let E = empties(I); const n = I.n, sol = i => +I.sol[i];
    // cell → flower
    await plant(E[0], sol(E[0])); expect((await game(g => g.grid))[E[0]] === I.sol[E[0]], 'tap a cell, then a flower: planted');
    expect(/^\d:\d\d$/.test((await state()).score), 'HUD shows the clock');
    // a clash is flagged; undo removes it
    const clash = E.slice(1).map(i => { const r = i / n | 0, c = i % n; for (let j = 0; j < n * n; j++) if (I.given[j] === '1' && I.grid[j] !== I.sol[i] && ((j / n | 0) === r || j % n === c)) return [i, +I.grid[j]]; return null; }).find(Boolean);
    expect(!!clash, 'found a cell to test a clash');
    await plant(clash[0], clash[1]); expect((await game(g => g.conflicts))[clash[0]] === '1', 'a repeated flower in a line is flagged');
    await press('undo'); expect((await game(g => g.grid))[clash[0]] === '0' && !/1/.test(await game(g => g.conflicts)), 'undo clears it');
    // flower-first mode
    await tapCell(clash[0]); expect((await game(g => g.sel)) === -1, 'tapping the selected cell deselects');
    await press('f' + sol(E[1])); expect((await game(g => g.arm)) === sol(E[1]), 'flower armed with no cell selected');
    await tapCell(E[1]); expect((await game(g => g.grid))[E[1]] === I.sol[E[1]], 'armed flower plants on tap');
    await press('f' + sol(E[1])); expect((await game(g => g.arm)) === 0, 'tap again to disarm');
    // seeds are pencil marks and are cleared by planting in the same line
    const a = E[2], peer = E.slice(3).find(i => (i / n | 0) === (a / n | 0) || i % n === a % n);
    if (peer != null) { await press('seeds'); await plant(a, sol(peer)); expect((await game(g => g.notes))[a] === 1 << (sol(peer) - 1) && (await game(g => g.grid))[a] === '0', 'seed mark added, nothing planted');
      await press('seeds'); await plant(peer, sol(peer)); expect((await game(g => g.notes))[a] === 0, 'planting clears that seed from the line'); }
    // CHECK wilts a wrong flower and counts a slip; erase removes it
    I = await S(); E = empties(I); await press('check'); const wrongV = sol(E[0]) % n + 1;
    await plant(E[0], wrongV); expect((await game(g => g.slips)) === 1 && (await game(g => g.check)), 'check on: a wrong flower is a slip');
    await press('erase'); expect((await game(g => g.grid))[E[0]] === '0', 'erase removes it');
    await press('check');
    // hint plants one correct flower
    const g0 = await game(g => g.grid); await press('hint'); const g1 = await game(g => g.grid), diff = [...g1].map((v, i) => v !== g0[i] ? i : -1).filter(i => i >= 0);
    expect(diff.length === 1 && g1[diff[0]] === I.sol[diff[0]] && (await game(g => g.hints)) === 1, 'hint plants exactly one correct flower');
    // reload keeps the bed
    await wait(200); await page.reload({ waitUntil: 'load' }); await wait(500);
    expect((await game(g => g.grid)) === g1 && (await game(g => g.hints)) === 1 && (await game(g => g.given)) === I.given, 'bed restored after reload');
    // finish the 4×4
    I = await S(); for (const i of empties(I)) await plant(i, sol(i));
    expect((await game(g => g.mode)) === 'won', 'all flowers correct → bed won');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(200);
    expect((await state()).over, 'win card shown');
    let pr = await game(g => g.progress); expect(pr.best[4] >= 0 && pr.size === 6 && pr.wins === 1, '4×4 best stored; 6×6 suggested next');
    await wait(1000); await page.keyboard.press('Enter'); await wait(500);
    expect((await state()).running && !(await state()).over, 'restart runs');
    expect(await game(g => g.size === 6 && g.time < 2 && g.hist === 0 && g.hints === 0 && g.slips === 0 && g.sel === -1), 'a fresh 6×6 bed');
    // 6×6 with the keyboard: select by tap, plant with digit keys; the time is the score (lower is better)
    I = await S(); E = empties(I); expect(I.n === 6 && E.length >= 20, '6×6 has at least 20 cells to plant');
    for (let k = 0; k < E.length; k++) { if (k === E.length - 1) await game(g => { g.time = 75; }); await tapCell(E[k]); await page.keyboard.press(I.sol[E[k]]); await wait(30); }
    expect((await game(g => g.mode)) === 'won', '6×6 won by keyboard planting');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(200);
    const st = await state(); expect(st.over && st.best === 75, '6×6 time recorded as the best (lower is better)');
    pr = await game(g => g.progress); expect(pr.best[6] === 75 && pr.wins === 2, 'per-size bests kept');
    await wait(1000); await page.keyboard.press('Enter'); await wait(500);
    // size tabs: 9×9 deals a unique board; going back to 6×6 keeps a bed in progress
    await press('s9'); await wait(200); I = await S(); expect(I.n === 9 && empties(I).length > 40, '9×9 garden dealt');
    await plant(empties(I)[0], sol(empties(I)[0])); const nine = await game(g => g.grid);
    await press('s6'); await wait(100); expect((await game(g => g.size)) === 6, 'back to 6×6');
    await press('s9'); await wait(100); expect((await game(g => g.grid)) === nine, 'the 9×9 in progress was kept');
  },
};
