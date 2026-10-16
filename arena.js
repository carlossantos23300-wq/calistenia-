(function(root){
'use strict';
// Arena: games played with the whole body in front of the camera. The pose model runs on the phone; frames never leave it.
const A={
 // How a video frame is drawn with object-fit: cover, and where a landmark lands on screen (mirrored, like a mirror).
 cover(vw,vh,W,H){const s=Math.max(W/vw,H/vh);return {s,ox:(W-vw*s)/2,oy:(H-vh*s)/2}},
 toScreen(p,vw,vh,c,W){return {x:W-(p.x*vw*c.s+c.ox),y:p.y*vh*c.s+c.oy,v:p.visibility??1}},
 // Body measures in screen pixels, or null when the shoulders are not seen.
 body(pt){if(!pt)return null;const L=pt[11],R=pt[12];if(!(L&&R&&L.v>.5&&R.v>.5))return null;const sw=Math.max(8,Math.hypot(L.x-R.x,L.y-R.y)),sx=(L.x+R.x)/2,sy=(L.y+R.y)/2,H1=pt[23],H2=pt[24],hip=!!(H1&&H2&&H1.v>.5&&H2.v>.5),hx=hip?(H1.x+H2.x)/2:sx,hy=hip?(H1.y+H2.y)/2:sy+sw*1.4,knees=!!(pt[25]&&pt[26]&&pt[25].v>.5&&pt[26].v>.5),nose=pt[0]&&pt[0].v>.4?pt[0]:{x:sx,y:sy-sw*.6};
  return {sw,sx,sy,hx,hy,cx:(sx+hx)/2,torso:Math.max(sw*.8,Math.hypot(hx-sx,hy-sy)),nose,hip,full:hip&&knees,wrists:[pt[15],pt[16]].filter(p=>p&&p.v>.4),hands:[15,16,19,20].map(i=>pt[i]).filter(p=>p&&p.v>.4)}},
 // Has the player done what the obstacle asks? base is the standing position measured at the start.
 dodgeOk(type,b,base){if(!b||!base)return false;const w=b.wrists;switch(type){case 'duck':return b.sy>base.sy+.33*base.torso;case 'left':return b.cx>base.cx+.7*base.sw;case 'right':return b.cx<base.cx-.7*base.sw;case 'up':return w.length===2&&w.every(p=>p.y<b.nose.y-.05*base.torso);case 'wide':return w.length===2&&Math.max(...w.map(p=>p.x))-b.cx>1.3*base.sw&&b.cx-Math.min(...w.map(p=>p.x))>1.3*base.sw;default:return false}},
 judge(dt){const a=Math.abs(dt);return a<=110?['PERFEITO!',30]:a<=220?['BOM!',15]:['OK',8]},
 mult(combo){return Math.min(5,1+Math.floor(combo/5))},
 kcal(met,kg,sec){return Math.max(1,Math.round(met*(Number(kg)||70)*sec/3600))},
 rank(score,levels){const names=['Aquecimento','Bom começo','Muito bom','Craque','Lenda 🔥'];let i=0;while(i<levels.length&&score>=levels[i])i++;return names[i]},
 top(list,entry,n=5){const l=[...(list||[]),entry].sort((a,b)=>b.score-a.score).slice(0,n);return {list:l,pos:l.indexOf(entry)+1}}
};
root.ArenaCore=A;

root.initArena=function(app){
const {$,esc,toast,read,write,saveRun}=app,X=root.ExtrasCore;
const extra=()=>({...(X?.extraDefaults?.()||{}),...read('cal_extra',{})}),saveExtra=x=>{write('cal_extra',x);window.dispatchEvent(new Event('extra-updated'))};
const local=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},setLocal=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches,vib=p=>{try{navigator.vibrate?.(p)}catch{}};
const MODES={
 hunt:{name:'Caça-alvos',icon:'🎯',color:'#c6f25a',rgb:'198,242,90',bpm:124,met:6,need:'upper',levels:[120,300,500,750],about:'Toca nas bolas com as mãos. As douradas valem o triplo. Foge das bombas!',how:'De frente, a 1,5–2 m. Basta ver-se da cintura para cima.'},
 dodge:{name:'Esquiva',icon:'🧱',color:'#5ad1f2',rgb:'90,209,242',bpm:124,met:7,need:'full',levels:[100,250,400,600],about:'Agacha, foge para o lado, levanta e abre os braços para passares os obstáculos.',how:'De frente, a 2–3 m, com o corpo todo no ecrã.'},
 box:{name:'Boxe ao ritmo',icon:'🥊',color:'#ff7a59',rgb:'255,122,89',bpm:112,met:7.5,need:'upper',levels:[300,700,1100,1600],about:'Dá murros nos alvos quando o anel fecha, ao ritmo da música.',how:'De frente, a 1,5–2 m, da cintura para cima.'}};
const LENGTH=60;
const arena=()=>({best:{},top:{},plays:0,seconds:0,kcal:0,...(extra().arena||{})});
const weight=()=>{const b=local('cal_ui_body',{}),m=(read('cal_personal',{}).measurements||[]).filter(x=>x.weight).sort((a,c)=>a.date.localeCompare(c.date)).at(-1)?.weight;return Number(b.weight||m)||70};

// --- The card on the home page
const home=document.createElement('section');home.id='arenaHome';home.className='arena-home';home.setAttribute('aria-label','Arena');
function renderHome(){const a=arena();home.innerHTML=`<div class="arena-home-glow" aria-hidden="true"><i></i><i></i><i></i></div><div class="arena-home-head"><span class="arena-badge">NOVO</span><h2>🎮 Arena</h2><p>Treina a jogar. A câmara segue os teus movimentos: <strong>o teu corpo é o comando.</strong></p></div><div class="arena-home-modes">${Object.entries(MODES).map(([k,m])=>`<button type="button" data-arena="${k}" style="--c:${m.color}"><span aria-hidden="true">${m.icon}</span><strong>${esc(m.name)}</strong><small>${a.best[k]?'Recorde '+a.best[k]:'Novo'}</small></button>`).join('')}</div><button type="button" class="primary arena-home-play" data-arena="menu">▶ Entrar na Arena</button>${a.plays?`<p class="arena-home-note">${a.plays} ${a.plays===1?'jogo':'jogos'} · ${Math.round(a.seconds/60)} min · ${a.kcal} kcal</p>`:'<p class="arena-home-note">As imagens ficam só no teu telemóvel.</p>'}`}
renderHome();(document.getElementById('habitsHome')||$('nextSession'))?.after(home);
home.addEventListener('click',e=>{const b=e.target.closest('[data-arena]');if(!b)return;open(b.dataset.arena==='menu'?null:b.dataset.arena)});
window.addEventListener('extra-updated',()=>{if(!dialog.open)renderHome()});

// --- The full-screen window
const dialog=document.createElement('dialog');dialog.id='arenaDialog';dialog.className='arena-dialog';dialog.setAttribute('aria-label','Arena');
dialog.innerHTML=`<div class="arena-stage" id="arStage"><video id="arVideo" playsinline muted autoplay></video><canvas id="arCanvas" aria-hidden="true"></canvas>
<div class="arena-hud" id="arHud" hidden><div class="arena-score"><small>PONTOS</small><strong id="arScore">0</strong></div><div class="arena-clock"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19"/><circle id="arRing" cx="22" cy="22" r="19"/></svg><strong id="arTime">60</strong></div><div class="arena-side"><div id="arLives" class="arena-lives"></div><div id="arCombo" class="arena-combo"></div></div></div>
<div id="arMsg" class="arena-msg" role="status" aria-live="polite"></div><div id="arBig" class="arena-big" aria-hidden="true"></div>
<div class="arena-top"><button type="button" id="arPause" class="arena-icon" aria-label="Pausa" hidden>❚❚</button><button type="button" id="arClose" class="arena-icon" aria-label="Sair da Arena">×</button></div>
<div id="arMenu" class="arena-screen"></div><div id="arEnd" class="arena-screen" hidden></div></div>`;
document.body.append(dialog);
const video=$('arVideo'),canvas=$('arCanvas'),ctx=canvas.getContext('2d');

// --- Sound: a small beat and effects made in the browser
let ac=null,master=null,noiseBuf=null,musicOn=local('cal_ui_arena_music',true),sched=null,nextBeat=0,audioOff=0;
function audio(){if(ac)return ac;try{ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.2;master.connect(ac.destination);const n=ac.sampleRate*.4;noiseBuf=ac.createBuffer(1,n,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}catch{ac=null}return ac}
function blip(f,d=.12,type='triangle',v=.5,t=ac?.currentTime||0,slide=0){if(!ac)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(master);o.start(t);o.stop(t+d+.02)}
function hiss(t,f,v,d){if(!ac)return;const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf;fl.type='highpass';fl.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl).connect(g).connect(master);s.start(t);s.stop(t+d+.02)}
const sfx={hit:c=>blip(520+Math.min(12,c)*45,.12,'triangle',.45),gold:()=>{blip(880,.1,'square',.25);blip(1320,.16,'square',.22,(ac?.currentTime||0)+.08)},bomb:()=>{if(!ac)return;hiss(ac.currentTime,200,.8,.35);blip(160,.4,'sawtooth',.4,ac.currentTime,50)},fail:()=>blip(240,.35,'sawtooth',.3,ac?.currentTime||0,90),beep:()=>blip(660,.12,'sine',.5),go:()=>blip(990,.35,'square',.3),win:()=>{if(!ac)return;[523,659,784,1047].forEach((f,i)=>blip(f,.22,'triangle',.35,ac.currentTime+i*.12))}};
const BASS=[45,45,48,43];
function playBeat(k,t){const bar=Math.floor(k/4),b=k%4;if(!musicOn)return;const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.9,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g).connect(master);o.start(t);o.stop(t+.32);hiss(t+spb()/2,7000,.14,.05);if(b===1||b===3)hiss(t,1500,.3,.12);const n=BASS[bar%4];blip(440*2**((n-69)/12),spb()*.45,'sawtooth',.16,t+spb()/2)}
const spb=()=>60/(MODES[game?.mode]?.bpm||120);
function startMusic(){if(!audio())return;ac.resume?.().catch(()=>{});audioOff=ac.currentTime-gameTime();nextBeat=Math.max(0,Math.ceil(gameTime()/spb()));clearInterval(sched);sched=setInterval(()=>{if(!game||game.paused)return;while(nextBeat*spb()+audioOff<ac.currentTime+.12){const t=nextBeat*spb()+audioOff;if(t>=ac.currentTime-.02)playBeat(nextBeat,t);nextBeat++}},25)}
const stopMusic=()=>{clearInterval(sched);sched=null};
const latency=()=>musicOn&&ac?(ac.outputLatency||ac.baseLatency||0):0;

// --- Camera and pose
let stream=null,landmarker=null,lastVT=-1,raw=null,pts=null,body=null,wake=null,frame=0;
async function camera(){stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});video.srcObject=stream;await video.play().catch(()=>{})}
function stopCamera(){stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;try{wake?.release()}catch{}wake=null}
let W=0,H=0,dpr=1;function resize(){const r=$('arStage').getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',()=>{if(dialog.open)resize()});
function readPose(){if(!landmarker||video.readyState<2||video.currentTime===lastVT)return;lastVT=video.currentTime;let res;try{res=landmarker.detectForVideo(video,performance.now())}catch{return}const lm=res?.landmarks?.[0];if(!lm){raw=null;pts=null;body=null;return}const c=A.cover(video.videoWidth,video.videoHeight,W,H),next=lm.map(p=>A.toScreen(p,video.videoWidth,video.videoHeight,c,W));pts=pts?next.map((p,i)=>({x:pts[i].x+(p.x-pts[i].x)*.65,y:pts[i].y+(p.y-pts[i].y)*.65,v:p.v})):next;body=A.body(pts)}

// --- The game
let game=null;
const gameTime=()=>game?((game.paused||performance.now())-game.t0-game.pausedFor)/1000:0;
const playTime=()=>gameTime()-4*spb();
function newGame(mode){return {mode,m:MODES[mode],t0:performance.now(),pausedFor:0,paused:0,phase:'ready',readySince:0,score:0,shown:0,combo:0,bestCombo:0,hits:0,tries:0,lives:3,targets:[],parts:[],pops:[],next:0,obs:null,base:null,cal:[],beat:8,flash:null,shake:0,photo:null,photoCombo:0,photoAt:0,lastBig:''}}
async function start(mode){audio();ac?.resume?.().catch(()=>{});game=newGame(mode);$('arMenu').hidden=true;$('arEnd').hidden=true;$('arHud').hidden=false;$('arPause').hidden=false;$('arPause').textContent='❚❚';$('arLives').hidden=mode!=='dodge';msg('A ligar a câmara…');resize();
 try{if(!stream)await camera()}catch{fail('Não consegui abrir a câmara. Dá autorização à câmara nas definições do navegador e tenta outra vez.');return}
 try{msg('A preparar a deteção do corpo (da primeira vez demora um pouco)…');landmarker=await root.CameraCoach.load()}catch{fail('Não consegui preparar a deteção. Da primeira vez é preciso internet.');return}
 if(!game||game.mode!==mode)return;try{wake=await navigator.wakeLock?.request('screen')}catch{}audio();ac?.resume?.().catch(()=>{});game.t0=performance.now();game.phase='ready';loop()}
function fail(text){game=null;stopCamera();stopMusic();$('arHud').hidden=true;$('arPause').hidden=true;msg('');menu(text)}
function msg(t){$('arMsg').textContent=t;$('arMsg').hidden=!t}
function big(t,cls=''){const el=$('arBig');el.textContent=t;el.className='arena-big '+cls;void el.offsetWidth;el.classList.add('show')}

function loop(){cancelAnimationFrame(frame);const step=()=>{if(!game||!dialog.open)return;readPose();if(!game.paused)update();if(!game||game.phase==='end')return;draw();frame=requestAnimationFrame(step)};frame=requestAnimationFrame(step)}

function update(){const g=game,need=g.m.need,seen=body&&(need==='full'?body.full:true);
 if(g.phase==='ready'){if(!seen){g.readySince=0;g.t0=performance.now();g.pausedFor=0;msg(need==='full'?'Afasta-te até se ver o corpo todo, da cabeça aos joelhos.':'Põe-te de frente. Tem de se ver a cabeça, os ombros e as mãos.');return}
  if(!g.readySince){g.readySince=performance.now();msg('Assim mesmo! Fica parado…')}if(performance.now()-g.readySince<900)return;g.phase='count';g.t0=performance.now();g.pausedFor=0;msg('');startMusic();g.lastBig='';return}
 const T=playTime(),k=Math.floor(gameTime()/spb());
 if(g.phase==='count'){if(body&&g.mode==='dodge')g.cal.push({sy:body.sy,cx:body.cx,torso:body.torso,sw:body.sw});const left=4-k;if(left>=1&&String(left)!==g.lastBig){g.lastBig=String(left);if(left<4){big(String(left));sfx.beep()}}if(T>=0){g.phase='play';big('JÁ!','go');sfx.go();vib(60);if(g.mode==='dodge'){const c=g.cal.length?g.cal:[{sy:body?.sy||H*.35,cx:body?.cx||W/2,torso:body?.torso||H*.25,sw:body?.sw||W*.15}],avg=key=>c.reduce((n,x)=>n+x[key],0)/c.length;g.base={sy:avg('sy'),cx:avg('cx'),torso:avg('torso'),sw:avg('sw')};g.next=.8}else g.next=.4}return}
 if(g.phase!=='play')return;
 if(T>=LENGTH&&!(g.mode==='box'&&g.targets.length)){end();return}
 if(g.mode==='hunt')hunt(T);else if(g.mode==='dodge')dodge(T);else boxing(T);
 if(g.mode==='dodge'&&g.lives<=0)end()}

// Hunt: orbs appear within reach; hands pop them.
function spot(r){const b=body;for(let i=0;i<14;i++){let x,y;if(b){const a=(-200+Math.random()*220)*Math.PI/180,d=b.sw*1.9*(.55+Math.random()*.5);x=b.sx+Math.cos(a)*d;y=b.sy+Math.sin(a)*d}else{x=r+Math.random()*(W-2*r);y=90+Math.random()*(H*.7)}x=Math.max(r+8,Math.min(W-r-8,x));y=Math.max(r+84,Math.min(H-r-8,y));const near=game.targets.some(t=>Math.hypot(t.x-x,t.y-y)<t.r+r+12)||(b?.hands||[]).some(h=>Math.hypot(h.x-x,h.y-y)<r*2.2);if(!near)return {x,y}}return null}
function hunt(T){const g=game,alive=T<30?3:4;if(T>=g.next&&g.targets.length<alive){const r=Math.max(30,Math.min(68,(body?.sw||110)*.42)),p=spot(r);if(p){const roll=Math.random(),type=T>8&&roll<.15?'bomb':roll>.87?'gold':'ball';g.targets.push({...p,r,type,born:T,life:Math.max(1.6,2.7-T*.017)})}g.next=T+Math.max(.42,1-T*.009)}
 for(const t of [...g.targets]){if(T-t.born>t.life){remove(t);if(t.type!=='bomb'){g.tries++;if(g.combo>=3)pop(t.x,t.y,'Fugiu…','#9aa');g.combo=0}continue}if((body?.hands||[]).some(h=>Math.hypot(h.x-t.x,h.y-t.y)<t.r+16)){remove(t);if(t.type==='bomb'){g.score=Math.max(0,g.score-30);g.combo=0;sfx.bomb();vib([120,60,200]);burst(t.x,t.y,'255,80,60',26);pop(t.x,t.y,'−30','#ff6a55');g.flash={c:'255,40,40',at:T};g.shake=T}else{g.tries++;g.hits++;g.combo++;const pts=(t.type==='gold'?30:10)*A.mult(g.combo);g.score+=pts;g.bestCombo=Math.max(g.bestCombo,g.combo);t.type==='gold'?sfx.gold():sfx.hit(g.combo);vib(25);burst(t.x,t.y,t.type==='gold'?'255,210,80':g.m.rgb,t.type==='gold'?28:18);pop(t.x,t.y,'+'+pts,t.type==='gold'?'#ffd257':g.m.color);combo(T);snap(T)}}}}
// Dodge: one obstacle at a time; do the move before it arrives.
const OBS={duck:'⬇ AGACHA!',left:'PARA A DIREITA ➡',right:'⬅ PARA A ESQUERDA',up:'⬆ MÃOS AO ALTO!',wide:'↔ BRAÇOS ABERTOS!'};
function dodge(T){const g=game;if(!g.obs&&T>=g.next){const types=Object.keys(OBS).filter(t=>t!==g.lastObs),type=types[Math.floor(Math.random()*types.length)],travel=Math.max(1.2,1.9-T*.012);g.lastObs=type;g.obs={type,born:T,arrive:T+travel,ok:false};vib(15)}
 const o=g.obs;if(!o)return;if(T>=o.arrive-.45&&A.dodgeOk(o.type,body,g.base))o.ok=true;
 if((o.ok&&T>=o.arrive-.1)||T>o.arrive+.18){g.tries++;if(o.ok){g.hits++;g.combo++;if(o.type==='duck')g.ducks=(g.ducks||0)+1;g.bestCombo=Math.max(g.bestCombo,g.combo);const pts=20*A.mult(g.combo);g.score+=pts;sfx.hit(g.combo);vib(30);pop(W/2,H*.42,'BOA! +'+pts,g.m.color);burst(W/2,H*.5,g.m.rgb,22);g.flash={c:'90,240,160',at:T};combo(T);snap(T)}else{g.lives--;g.combo=0;sfx.fail();vib([150,80,150]);pop(W/2,H*.42,g.lives?'AI! −1 ❤':'ACABOU!','#ff6a55');g.flash={c:'255,40,40',at:T};g.shake=T}g.obs=null;g.next=T+Math.max(.45,1.1-T*.008)}}
// Boxing: targets land on the beat; punch while the ring closes.
function boxing(T){const g=game,s=spb();while(true){const beatT=g.beat*s-4*s;if(beatT>LENGTH-.5||beatT-2*s>T)break;const every=T<20?2:1;if(g.beat%every===0){const sides=T>38&&g.beat%4===0?['l','r']:[Math.random()<.5?'l':'r'];for(const side of sides){const b=body,sw=b?.sw||W*.16,cx=b?.sx||W/2,sy=b?.sy||H*.45,torso=b?.torso||H*.25,r=Math.max(32,Math.min(64,sw*.45)),dir=side==='l'?-1:1,x=Math.max(r+8,Math.min(W-r-8,cx+dir*sw*(1.25+Math.random()*.45))),y=Math.max(r+84,Math.min(H-r-8,sy-torso*(.1+Math.random()*.4)));g.targets.push({x,y,r,type:'box',hit:beatT,born:beatT-2*s})}}g.beat++}
 const now=T-latency();for(const t of [...g.targets]){const dt=(now-t.hit)*1000;if(dt>220){remove(t);g.tries++;g.combo=0;pop(t.x,t.y,'Falhou','#9aa');continue}if(dt<-320)continue;if((body?.hands||[]).some(h=>Math.hypot(h.x-t.x,h.y-t.y)<t.r+14)){remove(t);g.tries++;g.hits++;g.combo++;g.bestCombo=Math.max(g.bestCombo,g.combo);const [label,base]=A.judge(dt),pts=base*A.mult(g.combo);g.score+=pts;sfx.hit(g.combo);vib(30);burst(t.x,t.y,label==='PERFEITO!'?'255,210,80':g.m.rgb,label==='PERFEITO!'?26:16);pop(t.x,t.y,label+' +'+pts,label==='PERFEITO!'?'#ffd257':g.m.color);combo(T);snap(T)}}}
const remove=t=>{const i=game.targets.indexOf(t);if(i>=0)game.targets.splice(i,1)};
function combo(T){const c=game.combo;if(c>0&&c%10===0){big('COMBO ×'+c+'!','combo');sfx.win()}}
// The action photo: a mirrored frame taken at the best moment of the game.
function snap(T){const g=game;if(g.combo<3||g.combo<=g.photoCombo||T-g.photoAt<1.5||!video.videoWidth)return;g.photoCombo=g.combo;g.photoAt=T;try{const c=document.createElement('canvas'),w=480,h=600,vw=video.videoWidth,vh=video.videoHeight,s=Math.max(w/vw,h/vh);c.width=w;c.height=h;const x=c.getContext('2d');x.translate(w,0);x.scale(-1,1);x.drawImage(video,(w-vw*s)/2,(h-vh*s)/2,vw*s,vh*s);g.photo=c}catch{}}
function burst(x,y,rgb,n){if(calm)n=Math.min(n,6);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=120+Math.random()*320;game.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,born:performance.now(),life:500+Math.random()*400,rgb,size:3+Math.random()*5})}}
const pop=(x,y,text,color)=>game.pops.push({x,y,text,color,born:performance.now()});

