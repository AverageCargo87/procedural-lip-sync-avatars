'use strict';
/* Style "Facets": heads and bodies are octagons with corners cut at about 135 degrees, the hair is cut into large masses in two or three tones, the face has one side facet that slides on a turn. A crystal, but a soft one: rounded vertices, smiling faces. */
(function(){
const {lerp,clamp,mnogo,sdvig,rot,naGolovu}=Kit;
const S=1.42,G={hy:-168,osnova:130};

/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]. */
function gran(c,pts,r){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}
/** Faceted eye: a cut pill with a matching pupil, a diamond highlight. o: x,y,w,h; zk; veko; cvet; lin; tol. */
function glaz(c,p,o){
 const {x,y,w,h}=o,rx=w/2,ry=h/2,z=clamp(clamp(p.blink)/.8),sm=y+ry*.4,top=lerp(y-ry+h*o.veko,sm,z),niz=lerp(y+ry+1,sm,z*z),iz=ry*.34*(1-z);
 const form=(a,b,X,Y,r)=>gran(c,[[X-a*.5,Y-b],[X+a*.5,Y-b],[X+a,Y-b*.45],[X+a,Y+b*.45],[X+a*.5,Y+b],[X-a*.5,Y+b],[X-a,Y+b*.45],[X-a,Y-b*.45]],r);
 if(z<.97){const zw=w*o.zk,zh=h*.82,px=x+p.gx*(rx-zw/2+w*.03)*1.25,py=y+h*.07+p.gy*h*.1;
  c.save();form(rx,ry,x,y,10);c.clip();
  c.beginPath();c.moveTo(x-w,top+iz*2);c.quadraticCurveTo(x,top-iz*2,x+w,top+iz*2);c.lineTo(x+w,niz);c.lineTo(x-w,niz);c.closePath();c.clip();
  c.fillStyle='#fff';c.fillRect(x-w,y-h,2*w,2*h);
  c.fillStyle=o.cvet;form(zw/2,zh/2,px,py,9);c.fill();
  const bx=px-zw*.2,by=py-zh*.16,br=zw*.2;c.fillStyle='#fff';gran(c,[[bx,by-br*1.1],[bx+br,by],[bx,by+br*1.1],[bx-br,by]],2);c.fill();c.restore();
  c.globalAlpha=1-z;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol;c.beginPath();c.moveTo(x-rx*1.04,top+iz*.54);c.quadraticCurveTo(x,top-iz*.54,x+rx*1.04,top+iz*.54);c.stroke();c.globalAlpha=1;}
 const a=clamp((clamp(p.blink)-.3)/.35);if(a>0){c.globalAlpha=a;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol+1;c.beginPath();c.moveTo(x-rx*.95,sm+3);c.quadraticCurveTo(x,sm-7,x+rx*.95,sm+3);c.stroke();c.globalAlpha=1;}
}
/** A four-point polyline brow: obtuse angles read as a soft arc. */
function brov(c,p,x,y,s,o){
 const r=(p.brow+(s<0?p.browL:0))*9,d=o.brDl/2,g=3.5+p.brow*2;c.strokeStyle=o.brovi;c.lineCap=c.lineJoin='round';c.lineWidth=o.brTol;c.beginPath();c.moveTo(x-s*d,y-r+3);c.lineTo(x-s*d*.42,y-r-g);c.lineTo(x+s*d*.3,y-r-g);c.lineTo(x+s*d,y-r+5);c.stroke();
}
/** Face: faceted blush, mouth, diamond nose, eyes, brows. */
function lico(c,p,o){
 const {fe,fn,fm,py}=sdvig(p,1.1),ey=o.glY+py*.8,sm=o.sm;
 if(o.shcheki){c.fillStyle=o.shcheki;for(const s of [-1,1]){const x=sm*.8+s*o.shX+fe*.7,y=o.shY+py*.7;gran(c,[[x-12,y-13],[x+12,y-13],[x+24,y],[x+12,y+13],[x-12,y+13],[x-24,y]],5);c.fill();}}
 rot(c,p,{x:sm+fm,y:o.rotY+py*1.05,k:o.rotK,cvet:o.rot,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:9,ulybka:1.6,zubyOt:15,vys:.84,asim:o.asim,liniya:8,tenPress:o.ten});
 const nx=sm+fn,ny=o.nosY+py;c.fillStyle=o.nos;gran(c,[[nx,ny-6],[nx+13,ny+10],[nx+6,ny+16],[nx-6,ny+16],[nx-13,ny+10]],4);c.fill();
 for(const s of [-1,1]){glaz(c,p,{x:sm+s*o.glX+fe,y:ey,w:o.glW,h:o.glH,zk:.76,veko:o.veko,cvet:o.zrachok,lin:o.lin,tol:o.linT});brov(c,p,sm+s*o.glX+fe,ey-o.brY,s,o);}
}
/** Angled arm: the shoulder is attached to the body and narrows toward the wrist; a mitten hand with a thumb.
 *  o: pl:[outer x,y, inner x,y] right shoulder; v,n width at shoulder and wrist; a,b bones; cvet; kist; kisw hand width; manzh cuff colour. */
function ruka(c,hx,hy,side,o,otkr=0){
 const [px,py,qx,qy]=o.pl,sx=side*(px+qx)/2,sy=(py+qy)/2,a=o.a,b=o.b,dl=Math.hypot(hx-sx,hy-sy)||1,d=Math.min(a+b-1,dl),ux=(hx-sx)/dl,uy=(hy-sy)/dl,ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1),h=a*Math.sqrt(1-ca*ca);
 let nx=-uy,ny=ux;if(nx*side<0){nx=-nx;ny=-ny;}
 const ex=sx+ux*a*ca+nx*h,ey=sy+uy*a*ca+ny*h,e1=Math.hypot(ex-sx,ey-sy)||1,e2=Math.hypot(hx-ex,hy-ey)||1,u1x=(ex-sx)/e1,u1y=(ey-sy)/e1,u2x=(hx-ex)/e2,u2y=(hy-ey)/e2;
 let mx=u1x-u2x,my=u1y-u2y;const ml=Math.hypot(mx,my);if(ml<.08){mx=nx;my=ny;}else{mx/=ml;my/=ml;}
 const w=(o.v+o.n)/4,syn=Math.max(.5,Math.sqrt(clamp((1+u1x*u2x+u1y*u2y)/2))),naruzh=Math.min(w/syn,e1*.7,e2*.7),vnut=Math.min(w/syn,e1*.6,e2*.6);
 let wx=-u2y,wy=u2x;if(wx*mx+wy*my<0){wx=-wx;wy=-wy;}
 c.fillStyle=o.cvet;gran(c,[[side*px,py,14],[ex+mx*naruzh,ey+my*naruzh,20],[hx+wx*o.n/2,hy+wy*o.n/2,3],[hx-wx*o.n/2,hy-wy*o.n/2,3],[ex-mx*vnut,ey-my*vnut,10],[side*qx,qy,8]],10);c.fill();
 const ug=Math.atan2(u2y,u2x),kw=o.kisw,ks=side;if(hy-kw*1.35>167)return;c.save();c.translate(hx,hy);c.rotate(ug);
 if(o.manzh){c.fillStyle=o.manzh;mnogo(c,[[-13,-o.n/2-3],[5,-o.n/2-3],[5,o.n/2+3],[-13,o.n/2+3]],4);c.fill();}
 // the hand continues the forearm and tilts up a little, the thumb lies along the palm: neither a fist nor a thumbs-up
 let dg=Math.atan2(u2y-.42,u2x)-ug;if(dg>3.14)dg-=6.28;if(dg<-3.14)dg+=6.28;c.rotate(dg);
 c.fillStyle=o.kist;gran(c,[[-6,-ks*kw*.36],[kw*1.02,-ks*kw*.42],[kw*1.26,ks*kw*.02],[kw*1.14,ks*kw*.4],[-6,ks*kw*.38]],kw*.2);c.fill();
 const t2=lerp(.12,.7,clamp(otkr));c.strokeStyle=o.kist;c.lineCap='round';c.lineWidth=kw*.3;c.beginPath();c.moveTo(kw*.12,ks*kw*.32);c.lineTo(kw*.12+Math.cos(t2)*kw*.48,ks*(kw*.38+Math.sin(t2)*kw*.3));c.stroke();c.restore();
}
/** Both arms: the same offsets as in Kit.dveRuki. */
function dveRuki(c,p,o){
 const ves=y=>1-clamp(-y/40),dx=p.lean*22/S,dy=(p.bob*6-p.breath*2.2)/S,k=o.k,rx=o.restX,ry=o.restY,vn=o.vnutr;
 ruka(c,-rx-p.hLy*k*vn+p.hLx*k-dx*ves(p.hLy),ry+p.hLy*k-dy*ves(p.hLy),-1,o,p.hLo);
 ruka(c,rx+p.hRy*k*vn+p.hRx*k-dx*ves(p.hRy),ry+p.hRy*k-dy*ves(p.hRy),1,o,p.hRo);
}

