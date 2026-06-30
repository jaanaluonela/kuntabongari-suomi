const MS_REGIONS = [
  {id:'uusimaa', code:'U', name:'Uusimaa', icon:'🌆', total:26, visited:2, x:58, y:82, route:'helsinki, porvoo, fiskars'},
  {id:'varsinais-suomi', code:'VS', name:'Varsinais-Suomi', icon:'⚓', total:27, visited:1, x:38, y:78, route:'Turku, Naantali, saaristo'},
  {id:'satakunta', code:'S', name:'Satakunta', icon:'🌊', total:16, visited:0, x:32, y:66, route:'Pori, Yyteri, Rauma'},
  {id:'kanta-hame', code:'KH', name:'Kanta-Häme', icon:'🏰', total:11, visited:0, x:49, y:70, route:'Hämeenlinna, Aulanko'},
  {id:'pirkanmaa', code:'P', name:'Pirkanmaa', icon:'🌲', total:23, visited:0, x:47, y:60, route:'Tampere, Virrat'},
  {id:'paijat-hame', code:'PH', name:'Päijät-Häme', icon:'📍', total:10, visited:0, x:57, y:68, route:'Asikkala, Lahti, Pulkkilanharju'},
  {id:'kymenlaakso', code:'KY', name:'Kymenlaakso', icon:'🌉', total:6, visited:0, x:70, y:74, route:'Kotka, Kouvola'},
  {id:'etela-karjala', code:'EK', name:'Etelä-Karjala', icon:'🏞️', total:9, visited:0, x:76, y:66, route:'Lappeenranta, Imatra'},
  {id:'etela-savo', code:'ES', name:'Etelä-Savo', icon:'💧', total:12, visited:0, x:66, y:58, route:'Savonlinna, Saimaa'},
  {id:'pohjois-savo', code:'PS', name:'Pohjois-Savo', icon:'🌅', total:19, visited:0, x:63, y:47, route:'Kuopio, Tahko'},
  {id:'pohjois-karjala', code:'PK', name:'Pohjois-Karjala', icon:'⛰️', total:13, visited:0, x:76, y:48, route:'Koli, Joensuu'},
  {id:'keski-suomi', code:'KS', name:'Keski-Suomi', icon:'🌿', total:22, visited:0, x:53, y:51, route:'Jyväskylä, Keuruu'},
  {id:'etela-pohjanmaa', code:'EP', name:'Etelä-Pohjanmaa', icon:'🌾', total:18, visited:0, x:38, y:49, route:'Seinäjoki, Ähtäri'},
  {id:'pohjanmaa', code:'P', name:'Pohjanmaa', icon:'🌊', total:14, visited:0, x:29, y:44, route:'Vaasa, Kristiinankaupunki'},
  {id:'keski-pohjanmaa', code:'KP', name:'Keski-Pohjanmaa', icon:'🌾', total:8, visited:0, x:31, y:36, route:'Kokkola, Perho'},
  {id:'pohjois-pohjanmaa', code:'PP', name:'Pohjois-Pohjanmaa', icon:'🌲', total:30, visited:0, x:49, y:29, route:'Oulu, Hailuoto, Kuusamo'},
  {id:'kainuu', code:'K', name:'Kainuu', icon:'🐻', total:8, visited:0, x:67, y:34, route:'Kajaani, Hossa'},
  {id:'lappi', code:'L', name:'Lappi', icon:'❄️', total:21, visited:0, x:56, y:12, route:'Inari, Levi, Rovaniemi'},
  {id:'ahvenanmaa', code:'Å', name:'Ahvenanmaa', icon:'⛵', total:16, visited:0, x:17, y:82, route:'Maarianhamina'}
];
const MS_PLACES = [
  {name:'Pulkkilanharju', type:'Nähtävyys', icon:'📍', region:'Päijät-Häme', distance:'8 km'},
  {name:'Vääksyn kanava', type:'Kävely', icon:'🌉', region:'Päijät-Häme', distance:'1 km'},
  {name:'Kahvila Kanavan Helmi', type:'Kahvila', icon:'☕', region:'Päijät-Häme', distance:'1 km'},
  {name:'Padasjoen satama', type:'Satama', icon:'⚓', region:'Päijät-Häme', distance:'25 km'},
  {name:'Verla', type:'UNESCO-kohde', icon:'🏛️', region:'Kymenlaakso', distance:'74 km'}
];
const MS_SAMPLE_TRIPS = [
  {title:'Kesäretki Kouvolaan', place:'Verla, Repovesi ja kahvit', date:'27.6.2026', icon:'🌲'},
  {title:'Päijänteen ilta', place:'Vääksy ja Pulkkilanharju', date:'22.6.2026', icon:'🌅'},
  {title:'Helsingin joulutori', place:'Tuomaan markkinat', date:'15.12.2025', icon:'🎄'}
];
