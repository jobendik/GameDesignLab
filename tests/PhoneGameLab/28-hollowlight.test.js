// Hollowlight: holding rises / releasing sinks (pointer + Space), each press sends an echo, flying the tunnel scores
// distance and motes restore glow, glow fades over time, a wall knocks glow out (with brief invulnerability),
// running out of glow ends the run, restart is clean, best persists.
module.exports = {
  game: 'PhoneGameLab/games/28-hollowlight/index.html', timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => !g.started && g.alive && g.light === 1), 'waits for the first press with a full glow');
    // real input: hold to rise, release to sink; every press is an echo
    await page.mouse.move(200, 500); await page.mouse.down(); await wait(260);
    const up = await game(g => ({ vy: g.vy, started: g.started, pings: g.pings }));
    expect(up.started && up.vy < -60 && up.pings === 1, 'holding the pointer starts the run, rises and sends one echo');
    await page.mouse.up(); await wait(520);
    expect(await game(g => g.vy) > 40, 'releasing sinks');
    await page.keyboard.down('Space'); await wait(220); const kv = await game(g => ({ vy: g.vy, pings: g.pings })); await page.keyboard.up('Space');
    expect(kv.pings === 2 && kv.vy < 40, 'Space rises and echoes too');
    // fly the centre line with the game's own hold/press actions; record what a mote does to the glow
    await page.evaluate(() => {
      const g = window.__lab.game; let lastM = g.motes, lastL = g.light, h = false; window.__gain = 0;
      window.__pilot = setInterval(() => {
        if (!g.alive) return; if (g.motes > lastM) window.__gain = Math.max(window.__gain, g.light - lastL); lastM = g.motes; lastL = g.light;
        const a = g.ahead(55), want = g.y + g.vy * .22 > (a.top + a.bot) / 2; if (want && !h) g.press(); h = want; g.setHold(want);
      }, 16);
    });
    await game(g => g.setLight(.6));
    for (let i = 0; i < 120 && ((await game(g => g.metres)) < 70 || (await game(g => g.motes)) < 3) && !(await state()).over; i++) await wait(200);
    const run = await game(g => ({ m: g.metres, motes: g.motes, score: g.score, alive: g.alive, bumps: g.bumps, light: g.light }));
    expect(run.alive && run.m >= 70 && run.bumps === 0, 'pilot flies 70 m of tunnel without touching a wall (' + run.m + ' m)');
    expect(run.motes >= 3 && run.score >= run.m + run.motes * 5, 'distance and motes both score');
    expect(await page.evaluate(() => window.__gain) > .02, 'collecting a mote restores glow');
    const both = await page.evaluate(() => [window.__lab.state.score, window.__lab.game.score]); expect(both[0] === both[1], 'HUD shows the score');
    // glow fades with time
    await game(g => g.setLight(.5)); const m0 = await game(g => g.motes); await wait(1200);
    const fade = await game(g => ({ l: g.light, m: g.motes })); expect(fade.m > m0 || fade.l < .5, 'glow fades unless motes top it up');
    // let go: the moth sinks into the floor, loses a chunk of glow and bounces off, invulnerable for a moment
    await page.evaluate(() => { clearInterval(window.__pilot); window.__lab.game.setHold(false); window.__lab.game.setLight(1); });
    for (let i = 0; i < 50 && (await game(g => g.bumps)) < 1; i++) await wait(80);
    const b = await game(g => ({ bumps: g.bumps, light: g.light, alive: g.alive, inv: g.inv }));
    expect(b.bumps === 1 && b.alive && b.inv && b.light < .75 && b.light > .6, 'a wall knocks out ~30% glow, the run continues');
    // keep scraping: the glow runs out and the run ends
    for (let i = 0; i < 100 && !(await state()).over; i++) await wait(200);
    const s = await state(); expect(s.over, 'losing all glow ends the run'); expect(await game(g => g.bumps) >= 3, 'it took several hits');
    expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.metres === 0 && g.light === 1 && g.motes === 0 && g.bumps === 0 && g.alive && !g.started && g.depth === 0), 'state fully reset');
  },
};
