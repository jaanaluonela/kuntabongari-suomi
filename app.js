/* Matkalla Suomessa v21 – Premium maakuntasivut
   Rakentuu nykyisen data.js-tiedoston päälle. Ei vaadi kirjastoja. */
const REGION_META = {
  "Uusimaa": { icon:"🏙️", slug:"uusimaa", color:"#22577a", cover:"linear-gradient(135deg,#234,#78a,#dfe)", desc:"Kaupunkeja, merta, kulttuuria ja pieniä retkiä ympäri Etelä-Suomea." },
  "Varsinais-Suomi": { icon:"⚓", slug:"varsinais-suomi", color:"#0f766e", cover:"linear-gradient(135deg,#075,#9ed,#ffe)", desc:"Saariston, vanhojen kaupunkien ja merellisen tunnelman maakunta." },
  "Satakunta": { icon:"🌊", slug:"satakunta", color:"#0284c7", cover:"linear-gradient(135deg,#036,#59c,#fff)", desc:"Rannikkoa, kulttuuria ja kauniita jokimaisemia." },
  "Kanta-Häme": { icon:"🌿", slug:"kanta-hame", color:"#2f855a", cover:"linear-gradient(135deg,#193,#8d8,#fff)", desc:"Linnoja, järviä, puistoja ja rauhallista Hämeen sydäntä." },
  "Pirkanmaa": { icon:"🌲", slug:"pirkanmaa", color:"#166534", cover:"linear-gradient(135deg,#174,#9c9,#fff)", desc:"Kaupunki- ja luontokohteita Tampereen ympärillä." },
  "Päijät-Häme": { icon:"📍", slug:"paijat-hame", color:"#0f766e", cover:"linear-gradient(135deg,#0f766e,#7dd3fc,#fff7ed)", desc:"Järviä, harjuja ja kauniita päiväretkiä Vesijärven ja Päijänteen maisemissa." },
  "Kymenlaakso": { icon:"🌉", slug:"kymenlaakso", color:"#2563eb", cover:"linear-gradient(135deg,#1e40af,#93c5fd,#fff)", desc:"Jokimaisemia, satamia ja itäisen Suomen tunnelmaa." },
  "Etelä-Karjala": { icon:"🌅", slug:"etela-karjala", color:"#0891b2", cover:"linear-gradient(135deg,#155e75,#67e8f9,#fff)", desc:"Saimaa, linnoitukset ja kesäpäivien valo." },
  "Etelä-Savo": { icon:"💧", slug:"etela-savo", color:"#0ea5e9", cover:"linear-gradient(135deg,#0369a1,#bae6fd,#fff)", desc:"Järvi-Suomen sydän, mökkimaisemat ja rauha." },
  "Pohjois-Savo": { icon:"🌲", slug:"pohjois-savo", color:"#15803d", cover:"linear-gradient(135deg,#166534,#bbf7d0,#fff)", desc:"Mäkimaisemia, järviä ja savolaista vieraanvaraisuutta." },
  "Pohjois-Karjala": { icon:"🥾", slug:"pohjois-karjala", color:"#16a34a", cover:"linear-gradient(135deg,#14532d,#86efac,#fff)", desc:"Koli, vaaramaisemat ja retkeilijän unelmat." },
  "Keski-Suomi": { icon:"🛶", slug:"keski-suomi", color:"#0d9488", cover:"linear-gradient(135deg,#115e59,#99f6e4,#fff)", desc:"Järviä, siltoja, metsää ja reittejä keskellä Suomea." },
  "Etelä-Pohjanmaa": { icon:"🌾", slug:"etela-pohjanmaa", color:"#b45309", cover:"linear-gradient(135deg,#92400e,#fde68a,#fff)", desc:"Avaria lakeuksia, tapahtumia ja omaleimaista kulttuuria." },
  "Pohjanmaa": { icon:"🌾", slug:"pohjanmaa", color:"#ca8a04", cover:"linear-gradient(135deg,#854d0e,#fef08a,#fff)", desc:"Rannikkoa, saaristoa ja kaksikielistä kulttuuria." },
  "Keski-Pohjanmaa": { icon:"🌻", slug:"keski-pohjanmaa", color:"#d97706", cover:"linear-gradient(135deg,#92400e,#fcd34d,#fff)", desc:"Pieniä helmiä, rannikkoa ja maaseudun rauhaa." },
  "Pohjois-Pohjanmaa": { icon:"🧭", slug:"pohjois-pohjanmaa", color:"#0369a1", cover:"linear-gradient(135deg,#075985,#bae6fd,#fff)", desc:"Laajoja maisemia, kaupunkia, merta ja tuntuman Lappiin." },
  "Kainuu": { icon:"🌲", slug:"kainuu", color:"#166534", cover:"linear-gradient(135deg,#14532d,#bbf7d0,#fff)", desc:"Erämaata, vaaroja ja hiljaisia luontokohteita." },
  "Lappi": { icon:"❄️", slug:"lappi", color:"#7c3aed", cover:"linear-gradient(135deg,#312e81,#c4b5fd,#f8fafc)", desc:"Tunturit, revontulet ja Suomen suurimmat seikkailut." },
  "Ahvenanmaa": { icon:"⛵", slug:"ahvenanmaa", color:"#0e7490", cover:"linear-gradient(135deg,#164e63,#67e8f9,#fff)", desc:"Saaristo, meri ja leppoisa lomatunnelma." }
};

