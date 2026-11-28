// Lantern Lane: paths are drawn with real mouse drags (backtracking pops a stone); Walk refuses until every pal has a path;
// drawing the generator's solution and tapping Walk brings everyone home, scores and opens the next night; on night 2 the
// obvious shortest routes bump (a lantern is lost, the spot is marked, paths are kept), and the true solution clears it;
// tapping a pal cycles its wait; running out of lanterns ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/lantern-lane/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.level) === 1 && await game(g => g.pals().length) === 2 && await game(g => g.lanterns) === 3, 'night 1: two pals, three lanterns');
    const at = (r, c) => game((g, a) => g.cell(a[0], a[1]), [r, c]);
    const drag = async path => {
      let p = await at(...path[0]); await page.mouse.move(p[0], p[1]); await page.mouse.down();
      for (const q of path.slice(1)) { p = await at(...q); await page.mouse.move(p[0], p[1], { steps: 4 }); }
      await page.mouse.up(); await wait(60);
    };
    const tapPal = async i => { const s = (await game(g => g.pals()))[i].s, p = await at(...s); await page.touchscreen.tap(p[0], p[1]); await wait(80); };
    const tapWalk = async () => { const b = await game(g => g.walkBtn); await page.touchscreen.tap(b[0], b[1]); await wait(80); };
    const waitPhase = async (ph, ms) => { for (let i = 0; i < ms / 100 && await game(g => g.phase) !== ph; i++) await wait(100); return game(g => g.phase); };
    const solve = async () => { const sol = await game(g => g.sol); for (let i = 0; i < sol.length; i++) { await drag(sol[i].path); for (let k = 0; k < sol[i].wait; k++) await tapPal(i); } return sol; };
    // 1) Walk is refused until every pal has a path home
    await tapWalk(); expect(await game(g => g.phase) === 'plan' && await game(g => g.lanterns) === 3, 'Walk is refused without complete paths (no lantern lost)');
    // 2) backtracking: draw two stones out then drag back one
    let sol = await game(g => g.sol), s0 = sol[0].path;
    let p = await at(...s0[0]); await page.mouse.move(p[0], p[1]); await page.mouse.down();
    for (const q of [s0[1], s0[2], s0[1]]) { p = await at(...q); await page.mouse.move(p[0], p[1], { steps: 4 }); }
    await page.mouse.up(); await wait(60);
    expect((await game(g => g.pals()))[0].path.length === 2, 'dragging back over the last stone removes it');
    // 3) the solution, drawn by hand, walks everyone home
    await solve();
    const pals = await game(g => g.pals()); expect(pals.every((q, i) => JSON.stringify(q.path) === JSON.stringify(sol[i].path)), 'drawn paths match the drag');
    await tapWalk(); expect(await game(g => g.phase) === 'walk', 'Walk starts the walk');
    expect(await waitPhase('clear', 8000) === 'clear', 'everyone gets home');
    let s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score })); expect(s.score >= 120 && s.hud === s.score, 'clearing the night scores (HUD agrees)');
    for (let i = 0; i < 40 && await game(g => g.level) !== 2; i++) await wait(100);
    expect(await game(g => g.level) === 2 && await game(g => g.phase) === 'plan', 'night 2 follows');
    // 4) night 2: the obvious shortest routes bump
    const naive = (await game(g => g.pals())).map(q => q.naive);
    for (const path of naive) await drag(path);
    expect(!(await game(g => g.simulate())).ok, 'the shortest routes would collide');
    await page.keyboard.press('Enter'); expect(await waitPhase('bump', 8000) === 'bump', 'the walk ends in a bump');
    expect(await game(g => g.lanterns) === 2 && await game(g => g.bumpMark) !== null, 'a lantern is lost and the spot is marked');
    expect(await waitPhase('plan', 4000) === 'plan', 'back to planning after the bump');
    expect((await game(g => g.pals())).every((q, i) => q.path.length === naive[i].length), 'paths are kept after a bump');
    // 5) waits: tapping a pal cycles 1,2,3,0
    for (let k = 1; k <= 4; k++) { await tapPal(0); expect((await game(g => g.pals()))[0].wait === k % 4, 'tap cycles the wait to ' + (k % 4)); }
    // 6) the true solution clears night 2 (dragging from a pal replaces its old path)
    sol = await solve(); expect((await game(g => g.simulate())).ok, 'the solution is collision-free');
    const before = await game(g => g.score);
    await tapWalk(); expect(await waitPhase('clear', 9000) === 'clear', 'night 2 solved after the retry');
    expect(await game(g => g.score) > before && await game(g => g.tries) === 2, 'scored on the second try');
    for (let i = 0; i < 40 && await game(g => g.level) !== 3; i++) await wait(100);
    // 7) out of lanterns: keep walking into bumps on night 3
    for (let n = 0; n < 4 && !(await state()).over; n++) {
      const nv = (await game(g => g.pals())).map(q => q.naive); for (const path of nv) await drag(path);
      expect(!(await game(g => g.simulate())).ok, "night 3's shortest routes collide too");
      await tapWalk(); await waitPhase('bump', 8000); for (let i = 0; i < 30 && !(await state()).over && await game(g => g.phase) !== 'plan'; i++) await wait(100);
    }
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(100);
    let st = await state(); expect(st.over && await game(g => g.lanterns) === 0, 'losing the last lantern ends the run');
    expect(st.best >= st.score && st.best > 0, 'best score recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(600);
    st = await state(); expect(st.running && !st.over && st.score === 0, 'restart gives a clean run');
    expect(await game(g => g.level) === 1 && await game(g => g.lanterns) === 3 && (await game(g => g.pals())).every(q => q.path.length === 1 && q.wait === 0), 'night 1 again, full lanterns, no paths');
  },
};
