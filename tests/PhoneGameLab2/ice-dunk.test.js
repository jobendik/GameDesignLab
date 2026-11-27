// Ice Dunk: a real drag (push or pull-back) slides Nori into the hole for points and time; a bank shot doubles the
// dunk; an ice block stops the direct line and a miss resets the streak and walks him home; fish on the route score;
// keyboard launches; the clock running out ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/ice-dunk/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const settle = async () => { for (let i = 0; i < 60; i++) { await wait(100); if (await game(g => g.nori.state === 'ready')) return; } throw new Error('Nori never came back to the start'); };
    const snap = () => game(g => ({ score: g.score, time: g.time, dives: g.dives, shots: g.shots, streak: g.streak, fish: g.fish, level: g.level }));
    // 1) push-drag straight up at the first hole (it opens dead ahead)
    await game(g => g.place({ hole: [.5, .24] }));
    let a = await snap(); await page.mouse.move(195, 600); await page.mouse.down(); await page.mouse.move(195, 560, { steps: 3 }); await page.mouse.move(195, 470, { steps: 4 });
    await page.mouse.up(); await wait(150); expect(await game(g => g.nori.state === 'slide' && g.shots === 1), 'releasing the drag launches Nori'); await settle();
    let b = await snap(); expect(b.dives === 1 && b.score === a.score + 10, 'sliding into the hole is a 10-point dunk');
    expect(b.time > a.time + 1, 'a dunk wins back time'); expect((await state()).score === b.score, 'HUD shows the score');
    // 2) pull-back drag works too
    await game(g => g.place({ hole: [.5, .24] })); await page.mouse.move(195, 480); await page.mouse.down(); await page.mouse.move(195, 520, { steps: 3 }); await page.mouse.move(195, 610, { steps: 4 }); await page.mouse.up(); await settle();
    a = await snap(); expect(a.dives === 2 && a.streak === 2, 'pulling back like a slingshot also dunks');
    // 3) bank shot off the snow doubles it
    await game(g => g.place({ hole: [.22, .3] }));
    const ang = await game(g => { for (let x = -2.9; x < -.2; x += .004) { const s = g.sim(x); if (s.dunk && s.banks === 1) { const n = g.sim(x + .008); if (n.dunk && n.banks === 1) return x + .004; } } return null; });
    expect(ang != null, 'a one-bank route to the hole exists'); await game((g, x) => g.launch(x), ang); await settle();
    b = await snap(); expect(b.dives === 3 && b.score === a.score + 20, 'a bank shot dunk scores double');
    // 4) an ice block stops the straight line; a miss resets the streak and Nori returns to the start
    await game(g => g.place({ hole: [.5, .2], blocks: [[.5, .55, 130, 34]] }));
    expect(!(await game(g => g.sim(-Math.PI / 2).dunk)), 'block is in the way of the direct shot');
    await game(g => g.launch(-Math.PI / 2)); await wait(250); expect(await game(g => g.nori.state === 'slide'), 'sliding'); await settle();
    a = await snap(); const pos = await game(g => ({ n: g.nori, h: g.home }));
    expect(a.dives === 3 && a.streak === 0 && a.score === b.score, 'bouncing off the block is a miss: no score, streak reset');
    expect(Math.hypot(pos.n.x - pos.h.x, pos.n.y - pos.h.y) < 3, 'Nori is back on the start spot');
    // 5) fish on the route are scooped up
    await game(g => { g.place({ hole: [.5, .2], fish: [[.5, .5]] }); g.launch(-Math.PI / 2); }); await settle();
    b = await snap(); expect(b.fish === a.fish + 1 && b.score === a.score + 15 && b.dives === 4, 'a fish on the way adds 5 to the dunk');
    expect(b.level === 2, 'four dunks open rink 2');
    // 6) keyboard: aim with arrows, Space launches
    await page.keyboard.down('ArrowLeft'); await wait(200); await page.keyboard.up('ArrowLeft'); await page.keyboard.press('Space'); await wait(150);
    expect((await snap()).shots === b.shots + 1, 'Space launches'); await settle();
    // 7) clock runs out
    const before = (await snap()).score; await game(g => { g.time = .3; });
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    const s = await state(); expect(s.over, 'the run ends when the clock runs out'); expect(s.best >= before && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.dives === 0 && g.shots === 0 && g.level === 1 && g.time > 38 && g.nori.state === 'ready'), 'clock, rink and counters reset');
  },
};
