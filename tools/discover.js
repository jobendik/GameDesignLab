#!/usr/bin/env node
// Discovers every playable game from the filesystem (never from hardcoded lists).
// Usage: node tools/discover.js [--json]
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
function title(file) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/<title>([^<]*)<\/title>/i);
  if (m) return m[1].trim();
  const l = src.match(/Lab\.init\(\{\s*title:\s*["'`]([^"'`]+)/);
  return l ? l[1] : path.basename(path.dirname(file));
}
function discover() {
  const games = [];
  for (const dir of ['games', 'archive']) {
    const d = path.join(ROOT, dir);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).sort()) {
      if (f.endsWith('.html')) games.push({ id: dir + '/' + f.replace(/\.html$/, ''), collection: dir === 'archive' ? 'archive' : 'arcade', path: dir + '/' + f, title: title(path.join(d, f)) });
    }
  }
  for (const lab of ['PhoneGameLab', 'PhoneGameLab2']) {
    const g = path.join(ROOT, lab, 'games');
    if (!fs.existsSync(g)) continue;
    for (const slug of fs.readdirSync(g).sort()) {
      const idx = path.join(g, slug, 'index.html');
      if (fs.existsSync(idx)) games.push({ id: lab + '/' + slug, collection: lab, path: `${lab}/games/${slug}/index.html`, title: title(idx) });
    }
  }
  return games;
}
module.exports = { discover, ROOT };
if (require.main === module) {
  const g = discover();
  if (process.argv.includes('--json')) console.log(JSON.stringify(g, null, 2));
  else { const by = {}; for (const x of g) by[x.collection] = (by[x.collection] || 0) + 1; console.log(by, 'total', g.length); }
}
