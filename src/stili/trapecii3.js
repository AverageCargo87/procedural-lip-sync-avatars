'use strict';
/* Style "Trapezoids, simple adults": the drawing of the original "Trapezoids" (flat trapezoids with rounded vertices, a pill eye with an arched lid, a slab nose, a single-step facet), but the characters have grown up.
 * Head narrower than the shoulders, a longer face, soft jaw corners as in the original, a visible neck. The lid only touches the iris: age comes from creases, not a sleepy gaze.
 * Artem, 38: narrow forehead, wide jaw, receding hairline, a light grey facet on the temples, cool stubble along the jaw and a moustache shadow, a long straight nose, a crease under the eye.
 * Lena, 36: wide forehead, narrow chin, shoulder-length strands with volume and a side parting, thin trapezoid glasses, thin angled brows, brackets at the mouth, a light blush. Jackets; hands rest on the table one over the other. */
(function(){
const {lerp,clamp,mnogo,sdvig,rot,naGolovu}=Kit;
const S=1.6,XL=552,XA=1368,Y=652,GL={hy:-168,osnova:120},GA={hy:-172,osnova:120},P2=Math.PI/2;
const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),smes=(a,b,t)=>`rgb(${Math.round(lerp(a[0],b[0],t))},${Math.round(lerp(a[1],b[1],t))},${Math.round(lerp(a[2],b[2],t))})`;

/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]; dop appends to the current path. */
function gran(c,pts,r,dop){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 if(!dop)c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}
/** Intersection of lines ab and cd, null if parallel. */
function sek(a,b,c2,d){const r1x=b[0]-a[0],r1y=b[1]-a[1],r2x=d[0]-c2[0],r2y=d[1]-c2[1],z=r1x*r2y-r1y*r2x;if(Math.abs(z)<1e-6)return null;const t=((c2[0]-a[0])*r2y-(c2[1]-a[1])*r2x)/z;return [a[0]+r1x*t,a[1]+r1y*t];}

/** Both pill eyes of the original in one set of shapes: white, iris, highlight, a thin lid arc. The lid touches the iris, white shows at the sides.
 *  o: x0 midpoint between the eyes, y, dx half distance, w,h, zk iris share, veko 0-1, cvet, lin lid colour, tol; res lash stroke at the outer corner; skl, sklY crease under the eye. */
