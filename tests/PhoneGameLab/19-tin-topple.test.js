// Tin Topple: real pull-back drags fire the toy cannon; bonking bots scores, clearing a fort banks spare balls and
// advances, running out of balls costs a life and rebuilds the fort, three lost lives end the run, the last fort wins,
// restart is clean.  Shots are found with the game's own dry-run solver (same fixed-step rules, no events).
module.exports = {
  game: 'PhoneGameLab/games/19-tin-topple/index.html',
  timeout: 150000,
  async run({ page, expect, wait, state, game }) {
    const until = (cond, ms) => page.evaluate(([f, ms]) => new Promise(res => { const t0 = performance.now(), c = new Function('g', 'return (' + f + ')(g)'); (function loop() { if (c(window.__lab.game)) res(true); else if (performance.now() - t0 > ms) res(false); else requestAnimationFrame(loop); })(); }), [cond.toString(), ms]);
    // pull-back drag: the pull vector is opposite to the shot, its length sets the power
    const shoot = async (ang, power) => {
      const m = await game(g => ({ min: g.pullMin, max: g.pullMax })), len = m.min + power * (m.max - m.min), sx = 250, sy = 420;
      await page.mouse.move(sx, sy); await page.mouse.down();
      await page.mouse.move(sx - Math.cos(ang) * len, sy - Math.sin(ang) * len, { steps: 5 }); await wait(100);
      await page.mouse.up();
    };
    expect((await state()).running, 'game running after autostart');
    expect(await until(g => g.state === 'play', 4000), 'fort 1 is built and play begins');
    expect(await game(g => g.level === 1 && g.lives === 3 && g.balls === 3 && g.bots === 2 && g.score === 0), 'fresh run: fort 1, 3 lives, 3 balls, 2 bots');

    // 1) a tap does not fire
    await page.mouse.click(200, 400); await wait(200);
    expect(await game(g => g.balls) === 3 && await game(g => g.flying) === 0, 'a tap without a pull does not fire');

    // 2) aimed drags bonk the bots of fort 1
    let fired = 0;
    while (await game(g => g.state === 'play' && g.bots > 0 && g.balls > 0)) {
      const s = await game(g => g.solve()); expect(s && s.kills > 0, 'solver finds a useful shot');
      const before = await game(g => ({ bots: g.bots, score: g.score, balls: g.balls }));
      await shoot(s.ang, s.power); fired++; await wait(150);
      expect(await game(g => g.balls) === before.balls - 1, 'a drag-release fires one ball');
      await until(g => g.flying === 0 || g.state !== 'play', 9000);
      const after = await game(g => ({ bots: g.bots, score: g.score }));
      expect(after.bots < before.bots && after.score >= before.score + 500, 'the shot bonks a bot for at least 500');
    }
    expect(await game(g => g.bots) === 0, 'fort 1 cleared in ' + fired + ' shot(s)');
    const sc1 = await game(g => g.score);
    // 3) spare balls are banked (+300 each) and the next fort is built with its own allotment
    expect(await until(g => g.level === 2 && g.state === 'play', 8000), 'next fort is built');
    const sc2 = await game(g => g.score);
    expect(sc2 === sc1 + 300 * (3 - fired), 'spare balls banked: +' + (sc2 - sc1));
    expect(await game(g => g.balls === 3 && g.bots === 2 && g.lives === 3), 'fort 2 starts with fresh balls');
    expect((await state()).score === sc2, 'HUD score mirrors game score');

    // 4) keyboard: arrows aim, Space fires
    await page.keyboard.down('ArrowUp'); await wait(300); await page.keyboard.up('ArrowUp');
    await page.keyboard.press('Space'); await wait(150);
    expect(await game(g => g.balls) === 2, 'Space fires a ball');
    await until(g => g.flying === 0 || g.state !== 'play', 9000);

    // 5) wasting every ball costs a life and rebuilds the same fort
    await game(g => g.loadLevel(2)); expect(await until(g => g.state === 'play', 4000), 'fort 3 loaded');
    const waste = async () => { while (await game(g => g.state === 'play' && g.balls > 0)) { await shoot(-1.5, .12); await wait(700); } };
    await waste();
    expect(await until(g => g.lives === 2, 9000), 'out of balls with bots standing costs a life');
    expect(await until(g => g.state === 'play', 6000) && await game(g => g.level === 3 && g.balls === 2 && g.bots === 3), 'the fort is rebuilt for another try');

    // 6) three lost lives → game over
    await waste(); expect(await until(g => g.lives === 1 && g.state === 'play', 12000), 'second life lost');
    await waste();
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(250);
    const e = await state(); expect(e.over, 'no lives left ends the run'); expect(e.best >= e.score && e.best > 0, 'best score recorded');

    // 7) restart is clean
    await wait(1300); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await until(g => g.state === 'play', 4000) && await game(g => g.level === 1 && g.lives === 3 && g.balls === 3 && g.bots === 2 && g.bonked === 0), 'state fully reset');

    // 8) clearing the last fort wins the run
    await game(g => g.loadLevel(g.levels - 1)); expect(await until(g => g.state === 'play', 4000), 'last fort loaded');
    while (await game(g => g.state === 'play' && g.bots > 0 && g.balls > 0)) { const s = await game(g => g.solve()); await game((g, s) => g.fire(s.ang, s.power), s); await wait(200); await until(g => g.flying === 0 || g.state !== 'play', 9000); await wait(300); }
    expect(await game(g => g.bots) === 0, 'last fort cleared');
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(250);
    const w = await state(); expect(w.over && w.score > 3000, 'clearing the last fort ends the run with a win (score ' + w.score + ')');
  },
};
