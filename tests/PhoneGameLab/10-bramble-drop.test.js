// Bramble Drop: the bramble creeps, a dragged shot that completes a trio pops it and drops what hung below (scored
// separately), a wasted shot sticks and breaks the streak, swap/keyboard work, reaching the hedge ends the run.
module.exports = {
  game: 'PhoneGameLab/games/10-bramble-drop/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect((await game(g => g.count)) >= 60, 'bramble is seeded with berries');
    const low0 = await game(g => g.low); await wait(900);
    expect((await game(g => g.low)) > low0 + 5, 'the bramble moves down on its own');
    expect((await game(g => g.trace(1.25))).bounces >= 1, 'steep shots are previewed bouncing off the wall');
    // aim with a real drag: scan the game's own preview for an angle whose landing cell completes 3+
    const shootAt = async want => {
      const a = await game((g, want) => { let best = null; for (let a = -1.3; a <= 1.3; a += .01) { const t = g.trace(a); if (t && (want ? t.group >= 3 : t.group < 3) && (!best || Math.abs(a) < Math.abs(best))) best = a; } return best; }, want);
      expect(a != null, 'found an angle for a ' + (want ? 'matching' : 'wasted') + ' shot');
      const sh = await game(g => g.shooter);
      await page.mouse.move(sh.x, sh.y - 50); await page.mouse.down(); await page.mouse.move(sh.x + Math.sin(a) * 170, sh.y - Math.cos(a) * 170, { steps: 4 }); await wait(80);
      expect(!(await game(g => g.flying)), 'holding the aim does not fire'); await page.mouse.up();
      await wait(60); expect(await game(g => g.flying), 'release flings the berry');
      for (let i = 0; i < 40 && await game(g => g.flying); i++) await wait(50);
    };
    // two raspberries (0) under a gooseberry row (3), with two other berries hanging from them
    await game(g => g.setup(['3333333333', '...00....', '....1.....', '...2.....'], 0, 1));
    expect((await game(g => g.count)) === 14, 'hand-made bramble in place');
    const s0 = await game(g => g.score);
    await shootAt(true); await wait(900);
    expect((await game(g => g.count)) === 10, 'the trio popped and the berries hanging from it fell');
    expect((await game(g => g.popped)) >= 3 && (await game(g => g.dropped)) === 2, 'popped / dropped counted separately');
    expect((await game(g => g.score)) - s0 === 30 + 20 + 40, 'score = 10 per popped berry + rising drop bonus');
    expect((await game(g => g.streak)) === 1 && (await state()).score === (await game(g => g.score)), 'streak started, HUD updated');
    // a second popping shot in a row doubles the multiplier
    await game(g => g.setup(['3333333333', '...00....'], 0, 1)); const s1 = await game(g => g.score);
    await shootAt(true); await wait(600);
    expect((await game(g => g.streak)) === 2 && (await game(g => g.score)) - s1 === 60, 'second pop in a row scores ×2');
    // a wasted shot sticks, scores nothing and breaks the streak
    await game(g => g.setup(['3333333333'], 0, 1)); const s2 = await game(g => g.score);
    await shootAt(false); await wait(300);
    expect((await game(g => g.count)) === 11 && (await game(g => g.score)) === s2 && (await game(g => g.streak)) === 0, 'wasted shot sticks and resets the streak');
    // swap by tapping the nest; keyboard aim + fire
    const [c, n] = await game(g => [g.cur, g.next]), sh = await game(g => g.shooter);
    await game(g => g.setup(['3333333333'], 0, 1)); await page.touchscreen.tap(sh.x - 86, sh.y + 20); await wait(150);
    expect(await game(g => g.cur === 1 && g.next === 0), 'tapping the nest swaps the berries in hand');
    expect(!(await game(g => g.flying)), 'a tap on the nest does not fire');
    await page.keyboard.down('ArrowLeft'); await wait(250); await page.keyboard.up('ArrowLeft'); await page.keyboard.press('Space'); await wait(700);
    expect((await game(g => g.count)) === 11, 'keyboard aim + space fires a berry');
    // lose: a long bramble creeps the last few pixels to the hedge, the countdown runs out
    await game(g => g.setup(Array.from({ length: 19 }, (_, r) => (r % 2 ? '012301230' : '0123012301')), 0, 1));
    expect((await game(g => g.low)) < (await game(g => g.deadY)), 'long bramble starts just above the hedge');
    await game(g => g.thaw());
    for (let i = 0; i < 80 && !(await state()).over; i++) await wait(250);
    const s = await state(); expect(s.over, 'reaching the hedge ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.streak === 0 && g.rows === 0 && g.popped === 0 && g.falling === 0 && g.overT === 0 && g.count >= 60), 'state fully reset');
  },
};
