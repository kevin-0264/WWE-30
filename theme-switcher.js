
/* ============================================================
   DARK / GOLD THEME SWITCHER
============================================================ */
const THEMES = {
  classic:  { name:"Classic WWE",   gold:'#d4af37', goldBright:'#f4d568', crimson:'#9c1c2e', crimsonBright:'#e0263f', black:'#0a0908', blackSoft:'#15120f', panel:'#1c1714', paper:'#ece4d3', paperDim:'#bdb29c' },
  royal:    { name:"Royal Gold",    gold:'#e6b422', goldBright:'#ffd966', crimson:'#7a1f1f', crimsonBright:'#b8302f', black:'#0c0a05', blackSoft:'#1a1509', panel:'#241c0d', paper:'#f2e9d0', paperDim:'#c9b98a' },
  blood:    { name:"Blood Red",     gold:'#c9a24a', goldBright:'#e8c674', crimson:'#8a0303', crimsonBright:'#ff1e3c', black:'#0a0505', blackSoft:'#150808', panel:'#210c0c', paper:'#efe1e1', paperDim:'#c4a3a3' },
  neon:     { name:"Cyber Neon",    gold:'#00e5ff', goldBright:'#7cf9ff', crimson:'#ff00c8', crimsonBright:'#ff4dd8', black:'#050208', blackSoft:'#0d0616', panel:'#150a22', paper:'#e8f7ff', paperDim:'#9fb8c9' },
  purple:   { name:"Purple",        gold:'#b28dff', goldBright:'#d9c2ff', crimson:'#ff5f9e', crimsonBright:'#ff2f85', black:'#0a0612', blackSoft:'#150c22', panel:'#201331', paper:'#efe6ff', paperDim:'#b8a6d9' },
  blackgold:{ name:"Black & Gold",  gold:'#d4af37', goldBright:'#ffe37a', crimson:'#3a3a3a', crimsonBright:'#5c5c5c', black:'#000000', blackSoft:'#0a0a0a', panel:'#141414', paper:'#f0f0f0', paperDim:'#a8a8a8' }
};
function applyTheme(key){
  const t = THEMES[key] || THEMES.classic;
  const s = document.documentElement.style;
  s.setProperty('--gold', t.gold);
  s.setProperty('--gold-bright', t.goldBright);
  s.setProperty('--crimson', t.crimson);
  s.setProperty('--crimson-bright', t.crimsonBright);
  s.setProperty('--black', t.black);
  s.setProperty('--black-soft', t.blackSoft);
  s.setProperty('--panel', t.panel);
  s.setProperty('--paper', t.paper);
  s.setProperty('--paper-dim', t.paperDim);
  s.setProperty('--hp-mid', t.gold);
  localStorage.setItem('lostanding_theme', key);
  document.querySelectorAll('.theme-swatch').forEach(el=> el.classList.toggle('active', el.dataset.theme===key));
}
function renderThemeSwatches(){
  const grid = document.getElementById('theme-swatch-grid');
  if(!grid) return;
  const active = localStorage.getItem('lostanding_theme') || 'classic';
  grid.innerHTML = Object.entries(THEMES).map(([key,t])=>`
    <div class="theme-swatch ${key===active?'active':''}" data-theme="${key}" onclick="applyTheme('${key}')">
      <div class="theme-swatch-check">✓</div>
      <div class="theme-swatch-preview">
        <span style="background:${t.black}"></span><span style="background:${t.panel}"></span>
        <span style="background:${t.crimsonBright}"></span><span style="background:${t.gold}"></span><span style="background:${t.goldBright}"></span>
      </div>
      <div class="theme-swatch-name">${t.name}</div>
    </div>`).join('');
}
applyTheme(localStorage.getItem('lostanding_theme') || 'classic');
renderThemeSwatches();
/* ---------- STATE ---------- */
const state = {
  selected: [],          // array of wrestler ids in entry order
  settings: Object.assign({ speed:1, interval:10, variance:1 }, loadVoiceSettingsEarly()),
  history: JSON.parse(localStorage.getItem('lostanding_history')||'[]')
};
function loadVoiceSettingsEarly(){
  return Object.assign({ voiceEnabled:false, voiceName:'', voiceRate:1.1, voicePitch:1.05, voiceVolume:1 },
    JSON.parse(localStorage.getItem('lostanding_voice_settings')||'{}'));
}
