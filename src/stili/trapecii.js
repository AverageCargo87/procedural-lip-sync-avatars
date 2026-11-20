'use strict';
/* Style "Trapezoids": Artem has a narrow forehead, a wide jaw and shoulders wider than the waist; Lena has a wide forehead, a small flat-cut chin and a body that widens downward. Straight slanted sides, rounded vertices; the characters read as adults. */
(function(){
const {lerp,clamp,mnogo,sdvig,rot,naGolovu,brovDuga}=Kit;
const S=1.42,G={hy:-176,osnova:130};

/** A small eye with an arched lid: an adult gaze. o: x,y,w,h; zk pupil share; veko 0-1; cvet; lin lid colour, tol thickness. */
function glaz(c,p,o){
 const {x,y,w,h}=o,rx=w/2,ry=h/2,z=clamp(clamp(p.blink)/.8),sm=y+ry*.36,top=lerp(y-ry+h*o.veko,sm,z),niz=lerp(y+ry+1,sm,z*z),iz=ry*.5*(1-z);
 if(z<.97){const zw=w*o.zk,zh=h*.84,px=x+p.gx*(rx-zw/2+w*.04)*1.3,py=y+h*.05+p.gy*h*.08;
  c.save();c.beginPath();c.roundRect(x-rx,y-ry,w,h,ry*.92);c.clip();
  c.beginPath();c.moveTo(x-w,top+iz*2);c.quadraticCurveTo(x,top-iz*2,x+w,top+iz*2);c.lineTo(x+w,niz);c.lineTo(x-w,niz);c.closePath();c.clip();
  c.fillStyle='#fff';c.fillRect(x-w,y-h,2*w,2*h);
  c.fillStyle=o.cvet;c.beginPath();c.ellipse(px,py,zw/2,zh/2,0,0,6.3);c.fill();
  c.fillStyle='#fff';c.beginPath();c.ellipse(px-zw*.2,py-zh*.15,zw*.18,zh*.18,0,0,6.3);c.fill();c.restore();
  c.globalAlpha=1-z;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol;c.beginPath();c.moveTo(x-rx*.98,top+iz*.5);c.quadraticCurveTo(x,top-iz*.5,x+rx*.98,top+iz*.5);c.stroke();c.globalAlpha=1;}
 const a=clamp((clamp(p.blink)-.3)/.35);if(a>0){c.globalAlpha=a;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol+1;c.beginPath();c.moveTo(x-rx*.95,sm+3);c.quadraticCurveTo(x,sm-7,x+rx*.95,sm+3);c.stroke();c.globalAlpha=1;}
}
/** Face from settings: cheeks, mouth, trapezoid nose, eyes, brows. */
function lico(c,p,o){
 const {fe,fn,fm,py}=sdvig(p,1.1),ey=o.glY+py*.8,sm=o.sm;
 if(o.shcheki){c.fillStyle=o.shcheki;for(const s of [-1,1]){const x=sm*.8+s*o.shX+fe*.7,y=o.shY+py*.7;c.beginPath();c.ellipse(x,y,20,12,0,0,6.3);c.fill();}}
 rot(c,p,{x:sm+fm,y:o.rotY+py*1.05,k:o.rotK,cvet:o.rot,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:9,ulybka:1.6,zubyOt:15,vys:.84,asim:o.asim,liniya:8,tenPress:o.ten});
 const nx=sm+fn,ny=o.nosY+py;c.fillStyle=o.nos;mnogo(c,[[nx-7,ny],[nx+7,ny],[nx+14,ny+15],[nx-14,ny+15]],6);c.fill();
 for(const s of [-1,1]){glaz(c,p,{x:sm+s*o.glX+fe,y:ey,w:o.glW,h:o.glH,zk:.78,veko:o.veko,cvet:o.zrachok,lin:o.lin,tol:o.linT});
  brovDuga(c,p,{x:sm+s*o.glX+fe,y:ey-o.brY,dl:o.brDl,tol:o.brTol,cvet:o.brovi,side:s,izgib:o.brIzg,naklon:2,hod:9});}
}
/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]. */
function gran(c,pts,r){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
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
 const ug=Math.atan2(u2y,u2x),kw=o.kisw,ks=side;if(hy-kw*1.35>164)return;c.save();c.translate(hx,hy);c.rotate(ug);
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

// -- Lena: chestnut shoulder-length hair in a wedge, side parting, tucked behind the ear on one side; wide forehead, small chin; coral A-line dress --
const L={kozha:'#FFDCC6',ten:'#EFB698',volosy:'#74412E',volosyT:'#5A2E23',svet:'#905438',telo:'#EE6C5B',rukav:'#C2483D',kant:'#FFE3CC',serga:'#F4C24E',shcheki:'#FFC6B0',nos:'#F0B193',rot:'#8A2A3C',yazyk:'#EE7B7B',zrachok:'#2C2024',brovi:'#5A2C22',lin:'#2C2024',linT:5,glX:54,glY:4,glW:38,glH:40,veko:.08,brY:37,brDl:40,brTol:6,brIzg:6,nosY:38,rotY:82,rotK:.7,asim:.08,shX:62,shY:54,sm:6};
function teloL(c,p){
 c.rotate(.016);
 const dz=-p.yaw*14,h=p.hair*22;
 c.save();naGolovu(c,p,G);c.fillStyle=L.volosyT;gran(c,[[-140+dz,-130,40],[140+dz,-130,40],[178+dz+h,172,18],[-178+dz+h,204,18]],20);c.fill();c.restore();
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=L.telo;gran(c,[[-60,-8,14],[60,-8,14],[106,8,16],[166,330,10],[-166,330,10],[-106,8,16]],20);c.fill();
 c.save();c.translate(L.sm*.5,0);
 c.fillStyle=L.kant;gran(c,[[-52,-8,6],[52,-8,6],[18,58,8],[-18,58,8]],6);c.fill();
 c.fillStyle=L.ten;gran(c,[[-26,-70],[26,-70],[30,-8],[42,-8,6],[12,44,8],[-12,44,8],[-42,-8,6],[-30,-8]],4);c.fill();
 c.restore();c.restore();
 c.save();naGolovu(c,p,G);
 const go=[[-146,-140,40],[146,-140,40],[74,136,24],[-74,136,24]];
 const e=-p.yaw*12;c.fillStyle=L.kozha;gran(c,[[92+e,-12,8],[130+e,-14,12],[126+e,36,14],[98+e,50,8]],10);c.fill();
 c.fillStyle=L.serga;gran(c,[[116+e,44],[126+e,60],[116+e,78],[106+e,60]],4);c.fill();
 c.fillStyle=L.kozha;gran(c,go,30);c.fill();lico(c,p,L);
 const d=p.yaw*12+L.sm*.5,pr=-40+d,dy=p.pitch*5,v=[[-152,-152,44],[pr,-176,16],[152,-152,44],[150,-6,12],[116,-14,8],[106+d,-48+dy,36],[pr,-110+dy,5],[-100+d,-54+dy,26],[-108,6,8],[-130+h*.3,84,6],[-150,6,12]];
 c.fillStyle=L.volosy;gran(c,v,20);c.fill();
 c.save();gran(c,v,20);c.clip();c.fillStyle=L.svet;gran(c,[[pr,-190],[176,-180],[176,-20],[106+d,-44+dy],[pr+2,-108+dy]],4);c.fill();c.restore();
 c.restore();
}
const rukiL=(c,p)=>{c.rotate(.016);dveRuki(c,p,{pl:[136,54,100,10],v:46,n:40,restX:136,restY:238,a:72,b:72,k:1.55,vnutr:.46,cvet:L.rukav,kist:L.kozha,kisw:48});};

// -- Artem: wide jaw, narrow forehead, flat haircut; shoulders wider than the waist, blue jacket with lapels --
const A={kozha:'#B57C53',ten:'#94603D',grany:'#A87049',volosy:'#20232E',svet:'#363B4C',telo:'#2B4A78',rukav:'#1C3459',lackan:'#3A5F93',vorot:'#EFE2CC',vorot2:'#FFF9EE',shcheki:null,nos:'#94603D',rot:'#5E1F2A',yazyk:'#E8707C',zrachok:'#231B26',brovi:'#20232E',lin:'#2F211F',linT:4,glX:56,glY:4,glW:40,glH:40,veko:.12,brY:36,brDl:46,brTol:10,brIzg:5,nosY:38,rotY:84,rotK:.8,asim:-.08,shX:92,shY:50,sm:-8};
function teloA(c,p){
 c.rotate(-.016);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=A.ten;mnogo(c,[[-52,-70],[52,-70],[60,24],[-60,24]],4);c.fill();
 c.save();c.translate(A.sm*.5,0);
 c.fillStyle=A.vorot;gran(c,[[-68,-10],[68,-10],[60,170],[-60,170]],6);c.fill();
 c.fillStyle=A.vorot2;for(const s of [-1,1]){gran(c,[[s*2,16,4],[s*50,-12,6],[s*60,26,6],[s*22,60,4]],5);c.fill();}
 c.fillStyle=A.telo;gran(c,[[-70,-8,10],[-6,110,8],[6,110,8],[70,-8,10],[182,20,26],[130,330,10],[-122,330,10],[-174,20,26]],20);c.fill();
 c.fillStyle=A.lackan;for(const s of [-1,1]){gran(c,[[s*62,-10,6],[s*104,6,8],[s*70,66,6],[s*96,84,6],[s*8,120,4]],6);c.fill();}
 c.restore();c.restore();
 c.save();naGolovu(c,p,G);const e=-p.yaw*16,d=p.yaw*12+A.sm*.5,h=p.hair*10,dy=p.pitch*5,fe=p.yaw*26;
 const g=[[-102,-142,30],[102,-142,30],[152,132,42],[-152,132,42]];
 c.fillStyle=A.kozha;for(const s of [-1,1]){gran(c,[[s*118+e,2,12],[s*156+e,-2,12],[s*166+e,44,14],[s*134+e,58,10]],12);c.fill();}
 gran(c,g,30);c.fill();
 // side plane of the jaw on the far side
 c.save();gran(c,g,30);c.clip();c.fillStyle=A.grany;gran(c,[[176,-40],[112+fe*.8,-40],[120+fe*.8,60],[66+fe*.8,150],[176,150]],4);c.fill();c.restore();
 lico(c,p,A);
 const v=[[-120,-24,8],[-128,-104,24],[-104+d+h,-192,30],[100+d+h,-204,30],[130,-104,24],[122,-24,8],[104,-28,6],[92+d,-86+dy,14],[-16+d,-104+dy,10],[-90+d,-84+dy,14],[-104,-28,6]];
 c.fillStyle=A.volosy;gran(c,v,16);c.fill();
 c.save();gran(c,v,16);c.clip();c.fillStyle=A.svet;gran(c,[[-16+d,-210],[-140,-210],[-140,-100],[-90+d,-98+dy],[-14+d,-118+dy]],4);c.fill();c.restore();
 c.restore();
}
const rukiA=(c,p)=>{c.rotate(-.016);dveRuki(c,p,{pl:[182,46,126,10],v:56,n:46,restX:150,restY:238,a:76,b:75,k:1.55,vnutr:.42,cvet:A.rukav,kist:A.kozha,kisw:52,manzh:A.vorot});};

Stili.dobavit({id:'trapecii',nomer:8,imya:'Trapezoids',gruppa:'geo',rukiZaStolom:true,
 fon(c,W,H){c.fillStyle='#CFE4EC';c.fillRect(0,0,W,H);c.fillStyle='#E0EEF1';mnogo(c,[[300,-60],[1620,-60],[1960,920],[-40,920]],0);c.fill();},
 stol(c,W,H){c.fillStyle='#F3CF8E';mnogo(c,[[120,900,16],[1800,900,16],[2040,1160],[-120,1160]],0);c.fill();c.fillStyle='#E4B066';mnogo(c,[[100,920],[1820,920],[2060,1180],[-140,1180]],0);c.fill();},
 L:{x:560,y:668,s:S,ramka:[-190,-365,380,380],telo:teloL,ruki:rukiL},
 A:{x:1360,y:668,s:S,ramka:[-190,-365,380,380],telo:teloA,ruki:rukiA}});
})();
