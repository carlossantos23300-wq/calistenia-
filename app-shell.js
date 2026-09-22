window.initAppShell=function({switchPanel}){
 const $=id=>document.getElementById(id);
 const fold=(node,title,parent)=>{if(!node)return;const d=document.createElement('details');d.className='studio-fold';const s=document.createElement('summary');s.textContent=title;d.append(s,node);parent.append(d);node.classList.remove('hidden');return d;};
 // Move existing controls, preserving their event handlers and saved data.
 for(const detail of [...$('todayPanel').children].filter(n=>n.tagName==='DETAILS'&&!n.classList.contains('routine-fold'))){
  (detail.classList.contains('meal-fold')?$('nutritionPanel'):$('toolsPanel')).append(detail);
 }
 fold($('plusTraining'),'Organizar a semana e registar atividades',$('calendarPanel'));
 fold($('plusLearning'),'Técnica, objetivos e notas',$('progressPanel'));
 fold($('plusFood'),'Receitas e preparação de refeições',$('nutritionPanel'));
 $('profilePanel').append($('plusData'));
 $('plusData').classList.remove('hidden');
 const account=document.querySelector('.account-bar');$('profilePanel').insertBefore(account,$('plusData'));
 document.querySelector('.routine-fold')?.remove();
 // Long secondary forms become individually discoverable sections.
 for(const id of ['plusTraining','plusLearning','plusFood','plusData']){
  const container=$(id);let group=null;
  for(const child of [...container.children]){
   if(child.tagName==='H4'){group=document.createElement('details');group.className='studio-subsection';const summary=document.createElement('summary');summary.textContent=child.textContent;group.append(summary);child.replaceWith(group);}
   else if(group)group.append(child);
  }
 }
 const discovery=document.querySelector('.plan-discovery');
 const filters=document.createElement('details');filters.className='studio-filters';
 const label=document.createElement('summary');label.textContent='Filtrar por material, nível e duração';filters.append(label);
 for(const n of [...discovery.children])if(!n.classList.contains('plan-search'))filters.append(n);
 discovery.append(filters);
 const quick=document.createElement('div');quick.className='studio-categories';quick.setAttribute('aria-label','Categorias de treino');
 for(const [value,labelText] of [['','Todos'],['Casa','Em casa'],['Barra','Na barra'],['Halteres','Halteres'],['Mobilidade','Mobilidade']]){
  const b=document.createElement('button');b.className='chip';b.textContent=labelText;b.dataset.category=value;b.type='button';b.setAttribute('aria-pressed',String(value===$('planGroup').value));
  b.onclick=()=>{$('planGroup').value=value;$('planGroup').dispatchEvent(new Event('change'));};quick.append(b);
 }
 discovery.after(quick);
 const updateCategories=()=>quick.querySelectorAll('button').forEach(b=>{const active=b.dataset.category===$('planGroup').value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 $('planGroup').addEventListener('change',updateCategories);$('clearPlanFilters').addEventListener('click',updateCategories);updateCategories();
 $('showProfile').onclick=()=>switchPanel('profile');$('showTools').onclick=()=>switchPanel('tools');
 // The builder is available on demand instead of competing with discovery.
 const toggle=document.createElement('button');toggle.id='studioBuilderToggle';toggle.className='secondary';toggle.textContent='Montar ou editar o meu treino';toggle.type='button';
 $('trainingNav').after(toggle);
 toggle.onclick=()=>{document.body.classList.add('builder-expanded');$('builder').scrollIntoView({behavior:'smooth',block:'start'});};
 for(const id of ['mobileBuilder','reviewNextSession'])$(id)?.addEventListener('click',()=>{document.body.classList.add('builder-expanded');toggle.setAttribute('aria-expanded','true');});
 document.addEventListener('click',e=>{if(e.target.closest('[data-use-plan],[data-calendar-open],#useQuickWorkout,#loadWarmup,#loadCooldown')){document.body.classList.add('builder-expanded');toggle.setAttribute('aria-expanded','true');}} ,true);
 window.addEventListener('studio-panel',e=>{const panel=e.detail;document.body.dataset.screen=panel;toggle.classList.toggle('hidden',!['plans','catalog'].includes(panel));const titles={today:'O teu espaço',plans:'Treinar',catalog:'Biblioteca',calendar:'Calendário',tools:'Ferramentas',progress:'Evolução',nutrition:'Alimentação',profile:'Perfil'};$('screenTitle').textContent=titles[panel]||'Treinar';});
};
