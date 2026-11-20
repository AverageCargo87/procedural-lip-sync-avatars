'use strict';
/* Style "Block": a big block head that narrows slightly toward the crown, almost as wide as the body; a short trapezoid body, short thick arms. Stocky cheerful characters: bead eyes set wide and low, a big mouth, hair as a slanted cut with a parting. */
(function(){
const {lerp,clamp,mnogo,sdvig,rot,naGolovu,busina,brovDuga}=Kit;
const S=1.5,G={hy:-134,osnova:124};

/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]. */
function gran(c,pts,r){
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],e1=Math.hypot(a[0]-b[0],a[1]-b[1]),e2=Math.hypot(d[0]-b[0],d[1]-b[1]),co=((a[0]-b[0])*(d[0]-b[0])+(a[1]-b[1])*(d[1]-b[1]))/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}
/** Face: everything wide and low; sm is the shift toward the partner. */
function lico(c,p,o){
 const {fe,fn,fm,py}=sdvig(p,1.3),ey=o.glY+py*.8,sm=o.sm;
 c.fillStyle=o.shcheki;for(const s of [-1,1]){c.beginPath();c.ellipse(sm*.8+s*o.shX+fe*.7,o.shY+py*.7,28,16,0,0,6.3);c.fill();}
 rot(c,p,{x:sm+fm,y:o.rotY+py*1.05,k:o.rotK,cvet:o.rot,yazyk:o.yazyk,zuby:'#FFF8F0',ugolki:10,ulybka:1.7,zubyOt:15,vys:.86,asim:o.asim,liniya:8,tenPress:o.ten});
 const nx=sm+fn,ny=o.nosY+py;c.fillStyle=o.nos;mnogo(c,[[nx-12,ny-7],[nx+12,ny-7],[nx+16,ny+9],[nx-16,ny+9]],7);c.fill();
 for(const s of [-1,1]){busina(c,p,{x:sm+s*o.glX+fe,y:ey,w:o.glW,h:o.glH,cvet:o.zrachok,tol:7});
  brovDuga(c,p,{x:sm+s*o.glX+fe,y:ey-o.brY,dl:o.brDl,tol:o.brTol,cvet:o.brovi,side:s,izgib:6,naklon:2,hod:10});}
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
 c.fillStyle=o.cvet;gran(c,[[side*px,py,14],[ex+mx*naruzh,ey+my*naruzh,22],[hx+wx*o.n/2,hy+wy*o.n/2,4],[hx-wx*o.n/2,hy-wy*o.n/2,4],[ex-mx*vnut,ey-my*vnut,10],[side*qx,qy,8]],10);c.fill();
 const ug=Math.atan2(u2y,u2x),kw=o.kisw,ks=side;if(hy-kw*1.35>145)return;c.save();c.translate(hx,hy);c.rotate(ug);
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

// -- Lena: dark chestnut block bob, slanted fringe from the parting, yellow hair clip; tomato cardigan over a cream T-shirt --
const L={kozha:'#FFD7BC',ten:'#EEA988',volosy:'#6B3522',volosyT:'#4F2518',svet:'#864729',zakolka:'#FFD24A',telo:'#E5473C',rukav:'#B92F28',vorot:'#FFF3DA',shcheki:'#FFB89E',nos:'#EFAA87',rot:'#8A2A3C',yazyk:'#EE7B7B',zrachok:'#2E2024',brovi:'#6B3522',glX:80,glY:24,glW:38,glH:46,brY:42,brDl:42,brTol:8,nosY:58,rotY:88,rotK:.9,asim:.08,shX:116,shY:72,sm:8};
function teloL(c,p){
 c.rotate(.03);
 const dz=-p.yaw*14,h=p.hair*16;
 c.save();naGolovu(c,p,G);c.fillStyle=L.volosyT;gran(c,[[-170+dz,-130,30],[170+dz,-130,30],[188+dz+h,84,26],[-188+dz+h,92,26]],26);c.fill();c.restore();
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.save();c.translate(L.sm*.6,0);
 c.fillStyle=L.vorot;gran(c,[[-60,-14],[60,-14],[60,200],[-60,200]],6);c.fill();
 c.fillStyle=L.telo;for(const s of [-1,1]){gran(c,[[s*44,-14,8],[s*124,-14,30],[s*188,300,10],[s*14,300,4]],16);c.fill();}
 c.fillStyle=L.zakolka;gran(c,[[-66,70],[-42,66],[-38,90],[-62,94]],7);c.fill();gran(c,[[-58,122],[-34,118],[-30,142],[-54,146]],7);c.fill();
 c.restore();c.restore();
 c.save();naGolovu(c,p,G);
 c.fillStyle=L.kozha;gran(c,[[-150,-140,40],[150,-140,40],[168,132,40],[-168,132,40]],36);c.fill();lico(c,p,L);
 const d=p.yaw*14+L.sm*.5,dy=p.pitch*5,pr=64+d,v=[[-174,20,12],[-166,-150,44],[pr,-176,14],[170,-150,44],[176,10,12],[150,14,8],[136+d,-68+dy,14],[pr,-108+dy,5],[-144,-8,8]];
 c.fillStyle=L.volosy;gran(c,v,20);c.fill();
 c.save();gran(c,v,20);c.clip();c.fillStyle=L.svet;gran(c,[[pr,-190],[-190,-190],[-190,-60],[pr,-128+dy]],4);c.fill();c.restore();
 c.fillStyle=L.zakolka;gran(c,[[pr-74,-100+dy,6],[pr-18,-126+dy,6],[pr-10,-106+dy,6],[pr-66,-80+dy,6]],6);c.fill();
 c.restore();
}
const rukiL=(c,p)=>{c.rotate(.03);dveRuki(c,p,{pl:[168,46,118,14],v:54,n:48,restX:158,restY:228,a:66,b:64,k:1.5,vnutr:.46,cvet:L.rukav,kist:L.kozha,kisw:56});};

// -- Artem: black slanted block of hair with a parting, a big ear; blue sweater with a stripe across the chest --
const A={kozha:'#BE8558',ten:'#9C6641',volosy:'#1F1D29',svet:'#35314A',telo:'#2F76D8',rukav:'#1F55A8',polosa:'#FFF3DA',shcheki:'#B4714A',nos:'#9C6641',rot:'#5E1F2A',yazyk:'#E8707C',zrachok:'#201820',brovi:'#1F1D29',glX:82,glY:22,glW:38,glH:46,brY:44,brDl:46,brTol:10,nosY:58,rotY:88,rotK:.94,asim:-.08,shX:118,shY:72,sm:-8};
function teloA(c,p){
 c.rotate(-.03);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=A.telo;gran(c,[[-132,-14,30],[132,-14,30],[196,300,10],[-196,300,10]],20);c.fill();
 c.fillStyle=A.polosa;gran(c,[[-150,62,4],[150,44,4],[156,82,4],[-156,100,4]],4);c.fill();
 c.restore();
 c.save();naGolovu(c,p,G);const e=-p.yaw*18,d=p.yaw*14+A.sm*.5,h=p.hair*10,dy=p.pitch*5;
 for(const s of [-1,1]){c.fillStyle=A.kozha;gran(c,[[s*150+e,10,14],[s*196+e,6,16],[s*202+e,58,16],[s*160+e,66,10]],14);c.fill();c.fillStyle=A.ten;gran(c,[[s*170+e,22,6],[s*188+e,20,6],[s*190+e,46,8],[s*170+e,50,6]],6);c.fill();}
 c.fillStyle=A.kozha;gran(c,[[-154,-140,38],[154,-140,38],[172,132,40],[-172,132,40]],36);c.fill();lico(c,p,A);
 const v=[[-170,-2,10],[-168,-150,40],[-40+d+h,-188,20],[172,-160,42],[176,14,10],[150,14,8],[140+d,-74+dy,12],[-82+d,-92+dy,6],[-146,-2,8]];
 c.fillStyle=A.volosy;gran(c,v,18);c.fill();
 c.save();gran(c,v,18);c.clip();c.fillStyle=A.svet;gran(c,[[-40+d+h,-200],[-190,-200],[-190,-60],[-82+d,-120+dy]],4);c.fill();c.restore();
 c.restore();
}
const rukiA=(c,p)=>{c.rotate(-.03);dveRuki(c,p,{pl:[178,46,124,14],v:56,n:50,restX:168,restY:228,a:67,b:66,k:1.5,vnutr:.46,cvet:A.rukav,kist:A.kozha,kisw:58});};

Stili.dobavit({id:'blok',nomer:10,imya:'Block',gruppa:'geo',rukiZaStolom:true,
 fon(c,W,H){c.fillStyle='#FFDB78';c.fillRect(0,0,W,H);c.fillStyle='#FFE69C';c.beginPath();c.moveTo(0,300);c.lineTo(W,120);c.lineTo(W,560);c.lineTo(0,740);c.closePath();c.fill();},
 stol(c,W,H){c.fillStyle='#34507F';gran(c,[[70,906,26],[1850,906,26],[1930,1130,0],[-10,1130,0]],0);c.fill();c.fillStyle='#24395F';gran(c,[[63,926,0],[1857,926,0],[1930,1130,0],[-10,1130,0]],0);c.fill();},
 L:{x:560,y:690,s:S,ramka:[-205,-310,410,410],telo:teloL,ruki:rukiL},
 A:{x:1360,y:690,s:S,ramka:[-205,-310,410,410],telo:teloA,ruki:rukiA}});
})();
