// Puppet Panic: menu → SOLO SHOW → a real mouse drag pulls a string, the string holds on release and a tap drops it → a wrong pose makes
// the simulated audience shout what it actually sees ("Scarecrow?") and scores nothing → the secret word is then acted out for real with
// mouse drags (wave / hands up / jump / nap / applause, whichever the seed deals) → the crowd gets it, score + streak + best move →
// keyboard strings (2 + arrows, X, Space) → P pauses and freezes the clock → ignoring three acts brings tomatoes, three strikes, the
// game-over card and a stored best → ENCORE restarts cleanly → party mode: hand-off card, hidden word, hold-to-peek, GOT IT / SKIP, 60 s turn.
module.exports = {
  game: 'games/puppet-panic.html',
  query: '?seed=7&nopause=1&mute=1',
  mobile: false,
  timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = s => page.evaluate(s => window.__gdl.advance(s), s);
    const manual = on => page.evaluate(on => window.__gdl.manual(on), on);
    const scr = (x, y) => page.evaluate(([x, y]) => window.__gdl.toScreen(x, y), [x, y]);
    const grip = async id => (await st()).grips.find(g => g.id === id);
    const near = (a, b, tol) => Math.abs(a - b) <= tol;
    const down = async id => { const t = await grip(id), p = await scr(t.x, t.y); await page.mouse.move(p.x, p.y); await page.mouse.down(); };
    const to = async (x, y, sec = .12) => { const p = await scr(x, y); await page.mouse.move(p.x, p.y, { steps: 3 }); await adv(sec); };
    const drag = async (id, x, y) => { await down(id); await to(x, y); await to(x, y, .25); await page.mouse.up(); await adv(.15); };
    const tapGrip = async id => { await down(id); await page.mouse.up(); await adv(.1); };
    const done = async id => { const s = await st(); return s.mode !== 'play' || s.word !== id; };
    const hold = async (id, sec) => { for (let i = 0; i < sec * 5 && !(await done(id)); i++) await adv(.2); };
    const ACT = {   // how a player performs each opening-tier word with one mouse
      async wave() { const f = (await st()).feat; await down('handR'); await to(f.chestX + 55, f.chestY - 45, .3); for (let i = 0; i < 24 && !(await done('wave')); i++) await to(f.chestX + (i % 2 ? 22 : 66), f.chestY - 45, .2); await page.mouse.up(); },
      async handsup() { await drag('handL', -20, -236); await drag('handR', 20, -236); await hold('handsup', 4); },
      async jump() { await down('head'); for (let i = 0; i < 12 && !(await done('jump')); i++) { await to(0, -285, .35); await to(0, -178, .5); } await page.mouse.up(); },
      async nap() { await page.click('#bDrop'); await hold('nap', 8); },
      async clap() { const f = (await st()).feat; await drag('handL', -3, f.chestY + 8); await down('handR'); for (let i = 0; i < 12 && !(await done('clap')); i++) { await to(60, f.chestY + 8, .25); await to(4, f.chestY + 8, .25); } await page.mouse.up(); },
      async scare() { await drag('handL', -92, -158); await drag('handR', 92, -158); await hold('scare', 4); },
    };

    // 1. menu → SOLO SHOW
    let s = await st(); expect(s.mode === 'menu' && s.best === 0, 'boots to the menu');
    expect(await page.locator('#ovMenu').isVisible() && !(await page.locator('#card').isVisible()), 'menu card is up, HUD hidden');
    await page.click('#bSolo'); await manual(true); await adv(.5); s = await st();
    expect(s.mode === 'play' && s.act === 1 && s.score === 0 && s.strikes === 0 && near(s.timeLeft, 26.4, .3), 'act 1 starts with a full clock (' + s.timeLeft + ')');
    expect(Object.keys(ACT).includes(s.word), 'act 1 deals an opening-tier word: ' + s.word);
    expect(s.grips[0].active && s.grips.slice(1).every(g => !g.active) && near(s.feat.headY, -186, 3), 'the puppet hangs from its head string only');
    expect(await page.locator('#cWord').innerText() === s.wordName, 'the word card shows ' + s.wordName);
    const word = s.word;

    // 2. strings: drag pulls a hand, release holds it, a tap drops it
    await down('handL'); await to(-70, -120); await to(-70, -120, .3); s = await st();
    expect(s.grips[1].active && near(s.grips[1].x, -70, 10) && near(s.grips[1].y, -120, 10), 'left hand follows the mouse ' + JSON.stringify(s.grips[1]));
    await page.mouse.up(); await adv(.6); s = await st();
    expect(s.grips[1].active && near(s.grips[1].x, -70, 10) && near(s.grips[1].y, -120, 10), 'the string holds after release');
    await tapGrip('handL'); await adv(.8); s = await st();
    expect(!s.grips[1].active && s.grips[1].y > -100, 'a tap drops the string and the arm falls (' + s.grips[1].y.toFixed(0) + ')');

    // 3. the audience guesses what it really sees: a wrong pose gets a wrong guess and no points
    const decoy = word === 'scare' ? 'handsup' : 'scare', decoyGuess = word === 'scare' ? 'Hands up?' : 'Scarecrow?';
    if (decoy === 'scare') { await drag('handL', -92, -158); await drag('handR', 92, -158); } else { await drag('handL', -20, -236); await drag('handR', 20, -236); }
    let heard = false; for (let i = 0; i < 30 && !heard; i++) { await adv(.2); s = await st(); heard = s.lastGuess === decoyGuess; }
    expect(s.evidence[decoy] > .9 && heard, 'holding the wrong pose makes the crowd shout "' + decoyGuess + '" (heard "' + s.lastGuess + '")');
    expect(s.mode === 'play' && s.score === 0 && s.landed === 0, 'a wrong guess scores nothing');

    // 4. Space puts the puppet back on its feet, then the real word is acted out
    await page.keyboard.press('Space'); await adv(1.2); s = await st();
    expect(s.grips[0].active && s.grips.slice(1).every(g => !g.active), 'Space: STAND drops every limb string');
    const tBefore = s.timeLeft; await ACT[word](); s = await st();
    expect(s.mode === 'between' && s.lastCorrect === word && s.landed === 1 && s.streak === 1, 'the crowd gets ' + word + ' (meter ' + s.meter.toFixed(2) + ', last guess "' + s.lastGuess + '")');
    expect(s.score >= 100 + Math.floor(s.timeLeft) * 10 && s.score === s.best && s.timeLeft < tBefore, 'score = tier + time bonus: ' + s.score);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/puppet-panic'))) === s.score, 'best score stored');
    const score1 = s.score;

    // 5. next act: new word, shorter clock
    await adv(1.7); s = await st();
    expect(s.mode === 'play' && s.act === 2 && s.word !== word && s.meter === 0 && s.timeLeft < 26 && s.timeLeft > 24, 'act 2 deals a new word (' + s.word + ') on a shorter clock');

    // 6. keyboard strings + pause (real time)
    await manual(false); await page.keyboard.press('Space'); await wait(250);
    await page.keyboard.press('Digit2'); await page.keyboard.down('ArrowUp'); await wait(450); await page.keyboard.up('ArrowUp'); await wait(200); s = await st();
    expect(s.grips[1].active && s.grips[1].y < -110, 'keys 2 + ArrowUp pull the left hand up (' + s.grips[1].y.toFixed(0) + ')');
    await page.keyboard.press('KeyX'); await wait(80); expect(!(await st()).grips[1].active, 'X drops the selected string');
    await page.keyboard.press('KeyP'); await wait(80); s = await st(); expect(s.paused && await page.locator('#ovPause').isVisible(), 'P pauses');
    await wait(350); expect((await st()).timeLeft === s.timeLeft, 'clock frozen while paused');
    await page.click('#bResume'); await wait(300); expect(!(await st()).paused && (await st()).timeLeft < s.timeLeft, 'resume continues');

    // 7. three flops: tomatoes, strikes, game over
    await manual(true); let sawTom = 0, acts = 0;
    for (let i = 0; i < 400 && (s = await st()).mode !== 'over'; i++) { await adv(.25); sawTom = Math.max(sawTom, s.tomatoes); acts = Math.max(acts, s.act); }
    expect(s.mode === 'over' && s.strikes === 3 && s.streak === 0 && sawTom >= 3, 'three ignored acts → three strikes, tomatoes thrown (' + sawTom + ' in the air)');
    expect(acts >= 4 && s.score >= score1 && s.best === s.score, 'the show ran to act ' + acts + '; best kept (' + s.best + ')');
    expect(await page.locator('#ovOver').isVisible() && (await page.locator('#oScore').innerText()) === String(s.score), 'game-over card shows the score');

    // 8. ENCORE restarts cleanly
    await page.click('#bAgain'); await adv(.6); const r = await st();
    expect(r.mode === 'play' && r.act === 1 && r.score === 0 && r.strikes === 0 && r.landed === 0 && r.best === s.best && r.tomatoes === 0, 'ENCORE: fresh show, best kept');
    expect(near(r.feat.headY, -186, 3) && r.grips.slice(1).every(g => !g.active) && near(r.timeLeft, 26.3, .4), 'puppet and clock reset');
    expect(r.word === word, 'same seed deals the same opening word again');

    // 9. party mode (pass & play)
    await manual(false); await page.keyboard.press('Escape'); await wait(80); await page.click('#bQuit'); await wait(80); expect((await st()).mode === 'menu', 'quit to menu');
    await page.click('#bParty'); await wait(80); s = await st(); expect(s.mode === 'hand' && await page.locator('#ovHand').isVisible() && (await page.locator('#pTitle').innerText()) === 'TEAM ROSE', 'party hand-off card for team rose');
    await page.click('#bTurn'); await wait(120); s = await st();
    expect(s.mode === 'turn' && s.timeLeft > 59 && s.party.word.length > 1 && (await page.locator('#cWord').innerText()) === '? ? ?', 'turn starts with the word hidden');
    const pk = await page.locator('#bPeek').boundingBox(); await page.mouse.move(pk.x + pk.width / 2, pk.y + pk.height / 2); await page.mouse.down(); await wait(80);
    expect((await page.locator('#cWord').innerText()) === s.party.word, 'holding PEEK shows the word'); await page.mouse.up(); await wait(80);
    expect((await page.locator('#cWord').innerText()) === '? ? ?', 'releasing hides it again');
    await page.click('#bGot'); await wait(60); let p = (await st()).party; expect(p.scores[0] === 1 && p.word !== s.party.word, 'GOT IT scores a point and deals a new word');
    await page.click('#bSkip'); await wait(60); expect((await st()).party.skips === 1 && (await st()).party.scores[0] === 1, 'SKIP uses a skip, no point');
    await manual(true); await adv(61); s = await st(); expect(s.mode === 'hand' && s.party.team === 1 && s.party.turn === 1 && s.party.scores[0] === 1, 'after 60 s the other team is up');
    expect((await page.locator('#pTitle').innerText()) === 'TEAM TEAL', 'hand-off card names team teal');
  }
};
