'use strict';
/* Style "Slanted cube, adults": the same manner (a figure of parallelograms with a shared 8 degree skew, mirrored so the characters lean toward each other; the face skewed with the head and shifted toward the partner), but these are colleagues aged 35-40.
 * Head narrower than the shoulders, an almond eye made of facets at mid-head, a long lower third, faceted jaw and chin. Hands rest on the table: a sleeve with straight sides, an angled elbow, a slab hand with a thumb.
 * Lena: copper bob below the chin, left side tucked behind the ear, dark teal jacket, cream blouse. Artem: fair skin, side-parted haircut, grey temples, short beard, ochre jacket. */
(function(){
const {lerp,clamp,rot,naGolovu,mnogo}=Kit;
const S=1.6,SK=.14,XL=528,XA=1392,Y=652,STOL=(884-Y)/S,GL={hy:-166,osnova:120},GA={hy:-178,osnova:120};
const naL=(c,p)=>naGolovu(c,p,GL),naA=(c,p)=>naGolovu(c,p,GA);
/** Feature offsets: head turn plus a constant shift sm toward the partner. */
const sd=(p,sm)=>({fe:p.yaw*30+sm,fn:p.yaw*46+sm*1.15,fm:p.yaw*36+sm,py:p.pitch*12}),chel=p=>p.open*12+p.bite;

/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]. */
function gran(c,pts,r){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}
/** Polyline through points. */
const lom=(c,P)=>{c.beginPath();c.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)c.lineTo(P[i][0],P[i][1]);};

/** Adult faceted eye: an almond with the inner corner lower than the outer. The lid covers the top quarter of the iris, the lower lid touches its bottom, white shows only at the sides.
 *  o: x,y centre; w slit width; s side -+1; zk iris share of the width; raduzhka, kaima, zrachok; liniya, tol; resn lash wedge; skladka, nizh, podGlaz. */
function glaz(c,p,o){
 const {x,y,w,s}=o,D=w*(o.zk||.6),h=D*.76,rx=w/2,z=clamp(clamp(p.blink)/.8),gy=p.gy*h*.16,
  xi=x-s*rx,xo=x+s*rx,yi=y+h*.18,yo=y-h*.12,X=t=>lerp(xi,xo,t),Z=t=>lerp(yi,yo,t)+h*.16*Math.sin(Math.PI*t),
  t0=y-h/2+gy*.4,b0=y+h/2-clamp(p.smile-.2)*h*.12+gy*.2,
  V=[[xi,yi,2],[X(.2),lerp(lerp(yi,t0,.8),Z(.2),z),7],[X(.45),lerp(t0,Z(.45),z),9],[X(.77),lerp(t0+h*.07,Z(.77),z),7],[xo,yo,2]],
  N=[[X(.7),lerp(b0,Z(.7)+1,z*z),8],[X(.38),lerp(b0-h*.02,Z(.38)+1,z*z),8],[X(.12),lerp(lerp(yi,b0,.55),Z(.12)+1,z*z),5]];
 if(z<.97){const px=x+p.gx*(rx-D/2)*1.15,py=t0+D*.25+gy*.6;
  c.save();gran(c,[...V,...N],6);c.clip();
  c.fillStyle='#FBF3E8';c.fillRect(x-w,y-w,2*w,2*w);
  c.fillStyle=o.kaima;c.beginPath();c.arc(px,py,D/2,0,6.3);c.fill();
  c.fillStyle=o.raduzhka;c.beginPath();c.arc(px,py,D*.4,0,6.3);c.fill();
  c.fillStyle=o.zrachok;c.beginPath();c.arc(px,py,D*.23,0,6.3);c.fill();
  // lid shadow on the white gives a calm gaze
  c.strokeStyle='rgba(60,30,26,.24)';c.lineWidth=h*.46;c.lineJoin='round';lom(c,V);c.stroke();
  c.fillStyle='#fff';c.beginPath();c.arc(px-D*.16,py-D*.12,D*.1,0,6.3);c.fill();
  c.restore();}
 c.lineCap=c.lineJoin='round';
 // lid crease: a fixed polyline
 if(o.skladka){const yv=y-h/2;c.strokeStyle=o.skladka;c.lineWidth=2.1;lom(c,[[X(.14),yv-h*.16],[X(.44),yv-h*.42],[X(.86),yv-h*.22]]);c.stroke();}
 if(z<.9){c.globalAlpha=(1-z)*.7;c.strokeStyle=o.nizh;c.lineWidth=1.8;lom(c,[[X(.36),N[1][1]+1.2],[X(.7),N[0][1]+1.2],[xo,yo+1]]);c.stroke();
  if(o.podGlaz){c.globalAlpha=(1-z)*o.podGlaz;c.lineWidth=2.2;lom(c,[[X(.26),y+h*1.02],[X(.6),y+h*1.16],[X(.92),y+h*.84]]);c.stroke();}c.globalAlpha=1;}
 // the upper lid line gets thicker toward the outer corner
 c.strokeStyle=o.liniya;c.lineWidth=o.tol*.66;lom(c,V);c.stroke();c.lineWidth=o.tol;lom(c,V.slice(2));c.stroke();
 if(o.resn){c.fillStyle=o.liniya;c.beginPath();c.moveTo(V[3][0],V[3][1]-o.tol*.4);c.lineTo(xo+s*o.resn,yo-o.resn*.7);c.lineTo(xo,yo+o.tol*.45);c.closePath();c.fill();}
}

