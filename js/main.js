
// cubic-bezier(0.77, 0, 0.175, 1) film-like easing
function cubicBezier(p0, p1, p2, p3) {
  const cx = 3*p0, bx = 3*(p2 - p0) - cx, ax = 1 - cx - bx;
  const cy = 3*p1, by = 3*(p3 - p1) - cy, ay = 1 - cy - by;
  function sx(t){return ((ax*t + bx)*t + cx)*t;}
  function sy(t){return ((ay*t + by)*t + cy)*t;}
  function sdx(t){return (3*ax*t + 2*bx)*t + cx;}
  function solve(x, eps=1e-5){
    let t = x;
    for (let i=0;i<8;i++){
      const x2 = sx(t) - x; if (Math.abs(x2) < eps) return t;
      const d = sdx(t); if (Math.abs(d) < 1e-6) break;
      t -= x2/d;
    }
    let t0=0, t1=1; t=x;
    while (t0 < t1){
      const x2=sx(t); if (Math.abs(x2-x) < eps) break;
      if (x > x2) t0=t; else t1=t;
      t=(t0+t1)/2; if (Math.abs(t1-t0)<eps) break;
    }
    return t;
  }
  return x => sy(solve(x));
}
const filmEase = cubicBezier(0.77,0,0.175,1);

// Smooth anchor scroll + precise offsets
(function(){
  const links=document.querySelectorAll('header nav a[href^="#"]');
  const header=document.querySelector('header');
  const headerH=()=>header?header.getBoundingClientRect().height:0;
  const vh=()=>window.innerHeight||document.documentElement.clientHeight;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  function smoothScroll(toY){
    const startY=window.scrollY||document.documentElement.scrollTop;
    const distance=Math.abs(toY-startY);
    const dur=Math.max(900, Math.min(1500, 900 + (distance/1500)*600));
    const t0=performance.now();
    function step(now){
      const p=Math.min(1,(now-t0)/dur);
      const y=Math.round(startY+(toY-startY)*filmEase(p));
      window.scrollTo(0,y);
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  links.forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href'); if(!id||id==="#") return;
    const el=document.querySelector(id); if(!el) return;
    e.preventDefault();
    const rect=el.getBoundingClientRect();
    const absTop=(window.scrollY||document.documentElement.scrollTop)+rect.top;
    let top;
    if(id==="#hero"){
      top = absTop + (el.clientHeight - vh())/2 - headerH();
      top = clamp(top, 0, document.body.scrollHeight - vh());
    } else if(id==="#showreel"){
      const title = el.querySelector('.title') || el;
      const tRect=title.getBoundingClientRect();
      const tAbs=(window.scrollY||document.documentElement.scrollTop)+tRect.top;
      top = tAbs - headerH() - 8;
    } else {
      top = absTop - headerH() - 6;
    }
    smoothScroll(top);
  }, {passive:false}));
})();

// Blur overlay sync + parallax
(function(){
  const hero=document.getElementById('hero');
  const show=document.getElementById('showreel');
  const blur=document.querySelector('.bg-blur');
  const sharp=document.querySelector('.bg-sharp');
  if(!hero || !show || !blur || !sharp) return;

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  function update(){
    const h = hero.getBoundingClientRect();
    const s = show.getBoundingClientRect();
    const V = window.innerHeight || document.documentElement.clientHeight;
    const vis = r => clamp((V - Math.abs(r.top + r.height/2 - V/2))/V, 0, 1);
    const strength = Math.max(vis(h), vis(s));
    blur.style.opacity = (strength*0.95).toFixed(3);

    // subtle parallax on sharp background
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    sharp.style.transform = `translateY(${scrollY*0.03}px)`;
  }
  update();
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
})();

// Scrollspy underline
(function(){
  const sections=[
    {el:document.getElementById('home'), link:'[data-spy="home"]'},
    {el:document.getElementById('hero'), link:'[data-spy="ourworks"]'},
    {el:document.getElementById('showreel'), link:'[data-spy="showreel"]'},
    {el:document.getElementById('services'), link:'[data-spy="services"]'},
    {el:document.getElementById('contact'), link:'[data-spy="contact"]'}
  ].filter(x=>x.el);
  const links=[...document.querySelectorAll('nav a')];
  const setActive = sel => links.forEach(a => a.classList.toggle('active', a.matches(sel)));
  const ioOpts={threshold:[0.35,0.6,1]};
  sections.forEach(s=>{
    const io=new IntersectionObserver((ents)=>{
      ents.forEach(ent=>{ if(ent.isIntersecting && ent.intersectionRatio>0.35) setActive(s.link); });
    }, ioOpts);
    io.observe(s.el);
  });
  window.addEventListener('scroll', ()=>{ if(window.scrollY < 60) setActive('[data-spy="home"]'); }, {passive:true});
})();


// Parallax for services/contact background cover
(function(){
  const cover = document.querySelector('.stacked-bg .section-cover');
  if(!cover) return;
  function tick(){
    const y = window.scrollY || document.documentElement.scrollTop;
    cover.style.transform = `translateY(${(y*0.04).toFixed(2)}px)`;
  }
  tick();
  window.addEventListener('scroll', tick, {passive:true});
  window.addEventListener('resize', tick);
})();
