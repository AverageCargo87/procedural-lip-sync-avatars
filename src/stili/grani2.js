'use strict';
/* Style "Facets, adults": the same manner (heads and bodies are polygons with corners cut at about 135 degrees, hair in facets of two or three tones, a side facet on the face that slides on a turn; light from the middle of the frame, shadow on the outer side of each character), but these are colleagues aged 35-40.
 * Head narrower than the shoulders, a faceted almond eye with an octagonal iris at mid-head, a long lower third, cut jaw and chin. Hands on the table: a faceted sleeve, a chamfered elbow, a slab hand with a thumb.
 * Lena: honey hair in a low octagonal bun (the grown-up answer to the braid), right ear visible, plum jacket, light blouse, crystal pendant. Artem: fair skin, short faceted haircut, grey temples, short beard along the jaw, thin octagonal glasses, dark emerald jacket. */
(function(){
const {lerp,clamp,rot,naGolovu,mnogo}=Kit;
const S=1.6,XL=552,XA=1368,Y=652,STOL=(884-Y)/S,GL={hy:-166,osnova:120},GA={hy:-178,osnova:120};
const naL=(c,p)=>naGolovu(c,p,GL),naA=(c,p)=>naGolovu(c,p,GA);
const sd=p=>({fe:p.yaw*30,fn:p.yaw*46,fm:p.yaw*36,py:p.pitch*12}),chel=p=>p.open*12+p.bite;

/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]. */
function gran(c,pts,r){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}
const lom=(c,P)=>{c.beginPath();c.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)c.lineTo(P[i][0],P[i][1]);};
/** Octagon around a centre: a, b half width and half height. */
const vosem=(c,x,y,a,b,r)=>gran(c,[[x-a*.42,y-b],[x+a*.42,y-b],[x+a,y-b*.42],[x+a,y+b*.42],[x+a*.42,y+b],[x-a*.42,y+b],[x-a,y+b*.42],[x-a,y-b*.42]],r);

/** Adult faceted eye: an eight-point almond, the inner corner lower than the outer, an octagonal iris, a diamond highlight. The lid covers the top quarter of the iris, the lower lid touches its bottom.
 *  o: x,y centre; w slit width; s side -+1; zk; raduzhka, kaima, zrachok; liniya, tol; resn; skladka, nizh, podGlaz. */
function glaz(c,p,o){
 const {x,y,w,s}=o,D=w*(o.zk||.6),h=D*.76,rx=w/2,z=clamp(clamp(p.blink)/.8),gy=p.gy*h*.16,
  xi=x-s*rx,xo=x+s*rx,yi=y+h*.18,yo=y-h*.12,X=t=>lerp(xi,xo,t),Z=t=>lerp(yi,yo,t)+h*.16*Math.sin(Math.PI*t),
  t0=y-h/2+gy*.4,b0=y+h/2-clamp(p.smile-.2)*h*.12+gy*.2,
  V=[[xi,yi,1],[X(.2),lerp(lerp(yi,t0,.8),Z(.2),z),3],[X(.45),lerp(t0,Z(.45),z),4],[X(.77),lerp(t0+h*.07,Z(.77),z),3],[xo,yo,1]],
  N=[[X(.7),lerp(b0,Z(.7)+1,z*z),4],[X(.38),lerp(b0-h*.02,Z(.38)+1,z*z),4],[X(.12),lerp(lerp(yi,b0,.55),Z(.12)+1,z*z),3]];
 if(z<.97){const px=x+p.gx*(rx-D/2)*1.15,py=t0+D*.25+gy*.6;
  c.save();gran(c,[...V,...N],3);c.clip();
  c.fillStyle='#FBF4EE';c.fillRect(x-w,y-w,2*w,2*w);
  c.fillStyle=o.kaima;vosem(c,px,py,D/2,D/2,3);c.fill();
  c.fillStyle=o.raduzhka;vosem(c,px,py,D*.4,D*.4,2);c.fill();
  c.fillStyle=o.zrachok;vosem(c,px,py,D*.23,D*.23,2);c.fill();
  c.strokeStyle='rgba(50,30,40,.24)';c.lineWidth=h*.46;c.lineJoin='round';lom(c,V);c.stroke();
  const bx=px-D*.16,by=py-D*.12,br=D*.11;c.fillStyle='#fff';gran(c,[[bx,by-br*1.2],[bx+br,by],[bx,by+br*1.2],[bx-br,by]],1);c.fill();
  c.restore();}
 c.lineCap=c.lineJoin='round';
 if(o.skladka){const yv=y-h/2;c.strokeStyle=o.skladka;c.lineWidth=2.1;lom(c,[[X(.14),yv-h*.16],[X(.44),yv-h*.42],[X(.86),yv-h*.22]]);c.stroke();}
 if(z<.9){c.globalAlpha=(1-z)*.7;c.strokeStyle=o.nizh;c.lineWidth=1.8;lom(c,[[X(.36),N[1][1]+1.2],[X(.7),N[0][1]+1.2],[xo,yo+1]]);c.stroke();
  if(o.podGlaz){c.globalAlpha=(1-z)*o.podGlaz;c.lineWidth=2.2;lom(c,[[X(.26),y+h*1.02],[X(.6),y+h*1.16],[X(.92),y+h*.84]]);c.stroke();}c.globalAlpha=1;}
 c.strokeStyle=o.liniya;c.lineWidth=o.tol*.66;lom(c,V);c.stroke();c.lineWidth=o.tol;lom(c,V.slice(2));c.stroke();
 if(o.resn){c.fillStyle=o.liniya;c.beginPath();c.moveTo(V[3][0],V[3][1]-o.tol*.4);c.lineTo(xo+s*o.resn,yo-o.resn*.7);c.lineTo(xo,yo+o.tol*.45);c.closePath();c.fill();}
}

