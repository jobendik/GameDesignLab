// Goat Up: correct-side taps climb and score, quick hops build flow, a wrong hop costs puff and flow, puff drains,
// camps refill and raise the stage, an empty puff bar ends the run, restart is clean, best persists.
module.exports = {
  game: 'PhoneGameLab/games/25-goat-up/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const sideX = d => (d < 0 ? 80 : 310);
    // real touch input on the side of the next ledge
    for (let i = 0; i < 10; i++) { const d = await game(g => g.need()); await page.touchscreen.tap(sideX(d), 620); await wait(40); }
    expect(await game(g => g.pos) === 10, 'ten correct taps climb ten ledges');
    expect(await game(g => g.score) >= 10 && (await state()).score === await game(g => g.score), 'score follows the climb and reaches the HUD');
    expect(await game(g => g.mult) >= 2, 'quick consecutive hops raise the flow multiplier');
    // keyboard works too
    const d1 = await game(g => g.need()); await page.keyboard.press(d1 < 0 ? 'ArrowLeft' : 'ArrowRight'); await wait(60);
    expect(await game(g => g.pos) === 11, 'arrow key hops');
    // wrong side: no progress, puff chunk lost, flow reset
    const before = await game(g => ({ pos: g.pos, puff: g.puff }));
    const d2 = await game(g => g.need()); await page.touchscreen.tap(sideX(-d2), 620); await wait(60);
    const after = await game(g => ({ pos: g.pos, puff: g.puff, mult: g.mult, streak: g.streak, stumbles: g.stumbles }));
    expect(after.pos === before.pos && after.stumbles === 1, 'wrong hop does not advance');
    expect(after.puff < before.puff - .12 && after.mult === 1 && after.streak === 0, 'wrong hop costs puff and breaks the flow');
    // puff drains while idle
    await wait(450); const p0 = await game(g => g.puff); await wait(1000);
    expect(await game(g => g.puff) < p0 - .03, 'puff drains over time');
    // climb to the first camp through the real hop action
    for (let guard = 0; guard < 80 && await game(g => g.pos) < 50; guard++) { await game(g => g.hop(g.need())); if (guard % 8 === 7) await wait(30); }
    const camp = await game(g => ({ pos: g.pos, stage: g.stage, puff: g.puff }));
    expect(camp.pos === 50 && camp.stage === 1 && camp.puff === 1, 'camp at ledge 50 refills puff and raises the stage');
    const sc = await game(g => g.score);
    // lose by genuine play: keep hopping the wrong way until the bar is empty
    for (let i = 0; i < 12 && !(await state()).over; i++) { const d = await game(g => g.need()); await page.touchscreen.tap(sideX(-d), 620); await wait(380); }
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(200);
    const s = await state(); expect(s.over, 'running out of puff ends the run');
    expect(s.score === sc && s.best >= sc && s.best > 0, 'final score kept and best recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.pos === 0 && g.puff === 1 && g.mult === 1 && g.stage === 0 && g.alive), 'state fully reset');
  },
};
