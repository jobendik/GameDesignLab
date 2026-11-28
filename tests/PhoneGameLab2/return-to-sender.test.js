// Return to Sender: holding under a column beams its lowest jelly down to Bolt (real mouse input); letting go flings it
// back up. A same-colour hit pops the whole touching patch (triangular score), a wrong colour pops only the one it hits
// and breaks the streak; pot-helmet jellies can't be beamed and lose the pot when hit; clearing the formation sends the
// wave home and the next wave arrives; a goo drip costs a heart; a formation that sinks to the garden ends the run;
// restart is clean.
module.exports = {
  game: 'PhoneGameLab2/games/return-to-sender/index.html',
  timeout: 60000,
  async run({ page, expect, wait, state, game }) {
    expect((await state()).running, 'game running after autostart');
    const Y = 844 - 70;
    const until = async (fn, n) => { for (let i = 0; i < (n || 40); i++) { if (await game(fn)) return true; await wait(80); } return false; };
    async function beamAndFling(from, to) {
      const x0 = await game((g, c) => g.colX(c), from), x1 = await game((g, c) => g.colX(c), to);
      await page.mouse.move(x0, Y); await page.mouse.down();
      const got = await until(g => !!g.held, 30);
      await page.mouse.move(x1, Y, { steps: 6 });
      for (let i = 0; i < 5; i++) { await page.mouse.move(await game((g, c) => g.colX(c), to), Y); await wait(60); } // the formation drifts: track the column
      await page.mouse.up();
      await until(g => g.shots === 0 && !g.held, 30); await wait(400);
      return got;
    }
    // 1. a matching throw pops the whole bottom patch
    await game(g => { g.setWave(2, ['1111111', '2222222']); g.calm(); });
    expect(await game(g => g.count) === 14, 'crafted formation in place');
    const got = await beamAndFling(0, 3);
    expect(got, 'holding under column 0 beams its lowest jelly into Bolt\'s arms');
    let s = await game(g => ({ n: g.count, score: g.score, grid: g.grid(), streak: g.streak }));
    expect(s.n === 7 && s.grid[1].every(x => x === '.') && s.score === 210 && s.streak === 1, 'same colour hit pops the whole patch: 6 + the thrown one (' + JSON.stringify(s) + ')');
    expect((await state()).score === 210, 'HUD shows the score');
    // 2. a wrong colour only pops the one it hits and resets the streak
    await game(g => { g.setWave(2, ['2222222', '0100000']); g.calm(); });
    const sc0 = await game(g => g.score);
    await beamAndFling(1, 4);
    s = await game(g => ({ n: g.count, score: g.score, grid: g.grid(), streak: g.streak }));
    expect(s.n === 12 && s.grid[1][4] === '.' && s.grid[1][0] === '0' && s.score === sc0 + 10 && s.streak === 0, 'mismatch pops one jelly (' + JSON.stringify(s) + ')');
    // 3. a pot-helmet jelly can't be beamed; a throw knocks the pot off
    await game(g => { g.setWave(3, ['0000000', 'H00000H']); g.calm(); });
    const x0 = await game(g => g.colX(0));
    await page.mouse.move(x0, Y); await page.mouse.down(); await wait(450);
    expect(!(await game(g => g.held)) && !(await game(g => g.towing)) && (await game(g => g.grid()[1][0])) === 'H', 'a short beam just clonks off the pot');
    await page.mouse.up(); await wait(200);
    await beamAndFling(2, 0);
    s = await game(g => g.grid());
    expect(s[1][0] === '0' && s[1][2] === '.', 'thrown jelly knocks the pot off (' + JSON.stringify(s) + ')');
    const x6 = await game(g => g.colX(6)); await page.mouse.move(x6, Y); await page.mouse.down();
    expect(await until(g => !!g.held, 40), 'keeping the beam on a pot tugs it loose, then the jelly comes down');
    // check while the jelly is still held: once flung, it can legitimately land back in that empty slot
    expect((await game(g => g.grid()))[1][6] === '.', 'the pried jelly left the formation');
    await page.mouse.up(); await until(g => g.shots === 0, 30);
    // 4. clearing the formation sends the wave home and brings the next one
    await game(g => { g.setWave(2, ['0000000']); g.calm(); });
    const sc1 = await game(g => g.score);
    await beamAndFling(0, 2);
    expect(await until(g => g.phase === 'clear', 20), 'empty formation = wave clear');
    expect((await game(g => g.score)) > sc1 + 210, 'pops + wave bonus scored');
    expect(await until(g => g.wave === 3 && g.count > 0, 40), 'next wave arrives');
    // 5. a goo drip costs a heart
    await game(g => { g.setWave(3, ['1111111']); g.calm(); }); await wait(300);
    await game(g => g.drip()); expect(await until(g => g.hearts === 2, 30), 'a goo drip on Bolt costs a heart');
    // 6. a formation that sinks down to the garden ends the run
    await game(g => g.sink(g.fenceY));
    for (let i = 0; i < 40 && !(await state()).over; i++) await wait(100);
    const o = await state(); expect(o.over, 'jellies landing ends the run'); expect(o.best >= o.score && o.best > 0, 'best score recorded');
    await wait(1600); await page.keyboard.press('Enter'); await wait(600);
    const r = await state(); expect(r.running && !r.over && r.score === 0, 'restart gives a clean run');
    expect(await game(g => g.wave === 1 && g.hearts === 3 && g.streak === 0 && !g.held && g.count > 0), 'wave, hearts and formation reset');
  },
};
