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

const api={split,runOp,undo,lastItem,totals,compare,mergeItems,summaryText,cooldown,addDays};
if(typeof module!=='undefined')module.exports=api;else root.PracticalCore=api;
})(typeof window!=='undefined'?window:globalThis);