// --- Drawing
function draw(){const g=game;ctx.clearRect(0,0,W,H);if(!g)return;const T=g.phase==='play'?playTime():0,now=performance.now();ctx.save();if(g.shake&&T-g.shake<.3&&!calm){const k=(1-(T-g.shake)/.3)*10;ctx.translate((Math.random()-.5)*k,(Math.random()-.5)*k)}
 const v=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 if(g.phase==='ready')guide();
 skeleton(g.m);
 if(g.mode==='dodge'&&g.obs)obstacle(g.obs,T);
 for(const t of g.targets)target(t,T);
 for(const p of [...g.parts]){const a=(now-p.born)/p.life;if(a>=1){g.parts.splice(g.parts.indexOf(p),1);continue}const dt=(now-p.born)/1000;ctx.fillStyle=`rgba(${p.rgb},${1-a})`;ctx.beginPath();ctx.arc(p.x+p.vx*dt,p.y+p.vy*dt+260*dt*dt,p.size*(1-a*.6),0,Math.PI*2);ctx.fill()}
 ctx.textAlign='center';ctx.textBaseline='middle';for(const p of [...g.pops]){const a=(now-p.born)/900;if(a>=1){g.pops.splice(g.pops.indexOf(p),1);continue}ctx.globalAlpha=1-a;ctx.font=`800 ${Math.round(26+10*(1-a))}px 'Barlow Condensed',system-ui,sans-serif`;ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.strokeText(p.text,p.x,p.y-50*a);ctx.fillStyle=p.color;ctx.fillText(p.text,p.x,p.y-50*a);ctx.globalAlpha=1}
 if(g.flash&&T-g.flash.at<.35){ctx.fillStyle=`rgba(${g.flash.c},${.28*(1-(T-g.flash.at)/.35)})`;ctx.fillRect(-20,-20,W+40,H+40)}
 ctx.restore();hud(T)}
