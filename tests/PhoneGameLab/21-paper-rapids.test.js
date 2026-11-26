// Paper Rapids: lane hops by key / swipe / tap, rows score through real dodging, a late dodge pays a close shave and
// raises the Nerve multiplier, two crashes capsize the boat, restart is clean, best persists.
module.exports = {
  game: 'PhoneGameLab/games/21-paper-rapids/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect(await game(g => g.lane) === 1 && await game(g => g.hull) === 2, 'starts mid-channel with a dry hull');
    // --- real input: keyboard, swipe (mouse drag) and side tap all hop lanes
    await page.keyboard.press('ArrowLeft'); await wait(60);
    expect(await game(g => g.lane) === 0, 'ArrowLeft hops to the left channel');
    await page.keyboard.press('ArrowLeft'); await wait(60);
    expect(await game(g => g.lane) === 0, 'bank stops the boat at the edge');
    await page.mouse.move(120, 600); await page.mouse.down(); await page.mouse.move(150, 602, { steps: 2 }); await page.mouse.move(165, 603, { steps: 2 }); await wait(40);
    expect(await game(g => g.lane) === 1, 'early swipe hops before the finger lifts');
    await page.mouse.move(240, 604, { steps: 4 }); await wait(40);
    expect(await game(g => g.lane) === 2, 'dragging on hops a second channel in one gesture');
    await page.mouse.up(); await wait(40);
    await page.touchscreen.tap(60, 500); await wait(80);
    expect(await game(g => g.lane) === 1, 'tapping the left side hops left');
    // --- autopilot through real rows: dodge early, score must come from rows passed
    const pilot = (ms, mode) => page.evaluate(([ms, mode]) => new Promise(res => {
      const g = window.__lab.game, t0 = performance.now(); let shaveLane = -1;
      (function tick() {
        if (performance.now() - t0 > ms || !g.alive) return res();
        const a = g.ahead(); // includes rocks still alongside the stern
        const blockedIn = s => { const b = new Set(); a.filter(o => o.secs < s).forEach(o => o.lanes.forEach(l => b.add(l))); return b; };
        const go = to => { const d = Math.sign(to - g.lane); for (let i = Math.abs(to - g.lane); i > 0; i--) g.move(d); };
        if (mode === 'safe') { const b = blockedIn(0.6); if (b.has(g.lane)) { const o = [1, 0, 2].filter(l => !b.has(l)); if (o.length) go(o.sort((x, y) => Math.abs(x - g.lane) - Math.abs(y - g.lane))[0]); } }
        else if (mode === 'shave') { // sit in front of the next rock until the last moment, then slip away
          const n = a.find(o => o.k !== 'duck' && o.secs > 0.3);
          if (n && n.secs > 0.7 && !n.lanes.includes(g.lane)) { const b = blockedIn(n.secs - 0.05); if (!b.has(n.lanes[0])) go(n.lanes[0]); }
          const b = blockedIn(0.27); if (b.has(g.lane)) { const far = blockedIn(0.6), o = [0, 1, 2].filter(l => !far.has(l)).sort((x, y) => Math.abs(x - g.lane) - Math.abs(y - g.lane)); if (o.length) go(o[0]); }
        } else { const n = a.find(o => o.ahead > 0); if (n && !n.lanes.includes(g.lane)) go(n.lanes[0]); } // 'crash': steer into trouble
        requestAnimationFrame(tick);
      })();
    }), [ms, mode]);
    await pilot(7000, 'safe');
    const s1 = await game(g => ({ score: g.score, rows: g.rowsPassed, hull: g.hull, shaves: g.shaves }));
    expect(s1.rows >= 3 && s1.score >= s1.rows * 10, 'passing rows scores (' + JSON.stringify(s1) + ')');
    expect(s1.hull === 2, 'safe dodging keeps the hull dry');
    expect((await state()).score === s1.score, 'HUD shows the score');
    // --- close shave: leave the channel late → bonus + multiplier
    await pilot(9000, 'shave');
    const s2 = await game(g => ({ score: g.score, shaves: g.shaves, mult: g.mult, alive: g.alive }));
    expect(s2.shaves > s1.shaves, 'a last-moment dodge counts as a close shave (' + JSON.stringify(s2) + ')');
    expect(s2.alive, 'still afloat after shaving');
    // --- crash twice → capsized
    await pilot(2500, 'crash');
    let hullSeen = await game(g => g.hull);
    for (let i = 0; i < 40 && !(await state()).over; i++) { await pilot(500, 'crash'); hullSeen = Math.min(hullSeen, await game(g => g.hull)); }
    const s = await state(); expect(s.over, 'two crashes end the run'); expect(hullSeen <= 1, 'hull dropped before sinking');
    expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    const g0 = await game(g => ({ hull: g.hull, lane: g.lane, mult: g.mult, rows: g.rowsPassed, shaves: g.shaves, n: g.ahead().length }));
    expect(g0.hull === 2 && g0.lane === 1 && g0.mult === 1 && g0.rows === 0 && g0.shaves === 0, 'state fully reset (' + JSON.stringify(g0) + ')');
  },
};
