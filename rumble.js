
/* ============================================================
   RUMBLE SIMULATION ENGINE
============================================================ */
let sim = null; // simulation runtime object

function initRumbleScreen(){
  document.getElementById('btn-rumble-start').disabled=false;
  document.getElementById('btn-pause').disabled=true;
  document.getElementById('btn-speed').disabled=true;
  document.getElementById('btn-skip').disabled=true;
  document.getElementById('ring').querySelectorAll('.fighter-token,.pyro').forEach(n=>n.remove());
  document.getElementById('commentary-feed').innerHTML='';
  document.getElementById('match-clock').textContent='00:00';
  document.getElementById('next-up-text').textContent='Waiting to begin...';
  document.getElementById('stat-inring').textContent='0';
  document.getElementById('stat-elim').textContent='0';
  document.getElementById('stat-remaining').textContent='30';
  document.getElementById('stat-leader').textContent='—';
  document.getElementById('leaderboard').innerHTML='';
  document.getElementById('jumbotron').classList.remove('show');
}
document.getElementById('btn-rumble-start').addEventListener('click', ()=>{
  document.getElementById('btn-rumble-start').disabled=true;
  document.getElementById('btn-pause').disabled=false;
  document.getElementById('btn-speed').disabled=false;
  document.getElementById('btn-skip').disabled=false;
  startRumble();
});
document.getElementById('btn-pause').addEventListener('click', ()=>{
  if(!sim) return;
  sim.paused = !sim.paused;
  document.getElementById('btn-pause').textContent = sim.paused ? 'Resume':'Pause';
});
document.getElementById('btn-speed').addEventListener('click', ()=>{
  if(!sim) return;
  sim.speedMult = sim.speedMult===1?2:(sim.speedMult===2?4:1);
  document.getElementById('btn-speed').textContent = 'Speed: '+sim.speedMult+'x';
});
document.getElementById('btn-skip').addEventListener('click', ()=>{
  if(!sim) return;
  sim.skip = true;
});

