(function(){
var d=document,top=d.getElementById('top'),bur=top.querySelector('.burger'),menu=d.getElementById('menu');
function sc(){top.classList.toggle('sc',scrollY>8)}
addEventListener('scroll',sc,{passive:true});
bur.addEventListener('click',function(){var o=top.classList.toggle('open');bur.setAttribute('aria-expanded',o);bur.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu')});
menu.addEventListener('click',function(e){if(e.target.closest('a')){top.classList.remove('open');bur.setAttribute('aria-expanded','false')}});

/* aktywna pozycja menu */
var links=[].slice.call(menu.querySelectorAll('a:not(.mtel)'));
var secs=['start','wypieki','tradycja','sklepy','kontakt'].map(function(i){return d.getElementById(i)});
function act(){var y=scrollY+innerHeight*.35,k=0;secs.forEach(function(s,i){if(s&&s.offsetTop<=y)k=i});
  links.forEach(function(a,i){var on=i===k;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
addEventListener('scroll',act,{passive:true});

/* pasek dolny na telefonie po przewinieciu za pierwszy ekran */
var mob=d.getElementById('mob'),hero=d.getElementById('start');
if('IntersectionObserver' in window){new IntersectionObserver(function(e){mob.classList.toggle('widac',!e[0].isIntersecting)},{threshold:0.05}).observe(hero)}

/* karuzela: strzalki + przeciaganie mysza */
var pas=d.getElementById('pas'),pv=d.querySelector('.strz .prev'),nx=d.querySelector('.strz .next');
function krok(){var c=pas.querySelector('.karta');return c?c.getBoundingClientRect().width+22:300}
function st(){pv.disabled=pas.scrollLeft<4;nx.disabled=pas.scrollLeft+pas.clientWidth>=pas.scrollWidth-4}
pv.addEventListener('click',function(){pas.scrollBy({left:-krok(),behavior:'smooth'})});
nx.addEventListener('click',function(){pas.scrollBy({left:krok(),behavior:'smooth'})});
pas.addEventListener('scroll',st,{passive:true});addEventListener('resize',st);
var down=false,sx=0,sl=0,moved=false;
pas.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=pas.scrollLeft});
addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>5){moved=true;pas.classList.add('drag')}pas.scrollLeft=sl-dx});
addEventListener('pointerup',function(){if(!down)return;down=false;pas.classList.remove('drag');
  var k=krok();pas.scrollTo({left:Math.round(pas.scrollLeft/k)*k,behavior:'smooth'})});
pas.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);

/* lightbox */
var lb=d.getElementById('lb'),li=lb.querySelector('img'),lp=lb.querySelector('p'),last=null;
d.addEventListener('click',function(e){var b=e.target.closest('[data-big]');if(!b)return;last=b;li.src=b.dataset.big;li.alt=b.dataset.alt;lp.textContent=b.dataset.alt+' (zdjęcie poglądowe)';lb.classList.add('on');lb.querySelector('button').focus()});
function zam(){lb.classList.remove('on');li.removeAttribute('src');if(last)last.focus()}
lb.addEventListener('click',function(e){if(e.target!==li)zam()});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('on'))zam()});

