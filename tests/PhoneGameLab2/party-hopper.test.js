// Party Hopper: clothes dragged (mouse) or tapped from the trunk land on Pip's matching slot; tapping a worn piece
// recolours it, dragging it off removes it; the judge rewards on-theme pieces, punishes the opposite theme, needs both
// themes of a double party, the colour rule and the "no hats" rule; GO sends Pip to the party (3 stars, score, photo);
// the eighth party ends the day (neutral "What a day!" card); running out of patience sends Pip as he is and three
// no-star parties end the run early; restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/party-hopper/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    expect((await game(g => g.phase)) === 'dress', 'dressing phase');
    await game(g => g.setInvite({ themes: ['beach'], patience: 90 }));
    const click = async xy => { await page.mouse.click(xy[0], xy[1]); await wait(120); };
    const tabTo = async i => click(await game((g, i) => g.tabRect(i), i));
    const dragTo = async (from, to) => { await page.mouse.move(from[0], from[1]); await page.mouse.down(); await page.mouse.move(to[0], to[1], { steps: 8 }); await page.mouse.up(); await wait(150); };
    // 1. drag a sun hat onto Pip
    await tabTo(0); await dragTo(await game(g => g.tile('beach')), await game(g => g.pipXY));
    let o = await game(g => g.outfit); expect(o.head && o.head[1] === 5, 'dragged sun hat sits on Pip\'s head (' + JSON.stringify(o) + ')');
    // a drag that ends away from Pip does nothing
    const hat = o.head[0]; await dragTo(await game(g => g.tile('snow')), [12, 150]); o = await game(g => g.outfit);
    expect(o.head[0] === hat && Object.keys(o).length === 1, 'drop away from Pip is ignored');
    // 2. tap the worn hat: recolour; drag it off: removed
    const hat0 = o.head; await click(await game(g => g.slot('head')));
    o = await game(g => g.outfit); expect(o.head[0] === hat0[0] && o.head[1] === (hat0[1] + 1) % 6, 'tap on a worn piece recolours it');
    await dragTo(await game(g => g.slot('head')), [30, 820]);
    expect(!(await game(g => g.outfit)).head, 'dragging a worn piece off Pip takes it off');
    // 3. tap to wear: a full beach look
    for (let i = 0; i < 5; i++) { await tabTo(i); await click(await game(g => g.tile('beach'))); }
    o = await game(g => g.outfit); expect(Object.keys(o).length === 5, 'tap wears a piece in each slot');
    // judging rules
    const j = await game(g => ({
      full: g.judge({ head: ['beach'], eyes: ['beach'], neck: ['beach'], body: ['beach'], hand: ['beach'] }, { themes: ['beach'], colour: -1 }).stars,
      opp: g.judge({ head: ['snow'], eyes: ['snow'], neck: ['beach'] }, { themes: ['beach'], colour: -1 }).stars,
      half: g.judge({ head: ['beach'], eyes: ['beach'], neck: ['beach'], body: ['beach'], hand: ['beach'] }, { themes: ['beach', 'space'], colour: -1 }).stars,
      mixed: g.judge({ head: ['beach'], eyes: ['space'], neck: ['beach'], body: ['space'], hand: ['beach'] }, { themes: ['beach', 'space'], colour: -1 }).stars,
      colNo: g.judge({ head: ['fancy', 0], eyes: ['fancy', 0], neck: ['fancy', 0], body: ['fancy', 0], hand: ['fancy', 0] }, { themes: ['fancy'], colour: 1, need: 2 }).r,
      colYes: g.judge({ head: ['fancy', 1], eyes: ['fancy', 1], neck: ['fancy', 0], body: ['fancy', 0], hand: ['fancy', 0] }, { themes: ['fancy'], colour: 1, need: 2 }).r,
      ban: g.judge({ head: ['spooky'], eyes: ['spooky'], neck: ['spooky'], body: ['spooky'], hand: ['spooky'] }, { themes: ['spooky'], colour: -1, ban: 'head' }).stars,
      banOk: g.judge({ eyes: ['spooky'], neck: ['spooky'], body: ['spooky'], hand: ['spooky'] }, { themes: ['spooky'], colour: -1, ban: 'head' }).stars,
    }));
    expect(j.full === 3 && j.opp === 0 && j.half < j.mixed && j.mixed === 3 && j.colYes === 1 && j.colNo < 1 && j.ban < 3 && j.banOk === 3, 'judging rules (' + JSON.stringify(j) + ')');
    // 4. GO: party, three stars, score, photo
    await click(await game(g => g.goXY));
    expect((await game(g => g.phase)) === 'party', 'GO sends Pip to the party');
    for (let i = 0; i < 40 && (await game(g => g.photos)) === 0; i++) await wait(100);
    let s = await game(g => ({ st: g.lastStars, score: g.score, photos: g.photos, streak: g.streak }));
    expect(s.st === 3 && s.score >= 300 && s.photos === 1 && s.streak === 1, 'best-dressed: 3 stars, score and a polaroid (' + JSON.stringify(s) + ')');
    expect((await state()).score === s.score, 'HUD shows the score');
    for (let i = 0; i < 30 && (await game(g => g.phase)) !== 'dress'; i++) await wait(100);
    expect(await game(g => g.party === 1 && g.phase === 'dress' && Object.keys(g.outfit).length === 0), 'next invitation, empty outfit');
    // 5. the eighth party ends the day with the neutral card
    await game(g => { g.setParty(7); g.setInvite({ themes: ['snow'], patience: 90 }); });
    for (let i = 0; i < 3; i++) { await tabTo(i); await click(await game(g => g.tile('snow'))); }
    await click(await game(g => g.goXY));
    for (let i = 0; i < 60 && !(await state()).over; i++) await wait(100);
    expect((await state()).over, 'day over after party 8');
    await wait(800); const title = await page.evaluate(() => { const h = document.querySelector('.lab-overlay h2'); return h && h.textContent; });
    expect(/What a day/.test(title || ''), 'finished-day card (' + title + ')');
    await wait(900); await page.keyboard.press('Enter'); await wait(600);
    let r = await state(); expect(r.running && !r.over && r.score === 0, 'restart after a full day');
    // 6. impatience: Pip leaves as he is; three no-star parties close the day early
    for (let k = 0; k < 3; k++) {
      for (let i = 0; i < 40 && (await game(g => g.phase)) !== 'dress'; i++) await wait(100);
      if ((await state()).over) break;
      await game(g => g.setInvite({ themes: ['space'], patience: 0.6 }));
      for (let i = 0; i < 30 && (await game(g => g.phase)) === 'dress'; i++) await wait(100);
      expect((await game(g => g.phase)) !== 'dress', 'out of patience: Pip goes anyway');
    }
    for (let i = 0; i < 60 && !(await state()).over; i++) await wait(100);
    expect((await state()).over && (await game(g => g.strikes)) === 3, 'three no-star parties end the run');
    await wait(1600); await page.keyboard.press('Enter'); await wait(600);
    r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.party === 0 && g.strikes === 0 && g.photos === 0 && Object.keys(g.outfit).length === 0), 'party count, strikes, photos and outfit reset');
  },
};
