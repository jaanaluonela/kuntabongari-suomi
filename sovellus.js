function go(page){
  const routes={home:'index.html',map:'kartta.html',diary:'paivakirja.html',profile:'profiili.html',newTrip:'paivakirja.html'};
  location.href=routes[page]||'index.html';
}
function showSearch(){
  const q=prompt('Hae kuntaa, paikkaa tai nähtävyyttä');
  if(q) alert('Haku: '+q+'\nHakutoiminto laajennetaan seuraavassa vaiheessa.');
}
