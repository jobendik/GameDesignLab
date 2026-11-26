// Odd Mood: tapping the one face that differs scores and advances; a wrong tap or a burnt fuse costs a heart; six in a
// row wins one back; crowds grow; keyboard works; losing the last heart ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/06-odd-mood/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const ready = async () => { for (let k = 0; k < 120 && !(await game(g => g.ready)); k++) await wait(25); expect(await game(g => g.ready), 'crowd accepts input'); };
    const tapFolk = async i => { const p = await game((g, i) => g.pos(i), i); await page.touchscreen.tap(p.x, p.y); await wait(70); };
    const spot = async () => { await ready(); await tapFolk(await game(g => g.odd)); };
    // 1. first crowd is tiny and obvious; exactly one member has a different mood
    await ready();
    const first = await game(g => ({ n: g.count, pair: g.pair, hearts: g.hearts, fuse: g.fuseMax, moods: Array.from({ length: g.count }, (_, i) => g.moods(i)), odd: g.odd }));
    expect(first.n === 4 && first.hearts === 3 && first.fuse > 9, 'opens with 4 folk, 3 hearts and a long fuse');
    expect(first.pair[0] !== first.pair[1] && first.moods.filter(m => m !== first.pair[0]).length === 1 && first.moods[first.odd] === first.pair[1], 'exactly one odd mood in the crowd');
    await tapFolk(first.odd);
    expect(await game(g => g.cleared) === 1 && await game(g => g.streak) === 1, 'tapping the odd one clears the crowd');
    const s1 = await game(g => g.score); expect(s1 >= 50 && (await state()).score === s1, 'score increased and HUD updated');
    // 2. wrong tap costs a heart and the streak, but the crowd stays; the same wrong one cannot be punished twice
    await ready();
    const wrong = await game(g => (g.odd + 1) % g.count);
    await tapFolk(wrong);
    expect(await game(g => g.hearts) === 2 && await game(g => g.streak) === 0 && await game(g => g.phase) === 'play', 'wrong tap: −1 heart, streak reset, round continues');
    await tapFolk(wrong); expect(await game(g => g.hearts) === 2, 'already-rejected face is free');
    expect(await game(g => g.score) === s1, 'no score for wrong taps');
    // 3. the fuse really burns, and burning out costs a heart, reveals the answer and deals a fresh crowd
    const f0 = await game(g => g.fuse); await wait(500); expect((await game(g => g.fuse)) < f0 - .3, 'fuse burns during play');
    await game(g => g.setFuse(.12)); await wait(350);
    expect(await game(g => g.hearts) === 1 && await game(g => g.phase) === 'miss', 'time-out costs a heart and spotlights the odd one');
    await wait(1500); expect(await game(g => g.phase) === 'play' && await game(g => g.cleared) === 1 && (await state()).running, 'play continues with a fresh crowd');
    // 4. six in a row wins a heart back; quicker spots are worth more than slow ones; crowds grow
    for (let i = 0; i < 5; i++) await spot();
    await ready(); const b = await game(g => g.score); await wait(1800); await tapFolk(await game(g => g.odd)); const slowGain = (await game(g => g.score)) - b;
    expect(await game(g => g.streak) === 6 && await game(g => g.hearts) === 2, 'six in a row restores a heart');
    await ready(); const b2 = await game(g => g.score); await tapFolk(await game(g => g.odd)); const fastGain = (await game(g => g.score)) - b2;
    expect(fastGain > slowGain, 'a fast spot (' + fastGain + ') beats a slow one (' + slowGain + ')');
    expect(await game(g => g.cleared) === 8 && await game(g => g.count) === 12, 'crowd has grown to 12 after 8 clears');
    // 5. keyboard: arrows move a cursor over the grid, space picks
    await ready(); await page.keyboard.press('ArrowRight'); await wait(40);
    const nav = await game(g => ({ cols: g.grid[0], c: g.cursor, slot: g.pos(g.odd).slot }));
    expect(nav.c >= 0, 'keyboard cursor appears');
    const dx = nav.slot % nav.cols - nav.c % nav.cols, dy = Math.floor(nav.slot / nav.cols) - Math.floor(nav.c / nav.cols);
    for (let i = 0; i < Math.abs(dx); i++) await page.keyboard.press(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    for (let i = 0; i < Math.abs(dy); i++) await page.keyboard.press(dy > 0 ? 'ArrowDown' : 'ArrowUp');
    await page.keyboard.press('Space'); await wait(80);
    expect(await game(g => g.cleared) === 9, 'space picks the face under the cursor');
    // 6. losing the last heart ends the run
    await ready(); const c = await game(g => g.count), o = await game(g => g.odd);
    await tapFolk((o + 1) % c); await tapFolk((o + 2) % c);
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const s = await state(); expect(s.over && await game(g => g.hearts) === 0, 'no hearts left ends the run');
    expect(s.best === s.score && s.score > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(600);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.cleared === 0 && g.hearts === 3 && g.streak === 0 && g.count === 4 && g.phase === 'play'), 'state fully reset');
  },
};
