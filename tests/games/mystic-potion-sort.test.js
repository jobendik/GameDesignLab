// Mystic Potion Sort: menu → PLAY (real tap) → select / deselect / refused pour / re-select → tutorial hint pour (real taps, pour
// animation runs and settles) → undo → shelf 1 sorted by real taps → win card, stars, stardust, best stored → next shelf →
// hint + extra-vial economy → drag-to-pour → keyboard + pause → restart → paid undo → veiled shelf (layers reveal) → rune-sealed
// shelf (seal refuses, then breaks) → stubby phials → Daily Brew is seed-deterministic and pays out once → progress survives reload.
module.exports = {
  game: 'games/mystic-potion-sort.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait, url }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const xy = i => page.evaluate(i => window.__gdl.tubeXY(i), i);
    const tap = async i => { const p = await xy(i); await page.touchscreen.tap(p.x, p.y); await wait(25); };
    const can = (a, b) => page.evaluate(([a, b]) => window.__gdl.canPour(a, b), [a, b]);
    const solveByTaps = async check => { const sol = await page.evaluate(() => window.__gdl.solve()); expect(sol && sol.length, 'solver finds a route'); for (const [a, b] of sol) { await tap(a); await tap(b); if (check) await check(); } return sol.length; };
    const winCard = async () => { await adv(2); await wait(80); expect(await page.locator('#winOv').isVisible(), 'win card shown'); };
    const flat = s => JSON.stringify(s.tubes.map(t => t.c));

    // 1. menu → PLAY
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#menu').isVisible(), 'boots to the menu');
    await page.locator('#bPlay').tap(); await wait(150); s = await st();
    expect(s.mode === 'play' && s.level === 1 && s.moves === 0 && s.ess === 10 && s.par >= 2 && !s.won, 'shelf 1 starts fresh ' + JSON.stringify({ l: s.level, m: s.moves, e: s.ess }));
    expect(s.tubes.length === 3 && s.tubes[2].c.length === 0 && s.hint, 'two mixed vials, one empty, tutorial arrow showing');
    const start = flat(s);

    // 2. selection rules
    await tap(2); expect((await st()).sel === -1, 'an empty vial cannot be picked up');
    await tap(0); expect((await st()).sel === 0, 'tap selects');
    await tap(0); expect((await st()).sel === -1, 'tap again deselects');
    const top = t => t.c[t.c.length - 1];
    if (top(s.tubes[0]) !== top(s.tubes[1])) {
      await tap(0); await tap(1); s = await st();
      expect(s.moves === 0 && flat(s) === start && s.sel === 1, 'a mismatched pour is refused and the tapped vial becomes the selection');
      await tap(1);
    }

    // 3. a real pour following the tutorial arrow; the animation plays and settles
    s = await st(); const [ha, hb] = s.hint, k = await can(ha, hb), colour = top(s.tubes[ha]), lenB = s.tubes[hb].c.length; expect(k > 0, 'the hinted pour is legal');
    await tap(ha); await tap(hb); s = await st();
    expect(s.moves === 1 && s.tubes[hb].c.length === lenB + k && top(s.tubes[hb]) === colour && s.anims === 1, 'pour moved ' + k + ' measure(s) and is animating');
    await adv(1.5); expect((await st()).anims === 0, 'the pour animation finishes');

    // 4. undo
    await page.locator('#bUndo').tap(); await wait(40); s = await st();
    expect(s.moves === 0 && flat(s) === start && s.undoFree === 4, 'undo restores the shelf and uses a free undo');

    // 5. sort shelf 1 with real taps
    const n1 = await solveByTaps(); s = await st();
    expect(s.won && s.moves === n1 && s.tubes.every(t => !t.c.length || (t.c.length === 4 && t.c.every(v => v === t.c[0]))), 'every vial pure after ' + n1 + ' pours');
    await winCard(); s = await st();
    const r1 = s.rating; expect(s.stars[1] === r1 && r1 >= 1 && s.cleared === 1 && s.ess === 10 + 2 * r1, 'stars ' + r1 + ' saved, stardust paid (' + s.ess + ')');
    expect((await page.locator('#wMoves').textContent()) === String(n1), 'pour count on the card');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/mystic-potion-sort'))) === 1, 'best = highest shelf cleared');

    // 6. next shelf is clean
    await page.locator('#bNext').tap(); await wait(150); s = await st();
    expect(s.mode === 'play' && s.level === 2 && s.moves === 0 && !s.won && s.sel === -1 && !s.hint && s.undoFree === 5 && !(await page.locator('#winOv').isVisible()), 'shelf 2 starts clean');
    const tubes2 = s.tubes.length, start2 = flat(s);

    // 7. hint (free charge) and extra vial (costs stardust, caps the rating)
    await page.locator('#bHint').tap(); await wait(40); s = await st();
    expect(s.hint && s.hints === 2 && (await can(s.hint[0], s.hint[1])) > 0, 'hint shows a legal pour and uses a free charge');
    const ess0 = s.ess;
    if (ess0 >= 12) {
      await page.locator('#bVial').tap(); await wait(40); s = await st();
      expect(s.tubes.length === tubes2 + 1 && s.ess === ess0 - 12 && s.usedExtra && s.rating === 2, 'extra vial bought for 12 stardust; rating capped at 2');
      await page.locator('#bVial').tap({ force: true }).catch(() => { }); expect((await st()).tubes.length === tubes2 + 1, 'only one extra vial per shelf');
    }

    // 8. drag from one vial onto another pours in one gesture
    s = await st(); const sol = await page.evaluate(() => window.__gdl.solve()); const [da, db] = sol[0], pa = await xy(da), pb = await xy(db);
    await page.mouse.move(pa.x, pa.y); await page.mouse.down(); await page.mouse.move((pa.x + pb.x) / 2, (pa.y + pb.y) / 2); await page.mouse.move(pb.x, pb.y); await page.mouse.up(); await wait(40);
    s = await st(); expect(s.moves === 1 && s.sel === -1, 'drag-pour made one move');

    // 9. keyboard cursor + pause
    await page.keyboard.press('ArrowRight'); const c0 = (await st()).cursor; await page.keyboard.press('ArrowRight'); expect((await st()).cursor !== c0, 'arrows move the cursor');
    const pickable = s.tubes.findIndex(t => t.c.length && !(t.c.length === 4 && t.c.every(v => v === t.c[0])));
    await page.keyboard.press(String(pickable + 1)); expect((await st()).sel === pickable, 'number keys pick a vial');
    await page.keyboard.press('Escape'); expect((await st()).sel === -1 && !(await st()).paused, 'Esc drops the selection first');
    await page.keyboard.press('KeyP'); await wait(60); expect((await st()).paused && await page.locator('#pauseOv').isVisible(), 'P pauses');
    await page.keyboard.press('Escape'); await wait(60); expect(!(await st()).paused && !(await page.locator('#pauseOv').isVisible()), 'Esc resumes');

    // 10. restart, then the undo economy: five free, then 1 stardust each
    await page.keyboard.press('KeyR'); await wait(60); s = await st();
    expect(s.moves === 0 && flat(s) === start2 && s.tubes.length === tubes2 && !s.usedExtra && s.undoFree === 5, 'restart resets the shelf (extra vial gone)');
    const essU = s.ess;
    for (let i = 0; i < 6; i++) { const m = (await page.evaluate(() => window.__gdl.solve()))[0]; await tap(m[0]); await tap(m[1]); await page.keyboard.press('KeyZ'); await wait(20); }
    s = await st(); expect(s.moves === 0 && s.undoFree === 0 && s.ess === essU - 1, 'sixth undo costs 1 stardust (' + essU + ' → ' + s.ess + ')');
    await solveByTaps(); await winCard(); expect((await st()).cleared === 2, 'shelf 2 cleared');

    // 11. veiled layers: hidden until uncovered, never on top
    await page.evaluate(() => window.__gdl.goto(11)); await wait(100); s = await st();
    const veiled = s.tubes.reduce((n, t) => n + t.c.filter(v => v > 15).length, 0); expect(s.level === 11 && veiled >= 3 && s.cf.veil >= 1, 'shelf 11 has veiled layers (' + veiled + ')');
    await solveByTaps(async () => { const q = await st(); expect(q.tubes.every(t => !t.c.length || t.c[t.c.length - 1] < 16), 'an uncovered layer is revealed'); });
    s = await st(); expect(s.won && s.tubes.every(t => t.c.every(v => v < 16)), 'veiled shelf sorted, everything revealed'); await winCard();

    // 12. rune seals: locked until their colour is corked
    await page.evaluate(() => window.__gdl.goto(21)); await wait(100); s = await st();
    const sealed = s.tubes.findIndex(t => t.seal >= 0); expect(sealed >= 0, 'shelf 21 has a rune-sealed vial');
    await tap(sealed); expect((await st()).sel === -1, 'a sealed vial cannot be picked up');
    const other = s.tubes.findIndex((t, i) => i !== sealed && t.c.length); expect((await can(other, sealed)) === 0 && (await can(sealed, s.tubes.length - 1)) === 0, 'nothing pours into or out of a sealed vial');
    await solveByTaps(); s = await st(); expect(s.won && s.tubes.every(t => t.seal < 0), 'seal broke and the shelf was sorted'); await winCard();

    // 13. stubby phials are buffers only
    await page.evaluate(() => window.__gdl.goto(31)); await wait(100); s = await st();
    expect(s.tubes.some(t => t.cap < 4), 'shelf 31 has stubby phials'); await solveByTaps(); s = await st();
    expect(s.won && s.tubes.every(t => t.cap >= 4 || !t.c.length), 'sorted with the phials left empty'); await winCard();

    // 14. Daily Brew: deterministic per seed, pays once
    await page.goto(url + '/games/mystic-potion-sort.html?seed=7&nopause=1&mute=1'); await wait(300);
    expect(/Continue/.test(await page.locator('#bPlay').textContent()), 'menu offers to continue after a reload');
    s = await st(); expect(s.cleared >= 2 && s.stars[1] === r1, 'progress and stars survive a reload');
    await page.locator('#bDaily').tap(); await wait(200); s = await st(); expect(s.level === 'daily' && s.mode === 'play', 'daily brew starts');
    const dailyA = flat(s), essD = s.ess;
    await page.goto(url + '/games/mystic-potion-sort.html?seed=8&nopause=1&mute=1'); await wait(300); await page.locator('#bDaily').tap(); await wait(200);
    expect(flat(await st()) !== dailyA, 'a different seed deals a different brew');
    await page.goto(url + '/games/mystic-potion-sort.html?seed=7&nopause=1&mute=1'); await wait(300); await page.locator('#bDaily').tap(); await wait(200);
    expect(flat(await st()) === dailyA, 'the same seed deals the same brew');
    await solveByTaps(); await winCard(); s = await st();
    expect(s.daily.streak === 1 && s.daily.stars >= 1 && s.ess === essD + 10, 'daily pays 10 stardust and starts a streak');
    await page.locator('#bNext').tap(); await wait(150); expect((await st()).mode === 'menu' && /✓/.test(await page.locator('#bDaily').textContent()), 'back at the menu with the daily ticked');
    await page.locator('#bDaily').tap(); await wait(150); await solveByTaps(); await winCard();
    expect((await st()).ess === essD + 10, 'replaying the daily does not pay twice');
  },
};
