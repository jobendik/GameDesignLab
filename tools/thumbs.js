#!/usr/bin/env node
/* Captures real gameplay thumbnails for the launchers:  thumbs/<collection>--<slug>.jpg
 *   node tools/thumbs.js [filter…] [--jobs=3] [--strips]      (--strips also writes a 4-frame <name>.strip.jpg for hover previews)
 * Standalone games: 1280×800 → 480×300.  Phone games: 390×620 portrait → 300×477.
 * A game can stage its own hero shot: if window.__gdlThumb is a function it is awaited before capture.
 */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { listen, ROOT } = require('./serve');
const { discover } = require('./discover');
const args = process.argv.slice(2), filters = args.filter(a => !a.startsWith('--'));
const JOBS = +(args.find(a => a.startsWith('--jobs=')) || '').split('=')[1] || 3, STRIPS = args.includes('--strips');
(async () => {
  let games = discover().filter(g => g.collection !== 'archive');
  if (filters.length) games = games.filter(g => filters.some(f => g.id.includes(f)));
  fs.mkdirSync(path.join(ROOT, 'thumbs'), { recursive: true });
  const { server, url } = await listen(0);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
  const tool = await (await browser.newContext()).newPage(); // used to downscale/encode
  const encode = (pngs, w, h, q) => tool.evaluate(async ([list, w, h, q]) => {
    const c = document.createElement('canvas'); c.width = w * list.length; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    for (let i = 0; i < list.length; i++) { const im = new Image(); im.src = 'data:image/png;base64,' + list[i]; await im.decode(); x.drawImage(im, i * w, 0, w, h); }
    return c.toDataURL('image/jpeg', q).split(',')[1];
  }, [pngs.map(b => b.toString('base64')), w, h, q]);
  let i = 0, done = 0;
  async function worker() {
    while (i < games.length) {
      const g = games[i++], phone = g.collection !== 'arcade';
      const vp = phone ? { width: 390, height: 620 } : { width: 1280, height: 800 }, ow = phone ? 300 : 480, oh = phone ? 477 : 300;
      const ctx = await browser.newContext({ viewport: vp, hasTouch: phone, isMobile: phone, deviceScaleFactor: 1 }); const page = await ctx.newPage();
      await page.route(u => !u.href.startsWith(url), r => r.abort());
      const own = url + '/' + encodeURI(g.path);
      await page.route(u => u.href.startsWith(url), (r, q) => (q.isNavigationRequest() && q.frame() === page.mainFrame() && !q.url().split('?')[0].startsWith(own)) ? r.abort() : r.continue());
      page.on('dialog', d => d.dismiss().catch(() => { }));
      try {
        await page.goto(own + '?autostart=1&seed=11&nopause=1&mute=1', { waitUntil: 'load', timeout: 20000 });
        await page.waitForTimeout(900);
        const tap = (x, y) => phone ? page.touchscreen.tap(x, y).catch(() => { }) : page.mouse.click(x, y).catch(() => { });
        for (let k = 0; k < 3; k++) { const b = page.locator('button:visible, [role=button]:visible, .btn:visible').filter({ hasText: /play|start|begin|launch|go|tap|continue|new game|skip|deploy|enter|solo|easy|normal|ready/i }).first(); if (await b.count().catch(() => 0)) { await b.click({ timeout: 1200, force: true }).catch(() => { }); await page.waitForTimeout(300); } else break; }
        let seed = 99; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
        const play = async n => { for (let k = 0; k < n; k++) { const x = 40 + rnd() * (vp.width - 80), y = vp.height * (.35 + rnd() * .5); if (k % 3 === 0) { await page.mouse.move(x, y).catch(() => { }); await page.mouse.down().catch(() => { }); await page.mouse.move(x + (rnd() - .5) * 160, y + (rnd() - .5) * 120, { steps: 3 }).catch(() => { }); await page.mouse.up().catch(() => { }); } else await tap(x, y); const key = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyD', 'KeyW', 'Space'][Math.floor(rnd() * 6)]; await page.keyboard.down(key).catch(() => { }); await page.waitForTimeout(110); await page.keyboard.up(key).catch(() => { }); } };
        if (await page.evaluate(() => typeof window.__gdlThumb === 'function').catch(() => false)) await page.evaluate(() => window.__gdlThumb()).catch(() => { }); else await play(7);
        await page.waitForTimeout(250);
        const frames = [await page.screenshot({ type: 'png' })];
        const name = path.join(ROOT, 'thumbs', g.id.replace(/\//g, '--'));
        fs.writeFileSync(name + '.jpg', Buffer.from(await encode(frames, ow, oh, .8), 'base64'));
        if (STRIPS) { for (let k = 0; k < 3; k++) { await play(3); frames.push(await page.screenshot({ type: 'png' })); } fs.writeFileSync(name + '.strip.jpg', Buffer.from(await encode(frames, Math.round(ow * .75), Math.round(oh * .75), .6), 'base64')); }
      } catch (e) { console.log('FAILED', g.id, String(e.message).split('\n')[0]); }
      await ctx.close().catch(() => { });
      if (++done % 20 === 0) console.log(done + '/' + games.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(JOBS, games.length) }, worker));
  await browser.close(); server.close(); console.log('thumbnails:', done);
})();