const FALLBACK_REGIONS = {
  "Päijät-Häme": ["Asikkala","Hartola","Heinola","Hollola","Iitti","Kärkölä","Lahti","Orimattila","Padasjoki","Sysmä"],
  "Uusimaa": ["Helsinki","Espoo","Vantaa","Porvoo","Hanko"],
  "Varsinais-Suomi": ["Turku","Naantali","Salo","Parainen"],
  "Lappi": ["Rovaniemi","Inari","Kittilä","Kolari"]
};
const DATA = typeof REGIONS !== "undefined" ? REGIONS : FALLBACK_REGIONS;
const view = document.getElementById("view");
const STORE_KEY = "matkalla-suomessa-v21";
const oldKeys = ["visitedMunicipalities", "matkalla-suomessa"];
let state = loadState();
let route = location.hash.replace("#", "") || "home";

function loadState(){
  const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  saved.municipalities ||= {};
  saved.trips ||= [];
  saved.memories ||= [];
  saved.lastRegion ||= "Päijät-Häme";
  try {
    const old = JSON.parse(localStorage.getItem("matkallaSuomessa") || "{}");
    if (old && old.municipalities) saved.municipalities = {...old.municipalities, ...saved.municipalities};
  } catch(e){}
  return saved;
}
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function allRegions(){ return Object.keys(DATA); }
function regionItems(region){
  const items = DATA[region] || [];
  return items.map(m => typeof m === "string" ? {name:m} : m);
}
function getMuni(name){ return state.municipalities[name] ||= {visited:false,want:false,favorite:false,tags:[],notes:"",rating:0,visits:0,photos:0,overnight:false, date:""}; }
function totalMunicipalities(){ return allRegions().reduce((s,r)=>s+regionItems(r).length,0); }
function visitedCount(){ return Object.values(state.municipalities).filter(x=>x.visited).length; }
function regionStats(region){
  const list = regionItems(region);
  const visited = list.filter(m=>getMuni(m.name).visited).length;
  const want = list.filter(m=>getMuni(m.name).want).length;
  const total = list.length || 1;
  return {visited,want,total,pct:Math.round(visited/total*100)};
}
function clsForPct(p){ return p>=100 ? "done" : p>0 ? "started" : "empty"; }
function meta(region){ return REGION_META[region] || {icon:"📍", color:"#0f766e", cover:"linear-gradient(135deg,#0f766e,#c7f9cc,#fff)", desc:"Tutustu kuntiin, kohteisiin ja omiin matkamuistoihin."}; }
function go(to){ route = to; location.hash = to; render(); }
function goRegion(region){ state.lastRegion = region; save(); go("region:"+encodeURIComponent(region)); }
function goMuni(name, region){ state.lastRegion = region || state.lastRegion; save(); go("muni:"+encodeURIComponent(name)+":"+encodeURIComponent(region||"")); }
window.addEventListener("hashchange", ()=>{ route = location.hash.replace("#", "") || "home"; render(); });

