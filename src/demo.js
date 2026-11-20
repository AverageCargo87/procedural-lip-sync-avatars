'use strict';
/* Demo page: pick a style and a tempo, play and seek. The frame is a pure function of the audio clock:
 * poses come from tracks baked once per tempo, so pausing, seeking and replaying always show the same picture.
 * Evolved from the comparison page the hosts were chosen on (drawing tab, animation tab, zoom). */
(function(){
const $=id=>document.getElementById(id),cv=$('stage'),c=cv.getContext('2d'),strip=$('strip'),sc=strip.getContext('2d'),audio=new Audio();
const VIEWS=[['stage','stage'],['grid','all 12'],['tempos','4 tempos'],['closeup','mouth close-up'],['sheet','mouth shapes']];
const hash=new URLSearchParams(location.hash.slice(1));
let data=null,started=false,view=hash.get('view')||'stage',styleId=hash.get('style')||'kosoy3',tempo=hash.get('tempo')||'chut',dirty=true;
const LIST=Stage.styles(),ms=[];
if(!Stili.SPISOK[styleId])styleId=LIST[0].id;if(!Rech.STILI[tempo])tempo='chut';if(!VIEWS.some(v=>v[0]===view))view='stage';
const fmt=t=>`${t/60|0}:${String(t%60|0).padStart(2,'0')}`;

function button(parent,text,pressed,fn,title){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-pressed',pressed);if(title)b.title=title;b.onclick=fn;parent.append(b);return b;}
function controls(){
 const v=$('views');v.querySelectorAll('button').forEach(b=>b.remove());for(const [id,text] of VIEWS)button(v,text,id===view,()=>{view=id;update();});
 const s=$('styles');s.textContent='';
 for(const G of Stage.GROUPS){const g=document.createElement('span');g.className='group';const b=document.createElement('b');b.textContent=G.name;g.append(b);
  for(const S of LIST.filter(S=>S.gruppa===G.id))button(g,String(S.nomer),S.id===styleId,()=>{styleId=S.id;if(view==='grid')view='stage';update();},S.imya);s.append(g);}
 const t=$('tempos');t.querySelectorAll('button').forEach(b=>b.remove());
 for(const T of Stage.TEMPOS)button(t,`${T.letter} ${Rech.STILI[T.id].imya.toLowerCase()}`,T.id===tempo,()=>{tempo=T.id;update();});
}
function update(){controls();dirty=true;ms.length=0;history.replaceState(null,'',`#view=${view}&style=${styleId}&tempo=${tempo}`);
 const S=Stili.SPISOK[styleId],n=Math.round((Stili.schet(c,S.L,{})+Stili.schet(c,S.A,{}))/2);
 $('f-style').textContent=`${S.nomer} ${S.imya}`;$('f-shapes').textContent=String(n);}

function resize(){const r=window.devicePixelRatio||1,w=Math.min(1920,Math.round(cv.clientWidth*r));if(cv.width!==w){cv.width=w;cv.height=Math.round(w*9/16);}
 const sw=Math.round(strip.clientWidth*r),sh=Math.round(strip.clientHeight*r);if(strip.width!==sw||strip.height!==sh){strip.width=sw;strip.height=sh;}dirty=true;}

function draw(t){
 const S=Stili.SPISOK[styleId],B=Stage.bake(data,tempo),k=cv.width/Stage.W,pL=B.L.poza(t),pA=B.A.poza(t),t0=performance.now();
 c.save();c.setTransform(k,0,0,k,0,0);
 if(view==='stage')Stage.scene(c,S,pL,pA);
 else if(view==='grid')Stage.grid(c,LIST,B,t);
 else if(view==='tempos')Stage.tempoGrid(c,S,data,t);
 else if(view==='closeup')Stage.closeup(c,S,pL,pA);
 else Stage.sheet(c,S,'L');
 c.restore();
 if(view==='stage'){ms.push(performance.now()-t0);if(ms.length>120)ms.shift();const m=[...ms].sort((a,b)=>a-b)[ms.length>>1];$('f-ms').textContent=`${m.toFixed(1)} ms`;}
 else $('f-ms').textContent='stage view only';
 const r=strip.width/strip.clientWidth||1;sc.save();sc.setTransform(r,0,0,r,0,0);Stage.track(sc,data,B,t,strip.clientWidth,strip.clientHeight);sc.restore();
 const line=Stage.lineAt(data,t);$('who').textContent=line?(line.who==='L'?'Lena':'Artem'):'';$('who').className='who '+(line?line.who:'');$('line').textContent=line?line.show:'';
 $('f-sound').textContent=`${Stage.soundAt(B.L,t)||'-'} / ${Stage.soundAt(B.A,t)||'-'}`;
}

$('play').onclick=()=>{audio.paused?audio.play():audio.pause();};
audio.onplay=()=>{started=true;$('play').textContent='pause';};audio.onpause=()=>{$('play').textContent='play';};
$('seek').oninput=e=>{if(data){started=true;audio.currentTime=e.target.value/1000*data.total;dirty=true;}};
addEventListener('resize',resize);
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'&&e.code!=='Space')return;
 if(e.code==='Space'){e.preventDefault();$('play').click();}
 else if(e.code==='ArrowRight'||e.code==='ArrowLeft'){e.preventDefault();started=true;audio.currentTime=Math.max(0,Math.min(data.total,audio.currentTime+(e.code==='ArrowRight'?2:-2)));dirty=true;}});

(function tick(){if(data&&(dirty||!audio.paused)){const t=started?audio.currentTime:2.2;draw(t);
  $('seek').value=audio.currentTime/data.total*1000;$('time').textContent=`${fmt(audio.currentTime)} / ${fmt(data.total)}`;dirty=false;}
 requestAnimationFrame(tick);})();

fetch('data/demo.json').then(r=>r.json()).then(d=>{data=d;audio.src='data/demo.mp3';audio.preload='auto';resize();update();});
window.__demo={get view(){return view;},get style(){return styleId;},get tempo(){return tempo;}};
})();
