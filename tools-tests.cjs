// Extra tools: calculators give sensible numbers, parsers read what people type, every tool has a name and a group.
const assert=require('node:assert/strict');
global.window={};require('./exercise-data.js');require('./custom-exercises.js');
const T=require('./tools2.js');
assert.equal(T.parseTime('30:00'),1800);assert.equal(T.parseTime('1:05:00'),3900);assert.equal(T.parseTime('25'),1500);assert.equal(T.parseTime('abc'),0);
assert.deepEqual(T.plates(60,20),{plates:[20],left:0});assert.deepEqual(T.plates(102.5,20).plates,[25,15,1.25]);assert.equal(T.plates(10,20),null);
assert.deepEqual(T.parseBlocks('Flexões 40\nDescanso 20\nPrancha: 1 min\nlixo'),[{name:'Flexões',sec:40,rest:false},{name:'Descanso',sec:20,rest:true},{name:'Prancha',sec:60,rest:false}]);
assert.equal(T.caffeineNow([{t:0,mg:100}],18e6),50);assert.equal(T.caffeineClear([{t:0,mg:100}],50,0),300);assert.equal(T.caffeineNow([{t:5000,mg:100}],0),0);
assert.deepEqual(T.healthyWeight(175),{low:56.7,high:76.3});assert.equal(T.healthyWeight(20),null);
assert.equal(T.waistHeight(80,175).label,'Saudável');assert.equal(T.waistHip(90,100,'f').ok,false);assert.equal(T.waistHip(80,100,'m').ok,true);
const m=T.macros(2200,75,'keep');assert.equal(m.p,120);assert(Math.abs(m.p*4+m.c*4+m.f*9-2200)<10);assert.equal(T.macros(100,75),null);
assert.deepEqual(T.pace(5,1500),{pace:300,kmh:12});assert(T.predict(1500,5,10)>3000&&T.predict(1500,5,10)<3200);
assert.deepEqual(T.steps(10000,175,70),{km:7.26,kcal:400});assert.equal(T.burn(300,70,3.5),70);
assert.equal(T.weeksTo(80,75,.5),10);assert.equal(T.weeksTo(80,80,.5),null);
assert.deepEqual(T.ffmi(80,15,180),{lean:68,fatKg:12,ffmi:21});
assert.deepEqual(T.wakeTimes(23*60).map(x=>T.hhmm(x.at)),['08:15','06:45','05:15']);assert.deepEqual(T.bedTimes(7*60).map(x=>T.hhmm(x.at)),['21:45','23:15','00:45']);
assert.deepEqual(T.sweat(70,69,500,60),{lost:1500,perHour:1500,drink:1500});assert.equal(T.sweat(70,60,0,60),null);
assert.equal(T.cooper(2400),42.4);assert.equal(T.cooperLabel(42.4),'Bom');assert.equal(T.costPer100(5,1000,23),2.17);
assert.equal(T.percents(100)[0].kg,100);assert.equal(T.percents(100).at(-1).kg,50);assert(T.restingLabel(55).includes('treina'));
assert.equal(T.weekStart('2026-10-16'),'2026-10-12');assert.equal(T.weekStart('2026-10-12'),'2026-10-12');assert.equal(T.bingoLines([0,1,2,4,8]),2);
const a=T.pick([1,2,3,4,5,6],6,T.seeded(7)),b=T.pick([1,2,3,4,5,6],6,T.seeded(7));assert.deepEqual(a,b);assert.equal(new Set(a).size,6);
// Week menu and shopping list.
require('./recipes.js');require('./more-recipes.js');require('./content2.js');const recipes=window.RECIPES;
const plan=T.mealPlan(recipes,123);assert.equal(plan.length,7);assert.equal(new Set(plan.flatMap(d=>[d.lunch.id,d.dinner.id])).size,14);
const shop=T.shopping([{servings:2,ingredients:[{name:'Arroz',amount:150,unit:'g'},{name:'Ovos',amount:3,unit:'un.'}]},{servings:1,ingredients:[{name:'arroz',amount:100,unit:'g'}]}],1);
assert.deepEqual(shop,[{name:'Arroz',unit:'g',amount:175},{name:'Ovos',unit:'un.',amount:2}]);
// Plans for the equipment someone has.
global.WORKOUT_PLANS=require('./workout-plans.js');const byId=new Map(window.EXERCISES.map(e=>[e.id,e]));
assert.deepEqual([...T.needs({items:[{id:'Pullups'},{id:'Pushups'}]},byId)],['bar']);assert.deepEqual([...T.needs({items:[{id:'Bench_Dips'}]},byId)],[]);
// Every tool window has what the hub needs.
const tools=window.MORE_TOOLS({$:()=>null,esc:String,toast(){},byId,P:{},today:()=>'2026-10-16',title:id=>id,extra:()=>({}),saveExtra(){},local:(k,f)=>f,setLocal(){},mmss:String,tone(){},speak(){},vib(){},awake(){},every(){},later(){},startWorkout(){},options:()=>'',body:()=>({}),bodyForm(){},breathe(){}});
const ids=Object.keys(tools);assert(ids.length>=60,'tools '+ids.length);for(const [id,t] of Object.entries(tools)){assert(t.group&&t.icon&&t.name,id);assert(typeof t.run==='function'||typeof t.start==='function',id)}
console.log('PASS: '+ids.length+' extra tools, calculators, parsers, week menu, shopping list and equipment filter.');
