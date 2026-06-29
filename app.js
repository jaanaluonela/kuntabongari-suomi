const STORAGE_KEY = "matkallaSuomessaVisited_v10";
const NOTES_KEY = "matkallaSuomessaNotes_v10";
const TRIPS_KEY = "matkallaSuomessaTrips_v10";
const MUNICIPALITY_KEY = "matkallaSuomessaMunicipalityDetails_v11";

const view = document.getElementById('view');
const regionSlugs = Object.fromEntries(Object.keys(REGIONS).map(name => [slugify(name), name]));
const allMunicipalities = Object.entries(REGIONS).flatMap(([region, list]) => list.map(item => ({...item, region})));

const REGION_META = {
  "Uusimaa": {x:62,y:85,emoji:"🌆",zone:"etelä"},
  "Varsinais-Suomi": {x:42,y:82,emoji:"⚓",zone:"etelä"},
  "Satakunta": {x:34,y:72,emoji:"🌊",zone:"länsi"},
  "Kanta-Häme": {x:55,y:76,emoji:"🌿",zone:"etelä"},
  "Pirkanmaa": {x:50,y:68,emoji:"🏞️",zone:"sisämaa"},
  "Päijät-Häme": {x:65,y:72,emoji:"💚",zone:"etelä"},
  "Kymenlaakso": {x:78,y:80,emoji:"🌲",zone:"itä"},
  "Etelä-Karjala": {x:82,y:70,emoji:"🌅",zone:"itä"},
  "Etelä-Savo": {x:72,y:62,emoji:"🏝️",zone:"itä"},
  "Pohjois-Savo": {x:70,y:52,emoji:"🌾",zone:"itä"},
  "Pohjois-Karjala": {x:84,y:50,emoji:"🌲",zone:"itä"},
  "Keski-Suomi": {x:56,y:56,emoji:"🌳",zone:"sisämaa"},
  "Etelä-Pohjanmaa": {x:36,y:55,emoji:"🌾",zone:"länsi"},
  "Pohjanmaa": {x:25,y:52,emoji:"🌊",zone:"länsi"},
  "Keski-Pohjanmaa": {x:32,y:44,emoji:"🌤️",zone:"länsi"},
  "Pohjois-Pohjanmaa": {x:48,y:36,emoji:"🧭",zone:"pohjoinen"},
  "Kainuu": {x:70,y:34,emoji:"🫐",zone:"pohjoinen"},
  "Lappi": {x:55,y:14,emoji:"❄️",zone:"pohjoinen"},
  "Ahvenanmaa": {x:18,y:86,emoji:"⛴️",zone:"saaret"}
};


