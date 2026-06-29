const STORAGE_KEY = "matkallaSuomessaVisited_v15";
const TRIPS_KEY = "matkallaSuomessaTrips_v15";
const MUNICIPALITY_KEY = "matkallaSuomessaMunicipalityDetails_v15";

const view = document.getElementById('view');
const regionSlugs = Object.fromEntries(Object.keys(REGIONS).map(name => [slugify(name), name]));
const allMunicipalities = Object.entries(REGIONS).flatMap(([region, list]) => list.map(item => ({...item, region})));

const regionMeta = {
  "Lappi": {abbr:"L", emoji:"❄️", x:54, y:13},
  "Pohjois-Pohjanmaa": {abbr:"PP", emoji:"🌲", x:49, y:31},
  "Kainuu": {abbr:"K", emoji:"🫐", x:64, y:36},
  "Keski-Pohjanmaa": {abbr:"KP", emoji:"🌾", x:35, y:44},
  "Pohjanmaa": {abbr:"P", emoji:"🌊", x:29, y:52},
  "Etelä-Pohjanmaa": {abbr:"EP", emoji:"🌾", x:39, y:57},
  "Keski-Suomi": {abbr:"KS", emoji:"🌿", x:51, y:58},
  "Pohjois-Savo": {abbr:"PS", emoji:"🌲", x:61, y:55},
  "Pohjois-Karjala": {abbr:"PK", emoji:"🦌", x:72, y:55},
  "Etelä-Savo": {abbr:"ES", emoji:"🌊", x:62, y:67},
  "Etelä-Karjala": {abbr:"EK", emoji:"🏰", x:72, y:78},
  "Kymenlaakso": {abbr:"K", emoji:"⚓", x:65, y:85},
  "Päijät-Häme": {abbr:"PH", emoji:"📍", x:52, y:78},
  "Kanta-Häme": {abbr:"KH", emoji:"🌳", x:45, y:82},
  "Pirkanmaa": {abbr:"PI", emoji:"🏙️", x:42, y:72},
  "Satakunta": {abbr:"S", emoji:"🌅", x:31, y:76},
  "Varsinais-Suomi": {abbr:"VS", emoji:"⚓", x:35, y:90},
  "Uusimaa": {abbr:"U", emoji:"🏙️", x:53, y:91},
  "Ahvenanmaa": {abbr:"Å", emoji:"⛵", x:18, y:95}
};

