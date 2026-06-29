/* Matkalla Suomessa v31 – Premium-harppaus
   Suuri etusivu, oma matkakirja, haluan käydä, suosikit, päiväkirja ja parempi karttanäkymä. */
const DATA = typeof REGIONS !== 'undefined' ? REGIONS : {};
const STORE_KEY = 'matkalla-suomessa-v31';
const OLD_KEYS = ['matkalla-suomessa-v30','matkalla-suomessa-v21','matkalla-suomessa-v20'];
const view = document.getElementById('view');
let route = location.hash.replace('#','') || 'home';
let state = loadState();

const REGION_META = {
  'Uusimaa':{abbr:'U',icon:'🏙️',emoji:'🌆',desc:'Kaupunkeja, merta, kulttuuria ja retkiä.',color:'#0f766e',pos:[55,88]},
  'Varsinais-Suomi':{abbr:'VS',icon:'⚓',emoji:'⛵',desc:'Saaristoa, historiaa ja merellisiä hetkiä.',color:'#0e7490',pos:[39,88]},
  'Satakunta':{abbr:'S',icon:'🌊',emoji:'🌊',desc:'Rannikkoa, jokia ja kauniita kaupunkeja.',color:'#0284c7',pos:[31,72]},
  'Kanta-Häme':{abbr:'KH',icon:'🌿',emoji:'🌿',desc:'Linnoja, järviä ja rauhallista Hämettä.',color:'#15803d',pos:[46,78]},
  'Pirkanmaa':{abbr:'P',icon:'🌲',emoji:'🌲',desc:'Kaupunkia, kulttuuria ja luontoa.',color:'#166534',pos:[45,67]},
  'Päijät-Häme':{abbr:'PH',icon:'💙',emoji:'📍',desc:'Järviä, harjuja ja Päijänteen maisemia.',color:'#0f766e',pos:[55,76]},
  'Kymenlaakso':{abbr:'K',icon:'🌉',emoji:'🌉',desc:'Jokia, satamia ja itäistä tunnelmaa.',color:'#2563eb',pos:[69,84]},
  'Etelä-Karjala':{abbr:'EK',icon:'🌅',emoji:'🌅',desc:'Saimaa, linnoitukset ja kesävalo.',color:'#0891b2',pos:[76,77]},
  'Etelä-Savo':{abbr:'ES',icon:'💧',emoji:'💧',desc:'Järvi-Suomen sydän ja mökkimaisemat.',color:'#0284c7',pos:[64,67]},
  'Pohjois-Savo':{abbr:'PS',icon:'🌲',emoji:'🌲',desc:'Mäkimaisemia, järviä ja savolaista lämpöä.',color:'#15803d',pos:[63,55]},
  'Pohjois-Karjala':{abbr:'PK',icon:'🥾',emoji:'🥾',desc:'Koli, vaarat ja retkeilijän unelmat.',color:'#166534',pos:[76,55]},
  'Keski-Suomi':{abbr:'KS',icon:'🛶',emoji:'🛶',desc:'Järviä, siltoja ja reittejä keskellä Suomea.',color:'#0d9488',pos:[51,58]},
  'Etelä-Pohjanmaa':{abbr:'EP',icon:'🌾',emoji:'🌾',desc:'Lakeuksia, tapahtumia ja omaleimaisuutta.',color:'#ca8a04',pos:[39,55]},
  'Pohjanmaa':{abbr:'P',icon:'🌾',emoji:'🌾',desc:'Rannikkoa, saaristoa ja kulttuuria.',color:'#b45309',pos:[29,51]},
  'Keski-Pohjanmaa':{abbr:'KP',icon:'🌻',emoji:'🌻',desc:'Rannikkoa, maaseutua ja pieniä helmiä.',color:'#d97706',pos:[34,42]},
  'Pohjois-Pohjanmaa':{abbr:'PP',icon:'🧭',emoji:'🧭',desc:'Laajoja maisemia, kaupunkia ja merta.',color:'#0369a1',pos:[49,29]},
  'Kainuu':{abbr:'K',icon:'🌲',emoji:'🌲',desc:'Erämaata, vaaroja ja hiljaisia kohteita.',color:'#14532d',pos:[61,37]},
  'Lappi':{abbr:'L',icon:'❄️',emoji:'❄️',desc:'Tunturit, revontulet ja suuret seikkailut.',color:'#6d28d9',pos:[50,9]},
  'Ahvenanmaa':{abbr:'A',icon:'⛵',emoji:'⛵',desc:'Saaristo, meri ja leppoisa lomatunnelma.',color:'#0891b2',pos:[18,91]}
};
const PLACE_SEEDS = {
  'Päijät-Häme':['Lahden satama','Pulkkilanharju','Sibeliustalo','Vesijärvi','Kalkkisten koski','Vääksyn kanava'],
  'Uusimaa':['Helsingin tuomiokirkko','Suomenlinna','Porvoon vanha kaupunki','Hanko','Nuuksio'],
  'Varsinais-Suomi':['Turun linna','Naantali','Saariston rengastie','Ruissalo'],
  'Lappi':['Ylläs','Levi','Inari','Saariselkä','Rovaniemi'],
  'Pohjois-Karjala':['Koli','Pielinen','Ilosaari','Patvinsuo']
};
const TAGS = ['🌅 Maisema','🌲 Luonto','👨‍👩‍👧 Lapsille','🐶 Koiralle','☕ Kahvila','📷 Kuvauspaikka','🥾 Retki','💎 Helmi','🔁 Uudestaan'];
const ADD_CATS = ['📷 Kuvat','🍴 Ravintola','☕ Kahvila','🛏️ Yöpyminen','🏕️ Leirintäalue','📍 Nähtävyys','👥 Matkaseurue','🚗 Kulkutapa','📝 Muistiinpanot','⭐ Arvio','❤️ Suosikiksi','💙 Haluan käydä'];

