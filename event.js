

/* EVENTS */
/* ============================================================
   UPCOMING EVENTS DATA & RENDER
============================================================ */
const UPCOMING_EVENTS = [
  {
    id: 'evt1',
    title: "Reckoning Point",
    date: "August 15, 2026",
    match: "Aarki Doshi vs. Mrunali Kale",
    poster: "assets/images/match/aarki_mrunali.png" // Replace with your actual poster image path
  },
  {
    id: 'evt2',
    title: "Crown of Thorns",
    date: "September 12, 2026",
    match: "30-Woman Royal Rumble",
    poster: "assets/images/match/bhumi_yashvi.png" // Replace with your actual poster image path
  },
  {
    id: 'evt3',
    title: "Shattered Glass",
    date: "October 31, 2026",
    match: "Yukti Lalwani vs. Kashish Prasad",
    poster: "assets/images/match/kashu_prutha.png" // Replace with your actual poster image path
  },
  {
    id: 'evt1',
    title: "Reckoning Point",
    date: "August 15, 2026",
    match: "Diya Patel vs. Mrunali Kale",
    poster: "assets/images/match/krishna_sherebanu.png" // Replace with your actual poster image path
  },
  {
    id: 'evt2',
    title: "Crown of Thorns",
    date: "September 12, 2026",
    match: "30-Woman Royal Rumble",
    poster: "assets/images/match/krishna_latika.png" // Replace with your actual poster image path
  },
  {
    id: 'evt3',
    title: "Shattered Glass",
    date: "October 31, 2026",
    match: "Yukti Lalwani vs. Kashish Prasad",
    poster: "assets/images/match/latika_aarki.png" // Replace with your actual poster image path
  }
];

function renderEvents() {
  document.getElementById('events-count').textContent = `${UPCOMING_EVENTS.length} Scheduled`;
  
  document.getElementById('events-grid').innerHTML = UPCOMING_EVENTS.map(evt => `
    <div class="event-card">
      <div class="event-poster">
        <span>POSTER<br>PENDING</span>
        <img src="${evt.poster}" alt="${evt.title}" onerror="this.style.display='none'">
      </div>
      <div class="event-info">
        <div class="event-date">${evt.date}</div>
        <h3 class="event-title">${evt.title}</h3>
        <div class="event-match">Main Event: <b>${evt.match}</b></div>
      </div>
    </div>
  `).join('');
}
/*HIGHLIGHTS*/
/* ============================================================
   HIGHLIGHTS DATA & RENDER
============================================================ */
const HIGHLIGHTS_DATA = [
  {
    id: 'h1',
    title: "FULL MATCH: Diya Patel vs. Mrunali Kale - Reckoning Point 2026",
    channel: "LOS Official",
    views: "21M views",
    time: "1 year ago",
    duration: "59:43",
    badge: "FULL MATCH",
    thumbnail: "assets/images/match/bhumi_yashvi.png",
    avatar: "assets/images/diya-patel-1.jpg",
    verified: true
  },
  {
    id: 'h2',
    title: "FULL MATCH: 30-Woman Royal Rumble Final 4 Chaos! | Crown of Thorns",
    channel: "LOS Official",
    views: "25M views",
    time: "1 year ago",
    duration: "1:09:23",
    badge: "FULL MATCH",
    thumbnail: "assets/images/match/video2.png",
    avatar: "assets/images/mrunali1.jpg",
    verified: true
  },
  {
    id: 'h3',
    title: "Main Event October 31, 2026 Yukti Lalwani vs Kashish Prasad",
    channel: "WrestleFan100",
    views: "28M views",
    time: "12 years ago",
    duration: "7:45",
    badge: "", // Empty strings hide the badge
    thumbnail: "assets/images/match/video1.png",
    avatar: "assets/images/kashu.jpg",
    verified: false
  },
  {
    id: 'h1',
    title: "FULL MATCH: Diya Patel vs. Mrunali Kale - Reckoning Point 2026",
    channel: "LOS Official",
    views: "21M views",
    time: "1 year ago",
    duration: "59:43",
    badge: "FULL MATCH",
    thumbnail: "assets/images/match/twovsfour.png",
    avatar: "assets/images/diya-patel-1.jpg",
    verified: true
  },
  {
    id: 'h2',
    title: "FULL MATCH: 30-Woman Royal Rumble Final 4 Chaos! | Crown of Thorns",
    channel: "LOS Official",
    views: "25M views",
    time: "1 year ago",
    duration: "1:09:23",
    badge: "FULL MATCH",
    thumbnail: "assets/images/match/kashu_latika.png",
    avatar: "assets/images/mrunali1.jpg",
    verified: true
  },
  {
    id: 'h2',
    title: "FULL MATCH: TEAM HEROES VS TEAM CHALLENGERS | Crown of Thorns",
    channel: "LOS Official",
    views: "5M views",
    time: "3 months ago",
    duration: "1:02:53",
    badge: "FULL MATCH",
    thumbnail: "assets/images/match/video3.jpg",
    avatar: "assets/images/mrunali1.jpg",
    verified: true
  },
  {
    id: 'h2',
    title: "FULL MATCH: 30-Woman Royal Rumble Final 4 Chaos! | Crown of Thorns",
    channel: "LOS Official",
    views: "25M views",
    time: "1 year ago",
    duration: "1:09:23",
    badge: "FULL MATCH",
    thumbnail: "assets/images/match/rumble1.png",
    avatar: "assets/images/mrunali1.jpg",
    verified: true
  },
  {
    id: 'h2',
    title: "FULL MATCH: 30-Woman Royal Rumble Final 4 Chaos! | Crown of Thorns",
    channel: "LOS Official",
    views: "25M views",
    time: "1 year ago",
    duration: "1:09:23",
    badge: "FULL MATCH",
    thumbnail: "assets/images/match/rumble2.png",
    avatar: "assets/images/mrunali1.jpg",
    verified: true
  }

];

