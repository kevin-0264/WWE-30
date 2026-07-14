
/* ---------- CUSTOM WRESTLERS ---------- */
function loadCustomWrestlers(){ return JSON.parse(localStorage.getItem('lostanding_custom_wrestlers')||'[]'); }
function safeLocalStorageSet(key, value){
  try{
    localStorage.setItem(key, value);
    return true;
  } catch(err){
    console.error('Storage save failed for', key, err);
    return false;
  }
}
function saveCustomWrestlers(){ return safeLocalStorageSet('lostanding_custom_wrestlers', JSON.stringify(customWrestlers)); }
let customWrestlers = loadCustomWrestlers();
customWrestlers.forEach(cw=>ROSTER.push(cw));



/* ============================================================
   CREATE WRESTLER
============================================================ */
const CW_STAT_KEYS = [['strength','STR'],['speed','SPD'],['stamina','STA'],['agility','AGI'],['technique','TEC'],['power','PWR'],['mind','MND'],['defense','DEF']];
let cwPhotos = { portrait:'', roster:'', entrance:'', match:'' };
const CW_PHOTO_SLOTS = [['portrait','Portrait'],['roster','Roster Card'],['entrance','Ring Entrance'],['match','In-Match']];
let cwInitialized = false;
function cwPopulateSelectors(){
  const brandSel = document.getElementById('cw-brand');
  const countrySel = document.getElementById('cw-country');
  if(brandSel.options.length===0) BRANDS.forEach(b=>brandSel.innerHTML+=`<option value="${b}">${b}</option>`);
  if(countrySel.options.length===0) COUNTRIES.forEach(c=>countrySel.innerHTML+=`<option value="${c}">${c}</option>`);
}
function cwUpdateOverallPreview(){
  const vals = CW_STAT_KEYS.map(([key])=> parseInt(document.getElementById('cw-stat-'+key).value,10));
  const overall = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
  document.getElementById('cw-overall-preview').textContent = overall;
}
function cwBuildStatSliders(){
  const wrap = document.getElementById('cw-stat-sliders');
  if(wrap.dataset.built) { cwUpdateOverallPreview(); return; }
  wrap.dataset.built = '1';
  wrap.innerHTML = CW_STAT_KEYS.map(([key,label])=>`
    <div class="cw-stat-row">
      <span>${label}</span>
      <input type="range" min="35" max="99" value="70" id="cw-stat-${key}">
      <span class="cw-stat-val" id="cw-stat-${key}-val">70</span>
    </div>`).join('');
  CW_STAT_KEYS.forEach(([key])=>{
    document.getElementById('cw-stat-'+key).addEventListener('input', e=>{
      document.getElementById('cw-stat-'+key+'-val').textContent = e.target.value;
      cwUpdateOverallPreview();
    });
  });
  cwUpdateOverallPreview();
}
function cwCompressImage(file, maxDim, quality){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    const reader = new FileReader();
    reader.onload = ev=>{
      img.onload = ()=>{
        let w = img.width, h = img.height;
        if(w>h){ if(w>maxDim){ h = Math.round(h*maxDim/w); w = maxDim; } }
        else { if(h>maxDim){ w = Math.round(w*maxDim/h); h = maxDim; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function cwHandlePhotoUpload(slot, e){
  const file = e.target.files[0];
  if(!file) return;
  const previewEl = document.getElementById('cw-photo-preview-'+slot);
  previewEl.textContent = 'Processing...';
  cwCompressImage(file, 480, 0.75).then(dataUrl=>{
    cwPhotos[slot] = dataUrl;
    previewEl.innerHTML = `<img src="${dataUrl}" alt="Preview">`;
  }).catch(()=>{
    previewEl.textContent = 'Could not load that image.';
    cwPhotos[slot] = '';
  });
}
function cwResetForm(){
  ['cw-name','cw-nick','cw-height','cw-weight','cw-entrance','cw-signature','cw-finisher','cw-bio'].forEach(id=>{
    document.getElementById(id).value = '';
  });
  CW_PHOTO_SLOTS.forEach(([slot])=>{
    document.getElementById('cw-photo-preview-'+slot).innerHTML = 'No Photo';
    document.getElementById('cw-photo-input-'+slot).value = '';
    cwPhotos[slot] = '';
  });
  CW_STAT_KEYS.forEach(([key])=>{
    document.getElementById('cw-stat-'+key).value = 70;
    document.getElementById('cw-stat-'+key+'-val').textContent = 70;
  });
  cwUpdateOverallPreview();
}
function cwSubmit(){
  const name = document.getElementById('cw-name').value.trim();
  if(!name){ alert('Please give your wrestler a name.'); return; }
  const nick = document.getElementById('cw-nick').value.trim() || 'The Newcomer';
  const brand = document.getElementById('cw-brand').value || BRANDS[0];
  const country = document.getElementById('cw-country').value || COUNTRIES[0];
  const height = document.getElementById('cw-height').value.trim() || `5'7"`;
  const weight = document.getElementById('cw-weight').value.trim() || '135 lbs';
  const entranceTheme = document.getElementById('cw-entrance').value.trim() || 'A standard house-show entrance.';
  const signature = document.getElementById('cw-signature').value.trim() || pick(MOVES_POOL);
  const finisher = document.getElementById('cw-finisher').value.trim() || pick(FINISHERS);
  const bio = document.getElementById('cw-bio').value.trim() || `${name} "${nick}" is ready to make a name for herself in ${brand}.`;
  const stats = {};
  CW_STAT_KEYS.forEach(([key])=>{ stats[key] = parseInt(document.getElementById('cw-stat-'+key).value,10); });
  const overall = Math.round(Object.values(stats).reduce((a,b)=>a+b,0)/Object.values(stats).length);
  const id = Date.now();
  const rosterPhoto = cwPhotos.roster || cwPhotos.portrait || cwPhotos.entrance || cwPhotos.match || '';
  const portraitPhoto = cwPhotos.portrait || rosterPhoto;
  const wrestler = {
    id, name, nick, brand, country, height, weight,
    strength:stats.strength, speed:stats.speed, stamina:stats.stamina, agility:stats.agility,
    technique:stats.technique, power:stats.power, mind:stats.mind, luck: 50+Math.round(Math.random()*20-10),
    defense:stats.defense, attack: stats.power, recovery: stats.stamina, durability: stats.defense,
    signature, finisher, championships:0, rumbleWins:0, totalMatches:0, winRate:50, popularity:50+Math.round(Math.random()*10),
    bio, entranceTheme,
    photo: rosterPhoto, photoDetail: portraitPhoto!==rosterPhoto ? portraitPhoto : '',
    profilePic: rosterPhoto, profileDetail: portraitPhoto!==rosterPhoto ? portraitPhoto : '',
    screenEntry: cwPhotos.entrance, matchImage: cwPhotos.match,
    color: `hsl(${Math.round(Math.random()*360)} 55% 38%)`,
    overall, custom:true
  };
  customWrestlers.push(wrestler);
  const saved = saveCustomWrestlers();
  if(!saved){
    customWrestlers.pop();
    alert("Couldn't save this wrestler — your browser's storage is full. Try removing a couple of your existing custom wrestlers first, or use a smaller/simpler photo.");
    return;
  }
  ROSTER.push(wrestler);
  cwResetForm();
  renderCwCustomList();
}
function cwDeleteWrestler(id){
  if(!confirm('Remove this wrestler? This cannot be undone.')) return;
  TITLE_DEFS.forEach(def=>{
    const rec = titleRecord(def.id);
    if(rec && !rec.vacant && rec.championId===id) vacateTitle(def.id);
  });
  state.selected = state.selected.filter(sid=>sid!==id);
  customWrestlers = customWrestlers.filter(w=>w.id!==id);
  saveCustomWrestlers();
  const idx = ROSTER.findIndex(w=>w.id===id);
  if(idx>-1) ROSTER.splice(idx,1);
  renderCwCustomList();
}
function renderCwCustomList(){
  document.getElementById('cw-custom-count').textContent = `${customWrestlers.length} Created`;
  const grid = document.getElementById('cw-custom-grid');
  if(customWrestlers.length===0){
    grid.innerHTML = `<div class="panel-box">You haven't created any wrestlers yet — fill out the form above to add one to your roster.</div>`;
    return;
  }
  grid.innerHTML = customWrestlers.map(w=>`
    <div class="wcard cw-custom-card" style="cursor:default;">
      <button class="btn small ghost cw-delete-btn" onclick="cwDeleteWrestler(${w.id})">Delete</button>
      <div class="wportrait">
        ${w.photo ? `<img src="${w.photo}" alt="${w.name}" onerror="this.style.display='none'">` : `<span class="initials">${initials(w.name)}</span>`}
      </div>
      <h3 class="wname">${w.name}</h3>
      <p class="wnick">"${w.nick}"</p>
      <div class="wmeta"><span>${w.brand}</span><span>${w.country}</span></div>
      <div class="wrating"><span style="color:var(--paper-dim)">Custom</span><span class="ovr">${w.overall}</span></div>
    </div>`).join('');
}
function clearAllCustomWrestlers(){
  if(!confirm('Remove ALL of your custom wrestlers? This frees up storage space and cannot be undone.')) return;
  customWrestlers.forEach(w=>{
    TITLE_DEFS.forEach(def=>{
      const rec = titleRecord(def.id);
      if(rec && !rec.vacant && rec.championId===w.id) vacateTitle(def.id);
    });
    const idx = ROSTER.findIndex(r=>r.id===w.id);
    if(idx>-1) ROSTER.splice(idx,1);
  });
  customWrestlers = [];
  localStorage.removeItem('lostanding_custom_wrestlers');
  renderCwCustomList();
}
function initCreateWrestlerScreen(){
  cwPopulateSelectors();
  cwBuildStatSliders();
  renderCwCustomList();
  if(!cwInitialized){
    cwInitialized = true;
    CW_PHOTO_SLOTS.forEach(([slot])=>{
      document.getElementById('cw-photo-input-'+slot).addEventListener('change', e=> cwHandlePhotoUpload(slot, e));
    });
    document.getElementById('btn-create-wrestler').addEventListener('click', cwSubmit);
    document.getElementById('btn-clear-custom').addEventListener('click', clearAllCustomWrestlers);
  }
}
