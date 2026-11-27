// Last Slice: touch placement (square -> card, and armed card -> square), path squares refuse towers, waves spawn and
// towers kill for sugar + score, upgrade / sell, speed toggle, early-call bonus, leaks eat the pie -> game over,
// clean restart, a strong defence wins all twelve waves and unlocks the next picnic.
module.exports = {
  game: 'PhoneGameLab/games/64-last-slice/index.html',
  async run({ page, expect, wait, state, game }) {
    const tapCell = async (c, r) => { const p = await game((g, a) => g.cellXY(a[0], a[1]), [c, r]); await page.touchscreen.tap(p.x, p.y); await wait(120); };
    const tapBtn = async id => { const p = await game((g, a) => g.btn(a), id); await page.touchscreen.tap(p.x, p.y); await wait(120); };
    expect((await state()).running, 'game running after autostart');
    const g0 = await game(g => ({ gold: g.gold, lives: g.lives, wave: g.wave, lvl: g.level, spots: g.spots.slice(0, 16), path: g.path[3] }));
    expect(g0.gold === 150 && g0.lives === 8 && g0.wave === 0 && g0.lvl === 1, 'fresh picnic: 150 sugar, 8 slices, wave 0');
    // square first, then card
    await tapCell(g0.spots[0].c, g0.spots[0].r);
    expect(await game(g => g.sel && !g.sel.tower && g.towers.length === 0), 'first tap only selects the square');
    await tapBtn(0);
    expect(await game(g => g.towers.length === 1 && g.towers[0].type === 0 && g.gold === 100 && !g.sel), 'card builds a Shaker on the selected square');
    // a trail square cannot be selected or built on
    await tapCell(g0.path.c, g0.path.r);
    expect(await game(g => !g.sel && g.towers.length === 1), 'trail squares refuse towers');
    // card first (armed), then square
    await tapBtn(1); expect(await game(g => g.armed) === 1, 'tapping a card with nothing selected arms it');
    await tapCell(g0.spots[1].c, g0.spots[1].r);
    expect(await game(g => g.towers.length === 2 && g.towers[1].type === 1 && g.gold === 20), 'armed card builds on tap');
    await tapBtn(1); expect(await game(g => g.armed) === -1, 'tapping the card again disarms');
    // start the wave with the button; bugs spawn; towers earn sugar and score
    await tapBtn('next');
    expect(await game(g => g.wave === 1 && g.queue > 0), 'next-wave button starts wave 1');
    const k = await game(g => { g.step(60 * 6); return { kills: g.kills, score: g.score, gold: g.gold, nextT: g.nextT, queue: g.queue, wave: g.wave }; });
    expect(k.kills >= 2 && k.score > 0 && k.gold > 20, 'towers squash bugs for sugar and score');
    expect((await state()).score === k.score, 'HUD score follows');
    expect(k.wave === 1 && k.queue === 0 && k.nextT > 5, 'countdown to the next wave runs once the wave has marched in');
    await tapBtn('next');
    const e = await game(g => ({ wave: g.wave, gold: g.gold }));
    expect(e.wave === 2 && e.gold === k.gold + Math.ceil(k.nextT) * 2, 'calling the wave early pays a sugar bonus');
    // upgrade and sell through the tower panel
    await game(g => g.setGold(500));
    await tapCell(g0.spots[0].c, g0.spots[0].r);
    expect(await game(g => g.sel && g.sel.tower === g.towers[0]), 'tapping a tower selects it');
    await tapBtn(1);
    const u = await game(g => ({ tier: g.towers[0].tier, gold: g.gold, spent: g.towers[0].spent }));   // bugs keep dying meanwhile, so sugar may tick up
    expect(u.tier === 1 && u.spent === 95 && u.gold >= 455 && u.gold < 500, 'upgrade raises the tier and costs sugar');
    await tapBtn(3);
    expect(await game((g, a) => g.towers.length === 1 && g.gold >= a + 66, u.gold), 'sell refunds 70 %');
    await tapBtn('speed'); expect(await game(g => g.speed) === 2, 'speed button toggles 2x'); await tapBtn('speed');
    // no defence: bugs reach the pie until no slice is left
    await game(g => { g.clearTowers(); for (let i = 0; i < 40 && !g.over; i++) { g.step(300); g.callNext(); } });
    await wait(200);
    const s = await state(); expect(s.over && await game(g => g.lives === 0 && !g.won), 'losing every slice ends the run');
    expect(s.best > 0 && s.best >= s.score, 'best recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.gold === 150 && g.lives === 8 && g.wave === 0 && g.towers.length === 0 && g.enemies.length === 0), 'board reset after restart');
    // a full, upgraded defence wins all twelve waves
    const w = await game(g => { g.setGold(1e6); g.spots.slice(0, 16).forEach((s, i) => { const t = g.build(s.c, s.r, [0, 3, 1, 2][i % 4]); g.upgrade(t); g.upgrade(t); }); g.setGold(0);
      for (let i = 0; i < 400 && !g.over; i++) { g.callNext(); g.step(300); } return { over: g.over, won: g.won, wave: g.wave, score: g.score, lives: g.lives }; });
    expect(w.over && w.won && w.wave === 12 && w.score > 5000 && w.lives > 0, 'a strong defence survives wave 12 and wins');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    expect(await game(g => g.level) === 2, 'winning unlocks the next, tougher picnic');
  },
};