// -- Lena: honey hair in facets and a crystal braid over the shoulder; berry cardigan --
const L={kozha:'#FFDCC4',grany:'#F8CCB0',ten:'#EDB193',volosy:'#EFAE36',volosyT:'#D08A20',svet:'#FACC62',telo:'#C93A6E',rukav:'#9E2554',shcheki:'#FFC2A8',nos:'#EFAE8C',rot:'#8A2A3C',yazyk:'#EE7B7B',zrachok:'#2B2340',brovi:'#B5751A',lin:'#2B2340',linT:4.5,glX:56,glY:12,glW:44,glH:50,veko:.1,brY:40,brDl:44,brTol:7,nosY:44,rotY:84,rotK:.76,asim:.08,shX:84,shY:60,sm:10};
const GOL_L=[[-84,-146],[84,-146],[136,-92],[136,56],[72,134],[-72,134],[-136,56],[-136,-92]];
/** Braid: faceted links from the nape to the chest, swings with p.hair. */
function kosa(c,p){
 const h=p.hair*30,ax=-108+p.lean*7+p.yaw*5-p.yaw*10,ay=-44+p.pitch*5,bx=-74+h,by=96,n=4;
 for(let i=0;i<n;i++){const t=i/(n-1),z=i%2?5:-5,x=lerp(ax,bx,t)+Math.sin(t*3.14)*-12+z,y=lerp(ay,by,t),w=lerp(36,26,t),hh=lerp(36,30,t);c.fillStyle=i%2?L.volosyT:L.volosy;gran(c,[[x-w*.5,y-hh],[x+w*.5,y-hh],[x+w,y],[x+w*.5,y+hh],[x-w*.5,y+hh],[x-w,y]],7);c.fill();}
 const x=bx-1,y=by+24;c.fillStyle=L.svet;gran(c,[[x-11,y],[x+11,y],[x+18,y+30],[x-18,y+30]],6);c.fill();
}
function teloL(c,p){
 c.rotate(.02);
 const dz=-p.yaw*12;
 c.save();naGolovu(c,p,G);c.fillStyle=L.volosyT;gran(c,[[-140+dz,-120,16],[120+dz,-120,16],[120+dz,60,14],[-100+dz,128,10],[-166+dz,60,14]],16);c.fill();c.restore();
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=L.telo;gran(c,[[-52,-8,12],[52,-8,12],[108,10,14],[126,60,14],[132,330,10],[-132,330,10],[-126,60,14],[-108,10,14]],16);c.fill();
 c.save();c.translate(L.sm*.5,0);c.fillStyle=L.ten;gran(c,[[-30,-70],[30,-70],[34,-6],[46,-6,6],[34,24,6],[0,50,6],[-34,24,6],[-46,-6,6],[-34,-6]],4);c.fill();c.restore();
 c.restore();
 kosa(c,p);
 c.save();naGolovu(c,p,G);const d=p.yaw*12+L.sm*.5,dy=p.pitch*5,fe=p.yaw*26,e=-p.yaw*14;
 c.fillStyle=L.kozha;gran(c,[[126+e,-8,12],[156+e,-2,12],[160+e,28,12],[142+e,50,10],[126+e,48,8]],10);c.fill();
 gran(c,GOL_L,18);c.fill();
 c.save();gran(c,GOL_L,18);c.clip();c.fillStyle=L.grany;gran(c,[[-160,-100],[-114+fe*.8,-100],[-114+fe*.8,46],[-52+fe*.8,140],[-160,140]],6);c.fill();c.restore();
 lico(c,p,L);
 const P={a:[-154,26],b:[-160,-96],v:[-96,-178],g:[64+d,-190],e:[152,-116],z:[146,-24],i:[126,-24],k:[104+d,-76+dy],l:[48+d,-116+dy],m:[-6+d,-58+dy],n:[-76+d,-100+dy],o:[-128,22]},v=[P.a,P.b,P.v,P.g,P.e,P.z,P.i,P.k,P.l,P.m,P.n,P.o].map(q=>[q[0],q[1]]);
 c.fillStyle=L.volosy;gran(c,v,12);c.fill();
 c.save();gran(c,v,12);c.clip();c.fillStyle=L.svet;gran(c,[[P.v[0],P.v[1]-20],[P.g[0],P.g[1]-20],P.l,P.n],4);c.fill();c.fillStyle=L.volosyT;gran(c,[[P.g[0],P.g[1]-20],[180,-130],[180,0],P.k,P.l],4);c.fill();c.restore();
 c.restore();
}
const rukiL=(c,p)=>{c.rotate(.02);dveRuki(c,p,{pl:[142,46,100,10],v:46,n:40,restX:136,restY:238,a:72,b:72,k:1.55,vnutr:.46,cvet:L.rukav,kist:L.kozha,kisw:48});};

