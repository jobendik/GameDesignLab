// Arcade home: search and every filter narrow to exactly the right games, combine, and restore.
module.exports = {
  game: 'index.html', query: '', mobile: false, viewport: { width: 1280, height: 800 },
  async run({ page, expect, wait }) {
    const games = await page.evaluate(() => window.GDL_CATALOG.games);
    const total = games.length;
    const visible = () => page.$$eval('#grid .card:not([hidden])', ns => ns.map(n => n.dataset.id));
    const countText = async () => parseInt((await page.textContent('#count b')).replace(/\D/g, ''), 10);
    const same = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
    expect((await visible()).length === total, 'all games visible initially');

    // --- search: a distinctive title word finds its game and narrows the list
    const target = games.map(g => ({ g, w: g.title.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 6).sort((a, b) => b.length - a.length)[0] })).filter(x => x.w)[7] ||
      games.map(g => ({ g, w: g.title.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 4)[0] })).filter(x => x.w)[0];
    await page.fill('#q', target.w); await wait(60);
    let v = await visible();
    expect(v.includes(target.g.id), `search "${target.w}" finds ${target.g.id}`);
    expect(v.length < total, 'search narrows the library');
    expect(await countText() === v.length, 'count follows the search');
    expect(await page.$eval('#home', n => n.hidden), 'home shelves step aside while searching');
    const hay = g => (g.title + ' ' + g.desc + ' ' + g.genre.join(' ')).toLowerCase();
    expect(games.filter(g => hay(g).includes(target.w)).every(g => v.includes(g.id)), 'every literal title/desc/genre match is listed');
    // forgiving: upper case + a typo still finds it
    const typo = target.w.slice(0, 2) + (target.w[2] === 'x' ? 'z' : 'x') + target.w.slice(3);
    await page.fill('#q', '  ' + typo.toUpperCase()); await wait(60);
    expect((await visible()).includes(target.g.id), `typo "${typo}" still finds ${target.g.id}`);
    // genre words are searchable
    const someGenre = games[0].genre[0];
    await page.fill('#q', someGenre); await wait(60);
    v = await visible();
    expect(games.filter(g => g.genre.includes(someGenre)).every(g => v.includes(g.id)), 'searching a genre lists its games');
    // nonsense → friendly empty state, then restore
    await page.fill('#q', 'zzqxjv kkwq'); await wait(60);
    expect((await visible()).length === 0 && await page.isVisible('#empty'), 'empty state for no matches');
    await page.click('#empty-reset'); await wait(60);
    expect((await visible()).length === total && await page.inputValue('#q') === '', 'reset restores every game');
    expect(!(await page.$eval('#home', n => n.hidden)), 'home shelves return');

    // --- collection switch
    for (const c of [...new Set(games.map(g => g.collection))]) {
      await page.click(`#colls button[data-c="${c}"]`); await wait(40);
      v = await visible();
      expect(same(v, games.filter(g => g.collection === c).map(g => g.id)), 'collection filter exact for ' + c);
      expect(await countText() === v.length, 'count follows the collection');
    }
    await page.click('#colls button[data-c=""]'); await wait(40);
    expect((await visible()).length === total, '"All" restores');

    // --- control filter (only kinds that actually discriminate are offered)
    const ctls = await page.$$eval('#ctls button:not([hidden])', bs => bs.map(b => b.dataset.ctl));
    expect(ctls.length >= 1, 'control filter offered');
    for (const c of ctls) {
      await page.click(`#ctls button[data-ctl="${c}"]`); await wait(40);
      v = await visible();
      expect(same(v, games.filter(g => g.controls.includes(c)).map(g => g.id)), 'control filter exact for ' + c);
      expect(v.length < total, c + ' filter narrows');
      await page.click(`#ctls button[data-ctl="${c}"]`); await wait(40);
      expect((await visible()).length === total, c + ' filter toggles off');
    }

    // --- genre chips come from the data and carry computed counts
    const chips = await page.$$eval('#genres button[data-g]:not([hidden])', bs => bs.map(b => ({ k: b.dataset.g, n: parseInt(b.querySelector('small').textContent, 10), label: b.firstChild.textContent.trim() })));
    expect(chips.length >= 2, 'genre chips derived from data');
    for (const chip of chips.slice(0, 4).concat(chips.slice(-1))) {
      await page.click(`#genres button[data-g="${chip.k}"]`); await wait(40);
      v = await visible();
      expect(v.length === chip.n && v.length > 0, `genre chip "${chip.label}" count ${chip.n} matches ${v.length}`);
      expect(v.every(id => games.find(g => g.id === id).genre.join(' ').toLowerCase().includes(chip.label.toLowerCase())), 'every game under "' + chip.label + '" carries that genre');
      await page.click(`#genres button[data-g="${chip.k}"]`); await wait(40);
    }
    expect((await visible()).length === total, 'genre filter restores');

    // --- filters combine
    const c0 = games[games.length - 1].collection, k0 = ctls[ctls.length - 1];
    await page.click(`#colls button[data-c="${c0}"]`); await page.click(`#ctls button[data-ctl="${k0}"]`); await wait(40);
    expect(same(await visible(), games.filter(g => g.collection === c0 && g.controls.includes(k0)).map(g => g.id)), 'collection + control combine');
    const reset = await page.$('#reset:not([hidden])');
    if (reset) await reset.click(); else await page.click('#empty-reset');
    await wait(40);
    expect((await visible()).length === total, 'clear filters restores');

    // --- sort
    await page.selectOption('#sort', 'az'); await wait(40);
    const titles = await page.$$eval('#grid .card:not([hidden]) h3', ns => ns.map(n => n.textContent));
    expect(titles.length === total, 'sorting keeps every game');
    expect(titles.every((t, i) => !i || titles[i - 1].localeCompare(t, undefined, { sensitivity: 'base', numeric: true }) <= 0), 'A–Z order');
    await page.selectOption('#sort', 'top'); await wait(40);
    const order = await visible(), sc = id => games.find(g => g.id === id).score || 0;
    expect(order.every((id, i) => !i || sc(order[i - 1]) >= sc(id)), 'top rated order follows review scores');
    await page.evaluate(() => localStorage.setItem('gdl:recent', JSON.stringify([window.GDL_CATALOG.games[5].id, window.GDL_CATALOG.games[1].id])));
    await page.reload(); await wait(200);
    await page.selectOption('#sort', 'recent'); await wait(40);
    const rec = await visible();
    expect(rec[0] === games[5].id && rec[1] === games[1].id && rec.length === total, 'recently played first');
    // surprise me offers a real game
    await page.click('#lucky'); await wait(150);
    const pick = await page.$eval('#dlg [data-play]', a => a.getAttribute('href'));
    expect(games.some(g => pick === g.path || pick === 'play.html?g=' + g.id), 'surprise pick links to a catalogued game: ' + pick);
    await page.keyboard.press('Escape'); await wait(60);
    expect(!(await page.$eval('#dlg', d => d.open)), 'Esc closes the surprise dialog');
  },
};
