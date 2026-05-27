/* Phone Game Lab — shared core helpers
 * Globals: Lab.{init, canvas, ctx, W, H, dpr, input, loop, stop, score, setScore, gameover, restart, toast, rand, clamp, dist, now, lerp}
 */
(function(global){
  const Lab = {};
  global.Lab = Lab;

  let canvas, ctx, dpr=1, W=0, H=0;
  let scoreEl=null, titleEl=null, instrEl=null;
  let rafId=0, lastT=0, mainLoop=null, running=false;
  let restartCb=null, gameTitle="Game";

  const input = {
    down:false, x:0, y:0, px:0, py:0, dx:0, dy:0,
    startX:0, startY:0, startT:0,
    justDown:false, justUp:false,
    taps:[], // {x,y,t}
    keys:{},
    onDown:[], onUp:[], onMove:[], onTap:[], onSwipe:[],
  };
  Lab.input = input;

  function injectShell(opts){
    // viewport
    if(!document.querySelector('meta[name=viewport]')){
      const m=document.createElement('meta');
      m.name='viewport';
      m.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
      document.head.appendChild(m);
    }
    document.title = opts.title + ' — Phone Game Lab';

    // canvas
    canvas=document.createElement('canvas');
    canvas.className='lab-canvas';
    document.body.appendChild(canvas);
    ctx=canvas.getContext('2d');
    Lab.canvas=canvas;
    Lab.ctx=ctx;

    // hud
    const hud=document.createElement('div');
    hud.className='lab-hud';
    hud.innerHTML = `
      <a class="btn" href="../../index.html" aria-label="Back">&larr; Lab</a>
      <div class="score" id="lab-score">0</div>
      <button class="btn" id="lab-restart">↻</button>`;
    document.body.appendChild(hud);
    scoreEl=hud.querySelector('#lab-score');
    titleEl=document.createElement('div');
    titleEl.className='title';
    titleEl.textContent=opts.title;
    hud.insertBefore(titleEl,hud.children[1]);
    hud.querySelector('#lab-restart').onclick=()=>Lab.restart();

    // instructions
    if(opts.instructions){
      instrEl=document.createElement('div');
      instrEl.className='lab-instr';
      instrEl.textContent=opts.instructions;
      document.body.appendChild(instrEl);
    }

    // resize
    function resize(){
      dpr=Math.min(2,window.devicePixelRatio||1);
      W=window.innerWidth; H=window.innerHeight;
      canvas.width=Math.floor(W*dpr); canvas.height=Math.floor(H*dpr);
      canvas.style.width=W+'px'; canvas.style.height=H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      Lab.W=W; Lab.H=H; Lab.dpr=dpr;
    }
    window.addEventListener('resize',resize,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(resize,150));
    resize();

    // pointer input
    function getXY(e){
      const t=e.touches?e.touches[0]:e;
      const r=canvas.getBoundingClientRect();
      return {x:(t.clientX-r.left), y:(t.clientY-r.top)};
    }
    function fire(arr,...a){ for(const f of arr) try{f(...a)}catch(err){console.error(err)} }
    canvas.addEventListener('pointerdown',e=>{
      e.preventDefault();
      try{canvas.setPointerCapture(e.pointerId)}catch{}
      const p=getXY(e);
      input.down=true; input.justDown=true;
      input.x=input.px=input.startX=p.x;
      input.y=input.py=input.startY=p.y;
      input.dx=input.dy=0; input.startT=performance.now();
      fire(input.onDown,p.x,p.y);
    });
    canvas.addEventListener('pointermove',e=>{
      const p=getXY(e);
      input.px=input.x; input.py=input.y;
      input.x=p.x; input.y=p.y;
      input.dx=input.x-input.px; input.dy=input.y-input.py;
      fire(input.onMove,p.x,p.y,input.dx,input.dy);
    });
    function up(e){
      if(!input.down) return;
      const p=getXY(e);
      input.down=false; input.justUp=true;
      const dt=performance.now()-input.startT;
      const dx=p.x-input.startX, dy=p.y-input.startY;
      const dd=Math.hypot(dx,dy);
      if(dt<300 && dd<14){
        input.taps.push({x:p.x,y:p.y,t:performance.now()});
        fire(input.onTap,p.x,p.y);
      } else if(dd>30){
        fire(input.onSwipe,dx,dy,dt,p.x,p.y);
      }
      fire(input.onUp,p.x,p.y);
    }
    canvas.addEventListener('pointerup',up);
    canvas.addEventListener('pointercancel',up);
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    window.addEventListener('keydown',e=>{input.keys[e.key]=true;});
    window.addEventListener('keyup',e=>{input.keys[e.key]=false;});
  }

  Lab.init = function(opts){
    opts=opts||{};
    gameTitle=opts.title||"Game";
    injectShell({title:gameTitle, instructions:opts.instructions});
    if(opts.restart) restartCb=opts.restart;
  };

  Lab.loop = function(fn){
    mainLoop=fn; running=true; lastT=performance.now();
    function step(t){
      if(!running) return;
      const dt=Math.min(0.05,(t-lastT)/1000); lastT=t;
      try{ mainLoop(dt,t/1000); }catch(e){console.error(e)}
      // reset edge flags after step
      input.justDown=false; input.justUp=false;
      rafId=requestAnimationFrame(step);
    }
    rafId=requestAnimationFrame(step);
  };
  Lab.stop=function(){running=false;cancelAnimationFrame(rafId)};

  Lab.setScore=function(v){ if(scoreEl) scoreEl.textContent=String(v); };
  Lab.score=Lab.setScore;

  Lab.gameover=function(opts){
    Lab.stop();
    opts=opts||{};
    const o=document.createElement('div');
    o.className='lab-overlay';
    o.innerHTML=`<h2>${opts.title||'Game Over'}</h2>
      <p>${opts.message||''}</p>
      <button>${opts.button||'Play again'}</button>
      <div class="small"><a href="../../index.html">← Back to Lab</a></div>`;
    o.querySelector('button').onclick=()=>{ o.remove(); Lab.restart(); };
    document.body.appendChild(o);
  };

  Lab.win=function(msg){ Lab.gameover({title:'You win!',message:msg||'Nicely done.'}); };

  Lab.restart=function(){
    document.querySelectorAll('.lab-overlay').forEach(e=>e.remove());
    Lab.stop();
    if(restartCb) restartCb();
  };

  Lab.toast=function(text,ms){
    const t=document.createElement('div');
    t.className='lab-toast'; t.textContent=text;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), ms||900);
  };

  // math helpers
  Lab.rand=(a,b)=>a+Math.random()*(b-a);
  Lab.randInt=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
  Lab.clamp=(v,a,b)=>v<a?a:v>b?b:v;
  Lab.dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
  Lab.lerp=(a,b,t)=>a+(b-a)*t;
  Lab.now=()=>performance.now()/1000;
  Lab.choose=arr=>arr[Math.floor(Math.random()*arr.length)];
  Lab.TAU=Math.PI*2;

  // simple beeper using WebAudio
  let actx=null;
  Lab.beep=function(freq=440,dur=0.06,type='square',gain=0.05){
    try{
      if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
      const o=actx.createOscillator(), g=actx.createGain();
      o.type=type; o.frequency.value=freq;
      g.gain.value=gain;
      o.connect(g); g.connect(actx.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime+dur);
      o.stop(actx.currentTime+dur);
    }catch{}
  };
})(window);