function render(){
  setActiveNav();
  const [kind,a,b] = route.split(":");
  if(kind==="map") return renderMap();
  if(kind==="region") return renderRegion(decodeURIComponent(a||"Päijät-Häme"));
  if(kind==="muni") return renderMunicipality(decodeURIComponent(a||""), decodeURIComponent(b||state.lastRegion));
  if(kind==="newTrip") return renderNewTrip();
  if(kind==="trips") return renderTrips();
  if(kind==="profile") return renderProfile();
  if(kind==="search") return renderSearch();
  if(kind==="wants") return renderWantList();
  if(kind==="favorites") return renderFavorites();
  renderHome();
}
function setActiveNav(){
  document.querySelectorAll(".bottomnav button").forEach(btn=>btn.classList.remove("active"));
  const key = route.startsWith("map")||route.startsWith("region")||route.startsWith("muni") ? "map" : route.startsWith("trip") ? "trips" : route.startsWith("profile") ? "profile" : route.startsWith("newTrip") ? "newTrip" : "home";
  const btn = document.querySelector(`[data-nav="${key}"]`); if(btn) btn.classList.add("active");
}

function renderHome(){
  const total = totalMunicipalities(); const visited = visitedCount(); const pct = total ? Math.round(visited/total*100) : 0;
  const last = state.lastRegion || "Päijät-Häme"; const ls = regionStats(last);
  const wants = Object.entries(state.municipalities).filter(([_,v])=>v.want && !v.visited).slice(0,6);
  const favs = Object.entries(state.municipalities).filter(([_,v])=>v.favorite).slice(0,6);
  view.innerHTML = `
    <section class="hero" style="background-image:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.58)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=75')">
      <div class="hero-actions"><button class="round-icon light">☰</button><div><button class="round-icon light" onclick="showSearch()">🔍</button><button class="pill-share">Jaa</button></div></div>
      <div class="hero-title"><div class="script">Matkalla</div><div class="spaced">SUOMESSA</div><p>Kaikki Suomen matkasi yhdessä paikassa.</p></div>
    </section>
    <section class="content overlap">
      <button class="searchbar" onclick="showSearch()">🔍 <span>Hae kuntaa, maakuntaa tai nähtävyyttä...</span></button>
      <div class="quick-grid">
        <button class="quick primary" onclick="go('newTrip')"><span class="bigplus">＋</span><b>Uusi matka</b><small>Tallenna uusi kohde hetkessä</small></button>
        <button class="quick" onclick="go('map')"><span class="mapicon">🗺️</span><b>Avaa kartta</b><small>Tutki Suomea maakunta kerrallaan</small></button>
      </div>
      <div class="stats-row">
        <div><b>${visited}</b><small>Käytyä kuntaa</small></div><div><b>${total}</b><small>Kuntaa yhteensä</small></div><div><b>${pct}%</b><small>Suomi valmis</small></div>
      </div>
      <h2>Lisää tietoja matkaasi</h2>
      <div class="feature-grid">
        ${feature("📷","Kuvat")} ${feature("🍽️","Ravintola")} ${feature("☕","Kahvila")} ${feature("🛏️","Yöpyminen")}
        ${feature("🏕️","Leirintäalue")} ${feature("📍","Nähtävyys")} ${feature("🥾","Retki")} ${feature("📝","Muistiinpanot")}
        ${feature("⭐","Arvio")} ${feature("❤️","Suosikiksi")} ${feature("💙","Haluan käydä")} ${feature("🌲","Luonto")}
      </div>
      <section-title title="Jatka matkaa" action="Näytä kaikki ›" onclick="go('map')"></section-title>
      <button class="journey-card" onclick="goRegion('${last}')">
        <div class="journey-img"></div><div><small>Viimeisin maakunta</small><h3>${last}</h3><p>${ls.visited}/${ls.total} kuntaa</p><div class="bar"><i style="width:${ls.pct}%"></i></div><b>${ls.pct}%</b></div>
      </button>
      ${wants.length ? `<section-title title="Seuraavat kohteet" action="Näytä kaikki ›" onclick="go('wants')"></section-title><div class="h-scroll">${wants.map(([n])=>memoryCard(n,"💙",()=>`goMuni('${n}','${findRegion(n)}')`)).join("")}</div>` : ""}
      ${favs.length ? `<section-title title="Suosikit" action="Näytä kaikki ›" onclick="go('favorites')"></section-title><div class="h-scroll">${favs.map(([n])=>memoryCard(n,"❤️",()=>`goMuni('${n}','${findRegion(n)}')`)).join("")}</div>` : ""}
    </section>`;
}
function feature(icon,label){ return `<button class="feature" onclick="go('newTrip')"><span>${icon}</span><b>${label}</b></button>`; }
function memoryCard(name, icon, action){ return `<button class="mini-card" onclick="${action()}"><div class="mini-img">${icon}</div><b>${name}</b><small>${findRegion(name)||"Kohde"}</small></button>`; }
customElements.define('section-title', class extends HTMLElement{connectedCallback(){this.innerHTML=`<div class="section-title"><h2>${this.getAttribute('title')}</h2><button>${this.getAttribute('action')||''}</button></div>`; this.querySelector('button').onclick=()=>eval(this.getAttribute('onclick')||'');}});

