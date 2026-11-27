// BRINK · Reactor: menu (attract demo) → START (real tap) → the core throws a plate onto the spark's ring → a touch tap hops rings
// (a hop 0.2 s early is only CLOSE) → a Space hop at the last instant is PERFECT and carves the plate out of the arena →
// a hop far too early scores nothing ("EARLY") → a keyboard pilot keeps carving until the charge ignites the BLADE, which cuts
// straight through a plate instead of dying → a polarity flip reverses the orbit → pause freezes the simulation, resume, mute →
// riding into a plate ends the run (after the earned fuse, if any) → card + stored best → tap anywhere restarts cleanly with
// the same seeded first plate → pause → MENU → tapping the menu background starts a run (one button everywhere).
module.exports = {
  game: 'games/brink-reactor.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 180000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const vis = id => page.locator(id).isVisible();
    const cdp = await page.context().newCDPSession(page);
    const touchTap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    // one simulation step, then the pilot's decision. late: hop 60 ms before the plate; seek: go to the ring the next plate is on; ram: never hop
    const step = plan => page.evaluate(plan => { const g = window.__gdl; g.advance(1 / 120); const s = g.state, live = s.plates.filter(q => q.live);
      const own = live.filter(q => q.tr === s.tr && !q.inside).sort((a, b) => a.tau - b.tau)[0], oth = live.filter(q => q.tr !== s.tr), free = !oth.some(q => q.inside);
      const o = oth.filter(q => !q.inside).sort((a, b) => a.tau - b.tau)[0]; let tap = false;
      if (plan === 'late') tap = !!own && own.tau < .06 && s.blade <= 0; else if (plan === 'seek') tap = free && !!o && (!own || o.tau < own.tau) && o.tau > .15;
      return { tap, ownTau: own ? own.tau : 99, ownId: own ? own.id : 0, free, alive: s.alive, t: s.t, blade: s.blade, burns: s.burns, flips: s.flips, grazes: s.grazes, carves: s.carves }; }, plan);
    const fly = async (plan, until, maxSteps) => { let r; for (let i = 0; i < maxSteps; i++) { r = await step(plan); if (!r.alive || until(r)) break; if (r.tap) await page.keyboard.press('Space'); } return r; };

    // 1. menu with the attract demo, START
    let s = await st(); expect(s.mode === 'menu' && s.demo && await vis('#ovMenu') && !(await vis('#bPause')), 'boots to the menu with the demo orbiting behind it');
    await page.locator('#bPlay').tap(); await wait(80); await page.evaluate(() => window.__gdl.manual(true)); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && !s.demo && s.seed === 7 && s.score < 10 && s.hops === 0 && s.tr === 1 && s.dir === 1 && s.alive, 'run started on the outer ring');
    expect(!(await vis('#ovMenu')) && await vis('#bPause'), 'menu closed, pause button shown');

    // 2. the first plate lands on the spark's own ring, with warning
    let r = await fly('ram', r => r.ownTau < .2, 120 * 8); s = await st();
    expect(r.alive && r.ownTau < .2 && r.ownTau > .15 && s.plates.length >= 1, 'a live plate is 0.2 s ahead on the spark\'s ring');
    const first = s.plates.find(q => q.id === 1), sig0 = JSON.stringify([first.tr, first.a.toFixed(4), first.len.toFixed(4)]);

    // 3. touch tap = hop. 0.2 s early is a CLOSE graze: points, chain, but the plate stays
    const score0 = s.score; await touchTap(200, 640); await adv(1 / 120); s = await st();
    expect(s.tr === 0 && s.hops === 1, 'a touch tap hops to the inner ring');
    expect(s.grazes === 1 && s.topTier === 1 && s.chain === 1 && s.score > score0 + 30 && s.carves === 0 && s.plates.some(q => q.id === 1 && q.hp === 2), 'CLOSE graze scored, plate intact');

    // 4. Space at the last instant is PERFECT or better: the plate is carved out of the arena
    r = await fly('ram', r => r.ownTau < .055, 120 * 20); expect(r.alive && r.ownTau < .055 && r.ownTau > 0, 'next plate reached on this ring (' + r.ownTau.toFixed(3) + ' s)');
    const victim = r.ownId, n0 = (await st()).plates.length; await page.keyboard.press('Space'); await adv(1 / 120); s = await st();
    expect(s.hops === 2 && s.grazes >= 2 && s.topTier >= 3 && s.carves === 1 && !s.plates.some(q => q.id === victim) && s.plates.length === n0 - 1, 'last-instant hop carved plate ' + victim);
    expect(s.mult > 1.3 && s.surge > .05 && s.ts < 1, 'multiplier, charge and a beat of slow motion (x' + s.mult.toFixed(2) + ')');

    // 5. hopping far too early scores nothing
    r = await fly('ram', r => r.ownTau < .75 && r.ownTau > .5 && r.free, 120 * 20); expect(r.alive && r.ownTau > .5, 'a plate is 0.5-0.75 s ahead');
    const g0 = (await st()).grazes; await page.keyboard.press('ArrowUp'); await adv(1 / 120); s = await st();
    expect(s.hops === 3 && s.grazes === g0 && s.lazy === 1 && s.alive, 'an early hop is safe but earns no graze');

    // 6. keep carving until the charge ignites the blade; the blade cuts through a plate
    r = await fly('late', r => r.blade > 0, 120 * 90); s = await st();
    expect(r.alive && s.blade > 3.5 && s.blades === 1 && s.carves >= 4 && s.laps >= 3, 'blade ignited after ' + s.carves + ' carves and ' + s.laps + ' laps');
    const b0 = s.burns; r = await fly('seek', r => r.burns > b0 || r.blade <= 0, 120 * 5); s = await st();
    expect(s.alive && s.burns === b0 + 1 && s.blade > 0, 'the blade cut straight through a plate');
    const scoreMid = s.score; expect(scoreMid > 2000, 'score is climbing (' + scoreMid + ')');

    // 7. a polarity flip reverses the orbit (it happens by itself every 22-32 s)
    r = await fly('late', r => r.flips >= 1, 120 * 60); s = await st();
    expect(r.alive && s.flips >= 1 && s.dir === (s.flips % 2 ? -1 : 1), 'polarity flipped at ' + s.t.toFixed(1) + ' s, orbit direction ' + s.dir);
    const phi0 = s.phi; await adv(.05); s = await st(); let d = s.phi - phi0; if (d > 3) d -= 2 * Math.PI; if (d < -3) d += 2 * Math.PI;
    expect(Math.sign(d) === s.dir, 'the spark really moves the other way');

    // 8. pause freezes the simulation; resume; mute
    await page.evaluate(() => window.__gdl.manual(false)); await wait(40);
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await vis('#ovPause'), 'P pauses');
    await wait(250); expect((await st()).t === s.t, 'nothing moves while paused');
    await page.locator('#bResume').tap(); await page.evaluate(() => window.__gdl.manual(true)); const tR = (await st()).t; await adv(.05); const s2 = await st();
    expect(!s2.paused && s2.t > tR && !(await vis('#ovPause')), 'resume continues');
    await page.keyboard.press('KeyM'); expect((await st()).muted === !s.muted, 'M toggles mute'); await page.keyboard.press('KeyM');

    // 9. never hopping again ends the run on a plate (an earned fuse absorbs exactly one hit first)
    r = await fly('ram', () => false, 120 * 60); s = await st();
    expect(!s.alive && s.mode === 'over' && s.cause === 'Ran into a plate' && s.blade === 0 && !s.fuse, 'ran into a plate');
    await adv(1); await wait(100); s = await st();
    expect(s.overShown && await vis('#ovOver') && (await page.locator('#oScore').textContent()).replace(/,/g, '') === String(s.score), 'run-over card shows the score');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/brink-reactor')));
    expect(stored === s.best && stored === s.score && s.score >= scoreMid, 'best score persisted (' + stored + ')');
    expect(s.feats >= 1 && (await page.locator('#oStats .chip.new').count()) >= 1, 'feats earned and shown');

    // 10. tap anywhere → clean restart; the same seed throws the same first plate
    await page.touchscreen.tap(200, 790); await wait(60); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && s.alive && s.score < 10 && s.hops === 0 && s.chain === 0 && s.grazes === 0 && s.carves === 0 && s.laps === 0 && s.blade === 0 && s.surge === 0 && s.dir === 1 && s.tr === 1 && s.plates.length === 0 && s.t < .1, 'restart resets the run');
    expect(s.best === stored && !(await vis('#ovOver')), 'best kept, card gone');
    await adv(1.3); s = await st(); const f2 = s.plates.find(q => q.id === 1);
    expect(f2 && JSON.stringify([f2.tr, f2.a.toFixed(4), f2.len.toFixed(4)]) === sig0, 'same seed, same first plate');

    // 11. pause → MENU → a tap on the menu background starts a run
    await page.locator('#bPause').tap(); await wait(60); await page.locator('#bQuit').tap(); await wait(60); s = await st();
    expect(s.mode === 'menu' && s.demo && await vis('#ovMenu') && (await page.locator('#mStats').textContent()).includes('PLATES CUT'), 'back on the menu with career stats');
    await page.touchscreen.tap(195, 800); await wait(60); await adv(.1); s = await st();
    expect(s.mode === 'play' && !s.demo && s.score < 10, 'tapping the menu background starts a run');
  },
};
