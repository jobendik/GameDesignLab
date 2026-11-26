// Pin Whirl: taps toss pins that stick where the cushion is, snug landings pay a bonus, buttons are bonus targets, a full
// quiver clears the stage, the cushion really spins, a thimble forgives one prick, the next prick ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/16-pin-whirl/index.html',
  timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await wait(600);
    const st = await game(g => ({ stage: g.stage, quiver: g.quiver, pins: g.pins.length, buttons: g.buttons.length, state: g.state }));
    expect(st.stage === 1 && st.quiver >= 5 && st.pins === 0 && st.buttons >= 1 && st.state === 'play', 'stage 1 starts with a full quiver and a button');
    // the cushion spins by itself
    const r0 = await game(g => g.cushion.rot); await wait(400);
    expect(Math.abs((await game(g => g.cushion.rot)) - r0) > .2, 'cushion rotates');
    // --- deterministic placement: hold the spin and choose angles relative to the button
    const HALF = Math.PI / 2, ba = await game(g => { g.hold(); return g.buttons[0].a; });
    const tossAt = async (a, how) => { await game((g, x) => g.setRot(Math.PI / 2 - x), a); if (how === 'key') await page.keyboard.press('Space'); else await page.touchscreen.tap(200, 500); await wait(380); };
    await tossAt(ba + 1.5, 'tap');
    const p1 = await game(g => ({ n: g.pins.length, a: g.pins[0] && g.pins[0].a, score: g.score, quiver: g.quiver }));
    const wrap = d => Math.abs(((d % 6.2832) + 9.4248) % 6.2832 - 3.1416);
    expect(p1.n === 1 && wrap(p1.a - (ba + 1.5)) < .03, 'a tap sticks a pin exactly at the bottom of the cushion');
    expect(p1.score === 10 && p1.quiver === st.quiver - 1, 'a plain pin scores 10 and uses the quiver'); expect((await state()).score === 10, 'HUD score updated');
    await tossAt(ba + 1.5 + .22, 'key');
    const p2 = await game(g => ({ n: g.pins.length, score: g.score }));
    expect(p2.n === 2 && p2.score === 10 + 15, 'landing snug beside a neighbour (0.22 rad) pays +5, via the Space key');
    await tossAt(ba + 1.5 + .22 + .15, 'tap');
    expect((await game(g => g.score)) === 25 + 25, 'a razor-close landing (0.15 rad) pays +15');
    await tossAt(ba, 'tap');
    const p4 = await game(g => ({ n: g.pins.length, score: g.score, col: g.collected, left: g.buttons.length }));
    expect(p4.n === 4 && p4.col === 1 && p4.left === st.buttons - 1 && p4.score === 50 + 30, 'hitting a button collects it for +20');
    // --- fill the rest of the quiver at well-spaced angles → stage clear
    let left = await game(g => g.quiver);
    for (let i = 0; i < left; i++) await tossAt(ba + 2.6 + i * .5, 'tap');
    await wait(1300);
    const s2 = await game(g => ({ stage: g.stage, quiver: g.quiver, score: g.score, fresh: g.pins.filter(p => !p.old).length }));
    expect(s2.stage === 2 && s2.fresh === 0 && s2.quiver >= 5, 'emptying the quiver clears the stage and brings a new cushion');
    expect(s2.score > 80 + left * 10, 'stage clear bonus added');
    // --- thimble forgives one prick, the next one ends the run
    await game(g => { g.hold(); g.giveThimble(); });
    const free = await game(g => { let best = 0, bg = -1; for (let i = 0; i < 60; i++) { const a = i / 60 * 6.2832; let gap = 9; for (const p of g.pins) gap = Math.min(gap, Math.abs(((a - p.a) % 6.2832 + 9.4248) % 6.2832 - 3.1416)); for (const b of g.buttons) gap = Math.min(gap, Math.abs(((a - b.a) % 6.2832 + 9.4248) % 6.2832 - 3.1416)); if (gap > bg) { bg = gap; best = a; } } return best; });
    await tossAt(free, 'tap'); const n3 = await game(g => g.pins.length);
    await tossAt(free, 'tap'); await wait(500);
    const t1 = await game(g => ({ n: g.pins.length, th: g.thimbles, state: g.state })), o1 = (await state()).over;
    expect(t1.n === n3 && t1.th === 0 && t1.state === 'play' && !o1, 'hitting a stuck pin burns the thimble instead of the run');
    await tossAt(free, 'tap');
    for (let i = 0; i < 30 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'pricking a pin without a thimble ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(700);
    const z = await state(); expect(z.running && !z.over && z.score === 0, 'restart gives a clean run');
    expect(await game(g => g.stage === 1 && g.pins.length === 0 && g.thimbles === 0 && g.collected === 0 && g.stuck === 0), 'stage, pins, thimbles and buttons reset');
    const r1 = await game(g => g.cushion.rot); await wait(300); expect(Math.abs((await game(g => g.cushion.rot)) - r1) > .1, 'spin resumes after restart (test hold cleared)');
  },
};
