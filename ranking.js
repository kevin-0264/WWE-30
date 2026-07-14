
/* ============================================================
   RANKING SYSTEM (TOP 50)
============================================================ */
function computeRankingScore(w){
  const st = state.stats[w.id] || {wins:0,losses:0,matches:0,eliminations:0,rumbleWins:0};
  let score = w.overall*1.0 + w.popularity*0.4 + w.winRate*0.3;
  score += st.wins*3 - st.losses*1;
  score += st.rumbleWins*8;
  score += st.eliminations*1.5;
  wrestlerTitles(w.id).forEach(name=>{
    if(name.includes('Last One Standing')) score += 30;
    else if(name.includes("Women's World")) score += 22;
    else if(name.includes('Intercontinental')) score += 14;
    else if(name.includes('Tag Team')) score += 10;
    else if(name.includes('Money in the Bank')) score += 9;
  });
  return Math.round(score);
}
function computeRankings(){
  return ROSTER.map(w=>({ id:w.id, w, score: computeRankingScore(w) }))
    .sort((a,b)=>b.score-a.score)
    .map((entry,i)=>({...entry, rank:i+1}));
}
function loadRankingsPrev(){ return JSON.parse(localStorage.getItem('lostanding_rankings_prev')||'null') || {}; }
function updateRankingsAndGetList(){
  const list = computeRankings();
  const prev = state.rankingsPrev || {};
  list.forEach(entry=>{
    const prevRank = prev[entry.id];
    entry.trend = prevRank===undefined ? 'new' : prevRank>entry.rank ? 'up' : prevRank<entry.rank ? 'down' : 'same';
  });
  const newPrev = {};
  list.forEach(e=>newPrev[e.id]=e.rank);
  state.rankingsPrev = newPrev;
  localStorage.setItem('lostanding_rankings_prev', JSON.stringify(newPrev));
  return list;
}
function trendArrow(t){
  if(t==='up') return `<span style="color:var(--hp-good)">▲</span>`;
  if(t==='down') return `<span style="color:var(--hp-bad)">▼</span>`;
  if(t==='new') return `<span style="color:var(--gold)">NEW</span>`;
  return `<span style="color:var(--paper-dim)">–</span>`;
}
function renderRankings(){
  const list = updateRankingsAndGetList();
  document.getElementById('rankings-count-full').textContent = `Top ${list.length}`;
  document.getElementById('rankings-full-list').innerHTML = list.map(e=>{
    const w = e.w;
    const heldTitles = wrestlerTitles(w.id);
    const beltTag = heldTitles.length ? `<span class="champ-title-tag" style="margin-left:8px;">${heldTitles[0]}</span>` : '';
    return `<div class="rank-row">
      <div class="rank-num">#${e.rank}</div>
      <div class="rank-trend">${trendArrow(e.trend)}</div>
      <div class="rank-photo">${w.photo?`<img src="${w.photo}" alt="${w.name}" onerror="this.style.display='none'">`:initials(w.name)}</div>
      <div class="rank-name">${w.name} <span style="color:var(--paper-dim);font-weight:400;">${w.brand}</span>${beltTag}</div>
      <div class="rank-pts">${e.score} PTS</div>
    </div>`;
  }).join('');
}
state.rankingsPrev = loadRankingsPrev();
