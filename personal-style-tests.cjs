const assert=require('node:assert/strict'),S=require('./personal-style.js');
assert.deepEqual(S.sanitize(null),S.defaults);assert.deepEqual(S.sanitize({accent:'url(x)',density:'bad',motion:'fast',images:'yes'}),S.defaults);
const p=S.sanitize({accent:'#012345',density:'compact',motion:'quiet',images:false,week:false,goal:false,shortcuts:false});assert.equal(p.accent,'#012345');assert.equal(p.images,false);assert.equal(p.density,'compact');assert.equal(p.motion,'quiet');
const lum=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
for(const accent of ['#000000','#ffffff','#d8edba','#b8d7ff','#d1bdf3','#f7b9d0','#ffb793','#f0d6a6','#ff0000','#0011ff'])for(const light of [false,true]){const a=lum(S.textColor(accent,light)),b=lum(light?'#f8f8f3':'#111610');assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,accent+' text contrast');}
for(const accent of ['#000000','#ffffff','#ff0000','#777777','#d8edba','#d1bdf3','#f7b9d0']){const a=lum(accent),b=lum(S.buttonColor(accent));assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5);}
console.log('PASS: invalid preferences fall back safely; custom presentation is retained; accent text and buttons remain readable.');