function commentary(text, opts){
  const feed = document.getElementById('commentary-feed');
  const div = document.createElement('div');
  div.textContent = text;
  if(opts && opts.big) div.style.cssText = 'color:var(--gold-bright);font-weight:700;';
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
  while(feed.children.length>40) feed.removeChild(feed.firstChild);
  if(opts && opts.speak) speakLine(text);
}
function loadVoiceSettings(){
  return Object.assign({ voiceEnabled:false, voiceName:'', voiceRate:1.1, voicePitch:1.05, voiceVolume:1 },
    JSON.parse(localStorage.getItem('lostanding_voice_settings')||'{}'));
}
function saveVoiceSettings(){
  localStorage.setItem('lostanding_voice_settings', JSON.stringify({
    voiceEnabled: state.settings.voiceEnabled, voiceName: state.settings.voiceName,
    voiceRate: state.settings.voiceRate, voicePitch: state.settings.voicePitch, voiceVolume: state.settings.voiceVolume
  }));
}
let availableVoices = [];
function refreshVoiceList(){
  if(!('speechSynthesis' in window)) return;
  availableVoices = speechSynthesis.getVoices();
  const sel = document.getElementById('set-voice-select');
  if(!sel) return;
  const current = state.settings.voiceName;
  sel.innerHTML = availableVoices.map(v=>`<option value="${v.name}">${v.name} (${v.lang})</option>`).join('');
  if(current && availableVoices.some(v=>v.name===current)) sel.value = current;
}
function speakLine(text){
  if(!state.settings.voiceEnabled) return;
  if(!('speechSynthesis' in window)) return;
  const clean = text.replace(/[!]{2,}/g,'!');
  const utter = new SpeechSynthesisUtterance(clean);
  const chosen = availableVoices.find(v=>v.name===state.settings.voiceName)
    || availableVoices.find(v=>/female|zira|samantha|victoria|susan/i.test(v.name))
    || availableVoices[0];
  if(chosen) utter.voice = chosen;
  utter.rate = state.settings.voiceRate || 1.1;
  utter.pitch = state.settings.voicePitch || 1.05;
  utter.volume = state.settings.voiceVolume ?? 1;
  speechSynthesis.speak(utter);
}
const COMM_HIT = [
  "{A} connects with a {move} on {B}!","{A} drives {B} down with authority!",
  "Brutal exchange — {A} catches {B} off guard!","{A} is in total control here!",
  "{B} fights back but {A} answers with a {move}!","The crowd ROARS as {A} unloads on {B}!",
  "OH MY GOD! {A} just planted {B} with a {move}!","What a {move} from {A}!!",
  "{B} did NOT see that {move} coming!","{A} is putting on a CLINIC against {B}!",
  "The referee checks on {B} after that vicious {move}!","{A} with a statement — that {move} shook the ring!"
];
const COMM_ELIM = [
  "{A} ELIMINATES {B}!! What a moment!","{B} is OUT, tossed by {A}!",
  "{A} sends {B} over the top rope and out!","It's over for {B} — eliminated by {A}!",
  "SHE'S ELIMINATED!! {A} just threw {B} over the top!","GONE!! {B} hits the floor courtesy of {A}!",
  "The referee signals it — {B} is eliminated by {A}!","{A} just ended {B}'s night!!"
];
const COMM_ENTER = [
  "Here comes entrant number {N} — {A}!","{A} makes her way to the ring as entrant {N}!",
  "The crowd pops as {A} enters at number {N}!","Entrant {N}... it's {A}!!",
  "Here she is — {A} — entering at number {N}!"
];
const COMM_FINISH = [
  "{A} hits the {move}!! DEVASTATING!","Out of nowhere — {A} connects with her finisher, the {move}!",
  "{A} seals it with the {move}!","OH MY GOD! THE {move}!! {A} just detonated that!",
  "THE REFEREE CAN'T BELIEVE IT! {A} lands the {move}!!","{A} pulls out the {move} — that might be all she wrote!"
];
const COMM_VICTORY = [
  "IT'S OVER!! {A} STANDS TALL!!","{A} DID IT!! WHAT A MOMENT!!",
  "THE CROWD IS GOING ABSOLUTELY CRAZY FOR {A}!!","{A} WINS IT! LISTEN TO THIS CROWD!!",
  "UNBELIEVABLE! {A} HAS DONE IT!!"
];
const COMM_TITLE_CHANGE = [
  "WE HAVE A NEW CHAMPION!! {A} HAS DONE IT!!","{A} JUST WON THE {T}!! WHAT A NIGHT!!",
  "THE TITLE HAS CHANGED HANDS!! {A} IS YOUR NEW CHAMPION!!"
];
const COMM_TITLE_RETAIN = [
  "{A} SURVIVES AND RETAINS THE {T}!!","THE CHAMPION HOLDS ON! {A} RETAINS!",
  "{A} PROVES WHY SHE'S THE CHAMPION — TITLE RETAINED!"
];
const COMM_RIVALRY_MAX = [
  "THESE TWO WANT TO HURT EACH OTHER!! THIS RIVALRY HAS BOILED OVER!!",
  "THE REFEREE CAN'T CONTROL THIS!! {A} AND {B} HATE EACH OTHER!!",
  "THIS IS PERSONAL NOW BETWEEN {A} AND {B}!!"
];
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function fill(t,map){ return t.replace(/\{(\w+)\}/g, (_,k)=> map[k] ?? ''); }

function ringPosition(index, total){
  // distribute around an ellipse inside the ring
  const angle = (index/Math.max(total,1)) * Math.PI*2 + index*0.7;
  const cx=50, cy=50, rx=34, ry=30;
  return { x: cx + rx*Math.cos(angle), y: cy + ry*Math.sin(angle) };
}

