// Flicknic: wave 1 sends ants; a real swipe flicks an ant off the blanket (score, HUD); a flicked ant bowls through a line
// for a ×3 chain; an ant that reaches the plate walks off with a slice and flicking it brings the slice back; a thief that
// leaves costs the slice; a beetle needs two flicks; flicking a ladybird spills the jam; a full jar + tap on Bun clears the
// blanket; waves advance; when all eight slices are gone the run ends; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/flicknic/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    for (let i = 0; i < 30 && (await game(g => g.bugs().length)) < 1; i++) await wait(100);
    expect(await game(g => g.bugs().some(b => b.type === 'ant')), 'wave 1 sends ants');
    await game(g => { g.hold(true); g.clear(); g.freeze(true); });
    const { cx, cy, plateR, bun, W } = await game(g => g.geo);
    const swipe = async (x0, y0, x1, y1) => { await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x1, y1, { steps: 5 }); await page.mouse.up(); };
    const until = async (fn, n = 30) => { for (let i = 0; i < n && !(await game(fn)); i++) await wait(100); };
    // 1) flick one ant away
    await game((g, [x, y]) => g.add('ant', x, y), [cx + 110, cy + 120]); await swipe(cx + 70, cy + 120, cx + 150, cy + 120); await until(g => g.shooed >= 1);
    let s = await page.evaluate(() => ({ score: __lab.game.score, hud: __lab.state.score, shooed: __lab.game.shooed, n: __lab.game.bugs().length }));
    expect(s.shooed === 1 && s.n === 0 && s.score === 10 && s.hud === 10, 'a swipe flicks the ant off the blanket for 10');
    // 2) bowling: one flick, three ants
    await game((g, [x, y]) => { g.add('ant', x - 60, y); g.add('ant', x - 10, y); g.add('ant', x + 40, y); }, [cx, cy + 200]);
    await swipe(cx - 105, cy + 200, cx - 42, cy + 200); await until(g => g.shooed >= 2);
    s = await game(g => ({ score: g.score, chain: g.bestChain, n: g.bugs().length, st: g.bugs().map(b => b.st).join() }));
    expect(s.chain === 3 && s.score === 10 + 30, 'the flicked ant knocked the second into the third: ×3 chain scores 30'); expect(s.n === 2, 'the two ants that passed their momentum on are still on the blanket, dazed');
    // 3) a thief takes a slice; flicking it brings the slice back
    await game((g, [x, y]) => { g.clear(); g.freeze(false); g.add('ant', x, y); }, [cx + plateR + 6, cy + 4]); await until(g => g.slices === 7, 40);
    expect(await game(g => g.slices === 7 && g.bugs()[0].carry), 'an ant that reaches the plate walks off with a slice');
    await game(g => g.freeze(true)); let b = (await game(g => g.bugs()))[0], sc = await game(g => g.score);
    await swipe(b.x - 6, b.y - 45, b.x + 6, b.y + 45); await until(g => g.slices === 8);
    s = await game(g => ({ slices: g.slices, rescued: g.rescued, score: g.score })); expect(s.slices === 8 && s.rescued === 1 && s.score >= sc + 25, 'flicking the thief sends the slice back to the plate');
    // 4) a thief that gets away costs the slice
    await game((g, [x, y]) => { g.clear(); g.freeze(false); g.thief(x, y); }, [W - 8, cy + 60]); await until(g => g.lost === 1, 50);
    expect(await game(g => g.lost === 1 && g.slices === 7), 'a slice carried off the blanket is lost');
    // 5) beetles need two flicks
    await game((g, [x, y]) => { g.clear(); g.freeze(true); g.add('beetle', x, y); }, [cx - 100, cy + 160]); sc = await game(g => g.score);
    await swipe(cx - 140, cy + 160, cx - 60, cy + 160); await wait(350);
    s = await game(g => ({ st: g.bugs()[0].st, score: g.score })); expect(s.st === 'flip' && s.score === sc, 'the first flick only flips a beetle onto its back');
    b = (await game(g => g.bugs()))[0]; await swipe(b.x + 40, b.y, b.x - 40, b.y); await until(g => g.bugs().length === 0);
    expect(await game(g => g.score) === sc + 30, 'the second flick sends it flying for 30');
    // 6) ladybirds are friends
    await game((g, [x, y]) => { g.jam = .5; g.add('lady', x, y); }, [cx + 100, cy + 170]); sc = await game(g => g.score); await swipe(cx + 100, cy + 130, cx + 100, cy + 215); await wait(300);
    s = await game(g => ({ jam: g.jam, friends: g.friends, score: g.score })); expect(s.friends === 1 && s.jam === 0 && s.score === sc, 'flicking a ladybird spills the jam and scores nothing');
    // 7) full jam jar: tap Bun, everything flies
    await game((g, [x, y]) => { g.clear(); g.jam = 1; g.add('ant', x + 120, y + 90); g.add('ant', x - 110, y + 60); g.add('ant', x, y + 210); }, [cx, cy]);
    const sh = await game(g => g.shooed); await page.touchscreen.tap(bun.x, bun.y); await until(g => g.bugs().length === 0, 40);
    s = await game(g => ({ shooed: g.shooed, jam: g.jam })); expect(s.shooed === sh + 3 && s.jam < .5, 'Bun bangs the pan: all three ants are blown off the blanket');
    // 8) waves advance when the blanket is clear
    await game(g => { g.endWave(); g.hold(false); }); await until(g => g.wave === 2, 40); expect(await game(g => g.wave) === 2, 'wave 2 starts'); await game(g => { g.hold(true); g.clear(); g.freeze(false); });
    // 9) all eight slices gone → the run ends
    const before = await game(g => g.score); await game((g, [x, y]) => { for (let i = 0; i < 7; i++) g.thief(x, y + i * 24); }, [W - 4, cy - 60]);
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(200);
    s = await state(); expect(s.over, 'the run ends when the whole cake has left the blanket'); expect(await game(g => g.lost) === 8 && s.best >= before && s.best > 0, 'eight slices lost; best score recorded');
    await wait(1700); await page.keyboard.press('Enter'); await wait(500);
    s = await state(); expect(s.running && !s.over && s.score === 0, 'restart gives a clean run');
    expect(await game(g => g.slices === 8 && g.lost === 0 && g.wave === 1 && g.jam === 0 && g.shooed === 0), 'cake, wave and jar reset');
  },
};
