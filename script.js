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



// ===== Control =====
function renderHistorial(){
  const wrap = $('#historial');
  const series = state.series;
  if(series.length===0){ wrap.innerHTML = '<p class="muted">Todavía no hay registros.</p>'; return; }
  const rows = series.map(s=><tr><td>${s.fecha}</td><td>${s.valor} kg</td><td>${state.kcal[s.fecha] ?? '-'}</td></tr>).join('');
  wrap.innerHTML = <div class="table"><table><thead><tr><th scope="col">Fecha</th><th scope="col">Peso</th><th scope="col">Calorías</th></tr></thead><tbody>${rows}</tbody></table></div>;
}
function bindControl(){
  $('#form-control').addEventListener('submit', (e)=>{
    e.preventDefault();
    const peso = Number($('#peso').value);
    const kcal = $('#kcal').value ? Number($('#kcal').value) : null;
    if(!peso || peso<=0) return;

    const today = new Date().toISOString().slice(0,10);
    state.peso = peso;
    const cleaned = state.series.filter(s=>s.fecha!==today);
    state.series = [...cleaned, {fecha: today, valor: peso}].sort((a,b)=> a.fecha.localeCompare(b.fecha));
    const k = state.kcal; if(kcal!==null) { k[today] = kcal; state.kcal = k; }
    const lastDay = localStorage.getItem('lastCheck') || '';
    if(lastDay !== today){ state.racha = (state.racha||0)+1; localStorage.setItem('lastCheck', today); }

    showToast('Guardado ✔');
    $('#peso-actual').textContent = peso;
    $('#racha').textContent = state.racha;
    renderHistorial();
    $('#peso').value = ''; $('#kcal').value='';
    setActive('inicio');
  });
  $('#btn-reset').addEventListener('click', ()=>{
    if(confirm('¿Seguro que querés borrar el historial?')){
      state.series = []; state.kcal = {}; state.racha = 0; localStorage.removeItem('lastCheck');
      $('#peso-actual').textContent = '—'; $('#racha').textContent = '0';
      renderHistorial();
      showToast('Historial borrado 🗑');
    }
  });
}


// ===== Onboarding =====
function needsOnboarding(){
  try{
    const p = JSON.parse(localStorage.getItem('perfil')||'null');
    return !p || !p.alturaCm || !state.peso;
  }catch{ return true }
}
function openOnboarding(){ $('#onboarding').classList.remove('hidden'); }
function closeOnboarding(){ $('#onboarding').classList.add('hidden'); }
function bindOnboarding(){
  $('#onb-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const nombre   = $('#onb-nombre').value.trim();
    const altura   = Number($('#onb-altura').value);
    const peso     = Number($('#onb-peso').value);
    const objetivo = $('#onb-objetivo').value;
    if(!altura || !peso) return;

    const today = new Date().toISOString().slice(0,10);
    localStorage.setItem('perfil', JSON.stringify({ nombre, alturaCm: altura, objetivo }));
    state.peso = peso;
    state.series = [{ fecha: today, valor: peso }];
    localStorage.setItem('lastCheck', today);
    state.racha = 1;

    renderHoy();
    $('#peso-actual').textContent = peso;
    $('#racha').textContent = state.racha;
    renderHistorial();
    closeOnboarding();
    showToast('Listo, ¡a meterle! 💪');
  });
}

// ===== Toast =====
function showToast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(()=> t.classList.add('hidden'), 1800);
}

// ===== Init =====
function init(){
  bindNav();
  bindHamburger();
  bindControl();
  bindOnboarding();

  renderHoy();
  renderRutina();
  renderHistorial();

  if(state.peso) $('#peso-actual').textContent = state.peso;
  $('#racha').textContent = state.racha;

  if(needsOnboarding()){ openOnboarding(); }

  const hash = (location.hash||'').replace('#','');
  if(hash && $('#'+hash)) setActive(hash);
}
document.addEventListener('DOMContentLoaded', init);