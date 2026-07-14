
/* ============================================================
   LIVE CROWD REACTIONS
============================================================ */
state.crowdMeter = 50;
const CHEER_LINES = ["THIS IS AWESOME!","LET'S GO!","MASSIVE POP!","THE CROWD ERUPTS!"];
const BOO_LINES = ["BOOOO!","The crowd turns on her...","Not a fan favorite here..."];
const ELIM_LINES = ["HOLY S#!T!","OHHHHH!!","GONE!!","WHAT AN ELIMINATION!"];
const FINISH_LINES = ["YOU DESERVE IT!","NEW ERA BEGINS!","LISTEN TO THIS CROWD!"];
function resetCrowdMeter(){
  state.crowdMeter = 50;
  updateCrowdMeterUI();
}
function updateCrowdMeterUI(){
  const pctEl = document.getElementById('crowd-meter-pct');
  const fillEl = document.getElementById('crowd-meter-fill');
  const descEl = document.getElementById('crowd-meter-desc');
  if(!pctEl||!fillEl||!descEl) return;
  const v = Math.round(state.crowdMeter);
  pctEl.textContent = v+'%';
  fillEl.style.width = v+'%';
  descEl.textContent = v>=85 ? 'Electric!!' : v>=65 ? 'Red Hot Crowd' : v>=40 ? 'Warming Up' : v>=20 ? 'Mixed Reaction' : 'Dead Silence';
  const glow = document.querySelector('#ring .crowd-glow');
  if(glow){
    const heat = v/100;
    glow.style.background = `radial-gradient(circle at 50% 0%, rgba(224,38,63,${0.08+heat*0.35}), rgba(212,175,55,${0.05+heat*0.2}) 45%, transparent 70%)`;
    glow.style.animationDuration = (2.6 - heat*1.4) + 's';
  }
}
function decayCrowdMeter(){
  if(state.crowdMeter>50) state.crowdMeter = Math.max(50, state.crowdMeter-1.5);
  else if(state.crowdMeter<50) state.crowdMeter = Math.min(50, state.crowdMeter+1.5);
  updateCrowdMeterUI();
}
function bumpCrowd(delta){
  state.crowdMeter = Math.max(0, Math.min(100, state.crowdMeter + delta));
  updateCrowdMeterUI();
}
function spawnCrowdBubble(text, cls){
  const layer = document.getElementById('crowd-reactions-layer');
  if(!layer) return;
  const el = document.createElement('div');
  el.className = 'crowd-bubble' + (cls?' '+cls:'');
  el.textContent = text;
  el.style.left = (40 + Math.random()*20) + '%';
  layer.appendChild(el);
  setTimeout(()=>el.remove(), 1900);
}
function reactToEntrance(f){
  if(f.popularity>=80){ spawnCrowdBubble(pick(CHEER_LINES),'hot'); bumpCrowd(12); }
  else if(f.popularity>=60){ spawnCrowdBubble('CHEERS!'); bumpCrowd(6); }
  else if(f.popularity<45){ spawnCrowdBubble(pick(BOO_LINES),'boo'); bumpCrowd(-8); }
  else { bumpCrowd(2); }
}
function reactToElimination(a,b){
  spawnCrowdBubble(pick(ELIM_LINES),'hot');
  bumpCrowd(10);
}
function reactToWinner(winner){
  if(winner.popularity>=60){ spawnCrowdBubble(pick(FINISH_LINES),'hot'); }
  else { spawnCrowdBubble('A NEW CHAMPION!'); }
  state.crowdMeter = 100;
  updateCrowdMeterUI();
}
