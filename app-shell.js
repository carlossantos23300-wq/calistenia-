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
 for(const [value,labelText] of [['','Todos'],['Casa','Em casa'],['Barra','Na barra'],['Halteres','Halteres'],['Mobilidade','Mobilidade'],['Temáticos','Temáticos']]){
  const b=document.createElement('button');b.className='chip';b.textContent=labelText;b.dataset.category=value;b.type='button';b.setAttribute('aria-pressed',String(value===$('planGroup').value));
  b.onclick=()=>{$('planGroup').value=value;$('planGroup').dispatchEvent(new Event('change'));};quick.append(b);
 }
 discovery.after(quick);
 const updateCategories=()=>quick.querySelectorAll('button').forEach(b=>{const active=b.dataset.category===$('planGroup').value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 $('planGroup').addEventListener('change',updateCategories);$('clearPlanFilters').addEventListener('click',updateCategories);updateCategories();
 $('showProfile').onclick=()=>switchPanel('profile');$('showTools').onclick=()=>switchPanel('tools');
 // Keep everyday actions close to the next session.
 const shortcuts=document.createElement('nav');shortcuts.className='home-shortcuts';shortcuts.setAttribute('aria-label','Atalhos do início');
 const icons={saved:'<rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 4V2h6v2M9 10h6M9 15h4"/>',catalog:'<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>',quick:'<path d="M13 2L4 14h7l-1 8 10-12h-7l1-8Z"/>'};
 for(const [action,title,caption] of [['saved','Os meus planos','Abre uma sessão guardada'],['catalog','Biblioteca','Encontra o teu exercício'],['quick','Treino rápido','Escolhe o tempo disponível']]){const b=document.createElement('button');b.type='button';b.className='home-shortcut';b.innerHTML=`<span class="shortcut-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[action]}</svg></span><span><strong>${title}</strong><small>${caption}</small></span><span class="shortcut-arrow" aria-hidden="true">↗</span>`;b.onclick=()=>{if(action==='saved')$('savedNav').click();else if(action==='catalog'){switchPanel('catalog');$('search').focus({preventScroll:true});}else{switchPanel('tools');const quick=$('quickForm').closest('details');quick.open=true;quick.scrollIntoView({behavior:'smooth',block:'start'});}};shortcuts.append(b);}
 document.querySelector('.today-heading').after(shortcuts);
 // Move the original filter nodes so all existing handlers remain attached.
 const advanced=document.createElement('details');advanced.className='catalog-advanced';const advancedLabel=document.createElement('summary');advancedLabel.textContent='Filtros e opções';advanced.append(advancedLabel);
 const filterGrid=$('catalogPanel').querySelector('.filter-grid'),quiet=$('quietOnly').closest('label'),quietNote=quiet.nextElementSibling,tools=$('catalogPanel').querySelector('.tool-tabs');
 filterGrid.before(advanced);advanced.append(filterGrid,quiet,quietNote,tools);
 const advancedInputs=['muscle','equipment','level','quietOnly','ownedOnly','travelOnly','videoOnly'];
 const updateFilters=()=>{const active=advancedInputs.filter(id=>$(id).type==='checkbox'?$(id).checked:!!$(id).value).length;advancedLabel.textContent=active?`Filtros e opções · ${active} ${active===1?'ativo':'ativos'}`:'Filtros e opções';advanced.classList.toggle('has-filters',active>0);};
 for(const id of advancedInputs)$(id).addEventListener('change',updateFilters);$('resetFilters').addEventListener('click',()=>queueMicrotask(updateFilters));updateFilters();
 // Editing belongs to a plan; there is no exercise-selection cart.
 const editor=$('planEditorDialog');editor.append($('builder'));$('builder').classList.remove('hidden');
 const resume=document.createElement('button');resume.id='resumePlanEditing';resume.className='resume-plan text-button hidden';resume.type='button';resume.textContent='Continuar a adaptar o meu plano ↗';document.querySelector('.plans-heading').append(resume);
 const libraryIntro=document.createElement('div');libraryIntro.className='library-intro';libraryIntro.innerHTML='<p class="eyebrow">CONHECE CADA MOVIMENTO</p><h2>Exercícios disponíveis.</h2><p>Consulta a execução. Para trocar um movimento, abre o teu plano e escolhe “Trocar exercício”.</p>';$('catalogPanel').prepend(libraryIntro);
 const returnToPlan=document.createElement('button');returnToPlan.type='button';returnToPlan.className='text-button';returnToPlan.textContent='Voltar à adaptação do plano ↗';libraryIntro.append(returnToPlan);
 const refreshEditor=()=>{const hasPlan=Number($('selectionCount').textContent)>0;resume.classList.toggle('hidden',!hasPlan);returnToPlan.classList.toggle('hidden',!hasPlan);};new MutationObserver(refreshEditor).observe($('selectionCount'),{childList:true,characterData:true,subtree:true});refreshEditor();
 editor.addEventListener('close',()=>window.dispatchEvent(new Event('plan-editor-closed')));
 const openEditor=()=>{if(!Number($('selectionCount').textContent))return;$('editorFeedback').textContent='';if(!editor.open){editor.showModal();editor.scrollTop=0;}};resume.onclick=openEditor;returnToPlan.onclick=openEditor;
 window.addEventListener('edit-loaded-plan',()=>queueMicrotask(openEditor));window.addEventListener('plan-saved',()=>{$('editorFeedback').textContent='A tua adaptação foi guardada.';});
 window.addEventListener('studio-panel',e=>{const panel=e.detail;document.body.dataset.screen=panel;const titles={today:'O teu espaço',plans:'Planos',catalog:'Exercícios',calendar:'Calendário',tools:'Ferramentas',progress:'Evolução',nutrition:'Alimentação',profile:'Perfil'};$('screenTitle').textContent=titles[panel]||'Treinar';});
 initPersonalStyle();
};
