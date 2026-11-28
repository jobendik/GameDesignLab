// Pop & Pour: real mouse swipes pop fruit; the right fruit pours the next layer and scores (HUD follows); a wrong fruit
// muddies the drink (layers poured away, combo reset); two right fruits in one swipe are a double pour; finishing the order
// serves the customer; swiping a bee drops the glass; three walk-outs close the stand; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/pop-and-pour/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await game(g => g.clear());
    const swipe = async (x0, x1, y) => { await page.mouse.move(x0, y); await page.mouse.down(); await page.mouse.move(x1, y, { steps: 8 }); await page.mouse.up(); await wait(60); };
    const put = (k, x, y) => game((g, a) => g.spawn(a[0], a[1], a[2], 0, 0), [k, x, y]);
    // 1) the needed fruit pours a layer
    let need = await game(g => g.need); expect(need >= 0, 'an order is waiting');
    await put(need, 195, 330); await swipe(110, 290, 330);
    let s = await page.evaluate(() => ({ L: __lab.game.layers, score: __lab.game.score, hud: __lab.state.score, n: __lab.game.fruits.length }));
    expect(s.L.length === 1 && s.L[0] === need && s.n === 0, 'popping the needed fruit pours its layer');
    expect(s.score > 0 && s.hud === s.score, 'the pour scores and reaches the HUD');
    // 2) a wrong fruit muddies the drink
    need = await game(g => g.need); const wrong = (need + 1) % 3;
    await put(wrong, 195, 330); await swipe(110, 290, 330);
    s = await game(g => ({ L: g.layers.length, spill: g.spill, combo: g.combo }));
    expect(s.L === 0 && s.spill === 'wrong' && s.combo === 0, 'a wrong layer pours the drink away');
    // 3) double pour: two right fruits in one swipe (left to right, in order)
    const ord = await game(g => g.order); const sc0 = await game(g => g.score);
    await put(ord[0], 120, 300); await put(ord[1], 270, 300); await swipe(60, 340, 300);
    s = await game(g => ({ L: g.layers.length, score: g.score, served: g.served }));
    expect(s.L === 2 || s.served === 1, 'one swipe poured two layers');
    expect(s.score - sc0 >= 10 + 10 + 15, `double pour bonus paid (+${s.score - sc0})`);
    // 4) finish the order → served
    for (let i = 0; i < 6 && (await game(g => g.served)) === 0; i++) { const k = await game(g => g.need); await put(k, 195, 320); await swipe(110, 290, 320); }
    expect(await game(g => g.served) === 1, 'completing the layered order serves the customer');
    // 5) a bee drops the glass
    await wait(900); need = await game(g => g.need); await put(need, 195, 330); await swipe(110, 290, 330);
    expect((await game(g => g.layers.length)) === 1, 'a layer in the new glass');
    await game(g => g.bee(195, 400)); await swipe(110, 290, (await game(g => g.bees[0].y)));
    s = await game(g => ({ L: g.layers.length, spill: g.spill, bees: g.bees.length }));
    expect(s.L === 0 && s.spill === 'bee' && s.bees === 0, 'swiping a bee spills the drink');
    // 6) three walk-outs close the stand
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 40 && !(await game(g => g.cust && g.cust.st === 'wait')); j++) await wait(60);
      await game(g => g.setPatience(.001)); await wait(400);
    }
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(100);
    let st = await state(); expect(st.over && await game(g => g.frowns) === 3, 'three walk-outs end the run');
    expect(st.best >= st.score && st.best > 0, 'best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    st = await state(); s = await game(g => ({ f: g.frowns, sv: g.served, L: g.layers.length, over: g.over, combo: g.combo }));
    expect(st.running && !st.over && st.score === 0 && s.f === 0 && s.sv === 0 && s.L === 0 && !s.over && s.combo === 0, 'restart is clean');
    await wait(2500); expect((await game(g => g.fruits.length)) > 0, 'fruit is tossed again after restart');
  },
};
