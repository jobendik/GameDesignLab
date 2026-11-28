// Slurpentine: menu → DIG IN (real tap) → a real touch drag steers the noodle → greens make it LONG, meat makes it FAT →
// a second finger on DASH sprints and burns fat → the GULP button swallows a third of the tail into fat → keyboard turning,
// Space dash and E gulp → a fat noodle steers its head into a thinner one and bites it (CHOMP/swallow) → pause freezes the
// clock → the lunch rush is played out (broth sinks, chopsticks dodged) → results card with the last-drop bonus, best stored →
// ANOTHER BOWL resets → a thin noodle rams fatter ones three times → SLURPED UP, best kept → Enter restarts cleanly.
module.exports = {
  game: 'games/slithergar.html',
  query: '?seed=7&nopause=1&mute=1&round=60',
  timeout: 170000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const cdp = await page.context().newCDPSession(page);
    const A = { x: 195, y: 560 };   // where the steering finger lands
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const finger = a => ({ x: A.x + Math.cos(a) * 44, y: A.y + Math.sin(a) * 44, id: 1 });
    const down = async () => { await touch('touchStart', [{ x: A.x, y: A.y, id: 1 }]); await wait(30); await frame(); };
    const frame = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => r())));   // touch input is rAF-aligned: let it land before stepping
    const steer = async a => { await touch('touchMove', [finger(a)]); await frame(); };
    const up = async () => { await touch('touchEnd', []); await wait(30); };
    const angTo = (y, q) => Math.atan2(q.y - y.y, q.x - y.x);
    const sAng = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }, dAng = (a, b) => Math.abs(sAng(a, b));
    // one 0.1 s tick of a sensible player: dodge chopsticks, else head for food along a safe heading
    const tick = async meat => { const r = await page.evaluate(meat => { const g = window.__gdl, s = g.state, y = s.you; if (!y.alive) return { a: null };
        for (const k of s.sticks) if (k.ph < 2 && Math.hypot(k.x - y.x, k.y - y.y) < k.r + 110) return { a: g.safe(Math.atan2(y.y - k.y, y.x - k.x)) };
        for (const b of s.bots) if (b.alive && b.r * 1.25 > y.r && Math.hypot(b.x - y.x, b.y - y.y) < 200 + b.r * 4) return { a: g.safe(Math.atan2(y.y - b.y, y.x - b.x)) };   // keep away from fatter heads
        const f = g.food(meat) || g.food(false); return { a: g.safe(f ? Math.atan2(f.y - y.y, f.x - y.x) : y.ang) }; }, meat);
      if (r.a != null) await steer(r.a); await adv(.1); };

    // 1. menu → DIG IN
    let s = await st(); expect(s.mode === 'menu' && await page.locator('#ovMenu').isVisible(), 'boots to the menu');
    await page.evaluate(() => window.__gdl.manual(true)); await page.locator('#bPlay').tap(); await wait(80); s = await st();
    expect(s.mode === 'play' && s.lives === 3 && s.score === 0 && s.you.n === 16 && Math.abs(s.you.mass - 4) < .01 && s.bots.length === 9, 'a fresh bowl: 3 servings, nine rival noodles');
    expect(await page.locator('#bBoost').isVisible() && await page.locator('#bGulp').isVisible(), 'touch DASH and GULP buttons on a phone');

    // 2. a real touch drag steers the head
    const a0 = s.you.ang, want = a0 + 1.6; await down(); await steer(want); await adv(.8); s = await st();
    expect(dAng(s.you.ang, want) < .25, 'the noodle turned toward the drag (' + dAng(a0, want).toFixed(2) + ' → ' + dAng(s.you.ang, want).toFixed(2) + ')');

    // 3. greens → LONG, meat → FAT (two separate resources)
    s = await st(); const n0 = s.you.n, m0 = s.you.mass;
    for (let i = 0; i < 80 && (await st()).you.n < n0 + 14; i++) await tick(false);
    s = await st(); expect(s.you.n >= n0 + 10 && s.score > 0, 'greens made it longer (' + n0 + ' → ' + s.you.n + ', score ' + s.score + ')');
    const n1 = s.you.n, sc1 = s.score; for (let i = 0; i < 400 && (await st()).you.mass < 22; i++) await tick(true);
    s = await st(); expect(s.you.mass >= 22 && s.score > sc1, 'meat made it fat (' + m0.toFixed(1) + ' → ' + s.you.mass.toFixed(1) + ')');
    expect(s.you.r > 14, 'fat noodles are thicker (r ' + s.you.r.toFixed(1) + ')');

    // 4. a second finger on DASH sprints and burns fat; letting go stops it
    s = await st(); const sp0 = s.you.spd, mB = s.you.mass, burnt0 = s.you.burnt;
    { const b = await page.locator('#bBoost').boundingBox(), f1 = finger(s.you.ang); await touch('touchStart', [f1, { x: b.x + b.width / 2, y: b.y + b.height / 2, id: 2 }]); await wait(40); await frame(); }
    await adv(1); s = await st(); expect(s.you.boost && s.you.spd > sp0 * 1.5 && s.you.burnt >= burnt0 + 1, 'DASH burns fat: ' + sp0.toFixed(0) + ' → ' + s.you.spd.toFixed(0) + ' u/s, ' + (s.you.burnt - burnt0) + ' fat crumbs dropped');
    await up(); await adv(.1);
    s = await st(); expect(!s.you.boost, 'releasing DASH stops the sprint'); await down();

    // 5. GULP button: a third of the tail turns into fat
    s = await st(); expect(s.you.n >= 20, 'long enough to gulp'); const gN = s.you.n, gM = s.you.mass;
    { const b = await page.locator('#bGulp').boundingBox(); await touch('touchStart', [finger(s.you.ang), { x: b.x + b.width / 2, y: b.y + b.height / 2, id: 2 }]); await wait(40); await touch('touchMove', [finger(s.you.ang)]); await wait(30); }
    await adv(.05); s = await st(); expect(s.you.gulps === 1 && s.you.n <= gN - Math.floor(gN * .3) + 1 && s.you.mass > gM + Math.floor(gN * .3) * .6, 'GULP: long ' + gN + ' → ' + s.you.n + ', fat ' + gM.toFixed(1) + ' → ' + s.you.mass.toFixed(1));
    await up(); await page.keyboard.press('KeyE'); await adv(.05); expect((await st()).you.gulps === 1, 'E right after a gulp does nothing (cooldown)');

    // 6. keyboard: left arrow turns, Space dashes, E gulps (on cooldown right after a gulp → bonk, nothing happens), M mutes
    await down(); for (let i = 0; i < 40; i++) { s = await st(); if (Math.hypot(s.you.x, s.you.y) < s.R - 300 && dAng(s.you.ang, Math.atan2(-s.you.y, -s.you.x)) < .5) break; await steer(Math.atan2(-s.you.y, -s.you.x)); await adv(.1); } await up();   // away from the rim, which pins the heading
    s = await st(); const ka = s.you.ang; await page.keyboard.down('ArrowLeft'); await adv(.3); s = await st(); await page.keyboard.up('ArrowLeft');
    const turned = -sAng(s.you.ang, ka); expect(s.you.alive && turned > .3 && turned < .3 * 4.3 * Math.sqrt(9 / s.you.r) + .2, 'left arrow turns left (' + turned.toFixed(2) + ' rad)');
    await page.keyboard.down('Space'); await adv(.2); expect((await st()).you.boost, 'Space dashes'); await page.keyboard.up('Space'); await adv(.1);
    await down(); for (let i = 0; i < 26; i++) await tick(false); await up(); await page.keyboard.press('KeyE'); await adv(.05); s = await st(); expect(s.you.gulps === 2, 'E gulps after the cooldown');
    const m1 = await page.locator('#bMute.off').count(); await page.keyboard.press('KeyM'); expect(await page.locator('#bMute.off').count() !== m1, 'M toggles mute'); await page.keyboard.press('KeyM');

    // 7. fat bites thin: steer the head into a thinner noodle's body
    await down(); s = await st(); let prey = null;
    for (let i = 0; i < 450; i++) { s = await st(); if (s.chomps + s.kills > 0) break; const y = s.you;
      if (!y.alive) { await adv(.1); continue; } if (y.mass < 16) { await tick(true); continue; }
      let bv = 1e9; prey = null; for (const b of s.bots) if (b.alive && !b.ghost && y.r >= b.r * 1.36 && b.n > 10) { const d = Math.hypot(b.mid.x - y.x, b.mid.y - y.y); if (d < bv) { bv = d; prey = b; } }
      if (!prey) { await tick(true); continue; }
      await steer(angTo(y, bv > 160 ? { x: prey.mid.x + Math.cos(prey.ang) * 40, y: prey.mid.y + Math.sin(prey.ang) * 40 } : prey.mid)); await adv(.1); }
    s = await st(); expect(s.chomps + s.kills > 0 && s.mode === 'play', 'bit a thinner noodle (chomps ' + s.chomps + ', kills ' + s.kills + ')');

    // 8. pause freezes the clock (real time), resume continues
    await up(); await page.locator('#bPause').tap(); await wait(60); s = await st();
    expect(s.paused && await page.locator('#ovPause').isVisible(), 'pause button pauses');
    await page.evaluate(() => window.__gdl.manual(false)); await wait(400); expect((await st()).t === s.t, 'clock frozen while paused');
    await page.evaluate(() => window.__gdl.manual(true)); await page.locator('#bResume').tap(); await wait(60); await adv(.2); expect(!(await st()).paused && (await st()).t > s.t + .15, 'resume continues');
    await down();

    // 9. play out the lunch rush
    let rushSeen = false, stickSeen = false, pre = null;
    for (let i = 0; i < 900; i++) { s = await st(); if (s.mode !== 'play') break; pre = s; rushSeen = rushSeen || s.rush; stickSeen = stickSeen || s.sticks.length > 0; await tick((i >> 4) % 3 === 0); }
    await up(); s = await st();
    expect(rushSeen && pre.R < 1500 && stickSeen, 'late rush: broth sank to ' + pre.R.toFixed(0) + ', chopsticks came');
    expect(s.mode === 'over' && s.won && pre.lives > 0, 'the clock ran out with servings left (' + s.cause + ')');
    await wait(150); expect(await page.locator('#ovEnd').isVisible() && (await page.locator('#eTitle').textContent()) === 'BOWL EMPTY!', 'results card');
    const rankB = [0, 300, 150, 75][s.rank] || 0;
    const sizeB = pre.you.alive ? pre.you.weight : 0; expect((s.rank >= 1) === pre.you.alive && Math.abs(s.bonus - rankB - s.lives * 50 - sizeB) <= 4 && s.score >= pre.score + s.bonus, 'last-drop bonus = size + place + servings (' + s.bonus + ', place ' + s.rank + ')');
    expect(s.score > 100 && s.best === s.score && JSON.parse(await page.evaluate(() => localStorage.getItem('gdl:best:games/slithergar'))) === s.score, 'score ' + s.score + ' stored as best');
    expect(+(await page.locator('#eLen').textContent()) === s.peakN && s.peakN > 30 && s.peakM > 20, 'card shows peak size (' + s.peakN + ' long, ' + s.peakM.toFixed(0) + ' fat)');
    const best = s.score; if (process.env.SLG_LOG) console.log('round 1:', s.score, 'place', s.rank, 'lives', s.lives, 'bonus', s.bonus, 'peak', s.peakN, s.peakM.toFixed(0), 'chomps', s.chomps, 'kills', s.kills);

    // 10. another bowl: clean reset, then a thin noodle rams fatter ones until the servings run out
    await page.locator('#bAgain').tap(); await wait(80); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.lives === 3 && s.t < .3 && s.you.n === 16 && s.chomps === 0 && !s.rush && s.R === 1500 && s.sticks.length === 0, 'ANOTHER BOWL resets everything');
    await down(); let deaths = 0, lastLives = 3;
    for (let i = 0; i < 900; i++) { s = await st(); if (s.mode !== 'play') break; if (s.lives < lastLives) { deaths++; lastLives = s.lives; }
      const y = s.you; if (!y.alive || y.ghost) { await adv(.1); continue; }
      let bv = 1e9, t = null; for (const b of s.bots) if (b.alive && !b.ghost && b.r * 1.3 > y.r) { const d = Math.hypot(b.mid.x - y.x, b.mid.y - y.y); if (d < bv) { bv = d; t = b; } }
      if (t) await steer(angTo(y, t.mid)); await adv(.1); }
    await up(); s = await st(); expect(s.mode === 'dying' && s.lives === 0 && /Knotted|swallowed|bit|Plucked/.test(s.cause), 'three servings lost (' + s.cause + ')');
    await adv(2); await wait(150); s = await st();
    expect(s.mode === 'over' && !s.won && await page.locator('#ovEnd').isVisible() && (await page.locator('#eTitle').textContent()) === 'SLURPED UP', 'SLURPED UP card');
    expect(s.score < best && s.best === best && JSON.parse(await page.evaluate(() => localStorage.getItem('gdl:best:games/slithergar'))) === best, 'a worse bowl keeps the best (' + s.score + ' < ' + best + ')');

    // 11. Enter restarts cleanly
    await page.keyboard.press('Enter'); await wait(80); s = await st();
    expect(s.mode === 'play' && s.lives === 3 && s.score === 0 && s.you.alive && !(await page.locator('#ovEnd').isVisible()), 'Enter starts a fresh bowl');
  },
};
