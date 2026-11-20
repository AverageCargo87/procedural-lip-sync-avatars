'use strict';
/* First edition: personazh.js draws four pairs of hosts (LOOKS) with one shared mouth, eye and arm. Same pose track, same audio.
 * window.__frame(t) draws the frame for time t, exactly like the main renderer. */
(function(){
const q=new URLSearchParams(location.search),cv=document.getElementById('cv'),c=cv.getContext('2d'),W=1920,H=1080;
const audio=new Audio(),{LOOKS,narisovat,narisovatRuki}=Personazh;
let D=null,L=null,A=null,close=q.get('closeup')||'',pair=q.has('pair')?+q.get('pair'):-1,started=false;
// pairs of hosts: the same voices, mouth and motion, different looks
const PAIRS=[{l:'lena',a:'artem',bg:'#FFE9B5',disc:'#FFDD94',table:'#F08A3C',tableTop:'#F7A65E'},
 {l:'lena2',a:'artem2',bg:'#D3F4E8',disc:'#B6EBDA',table:'#4A5FA5',tableTop:'#6278C2'},
 {l:'lena3',a:'artem3',bg:'#D5EEFF',disc:'#B7E2FF',table:'#FFB23E',tableTop:'#FFC766'},
 {l:'lena4',a:'artem4',bg:'#EBE3FF',disc:'#DACDFF',table:'#B5703F',tableTop:'#CB8A57'}];
function scene(P,t){
 c.fillStyle=P.bg;c.fillRect(0,0,W,H);
 // big soft shapes behind the hosts: they hold the silhouette and do not compete with the faces
 c.fillStyle=P.disc;c.beginPath();c.arc(560,470,430,0,6.3);c.fill();c.beginPath();c.arc(1360,470,430,0,6.3);c.fill();
 const pL=L?L.poza(t):{},pA=A?A.poza(t):{},xl=560,xa=1360,y=610,s=1.5,ll=LOOKS[P.l],la=LOOKS[P.a];
 narisovat(c,ll,pL,xl,y,s);narisovat(c,la,pA,xa,y,s);
 c.fillStyle=P.table;c.beginPath();c.roundRect(-40,884,W+80,240,[26,26,0,0]);c.fill();c.fillStyle=P.tableTop;c.beginPath();c.roundRect(-40,884,W+80,22,[26,26,0,0]);c.fill();
 narisovatRuki(c,ll,pL,xl,y,s);narisovatRuki(c,la,pA,xa,y,s);
}
function frame(t){
 c.save();c.clearRect(0,0,W,H);
 if(pair<0){PAIRS.forEach((P,i)=>{c.save();c.translate((i%2)*W/2,(i>>1)*H/2);c.scale(.5,.5);c.beginPath();c.rect(0,0,W,H);c.clip();scene(P,t);c.restore();});}
 else{if(close){const k=2.6,x=close==='L'?560:1360;c.translate(W/2,H/2);c.scale(k,k);c.translate(-x,-430);}scene(PAIRS[pair],t);}
 c.restore();
}
const $=id=>document.getElementById(id),fmt=t=>`${t/60|0}:${String(t%60|0).padStart(2,'0')}`;
$('play').onclick=()=>{audio.paused?audio.play():audio.pause();};
audio.onplay=()=>{started=true;$('play').textContent='pause';};audio.onpause=()=>{$('play').textContent='play';};
$('seek').oninput=e=>{if(D){started=true;audio.currentTime=e.target.value/1000*D.total;frame(audio.currentTime);}};
$('close').onclick=()=>{if(pair<0)pair=0;close=close===''?'L':close==='L'?'A':'';$('pair').value=pair;frame(started?audio.currentTime:2.2);};
$('pair').onchange=e=>{pair=+e.target.value;close='';frame(started?audio.currentTime:2.2);};
if(q.has('pair'))$('pair').value=q.get('pair');
(function tick(){if(D&&!audio.paused){frame(audio.currentTime);$('seek').value=audio.currentTime/D.total*1000;$('time').textContent=fmt(audio.currentTime);}requestAnimationFrame(tick);})();
window.__frame=frame;
fetch('data/demo.json').then(r=>r.json()).then(d=>{D=d;L=Rech.bake(D,'L',{storona:1});A=Rech.bake(D,'A',{storona:-1});audio.src='data/demo.mp3';audio.preload='auto';window.__data={total:D.total};frame(+q.get('t')||2.2);window.__ready=true;});
})();
