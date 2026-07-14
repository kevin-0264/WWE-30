
/* ============================================================
   CHAMPIONSHIP MODE
============================================================ */
const TITLE_DEFS = [
  { id:'women',  belt:'🏆', name:"Women's World Championship" },
  { id:'ic',     belt:'🥇', name:"Intercontinental Championship" },
  { id:'tag',    belt:'👯', name:"Tag Team Championship" },
  { id:'mitb',   belt:'💼', name:"Money in the Bank" },
  { id:'los',    belt:'👑', name:"Last One Standing Championship" }
];
function loadTitles(){
  const saved = JSON.parse(localStorage.getItem('lostanding_titles')||'null');
  if(saved && saved.length===TITLE_DEFS.length) return saved;
  // First run: seed each title with a random champion from the roster
  const seedRnd = seededRand(777);
  return TITLE_DEFS.map(def=>{
    const champ = ROSTER[Math.floor(seedRnd()*ROSTER.length)];
    return {
      id: def.id,
      championId: champ.id,
      reignSince: new Date().toLocaleDateString(),
      defenses: 0,
      vacant: false,
      history: [{ name: champ.name, event:'Inaugural Champion', date: new Date().toLocaleDateString(), defenses:0 }]
    };
  });
}
function saveTitles(){ localStorage.setItem('lostanding_titles', JSON.stringify(state.titles)); }
function titleDef(id){ return TITLE_DEFS.find(t=>t.id===id); }
function titleRecord(id){ return state.titles.find(t=>t.id===id); }
function titleChampionWrestler(id){
  const rec = titleRecord(id);
  if(!rec || rec.vacant || rec.championId==null) return null;
  return ROSTER.find(w=>w.id===rec.championId) || null;
}
function wrestlerTitles(wrestlerId){
  return state.titles.filter(t=>!t.vacant && t.championId===wrestlerId).map(t=>titleDef(t.id).name);
}
function assignTitle(id, wrestler, eventLabel){
  const rec = titleRecord(id);
  if(!rec) return;
  rec.championId = wrestler.id;
  rec.vacant = false;
  rec.reignSince = new Date().toLocaleDateString();
  rec.defenses = 0;
  rec.history.unshift({ name: wrestler.name, event: eventLabel, date: rec.reignSince, defenses:0 });
  rec.history = rec.history.slice(0,8);
  saveTitles();
}
function recordDefense(id){
  const rec = titleRecord(id);
  if(!rec) return;
  rec.defenses = (rec.defenses||0) + 1;
  if(rec.history[0]) rec.history[0].defenses = rec.defenses;
  saveTitles();
}
function vacateTitle(id){
  const rec = titleRecord(id);
  if(!rec) return;
  rec.vacant = true;
  rec.championId = null;
  rec.defenses = 0;
  rec.history.unshift({ name:'— Vacated —', event:'Title Vacated', date:new Date().toLocaleDateString(), defenses:0 });
  rec.history = rec.history.slice(0,8);
  saveTitles();
  renderChampionships();
}
function titleCardHTML(def){
  const rec = titleRecord(def.id);
  const champ = titleChampionWrestler(def.id);
  const bodyHtml = (rec.vacant || !champ) ? `
      <div class="t-champ-photo"><span style="font-size:11px;color:var(--paper-dim);">VACANT</span></div>
      <div><div class="t-vacant-label">Title Vacant</div><div class="t-champ-since">Awaiting new champion</div></div>
    ` : `
      <div class="t-champ-photo">${champ.photo ? `<img src="${champ.photo}" alt="${champ.name}" onerror="this.style.display='none'">` : initials(champ.name)}</div>
      <div>
        <div class="t-champ-name">${champ.name}</div>
        <div class="t-champ-since">Champion since ${rec.reignSince}</div>
      </div>
    `;
  const historyHtml = rec.history.slice(0,4).map(h=>`<div class="t-history-row"><b>${h.name}</b><span>${h.event} · ${h.date}</span></div>`).join('');
  return `<div class="title-card ${rec.vacant?'vacant':''}">
    <div class="t-head"><span class="t-belt">${def.belt}</span><span class="t-name">${def.name}</span></div>
    <div class="t-body">${bodyHtml}</div>
    <div class="t-stats">
      <div><b>${rec.defenses||0}</b>Defenses</div>
      <div><b>${rec.history.length}</b>Total Reigns</div>
    </div>
    <div class="t-actions">
      <button class="btn small ghost" onclick="bookTitleMatch('${def.id}')">Book Title Match</button>
      ${!rec.vacant ? `<button class="btn small ghost" onclick="vacateTitle('${def.id}')">Vacate Title</button>` : ''}
    </div>
    <div class="t-history">${historyHtml}</div>
  </div>`;
}
function renderChampionships(){
  document.getElementById('titles-count').textContent = `${TITLE_DEFS.length} Titles`;
  document.getElementById('titles-grid').innerHTML = TITLE_DEFS.map(titleCardHTML).join('');
  const ranked = [...ROSTER].sort((a,b)=> (b.overall+b.popularity) - (a.overall+a.popularity)).slice(0,10);
  document.getElementById('rankings-list').innerHTML = ranked.map((w,i)=>`
    <div class="rank-row">
      <div class="rank-num">#${i+1}</div>
      <div class="rank-photo">${w.photo?`<img src="${w.photo}" alt="${w.name}" onerror="this.style.display='none'">`:initials(w.name)}</div>
      <div class="rank-name">${w.name} <span style="color:var(--paper-dim);font-weight:400;">"${w.nick}"</span></div>
      <div class="rank-pts">${w.overall} OVR</div>
    </div>`).join('');
  populateTitlePicker();
}
function bookTitleMatch(titleId){
  showScreen('single');
  setTimeout(()=>{
    const sel = document.getElementById('pickTitle');
    if(sel) sel.value = titleId;
  },0);
}
function populateTitlePicker(){
  const sel = document.getElementById('pickTitle');
  if(!sel) return;
  sel.innerHTML = `<option value="">No Title on the Line</option>` + TITLE_DEFS.map(def=>{
    const champ = titleChampionWrestler(def.id);
    const label = champ ? `${def.name} (Champion: ${champ.name})` : `${def.name} (Vacant)`;
    return `<option value="${def.id}">${label}</option>`;
  }).join('');
}
state.titles = loadTitles();
saveTitles();