// Alphabroth: generated boards are sound, dragging a word scores (with a simmer multiplier), wrong drags do not,
// tap–tap selection and hints work, progress survives a reload, the secret earns the third star, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/58-alphabroth/index.html',
  async run({ page, expect, wait, state, game }) {
    const drag = async w => { await page.mouse.move(w.x0, w.y0); await page.mouse.down(); await page.mouse.move((w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2, { steps: 3 }); await page.mouse.move(w.x1, w.y1, { steps: 3 }); await page.mouse.up(); await wait(120); };
    const words = () => game(g => g.words);
    expect((await state()).running, 'running after autostart');
    expect(await game(g => g.level === 1 && g.size === 6 && g.mode === 'play'), 'starts on bowl 1 (6×6)');
    // generator: every word (and the secret) sits where it says and occurs exactly once in all 8 directions
    const bad = await game(g => {
      const D = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]], out = [];
      for (let n = 1; n <= 40; n++) { const b = g.build(n), N = b.N; if (!b) { out.push('no board ' + n); continue; }
        if (b.words.length !== g.spec(n)[1]) out.push('word count ' + n);
        for (const w of b.words.concat(b.secret)) { let k = 0;
          for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of D) { let ok = true; for (let i = 0; i < w.w.length && ok; i++) { const rr = r + dr * i, cc = c + dc * i; ok = rr >= 0 && rr < N && cc >= 0 && cc < N && b.grid[rr * N + cc] === w.w[i]; } if (ok) { k++; if (r !== w.r || c !== w.c || dr !== w.dr || dc !== w.dc) out.push('stray ' + w.w + ' in ' + n); } }
          if (k !== 1) out.push(w.w + ' ×' + k + ' in ' + n); if (n === 1 && (w.dr < 0 || w.dc < 0 || (w.dr && w.dc))) out.push('bowl 1 direction'); } }
      return out;
    });
    expect(bad.length === 0, 'generator invariants: ' + bad.slice(0, 3).join('; '));
    let ws = await words(); const list = ws.filter(w => !w.secret), secret = ws.find(w => w.secret);
    // a drag that spells nothing scores nothing
    const a = await game(g => [g.cell(0, 0), g.cell(0, 1)]);
    await drag({ x0: a[0].x, y0: a[0].y, x1: a[1].x, y1: a[1].y });
    expect((await game(g => g.score)) === 0, 'a non-word drag does not score');
    // mid-drag the noodle snaps to the line and spells the word
    await page.mouse.move(list[0].x0, list[0].y0); await page.mouse.down(); await page.mouse.move(list[0].x1 + 5, list[0].y1 - 6, { steps: 4 });
    expect((await game(g => g.sel && g.sel.w)) === list[0].w, 'drag selection snaps to the word');
    await page.mouse.up(); await wait(150);
    expect((await game(g => g.score)) === list[0].w.length * 10, 'first word scores 10 per letter');
    expect((await state()).score === list[0].w.length * 10, 'HUD shows the score');
    // second word right away: simmer ×2. Dragged backwards (end → start) to prove either direction works.
    const s1 = await game(g => g.score); await drag({ x0: list[1].x1, y0: list[1].y1, x1: list[1].x0, y1: list[1].y0 });
    expect((await game(g => g.score)) - s1 === list[1].w.length * 20, 'a quick second find is doubled');
    // tap–tap with real touch taps
    const s2 = await game(g => g.score); await page.touchscreen.tap(list[2].x0, list[2].y0); await wait(120); await page.touchscreen.tap(list[2].x1, list[2].y1); await wait(150);
    expect((await game(g => g.score)) > s2 && (await words()).find(w => w.w === list[2].w).found, 'tap first and last letter selects a word');
    // hint costs time and rings a cell
    const t0 = await game(g => g.time), hb = await game(g => g.buttons.find(b => b.id === 'hint')); await page.mouse.click(hb.x, hb.y); await wait(100);
    expect((await game(g => g.time)) - t0 > 9 && (await game(g => !!g.hintCell)), 'hint adds 10 s and marks a first letter');
    // progress survives a reload
    const sBefore = await game(g => g.score); await page.reload({ waitUntil: 'load' }); await wait(500);
    expect(await game(g => g.words.filter(w => w.found).length) === 3 && (await game(g => g.score)) === sBefore, 'found words and score restored after reload');
    // finish the menu → last ladle → fish out the secret → three stars
    for (const w of list.slice(3)) await drag(w);
    expect((await game(g => g.mode)) === 'ladle', 'menu done: last-ladle countdown for the secret');
    await drag(secret); await wait(300);
    expect((await game(g => g.mode)) === 'won' && (await game(g => g.stars())) === 3, 'secret found: bowl won with three stars');
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    const st = await state(); expect(st.over && st.best > 0, 'win card shown and best recorded');
    const pr = await game(g => g.progress); expect(pr.max === 2 && pr.stars[1] === 3 && pr.lvl === 2, 'progress saved');
    // next bowl is clean; missing the secret costs a star
    await wait(1000); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.level === 2 && g.size === 7 && g.words.every(w => !w.found) && g.time < 2), 'bowl 2 loaded fresh');
    for (const w of (await words()).filter(w => !w.secret)) await drag(w);
    expect((await game(g => g.mode)) === 'ladle', 'bowl 2 menu cleared');
    await game(g => { g.ladleT = .05; }); for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    expect((await state()).over && (await game(g => g.progress)).stars[2] === 2, 'ladle ran out: two stars without the secret');
  },
};
