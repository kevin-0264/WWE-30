
/* ---------- DATA: 32 original fictional wrestlers ---------- */
const FIRST = ["Diya","Mrunali","Kashish","Aarki","Yukti","Kashish","Nidhi","Bhumi","Tanvi","Arvisha","Prutha","Kezy","Urvashi","Zil","Kashish","Pranali","Sherebanu","Suman","Kena","Sneha","Siddhi","Yashvi","Soja","Ruthavi","Divyangi","Harshita","Khushi","Krishna","Shivani","Priyanshi","Ruchita","Latika"];
const LAST  = ["Patel","Kale","Prasad","Doshi","Lalwani","Kansara","Prajapati","Modi","Patel","Modhiya","Dabhade","Gandhi","Marathe","Modi","Modi","Phalake","Kathiriya","Singh","Modi","Gandhi","Gandhi","Agralwal","Pushpujan","Aute","Pandya","Patel","Shah","Darji","Shah","Patel","Jagtap","Bhongade"];
const NICK = ["The Vanguard","Heir Apparent","The Wildfire","Velvet Hammer","The Equalizer","Crowned in Blood","The Undertow","Glasshouse","The Reckoning","Nightshade","The Architect","Razorline","The Last Word","Iron Lullaby","The Tempo","Hollow Crown","Switchblade","The Long Game","Stormline","The Heretic","Sweet Ruin","The Marathon","Fault Line","Diamond Edge","The Quiet Storm","Bone Orchard","The Reverie","Static","The Inheritance","Foxglove","The Pale Hour","Riot Act"];
const BRANDS = ["Vanguard","Apex","Crucible","Outlaw"];
const COUNTRIES = ["USA","Canada","UK","Mexico","Japan","Australia","Brazil","Ireland","Germany","South Korea","Kenya","India"];
const MOVES_POOL = ["Spinning Backfist","Tornado DDT","Tilt-a-Whirl Slam","Missile Dropkick","German Suplex","Springboard Crossbody","Belly-to-Belly","Codebreaker","Sliding Lariat","Step-up Enzuigiri","Fisherman Suplex","Hurricanrana","Spinebuster","Flying Forearm","Knee Strike Combo","Rolling Elbow"];
const FINISHERS = ["Velvet Eclipse","Final Verdict","Wraithfall","Glass Requiem","Crownbreaker","Hollow Point","The Long Goodbye","Riot Drop","Foxfire Driver","Pale Hour Piledriver","Switchblade Special","Static Shock","Bone Orchard Bomb","Sweet Oblivion","Fault Line DDT","Diamond Cutter Supreme"];
const PROFILE_IMAGES = [
  'assets/images/diya1.jpg',
  'assets/images/mrunali1.jpg',
  'assets/images/kashu1.jpg',
  'assets/images/aarki1.jpg',
  'assets/images/yukti1.jpg',
  'assets/images/kansara1.jpg',
  'assets/images/nidhi1.jpg',
  'assets/images/bhumi1.jpg',
  'assets/images/tanvi1.jpg',
  'assets/images/arvisha1.jpg',
  'assets/images/prutha1.jpg',
  'assets/images/kezy1.jpg',
  'assets/images/urvi1.jpg',
  'assets/images/zil1.jpg',
  'assets/images/kash1.jpg',
  'assets/images/pranali1.heic',
  'assets/images/shere1.jpg',
  'assets/images/suman1.jpg',
  'assets/images/kena1.jpg',
  'assets/images/sneha1.jpg',
  'assets/images/siddhi1.jpg',
  'assets/images/yashvi1.jpg',
  'assets/images/soja1.jpg',
  'assets/images/ruthavi.jpg',
  'assets/images/diyu.jpg',
  'assets/images/harshita1.jpg',
  'assets/images/khushi1.jpg',
  'assets/images/krishna1.jpg',
  'assets/images/shivani1.jpg',
  'assets/images/priyanshi1.jpg',
  'assets/images/ruchita1.jpg',
  'assets/images/latika1.heic'
];
const PROFILE_DETAIL_IMAGES = [
  'assets/images/diya-patel-2.jpg',
  'assets/images/mrunali2.png',
  'assets/images/kashu.jpg',
  'assets/images/aarki2.png',
  'assets/images/yukti-lalwani-52.jpg',
  'assets/images/kansara2.png',
  'assets/images/nidhi2.png',
  'assets/images/bhumi2.png',
  'assets/images/tanvi2.png',
  'assets/images/arvisha-modhiya-102.jpg',
  'assets/images/prutha2.png',
  'assets/images/kezy-gandhi-122.jpg',
  'assets/images/urvashi-marathe-132.jpg',
  'assets/images/zil2.jpeg',
  'assets/images/kash2.png',
  'assets/images/pranali-phalake-162.jpg',
  'assets/images/shere2.jpg',
  'assets/images/suman2.png',
  'assets/images/kena2.png',
  'assets/images/quinta-knox-202.jpg',
  'assets/images/indira-marsh-212.jpg',
  'assets/images/yashvi2.png',
  'assets/images/soja2.png',
  'assets/images/vesper-wolfe-242.jpg',
  'assets/images/camille-tate-252.jpg',
  'assets/images/adira-marlowe-262.jpg',
  'assets/images/rosalind-sterling-272.jpg',
  'assets/images/krishna2.png',
  'assets/images/juniper-vega-292.jpg',
  'assets/images/hesper-holt-302.jpg',
  'assets/images/naya-crowe-312.jpg',
  'assets/images/latika2.png'
];