/* sklepy */
var S=window.SKLEPY||[],lista=d.getElementById('lista'),filtry=d.getElementById('filtry'),mapaEl=d.getElementById('mapa');
var miasta=[];S.forEach(function(s){if(miasta.indexOf(s.m)<0)miasta.push(s.m)});
var wyb='',map=null,mk=[],L=null;
function adres(s){return s.a?(s.a.indexOf(s.m.split(' ')[0])===0?s.a:s.a+', '+s.m):s.m}
function tytul(s){return s.a||s.m}
function trasa(s){return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent('Piekarnia Żabczyńscy, '+adres(s)+(s.kod?', '+s.kod:'')+', Polska')}
var PINSVG='<svg viewBox="0 0 30 36" aria-hidden="true"><path d="M2 5Q15 1 28 5V18c0 7-6 12-13 16C8 30 2 25 2 18Z" fill="currentColor" stroke="#fff" stroke-width="2"/><path d="M8 15q7-3.6 14 0M8 21q7-3.6 14 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
function btn(m,n){var b=d.createElement('button');b.type='button';b.innerHTML=(m||'Wszystkie')+'<span>'+n+'</span>';b.setAttribute('aria-pressed',m===wyb);b.addEventListener('click',function(){ustaw(m,true)});return b}
function rysujFiltry(){filtry.innerHTML='';filtry.appendChild(btn('',S.length));miasta.forEach(function(m){filtry.appendChild(btn(m,S.filter(function(s){return s.m===m}).length))})}
var wszystkie=false;
function rysujListe(){lista.innerHTML='';var n=0,mal=matchMedia('(max-width:760px)').matches&&!wyb&&!wszystkie;S.forEach(function(s,i){if(wyb&&s.m!==wyb)return;n++;if(mal&&n>6)return;
  var li=d.createElement('li');li.className='pkt';li.dataset.i=i;
  li.innerHTML='<div><h3>'+tytul(s)+'</h3><div class="m">'+(s.kod?s.kod+' ':'')+s.m+'</div></div><a class="trasa" href="'+trasa(s)+'" target="_blank" rel="noopener">'+
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>Trasa</a><div class="brak">Telefon i godziny: uzupełnimy z Państwa listy</div>';
  li.addEventListener('click',function(e){if(e.target.closest('a'))return;pokaz(i,true)});lista.appendChild(li)});
  if(mal&&n>6){var w=d.createElement('li');w.className='wiecej';w.innerHTML='<button type="button">Pokaż wszystkie sklepy ('+n+')</button>';w.querySelector('button').addEventListener('click',function(){wszystkie=true;rysujListe()});lista.appendChild(w)}}
function ustaw(m,przesun){wyb=m;rysujFiltry();rysujListe();if(map)dopasuj();lista.scrollTop=0}
function dopasuj(){var pts=S.filter(function(s){return !wyb||s.m===wyb}).map(function(s){return [s.lat,s.lng]});
  mk.forEach(function(o,i){var w=!wyb||S[i].m===wyb;o.setOpacity(w?1:.25)});
  if(pts.length===1)map.setView(pts[0],14);else map.fitBounds(pts,{padding:[40,40],maxZoom:15})}
function pokaz(i,zMapy){[].forEach.call(lista.children,function(el){el.classList.toggle('on',+el.dataset.i===i)});
  mk.forEach(function(o,k){var e=o.getElement();if(e)e.querySelector('.pin').classList.toggle('on',k===i)});
  if(map&&zMapy){map.setView([S[i].lat,S[i].lng],Math.max(map.getZoom(),14));mk[i].openPopup()}
  var el=lista.querySelector('[data-i="'+i+'"]');if(el&&!zMapy)el.scrollIntoView({block:'nearest',behavior:'smooth'})}
rysujFiltry();rysujListe();
requestAnimationFrame(function(){setTimeout(function(){sc();act();st();var rok=d.getElementById('rok'),y=new Date().getFullYear();if(rok&&rok.textContent!=String(y))rok.textContent=y},0)});
d.querySelectorAll('.stopka [data-m]').forEach(function(a){a.addEventListener('click',function(){ustaw(a.dataset.m)})});

function laduj(){if(map)return;
  var c=d.createElement('link');c.rel='stylesheet';c.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';d.head.appendChild(c);
  var s=d.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';s.onload=function(){L=window.L;
    mapaEl.innerHTML='';map=L.map(mapaEl,{scrollWheelZoom:false,zoomControl:true,attributionControl:true});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    var ic=L.divIcon({className:'',html:'<div class="pin" style="width:30px;height:36px">'+PINSVG+'</div>',iconSize:[30,36],iconAnchor:[15,35],popupAnchor:[0,-32]});
    S.forEach(function(p,i){var m=L.marker([p.lat,p.lng],{icon:ic,title:adres(p),keyboard:true}).addTo(map)
      .bindPopup('<b>'+tytul(p)+'</b><br>'+(p.kod?p.kod+' ':'')+p.m+'<br><a href="'+trasa(p)+'" target="_blank" rel="noopener">Wyznacz trasę</a>');
      m.on('click',function(){if(wyb&&p.m!==wyb){ustaw(p.m)}pokaz(i,false)});mk.push(m)});
    dopasuj()};
  d.head.appendChild(s)}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){laduj();io.disconnect()}},{rootMargin:'400px'});io.observe(mapaEl)}else laduj();
})();
