(function(){
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

  // split titles into words for scroll-scrubbed reveal
  document.querySelectorAll('[data-split]').forEach(function(t){
    t.innerHTML=t.textContent.split(' ').map(function(w){return '<span class="w">'+w+'</span>'}).join(' ');
  });

  // reveal on enter
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.25});
  document.querySelectorAll('.reveal,.tl-item').forEach(function(el){io.observe(el)});

  // starfield: 3 depth layers that drift at different speeds with scroll
  var cv=document.getElementById('stars'),ctx=cv.getContext('2d'),W,H,stars=[],shoot=null;
  function size(){W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight;
    stars=[];for(var i=0;i<220;i++){var d=Math.random();stars.push({x:Math.random()*W,y:Math.random()*H,d:d<.6?1:d<.9?2:3,r:Math.random()*1.2+.3,p:Math.random()*6})}}
  size();addEventListener('resize',size);

  var cosmos=document.getElementById('cosmos'),fill=document.getElementById('tl-fill'),
      tl=document.querySelector('.timeline'),bar=document.getElementById('progress'),
      titles=[].slice.call(document.querySelectorAll('.cs-title')),
      cards=[].slice.call(document.querySelectorAll('.pj'));

  function frame(t){
    var y=scrollY,vh=innerHeight;
    // page progress bar
    bar.style.transform='scaleX('+clamp(y/(document.documentElement.scrollHeight-vh),0,1)+')';
    // stars
    ctx.clearRect(0,0,W,H);
    var off=y-cosmos.offsetTop;
    stars.forEach(function(s){
      var yy=((s.y-off*s.d*.12)%H+H)%H;
      ctx.globalAlpha=.4+.6*Math.abs(Math.sin(t/1200+s.p));
      ctx.fillStyle=s.d===3?'#bff':'#fff';
      ctx.beginPath();ctx.arc(s.x,yy,s.r*s.d*.6,0,6.3);ctx.fill();
    });
    // occasional shooting star
    if(!shoot&&Math.random()<.004)shoot={x:Math.random()*W,y:0,l:0};
    if(shoot){shoot.x+=14;shoot.y+=7;shoot.l++;ctx.globalAlpha=1-shoot.l/50;
      ctx.strokeStyle='#4fe3e0';ctx.lineWidth=2;ctx.beginPath();
      ctx.moveTo(shoot.x,shoot.y);ctx.lineTo(shoot.x-90,shoot.y-45);ctx.stroke();
      if(shoot.l>50)shoot=null}
    // title words scrub in as they travel up the screen
    titles.forEach(function(el){
      var r=el.getBoundingClientRect(),p=clamp((vh*.95-r.top)/(vh*.45),0,1);
      [].forEach.call(el.children,function(w,i){
        var q=clamp(p*1.6-i*.25,0,1);
        w.style.opacity=q;w.style.transform='translateY('+(1-q)*60+'px) scale('+(.9+.1*q)+')';
        w.style.filter='blur('+(1-q)*10+'px)';
      });
    });
    // timeline line fills with scroll
    var tr=tl.getBoundingClientRect();
    fill.style.height=clamp((vh*.6-tr.top)/tr.height,0,1)*100+'%';
    // project cards drift at different speeds (parallax depth)
    cards.forEach(function(c){
      var r=c.parentNode.getBoundingClientRect(),m=(r.top+r.height/2-vh/2);
      c.style.transform='translateY('+(m*parseFloat(c.dataset.speed)*-2).toFixed(1)+'px)';
    });
    if(!reduce)requestAnimationFrame(frame);
  }
  if(reduce){addEventListener('scroll',function(){frame(0)});frame(0)}else requestAnimationFrame(frame);
})();

// nav gets a solid background after leaving the top of the page
(function(){
  var nav=document.querySelector('.navbar-fixed-top');
  if(!nav)return;
  function check(){nav.classList.toggle('nav-solid',scrollY>40)}
  addEventListener('scroll',check,{passive:true});check();
})();

// mobile menu toggle (own handler so it works whether or not the bundle's collapse JS is present)
(function(){
  var nav=document.querySelector('.navbar-fixed-top'),btn=document.querySelector('.navbar-toggle');
  if(!nav||!btn)return;
  function set(open){nav.classList.toggle('nav-open',open);btn.setAttribute('aria-expanded',open)}
  btn.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();set(!nav.classList.contains('nav-open'))});
  nav.querySelectorAll('.navbar-nav a').forEach(function(a){a.addEventListener('click',function(){set(false)})});
  document.addEventListener('click',function(e){if(!nav.contains(e.target))set(false)});
  addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
  addEventListener('resize',function(){if(innerWidth>767)set(false)});
})();
