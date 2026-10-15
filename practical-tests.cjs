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
// Generated workouts fit the time, avoid jumps when asked and are repeatable with a seed.
for(const zone of Object.keys(P.zones))for(const minutes of [5,10,20,30]){const a=P.generate({zone,minutes,quiet:true,seed:42});assert(a.length>=2,zone);assert(new Set(a.map(i=>i.id)).size===a.length);assert(P.seconds(a)<=minutes*60*1.05+120,zone+minutes);assert(!a.some(i=>['Burpee','Mountain_Climbers','Freehand_Jump_Squat'].includes(i.id)));assert.deepEqual(a,P.generate({zone,minutes,quiet:true,seed:42}))}
assert(P.generate({zone:'upper',minutes:30,bar:true,seed:3}).some(i=>P.pools.pull.some(p=>p[0]===i.id)));
assert.equal(P.ladder('Pushups','reps',5,30).map(i=>i.reps).join(),'1,2,3,4,5');assert.equal(P.ladder('Pushups','reps',3,30,true).map(i=>i.reps).join(),'1,2,3,2,1');assert(P.ladder('Plank','s',30,20,true).length<=60);
const cards=P.deck();assert.equal(cards.length,52);assert.equal(new Set(cards.map(c=>c.suit+c.label)).size,52);assert.equal(cards.reduce((n,c)=>n+c.reps,0),4*(2+3+4+5+6+7+8+9+10+30+11));assert.equal(P.deck(true).length,26);
assert.deepEqual(P.daily('2026-10-15'),P.daily('2026-10-15'));assert.equal(P.streak({'2026-10-14':true,'2026-10-13':true},'2026-10-15'),2);assert.equal(P.streak({'2026-10-15':true},'2026-10-15'),1);
// Calculators.
assert.equal(P.bmi(70,175),22.9);assert.equal(P.bmiLabel(22.9),'Peso normal');assert.equal(P.bmi(0,175),null);
const fat=P.navyFat({sex:'m',height:178,waist:85,neck:38});assert(fat>10&&fat<25,String(fat));assert.equal(P.navyFat({sex:'f',height:165,waist:75,neck:32}),null);
const kcal=P.calories({sex:'m',age:30,height:178,weight:75,activity:1.55});assert.equal(kcal.base,1718);assert.equal(kcal.keep,2662);
assert.deepEqual(P.protein(75),{low:120,high:165,meal:36});assert.equal(P.water(70,60),2800);assert.equal(P.oneRM(100,5),116.7);
const hr=P.hrZones(30,60);assert.equal(hr.max,187);assert.equal(hr.zones.length,5);assert.equal(hr.zones[0].from,124);
assert.deepEqual(P.fromMax(10).map(p=>p.reps),[5,7,8]);assert.equal(P.gtgSet(7),4);
console.log('PASS: generated workouts, ladders, deck, daily challenge and calculators.');
// Plans, calendar export, month grid and history numbers.
{const byId=new Map([['Pushups',{primaryMuscles:['chest']}],['Bodyweight_Squat',{primaryMuscles:['quadriceps']}],['Plank',{primaryMuscles:['abdominals']}],['Pullups',{primaryMuscles:['lats']}]]);
assert.deepEqual(P.balance([{id:'Pushups',sets:3},{id:'Pullups',sets:2},{id:'Plank',sets:1}],byId),{push:3,pull:2,legs:0,core:1,other:0});
assert.equal(P.planWarnings([{id:'Pushups',sets:8,reps:10,rest:60}],byId).length,3);assert.equal(P.planWarnings([{id:'Pushups',sets:3,reps:10,rest:60},{id:'Pullups',sets:3,reps:5,rest:60},{id:'Bodyweight_Squat',sets:3,reps:15,rest:60},{id:'Plank',sets:3,reps:30,rest:60,unit:'s'}],byId).length,0);
assert.match(P.planText('A',[{id:'Pushups',sets:3,reps:10,rest:60,unit:'reps'}],()=>'Flexões'),/1\. Flexões — 3 × 10/);
global.window={};require('./exercise-data.js');require('./custom-exercises.js');const ids=new Set(window.EXERCISES.map(e=>e.id));for(const s of Object.values(P.splits))for(const [,items] of s.plans)for(const i of items)assert(ids.has(i.id),i.id);for(const list of Object.values(P.pools))for(const [id] of list)assert(ids.has(id),id);for(const i of [...P.express(),...P.cooldown()])assert(ids.has(i.id),i.id);for(const d of P.dailyList)assert(ids.has(d[0]),d[0]);
const h=[{id:'a',name:'X;Y',date:'2026-10-05T18:00:00',duration:1800,sets:[{id:'Pushups',unit:'reps',reps:10,weight:0},{id:'Pushups',unit:'reps',reps:12,weight:0}]},{id:'b',name:'X',date:'2026-10-13T08:00:00',duration:1200,sets:[{id:'Bodyweight_Squat',unit:'reps',reps:20,weight:0},{id:'Plank',unit:'s',reps:40,weight:0}]}];
const csv=P.csv(h,id=>id);assert(csv.startsWith('\ufeffData;'));assert(csv.includes('"X;Y"'));assert.equal(csv.split('\r\n').length,5);
const ics=P.ics([{id:'1',date:'2026-10-20',name:'Pernas, já',items:[]}],7);assert(ics.includes('DTSTART:20261020T070000'));assert(ics.includes(String.raw`Pernas\, já`));assert(ics.includes('TRIGGER:-PT30M'));
const grid=P.monthGrid(2026,9);assert.equal(grid[0][0].date,'2026-09-28');assert(grid.every(w=>w.length===7));assert(grid.flat().filter(d=>d.inMonth).length===31);
const r=P.insights(h,{today:'2026-10-15',byId,goal:1});assert.equal(r.total,2);assert.equal(r.thisWeek.workouts,1);assert.equal(r.lastWeek.reps,22);assert.equal(r.consistency,100);assert.equal(r.records.find(x=>x.id==='Pushups').reps,12);assert(r.forgotten.some(f=>f.muscle==='lats'));
assert.deepEqual(P.targetProgress({exercise:'Pushups',unit:'reps',target:20,created:'2026-10-01T00:00:00'},h),{best:12,done:false,pct:60});}
console.log('PASS: plan balance and tips, splits and pools use real exercises, spreadsheet and calendar exports, month grid and history numbers.');
