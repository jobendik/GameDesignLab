// Snug: real taps on the shape keys morph the body, matching a gate scores and builds the streak multiplier, a late
// morph pays a SNAP bonus, stages advance, three wrong shapes end the run, restart is clean.
const PILOT = `(until, late) => new Promise(res => {
  const g = window.__lab.game, t0 = performance.now();
  (function tick() {
    if (performance.now() - t0 > 60000 || !g.alive || eval(until)) return res();
    const n = g.next();
    if (n && n.revealed && n.settled && n.secs < (late || .7) && !n.ok.includes(g.shape)) g.pick(n.ok[0]);
    requestAnimationFrame(tick);
  })();
})`;
module.exports = {
  game: 'PhoneGameLab/games/33-snug/index.html',
  timeout: 150000,
  async run({ page, expect, wait, state, game }) {
    const pilot = (until, late) => page.evaluate(`(${PILOT})(${JSON.stringify(until)}, ${late || 0})`);
    expect((await state()).running, 'game running after autostart');
    // --- real touch on a shape key morphs the body; keyboard picks directly too
    const btn = await game(g => g.buttons());
    expect(btn.length === 3 && btn.every(b => b.y > 700), 'three shape keys along the bottom');
    await page.touchscreen.tap(btn[1].x, btn[1].y); await wait(120);
    expect(await game(g => g.shape) === 1, 'tapping the square key becomes a square');
    await page.keyboard.press('3'); await wait(80);
    expect(await game(g => g.shape) === 2, 'key 3 becomes a triangle');
    await page.touchscreen.tap(195, 400); await wait(120);
    expect(await game(g => g.shape) === 0, 'tapping the road cycles to the next shape');
    // --- match the first gate with a real tap: it scores
    const n1 = await game(g => g.next());
    expect(n1 && n1.kind === 'plain' && n1.ok.length === 1, 'first gate is a plain cut-out');
    await page.touchscreen.tap(btn[n1.ok[0]].x, btn[n1.ok[0]].y);
    for (let i = 0; i < 80 && (await game(g => g.passed)) < 1; i++) await wait(60);
    const a = await page.evaluate(() => ({ score: window.__lab.game.score, hud: window.__lab.state.score, streak: window.__lab.game.streak, lives: window.__lab.game.lives }));
    expect(a.score === 10 && a.hud === 10 && a.streak === 1 && a.lives === 3, 'fitting the gate scores 10 (' + JSON.stringify(a) + ')');
    // --- a wrong shape costs a life and the streak
    const n2 = await game(g => g.next()); const bad = [0, 1, 2].find(i => !n2.ok.includes(i));
    await page.keyboard.press(String(bad + 1));
    for (let i = 0; i < 80 && (await game(g => g.passed)) < 2; i++) await wait(60);
    const b = await game(g => ({ score: g.score, lives: g.lives, streak: g.streak }));
    expect(b.lives === 2 && b.streak === 0 && b.score === 10, 'a wrong shape costs a life, not points (' + JSON.stringify(b) + ')');
    // --- late morphs are SNAPs worth more; six clean gates raise the multiplier
    await pilot('g.streak >= 6', .2);
    const s6 = await game(g => ({ mult: g.mult, snaps: g.snaps, score: g.score, streak: g.streak }));
    expect(s6.streak >= 6 && s6.mult === 2, 'six in a row gives x2 (' + JSON.stringify(s6) + ')');
    expect(s6.snaps >= 2 && s6.score > 10 + 6 * 10, 'last-moment morphs earn SNAP bonuses');
    // --- clearing stage 1 pays a bonus, restores the life and starts the TWINS stage
    await pilot('g.stage >= 2');
    const st = await game(g => ({ stage: g.stage, lives: g.lives, passed: g.passed }));
    expect(st.stage === 2 && st.passed === 10 && st.lives === 3, 'ten gates clear stage 1 and give the life back (' + JSON.stringify(st) + ')');
    await pilot('g.stage >= 4');
    const s4 = await game(g => ({ stage: g.stage, lives: g.lives, speed: g.speed, alive: g.alive }));
    expect(s4.alive && s4.stage === 4 && s4.lives === 3 && s4.speed > 1.15, 'the pilot survives twins and peekaboo gates; the road speeds up (' + JSON.stringify(s4) + ')');
    // --- three wrong shapes end the run
    await page.evaluate(() => new Promise(res => { const g = window.__lab.game; (function tick() { if (!g.alive) return res(); const n = g.next(); if (n && n.ok.includes(g.shape)) g.pick([0, 1, 2].find(i => !n.ok.includes(i))); requestAnimationFrame(tick); })(); }));
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const s = await state(); expect(s.over, 'three misfits end the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    const g0 = await game(g => ({ lives: g.lives, stage: g.stage, passed: g.passed, streak: g.streak, shape: g.shape, n: g.nShapes, mult: g.mult }));
    expect(g0.lives === 3 && g0.stage === 1 && g0.passed === 0 && g0.streak === 0 && g0.shape === 0 && g0.n === 3 && g0.mult === 1, 'state fully reset (' + JSON.stringify(g0) + ')');
  },
};
