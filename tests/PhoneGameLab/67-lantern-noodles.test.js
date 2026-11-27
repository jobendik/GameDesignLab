// Lantern Noodles: trays build the bowl, a matching bowl is served by tapping the bowl or the customer and pays coins,
// binning breaks the combo, an impatient customer costs a lantern, the day ends in a receipt and unlocks a recipe part,
// a regular's hidden "usual" pays double (or can be peeked at a patience cost), three walk-outs end the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/67-lantern-noodles/index.html',
  async run({ page, expect, wait, state, game }) {
    const tap = async p => { await page.touchscreen.tap(p.x, p.y); await wait(140); };
    const waitFor = async (fn, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { const v = await game(fn); if (v) return v; await wait(100); } return null; };
    expect((await state()).running, 'game running after autostart');
    const cu = await waitFor(g => g.customers.find(Boolean));
    expect(cu && cu.order.join() === '0,2', 'first customer orders a plain bowl');
    await wait(500);
    expect(await game(g => g.customers.find(Boolean).pat) === cu.pat, 'patience is held until the first serve');
    const bins = await game(g => g.bins);
    expect(!bins[0].locked && bins[1].locked && bins[3].locked && bins[6].locked, 'day 1 trays: red broth, rice and mushroom locked');
    await tap(bins[6]); expect((await game(g => g.bowl)).length === 0, 'a locked tray adds nothing');
    await tap(bins[0]); await tap(bins[2]); await tap(bins[0]);
    expect((await game(g => g.bowl)).join() === '0,2', 'trays fill the bowl once each');
    await tap(await game(g => g.bowlPos)); await wait(300);
    const s1 = await game(g => ({ coins: g.coins, served: g.served, combo: g.combo, bowl: g.bowl.length }));
    expect(s1.served === 1 && s1.coins >= 8 && s1.combo === 1 && s1.bowl === 0, 'tapping a matching bowl serves it and pays');
    expect((await state()).score === s1.coins, 'HUD shows coins');
    // wrong bowl: nobody takes it, binning it breaks the combo
    const c2 = await waitFor(g => g.customers.find(Boolean)); expect(c2, 'second customer arrives');
    await tap(bins[5]); await tap(await game(g => g.bowlPos));
    expect(await game(g => g.served) === 1 && (await game(g => g.bowl)).join() === '5', 'a bowl nobody ordered is not served');
    await tap(await game(g => g.trash));
    expect((await game(g => g.bowl)).length === 0 && await game(g => g.combo) === 0, 'binning empties the bowl and resets the combo');
    for (const id of c2.order) await tap(bins[id]);
    await tap(c2); await wait(300);
    const s2 = await game(g => ({ coins: g.coins, served: g.served, combo: g.combo }));
    expect(s2.served === 2 && s2.coins > s1.coins && s2.combo === 1, 'tapping the customer serves the matching bowl');
    // patience runs out → a lantern goes dark
    const c3 = await waitFor(g => g.customers.find(Boolean)); expect(c3, 'third customer arrives');
    await game((g, k) => g.setPatience(k, .1), c3.k); await wait(500);
    expect(await game(g => g.hearts) === 2 && await game(g => g.combo) === 0, 'a walk-out costs a lantern');
    // day end → receipt → day 2 unlocks the mushroom
    await game(g => g.finishDay()); await wait(300);
    expect(await game(g => g.phase) === 'tally', 'the day ends with a receipt');
    await wait(1000); await tap({ x: 195, y: 420 }); await wait(200);
    expect(await game(g => g.day) === 2 && await game(g => g.phase) === 'serve' && !(await game(g => g.bins))[6].locked, 'day 2 opens with the mushroom tray');
    // the regular's hidden usual: remembered = double pay
    expect(await game(g => g.spawn(true)), 'regular arrives');
    const u = await game(g => g.customers.find(c => c && c.hidden)); expect(u && u.regular, 'the usual is hidden');
    const before = await game(g => g.coins); for (const id of u.order) await tap(bins[id]);
    await tap(u); await wait(300);
    const gain = await game(g => g.coins) - before;
    expect(gain >= 2 * (4 + 2 * u.order.length), 'serving the usual from memory pays double (got ' + gain + ')');
    // peeking reveals it at a patience cost
    await wait(900); expect(await game(g => g.spawn(true)), 'regular returns');
    const u2 = await game(g => g.customers.find(c => c && c.hidden));
    await tap({ x: u2.bx, y: u2.by });
    const pk = await game((g, k) => g.customers[k], u2.k);
    expect(pk && !pk.hidden && pk.pat < u2.pat - u2.patMax * .25, 'peeking shows the order and costs patience');
    // three walk-outs close the cart
    for (let i = 0; i < 60 && !(await state()).over; i++) { await game(g => { for (let k = 0; k < 3; k++) g.setPatience(k, .05); }); await wait(250); }
    const s = await state(); expect(s.over, 'losing every lantern ends the run');
    expect(await game(g => g.hearts) === 0 && s.best >= s.score && s.score > 0, 'score and best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    const f = await game(g => ({ day: g.day, hearts: g.hearts, coins: g.coins, served: g.served, bowl: g.bowl.length, locked: g.bins[6].locked }));
    expect(f.day === 1 && f.hearts === 3 && f.coins === 0 && f.served === 0 && f.bowl === 0 && f.locked, 'day, lanterns, coins and trays reset');
  },
};
