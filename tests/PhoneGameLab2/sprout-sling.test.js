// Sprout Sling: a real mouse drag-back slings a seed into its mound and it grows (score, plant), a seed of the wrong kind
// does not take, Space/arrow keys aim and fire, regrowing every mound clears the clearing (+3 seeds, next clearing with a
// branch nest), a planted bloom's cup springs seeds back up, running out of seeds ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/sprout-sling/index.html',
  timeout: 70000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let g = await game(g => ({ seeds: g.seeds, level: g.level, ms: g.mounds(), q: g.queue, phase: g.phase }));
    expect(g.seeds === 10 && g.level === 1 && g.ms.length === 2 && g.phase === 'aim', 'clearing 1: two mounds, ten seeds');
    expect(g.ms.some(m => m.type === g.q[0]), 'the seed in the sling fits an open mound');
    const settle = async () => { for (let i = 0; i < 60 && await game(g => g.flying); i++) await wait(100); await wait(100); };
    // real drag-back shot
    const i0 = g.ms.findIndex(m => m.type === g.q[0]);
    const sol = await game((g, i) => g.solve(i), i0); expect(!!sol, 'a shot to the mound exists');
    const d = await game((g, s) => g.dragFor(s.vx, s.vy), sol);
    await page.mouse.move(195, 420); await page.mouse.down(); await page.mouse.move(195 - d[0], 420 - d[1], { steps: 8 }); await wait(80); await page.mouse.up();
    expect(await game(g => g.flying), 'letting go slings the seed');
    await settle();
    g = await game((g, i) => ({ planted: g.planted, score: g.score, plants: g.plants, seeds: g.seeds, m: g.mounds()[i] }), i0);
    expect(g.planted === 1 && g.m.planted && g.plants === 1, 'the seed lands in its mound and grows');
    expect(g.score >= 100 && (g.seeds === 9 || g.seeds === 10), 'a plant scores 100+ and uses a seed (bullseye refunds it)');
    await wait(100); expect((await state()).score === g.score, 'HUD shows the score');
    // what you grow is terrain: a seed dropped onto the new plant bounces off it (trick flag) instead of reaching the soil
    const pl = (await game(g => g.plantsXY()))[0];
    await game((g, p) => g.dropSeed(p[0] + 3, p[1] - 320), pl);
    let bounced = false; for (let i = 0; i < 30 && !bounced && await game(g => g.flying); i++) { const si = await game(g => g.seedInfo); if (si && si.trick) bounced = true; await wait(50); }
    expect(bounced, 'the grown ' + ['palm', 'bloom', 'fruit tree'][pl[2]] + ' is solid and springy: the seed bounces off it');
    await settle();
    // wrong kind does not take
    const i1 = 1 - i0, t1 = (await game(g => g.mounds()))[i1].type;
    const s1 = await game((g, i) => g.solve(i), i1);
    await game((g, a) => { g.setQueue([(a.t + 1) % 3, a.t]); g.fire(a.s.vx, a.s.vy); }, { t: t1, s: s1 });
    await settle();
    g = await game((g, i) => ({ planted: g.planted, m: g.mounds()[i] }), i1);
    expect(!g.m.planted, 'a mound refuses the wrong kind of seed');
    // keyboard aim + fire
    let seeds0 = await game(g => g.seeds);
    await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Space'); await wait(60);
    expect(await game(g => g.flying) && (await game(g => g.seeds)) === seeds0 - 1, 'arrow keys aim, Space slings');
    await settle();
    // finish the clearing with solved shots
    for (let k = 0; k < 6 && (await game(g => g.level)) === 1 && (await game(g => g.phase)) === 'aim'; k++) {
      await game((g, i) => { const ms = g.mounds(); const j = ms.findIndex(m => !m.planted); g.setQueue([ms[j].type, ms[j].type]); const s = g.solve(j); if (s) g.fire(s.vx, s.vy); }); await settle();
    }
    expect((await game(g => g.phase)) === 'clear', 'every mound regrown: the clearing is cleared');
    seeds0 = await game(g => g.seeds); await wait(2700);
    g = await game(g => ({ level: g.level, ms: g.mounds(), phase: g.phase, seeds: g.seeds }));
    expect(g.level === 2 && g.phase === 'aim' && g.ms.length === 3 && g.ms.every(m => !m.planted), 'clearing 2: three fresh mounds');
    expect(g.ms.some(m => m.y < (Math.max(...g.ms.map(q => q.y)) - 60)), 'clearing 2 has a branch nest up high');
    // out of seeds
    await game(g => g.setSeeds(1)); await game(g => g.fire(-400, -200)); await settle();
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'running out of seeds ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    expect(await game(g => g.seeds === 10 && g.level === 1 && g.planted === 0 && g.plants === 0 && g.mounds().length === 2), 'seeds, clearing and plants reset');
  },
};
