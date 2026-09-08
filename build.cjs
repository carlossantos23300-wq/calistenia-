const fs=require('fs'),vm=require('vm');
const data=JSON.parse(fs.readFileSync('exercises.json','utf8'));
if(data.length<800||new Set(data.map(e=>e.id)).size!==data.length)throw Error('Invalid catalog');
fs.writeFileSync('exercise-data.js','window.EXERCISES='+JSON.stringify(data)+';\n');
const files=['index.html','library.css','library-core.js','library.js','workout-plans.js','exercise-data.js','manifest.json','sw.js','icon.png','icon-192.png','ATTRIBUTION.md'];
fs.mkdirSync('dist',{recursive:true});
for(const f of files){if(f.endsWith('.js'))new vm.Script(fs.readFileSync(f,'utf8'));fs.copyFileSync(f,'dist/'+f)}
console.log('Build complete: '+data.length+' unique exercises, '+files.length+' files.');
