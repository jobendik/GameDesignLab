#!/usr/bin/env node
/* Gameplay test runner. Each tests/<collection>/<name>.test.js exports:
 *   module.exports = { game: 'PhoneGameLab/games/37-star-jar/index.html', query: '?autostart=1&seed=7&nopause=1&mute=1',
 *                      viewport: {width:390,height:844}, mobile: true,          // optional
 *                      async run({ page, expect, wait, state, game }) { ... } };
 * `state()` → window.__lab.state (phone engine) ; `game(fn, arg)` evaluates fn(window.__lab.game, arg) in the page.
 * Any uncaught page error or console.error fails the test.
 *   node tools/run-tests.js [filter…] [--jobs=4]
 */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { listen, ROOT } = require('./serve');
const args = process.argv.slice(2), filters = args.filter(a => !a.startsWith('--'));
const JOBS = +(args.find(a => a.startsWith('--jobs=')) || '').split('=')[1] || 4;
function walk(d) { return fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.test.js') ? [path.join(d, e.name)] : []) : []; }
function expect(cond, msg) { if (!cond) throw new Error('expect failed: ' + msg); }
(async () => {
  let files = walk(path.join(ROOT, 'tests')).sort();
  if (filters.length) files = files.filter(f => filters.some(x => f.includes(x)));
  if (!files.length) { console.log('no tests matched'); process.exit(0); }
  const { server, url } = await listen(0);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  let i = 0, failed = 0; const t0 = Date.now();
  async function worker() {
    while (i < files.length) {
      const file = files[i++], rel = path.relative(ROOT, file); let spec;
      try { spec = require(file); } catch (e) { failed++; console.log(`[FAIL] ${rel}\n        cannot load: ${e.message}`); continue; }
      const mobile = spec.mobile !== false;
      const ctx = await browser.newContext({ viewport: spec.viewport || (mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }), hasTouch: mobile, isMobile: mobile });
      const page = await ctx.newPage(); const errs = [];
      page.on('pageerror', e => errs.push('pageerror: ' + e.message));
      page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|AudioContext|GPU stall|WebGL/i.test(m.text())) errs.push('console: ' + m.text()); });
      await page.route(u => !u.href.startsWith(url), r => r.abort());
      const started = Date.now();
      try {
        const q = spec.query == null ? '?autostart=1&seed=7&nopause=1&mute=1' : spec.query;
        await page.goto(url + '/' + encodeURI(spec.game) + q, { waitUntil: 'load' });
        await page.waitForTimeout(300);
        await Promise.race([
          spec.run({ page, expect, url, wait: ms => page.waitForTimeout(ms), state: () => page.evaluate(() => window.__lab && window.__lab.state), game: (fn, arg) => page.evaluate(([f, a]) => (new Function('g', 'a', 'return (' + f + ')(g,a)'))(window.__lab && window.__lab.game, a), [fn.toString(), arg]) }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('test timeout (90s)')), spec.timeout || 90000)),
        ]);
        if (errs.length) throw new Error(errs.slice(0, 4).join(' | '));
        console.log(`[ ok ] ${rel}  (${((Date.now() - started) / 1000).toFixed(1)}s)`);
      } catch (e) { failed++; console.log(`[FAIL] ${rel}\n        ${String(e.message).split('\n')[0]}${errs.length ? '\n        ' + errs.slice(0, 3).join('\n        ') : ''}`); }
      await ctx.close().catch(() => { });
    }
  }
  await Promise.all(Array.from({ length: Math.min(JOBS, files.length) }, worker));
  await browser.close(); server.close();
  console.log(`\n${files.length - failed}/${files.length} gameplay tests passed in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  process.exit(failed ? 1 : 0);
})();
