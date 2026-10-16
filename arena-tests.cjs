// Arena: landmarks land where they are drawn, moves are recognised, scores and the board behave.
const assert=require('node:assert/strict');global.window=undefined;const A=require('./arena.js');
const c=A.cover(640,480,400,800);assert.equal(c.s,800/480);assert(Math.abs(c.ox-(400-640*c.s)/2)<1e-9);
const p=A.toScreen({x:.5,y:.5,visibility:.9},640,480,c,400);assert(Math.abs(p.x-200)<1e-9&&Math.abs(p.y-400)<1e-9&&p.v===.9);
assert.equal(A.toScreen({x:.6,y:.5},640,480,c,400).x<200,true);
const pt=Array.from({length:33},()=>({x:200,y:400,v:.9}));pt[11]={x:160,y:300,v:.9};pt[12]={x:240,y:300,v:.9};pt[23]={x:170,y:460,v:.9};pt[24]={x:230,y:460,v:.9};pt[0]={x:200,y:240,v:.9};pt[15]={x:120,y:420,v:.9};pt[16]={x:280,y:420,v:.9};
const b=A.body(pt);assert.equal(b.sw,80);assert.equal(b.cx,200);assert.equal(b.full,true);assert.equal(A.body(null),null);
const base={sy:300,cx:200,torso:160,sw:80};
assert.equal(A.dodgeOk('duck',b,base),false);assert.equal(A.dodgeOk('duck',{...b,sy:360},base),true);
assert.equal(A.dodgeOk('left',{...b,cx:260},base),true);assert.equal(A.dodgeOk('right',{...b,cx:260},base),false);assert.equal(A.dodgeOk('right',{...b,cx:140},base),true);
assert.equal(A.dodgeOk('up',b,base),false);assert.equal(A.dodgeOk('up',{...b,wrists:[{x:180,y:200},{x:220,y:190}]},base),true);
assert.equal(A.dodgeOk('wide',{...b,wrists:[{x:60,y:300},{x:340,y:300}]},base),true);assert.equal(A.dodgeOk('wide',b,base),false);
assert.deepEqual(A.judge(50),['PERFEITO!',30]);assert.deepEqual(A.judge(-200),['BOM!',15]);assert.deepEqual(A.judge(300),['OK',8]);
assert.equal(A.mult(0),1);assert.equal(A.mult(5),2);assert.equal(A.mult(99),5);assert.equal(A.kcal(6,70,60),7);
assert.equal(A.rank(0,[100,200,300,400]),'Aquecimento');assert.equal(A.rank(450,[100,200,300,400]),'Lenda 🔥');
const e={name:'Eu',score:50},t=A.top([{name:'A',score:90},{name:'B',score:40}],e);assert.equal(t.pos,2);assert.equal(t.list.length,3);
const full=A.top([1,2,3,4,5].map(n=>({name:'x',score:n*100})),{name:'y',score:10});assert.equal(full.pos,0);assert.equal(full.list.length,5);
console.log('PASS: arena mapping, body measures, dodge moves, timing, combos, calories, ranks and scoreboard.');