/** Faceted brow: thick at the bridge, a break at pik, a thin end at the temple. */
function brov(c,p,o){
 const s=o.s,r=(p.brow+(s<0?p.browL:0))*(o.hod??8),x0=o.x-s*o.dl/2,x2=o.x+s*o.dl/2,xp=lerp(x0,x2,o.pik),y0=o.y-r*1.15,yp=o.y-r-o.izg,y2=o.y-r*.85+o.spad,t=o.tol;
 c.fillStyle=o.cvet;gran(c,[[x0,y0-t*.5,2],[xp,yp-t*.5,2],[x2,y2-t*.14,1],[x2-s*3,y2+t*.22,1],[xp,yp+t*.42,2],[x0,y0+t*.5,2]],2);c.fill();
}

/** Faceted nose: a side plane of the bridge on the shadow side ts (-+1), a hexagon bottom, angled wings. */
function nos(c,p,o){
 const {fe,fn,py}=sd(p),nx=fn,ny=o.y+py,w=o.w,bx=lerp(fe,fn,.4),y0=o.y0+py*.9,s=o.ts;
 c.fillStyle=o.ten;gran(c,[[bx+s*3,y0,1],[nx+s*w*.5,ny-21,2],[nx+s*w*1.02,ny-7,2],[nx+s*w*.4,ny-6,2],[bx,y0+11,1]],2);c.fill();
 gran(c,[[nx-w*.66,ny+1,2],[nx-w*.3,ny-4,2],[nx+w*.3,ny-4,2],[nx+w*.7,ny+1,2],[nx+w*.32,ny+7,2],[nx-w*.32,ny+7,2]],2);c.fill();
 c.strokeStyle=o.lin;c.lineWidth=o.tol;c.lineCap=c.lineJoin='round';c.beginPath();for(const q of [-1,1]){c.moveTo(nx+q*w*.96,ny-6);c.lineTo(nx+q*w*1.02,ny);c.lineTo(nx+q*w*.66,ny+2.5);}c.stroke();
}

/** Mouth only through Kit.rot; a shadow facet under the lower lip. */
function rotT(c,p,o){
 const {fm,py}=sd(p),y=o.rotY+py*1.05,x=fm,H=(p.open*60+p.bite*5)*o.vys,niz=(p.open*3+H*.68)*o.rotK;
 rot(c,p,{x,y,k:o.rotK,cvet:o.rot,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:o.ugolki,ulybka:o.ulybka,zubyOt:o.zubyOt,vys:o.vys,asim:o.asim,liniya:o.rotLin,kontur:o.rotK2,tenPress:o.tenRot});
 c.fillStyle=o.tenRot;c.globalAlpha=(1-clamp(p.press))*.75;gran(c,[[x-12,y+niz+11],[x+12,y+niz+11],[x+7,y+niz+16],[x-7,y+niz+16]],1);c.fill();c.globalAlpha=1;
}

/** Faceted ear with an inner plane. */
function uho(c,p,s,ex,ey,kozha,ten,v){
 const k=1-s*p.yaw*.6;c.save();c.translate(ex,ey);c.scale(s*k,1);
 c.fillStyle=kozha;gran(c,[[-4,-v*.9,2],[12,-v*1.02,3],[19,-v*.5,3],[13,v*.4,3],[4,v*.86,3],[-5,v*.7,2]],3);c.fill();
 c.fillStyle=ten;gran(c,[[2,-v*.62,1],[11,-v*.68,2],[13,-v*.3,2],[7,v*.2,1],[3,v*.08,1]],1);c.fill();c.restore();
}

function sheya(c,p,na,forma,kozha,ten,w0,w1,yv,yn){c.save();gran(c,[[-w0,yv,2],[w0,yv,2],[w1,yn,3],[-w1,yn,3]],2);c.fillStyle=kozha;c.fill();c.clip();na(c,p);c.translate(-3,26);c.fillStyle=ten;forma(c,p);c.fill();c.restore();}

