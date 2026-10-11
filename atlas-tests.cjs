const assert=require('node:assert/strict'),C=require('./library-core.js'),A=require('./training-atlas.js'),data=C.prepare(require('./exercises.json'));
const groups=A.organize(data),all=groups.flatMap(g=>g.items.map(e=>e.id));
assert.equal(all.length,876);assert.equal(new Set(all).size,876);assert.equal(new Set(groups.map(g=>g.key)).size,groups.length);
for(const g of groups){assert(g.items.length>0&&g.items.length<=4);assert(g.items.every(e=>e.equipment===g.equipment&&e.level===g.level&&e.category===g.category&&(e.primaryMuscles[0]||'all')===g.muscle));}
assert.deepEqual(A.organize([...data].reverse()).map(g=>g.key),groups.map(g=>g.key));
const h=[{name:'A',date:'2026-01-03',sets:[{id:'x',unit:'reps',weight:5,reps:8},{id:'x',unit:'reps',weight:5,reps:6},{id:'x',unit:'s',weight:5,reps:60}]},{name:'B',date:'2026-01-01',sets:[{id:'x',unit:'reps',weight:5,reps:7},{id:'x',unit:'reps',weight:10,reps:12}]}];
assert.deepEqual(A.trend(h,'x','reps',5).map(p=>p.value),[7,8]);assert.equal(A.trend(h,'x','reps',5)[1].sets,2);assert.deepEqual(A.trend(h,'missing','reps',0),[]);assert.equal(A.trend(h,'x','s',5)[0].value,60);assert.equal(h[0].date,'2026-01-03');
console.log(`PASS: all 876 exercises covered exactly once in ${groups.length} stable groups; trends separate units and loads and sort sessions without mutating history.`);
