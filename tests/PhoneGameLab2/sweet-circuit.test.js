// Sweet Circuit: a real mouse-drawn wire of 3 matching sweets scores, costs one move and cracks a jawbreaker it runs
// past; a 2-sweet wire costs nothing; a closed loop zaps the jawbreaker inside and refunds its move; filling the order
// powers the circuit (next level, leftover-move bonus); an empty battery ends the run; restart is clean.
function board(extra) {
  const rows = []; for (let r = 0; r < 7; r++) { let s = ''; for (let c = 0; c < 7; c++) s += 'bcde'[(r * 2 + c) % 4]; rows.push(s); } // no two neighbours match
  for (const [r, c, ch] of extra) rows[r] = rows[r].slice(0, c) + ch + rows[r].slice(c + 1);
  return rows;
}
module.exports = {
  game: 'PhoneGameLab2/games/sweet-circuit/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const settle = async () => { for (let i = 0; i < 40 && (await game(g => g.busy)); i++) await wait(100); await wait(150); };
    const at = (r, c) => game((g, a) => g.at(a[0], a[1]), [r, c]);
    async function drag(cells, hold) {
      let p = await at(...cells[0]); await page.mouse.move(p[0], p[1]); await page.mouse.down();
      for (const q of cells.slice(1)) { p = await at(...q); await page.mouse.move(p[0], p[1], { steps: 5 }); await wait(40); }
      if (!hold) await page.mouse.up();
    }
    await settle();
    // 1. a 3-sweet wire past a jawbreaker
    await game((g, b) => { g.setBoard(b); g.setTargets([[0, 40], ['x', 2]], 12); }, board([[5, 0, 'a'], [5, 1, 'a'], [4, 2, 'a'], [6, 1, 'x'], [0, 6, 'x']]));
    let s0 = await game(g => ({ score: g.score, moves: g.moves }));
    await drag([[5, 0], [5, 1], [4, 2]]); await settle();
    let s = await game(g => ({ score: g.score, moves: g.moves, hp: g.hp, t: g.targets }));
    expect(s.score === s0.score + 30 && s.moves === s0.moves - 1, 'a 3-sweet wire scores 30 and costs a move (got ' + (s.score - s0.score) + ')');
    expect(s.t[0].got === 3, 'the cherries count toward the order');
    expect(s.hp[6][1] === 1, 'the jawbreaker next to the wire cracked');
    expect((await state()).score === s.score, 'HUD shows the score');
    // 2. a 2-sweet wire is not a move
    await game((g, b) => g.setBoard(b), board([[2, 2, 'a'], [2, 3, 'a']]));
    s0 = await game(g => ({ score: g.score, moves: g.moves }));
    await drag([[2, 2], [2, 3]]); await wait(300);
    s = await game(g => ({ score: g.score, moves: g.moves }));
    expect(s.score === s0.score && s.moves === s0.moves, 'two sweets do nothing and cost nothing');
    // 3. a loop: drag round a jawbreaker back onto the first sweet; everything inside is zapped, the move is free
    await game((g, b) => g.setBoard(b), board([[2, 3, 'a'], [4, 3, 'a'], [3, 2, 'a'], [3, 4, 'a'], [3, 3, 'x'], [6, 6, 'x']]));
    s0 = await game(g => ({ score: g.score, moves: g.moves, got: g.targets[1].got }));
    await drag([[2, 3], [3, 4], [4, 3], [3, 2], [2, 3]], true);
    expect(await game(g => g.closed && g.wire === 4), 'dragging back onto the first sweet closes the circuit');
    await page.mouse.up(); await settle();
    s = await game(g => ({ score: g.score, moves: g.moves, loops: g.loops, got: g.targets[1].got, b: g.board }));
    expect(s.loops === 1 && s.moves === s0.moves, 'a closed loop costs no move');
    expect(s.got === s0.got + 1 && s.score === s0.score + 4 * 15 + 60, 'the jawbreaker inside shatters (+60) (gained ' + (s.score - s0.score) + ')');
    expect(s.b[6][6] === 9, 'jawbreakers outside the loop are untouched');
    // 4. filling the order powers the circuit: next level, bonus for the moves left
    await game((g, b) => g.setBoard(b), board([[3, 0, 'a'], [3, 1, 'a'], [3, 2, 'a']]));
    await game(g => g.setTargets([[0, 3]], 9));
    s0 = await game(g => ({ score: g.score, level: g.level }));
    await drag([[3, 0], [3, 1], [3, 2]]); await settle();
    s = await game(g => ({ score: g.score, phase: g.phase }));
    expect(s.phase === 'clear' && s.score === s0.score + 30 + 8 * 25, 'order filled: circuit powered with a bonus of 25 per move left');
    for (let i = 0; i < 30 && (await game(g => g.phase)) !== 'play'; i++) await wait(100);
    await settle();
    s = await game(g => ({ level: g.level, moves: g.moves, t: g.targets }));
    expect(s.level === s0.level + 1 && s.moves > 9 && s.t.every(T => T.got === 0), 'next circuit: fresh order and a full battery');
    // 5. empty battery ends the run
    await game((g, b) => { g.setBoard(b); g.setTargets([[0, 99]], 1); }, board([[3, 0, 'a'], [3, 1, 'a'], [3, 2, 'a']]));
    await drag([[3, 0], [3, 1], [3, 2]]);
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const o = await state(); expect(o.over, 'out of moves with the order unfilled ends the run');
    expect(o.best >= o.score && o.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.level === 1 && g.loops === 0 && g.score === 0 && g.wire === 0 && g.targets.every(T => T.got === 0)), 'level, order and counters reset');
    // genuine play after restart: the bot's best wire, drawn with the mouse, scores
    await settle(); const ch = await game(g => g.findChain());
    await page.mouse.move(ch[0][0], ch[0][1]); await page.mouse.down(); for (const p of ch.slice(1)) { await page.mouse.move(p[0], p[1], { steps: 5 }); await wait(40); } await page.mouse.up();
    await settle(); expect(await game(g => g.score) > 0, 'a wire drawn on the fresh board scores');
  },
};