/** Faceted brow: thick at the bridge, a break at pik, a thin end at the temple. */
function brov(c,p,o){
 const s=o.s,r=(p.brow+(s<0?p.browL:0))*(o.hod??8),x0=o.x-s*o.dl/2,x2=o.x+s*o.dl/2,xp=lerp(x0,x2,o.pik),y0=o.y-r*1.15,yp=o.y-r-o.izg,y2=o.y-r*.85+o.spad,t=o.tol;
 c.fillStyle=o.cvet;gran(c,[[x0,y0-t*.5,3],[xp,yp-t*.5,5],[x2,y2-t*.14,2],[x2-s*3,y2+t*.22,2],[xp,yp+t*.42,6],[x0,y0+t*.5,3]],4);c.fill();
}

/** Slab nose with a bridge: a narrow shadow facet on the right side of the bridge, a flat bottom, short angled wings. o: y0 top of the bridge, y bottom, w half width of the wings. */
function nos(c,p,o,sm){
 const {fe,fn,py}=sd(p,sm),nx=fn,ny=o.y+py,w=o.w,bx=lerp(fe,fn,.4),y0=o.y0+py*.9;
 c.fillStyle=o.ten;gran(c,[[bx+3,y0,2],[nx+w*.5,ny-21,4],[nx+w*1.02,ny-7,5],[nx+w*.4,ny-6,4],[bx,y0+11,2]],3);c.fill();
 gran(c,[[nx-w*.66,ny+1,4],[nx-w*.3,ny-4,3],[nx+w*.3,ny-4,3],[nx+w*.7,ny+1,4],[nx+w*.32,ny+7,4],[nx-w*.32,ny+7,4]],4);c.fill();
 c.strokeStyle=o.lin;c.lineWidth=o.tol;c.lineCap=c.lineJoin='round';c.beginPath();for(const s of [-1,1]){c.moveTo(nx+s*w*.96,ny-6);c.lineTo(nx+s*w*1.02,ny);c.lineTo(nx+s*w*.66,ny+2.5);}c.stroke();
}

/** Mouth only through Kit.rot; a flat shadow facet under the lower lip. */
function rotT(c,p,o,sm){
 const {fm,py}=sd(p,sm),y=o.rotY+py*1.05,x=fm,H=(p.open*60+p.bite*5)*o.vys,niz=(p.open*3+H*.68)*o.rotK;
 rot(c,p,{x,y,k:o.rotK,cvet:o.rot,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:o.ugolki,ulybka:o.ulybka,zubyOt:o.zubyOt,vys:o.vys,asim:o.asim,liniya:o.rotLin,kontur:o.rotK2,tenPress:o.tenRot});
 c.fillStyle=o.tenRot;c.globalAlpha=(1-clamp(p.press))*.75;gran(c,[[x-12,y+niz+11],[x+12,y+niz+11],[x+7,y+niz+16],[x-7,y+niz+16]],2);c.fill();c.globalAlpha=1;
}

/** Faceted ear with an inner plane. */
function uho(c,p,s,ex,ey,kozha,ten,v){
 const k=1-s*p.yaw*.6;c.save();c.translate(ex,ey);c.scale(s*k,1);
 c.fillStyle=kozha;gran(c,[[-4,-v*.9,4],[12,-v*1.02,8],[19,-v*.5,8],[13,v*.4,8],[4,v*.86,6],[-5,v*.7,4]],6);c.fill();
 c.fillStyle=ten;gran(c,[[2,-v*.62,3],[11,-v*.68,4],[13,-v*.3,4],[7,v*.2,3],[3,v*.08,2]],3);c.fill();c.restore();
}