// -- Artem: dark hair faceted upward, thin octagonal glasses, emerald sweater with a shirt collar --
const A={kozha:'#B47B54',grany:'#A76F49',ten:'#8F5B3A',volosy:'#222C36',volosyT:'#303D4A',svet:'#44556A',telo:'#1FA07A',rukav:'#127A5C',vorot:'#FDF3E2',ochki:'#222C36',shcheki:'#AD6E48',nos:'#8F5B3A',rot:'#5E1F2A',yazyk:'#E8707C',zrachok:'#201A24',brovi:'#222C36',lin:'#3A2A26',linT:3,glX:58,glY:10,glW:36,glH:42,veko:.1,brY:48,brDl:46,brTol:9,nosY:44,rotY:84,rotK:.78,asim:-.08,shX:92,shY:62,sm:-10};
const GOL_A=[[-88,-142],[88,-142],[140,-88],[140,62],[90,134],[-90,134],[-140,62],[-140,-88]];
function teloA(c,p){
 c.rotate(-.02);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=A.ten;mnogo(c,[[-42,-70],[42,-70],[48,24],[-48,24]],4);c.fill();
 c.fillStyle=A.telo;gran(c,[[-58,-8,12],[58,-8,12],[122,8,14],[140,60,14],[146,330,10],[-146,330,10],[-140,60,14],[-122,8,14]],16);c.fill();
 c.save();c.translate(A.sm*.5,0);c.fillStyle=A.vorot;for(const s of [-1,1]){gran(c,[[s*2,24,6],[s*48,-14,6],[s*78,10,8],[s*30,56,6]],6);c.fill();}c.restore();
 c.restore();
 c.save();naGolovu(c,p,G);const e=-p.yaw*16,d=p.yaw*12+A.sm*.5,h=p.hair*5,dy=p.pitch*5,fe=p.yaw*26;
 c.fillStyle=A.kozha;gran(c,[[124+e,-6,12],[156+e,0,12],[160+e,30,12],[140+e,52,10],[124+e,50,8]],10);c.fill();
 gran(c,GOL_A,18);c.fill();
 c.save();gran(c,GOL_A,18);c.clip();c.fillStyle=A.grany;gran(c,[[160,-100],[116+fe*.8,-100],[116+fe*.8,50],[60+fe*.8,140],[160,140]],6);c.fill();c.restore();
 lico(c,p,A);
 const ey=A.glY+p.pitch*10.4,ox=A.sm+p.yaw*26.4,R=37;c.strokeStyle=A.ochki;c.lineWidth=4.5;c.lineJoin=c.lineCap='round';for(const s of [-1,1]){const x=ox+s*A.glX;gran(c,[[x-R*.56,ey-R*.8],[x+R*.56,ey-R*.8],[x+R,ey-R*.34],[x+R,ey+R*.34],[x+R*.56,ey+R*.8],[x-R*.56,ey+R*.8],[x-R,ey+R*.34],[x-R,ey-R*.34]],6);c.stroke();}
 c.beginPath();c.moveTo(ox-A.glX+R,ey-7);c.quadraticCurveTo(ox,ey-13,ox+A.glX-R,ey-7);c.moveTo(ox+A.glX+R,ey-7);c.lineTo(138,ey-3);c.moveTo(ox-A.glX-R,ey-7);c.lineTo(-138,ey-3);c.stroke();
 const P={a:[-148,-20],b:[-160,-96],v:[-122+d+h,-176],g:[-62+d+h,-212],e:[34+d+h,-222],z:[112+d+h,-190],i:[158,-104],k:[146,-20],l:[128,-22],m:[114+d,-86+dy],n:[44+d,-110+dy],o:[-38+d,-84+dy],q:[-104+d,-104+dy],r:[-128,-22]},v=[P.a,P.b,P.v,P.g,P.e,P.z,P.i,P.k,P.l,P.m,P.n,P.o,P.q,P.r].map(q=>[q[0],q[1]]);
 c.fillStyle=A.volosy;gran(c,v,12);c.fill();
 c.save();gran(c,v,12);c.clip();c.fillStyle=A.svet;gran(c,[[P.g[0],P.g[1]-20],[P.e[0],P.e[1]-20],P.n,P.o],4);c.fill();c.fillStyle=A.volosyT;gran(c,[[P.e[0],P.e[1]-20],[190,-200],[190,-60],P.m,P.n],4);c.fill();c.restore();
 c.restore();
}
const rukiA=(c,p)=>{c.rotate(-.02);dveRuki(c,p,{pl:[156,44,108,8],v:50,n:42,restX:150,restY:238,a:75,b:74,k:1.55,vnutr:.44,cvet:A.rukav,kist:A.kozha,kisw:50});};

