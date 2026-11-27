// Physics Charades — Pose or Splat: menu → PLAY (real tap) → wall 1's cut-out is matched with real touch taps on the arms/legs and passed
// (score, streak, best) → wall 2 is matched with the Q/E/A/D keys (Shift steps back) and slammed in early with Space for a bonus →
// a swipe down steps a limb back → a limb that is still swinging at impact does NOT fit (physics, not just state) → life lost, ragdoll,
// respawn → P pauses and freezes the wall → ignoring the remaining walls ends the run: game-over card, stored best → AGAIN restarts cleanly.
module.exports = {
  game: 'games/physics-charades.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 120000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const manual = on => page.evaluate(on => window.__gdl.manual(on), on);
    const xy = i => page.evaluate(i => window.__gdl.limbXY(i), i);
    const NST = [4, 4, 3, 3], KEYS = ['KeyQ', 'KeyE', 'KeyA', 'KeyD'];
    const waitWall = async () => { let s; for (let i = 0; i < 80 && !((s = await st()).wall && !s.wall.resolved); i++) await adv(.1); return s; };
    const toImpact = async () => { let s; for (let i = 0; i < 400 && (s = await st()).wall && !s.wall.resolved; i++) await adv(.05); return st(); };
    const steps = (s, i) => (s.wall.target[i] - s.limbs[i] + NST[i]) % NST[i];
    const matchBy = async press => { const s = await st(); for (let i = 0; i < 4; i++) for (let k = steps(s, i); k > 0; k--) { await press(i); await adv(.04); } };
    const tapLimb = async i => { const p = await xy(i); await page.touchscreen.tap(p.x, p.y); };

    // 1. menu → PLAY
    let s = await st(); expect(s.mode === 'menu' && s.best === 0 && await page.locator('#ovMenu').isVisible(), 'boots to the menu');
    await page.locator('#bPlay').tap(); await manual(true); await adv(.2); s = await st();
    expect(s.mode === 'play' && s.lives === 3 && s.score === 0 && s.limbs.join() === '0,0,0,0' && s.ready, 'run starts: 3 lives, contestant at attention');
    s = await waitWall(); const first = s.wall.word;
    expect(s.wall.p < .1 && s.wall.T > 5 && !s.wall.tarp && s.wall.target.join() !== s.limbs.join(), 'wall 1 (' + first + ') is on its way, slow, with a visible hole');
    expect((await page.locator('#wName').innerText()) === first, 'the word is shown');

    // 2. real touch taps swing the limbs into the cut-out
    const need = [0, 1, 2, 3].map(i => steps(s, i)); await tapLimb(1); await adv(.04); let q = await st();
    expect(q.limbs[1] === 1 && q.limbs[0] === 0, 'a tap on the right-arm side steps the right arm only');
    for (let k = NST[1] - 1; k > 0; k--) { await tapLimb(1); await adv(.04); }   // full circle back to where it was
    expect((await st()).limbs[1] === 0, 'four taps cycle an arm right round');
    await matchBy(tapLimb); await adv(.8); q = await st();
    expect(q.limbs.join() === s.wall.target.join() && Math.max(...q.errors) < 8, 'limbs settle into the target pose (errors ' + q.errors + ', ' + need.reduce((a, b) => a + b) + ' taps)');
    s = await toImpact();
    expect(s.last.pass && s.last.word === first && s.score === 100 && s.streak === 1 && s.passed === 1 && s.lives === 3, 'wall 1 passed for 100');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/physics-charades'))) === 100, 'best stored');

    // 3. keyboard + BRING IT (Space) bonus
    s = await waitWall(); expect(s.wall.word !== first && s.wall.T < 5.6, 'wall 2 (' + s.wall.word + ') is a new pose and a little faster');
    await page.keyboard.press('KeyQ'); await adv(.03); await page.keyboard.press('Shift+KeyQ'); await adv(.03); expect((await st()).limbs[0] === s.limbs[0], 'Q steps the left arm, Shift+Q steps it back');
    await matchBy(i => page.keyboard.press(KEYS[i])); await adv(.9); q = await st(); expect(q.limbs.join() === q.wall.target.join() && q.wall.p < .5, 'pose keyed in with time to spare');
    await page.keyboard.press('Space'); await adv(.05); expect((await st()).wall.fast, 'Space slams the wall forward');
    s = await toImpact(); expect(s.last.pass && s.last.slam && s.last.bonus >= 60 && s.streak === 2, 'early slam passes with a bonus (+' + s.last.bonus + ')');
    expect(s.score === 100 + s.last.pts && s.last.pts === Math.round((100 + s.last.bonus) * 1.1 / 5) * 5, 'score = (100 + bonus) × streak 1.1 → ' + s.last.pts);

    // 4. swipe down steps a limb back; a limb still swinging at impact does not fit
    s = await waitWall(); await matchBy(tapLimb); await adv(.3);
    const cdp = await page.context().newCDPSession(page), p0 = await xy(0), before = (await st()).limbs[0];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p0.x, y: p0.y, id: 1 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p0.x, y: p0.y + 60, id: 1 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await adv(.03);
    expect((await st()).limbs[0] === (before + NST[0] - 1) % NST[0], 'swipe down steps the left arm back one position');
    await tapLimb(0); await adv(.5); q = await st(); expect(q.limbs.join() === q.wall.target.join(), 'and a tap puts it right again');
    for (let i = 0; i < 400 && (await st()).wall.p < .97; i++) await adv(1 / 60);
    await tapLimb(0); await adv(.08); for (let k = 1; k < NST[0]; k++) { await tapLimb(0); await adv(1 / 60); }   // a last-moment fidget: all the way round, ending on the right position…
    q = await st(); expect(q.limbs.join() === q.wall.target.join() && q.errors[0] > 26 && !q.wall.resolved, '…but the arm is still mid-swing (' + q.errors[0] + '° off)');
    s = await toImpact();
    expect(!s.last.pass && s.last.ok[0] === false && s.last.ok.slice(1).every(Boolean), 'the wobbling arm clips the wall: SPLAT (' + JSON.stringify(s.last.ok) + ')');
    expect(s.lives === 2 && s.streak === 0 && s.rag, 'life lost, streak reset, contestant goes limp');
    const scoreAfter = s.score; await adv(.6); q = await st(); expect(q.pelvisY > -60 || Math.abs(q.pelvisY + 92) > 30, 'the ragdoll is knocked off the podium (pelvis y ' + q.pelvisY.toFixed(0) + ')');
    for (let i = 0; i < 60 && !((q = await st()).ready && !q.rag); i++) await adv(.1);
    await adv(.6); q = await st();
    expect(q.ready && !q.rag && q.limbs.join() === '0,0,0,0' && Math.abs(q.pelvisY + 92) < 8, 'a fresh contestant drops back onto the podium');

    // 5. pause freezes the wall (real time)
    await waitWall(); await manual(false); await wait(200); await page.keyboard.press('KeyP'); await wait(60); s = await st();
    expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses'); await wait(300); expect((await st()).wall.p === s.wall.p, 'wall frozen while paused');
    await page.locator('#bResume').tap(); await wait(250); expect(!(await st()).paused && (await st()).wall.p > s.wall.p, 'resume continues');

    // 6. ignore the rest: two more splats end the run
    await manual(true); for (let i = 0; i < 600 && (s = await st()).mode !== 'over'; i++) await adv(.1);
    expect(s.mode === 'over' && s.lives === 0 && s.score === scoreAfter && s.best === scoreAfter && s.passed === 2, 'three splats → game over with ' + s.score);
    expect(await page.locator('#ovOver').isVisible() && (await page.locator('#oScore').innerText()) === String(s.score) && (await page.locator('#oWalls').innerText()) === '2', 'game-over card shows score and walls');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/physics-charades'))) === s.best, 'best persisted');

    // 7. AGAIN restarts cleanly
    await page.locator('#bAgain').tap(); await adv(.2); q = await st();
    expect(q.mode === 'play' && q.score === 0 && q.lives === 3 && q.streak === 0 && q.passed === 0 && q.walls === 0 && q.best === s.best && q.limbs.join() === '0,0,0,0' && !q.rag && q.ready, 'fresh run, best kept');
    q = await waitWall(); expect(q.wall.word === first && q.wall.T > 5.5, 'same seed deals the same first wall again');
  }
};
