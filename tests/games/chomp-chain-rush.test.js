// Lantern Lasso (games/chomp-chain-rush.html): menu over the attract demo → a real tap on PLAY → a mouse swipe anywhere starts the
// firefly → two buffered key turns apply on the next two steps → a turn pressed just after a step re-routes that step (late grace)
// → eating three same-colour seeds FLAREs (chain shrinks, nearby moth stunned) → running into the stunned moth CHOMPs it → closing
// the chain around a moth SNAREs it → the quota clears night 1 → night 2 → a Nibbler telegraphs (chew) before it bites the chain and
// the snipped lanterns fall as seeds → a Dasher telegraphs (aim, red lane) before dashing, and sidestepping so the chain crosses the
// lane BLOCKS it → pause/resume/mute → a Stalker catches the last lantern → card, stored best → tap anywhere restarts the same seed.
module.exports = {
  game: 'games/chomp-chain-rush.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 120000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const vis = id => page.locator(id).isVisible();
    const place = o => page.evaluate(o => window.__gdl.place(o), o);
    const key = k => page.keyboard.press(k);
    // step 1/120 s until a condition (function source over s) holds
    const until = (src, max) => page.evaluate(([src, max]) => { const g = window.__gdl, f = new Function('s', 'return (' + src + ')');
      for (let i = 0; i < max * 120; i++) { if (f(g.state)) return g.state; g.advance(1 / 120); } return null; }, [src, max]);

    // 1. menu over the demo; a real tap on PLAY starts night 1
    let s = await st();
    expect(s.scene === 'menu' && s.demo && await vis('#ovMenu') && !(await vis('#bPause')), 'boots to the menu over the attract demo');
    await page.locator('#bPlay').tap(); await wait(50); await page.evaluate(() => window.__gdl.manual(true)); s = await st();
    expect(s.scene === 'play' && !s.demo && s.seed === 7 && s.round === 1 && s.score === 0 && s.hearts === 3 && s.len === 2 && !s.moving, 'night 1 started, firefly waiting');
    expect(/Swipe/.test(s.hint), 'first hint teaches steering: ' + s.hint);
    const hedges1 = JSON.stringify(s.hedges);

    // 2. a mouse swipe anywhere (up) starts the firefly at once
    await page.mouse.move(120, 700); await page.mouse.down(); await page.mouse.move(120, 640, { steps: 4 }); await page.mouse.up(); s = await st();
    expect(s.moving && s.dir === 0 && s.head.x === 5 && s.head.y === 8 && s.steps === 1, 'swipe up moved the head at once (' + JSON.stringify(s.head) + ')');

    // 3. buffered turns: two keys pressed mid-step are applied on the next two steps
    await place({ clearHedges: true, noSpawn: true, gems: [], moths: [] });
    await adv(0.1); await key('ArrowLeft'); await key('ArrowDown'); s = await st();
    expect(JSON.stringify(s.queue) === '[3,2]' && s.head.y === 8, 'two turns queued: ' + JSON.stringify(s.queue));
    s = await until('s.steps === 3', 1);
    expect(s && s.head.x === 4 && s.head.y === 9 && s.dir === 2 && s.queue.length === 0, 'queued left then down applied in order (' + JSON.stringify(s && s.head) + ')');

    // 4. late-turn grace: a turn pressed a hair after a step re-routes that step
    const before = s.head; s = await until('s.steps === 4', 1); expect(s.head.y === before.y + 1, 'stepped down');
    await key('ArrowRight'); s = await st();
    expect(s.graces === 1 && s.head.x === before.x + 1 && s.head.y === before.y && s.dir === 1, 'late right turn re-routed the step (' + JSON.stringify(s.head) + ')');

    // 5. three same-colour seeds in a row FLARE: chain shrinks, the moth within reach is stunned
    await place({ head: { x: 2, y: 3, dir: 1 }, tail: [{ x: 1, y: 3, c: 1 }, { x: 0, y: 3, c: 2 }], gems: [{ x: 3, y: 3, c: 0 }, { x: 4, y: 3, c: 0 }, { x: 5, y: 3, c: 0 }], moths: [{ k: 'stalker', x: 6, y: 2, hold: true }] });
    const sc0 = (await st()).score; await key('ArrowRight');
    s = await until('s.flares === 1', 2);
    expect(s && s.len === 2 && s.head.x === 5 && s.moths[0].st === 'stun' && s.score > sc0 + 30 && s.chain === 1, 'FLARE: chain back to 2, moth stunned, score ' + (s && s.score));
    // 6. chomp the stunned moth
    s = await until('s.head.x === 6', 1); await adv(0.08); await key('ArrowUp');
    s = await until('s.chomps === 1', 1);
    expect(s && s.caught === 1 && s.captured === 1 && s.moths.length === 0 && s.chain === 2, 'CHOMP captured the stunned moth (caught ' + (s && s.caught) + '/' + (s && s.quota) + ')');

    // 7. SNARE: lay the chain around a moth and touch it to close the loop
    await place({ head: { x: 3, y: 6, dir: 1 }, tail: [{ x: 2, y: 6, c: 0 }, { x: 1, y: 6, c: 1 }],
      gems: [{ x: 4, y: 6, c: 2 }, { x: 5, y: 6, c: 3 }, { x: 6, y: 6, c: 0 }, { x: 6, y: 7, c: 1 }, { x: 6, y: 8, c: 2 }, { x: 5, y: 8, c: 3 }], moths: [{ k: 'stalker', x: 5, y: 7, hold: true }] });
    const sc1 = (await st()).score; await key('ArrowRight');
    await until('s.head.x === 6 && s.head.y === 6', 2); await key('ArrowDown');
    await until('s.head.x === 6 && s.head.y === 8', 2); await key('ArrowLeft');
    await until('s.head.x === 4 && s.head.y === 8', 2); await adv(0.08); await key('ArrowUp');
    s = await until('s.snares === 1', 2);
    expect(s && s.loops === 1 && s.len === 1 && s.head.x === 4 && s.head.y === 6 && s.score >= sc1 + 400, 'SNARE: loop closed, 7 lanterns spent, score +' + (s && s.score - sc1));
    expect(s.caught === 2 && s.phase === 'clear', 'quota met → night 1 clear');
    s = await until("s.phase === 'play'", 3);
    expect(s && s.round === 2 && s.caught === 0 && s.quota === 3 && s.len === 2, 'night 2 begins (quota ' + (s && s.quota) + ')');

    // 8. Nibbler: chew telegraph (≥0.4 s) → bite; snipped lanterns fall as seeds
    await place({ clearHedges: true, noSpawn: true, head: { x: 5, y: 9, dir: 0 }, tail: [{ x: 5, y: 10, c: 0 }, { x: 5, y: 11, c: 1 }, { x: 5, y: 12, c: 2 }, { x: 6, y: 12, c: 3 }], gems: [], moths: [{ k: 'nibbler', x: 4, y: 12, cd: 0 }] });
    s = await until("s.moths[0].st === 'chew'", 2); const tChew = s.t;
    expect(s && s.len === 4 && s.bites === 0, 'nibbler starts chewing (telegraph) before any bite');
    s = await until('s.bites === 1', 2);
    expect(s && s.t - tChew >= 0.4 && s.len === 2 && s.gems.length === 2 && s.gems.some(g => g.x === 5 && g.y === 12 && g.c === 2), 'bite after ' + (s && (s.t - tChew).toFixed(2)) + ' s: 2 lanterns snipped and dropped as seeds');

    // 9. Dasher: aim telegraph (red lane) → dash; sidestep so the chain crosses the lane → BLOCKED
    await place({ head: { x: 5, y: 8, dir: 0 }, tail: [{ x: 5, y: 9, c: 0 }, { x: 5, y: 10, c: 1 }, { x: 5, y: 11, c: 2 }, { x: 5, y: 12, c: 3 }, { x: 4, y: 12, c: 0 }, { x: 3, y: 12, c: 1 }, { x: 2, y: 12, c: 2 }, { x: 1, y: 12, c: 3 }], gems: [], moths: [{ k: 'dasher', x: 5, y: 1, cd: 0 }] });
    s = await until("s.moths[0].st === 'aim'", 3); expect(s && s.moths[0].x === 5, 'dasher locks onto the lane (aim)'); const tAim = s.t, hearts0 = s.hearts;
    await key('ArrowLeft'); s = await st(); expect(s.head.x === 4 && s.tail[0].x === 5 && s.tail[0].y === 8, 'sidestep: the chain now crosses the lane');
    s = await until("s.moths[0].st === 'dash'", 2); expect(s && s.t - tAim >= 0.5, 'dash only after ' + (s && (s.t - tAim).toFixed(2)) + ' s of telegraph');
    s = await until("s.moths[0].st !== 'dash'", 2);
    expect(s && s.blocks === 1 && s.moths[0].st === 'stun' && s.hearts === hearts0, 'the chain BLOCKED the dash (moth stunned, no damage) ' + JSON.stringify(s && [s.moths, s.tail, s.head, s.hearts, s.blocks]));

    // 10. pause freezes the simulation; resume; mute
    await page.evaluate(() => window.__gdl.manual(false)); await wait(40);
    await key('KeyP'); await wait(50); s = await st(); expect(s.paused && await vis('#ovPause'), 'P pauses');
    await wait(250); expect((await st()).t === s.t, 'nothing moves while paused');
    await page.locator('#bResume').tap(); await page.evaluate(() => window.__gdl.manual(true)); const tR = (await st()).t; await adv(0.05); s = await st();
    expect(!s.paused && s.t > tR && !(await vis('#ovPause')), 'resume continues');
    const m0 = s.muted; await key('KeyM'); expect((await st()).muted === !m0, 'M toggles mute'); await key('KeyM');

    // 11. a Stalker catches the last lantern → run over, card, stored best
    await page.evaluate(() => window.__gdl.cheat({ hearts: 1, inv: 0, shield: 0 }));
    await place({ head: { x: 5, y: 8, dir: 0 }, tail: [{ x: 5, y: 9, c: 0 }, { x: 5, y: 10, c: 1 }], gems: [], moths: [{ k: 'stalker', x: 5, y: 4 }] });
    s = await until('!s.alive', 6);
    expect(s && s.hearts === 0 && /Stalker/.test(s.cause) && /night 2/.test(s.cause), 'caught: ' + (s && s.cause));
    await adv(1 / 60); s = await st();
    expect(s.scene === 'over' && s.overShown && await vis('#ovOver') && !(await vis('#bPause')), 'run-over card shown');
    expect((await page.locator('#oScore').textContent()).replace(/,/g, '') === String(s.score), 'card shows the score ' + s.score);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/chomp-chain-rush')));
    expect(stored === s.score && s.best === s.score && s.newBest, 'best stored: ' + stored);

    // 12. tap anywhere → same seeded garden, everything reset
    await page.touchscreen.tap(195, 820); await wait(50); s = await st();
    expect(s.scene === 'play' && s.alive && s.round === 1 && s.score === 0 && s.hearts === 3 && s.len === 2 && s.captured === 0 && s.steps === 0 && !(await vis('#ovOver')), 'restart resets the run');
    expect(JSON.stringify(s.hedges) === hedges1, 'same seed, same hedges');

    // 13. pause → MENU returns to the attract demo
    await page.locator('#bPause').tap(); await wait(40); await page.locator('#bQuit').tap(); await wait(40); s = await st();
    expect(s.scene === 'menu' && s.demo && await vis('#ovMenu'), 'back on the menu');
  },
};
