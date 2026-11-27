// Lilypad Lunch: the pad follows real mouse/touch/keyboard input, Momo bounces off it (edge = sideways), ripe fruit is
// eaten with a growing gulp chain, green fruit bonks him back and ripens, a bee makes him dizzy, clearing the tree starts
// the next one (with bees), genuine autopilot play scores, three splashes end the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/lilypad-lunch/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const f0 = await game(g => ({ lives: g.lives, level: g.level, n: g.fruits().length, ripe: g.fruits().every(f => f.kind === 0), bees: g.bees() }));
    expect(f0.lives === 3 && f0.level === 1 && f0.n >= 9 && f0.ripe && f0.bees === 0, 'tree 1: ripe fruit only, no bees, three lilies');
    // the pad follows the pointer and the keyboard
    await page.mouse.move(100, 700); await page.mouse.down(); await page.mouse.move(290, 700, { steps: 5 }); await wait(250);
    expect(Math.abs(await game(g => g.padX) - 290) < 8, 'dragging slides the pad'); await page.mouse.up();
    await page.touchscreen.tap(120, 600); await wait(250);
    expect(Math.abs(await game(g => g.padX) - 120) < 8, 'touch moves the pad');
    const px = await game(g => g.padX); await page.keyboard.down('ArrowRight'); await wait(250); await page.keyboard.up('ArrowRight');
    expect(await game(g => g.padX) > px + 60, 'arrow keys move the pad');
    // genuine play: autopilot keeps the pad under Momo, he hops and eats
    await game(g => g.auto(true));
    let s = null; for (let i = 0; i < 50; i++) { await wait(200); s = await page.evaluate(() => ({ hud: window.__lab.state.score, score: window.__lab.game.score, eaten: window.__lab.game.eaten })); if (s.eaten >= 2) break; }
    expect(s.eaten >= 2 && s.score >= 20 && s.hud === s.score, 'bouncing through the fruit eats it and scores (HUD in sync)');
    await game(g => g.auto(false));
    // gulp chain: two fruit in one hop = 10 + 20
    let r = await game(g => { g.clear(); g.add(195, 300, 0); g.add(195, 232, 0); g.add(40, 150, 0); g.setPad(195); const s0 = g.score; g.place(195, 420, 0, -1000); return s0; });
    await wait(330); let q = await game(g => ({ score: g.score, chain: g.chain, left: g.fruits().length }));
    expect(q.score - r === 30 && q.chain === 2 && q.left === 1, 'two fruit in one hop: +10 then +20, chain ×2');
    // green fruit bonks him back down and ripens
    r = await game(g => { g.clear(); g.add(195, 250, 1); g.add(40, 150, 0); g.setPad(195); const s0 = g.score; g.place(195, 400, 0, -900); return s0; });
    await wait(300); q = await game(g => ({ score: g.score, vy: g.momo.vy, kinds: g.fruits().map(f => f.kind), y: g.momo.y }));
    expect(q.vy > 0 && q.y > 250 && q.kinds.every(k => k === 0) && q.kinds.length === 2 && q.score - r === 5, 'green fruit bounces Momo back, ripens, +5');
    // bee sting: dizzy, drops
    await game(g => { g.clear(); g.add(40, 150, 0); g.bee(195, 300); g.setPad(195); g.place(195, 380, 0, -700); });
    await wait(220); q = await game(g => ({ dizzy: g.momo.dizzy, vy: g.momo.vy, chain: g.chain }));
    expect(q.dizzy && q.vy > 0 && q.chain === 0, 'a bee stings Momo dizzy and he drops');
    // pad bounce: centre = straight up, edge = sideways
    await game(g => { g.clear(); g.add(40, 150, 0); g.setPad(200); g.place(200, g.padY - g.r - 30, 0, 400); });
    await wait(200); q = await game(g => g.momo); expect(q.vy < 0 && Math.abs(q.vx) < 40, 'landing on the middle of the pad bounces straight up');
    await game(g => { g.setPad(200); g.place(200 + g.padHalf * .85, g.padY - g.r - 30, 0, 400); });
    await wait(200); q = await game(g => g.momo); expect(q.vy < 0 && q.vx > 100, 'landing on the right edge sends him right');
    // last fruit eaten → next tree, harder
    await game(g => { g.clear(); g.add(195, 300, 0); g.setPad(195); g.place(195, 380, 0, -700); });
    for (let i = 0; i < 15 && await game(g => g.level) < 2; i++) await wait(150);
    q = await game(g => ({ level: g.level, n: g.fruits().length, bees: g.bees(), lives: g.lives }));
    expect(q.level === 2 && q.n >= 9 && q.bees >= 1, 'clearing the tree starts tree 2 with a bee');
    // three splashes end the run
    let lives = q.lives; expect(lives === 3, 'no lily lost so far');
    for (let i = 0; i < 3; i++) {
      await game(g => { g.setPad(60); g.place(330, g.waterY - 40, 0, 500); });
      for (let k = 0; k < 15 && await game(g => g.lives) === lives; k++) await wait(100);
      const now = await game(g => g.lives); expect(now === lives - 1, 'missing the pad costs a lily (' + now + ')'); lives = now;
    }
    for (let i = 0; i < 20 && !(await state()).over; i++) await wait(150);
    const e = await state(); expect(e.over, 'third splash ends the run'); expect(e.best >= e.score && e.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(500);
    const n = await state(); expect(n.running && !n.over && n.score === 0, 'restart gives a clean run');
    expect(await game(g => g.lives === 3 && g.level === 1 && g.eaten === 0 && g.chain === 0 && g.momo.state === 'sit' && g.bees() === 0), 'lives, tree and counters reset');
  },
};