function renderMap(){
  const regions = allRegions();
  view.innerHTML = `<section class="content"><h1>Suomen kartta</h1><p class="lead">Valitse maakunta, seuraa edistymistä ja jatka omaa matkakirjaasi.</p>
    <div class="premium-map"><div class="finland-shape"></div>${regions.map((r,i)=>mapPin(r,i)).join("")}<div class="legend"><span>○ Aloittamatta</span><span class="green">● Aloitettu</span><span class="gold">● Valmis</span></div></div>
    <div class="section-title"><h2>Kaikki maakunnat</h2><button onclick="showSearch()">Haku ›</button></div>
    <div class="region-grid">${regions.map(r=>regionCard(r)).join("")}</div></section>`;
}
function mapPin(region,i){
  const pos = [[47,5],[39,57],[33,50],[28,56],[25,49],[63,38],[70,56],[64,64],[57,62],[50,61],[55,70],[47,53],[39,43],[32,36],[25,38],[35,24],[42,69],[49,80],[18,8]][i%19];
  const s = regionStats(region); const m = meta(region);
  return `<button class="map-pin ${clsForPct(s.pct)}" style="left:${pos[0]}%;top:${pos[1]}%" onclick="goRegion('${region}')"><b>${abbr(region)}</b><small>${s.pct}%</small></button>`;
}
function regionCard(region){ const s=regionStats(region), m=meta(region); return `<button class="region-card ${clsForPct(s.pct)}" onclick="goRegion('${region}')"><span>${m.icon}</span><div><b>${region}</b><small>${s.visited}/${s.total} kuntaa • ${s.pct}%</small><div class="bar"><i style="width:${s.pct}%"></i></div></div><em>›</em></button>`; }
function abbr(r){ return r.split(/[- ]/).map(x=>x[0]).join("").slice(0,2).toUpperCase(); }

function renderRegion(region){
  const m = meta(region); const s = regionStats(region); const list = regionItems(region);
  const top = list.slice(0,4);
  view.innerHTML = `<section class="region-hero" style="background:${m.cover}"><button class="back" onclick="go('map')">‹</button><button class="round-icon hero-heart">♡</button><div><span class="crest">${m.icon}</span><h1>${region}</h1><p>${m.desc}</p></div></section>
  <section class="content region-content">
    <div class="progress-card"><div><b>${s.visited}/${s.total}</b><small>Kuntaa käyty</small></div><div><b>${s.pct}%</b><small>Valmis</small></div><div><b>${s.want}</b><small>Haluan käydä</small></div><div class="bar wide"><i style="width:${s.pct}%"></i></div></div>
    <div class="action-grid">${regionAction("📷","Kuvat")} ${regionAction("🍽️","Ravintolat")} ${regionAction("☕","Kahvilat")} ${regionAction("🛏️","Yöpyminen")} ${regionAction("🏕️","Leirintäalueet")} ${regionAction("📍","Nähtävyydet")} ${regionAction("🎭","Tapahtumat")} ${regionAction("🗺️","Kartta")}</div>
    <div class="section-title"><h2>Suosituimmat kohteet</h2><button>Näytä kaikki ›</button></div><div class="h-scroll">${top.map(x=>placeCard(x.name, region)).join("")}</div>
    <div class="section-title"><h2>Sinun muistosi</h2><button onclick="go('newTrip')">Lisää ›</button></div><div class="memory-strip">${top.map(x=>memoryCard(x.name, "📸",()=>`goMuni('${x.name}','${region}')`)).join("")}<button class="add-memory" onclick="go('newTrip')">＋<span>Lisää muisto</span></button></div>
    <h2>Kunnat</h2><div class="municipality-list">${list.map(x=>municipalityRow(x.name, region)).join("")}</div>
  </section>`;
}
function regionAction(icon,label){ return `<button class="region-action"><span>${icon}</span><b>${label}</b></button>`; }
function placeCard(name, region){ const d=getMuni(name); return `<button class="place-card" onclick="goMuni('${name}','${region}')"><div class="place-img"><button onclick="event.stopPropagation();toggleFavorite('${name}')">${d.favorite?'❤️':'♡'}</button></div><b>${name}</b><small>⭐ ${d.rating||'—'} • ${d.visited?'Käyty':'Tutustu'}</small></button>`; }
function municipalityRow(name, region){ const d=getMuni(name); return `<button class="muni-row ${d.visited?'visited':''}" onclick="goMuni('${name}','${region}')"><div><b>${d.visited?'✅ ':'📍 '}${name}</b><small>${d.visited ? (d.date||'Käyty') : d.want ? '💙 Haluan käydä' : 'Ei vielä käyty'}</small></div><span>Avaa ›</span></button>`; }

