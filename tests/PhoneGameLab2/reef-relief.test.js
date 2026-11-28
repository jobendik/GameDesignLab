// Reef Relief: the swinging claw grabs junk when dropped with genuine timing; a real tap drops it along its aim; reel speed
// falls with weight (can vs tyre) and a clean streak multiplies the score; a fish in the way is let go, feeds the slick and
// breaks the streak; a jelly zaps the claw; hauling the drum plugs the leak (slick slows); meeting the quota opens the
// upgrade shop and a tapped card starts haul 2 with more junk; a full slick below quota ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/reef-relief/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const n0 = await game(g => g.trash().length); expect(n0 === 8 && await game(g => g.quota) === 4, 'haul 1: eight pieces, quota four');
    // 1) genuine timing: wait for the swing to line up with any junk, drop on that frame
    await game(g => g.clearCrit());
    await page.evaluate(() => new Promise(res => { const t0 = performance.now(); (function f() { const g = __lab.game; if (g.claw.st === 'swing' && g.predict().type === 'trash') { g.drop(); return res(); } if (performance.now() - t0 > 9000) return res(); requestAnimationFrame(f); })(); }));
    for (let i = 0; i < 80 && await game(g => g.cleaned) < 1; i++) await wait(100);
    let s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, n: __lab.game.trash().length, cleaned: __lab.game.cleaned }));
    expect(s.cleaned === 1 && s.score >= 10 && s.hud === s.score && s.n === n0 - 1, 'a well-timed drop hauls a piece and scores');
    // helpers: freeze the swing, aim at a piece whose line is clear, and measure the reel speed while it comes up
    const target = kind => game((g, kind) => { g.freeze(true); for (const t of g.trash()) if (t.kind === kind && !t.held) { g.aimAt(t.id); if (g.predict().id === t.id) return t; } return null; }, kind);
    const reelSpeed = () => page.evaluate(() => new Promise(res => { const t0 = performance.now(); let a = null; (function f() { const c = __lab.game.claw, now = performance.now(); if (c.st === 'reel' && c.item) { if (!a) a = { len: c.len, t: now }; else if (now - a.t > 300) return res((a.len - c.len) / (now - a.t) * 1000); } if (now - t0 > 8000) return res(-1); requestAnimationFrame(f); })(); }));
    const settle = async () => { for (let i = 0; i < 90 && await game(g => g.claw.st) !== 'swing'; i++) await wait(100); };
    await settle();
    // 2) a real tap drops the claw; weight sets the reel speed; streak multiplies
    let t = await target('can'); expect(t, 'a can with a clear line exists');
    const before = await game(g => ({ score: g.score, streak: g.streak }));
    await page.touchscreen.tap(195, 520); await wait(60); expect(await game(g => g.claw.st) !== 'swing', 'tap drops the claw');
    const vCan = await reelSpeed(); await settle();
    s = await game(g => ({ score: g.score, streak: g.streak, cleaned: g.cleaned }));
    expect(s.cleaned === 2 && s.streak === before.streak + 1 && s.score === before.score + Math.round(10 * (1 + .25 * Math.min(s.streak - 1, 4)) / 5) * 5, 'the can scores 10 × the streak multiplier');
    t = await target('tyre'); expect(t, 'the tyre can be reached');
    await page.keyboard.press('Space'); const vTyre = await reelSpeed(); await settle();
    expect(vCan > 0 && vTyre > 0 && vCan > vTyre * 1.6, `a tyre reels much slower than a can (${Math.round(vCan)} vs ${Math.round(vTyre)} px/s)`);
    expect(await game(g => g.cleaned) === 3 && await game(g => g.streak) === s.streak + 1, 'tyre hauled, streak grows');
    // 3) a fish swimming in the way: let go, slick jumps, streak broken, nothing scored
    t = await target('can') || await target('boot');
    const probe = async kind => {
      await game((g, [t, kind]) => { const c = g.claw; g.putCrit(kind, (c.x + t.x) / 2, (c.y + t.y) / 2); }, [t, kind]); await wait(80);
      const a = await game(g => ({ slick: g.slick, score: g.score, rate: g.rate, t: performance.now(), pred: g.predict().type }));
      await page.touchscreen.tap(200, 600); for (let i = 0; i < 80 && await game(g => g.claw.st) !== 'stun'; i++) await wait(30);
      const b = await game(g => ({ slick: g.slick, score: g.score, streak: g.streak, st: g.claw.st, item: g.claw.item, t: performance.now(), n: g.trash().length }));
      await settle(); await game(g => g.clearCrit()); return { a, b };
    };
    const nBefore = await game(g => g.trash().length);
    let r = await probe('fish');
    expect(r.a.pred === 'crit', 'the sonar prediction sees the fish first');
    expect(r.b.st === 'stun' && r.b.streak === 0 && r.b.score === r.a.score && !r.b.item && r.b.n === nBefore, 'grabbing a fish scores nothing and breaks the streak');
    expect(r.b.slick - r.a.slick - r.a.rate * (r.b.t - r.a.t) / 1000 > .03, 'the fish grab feeds the slick');
    r = await probe('jelly');
    expect(r.b.st === 'stun' && r.b.slick - r.a.slick - r.a.rate * (r.b.t - r.a.t) / 1000 > .05, 'a jelly zaps and stuns the claw');
    // 4) the leaky drum: heavy, but hauling it slows the slick
    const rate0 = await game(g => g.rate); expect(await game(g => g.leaks) === 1, 'one drum is leaking');
    t = await target('drum'); expect(t, 'the drum can be reached'); await page.touchscreen.tap(195, 520);
    for (let i = 0; i < 110 && await game(g => g.leaks) > 0; i++) await wait(100);
    expect(await game(g => g.leaks) === 0 && await game(g => g.rate) < rate0 * .75, 'hauling the drum plugs the leak');
    // 5) quota → shop → pick → haul 2
    await settle(); t = await target('can') || await target('boot'); await page.touchscreen.tap(195, 520); await wait(300); await settle();
    s = await game(g => ({ cleaned: g.cleaned, quota: g.quota, phase: g.phase })); expect(s.cleaned >= s.quota && s.phase === 'play', 'quota met, haul continues');
    const scoreH1 = await game(g => g.score);
    await game(g => { g.slick = 1; });
    for (let i = 0; i < 40 && await game(g => g.phase) !== 'shop'; i++) await wait(100);
    const cards = await game(g => g.cards); expect(await game(g => g.phase) === 'shop' && cards.length === 3, 'three upgrade cards are offered');
    await wait(400); await page.touchscreen.tap(cards[1].x, cards[1].y); await wait(300);
    s = await game((g, id) => ({ lvl: g.up[id], haul: g.haul, phase: g.phase, slick: g.slick, n: g.trash().length, cleaned: g.cleaned, score: g.score }), cards[1].id);
    expect(s.lvl === 1 && s.haul === 2 && s.phase === 'play' && s.slick < .1 && s.cleaned === 0, 'tapping a card buys the upgrade and starts haul 2');
    expect(s.n === 10 && s.score === scoreH1, 'haul 2 has more junk');
    // 6) the slick wins below quota
    await game(g => { g.slick = 1; });
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(100);
    s = await state(); expect(s.over, 'a full slick below quota ends the run'); expect(s.best >= scoreH1 && s.best > 0, 'best score recorded');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.haul === 1 && g.cleaned === 0 && g.slick < .1 && g.trash().length === 8 && Object.values(g.up).every(v => v === 0) && g.phase === 'play'), 'haul, slick, junk and upgrades reset');
  },
};
