// Frostfoot: real touch / key / drag input drives the runner — variable jump height, flip jump, slide and dive,
// jump buffering and coyote time are each verified; embers fill the scarf, Blaze smashes obstacles, an autopilot using
// only the public verbs survives the authored chunk stream, an unattended runner crashes, restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/20-frostfoot/index.html',
  async run({ page, expect, wait, state, game }) {
    const until = (cond, ms) => page.evaluate(([f, ms]) => new Promise(res => { const t0 = performance.now(), c = new Function('g', 'return (' + f + ')(g)'); (function loop() { if (c(window.__lab.game)) res(true); else if (performance.now() - t0 > ms) res(false); else requestAnimationFrame(loop); })(); }), [cond.toString(), ms]);
    // lowest y (highest point) reached before the runner is back on the ground
    const apex = () => page.evaluate(() => new Promise(res => { const g = window.__lab.game; let m = 0, left = false; (function loop() { const p = g.p; if (!p.on) { left = true; m = Math.min(m, p.y); } else if (left) return res(m); requestAnimationFrame(loop); })(); setTimeout(() => res(m), 3000); }));
    expect((await state()).running, 'game running after autostart');
    await game(g => g.calm(45));                       // push the obstacle stream away while the verbs are checked one by one
    const d0 = await game(g => g.dist); await wait(600);
    expect(await game(g => g.dist) > d0 + 3 && (await state()).score > 0, 'the runner runs on its own and distance scores');

    // 1) touch: a tap jumps
    await page.touchscreen.tap(240, 520);
    expect(await until(g => !g.p.on && g.p.y < -20, 1000), 'a tap makes the runner jump');
    expect(await until(g => g.p.on, 2000) && await game(g => g.p.jumps) === 1, 'and it lands again');

    // 2) variable height: a quick press is a hop, a held press is a leap
    let a = apex(); await page.keyboard.down('Space'); await wait(25); await page.keyboard.up('Space'); const hop = await a;
    a = apex(); await page.keyboard.down('Space'); await wait(450); await page.keyboard.up('Space'); const leap = await a;
    expect(hop < -60 && hop > -125, 'short press = low hop (' + hop.toFixed(0) + ')');
    expect(leap < hop - 30 && leap < -140, 'held press = full leap (' + leap.toFixed(0) + ' vs ' + hop.toFixed(0) + ')');

    // 3) flip jump: a second press in the air goes higher than any single jump
    a = apex(); await page.keyboard.down('Space'); await wait(260); await page.keyboard.press('ArrowUp'); await wait(200); await page.keyboard.up('Space'); const flip = await a;
    expect(await game(g => g.p.flips) === 1 && flip < leap - 40, 'second press in the air flips higher (' + flip.toFixed(0) + ')');

    // 4) slide from the ground; dive from the air lands in a slide
    await page.keyboard.press('ArrowDown'); await wait(60);
    expect(await game(g => g.p.slide > 0 && g.p.slides === 1), 'Down slides');
    await until(g => g.p.slide <= 0, 2000);
    await page.keyboard.down('Space'); await wait(300); await page.keyboard.up('Space'); await page.keyboard.press('ArrowDown'); await wait(30);
    expect(await game(g => g.p.vy) > 900, 'Down in the air dives');
    expect(await until(g => g.p.on && g.p.slide > 0, 1500) && await game(g => g.p.slides) === 2, 'the dive lands in a slide');
    await until(g => g.p.slide <= 0, 2000);

    // 5) swipe down (pointer drag): the press starts a jump, the swipe cancels it into a slide
    a = apex(); await page.mouse.move(240, 420); await page.mouse.down(); await page.mouse.move(240, 480, { steps: 3 }); const nip = await a; await page.mouse.up();
    expect(nip > -60, 'swipe-down cancels the hop almost at once (' + nip.toFixed(0) + ')');
    expect(await until(g => g.p.slides === 3, 1500), 'and slides');
    await until(g => g.p.slide <= 0 && g.p.on, 2000);

    // 6) jump buffer: with the flip spent, a press just before touchdown still jumps on landing
    const j0 = await game(g => g.p.jumps);
    const buffered = await page.evaluate(() => new Promise(res => { const g = window.__lab.game; let st = 0; g.hold(true); g.jump(); (function loop() { const p = g.p; if (st === 0 && p.vy > 0) { g.jump(); st = 1; } else if (st === 1 && p.vy > 0 && p.y > -45 && p.air === 0) { g.jump(); st = 2; g.hold(false); } else if (st === 2 && p.on === false && p.vy < 0 && p.y > -30) return res(true); if (st < 3) requestAnimationFrame(loop); })(); setTimeout(() => res(false), 4000); }));
    expect(buffered && await game(g => g.p.jumps) === j0 + 2, 'a press 1–2 frames before landing is buffered into a jump');
    await until(g => g.p.on, 2000);

    // 7) coyote time: a press just after running off a crevasse edge still jumps
    await game(g => g.put('p', 420, .5));
    const j1 = await game(g => g.p.jumps);
    const saved = await page.evaluate(() => new Promise(res => { const g = window.__lab.game; (function loop() { const n = g.next; if (n && n.k === 'p' && n.dx < -24 && n.dx > -60) { const wasOn = g.p.on; g.hold(true); g.jump(); return res(!wasOn); } requestAnimationFrame(loop); })(); setTimeout(() => res(null), 5000); }));
    expect(saved === true, 'the press came after the runner had left the ledge');
    expect(await game(g => g.p.jumps) === j1 + 1, 'coyote time turns it into a jump');
    await until(g => g.p.on, 2000); await game(g => g.hold(false));
    expect(!(await game(g => g.dead)), 'and the runner clears the crevasse');

    // 8) embers fill the scarf and score
    const s0 = await game(g => g.score), e0 = await game(g => g.embers);
    await game(g => g.put('e', 260, 26, 5));
    expect(await until(g => g.embers >= 5 || g.dead, 3000) && await game(g => g.embers) === e0 + 5, 'running through embers collects them');
    expect(await game(g => g.meter) >= 5 && await game(g => g.score) >= s0 + 50, 'embers heat the scarf and add 10 each');

    // 9) Blaze: a full scarf makes the runner smash through obstacles
    await game(g => { g.setMeter(18); g.put('b', 320); });
    expect(await game(g => g.blaze) > 4, 'a full scarf ignites Blaze');
    expect(await until(g => g.smashes === 1 || g.dead, 3000) && !(await game(g => g.dead)), 'Blaze smashes an ice block instead of crashing');

    // 10) the authored stream is survivable using only jump / hold / slide
    await game(g => { g.setRun(30); g.calm(1.2); });
    const died = await page.evaluate(secs => new Promise(res => {
      const g = window.__lab.game, t0 = performance.now();
      (function loop() {
        if (performance.now() - t0 > secs * 1000 || g.dead) { g.hold(false); return res(g.dead); }
        const n = g.next, v = g.speed, p = g.p;
        if (n) {
          const gate = n.k === 'g' || n.k === 'G', tall = n.k === 'b' || n.k === 'w' || n.k === 'p';
          if (gate) { if (n.dx / v < .1 && n.dx > -n.w - 30 && p.slide <= .1) g.slide(); }
          else if (n.k === 'p') { if (p.on && n.dx < 12 && n.dx > -30) { g.hold(n.w / v > .3); g.jump(); } }
          else if (p.on && n.dx > -n.w * .3 && (n.dx + n.w / 2) / v < (tall ? .34 : .24)) { g.hold(tall); g.jump(); }
        }
        requestAnimationFrame(loop);
      })();
    }), 12);
    expect(!died, 'autopilot survives 12 s of tier-2 chunks');
    const mid = await game(g => ({ dist: g.dist, score: g.score, tier: g.tier }));
    expect(mid.tier >= 2 && mid.score > mid.dist, 'tier ramped and score = distance + bonuses (' + mid.score + ' at ' + mid.dist.toFixed(0) + ' m)');

    // 11) hands off: the runner crashes → game over, best saved
    for (let i = 0; i < 80 && !(await state()).over; i++) await wait(250);
    const e = await state(); expect(e.over, 'an unattended runner crashes and the run ends'); expect(e.best >= e.score && e.best > 0, 'best score recorded');

    // 12) restart
    await wait(1300); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over, 'restart begins a new run');
    expect(await game(g => g.dist < 12 && g.embers === 0 && g.blaze === 0 && !g.dead && g.p.jumps === 0 && g.tier === 0 && g.smashes === 0), 'state fully reset');
  },
};
