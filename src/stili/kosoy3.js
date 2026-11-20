'use strict';
/* Style "Slanted cube, simple adults": the drawing of the original kosoy (parallelograms with a 9 degree skew mirrored between the characters, a pill eye, a wedge nose, one light facet on the hair).
 * Age comes only from proportions and features: head narrower than the shoulders, a wide jaw with rounded corners, a visible neck, eyes at mid-head, a nose with a bridge, a facet under the cheekbone instead of blush.
 * Clothes are the flat shapes of the original, grown up: Lena wears a turquoise blouse with a rounded cream collar, Artem a mustard cardigan over a shirt with a turn-down collar.
 * Artem has fair skin, a beard in his hair colour with arched moustache and a spot under the lip, a short grey wedge above the ear; Lena has a bob below the chin. Hands rest on the table edge. */
(function(){
const {lerp,clamp,sdvig,rot,naGolovu}=Kit;
const S=1.6,SK=.158,Y=652;

/** The original's pill eye with a lid: the top is cut by an arc. o: x,y,w,h; zk iris width, zh its height (shares of the eye); blik highlight size; veko 0-1; izg lid curve (smaller is straighter);
 *  vl how far the lid line reaches (share of the half width); cvet; lin lid line colour, tol thickness. */
function glaz(c,p,o){
 const {x,y,w,h}=o,rx=w/2,ry=h/2,z=clamp(clamp(p.blink)/.8),sm=y+ry*.4,top=lerp(y-ry+h*o.veko,sm,z),niz=lerp(y+ry+1,sm,z*z),iz=ry*o.izg*(1-z);
 if(z<.97){const zw=w*o.zk,zh=h*o.zh,px=x+p.gx*(rx-zw/2+w*.03)*1.25,py=y+h*.06+p.gy*h*.1;
  c.save();c.beginPath();c.roundRect(x-rx,y-ry,w,h,rx);c.clip();
  c.beginPath();c.moveTo(x-w,top+iz*2);c.quadraticCurveTo(x,top-iz*2,x+w,top+iz*2);c.lineTo(x+w,niz);c.lineTo(x-w,niz);c.closePath();c.clip();
  c.fillStyle='#fff';c.fillRect(x-w,y-h,2*w,2*h);
  c.fillStyle=o.cvet;c.beginPath();c.roundRect(px-zw/2,py-zh/2,zw,zh,zw/2);c.fill();
  // a small highlight: a big white highlight makes the eye look like a doll's
  c.fillStyle='#fff';c.beginPath();c.ellipse(px-zw*.2,py-zh*.2,zw*o.blik,zh*o.blik*.85,0,0,6.3);c.fill();c.restore();
  const v=o.vl;c.globalAlpha=1-z;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol;c.beginPath();c.moveTo(x-rx*v,top+iz*.54*v*v);c.quadraticCurveTo(x,top-iz*.54*v*v,x+rx*v,top+iz*.54*v*v);c.stroke();c.globalAlpha=1;}
 const a=clamp((clamp(p.blink)-.3)/.35);if(a>0){c.globalAlpha=a;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol+1;c.beginPath();c.moveTo(x-rx*.95,sm+3);c.quadraticCurveTo(x,sm-7,x+rx*.95,sm+3);c.stroke();c.globalAlpha=1;}
}
/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]. No beginPath: several polygons form one shape. */
function obvod(c,pts,r){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}
function gran(c,pts,r){c.beginPath();obvod(c,pts,r);}
/** Head: the neck point, then part of the skew is removed so the head leans less than the body. pr is how much skew to return. */
function golova(c,p,G,pr){naGolovu(c,p,G);if(pr)c.transform(1,0,pr,1,0,0);}

/** Slab brow close to the eye. o: x,y centre; dl length; tol thickness; side -+1; izl arc height (its top in the outer third); nak how much lower the outer end is;
 *  ti, to half thickness at the bridge and at the temple (shares of tol); r corner radius. */
function brov(c,p,o){
 const s=o.side,y=o.y-(p.brow+(s<0?p.browL:0))*9,h=o.dl/2,t=o.tol,iz=(o.izl||0)+p.brow*2,xi=o.x-s*h,xo=o.x+s*h,xk=o.x+s*h*.34,n=o.nak||0,ti=o.ti??.5,to=o.to??.22;
 obvod(c,[[xi,y+t*ti],[xk,y-iz+t*.44,o.r],[xo,y+n+t*to],[xo-s*3,y+n-t*to],[xk,y-iz-t*.5,o.r],[xi,y-t*ti]],3);
}
/** Lower lip on a beard: a lip patch under the mouth that moves with the lower lip; on v, f it widens and rises under the upper teeth. Drawn before the mouth, the mouth goes on top. */
function guba(c,p,o,x,y,k){
 const b=clamp(p.bite),H=(p.open*60)*.84,By=p.open*3+H*.68,hw=50*(1+.3*p.wide-.42*p.round-.1*p.press),w=hw*lerp(o.gubaW,.78,b),t=lerp(By+5,By-4,b),gh=lerp(10,14,b);
 c.fillStyle=o.guba;c.beginPath();c.roundRect(x-w*k,y+t*k,2*w*k,gh*k,gh*k/2);c.fill();
}
/** Face: features are skewed with the head and shifted toward the partner by sm. */
function lico(c,p,o){
 const {fe,fn,fm,py}=sdvig(p,.85),ey=o.glY+py*.8,sm=o.sm,mx=sm+fm+(o.rotX||0),my=o.rotY+py*1.05,k=o.rotK*(1+(o.okrug||0)*clamp(p.round));
 // on a beard: for v, f the lower lip under the teeth is a separate shape, not a second band of the mouth
 let pr=p,zOt=15;if(o.guba){guba(c,p,o,mx,my,k);if(p.bite>.02){pr=Object.assign({},p,{bite:0});zOt=lerp(15,1,clamp(p.bite));}}
 rot(c,pr,{x:mx,y:my,k,cvet:o.rot,kontur:o.rotKontur,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:8,ulybka:1.5,zubyOt:zOt,vys:.84,asim:o.asim,liniya:o.rotLin||8,tenPress:o.ten});
 // nose: a wedge with a bridge, narrow at the top, wider toward the tip and toward the partner
 const nx=sm+fn+o.nosS,ny=o.nosY+py,ns=Math.sign(o.nosS);c.fillStyle=o.nos;gran(c,[[nx-ns*5,ny-35,3],[nx+ns*1,ny-35,3],[nx+ns*14,ny+7],[nx+ns*8,ny+14],[nx-ns*10,ny+14],[nx-ns*7,ny+4]],5);c.fill();
 for(const s of [-1,1])glaz(c,p,{x:sm+s*o.glX+fe,y:ey,w:o.glW,h:o.glH,zk:.63,zh:.68,blik:.12,veko:o.veko,izg:o.izg,vl:o.vl,cvet:o.zrachok,lin:o.lin,tol:o.linT});
 c.fillStyle=o.brovi;c.beginPath();for(const s of [-1,1])brov(c,p,{x:sm+s*o.glX+fe,y:ey-o.brY,dl:o.brDl,tol:o.brTol,side:s,izl:o.brIzl,nak:o.brNak,ti:o.brTi,to:o.brTo,r:o.brR});c.fill();
}

// the lower (left) hand: where it lies and its shape; the upper hand's shadow is clipped to it and does not fall on the table
let kistNiz=null,kistNizP=()=>{};
/** Arm on the table: the mechanics of Kit.rukaV (the elbow nearly stays, the forearm swings around it), the drawing of the original: the sleeve is one polygon from shoulder to wrist, an angled elbow, a cuff strip, a slab hand with the thumb in the same shape.
 *  o: pl [outer x,y, inner x,y] shoulder; lok elbow at rest, lokN its shift at the peak; k0,k1 wrist at rest and at the peak; w1,w2 half width at elbow and wrist; kw hand width, D length;
 *  kx share of sideways travel; dY right wrist higher at rest; dov0,dov1 hand rotation; cvet, manzh, kist, tenKist. */
function ruka(c,p,o,side){
 const hxP=side<0?p.hLx:p.hRx,hyP=side<0?p.hLy:p.hRy,otkr=clamp(side<0?p.hLo:p.hRo),
  u0=clamp(-hyP/108,0,1.25),uO=clamp(-(side<0?p.hRy:p.hLy)/108,0,1.25),u=u0*lerp(1,.55,clamp((uO-u0)/.12)),
  ves=1-clamp(-hyP/40),dx=p.lean*22/S,dy=(p.bob*6-p.breath*2.2)/S,w1=o.w1,w2=o.w2,
  wx=side*lerp(o.k0[0],o.k1[0],u)+hxP*o.kx-dx*ves,wy=lerp(o.k0[1]+(side>0?o.dY:0),o.k1[1],u)-dy*ves,
  ex=side*(o.lok[0]+o.lokN[0]*u)-dx*ves*.7,ey=o.lok[1]+o.lokN[1]*u-dy*ves*.7,
  Ox=side*o.pl[0],Oy=o.pl[1],Ix=side*o.pl[2],Iy=o.pl[3],sx=(Ox+Ix)/2,sy=(Oy+Iy)/2,
  l1=Math.hypot(ex-sx,ey-sy)||1,u1x=(ex-sx)/l1,u1y=(ey-sy)/l1,f=Math.atan2(wy-ey,wx-ex),cf=Math.cos(f),sf=Math.sin(f);
 // b points outward from the elbow bend; n1, n2 are the upper arm and forearm normals on the same side
 let bx=u1x-cf,by=u1y-sf;const bl=Math.hypot(bx,by)||1;bx/=bl;by/=bl;
 let n1x=-u1y,n1y=u1x,n2x=-sf,n2y=cf;if(n1x*bx+n1y*by<0){n1x=-n1x;n1y=-n1y;}if(n2x*bx+n2y*by<0){n2x=-n2x;n2y=-n2y;}
 // elbow corners: intersection of the upper arm and forearm sides, no further than lim from the joint
 const ugol=(ax,ay,qx,qy,zn,lim)=>{const dax=ex+zn*n1x*w1-ax,day=ey+zn*n1y*w1-ay,dqx=ex+zn*n2x*w1-qx,dqy=ey+zn*n2y*w1-qy,z=dax*dqy-day*dqx;
   let X=ex+zn*bx*w1,Yy=ey+zn*by*w1;if(Math.abs(z)>1e-3){const t=((qx-ax)*dqy-(qy-ay)*dqx)/z;X=ax+dax*t;Yy=ay+day*t;}
   const d=Math.hypot(X-ex,Yy-ey);if(d>lim*w1){X=ex+(X-ex)*lim*w1/d;Yy=ey+(Yy-ey)*lim*w1/d;}return [X,Yy];},
  Wo=[wx+n2x*w2,wy+n2y*w2],Wi=[wx-n2x*w2,wy-n2y*w2],Po=ugol(Ox,Oy,Wo[0],Wo[1],1,1.7),Pi=ugol(Ix,Iy,Wi[0],Wi[1],-1,1.6);
 const rk=f+side*lerp(o.dov0,o.dov1,clamp(u)),U=side,h=o.kw,D=o.D,tp=otkr*.3;
 // hand: a slab, the thumb as a separate lobe on top (toward the body), a deep notch before the index finger, fingers cut diagonally
 const kist=()=>gran(c,[[-6,U*h*.42,6],[D*.18,U*h*(.56+tp),12],[D*(.46-tp*.1),U*h*(.66+tp*1.3),9],[D*(.6-tp*.1),U*h*(.5+tp),7],[D*.48,U*h*.26,2],[D*.74,U*h*.42,9],[D,U*h*.12,13],[D*.95,-U*h*.3,12],[D*.55,-U*h*.48,10],[-6,-U*h*.42,6]],10);
 // the upper hand's shadow falls only on the lower hand, not on the table
 if(side>0&&ves>.02&&kistNiz){c.save();const m=c.getTransform();c.setTransform(kistNiz);kistNizP();c.clip();c.setTransform(m);c.globalAlpha=ves*.55;c.translate(wx+cf*8-3,wy+sf*8+7);c.rotate(rk);c.fillStyle=o.tenKist;kist();c.fill();c.restore();}
 c.save();c.translate(wx+cf*8,wy+sf*8);c.rotate(rk);c.fillStyle=o.kist;kist();c.fill();if(side<0){kistNiz=c.getTransform();kistNizP=kist;}c.restore();
 c.save();c.translate(wx,wy);c.rotate(f);c.fillStyle=o.manzh;gran(c,[[-6,-w2+3],[13,-w2+4],[13,w2-4],[-6,w2-3]],3);c.fill();c.restore();
 c.fillStyle=o.cvet;gran(c,[[Ox,Oy,16],[Po[0],Po[1],o.rLok??10],[Wo[0],Wo[1],3],[Wi[0],Wi[1],3],[Pi[0],Pi[1],8],[Ix,Iy,10]],8);c.fill();
}
const dveRuki=(c,p,o,sk)=>{c.save();c.transform(1,0,sk,1,0,0);kistNiz=null;ruka(c,p,o,-1);ruka(c,p,o,1);kistNiz=null;c.restore();};

// -- Lena, 36: copper bob below the chin, side parting toward the partner, right side behind the ear; turquoise blouse with a rounded cream collar --
const L={kozha:'#FCD6BE',ten:'#EDB396',skula:'#F8CEB4',volosy:'#CB552B',volosyT:'#A3421F',svet:'#E07744',bluzka:'#1F7077',rukav:'#165A60',vorot:'#F8ECD9',serga:'#E5B44C',
 nos:'#F0B395',rot:'#8A2A3C',yazyk:'#E57A7A',zrachok:'#2D2230',brovi:'#8F3B20',lin:'#2D2230',linT:5,
 glX:44,glY:4,glW:31,glH:35,veko:.2,izg:.42,vl:1,brY:30,brDl:44,brTol:6.5,brIzl:6,brNak:0,brTi:.36,brTo:.28,brR:14,nosY:44,nosS:3,rotX:6,rotY:78,rotK:.64,asim:.02,sm:8};
const GL={hy:-154,osnova:120},PL=SK-.052;
function teloL(c,p){
 c.save();c.transform(1,0,-SK,1,0,0);
 const dz=-p.yaw*8,h=p.hair*14;
 // back mass of the bob: straight sides, an even cut above the shoulders
 c.save();golova(c,p,GL,PL);c.fillStyle=L.volosyT;gran(c,[[-116+dz,-128,46],[116+dz,-128,46],[126+dz,40,20],[130+dz+h,128,10],[66,138,8],[-66,138,8],[-132+dz+h,128,10],[-126+dz,40,20]],20);c.fill();c.restore();
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 // the neck goes into a small blouse neckline; the blouse is one plane, the collar two rounded lobes
 c.fillStyle=L.ten;gran(c,[[-31,-90,4],[31,-90,4],[35,-14,6],[2,32,8],[-35,-14,6]],6);c.fill();
 c.fillStyle=L.bluzka;gran(c,[[-42,-8,10],[2,36,6],[46,-8,10],[108,14,22],[136,120,10],[142,330,10],[-142,330,10],[-136,120,10],[-108,14,22]],20);c.fill();
 c.fillStyle=L.vorot;c.beginPath();for(const s of [-1,1])obvod(c,[[s*5,40,4],[s*40,-12,8],[s*82,4,26],[s*54,50,22]],8);c.fill();
 c.restore();
 c.save();golova(c,p,GL,PL);const e=-p.yaw*8;
 // ear visible on the right: the strand is tucked
 c.fillStyle=L.kozha;gran(c,[[90+e,-6,10],[112+e,-4,12],[110+e,36,12],[92+e,40,8]],10);c.fill();
 // the face is almost square, as in the original, but longer: a wide jaw with rounded corners
 c.fillStyle=L.kozha;gran(c,[[-95,-124,36],[95,-124,30],[97,20,34],[88,80,30],[46,114,26],[-46,114,26],[-88,80,30],[-97,20,34]],26);c.fill();
 // one flat facet under the cheekbone, from the ear to the mouth corner, where the original had blush
 // (04.11: Lena's cheekbone facet removed, in the scene it read as a light patch)
 lico(c,p,L);
 c.fillStyle=L.serga;c.beginPath();c.arc(103+e,50,5.5,0,6.3);c.fill();
 // front mass: a plane from the parting across the forehead to the left temple and down below the chin; on the right tucked behind the ear
 const d=p.yaw*9+L.sm*.5,pr=28+d,dy=p.pitch*5;
 const v=[[-120,-150,40],[pr,-172,20],[118,-148,40],[124,-20,12],[106,-8,8],[92,-34,10],[86,-62,16],[pr,-100+dy,5],[-52+d,-66+dy,30],[-90,-12,10],[-92,118,6],[-120+h,128,8],[-128,40,16]];
 c.fillStyle=L.volosy;gran(c,v,18);c.fill();
 c.save();gran(c,v,18);c.clip();c.fillStyle=L.svet;gran(c,[[pr,-200],[-200,-200],[-200,-30],[-66+d,-84+dy],[pr,-130+dy]],4);c.fill();c.restore();
 c.restore();c.restore();
}
// forearms rest on the table edge, elbows by the body: the silhouette is no wider than the shoulders
const RL={pl:[164,34,94,8],lok:[132,126],lokN:[30,-14],k0:[44,130],k1:[96,78],w1:27,w2:23,kw:48,D:112,kx:.5,dY:-7,dov0:.02,dov1:-.4,rLok:12,cvet:L.rukav,manzh:L.vorot,kist:L.kozha,tenKist:'#D79A7C'};
const rukiL=(c,p)=>dveRuki(c,p,RL,-SK);

// -- Artem, 38: fair skin, short haircut with a parting, a grey wedge above the ear, a beard in his hair colour with a moustache; mustard cardigan, shirt with a turn-down collar and no tie --
const A={kozha:'#EFC7A8',ten:'#D6A382',skula:'#E5B999',volosy:'#3A2D2A',svet:'#54433E',sedina:'#8A7F79',boroda:'#4A3A33',borodaT:'#3F302B',guba:'#CF8A7C',gubaW:.45,
 kardigan:'#D2A03E',rukav:'#B88A2F',rub:'#EEE1CB',vorot:'#FBF4E8',
 nos:'#DDA27F',rot:'#5A1A26',rotKontur:'#AA4351',rotLin:9.5,yazyk:'#EC7682',zrachok:'#2A1E1E',brovi:'#3A2D2A',lin:'#2F211F',linT:7,
 glX:45,glY:6,glW:32,glH:33,veko:.24,izg:.16,vl:.9,brY:25,brDl:42,brTol:10,brIzl:1,brNak:2,nosY:42,nosS:-3,rotX:0,rotY:80,rotK:.7,okrug:.3,asim:-.04,sm:-8};
const GA={hy:-158,osnova:122},PA=-(SK-.087);
function teloA(c,p){
 c.save();c.transform(1,0,SK,1,0,0);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 // shirt, neck in the open collar, a cardigan without lapels, the shirt's turn-down collar on top
 c.fillStyle=A.rub;gran(c,[[-56,-14,6],[56,-14,6],[58,170,4],[-58,170,4]],6);c.fill();
 c.fillStyle=A.ten;gran(c,[[-38,-92,4],[38,-92,4],[40,-14,6],[2,30,8],[-40,-14,6]],6);c.fill();
 c.fillStyle=A.kardigan;gran(c,[[-54,-8,10],[0,124,8],[54,-8,10],[122,14,22],[152,120,10],[158,330,10],[-158,330,10],[-152,120,10],[-122,14,22]],20);c.fill();
 c.fillStyle=A.vorot;c.beginPath();for(const s of [-1,1])obvod(c,[[s*6,32,3],[s*40,-20,6],[s*64,-8,6],[s*44,44,4]],5);c.fill();
 c.restore();
 c.save();golova(c,p,GA,PA);const e=-p.yaw*10,d=p.yaw*9+A.sm*.5,h=p.hair*8,dy=p.pitch*5,sm=A.sm;
 c.fillStyle=A.kozha;gran(c,[[92+e,-8,12],[114+e,-4,12],[110+e,40,12],[92+e,42,8]],12);c.fill();
 c.fillStyle=A.ten;gran(c,[[101+e,4,5],[108+e,8,5],[106+e,30,5],[101+e,30,4]],5);c.fill();
 // the face widens toward the bottom: a wide jaw under the beard
 c.fillStyle=A.kozha;gran(c,[[-92,-124,30],[92,-124,34],[97,28,26],[96,88,22],[52,120,16],[-52,120,16],[-96,88,22],[-97,28,26]],26);c.fill();
 c.fillStyle=A.skula;gran(c,[[100,0,4],[38,76,6],[100,62,10]],6);c.fill();
 // beard in the hair colour, the top is a moustache in two arcs from the nose to the mouth corners
 const b=[[-101,-6,4],[-101,30,20],[-99,94,24],[-54,127,18],[54,127,18],[99,94,24],[101,30,20],[101,-6,4],[89,-6,4],[87,34,14],[70,68,12],[sm+42,78,6],[sm+20,58,12],[sm,55,8],[sm-20,58,12],[sm-42,78,6],[-70,68,12],[-87,34,14],[-89,-6,4]];
 c.fillStyle=A.boroda;gran(c,b,10);c.fill();
 c.save();gran(c,b,10);c.clip();c.fillStyle=A.borodaT;gran(c,[[sm+10,150],[140,150],[140,30],[70,90]],4);c.fill();c.restore();
 lico(c,p,A);
 // haircut: parting on the left, temples slightly higher than the forehead
 const v=[[-100,-4,8],[-106,-112,30],[-64+h*.5,-160,36],[64+d+h,-168,40],[106,-124,30],[101,-4,8],[89,-4,6],[89,-72,12],[52+d,-98+dy,14],[-26+d,-84+dy,18],[-72,-96,12],[-87,-74,8],[-88,-4,6]];
 c.fillStyle=A.volosy;gran(c,v,16);c.fill();
 c.save();gran(c,v,16);c.clip();
 c.fillStyle=A.svet;gran(c,[[-180,-230],[-24+d+h,-230],[-60+d,-112+dy],[-180,-120]],4);c.fill();
 // grey hair is a short light wedge above the ear, the sideburns stay dark: the beard grows from the hair, not on straps
 c.fillStyle=A.sedina;c.beginPath();for(const s of [-1,1])obvod(c,[[s*140,-62],[s*84,-70],[s*84,-46],[s*140,-14]],2);c.fill();
 c.restore();
 c.restore();c.restore();
}
const RA={pl:[182,36,108,8],lok:[148,128],lokN:[32,-16],k0:[50,132],k1:[106,80],w1:30,w2:26,kw:53,D:120,kx:.5,dY:-7,dov0:.02,dov1:-.4,rLok:12,cvet:A.rukav,manzh:A.rub,kist:A.kozha,tenKist:'#C99272'};
const rukiA=(c,p)=>dveRuki(c,p,RA,SK);

Stili.dobavit({id:'kosoy3',nomer:24,imya:'Slanted cube, simple adults',gruppa:'geo3',
 fon(c,W,H){c.fillStyle='#F8EAD0';c.fillRect(0,0,W,H);
  c.fillStyle='#F3DEB2';Kit.mnogo(c,[[130,-60],[920,-60],[780,1140],[-10,1140]],0);c.fill();
  c.fillStyle='#D6E6D6';Kit.mnogo(c,[[1000,-60],[1790,-60],[1930,1140],[1140,1140]],0);c.fill();},
 // the original's table, a lighter top: the hands rest on it
 stol(c,W,H){c.fillStyle='#3D6E74';c.fillRect(0,892,W,H-892);c.fillStyle='#4F858C';c.fillRect(0,892,W,16);c.fillStyle='#30595E';c.fillRect(0,1040,W,H-1040);},
 L:{x:528,y:Y,s:S,ramka:[-136,-340,320,320],telo:teloL,ruki:rukiL},
 A:{x:1392,y:Y,s:S,ramka:[-186,-348,330,330],telo:teloA,ruki:rukiA}});
})();
