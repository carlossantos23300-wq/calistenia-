const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=(v,n=200)=>typeof v==='string'&&v.length<=n;
const number=(v,max)=>Number.isFinite(v)&&v>=0&&v<=max;
const items=v=>Array.isArray(v)&&v.length<=60&&v.every(i=>object(i)&&text(i.id)&&Number.isInteger(i.sets)&&i.sets>=1&&i.sets<=20&&Number.isInteger(i.reps)&&i.reps>=1&&i.reps<=300&&number(i.rest,600)&&['s','reps'].includes(i.unit));
export function validState(key,value){
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
 if(key==='cal_progress')return value.every(w=>object(w)&&text(w.id)&&text(w.name,60)&&text(w.date)&&Number.isFinite(Date.parse(w.date))&&number(w.duration,604800)&&Array.isArray(w.sets)&&w.sets.length<=1200&&w.sets.every(s=>object(s)&&text(s.id)&&['s','reps'].includes(s.unit)&&number(s.reps,10000)&&number(s.weight,1000)));
 return false;
}
