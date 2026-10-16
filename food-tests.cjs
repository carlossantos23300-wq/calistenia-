// Food: camera guesses map to foods, amounts scale per 100 g, products from Open Food Facts are read safely.
const assert=require('node:assert/strict'),F=require('./food-data.js');
assert.equal(new Set(F.foods.map(f=>f.id)).size,F.foods.length);
for(const f of F.foods){assert(f.kcal>=0&&f.kcal<=900,f.id);assert(f.p>=0&&f.c>=0&&f.f>=0,f.id);assert(f.por>0,f.id);if(!['vinho','cerveja','sangria','gin-tonico'].includes(f.id))assert(Math.abs(f.p*4+f.c*4+f.f*9-f.kcal)<=Math.max(60,f.kcal*.35),'energy check '+f.id)}
const top=cats=>F.match(cats)[0]?.food.id;
assert.equal(top([{label:'Neapolitan pizza',score:.86,src:'dish'}]),'pizza');
assert.equal(top([{label:'Burrito',score:.04,src:'dish'},{label:'banana',score:.11,src:'object'}]),'banana');
assert.equal(top([{label:'pineapple',score:.5,src:'object'}]),'ananas');
assert.equal(top([{label:'Chicken nugget',score:.5,src:'dish'}]),'nuggets');
assert.equal(top([{label:'Pasta salad',score:.43,src:'dish'}]),'salada-massa');
assert.equal(top([{label:'Francesinha',score:.25,src:'dish'}]),'francesinha');
assert.equal(F.match([{label:'Zzz',score:.9,src:'dish'}]).length,0);
assert.equal(F.search('bacalhau')[0].id,'bacalhau');assert(F.search('iogurte grego').some(f=>f.id==='iogurte-grego'));assert.deepEqual(F.search(''),[]);
assert.deepEqual(F.amount(F.byId.get('arroz'),150),{kcal:195,p:4.1,c:42,f:.5});
const p=F.fromProduct('3017620422003',{product_name:'Nutella',brands:'Nutella, Ferrero',serving_quantity:15,quantity:'400 g',nutriments:{'energy-kcal_100g':539,proteins_100g:6.3,carbohydrates_100g:57.5,fat_100g:30.9,sugars_100g:56.3,salt_100g:.107},nutriscore_grade:'e',image_front_small_url:'javascript:alert(1)'});
assert.equal(p.name,'Nutella');assert.equal(p.por,15);assert.equal(p.grade,'e');assert.equal(p.image,'');assert.equal(F.amount(p,15).kcal,81);assert.equal(F.amount(p,100).sug,56.3);
assert.equal(F.fromProduct('1',{product_name:'X',nutriments:{}}),null);assert.equal(F.fromProduct('1',{nutriments:{energy_100g:418.4}}).kcal,100);
assert.deepEqual(F.totals([{kcal:100,p:1.5,c:2,f:3},{kcal:50,p:1,c:0,f:0,sug:4}]),{kcal:150,p:2.5,c:2,f:3,sug:4});
assert(F.valid('5601234567890')&&!F.valid('12a4')&&!F.valid('1234567'));
console.log('PASS: '+F.foods.length+' foods with sane energy, camera guesses map to foods, amounts, products and totals.');
