
function cubicBezier(p0,p1,p2,p3){const cx=3*p0,bx=3*(p2-p0)-cx,ax=1-cx-bx;const cy=3*p1,by=3*(p3-p1)-cy,ay=1-cy-by;function sx(t){return((ax*t+bx)*t+cx)*t}function sy(t){return((ay*t+by)*t+cy)*t}function sdx(t){return(3*ax*t+2*bx)*t+cx}function solve(x,eps=1e-5){let t=x;for(let i=0;i<8;i++){const x2=sx(t)-x;if(Math.abs(x2)<eps)return t;const d=sdx(t);if(Math.abs(d)<1e-6)break;t-=x2/d}let t0=0,t1=1;t=x;while(t0<t1){const x2=sx(t);if(Math.abs(x2-x)<eps)break;if(x>x2)t0=t;else t1=t;t=(t0+t1)/2;if(Math.abs(t1-t0)<eps)break}return t}return x=>sy(solve(x))}
const filmEase=cubicBezier(.77,0,.175,1);

// Smooth nav scroll
(function(){
  const links=document.querySelectorAll('header nav a[href^="#"]');
  const header=document.querySelector('header');
  const headerH=()=>header?header.getBoundingClientRect().height:0;
  const vh=()=>window.innerHeight||document.documentElement.clientHeight;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function smoothScroll(toY){
    const startY=window.scrollY||document.documentElement.scrollTop;
    const distance=Math.abs(toY-startY);
    const dur=Math.max(800,Math.min(1400,800+(distance/1500)*600));
    const t0=performance.now();
    function step(now){
      const p=Math.min(1,(now-t0)/dur);
      const y=Math.round(startY+(toY-startY)*filmEase(p));
      window.scrollTo(0,y);
      if(p<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  links.forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href');
    if(!id||id==="#")return;
    const el=document.querySelector(id);
    if(!el)return;
    e.preventDefault();
    const rect=el.getBoundingClientRect();
    const absTop=(window.scrollY||document.documentElement.scrollTop)+rect.top;
    let top;
    if(id==="#hero"){
      top=absTop+(el.clientHeight-vh())/2-headerH();
      top=clamp(top,0,document.body.scrollHeight-vh());
    }else if(id==="#showreel"){
      const title=el.querySelector('.title')||el;
      const tRect=title.getBoundingClientRect();
      const tAbs=(window.scrollY||document.documentElement.scrollTop)+tRect.top;
      top=tAbs-headerH()-8;
    }else if(id==="#contact"||id==="#services"){
      top=absTop-headerH()+2;
    }else{
      top=absTop-headerH()-6;
    }
    smoothScroll(top);
  }),{passive:false});
})();

// Active link spy
(function(){
  const sections=[
    {el:document.getElementById('home'),link:'[data-spy="home"]'},
    {el:document.getElementById('hero'),link:'[data-spy="ourworks"]'},
    {el:document.getElementById('showreel'),link:'[data-spy="showreel"]'},
    {el:document.getElementById('services'),link:'[data-spy="services"]'},
    {el:document.getElementById('contact'),link:'[data-spy="contact"]'}
  ].filter(x=>x.el);
  const links=[...document.querySelectorAll('nav a')];
  const setActive=sel=>links.forEach(a=>a.classList.toggle('active',a.matches(sel)));
  const ioOpts={threshold:[.35,.6,1]};
  sections.forEach(s=>{
    const io=new IntersectionObserver(ents=>{
      ents.forEach(ent=>{
        if(ent.isIntersecting&&ent.intersectionRatio>.35) setActive(s.link);
      })
    },ioOpts);
    io.observe(s.el);
  });
  window.addEventListener('scroll',()=>{ if(window.scrollY<60) setActive('[data-spy="home"]'); },{passive:true});
})();

// Blur toggle + hide background for services/contact
(function(){
  const body=document.body;
  const show=document.getElementById('showreel');
  const hero=document.getElementById('hero');
  const services=document.getElementById('services');
  const contact=document.getElementById('contact');
  const focusTargets=[show,hero].filter(Boolean);
  if(focusTargets.length){
    const ioBlur=new IntersectionObserver(ents=>{
      const any=ents.some(ent=>ent.isIntersecting&&ent.intersectionRatio>.5);
      if(any) body.classList.add('blur-on'); else body.classList.remove('blur-on');
    },{threshold:[0,.5,1]});
    focusTargets.forEach(t=>ioBlur.observe(t));
  }
  const hideTargets=[services,contact].filter(Boolean);
  if(hideTargets.length){
    const ioHide=new IntersectionObserver(ents=>{
      const any=ents.some(e=>e.isIntersecting&&e.intersectionRatio>.15);
      if(any) body.classList.add('bg-hidden'); else body.classList.remove('bg-hidden');
    },{threshold:[0,.15,.3]});
    hideTargets.forEach(t=>ioHide.observe(t));
  }
})();

// Lite YouTube
(function(){
  const holder=document.querySelector('[data-yid]');
  if(!holder) return;
  const vid=holder.getAttribute('data-yid');
  const poster=`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
  holder.style.backgroundImage=`url('${poster}')`;
  holder.addEventListener('click',()=>{
    const iframe=document.createElement('iframe');
    iframe.src=`https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`;
    iframe.title='YouTube video';
    iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    iframe.allowFullscreen=true;
    iframe.style.width='100%';iframe.style.height='100%';iframe.frameBorder='0';
    holder.replaceChildren(iframe);
  },{once:true});
})();

// Fixed logo shrink on scroll
(function(){
  const box=document.querySelector('.brand-fixed');
  if(!box) return;
  function toggle(){
    const y=window.scrollY||document.documentElement.scrollTop;
    if(y>80) box.classList.add('shrink'); else box.classList.remove('shrink');
  }
  toggle();
  window.addEventListener('scroll',toggle,{passive:true});
})();