/** Faceted slab hand: fingers joined into one slab with a cut end, thumb toward +y; t 0-1 opening. */
function kist(c,o,t,m){
 const k=o.D/100;c.save();c.scale(k,k*m*(o.uz||1));
 const L=lerp(.92,1,t),b=lerp(.4,.72,t),
  lad=[[-6,-17,2],[42,-22,4],[84*L,-18,5],[97*L,-6,4],[93*L,10,5],[48,19,4],[-6,16,2]],
  pal=()=>{c.save();c.translate(16,8);c.rotate(b);gran(c,[[-4,-10,2],[26,-9,3],[41,-3,4],[39,7,4],[-4,11,2]],3);c.restore();};
 if(o.ten){c.fillStyle=o.ten;pal();c.fill();gran(c,lad,4);c.fill();c.restore();return;}
 c.lineJoin=c.lineCap='round';c.lineWidth=1.7/k;c.strokeStyle=o.kozhaT;
 c.fillStyle=o.kozha;pal();c.fill();c.stroke();
 gran(c,lad,4);c.fill();c.stroke();
 // knuckle facet: lighter at the wrist, the fingers one tone darker
 c.save();gran(c,lad,4);c.clip();c.fillStyle=o.kozhaG;c.fillRect(56*L,-30,60,60);c.restore();
 c.lineWidth=1.9/k;c.beginPath();for(const [y,l] of [[-9.5,28],[-1.5,33],[6.5,26]]){const x1=(y<-5?86:y>3?90:95)*L;c.moveTo(x1-2,y+(y<-5?-.6:.4));c.lineTo(x1-l,y);}c.stroke();
 c.restore();
}

/** Faceted adult arm: the mechanics of Kit.rukaV, the sleeve a polygon, the outer elbow corner chamfered, a slab hand. chast 'verh' | 'niz'. */
function ruka(c,p,o,side,chast){
 const hxP=side<0?p.hLx:p.hRx,hyP=side<0?p.hLy:p.hRy,t=Math.max(clamp(side<0?p.hLo:p.hRo),o.t0??.3),u0=clamp(-hyP/108,0,1.25),uO=clamp(-(side<0?p.hRy:p.hLy)/108,0,1.25),u=u0*lerp(1,.55,clamp((uO-u0)/.12)),ves=1-clamp(-hyP/40),dx=p.lean*22/o.S,dy=(p.bob*6-p.breath*2.2)/o.S,lN=o.lokN,w=o.w1,
  wx=side*lerp(o.k0[0],o.k1[0],u)+hxP*o.kx-dx*ves,wy=lerp(o.k0[1]+(side>0?o.dY:0),o.k1[1],u)-dy*ves,ex=side*(o.lok[0]+lN[0]*u)-dx*ves*.7,ey=o.lok[1]+lN[1]*u-dy*ves*.7,sx=side*o.tw,sy=o.sy,
  a1=Math.atan2(ey-sy,ex-sx),u1x=Math.cos(a1),u1y=Math.sin(a1),f=Math.atan2(wy-ey,wx-ex),cf=Math.cos(f),sf=Math.sin(f),
  bl=Math.hypot(u1x-cf,u1y-sf)||1,bx=(u1x-cf)/bl,by=(u1y-sf)/bl;
 let n1x=-u1y,n1y=u1x,n2x=-sf,n2y=cf;if(n1x*bx+n1y*by<0){n1x=-n1x;n1y=-n1y;}if(n2x*bx+n2y*by<0){n2x=-n2x;n2y=-n2y;}
 const kv=w/Math.max(n1x*bx+n1y*by,.46),px=ex+bx*kv,py=ey+by*kv,fa=w*.42,
  // elbow chamfer: two vertices instead of one
  f1=[px-u1x*fa,py-u1y*fa,4],f2=[px+cf*fa,py+sf*fa,4];
 const plecho=()=>{const g=lerp(o.w0,w,.42),ox=lerp(sx,ex,.42)+n1x*g,oy=lerp(sy,ey,.42)+n1y*g;
  gran(c,[[side*(o.pl[0]-70),o.pl[1]+6,2],[side*o.pl[0],o.pl[1],o.rPl??10],[ox,oy,12],f1,f2,[ex-n1x*w,ey-n1y*w,4],[sx-n1x*o.w0,sy-n1y*o.w0,4]],4);};
 if(chast==='verh'){c.fillStyle=o.cvet;plecho();c.fill();return;}
 const pr=()=>gran(c,[[wx+n2x*o.w2,wy+n2y*o.w2,2],f2,f1,[ex+n1x*w*.2-u1x*w*.6,ey+n1y*w*.2-u1y*w*.6,4],[ex-n2x*w,ey-n2y*w,4],[wx-n2x*o.w2,wy-n2y*o.w2,2]],3),
  rk=f+side*lerp(o.dov0,o.dov1,clamp(u));
 // one sleeve above and on the table; margin for the character's lean
 c.save();c.beginPath();c.rect(-420,o.stol-10,840,400);c.clip();c.fillStyle=o.cvet;plecho();c.fill();c.restore();
 if(ves>.02){c.globalAlpha=ves*.22;c.fillStyle=o.stolTen;gran(c,[[wx-side*78,wy+o.w2+8],[wx+side*40,wy+o.w2+8],[wx+side*30,wy+o.w2+20],[wx-side*70,wy+o.w2+20]],3);c.fill();c.globalAlpha=1;}
 c.save();c.beginPath();c.rect(-420,-80,840,o.stol+80);c.clip();c.translate(-side*5,10);c.fillStyle=o.tenT;pr();c.fill();
 if(ves<1){c.globalAlpha=1-ves;c.translate(side*3,-4);c.translate(wx+cf*7,wy+sf*7);c.rotate(rk);kist(c,{...o,ten:o.tenT},t,side);}c.restore();
 if(side>0&&ves>.02){c.save();c.globalAlpha=ves;c.translate(wx+cf*7-3,wy+sf*7+6);c.rotate(rk);kist(c,{...o,ten:o.tenKist},t,side);c.restore();}
 c.save();c.translate(wx+cf*7,wy+sf*7);c.rotate(rk);kist(c,o,t,side);c.restore();
 c.save();c.translate(wx,wy);c.rotate(f);c.fillStyle=o.manzh;gran(c,[[-8,-o.w2+3],[o.manzhL,-o.w2+4],[o.manzhL+2,o.w2-4],[-8,o.w2-3]],2);c.fill();c.restore();
 // sleeve: a shadow facet below, the base tone on top, a light facet along the top edge
 pr();c.fillStyle=o.tenR;c.fill();c.save();pr();c.clip();c.translate(-6,-9);pr();c.fillStyle=o.cvet;c.fill();
 c.fillStyle=o.svetR;c.beginPath();c.moveTo(lerp(ex,wx,.16)-n2x*w*1.4,lerp(ey,wy,.16)-n2y*w*1.4);c.lineTo(wx-n2x*o.w2*1.4,wy-n2y*o.w2*1.4);c.lineTo(wx-n2x*o.w2*.62,wy-n2y*o.w2*.62);c.lineTo(lerp(ex,wx,.16)-n2x*w*.66,lerp(ey,wy,.16)-n2y*w*.66);c.closePath();c.fill();c.restore();
 c.strokeStyle=o.skl;c.lineWidth=2.6;c.lineJoin='round';c.lineCap='round';const d=w*.7,a=w*.84;c.beginPath();c.moveTo(ex+cf*d-n2x*a,ey+sf*d-n2y*a);c.lineTo(ex+cf*(d+12)-n2x*(a-w*.32),ey+sf*(d+12)-n2y*(a-w*.32));c.lineTo(ex+cf*(d+8)-n2x*(a-w*.66),ey+sf*(d+8)-n2y*(a-w*.66));c.stroke();
 c.fillStyle=o.skl;for(let i=0;i<3;i++){const x=wx-cf*(14+i*11)+n2x*o.w2*.6,y=wy-sf*(14+i*11)+n2y*o.w2*.6;gran(c,[[x,y-3],[x+3,y],[x,y+3],[x-3,y]],.5);c.fill();}
}

