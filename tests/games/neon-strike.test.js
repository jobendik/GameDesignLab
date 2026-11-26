// Static Bloom (games/neon-strike.html): menu → pointer-lock play → real mouse fire kills constructs through the genuine
// hitscan/damage path → shards, flow multiplier, pickups, nova, dash i-frames → pause/auto-pause → death → best saved → clean restart.
// A second (touch) context checks the twin-stick scheme: left stick moves, right drag aims, auto-fire engages on target.
module.exports = {
  game: 'games/neon-strike.html', query: '?seed=7&mute=1', mobile: false, timeout: 170000,
  async run({ page, expect, wait, url }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    // ---- menu → start with a real click (requests pointer lock)
    expect((await st()).mode === 'menu', 'boots to the menu');
    expect(await page.title() === 'Static Bloom', 'original title');
    await page.click('#bStart'); await wait(300);
    await page.evaluate(() => window.__gdl.manual(true)); // the test steps the simulation itself (deterministic); real-time stepping is checked in the pause section
    let s = await st(); expect(s.mode === 'playing' && s.hp === 100 && s.score === 0 && s.ammo === 32, 'clean run after start');
    // ---- keyboard movement is real and dt-based
    const z0 = s.z; await page.keyboard.down('KeyW'); await adv(0.6); await page.keyboard.up('KeyW');
    s = await st(); expect(s.z < z0 - 3, 'W moves the player forward (' + (z0 - s.z).toFixed(2) + 'm)');
    await page.keyboard.press('Space'); await adv(0.2); expect((await st()).y > 0.5, 'Space jumps');
    await adv(1.2); expect((await st()).y === 0, 'gravity lands the player');
    const x0 = (await st()).x; await page.keyboard.down('KeyD'); await page.keyboard.press('ShiftLeft'); await adv(0.2); await page.keyboard.up('KeyD');
    expect((await st()).x > x0 + 3, 'Shift dashes along the move direction');
    // ---- wave 1 arrives
    await adv(4.5); s = await st(); expect(s.wave === 1 && s.enemies > 0, 'wave 1 spawns constructs (' + s.enemies + ')');
    // ---- real mouse button fires; aim comes from the test hook, damage from the game's own ray test
    await page.mouse.move(640, 400); await page.mouse.down();
    await page.evaluate(() => { const g = window.__gdl; for (let i = 0; i < 4; i++) { g.aimAt(0); g.advance(0.1); } });
    s = await st(); expect(s.shots > 0 && s.ammo < 32, 'holding the mouse button fires (' + s.shots + ' shots)'); expect(s.hits > 0, 'shots on target register hits');
    await page.evaluate(() => { const g = window.__gdl; let n = 0; while (g.state.kills < 1 && n++ < 80) { g.aimAt(0); g.advance(0.1); } });
    s = await st(); expect(s.kills >= 1 && s.score > 0, 'killing a construct scores (' + s.score + ')');
    // clear the wave: flow multiplier climbs with a kill chain, shards are collected by proximity
    await page.evaluate(() => { const g = window.__gdl; let n = 0; while (g.state.wave < 2 && g.state.mode === 'playing' && n++ < 900) { if (g.state.enemies) g.aimAt(0); g.advance(0.1); } });
    await page.mouse.up();
    s = await st(); expect(s.wave === 2 && s.mode === 'playing', 'clearing every construct starts wave 2'); expect(s.kills >= 5, 'most of wave 1 was shot down (' + s.kills + ')'); expect(s.score >= 1000, 'score reflects kills + flow + clear bonus (' + s.score + ')');
    // ---- crit (core) hits do double damage
    const crit = await page.evaluate(() => { const g = window.__gdl; g.teleport(0, 16); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' })); g.advance(1.3); const i = g.spawn('lancer', 0, 6); g.advance(0.3); g.aimAt(i, true); return { i, hp: g.enemies()[i].hp }; });
    await page.mouse.down(); await adv(0.02); await page.mouse.up();
    const lan = (await page.evaluate(() => window.__gdl.enemies()))[crit.i];
    expect(lan && lan.type === 'lancer' && Math.abs(crit.hp - lan.hp - 40) < 0.5, 'one core hit deals double damage (' + (lan ? (crit.hp - lan.hp).toFixed(1) : 'none') + ')');
    // ---- nova: right mouse launches an explosive that damages a group
    await page.evaluate(() => { const g = window.__gdl; g.give('nova'); g.teleport(0, 20); for (let i = 0; i < 3; i++) g.spawn('drifter', i - 1, 7); g.advance(0.05); g.aimAt(g.enemies().length - 2); });
    const k0 = (await st()).kills; await page.mouse.click(640, 400, { button: 'right' }); await adv(0.8);
    s = await st(); expect(s.nova === 2, 'right click spends a nova charge'); expect(s.kills >= k0 + 2, 'the nova blast kills grouped constructs (' + (s.kills - k0) + ')');
    // ---- pickups: walking onto a pad collects it
    const pk = await page.evaluate(() => { const g = window.__gdl; let n = 0; while (!g.state.pickups.length && n++ < 300) { if (g.state.enemies) g.aimAt(0); g.advance(0.1); } return g.state.pickups[0]; });
    expect(pk, 'a pickup spawns on a pad');
    const sc0 = (await st()).score; await page.evaluate(p => { window.__gdl.teleport(p.x, p.z); window.__gdl.advance(0.1); }, pk);
    s = await st(); expect(!s.pickups.some(p => p.x === pk.x && p.z === pk.z) && s.score >= sc0 + 50, 'pickup collected by walking over it (' + pk.kind + ')');
    // ---- pause: P key, then auto-pause when the tab is hidden; time does not advance while paused
    await page.evaluate(() => window.__gdl.manual(false)); const tr = (await st()).time; await wait(500); expect((await st()).time > tr, 'the real-time loop advances the simulation');
    await page.keyboard.press('KeyP'); await wait(150); s = await st(); expect(s.mode === 'paused', 'P pauses');
    const t0 = s.time; await wait(400); expect((await st()).time === t0, 'simulation frozen while paused');
    expect(await page.isVisible('#pause'), 'pause panel visible');
    await page.click('#bResume'); await wait(150); expect((await st()).mode === 'playing', 'Resume button resumes');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await wait(100); expect((await st()).mode === 'paused', 'auto-pause when the tab is hidden');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.keyboard.press('KeyP'); await wait(150); expect((await st()).mode === 'playing', 'P resumes'); await page.evaluate(() => window.__gdl.manual(true));
    // ---- resize mid-game is safe
    await page.setViewportSize({ width: 700, height: 500 }); await wait(200); await page.setViewportSize({ width: 1280, height: 800 }); await wait(200);
    const cv = await page.evaluate(() => { const c = document.getElementById('view'); return { w: c.clientWidth, h: c.clientHeight }; }); expect(cv.w === 1280 && cv.h === 800, 'canvas follows the viewport');
    // ---- enemies genuinely hurt and kill a passive player; best score persists
    await page.evaluate(() => { const g = window.__gdl; g.teleport(0, 16); for (let i = 0; i < 8; i++) g.spawn('drifter', i - 4, 8); g.spawn('lancer', 6, 2); });
    const hpB = (await st()).hp; await adv(4); expect((await st()).hp < hpB, 'constructs damage a player who stands still');
    await page.evaluate(() => { const g = window.__gdl; let n = 0; while (g.state.mode === 'playing' && n++ < 400) g.advance(0.5); g.advance(4); });
    s = await st(); expect(s.mode === 'over' && s.hp === 0, 'integrity 0 ends the run');
    expect(s.best === s.score && s.best > 0, 'best score recorded');
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('gdl:best:games/neon-strike'))) === s.best, 'best persisted under gdl:best:games/neon-strike');
    expect(await page.isVisible('#over') && (await page.textContent('#oScore')).replace(/,/g, '') === String(s.score), 'game-over panel shows the score');
    // ---- clean restart
    await wait(700); await page.keyboard.press('Enter'); await wait(250);
    await page.evaluate(() => window.__gdl.manual(true)); const r = await st(); expect(r.mode === 'playing' && r.score === 0 && r.hp === 100 && r.wave === 0 && r.kills === 0 && r.enemies === 0 && r.shards === 0 && r.ammo === 32 && r.pickups.length === 0, 'restart gives a clean run');
    expect(r.best === s.best, 'best survives the restart');
    await adv(5); expect((await st()).wave === 1, 'waves start again after restart');

    // ---- touch: twin-stick scheme in a phone-sized context
    const ctx = await page.context().browser().newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
    const tp = await ctx.newPage(); const terrs = []; tp.on('pageerror', e => terrs.push(e.message));
    await tp.route(u => !u.href.startsWith(url), r2 => r2.abort());
    await tp.goto(url + '/games/neon-strike.html?seed=7&mute=1', { waitUntil: 'load' }); await tp.waitForTimeout(300);
    await tp.tap('#bStart'); await tp.waitForTimeout(300);
    const ts = () => tp.evaluate(() => window.__gdl.state);
    await tp.evaluate(() => window.__gdl.manual(true)); let t = await ts(); expect(t.mode === 'playing' && t.touch, 'tap starts the game in touch mode');
    expect(await tp.isVisible('#tFire') && await tp.isVisible('#stick'), 'touch controls are shown');
    const cdp = await ctx.newCDPSession(tp);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: p[2] == null ? i : p[2] })) });
    // left stick: push up → forward
    await touch('touchStart', [[120, 280, 1]]); await touch('touchMove', [[120, 220, 1]]);
    await tp.evaluate(() => window.__gdl.advance(0.5)); const tz = (await ts()).z; expect(tz < 16 - 2, 'left stick moves the player (' + (16 - tz).toFixed(2) + 'm)');
    // right drag: look
    const yaw0 = (await ts()).yaw; await touch('touchStart', [[120, 220, 1], [600, 200, 2]]); await touch('touchMove', [[120, 220, 1], [680, 200, 2]]);
    expect(Math.abs((await ts()).yaw - yaw0) > 0.1, 'right-side drag turns the view'); await touch('touchEnd', []);
    // auto-fire on target
    await tp.evaluate(() => { const g = window.__gdl; g.advance(5); g.aimAt(0); g.advance(0.4); });
    t = await ts(); expect(t.shots > 0, 'auto-fire engages when the crosshair is on a construct (' + t.shots + ')');
    // jump button
    const jb = await tp.locator('#tJump').boundingBox(); await touch('touchStart', [[jb.x + jb.width / 2, jb.y + jb.height / 2, 3]]); await touch('touchEnd', []);
    await tp.evaluate(() => window.__gdl.advance(0.2)); expect((await ts()).y > 0.4, 'JUMP button jumps');
    const pb = await tp.locator('#bPause').boundingBox(); await tp.touchscreen.tap(pb.x + pb.width / 2, pb.y + pb.height / 2); await tp.waitForTimeout(150); expect((await ts()).mode === 'paused', 'pause button works under the touch layer');
    expect(!terrs.length, 'no page errors in touch context: ' + terrs.join(' | '));
    await ctx.close();
  },
};
