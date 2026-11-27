// Kosmisk Slange: menu card (HUD hidden behind it) → «Start natten» (real tap) → the mouse steers the serpent through the four
// stars of the starter constellation: stars light while the body lies on them, the constellation is claimed and scored →
// dust is eaten and the body grows → hold to boost (faster, burns length) → keyboard turn + boost → touch stick + second finger →
// a dust-seeking, obstacle-avoiding driver (real mouse moves) survives a shortened night: dawn shrinks
// the sky, sunrise ends the run with a length + placing bonus and the best score is stored → «Ny natt» restarts cleanly →
// flying into a sun core ends the run («Slangen sloknet») without a bonus → Enter restarts → P pauses and freezes the night.
module.exports = {
  game: 'games/kosmisk-slange.html',
  query: '?seed=7&nopause=1&mute=1&night=44',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const diff = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
    // point the real mouse from the head toward a world position (optionally through the game's own avoidance probe)
    const aimAt = async (x, y, safe) => { const t = await page.evaluate(([x, y, safe]) => { const g = window.__gdl, s = g.state.you; let a = Math.atan2(y - s.y, x - s.x); if (safe) a = g.safe(a); const p = g.toScreen(s.x, s.y); return { x: p.x + Math.cos(a) * 80, y: p.y + Math.sin(a) * 80, d: Math.hypot(x - s.x, y - s.y) }; }, [x, y, safe]); await page.mouse.move(t.x, t.y); return t.d; };

    // 1. menu → start
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#ovMenu').isVisible(), 'boots to the menu card');
    expect(await page.evaluate(() => getComputedStyle(document.getElementById('hud')).opacity === '0' && getComputedStyle(document.getElementById('lb')).opacity === '0'), 'HUD is hidden behind the card');
    expect((await page.locator('#bPlay').textContent()) === 'Start natten' && (await page.title()) === 'Kosmisk Slange', 'Norwegian UI');
    await page.evaluate(() => window.__gdl.manual(true));   // from here the test steps the simulation itself, so the night is reproducible
    await page.locator('#bPlay').tap(); await wait(100); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.you.n === 18 && s.bots.length === 11 && s.cons.length === 7 && s.owned === 0 && s.t < 1, 'a new night: 11 rivals, 7 constellations');
    expect(!(await page.locator('#ovMenu').isVisible()) && await page.locator('#bBoost').isVisible(), 'card gone, boost button shown on touch screens');
    expect(new Set(s.bots.map(b => b.kind)).size === 5, 'five bot temperaments');

    // 2. the starter constellation: lay the body over all its stars
    const c0 = s.cons[0]; expect(c0.owner === -1 && c0.need <= s.you.n && c0.stars.length === 4, 'starter constellation fits the starting length');
    let litMax = 0;
    for (const star of c0.stars) for (let i = 0; i < 160; i++) { const d = await aimAt(star.x, star.y, false); await adv(.05); const q = await st(); litMax = Math.max(litMax, q.cons[0].stars.filter(z => z.lit).length); if (d < 14 || q.owned) break; }
    await adv(.1); s = await st();
    expect(litMax >= 2 && s.owned === 1 && s.cons[0].owner === 0, 'all four stars lit at once → ' + c0.name + ' is yours');
    expect(s.score >= 400 && s.you.alive, 'constellation scored 100 per star (' + s.score + ')');
    const sc1 = s.score, n1 = s.you.n;

    // 3. steer toward dust with the mouse: eat, score, grow
    for (let i = 0; i < 80 && (await st()).score < sc1 + 5; i++) { const d = await page.evaluate(() => window.__gdl.dust()); await aimAt(d.x, d.y, true); await adv(.05); }
    s = await st(); expect(s.score >= sc1 + 5 && s.you.n > n1 && s.you.alive, 'stardust eaten: score ' + sc1 + ' → ' + s.score + ', length ' + n1 + ' → ' + s.you.n);

    // 4. hold to boost: faster, burns length
    const ahead = async () => { const y = (await st()).you; return aimAt(y.x + Math.cos(y.ang) * 200, y.y + Math.sin(y.ang) * 200, true); };
    await ahead(); await adv(.3); s = await st(); expect(!s.you.boost && s.you.spd < 215 && s.you.burnt === 0, 'cruising costs nothing');
    await page.mouse.down(); await wait(40); await adv(.8); s = await st();
    expect(s.you.boost && s.you.spd > 255 && s.you.burnt >= 4, 'boost: speed ' + s.you.spd.toFixed(0) + ', ' + s.you.burnt + ' segments burnt into a dust trail');
    await page.mouse.up(); await wait(40); await adv(.1); expect(!(await st()).you.boost, 'release stops the boost');

    // 5. keyboard: arrows turn, space boosts
    s = await st(); const a0 = s.you.ang; await page.keyboard.down('ArrowRight'); await wait(40); await adv(.35); s = await st();
    expect(diff(s.you.ang, a0) > .6, 'ArrowRight turns clockwise (' + diff(s.you.ang, a0).toFixed(2) + ' rad)'); await page.keyboard.up('ArrowRight'); await wait(40);
    const a1 = (await st()).you.ang; await adv(.3); expect(Math.abs(diff((await st()).you.ang, a1)) < .15, 'releasing the key holds the course');
    await page.keyboard.down('Space'); await wait(40); await adv(.2); expect((await st()).you.boost, 'Space boosts'); await page.keyboard.up('Space'); await wait(40); await adv(.05);

    // 6. touch: a drag is a floating stick, a second finger boosts
    s = await st(); const ta = await page.evaluate(() => { const g = window.__gdl, y = g.state.you; return g.safe(y.ang + .9); });
    const f1 = { x: 150, y: 560, id: 1 }, f1b = { x: 150 + Math.cos(ta) * 50, y: 560 + Math.sin(ta) * 50, id: 1 };
    await touch('touchStart', [f1]); await wait(30); await touch('touchMove', [f1b]); await wait(40); await adv(1.3); s = await st();
    expect(Math.abs(diff(s.you.ang, ta)) < .2 && s.you.alive, 'the serpent follows the drag direction');
    await touch('touchStart', [f1b, { x: 300, y: 300, id: 2 }]); await wait(40); await adv(.25); expect((await st()).you.boost, 'second finger boosts');
    await touch('touchEnd', []); await wait(40); await adv(.05); expect(!(await st()).you.boost, 'lifting the fingers stops it');

    // 7. survive until sunrise: a scripted player steers the real mouse toward dust, around bodies, and away from daylight
    const drive = () => page.evaluate(() => { const g = window.__gdl, s = g.state, y = s.you; if (s.mode !== 'play') return null; const d = g.dust(), far = Math.hypot(y.x, y.y) > s.R - 320;
      const dc = Math.hypot(y.x, y.y), k = dc < 380 ? 1.6 : .6; let tx = far || !d || dc < 380 ? y.x * k : d.x, ty = far || !d || dc < 380 ? y.y * k : d.y;   // stay between daylight and the black hole
      if (!far && dc >= 380) for (const b of s.bots) if (b.alive && Math.hypot(b.x - y.x, b.y - y.y) < 280) { tx = y.x * 2 - b.x; ty = y.y * 2 - b.y; break; }   // keep clear of rival heads
      const a = g.safe(Math.atan2(ty - y.y, tx - y.x), 220), p = g.toScreen(y.x, y.y); return { x: p.x + Math.cos(a) * 80, y: p.y + Math.sin(a) * 80 }; });
    let sawDawn = false, last = null;
    for (let i = 0; i < 1400; i++) { const t = await drive(); if (!t) break; await page.mouse.move(t.x, t.y); await adv(.05); if (i % 10 === 0) { last = await st(); if (last.phase === 2 && last.R < 1900) sawDawn = true; } }
    await wait(150); s = await st();
    expect(sawDawn, 'dawn shrinks the sky ' + JSON.stringify([s.mode, s.cause, s.t])); expect(s.mode === 'over' && s.won && s.you.alive && s.R < 950, 'sunrise ends the night (sky radius ' + s.R.toFixed(0) + ') ' + JSON.stringify([s.mode, s.won, s.you.alive, s.cause, s.t]));
    expect(s.rank >= 1 && s.bonus === s.you.n * 2 + ([0, 300, 150, 75][s.rank] || 0) && s.score >= last.score + s.bonus - 1, 'sunrise bonus for length and place ' + s.rank + ': +' + s.bonus);
    expect(await page.locator('#ovEnd').isVisible() && (await page.locator('#eTitle').textContent()) === 'Soloppgang' && (await page.locator('#eScore').textContent()) === String(s.score), 'end card shows the score');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/kosmisk-slange')));
    expect(stored === s.score && s.best === stored && (await page.locator('#eCon').textContent()).startsWith(s.owned + '/'), 'best night persisted (' + stored + ')');

    // 8. clean restart
    await page.locator('#bAgain').tap(); await wait(120); s = await st();
    expect(s.mode === 'play' && s.t < 1 && s.score === 0 && s.owned === 0 && s.kills === 0 && s.you.n === 18 && s.R === 2000 && s.phase === 0 && s.cons.every(c => c.owner === -1 && !c.faded), 'restart resets the night');
    expect(s.best === stored && !(await page.locator('#ovEnd').isVisible()), 'best kept, card gone');

    // 9. a sun core burns: fly straight in
    const sun = s.wells.filter(w => !w.hole).sort((a, b) => Math.hypot(a.x - s.you.x, a.y - s.you.y) - Math.hypot(b.x - s.you.x, b.y - s.you.y))[0];
    for (let i = 0; i < 400 && (await st()).mode === 'play'; i++) { await aimAt(sun.x, sun.y, false); await adv(.05); }
    s = await st(); expect(s.mode !== 'play' && !s.you.alive, 'the serpent went out: ' + s.cause);
    expect(/Solkjernen|Du traff/.test(s.cause), 'cause named (' + s.cause + ')');
    await adv(2); await wait(150); s = await st();
    expect(s.mode === 'over' && !s.won && s.bonus === 0 && (await page.locator('#eTitle').textContent()) === 'Slangen sloknet' && (await page.locator('#eSub').textContent()) === s.cause, 'run over without a sunrise bonus');
    expect(s.best === stored && (await page.locator('#bAgain').textContent()) === 'Prøv igjen', 'best unchanged by a worse run');

    // 10. Enter restarts from the keyboard
    await page.evaluate(() => window.__gdl.manual(false)); await page.keyboard.press('Enter'); await wait(150); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.you.alive && s.you.n === 18, 'Enter starts a fresh night');

    // 11. pause (real-time from here)
    await page.keyboard.press('KeyP'); await wait(80); s = await st();
    expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses'); await wait(300); expect((await st()).t === s.t, 'the night stands still while paused');
    await page.locator('#bResume').tap(); await wait(250); expect(!(await st()).paused && (await st()).t > s.t, 'resume continues');
  },
};
