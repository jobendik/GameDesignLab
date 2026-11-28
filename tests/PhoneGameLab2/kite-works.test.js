// Kite Works: the workshop's shape / tail / paint buttons change the kite and its stats, Fly! launches it; in flight a
// held finger steers the kite to collect stars, a lane too weak for the kite makes it sink (bump → lose a patch), a storm
// lane over-strains a fragile diamond (strain → snap → lose a patch), the flight timer ends the run, restart returns to
// the workshop with the design remembered.
module.exports = {
  game: 'PhoneGameLab2/games/kite-works/index.html',
  timeout: 70000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    let g = await game(g => ({ phase: g.phase, st: g.stats, d: g.design }));
    expect(g.phase === 'shop', 'a run starts in the workshop');
    const btn = async (label, idx) => (await game(g => g.buttons())).filter(b => label == null ? b.col : b.label === label)[idx || 0];
    let b = await btn('Diamond'); await page.touchscreen.tap(b.x, b.y); await wait(100);
    let g2 = await game(g => ({ st: g.stats, d: g.design }));
    expect(g2.d.shape === 0 && g2.st.lift > g.st.lift && g2.st.tough < g.st.tough, 'Diamond: more lift, less tough');
    b = await btn('Long'); await page.touchscreen.tap(b.x, b.y); await wait(100);
    let g3 = await game(g => ({ st: g.stats, d: g.design }));
    expect(g3.d.tail === 2 && g3.st.steady > g2.st.steady && g3.st.weight > g2.st.weight, 'a long tail is steadier but heavier');
    b = await btn(null, 3); await page.touchscreen.tap(b.x, b.y); await wait(100);
    const pat0 = (await game(g => g.design)).pat; b = (await game(g => g.buttons())).find(q => ['Plain', 'Stripes', 'Dots', 'Stars'].includes(q.label)); await page.touchscreen.tap(b.x, b.y); await wait(100);
    g = await game(g => g.design); expect(g.col === 3 && g.pat === (pat0 + 1) % 4, 'paint colour and pattern buttons work');
    b = await btn('Fly!'); await page.touchscreen.tap(b.x, b.y); await wait(200);
    g = await game(g => ({ phase: g.phase, patches: g.patches, time: g.time }));
    expect(g.phase === 'fly' && g.patches === 3 && g.time > 70, 'Fly! launches a 75 s flight with three patches');
    // steer with a held mouse to collect stars
    await game(g => { g.setWind(1.1); g.clearBirds(); });
    await page.mouse.move(300, 400); await page.mouse.down();
    for (let i = 0; i < 60 && (await game(g => g.stars)) < 2; i++) { const y = await game(g => { g.clearBirds(); const n = g.nextStar(); return n ? g.altToY(n.a) : 400; }); await page.mouse.move(300, y, { steps: 2 }); await wait(120); }
    g = await game(g => ({ stars: g.stars, score: g.score, patches: g.patches }));
    expect(g.stars >= 2 && g.score >= 20 && g.patches === 3, 'steering into stars collects them (+10 each)');
    await wait(50); expect((await state()).score >= g.score, 'HUD shows the score');
    // weak lane: the kite sinks even while pulled up, and bumps the ground
    await page.mouse.move(300, 120); await wait(500);
    await game(g => { g.setWind(.2); g.clearBirds(); }); await wait(700); const a0 = await game(g => g.alt); await wait(900);
    expect((await game(g => g.alt)) < a0 - .05, 'in a lane too weak for it the kite sinks despite the pull');
    for (let i = 0; i < 60 && (await game(g => g.patches)) === 3; i++) { await game(g => g.clearBirds()); await wait(150); }
    expect((await game(g => g.patches)) === 2, 'sinking to the ground costs a patch');
    await game(g => g.setWind(1.1)); await wait(2000);
    // storm lane: strain builds on the fragile diamond and snaps it
    await game(g => { g.setWind(2.4); g.clearBirds(); }); await wait(250);
    expect((await game(g => g.strain)) > 0, 'a storm lane strains the diamond');
    for (let i = 0; i < 30 && (await game(g => g.patches)) === 2; i++) { await game(g => g.clearBirds()); await wait(100); }
    expect((await game(g => g.patches)) === 1, 'too much strain snaps the kite: another patch lost');
    await page.mouse.up(); await game(g => { g.setWind(1.1); g.setTime(.4); });
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'the flight timer ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    g = await game(g => ({ phase: g.phase, d: g.design }));
    expect(g.phase === 'shop' && g.d.shape === 0 && g.d.tail === 2 && g.d.col === 3, 'back in the workshop with the last design remembered');
  },
};