function glaza(c,p,o){
 const {w,h,y}=o,rx=w/2,ry=h/2,X=[o.x0-o.dx,o.x0+o.dx],z=clamp(clamp(p.blink)/.8),sm=y+ry*.36,top=lerp(y-ry+h*o.veko,sm,z),niz=lerp(y+ry+1,sm,z*z),iz=ry*.5*(1-z);
 if(z<.97){const zw=w*o.zk,zh=h*.84,gx=p.gx*(rx-zw/2+w*.04)*1.3,py=y+h*.05+p.gy*h*.08;
  c.save();c.beginPath();for(const x of X)c.roundRect(x-rx,y-ry,w,h,ry*.92);c.clip();
  c.beginPath();for(const x of X){c.moveTo(x-w,top+iz*2);c.quadraticCurveTo(x,top-iz*2,x+w,top+iz*2);c.lineTo(x+w,niz);c.lineTo(x-w,niz);c.closePath();}c.clip();
  c.fillStyle='#fff';c.fillRect(X[0]-w,y-h,X[1]-X[0]+2*w,2*h);
  c.fillStyle=o.cvet;c.beginPath();for(const x of X){c.moveTo(x+gx+zw/2,py);c.ellipse(x+gx,py,zw/2,zh/2,0,0,6.3);}c.fill();
  c.fillStyle='#fff';c.beginPath();for(const x of X){const bx=x+gx-zw*.2,by=py-zh*.15;c.moveTo(bx+zw*.18,by);c.ellipse(bx,by,zw*.18,zh*.18,0,0,6.3);}c.fill();c.restore();
  c.globalAlpha=1-z;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol;c.beginPath();
  X.forEach((x,i)=>{const s=i?1:-1,xo=x+s*rx*.98,yo=top+iz*.5;c.moveTo(x-rx*.98,yo);c.quadraticCurveTo(x,top-iz*.5,x+rx*.98,yo);if(o.res){c.moveTo(xo,yo);c.lineTo(xo+s*o.res,yo-o.res*.75);}});
  c.stroke();c.globalAlpha=1;}
 // crease under the eye: a short arc toward the outer corner, rises a little on a smile
 if(o.skl){const yy=y+ry+o.sklY-p.smile*1.5;c.strokeStyle=o.skl;c.lineCap='round';c.lineWidth=2.4;c.beginPath();X.forEach((x,i)=>{const s=i?1:-1;c.moveTo(x-s*rx*.15,yy+1.5);c.quadraticCurveTo(x+s*rx*.35,yy+3.5,x+s*rx*.85,yy-.5);});c.stroke();}
 const a=clamp((clamp(p.blink)-.3)/.35);if(a>0){c.globalAlpha=a;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol+1.2;c.beginPath();for(const x of X){c.moveTo(x-rx*.95,sm+2);c.quadraticCurveTo(x,sm-4,x+rx*.95,sm+2);}c.stroke();c.globalAlpha=1;}
}
/** Slab brows, both in one path. o: x0, y, dx, dl length; t thickness at the inner end, t2 at the break; izl break lift; pik share of length to the break; nak lift of the outer end; hod; cvet. */
function brovi(c,p,o){
 c.fillStyle=o.cvet;c.beginPath();
 for(const s of [-1,1]){const y=o.y-(p.brow+(s<0?p.browL:0))*o.hod,x=o.x0+s*o.dx,xi=x-s*o.dl/2,xo=x+s*o.dl/2,xk=lerp(xi,xo,o.pik),yk=y-o.izl-p.brow*1.5,yo=y-o.nak;
  gran(c,[[xi,y-o.t/2,3],[xk,yk-o.t2/2,4],[xo,yo,2],[xk,yk+o.t2/2,4],[xi,y+o.t/2,3]],3,true);}
 c.fill();
}
/** Face from settings: slab nose, brackets at the mouth, mouth, eyes, glasses, brows. The top of the nose moves with the eyes, the tip further, so the slab skews on a turn.
 *  Teeth are a thin strip along the top edge: the pose's teeth value is multiplied by zubyK, the mouth shape is unchanged. */
function lico(c,p,o){
 const {fe,fn,fm,py}=sdvig(p,.7),ey=o.glY+py*.8,sm=o.sm,t=o.nosY+py,b=o.nosY+o.nosH+py;
 c.fillStyle=o.nos;gran(c,[[sm+fe-o.nw0,t],[sm+fe+o.nw0,t],[sm+fn+o.nw1,b],[sm+fn-o.nw1,b]],o.nosR);c.fill();
 // brackets at the mouth corners follow the corners: a wider mouth pushes them further out
 if(o.skobki){const k=o.rotK,hw=50*o.shir*(1+.3*p.wide-.42*p.round-.1*p.press)*k,lift=(-p.smile*13*1.5-8*(1-.85*clamp(p.round))+p.round*1.5)*(1-.75*p.bite)*k,x=sm+fm+o.asim*hw*.32,yc=o.rotY+py*1.05+p.open*3*k+lift;
  c.globalAlpha=clamp(.45+p.smile*.7);c.strokeStyle=o.skobki;c.lineCap='round';c.lineWidth=2.4;c.beginPath();
  for(const s of [-1,1]){const xo=x+s*hw;c.moveTo(xo+s*1,yc-13);c.quadraticCurveTo(xo+s*8,yc-5,xo+s*5,yc+4);}c.stroke();c.globalAlpha=1;}
 rot(c,p.teeth>0?{...p,teeth:p.teeth*o.zubyK}:p,{x:sm+fm,y:o.rotY+py*1.05,k:o.rotK,shir:o.shir,cvet:o.rot,kontur:o.kontur,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:8,ulybka:1.5,zubyOt:15,vys:.84,asim:o.asim,liniya:8});
 glaza(c,p,{x0:sm+fe,y:ey,dx:o.glX,w:o.glW,h:o.glH,zk:o.zk,veko:o.veko,cvet:o.zrachok,lin:o.lin,tol:o.linT,res:o.res,skl:o.skl,sklY:o.sklY});
 // thin trapezoid glasses, wider at the top: both lenses, the bridge and the temple arm to the ear in one line
 const q=o.ochki;if(q){const x0=sm+fe,yt=ey-q.v,yb=ey+q.n;c.strokeStyle=q.cvet;c.lineWidth=q.tol;c.lineJoin='round';c.lineCap='round';c.beginPath();
  for(const s of [-1,1]){const x=x0+s*o.glX;gran(c,[[x-q.w,yt,q.r],[x+q.w,yt,q.r],[x+q.w*.84,yb,q.r+5],[x-q.w*.84,yb,q.r+5]],q.r,true);}
  c.moveTo(x0-o.glX+q.w,yt+5);c.quadraticCurveTo(x0,yt+1,x0+o.glX-q.w,yt+5);c.moveTo(x0+o.glX+q.w,yt+3);c.lineTo(q.dug-p.yaw*10,yt+1);c.stroke();}
 brovi(c,p,{x0:sm+fe,y:ey-o.brY,dx:o.brX,dl:o.brDl,t:o.brT,t2:o.brT2,izl:o.brIzl,pik:o.brPik,nak:o.brNak,hod:6,cvet:o.brovi});
}

