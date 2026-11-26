/* Star Trail Adventure — gameplay test.
 * The sim is stepped deterministically through the inert hook (window.__gdl.advance) so software-rendered frame rate
 * does not matter. Real key events cover run / jump / dash / pause; an input-only bot (move vector + jump + dash, the
 * same things a stick and two buttons produce) then plays all three trails start to beacon. */
function bot(opts){
  const g=window.__gdl,hyp=Math.hypot,DT=1/60,cl=(v,a,b)=>v<a?a:v>b?b:v; let t=0,plan=null,log=[],cross=false;
  while(t<(opts.maxSec||120)){
    const s=g.state,P=s.player;
    if(s.mode==='end'||s.mode==='title'||s.mode==='paused')break;
    if(opts.progress!=null&&s.progress>=opts.progress&&P.ground>=0)break;
    if(opts.shards!=null&&s.shards>=opts.shards)break;
    if(opts.sparks!=null&&s.sparks<=opts.sparks&&s.mode==='play'&&P.ground>=0)break;
    if(s.mode!=='play'){g.input({mx:0,mz:0});g.advance(DT);t+=DT;plan=null;continue;}
    const route=s.plats.filter(p=>p.ri>=0).sort((a,b)=>a.ri-b.ri),cur=P.ground>=0?s.plats[P.ground]:null;
    let mx=0,mz=0,jump=false;
    const last=route.length-1,ci=cur&&cur.ri>=0?cur.ri:s.progress;
    if(cur&&cur.ri===last){const d=hyp(s.finish.x-P.x,s.finish.z-P.z)||1;mx=(s.finish.x-P.x)/d;mz=(s.finish.z-P.z)/d;g.input({mx,mz,jump:false});g.advance(DT);t+=DT;continue;}
    const T=route[Math.min(last,ci+1)],m=Math.min(.5,T.hx*.5,T.hz*.5);
    let ax=cl(P.x,T.x-T.hx+m,T.x+T.hx-m),az=cl(P.z,T.z-T.hz+m,T.z+T.hz-m);
    const gap=hyp(Math.max(0,Math.abs(P.x-T.x)-T.hx),Math.max(0,Math.abs(P.z-T.z)-T.hz)),dyT=T.y-P.y;
    if(cur){
      plan=null;
      let hz=false;for(const h of s.hazards){if(Math.abs(h.y-(P.y+.5))<1.3&&hyp(h.x-P.x,h.z-P.z)<(opts.hzR||1.9)){hz=true;break;}}
      const e=.1,ex=cl(T.x,cur.x-cur.hx+e,cur.x+cur.hx-e),ez=cl(T.z,cur.z-cur.hz+e,cur.z+cur.hz-e),de=hyp(ex-P.x,ez-P.z);
      const moving=T.kind==='move'||cur.kind==='move';
      const g2=hyp(Math.max(0,Math.abs(ex-T.x)-T.hx),Math.max(0,Math.abs(ez-T.z)-T.hz)),la=.5,g3=hyp(Math.max(0,Math.abs(ex+cur.vx*la-T.x-T.vx*la)-T.hx),Math.max(0,Math.abs(ez+cur.vz*la-T.z-T.vz*la)-T.hz)),dy3=dyT+(T.vy-cur.vy)*.35;
      const can=T.on&&(moving?(g2<=3.3&&g3<=3.0&&dyT<=1.3&&dy3<=1.3):(dyT<=1.6&&g2<=5.7));
      if(de>.28){const sp=can?1:Math.min(1,de*.7+.05);mx=(ex-P.x)/de*sp;mz=(ez-P.z)/de*sp;}
      else if(can){g.press('jump');jump=true;plan={dash:g2>3.3,hop:false};mx=(T.x-P.x);mz=(T.z-P.z);const l=hyp(mx,mz)||1;mx/=l;mz/=l;}
      if(hz&&!jump&&!opts.noHop){g.press('jump');jump=true;plan={hop:true,c:cur};}
      const sw=s.sweeps.find(w=>w.pid===cur.id);
      if(sw&&!jump){ /* sweeper: wait in the safe end, cross when the bar is not along the path, hop it at the hub */
        let ux=T.x-cur.x,uz=T.z-cur.z;if(Math.abs(ux)>Math.abs(uz)){ux=Math.sign(ux);uz=0;}else{uz=Math.sign(uz);ux=0;}
        const r=(P.x-sw.x)*ux+(P.z-sw.z)*uz,lat=(P.x-sw.x)*-uz+(P.z-sw.z)*ux;
        if(r<sw.L+.3){
          const rel=a=>{const bx=Math.cos(a),bz=-Math.sin(a);return Math.abs(bx*ux+bz*uz);};const okNow=rel(sw.a)<.75&&rel(sw.a+sw.sp*.2)<.75&&rel(sw.a+sw.sp*.4)<.8;
          const safeR=-(sw.L+.55);let tr;
          if(r<=-(sw.L+.3)&&!cross){ if(okNow&&Math.abs(r-safeR)<.5)cross=true; tr=safeR; } else cross=true;
          if(cross){mx=ux-(-uz)*lat*.5;mz=uz-ux*lat*.5; if(r>=-1.75){g.press('jump');jump=true;plan={hop:true,c:cur};}}
          else{const d=tr-r;mx=ux*cl(d*2,-1,1)-(-uz)*lat*.5;mz=uz*cl(d*2,-1,1)-ux*lat*.5;}
        } else cross=false;
      } else if(!sw) cross=false;
    }else{
      if(plan&&plan.hop){const c=plan.c;ax=cl(T.x,c.x-c.hx+.4,c.x+c.hx-.4);az=cl(T.z,c.z-c.hz+.4,c.z+c.hz-.4);}
      const dx=ax-P.x,dz=az-P.z,d=hyp(dx,dz)||.001,sp=Math.min(7,d*5)/7;mx=dx/d*sp;mz=dz/d*sp;
      jump=P.vy>0;
      if(plan&&plan.dash&&P.dash&&P.vy<2.5&&d>2.2){mx=dx/d;mz=dz/d;g.input({mx,mz,jump});g.press('dash');plan.dash=false;}
    }
    g.input({mx,mz,jump});g.advance(DT);t+=DT;
  }
  g.input(null);const s=g.state;return {t:+t.toFixed(1),mode:s.mode,won:s.won,progress:s.progress,of:s.routeLen-1,sparks:s.sparks,falls:s.falls,shards:s.shards+'/'+s.shardTotal,comets:s.comets,time:+s.time.toFixed(1),score:s.score,rank:s.rank,pos:[+s.player.x.toFixed(1),+s.player.y.toFixed(1),+s.player.z.toFixed(1)]};
}
module.exports = {
  game: 'games/star-trail-adventure.html', query: '?autostart=1&seed=7&nopause=1&mute=1', mobile: false, timeout: 150000,
  async run({ page, expect, wait }) {
    const st = () => page.evaluate(() => window.__gdl.state);
    const adv = sec => page.evaluate(s => window.__gdl.advance(s), sec);
    const play = o => page.evaluate(`(${bot.toString()})(${JSON.stringify(o)})`);
    await page.evaluate(() => { localStorage.removeItem('gdl:best:games/star-trail-adventure'); window.__gdl.manual(true); });
    let s = await st();
    expect(s.mode === 'play' && s.stage === 0 && s.sparks === 3 && s.shards === 0 && s.shardTotal > 30 && s.cometTotal === 3, 'autostart → trail 1 fresh: ' + JSON.stringify({ m: s.mode, sp: s.sparks, n: s.shardTotal }));
    await adv(0.2);

    // real keyboard: run forward, variable-height jump, air-dash
    const z0 = s.player.z; await page.keyboard.down('KeyW'); await adv(0.25); await page.keyboard.up('KeyW'); s = await st();
    expect(s.player.z < z0 - 1 && s.player.ground === 0, 'W runs along the trail (z ' + s.player.z.toFixed(2) + ')');
    await adv(0.4);
    const apex = async holdSec => { await page.keyboard.down('Space'); let top = -1e9, held = 0; for (let i = 0; i < 70; i++) { await adv(1 / 60); held += 1 / 60; if (held >= holdSec) await page.keyboard.up('Space'); const p = (await st()).player; top = Math.max(top, p.y); if (p.ground >= 0 && i > 5) break; } await page.keyboard.up('Space'); return top; };
    const tap = await apex(0.04), hold = await apex(1);
    expect(hold > 2.0 && tap < hold - 0.8, 'variable jump: tap ' + tap.toFixed(2) + ' vs hold ' + hold.toFixed(2));
    await page.keyboard.down('Space'); await adv(0.2); await page.keyboard.down('KeyS'); await page.keyboard.press('ShiftLeft'); await adv(0.05); s = await st();
    expect(s.player.dashT > 0 && !s.player.dash && s.player.vz > 10, 'Shift air-dashes once: ' + JSON.stringify({ t: s.player.dashT, vz: s.player.vz }));
    await page.keyboard.up('KeyS'); await page.keyboard.up('Space'); await adv(1); s = await st(); expect(s.player.ground === 0 && s.player.dash, 'landed back on the start island, dash recharged');

    // pause / resume
    await page.keyboard.press('KeyP'); s = await st(); expect(s.mode === 'paused', 'P pauses'); const tp = s.time; await adv(0.5); expect((await st()).time === tp, 'frozen while paused');
    await page.keyboard.press('Escape'); expect((await st()).mode === 'play', 'Esc resumes');

    // genuine play: shards are collected by touching them, the lamp lights on landing
    let r = await play({ shards: 5, maxSec: 30 }); s = await st(); expect(s.shards >= 5, 'shards collected by running the trail: ' + s.shards);
    r = await play({ progress: 4, maxSec: 60 }); s = await st(); expect(s.progress >= 4 && s.cps[0].on, 'first lamp lit at platform 4: ' + JSON.stringify(r));
    // lose a spark by running off the edge → respawn at the lamp
    await page.evaluate(() => window.__gdl.input({ mx: -1, mz: 0, jump: false }));
    for (let i = 0; i < 40 && !((s = await st()).sparks === 2 && s.mode === 'play'); i++) await adv(0.1);
    expect(s.sparks === 2 && Math.hypot(s.player.x - s.cps[0].x, s.player.z - s.cps[0].z) < 3, 'fall costs a spark and respawns at the lamp: ' + JSON.stringify({ sp: s.sparks, m: s.mode }));
    for (let i = 0; i < 150 && (s = await st()).mode !== 'end'; i++) await adv(0.1);
    expect(s.mode === 'end' && !s.won && s.sparks === 0, 'out of sparks → fail card: ' + s.mode);
    expect(await page.locator('#ovEnd.on').count() === 1, 'end card visible');
    await page.evaluate(() => window.__gdl.input(null));
    await page.click('#bEnd1'); s = await st();
    expect(s.mode === 'play' && s.sparks === 3 && s.shards === 0 && s.progress === 0 && s.time === 0 && s.falls === 0 && !s.cps[0].on, 'retry is a clean restart: ' + JSON.stringify({ sp: s.sparks, sh: s.shards, pr: s.progress }));

    // win all three trails with the bot (also proves every jump in every course is makeable)
    let total = 0;
    for (let i = 0; i < 3; i++) {
      r = await play({ maxSec: 150 }); for (let k = 0; k < 30 && (await st()).mode !== 'end'; k++) await adv(0.1); s = await st();
      expect(s.mode === 'end' && s.won && s.stage === i && s.score > 3000 && /[SABC]/.test(s.rank), 'trail ' + (i + 1) + ' cleared: ' + JSON.stringify(r));
      total += s.score; expect(s.unlocked === Math.min(3, i + 2), 'next trail unlocked (' + s.unlocked + ')');
      const best = await page.evaluate(() => JSON.parse(localStorage.getItem('gdl:best:games/star-trail-adventure')));
      expect(best === total && s.best === total, 'total best persisted: ' + best + ' vs ' + total);
      if (i < 2) { await page.click('#bEnd1'); s = await st(); expect(s.mode === 'play' && s.stage === i + 1 && s.shards === 0 && s.sparks === 3, 'next trail starts clean'); }
    }
    await page.click('#bEnd3'); s = await st(); expect(s.mode === 'title' && await page.locator('#ovTitle.on .stg:not(.lock)').count() === 3, 'back to trail select, all three unlocked');
    await page.click('#bPlay'); await page.evaluate(() => window.__gdl.manual(false)); await wait(500);
    s = await st(); expect(s.mode === 'play' && s.time > 0, 'real-time loop runs after replay');
  },
};
