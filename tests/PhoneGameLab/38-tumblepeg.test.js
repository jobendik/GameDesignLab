// Tumblepeg: real drag-release drops a marble whose outcome matches the game's own deterministic dry run; taps and arrow
// keys spend nudges on a falling marble; five marbles over the quota clear the round, five under it end the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/38-tumblepeg/index.html',
  timeout: 170000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms) => { for (let t = 0; t < ms; t += 100) { if (await game(fn)) return true; await wait(100); } return false; };
    // scan the board with the dry run and return the best (or worst) drop column
    const pick = best => game((g, best) => { let bx = 0, bp = best ? -1 : 1e9; for (let x = 14; x < g.BW - 14; x += 2) { const p = g.dry(x).pts; if (best ? p > bp : p < bp) { bp = p; bx = x; } } return bx; }, best);
    // real pointer drag to a board column; returns the dry-run prediction for exactly where the chute ended up
    const dragDrop = async bx => {
      const p = await game((g, bx) => ({ x: g.sx(bx), y: g.dropY() + 120 }), bx);
      await page.mouse.move(p.x - 40, p.y); await page.mouse.down(); await page.mouse.move(p.x, p.y, { steps: 4 }); await wait(80);
      const pred = await game(g => g.dry(g.aim));
      await page.mouse.up(); return pred;
    };
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.state === 'aim' && g.round === 1 && g.left === 5 && g.nudges === 3 && g.score === 0 && g.lit === 3), 'fresh run: round 1, 5 marbles, 3 nudges, 3 glow pegs');

    // 1) aimed drop: lands where the dry run says and scores exactly that
    let pred = await dragDrop(await pick(true));
    expect(pred.pts >= 80, 'solver found a worthwhile drop (' + pred.pts + ')');
    expect(await game(g => g.state === 'fall' && !!g.marble), 'drag-release drops a marble');
    expect(await until(g => g.state === 'aim', 12000), 'marble lands');
    expect(await game(g => g.score) === pred.pts && await game(g => g.left) === 4, 'score matches the predicted cup × multiplier: ' + pred.pts);
    expect((await state()).score === pred.pts, 'HUD score mirrors game score');

    // 2) nudges: a tap on the right half and an arrow key each spend one and shove the marble
    await dragDrop(184); await wait(700);
    const vx0 = await game(g => g.marble.vx);
    await page.mouse.click(330, 500); await wait(60);
    expect(await game(g => g.nudges) === 2, 'tap spends a nudge');
    expect(await game(g => g.marble && g.marble.vx) > vx0 + 80, 'right tap shoves the marble right');
    await wait(350); await page.keyboard.press('ArrowLeft'); await wait(60);
    expect(await game(g => g.nudges) === 1, 'arrow key spends a nudge');
    expect(await until(g => g.state === 'aim', 12000), 'nudged marble lands');
    const s2 = await game(g => g.score); expect(s2 >= pred.pts, 'score never decreases');

    // 3) the remaining marbles, each dropped on the best column, clear round 1
    while (await game(g => g.state === 'aim' && g.left > 0 && g.round === 1)) {
      await dragDrop(await pick(true)); expect(await until(g => g.state !== 'fall' && g.state !== 'settle', 12000), 'marble lands');
    }
    expect(await until(g => g.round === 2 && g.state === 'aim', 6000), 'beating the quota advances to round 2');
    expect(await game(g => g.left === 5 && g.nudges === 3 && g.roundScore === 0 && g.mods.join() === 'bump' && g.quota > 150), 'round 2: fresh marbles and nudges, bumpers bolted on, higher quota');
    const banked = await game(g => g.score); expect(banked >= 150, 'round 1 score is banked (' + banked + ')');

    // 4) five deliberately poor marbles miss the quota → game over
    await page.keyboard.press('Space'); await wait(200);
    expect(await game(g => g.state === 'fall'), 'Space drops a marble'); await until(g => g.state === 'aim', 14000);
    while (await game(g => g.state === 'aim' && g.left > 0)) { await dragDrop(await pick(false)); await until(g => g.state !== 'fall' && g.state !== 'settle', 14000); }
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(200);
    const e = await state(); expect(e.over, 'missing the quota ends the run');
    expect(await game(g => g.roundScore < g.quota), 'round score was below the quota'); expect(e.best >= e.score && e.best > 0, 'best score recorded');

    // 5) restart is clean
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.state === 'aim' && g.round === 1 && g.left === 5 && g.nudges === 3 && g.roundScore === 0 && !g.marble && g.mods.length === 0), 'state fully reset');
  },
};
