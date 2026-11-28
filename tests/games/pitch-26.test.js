// Floodlight Fives (games/pitch-26.html): menu over an AI-vs-AI exhibition → a real tap picks Kiln Street and starts the cup →
// bracket card → KICK OFF → a mouse-driven stick drag runs the kick-off taker upfield → a real tap on PASS plays a ground pass and
// control follows the receiver → a charged K-shot aimed with the arrow key beats a keeper stranded at the near post → GOAL, points,
// slow-mo replay skipped by a tap → kick-off to the opponents → SHOOT next to their carrier is a tackle that wins the ball → the
// keeper steps across toward the ball side → P pauses/freezes, RESUME → full time with a lead = WIN card → NEXT ROUND (semi-final)
// → a defeat ends the cup: card, stored best → NEW CUP resets → level at full time = GOLDEN GOAL, next goal wins and ends the match.
module.exports = {
  game: 'games/pitch-26.html',
  query: '?seed=7&nopause=1&mute=1',
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const card = async () => (await st()).card;
    const hook = (fn, arg) => page.evaluate(([f, a]) => (new Function('g', 'a', 'return (' + f + ')(g,a)'))(window.__gdl, a), [fn.toString(), arg]);
    const until = async (cond, maxSec, step = 1 / 60) => { for (let i = 0; i < maxSec / step; i++) { const s = await adv(step); if (cond(s)) return s; } return null; };

    // 1. menu over the demo match
    let s = await st();
    expect(s.mode === 'menu' && s.demo && s.card === 'cMenu' && s.match && s.match.state === 'play', 'boots to the menu over an exhibition');
    await page.locator('.tm[data-i="1"]').tap(); await wait(50);
    expect((await page.locator('#tName').textContent()).includes('Kiln Street'), 'picked Kiln Street');
    await page.locator('#bStart').tap(); await wait(50); s = await st();
    expect(s.mode === 'bracket' && s.card === 'cBracket' && s.cup.team === 1 && s.cup.stage === 0 && s.cup.points === 0, 'cup started, bracket shown');
    expect((await page.locator('#bStage').textContent()) === 'QUARTER-FINAL' && (await page.locator('#bTree div.me').count()) === 1, 'bracket marks our team');
    await page.evaluate(() => window.__gdl.manual(true));
    await page.locator('#bKick').tap(); await wait(50);
    s = await st();
    expect(s.mode === 'match' && s.card === null && s.match.state === 'kickoff' && s.match.score.join() === '0,0' && s.match.home === 1 && s.rot, 'quarter-final kicks off (portrait view)');
    s = await until(s => s.match.state === 'play', 2); expect(s && s.ball.owner === s.ctrl && s.players[s.ctrl].team === 0, 'we kick off: the controlled player has the ball');

    // 2. stick: a mouse drag upward on the left half = run toward the opponent goal (world +x in portrait)
    const x0 = s.players[s.ctrl].x;
    await page.mouse.move(90, 640); await page.mouse.down(); await page.mouse.move(90, 600, { steps: 3 }); await page.mouse.move(92, 560, { steps: 3 });
    s = await adv(0.35); await page.mouse.up(); s = await adv(1 / 60);
    expect(s.players[s.ctrl].x > x0 + 30 && s.ball.owner === s.ctrl, 'dragging the stick up runs upfield with the ball (' + x0.toFixed(0) + ' → ' + s.players[s.ctrl].x.toFixed(0) + ')');

    // 3. a real tap on PASS = ground pass; control jumps to the receiver
    const passer = s.ctrl;
    await page.locator('#bPass').tap(); s = await adv(1 / 60);
    expect(s.ball.kind === 'pass' && s.ball.target >= 0 && s.players[s.ball.target].team === 0 && s.ctrl === s.ball.target && s.ctrl !== passer && s.ev.passes >= 1, 'PASS: ball played to team-mate ' + s.ball.target + ', control switched');
    s = await until(s => s.ball.owner >= 0, 3); expect(s, 'the pass was collected by someone');

    // 4. shooting: a charged K-shot aimed across the mouth beats a keeper caught at the near post
    await hook(g => { g.place(4, 760, 296, true); g.place(5, 894, 224, false); g.face(4, 0); for (const i of [6, 7, 8, 9]) g.place(i, 420, 60 + i * 50, false); });
    s = await st(); expect(s.ctrl === 4 && s.ball.owner === 4, 'striker set up in front of goal');
    await page.keyboard.down('KeyK'); s = await adv(0.4);
    expect(s.ball.owner === 4, 'holding K charges, ball kept');
    await page.keyboard.down('ArrowRight'); await page.keyboard.up('KeyK'); await page.keyboard.up('ArrowRight'); s = await st();
    expect(s.ball.kind === 'shot' && s.ball.vx > 600 && s.ball.vy > 0 && s.match.shots[0] === 1, 'shot released toward the far corner (vy ' + s.ball.vy + ')');
    s = await until(s => s.match.state !== 'play', 1.5);
    expect(s && s.match.state === 'goal' && s.match.score[0] === 1 && s.match.pts >= 85 && s.ev.goals === 1, 'GOAL! points ' + (s && s.match.pts));

    // 5. replay after the celebration, skipped by a tap; kick-off to the opponents
    s = await until(s => s.match.state === 'replay', 4); expect(s, 'slow-motion replay plays');
    await adv(0.5); await page.touchscreen.tap(195, 420); s = await adv(1 / 60);
    expect(s.match.state === 'kickoff' && s.ball.owner >= 5, 'tap skips the replay; opponents kick off');

    // 6. SHOOT beside the opposing carrier = tackle that wins the ball
    s = await until(s => s.match.state === 'play' && s.ball.owner >= 5 && s.players[s.ball.owner].role !== 'GK', 4);
    expect(s, 'opponents in possession');
    let won = false;
    for (let k = 0; k < 6 && !won; k++) {
      s = await st(); const o = s.ball.owner;
      if (o < 5 || s.players[o].role === 'GK' || s.match.state !== 'play') { await adv(0.4); continue; }
      const t0 = s.ev.tackles, c = s.players[o], me = s.ctrl;
      await hook((g, a) => { g.place(a.me, a.x, a.y, false); g.face(a.me, Math.PI); }, { me, x: c.x - 4 * Math.sign(c.vx || 1) + (c.vx >= 0 ? 26 : -26), y: c.y });
      await page.keyboard.press('KeyK'); s = await adv(0.25);
      if (s.ev.tackles > t0) won = true; else await adv(0.6);
    }
    expect(won, 'a tackle won the ball (' + s.ev.tackles + ')');

    // 7. keeper positioning: the ball out wide on one side pulls our keeper across toward it
    await hook(g => { g.place(7, 230, 430, true); g.place(0, 10, 280, false); });
    s = await adv(0.6); const k = s.players[0];
    expect(k.y > 285 && k.x > 8 && k.x < 50, 'keeper steps toward the ball side (' + k.x.toFixed(0) + ',' + k.y.toFixed(0) + ')');

    // 8. pause freezes the match; resume
    await page.keyboard.press('KeyP'); s = await st(); expect(s.paused && s.card === 'cPause', 'P pauses');
    const c0 = s.match.clock; s = await adv(0.5); expect(s.match.clock === c0, 'clock frozen while paused');
    await page.locator('#bResume').tap(); s = await adv(0.2); expect(!s.paused && s.card === null && s.match.clock < c0, 'resume continues');
    await page.keyboard.press('KeyM'); expect((await st()).muted === false, 'M toggles sound'); await page.keyboard.press('KeyM');

    // 9. full time while ahead = WIN card, then the semi-final
    await hook(g => { g.setScore(2, 1); g.setClock(0.2); });
    s = await until(s => s.card === 'cFT', 3, 0.1);
    expect(s && s.match.state === 'ft' && (await page.locator('#fRes').textContent()) === 'WIN' && s.cup.points >= 85 + 255, 'WIN card, cup points ' + (s && s.cup.points));
    const pts1 = s.cup.points;
    await page.locator('#bCont').tap(); s = await st();
    expect(s.card === 'cBracket' && s.cup.stage === 1 && (await page.locator('#bStage').textContent()) === 'SEMI-FINAL', 'semi-final next');
    await page.locator('#bKick').tap(); s = await adv(1 / 60);
    expect(s.mode === 'match' && s.match.stage === 1 && s.match.skill[1] > 0.4, 'semi-final against a sharper side');

    // 10. losing the semi ends the cup: card, stored best
    await hook(g => { g.setScore(0, 1); g.setClock(0.2); });
    s = await until(s => s.card === 'cFT', 3, 0.1);
    expect(s && (await page.locator('#fRes').textContent()) === 'KNOCKED OUT' && !s.cup.alive, 'knocked out');
    await page.locator('#bCont').tap(); s = await st();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/pitch-26')));
    expect(s.card === 'cOver' && s.mode === 'over' && s.cup.points === pts1 && stored === pts1 && s.best === pts1 && s.newBest, 'cup over, best ' + stored + ' stored');
    expect((await page.locator('#oRes').textContent()).includes('SEMI-FINAL') && (await page.locator('#oNew').textContent()).includes('NEW BEST'), 'card names the round and the new best');

    // 11. NEW CUP resets everything
    await page.locator('#bAgain').tap(); s = await st();
    expect(s.card === 'cBracket' && s.cup.stage === 0 && s.cup.points === 0 && s.cup.alive, 'fresh cup');
    await page.locator('#bKick').tap(); s = await adv(1 / 60);
    expect(s.match.score.join() === '0,0' && s.match.clock > 119 && s.match.state === 'kickoff' && s.match.pts === 0, 'fresh match');

    // 12. level at full time = GOLDEN GOAL; the next goal wins and ends it
    await adv(1.3); await hook(g => { g.setScore(1, 1); g.setClock(0.1); });
    s = await adv(0.3);
    expect(s.match.ot && s.match.state === 'play' && (await page.locator('#clk').textContent()) === 'OT', 'golden goal period');
    await hook(g => { g.place(3, 790, 300, true); g.place(5, 894, 224, false); g.face(3, 0); for (const i of [6, 7, 8, 9]) g.place(i, 420, 60 + i * 50, false); });
    await page.keyboard.down('KeyK'); await adv(0.3); await page.keyboard.down('ArrowRight'); await page.keyboard.up('KeyK'); await page.keyboard.up('ArrowRight');
    s = await until(s => s.match.state !== 'play', 1.5); expect(s && s.match.score[0] === 2, 'golden goal scored');
    s = await until(s => s.card === 'cFT', 15, 0.1);
    expect(s && (await page.locator('#fRes').textContent()) === 'GOLDEN GOAL WIN' && s.cup.alive, 'golden goal wins the match');
  },
};
