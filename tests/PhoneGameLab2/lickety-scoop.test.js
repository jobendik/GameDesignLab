// Lickety Scoop: holding a tub grows a scoop and releasing places it on the cone graded by size; the wrong flavour and
// an over-held (burst) scoop are gulped by Momo; a scoop bigger than the one below topples the cone; a finished cone is
// served and paid; keyboard scooping; cherry orders need the cherry jar; walk-outs cost hearts and three end the run;
// restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/lickety-scoop/index.html',
  timeout: 70000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const until = async (fn, ms, arg) => { for (let i = 0; i < ms / 50; i++) { if (await game(fn, arg)) return true; await wait(50); } return false; };
    expect(await until(g => !!g.order, 4000), 'the first customer reaches the window with an order');
    expect(await game(g => g.hearts === 3 && g.level === 1), 'three hearts, level 1');
    // hold with the real mouse until the scoop reaches `v`, then let go
    const scoop = async (f, v) => { const p = await game((g, f) => g.tub(f), f); await page.mouse.move(p.x, p.y); await page.mouse.down();
      await until((g, v) => !g.holding || g.holding.size >= v, 4000, v); await page.mouse.up(); await wait(80); };
    await game(g => g.setOrder([[1, 2], [0, 1]]));
    await scoop(1, .92);
    let r = await game(g => ({ st: g.stack, s: g.score })); expect(r.st.length === 1 && r.st[0].f === 1 && r.st[0].grade >= 2 && r.s >= 15, 'a large strawberry scoop lands on the cone and is graded');
    await wait(100); expect((await state()).score === r.s, 'HUD shows the score');
    await scoop(1, .4);
    r = await game(g => ({ n: g.stack.length, gl: g.gulps })); expect(r.n === 1 && r.gl === 1, 'the wrong flavour is gulped by Momo, the cone is untouched');
    const pat0 = await game(g => g.order.pat); await scoop(0, 1.08);
    r = await game(g => ({ n: g.stack.length, pat: g.order.pat })); expect(r.n === 0 && r.pat < pat0 - 2.5, 'a scoop bigger than the one below topples the cone (−3 s patience)');
    await scoop(1, 2);
    r = await game(g => ({ gl: g.gulps, h: g.holding })); expect(r.gl === 2 && !r.h, 'holding too long bursts the scoop');
    // a clean cone is served and paid
    const s0 = await game(g => g.score); await scoop(1, .92); await scoop(0, .7);
    r = await game(g => ({ sv: g.served, s: g.score, line: g.line() })); expect(r.sv === 1 && r.s > s0 + 50 && r.line[0] === 'served', 'L strawberry + M vanilla is served and paid with a tip');
    // keyboard: hold "1" to scoop vanilla, release to place
    expect(await until(g => !!g.order, 6000), 'next customer steps up');
    await game(g => g.setOrder([[0, 2], [1, 0]])); await page.keyboard.down('1'); await until(g => g.holding && g.holding.size >= .92, 3000); await page.keyboard.up('1'); await wait(120);
    r = await game(g => g.stack); expect(r.length === 1 && r[0].f === 0 && r[0].grade >= 2, 'keyboard scoop placed');
    // cherry on top: the cone is only served once the cherry jar is tapped
    await game(g => { g.setLevel(4); g.setOrder([[0, 1]], true); }); await scoop(0, .7);
    expect(await game(g => g.stack.length === 1 && g.served === 1), 'cherry order waits for its cherry');
    const ch = await game(g => g.cherry); await page.touchscreen.tap(ch.x, ch.y); await wait(150);
    expect(await game(g => g.served === 2), 'tapping the cherry jar finishes and serves the cone');
    // walk-outs: three empty patience bars close the window
    for (let k = 0; k < 3 && !(await state()).over; k++) { await until(g => !!g.order, 9000); await game(g => g.setPat(.05)); await wait(250); }
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over && await game(g => g.hearts) === 0, 'three walk-outs end the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.level === 1 && g.served === 0 && g.stack.length === 0 && g.gulps === 0), 'hearts, level, cone and counters reset');
  },
};
