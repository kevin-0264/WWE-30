
/* ============================================================
   TESTIMONIALS
============================================================ */
const TESTIMONIAL_LINES = [
  "Every entrance is a statement. The moment my music hits, I already know I've won half the psychological battle.",
  "People underestimate how much this sport takes from your body. What they see for ten minutes, we pay for the next three days.",
  "I don't remember my first match. I remember my first elimination — the exact second the crowd turned on me and I loved it.",
  "The Rumble isn't about being the strongest in the room. It's about being the last one still thinking clearly.",
  "My finisher took two years to get right. Now it takes two seconds to end somebody's night.",
  "Championships fade, but the respect of the locker room — that's the belt that actually matters.",
  "I've been thrown over that top rope more times than I can count. Getting back up is the whole career.",
  "You can scout a wrestler's moveset, but you can't scout their heart. That's the part I train hardest.",
  "The roar when you eliminate a former champion — nothing in this business replaces that feeling.",
  "I train like the thirtieth entrant is coming for me specifically, because eventually, she is.",
  "Every rivalry starts the same way: respect that curdles the second the bell rings.",
  "People ask if it's scripted who wins. I tell them nobody scripts the bruises.",
  "My coach told me survival is a skill, not luck. I didn't believe her until my third Rumble.",
  "I watch tape of my losses more than my wins. The wins don't teach you anything.",
  "There's a very specific silence right before you get eliminated. I've learned to make peace with it."
];
const TESTIMONIAL_ROLES = ["Former Champion","Rumble Veteran","Rising Star","Tag Team Specialist","Fan Favorite","Locker Room Leader","Two-Time Titleholder","Undefeated Rookie"];
function buildTestimonials(){
  const rnd = seededRand(4242);
  const pickIdx = [];
  const poolIds = ROSTER.map(w=>w.id);
  for(let i=0;i<poolIds.length;i++){ const j = Math.floor(rnd()*poolIds.length); [poolIds[i],poolIds[j]]=[poolIds[j],poolIds[i]]; }
  const chosen = poolIds.slice(0,9);
  return chosen.map((id,i)=>{
    const w = ROSTER.find(r=>r.id===id);
    return {
      wrestler: w,
      quote: TESTIMONIAL_LINES[i % TESTIMONIAL_LINES.length],
      role: TESTIMONIAL_ROLES[i % TESTIMONIAL_ROLES.length]
    };
  });
}
const TESTIMONIALS = buildTestimonials();
let testimonialFeaturedIdx = 0;
let testimonialTimer = null;
function testimonialAvatarHTML(w, sizeClass){
  const pic = w.profilePic || w.photo;
  return pic
    ? `<div class="${sizeClass}" style="background-image:url('${pic}')"></div>`
    : `<div class="${sizeClass}" style="background:${w.color}">${initials(w.name)}</div>`;
}
function renderFeaturedTestimonial(){
  const t = TESTIMONIALS[testimonialFeaturedIdx];
  const wrap = document.getElementById('testimonial-featured-wrap');
  wrap.innerHTML = `
    <div class="testimonial-featured">
      <div class="tf-mark">"</div>
      <div class="tf-text">"${t.quote}"</div>
      <div class="tf-person">
        ${testimonialAvatarHTML(t.wrestler,'tf-avatar')}
        <div>
          <div class="tp-name" style="font-family:'Anton',sans-serif;color:var(--paper);font-size:15px;">${t.wrestler.name}</div>
          <div class="tp-role">"${t.wrestler.nick}" · ${t.role}</div>
        </div>
      </div>
      <div class="testimonial-nav-dots" id="testimonial-nav-dots"></div>
    </div>`;
  const dots = document.getElementById('testimonial-nav-dots');
  TESTIMONIALS.forEach((_,i)=>{
    const d=document.createElement('div');
    d.className='dot'+(i===testimonialFeaturedIdx?' active':'');
    d.addEventListener('click',()=>{ testimonialFeaturedIdx=i; renderFeaturedTestimonial(); restartTestimonialAutoplay(); });
    dots.appendChild(d);
  });
}
function renderTestimonialGrid(){
  document.getElementById('testimonial-grid').innerHTML = TESTIMONIALS.map(t=>`
    <div class="testimonial-card">
      <div class="testimonial-quote-mark">"</div>
      <div class="testimonial-text">${t.quote}</div>
      <div class="testimonial-person">
        ${testimonialAvatarHTML(t.wrestler,'testimonial-avatar')}
        <div>
          <div class="tp-name">${t.wrestler.name}</div>
          <div class="tp-role">${t.role}</div>
        </div>
      </div>
    </div>`).join('');
}
function renderTestimonials(){
  renderFeaturedTestimonial();
  renderTestimonialGrid();
  startTestimonialAutoplay();
}
function startTestimonialAutoplay(){
  stopTestimonialAutoplay();
  testimonialTimer = setInterval(()=>{
    testimonialFeaturedIdx = (testimonialFeaturedIdx+1) % TESTIMONIALS.length;
    renderFeaturedTestimonial();
  }, 5500);
}
function stopTestimonialAutoplay(){ if(testimonialTimer){ clearInterval(testimonialTimer); testimonialTimer=null; } }
function restartTestimonialAutoplay(){ startTestimonialAutoplay(); }
