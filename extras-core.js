(function(root){
'use strict';
// Pure helpers for the workout extras: timing, gear, lighter or quieter sessions, records and small estimates.
const runDefaults={auto:true,tap:true,vibrate:true,sound:true,count:false,tempo:3,water:true,breathe:true,motivate:true,warmup:true,quiet:false,headset:false,checkin:true,huge:false,smartRest:true};
function runPrefs(v={}){if(!v||typeof v!=='object')v={};const out={};for(const [k,d] of Object.entries(runDefaults))out[k]=typeof d==='boolean'?(typeof v[k]==='boolean'?v[k]:d):d;out.tempo=[2,3,4].includes(Number(v.tempo))?Number(v.tempo):3;return out}
const extraDefaults=()=>({checkins:[],tests:[],challenge:null,challenges:[],program:null,duels:[],skills:[]});
const isJumpy=e=>!!e&&(e.category==='plyometrics'||/jump|hop|skip|burpee|jack|bound|leap|sprint/i.test(e.name||''));
// Seconds of work for one set: holds count their own time, repetitions about three seconds each plus setting up.
const work=i=>i.unit==='s'?i.reps:i.reps*3+5;
function remaining(items,index=0,set=0){let total=0;items.forEach((i,k)=>{if(k<index)return;const sets=Math.max(0,k===index?i.sets-set:i.sets);total+=sets*work(i)+Math.max(0,sets-(k===items.length-1?1:0))*i.rest});return total}
const estimate=items=>remaining(items,0,0);
// Fit a session into the time available: fewer sets first, then shorter rests, then drop the last exercises.
function fit(items,minutes){let out=items.map(i=>({...i}));const target=minutes*60;
 while(estimate(out)>target){const pick=out.reduce((best,i,k)=>i.sets>1&&(best<0||i.sets>=out[best].sets)?k:best,-1);if(pick<0)break;out[pick].sets--}
 if(estimate(out)>target)out=out.map(i=>({...i,rest:Math.max(20,Math.min(i.rest,Math.round(i.rest*.7/5)*5))}));
 while(out.length>2&&estimate(out)>target)out.pop();
 return out}
const lighten=items=>items.map(i=>({...i,sets:i.sets>=3?i.sets-1:i.sets,reps:Math.max(1,Math.round(i.reps*.8))}));
const calm={quadriceps:['Bodyweight_Squat','Bodyweight_Walking_Lunge'],hamstrings:['Butt_Lift_Bridge','Single_Leg_Glute_Bridge'],glutes:['Butt_Lift_Bridge','Glute_Kickback'],calves:['Standing_Calf_Raises','Calf_Stretch_Hands_Against_Wall'],chest:['Pushups','Incline_Push-Up'],shoulders:['Arm_Circles','Pushups'],triceps:['Bench_Dips','Incline_Push-Up_Close-Grip'],abdominals:['Plank','Reverse_Crunch'],adductors:['Side_Leg_Raises'],abductors:['Side_Leg_Raises']};
const holds=new Set(['Plank','Calf_Stretch_Hands_Against_Wall','Arm_Circles']);
// Swap exercises with jumps for a calm one that works the same area.
function quiet(items,byId){const used=new Set(items.map(i=>i.id));let swapped=0;const out=items.map(i=>{const e=byId.get(i.id);if(!isJumpy(e))return i;const pool=(calm[e.primaryMuscles?.[0]]||['Bodyweight_Squat','Plank']).filter(id=>byId.has(id));const id=pool.find(id=>!used.has(id))||pool[0];if(!id)return i;used.add(id);swapped++;return holds.has(id)?{...i,id,unit:'s',reps:30}:{...i,id,unit:'reps',reps:Math.min(i.unit==='s'?10:i.reps,15)}});return {items:out,swapped}}
const warmupItems=()=>[['Arm_Circles',30,'s'],['Standing_Hip_Circles',30,'s'],['Knee_Circles',20,'s'],['Inchworm',5,'reps']].map(([id,reps,unit])=>({id,sets:1,reps,rest:5,unit,warmup:true}));
// Things to have at hand for a session, guessed from the exercises.
function gear(items,byId){const out=new Set();for(const i of items){const e=byId.get(i.id);if(!e)continue;const n=e.name||'';
 if(/pull-?up|chin|hang|muscle.?up|lever|scapular/i.test(n))out.add('Barra fixa');else if(/inverted row|mid row|suspended row/i.test(n))out.add('Barra baixa segura');
 if(/band/i.test(n)||e.equipment==='bands')out.add('Elástico');if(/dip/i.test(n)&&!/bench/i.test(n))out.add('Paralelas ou apoios firmes');if(/bench dip|incline push|step-?up|box/i.test(n))out.add('Banco ou apoio firme');if(/chair/i.test(n))out.add('Cadeira');if(/wall|handstand/i.test(n))out.add('Parede livre');
 const label={dumbbell:'Halteres',kettlebells:'Kettlebell',barbell:'Barra de pesos',cable:'Polia',machine:'Máquina','medicine ball':'Bola medicinal','exercise ball':'Bola de Pilates','e-z curl bar':'Barra EZ','foam roll':'Rolo de espuma'}[e.equipment];if(label)out.add(label);
 if(/plank|crunch|sit-?up|bridge|leg raise|lying|floor|superman|stretch|pose|bird|twist|kick|climber|inchworm|push-?up|hollow|l-sit/i.test(n)&&e.equipment!=='machine')out.add('Tapete')}
 return [...out]}
const best=(history,id,unit,weight=0)=>Math.max(0,...history.flatMap(h=>h.sets.filter(s=>s.id===id&&s.unit===unit&&Number(s.weight||0)===Number(weight||0)).map(s=>s.reps)));
// A set that fell short or felt hard earns a little more rest, never more than a minute extra.
function restFor(item,reps,effort,smart=true){if(!smart||item.warmup)return item.rest;if(reps<item.reps*.8||effort==='hard')return Math.min(item.rest+60,Math.max(item.rest+10,Math.round(item.rest*1.3/5)*5));return item.rest}
// Rough energy estimate from the effort recorded (MET values for bodyweight training).
function kcal(records,seconds,kg=70){if(!records.length||!seconds)return 0;const met={easy:3.5,moderate:5,hard:7},avg=records.reduce((n,r)=>n+(met[r.effort]||5),0)/records.length;return Math.round(avg*kg*seconds/3600)}
const tempo=(note,fallback=3)=>note?Math.max(1,(note.down||0)+(note.hold||0)+(note.up||0)):fallback;
// A few seconds of almost silent sound keep a media session alive for headphone buttons.
function silentWav(seconds=6,rate=8000){const n=seconds*rate,b=new Uint8Array(44+n),v=new DataView(b.buffer),s=(o,t)=>{for(let i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i)};s(0,'RIFF');v.setUint32(4,36+n,true);s(8,'WAVE');s(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate,true);v.setUint16(32,1,true);v.setUint16(34,8,true);s(36,'data');v.setUint32(40,n,true);for(let i=0;i<n;i++)b[44+i]=128+(i&1);let bin='';for(let i=0;i<b.length;i+=8192)bin+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return 'data:audio/wav;base64,'+btoa(bin)}
// An easier variation for when something hurts: known regressions first, then a simpler move for the same muscles with the material at hand.
const regressions={Pushups:'Incline_Push-Up','Push-Ups_With_Feet_Elevated':'Pushups','Decline_Push-Up':'Pushups','Single-Arm_Push-Up':'Pushups','Push-Ups_-_Close_Triceps_Position':'Incline_Push-Up_Close-Grip','Push-Up_Wide':'Incline_Push-Up_Wide',Clock_Push_Up:'Pushups',Pullups:'Band_Assisted_Pull-Up','Chin-Up':'Band_Assisted_Pull-Up','Band_Assisted_Pull-Up':'Inverted_Row','Scapular_Pull-Up':'Band_Pull_Apart',Inverted_Row:'Band_Pull_Apart',Muscle_Up:'Pullups','Dips_-_Triceps_Version':'Bench_Dips',Parallel_Bar_Dip:'Bench_Dips','Handstand_Push-Ups':'Push-Ups_With_Feet_Elevated',Hanging_Leg_Raise:'Flat_Bench_Lying_Leg_Raise',Bodyweight_Walking_Lunge:'Bodyweight_Squat',Single_Leg_Glute_Bridge:'Butt_Lift_Bridge','Single-Leg_High_Box_Squat':'Bodyweight_Squat',Crunches:'Reverse_Crunch',Russian_Twist:'Plank'};
function easier(e,data,used=new Set){if(!e)return null;const byId=new Map(data.map(x=>[x.id,x])),known=byId.get(regressions[e.id]);if(known&&!used.has(known.id))return known;const rank={beginner:0,intermediate:1,expert:2},home=new Set(['body only','unknown','other',e.equipment]);const list=data.filter(a=>a.id!==e.id&&!used.has(a.id)&&home.has(a.equipment)&&!isJumpy(a)&&a.category===e.category&&a.primaryMuscles.some(m=>e.primaryMuscles.includes(m))&&rank[a.level]<rank[e.level]).sort((a,b)=>rank[b.level]-rank[a.level]||a.title.localeCompare(b.title,'pt'));return list[0]||null}
const api={easier,runDefaults,runPrefs,extraDefaults,isJumpy,work,remaining,estimate,fit,lighten,quiet,warmupItems,gear,best,restFor,kcal,tempo,silentWav};
if(typeof module!=='undefined')module.exports=api;else root.ExtrasCore=api;
})(globalThis);
