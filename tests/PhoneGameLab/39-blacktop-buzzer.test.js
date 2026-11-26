// Blacktop Buzzer: real pull-back drags shoot; a solved pull swishes (points + time back), a flat pull airballs and resets
// the streak, three makes in a row light the ball on fire (double points), four makes raise the level, the clock running
// out ends the run after the last ball lands, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/39-blacktop-buzzer/index.html',
  timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms) => { for (let t = 0; t < ms; t += 50) { if (await game(fn)) return true; await wait(50); } return false; };
    const shoot = async flat => {
      expect(await until(g => g.ready, 3000), 'a ball is ready');
      const p = await game((g, flat) => g.pullFor(flat), flat), sx = 190, sy = 330;
      await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx + p.dx, sy + p.dy, { steps: 5 }); await wait(60); await page.mouse.up(); await wait(60);
    };
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.score === 0 && g.level === 1 && g.shots === 0 && g.time > 43 && g.time <= 45), 'fresh run: level 1, 45 s on the clock');

    // 1) a tap is not a shot
    await page.mouse.click(200, 400); await wait(150);
    expect(await game(g => g.shots) === 0, 'a tap without a pull does not shoot');

    // 2) a solved pull-back swishes: points and time back
    const t0 = await game(g => g.time);
    await shoot(false);
    expect(await game(g => g.shots === 1 && g.balls === 1), 'drag-release launches one ball');
    expect(await until(g => g.makes === 1, 4000), 'the ball drops through the hoop');
    const a = await game(g => ({ score: g.score, sw: g.swishes, time: g.time, streak: g.streak }));
    expect(a.score === 3 && a.sw === 1 && a.streak === 1, 'a clean swish scores 2 + 1 (got ' + a.score + ')');
    expect(a.time > t0, 'the make put time back on the clock'); expect((await state()).score === 3, 'HUD score mirrors game score');

    // 3) a flat throw airballs: no points, streak reset
    await shoot(true); expect(await until(g => g.balls === 0, 6000), 'airball lands and clears');
    expect(await game(g => g.score === 3 && g.makes === 1 && g.shots === 2 && g.streak === 0), 'a miss scores nothing and resets the streak');

    // 4) three makes in a row → ON FIRE, and the next make counts double
    for (let i = 0; i < 3; i++) { const m = await game(g => g.makes); await shoot(false); expect(await page.waitForFunction(m => window.__lab.game.makes === m + 1, m, { timeout: 4000 }).then(() => true, () => false), 'make ' + (i + 1) + ' of the streak'); }
    expect(await game(g => g.fire && g.streak === 3), 'three in a row sets the ball on fire');
    expect(await game(g => g.level) === 2, 'four makes reach level 2');
    const s1 = await game(g => g.score); await shoot(false); await page.waitForFunction(() => window.__lab.game.makes === 5, null, { timeout: 4000 });
    const gain = (await game(g => g.score)) - s1; expect(gain >= 6 && gain % 2 === 0, 'a make while on fire scores double (+' + gain + ')');

    // 5) keyboard: Space shoots with the keyboard aim
    expect(await until(g => g.ready, 3000), 'ball ready'); const n = await game(g => g.shots);
    await page.keyboard.press('Space'); await wait(120); expect(await game(g => g.shots) === n + 1, 'Space shoots');

    // 6) the clock runs out → final buzzer once the last ball is down
    await game(g => { g.time = .5; });
    for (let i = 0; i < 50 && !(await state()).over; i++) await wait(200);
    const e = await state(); expect(e.over, 'time up ends the run'); expect(await game(g => g.time === 0 && g.ended), 'clock at zero');
    expect(e.best >= e.score && e.score >= s1 + gain, 'best score recorded');

    // 7) restart is clean
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.makes === 0 && g.shots === 0 && g.streak === 0 && !g.fire && g.level === 1 && g.time > 43 && g.balls === 0), 'state fully reset');
  },
};
