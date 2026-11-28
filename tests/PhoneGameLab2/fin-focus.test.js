// Fin Focus: a mouse/finger hold steers the diving bell; a wanted fish held in the viewfinder while gliding gently fills
// the focus ring and snaps a photo (slot filled, score, air top-up); moving fast stops the focus; a puffer only counts
// puffed; a shy blushfin flees a fast bell; two wanted fish in one frame pay ×1.5 and a centred shot ×1.5; a full page
// refills the air and opens the next page; a jelly zaps air away; running out of air ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/fin-focus/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await game(fn)) return true; await wait(50); } return false; };
    const still = () => until(g => Math.hypot(g.bell.vx, g.bell.vy) < 20, 6000);
    expect((await state()).running, 'running after autostart');
    expect(await game(g => g.page === 1 && g.slots().length === 3 && g.air > .95), 'page 1: three photos wanted, full air');
    await game(g => { g.clearJellies(); g.clearFish(); g.setBell(500, 300); });
    // 1) steering: hold the pointer to the right of the bell
    const b0 = await game(g => g.bell), [sx, sy] = await game((g, b) => g.toScreen(b.x + 150, b.y), b0);
    await page.mouse.move(sx, sy); await page.mouse.down(); await wait(700);
    let b = await game(g => g.bell); expect(b.x > b0.x + 40 && b.face === 1 && b.vx > 60, 'holding to the right drives the bell right');
    // 2) moving fast: no focus even with a wanted fish in the frame
    await game(g => g.setSlots(['stripe', 'sunny', 'glow']));
    for (let i = 0; i < 6; i++) { await game(g => { g.clearFish(); g.place('stripe', 0, 0); }); await wait(90); }
    let s = await game(g => ({ focus: g.focus, done: g.slots()[0].done, v: Math.hypot(g.bell.vx, g.bell.vy) }));
    expect(s.v > 85 && s.focus < .3 && !s.done, 'a fast bell cannot focus');
    await page.mouse.up(); await still();
    // 3) glide gently: focus fills, click
    await game(g => { g.clearFish(); g.air = .5; });
    const a0 = await game(g => ({ score: g.score, air: g.air }));
    await game(g => g.place('stripe', 0, 0));
    expect(await until(g => g.slots()[0].done, 3000), 'a steady frame snaps the stripey');
    s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, air: __lab.game.air, photos: __lab.game.photos }));
    expect(s.score === a0.score + 30 && s.hud === s.score && s.photos === 1, 'a centred stripey scores 20 × 1.5');
    expect(s.air > a0.air + .04, 'a wanted photo tops up the air');
    // 4) two wanted fish in one frame, off-centre
    await wait(800); await game(g => g.clearFish());
    const c0 = await game(g => g.score);
    await game(g => { g.place('sunny', -34, 0); g.place('glow', 34, 0); });
    expect(await until(g => g.slots()[1].done && g.slots()[2].done, 3000), 'both fish in one frame are snapped together');
    expect(await game((g, c0) => g.score - c0, c0) >= Math.round((10 + 50) * 1.5), 'a double shot pays ×1.5');
    // 5) page done → page 2, air refilled
    expect(await until(g => g.page === 2, 3000), 'a full page opens page 2');
    s = await game(g => ({ air: g.air, n: g.slots().length, done: g.slots().some(x => x.done), score: g.score }));
    expect(s.air > .97 && s.n === 3 && !s.done && s.score > c0 + 90, 'page 2: fresh slots, full air and a page bonus');
    // 6) puffer only counts puffed
    await game(g => { g.clearFish(); g.setSlots(['puffer', 'blush', 'sunny']); }); await still();
    await game(g => g.place('puffer', 0, 0, true)); await wait(1300);
    expect(!(await game(g => g.slots()[0].done)), 'a flat puffer does not count');
    await game(g => { g.clearFish(); g.place('puffer', 0, 0, false); });
    expect(await until(g => g.slots()[0].done, 4000), 'the puffer puffs up close and is snapped');
    // 7) shy blushfin flees a fast bell
    await wait(800); await game(g => { g.clearFish(); g.setBell(700, 950); }); await wait(100); const bb = await game(g => g.bell);
    const id = await game((g, bb) => { const v = g.vf(); return g.place('blush', bb.x + 165 - v.x, bb.y - v.y, false); }, bb);
    const [tx, ty] = await game((g, b) => g.toScreen(b.x + 125, b.y), bb); await page.mouse.move(tx, ty); await page.mouse.down(); await wait(500);
    expect(await game((g, id) => g.fish().find(f => f.id === id).flee > 0, id), 'the blushfin flees a fast bell');
    await page.mouse.up();
    // 8) a jelly zaps
    await still(); const z0 = await game(g => ({ air: g.air, zaps: g.zaps }));
    await game(g => g.jellyAt(0, 0)); await wait(200);
    s = await game(g => ({ air: g.air, zaps: g.zaps })); expect(s.zaps === z0.zaps + 1 && s.air < z0.air - .1, 'a jelly zap costs air');
    // 9) out of air
    const final = await game(g => g.score); await game(g => { g.air = .002; });
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(100);
    s = await state(); expect(s.over && s.best >= final && s.best > 0, 'empty air ends the run and records the best');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.page === 1 && g.photos === 0 && g.air > .95 && g.zaps === 0 && g.slots().every(x => !x.done)), 'page, air and album reset');
  },
};
