'use strict';
/* Style "Slanted cube": the whole figure is parallelograms with a single 9 degree skew, mirrored between the two characters so they lean toward each other. A mid-century cartoon manner: bold planes, the face skewed with the head and shifted toward the partner. */
(function(){
const {lerp,clamp,mnogo,sdvig,rot,naGolovu,brovDuga}=Kit;
const S=1.42,SK=.158,G={hy:-164,osnova:130};

/** Pill eye with a lid: the top is cut by an arc, not a straight line. o: x,y,w,h; zk pupil share; veko 0-1; cvet; lin lid line colour, tol thickness. */
function glaz(c,p,o){
 const {x,y,w,h}=o,rx=w/2,ry=h/2,z=clamp(clamp(p.blink)/.8),sm=y+ry*.4,top=lerp(y-ry+h*o.veko,sm,z),niz=lerp(y+ry+1,sm,z*z),iz=ry*.42*(1-z);
 if(z<.97){const zw=w*o.zk,zh=h*.8,px=x+p.gx*(rx-zw/2+w*.03)*1.25,py=y+h*.07+p.gy*h*.1;
  c.save();c.beginPath();c.roundRect(x-rx,y-ry,w,h,rx);c.clip();
  c.beginPath();c.moveTo(x-w,top+iz*2);c.quadraticCurveTo(x,top-iz*2,x+w,top+iz*2);c.lineTo(x+w,niz);c.lineTo(x-w,niz);c.closePath();c.clip();
  c.fillStyle='#fff';c.fillRect(x-w,y-h,2*w,2*h);
  c.fillStyle=o.cvet;c.beginPath();c.roundRect(px-zw/2,py-zh/2,zw,zh,zw/2);c.fill();
  c.fillStyle='#fff';c.beginPath();c.ellipse(px-zw*.2,py-zh*.16,zw*.21,zh*.17,0,0,6.3);c.fill();c.restore();
  c.globalAlpha=1-z;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol;c.beginPath();c.moveTo(x-rx*1.04,top+iz*.54);c.quadraticCurveTo(x,top-iz*.54,x+rx*1.04,top+iz*.54);c.stroke();c.globalAlpha=1;}
 const a=clamp((clamp(p.blink)-.3)/.35);if(a>0){c.globalAlpha=a;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol+1;c.beginPath();c.moveTo(x-rx*.95,sm+3);c.quadraticCurveTo(x,sm-7,x+rx*.95,sm+3);c.stroke();c.globalAlpha=1;}
}
/** Face: everything is skewed with the head; sm is a constant shift of the features toward the partner, like a cube in three-quarter view. */
function lico(c,p,o){
 const {fe,fn,fm,py}=sdvig(p,1.1),ey=o.glY+py*.8,sm=o.sm;
 if(o.shcheki){c.fillStyle=o.shcheki;for(const s of [-1,1]){c.beginPath();c.ellipse(sm*.8+s*o.shX+fe*.7,o.shY+py*.7,24,13,0,0,6.3);c.fill();}}
 rot(c,p,{x:sm+fm,y:o.rotY+py*1.05,k:o.rotK,cvet:o.rot,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:9,ulybka:1.6,zubyOt:15,vys:.84,asim:o.asim,liniya:8,tenPress:o.ten});
 // nose: a small wedge toward the lean
 const nx=sm+fn+o.nosS,ny=o.nosY+py,ns=Math.sign(o.nosS);c.fillStyle=o.nos;mnogo(c,[[nx-ns*11,ny-8],[nx+ns*17,ny+13],[nx-ns*11,ny+15]],6);c.fill();
 for(const s of [-1,1]){glaz(c,p,{x:sm+s*o.glX+fe,y:ey,w:o.glW,h:o.glH,zk:.76,veko:o.veko,cvet:o.zrachok,lin:o.lin,tol:o.linT});
  brovDuga(c,p,{x:sm+s*o.glX+fe,y:ey-o.brY,dl:o.brDl,tol:o.brTol,cvet:o.brovi,side:s,izgib:6,naklon:2,hod:9});}
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
 // m points outward from the elbow bend; for a straight arm, sideways from the arm
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

// -- Lena: red bob with curled ends, side parting toward the partner; sea-green dress with a wide collar --
const L={kozha:'#FFD9C0',ten:'#F0B596',volosy:'#D95A2B',volosyT:'#B54425',svet:'#EE7F40',telo:'#1E7A82',rukav:'#155E66',vorot:'#FFF1DA',shcheki:'#FFC6AA',nos:'#F2B190',rot:'#8A2A3C',yazyk:'#EE7B7B',zrachok:'#2D2230',brovi:'#A23B1E',lin:'#2D2230',linT:5,glX:54,glY:6,glW:40,glH:50,veko:.1,brY:42,brDl:40,brTol:7,nosY:42,nosS:3,rotY:82,rotK:.78,asim:.08,shX:86,shY:56,sm:10};
function teloL(c,p){
 c.save();c.transform(1,0,-SK,1,0,0);
 const dz=-p.yaw*12,h=p.hair*20;
 c.save();naGolovu(c,p,G);c.fillStyle=L.volosyT;mnogo(c,[[-146+dz,-120,20],[146+dz,-120,20],[154+dz,26,22],[190+dz+h,68,16],[140+dz,114,18],[-140+dz,114,18],[-190+dz+h,68,16],[-154+dz,26,22]],20);c.fill();c.restore();
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=L.ten;mnogo(c,[[-34,-70],[34,-70],[40,24],[-40,24]],4);c.fill();
 c.fillStyle=L.telo;mnogo(c,[[-52,-6,14],[52,-6,14],[120,20,18],[126,330,10],[-126,330,10],[-120,20,18]],20);c.fill();
 c.fillStyle=L.vorot;for(const s of [-1,1]){mnogo(c,[[s*4,46,8],[s*36,-16,8],[s*96,10,12],[s*46,76,10]],10);c.fill();}
 c.restore();
 c.save();naGolovu(c,p,G);
 c.fillStyle=L.kozha;mnogo(c,[[-132,-140,34],[132,-140,28],[132,126,40],[-132,126,30]],30);c.fill();lico(c,p,L);
 const d=p.yaw*12+L.sm*.5,pr=52+d,dy=p.pitch*5,v=[[-150,-168,40],[pr,-190,20],[150,-160,40],[150,20,12],[122,26,8],[108+d,-48+dy,22],[pr,-104+dy,5],[-62+d,-64+dy,34],[-124,28,8],[-150,22,12]];
 c.fillStyle=L.volosy;gran(c,v,20);c.fill();
 c.save();gran(c,v,20);c.clip();c.fillStyle=L.svet;gran(c,[[pr,-200],[-190,-200],[-190,-20],[-74+d,-92+dy],[pr,-134+dy]],4);c.fill();c.restore();
 c.restore();c.restore();
}
const rukiL=(c,p)=>{c.save();c.transform(1,0,-SK,1,0,0);dveRuki(c,p,{pl:[146,40,92,12],v:50,n:42,restX:138,restY:238,a:73,b:72,k:1.55,vnutr:.42,cvet:L.rukav,kist:L.kozha,kisw:50});c.restore();};

// -- Artem: dark forelock, mustard cardigan, cream shirt, coral tie --
const A={kozha:'#BC8259',ten:'#9A6341',volosy:'#2A2738',svet:'#423D58',telo:'#E8AE36',rukav:'#BD8418',vorot:'#FFF1DA',galstuk:'#E2613F',shcheki:'#B5734C',nos:'#9A6341',rot:'#5E1F2A',yazyk:'#E8707C',zrachok:'#231B26',brovi:'#2A2738',lin:'#2F211F',linT:4,glX:56,glY:4,glW:40,glH:50,veko:.1,brY:42,brDl:44,brTol:9,nosY:42,nosS:-3,rotY:82,rotK:.8,asim:-.08,shX:88,shY:56,sm:-10};
function teloA(c,p){
 c.save();c.transform(1,0,SK,1,0,0);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=A.ten;mnogo(c,[[-40,-70],[40,-70],[46,24],[-46,24]],4);c.fill();
 c.fillStyle=A.vorot;mnogo(c,[[-60,-14],[60,-14],[60,170],[-60,170]],6);c.fill();
 c.fillStyle=A.galstuk;mnogo(c,[[-11,18,4],[11,18,4],[18,190,4],[-18,190,4]],6);c.fill();
 c.fillStyle=A.telo;mnogo(c,[[-58,-8,10],[0,136,10],[58,-8,10],[128,18,18],[136,330,10],[-136,330,10],[-128,18,18]],20);c.fill();
 c.restore();
 c.save();naGolovu(c,p,G);const e=-p.yaw*16,d=p.yaw*12+A.sm*.5,h=p.hair*10,dy=p.pitch*5;
 c.fillStyle=A.kozha;mnogo(c,[[120+e,-4,14],[152+e,2,14],[148+e,46,14],[120+e,46,8]],14);c.fill();
 c.fillStyle=A.ten;mnogo(c,[[134+e,10,6],[146+e,14,6],[144+e,34,6],[134+e,34,4]],5);c.fill();
 c.fillStyle=A.kozha;mnogo(c,[[-134,-140,28],[134,-140,34],[134,126,30],[-134,126,40]],30);c.fill();lico(c,p,A);
 const v=[[-144,-10,8],[-158,-146,30],[-104+d+h,-214,34],[112+d+h,-200,40],[148,-134,34],[146,-8,8],[126,-8,6],[112+d,-88+dy,16],[-34+d,-76+dy,18],[-118+d,-98+dy,12],[-124,-10,6]];
 c.fillStyle=A.volosy;gran(c,v,16);c.fill();
 c.save();gran(c,v,16);c.clip();c.fillStyle=A.svet;gran(c,[[-180,-230],[-20+d+h,-230],[-70+d,-110+dy],[-180,-120]],4);c.fill();c.restore();
 c.restore();c.restore();
}
const rukiA=(c,p)=>{c.save();c.transform(1,0,SK,1,0,0);dveRuki(c,p,{pl:[158,40,100,10],v:52,n:44,restX:148,restY:238,a:75,b:74,k:1.55,vnutr:.42,cvet:A.rukav,kist:A.kozha,kisw:52,manzh:A.vorot});c.restore();};

Stili.dobavit({id:'kosoy',nomer:7,imya:'Slanted cube',gruppa:'geo',rukiZaStolom:true,
 fon(c,W,H){c.fillStyle='#F8EAD0';c.fillRect(0,0,W,H);
  c.fillStyle='#F3DEB2';mnogo(c,[[130,-60],[920,-60],[780,1140],[-10,1140]],0);c.fill();
  c.fillStyle='#D6E6D6';mnogo(c,[[1000,-60],[1790,-60],[1930,1140],[1140,1140]],0);c.fill();},
 stol(c,W,H){c.fillStyle='#2E5C63';c.fillRect(0,892,W,H-892);c.fillStyle='#3F7680';c.fillRect(0,892,W,18);},
 L:{x:520,y:660,s:S,ramka:[-190,-355,380,380],telo:teloL,ruki:rukiL},
 A:{x:1400,y:660,s:S,ramka:[-190,-355,380,380],telo:teloA,ruki:rukiA}});
})();
