// Arcade home: filter/search/sort state lives in the URL hash — deep links apply, changes are written, back/forward and reload round-trip.
module.exports = {
  game: 'index.html', query: '', mobile: false, viewport: { width: 1280, height: 800 },
  async run({ page, expect, wait, url }) {
    const games = await page.evaluate(() => window.GDL_CATALOG.games);
    const visible = () => page.$$eval('#grid .card:not([hidden])', ns => ns.map(n => n.dataset.id));
    const hash = () => page.evaluate(() => Object.fromEntries(new URLSearchParams(location.hash.slice(1))));
    const ui = () => page.evaluate(() => ({
      q: document.getElementById('q').value, s: document.getElementById('sort').value,
      c: (document.querySelector('#colls button[aria-pressed="true"]') || {}).dataset.c,
      ctl: (document.querySelector('#ctls button[aria-pressed="true"]') || { dataset: {} }).dataset.ctl || '',
      g: (document.querySelector('#genres button[aria-pressed="true"]') || { dataset: {} }).dataset.g || '',
    }));
    expect(await page.evaluate(() => location.hash) === '', 'clean URL by default');

    // changes are written to the hash
    // use the collection with the most genres so the genre chips have something to offer
    const nGenres = c => new Set(games.filter(g => g.collection === c).flatMap(g => g.genre)).size;
    const coll = [...new Set(games.map(g => g.collection))].sort((a, b) => nGenres(b) - nGenres(a))[0];
    await page.click(`#colls button[data-c="${coll}"]`); await wait(40);
    expect((await hash()).c === coll, 'collection in hash');
    const chip = await page.$eval('#genres button[data-g]:not([hidden])', b => b.dataset.g);
    await page.click(`#genres button[data-g="${chip}"]`); await wait(40);
    await page.selectOption('#sort', 'az'); await wait(40);
    let h = await hash();
    expect(h.c === coll && h.g === chip && h.s === 'az', 'collection + genre + sort in hash: ' + JSON.stringify(h));
    const filtered = await visible();
    expect(filtered.length > 0 && filtered.length < games.length, 'state narrows the grid');

    // back / forward walk the history of filter changes
    await page.goBack(); await wait(80);
    expect((await ui()).s === '' && (await ui()).g === chip, 'back undoes the sort');
    await page.goBack(); await wait(80);
    let u = await ui();
    expect(u.g === '' && u.c === coll, 'back undoes the genre');
    expect((await visible()).length === games.filter(g => g.collection === coll).length, 'grid follows history');
    await page.goForward(); await page.goForward(); await wait(80);
    u = await ui();
    expect(u.c === coll && u.g === chip && u.s === 'az', 'forward restores');
    expect((await visible()).join('|') === filtered.join('|'), 'same games in the same order after back/forward');

    // reload keeps the state (deep link)
    await page.reload(); await wait(200);
    u = await ui();
    expect(u.c === coll && u.g === chip && u.s === 'az', 'reload restores from the hash');
    expect((await visible()).join('|') === filtered.join('|'), 'deep link reproduces the view');

    // a hand-written deep link with a search, incl. encoding
    const word = games[0].title.split(/[^A-Za-z0-9]+/).filter(w => w.length > 3)[0] || games[0].title.slice(0, 4);
    await page.goto(url + '/index.html#q=' + encodeURIComponent(word + ' ') + '&c=' + encodeURIComponent(games[0].collection), { waitUntil: 'load' }); await wait(200);
    u = await ui();
    expect(u.q.trim().toLowerCase() === word.toLowerCase() && u.c === games[0].collection, 'deep link fills the search box and collection: ' + JSON.stringify(u));
    expect((await visible()).includes(games[0].id), 'deep-linked search finds the game');
    // typing rewrites the hash without flooding history; clearing returns to a clean URL
    await page.fill('#q', ''); await wait(60);
    await page.click(`#colls button[data-c=""]`); await wait(60);
    expect(await page.evaluate(() => location.hash) === '', 'default state has no hash');
    const before = await page.evaluate(() => history.length);
    await page.focus('#q'); await page.keyboard.type('abc', { delay: 20 }); await wait(60);
    expect((await hash()).q === 'abc', 'typed query in hash');
    expect(await page.evaluate(() => history.length) - before <= 1, 'typing adds at most one history entry');
    await page.goBack(); await wait(80);
    expect((await ui()).q === '' && (await visible()).length === games.length, 'back leaves the search');
    // garbage in the hash is ignored, never thrown on
    await page.goto(url + '/index.html#c=nope&s=%F0&g=&ctl=<x>&q=', { waitUntil: 'load' }); await wait(150);
    expect((await visible()).length === games.length, 'invalid hash values fall back to defaults');
  },
};
