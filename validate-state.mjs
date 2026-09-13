const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=(v,n=200)=>typeof v==='string'&&v.length<=n;
const number=(v,max)=>Number.isFinite(v)&&v>=0&&v<=max;
const items=v=>Array.isArray(v)&&v.length<=60&&v.every(i=>object(i)&&text(i.id)&&Number.isInteger(i.sets)&&i.sets>=1&&i.sets<=20&&Number.isInteger(i.reps)&&i.reps>=1&&i.reps<=300&&number(i.rest,600)&&['s','reps'].includes(i.unit));
export function validState(key,value){
 if(key==='cal_library_draft')return object(value)&&text(value.name,60)&&items(value.items);
 if(!Array.isArray(value)||value.length>5000)return false;
 if(key==='cal_library_favorites')return value.every(v=>text(v));
 if(key==='cal_library_workouts')return value.every(w=>object(w)&&text(w.id)&&text(w.name,60)&&items(w.items));
 if(key==='cal_calendar')return value.every(w=>object(w)&&text(w.id)&&text(w.name,60)&&typeof w.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(w.date)&&items(w.items));
 if(key==='cal_progress')return value.every(w=>object(w)&&text(w.id)&&text(w.name,60)&&text(w.date)&&Number.isFinite(Date.parse(w.date))&&number(w.duration,604800)&&Array.isArray(w.sets)&&w.sets.length<=1200&&w.sets.every(s=>object(s)&&text(s.id)&&['s','reps'].includes(s.unit)&&number(s.reps,10000)&&number(s.weight,1000)));
 return false;
}