/** Hand palm down: a slab, four rounded fingertips along the edge, a short thumb with a round end; when opening it moves away and reveals a notch.
 *  Wrist at the origin, fingers along +x, thumb toward +U. D length, h width, tp 0-1 opening. */
const KONCHIKI=[[.8,-.35],[.9,-.115],[.94,.12],[.88,.35]];
function kist(c,D,h,U,tp){
 const f=h*.118;c.beginPath();c.moveTo(-4,-U*h*.44);c.lineTo(D*.5,-U*h*.48);
 for(const [kx,ky] of KONCHIKI){const x=D*kx-f,y=U*h*ky;c.lineTo(x,y-U*f);c.arc(x,y,f,-U*P2,U*P2,U<0);}
 const bx=D*.3,by=U*h*.5,tx=D*lerp(.5,.44,tp),ty=U*h*lerp(.54,.84,tp),rt=h*.14,th=Math.atan2(ty-by,tx-bx);
 c.lineTo(D*.64,U*h*.46);c.lineTo(D*.5,U*h*.42);
 c.lineTo(tx+rt*Math.cos(th-U*P2),ty+rt*Math.sin(th-U*P2));c.arc(tx,ty,rt,th-U*P2,th+U*P2,U<0);
 c.lineTo(D*.12,U*h*.56);c.lineTo(-4,U*h*.46);c.closePath();
}
/** Where the arm is, following Kit.rukaV: the elbow nearly stays, the forearm swings around it. side -+1.
 *  o: pl [outer x,y, inner x,y] shoulder; lok, lokN elbow at rest and its shift at the peak; k0,k1 wrist at rest and at the peak; w1,w2 half width at elbow and wrist; kw,D hand width and length;
 *  kx share of sideways travel; dY the upper (right) hand is higher at rest; dovN the lower hand at rest is turned fingers down so the tips peek out; dov0,dov1 hand rotation. */
