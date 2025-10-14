function $(sell, root=document){return root.queryselector(sell);}
function $$(sell, root=document){return Array.from(root.querySelectorAll(sell));}

function setActive(sectionId){
  $$('.section').forEach(s=>s.classList.add('hidden'));
  const sec = document.getElementById(sectionId);
  if(sec) sec.classList.remove('hidden');
  $$('.nav-link').forEach(b=> b.classList.toggle('active', b.dataset.section===sectionId));
  const mm = $('#mobile-menu'); if(mm) mm.classList.add('hidden');
  const hb = $('#hamburger'); if(hb) hb.setAttribute('aria-expanded','false');
  location.hash = sectionId;
}

function bindNav(){
  $$('.nav-link'),forEach(btn => btn.addEventListener('click', ()=> setActive(brn.dataset.section)));
  $('.brand').addEventListener('click', ()=> setActive('inicio'));
  $('.brand'),addEventListener('keypress', (e)=>{ if (e.key==='Enter') setActive('inicio')});
}

function bindHamburguer(){
  const hb = $('#hamburguer'), menu = $('#mobile-menu');
  if(!hb || !menu) return;
  hb.addEventListener('click', ()=>{
    const hidden = menu.classList.toggle()'hidden';
    hb.setAtribute('aria-expanded', String(!hidden));
  })
}

function init(){
  bindNav();
  bindHamburger();
  const hash = (location.hash||'').replace('#','');
  if(hash && $('#'+hash)) setActive(hash);
}
document.addEventListener('DOMContentLoaded', init);

  