function loadState(){
  for(const k of [STORE_KEY,...OLD_KEYS]){
    try{ const s=JSON.parse(localStorage.getItem(k)||'null'); if(s) return normalize(s); }catch(e){}
  }
  return normalize({});
}
function normalize(s){
  s.municipalities ||= {}; s.trips ||= []; s.memories ||= []; s.lastRegion ||= 'Päijät-Häme'; s.user ||= 'Jaana'; return s;
}
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function regions(){ return Object.keys(DATA); }
function items(r){ return (DATA[r]||[]).map(x => typeof x === 'string' ? {name:x} : x); }
function meta(r){ return REGION_META[r] || {abbr:r.slice(0,2).toUpperCase(),icon:'📍',emoji:'📍',desc:'Tutustu, tallenna ja muista.',color:'#0f766e',pos:[50,50]}; }
function muni(name){ return state.municipalities[name] ||= {visited:false,want:false,favorite:false,tags:[],notes:'',rating:0,date:'',photos:0,visits:0,overnight:false}; }
function total(){ return regions().reduce((a,r)=>a+items(r).length,0); }
function visited(){ return Object.values(state.municipalities).filter(x=>x.visited).length; }
function stats(r){ const list=items(r), v=list.filter(x=>muni(x.name).visited).length, w=list.filter(x=>muni(x.name).want&&!muni(x.name).visited).length; return {total:list.length||1, visited:v, want:w, pct:Math.round(v/(list.length||1)*100)}; }
function findRegion(name){ return regions().find(r => items(r).some(x=>x.name===name)) || state.lastRegion; }
function esc(s){ return String(s||'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m])); }
function go(r){ route=r; location.hash=r; render(); }
function goRegion(r){ state.lastRegion=r; save(); go('region:'+encodeURIComponent(r)); }
function goMuni(n,r){ state.lastRegion=r; save(); go('muni:'+encodeURIComponent(n)+':'+encodeURIComponent(r)); }
function showSearch(){ go('search'); }
window.addEventListener('hashchange',()=>{route=location.hash.replace('#','')||'home'; render();});

function render(){
  active();
  const [k,a,b]=route.split(':');
  if(k==='map') return renderMap();
  if(k==='region') return renderRegion(decodeURIComponent(a||state.lastRegion));
  if(k==='muni') return renderMuni(decodeURIComponent(a||''), decodeURIComponent(b||findRegion(decodeURIComponent(a||''))));
  if(k==='newTrip') return renderNewTrip();
  if(k==='trips') return renderTrips();
  if(k==='profile') return renderProfile();
  if(k==='search') return renderSearch();
  if(k==='wants') return renderList('💙 Haluan käydä', m=>m.want&&!m.visited);
  if(k==='favorites') return renderList('❤️ Suosikit', m=>m.favorite);
  renderHome();
}
function active(){
  document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.remove('active'));
  const key = route.startsWith('map')||route.startsWith('region')||route.startsWith('muni') ? 'map' : route.startsWith('trip')?'trips' : route.startsWith('profile')?'profile' : route.startsWith('newTrip')?'newTrip':'home';
  const b=document.querySelector(`[data-nav="${key}"]`); if(b) b.classList.add('active');
}
function section(title, action, fn){return `<div class="section-title"><h2>${title}</h2>${action?`<button onclick="${fn}">${action}</button>`:''}</div>`;}

function renderHome(){
  const t=total(), v=visited(), p=t?Math.round(v/t*100):0, last=state.lastRegion, ls=stats(last);
  const wants = Object.entries(state.municipalities).filter(([_,m])=>m.want&&!m.visited).slice(0,6);
  const favs = Object.entries(state.municipalities).filter(([_,m])=>m.favorite).slice(0,8);
  const trips = state.trips.slice(0,5);
  view.innerHTML = `
  <section class="hero hero-home">
    <div class="floating-top"><button class="round">☰</button><div><button class="round" onclick="showSearch()">🔍</button><button class="round">♡</button></div></div>
    <div class="hero-text"><div class="script">Matkalla</div><div class="script small">Suomessa ♡</div><p>Kaikki Suomen matkasi yhdessä paikassa</p></div>
  </section>
  <section class="content rise">
    <button class="big-search" onclick="showSearch()">🔍 <span>Hae kuntaa, paikkaa tai nähtävyyttä...</span></button>
    <div class="main-actions">
      <button class="action primary" onclick="go('newTrip')"><span>＋</span><b>Uusi matka</b><small>Tallenna uusi matka hetkessä</small></button>
      <button class="action" onclick="go('map')"><span>🗺️</span><b>Avaa kartta</b><small>Tutki paikkoja ja merkitse käydyksi</small></button>
    </div>
    <div class="conquest premium"><div><h2>Suomen valloitus</h2><p>${v} / ${t} kuntaa käyty</p><div class="bar"><i style="width:${p}%"></i></div></div><div class="ring" style="--p:${p}"><b>${p}%</b></div></div>
    <div class="quick-head"><h2>Lisää tietoja matkaasi</h2><button>Näytä lisää⌄</button></div>
    <div class="feature-grid">${ADD_CATS.map(x=>`<button class="feature"><span>${x.split(' ')[0]}</span><b>${x.replace(/^\S+ /,'')}</b></button>`).join('')}</div>
    ${section('Jatka matkaa','Näytä kaikki ›',"go('map')")}
    <button class="journey" onclick="goRegion('${last}')"><div class="journey-img"></div><div><small>Viimeisin maakunta</small><h3>${last}</h3><p>${ls.visited}/${ls.total} kuntaa käyty</p><div class="bar"><i style="width:${ls.pct}%"></i></div><b>${ls.pct}%</b></div></button>
    ${wants.length?section('Seuraavat kohteet','Näytä kaikki ›',"go('wants')")+`<div class="h-scroll">${wants.map(([n])=>miniMuni(n,'💙')).join('')}</div>`:''}
    ${section('Suosikit','Näytä kaikki ›',"go('favorites')")}
    <div class="h-scroll">${favs.length?favs.map(([n])=>miniMuni(n,'❤️')).join(''):['Päijät-Häme','Varsinais-Suomi','Lappi','Uusimaa'].map(regionPhoto).join('')}</div>
    ${section('Viimeisimmät matkat','Katso kaikki ›',"go('trips')")}
    <div class="trip-row">${trips.length?trips.map(tripCard).join(''):demoTrips()}</div>
  </section>`;
}
function miniMuni(n,icon){ const r=findRegion(n); return `<button class="photo-card" onclick="goMuni('${esc(n)}','${esc(r)}')"><i>${icon}</i><b>${esc(n)}</b><small>${esc(r)}</small></button>`; }
function regionPhoto(r){ const s=stats(r); return `<button class="photo-card" onclick="goRegion('${esc(r)}')"><i>♡</i><b>${meta(r).emoji} ${esc(r)}</b><small>${s.visited}/${s.total} kuntaa</small></button>`; }
function tripCard(t){ return `<button class="trip-card"><div></div><b>${esc(t.title)}</b><small>${esc(t.date||'')}</small><p>${esc(t.notes||'')}</p></button>`; }
function demoTrips(){ return ['Päijät-Häme','Kesäretki Kouvolaan','Himos – viikonloppu'].map((x,i)=>`<button class="trip-card"><div></div><b>${x}</b><small>${i?'27.6.2026':'15.12.2025'}</small><p>${i?'Muistoja ja kohteita':'Jatka matkakirjaa'}</p></button>`).join(''); }

function renderMap(){
  const t=total(), v=visited(), p=t?Math.round(v/t*100):0;
  view.innerHTML = `<section class="page map-page"><div class="page-head"><div><h1>Suomen kartta</h1><p>Valitse maakunta ja jatka omaa matkakirjaasi.</p></div><button class="round green" onclick="showSearch()">🔍</button></div>
  <div class="map-card premium-map"><div class="map-top"><b>${v}/${t} kuntaa</b><b>${p}% Suomi valmis</b></div><div class="finland-map">${finlandSvg()}${regions().map(pin).join('')}</div><div class="legend"><span><i></i>Aloittamatta</span><span><i class="start"></i>Aloitettu</span><span><i class="done"></i>Valmis</span></div></div>
  ${section('Jatka maakunnasta', state.lastRegion+' ›', `goRegion('${state.lastRegion}')`)}<div class="region-list">${regions().map(regionRow).join('')}</div></section>`;
}
function pin(r){ const s=stats(r), m=meta(r), cls=s.pct===100?'done':s.pct>0?'start':''; return `<button class="pin ${cls}" style="left:${m.pos[0]}%;top:${m.pos[1]}%" onclick="goRegion('${esc(r)}')"><b>${m.abbr}</b><small>${s.pct}%</small></button>`; }
function finlandSvg(){ return `<svg viewBox="0 0 250 560" aria-label="Suomen kartta"><path class="land" d="M129 12 C160 22 171 52 168 87 C166 119 184 149 172 184 C164 208 180 231 174 264 C168 296 186 322 174 354 C166 376 171 407 154 435 C137 464 139 501 111 526 C89 546 51 538 42 508 C35 483 47 459 37 432 C26 403 35 381 28 354 C20 324 30 303 24 275 C18 248 37 231 35 206 C33 177 57 164 58 139 C59 108 82 101 79 72 C76 42 98 18 129 12 Z"/><path class="lake" d="M122 206 C148 226 145 271 119 289 C95 268 98 229 122 206 Z"/><path class="lake" d="M138 328 C153 344 149 376 128 389 C109 371 114 340 138 328 Z"/><circle class="aland" cx="46" cy="514" r="15"/><circle class="aland" cx="21" cy="493" r="8"/></svg>`; }
function regionRow(r){ const s=stats(r), m=meta(r); return `<button class="region-row" onclick="goRegion('${esc(r)}')"><span>${m.emoji}</span><div><b>${esc(r)}</b><small>${s.visited}/${s.total} · ${s.pct}%</small><div class="bar"><i style="width:${s.pct}%"></i></div></div><em>›</em></button>`; }

function renderRegion(r){
  const s=stats(r), m=meta(r); state.lastRegion=r; save();
  const places = PLACE_SEEDS[r] || [`${r}n keskusta`, 'Luontokohde', 'Paikallinen kahvila', 'Näköalapaikka'];
  view.innerHTML = `<section class="hero region-hero" style="--accent:${m.color}"><button class="back" onclick="go('map')">‹</button><button class="round hero-heart">♡</button><div class="region-title"><div class="crest">${m.emoji}</div><h1>${esc(r)}</h1><p>${esc(m.desc)}</p></div></section>
  <section class="content region-content"><div class="progress-card"><div><b>${s.visited}</b><small>Käytyä</small></div><div><b>${s.total}</b><small>Kuntaa</small></div><div><b>${s.pct}%</b><small>Valmis</small></div><div class="wide bar"><i style="width:${s.pct}%"></i></div></div>
  <div class="action-grid">${['📷 Kuvat','🍴 Ravintolat','☕ Kahvilat','🛏️ Majoitus','🏕️ Leirintäalueet','📍 Nähtävyydet','🎭 Tekemistä','🗺️ Kartta'].map(x=>`<button><span>${x.split(' ')[0]}</span><b>${x.replace(/^\S+ /,'')}</b></button>`).join('')}</div>
  ${section('Suosituimmat kohteet '+r+'ssa','Näytä kaikki ›','')}
  <div class="h-scroll">${places.map(p=>`<button class="place-card"><div><i>♡</i></div><b>${esc(p)}</b><small>★ 4,7</small></button>`).join('')}</div>
  ${section('Sinun muistosi','Lisää muisto +',`go('newTrip')`)}<div class="memory-strip"><button>🌅 Auringonlasku</button><button>☕ Kahvi matkalla</button><button>📷 Paras kuva</button><button>＋ Lisää</button></div>
  ${section('Kunnat','Merkitse kaikki',`markAllRegion('${esc(r)}')`)}<div class="muni-list">${items(r).map(x=>muniRow(x.name,r)).join('')}</div></section>`;
}
function muniRow(n,r){ const m=muni(n); return `<button class="muni-row ${m.visited?'visited':''}" onclick="goMuni('${esc(n)}','${esc(r)}')"><div><b>${m.visited?'✅ ':''}${esc(n)}</b><small>${m.date|| (m.want?'Haluan käydä':'Ei päivää')}</small></div><em>Avaa ›</em></button>`; }
function markAllRegion(r){ items(r).forEach(x=>{ const m=muni(x.name); m.visited=true; m.want=false; m.visits=Math.max(1,m.visits||0); if(!m.date)m.date=new Date().toISOString().slice(0,10); }); save(); renderRegion(r); }
window.markAllRegion=markAllRegion;

function renderMuni(n,r){
  const m=muni(n), mm=meta(r);
  view.innerHTML = `<section class="hero muni-hero" style="--accent:${mm.color}"><button class="back" onclick="goRegion('${esc(r)}')">‹</button><button class="round hero-heart ${m.favorite?'on':''}" onclick="toggleFav('${esc(n)}')">${m.favorite?'❤️':'♡'}</button><div><h1>${esc(n)}</h1><p>${esc(r)} · oma matkakansiosi</p></div></section>
  <section class="content region-content"><div class="status-card"><button class="status ${m.visited?'on':''}" onclick="toggleVisited('${esc(n)}')">${m.visited?'✅ Käyty':'Merkitse käydyksi'}</button><button class="status blue ${m.want?'on':''}" onclick="toggleWant('${esc(n)}')">💙 Haluan käydä</button><button class="status pink ${m.favorite?'on':''}" onclick="toggleFav('${esc(n)}')">❤️ Suosikki</button></div>
  <label class="field">Käyntipäivä<input type="date" value="${esc(m.date)}" onchange="setDate('${esc(n)}',this.value)"></label>
  <div class="rating"><b>Oma arvio</b><div>${[1,2,3,4,5].map(i=>`<button onclick="setRating('${esc(n)}',${i})">${i<=m.rating?'⭐':'☆'}</button>`).join('')}</div></div>
  <label class="field">Muistiinpanot<textarea oninput="setNotes('${esc(n)}',this.value)" placeholder="Mitä näit, missä kävit, mikä jäi mieleen?">${esc(m.notes)}</textarea></label>
  <h2>Omat tunnisteet</h2><div class="tag-cloud">${TAGS.map(t=>`<button class="tag ${m.tags.includes(t)?'on':''}" onclick="toggleTag('${esc(n)}','${esc(t)}')">${t}</button>`).join('')}</div>
  <h2>Lisää tietoja</h2><div class="feature-grid small">${ADD_CATS.slice(0,8).map(x=>`<button class="feature"><span>${x.split(' ')[0]}</span><b>${x.replace(/^\S+ /,'')}</b></button>`).join('')}</div>
  <button class="big-save" onclick="save();toast('Tallennettu')">Tallenna muisto</button></section>`;
}
function toggleVisited(n){ const m=muni(n); m.visited=!m.visited; if(m.visited){m.want=false; m.visits=Math.max(1,m.visits||0); if(!m.date)m.date=new Date().toISOString().slice(0,10);} save(); render(); }
function toggleWant(n){ const m=muni(n); m.want=!m.want; if(m.want)m.visited=false; save(); render(); }
function toggleFav(n){ muni(n).favorite=!muni(n).favorite; save(); render(); }
function setDate(n,v){ muni(n).date=v; if(v)muni(n).visited=true; save(); }
function setRating(n,v){ muni(n).rating=v; save(); render(); }
function setNotes(n,v){ muni(n).notes=v; save(); }
function toggleTag(n,t){ const m=muni(n); m.tags=m.tags||[]; m.tags.includes(t)?m.tags=m.tags.filter(x=>x!==t):m.tags.push(t); save(); render(); }
Object.assign(window,{toggleVisited,toggleWant,toggleFav,setDate,setRating,setNotes,toggleTag});

function renderNewTrip(){ view.innerHTML = `<section class="page"><h1>＋ Uusi matka</h1><p class="lead">Tallenna kohde, päivä ja muistot.</p><label class="field">Otsikko<input id="tripTitle" placeholder="Esim. Kesäretki Päijät-Hämeessä"></label><label class="field">Päivä<input id="tripDate" type="date"></label><label class="field">Muistiinpano<textarea id="tripNotes" placeholder="Mitä teit, missä kävit?"></textarea></label><button class="big-save" onclick="saveTrip()">Tallenna matka</button></section>`; }
function saveTrip(){ const title=document.getElementById('tripTitle').value||'Uusi matka'; state.trips.unshift({title,date:document.getElementById('tripDate').value,notes:document.getElementById('tripNotes').value}); save(); go('trips'); }
window.saveTrip=saveTrip;
function renderTrips(){ view.innerHTML = `<section class="page"><h1>📖 Päiväkirja</h1><p class="lead">Matkasi ja muistosi aikajanalla.</p>${state.trips.length?state.trips.map(t=>`<div class="diary-card"><b>${esc(t.title)}</b><small>${esc(t.date||'Ei päivää')}</small><p>${esc(t.notes||'')}</p></div>`).join(''):'<div class="empty-card">Ei vielä matkoja. Lisää ensimmäinen matka plus-painikkeesta.</div>'}</section>`; }
function renderProfile(){ const t=total(), v=visited(); view.innerHTML = `<section class="page"><h1>👤 Minä</h1><div class="profile-card"><div class="avatar">J</div><h2>Jaana</h2><p>Oma Suomen matkakirja</p></div><div class="stats-row"><div><b>${v}</b><small>Käytyä kuntaa</small></div><div><b>${Object.values(state.municipalities).filter(x=>x.favorite).length}</b><small>Suosikkia</small></div><div><b>${state.trips.length}</b><small>Matkaa</small></div></div><button class="big-save" onclick="backup()">Luo varmuuskopio</button><label class="field">Palauta varmuuskopio<textarea id="restoreData" placeholder="Liitä varmuuskopioteksti tähän"></textarea></label><button class="status" onclick="restore()">Palauta</button></section>`; }
function backup(){ navigator.clipboard?.writeText(JSON.stringify(state)); toast('Varmuuskopio kopioitu'); }
function restore(){ try{ state=normalize(JSON.parse(document.getElementById('restoreData').value)); save(); renderProfile(); toast('Palautettu'); }catch(e){ toast('Palautus ei onnistunut'); } }
Object.assign(window,{backup,restore});
function renderSearch(){ view.innerHTML = `<section class="page"><h1>🔍 Haku</h1><input class="search-input" id="q" placeholder="Hae kuntaa tai maakuntaa" oninput="doSearch(this.value)" autofocus><div id="results"></div></section>`; doSearch(''); }
function doSearch(q){ q=(q||'').toLowerCase(); const hits=[]; regions().forEach(r=>{ if(r.toLowerCase().includes(q)) hits.push({type:'Maakunta',name:r,region:r}); items(r).forEach(x=>{ if(x.name.toLowerCase().includes(q)) hits.push({type:'Kunta',name:x.name,region:r}); }); }); document.getElementById('results').innerHTML = hits.slice(0,60).map(h=>`<button class="region-row" onclick="${h.type==='Maakunta'?`goRegion('${esc(h.region)}')`:`goMuni('${esc(h.name)}','${esc(h.region)}')`}"><span>${h.type==='Maakunta'?meta(h.region).emoji:'📍'}</span><div><b>${esc(h.name)}</b><small>${h.type} · ${esc(h.region)}</small></div><em>›</em></button>`).join('') || '<div class="empty-card">Ei tuloksia</div>'; }
window.doSearch=doSearch;
function renderList(title, filter){ const arr=Object.entries(state.municipalities).filter(([_,m])=>filter(m)); view.innerHTML=`<section class="page"><h1>${title}</h1>${arr.length?arr.map(([n])=>muniRow(n,findRegion(n))).join(''):'<div class="empty-card">Lista on vielä tyhjä.</div>'}</section>`; }
function toast(txt){ const el=document.createElement('div'); el.className='toast'; el.textContent=txt; document.body.appendChild(el); setTimeout(()=>el.remove(),1800); }
render();
