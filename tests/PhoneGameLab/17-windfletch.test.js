// Windfletch: real pull-back drags loose arrows; hits score and build the streak multiplier, wind is a live force,
// misses cost arrows, an empty quiver ends the run, restart is clean, best persists.
module.exports = {
  game: 'PhoneGameLab/games/17-windfletch/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.quiver) === 5 && await game(g => g.score) === 0, 'fresh run: 5 arrows, 0 points');
    await wait(600);
    // a pull-back drag anywhere on the stage: pull vector is opposite to the shot, its length sets the power
    const shoot = async (ang, power) => {
      const m = await game(g => ({ min: g.pullMin, max: g.pullMax })), len = m.min + power * (m.max - m.min), sx = 250, sy = 600;
      await page.mouse.move(sx, sy); await page.mouse.down();
      await page.mouse.move(sx - Math.cos(ang) * len, sy - Math.sin(ang) * len, { steps: 5 }); await wait(120);
      await page.mouse.up();
    };
    // 1) an aimed full-ish draw hits the first target
    let s = await game(g => g.solve(.9)); expect(s && s.err < 1, 'a solution exists for the opening target');
    await shoot(s.ang, s.power); await wait(300);
    await wait(900);
    const sc1 = await game(g => g.score);
    expect(sc1 >= 10 && await game(g => g.hits) === 1, 'aimed drag hits the target and scores (score ' + sc1 + ')');
    expect((await state()).score === sc1, 'HUD score mirrors game score');
    expect(await game(g => g.streak) === 1 && await game(g => g.quiver) >= 5, 'a hit keeps the arrow and starts a streak');
    await wait(700);
    // 2) second consecutive hit is worth double (streak ×2)
    s = await game(g => g.solve(.9)); await shoot(s.ang, s.power); await wait(1300);
    const sc2 = await game(g => g.score);
    expect(await game(g => g.streak) === 2 && sc2 - sc1 >= 20 && (sc2 - sc1) % 20 === 0, 'second hit in a row is multiplied ×2 (+' + (sc2 - sc1) + ')');
    await wait(600);
    // 3) a shot into the grass is a miss: costs an arrow and breaks the streak
    const q0 = await game(g => g.quiver);
    await shoot(.4, .5); await wait(1200);
    expect(await game(g => g.quiver) === q0 - 1, 'a miss costs one arrow');
    expect(await game(g => g.streak) === 0 && await game(g => g.score) === sc2, 'a miss resets the streak and scores nothing');
    // 4) a tap (no pull) does not loose an arrow
    await page.mouse.click(200, 500); await wait(300);
    expect(await game(g => g.flying) === 0 && await game(g => g.quiver) === q0 - 1, 'a tap without a pull does not fire');
    // 5) wind is a real force from range 2 on: the same shot lands elsewhere, and a wind-aware shot still hits
    await game(g => { g.setLevel(4); g.next(); }); await wait(900);
    const w = await game(g => g.wind); expect(Math.abs(w) > .2, 'wind blows at range 4 (' + w.toFixed(2) + ')');
    const h0 = await game(g => g.hits);
    s = await game(g => g.solve(1)); expect(s && s.err < 2, 'windy target is reachable');
    await shoot(s.ang, s.power); await wait(1500);
    expect(await game(g => g.hits) === h0 + 1, 'wind-compensated shot hits the bobbing target');
    // 6) keyboard: hold Space to draw, release to loose
    await wait(500);
    await page.keyboard.down('ArrowDown'); await wait(900); await page.keyboard.up('ArrowDown');
    const q1 = await game(g => g.quiver);
    await page.keyboard.down('Space'); await wait(500); await page.keyboard.up('Space'); await wait(120);
    expect(await game(g => g.flying) === 1 || await game(g => g.quiver) < q1, 'Space draws and looses an arrow');
    // 7) empty the quiver → game over
    for (let i = 0; i < 12 && !(await state()).over; i++) { await shoot(.42, .4); await wait(650); }
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    const e = await state(); expect(e.over, 'an empty quiver ends the run'); expect(e.best >= e.score && e.best > 0, 'best score recorded');
    // 8) restart
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.quiver) === 5 && await game(g => g.hits) === 0 && await game(g => g.level) === 1 && await game(g => g.wind) === 0, 'state fully reset');
  },
};
