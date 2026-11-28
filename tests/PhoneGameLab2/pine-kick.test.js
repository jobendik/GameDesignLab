// Pine Kick: a real mouse hold-and-release kicks Pip across the gap and the hold time sets the landing height (short tap vs
// full coil); Space kicks too; metres feed the HUD score; an acorn on the arc is collected; landing a whisker from a bramble
// pays a close-call bonus; a descending arc perches on a branch; a falling pinecone knocks Pip down the bark; kicking into a
// bramble ends the run; restart is clean; sliding below the climbing view also ends a run.
module.exports = {
  game: 'PhoneGameLab2/games/pine-kick/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let p = await game(g => g.pip); expect(p.st === 'perch' && p.side === -1, 'Pip starts on the ground by the left trunk');
    expect(await game(g => g.creep) === 0, 'the view does not climb before the first kick');
    const settle = async () => { for (let i = 0; i < 40 && (await game(g => g.pip.st)) === 'air'; i++) await wait(50); return game(g => g.pip); };
    // hold for a given time with the real mouse, return the height gained by that kick
    const hold = async ms => {
      await game(g => g.clearAhead());
      await page.mouse.move(195, 500); await page.mouse.down(); await wait(ms);
      const h0 = (await game(g => g.pip)).h; await page.mouse.up();
      await wait(30); const air = (await game(g => g.pip)).st === 'air';
      const q = await settle(); return { air, gain: q.h - h0, kp: (await game(g => g.pip)).kp, side: q.side, st: q.st };
    };
    // 1) a short tap hops a little; a full coil soars
    const a = await hold(60);
    expect(a.air, 'releasing the hold kicks Pip into the air');
    expect(a.side === 1 && a.st === 'cling', 'Pip lands on the right trunk');
    expect(a.kp < .3 && a.gain > 20, `a quick tap is a small hop (p=${a.kp.toFixed(2)}, +${Math.round(a.gain)})`);
    const b = await hold(900);
    expect(b.side === -1 && b.kp > .95, `a long hold is a full coil (p=${b.kp.toFixed(2)})`);
    expect(b.gain > a.gain + 150, `the full coil lands much higher (+${Math.round(b.gain)} vs +${Math.round(a.gain)})`);
    expect(await game(g => g.creep) > 0, 'once climbing, the view creeps upward');
    let s = await page.evaluate(() => ({ m: __lab.game.metres, score: __lab.game.score, hud: __lab.state.score }));
    expect(s.m > 0 && s.score >= s.m && s.hud === s.score, 'metres climbed score and reach the HUD');
    // 2) keyboard: hold Space, release
    await game(g => g.clearAhead()); const k0 = await game(g => g.kicks);
    await page.keyboard.down('Space'); await wait(300); await page.keyboard.up('Space'); await wait(40);
    expect(await game(g => g.kicks) === k0 + 1, 'Space hold-and-release kicks'); await settle();
    // 3) an acorn on the arc is collected and scores
    await game(g => g.clearAhead());
    let r = await game(g => { const path = g.path(.5), m = path[Math.floor(path.length / 2)]; g.addAcorn(m[0], m[1]); return { n: g.acorns, score: g.score }; });
    await game(g => g.kick(.5)); await settle();
    s = await game(g => ({ n: g.acorns, score: g.score }));
    expect(s.n === r.n + 1 && s.score >= r.score + 5, 'an acorn on the arc is grabbed and scores');
    // 4) close call: a bramble just above the landing spot pays the dare bonus (and doesn't hurt)
    await game(g => g.clearAhead());
    r = await game(g => { const L = g.predict(.4); g.addThorn(L.side, L.h + g.PR * .8 + 6, L.h + 70); return { d: g.dares, score: g.score, kind: g.predict(.4).kind }; });
    expect(r.kind === 'land', 'the landing spot itself is clear');
    await game(g => g.kick(.4)); let q = await settle();
    s = await game(g => ({ d: g.dares, score: g.score }));
    expect(q.st === 'cling' && s.d === r.d + 1 && s.score >= r.score + 15, 'landing a whisker from a bramble is a close call bonus');
    // 5) a descending arc lands on top of a branch (perch: no sliding)
    await game(g => g.clearAhead());
    r = await game(g => { const L = g.predict(0); g.addBranch(L.side, L.h - 13, 64); return g.predict(0); });
    expect(r.kind === 'perch', 'the predictor sees the branch');
    await game(g => g.kick(0)); q = await settle();
    expect(q.st === 'perch', 'Pip perches on the branch');
    const h1 = q.h; await wait(600); expect(Math.abs((await game(g => g.pip)).h - h1) < 1, 'a perch does not slide');
    // 6) a falling pinecone knocks Pip down the bark (sap keeps him still until then)
    await game(g => g.clearAhead()); await game(g => g.kick(.3)); q = await settle();
    await game(g => { const p = g.pip; g.addSurf(p.side, 'sap', p.h - 300, p.h + 200); g.dropCone(p.side); });
    for (let i = 0; i < 40 && await game(g => g.knocks) === 0; i++) await wait(50);
    expect(await game(g => g.knocks) === 1, 'the pinecone hits Pip');
    await wait(450); expect((await game(g => g.pip)).h < q.h - 40, 'the knock sends Pip sliding down');
    await wait(600);
    // 7) kicking into a bramble ends the run
    await game(g => g.clearAhead());
    await game(g => { const L = g.predict(.5); g.addThorn(L.side, L.h - 40, L.h + 40); g.kick(.5); });
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    let st = await state(); expect(st.over && await game(g => g.endWhy) === 'thorn', 'landing in a bramble ends the run');
    expect(st.best >= st.score && st.best > 0, 'best score recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    st = await state(); p = await game(g => g.pip);
    expect(st.running && !st.over && st.score === 0, 'restart gives a clean run');
    expect(p.st === 'perch' && await game(g => g.metres) === 0 && await game(g => g.kicks) === 0 && await game(g => g.creep) === 0, 'Pip back on the ground, nothing carried over');
    // 8) dawdling: after a kick the view keeps climbing; sliding below it ends the run
    await game(g => g.clearAhead()); await game(g => g.kick(.2));
    for (let i = 0; i < 120 && !(await state()).over; i++) await wait(100);
    expect((await state()).over && await game(g => g.endWhy) === 'fall', 'sliding out of the climbing view ends the run');
  },
};
