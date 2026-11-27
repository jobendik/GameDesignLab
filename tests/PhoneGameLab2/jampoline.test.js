// Jampoline: a berry dropped over the basket is caught and scores; one dropped elsewhere splats and costs a heart; a
// leaf drawn with a real drag bounces a berry into the basket; a tap makes a flat leaf that bounces it back up;
// mushrooms give trick points; six berries bake a pie (level 2); three splats end the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/jampoline/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await game(g => { g.hold(true); g.clear(); }); await wait(100);
    const snap = () => game(g => ({ score: g.score, hearts: g.hearts, caught: g.caught, streak: g.streak, pies: g.pies, level: g.level, n: g.berries.length, lb: g.leafBounces, tricks: g.tricks, leaves: g.leaves, basketN: g.basketN }));
    const resolved = async () => { for (let i = 0; i < 70; i++) { await wait(100); if (await game(g => g.berries.length === 0)) return; } throw new Error('berry never resolved'); };
    const f = await game(g => g.field), S = f.S;
    // 1) straight into the basket
    await game(g => g.spawn(g.basket.x)); await resolved();
    let a = await snap(); expect(a.caught === 1 && a.score === 10 && a.basketN === 1 && a.hearts === 3, 'a berry falling into the basket scores 10'); expect((await state()).score === 10, 'HUD shows the score');
    // 2) nowhere near it → splat
    await game(g => g.spawn(g.basket.x - 120 * g.field.S)); await resolved();
    a = await snap(); expect(a.hearts === 2 && a.caught === 1 && a.streak === 0, 'a berry on the grass costs a heart and the streak');
    // 3) real drag: draw the leaf the trace says will work
    await game(g => g.spawn(g.basket.x - 110 * g.field.S, 'red', 2.2));
    const plan = await game(g => { const b = g.berries[0], k = g.basket, S = g.field.S, y = k.y - 190 * S; let run = [], best = [];
      for (let t = 0; t <= 1.2; t += .02) { const ok = g.predict(b.x - Math.cos(t) * 50 * S, y - Math.sin(t) * 50 * S, b.x + Math.cos(t) * 50 * S, y + Math.sin(t) * 50 * S) === 'catch'; if (ok) { run.push(t); if (run.length > best.length) best = run.slice(); } else run = []; }
      const t = best.length ? best[Math.floor(best.length / 2)] : null; return t == null ? null : { x1: b.x - Math.cos(t) * 50 * S, y1: y - Math.sin(t) * 50 * S, x2: b.x + Math.cos(t) * 50 * S, y2: y + Math.sin(t) * 50 * S, n: best.length }; });
    expect(plan && plan.n >= 2, 'some leaf angle sends the berry into the basket');
    await page.mouse.move(plan.x1, plan.y1); await page.mouse.down(); await page.mouse.move((plan.x1 + plan.x2) / 2, (plan.y1 + plan.y2) / 2, { steps: 3 }); await page.mouse.move(plan.x2, plan.y2, { steps: 3 }); await page.mouse.up(); await wait(100);
    expect((await snap()).leaves === 1, 'the drag placed a leaf'); await resolved();
    let b = await snap(); expect(b.lb === 1 && b.caught === 2 && b.score === a.score + 10 && b.hearts === 2, 'the berry bounced off the drawn leaf into the basket');
    expect(b.leaves === 0, 'a leaf is spent after one bounce');
    // 4) tap = flat leaf: the berry bounces back up
    await game(g => g.spawn(g.field.L + 60 * g.field.S)); const tapY = f.branch + 300 * S; await page.mouse.move(f.L + 60 * S, tapY); await page.mouse.down(); await page.mouse.up();
    let up = false; for (let i = 0; i < 40 && !up; i++) { await wait(50); up = await game(g => g.leafBounces === 2 && g.berries[0] && g.berries[0].vy < 0); }
    expect(up, 'a tapped flat leaf bounces the berry upward'); await game(g => g.clear());
    // 5) mushroom: trick points
    await game(g => { const F = g.field; g.setShrooms([[F.L + 200 * F.S, F.branch + 260 * F.S]]); g.spawn(F.L + 190 * F.S); });
    let tr = false; for (let i = 0; i < 40 && !tr; i++) { await wait(50); tr = await game(g => g.tricks === 1); }
    a = await snap(); expect(tr && a.score === b.score + 5, 'bouncing off a mushroom gives +5 trick points'); await game(g => { g.clear(); g.setShrooms([]); });
    // 6) six berries bake a pie
    for (let i = 0; i < 4; i++) { await game(g => g.spawn(g.basket.x)); await resolved(); }
    b = await snap(); expect(b.caught === 6 && b.pies === 1 && b.level === 2 && b.basketN === 0, 'six berries bake a pie and open level 2'); expect(b.score > a.score + 40, 'streak multiplier kicked in');
    // 7) two more splats end the run
    await game(g => { g.clear(); g.setShrooms([]); g.spawn(g.field.L + 30 * g.field.S); }); await resolved(); expect((await snap()).hearts === 1, 'second splat');
    await game(g => g.spawn(g.field.L + 30 * g.field.S));
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(200);
    const s = await state(); expect(s.over, 'the third splat ends the run'); expect(s.best >= b.score && s.best > 0, 'best score recorded');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.caught === 0 && g.pies === 0 && g.level === 1 && g.leaves === 0), 'hearts, pies and leaves reset');
  },
};
