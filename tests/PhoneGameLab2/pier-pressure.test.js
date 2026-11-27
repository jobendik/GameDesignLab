// Pier Pressure: a real drag steers Pip's car (and letting go brakes), arrow keys drive, a tap dashes on a cooldown;
// collisions conserve the physics we promise (head-on hands over more than a glancing hit, a heavy car moves less);
// ramming a rival over the edge scores a knock-out; the sinking ring dunks whoever is on it and clearing the deck starts
// the next round with more rivals; a wave pushes cars; falling costs a life then respawns; the last life ends the run.
module.exports = {
  game: 'PhoneGameLab2/games/pier-pressure/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await game(g => { g.hold(true); g.go(); });
    const car = id => game((g, id) => g.cars().find(c => c.id === id), id);
    // 1) thumb-stick drag
    await page.mouse.move(195, 760); await page.mouse.down(); await page.mouse.move(255, 760, { steps: 3 }); await wait(700);
    let p = await car('pip'); expect(p.vx > 60 && p.x > 15, 'dragging right drives Pip right');
    await page.mouse.up(); const v1 = Math.hypot(p.vx, p.vy); await wait(450); p = await car('pip'); expect(Math.hypot(p.vx, p.vy) < v1 * .5, 'letting go brakes');
    // 2) keyboard
    await game(g => g.put('pip', { x: 0, y: 60 })); await page.keyboard.down('ArrowUp'); await wait(400); p = await car('pip'); await page.keyboard.up('ArrowUp'); expect(p.vy < -40, 'arrow keys drive');
    // 3) tap = dash, on a cooldown
    await game(g => g.put('pip', { x: -60, y: 60, a: 0, dashCd: 0 })); await page.touchscreen.tap(195, 780); await wait(60);
    p = await car('pip'); expect(p.vx > 140 && p.dashCd > 1.5, 'a tap dashes forward');
    await wait(400); await page.touchscreen.tap(195, 780); await wait(60); expect((await car('pip')).vx < 140, 'no second dash during the cooldown');
    // 4) collision physics
    const bonk = async (id, py) => { await game((g, [id, py]) => { g.put('bun', { x: 0, y: -120 }); g.put('momo', { x: -120, y: -40 }); g.put(id, { x: 40, y: 0 }); g.put('pip', { x: py ? 13.7 : 0, y: py, a: 0, vx: 220, dashCd: 9 }); }, [id, py]); await wait(90); return { pip: await car('pip'), o: await car(id) }; };
    const head = await bonk('bun', 0), glance = await bonk('bun', 30), heavy = await bonk('momo', 0);
    expect(head.o.vx > 140 && head.pip.vx < 90, 'a head-on ram hands Pip\'s momentum to the rival');
    expect(glance.o.vx < head.o.vx - 30 && glance.o.vy < -40 && glance.pip.vx > head.pip.vx + 40, 'a glancing hit transfers only part of it, sideways');
    expect(heavy.o.vx < head.o.vx * .8 && heavy.pip.vx < head.pip.vx, 'a heavy car is harder to shove and bounces Pip back');
    // 5) knock a rival into the bay
    const R = await game(g => g.R);
    await game((g, R) => { g.put('momo', { x: 0, y: -100 }); g.put('bun', { x: R - 22, y: 0 }); g.put('pip', { x: R - 62, y: 0, a: 0, vx: 260, dashCd: 9 }); }, R);
    for (let i = 0; i < 25 && await game(g => g.kos) < 1; i++) await wait(100);
    let s = await page.evaluate(() => ({ kos: __lab.game.kos, score: __lab.game.score, hud: __lab.state.score, bun: __lab.game.cars().find(c => c.id === 'bun').alive }));
    expect(s.kos === 1 && !s.bun && s.score >= 100 && s.hud === s.score, 'ramming Bun off the deck scores a knock-out');
    // 6) the outer ring sinks with Momo on it → deck cleared → round 2
    await game((g, R) => { g.put('pip', { x: 0, y: 60 }); g.put('momo', { x: 0, y: -(R - 5) }); g.hold(false); g.shrink(); }, R);
    for (let i = 0; i < 30 && await game(g => g.phase) !== 'clear'; i++) await wait(100);
    s = await game(g => ({ R: g.R, phase: g.phase, kos: g.kos, score: g.score, ring: g.ringI })); expect(s.ring === 1 && s.R < R - 15, 'the deck shrank'); expect(s.phase === 'clear' && s.kos === 1 && s.score >= 100 + 150, 'Momo sank with the ring (no knock-out credit) and the round was cleared');
    for (let i = 0; i < 40 && await game(g => g.round) < 2; i++) await wait(100);
    await game(g => { g.hold(true); g.go(); });
    s = await game(g => ({ round: g.round, n: g.cars().filter(c => c.alive).length, R: g.R })); expect(s.round === 2 && s.n === 4 && s.R === R, 'round 2: three rivals on a fresh deck');
    // 7) a wave pushes every car
    const x0 = (await car('nori')).x; await game(g => g.waveNow(0)); await wait(900); expect((await car('nori')).x > x0 + 15, 'the wave shoved the cars along');
    // 8) falling costs a life, then Pip is fished out
    await game((g, R) => g.put('pip', { x: 0, y: R + 6 }), R);
    for (let i = 0; i < 20 && await game(g => g.hearts) > 2; i++) await wait(100);
    expect(await game(g => g.hearts) === 2 && !(await state()).over, 'a swim costs one life');
    for (let i = 0; i < 30 && !(await car('pip')).alive; i++) await wait(100);
    p = await car('pip'); expect(p.alive && Math.hypot(p.x, p.y) < 60, 'Pip is dropped back onto the deck');
    // 9) last life
    const before = await game(g => g.score); await game((g, R) => { g.hearts = 1; g.put('pip', { x: R + 6, y: 0 }); }, R);
    for (let i = 0; i < 25 && !(await state()).over; i++) await wait(200);
    s = await state(); expect(s.over, 'the last swim ends the run'); expect(s.best >= before && s.best > 0, 'best score recorded');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.round === 1 && g.hearts === 3 && g.kos === 0 && g.cars().length === 3 && g.ringI === 0), 'round, lives and deck reset');
  },
};
