const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=(v,n=200)=>typeof v==='string'&&v.length<=n;
const number=(v,max)=>Number.isFinite(v)&&v>=0&&v<=max;
const items=v=>Array.isArray(v)&&v.length<=60&&v.every(i=>object(i)&&text(i.id)&&Number.isInteger(i.sets)&&i.sets>=1&&i.sets<=20&&Number.isInteger(i.reps)&&i.reps>=1&&i.reps<=300&&number(i.rest,600)&&['s','reps'].includes(i.unit));
function validState(key,value){
 if(key==='cal_tools'){
  const list=(v,n,fn)=>Array.isArray(v)&&v.length<=n&&v.every(fn),strings=(v,n=1000)=>list(v,n,x=>text(x,200));
  const date=v=>text(v,10)&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
  const entry=v=>object(v)&&text(v.id);
  return object(value)&&strings(value.equipment,30)&&strings(value.learn)&&strings(value.steps,100)&&list(value.notes,1000,n=>object(n)&&text(n.exercise)&&text(n.text,1000)&&number(n.down,10)&&n.down>=1&&number(n.hold,10)&&number(n.up,10)&&n.up>=1)&&list(value.activities,5000,a=>entry(a)&&date(a.date)&&text(a.kind,60)&&number(a.minutes,1440)&&a.minutes>=1&&number(a.distance,1000))&&list(value.discomfort,5000,d=>entry(d)&&date(d.date)&&text(d.exercise)&&text(d.area,100)&&text(d.text,1000))&&list(value.goals,1000,g=>entry(g)&&text(g.exercise)&&number(g.target,10000)&&g.target>=1)&&list(value.versions,100,v=>entry(v)&&text(v.name,60)&&items(v.items)&&text(v.date)&&!isNaN(Date.parse(v.date)))&&validState('cal_progress',value.partnerHistory)&&object(value.food)&&strings(value.food.exclude,30)&&strings(value.food.pantry,30)&&list(value.food.prices,100,p=>object(p)&&text(p.name,100)&&number(p.price,1000))&&list(value.food.prep,500,p=>entry(p)&&date(p.date)&&text(p.recipe)&&Number.isInteger(p.portions)&&p.portions>=1&&p.portions<=20);
 }
 if(key==='cal_meal_swaps')return Array.isArray(value)&&value.length<=28&&value.every(s=>object(s)&&Number.isInteger(s.day)&&s.day>=0&&s.day<7&&Number.isInteger(s.index)&&s.index>=0&&s.index<4&&Number.isInteger(s.sourceDay)&&s.sourceDay>=0&&s.sourceDay<7)&&new Set(value.map(s=>s.day+':'+s.index)).size===value.length;
 if(key==='cal_active_run'){
  if(value===null)return true;
  if(!object(value)||!text(value.id)||!text(value.name,60)||!items(value.items)||!value.items.length||!Number.isInteger(value.index)||value.index<0||value.index>value.items.length||!Number.isInteger(value.set)||value.set<0||(value.index===value.items.length?value.set!==0:value.set>=value.items[value.index].sets))return false;
  const record=s=>object(s)&&text(s.id)&&['s','reps'].includes(s.unit)&&number(s.reps,10000)&&number(s.weight,1000)&&(s.effort===undefined||['easy','moderate','hard'].includes(s.effort));
  if(value.effort!==undefined&&!['easy','moderate','hard'].includes(value.effort))return false;
  if(value.partnerInputs!=null&&(!object(value.partnerInputs)||!number(value.partnerInputs.reps,10000)||!number(value.partnerInputs.weight,1000)))return false;
  if(value.partnerName!==undefined&&(!text(value.partnerName,40)||!Array.isArray(value.partnerRecords)||value.partnerRecords.length!==value.records?.length||!value.partnerRecords.every(record)))return false;
  return Array.isArray(value.records)&&value.records.length<=1200&&value.records.every(record)&&value.records.length===value.items.slice(0,value.index).reduce((n,s)=>n+s.sets,0)+value.set&&number(value.elapsed,604800000)&&number(value.restUntil,100000000000000)&&number(value.restRemaining,600000)&&(value.calendarId===null||text(value.calendarId))&&object(value.lastWeights)&&Object.keys(value.lastWeights).length<=60&&Object.values(value.lastWeights).every(v=>number(v,1000))&&(value.inputs===null||(object(value.inputs)&&number(value.inputs.reps,10000)&&number(value.inputs.weight,1000)));
 }
 if(key==='cal_personal'){
  const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
  const metric=(v,max)=>v===null||(number(v,max)&&v>=20);
  return object(value)&&Number.isInteger(value.goal)&&value.goal>=1&&value.goal<=7&&Array.isArray(value.measurements)&&value.measurements.length<=5000&&value.measurements.every(m=>object(m)&&date(m.date)&&metric(m.weight,400)&&metric(m.waist,250)&&metric(m.hip,250)&&metric(m.chest,250)&&[m.weight,m.waist,m.hip,m.chest].some(v=>v!==null))&&new Set(value.measurements.map(m=>m.date)).size===value.measurements.length&&Array.isArray(value.shopping)&&value.shopping.length<=1000&&value.shopping.every(i=>object(i)&&text(i.id)&&text(i.name,100)&&i.name.trim().length>0&&text(i.quantity,40)&&typeof i.done==='boolean')&&Array.isArray(value.notes)&&value.notes.length<=5000&&value.notes.every(n=>object(n)&&text(n.id)&&text(n.text,1000));
 }
 if(key==='cal_library_draft')return object(value)&&text(value.name,60)&&items(value.items);
 if(!Array.isArray(value)||value.length>5000)return false;
 if(key==='cal_library_favorites')return value.every(v=>text(v));
 if(key==='cal_library_workouts')return value.every(w=>object(w)&&text(w.id)&&text(w.name,60)&&items(w.items));
 if(key==='cal_calendar')return value.every(w=>object(w)&&text(w.id)&&text(w.name,60)&&typeof w.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(w.date)&&items(w.items));
 if(key==='cal_progress')return value.every(w=>object(w)&&text(w.id)&&text(w.name,60)&&text(w.date)&&Number.isFinite(Date.parse(w.date))&&number(w.duration,604800)&&Array.isArray(w.sets)&&w.sets.length<=1200&&w.sets.every(s=>object(s)&&text(s.id)&&['s','reps'].includes(s.unit)&&number(s.reps,10000)&&number(s.weight,1000)&&(s.effort===undefined||['easy','moderate','hard'].includes(s.effort))));
 return false;
}

window.validState=validState;
