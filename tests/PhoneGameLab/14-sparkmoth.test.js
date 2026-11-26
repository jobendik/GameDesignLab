// Sparkmoth: drag-relative movement (finger offset), the show spawns sparks, survival scores, skims charge glow → flare
// absorbs a hit and clears the sky, unshielded hits cost lives → game over, best persists, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/14-sparkmoth/index.html',
  timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.lives === 3 && g.pattern === 'Peony'), 'starts with 3 lives on the first pattern');
    // --- drag-relative: the moth copies the thumb's motion (×1.2) from wherever it is, not the thumb's position
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p[0], y: p[1], id: 1 })) });
    const p0 = await game(g => ({ x: g.player.x, y: g.player.y }));
    await touch('touchStart', [[310, 760]]); for (let i = 1; i <= 6; i++) await touch('touchMove', [[310 - i * 10, 760 - i * 5]]); await wait(80);
    const p1 = await game(g => ({ x: g.player.x, y: g.player.y }));
    expect(Math.abs((p1.x - p0.x) + 72) < 4 && Math.abs((p1.y - p0.y) + 36) < 4, 'moth moved by 1.2× the drag (' + (p1.x - p0.x).toFixed(1) + ',' + (p1.y - p0.y).toFixed(1) + ')');
    expect(Math.hypot(p1.x - 250, p1.y - 730) > 60, 'moth is not under the finger');
    await touch('touchEnd', []);
    await page.keyboard.down('ArrowRight'); await wait(250); await page.keyboard.up('ArrowRight');
    expect((await game(g => g.player.x)) > p1.x + 30, 'arrow keys move too');
    // --- the show itself produces sparks, and surviving scores
    for (let i = 0; i < 40 && (await game(g => g.bullets.length)) === 0; i++) await wait(150);
    expect((await game(g => g.bullets.length)) > 5, 'the first shell bursts into a ring of sparks');
    const s0 = await game(g => g.score); await wait(600);
    expect((await game(g => g.score)) > s0, 'score rises while surviving'); expect((await state()).score > 0, 'HUD score updated');
    // --- skim: a spark passing just beside the heart counts once and costs nothing
    await game(g => { g.clear(); const P = g.player; P.x = g.area.x + g.area.w / 2; P.y = g.area.y + g.area.h * .7; P.inv = 0; });
    await game(g => { const P = g.player; g.bullet(P.x + 14 * g.S, P.y - 150, 0, 320); }); await wait(900);
    const k = await game(g => ({ gz: g.grazes, lives: g.lives, glow: g.glow, n: g.bullets.length }));
    expect(k.gz === 1 && k.lives === 3 && k.glow > 0, 'near miss = one skim, no damage, glow charged');
    // --- a stream of skims fills the glow → flare ready, multiplier up
    await game(g => { const P = g.player; for (let i = 0; i < 34; i++) g.bullet(P.x + (i % 2 ? 13 : -13) * g.S, P.y - 120 - i * 16, 0, 520); }); await wait(600);
    expect((await game(g => g.mult)) > 1, 'skimming raises the multiplier');
    await wait(1300);
    expect(await game(g => g.shield === true && g.lives === 3), 'full glow arms the flare');
    // --- flare: the next hit is absorbed and every spark becomes points
    const s1 = await game(g => g.score);
    await game(g => { const P = g.player, A = g.area; for (let i = 0; i < 20; i++) g.bullet(A.x + 20 + i * 15, A.y + 100, 0, 5); g.bullet(P.x, P.y - 90, 0, 400); }); await wait(700);
    const f = await game(g => ({ lives: g.lives, shield: g.shield, flares: g.flares, n: g.bullets.length, score: g.score }));
    expect(f.lives === 3 && !f.shield && f.flares === 1, 'flare absorbs the hit'); expect(f.n === 0 && f.score >= s1 + 60, 'flare clears the sky for points');
    // --- unshielded hits cost lives; three end the run
    for (let n = 2; n >= 0; n--) {
      for (let i = 0; i < 30 && (await game(g => g.player.inv)) > 0; i++) await wait(150);
      await game(g => { const P = g.player; g.bullet(P.x, P.y - 60, 0, 400); }); await wait(500);
      expect((await game(g => g.lives)) === n, 'direct hit leaves ' + n + ' lives');
    }
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'losing the last life ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(400);
    const z = await state(); expect(z.running && !z.over && z.score < 20, 'restart gives a clean run');
    expect(await game(g => g.lives === 3 && g.bullets.length === 0 && g.grazes === 0 && g.glow === 0 && g.index === 0 && g.tier === 1), 'lives, sparks, glow and show position reset');
  },
};
