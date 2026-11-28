// Arcanum: The Spellbound Table — menu → PLAY (real tap) → a real pointer hold + pull-down charges the plunger, release launches,
// ball save arms → torque-driven flippers reach full stroke in ~45 ms, Z/X keys drive them → live catch: a ball dropped on a raised
// flipper settles in the cradle → 220 shots at 4200 u/s with flippers flapping never tunnel into a wall or leave the cabinet →
// a fast right-ramp shot rides the wireform and returns to the inlane, a weak one rolls back out → left orbit loop scores →
// the 3 rune drops open the Eye, the Eye casts EMBER, three ramps master it → standing runes light the lock, three ramp locks
// start Ritual multiball (3 balls) and a ramp scores a jackpot → a flipper bot plays real ball time and scores through physics only →
// swipe-up nudges raise the tilt meter, four quick ones TILT (dead flippers, no bonus) → balls drain → end-of-ball bonus → game over
// card, best stored → P pauses (no ticks) → PLAY AGAIN resets → same seed + same inputs replays identically.
module.exports = {
  game: 'games/arcanum-pinball.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 170000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const place = (x, y, vx, vy) => page.evaluate(a => { window.__gdl.cheat({ save: 99 }); window.__gdl.place(0, ...a); }, [x, y, vx, vy]);   // ball save held on while shots are staged
    const cheat = o => page.evaluate(o => window.__gdl.cheat(o), o);

    // 1. menu → PLAY
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#ovMenu').isVisible(), 'boots to the menu card');
    await page.locator('#bPlay').tap(); await wait(100);
    s = await st(); expect(s.mode === 'play' && s.ball === 1 && s.score === 0 && s.inLane && s.balls.length === 1, 'game starts with ball 1 in the shooter lane');
    expect(!(await page.locator('#ovMenu').isVisible()), 'menu closed');
    await page.evaluate(() => window.__gdl.manual(true));

    // 2. real pointer: hold on the right half and pull down → plunger charges; release → launch; ball save arms once it leaves the lane
    const vp = page.viewportSize();
    await page.mouse.move(vp.width * .75, vp.height * .55); await page.mouse.down(); await adv(.3);
    s = await st(); expect(s.flips[1].held && s.pull > .2, 'pointer hold flips the right flipper and charges the plunger (' + s.pull.toFixed(2) + ')');
    await page.mouse.move(vp.width * .75, vp.height * .55 + 90, { steps: 4 }); s = await st(); expect(s.pull > .45, 'pulling down draws the plunger further (' + s.pull.toFixed(2) + ')');
    await page.mouse.up(); s = await st(); expect(s.balls[0].vy < -1800 && !s.flips[1].held, 'release launches the ball (' + Math.round(s.balls[0].vy) + ' u/s)');
    await adv(.5); s = await st(); expect(!s.inLane && s.save > 9, 'ball left the lane and the 10 s ball save is running');

    // 3. flipper torque: full stroke in ~45 ms, keyboard Z / X
    await cheat({ save: 99 });
    await page.keyboard.down('KeyZ'); await adv(.025); s = await st(); const mid = s.flips[0];
    expect(mid.a < mid.rest - .2 && mid.a > mid.up + .05 && Math.abs(mid.w) > 15, 'Z: flipper accelerates through its stroke (ω ' + mid.w.toFixed(1) + ' rad/s)');
    await adv(.03); s = await st(); expect(Math.abs(s.flips[0].a - s.flips[0].up) < 1e-6 && s.flips[0].held, 'flipper reaches the stop and holds');
    await page.keyboard.up('KeyZ'); await adv(.12); s = await st(); expect(Math.abs(s.flips[0].a - s.flips[0].rest) < 1e-6, 'returns to rest');
    await page.keyboard.down('KeyX'); await adv(.06); s = await st(); expect(Math.abs(s.flips[1].a - s.flips[1].up) < 1e-6, 'X raises the right flipper'); await page.keyboard.up('KeyX');

    // 4. live catch: ball dropped on the raised left flipper rolls into the cradle and stays
    await page.evaluate(() => window.__gdl.flip(0, true)); await adv(.1);
    await place(215, 700, 0, 300); await adv(2.5); s = await st();
    const b0 = s.balls[0], f0 = (await page.evaluate(() => window.__gdl.geom.flips[0]));
    expect(Math.hypot(b0.vx, b0.vy) < 25 && Math.hypot(b0.x - f0.px, b0.y - f0.py) < 45, 'cradled at the flipper base (' + Math.round(b0.x) + ',' + Math.round(b0.y) + ')');
    await page.evaluate(() => window.__gdl.flip(0, false)); await adv(.6); s = await st(); expect(s.balls[0].x > b0.x + 10 || s.balls[0].y > b0.y + 10, 'releasing lets it roll down the flipper');

    // 5. anti-tunnelling: 220 shots at max speed with flippers flapping; no penetration into any wall, never outside the cabinet
    const tun = await page.evaluate(() => { const g = window.__gdl, W = g.geom.walls.filter(w => w[6] !== 'drop'), P = g.geom.posts, BR = g.geom.BR; let rs = 11, bad = 0, n = 0, worst = 0;
      const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
      for (let k = 0; k < 220; k++) { const a = rnd() * Math.PI * 2; g.cheat({ save: 99 }); const x0 = 90 + rnd() * 320, y0 = 180 + rnd() * 600;
        if (y0 > 620 && y0 < 760 && (x0 < 165 || x0 > 335)) continue;    // never spawn inside a solid slingshot body
        g.place(0, x0, y0, Math.cos(a) * 4200, Math.sin(a) * 4200); g.flip(0, rnd() < .5); g.flip(1, rnd() < .5);
        for (let i = 0; i < 40; i++) { g.advance(1 / 120); const b = g.state.balls[0]; if (!b || b.m !== 'table') break; n++;
          if (b.x < 18 || b.x > 514 || (b.y < 266 && Math.hypot(b.x - 266, b.y - 266) > 248)) bad++;
          for (const w of W) { const dx = w[2] - w[0], dy = w[3] - w[1]; let t = ((b.x - w[0]) * dx + (b.y - w[1]) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t));
            const d = Math.hypot(b.x - w[0] - dx * t, b.y - w[1] - dy * t), pen = BR + w[4] - d; if (pen > worst && !w[5]) worst = pen; if (pen > 4 && !w[5]) bad++; }
          for (const p of P) { const pen = BR + p[2] - Math.hypot(b.x - p[0], b.y - p[1]); if (pen > 4) bad++; } } }
      g.flip(0, false); g.flip(1, false); return { bad, n, worst }; });
    expect(tun.bad === 0 && tun.n > 3000, 'no tunnelling in ' + tun.n + ' samples (worst overlap ' + tun.worst.toFixed(2) + ')');
    // the stress shots knocked things around: start a fresh game from the pause card
    await page.locator('#bPause').tap(); expect(await page.locator('#ovPause').isVisible(), 'pause card'); await page.locator('#bQuit').tap();
    s = await st(); expect(s.mode === 'play' && s.score === 0 && s.inLane, 'NEW GAME from the pause card'); await cheat({ save: 99 });
    const until = async (fn, max) => { for (let i = 0; i < (max || 60); i++) { const t = await st(); if (fn(t)) return t; await adv(.05); } return st(); };

    // 6. ramps: a fast shot rides the right ramp back to the right inlane; a weak one rolls back out
    s = await st(); const r0 = s.tot.ramps;
    await place(370, 520, 0, -2500); await adv(.15); s = await st(); expect(s.balls[0].m === 'ramp' && s.balls[0].ramp === 'rr', 'ball captured by the right ramp');
    s = await until(t => t.tot.ramps > r0); expect(s.tot.ramps === r0 + 1 && s.balls[0].m === 'table' && s.balls[0].x > 400 && s.balls[0].y > 570 && s.balls[0].vy > 0, 'ramp made, ball dropped into the right inlane');
    await place(130, 520, 0, -850); await adv(1.6); s = await st(); expect(s.tot.ramps === r0 + 1 && s.balls[0].y > 440, 'a weak shot does not make the left ramp and rolls back out');
    // orbit loop
    await place(40, 600, -20, -2700); await adv(1.2); s = await st(); expect(s.tot.orbits === 1, 'left orbit shot goes around the top and scores');

    // 7. drop bank → the Eye → spell EMBER → three ramps master it
    for (const x of [222, 250, 278]) { await place(x, 540, 0, -1500); await adv(.25); }
    s = await st(); expect(s.drops.every(d => !d) && s.eyeOpen, 'all three rune drops down, the Eye is open');
    await place(250, 470, 0, -900); await adv(.4); s = await st(); expect(s.spell && s.spell.name === 'EMBER' && s.balls[0].m === 'held', 'the Eye catches the ball and casts EMBER');
    await adv(2.4); s = await st(); expect(s.balls[0].m === 'table' && s.spell.t > 25, 'kicked back out, spell timer running');
    for (const x of [370, 130, 370]) { await place(x, 520, 0, -2600); await adv(1.8); }
    s = await st(); expect(s.spellsDone === 1 && s.played === 1 && !s.spell, 'three ramps mastered EMBER (' + s.dmd + ')');
    await adv(1.2); s = await st(); expect(s.drops.every(d => d) && !s.eyeOpen, 'drops reset after the kickout');

    // 8. standing runes → lock lit → three locks → Ritual multiball → jackpot
    for (let l = 0; l < 3; l++) {
      for (const [x, y] of [[137, 358], [165, 336], [194, 314]]) { await place(x, y, -915, -1185); await adv(.2); }
      s = await st(); expect(s.lockLit, 'the three standing runes light the lock (' + l + ')');
      await place(130, 520, 0, -2600); s = await until(t => t.locks > l || t.mb); if (l < 2) await adv(.5);
    }
    expect(s.mb && s.balls.length === 3 && s.tot.mbs === 1, 'third lock starts Ritual multiball with 3 balls (' + s.balls.length + ')');
    const j0 = s.tot.jackpots; await place(370, 520, 0, -2600); s = await until(t => t.tot.jackpots > j0); expect(s.tot.jackpots === j0 + 1 && !s.mb.jack.rr, 'right ramp scores a jackpot');

    // 9. a flipper bot plays: score rises from real flips, ball time passes
    await cheat({ save: 0 }); s = await st(); const sc0 = s.score;
    const bot = await page.evaluate(() => { const g = window.__gdl, F = g.geom.flips, hold = [0, 0]; let flips = 0;
      for (let i = 0; i < 120 * 12; i++) { const s = g.state; if (s.mode !== 'play') break;
        for (let k = 0; k < 2; k++) { if (hold[k] > 0) { hold[k] -= 1 / 120; if (hold[k] <= 0) g.flip(k, false); continue; }
          if (s.balls.some(b => b.m === 'table' && Math.abs(b.x - F[k].px - (k ? -35 : 35)) < 45 && b.y > 760 && b.y < 840 && b.vy > -100)) { g.flip(k, true); hold[k] = .15; flips++; } }
        g.advance(1 / 120); }
      return { flips, s: g.state }; });
    expect(bot.flips > 5 && bot.s.score > sc0, 'bot flips (' + bot.flips + ') score points (' + (bot.s.score - sc0) + ')');

    // 10. nudge by swipe-up (real pointer) raises the tilt meter; four quick nudges tilt
    s = await st(); if (s.mode === 'play' && !s.tilted) {
      const swipe = async () => { await page.mouse.move(vp.width * .3, vp.height * .7); await page.mouse.down(); await page.mouse.move(vp.width * .3, vp.height * .7 - 80, { steps: 3 }); await page.mouse.up(); };
      await swipe(); s = await st(); expect(s.tiltM > .9, 'swipe up nudges (tilt meter ' + s.tiltM.toFixed(2) + ')');
      expect(!(await page.locator('#bNudge').isVisible()), 'portrait uses swipe-up, no NUDGE button over the table');
      for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowUp');
      s = await st(); expect(s.tilted && s.dmd.includes('T I L T'), 'repeated nudges TILT the table');
      await page.evaluate(() => window.__gdl.flip(0, true)); await adv(.1); s = await st(); expect(Math.abs(s.flips[0].a - s.flips[0].rest) < 1e-6, 'flippers are dead while tilted'); await page.evaluate(() => window.__gdl.flip(0, false));
    }

    // 11. let every ball drain → bonus → next ball … → game over, best stored
    let sawBonus = false, sawTiltBonus = false, ballsSeen = new Set();
    for (let i = 0; i < 400; i++) { s = await st(); if (s.mode === 'over') break; ballsSeen.add(s.ball);
      if (s.mode === 'bonus') { sawBonus = true; if (s.bonus && s.bonus.total === 0 && s.tilted) sawTiltBonus = true; }
      if (s.mode === 'play' && s.inLane) await page.evaluate(() => window.__gdl.plunge(.3));
      await adv(.5); }
    s = await st(); expect(s.mode === 'over' && sawBonus && ballsSeen.has(3), 'three balls played with end-of-ball bonus, game over');
    await wait(50); await adv(1.6); await wait(60);
    expect(await page.locator('#ovOver').isVisible(), 'game over card shown');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/arcanum-pinball')));
    expect(stored === s.score && s.best === s.score && s.score > 1000000, 'best score persisted (' + stored + ')');

    // 12. PLAY AGAIN resets; pause freezes; determinism
    await page.locator('#bAgain').tap(); await wait(80); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.ball === 1 && s.balls.length === 1 && s.inLane && s.locks === 0 && s.spellsDone === 0 && !s.mb && s.bonusX === 1 && !s.tilted && s.drops.every(d => d), 'clean restart');
    expect(!(await page.locator('#ovOver').isVisible()), 'card gone');
    await page.evaluate(() => window.__gdl.manual(false)); await wait(100);
    await page.keyboard.press('KeyP'); await wait(50); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
    await wait(300); expect((await st()).tick === s.tick, 'no ticks while paused');
    await page.locator('#bResume').tap(); await wait(200); expect(!(await st()).paused && (await st()).tick > s.tick, 'resume');
    const run = () => page.evaluate(() => { const g = window.__gdl; g.manual(true); g.plunge(.55); const out = [];
      for (let i = 0; i < 8; i++) { g.flip(i % 2, true); g.advance(.4); g.flip(i % 2, false); g.advance(.35); const b = g.state.balls[0]; out.push(b ? [b.x.toFixed(3), b.y.toFixed(3)] : null); }
      return JSON.stringify([out, g.state.score]); });
    await page.locator('#bPause').tap(); await page.locator('#bQuit').tap(); await wait(50); const a = await run();
    await page.evaluate(() => window.__gdl.manual(false)); await page.keyboard.press('KeyP'); await page.locator('#bQuit').tap(); await wait(50); const b = await run();
    expect(a === b, 'same seed + same inputs → identical ball path and score');
  },
};
