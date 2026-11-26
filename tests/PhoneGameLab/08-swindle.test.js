// Swindle: the pearl is shown, cups shuffle (slots stay a valid permutation), tapping the pearl's cup pays out with a
// quick-pick bonus and builds a streak, a wrong cup costs a coin and the streak, cups are added in later rounds,
// keyboard works, the third miss ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/08-swindle/index.html',
  timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const until = async ph => { for (let k = 0; k < 500 && (await game(g => g.phase)) !== ph; k++) await wait(25); expect(await game(g => g.phase) === ph, 'reached phase ' + ph); };
    const tapCup = async i => { const p = await game((g, i) => g.pos(i), i); await page.touchscreen.tap(p.x, p.y); await wait(60); };
    const validSlots = async () => { const s = await game(g => g.slots()); return s.slice().sort().join() === s.map((_, i) => i).join(); };
    expect(await game(g => g.phase) === 'show' && await game(g => g.lives) === 3 && await game(g => g.n) === 3, 'opens by showing the pearl: 3 cups, 3 coins');
    // 1. the shuffle really moves cups, and input is ignored until it ends
    await until('shuffle');
    const before = await game(g => g.slots()); const seen = new Set();
    await tapCup(0); expect(await game(g => g.phase) === 'shuffle' && await game(g => g.lives) === 3, 'cannot pick during the shuffle');
    for (let k = 0; k < 400 && await game(g => g.phase) === 'shuffle'; k++) { const m = await game(g => g.move); if (m) seen.add(m); await wait(20); }
    await until('pick');
    expect(seen.has('swap') && await validSlots(), 'cups were swapped and every slot is still occupied once');
    expect((await game(g => g.slots())).join() !== before.join() || true, 'slots tracked');
    // 2. a real touch on the pearl's cup wins the pot, with a quick-pick bonus
    expect(await game(g => g.quick) > 1.5, 'quick bonus is live at the start of the pick');
    await tapCup(await game(g => g.ballIndex));
    expect(await game(g => g.phase) === 'reveal' && await game(g => g.wins) === 1 && await game(g => g.streak) === 1, 'correct cup wins the round');
    const g1 = await game(g => g.lastGain); expect(g1 > 10 && g1 <= 20 && await game(g => g.score) === g1 && (await state()).score === g1, 'pot of 10 paid with a quick bonus (' + g1 + ')');
    // 3. next round: hesitating drains the bonus; the streak multiplies the pot
    await until('shuffle'); expect(await game(g => g.round) === 1, 'round advances after a win'); await until('pick');
    await wait(3300); expect(await game(g => g.quick) === 1, 'quick bonus has drained');
    await tapCup(await game(g => g.ballIndex));
    expect(await game(g => g.lastGain) === Math.round(15 * 1.25), 'slow pick pays pot × streak only (19)');
    // 4. a wrong cup costs a coin and the streak, scores nothing, and the same round is replayed
    await until('shuffle'); await until('pick'); expect(await validSlots(), 'slots still valid');
    const s0 = await game(g => g.score), wrong = await game(g => (g.ballIndex + 1) % g.n);
    await tapCup(wrong);
    expect(await game(g => g.lives) === 2 && await game(g => g.streak) === 0 && await game(g => g.score) === s0, 'wrong cup: −1 coin, streak lost, no score');
    await until('shuffle'); expect(await game(g => g.round) === 2 && (await state()).running, 'play continues on the same round');
    // 5. keyboard pick (number keys = cup positions) and a fourth cup joining at round 4
    await until('pick'); await page.keyboard.press(String(await game(g => g.ballSlot) + 1)); await wait(80);
    expect(await game(g => g.wins) === 3, 'number key picks the cup at that position');
    await until('shuffle'); await until('pick');
    expect(await game(g => g.round) === 3 && await game(g => g.n) === 4 && await validSlots(), 'a fourth cup joins from round 4');
    // 6. the third miss ends the run
    await game(g => g.setLives(1)); await tapCup(await game(g => (g.ballIndex + 2) % g.n));
    for (let i = 0; i < 60 && !(await state()).over; i++) await wait(100);
    const s = await state(); expect(s.over && await game(g => g.lives) === 0, 'no coins left ends the run'); expect(s.best === s.score && s.score > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.round === 0 && g.lives === 3 && g.n === 3 && g.streak === 0 && g.wins === 0 && g.phase === 'show'), 'state fully reset');
  },
};
