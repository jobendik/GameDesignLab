// Ticktock Tower: menu (attract demo) → CLIMB (real tap) → nothing slips or rises until the first tap → a touch tap on the tick
// leaps to the other wall and lands exactly one tick later (PERFECT, combo) → an off-beat Space leap is judged OFF, breaks the
// combo and lands a tick later → holding on slips one brick per beat → the dark rises once climbing → the landing preview is
// honest: leaping onto gear teeth flagged red bites (heart lost, fall), while delaying the leap by half a beat lands safely on the
// same brick → slipping on purpose switches lanes and steers into the other door at a fork → a shrine stair ends in a charm
// draft, picked with a real tap → pause/resume/mute → stopping ends the run (card, stored best, banked gems) → tap anywhere
// restarts the same seeded tower → pause → MENU → DAILY TOWER runs today's seed.
module.exports = {
  game: 'games/spire.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 180000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const vis = id => page.locator(id).isVisible();
    await page.evaluate(() => {
      // in-page pilot: taps on the tick unless the predicted leap is unsafe; `door` = door type to steer into; stops on `until`
      window.__fly = (o, untilSrc, maxSec) => {
        const g = window.__gdl, until = new Function('s', 'p', 'return (' + untilSrc + ')'); let prev = g.state, plan = null;
        for (let i = 0; i < maxSec * 120; i++) {
          const s = g.state; if (until(s, prev)) return { s, p: prev }; if (s.mode !== 'play') return { s, p: prev, ended: true };
          if (o.god && s.hp < 2) g.cheat({ hp: 3 });
          const fr = s.t - s.bt, b = s.ball;
          if (b.st === 'cling' && plan == null && o.tap !== false) {
            const k = s.bn + (fr < 0.2 ? 0 : 1), ok = tb => { const q = g.predict(tb); return !q.cell && !q.air; };
            const lane = (b.c + (s.doorRow - b.r)) % 2, want = o.door && s.doors ? s.doors.indexOf(o.door) : -1;
            if (want >= 0 && want !== lane && s.doorRow - b.r <= 8 && s.doorRow - b.r >= 1 && fr < 0.2) plan = -1; // hold on: slip a brick to switch lanes
            else { plan = k; if (!ok(k)) plan = ok(k + 0.62) ? k + 0.62 : k; }
          }
          if (plan != null && plan >= 0 && b.st === 'cling' && s.beat >= plan) { g.tap(); plan = null; }
          if (b.st !== 'cling' || (plan === -1 && s.slips > prev.slips)) plan = null;
          g.advance(1 / 120); prev = s;
        }
        return { s: g.state, p: prev, timeout: true };
      };
    });
    const fly = (o, until, maxSec) => page.evaluate(([a, b, c]) => window.__fly(a, b, c), [o, until, maxSec]);
    const toTick = async () => { await page.evaluate(() => { const g = window.__gdl, n = g.state.bn; for (let i = 0; i < 400 && g.state.bn === n; i++) g.advance(1 / 120); }); };

    // 1. menu with the demo climbing behind it; a real tap on CLIMB starts the run
    let s = await st(); expect(s.mode === 'menu' && s.demo && await vis('#ovMenu') && !(await vis('#bPause')), 'boots to the menu over the attract demo');
    await page.locator('#bPlay').tap(); await wait(60); await page.evaluate(() => window.__gdl.manual(true)); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && !s.demo && s.seed === 7 && !s.started && s.ball.r === 0 && s.ball.c === 0 && s.hp === 3 && s.score === 0 && s.stage === 1, 'run ready on the bottom brick');
    const doors1 = JSON.stringify(s.doors), gl0 = s.gl;

    // 2. before the first tap nothing slips and the dark waits
    await adv(3); s = await st(); expect(s.ball.r === 0 && s.slips === 0 && s.gl === gl0 && s.bn >= 4, 'count-in: the clock ticks, nothing moves');

    // 3. a touch tap right on the tick: leap to the other wall, land exactly one tick later
    await toTick(); const bn0 = (await st()).bn; await page.touchscreen.tap(195, 420); await adv(1 / 120); s = await st();
    expect(s.started && s.ball.st === 'air' && s.ball.c === 1 && s.ball.kL === bn0 + 1 && s.lastJ === 'PERFECT' && s.combo === 1, 'on-beat tap = PERFECT leap (' + s.lastJ + ')');
    await toTick(); s = await st();
    expect(s.ball.st === 'cling' && s.ball.r === 1 && s.ball.c === 1 && s.bn === bn0 + 1 && s.maxRow === 1 && s.score > 0, 'landed on the next tick, one brick up');

    // 4. an off-beat Space leap: OFF, combo broken, lands a tick later
    await adv(s.spb * 0.6); const b1 = (await st()).bn; await page.keyboard.press('Space'); await adv(1 / 120); s = await st();
    expect(s.ball.st === 'air' && s.combo === 0 && s.offs === 1 && (s.lastJ === 'LATE' || s.lastJ === 'EARLY') && s.ball.kL === b1 + 2, 'off-beat tap is OFF and lands on the second tick (' + s.lastJ + ')');
    await toTick(); await toTick(); s = await st(); expect(s.ball.st === 'cling' && s.ball.r === 2 && s.ball.c === 0, 'landed on brick 2');

    // 5. holding on slips one brick per beat (after a grace of 0.15 s); the dark rises meanwhile
    const r0 = s.ball.r, g1 = s.gl; await toTick(); await adv(0.1); s = await st(); expect(s.ball.r === r0 && s.slips === 0, 'still holding inside the grace window');
    await adv(0.08); s = await st(); expect(s.ball.r === r0 - 1 && s.slips === 1 && s.ball.c === 0 && s.gl > g1, 'slipped one brick; the dark rose');

    // 6. the landing preview is honest: find a leap the preview marks as teeth that a half-beat delay makes safe
    let r = await fly({ god: true }, "s.ball.st === 'cling' && s.t - s.bt < 0.02 && s.landing.t === 'x' && s.landing.bad && !window.__gdl.predict(s.bn + 0.62).cell && !window.__gdl.predict(s.bn + 0.62).air && !window.__gdl.predict(s.bn).air && s.ball.inv <= 0", 120);
    expect(!r.timeout && !r.ended, 'reached a brick whose next leap would land on biting teeth');
    const snap = await page.evaluate(() => { const g = window.__gdl, s = g.state; return { bn: s.bn, hp: s.hp, hits: s.hits, falls: s.falls, r: s.ball.r }; });
    // 6a. delay by half a beat → same brick, but the teeth are retracted on arrival
    await adv(0.62 * (await st()).spb); await page.keyboard.press('Space'); await adv(1 / 120); s = await st();
    expect(s.ball.st === 'air' && s.ball.kL === snap.bn + 2 && s.ball.r === snap.r + 1, 'delayed leap toward the teeth brick');
    await toTick(); await toTick(); await adv(0.12); s = await st();
    expect(s.ball.r === snap.r + 1 && s.hits === snap.hits && s.hp === snap.hp, 'landed on the teeth brick between bites, unharmed');

    // 6b. later, take a flagged leap on purpose → bitten, heart lost, knocked down two bricks
    r = await fly({ god: true }, "s.ball.st === 'cling' && s.t - s.bt < 0.02 && s.landing.t === 'x' && s.landing.bad && !window.__gdl.predict(s.bn).air && s.ball.inv <= 0 && s.hp === 3 && s.ward === 0", 120);
    expect(!r.timeout && !r.ended, 'found a second flagged landing');
    const h0 = r.s; await page.keyboard.press('Space'); await toTick(); await adv(1 / 120); s = await st();
    expect(s.hits === h0.hits + 1 && s.hp === 2 && s.falls === h0.falls + 1 && (s.ball.st === 'fall' || s.ball.r < h0.ball.r + 1), 'bitten: -1 heart and knocked down');

    // 7. route choice: slip on purpose to switch lanes and enter the other door
    await page.evaluate(() => window.__gdl.cheat({ hp: 3 }));
    let bySlip = 0;
    for (let n = 0; n < 6; n++) {
      s = await st(); const lane = (s.ball.c + (s.doorRow - s.ball.r)) % 2, other = s.doors[1 - lane], stage0 = s.stage, slips0 = s.slips, falls0 = s.falls;
      r = await fly({ god: true, door: other }, 's.stage > ' + stage0 + " || s.mode !== 'play'", 200); s = await st();
      expect(s.stage === stage0 + 1 && s.stype === other && (s.slips > slips0 || s.falls > falls0), 'switched lanes into the ' + other + ' door (stair ' + s.stage + ')');
      if (s.slips > slips0) bySlip++;
      if (s.mode === 'draft' || s.stype === 'SHRINE') break;
    }
    expect(bySlip >= 1, 'at least one fork was taken by slipping on purpose (' + bySlip + ')');
    // 8. a shrine stair ends in a charm draft
    if (s.mode !== 'draft') { r = await fly({ god: true, door: 'SHRINE' }, "s.mode === 'draft'", 300); s = await st(); }
    expect(s.mode === 'draft' && s.draft.length >= 1 && await vis('#ovDraft') && !(await vis('#bPause')), 'shrine → charm draft');
    const cid = s.draft[0]; await page.locator('#dList .relic').first().tap(); await wait(60); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && s.charms.length === 1 && s.charms[0] === cid && s.hold > s.bn && !(await vis('#ovDraft')), 'picked ' + cid + '; a short count-in follows');

    // 9. pause freezes the simulation; resume; mute
    await page.evaluate(() => window.__gdl.manual(false)); await wait(40);
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await vis('#ovPause'), 'P pauses');
    await wait(250); expect((await st()).t === s.t, 'nothing moves while paused');
    await page.locator('#bResume').tap(); await page.evaluate(() => window.__gdl.manual(true)); const tR = (await st()).t; await adv(.05); const s2 = await st();
    expect(!s2.paused && s2.t > tR && !(await vis('#ovPause')) && s2.hold > s2.bn, 'resume continues with a count-in');
    await page.keyboard.press('KeyM'); expect((await st()).muted === !s.muted, 'M toggles mute'); await page.keyboard.press('KeyM');

    // 10. stop tapping: slips carry you into the dark; card, best, banked gems
    const bank0 = (await st()).bank; r = await fly({ tap: false }, "s.mode === 'over'", 120); s = await st();
    expect(s.mode === 'over' && !s.alive && s.cause.length > 5, 'run ended: ' + s.cause);
    await adv(.1); await wait(80); s = await st();
    expect(s.overShown && await vis('#ovOver') && (await page.locator('#oScore').textContent()).replace(/,/g, '') === String(s.score), 'run-over card shows the score');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/spire')));
    expect(stored === s.score && s.best === s.score && s.newBest && s.bank === bank0 + s.gems && s.gems > 0, 'best ' + stored + ', ' + s.gems + ' gems banked');
    expect((await page.locator('#oCharms').textContent()).includes('ROUTE'), 'card shows the route taken');

    // 11. tap anywhere → clean restart into the same seeded tower
    await page.touchscreen.tap(195, 830); await wait(60); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && s.alive && !s.started && s.stage === 1 && s.score === 0 && s.hp === 3 && s.charms.length === 0 && s.ball.r === 0 && s.combo === 0 && s.gems === 0, 'restart resets the run');
    expect(JSON.stringify(s.doors) === doors1 && !(await vis('#ovOver')), 'same seed, same first fork');

    // 12. pause → MENU → DAILY TOWER uses today's seed
    await page.locator('#bPause').tap(); await wait(60); await page.locator('#bQuit').tap(); await wait(60); s = await st();
    expect(s.mode === 'menu' && s.demo && await vis('#ovMenu') && (await page.locator('#mStats').textContent()).includes('GEMS BANKED'), 'back on the menu with meta stats');
    await page.locator('#bDaily').tap(); await wait(60); await adv(1 / 120); s = await st();
    const dseed = await page.evaluate(() => { const d = new Date(); return Math.imul(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(), 2246822519) >>> 0; });
    expect(s.mode === 'play' && s.daily && s.seed === dseed && s.score === 0, 'daily run on today\'s seed');
  },
};
