#!/usr/bin/env node
// Builds contact-sheet images from a smoke --shots directory so many games can be eyeballed at once.
// Usage: node tools/contact-sheet.js <shotsDir> <outPrefix> [--match=2-play] [--filter=PhoneGameLab_] [--cols=8] [--per=40] [--cell=180]
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const [dir, outPrefix, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v]; }));
(async () => {
  const match = flags.match || '2-play', cols = +flags.cols || 8, per = +flags.per || 40, cell = +flags.cell || 180;
  let files = fs.readdirSync(dir).filter(f => f.includes('.' + match + '.') && (!flags.filter || f.includes(flags.filter))).sort();
  const browser = await chromium.launch(); const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (let i = 0, n = 0; i < files.length; i += per, n++) {
    const chunk = files.slice(i, i + per);
    const html = `<body style="margin:0;background:#111;font:11px sans-serif;color:#ddd"><div style="display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:6px;padding:6px">` +
      chunk.map(f => `<div><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}" style="width:${cell}px;display:block"><div style="overflow:hidden;white-space:nowrap;width:${cell}px">${f.replace(/\.\d-\w+\.jpg$/, '').replace(/^(root|PhoneGameLab2?|games)_/, '')}</div></div>`).join('') + '</div></body>';
    await page.setViewportSize({ width: cols * (cell + 6) + 6, height: 100 });
    await page.setContent(html); await page.waitForTimeout(200);
    const out = `${outPrefix}-${n}.jpg`; await page.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 72 }); console.log(out, chunk.length);
  }
  await browser.close();
})();
