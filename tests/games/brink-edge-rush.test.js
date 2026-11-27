// BRINK · Edge Rush: menu (attract demo) → ENDLESS (real tap) → a touch hold climbs, release dives, Space does the same →
// a keyboard pilot threads real gates: every pass is scored by how close it shaved the gap edge, chain/multiplier/surge grow →
// a full Surge ignites the RUSH, which burns through a wall instead of dying → P pauses (simulation frozen), resume, M mutes →
// flying into a wall ends the run (after the earned shield, if any, is spent) → the card shows the score, best is stored →
// tap anywhere restarts cleanly and the same seed deals the same course → MENU → DAILY RUN starts the day's anomaly.
module.exports = {
  game: 'games/brink-edge-rush.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const vis = id => page.locator(id).isVisible();
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    const course = s => s.gates.slice(0, 2).map(g => [(g.d + s.X).toFixed(3), g.kind, g.gaps.map(q => q.c.toFixed(4) + '/' + q.h.toFixed(4))]);
    // one simulation step + the pilot's decision for the next one. plan: 'skim' = hug the upper gap edge, 'ram' = steer at the wall
    const stepPlan = plan => page.evaluate(plan => { const g = window.__gdl; g.advance(1 / 120); const s = g.state, gt = s.gates.find(q => q.d > -0.04); let tgt = .5;
      if (gt) { const gp = gt.gaps.find(q => !q.jack); tgt = plan === 'ram' ? (gp.c > .5 ? 0 : 1) : gp.c - Math.max(0, gp.h - 0.014 - 0.02); }
      return { want: s.y > tgt, alive: s.alive, score: s.score, passed: s.passed, grazes: s.grazes, rush: s.rush, burns: s.burns, t: s.t }; }, plan);
    let keyDown = false;
    const setKey = async d => { if (d !== keyDown) { keyDown = d; await page.keyboard[d ? 'down' : 'up']('Space'); } };
    const fly = async (plan, until, maxSteps) => { let r; for (let i = 0; i < maxSteps; i++) { r = await stepPlan(plan); if (!r.alive || until(r)) break; await setKey(r.want); } await setKey(false); return r; };

    // 1. menu with the attract demo behind it
    let s = await st();
    expect(s.mode === 'menu' && s.demo && await vis('#ovMenu') && !(await vis('#bPause')), 'boots to the menu, demo flying behind it');
    expect((await page.locator('#mSig').textContent()).includes('anomaly'), "menu names today's anomaly");

    // 2. ENDLESS → a fresh seeded run
    await page.locator('#bEndless').tap(); await wait(80); await page.evaluate(() => window.__gdl.manual(true)); await adv(1 / 120);
    s = await st();
    expect(s.mode === 'play' && !s.demo && s.kind === 'endless' && s.seed === 7 && s.score < 20 && s.passed === 0 && s.alive, 'run started from the seed');
    expect(!(await vis('#ovMenu')) && await vis('#bPause') && s.gates.length >= 1, 'menu closed, pause button shown, gates ahead');
    const course0 = JSON.stringify(course(s));

    // 3. the one button: touch hold climbs, release dives; Space does the same
    await adv(.3); const y0 = (await st()).y;
    await touch('touchStart', 200, 600); await wait(30); s = await st(); expect(s.hold, 'touching the screen holds');
    await adv(.25); s = await st(); expect(s.y < y0 - .1 && s.vy < -.8, 'holding climbs (' + (s.y - y0).toFixed(2) + ')');
    await touch('touchEnd'); await wait(30); expect(!(await st()).hold, 'lifting releases');
    const y1 = s.y; await adv(.2); s = await st(); expect(s.y > y1 + .08 && s.vy > .8, 'releasing dives');
    await page.keyboard.down('Space'); const y2 = s.y; await adv(.1); s = await st(); expect(s.hold && s.y < y2, 'Space holds too'); await page.keyboard.up('Space');

    // 4. thread gates along the upper gap edge: grazes score, chain, multiply and charge Surge
    let r = await fly('skim', r => r.grazes >= 3, 120 * 30);
    s = await st();
    expect(r.alive && s.passed >= 3 && s.grazes >= 3 && s.chain >= 3 && s.topTier >= 2, 'three gates shaved (best tier ' + s.topTier + ', chain ' + s.chain + ')');
    expect(s.score > 150 && s.mult > 1.2 && s.surge > .15, 'grazes paid out: score ' + s.score + ', x' + s.mult.toFixed(2) + ', surge ' + s.surge.toFixed(2));

    // 5. a full Surge ignites the Rush; during it a wall is burnt through instead of ending the run
    r = await fly('skim', r => r.rush > 0, 120 * 60); s = await st();
    expect(r.alive && s.rush > 3 && s.rushes === 1 && s.v > .7, 'Rush ignited after ' + s.grazes + ' grazes');
    const burns0 = s.burns; r = await fly('ram', r => r.burns > burns0 || r.rush <= 0, 120 * 6); s = await st();
    expect(s.alive && s.burns === burns0 + 1 && s.rush > 0, 'rammed a wall during the Rush and burnt through it');
    const scoreMid = s.score; expect(scoreMid > 1000, 'score kept climbing (' + scoreMid + ')');

    // 6. pause freezes the simulation; resume; mute toggle
    await page.evaluate(() => window.__gdl.manual(false)); await wait(60);
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await vis('#ovPause'), 'P pauses');
    await wait(250); expect((await st()).t === s.t, 'nothing moves while paused');
    await page.locator('#bResume').tap(); await wait(200); const s2 = await st(); expect(!s2.paused && s2.t > s.t && !(await vis('#ovPause')), 'resume continues');
    await page.keyboard.press('KeyM'); expect((await st()).muted === !s.muted, 'M toggles mute'); await page.keyboard.press('KeyM');
    await page.evaluate(() => window.__gdl.manual(true));

    // 7. after the Rush, steering into walls ends the run (an earned shield absorbs exactly one hit first)
    r = await fly('ram', () => false, 120 * 40); s = await st();
    expect(!s.alive && s.mode === 'over' && s.rush === 0 && s.cause.length > 3, 'hit a wall: ' + s.cause);
    await adv(1); await wait(100); s = await st();
    expect(s.overShown && await vis('#ovOver') && (await page.locator('#oScore').textContent()).replace(/,/g, '') === String(s.score), 'run-over card shows the score');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/brink-edge-rush')));
    expect(stored === s.best && stored === s.score && s.score >= scoreMid, 'best score persisted (' + stored + ')');
    expect(s.feats >= 1 && (await page.locator('#oStats .chip.new').count()) >= 1, 'a feat was earned and shown');

    // 8. tap anywhere → clean restart on the same course
    await page.touchscreen.tap(200, 760); await wait(80); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && s.alive && s.score < 20 && s.passed === 0 && s.chain === 0 && s.grazes === 0 && s.rush === 0 && s.surge === 0 && !s.shield && s.t < .2, 'restart resets the run');
    expect(s.best === stored && !(await vis('#ovOver')) && JSON.stringify(course(s)) === course0, 'best kept, card gone, same seed deals the same course');

    // 9. pause → MENU → DAILY RUN
    await page.locator('#bPause').tap(); await wait(60); await page.locator('#bQuit').tap(); await wait(60); s = await st();
    expect(s.mode === 'menu' && s.demo && await vis('#ovMenu') && (await page.locator('#mStats').textContent()).includes('FEATS'), 'back on the menu with stats');
    await page.locator('#bDaily').tap(); await wait(60); await adv(.1); s = await st();
    expect(s.mode === 'play' && s.kind === 'daily' && typeof s.sig === 'string' && s.score < 20, 'daily run started: ' + s.sig);
  },
};