// -- Lena, 36: honey shoulder-length hair, side parting, right side behind the ear; light from the right, shadow facet on the left --
const L={kozha:'#F8D8C2',grany:'#F0C9AE',ten:'#E8B597',ten2:'#C68C70',volosy:'#C99A48',volosyT:'#A6782E',volosyS:'#DDB566',brov:'#93652A',liniya:'#3A2630',raduzhka:'#6B7FA0',kaima:'#3C4A64',zrachok:'#1E1824',
 pidzhak:'#8C3A5C',pidzhakT:'#72304B',lackan:'#A04A6C',shov:'#5E2440',bluzka:'#F2EBE6',bluzkaT:'#DCD0CC',kristall:'#B9C8E8',kristallT:'#8C9FCB',zoloto:'#CDA052',
 rot:'#6E2030',rotK2:'#B9585A',yazyk:'#D9707A',tenRot:'#DCA48C',rotY:76,rotK:.64,rotLin:6,ugolki:8,ulybka:1.5,zubyOt:15,vys:.84,asim:.05};
const formaL=(c,p)=>{const j=chel(p),q=p.yaw*7;gran(c,[[-52,-124,12],[52,-124,12],[82,-86,12],[84,24,12],[58,94,12],[22+q,122+j,10],[-22+q,122+j,10],[-58,94,12],[-84,24,12],[-82,-86,12]],12);};
/** Nape and a low bun on the left: the bun is an octagon with a light and a shadow facet, a strand runs to it from the ear. */
function zadL(c,p){const d=-p.yaw*10,x=-92-p.yaw*12+p.hair*5,y=98+p.hair*1.5;
 c.fillStyle=L.volosyT;gran(c,[[-100+d,-120,30],[100+d,-120,30],[104+d,-10,12],[90,40,10],[60,96,8],[-60,100,8],[-100,80,10],[-108+d,-10,12]],12);c.fill();
 gran(c,[[-104,6,4],[-114,56,6],[x+10,y+8,6],[-56,92,6],[-84,30,4]],4);c.fill();
 c.fillStyle=L.volosy;vosem(c,x,y,40,34,6);c.fill();
 c.save();vosem(c,x,y,40,34,6);c.clip();c.fillStyle=L.volosyS;gran(c,[[x-6,y-40],[x+50,y-40],[x+50,y+4],[x+8,y-8]],2);c.fill();c.fillStyle=L.volosyT;gran(c,[[x-50,y-2],[x-8,y+10],[x+14,y+40],[x-50,y+40]],2);c.fill();c.restore();
 c.strokeStyle=L.volosyT;c.lineWidth=2.6;c.lineJoin='round';lom(c,[[x-26,y-18],[x-4,y-26],[x+22,y-14]]);c.stroke();}
