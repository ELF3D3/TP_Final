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
    li.textContent = `${dia}: ${rutinas[dia]}`;
    ul.appendChild(li);
  });
}

// ===== Control: guardar peso/kcal y render historial =====
function renderHistorial(){
  const wrap = $('#historial');
  const series = state.series;
  if(series.length===0){ wrap.innerHTML = '<p class="muted">Todavía no hay registros.</p>'; return; }
  const rows = series.map(s=>`<tr><td>${s.fecha}</td><td>${s.valor} kg</td><td>${state.kcal[s.fecha] ?? '-'}</td></tr>`).join('');
  wrap.innerHTML = `<div class="table"><table><thead><tr><th>Fecha</th><th>Peso</th><th>Calorías</th></tr></thead><tbody>${rows}</tbody></table></div>`;
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

    showToast('Guardado ✔️');
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
      showToast('Historial borrado 🗑️');
    }
  });
}

// ===== Chart SVG =====
function renderChart(){
  const mount = $('#chart'); mount.innerHTML = '';
  const data = state.series;
  if(data.length<2){
    mount.innerHTML = '<p class="muted">Cargá al menos 2 registros para ver la curva.</p>';
    return;
  }
  const W = mount.clientWidth || 480, H = mount.clientHeight || 220;
  const pad = 28;
  const xs = data.map((d,i)=>i);
  const ys = data.map(d=>d.valor);
  const minY = Math.min(...ys)*0.98, maxY = Math.max(...ys)*1.02;
  const scaleX = i => pad + (i/(xs.length-1))*(W-2*pad);
  const scaleY = y => H - pad - ((y - minY)/(maxY - minY))*(H-2*pad);

  let d = '';
  xs.forEach((x,i)=>{
    const X = scaleX(x), Y = scaleY(ys[i]);
    d += (i===0?`M ${X},${Y}`:` L ${X},${Y}`);
  });

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const grid = document.createElementNS(svgNS, 'g'); grid.setAttribute('stroke', '#00000015');
  for(let i=0;i<5;i++){
    const y = pad + i*((H-2*pad)/4);
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', pad); line.setAttribute('x2', W-pad);
    line.setAttribute('y1', y); line.setAttribute('y2', y);
    grid.appendChild(line);
  }
  svg.appendChild(grid);

  const area = document.createElementNS(svgNS, 'path');
  area.setAttribute('d', d + ` L ${scaleX(xs.at(-1))},${H-pad} L ${scaleX(xs[0])},${H-pad} Z`);
  area.setAttribute('fill', '#22c55e33');
  svg.appendChild(area);

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#16a34a');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('stroke-linecap','round');
  svg.appendChild(path);

  xs.forEach((x,i)=>{
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', scaleX(x));
    dot.setAttribute('cy', scaleY(ys[i]));
    dot.setAttribute('r', 4);
    dot.setAttribute('fill', '#14532d');
    svg.appendChild(dot);
  });

  mount.appendChild(svg);
}

// ===== Toast =====
function showToast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(()=> t.classList.add('hidden'), 1800);
}

// ===== Tienda =====
function renderProductos(){
  const grid = $('#products'); grid.innerHTML='';
  productos.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img class="prod-img" src="${p.img}" alt="${p.nombre}" onerror="this.style.background='linear-gradient(135deg,#22c55e33,#14532d33)'; this.removeAttribute('src');">
      <h3 style="margin:.6rem 0 .2rem">${p.nombre}</h3>
      <div class="price">${formatMoney(p.precio)}</div>
      <small class="muted">Envío a todo el país</small>
    `;
    card.addEventListener('click', ()=> openModal(p));
    grid.appendChild(card);
  });
}

function openModal(prod){
  const root = document.getElementById('modal-root');
  const content = document.getElementById('modal-content');
  document.getElementById('modal-title').textContent = prod.nombre;

  const images = (prod.imgs && prod.imgs.length) ? prod.imgs
               : (prod.img ? [prod.img] : []);

  content.innerHTML = `
    <div class="modal-grid">
      <div class="modal-visual">
        <img id="modal-main" class="prod-img" referrerpolicy="no-referrer"
             src="${images[0] || ''}" alt="${prod.nombre}"
             loading="eager" decoding="async"
             onerror="this.style.background='linear-gradient(135deg,#22c55e33,#14532d33)'; this.removeAttribute('src');">
        <div class="thumbs">
          ${images.map((src, i) => `
            <img class="thumb ${i===0 ? 'active' : ''}" referrerpolicy="no-referrer"
                 data-src="${src}" alt="Vista ${i+1}" loading="lazy" decoding="async">
          `).join('')}
        </div>
      </div>
      <div class="modal-info">
        <p>${prod.desc || ''}</p>
        <p class="price" style="margin:.5rem 0">${formatMoney(prod.precio)}</p>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn shimmer" onclick="showToast('Agregado al carrito 🛒')">Agregar al carrito</button>
          <button class="btn ghost" onclick="showToast('Compra rápida no disponible en demo')">Comprar ahora</button>
        </div>
      </div>
    </div>
  `;

  // Miniaturas
  const main = content.querySelector('#modal-main');
  content.querySelectorAll('.thumb').forEach(thumb => {
    thumb.src = thumb.dataset.src;
    thumb.onerror = function(){
      this.style.background='linear-gradient(135deg,#22c55e33,#14532d33)';
      this.removeAttribute('src');
    };
    thumb.addEventListener('click', () => {
      main.src = thumb.dataset.src;
      content.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Abrir modal + bloquear scroll de fondo + foco
  root.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const modalEl = root.querySelector('.modal');
  if (modalEl) {
    modalEl.setAttribute('tabindex','-1');
    modalEl.focus();
  }

  // Cerrar con ESC
  document.addEventListener('keydown', handleEscClose);
}

function closeModal(){
  const root = document.getElementById('modal-root');
  root.classList.add('hidden');
  document.body.style.overflow = ''; // restaurar scroll
  document.removeEventListener('keydown', handleEscClose);
}

function handleEscClose(e){
  if(e.key === 'Escape') closeModal();
}

function bindModal(){
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-root').addEventListener('click', (e)=>{
    if(e.target.id === 'modal-root') closeModal();
  });
}

// ===== Init =====
function init(){
  bindNav();
  bindHamburger();
  bindControl();
  bindModal();
  bindOnboarding();

  renderHoy();
  renderRutina();
  renderHistorial();
  renderProductos();

  if(state.peso) $('#peso-actual').textContent = state.peso;
  $('#racha').textContent = state.racha;
  renderChart();

  // Onboarding gate
  if(needsOnboarding()){
    openOnboarding();
  } else {
    try{
      const p = JSON.parse(localStorage.getItem('perfil')||'null');
      if(p && p.nombre){
        const h2 = document.querySelector('#inicio h2');
        const imc = calcIMC(state.peso, p.alturaCm);
        h2.innerHTML = `Hola ${p.nombre}, tu día, tu progreso (tranqui, vamos paso a paso)`;
        if(imc){ document.getElementById('semana-resumen').textContent = `IMC aprox: ${imc}`; }
      }
    }catch{}
  }

  const hash = (location.hash||'').replace('#','');
  if(hash && $('#'+hash)) setActive(hash);
}
document.addEventListener('DOMContentLoaded', init);
