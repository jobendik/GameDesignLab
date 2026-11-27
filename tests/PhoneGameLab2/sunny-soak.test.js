// Sunny Soak: a real tap lobs a balloon that soaks a led target and scores; holding fills a bigger balloon; over-filling
// bursts on Pip; Olli's umbrella needs a big one; soaking Bolt or letting a pal leave dry raises the heat; the tub runs
// out and refills; a full heat meter ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/sunny-soak/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await game(g => { g.hold(true); g.clear(); });
    const yard = await game(g => g.yard);
    // 1) real tap, leading a walking bunny by its flight time
    await game(g => { g.spawn('bun', 1, 1, 120); });
    const r = (await game(g => g.runners))[0];
    await page.mouse.move(r.x + r.v * .5, r.y); await page.mouse.down(); await page.mouse.up(); await wait(900);
    let s = await game(g => ({ score: g.score, soaks: g.soaks, streak: g.streak, throws: g.throws, ammo: g.ammo, heat: g.heat, soaked: g.runners[0].soaked }));
    expect(s.throws === 1 && s.soaked && s.soaks === 1, 'a tapped balloon lands on the bunny and soaks it');
    expect(s.score === 10 || s.score === 15, 'soak scores 10 (+5 bullseye)'); expect((await state()).score === s.score, 'HUD shows the score');
    expect(s.heat < .22, 'a soak cools the heat meter');
    // 2) hold = bigger balloon; a miss breaks the streak
    await game(g => g.clear());
    await page.mouse.move(60, yard.bot - 20); await page.mouse.down(); await wait(600);
    expect(await game(g => g.filling) > .4, 'holding fills the balloon'); await page.mouse.up(); await wait(900);
    s = await game(g => ({ f: g.lastFill, streak: g.streak, throws: g.throws }));
    expect(s.f > .45 && s.throws === 2 && s.streak === 0, 'released a big balloon; missing resets the streak');
    // 3) over-fill bursts on Pip
    const a0 = await game(g => g.ammo); await page.mouse.down(); await wait(1650);
    s = await game(g => ({ pops: g.pops, throws: g.throws, filling: g.filling, ammo: g.ammo })); await page.mouse.up();
    expect(s.pops === 1 && s.throws === 2 && s.filling < 0 && s.ammo <= a0, 'holding too long bursts the balloon on Pip'); await wait(1100);
    // 4) umbrella: small balloon bounces off, big one soaks
    await game(g => { g.clear(); g.ammo = 5; g.spawn('olli', 0, 1, 200); });
    const hit = async f => { await game((g, f) => { const o = g.runners[0]; g.throwAt(o.x + o.v * (.46 + .16 * f), o.y, f); }, f); await wait(800); return game(g => ({ soaked: g.runners[0].soaked, score: g.score })); };
    const sc0 = await game(g => g.score); s = await hit(.1); expect(!s.soaked && s.score === sc0, 'small balloon bounces off the umbrella');
    s = await hit(.9); expect(s.soaked && s.score > sc0, 'a big balloon soaks Olli');
    // 5) one big splash, two pals → double
    await game(g => { g.clear(); g.spawn('bun', 2, 1, 150); g.spawn('bun', 2, 1, 195); });
    const sc1 = s.score; await game(g => { const a = g.runners; g.throwAt((a[0].x + a[1].x) / 2 + a[0].v * .62, a[0].y, 1); }); await wait(900);
    s = await game(g => ({ n: g.runners.filter(r => r.soaked).length, score: g.score })); expect(s.n === 2 && s.score >= sc1 + 40, 'one splash soaks two pals for a double');
    // 6) Bolt must stay dry
    await game(g => { g.clear(); g.spawn('bolt', 1, 1, 160); });
    let h0 = await game(g => g.heat), sc2 = s.score; await game(g => { const b = g.runners[0]; g.throwAt(b.x + b.v * .46, b.y, 0); }); await wait(700);
    s = await game(g => ({ heat: g.heat, score: g.score, streak: g.streak })); expect(s.heat > h0 + .08 && s.score === sc2 && s.streak === 0, 'soaking Bolt adds heat and scores nothing');
    // 7) a pal that leaves dry adds heat
    await game(g => { g.clear(); g.spawn('nori', 0, 1, innerWidth - 30); }); h0 = await game(g => g.heat); await wait(900);
    s = await game(g => ({ heat: g.heat, esc: g.escapes })); expect(s.esc === 1 && s.heat > h0 + .07, 'a dry pal leaving raises the heat');
    // 8) the tub empties and refills
    await game(g => { g.ammo = 1; g.throwAt(100, 500, 0); }); expect(await game(g => g.ammo) === 0, 'throwing uses a balloon');
    const t0 = await game(g => g.throws); await page.mouse.move(200, yard.bot - 40); await page.mouse.down(); await page.mouse.up(); await wait(120);
    expect(await game(g => g.throws) === t0, 'no throw from an empty tub'); await wait(1300); expect(await game(g => g.ammo) >= 1, 'the tub refills over time');
    // 9) heat full → run ends
    const before = await game(g => g.score); await game(g => { g.heat = .995; });
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(200);
    s = await state(); expect(s.over, 'a full heat meter ends the run'); expect(s.best >= before && s.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.soaks === 0 && g.level === 1 && g.ammo === 5 && g.heat < .3 && g.throws === 0), 'counters, tub and heat reset');
  },
};