function startRumble(){
  const fighters = state.selected.map((id,i)=>{
    const w = ROSTER.find(r=>r.id===id);
    return {
      ...w, entry:i+1, inRing:false, eliminated:false,
      hp:100, energy:100, momentum:30, special:0,
      eliminations:0, damageDealt:0, damageReceived:0
    };
  });
  sim = {
    fighters, queueIdx:0, paused:false, skip:false, speedMult: state.settings.speed||1,
    elapsed:0, clockInterval:null, entryTimer:null, fightInterval:null,
    remaining: fighters.length, eliminationsCount:0, lastCutscene:null
  };
  resetCrowdMeter();
  document.getElementById('next-up-text').textContent = `Entrant #1 — ${fighters[0].name} approaching...`;
  sim.clockInterval = setInterval(()=>{ if(!sim.paused){ sim.elapsed += 1; updateClock(); decayCrowdMeter(); } }, 1000);
  enterNext(); // first entrant
  setTimeout(()=> enterNext(), 1600); // second entrant shortly after, then timer kicks in
  sim.entryTimer = setInterval(()=>{
    if(sim.paused) return;
    if(sim.queueIdx < fighters.length){
      enterNext();
    } else {
      clearInterval(sim.entryTimer);
    }
  }, (state.settings.interval||10)*1000 / 1); // interval in real seconds (speed handled via fight tick rate)
  sim.fightInterval = setInterval(fightTick, 700);
}
function updateClock(){
  const m = Math.floor(sim.elapsed/60).toString().padStart(2,'0');
  const s = (sim.elapsed%60).toString().padStart(2,'0');
  document.getElementById('match-clock').textContent = `${m}:${s}`;
}
function pyroBurst(x){
  const ring = document.getElementById('ring');
  for(let i=0;i<5;i++){
    const p = document.createElement('div');
    p.className='pyro';
    p.style.left = (x + (i-2)*3) + '%';
    p.style.animation = `pyroburst ${0.6+Math.random()*0.4}s ease`;
    ring.appendChild(p);
    setTimeout(()=>p.remove(), 1100);
  }
}
function showJumbotron(f){
  const jb = document.getElementById('jumbotron');
  const img = document.getElementById('jumbotron-img');
  const fallback = document.getElementById('jumbo-fallback');
  const entryPhoto = f.screenEntry || f.profilePic || f.photo || '';
  if(entryPhoto){
    img.style.display='block';
    img.src = entryPhoto;
    img.alt = f.name;
    fallback.textContent='';
  } else {
    img.style.display='none';
    fallback.textContent = initials(f.name);
  }
  document.getElementById('jumbo-num').textContent = `ENTRANT #${f.entry}`;
  document.getElementById('jumbo-name').textContent = f.name;
  document.getElementById('jumbo-nick').textContent = `"${f.nick}"`;
  jb.classList.add('show');
  clearTimeout(jb._hideTimer);
  jb._hideTimer = setTimeout(()=> jb.classList.remove('show'), 4200);
}
function enterNext(){
  if(sim.queueIdx >= sim.fighters.length) return;
  const f = sim.fighters[sim.queueIdx];
  f.inRing = true;
  sim.queueIdx++;
  const ring = document.getElementById('ring');
  const tokensInRing = sim.fighters.filter(x=>x.inRing && !x.eliminated);
  const pos = ringPosition(tokensInRing.length-1, Math.max(tokensInRing.length,6));
  const token = document.createElement('div');
  token.className='fighter-token entering';
  token.id = 'fighter-'+f.id;
  token.style.left = pos.x+'%'; token.style.top = pos.y+'%';
  const matchPhoto = f.matchImage || f.screenEntry || f.profilePic || f.photo || '';
  if(matchPhoto){
    token.style.backgroundImage = `linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.35)), url('${matchPhoto}')`;
    token.innerHTML = '';
  } else {
    token.style.background = `radial-gradient(circle at 30% 30%, ${f.color}, #000)`;
    token.innerHTML = `<span class="token-fallback">${initials(f.name)}</span>`;
  }
  ring.appendChild(token);
  pyroBurst(pos.x);
  const banner = document.getElementById('entry-banner');
  const bannerPhoto = f.screenEntry || f.profilePic || f.photo || '';
  banner.innerHTML = `
    <div class="entry-banner-photo" style="${bannerPhoto ? `background-image:url('${bannerPhoto}')` : `background:${f.color}`}"></div>
    <span>ENTRANT #${f.entry} — ${f.name.toUpperCase()} "${f.nick.toUpperCase()}"</span>
  `;
  banner.classList.add('show');
  setTimeout(()=>banner.classList.remove('show'), 2200);
  showJumbotron(f);
  commentary(fill(pick(COMM_ENTER),{A:f.name,N:f.entry}), {speak:true});
  reactToEntrance(f);
  document.getElementById('stat-inring').textContent = sim.fighters.filter(x=>x.inRing && !x.eliminated).length;
  document.getElementById('stat-remaining').textContent = sim.fighters.length - sim.queueIdx;
  const next = sim.fighters[sim.queueIdx];
  document.getElementById('next-up-text').textContent = next ? `Next: Entrant #${next.entry} — ${next.name} in ${state.settings.interval}s` : 'All entrants have arrived!';
  repositionRing();
}
function repositionRing(){
  const active = sim.fighters.filter(x=>x.inRing && !x.eliminated);
  active.forEach((f,i)=>{
    const pos = ringPosition(i, active.length);
    const token = document.getElementById('fighter-'+f.id);
    if(token){ token.style.left=pos.x+'%'; token.style.top=pos.y+'%'; }
  });
}

