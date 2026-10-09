/* AKNO Copilot · scripts partagés (données d'exemple) */
const AK=(()=>{
const fr=new Intl.NumberFormat('fr-FR');
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const nb=s=>String(s).replace(/\s/g,'\u00a0');
const fmt=(v,dec=0)=>dec?v.toFixed(dec).replace('.',','):nb(fr.format(Math.round(v)));
const day=(y,m,d)=>new Date(y,m,d).toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
const page=document.body.dataset.page||'index';
const mq=matchMedia('(min-width:1024px)');
const PAGES=[['index','Accueil','home'],['trafic','Trafic','traffic'],['conversions','Conversions','target'],['seo','SEO','seo'],['performance','Performance','gauge'],['rapport','Rapport','doc']];
function nav(){const h=PAGES.map(([id,l,ic])=>`<a href="${id}.html" class="tab${id===page?' on':''}"${id===page?' aria-current="page"':''}><svg class="ico"><use href="#i-${ic}"/></svg>${l}</a>`).join('');$$('.tabs').forEach(n=>n.innerHTML=h)}

/* tuiles embossées : motif + tuile interrupteur différents par page */
const BM=['q4','','','q3','','q1','q2','','q2','','','q1','c','q3','','','','','q4','q2'];
const BD=['q4','','q3','c','','q1','q2','','c','q4','','q1','','','q2','','q3','q4','','','q2','','q4','q1','','c','','','q3','q1','','c','','q3','q2','','q1','','','q2','q3','','q1','','','q4','','q2','c',''];
const CFG={index:[0,7,0,12],trafic:[2,4,10,17],conversions:[5,11,20,22],seo:[9,4,30,27],performance:[13,11,5,22],rapport:[17,8,40,17]};
function tiles(){const el=$('#tiles');if(!el)return;const d=mq.matches,[rm,im,rd,id]=CFG[page]||CFG.index,b=d?BD:BM,r=d?rd:rm;
  const a=b.slice(r).concat(b.slice(0,r));a[d?id:im]='sw';
  el.innerHTML=a.map(p=>p==='sw'?'<div class="t sw"></div>':`<div class="t ${p}"></div>`).join('')}

function countUp(el){const to=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),suf=el.querySelector('small'),sh=suf?suf.outerHTML:'',t0=performance.now(),dur=1500;
  const step=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,4);el.innerHTML=fmt(to*e,dec)+sh;if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)}

function smooth(P){let d=`M${P[0][0]},${P[0][1]}`;
  for(let i=0;i<P.length-1;i++){const a=P[i-1]||P[i],b=P[i],c=P[i+1],e=P[i+2]||c;
    d+=` C${(b[0]+(c[0]-a[0])/6).toFixed(1)},${(b[1]+(c[1]-a[1])/6).toFixed(1)} ${(c[0]-(e[0]-b[0])/6).toFixed(1)},${(c[1]-(e[1]-b[1])/6).toFixed(1)} ${c[0]},${c[1]}`}
  return d}

