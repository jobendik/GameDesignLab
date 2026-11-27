// Unicorn Magic Sort (merge-sort): menu → PLAY (real tap) → lift / put back / empty-jar refusal → tutorial fuse grants wish 1 →
// win card, stars, wand reward, best stored → wish 2+ solved by real taps (charms fuse, DOM matches the model) → refused drop,
// undo, hint (caps rating), wand (grows a charm, undo refunds it) → sleepy charms cannot be lifted → keyboard + pause + restart
// → Rainbow Rush: seeded gifts, drops score through fusions, sparkle swap, jars fill → game over, best stored, clean replay →
// progress survives a reload.
module.exports = {
  game: 'games/unicorn-magic-sort.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait, url }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const settle = () => page.evaluate(() => window.__gdl.settle());
    const tap = async j => { const p = await page.evaluate(j => window.__gdl.jarXY(j), j); await page.touchscreen.tap(p.x, p.y); await wait(25); };
    const can = (i, j) => page.evaluate(([i, j]) => window.__gdl.canMove(i, j), [i, j]);
    const flat = s => JSON.stringify(s.jars.map(a => a.map(c => c.t + (c.z ? 'z' : ''))));
    const count = s => s.jars.reduce((n, a) => n + a.length, 0);
    const solveByTaps = async () => { const sol = await page.evaluate(() => window.__gdl.solve()); expect(sol && sol.length, 'solver finds a route'); for (const [a, b] of sol) { await tap(a); await tap(b); } return sol.length; };
    const winCard = async () => { await settle(); await wait(80); expect(await page.locator('#winOv').isVisible(), 'win card shown'); };

    // 1. menu → PLAY
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#menu').isVisible(), 'boots to the menu');
    await page.locator('#bPlay').tap(); await wait(200); s = await st();
    expect(s.mode === 'wish' && s.level === 1 && s.moves === 0 && s.target === 2 && s.need === 1 && s.made === 0 && s.wands === 3, 'wish 1: make a Blossom');
    expect(count(s) === 2 && s.jars.flat().every(c => c.t === 1) && s.hint && s.domCharms === 2, 'two dewdrops on the board, tutorial hint showing');

    // 2. lifting rules
    const empty = s.jars.findIndex(a => !a.length), [ha, hb] = s.hint;
    await tap(empty); expect((await st()).sel === -1, 'an empty jar has nothing to lift');
    await tap(ha); expect((await st()).sel === ha, 'tap lifts the top charm');
    await tap(ha); expect((await st()).sel === -1, 'tap again puts it back');

    // 3. the first fuse grants the wish
    await tap(ha); await tap(hb); s = await st();
    expect(s.moves === 1 && s.won && s.made === 1 && count(s) === 1 && s.jars[hb][s.jars[hb].length - 1].t === 2, 'two dewdrops fused into a blossom');
    expect(s.pending > 0, 'the fuse animation is playing'); await winCard(); s = await st();
    expect(s.domCharms === 1 && s.stars[1] === 3 && s.cleared === 1 && s.wands === 4, 'three stars, a bonus wand, one charm left in the DOM');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/unicorn-magic-sort'))) === 1, 'best = highest wish granted');

    // 4. next wishes by real taps (each has more charms than the wish needs: they must fuse)
    await page.locator('#bNext').tap(); await wait(200); s = await st();
    expect(s.level === 2 && s.moves === 0 && !s.won && s.target === 3 && !(await page.locator('#winOv').isVisible()), 'wish 2 starts clean');
    await solveByTaps(); await winCard(); expect((await st()).cleared === 2, 'wish 2 granted');
    await page.locator('#bNext').tap(); await wait(200); const before3 = count(await st()), n3 = await solveByTaps(); s = await st();
    expect(s.won && s.made >= 1 && count(s) < before3 && s.moves === n3, 'wish 3 granted: ' + before3 + ' charms fused down to ' + count(s)); await winCard();
    expect((await st()).domCharms === count(await st()), 'DOM charms match the model after the show');

    // 5. wish 9: refused drop, undo, hint, wand
    await page.evaluate(() => window.__gdl.goto(9)); await wait(200); s = await st(); const start9 = flat(s);
    let pair = null; for (let i = 0; i < s.jars.length && !pair; i++) for (let j = 0; j < s.jars.length; j++) if (i !== j && s.jars[i].length && !s.jars[i][s.jars[i].length - 1].z && !(await can(i, j))) { pair = [i, j]; break; }
    if (pair) { await tap(pair[0]); await tap(pair[1]); s = await st(); expect(s.moves === 0 && flat(s) === start9 && s.sel === pair[0], 'a full jar refuses a charm that is not a twin'); await tap(pair[0]); }
    const m0 = (await page.evaluate(() => window.__gdl.solve()))[0]; await tap(m0[0]); await tap(m0[1]); s = await st(); expect(s.moves === 1 && flat(s) !== start9, 'a move was made');
    await page.locator('#bUndo').tap(); await wait(40); s = await st(); expect(s.moves === 0 && flat(s) === start9, 'undo restores the jars');
    expect(s.rating === 3, 'rating starts at three stars');
    await page.locator('#bHint').tap(); await wait(40); s = await st(); expect(s.hint && (await can(s.hint[0], s.hint[1])) && s.capped && s.rating === 2, 'hint shows a legal move and caps the rating at two stars');
    const wj = s.jars.findIndex(a => a.length && a[a.length - 1].t < 7), w0 = s.wands, before = count(s), topT = s.jars[wj][s.jars[wj].length - 1].t;
    await page.locator('#bWand').tap(); await wait(40); expect((await st()).wandArmed, 'wand armed');
    await tap(wj); s = await st(); const nowTop = s.jars[wj][s.jars[wj].length - 1].t;
    expect(s.wands === w0 - 1 && s.moves === 1 && !s.wandArmed && (nowTop > topT || count(s) < before), 'wand grew the top charm (' + topT + ' → ' + nowTop + ')');
    await page.keyboard.press('KeyZ'); await wait(40); s = await st(); expect(s.wands === w0 && flat(s) === start9, 'undo refunds the wand');

    // 6. sleepy charms (wish 11+)
    await page.evaluate(() => window.__gdl.goto(17)); await wait(200); s = await st();
    const sleepy = s.jars.flat().filter(c => c.z).length; expect(sleepy >= 1, 'wish 17 has sleepy charms (' + sleepy + ')');
    const zj = s.jars.findIndex(a => a.length && a[a.length - 1].z);
    if (zj >= 0) { await tap(zj); expect((await st()).sel === -1, 'a sleepy charm cannot be lifted'); }
    await solveByTaps(); s = await st(); expect(s.won && s.made >= s.need, 'sleepy wish granted'); await winCard();

    // 7. keyboard, pause, restart
    await page.evaluate(() => window.__gdl.goto(5)); await wait(200); s = await st(); const start5 = flat(s);
    await page.keyboard.press('ArrowRight'); const c0 = (await st()).cursor; await page.keyboard.press('ArrowRight'); expect((await st()).cursor !== c0, 'arrows move the cursor');
    const liftable = s.jars.findIndex(a => a.length && !a[a.length - 1].z); await page.keyboard.press(String(liftable + 1)); expect((await st()).sel === liftable, 'number keys lift from a jar');
    await page.keyboard.press('Escape'); expect((await st()).sel === -1 && !(await st()).paused, 'Esc puts the charm back first');
    await page.keyboard.press('KeyP'); await wait(60); expect((await st()).paused && await page.locator('#pauseOv').isVisible(), 'P pauses');
    await page.keyboard.press('Escape'); await wait(60); expect(!(await st()).paused, 'Esc resumes');
    const m5 = (await page.evaluate(() => window.__gdl.solve()))[0]; await tap(m5[0]); await tap(m5[1]); expect((await st()).moves === 1, 'moved');
    await page.keyboard.press('KeyR'); await wait(200); s = await st(); expect(s.moves === 0 && flat(s) === start5 && !s.capped, 'restart resets the wish');

    // 8. Rainbow Rush
    await page.keyboard.press('KeyP'); await wait(60); await page.locator('#bPMenu').tap(); await wait(100); expect((await st()).mode === 'menu', 'back at the menu');
    await page.locator('#bRush').tap(); await wait(200); s = await st();
    expect(s.mode === 'rush' && s.score === 0 && s.sparkles === 3 && s.gift >= 1 && s.next >= 1 && count(s) === 5 && s.jars.length === 5, 'rush starts with five jars and a gift');
    const firstGifts = [s.gift, s.next];
    const twin = s.jars.findIndex(a => a.length && a[a.length - 1].t === s.gift), g0 = s.gift;
    if (twin >= 0) { await tap(twin); s = await st(); expect(s.score >= 10 * (1 << g0) && count(s) === 5, 'dropping a gift on its twin fuses and scores (' + s.score + ')'); }
    else { await tap(0); s = await st(); expect(count(s) === 6 && s.score === 0, 'a gift with no twin just lands'); }
    expect(s.gift === firstGifts[1], 'the previewed charm becomes the next gift');
    let swapped = false, guard = 0;
    while (!(s = await st()).over && guard++ < 260) {       // play badly on purpose: avoid twins so the jars fill up
      let j = s.jars.findIndex((a, j) => a.length < s.cap && !(a.length && a[a.length - 1].t === s.gift));
      if (j < 0) j = await page.evaluate(() => { const g = window.__gdl; for (let j = 0; j < 5; j++) if (g.canGift(j)) return j; return -1; });
      if (j >= 0) { await tap(j); continue; }
      let mv = null; for (let i = 0; i < 5 && !mv; i++) for (let k = 0; k < 5; k++) if (await can(i, k)) { mv = [i, k]; break; }
      expect(mv && s.sparkles > 0, 'not over, so a sparkle swap must be possible');
      const sp = s.sparkles, sc = s.score; await page.locator('#bSwap').tap(); await wait(30); expect((await st()).swapArmed, 'swap armed');
      await tap(mv[0]); await tap(mv[1]); const q = await st(); expect(q.score > sc && !q.swapArmed && q.sparkles <= sp + 1, 'a swap fuses twins and scores'); swapped = true;
    }
    expect(s.over && s.score > 0, 'the jars filled up and the run ended (score ' + s.score + ', swapped ' + swapped + ')');
    await settle(); await wait(80); expect(await page.locator('#overOv').isVisible(), 'game-over card shown');
    expect((await page.locator('#oScore').textContent()) === String(s.score) && (await st()).rushBest === s.score, 'score shown and stored as rush best');
    const p0 = await page.evaluate(() => window.__gdl.jarXY(0)); await page.touchscreen.tap(p0.x, p0.y); await wait(30); expect(flat(await st()) === flat(s), 'no input after game over');
    await page.locator('#bAgain').tap(); await wait(200); const r = await st();
    expect(r.mode === 'rush' && !r.over && r.score === 0 && r.sparkles === 3 && count(r) === 5 && r.domCharms === 6 && r.rushBest === s.score, 'play again resets the run, best kept');
    expect(r.gift === firstGifts[0] && r.next === firstGifts[1], 'the same seed deals the same gifts');

    // 9. progress survives a reload
    await page.goto(url + '/games/unicorn-magic-sort.html?seed=7&nopause=1&mute=1'); await wait(300); s = await st();
    expect(s.mode === 'menu' && s.cleared >= 3 && s.stars[1] === 3 && s.rushBest === r.rushBest, 'progress, stars and rush best persist');
    expect(/Continue/.test(await page.locator('#bPlay').textContent()) && /best/.test(await page.locator('#bRush').textContent()), 'menu offers to continue and shows the rush best');
  },
};
