// Practical helpers: workout queue edits keep records consistent; totals, comparisons and calculators.
const assert=require('node:assert/strict'),P=require('./practical-core.js');
const item=(id,sets)=>({id,sets,reps:10,rest:30,unit:'reps'});
const consistent=run=>run.records.length===run.items.slice(0,run.index).reduce((n,s)=>n+s.sets,0)+run.set&&(run.index===run.items.length?run.set===0:run.set<run.items[run.index].sets);
const fresh=()=>({items:[item('A',3),item('B',2),item('C',2)],index:0,set:1,records:[{id:'A',unit:'reps',reps:10,weight:0}],restUntil:0,restRemaining:0});

let run=fresh();assert(P.runOp(run,'now',2));assert.deepEqual(run.items.map(i=>i.id+i.sets),['A1','C2','A2','B2']);assert.equal(run.index,1);assert.equal(run.set,0);assert(consistent(run));
run=fresh();assert(P.runOp(run,'end',0));assert.deepEqual(run.items.map(i=>i.id+i.sets),['A1','B2','C2','A2']);assert(consistent(run));
run=fresh();assert(P.runOp(run,'skip',0));assert.deepEqual(run.items.map(i=>i.id+i.sets),['A1','B2','C2']);assert.equal(run.index,1);assert(consistent(run));
run=fresh();assert(P.runOp(run,'skip',2));assert.equal(run.items.length,2);assert(consistent(run));
run=fresh();assert(!P.runOp(run,'minus',0)||run.items[0].sets===2);run=fresh();run.items[0].sets=2;assert(!P.runOp(run,'minus',0));assert(P.runOp(run,'plus',0));assert.equal(run.items[0].sets,3);
run=fresh();assert(!P.runOp(run,'now',0));assert(!P.runOp({...fresh(),index:1,set:0},'now',0));
// Undo steps back across exercises and keeps the partner records in step.
run={items:[item('A',1),item('B',2)],index:1,set:0,records:[{id:'A',unit:'reps',reps:9,weight:0}],partnerRecords:[{id:'A',unit:'reps',reps:5,weight:0}],restUntil:5,restRemaining:0};
const rec=P.undo(run);assert.equal(rec.reps,9);assert.equal(run.index,0);assert.equal(run.set,0);assert.equal(run.partnerRecords.length,0);assert(consistent(run));assert.equal(P.undo(run),null);
// Totals, comparisons, merging and the text summary.
assert.deepEqual(P.totals([{unit:'reps',reps:10},{unit:'s',reps:30},{unit:'reps',reps:8}]),{sets:3,reps:18,seconds:30});
const hist=[{id:'x',name:'Plano',date:'2026-10-01T10:00:00Z',sets:[{unit:'reps',reps:20}]},{id:'y',name:'Plano',date:'2026-10-03T10:00:00Z',sets:[{unit:'reps',reps:25}]}];
assert.equal(P.compare(hist,'Plano',[{unit:'reps',reps:30}],'z').reps,5);assert.equal(P.compare(hist,'Outro',[],'z'),null);
assert.deepEqual(P.mergeItems([item('A',1),{...item('B',1),warmup:true},item('A',2),item('C',1)]).map(i=>i.id+i.sets),['A3','C1']);
assert.match(P.summaryText({name:'Plano',minutes:20,records:[{id:'A',unit:'reps',reps:10,weight:0},{id:'A',unit:'reps',reps:8,weight:0}],title:()=>'Flexões'}),/Flexões: 10, 8/);
assert.equal(P.addDays('2026-12-31',1),'2027-01-01');assert(P.cooldown().every(i=>i.unit==='s'&&i.sets===1));
console.log('PASS: queue edits and undo keep records consistent; totals, comparisons, merging and summaries.');
