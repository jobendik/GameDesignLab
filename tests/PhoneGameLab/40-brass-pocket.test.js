// Brass Pocket: real drag-back shots aimed with the game's own dry-run solver pot balls (a pot pays the shot back, a
// streak multiplies), a miss costs a shot, clearing the rack pays +2 and racks the next one, potting the brass ball early
// costs 2 shots and re-spots it, the keyboard can shoot, running out of shots ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/40-brass-pocket/index.html',
  timeout: 150000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms) => { for (let t = 0; t < ms; t += 100) { if (await game(fn)) return true; await wait(100); } return false; };
    // drag back for each candidate until the dry run of the *actual* on-screen aim satisfies `ok`; then release
    const dragShot = async (cands, ok) => {
      for (const s of cands) {
        const d = await game((g, s) => g.dragFor(s.ang, s.pow), s), sx = 195, sy = 430;
        await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx + d.dx, sy + d.dy, { steps: 6 }); await wait(60);
        const pred = await game(g => g.aim && g.simulate(g.aim.ang, g.aim.pow));
        if (pred && ok(pred)) { await page.mouse.up(); await wait(80); expect(await until(g => g.state !== 'roll', 15000), 'balls come to rest'); return pred; }
        await page.mouse.move(sx, sy, { steps: 2 }); await page.mouse.up(); await wait(60);       // cancel: back to the press point
      }
      return null;
    };
    const misses = () => game(g => { const o = []; for (let a = 0; a < 6.28 && o.length < 6; a += .19) for (const pow of [.12, .3]) { const r = g.simulate(a, pow); if (!r.pots.length && !r.scratch) { o.push({ ang: a, pow }); break; } } return o; });
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.rack === 1 && g.shots === 4 && g.left === 3 && g.state === 'aim' && g.score === 0), 'fresh run: rack 1, 4 shots, 3 balls');

    // 1) a tap is not a shot
    await page.mouse.click(200, 500); await wait(150);
    expect(await game(g => g.shots === 4 && g.state === 'aim'), 'a tap without a drag does not shoot');

    // 2) a solved drag-back shot pots a ball: the shot is paid back and it scores 100
    let pred = await dragShot(await game(g => g.solve()), p => p.good && p.pots.length === 1);
    expect(pred, 'solver found a clean pot'); 
    expect(await game(g => g.left === 2 && g.shots === 4 && g.score === 100 && g.streak === 1), 'pot: ball down, shot refunded, +100');
    expect((await state()).score === 100, 'HUD score mirrors game score');

    // 3) a miss costs a shot and breaks the streak
    expect(await dragShot(await misses(), p => !p.pots.length && !p.scratch), 'found a harmless miss');
    expect(await game(g => g.left === 2 && g.shots === 3 && g.streak === 0 && g.score === 100), 'miss: −1 shot, streak reset');

    // 4) clear the rack → +2 shots, bonus, next rack is set
    while (await game(g => g.rack === 1 && g.left > 0 && g.state === 'aim')) expect(await dragShot(await game(g => g.solve()), p => p.good), 'solver keeps potting');
    expect(await until(g => g.rack === 2 && g.state === 'aim', 6000), 'clearing the table racks the next one');
    expect(await game(g => g.left === 4 && g.shots === 5 && g.score >= 100 + 100 + 200 + 250), 'rack bonus and +2 shots (score ' + await game(g => g.score) + ')');

    // 5) the brass ball must go last: potting it early costs 2 shots and re-spots it
    await game(g => g.loadRack(3)); await wait(200);
    const early = await game(g => { const o = []; for (let a = -3.14; a < 0 && o.length < 8; a += .004) for (const pow of [.55, .85]) { const r = g.simulate(a, pow); if (r.early && !r.scratch && r.pots.length === 1) { o.push({ ang: a, pow }); break; } } return o; });
    expect(early.length > 0, 'a shot that pots the brass ball early exists');
    const before = await game(g => ({ shots: g.shots, left: g.left, score: g.score }));
    expect(await dragShot(early, p => p.early && !p.scratch && p.pots.length === 1), 'played the early-brass shot');
    expect(await game((g, b) => g.shots === b.shots - 3 && g.left === b.left && g.hasBrass && g.score === b.score && g.streak === 0, before), 'brass early: −1 −2 shots, re-spotted, no points');

    // 6) keyboard: arrows aim, Space shoots
    await page.keyboard.down('ArrowLeft'); await wait(200); await page.keyboard.up('ArrowLeft');
    expect(await game(g => !!g.aim), 'arrow keys bring up the aim'); const sh = await game(g => g.shots);
    await page.keyboard.press('Space'); await wait(150);
    expect(await game(g => g.state) === 'roll' || await game(g => g.shots) !== sh, 'Space shoots'); await until(g => g.state !== 'roll', 15000);

    // 7) out of shots with balls on the table → game over
    await until(g => g.state === 'aim', 5000);
    if (!(await state()).over) { await game(g => { g.shots = 1; }); expect(await dragShot(await misses(), p => !p.pots.length && !p.scratch), 'last shot misses'); }
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(200);
    const e = await state(); expect(e.over, 'no shots left ends the run'); expect(e.best >= e.score && e.best > 0, 'best score recorded');

    // 8) restart is clean
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.rack === 1 && g.shots === 4 && g.left === 3 && g.state === 'aim' && g.streak === 0 && g.potted === 0), 'state fully reset');
  },
};
