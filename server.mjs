import {validState} from './validate-state.mjs';
const allowed=new Set(['cal_library_workouts','cal_library_favorites','cal_library_draft','cal_calendar','cal_progress','cal_personal','cal_active_run','cal_meal_swaps','cal_tools','cal_extra']);
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','vary':'oai-authenticated-user-id'}});
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname!=='/api/state')return env.ASSETS.fetch(request);
 const user=request.headers.get('oai-authenticated-user-id');
 if(!user)return json({error:'sign_in_required'},401);
 if(!env.DB)return json({error:'storage_unavailable'},503);
 try{
  if(request.method==='GET'){
   const rows=await env.DB.prepare('SELECT state_key,value_json,revision FROM user_state WHERE user_id = ?').bind(user).all();
   const values={},revisions={};for(const r of rows.results){values[r.state_key]=JSON.parse(r.value_json);revisions[r.state_key]=r.revision}
   return json({user,values,revisions});
  }
  if(request.method!=='PUT')return json({error:'method_not_allowed'},405);
  if(request.headers.get('origin')!==url.origin||!request.headers.get('content-type')?.includes('application/json'))return json({error:'invalid_origin'},403);
  const body=await request.text();if(body.length>1500000)return json({error:'too_large'},413);
  let input;try{input=JSON.parse(body)}catch{return json({error:'invalid_json'},400)}
  if(!allowed.has(input.key)||!Number.isSafeInteger(input.revision)||input.revision<0||input.value===undefined)return json({error:'invalid_state'},400);
  if(input.user!==user)return json({error:'account_changed'},403);
  if(!validState(input.key,input.value))return json({error:'invalid_value'},400);
  const encoded=JSON.stringify(input.value),stamp=new Date().toISOString();
  const statement=input.revision===0
   ?env.DB.prepare('INSERT INTO user_state (user_id,state_key,value_json,revision,updated_at) VALUES (?,?,?,1,?) ON CONFLICT(user_id,state_key) DO NOTHING').bind(user,input.key,encoded,stamp)
   :env.DB.prepare('UPDATE user_state SET value_json = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND state_key = ? AND revision = ?').bind(encoded,stamp,user,input.key,input.revision);
  const result=await statement.run();if(!result.meta.changes)return json({error:'conflict'},409);
  return json({revision:input.revision+1});
 }catch{return json({error:'storage_error'},500)}
}};