/** Front mass: facets from the side parting across the forehead to the left and back to the bun, the top of the left ear covered; on the right the hair is tucked behind the ear. */
const peredL=(c,d,h)=>gran(c,[[30+d,-92,2],[-4+d,-82,8],[-46,-64,10],[-74,-34,8],[-84,-4,4],[-96+h*.3,10,4],[-106+h*.5,22,4],[-108,-12,8],[-105,-72,12],[-80,-126,14],[-20,-148,14],[48,-143,14],[92,-112,12],[101,-60,8],[98,-14,4],[94,-6,3],[84,-12,3],[80,-50,6],[62,-78,6]],8);
function golovaL(c,p){
 const {fe,fn,fm,py}=sd(p),d=p.yaw*14,h=p.hair*9,ey=py*.8,j=chel(p);
 // right ear visible, a crystal earring
 const ex=80-p.yaw*5,eY=14+py*.3;uho(c,p,1,ex,eY,L.kozha,L.ten,30);
 c.fillStyle=L.kristall;gran(c,[[ex+7,eY+28],[ex+12,eY+36],[ex+7,eY+47],[ex+2,eY+36]],1);c.fill();c.fillStyle=L.kristallT;gran(c,[[ex+7,eY+36],[ex+12,eY+36],[ex+7,eY+47]],1);c.fill();
 c.fillStyle=L.kozha;formaL(c,p);c.fill();
 c.save();formaL(c,p);c.clip();
 // side facet of the face on the left, slides on a turn
 c.fillStyle=L.grany;gran(c,[[-160,-110],[-64+fe*.8,-110],[-64+fe*.8,30],[-36+fe*.8,140],[-160,140]],3);c.fill();
 c.save();c.translate(2,10);c.fillStyle=L.ten;peredL(c,d,h);c.fill();c.restore();
 c.fillStyle=L.ten;c.globalAlpha=.26;for(const s of [-1,1]){gran(c,[[s*86,26],[s*50,84+j*.5],[s*76,54]],2);c.fill();}c.globalAlpha=1;
 c.restore();
 c.strokeStyle=L.ten;c.lineWidth=2;c.lineCap='round';c.globalAlpha=.3*clamp(p.smile*2-.4);c.beginPath();for(const s of [-1,1]){c.moveTo(fn*.9+s*21,52+py);c.lineTo(fm+s*36,64+py);}c.stroke();c.globalAlpha=1;
 rotT(c,p,L);
 nos(c,p,{y0:4,y:46,w:13,ts:-1,ten:L.ten,lin:L.ten2,tol:2.2});
 for(const s of [-1,1]){const kg=1-s*p.yaw*.22;
  glaz(c,p,{x:s*37+fe,y:ey,w:36*kg,s,zk:.62,raduzhka:L.raduzhka,kaima:L.kaima,zrachok:L.zrachok,liniya:L.liniya,tol:3.2,resn:4,skladka:L.ten,nizh:L.ten});
  brov(c,p,{x:s*40+fe,y:ey-24,dl:48*kg,tol:6.2,s,cvet:L.brov,izg:5,pik:.62,spad:6});}
 c.fillStyle=L.volosy;peredL(c,d,h);c.fill();
 // hair facets: light at the parting toward the middle of the frame, shadow on the outer strand and the right temple
 c.save();peredL(c,d,h);c.clip();
 c.fillStyle=L.volosyS;gran(c,[[30+d,-92],[-4+d,-82],[-40,-66],[-60,-160],[30+d,-170]],2);c.fill();
 c.fillStyle=L.volosyT;gran(c,[[50,-160],[124,-120],[112,-6],[84,-12],[70,-72]],2);c.fill();
 gran(c,[[-84,-4],[-118,-40],[-118,30]],2);c.fill();
 c.restore();
}
const putL=c=>gran(c,[[-36,-26,6],[36,-26,6],[124,8,10],[158,38,12],[122,128,8],[128,400,0],[-128,400,0],[-122,128,8],[-158,38,12],[-124,8,10]],6);
function teloL(c,p){
 c.rotate(.02);
 c.save();naL(c,p);zadL(c,p);c.restore();
 for(const s of [-1,1])ruka(c,p,RL,s,'verh');
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=L.pidzhak;putL(c);c.fill();
 // shadow facet on the left side
 c.save();putL(c);c.clip();c.fillStyle=L.pidzhakT;gran(c,[[-96,40],[-170,20],[-170,400],[-86,400]],2);c.fill();c.restore();
 c.fillStyle=L.bluzka;gran(c,[[-44,-16,2],[44,-16,2],[10,214,2],[-10,214,2]],2);c.fill();
 c.fillStyle=L.kozha;gran(c,[[-32,-24,2],[32,-24,2],[12,36,3],[0,48,3],[-12,36,3]],2);c.fill();
 c.restore();
 sheya(c,p,naL,formaL,L.kozha,L.ten,29,32,-100,-12);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 // chain and crystal pendant
 c.strokeStyle=L.zoloto;c.lineWidth=2;c.lineJoin='round';lom(c,[[-30,-10],[-12,16],[0,22],[12,16],[30,-10]]);c.stroke();
 c.fillStyle=L.kristall;gran(c,[[0,20],[7,28],[0,42],[-7,28]],1);c.fill();c.fillStyle=L.kristallT;gran(c,[[0,28],[7,28],[0,42]],1);c.fill();
 // faceted blouse neckline
 c.fillStyle=L.bluzkaT;for(const s of [-1,1]){gran(c,[[s*2,48,2],[s*34,-20,2],[s*42,-14,2],[s*10,52,2]],2);c.fill();}
 // lapels: a light facet toward the middle, a seam
 for(const s of [-1,1]){c.fillStyle=L.lackan;gran(c,[[s*44,-18,2],[s*82,4,2],[s*70,34,2],[s*94,44,2],[s*10,216,2],[s*6,194,2]],2);c.fill();}
 c.strokeStyle=L.shov;c.lineWidth=3;c.lineCap=c.lineJoin='round';c.beginPath();for(const s of [-1,1]){c.moveTo(s*70,34);c.lineTo(s*94,44);c.lineTo(s*10,216);}c.stroke();
 c.restore();
 c.save();naL(c,p);golovaL(c,p);c.restore();
}
const RL={S,tw:140,sy:60,pl:[158,38],lok:[132,178],lokN:[52,-22],k0:[62,160],k1:[94,100],w0:33,w1:28,w2:26,D:96,uz:.92,kx:.5,dY:-3,dov0:-.1,dov1:-.14,stol:STOL,stolTen:'#3A3870',cvet:'#96406A',tenR:'#78334F',svetR:'#A85479',tenT:'rgba(60,20,40,.28)',tenKist:'rgba(130,70,60,.34)',skl:'#5E2440',manzh:L.bluzka,manzhL:11,kozha:L.kozha,kozhaG:L.grany,kozhaT:L.ten2};
const rukiL=(c,p)=>{c.rotate(.02);for(const s of [-1,1])ruka(c,p,RL,s,'niz');};

