// Gulp & Float: the bubble chases a real drag with spring lag; fireflies near the bubble are gulped (score, HUD) and three
// gulps grow it a size; a prickle pops one layer (no game over) and grants a moment of safety; a real drag dodges a falling
// prickle; wind shoves the bubble; the last pop ends the run and records a best; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/gulp-and-float/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await game(g => { g.hold(true); g.clear(); }); await wait(1500);        // let the bubble rise to its cruising height
    // 1) floaty steering with a real pointer drag
    const f = await game(g => g.field), x0 = await game(g => g.x), target = x0 + 110;
    await page.mouse.move(target, f.bot - 60); await page.mouse.down(); await wait(90);
    const early = await game(g => g.x); expect(early > x0 && early < target - 40, 'the bubble lags behind the finger (inertia)');
    await page.mouse.move(target, f.bot - 80); await wait(1500);
    expect(Math.abs(await game(g => g.x) - target) < 22, 'the bubble settles under the finger'); await page.mouse.up();
    // 2) altitude scores by itself; gulping three fireflies grows the bubble
    let a = await game(g => ({ score: g.score, alt: g.alt })); await wait(400);
    let b = await game(g => ({ score: g.score, alt: g.alt })); expect(b.alt > a.alt && b.score > a.score, 'climbing scores');
    await game(g => { g.fly(0, -140); g.fly(10, -200); g.fly(-10, -260); });
    for (let i = 0; i < 30 && await game(g => g.flies) < 3; i++) await wait(100);
    let s = await page.evaluate(() => ({ flies: __lab.game.flies, tier: __lab.game.tier, score: __lab.game.score, hud: __lab.state.score, streak: __lab.game.streak }));
    expect(s.flies === 3 && s.tier === 2 && s.streak === 3, 'three gulps grow the bubble to ×2'); expect(s.score >= b.score + 18, 'gulps score'); expect(Math.abs(s.hud - s.score) <= 1, 'HUD shows the score');
    // 3) a prickle pops one layer but not the run
    await game(g => { g.inv = 0; g.thorn(g.x, 260); });
    for (let i = 0; i < 30 && await game(g => g.tier) > 1; i++) await wait(100);
    s = await game(g => ({ tier: g.tier, over: g.over, inv: g.inv, streak: g.streak, hz: g.hazards }));
    expect(s.tier === 1 && !s.over && s.inv > 0 && s.streak === 0 && s.hz === 0, 'a hit pops one layer, breaks the streak and gives a moment of safety');
    // 4) dodge a falling prickle with a real drag
    await game(g => { g.clear(); g.inv = 0; g.thorn(g.x, 200); });
    const xa = await game(g => g.x), away = xa > (f.L + f.R) / 2 ? f.L + 50 : f.R - 50;
    await page.mouse.move(away, f.bot - 60); await page.mouse.down(); for (let i = 0; i < 40 && await game(g => g.hazards) > 0; i++) await wait(100); await page.mouse.up();
    s = await game(g => ({ tier: g.tier, over: g.over, hz: g.hazards, x: g.x })); expect(!s.over && s.tier === 1 && s.hz === 0, 'drifting aside dodges the prickle');
    // 5) wind shoves the bubble against the spring
    const dir = s.x > (f.L + f.R) / 2 ? -1 : 1; await game((g, d) => g.wind(d), dir); await wait(350);
    const xw = await game(g => g.x); expect((xw - s.x) * dir > 8, 'a gust pushes the bubble sideways'); await game(g => g.clear()); await wait(500);
    // 6) the last pop ends the run
    const before = await game(g => g.score); await game(g => { g.inv = 0; g.thorn(g.x, 320); });
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    s = await state(); expect(s.over, 'popping the last layer ends the run'); expect(s.best >= before && s.best > 0, 'best score recorded');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score < 20, 'restart gives a fresh run');
    expect(await game(g => g.tier === 1 && g.flies === 0 && g.alt < 15 && g.zone === 0 && !g.over), 'height, bubble and counters reset');
  },
};
