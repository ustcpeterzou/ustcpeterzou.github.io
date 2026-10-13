(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const {clamp, response, interval, schedule} = SaleModels;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = {ink:'#182324', gray:'#697475', teal:'#087f79', red:'#c84932', blue:'#235f8b', line:'#dce3e2'};
  const macros = {
    '\\x':'\\mathbf x', '\\tht':'\\boldsymbol\\theta', '\\bet':'\\boldsymbol\\beta',
    '\\gam':'\\boldsymbol\\gamma', '\\A':'\\mathbf A', '\\V':'\\mathrm V', '\\R':'\\mathrm R',
    '\\E':'\\mathbb E', '\\Prob':'\\mathbb P', '\\Reg':'\\operatorname{Regret}',
    '\\Unif':'\\operatorname{Unif}', '\\clip':'\\operatorname{clip}_{[0,B]}',
    '\\argmin':'\\operatorname*{arg\\,min}', '\\argmax':'\\operatorname*{arg\\,max}'
  };
  const mathOptions = {throwOnError:true, macros, strict:'ignore', trust:false};
  const errors = [];
  const deck = $('deck');
  deck.innerHTML = SLIDES.map((s, i) => `<section class="slide ${s.cls}" id="${s.id}" data-slide="${i}" aria-label="${s.title.replace(/<[^>]*>/g,' ')}"><div class="slide-header"><div class="eyebrow">${s.section}</div><${i ? 'h2' : 'h1'}>${s.title}</${i ? 'h2' : 'h1'}></div><div class="slide-body">${s.body}</div></section>`).join('');
  const elements = [...deck.children];
  // Multi-line equation groups may carry more than one manuscript label.
  document.querySelectorAll('.equation[id]').forEach(node => {
    (RESEARCH.equations[node.id]?.labels || []).filter(id => id !== node.id).forEach(id => {
      if (!$(id)) {const anchor = document.createElement('span'); anchor.id = id; node.prepend(anchor);}
    });
  });
  function typeset(root) {
    root.querySelectorAll('.math').forEach(el => {
      if (el.dataset.rendered) return;
      try { katex.render(el.textContent, el, {...mathOptions, displayMode:el.classList.contains('display')}); el.dataset.rendered = 'true'; }
      catch (e) { errors.push({tex:el.textContent,error:e.message}); el.classList.add('math-error'); console.error(e.message); }
    });
    renderMathInElement(root, {...mathOptions, delimiters:[{left:'\\(',right:'\\)',display:false}], ignoredClasses:['math','katex']});
  }
  typeset(deck);
  document.querySelectorAll('.feature-dictionary').forEach(el => el.innerHTML = '<i></i>'.repeat(60));
  $('outline-items').innerHTML = SLIDES.map((s,i) => `<button data-goto="${i}"><span>${String(i+1).padStart(2,'0')}</span>${s.title.replaceAll('<br>',' ').replace(/<[^>]*>/g,'')}</button>`).join('');
  lucide.createIcons();

  let current = 0, cycleStage = 0, cycleTimer = null, coverFrame = null;
  let sample = null, randomState = 2971;
  const nice = (x,d=2) => Number(x).toFixed(d);
  const get = id => Number($(id).value);
  function seededUniform() {randomState = (1664525*randomState+1013904223)>>>0; return randomState/4294967296;}
  function closeDialogs() {document.querySelectorAll('dialog[open]').forEach(d => d.close());}
  function go(index, anchor = '') {
    index = clamp(index,0,SLIDES.length-1);
    elements[current].classList.remove('active');
    elements[current].setAttribute('aria-hidden','true');
    current = index;
    const el = elements[index];
    el.classList.add('active'); el.removeAttribute('aria-hidden');
    $('section-name').textContent = SLIDES[index].section;
    $('page-number').textContent = `${String(index+1).padStart(2,'0')} / ${SLIDES.length}`;
    $('progress-fill').style.width = `${(index+1)/SLIDES.length*100}%`;
    $('previous').disabled = index===0; $('next').disabled = index===SLIDES.length-1;
    document.querySelectorAll('[data-goto]').forEach(n => n.classList.toggle('active',Number(n.dataset.goto)===index));
    history.replaceState(null,'','#'+(anchor||SLIDES[index].id));
    if (SLIDES[index].id !== 'cycle') stopCycle();
    if (coverFrame) cancelAnimationFrame(coverFrame);
    el.scrollTop = 0;
    requestAnimationFrame(() => {
      drawActive();
      if (anchor) {
        const target = $(anchor);
        const details = target?.closest('details');
        if (details) details.open = true;
        target?.scrollIntoView({block:'nearest',behavior:reduceMotion?'instant':'smooth'});
      }
    });
  }
  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = $(id);
    const slide = target?.closest('.slide');
    go(slide ? Number(slide.dataset.slide) : 0, slide && target!==slide ? id : '');
  }
  $('previous').addEventListener('click',()=>go(current-1));
  $('next').addEventListener('click',()=>go(current+1));
  $('outline-open').addEventListener('click',()=>{ $('outline').showModal(); $('outline-items').querySelector('.active')?.scrollIntoView({block:'center'}); });
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  document.addEventListener('click', e => {
    const jump = e.target.closest('[data-goto]');
    if (jump) {closeDialogs();go(Number(jump.dataset.goto));}
    const link = e.target.closest('a[href^="#"]');
    if (link) {
      const id = link.getAttribute('href').slice(1), target=$(id), slide=target?.closest('.slide');
      if (slide) {e.preventDefault();go(Number(slide.dataset.slide),target!==slide?id:'');}
    }
    const fig = e.target.closest('[data-image]');
    if(fig){$('enlarged-figure').src=fig.dataset.image;$('enlarged-figure').alt=fig.dataset.title||'Research figure';$('image-title').textContent=fig.dataset.title||'Research figure';$('image-viewer').showModal();}
  });
  window.addEventListener('hashchange',route);
  async function fullscreen() {
    try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch(e){ console.warn('Fullscreen unavailable in this browser.',e); }
  }
  $('fullscreen').addEventListener('click',fullscreen);
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').innerHTML=`<i data-lucide="${document.fullscreenElement?'minimize':'maximize'}"></i>`;lucide.createIcons();drawActive();});
  $('print').addEventListener('click',()=>window.print());
  document.addEventListener('keydown', e=>{
    if(document.querySelector('dialog[open]') || e.target.closest('input,select,textarea,[role="tab"]'))return;
    if(e.code==='Space' && e.target.closest('button,summary,a'))return;
    if(e.code==='ArrowRight'||e.code==='PageDown'||e.code==='Space'){e.preventDefault();go(current+1);}
    if(e.code==='ArrowLeft'||e.code==='PageUp'){e.preventDefault();go(current-1);}
    if(e.code==='Home'){e.preventDefault();go(0);}
    if(e.code==='End'){e.preventDefault();go(SLIDES.length-1);}
    if(e.code==='KeyF'){e.preventDefault();fullscreen();}
    if(e.code==='KeyO'){e.preventDefault();$('outline-open').click();}
  });
  let touchStart = null;
  deck.addEventListener('touchstart',e=>{if(!e.target.closest('input,button,canvas,select,.math,details'))touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};else touchStart=null;},{passive:true});
  deck.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>90&&Math.abs(dx)>Math.abs(dy)*1.8)go(current+(dx<0?1:-1));touchStart=null;},{passive:true});

  function context(id) {
    const canvas=$(id), rect=canvas.getBoundingClientRect();
    if(rect.width<1||rect.height<1)return null;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,rect.width,rect.height);
    ctx.plotFontAdd=Number(getComputedStyle(canvas).getPropertyValue('--plot-font-add'));
    ctx.font=`${12+ctx.plotFontAdd}px Arial`;ctx.fillStyle=colors.ink;ctx.lineCap='round';
    return {ctx,w:rect.width,h:rect.height};
  }
  function line(ctx,x1,y1,x2,y2,color=colors.line,width=1,dash=[]) {ctx.beginPath();ctx.setLineDash(dash);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);}
  function label(ctx,text,x,y,color=colors.gray,align='left',size=12){ctx.fillStyle=color;ctx.textAlign=align;ctx.font=`${size+ctx.plotFontAdd}px Arial`;ctx.fillText(text,x,y);}
  function dot(ctx,x,y,color,r=4){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function path(ctx,points,color,width=2.5){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function drawResponse(){
    const result=context('response-canvas');if(!result)return;
    const {ctx,w,h}=result,A=get('cost-a'),q=get('reported-q'),r=response(A,q);
    $('cost-a-value').textContent=nice(A,1);$('reported-q-value').textContent=nice(q);
    $('best-report').textContent=nice(r.optimal);$('report-change').textContent=nice(1-r.optimal);
    const box={l:43,r:w-16,t:19,b:h-36};
    const xx=x=>box.l+(x+1)/3*(box.r-box.l);
    // Cost uses the same vertical scale. The full curve is never silently truncated.
    const y2=y=>box.b-y/26*(box.b-box.t);
    [0,5,10,15,20,25].forEach(y=>{line(ctx,box.l,y2(y),box.r,y2(y));label(ctx,String(y),box.l-9,y2(y)+4,colors.gray,'right',10);});
    [-1,0,1,2].forEach(x=>label(ctx,String(x),xx(x),box.b+18,colors.gray,'center',10));
    label(ctx,'Reported feature',box.r,box.b+33,colors.gray,'right',11);
    for(const [key,color] of [['anticipated',colors.teal],['manipulation',colors.red],['total',colors.ink]]){
      path(ctx,Array.from({length:181},(_,i)=>{const x=-1+i/60;return[xx(x),y2(response(A,x)[key])];}),color,key==='total'?3:2);
    }
    line(ctx,xx(1),box.t,xx(1),box.b,colors.line,1,[4,5]);
    const best=response(A,r.optimal);line(ctx,xx(r.optimal),y2(best.total),xx(r.optimal),box.b,colors.teal,1.5,[4,4]);
    dot(ctx,xx(r.optimal),y2(best.total),colors.teal,5);
    dot(ctx,xx(q),y2(r.total),colors.ink,6);dot(ctx,xx(q),y2(r.total),'#fff',2.5);
    label(ctx,`Total ${nice(r.total,1)}`,clamp(xx(q),box.l+48,box.r-44),y2(r.total)-13,colors.ink,'center',11);
    label(ctx,'Truthful',xx(1),box.t-4,colors.gray,'center',10);
  }
  ['cost-a','reported-q'].forEach(id=>$(id).addEventListener('input',drawResponse));
  $('optimal-report').addEventListener('click',()=>{$('reported-q').value=String(response(get('cost-a'),0).optimal);drawResponse();});
  let dragging=false;
  function dragReport(e){const c=$('response-canvas'),r=c.getBoundingClientRect();$('reported-q').value=String(clamp(-1+3*(e.clientX-r.left-43)/(r.width-59),-1,2));drawResponse();}
  $('response-canvas').addEventListener('pointerdown',e=>{dragging=true;$('response-canvas').setPointerCapture(e.pointerId);dragReport(e);});
  $('response-canvas').addEventListener('pointermove',e=>{if(dragging)dragReport(e);});
  $('response-canvas').addEventListener('pointerup',()=>dragging=false);
  $('response-canvas').addEventListener('pointercancel',()=>dragging=false);

  function drawInterval(){
    const result=context('interval-canvas');if(!result)return;
    const {ctx,w,h}=result,x=get('verified-x'),error=get('uncertainty'),r=interval(x,error);
    ['verified-x','current-report','uncertainty'].forEach(id=>$(id+'-value').textContent=nice(get(id),id==='uncertainty'?1:2));
    $('interval-bounds').textContent=`[${nice(r.lower,1)}, ${nice(r.upper,1)}]`;
    $('interval-width').textContent=nice(r.width,1);
    const left=35,right=w-24,xx=p=>left+p/100*(right-left);
    const rows=[h*.2,h*.49,h*.77];
    [0,20,40,60,80,100].forEach(p=>{line(ctx,xx(p),16,xx(p),h-28,'#eef2f1');label(ctx,String(p),xx(p),h-8,colors.gray,'center',10);});
    label(ctx,'Blind ETC',left,rows[0]-17,colors.gray,'left',12);
    line(ctx,left,rows[0],right,rows[0],'#ced6d5',14);
    label(ctx,'SALE',left,rows[1]-24,colors.teal,'left',12);
    line(ctx,xx(r.lower),rows[1],xx(r.upper),rows[1],'#dce7ed',24);
    line(ctx,xx(r.center-13),rows[1],xx(r.center+13),rows[1],'#bedfd6',24);
    line(ctx,xx(r.center-8),rows[1],xx(r.center+8),rows[1],'#eac1b1',24);
    line(ctx,xx(r.center),rows[1]-18,xx(r.center),rows[1]+18,colors.teal,2.5);
    label(ctx,nice(r.lower,1),xx(r.lower),rows[1]+35,colors.teal,'center',11);
    label(ctx,nice(r.upper,1),xx(r.upper),rows[1]+35,colors.teal,'center',11);
    label(ctx,'Feasible valuations',left,rows[2]-14,colors.gray,'left',11);
    line(ctx,xx(r.feasibleLower),rows[2],xx(r.feasibleUpper),rows[2],colors.teal,3);
    if(sample!==null){const p=r.lower+sample*r.width;dot(ctx,xx(p),rows[1],colors.ink,5);$('sampled-price').textContent=nice(p,2);}
  }
  ['verified-x','current-report','uncertainty'].forEach(id=>$(id).addEventListener('input',drawInterval));
  $('draw-price').addEventListener('click',()=>{sample=seededUniform();drawInterval();});
  function drawSchedule(){
    const result=context('schedule-canvas');if(!result)return;
    const {ctx,w,h}=result,width=get('schedule-width'),m=get('smoothness'),r=schedule(width,m);
    $('schedule-width-value').textContent=nice(width);$('sale-duration').textContent=r.sale.toLocaleString('en-US');$('blind-duration').textContent=r.blind.toLocaleString('en-US');$('width-gain').textContent=nice(r.gain,3);
    const l=30,right=w-20,len=right-l;
    [['Global-width exploration',r.blind,h*.32,colors.gray],['SALE',r.sale,h*.67,colors.teal]].forEach(([name,a,y,color])=>{
      label(ctx,name,l,y-25,color,'left',13);ctx.fillStyle='#edf1f0';ctx.fillRect(l,y,len,21);ctx.fillStyle=color;ctx.fillRect(l,y,len*a/r.ell,21);line(ctx,l+len*a/r.ell,y-4,l+len*a/r.ell,y+25,color,1);
    });
    label(ctx,'Exploration',l,h-11,colors.teal,'left',11);label(ctx,'Exploitation',right,h-11,colors.gray,'right',11);label(ctx,'20,000 periods',right,18,colors.gray,'right',11);
  }
  $('schedule-width').addEventListener('input',drawSchedule);$('smoothness').addEventListener('change',drawSchedule);

  const stages=[
    ['Personalized exploration',`<p>Use the intervals constructed before the episode. Draw uniform prices using the current verified features and collect binary purchase feedback.</p>`],
    ['Sparse and nonparametric learning',`<p>The exploration observations estimate the sparse valuation parameter, the unknown pricing function and its derivative.</p>`],
    ['Calibrated exploitation',`<p>Use the current verified and reported features to correct for strategic manipulation and post the exploitation price.</p>`],
    ['The next episode',`<p>Use the updated sparse estimate and its confidence allowance to construct the next exploration intervals. Their widths determine the next exploration duration.</p>`]
  ];
  const cycleFigure=document.querySelector('.cycle-figure');
  const cycleFocus=document.createElement('span');cycleFocus.className='cycle-focus';cycleFocus.setAttribute('aria-hidden','true');cycleFigure.append(cycleFocus);
  function focusCycle(){
    const image=cycleFigure.querySelector('img'),r=image.getBoundingClientRect(),parent=cycleFigure.getBoundingClientRect();
    const [x,y,w,h,color]=[[.173,.43,.100,.23,colors.blue],[.287,.43,.098,.23,colors.ink],[.400,.43,.099,.23,colors.red],[.539,.052,.136,.28,colors.teal]][cycleStage];
    Object.assign(cycleFocus.style,{left:(r.left-parent.left+x*r.width)+'px',top:(r.top-parent.top+y*r.height)+'px',width:w*r.width+'px',height:h*r.height+'px',borderColor:color});
  }
  function setStage(index){cycleStage=index%4;$('stage-heading').textContent=stages[cycleStage][0];$('stage-text').innerHTML=stages[cycleStage][1];document.querySelectorAll('[data-stage]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.stage)===cycleStage);b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===cycleStage));});$('cycle-episode').textContent=cycleStage===3?'Episode k + 1':'Episode k';focusCycle();}
  function stopCycle(){if(cycleTimer)clearInterval(cycleTimer);cycleTimer=null;$('cycle-play').innerHTML='<i data-lucide="play"></i>';$('cycle-play').title='Play cycle';$('cycle-play').setAttribute('aria-label','Play cycle');lucide.createIcons();}
  document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>{stopCycle();setStage(Number(b.dataset.stage));}));
  $('cycle-play').addEventListener('click',()=>{if(cycleTimer){stopCycle();return;}cycleTimer=setInterval(()=>setStage(cycleStage+1),2400);$('cycle-play').innerHTML='<i data-lucide="pause"></i>';$('cycle-play').title='Pause cycle';$('cycle-play').setAttribute('aria-label','Pause cycle');lucide.createIcons();});
  setStage(0);
  function drawCover(time=0){
    if(current!==0)return;
    const result=context('cover-canvas');if(!result)return;
    const {ctx,w,h}=result,l=20,right=w-20,top=35,bottom=h-25;
    const xx=p=>l+(right-l)*p;
    [0,.2,.4,.6,.8,1].forEach(p=>line(ctx,xx(p),top-5,xx(p),bottom,'#edf1ef'));
    label(ctx,'Buyer-independent pricing domain',l,19,colors.gray,'left',11);label(ctx,'0',l,bottom+19,colors.gray,'center',10);label(ctx,'B',right,bottom+19,colors.gray,'center',10);
    const n=4,gap=Math.max(18,(bottom-top)/n);
    for(let i=0;i<n;i++){
      const y=top+i*gap+7,c=.27+i*.15,a=.095+i*.009;
      line(ctx,l,y,right,y,'#eef2f0',5);line(ctx,xx(c-a),y,xx(c+a),y,i%2===0?'#78b8aa':'#abd0c4',11);
      const phase=reduceMotion?.5:(Math.sin(time*.0007+i*1.6)+1)/2;
      dot(ctx,xx(c-a+2*a*phase),y,colors.teal,3);
    }
    if(!reduceMotion)coverFrame=requestAnimationFrame(drawCover);
  }
  const experiments=[
    ['source_composition_selected','Source composition','Localization becomes pronounced when most candidate coordinates are verified.','d = 50, s0 = 6, B = 100, T = 204,600; 50 replications. Both active-support allocations are shown. Signal energy, verified signal share and manipulation strength are fixed.'],
    ['highdim_regret','High-dimensional strategic pricing','SALE-K has lower terminal regret in all three designs.','d = 300, 600, 1000; s0 = 6; B = 140; T = 819,000; 20 replications. RMLP-2 uses a standard-Gaussian pricing map. SALE need not dominate in early episodes.'],
    ['strategic_regret','Unknown manipulation cost','SALE-U has lower terminal regret at both two-visit rates.','d = 50, s0 = 6, B = 100, T = 204,600; 50 replications. Nominal two-visit rates differ from the effective matched-record rate in the theory.'],
    ['noise_shape_comparison','Unknown market noise','The policies separate after longer exploitation phases.','d = 2, m = 3, B = 15, T = 819,000; 50 replications. The comparator replaces only the pricing map with a Gaussian working model.'],
    ['autoloan','AutoLoan semi-synthetic study','SALE-K ends below Blind ETC-K as personalized exploration becomes less costly.','B = $60,000, T = 819,000; 30 replications. dV = 64, dR = 2, s0 = 8. Held-out real loan features with semi-synthetic valuations, not field evidence.']
  ];
  function experiment(index){const [file,title,conclusion,setting]=experiments[index];$('experiments').classList.toggle('square-figure',index===0);$('experiment-img').src=`assets/${file}.png`;$('experiment-img').alt=title;$('experiment-image').dataset.image=`assets/${file}.png`;$('experiment-image').dataset.title=title;$('experiment-conclusion').textContent=conclusion;$('experiment-setting').textContent=setting;document.querySelectorAll('[data-experiment]').forEach(b=>{const active=Number(b.dataset.experiment)===index;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});}
  document.querySelectorAll('[data-experiment]').forEach(b=>{b.addEventListener('click',()=>experiment(Number(b.dataset.experiment)));b.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const i=e.key==='Home'?0:e.key==='End'?4:(Number(b.dataset.experiment)+(e.key==='ArrowRight'?1:4))%5;experiment(i);document.querySelector(`[data-experiment="${i}"]`).focus();}});});
  experiment(0);
  function drawActive(){if(current===0){if(coverFrame)cancelAnimationFrame(coverFrame);drawCover(performance.now());}if(SLIDES[current].id==='response')drawResponse();if(SLIDES[current].id==='localization')drawInterval();if(SLIDES[current].id==='width')drawSchedule();if(SLIDES[current].id==='cycle')focusCycle();}
  let resizeTimer;
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(drawActive,90);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopCycle();if(coverFrame)cancelAnimationFrame(coverFrame);}else drawActive();});
  let detailStates=[];
  window.addEventListener('beforeprint',()=>{if(coverFrame)cancelAnimationFrame(coverFrame);detailStates=[...document.querySelectorAll('details')].map(d=>[d,d.open]);detailStates.forEach(([d])=>d.open=true);drawResponse();drawInterval();drawSchedule();});
  window.addEventListener('afterprint',()=>{detailStates.forEach(([d,open])=>d.open=open);drawActive();});
  elements.forEach(el=>el.setAttribute('aria-hidden','true'));
  route();
  window.SALE_APP={go,errors,get current(){return current;},setStage,experiment,drawActive};
})();
