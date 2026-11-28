// Neon Pinball Rush — one-thumb pinball roguelite. Menu → PLAY (real tap) → a real pointer hold raises BOTH flippers (torque model,
// full stroke ≤ 60 ms), Space does the same → a ball dropped on the raised flipper settles in the cradle → 300 random 2600 u/s shots
// with flippers flapping never tunnel into a wall or leave the room → a flipper-tip shot rockets up the room → crystals take damage
// only through ball contact; the air chain multiplies hits made without touching a flipper; gold (armoured) crystals ignore soft
// hits → shattering the last crystal opens the portal, shooting the ball in clears the room → draft of distinct cards, a real tap
// picks one (build updated) and room 2 starts → the Warden boss loses HP to ball hits; its volt orb shorts an idle flipper but a
// flip swats it → draining every heart ends the run (card, best persisted) → P pauses the real-time loop → PLAY AGAIN resets →
// the same seed + same inputs replay identically.
module.exports = {
  game: 'games/neon-pinball-rush.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 120000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const place = (x, y, vx, vy) => page.evaluate(a => window.__gdl.place(0, ...a), [x, y, vx, vy]);
    const cheat = o => page.evaluate(o => window.__gdl.cheat(o), o);

    // 1. menu → PLAY
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#bPlay').isVisible(), 'boots to the menu card');
    await page.locator('#bPlay').tap(); await page.evaluate(() => window.__gdl.manual(true));
    s = await st(); expect(s.mode === 'play' && s.room === 1 && s.hearts === 3 && s.score === 0 && s.alive > 5, 'run starts in room 1 with 3 hearts (' + s.alive + ' crystals)');
    await adv(.6); s = await st(); expect(s.balls.length === 1, 'a ball drops into the room'); await cheat({ save: 999 });

    // 2. real pointer hold → both flippers, torque stroke
    const vp = page.viewportSize();
    await page.mouse.move(vp.width * .5, vp.height * .6); await page.mouse.down(); await adv(.025); s = await st();
    expect(s.flips.every(f => f.held) && s.flips[0].a < s.flips[0].rest - .2 && s.flips[0].a > s.flips[0].up && Math.abs(s.flips[0].w) > 10, 'hold raises both flippers mid-stroke (ω ' + s.flips[0].w.toFixed(1) + ')');
    await adv(.035); s = await st(); expect(s.flips.every(f => Math.abs(f.a - f.up) < 1e-6), 'full stroke within 60 ms');
    await page.mouse.up(); await adv(.15); s = await st(); expect(s.flips.every(f => !f.held && Math.abs(f.a - f.rest) < 1e-6), 'release returns both to rest');
    await page.keyboard.down('Space'); await adv(.07); s = await st(); expect(s.flips.every(f => f.held && Math.abs(f.a - f.up) < 1e-6), 'Space raises both flippers');
    await page.keyboard.up('Space'); await adv(.15);

    // 3. cradle
    await page.evaluate(() => window.__gdl.flip(true)); await adv(.1); await place(170, 560, 0, 0); await adv(2.5); s = await st();
    const cb = s.balls[0]; expect(Math.hypot(cb.vx, cb.vy) < 20 && Math.hypot(cb.x - 120, cb.y - 636) < 35, 'ball cradles at the left flipper base (' + Math.round(cb.x) + ',' + Math.round(cb.y) + ')');
    await page.evaluate(() => window.__gdl.flip(false)); await adv(.4); s = await st(); expect(s.balls[0].x > cb.x + 8, 'released flipper lets it roll down toward the tip');

    // 4. anti-tunnelling
    const tun = await page.evaluate(() => { const g = window.__gdl, W = g.geom.walls; let rs = 11, bad = 0, n = 0, worst = 0;
      const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
      for (let k = 0; k < 300; k++) { const a = rnd() * Math.PI * 2; g.cheat({ save: 999 }); g.place(0, 40 + rnd() * 320, 130 + rnd() * 420, Math.cos(a) * 2600, Math.sin(a) * 2600); g.flip(rnd() < .5);
        for (let i = 0; i < 40; i++) { g.advance(1 / 120); const b = g.state.balls[0]; if (!b || b.ph !== 'play') break; n++;
          if (b.x < 16 || b.x > 384 || b.y < 88) bad++;
          for (const w of W) { const dx = w[2] - w[0], dy = w[3] - w[1]; let t = ((b.x - w[0]) * dx + (b.y - w[1]) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t));
            const pen = 9 + w[4] - Math.hypot(b.x - w[0] - dx * t, b.y - w[1] - dy * t); if (pen > worst) worst = pen; if (pen > 3) bad++; } } }
      g.flip(false); return { bad, n, worst }; });
    expect(tun.n > 8000 && tun.bad === 0, `no tunnelling in ${tun.n} samples (worst overlap ${tun.worst.toFixed(2)})`);

    // 5. a real flipper-tip shot
    await cheat({ room: 1 }); await cheat({ save: 999, clearPending: true }); await page.evaluate(() => window.__gdl.spawn()); await adv(.2);
    s = await st(); const f0 = s.flips[0], u = .85 * f0.len;
    await place(f0.px + Math.cos(f0.rest) * u + Math.sin(f0.rest) * 15, f0.py + Math.sin(f0.rest) * u - Math.cos(f0.rest) * 15, 0, 0);
    await page.evaluate(() => window.__gdl.flip(true)); await adv(.06); s = await st(); const shot = s.balls[0];
    expect(shot.vy < -1200, 'flipper tip fires the ball upward (' + Math.round(shot.vx) + ',' + Math.round(shot.vy) + ')');
    await page.evaluate(() => window.__gdl.flip(false));

    // 6. crystal damage, air chain, armour — all through ball contact
    await cheat({ room: 2 }); await cheat({ save: 999, clearPending: true, hp: 2 }); await page.evaluate(() => window.__gdl.spawn()); await adv(.1);
    s = await st(); const cs = s.crystals.filter(c => c.hp > 0 && c.t === 'g').sort((a, b) => b.y - a.y); const c0 = cs[0], sc0 = s.score, br0 = s.broken;
    await place(c0.x, c0.y + 40, 0, -1000); await adv(.05); s = await st();
    const hit = s.crystals.find(c => Math.abs(c.x - c0.x) < 1 && Math.abs(c.y - c0.y) < 1);
    expect(hit.hp === 1 && s.score > sc0 && s.balls[0].vy > 0, 'ball contact chips the crystal to 1 HP and bounces (' + s.score + ')'); await adv(.05);
    await place(c0.x, c0.y + 40, 0, -1000); await adv(.05); s = await st(); const broken1 = s.broken, chain1 = s.balls[0].chain;
    expect(s.crystals.find(c => Math.abs(c.x - c0.x) < 1 && Math.abs(c.y - c0.y) < 1).hp === 0 && broken1 === br0 + 1 && chain1 >= 2, 'second hit shatters it; air chain ' + chain1);
    const c1 = cs[1]; await place(c1.x, c1.y + 40, 0, -1000); await adv(.05); s = await st();
    expect(s.balls[0].chain >= 3 && s.chainBest >= 3, 'hits without touching a flipper keep building the air chain (' + s.balls[0].chain + ')');
    await cheat({ hp: 3, arm: true }); s = await st(); const ac = s.crystals.find(c => c.hp > 0 && c.t === 'g');
    await place(ac.x, ac.y + 34, 0, -300); await adv(.05); s = await st(); let ah = s.crystals.find(c => c.x === ac.x && c.y === ac.y);
    expect(ah.hp === 3, 'a soft hit glances off a gold armoured crystal'); await adv(.1);
    await place(ac.x, ac.y + 40, 0, -1100); await adv(.05); s = await st(); ah = s.crystals.find(c => c.x === ac.x && c.y === ac.y);
    expect(ah.hp === 2, 'a hard hit cracks it');

    // 7. clear the room → portal → draft
    await cheat({ hp: 1 });
    for (let k = 0; k < 30; k++) { s = await st(); const c = s.crystals.find(c => c.hp > 0); if (!c) break; await place(c.x, c.y + 32, 0, -900); await adv(.06); }
    await adv(.2); s = await st(); expect(s.alive === 0 && s.portal, 'every crystal shattered → portal open');
    const before = s.score; await place(200, 190, 0, -500); await adv(.5); s = await st();
    expect(s.mode === 'clear' && s.score > before, 'ball shot into the portal clears the room (+' + (s.score - before) + ')');
    await adv(1.2); s = await st(); expect(s.mode === 'draft' && s.draft.length === 3 && new Set(s.draft).size === 3 && await page.locator('.pick').count() === 3, 'draft of 3 distinct cards: ' + s.draft.join(','));
    const draft = s.draft; await page.locator('#bReroll').tap(); s = await st(); expect(s.rerolls === 0 && s.draft.length === 3, 'reroll spends the token');
    const chosen = s.draft[1]; await page.locator('.pick').nth(1).tap(); s = await st();
    expect(s.mode === 'play' && s.room === 3 && s.build[chosen] === 1 && !(await page.locator('#ov').isVisible()), 'tapping a card adds ' + chosen + ' and starts room 3');

    // 8. Warden boss: ball damage, orb short + swat, kill → portal
    await cheat({ room: 5 }); await cheat({ save: 999, clearPending: true }); await page.evaluate(() => window.__gdl.spawn()); await adv(.1);
    s = await st(); expect(s.boss && s.boss.hp === s.boss.max, 'room 5 is the Warden (' + s.boss.max + ' HP)');
    const hp0 = s.boss.hp; let hitB = false;
    for (let k = 0; k < 12 && !hitB; k++) { s = await st(); await place(s.boss.x, s.boss.y + 34, 0, -900); await adv(.04); s = await st(); hitB = s.boss.hp < hp0; await adv(.12); }
    expect(hitB, 'ball strike through the shield gap damages the Warden (' + s.boss.hp + '/' + s.boss.max + ')');
    await place(30, 200, 0, 0); await page.evaluate(() => window.__gdl.flip(false));
    await cheat({ orbT: 0 }); await adv(.02); s = await st(); expect(s.orbs.length === 1, 'the Warden drops a volt orb');
    for (let k = 0; k < 80; k++) { await place(30, 200, 0, 0); await adv(.1); s = await st(); if (!s.orbs.length) break; }
    expect(s.flips.some(f => f.short > 0), 'an orb landing on an idle flipper shorts it');
    const sh = s.flips.findIndex(f => f.short > 0); await page.evaluate(() => window.__gdl.flip(true)); await adv(.07); s = await st();
    expect(Math.abs(s.flips[sh].a - s.flips[sh].rest) < 1e-6 && Math.abs(s.flips[1 - sh].a - s.flips[1 - sh].up) < 1e-6, 'a shorted flipper ignores the flip');
    await page.evaluate(() => window.__gdl.flip(false)); await adv(1.3);
    await cheat({ orbT: 0 }); await adv(.02); const sw0 = (await st()).swats;
    for (let k = 0; k < 80; k++) { await place(30, 200, 0, 0); await adv(.1); s = await st(); if (s.orbs.length && s.orbs[0].y > 540) { await page.evaluate(() => window.__gdl.flip(true)); } if (!s.orbs.length) break; }
    await page.evaluate(() => window.__gdl.flip(false)); s = await st();
    expect(s.swats > sw0 && s.flips.every(f => f.short === 0), 'a raised flipper swats the orb instead ' + JSON.stringify([sw0, s.swats, s.flips.map(f => f.short), s.orbs]));
    await cheat({ bossHp: 1 });
    for (let k = 0; k < 12 && s.boss.hp > 0; k++) { s = await st(); await place(s.boss.x, s.boss.y + 34, 0, -900); await adv(.04); s = await st(); await adv(.12); }
    await adv(.2); s = await st(); expect(s.boss.hp === 0 && s.portal, 'Warden broken → portal opens');

    // 9. drain every heart → game over
    await cheat({ room: 6 }); await cheat({ save: 0, clearPending: true, hearts: 3 }); await page.evaluate(() => window.__gdl.spawn()); let lostOk = true;
    for (let h = 3; h > 0; h--) {
      for (let k = 0; k < 20 && (await st()).balls.length === 0; k++) await adv(.1);
      await cheat({ save: 0 }); await place(200, 690, 0, 400); await adv(.3); s = await st();
      if (s.hearts !== h - 1) lostOk = false;
    }
    s = await st(); expect(lostOk && s.mode === 'over' && await page.locator('#bAgain').isVisible(), 'three drains end the run');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/neon-pinball-rush')));
    expect(stored === s.best && s.best >= s.score && s.score > 0, 'best persisted (' + stored + ')');

    // 10. restart, pause in real time
    await page.locator('#bAgain').tap(); s = await st();
    expect(s.mode === 'play' && s.room === 1 && s.hearts === 3 && s.score === 0 && Object.keys(s.build).length === 0, 'PLAY AGAIN resets the run');
    await page.evaluate(() => window.__gdl.manual(false)); await page.keyboard.press('KeyP'); s = await st(); const t0 = s.tick;
    await wait(300); s = await st(); expect(s.paused && s.tick === t0 && await page.locator('#bResume').isVisible(), 'P pauses the simulation');
    await page.locator('#bResume').tap(); await wait(200); s = await st(); expect(!s.paused && s.tick > t0, 'resume continues');

    // 11. determinism
    const replay = () => page.evaluate(() => { const g = window.__gdl; g.manual(true); g.start(5); g.cheat({ save: 999 });
      for (let i = 0; i < 240; i++) { g.flip(i % 40 < 8); g.advance(1 / 60); } g.flip(false); const s = g.state; return JSON.stringify([s.score, s.alive, s.balls.map(b => [b.x.toFixed(3), b.y.toFixed(3)])]); });
    const r1 = await replay(), r2 = await replay(); expect(r1 === r2, 'same seed + inputs → identical run ' + r1.slice(0, 60));
  },
};
