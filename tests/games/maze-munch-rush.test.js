// Vault Runner (games/maze-munch-rush.html): menu over the attract demo → a real tap on PLAY → a mouse swipe anywhere starts the
// runner → a turn swiped early is held (pre-turn) and taken at the next junction → a turn pressed just past a junction snaps back
// into the side lane (cornering grace) → glints score → the keycard opens the vault, the door clears vault 1 → vault 2: stepping on
// the switch flips the gates (walkability changes) → EMP stuns a nearby guard → the Warden shows an intercept reticle ahead of the
// runner, the Hound follows the scent trail → the Sweeper raises an alert (≥0.35 s, standing still) before it sprints, and catches a
// runner who stays in its sight → a life is lost and actors reset → pause/resume/mute → caught on the last life → card, stored
// best → tap anywhere restarts the identical seeded vault → pause → MENU.
module.exports = {
  game: 'games/maze-munch-rush.html',
  query: '?seed=11&nopause=1&mute=1',
  timeout: 120000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const vis = id => page.locator(id).isVisible();
    const place = o => page.evaluate(o => window.__gdl.place(o), o);
    const until = (src, max) => page.evaluate(([src, max]) => { const g = window.__gdl, f = new Function('s', 'return (' + src + ')');
      for (let i = 0; i < max * 120; i++) { const s = g.state; if (f(s)) return s; g.advance(1 / 120); } return null; }, [src, max]);
    // in-page pilot: steer (through the same input as a player) along shortest paths to a tile
    await page.evaluate(() => {
      window.__go = (tx, ty, untilSrc, max) => { const g = window.__gdl, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], f = new Function('s', 'return (' + untilSrc + ')');
        for (let i = 0; i < max * 120; i++) { const s = g.state; if (f(s)) return s; if (s.phase !== 'play') { g.advance(1 / 120); continue; }
          const D = new Map([[tx + ',' + ty, 0]]), q = [[tx, ty]];
          while (q.length) { const [x, y] = q.shift(); for (let d = 0; d < 4; d++) { const X = x + DX[d], Y = y + DY[d]; if (!g.walk(X, Y) || D.has(X + ',' + Y)) continue; D.set(X + ',' + Y, D.get(x + ',' + y) + 1); q.push([X, Y]); } }
          const px = Math.round(s.p.x), py = Math.round(s.p.y); let bd = D.get(px + ',' + py), bdir = -1;
          for (let d = 0; d < 4; d++) { const v = D.get((px + DX[d]) + ',' + (py + DY[d])); if (v != null && v < bd) { bd = v; bdir = d; } }
          if (bdir >= 0 && bdir !== s.p.want) g.want(bdir); g.advance(1 / 120); }
        return null; };
    });
    const go = (x, y, until, max) => page.evaluate(([a, b, c, d]) => window.__go(a, b, c, d), [x, y, until, max || 20]);
    const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], KEYS = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

    // 1. menu → real tap on PLAY
    let s = await st();
    expect(s.scene === 'menu' && s.demo && await vis('#ovMenu') && !(await vis('#bEmp')), 'boots to the menu over the attract demo');
    await page.locator('#bPlay').tap(); await wait(50); await page.evaluate(() => window.__gdl.manual(true)); s = await st();
    expect(s.scene === 'play' && !s.demo && s.seed === 11 && s.floor === 1 && s.keys.length === 1 && !s.exitOpen && s.hearts === 3 && s.emp === 1 && s.p.dir === -1 && !s.rot, 'vault 1, runner waiting');
    expect(s.S.length === 2 && s.S.every(q => q.st === 'boot'), 'two guards booting at their docks (telegraphed spawn)');
    const maze1 = JSON.stringify(s.maze), M = s.maze, w = (x, y) => M[y] && M[y][x] === '.';

    // 2. a mouse swipe anywhere starts the runner in an open direction
    const d0 = [0, 1, 3, 2].find(d => w(s.start[0] + DX[d], s.start[1] + DY[d]));
    await page.mouse.move(120, 730); await page.mouse.down(); await page.mouse.move(120 + DX[d0] * 60, 730 + DY[d0] * 60, { steps: 4 }); await page.mouse.up();
    await adv(0.1); s = await st();
    expect(s.p.dir === d0 && (s.p.x !== s.start[0] || s.p.y !== s.start[1]), 'swipe started the runner (dir ' + d0 + ')');
    await place({ S: [] });

    // 3. pre-turn: a turn pressed two tiles early is held and taken at the junction
    let sc = null;
    for (let y = 1; y < M.length - 1 && !sc; y++) for (let x = 1; x < M[0].length - 1 && !sc; x++) for (let d = 0; d < 4 && !sc; d++) for (const pp of [(d + 1) & 3, (d + 3) & 3]) {
      const A = [x + DX[d], y + DY[d]], J = [x + 2 * DX[d], y + 2 * DY[d]];
      if (w(x, y) && w(...A) && w(...J) && !w(x + DX[pp], y + DY[pp]) && !w(A[0] + DX[pp], A[1] + DY[pp]) && w(J[0] + DX[pp], J[1] + DY[pp])) { sc = { x, y, d, p: pp, J }; break; } }
    expect(sc, 'found a corridor leading to a side junction');
    await place({ p: { x: sc.x, y: sc.y, dir: sc.d } }); const sc0 = (await st()).score, c0 = (await st()).coins;
    await page.keyboard.press(KEYS[sc.p]); s = await st(); expect(s.p.want === sc.p && s.p.dir === sc.d, 'turn queued, still running straight');
    s = await until(`Math.abs(s.p.x-${sc.x + DX[sc.d]})+Math.abs(s.p.y-${sc.y + DY[sc.d]})<0.05`, 2); expect(s && s.p.dir === sc.d, 'passes the blind tile without turning');
    s = await until(`s.p.dir === ${sc.p}`, 2);
    expect(s && Math.abs((sc.p & 1 ? s.p.y : s.p.x) - (sc.p & 1 ? sc.J[1] : sc.J[0])) < 1e-3 && Math.abs(s.p.x - sc.J[0]) + Math.abs(s.p.y - sc.J[1]) < 0.2, 'turned exactly at the junction ' + JSON.stringify(sc.J));

    // 4. cornering grace: a turn pressed just past a junction centre snaps into the side lane, keeping distance
    let J2 = null; for (let y = 1; y < M.length - 1 && !J2; y++) for (let x = 1; x < M[0].length - 1 && !J2; x++) if (w(x, y) && w(x + 1, y) && w(x - 1, y) && w(x, y - 1)) J2 = [x, y];
    await place({ p: { x: J2[0] + 0.2, y: J2[1], dir: 1 } }); await page.keyboard.press('ArrowUp'); s = await st();
    expect(s.p.dir === 0 && Math.abs(s.p.x - J2[0]) < 1e-6 && Math.abs(s.p.y - (J2[1] - 0.2)) < 1e-6 && s.graces === 1, 'late turn snapped into the up lane (' + JSON.stringify(s.p) + ')');

    // 5. keycard → vault opens; the door clears vault 1 (glints scored on the way)
    const k = s.keys[0]; s = await go(k.x, k.y, 's.keysGot === 1', 25);
    expect(s && s.exitOpen && s.score >= sc0 + 500, 'keycard taken, vault door open (score ' + (s && s.score) + ')');
    s = await go(s.exit[0], s.exit[1], "s.phase === 'clear'", 25);
    expect(s && s.floorsCleared === 1 && s.coins < c0, 'vault 1 cracked; glints collected: ' + (c0 - (s && s.coins)));
    s = await until("s.phase === 'play' && s.floor === 2", 3);
    expect(s && s.keys.length === 2 && s.sws.length === 1 && s.gates.length >= 4 && s.keysGot === 0, 'vault 2: two keycards, a switch and gates');

    // 6. switch flips the gates (a gate's walkability changes)
    await place({ S: [] }); const g0 = s.gates[0], before = await page.evaluate(g => window.__gdl.walk(g[0], g[1]), g0);
    s = await go(s.sws[0].x, s.sws[0].y, 's.switches === 1', 25);
    const after = await page.evaluate(g => window.__gdl.walk(g[0], g[1]), g0);
    expect(s && s.gs === 1 && before !== after, 'gates flipped: gate ' + JSON.stringify(g0) + ' ' + before + ' → ' + after);

    // 7. EMP stuns a guard within reach
    const px = Math.round(s.p.x), py = Math.round(s.p.y);
    await place({ p: { x: px, y: py }, S: [{ k: 'hound', x: px, y: py + 2, hold: true }] });
    await page.keyboard.press('Space'); s = await st();
    expect(s.emp === 0 && s.empsUsed === 1 && s.S[0].st === 'stun', 'EMP stunned the hound');

    // 8. Warden: intercept reticle lies ahead of the runner on the way to the keycard; Hound: follows the scent, not the runner
    s = await st(); const far = (() => { const D = new Map(); const q = [[px, py]]; D.set(px + ',' + py, 0); let best = null;
      while (q.length) { const [x, y] = q.shift(); for (let d = 0; d < 4; d++) { const X = x + DX[d], Y = y + DY[d]; if (!w(X, Y) || D.has(X + ',' + Y)) continue; D.set(X + ',' + Y, D.get(x + ',' + y) + 1); q.push([X, Y]); best = [X, Y]; } } return best; })();
    await place({ S: [{ k: 'warden', x: far[0], y: far[1] }, { k: 'hound', x: s.start[0], y: s.start[1] }] });
    const k2 = s.keys.find(q => !q.got); s = await go(k2.x, k2.y, 's.S[0].tgt && s.S[1].tgt && s.trail > 12', 6);
    expect(s, 'guards picked targets');
    const rp = [Math.round(s.p.x), Math.round(s.p.y)];
    expect(s.S[0].tgt.join() !== rp.join(), 'warden aims at an intercept tile ' + s.S[0].tgt + ', not the runner ' + rp);
    const dist = (a, b) => page.evaluate(([a, b]) => { const g = window.__gdl, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], D = new Map([[a.join(), 0]]), q = [a];
      while (q.length) { const [x, y] = q.shift(); for (let d = 0; d < 4; d++) { const X = x + DX[d], Y = y + DY[d]; if (!g.walk(X, Y) || D.has(X + ',' + Y)) continue; D.set(X + ',' + Y, D.get(x + ',' + y) + 1); q.push([X, Y]); } } return D.get(b.join()); }, [a, b]);
    expect(await dist(s.S[0].tgt, [k2.x, k2.y]) < await dist(rp, [k2.x, k2.y]), 'the reticle sits between the runner and the keycard');

    // 9. Sweeper: alert (stands still ≥0.35 s) → sprint → catches a runner who stays in sight; a life is lost, actors reset
    const ln = await page.evaluate(() => { const g = window.__gdl; for (let y = 1; y < 20; y++) for (let x = 1; x < 8; x++) { let ok = true; for (let i = 0; i <= 6; i++) ok = ok && g.walk(x + i, y); if (ok) return [x, y]; } return null; });
    expect(ln, 'found a straight corridor ' + ln);
    await page.evaluate(() => window.__gdl.cheat({ inv: 0 }));
    await place({ p: { x: ln[0], y: ln[1] }, S: [{ k: 'sweeper', x: ln[0] + 6, y: ln[1], dir: 3, st: 'patrol' }] }); const h0 = (await st()).hearts;
    s = await until("s.S[0].st === 'alert'", 2); expect(s, 'sweeper spots the runner'); const tA = s.t, sx = s.S[0].x;
    s = await until("s.S[0].st === 'sprint'", 2);
    expect(s && s.t - tA >= 0.35 && s.S[0].x === sx, 'alert held ' + (s && (s.t - tA).toFixed(2)) + ' s in place before sprinting');
    s = await until("s.phase === 'caught'", 3);
    expect(s && s.hearts === h0 - 1 && s.caughtN === 1, 'caught: a life lost');
    s = await until("s.phase === 'play'", 3);
    expect(s && s.p.x === s.start[0] && s.p.y === s.start[1] && s.inv > 0 && s.S.every(q => q.st === 'boot'), 'runner back at the start, guards rebooting');

    // 10. pause freezes the simulation; resume; mute
    await page.evaluate(() => window.__gdl.manual(false)); await wait(40);
    await page.keyboard.press('KeyP'); await wait(50); s = await st(); expect(s.paused && await vis('#ovPause'), 'P pauses');
    await wait(250); expect((await st()).t === s.t, 'nothing moves while paused');
    await page.locator('#bResume').tap(); await page.evaluate(() => window.__gdl.manual(true)); const tR = (await st()).t; await adv(0.05); s = await st();
    expect(!s.paused && s.t > tR && !(await vis('#ovPause')), 'resume continues');
    const m0 = s.muted; await page.keyboard.press('KeyM'); expect((await st()).muted === !m0, 'M toggles mute'); await page.keyboard.press('KeyM');

    // 11. last life: the Hound catches a runner who stands still → card, stored best
    await page.evaluate(() => window.__gdl.cheat({ hearts: 1, inv: 0 }));
    s = await st(); const sp = s.start; const hp = [[0, -1], [1, 0], [-1, 0], [0, 1]].map(([a, b]) => [sp[0] + a, sp[1] + b]).find(q => w(q[0], q[1]));
    await place({ p: { x: sp[0], y: sp[1] }, S: [{ k: 'hound', x: hp[0] + (hp[0] - sp[0]), y: hp[1] + (hp[1] - sp[1]) }] });
    s = await until('!s.alive', 4);
    expect(s && s.hearts === 0 && /Hound/.test(s.cause) && /vault 2/.test(s.cause), 'busted: ' + (s && s.cause));
    await adv(1 / 60); s = await st();
    expect(s.scene === 'over' && s.overShown && await vis('#ovOver') && !(await vis('#bPause')) && !(await vis('#bEmp')), 'run-over card shown, game buttons hidden');
    expect((await page.locator('#oScore').textContent()).replace(/,/g, '') === String(s.score), 'card shows the score ' + s.score);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/maze-munch-rush')));
    expect(stored === s.score && s.best === s.score && s.newBest, 'best stored: ' + stored);

    // 12. tap anywhere → same seeded vault, everything reset
    await page.touchscreen.tap(195, 820); await wait(50); s = await st();
    expect(s.scene === 'play' && s.alive && s.floor === 1 && s.score === 0 && s.hearts === 3 && s.emp === 1 && s.keysGot === 0 && s.floorsCleared === 0 && !(await vis('#ovOver')), 'restart resets the run');
    expect(JSON.stringify(s.maze) === maze1 && await vis('#bEmp'), 'same seed, same vault');

    // 13. pause → MENU
    await page.locator('#bPause').tap(); await wait(40); await page.locator('#bQuit').tap(); await wait(40); s = await st();
    expect(s.scene === 'menu' && s.demo && await vis('#ovMenu'), 'back on the menu');
  },
};
