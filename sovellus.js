const view = document.getElementById('view');
const STORAGE_KEY = 'matkalla_suomessa_v33';

function loadState(){
  const base = {visited:{}, wanted:{}, favorites:{}, notes:[], trips:MS_SAMPLE_TRIPS};
  try { return {...base, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {})}; }
  catch { return base; }
}
function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function state(){ return loadState(); }
function regionVisitedCount(r){
  const s = state();
  const fromState = s.visited[r.id];
  return typeof fromState === 'number' ? fromState : r.visited;
}
function percent(a,b){ return b ? Math.round((a/b)*100) : 0; }
function totalVisited(){ return MS_REGIONS.reduce((sum,r)=>sum+regionVisitedCount(r),0); }
function setActive(page){
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active', b.dataset.nav===page));
}
function go(page){ location.hash = page; route(); }
function showSearch(){ go('search'); }
function route(){
  const page = (location.hash || '#home').replace('#','');
  if(page.startsWith('region-')) return renderRegion(page.replace('region-',''));
  if(page==='map') return renderMap();
  if(page==='trips') return renderTrips();
  if(page==='profile') return renderProfile();
  if(page==='newTrip') return renderNewTrip();
  if(page==='search') return renderSearch();
  renderHome();
}
function openRegion(id){ location.hash = 'region-' + id; route(); }

function renderHome(){
  setActive('home');
  const visited = totalVisited();
  const total = MS_REGIONS.reduce((s,r)=>s+r.total,0);
  const st = state();
  const lastRegion = MS_REGIONS.find(r=>r.id==='paijat-hame') || MS_REGIONS[0];
  view.innerHTML = `
    <section class="hero premium-hero">
      <button class="round left">☰</button><button class="round right" onclick="go('profile')">♡</button>
      <div class="hero-text"><div class="script-title">Matkalla</div><div class="hero-main">SUOMESSA</div><p>Koe. Tutustu. Muista.</p></div>
    </section>
    <button class="searchbar" onclick="showSearch()">🔍 <span>Hae kuntaa, paikkaa tai nähtävyyttä...</span></button>
    <section class="stats-card three"><div><strong>${visited}</strong><span>Käytyä</span></div><div><strong>${total}</strong><span>Kuntaa</span></div><div><strong>19</strong><span>Maakuntaa</span></div></section>
    <section class="section-head"><h2>Lisää tietoja matkaasi</h2><button onclick="go('newTrip')">Näytä lisää ›</button></section>
    <div class="action-grid scroll-x">
      ${actionCard('📷','Kuvat','Lisää kuva')}${actionCard('📍','Sijainti','Tallenna paikka')}${actionCard('📝','Muistiinpano','Kirjoita muisto')}${actionCard('❤️','Suosikiksi','Tallenna kohde')}${actionCard('⭐','Arvio','Anna oma arvio')}${actionCard('🍽️','Ravintola','Ruokapaikka')}${actionCard('☕','Kahvila','Kahvihetki')}${actionCard('🏕️','Leirintäalue','Yöpyminen')}
    </div>
    <section class="section-head"><h2>Lähellä sinua</h2><button onclick="showSearch()">Haku ›</button></section>
    <div class="near-list">${MS_PLACES.map(p=>`<button class="near-card"><b>${p.icon} ${p.name}</b><span>${p.type} · ${p.distance}</span></button>`).join('')}</div>
    <section class="section-head"><h2>Jatka matkaa</h2><button onclick="openRegion('${lastRegion.id}')">Näytä kaikki ›</button></section>
    <button class="continue-card" onclick="openRegion('${lastRegion.id}')"><div class="continue-img">🌅</div><div><span>Viimeisin maakunta</span><h3>${lastRegion.name}</h3><p>${lastRegion.route}</p><div class="bar"><i style="width:${percent(regionVisitedCount(lastRegion), lastRegion.total)}%"></i></div><small>${regionVisitedCount(lastRegion)}/${lastRegion.total} kuntaa · ${percent(regionVisitedCount(lastRegion), lastRegion.total)}%</small></div></button>
    <section class="section-head"><h2>Viimeisimmät matkat</h2><button onclick="go('trips')">Katso kaikki ›</button></section>
    <div class="trip-row">${st.trips.map(t=>tripCard(t)).join('')}</div>
  `;
}
function actionCard(icon,title,sub=''){ return `<button class="action-card"><span>${icon}</span><b>${title}</b><small>${sub}</small></button>`; }
function tripCard(t){ return `<article class="trip-card"><div class="photo">${t.icon||'📍'}<button>♡</button></div><div><small>${t.date}</small><b>${t.title}</b><span>${t.place}</span></div></article>`; }

