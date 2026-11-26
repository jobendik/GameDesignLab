// Facet: a swipe splits a gem exactly along the swipe line (area conserved, pieces on either side), centre cuts are CLEAN,
// pieces can be re-cut for more, quick cuts chain, taps don't cut, hexstones and dropped whole gems cost lives → game over.
module.exports = {
  game: 'PhoneGameLab/games/15-facet/index.html',
  timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await game(g => { g.quiet(); g.freeze(); }); await wait(100);
    const swipe = async (x0, y0, x1, y1) => { await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x1, y1, { steps: 6 }); await page.mouse.up(); await wait(120); };
    const C = await game(g => ({ x: g.area.x + g.area.w / 2, y: g.area.y + g.area.h * .45 }));
    // --- a tap is not a cut
    await game((g, c) => { const s = g.launch('gem', c.x, c.y); s.rot = 0; s.w = 0; s.age = 1; }, C);
    await page.touchscreen.tap(C.x, C.y); await wait(200);
    expect(await game(g => g.gems.length === 1 && g.score === 0), 'tapping a gem does nothing');
    // --- horizontal swipe through the centre: two pieces, area conserved, one above and one below the line, CLEAN
    const a0 = await game(g => g.gems[0].a0);
    await swipe(C.x - 90, C.y, C.x + 90, C.y);
    const r1 = await game(g => ({ n: g.gems.length, gens: g.gems.map(s => s.gen), areas: g.gems.map(s => s.a0), ys: g.gems.map(s => s.y), score: g.score, cuts: g.cuts, cleans: g.cleans }));
    expect(r1.n === 2 && r1.gens.every(v => v === 1), 'one swipe → two pieces');
    expect(Math.abs(r1.areas[0] + r1.areas[1] - a0) < a0 * .01, 'the two pieces add up to the original stone');
    expect((r1.ys[0] - C.y) * (r1.ys[1] - C.y) < 0, 'pieces lie on either side of the swipe line');
    expect(r1.cuts === 1 && r1.cleans === 1 && r1.score >= 15, 'centre cut scores with the CLEAN bonus (' + r1.score + ')');
    expect((await state()).score === r1.score, 'HUD score updated');
    // --- re-cut both halves with one vertical swipe: four pieces, chained, worth more per cut
    await swipe(C.x, C.y - 100, C.x, C.y + 100);
    const r2 = await game(g => ({ n: g.gems.length, gens: g.gems.map(s => s.gen), score: g.score, cuts: g.cuts, chain: g.chain }));
    expect(r2.n === 4 && r2.gens.every(v => v === 2) && r2.cuts === 3, 'one stroke re-cuts both halves into quarters');
    expect(r2.score >= r1.score + 30, 'second-generation cuts are worth more (' + r2.score + ')');
    // --- off-centre cut: uneven pieces, not clean
    await game(g => { g.gems.length = 0; }); await wait(900);
    await game((g, c) => { const s = g.launch('gem', c.x, c.y); s.rot = 0; s.w = 0; s.age = 1; }, C);
    const R = await game(g => g.gems[0].R), cl0 = await game(g => g.cleans);
    await swipe(C.x - 90, C.y - R * .38, C.x + 90, C.y - R * .38);
    const r3 = await game(g => ({ n: g.gems.length, areas: g.gems.map(s => s.a0), cleans: g.cleans }));
    expect(r3.n === 2 && Math.min(...r3.areas) / Math.max(...r3.areas) < .5 && r3.cleans === cl0, 'an off-centre swipe makes uneven pieces and no CLEAN bonus');
    // --- pieces falling away cost nothing; a hexstone costs a life
    await game(g => g.freeze(false)); await wait(1600);
    expect(await game(g => g.gems.length === 0 && g.lives === 3), 'cut pieces may fall without penalty');
    await game((g, c) => { g.freeze(); g.launch('hex', c.x, c.y).age = 1; }, C);
    await swipe(C.x - 80, C.y - 10, C.x + 80, C.y + 10);
    expect(await game(g => g.lives === 2 && g.gems.length === 0), 'cutting a hexstone costs a life');
    // --- dropping whole gems costs the rest → game over
    await game(g => g.freeze(false));
    await game((g, c) => { g.launch('gem', c.x, g.area.y + g.area.h - 20, 0, 300); }, C); await wait(900);
    expect(await game(g => g.lives === 1), 'an uncut gem that falls costs a life');
    await game((g, c) => { g.launch('gem', c.x, g.area.y + g.area.h - 20, 0, 300); }, C);
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'losing the last life ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(400);
    const z = await state(); expect(z.running && !z.over && z.score === 0, 'restart gives a clean run');
    expect(await game(g => g.lives === 3 && g.cuts === 0 && g.chain === 0 && g.volley === 0), 'lives, cuts and tosses reset');
    for (let i = 0; i < 20 && (await game(g => g.gems.length)) === 0; i++) await wait(150);
    expect((await game(g => g.gems.length)) > 0, 'the director tosses gems by itself');
  },
};
