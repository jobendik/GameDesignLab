// Sinkstones: the path is revealed then sinks; hopping it from memory (keys + real taps) scores and builds a streak,
// lingering sinks the stone under you, reaching the far bank starts the next pond, water costs a flame, three
// misses end the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/31-sinkstones/index.html', timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.mode === 'show' && g.lives === 3 && g.round === 1), 'pond 1 starts with the reveal');
    const s0 = await game(g => ({ p: g.pos, rows: g.grid.rows })); await page.keyboard.press('ArrowUp'); await wait(250);
    expect(await game((g, a) => g.pos.r === a.rows && g.score === 0, s0), 'input is ignored while the path is being shown');
    for (let i = 0; i < 80 && (await game(g => g.mode)) === 'show'; i++) await wait(100);
    const path = await game(g => g.path), rows = s0.rows;
    expect(path.length >= rows && path[0][1] === rows - 1 && path[path.length - 1][1] === 0, 'path runs from the near row to the far row');
    const key = async (dc, dr) => { await page.keyboard.press(dc < 0 ? 'ArrowLeft' : dc > 0 ? 'ArrowRight' : dr < 0 ? 'ArrowUp' : 'ArrowDown'); await wait(260); };
    const walkBankTo = async col => { for (let i = 0; i < 6; i++) { const c = await game(g => g.pos.c); if (c === col) break; await key(Math.sign(col - c), 0); } };
    // 1) keys: line up on the bank, hop onto the first stone
    await walkBankTo(path[0][0]); await key(0, -1);
    expect(await game((g, p) => g.pos.c === p[0] && g.pos.r === p[1], path[0]), 'hopped onto the first stone');
    expect(await game(g => g.score === 10 && g.streak === 1 && g.mode === 'go'), 'a remembered stone scores and starts a streak');
    // 2) a real touch on the next stone hops there
    const xy = await game((g, p) => g.xy(p[0], p[1]), path[1]); await page.touchscreen.tap(xy[0], xy[1]); await wait(300);
    expect(await game((g, p) => g.pos.c === p[0] && g.pos.r === p[1] && g.score === 20 && g.streak === 2, path[1]), 'tapping the neighbouring stone hops onto it');
    // 3) lingering: the stone sinks under the flame
    const pat = await game(g => g.cfg.patience); await wait(pat * 1000 + 300);
    expect(await game(g => g.lives === 2 && g.streak === 0), 'standing still too long costs a flame'); await wait(900);
    expect(await game((g, p) => g.pos.c === p[0] && g.pos.r === p[1] && g.mode === 'go', path[1]), 'the flame comes back on the same stone');
    // 4) finish the crossing
    for (let i = 2; i < path.length; i++) await key(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    const before = await game(g => g.score); await key(0, -1);
    expect(await game(g => g.mode === 'clear'), 'stepping off the last stone reaches the far bank'); await wait(700);
    const after = await game(g => g.score); expect(after >= before + 50, 'crossing bonus scored (' + after + ')'); expect((await state()).score === after, 'HUD score matches');
    for (let i = 0; i < 80 && !(await game(g => g.round === 2 && (g.mode === 'hold' || g.mode === 'go'))); i++) await wait(100);
    expect(await game(g => g.round === 2), 'next pond begins');
    // 5) wrong stones: hop into open water until the light goes out
    for (let n = 0; n < 4 && !(await state()).over; n++) {
      for (let i = 0; i < 30 && (await game(g => g.mode)) !== 'go' && (await game(g => g.mode)) !== 'hold'; i++) await wait(100);
      const g2 = await game(g => { const R = g.grid.rows; for (let c = 0; c < g.grid.cols; c++) if (g.type(c, R - 1) === 0) return c; return -1; });
      expect(g2 >= 0, 'there is open water in the near row'); const l0 = await game(g => g.lives);
      await walkBankTo(g2); await key(0, -1); await wait(150);
      expect(await game(g => g.lives) === l0 - 1, 'hopping into water costs a flame'); await wait(800);
    }
    const s = await state(); expect(s.over, 'losing every flame ends the run'); expect(s.best === s.score && s.best >= after, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.round === 1 && g.lives === 3 && g.streak === 0 && g.flies === 0 && g.pos.r === g.grid.rows && g.mode === 'show'), 'pond, flames, streak and position reset');
  },
};
