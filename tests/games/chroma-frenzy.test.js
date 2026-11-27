// Chroma Frenzy: menu → PLAY (real tap) → a real touch drag steers the blob under the first coral stream (drag does not flip),
// catches score and build the streak → a quick tap flips coral→blue, a second finger flips the instant it lands, mouse click
// and Space flip too, arrows steer → touching the wrong ink costs a life, the streak, the multiplier and some tempo → a
// scripted player (mouse to steer, Space to flip) rides the multiplier up and fills the meter: FRENZY makes every shape food
// and gives a life back → pause freezes the run → playing the wrong ink on purpose ends it: MISPRINT card, best stored →
// PLAY AGAIN restarts cleanly with the same seeded print run.
module.exports = {
  game: 'games/chroma-frenzy.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const scr = (x, y) => page.evaluate(([x, y]) => window.__gdl.toScreen(x, y), [x, y]);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const next = s => { let t = null; for (const d of s.drops) if (d.k === 0 && d.y < s.py - 3 && (!t || d.y > t.y)) t = d; return t; };
    // scripted player: real mouse moves to steer, real Space presses to flip; `bad` wears the wrong ink on purpose
    const play = async (secs, bad, until) => { let s = await st();
      for (let i = 0; i < secs * 20 && s.mode === 'play'; i++) {
        let t = null; for (const d of s.drops) if (d.k === 0 && d.y < s.py - 3 && d.y > s.py - 90 && (!t || d.y > t.y)) t = d;
        let want = s.color, tx = s.tx; if (t) { tx = t.x; if (bad) want = t.c ^ 1; else if (s.py - t.y < 30) want = t.c; }
        if (!bad) for (const b of s.bars) if (!b.done && b.y < s.py && s.py - b.y < 22 && tx >= b.x0 && tx <= b.x1) want = b.c;
        if (s.frenzy > 0) want = s.color;
        if (want !== s.color) await page.keyboard.press('Space');
        const p = await scr(tx, s.py); await page.mouse.move(p.x, p.y); await adv(.05); s = await st(); if (until && until(s)) break; }
      return s; };

    // 1. menu → PLAY
    let s = await st(); expect(s.mode === 'menu', 'boots to the menu (attract mode behind it)');
    await page.evaluate(() => window.__gdl.manual(true)); await page.locator('#bPlay').tap(); await wait(100); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.lives === 3 && s.mult === 1 && s.color === 0 && s.streak === 0 && s.drops.length === 0, 'run starts: coral blob, 3 lives, ×1, empty sheet');
    const sc = (await scr(1, 0)).x - (await scr(0, 0)).x;

    // 2. a real touch drag steers (relative), and a drag is not a flip
    for (let i = 0; i < 80 && !(next(await st()) && next(await st()).y > 30); i++) await adv(.1);
    s = await st(); let t = next(s); expect(t && t.c === 0, 'the first stream is coral — your ink');
    const run1 = { x: s.drops[0].x, n: s.drops.length };
    let f = await scr(s.x, s.py + 20); await touch('touchStart', [{ x: f.x, y: f.y, id: 1 }]); await wait(40);
    const steer = async x => { const cur = await st(); f.x += (x - cur.tx) * sc / 1.25; await touch('touchMove', [{ x: f.x, y: f.y, id: 1 }]); await wait(20); };
    await steer(t.x); s = await st(); expect(Math.abs(s.tx - t.x) < 1.5 && s.color === 0 && s.flips === 0, 'dragging moves the blob under the stream without flipping');
    for (let i = 0; i < 120 && (await st()).catches < 3; i++) { s = await st(); t = next(s); if (t) await steer(t.x); await adv(.05); }
    s = await st(); expect(s.catches >= 3 && s.score === s.catches * 10 && s.streak === s.catches && s.hits === 0, 'swallowing your ink scores 10 each and builds the streak (' + s.score + ')');
    await wait(260); await touch('touchEnd', []); await wait(40); expect((await st()).flips === 0, 'lifting after a drag does not flip');

    // 3. flipping: quick tap, second finger, mouse click, Space; arrows steer
    f = await scr(50, s.py + 20); await touch('touchStart', [{ x: f.x, y: f.y, id: 1 }]); await touch('touchEnd', []); await wait(60);
    s = await st(); expect(s.color === 1 && s.flips === 1 && s.snapT > 0, 'a quick tap flips coral → blue and opens the snap window');
    await touch('touchStart', [{ x: f.x, y: f.y, id: 1 }]); await wait(30); expect((await st()).color === 1, 'a resting finger does nothing yet');
    await touch('touchStart', [{ x: f.x, y: f.y, id: 1 }, { x: f.x + 90, y: f.y, id: 2 }]); await wait(40); expect((await st()).color === 0, 'a second finger flips the instant it lands');
    await wait(260); await touch('touchEnd', []); await wait(40); expect((await st()).color === 0, 'slow lifts do not flip');
    const mp = await scr(40, s.py); await page.mouse.move(mp.x, mp.y); await page.mouse.down(); await wait(30); await page.mouse.up(); s = await st(); expect(s.color === 1 && Math.abs(s.tx - 40) < 1, 'mouse: move steers, click flips');
    await page.keyboard.press('Space'); expect((await st()).color === 0, 'Space flips');
    await page.keyboard.down('ArrowRight'); await wait(30); await adv(.2); await page.keyboard.up('ArrowRight'); expect((await st()).tx > 55, 'arrow keys steer');

    // 4. the wrong ink costs a life, the streak, the multiplier and some tempo
    s = await play(30, false, s => s.streak >= 9 && s.mult >= 2); expect(s.mult === 2 && s.streak >= 8 && s.hits === 0, 'eight in a row reaches ×2 (streak ' + s.streak + ')');
    expect((await page.locator('#mu').textContent()).startsWith('×2'), 'HUD shows ×2'); const before = s;
    s = await play(20, true, s => s.hits >= 1);
    expect(s.hits === 1 && s.lives === 2 && s.streak === 0 && s.mult === 1 && s.inv > 0 && s.tempo < before.tempo && s.score >= before.score, 'wrong ink: life lost, streak and multiplier gone, the run slows down');

    // 5. play well: multiplier climbs, meter fills, FRENZY turns everything into food and returns a life
    s = await play(60, false, s => s.frenzy > 0); expect(s.frenzy > 0 && s.frenzies === 1 && s.meter === 0 && s.lives === 3, 'meter full → FRENZY, life restored');
    const inF = s; s = await play(8, false, s => s.frenzy <= 0);
    expect(s.hits === inF.hits && s.catches > inF.catches + 4 && s.score > inF.score && s.frenzy === 0, 'during frenzy both inks are swallowed safely (' + (s.catches - inF.catches) + ' eaten)');
    expect(s.topMult >= 3 && s.bestStreak >= 18, 'the multiplier kept climbing (top ×' + s.topMult + ')');

    // 6. pause freezes the run (real time)
    await page.evaluate(() => window.__gdl.manual(false)); await wait(100);
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
    await wait(350); expect((await st()).t === s.t, 'clock frozen while paused');
    await page.locator('#bResume').tap(); await wait(250); const r = await st(); expect(!r.paused && r.t > s.t, 'resume continues');
    const m0 = r.muted; await page.keyboard.press('KeyM'); expect((await st()).muted !== m0, 'M toggles mute'); await page.keyboard.press('KeyM');
    await page.evaluate(() => window.__gdl.manual(true));

    // 7. wear the wrong ink until the run ends
    s = await play(120, true); expect(s.mode === 'dying' && s.lives === 0, 'third wrong ink ends the run');
    await adv(1.1); await wait(120); s = await st(); expect(s.mode === 'over' && await page.locator('#ovOver').isVisible(), 'MISPRINT card');
    expect((await page.locator('#fScore').textContent()).replace(/,/g, '') === String(s.score) && s.score > 500, 'final score shown (' + s.score + ')');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/chroma-frenzy')));
    expect(stored === s.score && s.best === stored, 'best persisted (' + stored + ')');

    // 8. clean restart, same seeded print run
    await page.locator('#bAgain').tap(); await wait(100); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.lives === 3 && s.mult === 1 && s.streak === 0 && s.color === 0 && s.tempo === 1 && s.meter === 0 && s.frenzy === 0 && s.drops.length === 0 && s.bars.length === 0 && s.best === stored, 'restart resets everything and keeps the best');
    expect(!(await page.locator('#ovOver').isVisible()), 'card gone');
    for (let i = 0; i < 80 && !(next(await st()) && next(await st()).y > 30); i++) await adv(.1);
    s = await st(); expect(s.drops[0].x === run1.x && s.drops.length === run1.n, 'same seed prints the same first stream');
  },
};
