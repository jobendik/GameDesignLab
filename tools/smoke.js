#!/usr/bin/env node
/* Smoke-tests every discovered game in a real (headless) Chromium.
 *
 *   node tools/smoke.js                       # everything
 *   node tools/smoke.js PhoneGameLab/         # filter by id/path substring (multiple allowed)
 *   node tools/smoke.js --out=dir --shots     # write screenshots + report.json to dir
 *   node tools/smoke.js --jobs=4 --fail-fast
 *
 * Per game it verifies: page loads, no uncaught exceptions / console errors / failed
 * local requests, something is rendered (non-blank), the frame loop is alive, and the
 * game survives a burst of generic input (taps, drags, keys), a resize and a blur/focus.
 * This is automated *technical* verification only — it says nothing about fun.
 */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const { listen } = require('./serve');
const { discover } = require('./discover');

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v === undefined ? true : v]; }));
const filters = args.filter(a => !a.startsWith('--'));
const JOBS = +flags.jobs || 4;
const OUT = flags.out ? path.resolve(flags.out) : null;
const SHOTS = !!flags.shots && OUT;

const IGNORE_CONSOLE = [
  /Failed to load resource/i, // reported separately through requestfailed
  /GPU stall due to ReadPixels/i, /Automatic fallback to software WebGL/i, /GroupMarkerNotSet/i,
  /AudioContext was not allowed to start/i, /The AudioContext was not allowed/i,
  /cdn\.tailwindcss\.com should not be used in production/i,
  /Download the React DevTools/i, /in-browser Babel transformer/i,
];

