// Orbit Drift — Slingshot Voyage: menu → LAUNCH (real tap) → the probe orbits → a real tap while the predicted path is a catch slings it
// to the next world (capture scores) → a tap through the gate clears the sector (clear bonus, fuel for a flawless par, next sector loads)
// → keyboard sling → a tap on a "lost" path costs a hull and breaks the streak, the probe respawns on its last world → sectors 2 and 3
// are played out → on the gas giant a second tap in flight burns fuel and breaks free → pause freezes the clock → three bad slings end
// the voyage, the best score is stored → FLY AGAIN restarts cleanly.
module.exports = {
  game: 'games/orbit-drift-sling.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const seek = (want, max) => page.evaluate(([w, m]) => window.__gdl.seek(w, m), [want, max || 8]);
    const tap = () => page.touchscreen.tap(195, 520);
    const until = async (fn, max, msg) => { for (let i = 0; i < (max || 6) * 30; i++) { const s = await st(); if (fn(s)) return s; await adv(1 / 30); } throw new Error('expect failed: timed out waiting for ' + msg); };
    // sling to the next stop on the par route (next world, or the gate from the last world) with a real tap
    const hop = async () => {
      const s = await st(), np = s.bodies.filter(b => b.k === 'p').length, last = s.craft.planet === np - 1;
      expect(s.craft.mode === 'orbit', 'in orbit before a hop');
      expect(await seek(last ? { ev: 'gate' } : { ev: 'capture', target: s.craft.planet + 1 }), 'a release window to ' + (last ? 'the gate' : 'world ' + (s.craft.planet + 1)) + ' comes round (sector ' + (s.sector + 1) + ')');
      await tap();
      return until(q => q.craft.mode !== 'fly', 6, 'the flight to end');
    };

    // 1. menu → LAUNCH
    let s = await st(); expect(s.mode === 'menu', 'boots to the menu');
    await page.locator('#bPlay').tap(); await wait(100); s = await st();
    expect(s.mode === 'play' && s.sector === 0 && s.score === 0 && s.hull === 3 && s.fuel === 0 && s.slings === 0 && s.par === 2, 'voyage starts at sector 1 with 3 hulls and no fuel');
    expect(s.craft.mode === 'orbit' && s.craft.planet === 0 && s.portrait, 'probe starts in orbit round the first world (portrait layout)');
    await page.evaluate(() => window.__gdl.manual(true));          // from here the test steps the simulation, so every run is identical
    const a0 = s.craft.ang; await adv(.25); s = await st(); expect(Math.abs(s.craft.ang - a0) > .3 && s.craft.mode === 'orbit', 'the probe keeps circling until told otherwise');

    // 1b. timing grace: a tap a few frames after the window has closed still takes the shot the player saw
    expect(await seek({ ev: 'capture', target: 1 }), 'first window'); await until(q => !q.pred.good, 2, 'the window to pass'); await adv(3 / 120);
    s = await st(); expect(!s.pred.good && s.pred.grace, 'just past the window: prediction is a miss, but grace applies');
    await tap(); s = await until(q => q.craft.mode !== 'fly', 5, 'graced capture'); expect(s.hull === 3 && ((s.craft.mode === 'orbit' && s.craft.planet === 1) || s.craft.mode === 'warp'), 'late tap was forgiven: it took the catch (or the gate shot) that had just been on screen');
    await page.keyboard.press('KeyP'); await page.keyboard.press('KeyR'); await wait(60); s = await st(); expect(s.mode === 'play' && !s.paused && s.sector === 0 && s.slings === 0 && s.score === 0, 'pause + R restarts the voyage');

    // 2. a tap while the path shows a catch slings to the next world
    expect(await seek({ ev: 'capture', target: 1 }), 'the predicted path comes round to the next world');
    s = await st(); expect(s.pred.good && s.pred.ev === 'capture' && s.pred.target === 1, 'prediction reports the catch');
    await tap(); s = await st();
    expect(s.craft.mode === 'fly' && s.slings === 1 && Math.hypot(s.craft.vx, s.craft.vy) > 380, 'tap releases the probe at sling speed');
    s = await until(q => q.craft.mode !== 'fly', 5, 'capture');
    expect(s.craft.mode === 'orbit' && s.craft.planet === 1 && s.bodies[1].seen && s.score >= 100 && s.hull === 3, 'caught by world 2 exactly as predicted; capture scored ' + s.score);

    // 3. through the gate: sector clear, bonus, fuel for a flawless par, next sector
    const before = s.score; s = await hop();
    expect(s.craft.mode === 'warp' && s.score >= before + 400 && s.streak === 1 && s.fuel === 1, 'gate reached in par: clear bonus (+' + (s.score - before) + '), streak 1, +1 fuel');
    await adv(1.5); s = await st();
    expect(s.sector === 1 && s.slings === 0 && s.par === 3 && s.craft.mode === 'orbit' && s.craft.planet === 0 && s.shardsLeft === 1, 'sector 2 loads with a fresh sling count');

    // 4. keyboard sling
    expect(await seek({ ev: 'capture', target: 1 }), 'window to world 2 of sector 2'); await page.keyboard.press('Space'); s = await st();
    expect(s.craft.mode === 'fly' && s.slings === 1, 'Space slings too'); s = await until(q => q.craft.mode !== 'fly', 5, 'capture');
    expect(s.craft.planet === 1 && s.craft.mode === 'orbit', 'keyboard sling caught');

    // 5. a sling into the void costs a hull, breaks the streak and puts the probe back on its last world
    await adv(.3); expect(await seek({ ev: 'lost', clean: true }), 'a path that leaves the sector, clear of any catch window'); await tap();
    s = await until(q => q.craft.mode === 'dead', 6, 'the probe to be lost'); expect(s.hull === 2 && s.streak === 0 && s.slings === 2, 'lost probe: hull 2, streak reset');
    s = await until(q => q.craft.mode === 'orbit', 2, 'respawn'); expect(s.craft.planet === 1 && s.mode === 'play', 'respawned in orbit round the last world');
    await adv(.3);

    // 6. finish sector 2, play sector 3, arrive at the gas giant
    for (let i = 0; i < 12 && (s = await st()).sector < 3; i++) { if (s.craft.mode === 'orbit') await hop(); else await adv(1.5); }
    s = await st(); expect(s.sector === 3 && s.craft.mode === 'orbit' && s.bodies[0].heavy && s.fuel >= 1, 'sector 4: in orbit round a gas giant with fuel aboard (' + s.fuel + ')');
    const sc3 = s.score; expect(sc3 > 2000, 'three sectors of scoring (' + sc3 + ')');

    // 7. the giant holds on: a plain sling falls back, a burn in flight breaks free
    await adv(.4); await tap(); s = await st(); expect(s.craft.mode === 'fly', 'slung off the giant');
    expect(await seek({ ev: 'capture', target: 1, burn: true }, 6), 'a burn window to the next world appears on the loop');
    s = await st(); const f0 = s.fuel, v0 = Math.hypot(s.craft.vx, s.craft.vy);
    if (s.craft.mode !== 'fly') { await adv(.3); await tap(); expect(await seek({ ev: 'capture', target: 1, burn: true }, 6), 'burn window after falling back'); s = await st(); }
    await tap(); s = await st();
    expect(s.fuel === f0 - 1 && Math.hypot(s.craft.vx, s.craft.vy) > v0 + 150, 'second tap burns one fuel cell for a kick of speed');
    s = await until(q => q.craft.mode !== 'fly', 5, 'capture after the burn'); expect(s.craft.mode === 'orbit' && s.craft.planet === 1, 'the burn carried the probe to the next world');

    // 8. pause freezes the clock (real time), resume continues
    await page.evaluate(() => window.__gdl.manual(false)); await page.keyboard.press('KeyP'); await wait(80);
    s = await st(); expect(s.paused, 'P pauses'); const t0 = s.t; await wait(350); expect((await st()).t === t0, 'nothing moves while paused');
    await page.locator('#bResume').tap(); await wait(350); s = await st(); expect(!s.paused && s.t > t0, 'resume continues the orbit');
    await page.evaluate(() => window.__gdl.manual(true));

    // 9. slings into the void until the hull is gone → game over, best stored
    for (let i = 0; i < 4 && (s = await st()).mode === 'play'; i++) {
      s = await until(q => q.craft.mode === 'orbit' || q.mode !== 'play', 4, 'orbit'); if (s.mode !== 'play') break; await adv(.3);
      expect(await seek({ ev: 'lost', clean: true }), 'a losing path'); await tap(); await until(q => q.craft.mode === 'dead' || q.mode !== 'play', 6, 'loss'); await adv(1);
    }
    s = await st(); expect(s.mode === 'over' && s.hull === 0, 'out of hulls: voyage over');
    const final = s.score; expect(final >= sc3 && s.best === final, 'final score ' + final + ' is the new best');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/orbit-drift-sling'))) === final, 'best persisted for the arcade');
    expect(await page.locator('#over.show').count() === 1 && (await page.locator('#oScore').textContent()) === String(final), 'game-over card shows the score');

    // 10. clean restart
    await wait(200); await page.locator('#bAgain').tap(); await wait(100); s = await st();
    expect(s.mode === 'play' && s.sector === 0 && s.score === 0 && s.hull === 3 && s.fuel === 0 && s.streak === 0 && s.slings === 0 && s.craft.mode === 'orbit' && s.craft.planet === 0 && s.best === final, 'FLY AGAIN: fresh voyage, best kept');
    expect(await page.locator('#over.show').count() === 0, 'card dismissed');
  },
};
