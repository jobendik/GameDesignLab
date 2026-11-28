// Strum Corner: strums are judged on time AND direction; a real mouse swipe down / up / tap resolves to down-strum,
// up-strum and slap; a real down-swipe on a down pick scores; the wrong direction is a miss that drains the vibe;
// a held chord (keyboard, held through its tail) pays the ring bonus; good play draws listeners (multiplier);
// an empty corner ends the run; finishing the set wins; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/strum-corner/index.html',
  timeout: 70000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms = 15000, arg) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await game(fn, arg)) return true; await wait(15); } return false; };
    expect((await state()).running, 'running after autostart');
    let s = await game(g => ({ crowd: g.crowd, vibe: g.vibe, score: g.score }));
    expect(s.crowd === 3 && s.vibe === 40 && s.score === 0, 'three pals listening, vibe 40, no coins');
    // 1) real mouse gestures resolve to the three strokes (nothing is near the strum ring during the count-in)
    await page.mouse.move(195, 480); await page.mouse.down(); await page.mouse.move(195, 540, { steps: 3 }); await page.mouse.up(); await wait(60);
    expect(await game(g => g.lastGesture) === 'D', 'swipe down = down-strum');
    await page.mouse.move(195, 540); await page.mouse.down(); await page.mouse.move(195, 470, { steps: 3 }); await page.mouse.up(); await wait(60);
    expect(await game(g => g.lastGesture) === 'U', 'swipe up = up-strum');
    await page.mouse.move(195, 500); await page.mouse.down(); await page.mouse.up(); await wait(60);
    expect(await game(g => g.lastGesture) === 'S', 'tap = slap');
    expect(await game(g => g.score) === 0 && (await game(g => g.counts.m)) === 0, 'stray strums in the count-in cost nothing');
    // 2) a real down-swipe timed onto a down pick scores
    expect(await until(g => { const n = g.next(); return n && n.type === 'D' && n.t - g.time < .05 && n.t - g.time > -.03; }), 'a down pick reaches the ring');
    await page.mouse.move(195, 470); await page.mouse.down(); await page.mouse.move(195, 530, { steps: 2 }); await page.mouse.up();
    await wait(80);
    s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, c: __lab.game.counts, streak: __lab.game.streak }));
    expect(s.c.p + s.c.g === 1 && s.score > 0 && s.hud === s.score && s.streak === 1, `the timed swipe scored (${JSON.stringify(s)})`);
    // 3) wrong direction on a down pick: a miss, vibe drops, streak resets
    await until(g => { const n = g.next(); return n && n.type === 'D'; });
    s = await page.evaluate(() => { const g = __lab.game, n = g.next(), v = g.vibe, w = g.counts.w; const r = g.hit('U', n.t); return { r, dv: g.vibe - v, w: g.counts.w - w, streak: g.streak }; });
    expect(s.r === 'wrong' && s.dv < 0 && s.w === 1 && s.streak === 0, `up-strum on a down pick is a miss (${JSON.stringify(s)})`);
    // 4) a streak of perfect strums raises the vibe and draws listeners -> higher multiplier
    const m0 = await game(g => g.mult());
    await page.evaluate(() => new Promise(res => { const g = __lab.game; let k = 0; (function f() { const n = g.next(); if (n && n.t <= g.time + .01) { g.hit(n.type === 'H' ? 'D' : n.type, n.t); g.release(); k++; } if (k >= 16) return res(); requestAnimationFrame(f); })(); }));
    await wait(1500);
    s = await game(g => ({ crowd: g.crowd, vibe: g.vibe, mult: g.mult(), streak: g.streak }));
    expect(s.vibe > 60 && s.crowd >= 5 && s.mult > m0, `a streak drew a crowd (${JSON.stringify(s)})`);
    // 5) a held chord via the keyboard: press on the pick, hold through the tail -> ring bonus
    const hold = await page.evaluate(() => { const g = __lab.game; g.setTime(30); let n = g.next(); while (n && n.type !== 'H') { g.setTime(n.t + .01); n = g.next(); } g.setTime(n.t - .6); return n; });
    expect(hold && hold.type === 'H' && hold.dur > .5, 'found a held chord');
    expect(await until((g, t) => g.time >= t - .03, 3000, hold.t), 'reached the held chord');
    await page.keyboard.down('ArrowDown'); await wait(120);
    expect(await game(g => g.holding), 'holding the chord');
    await until((g, t) => g.time > t + .05, 6000, hold.t + hold.dur);
    await page.keyboard.up('ArrowDown'); await wait(80);
    expect((await game(g => g.counts.holds)) === 1, 'held to the end: ring bonus');
    // 6) an empty corner ends the run
    await game(g => g.setVibe(4));
    expect(await until(g => __lab.state.over, 12000), 'missing with no vibe left ends the run');
    s = await state(); expect(s.best >= s.score && s.score > 0, 'best recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(400);
    s = await page.evaluate(() => ({ st: __lab.state, g: { score: __lab.game.score, vibe: __lab.game.vibe, crowd: __lab.game.crowd, time: __lab.game.time, c: __lab.game.counts } }));
    expect(s.st.running && !s.st.over && s.g.score === 0 && s.g.vibe === 40 && s.g.crowd === 3 && s.g.time < 1 && s.g.c.p === 0, 'restart is clean');
    // 7) finishing the whole set wins
    await game(g => g.setTime(g.total - 1));
    expect(await until(g => __lab.state.over, 4000), 'the set finishes');
    await wait(900); expect(await page.evaluate(() => document.body.innerText.includes('Set complete')), 'finishing the set is a win');
  },
};
