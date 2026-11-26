// One Breath: holding the pointer holds the breath (sway steadies, gauge drains), releasing fires; a release on the gong
// rings it and scores, a release off it or a run-out clock costs a life, running out of breath gasps without firing,
// three lost lives end the run, restart is clean, best persists.
module.exports = {
  game: 'PhoneGameLab/games/18-one-breath/index.html',
  timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    // resolve (true) as soon as cond(game) holds on an animation frame, or false after ms
    const until = (cond, ms) => page.evaluate(([f, ms]) => new Promise(res => { const t0 = performance.now(), c = new Function('g', 'return (' + f + ')(g)'); (function loop() { if (c(window.__lab.game)) res(true); else if (performance.now() - t0 > ms) res(false); else requestAnimationFrame(loop); })(); }), [cond.toString(), ms]);
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.lives) === 3 && await game(g => g.score) === 0, 'fresh run: 3 lives, 0 points');
    expect(await until(g => g.phase === 'aim', 3000), 'first gong comes into view');

    // 1) press = hold breath: sway keeps moving but breath drains while held
    await page.mouse.move(200, 600); await page.mouse.down(); await wait(250);
    expect(await game(g => g.holding), 'pointer down holds the breath');
    const b0 = await game(g => g.breath); expect(b0 < 1, 'breath drains while held (' + b0.toFixed(2) + ')');
    // 2) release while the cross is on the gong → it rings and scores
    let onTarget = await until(g => g.err < g.r * .5 || !g.holding, 5000);
    for (let i = 0; i < 4 && !(await game(g => g.holding && g.err < g.r * .7)); i++) {   // gasped before a pass: recover and try again
      await page.mouse.up(); await until(g => g.breath > .9, 4000); await page.mouse.down(); await until(g => g.err < g.r * .5 || !g.holding, 5000);
    }
    await page.mouse.up(); await wait(400);
    expect(onTarget !== null && await game(g => g.rung) === 1, 'release on the gong rings it');
    const sc1 = await game(g => g.score); expect(sc1 >= 100, 'ringing a gong scores (' + sc1 + ')');
    expect((await state()).score === sc1 && await game(g => g.lives) === 3, 'HUD score updated, no life lost');

    // 3) keyboard: Space held = breath, released on target = second gong
    expect(await until(g => g.phase === 'aim' && g.rung === 1, 5000), 'next gong arrives');
    await page.keyboard.down('Space'); await wait(120);
    expect(await game(g => g.holding), 'Space holds the breath');
    await until(g => g.err < g.r * .5 || !g.holding, 5000);
    for (let i = 0; i < 4 && !(await game(g => g.holding && g.err < g.r * .7)); i++) {
      await page.keyboard.up('Space'); await until(g => g.breath > .9 && g.phase === 'aim', 4000); await page.keyboard.down('Space'); await until(g => g.err < g.r * .5 || !g.holding, 5000);
    }
    await page.keyboard.up('Space'); await wait(400);
    expect(await game(g => g.rung) === 2 && await game(g => g.score) > sc1, 'Space release on target rings the second gong');

    // 4) a snap release while the cross is off the gong is a miss: costs a life, scores nothing
    expect(await until(g => g.phase === 'aim' && g.rung === 2, 5000), 'third gong arrives');
    const sc2 = await game(g => g.score);
    expect(await until(g => g.err > g.r * 1.5, 4000), 'sway carries the cross off the gong');
    await page.mouse.down(); await page.mouse.up(); await wait(400);
    expect(await game(g => g.lives) === 2 && await game(g => g.score) === sc2, 'a shot off the gong costs a life');

    // 5) holding until the breath runs out gasps (no shot); then the shot clock expiring costs a life
    expect(await until(g => g.phase === 'aim', 5000), 'next round after a miss');
    await page.mouse.down();
    expect(await until(g => g.breath <= 0.001 || !g.holding, 5000), 'breath runs out');
    await wait(100);
    expect(!(await game(g => g.holding)) && await game(g => g.lives) === 2 && await game(g => g.phase) === 'aim', 'gasping stands the shot down without firing');
    await page.mouse.up(); await wait(200);
    expect(await game(g => g.lives) === 2 && await game(g => g.phase) === 'aim', 'releasing after a gasp does not fire');
    expect(await until(g => g.lives === 1, 12000), 'the shot clock running out costs a life');

    // 6) third lost life → game over
    expect(await until(g => g.phase === 'aim' && g.err > g.r * 1.5, 6000), 'final round');
    await page.mouse.down(); await page.mouse.up();
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    const e = await state(); expect(e.over, 'three lost lives end the run'); expect(e.best >= e.score && e.best > 0, 'best score recorded');

    // 7) restart
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.lives) === 3 && await game(g => g.rung) === 0 && await game(g => g.level) === 1 && await game(g => g.breath) === 1, 'state fully reset');
  },
};
