let tasks = [], logs = [];
const els = {
  taskInput: document.getElementById('taskInput'),
  priorityInput: document.getElementById('priorityInput'),
  dueDateInput: document.getElementById('dueDateInput'),
  tagInput: document.getElementById('tagInput'),
  descInput: document.getElementById('descInput'),
  addBtn: document.getElementById('addBtn'),
  bulkCompleteBtn: document.getElementById('bulkCompleteBtn'),
  clearAllBtn: document.getElementById('clearAllBtn'),
  statusFilter: document.getElementById('statusFilter'),
  priorityFilter: document.getElementById('priorityFilter'),
  tagFilter: document.getElementById('tagFilter'),
  searchInput: document.getElementById('searchInput'),
  sortOption: document.getElementById('sortOption'),
  taskList: document.getElementById('taskList'),
  logsDiv: document.getElementById('logs'),
  logFilter: document.getElementById('logFilter'),
  logSearch: document.getElementById('logSearch'),
  clearLogsBtn: document.getElementById('clearLogsBtn'),
  themeToggle: document.getElementById('themeToggle'),
  viewToggleBtn: document.getElementById('viewToggleBtn')
};
let gridView = true;
function init() {
  load(); renderTasks(); renderLogs();
  els.addBtn.onclick = addTask;
  els.bulkCompleteBtn.onclick = bulkComplete;
  els.clearAllBtn.onclick = clearAll;
  [els.statusFilter, els.priorityFilter, els.tagFilter, els.searchInput, els.sortOption].forEach(e => e.onchange = renderTasks);
  [els.logFilter, els.logSearch].forEach(e => e.oninput = renderLogs);
  els.clearLogsBtn.onclick = clearLogs;
  els.themeToggle.onclick = toggleTheme;
  els.viewToggleBtn.onclick = toggleView;
}
function log(action, msg) {
  const time = new Date().toLocaleTimeString('fr-FR');
  logs.unshift({ time, action, msg });
  localStorage.setItem('logs', JSON.stringify(logs));
  renderLogs();
}
function load() {
  tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  logs = JSON.parse(localStorage.getItem('logs') || '[]');
}
function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }
function addTask() { const t = els.taskInput.value.trim(); if (!t) return; const tags = els.tagInput.value.split(',').map(x=>x.trim()).filter(Boolean);const obj={id:Date.now(),text:t,priority:els.priorityInput.value,due:els.dueDateInput.value||null,tags,desc:els.descInput.value.trim(),completed:false,created:Date.now()};tasks.unshift(obj);saveTasks();renderTasks();log('add',t);['taskInput','tagInput','descInput','dueDateInput'].forEach(k=>els[k].value='');}
function bulkComplete() { tasks=tasks.map(x=>({...x,completed:true}));saveTasks();renderTasks();log('complete','Toutes tâches'); }
function clearAll() { if(!confirm('Tout effacer ?'))return;tasks=[];saveTasks();renderTasks();log('delete','Toutes tâches'); }
function toggleComplete(id) { tasks=tasks.map(x=>x.id===id?{...x,completed:!x.completed}:x);saveTasks();renderTasks();const o=tasks.find(x=>x.id===id);log('complete',o.text);}    
function editTask(id) { const o=tasks.find(x=>x.id===id);const n=prompt('Modifier la tâche',o.text);if(n!=null&&n.trim()){o.text=n.trim();saveTasks();renderTasks();log('edit',o.text);} }
function deleteTask(id) { if(!confirm('Supprimer ?'))return;const o=tasks.find(x=>x.id===id);tasks=tasks.filter(x=>x.id!==id);saveTasks();renderTasks();log('delete',o.text);}        
function filterSortTasks(){let a=[...tasks];const sf=els.statusFilter.value;if(sf==='active')a=a.filter(x=>!x.completed);if(sf==='completed')a=a.filter(x=>x.completed);const pf=els.priorityFilter.value;if(pf)a=a.filter(x=>x.priority===pf);const tf=els.tagFilter.value;if(tf)a=a.filter(x=>x.tags.includes(tf));const kw=els.searchInput.value.toLowerCase();if(kw)a=a.filter(x=>x.text.toLowerCase().includes(kw));const so=els.sortOption.value;const cmp={createdDesc:(b,a)=>a.created-b.created,createdAsc:(a,b)=>a.created-b.created,dueAsc:(a,b)=>((a.due||'')).localeCompare(b.due||''),dueDesc:(a,b)=>((b.due||'')).localeCompare(a.due||'' )}[so]||((b,a)=>a.created-b.created);a.sort(cmp);return a;}
function renderTasks(){els.taskList.className='task-list '+(gridView?'grid-view':'list-view');els.viewToggleBtn.innerHTML=gridView?'<i class="fas fa-list"></i>':'<i class="fas fa-th-large"></i>';els.tagFilter.innerHTML='<option value="">Tous tags</option>'+[...new Set(tasks.flatMap(x=>x.tags))].sort().map(t=>`<option value="${t}">${t}</option>`).join('');els.taskList.innerHTML=filterSortTasks().map(x=>`
  <li class="task-item prio-${x.priority}${x.completed?' task-completed':''}">
    <div class="task-header">
      <input type="checkbox" ${x.completed?'checked':''} onchange="toggleComplete(${x.id})">
      <span class="task-title">${x.text}</span>
      <span class="btn-neutral"><i class="fas fa-ellipsis-h"></i></span>
    </div>
    ${x.desc?`<div class="task-description">${x.desc}</div>`:''}
    <div class="task-meta">
      ${x.due?`<span><i class="fas fa-calendar-alt"></i> ${x.due}</span>`:''}
      <span><i class="fas fa-clock"></i> ${new Date(x.created).toLocaleDateString('fr-FR')}</span>
    </div>
    <div class="task-tags">${x.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
    <div class="actions">
      <button onclick="editTask(${x.id})"><i class="fas fa-edit"></i></button>
      <button onclick="deleteTask(${x.id})"><i class="fas fa-trash"></i></button>
    </div>
  </li>
`).join('');}
function filterSortLogs(){let a=[...logs];const lf=els.logFilter.value;if(lf!=='all')a=a.filter(x=>x.action===lf);const kw=els.logSearch.value.toLowerCase();if(kw)a=a.filter(x=>x.msg.toLowerCase().includes(kw));return a;}
function renderLogs(){els.logsDiv.innerHTML=filterSortLogs().map(x=>`<div class="log-entry"><span class="log-time">${x.time}</span><span class="log-action log-${x.action}">${x.action}</span><span class="log-msg">${x.msg}</span></div>`).join('');}
function clearLogs(){if(!confirm('Effacer tous les logs ?'))return;logs=[];localStorage.setItem('logs','[]');renderLogs();}
function toggleTheme(){document.body.classList.toggle('light-theme');const i=els.themeToggle.querySelector('i');i.classList.toggle('fa-sun');i.classList.toggle('fa-moon');}
function toggleView(){gridView=!gridView;renderTasks();}
window.toggleComplete=toggleComplete;window.editTask=editTask;window.deleteTask=deleteTask;
init();