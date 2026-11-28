// Chip Off: a real tap chips one cell and spends a chisel; spare ice cut off from the stand falls as a chunk and scores
// (with "Timber!" doubling for 5+); hold previews exactly what falls and releasing chips; chipping a sculpture neck drops
// part of the sculpture; hard ice takes two hits; sweets in a falling chunk are caught; a finished sculpture is judged
// (cards, points) and the next one starts; poor sculptures melt snowflakes and three end the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/chip-off/index.html',
  timeout: 70000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let r = await game(g => ({ sh: g.shape, ch: g.chisels, b: g.budget, ph: g.phase, h: g.hearts }));
    expect(r.sh === 'Heart' && r.ch === r.b && r.b >= 10 && r.ph === 'carve' && r.h === 3, 'first sculpture: the Heart, full chisels, three snowflakes');
    await game(g => g.load(0, { hard: 0, gems: 0 }));
    const b0 = await game(g => g.chisels); let p = await game(g => g.xy(0, 0));
    await page.touchscreen.tap(p[0], p[1]); await wait(150);
    r = await game(g => ({ c: g.grid()[0][0], ch: g.chisels, n: g.chunks })); expect(r.c === -1 && r.ch === b0 - 1 && r.n === 0, 'a tap chips one cell and spends one chisel');
    // cut the spare ice's feet: after three bottom chips, the last foot holds everything
    await game(g => { g.chip(8, 0); g.chip(8, 1); g.chip(8, 5); });
    const pv = await game(g => g.preview(8, 6)), spare = await game(g => g.grid().flat().filter(v => v === 0).length);
    expect(pv.lost === 0 && pv.gone === spare && pv.falls === spare - 1, 'preview: the last foot holds all remaining spare ice');
    p = await game(g => g.xy(8, 6)); const s0 = await game(g => g.score);
    await page.mouse.move(p[0], p[1]); await page.mouse.down(); await wait(150);
    expect(JSON.stringify(await game(g => g.press)) === '[8,6]', 'holding a cell previews it');
    await page.mouse.up(); await wait(100);
    r = await game(g => ({ s: g.score, n: g.chunks, sp: g.grid().flat().filter(v => v === 0).length, sh: g.grid().flat().filter(v => v === 1).length, ph: g.phase }));
    expect(r.sp === 0 && r.sh === 25 && r.n >= 1, 'releasing chips the foot: every spare block falls, the sculpture stands');
    expect(r.s >= s0 + (spare - 1) * 5 && r.ph === 'judge', 'falling chunks score (Timber! doubles) and the sculpture goes to the judges');
    await wait(1200); r = await game(g => ({ cards: g.cards, s: g.score }));
    expect(r.cards && r.cards.every(v => v >= 9), 'the judges hold up high cards for a perfect sculpture');
    await wait(150); expect((await state()).score === r.s, 'HUD shows the score');
    for (let i = 0; i < 30 && (await game(g => g.round)) === 0; i++) await wait(150);
    r = await game(g => ({ rd: g.round, sh: g.shape, ch: g.chisels, b: g.budget, ph: g.phase })); expect(r.rd === 1 && r.sh === 'Pine Tree' && r.ch === r.b && r.ph === 'carve', 'next sculpture: the Pine Tree');
    // chipping the heart's neck drops the top of the sculpture
    await game(g => g.load(0, { hard: 0, gems: 0 })); r = await game(g => { const pv = g.preview(4, 3); g.chip(4, 3); return { pv, sh: g.grid().flat().filter(v => v === 1).length }; });
    expect(r.pv.lost > 10 && r.sh === 25 - r.pv.lost, 'chipping a sculpture neck drops the part above it');
    // hard ice takes two hits; sweets in a falling chunk are caught
    await game(g => g.load(1, { hard: 3, gems: 0, round: 2 }));
    const hc = await game(g => { const G = g.grid(); for (let r = 0; r < 9; r++) for (let c = 0; c < 7; c++) if (G[r][c] === 2) return [r, c]; });
    await game((g, a) => g.chip(a[0], a[1]), hc); expect(await game((g, a) => g.grid()[a[0]][a[1]], hc) === 0, 'first hit only cracks hard ice');
    await game((g, a) => g.chip(a[0], a[1]), hc); expect(await game((g, a) => g.grid()[a[0]][a[1]], hc) === -1, 'second hit breaks it');
    await game(g => { g.load(0, { hard: 0, gems: 0 }); g.gem(5, 0); g.chip(8, 0); g.chip(8, 1); g.chip(8, 5); g.chip(8, 6); });
    for (let i = 0; i < 20 && (await game(g => g.sweets)) === 0; i++) await wait(100);
    expect(await game(g => g.sweets) === 1, 'a sweet in a falling chunk is caught');
    // poor sculptures: time runs out with the spare ice still on → a snowflake melts; three end the run
    for (let k = 0; k < 4 && !(await state()).over; k++) {
      await until(); await game(g => { g.load(2, { hard: 0, gems: 0 }); g.setTime(.05); }); await wait(3300);
      if (k === 0) expect(await game(g => g.hearts) === 2, 'a poorly carved sculpture melts a snowflake');
    }
    async function until() { for (let i = 0; i < 30 && (await game(g => g.phase)) !== 'carve'; i++) await wait(150); }
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over && await game(g => g.hearts) === 0, 'three melted snowflakes end the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.round === 0 && g.shape === 'Heart' && g.chunks === 0 && g.sweets === 0 && g.chisels === g.budget), 'snowflakes, round, chisels and counters reset');
  },
};