function guide(){const need=game.m.need,ok=!!body&&(need==='full'?body.full:true);ctx.save();ctx.setLineDash([10,10]);ctx.lineWidth=3;ctx.strokeStyle=ok?'rgba(120,255,160,.9)':'rgba(255,255,255,.55)';const h=need==='full'?H*.78:H*.55,w=h*.42,x=W/2,y=need==='full'?H*.12:H*.2;ctx.beginPath();ctx.arc(x,y+w*.32,w*.24,0,Math.PI*2);ctx.moveTo(x-w*.5,y+w*.75);ctx.lineTo(x+w*.5,y+w*.75);ctx.lineTo(x+w*.42,y+h*.55);ctx.lineTo(x+w*.3,y+h);ctx.moveTo(x-w*.5,y+w*.75);ctx.lineTo(x-w*.42,y+h*.55);ctx.lineTo(x-w*.3,y+h);ctx.stroke();ctx.restore()}
const BONES=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
function skeleton(m){if(!pts)return;ctx.lineCap='round';for(const [w,a] of [[14,.18],[5,.95]]){ctx.lineWidth=w;ctx.strokeStyle=`rgba(${m.rgb},${a})`;ctx.beginPath();for(const [i,j] of BONES)if(pts[i].v>.4&&pts[j].v>.4){ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y)}ctx.stroke()}
 for(const h of body?.hands||[]){const gr=ctx.createRadialGradient(h.x,h.y,2,h.x,h.y,30);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.35,`rgba(${m.rgb},.7)`);gr.addColorStop(1,`rgba(${m.rgb},0)`);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(h.x,h.y,30,0,Math.PI*2);ctx.fill()}}