async function testGame(browser, base, game) {
  const mobile = flags.mobile ? true : flags.desktop ? false : (game.collection !== 'arcade' && game.collection !== 'archive');
  const viewport = mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 };
  const ctx = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const r = { id: game.id, path: game.path, title: game.title, errors: [], warnings: [], external: [], ok: false };
  page.on('pageerror', e => r.errors.push('pageerror: ' + String(e.message || e).slice(0, 300)));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (IGNORE_CONSOLE.some(re => re.test(t))) return;
    r.errors.push('console: ' + t.slice(0, 300));
  });
  page.on('requestfailed', q => {
    const u = q.url();
    if (u.startsWith(base)) r.errors.push('request failed: ' + u.replace(base, ''));
    else if (!r.external.includes(new URL(u).host)) r.external.push(new URL(u).host);
  });
  page.on('response', s => { if (s.status() >= 400 && s.url().startsWith(base)) r.errors.push(`http ${s.status()}: ` + s.url().replace(base, '')); });
  page.on('dialog', d => d.dismiss().catch(() => {}));
  // External CDNs may be unreachable in CI; fail them fast so games must work (or degrade) offline.
  await page.route(u => !u.href.startsWith(base) && !/fonts\.(googleapis|gstatic)\.com/.test(u.host), route => route.abort());
  await page.route(u => /fonts\.(googleapis|gstatic)\.com/.test(u.host), route => route.abort());
  // Keep the run on the game under test: stray taps on "back to lab" links must not navigate away.
  const own = base + '/' + encodeURI(game.path);
  await page.route(u => u.href.startsWith(base), (route, req) => (req.isNavigationRequest() && req.frame() === page.mainFrame() && !req.url().split('?')[0].startsWith(own)) ? route.abort() : route.continue());
  const shot = async (name) => { if (SHOTS) { const f = path.join(OUT, game.id.replace(/[\/ ()]/g, '_') + '.' + name + '.jpg'); await page.screenshot({ path: f, type: 'jpeg', quality: 70 }).catch(() => {}); } };
  try {
    await page.goto(base + '/' + encodeURI(game.path), { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(1200);
    await shot('1-load');
    const fps = async () => page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); function f() { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res(n); } requestAnimationFrame(f); })).catch(() => -1);
    // Try to get into gameplay: click obvious start buttons, then centre-tap, then keys.
    const tap = async (x, y) => { if (mobile) await page.touchscreen.tap(x, y).catch(() => {}); else await page.mouse.click(x, y).catch(() => {}); };
    for (let i = 0; i < 3; i++) {
      const btn = page.locator('button:visible, [role=button]:visible, .btn:visible, a.button:visible').filter({ hasText: /play|start|begin|launch|go|tap|continue|new game|skip|ok|deploy|enter|solo|easy|normal|ready|resume/i }).first();
      if (await btn.count().catch(() => 0)) { await btn.click({ timeout: 1500, force: true }).catch(() => {}); await page.waitForTimeout(350); } else break;
    }
    const { width: W, height: H } = viewport;
    await tap(W / 2, H / 2); await page.waitForTimeout(200);
    await page.keyboard.press('Enter').catch(() => {}); await page.keyboard.press('Space').catch(() => {});
    await page.waitForTimeout(500);
    // Generic input burst
    let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'];
    for (let i = 0; i < 14; i++) {
      const x = 30 + rnd() * (W - 60), y = 90 + rnd() * (H - 180);
      if (i % 3 === 0) { await page.mouse.move(x, y).catch(() => {}); await page.mouse.down().catch(() => {}); await page.mouse.move(x + (rnd() - .5) * 220, y + (rnd() - .5) * 220, { steps: 4 }).catch(() => {}); await page.mouse.up().catch(() => {}); }
      else await tap(x, y);
      const k = keys[Math.floor(rnd() * keys.length)];
      await page.keyboard.down(k).catch(() => {}); await page.waitForTimeout(90); await page.keyboard.up(k).catch(() => {});
    }
    await page.waitForTimeout(600);
    await shot('2-play');
    r.fps = await fps();
    // Non-blank check: sample the screenshot for colour variance.
    const png = await page.screenshot({ type: 'png' }).catch(() => null);
    if (png) {
      r.blank = await page.evaluate(async (b64) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 64, 64);
        const d = x.getImageData(0, 0, 64, 64).data; const set = new Set();
        for (let i = 0; i < d.length; i += 4) set.add((d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4));
        return set.size < 4;
      }, png.toString('base64')).catch(() => null);
    }
    // Resize + blur/focus robustness
    await page.setViewportSize(mobile ? { width: 844, height: 390 } : { width: 800, height: 600 });
    await page.waitForTimeout(350);
    await shot('3-resized');
    await page.evaluate(() => { window.dispatchEvent(new Event('blur')); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); }).catch(() => {});
    await page.setViewportSize(viewport);
    await page.waitForTimeout(350);
    r.fpsAfter = await fps();
    r.hasCanvas = await page.evaluate(() => document.querySelectorAll('canvas').length).catch(() => 0);
    r.scrollOverflow = await page.evaluate(() => ({ x: document.documentElement.scrollWidth - innerWidth, y: document.documentElement.scrollHeight - innerHeight })).catch(() => null);
    if (r.blank) r.errors.push('blank screen after start');
    if (r.fps >= 0 && r.fps < 20) r.warnings.push('low fps: ' + r.fps);
  } catch (e) {
    r.errors.push('harness: ' + String(e.message || e).split('\n')[0].slice(0, 200));
  }
  r.errors = [...new Set(r.errors)].slice(0, 12);
  r.ok = r.errors.length === 0;
  await ctx.close().catch(() => {});
  return r;
}

(async () => {
  let games = discover();
  if (filters.length) games = games.filter(g => filters.some(f => g.id.includes(f) || g.path.includes(f)));
  if (!games.length) { console.error('no games matched'); process.exit(2); }
  if (OUT) fs.mkdirSync(OUT, { recursive: true });
  const { server, url } = await listen(0);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  const results = []; let i = 0;
  const t0 = Date.now();
  async function worker() {
    while (i < games.length) {
      const g = games[i++];
      const r = await testGame(browser, url, g);
      results.push(r);
      const tag = r.ok ? (r.warnings.length ? 'WARN' : ' ok ') : 'FAIL';
      console.log(`[${tag}] ${g.id}  fps=${r.fps}${r.external.length ? '  ext=' + r.external.join(',') : ''}${r.ok ? '' : '\n        ' + r.errors.join('\n        ')}${r.warnings.length ? '\n        (' + r.warnings.join('; ') + ')' : ''}`);
      if (!r.ok && flags['fail-fast']) process.exit(1);
    }
  }
  await Promise.all(Array.from({ length: Math.min(JOBS, games.length) }, worker));
  await browser.close(); server.close();
  results.sort((a, b) => a.id.localeCompare(b.id));
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (OUT) fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ when: new Date().toISOString(), results }, null, 1));
  process.exit(failed.length ? 1 : 0);
})();
