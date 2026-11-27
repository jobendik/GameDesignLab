// Live Wires: real drags lay wires along the generated routing, crossing cuts a wire, undo/clear/hint work,
// covering the board with every pair linked wins, progress + best persist and the next board loads clean.
module.exports = {
  game: 'PhoneGameLab/games/46-live-wires/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.level) === 1 && await game(g => g.covered) === 0, 'starts on an empty board 1');
    const drag = async cells => {
      const pts = []; for (const i of cells) pts.push(await game((g, i) => g.xy(i), i));
      await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down();
      for (let k = 1; k < pts.length; k++) await page.mouse.move(pts[k][0], pts[k][1], { steps: 3 });
      await page.mouse.up(); await wait(60);
    };
    const tap = async id => { const b = await game((g, id) => g.buttons.find(b => b.id === id), id); await page.mouse.click(b.x, b.y); await wait(120); };
    const sol = await game(g => g.solution);
    // 1. one stroke along a solution wire links its pair
    await drag(sol[0]);
    expect(await game(g => g.done) === 1 && await game(g => g.strokes) === 1, 'dragging terminal to twin completes one wire in one stroke');
    expect(await game(g => g.covered) === sol[0].length, 'covered pads match the wire length');
    // 2. a second wire dragged across the first cuts it; undo restores it
    const other = sol[1], cross = [other[0], other[1]];
    const blockers = await game(g => g.solution[0]);
    // walk from wire 1's start straight into wire 0's body: find a pad of wire 0 adjacent to wire 1's first cells
    const cols = await game(g => g.cols), adj = (a, b) => Math.abs(a % cols - b % cols) + Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) === 1;
    let cutPath = null;
    for (let k = 0; k < other.length - 1 && !cutPath; k++) { const hitCell = blockers.slice(1, -1).find(b => adj(b, other[k])); if (hitCell != null) cutPath = other.slice(0, k + 1).concat([hitCell]); }
    if (cutPath) {
      await drag(cutPath);
      expect(await game(g => g.done) === 0, 'crossing a finished wire cuts it');
      await tap('undo');
      expect(await game(g => g.done) === 1 && await game(g => g.paths[1].length) === 0, 'undo restores the cut wire and removes the stroke');
    }
    // 3. undo + clear
    await tap('undo'); expect(await game(g => g.covered) === 0 && await game(g => g.strokes) === 0, 'undo removes the first stroke');
    await drag(cross); expect(await game(g => g.covered) === 2, 'partial wire stays on the board');
    await tap('clear'); expect(await game(g => g.covered) === 0, 'clear empties the board');
    // 4. solve the board with real drags → win, best + progress recorded
    for (const p of sol) await drag(p);
    expect(await game(g => g.mode) === 'won', 'all pairs linked and every pad covered wins');
    expect(await game(g => g.rating()) === 3, 'one stroke per wire rates three stars');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over && s.score === 1 && s.best >= 1, 'win card: board 1 cleared and best recorded');
    const pr = await game(g => g.progress); expect(pr.lvl === 2 && pr.max === 2 && pr.stars[1] === 3, 'progress saved: board 2 unlocked, 3 stars banked');
    // 5. next board is clean; hint routes a wire but costs a star
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over, 'next board starts');
    expect(await game(g => g.level) === 2 && await game(g => g.covered) === 0 && await game(g => g.strokes) === 0, 'board 2 loads empty');
    await tap('hint'); await wait(900);
    expect(await game(g => g.done) === 1 && await game(g => g.hints) === 1, 'hint lays one correct wire');
    const sol2 = await game(g => g.solution);
    for (const p of sol2) await drag(p);
    expect(await game(g => g.mode) === 'won' && await game(g => g.rating()) === 2, 'solved after a hint: two stars');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(150);
    const s2 = await state(); expect(s2.over && s2.best === 2, 'best is the highest board cleared');
    // 6. level select: go back to board 1, it reloads fresh and keeps its stars
    await wait(900); await page.keyboard.press('Enter'); await wait(400);
    expect(await game(g => g.level) === 3, 'board 3 after second win');
    await tap('prev'); expect(await game(g => g.level) === 2 && await game(g => g.progress.stars[2]) === 2, 'previous board can be revisited');
  },
};
