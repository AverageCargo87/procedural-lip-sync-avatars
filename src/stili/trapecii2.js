'use strict';
/* Style "Trapezoids, adults": the manner of "Trapezoids" (straight slanted sides, rounded vertices, flat light and shadow facets, light from the middle of the frame), but the hosts are 35-40.
 * Head narrower than the shoulders, a faceted almond eye at mid-head, a long lower third of the face. Artem has a narrow forehead and a wide jaw, Lena a wide forehead and a narrow cut chin.
 * Lena: long bob to the shoulders, side parting, right strand behind the ear, coral jacket, cream blouse. Artem: fair skin, short haircut, grey temples, short beard, navy jacket, shirt without a tie. */
(function(){
const {lerp,clamp,rot,naGolovu}=Kit;
const S=1.6,XL=552,XA=1368,Y=652,STOL=886,ST=(STOL-Y)/S;
const GL={hy:-170,osnova:120},GA={hy:-180,osnova:120};
const naL=(c,p)=>naGolovu(c,p,GL),naA=(c,p)=>naGolovu(c,p,GA);
const sd=p=>({fe:p.yaw*30,fn:p.yaw*44,fm:p.yaw*36,py:p.pitch*12}),chel=p=>p.open*12+p.bite;
const dyh=(c,p)=>c.scale(1+p.breath*.006,1+p.breath*.012);

/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]. */
function gran(c,pts,r){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}

/** Adult faceted eye: the upper lid is two straight lines, the lower lid two more, rounded corners. The iris is 60% of the slit, the lid covers its top quarter, its bottom touches the lower lid. */
function glaz(c,p,o){
 const {x,y,w,s}=o,D=w*(o.zk||.6),h=D*(1-(o.veko??.25)),z=clamp(clamp(p.blink)/.8),gy=p.gy*h*.16,
  xi=x-s*w/2,xo=x+s*w/2,yi=y+h*.18,yo=y-h*.14,sm=y+h*.32,
  t=lerp(y-h/2+gy*.5,sm,z),b=lerp(y+h/2,sm+1,z*z),
  T1=[x-s*w*.14,t],T2=[x+s*w*.24,t-h*.06],B1=[x-s*w*.2,b-h*.04],B2=[x+s*w*.22,b];
 c.lineCap=c.lineJoin='round';
 if(z<.97){c.save();gran(c,[[xi,yi,3],[T1[0],T1[1],h*.6],[T2[0],T2[1],h*.5],[xo,yo,2],[B2[0],B2[1],h*.5],[B1[0],B1[1],h*.6]],4);c.clip();
  c.fillStyle='#FBF4EA';c.fillRect(x-w,y-w,2*w,2*w);
  const px=x+p.gx*(w/2-D/2)*1.15,py=y+h/2-D/2+gy;
  c.fillStyle=o.raduzhka;c.beginPath();c.arc(px,py,D/2,0,6.3);c.fill();
  c.fillStyle=o.zrachok;c.beginPath();c.arc(px,py,D*.27,0,6.3);c.fill();
  // lid shadow: the gaze is calm, not frozen
  c.fillStyle='rgba(60,30,26,.22)';c.fillRect(x-w,t-h,2*w,h*1.34);
  c.fillStyle='#fff';c.beginPath();c.arc(px-D*.18,py-D*.14,D*.11,0,6.3);c.fill();
  c.restore();
  c.globalAlpha=1-z;
  if(o.skladka){c.globalAlpha=(1-z)*(o.skA??1);c.strokeStyle=o.skladka;c.lineWidth=2;c.beginPath();c.moveTo(x-s*w*.2,t-h*.5);c.lineTo(x+s*w*.22,t-h*.64);c.lineTo(xo+s*w*.04,yo-h*.44);c.stroke();}
  c.globalAlpha=(1-z)*.7;c.strokeStyle=o.nizh;c.lineWidth=1.8;c.beginPath();c.moveTo(B1[0],B1[1]+1);c.lineTo(B2[0],B2[1]+1);c.lineTo(xo,yo+1);c.stroke();
  if(o.podGlaz){c.globalAlpha=(1-z)*o.podGlaz;c.lineWidth=2.4;c.beginPath();c.moveTo(x-s*w*.2,y+h*1.1);c.lineTo(x+s*w*.16,y+h*1.2);c.lineTo(xo,y+h*.88);c.stroke();}
  c.globalAlpha=1;
  // the upper lid line gets thicker toward the outer corner
  c.strokeStyle=o.liniya;c.lineWidth=o.tol*.6;c.beginPath();c.moveTo(xi,yi);c.lineTo(T1[0],T1[1]);c.lineTo(T2[0],T2[1]);c.lineTo(xo,yo);c.stroke();
  c.lineWidth=o.tol;c.beginPath();c.moveTo(lerp(T1[0],T2[0],.3),lerp(T1[1],T2[1],.3));c.lineTo(T2[0],T2[1]);c.lineTo(xo,yo);if(o.strelka)c.lineTo(xo+s*o.strelka,yo-o.strelka*.45);c.stroke();}
 const a=clamp((clamp(p.blink)-.3)/.35);if(a>0){c.globalAlpha=a;c.strokeStyle=o.liniya;c.lineWidth=o.tol;c.beginPath();c.moveTo(xi,yi);c.lineTo(x-s*w*.12,sm+h*.2);c.lineTo(x+s*w*.24,sm+h*.12);c.lineTo(xo,yo+h*.08);c.stroke();c.globalAlpha=1;}
}

/** Trapezoid brow: thicker at the bridge, a break at pik, a thin tail toward the temple. */
function brov(c,p,o){
 const s=o.s,r=(p.brow+(s<0?p.browL:0))*(o.hod??8),x0=o.x-s*o.dl/2,xp=o.x+s*o.dl*(o.pik-.5),x2=o.x+s*o.dl/2,T=o.tol,yi=o.y-r*1.15,yp=o.y-o.izg-r,yt=o.y+o.spad-r*.8;
 c.fillStyle=o.cvet;gran(c,[[x0,yi+T*.5,2],[x0+s,yi-T*.5,3],[xp,yp-T*.5,T*.8],[x2,yt-T*.1,1.5],[x2-s*2,yt+T*.2,1.5],[xp,yp+T*.45,T*.6]],3);c.fill();
}

/** Slab nose with one shadow facet: the bridge on side ts widens toward the wing and turns into the flat underside of the tip; on the light side only a thin edge. */
function nos(c,p,o){
 const {fe,fn,py}=sd(p),nx=fn,ny=o.y+py,w=o.w,bx=lerp(fe,fn,.4),ts=o.ts,y0=o.y0+py*.9;
 c.fillStyle=o.ten;gran(c,[[bx+ts,y0,2],[bx+ts*6,y0+2,2],[nx+ts*w*.62,ny-17,6],[nx+ts*w*1.02,ny-5,5],[nx+ts*w*.7,ny+3,4],[nx,ny+5,4],[nx-ts*w*.66,ny+2,4],[nx-ts*w*.86,ny-4,3],[nx-ts*w*.5,ny-3,3],[nx+ts*w*.1,ny-6,4],[nx+ts*w*.4,ny-12,4],[bx+ts*3,y0+12,2]],3);c.fill();
 c.fillStyle=o.ten2;c.globalAlpha=.55;gran(c,[[nx+ts*w*.36,ny-3,2],[nx+ts*w*.74,ny-2,2],[nx+ts*w*.6,ny+2,2],[nx+ts*w*.3,ny+1,2]],2);c.fill();c.globalAlpha=1;
}

/** Mouth with a short shadow under the lower lip. The mouth shape lives only in Kit.rot. */
function rotT(c,p,o){
 const {fm,py}=sd(p),y=o.rotY+py*1.05,x=fm,H=(p.open*60+p.bite*5)*o.vys,niz=(p.open*3+H*.68)*o.rotK;
 rot(c,p,{x,y,k:o.rotK,cvet:o.rot,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:o.ugolki,ulybka:o.ulybka,zubyOt:o.zubyOt,vys:o.vys,asim:o.asim,liniya:o.rotLin||5.4,kontur:o.rotK2,tenPress:o.tenRot});
 if(o.tenGuby){c.strokeStyle=o.tenRot;c.lineCap='round';c.globalAlpha=(1-clamp(p.press))*o.tenGuby;c.lineWidth=3.2;c.beginPath();c.moveTo(x-7,y+niz+12);c.lineTo(x+7,y+niz+12);c.stroke();c.globalAlpha=1;}
}

/** Slab ear with an inner facet. */
function uho(c,p,s,ex,ey,kozha,ten,v){
 const k=1-s*p.yaw*.6;c.save();c.translate(ex,ey);c.scale(s*k,1);
 c.fillStyle=kozha;gran(c,[[-6,-v*.86,6],[12,-v*.98,10],[19,-v*.4,8],[11,v*.64,10],[-4,v*.76,6]],6);c.fill();
 c.fillStyle=ten;gran(c,[[1,-v*.58,3],[10,-v*.62,4],[12,-v*.16,4],[6,v*.3,3],[1,v*.18,3]],3);c.fill();
 c.restore();
}

/** Trapezoid neck with a chin shadow. */
function sheya(c,p,na,forma,kozha,ten,w0,w1,yv,yn){c.save();c.beginPath();c.moveTo(-w0,yv);c.lineTo(w0,yv);c.lineTo(w1,yn);c.lineTo(-w1,yn);c.closePath();c.fillStyle=kozha;c.fill();c.clip();na(c,p);c.translate(-3,22);c.fillStyle=ten;forma(c,p);c.fill();c.restore();}

/** Slab hand: the palm a trapezoid toward the fingers, the fingers one slab with a slanted end, the thumb a separate facet. Wrist at the origin, fingers along +x, thumb toward +y; t opening, m mirror. */
function kist(c,o,t,m,ten){
 const k=o.D/100;c.save();c.scale(k,k*m);
 const a=lerp(0,.22,clamp((t-.36)/.64)),ca=Math.cos(a),sa=Math.sin(a),bx=12,by=12,
  pov=([x,y,r])=>[bx+(x-bx)*ca-(y-by)*sa,by+(x-bx)*sa+(y-by)*ca,r],
  bol=[[2,6,6],[30,9,8],[62,22,9],[57,32,8],[16,27,8]].map(pov),
  lad=[[-6,-17,6],[44,-21,10],[86,-15,12],[92,5,11],[54,19,8],[-6,17,6]];
 c.fillStyle=ten||o.kozha;gran(c,bol,6);c.fill();
 if(!ten){c.fillStyle=o.kozhaT;c.globalAlpha=.35;gran(c,[[30,12],[60,23],[56,30],[22,24]].map(([x,y])=>pov([x,y,4])),4);c.fill();c.globalAlpha=1;c.fillStyle=o.kozha;}
 gran(c,lad,8);c.fill();
 if(!ten){c.strokeStyle=o.kozhaT;c.lineWidth=2.2/k;c.lineCap='round';c.beginPath();for(const [y0,y1] of [[-9,-10],[-1,-1],[7,9]]){c.moveTo(58,y0);c.lineTo(88,y1);}c.stroke();}
 c.restore();
}

/** Faceted arm following Kit.rukaV: the elbow nearly stays, the forearm lies along the table edge and covers it, a sleeve with straight sides, an angled elbow.
 *  chast 'verh' is the upper arm under the jacket, 'niz' the forearm, cuff and hand. o as in Kit.rukaV, plus svetR and tenR, the light and shadow facets of the sleeve. */
function ruka(c,p,o,side,chast){
 const hxP=side<0?p.hLx:p.hRx,hyP=side<0?p.hLy:p.hRy,t=Math.max(clamp(side<0?p.hLo:p.hRo),o.t0??.36),u0=clamp(-hyP/108,0,1.25),uO=clamp(-(side<0?p.hRy:p.hLy)/108,0,1.25),u=u0*lerp(1,.55,clamp((uO-u0)/.12)),ves=1-clamp(-hyP/40),dx=p.lean*22/o.S,dy=(p.bob*6-p.breath*2.2)/o.S,lN=o.lokN||[0,0],w=o.w1,
  wx=side*lerp(o.k0[0],o.k1[0],u)+hxP*(o.kx??.7)-dx*ves,wy=lerp(o.k0[1]+(side>0?o.dY||0:0),o.k1[1],u)-dy*ves,ex=side*(o.lok[0]+lN[0]*u)-dx*ves*.7,ey=o.lok[1]+lN[1]*u-dy*ves*.7,sx=side*o.tw,sy=o.sy,
  a1=Math.atan2(ey-sy,ex-sx),u1x=Math.cos(a1),u1y=Math.sin(a1),f=Math.atan2(wy-ey,wx-ex),cf=Math.cos(f),sf=Math.sin(f),
  bl=Math.hypot(u1x-cf,u1y-sf)||1,bx=(u1x-cf)/bl,by=(u1y-sf)/bl;
 let n1x=-u1y,n1y=u1x,n2x=-sf,n2y=cf;if(n1x*bx+n1y*by<0){n1x=-n1x;n1y=-n1y;}if(n2x*bx+n2y*by<0){n2x=-n2x;n2y=-n2y;}
 const kv=w/Math.max(n1x*bx+n1y*by,.46),px=ex+bx*kv,py=ey+by*kv,rL=o.rLok??12;
 const plecho=()=>{const g=lerp(o.w0,w,.4),ox=lerp(sx,ex,.4)+n1x*g,oy=lerp(sy,ey,.4)+n1y*g;
  gran(c,[[side*(o.pl[0]-70),o.pl[1]+8,4],[side*o.pl[0],o.pl[1],28],[ox,oy,30],[ex+n1x*w,ey+n1y*w,4],[px,py,rL],[ex+n2x*w,ey+n2y*w,4],[ex-n1x*w,ey-n1y*w,6],[sx-n1x*o.w0,sy-n1y*o.w0,6]],8);c.fillStyle=o.cvet;c.fill();};
 if(chast==='verh'){plecho();return;}
 const W1=[wx+n2x*o.w2,wy+n2y*o.w2],W2=[wx-n2x*o.w2,wy-n2y*o.w2],E1=[ex+n2x*w,ey+n2y*w],E2=[ex-n2x*w,ey-n2y*w],
  pr=()=>gran(c,[[W1[0],W1[1],3],[E1[0],E1[1],4],[px,py,rL],[ex+n1x*w,ey+n1y*w,4],[E2[0],E2[1],6],[W2[0],W2[1],3]],4),
  rk=f+side*lerp(o.dov0||0,o.dov1||0,clamp(u));
 // one sleeve above and on the table
 if(o.stol!=null){c.save();c.beginPath();c.rect(-420,o.stol-10,840,400);c.clip();plecho();c.restore();}
 if(o.stolTen&&ves>.02){c.globalAlpha=ves*.2;c.fillStyle=o.stolTen;gran(c,[[wx-side*70,wy+o.w2+6,6],[wx+side*40,wy+o.w2+6,6],[wx+side*30,wy+o.w2+20,6],[wx-side*80,wy+o.w2+20,6]],6);c.fill();c.globalAlpha=1;}
 // arm shadow on the body, only above the table
 if(o.tenT){c.save();if(o.stol!=null){c.beginPath();c.rect(-420,-60,840,o.stol+60);c.clip();}c.translate(-side*5,10);c.fillStyle=o.tenT;pr();c.fill();if(ves<1){c.globalAlpha=1-ves;c.translate(wx+cf*7+side*3,wy+sf*7-4);c.rotate(rk);kist(c,o,t,side,o.tenK||'rgba(30,20,24,.14)');}c.restore();}
 // the upper hand at rest casts a shadow on the lower one
 if(side>0&&ves>.02){c.save();c.globalAlpha=ves;c.translate(wx+cf*7-3,wy+sf*7+6);c.rotate(rk);kist(c,o,t,side,o.tenKist);c.restore();}
 c.save();c.translate(wx+cf*7,wy+sf*7);c.rotate(rk);kist(c,o,t,side);c.restore();
 c.save();c.translate(wx,wy);c.rotate(f);const mL=o.manzhL||11;gran(c,[[-8,-o.w2+3,2],[mL,-o.w2+4,3],[mL,o.w2-4,3],[-8,o.w2-3,2]],3);c.fillStyle=o.manzh;c.fill();
 // a watch on the left wrist: strap and flat dial
 if(o.chasy&&side<0){c.fillStyle=o.chasy[0];gran(c,[[mL-1,-o.w2+6,2],[mL+8,-o.w2+6,2],[mL+8,o.w2-7,2],[mL-1,o.w2-7,2]],2);c.fill();c.fillStyle=o.chasy[1];gran(c,[[mL-3,-12,4],[mL+10,-12,4],[mL+10,3,4],[mL-3,3,4]],4);c.fill();c.fillStyle=o.chasy[2];gran(c,[[mL,-9,3],[mL+7,-9,3],[mL+7,0,3],[mL,0,3]],3);c.fill();}
 c.restore();
 // the top plane of the forearm is lighter, the side in the sleeve tone, the lower edge in shadow: the sleeve has volume but stays flat
 pr();c.fillStyle=o.svetR||o.cvet;c.fill();
 c.save();pr();c.clip();
 c.fillStyle=o.cvet;c.beginPath();c.moveTo(W1[0]+n2x*20,W1[1]+n2y*20);c.lineTo(E1[0]+n2x*40+bx*40,E1[1]+n2y*40+by*40);c.lineTo(ex-n2x*w*.08,ey-n2y*w*.08);c.lineTo(wx-n2x*o.w2*.02,wy-n2y*o.w2*.02);c.closePath();c.fill();
 if(o.tenR){c.fillStyle=o.tenR;c.beginPath();c.moveTo(W1[0]+n2x*20,W1[1]+n2y*20);c.lineTo(E1[0]+n2x*40+bx*40,E1[1]+n2y*40+by*40);c.lineTo(ex+n2x*w*.62,ey+n2y*w*.62);c.lineTo(wx+n2x*o.w2*.66,wy+n2y*o.w2*.66);c.closePath();c.fill();}
 c.restore();
 // a straight fold line at the elbow
 if(o.skl){c.strokeStyle=o.skl;c.lineWidth=2.6;c.lineCap='round';c.beginPath();const d=w*.9,a=w*.8;c.moveTo(ex+cf*d-n2x*a,ey+sf*d-n2y*a);c.lineTo(ex+cf*(d+16)-n2x*(a-w*.4),ey+sf*(d+16)-n2y*(a-w*.4));c.stroke();}
}
const dveRuki=(c,p,o,chast)=>{for(const s of [-1,1])ruka(c,p,o,s,chast);};

// -- Lena, 36: long bob to the shoulders, side parting, right strand behind the ear; wide forehead, narrow cut chin --
const L={kozha:'#F8D5BE',ten:'#E8B194',ten2:'#C98B6D',volosy:'#764331',volosyT:'#55291F',svet:'#94593D',brov:'#5A3022',liniya:'#3A2220',raduzhka:'#6B4A33',zrachok:'#241614',
 pidzhak:'#C9604F',pidzhakS:'#D8735F',lackan:'#B65547',lackanS:'#D06A57',bluzka:'#F6E9D8',bluzkaT:'#E4D1B8',zoloto:'#D7A845',
 rot:'#6E2030',rotK2:'#AA4E50',yazyk:'#D9707A',tenRot:'#E2A88C',tenGuby:.6,rotY:76,rotK:.66,rotLin:6,ugolki:7,ulybka:1.4,zubyOt:15,vys:.84,asim:.05};
const formaL=(c,p)=>{const j=chel(p),q=p.yaw*7;gran(c,[[-80,-108,34],[80,-108,34],[83,20,24],[60+q*.5,86+j*.6,26],[28+q,117+j,14],[-28+q,117+j,14],[-60+q*.5,86+j*.6,26],[-83,20,24]],16);};
/** Back mass: a trapezoid from the crown to the shoulders, a jagged bottom, not ruler-straight. */
function zadL(c,p){const d=-p.yaw*10,h=p.hair*10;c.fillStyle=L.volosyT;gran(c,[[-96+d,-122,44],[98+d,-130,44],[114+d,40,20],[128+h,150,10],[62+h*.5,162,8],[-62+h*.5,162,8],[-128+h,150,10],[-114+d,40,20]],20);c.fill();}
/** Front mass: a wave from the side parting across the forehead to the right and behind the ear; on the left a strand along the cheek to the shoulder with a diagonal cut. */
function peredL(c,d,h,dy){const pr=-28+d;gran(c,[[pr,-154,10],[96+d*.5,-138,42],[112,-60,18],[104,-4,10],[86,-12,8],[82,-46,12],[40+d,-70+dy,34],[pr+2,-94+dy,6],[-58+d,-70+dy,24],[-80,-16,10],[-78,64,10],[-88+h,170,8],[-128+h,158,10],[-118,60,16],[-106,-60,22],[-92+d*.5,-128,42]],16);}
function golovaL(c,p){
 const {fe,fn,fm,py}=sd(p),d=p.yaw*14,h=p.hair*8,dy=p.pitch*4,ey=py*.8,j=chel(p),pr=-28+d;
 // right ear visible, the strand behind it; a diamond earring
 const ex=82-p.yaw*5,eY=12+py*.3;uho(c,p,1,ex,eY,L.kozha,L.ten,30);
 c.fillStyle=L.zoloto;gran(c,[[ex+4,eY+25],[ex+9,eY+35],[ex+4,eY+46],[ex-1,eY+35]],2);c.fill();
 c.fillStyle=L.kozha;formaL(c,p);c.fill();
 c.save();formaL(c,p);c.clip();
 // side shadow facet away from the light
 c.fillStyle=L.ten;c.globalAlpha=.4;gran(c,[[-130,-130],[-68+fe*.6,-110],[-66+fe*.6,26],[-24+fe*.5,140],[-130,140]],10);c.fill();c.globalAlpha=1;
 // hair shadow on the forehead
 c.save();c.translate(-2,9);c.fillStyle=L.ten;peredL(c,d,h,dy);c.fill();c.restore();
 // facet under the cheekbone
 c.fillStyle=L.ten;c.globalAlpha=.32;for(const s of [-1,1]){gran(c,[[s*84,24],[s*56+fe*.4,70+j*.4],[s*84,58]],4);c.fill();}c.globalAlpha=1;
 c.restore();
 rotT(c,p,L);
 nos(c,p,{y0:4,y:46,w:12,ts:-1,ten:L.ten,ten2:L.ten2});
 for(const s of [-1,1]){const kg=1-s*p.yaw*.22;
  glaz(c,p,{x:s*38+fe,y:ey,w:37*kg,s,zk:.6,veko:.25,raduzhka:L.raduzhka,zrachok:L.zrachok,liniya:L.liniya,tol:3.2,skladka:L.ten,skA:.45,nizh:L.ten,strelka:3});
  brov(c,p,{x:s*40+fe,y:ey-23,dl:48*kg,tol:6.4,s,cvet:L.brov,izg:5,pik:.62,spad:6});}
 c.fillStyle=L.volosy;peredL(c,d,h,dy);c.fill();
 c.save();peredL(c,d,h,dy);c.clip();
 // a light facet on the side toward the partner and a dark facet on the left strand
 c.fillStyle=L.svet;gran(c,[[pr+4,-180],[160,-180],[160,-40],[96,-40],[42+d,-78+dy],[pr+4,-104+dy]],4);c.fill();
 c.fillStyle=L.volosyT;gran(c,[[-170,-110],[-108,-50],[-88,30],[-92,190],[-170,190]],4);c.fill();
 c.restore();
}
const putL=[[-40,-28,8],[-166,22,30],[-124,112,12],[-128,420,0],[128,420,0],[124,112,12],[166,22,30],[40,-28,8]];
function teloL(c,p){
 c.rotate(.016);
 c.save();naL(c,p);zadL(c,p);c.restore();
 dveRuki(c,p,RL,'verh');
 c.save();dyh(c,p);
 c.fillStyle=L.pidzhak;gran(c,putL,20);c.fill();
 // a light facet on the shoulder toward the partner
 c.fillStyle=L.pidzhakS;gran(c,[[40,-28,6],[166,22,30],[150,54,10],[58,12,6]],8);c.fill();
 // blouse in the neckline
 c.fillStyle=L.bluzka;gran(c,[[-44,-20,4],[44,-20,4],[8,170,4],[-8,170,4]],4);c.fill();
 c.fillStyle=L.kozha;gran(c,[[-31,-26,3],[31,-26,3],[0,40,6]],3);c.fill();
 c.restore();
 sheya(c,p,naL,formaL,L.kozha,L.ten,30,33,-100,-14);
 c.save();dyh(c,p);
 // a thin chain
 c.strokeStyle=L.zoloto;c.lineWidth=2;c.lineJoin='round';c.beginPath();c.moveTo(-30,-12);c.lineTo(-12,20);c.lineTo(0,24);c.lineTo(12,20);c.lineTo(30,-12);c.stroke();
 // blouse collar and lapels
 c.fillStyle=L.bluzkaT;for(const s of [-1,1]){gran(c,[[s*2,48,3],[s*32,-24,3],[s*48,-12,3],[s*38,40,3]],3);c.fill();}
 c.fillStyle=L.bluzka;for(const s of [-1,1]){gran(c,[[s*3,42,3],[s*31,-24,3],[s*46,-14,3],[s*35,34,3]],3);c.fill();}
 for(const s of [-1,1]){c.fillStyle=s>0?L.lackanS:L.lackan;gran(c,[[s*40,-24,4],[s*84,-2,6],[s*72,30,4],[s*96,42,6],[s*10,176,4],[s*6,152,4]],4);c.fill();}
 c.restore();
 c.save();naL(c,p);golovaL(c,p);c.restore();
}
const RL={S,tw:146,sy:58,pl:[166,22],lok:[136,180],lokN:[52,-22],k0:[62,162],k1:[96,102],w0:34,w1:29,w2:26,D:98,kx:.5,dY:-3,dov0:-.1,dov1:-.14,stol:ST,stolTen:'#9A6A34',
 cvet:'#D46C5A',svetR:'#E08270',tenR:'#B95647',tenT:'rgba(90,30,24,.26)',tenKist:'rgba(150,80,50,.32)',skl:'#A84C40',manzh:L.bluzka,manzhL:11,kozha:L.kozha,kozhaT:L.ten2};
const rukiL=(c,p)=>{c.rotate(.016);dveRuki(c,p,RL,'niz');};

// -- Artem, 38: fair skin, narrow forehead, wide jaw; short side-parted haircut, grey temples, short beard --
const A={kozha:'#EFC7A8',ten:'#D6A382',ten2:'#B07F62',volosy:'#4A372C',volosyT:'#33251E',svet:'#67503F',sedina:'#A59C93',sedina2:'#7C6E64',boroda:'#6A5244',boroda2:'#5C4639',shchetina:'#BE9A80',brov:'#3A2A22',liniya:'#2A1B18',raduzhka:'#56473A',zrachok:'#1C1410',
 pidzhak:'#2C4670',pidzhakS:'#365583',lackan:'#3B5B8C',rub:'#F3EDE2',rubT:'#D9D0C0',
 rot:'#5B1C28',rotK2:'#B4746A',yazyk:'#D9707A',tenRot:'#8A6A58',rotY:82,rotK:.68,rotLin:5,ugolki:7,ulybka:1.4,zubyOt:15,vys:.84,asim:-.05};
const formaA=(c,p)=>{const j=chel(p),q=p.yaw*9;gran(c,[[-74,-116,28],[74,-116,28],[86,92,30],[46+q,129+j,22],[-46+q,129+j,22],[-86,92,30]],20);};
/** Haircut: volume on top toward the right, short temples turning into sideburns, a slanted hairline with a slight recession. */
function perA(c,d,h,dy){gran(c,[[-82,8,4],[-98,-56,14],[-88,-122,30],[-30+d,-148+h,24],[50+d,-154+h,24],[94,-126,30],[100,-56,14],[84,8,4],[76,8,4],[74,-44,8],[58,-78,10],[20+d,-90+dy,12],[-36+d,-82+dy,5],[-60+d,-68+dy,10],[-75,-44,8],[-76,8,4]],12);}
/** Short beard as one mass: from the sideburn diagonally across the cheek to the mouth corners, narrow above the lip. */
const borodaA=(fm,fn,py)=>c=>gran(c,[[-130,12],[-80,12,4],[-72,52,8],[-54+fm*.6,70+py,8],[-38+fm,70+py,6],[-24+fm,65+py,6],[-10+fn*.8,62+py,5],[10+fn*.8,62+py,5],[24+fm,65+py,6],[38+fm,70+py,6],[54+fm*.6,70+py,8],[72,52,8],[80,12,4],[130,12],[130,230],[-130,230]],6);
function golovaA(c,p){
 const {fe,fn,fm,py}=sd(p),d=p.yaw*14,h=p.hair*3,dy=p.pitch*4,ey=py*.8,j=chel(p);
 for(const s of [-1,1])uho(c,p,s,s*86-p.yaw*5,14+py*.3,A.kozha,A.ten,33);
 c.fillStyle=A.kozha;formaA(c,p);c.fill();
 c.save();formaA(c,p);c.clip();
 // side facet of the jaw away from the light
 c.fillStyle=A.ten;c.globalAlpha=.42;gran(c,[[130,-130],[72+fe*.6,-112],[72+fe*.6,40],[30+fe*.5,150],[130,150]],10);c.fill();c.globalAlpha=1;
 c.save();c.translate(-2,9);c.fillStyle=A.ten;perA(c,d,h,dy);c.fill();c.restore();
 c.fillStyle=A.ten;c.globalAlpha=.3;for(const s of [-1,1]){gran(c,[[s*88,20],[s*60+fe*.4,62],[s*88,50]],4);c.fill();}c.globalAlpha=1;
 // short beard: a soft edge in stubble tone, a shadow facet away from the light
 const br=borodaA(fm,fn,py);c.save();c.translate(0,-6);c.fillStyle=A.shchetina;br(c);c.fill();c.restore();
 c.fillStyle=A.boroda;br(c);c.fill();
 c.save();br(c);c.clip();c.fillStyle=A.boroda2;gran(c,[[140,-20],[66+fe*.6,-20],[66+fe*.6,60],[26+fe*.5,160],[140,160]],8);c.fill();c.restore();
 c.restore();
 rotT(c,p,A);
 nos(c,p,{y0:0,y:50,w:16,ts:1,ten:A.ten,ten2:A.ten2});
 for(const s of [-1,1]){const kg=1-s*p.yaw*.22;
  glaz(c,p,{x:s*40+fe,y:ey,w:37*kg,s,zk:.6,veko:.27,raduzhka:A.raduzhka,zrachok:A.zrachok,liniya:A.liniya,tol:3,skladka:A.ten,nizh:A.ten,skA:.7,podGlaz:.14});
  brov(c,p,{x:s*42+fe,y:ey-22,dl:54*kg,tol:9,s,cvet:A.brov,izg:2.5,pik:.6,spad:3});}
 c.fillStyle=A.volosy;perA(c,d,h,dy);c.fill();
 c.save();perA(c,d,h,dy);c.clip();
 // a light facet on the side toward the partner
 c.fillStyle=A.svet;gran(c,[[-28+d,-170],[-120,-170],[-120,-60],[-62+d,-64+dy],[-36+d,-86+dy],[-24+d,-130]],4);c.fill();
 // grey temples in two steps
 for(const s of [-1,1]){c.fillStyle=A.sedina2;gran(c,[[s*120,-50],[s*92,-46],[s*76,-26],[s*74,20],[s*120,20]],4);c.fill();c.fillStyle=A.sedina;gran(c,[[s*120,-30],[s*94,-28],[s*78,-10],[s*76,20],[s*120,20]],4);c.fill();}
 c.restore();
}
const putA=[[-56,-28,8],[-202,30,30],[-156,122,12],[-152,420,0],[152,420,0],[156,122,12],[202,30,30],[56,-28,8]];
function teloA(c,p){
 c.rotate(-.016);
 dveRuki(c,p,RA,'verh');
 c.save();dyh(c,p);
 c.fillStyle=A.pidzhak;gran(c,putA,20);c.fill();
 c.fillStyle=A.pidzhakS;gran(c,[[-56,-28,6],[-202,30,30],[-184,62,10],[-74,10,6]],8);c.fill();
 // shirt in the neckline
 c.fillStyle=A.rub;gran(c,[[-60,-24,4],[60,-24,4],[8,180,4],[-8,180,4]],4);c.fill();
 c.restore();
 sheya(c,p,naA,formaA,A.kozha,A.ten,46,52,-112,-8);
 c.save();dyh(c,p);
 // skin in the open collar
 c.fillStyle=A.kozha;gran(c,[[-42,-12,3],[42,-12,3],[0,30,5]],3);c.fill();
 c.strokeStyle=A.rubT;c.lineWidth=2.4;c.lineCap='round';c.beginPath();c.moveTo(0,30);c.lineTo(0,176);c.stroke();
 // turn-down collar and lapels
 for(const s of [-1,1]){c.fillStyle=A.rub;gran(c,[[s*46,-32,4],[s*66,-10,4],[s*40,34,4],[s*3,26,4]],4);c.fill();c.fillStyle=A.rubT;gran(c,[[s*66,-10,3],[s*70,-2,3],[s*44,40,3],[s*40,34,3]],2);c.fill();}
 for(const s of [-1,1]){c.fillStyle=s<0?A.pidzhakS:A.lackan;gran(c,[[s*60,-24,4],[s*108,0,6],[s*92,38,4],[s*120,52,6],[s*12,186,4],[s*8,164,4]],4);c.fill();}
 c.restore();
 c.save();naA(c,p);golovaA(c,p);c.restore();
}
const RA={S,tw:182,sy:64,pl:[202,30],lok:[166,186],lokN:[56,-24],k0:[72,166],k1:[112,106],w0:43,w1:35,w2:31,D:108,kx:.5,dY:-3,dov0:-.1,dov1:-.14,stol:ST,stolTen:'#9A6A34',
 cvet:'#34507D',svetR:'#42639A',tenR:'#253C60',tenT:'rgba(14,22,40,.32)',tenKist:'rgba(140,80,50,.32)',skl:'#203658',manzh:A.rub,manzhL:12,chasy:['#4A3428','#B8BCC4','#E9ECEF'],kozha:A.kozha,kozhaT:A.ten2};
const rukiA=(c,p)=>{c.rotate(-.016);dveRuki(c,p,RA,'niz');};

Stili.dobavit({id:'trapecii2',nomer:21,imya:'Trapezoids, adults',gruppa:'geo2',
 fon(c,W,H){c.fillStyle='#CFE4EC';c.fillRect(0,0,W,H);c.fillStyle='#E0EEF1';gran(c,[[300,-60,0],[1620,-60,0],[1960,920,0],[-40,920,0]],0);c.fill();},
 stol(c,W,H){c.fillStyle='#EDC78B';gran(c,[[110,STOL,12],[1810,STOL,12],[1990,1036,0],[-70,1036,0]],0);c.fill();c.fillStyle='#DCA862';gran(c,[[-70,1036,0],[1990,1036,0],[2020,1100,0],[-100,1100,0]],0);c.fill();
  // a closed book between the hosts
  c.save();c.translate(960,STOL+40);c.fillStyle='#3E6670';gran(c,[[-86,-16,5],[70,-16,5],[86,12,5],[-70,12,5]],4);c.fill();c.fillStyle='#F4EAD6';gran(c,[[-70,12,2],[86,12,2],[86,20,2],[-70,20,2]],2);c.fill();c.fillStyle='#335660';gran(c,[[-70,20,2],[86,20,2],[86,25,3],[-70,25,3]],2);c.fill();c.restore();},
 L:{x:XL,y:Y,s:S,ramka:[-150,-345,300,345],telo:teloL,ruki:rukiL},
 A:{x:XA,y:Y,s:S,ramka:[-150,-355,300,350],telo:teloA,ruki:rukiA}});
})();
