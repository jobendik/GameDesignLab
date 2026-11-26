// Pogo Peak: auto-bounce, drag / key steering, flick-down and key slams give power bounces and a streak, climbing
// platforms raises height and score, burrs knock you down, falling off the screen ends the run, restart is clean.
const PILOT = `(ms, mode) => new Promise(res => {
  const g = window.__lab.game, t0 = performance.now(); let landY = g.foot, lastVy = g.vy;
  (function tick() {
    if (performance.now() - t0 > ms || !g.alive) return res();
    const foot = g.foot, vy = g.vy, P = g.plats.filter(q => q.type !== 'ground');
    if (lastVy > 0 && vy < 0) landY = foot; lastVy = vy;
    if (mode === 'fall') { // slip off the edge of whatever is below, layer after layer
      const under = g.plats.filter(q => q.y > foot - 6 && q.y < foot + 260 && (q.type === 'ground' || Math.abs(q.x - g.x) < q.w / 2 + 30)).sort((a, b) => a.y - b.y)[0];
      if (under) { const side = g.x >= under.x ? 1 : -1, x = under.x + side * (under.w / 2 + 48); g.steerTo(x < 15 || x > g.WU - 15 ? under.x - side * (under.w / 2 + 48) : x); }
    }
    else {
      const reach = P.filter(q => q.y < landY - 12 && q.y > landY - 188).sort((a, b) => a.y - b.y);
      let t = reach.find(q => q.type !== 'crumbly') || reach[0];
      if (vy > 0 && (!t || t.y < foot)) { const below = g.plats.filter(q => q.y >= foot - 2).sort((a, b) => a.y - b.y); t = below[0]; }
      if (t && t.type !== 'ground') { g.steerTo(t.x); if (mode === 'slam' && vy > 0 && vy < 600 && t.y > foot + 30 && Math.abs(g.x - t.x) < t.w / 2 - 8 && t.type !== 'cloud') g.slam(); }
    }
    requestAnimationFrame(tick);
  })();
})`;
module.exports = {
  game: 'PhoneGameLab/games/23-pogo-peak/index.html',
  async run({ page, expect, wait, state, game }) {
    const pilot = (ms, mode) => page.evaluate(`(${PILOT})(${ms}, '${mode}')`);
    expect((await state()).running, 'game running after autostart');
    await wait(1300);
    expect(await game(g => g.bounces) >= 1, 'Pip bounces on his own');
    // --- real input: relative drag steers, arrow keys steer, the screen wraps
    const x0 = await game(g => g.x);
    await page.mouse.move(150, 500); await page.mouse.down(); await page.mouse.move(200, 500, { steps: 4 }); await wait(200);
    const x1 = await game(g => g.x); expect(x1 > x0 + 50, 'dragging right moves Pip right (' + x0.toFixed(0) + ' → ' + x1.toFixed(0) + ')');
    await page.mouse.up();
    await page.keyboard.down('ArrowLeft'); await wait(350); await page.keyboard.up('ArrowLeft'); await wait(150);
    const xa = await game(g => g.x); expect(xa < x1 - 100, 'ArrowLeft moves Pip left (' + xa.toFixed(0) + ')');
    await page.keyboard.down('ArrowLeft'); await wait(330); await page.keyboard.up('ArrowLeft'); await wait(150);
    const x2 = await game(g => g.x); expect(x2 > xa + 60, 'moving past the left edge wraps to the right side (' + x2.toFixed(0) + ')');
    // --- slam: Down key and a downward flick both dive; landing a slam is a power bounce with a streak
    const b0 = await game(g => g.bestStreak);
    for (let i = 0; i < 40 && !(await game(g => g.vy < -300)); i++) await wait(30);
    await page.keyboard.press('ArrowDown');
    expect(await game(g => g.slamming || g.bestStreak > 0), 'Down key starts a slam');
    for (let i = 0; i < 40 && (await game(g => g.bestStreak)) === b0; i++) await wait(50);
    expect(await game(g => g.bestStreak) > b0, 'landing a slam counts as a power bounce');
    expect(await game(g => g.vy) < -900 || await game(g => g.bounces) > 2, 'power bounce launches harder than a normal one');
    for (let i = 0; i < 40 && !(await game(g => g.vy < -300 && !g.slamming)); i++) await wait(30);
    await page.mouse.move(200, 400); await page.mouse.down(); await page.mouse.move(202, 470, { steps: 2 });
    expect(await game(g => g.slamming || g.streak >= 2), 'flicking down starts a slam');
    await page.mouse.up();
    // --- climb through real platforms
    await pilot(8000, 'climb');
    const c1 = await game(g => ({ h: g.height, score: g.score, bounces: g.bounces, alive: g.alive }));
    expect(c1.alive && c1.h >= 15, 'climbing platforms gains height (' + JSON.stringify(c1) + ')');
    expect(c1.score >= c1.h && (await state()).score === c1.score, 'score follows height (+bonuses) and shows in the HUD');
    await pilot(5000, 'slam');
    const c2 = await game(g => ({ h: g.height, best: g.bestStreak, alive: g.alive }));
    expect(c2.best >= 2 && c2.h > c1.h, 'chained slams build a streak while climbing (' + JSON.stringify(c2) + ')');
    // --- hazard: a burr touching Pip's body knocks him down (dazed), it does not end the run by itself
    // (wait out any mercy window from an earlier knock or balloon ride so the touch is a fair one)
    for (let i = 0; i < 200 && !(await game(g => g.vy < -200 && !g.slamming && g.inv <= 0 && g.balloon <= 0 && g.dazed <= 0)); i++) await pilot(60, 'climb');
    await game(g => g.spawnThing('burr', g.x, g.y - 6)); await wait(80);
    expect(await game(g => g.dazed > 0 && g.vy > 0 && g.alive), 'a burr knocks Pip down and dazes him');
    // --- the only way to lose: fall off the bottom of the screen
    for (let i = 0; i < 30 && !(await state()).over; i++) { await pilot(400, 'fall'); await wait(120); }
    const s = await state(); expect(s.over, 'falling off the screen ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score <= 30, 'restart gives a clean run');
    const g0 = await game(g => ({ h: g.height, streak: g.bestStreak, stars: g.stars, zone: g.zone, things: g.things.filter(t => t.k === 'burr').length }));
    expect(g0.h <= 30 && g0.streak === 0 && g0.stars <= 1 && g0.zone === 0 && g0.things === 0, 'state fully reset (' + JSON.stringify(g0) + ')');
  },
};
