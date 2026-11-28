// Say Cheese: a real tap on a pal who is posing correctly startles them and burns 0.8 s; a real tap on the spoiler
// fixes them and Bun snaps the photo at once (score, HUD); clean photos build a streak; the OFF-BEAT spoiler really
// bobs half a beat out of step with the group; a photo the countdown catches with a spoiler is blurry and costs a
// film roll; three blurry photos end the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/say-cheese/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await game(fn)) return true; await wait(40); } return false; };
    expect((await state()).running, 'running after autostart');
    expect(await until(g => g.phase === 'pose'), 'the first group strikes a pose');
    let s = await game(g => ({ photo: g.photo, rolls: g.rolls, n: g.pals().length, odd: g.pals().filter(p => p.odd).length }));
    expect(s.photo === 1 && s.rolls === 3 && s.n === 6 && s.odd === 1, 'photo 1: six pals, one spoiler, three film rolls');
    // 1) wrong pal: startled, -0.8 s, no score
    const pals = await game(g => g.pals()), good = pals.find(p => !p.odd), odd = pals.find(p => p.odd);
    let t0 = await game(g => g.timeLeft);
    await page.touchscreen.tap(good.x, good.y - good.s * .2); await wait(60);
    s = await game(g => ({ t: g.timeLeft, score: g.score, phase: g.phase }));
    expect(t0 - s.t > .75 && s.score === 0 && s.phase === 'pose', `a wrong tap costs 0.8 s (${t0} -> ${s.t})`);
    // 2) the spoiler: fixed, photo snapped immediately
    await page.touchscreen.tap(odd.x, odd.y - odd.s * .2); await wait(60);
    s = await page.evaluate(() => ({ phase: __lab.game.phase, score: __lab.game.score, hud: __lab.state.score, taken: __lab.game.taken }));
    expect(s.phase === 'snap' && s.score > 0 && s.hud === s.score && s.taken === 1, `fixing the spoiler snaps the photo (${JSON.stringify(s)})`);
    // 3) two clean photos (no wrong taps) build a streak
    for (let k = 0; k < 2; k++) {
      expect(await until(g => g.phase === 'pose'), 'next group poses');
      const o = await game(g => g.pals().filter(p => p.odd)); for (const p of o) await page.touchscreen.tap(p.x, p.y - p.s * .2); await wait(60);
      expect(await game(g => g.phase === 'snap'), 'clean photo snapped');
    }
    expect(await game(g => g.streak === 2 && g.taken === 3), 'two clean photos in a row: streak 2');
    // 4) the off-beat bouncer is half a beat out of step
    await game(g => g.force('beat'));
    expect(await until(g => g.phase === 'pose' && g.photo === 4), 'photo 4 poses');
    const diff = await page.evaluate(() => new Promise(res => { const g = __lab.game, ps = g.pals(), o = ps.find(p => p.odd), n = ps.find(p => !p.odd); let mx = 0, k = 0; (function f() { mx = Math.max(mx, Math.abs(g.bobOf(o.i) - g.bobOf(n.i))); if (++k > 50) return res(mx); requestAnimationFrame(f); })(); }));
    expect(diff > .5, `the off-beat spoiler bobs out of step (max diff ${diff})`);
    expect(await game(g => g.pals().find(p => p.odd) && true), 'spoiler present');
    // 5) the countdown catches the spoiler: blurry, a roll lost, streak gone
    await game(g => g.setTime(.15));
    expect(await until(g => g.phase === 'snap'), 'flash goes off');
    s = await game(g => ({ rolls: g.rolls, streak: g.streak, taken: g.taken })); expect(s.rolls === 2 && s.streak === 0 && s.taken === 3, 'blurry photo costs a film roll');
    // 6) two more blurry photos end the run
    for (let k = 0; k < 2; k++) { expect(await until(g => g.phase === 'pose'), 'group poses'); await game(g => g.setTime(.1)); await wait(200); }
    for (let i = 0; i < 60 && !(await state()).over; i++) await wait(50);
    s = await state(); expect(s.over && s.best >= s.score && s.score > 0, 'out of film: run over, best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(300);
    s = await page.evaluate(() => ({ st: __lab.state, photo: __lab.game.photo, rolls: __lab.game.rolls, score: __lab.game.score, taken: __lab.game.taken, streak: __lab.game.streak }));
    expect(s.st.running && !s.st.over && s.photo === 1 && s.rolls === 3 && s.score === 0 && s.taken === 0 && s.streak === 0, 'restart is clean');
  },
};
