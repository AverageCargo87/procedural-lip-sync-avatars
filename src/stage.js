'use strict';
/* Stage helpers shared by the demo page and the headless renderer: every function draws a frame from (style, poses, time)
 * and nothing else, so the browser preview, the GIFs and the exported video are the same pixels.
 *   Stage.TEMPOS, Stage.GROUPS, Stage.styles()      catalogue
 *   Stage.bake(data, tempo)                          both hosts' pose tracks (cached per tempo)
 *   Stage.scene / closeup / grid / tempoGrid / sheet / track / label   drawing */
(function(root){
const W=1920,H=1080;
const TEMPOS=[{id:'bylo',letter:'A'},{id:'chut',letter:'B'},{id:'spokoyno',letter:'C'},{id:'tiho',letter:'D'}];
const GROUPS=[{id:'geo3',name:'Simple adults',range:'24-27'},{id:'geo2',name:'Detailed adults',range:'20-23'},{id:'geo',name:'Geometric originals',range:'7-10'}];
const RANK={geo3:0,geo2:1,geo:2};
/** The 12 registered styles in display order: group, then the number they had on the comparison page. */
const styles=()=>Object.values(Stili.SPISOK).filter(S=>RANK[S.gruppa]!=null).sort((a,b)=>RANK[a.gruppa]-RANK[b.gruppa]||a.nomer-b.nomer);

const cache=new Map();
function bake(data,tempo){const k=data.scene+'|'+tempo;if(!cache.has(k))cache.set(k,{L:Rech.bake(data,'L',{storona:1,stil:tempo}),A:Rech.bake(data,'A',{storona:-1,stil:tempo})});return cache.get(k);}

/** Full 1920x1080 scene of one style. */
function scene(c,S,pL,pA){Stili.scena(c,S,pL,pA,W,H);}

/** Face box of a host in scene coordinates, from the style's ramka (close-up frame in character coordinates). */
function faceBox(G){const [x,y,w,h]=G.ramka,s=G.s||1;return {cx:G.x+(x+w/2)*s,cy:G.y+(y+h/2)*s,w:w*s,h:h*s};}

/** Mouth close-up: both faces side by side, each zoomed to its ramka. The full scene is drawn under each clip, so it is the same drawing, only magnified. */
function closeup(c,S,pL,pA,{zoom=1}={}){
 c.fillStyle='#15171C';c.fillRect(0,0,W,H);
 [['L',0],['A',W/2]].forEach(([who,x0])=>{const G=S[who],p=who==='L'?pL:pA,b=faceBox(G),k=Math.min((W/2)/b.w,H/b.h)*zoom,
   lean=(p.lean||0)*22,bob=(p.bob||0)*6-(p.breath||0)*2.2,cy=Math.max(b.cy+bob,H/2/k);   // never look above the top edge of the scene
  c.save();c.beginPath();c.rect(x0+6,6,W/2-12,H-12);c.clip();c.translate(x0+W/4,H/2);c.scale(k,k);c.translate(-(b.cx+lean),-cy);scene(c,S,pL,pA);c.restore();});
}

/** Rounded label on a dark plate. */
function label(c,x,y,text,{k=1,accent=null}={}){
 c.save();c.font=`700 ${34*k}px system-ui,"Segoe UI",Roboto,sans-serif`;const w=c.measureText(text).width+36*k+(accent?c.measureText(accent).width+16*k:0);
 c.fillStyle='rgba(16,18,24,.82)';c.beginPath();c.roundRect(x,y,w,58*k,14*k);c.fill();c.textBaseline='middle';
 let tx=x+18*k;if(accent){c.fillStyle='#FFC94A';c.fillText(accent,tx,y+30*k);tx+=c.measureText(accent).width+16*k;}
 c.fillStyle='#fff';c.fillText(text,tx,y+30*k);c.restore();
}

/** One cell: a scaled scene with a label. */
function cell(c,S,B,t,x,y,w,text,accent,k){const m=w/W;c.save();c.translate(x,y);c.scale(m,m);c.beginPath();c.rect(0,0,W,H);c.clip();scene(c,S,B.L.poza(t),B.A.poza(t));c.restore();if(text)label(c,x+12,y+12,text,{k,accent});}

/** All styles in a grid (4 columns, one row per group). height: canvas height to centre in (gridHeight() fits it exactly). */
const gridHeight=(n=12,cols=4,gap=10)=>{const rows=Math.ceil(n/cols),h=(W-(cols-1)*gap)/cols*9/16;return Math.ceil(rows*h+(rows-1)*gap);};
function grid(c,list,B,t,{labels=true,cols=4,gap=10,height=H}={}){
 c.fillStyle='#15171C';c.fillRect(0,0,W,height);const rows=Math.ceil(list.length/cols),w=(W-(cols-1)*gap)/cols,h=w*9/16,y0=(height-rows*h-(rows-1)*gap)/2;
 list.forEach((S,i)=>cell(c,S,B,t,(i%cols)*(w+gap),y0+(i/cols|0)*(h+gap),w,labels?S.imya:'',labels?String(S.nomer):null,.62));
}

/** One style in the four animation tempos (2x2). */
function tempoGrid(c,S,data,t){
 c.fillStyle='#15171C';c.fillRect(0,0,W,H);const gap=12,w=(W-gap)/2,h=w*9/16,y0=(H-2*h-gap)/2;
 TEMPOS.forEach((T,i)=>cell(c,S,bake(data,T.id),t,(i%2)*(w+gap),y0+(i>>1)*(h+gap),w,Rech.STILI[T.id].imya,T.letter,.8));
}

/** Mouth sheet: the 15 sound shapes of table F on one host's face. */
const SOUNDS={sil:'rest',a:'а (a)',o:'о (o)',u:'у (u)',e:'э (e)',i:'и (i)',mb:'м б п (m b p)',fv:'в ф (v f)',td:'т д н (t d n)',sz:'с з ц (s z ts)',sh:'ш ж (sh zh)',l:'л (l)',r:'р (r)',kg:'к г х (k g kh)',j:'й (j)'};
function sheet(c,S,who){
 const G=S[who],[rx,ry,rw,rh]=G.ramka,cols=5,cw=W/cols,ch=H/3;c.fillStyle='#15171C';c.fillRect(0,0,W,H);
 Object.keys(SOUNDS).forEach((k,i)=>{const p=Object.assign({},Stili.POZA,{smile:.2});Rech.IM.forEach((m,j)=>{p[m]=Rech.F[k][j];});const x=(i%cols)*cw,y=(i/cols|0)*ch,sc=Math.min(cw/rw,ch/rh);
  c.save();c.beginPath();c.roundRect(x+4,y+4,cw-8,ch-8,12);c.clip();S.fon(c,W,H);c.translate(x+cw/2,y+ch/2);c.scale(sc,sc);c.translate(-(rx+rw/2),-(ry+rh/2));G.telo(c,p);c.restore();
  label(c,x+12,y+12,SOUNDS[k],{k:.62});});
}

/** Pose-track strip: open (filled), round and wide (lines) for both hosts over +-span seconds, the current time in the middle. */
function track(c,data,B,t,w,h,{span=3}={}){
 c.fillStyle='#1D2027';c.fillRect(0,0,w,h);const t0=t-span,px=s=>(s-t0)/(2*span)*w,half=h/2;
 c.strokeStyle='#343945';c.lineWidth=1;c.beginPath();c.moveTo(0,half);c.lineTo(w,half);c.stroke();
 const host=[['L',0,'#7FD6C9'],['A',half,'#FFC94A']];
 for(const [who,y0,col] of host){const T=B[who].treki,HZ=B[who].HZ,base=y0+half-6,amp=half-22;
  c.fillStyle=col+'55';c.strokeStyle=col;c.beginPath();c.moveTo(0,base);for(let x=0;x<=w;x+=2){const s=t0+x/w*2*span,i=Math.max(0,Math.min(T.open.length-1,Math.round(s*HZ)));c.lineTo(x,base-T.open[i]*amp);}c.lineTo(w,base);c.closePath();c.fill();
  for(const [m,dash] of [['round',[6,4]],['wide',[2,4]]]){c.setLineDash(dash);c.lineWidth=1.5;c.beginPath();for(let x=0;x<=w;x+=2){const s=t0+x/w*2*span,i=Math.max(0,Math.min(T[m].length-1,Math.round(s*HZ))),v=Math.max(0,T[m][i]);x?c.lineTo(x,base-v*amp*.8):c.moveTo(x,base-v*amp*.8);}c.stroke();}
  c.setLineDash([]);
  // letters of this host as small glyphs on the baseline
  c.fillStyle='#ECEDF1';c.font='600 13px ui-monospace,Consolas,monospace';c.textAlign='center';
  for(const b of data.bukvy){if(b[0]!==who||b[2]<t0||b[1]>t+span||!/[а-яё]/i.test(b[3]))continue;c.fillText(b[3].toLowerCase(),px((b[1]+b[2])/2),base+14);}
  c.textAlign='left';c.fillStyle=col;c.font='700 12px system-ui,sans-serif';c.fillText(who==='L'?'Lena':'Artem',8,y0+16);}
 c.strokeStyle='#FFFFFF';c.lineWidth=2;c.beginPath();c.moveTo(w/2,0);c.lineTo(w/2,h);c.stroke();
}

/** Current line and the active sound of each host (for captions and the readout). */
function lineAt(data,t){return data.repliki.find(r=>t>=r.t0-.1&&t<=r.t1+.15)||null;}
function soundAt(B,t){const z=B.zv.find(q=>t>=q.a-.03&&t<q.b);return z?z.k:'';}

root.Stage={W,H,TEMPOS,GROUPS,SOUNDS,styles,bake,scene,closeup,grid,gridHeight,tempoGrid,sheet,track,label,lineAt,soundAt,faceBox};
})(window);
