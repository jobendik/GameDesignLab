// Arcade home: favorites toggle from pointer and keyboard, persist in gdl:favs, and populate the Favorites shelf; bests and recents show up.
module.exports = {
  game: 'index.html', query: '', mobile: false, viewport: { width: 1280, height: 800 },
  async run({ page, expect, wait }) {
    const games = await page.evaluate(() => window.GDL_CATALOG.games);
    const favs = () => page.evaluate(() => JSON.parse(localStorage.getItem('gdl:favs') || '[]'));
    const shelf = id => page.$$eval(`#${id} .card`, ns => ns.map(n => n.dataset.id));
    expect(await page.$eval('#favorites', n => n.hidden), 'no Favorites section before anything is favorited');

    // pointer: heart on a library card
    const a = await page.$eval('#grid .card:nth-child(3)', n => n.dataset.id), b = await page.$eval('#grid .card:nth-child(9)', n => n.dataset.id);
    await page.click(`#grid .card[data-id="${a}"] .fav`); await wait(60);
    expect((await favs()).join() === a, 'gdl:favs written');
    expect(await page.$eval(`#grid .card[data-id="${a}"] .fav`, n => n.getAttribute('aria-pressed')) === 'true', 'heart pressed');
    expect(await page.evaluate(() => location.pathname.endsWith('index.html')), 'toggling a favorite does not launch the game');
    expect((await shelf('favorites')).join() === a && !(await page.$eval('#favorites', n => n.hidden)), 'Favorites section appears with the game');

    // keyboard: "f" on the focused card
    await page.focus(`#grid .card[data-id="${b}"] a`);
    await page.keyboard.press('f'); await wait(60);
    expect((await favs()).join() === [b, a].join(), 'f key favorites the focused game (newest first)');
    expect((await shelf('favorites')).join() === [b, a].join(), 'shelf follows');
    expect(await page.evaluate(id => document.activeElement.closest('.card').dataset.id === id, b), 'focus stays on the card');

    // persists across reload, every copy of the card agrees
    await page.reload(); await wait(250);
    expect((await shelf('favorites')).join() === [b, a].join(), 'favorites persist');
    expect(await page.$$eval(`[data-fav="${a}"]`, ns => ns.length >= 2 && ns.every(n => n.getAttribute('aria-pressed') === 'true')), 'library + shelf hearts in sync');

    // un-favorite from the shelf; the section disappears when empty
    await page.click(`#favorites .card[data-id="${a}"] .fav`); await wait(60);
    expect((await favs()).join() === b, 'removed from gdl:favs');
    expect(await page.$eval(`#grid .card[data-id="${a}"] .fav`, n => n.getAttribute('aria-pressed')) === 'false', 'library heart released');
    await page.focus(`#favorites .card[data-id="${b}"] a`); await page.keyboard.press('f'); await wait(60);
    expect((await favs()).length === 0 && await page.$eval('#favorites', n => n.hidden), 'empty Favorites section is hidden again');
    expect(await page.evaluate(() => !!document.activeElement && document.activeElement !== document.body), 'focus is not dropped when the shelf disappears');

    // personal bests + recents written by games show up (and unknown ids are ignored)
    const g1 = games[2], g2 = games[games.length - 3];
    await page.evaluate(([x, y]) => {
      localStorage.setItem('gdl:best:' + x, '12840'); localStorage.setItem('gdl:best:' + y, '7');
      localStorage.setItem('gdl:recent', JSON.stringify([y, 'games/does-not-exist', x])); localStorage.setItem('gdl:plays', JSON.stringify({ [y]: 3 }));
      localStorage.setItem('gdl:favs', JSON.stringify(['games/retired-slug', x]));
    }, [g1.id, g2.id]);
    await page.reload(); await wait(250);
    expect((await shelf('recent')).join() === [g2.id, g1.id].join(), 'Continue playing lists recents in order, skipping unknown ids');
    expect((await shelf('favorites')).join() === g1.id, 'unknown favorite ids are ignored');
    const pb = await page.$eval(`#grid .card[data-id="${g1.id}"] .pb`, n => ({ hidden: n.hidden, text: n.textContent }));
    expect(!pb.hidden && /12[,.\s]?840/.test(pb.text), 'personal best on the card: ' + pb.text);
    expect(await page.$eval(`#grid .card[data-id="${games[4].id}"] .pb`, n => n.hidden), 'no best badge without a best');
    // corrupt storage values never break the page
    await page.evaluate(() => { localStorage.setItem('gdl:favs', '{oops'); localStorage.setItem('gdl:recent', '"x"'); localStorage.setItem('gdl:plays', '[1]'); });
    await page.reload(); await wait(250);
    expect((await page.$$('#grid .card')).length === games.length, 'corrupt player data is tolerated');
    await page.click(`#grid .card[data-id="${a}"] .fav`); await wait(60);
    expect((await favs()).join() === a, 'favorites recover from corrupt data');
  },
};
