// The Grid War: menu → DEPLOY (real tap) → a mouse-pointer drag out of the core claims a line of cells and spends ink →
// a tap on a cell not touching your land is refused → a line to the map edge plus one closing cell encloses the pocket
// behind it → a planned push through neutral and red cells to the red core, holding on it until it falls → the red land
// crumbles, sector secured card → sector 2: keyboard cursor claims, P pauses and freezes the clock → idle until the
// static takes the grid → GRID LOST card, best stored → PLAY AGAIN restarts cleanly.
module.exports = {
  game: 'games/the-grid-war.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const cell = (c, r) => page.evaluate(([c, r]) => window.__gdl.cell(c, r), [c, r]);
    const scr = (c, r) => page.evaluate(([c, r]) => window.__gdl.toScreen(c, r), [c, r]);
    const moveTo = async (c, r) => { const p = await scr(c, r); await page.mouse.move(p.x, p.y, { steps: 2 }); };

    // 1. menu → DEPLOY
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#ovMenu.on').count() === 1, 'boots to the menu card');
    expect(await page.evaluate(() => getComputedStyle(document.getElementById('hud')).opacity) === '0', 'HUD hidden behind the card');
    await page.locator('#bPlay').tap(); await wait(100);
    await page.evaluate(() => window.__gdl.manual(true));
    s = await st(); expect(s.mode === 'play' && s.sector === 1 && s.score === 0 && s.you.cores === 1 && s.foe.cores === 1 && s.port, 'sector 1 in portrait with one core each');
    const core = (await page.evaluate(() => window.__gdl.cores(1)))[0], C = core.c, R = core.r;

    // 2. drag out of the core: a line of cells along the drag, each costs one ink
    const ink0 = s.ink, sc0 = s.score;
    await moveTo(C, R); await page.mouse.down();
    for (let c = C + 1; c <= C + 4; c++) { await moveTo(c, R); }
    await adv(.05); await page.mouse.up();
    s = await st(); const line = await Promise.all([2, 3, 4].map(k => cell(C + k, R)));
    expect(line.every(x => x.own === 1 && x.sup === 1), 'dragged line is claimed and linked ' + JSON.stringify(line.map(x => x.own)));
    expect(s.score - sc0 === 3 && ink0 - s.ink > 2.5, 'three new cells scored, ink spent (' + (ink0 - s.ink).toFixed(1) + ')');

    // 3. a tap on ground not touching your land is refused
    const far = await cell(C + 2, R + 4 > 15 ? R - 4 : R + 4); expect(far.own === 0 && far.valid === 0, 'far cell is neutral and not claimable');
    { const p = await scr(C + 2, R + 4 > 15 ? R - 4 : R + 4); await page.mouse.click(p.x, p.y); await adv(.05); }
    expect((await cell(C + 2, R + 4 > 15 ? R - 4 : R + 4)).own === 0, 'tap away from your land claims nothing');

    // 4. enclosure: a line along column 1 to the top edge, then one cell at (0,R) seals the strip behind it
    expect(R >= 3, 'core row leaves room for the pocket'); const e0 = (await st()).stats.enclosed, scE = (await st()).score;
    await moveTo(1, R - 1); await page.mouse.down(); for (let r = R - 2; r >= 0; r--) await moveTo(1, r); await adv(.05); await page.mouse.up();
    await adv(.6); expect((await cell(0, 0)).own === 0, 'pocket still open before it is sealed');
    { const p = await scr(0, R); await page.mouse.click(p.x, p.y); await adv(.05); }
    s = await st(); const pocket = await Promise.all(Array.from({ length: R }, (_, r) => cell(0, r)));
    expect(pocket.every(x => x.own === 1) && s.stats.enclosed - e0 >= R && s.score - scE >= R * 2, 'sealing the strip encloses ' + (s.stats.enclosed - e0) + ' cells');

    // 5. push a line to the red core (replanning when the static cuts in) and hold on it until it falls
    const plan = () => page.evaluate(() => { const g = window.__gdl, G = g.grid(), W = 28, H = 16, fc = g.cores(2)[0]; if (!fc) return null;
      const start = fc.r * W + fc.c, prev = new Int32Array(W * H).fill(-2); prev[start] = -1; const q = [start];
      while (q.length) { const i = q.shift(); if (G.own[i] === 1 && G.sup[i]) { const path = []; let k = i; while (k >= 0) { path.push({ c: k % W, r: (k / W) | 0 }); k = prev[k]; } return path; }
        const c = i % W, r = (i / W) | 0; for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const cc = c + dc, rr = r + dr; if (cc < 0 || rr < 0 || cc >= W || rr >= H) continue; const j = rr * W + cc; if (prev[j] !== -2 || G.kind[j] === 1) continue; prev[j] = i; q.push(j); } }
      return null; });
    let guard = 0, held = 0;
    while ((await st()).mode === 'play' && guard++ < 260) {
      const path = await plan(); if (!path) break;
      await moveTo(path[0].c, path[0].r); await page.mouse.down(); await moveTo(path[1].c, path[1].r);
      for (let t = 0; t < 30; t++) { await adv(.1); const x = await cell(path[1].c, path[1].r); if (x.own === 1 || (await st()).mode !== 'play') break; }
      if (path.length === 2) held++;
      await page.mouse.up();
    }
    s = await st(); expect(held > 0 && (s.mode === 'outro' || s.mode === 'result') && s.foe.cores === 0 && s.stats.cores === 1, 'held on the red core until it was captured (' + s.mode + ', guard ' + guard + ')');
    await adv(2.2); s = await st();
    expect(s.mode === 'result' && s.foe.cells === 0 && await page.locator('#ovRes.on').count() === 1 && /SECURED/.test(await page.locator('#rTitle').textContent()), 'red land crumbled, sector secured card');
    const secured = s.score; expect(secured > 600, 'core + time + sector bonus banked (' + secured + ')');
    expect(await page.evaluate(() => +JSON.parse(localStorage.getItem('gdl:best:games/the-grid-war'))) === secured, 'best saved at sector end');

    // 6. sector 2: keyboard cursor claims, pause freezes the clock
    await page.locator('#bNext').tap(); await wait(60); s = await st();
    expect(s.mode === 'play' && s.sector === 2 && s.score === secured && s.foe.cores === 1 && s.you.cells === 9, 'sector 2 starts fresh with the score carried');
    const c2 = (await page.evaluate(() => window.__gdl.cores(1)))[0];
    for (let k = 0; k < 3; k++) { await page.keyboard.press('ArrowUp'); await adv(.05); }   // portrait: up = toward the static
    s = await st(); expect(s.kcur === c2.r * 28 + c2.c + 3 && (await cell(c2.c + 3, c2.r)).own === 1, 'arrow keys steer the cursor and claim');
    await page.evaluate(() => window.__gdl.manual(false));
    await page.keyboard.press('KeyP'); await wait(50); const tp = (await st()).time; await wait(600); s = await st();
    expect(s.paused && s.time === tp && await page.locator('#ovPause.on').count() === 1, 'P pauses and the clock stands still');
    await page.locator('#bResume').tap(); await wait(400); s = await st(); expect(!s.paused && s.time < tp, 'resume runs the clock again');
    await page.evaluate(() => window.__gdl.manual(true));

    // 7. idle: the static wins
    for (let t = 0; t < 110 && (await st()).mode === 'play'; t++) await adv(1);
    await adv(2); s = await st();
    expect(s.mode === 'over' && await page.locator('#ovRes.on').count() === 1 && /LOST/.test(await page.locator('#rTitle').textContent()), 'idling loses the grid: ' + s.mode);
    expect(+(await page.locator('#fScore').textContent()) === s.score && s.best === s.score && s.score >= secured, 'final card shows the score and it is the best');
    expect(await page.evaluate(() => +JSON.parse(localStorage.getItem('gdl:best:games/the-grid-war'))) === s.score, 'best persisted');

    // 8. PLAY AGAIN restarts cleanly
    await page.locator('#bNext').tap(); await wait(60); s = await st();
    expect(s.mode === 'play' && s.sector === 1 && s.score === 0 && s.you.cells === 9 && s.foe.cells === 9 && !s.paused && s.stats.claimed === 0, 'clean restart');
    await page.evaluate(() => window.__gdl.manual(false)); await wait(500);
    expect((await st()).time < 100, 'clock runs after restart');
  },
};
