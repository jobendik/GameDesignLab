#!/usr/bin/env node
// PhoneGameLab/shared is the source of truth for the phone engine; mirror it into PhoneGameLab2/shared.
// `--check` exits 1 if the copies differ (used by tests).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), FILES = ['core.js', 'style.css', 'ENGINE.md'];
let bad = 0;
for (const f of FILES) {
  const a = path.join(ROOT, 'PhoneGameLab/shared', f), b = path.join(ROOT, 'PhoneGameLab2/shared', f);
  const same = fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b));
  if (process.argv.includes('--check')) { if (!same) { console.error('out of sync:', f); bad = 1; } }
  else if (!same) { fs.copyFileSync(a, b); console.log('synced', f); }
}
process.exit(bad);
