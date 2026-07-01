
const q = (s)=>document.querySelector(s);
function go(url){ window.location.href=url; }
function saveTrip(){
  const name = q('#tripName')?.value || 'Uusi matka';
  localStorage.setItem('ms_last_trip', name);
  alert('Matka tallennettu luonnokseksi: ' + name);
}
function toggleVisited(el){
  el.classList.toggle('done');
}


// v30: etusivun taustakuva vaihtuu välillä, mutta etusivun rakenne pysyy samana.
(function rotateHomeHero(){
  const hero = document.querySelector('.home-hero.clean-home');
  if(!hero) return;
  const images = [
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1100&q=85',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=85',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1100&q=85',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1100&q=85'
  ];
  const index = new Date().getDate() % images.length;
  hero.style.backgroundImage = `linear-gradient(180deg,rgba(7,32,28,.18) 0%,rgba(7,32,28,.10) 34%,rgba(7,32,28,.62) 100%), url('${images[index]}')`;
})();
