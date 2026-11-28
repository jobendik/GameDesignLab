// Hover Hop: a real tap hops Bolt straight up and he lands on the pad above when it is under him (pads frozen + placed so
// the landing is deterministic, the hop/landing physics are the game's own): dead-centre = PERFECT (combo, HUD score);
// off-centre = plain landing (combo reset); near the rim = teeter, and hopping again saves him; a nut in the gap is
// grabbed on the way up; a tap just before touchdown is buffered; a hop with nothing above falls back onto the same pad;
// teetering too long slips off and ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/hover-hop/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let b = await game(g => g.bolt); expect(b.st === 'stand' && b.pad === 0, 'Bolt starts on the launch pad');
    await game(g => g.freeze(true));
    const settle = async () => { for (let i = 0; i < 40 && (await game(g => g.bolt.st)) === 'air'; i++) await wait(40); return game(g => g.bolt); };
    const place = (i, dx) => game((g, a) => { const p = g.padAt(a[0]); g.place(a[0], g.bolt.x + a[1] * p.w / 2); }, [i, dx]);
    // 1) perfect by touch tap
    await place(1, 0); await page.touchscreen.tap(195, 500); b = await settle();
    let s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, combo: __lab.game.combo, last: __lab.game.last, h: __lab.game.height }));
    expect(b.st === 'stand' && b.pad === 1 && s.h === 1, 'tap hops Bolt onto the pad above');
    expect(s.last === 'perfect' && s.combo === 1 && s.score > 0 && s.hud === s.score, 'dead-centre landing is PERFECT and scores');
    // 2) off-centre landing by keyboard: combo resets
    await place(2, .45); await page.keyboard.press('Space'); b = await settle();
    s = await game(g => ({ last: g.last, combo: g.combo, h: g.height }));
    expect(b.pad === 2 && s.last === 'ok' && s.combo === 0, 'an off-centre landing is plain and resets the combo');
    // 3) rim landing teeters; hopping again saves Bolt
    await place(3, .88); await game(g => g.hop()); b = await settle();
    expect(b.pad === 3 && (await game(g => g.last)) === 'edge' && b.teeter > 0, 'a rim landing teeters');
    await place(4, 0); await page.mouse.click(195, 500); b = await settle();
    expect(b.pad === 4 && b.st === 'stand', 'hopping off a teeter saves Bolt');
    // 4) a nut in the gap is grabbed on the way up
    const n0 = await game(g => g.nuts), sc0 = await game(g => g.score);
    await game(g => g.nut(4, g.bolt.x)); await place(5, 0); await game(g => g.hop()); b = await settle();
    expect((await game(g => g.nuts)) === n0 + 1 && (await game(g => g.score)) >= sc0 + 25, 'the nut is collected (+25)');
    // 5) a tap just before touchdown is buffered into the next hop
    await place(6, 0); await place(7, 0); await game(g => g.hop());
    for (let i = 0; i < 60 && (await game(g => g.bolt.vy)) <= 0; i++) await wait(10);
    await wait(30); await page.keyboard.press('Space');
    for (let i = 0; i < 60 && (await game(g => g.bolt.pad)) < 7; i++) await wait(30);
    expect((await settle()).pad === 7, 'a buffered tap hops again right after landing');
    // 6) nothing above → Bolt falls back onto his own pad (no points)
    const sc1 = await game(g => g.score); await game(g => { const p = g.padAt(8); g.place(8, g.bolt.x > 195 ? 20 : 370); }); await game(g => g.hop()); b = await settle();
    expect(b.pad === 7 && b.st === 'stand' && (await game(g => g.last)) === 'back' && (await game(g => g.score)) === sc1, 'a missed hop falls back onto the same pad');
    // 7) teetering too long slips off → run over
    await place(8, .9); await game(g => g.hop()); b = await settle(); expect((await game(g => g.last)) === 'edge', 'rim landing again');
    for (let i = 0; i < 50 && !(await state()).over; i++) await wait(100);
    let st = await state(); expect(st.over && (await game(g => g.last)) === 'slipped', 'Bolt slips off the rim and the run ends');
    expect(st.best >= st.score && st.best > 0, 'best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    st = await state(); s = await game(g => ({ h: g.height, pad: g.bolt.pad, st: g.bolt.st, c: g.combo, n: g.nuts, over: g.over }));
    expect(st.running && !st.over && st.score === 0 && s.h === 0 && s.pad === 0 && s.st === 'stand' && s.c === 0 && s.n === 0 && !s.over, 'restart is clean');
  },
};
