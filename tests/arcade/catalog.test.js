// Arcade home: the library renders every catalogued game exactly once, with the right link, and all counts are computed.
module.exports = {
  game: 'index.html', query: '', mobile: false, viewport: { width: 1440, height: 900 },
  async run({ page, expect }) {
    const cat = await page.evaluate(() => window.GDL_CATALOG);
    expect(cat && cat.games.length > 0, 'catalog loaded');
    const cards = await page.$$eval('#grid .card', ns => ns.map(n => ({
      id: n.dataset.id, hidden: n.hidden, href: n.querySelector('a').getAttribute('href'), title: n.querySelector('h3').textContent,
      img: (i => i ? { lazy: i.loading, w: i.getAttribute('width'), h: i.getAttribute('height'), alt: i.alt } : null)(n.querySelector('.thumb img')),
      ph: !!n.querySelector('.thumb .ph'), fav: !!n.querySelector('button.fav[aria-pressed]'), ctl: n.querySelectorAll('.ct svg').length,
    })));
    expect(cards.length === cat.games.length, `one card per game (${cards.length} vs ${cat.games.length})`);
    expect(new Set(cards.map(c => c.id)).size === cards.length, 'no game appears twice in the library');
    const byId = Object.fromEntries(cards.map(c => [c.id, c]));
    for (const g of cat.games) {
      const c = byId[g.id];
      expect(c, 'card exists for ' + g.id);
      expect(!c.hidden, g.id + ' visible by default');
      expect(c.title === g.title, 'title rendered as text for ' + g.id);
      if (g.collection === 'arcade') expect(c.href === 'play.html?g=' + g.id, 'standalone game launches through play.html: ' + c.href);
      else expect(c.href === g.path, 'phone game opens directly at its path: ' + c.href);
      if (g.thumb) expect(c.img && c.img.lazy === 'lazy' && +c.img.w > 0 && +c.img.h > 0 && c.img.alt.length > 0, 'lazy thumbnail with intrinsic size + alt for ' + g.id);
      else expect(c.ph, 'procedural placeholder for ' + g.id);
      expect(c.fav, 'favorite toggle for ' + g.id);
      expect(c.ctl === g.controls.length, 'one control icon per control for ' + g.id);
    }
    // computed counts
    const count = await page.textContent('#count b');
    expect(parseInt(count.replace(/\D/g, ''), 10) === cat.games.length, 'result count is computed: ' + count);
    const seg = await page.$$eval('#colls button', bs => bs.map(b => [b.dataset.c, parseInt(b.querySelector('small').textContent, 10)]));
    for (const [c, n] of seg) expect(n === cat.games.filter(g => !c || g.collection === c).length, 'collection count for ' + (c || 'all'));
    expect(seg.length === new Set(cat.games.map(g => g.collection)).size + 1, 'one switch entry per collection + All');
    // featured area is curated from review scores when there are any
    const scored = cat.games.filter(g => g.score).sort((a, b) => b.score - a.score);
    const hero = await page.textContent('#featured h2');
    if (scored.length) expect(scored.filter(g => g.score === scored[0].score).some(g => g.title === hero), 'hero features a top-scored game: ' + hero);
    else expect(hero.length > 0, 'hero shows a pick');
    // empty personal sections are not shown
    expect(await page.$eval('#recent', n => n.hidden) && await page.$eval('#favorites', n => n.hidden), 'Continue playing / Favorites hidden for a new player');
    // no horizontal overflow, semantic landmarks present
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
    expect(await page.evaluate(() => !!document.querySelector('header') && !!document.querySelector('main') && !!document.querySelector('footer') && document.querySelectorAll('h1').length === 1), 'landmarks + single h1');
  },
};
