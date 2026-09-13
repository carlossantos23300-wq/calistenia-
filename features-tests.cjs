const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{DatabaseSync}=require('node:sqlite');
const C=require('./library-core.js'),F=require('./feature-core.js'),data=C.prepare(require('./exercises.json'));
assert.deepEqual(F.weekDates(0,new Date(2026,8,13,12)),['2026-09-07','2026-09-08','2026-09-09','2026-09-10','2026-09-11','2026-09-12','2026-09-13']);
assert.equal(F.weekDates(1,new Date(2026,11,31,12))[0],'2027-01-04');
const current=data.find(e=>e.id==='Pushups'),alternatives=F.alternatives(data,current,'body only');assert(alternatives.length>0);assert(alternatives.every(e=>e.id!==current.id&&e.primaryMuscles.includes('chest')&&e.equipment==='body only'));
const translations=require('./translations-pt.json');assert(data.every(e=>translations[e.id]&&translations[e.id].title&&(!e.instructions.length||translations[e.id].instructions.length)));
const mealContext={window:{}};vm.runInNewContext(fs.readFileSync('meals.js','utf8'),mealContext);assert.equal(mealContext.window.MEAL_WEEK.length,7);assert(mealContext.window.MEAL_WEEK.every(d=>d.meals.length===4));
const sqlite=new DatabaseSync(':memory:');sqlite.exec(fs.readFileSync('drizzle/0000_swift_gunslinger.sql','utf8'));
const DB={prepare(sql){
 const statement=sqlite.prepare(sql);
 return {bind(...params){return {
  async all(){return {results:statement.all(...params)}},
  async run(){const r=statement.run(...params);return {meta:{changes:Number(r.changes)}}}
 }}};
}};
(async()=>{const server=(await import('./server.mjs')).default;const make=(user,body,origin='https://app.test')=>new Request('https://app.test/api/state',{method:body?'PUT':'GET',headers:{...(user?{'oai-authenticated-user-id':user}:{}),'content-type':'application/json',origin},...(body?{body:JSON.stringify(body)}:{})});
assert.equal((await server.fetch(make(null),{DB})).status,401);
let body={user:'user-a',key:'cal_library_favorites',value:['Pushups'],revision:0};assert.equal((await server.fetch(make('user-a',body),{DB})).status,200);
assert.equal((await server.fetch(make('user-a',body),{DB})).status,409);
assert.deepEqual((await (await server.fetch(make('user-b'),{DB})).json()).values,{});
assert.equal((await server.fetch(make('user-b',body),{DB})).status,403);
assert.equal((await server.fetch(make('user-a',{...body,revision:1},'https://evil.test'),{DB})).status,403);
assert.equal((await server.fetch(make('user-a',{...body,revision:1,value:{bad:1}}),{DB})).status,400);
assert.equal((await server.fetch(make('user-a',{...body,revision:1,value:[]}),{DB})).status,200);
assert.deepEqual((await (await server.fetch(make('user-a'),{DB})).json()).values.cal_library_favorites,[]);
assert.equal((await server.fetch(make('user-a',{...body,key:'anything',revision:0}),{DB})).status,400);
sqlite.close();console.log('PASS: calendar dates, replacements, translations, meal week, authentication, account isolation, conflict handling and database migration.');
})().catch(e=>{console.error(e);process.exitCode=1});