function polozhenie(p,o,side){
 const hxP=side<0?p.hLx:p.hRx,hyP=side<0?p.hLy:p.hRy,hyO=side<0?p.hRy:p.hLy,
  u0=clamp(-hyP/108,0,1.25),uO=clamp(-hyO/108,0,1.25),u=u0*lerp(1,.55,clamp((uO-u0)/.12)),
  ves=1-clamp(-hyP/40),vesO=1-clamp(-hyO/40),dx=p.lean*22/S,dy=(p.bob*6-p.breath*2.2)/S,
  wx=side*lerp(o.k0[0],o.k1[0],u)+hxP*o.kx-dx*ves,wy=lerp(o.k0[1]+(side>0?o.dY:0),o.k1[1],u)-dy*ves,
  ex=side*(o.lok[0]+o.lokN[0]*u)-dx*ves*.7,ey=o.lok[1]+o.lokN[1]*u-dy*ves*.7,f=Math.atan2(wy-ey,wx-ex),
  rk=f+side*lerp(o.dov0,o.dov1,clamp(u))+(side<0?o.dovN*ves:0);
 return {wx,wy,ex,ey,f,rk,ves,vesO,otkr:clamp(side<0?p.hLo:p.hRo)};
}
/** Hand shadow on the table in one shape: it shrinks as the hand rises. Only on the table; it does not fall on the lower hand. */
function tenStola(c,o,R){
 c.globalAlpha=.17;c.fillStyle=o.tenStol;c.beginPath();
 for(const g of R)if(g.ves>.05){const v=g.ves,cx=g.wx+Math.cos(g.rk)*o.D*.5,cy=g.wy+o.kw*.46+3,rx=o.D*.5*v,ry=6*v;c.moveTo(cx+rx,cy);c.ellipse(cx,cy,rx,ry,0,0,6.3);}
 c.fill();c.globalAlpha=1;
}
/** Arm on the table: the sleeve is one polygon from shoulder to wrist, an angled elbow, a cuff strip, a hand with fingers. The lower hand at rest is one step darker: the upper hand covers it. */
function ruka(c,o,g,side){
 const {wx,wy,ex,ey,f,rk}=g,cf=Math.cos(f),sf=Math.sin(f),
  O=[side*o.pl[0],o.pl[1]],I=[side*o.pl[2],o.pl[3]],sx=(O[0]+I[0])/2,sy=(O[1]+I[1])/2,
  l1=Math.hypot(ex-sx,ey-sy)||1,u1x=(ex-sx)/l1,u1y=(ey-sy)/l1;
 // b points outward from the elbow bend; n1, n2 are the upper arm and forearm normals on the same side
 let bx=u1x-cf,by=u1y-sf;const bl=Math.hypot(bx,by)||1;bx/=bl;by/=bl;
 let n1x=-u1y,n1y=u1x,n2x=-sf,n2y=cf;if(n1x*bx+n1y*by<0){n1x=-n1x;n1y=-n1y;}if(n2x*bx+n2y*by<0){n2x=-n2x;n2y=-n2y;}
 const w1=o.w1,w2=o.w2,Wo=[wx+n2x*w2,wy+n2y*w2],Wi=[wx-n2x*w2,wy-n2y*w2],
  // elbow corner: intersection of the upper arm and forearm sides, no further than lim from the joint
  ugol=(A,zn,lim)=>{let P=sek(A,[ex+zn*n1x*w1,ey+zn*n1y*w1],zn>0?Wo:Wi,[ex+zn*n2x*w1,ey+zn*n2y*w1]);
   if(!P||((P[0]-ex)*bx+(P[1]-ey)*by)*zn<0)P=[ex+zn*bx*w1,ey+zn*by*w1];
   const d=Math.hypot(P[0]-ex,P[1]-ey);if(d>lim*w1)P=[ex+(P[0]-ex)*lim*w1/d,ey+(P[1]-ey)*lim*w1/d];return P;},
  Po=ugol(O,1,1.6),Pi=ugol(I,-1,1.4);
 c.save();c.translate(wx+cf*6,wy+sf*6);c.rotate(rk);c.fillStyle=side<0?smes(o.kA,o.kB,g.ves*g.vesO):o.kist;kist(c,o.D,o.kw,side,g.otkr*.85);c.fill();c.restore();
 c.save();c.translate(wx,wy);c.rotate(f);c.fillStyle=o.manzh;gran(c,[[-8,-w2+3],[12,-w2+4],[12,w2-4],[-8,w2-3]],3);c.fill();c.restore();
 c.fillStyle=o.cvet;gran(c,[[O[0],O[1],16],[Po[0],Po[1],o.rLok],[Wo[0],Wo[1],3],[Wi[0],Wi[1],3],[Pi[0],Pi[1],8],[I[0],I[1],10]],8);c.fill();
}
/** Both arms: first the table shadow, then the lower hand, the right one on top. */
function dveRuki(c,p,o){const gL=polozhenie(p,o,-1),gR=polozhenie(p,o,1);tenStola(c,o,[gL,gR]);ruka(c,o,gL,-1);ruka(c,o,gR,1);}

