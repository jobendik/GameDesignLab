// Pocket Pals launcher (PhoneGameLab2): same contract as the Phone Game Lab launcher, plus its own identity/skin.
const { labTest } = require('./lab-phonegamelab.test.js');
const LAB = 'PhoneGameLab2';
module.exports = {
  game: LAB + '/index.html', query: '', mobile: true, viewport: { width: 390, height: 844 },
  async run(ctx) {
    const { page, expect, url } = ctx;
    expect((await page.textContent('h1')).trim() === 'Pocket Pals' && (await page.title()).startsWith('Pocket Pals'), 'collection identity');
    const pals = await page.evaluate(() => { const cs = getComputedStyle(document.documentElement); return { accent: cs.getPropertyValue('--accent').trim(), r: cs.getPropertyValue('--r').trim(), bg: cs.getPropertyValue('--bg').trim() }; });
    const p2 = await page.context().newPage();
    await p2.goto(url + '/PhoneGameLab/index.html', { waitUntil: 'load' });
    const lab = await p2.evaluate(() => { const cs = getComputedStyle(document.documentElement); return { accent: cs.getPropertyValue('--accent').trim(), r: cs.getPropertyValue('--r').trim(), bg: cs.getPropertyValue('--bg').trim(), h1: document.querySelector('h1').textContent.trim() }; });
    await p2.close();
    expect(lab.h1 === 'Phone Game Lab', 'sibling launcher keeps its own name');
    expect(pals.accent !== lab.accent && pals.r !== lab.r && pals.bg !== lab.bg, 'Pocket Pals has its own skin through CSS variables');
    await labTest(ctx, LAB);
  },
};
