// Bounce Dungeon: menu (attract demo) → DESCEND (real tap) → a touch tap kicks the ball up and turns it around → a Space kick right
// after a bounce is PERFECT (+1 charge, higher) → wall bounces bank charge and a hit deals 1 + charge, spending it → clearing the
// room opens the relic draft; a real tap on a relic starts room 2 → every enemy attack is preceded by its red telegraph state →
// pause freezes the sim, resume, mute → the Gel King telegraphs, leaps and sends floor shockwaves; felling it opens BOSS TREASURE,
// MEND FULLY via key 4 → floor 2 → never kicking ends the run → card, stored best, banked gold → tap anywhere restarts the same
// seeded dungeon → pause → MENU → DAILY DUNGEON runs today's seed.
module.exports = {
  game: 'games/bounce-dungeon.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 180000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const vis = id => page.locator(id).isVisible();
    // in-page driver: step 1/120 s, run a pilot, stop when `until` (a function source) is true
    await page.evaluate(() => {
      window.__drive = (pilot, untilSrc, maxSec) => {
        const g = window.__gdl, until = new Function('s', 'p', 'return (' + untilSrc + ')'); let prev = g.state;
        for (let i = 0; i < maxSec * 120; i++) {
          g.advance(1 / 120); const s = g.state;
          if (until(s, prev)) return { s, p: prev };
          if (s.mode !== 'play') return { s, p: prev, ended: true };
          const h = s.hero, e = s.enemies.filter(e => e.spawn <= 0).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
          if (pilot === 'seek' && e && s.since < 0.02 && s.since > 0) { const away = (e.x - h.x) * h.vx < 0; if (e.y < h.y - 40 || (away && Math.abs(e.x - h.x) > 60)) g.tap(); }
          if (pilot === 'dodge') { const thr = s.bolts.some(b => Math.hypot(b.x - h.x, b.y - h.y) < 90) || s.waves.some(w => (h.x - w.x) * w.dir > 0 && (h.x - w.x) * w.dir < 90 && h.y > s.RH - 90) ||
              s.enemies.some(o => ['spike', 'dash', 'dive', 'jump'].includes(o.st) && Math.hypot(o.x - h.x, o.y - h.y) < o.r + 70); if (thr && h.vy > -100) g.tap(); }
          prev = s;
        }
        return { s: g.state, p: prev, timeout: true };
      };
    });
    const drive = (pilot, until, maxSec) => page.evaluate(([a, b, c]) => window.__drive(a, b, c), [pilot, until, maxSec]);

    // 1. menu with the demo bouncing behind it; a real tap on DESCEND starts the run
    let s = await st(); expect(s.mode === 'menu' && s.demo && await vis('#ovMenu') && !(await vis('#bPause')), 'boots to the menu over the attract demo');
    await page.locator('#bPlay').tap(); await wait(60); await page.evaluate(() => window.__gdl.manual(true)); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && !s.demo && s.seed === 7 && s.floor === 1 && s.room === 1 && s.hp === 3 && s.score === 0 && s.kicks === 0, 'run started on floor 1, room 1');
    expect(s.enemies.length === 2 && s.enemies.every(e => e.k === 'slime'), 'the first room holds two slimes');
    const layout1 = JSON.stringify(s.enemies.map(e => [e.k, e.x.toFixed(2)]));

    // 2. a touch tap on the playfield = KICK: up, and the other way
    let r = await drive('none', 's.hero.vy > 50 && s.since > 0.3 && s.intro < 0', 5); const vx0 = r.s.hero.vx;
    await page.touchscreen.tap(195, 500); await adv(1 / 120); s = await st();
    expect(s.kicks === 1 && s.perfects === 0 && Math.sign(s.hero.vx) === -Math.sign(vx0) && s.hero.vy < -440, 'a tap kicks up and turns around (vy ' + s.hero.vy.toFixed(0) + ')');

    // 3. Space right after a bounce = PERFECT kick: higher, and +1 charge
    r = await drive('none', 's.since > 0 && s.since < 0.05 && s.charge < s.cap', 6); const c0 = r.s.charge;
    await page.keyboard.press('Space'); await adv(1 / 120); s = await st();
    expect(s.kicks === 2 && s.perfects === 1 && s.charge === c0 + 1 && s.hero.vy < -510, 'PERFECT kick: charge ' + c0 + ' → ' + s.charge + ', vy ' + s.hero.vy.toFixed(0));

    // 4. bouncing off a wall banks charge
    r = await drive('none', 's.banks > p.banks && Math.abs(s.hero.vx) > 50 && (s.hero.x < s.hero.r + 1 || s.hero.x > s.RW - s.hero.r - 1)', 8);
    expect(!r.timeout && (r.s.charge === r.p.charge + 1 || r.s.charge === r.s.cap), 'a wall bounce adds charge (' + r.p.charge + ' → ' + r.s.charge + ')');

    // 5. a hit deals 1 + charge (x2 from above) and spends the charge
    r = await drive('seek', 's.hits > p.hits && p.charge >= 1', 40); expect(!r.timeout && !r.ended, 'a charged hit landed');
    const tgt = r.p.enemies.find(e => { const n = r.s.enemies.find(o => o.id === e.id); return !n || n.hp < e.hp; }), after = r.s.enemies.find(o => o.id === tgt.id);
    const want = (1 + r.p.charge) * (r.s.crushes > r.p.crushes ? 2 : 1);
    expect(after ? tgt.hp - after.hp === want : tgt.hp <= want, 'hit with charge ' + r.p.charge + ' dealt ' + want + (r.s.crushes > r.p.crushes ? ' (CRUSH)' : ''));
    expect(r.s.charge === 0 && r.s.score > r.p.score, 'charge spent, score up (' + r.s.score + ')');

    // 6. clearing the room opens the relic draft; a real tap picks one and room 2 begins
    r = await drive('seek', "s.mode === 'draft'", 90); s = await st();
    expect(s.mode === 'draft' && s.kills === 2 && s.draft.length === 3 && await vis('#ovDraft') && !(await vis('#bPause')), 'room cleared → draft of 3 relics');
    expect(await page.locator('#dList .relic').count() === 3 && (await page.locator('#dTitle').textContent()) === 'CHOOSE A RELIC', 'three relic buttons shown');
    const pickId = s.draft[0]; await page.locator('#dList .relic').first().tap(); await wait(60); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && s.room === 2 && s.relics.length === 1 && s.relics[0] === pickId && !(await vis('#ovDraft')), 'picked ' + pickId + ', room 2 started');

    // 7. every attack is telegraphed: an enemy only reaches an attack state straight from its red 'tele' state
    const tel = await page.evaluate(() => { const g = window.__gdl, last = {}; let seen = 0, attacks = 0, bad = 0;
      for (let i = 0; i < 120 * 20; i++) { g.advance(1 / 120); const s = g.state; if (s.mode !== 'play') break; g.cheat({ hp: 3 });
        for (const e of s.enemies) { const p = last[e.id]; if (['spike', 'dive', 'dash'].includes(e.st) && p !== e.st) { attacks++; if (p !== 'tele') bad++; } if (e.st === 'tele') seen++; last[e.id] = e.st; }
        if (attacks >= 2) break; } return { seen, attacks, bad }; });
    expect(tel.attacks >= 1 && tel.bad === 0 && tel.seen > 30, 'attacks always follow a telegraph (' + JSON.stringify(tel) + ')');

    // 8. pause freezes the simulation; resume; mute
    await page.evaluate(() => window.__gdl.manual(false)); await wait(40);
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && await vis('#ovPause'), 'P pauses');
    await wait(250); expect((await st()).t === s.t, 'nothing moves while paused');
    await page.locator('#bResume').tap(); await page.evaluate(() => window.__gdl.manual(true)); const tR = (await st()).t; await adv(.05); const s2 = await st();
    expect(!s2.paused && s2.t > tR && !(await vis('#ovPause')), 'resume continues');
    await page.keyboard.press('KeyM'); expect((await st()).muted === !s.muted, 'M toggles mute'); await page.keyboard.press('KeyM');

    // 9. the Gel King (boss of floor 1): telegraph → leap → shockwaves along the floor; felling it opens BOSS TREASURE
    await page.evaluate(() => { window.__gdl.cheat({ hp: 3 }); window.__gdl.goto(1, 4); }); s = await st();
    expect(s.boss && s.boss.k === 'gel' && s.room === 4 && s.enemies.length === 1, 'boss room: the Gel King');
    r = await drive('dodge', "s.boss.st === 'tele'", 8); expect(!r.timeout, 'the king crouches (telegraph)');
    r = await drive('dodge', "s.boss.st === 'jump'", 1.5); expect(!r.timeout && r.s.t - r.p.t < .02, 'then leaps');
    r = await drive('dodge', 's.waves.length === 2', 2); expect(!r.timeout, 'landing sends two floor shockwaves');
    await page.evaluate(() => { const g = window.__gdl, b = g.state.enemies.find(e => e.boss); g.enemy(b.id, { hp: 2 }); g.cheat({ hp: 3 }); });
    r = await drive('seek', "s.mode === 'draft'", 60); s = await st();
    expect(s.mode === 'draft' && s.boss.dead && (await page.locator('#dTitle').textContent()) === 'BOSS TREASURE' && (await page.locator('#bMend').textContent()).includes('MEND FULLY'), 'king felled → boss treasure');
    await page.evaluate(() => window.__gdl.cheat({ hp: 1 })); await page.keyboard.press('Digit4'); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && s.floor === 2 && s.room === 1 && s.hp === s.maxHp && s.relics.length === 1, 'MEND FULLY restored hearts; floor 2 begins');

    // 10. never kicking ends the run; card, best, banked gold
    const bank0 = s.bank; await page.evaluate(() => window.__gdl.cheat({ hp: 1 }));
    for (let k = 0; k < 8; k++) { r = await drive('none', "s.mode === 'over'", 120); s = await st(); if (s.mode !== 'draft') break; await page.evaluate(() => { window.__gdl.pick(0); window.__gdl.cheat({ hp: 1 }); }); }
    expect(s.mode === 'over' && !s.alive && s.hp === 0 && s.cause.length > 5, 'the run ended: ' + s.cause);
    await adv(.3); await wait(80); s = await st();
    expect(s.overShown && await vis('#ovOver') && (await page.locator('#oScore').textContent()).replace(/,/g, '') === String(s.score), 'run-over card shows the score');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/bounce-dungeon')));
    expect(stored === s.score && s.best === s.score && s.newBest && s.bank === bank0 + s.gold && s.gold > 0, 'best ' + stored + ' and ' + s.gold + ' gold banked');
    expect((await page.locator('#oCause').textContent()).includes('floor 2'), 'card names the cause and the floor');

    // 11. tap anywhere → clean restart into the same seeded dungeon
    await page.touchscreen.tap(195, 830); await wait(60); await adv(1 / 120); s = await st();
    expect(s.mode === 'play' && s.alive && s.floor === 1 && s.room === 1 && s.score === 0 && s.hp === 3 && s.relics.length === 0 && s.kicks === 0 && s.charge === 0 && s.gold === 0, 'restart resets the run');
    expect(JSON.stringify(s.enemies.map(e => [e.k, e.x.toFixed(2)])) === layout1 && !(await vis('#ovOver')), 'same seed, same first room');

    // 12. pause → MENU → DAILY DUNGEON uses today's seed
    await page.locator('#bPause').tap(); await wait(60); await page.locator('#bQuit').tap(); await wait(60); s = await st();
    expect(s.mode === 'menu' && s.demo && await vis('#ovMenu') && (await page.locator('#mStats').textContent()).includes('GOLD BANKED'), 'back on the menu with meta stats');
    await page.locator('#bDaily').tap(); await wait(60); await adv(1 / 120); s = await st();
    const dseed = await page.evaluate(() => { const d = new Date(); return Math.imul(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(), 2654435761) >>> 0; });
    expect(s.mode === 'play' && s.daily && s.seed === dseed && s.score === 0, 'daily run on today\'s seed');
  },
};
