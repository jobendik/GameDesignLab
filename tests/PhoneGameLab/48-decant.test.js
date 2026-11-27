// Decant: taps select and pour (only onto the same flavour / into an empty), sizes and murky layers behave,
// undo/restart/hint work, the solver's route really sorts the shelf → win, progress + best persist, next shelf clean.
module.exports = {
  game: 'PhoneGameLab/games/48-decant/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.level) === 1 && await game(g => g.pours) === 0, 'shelf 1 starts untouched');
    const tapB = async i => { const b = await game((g, i) => g.bottles[i], i); await page.touchscreen.tap(b.x, b.y); await wait(50); };
    const idle = async () => { for (let i = 0; i < 80 && await game(g => g.busy); i++) await wait(50); };
    const tapBtn = async id => { const b = await game((g, id) => g.buttons.find(b => b.id === id), id); await page.touchscreen.tap(b.x, b.y); await wait(120); };
    const playOut = async () => { const sol = await game(g => g.solution()); expect(sol && sol.length > 0, 'solver finds a route'); for (const [a, b] of sol) { await tapB(a); await tapB(b); await idle(); } return sol.length; };
    // 1. select / deselect, and a real pour moves the top run
    const b0 = await game(g => g.bottles), sol = await game(g => g.solution()), [a, b, n] = sol[0];
    await tapB(a); expect(await game(g => g.sel) === a, 'tap selects a bottle');
    await tapB(a); expect(await game(g => g.sel) === -1, 'tapping it again puts it down');
    await tapB(a); await tapB(b); expect(await game(g => g.busy), 'pour animation plays'); await idle();
    const b1 = await game(g => g.bottles);
    expect(b1[a].st.length === b0[a].st.length - n && b1[b].st.length === b0[b].st.length + n && await game(g => g.pours) === 1, 'pour moves the whole top run and counts once');
    // 2. an illegal pour (onto a different flavour or a full bottle) changes nothing
    const bad = []; for (let x = 0; x < b1.length; x++) for (let y = 0; y < b1.length; y++) if (x !== y && b1[x].st.length && b1[y].st.length && !(await game((g, p) => g.legal(p[0], p[1]), [x, y]))) bad.push([x, y]);
    if (bad.length) { await tapB(bad[0][0]); await tapB(bad[0][1]); await wait(150); expect(await game(g => g.pours) === 1 && !(await game(g => g.busy)), 'pouring onto another flavour is refused'); if (await game(g => g.sel) >= 0) await tapB(await game(g => g.sel)); }
    // 3. undo + restart
    await tapBtn('undo'); const b2 = await game(g => g.bottles);
    expect(await game(g => g.pours) === 0 && JSON.stringify(b2.map(x => x.st)) === JSON.stringify(b0.map(x => x.st)), 'undo pours it back');
    await tapB(a); await tapB(b); await idle(); await tapBtn('restart');
    expect(await game(g => g.pours) === 0 && JSON.stringify((await game(g => g.bottles)).map(x => x.st)) === JSON.stringify(b0.map(x => x.st)), 'restart restores the shelf');
    // 4. sort shelf 1 → win
    const par = await game(g => g.par), used = await playOut();
    expect(await game(g => g.mode) === 'won' && (await game(g => g.bottles)).every(x => !x.st.length || x.done), 'every bottle is one flavour, brim-full');
    expect(used >= par, 'par is never above the route the solver itself finds');
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over && s.score === 1 && s.best >= 1, 'win card: shelf 1 cleared, best recorded');
    expect((await game(g => g.progress)).lvl === 2, 'progress saved');
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && await game(g => g.level) === 2 && await game(g => g.pours) === 0, 'next shelf loads clean');
    // 5. sizes (shelf 4) and murky layers (shelf 6), as a returning player
    await page.evaluate(() => { const k = 'gdl:PhoneGameLab/48-decant:prog', p = JSON.parse(localStorage.getItem(k)); p.max = 6; localStorage.setItem(k, JSON.stringify(p)); });
    await page.reload(); await wait(700); await game(g => g.go(4)); await wait(200);
    expect(new Set((await game(g => g.bottles)).map(x => x.cap)).size > 1, 'shelf 4 mixes bottle sizes');
    await tapBtn('hint'); const hm = await game(g => g.hintMove); expect(hm && await game((g, p) => g.legal(p[0], p[1]), hm) > 0 && await game(g => g.hints) === 1, 'hint points at a legal pour');
    await playOut(); expect(await game(g => g.mode) === 'won' && await game(g => g.rating()) <= 2, 'mixed sizes solved; the hint cost a star');
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150);
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    await game(g => g.go(6)); await wait(200);
    const m0 = await game(g => g.bottles), hidden = m0.reduce((s, x) => s + x.seen.filter(v => !v).length, 0); expect(hidden > 0, 'shelf 6 has murky layers');
    const s6 = await game(g => g.solution()); let shown = false;
    for (const [x, y] of s6) { await tapB(x); await tapB(y); await idle(); if ((await game(g => g.bottles)).reduce((s, q) => s + q.seen.filter(v => !v).length, 0) < hidden) { shown = true; break; } }
    expect(shown, 'pouring off the top reveals a murky layer');
    await playOut(); for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150);
    const s2 = await state(); expect(s2.over && s2.best === 6, 'best is the highest shelf cleared');
  },
};
