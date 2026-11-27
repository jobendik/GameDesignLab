// Shoo!: holding previews a flock, releasing shoos it for n(n-1)*5; lone birds stay; birds fall and columns close up so
// new flocks form; pigeons bolt beside 4+; the whistle removes one bird; a clean sweep that meets the quota advances
// the roof; a missed quota ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/45-shoo/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const settled = () => page.waitForFunction(() => window.__lab.game.settled && window.__lab.game.state === 'play', null, { timeout: 12000 });
    const xy = (c, i) => game((g, a) => g.cellXY(a[0], a[1]), [c, i]);
    const click = async (c, i) => { const p = await xy(c, i); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.up(); await wait(80); };
    await settled();
    let s = await game(g => ({ left: g.left, level: g.level, quota: g.quota, whistles: g.whistles }));
    expect(s.left === 72 && s.level === 1 && s.quota === 1000 && s.whistles === 1, 'roof 1: 72 birds, quota 1000, one whistle');
    // 1) press previews the flock and its value, release shoos it
    const big = await game(g => g.groups().sort((a, b) => b.n - a.n)[0]); expect(big && big.n >= 2, 'a flock exists');
    let p = await xy(big.c, big.i); await page.mouse.move(p.x, p.y); await page.mouse.down(); await wait(60);
    const hv = await game(g => g.hover); expect(hv && hv.n === big.n && hv.pts === big.n * (big.n - 1) * 5, 'holding shows the flock size and value');
    expect(await game(g => g.left) === 72, 'nothing leaves until release'); await page.mouse.up(); await wait(100);
    s = await game(g => ({ left: g.left, score: g.score })); expect(s.left === 72 - big.n && s.score === big.n * (big.n - 1) * 5, 'flock of ' + big.n + ' scores n(n-1)*5');
    expect((await state()).score === s.score, 'HUD score updated'); await settled();
    // 2) a lone bird does not budge
    await game(g => g.setCols([[0, 1, 0], [1, 0, 1], [2, 2]])); await click(0, 0);
    s = await game(g => ({ left: g.left, score: g.score })); expect(s.left === 8, 'single birds cannot be shooed');
    // 3) pigeons bolt when 4+ leave beside them
    const s3 = s.score; await game(g => g.setCols([[0, 0, 0, 0, 6], [1, 1], [2, 2]])); await click(0, 1);
    s = await game(g => ({ score: g.score, cols: g.cols })); expect(s.score - s3 === 85 && !s.cols.flat().includes(6), 'flock of 4 takes the pigeon with it (60 + 25)');
    expect(JSON.stringify(s.cols.slice(0, 2)) === '[[1,1],[2,2]]', 'emptied column closes up');
    // 4) whistle removes one bird (keyboard toggle + click), gravity then makes a new flock
    await game(g => { g.setCols([[0, 1, 0], [3, 3], [2, 4]]); g.setWhistles(1); }); await page.keyboard.press('w'); expect(await game(g => g.whistleMode), 'whistle armed');
    await click(0, 1); s = await game(g => ({ whistles: g.whistles, cols: g.cols, groups: g.groups() }));
    expect(s.whistles === 0 && JSON.stringify(s.cols[0]) === '[0,0]', 'whistle scares one bird and the one above drops'); expect(s.groups.some(q => q.c === 0 && q.n === 2), 'the drop created a flock');
    // 5) keyboard cursor shoos; touch taps finish a clean sweep that meets the quota → roof 2
    await game(g => g.setCols([[0, 0, 1], [2, 2], [1, 3, 3]])); const s5 = await game(g => g.score);
    await page.keyboard.press('Enter'); await page.keyboard.press('Space'); await wait(100);
    s = await game(g => ({ score: g.score, cols: g.cols, groups: g.groups() })); expect(s.score === s5 + 10 && JSON.stringify(s.cols[0]) === '[1]', 'keyboard shoo works');
    p = await xy(1, 0); await page.touchscreen.tap(p.x, p.y); await wait(120);
    s = await game(g => ({ cols: g.cols, groups: g.groups() })); expect(JSON.stringify(s.cols.slice(0, 3)) === '[[1],[1,3,3],[]]', 'columns slide together'); expect(s.groups.some(q => q.n === 2 && q.i === 0), 'sliding joined the two 1s');
    p = await xy(0, 0); await page.touchscreen.tap(p.x, p.y); await wait(120); p = await xy(0, 0); await page.touchscreen.tap(p.x, p.y); await wait(200);
    expect(await game(g => g.left) === 0 && await game(g => g.state) === 'ending', 'roof swept clean');
    await page.waitForFunction(() => window.__lab.game.level === 2, null, { timeout: 8000 }); await settled();
    s = await game(g => ({ score: g.score, quota: g.quota, left: g.left, roof: g.roofScore })); expect(s.left === 72 && s.quota === 1100 && s.roof === 0, 'roof 2 dealt with its own quota'); expect(s.score >= s5 + 40 + 1000, 'clean sweep bonus paid');
    // 6) quota missed → game over
    await game(g => { g.setCols([[0, 0, 1], [2, 3, 4]]); g.setQuota(5000); }); await click(0, 0);
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150);
    const o = await state(); expect(o.over, 'no flocks left below quota ends the run'); expect(o.best >= o.score && o.score > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(400); await settled();
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    s = await game(g => ({ left: g.left, level: g.level, whistles: g.whistles, roof: g.roofScore })); expect(s.left === 72 && s.level === 1 && s.whistles === 1 && s.roof === 0, 'roof and counters reset');
  },
};