const SCREEN_ENTRY_IMAGES = [
  'assets/images/diya-patel-1.jpg',
  'assets/images/mrunali3.png',
  'assets/images/zil2.jpeg',
  'assets/images/aarki3.png',
  'assets/images/yukti-lalwani-5.jpg',
  'assets/images/kansara3.png',
  'assets/images/nidhi3.jpg',
  'assets/images/bhumi3.png',
  'assets/images/tanvi-patel-9.jpg',
  'assets/images/arvisha-modhiya-10.jpg',
  'assets/images/prutha3.png',
  'assets/images/kezy-gandhi-12.jpg',
  'assets/images/urvashi-marathe-13.jpg',
  'assets/images/zil-modi-14.jpg',
  'assets/images/kashish-modi-15.jpg',
  'assets/images/pranali-phalake-16.jpg',
  'assets/images/shere3.jpg',
  'assets/images/suman-ashworth-18.jpg',
  'assets/images/brynn-calderon-19.jpg',
  'assets/images/quinta-knox-20.jpg',
  'assets/images/indira-marsh-21.jpg',
  'assets/images/yashvi3.png',
  'assets/images/orla-devereux-23.jpg',
  'assets/images/vesper-wolfe-24.jpg',
  'assets/images/camille-tate-25.jpg',
  'assets/images/adira-marlowe-26.jpg',
  'assets/images/rosalind-sterling-27.jpg',
  'assets/images/krishna3.png',
  'assets/images/juniper-vega-29.jpg',
  'assets/images/hesper-holt-30.jpg',
  'assets/images/naya-crowe-31.jpg',
  'assets/images/latika3.png'
];
const MATCH_IMAGES = [
  'assets/images/diya-patel-2.jpg',
  'assets/images/mrunali4.jpg',
  'assets/images/zil2.jpeg',
  'assets/images/aarki4.png',
  'assets/images/yukti-lalwani-52.jpg',
  'assets/images/kansara4.png',
  'assets/images/nidhi4.png',
  'assets/images/bhumi4.png',
  'assets/images/tanvi-patel-92.jpg',
  'assets/images/arvisha-modhiya-102.jpg',
  'assets/images/prutha4.png',
  'assets/images/kezy-gandhi-122.jpg',
  'assets/images/urvashi-marathe-132.jpg',
  'assets/images/zil2.jpeg',
  'assets/images/kashish-modi-152.jpg',
  'assets/images/pranali-phalake-162.jpg',
  'assets/images/shere4.png',
  'assets/images/suman-ashworth-182.jpg',
  'assets/images/brynn-calderon-192.jpg',
  'assets/images/quinta-knox-202.jpg',
  'assets/images/indira-marsh-212.jpg',
  'assets/images/yashvi4.jpg',
  'assets/images/orla-devereux-232.jpg',
  'assets/images/vesper-wolfe-242.jpg',
  'assets/images/camille-tate-252.jpg',
  'assets/images/adira-marlowe-262.jpg',
  'assets/images/rosalind-sterling-272.jpg',
  'assets/images/krishna4.jpg',
  'assets/images/juniper-vega-292.jpg',
  'assets/images/hesper-holt-302.jpg',
  'assets/images/naya-crowe-312.jpg',
  'assets/images/latika4.png'
];

function seededRand(seed){ let s = seed; return ()=>{ s = (s*9301+49297)%233280; return s/233280; }; }
function buildRoster(){
  const roster = [];
  for(let i=0;i<32;i++){
    const rnd = seededRand(i*97+13);
    const first = FIRST[i], last = LAST[i % LAST.length];
    const name = `${first} ${last}`;
    const nick = NICK[i % NICK.length];
    const brand = BRANDS[i % BRANDS.length];
    const country = COUNTRIES[i % COUNTRIES.length];
    const base = 55 + Math.floor(rnd()*40);
    const stat = (spread)=> Math.max(35, Math.min(99, base + Math.floor((rnd()-0.45)*spread)));
    const profilePic = PROFILE_IMAGES[i] || '';
    const profileDetail = PROFILE_DETAIL_IMAGES[i] || profilePic;
    const screenEntry = SCREEN_ENTRY_IMAGES[i] || profilePic;
    const matchImage = MATCH_IMAGES[i] || profilePic;
    const wrestler = {
      id:i,
      name, nick, brand, country,
      height: `5'${4+Math.floor(rnd()*9)}"`,
      weight: `${110+Math.floor(rnd()*55)} lbs`,
      strength: stat(35), speed: stat(35), stamina: stat(30), agility: stat(35),
      technique: stat(30), power: stat(35), mind: stat(30), luck: stat(40),
      defense: stat(30), attack: stat(35), recovery: stat(30), durability: stat(30),
      signature: MOVES_POOL[i % MOVES_POOL.length] + " / " + MOVES_POOL[(i+5) % MOVES_POOL.length],
      finisher: FINISHERS[i % FINISHERS.length],
      championships: Math.floor(rnd()*5),
      rumbleWins: Math.floor(rnd()*3),
      totalMatches: 80+Math.floor(rnd()*250),
      winRate: 40+Math.floor(rnd()*45),
      popularity: 40+Math.floor(rnd()*59),
      bio: `Hailing from ${country} and representing ${brand}, ${name} "${nick}" has built a reputation on ${rnd()>0.5?"relentless aggression":"calculated precision"} inside the ring.`,
      photo: profilePic,
      photoDetail: profileDetail,
      profilePic,
      profileDetail,
      screenEntry,
      matchImage,
      color: `hsl(${(i*47)%360} 55% 38%)`
    };
    wrestler.overall = Math.round((wrestler.strength+wrestler.speed+wrestler.stamina+wrestler.agility+wrestler.technique+wrestler.power+wrestler.mind+wrestler.defense+wrestler.attack+wrestler.recovery+wrestler.durability)/11);
    roster.push(wrestler);
  }
  return roster;
}
const ROSTER = buildRoster();
const initials = n => n.split(" ").map(w=>w[0]).join("");