function renderMunicipality(name, region){
  const d=getMuni(name); const m=meta(region);
  view.innerHTML = `<section class="muni-hero" style="background:${m.cover}"><button class="back" onclick="goRegion('${region}')">‹</button><button class="round-icon hero-heart" onclick="toggleFavorite('${name}')">${d.favorite?'❤️':'♡'}</button><div><h1>${name}</h1><p>${region} • oma matkakansio</p></div></section>
  <section class="content region-content">
    <div class="toggle-row"><button class="status ${d.visited?'on':''}" onclick="toggleVisited('${name}')">✅ Käyty</button><button class="status ${d.want?'on blue':''}" onclick="toggleWant('${name}')">💙 Haluan käydä</button><button class="status ${d.favorite?'on pink':''}" onclick="toggleFavorite('${name}')">❤️ Suosikki</button></div>
    <label class="field">Käyntipäivä<input type="date" value="${d.date||''}" onchange="setDate('${name}',this.value)"></label>
    <div class="rating"><span>Oma arvio</span>${[1,2,3,4,5].map(i=>`<button onclick="setRating('${name}',${i})">${(d.rating||0)>=i?'⭐':'☆'}</button>`).join("")}</div>
    <h2>Lisää tietoja</h2><div class="action-grid">${regionAction("📷","Kuvat")} ${regionAction("🍽️","Ravintola")} ${regionAction("☕","Kahvila")} ${regionAction("🛏️","Yöpyminen")} ${regionAction("🏕️","Leirintäalue")} ${regionAction("📍","Nähtävyys")} ${regionAction("🥾","Retki")} ${regionAction("📝","Muistiinpano")}</div>
    <h2>Omat tunnisteet</h2><div class="tag-cloud">${["Maisema","Luonto","Lapsille","Koiralle","Kahvila","Uudestaan","Uimaranta","Museo","Helppo retki"].map(t=>`<button class="tag ${d.tags?.includes(t)?'on':''}" onclick="toggleTag('${name}','${t}')">${t}</button>`).join("")}</div>
    <label class="field">Muistiinpanot<textarea placeholder="Mitä teit, missä kävit, mitä haluat muistaa?" oninput="setNotes('${name}',this.value)">${d.notes||''}</textarea></label>
    <button class="big-save" onclick="save(); renderMunicipality('${name}','${region}')">Tallenna muisto</button>
  </section>`;
}
function renderNewTrip(){ view.innerHTML = `<section class="content"><h1>＋ Uusi matka</h1><p class="lead">Tallenna kohde, päivä ja muisto nopeasti.</p><label class="field">Otsikko<input id="tripTitle" placeholder="Esim. Kesäretki Päijät-Hämeeseen"></label><label class="field">Päivä<input id="tripDate" type="date"></label><label class="field">Muistiinpano<textarea id="tripNotes" placeholder="Mitä teit, missä kävit?"></textarea></label><button class="big-save" onclick="addTrip()">Tallenna matka</button></section>`; }
function renderTrips(){ const trips=state.trips||[]; view.innerHTML=`<section class="content"><h1>Päiväkirja</h1><p class="lead">Kaikki matkamuistosi yhdessä paikassa.</p>${trips.length?trips.map(t=>`<div class="diary-card"><b>${t.title}</b><small>${t.date||''}</small><p>${t.notes||''}</p></div>`).join(""):`<div class="empty-card">Ei matkoja vielä. Lisää ensimmäinen muisto.</div>`}</section>`; }
function renderProfile(){ view.innerHTML=`<section class="content"><h1>Minä</h1><div class="stats-row"><div><b>${visitedCount()}</b><small>Käytyä</small></div><div><b>${Object.values(state.municipalities).filter(x=>x.favorite).length}</b><small>Suosikkia</small></div><div><b>${Object.values(state.municipalities).filter(x=>x.want).length}</b><small>Haaveissa</small></div></div><h2>Varmuuskopio</h2><button class="big-save" onclick="exportData()">Lataa varmuuskopio</button><button class="ghost" onclick="if(confirm('Tyhjennetäänkö sovelluksen tallennukset?')){localStorage.removeItem(STORE_KEY);location.reload()}">Tyhjennä testitiedot</button></section>`; }
function renderSearch(){ const q = new URLSearchParams(location.hash.split('?')[1]||'').get('q')||''; const items = allRegions().flatMap(r=>regionItems(r).map(m=>({name:m.name,region:r}))).filter(x=>!q||x.name.toLowerCase().includes(q.toLowerCase())||x.region.toLowerCase().includes(q.toLowerCase())); view.innerHTML=`<section class="content"><h1>Haku</h1><input class="search-input" value="${q}" autofocus placeholder="Hae kuntaa tai maakuntaa" oninput="location.hash='search?q='+encodeURIComponent(this.value)"><div class="municipality-list">${items.slice(0,80).map(x=>municipalityRow(x.name,x.region)).join("")}</div></section>`; }
function renderWantList(){ const items=Object.entries(state.municipalities).filter(([_,v])=>v.want&&!v.visited); view.innerHTML=`<section class="content"><h1>💙 Haluan käydä</h1><div class="municipality-list">${items.map(([n])=>municipalityRow(n,findRegion(n))).join("") || '<div class="empty-card">Ei kohteita vielä.</div>'}</div></section>`; }
function renderFavorites(){ const items=Object.entries(state.municipalities).filter(([_,v])=>v.favorite); view.innerHTML=`<section class="content"><h1>❤️ Suosikit</h1><div class="municipality-list">${items.map(([n])=>municipalityRow(n,findRegion(n))).join("") || '<div class="empty-card">Ei suosikkeja vielä.</div>'}</div></section>`; }
function showSearch(){ go('search'); }
function findRegion(name){ return allRegions().find(r=>regionItems(r).some(m=>m.name===name)) || state.lastRegion || ""; }
function toggleVisited(name){ const d=getMuni(name); d.visited=!d.visited; if(d.visited){d.want=false; d.visits=(d.visits||0)+1; if(!d.date)d.date=new Date().toISOString().slice(0,10);} save(); render(); }
function toggleWant(name){ const d=getMuni(name); d.want=!d.want; if(d.want)d.visited=false; save(); render(); }
function toggleFavorite(name){ const d=getMuni(name); d.favorite=!d.favorite; save(); render(); }
function setDate(name,val){ getMuni(name).date=val; save(); }
function setRating(name,val){ getMuni(name).rating=val; save(); render(); }
function setNotes(name,val){ getMuni(name).notes=val; save(); }
function toggleTag(name,tag){ const d=getMuni(name); d.tags ||= []; d.tags = d.tags.includes(tag) ? d.tags.filter(t=>t!==tag) : [...d.tags,tag]; save(); render(); }
function addTrip(){ const title=document.getElementById('tripTitle').value||'Uusi matka'; const date=document.getElementById('tripDate').value; const notes=document.getElementById('tripNotes').value; state.trips.unshift({title,date,notes,created:Date.now()}); save(); go('trips'); }
function exportData(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='matkalla-suomessa-varmuuskopio.json'; a.click(); }
render();
