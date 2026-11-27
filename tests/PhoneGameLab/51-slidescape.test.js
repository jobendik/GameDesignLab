// Slidescape: taps, line slides, drags and arrow keys move tiles; blocked moves are refused; undo refunds; solving the
// picture wins and unlocks the next scene; the board in progress persists; every generated shuffle passes the parity test.
module.exports = {
  game: 'PhoneGameLab/games/51-slidescape/index.html',
  async run({ page, expect, wait, state, game }) {
    const tap = async i => { const [x, y] = await game((g, i) => g.xy(i), i); await page.touchscreen.tap(x, y); await wait(60); };
    const snap = () => game(g => ({ cells: g.cells, gap: g.gap, moves: g.moves, home: g.home, size: g.size }));
    expect((await state()).running, 'running after autostart');
    let s = await snap(); const C = s.size[0], R = s.size[1], N = C * R;
    expect(await game(g => g.level) === 1 && C === 3 && R === 3 && s.moves === 0 && s.home < N - 1, 'level 1 is a shuffled 3×3');
    // a tile that is not in line with the gap refuses to move
    const diag = [...Array(N).keys()].find(i => i % C !== s.gap % C && (i / C | 0) !== (s.gap / C | 0));
    await tap(diag); expect((await snap()).moves === 0, 'a tile not in line with the gap does not move');
    // line slide: the far tile in the gap's row moves two tiles as one slide
    const row = s.gap / C | 0, far = s.gap % C === 0 ? row * C + C - 1 : row * C;
    await tap(far); let s2 = await snap();
    expect(s2.moves === 1 && s2.gap === far && s2.cells.filter((v, i) => v !== s.cells[i]).length === Math.abs(far - s.gap) + 1, 'tapping the far tile slides the whole line as one move');
    const ub = await game(g => g.button('undo')); await page.touchscreen.tap(ub[0], ub[1]); await wait(80);
    s2 = await snap(); expect(s2.moves === 0 && s2.cells.join() === s.cells.join(), 'undo restores the board and refunds the slide');
    // drag: a short drag springs back, a long drag commits
    const adj = s.gap % C === 0 ? s.gap + 1 : s.gap - 1, a = await game((g, i) => g.xy(i), adj), b = await game((g, i) => g.xy(i), s.gap), cell = await game(g => g.cell());
    const dragBy = async f => { await page.mouse.move(a[0], a[1]); await page.mouse.down(); await page.mouse.move(a[0] + (b[0] - a[0]) * f, a[1], { steps: 5 }); await wait(30); await page.mouse.up(); await wait(120); };
    await dragBy(.2); expect((await snap()).moves === 0, 'a short drag (20% of a cell, ' + Math.round(cell * .2) + 'px) springs back');
    await dragBy(.7); s2 = await snap(); expect(s2.moves === 1 && s2.gap === adj, 'a long drag slides the tile');
    await page.keyboard.press('z'); await wait(60); expect((await snap()).moves === 0, 'Z undoes');
    // arrow keys: the tile beside the gap moves in the arrow direction
    await page.keyboard.press(s.gap % C === 0 ? 'ArrowLeft' : 'ArrowRight'); await wait(60);
    s2 = await snap(); expect(s2.moves === 1 && s2.gap === adj, 'arrow key slides the neighbouring tile');
    // toggles
    const nb = await game(g => g.button('nums')); await page.touchscreen.tap(nb[0], nb[1]); await wait(60); expect(await game(g => g.nums) === true, 'number overlay toggles');
    const pb = await game(g => g.button('peek')); await page.touchscreen.tap(pb[0], pb[1]); await wait(60); expect(await game(g => g.peek) === true, 'peek shows the finished picture');
    // solve with a breadth-first search over single taps, played through real taps
    s = await snap(); const goal = [...Array(N).keys()].join(), seen = new Map([[s.cells.join(), null]]), q = [s.cells]; let path = null;
    while (q.length && !path) {
      const cur = q.shift(), g = cur.indexOf(N - 1);
      for (const d of [-1, 1, -C, C]) {
        const n = g + d; if (n < 0 || n >= N || (Math.abs(d) === 1 && (n / C | 0) !== (g / C | 0))) continue;
        const nx = cur.slice(); nx[g] = nx[n]; nx[n] = N - 1; const k = nx.join(); if (seen.has(k)) continue; seen.set(k, [cur.join(), n]); q.push(nx);
        if (k === goal) { path = []; for (let key = k; seen.get(key); key = seen.get(key)[0]) path.unshift(seen.get(key)[1]); break; }
      }
    }
    expect(path && path.length > 0 && path.length <= 8, 'level 1 is a few slides from solved (' + (path && path.length) + ')');
    const m0 = s.moves; for (const i of path) await tap(i);
    expect(await game(g => g.done && g.home === 8) && (await snap()).moves === m0 + path.length, 'every tap was one slide and the picture is complete');
    await wait(2700); let st = await state(); expect(st.over && st.best === 1, 'solving wins and records scene 1');
    expect(await page.evaluate(() => !!document.querySelector('.lab-win')), 'win card shown');
    await page.keyboard.press('Enter'); await wait(500);
    st = await state(); expect(st.running && !st.over && await game(g => g.level === 2 && g.moves === 0 && !g.done), 'next scene starts clean');
    // persistence of the board in progress
    s = await snap(); await page.keyboard.press(s.gap % C === 0 ? 'ArrowLeft' : 'ArrowRight'); await wait(80); s = await snap(); expect(s.moves === 1, 'one slide on scene 2');
    await page.reload({ waitUntil: 'load' }); await wait(500);
    s2 = await snap(); expect(await game(g => g.level) === 2 && s2.moves === 1 && s2.cells.join() === s.cells.join(), 'level and board in progress survive a reload');
    const rb = await game(g => g.button('reset')); await page.touchscreen.tap(rb[0], rb[1]); await wait(400);
    expect((await snap()).moves === 0, 'reset returns to the original shuffle');
    // every shuffle is solvable (permutation parity), sizes grow, bolted tiles appear
    const info = await game(g => Array.from({ length: 18 }, (_, i) => g.solvable(i + 1)));
    expect(info.every(r => r[0]), 'all 18 generated shuffles pass the parity test');
    expect(info[5][1] === 4 && info[9][1] === 5 && info[9][2] === 5 && info[7][4] === 1, 'boards grow to 5×5 and scene 8 has a bolted tile');
  },
};
