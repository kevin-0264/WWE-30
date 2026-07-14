
/* ============================================================
   RIVALRY SYSTEM
============================================================ */
function rivalryKey(id1,id2){ return id1<id2 ? `${id1}-${id2}` : `${id2}-${id1}`; }
function loadRivalries(){ return JSON.parse(localStorage.getItem('lostanding_rivalries')||'{}'); }
function saveRivalries(){ localStorage.setItem('lostanding_rivalries', JSON.stringify(state.rivalries)); }
function getRivalry(id1,id2){
  const key = rivalryKey(id1,id2);
  if(!state.rivalries[key]){
    state.rivalries[key] = { a:Math.min(id1,id2), b:Math.max(id1,id2), hatred:0, respect:50, matches:0, lastEvent:'', lastDate:'', maxedShown:false };
  }
  return state.rivalries[key];
}
function rivalryLevel(riv){ return Math.max(1, Math.min(5, Math.ceil(riv.hatred/20))); }
function bumpRivalry(id1,id2,eventLabel){
  if(id1==null || id2==null || id1===id2) return null;
  const riv = getRivalry(id1,id2);
  riv.hatred = Math.min(100, riv.hatred + 10);
  riv.respect = Math.max(0, riv.respect - 5);
  riv.matches += 1;
  riv.lastEvent = eventLabel;
  riv.lastDate = new Date().toLocaleDateString();
  const wasMaxed = riv.maxedShown;
  const isMaxNow = rivalryLevel(riv)>=5;
  let justMaxed = false;
  if(isMaxNow && !wasMaxed){ riv.maxedShown = true; justMaxed = true; }
  saveRivalries();
  if(justMaxed){
    const wa = ROSTER.find(w=>w.id===riv.a), wb = ROSTER.find(w=>w.id===riv.b);
    return { level:5, justMaxed:true, nameA: wa?wa.name:'', nameB: wb?wb.name:'' };
  }
  return { level: rivalryLevel(riv), justMaxed:false };
}
function topRivalFor(wrestlerId){
  let best=null;
  Object.values(state.rivalries).forEach(r=>{
    if(r.a!==wrestlerId && r.b!==wrestlerId) return;
    if(!best || r.hatred>best.hatred) best = r;
  });
  if(!best) return null;
  const otherId = best.a===wrestlerId ? best.b : best.a;
  const other = ROSTER.find(w=>w.id===otherId);
  return other ? { name: other.name, level: rivalryLevel(best) } : null;
}
function rivalryCardHTML(riv){
  const wa = ROSTER.find(w=>w.id===riv.a), wb = ROSTER.find(w=>w.id===riv.b);
  if(!wa||!wb) return '';
  const level = rivalryLevel(riv);
  const maxed = level>=5;
  return `<div class="rivalry-card ${maxed?'maxed':''}">
    ${maxed?'<div class="rv-maxed-tag">Blood Feud</div>':''}
    <div class="rv-pair">
      <div class="rv-photo">${wa.photo?`<img src="${wa.photo}" alt="${wa.name}" onerror="this.style.display='none'">`:initials(wa.name)}</div>
      <div class="rv-vs">VS</div>
      <div class="rv-photo">${wb.photo?`<img src="${wb.photo}" alt="${wb.name}" onerror="this.style.display='none'">`:initials(wb.name)}</div>
    </div>
    <div class="rv-names"><b>${wa.name}</b> &nbsp;vs&nbsp; <b>${wb.name}</b></div>
    <div class="rv-stars">${'★'.repeat(level)}${'☆'.repeat(5-level)}</div>
    <div class="rv-bar-row"><span class="rv-label">Hatred</span><div class="rv-bar-track"><div class="rv-bar-fill hatred" style="width:${riv.hatred}%"></div></div></div>
    <div class="rv-bar-row"><span class="rv-label">Respect</span><div class="rv-bar-track"><div class="rv-bar-fill respect" style="width:${riv.respect}%"></div></div></div>
    <div class="rv-meta"><span>${riv.matches} matches</span><span>Last: ${riv.lastEvent} · ${riv.lastDate}</span></div>
  </div>`;
}
function renderRivalries(){
  const list = Object.values(state.rivalries).filter(r=>r.matches>0)
    .sort((a,b)=> rivalryLevel(b)-rivalryLevel(a) || b.hatred-a.hatred);
  document.getElementById('rivalries-count').textContent = `${list.length} Active`;
  document.getElementById('rivalry-grid').innerHTML = list.length
    ? list.map(rivalryCardHTML).join('')
    : `<div class="panel-box">No rivalries yet. Book Single Matches or run Royal Rumbles to start building history between wrestlers.</div>`;
}
state.rivalries = loadRivalries();
