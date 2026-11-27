// Chute First: flicks (mouse swipe), chute taps (touch) and arrow keys sort the block; correct sorts score and build the
// multiplier, wrong sorts and timeouts cost lives, rounds change the rule (colour → shape → NOT → mid-round switch),
// three mistakes end the run and restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/68-chute-first/index.html',
  async run({ page, expect, wait, state, game }) {
    const V = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] }, KEY = { L: 'ArrowLeft', R: 'ArrowRight', U: 'ArrowUp', D: 'ArrowDown' };
    const ready = async () => { for (let i = 0; i < 50; i++) { if (await game(g => !g.intro && !!g.cur)) return; await wait(100); } throw new Error('block never became ready'); };
    const swipe = async d => { const p = await game(g => g.pad); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + V[d][0] * 30, p.y + V[d][1] * 30, { steps: 2 }); await page.mouse.move(p.x + V[d][0] * 70, p.y + V[d][1] * 70, { steps: 2 }); await page.mouse.up(); await wait(120); };
    expect((await state()).running, 'game running after autostart');
    await ready();
    const r1 = await game(g => g.rule);
    expect(r1.type === 'c2' && r1.slots.length === 2 && r1.slots.every(s => s.kind === 'c' && 'LR'.includes(s.dir)), 'round 1 sorts two colours left/right');
    // real swipe toward the right chute
    let a = await game(g => g.answer); await swipe(a);
    let s = await game(g => ({ score: g.score, streak: g.streak, sorted: g.sorted, lives: g.lives }));
    expect(s.sorted === 1 && s.streak === 1 && s.score >= 10 && s.lives === 3, 'a correct flick scores');
    expect((await state()).score === s.score, 'HUD score updated');
    // touch tap on the chute
    await ready(); a = await game(g => g.answer); const cp = await game((g, d) => g.chute(d), a);
    await page.touchscreen.tap(cp.x, cp.y); await wait(150);
    expect(await game(g => g.sorted) === 2, 'tapping the right chute sorts the block');
    // keyboard
    await ready(); a = await game(g => g.answer); await page.keyboard.press(KEY[a]); await wait(150);
    expect(await game(g => g.sorted) === 3 && await game(g => g.streak) === 3, 'arrow keys sort the block');
    // a closed chute ignores the flick
    await ready(); const left0 = await game(g => g.left); await swipe('U');
    s = await game(g => ({ left: g.left, lives: g.lives, streak: g.streak }));
    expect(s.left === left0 && s.lives === 3 && s.streak === 3, 'flicking at a closed chute does nothing');
    // wrong chute costs a life and the streak
    a = await game(g => g.answer); await swipe(a === 'L' ? 'R' : 'L');
    s = await game(g => ({ lives: g.lives, streak: g.streak, sorted: g.sorted }));
    expect(s.lives === 2 && s.streak === 0 && s.sorted === 3, 'a wrong flick costs a life and resets the streak');
    // running out of time costs a life too
    await ready(); await game(g => g.setTimer(.05)); await wait(400);
    expect(await game(g => g.lives) === 1, 'letting the ring run out costs a life');
    // five in a row raises the multiplier; clearing the round changes the rule
    await game(g => g.setLives(3)); await ready();
    for (let i = 0; i < 5; i++) expect(await game(g => g.flick(g.answer)), 'hook flick is correct');
    expect(await game(g => g.mult) === 2 && await game(g => g.streak) === 5, 'five in a row gives ×2');
    for (let i = 0; i < 12 && await game(g => g.round) === 1 && await game(g => g.left) > 0; i++) await game(g => g.flick(g.answer));
    for (let i = 0; i < 30 && await game(g => g.round) === 1; i++) await wait(100);
    await ready();
    expect(await game(g => g.round) === 2 && (await game(g => g.rule)).slots.length === 3, 'round 2 opens a third chute');
    // NOT rule: the matching colour goes to its chute, everything else to the NOT chute
    await game(g => g.skipTo(5)); await ready();
    const nr = await game(g => g.rule), pos = nr.slots.find(q => q.kind === 'c'), neg = nr.slots.find(q => q.kind === 'nc');
    expect(nr.type === 'nc' && pos && neg && pos.v === neg.v, 'round 5 is a NOT rule');
    for (let i = 0; i < 8; i++) { const q = await game(g => ({ c: g.cur.c, a: g.answer })); expect(q.a === (q.c === pos.v ? pos.dir : neg.dir), 'NOT rule answer is consistent'); expect(await game(g => g.flick(g.answer)), 'NOT rule sort accepted'); }
    // shape rule: colour is a decoy
    await game(g => g.skipTo(4)); await ready();
    const sr = await game(g => g.rule); expect(sr.type === 's2' && sr.slots.every(q => q.kind === 's'), 'round 4 sorts by shape');
    for (let i = 0; i < 6; i++) { const q = await game(g => ({ s: g.cur.s, a: g.answer })); expect(q.a === sr.slots.find(z => z.v === q.s).dir, 'shape decides the chute'); await game(g => g.flick(g.answer)); }
    // mid-round switch shuffles the chutes
    await game(g => g.skipTo(9)); await ready();
    const sw = await game(g => g.rule); expect(sw.switchAt > 0, 'round 9 has a mid-round switch');
    for (let i = 0; i < 40 && await game(g => g.left) > sw.switchAt; i++) await game(g => g.flick(g.answer));
    await wait(300); await ready();
    const sw2 = await game(g => g.rule);
    expect(sw2.slots.some((q, i) => q.dir !== sw.slots[i].dir), 'the switch moved at least one label');
    expect(await game(g => g.flick(g.answer)), 'sorting still works after the switch');
    // three mistakes end the run
    const lv = await game(g => g.lives);
    for (let i = 0; i < lv; i++) { await ready(); await game(g => g.flick(g.rule.slots.find(q => q.dir !== g.answer).dir)); }
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(100);
    const o = await state(); expect(o.over, 'losing all lives ends the run');
    expect(o.best >= o.score && o.score > 0, 'best score recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    const f = await game(g => ({ round: g.round, lives: g.lives, streak: g.streak, sorted: g.sorted, type: g.rule.type }));
    expect(f.round === 1 && f.lives === 3 && f.streak === 0 && f.sorted === 0 && f.type === 'c2', 'round, lives and streak reset');
  },
};