Stili.dobavit({id:'grani',nomer:9,imya:'Facets',gruppa:'geo',rukiZaStolom:true,
 fon(c,W,H){c.fillStyle='#E6E4F5';c.fillRect(0,0,W,H);c.fillStyle='#DCDAF0';mnogo(c,[[-40,-40],[620,-40],[300,560],[-40,760]],0);c.fill();mnogo(c,[[1960,120],[1960,920],[1420,920],[1620,380]],0);c.fill();c.fillStyle='#EFEEFA';mnogo(c,[[760,-40],[1320,-40],[1180,420],[900,520]],0);c.fill();},
 stol(c,W,H){c.fillStyle='#6464B4';gran(c,[[-60,1000,0],[80,900,14],[1840,900,14],[1980,1000,0],[1980,1140,0],[-60,1140,0]],0);c.fill();c.fillStyle='#46468F';gran(c,[[-60,1020,0],[86,918,10],[1834,918,10],[1980,1020,0],[1980,1140,0],[-60,1140,0]],0);c.fill();},
 L:{x:560,y:664,s:S,ramka:[-205,-365,410,410],telo:teloL,ruki:rukiL},
 A:{x:1360,y:664,s:S,ramka:[-205,-365,410,410],telo:teloA,ruki:rukiA}});
})();
