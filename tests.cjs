const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),C=require('./library-core.js');
const raw=JSON.parse(fs.readFileSync('exercises.json','utf8')),data=C.prepare(raw),ids=new Set(data.map(e=>e.id));
assert.equal(data.length,876);assert.equal(ids.size,876);
assert(data.every(e=>Array.isArray(e.instructions)&&Array.isArray(e.images)&&C.equipment[e.equipment]&&C.levels[e.level]&&e.primaryMuscles.every(m=>C.muscles[m])));
assert.equal(data.filter(e=>!e.images.length).length,3);assert.equal(data.filter(e=>!e.instructions.length).length,5);
const body=C.filter(data,{quick:'body'});assert(body.length>100&&body.every(e=>e.equipment==='body only'));
const combo=C.filter(data,{muscle:'chest',equipment:'dumbbell',level:'beginner'});assert(combo.length>0&&combo.every(e=>(e.primaryMuscles.includes('chest')||e.secondaryMuscles.includes('chest'))&&e.equipment==='dumbbell'&&e.level==='beginner'));
assert(C.filter(data,{q:'flexões'}).some(e=>/pushup/i.test(e.name)));
assert(C.filter(data,{q:'bíceps halteres'}).length>0);
assert.equal(C.filter(data,{q:'zzzznotanexercise'}).length,0);
assert.equal(C.filter(data,{quick:'favorites'},[data[0].id]).length,1);
assert.equal(C.filter(data,{quick:'favorites'},[]).length,0);
const clean=C.sanitizeItems([{id:data[0].id,sets:100,reps:-3,rest:999,unit:'x'},{id:data[0].id},{id:'missing'},null],ids);
assert.deepEqual(clean,[{id:data[0].id,sets:20,reps:1,rest:600,unit:'reps'}]);assert.deepEqual(C.sanitizeItems({},ids),[]);
const html=fs.readFileSync('index.html','utf8'),domIDs=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(domIDs).size,domIDs.length);
const dynamic=new Set(['runDone','completeSet','runDetails','restClock','skipTimer','actualReps','actualWeight']);for(const [,id] of fs.readFileSync('library.js','utf8').matchAll(/\$\('([^']+)'\)/g))assert(domIDs.includes(id)||dynamic.has(id),'Missing element '+id);
const events={},root='https://example.com/calistenia-/';let assetList;
vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{URL,self:{location:{href:root+'sw.js'},addEventListener:(type,fn)=>events[type]=fn},fetch:()=>Promise.reject(Error('offline')),caches:{open:async()=>({addAll:async urls=>{assetList=urls}}),match:async key=>({cached:key})}});
(async()=>{let installing;events.install({waitUntil:p=>installing=p});await installing;assert(assetList.length===33);assetList.forEach(u=>assert(fs.existsSync(new URL(u).pathname.split('/').pop())));let response;events.fetch({request:{method:'GET',mode:'navigate',url:root},respondWith:p=>response=p});assert.equal((await response).cached,root+'index.html');let handled=false;events.fetch({request:{method:'GET',url:'https://other.com/a.jpg'},respondWith:()=>handled=true});assert(!handled);console.log('PASS: 876 unique records, combined filters, Portuguese search, favorites, draft validation, DOM targets and offline navigation.');})().catch(e=>{console.error(e);process.exitCode=1});

const plans=require('./workout-plans.js');assert.equal(plans.length,17);assert.equal(new Set(plans.map(p=>p.id)).size,17);for(const p of plans){assert(p.items.length>=4);assert.deepEqual(C.sanitizeItems(p.items,ids),p.items);for(const i of p.items){const e=data.find(e=>e.id===i.id);assert(e.instructions.length>0,p.name+': missing instructions');assert(e.images.length>0,p.name+': missing images')}}const copied=structuredClone(plans[0].items);copied[0].sets=10;assert.notEqual(copied[0].sets,plans[0].items[0].sets);console.log('PASS: 17 plans, valid catalog references, complete exercise guides and editable copies.');


