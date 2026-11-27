// Plot Twist: dragging a tile from the tray plants it, an occupied drop is refused, tapping a piece twists it for a
// token, completing a hedged plot blooms/clears/scores with a streak, the season turns and re-digs the plots, the
// keyboard can plant, a board with no room ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/53-plot-twist/index.html',
  async run({ page, expect, wait, state, game }) {
    const dragTo = async (i, gx, gy) => { const a = await game((g, i) => g.slotXY(i), i), b = await game((g, v) => g.dropXY(v[0], v[1], v[2], false), [i, gx, gy]); await page.mouse.move(a[0], a[1]); await page.mouse.down(); await page.mouse.move((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, { steps: 4 }); await page.mouse.move(b[0], b[1], { steps: 4 }); await page.mouse.up(); await wait(90); };
    const filled = () => game(g => g.grid.filter(v => v).length);
    expect((await state()).running, 'running after autostart');
    expect(await game(g => g.tray.every(p => p) && g.grid.every(v => !v) && g.twists === 3 && g.season === 0), 'three pieces dealt on an empty bed with 3 twists');
    const plots = await game(g => g.plots); expect(plots.length >= 8 && plots.every(p => p.length >= 3) && plots.flat().length === 64, 'the bed is partitioned into plots of ≥3 cells (' + plots.map(p => p.length).join(',') + ')');
    // plant by dragging (known pieces so nothing blooms by accident)
    await game(g => { g.setTray(0, 1); g.setTray(1, 2); g.setTray(2, 0); });
    const big = plots.findIndex(p => p.length >= 5), spot = await game(g => g.fit(0)); await dragTo(0, spot[0], spot[1]);
    expect(await filled() === 2 && await game(g => g.score === 2 && g.tray[0] === null), 'dragging the domino onto the bed plants 2 tiles for 2 points');
    // dropping on occupied cells is refused
    await dragTo(1, spot[0], spot[1]); expect(await filled() === 2 && await game(g => !!g.tray[1]), 'a drop onto planted cells is refused and the piece returns');
    // tap to twist: costs a token, swaps the footprint
    let t0 = await game(g => ({ w: g.tray[1].w, h: g.tray[1].h, tw: g.twists })); const s1 = await game(g => g.slotXY(1)); await page.touchscreen.tap(s1[0], s1[1]); await wait(80);
    let t1 = await game(g => ({ w: g.tray[1].w, h: g.tray[1].h, tw: g.twists })); expect(t1.w === t0.h && t1.h === t0.w && t1.tw === t0.tw - 1, 'tapping the 3-bar twists it 90° and spends a token');
    const s2 = await game(g => g.slotXY(2)); await page.touchscreen.tap(s2[0], s2[1]); await wait(80); expect(await game(g => g.twists) === t1.tw, 'twisting a symmetric piece is free (nothing happens)');
    await game(g => g.setTwists(0)); await page.touchscreen.tap(s1[0], s1[1]); await wait(80); expect(await game(g => g.tray[1].w) === t1.w, 'no tokens, no twist');
    // bloom: fill a plot except one cell, plant the single there
    const bloom = async pi => { const all = await game(g => g.plots), cells = all[pi], hole = cells[0], stray = all[(pi + 1) % all.length][0];   // one stray tile elsewhere so the bed is not left empty (clear-garden bonus)
      await game((g, v) => { const a = g.grid.map(() => 0); v.cells.forEach(c => { if (c !== v.hole) a[c] = 3; }); a[v.stray] = 5; g.setGrid(a); g.setTray(2, 0); }, { cells, hole, stray }); const before = await game(g => g.score); await dragTo(2, hole % 8, hole >> 3); return [cells, before]; };
    let [cells, before] = await bloom(big); let st = await game(g => ({ score: g.score, grid: g.grid, streak: g.streak, blooms: g.blooms }));
    expect(cells.every(c => !st.grid[c]) && st.blooms === 1 && st.streak === 1 && st.score === before + 1 + cells.length * 10, 'completing a plot blooms it: cells clear, +10 per cell');
    expect((await state()).score === st.score, 'HUD shows the score');
    const second = (await game(g => g.plots)).findIndex((p, i) => i !== big && p.length >= 4);[cells, before] = await bloom(second); st = await game(g => ({ score: g.score, streak: g.streak }));
    expect(st.streak === 2 && st.score === before + 1 + Math.round(cells.length * 10 * 1.5), 'a bloom on the next placement is a streak ×1.5');
    // season turns after enough blooms and the hedges are re-dug
    const idBefore = (await game(g => g.plotId)).join(''); await game(g => g.setBlooms(g.need - 1)); await bloom(0); await wait(200);
    expect(await game(g => g.season) === 1 && (await game(g => g.plotId)).join('') !== idBefore, 'the season turns and the plots are re-dug');
    const sizes = (await game(g => g.plots)).map(p => p.length); expect(sizes.reduce((a, b) => a + b, 0) === 64 && sizes.length < plots.length + 1, 'new plots still cover the bed (' + sizes.join(',') + ')');
    // keyboard: select piece 1 (a single), move the cursor, plant
    await game(g => { g.setGrid(g.grid.map(() => 0)); g.setTray(0, 0); }); await page.keyboard.press('1'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Space'); await wait(80);
    expect(await filled() === 1, 'keyboard selects, moves and plants a piece');
    // an emptied bed pays the clear-garden bonus
    { const all = await game(g => g.plots), cells = all[0]; await game((g, c) => { const a = g.grid.map(() => 0); c.slice(1).forEach(q => { a[q] = 1; }); g.setGrid(a); g.setTray(2, 0); }, cells); const b0 = await game(g => g.score); await dragTo(2, cells[0] % 8, cells[0] >> 3); const gain = (await game(g => g.score)) - b0; expect(gain >= 1 + cells.length * 10 + 150 && await filled() === 0, 'blooming the last tiles off the bed adds the clear-garden bonus (' + gain + ')'); }
    // game over: checkerboard bed, the single goes into a plot that stays incomplete, only 3×3 pieces remain, no twists
    const target = await game(g => { const a = g.grid.map((_, i) => ((i % 8) + (i >> 3)) % 2 ? 0 : 2); g.setTray(0, 0); g.setTray(1, 14); g.setTray(2, 14); g.setTwists(0); g.setGrid(a);
      for (const p of g.plots) { const empty = p.filter(c => !a[c]); if (empty.length >= 2) return empty[0]; } return -1; });
    expect(target >= 0 && (await state()).running, 'still running while the single fits');
    const sc = await game(g => g.score); await dragTo(0, target % 8, target >> 3); await wait(1500);
    let s = await state(); expect(s.over && await game(g => !g.alive), 'when nothing fits the run ends'); expect(s.best >= s.score && s.score === sc + 1, 'best recorded');
    await wait(500); await page.keyboard.press('Enter'); await wait(500); s = await state();
    expect(s.running && !s.over && s.score === 0 && await game(g => g.grid.every(v => !v) && g.twists === 3 && g.season === 0 && g.streak === 0 && g.tray.every(p => p && p.fits)), 'restart is clean');
  },
};
