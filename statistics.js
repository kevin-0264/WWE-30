
/* ============================================================
   STATISTICS DASHBOARD
============================================================ */
function loadStats(){ return JSON.parse(localStorage.getItem('lostanding_stats')||'{}'); }
function saveStats(){ localStorage.setItem('lostanding_stats', JSON.stringify(state.stats)); }
function loadRecords(){ return JSON.parse(localStorage.getItem('lostanding_records')||'null') || { fastestElim:null, longestSurvivor:null }; }
function saveRecords(){ localStorage.setItem('lostanding_records', JSON.stringify(state.records)); }
function ensureStat(id){
  if(!state.stats[id]) state.stats[id] = { wins:0, losses:0, matches:0, eliminations:0, rumbleWins:0 };
  return state.stats[id];
}
function formatSeconds(sec){
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec/60).toString().padStart(2,'0');
  const s = (sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}
function recordFastestElim(seconds, name, wrestlerId){
  if(state.records.fastestElim===null || seconds < state.records.fastestElim.seconds){
    state.records.fastestElim = { seconds, name, wrestlerId, date:new Date().toLocaleDateString() };
    saveRecords();
  }
}
function recordLongestSurvivor(seconds, name, wrestlerId){
  if(state.records.longestSurvivor===null || seconds > state.records.longestSurvivor.seconds){
    state.records.longestSurvivor = { seconds, name, wrestlerId, date:new Date().toLocaleDateString() };
    saveRecords();
  }
}
function statBarList(entries, key, max){
  if(entries.length===0) return `<div class="stat-empty">No data yet — book some matches to populate this chart.</div>`;
  const top = entries.slice(0,5);
  return top.map((w,i)=>`
    <div class="stat-bar-row">
      <span class="stat-bar-rank">#${i+1}</span>
      <span class="stat-bar-photo">${w.photo?`<img src="${w.photo}" alt="${w.name}" onerror="this.style.display='none'">`:initials(w.name)}</span>
      <span class="stat-bar-name">${w.name}</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${max>0?Math.round((w[key]/max)*100):0}%"></div></div>
      <span class="stat-bar-val">${w[key]}</span>
    </div>`).join('');
}
function recordBoxHTML(rec, valueLabel, formatFn){
  if(!rec) return `<div class="stat-empty">No data yet.</div>`;
  const w = ROSTER.find(x=>x.id===rec.wrestlerId);
  const photoHtml = w && w.photo ? `<img src="${w.photo}" alt="${rec.name}" onerror="this.style.display='none'">` : initials(rec.name);
  return `
    <div class="record-photo">${photoHtml}</div>
    <div>
      <div class="record-value">${formatFn(rec.seconds)}</div>
      <div class="record-name">${rec.name} · ${valueLabel} · ${rec.date}</div>
    </div>`;
}
function renderStatsDashboard(){
  const withStats = ROSTER.map(w=>({ ...w, ...ensureStat(w.id) }));
  const byWins = [...withStats].filter(w=>w.wins>0).sort((a,b)=>b.wins-a.wins);
  const byElims = [...withStats].filter(w=>w.eliminations>0).sort((a,b)=>b.eliminations-a.eliminations);
  document.getElementById('stat-most-wins').innerHTML = statBarList(byWins,'wins', byWins[0]?byWins[0].wins:0);
  document.getElementById('stat-most-elims').innerHTML = statBarList(byElims,'eliminations', byElims[0]?byElims[0].eliminations:0);
  document.getElementById('stat-longest-survivor').innerHTML = recordBoxHTML(state.records.longestSurvivor, 'survived', formatSeconds);
  document.getElementById('stat-fastest-elim').innerHTML = recordBoxHTML(state.records.fastestElim, 'match time', formatSeconds);

  const rumbleDurations = state.history
    .filter(h=>h.type==='Royal Rumble' && h.duration && h.duration.includes(':'))
    .map(h=>{ const [m,s] = h.duration.split(':').map(Number); return m*60+s; });
  const avgSecs = rumbleDurations.length ? Math.round(rumbleDurations.reduce((a,b)=>a+b,0)/rumbleDurations.length) : null;
  document.getElementById('stat-avg-time').innerHTML = avgSecs!==null
    ? `<div><div class="record-value">${formatSeconds(avgSecs)}</div><div class="record-name">Across ${rumbleDurations.length} Royal Rumble${rumbleDurations.length===1?'':'s'}</div></div>`
    : `<div class="stat-empty">No Royal Rumbles completed yet.</div>`;

  document.getElementById('stat-champ-history').innerHTML = TITLE_DEFS.map(def=>{
    const rec = titleRecord(def.id);
    const changes = Math.max(0, rec.history.length-1);
    return `<div class="champ-history-row"><span class="belt">${def.belt} ${def.name}</span><span class="cnt">${changes} title change${changes===1?'':'s'}</span></div>`;
  }).join('');
}
state.stats = loadStats();
state.records = loadRecords();
