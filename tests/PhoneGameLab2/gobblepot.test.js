// Gobblepot: a real drag steers the pot onto litter and it is gobbled (score, growth); the tidy ladder climbs on bigger
// gobbles and breaks on a smaller one; things too big for the mouth are not gobbled; tulips and napping Momo cost time;
// the keyboard steers; an emptied garden that met its goal moves on to the next one (pot reset, tulip beds appear);
// the sun setting below the goal ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/gobblepot/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let r = await game(g => ({ gi: g.garden, ru: g.pot.ru, n: g.items().filter(o => o.t >= 0).length, mult: g.mult }));
    expect(r.gi === 0 && r.ru === 21 && r.n > 30 && r.mult === 1, 'fresh garden full of clutter, small pot, ×1');
    // a real mouse drag steers the pot onto a leaf
    const P = await game(g => { g.clear(); const G = g.G, x = G.x + G.w * .3, y = G.y + G.h * .5; g.setPot(x, y); g.spawn(7, G.x + G.w - 40, G.y + 40); g.spawn(0, x + 80, y); return { x, y }; });
    await page.mouse.move(195, 600); await page.mouse.down(); await page.mouse.move(265, 600, { steps: 8 }); await wait(250); await page.mouse.up(); await wait(250);
    r = await game(g => ({ s: g.score, n: g.gobbled, ru: g.pot.ru, x: g.pot.x, left: g.items().length }));
    expect(r.x > P.x + 40, 'dragging moves the pot');
    expect(r.n === 1 && r.s === 1 && r.left === 1 && r.ru > 21, 'the leaf is gobbled: +1 and the pot grows');
    await wait(100); expect((await state()).score === 1, 'HUD shows the score');
    // the ladder: acorn (bigger) ×2, apple ×3, then a leaf (smaller) breaks it
    const seq = [];
    for (const t of [1, 2, 0]) { await game((g, t) => { const p = g.pot; g.spawn(t, p.x, p.y); }, t); await wait(160); seq.push(await game(g => [g.score, g.mult, g.chainLast])); }
    expect(seq[0][0] === 1 + 2 * 2 && seq[0][1] === 2, 'a bigger gobble climbs the ladder: acorn ×2');
    expect(seq[1][0] === 5 + 3 * 3 && seq[1][1] === 3, 'apple ×3');
    expect(seq[2][0] === 14 + 1 && seq[2][1] === 1 && seq[2][2] === 0, 'a smaller gobble breaks the ladder back to ×1');
    // too big for the mouth: the gnome only wobbles
    r = await game(g => { const p = g.pot; g.setPot(p.x, p.y, 21); g.spawn(5, p.x, p.y); return g.score; }); await wait(400);
    expect(await game(g => g.items().filter(o => o.t === 5).length) === 1 && await game(g => g.score) === r, 'a gnome is too big for a small pot');
    // tulips cost three seconds and the ladder
    r = await game(g => { g.clear(); const p = g.pot, G = g.G; g.spawn(7, G.x + G.w - 40, G.y + 40); g.spawn(1, p.x, p.y); return g.time; }); await wait(150);
    r = await game((g, t0) => { const p = g.pot; g.flower(p.x, p.y); return t0; }, r); await wait(160);
    let q = await game(g => ({ lost: g.lost, t: g.time, mult: g.mult, chain: g.chainLast }));
    expect(q.lost === 1 && q.t < r - 2.5 && q.chain === -1, 'gobbling a tulip costs ~3 s and resets the ladder');
    // napping Momo: a huge pot spits him out (−4 s), he lands somewhere else
    r = await game(g => { const p = g.pot; g.napAt(p.x, p.y); g.setPot(p.x, p.y, 70); return [g.time, p.x, p.y]; }); await wait(150);
    q = await game(g => ({ t: g.time, nap: g.nap }));
    expect(q.t < r[0] - 3.5 && Math.hypot(q.nap.x - r[1], q.nap.y - r[2]) > 10, 'Momo is spat out and costs ~4 s');
    // keyboard steering
    await game(g => { g.clear(); const G = g.G; g.spawn(7, G.x + G.w - 40, G.y + 40); g.setPot(G.x + G.w * .3, G.y + G.h * .5, 21); });
    const x0 = await game(g => g.pot.x); await page.keyboard.down('ArrowRight'); await wait(350); await page.keyboard.up('ArrowRight'); await wait(150);
    expect(await game(g => g.pot.x) > x0 + 40, 'arrow keys steer the pot');
    // empty the garden (goal met) → next garden: pot resets, tulip beds appear
    await game(g => { g.clear(); const p = g.pot; g.setTime(30); g.spawn(3, p.x, p.y); }); await wait(200);
    expect(await game(g => g.phase) === 'judge' && await game(g => g.tidy) === 1, 'gobbling the last thing ends the garden 100% tidy');
    for (let i = 0; i < 20 && (await game(g => g.garden)) === 0; i++) await wait(200);
    r = await game(g => ({ gi: g.garden, ru: g.pot.ru, fl: g.items().filter(o => o.t < 0).length, t: g.time, s: g.score, ph: g.phase }));
    if (!(r.gi === 1 && r.ru === 21 && r.fl >= 6 && r.t > 27)) console.log(JSON.stringify(r));
    expect(r.gi === 1 && r.ru === 21 && r.fl >= 6 && r.t > 27 && r.ph === 'play', 'Tulip Walk: fresh small pot, tulip beds, full sun');
    expect(r.s > 40, 'tidy bonus paid (goal margin + time left)');
    // sun sets below the goal → the run ends
    await game(g => g.setTime(.2));
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    const s = await state(); expect(s.over, 'sunset below the goal ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    expect(await game(g => g.garden === 0 && g.pot.ru === 21 && g.mult === 1 && g.gobbled === 0 && g.lost === 0 && g.items().length > 30), 'garden, pot, ladder and counters reset');
  },
};