/** Neck with a chin shadow: the shadow is the face shape shifted down. */
function sheya(c,p,na,forma,kozha,ten,w0,w1,yv,yn){c.save();gran(c,[[-w0,yv,4],[w0,yv,4],[w1,yn,6],[-w1,yn,6]],4);c.fillStyle=kozha;c.fill();c.clip();na(c,p);c.translate(-3,26);c.fillStyle=ten;forma(c,p);c.fill();c.restore();}

/** Slab hand: wrist at the origin, fingers along +x joined into one slab with a cut end, thumb toward +y; t 0-1 opening. o: D length, kozha, kozhaT, ten silhouette only. */
function kist(c,o,t,m){
 const k=o.D/100;c.save();c.scale(k,k*m*(o.uz||1));
 const L=lerp(.92,1,t),b=lerp(.4,.72,t),
  lad=[[-6,-17,4],[42,-22,10],[84*L,-18,12],[97*L,-6,8],[93*L,10,10],[48,19,10],[-6,16,4]],
  pal=()=>{c.save();c.translate(16,8);c.rotate(b);gran(c,[[-4,-10,4],[26,-9,6],[41,-3,7],[39,7,7],[-4,11,4]],5);c.restore();};
 if(o.ten){c.fillStyle=o.ten;pal();c.fill();gran(c,lad,8);c.fill();c.restore();return;}
 c.lineJoin=c.lineCap='round';c.lineWidth=1.7/k;c.strokeStyle=o.kozhaT;
 c.fillStyle=o.kozha;pal();c.fill();c.stroke();
 gran(c,lad,8);c.fill();c.stroke();
 // fingers: three short strokes from the tips
 c.lineWidth=1.9/k;c.beginPath();for(const [y,l] of [[-9.5,28],[-1.5,33],[6.5,26]]){const x1=(y<-5?86:y>3?90:95)*L;c.moveTo(x1-2,y+(y<-5?-.6:.4));c.lineTo(x1-l,y);}c.stroke();
 c.restore();
}

/** Faceted adult arm: the mechanics of Kit.rukaV (the elbow nearly stays, the forearm swings around it), but the sleeve is a polygon with straight sides and rounded vertices, an angled elbow, a slab hand.
 *  chast 'verh' is the upper arm under the jacket, 'niz' the forearm, cuff and hand. Settings as in Kit.rukaV; rLok elbow radius. */
