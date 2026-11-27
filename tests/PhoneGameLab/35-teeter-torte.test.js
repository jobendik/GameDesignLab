// Teeter Torte: a real tap releases the swinging layer, a centred drop is PERFECT, an off-centre drop is sliced and
// narrows the cake, four layers + the cherry serve the order, a narrow layer can miss the cake (costs a spare), a big
// shove topples the tower (costs a spare, same order restarts), no spares left ends the run, restart is clean.
const DROP = `(want, tol) => new Promise(res => {
  const g = window.__lab.game, t0 = performance.now(); let done = false;
  (function tick() {
    const snap = () => ({ layers: g.layers, widths: g.widths.map(Math.round), lives: g.lives, score: g.score, perfects: g.perfects, cake: g.cake, keep: g.keep, mode: g.mode, served: g.served });
    if (window.__lab.state.over || performance.now() - t0 > 20000) return res(snap());
    if (!done) { if (g.ready) { const p = g.predict(); if (Math.abs(p - want) < tol && Math.abs(g.phi) < .1) { g.drop(); done = true; } } }
    else if (!g.falling && (g.ready || g.mode !== 'play')) return res(snap());
    requestAnimationFrame(tick);
  })();
})`;
module.exports = {
  game: 'PhoneGameLab/games/35-teeter-torte/index.html',
  timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    const dropAt = (want, tol) => page.evaluate(`(${DROP})(${want}, ${tol || 3})`);
    const waitFor = async (fn, ms) => { for (let i = 0; i < (ms || 8000) / 50; i++) { if (await game(fn)) return true; await wait(50); } return false; };
    expect((await state()).running, 'game running after autostart');
    expect(await waitFor(g => g.ready), 'a layer swings on the crane');
    expect(await game(g => g.need) === 4 && await game(g => g.layers) === 0, 'order 1 asks for four layers');
    // --- real tap releases the layer; a full-width layer always reaches the plate
    await page.touchscreen.tap(195, 520);
    expect(await waitFor(g => g.layers === 1 && !g.falling), 'a tap drops the layer onto the stand');
    const a = await page.evaluate(() => ({ score: window.__lab.game.score, hud: window.__lab.state.score, w: window.__lab.game.widths[0] }));
    expect(a.score > 0 && a.hud === a.score && a.w <= 168, 'the landed layer scores (' + JSON.stringify(a) + ')');
    // --- a centred drop is perfect: nothing is sliced off
    const p1 = await dropAt(0, 3);
    expect(p1.layers === 2 && p1.perfects >= 1 && p1.widths[1] === p1.widths[0] && p1.score >= a.score + 40, 'a centred drop is PERFECT and keeps its width (' + JSON.stringify(p1) + ')');
    // --- finish the order: remaining layers, then the cherry
    let s = p1; for (let i = 0; i < 6 && s.cake === 1 && s.mode === 'play'; i++) s = await dropAt(0, 3);
    expect(await waitFor(g => g.cake === 2 && g.mode === 'play' && g.layers === 0), 'four layers and a cherry serve the order');
    const c2 = await game(g => ({ served: g.served, score: g.score, need: g.need, lives: g.lives, keep: g.keep }));
    expect(c2.served === 1 && c2.need === 5 && c2.lives === 3 && c2.keep === 1 && c2.score > p1.score + 100, 'serving pays a bonus and brings a bigger order on a fresh stand (' + JSON.stringify(c2) + ')');
    // --- an off-centre drop is sliced, and the next layer comes narrower
    await dropAt(0, 3); const t = await dropAt(95, 6);
    expect(t.layers === 2 && t.widths[1] > 45 && t.widths[1] < 95 && t.keep < .6, 'overhang is sliced off (' + JSON.stringify(t) + ')');
    // --- a narrow layer dropped wide misses the cake and costs a spare cherry
    const m = await dropAt(-85, 8);
    expect(m.layers === 2 && m.lives === 2 && await game(g => g.why) === 'drop', 'a layer that misses the cake costs a spare (' + JSON.stringify(m) + ')');
    // --- a violent shove topples the tower: another spare, same order starts again
    await game(g => g.kick(2.6));
    expect(await waitFor(g => g.lives === 1 && g.why === 'topple'), 'the cake topples past its tipping angle');
    expect(await waitFor(g => g.mode === 'play' && g.layers === 0 && g.cake === 2 && g.ready), 'the same order restarts on a clean stand');
    // --- last spare gone ends the run
    await dropAt(0, 3); await dropAt(95, 6); await dropAt(-85, 8);
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const o = await state(); expect(o.over, 'running out of spares ends the run'); expect(o.best >= o.score && o.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    const g0 = await game(g => ({ lives: g.lives, cake: g.cake, layers: g.layers, served: g.served, perfects: g.perfects, keep: g.keep, phi: g.phi }));
    expect(g0.lives === 3 && g0.cake === 1 && g0.layers === 0 && g0.served === 0 && g0.perfects === 0 && g0.keep === 1 && g0.phi === 0, 'state fully reset (' + JSON.stringify(g0) + ')');
  },
};
