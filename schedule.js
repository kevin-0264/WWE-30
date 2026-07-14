/* ============================================================
   SEASON SCHEDULE — module
   Self-contained. Reads window.ROSTER if present (the same
   roster used by the rest of the app); otherwise uses its own
   demo roster so this section works even by itself.

   Rules implemented:
   - 5 matches scheduled per day (singles / tag / triple threat / battle royal)
   - Winner of every match earns +3 ranking points
   - On the last day of every month: an extra 30-woman Royal Rumble is
     scheduled, and the final match of the month is a Triple Threat
     between the current #1, #2 and #3 ranked wrestlers. Its winner
     becomes the Season Elite Champion and keeps the belt until dethroned.
   - Users can hand-build their own Singles match with a specific
     date/time, picking both wrestlers from live profile containers.
   - Every upcoming match carries a ticket "prize" card.
============================================================ */

(function(){

  /* ---------- fallback demo roster (only used if window.ROSTER is missing) ---------- */
  const SS_NAMES = [
    ["Meera Sinha","The Wildcard"],["Talia Voss","Iron Orchid"],["Priya Kade","Velocity"],
    ["Nadia Okoye","The Tempest"],["Sofia Reyes","Reckoning"],["Ling Zhao","Jade Fang"],
    ["Amara Diallo","Thunderclap"],["Elin Björk","The Glacier"],["Rosa Marchetti","Vendetta"],
    ["Kavya Rao","Firebrand"],["Dana Kessler","Blacktop"],["Yuki Sato","Crimson Blade"],
    ["Farah Haddad","The Oracle"],["Bianca Silva","Riot"],["Noor Malik","Eclipse"],
    ["Ingrid Halvorsen","Valkyrie"],["Camila Torres","Havoc"],["Aiko Tanaka","Storm Petrel"],
    ["Zanele Mokoena","The Warden"],["Lucia Ferrari","Nightshade"]
  ];
  const SS_BRANDS = ["Vanguard","Apex","Riot Circuit"];
  const SS_COUNTRIES = ["USA","Brazil","Japan","India","Nigeria","Sweden","Italy","South Korea"];
  function ssBuildFallbackRoster(){
    return SS_NAMES.map((n,i)=>{
      const overall = 62+Math.floor(Math.random()*33);
      return {
        id: 9000+i, name:n[0], nick:n[1],
        brand: SS_BRANDS[i%SS_BRANDS.length], country: SS_COUNTRIES[i%SS_COUNTRIES.length],
        photo:'', overall, popularity: 50+Math.floor(Math.random()*45),
        winRate: 40+Math.floor(Math.random()*50),
        strength: 50+Math.floor(Math.random()*45), speed: 50+Math.floor(Math.random()*45),
        stamina: 50+Math.floor(Math.random()*45), agility: 50+Math.floor(Math.random()*45),
        technique: 50+Math.floor(Math.random()*45), power: 50+Math.floor(Math.random()*45),
        mind: 50+Math.floor(Math.random()*45), defense: 50+Math.floor(Math.random()*45)
      };
    });
  }
  const SS_FALLBACK_ROSTER = ssBuildFallbackRoster();
  function ssRoster(){
    return (typeof window.ROSTER !== 'undefined' && Array.isArray(window.ROSTER) && window.ROSTER.length)
      ? window.ROSTER : SS_FALLBACK_ROSTER;
  }
  function ssFindWrestler(id){
    return ssRoster().find(w=>w.id===id) || {id, name:'TBD', nick:'', brand:'', country:'', photo:'', overall:0, popularity:0};
  }
  function ssInitials(name){
    if(!name) return '??';
    return name.split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  }

  /* ---------- state ---------- */
  const SS = {
    matches: [],
    points: {},     // wrestlerId -> ranking points
    champion: null, // { id, since }
    nextId: 1,
    countdownTimer: null,
    pendingTicket: null // ticket currently shown in the custom-match builder
  };

  /* ---------- ticket prizes ---------- */
  const SS_PRIZES = [
    { icon:'🎟️', name:'General Admission Pair', desc:'Two seats, lower bowl' },
    { icon:'📸', name:'Meet & Greet Pass', desc:'Photo-op after the bout' },
    { icon:'👕', name:'Championship Merch Bundle', desc:'Tee + poster + pin' },
    { icon:'🥇', name:'Ringside Row Tickets', desc:'Front-row, camera side' },
    { icon:'🎤', name:'Backstage Access Pass', desc:'Locker room walkthrough' }
  ];
  const SS_PRIZES_TITLE = [
    { icon:'🏆', name:'Championship Replica Belt', desc:'Full-size, engraved' },
    { icon:'💎', name:'VIP Suite + Belt Photo-Op', desc:'Private suite, 4 guests' },
    { icon:'🎬', name:'Season Champion Crate', desc:'Signed gear + exclusive footage' }
  ];
  function ssRandomTicket(isTitleMatch){
    const pool = isTitleMatch ? SS_PRIZES_TITLE : SS_PRIZES;
    const p = pool[Math.floor(Math.random()*pool.length)];
    const price = isTitleMatch ? (150+Math.floor(Math.random()*250)) : (20+Math.floor(Math.random()*80));
    return { icon:p.icon, name:p.name, desc:p.desc, price };
  }

  /* ---------- date helpers ---------- */
  function ssDateKey(d){
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function ssIsLastDayOfMonth(d){
    const t = new Date(d); t.setDate(t.getDate()+1);
    return t.getDate() === 1;
  }
  function ssFormatDayHead(dateKey){
    const d = new Date(dateKey+'T00:00:00');
    return d.toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric'}).toUpperCase();
  }
  function ssFormatTime12(t){
    const [h,m] = t.split(':').map(Number);
    const suffix = h>=12 ? 'PM':'AM';
    const hh = ((h+11)%12)+1;
    return `${hh}:${String(m).padStart(2,'0')} ${suffix}`;
  }
  function ssMatchDateTime(m){
    return new Date(`${m.date}T${m.time}:00`);
  }

  /* ---------- schedule generation ---------- */
  function ssPickRandomUnique(pool, n){
    const copy = pool.slice();
    for(let i=copy.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [copy[i],copy[j]] = [copy[j],copy[i]];
    }
    return copy.slice(0, Math.min(n, copy.length));
  }
  function ssParticipantCount(type, rosterLen){
    if(type==='singles') return 2;
    if(type==='tag') return 4;
    if(type==='triple_threat') return 3;
    if(type==='battle_royal') return Math.min(8, rosterLen);
    if(type==='royal_rumble') return Math.min(30, rosterLen);
    return 2;
  }
  function ssCreateMatch(date, time, type, opts={}){
    const roster = ssRoster();
    const participants = opts.forceEmpty ? [] :
      ssPickRandomUnique(roster.map(w=>w.id), ssParticipantCount(type, roster.length));
    return {
      id: SS.nextId++,
      date: ssDateKey(date),
      time,
      type,
      participants,
      title: opts.title || null,
      special: opts.special || false,   // false | 'rumble' | 'finale' | 'custom'
      ticket: ssRandomTicket(!!opts.title),
      status: 'upcoming',
      winner: null
    };
  }
  const SS_DAY_TIMES = ['18:00','18:45','19:30','20:15','21:00'];
  const SS_DAY_TYPES = ['singles','singles','tag','triple_threat','battle_royal'];

  function ssGenerateSeason(startDate, totalDays){
    SS.matches = [];
    SS.points = {};
    SS.champion = null;
    SS.nextId = 1;
    for(let i=0;i<totalDays;i++){
      const day = new Date(startDate);
      day.setDate(startDate.getDate()+i);
      // shuffle the day's type order so it doesn't feel identical every day
      const types = ssPickRandomUnique(SS_DAY_TYPES, SS_DAY_TYPES.length);
      SS_DAY_TIMES.forEach((time,idx)=>{
        SS.matches.push(ssCreateMatch(day, time, types[idx]));
      });
      if(ssIsLastDayOfMonth(day)){
        SS.matches.push(ssCreateMatch(day, '21:45', 'royal_rumble', { special:'rumble' }));
        SS.matches.push(ssCreateMatch(day, '22:30', 'triple_threat', {
          special:'finale', title:'Season Elite Championship', forceEmpty:true
        }));
      }
    }
    ssRenderAll();
  }

  /* ---------- ranking ---------- */
  function ssAwardPoints(id, pts){
    SS.points[id] = (SS.points[id]||0) + pts;
  }
  function ssTopN(n){
    return ssRoster()
      .map(w=>({ w, pts: SS.points[w.id]||0 }))
      .sort((a,b)=> b.pts - a.pts)
      .slice(0,n);
  }

  /* ---------- simulate a match ---------- */
  function ssTagTeams(ids){
    return [[ids[0],ids[1]], [ids[2],ids[3]]];
  }
  function ssScoreOf(id){
    const w = ssFindWrestler(id);
    return (w.overall||60)*0.6 + (w.popularity||50)*0.4 + Math.random()*22;
  }
  function ssDetermineWinner(m){
    if(m.type==='tag'){
      const teams = ssTagTeams(m.participants);
      const scored = teams.map(team=>({
        team, score: team.reduce((s,id)=>s+ssScoreOf(id),0)/team.length
      }));
      scored.sort((a,b)=>b.score-a.score);
      return scored[0].team; // array of 2 ids
    }
    const scored = m.participants.map(id=>({ id, score: ssScoreOf(id) }));
    scored.sort((a,b)=>b.score-a.score);
    return scored[0].id;
  }
  function ssSimulateMatch(matchId){
    const m = SS.matches.find(x=>x.id===matchId);
    if(!m || m.status==='completed') return;

    if(m.special==='finale' && m.participants.length===0){
      m.participants = ssTopN(3).map(x=>x.w.id);
      if(m.participants.length < 3){
        // not enough ranked wrestlers yet — fill randomly so the match can still happen
        const fill = ssPickRandomUnique(ssRoster().map(w=>w.id).filter(id=>!m.participants.includes(id)), 3-m.participants.length);
        m.participants = m.participants.concat(fill);
      }
    }

    const winner = ssDetermineWinner(m);
    m.winner = winner;
    m.status = 'completed';

    if(Array.isArray(winner)){
      winner.forEach(id=> ssAwardPoints(id, 3));
    } else {
      ssAwardPoints(winner, 3);
    }

    if(m.special==='finale'){
      const champId = Array.isArray(winner) ? winner[0] : winner;
      SS.champion = { id: champId, since: m.date };
    }

    ssRenderAll();
  }

  /* ---------- rendering: champion banner ---------- */
  function ssRenderChampionBanner(){
    const el = document.getElementById('ss-champion-banner');
    if(!el) return;
    if(SS.champion){
      const w = ssFindWrestler(SS.champion.id);
      el.innerHTML = `
        <div class="ss-champ-belt">🏆</div>
        <div class="ss-champ-info">
          <div class="ss-champ-eyebrow">Season Elite Champion</div>
          <div class="ss-champ-name">${w.name}</div>
          <div class="ss-champ-sub">"${w.nick||''}" · Crowned ${ssFormatDayHead(SS.champion.since)}</div>
        </div>`;
    } else {
      el.innerHTML = `
        <div class="ss-champ-belt" style="filter:grayscale(1);opacity:.5;">🏆</div>
        <div class="ss-champ-info">
          <div class="ss-champ-eyebrow">Season Elite Championship</div>
          <div class="ss-champ-vacant">Title Vacant — decided at month's end</div>
        </div>`;
    }
  }

  /* ---------- rendering: countdown ---------- */
  function ssRenderCountdown(){
    const el = document.getElementById('ss-countdown-card');
    if(!el) return;
    if(SS.countdownTimer){ clearInterval(SS.countdownTimer); SS.countdownTimer=null; }

    const now = new Date();
    const next = SS.matches
      .filter(m=>m.status==='upcoming')
      .map(m=>({m, dt: ssMatchDateTime(m)}))
      .filter(x=> x.dt.getTime() > now.getTime())
      .sort((a,b)=> a.dt - b.dt)[0];

    if(!next){
      el.innerHTML = `<div class="ss-cd-empty">No upcoming matches scheduled. Generate a season to get started.</div>`;
      return;
    }
    const label = ssMatchLabel(next.m);
    el.innerHTML = `
      <div>
        <div class="ss-cd-label">Next Up · ${ssFormatDayHead(next.m.date)} · ${ssFormatTime12(next.m.time)}</div>
        <div class="ss-cd-match">${label}</div>
      </div>
      <div class="ss-cd-timer" id="ss-cd-timer">
        <div class="ss-cd-unit"><b id="ss-cd-d">0</b><span>Days</span></div>
        <div class="ss-cd-unit"><b id="ss-cd-h">00</b><span>Hrs</span></div>
        <div class="ss-cd-unit"><b id="ss-cd-m">00</b><span>Min</span></div>
        <div class="ss-cd-unit"><b id="ss-cd-s">00</b><span>Sec</span></div>
      </div>`;

    function tick(){
      const diff = next.dt.getTime() - Date.now();
      if(diff <= 0){ ssRenderCountdown(); return; }
      const d = Math.floor(diff/86400000);
      const h = Math.floor((diff%86400000)/3600000);
      const mnt = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      const dEl=document.getElementById('ss-cd-d'), hEl=document.getElementById('ss-cd-h'),
            mEl=document.getElementById('ss-cd-m'), sEl=document.getElementById('ss-cd-s');
      if(!dEl) return;
      dEl.textContent = d;
      hEl.textContent = String(h).padStart(2,'0');
      mEl.textContent = String(mnt).padStart(2,'0');
      sEl.textContent = String(s).padStart(2,'0');
    }
    tick();
    SS.countdownTimer = setInterval(tick, 1000);
  }
  function ssMatchLabel(m){
    if(m.type==='singles') return m.participants.map(id=>ssFindWrestler(id).name).join(' vs ');
    if(m.type==='tag'){
      const t = ssTagTeams(m.participants);
      return t.map(team=>team.map(id=>ssFindWrestler(id).name).join(' & ')).join(' vs ');
    }
    if(m.type==='triple_threat') return 'Triple Threat: '+m.participants.map(id=>ssFindWrestler(id).name).join(' / ');
    if(m.type==='battle_royal') return `Battle Royal (${m.participants.length} entrants)`;
    if(m.type==='royal_rumble') return `Royal Rumble (${m.participants.length} entrants)`;
    return 'Match';
  }

  /* ---------- rendering: rankings strip ---------- */
  function ssRenderRankingsStrip(){
    const el = document.getElementById('ss-rankings-strip');
    if(!el) return;
    const top3 = ssTopN(3);
    if(top3.every(x=>x.pts===0)){
      el.innerHTML = `<div class="ss-empty-state" style="grid-column:1/-1;">Rankings will populate once matches are simulated.</div>`;
      return;
    }
    const medal = ['r1','r2','r3'];
    el.innerHTML = top3.map((x,i)=>`
      <div class="ss-rank-card ${medal[i]}">
        <div class="ss-rank-num">#${i+1}</div>
        <div class="ss-rank-photo">${x.w.photo?`<img src="${x.w.photo}" onerror="this.style.display='none'">`:ssInitials(x.w.name)}</div>
        <div>
          <div class="ss-rank-name">${x.w.name}</div>
          <div class="ss-rank-pts">${x.pts} PTS</div>
        </div>
      </div>`).join('');
  }

  /* ---------- rendering: wrestler container (builder + singles cards) ---------- */
  function ssStatBars(w){
    const stats = [w.strength,w.speed,w.stamina,w.technique].filter(v=>typeof v==='number');
    if(!stats.length) return '';
    return `<div class="ss-wc-bars">${stats.map(v=>`<i><b style="width:${v}%"></b></i>`).join('')}</div>`;
  }
  function ssWrestlerContainerHTML(id){
    if(!id) return `<div class="ss-wc-empty">Select a wrestler…</div>`;
    const w = ssFindWrestler(id);
    return `
      <div class="ss-wc-photo">${w.photo?`<img src="${w.photo}" onerror="this.style.display='none'">`:ssInitials(w.name)}</div>
      <div class="ss-wc-body">
        <div class="ss-wc-name">${w.name}</div>
        <div class="ss-wc-nick">"${w.nick||''}"</div>
        <div class="ss-wc-tags"><span>${w.brand||'—'}</span><span>${w.country||'—'}</span></div>
        <div class="ss-wc-ovr">OVR ${w.overall||'—'}</div>
        ${ssStatBars(w)}
      </div>`;
  }

  /* ---------- rendering: ticket ---------- */
  function ssTicketHTML(ticket){
    return `
      <div class="ss-ticket">
        <div class="ss-ticket-icon">${ticket.icon}</div>
        <div>
          <div class="ss-ticket-name">${ticket.name}</div>
          <div class="ss-ticket-desc">${ticket.desc}</div>
        </div>
        <div class="ss-ticket-price">$${ticket.price}</div>
      </div>`;
  }
  function ssTicketMiniHTML(ticket){
    return `<div class="ss-ticket-mini">${ticket.icon} <b>${ticket.name}</b> · From $${ticket.price}</div>`;
  }

  /* ---------- rendering: match card ---------- */
  function ssParticipantsHTML(m){
    const roster = ssRoster();
    if(m.type==='singles'){
      const [a,b] = m.participants;
      return `<div class="ss-participants-singles">
        <div class="ss-wrestler-container">${ssWrestlerContainerHTML(a)}</div>
        <div class="ss-vs-tag">VS</div>
        <div class="ss-wrestler-container">${ssWrestlerContainerHTML(b)}</div>
      </div>`;
    }
    if(m.type==='tag'){
      const teams = ssTagTeams(m.participants);
      const winTeam = m.status==='completed' && Array.isArray(m.winner) ? m.winner : null;
      return teams.map((team,i)=>`
        <div class="ss-team-block">
          <div class="ss-team-label">Team ${i===0?'A':'B'}</div>
          <div class="ss-chip-row">
            ${team.map(id=>{
              const w = ssFindWrestler(id);
              const isWin = winTeam && winTeam.includes(id);
              return `<div class="ss-chip ${isWin?'winner':''}">
                <div class="ss-chip-photo">${w.photo?`<img src="${w.photo}" onerror="this.style.display='none'">`:ssInitials(w.name)}</div>
                <div class="ss-chip-name">${w.name}</div>
              </div>`;
            }).join('')}
          </div>
        </div>`).join('');
    }
    // triple_threat / battle_royal / royal_rumble
    const shown = m.participants.slice(0, m.type==='royal_rumble' ? 10 : m.participants.length);
    const extra = m.participants.length - shown.length;
    return `<div class="ss-chip-row">
      ${shown.map(id=>{
        const w = ssFindWrestler(id);
        const isWin = m.status==='completed' && !Array.isArray(m.winner) && m.winner===id;
        return `<div class="ss-chip ${isWin?'winner':''}">
          <div class="ss-chip-photo">${w.photo?`<img src="${w.photo}" onerror="this.style.display='none'">`:ssInitials(w.name)}</div>
          <div class="ss-chip-name">${w.name}</div>
        </div>`;
      }).join('')}
    </div>${extra>0?`<div class="ss-rumble-count">+${extra} more entrants</div>`:''}`;
  }
  function ssResultHTML(m){
    if(m.status!=='completed') return '';
    const isTeam = Array.isArray(m.winner);
    const names = isTeam ? m.winner.map(id=>ssFindWrestler(id).name).join(' & ') : ssFindWrestler(m.winner).name;
    return `
      <div class="ss-result">
        <div class="ss-result-trophy">🏆</div>
        <div class="ss-result-text">Winner: <b>${names}</b>
          ${m.special==='finale'?`<span class="ss-new-champ">👑 New Season Elite Champion!</span>`:''}
        </div>
        <div class="ss-result-pts">+3 PTS ${isTeam?'each':''}</div>
      </div>`;
  }
  const SS_TYPE_LABEL = {
    singles:'Singles Match', tag:'Tag Team', triple_threat:'Triple Threat',
    battle_royal:'Battle Royal', royal_rumble:'Royal Rumble'
  };
  function ssMatchCardHTML(m){
    const cardClass = m.special==='finale' ? 'special' : (m.special==='rumble' ? 'rumble' : '');
    return `
      <div class="ss-match-card ${cardClass}" data-id="${m.id}">
        <div class="ss-match-top">
          <span class="ss-type-badge ${m.type}">${SS_TYPE_LABEL[m.type]||m.type}</span>
          <span class="ss-match-time">${ssFormatTime12(m.time)}</span>
        </div>
        ${m.title?`<div class="ss-title-ribbon">🏆 ${m.title}</div>`:''}
        ${ssParticipantsHTML(m)}
        ${m.status==='completed' ? ssResultHTML(m) : ssTicketMiniHTML(m.ticket)}
        <div class="ss-match-footer">
          ${m.status==='upcoming'
            ? `<button class="btn small primary" onclick="ssSimulateMatch(${m.id})">▶ Simulate Match</button>`
            : `<span style="font-size:10px;color:var(--ss-paper-dim);letter-spacing:.08em;text-transform:uppercase;">Completed</span>`}
        </div>
      </div>`;
  }

  /* ---------- rendering: schedule list ---------- */
  function ssRenderScheduleList(){
    const el = document.getElementById('ss-schedule-list');
    const countEl = document.getElementById('ss-count');
    if(!el) return;

    const statusFilter = document.getElementById('ss-filter-status')?.value || 'all';
    const typeFilter = document.getElementById('ss-filter-type')?.value || '';

    let matches = SS.matches.slice();
    if(statusFilter !== 'all') matches = matches.filter(m=>m.status===statusFilter);
    if(typeFilter) matches = matches.filter(m=>m.type===typeFilter);

    if(countEl) countEl.textContent = `${matches.length} of ${SS.matches.length} matches`;

    if(!matches.length){
      el.innerHTML = `<div class="ss-empty-state">No matches to show. Try "Generate Season Schedule" or adjust your filters.</div>`;
      return;
    }

    matches.sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));
    const byDay = {};
    matches.forEach(m=>{ (byDay[m.date] = byDay[m.date]||[]).push(m); });

    el.innerHTML = Object.keys(byDay).sort().map(date=>{
      const dayMatches = byDay[date];
      const hasFinale = dayMatches.some(m=>m.special==='finale');
      return `
        <div class="ss-day-group">
          <div class="ss-day-head">
            <div class="ss-day-date">${ssFormatDayHead(date)}</div>
            <div class="ss-day-tag ${hasFinale?'finale':''}">${dayMatches.length} matches${hasFinale?' · Month Finale Night':''}</div>
          </div>
          <div class="ss-day-matches">
            ${dayMatches.map(ssMatchCardHTML).join('')}
          </div>
        </div>`;
    }).join('');
  }

  function ssRenderAll(){
    ssRenderChampionBanner();
    ssRenderCountdown();
    ssRenderRankingsStrip();
    ssRenderScheduleList();
  }

  /* ---------- custom match builder ---------- */
  function ssPopulateWrestlerSelects(){
    const roster = ssRoster();
    const opts = roster.map(w=>`<option value="${w.id}">${w.name} — "${w.nick||''}"</option>`).join('');
    const wa = document.getElementById('ss-cm-wa');
    const wb = document.getElementById('ss-cm-wb');
    if(wa) wa.innerHTML = `<option value="">Select…</option>` + opts;
    if(wb) wb.innerHTML = `<option value="">Select…</option>` + opts;
  }
  function ssRefreshBuilderPreview(){
    const wa = document.getElementById('ss-cm-wa')?.value;
    const wb = document.getElementById('ss-cm-wb')?.value;
    const pa = document.getElementById('ss-cm-preview-a');
    const pb = document.getElementById('ss-cm-preview-b');
    if(pa) pa.innerHTML = ssWrestlerContainerHTML(wa ? Number(wa) : null);
    if(pb) pb.innerHTML = ssWrestlerContainerHTML(wb ? Number(wb) : null);
  }
  function ssRefreshTicketPreview(){
    const hasTitle = !!document.getElementById('ss-cm-title')?.value.trim();
    SS.pendingTicket = ssRandomTicket(hasTitle);
    const el = document.getElementById('ss-cm-ticket-preview');
    if(el) el.innerHTML = ssTicketHTML(SS.pendingTicket);
  }
  function ssOpenBuilder(){
    document.getElementById('ss-create-panel')?.classList.remove('hidden');
    const dateInput = document.getElementById('ss-cm-date');
    if(dateInput && !dateInput.value) dateInput.value = ssDateKey(new Date());
    ssPopulateWrestlerSelects();
    ssRefreshBuilderPreview();
    ssRefreshTicketPreview();
  }
  function ssCloseBuilder(){
    document.getElementById('ss-create-panel')?.classList.add('hidden');
  }
  function ssSaveCustomMatch(){
    const date = document.getElementById('ss-cm-date')?.value;
    const time = document.getElementById('ss-cm-time')?.value || '19:00';
    const title = document.getElementById('ss-cm-title')?.value.trim();
    const wa = Number(document.getElementById('ss-cm-wa')?.value);
    const wb = Number(document.getElementById('ss-cm-wb')?.value);
    if(!date || !wa || !wb || wa===wb){
      alert('Pick a date and two different wrestlers to build the match.');
      return;
    }
    const m = {
      id: SS.nextId++,
      date, time, type:'singles',
      participants:[wa, wb],
      title: title || null,
      special: 'custom',
      ticket: SS.pendingTicket || ssRandomTicket(!!title),
      status:'upcoming', winner:null
    };
    SS.matches.push(m);
    ssCloseBuilder();
    ssRenderAll();
  }

  /* ---------- wiring ---------- */
  function ssInit(){
    ssPopulateWrestlerSelects();
    ssGenerateSeason(new Date(), 30);

    document.getElementById('ss-btn-generate')?.addEventListener('click', ()=>{
      if(SS.matches.length && !confirm('This replaces the current season schedule. Continue?')) return;
      ssGenerateSeason(new Date(), 30);
    });
    document.getElementById('ss-btn-reset')?.addEventListener('click', ()=>{
      if(!confirm('Clear the entire season schedule and rankings?')) return;
      SS.matches = []; SS.points = {}; SS.champion = null;
      ssRenderAll();
    });
    document.getElementById('ss-btn-create-match')?.addEventListener('click', ssOpenBuilder);
    document.getElementById('ss-btn-cancel-match')?.addEventListener('click', ssCloseBuilder);
    document.getElementById('ss-btn-save-match')?.addEventListener('click', ssSaveCustomMatch);
    document.getElementById('ss-btn-reroll-prize')?.addEventListener('click', ssRefreshTicketPreview);
    document.getElementById('ss-cm-wa')?.addEventListener('change', ssRefreshBuilderPreview);
    document.getElementById('ss-cm-wb')?.addEventListener('change', ssRefreshBuilderPreview);
    document.getElementById('ss-cm-title')?.addEventListener('input', ssRefreshTicketPreview);
    document.getElementById('ss-filter-status')?.addEventListener('change', ssRenderScheduleList);
    document.getElementById('ss-filter-type')?.addEventListener('change', ssRenderScheduleList);
  }

  window.ssSimulateMatch = ssSimulateMatch;

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ssInit);
  } else {
    ssInit();
  }
})();