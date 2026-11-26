// Suds Patrol: real two-finger dual sticks (move + aim at once), WASD + mouse, kills score, wave clear → upgrade draft,
// grime contact drains hearts → game over, best persists, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/13-suds-patrol/index.html',
  timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[0], y: p[1], id: p[2] })) });
    // --- left thumb: move right
    const x0 = await game(g => g.player.x);
    await touch('touchStart', [[90, 760, 1]]); await touch('touchMove', [[135, 760, 1]]); await wait(350);
    const x1 = await game(g => g.player.x);
    expect(x1 > x0 + 25, 'left stick moves the soap (x ' + x0.toFixed(0) + ' → ' + x1.toFixed(0) + ')');
    // --- right thumb joins while the left is still held: aim straight up and fire
    await touch('touchStart', [[135, 760, 1], [300, 760, 2]]); await touch('touchMove', [[135, 760, 1], [300, 715, 2]]); await wait(300);
    const both = await game(g => ({ L: g.sticks.L.id != null, R: g.sticks.R.id != null, manual: g.player.manual, aim: g.player.aim, up: g.shots.filter(s => s.vy < -200 && Math.abs(s.vx) < 120).length, x: g.player.x }));
    expect(both.L && both.R, 'two pointers drive two sticks at the same time');
    expect(both.manual && Math.sin(both.aim) < -.95, 'right stick aims up');
    expect(both.up >= 1, 'bubbles fly where the right stick points');
    expect(both.x > x1 + 10, 'still moving while aiming');
    await touch('touchMove', [[90, 760, 1], [300, 715, 2]]); await wait(120);   // re-centre move stick → stop drifting
    // a blob placed in the line of fire gets scrubbed and scores
    const s0 = await game(g => g.score);
    await game(g => { g.spawn('blob', g.player.x, g.player.y - 110).age = 1; });
    for (let i = 0; i < 20 && (await game(g => g.score)) <= s0; i++) await wait(100);
    expect((await game(g => g.score)) > s0, 'aimed bubbles kill grime and score');
    expect((await state()).score > 0, 'HUD score updated');
    await touch('touchEnd', []); await wait(120);
    expect(await game(g => g.sticks.L.id == null && g.sticks.R.id == null), 'sticks release with the fingers');
    // --- keyboard + mouse
    const kx = await game(g => g.player.x);
    await page.keyboard.down('KeyA'); await wait(300); await page.keyboard.up('KeyA');
    expect((await game(g => g.player.x)) < kx - 20, 'WASD moves');
    const pp = await game(g => ({ x: g.player.x, y: g.player.y }));
    await page.mouse.move(pp.x, pp.y - 140); await page.mouse.down(); await wait(250);
    const m = await game(g => ({ manual: g.player.manual, aim: g.player.aim }));
    await page.mouse.up();
    expect(m.manual && Math.sin(m.aim) < -.85, 'mouse aims (up) and fires');
    // --- wave 1 falls to auto-aim → draft → pick a card with a tap
    for (let i = 0; i < 160 && (await game(g => g.phase)) !== 'draft'; i++) await wait(250);
    expect(await game(g => g.phase === 'draft' && g.cards.length === 3), 'clearing the wave opens a 3-card upgrade draft');
    await wait(700);
    const r = await game(g => g.cardRects()[1]), key = await game(g => g.cards[1].k);
    await page.touchscreen.tap(r.x + r.w / 2, r.y + r.h / 2); await wait(300);
    const after = await game((g, k) => ({ lvl: g.up[k], wave: g.wave, phase: g.phase }), key);
    expect(after.lvl === 1 && after.wave === 2 && after.phase === 'fight', 'tapping a card applies the upgrade and starts wave 2');
    // --- lose: a ring of heavy gunk closes in
    await game(g => { for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.spawn('gunk', g.player.x + Math.cos(a) * 70, g.player.y + Math.sin(a) * 70).age = 1; } });
    for (let i = 0; i < 120 && !(await state()).over; i++) await wait(250);
    const s = await state(); expect(s.over, 'losing every heart ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    expect(await game(g => g.player.hp) === 0, 'hearts are at zero');
    await wait(1400); await page.keyboard.press('Enter'); await wait(500);
    const z = await state(); expect(z.running && !z.over && z.score === 0, 'restart gives a clean run');
    expect(await game(g => g.wave === 1 && g.player.hp === 3 && g.enemies.length === 0 && Object.values(g.up).every(v => v === 0)), 'wave, hearts, grime and upgrades reset');
  },
};
