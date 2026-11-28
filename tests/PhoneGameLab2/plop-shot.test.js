// Plop Shot: with the real mouse, press when the sweeping sight is over a hole (fixes the column), hold while it climbs,
// release at the hole's height → the bag goes through and scores (HUD follows); a quick tap throws low into the wood
// (miss, streak reset); Space hold/release throws too; beating par moves on to the next event with fresh bags;
// falling short of par ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/plop-shot/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let s = await game(g => ({ r: g.round, b: g.bags, st: g.aim.st })); expect(s.r === 0 && s.b === 5 && s.st === 'sweep', 'event 1 with 5 bags, sight sweeping');
    const until = async (fn, arg, ms = 5000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await game(fn, arg)) return true; await wait(6); } return false; };
    const landed = () => until(g => !g.flying && g.aim.st !== 'thrown', null, 3000);
    // 1) a real aimed throw through the 25 hole
    expect(await until((g, h) => g.aim.st === 'sweep' && Math.abs(g.aim.x - g.holes[h].x) < 4, 2), 'sight passes over the hole');
    await page.mouse.move(195, 700); await page.mouse.down();
    expect((await game(g => g.aim.st)) === 'climb', 'pressing fixes the column and the sight climbs');
    expect(await until((g, h) => Math.abs(g.aim.y - g.holes[h].y) < 4, 2), 'sight climbs to the hole');
    await page.mouse.up(); expect((await game(g => g.bags)) === 4, 'release throws a bag');
    await landed();
    s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, last: __lab.game.last, streak: __lab.game.streak }));
    expect(['swish', 'in'].includes(s.last) && s.score >= 25 && s.hud === s.score && s.streak === 1, `the bag plops through and scores (${s.last}, ${s.score})`);
    // 2) a quick tap throws low into the wood
    await page.mouse.move(195, 700); await page.mouse.down(); await page.mouse.up(); await landed();
    s = await game(g => ({ last: g.last, streak: g.streak, b: g.bags }));
    expect(s.last === 'wood' && s.streak === 0 && s.b === 3, 'a low throw thuds into the wood and resets the streak ' + JSON.stringify(s));
    // 3) Space hold + release throws
    await page.keyboard.down('Space'); await wait(250); await page.keyboard.up('Space'); await wait(50);
    expect((await game(g => g.bags)) === 2, 'Space hold-and-release throws'); await landed();
    // 4) beat par → next event
    await game(g => g.setPar(1));
    for (let i = 0; i < 2; i++) { await page.mouse.down(); await page.mouse.up(); await landed(); }
    expect(await until(g => g.round === 1 && g.bags === 5 && g.between === 0, null, 4000), 'beating par starts the next event with fresh bags');
    // 5) short of par → over
    await game(g => g.setPar(999));
    for (let i = 0; i < 5; i++) { await until(g => g.aim.st === 'sweep', null, 2000); await page.mouse.down(); await page.mouse.up(); await landed(); }
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(100);
    let st = await state(); expect(st.over, 'missing par ends the run'); expect(st.best >= st.score && st.best > 0, 'best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    st = await state(); s = await game(g => ({ r: g.round, b: g.bags, rs: g.roundScore, k: g.streak, over: g.over, par: g.par }));
    expect(st.running && !st.over && st.score === 0 && s.r === 0 && s.b === 5 && s.rs === 0 && s.k === 0 && !s.over && s.par === 40, 'restart is clean');
  },
};
