// Fish Fizz: bubbles are buoyant bodies (no grid); a real tap aims + blows a bubble and three of a colour burst and score;
// fish swim to Nori; ice chunks break beside a burst; survivors float up and can burst by themselves (fizz chain ×2);
// six plain shots let a new row seep in; tapping Nori swaps; keyboard aims and shoots; a crowd below the rope ends the
// dive; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/fish-fizz/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const geo = await game(g => ({ R: g.R, cols: g.cols, box: g.box, iceY: g.iceY, lineY: g.lineY, muz: g.muz, nori: g.nori, n: g.n, cur: g.cur, next: g.next, iv: g.interval }));
    const { R, cols, iceY, lineY, muz } = geo, x0 = geo.box[0] + (geo.box[1] - geo.box[0] - cols * 2 * R) / 2 + R, col = i => x0 + i * 2 * R, y0 = iceY + R, y1 = y0 + R * 1.74, y2 = y0 + R * 3.48;
    expect(geo.n >= 20 && geo.cur >= 0 && geo.cur <= 3 && geo.next <= 3 && geo.iv === 6, 'a crowd of bubbles under the ice, four colours, Nori holds two');
    await wait(1000); let r = await game(g => ({ score: g.score, n: g.n })); expect(r.score === 0 && r.n === geo.n, 'the opening crowd is stable: nothing bursts by itself');
    // buoyancy: a loose bubble floats up to the ice
    await game((g, a) => { g.clear(); g.add(a.x, a.y, 2); }, { x: col(1), y: y0 + 230 });
    await wait(900); r = await game(g => g.bodies()[0]); expect(r.y < y0 + 3 && Math.abs(r.x - col(1)) < 2, 'a loose bubble floats straight up and rests under the ice');
    // real tap: aim straight up between two pinks → three touch → burst; emptying the ice pays a bonus and a fresh row seeps in
    const s0 = (await game((g, a) => { g.clear(); g.add(a.cx - a.R, a.y0, 0); g.add(a.cx + a.R, a.y0, 0); g.setCur(0, 1); return g.score; }, { cx: muz[0], R, y0 }));
    await page.touchscreen.tap(muz[0], iceY + 70);
    for (let i = 0; i < 30 && await game(g => g.popped) < 3; i++) await wait(50);
    r = await page.evaluate(() => ({ hud: window.__lab.state.score, score: window.__lab.game.score, popped: window.__lab.game.popped, n: window.__lab.game.n, chain: window.__lab.game.chain }));
    expect(r.popped === 3 && r.score - s0 === 130 && r.hud === r.score && r.chain === 1, 'tap blows a bubble; three pinks burst for 30, +100 for clearing the ice');
    expect(r.n === cols, 'a fresh row seeps through the ice');
    // fish + ice chunk
    let b = await game((g, a) => { g.clear(); g.add(a.cx - a.R, a.y0, 1, true); g.add(a.cx + a.R, a.y0, 1); g.add(a.cx + 3 * a.R, a.y0, 6); g.setCur(1, 2); return { fish: g.fish, popped: g.popped, score: g.score }; }, { cx: muz[0], R, y0 });
    await page.touchscreen.tap(muz[0], iceY + 70);
    for (let i = 0; i < 40 && await game(g => g.fish) === b.fish; i++) await wait(75);
    r = await game(g => ({ fish: g.fish, popped: g.popped, score: g.score }));
    expect(r.popped - b.popped >= 4 && r.fish === b.fish + 1 && r.score - b.score >= 30 + 5 + 25, 'the fish swims to Nori (+25) and the ice chunk beside the burst breaks (+5)');
    // fizz chain: burst the pinks (A) and the yellow below floats up between two yellows → second burst ×2
    b = await game((g, a) => {
      g.clear(); const c = a.c;
      for (const i of [0, 1, 2, 6, 7]) if (i < a.cols) g.add(a.x0 + i * 2 * a.R, a.y0, 6); for (const i of [.5, 1.5, 6.5]) if (i < a.cols - 1) g.add(a.x0 + i * 2 * a.R, a.y1, 6); g.add(a.x0 + 2 * a.R * .5 + 2 * a.R * 0, a.y2, 6); g.add(a.x0 + 2 * a.R * 1, a.y2, 6); g.add(a.x0 + 2 * a.R * 6.5 - 2 * a.R * .5, a.y2, 6);
      g.add(c - 2 * a.R, a.y0, 1); g.add(c + 2 * a.R, a.y0, 1); g.add(c, a.y0, 0); g.add(c + a.R, a.y1, 0); g.add(c - a.R, a.y1, 1); g.setCur(0, 3);
      return { score: g.score, n: g.n };
    }, { c: col(4), cols, R, x0, y0, y1, y2 });
    await wait(500); expect(await game(g => g.n) === b.n && await game(g => g.score) === b.score, 'the staged crowd holds still');
    await game((g, a) => g.shoot(Math.atan2(a.y - g.muz[1], a.x - g.muz[0])), { x: col(4), y: y2 });
    let best = 0; for (let i = 0; i < 50; i++) { await wait(60); best = Math.max(best, await game(g => g.chain)); if (best >= 2) break; }
    r = await game(g => ({ score: g.score }));
    expect(best === 2 && r.score - b.score >= 30 + 60, 'the yellow floats up into the gap and bursts too: fizz chain ×2');
    // six plain shots → the ice lets a new row through
    await game(g => g.clear());
    for (let i = 0; i < 6; i++) {
      await game((g, k) => g.setCur(k, k), 2 + (i % 2)); await page.touchscreen.tap(geo.box[0] + R + i * (geo.box[1] - geo.box[0] - 2 * R) / 5, iceY + 30);
      for (let k = 0; k < 40 && await game(g => g.flying); k++) await wait(40);
      if (i === 2) { for (let k = 0; k < 30 && await game(g => g.misses) < 1; k++) await wait(50); r = await game(g => ({ n: g.n, misses: g.misses, score: g.score })); expect(r.n === 3 && r.misses >= 1, 'plain shots stick under the ice and count toward the next seep'); }
    }
    for (let i = 0; i < 30 && await game(g => g.n) < 6 + cols; i++) await wait(100);
    r = await game(g => ({ n: g.n, misses: g.misses })); expect(r.n === 6 + cols && r.misses === 0, 'after six plain shots a new row seeps in and the count resets');
    // swap by tapping Nori; keyboard aim + shoot
    await game(g => g.setCur(0, 1)); await page.touchscreen.tap(geo.nori[0], geo.nori[1]); await wait(120);
    expect(await game(g => g.cur === 1 && g.next === 0), 'tapping Nori swaps the two bubbles');
    const a0 = await game(g => g.aim); await page.keyboard.down('ArrowLeft'); await wait(250); await page.keyboard.up('ArrowLeft');
    expect(await game(g => g.aim) < a0 - .15, 'arrow keys turn the aim'); await page.keyboard.press('Space'); await wait(60);
    expect(await game(g => g.flying || g.cur === null), 'space blows the bubble');
    // crowd below the rope → the dive ends
    await game((g, a) => { g.clear(); for (let j = 0; a.y0 + j * 2 * a.R < a.lineY + 3 * a.R; j++) for (let i = 0; i < a.cols; i++) g.add(a.x0 + i * 2 * a.R, a.y0 + j * 2 * a.R, 6); }, { x0, y0, R, cols, lineY });
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150);
    const e = await state(); expect(e.over, 'bubbles staying below the rope end the dive'); expect(e.best >= e.score && e.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.popped === 0 && g.fish === 0 && g.level === 1 && g.misses === 0 && g.n >= 20 && !g.bodies().some(q => q.k >= 4)), 'crowd, level and counters reset');
  },
};
