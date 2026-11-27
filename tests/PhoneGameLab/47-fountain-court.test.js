// Fountain Court: taps turn tiles, water floods to fountains, leaks block the win, mossy tiles are fixed,
// twins turn together, undo/reset/hint work, solving wins, progress + best persist and the next court is clean.
module.exports = {
  game: 'PhoneGameLab/games/47-fountain-court/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.level) === 1 && !(await game(g => g.solved)), 'court 1 starts unsolved');
    const tapTile = async i => { const [x, y] = await game((g, i) => g.xy(i), i); await page.touchscreen.tap(x, y); await wait(60); };
    const tapBtn = async id => { const b = await game((g, id) => g.buttons.find(b => b.id === id), id); await page.touchscreen.tap(b.x, b.y); await wait(120); };
    const todo = async () => (await game(g => g.tiles)).map((T, i) => [i, T]).filter(([i, T]) => !T.lock && T.need && (T.twin < 0 || T.twin > i));
    // 1. a tap turns a tile a quarter turn and counts
    let list = await todo(); expect(list.length >= 2, 'court 1 has turned tiles');
    const [i0, T0] = list[0];
    await tapTile(i0);
    expect(await game((g, i) => g.tiles[i].rot, i0) === (T0.rot + 1) % 4 && await game(g => g.taps) === 1, 'tap rotates the tile clockwise and counts one tap');
    await tapBtn('undo');
    expect(await game((g, i) => g.tiles[i].rot, i0) === T0.rot && await game(g => g.taps) === 0, 'undo turns it back');
    // the spring itself never turns
    const src = (await game(g => g.tiles)).findIndex(T => T.lock && T.type);
    await tapTile(src); expect(await game(g => g.taps) === 0, 'the spring is fixed');
    // 2. over-rotate then reset
    await tapTile(i0); await tapTile(i0); await tapTile(i0); await tapTile(i0); await tapTile(i0);
    expect(await game(g => g.taps) === 5, 'five taps counted');
    await tapBtn('reset'); expect(await game(g => g.taps) === 0 && await game((g, i) => g.tiles[i].rot, i0) === T0.rot, 'reset restores the court');
    // 3. solve all but one tile: fountains/leaks reflect the open channel, no win yet
    list = await todo(); const par = await game(g => g.par);
    for (const [i, T] of list.slice(0, -1)) for (let k = 0; k < T.need; k++) await tapTile(i);
    await wait(900);
    expect(!(await game(g => g.solved)) && await game(g => g.mode) === 'play', 'one wrong tile keeps the court unsolved');
    const f = await game(g => g.fountains), lk = await game(g => g.leaks); expect(f[0] < f[1] || lk > 0, 'a dry fountain or a leak remains');
    const [iL, TL] = list[list.length - 1]; for (let k = 0; k < TL.need; k++) await tapTile(iL);
    expect(await game(g => g.solved) && await game(g => g.taps) === par, 'last tile solves the court exactly on par');
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over && s.score === 1 && s.best >= 1, 'water reaches every fountain → win card, best recorded');
    const pr = await game(g => g.progress); expect(pr.lvl === 2 && pr.stars[1] === 3, 'progress saved with three stars');
    // 4. next court clean
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over, 'next court starts');
    expect(await game(g => g.level) === 2 && await game(g => g.taps) === 0 && !(await game(g => g.solved)), 'court 2 loads fresh');
    // 5. mossy tiles + twins + hint on a later court (reached through the level hook, as a returning player would be)
    await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('gdl:PhoneGameLab/47-fountain-court:prog')); p.max = 13; localStorage.setItem('gdl:PhoneGameLab/47-fountain-court:prog', JSON.stringify(p)); });
    await page.reload(); await wait(700); await game(g => g.go(13)); await wait(200);
    const tl = await game(g => g.tiles), moss = tl.findIndex((T, i) => T.lock && T.type > 1), tw = tl.findIndex(T => T.twin >= 0);
    expect(moss >= 0 && tw >= 0, 'court 13 has mossy tiles and twins');
    await tapTile(moss); expect(await game(g => g.taps) === 0 && await game((g, i) => g.tiles[i].rot, moss) === tl[moss].rot, 'mossy tile does not turn');
    await tapTile(tw); const after = await game(g => g.tiles);
    expect(after[tw].rot === (tl[tw].rot + 1) % 4 && after[tl[tw].twin].rot === (tl[tl[tw].twin].rot + 1) % 4 && await game(g => g.taps) === 1, 'twins turn together for one tap');
    await tapBtn('undo'); await tapBtn('hint');
    expect(await game(g => g.hints) === 1 && await game(g => g.rating()) <= 2, 'hint fixes a tile and costs a star');
    for (const [i, T] of await todo()) for (let k = 0; k < T.need; k++) await tapTile(i);
    expect(await game(g => g.solved), 'court 13 solved by turning every tile as needed');
    for (let i = 0; i < 60 && !(await state()).over; i++) await wait(150);
    const s2 = await state(); expect(s2.over && s2.best === 13, 'best is the highest court cleared');
  },
};
