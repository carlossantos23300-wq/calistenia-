(() => {
const keys=['cal_library_workouts','cal_library_favorites','cal_library_draft','cal_calendar','cal_progress','cal_personal'];
let values={},revisions={},pending={},user=null,busy=false,blocked=false,storageOK=true;
const status=message=>{const el=document.getElementById('syncStatus');if(el)el.textContent=message};
const localRead=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const localWrite=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{storageOK=false;status('Armazenamento local indisponível. Mantém a app aberta até sincronizar.');return false}};
const persist=()=>user&&localWrite('cal_cloud_cache_'+user,{values,revisions,pending});
async function flush(){if(busy||blocked||!user)return;busy=true;
 try{for(const key of Object.keys(pending)){const value=JSON.stringify(values[key]),response=await fetch('/api/state',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({user,key,value:JSON.parse(value),revision:revisions[key]||0})});
 if(response.status===409){blocked=true;status('Há alterações noutro dispositivo. Guarda uma cópia antes de recarregar os dados da conta.');document.getElementById('resolveSync').classList.remove('hidden');return}
 if(!response.ok)throw Error();revisions[key]=(await response.json()).revision;if(JSON.stringify(values[key])===value)delete pending[key];persist();}
 status(Object.keys(pending).length?'A guardar na conta…':'Guardado na tua conta');
 }catch{status('Sem sincronização. As alterações ficam neste dispositivo até voltares a ligar.')}finally{busy=false;if(Object.keys(pending).length&&!blocked&&navigator.onLine)setTimeout(flush,15000)}}
async function init(){
 const previous=localRead('cal_cloud_user',null);
 try{const response=await fetch('/api/state',{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error();const remote=await response.json();user=remote.user;
 const cache=localRead('cal_cloud_cache_'+user,{});values=remote.values;revisions=remote.revisions;
 for(const key of keys){if(cache.pending?.[key]){if((cache.revisions?.[key]||0)!==(remote.revisions[key]||0)){blocked=true;status('Existem alterações por conciliar entre dispositivos.');document.getElementById('resolveSync').classList.remove('hidden')}values[key]=cache.values[key];revisions[key]=cache.revisions?.[key]||0;pending[key]=true}else if(values[key]===undefined&&(!previous||previous===user)){const old=localRead(key,undefined);if(old!==undefined){values[key]=old;pending[key]=true}}}
 localWrite('cal_cloud_user',user);persist();if(!blocked){status('Conta ligada');flush()}
 }catch{user=previous;if(user){const cache=localRead('cal_cloud_cache_'+user,{});values=cache.values||{};revisions=cache.revisions||{};pending=cache.pending||{}}else{for(const key of keys){const v=localRead(key,undefined);if(v!==undefined)values[key]=v}}status('Modo local. Liga-te à internet para sincronizar a conta.');}
}
window.AccountSync={init,read:(k,f)=>values[k]??f,write(k,v){if(!keys.includes(k))return localWrite(k,v);values[k]=structuredClone(v);pending[k]=true;localWrite(k,v);persist();if(!blocked){status(user?'A guardar na conta…':'Guardado neste dispositivo. A conta ainda não está ligada.');flush()}return storageOK||navigator.onLine},exportData:()=>({values,revisions,pending}),async useCloud(){const r=await fetch('/api/state',{cache:'no-store'});if(!r.ok)throw Error();const remote=await r.json();values=remote.values;revisions=remote.revisions;pending={};blocked=false;user=remote.user;for(const k of keys)localWrite(k,values[k]??(k==='cal_library_draft'?{}:[]));persist();location.reload()}};
window.addEventListener('online',()=>{if(user)flush();else location.reload()});
})();
