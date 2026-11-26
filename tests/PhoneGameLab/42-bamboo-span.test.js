// Bamboo Span: real holds grow the stalk, a centred tip scores a perfect, a tap is forgiven, hops catch fireflies,
// a two-pillar stalk is a LEAP, a lit lantern rescues one fall, the next fall ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/42-bamboo-span/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const ready = () => page.waitForFunction(() => window.__lab.game.state === 'ready', null, { timeout: 9000 });
    const lenAtLeast = v => page.waitForFunction(x => window.__lab.game.stalk.len >= x, v, { timeout: 9000 });
    // 1) mouse hold: grow to the middle of the next pillar → perfect landing
    let need = await game(g => g.need);
    await page.mouse.move(200, 420); await page.mouse.down(); await lenAtLeast(need.mid - 3); await page.mouse.up();
    await wait(200); await ready();
    let s = await game(g => ({ cur: g.cur, score: g.score, streak: g.streak, crossed: g.crossed }));
    expect(s.cur === 1 && s.crossed === 1, 'stalk spanning the gap carries the pangolin to pillar 2');
    expect(s.streak === 1 && s.score === 2, 'tip on the red mat is a perfect worth 2 (got ' + s.score + ')');
    expect((await state()).score === s.score, 'HUD score updated');
    // 2) an accidental touch tap is forgiven: the shoot shrivels, nobody falls
    await page.touchscreen.tap(200, 420); await wait(500);
    s = await game(g => ({ cur: g.cur, state: g.state, len: g.stalk.len })); expect(s.cur === 1 && s.state === 'ready' && s.len < 14, 'a quick tap does not drop a stalk');
    // 3) keyboard hold (deliberately off-centre) + hop for the firefly while rolling
    need = await game(g => g.need);
    await page.keyboard.down('Space'); await lenAtLeast(need.mid + 18); await page.keyboard.up('Space');
    for (let i = 0; i < 80; i++) {
      const d = await game(g => { if (g.state !== 'roll') return g.state === 'ready' ? -1 : 999; let d = 999; for (const p of g.pillars) for (const f of p.flies) if (!f.got && f.x > g.hero.x) d = Math.min(d, f.x - g.hero.x); return d; });
      if (d < 0) break; if (d > 18 && d < 46) await page.keyboard.press('Space');
      await wait(25);
    }
    await ready();
    s = await game(g => ({ cur: g.cur, score: g.score, streak: g.streak, flies: g.flies }));
    expect(s.cur === 2 && s.streak === 0, 'off-centre landing still crosses but breaks the streak');
    expect(s.flies === 1 && s.score === 4, 'hopping under a firefly catches it (+1)');
    // 4) LEAP: span two pillars at once
    const far = await game(g => { const p = g.pillars[g.cur + 2]; return p.x + p.w / 2 - g.stalk.x; });
    expect(far < 320, 'second pillar is within reach');
    const before = s.score;
    await game(g => g.press()); await lenAtLeast(far - 3); await game(g => g.release());
    await wait(300); await ready();
    s = await game(g => ({ cur: g.cur, score: g.score, crossed: g.crossed }));
    expect(s.cur === 4 && s.crossed === 4, 'a stalk reaching the second pillar skips one');
    expect(s.score >= before + 2, 'leap pays double');
    // 5) lantern rescue, then a real fall
    await game(g => g.setFlies(5));
    expect(await game(g => g.lantern), 'five fireflies light the lantern');
    await game(g => g.press()); await lenAtLeast(20); await game(g => g.release());
    await wait(600); expect(!(await state()).over, 'lantern prevents the game over');
    await ready();
    s = await game(g => ({ cur: g.cur, lantern: g.lantern, flies: g.flies })); expect(s.cur === 5 && !s.lantern && s.flies === 0, 'lantern carries the pangolin to the next pillar and is spent');
    await page.mouse.down(); await lenAtLeast(20); await page.mouse.up();
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150);
    const o = await state(); expect(o.over, 'a short stalk without a lantern ends the run'); expect(o.best >= o.score && o.score > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    s = await game(g => ({ cur: g.cur, crossed: g.crossed, flies: g.flies, len: g.stalk.len, state: g.state })); expect(s.cur === 0 && s.crossed === 0 && s.flies === 0 && s.len === 0 && s.state === 'ready', 'world reset after restart');
  },
};
