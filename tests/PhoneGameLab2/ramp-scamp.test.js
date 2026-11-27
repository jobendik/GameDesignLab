// Ramp Scamp: holding (mouse, then keyboard) tilts the active ramp and releasing locks the angle; a well-set ramp carries
// Pip over the gap and scores; perfect landings build the multiplier; a badly set ramp costs a life; three tumbles end
// the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/ramp-scamp/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let r = await game(g => ({ lives: g.lives, gaps: g.gaps, pip: g.pip.state, ramp: g.ramp }));
    expect(r.lives === 3 && r.gaps === 0 && r.pip === 'run' && r.ramp.a === 0 && r.ramp.ideal >= 28, 'Pip is rolling toward a flat ramp');
    // real input: hold the mouse until the ramp is about right, release, the angle stays and Pip clears the gap
    const hold = async (down, up) => { await down(); for (let i = 0; i < 60; i++) { const q = await game(g => g.ramp); if (!q || q.a >= q.ideal - 4) break; await wait(15); } await up(); return game(g => g.ramp); };
    const a1 = await hold(() => page.mouse.move(200, 500).then(() => page.mouse.down()), () => page.mouse.up());
    expect(a1.a > a1.ideal - 6 && a1.a < a1.ideal + 9, 'holding tilts the ramp up to the wanted angle (' + a1.a.toFixed(1) + '° vs ' + a1.ideal.toFixed(1) + '°)');
    await wait(150); const a1b = await game(g => g.ramp);
    expect(a1b.n !== a1.n || Math.abs(a1b.a - a1.a) < .01, 'released ramp keeps its angle');
    for (let i = 0; i < 40 && await game(g => g.gaps) < 1; i++) await wait(100);
    r = await page.evaluate(() => ({ hud: window.__lab.state.score, score: window.__lab.game.score, gaps: window.__lab.game.gaps, lives: window.__lab.game.lives }));
    expect(r.gaps === 1 && r.lives === 3 && r.score >= 10 && r.hud === r.score, 'Pip jumped the first gap off the tilted ramp and scored');
    // keyboard: Space tilts the next ramp the same way
    const a2 = await hold(() => page.keyboard.down('Space'), () => page.keyboard.up('Space'));
    expect(a2.n !== a1.n && a2.a > 5 && a2.a < a2.ideal + 9, 'Space tilts the next ramp');
    // autopilot (holds exactly as long as needed through the same input path): perfect landings build the multiplier
    await game(g => g.auto(true));
    for (let i = 0; i < 100 && await game(g => g.gaps) < 5; i++) await wait(150);
    r = await page.evaluate(() => { const g = window.__lab.game; return { hud: window.__lab.state.score, score: g.score, gaps: g.gaps, lives: g.lives, streak: g.streak }; });
    expect(r.gaps >= 5 && r.lives === 3 && r.streak >= 2 && r.score >= 110 && r.hud === r.score, 'five gaps cleared, perfect streak multiplies the score');
    await game(g => g.auto(false));
    // a badly set ramp: Pip tumbles, a life goes; three tumbles end the run
    let lives = 3;
    for (let n = 0; n < 3; n++) {
      for (let i = 0; i < 80; i++) {
        const cur = await game(g => g.lives); if (cur < lives) break;
        await game(g => { if (!g.ramp || g.ramp.lock) return; const bad = [0, 66].find(d => { const t = g.sim(d); return t === 'miss' || t === 'face'; }); if (bad != null) g.setAngle(bad); else g.setAngle(g.ramp.ideal); });
        await wait(100);
      }
      const now = await game(g => g.lives); expect(now === lives - 1, 'a wrong angle drops Pip into the gap: ' + now + ' lives'); lives = now;
    }
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const e = await state(); expect(e.over, 'third tumble ends the run'); expect(e.best >= e.score && e.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(400);
    const s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.lives === 3 && g.gaps === 0 && g.streak === 0 && g.tier === 0 && g.acorns === 0 && g.ramp.n === 0), 'lives, gaps and ramps reset');
  },
};
