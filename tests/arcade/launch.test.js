// Launching: a standalone card goes through play.html, the game loads in the iframe, gets keyboard focus, and the play is recorded.
// The game document itself is replaced by a tiny stub so this test is about the launcher, not about any one game.
const STUB = `<!doctype html><meta charset="utf-8"><title>stub game</title><body style="margin:0;background:#123"><canvas id="c"></canvas><script>
  window.keys = []; addEventListener('keydown', e => { keys.push(e.key); });
  localStorage.setItem('stub:storage', 'ok'); sessionStorage.setItem('stub:loads', String(+(sessionStorage.getItem('stub:loads') || 0) + 1));
  window.loads = +sessionStorage.getItem('stub:loads'); window.q = location.search;
</script>`;
module.exports = {
  game: 'index.html', query: '', mobile: false, viewport: { width: 1280, height: 800 },
  async run({ page, expect, wait, url }) {
    await page.route(/\/games\/[^/]+\.html(\?.*)?$/, r => r.fulfill({ contentType: 'text/html; charset=utf-8', body: STUB }));
    const games = await page.evaluate(() => window.GDL_CATALOG.games);
    const g = games.find(x => x.collection === 'arcade'), phone = games.find(x => x.collection !== 'arcade');
    expect(g, 'catalog has a standalone game');

    // filter first so we can check that "back" returns to the same view
    await page.click('#colls button[data-c="arcade"]'); await wait(60);
    const backTo = await page.evaluate(() => location.hash);
    await page.click(`#grid .card[data-id="${g.id}"] a`);
    await page.waitForURL(u => u.pathname.endsWith('/play.html'));
    expect(new URL(page.url()).searchParams.get('g') === g.id, 'play.html?g=<id>: ' + page.url());
    await page.waitForFunction(() => document.documentElement.dataset.state === 'ready');
    const frame = await page.$eval('#game', f => ({ src: f.getAttribute('src'), allow: f.getAttribute('allow'), sandbox: f.hasAttribute('sandbox'), title: f.title, doc: f.contentDocument.title, store: f.contentWindow.localStorage.getItem('stub:storage') }));
    expect(frame.src === g.path, 'iframe hosts the catalogued path: ' + frame.src);
    expect(/fullscreen/.test(frame.allow) && /autoplay/.test(frame.allow) && /gamepad/.test(frame.allow) && !frame.sandbox, 'iframe permissions, no sandbox');
    expect(frame.doc === 'stub game' && frame.store === 'ok', 'game document loaded with working same-origin storage');
    expect(frame.title === g.title && (await page.title()).startsWith(g.title), 'titles set from the catalog');
    const rec = await page.evaluate(() => ({ recent: JSON.parse(localStorage.getItem('gdl:recent')), plays: JSON.parse(localStorage.getItem('gdl:plays')) }));
    expect(rec.recent[0] === g.id && rec.plays[g.id] === 1, 'gdl:recent + gdl:plays recorded: ' + JSON.stringify(rec));

    // keyboard goes straight to the game; Esc is not intercepted by the shell
    expect(await page.evaluate(() => document.activeElement && document.activeElement.id === 'game'), 'iframe focused on load');
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Space'); await page.keyboard.press('Escape'); await wait(80);
    const keys = await page.$eval('#game', f => f.contentWindow.keys);
    expect(keys.join() === ['ArrowLeft', ' ', 'Escape'].join(), 'keys reach the game: ' + keys.join());
    expect(page.url().includes('play.html') && await page.evaluate(() => document.documentElement.dataset.state === 'ready'), 'Esc did nothing in the shell');
    await wait(400);
    expect(await page.$eval('#loader', n => n.hidden), 'loading state is gone after load');

    // back to the arcade → same filtered view, and the game is now under "Continue playing"
    await page.evaluate(() => document.getElementById('dock').classList.add('show'));
    await page.click('#back');
    await page.waitForURL(u => /\/(index\.html)?$/.test(u.pathname));
    await wait(300);
    expect(await page.evaluate(() => location.hash) === backTo, 'back returns to the view the player left: ' + page.url());
    await page.click('#colls button[data-c=""]'); await wait(80);
    expect(await page.$eval('#recent .card', n => n.dataset.id) === g.id, 'launched game leads Continue playing');

    // second launch bumps the play count and keeps recents unique; extra query parameters are forwarded to the game
    await page.goto(url + '/play.html?g=' + g.id + '&seed=7', { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.dataset.state === 'ready');
    const again = await page.evaluate(() => ({ recent: JSON.parse(localStorage.getItem('gdl:recent')), plays: JSON.parse(localStorage.getItem('gdl:plays')), q: document.getElementById('game').contentWindow.q }));
    expect(again.plays[g.id] === 2 && again.recent.filter(x => x === g.id).length === 1 && again.recent[0] === g.id, 'second play counted once in recents');
    expect(again.q === '?seed=7', 'extra parameters forwarded: ' + again.q);

    // phone games are linked directly (their engine provides the shell) — never through play.html
    if (phone) {
      await page.goto(url + '/index.html', { waitUntil: 'load' }); await wait(200);
      const href = await page.$eval(`#grid .card[data-id="${phone.id}"] a`, a => a.href);
      expect(href === url + '/' + phone.path, 'phone game link is its own path: ' + href);
    }
  },
};