function orb(x,y,r,rgb,core='255,255,255'){r=Math.max(2,r);const gr=ctx.createRadialGradient(x-r*.3,y-r*.35,r*.1,x,y,r*1.5);gr.addColorStop(0,`rgba(${core},1)`);gr.addColorStop(.35,`rgba(${rgb},1)`);gr.addColorStop(.7,`rgba(${rgb},.55)`);gr.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r*1.5,0,Math.PI*2);ctx.fill()}
function target(t,T){const g=game;if(t.type==='box'){const s=spb(),p=Math.max(0,Math.min(1,(T-latency()-t.born)/(t.hit-t.born))),ring=t.r*(1+2.2*(1-p));orb(t.x,t.y,t.r*.85,g.m.rgb);ctx.lineWidth=4;ctx.strokeStyle=`rgba(255,255,255,${.35+.6*p})`;ctx.beginPath();ctx.arc(t.x,t.y,ring,0,Math.PI*2);ctx.stroke();ctx.font=`${Math.round(t.r*.8)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🥊',t.x,t.y+2);return}
 const age=(T-t.born)/t.life,pulse=calm?1:1+Math.sin(T*9+t.x)*.05,r=t.r*pulse*(age<.12?age/.12:1)*(age>.8?1-(age-.8)*1.5:1);
 if(t.type==='bomb'){orb(t.x,t.y,r,'230,40,40','255,160,140');ctx.font=`${Math.round(r*1.1)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('💣',t.x,t.y+2)}else{orb(t.x,t.y,r,t.type==='gold'?'255,200,60':g.m.rgb);if(t.type==='gold'){ctx.font=`${Math.round(r*.9)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⭐',t.x,t.y+2)}}
 ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(t.x,t.y,r+6,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-age));ctx.stroke()}
function obstacle(o,T){const g=game,b=g.base,p=Math.max(0,Math.min(1,(T-o.born)/(o.arrive-o.born))),e=p*p,s=.3+.7*e,alpha=.25+.6*e,red=o.ok?'90,240,160':'255,70,90';ctx.save();ctx.globalAlpha=alpha;
 if(o.type==='duck'){const y=b.sy-b.torso*.35,h=Math.max(16,b.torso*.32)*s,w=W*s;const gr=ctx.createLinearGradient(0,y-h,0,y+h);gr.addColorStop(0,`rgba(${red},0)`);gr.addColorStop(.5,`rgba(${red},.95)`);gr.addColorStop(1,`rgba(${red},0)`);ctx.fillStyle=gr;ctx.fillRect(W/2-w/2,y-h,w,h*2);ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(W/2-w/2,y-2,w,4)}
 else if(o.type==='left'||o.type==='right'){const edge=o.type==='left'?0:W,to=b.cx+(o.type==='left'?1:-1)*b.sw*.25,x0=Math.min(edge,to),w=Math.abs(to-edge);ctx.save();ctx.translate(W/2,H/2);ctx.scale(s,s);ctx.translate(-W/2,-H/2);ctx.fillStyle=`rgba(${red},.55)`;ctx.fillRect(x0,0,w,H);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=8;ctx.beginPath();for(let k=-H;k<w+H;k+=40){ctx.moveTo(x0+k,0);ctx.lineTo(x0+k-H,H)}ctx.save();ctx.beginPath();ctx.rect(x0,0,w,H);ctx.clip();ctx.stroke();ctx.restore();ctx.restore()}
 else if(o.type==='up'){for(const d of [-1,1])ring(b.cx+d*b.sw*.35,b.sy-b.torso*1.25,26*s+10,red)}
 else for(const d of [-1,1])ring(b.cx+d*b.sw*1.8,b.sy,26*s+10,red);
 ctx.globalAlpha=Math.min(1,alpha+.3);ctx.font=`800 ${Math.round(30+18*e)}px 'Barlow Condensed',system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,0,.6)';const ty=o.type==='duck'?b.sy-b.torso*.9:H*.3;ctx.strokeText(OBS[o.type],W/2,ty);ctx.fillStyle=o.ok?'#7dffb0':'#fff';ctx.fillText(OBS[o.type],W/2,ty);
 ctx.lineWidth=6;ctx.strokeStyle=`rgba(${red},.9)`;ctx.beginPath();ctx.arc(W/2,ty+44,16,-Math.PI/2,-Math.PI/2+Math.PI*2*p);ctx.stroke();ctx.restore()}
function ring(x,y,r,rgb){ctx.lineWidth=6;ctx.strokeStyle=`rgba(${rgb},.95)`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.fillStyle=`rgba(${rgb},.18)`;ctx.fill()}
function hud(T){const g=game;if(g.shown<g.score)g.shown=Math.min(g.score,g.shown+Math.max(1,Math.ceil((g.score-g.shown)/6)));else g.shown=g.score;$('arScore').textContent=g.shown;const left=g.phase==='play'?Math.max(0,LENGTH-T):LENGTH;$('arTime').textContent=Math.ceil(left);$('arRing').style.strokeDashoffset=String(119.4*(1-left/LENGTH));$('arTime').parentElement.classList.toggle('hurry',g.phase==='play'&&left<=10);
 const c=g.combo>=2?`×${A.mult(g.combo)} · ${g.combo} seguidos`:'';if($('arCombo').textContent!==c)$('arCombo').textContent=c;const l='❤'.repeat(Math.max(0,g.lives))+'♡'.repeat(Math.max(0,3-g.lives));if(g.mode==='dodge'&&$('arLives').textContent!==l)$('arLives').textContent=l}

// --- End of a game: results, records, history, the photo and the card to share
function end(){const g=game;if(!g||g.phase==='end')return;g.phase='end';stopMusic();cancelAnimationFrame(frame);stopCamera();ctx.clearRect(0,0,W,H);sfx.win();vib([80,60,80,60,200]);
 const secs=Math.round(Math.min(LENGTH,Math.max(0,playTime()))),kcal=A.kcal(g.m.met,weight(),secs),a=arena(),best=a.best[g.mode]||0,record=g.score>best&&g.score>0,player=(local('cal_ui_arena_name','')||'Eu').slice(0,15),entry={name:player,score:g.score,date:new Date().toISOString().slice(0,10)},{list,pos}=A.top(a.top[g.mode],entry);
 const x=extra();x.arena={...a,best:{...a.best,[g.mode]:Math.max(best,g.score)},top:{...a.top,[g.mode]:list},plays:(a.plays||0)+1,seconds:(a.seconds||0)+secs,kcal:(a.kcal||0)+kcal};saveExtra(x);
 if(secs>=20){try{saveRun({id:'arena-'+Date.now(),name:'Arena: '+g.m.name,startedAt:Date.now()-secs*1000,records:g.ducks?[{id:'Bodyweight_Squat',unit:'reps',reps:g.ducks,weight:0}]:[]})}catch{}}
 const acc=g.tries?Math.round(g.hits/g.tries*100):0,photo=g.photo?g.photo.toDataURL('image/jpeg',.85):'';g.result={secs,kcal,record,best,acc,pos,photo,player};
 $('arHud').hidden=true;$('arPause').hidden=true;msg('');const e=$('arEnd');e.hidden=false;
 e.innerHTML=`${record&&!calm?confetti():''}<div class="arena-card arena-end"><p class="arena-kicker">${g.m.icon} ${esc(g.m.name)}</p><p class="arena-final" id="arFinal">0</p><p class="arena-unit">pontos</p>${record?'<p class="arena-record">🏆 NOVO RECORDE!</p>':`<p class="arena-unit">O teu recorde: ${best}</p>`}<p class="arena-rank">${esc(A.rank(g.score,g.m.levels))}${pos&&list.length>1?` · ${pos}.º no placar`:''}</p>
 <div class="arena-stats"><div><strong>${g.hits}</strong><small>${g.mode==='dodge'?'passados':'acertos'}</small></div><div><strong>${g.bestCombo}</strong><small>melhor sequência</small></div><div><strong>${acc}%</strong><small>precisão</small></div><div><strong>${kcal}</strong><small>kcal</small></div></div>
 ${photo?`<figure class="arena-photo"><img src="${photo}" alt="A tua foto de ação"><figcaption>📸 A tua foto de ação</figcaption></figure>`:''}
 <div class="arena-actions"><button type="button" class="primary" id="arAgain">↻ Jogar outra vez</button><button type="button" class="secondary" id="arShare">📤 Partilhar o cartão</button><button type="button" class="secondary" id="arBack">Outro jogo</button></div>${secs>=20?'<p class="arena-note">✓ Ficou guardado no histórico de treinos.</p>':''}</div>`;
 const fin=$('arFinal'),t0=performance.now(),run=()=>{const k=Math.min(1,(performance.now()-t0)/1100);fin.textContent=Math.round(g.score*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(run)};run();
 $('arAgain').onclick=()=>start(g.mode);$('arBack').onclick=()=>{game=null;menu()};$('arShare').onclick=()=>shareCard(g)}
function confetti(){const colors=['#c6f25a','#5ad1f2','#ff7a59','#ffd257','#ffffff'];return `<div class="arena-confetti" aria-hidden="true">${Array.from({length:60},(_,i)=>`<i style="--x:${Math.round(Math.random()*100)}%;--d:${(1.8+Math.random()*1.8).toFixed(2)}s;--w:${(Math.random()*.8).toFixed(2)}s;--r:${Math.round(Math.random()*720-360)}deg;background:${colors[i%colors.length]}"></i>`).join('')}</div>`}
async function shareCard(g){const r=g.result,c=document.createElement('canvas'),w=1080,h=1350;c.width=w;c.height=h;const x=c.getContext('2d');const bg=x.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#05070a');bg.addColorStop(1,`rgba(${g.m.rgb},.55)`);x.fillStyle='#05070a';x.fillRect(0,0,w,h);x.fillStyle=bg;x.fillRect(0,0,w,h);
 if(r.photo){const img=new Image();img.src=r.photo;try{await img.decode()}catch{}x.save();x.beginPath();x.roundRect?x.roundRect(90,250,900,700,40):x.rect(90,250,900,700);x.clip();const s=Math.max(900/img.width,700/img.height);x.drawImage(img,90+(900-img.width*s)/2,250+(700-img.height*s)/2,img.width*s,img.height*s);const sh=x.createLinearGradient(0,600,0,950);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.85)');x.fillStyle=sh;x.fillRect(90,250,900,700);x.restore();x.lineWidth=8;x.strokeStyle=g.m.color;x.beginPath();x.roundRect?x.roundRect(90,250,900,700,40):x.rect(90,250,900,700);x.stroke()}
 x.textAlign='center';x.fillStyle='#fff';x.font="800 64px 'Barlow Condensed',system-ui,sans-serif";x.fillText('🎮 ARENA · '+g.m.name.toUpperCase(),w/2,160);x.fillStyle=g.m.color;x.font="800 240px 'Barlow Condensed',system-ui,sans-serif";x.fillText(String(g.score),w/2,r.photo?900:640);x.fillStyle='#fff';x.font="600 54px 'DM Sans',system-ui,sans-serif";x.fillText(r.record?'🏆 NOVO RECORDE!':'pontos',w/2,r.photo?1040:760);
 x.font="500 44px 'DM Sans',system-ui,sans-serif";x.fillStyle='rgba(255,255,255,.85)';x.fillText(`${g.hits} ${g.mode==='dodge'?'passados':'acertos'} · sequência ${g.bestCombo} · ${r.kcal} kcal`,w/2,r.photo?1130:880);x.fillText('Consegues bater? 💪',w/2,r.photo?1230:1000);
 const text=`Fiz ${g.score} pontos na Arena (${g.m.name}) 🎮💪 Consegues bater?`;
 c.toBlob(async blob=>{const file=blob&&new File([blob],'arena.png',{type:'image/png'});try{if(file&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],text});return}if(navigator.share){await navigator.share({text});return}}catch(e){if(e?.name==='AbortError')return}if(file){const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download='arena.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('Cartão guardado nas transferências.')}},'image/png')}

// --- Menu
function menu(error){$('arHud').hidden=true;$('arPause').hidden=true;$('arEnd').hidden=true;msg('');const a=arena(),m=$('arMenu');m.hidden=false;
 m.innerHTML=`<div class="arena-card arena-menu"><p class="arena-kicker">🎮 ARENA</p><h2>O teu corpo é o comando</h2>${error?`<p class="arena-error">${esc(error)}</p>`:''}<div class="arena-modes">${Object.entries(MODES).map(([k,x])=>`<button type="button" class="arena-mode" data-go="${k}" style="--c:${x.color}"><span class="arena-mode-icon" aria-hidden="true">${x.icon}</span><span><strong>${esc(x.name)}</strong><small>${esc(x.about)}</small><small class="arena-how">📱 ${esc(x.how)}</small></span><b>${a.best[k]?'🏆 '+a.best[k]:'▶'}</b></button>`).join('')}</div>
 <div class="arena-opts"><label class="arena-name">Jogador<input id="arName" maxlength="15" value="${esc(local('cal_ui_arena_name',''))}" placeholder="O teu nome"></label><label class="arena-switch"><input type="checkbox" id="arMusic" ${musicOn?'checked':''}> 🎵 Música</label></div>
 <details class="arena-tips"><summary>Como pôr o telemóvel</summary><ul><li>Encosta o telemóvel a uns livros ou a uma garrafa, com a câmara da frente virada para ti.</li><li>Afasta-te até te veres no ecrã. Boa luz ajuda muito.</li><li>Tira coisas do caminho: vais mexer-te a sério!</li><li>A imagem fica só no telemóvel. Nada é gravado nem enviado.</li></ul></details>
 ${Object.keys(a.top||{}).some(k=>a.top[k]?.length)?`<details class="arena-tips"><summary>🏅 Placar</summary>${Object.entries(MODES).filter(([k])=>a.top[k]?.length).map(([k,x])=>`<p><strong>${x.icon} ${esc(x.name)}</strong></p><ol>${a.top[k].map(e=>`<li>${esc(e.name)} — <strong>${e.score}</strong></li>`).join('')}</ol>`).join('')}</details>`:''}</div>`;
 m.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>start(b.dataset.go));$('arName').oninput=()=>setLocal('cal_ui_arena_name',$('arName').value.trim());$('arMusic').onchange=()=>{musicOn=$('arMusic').checked;setLocal('cal_ui_arena_music',musicOn)}}

function open(mode){if(!window.CameraCoach?.supported?.()){toast('Este telemóvel não deixa usar a câmara aqui.');return}if(!dialog.open)dialog.showModal();try{$('arStage').requestFullscreen?.().catch(()=>{})}catch{}resize();if(mode)start(mode);else menu()}
function close(){game=null;cancelAnimationFrame(frame);stopMusic();stopCamera();if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});if(dialog.open)dialog.close();renderHome()}
$('arClose').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close()});dialog.addEventListener('close',()=>{if(!dialog.open&&(stream||game))close()});
function pause(on){const g=game;if(!g||g.phase==='end'||g.phase==='ready')return;if(on&&!g.paused){g.paused=performance.now();stopMusic();$('arPause').textContent='▶';msg('Em pausa. Toca em ▶ para continuar.')}else if(!on&&g.paused){g.pausedFor+=performance.now()-g.paused;g.paused=0;$('arPause').textContent='❚❚';msg('');startMusic()}}
$('arPause').onclick=()=>pause(!game?.paused);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true)});
window.Arena={open,close,state:()=>game};
return {open};
};
if(typeof module!=='undefined')module.exports=A;
})(typeof window!=='undefined'?window:globalThis);