// -- Lena, 36: chestnut shoulder-length strands with volume, side parting, tucked behind the ear on the right; thin glasses; wide forehead, narrow chin; coral A-line jacket --
const L={kozha:'#FADBC6',ten:'#EDB599',skula:'#F4CBB2',rumyanec:'#F29C86',volosy:'#784431',volosyT:'#572E23',svet:'#93573C',serga:'#E9B949',pidzhak:'#D46957',lackan:'#E3826C',rukav:'#B54D40',bluzka:'#FBEDE0',
 nos:'#EFBDA1',rot:'#8C3142',kontur:'#A8465A',yazyk:'#EE7B7B',zrachok:'#2C2024',brovi:'#5A3324',lin:'#2C2024',linT:2.3,res:5,skobki:'#E6AA8E',
 ochki:{cvet:'#6A3A2C',tol:2.3,w:20,v:14,n:13,r:7,dug:80},
 glX:32,glY:-6,glW:30,glH:24,zk:.72,veko:.08,brX:33,brY:25,brDl:34,brT:2.6,brT2:3.6,brIzl:4,brPik:.62,brNak:-3,nosY:9,nosH:17,nw0:4,nw1:8.5,nosR:7,rotY:56,rotK:.62,shir:.95,zubyK:.45,asim:.06,sm:4};
const formaL=c=>gran(c,[[-82,-116,30],[82,-116,30],[84,26,44],[40,100,24],[-40,100,24],[-84,26,44]],16);
/** Back mass: a trapezoid from the crown that widens downward and ends on the shoulders. */
function zadL(c,p){const dz=-p.yaw*10,h=p.hair*10;c.fillStyle=L.volosyT;gran(c,[[-98+dz,-136,40],[100+dz,-140,40],[120+dz*.5,40,20],[130+h,146,18],[-134+h,154,18],[-118+dz*.5,40,20]],20);c.fill();}
function golovaL(c,p){
 const {fe,py}=sdvig(p,.7),d=p.yaw*10+L.sm*.5,h=p.hair*8,dy=p.pitch*4,e=-p.yaw*10,pr=-26+d;
 // ear on the right and a dot earring
 c.fillStyle=L.kozha;gran(c,[[76+e,-18,6],[96+e,-22,8],[98+e,16,8],[82+e,28,6]],6);c.fill();
 c.fillStyle=L.serga;c.beginPath();c.arc(90+e,40,5.5,0,6.3);c.fill();
 c.fillStyle=L.kozha;formaL(c);c.fill();
 // a quiet facet under the right cheekbone
 c.save();formaL(c);c.clip();c.fillStyle=L.skula;gran(c,[[110,4],[72+fe,14],[52+fe,64],[26+fe*.5,112],[110,112]],4);c.fill();c.restore();
 // blush: barely visible, smaller and more transparent than in the original
 c.globalAlpha=.17;c.fillStyle=L.rumyanec;c.beginPath();for(const s of [-1,1]){const x=L.sm+s*45+fe*.8,y=28+py*.7;c.moveTo(x+11,y);c.ellipse(x,y,11,6,0,0,6.3);}c.fill();c.globalAlpha=1;
 lico(c,p,L);
 // strands: a wave from the side parting to the right behind the ear; on the left a full strand along the cheek to the shoulder with a diagonal cut
 const v=[[pr,-160,12],[96+d*.5,-144,40],[110,-50,18],[98,-18,8],[82,-30,8],[46+d,-90+dy,30],[pr+4,-106+dy,6],[-48+d,-86+dy,26],[-78,-34,12],[-84,60,12],[-94+h,152,10],[-132+h,140,16],[-124,40,20],[-110,-84,28],[-92+d*.5,-148,40]];
 c.fillStyle=L.volosy;gran(c,v,16);c.fill();
 c.save();gran(c,v,16);c.clip();c.fillStyle=L.svet;gran(c,[[pr,-200],[190,-190],[190,-10],[46+d,-88+dy],[pr+3,-104+dy]],4);c.fill();c.restore();
}
function teloL(c,p){
 c.rotate(.016);
 c.save();naGolovu(c,p,GL);zadL(c,p);c.restore();
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=L.ten;gran(c,[[-29,-110],[29,-110],[31,-20],[0,22],[-31,-20]],6);c.fill();
 // a wedge of blouse
 c.fillStyle=L.bluzka;gran(c,[[-44,-26,6],[-24,-26,4],[0,18,6],[24,-26,4],[44,-26,6],[30,170],[-30,170]],6);c.fill();
 // the A-line jacket widens downward
 c.fillStyle=L.pidzhak;gran(c,[[-36,-22,8],[-4,112,4],[4,112,4],[36,-22,8],[100,-6,10],[150,42,22],[184,330,8],[-184,330,8],[-150,42,22],[-100,-6,10]],12);c.fill();
 // lapels are two flat bands along the neckline
 c.fillStyle=L.lackan;c.beginPath();for(const s of [-1,1])gran(c,[[s*36,-22,6],[s*64,-13,6],[s*16,116,4],[s*4,116,3]],5,true);c.fill();
 c.restore();
 c.save();naGolovu(c,p,GL);golovaL(c,p);c.restore();
}
const RL={pl:[166,46,98,-5],lok:[136,178],lokN:[26,-18],k0:[60,170],k1:[92,98],w1:28,w2:25,kw:46,D:94,kx:.5,dY:-12,dovN:.12,dov0:.04,dov1:-.55,rLok:10,cvet:L.rukav,manzh:L.bluzka,kist:L.kozha,kA:hex(L.kozha),kB:hex('#F0C2A6'),tenStol:'#8A4E1E'};
const rukiL=(c,p)=>{c.rotate(.016);dveRuki(c,p,RL);};

