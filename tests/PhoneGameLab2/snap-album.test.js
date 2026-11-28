// Snap Album: a real mouse drag drops a jigsaw piece into its slot (snaps, scores, streak), a wrong drop on the frame
// resets the streak and stays loose, finishing a photo pays a bonus + daylight and deals the next (bigger) photo, from
// photo 3 pieces come rotated (a touch tap turns them and a turned piece lying on its slot snaps), Pip the pest can be
// shooed by tapping him while he peeks, the sun setting ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/snap-album/index.html',
  async run({ page, expect, wait, state, game }) {
    let r; expect((await state()).running, "game running after autostart");
    let g = await game(g => ({ n: g.n, photo: g.photo, rot: g.rotOn, score: g.score, t: g.time }));
    expect(g.n === 9 && g.photo === 0 && !g.rot && g.score === 0 && g.t > 55, 'first photo: 3x3, no rotation, a full minute of daylight');
    await wait(700); // pieces finish dealing into the tray
    // real drag: piece → its slot
    let ps = await game(g => g.pieces());
    let p = ps[ps.length - 1];
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.sx + 6, p.sy - 5, { steps: 8 }); await page.mouse.up(); await wait(150);
    g = await game(g => ({ s: g.snapped, score: g.score, combo: g.combo }));
    expect(g.s === 1 && g.score === 10 && g.combo === 1, 'dragging a piece onto its slot snaps it: +10, streak 1');
    await wait(100); expect((await state()).score === 10, 'HUD shows the score');
    // second piece by drag → streak 2 scores more
    ps = await game(g => g.pieces()); p = ps.find(q => !q.snapped);
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.sx, p.sy, { steps: 8 }); await page.mouse.up(); await wait(150);
    g = await game(g => ({ s: g.snapped, score: g.score, combo: g.combo }));
    expect(g.s === 2 && g.score === 24 && g.combo === 2, 'second snap in a row: +14 (streak 2)');
    // wrong drop on the frame: stays loose, streak resets
    ps = await game(g => g.pieces()); p = ps.find(q => !q.snapped); const other = ps.find(q => !q.snapped && q.i !== p.i);
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(other.sx, other.sy, { steps: 8 }); await page.mouse.up(); await wait(150);
    g = await game((g, i) => ({ s: g.snapped, combo: g.combo, miss: g.misses, p: g.pieces().find(q => q.i === i) }), p.i);
    expect(g.s === 2 && g.combo === 0 && g.miss === 1 && !g.p.snapped, 'a wrong drop on the frame stays loose and resets the streak');
    // a tap on photo 1 does not rotate
    await page.touchscreen.tap(g.p.x, g.p.y); await wait(120);
    expect((await game((g, i) => g.pieces().find(q => q.i === i).rot, p.i)) === 0, 'no rotation on the first photos');
    // finish the photo
    const t0 = await game(g => g.time);
    r = await game(g => { const s0 = g.score; for (const p of g.pieces()) if (!p.snapped) g.place(p.i); return { gain: g.score - s0, phase: g.phase, time: g.time }; });
    expect(r.phase === 'done' && r.gain === 180 + (10 + 4 * 0) + (10 + 4 * 1) + (10 + 4 * 2) + (10 + 4 * 3) + (10 + 4 * 4) + (10 + 4 * 5) + (10 + 4 * 6), 'finishing the photo pays the pieces with a rising streak + 20 per piece');
    expect(r.time > t0 + 25, 'a finished photo wins back daylight');
    await wait(2300);
    g = await game(g => ({ photo: g.photo, n: g.n, phase: g.phase }));
    expect(g.photo === 1 && g.n === 12 && g.phase === 'play', 'the next photo is bigger (12 pieces)');
    await game(g => { for (const p of g.pieces()) g.place(p.i); }); await wait(2300);
    g = await game(g => ({ photo: g.photo, rot: g.rotOn, ps: g.pieces() }));
    expect(g.photo === 2 && g.rot && g.ps.some(p => p.rot !== 0), 'photo 3 deals rotated pieces');
    // a rotated piece on its slot does not snap; tapping it round snaps it
    p = g.ps.find(q => q.rot !== 0); await wait(600);
    r = await game((g, i) => { g.place(i); return g.pieces().find(q => q.i === i); }, p.i);
    expect(!r.snapped && Math.abs(r.x - r.sx) < 1, 'a rotated piece lying on its slot does not snap');
    for (let k = 0; k < 4 && !(await game((g, i) => g.pieces().find(q => q.i === i).snapped, p.i)); k++) { await page.touchscreen.tap(r.sx, r.sy); await wait(160); }
    r = await game((g, i) => g.pieces().find(q => q.i === i), p.i);
    expect(r.snapped && r.rot === 0, 'tapping turns the piece; upright on its slot it snaps');
    // Pip the pest: peek, then shoo by tapping him
    await game(g => g.pestNow()); await wait(250);
    expect((await game(g => g.pest)) === 'peek', 'Pip peeks in at the tray edge first');
    const pp = await game(g => g.pestPos()), s0 = await game(g => g.score);
    await page.touchscreen.tap(pp[0], pp[1]); await wait(100);
    g = await game(g => ({ pest: g.pest, score: g.score }));
    expect(g.pest === 'flee' && g.score === s0 + 15, 'tapping Pip while he peeks shoos him: +15');
    await game(g => g.pestNow()); await wait(2400);
    expect((await game(g => g.pest)) === 'run' || (await game(g => g.pest)) === null, 'left alone, Pip dashes across');
    // sunset ends the run
    await game(g => g.setTime(.3));
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'the sun setting ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    expect(await game(g => g.photo === 0 && g.snapped === 0 && g.placed === 0 && g.combo === 0 && g.time > 55 && g.pest === null), 'photo, pieces, streak and clock reset');
  },
};
