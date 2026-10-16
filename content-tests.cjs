// New content: every plan, routine, skill, challenge and list uses real exercises and sensible values.
const assert=require('node:assert/strict');
global.window={};require('./exercise-data.js');require('./custom-exercises.js');const ids=new Set(window.EXERCISES.map(e=>e.id));
const base=require('./workout-plans.js'),more=require('./more-plans.js');globalThis.WORKOUT_PLANS=base;
window.ExtrasCore=require('./extras-core.js');window.PracticalCore=require('./practical-core.js');const C=require('./content.js');
const item=(i,where)=>{assert(ids.has(i.id),where+': '+i.id);assert(i.sets>=1&&i.sets<=20&&i.reps>=1&&i.reps<=300&&i.rest>=0&&i.rest<=600&&['s','reps'].includes(i.unit),where+' '+i.id)};
assert.equal(new Set([...base,...more].map(p=>p.id)).size,base.length+more.length);
for(const p of more){assert(p.name&&p.group&&p.level&&/\d/.test(p.time)&&p.items.length,p.id);p.items.forEach(i=>item(i,p.id))}
for(const [k,r] of Object.entries(C.routines)){assert(r.name&&r.minutes&&r.note,k);for(const [id,s] of r.items){assert(ids.has(id),k+' '+id);assert(s>0&&s<=300)}}
for(const s of C.skills){assert(ids.has(s.hero),s.id);for(const st of s.steps)st.items.forEach(i=>item(i,s.id))}
for(const [k,c] of Object.entries(C.challenges)){assert(ids.has(c.exercise),k);for(const l of ['Iniciante','Intermédio'])assert(c.from[l]<c.to[l]&&c.perSet[l]>0,k)}
for(const [k,s] of Object.entries(C.splits))for(const [,items] of s.plans)items.forEach(i=>item(i,k));
for(const d of C.daily){assert(ids.has(d[0]),d[0]);assert(d[2]>0&&d[2]<=300)}for(const id of C.ofDay)assert(ids.has(id),id);for(const list of Object.values(C.pools))for(const p of list)assert(ids.has(p[0]),p[0]);
assert(C.tips.length>=40&&C.quotes.length>=30&&C.faq.length>=15);
const P=window.PracticalCore;assert(P.dailyList.length>=45);assert(P.splits.full3&&P.activities.length>=31);
const recipes=require('./more-recipes.js');assert.equal(recipes.length,40);for(const r of recipes){assert(r.ingredients.length&&r.steps.length&&r.servings>=1&&r.minutes>=1,r.id);for(const i of r.ingredients)assert(i.amount>0&&['g','ml','un.'].includes(i.unit),r.id)}
const by=new Map(window.EXERCISES.map(e=>[e.id,e]));assert(P.mistakes(by.get('Lying_Glute')).some(t=>/balanço/.test(t)));assert(P.mistakes(by.get('One-Arm_Kettlebell_Swings')).some(t=>/ancas/.test(t)));assert(P.mistakes(by.get('Butt_Lift_Bridge')).some(t=>/glúteos/.test(t)));
const C2=require('./content2.js');const allPlans=[...base,...more,...C2.plans];assert.equal(new Set(allPlans.map(p=>p.id)).size,allPlans.length);assert.equal(new Set(allPlans.map(p=>p.name)).size,allPlans.length,'plan names');
for(const p of C2.plans){assert(p.name&&p.group&&p.level&&/[0-9]/.test(p.time)&&p.items.length,p.id);p.items.forEach(i=>item(i,p.id))}
for(const [k,r] of Object.entries(C2.routines)){assert(r.name&&r.minutes&&r.note,k);for(const [id,s] of r.items){assert(ids.has(id),k+' '+id);assert(s>0&&s<=300)}}
for(const s of C2.skills){assert(ids.has(s.hero),s.id);for(const st of s.steps)st.items.forEach(i=>item(i,s.id))}
for(const [k,c] of Object.entries(C2.challenges)){assert(ids.has(c.exercise),k);assert(!C.challenges[k],'dup challenge '+k);for(const l of ['Iniciante','Intermédio'])assert(c.from[l]<c.to[l]&&c.perSet[l]>0,k)}
for(const d of C2.daily){assert(ids.has(d[0]),d[0]);assert(d[2]>0&&d[2]<=300)}
require('./recipes.js');const allRecipes=[...window.RECIPES,...recipes,...C2.recipes];assert.equal(new Set(allRecipes.map(r=>r.id)).size,allRecipes.length,'recipe ids');for(const r of C2.recipes){assert(r.ingredients.length&&r.steps.length&&r.servings>=1&&r.minutes>=1,r.id);for(const i of r.ingredients)assert(i.amount>0&&['g','ml','un.'].includes(i.unit),r.id)}
assert.equal(new Set([...C.tips,...C2.tips]).size,C.tips.length+C2.tips.length);assert.equal(new Set([...C.quotes,...C2.quotes]).size,C.quotes.length+C2.quotes.length);
console.log('PASS: third batch: '+C2.plans.length+' plans, '+C2.recipes.length+' recipes, '+C2.daily.length+' daily, '+C2.tips.length+' tips, '+C2.quotes.length+' quotes, '+C2.faq.length+' faq, '+Object.keys(C2.routines).length+' routines, '+C2.skills.length+' skills, '+Object.keys(C2.challenges).length+' challenges.');
console.log('PASS: '+more.length+' plans, '+recipes.length+' recipes, '+Object.keys(C.routines).length+' routines, '+C.skills.length+' skills, '+Object.keys(C.challenges).length+' challenges, '+Object.keys(C.splits).length+' splits and lists use real exercises.');