// -- Artem, 38: fair skin, short faceted haircut, grey temples, stubble, octagonal glasses; light from the left, shadow facet on the right --
const A={kozha:'#EFC7A8',grany:'#E6BB9B',ten:'#D6A382',ten2:'#AE7F62',volosy:'#3E3330',volosyT:'#2B2422',volosyS:'#5A4B45',sedina:'#A59C97',sedina2:'#776B66',shchetina:'#CBA894',boroda:'#4E413B',borodaS:'#5F504A',brov:'#3A2E28',liniya:'#241A18',raduzhka:'#5E4A36',kaima:'#33281E',zrachok:'#1A1310',ochki:'#2E2A36',
 pidzhak:'#2A6A58',pidzhakT:'#205546',lackan:'#327A67',shov:'#1A4A3D',rub:'#E6EAEE',rubT:'#C9D0D8',rot:'#5B1C28',rotK2:'#B4766A',yazyk:'#D9707A',tenRot:'#3A2F2A',rotY:82,rotK:.68,rotLin:5,ugolki:7,ulybka:1.4,zubyOt:15,vys:.84,asim:-.05};
const formaA=(c,p)=>{const j=chel(p),q=p.yaw*9;gran(c,[[-58,-126,12],[58,-126,12],[88,-86,12],[89,40,12],[74,100,12],[34+q,132+j,10],[-34+q,132+j,10],[-74,100,12],[-89,40,12],[-88,-86,12]],12);};
/** Short faceted haircut: volume up and to the right, short temples, a slightly receding hairline at the temples. */
const perA=(c,d,h)=>gran(c,[[-80,26,2],[-89,26,2],[-90,-18,4],[-96,-44,6],[-98,-96,10],[-72,-134,12],[-24+d,-152+h,12],[42+d,-158+h,12],[88+d*.5,-134,12],[100,-96,10],[96,-44,6],[90,-18,4],[89,26,2],[81,26,2],[80,-36,6],[66,-66,6],[24+d,-84,8],[-24+d,-82,8],[-60,-70,6],[-76,-42,6],[-79,-18,4]],6);
/** Short beard: an even facet on top from the sideburn to the mouth corner and to the moustache, the lower cheeks covered. */
const borodaA=(c,p,fn,fm,py,j)=>{const q=p.yaw*9,m=fn*.85,r=fm*.8;gran(c,[[-90,28,2],[-91,66,6],[-76,106,8],[-36+q,135+j,8],[36+q,135+j,8],[76,106,8],[91,66,6],[90,28,2],[82,30,2],[74,72,4],[50+r*.5,86+py,4],[40+m*.7,66+py,3],[14+m,56+py,3],[m,59+py,2],[-14+m,56+py,3],[-40+m*.7,66+py,3],[-50+r*.5,86+py,4],[-74,72,4],[-82,30,2]],4);};
function ochki(c,p,fe,ey){
 const R=29,y=ey+3,kL=1+p.yaw*.2,kR=1-p.yaw*.2;c.strokeStyle=A.ochki;c.lineWidth=3;c.lineJoin=c.lineCap='round';
 for(const [s,k] of [[-1,kL],[1,kR]]){const x=s*41+fe;vosem(c,x,y,R*k,R*.82,4);c.stroke();}
 c.beginPath();c.moveTo(-41+fe+R*kL,y-8);c.lineTo(fe-6,y-12);c.lineTo(fe+6,y-12);c.lineTo(41+fe-R*kR,y-8);c.moveTo(-41+fe-R*kL,y-6);c.lineTo(-88-p.yaw*5,y-9);c.moveTo(41+fe+R*kR,y-6);c.lineTo(88-p.yaw*5,y-9);c.stroke();
 // a glint on the glass as a thin facet
 c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=3;c.beginPath();for(const [s,k] of [[-1,kL],[1,kR]]){const x=s*41+fe;c.moveTo(x-R*k*.7,y-R*.3);c.lineTo(x-R*k*.36,y-R*.62);}c.stroke();
}
function golovaA(c,p){
 const {fe,fn,fm,py}=sd(p),d=p.yaw*14,h=p.hair*3,ey=py*.8,j=chel(p);
 for(const s of [-1,1])uho(c,p,s,s*86-p.yaw*5,16+py*.3,A.kozha,A.ten,32);
 c.fillStyle=A.kozha;formaA(c,p);c.fill();
 c.save();formaA(c,p);c.clip();
 // side facet of the face on the right, slides on a turn
 c.fillStyle=A.grany;gran(c,[[160,-110],[68+fe*.8,-110],[68+fe*.8,40],[40+fe*.8,150],[160,150]],3);c.fill();
 c.save();c.translate(-2,10);c.fillStyle=A.ten;perA(c,d,h);c.fill();c.restore();
 c.fillStyle=A.ten;c.globalAlpha=.3;for(const s of [-1,1]){gran(c,[[s*90,24],[s*56,80],[s*80,52]],2);c.fill();}c.globalAlpha=1;
 c.restore();
 // beard: a soft edge in stubble tone, the mass, a light facet toward the middle of the frame
 c.save();c.translate(0,-3);c.fillStyle=A.shchetina;borodaA(c,p,fn,fm,py,j);c.fill();c.restore();
 c.fillStyle=A.boroda;borodaA(c,p,fn,fm,py,j);c.fill();
 c.save();borodaA(c,p,fn,fm,py,j);c.clip();c.fillStyle=A.borodaS;gran(c,[[-120,0],[-74,0],[-58,96],[-20+p.yaw*9,160],[-120,160]],2);c.fill();c.restore();
 rotT(c,p,A);
 nos(c,p,{y0:2,y:48,w:16,ts:1,ten:A.ten,lin:A.ten2,tol:2.4});
 for(const s of [-1,1]){const kg=1-s*p.yaw*.22;
  glaz(c,p,{x:s*40+fe,y:ey,w:37*kg,s,raduzhka:A.raduzhka,kaima:A.kaima,zrachok:A.zrachok,liniya:A.liniya,tol:3,skladka:A.ten,nizh:A.ten,podGlaz:.24});
  brov(c,p,{x:s*43+fe,y:ey-25,dl:54*kg,tol:7.8,s,cvet:A.brov,izg:3.5,pik:.6,spad:3});}
 ochki(c,p,fe,ey);
 c.fillStyle=A.volosy;perA(c,d,h);c.fill();
 c.save();perA(c,d,h);c.clip();
 // light on the left half of the forelock, shadow on the right, grey temples in two steps
 c.fillStyle=A.volosyS;gran(c,[[-24+d,-170],[42+d,-176],[20+d,-90],[-30+d,-84],[-70,-120]],2);c.fill();
 c.fillStyle=A.volosyT;gran(c,[[42+d,-176],[120,-150],[110,-60],[66,-66],[24+d,-84]],2);c.fill();
 for(const s of [-1,1]){c.fillStyle=A.sedina2;gran(c,[[s*70,-70],[s*124,-80],[s*124,-2],[s*80,6]],2);c.fill();c.fillStyle=A.sedina;gran(c,[[s*84,-50],[s*124,-58],[s*124,-18],[s*86,-12]],2);c.fill();}
 c.restore();
}
const putA=c=>gran(c,[[-56,-28,6],[56,-28,6],[152,8,10],[192,38,12],[158,132,8],[162,400,0],[-162,400,0],[-158,132,8],[-192,38,12],[-152,8,10]],6);
function teloA(c,p){
 c.rotate(-.02);
 for(const s of [-1,1])ruka(c,p,RA,s,'verh');
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=A.pidzhak;putA(c);c.fill();
 c.save();putA(c);c.clip();c.fillStyle=A.pidzhakT;gran(c,[[120,40],[200,20],[200,400],[110,400]],2);c.fill();c.restore();
 c.fillStyle=A.rub;gran(c,[[-60,-24,2],[60,-24,2],[6,226,2],[-6,226,2]],2);c.fill();
 c.restore();
 sheya(c,p,naA,formaA,A.kozha,A.ten,44,50,-110,-8);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=A.kozha;gran(c,[[-40,-12,2],[40,-12,2],[14,22,2],[0,30,2],[-14,22,2]],2);c.fill();
 c.fillStyle=A.rubT;gran(c,[[-2,30],[2,30],[3,226],[-3,226]],1);c.fill();
 for(const s of [-1,1]){c.fillStyle=A.rubT;gran(c,[[s*42,-32,2],[s*64,-12,2],[s*40,32,2],[s*2,26,2]],2);c.fill();c.fillStyle=A.rub;gran(c,[[s*42,-32,2],[s*61,-13,2],[s*38,27,2],[s*4,22,2]],2);c.fill();}
 for(const s of [-1,1]){c.fillStyle=A.lackan;gran(c,[[s*62,-24,2],[s*106,2,2],[s*90,40,2],[s*118,54,2],[s*8,234,2],[s*6,214,2]],2);c.fill();}
 c.strokeStyle=A.shov;c.lineWidth=3;c.lineCap=c.lineJoin='round';c.beginPath();for(const s of [-1,1]){c.moveTo(s*90,40);c.lineTo(s*118,54);c.lineTo(s*8,234);}c.stroke();
 c.restore();
 c.save();naA(c,p);golovaA(c,p);c.restore();
}
const RA={S,tw:174,sy:64,pl:[191,38],lok:[160,184],lokN:[56,-24],k0:[72,164],k1:[110,104],w0:41,w1:34,w2:31,D:108,kx:.5,dY:-3,dov0:-.1,dov1:-.14,stol:STOL,stolTen:'#3A3870',cvet:'#2F7462',tenR:'#235A4B',svetR:'#3D8673',tenT:'rgba(10,40,30,.3)',tenKist:'rgba(130,70,60,.34)',skl:'#1A4A3D',manzh:A.rub,manzhL:12,kozha:A.kozha,kozhaG:A.grany,kozhaT:A.ten2};
const rukiA=(c,p)=>{c.rotate(-.02);for(const s of [-1,1])ruka(c,p,RA,s,'niz');};

