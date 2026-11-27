// Postage Stamp: real swipes are the shot — the ball flies to where the pointer lets go.  A swipe to a stamp scores a
// goal and franks it, a second goal is multiplied by the streak, a bowed swipe puts curl on the ball, a wide ball and a
// shot at the keeper each cost a life, the keyboard can kick, three misses end the run, restart is clean.
// Targets come from the game's own dry-run planner (same stepShot as live play).
module.exports = {
  game: 'PhoneGameLab/games/41-postage-stamp/index.html',
  timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    const until = async (fn, ms) => { for (let t = 0; t < ms; t += 80) { if (await game(fn)) return true; await wait(80); } return false; };
    // swipe from the ball to a screen point; `bow` px bends the path sideways (to the right when positive)
    const swipe = async (to, bow) => {
      expect(await until(g => g.state === 'ready', 8000), 'ready for the next kick');
      const b = await game(g => g.ball), n = await game(g => g.kicks);
      await page.mouse.move(b.x, b.y); await page.mouse.down();
      for (let i = 1; i <= 8; i++) { const u = i / 8; await page.mouse.move(b.x + (to.x - b.x) * u + (bow || 0) * Math.sin(u * Math.PI), b.y + (to.y - b.y) * u); }
      await page.mouse.up(); await wait(60);
      expect(await game(g => g.kicks) === n + 1, 'the swipe kicks the ball');
      expect(await until(g => g.last && g.last.res, 6000), 'the shot resolves');
      return game(g => g.last);
    };
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.lives === 3 && g.goals === 0 && g.score === 0 && g.level === 1 && g.state === 'ready' && g.wall === 0), 'fresh run: 3 lives, level 1, no wall');

    // 1) a tap is not a kick
    await page.mouse.click(195, 600); await wait(150);
    expect(await game(g => g.kicks) === 0, 'a tap does not kick');

    // 2) swipe to the stamp: goal + franked stamp = 100 + 200
    let pl = await game(g => g.plan('stamp')); expect(pl, 'planner finds a stamp shot');
    let k = await swipe(pl);
    expect(k.res === 'goal' && k.p > .8, 'a fast swipe to the stamp scores (' + k.res + ', power ' + k.p.toFixed(2) + ')');
    expect(Math.abs(k.xt - pl.xt) < .25 && Math.abs(k.yt - pl.yt) < .25, 'the ball was aimed where the pointer let go');
    expect(await game(g => g.score === 300 && g.goals === 1 && g.stamps === 1 && g.streak === 1 && g.lives === 3), 'goal 100 + stamp 200');
    expect((await state()).score === 300, 'HUD score mirrors game score');

    // 3) a second goal away from the stamp is doubled by the streak
    expect(await until(g => g.state === 'ready', 8000), 'next kick is set up');
    pl = await game(g => g.plan('goal')); expect(pl, 'planner finds a plain goal'); k = await swipe(pl);
    expect(k.res === 'goal', 'second goal'); expect(await game(g => g.score === 500 && g.streak === 2 && g.level === 2), 'streak ×2: +200, level 2 reached');

    // 4) level 2 puts a wall up; a bowed swipe puts curl on the ball; sending it wide of the post costs a life
    expect(await until(g => g.state === 'ready', 8000) && await game(g => g.wall) === 2, 'a two-man wall at level 2');
    k = await swipe(await game(g => g.plan('wide')), 70);
    expect(k.curl < -3, 'a swipe bowed to the right bends the ball back to the left (curl ' + k.curl.toFixed(1) + ')');
    expect(k.res !== 'goal' && await game(g => g.lives === 2 && g.streak === 0 && g.score === 500), 'a miss costs a life and the streak, no points');

    // 5) straight at the keeper: saved
    expect(await until(g => g.state === 'ready', 8000), 'next kick'); k = await swipe(await game(g => g.plan('saved')));
    expect(k.res === 'saved', 'a shot at the keeper is saved (' + k.res + ')'); expect(await game(g => g.lives) === 1, 'second life lost');

    // 6) keyboard kick, then miss until the run is over
    expect(await until(g => g.state === 'ready', 8000), 'next kick'); const n = await game(g => g.kicks);
    await page.keyboard.press('ArrowUp'); await wait(100); expect(await game(g => g.kicks) === n + 1, 'a key kicks the ball');
    await until(g => g.last && g.last.res, 6000);
    for (let i = 0; i < 4 && await game(g => g.lives) > 0; i++) await swipe(await game(g => g.plan('wide')));
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(200);
    const e = await state(); expect(e.over, 'three misses end the run'); expect(e.best >= e.score && e.score >= 500, 'best score recorded');

    // 7) restart is clean
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.lives === 3 && g.goals === 0 && g.kicks === 0 && g.streak === 0 && g.stamps === 0 && g.level === 1 && g.state === 'ready' && g.wall === 0), 'state fully reset');
  },
};
