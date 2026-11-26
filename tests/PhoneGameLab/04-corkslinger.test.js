// Corkslinger: firing before the bell is a foul (cork lost, no points); out-drawing a rival after the real signal
// topples them, scores and brings on the next one; feints do not start the draw; a slow hand gets out-drawn; the cheat
// may be shot the moment he reaches; two-cork rivals need two wins; three lost corks end the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/04-corkslinger/index.html',
  async run({ page, expect, wait, state, game }) {
    const st = () => game(g => g.state);
    const until = async (s, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 7000)) { if ((await st()) === s) return true; await wait(15); } return false; };
    const tap = () => page.touchscreen.tap(195, 600);
    const toDraw = async () => { expect(await until('steady'), 'round starts'); await wait(480); await game(g => g.skipWait()); expect(await until('draw', 1500), 'signal given'); };
    expect((await state()).running, 'game running after autostart');
    expect(await st() === 'intro' && (await game(g => g.opp)).i === 0, 'first rival walks on');
    await tap(); await wait(50); expect(await game(g => g.hearts) === 3, 'tap during the intro is ignored');
    // foul: fire before the bell
    expect(await until('steady'), 'steady'); await wait(600); await tap(); await wait(60);
    expect(await game(g => g.hearts) === 2 && await game(g => g.outcome) === 'foul' && await game(g => g.score) === 0, 'firing before the bell costs a cork and scores nothing');
    // natural bell: the flag goes up on its own, then a real tap out-draws Dozy Dot
    expect(await until('steady'), 'same rival again'); expect(await game(g => g.flag) === 0, 'no flag while waiting');
    expect(await until('draw', 6000), 'the bell rings on its own'); expect(await game(g => g.flag) > 0, 'DRAW flag is up');
    await wait(150); await tap(); await wait(250);
    expect(await game(g => g.outcome) === 'win', 'out-drew the rival'); const ms = await game(g => g.lastMs);
    expect(ms >= 120 && ms < 600, 'reaction measured (' + ms + ' ms)');
    const s1 = await game(g => g.score); expect(s1 >= 250 && (await state()).score === s1 && await game(g => g.beaten) === 1, 'toppling pays the draw bonus + bounty (' + s1 + ')');
    expect(await until('intro') && (await game(g => g.opp)).i === 1, 'next rival comes on');
    // feints never start the draw
    expect(await until('steady'), 'steady'); await wait(450); await game(g => { g.feint('twitch'); g.feint('cuckoo'); g.feint('ghost'); g.feint('tumble'); }); await wait(120);
    expect(await st() === 'steady' && await game(g => g.flag) === 0, 'feints leave the flag down');
    // keyboard fire wins round vs rival 2
    await game(g => g.skipWait()); expect(await until('draw', 1500), 'signal'); await wait(140); await page.keyboard.press('Space'); await wait(250);
    expect(await game(g => g.outcome) === 'win' && await game(g => g.beaten) === 2 && await game(g => g.score) > s1, 'Space fires too');
    // too slow: the rival fires first
    expect(await until('intro') && (await game(g => g.opp)).i === 2, 'rival 3'); await toDraw(); const sc = await game(g => g.score); await wait(900);
    expect(await game(g => g.outcome) === 'lose' && await game(g => g.hearts) === 1 && await game(g => g.score) === sc, 'a slow hand is out-drawn and loses a cork');
    expect(await until('steady') && (await game(g => g.opp)).i === 2, 'same rival stays until beaten');
    // the cheat: when he reaches (no flag), firing is legal
    await game(g => { g.jump(4); g.cheatNext(true); }); await toDraw();
    expect(await game(g => g.cheating) && await game(g => g.flag) === 0, 'Sneaky Pete reaches before any bell'); await wait(200); await tap(); await wait(250);
    expect(await game(g => g.outcome) === 'win' && await game(g => g.hearts) === 1, 'catching the cheat wins the duel');
    // two-cork rival needs two wins
    expect(await until('intro') && (await game(g => g.opp)).i === 5 && (await game(g => g.opp)).hp === 2, 'Double Daisy has two corks');
    await toDraw(); await wait(120); await tap(); await wait(250);
    expect(await game(g => g.outcome) === 'win' && (await game(g => g.opp)).hp === 1 && (await game(g => g.opp)).i === 5, 'first hit only wobbles her');
    const b = await game(g => g.beaten); await toDraw(); await wait(120); await tap(); await wait(250);
    expect(await game(g => g.beaten) === b + 1, 'second hit topples her');
    // last cork lost → game over
    expect(await until('intro') && (await game(g => g.opp)).i === 6, 'rival 7'); expect(await until('steady'), 'steady'); await wait(600); await tap();
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const s = await state(); expect(s.over, 'losing the last cork ends the run'); expect(s.best >= s.score && s.best > 0, 'best score recorded');
    await wait(1300); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.hearts) === 3 && (await game(g => g.opp)).i === 0 && await game(g => g.beaten) === 0 && await game(g => g.lap) === 0 && await st() === 'intro', 'state fully reset');
  },
};