const sampleTrips = [
  { title:'Kesäloma Päijät-Hämeessä', date:'28.6.2026', route:'Vääksy • Pulkkilanharju • Kalkkinen', note:'Ihana viikonloppu kanavalla ja järvimaisemissa.', rating:5, favourite:true, photos:12, cover:'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80' },
  { title:'Kesäretki Kouvolaan', date:'27.6.2026', route:'Verla • Repovesi • Kahvila', note:'Hyvä päiväretki ja paljon luontoa.', rating:5, favourite:false, photos:18, cover:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80' }
];

function slugify(text){ return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function getVisited(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
function setVisited(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(list)])); }
function getTrips(){ return JSON.parse(localStorage.getItem(TRIPS_KEY) || "null") || sampleTrips; }
function setTrips(list){ localStorage.setItem(TRIPS_KEY, JSON.stringify(list)); }
function getMunicipalityDetails(){ return JSON.parse(localStorage.getItem(MUNICIPALITY_KEY) || "{}"); }
function setMunicipalityDetails(data){ localStorage.setItem(MUNICIPALITY_KEY, JSON.stringify(data)); }
function getMunicipalityDetail(code){ return getMunicipalityDetails()[code] || {date:'', note:'', favourite:false, rating:5, photos:0}; }
function updateMunicipalityDetail(code, patch){ const data=getMunicipalityDetails(); data[code] = {...(data[code]||{}), ...patch}; setMunicipalityDetails(data); }
function percent(a,b){ return b ? Math.round((a/b)*100) : 0; }
function escapeHtml(str){ return String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function stars(n){ return '★★★★★'.split('').map((s,i)=>`<span class="${i<n?'on':''}">★</span>`).join(''); }
function setActive(name){ document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.remove('active')); const btn=document.querySelector(`.bottomnav button[data-nav="${name}"]`); if(btn) btn.classList.add('active'); }
function go(page){ location.hash = page; }
function showSearch(){ go('search'); }
function defaultPageFromFile(){ const file=(location.pathname.split('/').pop()||'index.html').toLowerCase(); if(file==='kartta.html')return'map'; if(file==='paijat-hame.html')return'region/paijat-hame'; if(file==='paivakirja.html')return'trips'; if(file==='profiili.html')return'profile'; return'home'; }
function route(){ const hash=decodeURIComponent(location.hash.replace(/^#/,''))||defaultPageFromFile(); if(hash.startsWith('region/'))return renderRegion(regionSlugs[hash.split('/')[1]]||'Päijät-Häme'); if(hash.startsWith('municipality/'))return renderMunicipality(hash.split('/')[1]); if(hash==='map')return renderMap(); if(hash==='trips')return renderTrips(); if(hash==='newTrip')return renderNewTrip(); if(hash==='profile')return renderProfile(); if(hash==='search')return renderSearch(); if(hash==='favourites')return renderFavourites(); return renderHome(); }
function totalStats(){ const visited=getVisited().length; const total=allMunicipalities.length; return {visited,total,pct:percent(visited,total)}; }
function regionStats(region){ const visited=getVisited(); const total=REGIONS[region].length; const done=REGIONS[region].filter(m=>visited.includes(m.code)).length; return {done,total,pct:percent(done,total)}; }
function regionClass(region){ const s=regionStats(region); if(s.pct===100) return 'complete'; if(s.pct>0) return 'started'; return ''; }
function toggleMunicipality(code){ const visited=getVisited(); setVisited(visited.includes(code)?visited.filter(x=>x!==code):[...visited,code]); route(); }

function renderHome(){
  setActive('home'); const s=totalStats(); const trips=getTrips(); const favs=Object.values(getMunicipalityDetails()).filter(x=>x.favourite).length;
  view.innerHTML = `
    <section class="premium-hero"><div class="hero-bg"></div><button class="hamburger" onclick="openMenu()">☰</button><button class="hero-bell" onclick="go('favourites')">♡</button><div class="script-title">Matkalla <span>♡</span></div><div class="wide-title">SUOMESSA</div><p>Oma matkakirja, kuntabongari ja muistojen koti.</p></section>
    <button class="search-pill" onclick="go('search')">🔍 <span>Hae kuntaa, paikkaa tai nähtävyyttä...</span></button>
    <section class="dashboard"><div><strong>${s.visited}</strong><span>Käytyä kuntaa</span></div><div><strong>${s.total}</strong><span>Kuntaa yhteensä</span></div><div><strong>${s.pct}%</strong><span>Suomi valmis</span></div></section>
    <section class="section-head"><h2>Jatka matkaa</h2><button onclick="go('map')">Avaa kartta ›</button></section>
    <article class="map-preview" onclick="go('map')"><div>${miniFinlandMap()}</div><div><small>Suomen kartta</small><h3>${s.pct}% valmiina</h3><p>${s.visited}/${s.total} kuntaa merkitty</p><div class="progress"><span style="width:${s.pct}%"></span></div></div></article>
    <section class="action-row"><button class="action-card" onclick="go('map')"><span>🗺️</span><strong>Kartta</strong><small>Valitse maakunta</small><em>›</em></button><button class="action-card" onclick="go('newTrip')"><span>＋</span><strong>Lisää matka</strong><small>Tallenna uusi muisto</small><em>›</em></button></section>
    <section class="section-head"><h2>Omat muistot</h2><button onclick="go('trips')">Näytä kaikki ›</button></section>
    <div class="memory-row"><div><strong>${trips.length}</strong><span>Matkaa</span></div><div><strong>${favs}</strong><span>Suosikkia</span></div><div><strong>${Object.keys(getMunicipalityDetails()).length}</strong><span>Muistiinpanoa</span></div></div>`;
}

function miniFinlandMap(){ return `<svg class="mini-map" viewBox="0 0 220 420" aria-hidden="true"><path d="M120 8 C88 20 76 56 82 88 C89 122 60 126 51 158 C41 194 66 206 50 243 C36 275 62 292 48 323 C38 348 55 378 86 397 C121 419 160 404 168 366 C175 332 154 312 170 281 C188 247 160 226 175 190 C191 151 154 139 161 104 C168 65 151 18 120 8 Z" /></svg>`; }
function renderFinlandMap(){
  const labels = Object.keys(regionMeta).map(region=>{const m=regionMeta[region], st=regionStats(region), cls=regionClass(region); return `<button class="map-pin ${cls}" style="left:${m.x}%;top:${m.y}%" onclick="go('region/${slugify(region)}')" title="${region}"><b>${m.abbr}</b><small>${st.pct}%</small></button>`}).join('');
  return `<section class="finland-card"><div class="finland-stage"><svg class="finland-outline" viewBox="0 0 260 500" role="img" aria-label="Suomen kartta"><defs><linearGradient id="land" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#dff5ea"/><stop offset="1" stop-color="#edf8f1"/></linearGradient></defs><path class="land" d="M143 10 C111 18 91 47 97 88 C103 129 69 134 58 172 C48 207 78 219 59 259 C42 294 72 309 55 348 C40 383 62 422 96 446 C135 474 181 455 189 409 C196 370 173 351 191 315 C212 273 177 253 195 211 C218 158 172 152 180 108 C187 66 176 20 143 10 Z"/><path class="lake" d="M126 177 C111 194 105 214 119 232 C134 251 158 238 157 215 C157 195 143 182 126 177 Z"/><path class="lake" d="M141 251 C126 267 127 289 144 300 C162 310 178 295 172 276 C168 260 155 251 141 251 Z"/><path class="shore" d="M74 438 C55 428 41 409 36 387"/><path class="shore" d="M51 347 C31 347 22 369 34 386"/></svg>${labels}</div><div class="legend"><span><i></i>Aloittamatta</span><span><i class="started"></i>Aloitettu</span><span><i class="complete"></i>Valmis</span></div></section>`;
}

function renderMap(){
  setActive('map'); const s=totalStats(); const started=Object.keys(REGIONS).filter(r=>regionStats(r).pct>0).length; const done=Object.keys(REGIONS).filter(r=>regionStats(r).pct===100).length;
  const top=Object.keys(REGIONS).sort((a,b)=>regionStats(b).pct-regionStats(a).pct).slice(0,4);
  view.innerHTML = `<section class="page-head"><small>Premium-kartta</small><h1>🇫🇮 Oma Suomeni</h1><p>${s.visited}/${s.total} kuntaa • ${s.pct}% Suomi valmis</p><div class="progress"><span style="width:${s.pct}%"></span></div></section>
    <div class="stats-card"><div><strong>${started}</strong><span>Aloitettua maakuntaa</span></div><div><strong>${done}</strong><span>Valmista</span></div><div><strong>${s.pct}%</strong><span>Koko Suomi</span></div></div>
    ${renderFinlandMap()}
    <section class="section-head"><h2>Jatka maakunnasta</h2><button onclick="go('region/paijat-hame')">Päijät-Häme ›</button></section>
    <div class="region-list">${top.map(regionCard).join('')}</div>
    <section class="section-head"><h2>Kaikki maakunnat</h2><button onclick="go('search')">Haku ›</button></section>
    <div class="region-grid">${Object.keys(REGIONS).map(regionTile).join('')}</div>`;
}
function regionCard(region){ const m=regionMeta[region]||{emoji:'📍'}; const s=regionStats(region); return `<button class="region-wide ${regionClass(region)}" onclick="go('region/${slugify(region)}')"><span>${m.emoji}</span><div><strong>${region}</strong><small>${s.done}/${s.total} • ${s.pct}%</small><div class="progress slim"><i style="width:${s.pct}%"></i></div></div><em>›</em></button>`; }
function regionTile(region){ const m=regionMeta[region]||{emoji:'📍'}; const s=regionStats(region); return `<button class="region-tile ${regionClass(region)}" onclick="go('region/${slugify(region)}')"><span>${m.emoji}</span><strong>${region}</strong><small>${s.done}/${s.total} • ${s.pct}%</small></button>`; }

function renderRegion(region){
  setActive('map'); const s=regionStats(region); const meta=regionMeta[region]||{emoji:'📍'}; const visited=getVisited();
  view.innerHTML = `<button class="back" onclick="go('map')">‹ Suomen kartta</button><section class="region-hero premium"><div><small>Maakunta</small><h1>${meta.emoji} ${region}</h1><p>${s.done}/${s.total} kuntaa käyty • ${s.pct}% valmis</p><div class="progress"><span style="width:${s.pct}%"></span></div></div>${s.pct===100?'<b class="badge">🏆 Valmis</b>':'<b class="badge muted">Matka kesken</b>'}</section>
  <section class="section-head"><h2>Kunnat</h2><button onclick="markWholeRegion('${escapeHtml(region)}')">Merkitse kaikki</button></section>
  <div class="municipalities">${REGIONS[region].map(m=>{const d=getMunicipalityDetail(m.code); const is=visited.includes(m.code); return `<button class="municipality ${is?'visited':''}" onclick="go('municipality/${slugify(m.name)}')"><span class="mun-icon">${is?'✅':'📍'}</span><span><strong>${m.name}</strong><em>${is?(d.date?escapeHtml(d.date):'Käyty, lisää päivä'):'Ei vielä käyty'}</em></span><small>${is?'Muokkaa':'Avaa'} →</small></button>`}).join('')}</div>`;
}

function renderMunicipality(slug){
  const m=allMunicipalities.find(x=>slugify(x.name)===slug); if(!m) return renderSearch(); setActive('map');
  const is=getVisited().includes(m.code); const d=getMunicipalityDetail(m.code);
  view.innerHTML = `<button class="back" onclick="go('region/${slugify(m.region)}')">‹ ${m.region}</button><section class="municipality-hero"><div><small>${m.region}</small><h1>${d.favourite?'⭐ ':''}${m.name}</h1><p>${is?'Käyty kohde':'Ei vielä merkitty käydyksi'}</p></div><button class="round-fav" onclick="toggleFav('${m.code}')">${d.favourite?'❤️':'♡'}</button></section>
  <button class="save-wide ${is?'done':''}" onclick="toggleMunicipality('${m.code}')">${is?'✓ Käyty — poista merkintä':'✓ Merkitse käydyksi'}</button>
  <section class="detail-grid"><label class="field"><span>📅 Käyntipäivä</span><input id="munDate" type="date" value="${escapeHtml(d.date)}"></label><label class="field"><span>⭐ Oma arvio</span><select id="munRating"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></label></section>
  <label class="field"><span>📝 Muistiinpanot</span><textarea id="munNote" rows="5" placeholder="Mitä jäi mieleen? Hyvä matkaparkki, kahvila, maisema...">${escapeHtml(d.note||'')}</textarea></label>
  <button class="save-wide" onclick="saveMunicipality('${m.code}')">💾 Tallenna kunnan tiedot</button>
  <section class="section-head"><h2>Lisää tähän kuntaan</h2></section><div class="tips-grid">${tip('📷','Kuvat')}${tip('🚐','Matkaparkit')}${tip('🏕️','Leirintäalueet')}${tip('🍽️','Ravintolat')}${tip('☕','Kahvilat')}${tip('🏛️','Nähtävyydet')}</div>`;
  const sel=document.getElementById('munRating'); if(sel) sel.value=String(d.rating||5);
}
function tip(icon,title){ return `<button class="tip-card" onclick="alert('Tämä osio lisätään seuraavassa vaiheessa')"><span>${icon}</span><strong>${title}</strong><small>Lisää omia tietoja</small></button>`; }
function toggleFav(code){ const d=getMunicipalityDetail(code); updateMunicipalityDetail(code,{favourite:!d.favourite}); route(); }
function saveMunicipality(code){ updateMunicipalityDetail(code,{date:document.getElementById('munDate').value,note:document.getElementById('munNote').value.trim(),rating:Number(document.getElementById('munRating').value)||5}); if(!getVisited().includes(code)) setVisited([...getVisited(),code]); alert('Tallennettu'); route(); }
function markWholeRegion(region){ if(!confirm('Merkitäänkö kaikki tämän maakunnan kunnat käydyiksi?'))return; setVisited([...getVisited(),...REGIONS[region].map(m=>m.code)]); route(); }

function renderTrips(){ setActive('trips'); const trips=getTrips(); view.innerHTML=`<section class="page-head"><h1>🧳 Omat matkat</h1><p>Kaikki muistot yhdessä paikassa.</p></section><div class="trip-list">${trips.map((t,i)=>`<article class="memory-card"><img src="${t.cover}" alt=""><div><small>${escapeHtml(t.date)}</small><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.route)}</p><div class="stars">${stars(t.rating||5)}</div></div></article>`).join('')}</div><button class="big-add" onclick="go('newTrip')">＋ Lisää uusi matka</button>`; }
function renderNewTrip(){ setActive(null); view.innerHTML=`<section class="page-head"><h1>＋ Uusi matka</h1><p>Tallenna uusi muisto.</p></section><label class="field"><span>Otsikko</span><input id="tripTitle" placeholder="Esim. Kesäloma Päijät-Hämeessä"></label><label class="field"><span>Päivä</span><input id="tripDate" type="date"></label><label class="field"><span>Reitti</span><input id="tripRoute" placeholder="Vääksy • Pulkkilanharju"></label><label class="field"><span>Muistiinpano</span><textarea id="tripNote" rows="5"></textarea></label><button class="save-wide" onclick="saveTrip()">💾 Tallenna matka</button>`; }
function saveTrip(){ const trips=getTrips(); trips.unshift({title:document.getElementById('tripTitle').value||'Uusi matka',date:document.getElementById('tripDate').value||new Date().toLocaleDateString('fi-FI'),route:document.getElementById('tripRoute').value||'Oma reitti',note:document.getElementById('tripNote').value,rating:5,favourite:false,photos:0,cover:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80'}); setTrips(trips); go('trips'); }
function renderProfile(){ setActive('profile'); const s=totalStats(); view.innerHTML=`<section class="page-head"><h1>👤 Minä</h1><p>Oma Suomen matkakirjani.</p></section><div class="stats-card"><div><strong>${s.visited}</strong><span>Käyty</span></div><div><strong>${s.total}</strong><span>Kunnat</span></div><div><strong>${s.pct}%</strong><span>Valmis</span></div></div><div class="region-list">${Object.keys(REGIONS).map(regionCard).join('')}</div>`; }
function renderSearch(){ setActive(null); view.innerHTML=`<section class="page-head"><h1>🔍 Haku</h1><p>Hae kuntaa tai maakuntaa.</p></section><input class="search" placeholder="Kirjoita kunnan nimi..." oninput="doSearch(this.value)"><div id="searchResults" class="mini-list"></div>`; }
function doSearch(q){ const r=allMunicipalities.filter(m=>(m.name+' '+m.region).toLowerCase().includes(String(q).toLowerCase())).slice(0,40); document.getElementById('searchResults').innerHTML=r.map(m=>`<div onclick="go('municipality/${slugify(m.name)}')"><span>${m.name}</span><small>${m.region}</small></div>`).join('')||'<p>Ei tuloksia.</p>'; }
function renderFavourites(){ const items=allMunicipalities.filter(m=>getMunicipalityDetail(m.code).favourite); view.innerHTML=`<button class="back" onclick="go('home')">‹ Koti</button><section class="page-head"><h1>❤️ Suosikit</h1><p>Lempipaikkasi yhdessä näkymässä.</p></section><div class="mini-list">${items.map(m=>`<div onclick="go('municipality/${slugify(m.name)}')"><span>${m.name}</span><small>${m.region}</small></div>`).join('')||'<p>Ei suosikkeja vielä.</p>'}</div>`; }
function openMenu(){ document.body.insertAdjacentHTML('beforeend',`<div class="sheet-backdrop" onclick="this.remove()"><div class="sheet" onclick="event.stopPropagation()"><button class="sheet-close" onclick="document.querySelector('.sheet-backdrop').remove()">×</button><h2>Valikko</h2><button onclick="go('favourites')">❤️ Suosikit</button><button onclick="go('search')">🔍 Haku</button><button onclick="go('profile')">📊 Tilastot</button></div></div>`); }
window.addEventListener('hashchange', route); route();
