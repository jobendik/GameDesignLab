// Tall Order: taps lift and hop rings, the size rule is enforced (never onto a narrower ring or a full peg),
// hold pegs take one ring, undo/restart/hint work, the solver's route really finishes the toy → win,
// progress + best persist and the next toy loads clean.
module.exports = {
  game: 'PhoneGameLab/games/49-tall-order/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.level) === 1 && await game(g => g.moves) === 0, 'toy 1 starts untouched');
    const tapP = async i => { const p = await game((g, i) => g.pegs[i], i); await page.touchscreen.tap(p.x, p.y); await wait(50); };
    const idle = async () => { for (let i = 0; i < 80 && await game(g => g.busy); i++) await wait(40); };
    const tapBtn = async id => { const b = await game((g, id) => g.buttons.find(b => b.id === id), id); await page.touchscreen.tap(b.x, b.y); await wait(120); };
    const snap = async () => JSON.stringify((await game(g => g.pegs)).map(p => p.st));
    const playOut = async () => { const sol = await game(g => g.solution()); expect(sol && sol.length > 0, 'solver finds a route'); for (const [a, b] of sol) { await tapP(a); await tapP(b); await idle(); } return sol.length; };
    const sorted = p => p.every(q => q.st.every((r, j) => j === 0 || q.st[j - 1].size >= r.size));
    // 1. lift / put back / hop
    const p0 = await game(g => g.pegs), s0 = await snap(), sol = await game(g => g.solution()), [a, b] = sol[0];
    expect(sorted(p0), 'every starting peg is stacked wide-to-narrow');
    await tapP(a); expect(await game(g => g.sel) === a, 'tap lifts the top ring');
    await tapP(a); expect(await game(g => g.sel) === -1 && await game(g => g.moves) === 0, 'tapping the same peg puts it back');
    await tapP(a); await tapP(b); await idle();
    const p1 = await game(g => g.pegs);
    expect(p1[a].st.length === p0[a].st.length - 1 && p1[b].st.length === p0[b].st.length + 1 && await game(g => g.moves) === 1, 'ring hops to the other peg, one move counted');
    // 2. the size rule: a wider ring is refused on a narrower one
    let bad = null; for (let x = 0; x < p1.length && !bad; x++) for (let y = 0; y < p1.length && !bad; y++) if (x !== y && p1[x].st.length && p1[y].st.length && p1[y].st.length < p1[y].cap && p1[x].st[p1[x].st.length - 1].size > p1[y].st[p1[y].st.length - 1].size) bad = [x, y];
    if (bad) { const before = await snap(); await tapP(bad[0]); await tapP(bad[1]); await idle(); expect(await snap() === before && await game(g => g.moves) === 1, 'a wide ring cannot land on a narrower one'); expect(!(await game((g, m) => g.fits(m[0], m[1]), bad)), 'rule agrees'); if (await game(g => g.sel) >= 0) await tapP(await game(g => g.sel)); }
    // 3. undo + restart
    await tapBtn('undo'); await idle(); expect(await snap() === s0 && await game(g => g.moves) === 0, 'undo hops it back');
    await tapP(a); await tapP(b); await idle(); await tapBtn('restart'); await idle(); expect(await snap() === s0 && await game(g => g.moves) === 0, 'restart restores the scramble');
    // 4. finish toy 1 → win
    const par = await game(g => g.par), used = await playOut(); await idle();
    const pw = await game(g => g.pegs); expect(pw.every(q => !q.st.length || q.done) && sorted(pw), 'every peg is one colour, widest at the bottom');
    expect(used === par, 'solver route equals the stated par on a small toy');
    for (let i = 0; i < 50 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over && s.score === 1 && s.best >= 1, 'win card: toy 1 cleared, best recorded');
    expect((await game(g => g.progress)).lvl === 2 && (await game(g => g.progress)).stars[1] === 3, 'progress saved with three stars');
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && await game(g => g.level) === 2 && await game(g => g.moves) === 0, 'next toy loads clean');
    // 5. hold peg + hint on toy 6, as a returning player
    await page.evaluate(() => { const k = 'gdl:PhoneGameLab/49-tall-order:prog', p = JSON.parse(localStorage.getItem(k)); p.max = 6; localStorage.setItem(k, JSON.stringify(p)); });
    await page.reload(); await wait(700); await game(g => g.go(6)); await wait(200);
    const p6 = await game(g => g.pegs), stub = p6.findIndex(q => q.cap === 1), src = p6.findIndex((q, i) => i !== stub && q.st.length);
    expect(stub >= 0 && await game(g => g.sizes) === 4, 'toy 6 has a hold peg and four ring sizes');
    let st6 = p6; if (!st6[stub].st.length) { await tapP(src); await tapP(stub); await idle(); st6 = await game(g => g.pegs); }
    expect(st6[stub].st.length === 1, 'hold peg holds a ring');
    const m6 = await game(g => g.moves), before6 = await snap(), other = st6.findIndex((q, i) => i !== stub && q.st.length);
    await tapP(other); await tapP(stub); await idle(); expect(await snap() === before6 && await game(g => g.moves) === m6, 'hold peg refuses a second ring');
    if (await game(g => g.sel) >= 0) await tapP(await game(g => g.sel));
    await tapBtn('hint'); const hm = await game(g => g.hintMove); expect(hm && await game((g, m) => g.fits(m[0], m[1]), hm) && await game(g => g.hints) === 1, 'hint points at a legal hop');
    await playOut(); await idle(); expect(await game(g => g.mode) === 'won' && await game(g => g.rating()) <= 2, 'toy 6 finished; the hint cost a star');
    for (let i = 0; i < 50 && !(await state()).over; i++) await wait(150);
    const s2 = await state(); expect(s2.over && s2.best === 6, 'best is the highest toy cleared');
  },
};
