const STORAGE_KEY = "matkallaSuomessaVisited_v16"; // pidetään sama avain, jotta vanhat merkinnät säilyvät
const TRIPS_KEY = "matkallaSuomessaTrips_v16";
const MUNICIPALITY_KEY = "matkallaSuomessaMunicipalityDetails_v16";
const LOGBOOK_KEY = "matkallaSuomessaCaravanLogbook_v16";
const WANTED_KEY = "matkallaSuomessaWanted_v20";

const view = document.getElementById('view');
const regionSlugs = Object.fromEntries(Object.keys(REGIONS).map(name => [slugify(name), name]));
const allMunicipalities = Object.entries(REGIONS).flatMap(([region, list]) => list.map(item => ({...item, region})));

const regionMeta = {
  "Lappi": {abbr:"L", emoji:"❄️", x:55, y:13},
  "Pohjois-Pohjanmaa": {abbr:"PP", emoji:"🌲", x:46, y:38},
  "Kainuu": {abbr:"K", emoji:"🫐", x:66, y:43},
  "Keski-Pohjanmaa": {abbr:"KP", emoji:"🌾", x:32, y:53},
  "Pohjanmaa": {abbr:"P", emoji:"🌊", x:26, y:62},
  "Etelä-Pohjanmaa": {abbr:"EP", emoji:"🌾", x:37, y:66},
  "Keski-Suomi": {abbr:"KS", emoji:"🌿", x:52, y:67},
  "Pohjois-Savo": {abbr:"PS", emoji:"🌲", x:64, y:62},
  "Pohjois-Karjala": {abbr:"PK", emoji:"🦌", x:76, y:62},
  "Etelä-Savo": {abbr:"ES", emoji:"🌊", x:65, y:75},
  "Etelä-Karjala": {abbr:"EK", emoji:"🏰", x:76, y:83},
  "Kymenlaakso": {abbr:"KY", emoji:"⚓", x:66, y:88},
  "Päijät-Häme": {abbr:"PH", emoji:"📍", x:54, y:83},
  "Kanta-Häme": {abbr:"KH", emoji:"🌳", x:46, y:86},
  "Pirkanmaa": {abbr:"PI", emoji:"🏙️", x:43, y:78},
  "Satakunta": {abbr:"S", emoji:"🌅", x:30, y:82},
  "Varsinais-Suomi": {abbr:"VS", emoji:"⚓", x:39, y:92},
  "Uusimaa": {abbr:"U", emoji:"🏙️", x:55, y:93},
  "Ahvenanmaa": {abbr:"Å", emoji:"⛵", x:18, y:91}
};