function renderHighlights() {
  document.getElementById('highlights-count').textContent = `${HIGHLIGHTS_DATA.length} Videos`;
  
  document.getElementById('highlights-grid').innerHTML = HIGHLIGHTS_DATA.map(hl => {
    // Generate Avatar
    const avatarHtml = hl.avatar 
        ? `<img src="${hl.avatar}" alt="${hl.channel}" onerror="this.style.display='none'">` 
        : initials(hl.channel);
        
    // Generate optional elements
    const badgeHtml = hl.badge ? `<div class="hl-badge">${hl.badge}</div>` : '';
    const verifiedIcon = hl.verified ? `<svg class="hl-verified" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : '';

    return `
    <div class="hl-card">
      <div class="hl-thumb-wrap">
        <img class="hl-thumb" src="${hl.thumbnail}" alt="${hl.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'160\\' height=\\'90\\'><rect width=\\'160\\' height=\\'90\\' fill=\\'%231c1714\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23d4af37\\' font-family=\\'Arial\\' font-size=\\'14\\'>NO PREVIEW</text></svg>'">
        ${badgeHtml}
        <div class="hl-duration">${hl.duration}</div>
      </div>
      <div class="hl-details">
        <div class="hl-avatar">${avatarHtml}</div>
        <div class="hl-info">
          <h3 class="hl-title">${hl.title}</h3>
          <div class="hl-meta">
            <div>${hl.channel} ${verifiedIcon}</div>
            <div>${hl.views} • ${hl.time}</div>
          </div>
        </div>
      </div>
    </div>
    `;
  }).join('');
}
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('topbar').style.display = id==='home' ? 'none' : 'flex';
  window.scrollTo(0,0);
  if(id!=='testimonials') stopTestimonialAutoplay();
  if(id==='roster') renderRoster();
  if(id==='single') renderSinglePickers();
  if(id==='history') renderHistory();
  if(id==='testimonials') renderTestimonials();
  if(id==='events') renderEvents();
  if(id==='highlights') renderHighlights();
  if(id==='championships') renderChampionships();
  if(id==='rivalries') renderRivalries();
  if(id==='stats-dashboard') renderStatsDashboard();
  if(id==='rankings') renderRankings();
  if(id==='hall-of-fame') renderHallOfFame();
  if(id==='create-wrestler') initCreateWrestlerScreen();
  if(id==='settings') renderThemeSwatches();
}