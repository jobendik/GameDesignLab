// Topping Toss: a tap tosses the current topping onto the bottom of the spinning donut. Landing it touching two of its
// kind makes Momo eat all three (score, order progress); a lone neighbour makes a pair; consecutive eats chain (x2);
// the swap button swaps current/next; a sprinkle star matches anything; landing on a topping bonks it off (heart);
// timing a toss into a gap on a spinning donut lands cleanly; filling the order rolls in the next donut; three bonks
// end the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/topping-toss/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const HW = await game(g => g.HW), A = Math.PI / 2;
    const tap = async () => { await page.touchscreen.tap(195, 330); };
    const settle = async () => { for (let i = 0; i < 40 && await game(g => g.flying || g.tongue); i++) await wait(60); await wait(120); };
    // 1. two cherries with a gap between them at the landing spot: toss a cherry in → Momo eats all three
    await game((g, a) => g.setup({ tops: [[a[0] - 2.4 * a[1], 0], [a[0] + 2.4 * a[1], 0]], queue: [0, 1], target: 50 }), [A, HW]);
    await tap(); await settle();
    let s = await game(g => ({ score: g.score, eaten: g.eaten, n: g.tops.length, chain: g.chain }));
    expect(s.score === 30 && s.eaten === 3 && s.n === 0 && s.chain === 1, 'three cherries in a row get eaten (' + JSON.stringify(s) + ')');
    expect((await state()).score === 30, 'HUD shows the score');
    // 2. a lone neighbour of its kind makes a pair, not an eat; the chain breaks
    await game((g, a) => g.setup({ tops: [[a[0] + 2.4 * a[1], 1]], queue: [1, 2], target: 50 }), [A, HW]);
    await tap(); await settle();
    s = await game(g => ({ score: g.score, n: g.tops.length, chain: g.chain }));
    expect(s.score === 30 && s.n === 2 && s.chain === 0, 'a pair waits for a third (' + JSON.stringify(s) + ')');
    // 3. swap: the next topping comes first, and two eats in a row chain (30, then 60)
    await game((g, a) => g.setup({ tops: [[a[0] + 2.4 * a[1], 0], [a[0] + 4.8 * a[1], 0]], queue: [2, 0], target: 50 }), [A, HW]);
    const nb = await game(g => g.nextBox); await page.touchscreen.tap(nb[0], nb[1]); await wait(150);
    expect(JSON.stringify(await game(g => g.queue)) === '[0,2]', 'swap button swaps current and next');
    await tap(); await settle();
    await game((g, a) => g.setup({ tops: [[a[0] - 2.4 * a[1], 2], [a[0] - 4.8 * a[1], 2]], queue: [2, 1], target: 50 }), [A, HW]);
    await tap(); await settle();
    s = await game(g => ({ score: g.score, chain: g.chain }));
    expect(s.score === 30 + 30 + 60 && s.chain === 2, 'consecutive eats chain (' + JSON.stringify(s) + ')');
    // 4. a sprinkle star matches anything
    await game((g, a) => g.setup({ tops: [[a[0] - 2.4 * a[1], 3], [a[0] + 2.4 * a[1], 3]], queue: [-1, 0], target: 50 }), [A, HW]);
    await tap(); await settle();
    expect((await game(g => g.tops.length)) === 0, 'sprinkle star completes the marshmallow trio');
    // 5. landing on a topping bonks it off and costs a heart
    await game((g, a) => g.setup({ tops: [[a[0], 2]], queue: [0, 1], target: 50 }), [A, HW]);
    await tap(); await settle();
    s = await game(g => ({ hearts: g.hearts, n: g.tops.length }));
    expect(s.hearts === 2 && s.n === 1, 'a head-on hit bonks off (' + JSON.stringify(s) + ')');
    // 6. spinning donut: time the toss into a wide gap → clean landing
    await game(g => g.setup({ tops: [[0, 0]], queue: [1, 2], speed: 1.6, target: 50 }));
    for (let i = 0; i < 100; i++) { const d = await game(g => Math.abs(((g.landAngle() + Math.PI * 3) % (Math.PI * 2)) - Math.PI)); if (d > 1.2 && d < 2) break; await wait(16); }
    await tap(); await settle();
    s = await game(g => ({ hearts: g.hearts, n: g.tops.length }));
    expect(s.hearts === 2 && s.n === 2, 'a timed toss lands in the gap of a spinning donut (' + JSON.stringify(s) + ')');
    // 7. filling the order rolls in the next donut
    await game((g, a) => g.setup({ tops: [[a[0] - 2.4 * a[1], 4], [a[0] + 2.4 * a[1], 4]], queue: [4, 0], target: 3 }), [A, HW]);
    const sc = await game(g => g.score);
    await tap(); await settle();
    for (let i = 0; i < 20 && (await game(g => g.phase)) !== 'done'; i++) await wait(80);
    expect((await game(g => g.phase)) === 'done' && (await game(g => g.score)) > sc + 100, 'order complete pays a bonus');
    for (let i = 0; i < 50 && (await game(g => g.phase)) !== 'play'; i++) await wait(80);
    expect(await game(g => g.level === 2 && g.phase === 'play' && g.eaten === 0), 'next order arrives');
    // 8. two more bonks end the run
    for (let k = 0; k < 2; k++) { await game((g, a) => g.setup({ tops: [[a, 1]], queue: [0, 0] }), A); await tap(); await settle(); }
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(100);
    const o = await state(); expect(o.over, 'running out of hearts ends the run'); expect(o.best >= o.score && o.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(600);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.level === 1 && g.eaten === 0 && g.chain === 0), 'hearts, order and chain reset');
  },
};
