// Bun Voyage: a real touch-and-release lob that leads a moving balloon drops the bake into its basket and scores (HUD
// agrees); the wrong bake is tossed back and breaks the combo; tapping Bun swaps the bakes; a lob into empty sky splats;
// wind drifts the lob, so the lead point moves upwind and still delivers; meeting the quota opens round 2; a balloon that
// leaves hungry costs a heart; the last heart ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/bun-voyage/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.round) === 1 && await game(g => g.hearts) === 3, 'round 1, three hearts');
    await game(g => { g.pause(true); g.clearSky(); });
    const [hx, hy] = await game(g => g.hand());
    // a slow balloon high above the stall that wants what Bun is holding
    const serve = async (want, opts) => {
      await game((g, a) => { g.clearSky(); g.setCur(a.cur || a.want); return g.spawn({ x: a.x, y: a.y, vx: a.vx, want: [a.want], side: -1 }); }, Object.assign({ x: 120, y: hy - 330, vx: 30, want }, opts || {}));
      await wait(120); for (let i = 0; i < 20 && await game(g => g.cool) > 0; i++) await wait(50);
      const id = (await game(g => g.balloons()))[0].id, a = await game((g, id) => g.aimFor(id), id);
      await page.mouse.move(a[0], a[1]); await page.mouse.down(); await wait(40); await page.mouse.up();
      for (let i = 0; i < 40 && await game(g => g.parcels()) > 0; i++) await wait(50);
      return a;
    };
    // 1) genuine lead: aim where the basket will be when the bake comes down
    let s0 = await game(g => g.score);
    await serve('bread');
    let s = await page.evaluate(() => ({ d: __lab.game.delivered, score: __lab.game.score, hud: __lab.state.score, combo: __lab.game.combo }));
    expect(s.d === 1 && s.score > s0 && s.hud === s.score && s.combo === 1, 'a led lob drops into the basket and scores');
    await serve('cake'); expect(await game(g => g.combo) === 2 && await game(g => g.delivered) === 2, 'a second delivery builds the combo');
    // 2) wrong bake: tossed back, combo broken, nothing delivered
    await serve('cake', { cur: 'bread' });
    expect(await game(g => g.delivered) === 2 && await game(g => g.combo) === 0, 'the wrong bake is refused and breaks the combo');
    // 3) tapping Bun swaps the bake in his paws with the one on the counter
    await game(g => g.setCur('bread')); const nx = await game(g => g.next), b = await game(g => g.bun);
    if (nx !== 'bread') { await page.touchscreen.tap(b[0], b[1]); await wait(100); expect(await game(g => g.cur) === nx && await game(g => g.next) === 'bread' && await game(g => g.swaps) === 1, 'tapping Bun swaps the bakes'); }
    else { await page.touchscreen.tap(b[0], b[1]); await wait(100); expect(await game(g => g.swaps) === 1, 'tapping Bun swaps the bakes'); }
    // 4) a lob into empty sky splats on the ground
    await game(g => g.clearSky()); for (let i = 0; i < 20 && await game(g => g.cool) > 0; i++) await wait(50);
    const t0 = await game(g => g.total);
    await page.mouse.move(hx + 120, hy - 200); await page.mouse.down(); await wait(40); await page.mouse.up(); await wait(80);
    expect(await game(g => g.total) === t0 + 1 && await game(g => g.parcels()) === 1, 'release lobs a bake');
    for (let i = 0; i < 40 && await game(g => g.parcels()) > 0; i++) await wait(50);
    expect(await game(g => g.parcels()) === 0 && await game(g => g.delivered) === 2, 'the stray bake lands on the grass');
    // 5) wind: the lead point moves upwind, and leading into it still delivers
    await game(g => { g.clearSky(); g.spawn({ x: 150, y: g.hand()[1] - 330, vx: 30, want: ['pie'], side: -1 }); g.setCur('pie'); g.setWind(0); });
    const id = (await game(g => g.balloons()))[0].id, a0 = await game((g, id) => g.aimFor(id), id);
    await game(g => g.setWind(180)); const a1 = await game((g, id) => g.aimFor(id), id);
    expect(a0[0] - a1[0] > 40, `with a tailwind the lead point moves upwind (${Math.round(a0[0])} → ${Math.round(a1[0])})`);
    await page.mouse.move(a1[0], a1[1]); await page.mouse.down(); await wait(40); await page.mouse.up();
    for (let i = 0; i < 40 && await game(g => g.parcels()) > 0; i++) await wait(50);
    expect(await game(g => g.delivered) === 3, 'a wind-corrected lob delivers');
    await game(g => g.setWind(0));
    // 6) meeting the quota starts round 2
    await serve('bread'); for (let i = 0; i < 10 && await game(g => g.round) === 1; i++) await wait(100);
    expect(await game(g => g.round) === 2, 'four deliveries clear round 1');
    // 7) a balloon that drifts off hungry costs a heart; the last one ends the run
    await game(g => { g.clearSky(); g.spawn({ x: innerWidth + 40, y: 300, vx: 200, want: ['cake'], side: -1 }); });
    for (let i = 0; i < 20 && await game(g => g.hearts) === 3; i++) await wait(100);
    expect(await game(g => g.hearts) === 2, 'a hungry balloon costs a heart');
    await game(g => { g.hearts = 1; g.spawn({ x: innerWidth + 40, y: 300, vx: 200, want: ['cake'], side: -1 }); });
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    let st = await state(); expect(st.over && st.best >= st.score && st.best > 0, 'the last heart ends the run; best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    st = await state();
    expect(st.running && !st.over && st.score === 0 && await game(g => g.round) === 1 && await game(g => g.hearts) === 3 && await game(g => g.delivered) === 0, 'restart gives a clean run');
  },
};
