'use strict';
/* Style "Block, adults": the manner of "Block" (a block head slightly narrower at the crown, sturdy shoulders, big simple masses, a slanted hair cut with a parting, yellow background and blue table), but the hosts are 35-40.
 * Head narrower than the shoulders and taller than wide, a block jaw; a bar eye with a straight top and bottom, bar brows, a slab nose with a bridge; features at mid-head.
 * Lena: block bob below the chin, slanted fringe from the parting, brick jacket, cream top, pendant. Artem: fair skin, parted haircut with a receding hairline, grey temples, short beard; blue jumper, shirt collar. */
(function(){
const {lerp,clamp,rot,naGolovu}=Kit;
const S=1.6,XL=556,XA=1364,Y=660,STOL=892,ST=(STOL-Y)/S;
const GL={hy:-168,osnova:120},GA={hy:-178,osnova:120};
const naL=(c,p)=>naGolovu(c,p,GL),naA=(c,p)=>naGolovu(c,p,GA);
const sd=p=>({fe:p.yaw*32,fn:p.yaw*46,fm:p.yaw*38,py:p.pitch*12}),chel=p=>p.open*12+p.bite;
const dyh=(c,p)=>c.scale(1+p.breath*.006,1+p.breath*.012);

/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]. */
function gran(c,pts,r){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}

/** Bar eye: a straight top and a straight bottom, ends rounded generously. The iris is 60% of the width, the lid covers its top quarter, its bottom touches the lower lid, white only at the sides.
 *  A flat top over a round bottom reads as sleepy, so the bottom is straight too. */
function glaz(c,p,o){
 const {x,y,w,s}=o,D=w*(o.zk||.6),h=D*(1-(o.veko??.25)),z=clamp(clamp(p.blink)/.8),gy=p.gy*h*.16,
  xi=x-s*w/2,xo=x+s*w/2,yi=y+h*.06,yo=y-h*.05,sm=y+h*.3,
  t=lerp(y-h/2+gy*.5,sm,z),b=lerp(y+h/2,sm+1,z*z),
  T1=[x-s*w*.27,t],T2=[x+s*w*.25,t-h*.03],B1=[x-s*w*.28,b],B2=[x+s*w*.28,b];
 c.lineCap=c.lineJoin='round';
 if(z<.97){c.save();gran(c,[[xi,yi,h*.4],[T1[0],T1[1],h*.5],[T2[0],T2[1],h*.5],[xo,yo,h*.34],[B2[0],B2[1],h*.5],[B1[0],B1[1],h*.5]],5);c.clip();
  c.fillStyle='#FBF4EA';c.fillRect(x-w,y-w,2*w,2*w);
  const px=x+p.gx*(w/2-D/2)*1.15,py=y+h/2-D/2+gy;
  c.fillStyle=o.raduzhka;c.beginPath();c.arc(px,py,D/2,0,6.3);c.fill();
  c.fillStyle=o.zrachok;c.beginPath();c.arc(px,py,D*.27,0,6.3);c.fill();
  c.fillStyle='rgba(60,30,26,.2)';c.fillRect(x-w,t-h,2*w,h*1.3);
  c.fillStyle='#fff';c.beginPath();c.arc(px-D*.18,py-D*.15,D*.11,0,6.3);c.fill();
  c.restore();
  c.globalAlpha=(1-z)*(o.skA??.4);c.strokeStyle=o.skladka;c.lineWidth=2.2;c.beginPath();c.moveTo(x-s*w*.2,t-h*.55);c.lineTo(x+s*w*.22,t-h*.62);c.lineTo(xo+s*w*.04,yo-h*.4);c.stroke();
  c.globalAlpha=(1-z)*.55;c.strokeStyle=o.nizh;c.lineWidth=2;c.beginPath();c.moveTo(B1[0],B1[1]+1.5);c.lineTo(B2[0],B2[1]+1.5);c.stroke();
  c.globalAlpha=1;
  // lid as a bar: thin at the bridge, heavier toward the temple
  c.strokeStyle=o.liniya;c.lineWidth=o.tol*.6;c.beginPath();c.moveTo(xi,yi);c.lineTo(T1[0],T1[1]);c.stroke();
  c.lineWidth=o.tol;c.beginPath();c.moveTo(lerp(xi,T1[0],.5),lerp(yi,T1[1],.5));c.lineTo(T1[0],T1[1]);c.lineTo(T2[0],T2[1]);c.lineTo(xo,yo);if(o.strelka)c.lineTo(xo+s*o.strelka,yo-o.strelka*.4);c.stroke();}
 const a=clamp((clamp(p.blink)-.3)/.35);if(a>0){c.globalAlpha=a;c.strokeStyle=o.liniya;c.lineWidth=o.tol;c.beginPath();c.moveTo(xi,yi);c.lineTo(x-s*w*.2,sm+h*.18);c.lineTo(x+s*w*.24,sm+h*.14);c.lineTo(xo,yo+h*.1);c.stroke();c.globalAlpha=1;}
}

/** Bar brow: a parallelogram, thicker at the inner end, a break at pik. */
function brov(c,p,o){
 const s=o.s,r=(p.brow+(s<0?p.browL:0))*(o.hod??8),T=o.tol,x0=o.x-s*o.dl/2,x2=o.x+s*o.dl/2,xp=o.x+s*o.dl*(o.pik-.5),y=o.y-r,nk=o.nak||0;
 c.fillStyle=o.cvet;gran(c,[[x0,y+T*.55+nk-r*.15,3],[x0+s,y-T*.45+nk-r*.15,3],[xp,y-T*.5-o.izg,T*.5],[x2,y-T*.2+o.spad,2.5],[x2-s*2,y+T*.25+o.spad,2.5],[xp,y+T*.48-o.izg,T*.5]],3);c.fill();
}

/** Slab nose: a straight shadow band along the bridge on side ts and a wide bottom slab for the tip. */
function nos(c,p,o){
 const {fe,fn,py}=sd(p),nx=fn,ny=o.y+py,w=o.w,bx=lerp(fe,fn,.4),ts=o.ts,y0=o.y0+py*.9;
 c.fillStyle=o.ten;gran(c,[[bx+ts,y0,2],[bx+ts*7,y0+1,2],[nx+ts*w*.86,ny-15,5],[nx+ts*w*1.04,ny-4,5],[nx+ts*w*.86,ny+4,5],[nx-ts*w*.86,ny+4,5],[nx-ts*w*1.0,ny-4,4],[nx-ts*w*.6,ny-5,3],[nx+ts*w*.4,ny-8,3],[nx+ts*w*.36,ny-14,3],[bx+ts*3,y0+12,2]],3);c.fill();
 c.fillStyle=o.ten2;c.globalAlpha=.5;gran(c,[[nx+ts*w*.3,ny-2,2],[nx+ts*w*.72,ny-2,2],[nx+ts*w*.68,ny+2,2],[nx+ts*w*.3,ny+2,2]],2);c.fill();c.globalAlpha=1;
}

/** Mouth. The mouth shape lives only in Kit.rot. tenGuby is a short shadow under the lower lip. */
function rotT(c,p,o){
 const {fm,py}=sd(p),y=o.rotY+py*1.05,x=fm,H=(p.open*60+p.bite*5)*o.vys,niz=(p.open*3+H*.68)*o.rotK;
 rot(c,p,{x,y,k:o.rotK,cvet:o.rot,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:o.ugolki,ulybka:o.ulybka,zubyOt:o.zubyOt,vys:o.vys,asim:o.asim,liniya:o.rotLin||5.4,kontur:o.rotK2,tenPress:o.tenRot});
 if(o.tenGuby){c.strokeStyle=o.tenRot;c.lineCap='round';c.globalAlpha=(1-clamp(p.press))*o.tenGuby;c.lineWidth=3.4;c.beginPath();c.moveTo(x-8,y+niz+12);c.lineTo(x+8,y+niz+12);c.stroke();c.globalAlpha=1;}
}

/** Block ear with an inner facet. */
function uho(c,p,s,ex,ey,kozha,ten,v){
 const k=1-s*p.yaw*.6;c.save();c.translate(ex,ey);c.scale(s*k,1);
 c.fillStyle=kozha;gran(c,[[-6,-v*.9,6],[16,-v*.94,10],[19,v*.4,10],[8,v*.74,8],[-4,v*.78,6]],6);c.fill();
 c.fillStyle=ten;gran(c,[[1,-v*.56,3],[11,-v*.56,4],[12,v*.1,4],[5,v*.34,3],[1,v*.22,3]],3);c.fill();
 c.restore();
}

/** Trapezoid neck with a chin shadow. */
function sheya(c,p,na,forma,kozha,ten,w0,w1,yv,yn){c.save();c.beginPath();c.moveTo(-w0,yv);c.lineTo(w0,yv);c.lineTo(w1,yn);c.lineTo(-w1,yn);c.closePath();c.fillStyle=kozha;c.fill();c.clip();na(c,p);c.translate(-3,22);c.fillStyle=ten;forma(c,p);c.fill();c.restore();}

/** Block hand: palm and fingers one slab with a flat end, the thumb a separate bar. Wrist at the origin, fingers along +x, thumb toward +y; t opening, m mirror. */
function kist(c,o,t,m,ten){
 const k=o.D/100;c.save();c.scale(k,k*m);
 const a=lerp(0,.22,clamp((t-.36)/.64)),ca=Math.cos(a),sa=Math.sin(a),bx=12,by=12,
  pov=([x,y,r])=>[bx+(x-bx)*ca-(y-by)*sa,by+(x-bx)*sa+(y-by)*ca,r],
  bol=[[2,6,6],[28,9,8],[56,20,10],[52,31,9],[14,27,8]].map(pov),
  lad=[[-6,-19,6],[46,-22,8],[84,-20,13],[88,10,13],[50,21,8],[-6,19,6]];
 c.fillStyle=ten||o.kozha;gran(c,bol,6);c.fill();
 if(!ten){c.fillStyle=o.kozhaT;c.globalAlpha=.35;gran(c,[[28,12],[54,22],[50,29],[20,24]].map(([x,y])=>pov([x,y,4])),4);c.fill();c.globalAlpha=1;c.fillStyle=o.kozha;}
 gran(c,lad,8);c.fill();
 if(!ten){c.strokeStyle=o.kozhaT;c.lineWidth=2.4/k;c.lineCap='round';c.beginPath();for(const y of [-10,-1,8]){c.moveTo(60,y);c.lineTo(84,y*1.04);}c.stroke();}
 c.restore();
}

/** Arm made of bars following Kit.rukaV: the elbow nearly stays, the forearm lies along the table edge and covers it, a sleeve with straight sides, an angled elbow.
 *  chast 'verh' is the upper arm under the clothes, 'niz' the forearm, cuff and hand. o as in Kit.rukaV, plus svetR the top plane of the forearm and tenR its lower edge. */
function ruka(c,p,o,side,chast){
 const hxP=side<0?p.hLx:p.hRx,hyP=side<0?p.hLy:p.hRy,t=Math.max(clamp(side<0?p.hLo:p.hRo),o.t0??.36),u0=clamp(-hyP/108,0,1.25),uO=clamp(-(side<0?p.hRy:p.hLy)/108,0,1.25),u=u0*lerp(1,.55,clamp((uO-u0)/.12)),ves=1-clamp(-hyP/40),dx=p.lean*22/o.S,dy=(p.bob*6-p.breath*2.2)/o.S,lN=o.lokN||[0,0],w=o.w1,
  wx=side*lerp(o.k0[0],o.k1[0],u)+hxP*(o.kx??.7)-dx*ves,wy=lerp(o.k0[1]+(side>0?o.dY||0:0),o.k1[1],u)-dy*ves,ex=side*(o.lok[0]+lN[0]*u)-dx*ves*.7,ey=o.lok[1]+lN[1]*u-dy*ves*.7,sx=side*o.tw,sy=o.sy,
  a1=Math.atan2(ey-sy,ex-sx),u1x=Math.cos(a1),u1y=Math.sin(a1),f=Math.atan2(wy-ey,wx-ex),cf=Math.cos(f),sf=Math.sin(f),
  bl=Math.hypot(u1x-cf,u1y-sf)||1,bx=(u1x-cf)/bl,by=(u1y-sf)/bl;
 let n1x=-u1y,n1y=u1x,n2x=-sf,n2y=cf;if(n1x*bx+n1y*by<0){n1x=-n1x;n1y=-n1y;}if(n2x*bx+n2y*by<0){n2x=-n2x;n2y=-n2y;}
 const kv=w/Math.max(n1x*bx+n1y*by,.46),px=ex+bx*kv,py=ey+by*kv,rL=o.rLok??12;
 const plecho=()=>{const g=lerp(o.w0,w,.4),ox=lerp(sx,ex,.4)+n1x*g,oy=lerp(sy,ey,.4)+n1y*g;
  gran(c,[[side*(o.pl[0]-70),o.pl[1]+8,4],[side*o.pl[0],o.pl[1],30],[ox,oy,28],[ex+n1x*w,ey+n1y*w,4],[px,py,rL],[ex+n2x*w,ey+n2y*w,4],[ex-n1x*w,ey-n1y*w,6],[sx-n1x*o.w0,sy-n1y*o.w0,6]],8);c.fillStyle=o.cvet;c.fill();};
 if(chast==='verh'){plecho();return;}
 const W1=[wx+n2x*o.w2,wy+n2y*o.w2],W2=[wx-n2x*o.w2,wy-n2y*o.w2],E1=[ex+n2x*w,ey+n2y*w],E2=[ex-n2x*w,ey-n2y*w],
  pr=()=>gran(c,[[W1[0],W1[1],3],[E1[0],E1[1],4],[px,py,rL],[ex+n1x*w,ey+n1y*w,4],[E2[0],E2[1],6],[W2[0],W2[1],3]],4),
  rk=f+side*lerp(o.dov0||0,o.dov1||0,clamp(u));
 // one sleeve above and on the table: the clip line sits below the table edge with a margin for the figure's lean
 if(o.stol!=null){c.save();c.beginPath();c.rect(-420,o.stol-12,840,400);c.clip();plecho();c.restore();}
 if(o.stolTen&&ves>.02){c.globalAlpha=ves*.2;c.fillStyle=o.stolTen;gran(c,[[wx-side*70,wy+o.w2+6,6],[wx+side*40,wy+o.w2+6,6],[wx+side*30,wy+o.w2+20,6],[wx-side*80,wy+o.w2+20,6]],6);c.fill();c.globalAlpha=1;}
 if(o.tenT){c.save();if(o.stol!=null){c.beginPath();c.rect(-420,-60,840,o.stol+60);c.clip();}c.translate(-side*5,10);c.fillStyle=o.tenT;pr();c.fill();if(ves<1){c.globalAlpha=1-ves;c.translate(wx+cf*7+side*3,wy+sf*7-4);c.rotate(rk);kist(c,o,t,side,o.tenK||'rgba(30,20,24,.14)');}c.restore();}
 if(side>0&&ves>.02){c.save();c.globalAlpha=ves;c.translate(wx+cf*7-3,wy+sf*7+6);c.rotate(rk);kist(c,o,t,side,o.tenKist);c.restore();}
 c.save();c.translate(wx+cf*7,wy+sf*7);c.rotate(rk);kist(c,o,t,side);c.restore();
 c.save();c.translate(wx,wy);c.rotate(f);gran(c,[[-8,-o.w2+3,2],[(o.manzhL||11),-o.w2+4,3],[(o.manzhL||11),o.w2-4,3],[-8,o.w2-3,2]],3);c.fillStyle=o.manzh;c.fill();c.restore();
 // the top plane of the forearm is lighter, the side in the sleeve tone, the lower edge in shadow
 pr();c.fillStyle=o.svetR||o.cvet;c.fill();
 c.save();pr();c.clip();
 c.fillStyle=o.cvet;c.beginPath();c.moveTo(W1[0]+n2x*20,W1[1]+n2y*20);c.lineTo(E1[0]+n2x*40+bx*40,E1[1]+n2y*40+by*40);c.lineTo(ex-n2x*w*.08,ey-n2y*w*.08);c.lineTo(wx-n2x*o.w2*.02,wy-n2y*o.w2*.02);c.closePath();c.fill();
 if(o.tenR){c.fillStyle=o.tenR;c.beginPath();c.moveTo(W1[0]+n2x*20,W1[1]+n2y*20);c.lineTo(E1[0]+n2x*40+bx*40,E1[1]+n2y*40+by*40);c.lineTo(ex+n2x*w*.62,ey+n2y*w*.62);c.lineTo(wx+n2x*o.w2*.66,wy+n2y*o.w2*.66);c.closePath();c.fill();}
 // rib or cuff at the wrist
 if(o.obshlag){c.fillStyle=o.obshlag;c.beginPath();c.moveTo(W1[0],W1[1]);c.lineTo(W2[0],W2[1]);c.lineTo(W2[0]-cf*14,W2[1]-sf*14);c.lineTo(W1[0]-cf*14,W1[1]-sf*14);c.closePath();c.fill();}
 c.restore();
}
const dveRuki=(c,p,o,chast)=>{for(const s of [-1,1])ruka(c,p,o,s,chast);};

// -- Lena, 36: block bob below the chin, slanted fringe from the parting on the right; a block face narrowing to the chin --
const L={kozha:'#F7D3BA',ten:'#E7AC8E',ten2:'#C7896A',volosy:'#6B3522',volosyT:'#4F2518',svet:'#874A2C',svet2:'#7A3F26',brov:'#5A2C1E',liniya:'#3A2018',raduzhka:'#6A4630',zrachok:'#241614',
 pidzhak:'#C24A3C',pidzhakS:'#D35A4A',lackan:'#AE4034',verh:'#F6EBD6',verhT:'#E3D3B6',zoloto:'#E2B13C',
 rot:'#6E2030',rotK2:'#A84A4C',yazyk:'#D9707A',tenRot:'#E0A488',tenGuby:.55,rotY:76,rotK:.66,rotLin:6,ugolki:7,ulybka:1.4,zubyOt:15,vys:.84,asim:.05};
const formaL=(c,p)=>{const j=chel(p),q=p.yaw*7;gran(c,[[-76,-120,36],[76,-120,36],[82,46,26],[60+q,120+j,32],[-60+q,120+j,32],[-82,46,26]],20);};
/** Back mass of the bob: a block down to the neck with a jagged bottom. */
function zadL(c,p){const d=-p.yaw*10,h=p.hair*10;c.fillStyle=L.volosyT;gran(c,[[-90+d,-124,40],[92+d,-132,40],[110+d,40,16],[106+h,150,10],[40,140,8],[-40,140,8],[-108+h,150,10],[-114+d,40,16]],18);c.fill();}
/** Front mass: right of the parting the hair falls straight down along the cheek, on the left a slanted block fringe across the forehead to the temple and down below the chin. */
function peredL(c,d,h,dy){const pr=40+d;gran(c,[[pr,-156,8],[88+d*.4,-140,34],[102,-60,14],[110,40,12],[104+h,150,8],[78+h,154,8],[80,60,8],[78,-40,8],[pr+6,-88+dy,5],[-30+d,-54+dy,22],[-80,-26,10],[-82,40,10],[-80,100,8],[-86+h,154,8],[-112+h,146,8],[-118,40,12],[-106,-70,18],[-82+d*.4,-128,36]],16);}
function golovaL(c,p){
 const {fe,fn,fm,py}=sd(p),d=p.yaw*14,h=p.hair*8,dy=p.pitch*4,ey=py*.8,j=chel(p),pr=40+d;
 c.fillStyle=L.kozha;formaL(c,p);c.fill();
 c.save();formaL(c,p);c.clip();
 // side shadow facet away from the light
 c.fillStyle=L.ten;c.globalAlpha=.36;gran(c,[[-130,-130],[-66+fe*.6,-110],[-66+fe*.6,40],[-36+fe*.5,140],[-130,140]],10);c.fill();c.globalAlpha=1;
 c.save();c.translate(-2,9);c.fillStyle=L.ten;peredL(c,d,h,dy);c.fill();c.restore();
 c.fillStyle=L.ten;c.globalAlpha=.3;for(const s of [-1,1]){gran(c,[[s*84,26],[s*58+fe*.4,68+j*.4],[s*84,58]],4);c.fill();}c.globalAlpha=1;
 c.restore();
 rotT(c,p,L);
 nos(c,p,{y0:4,y:47,w:12,ts:-1,ten:L.ten,ten2:L.ten2});
 for(const s of [-1,1]){const kg=1-s*p.yaw*.22;
  glaz(c,p,{x:s*39+fe,y:ey,w:37*kg,s,zk:.6,nak:1,raduzhka:L.raduzhka,zrachok:L.zrachok,liniya:L.liniya,tol:3.6,skladka:L.ten,skA:.35,nizh:L.ten,strelka:3});
  brov(c,p,{x:s*41+fe,y:ey-24,dl:46*kg,tol:6.4,s,cvet:L.brov,izg:4,pik:.64,spad:5,nak:1});}
 c.fillStyle=L.volosy;peredL(c,d,h,dy);c.fill();
 c.save();peredL(c,d,h,dy);c.clip();
 // a light facet right of the parting and a dark facet on the left strand
 c.fillStyle=L.svet;gran(c,[[pr,-180],[160,-180],[160,170],[94,170],[90,-40],[pr+6,-96+dy]],4);c.fill();
 // top plane of the fringe: a block with a facet, not a cap
 c.fillStyle=L.svet2;gran(c,[[pr+2,-96+dy,4],[-30+d,-62+dy,16],[-84,-30,8],[-100,-64,10],[-50+d,-104+dy,14],[pr-6,-128,6]],8);c.fill();
 c.fillStyle=L.volosyT;gran(c,[[-170,-20],[-100,-12],[-90,40],[-96,190],[-170,190]],4);c.fill();
 c.restore();
}
const putL=[[-42,-26,10],[-168,10,40],[-130,116,12],[-132,420,0],[132,420,0],[130,116,12],[168,10,40],[42,-26,10]];
function teloL(c,p){
 c.rotate(.02);
 c.save();naL(c,p);zadL(c,p);c.restore();
 dveRuki(c,p,RL,'verh');
 c.save();dyh(c,p);
 c.fillStyle=L.pidzhak;gran(c,putL,20);c.fill();
 c.fillStyle=L.pidzhakS;gran(c,[[42,-26,6],[168,10,40],[156,42,10],[60,10,6]],8);c.fill();
 // cream top in the open jacket
 c.fillStyle=L.verh;gran(c,[[-58,-22,4],[58,-22,4],[34,190,4],[-34,190,4]],4);c.fill();
 c.restore();
 sheya(c,p,naL,formaL,L.kozha,L.ten,30,33,-100,-12);
 c.save();dyh(c,p);
 // boat neckline: skin and trim
 c.fillStyle=L.kozha;gran(c,[[-40,-26,3],[40,-26,3],[30,4,8],[-30,4,8]],3);c.fill();
 c.strokeStyle=L.verhT;c.lineWidth=3;c.lineJoin='round';c.beginPath();c.moveTo(-42,-20);c.lineTo(-30,6);c.lineTo(30,6);c.lineTo(42,-20);c.stroke();
 // chain and a diamond pendant
 c.strokeStyle=L.zoloto;c.lineWidth=2;c.beginPath();c.moveTo(-28,-18);c.lineTo(-10,26);c.lineTo(0,30);c.lineTo(10,26);c.lineTo(28,-18);c.stroke();
 c.fillStyle=L.zoloto;gran(c,[[0,28,2],[6,36,2],[0,46,2],[-6,36,2]],2);c.fill();
 // lapels
 for(const s of [-1,1]){c.fillStyle=L.lackan;gran(c,[[s*44,-24,4],[s*88,-2,6],[s*76,30,4],[s*100,40,6],[s*40,186,4],[s*34,162,4]],4);c.fill();}
 c.restore();
 c.save();naL(c,p);golovaL(c,p);c.restore();
}
const RL={S,tw:146,sy:52,pl:[168,10],lok:[138,180],lokN:[50,-22],k0:[64,160],k1:[98,100],w0:38,w1:33,w2:30,D:100,kx:.5,dY:-3,dov0:-.1,dov1:-.14,stol:ST,stolTen:'#25335A',
 cvet:'#B4443A',svetR:'#CE5646',tenR:'#963830',tenT:'rgba(90,24,20,.26)',tenKist:'rgba(150,80,50,.32)',manzh:L.verh,manzhL:11,kozha:L.kozha,kozhaT:L.ten2};
const rukiL=(c,p)=>{c.rotate(.02);dveRuki(c,p,RL,'niz');};

// -- Artem, 38: fair skin, block head with a square jaw; slanted cut haircut with a parting, grey temples, short block beard --
const A={kozha:'#EFC7A8',ten:'#D6A382',ten2:'#B07F62',volosy:'#3A2E2A',volosyT:'#2A201D',svet:'#56463F',sedina:'#A39C95',sedina2:'#756A63',boroda:'#7C5E4B',boroda2:'#6C513F',shchetina:'#CDA88E',brov:'#33261F',liniya:'#261916',raduzhka:'#4F5A62',zrachok:'#181A1E',
 dzhemper:'#3D64A6',dzhemperT:'#30528D',dzhemperS:'#4A73B6',rub:'#F4EEDF',rubT:'#DCD3C0',
 rot:'#5B1C28',rotK2:'#C98476',yazyk:'#D9707A',tenRot:'#6A4E40',tenGuby:0,rotY:84,rotK:.7,rotLin:5,ugolki:7,ulybka:1.4,zubyOt:15,vys:.84,asim:-.05};
const formaA=(c,p)=>{const j=chel(p),q=p.yaw*9;gran(c,[[-80,-124,34],[80,-124,34],[92+q*.3,128+j,40],[-92+q*.3,128+j,40]],30);};
/** Slanted cut haircut: parting on the left, volume on top to the right, short temples, a receding hairline. */
function perA(c,d,h,dy){gran(c,[[-86,8,4],[-98,-60,12],[-92,-128,30],[-36+d,-152+h,20],[44+d,-160+h,20],[96,-136,30],[100,-60,12],[88,8,4],[80,8,4],[79,-48,6],[66,-80,8],[50+d,-76+dy,8],[8+d,-84+dy,8],[-44+d,-94+dy,4],[-52+d,-80+dy,8],[-78,-54,8],[-80,8,4]],12);}
/** Short block beard: a narrow sideburn band along the edge of the face, an even step below the cheekbone to the mouth corners, narrow above the lip. */
const borodaA=(fm,fn,py)=>c=>gran(c,[[-130,16],[-84,16,4],[-80,66,6],[-62+fm*.5,76+py,8],[-44+fm,74+py,6],[-26+fm,66+py,5],[-11+fn*.8,62+py,4],[11+fn*.8,62+py,4],[26+fm,66+py,5],[44+fm,74+py,6],[62+fm*.5,76+py,8],[80,66,6],[84,16,4],[130,16],[130,230],[-130,230]],6);
function golovaA(c,p){
 const {fe,fn,fm,py}=sd(p),d=p.yaw*14,h=p.hair*3,dy=p.pitch*4,ey=py*.8,j=chel(p);
 for(const s of [-1,1])uho(c,p,s,s*88-p.yaw*5,14+py*.3,A.kozha,A.ten,34);
 c.fillStyle=A.kozha;formaA(c,p);c.fill();
 c.save();formaA(c,p);c.clip();
 c.fillStyle=A.ten;c.globalAlpha=.4;gran(c,[[140,-130],[72+fe*.6,-114],[72+fe*.6,60],[44+fe*.5,150],[140,150]],10);c.fill();c.globalAlpha=1;
 c.save();c.translate(-2,9);c.fillStyle=A.ten;perA(c,d,h,dy);c.fill();c.restore();
 c.fillStyle=A.ten;c.globalAlpha=.3;for(const s of [-1,1]){gran(c,[[s*90,22],[s*62+fe*.4,62],[s*90,52]],4);c.fill();}c.globalAlpha=1;
 // beard: a soft edge in stubble tone, a shadow facet away from the light
 const br=borodaA(fm,fn,py);c.save();c.translate(0,-5);c.fillStyle=A.shchetina;br(c);c.fill();c.restore();
 c.fillStyle=A.boroda;br(c);c.fill();
 c.save();br(c);c.clip();c.fillStyle=A.boroda2;gran(c,[[140,0],[70+fe*.6,0],[70+fe*.6,70],[46+fe*.5,160],[140,160]],8);c.fill();c.restore();
 c.restore();
 rotT(c,p,A);
 nos(c,p,{y0:2,y:52,w:16,ts:1,ten:A.ten,ten2:A.ten2});
 for(const s of [-1,1]){const kg=1-s*p.yaw*.22;
  glaz(c,p,{x:s*42+fe,y:ey,w:38*kg,s,zk:.6,nak:1.5,raduzhka:A.raduzhka,zrachok:A.zrachok,liniya:A.liniya,tol:3.6,skladka:A.ten,skA:.4,nizh:A.ten});
  brov(c,p,{x:s*44+fe,y:ey-24,dl:54*kg,tol:10,s,cvet:A.brov,izg:1.5,pik:.5,spad:2,nak:2});}
 c.fillStyle=A.volosy;perA(c,d,h,dy);c.fill();
 c.save();perA(c,d,h,dy);c.clip();
 // a light facet left of the parting, grey temples in two steps
 c.fillStyle=A.svet;gran(c,[[-44+d,-94+dy],[-30+d,-170],[-130,-170],[-130,-40],[-80,-50]],4);c.fill();
 for(const s of [-1,1]){c.fillStyle=A.sedina2;gran(c,[[s*120,-52],[s*94,-50],[s*80,-30],[s*79,20],[s*120,20]],4);c.fill();c.fillStyle=A.sedina;gran(c,[[s*120,-32],[s*96,-30],[s*82,-12],[s*80,20],[s*120,20]],4);c.fill();}
 c.restore();
}
const putA=[[-58,-26,10],[-206,10,40],[-170,124,14],[-166,420,0],[166,420,0],[170,124,14],[206,10,40],[58,-26,10]];
function teloA(c,p){
 c.rotate(-.02);
 dveRuki(c,p,RA,'verh');
 c.save();dyh(c,p);
 c.fillStyle=A.dzhemper;gran(c,putA,20);c.fill();
 c.fillStyle=A.dzhemperS;gran(c,[[-58,-26,6],[-206,10,40],[-192,44,10],[-76,10,6]],8);c.fill();
 // side plane of the chest in shadow
 c.save();gran(c,putA,20);c.clip();c.fillStyle=A.dzhemperT;c.globalAlpha=.55;gran(c,[[96,-10,8],[230,20,0],[230,420,0],[118,420,0],[124,90,10]],8);c.fill();c.restore();
 c.restore();
 sheya(c,p,naA,formaA,A.kozha,A.ten,48,52,-112,-6);
 c.save();dyh(c,p);
 // jumper neckline rib; the shirt collar hugs the neck, its points lie on the rib
 c.fillStyle=A.dzhemperT;gran(c,[[-74,-30,8],[74,-30,8],[56,28,16],[-56,28,16]],8);c.fill();
 c.fillStyle=A.kozha;gran(c,[[-32,-24,3],[32,-24,3],[0,16,5]],3);c.fill();
 for(const s of [-1,1]){c.fillStyle=A.rubT;gran(c,[[s*36,-38,3],[s*58,-30,4],[s*52,8,4],[s*32,34,3],[s*4,14,3],[s*30,-20,3]],3);c.fill();
  c.fillStyle=A.rub;gran(c,[[s*36,-38,3],[s*55,-31,4],[s*49,6,4],[s*31,30,3],[s*5,12,3],[s*30,-20,3]],3);c.fill();}
 c.restore();
 c.save();naA(c,p);golovaA(c,p);c.restore();
}
const RA={S,tw:186,sy:56,pl:[206,10],lok:[170,184],lokN:[54,-24],k0:[74,164],k1:[114,104],w0:46,w1:39,w2:35,D:110,kx:.5,dY:-3,dov0:-.1,dov1:-.14,stol:ST,stolTen:'#25335A',
 cvet:'#3D64A6',svetR:'#4C77BA',tenR:'#2F528D',tenT:'rgba(14,26,52,.3)',tenKist:'rgba(140,80,50,.32)',manzh:A.rub,manzhL:12,obshlag:'#33589A',kozha:A.kozha,kozhaT:A.ten2};
const rukiA=(c,p)=>{c.rotate(-.02);dveRuki(c,p,RA,'niz');};

Stili.dobavit({id:'blok2',nomer:23,imya:'Block, adults',gruppa:'geo2',
 fon(c,W,H){c.fillStyle='#F8D67E';c.fillRect(0,0,W,H);c.fillStyle='#FBE3A2';c.beginPath();c.moveTo(0,300);c.lineTo(W,120);c.lineTo(W,560);c.lineTo(0,740);c.closePath();c.fill();},
 stol(c,W,H){c.fillStyle='#7487B2';gran(c,[[60,STOL,18],[1860,STOL,18],[1950,1010,0],[-30,1010,0]],0);c.fill();c.fillStyle='#55689A';gran(c,[[-30,1010,0],[1950,1010,0],[1990,1100,0],[-70,1100,0]],0);c.fill();
  // a mug between the hosts
  c.save();c.translate(960,STOL+36);c.fillStyle='rgba(20,30,60,.22)';gran(c,[[-40,10,8],[46,10,8],[46,20,8],[-40,20,8]],6);c.fill();
  c.fillStyle='#E8B442';gran(c,[[-30,-62,6],[30,-62,6],[27,12,10],[-27,12,10]],6);c.fill();c.fillStyle='#D29E33';gran(c,[[12,-62,6],[30,-62,6],[27,12,10],[10,12,6]],4);c.fill();
  c.strokeStyle='#D29E33';c.lineWidth=9;c.lineJoin='round';c.beginPath();c.moveTo(30,-46);c.lineTo(46,-42);c.lineTo(44,-14);c.lineTo(28,-10);c.stroke();c.restore();},
 L:{x:XL,y:Y,s:S,ramka:[-150,-340,300,345],telo:teloL,ruki:rukiL},
 A:{x:XA,y:Y,s:S,ramka:[-150,-350,300,350],telo:teloA,ruki:rukiA}});
})();
