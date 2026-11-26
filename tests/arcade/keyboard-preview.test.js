// Arcade home: keyboard operation ("/", arrows, Enter), animated strip previews, broken thumbnails, missing catalog.
module.exports = {
  game: 'index.html', query: '', mobile: false, viewport: { width: 1280, height: 800 },
  async run({ page, expect, wait, url }) {
    const games = await page.evaluate(() => window.GDL_CATALOG.games);
    const focusId = () => page.evaluate(() => { const c = document.activeElement && document.activeElement.closest('.card'); return c ? c.dataset.id : null; });
    const rect = id => page.$eval(`#grid .card[data-id="${id}"]`, n => { const r = n.getBoundingClientRect(), y = window.scrollY; return { l: r.left, t: r.top + y, r: r.right, b: r.bottom + y }; });   // document coordinates (focus scrolls the page)

    // "/" focuses search from anywhere, typing filters, ArrowDown enters the results
    await page.keyboard.press('/');
    expect(await page.evaluate(() => document.activeElement.id === 'q'), '"/" focuses search');
    expect(await page.inputValue('#q') === '', '"/" is not typed into the box');
    await page.keyboard.press('Escape');
    await page.keyboard.press('/'); await page.keyboard.press('ArrowDown');
    const first = await focusId();
    expect(first === await page.$eval('#grid .card:not([hidden])', n => n.dataset.id), 'ArrowDown from search lands on the first card');
    // arrows move spatially through the mosaic
    await page.keyboard.press('ArrowRight');
    const second = await focusId();
    expect(second && second !== first, 'ArrowRight moves to another card');
    const [r1, r2] = [await rect(first), await rect(second)];
    expect(r2.l >= r1.r - 2 && Math.abs(r2.t - r1.t) < 4, 'ArrowRight goes to the neighbour on the same row');
    await page.keyboard.press('ArrowDown');
    const third = await focusId(), r3 = await rect(third);
    expect(third !== second && r3.t >= r2.b - 2, 'ArrowDown moves to the row below');
    await page.keyboard.press('ArrowUp');
    expect((await rect(await focusId())).t < r3.t, 'ArrowUp moves back up');
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft');
    expect((await rect(await focusId())).l <= r1.l + 2, 'ArrowLeft walks back to the row start');
    // visible focus indicator
    await wait(300);
    const ring = await page.evaluate(() => getComputedStyle(document.activeElement.closest('.card')).boxShadow);
    expect(/2\.5px|3px/.test(ring), 'focused card shows a focus ring: ' + ring);
    // Tab order: hearts are not extra tab stops (f is the shortcut), cards are real links
    expect(await page.$$eval('#grid .card', ns => ns.every(n => n.querySelector('a[href]') && n.querySelector('button.fav').tabIndex === -1)), 'cards are links; hearts stay out of the tab order');
    // Enter plays the focused game
    const id = await focusId(), g = games.find(x => x.id === id);
    await page.route(/\/games\/[^/]+(\/index)?\.html(\?.*)?$/, r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>stub</title>' }));
    await page.keyboard.press('Enter');
    await page.waitForURL(u => u.pathname.endsWith(g.collection === 'arcade' ? '/play.html' : '/' + g.path));

    // strip preview: inject a 4-frame strip for one game and hover / focus it
    const stripId = games.find(x => x.collection === 'arcade').id;
    await page.route('**/catalog.js', async r => {
      const res = await r.fetch(); let body = await res.text();
      body += `\n;(function(){var g=window.GDL_CATALOG.games.filter(function(x){return x.id===${JSON.stringify(stripId)}})[0]; g.strip='thumbs/__test.strip.svg'; var b=window.GDL_CATALOG.games.filter(function(x){return x.id!==g.id&&x.thumb})[0]; if(b) b.thumb='thumbs/__broken.jpg';})();`;
      r.fulfill({ contentType: 'text/javascript', body });
    });
    await page.route('**/thumbs/__test.strip.svg', r => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="225"><rect width="360" height="225" fill="#c33"/><rect x="360" width="360" height="225" fill="#3c3"/><rect x="720" width="360" height="225" fill="#33c"/><rect x="1080" width="360" height="225" fill="#cc3"/></svg>' }));
    await page.goto(url + '/index.html#c=arcade', { waitUntil: 'load' }); await wait(300);
    const card = `#grid .card[data-id="${stripId}"]`;
    expect((await page.$$(card + ' .pv')).length === 0, 'no preview layer until asked');
    await page.hover(card + ' .body');
    await page.waitForSelector(card + ' .pv.on', { timeout: 4000 });
    const pv = await page.$eval(card + ' .pv', n => { const cs = getComputedStyle(n), t = n.parentNode.getBoundingClientRect(), r = n.getBoundingClientRect(); return { anim: cs.animationName, size: cs.backgroundSize, covers: r.width >= t.width - 1 && r.height >= t.height - 1 }; });
    expect(pv.anim === 'pv' && pv.size.startsWith('400%') && pv.covers, 'hover shows the animated 4-frame strip covering the thumbnail');
    await page.mouse.move(2, 2); await wait(150);
    expect((await page.$$(card + ' .pv')).length === 0, 'preview stops when the pointer leaves');
    // a thumbnail that fails to load falls back to the procedural placeholder
    expect(await page.$$eval('#grid .card', ns => ns.filter(n => n.querySelector('.thumb .ph')).length >= 1 && !ns.some(n => (n.querySelector('.thumb img') || {}).src && /__broken/.test(n.querySelector('.thumb img').src) && n.getBoundingClientRect().top < innerHeight)), 'broken thumbnail replaced by a placeholder');
    // reduced motion: no animated preview
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.hover(card + ' .body'); await wait(500);
    expect((await page.$$(card + ' .pv')).length === 0, 'no preview animation under prefers-reduced-motion');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // catalog.js missing → helpful message instead of a broken page
    await page.unroute('**/catalog.js');
    await page.route('**/catalog.js', r => r.abort());
    await page.goto(url + '/index.html', { waitUntil: 'load' }); await wait(150);
    expect(/catalog didn’t load/.test(await page.textContent('#main')) && /build-catalog/.test(await page.textContent('#main')), 'missing catalog explained');
    await page.goto(url + '/play.html?g=' + stripId, { waitUntil: 'load' }); await wait(150);
    expect(/catalog didn’t load/.test(await page.textContent('#missing')), 'player explains a missing catalog too');
  },
};
