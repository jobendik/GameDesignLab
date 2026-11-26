// Star Jar: drops create bodies, equal tiers fuse and score, overflow ends the run, restart is clean, best persists.
module.exports = {
  game: 'PhoneGameLab/games/37-star-jar/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    // two drops in the same column: either both rest (2 bodies) or they fused (1 body + score)
    await game(g => { g.setAim(100); g.drop(); }); await wait(700);
    expect(await game(g => g.bodies.length) === 1, 'first drop creates one body');
    // force a deterministic fusion: stack identical tiers by reading the held tier
    let fused = false;
    for (let i = 0; i < 14 && !fused; i++) {
      const before = await game(g => g.score);
      await game(g => { const t = g.held, same = g.bodies.filter(b => b.tier === t).sort((a, b) => a.y - b.y)[0]; g.setAim(same ? same.x : 60 + Math.random() * 270); g.drop(); });
      await wait(900);
      fused = (await game(g => g.score)) > before;
    }
    expect(fused, 'dropping onto an equal body fuses and scores');
    expect((await state()).score > 0, 'HUD score updated');
    // touch input: drag + release drops a body
    const n0 = await game(g => g.bodies.length), s0 = await game(g => g.score);
    await page.touchscreen.tap(320, 400); await wait(600);
    expect((await game(g => g.bodies.length)) > n0 || (await game(g => g.score)) > s0, 'tap drops a body');
    // overflow → game over. Giants (tiers 9/10) are too wide to sit side by side, so an alternating
    // column cannot fuse and must tower past the line.
    await game(g => { [9, 10, 9, 10].forEach((t, i) => g.spawn(t, 195, 560 - i * 230)); });
    for (let i = 0; i < 60 && !(await state()).over; i++) await wait(250);
    const s = await state(); expect(s.over, 'jar overflow ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.bodies.length) === 0, 'no bodies after restart');
  },
};