function fightTick(){
  if(sim.paused) return;
  const active = sim.fighters.filter(x=>x.inRing && !x.eliminated);
  if(active.length < 2){
    if(sim.queueIdx >= sim.fighters.length && active.length<=1){
      finishRumble();
    }
    return;
  }
  const reps = sim.skip ? 6 : 1;
  for(let r=0;r<reps;r++){
    const a = pick(active.filter(f=>!f.eliminated));
    let pool = active.filter(f=>f.id!==a.id && !f.eliminated);
    if(!a || pool.length===0) continue;
    const b = pick(pool);
    resolveAttack(a,b);
  }
  updateLeaderboard();
  if(sim.skip){
    // fast-forward all remaining entries instantly
    while(sim.queueIdx < sim.fighters.length){ enterNext(); }
  }
}
function resolveAttack(a,b){
  if(a.eliminated || b.eliminated) return;
  const variance = (state.settings.variance===0?0.1:state.settings.variance===2?0.5:0.3);
  const offense = a.attack*0.4 + a.power*0.3 + a.technique*0.3 + (a.momentum*0.2);
  const defense = b.defense*0.5 + b.durability*0.3 + (b.hp*0.2);
  const luckSwing = (Math.random()-0.5)*variance*100;
  const diff = offense - defense + luckSwing;
  const move = pick(MOVES_POOL);
  const token = document.getElementById('fighter-'+b.id);
  if(diff > -10){
    const dmg = Math.max(3, Math.min(22, 8 + diff*0.18));
    b.hp = Math.max(0,b.hp-dmg);
    b.energy = Math.max(0,b.energy-dmg*0.6);
    a.momentum = Math.min(100,a.momentum+8);
    a.special = Math.min(100,a.special+10);
    b.momentum = Math.max(0,b.momentum-6);
    a.damageDealt += dmg; b.damageReceived += dmg;
    if(token){ token.classList.remove('hit'); requestAnimationFrame(()=>token.classList.add('hit')); }
    if(!sim.skip || Math.random()<0.15) commentary(fill(pick(COMM_HIT),{A:a.name,B:b.name,move}), {speak: Math.random()<0.15});
  } else {
    a.momentum = Math.max(0,a.momentum-4);
  }
  // finisher trigger
  if(a.special>=100 && Math.random()<0.5){
    a.special = 0;
    const dmg = 28+Math.random()*10;
    b.hp = Math.max(0,b.hp-dmg);
    a.damageDealt += dmg; b.damageReceived += dmg;
    if(token){ token.classList.add('finisher'); setTimeout(()=>token.classList.remove('finisher'),900); }
    commentary(fill(pick(COMM_FINISH),{A:a.name,move:a.finisher}), {speak:true, big:true});
    spawnCrowdBubble(a.popularity>=60 ? pick(CHEER_LINES) : 'OHHHHH!!','hot');
    bumpCrowd(9);
  }
  // elimination check
  const elimRoll = b.hp<=0 || (b.hp<25 && Math.random()<0.05) ;
  if(elimRoll){
    eliminateFighter(a,b);
  }
}
function eliminateFighter(a,b){
  if(b.eliminated) return;
  b.eliminated = true;
  a.eliminations++;
  sim.eliminationsCount++;
  ensureStat(a.id).eliminations++;
  recordFastestElim(sim.elapsed, a.name, a.id);
  recordLongestSurvivor(sim.elapsed, b.name, b.id);
  saveStats();
  const rivResult = bumpRivalry(a.id, b.id, 'Royal Rumble Elimination');
  if(rivResult && rivResult.justMaxed) sim.lastCutscene = rivResult;
  const token = document.getElementById('fighter-'+b.id);
  if(token){ token.classList.add('eliminated'); setTimeout(()=>token.remove(),700); }
  commentary(fill(pick(COMM_ELIM),{A:a.name,B:b.name}), {speak:true, big:true});
  reactToElimination(a,b);
  document.getElementById('stat-elim').textContent = sim.eliminationsCount;
  document.getElementById('stat-inring').textContent = sim.fighters.filter(x=>x.inRing && !x.eliminated).length;
  setTimeout(repositionRing, 750);
  if(sim.fighters.filter(x=>x.inRing && !x.eliminated).length<=1 && sim.queueIdx>=sim.fighters.length){
    setTimeout(finishRumble, 1200);
  }
}
function updateLeaderboard(){
  const active = sim.fighters.filter(x=>x.inRing && !x.eliminated).sort((a,b)=>b.hp-a.hp);
  document.getElementById('leaderboard').innerHTML = active.slice(0,8).map(f=>{
    const color = f.hp>60?'var(--hp-good)':f.hp>30?'var(--hp-mid)':'var(--hp-bad)';
    const thumb = f.photo ? `style="background-image:url('${f.photo}')"` : `style="background:${f.color}"`;
    return `<div class="leaderboard-row"><span class="lb-name"><span class="lb-thumb" ${thumb}></span>${f.name}</span><div class="hpbarmini"><i style="width:${f.hp}%;background:${color}"></i></div></div>`;
  }).join('');
  if(active[0]) document.getElementById('stat-leader').textContent = active[0].name;
}
function finishRumble(){
  if(sim.done) return;
  sim.done = true;
  clearInterval(sim.clockInterval); clearInterval(sim.entryTimer); clearInterval(sim.fightInterval);
  document.getElementById('jumbotron').classList.remove('show');
  const winner = sim.fighters.find(x=>x.inRing && !x.eliminated) || sim.fighters[0];
  reactToWinner(winner);
  sim.fighters.forEach(f=>{
    const s = ensureStat(f.id);
    s.matches++;
    if(f.id===winner.id){ s.wins++; s.rumbleWins++; }
    else { s.losses++; }
  });
  recordLongestSurvivor(sim.elapsed, winner.name, winner.id);
  saveStats();
  const losRec = titleRecord('los');
  const losWasChampion = losRec && !losRec.vacant && losRec.championId===winner.id;
  if(losWasChampion){
    recordDefense('los');
  } else {
    assignTitle('los', winner, 'Won the Royal Rumble');
  }
  speakLine(fill(pick(COMM_VICTORY),{A:winner.name}));
  speakLine(fill(pick(losWasChampion?COMM_TITLE_RETAIN:COMM_TITLE_CHANGE),{A:winner.name,T:titleDef('los').name}));
  if(sim.lastCutscene) speakLine(fill(pick(COMM_RIVALRY_MAX),{A:sim.lastCutscene.nameA,B:sim.lastCutscene.nameB}));
  showVictory(winner, 'Royal Rumble', {
    duration: document.getElementById('match-clock').textContent,
    eliminations: winner.eliminations,
    participants: sim.fighters.length,
    hp: Math.round(winner.hp)
  }, { name: titleDef('los').name, changed: !losWasChampion }, sim.lastCutscene || null);
  saveHistory({
    type:'Royal Rumble', winner: winner.name, duration: document.getElementById('match-clock').textContent,
    eliminations: sim.eliminationsCount, participants: sim.fighters.length, date: new Date().toLocaleDateString()
  });
}

