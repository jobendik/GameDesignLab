// Tea Break: drag moves the tray, release serves, a real rally scores with a rising multiplier, power-ups apply,
// clearing the tin advances the level, missing with the last ball ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/09-tea-break/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.mode === 'serve' && g.balls.length === 1 && g.balls[0].stuck), 'ball waits on the tray');
    const pad0 = await game(g => g.pad);
    // drag moves the tray; holding does not serve; releasing does
    await wait(400);
    await page.mouse.move(pad0.x, pad0.y + 30); await page.mouse.down(); await page.mouse.move(300, pad0.y + 30, { steps: 6 }); await wait(250);
    expect(Math.abs((await game(g => g.pad.x)) - 300) < 10, 'tray follows the drag');
    expect(await game(g => g.mode) === 'serve', 'still serving while the finger is down');
    expect(Math.abs((await game(g => g.balls[0].x)) - 300) < 10, 'ball rides the tray');
    await page.mouse.up(); await wait(120);
    expect(await game(g => g.mode === 'play' && g.balls[0].vy < 0), 'release serves the ball upward');
    // play for real: keep the tray under the lowest falling ball
    const follow = async (until, ms, dodge) => {
      const t0 = Date.now();
      while (Date.now() - t0 < ms) {
        const s = await game(g => ({ balls: g.balls, pad: g.pad, mode: g.mode, score: g.score, level: g.level, lives: g.lives, left: g.left }));
        if ((await state()).over || until(s)) return s;
        if (s.mode === 'serve') { await page.keyboard.press('Space'); await wait(60); }
        const b = s.balls.filter(b => b.vy > 0).sort((a, b) => b.y - a.y)[0] || s.balls[0];
        if (b) await page.mouse.move(dodge ? (b.x < 195 ? 350 : 40) : b.x + Math.sin(Date.now() / 250) * s.pad.w * .28, s.pad.y + 30);
        await wait(16);
      }
      return null;
    };
    const left0 = await game(g => g.left);
    const r1 = await follow(s => s.score >= 80, 30000);
    expect(r1 && r1.score >= 80, 'rallying breaks biscuits and scores');
    expect((await game(g => g.left)) < left0, 'biscuits were removed');
    expect((await game(g => g.bestCombo)) >= 2, 'several biscuits between tray touches build a rally');
    expect((await state()).score === (await game(g => g.score)), 'HUD score matches');
    // power-ups: big tray widens, split adds balls, net is armed
    const w0 = await game(g => g.pad.w); await game(g => g.givePower('wide')); await wait(500);
    expect((await game(g => g.pad.w)) > w0 * 1.3, 'big tray widens the paddle');
    const n0 = await game(g => g.balls.length); await game(g => g.givePower('multi')); await wait(50);
    expect((await game(g => g.balls.length)) > n0, 'split adds balls');
    // clear the tin: thin it to two biscuits and finish them by play
    await game(g => g.keep(2));
    const lv = await follow(s => s.level === 2 && s.mode === 'serve', 45000);
    expect(lv && lv.level === 2, 'clearing every biscuit advances to the next tin');
    expect((await game(g => g.left)) > 20, 'a fresh wall is built');
    // keyboard: arrows move, space serves
    await page.mouse.move(195, 700); await wait(200);
    const kx = await game(g => g.pad.x); await page.keyboard.down('ArrowLeft'); await wait(300); await page.keyboard.up('ArrowLeft');
    expect((await game(g => g.pad.x)) < kx - 40, 'arrow keys move the tray');
    await wait(400); await page.keyboard.press('Space'); await wait(100);
    expect(await game(g => g.mode) === 'play', 'space serves');
    // lose: one ball left, keep the tray away from it
    await game(g => g.setLives(1));
    await follow(() => false, 30000, true);
    const s = await state(); expect(s.over, 'missing the last ball ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.lives === 3 && g.level === 1 && g.mode === 'serve' && g.balls.length === 1 && g.drops.length === 0 && !g.wide), 'state fully reset');
  },
};
