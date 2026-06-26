const municipalities = [
  {id:"asikkala", name:"Asikkala", region:"Päijät-Häme", x:175, y:400},
  {id:"lahti", name:"Lahti", region:"Päijät-Häme", x:205, y:410},
  {id:"hollola", name:"Hollola", region:"Päijät-Häme", x:185, y:420},
  {id:"padasjoki", name:"Padasjoki", region:"Päijät-Häme", x:185, y:365},
  {id:"sysma", name:"Sysmä", region:"Päijät-Häme", x:215, y:350},
  {id:"hartola", name:"Hartola", region:"Päijät-Häme", x:235, y:330},
  {id:"heinola", name:"Heinola", region:"Päijät-Häme", x:235, y:390},
  {id:"karkola", name:"Kärkölä", region:"Päijät-Häme", x:175, y:445},
  {id:"helsinki", name:"Helsinki", region:"Uusimaa", x:195, y:490},
  {id:"porvoo", name:"Porvoo", region:"Uusimaa", x:235, y:475},
  {id:"turku", name:"Turku", region:"Varsinais-Suomi", x:105, y:460},
  {id:"tampere", name:"Tampere", region:"Pirkanmaa", x:150, y:335},
  {id:"jyvaskyla", name:"Jyväskylä", region:"Keski-Suomi", x:220, y:285},
  {id:"kuopio", name:"Kuopio", region:"Pohjois-Savo", x:285, y:250},
  {id:"oulu", name:"Oulu", region:"Pohjois-Pohjanmaa", x:235, y:150},
  {id:"rovaniemi", name:"Rovaniemi", region:"Lappi", x:220, y:80},
  {id:"inari", name:"Inari", region:"Lappi", x:235, y:30},
  {id:"savonlinna", name:"Savonlinna", region:"Etelä-Savo", x:305, y:330},
  {id:"joensuu", name:"Joensuu", region:"Pohjois-Karjala", x:350, y:300},
  {id:"vaasa", name:"Vaasa", region:"Pohjanmaa", x:90, y:260}
];

function getVisited(){
  return JSON.parse(localStorage.getItem("visitedMunicipalities") || "[]");
}
function setVisited(list){
  localStorage.setItem("visitedMunicipalities", JSON.stringify(list));
}
function getDiary(){
  return JSON.parse(localStorage.getItem("diaryEntries") || "{}");
}
function setDiary(obj){
  localStorage.setItem("diaryEntries", JSON.stringify(obj));
}
function toggleVisited(id){
  const list = getVisited();
  const i = list.indexOf(id);
  if(i >= 0) list.splice(i,1); else list.push(id);
  setVisited(list);
  renderAll();
}
function countRegions(){
  const visited = getVisited();
  const regions = new Set(municipalities.filter(m=>visited.includes(m.id)).map(m=>m.region));
  return regions.size;
}
function renderStats(){
  const visited = getVisited();
  document.querySelectorAll("[data-stat='visited']").forEach(el=>el.textContent = visited.length + " / 308");
  document.querySelectorAll("[data-stat='regions']").forEach(el=>el.textContent = countRegions() + " / 19");
  document.querySelectorAll("[data-stat='diary']").forEach(el=>el.textContent = Object.keys(getDiary()).length);
}
function renderMap(){
  const svg = document.getElementById("mapSvg");
  if(!svg) return;
  const visited = getVisited();
  let circles = municipalities.map(m=>`
    <g onclick="selectMunicipality('${m.id}')">
      <circle class="muni ${visited.includes(m.id) ? 'visited' : ''}" cx="${m.x}" cy="${m.y}" r="14"></circle>
      <text class="map-label" x="${m.x}" y="${m.y+30}" text-anchor="middle">${m.name}</text>
    </g>
  `).join("");
  svg.innerHTML = `
    <path d="M220 5 L270 45 L255 95 L278 150 L245 205 L260 260 L235 318 L250 390 L205 535 L150 505 L125 435 L140 365 L95 300 L122 245 L100 190 L132 115 L165 75 Z"
      fill="#eef6ff" stroke="#c42020" stroke-width="3"/>
    ${circles}
  `;
}
function selectMunicipality(id){
  const m = municipalities.find(x=>x.id===id);
  if(!m) return;
  const box = document.getElementById("selectedBox");
  if(!box) return;
  const visited = getVisited().includes(id);
  const diary = getDiary()[id] || "";
  box.innerHTML = `
    <h2>${m.name}</h2>
    <p><b>Maakunta:</b> ${m.region}</p>
    <p>${visited ? "✅ Käyty" : "⬜ Ei vielä käyty"}</p>
    <button onclick="toggleVisited('${id}')">${visited ? "Poista käydyistä" : "Merkitse käydyksi"}</button>
    <h3>Muistiinpano</h3>
    <textarea id="noteBox" placeholder="Kirjoita muisto tästä kunnasta...">${diary}</textarea>
    <br><br>
    <button onclick="saveNote('${id}')">Tallenna muistiinpano</button>
  `;
}
function saveNote(id){
  const diary = getDiary();
  diary[id] = document.getElementById("noteBox").value;
  setDiary(diary);
  renderAll();
  alert("Muistiinpano tallennettu!");
}
function renderRecent(){
  const el = document.getElementById("recentList");
  if(!el) return;
  const visited = getVisited();
  const items = municipalities.filter(m=>visited.includes(m.id)).slice(-5).reverse();
  el.innerHTML = items.length ? items.map(m=>`
    <div class="row"><div><b>${m.name}</b><br><small>${m.region}</small></div><span>✓</span></div>
  `).join("") : "<p>Ei vielä käytyjä kuntia.</p>";
}
function renderDiary(){
  const el = document.getElementById("diaryList");
  if(!el) return;
  const diary = getDiary();
  const rows = Object.keys(diary).filter(id=>diary[id].trim()).map(id=>{
    const m = municipalities.find(x=>x.id===id);
    return `<div class="row"><div><b>${m?.name || id}</b><br><small>${diary[id]}</small></div></div>`;
  });
  el.innerHTML = rows.length ? rows.join("") : "<p>Ei päiväkirjamerkintöjä vielä.</p>";
}
function filterMunicipalities(){
  const q = (document.getElementById("muniSearch")?.value || "").toLowerCase();
  const el = document.getElementById("muniList");
  if(!el) return;
  const visited = getVisited();
  el.innerHTML = municipalities
    .filter(m=>m.name.toLowerCase().includes(q) || m.region.toLowerCase().includes(q))
    .map(m=>`<div class="row"><div><b>${m.name}</b><br><small>${m.region}</small></div><button onclick="toggleVisited('${m.id}')">${visited.includes(m.id) ? "Käyty" : "Merkitse"}</button></div>`)
    .join("");
}
function renderAll(){
  renderStats();
  renderMap();
  renderRecent();
  renderDiary();
  filterMunicipalities();
}
document.addEventListener("DOMContentLoaded", renderAll);