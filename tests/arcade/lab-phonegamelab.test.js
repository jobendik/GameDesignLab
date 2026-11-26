// Phone Game Lab launcher: lists every LAB_GAMES item exactly once under its category, searches, shows bests, links up to the arcade,
// and keeps working when the folder is hosted without the thumbnails.
const LAB = 'PhoneGameLab';
module.exports = {
  game: LAB + '/index.html', query: '', mobile: true, viewport: { width: 390, height: 844 },
  run: ctx => labTest(ctx, LAB),
};
async function labTest({ page, expect, wait, url }, lab) {
  const cats = await page.evaluate(() => window.LAB_GAMES);
  const items = cats.flatMap(c => c.items.map(i => Object.assign({ cat: c.cat }, i)));
  expect(items.length > 0, 'LAB_GAMES loaded');
  const cards = await page.$$eval('#cats .card', ns => ns.map(n => ({ slug: n.dataset.slug, href: n.getAttribute('href'), t: n.querySelector('h3').textContent, d: n.querySelector('p').textContent, cat: n.closest('section').querySelector('h2').textContent, tag: n.tagName })));
  expect(cards.length === items.length, `one card per item (${cards.length} vs ${items.length})`);
  expect(new Set(cards.map(c => c.slug)).size === cards.length, 'no duplicates');
  for (const it of items) {
    const c = cards.find(x => x.slug === it.slug);
    expect(c && c.tag === 'A' && c.href === 'games/' + it.slug + '/index.html', 'card links to games/<slug>/index.html for ' + it.slug);
    expect(c.t === it.t && c.d === it.d && c.cat === it.cat, 'title, description and category from the data for ' + it.slug);
  }
  const heads = await page.$$eval('#cats section h2', hs => hs.map(h => h.textContent));
  expect(heads.join('|') === [...new Set(cats.map(c => c.cat))].join('|'), 'category sections in catalog order');
  expect((await page.textContent('#status')).includes(String(items.length)), 'computed count shown');
  expect((await page.textContent('#tagline')).includes(String(items.length)), 'tagline count comes from the data');
  expect(await page.$eval('#up', a => !a.hidden && a.getAttribute('href') === '../index.html'), 'link up to the arcade');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow at 390px');
  // thumbnails arrive lazily after a probe when the data has them
  if (items.some(i => i.thumb)) {
    await page.waitForFunction(() => document.querySelectorAll('#cats .card .thumb img').length > 0, null, { timeout: 5000 });
    expect(await page.$$eval('#cats .card .thumb img', (ims, n) => ims.length === n && ims.every(i => i.loading === 'lazy' && i.alt), items.filter(i => i.thumb).length), 'lazy thumbnails with alt text');
  }

  // search narrows and restores; state is linkable
  const it = items[Math.floor(items.length / 2)], word = it.t.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2).sort((a, b) => b.length - a.length)[0] || it.t.toLowerCase();
  await page.fill('#q', word.toUpperCase()); await wait(60);
  let vis = await page.$$eval('#cats .card:not([hidden])', ns => ns.map(n => n.dataset.slug));
  const expected = items.filter(i => (i.t + ' ' + i.d + ' ' + i.cat).toLowerCase().replace(/[^a-z0-9.]+/g, ' ').includes(word)).map(i => i.slug);
  expect(vis.includes(it.slug) && vis.length === expected.length && vis.length < items.length, `search "${word}" → ${vis.length} (expected ${expected.length})`);
  expect(await page.$$eval('#cats section:not([hidden])', ss => ss.every(s => s.querySelector('.card:not([hidden])'))), 'empty categories are hidden while searching');
  expect(decodeURIComponent(await page.evaluate(() => location.hash)).toLowerCase() === '#q=' + word, 'search is in the hash');
  await page.reload(); await wait(250);
  expect((await page.$$('#cats .card:not([hidden])')).length === expected.length, 'search deep link survives reload');
  await page.fill('#q', 'qqzzxxv'); await wait(60);
  expect(await page.isVisible('#empty') && (await page.$$('#cats .card:not([hidden])')).length === 0, 'empty state');
  await page.click('#empty-reset'); await wait(60);
  expect((await page.$$('#cats .card:not([hidden])')).length === items.length && await page.evaluate(() => location.hash === ''), 'reset restores everything');

  // bests + recents written by the engine (ids are "<lab folder>/<slug>")
  const a = items[1], b = items[items.length - 2];
  await page.evaluate(([lab, a, b]) => { localStorage.setItem('gdl:best:' + lab + '/' + a, '4321'); localStorage.setItem('gdl:recent', JSON.stringify([lab + '/' + b, 'games/some-arcade-game', lab + '/gone', lab + '/' + a])); }, [lab, a.slug, b.slug]);
  await page.reload(); await wait(250);
  expect(/4[,.\s]?321/.test(await page.$eval(`#cats .card[data-slug="${a.slug}"] .pb`, n => n.textContent)), 'best score on the card');
  expect((await page.$$('#cats .card .pb')).length === 1, 'only games with a best show one');
  expect((await page.$$eval('#recent [data-slug]', ns => ns.map(n => n.dataset.slug))).join() === [b.slug, a.slug].join(), 'jump back in lists this lab’s recents only');
  // keyboard
  await page.keyboard.press('/');
  expect(await page.evaluate(() => document.activeElement.id === 'q'), '"/" focuses search');
  await page.keyboard.press('ArrowDown');
  expect(await page.evaluate(() => document.activeElement.classList.contains('card')), 'arrow down moves into the cards');

  // hosted on its own: no thumbnails, no parent arcade page → still complete, with at most one probe request
  const here = page.url().split('#')[0];
  await page.goto('about:blank');                       // let lazy images of the previous document settle before counting
  let thumbReqs = 0;
  await page.route(/\/thumbs\//, r => { thumbReqs++; r.abort(); });
  await page.goto(here, { waitUntil: 'load' }); await wait(500);
  expect((await page.$$('#cats .card')).length === items.length, 'renders every game without thumbnails');
  expect((await page.$$('#cats .card .thumb img')).length === 0 && (await page.$$('#cats .card .thumb b')).length === items.length, 'placeholders stand in for missing thumbnails');
  expect(thumbReqs <= 1, 'missing thumbnails are probed once, not requested ' + thumbReqs + ' times');
  // missing catalog → helpful message
  await page.route('**/shared/catalog.js', r => r.abort());
  await page.reload(); await wait(200);
  expect(/didn’t load/.test(await page.textContent('#cats')), 'missing catalog explained');
}
module.exports.labTest = labTest;
