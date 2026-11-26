// Misfired: tapping the off-shade tile scores, stokes the timer and advances the batch; wrong taps burn time and break
// the streak; the grid grows and the shade gap shrinks; keyboard works; the kiln running cold ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/05-misfired/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const ready = async () => { for (let k = 0; k < 80 && !(await game(g => g.ready)); k++) await wait(25); expect(await game(g => g.ready), 'board accepts input'); };
    const tapTile = async i => { const r = await game((g, i) => g.rect(i), i); await page.touchscreen.tap(r.x, r.y); await wait(60); };
    // 1. a real touch on the misfired tile scores and moves to the next batch
    await ready();
    expect(await game(g => g.size) === 2 && await game(g => g.gap) > .1, 'first batch is a trivially easy 2×2');
    await tapTile(await game(g => g.odd));
    expect(await game(g => g.found) === 1, 'correct tile counts as found');
    const s1 = await game(g => g.score); expect(s1 > 0 && (await state()).score === s1, 'score increased and HUD updated');
    expect(await game(g => g.shelf) === 1 && await game(g => g.streak) === 1, 'trophy shelf and streak advance');
    // 2. a wrong tile burns time, breaks the streak, scores nothing; re-tapping the cracked tile is free
    await ready();
    const wrong = await game(g => (g.odd + 1) % (g.size * g.size)), t0 = await game(g => g.time);
    await tapTile(wrong);
    const t1 = await game(g => g.time);
    expect(t1 < t0 - 2.3 && t1 > t0 - 3.2, 'wrong pick costs about 2.5 s (' + (t0 - t1).toFixed(2) + ')');
    expect(await game(g => g.streak) === 0 && await game(g => g.found) === 1 && await game(g => g.score) === s1, 'wrong pick resets streak, no score');
    await tapTile(wrong);
    expect(await game(g => g.time) > t1 - .5 && await game(g => g.wrongs) === 1, 'cracked tile cannot be punished twice');
    // 3. a run of correct picks: time is refilled, the grid grows, the gap shrinks, the multiplier kicks in
    const gap0 = await game(g => g.gap); let lastGain = 0;
    for (let i = 0; i < 11; i++) { await ready(); const b = await game(g => g.score); await tapTile(await game(g => g.odd)); lastGain = (await game(g => g.score)) - b; expect(lastGain > 0, 'pick ' + i + ' scored'); }
    expect(await game(g => g.found) === 12 && await game(g => g.size) === 5, 'grid has grown to 5×5 after 12 finds');
    expect(await game(g => g.gap) < gap0 * .6, 'shade gap shrinks as batches go by');
    expect(await game(g => g.streak) === 11 && lastGain > 60, 'streak multiplier boosts gains (' + lastGain + ')');
    expect(await game(g => g.time) > 17, 'correct picks stoke the timer');
    // 4. keyboard: arrows move a cursor, space picks
    await ready();
    await page.keyboard.press('ArrowRight'); await wait(40);
    const nav = await game(g => ({ n: g.size, c: g.cursor, o: g.odd }));
    expect(nav.c >= 0, 'keyboard cursor appears');
    const dx = nav.o % nav.n - nav.c % nav.n, dy = Math.floor(nav.o / nav.n) - Math.floor(nav.c / nav.n);
    for (let i = 0; i < Math.abs(dx); i++) await page.keyboard.press(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    for (let i = 0; i < Math.abs(dy); i++) await page.keyboard.press(dy > 0 ? 'ArrowDown' : 'ArrowUp');
    await wait(40); expect(await game(g => g.cursor === g.odd), 'cursor reached the odd tile');
    await page.keyboard.press('Space'); await wait(80);
    expect(await game(g => g.found) === 13, 'space picks the tile under the cursor');
    // 5. the clock really drains, and running out ends the run with the answer revealed
    await ready(); await wait(500); const d0 = await game(g => g.time); await wait(600);
    expect((await game(g => g.time)) < d0 - .3, 'timer drains during play');
    await game(g => g.setTime(.25));
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const s = await state(); expect(s.over, 'running out of heat ends the run');
    expect(s.best === s.score && s.score > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.found === 0 && g.size === 2 && g.streak === 0 && g.shelf === 0 && g.time > 14 && g.phase === 'play'), 'state fully reset');
  },
};
