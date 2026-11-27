// Plumb Line: a real tap sets the gliding floor, an off-centre floor is sliced narrower, a centred floor is PERFECT,
// three perfects in a row grow the floor back, the tenth floor is a sky lobby that opens zone 2 with a new motion,
// a floor set clear of the tower ends the run, restart is clean.
const PLACE = `(want, tol) => new Promise(res => {
  const g = window.__lab.game, t0 = performance.now();
  (function tick() {
    if (window.__lab.state.over || performance.now() - t0 > 15000) return res(null);
    if (g.ready) { const o = g.off(); if (want === 'miss' ? Math.abs(o) > g.width + 12 : Math.abs(o - want) < (tol || 3.2)) { g.place(); return res({ floors: g.floors, width: g.width, streak: g.streak, score: g.score, off: g.lastOff, perfects: g.perfects, zone: g.zone, pattern: g.pattern }); } }
    requestAnimationFrame(tick);
  })();
})`;
module.exports = {
  game: 'PhoneGameLab/games/36-plumb-line/index.html',
  async run({ page, expect, wait, state, game }) {
    const placeAt = (want, tol) => page.evaluate(`(${PLACE})(${JSON.stringify(want)}, ${tol || 0})`);
    expect((await state()).running, 'game running after autostart');
    for (let i = 0; i < 40 && !(await game(g => g.ready)); i++) await wait(50);
    const s0 = await game(g => ({ floors: g.floors, width: g.width, zone: g.zone, pattern: g.pattern }));
    expect(s0.floors === 0 && s0.width === 200 && s0.zone === 1 && s0.pattern === 'STEADY', 'a 20 m lot and a gliding floor (' + JSON.stringify(s0) + ')');
    // --- real tap while the floor overlaps the tower: it is set, scored, and sliced to the overlap
    for (let i = 0; i < 400; i++) { const o = await game(g => g.off()); if (o != null && Math.abs(o) < 110) break; await wait(15); }
    await page.touchscreen.tap(195, 500); await wait(150);
    const a = await page.evaluate(() => { const g = window.__lab.game; return { floors: g.floors, width: g.width, off: g.lastOff, score: g.score, hud: window.__lab.state.score, tol: g.tol, streak: g.streak }; });
    expect(a.floors === 1 && a.score >= 10 && a.hud === a.score, 'a tap sets the floor and scores (' + JSON.stringify(a) + ')');
    expect(a.streak === 1 ? a.width === 200 : Math.abs(a.width - (200 - Math.abs(a.off))) < .01, 'the floor keeps only the part over the tower');
    // --- a deliberate off-centre floor is sliced by exactly its overhang and breaks the streak
    const b = await placeAt(30);
    expect(b.floors === 2 && b.streak === 0 && Math.abs(b.width - (a.width - Math.abs(b.off))) < .01 && b.width < a.width - 25, 'overhang is sliced off (' + JSON.stringify(b) + ')');
    // --- perfects: no slice; the third in a row grows the floor back
    const p1 = await placeAt(0), p2 = await placeAt(0);
    expect(p2.streak === 2 && p2.width === b.width && p2.score > b.score + 40, 'centred floors are PERFECT and keep their width (' + JSON.stringify(p2) + ')');
    const p3 = await placeAt(0);
    expect(p3.streak === 3 && p3.width === b.width + 8, 'the third perfect in a row grows the floor by 0.8 m (' + JSON.stringify(p3) + ')');
    // --- the tenth floor is a sky lobby: bonus, wider cornice, zone 2 with a different motion
    let s = p3; while (s && s.floors < 10) s = await placeAt(0);
    expect(s && s.floors === 10 && s.zone === 2 && s.pattern === 'SWING' && s.width > p3.width + 36, 'floor 10 is a sky lobby that opens zone 2 (' + JSON.stringify(s) + ')');
    const s11 = await placeAt(0);
    expect(s11 && s11.floors === 11 && s11.streak >= 9, 'the swing zone is playable (' + JSON.stringify(s11) + ')');
    // --- a floor set clear of the tower ends the run
    await placeAt('miss');
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const o = await state(); expect(o.over, 'missing the tower ends the run'); expect(o.best >= o.score && o.best > 0, 'best score recorded');
    expect(await game(g => g.floors) === 11, 'the missed floor is not built');
    await wait(1400); await page.keyboard.press('Enter'); await wait(700);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    const g0 = await game(g => ({ floors: g.floors, width: g.width, streak: g.streak, zone: g.zone, perfects: g.perfects, best: g.bestStreak }));
    expect(g0.floors === 0 && g0.width === 200 && g0.streak === 0 && g0.zone === 1 && g0.perfects === 0 && g0.best === 0, 'state fully reset (' + JSON.stringify(g0) + ')');
  },
};
