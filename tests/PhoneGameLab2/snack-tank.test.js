// Snack Tank: a tapped snack sinks onto the fish that wants it (score, tummy), the wrong fish bumps it away and it is
// wasted on the sand (streak lost), a streak raises the multiplier, three snacks grow a fish (it swims off, +50),
// four grown fish open the next tank (more kinds), level 4 brings the puffer, the keyboard drops, a fish whose hunger
// runs out sulks and costs a heart, three hearts lost ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/snack-tank/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let r = await game(g => ({ h: g.hearts, l: g.level, n: g.fish().length, k: new Set(g.fish().map(f => f.sp)).size }));
    expect(r.h === 3 && r.l === 1 && r.n === 3 && r.k === 2, 'tank 1: three fish of two kinds, three hearts');
    const T = await game(g => g.tank), cx = Math.round(T.x + T.w / 2), fy = Math.round(T.y + 220), until = async (fn, ms) => { for (let i = 0; i < ms / 100; i++) { if (await game(fn)) return true; await wait(100); } return false; };
    // the right snack: a pellet dropped above a Redfin is eaten
    await game((g, a) => { g.only([[0, a[0], a[1]]]); g.setQueue([0, 1, 1]); }, [cx, fy]);
    await page.touchscreen.tap(cx, T.y + 40); await wait(100);
    expect(await game(g => g.foods().length) === 1, 'tapping the water drops a snack');
    expect(await until(g => g.snacks === 1, 2500), 'the Redfin eats the pellet');
    r = await game(g => ({ s: g.score, fed: g.fish()[0].fed, st: g.streak })); expect(r.s === 10 && r.fed === 1 && r.st === 1, '+10, one tummy pip, streak 1');
    expect((await state()).score === 10, 'HUD shows the score');
    // the wrong snack: a Sunny bumps the pellet away; it lands on the sand → wasted, streak lost
    await game((g, a) => { g.only([[1, a[0], a[1]]]); g.setQueue([0, 1, 1]); }, [cx, fy]);
    await page.touchscreen.tap(cx, T.y + 40);
    expect(await until(g => g.wasted === 1, 4000), 'the pellet is bumped away and wasted on the sand');
    r = await game(g => ({ s: g.score, n: g.snacks, st: g.streak, fed: g.fish()[0].fed })); expect(r.s === 10 && r.n === 1 && r.st === 0 && r.fed === 0, 'the Sunny would not eat it; streak lost');
    // a streak raises the multiplier: four clean feeds pay 10 + 20 + 20 + 30
    await game((g, a) => { g.only([[0, a[0] - 70, a[1]], [0, a[0] + 70, a[1]]]); g.setQueue([0, 0, 0, 0]); }, [cx, fy]);
    for (const dx of [-70, 70, -70, 70]) { await page.touchscreen.tap(cx + dx, T.y + 40); await wait(380); }
    expect(await until(g => g.snacks === 5, 3000), 'four more snacks eaten');
    r = await game(g => ({ s: g.score, m: g.mult, st: g.streak })); expect(r.s === 10 + 80 && r.m === 3 && r.st === 4, 'streak 4 → ×3, paid 10+20+20+30');
    // a third snack grows a fish: it swims off (+50), and the fourth grown fish opens tank 2
    await game(g => g.setQueue([0, 0, 0])); await page.touchscreen.tap(cx - 70, T.y + 40);
    expect(await until(g => g.served === 1, 2500), 'three snacks grow the fish');
    r = await game(g => ({ s: g.score, st: g.fish()[0].state })); expect(r.s === 90 + 30 + 50 && r.st !== 'swim', 'grown fish pays +50 and swims off');
    await game(g => g.setServed(3)); await page.touchscreen.tap(cx + 70, T.y + 40);
    expect(await until(g => g.level === 2, 2500), 'four grown fish open tank 2');
    expect(await until(g => g.fish().filter(f => f.state === 'swim').length >= 3, 4000), 'new baby fish swim in');
    // keyboard: arrows move Bolt's aim, space drops
    const n0 = await game(g => g.foods().length); await page.keyboard.down('ArrowLeft'); await wait(200); await page.keyboard.up('ArrowLeft'); await wait(350); await page.keyboard.press('Space'); await wait(80);
    expect(await game(g => g.foods().length) === n0 + 1, 'space drops a snack');
    await game(g => g.setLevel(4)); expect(await game(g => g.puffer), 'tank 4 brings the greedy puffer');
    // hunger: an empty ring → the fish sulks, a heart is lost; three → the run ends
    await game((g, a) => { g.only([[0, a[0] - 80, a[1]], [1, a[0], a[1]], [2, a[0] + 80, a[1]]]); g.setHunger(0, .001); }, [cx, fy]); await wait(250);
    r = await game(g => ({ h: g.hearts, st: g.fish()[0].state })); expect(r.h === 2 && r.st === 'sulk', 'a hangry fish sulks and costs a heart');
    await game(g => { g.setHunger(1, .001); g.setHunger(2, .001); });
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over && await game(g => g.hearts) === 0, 'no hearts left ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.level === 1 && g.served === 0 && g.snacks === 0 && !g.puffer && g.fish().length === 3), 'hearts, tank, fish and counters reset');
  },
};
