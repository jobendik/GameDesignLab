// Sprouty's Garden: menu → PLAY (real tap) → real taps plant, water and harvest a radish (coins/score/order move) → a real
// swipe plants, waters and harvests a row for a combo → locked seeds, empty can, wilting, slugs (bonk twice / left alone they
// eat), keyboard cursor, pause → sunset: order filled → night shop purchase → day 2 unlocks carrots → missed orders cost
// leaves until Sprouty wilts → best score stored → PLAY AGAIN restarts cleanly.
module.exports = {
  game: 'games/sproutys-garden.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 120000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const xy = i => page.evaluate(i => window.__gdl.plotXY(i), i);
    const tapPlot = async i => { const p = await xy(i); await page.touchscreen.tap(p.x, p.y); await wait(40); };
    const cdp = await page.context().newCDPSession(page);
    const swipe = async ids => { const pts = []; for (const i of ids) pts.push(await xy(i));
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0].x, y: pts[0].y, id: 1 }] });
      for (let k = 1; k < pts.length; k++) for (let j = 1; j <= 4; j++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pts[k - 1].x + (pts[k].x - pts[k - 1].x) * j / 4, y: pts[k - 1].y + (pts[k].y - pts[k - 1].y) * j / 4, id: 1 }] }); await wait(16); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(40); };

    // 1. splash → PLAY
    let s = await st(); expect(s.mode === 'menu', 'boots to the menu');
    await page.locator('#bPlay').tap(); await wait(150);
    s = await st();
    expect(s.mode === 'day' && s.day === 1 && s.coins === 10 && s.leaves === 3 && s.score === 0 && s.water === 5 && s.quota === 40, 'day 1 starts fresh ' + JSON.stringify({ c: s.coins, w: s.water, q: s.quota }));
    expect(s.plots.every(p => !p) && s.pests.length === 0, 'empty garden, no pests');
    await page.evaluate(() => window.__gdl.holdPests(200));   // pests are spawned explicitly below so the script stays deterministic

    // 2. plant → water → grow → harvest with real taps
    await tapPlot(5); s = await st();
    expect(s.plots[5] && s.plots[5].type === 'radish' && s.plots[5].thirsty && s.coins === 8, 'tap plants a radish for 2 coins');
    await adv(1); expect((await st()).plots[5].g === 0, 'a thirsty seed does not grow');
    await tapPlot(5); s = await st();
    expect(!s.plots[5].thirsty && Math.floor(s.water) === 4, 'second tap waters it and uses the can');
    await adv(3); s = await st(); expect(s.plots[5].g > 0.4 && !s.plots[5].ripe, 'it grows over time');
    await tapPlot(5); expect((await st()).plots[5] && (await st()).coins === 8, 'tapping a growing plant does nothing');
    await adv(3.2); expect((await st()).plots[5].ripe, 'radish ripens after ~6 s');
    await tapPlot(5); s = await st();
    expect(!s.plots[5] && s.coins === 14 && s.earned === 6 && s.score === 6 && s.harvested === 1, 'harvest pays 6 coins toward the order');

    // 3. swipes: plant a row, water it, harvest it as a combo (portrait screen row = plots 0,4,8)
    const row = [0, 4, 8];
    await swipe(row); s = await st(); expect(row.every(i => s.plots[i] && s.plots[i].thirsty) && s.coins === 8, 'one swipe plants three plots');
    await swipe(row); s = await st(); expect(row.every(i => !s.plots[i].thirsty), 'one swipe waters three plots');
    await adv(6.3); await swipe(row); s = await st();
    expect(row.every(i => !s.plots[i]) && s.harvested === 4 && s.bestCombo === 3, 'one swipe harvests three (combo ' + s.bestCombo + ')');
    expect(s.earned === 6 + 6 + 7 + 7, 'combo multiplies value: 6, 6×1.1→7, 6×1.2→7 (earned ' + s.earned + ')');

    // 4. locked seed, empty can, wilting, shovel
    await page.locator('#seed-carrot').tap(); expect((await st()).sel === 'radish', 'carrot is locked on day 1');
    await adv(8);
    const six = [0, 1, 2, 4, 6, 8]; for (const i of six) await tapPlot(i); for (const i of six) await tapPlot(i);
    s = await st(); expect(six.filter(i => s.plots[i] && !s.plots[i].thirsty).length === 5 && s.plots[8].thirsty && s.water < 1, 'the can only holds 5 splashes');
    await adv(1.7); await tapPlot(8); expect(!(await st()).plots[8].thirsty, 'the can refills over time');
    await tapPlot(9); await adv(15.3); s = await st(); expect(s.plots[9] && s.plots[9].dead, 'an unwatered seed wilts');
    await tapPlot(9); expect(!(await st()).plots[9], 'tapping a wilted plant clears it');
    for (const i of six) await tapPlot(i); s = await st(); expect(six.every(i => !s.plots[i]) && s.earned >= 40, 'order filled by harvesting (' + s.earned + ')');

    // 5. pests: a slug takes two taps; one left alone eats a crop
    await tapPlot(10); await tapPlot(10);
    await page.evaluate(() => window.__gdl.spawn('slug')); await adv(0.5);
    s = await st(); expect(s.pests.length === 1 && s.pests[0].hp === 2 && s.pests[0].target === 10, 'slug heads for the crop');
    const c0 = s.coins; let p = await page.evaluate(() => window.__gdl.pestXY(0)); await page.touchscreen.tap(p.x, p.y); await wait(40);
    s = await st(); expect(s.pests.length === 1 && s.pests[0].hp === 1, 'first tap stuns the slug');
    await adv(0.3); p = await page.evaluate(() => window.__gdl.pestXY(0)); await page.touchscreen.tap(p.x, p.y); await wait(40);
    s = await st(); expect(s.pests.length === 0 && s.coins === c0 + 2, 'second tap squashes it (+2)');
    await page.evaluate(() => window.__gdl.spawn('slug'));
    let eaten = false; for (let k = 0; k < 60 && !eaten; k++) { await adv(0.5); s = await st(); eaten = !s.plots[10]; if (!s.pests.length && !eaten) await page.evaluate(() => window.__gdl.spawn('slug')); }
    expect(eaten && s.harvested === 10, 'an ignored slug eats the crop (harvested ' + s.harvested + ')');
    await page.evaluate(() => { const g = window.__gdl; for (let k = 0; k < 8 && g.state.pests.length; k++) { const q = g.pestXY(0), o = { clientX: q.x, clientY: q.y, pointerId: 7, pointerType: 'touch', bubbles: true }, el = document.getElementById('cv'); el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o)); g.advance(0.25); } });

    // 6. keyboard: cursor, plant, shovel
    await page.keyboard.press('ArrowRight'); s = await st(); expect(s.cursor === 5, 'first arrow shows the cursor');
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowRight'); s = await st(); expect(s.cursor === 10 || s.cursor === 6 + 4, 'arrows move the cursor (' + s.cursor + ')');
    const cur = s.cursor; await page.keyboard.press('Space'); s = await st(); expect(s.plots[cur] && s.plots[cur].type === 'radish', 'Space plants at the cursor');
    await page.keyboard.press('Digit6'); expect((await st()).sel === 'shovel', '6 selects the shovel');
    await page.keyboard.press('Space'); expect(!(await st()).plots[cur], 'shovel digs the plant up');
    await page.keyboard.press('Digit1'); expect((await st()).sel === 'radish', '1 selects radish');

    // 7. pause
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
    await wait(350); expect((await st()).time === s.time, 'clock frozen while paused');
    await page.locator('#bResume').tap(); await wait(250); expect(!(await st()).paused && (await st()).time < s.time, 'resume continues');

    // 8. sunset with the order filled → night shop → day 2
    s = await st(); const earned = s.earned, score0 = s.score; await adv(s.time + 0.1); s = await st();
    expect(s.mode === 'night' && s.leaves === 3 && s.score > score0, 'sunset: order ' + earned + '/40 filled, no leaf lost, day bonus scored');
    await adv(1.2); await wait(100); expect(await page.locator('#ovNight').isVisible(), 'night shop shown');
    expect(s.offers.length === 3 && await page.locator('.offer').count() === 3, 'three upgrades on offer');
    const pick = await page.evaluate(() => { const g = window.__gdl, s = g.state; const els = [...document.querySelectorAll('.offer')]; const i = els.findIndex(e => !e.classList.contains('poor')); return { i, k: i >= 0 ? s.offers[i] : null, coins: s.coins }; });
    if (pick.i >= 0) { await page.locator('.offer').nth(pick.i).tap(); await wait(60); s = await st(); expect(s.up[pick.k] === 1 && s.coins < pick.coins, 'bought ' + pick.k + ' with coins'); }
    await page.locator('#bNext').tap(); await wait(150); s = await st();
    expect(s.mode === 'day' && s.day === 2 && s.quota === 110 && s.earned === 0 && Math.abs(s.time - 50) < 1, 'day 2 starts with a bigger order');
    await page.locator('#seed-carrot').tap(); expect((await st()).sel === 'carrot', 'carrots unlock on day 2');

    // 9. missed orders cost leaves; at zero the run ends and the best score is stored
    const leaves = [];
    for (let d = 0; d < 5; d++) { s = await st(); if (s.mode !== 'day') break; await adv(s.time + 0.1); s = await st(); leaves.push(s.leaves); if (s.mode === 'night') { await adv(1.2); await page.locator('#bNext').tap(); await wait(80); } }
    expect(leaves.join() === '2,1,0', 'each missed order costs a leaf (' + leaves.join() + ')');
    s = await st(); expect(s.mode === 'over' && s.day === 4, 'no leaves left ends the run on day 4');
    await adv(1.6); await wait(100); expect(await page.locator('#ovOver').isVisible(), 'game-over card shown');
    expect((await page.locator('#fScore').textContent()).replace(/\D/g, '') === String(s.score), 'final score shown');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/sproutys-garden')));
    expect(stored === s.score && s.best === s.score && stored > 40, 'best score persisted (' + stored + ')');

    // 10. clean restart
    await page.locator('#bAgain').tap(); await wait(200); s = await st();
    expect(s.mode === 'day' && s.day === 1 && s.coins === 10 && s.leaves === 3 && s.score === 0 && s.earned === 0 && s.harvested === 0 && s.sel === 'radish', 'restart resets the run');
    expect(s.plots.every(q => !q) && s.pests.length === 0 && Object.values(s.up).every(v => v === 0) && s.best === stored, 'garden, pests and upgrades cleared; best kept');
    expect(!(await page.locator('#ovOver').isVisible()) && await page.locator('#tray').isVisible(), 'back in play');
  },
};
