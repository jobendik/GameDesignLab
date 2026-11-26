#!/usr/bin/env node
// Tiny zero-dependency static server for local play + tests.
// Usage: node tools/serve.js [port]   (default 8123)
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff2':'font/woff2', '.wasm':'application/wasm', '.txt':'text/plain; charset=utf-8', '.md':'text/plain; charset=utf-8' };
function createServer() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    let file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
    fs.stat(file, (err, st) => {
      if (!err && st.isDirectory()) file = path.join(file, 'index.html');
      fs.readFile(file, (err2, data) => {
        if (err2) { res.writeHead(404, {'Content-Type':'text/plain'}); return res.end('not found'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
      });
    });
  });
}
function listen(port = 0) {
  return new Promise(resolve => { const s = createServer(); s.listen(port, '127.0.0.1', () => resolve({ server: s, port: s.address().port, url: `http://127.0.0.1:${s.address().port}` })); });
}
module.exports = { listen, ROOT };
if (require.main === module) {
  const port = +process.argv[2] || 8123;
  listen(port).then(({ url }) => console.log(`GameDesignLab serving at ${url}/`));
}
