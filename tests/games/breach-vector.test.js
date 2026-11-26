// Breach Vector: menu → deploy → movement/sneak → fog of war → quiet door vs dash-breach → detection meter rises in a vision cone and
// decays out of sight → silent takedown → unseen suppressed kill (real mouse aim + click) → open combat hurts → flashbang stuns →
// hold-to-hack objectives → exfil → debrief + perk → mission 2 (locked door + switch) → pause/auto-pause → death → best → clean restart.
// A second touch context checks the twin-stick scheme. The test steps the simulation itself (manual mode) so it is deterministic.
module.exports = {
  game: 'games/breach-vector.html', query: '?seed=7&mute=1', mobile: false, timeout: 170000,
  async run({ page, expect, wait, url }) {
    const G = fn => page.evaluate(fn), st = () => page.evaluate(() => window.__gdl.state), lv = () => page.evaluate(() => window.__gdl.level), en = () => page.evaluate(() => window.__gdl.enemies());
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s), tp = (x, y) => page.evaluate(([x, y]) => window.__gdl.teleport(x, y), [x, y]);
    const mouseTo = async (x, y) => { const p = await page.evaluate(([x, y]) => window.__gdl.screen(x, y), [x, y]); await page.mouse.move(p.x, p.y); };
    const key = async (code, secs = 0.05) => { await page.keyboard.down(code); await adv(secs); await page.keyboard.up(code); };
    // a spot `dist` px from enemy i along (or against) its facing that has line of sight to it
    const spotNear = (i, dist, front) => page.evaluate(([i, dist, front]) => { const g = window.__gdl, e = g.enemies()[i]; for (const da of [0, 0.2, -0.2, 0.4, -0.4]) for (const k of [1, 0.8, 0.6, 0.45]) { const a = e.ang + (front ? 0 : Math.PI) + da, x = e.x + Math.cos(a) * dist * k, y = e.y + Math.sin(a) * dist * k; if (g.los(x, y, e.x, e.y) && g.path(x, y)) return { x, y, ex: e.x, ey: e.y }; } return null; }, [i, dist, front]);
    const behindAndE = async i => { await page.evaluate(i => { const g = window.__gdl, e = g.enemies()[i]; g.teleport(e.x - Math.cos(e.ang) * 30, e.y - Math.sin(e.ang) * 30); }, i); const e = (await en())[i]; await mouseTo(e.x, e.y); await key('KeyE', 0.05); };

    expect((await st()).mode === 'menu', 'boots to the menu'); expect(await page.title() === 'Breach Vector', 'title');
    await page.click('#bStart'); await wait(250); await G(() => window.__gdl.manual(true));
    let s = await st(), L = await lv();
    expect(s.mode === 'play' && s.mission === 1 && s.type === 'DATA RAID' && s.hp === 100 && s.score === 0, 'mission 1 starts clean');
    expect(s.alert === 'hidden' && s.enemies >= 4, 'facility is populated and unaware (' + s.enemies + ' hostiles)');
    expect((await en()).every(e => e.vis === 0), 'fog of war: no guard is visible from the sealed entry room');
    // ---- movement + sneak
    await tp(L.spawn.x, L.spawn.y); const x0 = (await st()).x; await key('KeyD', 0.5); const run = (await st()).x - x0; expect(run > 60, 'D moves right (' + run.toFixed(0) + 'px in 0.5s)');
    await tp(L.spawn.x, L.spawn.y); await page.keyboard.down('ShiftLeft'); await key('KeyD', 0.5); await page.keyboard.up('ShiftLeft'); const sneak = (await st()).x - L.spawn.x; expect(sneak > 15 && sneak < run * 0.65, 'Shift sneaks slower (' + sneak.toFixed(0) + 'px)');
    // ---- doors: E opens quietly, dashing into one breaches it
    const myDoors = L.doors.map((d, i) => Object.assign({ i }, d)).filter(d => d.a === L.entry || d.b === L.entry);
    const d0 = myDoors[0], R0 = L.rooms[L.entry], side = d0.vert ? [Math.sign(R0.cx - d0.cx) * 32, 0] : [0, Math.sign(R0.cy - d0.cy) * 32];
    await tp(d0.cx + side[0], d0.cy + side[1]); await adv(0.05); expect((await st()).ctx === 'door', 'standing at a door offers the door action');
    await key('KeyE'); expect((await lv()).doors[d0.i].open, 'E opens the door'); expect((await st()).alert === 'hidden', 'opening quietly alerts nobody');
    await key('KeyE'); expect(!(await lv()).doors[d0.i].open, 'E closes it again');
    await tp(d0.cx + side[0] * 2.2, d0.cy + side[1] * 2.2); await page.keyboard.down(d0.vert ? (side[0] < 0 ? 'KeyD' : 'KeyA') : (side[1] < 0 ? 'KeyS' : 'KeyW')); await adv(0.05); await page.keyboard.press('Space'); await adv(0.3); await page.keyboard.up('KeyD'); await page.keyboard.up('KeyA'); await page.keyboard.up('KeyS'); await page.keyboard.up('KeyW');
    expect((await lv()).doors[d0.i].open, 'dashing into a closed door breaches it'); expect((await st()).dashCd > 0, 'dash is on cooldown');
    await tp(L.spawn.x, L.spawn.y); await adv(12); // let the noise of the breach be investigated and forgotten
    // ---- detection: a guard's awareness fills while you stand in its cone, and drains when you leave
    let idle = (await en()).findIndex(e => e.state === 'idle' && e.type === 'guard'); expect(idle >= 0, 'an idle guard exists');
    const front = await spotNear(idle, 230, true); expect(front, 'found a spot inside the cone');
    await tp(front.x, front.y); await adv(0.3); let e = (await en())[idle];
    expect(e.sees && e.aware > 0.1 && e.aware < 1, 'awareness meter is filling (' + e.aware.toFixed(2) + ')'); expect((await st()).spotted === false, 'not yet detected');
    await tp(L.spawn.x, L.spawn.y); await adv(0.1); const a1 = (await en())[idle].aware; await adv(9); e = (await en())[idle];
    expect(e.aware < a1 && e.state !== 'combat', 'out of sight the meter drains (' + a1.toFixed(2) + ' → ' + e.aware.toFixed(2) + ')');
    await adv(8); expect((await st()).alert === 'hidden', 'the facility calms down again');
    // ---- silent takedown from behind
    idle = (await en()).findIndex(e => e.state === 'idle'); const n0 = (await st()).enemies, sc0 = (await st()).score;
    await page.evaluate(i => { const g = window.__gdl, e = g.enemies()[i]; g.teleport(e.x - Math.cos(e.ang) * 30, e.y - Math.sin(e.ang) * 30); g.advance(0.02); }, idle);
    expect((await st()).ctx === 'takedown', 'behind an unaware guard the action is TAKEDOWN'); await key('KeyE', 0.05);
    s = await st(); expect(s.enemies === n0 - 1 && s.takedowns === 1 && s.score >= sc0 + 150 && !s.spotted, 'E performs a silent takedown (+' + (s.score - sc0) + ')'); expect((await lv()).corpses === 1, 'the body stays on the floor');
    // ---- unseen kill with the suppressed pistol: real mouse aim + click
    idle = (await en()).findIndex(e => e.state === 'idle' && e.type !== 'heavy'); const back = await spotNear(idle, 150, false); expect(back, 'found a spot behind a guard');
    await tp(back.x, back.y); await adv(0.02); await mouseTo(back.ex, back.ey); const n1 = (await st()).enemies, sc1 = (await st()).score;
    await page.mouse.down(); await adv(0.25); await page.mouse.up(); s = await st();
    expect(s.ammo === 9, 'one click fires one round'); expect(s.enemies === n1 - 1 && s.score > sc1, 'a suppressed shot on an unaware guard is a one-shot kill'); expect(!s.spotted, 'still undetected');
    // ---- open combat: being seen long enough triggers combat and guards shoot back
    await adv(3); idle = (await en()).findIndex(e => e.state === 'idle' && e.type === 'guard'); if (idle < 0) idle = 0; const f2 = await spotNear(idle, 200, true); expect(f2, 'spot in front of a guard');
    await tp(f2.x, f2.y); await G(() => { const g = window.__gdl; let n = 0; while (g.state.alert !== 'combat' && n++ < 60) g.advance(0.1); }); s = await st(); expect(s.alert === 'combat' && s.spotted, 'full detection puts the facility in COMBAT');
    await G(() => { const g = window.__gdl; let n = 0; while (g.state.hp >= 100 && n++ < 60) g.advance(0.1); }); s = await st(); expect(s.hp < 100 && !s.dead, 'guards shoot back (hp ' + s.hp.toFixed(0) + ')');
    // flashbang (right mouse) stuns what it can see
    const tgt = (await en()).find(e => e.state === 'combat'); await mouseTo(tgt.x, tgt.y); await page.mouse.down({ button: 'right' }); await adv(0.6); await page.mouse.up({ button: 'right' });
    { const q = await st(), sp = await page.evaluate(([x, y]) => window.__gdl.screen(x, y), [tgt.x, tgt.y]); expect(q.flashes === 1, 'right click throws a flashbang (flashes ' + q.flashes + ', dead ' + q.dead + ', mode ' + q.mode + ', screen ' + JSON.stringify(sp) + ', hp ' + q.hp + ')'); } expect((await en()).some(e => e.stun > 0), 'the flashbang stuns guards in its radius');
    // carbine: Q swaps, holding the button sprays
    await page.keyboard.press('KeyQ'); await adv(0.3); expect((await st()).weapon === 'carbine', 'Q swaps to the carbine');
    const t2 = (await en()).find(e => e.stun > 0); await mouseTo(t2.x, t2.y); const n2 = (await st()).enemies; await page.mouse.down(); await adv(0.9); await page.mouse.up(); s = await st(); expect(s.ammo < 24, 'holding fire empties the carbine (' + s.ammo + ')'); expect(s.enemies < n2, 'the carbine kills the stunned guard');
    // ---- clear the rest with takedowns from behind, then hack both nodes (hold E)
    for (let i = 0; i < 12 && (await st()).enemies > 0 && !(await st()).dead; i++) { await behindAndE(0); await tp(L.spawn.x, L.spawn.y); await adv(0.6); }
    s = await st(); expect(s.enemies === 0 && !s.dead, 'facility cleared (left ' + s.enemies + ', dead ' + s.dead + ')');
    await page.keyboard.press('KeyQ'); await adv(0.3);
    for (const t of L.terms) { await tp(t.x + 26, t.y); await adv(0.05); expect((await st()).ctx === 'hack', 'at a terminal the action is HACK'); const b = (await st()).score; await key('KeyE', 0.6); const mid = (await lv()).terms.find(q => q.kind === t.kind); expect(mid.prog > 0.2 && !mid.done, 'hack progresses while E is held'); await key('KeyE', 2); expect((await lv()).terms.find(q => q.kind === t.kind).done && (await st()).score >= b + 300, 'holding E completes the hack (+300)'); }
    s = await st(); expect(s.phase === 'exfil' && s.obj.filter(o => o.id !== 'exfil').every(o => o.done), 'all objectives done → exfil phase'); expect(s.enemies > 0, 'a response team arrives for the exfil');
    // ---- extract → debrief → perk → mission 2
    await tp(L.extract.x + L.extract.w / 2, L.extract.y + L.extract.h / 2); await adv(1.2); s = await st(); expect(s.mode === 'debrief' && s.cleared === 1, 'standing in the zone extracts');
    expect(await page.isVisible('#debrief') && (await page.locator('.perk').count()) === 3, 'debrief offers three upgrades'); const scM1 = s.score; expect(scM1 > 1500, 'mission bonuses are banked (' + scM1 + ')');
    await wait(550); await page.click('.perk >> nth=0'); await wait(150); await G(() => window.__gdl.manual(true)); s = await st();
    expect(s.mode === 'play' && s.mission === 2 && s.type === 'DECAPITATION' && Object.keys(s.perks).length === 1 && s.score === scM1, 'mission 2 starts with the perk and the banked score');
    L = await lv(); expect(L.doors.some(d => d.locked) && L.terms.some(t => t.kind === 'switch'), 'mission 2 has a locked security door and a lock switch'); expect((await en()).some(e => e.type === 'commander'), 'the commander is in the facility');
    const sw = L.terms.find(t => t.kind === 'switch'); await tp(sw.x + 26, sw.y); await key('KeyE', 2.2); expect(!(await lv()).doors.some(d => d.locked), 'cutting the lock opens the security door');
    // ---- pause / auto-pause (real-time loop)
    await tp(L.spawn.x, L.spawn.y); await G(() => window.__gdl.manual(false)); const tA = (await st()).time; await wait(400); expect((await st()).time > tA, 'real-time loop advances the mission clock');
    await page.keyboard.press('KeyP'); await wait(120); const tB = (await st()).time; expect((await st()).mode === 'paused' && await page.isVisible('#pause'), 'P pauses'); await wait(300); expect((await st()).time === tB, 'paused: time frozen');
    await page.click('#bResume'); await wait(120); expect((await st()).mode === 'play', 'Resume resumes');
    await G(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); }); await wait(80); expect((await st()).mode === 'paused', 'auto-pause when hidden');
    await G(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); }); await page.keyboard.press('Escape'); await wait(120); expect((await st()).mode === 'play', 'Esc resumes'); await G(() => window.__gdl.manual(true));
    await page.setViewportSize({ width: 700, height: 500 }); await wait(150); await page.setViewportSize({ width: 1280, height: 800 }); await wait(150);
    // ---- death: stand in the commander's face
    const ci = (await en()).findIndex(e => e.type === 'commander'), cf = await spotNear(ci, 160, true); await tp(cf.x, cf.y);
    await G(() => { const g = window.__gdl; let n = 0; while (g.state.mode === 'play' && n++ < 240) g.advance(0.5); }); s = await st();
    expect(s.mode === 'over' && s.hp === 0, 'being shot to 0 ends the run'); expect(s.best === s.score && s.best >= scM1, 'best score recorded');
    expect(JSON.parse(await G(() => localStorage.getItem('gdl:best:games/breach-vector'))) === s.best, 'best persisted under gdl:best:games/breach-vector');
    expect(await page.isVisible('#over') && (await page.textContent('#oScore')).replace(/,/g, '') === String(s.score), 'game-over panel shows the run score');
    await wait(700); await page.keyboard.press('Enter'); await wait(200); const r = await st();
    expect(r.mode === 'play' && r.mission === 1 && r.score === 0 && r.hp === 100 && r.kills === 0 && !r.spotted && Object.keys(r.perks).length === 0 && r.alert === 'hidden' && r.cleared === 0, 'restart is a clean run'); expect(r.best === s.best, 'best survives restart');

    // ---- touch: twin sticks + ACT
    const ctx = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const tpg = await ctx.newPage(); const terr = []; tpg.on('pageerror', e => terr.push(e.message));
    await tpg.route(u => !u.href.startsWith(url), r2 => r2.abort()); await tpg.goto(url + '/games/breach-vector.html?seed=7&mute=1', { waitUntil: 'load' }); await tpg.waitForTimeout(250);
    await tpg.tap('#bStart'); await tpg.waitForTimeout(250); await tpg.evaluate(() => window.__gdl.manual(true)); const ts = () => tpg.evaluate(() => window.__gdl.state);
    let t = await ts(); expect(t.mode === 'play' && t.touch, 'tap deploys in touch mode'); expect(await tpg.isVisible('#tAct') && await tpg.isVisible('#sL') && await tpg.isVisible('#sR'), 'touch controls visible');
    const cdp = await ctx.newCDPSession(tpg), touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[0], y: p[1], id: p[2] })) });
    const tl = await tpg.evaluate(() => window.__gdl.level); await tpg.evaluate(([x, y]) => window.__gdl.teleport(x, y), [tl.spawn.x + 60, tl.spawn.y]);
    await touch('touchStart', [[90, 700, 1]]); await touch('touchMove', [[138, 700, 1]]); await tpg.evaluate(() => window.__gdl.advance(0.4)); const tx = (await ts()).x; expect(tx > tl.spawn.x + 100, 'left stick moves (' + (tx - tl.spawn.x - 60).toFixed(0) + 'px)');
    await touch('touchMove', [[108, 700, 1]]); await tpg.evaluate(() => window.__gdl.advance(0.2)); expect((await ts()).sneak, 'easing off the stick sneaks');
    await touch('touchStart', [[108, 700, 1], [300, 700, 2]]); await touch('touchMove', [[108, 700, 1], [300, 678, 2]]); await tpg.evaluate(() => window.__gdl.advance(0.2)); t = await ts(); expect(Math.abs(t.ang + Math.PI / 2) < 0.2 && t.ammo === 10, 'right stick aims without firing when pushed gently');
    await touch('touchMove', [[108, 700, 1], [300, 640, 2]]); await tpg.evaluate(() => window.__gdl.advance(0.2)); expect((await ts()).ammo < 10, 'pushing the right stick to the rim fires'); await touch('touchEnd', []);
    const td = tl.doors.find(d => d.a === tl.entry || d.b === tl.entry), tr0 = tl.rooms[tl.entry]; await tpg.evaluate(([x, y]) => { window.__gdl.teleport(x, y); window.__gdl.advance(0.05); }, td.vert ? [td.cx + Math.sign(tr0.cx - td.cx) * 32, td.cy] : [td.cx, td.cy + Math.sign(tr0.cy - td.cy) * 32]);
    expect((await tpg.textContent('#tAct')).includes('OPEN'), 'ACT button shows the contextual action'); const ab = await tpg.locator('#tAct').boundingBox(); await touch('touchStart', [[ab.x + ab.width / 2, ab.y + ab.height / 2, 5]]); await tpg.evaluate(() => window.__gdl.advance(0.05)); await touch('touchEnd', []);
    expect((await tpg.evaluate(() => window.__gdl.level)).doors.some(d => d.open), 'ACT opens the door');
    const pb = await tpg.locator('#bPause').boundingBox(); await tpg.touchscreen.tap(pb.x + 22, pb.y + 22); await tpg.waitForTimeout(120); expect((await ts()).mode === 'paused', 'pause button works on touch'); expect(!terr.length, 'no page errors (touch): ' + terr.join(' | ')); await ctx.close();
  },
};
