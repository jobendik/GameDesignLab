// Splodge: the first blob waits for you, pops score + refund time, same-colour pops chain, stray taps and dried blobs
// spill time, big blobs need three taps, the layer advances, an empty clock ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/01-splodge/index.html',
  async run({ page, expect, wait, state, game }) {
    const near = (a, b, eps) => Math.abs(a - b) <= eps;
    const tapBlob = async id => { const b = (await game(g => g.blobs)).find(b => b.id === id); expect(b, 'blob ' + id + ' exists'); await page.touchscreen.tap(b.x, b.y); await wait(60); };
    expect((await state()).running, 'game running after autostart');
    // onboarding: clock does not run until the first blob is popped
    await wait(500);
    expect(await game(g => g.time) === 20 && !(await game(g => g.started)), 'clock waits for the first pop');
    let blobs = await game(g => g.blobs); expect(blobs.length === 1, 'one starter blob');
    await tapBlob(blobs[0].id);
    expect(await game(g => g.started) && await game(g => g.pops) === 1, 'first tap pops the starter blob');
    const s1 = await game(g => g.score); expect(s1 > 0 && (await state()).score === s1, 'pop scores and HUD follows');
    // deterministic chain: two blobs of the same paint, then a different one
    await game(g => { g.setAuto(false); g.clear(); g.setTime(25); });
    const a = await game(g => g.spawn('plain', 1, .3, .5, 30)), b = await game(g => g.spawn('plain', 1, .7, .5, 30)), c = await game(g => g.spawn('plain', 2, .5, .75, 30));
    const m0 = await game(g => g.marks);
    await tapBlob(a); const sa = await game(g => g.score);
    await tapBlob(b); const sb = await game(g => g.score);
    expect(await game(g => g.chain) === 2, 'same colour twice makes a ×2 chain');
    expect(sb - sa > sa - s1, 'chained pop is worth more than the pop before it');
    expect(await game(g => g.marks) >= m0 + 3, 'pops leave splats and a chain stroke on the paper');
    await tapBlob(c); expect(await game(g => g.chain) === 1, 'a different colour restarts the chain');
    // stray tap spills time and drops the chain
    const t0 = await game(g => g.time); await page.touchscreen.tap(60, 760); await wait(80);
    const t1 = await game(g => g.time); expect(t0 - t1 > .45 && t0 - t1 < 1, 'stray tap costs about half a second (' + (t0 - t1).toFixed(2) + ')');
    expect(await game(g => g.chain) === 0, 'stray tap breaks the chain');
    // big blob takes three taps
    const big = await game(g => g.spawn('big', 0, .5, .4, 30)), sBig = await game(g => g.score);
    await tapBlob(big); expect((await game(g => g.blobs)).find(x => x.id === big).hp === 2, 'big blob survives the first tap');
    await tapBlob(big); await tapBlob(big);
    expect(!(await game(g => g.blobs)).some(x => x.id === big), 'third tap pops the big blob');
    expect(await game(g => g.score) >= sBig + 50, 'big blob pays out');
    // a blob left alone dries: costs time
    await game(g => g.setTime(25)); await game(g => g.spawn('plain', 3, .5, .6, .3)); await wait(700);
    expect((await game(g => g.blobs)).length === 0, 'neglected blob dried up');
    const t2 = await game(g => g.time); expect(t2 < 25 - 1.5 - .5 && t2 > 21, 'dried blob spilt 1.5s (' + t2.toFixed(2) + ')');
    // layer 2 after enough pops
    for (let i = 0; i < 12 && await game(g => g.level) === 1; i++) { const id = await game((g, i) => g.spawn('plain', i % 3, .2 + (i % 4) * .2, .5, 30), i); await tapBlob(id); }
    expect(await game(g => g.level) === 2, 'ten pops reach layer 2');
    // natural spawning resumes and the clock running out ends the run
    await game(g => { g.setAuto(true); g.setTime(1.2); }); await wait(900);
    expect((await game(g => g.blobs)).length >= 1, 'blobs spawn on their own');
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    const s = await state(); expect(s.over, 'empty clock ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.time) === 20 && await game(g => g.level) === 1 && await game(g => g.chain) === 0 && await game(g => g.marks) === 0 && (await game(g => g.blobs)).length === 1, 'state fully reset');
  },
};
