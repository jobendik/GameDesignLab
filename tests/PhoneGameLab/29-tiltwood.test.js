// Tiltwood: a real drag tilts the board and rolls the marble, keys tilt too, steering the marble (through the
// physics) collects stars and reaches the cup → score + next level, three falls into a hole end the run, restart is clean.
const PILOT = `(() => {            // in-page steering loop: PD control on the tilt only — the marble still obeys the physics
  window.__pilot = { mode: 'solve' };
  (function tick() {
    requestAnimationFrame(tick);
    const g = window.__lab.game, P = window.__pilot; if (!g || P.mode === 'off') return;
    if (g.mode !== 'play') { g.steer(0, 0); return; }
    const b = g.ball, holes = g.holes; let p;
    if (P.mode === 'sink') {       // aim for the nearest hole
      const h = holes.slice().sort((a, c) => g.route(a.u, a.v).length - g.route(c.u, c.v).length)[0], r = g.route(h.u, h.v);
      p = r.length > 1 ? r[1] : [h.u, h.v];
      if (r.length > 1) { const horiz = r[1][0] !== r[0][0], off = horiz ? Math.abs(b.y - r[0][1]) : Math.abs(b.x - r[0][0]); if (off > .13) p = r[0]; }
    } else {                       // stars first, then the cup; keep to the safe side of any hole on the way
      let tgt = g.goal; const s = g.stars.filter(s => !s.got); if (s.length) { s.sort((a, c) => g.route(a.u, a.v).length - g.route(c.u, c.v).length); tgt = s[0]; }
      const adj = q => { let x = q[0], y = q[1]; for (const h of holes) if (Math.floor(h.u) === Math.floor(x) && Math.floor(h.v) === Math.floor(y)) { x -= (h.u - x) * .7; y -= (h.v - y) * .7; } return [x, y]; };
      const r = g.route(tgt.u, tgt.v); p = adj(r[0]);
      if (r.length > 1) { const q = adj(r[1]), horiz = r[1][0] !== r[0][0], off = horiz ? Math.abs(b.y - q[1]) : Math.abs(b.x - q[0]); p = off < .13 ? q : horiz ? [p[0], q[1]] : [q[0], p[1]]; }
      else p = [tgt.u, tgt.v];
    }
    g.steer(3.2 * (p[0] - b.x) - .8 * b.vx, 3.2 * (p[1] - b.y) - .8 * b.vy);
  })();
})()`;
module.exports = {
  game: 'PhoneGameLab/games/29-tiltwood/index.html', timeout: 120000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    await wait(700);
    expect(await game(g => g.level === 1 && g.marbles === 3 && g.mode === 'play'), 'level 1, three marbles, marble dropped in');
    expect(await game(g => g.holes.length === 0 && g.stars.length === 3), 'level 1 has three stars and no holes');
    // 1) real pointer drag: tilt toward the first step of the route and the marble must roll that way
    const r = await game(g => g.route()), b0 = await game(g => g.ball), dx = Math.sign(r[1][0] - r[0][0]), dy = Math.sign(r[1][1] - r[0][1]);
    await page.mouse.move(195, 620); await page.mouse.down(); await page.mouse.move(195 + dx * 80, 620 + dy * 80, { steps: 4 });
    await wait(450);
    const t1 = await game(g => g.tilt), b1 = await game(g => g.ball);
    expect((dx ? t1.u * dx : t1.v * dy) > .6, 'dragging tilts the board in the drag direction');
    expect((dx ? (b1.x - b0.x) * dx : (b1.y - b0.y) * dy) > .25, 'the marble rolls downhill');
    await page.mouse.up(); await wait(300);
    expect(await game(g => Math.hypot(g.tilt.u, g.tilt.v) < .1), 'releasing levels the board');
    // 2) keyboard tilt
    await page.keyboard.down('ArrowDown'); await wait(250);
    expect(await game(g => g.tilt.v > .5), 'arrow keys tilt the board'); await page.keyboard.up('ArrowDown');
    // 3) steer through the maze: stars score, the cup clears the level
    await page.evaluate(PILOT);
    for (let i = 0; i < 160 && (await game(g => g.level)) < 2; i++) await wait(250);
    expect(await game(g => g.level) === 2, 'reaching the cup advances to level 2');
    const s2 = await game(g => g.score); expect(s2 >= 150 + 120, 'stars and the clear bonus scored (' + s2 + ')');
    expect((await state()).score === s2, 'HUD score matches');
    // 4) holes: play on until a board has one (level 2 normally), then roll into it three times
    for (let i = 0; i < 240 && !(await game(g => g.holes.length > 0 && g.mode === 'play')); i++) await wait(250);
    expect(await game(g => g.holes.length > 0), 'later boards have holes');
    const m0 = await game(g => g.marbles);
    await page.evaluate(() => { window.__pilot.mode = 'sink'; });
    for (let i = 0; i < 120 && (await game(g => g.marbles)) === m0 && !(await state()).over; i++) await wait(150);
    expect(await game(g => g.marbles) === m0 - 1, 'falling in a hole costs a marble');
    for (let i = 0; i < 20 && (await game(g => g.mode)) !== 'play'; i++) await wait(100);
    expect(await game(g => Math.hypot(g.ball.x - g.checkpoint.u, g.ball.y - g.checkpoint.v) < 1.2), 'marble returns at the checkpoint');
    for (let i = 0; i < 400 && !(await state()).over; i++) await wait(150);
    const s = await state(); expect(s.over, 'losing every marble ends the run'); expect(s.best >= s2 && s.best === s.score, 'best score recorded');
    await page.evaluate(() => { window.__pilot.mode = 'off'; window.__lab.game.steer(null); });
    await wait(1300); await page.keyboard.press('Enter'); await wait(900);
    const q = await state(); expect(q.running && !q.over && q.score === 0, 'restart gives a clean run');
    expect(await game(g => g.level === 1 && g.marbles === 3 && g.stars.every(s => !s.got) && g.time === 0), 'level, marbles, stars and timer reset');
  },
};
