// Neon Burst: menu → PLAY (real tap) → level 1: a real touch press shows the aim ring without firing, the release drops the spark,
// the chain pops exactly what the game's own simulation predicts, the quota is beaten, the score matches the 10·k ladder and the
// one-spark clear raises the multiplier → level 2: a wasted spark leaves you SHORT, a tap spends a spare (multiplier back to ×1)
// and the level is saved → level 3: mid-chain a quick tap does NOT spend the last spare, a held press does → still short with no
// spares → OUT OF SPARKS, best stored → PLAY AGAIN restarts cleanly (same seed → same board) → keyboard aiming, pause, mute.
module.exports = {
  game: 'games/neon-burst.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 120000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const scr = (x, y) => page.evaluate(([x, y]) => window.__gdl.toScreen(x, y), [x, y]);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    const touchW = async (type, x, y) => { const p = await scr(x, y); await touch(type, p.x, p.y); await wait(50); };
    // the best spark on a bulb right now, and a spot where a spark pops nothing (both from the game's own cloned simulation)
    const bestSpark = () => page.evaluate(() => { const g = window.__gdl; let best = null; for (const b of g.bulbs(0)) { const v = g.simulate(b.x, b.y, 0); if (!best || v > best.v) best = { x: b.x, y: b.y, v }; } return best; });
    const deadSpot = () => page.evaluate(() => { const g = window.__gdl, w = g.state.world; for (let y = 30; y < w.h - 30; y += 25) for (let x = 30; x < w.w - 30; x += 25) if (g.simulate(x, y, 0) === 0 && g.simulate(x, y, .4) === 0 && g.simulate(x, y, 2.2) === 0) return { x, y }; return null; });
    const runChain = async () => { for (let i = 0; i < 200 && (await st()).phase === 'chain'; i++) await adv(.25); return st(); };

    // 1. menu → PLAY
    let s = await st(); expect(s.mode === 'menu', 'boots to the menu');
    await page.evaluate(() => window.__gdl.manual(true)); await page.locator('#bPlay').tap(); await wait(100); s = await st();
    expect(s.mode === 'play' && s.level === 1 && s.score === 0 && s.mult === 1 && s.spares === 2 && s.pops === 0, 'run starts on level 1 at ×1 with two spare sparks');
    expect(s.n >= 15 && s.quota >= 3 && s.quota < s.par && s.par <= s.n && s.alive === s.n, `level 1 board: pop ${s.quota} of ${s.n} (par ${s.par})`);
    const board1 = { n: s.n, quota: s.quota, par: s.par };
    await adv(.6); expect((await st()).phase === 'aim', 'ready to aim after the intro');

    // 2. press = aim (nothing fires), release = spark; the chain is exactly the predicted one
    const b1 = await bestSpark(); expect(b1.v >= s.quota, 'a quota-beating spark exists (' + b1.v + ')');
    await touchW('touchStart', b1.x, b1.y); s = await st();
    expect(s.aim.on && s.phase === 'aim' && s.sparks === 0 && s.blasts === 0 && Math.hypot(s.aim.x - b1.x, s.aim.y - b1.y) < 2, 'holding shows the ring where the finger is and does not fire');
    await touch('touchEnd'); await wait(60); s = await st();
    expect(s.phase === 'chain' && s.sparks === 1 && s.blasts === 1 && !s.aim.on, 'release drops the spark');
    await adv(.5); s = await st(); expect(s.pops > 0 && s.score > 0 && s.blasts > 1, 'bulbs caught by the blast burst too (' + s.pops + ' so far)');
    s = await runChain();
    expect(s.phase === 'clear' && s.pops === b1.v && s.alive === s.n - s.pops, 'chain popped ' + s.pops + ' — exactly as planned');
    const want1 = 10 * s.pops * (s.pops + 1) / 2 + (s.pops - s.quota) * 100 + (s.pops === s.n ? 1000 : s.pops >= s.par ? 500 : 0);
    expect(s.score === want1, 'score = pop ladder + surplus bonus + perfect / master-spark bonus (' + s.score + ' vs ' + want1 + ')');
    expect(s.mult === 2 && s.spares === (s.pops === s.n ? 3 : 2), 'a one-spark clear raises the multiplier to ×2');
    expect((await page.locator('#mu').textContent()) === '×2', 'HUD shows ×2');

    // 3. level 2: waste the spark → SHORT → a tap spends a spare and resets the multiplier
    await adv(1.8); s = await st(); expect(s.level === 2 && s.pops === 0 && s.sparks === 0 && s.score === want1, 'level 2 loaded');
    await adv(.6); const sp0 = s.spares; let d = await deadSpot(); expect(d, 'there is an empty spot on level 2');
    let p = await scr(d.x, d.y); await page.mouse.move(p.x, p.y); await page.mouse.down(); await wait(40); await page.mouse.up(); await wait(60);
    s = await st(); expect(s.phase === 'chain' && s.sparks === 1, 'mouse click drops a spark too');
    s = await runChain(); expect(s.phase === 'short' && s.pops === 0 && s.spares === sp0 && s.mult === 2 && s.mode === 'play', 'a wasted spark leaves the level short, nothing lost yet');
    let b2 = null; for (let i = 0; i < 12; i++) { b2 = await bestSpark(); if (b2.v >= s.quota) break; await adv(.5); }
    expect(b2.v >= s.quota, 'a saving spark exists (' + b2.v + ' ≥ ' + s.quota + ')');
    await touchW('touchStart', b2.x, b2.y); await touch('touchEnd'); await wait(60); s = await st();
    expect(s.phase === 'chain' && s.sparks === 2 && s.spares === sp0 - 1 && s.mult === 1, 'the tap spends a spare spark and the multiplier drops to ×1');
    s = await runChain(); expect(s.phase === 'clear' && s.pops === b2.v && s.mult === 1, 'level saved, but no multiplier for a two-spark clear');
    const score2 = s.score; expect(score2 > want1, 'points for level 2 banked at ×1');
    const sp1 = s.spares;

    // 4. level 3: with the spare(s) left (a perfect earns one back, so spend down to zero) — quick taps mid-chain do nothing, a held press spends it; then nothing is left
    await adv(1.8); s = await st(); expect(s.level === 3 && s.pops === 0, 'level 3 loaded');
    await adv(.6); d = await deadSpot(); expect(d, 'empty spot on level 3');
    const wasteHeld = async () => { await touchW('touchStart', d.x, d.y); await adv(.45); await touch('touchEnd'); await wait(60); };
    await touchW('touchStart', d.x, d.y); await touch('touchEnd'); await wait(60); s = await st(); expect(s.phase === 'chain' && s.sparks === 1 && s.spares === sp1, 'first spark wasted');
    await touchW('touchStart', d.x, d.y); await adv(.1); await touch('touchEnd'); await wait(60); s = await st();
    expect(s.sparks === 1 && s.spares === sp1 && s.phase === 'chain', 'a quick tap during a chain does not burn a spare');
    await wasteHeld(); s = await st(); expect(s.sparks === 2 && s.spares === sp1 - 1, 'a held press during a chain spends the spare');
    for (let k = sp1 - 1; k > 0; k--) { s = await runChain(); expect(s.phase === 'short', 'still short'); await touchW('touchStart', d.x, d.y); await touch('touchEnd'); await wait(60); }
    s = await runChain(); expect(s.phase === 'fail' && s.spares === 0 && s.pops === 0, 'short with no spares left');
    await adv(1.5); await wait(120); s = await st();
    expect(s.mode === 'over' && await page.locator('#ovOver').isVisible(), 'OUT OF SPARKS');
    expect(s.score === score2 && (await page.locator('#fScore').textContent()).replace(/,/g, '') === String(score2), 'final score shown');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/neon-burst')));
    expect(stored === score2 && s.best === score2, 'best persisted (' + stored + ')');

    // 5. clean restart: same seed → same board, everything reset
    await page.locator('#bAgain').tap(); await wait(100); s = await st();
    expect(s.mode === 'play' && s.level === 1 && s.score === 0 && s.mult === 1 && s.spares === 2 && s.pops === 0 && s.blasts === 0 && s.best === stored, 'restart resets the run and keeps the best');
    expect(s.n === board1.n && s.quota === board1.quota && s.par === board1.par && !(await page.locator('#ovOver').isVisible()), 'same seed deals the same level 1');

    // 6. keyboard: arrows move the ring, Space aims and fires on release; M mutes
    await adv(.6); s = await st(); const kx = s.aim.x;
    await page.keyboard.down('ArrowRight'); await wait(40); await adv(.25); await page.keyboard.up('ArrowRight'); s = await st();
    expect(s.aim.x > kx + 60, 'arrow keys move the aim ring (' + (s.aim.x - kx).toFixed(0) + ')');
    await page.keyboard.down('Space'); await wait(40); s = await st(); expect(s.aim.on && s.sparks === 0, 'Space held = aiming');
    await page.keyboard.up('Space'); await wait(60); s = await st(); expect(s.phase === 'chain' && s.sparks === 1, 'Space released = spark');
    const m0 = s.muted; await page.keyboard.press('KeyM'); expect((await st()).muted !== m0, 'M toggles mute'); await page.keyboard.press('KeyM');

    // 7. pause freezes the simulation (real time), resume continues
    await page.evaluate(() => window.__gdl.manual(false)); await wait(120);
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
    await wait(350); expect((await st()).t === s.t, 'clock frozen while paused');
    await page.locator('#bResume').tap(); await wait(300); const r = await st(); expect(!r.paused && r.t > s.t, 'resume continues');
    await page.locator('#bPause').tap(); await wait(60); expect((await st()).paused, 'pause button works'); await page.keyboard.press('Escape'); await wait(60); expect(!(await st()).paused, 'Esc resumes');
  },
};
