// Neon Galaxy: Ore Run: menu → DEPLOY (real tap) → a CDP thumb-stick drag flies the skiff → flying up to an asteroid lets the
// auto-turret crack it and the ore rides the tether → flying into the Forge banks it (score = 10 per ore) → a second finger
// pulses → keyboard flight, mute, pause → the stick pilot hauls sector 1's quota → the horn opens the upgrade card → tapping
// an upgrade starts sector 2 with it applied → idling through sector 2 ends the contract (quota or wreck) → best stored →
// NEW CONTRACT resets everything.
module.exports = {
  game: 'games/neon-galaxy.html',
  query: '?seed=5&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const BX = 110, BY = 660;
    const frames = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const finger = async (dx, dy) => { await touch('touchMove', [{ x: BX + dx * 60, y: BY + dy * 60, id: 1 }]);   // wait until the game has seen the move, so stepping stays deterministic
      for (let k = 0; k < 20; k++) { await frames(); const q = await page.evaluate(() => window.__gdl.state.stick); if (!q.on || (Math.abs(q.dx - dx * 60) < 1.5 && Math.abs(q.dy - dy * 60) < 1.5)) break; } };

    // 1. menu → DEPLOY
    let s = await st(); expect(s.mode === 'menu' && s.card === 'ovMenu', 'boots to the menu card');
    await page.evaluate(() => window.__gdl.manual(true));             // the test steps the simulation itself from here
    await page.locator('#bPlay').tap(); await wait(120); s = await st();
    expect(s.mode === 'play' && s.card === null && s.wave === 1 && s.quota === 28 && s.you.hull === 100 && s.you.tow === 0 && s.rivals.length === 3 && s.score === 0, 'sector 1: full hull, empty tether, 3 rivals, quota 28');

    // 2. thumb stick flies the skiff
    const x0 = s.you.x; await touch('touchStart', [{ x: BX, y: BY, id: 1 }]); await frames(); await finger(1, 0); await adv(1); s = await st();
    expect(s.you.x > x0 + 150 && s.you.dx > .95, 'stick drag flies right (' + (s.you.x - x0).toFixed(0) + ')');

    // the pilot: haul to the Forge when the tether is (nearly) full or time is short, else grab loose ore, else hover by the nearest rock
    const pilot = (bankAt) => page.evaluate(bankAt => { const g = window.__gdl, s = g.state, y = s.you; if (!y || !y.alive || s.mode !== 'play') return null;
      let tx = 0, ty = 0, why = 'bank'; const ore = g.looseOre(); let bo = null, bd = 1e9; for (const o of ore) { const d = Math.hypot(o.x - y.x, o.y - y.y); if (d < bd) { bd = d; bo = o; } }
      if (y.tow >= Math.min(bankAt, y.cap - 1) || (s.waveT < 14 && y.tow > 0) || (y.tow >= 6 && Math.hypot(y.x, y.y) < 450)) { tx = 0; ty = 0; }
      else if (bo && bd < 500) { tx = bo.x; ty = bo.y; why = 'ore'; }
      else { let br = null, rd = 1e9; for (const r of s.rocks) { const d = Math.hypot(r.x - y.x, r.y - y.y) - r.r; if (d < rd) { rd = d; br = r; } } if (br) { const dx = y.x - br.x, dy = y.y - br.y, l = Math.hypot(dx, dy) || 1; tx = br.x + dx / l * (br.r + 150); ty = br.y + dy / l * (br.r + 150); why = 'rock'; } }
      const dx = tx - y.x, dy = ty - y.y, l = Math.hypot(dx, dy); return l < 8 ? { dx: 0, dy: 0, why } : { dx: dx / l, dy: dy / l, why }; }, bankAt);
    const fly = async (secs, bankAt, until) => { for (let i = 0; i < secs * 4; i++) { const p = await pilot(bankAt); if (!p) break; await finger(p.dx, p.dy); await adv(.25); if (until && await until()) break; } };

    // 3. the turret cracks rocks on its own; ore rides the tether
    await fly(25, 99, async () => (await st()).you.tow >= 4); s = await st();
    expect(s.you.tow >= 4 && s.loose >= 0, 'auto-turret cracked rocks and the tether carries ' + s.you.tow + ' ore');

    // 4. the Forge banks the tether
    const tow = s.you.towValue, ore0 = s.ore; await fly(30, 1, async () => (await st()).you.tow === 0); s = await st();
    expect(s.you.tow === 0 && s.ore >= ore0 + tow && s.waveBank === s.ore && s.score === s.ore * 10 + s.kills * 40, 'banked ' + s.ore + ' ore at the Forge; score ' + s.score);

    // 5. second finger pulses; keyboard; mute; pause
    s = await st(); expect(s.you.pulseCd <= 0, 'pulse ready');
    { const f1 = { x: BX, y: BY, id: 1 }; await touch('touchMove', [f1]); await frames(); await touch('touchStart', [f1, { x: 300, y: 300, id: 2 }]); await touch('touchMove', [f1]); await frames(); }
    await adv(.05); s = await st(); expect(s.you.pulseCd > 4, 'second finger fires the pulse (cooldown ' + s.you.pulseCd.toFixed(1) + ')');
    await touch('touchEnd', []); await frames();
    const y0 = s.you.y; await page.keyboard.down('KeyW'); await wait(30); await adv(.8); s = await st(); expect(s.you.y < y0 - 100, 'W flies up'); await page.keyboard.up('KeyW');
    const mu = await page.locator('#bMute.off').count(); await page.keyboard.press('KeyM'); expect(await page.locator('#bMute.off').count() !== mu, 'M toggles mute'); await page.keyboard.press('KeyM');
    await page.keyboard.press('KeyP'); await wait(60); s = await st(); expect(s.paused && s.card === 'ovPause', 'P pauses');
    await page.evaluate(() => window.__gdl.manual(false)); await wait(400); expect((await st()).waveT === s.waveT, 'sector clock frozen while paused'); await page.evaluate(() => window.__gdl.manual(true));
    await page.locator('#bResume').tap(); await wait(100); await adv(.5); { const q = await st(); expect(!q.paused && q.card === null && q.waveT < s.waveT - .4, 'resume'); }

    // 6. haul the rest of sector 1; the horn opens the upgrade card
    await touch('touchStart', [{ x: BX, y: BY, id: 1 }]); await frames();
    await fly(80, 9, async () => (await st()).mode !== 'play'); await touch('touchEnd', []); await frames(); await wait(150); s = await st();
    expect(s.mode === 'shop' && s.card === 'ovShop' && s.choices.length === 3 && s.waveBank >= 28, 'quota met (' + s.waveBank + '/28) → upgrade card');
    expect(s.score === s.ore * 10 + s.kills * 40 + 100 + (s.waveBank - 28) * 5, 'score = ore×10 + wrecks×40 + sector bonus: ' + s.score);
    expect(await page.locator('#ups .up').count() === 3, 'three upgrade buttons');
    const pick = s.choices[0], score1 = s.score; await page.locator('#ups .up').first().tap(); await wait(120); s = await st();
    expect(s.mode === 'play' && s.wave === 2 && s.quota === 38 && s.ups[pick] === 1 && s.waveBank === 0 && s.score === score1 && s.card === null, 'sector 2 starts with ' + pick);
    expect(s.rivals.length === 4 && s.rivals.some(r => r.temper === 'pirate'), 'sector 2 brings a pirate');

    // 7. idle through sector 2 → the contract ends
    for (let i = 0; i < 100 && (await st()).mode !== 'over'; i++) { await adv(1); if ((await st()).mode === 'wreck') { await page.evaluate(() => window.__gdl.advance(2)); } }
    await wait(200); s = await st();
    expect(s.mode === 'over' && s.card === 'ovEnd' && (s.result.kind === 'quota' || s.result.kind === 'wreck'), 'contract over: ' + (s.result && s.result.kind));
    expect((await page.locator('#eTitle').textContent()) === (s.result.kind === 'quota' ? 'CONTRACT VOID' : 'SKIFF WRECKED') && (await page.locator('#eScore').textContent()) === String(s.score), 'end card');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/neon-galaxy')));
    expect(stored === s.score && s.best === stored && stored >= score1, 'best stored (' + stored + ')');

    // 8. clean restart
    await page.locator('#bAgain').tap(); await wait(150); s = await st();
    expect(s.mode === 'play' && s.wave === 1 && s.score === 0 && s.ore === 0 && s.waveBank === 0 && Object.keys(s.ups).length === 0 && s.you.hull === 100 && s.you.tow === 0 && s.you.cap === 12 && s.card === null && s.result === null, 'NEW CONTRACT resets the run');
  },
};
