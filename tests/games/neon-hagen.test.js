// Neon Hagen: menu → PLAY (real tap) → a real touch-stick drag blooms buds (score, chain, fireflies) → fireflies are led to the
// Moonbloom, which opens and brings dawn → night 2 → keyboard steering, flare cost/deny, a Shade hit, pause freezes time →
// the glow running out ends the run, the best score is stored → PLAY AGAIN restarts cleanly.
module.exports = {
  game: 'games/neon-hagen.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 120000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const nearest = (s, list) => list.reduce((b, p) => { const d = Math.hypot(p.x - s.wisp.x, p.y - s.wisp.y); return !b || d < b.d ? { x: p.x, y: p.y, d } : b; }, null);

    // 1. splash: nothing is running yet, PLAY starts the run
    let s = await st();
    expect(s.mode === 'menu', 'boots to the menu (mode=' + s.mode + ')');
    expect(await page.locator('#bPlay').isVisible(), 'PLAY button visible');
    await page.locator('#bPlay').tap();
    await wait(150);
    s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.night === 1 && s.glow === 100 && s.flies === 0, 'run started fresh');
    expect(s.moons.length === 1 && !s.moons[0].open && s.shades.length === 0, 'night 1 has one Moonbloom and no Shades');
    await wait(600); s = await st();
    expect(s.glow === 100, 'the glow does not fade before the first bloom on night 1');

    // 2. real touch: a floating stick steers the wisp over buds
    const cdp = await page.context().newCDPSession(page);
    const O = { x: 150, y: 640 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: O.x, y: O.y, id: 1 }] });
    const steerTouch = async (tx, ty, s) => { const dx = tx - s.wisp.x, dy = ty - s.wisp.y, d = Math.hypot(dx, dy) || 1; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: O.x + dx / d * 52, y: O.y + dy / d * 52, id: 1 }] }); };
    const x0 = s.wisp.x, y0 = s.wisp.y; let sawChain = 0;
    for (let i = 0; i < 260; i++) {
      s = await st(); sawChain = Math.max(sawChain, s.chain);
      const m = s.moons[0]; if (m.open || s.mode !== 'play') break;
      const buds = s.buds.filter(b => !b.on), target = (s.flies >= m.need - m.got || !buds.length) ? m : nearest(s, buds);
      await steerTouch(target.x, target.y, s); await wait(45);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    s = await st();
    expect(Math.hypot(s.wisp.x - x0, s.wisp.y - y0) > 150, 'touch stick moved the wisp');
    expect(s.blooms >= 4, 'buds bloomed by gliding over them (' + s.blooms + ')');
    expect(sawChain >= 3, 'blooms in quick succession build a chain (' + sawChain + ')');
    expect(s.score >= 40 + 150, 'blooms and the Moonbloom scored (' + s.score + ')');
    expect(s.moons[0].open || s.night === 2, 'the Moonbloom opened once it had its fireflies');
    const scoreN1 = s.score;

    // 3. dawn → night 2
    for (let i = 0; i < 80 && (await st()).night < 2; i++) await wait(100);
    s = await st();
    expect(s.night === 2 && s.mode === 'play', 'dawn leads to night 2');
    expect(s.score > scoreN1 - 1 && s.moons.length === 2 && s.moons.every(m => !m.open), 'a new garden with two Moonblooms');
    expect(s.shades.length >= 1, 'Shades arrive on night 2');
    expect(Math.hypot(s.wisp.x, s.wisp.y) < 30, 'wisp starts the night in the middle');

    // 4. keyboard steering
    await page.keyboard.down('ArrowLeft'); await wait(450); await page.keyboard.up('ArrowLeft');
    const k = await st(); expect(k.wisp.x < s.wisp.x - 40, 'ArrowLeft drifts left (' + k.wisp.x.toFixed(0) + ')');
    await page.keyboard.down('KeyS'); await wait(350); await page.keyboard.up('KeyS');
    expect((await st()).wisp.y > k.wisp.y + 25, 'S drifts down');

    // 5. flare: denied without 3 fireflies, otherwise spends exactly 3
    const bot = (n, wantFlies) => page.evaluate(([n, wantFlies]) => {
      const g = window.__gdl;
      for (let i = 0; i < n; i++) { const s = g.state; if (s.mode !== 'play' || s.flies >= wantFlies) break; let b = null, bd = 1e9;
        for (const q of s.buds) if (!q.on) { const d = Math.hypot(q.x - s.wisp.x, q.y - s.wisp.y); if (d < bd) { bd = d; b = q; } }
        if (!b) break; g.steer((b.x - s.wisp.x) / bd, (b.y - s.wisp.y) / bd); g.advance(0.05); }
      g.steer(0, 0); g.steer(null); return g.state;
    }, [n, wantFlies]);
    s = await st();
    if (s.flies >= 3) { await page.evaluate(() => { const g = window.__gdl; while (g.state.flies >= 3) { g.flare(); g.advance(1.3); } }); s = await st(); }
    const f0 = s.flies; await page.keyboard.press('Space'); await wait(80);
    expect((await st()).flies === f0, 'flare with fewer than 3 fireflies is refused');
    s = await bot(400, 6);
    expect(s.flies >= 3, 'gathered fireflies for a flare (' + s.flies + ')');
    // a flare also blooms the buds around it a moment later, and each bloom frees a firefly, so account for blooms gained
    const f1 = s.flies, b1 = s.blooms, l1 = s.loose; await page.locator('#flare').tap(); await wait(80);
    s = await st();
    expect(s.loose !== l1 || s.flies === f1 - 3 + (s.blooms - b1), 'flare button spends exactly 3 fireflies (' + f1 + ' → ' + s.flies + ', +' + (s.blooms - b1) + ' blooms)');
    expect(s.flies < f1 + (s.blooms - b1), 'flare cost fireflies');

    // 6. a Shade's touch costs glow, scatters the tail and breaks the chain
    const hit = await page.evaluate(() => {
      const g = window.__gdl; let before = null;
      for (let i = 0; i < 2400; i++) { const s = g.state; if (s.mode !== 'play') return { err: 'mode ' + s.mode };
        const sh = s.shades.filter(q => !q.out && q.stun <= 0).sort((a, b) => Math.hypot(a.x - s.wisp.x, a.y - s.wisp.y) - Math.hypot(b.x - s.wisp.x, b.y - s.wisp.y))[0];
        if (!sh) { g.steer(0, 0); g.advance(0.05); continue; }
        const d = Math.hypot(sh.x - s.wisp.x, sh.y - s.wisp.y); g.steer((sh.x - s.wisp.x) / d, (sh.y - s.wisp.y) / d);
        before = s; g.advance(1 / 60); const a = g.state;
        if (a.glow < before.glow - 10) { g.steer(null); return { drop: before.glow - a.glow, chain: a.chain, flies: a.flies }; } }
      g.steer(null); return { err: 'never hit' };
    });
    expect(!hit.err, 'ran into a Shade (' + hit.err + ')');
    expect(hit.drop > 13 && hit.drop < 16 && hit.chain === 0 && hit.flies === 0, 'Shade hit: −14 glow, chain reset, tail scattered ' + JSON.stringify(hit));

    // 7. pause freezes the simulation; resume continues it
    await page.keyboard.press('KeyP'); await wait(60);
    s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses and shows the pause card');
    await wait(400); expect((await st()).t === s.t, 'time is frozen while paused');
    await page.locator('#bResume').tap(); await wait(300);
    const r = await st(); expect(!r.paused && r.t > s.t, 'resume continues');
    await page.locator('#bPause').tap(); await wait(60); expect((await st()).paused, 'pause button pauses'); await page.keyboard.press('Escape'); await wait(60); expect(!(await st()).paused, 'Esc resumes');

    // 8. the dark wins when the glow runs out; best score is stored
    const end = await page.evaluate(() => { const g = window.__gdl; g.steer(0, 0); const g0 = g.state.glow; g.advance(2); const g1 = g.state.glow; for (let i = 0; i < 400 && g.state.mode !== 'over'; i++) g.advance(0.25); g.advance(1.3); g.steer(null); return { g0, g1, s: g.state }; });
    expect(end.g1 < end.g0 - 2, 'glow fades over time on night 2 (' + end.g0.toFixed(1) + ' → ' + end.g1.toFixed(1) + ')');
    expect(end.s.mode === 'over', 'run ends when the glow is gone');
    await wait(200);
    expect(await page.locator('#ovOver').isVisible(), 'game-over card shown');
    expect((await page.locator('#fScore').textContent()).replace(/\D/g, '') === String(end.s.score), 'final score shown');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/neon-hagen')));
    expect(stored === end.s.score && end.s.best === end.s.score && stored > 0, 'best score persisted (' + stored + ')');

    // 9. clean restart
    await page.locator('#bAgain').tap(); await wait(200);
    s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.night === 1 && s.glow === 100 && s.flies === 0 && s.blooms === 0 && s.chain === 0 && s.shades.length === 0, 'restart resets the run');
    expect(s.best === stored && s.moons.length === 1 && !s.moons[0].open && s.buds.every(b => !b.on), 'fresh garden, best kept');
    expect(!(await page.locator('#ovOver').isVisible()), 'game-over card hidden after restart');
  },
};
