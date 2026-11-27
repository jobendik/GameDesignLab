// Big Drip: mouse steering, eating mist and smaller drops, fling + re-merge, vent evaporation, wiper smear,
// three lives lost to bigger drops -> game over, clean restart, timed finish with podium bonus.
module.exports = {
  game: 'PhoneGameLab/games/63-big-drip/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.owners.length === 10 && g.lives === 3 && g.me.pieces.length === 1), 'player + nine rival drops, three lives');
    const b0 = await game(g => g.owners.filter(o => o !== g.me).map(o => o.pieces[0].x + o.pieces[0].y));
    await wait(500);
    expect(await game((g, a) => g.owners.filter(o => o !== g.me).some((o, i) => o.pieces[0] && Math.abs(o.pieces[0].x + o.pieces[0].y - a[i]) > 5), b0), 'rival drops move on their own');
    await game(g => g.clearBots());
    // mouse steering: the drop slides toward the pointer
    const x0 = await game(g => g.me.pieces[0].x);
    await page.mouse.move(370, 450); await wait(900);
    expect(await game(g => g.me.pieces[0].x) > x0 + 40, 'drop slides toward the pointer');
    // mist beads and a smaller drop in the path are swallowed
    const s0 = await game(g => { const p = g.me.pieces[0]; for (let i = 1; i <= 3; i++) g.addFood(p.x + 40 + i * 30, p.y, 2); return { s: g.score, m: g.mass }; });
    await wait(1100);
    const s1 = await game(g => ({ s: g.score, m: g.mass })); expect(s1.s >= s0.s + 6 && s1.m > s0.m + 5, 'mist beads add score and mass');
    expect((await state()).score >= s1.s, 'HUD score follows');
    await game(g => { const p = g.me.pieces[0]; g.dummy(p.x + 110, p.y, 10); });
    await wait(1300);
    const s2 = await game(g => ({ s: g.score, m: g.mass, n: g.drops.length })); expect(s2.s >= s1.s + 10 && s2.n === 1, 'a smaller drop is swallowed for its mass');
    // fling: a click throws half the water ahead; halves re-merge once their timers run out
    await game(g => g.setMass(100)); await page.mouse.down(); await page.mouse.up(); await wait(250);
    const f = await game(g => g.me.pieces.map(p => ({ m: p.m, x: p.x }))); expect(f.length === 2 && Math.abs(f[0].m - 50) < 4 && f[1].x > f[0].x + 20, 'fling splits the drop and throws half forward');
    await game(g => g.me.pieces.forEach(p => { p.mt = 0; }));
    for (let i = 0; i < 20 && (await game(g => g.me.pieces.length)) > 1; i++) await wait(200);
    expect(await game(g => g.me.pieces.length === 1 && g.mass > 90), 'the halves merge back together');
    // warm vent evaporates water
    const v0 = await game(g => { g.tp(g.VENTS[0].x, g.VENTS[0].y); g.steer(1, 0, 0); return g.mass; });
    await wait(1000);
    expect(await game(g => g.mass) < v0 * .96, 'vents evaporate mass');
    // the wiper smears 40 % off a drop caught in its fan and leaves loose beads behind
    const w0 = await game(g => { g.tp(1100, 700); g.setMass(200); g.steer(1, 0, 0); g.wiperNow(); g.step(20); return { st: g.wiper.state, big: g.food.filter(f => f.m > 2).length }; });
    expect(w0.st === 'warn', 'the wiper telegraphs before it sweeps');
    const w1 = await game(g => { g.step(280); return { m: g.mass, big: g.food.filter(f => f.m > 2).length, st: g.wiper.state }; });
    expect(w1.m < 135 && w1.m > 100 && w1.big > w0.big + 2, 'wiper smears mass into beads ' + JSON.stringify([w0, w1]));
    // three bigger drops swallow us: lives run out
    for (let life = 2; life >= 0; life--) {
      for (let i = 0; i < 20 && !(await game(g => g.me.pieces.length)); i++) await wait(150);
      await game(g => { const p = g.me.pieces[0]; g.me.shield = 0; g.dummy(p.x, p.y, 3000); });
      await wait(300);
      expect(await game(g => g.lives) === life, 'swallowed by a bigger drop: ' + life + ' lives left');
    }
    const s = await state(); expect(s.over, 'no lives left ends the run'); expect(s.best >= s.score && s.best > 0, 'best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score < 5, 'restart gives a clean run');
    expect(await game(g => g.owners.length === 10 && g.lives === 3 && g.time < 2 && g.mass < 40), 'world reset after restart');
    await game(g => { g.clearBots(); g.setTime(g.ROUND - .3); });
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const e = await state(); expect(e.over && e.score >= 500, 'the shower ends on time with the podium bonus');
  },
};