function renderMap(){
  setActive('map');
  const visited = totalVisited();
  const total = MS_REGIONS.reduce((s,r)=>s+r.total,0);
  view.innerHTML = `
    <section class="map-head"><h1>Suomen kartta</h1><p>Valitse maakunta ja jatka omaa matkakirjaasi.</p></section>
    <section class="map-stats"><b>${visited}/${total} kuntaa</b><b>${percent(visited,total)}% Suomi valmis</b></section>
    <section class="finland-card realer">
      <svg class="finland-svg" viewBox="0 0 360 620" role="img" aria-label="Suomen kartta">
        <defs><linearGradient id="land" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#e8f6ee"/><stop offset="1" stop-color="#ccead7"/></linearGradient></defs>
        <path class="land" d="M188 8 L237 38 L250 89 L235 132 L253 183 L248 225 L272 279 L263 332 L285 390 L264 455 L235 515 L188 604 L140 575 L121 510 L88 466 L83 393 L101 336 L81 268 L105 203 L91 140 L113 73 Z"/>
        <path class="lake" d="M166 192 C196 209 200 252 173 279 C144 255 137 214 166 192Z"/>
        <path class="lake small" d="M204 349 C221 362 219 389 199 399 C184 382 186 358 204 349Z"/>
        <path class="aland" d="M63 539 c22 -14 47 2 43 27 c-4 23 -35 31 -53 14 c-13 -13 -7 -32 10 -41z"/>
      </svg>
      ${MS_REGIONS.map(r=>regionPin(r)).join('')}
    </section>
    <div class="legend"><span><i></i>Aloittamatta</span><span><i class="started"></i>Aloitettu</span><span><i class="done"></i>Valmis</span></div>
    <section class="section-head"><h2>Maakunnat</h2><button onclick="showSearch()">Haku ›</button></section>
    <div class="region-grid">${MS_REGIONS.map(r=>regionCard(r)).join('')}</div>
  `;
}
function regionPin(r){
  const v = regionVisitedCount(r), p = percent(v,r.total), done = p===100, started = p>0;
  return `<button class="region-pin ${started?'started':''} ${done?'done':''}" style="left:${r.x}%;top:${r.y}%" onclick="openRegion('${r.id}')"><b>${r.code}</b><span>${p}%</span></button>`;
}
function regionCard(r){
  const v = regionVisitedCount(r), p = percent(v,r.total);
  return `<button class="region-card" onclick="openRegion('${r.id}')"><b>${r.icon} ${r.name}</b><span>${v}/${r.total} · ${p}%</span><div class="bar"><i style="width:${p}%"></i></div></button>`;
}

