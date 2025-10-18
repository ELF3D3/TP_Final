// ===== Datos base y utilidades =====
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
const productos = [
  {
    id: 1,
    nombre: "Proteína Whey 900g",
    precio: 34999,
    img:  "https://http2.mlstatic.com/D_NQ_NP_752244-MLU78176633507_082024-O.webp",
    desc: "Blend premium para recuperación y crecimiento muscular."
  },
  {
    id: 2,
    nombre: "Creatina Monohidratada 300g",
    precio: 21999,
    img:  "https://starnutrition.com.ar/cdn/shop/files/CreatineM-300g.png?v=1718218487",
    desc: "Aumenta fuerza y rendimiento, micronizada."
  },
  {
    id: 3,
    nombre: "Omega 3 (90 caps)",
    precio: 18999,
    img:  "https://images.fravega.com/f300/6bc3ca2e618204da6b49ed319575e1e7.jpg.webp",
    desc: "Salud cardiovascular con alta concentración de EPA/DHA."
  },
  {
    id: 4,
    nombre: "Multivitamínico",
    precio: 14999,
    img:  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLm1bc0xEIny62xs2t3_Q_gU3FDSmtCcoz8A&s",
    desc: "Micronutrientes clave para energía y bienestar."
  },
  {
    id: 5,
    nombre: "Pre-entreno 300g",
    precio: 25999,
    img:  "https://http2.mlstatic.com/D_NQ_NP_970198-MLU70618916519_072023-O.webp",
    desc: "Energía limpia y foco para tus sesiones."
  },
  {
    id: 6,
    nombre: "BCAA 2:1:1 250g",
    precio: 19999,
    img:  "https://http2.mlstatic.com/D_NQ_NP_645063-MLA89439684365_082025-O.webp",
    desc: "Recuperación y menos fatiga durante el entrenamiento."
  },
  {
    id: 7,
    nombre: "Barritas proteicas x12",
    precio: 17999,
    img:  "https://acdn-us.mitiendanube.com/stores/002/268/228/products/1088-c740c1dfbac57e545d17377450073136-1024-1024.jpg",
    desc: "Snack rico en proteína, bajas en azúcar."
  },
  {
    id: 8,
    nombre: "Shaker Antifugas 700ml",
    precio: 7999,
    img:  "https://acdn-us.mitiendanube.com/stores/123/325/products/diapositiva1-28922278b42668aca117267917506990-1024-1024.jpg",
    desc: "Diseño ergonómico, libre de BPA."
  }
];

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const formatMoney = (n) => n.toLocaleString('es-AR', { style:'currency', currency:'ARS' });

// ===== Onboarding (perfil) =====
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
    renderChart();
    closeOnboarding();
    showToast('Listo, ¡a meterle! 💪');
  });
}
function calcIMC(peso, alturaCm){
  const m = alturaCm/100;
  if(!peso || !m) return null;
  const imc = peso/(m*m);
  return Math.round(imc*10)/10;
}
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

// ===== Navegación SPA =====
function setActive(sectionId){
  $$('.section').forEach(s=>s.classList.add('hidden'));
  $('#' + sectionId).classList.remove('hidden');
  $$('.nav-link').forEach(b=>b.classList.toggle('active', b.dataset.section===sectionId));
  const mm = $('#mobile-menu'); if(mm) mm.classList.add('hidden');
  const hb = $('#hamburger'); if(hb) hb.setAttribute('aria-expanded','false');
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

// ===== Menú móvil =====
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
  Object.keys(rutinas).forEach(dia=>{
    const li = document.createElement('li');
    li.textContent = ${dia}: ${rutinas[dia]};
    ul.appendChild(li);
  });
}

// ===== Control: guardar peso/kcal y render historial =====
function renderHistorial(){
  const wrap = $('#historial');
  const series = state.series;
  if(series.length===0){ wrap.innerHTML = '<p class="muted">Todavía no hay registros.</p>'; return; }
  const rows = series.map(s=><tr><td>${s.fecha}</td><td>${s.valor} kg</td><td>${state.kcal[s.fecha] ?? '-'}</td></tr>).join('');
  wrap.innerHTML = <div class="table"><table><thead><tr><th>Fecha</th><th>Peso</th><th>Calorías</th></tr></thead><tbody>${rows}</tbody></table></div>;
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
    renderChart();
    $('#peso').value = ''; $('#kcal').value='';
    setActive('inicio');
  });
  $('#btn-reset').addEventListener('click', ()=>{
    if(confirm('¿Seguro que querés borrar el historial?')){
      state.series = []; state.kcal = {}; state.racha = 0; localStorage.removeItem('lastCheck');
      $('#peso-actual').textContent = '—'; $('#racha').textContent = '0';
      renderHistorial(); renderChart();
      showToast('Historial borrado 🗑');
    }
  });
}

