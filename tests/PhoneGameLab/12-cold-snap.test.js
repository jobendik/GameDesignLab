// Cold Snap: the floating stick turns with a small drag and thrusts with a large one, the tug keeps gliding (inertia) and
// wraps, auto-fire splits a berg down to nothing, sunstones raise the chain, clearing the sea starts the next wave,
// ramming ice on the last life ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/12-cold-snap/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.wave === 1 && g.lives === 3 && g.ice.length === 3), 'wave 1: three pieces of ice, three lives');
    await game(g => { g.clearIce(); g.calm(true); }); // empty sea to test the helm in peace
    const AX = 195, AY = 650;
    // small drag = turn only
    await page.mouse.move(AX, AY); await page.mouse.down(); await page.mouse.move(AX + 15, AY, { steps: 3 }); await wait(450);
    let s = await game(g => g.ship);
    expect(Math.abs(Math.atan2(Math.sin(s.a), Math.cos(s.a))) < .12, 'a small drag turns the bow toward the drag direction');
    expect(s.speed < 8, 'a small drag does not thrust');
    // large drag = thrust; release = glide
    await page.mouse.move(AX + 62, AY, { steps: 3 }); await wait(700);
    s = await game(g => g.ship); expect(s.vx > 120 && Math.abs(s.vy) < 30, 'a long drag thrusts along the bow');
    await page.mouse.up(); await wait(500);
    const s2 = await game(g => g.ship); expect(s2.speed > s.speed * .6 && s2.speed < s.speed, 'released, the tug keeps gliding and slowly loses way');
    // wrap-around
    await page.mouse.move(AX, AY); await page.mouse.down(); await page.mouse.move(AX + 62, AY, { steps: 3 });
    let wrapped = false, px = (await game(g => g.ship)).x;
    for (let i = 0; i < 80 && !wrapped; i++) { await wait(50); const x = (await game(g => g.ship)).x; if (x < px - 200) wrapped = true; px = x; }
    expect(wrapped, 'leaving the right edge brings the tug back on the left');
    await page.mouse.up(); await game(g => g.stop());
    // keyboard helm
    const a0 = (await game(g => g.ship)).a; await page.keyboard.down('ArrowLeft'); await wait(300); await page.keyboard.up('ArrowLeft');
    expect((await game(g => g.ship)).a < a0 - .5, 'arrow keys turn the tug');
    await page.keyboard.down('ArrowUp'); await wait(300); await page.keyboard.up('ArrowUp');
    expect((await game(g => g.ship)).speed > 40, 'up arrow thrusts'); await game(g => g.stop());
    // auto-fire: keep the bow on the nearest ice until a berg is broken all the way down
    await game(g => { const s = g.ship; g.spawnIce(2, s.x < 195 ? s.x + 150 : s.x - 150, s.y, 0, 0); });
    expect(await game(g => g.ice.length === 1 && g.ice[0].tier === 2 && g.ice[0].hp === 3), 'one berg placed');
    await page.mouse.move(AX, AY); await page.mouse.down();
    const hunt = async (until, ms) => {
      const t0 = Date.now();
      while (Date.now() - t0 < ms) {
        const q = await game(g => ({ ship: g.ship, ice: g.ice, score: g.score, wave: g.wave, broke: g.broke }));
        if (until(q)) return q;
        const n = q.ice.sort((a, b) => Math.hypot(a.x - q.ship.x, a.y - q.ship.y) - Math.hypot(b.x - q.ship.x, b.y - q.ship.y))[0];
        if (n) { const a = Math.atan2(n.y - q.ship.y, n.x - q.ship.x), far = Math.hypot(n.x - q.ship.x, n.y - q.ship.y) > 260, d = far ? 55 : 15; await page.mouse.move(AX + Math.cos(a) * d, AY + Math.sin(a) * d); } // chase stragglers under thrust
        await wait(30);
      }
      return null;
    };
    const sp = await hunt(q => q.broke >= 1, 8000);
    expect(sp && sp.ice.length === 2 && sp.ice.every(i => i.tier === 1) && sp.score === 20, 'three hits split the berg into two floes (+20)');
    const done = await hunt(q => q.wave === 2, 40000);
    expect(done && done.broke === 7, 'berg → 2 floes → 4 chunks: seven pieces broken');
    expect(done.score >= 20 + 100 + 400 + 100, 'pieces and the cleared-sea bonus were scored');
    expect(done.ice.length >= 4, 'clearing the sea brings the next, bigger wave');
    await page.mouse.up();
    // sunstones: scooped by proximity, they build the chain
    const sc = await game(g => g.score), st = await game(g => g.stones);
    await game(g => { g.clearIce(); g.stop(); const s = g.ship, f = g.field, dx = s.x < f.W / 2 ? 1 : -1, dy = s.y < (f.top + f.H) / 2 ? 1 : -1; g.spawnGem(s.x + dx * 40, s.y); g.spawnGem(s.x + dx * 20, s.y + dy * 35); }); // placed toward mid-sea so they cannot wrap away await wait(700);
    const gm = await game(g => ({ stones: g.stones, chain: g.chain, score: g.score }));
    expect(gm.stones >= st + 2 && gm.chain >= 2 && gm.score > sc, 'nearby sunstones are pulled in, scored and chained ' + JSON.stringify([gm, st, sc, await game(g => [g.gems.length, g.lives, g.wave, g.ice.length]), await state()]));
    expect((await state()).score === (await game(g => g.score)), 'HUD score matches');
    // lose: last life, a floe drifts into the tug
    await game(g => { g.setLives(1); g.calm(false); const s = g.ship, dx = s.x < g.field.W / 2 ? 1 : -1; g.spawnIce(1, s.x + dx * 90, s.y, -dx * 120, 0); });
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const e = await state(); expect(e.over, 'hitting ice on the last life ends the run'); expect(e.best >= e.score && e.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.wave === 1 && g.lives === 3 && g.chain === 0 && g.stones === 0 && g.broke === 0 && g.ice.length === 3 && g.gems.length === 0 && g.ship.speed === 0), 'state fully reset');
  },
};
