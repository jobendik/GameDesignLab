// Ribbon Rodeo: mouse steering, eating bows, dash burns tail, lassoing bows with a closed loop, snipping a rival on
// your ribbon, dying on a rival's ribbon, clean restart, and the sunset finish with the podium bonus.
module.exports = {
  game: 'PhoneGameLab/games/62-ribbon-rodeo/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.kites.length === 9 && g.me.len >= g.START && g.me.len < g.START + 5), 'player + eight rivals at the start');
    const p0 = await game(g => g.kites.filter(k => k !== g.me).map(k => k.x + k.y));
    await wait(400);
    expect(await game((g, a) => g.kites.filter(k => k !== g.me).some((k, i) => Math.abs(k.x + k.y - a[i]) > 5), p0), 'rival kites fly on their own');
    await game(g => g.clearBots());
    // mouse steering: the kite turns toward the pointer (head sits near the middle of the play area)
    await page.mouse.move(370, 460); await wait(1100);
    expect(await game(g => Math.abs(Math.atan2(Math.sin(g.me.ang), Math.cos(g.me.ang))) < .45), 'kite steers toward the pointer');
    // eat a bow placed in the flight path
    const e0 = await game(g => { const m = g.me; g.aim(m.ang); g.addBow(m.x + Math.cos(m.ang) * 70, m.y + Math.sin(m.ang) * 70, 3); return { s: g.score, len: g.me.len }; });
    await wait(900);
    const e = await game(g => ({ s: g.score, len: g.me.len })); expect(e.s >= e0.s + 3 && e.len >= e0.len + 3, 'flying through a bow scores and lengthens the tail');
    expect((await state()).score >= e.s, 'HUD score follows');
    // dash: holding the button speeds up and burns tail
    await game(g => g.grow(70)); await wait(300);
    const l0 = await game(g => g.me.len);
    await page.mouse.down(); await wait(900);
    const d = await game(g => ({ sp: g.me.sp, burnt: g.burnt, drops: g.bows.filter(b => b.drop).length })); await page.mouse.up();
    expect(l0 > 80 && d.sp > 220 && d.burnt >= 3 && d.drops >= 3, 'dash is faster and costs tail');
    await wait(2600); // let the ribbon grow out to its full length
    // lasso: fly a wide circle with pulsed right turns around three bows
    const sc0 = await game(g => { const m = g.me; g.aim(m.ang); const cx = m.x + Math.cos(m.ang + Math.PI / 2) * 86 + Math.cos(m.ang) * 10, cy = m.y + Math.sin(m.ang + Math.PI / 2) * 86 + Math.sin(m.ang) * 10; for (let i = 0; i < 3; i++) g.addBow(cx + i * 6 - 6, cy, 1); return g.score; });
    for (let i = 0; i < 40 && !(await game(g => g.lassos)); i++) { await page.keyboard.down('ArrowRight'); await wait(150); await page.keyboard.up('ArrowRight'); await wait(150); }
    const la = await game(g => ({ n: g.lassos, s: g.score })); expect(la.n >= 1, 'closing a loop around bows triggers a lasso');
    expect(la.s >= sc0 + 6, 'lassoed bows count double');
    // a rival flying into our ribbon is snipped
    const k0 = await game(g => { const m = g.me; g.aim(m.ang); const b = m.pts[18], nx = Math.cos(m.ang + Math.PI / 2), ny = Math.sin(m.ang + Math.PI / 2); g.dummy(b.x + nx * 110 + Math.cos(m.ang) * 60, b.y + ny * 110 + Math.sin(m.ang) * 60, m.ang - Math.PI / 2, 10, 150); return { k: g.kills, s: g.score }; });
    await wait(1400);
    const k1 = await game(g => ({ k: g.kills, s: g.score })); expect(k1.k === k0.k + 1 && k1.s >= k0.s + 30, 'rival that hits our ribbon is snipped for points');
    // flying into a rival's ribbon ends the run
    await game(g => { const m = g.me; g.aim(m.ang); const dx = Math.cos(m.ang), dy = Math.sin(m.ang), nx = -dy, ny = dx; g.dummy(m.x + dx * 110 - nx * 80, m.y + dy * 110 - ny * 80, Math.atan2(-ny, -nx), 40, 0); });
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'hitting a ribbon ends the run'); expect(s.best >= s.score && s.best > 0, 'best recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score < 5, 'restart gives a clean run');
    expect(await game(g => g.kites.length === 9 && g.me.len < g.START + 5 && g.kills === 0 && g.time < 2), 'world reset after restart');
    // sunset: surviving to the end with the longest tail wins the podium bonus
    await game(g => { g.clearBots(); g.setTime(g.ROUND - .3); });
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const f = await state(); expect(f.over && f.score >= 300, 'the round ends at sunset with the podium bonus');
  },
};