function ruka(c,p,o,side,chast){
 const hxP=side<0?p.hLx:p.hRx,hyP=side<0?p.hLy:p.hRy,t=Math.max(clamp(side<0?p.hLo:p.hRo),o.t0??.3),u0=clamp(-hyP/108,0,1.25),uO=clamp(-(side<0?p.hRy:p.hLy)/108,0,1.25),u=u0*lerp(1,.55,clamp((uO-u0)/.12)),ves=1-clamp(-hyP/40),dx=p.lean*22/o.S,dy=(p.bob*6-p.breath*2.2)/o.S,lN=o.lokN,w=o.w1,
  wx=side*lerp(o.k0[0],o.k1[0],u)+hxP*o.kx-dx*ves,wy=lerp(o.k0[1]+(side>0?o.dY:0),o.k1[1],u)-dy*ves,ex=side*(o.lok[0]+lN[0]*u)-dx*ves*.7,ey=o.lok[1]+lN[1]*u-dy*ves*.7,sx=side*o.tw,sy=o.sy,
  a1=Math.atan2(ey-sy,ex-sx),u1x=Math.cos(a1),u1y=Math.sin(a1),f=Math.atan2(wy-ey,wx-ex),cf=Math.cos(f),sf=Math.sin(f),
  bl=Math.hypot(u1x-cf,u1y-sf)||1,bx=(u1x-cf)/bl,by=(u1y-sf)/bl;
 // n1, n2 point to the outside of the bend
 let n1x=-u1y,n1y=u1x,n2x=-sf,n2y=cf;if(n1x*bx+n1y*by<0){n1x=-n1x;n1y=-n1y;}if(n2x*bx+n2y*by<0){n2x=-n2x;n2y=-n2y;}
 const kv=w/Math.max(n1x*bx+n1y*by,.46),px=ex+bx*kv,py=ey+by*kv,rL=o.rLok??9;
 const plecho=()=>{const g=lerp(o.w0,w,.42),ox=lerp(sx,ex,.42)+n1x*g,oy=lerp(sy,ey,.42)+n1y*g;
  gran(c,[[side*(o.pl[0]-70),o.pl[1]+6,4],[side*o.pl[0],o.pl[1],o.rPl??24],[ox,oy,30],[px,py,rL],[ex+n2x*w,ey+n2y*w,4],[ex-n1x*w,ey-n1y*w,8],[sx-n1x*o.w0,sy-n1y*o.w0,8]],8);};
 if(chast==='verh'){c.fillStyle=o.cvet;plecho();c.fill();return;}
 const pr=()=>gran(c,[[wx+n2x*o.w2,wy+n2y*o.w2,3],[px,py,rL],[ex+n1x*w,ey+n1y*w,6],[ex-n2x*w,ey-n2y*w,8],[wx-n2x*o.w2,wy-n2y*o.w2,3]],6),
  rk=f+side*lerp(o.dov0,o.dov1,clamp(u));
 // one sleeve above and on the table
 c.save();c.beginPath();c.rect(-420,o.stol-2,840,400);c.clip();c.fillStyle=o.cvet;plecho();c.fill();c.restore();
 if(ves>.02){c.globalAlpha=ves*.22;c.fillStyle=o.stolTen;gran(c,[[wx-side*78,wy+o.w2+8,6],[wx+side*40,wy+o.w2+8,6],[wx+side*30,wy+o.w2+20,6],[wx-side*70,wy+o.w2+20,6]],6);c.fill();c.globalAlpha=1;}
 // arm shadow on the body, only above the table edge
 c.save();c.beginPath();c.rect(-420,-80,840,o.stol+80);c.clip();c.translate(-side*5,10);c.fillStyle=o.tenT;pr();c.fill();
 if(ves<1){c.globalAlpha=1-ves;c.translate(side*3,-4);c.translate(wx+cf*7,wy+sf*7);c.rotate(rk);kist(c,{...o,ten:o.tenT},t,side);}c.restore();
 // the upper hand at rest casts a shadow on the lower one
 if(side>0&&ves>.02){c.save();c.globalAlpha=ves;c.translate(wx+cf*7-3,wy+sf*7+6);c.rotate(rk);kist(c,{...o,ten:o.tenKist},t,side);c.restore();}
 c.save();c.translate(wx+cf*7,wy+sf*7);c.rotate(rk);kist(c,o,t,side);c.restore();
 // shirt cuff
 c.save();c.translate(wx,wy);c.rotate(f);c.fillStyle=o.manzh;gran(c,[[-8,-o.w2+3],[o.manzhL,-o.w2+4],[o.manzhL+2,o.w2-4],[-8,o.w2-3]],3);c.fill();c.restore();
 // sleeve: a shadow facet below, the base tone on top, a light edge
 pr();c.fillStyle=o.tenR;c.fill();c.save();pr();c.clip();c.translate(-6,-9);pr();c.fillStyle=o.cvet;c.fill();c.restore();
 c.strokeStyle=o.kromka;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(lerp(ex,wx,.18)-n2x*lerp(w,o.w2,.18)*.95,lerp(ey,wy,.18)-n2y*lerp(w,o.w2,.18)*.95);c.lineTo(wx-n2x*o.w2*.95,wy-n2y*o.w2*.95);c.stroke();
 // an angled fold at the elbow and buttons at the cuff
 c.strokeStyle=o.skl;c.lineWidth=2.6;c.lineJoin='round';const d=w*.7,a=w*.84;c.beginPath();c.moveTo(ex+cf*d-n2x*a,ey+sf*d-n2y*a);c.lineTo(ex+cf*(d+12)-n2x*(a-w*.32),ey+sf*(d+12)-n2y*(a-w*.32));c.lineTo(ex+cf*(d+8)-n2x*(a-w*.66),ey+sf*(d+8)-n2y*(a-w*.66));c.stroke();
 c.fillStyle=o.skl;c.beginPath();for(let i=0;i<3;i++){const x=wx-cf*(14+i*11)+n2x*o.w2*.6,y=wy-sf*(14+i*11)+n2y*o.w2*.6;c.moveTo(x+2.6,y);c.arc(x,y,2.6,0,6.3);}c.fill();
}

// -- Lena, 36: copper bob below the chin, side parting toward the partner, left side behind the ear --
const L={sm:7,kozha:'#F8D6BE',ten:'#EAB598',ten2:'#C98B6E',volosy:'#A94F2E',volosyT:'#7E3820',volosyS:'#C56D43',brov:'#7A3A22',liniya:'#40221A',raduzhka:'#6E8564',kaima:'#3E4C3A',zrachok:'#221816',
 pidzhak:'#24686B',pidzhakT:'#1B5457',lackan:'#2E7A7C',shov:'#174648',bluzka:'#F3E8D6',bluzkaT:'#DCCDB3',zoloto:'#CFA048',zolotoT:'#A97E2E',
 rot:'#6E2030',rotK2:'#BC5A52',yazyk:'#D9707A',tenRot:'#DDA488',rotY:76,rotK:.64,rotLin:6,ugolki:8,ulybka:1.5,zubyOt:15,vys:.84,asim:.05};
