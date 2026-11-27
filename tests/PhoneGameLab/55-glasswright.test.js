// Glasswright: taps and drags really swivel mirrors, the traced light wakes lanterns of the right colour, undo/restart/hint
// work, par touches earn three stars, progress persists, and splitter / tinted-pane / ring / colour-blend benches are solvable.
module.exports = {
  game: 'PhoneGameLab/games/55-glasswright/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.level) === 1 && await game(g => g.moves) === 0 && await game(g => g.lit) === 0, 'bench 1 starts dark and untouched');
    expect(await game(g => g.beams) >= 1, 'the lamp casts a beam');
    const btn = async id => { const b = await game((g, id) => g.buttons.find(b => b.id === id), id); await page.mouse.click(b.x, b.y); await wait(120); };
    const wrong = () => game(g => g.mirrors.filter(m => m.sol != null && m.o !== m.sol));
    const tapI = async i => { const [x, y] = await game((g, i) => g.xy(i), i); await page.touchscreen.tap(x, y); await wait(60); };
    const solveTaps = async () => { for (let k = 0; k < 60; k++) { const w = await wrong(); if (!w.length || await game(g => g.mode) !== 'play') break; await tapI(w[0].i); } };
    const over = async () => { for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150); return state(); };
    const jump = async lv => { await page.evaluate(lv => localStorage.setItem('gdl:PhoneGameLab/55-glasswright:prog', JSON.stringify({ lvl: lv, max: lv, stars: {} })), lv); await page.reload(); await wait(700); };
    // 1. dragging the bar swivels it (here: the wrong way), undo puts it back
    const m0 = (await wrong())[0]; expect((m0.sol - m0.o + 4) % 4 === 1, 'bench 1 is one turn from solved');
    const [cx, cy] = await game((g, i) => g.xy(i), m0.i), R = (await game(g => g.cell)) * .46, a0 = m0.o * Math.PI / 4;
    const drag = async (delta, hold) => {
      await page.mouse.move(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); await page.mouse.down();
      for (let k = 1; k <= 8; k++) { const a = a0 + delta * k / 8; await page.mouse.move(cx + Math.cos(a) * R, cy + Math.sin(a) * R); }
      if (hold) await hold(); await page.mouse.up(); await wait(80);
    };
    const mir = async () => (await game(g => g.mirrors)).find(x => x.i === m0.i);
    await drag(-Math.PI / 4);
    expect((await mir()).o === (m0.o + 3) % 4 && await game(g => g.moves) === 1 && await game(g => g.lit) === 0, 'dragging anticlockwise swivels the mirror back a step');
    await btn('undo'); expect((await mir()).o === m0.o && await game(g => g.moves) === 0, 'undo puts the mirror back');
    // 2. dragging it round to the solved angle wakes the lantern → win in par (only once the mirror is released)
    await drag(Math.PI / 4, async () => expect(await game(g => g.mode) === 'play' && await game(g => g.lit) === 1, 'lantern lights live during the drag, no win while held'));
    expect((await mir()).o === m0.sol, 'drag swivels the mirror to the pointed angle');
    expect(await game(g => g.lanterns.every(l => l.lit && l.got === l.need)), 'the beam reaches the lantern');
    expect(await game(g => g.mode) === 'won' && await game(g => g.moves) === 1 && await game(g => g.rating()) === 3, 'par touches rate three stars');
    const s = await over(); expect(s.over && s.score === 1 && s.best >= 1, 'win card: bench 1, best recorded');
    const pr = await game(g => g.progress); expect(pr.lvl === 2 && pr.max === 2 && pr.stars[1] === 3, 'progress saved');
    // 3. next bench: hint marks a wrong mirror and costs a star
    await wait(900); await page.keyboard.press('Enter'); await wait(500);
    expect((await state()).running && await game(g => g.level) === 2 && await game(g => g.moves) === 0 && await game(g => g.lit) === 0, 'bench 2 loads fresh');
    await btn('hint'); expect((await wrong()).map(w => w.i).includes(await game(g => g.hint)), 'hint points at a mirror that is wrong');
    await solveTaps(); expect(await game(g => g.mode) === 'won' && await game(g => g.rating()) === 2, 'solved after a hint: two stars');
    expect((await over()).best === 2, 'best is the highest bench cleared');
    // 4. splitter bench: wasted touches cost stars, restart resets the swivels, keyboard solves it
    await jump(13);
    expect((await game(g => g.pieces)).includes('S') && (await game(g => g.lanterns)).length >= 2, 'bench 13 has split glass and several lanterns');
    const init = await game(g => g.mirrors.map(m => m.o)), two = (await game(g => g.mirrors)).slice(0, 2);
    await tapI(two[0].i); await tapI(two[0].i);
    expect(await game(g => g.moves) === 1 && (await game(g => g.mirrors))[0].o === (two[0].o + 2) % 4, 'two taps on one mirror: two steps, one touch');
    await btn('undo'); expect(await game(g => g.moves) === 0 && (await game(g => g.mirrors))[0].o === two[0].o, 'undo reverts the whole touch');
    for (let k = 0; k < 4; k++) for (const t of two) await tapI(t.i);
    expect(await game(g => g.moves) === 8 && JSON.stringify(await game(g => g.mirrors.map(m => m.o))) === JSON.stringify(init), 'eight wasted touches, mirrors back where they began');
    await solveTaps(); expect(await game(g => g.mode) === 'won' && await game(g => g.rating()) === 1, 'far over par: one star');
    await over(); await wait(900); await page.keyboard.press('Enter'); await wait(500);
    await btn('prev'); expect(await game(g => g.level) === 13, 'previous bench can be replayed');
    await tapI(two[0].i); await page.keyboard.press('r'); await wait(80);
    expect(await game(g => g.moves) === 0 && JSON.stringify(await game(g => g.mirrors.map(m => m.o))) === JSON.stringify(init), 'restart resets every swivel');
    for (let k = 0; k < 60 && await game(g => g.mode) === 'play'; k++) {
      const all = await game(g => g.mirrors), idx = all.findIndex(m => m.sol != null && m.o !== m.sol); if (idx < 0) break;
      for (let j = 0; j < 30 && await game(g => g.cursor) !== idx; j++) await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Space'); await wait(40);
    }
    expect(await game(g => g.mode) === 'won' && await game(g => g.rating()) === 3, 'keyboard solve in par: three stars');
    await over();
    // 5. tinted panes (17), ring pairs (21) and colour blending (24) are generated solvable
    for (const [lv, kind] of [[17, 'F'], [21, 'P'], [24, 'X']]) {
      await jump(lv);
      if (kind === 'X') expect((await game(g => g.lanterns)).some(l => [3, 5, 6].includes(l.need)), 'bench 24 has a lantern that needs two colours blended');
      else expect((await game(g => g.pieces)).includes(kind), 'bench ' + lv + ' has piece ' + kind);
      expect(await game(g => g.lit) < (await game(g => g.lanterns)).length, 'bench ' + lv + ' starts unsolved');
      await solveTaps();
      expect(await game(g => g.mode) === 'won' && await game(g => g.lanterns.every(l => l.got === l.need)), 'bench ' + lv + ' solved: every lantern gets exactly its colour');
      expect((await over()).best === lv, 'best follows the highest bench');
    }
  },
};
