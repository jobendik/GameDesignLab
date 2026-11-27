// Lantern Tail: reversals are ignored, turns are buffered, lanterns are eaten by really steering (arrow keys), the
// tail is worth nothing until LET GO banks 10·(1+…+n)·night, swipes and taps steer, banking advances the night
// (faster, crates), crashing ends the run with the banked score as best, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/61-lantern-tail/index.html',
  async run({ page, expect, wait, state, game }) {
    const key = k => 'Arrow' + k[0].toUpperCase() + k.slice(1);
    const pilot = async (done, maxMs) => {   // steer with real key presses, following the game's own greedy pilot
      const t0 = Date.now(); while (Date.now() - t0 < maxMs) { const s = await game(g => ({ k: g.suggest(), dir: g.dir, tail: g.tail, carry: g.carry, alive: g.alive, score: g.score })); if (!s.alive || done(s)) return s; if (s.k && s.k !== s.dir) await page.keyboard.press(key(s.k)); await wait(35); } return null; };
    const perp = () => game(g => { const h = g.head, D = { right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1] }, horiz = g.dir === 'left' || g.dir === 'right';
      const k = (horiz ? ['up', 'down'] : ['left', 'right']).find(k => [1, 2, 3].every(i => !g.deadly(h.c + D[g.dir][0] + D[k][0] * i, h.r + D[g.dir][1] + D[k][1] * i) && !g.deadly(h.c + D[k][0] * i, h.r + D[k][1] * i))); return k ? { k, d: D[k], x: h.x, y: h.y } : null; });
    expect((await state()).running && (await game(g => g.alive && g.dir === 'right' && g.tail === 0 && g.night === 1)), 'running, heading right with no tail');
    // no instant reverse; two quick turns are both honoured
    await page.keyboard.press('ArrowLeft'); await wait(350);
    expect(await game(g => g.alive && g.dir === 'right'), 'reversing into yourself is ignored');
    await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowLeft'); await wait(650);
    expect(await game(g => g.alive && g.dir === 'left'), 'two buffered turns (up, then left) both applied');
    // gather four lanterns by steering; nothing is scored yet
    let s = await pilot(s => s.tail >= 4, 40000); expect(s && s.alive && s.tail >= 4, 'steered into at least four lanterns');
    expect(s.score === 0 && (await state()).score === 0, 'lanterns on the tail score nothing yet');
    // LET GO (touch tap on the button) banks the triangular payout and frees the tail
    const n = await game(g => g.tail), b = await game(g => g.button); await page.touchscreen.tap(b.x, b.y); await wait(120);
    const after = await game(g => ({ score: g.score, tail: g.tail, banked: g.banked, sky: g.sky })); expect(after.score === 10 * n * (n + 1) / 2 && after.tail === 0 && after.banked === n && after.sky === n, 'LET GO banks 10·(1+…+n) and floats the tail away');
    expect((await state()).score === after.score, 'HUD shows the banked score');
    await page.touchscreen.tap(b.x, b.y); await wait(80); expect((await game(g => g.score)) === after.score, 'LET GO with fewer than 3 lanterns does nothing');
    // swipe steering (mouse drag) and tap-to-turn (touch), each onto a side that is clear
    await pilot(s => false, 400); let P = await perp();
    if (P) { await page.mouse.move(195, 300); await page.mouse.down(); await page.mouse.move(195 + P.d[0] * 44, 300 + P.d[1] * 44, { steps: 3 }); await page.mouse.up(); await wait(260); expect(await game((g, k) => !g.alive || g.dir === k, P.k), 'a swipe turns the dragon'); }
    await pilot(s => false, 400); P = await perp();
    if (P) { await page.touchscreen.tap(Math.min(370, Math.max(20, P.x + P.d[0] * 70)), P.y + P.d[1] * 70); await wait(260); expect(await game((g, k) => !g.alive || g.dir === k, P.k), 'a tap beside the head turns toward it'); }
    expect(await game(g => g.alive), 'still alive after swipe and tap steering');
    // a long tail advances the night: more per lantern, faster dragon, crates dropped in
    const sp0 = await game(g => g.speed); await game(g => g.grow(12)); s = await pilot(s => s.tail >= 12, 20000); expect(s && s.alive && s.tail >= 12, 'grew a long tail');
    const m = s.tail, before = s.score; await page.keyboard.press('Space'); await wait(150);
    const N2 = await game(g => ({ score: g.score, night: g.night, speed: g.speed, crates: g.crates.length, tail: g.tail }));
    expect(N2.score - before === 10 * m * (m + 1) / 2 && N2.tail === 0, 'Space lets go: the long tail pays its full triangular value');
    expect(N2.night >= 2 && N2.speed > sp0 && N2.crates >= 2, 'banking advanced the night: faster, with crates on the way');
    expect(await game(g => g.worth(5) === 150 * g.night), 'later nights multiply the payout');
    // stop steering: the dragon runs into something and the run ends with the banked score
    await pilot(s => s.tail >= 2, 8000); for (let i = 0; i < 80 && !(await state()).over; i++) await wait(150);
    const st = await state(); expect(st.over && st.score === N2.score && st.best === N2.score, 'crash ends the run; banked score is the best');
    await wait(1300); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.alive && g.tail === 0 && g.night === 1 && g.crates.length === 0 && g.banked === 0 && g.dir === 'right'), 'state fully reset');
  },
};