const formaL=(c,p)=>{const j=chel(p),q=p.yaw*7;gran(c,[[-80,-124,44],[80,-124,44],[83,24,38],[64,88,30],[24+q,121+j,20],[-24+q,121+j,20],[-64,88,30],[-83,24,38]],30);};
/** Back mass of the bob behind the neck: ends cut diagonally toward the neck. */
function zadL(c,p){const d=-p.yaw*10,h=p.hair*10;c.fillStyle=L.volosyT;gran(c,[[-98+d,-120,50],[98+d,-120,50],[110+d,60,20],[104+h,142,12],[42,130,10],[-42,130,10],[-102+h,148,12],[-110+d,60,20]],30);c.fill();}
/** Front mass: a plane from the side parting across the forehead to the left temple and behind the ear; on the right a strand along the cheek below the chin. */
const peredL=(c,d,h)=>gran(c,[[26+d,-86,3],[-14+d,-74,18],[-56,-50,22],[-79,-16,14],[-86,4,5],[-99,-6,10],[-108,-66,34],[-76,-128,40],[-8,-152,40],[62,-142,40],[102,-96,34],[110,-8,20],[114,70,16],[104+h,138,10],[84+h,146,8],[72,116,14],[76,40,20],[78,-30,20],[62,-68,14]],14);
function golovaL(c,p){
 const sm=L.sm,{fe,fn,fm,py}=sd(p,sm),d=p.yaw*14+sm*.5,h=p.hair*9,ey=py*.8,j=chel(p);
 // left ear visible, a diamond earring
 const ex=-80-p.yaw*5,eY=14+py*.3;uho(c,p,-1,ex,eY,L.kozha,L.ten,30);
 c.fillStyle=L.zoloto;gran(c,[[ex-8,eY+28],[ex-3,eY+36],[ex-8,eY+46],[ex-13,eY+36]],2);c.fill();
 c.fillStyle=L.kozha;formaL(c,p);c.fill();
 c.save();formaL(c,p);c.clip();
 // hair shadow on the forehead and temples
 c.save();c.translate(-2,10);c.fillStyle=L.ten;peredL(c,d,h);c.fill();c.restore();
 // a quiet shadow facet under the cheekbone
 c.fillStyle=L.ten;c.globalAlpha=.26;for(const s of [-1,1]){gran(c,[[s*86,26],[s*50,84+j*.5],[s*76,54]],4);c.fill();}c.globalAlpha=1;
 c.restore();
 // the nasolabial line is barely visible and only on a smile
 c.strokeStyle=L.ten;c.lineWidth=2;c.lineCap='round';c.globalAlpha=.3*clamp(p.smile*2-.4);c.beginPath();for(const s of [-1,1]){c.moveTo(fn*.9+s*21,52+py);c.lineTo(fm+s*36,64+py);}c.stroke();c.globalAlpha=1;
 rotT(c,p,L,sm);
 nos(c,p,{y0:4,y:46,w:13,ten:L.ten,lin:L.ten2,tol:2.2},sm);
 for(const s of [-1,1]){const kg=1-s*p.yaw*.22;
  glaz(c,p,{x:s*37+fe,y:ey,w:37*kg,s,zk:.62,raduzhka:L.raduzhka,kaima:L.kaima,zrachok:L.zrachok,liniya:L.liniya,tol:3.2,resn:4,skladka:L.ten,nizh:L.ten});
  brov(c,p,{x:s*40+fe,y:ey-25,dl:48*kg,tol:6,s,cvet:L.brov,izg:6,pik:.6,spad:6});}
 c.fillStyle=L.volosy;peredL(c,d,h);c.fill();
 // a light facet on the crown and a dark one on the inner side of the right strand
 c.save();peredL(c,d,h);c.clip();
 c.fillStyle=L.volosyS;gran(c,[[30+d,-200],[-190,-200],[-190,-34],[-70+d,-90],[30+d,-128]],4);c.fill();
 c.fillStyle=L.volosyT;gran(c,[[62,-68],[74,-72],[90,-30],[88,40],[86,124],[72,116],[76,40],[78,-30]],4);c.fill();
 c.restore();
}
const putL=c=>gran(c,[[-36,-26,10],[36,-26,10],[158,30,36],[122,128,12],[128,400,0],[-128,400,0],[-122,128,12],[-158,30,36]],10);
function teloL(c,p){
 c.save();c.transform(1,0,-SK,1,0,0);
 c.save();naL(c,p);zadL(c,p);c.restore();
 for(const s of [-1,1])ruka(c,p,RL,s,'verh');
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=L.pidzhak;putL(c);c.fill();
 // a shadow facet on the right side of the jacket
 c.save();putL(c);c.clip();c.fillStyle=L.pidzhakT;gran(c,[[96,40],[170,20],[170,400],[86,400]],4);c.fill();c.restore();
 // blouse in the neckline and skin
 c.fillStyle=L.bluzka;gran(c,[[-44,-16,4],[44,-16,4],[10,214,3],[-10,214,3]],4);c.fill();
 c.fillStyle=L.bluzkaT;gran(c,[[0,52],[3,214],[-3,214]],1);c.fill();
 c.fillStyle=L.kozha;gran(c,[[-32,-24,4],[32,-24,4],[0,54,6]],4);c.fill();
 c.restore();
 sheya(c,p,naL,formaL,L.kozha,L.ten,29,32,-100,-12);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 // a thin chain with a diamond pendant
 c.strokeStyle=L.zolotoT;c.lineWidth=2;c.lineJoin='round';lom(c,[[-30,-10],[-12,20],[0,26],[12,20],[30,-10]]);c.stroke();
 c.fillStyle=L.zoloto;gran(c,[[0,22],[6,30],[0,40],[-6,30]],2);c.fill();
 // pointed blouse collar
 for(const [s,cv] of [[-1,L.bluzkaT],[1,L.bluzkaT]]){c.fillStyle=cv;gran(c,[[s*2,58,3],[s*34,-24,3],[s*50,-10,3],[s*38,44,3]],3);c.fill();}
 for(const s of [-1,1]){c.fillStyle=L.bluzka;gran(c,[[s*3,52,3],[s*33,-24,3],[s*48,-12,3],[s*36,38,3]],3);c.fill();}
 // lapels
 for(const s of [-1,1]){c.fillStyle=L.lackan;gran(c,[[s*44,-18,4],[s*82,4,5],[s*70,34,3],[s*94,44,5],[s*10,216,3],[s*6,194,3]],4);c.fill();}
 c.strokeStyle=L.shov;c.lineWidth=3;c.lineCap=c.lineJoin='round';c.beginPath();for(const s of [-1,1]){c.moveTo(s*70,34);c.lineTo(s*94,44);c.lineTo(s*10,216);}c.stroke();
 c.restore();
 c.save();naL(c,p);golovaL(c,p);c.restore();
 c.restore();
}
const RL={S,tw:140,sy:60,pl:[158,32],lok:[132,178],lokN:[52,-22],k0:[62,160],k1:[94,100],w0:33,w1:28,w2:26,D:96,uz:.92,kx:.5,dY:-3,dov0:-.1,dov1:-.14,stol:STOL,stolTen:'#5E3A22',cvet:'#2B7477',tenR:'#1F5C5F',tenT:'rgba(10,40,42,.3)',tenKist:'rgba(130,70,44,.34)',kromka:'#3E9093',skl:'#164446',manzh:L.bluzka,manzhL:11,kozha:L.kozha,kozhaT:L.ten2};
const rukiL=(c,p)=>{c.save();c.transform(1,0,-SK,1,0,0);for(const s of [-1,1])ruka(c,p,RL,s,'niz');c.restore();};

