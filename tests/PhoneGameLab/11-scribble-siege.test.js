// Scribble Siege: relative drag steers, auto-fire erases doodles and scores, caught stars build the chain and charge the
// eraser, the eraser wipes bullets + doodles and clears the wave, the boss takes damage, a hit on the last life ends the run.
module.exports = {
  game: 'PhoneGameLab/games/11-scribble-siege/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.wave === 1 && g.lives === 3 && g.foes.length === 18), 'wave 1: eighteen doodles, three lives');
    // hover places the rocket, a held drag moves it relatively (finger never has to cover it)
    await page.mouse.move(100, 520); await wait(300);
    expect(Math.abs((await game(g => g.ship.x)) - 100) < 6, 'mouse hover positions the rocket');
    await page.mouse.down(); await page.mouse.move(180, 560, { steps: 5 }); await wait(300); await page.mouse.up();
    expect(Math.abs((await game(g => g.ship.x)) - 200) < 10, 'a held drag moves the rocket by 1.25× the finger travel');
    await page.keyboard.down('ArrowRight'); await wait(300); await page.keyboard.up('ArrowRight');
    expect((await game(g => g.ship.x)) > 250, 'arrow keys steer too');
    // real play: sit under the lowest doodle, sidestep ink, then chase stars
    const play = async (until, ms, stars) => {
      const t0 = Date.now();
      while (Date.now() - t0 < ms) {
        const s = await game(g => ({ ship: g.ship, foes: g.foes, eb: g.ebul, stars: g.stars, boss: g.boss, score: g.score, kills: g.kills, chain: g.chain, eraser: g.eraser, wave: g.wave }));
        if ((await state()).over || until(s)) return s;
        let tx = s.ship.x; const low = s.foes.filter(f => f.state !== 'dive').sort((a, b) => b.y - a.y || Math.abs(a.x - s.ship.x) - Math.abs(b.x - s.ship.x))[0];
        if (s.boss) tx = s.boss.x; else if (low) tx = low.x + 10;
        const st = stars && s.stars.sort((a, b) => b.y - a.y)[0]; if (st) tx = st.x;
        const th = s.eb.filter(b => b.y > s.ship.y - 150 && b.y < s.ship.y + 10 && Math.abs(b.x - tx) < 26)[0]; if (th) tx = th.x + (th.x > 195 ? -46 : 46);
        await page.mouse.move(tx, s.ship.y + 40); await wait(30);
      }
      return null;
    };
    const k = await play(s => s.kills >= 4, 20000);
    expect(k && k.kills >= 4 && k.score >= 40, 'auto-fire erases doodles and scores');
    expect((await state()).score === (await game(g => g.score)), 'HUD score matches');
    const c = await play(s => s.chain >= 2, 20000, true);
    expect(c && c.chain >= 2 && c.eraser > 0, 'caught stars build the chain and charge the eraser');
    // eraser: nothing when empty; when full it wipes ink and takes a hit off every doodle
    const b = await game(g => g.btn), e0 = await game(g => g.eraser);
    if (e0 < 1) { expect(!(await game(g => g.erase())), 'eraser does nothing until it is full'); }
    await game(g => { g.skipTo(1); g.fillEraser(); }); await wait(1300);
    expect((await game(g => g.foes.length)) >= 12, 'a fresh wave of one-hit Blots to wipe');
    await page.touchscreen.tap(b.x, b.y); await wait(900);
    expect((await game(g => g.eraser)) === 0 && (await game(g => g.foes.length)) === 0 && (await game(g => g.ebul.length)) === 0, 'tapping ERASE wipes the page');
    for (let i = 0; i < 30 && (await game(g => g.wave)) < 2; i++) await wait(100);
    expect((await game(g => g.wave)) === 2, 'clearing the page starts the next wave');
    expect((await game(g => g.foes.filter(f => f.kind === 'spike').length)) === 6, 'wave 2 brings the ink-spitting Spikes');
    // boss
    await game(g => { g.skipTo(4); g.calm(true); });
    const bs = await play(s => s.boss && s.boss.hp <= s.boss.max - 5, 20000);
    expect(bs && bs.boss.hp <= bs.boss.max - 5, 'the boss takes damage from rocket fire');
    await game(g => g.fillEraser()); const h0 = await game(g => g.boss.hp); await page.keyboard.press('Space'); await wait(700);
    expect((await game(g => g.boss ? g.boss.hp : 0)) <= h0 - 10, 'the eraser takes a chunk out of the boss');
    // lose: last life, parked between two sticky notes under aimed fire
    await game(g => { g.skipTo(2); g.setLives(1); g.calm(false); });
    await page.mouse.move(136, 780);
    for (let i = 0; i < 160 && !(await state()).over; i++) await wait(250);
    const s = await state(); expect(s.over, 'being hit on the last life ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.wave === 1 && g.lives === 3 && g.chain === 0 && g.eraser === 0 && g.kills === 0 && g.foes.length === 18 && !g.boss && g.notes.every(h => h === 5)), 'state fully reset');
  },
};