const sampleTrips = [
  { title:'Kesäloma Päijät-Hämeessä', date:'28.6.2026', route:'Vääksy • Pulkkilanharju • Kalkkinen', note:'Ihana viikonloppu kanavalla ja järvimaisemissa.', rating:5, favourite:true, photos:12, cover:'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80' },
  { title:'Kesäretki Kouvolaan', date:'27.6.2026', route:'Verla • Repovesi • Kahvila', note:'Hyvä päiväretki ja paljon luontoa.', rating:5, favourite:false, photos:18, cover:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80' }
];

function slugify(text){ return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function getVisited(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
function getWanted(){ return JSON.parse(localStorage.getItem(WANTED_KEY) || "[]"); }
function setWanted(list){ localStorage.setItem(WANTED_KEY, JSON.stringify([...new Set(list)])); }
function setVisited(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(list)])); }
function getTrips(){ return JSON.parse(localStorage.getItem(TRIPS_KEY) || "null") || sampleTrips; }
function setTrips(list){ localStorage.setItem(TRIPS_KEY, JSON.stringify(list)); }
function getLogbook(){ return JSON.parse(localStorage.getItem(LOGBOOK_KEY) || "null") || [
  {date:'29.6.2026', place:'Vääksy', overnight:'Matkaparkki / yöpaikka', services:['Vesi','WC'], mood:5, note:'Rauhallinen paikka, hyvä iltakävely kanavalla.', morning:'Hyvä lähtö aamulla.'}
]; }
function setLogbook(list){ localStorage.setItem(LOGBOOK_KEY, JSON.stringify(list)); }
function getMunicipalityDetails(){ return JSON.parse(localStorage.getItem(MUNICIPALITY_KEY) || "{}"); }
function setMunicipalityDetails(data){ localStorage.setItem(MUNICIPALITY_KEY, JSON.stringify(data)); }
function getMunicipalityDetail(code){ return getMunicipalityDetails()[code] || {date:'', note:'', favourite:false, rating:5, photos:0, tags:[]}; }
function updateMunicipalityDetail(code, patch){ const data=getMunicipalityDetails(); data[code] = {...(data[code]||{}), ...patch}; setMunicipalityDetails(data); }
function percent(a,b){ return b ? Math.round((a/b)*100) : 0; }
function escapeHtml(str){ return String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function stars(n){ return '★★★★★'.split('').map((s,i)=>`<span class="${i<n?'on':''}">★</span>`).join(''); }
function setActive(name){ document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.remove('active')); const btn=document.querySelector(`.bottomnav button[data-nav="${name}"]`); if(btn) btn.classList.add('active'); }
function go(page){ location.hash = page; }
function showSearch(){ go('search'); }
function defaultPageFromFile(){ const file=(location.pathname.split('/').pop()||'index.html').toLowerCase(); if(file==='kartta.html')return'map'; if(file==='paijat-hame.html')return'region/paijat-hame'; if(file==='paivakirja.html')return'trips'; if(file==='profiili.html')return'profile'; return'home'; }
function route(){ const hash=decodeURIComponent(location.hash.replace(/^#/,''))||defaultPageFromFile(); if(hash.startsWith('region/'))return renderRegion(regionSlugs[hash.split('/')[1]]||'Päijät-Häme'); if(hash.startsWith('municipality/'))return renderMunicipality(hash.split('/')[1]); if(hash==='map')return renderMap(); if(hash==='trips')return renderTrips(); if(hash==='logbook')return renderLogbook(); if(hash==='newLog')return renderNewLogEntry(); if(hash.startsWith('newLog/'))return renderNewLogEntry(hash.split('/')[1]); if(hash==='newTrip')return renderNewTrip(); if(hash==='profile')return renderProfile(); if(hash==='search')return renderSearch(); if(hash==='favourites')return renderFavourites(); if(hash==='wanted')return renderWanted(); return renderHome(); }
function totalStats(){ const visited=getVisited().length; const total=allMunicipalities.length; return {visited,total,pct:percent(visited,total)}; }
function regionStats(region){ const visited=getVisited(); const total=REGIONS[region].length; const done=REGIONS[region].filter(m=>visited.includes(m.code)).length; return {done,total,pct:percent(done,total)}; }
function regionClass(region){ const s=regionStats(region); if(s.pct===100) return 'complete'; if(s.pct>0) return 'started'; return ''; }
function toggleMunicipality(code){ const visited=getVisited(); const next=visited.includes(code)?visited.filter(x=>x!==code):[...visited,code]; setVisited(next); if(!visited.includes(code)) setWanted(getWanted().filter(x=>x!==code)); route(); }
function toggleWanted(code){ const wanted=getWanted(); if(getVisited().includes(code)) setVisited(getVisited().filter(x=>x!==code)); setWanted(wanted.includes(code)?wanted.filter(x=>x!==code):[...wanted,code]); route(); }


function wantedItems(){ return allMunicipalities.filter(m=>getWanted().includes(m.code)); }
function wantedPreview(){
  const items=wantedItems().slice(0,4);
  if(!items.length) return `<article class="wanted-empty" onclick="go('map')"><strong>💙 Ei vielä kohteita</strong><span>Merkitse kunnan sivulla "Haluan käydä" ja suunnittele seuraava reissu.</span></article>`;
  return `<div class="wanted-row">${items.map(m=>`<button onclick="go('municipality/${slugify(m.name)}')"><strong>${m.name}</strong><small>${m.region}</small></button>`).join('')}</div>`;
}

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
    <div class="memory-row"><div><strong>${trips.length}</strong><span>Matkaa</span></div><div><strong>${favs}</strong><span>Suosikkia</span></div><div><strong>${Object.keys(getMunicipalityDetails()).length}</strong><span>Muistiinpanoa</span></div></div>
    <section class="section-head"><h2>Seuraavat kohteet</h2><button onclick="go('wanted')">Näytä kaikki ›</button></section>
    ${wantedPreview()}
    <section class="section-head"><h2>Karavaanarin kaveri</h2><button onclick="go('logbook')">Avaa ›</button></section>
    <article class="logbook-teaser" onclick="go('logbook')"><span>📒</span><div><strong>Lokikirja</strong><p>Yöpaikat, palvelut, tunnelmat ja aamun muistiinpanot. Ei kilometrejä.</p></div><em>›</em></article>`;
}

function miniFinlandMap(){ return `<svg class="mini-map" viewBox="0 0 300 560" aria-hidden="true"><path d="M154 13 C129 18 110 39 105 68 C101 94 118 116 108 138 C99 157 78 159 71 181 C62 212 84 229 75 258 C67 284 45 302 51 331 C56 354 75 370 70 397 C63 435 88 456 118 474 C143 489 164 513 191 500 C215 488 213 456 201 432 C190 410 201 391 222 375 C250 354 256 320 236 294 C222 275 230 254 246 232 C265 205 250 177 225 164 C204 153 202 132 216 109 C233 79 220 44 196 27 C183 18 170 10 154 13 Z"/><path d="M86 471 C61 472 45 489 42 515 C54 507 71 508 83 521 C95 505 94 487 86 471 Z"/></svg>`; }
function renderFinlandMap(){
  const labels = Object.keys(regionMeta).map(region=>{
    const m=regionMeta[region], st=regionStats(region), cls=regionClass(region);
    return `<button class="map-pin ${cls}" style="left:${m.x}%;top:${m.y}%" onclick="go('region/${slugify(region)}')" title="${region}"><b>${m.abbr}</b><small>${st.pct}%</small></button>`
  }).join('');
  return `<section class="finland-card real-map-card">
    <div class="map-title-row"><div><strong>🇫🇮 Suomen kartta</strong><span>Valitse maakunta kartalta</span></div></div>
    <div class="finland-stage real-finland-stage">
      <svg class="finland-outline real-finland" viewBox="0 0 300 560" role="img" aria-label="Suomen kartta">
        <defs>
          <linearGradient id="landV19" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#d7f5e8"/><stop offset="1" stop-color="#f4fbf6"/></linearGradient>
          <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="12" flood-color="#0f3d35" flood-opacity="0.20"/></filter>
        </defs>
        <path class="land-main" d="M154 13 C129 18 110 39 105 68 C101 94 118 116 108 138 C99 157 78 159 71 181 C62 212 84 229 75 258 C67 284 45 302 51 331 C56 354 75 370 70 397 C63 435 88 456 118 474 C143 489 164 513 191 500 C215 488 213 456 201 432 C190 410 201 391 222 375 C250 354 256 320 236 294 C222 275 230 254 246 232 C265 205 250 177 225 164 C204 153 202 132 216 109 C233 79 220 44 196 27 C183 18 170 10 154 13 Z"/>
        <path class="aland" d="M86 471 C61 472 45 489 42 515 C54 507 71 508 83 521 C95 505 94 487 86 471 Z"/>
        <path class="lake big" d="M153 214 C132 226 126 253 143 272 C160 291 187 278 185 249 C184 227 170 216 153 214 Z"/>
        <path class="lake" d="M165 310 C148 326 149 350 168 359 C187 367 204 349 197 329 C191 313 179 306 165 310 Z"/>
        <path class="lake small" d="M120 337 C105 348 104 366 117 374 C132 383 148 371 143 354 C139 341 131 335 120 337 Z"/>
        <path class="coast" d="M73 400 C49 403 31 430 36 458 C39 477 53 492 70 501"/>
        <path class="coast" d="M58 331 C31 334 18 363 31 389"/>
        <path class="coast east" d="M230 287 C251 308 247 342 222 365"/>
      </svg>
      ${labels}
    </div>
    <div class="legend"><span><i></i>Aloittamatta</span><span><i class="started"></i>Aloitettu</span><span><i class="complete"></i>Valmis</span></div>
  </section>`;
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

function tagOption(label, icon, d){ const checked=(d.tags||[]).includes(label)?'checked':''; return `<label><input class="tagChoice" type="checkbox" value="${label}" ${checked}> <span>${icon} ${label}</span></label>`; }
function renderMunicipality(slug){
  const m=allMunicipalities.find(x=>slugify(x.name)===slug); if(!m)return renderSearch(); setActive('map'); const is=getVisited().includes(m.code); const d=getMunicipalityDetail(m.code);
  const photos=Number(d.photos||0);
  const wanted=getWanted().includes(m.code);
  view.innerHTML=`<button class="back" onclick="go('region/${slugify(m.region)}')">‹ ${m.region}</button>
  <section class="municipality-hero upgraded"><div><small>Kunta</small><h1>${d.favourite?'⭐ ':''}${wanted?'💙 ':''}${m.name}</h1><p>${m.region}</p><div class="stars">${stars(d.rating||5)}</div></div><button class="round-fav" onclick="toggleFav('${m.code}')">${d.favourite?'❤️':'♡'}</button></section>
  <section class="mun-dashboard"><div><strong>${is?'✓':'–'}</strong><span>Käyty</span></div><div><strong>${photos}</strong><span>Kuvaa</span></div><div><strong>${d.overnight?'✓':'–'}</strong><span>Yövytty</span></div></section>
  <div class="status-actions"><button class="save-wide ${is?'done':''}" onclick="toggleMunicipality('${m.code}')">${is?'✓ Käyty — poista merkintä':'✓ Merkitse käydyksi'}</button><button class="want-btn ${wanted?'active':''}" onclick="toggleWanted('${m.code}')">${wanted?'💙 Haluan käydä — poista':'💙 Haluan käydä'}</button></div>
  <section class="detail-grid"><label class="field"><span>📅 Käyntipäivä</span><input id="munDate" type="date" value="${escapeHtml(d.date)}"></label><label class="field"><span>⭐ Oma arvio</span><select id="munRating"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></label></section>
  <label class="check-row"><input id="munOvernight" type="checkbox" ${d.overnight?'checked':''}> <span>🚐 Yövyin täällä</span></label>
  <label class="field"><span>📝 Muistiinpanot</span><textarea id="munNote" rows="5" placeholder="Mitä jäi mieleen? Hyvä matkaparkki, kahvila, maisema...">${escapeHtml(d.note||'')}</textarea></label>
  <section class="tag-box"><strong>🏷️ Tunnisteet</strong><div class="tag-options">${tagOption('Maisema','🌅',d)}${tagOption('Luonto','🌲',d)}${tagOption('Lapsille','🧒',d)}${tagOption('Koiralle','🐶',d)}${tagOption('Kahvila','☕',d)}${tagOption('Uudestaan','🔁',d)}</div></section><button class="save-wide" onclick="saveMunicipality('${m.code}')">💾 Tallenna kunnan tiedot</button>
  <section class="section-head"><h2>Karavaanarin tiedot</h2><button onclick="go('newLog/${slugify(m.name)}')">Lisää lokiin ›</button></section>
  <div class="tips-grid">${munTool('📷','Kuvat',photos+' kuvaa','addPhotoCount',m.code)}${munTool('📒','Lokikirja','Yöpaikan merkintä','log',slugify(m.name))}${munTool('🚐','Matkaparkit',d.parks||'Omat vinkit','field','parks')}${munTool('🏕️','Leirintäalueet',d.camping||'Omat vinkit','field','camping')}${munTool('🍽️','Ravintolat',d.restaurants||'Omat vinkit','field','restaurants')}${munTool('☕','Kahvilat',d.cafes||'Omat vinkit','field','cafes')}${munTool('🏛️','Nähtävyydet',d.sights||'Omat vinkit','field','sights')}</div>
  <section class="quick-notes"><h2>Omat paikkavinkit</h2><label class="field"><span>🚐 Matkaparkit</span><textarea id="parks" rows="2" placeholder="Nimi, osoite tai huomio">${escapeHtml(d.parks||'')}</textarea></label><label class="field"><span>🏕️ Leirintäalueet</span><textarea id="camping" rows="2">${escapeHtml(d.camping||'')}</textarea></label><label class="field"><span>☕ Kahvilat ja ravintolat</span><textarea id="food" rows="2" placeholder="Hyvä kahvila, ruokapaikka...">${escapeHtml((d.cafes||'') || (d.restaurants||''))}</textarea></label><label class="field"><span>🏛️ Nähtävyydet</span><textarea id="sights" rows="2">${escapeHtml(d.sights||'')}</textarea></label><button class="secondary-add" onclick="saveMunicipality('${m.code}')">Tallenna vinkit</button></section>`;
  const sel=document.getElementById('munRating'); if(sel) sel.value=String(d.rating||5);
}
function munTool(icon,title,meta,type,value){
  let action="alert('Täytä tämä alempana omiin paikkavinkkeihin')";
  if(type==='addPhotoCount') action=`addPhotoCount('${value}')`;
  if(type==='log') action=`go('newLog/${value}')`;
  return `<button class="tip-card" onclick="${action}"><span>${icon}</span><strong>${title}</strong><small>${escapeHtml(meta||'Lisää omia tietoja')}</small></button>`;
}
function tip(icon,title){ return `<button class="tip-card"><span>${icon}</span><strong>${title}</strong><small>Lisää omia tietoja</small></button>`; }
function addPhotoCount(code){ const d=getMunicipalityDetail(code); updateMunicipalityDetail(code,{photos:Number(d.photos||0)+1}); route(); }
function toggleFav(code){ const d=getMunicipalityDetail(code); updateMunicipalityDetail(code,{favourite:!d.favourite}); route(); }
function saveMunicipality(code){ const food=document.getElementById('food'); updateMunicipalityDetail(code,{date:document.getElementById('munDate').value,note:document.getElementById('munNote').value.trim(),rating:Number(document.getElementById('munRating').value)||5,overnight:document.getElementById('munOvernight')?.checked||false,parks:document.getElementById('parks')?.value.trim()||'',camping:document.getElementById('camping')?.value.trim()||'',cafes:food?.value.trim()||'',restaurants:food?.value.trim()||'',sights:document.getElementById('sights')?.value.trim()||'',tags:[...document.querySelectorAll('.tagChoice:checked')].map(x=>x.value)}); if(!getVisited().includes(code)) setVisited([...getVisited(),code]); alert('Tallennettu'); route(); }
function markWholeRegion(region){ if(!confirm('Merkitäänkö kaikki tämän maakunnan kunnat käydyiksi?'))return; setVisited([...getVisited(),...REGIONS[region].map(m=>m.code)]); route(); }

function renderTrips(){ setActive('trips'); const trips=getTrips(); view.innerHTML=`<section class="page-head"><h1>🧳 Omat matkat</h1><p>Kaikki muistot yhdessä paikassa.</p></section><div class="trip-list">${trips.map((t,i)=>`<article class="memory-card"><img src="${t.cover}" alt=""><div><small>${escapeHtml(t.date)}</small><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.route)}</p><div class="stars">${stars(t.rating||5)}</div></div></article>`).join('')}</div><button class="big-add" onclick="go('newTrip')">＋ Lisää uusi matka</button><button class="secondary-add" onclick="go('logbook')">📒 Avaa lokikirja</button>`; }
function renderNewTrip(){ setActive(null); view.innerHTML=`<section class="page-head"><h1>＋ Uusi matka</h1><p>Tallenna uusi muisto.</p></section><label class="field"><span>Otsikko</span><input id="tripTitle" placeholder="Esim. Kesäloma Päijät-Hämeessä"></label><label class="field"><span>Päivä</span><input id="tripDate" type="date"></label><label class="field"><span>Reitti</span><input id="tripRoute" placeholder="Vääksy • Pulkkilanharju"></label><label class="field"><span>Muistiinpano</span><textarea id="tripNote" rows="5"></textarea></label><button class="save-wide" onclick="saveTrip()">💾 Tallenna matka</button>`; }
function saveTrip(){ const trips=getTrips(); trips.unshift({title:document.getElementById('tripTitle').value||'Uusi matka',date:document.getElementById('tripDate').value||new Date().toLocaleDateString('fi-FI'),route:document.getElementById('tripRoute').value||'Oma reitti',note:document.getElementById('tripNote').value,rating:5,favourite:false,photos:0,cover:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80'}); setTrips(trips); go('trips'); }

function renderLogbook(){
  setActive('trips');
  const logs=getLogbook();
  const best=logs.filter(x=>Number(x.mood||0)>=5).length;
  view.innerHTML=`<button class="back" onclick="go('home')">‹ Koti</button>
    <section class="page-head"><small>Karavaanarin kaveri</small><h1>📒 Lokikirja</h1><p>Yöpaikat, palvelut, tunnelmat ja pienet huomiot. Ei kilometrejä.</p></section>
    <div class="stats-card"><div><strong>${logs.length}</strong><span>Merkintää</span></div><div><strong>${best}</strong><span>Huippupaikkaa</span></div><div><strong>${logs.filter(x=>(x.services||[]).includes('Vesi')).length}</strong><span>Vesi löytyi</span></div></div>
    <button class="big-add" onclick="go('newLog')">＋ Lisää lokimerkintä</button>
    <div class="log-list">${logs.map(logCard).join('')}</div>`;
}
function logCard(l,i){
  const services=(l.services||[]).map(s=>`<span>${escapeHtml(s)}</span>`).join('');
  return `<article class="log-card"><div class="log-top"><strong>${escapeHtml(l.place||'Yöpaikka')}</strong><small>${escapeHtml(l.date||'')}</small></div><p>${escapeHtml(l.overnight||'')}</p><div class="service-tags">${services}</div><div class="stars">${stars(Number(l.mood)||0)}</div><p class="log-note">${escapeHtml(l.note||'')}</p>${l.morning?`<small class="morning">☕ Aamulla: ${escapeHtml(l.morning)}</small>`:''}<button onclick="deleteLogEntry(${i})">Poista</button></article>`;
}
function renderNewLogEntry(municipalitySlug=''){
  setActive('trips');
  const mm=allMunicipalities.find(x=>slugify(x.name)===municipalitySlug);
  const backTarget=mm?`municipality/${municipalitySlug}`:'logbook';
  const place=mm?mm.name:'';
  view.innerHTML=`<button class="back" onclick="go('${backTarget}')">‹ Takaisin</button>
    <section class="page-head"><h1>＋ Uusi lokimerkintä</h1><p>Nopea karavaanarimerkintä. Ei kilometrejä.</p></section>
    <label class="field"><span>📅 Päivä</span><input id="logDate" type="date"></label>
    <label class="field"><span>📍 Paikka / yöpaikka</span><input id="logPlace" placeholder="Esim. Vääksy, matkaparkki, leirintäalue" value="${escapeHtml(place)}"></label>
    <label class="field"><span>🏕️ Yöpymisen tyyppi</span><select id="logOvernight"><option>Matkaparkki / yöpaikka</option><option>Leirintäalue</option><option>Puskaparkki</option><option>Sukulaiset / piha</option><option>Päiväkäynti</option></select></label>
    <section class="check-card"><strong>Palvelut</strong><label><input type="checkbox" value="Vesi" class="logService"> Vesi</label><label><input type="checkbox" value="WC" class="logService"> WC</label><label><input type="checkbox" value="Sähkö" class="logService"> Sähkö</label><label><input type="checkbox" value="Suihku" class="logService"> Suihku</label><label><input type="checkbox" value="Tyhjennys" class="logService"> Tyhjennys</label><label><input type="checkbox" value="Koiraystävällinen" class="logService"> Koiraystävällinen</label></section>
    <label class="field"><span>⭐ Tunnelma</span><select id="logMood"><option value="5">★★★★★ Upea</option><option value="4">★★★★☆ Hyvä</option><option value="3">★★★☆☆ Ihan ok</option><option value="2">★★☆☆☆ Ei paras</option><option value="1">★☆☆☆☆ En menisi uudelleen</option></select></label>
    <label class="field"><span>📝 Muistiinpano</span><textarea id="logNote" rows="5" placeholder="Mikä oli hyvää? Oliko rauhallista? Sopiko koirille? Lähellä kauppaa?"></textarea></label>
    <label class="field"><span>☕ Aamulla</span><input id="logMorning" placeholder="Esim. hiljainen yö, helppo lähtö, hyvä kahvipaikka"></label>
    <button class="save-wide" onclick="saveLogEntry()">💾 Tallenna lokiin</button>`;
}
function saveLogEntry(){
  const services=[...document.querySelectorAll('.logService:checked')].map(x=>x.value);
  const logs=getLogbook();
  logs.unshift({date:document.getElementById('logDate').value||new Date().toLocaleDateString('fi-FI'), place:document.getElementById('logPlace').value||'Oma yöpaikka', overnight:document.getElementById('logOvernight').value, services, mood:Number(document.getElementById('logMood').value)||5, note:document.getElementById('logNote').value, morning:document.getElementById('logMorning').value});
  setLogbook(logs); go('logbook');
}
function deleteLogEntry(i){ if(!confirm('Poistetaanko lokimerkintä?')) return; const logs=getLogbook(); logs.splice(i,1); setLogbook(logs); renderLogbook(); }


function renderWanted(){
  setActive(null);
  const items=wantedItems();
  view.innerHTML=`<button class="back" onclick="go('home')">‹ Koti</button>
    <section class="page-head"><h1>💙 Haluan käydä</h1><p>Oma lista seuraavia matkakohteita varten.</p></section>
    <div class="wanted-list">${items.map(m=>`<article class="wanted-card" onclick="go('municipality/${slugify(m.name)}')"><div><strong>${m.name}</strong><small>${m.region}</small></div><span>›</span></article>`).join('') || '<article class="wanted-empty"><strong>Ei kohteita vielä</strong><span>Avaa kunnan sivu ja paina “Haluan käydä”.</span></article>'}</div>
    <button class="big-add" onclick="go('map')">🗺️ Etsi kohteita kartalta</button>`;
}

function renderProfile(){ setActive('profile'); const s=totalStats(); view.innerHTML=`<section class="page-head"><h1>👤 Minä</h1><p>Oma Suomen matkakirjani.</p></section><div class="stats-card"><div><strong>${s.visited}</strong><span>Käyty</span></div><div><strong>${s.total}</strong><span>Kunnat</span></div><div><strong>${getWanted().length}</strong><span>Haluan käydä</span></div></div><div class="region-list">${Object.keys(REGIONS).map(regionCard).join('')}</div>`; }
function renderSearch(){ setActive(null); view.innerHTML=`<section class="page-head"><h1>🔍 Haku</h1><p>Hae kuntaa tai maakuntaa.</p></section><input class="search" placeholder="Kirjoita kunnan nimi..." oninput="doSearch(this.value)"><div id="searchResults" class="mini-list"></div>`; }
function doSearch(q){ const r=allMunicipalities.filter(m=>(m.name+' '+m.region).toLowerCase().includes(String(q).toLowerCase())).slice(0,40); document.getElementById('searchResults').innerHTML=r.map(m=>`<div onclick="go('municipality/${slugify(m.name)}')"><span>${m.name}</span><small>${m.region}</small></div>`).join('')||'<p>Ei tuloksia.</p>'; }
function renderFavourites(){ const items=allMunicipalities.filter(m=>getMunicipalityDetail(m.code).favourite); view.innerHTML=`<button class="back" onclick="go('home')">‹ Koti</button><section class="page-head"><h1>❤️ Suosikit</h1><p>Lempipaikkasi yhdessä näkymässä.</p></section><div class="mini-list">${items.map(m=>`<div onclick="go('municipality/${slugify(m.name)}')"><span>${m.name}</span><small>${m.region}</small></div>`).join('')||'<p>Ei suosikkeja vielä.</p>'}</div>`; }
function openMenu(){ document.body.insertAdjacentHTML('beforeend',`<div class="sheet-backdrop" onclick="this.remove()"><div class="sheet" onclick="event.stopPropagation()"><button class="sheet-close" onclick="document.querySelector('.sheet-backdrop').remove()">×</button><h2>Valikko</h2><button onclick="go('favourites')">❤️ Suosikit</button><button onclick="go('wanted')">💙 Haluan käydä</button><button onclick="go('logbook')">📒 Lokikirja</button><button onclick="go('search')">🔍 Haku</button><button onclick="go('profile')">📊 Tilastot</button><button onclick="showBackup()">☁️ Varmuuskopio</button></div></div>`); }

function showBackup(){
  const data={visited:getVisited(),details:getMunicipalityDetails(),trips:getTrips(),logbook:getLogbook()};
  document.body.insertAdjacentHTML('beforeend',`<div class="sheet-backdrop" onclick="this.remove()"><div class="sheet backup-sheet" onclick="event.stopPropagation()"><button class="sheet-close" onclick="document.querySelector('.sheet-backdrop').remove()">×</button><h2>☁️ Varmuuskopio</h2><p>Kopioi tämä talteen. Myöhemmin tehdään pilvitallennus.</p><textarea readonly rows="8">${escapeHtml(JSON.stringify(data))}</textarea></div></div>`);
}
window.addEventListener('hashchange', route); route();