// -- Artem, 38: fair skin, side-parted haircut, grey temples, short beard, ochre jacket --
const A={sm:-7,kozha:'#EFC7A8',ten:'#D6A382',ten2:'#AE7F62',volosy:'#4A3629',volosyT:'#33251C',volosyS:'#634A3B',sedina:'#A2978B',sedina2:'#827467',boroda:'#705848',borodaS:'#7E6655',shchetina:'#D2AF94',brov:'#3A2A20',liniya:'#2A1B16',raduzhka:'#5A4433',kaima:'#33261C',zrachok:'#1C1410',
 pidzhak:'#B98A34',pidzhakT:'#9C7228',lackan:'#C99A42',shov:'#86621F',rub:'#F0EBE0',rubT:'#D5CEBF',rot:'#5B1C28',rotK2:'#C98A7C',yazyk:'#D9707A',tenRot:'#584436',rotY:82,rotK:.68,rotLin:5,ugolki:7,ulybka:1.4,zubyOt:15,vys:.84,asim:-.05};
const formaA=(c,p)=>{const j=chel(p),q=p.yaw*9;gran(c,[[-86,-126,44],[86,-126,44],[89,34,30],[78,96,26],[36+q,130+j,20],[-36+q,130+j,20],[-78,96,26],[-89,34,30]],30);};
/** Side-parted haircut: volume to the right, short temples, a forehead with a slightly receding hairline. */
const perA=(c,d,h)=>gran(c,[[-80,30,3],[-90,30,3],[-91,-18,8],[-97,-42,14],[-96,-108,34],[-46+d*.6,-150+h,40],[30+d*.6,-156+h,40],[86+d*.4,-134,34],[100,-78,20],[94,-20,10],[90,30,3],[81,30,3],[80,-34,10],[68,-62,12],[28+d,-80,16],[-22+d,-84,18],[-58+d*.5,-70,14],[-76,-46,10],[-79,-18,8]],12);
/** Short beard: an even faceted top from the sideburn to the moustache. */
const borodaA=(c,p,fn,py,j)=>{const q=p.yaw*9,m=fn*.85;gran(c,[[-90,26,4],[-90,64,14],[-74,106,20],[-36+q,134+j,18],[36+q,134+j,18],[74,106,20],[90,64,14],[90,26,4],[81,28,4],[74,58,10],[44+m*.5,70+py,8],[16+m,58+py,6],[m,61+py,4],[-16+m,58+py,6],[-44+m*.5,70+py,8],[-74,58,10],[-81,28,4]],10);};
function golovaA(c,p){
 const sm=A.sm,{fe,fn,fm,py}=sd(p,sm),d=p.yaw*14+sm*.5,h=p.hair*3,ey=py*.8,j=chel(p);
 for(const s of [-1,1])uho(c,p,s,s*86-p.yaw*5,16+py*.3,A.kozha,A.ten,32);
 c.fillStyle=A.kozha;formaA(c,p);c.fill();
 c.save();formaA(c,p);c.clip();
 c.save();c.translate(-2,10);c.fillStyle=A.ten;perA(c,d,h);c.fill();c.restore();
 c.fillStyle=A.ten;c.globalAlpha=.3;for(const s of [-1,1]){gran(c,[[s*90,24],[s*56,80],[s*80,52]],4);c.fill();}c.globalAlpha=1;
 c.restore();
 // beard: a soft edge in stubble tone, the beard tone inside, a grey facet on the chin
 c.save();c.translate(0,-4);c.fillStyle=A.shchetina;borodaA(c,p,fn,py,j);c.fill();c.restore();
 c.fillStyle=A.boroda;borodaA(c,p,fn,py,j);c.fill();
 c.save();borodaA(c,p,fn,py,j);c.clip();c.fillStyle=A.borodaS;gran(c,[[-110,10],[-72,10],[-56,92],[-30+p.yaw*9,150],[-110,150]],4);c.fill();c.restore();
 rotT(c,p,A,sm);
 nos(c,p,{y0:2,y:48,w:16,ten:A.ten,lin:A.ten2,tol:2.4},sm);
 for(const s of [-1,1]){const kg=1-s*p.yaw*.22;
  glaz(c,p,{x:s*40+fe,y:ey,w:37*kg,s,raduzhka:A.raduzhka,kaima:A.kaima,zrachok:A.zrachok,liniya:A.liniya,tol:3,skladka:A.ten,nizh:A.ten,podGlaz:.24});
  brov(c,p,{x:s*43+fe,y:ey-23,dl:54*kg,tol:8.6,s,cvet:A.brov,izg:3,pik:.6,spad:3});}
 c.fillStyle=A.volosy;perA(c,d,h);c.fill();
 c.save();perA(c,d,h);c.clip();
 // a light facet along the parting and grey temples in two steps
 c.fillStyle=A.volosyS;gran(c,[[-44+d,-84],[-40+d,-150],[40+d,-162],[64+d,-122],[10+d,-96]],6);c.fill();
 for(const s of [-1,1]){c.fillStyle=A.sedina2;gran(c,[[s*70,-70],[s*124,-80],[s*124,-2],[s*80,6]],4);c.fill();c.fillStyle=A.sedina;gran(c,[[s*84,-50],[s*124,-58],[s*124,-18],[s*86,-12]],4);c.fill();}
 c.restore();
}
const putA=c=>gran(c,[[-56,-28,10],[56,-28,10],[192,32,40],[158,132,14],[162,400,0],[-162,400,0],[-158,132,14],[-192,32,40]],10);
function teloA(c,p){
 c.save();c.transform(1,0,SK,1,0,0);
 for(const s of [-1,1])ruka(c,p,RA,s,'verh');
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=A.pidzhak;putA(c);c.fill();
 c.save();putA(c);c.clip();c.fillStyle=A.pidzhakT;gran(c,[[120,40],[200,20],[200,400],[110,400]],4);c.fill();c.restore();
 // shirt in the neckline
 c.fillStyle=A.rub;gran(c,[[-60,-24,4],[60,-24,4],[6,226,3],[-6,226,3]],4);c.fill();
 c.restore();
 sheya(c,p,naA,formaA,A.kozha,A.ten,44,50,-110,-8);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 // skin in the open collar, shirt placket
 c.fillStyle=A.kozha;gran(c,[[-40,-12,4],[40,-12,4],[0,30,6]],4);c.fill();
 c.fillStyle=A.rubT;gran(c,[[-2,30],[2,30],[3,226],[-3,226]],1);c.fill();
 // turn-down collar
 for(const s of [-1,1]){c.fillStyle=A.rubT;gran(c,[[s*42,-32,3],[s*64,-12,3],[s*40,32,3],[s*2,26,3]],3);c.fill();c.fillStyle=A.rub;gran(c,[[s*42,-32,3],[s*61,-13,3],[s*38,27,3],[s*4,22,3]],3);c.fill();}
 // lapels
 for(const s of [-1,1]){c.fillStyle=A.lackan;gran(c,[[s*62,-24,4],[s*106,2,5],[s*90,40,3],[s*118,54,5],[s*8,234,3],[s*6,214,3]],4);c.fill();}
 c.strokeStyle=A.shov;c.lineWidth=3;c.lineCap=c.lineJoin='round';c.beginPath();for(const s of [-1,1]){c.moveTo(s*90,40);c.lineTo(s*118,54);c.lineTo(s*8,234);}c.stroke();
 c.restore();
 c.save();naA(c,p);golovaA(c,p);c.restore();
 c.restore();
}
const RA={S,tw:174,sy:64,pl:[191,34],lok:[160,184],lokN:[56,-24],k0:[72,164],k1:[110,104],w0:41,w1:34,w2:31,D:108,kx:.5,dY:-3,dov0:-.1,dov1:-.14,stol:STOL,stolTen:'#5E3A22',cvet:'#C29338',tenR:'#A27A2C',tenT:'rgba(70,46,10,.28)',tenKist:'rgba(130,70,44,.34)',kromka:'#D8AE58',skl:'#7E5C1E',manzh:A.rub,manzhL:12,kozha:A.kozha,kozhaT:A.ten2};
const rukiA=(c,p)=>{c.save();c.transform(1,0,SK,1,0,0);for(const s of [-1,1])ruka(c,p,RA,s,'niz');c.restore();};

