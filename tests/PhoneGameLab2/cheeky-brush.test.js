// Cheeky Brush: picking a colour and dragging (mouse) paints strokes onto the customer's cheek/forehead; undo removes
// the last stroke; DONE scores the likeness — a careful trace of the requested design in the right colour earns
// 3 stars, score and +8 s; a wrong-colour scribble scores low; the likeness metric rewards exact copies and punishes
// wrong colours; the clock running out closes the fair (neutral card); restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/cheeky-brush/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const toPaint = async () => { for (let i = 0; i < 60 && (await game(g => g.phase)) !== 'paint'; i++) await wait(100); return game(g => g.phase); };
    const click = async xy => { await page.mouse.click(xy[0], xy[1]); await wait(80); };
    async function trace(i, colour, jit) {
      const st = await game((g, i) => g.path(i), i); await click(await game((g, c) => g.swatch(c), colour == null ? st.c : colour));
      await page.mouse.move(st.pts[0][0] + jit, st.pts[0][1] - jit); await page.mouse.down();
      for (const p of st.pts) await page.mouse.move(p[0] + jit, p[1] - jit, { steps: 2 });
      await page.mouse.up(); await wait(60);
    }
    expect(await toPaint() === 'paint', 'first customer sits down');
    await game(g => { g.calm(); g.setDesign('a heart'); });
    // 1. paint, undo, paint again
    await trace(0, null, 2); expect((await game(g => g.strokes)) === 1 && (await game(g => g.sel)) === 0, 'red stroke painted');
    await click(await game(g => g.undoXY)); expect((await game(g => g.strokes)) === 0, 'undo removes the stroke');
    await trace(0, null, 3);
    // 2. DONE: a faithful copy earns three stars, score and time
    const t0 = await game(g => g.timeLeft);
    await click(await game(g => g.doneXY));
    expect((await game(g => g.phase)) === 'mirror', 'DONE pulls back to the mirror');
    for (let i = 0; i < 30 && (await game(g => g.score)) === 0; i++) await wait(100);
    let s = await game(g => ({ r: g.result, score: g.score, served: g.served, t: g.timeLeft }));
    expect(s.r.stars === 3 && s.r.sim >= 80 && s.score >= 130 && s.served === 1 && s.t > t0 + 6, 'faithful heart: 3 stars, score, +8 s (' + JSON.stringify(s) + ')');
    expect((await state()).score === s.score, 'HUD shows the score');
    // 3. a wrong-colour scribble scores low
    expect(await toPaint() === 'paint', 'next customer sits down');
    await game(g => { g.calm(); g.setDesign('a star'); });
    const z = await game(g => g.zone()); await click(await game(g => g.swatch(4)));
    await page.mouse.move(z[0] - z[2] * .9, z[1] - z[2] * .6); await page.mouse.down();
    for (let k = 0; k < 6; k++) await page.mouse.move(z[0] + (k % 2 ? .9 : -.9) * z[2], z[1] + (k / 5 - .5) * z[2] * 1.2, { steps: 5 });
    await page.mouse.up(); const sc = await game(g => g.score);
    await click(await game(g => g.doneXY)); for (let i = 0; i < 30 && (await game(g => g.score)) === sc; i++) await wait(100);
    s = await game(g => ({ r: g.result, served: g.served }));
    expect(s.r.stars <= 1 && s.r.sim < 50 && s.served === 2, 'blue scribble on a yellow star scores low (' + JSON.stringify(s.r) + ')');
    // 4. the likeness metric itself
    const L = await game(g => {
      const rb = [{ c: 0, pts: [[-.8, .42], [-.57, -.15], [0, -.38], [.57, -.15], [.8, .42]] }];
      return { none: g.likeness('a rainbow', []).sim, part: g.likeness('a rainbow', rb).sim,
        exact: g.likeness('a lightning bolt', [{ c: 4, pts: [[.3, -.82], [-.32, .06], [.18, .06], [-.28, .84]] }]).sim,
        wrong: g.likeness('a lightning bolt', [{ c: 0, pts: [[.3, -.82], [-.32, .06], [.18, .06], [-.28, .84]] }]).sim };
    });
    expect(L.none === 0 && L.exact >= 95 && L.wrong < 40 && L.part > 10 && L.part < 60, 'likeness: exact ~100, wrong colour low, one arc of three partial (' + JSON.stringify(L) + ')');
    // 5. the clock runs out: the fair closes
    expect(await toPaint() === 'paint', 'third customer');
    await game(g => g.setTime(0.5));
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    expect((await state()).over, 'time up closes the fair');
    await wait(800); const title = await page.evaluate(() => { const h = document.querySelector('.lab-overlay h2'); return h && h.textContent; });
    expect(/fair is closing/.test(title || ''), 'neutral closing card (' + title + ')');
    const o = await state(); expect(o.best >= o.score && o.best > 0, 'best score recorded');
    await wait(900); await page.keyboard.press('Enter'); await wait(600);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.served === 0 && g.strokes === 0 && g.timeLeft > 85), 'served, strokes and clock reset');
  },
};
