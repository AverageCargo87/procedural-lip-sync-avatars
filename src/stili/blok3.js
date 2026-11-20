'use strict';
/* Style "Block, simple adults": almost the same drawing as "Block" (a big block head with rounded corners, slightly narrower at the crown, bead eyes with a highlight set wide, a slab nose, a slanted hair cut with a parting, yellow background and blue table).
 * Only the age changes: head narrower than the shoulders and taller than wide, a wide jaw with a flat rounded bottom, a visible neck; the bead sits under a barely visible lid, the brows are a soft arc closer to the eye; the original's blush is toned down to a quiet facet.
 * Lena: chin-length bob with a slanted strand from the parting, hair behind the ear on the right and a yellow dot earring, thin glasses; tomato jacket, light grey blouse. Artem: fair skin, square jaw, wide neck, stubble as one dark mass, grey temples; blue jumper with the original's cream stripe.
 * Hands on the table: the sleeve is one polygon with an angled elbow, a lighter band on top of the forearm, a cuff strip, a mitten hand with a separate thumb and one line between the fingers. */
(function(){
const {lerp,clamp,rot,naGolovu}=Kit;
const S=1.75,XL=560,XA=1360,Y=700,STOL=905,KRAY=1030;
const GL={hy:-163,osnova:126,hs:1.12},GA={hy:-172,osnova:130,hs:1.1};
const dyh=(c,p)=>c.scale(1+p.breath*.006,1+p.breath*.012);
const chel=p=>p.open*8+p.bite;
const sd=(p,sm)=>({fe:sm+p.yaw*17,fn:sm+p.yaw*26,fm:sm+p.yaw*20,py:p.pitch*10});
// mix of two #rrggbb colours: on v, f the mouth cavity turns into the teeth colour
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),smes=(a,b,t)=>{if(t<=0)return a;if(t>=1)return b;const A=hex(a),B=hex(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t))})`;};

/** Append a polygon to the path, corner radius limited by the side lengths: no loops on short edges. pts [[x,y,r],...]. */
function put(c,pts,r){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}
function gran(c,pts,r){c.beginPath();put(c,pts,r);}

/** Both bead eyes of "Block" at once: a dark oval, the top barely cut by a straight lid (not a squint), a white highlight; a closed eye is an arc. */
function glaza(c,p,o,fe,ey){
 const w=o.glW,h=o.glH,z=clamp(clamp(p.blink)/.8),gx=p.gx*w*.2,gy=p.gy*h*.12,top=lerp(ey-h/2+h*o.veko,ey+h*.22,z),niz=lerp(ey+h/2+2,ey+h*.22,z*z);
 // an open eye is one bead path: an ellipse arc below and a straight lid above, no mask (masks are expensive); while blinking a mask cuts the lid and the bottom
 const otkr=z<.001;
 if(z<.96){c.save();if(!otkr){c.beginPath();for(const s of [-1,1]){const x=s*o.glX+fe,dn=s*o.nak;c.moveTo(x-w,top-dn);c.lineTo(x+w,top+dn);c.lineTo(x+w,niz);c.lineTo(x-w,niz);c.closePath();}c.clip();}
  c.fillStyle=o.zrachok;c.beginPath();for(const s of [-1,1]){const x=s*o.glX+fe+gx,sn=(top-ey-gy)/(h/2);
   if(otkr&&sn>-1){const a=Math.asin(sn);c.moveTo(x+w/2*Math.cos(a),top);c.ellipse(x,ey+gy,w/2,h/2,0,a,Math.PI-a);c.closePath();}else{c.moveTo(x+w/2,ey+gy);c.ellipse(x,ey+gy,w/2,h/2,0,0,6.3);}}c.fill();
  if(z<.5){c.globalAlpha=1-z*2;c.fillStyle='#fff';c.beginPath();for(const s of [-1,1]){const x=s*o.glX+fe+gx-w*.16,y=ey+gy-h*.1;c.moveTo(x+w*.19,y);c.arc(x,y,w*.19,0,6.3);}c.fill();c.globalAlpha=1;}
  c.restore();}
 const a=clamp((clamp(p.blink)-.3)/.35);if(a>0){c.globalAlpha=a;c.strokeStyle=o.zrachok;c.lineCap='round';c.lineWidth=5;c.beginPath();for(const s of [-1,1]){const x=s*o.glX+fe;c.moveTo(x-w*.58,ey+h*.2);c.quadraticCurveTo(x,ey+h*.2-w*.24,x+w*.58,ey+h*.2);}c.stroke();c.globalAlpha=1;}
}

/** Both brows as a soft arc in one path: thicker at the bridge, thinner toward the tail, no break or hook. Edges are quadratic curves with a shared apex at brPik of the length. */
function brovi(c,p,o,fe,ey){
 c.fillStyle=o.brovi;c.beginPath();
 for(const s of [-1,1]){const r=(p.brow+(s<0?p.browL:0))*8,x=s*o.glX+fe,y=ey-o.brY-r,dl=o.brDl,T=o.brTol,Tk=T*o.brHv,xi=x-s*dl/2,xo=x+s*dl/2,yi=y+o.brVn,yo=y+o.brSpad,
   cx=x+s*dl*(o.brPik-.5),cy=(yi+yo)/2-2*o.brDug,Tc=(T+Tk)/2;
  c.moveTo(xi,yi-T/2);c.quadraticCurveTo(cx,cy-Tc/2,xo,yo-Tk/2);c.quadraticCurveTo(xo+s*Tk*.9,yo,xo,yo+Tk/2);
  c.quadraticCurveTo(cx,cy+Tc/2,xi,yi+T/2);c.quadraticCurveTo(xi-s*T*.45,yi,xi,yi-T/2);c.closePath();}
 c.fill();
}

// Mouth: cream teeth a third lower than the Kit.rot band, teeth colour as a hard-edged gradient (the same numbers as in Kit.rot); on v, f the cavity turns into the teeth colour and the outline into the lip colour: upper teeth on the lower lip
const ZUBY='#F3E6D2',VYS=.84,ZOT=16;
function zuby(c,p){const H=(p.open*60+p.bite*5)*VYS,zk=clamp((H-ZOT)/9);if(zk<=0)return ZUBY;
 const Ty=p.open*3-H*.32,th=(Math.min(clamp(p.teeth)*H,20)+1.5)*zk,s=clamp((th*.68+3)/(th+3),0,.97),g=c.createLinearGradient(0,Ty-3,0,Ty+th);
 g.addColorStop(0,ZUBY);g.addColorStop(s,ZUBY);g.addColorStop(s+.02,'rgba(243,230,210,0)');g.addColorStop(1,'rgba(243,230,210,0)');return g;}

/** Face: a muted blush facet, mouth through Kit.rot, slab nose, beads, brows. Everything is shifted slightly toward the partner. */
function lico(c,p,o){
 const {fe,fn,fm,py}=sd(p,o.sm),ey=o.glY+py*.8,b=clamp(p.bite);
 // the original's blush, only quiet: a flat trapezoid on each cheekbone, in one path
 c.fillStyle=o.rum;c.beginPath();for(const s of [-1,1]){const x=s*o.rumX+fe*.8,y=o.rumY+py*.8;put(c,[[x-12,y-6],[x+12,y-6],[x+15,y+6],[x-15,y+6]],6);}c.fill();
 rot(c,p,{x:fm,y:o.rotY+py*1.05,k:o.rotK,cvet:smes(o.rot,ZUBY,b),yazyk:smes(o.yazyk,ZUBY,b),zuby:zuby(c,p),kontur:smes(o.rot,o.guba,b),ugolki:9,ulybka:1.6,zubyOt:ZOT,vys:VYS,asim:o.asim,liniya:6,tenPress:o.ten});
 // the nose is one slab as in "Block", only longer and narrower at the top
 const nx=fn,ny=o.nosY+py,a=o.nosW;c.fillStyle=o.nos;gran(c,[[nx-a*.5,ny-o.nosH,4],[nx+a*.5,ny-o.nosH,4],[nx+a,ny,7],[nx-a,ny,7]],6);c.fill();
 glaza(c,p,o,fe,ey);
 // thin frames: two rounded slabs, the bridge and the arm to the ear in one stroke
 if(o.ochki){const lw=o.glW*.9,lh=o.glH*.56,y=ey+1;c.strokeStyle=o.ochki;c.lineWidth=2.6;c.lineJoin='round';c.beginPath();
  for(const s of [-1,1]){const x=s*o.glX+fe;put(c,[[x-lw,y-lh,9],[x+lw,y-lh,9],[x+lw*.94,y+lh,10],[x-lw*.94,y+lh,10]],9);}
  c.moveTo(-o.glX+fe+lw*.98,y-lh*.45);c.quadraticCurveTo(fe,y-lh*.85,o.glX+fe-lw*.98,y-lh*.45);c.moveTo(o.glX+fe+lw,y-lh*.5);c.lineTo(86-p.yaw*4,y-lh*.3);c.stroke();}
 brovi(c,p,o,fe,ey);
}

/** Trapezoid neck, the bottom is the clothes neckline; the jaw shadow lies on the neck. */
function sheya(c,p,G,forma,kozha,ten,pts){c.save();c.fillStyle=kozha;gran(c,pts,4);c.fill();c.clip();naGolovu(c,p,G);c.translate(0,15);c.fillStyle=ten;forma(c,p);c.fill();c.restore();}

/** Mitten hand: palm and fingers one slab with a rounded end and the thumb a separate bar, in one path. Wrist at the origin, fingers along +x, thumb toward +y; t opening, m mirror. */
const VAR=[[-6,-17,6],[44,-20,10],[80,-17,15],[93,-3,13],[91,12,12],[62,18,10],[-6,17,6]],PAL=[[0,-10,8],[38,-10,9],[47,0,9],[40,10,9],[0,10,8]];
const palUgol=t=>lerp(.32,.56,clamp((t-.36)/.64));
function kist(c,D,t,m){
 const k=D/100,a=palUgol(t),ca=Math.cos(a),sa=Math.sin(a);
 c.beginPath();put(c,VAR.map(([x,y,r])=>[x*k,y*k*m,r*k]),8);put(c,PAL.map(([u,v,r])=>[(8+u*ca-v*sa)*k,(9+u*sa+v*ca)*k*m,r*k]),8);
}
/** One dark line: from the base of the thumb along its edge and the gap between the index and middle fingers. */
function kistLin(c,D,t,m){
 const k=D/100,a=palUgol(t),ca=Math.cos(a),sa=Math.sin(a),P=(u,v)=>[(8+u*ca-v*sa)*k,(9+u*sa+v*ca)*k*m];
 c.beginPath();let q=P(6,-9);c.moveTo(q[0],q[1]);q=P(22,-10);const e=P(36,-9);c.quadraticCurveTo(q[0],q[1],e[0],e[1]);
 c.moveTo(92*k,3*k*m);c.lineTo(64*k,4*k*m);
}
/** Intersection of lines a->b and c->d; if there is none or it is further than lim from z, then z. */
function ugol(a,b,q,d,z,lim){
 const d1x=b[0]-a[0],d1y=b[1]-a[1],d2x=d[0]-q[0],d2y=d[1]-q[1],den=d1x*d2y-d1y*d2x;if(Math.abs(den)<1e-6)return z;
 const t=((q[0]-a[0])*d2y-(q[1]-a[1])*d2x)/den,x=a[0]+d1x*t,y=a[1]+d1y*t;return Math.hypot(x-z[0],y-z[1])>lim?z:[x,y];
}
/** Arm following the adult arm rules (Kit.rukaV mechanics): the elbow nearly stays, the forearm lies along the table edge, at the peak the hand is almost horizontal at the chest.
 *  "Block" drawing: the whole sleeve from shoulder to cuff is one polygon over the body, an angled elbow; a lighter band on top of the forearm; a cuff strip; a mitten hand with a shadow.
 *  o: tw,sy shoulder axis; pl [outer x,y, inner x,y] top of the sleeve; lok,lokN elbow; k0,k1 wrist at rest and at the peak; w0,w1,w2 half widths; D hand; dov0,dov1 hand rotation. */
function ruka(c,p,o,side){
 const hxP=side<0?p.hLx:p.hRx,hyP=side<0?p.hLy:p.hRy,t=Math.max(clamp(side<0?p.hLo:p.hRo),.36),u0=clamp(-hyP/108,0,1.25),uO=clamp(-(side<0?p.hRy:p.hLy)/108,0,1.25),u=u0*lerp(1,.55,clamp((uO-u0)/.12)),ves=1-clamp(-hyP/40),dx=p.lean*22/S,dy=(p.bob*6-p.breath*2.2)/S,
  wx=side*lerp(o.k0[0],o.k1[0],u)+hxP*.5-dx*ves,wy=lerp(o.k0[1]+(side>0?o.dY:0),o.k1[1],u)-dy*ves,ex=side*(o.lok[0]+o.lokN[0]*u)-dx*ves*.7,ey=o.lok[1]+o.lokN[1]*u-dy*ves*.7,sx=side*o.tw,sy=o.sy,
  a1=Math.atan2(ey-sy,ex-sx),u1x=Math.cos(a1),u1y=Math.sin(a1),f=Math.atan2(wy-ey,wx-ex),cf=Math.cos(f),sf=Math.sin(f),bl=Math.hypot(u1x-cf,u1y-sf)||1,bx=(u1x-cf)/bl,by=(u1y-sf)/bl;
 let n1x=-u1y,n1y=u1x,n2x=-sf,n2y=cf;if(n1x*bx+n1y*by<0){n1x=-n1x;n1y=-n1y;}if(n2x*bx+n2y*by<0){n2x=-n2x;n2y=-n2y;}
 // the outer elbow corner is cut: no further than 1.2 half widths from the bend, otherwise a wedge sticks out on a folded arm
 const w=o.w1,w2=o.w2,kv=w/Math.max(n1x*bx+n1y*by,.46),kp=Math.min(kv,w*1.2),ki=Math.min(kv,w*1.5),
  I=ugol([sx-n1x*o.w0,sy-n1y*o.w0],[ex-n1x*w,ey-n1y*w],[wx-n2x*w2,wy-n2y*w2],[ex-n2x*w,ey-n2y*w],[ex-bx*ki,ey-by*ki],w*1.5),
  rk=f+side*lerp(o.dov0,o.dov1,clamp(u)),hx=wx+cf*7,hy=wy+sf*7;
 // the hand casts a shadow on the table, on the other hand and on the blouse: without outlines they would merge
 c.save();c.translate(hx+2,hy+6);c.rotate(rk);c.fillStyle=o.tenKist;kist(c,o.D,t,side);c.fill();c.restore();
 c.save();c.translate(hx,hy);c.rotate(rk);c.fillStyle=o.kozha;kist(c,o.D,t,side);c.fill();c.strokeStyle=o.lin;c.lineWidth=2.4;c.lineCap='round';kistLin(c,o.D,t,side);c.stroke();c.restore();
 c.save();c.translate(wx,wy);c.rotate(f);c.fillStyle=o.manzh;gran(c,[[-8,-w2+3,2],[o.mL,-w2+4,3],[o.mL,w2-4,3],[-8,w2-3,2]],3);c.fill();c.restore();
 const rukav=()=>gran(c,[[side*o.pl[2],o.pl[3],8],[side*o.pl[0],o.pl[1],o.rPl],[ex+n1x*w,ey+n1y*w,6],[ex+bx*kp,ey+by*kp,o.rLok],[ex+n2x*w,ey+n2y*w,6],[wx+n2x*w2,wy+n2y*w2,3],[wx-n2x*w2,wy-n2y*w2,3],[I[0],I[1],6]],6);
 c.fillStyle=o.cvet;rukav();c.fill();
 // the top plane of the forearm is lighter: a band along the forearm from the inner elbow corner to the wrist, not a wedge across the whole sleeve
 c.fillStyle=o.svet;gran(c,[[I[0],I[1],0],[wx-n2x*w2,wy-n2y*w2,0],[wx-n2x*w2*.08,wy-n2y*w2*.08,0],[ex-n2x*w*.08+cf*w*.7,ey-n2y*w*.08+sf*w*.7,0]],0);c.fill();
}

// -- Lena, 36: chin-length bob, a slanted strand from the parting across the forehead, hair behind the ear on the right and a yellow earring; tomato jacket, light grey blouse --
const L={kozha:'#FBD5BB',ten:'#EBAE90',nos:'#EBAF91',rum:'#F8CAB4',volosy:'#6B3522',volosyT:'#4F2518',svet:'#864729',serga:'#F5C431',
 pidzhak:'#D2503F',lackan:'#B63E32',bluzka:'#E4E8EE',rot:'#96304A',guba:'#C9707A',ochki:'#4A2620',yazyk:'#E0757A',zrachok:'#2E2024',brovi:'#5E2E1E',
 sm:5,glX:39,glY:4,glW:27,glH:31,veko:.07,nak:.5,rumX:50,rumY:36,brY:27,brDl:34,brTol:6.2,brHv:.42,brDug:3.2,brPik:.56,brVn:1.5,brSpad:2.5,nosY:45,nosW:11,nosH:22,rotY:70,rotK:.68,asim:.06};
const formaL=(c,p)=>{const j=chel(p),q=p.yaw*6;gran(c,[[-74,-112,34],[74,-112,34],[85,4,22],[84,80,32],[58+q,112+j,26],[-58+q,112+j,26],[-84,80,32],[-85,4,22]],22);};
/** Back mass of the bob: a block down to the chin with a slanted cut; visible behind the ear on the right. */
function zadL(c,p){const d=-p.yaw*10,h=p.hair*10;c.fillStyle=L.volosyT;gran(c,[[-84+d,-124,40],[84+d,-124,40],[108+d,24,14],[106+h,114,8],[-104+h,124,8],[-108+d,24,14]],16);c.fill();}
/** Front mass: on the left a strand with a slanted cut across the forehead to the temple and down to the chin, right of the parting the hair goes behind the ear. */
function peredL(c,d,h,dy){const pr=30+d;gran(c,[[pr,-152,10],[86+d*.4,-140,34],[102,-62,14],[100,-16,8],[84,-14,6],[76,-44,8],[pr+12,-86+dy,6],[-30+d,-62+dy,20],[-74,-28,10],[-79,40,10],[-77,98,8],[-82+h,124,6],[-108+h,120,6],[-112,40,12],[-104,-70,18],[-80+d*.4,-134,36]],16);}
function golovaL(c,p){
 const {fe}=sd(p,L.sm),d=p.yaw*14,h=p.hair*8,dy=p.pitch*4,pr=30+d,eu=-p.yaw*4;
 // ear on the right, the hair tucked behind it
 c.fillStyle=L.kozha;gran(c,[[84+eu,-6,6],[99+eu,-10,8],[101+eu,26,10],[87+eu,33,6]],6);c.fill();
 c.fillStyle=L.kozha;formaL(c,p);c.fill();
 // one quiet facet under the cheekbone
 c.save();formaL(c,p);c.clip();c.fillStyle=L.ten;c.globalAlpha=.45;gran(c,[[90,16],[62+fe*.4,46],[54+fe*.3,96],[40,150],[90,150]],8);c.fill();c.globalAlpha=1;c.restore();
 lico(c,p,L);
 c.fillStyle=L.volosy;peredL(c,d,h,dy);c.fill();
 c.save();peredL(c,d,h,dy);c.clip();c.fillStyle=L.svet;gran(c,[[pr,-200],[-200,-200],[-200,-50],[pr,-122+dy]],4);c.fill();c.restore();
 // a dot earring: the original's yellow instead of the hair clip
 c.fillStyle=L.serga;c.beginPath();c.arc(94+eu,42,6.5,0,6.3);c.fill();
}
function teloL(c,p){
 c.rotate(.02);
 c.save();naGolovu(c,p,GL);zadL(c,p);c.restore();
 c.save();dyh(c,p);
 c.fillStyle=L.pidzhak;gran(c,[[-34,-20,8],[-118,-2,26],[-130,140,8],[-132,420,0],[132,420,0],[130,140,8],[118,-2,26],[34,-20,8]],10);c.fill();
 c.fillStyle=L.bluzka;gran(c,[[-42,-22,4],[42,-22,4],[10,170,4],[-10,170,4]],4);c.fill();
 c.restore();
 sheya(c,p,GL,formaL,L.kozha,L.ten,[[-30,-90,2],[30,-90,2],[31,-12,4],[0,16,4],[-31,-12,4]]);
 // jacket lapels as two flat facets
 c.save();dyh(c,p);c.fillStyle=L.lackan;c.beginPath();for(const s of [-1,1])put(c,[[s*34,-24,4],[s*64,-16,6],[s*68,34,6],[s*8,166,4]],4);c.fill();c.restore();
 c.save();naGolovu(c,p,GL);golovaL(c,p);c.restore();
}
const RL={tw:124,sy:44,pl:[152,24,100,-2],rPl:30,rLok:12,lok:[138,148],lokN:[24,-22],k0:[78,148],k1:[98,90],dY:-9,w0:33,w1:27,w2:24,D:118,dov0:-.1,dov1:-.14,mL:11,
 cvet:'#B9412F',svet:'#C84C3A',manzh:L.bluzka,kozha:L.kozha,lin:'#DFA184',tenKist:'rgba(150,70,48,.3)'};
const rukiL=(c,p)=>{c.rotate(.02);for(const s of [-1,1])ruka(c,p,RL,s);};

// -- Artem, 38: fair skin, square jaw, wide neck, stubble as one dark mass, slanted cut haircut with a parting and grey temples; blue jumper with a cream stripe --
const A={kozha:'#EFC7A8',ten:'#D6A382',nos:'#DCA587',rum:'#EDC0A6',volosy:'#2E2A31',svet:'#433E4A',sedina:'#85828B',shchetina:'rgba(46,40,44,.3)',
 dzhemper:'#3A6CC0',dzhemperS:'#4A7ECF',rezinka:'#2A579F',polosa:'#F2E8D8',futbolka:'#F2E8D8',rot:'#5E1F2A',guba:'#A85A52',yazyk:'#E0707C',zrachok:'#201820',brovi:'#2E2A31',
 sm:-5,glX:40,glY:2,glW:28,glH:31,veko:.07,nak:.4,rumX:52,rumY:30,brY:29,brDl:40,brTol:8.4,brHv:.62,brDug:2.2,brPik:.5,brVn:1,brSpad:2,nosY:46,nosW:14,nosH:24,rotY:76,rotK:.72,asim:-.06};
const formaA=(c,p)=>{const j=chel(p),q=p.yaw*7;gran(c,[[-80,-118,32],[80,-118,32],[93,-4,18],[93,84,30],[68+q,120+j,24],[-68+q,120+j,24],[-93,84,30],[-93,-4,18]],18);};
/** Haircut: parting on the left, volume on top, short temples, a stepped hairline, no visor. */
function perA(c,d,h,dy){gran(c,[[-92,4,4],[-100,-68,14],[-92,-126,30],[-34+d,-150+h,22],[46+d,-154+h,22],[98,-128,30],[102,-66,14],[94,4,4],[86,4,4],[84,-50,6],[68,-80,10],[12+d,-88+dy,8],[-38+d,-96+dy,5],[-48+d,-82+dy,8],[-76,-62,8],[-84,4,4]],12);}
/** Stubble as one mass: from the sideburns in a clean line along the cheekbone to the nose wings, the same colour above the lip, no light wedge. */
function shchA(c,fm,fn,py){gran(c,[[-130,-2,0],[-86,-2,4],[-80,40,8],[-46+fm*.6,64+py,10],[-18+fn*.8,56+py,6],[18+fn*.8,56+py,6],[46+fm*.6,64+py,10],[80,40,8],[86,-2,4],[130,-2,0],[130,240,0],[-130,240,0]],6);}
function golovaA(c,p){
 const {fe,fn,fm,py}=sd(p,A.sm),d=p.yaw*14,h=p.hair*3,dy=p.pitch*4,eu=-p.yaw*4;
 // small ears in one path, the inner facet in one path too
 c.fillStyle=A.kozha;c.beginPath();for(const s of [-1,1])put(c,[[s*86+eu,-10,6],[s*108+eu,-14,9],[s*110+eu,34,11],[s*90+eu,42,6]],6);c.fill();
 c.fillStyle=A.ten;c.beginPath();for(const s of [-1,1])put(c,[[s*94+eu,-4,3],[s*103+eu,-5,3],[s*103+eu,22,4],[s*94+eu,27,3]],3);c.fill();
 c.fillStyle=A.kozha;formaA(c,p);c.fill();
 c.save();formaA(c,p);c.clip();
 c.fillStyle=A.shchetina;shchA(c,fm,fn,py);c.fill();
 // one quiet facet under the cheekbone
 c.fillStyle='rgba(110,52,34,.2)';gran(c,[[96,14],[68+fe*.4,42],[60+fe*.3,100],[46,160],[96,160]],8);c.fill();
 c.restore();
 lico(c,p,A);
 c.fillStyle=A.volosy;perA(c,d,h,dy);c.fill();
 c.save();perA(c,d,h,dy);c.clip();
 c.fillStyle=A.svet;gran(c,[[-38+d,-96+dy],[-24+d,-170],[-130,-170],[-130,-50],[-80,-60]],4);c.fill();
 // grey temples: one light grey facet on each side inside the haircut, in one path
 c.fillStyle=A.sedina;c.beginPath();for(const s of [-1,1])put(c,[[s*120,-30,2],[s*96,-34,4],[s*84,-22,4],[s*84,12,2],[s*120,12,2]],4);c.fill();
 c.restore();
}
function teloA(c,p){
 c.rotate(-.02);
 c.save();dyh(c,p);
 c.fillStyle=A.dzhemper;gran(c,[[-46,-22,8],[-128,-2,26],[-140,140,8],[-142,420,0],[142,420,0],[140,140,8],[128,-2,26],[46,-22,8]],10);c.fill();
 // the top plane of the shoulder is lighter
 c.fillStyle=A.dzhemperS;gran(c,[[-46,-22,6],[-114,-6,20],[-110,18,8],[-54,4,6]],6);c.fill();
 // the cream stripe across the chest is the original's signature; its ends go under the sleeves, so no mask is needed
 c.fillStyle=A.polosa;gran(c,[[-132,62,3],[132,38,3],[134,62,3],[-134,86,3]],3);c.fill();
 c.fillStyle=A.futbolka;gran(c,[[-52,-26,4],[52,-26,4],[50,-6,10],[34,12,12],[-34,12,12],[-50,-6,10]],6);c.fill();
 c.restore();
 sheya(c,p,GA,formaA,A.kozha,A.ten,[[-44,-100,2],[44,-100,2],[45,-16,6],[28,2,10],[-28,2,10],[-45,-16,6]]);
 // jumper neckline rib
 c.save();dyh(c,p);c.strokeStyle=A.rezinka;c.lineWidth=12;c.lineJoin=c.lineCap='round';c.beginPath();c.moveTo(-56,-18);c.lineTo(-52,-2);c.lineTo(-36,16);c.lineTo(36,16);c.lineTo(52,-2);c.lineTo(56,-18);c.stroke();c.restore();
 c.save();naGolovu(c,p,GA);golovaA(c,p);c.restore();
}
const RA={tw:142,sy:46,pl:[178,26,110,-2],rPl:32,rLok:12,lok:[158,150],lokN:[26,-22],k0:[84,150],k1:[104,92],dY:-9,w0:37,w1:30,w2:27,D:126,dov0:-.1,dov1:-.14,mL:12,
 cvet:'#2D5AA6',svet:'#3665B3',manzh:'#244A8C',kozha:A.kozha,lin:'#D29E80',tenKist:'rgba(70,45,60,.26)'};
const rukiA=(c,p)=>{c.rotate(-.02);for(const s of [-1,1])ruka(c,p,RA,s);};

Stili.dobavit({id:'blok3',nomer:27,imya:'Block, simple adults',gruppa:'geo3',
 fon(c,W,H){c.fillStyle='#FCD97C';c.fillRect(0,0,W,H);c.fillStyle='#FDE6A4';c.beginPath();c.moveTo(0,300);c.lineTo(W,120);c.lineTo(W,560);c.lineTo(0,740);c.closePath();c.fill();},
 // the "Block" table, lighter and thinner: the top plane and the edge
 stol(c,W,H){c.fillStyle='#4C6698';gran(c,[[70,STOL,22],[1850,STOL,22],[1930,KRAY,0],[-10,KRAY,0]],0);c.fill();c.fillStyle='#34497A';c.fillRect(-10,KRAY,W+20,H-KRAY);},
 L:{x:XL,y:Y,s:S,ramka:[-160,-345,320,325],telo:teloL,ruki:rukiL},
 A:{x:XA,y:Y,s:S,ramka:[-165,-358,330,330],telo:teloA,ruki:rukiA}});
})();