const sampleTrips = [
  { title:'Kesäloma Päijät-Hämeessä', date:'28.6.2026', route:'Vääksy • Pulkkilanharju • Kalkkinen', note:'Ihana viikonloppu kanavalla ja järvimaisemissa.', rating:5, favourite:true, photos:12, cover:'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80' },
  { title:'Helsingin joulutori', date:'15.12.2025', route:'Helsinki • Tuomiokirkko • Kauppatori', note:'Kaunis tunnelma ja glögi maistui.', rating:4, favourite:true, photos:8, cover:'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80' },
  { title:'Kesäretki Kouvolaan', date:'27.6.2026', route:'Verla • Repovesi • Kahvila', note:'Hyvä päiväretki ja paljon luontoa.', rating:5, favourite:false, photos:18, cover:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80' }
];

function slugify(text){ return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function getVisited(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
function setVisited(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(list)])); }
function getTrips(){ return JSON.parse(localStorage.getItem(TRIPS_KEY) || "null") || sampleTrips; }
function setTrips(list){ localStorage.setItem(TRIPS_KEY, JSON.stringify(list)); }
function getMunicipalityDetails(){ return JSON.parse(localStorage.getItem(MUNICIPALITY_KEY) || "{}"); }
function setMunicipalityDetails(data){ localStorage.setItem(MUNICIPALITY_KEY, JSON.stringify(data)); }
function getMunicipalityDetail(code){ return getMunicipalityDetails()[code] || {date:'', note:'', favourite:false}; }
function updateMunicipalityDetail(code, patch){ const data=getMunicipalityDetails(); data[code] = {...(data[code]||{}), ...patch}; setMunicipalityDetails(data); }
function percent(a,b){ return b ? Math.round((a/b)*100) : 0; }
function escapeHtml(str){ return String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function stars(n){ return '★★★★★'.split('').map((s,i)=>`<span class="${i<n?'on':''}">★</span>`).join(''); }
function setActive(name){ document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.remove('active')); const btn=document.querySelector(`.bottomnav button[data-nav="${name}"]`); if(btn) btn.classList.add('active'); }
function go(page){ location.hash = page; }
function showSearch(){ go('search'); }
function defaultPageFromFile(){ const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase(); if(file==='kartta.html') return 'map'; if(file==='paijat-hame.html') return 'region/paijat-hame'; if(file==='paivakirja.html') return 'trips'; if(file==='profiili.html') return 'profile'; return 'home'; }
function route(){ const hash = decodeURIComponent(location.hash.replace(/^#/,'')) || defaultPageFromFile(); if(hash.startsWith('region/')) return renderRegion(regionSlugs[hash.split('/')[1]] || 'Päijät-Häme'); if(hash.startsWith('municipality/')) return renderMunicipality(hash.split('/')[1]); if(hash.startsWith('tripSection/')) return renderTripSection(hash.split('/')[1]); if(hash==='map') return renderMap(); if(hash==='trips') return renderTrips(); if(hash==='tripMenu') return renderTripMenu(); if(hash==='newTrip') return renderNewTrip(); if(hash==='profile') return renderProfile(); if(hash==='search') return renderSearch(); if(hash==='favourites') return renderSimplePage('❤️ Suosikit','Tänne kerätään lempipaikkasi ja parhaat muistot.'); return renderHome(); }

function totalStats(){ const visited=getVisited().length; const total=allMunicipalities.length; return {visited,total,pct:percent(visited,total)}; }
function regionStats(region){ const visited=getVisited(); const total=REGIONS[region].length; const done=REGIONS[region].filter(m=>visited.includes(m.code)).length; return {done,total,pct:percent(done,total)}; }

function regionBadge(region){
  const parts = region.split(/[-\s]/).filter(Boolean);
  if(region === 'Päijät-Häme') return 'PH';
  if(region === 'Kanta-Häme') return 'KH';
  if(region === 'Etelä-Karjala') return 'EK';
  if(region === 'Etelä-Savo') return 'ES';
  if(region === 'Pohjois-Savo') return 'PS';
  if(region === 'Pohjois-Karjala') return 'PK';
  if(region === 'Keski-Suomi') return 'KS';
  if(region === 'Etelä-Pohjanmaa') return 'EP';
  if(region === 'Keski-Pohjanmaa') return 'KP';
  if(region === 'Pohjois-Pohjanmaa') return 'PP';
  if(region === 'Varsinais-Suomi') return 'VS';
  if(region === 'Ahvenanmaa') return 'Å';
  return parts.map(p=>p[0]).join('').slice(0,2).toUpperCase();
}

function renderFinlandSvg(){
  return `
    <svg class="real-finland-svg" viewBox="0 0 300 620" role="img" aria-label="Suomen kartta">
      <defs>
        <linearGradient id="finlandFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dff5ec"/>
          <stop offset="100%" stop-color="#eefaf3"/>
        </linearGradient>
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#0b3d2e" flood-opacity="0.18"/>
        </filter>
      </defs>
      <path class="finland-outline" filter="url(#softShadow)" d="M139 12 C165 19 183 37 185 65 C188 89 177 110 187 131 C197 152 218 163 215 190 C213 211 201 229 207 250 C214 272 236 286 232 314 C229 337 211 350 215 375 C220 404 245 421 239 450 C235 474 214 485 211 512 C208 541 187 572 155 594 C132 609 105 606 92 587 C80 570 83 548 72 532 C61 516 45 508 45 487 C45 468 61 454 57 436 C52 414 29 400 34 374 C38 352 58 342 57 321 C56 299 35 284 42 259 C48 237 70 230 73 208 C76 187 59 174 66 151 C73 128 96 124 101 103 C106 80 92 64 103 42 C111 27 124 16 139 12 Z"/>
      <path class="lake-shape" d="M150 178 C165 194 164 219 148 234 C133 219 130 197 150 178 Z"/>
      <path class="lake-shape" d="M154 278 C174 295 171 326 148 340 C128 324 130 295 154 278 Z"/>
      <path class="lake-shape" d="M122 415 C139 427 139 451 122 462 C107 450 107 429 122 415 Z"/>
      <circle class="aland-dot" cx="35" cy="548" r="18"/>
      <circle class="aland-dot small" cx="61" cy="560" r="8"/>
    </svg>`;
}

function toggleMunicipality(code){ const visited=getVisited(); const next=visited.includes(code)?visited.filter(x=>x!==code):[...visited,code]; setVisited(next); route(); }

function renderHome(){
  setActive('home');
  const t=getTrips()[0] || sampleTrips[0];
  view.innerHTML = `
    <section class="home-hero"><button class="hamburger" onclick="openMenu()">☰</button><button class="hero-bell" onclick="go('favourites')">♡</button><div class="script-title">Matkalla <span>♡</span></div><div class="wide-title">SUOMESSA</div><p>Koe. Tutustu. Muista.</p></section>
    <button class="search-pill" onclick="go('search')">🔍 <span>Hae kuntaa, paikkaa tai nähtävyyttä...</span></button>
    <section class="action-row"><button class="action-card" onclick="go('map')"><span class="action-icon finland-shape">🗺️</span><strong>Avaa kartta</strong><small>Tutustu Suomeen maakunta kerrallaan</small><em>›</em></button><button class="action-card" onclick="go('newTrip')"><span class="action-icon plus-green">＋</span><strong>Lisää matka</strong><small>Tallenna uusi kohde ja muistot</small><em>›</em></button></section>
    <section class="section-head"><h2>Jatka matkaa</h2><button onclick="go('trips')">Näytä kaikki ›</button></section>
    <article class="continue-card" onclick="go('tripMenu')"><img src="${t.cover}" alt="Matkan kuva"><div><small>Viimeisin matka</small><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.route)}</p><div class="progress slim"><span style="width:63%"></span></div><div class="card-line"><span>Käyty kunnista 5 / 8</span><strong>63%</strong></div></div></article>
    <section class="section-head"><h2>Suosikit</h2><button onclick="go('favourites')">Näytä kaikki ›</button></section>
    <div class="favourite-row">${favCard('Häme','5 kohdetta','https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=500&q=70')}${favCard('Päijänne','2 kohdetta','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=70')}${favCard('Lappi','1 kohde','https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=500&q=70')}</div>
    <section class="section-head"><h2>Matkavinkit</h2><button onclick="go('tripMenu')">Oman matkan valikko ›</button></section>
    <div class="tips-grid tips-grid-wide">${tip('🚐','Matkaparkit','Tarkista tiedot lähteestä')}${tip('🏕️','Leirintäalueet','Ei arvattuja hintoja')}${tip('💧','Huoltopisteet','Vesi ja tyhjennys')}${tip('📍','Nähtävyydet','Kohteet matkalle')}</div>
    <article class="trust-strip"><strong>✓ Luotettava matkakirja</strong><span>Ei arvattuja hintoja. Tallenna omat kuvat, paikat ja muistot.</span></article>`;
}
function favCard(title, meta, img){ return `<button class="fav-card" onclick="go('favourites')" style="background-image:url('${img}')"><span>❤</span><strong>${title}</strong><small>${meta}</small></button>`; }
function tip(icon,title,meta){ return `<button class="tip-card" onclick="go('tripSection/${slugify(title)}')"><span>${icon}</span><strong>${title}</strong><small>${meta}</small></button>`; }
function tool(icon,label,slug,extra=''){ return `<button class="tool-card ${extra}" onclick="go('tripSection/${slug}')"><span>${icon}</span><strong>${label}</strong></button>`; }

function renderTrips(){
  setActive('trips');
  const trips=getTrips();
  const totalPhotos=trips.reduce((sum,t)=>sum+(Number(t.photos)||0),0);
  view.innerHTML = `<section class="page-head"><h1>🧳 Omat matkat</h1><p>Kaikki muistot yhdessä paikassa.</p></section>
    <div class="trip-stats"><div><strong>${trips.length}</strong><span>Matkaa</span></div><div><strong>${getVisited().length}</strong><span>Kuntaa</span></div><div><strong>${totalPhotos}</strong><span>Kuvaa</span></div></div>
    <input class="search" placeholder="🔍 Hae matkaa..." oninput="filterTrips(this.value)">
    <div id="tripList" class="trip-list">${trips.map((t,i)=>tripCard(t,i)).join('')}</div>
    <button class="big-add" onclick="go('newTrip')">＋ Lisää uusi matka</button>`;
}
function tripCard(t,i){ return `<article class="memory-card" data-trip-search="${escapeHtml((t.title+' '+t.route+' '+t.note).toLowerCase())}" onclick="go('tripMenu')"><img src="${t.cover}" alt=""><div class="memory-body"><div class="memory-top"><span>${escapeHtml(t.date)}</span><button onclick="event.stopPropagation();toggleTripFavourite(${i})">${t.favourite?'❤️':'♡'}</button></div><h3>${escapeHtml(t.title)}</h3><p>📍 ${escapeHtml(t.route)}</p><div class="stars">${stars(t.rating||0)}</div><small>${escapeHtml(t.note || '')}</small><div class="memory-actions"><button onclick="event.stopPropagation();go('newTrip')">✏️ Muokkaa</button><button onclick="event.stopPropagation();deleteTrip(${i})">🗑️ Poista</button></div></div></article>`; }
function filterTrips(q){ q=String(q||'').toLowerCase(); document.querySelectorAll('[data-trip-search]').forEach(el=>{el.style.display=el.dataset.tripSearch.includes(q)?'grid':'none';}); }
function toggleTripFavourite(i){ const trips=getTrips(); trips[i].favourite=!trips[i].favourite; setTrips(trips); renderTrips(); }
function deleteTrip(i){ if(!confirm('Poistetaanko matka?')) return; const trips=getTrips(); trips.splice(i,1); setTrips(trips); renderTrips(); }

function renderNewTrip(){ setActive(null); view.innerHTML = `<section class="page-head"><h1>＋ Uusi matka</h1><p>Tallenna vain tärkeimmät. Voit täydentää myöhemmin.</p></section><label class="field"><span>Otsikko</span><input id="tripTitle" placeholder="Esim. Kesäloma Päijät-Hämeessä"></label><label class="field"><span>Päivä</span><input id="tripDate" type="date"></label><label class="field"><span>Paikka tai reitti</span><input id="tripRoute" placeholder="Vääksy • Pulkkilanharju • Kalkkinen"></label><label class="field"><span>Mitä jäi mieleen?</span><textarea id="tripNote" rows="5" placeholder="Kirjoita oma muisto..."></textarea></label><label class="field"><span>Oma arvio</span><select id="tripRating"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></label><button class="save-wide" onclick="saveTrip()">💾 Tallenna matka</button>`; }
function saveTrip(){ const title=document.getElementById('tripTitle').value.trim() || 'Uusi matka'; const date=document.getElementById('tripDate').value || new Date().toLocaleDateString('fi-FI'); const route=document.getElementById('tripRoute').value.trim() || 'Oma reitti'; const note=document.getElementById('tripNote').value.trim(); const rating=Number(document.getElementById('tripRating').value)||5; const trips=getTrips(); trips.unshift({title,date,route,note,rating,favourite:false,photos:0,cover:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80'}); setTrips(trips); go('trips'); }

function renderTripMenu(){ setActive('trips'); const t=getTrips()[0] || sampleTrips[0]; view.innerHTML = `<button class="back" onclick="go('trips')">‹ Omat matkat</button><section class="trip-hero"><img src="${t.cover}" alt=""><div><small>Oma matka</small><h1>${escapeHtml(t.title)}</h1><p>${escapeHtml(t.date)}<br>${escapeHtml(t.route)}</p></div></section><section class="soft-card trip-summary"><div><strong>${t.photos||0}</strong><span>Kuvaa</span></div><div><strong>1</strong><span>Muistiinpano</span></div><div><strong>${t.rating||5}</strong><span>Arvio</span></div></section><section class="section-head"><h2>Oman matkan valikko</h2><button onclick="toggleMoreTripItems()">Näytä lisää ⌄</button></section><div class="trip-tools" id="tripTools">${tool('📷','Kuvat','kuvat')}${tool('🍴','Ravintolat','ravintolat')}${tool('☕','Kahvilat','kahvilat')}${tool('🛏️','Majoitus','majoitus')}${tool('🅿️','Matkaparkit','matkaparkit')}${tool('🏕️','Leirintäalueet','leirintaalueet')}${tool('📍','Nähtävyydet','nahtavyydet')}${tool('📝','Muistiinpanot','muistiinpanot')}${tool('💧','Huoltopisteet','huoltopisteet','extra')}${tool('⚡','Sähkö','sahko','extra')}${tool('🚽','Tyhjennys','tyhjennys','extra')}${tool('⭐','Oma arvio','arvio','extra')}</div><button class="big-add" onclick="openAddSheet()">＋ Lisää tähän matkaan</button><article class="note-preview"><strong>Luotettava tieto</strong><p>Ei arvattuja hintoja tai palveluita. Muuttuvat tiedot tarkistetaan aina kohteen omilta sivuilta.</p></article>`; }
function toggleMoreTripItems(){ document.querySelectorAll('.tool-card.extra').forEach(x=>x.classList.toggle('show')); }
function openAddSheet(){ document.body.insertAdjacentHTML('beforeend', `<div class="sheet-backdrop" onclick="this.remove()"><div class="sheet" onclick="event.stopPropagation()"><button class="sheet-close" onclick="document.querySelector('.sheet-backdrop').remove()">×</button><h2>Lisää tähän matkaan</h2><div class="sheet-grid">${tool('📷','Kuva','kuvat')}${tool('📝','Muistiinpano','muistiinpanot')}${tool('📍','Nähtävyys','nahtavyydet')}${tool('🚐','Matkaparkki','matkaparkit')}${tool('🏕️','Leirintäalue','leirintaalueet')}${tool('☕','Kahvila','kahvilat')}</div></div></div>`); }

function renderMap(){
  setActive('map');
  const stats=totalStats();
  const regionItems = Object.keys(REGIONS).map(region => ({region, ...regionStats(region)}));
  const bestRegions = regionItems.sort((a,b)=>b.pct-a.pct).slice(0,3);
  view.innerHTML = `
    <section class="page-head map-title v14-map-head">
      <h1>🇫🇮 Suomen kartta</h1>
      <p>Nyt kartta näyttää Suomelta. Napauta maakuntaa kartalta tai listasta.</p>
    </section>

    <div class="map-progress-card v14-stats">
      <div><strong>${stats.visited}</strong><span>Käytyä kuntaa</span></div>
      <div><strong>${stats.total}</strong><span>Kuntaa yhteensä</span></div>
      <div><strong>${stats.pct}%</strong><span>Suomi valmis</span></div>
    </div>

    <section class="real-map-card" aria-label="Suomen maakuntakartta">
      <div class="real-map-wrap">
        ${renderFinlandSvg()}
        ${Object.keys(REGIONS).map(region=>{
          const s=regionStats(region);
          const meta=REGION_META[region] || {x:50,y:50,emoji:'📍'};
          const cls=s.pct===100?'complete':s.done>0?'started':'';
          return `<button class="region-dot ${cls}" style="left:${meta.x}%;top:${meta.y}%" onclick="go('region/${slugify(region)}')" aria-label="${region}: ${s.done}/${s.total} kuntaa"><span>${regionBadge(region)}</span><small>${s.pct}%</small></button>`;
        }).join('')}
      </div>
      <div class="map-legend"><span><i class="legend-open"></i> Aloittamatta</span><span><i class="legend-started"></i> Aloitettu</span><span><i class="legend-complete"></i> Valmis</span></div>
    </section>

    <section class="section-head"><h2>Jatka maakunnasta</h2><button onclick="go('region/paijat-hame')">Päijät-Häme ›</button></section>
    <div class="region-highlight-row">
      ${bestRegions.map(item=>`<button class="mini-region-card" onclick="go('region/${slugify(item.region)}')"><span>${REGION_META[item.region]?.emoji || '📍'}</span><strong>${item.region}</strong><small>${item.done}/${item.total} • ${item.pct}%</small><div class="progress slim"><i style="width:${item.pct}%"></i></div></button>`).join('')}
    </div>

    <section class="section-head"><h2>Kaikki maakunnat</h2><button onclick="go('search')">Haku ›</button></section>
    <div class="map-grid region-grid v14-region-grid">
      ${Object.keys(REGIONS).map(region=>{
        const s=regionStats(region);
        const meta=REGION_META[region] || {emoji:'📍'};
        const cls=s.pct===100?'complete':s.done>0?'started':'';
        return `<button class="region-card ${cls}" onclick="go('region/${slugify(region)}')"><span class="region-emoji">${meta.emoji}</span><strong>${region}${s.pct===100?' ⭐':''}</strong><small>${s.done}/${s.total} kuntaa • ${s.pct}%</small></button>`
      }).join('')}
    </div>`;
}
function renderRegion(region){
  setActive('map');
  const s=regionStats(region);
  const visited=getVisited();
  const meta=REGION_META[region] || {emoji:'📍'};
  const complete = s.pct === 100;
  view.innerHTML = `
    <button class="back" onclick="go('map')">‹ Maakunnat</button>
    <section class="region-hero v13-region-hero ${complete?'complete':''}">
      <div class="region-badge">${meta.emoji}</div>
      <small>Maakunta</small>
      <h1>${complete?'🏆 ':''}${region}</h1>
      <p>${s.done}/${s.total} kuntaa käyty • ${s.pct}% valmis</p>
      <div class="progress"><span style="width:${s.pct}%"></span></div>
      ${complete?'<strong class="win-note">Maakunta valmis! ⭐</strong>':'<strong class="win-note muted">Jatka rauhassa yksi kunta kerrallaan.</strong>'}
    </section>
    <section class="section-head"><h2>Kunnat</h2><button onclick="markWholeRegion('${escapeHtml(region)}')">Merkitse kaikki</button></section>
    <div class="municipality-list v13-list">
      ${REGIONS[region].map(m=>{
        const detail=getMunicipalityDetail(m.code);
        const isVisited=visited.includes(m.code);
        const sub = isVisited ? (detail.date ? escapeHtml(formatDate(detail.date)) : 'Käyty — lisää päivä') : 'Ei vielä käyty';
        const fav = detail.favourite ? '⭐ ' : '';
        return `<button class="municipality-row ${isVisited?'visited':''}" onclick="go('municipality/${slugify(m.name)}')">
          <span class="mun-status">${isVisited?'✓':'○'}</span>
          <span class="mun-text"><strong>${fav}${m.name}</strong><em>${sub}</em></span>
          <span class="mun-open">${isVisited?'Muokkaa':'Avaa'} ›</span>
        </button>`
      }).join('')}
    </div>`;
}
function formatDate(value){
  if(!value) return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(value)){
    const [y,m,d]=value.split('-');
    return `${d}.${m}.${y}`;
  }
  return value;
}
function renderMunicipality(slug){
  const m=allMunicipalities.find(x=>slugify(x.name)===slug); if(!m) return renderSearch();
  setActive('map');
  const isVisited=getVisited().includes(m.code);
  const d=getMunicipalityDetail(m.code);
  const rating = Number(d.rating || 0);
  view.innerHTML = `
    <button class="back" onclick="go('region/${slugify(m.region)}')">‹ ${m.region}</button>
    <section class="municipality-hero ${isVisited?'visited':''}">
      <div class="municipality-icon">${isVisited?'✅':'📍'}</div>
      <small>${m.region}</small>
      <h1>${d.favourite?'⭐ ':''}${m.name}</h1>
      <p>${isVisited ? 'Käyty' : 'Ei vielä käyty'}${d.date ? ' • '+escapeHtml(formatDate(d.date)) : ''}</p>
    </section>

    <div class="mun-quick-actions">
      <button class="quick ${isVisited?'active':''}" onclick="toggleMunicipality('${m.code}')">${isVisited?'✓ Käyty':'Merkitse käydyksi'}</button>
      <button class="quick" onclick="document.getElementById('munFav').checked=!document.getElementById('munFav').checked; saveMunicipality('${m.code}', true)">${d.favourite?'⭐ Suosikki':'☆ Suosikki'}</button>
    </div>

    <section class="soft-card v13-form">
      <label class="field"><span>📅 Käyntipäivä</span><input id="munDate" type="date" value="${escapeHtml(d.date)}"></label>
      <label class="field"><span>⭐ Oma arvio</span><select id="munRating">
        <option value="0" ${rating===0?'selected':''}>Ei arviota</option>
        <option value="5" ${rating===5?'selected':''}>★★★★★ Erinomainen</option>
        <option value="4" ${rating===4?'selected':''}>★★★★☆ Hyvä</option>
        <option value="3" ${rating===3?'selected':''}>★★★☆☆ Ihan ok</option>
        <option value="2" ${rating===2?'selected':''}>★★☆☆☆ Ei erityinen</option>
        <option value="1" ${rating===1?'selected':''}>★☆☆☆☆ En menisi uudestaan</option>
      </select></label>
      <label class="field"><span>📝 Oma muistiinpano</span><textarea id="munNote" rows="5" placeholder="Mitä jäi mieleen? Esim. hyvä matkaparkki, kahvila tai maisema.">${escapeHtml(d.note||'')}</textarea></label>
      <label class="check-row"><input id="munFav" type="checkbox" ${d.favourite?'checked':''}> <span>⭐ Lisää suosikiksi</span></label>
      <button class="save-wide" onclick="saveMunicipality('${m.code}')">💾 Tallenna kunnan tiedot</button>
    </section>

    <section class="section-head"><h2>Lisää kuntaan</h2><button onclick="alert('Tiedot tallentuvat seuraavissa versioissa tarkemmin.')">Ohje</button></section>
    <div class="mun-tools">
      ${munTool('📸','Kuvat','Lisää omia matkakuvia')}
      ${munTool('🚐','Matkaparkit','Omat havainnot')}
      ${munTool('🏕️','Leirintäalueet','Ei arvattuja hintoja')}
      ${munTool('🍽️','Ravintolat','Hyvät ruokapaikat')}
      ${munTool('☕','Kahvilat','Pysähdyspaikat')}
      ${munTool('📍','Nähtävyydet','Kohteet ja muistot')}
    </div>
    <article class="trust-strip"><strong>Luotettava tieto</strong><span>Tähän tallennetaan omat kokemuksesi. Muuttuvia hintoja tai palveluita ei arvata.</span></article>`;
}
function munTool(icon,title,meta){ return `<button class="mun-tool" onclick="go('tripSection/${slugify(title)}')"><span>${icon}</span><strong>${title}</strong><small>${meta}</small></button>`; }
function saveMunicipality(code, silent=false){
  updateMunicipalityDetail(code, {
    date:document.getElementById('munDate').value,
    note:document.getElementById('munNote').value.trim(),
    favourite:document.getElementById('munFav').checked,
    rating:Number(document.getElementById('munRating')?.value || 0)
  });
  if(!getVisited().includes(code)) setVisited([...getVisited(), code]);
  if(!silent) alert('Tallennettu');
  route();
}
function markWholeRegion(region){
  if(!confirm('Merkitäänkö kaikki tämän maakunnan kunnat käydyiksi?')) return;
  const codes=REGIONS[region].map(m=>m.code);
  setVisited([...getVisited(), ...codes]);
  route();
}
function renderSearch(){ setActive(null); view.innerHTML = `<section class="page-head"><h1>🔍 Haku</h1><p>Hae kuntaa tai maakuntaa.</p></section><input class="search" id="searchInput" placeholder="Kirjoita kunnan nimi..." oninput="doSearch(this.value)"><div id="searchResults" class="mini-list"></div>`; }
function doSearch(q){ const results=allMunicipalities.filter(m=>(m.name+' '+m.region).toLowerCase().includes(String(q).toLowerCase())).slice(0,30); document.getElementById('searchResults').innerHTML=results.map(m=>`<div onclick="go('municipality/${slugify(m.name)}')"><span>${m.name}</span><small>${m.region}</small></div>`).join('') || '<p>Ei tuloksia.</p>'; }
function renderProfile(){ setActive('profile'); const stats=totalStats(); view.innerHTML = `<section class="page-head"><h1>👤 Minä</h1><p>Oma matkakirjani.</p></section><div class="stats-card"><div><strong>${stats.visited}</strong><span>Käyty</span></div><div><strong>${stats.total}</strong><span>Kunnat</span></div><div><strong>${stats.pct}%</strong><span>Valmis</span></div></div><section class="section-head"><h2>Maakunnat</h2></section><div class="mini-list">${Object.keys(REGIONS).map(r=>{const s=regionStats(r);return `<div><span>${r}</span><strong>${s.done}/${s.total}</strong></div>`}).join('')}</div>`; }
function renderTripSection(slug){ const title=slug.replace(/-/g,' '); view.innerHTML = `<button class="back" onclick="go('tripMenu')">‹ Oma matka</button><section class="page-head"><h1>${title.charAt(0).toUpperCase()+title.slice(1)}</h1><p>Tähän lisätään myöhemmin tämän osion tiedot ja omat merkinnät.</p></section><article class="empty-state"><div>＋</div><h2>Lisää ensimmäinen merkintä</h2><p>Pidetään käyttö helppona ja tiedot luotettavina.</p></article>`; }
function renderSimplePage(title,text){ view.innerHTML = `<button class="back" onclick="go('home')">‹ Takaisin</button><section class="page-head"><h1>${title}</h1><p>${text}</p></section>`; }
function openMenu(){ document.body.insertAdjacentHTML('beforeend', `<div class="sheet-backdrop" onclick="this.remove()"><div class="sheet" onclick="event.stopPropagation()"><button class="sheet-close" onclick="document.querySelector('.sheet-backdrop').remove()">×</button><h2>Valikko</h2><div class="menu-list"><button onclick="go('favourites')">❤️ Suosikit</button><button onclick="go('tripMenu')">🧳 Oman matkan valikko</button><button onclick="go('search')">🔍 Haku</button><button onclick="go('profile')">📊 Tilastot ja oma sivu</button><button onclick="alert('Varmuuskopiointi lisätään myöhemmin')">📤 Varmuuskopioi</button><button onclick="alert('Ohje: valitse kartta, lisää matka ja tallenna omat muistot.')">❓ Ohje</button></div></div></div>`); }
window.addEventListener('hashchange', route); route();
