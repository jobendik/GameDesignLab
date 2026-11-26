/* Thimble & the Bramble King — gameplay test.
 * Drives the real simulation through the inert hook (window.__gdl): inputs are injected exactly where the keyboard /
 * stick write them and the sim is stepped deterministically (`advance`), so software-rendered frame rate does not matter.
 * The bot below only reads state and produces move / swing / roll inputs — it uses no cheats to deal damage. */
function bot(opts) {
  const g = window.__gdl, hyp = Math.hypot; let t = 0; const max = opts.maxSec || 120; let side = 1, sideT = 0, lx = null, lz = null, stuck = 0;
  while (t < max) {
    const s = g.state, h = s.hero;
    if (s.mode !== 'play' && s.mode !== 'winning') break;
    if (opts.until === 'bloom' && s.blooms >= opts.n) break;
    if (opts.until === 'kills' && s.kills >= opts.n) break;
    if (opts.until === 'dew' && s.dew >= opts.n) break;
    if (opts.until === 'boss' && s.bossOn && s.bossState && s.bossState !== 'intro') break;
    if (opts.until === 'fight' && s.bloomList.some(b => b.state === 'fight') && s.enemies.some(e => e.shrine >= 0 && e.state !== 'spawn')) break;
    let mx = 0, mz = 0, atk = false, roll = false, danger = false, gx = null, gz = null;
    if (s.bossOn || s.gateOpen) { if (!s.bossOn && h.z > s.gate.z + 2.5 && Math.abs(h.x - s.gate.x) > 1) { gx = s.gate.x; gz = s.gate.z + 4.5; } else { gx = s.arena.x; gz = s.arena.z + 2; } }
    else { const f = s.bloomList.filter(b => b.state !== 'awake').sort((a, b) => hyp(a.x - h.x, a.z - h.z) - hyp(b.x - h.x, b.z - h.z))[0]; if (f) { gx = f.x; gz = f.z + 1.5; } }
    let e = null, ed = 1e9; for (const o of s.enemies) { if (o.state === 'spawn') continue; const d = hyp(o.x - h.x, o.z - h.z); if (d < ed) { ed = d; e = o; } }
    const boss = s.bossOn && s.bossPos && s.bossHp > 0 ? s.bossPos : null;
    sideT -= 1 / 30; if (sideT <= 0) { side = -side; sideT = 1.4; }
    let seed = null, sd = 1e9; for (const p of s.seeds) { if (!p.hostile) continue; const d = hyp(p.x - h.x, p.z - h.z); if (((h.x - p.x) * p.vx + (h.z - p.z) * p.vz) > 0 && d < sd) { sd = d; seed = p; } }
    if (boss) {
      const bd = hyp(boss.x - h.x, boss.z - h.z) || 1, st = s.bossState, ax = (boss.x - h.x) / bd, az = (boss.z - h.z) / bd, cd = hyp(h.x - s.arena.x, h.z - s.arena.z) || 1;
      if (st === 'chargeW' || st === 'charge') { mx = -az * side; mz = ax * side; if (st === 'charge' && bd < 7) roll = true; danger = true; }
      else if (st === 'leapW' || st === 'leap') { mx = -ax; mz = -az; danger = true; roll = true; if (cd > 6) { mx = (s.arena.x - h.x) / cd - az * side * .5; mz = (s.arena.z - h.z) / cd + ax * side * .5; } }
      else if (st === 'ringW') { if (bd < 6) { mx = -ax; mz = -az; } }
      else if (st === 'stun' || st === 'tired') { if (bd > 3.2) { mx = ax; mz = az; } else atk = true; }
      else { if (bd < 5.5) { mx = -ax - az * side * .6; mz = -az + ax * side * .6; } else if (bd > 8) { mx = ax; mz = az; } else { mx = -az * side * .6; mz = ax * side * .6; } if (cd > 7.5) { mx += (s.arena.x - h.x) / cd; mz += (s.arena.z - h.z) / cd; } }
      if (seed && sd < 2.6) atk = true;
      if (e && ed < 2.4 && !danger) { atk = true; mx = (e.x - h.x) / ed * .5; mz = (e.z - h.z) / ed * .5; }
    } else if (e && ed < 12) {
      const ax = (e.x - h.x) / ed, az = (e.z - h.z) / ed;
      const thr = (e.type === 'thorn' && (e.state === 'windup' || e.state === 'lunge') && ed < 5) || (e.type === 'brute' && e.state === 'windup' && ed < 4.6);
      if (thr) { danger = true; if (e.type === 'brute') { mx = -ax; mz = -az; } else { mx = -az * side; mz = ax * side; } if (e.state === 'lunge' || e.t > .3) roll = true; }
      else if (ed < 2.1 + (e.type === 'brute' ? 1 : 0)) atk = true;
      else { mx = ax; mz = az; }
      if (seed && sd < 2.6) atk = true;
    } else if (gx != null) {
      const d = hyp(gx - h.x, gz - h.z) || 1; if (d > .5) { mx = (gx - h.x) / d; mz = (gz - h.z) / d; }
      if (s.dews.length) { const dw = s.dews[0], dd = hyp(dw.x - h.x, dw.z - h.z) || 1; if (dd < 6) { mx = (dw.x - h.x) / dd; mz = (dw.z - h.z) / dd; } }
    }
    if (!danger && !atk) { if (lx != null && hyp(h.x - lx, h.z - lz) < .03 && (mx || mz)) stuck++; else stuck = 0; if (stuck > 4) { const a = mx; mx = -mz * side + mx * .3; mz = a * side + mz * .3; } }
    lx = h.x; lz = h.z;
    g.input({ mx, mz, atk: false }); if (atk && h.state === 'move') g.press('atk'); if (roll && h.rollCd <= 0 && h.state !== 'roll') g.press('roll');
    g.advance(1 / 30); t += 1 / 30;
  }
  g.input(null);
  return g.state;
}
module.exports = {
  game: 'games/little-hero-adventure.html', query: '?autostart=1&seed=7&nopause=1&mute=1', mobile: false, timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = sec => page.evaluate(s => window.__gdl.advance(s), sec);
    const play = o => page.evaluate(`(${bot.toString()})(${JSON.stringify(o)})`);
    await page.evaluate(() => { localStorage.removeItem('gdl:best:games/little-hero-adventure'); window.__gdl.manual(true); });
    let s = await st();
    expect(s.mode === 'play' && s.hero.hp === 3 && s.score === 0 && s.enemies.length === 12, 'autostart → fresh run: ' + JSON.stringify({ m: s.mode, hp: s.hero.hp, n: s.enemies.length }));

    // real keyboard: walk north, swing, roll
    const z0 = s.hero.z;
    await page.keyboard.down('KeyW'); await adv(0.6); await page.keyboard.up('KeyW');
    s = await st(); expect(s.hero.z < z0 - 2.5, 'W walks north (z ' + z0.toFixed(1) + ' → ' + s.hero.z.toFixed(1) + ')');
    await page.keyboard.press('Space'); await adv(0.05); s = await st(); expect(s.hero.state === 'swing', 'Space swings: ' + s.hero.state);
    await adv(0.5); await page.keyboard.down('KeyD'); await page.keyboard.press('ShiftLeft'); await adv(0.1); s = await st(); expect(s.hero.state === 'roll' && s.hero.inv > 0, 'Shift rolls with i-frames: ' + s.hero.state);
    await page.keyboard.up('KeyD'); await adv(0.5);

    // pause / resume with the real key
    await page.keyboard.press('KeyP'); s = await st(); expect(s.mode === 'paused', 'P pauses');
    const tP = s.time; await adv(1); s = await st(); expect(s.time === tP, 'sim frozen while paused');
    await page.keyboard.press('Escape'); s = await st(); expect(s.mode === 'play', 'Esc resumes');

    // genuine combat: first kill, dew pickup, score
    s = await play({ until: 'kills', n: 1, maxSec: 40 }); expect(s.kills >= 1 && s.score >= 50, 'first thornling defeated by sword hits, score ' + s.score);
    s = await play({ until: 'dew', n: 1, maxSec: 20 }); expect(s.dew >= 1, 'dew collected');
    // wake a Lantern Bloom by clearing both ambush waves
    s = await play({ until: 'bloom', n: 1, maxSec: 180 });
    expect(s.blooms === 1 && s.hero.maxHp === 4 && s.hero.hp === 4 && s.score >= 500, 'bloom woken → +1 heart, healed: ' + JSON.stringify({ b: s.blooms, hp: s.hero.hp, sc: s.score }));
    const best1 = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/little-hero-adventure')));
    expect(best1 === s.score, 'best score persisted while playing (' + best1 + ' vs ' + s.score + ')');

    // lose: walk into the next ambush and stop defending → real enemy attacks drain every heart
    s = await play({ until: 'fight', maxSec: 90 }); expect(s.mode === 'play', 'reached second ambush');
    for (let i = 0; i < 80 && (await st()).mode === 'play'; i++) await adv(1);
    await adv(3); s = await st();
    expect(s.mode === 'end' && !s.won && s.hero.hp === 0, 'undefended hero is defeated → end screen: ' + s.mode + ' hp ' + s.hero.hp);
    expect(await page.locator('#ovEnd.on').count() === 1, 'end card shown');
    const scoreAtDeath = s.score;
    // continue from the last bloom (score halves)
    await page.click('#bEnd1'); s = await st();
    expect(s.mode === 'play' && s.hero.hp === s.hero.maxHp && s.score === Math.floor(scoreAtDeath / 2) && s.continues === 1, 'regrow at bloom: ' + JSON.stringify({ m: s.mode, hp: s.hero.hp, sc: s.score }));
    // clean restart through the pause menu
    await page.keyboard.press('KeyP'); await page.click('#bRestart'); s = await st();
    expect(s.mode === 'play' && s.score === 0 && s.blooms === 0 && s.kills === 0 && s.hero.hp === 3 && s.hero.maxHp === 3 && s.enemies.length === 12 && s.time < 0.1 && !s.gateOpen, 'restart resets everything: ' + JSON.stringify({ sc: s.score, b: s.blooms, hp: s.hero.hp, n: s.enemies.length }));

    // win: (setup hook skips the three shrines) walk through the gate and beat the Bramble King with real dodges and hits
    await page.evaluate(() => window.__gdl.setup({ openGate: true, hp: 5, x: 0, z: -16 }));
    s = await play({ until: 'boss', maxSec: 60 }); expect(s.bossOn && s.bossHp === 30, 'boss fight starts when entering the arena');
    // armour: sword hits outside a daze window must clink off without damage
    const clink = await page.evaluate(() => { const g = window.__gdl; let swings = 0; for (let i = 0; i < 54; i++) { const s = g.state, h = s.hero, b = s.bossPos, d = Math.hypot(b.x - h.x, b.z - h.z); if (s.bossState === 'stun' || s.bossState === 'tired') break; g.input({ mx: (b.x - h.x) / d, mz: (b.z - h.z) / d }); if (d < 3.6 && h.state === 'move') { g.press('atk'); swings++; } g.advance(1 / 30); } g.input(null); return { swings, hp: g.state.bossHp }; });
    expect(clink.swings >= 1 && clink.hp === 30, 'armoured King shrugs off hits until dazed: ' + JSON.stringify(clink));
    s = await play({ maxSec: 240 });
    for (let i = 0; i < 12 && s.mode !== 'end'; i++) { await adv(1); s = await st(); }
    expect(s.mode === 'end' && s.won, 'Bramble King defeated → win: ' + JSON.stringify({ m: s.mode, won: s.won, hp: s.hero.hp, boss: s.bossHp }));
    expect(s.score >= 2000, 'win score includes the boss + bonuses: ' + s.score);
    const best2 = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/little-hero-adventure')));
    expect(best2 === s.best && best2 >= s.score, 'best saved: ' + best2);
    // next season (NG+) starts clean and harder
    await page.click('#bEnd1'); s = await st();
    expect(s.mode === 'play' && s.loop === 1 && s.score === 0 && s.blooms === 0 && s.hero.hp === 3, 'next season restarts clean with loop 1');
    await page.evaluate(() => window.__gdl.manual(false)); await wait(400);
    s = await st(); expect(s.time > 0, 'real-time loop still running');
  },
};
