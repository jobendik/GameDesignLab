// Volley Garden: a real mouse swipe strikes a cross as it reaches the chalk ring and scores past a slow keeper; the HUD
// follows; swiping when no ball is in reach is a whiff; a soft shot straight at a sharp Nori is saved (streak reset);
// a lobbed cross struck in the air is a volley; full time ends the run neutrally and restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/volley-garden/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const G = await game(g => g.geom());
    const until = async (fn, ms = 4000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await game(fn)) return true; await wait(12); } return false; };
    const ready = async () => { await until(g => g.ball.ph !== 'cross' && g.ball.ph !== 'shot' && g.keeper.st === 'ready', 5000); };
    // swipe toward a goal-line x with the real mouse
    const swipeTo = async (xt) => {
      const b = await game(g => ({ x: g.ball.x, y: g.ball.y }));
      const tanA = (xt - b.x) / ((b.y - G.goalY) * .85), dy = 110, dx = tanA * dy;
      const x0 = G.cx, y0 = G.strikeY + 90;
      await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x0 + dx, y0 - dy, { steps: 2 }); await page.mouse.up();
    };
    // 1) whiff: nothing in reach
    await ready(); const s0 = await game(g => g.shots);
    if (await game(g => !g.strikable())) { await page.mouse.move(195, 700); await page.mouse.down(); await page.mouse.move(195, 600, { steps: 2 }); await page.mouse.up(); await wait(250); expect(await game(g => g.shots) === s0, 'a swipe with no ball in reach is a whiff'); }
    // 2) goal through genuine play: slow keeper, fast swipe into the far corner when the ball hits the ring
    await game(g => g.keeperSkill(0));
    let scored = false;
    for (let i = 0; i < 4 && !scored; i++) {
      await ready(); await game((g, a) => g.cross('roll', a), G.cx);
      expect(await until(g => g.strikable() && g.quality() > .6, 4000), 'the cross reaches the chalk ring');
      const kx = await game(g => g.keeper.x); await swipeTo(kx > G.cx ? G.cx - G.goalW * .36 : G.cx + G.goalW * .36);
      await until(g => g.ball.ph !== 'shot' && g.ball.ph !== 'cross', 3000);
      scored = await game(g => g.why === 'goal');
    }
    expect(scored, 'a swiped shot past the keeper is a goal');
    let s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, goals: __lab.game.goals, streak: __lab.game.streak }));
    expect(s.score > 0 && s.hud === s.score && s.goals >= 1 && s.streak >= 1, 'goal scores and reaches the HUD');
    // 3) a lobbed cross struck in the air is a volley
    await ready(); await game((g, a) => g.cross('lob', a), G.cx + 30);
    expect(await until(g => g.strikable() && g.quality() > .6 && g.ball.z > 12), 'lob arrives in the air');
    const sc0 = await game(g => g.score); await swipeTo(G.cx - G.goalW * .36);
    expect(await until(g => g.ball.ph === 'shot', 500) || await game(g => g.ball.struck), 'the volley is struck');
    expect(await game(g => g.ball.volley), 'struck in the air = volley');
    await until(g => g.ball.ph !== 'shot', 3000);
    if (await game(g => g.why === 'goal')) expect(await game(g => g.score) - sc0 >= 20, 'volley goals pay double');
    // 4) a soft shot straight at a sharp keeper is saved and resets the streak
    await game(g => g.keeperSkill(1)); await ready();
    await game((g, a) => g.cross('roll', a), G.cx);
    expect(await until(g => g.strikable() && g.quality() > .75, 4000), 'cross arrives');
    const sv0 = await game(g => g.saves); await page.keyboard.press('ArrowUp');
    await until(g => g.ball.ph !== 'shot' && g.ball.struck, 3000);
    s = await game(g => ({ why: g.why, saves: g.saves, streak: g.streak }));
    expect(s.why === 'save' && s.saves === sv0 + 1 && s.streak === 0, `Nori saves the soft central shot (${s.why})`);
    // 5) full time
    await game(g => { g.clock = .3; });
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150);
    let st = await state(); expect(st.over, 'full time ends the run'); expect(st.best >= st.score && st.best > 0, 'best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    st = await state(); const r = await game(g => ({ c: g.clock, goals: g.goals, shots: g.shots, streak: g.streak, over: g.over }));
    expect(st.running && !st.over && st.score === 0 && r.c > 74 && r.goals === 0 && r.shots === 0 && r.streak === 0 && !r.over, 'restart is clean');
  },
};
