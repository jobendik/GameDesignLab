// Echo Jam: the band calls a tune, real taps on the pals play it back; an on-beat tap scores double an off-beat one;
// a cleared song adds one note to the same tune; a wrong pal costs a heart and the call replays; BACKWARDS wants the
// reverse order (played here with the number keys); SWAP hops two pals to new seats and the note follows the pal;
// running out of hearts ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/echo-jam/index.html',
  timeout: 75000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await game(fn)) return true; await wait(50); } return false; };
    const tapPal = async id => { const p = await game((g, id) => g.seat(id), id); await page.touchscreen.tap(p.x, p.y - 10); await wait(120); };
    expect((await state()).running, 'running after autostart');
    expect(await game(g => g.round === 1 && g.tune.length === 3 && g.twist === 'echo' && g.hearts === 3 && g.bandSize === 4), 'song 1: three notes, four pals, three hearts');
    expect(await until(g => g.phase === 'turn'), 'the call ends and it is your turn');
    // 1) on-beat vs off-beat: same note value, different points (pressed at a chosen beat phase through the real handler)
    const ans1 = await game(g => g.answer());
    const timed = (lo, hi, id) => page.evaluate(([lo, hi, id]) => new Promise(res => { const g = __lab.game, t0 = performance.now(); (function f() { const p = Math.abs(g.beatPhase); if (p >= lo && p <= hi) { const s = g.score; g.press(id); return res(g.score - s); } if (performance.now() - t0 > 4000) return res(-1); requestAnimationFrame(f); })(); }), [lo, hi, id]);
    const on = await timed(0, .06, ans1[0]), off = await timed(.35, .5, ans1[1]);
    expect(on === 20 && off === 10, `on-beat note scores 20, off-beat 10 (got ${on}, ${off})`);
    // 2) a real tap finishes the song
    let s0 = await game(g => g.score); await tapPal(ans1[2]);
    let s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, phase: __lab.game.phase }));
    expect(s.phase === 'clear' && s.score > s0 + 10 && s.hud === s.score, 'the last note clears the song with a bonus');
    expect(await until(g => g.round === 2 && g.phase !== 'clear'), 'song 2 starts');
    const t2 = await game(g => g.tune); expect(t2.length === 4 && t2.slice(0, 3).join() === ans1.join(), 'song 2 is the same tune plus one note');
    // 3) a wrong pal: heart lost, call replays, input starts over
    await until(g => g.phase === 'turn');
    const wrong = await game(g => g.seats().map(m => m.id).find(id => id !== g.answer()[0]));
    s0 = await game(g => g.score); await tapPal(wrong);
    s = await game(g => ({ hearts: g.hearts, phase: g.phase, score: g.score }));
    expect(s.hearts === 2 && s.phase === 'oops' && s.score === s0, 'a wrong pal costs a heart and scores nothing');
    expect(await until(g => g.phase === 'call'), 'the band replays the call');
    await until(g => g.phase === 'turn');
    await game(g => g.force('rev'));
    for (const id of await game(g => g.answer())) await tapPal(id);
    expect(await game(g => g.phase === 'clear' && g.round === 2), 'song 2 cleared after the replay');
    // 4) BACKWARDS, played on the number keys (key = seat number)
    expect(await until(g => g.round === 3 && g.phase === 'turn'), 'song 3 reaches the turn');
    s = await game(g => ({ twist: g.twist, tune: g.tune, ans: g.answer(), hearts: g.hearts }));
    expect(s.twist === 'rev' && s.ans.join() === s.tune.slice().reverse().join(), 'BACKWARDS asks for the reverse order');
    s0 = await game(g => g.score);
    for (const id of s.ans) { const seat = await game((g, id) => g.seat(id).seat, id); await page.keyboard.press(String(seat + 1)); await wait(110); }
    s = await game(g => ({ phase: g.phase, hearts: g.hearts, score: g.score }));
    expect(s.phase === 'clear' && s.hearts === 3, 'a flawless twist song clears and wins the heart back');
    expect(s.score - s0 >= 5 * 20 + 15 * 5 * 2, 'twist songs pay double');
    // 5) SWAP: two pals change seats after the call; the note follows the pal
    await game(g => g.force('swap'));
    expect(await until(g => g.round === 4 && g.phase === 'call'), 'song 4 call');
    const before = await game(g => g.seats().map(m => m.id + m.seat).sort().join());
    expect(await until(g => g.phase === 'turn'), 'swap song reaches the turn');
    const after = await game(g => g.seats().map(m => m.id + m.seat).sort().join());
    expect(before !== after, 'two pals hopped seats');
    for (const id of await game(g => g.answer())) await tapPal(id);
    expect(await game(g => g.phase === 'clear'), 'tapping the pals where they now sit clears the swap song');
    // 6) run out of hearts (on a fresh run, where the calls are short)
    await page.evaluate(() => __lab.restart()); await wait(300);
    for (let k = 0; k < 4 && !(await state()).over; k++) {
      if (!(await until(g => g.phase === 'turn' || g.phase === 'over')) || await game(g => g.phase === 'over')) break;
      if (k === 0) await tapPal(await game(g => g.answer()[0]));   // one good note first, so the run has a score
      const w = await game(g => g.seats().map(m => m.id).find(id => id !== g.answer()[g.pos])); await tapPal(w);
    }
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    s = await state(); expect(s.over && s.best > 0, 'three wrong pals end the run and record the best');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.round === 1 && g.hearts === 3 && g.tune.length === 3 && g.bandSize === 4 && g.phase === 'intro'), 'song, hearts, tune and band reset');
  },
};