/* courbe principale (SVG fait main) */
function chart(o){const W=600,H=200,{svg,box,tip,data,prev,labels,tipFmt=v=>fmt(v),invert}=o;
  const all=data.concat(prev||[]);let lo=Math.min(...all),hi=Math.max(...all),pd=(hi-lo)*.14||1;lo-=pd;hi+=pd;
  if(o.min!=null)lo=o.min;if(o.max!=null)hi=o.max;
  const X=(i,n)=>+(i*W/(n-1)).toFixed(1),Y=v=>{let f=(v-lo)/(hi-lo);if(invert)f=1-f;return +(H-10-f*(H-20)).toFixed(1)};
  const P=data.map((v,i)=>[X(i,data.length),Y(v)]),L=smooth(P);
  const g=[.25,.5,.75].map(f=>`<line class="gl" x1="0" x2="${W}" y1="${H*f}" y2="${H*f}" vector-effect="non-scaling-stroke"/>`).join('');
  svg.innerHTML=g+`<path class="area" d="${L} L${W},${H} L0,${H}Z" fill="url(#ar)"/>`+
    (prev?`<path class="line2" d="${smooth(prev.map((v,i)=>[X(i,prev.length),Y(v)]))}" vector-effect="non-scaling-stroke"/>`:'')+
    `<path class="line draw" d="${L}" vector-effect="non-scaling-stroke"/><line class="cur" x1="0" x2="0" y1="0" y2="${H}" stroke="rgba(255,255,255,.25)" stroke-width="1" vector-effect="non-scaling-stroke" opacity="0"/>`;
  const ml=$('.line',svg);ml.style.setProperty('--len',ml.getTotalLength()*1.6);
  box._c={P,data,labels,tipFmt,W,H};
  if(!box._b){box._b=1;
    box.addEventListener('pointermove',e=>{const c=box._c,r=box.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,i=Math.max(0,Math.min(c.data.length-1,Math.round(x*(c.data.length-1)))),pt=c.P[i],cur=$('.cur',svg);
      cur.setAttribute('x1',pt[0]);cur.setAttribute('x2',pt[0]);cur.setAttribute('opacity',1);
      tip.style.left=(pt[0]/c.W*100)+'%';tip.style.top=(pt[1]/c.H*svg.getBoundingClientRect().height-6)+'px';tip.style.opacity=1;
      tip.innerHTML=`<span>${c.labels[i]}</span>${c.tipFmt(c.data[i])}`});
    box.addEventListener('pointerleave',()=>{tip.style.opacity=0;const cur=$('.cur',svg);cur&&cur.setAttribute('opacity',0)})}
  return P}
function axis(el,labels,n=5){const k=labels.length-1;el.innerHTML=Array.from({length:n},(_,j)=>`<span>${labels[Math.round(j*k/(n-1))]}</span>`).join('')}

/* données trafic partagées (accueil + trafic) */
const raw=[28,31,26,34,37,33,29,35,40,38,42,36,33,41,45,43,39,47,50,46,44,49,53,51,48,55,58,54,52,60];
const v30=raw.map((x,i)=>i?x-1:x); /* total = 1 248 */
const p30=[25,27,24,28,30,29,26,30,31,30,33,31,29,32,34,33,31,35,36,34,33,36,38,37,35,39,40,38,37,41];
const m12=[612,640,598,702,756,830,884,951,867,930,1058,1248],pm12=[380,402,371,436,470,512,540,588,530,566,640,702];
const MON=['oct. 25','nov. 25','déc. 25','janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.'];
const pv=a=>a.map((x,i)=>Math.round(x*(3.02+.22*Math.sin(i*1.3))));
const T={
 '7':{v:v30.slice(23),p:v30.slice(16,23),l:Array.from({length:7},(_,i)=>day(2026,9,1+i)),min:30,max:66},
 '30':{v:v30,p:p30,l:v30.map((_,i)=>day(2026,8,8+i)),min:16,max:66},
 '12':{v:m12,p:pm12,l:MON,min:300,max:1340}};
Object.values(T).forEach(t=>{t.pv=pv(t.v);t.pp=pv(t.p)});

function reveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;el.classList.add('in');
  $$('[data-count]',el).forEach(countUp);$$('[data-w]',el).forEach(b=>b.style.width=b.dataset.w+'%');
  $$('.fg[data-v]',el).forEach(c=>c.style.strokeDashoffset=226.2*(1-c.dataset.v/100));io.unobserve(el)}),{threshold:.12});
  $$('.rv').forEach(el=>io.observe(el))}

function init(){nav();tiles();mq.addEventListener('change',tiles);reveal();
  $$('.hero [data-count]').forEach(countUp);
  addEventListener('scroll',()=>{const t=$('#tiles');t&&t.style.setProperty('--py',(scrollY*.25)+'px')},{passive:true});
  $$('.seg').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',s).forEach(x=>x.classList.toggle('on',x===b));s.dispatchEvent(new CustomEvent('pick',{detail:b.dataset.v}))}));
  $$('.card[data-href]').forEach(c=>c.addEventListener('click',e=>{if(e.target.closest('a,button'))return;location.href=c.dataset.href}))}
return{fr,$,$$,fmt,nb,day,countUp,smooth,chart,axis,T,init,page}
})();
