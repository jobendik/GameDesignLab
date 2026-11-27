// Cakewalk: a layer tossed overhead is caught and scores; walking Momo under the landing ring with a real drag catches a
// far layer; a layer left alone splats and costs a heart; a pepper pot on the cake makes it sneeze-sway but costs no
// heart, a dodged one pays 5; jerking a tall cake about with real pointer input topples it; the cherry on a full
// recipe serves the cake (bonus, next recipe is longer); three hearts gone ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/cakewalk/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await game(g => g.hold(true)); await wait(1900);            // stop Bun's own tosses; let anything in the air land
    await game(g => g.setCake(0));
    let s = await game(g => ({ hearts: g.hearts, need: g.need, n: g.stack.length, cake: g.cake }));
    expect(s.need === 3 && s.n === 0 && s.cake === 0, 'first recipe is three layers');
    const h0 = s.hearts, sc0 = await game(g => g.score);
    // 1. straight overhead: caught without moving
    await game(g => g.toss('layer', g.momoX, .7)); await wait(1000);
    s = await game(g => ({ n: g.stack.length, score: g.score, combo: g.combo }));
    expect(s.n === 1 && s.score > sc0 && s.combo >= 1, 'a layer landing dead centre is a perfect catch and scores');
    expect((await state()).score === s.score, 'HUD shows the score');
    // 2. real drag: walk under a layer that lands 100 px to the side
    const Y = 600, x0 = await game(g => g.momoX);
    await page.mouse.move(x0, Y); await page.mouse.down();
    await game(g => g.toss('layer', g.momoX + 100, 1.5));
    for (let i = 1; i <= 20; i++) { await page.mouse.move(x0 + i * 5, Y); await wait(40); }
    await wait(900); await page.mouse.up();
    s = await game(g => ({ n: g.stack.length, mx: g.momoX, hearts: g.hearts }));
    expect(Math.abs(s.mx - (x0 + 100)) < 12, 'Momo follows the finger');
    expect(s.n === 2 && s.hearts === h0, 'walking under the ring catches the layer');
    // 3. a layer nobody walks to splats: one heart
    await game(g => g.toss('layer', g.momoX - 170, .7)); await wait(1100);
    s = await game(g => ({ n: g.stack.length, hearts: g.hearts })); expect(s.n === 2 && s.hearts === h0 - 1, 'a missed layer costs a heart');
    // 4. pepper: on the cake → sneeze (sway, no heart); beside the cake → +5
    let sc = await game(g => g.score);
    await game(g => g.toss('pepper', g.topX, .6));
    let peak = 0; for (let i = 0; i < 14; i++) { await wait(80); peak = Math.max(peak, await game(g => g.danger)); }
    s = await game(g => ({ hearts: g.hearts, score: g.score, n: g.stack.length })); expect(peak > .15 && s.hearts === h0 - 1 && s.score === sc, 'pepper on the cake: a sneeze sways it, no heart lost');
    await game(g => g.toss('pepper', g.topX + 150, .6)); await wait(1000);
    expect(await game(g => g.score) === sc + 5, 'a dodged pepper pot pays 5');
    // 5. cherry on a full recipe serves the cake
    await game(g => g.toss('layer', g.topX, .6)); await wait(900);
    expect(await game(g => g.stack.length) === 3, 'recipe complete');
    sc = await game(g => g.score); await game(g => g.toss('cherry', g.topX, .6)); await wait(800);
    s = await game(g => ({ served: g.served, score: g.score, phase: g.phase })); expect(s.served === 1 && s.score >= sc + 60, 'the cherry serves the cake for a bonus');
    await wait(1200); s = await game(g => ({ cake: g.cake, need: g.need, n: g.stack.length, phase: g.phase }));
    expect(s.cake === 1 && s.need === 4 && s.n === 0 && s.phase === 'play', 'next cake: a longer recipe on an empty plate');
    // 6. a tall cake jerked about with the pointer topples
    await game(g => g.setCake(5));
    for (let i = 0; i < 7; i++) { await game(g => g.toss('layer', g.topX, .45)); await wait(650); }
    const before = await game(g => ({ n: g.stack.length, hearts: g.hearts })); expect(before.n === 7, 'seven layers stacked');
    await page.mouse.move(await game(g => g.momoX), Y); await page.mouse.down(); let after = before;
    for (let i = 0; i < 24 && after.n === before.n; i++) { await page.mouse.move(i % 2 ? 40 : 350, Y); await wait(230); after = await game(g => ({ n: g.stack.length, hearts: g.hearts })); }
    await page.mouse.up();
    expect(after.n < before.n && after.hearts === before.hearts - 1, 'dashing back and forth whips the top layers off: a heart lost');
    // 7. last heart → run ends
    await wait(600);
    for (let i = 0; i < 4 && !(await game(g => g.phase !== 'play')); i++) { await game(g => g.toss('layer', g.momoX > 195 ? 40 : 350, .5)); await wait(900); }
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    const o = await state(); expect(o.over, 'losing the last heart ends the run'); expect(o.best >= o.score && o.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts === 3 && g.cake === 0 && g.served === 0 && g.stack.length === 0 && g.need === 3 && g.score === 0), 'hearts, cake and plate reset');
    // the director tosses on its own again: with Momo standing still under the hatch the first layer is a gift
    for (let i = 0; i < 30 && !(await game(g => g.stack.length)); i++) await wait(150);
    expect(await game(g => g.stack.length) >= 1, "after restart Bun's first toss lands on the plate");
  },
};
