// Coconut Groove: the chart is generated from fixed seeds, so notes are deterministic. Exact-time hits through the
// judging hook give PERFECT/GOOD/EARLY, real touch + key + mouse input registers on the beat, ribbons need holding,
// slides need following, the combo raises the multiplier, an empty groove meter loses, finishing the set ends neutrally.
module.exports = {
  game: 'PhoneGameLab/games/70-coconut-groove/index.html',
  async run({ page, expect, wait, state, game }) {
    const note = i => game((g, i) => g.notes[i], i);
    const until = async (i, lead) => { for (let k = 0; k < 400; k++) { if (await game((g, a) => g.notes[a[0]].t - g.time < a[1], [i, lead])) return; await wait(8); } throw new Error('note never arrived'); };
    expect((await state()).running, 'game running after autostart');
    const t1 = await game(g => g.time); await wait(300); expect(await game(g => g.time) > t1, 'song clock runs');
    const all = await game(g => g.notes);
    expect(all.length > 200 && Math.abs(all[0].t - 3.4) < .01 && all.every((n, i) => !i || n.t >= all[i - 1].t), 'deterministic chart, sorted, first note after the count-in');
    // exact-time judging through the hook
    await game((g, t) => g.setTime(t - .3), all[0].t);
    expect(await game((g, n) => g.hitAt(n.lane, n.t), all[0]) === 1, 'a hit on the beat is PERFECT');
    let s = await game(g => ({ score: g.score, combo: g.combo, c: g.counts }));
    expect(s.score === 100 && s.combo === 1 && s.c.p === 1, 'perfect scores 100');
    expect((await state()).score === 100, 'HUD score updated');
    expect(await game((g, n) => g.hitAt(n.lane, n.t + .09), all[1]) === 2 && await game(g => g.score) === 150, '90 ms late is GOOD for 50');
    const lanes = [0, 1, 2, 3].filter(l => l !== all[2].lane), c0 = await game(g => g.counts);
    expect(await game((g, a) => g.hitAt(a.l, a.t), { l: lanes[0], t: all[2].t - .1 }) === null && (await game(g => g.counts)).m === c0.m, 'a stray tap in an empty lane is free');
    const g0 = await game(g => g.groove);
    expect(await game((g, n) => g.hitAt(n.lane, n.t - .2), all[2]) === 3, '200 ms early is a miss');
    s = await game(g => ({ combo: g.combo, groove: g.groove, m: g.counts.m }));
    expect(s.combo === 0 && s.m === 1 && s.groove < g0, 'a miss breaks the combo and drains the groove');
    // real touch on the beat
    let i = all.findIndex((n, k) => k > 2 && !n.dur); await game((g, t) => g.setTime(t - .5, true), all[i].t);
    const hitY = await game(g => g.hitY), X = async l => game((g, l) => g.laneX(l), l);
    await until(i, .05); await page.touchscreen.tap(await X(all[i].lane), hitY); await wait(50);
    expect([1, 2].includes((await note(i)).st), 'a real tap on the pan as the note lands registers');
    // keyboard on the beat
    i = all.findIndex((n, k) => k > i && !n.dur); await game((g, t) => g.setTime(t - .5, true), all[i].t);
    await until(i, .04); await page.keyboard.press('dfjk'[all[i].lane]); await wait(50);
    expect([1, 2].includes((await note(i)).st), 'lane keys register on the beat');
    // an untouched note is missed automatically
    i = all.findIndex((n, k) => k > i && !n.dur); await game((g, t) => g.setTime(t + .2), all[i].t); await wait(120);
    expect((await note(i)).st === 3, 'a note left alone is missed');
    // ribbon: hold the pan to the tail
    i = all.findIndex((n, k) => k > i && n.dur && n.lane2 === n.lane); expect(i > 0, 'chart contains ribbons');
    await game((g, t) => g.setTime(t - .6, true), all[i].t); await page.mouse.move(await X(all[i].lane), hitY);
    await until(i, .04); await page.mouse.down(); await wait(all[i].dur * 1000 + 350); await page.mouse.up();
    let n = await note(i); expect([1, 2].includes(n.st) && n.tail === 1 && (await game(g => g.counts)).tails === 1, 'holding a ribbon to its tail pays the hold');
    // ribbon dropped: head hit but nobody holds
    const j = all.findIndex((q, k) => k > i && q.dur); await game((g, t) => g.setTime(t - .05, true), all[j].t);
    await game((g, q) => g.hitAt(q.lane, q.t), all[j]); await wait(600);
    expect((await note(j)).tail === 3, 'letting go of a ribbon drops it');
    // slide: follow the bend to the next pan
    i = all.findIndex(q => q.dur && q.lane2 !== q.lane); expect(i > 0 && all[i].ti >= 1, 'slides appear from the second tune');
    await game((g, t) => g.setTime(t - .6, true), all[i].t); const xa = await X(all[i].lane), xb = await X(all[i].lane2); await page.mouse.move(xa, hitY);
    await until(i, .04); await page.mouse.down(); await wait(all[i].dur * 450); await page.mouse.move(xb, hitY, { steps: 6 }); await wait(all[i].dur * 550 + 350); await page.mouse.up();
    n = await note(i); expect(n.tail === 1, 'following a slide to the next pan completes it');
    // ten in a row doubles the points
    let hits = 0; for (let k = i + 1; k < all.length && await game(g => g.combo) < 10; k++) { if (all[k].dur) continue; await game((g, q) => { g.setTime(q.t, true); g.hitAt(q.lane, q.t); }, all[k]); hits++; }
    expect(await game(g => g.mult) === 2 && hits <= 12, 'combo of 10 gives ×2');
    // empty groove meter ends the run
    const pend = await game(g => g.notes.find(q => q.st === 0)); await game((g, q) => { g.setGroove(.05); g.setTime(q.t + .2); }, pend);
    for (let k = 0; k < 30 && !(await state()).over; k++) await wait(100);
    let o = await state(); expect(o.over && !(await game(g => g.finished)), 'an empty groove meter loses the set');
    expect(o.best >= o.score && o.score > 0, 'best score recorded');
    await wait(1500); await page.keyboard.press('Enter'); await wait(400);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    const f = await game(g => ({ combo: g.combo, groove: g.groove, time: g.time, pend: g.notes.every(q => q.st === 0), c: g.counts }));
    expect(f.combo === 0 && Math.abs(f.groove - .7) < 1e-9 && f.time < 1 && f.pend && f.c.p + f.c.g + f.c.m === 0, 'clock, chart, combo and groove reset');
    // finishing the set ends neutrally
    await game(g => g.setTime(g.total - .3, true));
    for (let k = 0; k < 30 && !(await state()).over; k++) await wait(100);
    o = await state(); expect(o.over && await game(g => g.finished), 'reaching the end of the set finishes the run');
  },
};
