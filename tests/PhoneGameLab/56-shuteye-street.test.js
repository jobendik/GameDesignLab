// Shuteye Street: a knock flips exactly the window's neighbourhood, sliding off cancels, undo/restart/hint work, darkening the
// house in par wins three stars, progress persists, and diagonal / all-around / three-step-lamp houses solve via the solver.
module.exports = {
  game: 'PhoneGameLab/games/56-shuteye-street/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.level) === 1 && await game(g => g.lit) > 0 && await game(g => g.moves) === 0, 'house 1 starts with lamps on');
    const btn = async id => { const b = await game((g, id) => g.buttons.find(b => b.id === id), id); await page.mouse.click(b.x, b.y); await wait(120); };
    const xy = i => game((g, i) => g.xy(i), i);
    const tap = async i => { const [x, y] = await xy(i); await page.touchscreen.tap(x, y); await wait(70); };
    const over = async () => { for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150); return state(); };
    const jump = async lv => { await page.evaluate(lv => localStorage.setItem('gdl:PhoneGameLab/56-shuteye-street:prog', JSON.stringify({ lvl: lv, max: lv, stars: {} })), lv); await page.reload(); await wait(700); };
    const solveTaps = async () => { const x = await game(g => g.solution()); for (let i = 0; i < x.length; i++) for (let k = 0; k < x[i]; k++) await tap(i); };
    // 1. a knock flips the window and its orthogonal neighbours — nothing else; undo restores
    const sol = await game(g => g.solution()), before = await game(g => g.cells);
    expect(sol.reduce((a, b) => a + b, 0) === await game(g => g.par), 'par equals the solver optimum');
    const other = sol.findIndex(v => v === 0), nb = await game((g, i) => g.nb(i), other);
    const [ox, oy] = await xy(other); await page.mouse.click(ox, oy); await wait(80);
    const after = await game(g => g.cells);
    expect(after.every((v, i) => nb.includes(i) ? v === 1 - before[i] : v === before[i]) && await game(g => g.moves) === 1, 'knock flips exactly the neighbourhood');
    expect(nb.length >= 3 && nb.length <= 5 && nb.includes(other), 'neighbourhood is the window plus its side/up/down neighbours');
    await btn('undo'); expect(JSON.stringify(await game(g => g.cells)) === JSON.stringify(before) && await game(g => g.moves) === 0, 'undo restores the house');
    // 2. press, slide off the window, release: no knock
    const far = nb.find(i => i !== other), [fx2, fy2] = await xy(far);
    await page.mouse.move(ox, oy); await page.mouse.down(); await page.mouse.move(fx2, fy2, { steps: 4 }); await page.mouse.up(); await wait(80);
    expect(await game(g => g.moves) === 0 && JSON.stringify(await game(g => g.cells)) === JSON.stringify(before), 'sliding off a window cancels the knock');
    // 3. solve in par with touch → three stars, win card, progress
    await solveTaps();
    expect(await game(g => g.lit) === 0 && await game(g => g.mode) === 'won', 'every window dark wins');
    expect(await game(g => g.rating()) === 3, 'par knocks rate three stars');
    const s = await over(); expect(s.over && s.score === 1 && s.best >= 1, 'win card: house 1, best recorded');
    const pr = await game(g => g.progress); expect(pr.lvl === 2 && pr.max === 2 && pr.stars[1] === 3, 'progress saved');
    // 4. house 2: hint marks a correct knock (costs a star); finish with the keyboard cursor
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    expect((await state()).running && await game(g => g.level) === 2 && await game(g => g.moves) === 0, 'house 2 loads fresh');
    await btn('hint'); const h = await game(g => g.hint); expect(h >= 0 && (await game(g => g.solution()))[h] > 0, 'hint marks a knock from an optimal solution');
    const cols = await game(g => g.cols);
    for (let guard = 0; guard < 12 && await game(g => g.mode) === 'play'; guard++) {
      const t = (await game(g => g.solution())).findIndex(v => v > 0);
      for (let j = 0; j < 12; j++) { const c = await game(g => g.cursor); if (c === t) break; const dc = t % cols - c % cols, dr = Math.floor(t / cols) - Math.floor(c / cols); await page.keyboard.press(dc > 0 ? 'ArrowRight' : dc < 0 ? 'ArrowLeft' : dr > 0 ? 'ArrowDown' : 'ArrowUp'); }
      await page.keyboard.press('Space'); await wait(60);
    }
    expect(await game(g => g.mode) === 'won' && await game(g => g.moves) === await game(g => g.par) && await game(g => g.rating()) === 2, 'keyboard solve in par after a hint: two stars');
    expect((await over()).best === 2, 'best is the highest house cleared');
    // 5. three-step lamps (house 11): a knock steps bright → dim → off → bright; three knocks cycle; restart resets
    await jump(11);
    expect(await game(g => g.steps) === 3 && (await game(g => g.cells)).some(v => v === 2), 'house 11 has three-step lamps');
    const b3 = await game(g => g.cells), n3 = await game(g => g.nb(5));
    await tap(5); const a3 = await game(g => g.cells);
    expect(a3.every((v, i) => n3.includes(i) ? v === (b3[i] + 2) % 3 : v === b3[i]), 'a knock steps each lamp one notch darker (off wraps to bright)');
    await tap(5); await tap(5);
    expect(JSON.stringify(await game(g => g.cells)) === JSON.stringify(b3) && await game(g => g.moves) === 3, 'three knocks come full circle');
    await tap(0); await page.keyboard.press('r'); await wait(80);
    expect(JSON.stringify(await game(g => g.cells)) === JSON.stringify(b3) && await game(g => g.moves) === 0, 'restart resets the house');
    await solveTaps(); expect(await game(g => g.mode) === 'won' && await game(g => g.rating()) === 3, 'three-step house solved in par');
    await over();
    // 6. diagonal house (7) and busybody house (16); wasted knocks cost stars
    await jump(7);
    const d7 = await game(g => g.nb(5)), c7 = await game(g => g.cols);
    expect(await game(g => g.shape) === 1 && d7.every(i => i === 5 || (Math.abs(i % c7 - 5 % c7) === 1 && Math.abs(Math.floor(i / c7) - Math.floor(5 / c7)) === 1)), 'house 7: knocks carry diagonally');
    await solveTaps(); expect(await game(g => g.mode) === 'won', 'diagonal house solved'); await over();
    await jump(16);
    expect(await game(g => g.shape) === 2 && (await game(g => g.nb(5))).length === 9, 'house 16: all eight neighbours flip');
    await tap(0); await tap(0); await tap(3); await tap(3);
    expect(await game(g => g.moves) === 4, 'four wasted knocks counted');
    await solveTaps(); expect(await game(g => g.mode) === 'won' && await game(g => g.rating()) === 1, 'far over par: one star');
    expect((await over()).best === 16, 'best follows the highest house');
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    expect(await game(g => g.level) === 17 && await game(g => g.moves) === 0, 'next house loads clean');
  },
};
