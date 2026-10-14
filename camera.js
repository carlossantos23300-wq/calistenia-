(function(root){
'use strict';
// The camera counts repetitions and checks posture with an on-device pose model; frames never leave the phone.
const BASE='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14',MODEL='https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
let landmarker=null,loading=null;
async function load(){if(landmarker)return landmarker;if(!loading)loading=(async()=>{const v=await import(BASE+'/vision_bundle.mjs'),files=await v.FilesetResolver.forVisionTasks(BASE+'/wasm'),make=delegate=>v.PoseLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:MODEL,delegate},runningMode:'VIDEO',numPoses:1});try{landmarker=await make('GPU')}catch{landmarker=await make('CPU')}return landmarker})();try{return await loading}catch(e){loading=null;throw e}}
const angle=(a,b,c)=>{const ab=[a.x-b.x,a.y-b.y],cb=[c.x-b.x,c.y-b.y],m=Math.hypot(...ab)*Math.hypot(...cb);return m?Math.acos(Math.max(-1,Math.min(1,(ab[0]*cb[0]+ab[1]*cb[1])/m)))*180/Math.PI:180};
// Use the side of the body the camera sees best.
function side(lm){const L=[11,13,15,23,25,27],R=[12,14,16,24,26,28],vis=ids=>ids.reduce((n,i)=>n+(lm[i]?.visibility??0),0),s=vis(L)>=vis(R)?L:R;return {shoulder:lm[s[0]],elbow:lm[s[1]],wrist:lm[s[2]],hip:lm[s[3]],knee:lm[s[4]],ankle:lm[s[5]],seen:Math.min(...s.map(i=>lm[i]?.visibility??0))}}
// How far the hips sit below (+) or above (−) the straight shoulder–ankle line, as a share of body length.
function hipOffset(p){const dx=p.ankle.x-p.shoulder.x,dy=p.ankle.y-p.shoulder.y,len2=dx*dx+dy*dy||1,t=((p.hip.x-p.shoulder.x)*dx+(p.hip.y-p.shoulder.y)*dy)/len2,py=p.shoulder.y+t*dy;return (p.hip.y-py)/Math.sqrt(len2)}
const kinds={pushup:{joint:'elbow',down:100,up:150,posture:true},squat:{joint:'knee',down:115,up:160},plank:{hold:true,posture:true}};
function kindFor(e){const n=(e?.name||'')+' '+(e?.id||'');if(/handstand|wall|l-sit|hang|pull|chin|row|dip/i.test(n))return null;if(/pike/i.test(n))return {kind:'pushup',posture:false};if(/push-?up/i.test(n))return {kind:'pushup',posture:!/incline|decline|feet elevated/i.test(n)};if(/squat|lunge/i.test(n)&&!/jump|box|smith|barbell|machine/i.test(n))return {kind:'squat'};if(/^plank|plank$|plank /i.test(e?.name||'')||e?.id==='Plank')return {kind:'plank'};return null}
// Repetition counter: a rep is going below the low angle and back above the high one. Shallow reps earn a cue.
function counter(kind,{posture}={}){const k=kinds[kind];let phase='up',reps=0,attempt=false,low=180,cueAt=0;return {get reps(){return reps},update(p,now=Date.now()){const out={reps,angle:null,cue:null,rep:false};const cue=text=>{if(now-cueAt>4000){cueAt=now;out.cue=text}};
 if(!p||p.seen<.5){cue('Afasta o telemóvel: preciso de ver o corpo todo, de lado.');return out}
 if((posture??k.posture)){const off=hipOffset(p);if(off>.07)cue('Sobe um pouco a anca.');else if(off<-.09)cue('Baixa a anca, corpo direito.')}
 if(k.hold)return out;const a=k.joint==='elbow'?angle(p.shoulder,p.elbow,p.wrist):angle(p.hip,p.knee,p.ankle);out.angle=a;
 if(phase==='up'){if(a<k.up-25){attempt=true;low=Math.min(low,a)}if(a<k.down)phase='down';else if(attempt&&a>k.up){if(low>k.down)cue(kind==='squat'?'Desce mais, até as coxas ficarem paralelas ao chão.':'Desce mais o peito.');attempt=false;low=180}}
 else if(a>k.up){phase='up';reps++;out.reps=reps;out.rep=true;attempt=false;low=180}return out}}}
const bones=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
// A live session on a <video> with the skeleton drawn on a <canvas>.
async function session({video,canvas,kind,posture,onResult,onStatus}){onStatus?.('A ligar a câmara…');const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});video.srcObject=stream;await video.play().catch(()=>{});let stopped=false,frame=0,last=-1;const stop=()=>{stopped=true;cancelAnimationFrame(frame);stream.getTracks().forEach(t=>t.stop());video.srcObject=null};
 try{onStatus?.('A preparar a deteção (só demora da primeira vez)…');await load()}catch(e){stop();throw e}if(stopped)return {stop};onStatus?.('Pronto. Põe-te em posição.');const count=counter(kind,{posture}),ctx=canvas.getContext('2d');
 const tick=()=>{if(stopped)return;if(video.readyState>=2&&video.currentTime!==last){last=video.currentTime;const w=video.videoWidth,h=video.videoHeight;if(canvas.width!==w){canvas.width=w;canvas.height=h}const res=landmarker.detectForVideo(video,performance.now()),lm=res.landmarks?.[0];ctx.clearRect(0,0,w,h);if(lm){ctx.lineWidth=Math.max(3,w/120);ctx.lineCap='round';ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#c6f25a';for(const [a,b] of bones)if(lm[a].visibility>.4&&lm[b].visibility>.4){ctx.beginPath();ctx.moveTo(lm[a].x*w,lm[a].y*h);ctx.lineTo(lm[b].x*w,lm[b].y*h);ctx.stroke()}}onResult?.(count.update(lm?side(lm):null))}frame=requestAnimationFrame(tick)};tick();return {stop}}
const api={load,angle,side,hipOffset,counter,kindFor,session,supported:()=>!!(typeof navigator!=='undefined'&&navigator.mediaDevices?.getUserMedia)};
if(typeof module!=='undefined')module.exports=api;else root.CameraCoach=api;
})(typeof window!=='undefined'?window:globalThis);
