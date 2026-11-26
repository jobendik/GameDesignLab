// Fizzwhiz: holding thrusts up and releasing drops (pointer + Space), caps score along the trail, skimming a hazard
// is a close shave that feeds the FIZZ meter, a full meter starts an invincible overdrive that smashes hazards,
// the bumper car flips on tap and absorbs one hit, an unshielded hit ends the run, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/27-fizzwhiz/index.html', timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const H = await game(g => g.height);
    expect(await game(g => g.alive && g.mode === 'jet' && g.y > g.height - 20), 'fox starts running on the boardwalk');
    // close shave: a wire hanging just above the fox's head while it runs underneath
    await game(g => g.wireAhead(180, -63)); await wait(1100);
    const sh = await game(g => ({ shaves: g.shaves, fizz: g.fizz, alive: g.alive, score: g.score, m: g.metres }));
    expect(sh.alive && sh.shaves === 1, 'skimming under a hazard counts as a close shave');
    expect(sh.fizz >= .2 && sh.score >= sh.m + 10, 'a close shave feeds the FIZZ meter and scores +10');
    // real input: hold to rise, release to fall
    await page.mouse.move(200, 400); await page.mouse.down(); await wait(420);
    const up = await game(g => ({ y: g.y, vy: g.vy })); expect(up.y < H - 80 && up.vy < 0, 'holding the pointer thrusts upward');
    await page.mouse.up(); await wait(1500);
    expect(await game(g => g.y > g.height - 20), 'releasing drops back to the boardwalk');
    await page.keyboard.down('Space'); await wait(300); const ky = await game(g => g.y); await page.keyboard.up('Space');
    expect(ky < H - 40, 'Space thrusts too');
    // fly the cap trail with the same hold/press actions the input handlers use
    await page.evaluate(() => {
      const g = window.__lab.game;
      window.__pilot = setInterval(() => {
        if (!g.alive) return; const gy = g.guide(), target = gy == null ? g.height * .5 : gy;
        if (g.mode === 'car') { if ((target < g.height * .5 ? -1 : 1) !== g.gdir) g.press(); } else g.setHold(g.y + g.vy * .1 > target);
      }, 16);
    });
    for (let i = 0; i < 60 && (await game(g => g.caps)) < 15 && !(await state()).over; i++) await wait(200);
    const run = await game(g => ({ caps: g.caps, score: g.score, m: g.metres, alive: g.alive }));
    expect(run.alive && run.caps >= 15, 'following the trail collects caps (' + run.caps + ')');
    expect(run.score >= run.m + run.caps, 'score = distance + caps + bonuses');
    const both = await page.evaluate(() => [window.__lab.state.score, window.__lab.game.score]);
    expect(both[0] === both[1] && both[0] > 0, 'HUD shows the score');
    // overdrive: full meter → invincible, hazards are smashed for points
    await game(g => g.setFizz(1)); await wait(150);
    expect(await game(g => g.overdrive), 'a full FIZZ meter starts the SHAKEN! overdrive');
    const s0 = await game(g => g.score); await game(g => g.wireAhead(170, 0, g.height * 3)); await wait(700);
    const odr = await game(g => ({ alive: g.alive, smashes: g.smashes, score: g.score }));
    expect(odr.alive && odr.smashes >= 1 && odr.score >= s0 + 15, 'overdrive smashes a hazard instead of dying');
    for (let i = 0; i < 40 && (await game(g => g.overdrive || g.inv)); i++) await wait(200);
    expect(await game(g => g.alive && !g.overdrive && g.fizz < .5), 'overdrive ends and the meter is spent');
    // bumper car: tap flips to the awning; it absorbs one hit
    await page.evaluate(() => clearInterval(window.__pilot)); await game(g => { g.setHold(false); g.give('car'); });
    expect(await game(g => g.mode === 'car'), 'pickup puts the fox in a bumper car');
    await page.touchscreen.tap(200, 500); await wait(700);
    expect(await game(g => g.gdir === -1 && g.y < g.height * .2), 'a tap flips the car up to the awning');
    await game(g => g.wireAhead(150, 0, g.height * 3)); await wait(650);
    expect(await game(g => g.mode === 'jet' && g.alive && g.inv), 'the car takes the hit and the fox carries on, briefly invulnerable');
    // an unprotected hit ends the run
    for (let i = 0; i < 20 && await game(g => g.inv); i++) await wait(120);
    await game(g => g.wireAhead(120, 0, g.height * 3));
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'hitting a hazard ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score < 6, 'restart gives a clean run (score is distance-based, so only a few metres in)');
    expect(await game(g => g.caps === 0 && g.metres < 6 && g.fizz === 0 && g.mode === 'jet' && g.alive && g.shaves === 0), 'state fully reset');
  },
};
