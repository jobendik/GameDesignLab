// Neon Pin Climb — vertical pinball time-attack. Menu → CLIMB (real tap) → a real pointer on the left half raises only the left
// flippers, the right half only the right ones (torque model, ≤ 60 ms stroke), Z / X / Space from the keyboard → a ball dropped on a
// raised flipper settles in the cradle → 300 random 2600 u/s shots with flippers flapping never tunnel through a rail → a ball
// rolling down from the inlane and flipped at the right moment flies up a side lane, over the one-way lid and onto floor 1 (+time,
// +score); the lid then stops a falling ball → falling through floor 1's flipper gap drops you back to floor 0 and resets the streak
// → hitting the three targets charges a floor (+4 s), a green crystal adds +2 s, a closed lane's lid blocks the climb → draining out
// of the tower base costs 3 s → the clock running out ends the run (card, best persisted) → P pauses the real-time loop → PLAY AGAIN
// resets → the same seed + same inputs replay identically.
module.exports = {
  game: 'games/neon-pin-climb.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 120000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const place = (x, y, vx, vy) => page.evaluate(a => window.__gdl.place(...a), [x, y, vx, vy]);
    const cheat = o => page.evaluate(o => window.__gdl.cheat(o), o);
    const Y = (k, v) => -k * 560 - v;

    // 1. menu → CLIMB
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#bPlay').isVisible(), 'boots to the menu card');
    await page.locator('#bPlay').tap(); await page.evaluate(() => window.__gdl.manual(true));
    s = await st(); expect(s.mode === 'play' && s.maxFloor === 0 && s.score === 0 && Math.abs(s.time - 45) < .5, 'run starts on floor 0 with 45 s');
    await cheat({ time: 999 });

    // 2. real pointer halves + keys
    const vp = page.viewportSize();
    await page.mouse.move(vp.width * .25, vp.height * .7); await page.mouse.down(); await adv(.025); s = await st();
    expect(s.flips[0].held && !s.flips[1].held && s.flips[0].a < s.flips[0].rest - .2 && s.flips[0].a > s.flips[0].up, 'left-half hold: left flipper mid-stroke, right idle');
    await adv(.035); s = await st(); expect(Math.abs(s.flips[0].a - s.flips[0].up) < 1e-6 && Math.abs(s.flips[1].a - s.flips[1].rest) < 1e-6, 'left flipper at the stop within 60 ms');
    await page.mouse.up(); await adv(.15); s = await st(); expect(!s.flips[0].held && Math.abs(s.flips[0].a - s.flips[0].rest) < 1e-6, 'release returns it');
    await page.mouse.move(vp.width * .8, vp.height * .7); await page.mouse.down(); await adv(.07); s = await st();
    expect(s.flips[1].held && !s.flips[0].held && Math.abs(s.flips[1].a - s.flips[1].up) < 1e-6, 'right-half hold raises the right flipper'); await page.mouse.up(); await adv(.15);
    await page.keyboard.down('KeyZ'); await adv(.07); s = await st(); expect(s.flips[0].held && !s.flips[1].held, 'Z = left'); await page.keyboard.up('KeyZ');
    await page.keyboard.down('KeyX'); await adv(.07); s = await st(); expect(s.flips[1].held && !s.flips[0].held, 'X = right'); await page.keyboard.up('KeyX');
    await page.keyboard.down('Space'); await adv(.07); s = await st(); expect(s.flips.every(f => f.held), 'Space = both'); await page.keyboard.up('Space'); await adv(.15);

    // 3. cradle
    await page.evaluate(() => window.__gdl.flip(0, true)); await adv(.1); await place(150, Y(0, 160), 0, 0); await adv(2.5); s = await st();
    expect(Math.hypot(s.ball.vx, s.ball.vy) < 20 && Math.hypot(s.ball.x - 110, s.ball.y - Y(0, 70)) < 35, 'ball cradles at the left flipper base (' + Math.round(s.ball.x) + ',' + Math.round(s.ball.v) + ')');
    await page.evaluate(() => window.__gdl.flip(0, false)); await adv(.3);

    // 4. anti-tunnelling against every two-way rail of floors 0–2
    const tun = await page.evaluate(() => { const g = window.__gdl, segs = [0, 1, 2].flatMap(k => g.geom(k).segs.filter(w => !w[5])); let rs = 13, bad = 0, n = 0, worst = 0;
      const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
      for (let q = 0; q < 300; q++) { const a = rnd() * Math.PI * 2, k = Math.floor(rnd() * 2); g.place(80 + rnd() * 240, g.Y(k, 180 + rnd() * 330), Math.cos(a) * 2600, Math.sin(a) * 2600); g.flip(0, rnd() < .5); g.flip(1, rnd() < .5);
        for (let i = 0; i < 40; i++) { g.advance(1 / 120); const b = g.state.ball; n++; if (b.x < 16 || b.x > 384) bad++;
          for (const w of segs) { const dx = w[2] - w[0], dy = w[3] - w[1]; let t = ((b.x - w[0]) * dx + (b.y - w[1]) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t));
            const pen = 9 + w[4] - Math.hypot(b.x - w[0] - dx * t, b.y - w[1] - dy * t); if (pen > worst) worst = pen; if (pen > 3) bad++; } } }
      g.flip(0, false); g.flip(1, false); return { bad, n, worst }; });
    expect(tun.n > 10000 && tun.bad === 0, `no tunnelling in ${tun.n} samples (worst overlap ${tun.worst.toFixed(2)})`);

    // 5. a real climb: ball rolls off the left inlane, a timed flip sends it up a lane and onto floor 1
    const climb = await page.evaluate(() => { const g = window.__gdl;
      for (let d = .6; d <= 1.0; d += .005) { g.start(5); g.cheat({ time: 30 }); g.place(70, g.Y(0, 150), 0, 0); g.advance(d); g.flip(0, true); g.advance(.15); g.flip(0, false);
        for (let i = 0; i < 300; i++) { g.advance(1 / 120); const s = g.state; if (s.maxFloor >= 1) return { d, time: s.time, score: s.score, x: s.ball.x, gates: s.gates }; } }
      return null; });
    expect(climb && climb.time > 30 + 4 && climb.score >= 1000 && climb.gates === 1, 'a flipper shot climbs to floor 1 (+' + (climb && (climb.time - 30 + .5).toFixed(1)) + ' s) at a ' + (climb && Math.round(climb.d * 1000)) + ' ms delay');
    await adv(1.2); s = await st(); expect(s.cur === 1 && s.ball.y < Y(1, 0), 'ball stays on floor 1 (lid / flippers catch it)');
    await page.evaluate(() => window.__gdl.flip(2, false));

    // 6. lid is one-way: a ball dropped on it from above stays up
    await place(36, Y(0, 752), 0, 250); await adv(.8); s = await st(); expect(s.ball.y < Y(0, 600) && s.ball.x > 50, 'one-way lid holds a falling ball and feeds it to floor 1 (' + Math.round(s.ball.x) + ',' + Math.round(-s.ball.y) + ')');

    // 7. falling through floor 1's flipper gap drops to floor 0, streak reset
    await place(200, Y(1, 60), 0, 300); await adv(1.5); s = await st();
    expect(s.cur === 0 && s.streak === 0 && s.maxFloor === 1, 'fell back to floor 0 (cur ' + s.cur + ')');

    // 8. charge targets, time crystal
    s = await st(); const F0 = await page.evaluate(() => { const g = window.__gdl; g.place(200, g.Y(0, 300), 0, 0); return g.state.floorInfo; });
    let t0 = (await st()).time;
    for (const tg of F0.targets) { await place(tg.x, tg.y + 30, 0, -700); await adv(.08); }
    s = await st(); expect(s.floorInfo.charged && s.charged === 1 && s.time > t0 + 3.5, 'three targets charge the floor (+' + (s.time - t0).toFixed(1) + ' s)');
    const it = s.floorInfo.items[0]; t0 = s.time; await place(it.x, it.y + 20, 0, -300); await adv(.1); s = await st();
    expect(s.crystals === 1 && s.time > t0 + 1.8, 'green crystal +2 s');

    // 9. closed lane: lid is solid from below
    const closed = await page.evaluate(() => { const g = window.__gdl; for (let k = 3; k < 40; k++) { const G = g.geom(k); const s2 = G.lane.indexOf(false); if (s2 >= 0) return { k, side: s2 }; } return null; });
    expect(closed, 'higher floors close a lane');
    await cheat({ floor: closed.k }); const lx = closed.side ? 363 : 37;
    await place(lx, Y(closed.k, 640), 0, -1400); await adv(.6); s = await st();
    expect(s.ball.y > Y(closed.k, 735) && s.maxFloor === closed.k, 'closed lane: the lid blocks the climb');

    // 10. drain out of the tower base costs 3 s
    await cheat({ floor: 0, time: 20 }); await place(200, Y(0, 10), 0, 300); await adv(.3); s = await st();
    expect(s.drops === 1 && s.time < 17.5 && s.ball.y < Y(0, 300), 'drop below floor 0 → −3 s, ball relaunched');

    // 11. clock runs out → game over
    await cheat({ time: .5 }); await adv(.7); s = await st();
    expect(s.mode === 'over' && await page.locator('#bAgain').isVisible(), 'time up ends the run');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/neon-pin-climb')));
    expect(stored === s.best && s.best >= s.score && s.score > 0, 'best persisted (' + stored + ')');

    // 12. restart + pause
    await page.locator('#bAgain').tap(); s = await st(); expect(s.mode === 'play' && s.maxFloor === 0 && s.score === 0 && Math.abs(s.time - 45) < .5 && s.drops === 0, 'PLAY AGAIN resets');
    await page.evaluate(() => window.__gdl.manual(false)); await page.keyboard.press('KeyP'); s = await st(); const tk = s.tick;
    await wait(300); s = await st(); expect(s.paused && s.tick === tk && await page.locator('#bResume').isVisible(), 'P pauses the clock and physics');
    await page.locator('#bResume').tap(); await wait(200); s = await st(); expect(!s.paused && s.tick > tk, 'resume continues');

    // 13. determinism
    const replay = () => page.evaluate(() => { const g = window.__gdl; g.manual(true); g.start(9);
      for (let i = 0; i < 300; i++) { g.flip(0, i % 50 < 9); g.flip(1, (i + 25) % 50 < 9); g.advance(1 / 60); } g.flip(2, false); const s = g.state; return JSON.stringify([s.score, s.time.toFixed(4), s.ball.x.toFixed(3), s.ball.y.toFixed(3)]); });
    const r1 = await replay(), r2 = await replay(); expect(r1 === r2, 'same seed + inputs → identical run ' + r1);
  },
};
