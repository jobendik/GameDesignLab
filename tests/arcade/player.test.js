// play.html shell: loading state, intro hints, idle-fading controls, favorite, restart, unknown ids, and no reliance on localStorage.
const STUB = `<!doctype html><meta charset="utf-8"><title>stub game</title><body style="margin:0;background:#123"><script>
  sessionStorage.setItem('stub:loads', String(+(sessionStorage.getItem('stub:loads') || 0) + 1)); window.loads = +sessionStorage.getItem('stub:loads');
</script>`;
module.exports = {
  game: 'index.html', query: '', mobile: true, viewport: { width: 390, height: 844 }, timeout: 120000,
  async run({ page, expect, wait, url }) {
    const games = await page.evaluate(() => window.GDL_CATALOG.games);
    const g = games.find(x => x.collection === 'arcade' && x.desc && x.controls.length), phone = games.find(x => x.collection !== 'arcade');
    let hold = true;
    await page.route(/\/games\/[^/]+\.html(\?.*)?$/, async r => { if (hold) await new Promise(res => setTimeout(res, 900)); r.fulfill({ contentType: 'text/html; charset=utf-8', body: STUB }).catch(() => { }); });

    // loading state while the game document is on its way
    await page.goto(url + '/play.html?g=' + g.id, { waitUntil: 'commit' });
    await page.waitForFunction(() => document.documentElement.dataset.state === 'loading');
    const loading = await page.evaluate(() => ({ visible: !document.getElementById('loader').hidden, text: document.getElementById('loader').textContent, spin: !!document.querySelector('#loader .spin'), thumb: !!document.querySelector('#loader .lt') }));
    expect(loading.visible && loading.spin && loading.thumb && loading.text.includes(g.title), 'loading card with title + spinner');
    await page.waitForFunction(() => document.documentElement.dataset.state === 'ready');
    hold = false;
    // description + control hints shown briefly, never intercepting input
    const intro = await page.evaluate(() => { const n = document.getElementById('intro'); return { shown: !n.hidden, text: n.textContent, pe: getComputedStyle(n).pointerEvents, hints: n.querySelectorAll('.hints li').length }; });
    expect(intro.shown && intro.text.includes(g.desc) && intro.pe === 'none' && intro.hints >= g.controls.length, 'intro shows description + control hints without blocking input');
    // controls: visible at first, with real links/buttons and names
    const dock = () => page.evaluate(() => { const d = document.getElementById('dock'), cs = getComputedStyle(d); return { show: d.classList.contains('show'), pe: cs.pointerEvents }; });
    expect((await dock()).show, 'controls visible on load');
    expect(await page.$$eval('#dock a, #dock button', ns => ns.filter(n => !n.hidden).every(n => (n.getAttribute('aria-label') || '').length > 3)), 'controls are labelled');
    expect(await page.$eval('#back', a => a.getAttribute('href').includes('index.html') || a.href.endsWith('/')), 'back is a real link to the arcade');
    // favorite toggles and persists
    await page.tap('#fav'); await wait(60);
    expect(await page.evaluate(id => JSON.parse(localStorage.getItem('gdl:favs')).includes(id), g.id) && await page.$eval('#fav', b => b.getAttribute('aria-pressed')) === 'true', 'favorite from the player persists');
    expect(await page.evaluate(() => document.activeElement.id === 'game'), 'focus returns to the game after using a control');
    // idle → controls fade and stop taking input; the grip brings them back
    await page.waitForFunction(() => !document.getElementById('dock').classList.contains('show'), null, { timeout: 9000 });
    await wait(350);
    expect((await dock()).pe === 'none', 'hidden controls do not intercept input');
    await page.waitForFunction(() => document.getElementById('intro').hidden, null, { timeout: 8000 });      // the intro toast leaves on its own
    const grip = await page.$eval('#grip', n => { const r = n.getBoundingClientRect(); return { h: r.height, top: r.top, vis: getComputedStyle(n).visibility }; });
    expect(grip.vis === 'visible' && grip.h <= 24 && grip.top <= 2, 'only a slim grip remains at the top edge');
    await page.tap('#grip'); await wait(120);
    expect((await dock()).show && (await dock()).pe !== 'none', 'grip reveals the controls');
    // restart reloads the game inside the shell
    await page.tap('#reload');
    await page.waitForFunction(() => document.documentElement.dataset.state === 'ready' && document.getElementById('game').contentWindow.loads === 2);
    expect(page.url().includes('play.html?g='), 'restart keeps the shell');
    expect(await page.evaluate(id => JSON.parse(localStorage.getItem('gdl:plays'))[id], g.id) === 1, 'restart is not counted as another launch');

    // unknown id → helpful page with a way home, nothing recorded
    await page.goto(url + '/play.html?g=games/definitely-not-a-game%3Cimg%3E', { waitUntil: 'load' }); await wait(150);
    const miss = await page.evaluate(() => ({ state: document.documentElement.dataset.state, text: document.getElementById('missing').textContent, link: document.querySelector('#missing a.btn').getAttribute('href'), frame: document.getElementById('game').hidden, img: document.querySelectorAll('#missing img').length }));
    expect(miss.state === 'missing' && /isn’t in the arcade/.test(miss.text) && miss.frame && miss.img === 0, 'unknown id handled gracefully (and escaped)');
    expect(/index\.html|\/$/.test(miss.link), 'missing page links back to the arcade');
    expect(await page.evaluate(() => !JSON.parse(localStorage.getItem('gdl:recent') || '[]').some(x => /definitely/.test(x))), 'unknown id is not recorded');
    await page.goto(url + '/play.html', { waitUntil: 'load' }); await wait(100);
    expect(await page.evaluate(() => document.documentElement.dataset.state === 'missing'), 'no id handled');
    // a slug with a near match suggests it
    const word = g.id.split('/')[1].split('-')[0];
    await page.goto(url + '/play.html?g=games/' + word + '-old-name', { waitUntil: 'load' }); await wait(100);
    expect(await page.$$eval('#missing li a', as => as.length > 0 && as.every(a => /play\.html\?g=|index\.html$/.test(a.getAttribute('href')))), 'near matches offered for a renamed slug');
    // a phone game id is forwarded to the game itself (it has its own shell)
    if (phone) {
      await page.route('**/' + phone.path, r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>phone stub</title>' }));
      await page.goto(url + '/play.html?g=' + phone.id, { waitUntil: 'load' });
      await page.waitForURL(u => u.pathname.endsWith(phone.path));
    }

    // storage blocked entirely: the shell and the arcade still work
    await page.addInitScript(() => { const boom = { get() { throw new DOMException('denied', 'SecurityError'); } }; Object.defineProperty(window, 'localStorage', boom); Object.defineProperty(window, 'sessionStorage', boom); });
    await page.route(/\/games\/[^/]+\.html(\?.*)?$/, r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>stub game</title>' }));
    await page.goto(url + '/play.html?g=' + g.id, { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.dataset.state === 'ready');
    await page.tap('#fav'); await wait(60);
    expect(await page.$eval('#fav', b => b.getAttribute('aria-pressed')) === 'true', 'favorite works in memory when storage is blocked');
    await page.goto(url + '/index.html', { waitUntil: 'load' }); await wait(250);
    expect((await page.$$('#grid .card')).length === games.length, 'arcade renders with storage blocked');
    await page.tap(`#grid .card[data-id="${g.id}"] .fav`); await wait(80);
    expect(await page.$eval('#favorites .card', n => n.dataset.id) === g.id, 'favorites work for the session without storage');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow at 390px');
  },
};
