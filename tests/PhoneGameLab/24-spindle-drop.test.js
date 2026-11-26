// Spindle Drop: the marble bounces by itself, drag / keys twist the tower, dropping through gaps scores and builds a
// plunge streak, a hot marble smashes a disc, the base clears the level, studs shatter the marble, restart is clean.
const PILOT = `(ms, mode) => new Promise(res => {
  const g = window.__lab.game, t0 = performance.now();
  (function tick() {
    if (performance.now() - t0 > ms || !g.alive) return res();
    const n = g.next();
    if (n && !g.clearing) {
      let d = null; const room = n.y - g.by;
      if (mode === 'spike') { if (g.streak < 3) d = g.angleTo(2); if (d == null) d = g.angleTo(0); }
      else if (n.under === 2) { const dg = g.angleTo(0), ds = g.angleTo(1); d = ds != null && (dg == null || Math.abs(ds) < Math.abs(dg)) ? ds : dg; } // get off the studs
      else if (g.vy < 0 || room > 45) d = g.angleTo(0);   // only twist while there is air under the marble
      if (d != null) g.rotate(Math.max(-.5, Math.min(.5, d * .6)));
    }
    requestAnimationFrame(tick);
  })();
})`;
module.exports = {
  game: 'PhoneGameLab/games/24-spindle-drop/index.html',
  async run({ page, expect, wait, state, game }) {
    const pilot = (ms, mode) => page.evaluate(`(${PILOT})(${ms}, '${mode}')`);
    expect((await state()).running, 'game running after autostart');
    // --- real input: drag twists the spindle by a known amount, arrow keys twist the other way
    const r0 = await game(g => g.rot), sens = await game(g => g.sens);
    await page.mouse.move(150, 520); await page.mouse.down(); await page.mouse.move(190, 520, { steps: 4 }); await wait(250);
    const r1 = await game(g => g.rot); expect(Math.abs((r1 - r0) + 40 * sens) < .06, 'dragging right twists the front to the right (' + (r1 - r0).toFixed(3) + ')');
    await page.mouse.move(150, 520, { steps: 4 }); await page.mouse.up(); await wait(250);
    await page.keyboard.down('ArrowLeft'); await wait(250); await page.keyboard.up('ArrowLeft'); await wait(200);
    const r2 = await game(g => g.rot); expect(r2 > r0 + .4, 'ArrowLeft twists the other way');
    await wait(500);
    const b = await game(g => ({ bounces: g.bounces, floors: g.floors, score: g.score, under: g.next().under }));
    expect(b.bounces >= 2 && b.floors === 0 && b.score === 0 && b.under === 1, 'the marble bounces on wood until a gap is offered (' + JSON.stringify(b) + ')');
    // --- real drag to the gap: the marble drops a floor and scores
    const d = await game(g => g.angleTo(0)), dx = -d / sens;
    await page.mouse.move(195, 520); await page.mouse.down(); await page.mouse.move(195 + dx, 520, { steps: 6 }); await page.mouse.up();
    for (let i = 0; i < 40 && (await game(g => g.floors)) < 1; i++) await wait(50);
    const f1 = await game(g => ({ floors: g.floors, score: g.score }));
    expect(f1.floors >= 1 && f1.score >= 10, 'dropping through a gap clears a floor and scores (' + JSON.stringify(f1) + ')');
    expect((await state()).score === (await game(g => g.score)), 'HUD shows the score');
    // --- play down the tower: plunges, a smash, and the base clears the level
    for (let i = 0; i < 70 && (await game(g => g.level)) < 2 && (await game(g => g.alive)); i++) await pilot(500, 'gap');
    const l2 = await game(g => ({ level: g.level, floors: g.floors, score: g.score, best: g.bestStreak, alive: g.alive }));
    expect(l2.alive && l2.level === 2 && l2.floors >= 12, 'reaching the base clears level 1 (' + JSON.stringify(l2) + ')');
    expect(l2.best >= 2 && l2.score > l2.floors * 10 + 100, 'chained floors pay rising plunge points + level bonus');
    for (let i = 0; i < 40 && (await game(g => g.smashes)) < 1 && (await game(g => g.alive)); i++) await pilot(400, 'gap');
    const sm = await game(g => ({ smashes: g.smashes, best: g.bestStreak, alive: g.alive }));
    expect(sm.smashes >= 1 && sm.best >= 3, 'three floors in a row heat the marble and it smashes a disc (' + JSON.stringify(sm) + ')');
    // --- studs end the run
    for (let i = 0; i < 60 && !(await state()).over; i++) { await pilot(400, 'spike'); await wait(120); }
    const s = await state(); expect(s.over, 'landing on studs shatters the marble'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    const g0 = await game(g => ({ level: g.level, floors: g.floors, best: g.bestStreak, smashes: g.smashes, gems: g.gems, left: g.left }));
    expect(g0.level === 1 && g0.floors === 0 && g0.best === 0 && g0.smashes === 0 && g0.gems === 0 && g0.left === 12, 'state fully reset (' + JSON.stringify(g0) + ')');
  },
};