// -- Artem, 38: narrow forehead, wide jaw, receding hairline, grey temples, stubble and a moustache shadow; shoulders wider than the waist, blue jacket with lapels --
const A={kozha:'#EFC7A8',ten:'#D6A382',grany:'#E2B594',shchetina:'rgba(64,66,88,.22)',volosy:'#4A3A32',svet:'#5E4A40',sedina:'#A0958E',pidzhak:'#2E4A70',lackan:'#3F6090',rukav:'#1F3557',rub:'#EDE6DA',vorot:'#FBF7EF',
 nos:'#DEAD8D',rot:'#6E2433',kontur:'#8C3846',yazyk:'#E2707A',zrachok:'#2A1F22',brovi:'#3E302A',lin:'#2F2220',linT:2.5,skl:'#D7A584',sklY:3,
 glX:32,glY:-8,glW:28,glH:21,zk:.72,veko:.1,brX:33,brY:21,brDl:34,brT:8.5,brT2:8,brIzl:1,brPik:.6,brNak:-2.5,nosY:1,nosH:31,nw0:3.5,nw1:10,nosR:4,rotY:60,rotK:.64,shir:.93,zubyK:.45,asim:-.06,sm:-5};
const formaA=c=>gran(c,[[-70,-122,30],[70,-122,30],[86,48,34],[50,104,30],[-50,104,30],[-86,48,34]],16);
function golovaA(c,p){
 const {fe,fm,py}=sdvig(p,.7),e=-p.yaw*12,d=p.yaw*10+A.sm*.5,h=p.hair*5,dy=p.pitch*4,q=fm+A.sm;
 c.fillStyle=A.kozha;c.beginPath();for(const s of [-1,1])gran(c,[[s*78+e,-18,6],[s*95+e,-22,8],[s*97+e,12,8],[s*84+e,24,6]],6,true);c.fill();
 formaA(c);c.fill();
 c.save();formaA(c);c.clip();
 // side plane of the jaw on the right
 c.fillStyle=A.grany;gran(c,[[130,-50],[60+fe,-40],[66+fe,38],[34+fe*.7,120],[130,120]],4);c.fill();
 // stubble as one cool mass: from the earlobe diagonally to the level of the mouth corners, a narrow moustache shadow above the lip
 c.fillStyle=A.shchetina;gran(c,[[-110,-46],[-80,-42],[-72,8],[-50+q*.6,62+py],[-32+q*.8,49+py],[32+q*.8,49+py],[50+q*.6,62+py],[72,8],[80,-42],[110,-46],[110,150],[-110,150]],8);c.fill();
 c.restore();
 lico(c,p,A);
 // haircut in masses: a flat top, receding corners of the forehead, short temples
 const v=[[-90,-40,6],[-96,-104,22],[-78+d+h,-160,30],[72+d+h,-166,30],[98,-104,22],[90,-40,6],[78,-40,4],[76,-82,10],[50+d,-108+dy,16],[12+d,-96+dy,14],[-30+d,-100+dy,14],[-54+d,-108+dy,16],[-76,-82,10],[-78,-40,4]];
 c.fillStyle=A.volosy;gran(c,v,14);c.fill();
 c.save();gran(c,v,14);c.clip();
 c.fillStyle=A.svet;gran(c,[[-14+d,-220],[-150,-220],[-150,-90],[-54+d,-108+dy],[-12+d,-122+dy]],4);c.fill();
 // grey hair as one facet on each temple: a wedge from the ear up to half the hair height, the full temple width at the ear
 c.fillStyle=A.sedina;c.beginPath();for(const s of [-1,1])gran(c,[[s*112,-68],[s*88,-72],[s*72,-30],[s*112,-30]],4,true);c.fill();
 c.restore();
}
function teloA(c,p){
 c.rotate(-.016);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=A.ten;gran(c,[[-46,-112],[46,-112],[50,6],[-50,6]],6);c.fill();
 c.fillStyle=A.rub;gran(c,[[-58,-24,6],[-28,-24,4],[0,20,6],[28,-24,4],[58,-24,6],[44,200],[-44,200]],6);c.fill();
 c.fillStyle=A.vorot;c.beginPath();for(const s of [-1,1])gran(c,[[s*28,-30,4],[s*56,-30,6],[s*60,18,6],[s*18,38,4]],5,true);c.fill();
 // jacket: shoulders wider than the waist
 c.fillStyle=A.pidzhak;gran(c,[[-52,-14,8],[-6,124,6],[6,124,6],[52,-14,8],[126,-2,10],[176,46,24],[142,330,10],[-142,330,10],[-176,46,24],[-126,-2,10]],16);c.fill();
 c.fillStyle=A.lackan;c.beginPath();for(const s of [-1,1])gran(c,[[s*52,-14,6],[s*92,4,8],[s*70,60,5],[s*94,76,6],[s*10,128,4]],6,true);c.fill();
 c.restore();
 c.save();naGolovu(c,p,GA);golovaA(c,p);c.restore();
}
const RA={pl:[190,48,124,-2],lok:[158,180],lokN:[30,-20],k0:[68,172],k1:[100,100],w1:31,w2:27,kw:50,D:102,kx:.5,dY:-12,dovN:.12,dov0:.04,dov1:-.55,rLok:10,cvet:A.rukav,manzh:A.rub,kist:A.kozha,kA:hex(A.kozha),kB:hex('#E2B08E'),tenStol:'#8A4E1E'};
const rukiA=(c,p)=>{c.rotate(-.016);dveRuki(c,p,RA);};

Stili.dobavit({id:'trapecii3',nomer:25,imya:'Trapezoids, simple adults',gruppa:'geo3',
 fon(c,W,H){c.fillStyle='#CFE4EC';c.fillRect(0,0,W,H);c.fillStyle='#E0EEF1';mnogo(c,[[300,-60],[1620,-60],[1960,920],[-40,920]],0);c.fill();},
 // the original's table: a light rim and a sand-coloured top, a lighter slab with a dark edge only at the bottom; the hands rest on the top and contrast with it
 stol(c,W,H){c.fillStyle='#F3CF8E';mnogo(c,[[110,878,16],[1810,878,16],[2040,1160],[-120,1160]],0);c.fill();c.fillStyle='#E4B066';mnogo(c,[[96,896],[1824,896],[2060,1180],[-140,1180]],0);c.fill();c.fillStyle='#D8A15A';mnogo(c,[[30,1036],[1890,1036],[2060,1180],[-140,1180]],0);c.fill();},
 L:{x:XL,y:Y,s:S,ramka:[-140,-335,280,280],telo:teloL,ruki:rukiL},
 A:{x:XA,y:Y,s:S,ramka:[-145,-352,290,290],telo:teloA,ruki:rukiA}});
})();
