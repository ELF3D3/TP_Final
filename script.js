// ===== Datos base =====
const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const rutinas = {
  "Lunes": "Pecho + Tríceps",
  "Martes": "Espalda + Bíceps",
  "Miércoles": "Piernas",
  "Jueves": "Hombros + Core",
  "Viernes": "Full Body",
  "Sábado": "Cardio / HIIT",
  "Domingo": "Descanso Activo"
};

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// ===== Estado (LocalStorage) =====
const state = {
  get peso(){ return Number(localStorage.getItem('peso')) || 0 },
  set peso(v){ localStorage.setItem('peso', String(v)) },
  get series(){
    try{ return JSON.parse(localStorage.getItem('pesoSeries')||'[]') }catch{ return [] }
  },
  set series(arr){ localStorage.setItem('pesoSeries', JSON.stringify(arr)) },
  get kcal(){
    try{ return JSON.parse(localStorage.getItem('kcal')||'{}') }catch{ return {} }
  },
  set kcal(obj){ localStorage.setItem('kcal', JSON.stringify(obj)) },
  get racha(){ return Number(localStorage.getItem('racha')||'0') },
  set racha(v){ localStorage.setItem('racha', String(v)) }
};

// ===== SPA =====
function setActive(sectionId){
  $$('.section').forEach(s=>s.classList.add('hidden'));
  $('#' + sectionId).classList.remove('hidden');
  $$('.nav-link').forEach(b=>b.classList.toggle('active', b.dataset.section===sectionId));
  const mm = $('#mobile-menu'); if(mm) mm.classList.add('hidden');
  const hb = $('#hamburger'); if(hb) hb.setAttribute('aria-expanded','false');
  location.hash = sectionId;
}
function bindNav(){
  $$('.nav-link').forEach(btn=> btn.addEventListener('click', ()=> setActive(btn.dataset.section)));
  $$('#inicio .btn').forEach(btn => {
    const to = btn.getAttribute('data-section');
    if(to) btn.addEventListener('click', ()=> setActive(to));
  });
  $('.brand').addEventListener('click', ()=> setActive('inicio'));
  $('.brand').addEventListener('keypress', (e)=>{ if(e.key==='Enter') setActive('inicio') });
}
function bindHamburger(){
  const hb = $('#hamburger'), menu = $('#mobile-menu');
  if(!hb || !menu) return;
  hb.addEventListener('click', ()=>{
    const hidden = menu.classList.toggle('hidden');
    hb.setAttribute('aria-expanded', String(!hidden));
  });
}

// ===== Día y rutina de hoy =====
function renderHoy(){
  const now = new Date();
  const dia = dias[now.getDay()];
  $('#dia-actual').textContent = dia;
  $('#rutina-dia').textContent = rutinas[dia];
  $('#semana-resumen').textContent = 'Fuerza x3 · Cardio x1 · Core x1';
}

// ===== Rutina semanal =====
function renderRutina(){
  const ul = $('#rutina-semanal'); ul.innerHTML = '';
  const today = dias[new Date().getDay()];
  Object.keys(rutinas).forEach(dia=>{
    const li = document.createElement('li');
    li.innerHTML = (dia===today? `<strong>${dia}</strong>` : dia) + `: ${rutinas[dia]}`;
    ul.appendChild(li);
  });
}