Stili.dobavit({id:'grani2',nomer:22,imya:'Facets, adults',gruppa:'geo2',
 fon(c,W,H){c.fillStyle='#E7E5F2';c.fillRect(0,0,W,H);c.fillStyle='#DDDBEE';mnogo(c,[[-40,-40],[620,-40],[300,560],[-40,760]],0);c.fill();mnogo(c,[[1960,120],[1960,920],[1420,920],[1620,380]],0);c.fill();c.fillStyle='#F0EFF8';mnogo(c,[[760,-40],[1320,-40],[1180,420],[900,520]],0);c.fill();},
 stol(c,W,H){c.fillStyle='#7A78B6';gran(c,[[-60,990,0],[70,884,10],[1850,884,10],[1980,990,0],[1980,1140,0],[-60,1140,0]],0);c.fill();c.fillStyle='#9492C8';gran(c,[[60,884,6],[1860,884,6],[1872,896,4],[48,896,4]],2);c.fill();c.fillStyle='#5A5896';gran(c,[[-60,1030,0],[1980,1030,0],[1980,1140,0],[-60,1140,0]],0);c.fill();
  // a closed book lying flat: top cover, page edge, bottom cover
  c.save();c.translate(924,946);c.scale(.8,1);c.fillStyle='#5E5C96';c.globalAlpha=.35;gran(c,[[-126,10,4],[136,10,4],[130,20,4],[-120,20,4]],4);c.fill();c.globalAlpha=1;
  c.fillStyle='#466F94';gran(c,[[-104,-34,3],[106,-34,3],[124,-12,2],[-122,-12,2]],2);c.fill();c.fillStyle='#F1ECE4';gran(c,[[-108,-12,1],[124,-12,1],[124,4,1],[-108,4,1]],1);c.fill();c.fillStyle='#355A7C';gran(c,[[-122,-12,2],[-108,-12,1],[-108,4,1],[124,4,1],[120,12,2],[-118,12,2]],1);c.fill();c.restore();},
 L:{x:XL,y:Y,s:S,ramka:[-145,-340,290,340],telo:teloL,ruki:rukiL},
 A:{x:XA,y:Y,s:S,ramka:[-145,-355,290,350],telo:teloA,ruki:rukiA}});
})();
