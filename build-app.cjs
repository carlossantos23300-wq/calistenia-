const fs=require('fs'),path=require('path'),vm=require('vm');
const translations=JSON.parse(fs.readFileSync('translations-pt.json','utf8'));
const data=JSON.parse(fs.readFileSync('exercises.json','utf8'));
if(data.length!==876||Object.keys(translations).length!==876)throw Error('Incomplete catalog or translations');
translations.Pushups.instructions=['Apoia as mãos no chão aproximadamente à largura dos ombros, com os braços estendidos e o corpo alinhado dos ombros aos tornozelos.','Flete os cotovelos e baixa o peito de forma controlada, mantendo o abdómen firme.','Empurra o chão para regressar à posição inicial, sem deixar a anca cair.'];
translations.Pullups.title='Elevações na barra';
translations.Plank.instructions=['Apoia os antebraços e as pontas dos pés no chão, com os cotovelos por baixo dos ombros.','Mantém o corpo alinhado, o abdómen firme e a respiração regular durante o tempo escolhido. Para se perderes o alinhamento.'];
for(const e of data)e.pt=translations[e.id];
fs.writeFileSync('exercise-data.js','window.EXERCISES='+JSON.stringify(data)+';\n');
const output=path.resolve(__dirname,'dist');if(path.dirname(output)!==__dirname||path.basename(output)!=='dist')throw Error('Unsafe build output');
fs.mkdirSync(path.join(output,'client'),{recursive:true});fs.mkdirSync(path.join(output,'server'),{recursive:true});fs.mkdirSync(path.join(output,'.openai'),{recursive:true});
fs.writeFileSync('state-validator.js',fs.readFileSync('validate-state.mjs','utf8').replace('export function validState','function validState')+'\nwindow.validState=validState;\n');
const files=['index.html','styles.css','app-shell.js','personal-style.js','training-atlas.js','library-core.js','library.js','workout-plans.js','exercise-data.js','account-sync.js','feature-core.js','features.js','personal.js','training-core.js','custom-exercises.js','exercise-art.js','extras-core.js','practical-core.js','training-runner.js','daily-tools.js','pullup-path.js','meals.js','manifest.json','sw.js','icon.png','icon-192.png','ATTRIBUTION.md','plus-core.js','recipes.js','state-validator.js','video-data.js','execution-media.js','plus-tools.js','welcome.js','extras.js','motivation.js','beat.js','body3d.js','photos.js','camera.js','outdoors.js','practical.js','organize.js','news.js','everyday.js'];
for(const f of files){if(f.endsWith('.js'))new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});fs.copyFileSync(f,path.join(output,'client',f));if(fs.existsSync(path.join(output,f)))fs.unlinkSync(path.join(output,f));}
fs.cpSync('media',path.join(output,'client','media'),{recursive:true});fs.copyFileSync('server.mjs',path.join(output,'server/index.js'));fs.copyFileSync('validate-state.mjs',path.join(output,'server/validate-state.mjs'));fs.copyFileSync('.openai/hosting.json',path.join(output,'.openai/hosting.json'));
fs.cpSync('drizzle',path.join(output,'.openai/drizzle'),{recursive:true});
console.log('Build complete: 876 translated exercises, Worker, account migration and '+files.length+' client files.');