function renderRegion(id){
  setActive('map');
  const r = MS_REGIONS.find(x=>x.id===id) || MS_REGIONS[0];
  const v = regionVisitedCount(r), p=percent(v,r.total);
  view.innerHTML = `
    <section class="region-hero"><button class="back" onclick="go('map')">‹</button><button class="round right">♡</button><div><span>${r.icon}</span><h1>${r.name}</h1><p>${r.route}</p></div></section>
    <section class="stats-card three"><div><strong>${v}</strong><span>Käyty</span></div><div><strong>${r.total}</strong><span>Kuntaa</span></div><div><strong>${p}%</strong><span>Valmis</span></div></section>
    <section class="feature-note">🌿 ${r.name} on osa omaa matkakirjaasi. Lisää kuvia, muistoja, ravintoloita ja nähtävyyksiä.</section>
    <div class="action-grid compact">${actionCard('📷','Kuvat')}${actionCard('📍','Nähtävyys')}${actionCard('🍽️','Ravintola')}${actionCard('☕','Kahvila')}${actionCard('🏕️','Leirintä')}${actionCard('📝','Muistiinpano')}${actionCard('⭐','Arvio')}${actionCard('❤️','Suosikki')}</div>
    <section class="section-head"><h2>Suositellut kohteet</h2><button>Näytä kaikki ›</button></section>
    <div class="place-row"><article>🌉<b>Vääksyn kanava</b><span>4,8</span></article><article>🌅<b>Pulkkilanharju</b><span>4,9</span></article><article>🏙️<b>Lahti</b><span>4,6</span></article></div>
  `;
}
function renderTrips(){
  setActive('trips');
  const trips = state().trips;
  view.innerHTML = `<section class="page-title"><h1>Päiväkirja</h1><p>Omat matkat, muistot ja merkinnät.</p></section><div class="trip-list">${trips.map(t=>tripCard(t)).join('')}</div>`;
}
function renderProfile(){
  setActive('profile');
  const visited=totalVisited(), total=MS_REGIONS.reduce((s,r)=>s+r.total,0);
  view.innerHTML = `<section class="page-title"><h1>Minä</h1><p>Oma Suomen matkakirja.</p></section><section class="profile-card"><div class="avatar">J</div><h2>Jaana</h2><p>${visited}/${total} kuntaa · ${percent(visited,total)}%</p></section><div class="action-grid compact">${actionCard('❤️','Suosikit')}${actionCard('💙','Haluan käydä')}${actionCard('📷','Kuvat')}${actionCard('☁️','Varmuuskopio')}</div>`;
}
function renderNewTrip(){
  setActive('');
  view.innerHTML = `<section class="page-title"><h1>Uusi matka</h1><p>Tallenna uusi kohde ja muisto nopeasti.</p></section><form class="trip-form"><label>Matkan nimi<input placeholder="Esim. Päiväretki Pulkkilanharjulle"></label><label>Paikka<input placeholder="Kunta, nähtävyys tai alue"></label><label>Muistiinpano<textarea placeholder="Mitä haluat muistaa tästä paikasta?"></textarea></label><button type="button" onclick="alert('Tallennus liitetään seuraavassa vaiheessa.')">Tallenna</button></form>`;
}
function renderSearch(){
  setActive('');
  view.innerHTML = `<section class="page-title"><h1>Haku</h1><p>Etsi kuntaa, maakuntaa tai paikkaa.</p></section><input class="big-input" id="q" placeholder="Kirjoita haku..." oninput="searchNow(this.value)"><div id="results" class="search-results"></div>`;
}
function searchNow(q){
  const results = document.getElementById('results');
  const term = q.toLowerCase();
  const rows = [...MS_REGIONS.map(r=>({name:r.name, sub:'Maakunta', id:r.id, icon:r.icon})), ...MS_PLACES.map(p=>({name:p.name, sub:p.type, icon:p.icon}))].filter(x=>x.name.toLowerCase().includes(term) || x.sub.toLowerCase().includes(term));
  results.innerHTML = rows.map(x=>`<button ${x.id?`onclick="openRegion('${x.id}')"`:''}>${x.icon} <b>${x.name}</b><span>${x.sub}</span></button>`).join('') || '<p>Ei tuloksia vielä.</p>';
}
window.addEventListener('hashchange', route); route();
