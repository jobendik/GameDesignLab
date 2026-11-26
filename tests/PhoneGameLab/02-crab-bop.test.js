// Crab Bop: crabs pop up on their own, bops score and build a combo multiplier (touch + keyboard), escapes drop the
// combo, hermits take two bops, urchins cost hearts (three = game over), gold starts a clock-freezing frenzy,
// the tide running out ends the run with a heart bonus, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/02-crab-bop/index.html',
  async run({ page, expect, wait, state, game }) {
    const hole = async i => (await game(g => g.holes))[i];
    const bop = async i => { const h = await hole(i); await page.touchscreen.tap(h.x, h.y); await wait(70); };
    const up = async (i, kind, dur) => { expect(await game((g, a) => g.pop(a[0], a[1], a[2]), [i, kind, dur || 6]), 'pop ' + kind + ' in hole ' + i); await wait(260); };
    expect((await state()).running, 'game running after autostart');
    let seen = false; for (let i = 0; i < 20 && !seen; i++) { await wait(150); seen = (await game(g => g.holes)).some(h => h.kind); }
    expect(seen, 'something pops up on its own');
    await game(g => { g.setAuto(false); g.clear(); }); await wait(400);
    const s0 = await game(g => g.score), c0 = await game(g => g.combo);
    // touch bop
    await up(4, 'crab'); await bop(4);
    expect(await game(g => g.score) === s0 + 10, 'bopping a crab scores 10');
    expect(await game(g => g.combo) === c0 + 1 && (await state()).score === await game(g => g.score), 'combo counts and HUD follows');
    expect((await hole(4)).ph === 'bonk', 'bopped crab is knocked out');
    // empty burrow: nothing happens
    const s1 = await game(g => g.score); await bop(8);
    expect(await game(g => g.score) === s1 && await game(g => g.hearts) === 3, 'tapping an empty burrow is harmless');
    // keyboard bop (Q = top-left)
    await up(0, 'crab'); await page.keyboard.press('q'); await wait(70);
    expect(await game(g => g.score) > s1, 'keyboard bop works');
    // an escape drops the combo
    await up(2, 'crab', .2); await wait(600);
    expect(await game(g => g.combo) === 0 && (await hole(2)).kind === null, 'an escaped crab resets the combo');
    // five clean bops → ×2, sixth pays double
    for (let i = 0; i < 5; i++) { await wait(380); await up(i, 'crab'); await bop(i); }
    expect(await game(g => g.combo) === 5 && await game(g => g.mult) === 2, 'five in a row gives ×2');
    await wait(380); const s2 = await game(g => g.score); await up(6, 'crab'); await bop(6);
    expect(await game(g => g.score) === s2 + 20, '×2 crab pays 20');
    // hermit takes two bops
    const s3 = await game(g => g.score); await up(7, 'hermit'); await bop(7);
    expect((await hole(7)).kind === 'hermit' && (await hole(7)).hp === 1 && (await hole(7)).ph === 'up', 'first bop only knocks the shell off');
    await bop(7); expect((await hole(7)).ph === 'bonk' && await game(g => g.score) === s3 + 5 + 50, 'second bop scores the hermit (25 ×2)');
    // gold crab → frenzy freezes the clock
    await up(8, 'gold'); await bop(8);
    expect(await game(g => g.frenzy) > 4, 'gold crab starts a frenzy');
    const t0 = await game(g => g.time); await wait(500); expect(await game(g => g.time) === t0, 'clock is frozen during the frenzy');
    // urchins cost hearts; three end the run
    await game(g => g.clear());
    for (let n = 1; n <= 3; n++) {
      await wait(350); const sc = await game(g => g.score); await up(n, n === 2 ? 'masked' : 'urchin'); await bop(n);
      expect(await game(g => g.hearts) === 3 - n && await game(g => g.score) === sc, 'urchin ' + n + ' costs a heart and no points');
      if (n === 1) expect(await game(g => g.combo) === 0, 'urchin breaks the combo');
    }
    await wait(300); let s = await state(); expect(s.over, 'three prickles end the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    let r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts) === 3 && await game(g => g.combo) === 0 && await game(g => g.time) > 59 && await game(g => g.frenzy) === 0 && await game(g => g.bops) === 0, 'state fully reset');
    // second run: the tide comes in → finish with heart bonus
    await game(g => { g.setAuto(false); g.clear(); }); await up(4, 'crab'); await bop(4);
    await game(g => g.setElapsed(59.6)); await wait(900);
    s = await state(); expect(s.over, 'time running out ends the run'); expect(s.score === 10 + 150, 'three hearts add a 150 bonus (score ' + s.score + ')');
  },
};
