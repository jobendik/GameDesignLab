// Potting Shed: the sack stocks the tray, drag-merging grows tiers, a plant on a pot makes a planter, orders pay coins
// (drag and tap delivery), the compost crate removes things, the day ends on time, and the tray + lifetime progress persist.
module.exports = {
  game: 'PhoneGameLab/games/66-potting-shed/index.html',
  async run({ page, expect, wait, state, game }) {
    const drag = async (a, b) => { await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 4 }); await page.mouse.move(b.x, b.y, { steps: 4 }); await page.mouse.up(); await wait(250); };
    expect((await state()).running, 'game running after autostart');
    const gens = await game(g => g.gens), n0 = await game(g => g.count);
    expect(!gens[0].locked && gens[1].locked && gens[2].locked, 'only the seed sack is unlocked on a fresh save');
    await page.touchscreen.tap(gens[0].x, gens[0].y); await wait(300);
    expect(await game(g => g.count) === n0 + 1, 'tapping the sack stocks one item');
    expect((await game(g => g.gens))[0].charge === gens[0].charge - 1, 'stocking spends a charge');
    await page.touchscreen.tap(gens[1].x, gens[1].y); await wait(300);
    expect(await game(g => g.count) === n0 + 1, 'a locked generator gives nothing');
    // drag-merge two seeds
    await game(g => { g.clear(); g.give(0, 0, 0); g.give(1, 0, 0); });
    let c = await game(g => g.cells); await drag(c[0], c[1]);
    c = await game(g => g.cells);
    expect(!c[0] && c[1] && c[1].ch === 0 && c[1].t === 1 && await game(g => g.merges) === 1, 'two seeds merge into a sprout');
    // unlike things swap places
    await game(g => g.give(5, 0, 0)); c = await game(g => g.cells); await drag(c[5], c[1]);
    c = await game(g => g.cells);
    expect(c[5] && c[5].t === 1 && c[1] && c[1].t === 0, 'dropping onto a different item swaps them');
    // the day clock waits for the first delivery on a fresh save; delivering by drag pays the order
    expect(await game(g => g.timeLeft) === 150, 'day clock waits during the tutorial');
    let o = await game(g => g.orders);
    expect(o[0] && o[0].needs[0].ch === 0 && o[0].needs[0].t === 1, 'first order asks for a sprout');
    const before = await game(g => g.coins); await drag(c[5], o[0]); await wait(600);
    const paid = await game(g => ({ coins: g.coins, life: g.life, count: g.count }));
    expect(paid.coins >= before + o[0].reward && paid.count === 1, 'dragging the wanted item onto the tag pays its reward');
    expect((await state()).score === paid.coins, 'HUD shows today\'s coins');
    // tap delivery: second order wants a seedling
    expect(o[1].needs[0].t === 2, 'second order asks for a seedling');
    await game(g => g.give(10, 0, 2)); c = await game(g => g.cells);
    await page.touchscreen.tap(c[10].x, c[10].y); await wait(700);
    const paid2 = await game(g => ({ coins: g.coins, streak: g.streak, has: !!g.cells[10] }));
    expect(!paid2.has && paid2.coins >= paid.coins + o[1].reward && paid2.streak === 2, 'tapping a wanted item delivers it and builds bustle');
    // production chain: a bud dropped on a plain pot becomes a planter
    await game(g => { g.give(3, 0, 3); g.give(4, 1, 2); }); c = await game(g => g.cells); await drag(c[3], c[4]);
    c = await game(g => g.cells);
    expect(!c[3] && c[4].ch === 3 && c[4].t === 1, 'plant + pot makes a planter');
    // compost crate
    const bin = await game(g => g.bin), cnt = await game(g => g.count); await drag(c[4], bin);
    expect(await game(g => g.count) === cnt - 1, 'dragging to the compost crate removes the item');
    // level-up unlocks the clay tub
    await game(g => g.setLife(70)); await wait(200);
    expect(await game(g => g.level) === 2 && !(await game(g => g.gens))[1].locked, 'lifetime coins unlock the clay tub');
    const m0 = await game(g => g.count); await page.touchscreen.tap(gens[1].x, gens[1].y); await wait(300);
    expect(await game(g => g.count) === m0 + 1, 'the unlocked clay tub stocks the tray');
    // day end
    const snap = await game(g => ({ count: g.count, life: g.life, found: g.found }));
    await game(g => g.setTime(.4));
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'the day ends when the sun sets');
    expect(s.best >= s.score && s.score > 0, 'best day recorded');
    const sv = await game(g => g.saved());
    expect(sv && sv.cells.filter(Boolean).length === snap.count && sv.life === snap.life && sv.day === 2, 'tray and lifetime coins saved');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'next day starts clean');
    const d2 = await game(g => ({ coins: g.coins, count: g.count, life: g.life, level: g.level, found: g.found, t: g.timeLeft }));
    expect(d2.coins === 0 && d2.t > 140, 'coins and clock reset for the new day');
    expect(d2.count === snap.count && d2.life === snap.life && d2.level === 2 && d2.found === snap.found, 'tray, level and almanac persist into the next day');
  },
};
