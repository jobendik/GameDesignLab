// Top Frog: a real press-hold-release kicks Momo toward the pointer (longer hold = stronger kick); her tongue snaps a
// snack-sized critter ahead by itself (score, growth) and quick gulps build a combo; a bigger critter bounces off; a
// lunging hunter catches her (heart lost, shrink, invulnerable); growing flips the pecking order (perch: threat → snack);
// the heron's strike misses Momo under a lily pad and catches her in the open; three catches end the run; clean restart.
module.exports = {
  game: 'PhoneGameLab2/games/top-frog/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await game(fn)) return true; await wait(40); } return false; };
    expect((await state()).running, 'running after autostart');
    expect(await game(g => g.hearts === 3 && g.tier === 0 && Math.abs(g.r - 14) < .01), 'Froglet, three hearts');
    await game(g => { g.clear(); g.noPads(); g.setMomo(1100, 1100, 0); });
    // 1) kick: press to the right of Momo, hold, release
    const press = async (dx, dy, ms) => { const m = await game(g => g.momo), [x, y] = await game((g, m) => g.toScreen(m.x, m.y), m); await page.mouse.move(x + dx, y + dy); await page.mouse.down(); await wait(ms); await page.mouse.up(); await wait(30); return game(g => g.momo); };
    let m = await press(90, 0, 80); expect(m.vx > 100 && Math.abs(m.vy) < 40, 'a quick press-release kicks Momo toward the pointer');
    const vShort = m.vx; await until(g => Math.hypot(g.momo.vx, g.momo.vy) < 5, 5000);
    m = await press(0, 90, 500); expect(m.vy > vShort * 1.5 && Math.abs(m.vx) < 60, `a held press kicks harder, in its own direction (${Math.round(m.vy)} vs ${Math.round(vShort)})`);
    await until(g => Math.hypot(g.momo.vx, g.momo.vy) < 5, 5000);
    // 2) tongue: a tadpole ahead is snapped up
    await game(g => { g.clear(); g.setMomo(1100, 1100, 0); });
    const s0 = await game(g => ({ score: g.score, m: g.m }));
    const tid = await game(g => g.place('tad', 45, 0, 'hold'));
    expect(await until(g => g.eaten === 1, 2000), 'the tongue snaps the tadpole');
    let s = await page.evaluate(id => ({ score: __lab.game.score, hud: __lab.state.score, m: __lab.game.m, gone: !__lab.game.crit().some(c => c.id === id) }), tid);
    expect(s.score === s0.score + 10 && s.hud === s.score && s.m > s0.m && s.gone, 'a gulp scores and grows Momo');
    await game(g => g.place('minnow', 50, 10, 'hold')); expect(await until(g => g.eaten === 2, 2000), 'a second snack right away');
    expect(await game(g => g.combo === 2) && await game((g, s) => g.score - s, s.score) === Math.round(15 * 1.25), 'quick gulps build a ×1.25 combo');
    // 3) a big non-hunter bounces Momo away
    await game(g => { g.clear(); g.setMomo(1100, 1100, 0); g.place('newt', 26, 0, 'roam'); }); await wait(150);
    m = await game(g => g.momo); expect(m.vx < -40 && await game(g => g.eaten === 2), 'a too-big newt bumps Momo back');
    // 4) a lunging perch catches her
    await game(g => { g.clear(); g.setMomo(1100, 1100, 0); });
    const r0 = await game(g => g.r); await game(g => g.place('perch', 120, 0, 'lunge'));
    expect(await until(g => g.hearts === 2, 2000), 'a lunging perch catches Momo');
    s = await game(g => ({ r: g.r, inv: g.momo.inv })); expect(s.r < r0 && s.inv > 1.5, `spat out: smaller and briefly safe (r ${s.r} vs ${r0}, inv ${s.inv})`);
    // 5) grow: the pecking order flips
    expect(await game(g => g.threat('perch') && !g.edible('perch')), 'the perch is a threat to a small Momo');
    await until(g => g.momo.inv < 1.2, 3000); await game(g => { g.clear(); g.m = 4.4; g.setMomo(1100, 1100, 0); });
    await game(g => g.place('newt', 50, 0, 'hold')); await until(g => g.eaten === 3, 2000);
    s = await game(g => ({ tier: g.tier, r: g.r, ed: g.edible('perch'), th: g.threat('perch') }));
    expect(s.tier === 2 && s.r > 29.5 && s.ed && !s.th, 'Splashy Momo can eat perch');
    // 6) the heron: hidden under a pad = safe; in the open = caught
    await game(g => { g.clear(); g.inv = 0; g.padHere(); g.heronNow(); });
    expect(await until(g => g.heron === 'strike', 6000), 'the heron strikes');
    expect(await game(g => g.hearts === 2 && g.momo.hidden), 'hidden under a lily pad, Momo is safe');
    await until(g => g.heron === 'idle', 2000);
    await game(g => { g.noPads(); g.clear(); g.inv = 0; g.heronNow(); });
    expect(await until(g => g.hearts === 1, 6000), 'in the open the heron catches Momo');
    // 7) third catch ends the run
    const final = await game(g => g.score);
    await until(g => g.momo.inv === 0, 4000); await game(g => { g.clear(); const m = g.momo; g.setMomo(m.x, m.y, 0); g.place('cat', 150, 0, 'lunge'); });
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(100);
    s = await state(); expect(s.over && s.best >= final && s.best > 0, 'the last heart ends the run and records the best');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.tier === 0 && Math.abs(g.r - 14) < .01 && g.eaten === 0 && g.heron === 'idle'), 'size, hearts, tier and heron reset');
  },
};
