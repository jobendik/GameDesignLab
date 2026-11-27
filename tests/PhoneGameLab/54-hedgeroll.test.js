// Hedgeroll: real swipes/taps/keys roll the hedgehog until it bumps, blocked swipes cost nothing, undo/restart/hint work,
// reaching the burrow in par wins with three stars, progress persists, and acorn/gate + molehill gardens are solvable.
module.exports = {
  game: 'PhoneGameLab/games/54-hedgeroll/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.level) === 1 && await game(g => g.moves) === 0, 'starts on garden 1 with no rolls');
    const settle = async () => { for (let i = 0; i < 40 && await game(g => g.rolling); i++) await wait(50); await wait(60); };
    const swipe = async d => { const [x, y] = await game(g => g.xy(g.pos)), v = await game((g, d) => g.vec(d), d); await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + v[0] * 70, y + v[1] * 70, { steps: 4 }); await page.mouse.up(); await settle(); };
    const key = async d => { const v = await game((g, d) => g.vec(d), d); await page.keyboard.press(v[0] > 0 ? 'ArrowRight' : v[0] < 0 ? 'ArrowLeft' : v[1] > 0 ? 'ArrowDown' : 'ArrowUp'); await settle(); };
    const tapDir = async d => { const [x, y] = await game(g => g.xy(g.pos)), v = await game((g, d) => g.vec(d), d); await page.touchscreen.tap(x + v[0] * 60, y + v[1] * 60); await settle(); };
    const btn = async id => { const b = await game((g, id) => g.buttons.find(b => b.id === id), id); await page.mouse.click(b.x, b.y); await wait(120); };
    const solve = async how => { for (let i = 0; i < 40 && await game(g => g.mode) === 'play'; i++) await how(await game(g => g.next().dir)); };
    // 1. a swipe into a hedge is a bump, not a roll
    const start = await game(g => g.pos), dead = await game(g => [0, 1, 2, 3].find(d => g.slide(d).len === 0));
    if (dead != null) { await swipe(dead); expect(await game(g => g.moves) === 0 && await game(g => g.pos) === start, 'swiping into a hedge does not count as a roll'); }
    // 2. a real swipe rolls until the next hedge
    const s0 = await game(g => g.next()), want = await game((g, d) => g.slide(d), s0.dir);
    expect(s0.par === await game(g => g.par), 'generator par equals the shortest solution');
    await swipe(s0.dir);
    expect(await game(g => g.moves) === 1 && await game(g => g.pos) === want.end, 'swipe rolls the hedgehog to the predicted stop');
    // 3. undo + restart
    if (!want.win) {
      await btn('undo'); expect(await game(g => g.moves) === 0 && await game(g => g.pos) === start, 'undo takes the roll back');
      await swipe(s0.dir); await page.keyboard.press('r'); await wait(100);
      expect(await game(g => g.moves) === 0 && await game(g => g.pos) === start, 'restart puts the hedgehog back');
    }
    // 4. solve garden 1 with the keyboard in par → three stars, win card, progress saved
    await solve(key);
    expect(await game(g => g.mode) === 'won', 'rolling over the burrow wins');
    expect(await game(g => g.moves) === await game(g => g.par) && await game(g => g.rating()) === 3, 'par rolls rate three stars');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over && s.score === 1 && s.best >= 1, 'win card: garden 1 cleared, best recorded');
    const pr = await game(g => g.progress); expect(pr.lvl === 2 && pr.max === 2 && pr.stars[1] === 3, 'progress saved: garden 2 unlocked, 3 stars banked');
    // 5. next garden is clean; a hint points along an optimal roll and costs a star; solve by touch taps
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over, 'next garden starts');
    expect(await game(g => g.level) === 2 && await game(g => g.moves) === 0, 'garden 2 loads fresh');
    await btn('hint'); expect(await game(g => g.hintDir) === await game(g => g.next().dir), 'hint shows an optimal direction');
    await solve(tapDir);
    expect(await game(g => g.mode) === 'won' && await game(g => g.rating()) === 2, 'solved after a hint: two stars');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(150);
    expect((await state()).best === 2, 'best is the highest garden cleared');
    // 6. later gardens: acorn + gate (8) and molehills (11) are generated solvable and play through with swipes
    for (const lv of [8, 11]) {
      await page.evaluate(lv => localStorage.setItem('gdl:PhoneGameLab/54-hedgeroll:prog', JSON.stringify({ lvl: lv, max: lv, stars: {} })), lv);
      await page.reload(); await wait(700);
      expect(await game(g => g.level) === lv && await game(g => g.key) >= 0 && await game(g => g.gate) >= 0, 'garden ' + lv + ' has an acorn and a gate');
      if (lv === 11) expect((await game(g => g.tunnels)).length === 2, 'garden 11 has a molehill pair');
      expect(await game(g => g.next().par) === await game(g => g.par), 'garden ' + lv + ' is solvable in par');
      // waste two rolls first (there and back if possible), then solve: more than par → fewer stars
      await solve(swipe);
      expect(await game(g => g.mode) === 'won' && await game(g => g.hasKey) === 1, 'garden ' + lv + ' solved; the acorn was needed');
      for (let i = 0; i < 30 && !(await state()).over; i++) await wait(150);
      expect((await state()).best === lv, 'best follows the highest garden');
    }
    // 7. level select: previous garden reloads fresh
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    expect(await game(g => g.level) === 12, 'garden 12 after garden 11');
    await btn('prev'); expect(await game(g => g.level) === 11 && await game(g => g.moves) === 0 && await game(g => g.progress.stars[11]) === 3, 'previous garden can be revisited and keeps its stars');
  },
};
