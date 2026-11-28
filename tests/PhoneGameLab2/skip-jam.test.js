// Skip Jam: the turners count Momo in, real taps timed to the rope clear passes (score, streak, groove), Space works too,
// standing still gets Momo tangled (a heart, streak reset, count back in), a held big jump after Pip's "Double!" call
// clears two passes in one jump (double-under bonus), Double Dutch brings a second rope, three tangles end the run,
// restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/skip-jam/index.html',
  timeout: 70000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let g = await game(g => ({ phase: g.phase, hearts: g.hearts, score: g.score }));
    expect(g.phase === 'count' && g.hearts === 3 && g.score === 0, 'run opens with a count-in and three hearts');
    const hop = async (how) => { await game(g => g.waitPass(.2)); if (how === 'key') await page.keyboard.press('Space'); else await page.touchscreen.tap(195, 600); await wait(320); };
    for (let i = 0; i < 4; i++) await hop('tap');
    g = await game(g => ({ skips: g.skips, streak: g.streak, score: g.score, hearts: g.hearts }));
    expect(g.skips === 4 && g.streak === 4 && g.hearts === 3, 'four timed taps clear four passes');
    expect(g.score >= 4 && g.score <= 12, 'each clean skip scores 1–3');
    await wait(50); expect((await state()).score === (await game(g => g.score)), 'HUD shows the score');
    for (let i = 0; i < 2; i++) await hop('key');
    expect((await game(g => g.skips)) === 6, 'Space hops too');
    // stand still → tangled
    await game(g => g.waitPass(.05)); await wait(250);
    g = await game(g => ({ hearts: g.hearts, streak: g.streak, phase: g.phase, skips: g.skips }));
    expect(g.hearts === 2 && g.streak === 0 && g.phase === 'trip' && g.skips === 6, 'missing the rope tangles Momo: -1 heart, streak reset');
    for (let i = 0; i < 40 && (await game(g => g.phase)) !== 'turn'; i++) await wait(150);
    expect((await game(g => g.phase)) === 'turn', 'the turners count Momo back in');
    // double-under with a real held jump
    await game(g => g.armDouble());
    await hop('tap');
    expect((await game(g => g.dbl)) === 'armed', 'Pip calls a double after the next pass');
    const d0 = await game(g => ({ score: g.score, skips: g.skips }));
    await game(g => g.waitPass(.1)); await page.mouse.move(195, 600); await page.mouse.down(); await wait(330); await page.mouse.up(); await wait(450);
    g = await game(g => ({ doubles: g.doubles, skips: g.skips, score: g.score, hearts: g.hearts, dbl: g.dbl }));
    expect(g.hearts === 2 && g.skips === d0.skips + 2 && g.doubles === 1 && g.dbl === null, 'a held jump clears both whipped passes: double-under');
    expect(g.score >= d0.score + 12, 'double-under pays a bonus');
    // double dutch
    await game(g => { g.bot(true); g.armDD(); });
    for (let i = 0; i < 30 && !(await game(g => g.dd)); i++) await wait(200);
    g = await game(g => ({ dd: g.dd, ropes: g.ropes, hearts: g.hearts }));
    expect(g.dd && g.ropes === 2 && g.hearts === 2, 'Double Dutch: a second rope joins');
    const s1 = await game(g => g.skips); await wait(2500);
    expect((await game(g => g.skips)) >= s1 + 3, 'two ropes keep the skips coming faster');
    // tangle out
    await game(g => g.bot(false));
    for (let i = 0; i < 120 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'three tangles end the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.skips === 0 && g.streak === 0 && g.phase === 'count' && g.ropes === 1 && !g.dd && g.lv === 0), 'hearts, skips, ropes and speed reset');
  },
};
