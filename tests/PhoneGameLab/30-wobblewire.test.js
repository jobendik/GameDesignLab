// Wobblewire: taps/holds/keys lean the fox, balancing walks the rope and scores, a platform starts rope 2,
// gusts really push, letting go ends in a fall (inverted pendulum), best is recorded and restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/30-wobblewire/index.html', timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await wait(1100);
    expect(await game(g => g.mode === 'walk' && g.rope === 1), 'walking on rope 1');
    // real input: a touch tap on the right shoves right, a mouse hold on the left leans left, keys work
    const o0 = await game(g => g.omega); await page.touchscreen.tap(330, 600);
    expect((await game(g => g.omega)) - o0 > .1, 'tapping the right side shoves the fox right');
    await page.mouse.move(60, 600); await page.mouse.down(); await wait(120);
    expect(await game(g => g.lean) === -1, 'holding the left side leans left');
    const o1 = await game(g => g.omega); await wait(250);
    expect((await game(g => g.omega)) < o1 - .25, 'the hold keeps applying torque'); await page.mouse.up();
    await page.keyboard.down('ArrowRight'); await wait(80); expect(await game(g => g.lean) === 1, 'arrow keys lean'); await page.keyboard.up('ArrowRight');
    // balance with a bang-bang controller on the virtual hold (same torque as a finger; physics untouched)
    await page.evaluate(() => { window.__bal = true; (function tick() { requestAnimationFrame(tick); const g = __lab.game; if (!g || !window.__bal) return; const s = g.theta + .42 * g.omega; g.hold(s > .03 ? -1 : s < -.03 ? 1 : 0); })(); });
    const d0 = await game(g => g.total), s0 = await game(g => g.score); await wait(4000);
    expect((await game(g => g.total)) > d0 + 3, 'staying upright walks the rope');
    expect((await game(g => g.score)) > s0 + 30, 'distance scores');
    expect(await game(g => g.mult >= 2), 'steady balance builds the multiplier');
    for (let i = 0; i < 160 && (await game(g => g.rope)) < 2; i++) await wait(200);
    expect(await game(g => g.rope === 2), 'reaching the platform starts rope 2');
    const s2 = await game(g => g.score); expect(s2 > 250, 'platform bonus + distance (' + s2 + ')'); expect((await state()).score === s2, 'HUD score matches');
    // rope 2 has gusts: wait for one and check it produces a torque in its direction
    let gust = null; for (let i = 0; i < 300 && !gust; i++) { gust = await game(g => g.wind.phase === 'blow' && Math.abs(g.torque) > .5 ? { dir: g.wind.dir, q: g.torque } : null); if (!gust) await wait(50); }
    expect(gust && Math.sign(gust.q) === gust.dir, 'a gust pushes the fox the way it blows');
    // let go: the pendulum must tip over and the run must end
    await page.evaluate(() => { window.__bal = false; __lab.game.hold(null); });
    for (let i = 0; i < 100 && !(await state()).over; i++) await wait(200);
    const s = await state(); expect(s.over, 'falling off ends the run'); expect(s.best === s.score && s.best >= s2, 'best score recorded');
    expect(await game(g => Math.abs(g.theta) > 1), 'the fall was a real loss of balance');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.rope === 1 && g.total < 1 && Math.abs(g.theta) < .05 && g.mult === 1 && g.birds.length === 0), 'rope, distance, lean and multiplier reset');
  },
};
