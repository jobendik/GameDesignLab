// Spire: The Climbing Table — menu → PLAY (real tap) → a real pointer hold + pull-down launches, ball save arms → Z/X raise the
// flippers on every tier → 3×120 max-speed shots per tier never tunnel → a fast Stair shot rides the ramp up to the Library and the
// camera climbs with it; a weak one rolls back → the Bell ramp is closed until the 3 books drop, then carries the ball to the Belfry →
// falling off an upper tier drops one level (no ball lost) → gargoyles light EXPRESS, the Stair then goes straight to the Belfry →
// three bell tolls start the Storm multiball (3 balls, all blown down to the Courtyard, camera back down) → a diverted Stair shot is a
// jackpot → swipe-up nudges, quick nudges TILT → all balls drain through the bonus → game over card, best stored → P pauses →
// PLAY AGAIN resets → same seed + same inputs replay identically.
module.exports = {
  game: 'games/pinball-wizard-3d.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 200000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const place = (lv, x, y, vx, vy, i) => page.evaluate(a => { window.__gdl.cheat({ save: 99 }); window.__gdl.place(a[5] || 0, ...a.slice(0, 5)); }, [lv, x, y, vx, vy, i]);
    const cheat = o => page.evaluate(o => window.__gdl.cheat(o), o);
    const until = async (fn, max, step) => { let t; for (let i = 0; i < (max || 80); i++) { t = await st(); if (fn(t)) return t; await adv(step || .05); } return t; };

    // 1. menu → PLAY
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#ovMenu').isVisible(), 'boots to the menu card');
    await page.locator('#bPlay').tap(); await wait(150);
    s = await st(); expect(s.mode === 'play' && s.ball === 1 && s.score === 0 && s.inLane && s.balls.length === 1 && s.balls[0].lv === 0, 'ball 1 waits in the Courtyard shooter lane');
    await page.evaluate(() => window.__gdl.manual(true));

    // 2. real pointer: hold right half + pull down → release launches; ball save arms
    const vp = page.viewportSize();
    await page.mouse.move(vp.width * .75, vp.height * .55); await page.mouse.down(); await adv(.3);
    s = await st(); expect(s.held[1] && s.pull > .2, 'hold flips right and charges the plunger (' + s.pull.toFixed(2) + ')');
    await page.mouse.move(vp.width * .75, vp.height * .55 + 90, { steps: 4 }); s = await st(); expect(s.pull > .45, 'pull-down draws it further');
    await page.mouse.up(); s = await st(); expect(s.balls[0].vy < -1800 && !s.held[1], 'release launches (' + Math.round(s.balls[0].vy) + ')');
    await adv(.5); s = await st(); expect(!s.inLane && s.save > 9, 'ball left the lane, 10 s ball save running');

    // 3. keyboard: Z / X raise the flippers on every tier at once
    await page.keyboard.down('KeyZ'); await page.keyboard.down('KeyX'); await adv(.06); s = await st();
    expect(s.flips.every(t => t.every(f => Math.abs(f.a - f.up) < 1e-6)), 'Z+X raise all six flippers to their stops');
    await page.keyboard.up('KeyZ'); await page.keyboard.up('KeyX'); await adv(.12); s = await st(); expect(s.flips.every(t => t.every(f => Math.abs(f.a - f.rest) < 1e-6)), 'all back at rest');

    // 4. anti-tunnelling on every tier
    const tun = await page.evaluate(() => { const g = window.__gdl, BR = g.geom.BR; let rs = 5, bad = 0, n = 0, worst = 0; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
      g.geom.levels.forEach((L, lv) => { const Wl = L.walls.filter(w => w[6] !== 'drop' && !w[5]);
        for (let k = 0; k < 120; k++) { const a = rnd() * Math.PI * 2, x0 = 70 + rnd() * (L.W - 140), y0 = 120 + rnd() * (L.H - 260);
          if (lv === 0 && y0 > 600 && y0 < 760 && (x0 < 165 || x0 > 325)) continue;       // inside a solid slingshot
          g.cheat({ save: 99 }); g.place(0, lv, x0, y0, Math.cos(a) * 4200, Math.sin(a) * 4200); g.flip(0, rnd() < .5); g.flip(1, rnd() < .5);
          for (let i = 0; i < 30; i++) { g.advance(1 / 120); const b = g.state.balls[0]; if (!b || b.m !== 'table' || b.lv !== lv) break; n++;
            if (b.x < 24 || b.x > L.W - 14) bad++;
            for (const w of Wl) { const dx = w[2] - w[0], dy = w[3] - w[1]; let t = ((b.x - w[0]) * dx + (b.y - w[1]) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t));
              const pen = BR + w[4] - Math.hypot(b.x - w[0] - dx * t, b.y - w[1] - dy * t); if (pen > worst) worst = pen; if (pen > 4) bad++; }
            for (const p of L.posts) if (BR + p[2] - Math.hypot(b.x - p[0], b.y - p[1]) > 4) bad++; } } });
      g.flip(0, false); g.flip(1, false); return { bad, n, worst }; });
    expect(tun.bad === 0 && tun.n > 4000, 'no tunnelling on any tier in ' + tun.n + ' samples (worst overlap ' + tun.worst.toFixed(2) + ')');
    await page.locator('#bPause').tap(); await page.locator('#bQuit').tap(); s = await st(); expect(s.mode === 'play' && s.score === 0 && s.inLane, 'NEW GAME from the pause card');

    // 5. the Stair ramp climbs to the Library and the camera follows; a weak shot rolls back
    await place(0, 172, 540, 0, -2400); s = await until(t => t.balls[0].m === 'path', 20); expect(s.balls[0].path === 'stair', 'captured by the Stair ramp');
    s = await until(t => t.balls[0].m === 'table', 120); expect(s.balls[0].lv === 1 && s.tot.climbs === 1 && s.banner.includes('LIBRARY'), 'arrived in the Library (×2 tier)');
    await adv(.8); s = await st(); expect(s.camY > 170, 'camera climbed with the ball (height ' + Math.round(s.camY) + ')');
    const sc0 = s.score; await place(1, 130, 330, 0, -900); await adv(.3); s = await st(); expect(s.score - sc0 >= 6000, 'Library bumper scores double (' + (s.score - sc0) + ')');
    await place(0, 172, 540, 0, -1300); s = await until(t => t.balls[0].m === 'path', 20); s = await until(t => t.balls[0].m === 'table', 120);
    expect(s.balls[0].lv === 0 && s.balls[0].y > 440 && s.tot.climbs === 1, 'a weak Stair shot rolls back into the Courtyard');

    // 6. the Bell ramp is closed until the books drop; then it reaches the Belfry
    await place(1, 262, 420, 0, -2200); s = await until(t => t.balls[0].m === 'path', 20); expect(s.balls[0].path === 'bell', 'bell ramp entered');
    s = await until(t => t.balls[0].m === 'table', 160); expect(s.balls[0].lv === 1 && s.tot.belfry === 0, 'closed bell ramp sends the ball back to the Library');
    for (const x of [155, 181, 207]) { await place(1, x, 205, 0, -1200); await adv(.25); }
    s = await st(); expect(s.books.every(b => !b) && s.bellLit, 'three books down, bell ramp open');
    await place(1, 262, 420, 0, -2300); s = await until(t => t.balls[0].m === 'table' && t.balls[0].lv === 2, 160); expect(s.balls[0].lv === 2 && s.tot.belfry === 1 && s.books.every(b => b), 'ball rang up to the Belfry (×3); books reset');

    // 7. falling off an upper tier only drops one level
    const n0 = s.balls.length, b0 = s.ball; await place(2, 160, 380, 0, 300); s = await until(t => t.balls[0].m === 'table' && t.balls[0].lv === 1, 120);
    expect(s.balls[0].lv === 1 && s.balls.length === n0 && s.ball === b0, 'Belfry drain drops to the Library');
    await place(1, 180, 540, 0, 300); s = await until(t => t.balls[0].m === 'table' && t.balls[0].lv === 0, 160); expect(s.balls[0].lv === 0 && s.ball === b0, 'Library drain drops to the Courtyard, ball not lost');

    // 8. gargoyles light EXPRESS: the Stair goes straight to the Belfry
    for (const x of [264, 296, 328]) { await place(0, x, 520, 0, -1400); await adv(.2); }
    s = await st(); expect(s.express, 'three gargoyles light EXPRESS');
    await place(0, 172, 540, 0, -2900); s = await until(t => t.balls[0].m === 'table' && t.balls[0].lv !== 0, 200);
    expect(s.balls[0].lv === 2 && !s.express && s.tot.belfry === 2, 'express Stair shot lands in the Belfry');

    // 9. three bell tolls → Storm multiball: 3 balls, all in the Courtyard, camera back down
    s = await st(); const t0 = s.tolls; let n = 0; while (!s.mb && n < 4) { await place(2, 140, 300, 0, -1500); await adv(.5); s = await st(); n++; }
    expect(n === 3 - t0, 'each bell shot tolls (' + t0 + ' earlier, ' + n + ' now)');
    s = await st(); expect(s.mb && s.tot.storms === 1, 'third toll starts the Storm');
    s = await until(t => t.balls.length === 3 && t.balls.every(b => b.lv === 0 && b.m === 'table') && !t.inLane, 200, .1);
    expect(s.balls.length === 3 && s.balls.every(b => b.lv === 0), 'three balls in play in the Courtyard (' + s.balls.length + ')');
    await adv(.8); s = await st(); expect(s.camY < 40, 'camera came back down for the storm (' + Math.round(s.camY) + ')');
    const j0 = s.tot.jackpots; await place(0, 172, 540, 0, -2400); s = await until(t => t.tot.jackpots > j0, 160);
    expect(s.tot.jackpots === j0 + 1 && s.balls[0].lv === 0 && !s.mb.jack.stair, 'diverted Stair shot scores a jackpot and stays in the Courtyard');

    // 10. nudge by swipe-up raises the tilt meter; quick nudges tilt
    await cheat({ save: 0 });
    await page.mouse.move(vp.width * .3, vp.height * .7); await page.mouse.down(); await page.mouse.move(vp.width * .3, vp.height * .7 - 80, { steps: 3 }); await page.mouse.up();
    s = await st(); expect(s.tiltM > .9, 'swipe up nudges (' + s.tiltM.toFixed(2) + ')');
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowUp');
    s = await st(); expect(s.tilted && s.banner.includes('TILT'), 'quick nudges TILT the table');

    // 11. drain everything → bonus → … → game over
    let sawBonus = false, ballsSeen = new Set();
    for (let i = 0; i < 500; i++) { s = await st(); if (s.mode === 'over') break; ballsSeen.add(s.ball); if (s.mode === 'bonus') sawBonus = true;
      if (s.mode === 'play' && s.inLane) await page.evaluate(() => window.__gdl.plunge(.3)); await adv(.5); }
    s = await st(); expect(s.mode === 'over' && sawBonus && ballsSeen.has(3), 'three balls with end-of-ball bonus, then game over');
    await adv(1.5); await wait(80); expect(await page.locator('#ovOver').isVisible(), 'game over card shown');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/pinball-wizard-3d')));
    expect(stored === s.score && s.score > 1000000, 'best persisted (' + stored + ')');

    // 12. restart, pause, determinism
    await page.locator('#bAgain').tap(); await wait(80); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.ball === 1 && s.balls.length === 1 && s.inLane && !s.mb && s.floor === 1 && s.tolls === 0 && !s.express && !s.bellLit && s.books.every(b => b) && !s.tilted, 'clean restart');
    await page.evaluate(() => window.__gdl.manual(false)); await wait(150);
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
    await wait(300); expect((await st()).tick === s.tick, 'no ticks while paused');
    await page.locator('#bResume').tap(); await wait(300); expect(!(await st()).paused && (await st()).tick > s.tick, 'resume');
    const run = () => page.evaluate(() => { const g = window.__gdl; g.manual(true); g.plunge(.55); const out = [];
      for (let i = 0; i < 8; i++) { g.flip(i % 2, true); g.advance(.4); g.flip(i % 2, false); g.advance(.35); const b = g.state.balls[0]; out.push(b ? [b.lv, b.x.toFixed(3), b.y.toFixed(3)] : null); }
      return JSON.stringify([out, g.state.score]); });
    await page.locator('#bPause').tap(); await page.locator('#bQuit').tap(); const a = await run();
    await page.evaluate(() => window.__gdl.manual(false)); await page.keyboard.press('KeyP'); await page.locator('#bQuit').tap(); const b = await run();
    expect(a === b, 'same seed + same inputs → identical path and score');
  },
};
