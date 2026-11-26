#!/usr/bin/env node
/* Screenshot a game at the three reference viewports so it can be *looked at*.
 *   node tools/shot.js <game path or folder> <outPrefix> [--query='?autostart=1&seed=7&nopause=1&mute=1'] [--wait=1500]
 *                      [--script=path/to/drive.js]   // module.exports = async (page, viewportName) => { ...play... }
 *                      [--only=portrait|landscape|desktop] [--splash]   // --splash: no autostart (captures the splash card)
 * Writes <outPrefix>-portrait.png (390x844 touch), -landscape.png (844x390 touch), -desktop.png (1280x800 mouse). Prints page errors.
 */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const { listen, ROOT } = require('./serve');
const args = process.argv.slice(2), pos = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const i = a.indexOf('='); return i < 0 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
(async () => {
  let [game, out] = pos; if (!game || !out) { console.error('usage: node tools/shot.js <game> <outPrefix>'); process.exit(2); }
  if (fs.existsSync(path.join(ROOT, game)) && fs.statSync(path.join(ROOT, game)).isDirectory()) game = game.replace(/\/$/, '') + '/index.html';
  const query = flags.query != null ? flags.query : (flags.splash ? '?seed=7&mute=1' : '?autostart=1&seed=7&nopause=1&mute=1');
  const script = flags.script ? require(path.resolve(flags.script)) : null;
  const { server, url } = await listen(0);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
  const views = { portrait: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, landscape: { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true }, desktop: { viewport: { width: 1280, height: 800 } } };
  for (const [name, v] of Object.entries(views)) {
    if (flags.only && flags.only !== name) continue;
    const ctx = await browser.newContext(Object.assign({ deviceScaleFactor: 1 }, v)); const page = await ctx.newPage();
    page.on('pageerror', e => console.log(`[${name}] PAGEERROR ${e.message}`));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) console.log(`[${name}] console.error ${m.text()}`); });
    await page.route(u => !u.href.startsWith(url), r => r.abort());
    await page.goto(url + '/' + encodeURI(game) + query, { waitUntil: 'load' });
    await page.waitForTimeout(+flags.wait || 1500);
    if (script) await script(page, name);
    const f = `${out}-${name}.png`; await page.screenshot({ path: f }); console.log(f);
    await ctx.close();
  }
  await browser.close(); server.close();
})();
