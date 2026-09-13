(function(root){
function localDate(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
function weekDates(offset=0,now=new Date()){const start=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);start.setDate(start.getDate()-((start.getDay()+6)%7)+offset*7);return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return localDate(d)})}
function alternatives(data,current,equipment=''){return data.filter(e=>e.id!==current.id&&(!equipment||e.equipment===equipment)&&e.category===current.category&&e.primaryMuscles.some(m=>current.primaryMuscles.includes(m))&&(!current.force||e.force===current.force)).sort((a,b)=>{const rank={beginner:0,intermediate:1,expert:2};return rank[a.level]-rank[b.level]||a.title.localeCompare(b.title,'pt')}).slice(0,30)}
function summary(history){return {workouts:history.length,sets:history.reduce((n,w)=>n+w.sets.length,0),minutes:Math.round(history.reduce((n,w)=>n+w.duration,0)/60)}}
function weekSummary(history,now=new Date()){const dates=weekDates(0,now),records=history.filter(h=>dates.includes(localDate(new Date(h.date))));return {...summary(records),days:new Set(records.map(h=>localDate(new Date(h.date)))).size}}
const api={localDate,weekDates,alternatives,summary,weekSummary};if(typeof module!=='undefined')module.exports=api;else root.FeatureCore=api;
})(globalThis);
