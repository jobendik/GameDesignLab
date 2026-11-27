// Soundings: the first tap is always safe and opens water, the generated chart is finished with real taps using only what the
// numbers prove (no guess), hold / Buoy-switch flags, chord + quick-buoy work, hitting a reef loses, a cleared size records a
// per-size best time and unlocks the next size, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/57-soundings/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.size) === 0 && !(await game(g => g.generated)) && (await game(g => g.rev)).every(v => !v), 'starts on an untouched Cove');
    const xy = i => game((g, i) => g.xy(i), i);
    const tap = async i => { const [x, y] = await xy(i); await page.touchscreen.tap(x, y); await wait(60); };
    const hold = async i => { const [x, y] = await xy(i); await page.mouse.move(x, y); await page.mouse.down(); await wait(460); await page.mouse.up(); await wait(60); };
    const btn = async id => { const b = await game((g, id) => g.buttons.find(b => b.id === id), id); await page.touchscreen.tap(b.x, b.y); await wait(100); };
    const over = async () => { for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150); return state(); };
    const snap = () => game(g => ({ mines: g.mines, nums: g.nums, rev: g.rev, flags: g.flags, left: g.left, K: g.proven(), nbs: g.rev.map((_, i) => g.nb(i)) }));
    // 1. spyglass does nothing before the first sounding; the first tap (a corner) is safe and opens its whole neighbourhood
    await btn('spy'); expect(await game(g => g.hint) === null && await game(g => g.time) === 0, 'spyglass waits for the first sounding');
    await tap(0);
    let s = await snap();
    expect(await game(g => g.generated) && s.rev[0] === 1 && s.mines[0] === 0 && s.nbs[0].every(j => s.rev[j] && !s.mines[j]), 'first tap is safe and opens the squares around it');
    expect(s.mines.reduce((a, b) => a + b, 0) === await game(g => g.reefs), 'the chart holds the advertised number of reefs');
    expect(await game(g => g.noGuess), 'generated chart is solvable without guessing');
    // 2. hold = buoy (and hold again lifts it); a buoyed square cannot be sounded; sliding off cancels a tap
    const reef = s.mines.findIndex(v => v), safeHidden = s.rev.findIndex((v, i) => !v && !s.mines[i]);
    await hold(reef); expect((await game(g => g.flags))[reef] === 1 && (await game(g => g.rev))[reef] === 0, 'holding a square drops a buoy without sounding it');
    await tap(reef); expect(await game(g => g.mode) === 'play' && (await game(g => g.rev))[reef] === 0, 'a buoyed reef is protected from taps');
    await hold(reef); expect((await game(g => g.flags))[reef] === 0, 'holding again lifts the buoy');
    const [sx, sy] = await xy(safeHidden); await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx + 40, sy + 30, { steps: 3 }); await page.mouse.up(); await wait(60);
    expect((await game(g => g.rev))[safeHidden] === 0, 'dragging off a square cancels the sounding');
    // 3. finish the chart using only proven squares: Buoy switch for reefs, quick-buoy and chord on numbers, taps for clear water
    let chorded = 0, quick = 0, steps = 0;
    for (; steps < 120 && await game(g => g.mode) === 'play'; steps++) {
      s = await snap(); const hid = i => s.nbs[i].filter(j => !s.rev[j]);
      const q = s.rev.findIndex((v, i) => v && s.nums[i] && hid(i).length === s.nums[i] && hid(i).some(j => !s.flags[j]));
      if (q >= 0) { await tap(q); const f = await game(g => g.flags); expect(hid(q).every(j => f[j]), 'tapping a number whose hidden squares are all reefs buoys them'); quick++; continue; }
      const r = s.K.findIndex((v, i) => v === 2 && !s.flags[i]);
      if (r >= 0) { await btn('buoy'); expect(await game(g => g.flagMode), 'Buoy switch on'); await tap(r); await btn('sound'); expect((await game(g => g.flags))[r] === 1 && !(await game(g => g.flagMode)), 'in Buoy mode a tap drops a buoy'); continue; }
      const ch = s.rev.findIndex((v, i) => v && s.nums[i] && hid(i).filter(j => s.flags[j]).length === s.nums[i] && hid(i).some(j => !s.flags[j]) && hid(i).every(j => s.flags[j] === s.mines[j]));
      if (ch >= 0) { await tap(ch); const rv = await game(g => g.rev); expect(hid(ch).every(j => s.flags[j] || rv[j]), 'tapping a satisfied number sounds the rest around it'); chorded++; continue; }
      const c = s.K.findIndex((v, i) => v === 1 && !s.rev[i]);
      expect(c >= 0, 'the numbers always prove a next move (no guess needed), ' + s.left + ' left');
      await tap(c);
    }
    expect(await game(g => g.mode) === 'won' && await game(g => g.left) === 0, 'all open water sounded: chart complete');
    expect(chorded + quick > 0, 'number shortcuts were used during the solve');
    const t = await game(g => g.time); expect(t > 0, 'the clock ran');
    const w = await over(), stw = await game(g => g.store);
    expect(w.over && typeof stw.best[0] === 'number' && Math.abs(stw.best[0] - t) < .2, 'best time recorded for the Cove');
    expect(stw.unl === 1, 'clearing the Cove unlocks the Bay');
    expect(typeof w.best === 'number' && Math.floor(w.best / 1e5) === 3 && /^\d+:\d\d$/.test(String(w.score)), 'engine best encodes size + time; HUD shows the clock');
    // 4. new chart is clean; pick the Bay; a locked size refuses
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    const r0 = await state(); expect(r0.running && !r0.over && !(await game(g => g.generated)) && await game(g => g.time) === 0 && (await game(g => g.rev)).every(v => !v) && (await game(g => g.flags)).every(v => !v), 'restart gives an untouched chart');
    await btn('size2'); expect(await game(g => g.size) === 0, 'the Strait is still locked');
    await btn('size1'); expect(await game(g => g.size) === 1 && await game(g => g.cols) === 7 && await game(g => g.rows) === 9, 'Bay selected: 7×9');
    // 5. spyglass marks a square the clues settle and costs 15 s; sounding a reef loses and records nothing
    const mid = 4 * 7 + 3; await tap(mid); await wait(300);
    const t1 = await game(g => g.time); await btn('spy'); const h = await game(g => g.hint), m2 = await game(g => g.mines);
    expect(h && (h.kind === 1 ? m2[h.i] === 0 : m2[h.i] === 1), 'spyglass hint is true to the chart');
    expect(await game(g => g.time) >= t1 + 15, 'spyglass adds 15 s');
    const rv2 = await game(g => g.rev), boom = m2.findIndex(v => v);
    await page.keyboard.press('t'); expect(await game(g => g.flagMode), 'T flips the switch to Buoy');
    await hold(boom);                                                // in Buoy mode a hold sounds the square
    expect(await game(g => g.mode) === 'lost', 'sounding a reef runs aground');
    const l = await over(), stl = await game(g => g.store);
    expect(l.over && stl.best[1] == null && l.best === w.best, 'a wreck records no time');
    expect(rv2.filter(v => v).length >= 9, 'the Bay opening was at least the 3×3 around the tap');
    await wait(1400); await page.keyboard.press('Enter'); await wait(500);
    expect((await state()).running && await game(g => g.size) === 1 && !(await game(g => g.generated)) && await game(g => g.mode) === 'play' && !(await game(g => g.flagMode)), 'retry: fresh Bay, switch back on Sound');
  },
};
