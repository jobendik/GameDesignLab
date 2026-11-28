// Huddle Up: real taps on two twins with a ≤2-bend path make them hug (score, HUD, tiles gone); different pals only
// switch the selection; twins without a clear path cannot hug; clearing the field advances the picnic with a bonus;
// picnic 3 slides the field down after each hug; snoozers can't be picked until a neighbouring hug wakes them;
// a hint costs 6 s; the stopwatch running out ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/huddle-up/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    const tapCell = async (r, c) => { const p = await game((g, a) => g.cell(a[0], a[1]), [r, c]); await page.touchscreen.tap(p.x, p.y); await wait(90); };
    expect((await state()).running, 'running after autostart');
    let s = await game(g => ({ lv: g.level, left: g.left, d: g.dims, time: g.time }));
    expect(s.lv === 1 && s.left === 42 && s.d.R * s.d.C === 42 && s.time > 78, 'picnic 1: 42 pals, 80 s');
    // 1) real taps on a reachable pair
    let pr = await game(g => g.pair());
    await tapCell(pr[0].r, pr[0].c);
    s = await game(g => g.selected); expect(s && s.r === pr[0].r && s.c === pr[0].c, 'first tap selects a pal');
    await tapCell(pr[1].r, pr[1].c);
    s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, left: __lab.game.left, hugs: __lab.game.hugs, sel: __lab.game.selected }));
    expect(s.score > 0 && s.hud === s.score && s.left === 40 && s.hugs === 1 && !s.sel, `the twins hug (${JSON.stringify(s)})`);
    // 2) two different pals: selection just moves, nothing scores
    const diff = await game(g => { const t = g.tiles().filter(x => !x.sleep); const a = t[0], b = t.find(x => x.k !== a.k); return [a, b]; });
    const s0 = await game(g => g.score);
    await tapCell(diff[0].r, diff[0].c); await tapCell(diff[1].r, diff[1].c);
    s = await game(g => ({ score: g.score, left: g.left, sel: g.selected }));
    expect(s.score === s0 && s.left === 40 && s.sel && s.sel.r === diff[1].r && s.sel.c === diff[1].c, 'a different pal only moves the selection');
    await tapCell(diff[1].r, diff[1].c); // deselect
    // 3) twins boxed in (no path) cannot hug
    const blocked = await game(g => { const t = g.tiles(); for (const a of t) for (const b of t) if (a !== b && a.k === b.k && !g.path(a, b)) return [a, b]; return null; });
    expect(!!blocked, 'found boxed-in twins on the full field');
    await game((g, b) => { g.tap(b[0].r, b[0].c); g.tap(b[1].r, b[1].c); }, blocked);
    expect(await game(g => g.left === 40), 'boxed-in twins do not hug');
    await game((g, b) => g.tap(b[1].r, b[1].c), blocked);
    // 4) clear the field -> picnic 2 with a bonus
    for (let i = 0; i < 30 && (await game(g => g.level)) === 1; i++) { await game(g => { const p = g.pair(); if (p) { g.tap(p[0].r, p[0].c); g.tap(p[1].r, p[1].c); } }); await wait(60); }
    await wait(1400);
    s = await game(g => ({ lv: g.level, left: g.left, time: g.time, score: g.score }));
    expect(s.lv === 2 && s.left === 48 && s.time > 85, `field cleared -> picnic 2 (${JSON.stringify(s)})`);
    // 5) picnic 3: the field slides down after each hug
    await game(g => g.setLevel(3));
    expect(await game(g => g.grav === 'down'), 'picnic 3 slides down');
    for (let i = 0; i < 4; i++) await game(g => { const p = g.pair(); g.tap(p[0].r, p[0].c); g.tap(p[1].r, p[1].c); });
    s = await game(g => { const { R, C } = g.dims, t = g.tiles(); for (let c = 0; c < C; c++) { const rows = t.filter(x => x.c === c).map(x => x.r).sort((a, b) => a - b); for (let i = 0; i < rows.length; i++) if (rows[i] !== R - rows.length + i) return false; } return t.length === R * C - 8; });
    expect(s, 'every column settled at the bottom after the hugs');
    // 6) picnic 4: snoozers
    await game(g => g.setLevel(4));
    let z = await game(g => g.tiles().filter(t => t.sleep));
    expect(z.length === 6, 'six snoozers');
    await tapCell(z[0].r, z[0].c); expect(!(await game(g => g.selected)), 'a snoozer cannot be picked');
    let woke = false;
    for (let i = 0; i < 25 && !woke; i++) {
      woke = await game(g => {
        const t = g.tiles(), sl = t.filter(x => x.sleep), near = x => sl.some(q => Math.abs(q.r - x.r) + Math.abs(q.c - x.c) === 1);
        const aw = t.filter(x => !x.sleep);
        for (const a of aw) for (const b of aw) if (a !== b && a.k === b.k && (near(a) || near(b)) && g.path(a, b)) { const n0 = sl.length; g.tap(a.r, a.c); g.tap(b.r, b.c); return g.tiles().filter(x => x.sleep).length < n0; }
        const p = g.pair(); if (p) { g.tap(p[0].r, p[0].c); g.tap(p[1].r, p[1].c); } return false;
      });
    }
    expect(woke, 'a hug next to a snoozer wakes it');
    // 7) hint costs six seconds
    const t0 = await game(g => g.time); await game(g => g.hint()); const t1 = await game(g => g.time);
    expect(t0 - t1 > 5.8 && t0 - t1 < 6.3, `hint costs 6 s (${t0} -> ${t1})`);
    // 8) out of time
    await game(g => g.setTime(.3));
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(50);
    s = await state(); expect(s.over && s.best >= s.score && s.score > 0, 'the stopwatch runs out: run over, best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(400);
    s = await page.evaluate(() => ({ st: __lab.state, lv: __lab.game.level, left: __lab.game.left, score: __lab.game.score, hugs: __lab.game.hugs }));
    expect(s.st.running && !s.st.over && s.lv === 1 && s.left === 42 && s.score === 0 && s.hugs === 0 && s.st.score === 0, 'restart is clean');
  },
};
