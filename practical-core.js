(function(root){
'use strict';
// Pure helpers for the practical features: workout queue edits, totals and calculators.

// The current exercise, once started, is split so the sets already done stay where they were.
function split(run){const cur=run.items[run.index];if(!cur||!run.set)return true;if(run.items.length>=60)return false;run.items.splice(run.index,0,{...cur,sets:run.set});cur.sets-=run.set;run.index++;run.set=0;return true}
// Queue edits during a workout: do now, move to the end, one set more or less, skip.
function runOp(run,act,i){const it=run.items[i];if(!it||i<run.index)return false;
 if(act==='plus'){if(it.sets>=20)return false;it.sets++;return true}
 if(act==='minus'){const min=i===run.index?run.set+1:1;if(it.sets<=min)return false;it.sets--;return true}
 if(act==='skip'){if(i===run.index&&run.set){it.sets=run.set;run.index++;run.set=0}else run.items.splice(i,1);return true}
 if(act==='now'||act==='end'){if(act==='now'&&i===run.index)return false;if(!split(run))return false;const k=run.items.indexOf(it);if(k<run.index)return false;run.items.splice(k,1);if(act==='now')run.items.splice(run.index,0,it);else run.items.push(it);return true}
 return false}
// Take back the last set: the record goes and the position steps back one set.
function undo(run){if(!run.records.length)return null;const rec=run.records.pop();if(run.partnerRecords?.length)run.partnerRecords.pop();if(run.set>0)run.set--;else{run.index--;run.set=run.items[run.index].sets-1}run.restUntil=0;run.restRemaining=0;return rec}
// The item a finished record belongs to (the set just done).
function lastItem(run){return run.set>0?run.items[run.index]:run.items[run.index-1]}
const totals=records=>records.reduce((t,r)=>{if(r.unit==='s')t.seconds+=r.reps;else t.reps+=r.reps;t.sets++;return t},{sets:0,reps:0,seconds:0});
// Compare with the last time the same workout was done.
function compare(history,name,records,id){const prev=history.filter(h=>h.name===name&&h.id!==id).at(-1);if(!prev)return null;const a=totals(records),b=totals(prev.sets);return {date:prev.date,reps:a.reps-b.reps,seconds:a.seconds-b.seconds,sets:a.sets-b.sets}}
// Join split parts back into one item per exercise, for saving or scheduling.
function mergeItems(items){const out=[];for(const it of items){if(it.warmup)continue;const same=out.find(o=>o.id===it.id&&o.unit===it.unit);if(same)same.sets=Math.min(20,same.sets+it.sets);else out.push({id:it.id,sets:it.sets,reps:Math.min(300,it.reps),rest:it.rest,unit:it.unit})}return out}
function summaryText({name,date=new Date(),minutes,records,title}){const lines=[`💪 Treino concluído: ${name}`,`📅 ${date.toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'})}`,`⏱ ${minutes} min · ${records.length} séries`],by=new Map();for(const r of records){const k=r.id+'|'+r.unit;if(!by.has(k))by.set(k,[]);by.get(k).push(r)}for(const [k,list] of by){const unit=list[0].unit==='s'?' s':'';lines.push(`• ${title(k.split('|')[0])}: ${list.map(r=>r.reps+unit+(r.weight?` (${r.weight} kg)`:'')).join(', ')}`)}const t=totals(records);lines.push(`Total: ${t.reps} repetições${t.seconds?` e ${t.seconds} s`:''}`);return lines.join('\n')}
// A short calm stretch after training.
const cooldown=()=>[['Shoulder_Stretch',30],['Triceps_Stretch',30],['Upper_Back_Stretch',30],['Standing_Hip_Flexors',30],['Seated_Floor_Hamstring_Stretch',30],['Calf_Stretch_Hands_Against_Wall',30]].map(([id,reps])=>({id,sets:1,reps,rest:5,unit:'s'}));
function addDays(date,n){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}

// A small seeded random generator, so generated workouts can be repeated and tested.
const rng=seed=>{let s=(seed>>>0)||1;return ()=>(s=(s*1664525+1013904223)>>>0)/4294967296};
const shuffle=(list,rand=Math.random)=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// Exercise pools for generated workouts: [id, unit, amount, jumps].
const pools={push:[['Pushups','reps',10],['Incline_Push-Up','reps',10],['Pike_Push-Up','reps',8],['Bench_Dips','reps',10],['Push_Up_to_Side_Plank','reps',6]],legs:[['Bodyweight_Squat','reps',15],['Bodyweight_Walking_Lunge','reps',10],['Butt_Lift_Bridge','reps',15],['Single_Leg_Glute_Bridge','reps',10],['Wall_Sit','s',30],['Freehand_Jump_Squat','reps',10,1]],core:[['Plank','s',30],['Crunches','reps',15],['Reverse_Crunch','reps',12],['Russian_Twist','reps',20],['Hollow_Hold','s',20],['Flutter_Kicks','reps',20],['Superman','reps',12]],pull:[['Pullups','reps',5],['Chin-Up','reps',5],['Inverted_Row','reps',8],['Dead_Hang','s',20]],cardio:[['Burpee','reps',8,1],['Mountain_Climbers','reps',20,1],['Bear_Crawl','s',30],['Inchworm','reps',6]],weights:[['Dumbbell_Squat','reps',12],['Dumbbell_Lunges','reps',10],['Bent_Over_Two-Dumbbell_Row','reps',10],['Seated_Dumbbell_Press','reps',10],['Dumbbell_Bicep_Curl','reps',12],['Side_Lateral_Raise','reps',12]]};
const zones={full:'Corpo inteiro',legs:'Pernas e glúteos',upper:'Peito, costas e braços',core:'Abdominais'};
const seconds=items=>items.reduce((n,i)=>n+i.sets*((i.unit==='s'?i.reps:i.reps*3)+i.rest),0);
function generate({zone='full',minutes=20,bar=false,dumbbells=false,quiet=false,seed=Date.now()}={},has=()=>true){const rand=rng(seed),order={full:['push','legs','core',bar?'pull':'cardio',dumbbells?'weights':'legs','push','legs','core'],legs:['legs','legs',dumbbells?'weights':'legs','core','legs','cardio'],upper:['push',bar?'pull':'push',dumbbells?'weights':'core','push',bar?'pull':'core','core'],core:['core','core','cardio','core','core','cardio']}[zone]||[],count={5:3,10:4,15:5,20:6,30:7,45:8}[minutes]||5,rest=minutes<=10?30:minutes<=20?45:60,bags={};
 for(const k in pools)bags[k]=shuffle(pools[k].filter(p=>has(p[0])&&!(quiet&&p[3])&&(k!=='weights'||zone!=='legs'||/Squat|Lunge/.test(p[0]))),rand);
 const items=[];for(let i=0;items.length<count&&i<order.length*3;i++){const bag=bags[order[i%order.length]];const pick=bag?.find(p=>!items.some(x=>x.id===p[0]));if(pick)items.push({id:pick[0],sets:3,reps:pick[2],rest,unit:pick[1]})}
 const limit=minutes*60;while(seconds(items)>limit*1.05){const big=items.reduce((a,b)=>b.sets>a.sets?b:a,items[0]);if(big&&big.sets>1)big.sets--;else if(items.length>2)items.pop();else break}
 for(let k=0;seconds(items)<limit*.8&&k<40;k++){const it=items[k%items.length];if(it.sets<4)it.sets++;else if(items.every(x=>x.sets>=4))break}
 return items}
const express=()=>[['Bodyweight_Squat',40],['Pushups',30],['Mountain_Climbers',30],['Butt_Lift_Bridge',40],['Plank',30],['Bodyweight_Walking_Lunge',40]].map(([id,reps])=>({id,sets:1,reps,rest:15,unit:'s'}));
// Ladders (1 to N) and pyramids (1 to N and back), one item per rung.
function ladder(id,unit,top,rest,pyramid){top=Math.max(2,Math.min(pyramid?20:30,Math.round(top)));const up=Array.from({length:top},(_,i)=>i+1),steps=pyramid?[...up,...up.slice(0,-1).reverse()]:up,mul=unit==='s'?10:1;return steps.slice(0,60).map(n=>({id,sets:1,reps:Math.min(300,n*mul),rest,unit}))}
// A deck of cards: the suit picks the exercise and the card the repetitions.
function deck(half=false,rand=Math.random){const suits=['♥','♦','♣','♠'],faces=[['2',2],['3',3],['4',4],['5',5],['6',6],['7',7],['8',8],['9',9],['10',10],['J',10],['Q',10],['K',10],['A',11]],cards=suits.flatMap(s=>faces.map(([label,reps])=>({suit:s,label,reps})));return shuffle(cards,rand).slice(0,half?26:52)}
// One small challenge per day, the same for everyone on that date.
const dailyList=[['Pushups','reps',30,'30 flexões ao longo do dia'],['Bodyweight_Squat','reps',50,'50 agachamentos em séries à tua escolha'],['Plank','s',120,'2 minutos de prancha no total'],['Wall_Sit','s',90,'90 segundos de cadeira na parede'],['Crunches','reps',40,'40 abdominais'],['Butt_Lift_Bridge','reps',40,'40 pontes de glúteos'],['Bodyweight_Walking_Lunge','reps',30,'30 afundos (15 por perna)'],['Burpee','reps',20,'20 burpees'],['Mountain_Climbers','reps',60,'60 escaladores'],['Superman','reps',30,'30 supermans'],['Incline_Push-Up','reps',40,'40 flexões inclinadas'],['Dead_Hang','s',60,'1 minuto suspenso na barra (em séries)'],['Hollow_Hold','s',60,'1 minuto de hollow no total'],['Bench_Dips','reps',30,'30 fundos num banco'],['Russian_Twist','reps',40,'40 torções russas']];
function daily(date){const n=[...String(date)].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);const [id,unit,reps,text]=dailyList[n%dailyList.length];return {id,unit,reps,text}}
function streak(days,date){let n=0,d=date;if(!days[d])d=addDays(d,-1);while(days[d]){n++;d=addDays(d,-1)}return n}
// Calculators. Estimates only, shown with that warning.
const round=(v,n=0)=>Math.round(v*10**n)/10**n;
function bmi(weight,height){const m=height/100;return m>0&&weight>0?round(weight/(m*m),1):null}
const bmiLabel=v=>v==null?'':v<18.5?'Abaixo do peso':v<25?'Peso normal':v<30?'Excesso de peso':'Obesidade';
function navyFat({sex,height,waist,neck,hip}){const log=Math.log10;if(!(height>0&&waist>neck&&neck>0))return null;const v=sex==='f'?(hip>0?495/(1.29579-.35004*log(waist+hip-neck)+.221*log(height))-450:null):495/(1.0324-.19077*log(waist-neck)+.15456*log(height))-450;return v==null||!isFinite(v)?null:round(Math.max(2,Math.min(60,v)),1)}
function calories({sex,age,height,weight,activity=1.375}){if(!(age>0&&height>0&&weight>0))return null;const base=10*weight+6.25*height-5*age+(sex==='f'?-161:5),keep=Math.round(base*activity);return {base:Math.round(base),keep,lose:Math.round(keep*.85/10)*10,gain:Math.round(keep*1.1/10)*10}}
const protein=weight=>weight>0?{low:Math.round(weight*1.6),high:Math.round(weight*2.2),meal:Math.round(weight*1.9/4)}:null;
const water=(weight,minutes=0)=>weight>0?Math.round((weight*33+minutes/60*500)/50)*50:null;
const oneRM=(load,reps)=>load>0&&reps>0?round(load*(1+reps/30),1):null;
function hrZones(age,rest=0){if(!(age>0))return null;const max=Math.round(208-.7*age),r=rest>30&&rest<max?rest:0,at=p=>Math.round(r?r+(max-r)*p:max*p);return {max,zones:[['Recuperação',.5,.6],['Queimar gordura',.6,.7],['Resistência',.7,.8],['Esforço forte',.8,.9],['Máximo',.9,1]].map(([name,a,b])=>({name,from:at(a),to:at(b)}))}}
function fromMax(max){max=Math.round(max);if(!(max>0))return [];return [['Força','5 séries curtas e pesadas, descanso longo',5,.5,120],['Volume','4 séries a meio gás para somar repetições',4,.65,90],['Resistência','3 séries mais longas, descanso curto',3,.8,60]].map(([name,text,sets,p,rest])=>({name,text,sets,reps:Math.max(1,Math.round(max*p)),rest}))}
const gtgSet=max=>Math.max(1,Math.round(max*.5));

const api={split,runOp,undo,lastItem,totals,compare,mergeItems,summaryText,cooldown,addDays,rng,shuffle,pools,zones,seconds,generate,express,ladder,deck,daily,dailyList,streak,bmi,bmiLabel,navyFat,calories,protein,water,oneRM,hrZones,fromMax,gtgSet};
if(typeof module!=='undefined')module.exports=api;else root.PracticalCore=api;
})(typeof window!=='undefined'?window:globalThis);