/* ---------- VICTORY SCREEN ---------- */
function showVictory(winner, matchType, extra, titleInfo, rivalryCutscene){
  const champBg = winner.profilePic || winner.photo
    ? `background-image:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.25)), url('${winner.profilePic || winner.photo}');`
    : `background:radial-gradient(circle at 30% 30%, ${winner.color}, #000);`;
  const badgeHtml = titleInfo
    ? `<div class="champ-badge">🏆 ${titleInfo.changed ? 'NEW '+titleInfo.name.toUpperCase()+' CHAMPION' : titleInfo.name.toUpperCase()+' — TITLE RETAINED'}</div>`
    : `<div class="champ-badge" style="border-color:var(--paper-dim);color:var(--paper-dim);">MATCH WINNER</div>`;
  const cutsceneHtml = rivalryCutscene ? `
    <div class="rivalry-cutscene">
      <div class="rc-title">★★★★★ BLOOD FEUD IGNITED ★★★★★</div>
      <div class="rc-sub">${rivalryCutscene.nameA} &amp; ${rivalryCutscene.nameB} have reached maximum rivalry intensity</div>
    </div>` : '';
  const html = `
    <div class="victory-rays"></div>
    <div class="victory-spotlights"><div class="spotlight s1"></div><div class="spotlight s2"></div><div class="spotlight s3"></div></div>
    <div class="champ-circle" style="${champBg}">${winner.photo?'':initials(winner.name)}</div>
    <div class="eyebrow" style="position:relative;z-index:2;">${matchType} WINNER</div>
    <h1>${winner.name}</h1>
    <div style="color:var(--gold);font-size:18px;position:relative;z-index:2;">"${winner.nick}"</div>
    ${badgeHtml}
    ${cutsceneHtml}
    <div class="victory-stats">
      <div class="vstat" style="animation-delay:.1s"><div class="num">${extra.eliminations ?? '—'}</div><div class="lbl">Eliminations</div></div>
      <div class="vstat" style="animation-delay:.2s"><div class="num">${extra.duration ?? '—'}</div><div class="lbl">Duration</div></div>
      <div class="vstat" style="animation-delay:.3s"><div class="num">${extra.participants ?? '—'}</div><div class="lbl">Participants</div></div>
      <div class="vstat" style="animation-delay:.4s"><div class="num">${extra.hp ?? '—'}%</div><div class="lbl">HP Remaining</div></div>
    </div>
    <div style="margin-top:10px;position:relative;z-index:2;"><button class="btn primary" data-go="home">Back to Home</button>
    <button class="btn ghost" data-go="roster">New Rumble</button></div>
  `;
  document.getElementById('victory-content').innerHTML = html;
  document.querySelectorAll('#victory-content [data-go]').forEach(btn=>btn.addEventListener('click',()=>showScreen(btn.dataset.go)));
  showScreen('victory-screen-wrap');
  launchConfetti();
  launchFireworks();
}
function launchConfetti(){
  const colors=['#d4af37','#e0263f','#f4d568','#ece4d3'];
  for(let i=0;i<70;i++){
    const c=document.createElement('div');
    c.className='confetti-piece';
    c.style.left=Math.random()*100+'%';
    c.style.background=colors[Math.floor(Math.random()*colors.length)];
    c.style.transform=`rotate(${Math.random()*360}deg)`;
    c.style.animation=`confettifall ${2+Math.random()*2}s linear forwards`;
    c.style.animationDelay = (Math.random()*0.8)+'s';
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),5200);
  }
}
function launchFireworks(){
  const colors=['#d4af37','#e0263f','#f4d568','#ece4d3','#5fae5a'];
  const bursts = 6;
  for(let b=0;b<bursts;b++){
    setTimeout(()=>{
      const cx = 15 + Math.random()*70; // vw
      const cy = 15 + Math.random()*40; // vh
      const particles = 22;
      for(let i=0;i<particles;i++){
        const angle = (i/particles)*Math.PI*2;
        const dist = 60+Math.random()*70;
        const dx = Math.cos(angle)*dist;
        const dy = Math.sin(angle)*dist;
        const p = document.createElement('div');
        p.className='firework';
        p.style.left = cx+'vw';
        p.style.top = cy+'vh';
        p.style.background = colors[Math.floor(Math.random()*colors.length)];
        p.style.boxShadow = `0 0 6px 1px ${colors[Math.floor(Math.random()*colors.length)]}`;
        p.style.setProperty('--dx', dx+'px');
        p.style.setProperty('--dy', dy+'px');
        p.style.animation = `fireworkburst ${0.9+Math.random()*0.4}s ease-out forwards`;
        document.body.appendChild(p);
        setTimeout(()=>p.remove(), 1500);
      }
    }, b*450);
  }
}
const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes confettifall{to{transform:translateY(110vh) rotate(720deg);}}
@keyframes fireworkburst{
  0%{transform:translate(0,0) scale(1);opacity:1;}
  100%{transform:translate(var(--dx),var(--dy)) scale(.2);opacity:0;}
}`;
document.head.appendChild(styleSheet);

function saveHistory(entry){
  state.history.unshift(entry);
  state.history = state.history.slice(0,30);
  localStorage.setItem('lostanding_history', JSON.stringify(state.history));
}
function renderHistory(){
  const el = document.getElementById('history-list');
  if(state.history.length===0){ el.innerHTML = `<div class="panel-box">No matches played yet. Start a Royal Rumble or Single Match to build history.</div>`; return; }
  el.innerHTML = state.history.map(h=>`
    <div class="panel-box" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <div><b style="color:var(--gold)">${h.type}</b> — Winner: <b>${h.winner}</b></div>
      <div style="font-size:12px;color:var(--paper-dim)">${h.duration ? 'Duration '+h.duration+' · ':''}${h.eliminations!=null?h.eliminations+' eliminations · ':''}${h.participants?h.participants+' competitors · ':''}${h.date}</div>
    </div>`).join('');
}

/* ============================================================
   SINGLE MATCH MODE
============================================================ */
function renderSinglePickers(){
  const pickA=document.getElementById('pickA'), pickB=document.getElementById('pickB');
  if(pickA.options.length===0){
    ROSTER.forEach(w=>{
      pickA.innerHTML += `<option value="${w.id}">${w.name} (${w.overall} OVR)</option>`;
      pickB.innerHTML += `<option value="${w.id}">${w.name} (${w.overall} OVR)</option>`;
    });
    pickB.selectedIndex=1;
    pickA.addEventListener('change', renderSingleCards);
    pickB.addEventListener('change', renderSingleCards);
  }
  populateTitlePicker();
  renderSingleCards();
}
function miniCard(w){
  const bg = w.photo ? `background-image:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.15)), url('${w.photo}');background-repeat:no-repeat;background-size:contain;background-position:center;` : `background:linear-gradient(135deg, ${w.color}, #000);`;
  return `<div class="wcard" style="cursor:default;">
    <div class="wportrait" style="${bg}">${w.photo?'':`<span class="initials">${initials(w.name)}</span>`}</div>
    <h3 class="wname">${w.name}</h3><p class="wnick">"${w.nick}"</p>
    <div class="wmeta"><span>${w.brand}</span><span>${w.country}</span></div>
    <div class="wrating"><span>OVR</span><span class="ovr">${w.overall}</span></div>
  </div>`;
}
function renderSingleCards(){
  const wa = ROSTER.find(w=>w.id==document.getElementById('pickA').value);
  const wb = ROSTER.find(w=>w.id==document.getElementById('pickB').value);
  document.getElementById('cardA').innerHTML = miniCard(wa);
  document.getElementById('cardB').innerHTML = miniCard(wb);
  const stats = [['Strength','strength'],['Speed','speed'],['Power','power'],['Technique','technique'],['Mind','mind'],['Stamina','stamina'],['Defense','defense'],['Attack','attack']];
  document.getElementById('compare-table').innerHTML = stats.map(([label,key])=>{
    const av=wa[key], bv=wb[key];
    return `<div class="compare-row">
      <span style="text-align:right;color:var(--gold)">${av}</span>
      <div class="compare-mid-track"><div class="half"><i class="left" style="width:${av}%"></i></div><div class="half"><i class="right" style="width:${bv}%"></i></div></div>
      <span style="color:var(--gold)">${bv}</span>
    </div><div style="text-align:center;font-size:10px;color:var(--paper-dim);margin-top:-4px;margin-bottom:4px;">${label}</div>`;
  }).join('');
  document.getElementById('single-result').innerHTML='';
}
document.getElementById('btn-single-start').addEventListener('click',()=>{
  const wa = ROSTER.find(w=>w.id==document.getElementById('pickA').value);
  const wb = ROSTER.find(w=>w.id==document.getElementById('pickB').value);
  const titleId = document.getElementById('pickTitle').value || null;
  simulateSingleMatch(wa,wb,titleId);
});
function simulateSingleMatch(wa,wb,titleId){
  let A={...wa,hp:100}, B={...wb,hp:100};
  let log=[];
  let rounds=0;
  while(A.hp>0 && B.hp>0 && rounds<60){
    rounds++;
    [[A,B],[B,A]].forEach(([att,def])=>{
      if(att.hp<=0||def.hp<=0) return;
      const offense = att.attack*0.4+att.power*0.3+att.technique*0.3;
      const defense = def.defense*0.5+def.durability*0.3;
      const swing=(Math.random()-0.5)*60;
      const diff = offense-defense+swing;
      if(diff>-5){
        const dmg = Math.max(3,Math.min(20,7+diff*0.15));
        def.hp = Math.max(0,def.hp-dmg);
        log.push(fill(pick(COMM_HIT),{A:att.name,B:def.name,move:pick(MOVES_POOL)}));
      }
    });
  }
  const winner = A.hp>=B.hp ? wa : wb;
  const loser = winner===wa ? wb : wa;
  ensureStat(winner.id).wins++; ensureStat(winner.id).matches++;
  ensureStat(loser.id).losses++; ensureStat(loser.id).matches++;
  saveStats();
  const rivResult = bumpRivalry(winner.id, loser.id, titleId ? 'Title Match' : 'Single Match');
  let titleNote = '';
  let titleInfo = null;
  if(titleId){
    const def = titleDef(titleId);
    const rec = titleRecord(titleId);
    const wasChampion = !rec.vacant && rec.championId===winner.id;
    if(wasChampion){
      recordDefense(titleId);
      titleNote = `<div class="champ-title-tags"><span class="champ-title-tag">${def.belt} Retains the ${def.name}</span></div>`;
      titleInfo = { name: def.name, changed:false };
      speakLine(fill(pick(COMM_TITLE_RETAIN),{A:winner.name,T:def.name}));
    } else {
      assignTitle(titleId, winner, 'Won on Single Match');
      titleNote = `<div class="champ-title-tags"><span class="champ-title-tag">${def.belt} NEW ${def.name} Champion</span></div>`;
      titleInfo = { name: def.name, changed:true };
      speakLine(fill(pick(COMM_TITLE_CHANGE),{A:winner.name,T:def.name}));
    }
  } else {
    speakLine(fill(pick(COMM_VICTORY),{A:winner.name}));
  }
  if(rivResult && rivResult.justMaxed) speakLine(fill(pick(COMM_RIVALRY_MAX),{A:rivResult.nameA,B:rivResult.nameB}));
  const crowdLine = winner.popularity>=80 ? `🔥 ${pick(FINISH_LINES)} — the crowd is losing their minds for ${winner.name}!`
    : winner.popularity>=60 ? `👏 ${pick(CHEER_LINES)}`
    : winner.popularity<45 ? `😐 A mixed reaction from the crowd — not everyone's happy to see ${winner.name} walk out on top.`
    : `The crowd gives a respectful ovation.`;
  document.getElementById('single-result').innerHTML = `
    <div class="panel-box">
      <h3>Result</h3>
      <p style="color:var(--gold-bright);font-family:'Anton',sans-serif;font-size:24px;">${winner.name} wins!</p>
      ${titleNote}
      <div style="font-size:13px;color:var(--paper-dim);margin:8px 0;">${crowdLine}</div>
      <div class="commentary-feed" style="height:160px;">${log.slice(-10).map(l=>`<div>${l}</div>`).join('')}</div>
    </div>`;
  saveHistory({type: titleId ? 'Title Match' : 'Single Match', winner:winner.name, date:new Date().toLocaleDateString()});
  showVictory(winner, titleId ? 'Title Match' : 'Single Match', { duration:'—', eliminations:'—', participants:2, hp: Math.round((winner===wa?A.hp:B.hp)) }, titleInfo, (rivResult && rivResult.justMaxed) ? rivResult : null);
}