Stili.dobavit({id:'kosoy2',nomer:20,imya:'Slanted cube, adults',gruppa:'geo2',
 fon(c,W,H){c.fillStyle='#F4E8D2';c.fillRect(0,0,W,H);
  c.fillStyle='#EEDCB4';mnogo(c,[[150,-60],[920,-60],[780,1140],[10,1140]],0);c.fill();
  c.fillStyle='#D5E2D2';mnogo(c,[[1000,-60],[1770,-60],[1910,1140],[1140,1140]],0);c.fill();},
 stol(c,W,H){c.fillStyle='#A9734D';c.fillRect(0,884,W,H-884);c.fillStyle='#BF8A5F';c.fillRect(0,884,W,12);c.fillStyle='#8E5D3D';c.fillRect(0,1046,W,34);
  // two stacked books, skewed parallelograms
  c.save();c.translate(960,912);c.fillStyle='#2E6668';mnogo(c,[[-104,-58,5],[112,-58,5],[104,-30,5],[-112,-30,5]],5);c.fill();c.fillStyle='#F3E8D6';mnogo(c,[[-62,-52,2],[110,-52,2],[106,-36,2],[-66,-36,2]],2);c.fill();
  c.fillStyle='#C9963E';mnogo(c,[[-126,-30,5],[118,-30,5],[126,4,5],[-118,4,5]],5);c.fill();c.fillStyle='#F3E8D6';mnogo(c,[[-82,-24,2],[122,-24,2],[125,-4,2],[-78,-4,2]],2);c.fill();c.restore();},
 L:{x:XL,y:Y,s:S,ramka:[-125,-340,290,340],telo:teloL,ruki:rukiL},
 A:{x:XA,y:Y,s:S,ramka:[-165,-355,290,350],telo:teloA,ruki:rukiA}});
})();
