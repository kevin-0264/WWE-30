
/* ============================================================
   HALL OF FAME
============================================================ */
function extractYear(dateStr){
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
}
function hofReigningCardHTML(def){
  const champ = titleChampionWrestler(def.id);
  if(!champ) return '';
  return `<div class="hof-reigning-card">
    <div class="hof-belt-label">${def.belt} ${def.name}</div>
    <div class="hof-photo-sm">${champ.photo?`<img src="${champ.photo}" alt="${champ.name}" onerror="this.style.display='none'">`:initials(champ.name)}</div>
    <div class="hof-name-sm">${champ.name}</div>
    <div class="hof-tag">Reigning</div>
  </div>`;
}
function collectInductees(){
  const inductees = [];
  TITLE_DEFS.forEach(def=>{
    const rec = titleRecord(def.id);
    // history[0] is the current/active reign (or vacancy) — everything after it has concluded
    rec.history.slice(1).forEach(h=>{
      if(!h.name || h.name.includes('Vacated')) return;
      inductees.push({
        name: h.name, title: def.name, belt: def.belt,
        defenses: h.defenses||0, date: h.date, year: extractYear(h.date)
      });
    });
  });
  return inductees;
}
function hofCardHTML(entry){
  const w = ROSTER.find(r=>r.name===entry.name);
  return `<div class="hof-card">
    <div class="hof-trophy">🏆</div>
    <div class="hof-photo">${w && w.photo?`<img src="${w.photo}" alt="${entry.name}" onerror="this.style.display='none'">`:initials(entry.name)}</div>
    <div class="hof-name">${entry.name}</div>
    <div class="hof-belt">${entry.belt} Former ${entry.title}</div>
    <div class="hof-meta"><span>${entry.defenses} defense${entry.defenses===1?'':'s'}</span><span>${entry.date}</span></div>
  </div>`;
}
function renderHallOfFame(){
  document.getElementById('hof-reigning-grid').innerHTML = TITLE_DEFS.map(hofReigningCardHTML).join('');
  const inductees = collectInductees();
  document.getElementById('hof-count').textContent = `${inductees.length} Inducted`;
  const wrap = document.getElementById('hof-inducted-wrap');
  if(inductees.length===0){
    wrap.innerHTML = `<div class="hof-empty">No one has been inducted yet — a champion joins the Hall of Fame the moment their title reign ends. Book more title matches to make history.</div>`;
    return;
  }
  const byYear = {};
  inductees.forEach(e=>{ (byYear[e.year] = byYear[e.year]||[]).push(e); });
  const years = Object.keys(byYear).map(Number).sort((a,b)=>b-a);
  wrap.innerHTML = years.map(year=>{
    const entries = byYear[year].sort((a,b)=> new Date(b.date) - new Date(a.date));
    return `<div class="hof-year-header"><h3>${year}</h3><div class="hof-year-line"></div></div>
    <div class="hof-grid">${entries.map(hofCardHTML).join('')}</div>`;
  }).join('');
}
