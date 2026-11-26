// Antiquity: a real drag steers the ant, blocks on the road join the stack, walls and canals cost blocks in the lane
// taken, a hard swerve with a tall stack spills blocks, a shrine delivers the haul for points and starts the next
// level, an unpayable toll ends the run, restart is clean.
const PILOT = `(until) => new Promise(res => {
  const g = window.__lab.game, t0 = performance.now();
  (function tick() { if (performance.now() - t0 > 45000 || !g.alive || eval(until)) return res(); g.auto(); requestAnimationFrame(tick); })();
})`;
module.exports = {
  game: 'PhoneGameLab/games/34-antiquity/index.html',
  timeout: 150000,
  async run({ page, expect, wait, state, game }) {
    const pilot = until => page.evaluate(`(${PILOT})(${JSON.stringify(until)})`);
    expect((await state()).running, 'game running after autostart');
    const s0 = await game(g => ({ stack: g.stack, x: g.x, CW: g.CW, level: g.level }));
    expect(s0.stack === 2 && s0.level === 1 && Math.abs(s0.x - 2.5) < .01, 'the ant starts in the middle lane with two blocks');
    // --- real drag steers by a known amount; arrow keys steer too
    await page.mouse.move(180, 640); await page.mouse.down(); await page.mouse.move(220, 640, { steps: 4 }); await wait(350);
    const x1 = await game(g => g.x); expect(Math.abs((x1 - s0.x) - 40 / s0.CW * 1.25) < .08, 'dragging 40 px right moves the ant ' + (x1 - s0.x).toFixed(2) + ' lanes');
    await page.mouse.up();
    await page.keyboard.down('ArrowLeft'); await wait(300); await page.keyboard.up('ArrowLeft'); await wait(150);
    expect((await game(g => g.x)) < x1 - .8, 'ArrowLeft steers the other way');
    // --- running over a block adds it to the stack
    await pilot('g.carried >= 2');
    const p = await game(g => ({ stack: g.stack, carried: g.carried, spent: g.spent, shed: g.shed }));
    expect(p.carried >= 2 && p.stack === 2 + p.carried - p.spent - p.shed, 'blocks on the road join the stack (' + JSON.stringify(p) + ')');
    // --- a toll row costs exactly the number printed on the lane the ant takes
    const toll = await page.evaluate(() => new Promise(res => { const g = window.__lab.game; let snap = null; (function tick() {
      const n = g.next(); if (!g.alive) return res(null);
      if (snap && g.spent > snap.spent) return res({ type: snap.type, cost: snap.c[snap.lane], paid: g.spent - snap.spent, alive: g.alive });
      if (n && (n.type === 'wall' || n.type === 'gap') && n.away < .7 && n.away > 0) { const lane = Math.floor(g.x); if (n.c[lane] > 0 && n.c[lane] <= g.stack && Math.abs(g.x - lane - .5) < .2) snap = { type: n.type, c: n.c, lane, spent: g.spent }; }
      g.auto(); requestAnimationFrame(tick); })(); }));
    expect(toll && toll.alive && toll.paid === toll.cost && toll.cost >= 1, 'a ' + (toll && toll.type) + ' costs the blocks printed on its lane (' + JSON.stringify(toll) + ')');
    // --- the shrine delivers the haul and starts level 2
    await pilot('g.level >= 2');
    const sh = await page.evaluate(() => { const g = window.__lab.game; return { level: g.level, delivered: g.delivered, score: g.score, hud: window.__lab.state.score, dist: Math.floor(g.dist), stack: g.stack, alive: g.alive }; });
    expect(sh.alive && sh.level === 2 && sh.delivered >= 1 && sh.stack <= 2, 'the shrine takes the haul and opens level 2 (' + JSON.stringify(sh) + ')');
    expect(sh.score === sh.dist + sh.delivered * 10 && sh.hud === sh.score, 'each delivered stone pays 10 x level on top of distance');
    // --- a tall stack spills when the ant is thrown from side to side with a real drag
    await game(g => g.setStack(12)); const shed0 = await game(g => g.shed);
    await page.mouse.move(70, 640); await page.mouse.down();
    for (let i = 0; i < 4 && (await game(g => g.shed)) === shed0; i++) { await page.mouse.move(330, 640, { steps: 2 }); await wait(220); await page.mouse.move(70, 640, { steps: 2 }); await wait(220); }
    await page.mouse.up();
    const sp = await game(g => ({ shed: g.shed, stack: g.stack, alive: g.alive }));
    expect(sp.shed > shed0 && sp.stack < 12, 'swerving hard with twelve blocks spills some (' + JSON.stringify(sp) + ')');
    // --- arriving empty-handed at a toll ends the run
    await page.evaluate(() => new Promise(res => { const g = window.__lab.game, t0 = performance.now(); (function tick() { if (!g.alive || performance.now() - t0 > 30000) return res(); g.setStack(0); const n = g.next(); if (n && n.type !== 'beam') g.steerTo(n.c.findIndex(v => v > 0) + .5); requestAnimationFrame(tick); })(); }));
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const s = await state(); expect(s.over, 'an unpayable toll ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score <= 2, 'restart gives a clean run');
    const g0 = await game(g => ({ stack: g.stack, level: g.level, delivered: g.delivered, carried: g.carried, spent: g.spent, shed: g.shed, x: g.x }));
    expect(g0.stack === 2 && g0.level === 1 && g0.delivered === 0 && g0.carried === 0 && g0.spent === 0 && g0.shed === 0 && Math.abs(g0.x - 2.5) < .05, 'state fully reset (' + JSON.stringify(g0) + ')');
  },
};
