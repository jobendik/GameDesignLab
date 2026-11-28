// Peekaboo Park: after Pip's count the hiders give real tells over time; tapping (touch) a hider's spot sends Pip to
// search it and finds the pal (score, streak, HUD); tapping an empty spot costs 2 s of daylight and the streak;
// finding everyone clears the round with a daylight bonus and starts a bigger round; dusk ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/peekaboo-park/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const waitPhase = async (ph, n) => { for (let i = 0; i < (n || 60) && (await game(g => g.phase)) !== ph; i++) await wait(100); return game(g => g.phase); };
    const tapSpot = async i => { const p = await game((g, i) => g.spot(i), i); await page.touchscreen.tap(p[0], p[1]); };
    const idle = async () => { for (let i = 0; i < 30 && (await game(g => g.pipBusy)); i++) await wait(60); await wait(120); };
    expect(await game(g => g.phase) === 'count', 'round opens with Pip counting');
    // taps during the count do nothing
    let h = await game(g => g.hiders); await tapSpot(h[0].spot); await wait(200);
    expect(await game(g => g.score === 0 && !g.pipBusy), 'no searching while Pip counts');
    expect(await waitPhase('play') === 'play', 'play starts after the count');
    const t0 = await game(g => g.tells); await wait(3500);
    expect((await game(g => g.tells)) > t0, 'hiders give themselves away with tells over time');
    // a wrong spot: -2 s, streak reset
    h = await game(g => g.hiders); const n = await game(g => g.nSpots);
    const empty = [...Array(n).keys()].find(i => !h.some(z => z.spot === i));
    let before = await game(g => g.time); await tapSpot(empty); await idle();
    let after = await game(g => ({ time: g.time, score: g.score, streak: g.streak }));
    expect(after.time <= before - 1.95 && after.score === 0 && after.streak === 0, 'searching an empty spot costs two seconds (' + before.toFixed(2) + ' → ' + after.time.toFixed(2) + ')');
    // find the hiders one by one with real taps
    await tapSpot(h[0].spot); await idle();
    let s = await game(g => ({ score: g.score, streak: g.streak, found: g.hiders.filter(z => z.found).length }));
    expect(s.found === 1 && s.score > 100 && s.streak === 1, 'tapping a hider\'s spot finds them and scores');
    expect((await state()).score === s.score, 'HUD shows the score');
    for (const z of h.slice(1)) { await tapSpot(z.spot); await idle(); }
    s = await game(g => ({ phase: g.phase, streak: g.streak, score: g.score }));
    expect(s.phase === 'clear' && s.streak === h.length, 'everyone found: round clear');
    for (let i = 0; i < 40 && (await game(g => g.round)) !== 2; i++) await wait(100);
    const r2 = await game(g => ({ round: g.round, n: g.hiders.length, spots: g.nSpots, phase: g.phase }));
    expect(r2.round === 2 && r2.n > h.length && r2.spots > n && r2.phase === 'count', 'round 2: more pals, more spots');
    // dusk: run out of daylight
    await waitPhase('play'); await game(g => g.setTime(.3));
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const o = await state(); expect(o.over, 'dusk ends the run'); expect(o.best >= o.score && o.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.round === 1 && g.phase === 'count' && g.streak === 0 && g.hiders.every(z => !z.found)), 'round, streak and hiders reset');
    await waitPhase('play'); const hz = await game(g => g.hiders); await tapSpot(hz[0].spot); await idle();
    expect(await game(g => g.score) > 0, 'a hider found on the fresh run scores');
  },
};
