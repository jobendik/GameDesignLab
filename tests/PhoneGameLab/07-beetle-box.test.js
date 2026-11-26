// Beetle Box: touching two matching cards pins the pair and scores; blind misses are free but a miss on an already-seen
// card costs a pin; a third tap dismisses a showing mismatch at once; clearing a drawer deals a bigger one; cards can
// scuttle (swap slots); keyboard works; running out of pins ends the run; restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/07-beetle-box/index.html',
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const ready = async () => { for (let k = 0; k < 240 && !(await game(g => g.ready)); k++) await wait(25); expect(await game(g => g.ready), 'cards dealt'); };
    const cards = () => game(g => g.cards);
    const tap = async i => { const c = (await cards())[i]; await page.touchscreen.tap(c.x, c.y); await wait(90); };
    await ready();
    let cs = await cards();
    expect(cs.length === 6 && await game(g => g.pins) === 4 && await game(g => g.level) === 0, 'first drawer: 6 cards, 4 pins');
    const counts = {}; cs.forEach(c => counts[c.key] = (counts[c.key] || 0) + 1);
    expect(Object.keys(counts).length === 3 && Object.values(counts).every(n => n === 2), 'every species appears exactly twice');
    // 1. real touches flip cards; a matching pair is pinned and scores
    const j0 = cs.findIndex((c, q) => q !== 0 && c.key === cs[0].key);
    await tap(0); cs = await cards(); expect(cs[0].up && !cs[0].matched && await game(g => g.open) === 1, 'first touch flips a card face up');
    await tap(j0); cs = await cards();
    expect(cs[0].matched && cs[j0].matched && await game(g => g.found) === 1, 'matching pair is pinned');
    expect(await game(g => g.score) === 100 && (await state()).score === 100 && await game(g => g.combo) === 1, 'pair scores 100 and starts a combo');
    // 2. a blind miss (neither card seen before) is free
    const rest = cs.map((c, i) => i).filter(i => !cs[i].matched), a = rest[0], b = rest.find(i => cs[i].key !== cs[a].key);
    await tap(a); await tap(b);
    expect(await game(g => g.pins) === 4 && await game(g => g.combo) === 0 && await game(g => g.open) === 2, 'blind miss costs no pin, only the combo');
    // 3. input is never locked: a third tap flips the mismatch back immediately
    const third = rest.find(i => i !== a && i !== b);
    await tap(third); cs = await cards();
    expect(!cs[a].up && !cs[b].up && cs[third].up && await game(g => g.open) === 1, 'third tap dismisses the mismatch and flips the new card');
    // 4. its partner has been seen, so picking the other seen card is careless and costs a pin
    await tap(cs[third].key === cs[a].key ? b : a);
    expect(await game(g => g.pins) === 3 && await game(g => g.careless) === 1, 'missing with a card you had seen costs a pin');
    await wait(1300); cs = await cards(); expect(cs.filter(c => c.up && !c.matched).length === 0, 'mismatch flips back by itself');
    // 5. clear the drawer: combo multiplies, a bonus is paid, a pin comes back, a bigger drawer is dealt
    const before = await game(g => g.score);
    for (let k = 0; k < 2; k++) { cs = await cards(); const i = cs.findIndex(c => !c.matched), j = cs.findIndex((c, q) => q !== i && c.key === cs[i].key); await tap(i); await tap(j); }
    expect(await game(g => g.score) === before + 300, 'second pair in a row is worth double (100 + 200)');
    for (let k = 0; k < 60 && await game(g => g.level) === 0; k++) await wait(100);
    await ready();
    expect(await game(g => g.level) === 1 && (await cards()).length === 12, 'drawer 2 has 12 cards');
    expect(await game(g => g.score) > before + 300 && await game(g => g.pins) === 4, 'clear bonus paid and a pin restored');
    // 6. scuttle: two face-down cards trade slots (identity unchanged)
    cs = await cards(); const sw = await game(g => g.scuttle()); const after = await cards();
    expect(sw && after[sw[0]].slot === cs[sw[1]].slot && after[sw[1]].slot === cs[sw[0]].slot && after[sw[0]].key === cs[sw[0]].key, 'scuttle swaps two cards');
    expect(await game(g => g.scuttleEvery) === 0, 'early drawers are calm (no automatic scuttling)');
    await ready();
    // 7. keyboard: arrows show a cursor, space flips the card in that slot
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Space'); await wait(120);
    cs = await cards(); const kc = await game(g => g.cursor), first = cs.findIndex(c => c.up && !c.matched);
    expect(kc === 1 && first >= 0 && cs[first].slot === 1, 'space flips the card under the keyboard cursor');
    // 8. out of pins: repeat a known mismatch with one pin left
    const other = cs.findIndex((c, q) => q !== first && c.key !== cs[first].key && !c.seen);
    await tap(other); expect(await game(g => g.pins) === 4, 'second blind miss is still free');
    await wait(1200); await game(g => g.setPins(1));
    await tap(first); await tap(other);
    expect(await game(g => g.pins) === 0, 'repeating a seen mismatch costs the last pin');
    for (let i = 0; i < 50 && !(await state()).over; i++) await wait(100);
    const s = await state(); expect(s.over, 'no pins left ends the run'); expect(s.best === s.score && s.score > 0, 'best score recorded');
    await wait(1400); await page.keyboard.press('Enter'); await wait(500);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    await ready(); cs = await cards();
    expect(await game(g => g.level === 0 && g.pins === 4 && g.combo === 0 && g.found === 0 && g.phase === 'play') && cs.length === 6 && cs.every(c => !c.up && !c.matched && !c.seen), 'state fully reset');
  },
};
