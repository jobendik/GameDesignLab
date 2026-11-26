// Flinch: a tap on green records a real reaction time and the HUD shows the running average; feints do not start the
// clock and tapping on one is a flinch (+500 ms); sleeping through green records 600; eight trials finish the run and
// store the (lower-is-better) average; three flinches lock you out without a score; restart is clean.
module.exports = {
  game: 'PhoneGameLab/games/03-flinch/index.html',
  async run({ page, expect, wait, state, game }) {
    const st = () => game(g => g.state);
    const until = async (s, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 6000)) { if ((await st()) === s) return true; await wait(15); } return false; };
    const tap = () => page.touchscreen.tap(195, 500);
    const react = async (delay, how) => {
      expect(await until('wait'), 'trial arms'); await game(g => g.skipWait()); expect(await until('go', 1500), 'lamp turns green');
      await wait(delay); if (how === 'key') await page.keyboard.press('Space'); else await tap(); await wait(50);
    };
    expect((await state()).running, 'game running after autostart');
    // taps while the machine is still arming are ignored
    expect(await st() === 'arm', 'starts by arming'); await tap(); await wait(40);
    expect(await game(g => g.strikes) === 0 && (await game(g => g.trials)).length === 0, 'tap during arming is ignored');
    // trial 1: no feints, natural wait, real tap on green
    expect((await game(g => g.feints)).length === 0, 'first trial has no feints');
    expect(await until('wait'), 'armed'); expect(await game(g => g.lamp) === 'off', 'lamp is dark while waiting');
    expect(await until('go', 5000), 'lamp turns green on its own'); expect(await game(g => g.lamp) !== 'off', 'lamp is lit');
    await wait(160); await tap(); await wait(50);
    let tr = await game(g => g.trials);
    expect(tr.length === 1 && tr[0].kind === 'ok' && tr[0].ms >= 140 && tr[0].ms < 600, 'reaction recorded in ms (' + (tr[0] && tr[0].ms) + ')');
    expect((await state()).score === tr[0].ms && await game(g => g.avg) === tr[0].ms, 'HUD shows the average');
    // trial 2 via keyboard, slower → average moves
    await react(300, 'key'); tr = await game(g => g.trials);
    expect(tr.length === 2 && tr[1].kind === 'ok' && tr[1].ms > tr[0].ms, 'slower key press recorded as slower (' + tr[1].ms + ')');
    expect((await state()).score === Math.round((tr[0].ms + tr[1].ms) / 2), 'average updated');
    // trial 3 onward carries feints; a feint lights the lamp red but does not start the clock; tapping it is a flinch
    expect(await until('arm'), 're-arms'); expect((await game(g => g.feints)).length >= 1, 'later trials plan feints');
    expect(await until('wait'), 'armed'); await game(g => g.feint('bigred')); await wait(60);
    expect(await st() === 'wait' && await game(g => g.lamp) !== 'off', 'red feint shows but trial is still waiting');
    await tap(); await wait(50); tr = await game(g => g.trials);
    expect(await game(g => g.strikes) === 1 && tr[2].kind === 'flinch' && tr[2].ms === 500, 'tapping a feint is a flinch worth 500 ms');
    // trial 4: sleep through green
    expect(await until('wait'), 'armed'); await game(g => g.skipWait()); expect(await until('go', 1500), 'green'); await wait(900);
    tr = await game(g => g.trials); expect(tr[3].kind === 'slow' && tr[3].ms === 600, 'no tap is recorded as 600 ms');
    // finish the remaining four
    for (let i = 4; i < 8; i++) await react(150 + i * 10);
    tr = await game(g => g.trials); expect(tr.length === 8, 'eight trials done');
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    let s = await state(); const avg = Math.round(tr.reduce((a, t) => a + t.ms, 0) / 8);
    expect(s.over, 'run ends after eight trials'); expect(s.score === avg, 'final score is the average (' + s.score + ' vs ' + avg + ')'); expect(s.best === avg, 'average stored as best');
    await wait(1300); await page.keyboard.press('Enter'); await wait(300);
    let r = await state(); expect(r.running && !r.over && typeof r.score !== 'number', 'restart gives a clean run');
    expect((await game(g => g.trials)).length === 0 && await game(g => g.strikes) === 0 && await st() === 'arm', 'state fully reset');
    // three flinches: locked out, best untouched
    for (let i = 0; i < 3; i++) { expect(await until('wait'), 'armed'); await tap(); await wait(50); expect(await game(g => g.strikes) === i + 1, 'flinch ' + (i + 1)); }
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    s = await state(); expect(s.over, 'three flinches end the run'); expect(s.best === avg, 'a lock-out does not touch the best average');
  },
};
