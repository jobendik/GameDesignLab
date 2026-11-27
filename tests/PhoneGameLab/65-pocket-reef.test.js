// Pocket Reef: taps earn pearls, creatures produce on their own (and appear in the tank), cost growth, buy-x10 and the
// x2 milestone, polish and synergy upgrades through the panel, idle time, capped offline progress via the stored
// timestamp, prestige (double-tap confirm -> win card -> starfish bonus), persistence across a reload, erase.
module.exports = {
  game: 'PhoneGameLab/games/65-pocket-reef/index.html',
  async run({ page, expect, wait, state, game }) {
    const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-6 : tol);
    const tapHit = async id => { const p = await game((g, a) => g.hit(a), id); if (!p) throw new Error('no button ' + id); await page.touchscreen.tap(p.x, p.y); await wait(140); };
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.S.pearls === 0 && g.pps === 0 && g.tapVal === 1), 'a fresh reef starts empty');
    const cl = await game(g => g.clamXY());
    for (let i = 0; i < 15; i++) { await page.touchscreen.tap(cl.x, cl.y); await wait(40); }
    await wait(100);
    expect(await game(g => g.S.pearls) === 15, 'fifteen taps on the clam make fifteen pearls');
    expect((await state()).score === 15, 'HUD shows the pearls');
    await tapHit('gen0');
    expect(await game(g => g.S.own[0] === 1 && g.S.pearls < 1 && g.pps === 1 && g.agents === 1), 'buying a shrimp spends 15, earns 1/s and puts a shrimp in the tank');
    await wait(2100);
    const idle = await game(g => g.S.pearls); expect(idle > 1.5 && idle < 4, 'creatures earn while you watch');
    expect(near(await game(g => g.costOf(0, 1)), 15 * 1.15, 1e-6), 'each purchase raises the price by 15 %');
    // buy x10 and the first milestone
    await game(g => g.grant(5000)); await tapHit('mode');
    expect(await game(g => g.mode) === 10, 'buy-amount toggle switches to x10');
    await tapHit('gen0');
    expect(await game(g => g.S.own[0] === 11 && g.pps === 22 && g.agents === 10), 'ten more shrimp: x2 milestone at 10 doubles them; tank shows at most ten');
    // upgrades tab: polish doubles the tap, a synergy links two tiers
    await game(g => g.buy(1, 5)); await tapHit('tab1'); expect(await game(g => g.tab) === 1, 'tab switches');
    await tapHit('polish');
    expect(await game(g => g.S.polish === 1 && Math.abs(g.tapVal - (2 + g.pps * .03)) < 1e-6), 'polish doubles the base tap');
    const p0 = await game(g => g.pps); await tapHit('syn1');
    const p1 = await game(g => ({ pps: g.pps, syn: g.S.syn[1] })); expect(p1.syn === 1 && near(p1.pps, 22 + 5 * 8 * 1.11, 1e-6) && p1.pps > p0, 'synergy: each shrimp adds 1 % to clownfish');
    const f0 = await game(g => { const a = g.S.pearls; g.fast(60); return { a, b: g.S.pearls, pps: g.pps }; });
    expect(near(f0.b - f0.a, f0.pps * 60, 1), 'a minute of idling pays pps x 60');
    // offline progress from the stored timestamp, at 50 % and capped at two hours
    const o0 = await game(g => { g.backdate(3600); return { p: g.S.pearls, pps: g.pps }; });
    await page.evaluate(() => window.__lab.restart()); await wait(400);
    const o1 = await game(g => ({ p: g.S.pearls, away: g.away }));
    expect(o1.away && near(o1.away.sec, 3600, 5) && near(o1.away.gain, o0.pps * o1.away.sec * .5, 1) && o1.p >= o0.p + o1.away.gain - 1, 'an hour away pays 50 % of an hour');
    await game(g => g.backdate(100000)); await page.evaluate(() => window.__lab.restart()); await wait(400);
    const o2 = await game(g => ({ away: g.away, pps: g.pps })); expect(o2.away.capped && near(o2.away.gain, o2.pps * 7200 * .5, 1), 'offline time is capped at two hours');
    // prestige
    await game(g => g.grant(2.5e6)); expect(await game(g => g.starGain) === 5, '2.5M pearls this tide are worth five starfish');
    await tapHit('tab2'); await tapHit('prestige');
    expect(!(await state()).over && await game(g => g.S.star === 0), 'first tap only arms the tide button');
    await tapHit('prestige'); await wait(300);
    const s = await state(); expect(s.over && s.best >= 2.5e6, 'turning the tide ends the tide with lifetime pearls as the score');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    expect((await state()).running, 'a new tide starts');
    expect(await game(g => g.S.star === 5 && g.S.tides === 1 && g.S.pearls < 1 && g.S.own.every(n => n === 0) && g.S.polish === 0 && g.S.life >= 2.5e6), 'reef reset, starfish kept');
    expect(await game(g => { g.grant(15); g.buy(0, 1); return Math.abs(g.pps - 1.5) < 1e-9; }), 'five starfish make everything 50 % richer');
    // the save survives a reload; erase needs two taps
    await page.reload({ waitUntil: 'load' }); await wait(600);
    expect(await game(g => g.S.star === 5 && g.S.own[0] === 1), 'save persists across a reload');
    await tapHit('tab2'); await tapHit('wipe'); expect(await game(g => g.S.star) === 5, 'first tap only arms the erase');
    await tapHit('wipe'); expect(await game(g => g.S.star === 0 && g.S.life === 0 && g.agents === 0), 'second tap erases the reef');
  },
};
