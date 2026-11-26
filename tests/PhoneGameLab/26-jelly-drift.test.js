// Jelly Drift: tap/Space pulse upward, holding glides (slow sink), threading gaps + pearls scores and raises the
// tier, a bubble shield absorbs one hit, the seabed ends the run, restart is clean, best persists.
module.exports = {
  game: 'PhoneGameLab/games/26-jelly-drift/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => !g.started && g.alive), 'waits for the first pulse');
    const y0 = await game(g => g.y);
    await page.touchscreen.tap(200, 500); await wait(120);
    expect(await game(g => g.started && g.vy < 0), 'tap pulses the jelly upward');
    await wait(120); expect(await game(g => g.y) < y0 - 20, 'pulse gains height');
    await wait(260); await page.keyboard.press('Space'); await wait(60);
    expect(await game(g => g.vy < -200), 'Space pulses too');
    // hold = pulse, then glide: the sink speed is capped while the pointer stays down
    await wait(300); await page.mouse.move(200, 500); await page.mouse.down(); await wait(950);
    const gl = await game(g => ({ vy: g.vy, gliding: g.gliding }));
    expect(gl.gliding && gl.vy > 0 && gl.vy < 90, 'holding spreads the bell and caps the sink speed (vy=' + gl.vy.toFixed(0) + ')');
    await page.mouse.up(); await wait(420);
    expect(await game(g => g.vy) > 160, 'releasing sinks at full speed again');
    // fly the reef with the real pulse/hold actions (same functions the input handlers call)
    await page.evaluate(() => {
      const g = window.__lab.game;
      window.__pilot = setInterval(() => {
        if (!g.alive) return; const n = g.next(), target = n ? n.cy + 14 : g.height * .45;
        if (g.y > target && g.vy > -60) g.pulse();
        g.setHold(!!n && n.type === 2 && Math.abs(n.x) < n.w / 2 + 30 && g.y < target - 6);
      }, 16);
    });
    for (let i = 0; i < 150 && (await game(g => g.passed)) < 9 && !(await state()).over; i++) await wait(200);
    const run = await game(g => ({ passed: g.passed, score: g.score, pearls: g.pearls, tier: g.tier, alive: g.alive }));
    expect(run.alive && run.passed >= 9, 'autopilot threads nine gaps (passed ' + run.passed + ')');
    expect(run.pearls > 0 && run.score > run.passed, 'pearls add combo points on top of one per gap');
    expect(run.tier >= 1, 'eight gaps reach the next depth tier');
    expect((await state()).score === run.score, 'HUD shows the score');
    // shield absorbs one hit, then the seabed ends the run
    await page.evaluate(() => { clearInterval(window.__pilot); window.__lab.game.setHold(false); window.__lab.game.giveShield(); });
    for (let i = 0; i < 40 && await game(g => g.shield); i++) await wait(100);
    expect(await game(g => !g.shield && g.alive), 'bubble shield pops instead of ending the run');
    for (let i = 0; i < 60 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'hitting the reef/seabed without a shield ends the run');
    expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.passed === 0 && g.thread === 0 && g.tier === 0 && !g.shield && g.alive && !g.started), 'state fully reset');
  },
};
