// Punchline: the roll waits for the first tap, taps in the right lane play/score the next hole (more when it rings on the
// comb), early taps break the flow, wrong lanes and missed holes are slips, holds pay a bonus, finishing a tune moves the
// set on and speeds up, three slips end the run, restart is clean. The chart is fixed (no RNG), so lanes are deterministic.
module.exports = {
  game: 'PhoneGameLab/games/69-punchline/index.html',
  async run({ page, expect, wait, state, game }) {
    const tap = async p => { await page.touchscreen.tap(p.x, p.y); await wait(60); };
    const waitComb = async () => { for (let i = 0; i < 120; i++) { const n = await game(g => g.next); if (n && n.onComb) return n; await wait(30); } throw new Error('hole never reached the comb'); };
    expect((await state()).running, 'game running after autostart');
    const p0 = await game(g => g.pos); await wait(400);
    expect(!(await game(g => g.started)) && await game(g => g.pos) === p0, 'the roll waits for the first tap');
    let n = await game(g => g.next);
    await tap({ x: await game((g, l) => g.laneX(l), (n.lane + 1) % 4), y: n.y });
    expect(!(await game(g => g.started)) && await game(g => g.lives) === 3, 'a wrong lane before the start costs nothing');
    await tap(n);
    let s = await game(g => ({ started: g.started, score: g.score, flow: g.flow, taps: g.taps }));
    expect(s.started && s.taps === 1 && s.score === 2 && s.flow === 1, 'first tap starts the roll and rings on the comb');
    expect((await state()).score === 2, 'HUD score updated');
    // three more holes, each tapped as it crosses the comb (real time, real touches)
    for (let i = 0; i < 3; i++) { n = await waitComb(); await tap(n); }
    s = await game(g => ({ score: g.score, flow: g.flow, rings: g.rings, lives: g.lives }));
    expect(s.flow === 4 && s.rings === 4 && s.score === 8 && s.lives === 3, 'holes tapped on the comb ring and build flow');
    // an early tap (hole still above the comb) is safe but dull
    n = await game(g => g.next); expect(n.visible && !n.onComb, 'next hole is on the roll but not at the comb yet');
    await page.mouse.click(n.x, n.y); await wait(60);
    s = await game(g => ({ score: g.score, flow: g.flow, taps: g.taps }));
    expect(s.taps === 5 && s.score === 9 && s.flow === 0, 'an early tap scores 1 and breaks the flow');
    // keyboard lane keys
    n = await game(g => g.next); await page.keyboard.press(['d', 'f', 'j', 'k'][n.lane]); await wait(60);
    expect(await game(g => g.taps) === 6, 'lane keys play the next hole');
    // wrong lane is a slip
    n = await game(g => g.next); await tap({ x: await game((g, l) => g.laneX(l), (n.lane + 2) % 4), y: n.y });
    expect(await game(g => g.lives) === 2 && await game(g => g.taps) === 6, 'a wrong lane is a slip');
    // a hole that slides off the roll is a slip too
    for (let i = 0; i < 150 && await game(g => g.lives) === 2; i++) await wait(40);
    expect(await game(g => g.lives) === 1, 'a missed hole is a slip');
    await game(g => g.setLives(3));
    // hold slot: keep the pointer down until it completes
    for (let i = 0; i < 30 && !(await game(g => g.next.hold)); i++) await game(g => g.autoplay(1));
    n = await waitComb(); expect(n.hold, 'a long slot arrives');
    const sc = await game(g => g.score); await page.mouse.move(n.x, n.y); await page.mouse.down();
    for (let i = 0; i < 100 && await game(g => g.holdsDone) === 0; i++) await wait(40);
    await page.mouse.up();
    expect(await game(g => g.holdsDone) === 1 && await game(g => g.score) >= sc + 4, 'holding a long slot pays the hold bonus');
    // finish the tune: the set moves on and a bonus is paid
    const before = await game(g => g.score);
    for (let i = 0; i < 12 && await game(g => g.tunes) === 0; i++) await game(g => g.autoplay(8));
    s = await game(g => ({ tunes: g.tunes, song: g.song, score: g.score, lives: g.lives }));
    expect(s.tunes === 1 && s.song.n === 1 && s.song.title === 'Minuet in G' && s.score > before + 20, 'finishing a tune pays a bonus and starts the next');
    await wait(1500); expect(await game(g => g.tempo) > 1.6, 'the second tune runs faster');
    // three slips end the run
    for (let i = 0; i < 80 && !(await state()).over; i++) { n = await game(g => g.next); if (n && n.visible) await tap({ x: await game((g, l) => g.laneX(l), (n.lane + 1) % 4), y: n.y }); else await wait(100); }
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(100);
    const o = await state(); expect(o.over, 'three slips end the run');
    expect(o.best >= o.score && o.score > 0, 'best score recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    const f = await game(g => ({ lives: g.lives, started: g.started, flow: g.flow, taps: g.taps, song: g.song.n, pos: g.pos }));
    expect(f.lives === 3 && !f.started && f.flow === 0 && f.taps === 0 && f.song === 0 && f.pos === 0, 'roll, slips and set reset');
  },
};
