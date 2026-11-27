// Tideglass: drag moves by columns, tap rotates, flick drops, swipe up holds, slow drag sinks, keys work; a full row
// clears and scores; the tide packs columns and clears what completes; pebbles rise from level 5; topping out ends the
// run; restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/52-tideglass/index.html',
  async run({ page, expect, wait, state, game }) {
    const cur = () => game(g => g.cur), info = () => game(g => ({ score: g.score, lines: g.lines, pieces: g.pieces, charge: g.charge, hold: g.hold, busy: g.busy }));
    expect((await state()).running && await cur(), 'running with a falling piece');
    const cell = await game(g => g.cell), step = cell * .92; let c0 = await cur();
    // drag: column-accurate horizontal movement while the finger is down
    await page.mouse.move(200, 520); await page.mouse.down(); await page.mouse.move(200 + step * 2.2, 522, { steps: 6 });
    expect((await cur()).x === c0.x + 2, 'dragging 2.2 columns right moves the piece exactly 2 columns');
    await page.mouse.move(200 - step * 1.2, 524, { steps: 8 }); expect((await cur()).x === c0.x - 1, 'dragging back left follows the finger');
    await page.mouse.up(); await wait(50); expect((await cur()).rot === c0.rot, 'a drag is not a tap (no rotation)');
    // tap: right half rotates clockwise, left half counter-clockwise
    await page.touchscreen.tap(300, 520); await wait(60); expect((await cur()).rot === (c0.rot + 1) % 4, 'tap on the right rotates clockwise');
    await page.touchscreen.tap(80, 520); await wait(60); expect((await cur()).rot === c0.rot, 'tap on the left rotates back');
    // slow drag down sinks without dropping
    c0 = await cur(); await page.mouse.move(200, 300); await page.mouse.down(); await wait(190);
    for (let i = 1; i <= 9; i++) { await page.mouse.move(200, 300 + i * 12); await wait(40); }
    let c1 = await cur(), s = await info(); expect(s.pieces === 0 && c1.y >= c0.y + 2 && s.score > 0, 'a slow downward drag soft-drops (rows ' + c0.y + '→' + c1.y + ')');
    await page.mouse.up();
    // swipe up holds, flick down hard-drops
    c0 = await cur(); await page.mouse.move(200, 520); await page.mouse.down(); await page.mouse.move(202, 450, { steps: 3 }); await page.mouse.up(); await wait(60);
    s = await info(); expect(s.hold === c0.k && s.pieces === 0, 'swipe up puts the piece in hold');
    await page.mouse.move(200, 300); await page.mouse.down(); await page.mouse.move(204, 430, { steps: 3 }); await page.mouse.up(); await wait(80);
    s = await info(); expect(s.pieces === 1 && (await game(g => g.board.flat().filter(v => v).length)) >= 3, 'flick down hard-drops and locks the piece');
    // keyboard
    c0 = await cur(); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowUp'); c1 = await cur();
    expect(c1.x === c0.x - 1 && c1.rot === 1, 'arrow keys move and rotate'); await page.keyboard.press('Space'); await wait(60); expect((await info()).pieces === 2, 'Space hard-drops');
    // a completed row clears, scores and charges the tide
    await game(g => { g.setBoard(["111....111"]); g.setCharge(3); g.setCur(0); }); const before = await info();
    await page.keyboard.press('Space'); await wait(500); s = await info();
    expect(s.lines === before.lines + 1 && s.score >= before.score + 100 && s.charge === 4, 'filling the gap clears the row, scores ≥100 and charges the tide');
    expect(await game(g => g.board.flat().every(v => !v)), 'the cleared row is gone');
    expect((await state()).score === s.score, 'HUD shows the score');
    // tide: not ready → refused; ready → packs columns (no clear here)
    const tb = await game(g => g.button('tide')); await game(g => g.setBoard(["11........", "..........", "11.......3"]));
    await page.touchscreen.tap(tb[0], tb[1]); await wait(100); expect(await game(g => g.charge === 4 && g.board[g.ROWS - 3][0] === 1), 'tide refuses below a full meter');
    await game(g => g.setCharge(g.NEED)); await page.touchscreen.tap(tb[0], tb[1]); await wait(900);
    expect(await game(g => { const b = g.board, R = g.ROWS; return g.charge === 0 && !b[R - 3][0] && b[R - 2][0] && b[R - 1][0] && b[R - 2][1] && b[R - 1][9]; }), 'the tide packs every column down and empties the meter');
    // tide that completes a row clears it with the tide bonus
    const l0 = (await info()).lines, s0 = (await info()).score; await game(g => { g.setBoard(["1.1.1.1.1.", ".2.2.2.2.2"]); g.setCharge(g.NEED); });
    await page.keyboard.press('t'); await wait(1100); s = await info();
    expect(s.lines === l0 + 1 && s.score >= s0 + 150 && await game(g => g.board.flat().every(v => !v)), 'a row completed by the tide clears at ×1.5');
    // pebbles rise every 9 pieces from level 5
    await game(g => { g.setBoard([]); g.setLevel(5); }); expect(await game(g => g.pebEvery()) === 9, 'level 5 brings pebbles every 9 pieces');
    for (let i = 0; i < 12 && !(await game(g => g.board[g.ROWS - 1].includes(10))); i++) { const k = i % 2 ? 'ArrowLeft' : 'ArrowRight'; for (let j = 0; j < 4; j++) await page.keyboard.press(k); await page.keyboard.press('Space'); await wait(330); }
    expect(await game(g => g.board[g.ROWS - 1].filter(v => v === 10).length === 9), 'a pebble row with one gap was pushed in from below');
    // top out → game over, best recorded, clean restart
    await game(g => g.setBoard(Array(20).fill("11.1111111")));
    for (let i = 0; i < 5 && !(await state()).over; i++) { await page.keyboard.press('Space'); await wait(250); }
    let st = await state(); expect(st.over && st.best >= st.score && st.score > 0, 'stacking over the top ends the run and records the best');
    await wait(1300); await page.keyboard.press('Enter'); await wait(500);
    st = await state(); expect(st.running && !st.over && st.score === 0, 'restart runs');
    expect(await game(g => g.pieces === 0 && g.lines === 0 && g.level === 1 && g.charge === g.NEED && g.hold === -1 && g.board.flat().every(v => !v)), 'restart resets board, level, hold and tide');
  },
};
