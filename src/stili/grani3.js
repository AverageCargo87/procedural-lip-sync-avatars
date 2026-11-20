'use strict';
/* Style "Facets, simple adults": almost the same drawing as the original "Facets" (heads and bodies are polygons with cut corners, hair in facets of two or three tones, a pill eye with a diamond highlight, a slab nose, a side facet of the face that slides on a turn).
 * Only the proportions and features grew up: a longer face, a cut jaw and chin, a visible neck, the eye lower and under a lid. The head is as big as in the series but narrower than the shoulders.
 * Lena: honey slanted bob, hair behind the ear on the right, a dot earring, a pale blush facet; berry cardigan over a round-neck blouse, hands folded.
 * Artem: fair skin, clean-shaven, grey temples as a facet, octagonal glasses; emerald jumper with a shirt collar, palms on a book.
 * Hands on the table: the sleeve as two polygons, the elbow resting on the table, a cuff strip, a slab hand with a thumb, palm up on a gesture. */
(function(){
const {lerp,clamp,mnogo,sdvig,rot,naGolovu}=Kit;
const S=1.6,XL=552,XA=1368,Y=652,GL={hy:-170,osnova:120,hs:1.06},GA={hy:-184,osnova:120,hs:1.07};
const naL=(c,p)=>naGolovu(c,p,GL),naA=(c,p)=>naGolovu(c,p,GA),chel=p=>p.open*12+p.bite;

/** Polygon whose corner radius is limited by the side lengths: no loops on short edges. pts [[x,y,r],...]; dal continues the current path so several facets share one fill. */
function gran(c,pts,r,dal){
 // Math.hypot is noticeably slower than a square root, and there are hundreds of vertices per frame
 const n=pts.length,R=i=>{const a=pts[(i+n-1)%n],b=pts[i],d=pts[(i+1)%n],ax=a[0]-b[0],ay=a[1]-b[1],dx=d[0]-b[0],dy=d[1]-b[1],e1=Math.sqrt(ax*ax+ay*ay),e2=Math.sqrt(dx*dx+dy*dy),co=(ax*dx+ay*dy)/(e1*e2||1),t=Math.sqrt(clamp((1+co)/(1-co+1e-6),0,1e4));return Math.min(b[2]??r,.48*Math.min(e1,e2)/(t||1));};
 if(!dal)c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const b=pts[i],d=pts[(i+1)%n],q=m(b,d);c.arcTo(b[0],b[1],q[0],q[1],R(i));}c.closePath();
}
/** The original's cut pill: a, b half width and half height. */
const pil=(c,X,Y,a,b,r)=>gran(c,[[X-a*.5,Y-b],[X+a*.5,Y-b],[X+a,Y-b*.45],[X+a,Y+b*.45],[X+a*.5,Y+b],[X-a*.5,Y+b],[X-a,Y+b*.45],[X-a,Y-b*.45]],r,true);
/** Mix of two #rrggbb colours: on v, f the mouth cavity becomes the upper teeth and the outline the lower lip. Only colours change; the mouth shape is unchanged. */
const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),smes=(a,b,t)=>{if(t<.02)return a;const A=rgb(a),B=rgb(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`;};

/** Both eyes at once: a pill, a matching pupil, a diamond highlight, a lid line. Wider than tall and under a lid: an adult gaze with the same drawing.
 *  o: x centre between the eyes, y; dx half distance; w,h; zk pupil share of width, zh of height; veko; dug lid curve; niz lower lid lift; cvet; lin; tol. */
function glaza(c,p,o){
 const {y,h}=o,ry=h/2,z=clamp(clamp(p.blink)/.8),sm=y+ry*.4,top=lerp(y-ry+h*o.veko,sm,z),niz=lerp(y+ry+1,sm,z*z),iz=ry*.34*(1-z)*(o.dug??1),nk=h*((o.niz||0)+p.smile*.06)*(1-z),
  E=[-1,1].map(s=>{const w=o.w*(1-s*p.yaw*.22);return {x:o.x+s*o.dx,w,rx:w/2};});
 if(z<.97){const zh=h*(o.zh||.82);
  c.save();c.beginPath();for(const e of E)pil(c,e.x,y,e.rx,ry,9);c.clip();
  // the lower lid arcs upward: the eyes smile a little and no white shows under the pupil
  c.beginPath();for(const e of E){c.moveTo(e.x-e.w,top+iz*2);c.quadraticCurveTo(e.x,top-iz*2,e.x+e.w,top+iz*2);c.lineTo(e.x+e.w,niz);c.lineTo(e.x+e.rx*1.1,niz);c.quadraticCurveTo(e.x,niz-nk*2,e.x-e.rx*1.1,niz);c.lineTo(e.x-e.w,niz);c.closePath();}c.clip();
  c.fillStyle='#fff';c.fillRect(o.x-o.dx-o.w,y-h,2*(o.dx+o.w),2*h);
  c.fillStyle=o.cvet;c.beginPath();for(const e of E){e.zw=e.w*o.zk;e.px=e.x+p.gx*(e.rx-e.zw/2+e.w*.03)*1.25;e.py=y+h*.07+p.gy*h*.1;pil(c,e.px,e.py,e.zw/2,zh/2,8);}c.fill();
  c.fillStyle='#fff';c.beginPath();for(const e of E){const bx=e.px-e.zw*.2,by=e.py-zh*.16,br=e.zw*.2;gran(c,[[bx,by-br*1.1],[bx+br,by],[bx,by+br*1.1],[bx-br,by]],2,true);}c.fill();c.restore();
  // lid line
  c.globalAlpha=1-z;c.strokeStyle=o.lin;c.lineCap=c.lineJoin='round';c.lineWidth=o.tol;c.beginPath();for(const e of E){const yk=top+iz*.54;c.moveTo(e.x-e.rx*1.04,yk);c.quadraticCurveTo(e.x,top-iz*.54,e.x+e.rx*1.04,yk);}c.stroke();c.globalAlpha=1;}
 const a=clamp((clamp(p.blink)-.3)/.35);
 if(a>0){c.globalAlpha=a;c.strokeStyle=o.lin;c.lineCap='round';c.lineWidth=o.tol+1;c.beginPath();for(const e of E){c.moveTo(e.x-e.rx*.95,sm+3);c.quadraticCurveTo(e.x,sm-7,e.x+e.rx*.95,sm+3);}c.stroke();c.globalAlpha=1;}
}
/** Both brows as one polyline: from the bridge to the break pik and on to the temple. o: x,y; dx; dl; tol; cvet; g break height; vn, spad lowering of the ends. */
function brovi(c,p,o){
 c.strokeStyle=o.cvet;c.lineCap=c.lineJoin='round';c.lineWidth=o.tol;c.beginPath();
 for(const s of [-1,1]){const r=(p.brow+(s<0?p.browL:0))*8,x=o.x+s*o.dx,d=o.dl*(1-s*p.yaw*.22)/2,yy=o.y-r,g=o.g+p.brow*2;
  c.moveTo(x-s*d,yy+o.vn);c.lineTo(x+s*d*(o.pik*2-1),yy-g);c.lineTo(x+s*d,yy+o.spad);}
 c.stroke();
}
/** Face: blush facet, shadow under the lower lip, mouth, slab nose, eyes, brows. Everything moves together through sdvig. */
function lico(c,p,o){
 const {fe,fn,fm,py}=sdvig(p),ey=o.glY+py*.8,sm=o.sm,rx=sm+fm,ry=o.rotY+py*1.05,b=clamp(p.bite);
 // the original's pale blush facet: a flat, quiet hexagon
 if(o.rum){c.globalAlpha=o.rumA;c.fillStyle=o.rum;c.beginPath();for(const s of [-1,1]){const x=sm*.8+s*o.rumX+fe*.7,y=o.rumY+py*.8;gran(c,[[x-11,y-8],[x+11,y-8],[x+21,y],[x+11,y+8],[x-11,y+8],[x-21,y]],4,true);}c.fill();c.globalAlpha=1;}
 // a hint of the lower lip: a pink lens right under the mouth, its top hidden under the mouth line; it moves down with an open mouth (the same numbers as in Kit.rot)
 if(o.guba2){const k=o.rotK,By=(p.open*3+(p.open*60+p.bite*5)*.84*.68)*k,w=50*(1+.3*p.wide-.42*p.round-.1*p.press)*k*.36,yy=ry+By;
  c.fillStyle=o.guba2;c.beginPath();c.moveTo(rx-w,yy-2*k);c.quadraticCurveTo(rx,yy+2*k,rx+w,yy-2*k);c.quadraticCurveTo(rx,yy+o.gubaH*k,rx-w,yy-2*k);c.fill();}
 rot(c,p,{x:rx,y:ry,k:o.rotK,cvet:smes(o.rot,'#FFF8F0',b),yazyk:smes(o.yazyk,'#FFF8F0',b),zuby:'#FFF8F0',ugolki:o.ugolki,ulybka:o.ulybka,zubyOt:16,vys:.84,asim:o.asim,liniya:o.rotLin,kontur:smes(o.rot,o.guba,b),tenPress:o.tenPress});
 // the original's house-shaped nose, only longer: a rounded top, a wider bottom
 const nx=sm+fn,ny=o.nosY+py,w=o.nosW,v=nx-o.ts*2;c.fillStyle=o.nos;gran(c,[[v,ny-o.nosD,7],[nx+w,ny+5,4],[nx+w*.55,ny+12,4],[nx-w*.55,ny+12,4],[nx-w,ny+5,4]],4);c.fill();
 glaza(c,p,{x:sm+fe,y:ey,dx:o.glX,w:o.glW,h:o.glH,zk:o.zk,zh:o.zh,veko:o.veko,dug:o.dug,niz:o.niz,cvet:o.zrachok,lin:o.lin,tol:o.linT});
 brovi(c,p,{x:sm+fe,y:ey-o.brY,dx:o.brX,dl:o.brDl,tol:o.brTol,cvet:o.brovi,g:o.brG,vn:o.brVn,spad:o.brSpad,pik:o.brPik});
}

/** Slab hand: fingers joined into one facet with a cut end, thumb toward +y; both shapes in one fill. t 0-1 opening, m side; o.palec0 thumb angle at rest. */
function kist(c,o,t,m,cvet){
 const k=o.D/100,L=lerp(.92,1,t),b=lerp(o.palec0??.42,.74,t);c.save();c.scale(k,k*m*(o.uz||1));c.fillStyle=cvet;
 gran(c,[[-6,-17,3],[42,-22,6],[84*L,-18,6],[97*L,-6,5],[93*L,10,6],[48,19,6],[-6,16,3]],5);
 c.save();c.translate(16,8);c.rotate(b);gran(c,[[-4,-10,3],[26,-9,4],[41,-3,5],[39,7,5],[-4,11,3]],4,true);c.restore();
 c.fill();c.restore();
}
/** Faceted adult arm: the mechanics of Kit.rukaV, but the elbow rests on the table almost still and only the forearm rises, so the arm bends at the elbow instead of stretching like a wing.
 *  Five shapes: top of the sleeve, forearm in two facets, cuff, hand. At the peak the hand lies almost horizontal, palm up, thumb on top.
 *  o: S; tw,sy shoulder axis; plv,pl top of the sleeve at the neck and on the shoulder; lok,lokN; k0,k1; w0,w1,w2; D; kx; dY; dov0,dov1; rukav,rukavP forearm top,rukavT; manzh,manzhL; kozha; tenKist; tenOba shadow under both hands. */
function ruka(c,p,o,side){
 const hxP=side<0?p.hLx:p.hRx,hyP=side<0?p.hLy:p.hRy,t=Math.max(clamp(side<0?p.hLo:p.hRo),o.t0),u0=clamp(-hyP/108,0,1.25),uO=clamp(-(side<0?p.hRy:p.hLy)/108,0,1.25),u=u0*lerp(1,.55,clamp((uO-u0)/.12)),ves=1-clamp(-hyP/40),dx=p.lean*22/o.S,dy=(p.bob*6-p.breath*2.2)/o.S,lN=o.lokN,w=o.w1,
  wx=side*lerp(o.k0[0],o.k1[0],u)+hxP*o.kx-dx*ves,wy=lerp(o.k0[1]+(side>0?o.dY:0),o.k1[1],u)-dy*ves,ex=side*(o.lok[0]+lN[0]*u)-dx*.85,ey=o.lok[1]+lN[1]*u-dy*.85,sx=side*o.tw,sy=o.sy,
  a1=Math.atan2(ey-sy,ex-sx),u1x=Math.cos(a1),u1y=Math.sin(a1),f=Math.atan2(wy-ey,wx-ex),cf=Math.cos(f),sf=Math.sin(f),
  bl=Math.hypot(u1x-cf,u1y-sf)||1,bx=(u1x-cf)/bl,by=(u1y-sf)/bl;
 // n1, n2 point to the outside of the bend; the outer elbow corner is chamfered
 let n1x=-u1y,n1y=u1x,n2x=-sf,n2y=cf;if(n1x*bx+n1y*by<0){n1x=-n1x;n1y=-n1y;}if(n2x*bx+n2y*by<0){n2x=-n2x;n2y=-n2y;}
 const kv=w/Math.max(n1x*bx+n1y*by,.46),px=ex+bx*kv,py=ey+by*kv,fa=w*.42,f1=[px-u1x*fa,py-u1y*fa,4],f2=[px+cf*fa,py+sf*fa,4],
  g=lerp(o.w0,w,.42),ox=lerp(sx,ex,.42)+n1x*g,oy=lerp(sy,ey,.42)+n1y*g,uu=clamp(u),rk=f+side*lerp(o.dov0,o.dov1,uu*uu*(3-2*uu));
 c.fillStyle=o.rukav;gran(c,[[side*o.plv[0],o.plv[1],8],[side*o.pl[0],o.pl[1],16],[ox,oy,12],f1,f2,[ex-n1x*w,ey-n1y*w,4],[sx-n1x*o.w0,sy-n1y*o.w0,4]],4);c.fill();
 // a hand at rest casts a shadow on what it lies on: the other hand or the book
 if((side>0||o.tenOba)&&ves>.02){c.save();c.globalAlpha=ves;c.translate(wx+cf*7-3,wy+sf*7+6);c.rotate(rk);kist(c,o,t,side,o.tenKist);c.restore();}
 c.save();c.translate(wx+cf*7,wy+sf*7);c.rotate(rk);kist(c,o,t,side,o.kozha);c.restore();
 c.save();c.translate(wx,wy);c.rotate(f);c.fillStyle=o.manzh;gran(c,[[-8,-o.w2+3],[o.manzhL,-o.w2+4],[o.manzhL+2,o.w2-4],[-8,o.w2-3]],2);c.fill();c.restore();
 // forearm: a shadow facet below, the top lighter than the sleeve at the shoulder so the forearm separates from the upper arm on a gesture; the back edge follows the outer side of the sleeve top, so there is no dark scrap at the elbow
 const V=[f1[0]-u1x*w*1.1,f1[1]-u1y*w*1.1],T=8,verh=[[ex-n2x*w,ey-n2y*w,4],[wx-n2x*o.w2,wy-n2y*o.w2,2]];
 c.fillStyle=o.rukavT;gran(c,[[wx+n2x*o.w2,wy+n2y*o.w2,2],f2,f1,[V[0],V[1],4],...verh],3);c.fill();
 c.fillStyle=o.rukavP||o.rukav;gran(c,[[wx+n2x*(o.w2-T),wy+n2y*(o.w2-T),2],[f2[0]-n2x*T,f2[1]-n2y*T,4],[f1[0]-bx*T,f1[1]-by*T,4],[V[0]-n1x*5,V[1]-n1y*5,4],...verh],3);c.fill();
}

// -- Lena, 36: honey slanted bob, hair behind the ear on the right, a dot earring; berry cardigan, round-neck blouse --
const L={kozha:'#FFDCC4',grany:'#F5CAAE',skula:'#F8D1B8',sheya:'#EFBEA2',nos:'#F0B496',volosy:'#E3A43A',volosyT:'#C4852A',svet:'#F4C460',serga:'#E9B23E',
 pidzhak:'#B83C68',planka:'#CC527D',rukav:'#93295A',rukavP:'#A3305F',rukavT:'#76204A',bluzka:'#FCEFE6',
 rot:'#7E2236',guba:'#DE7F8A',guba2:'#F3B1A6',gubaH:15,yazyk:'#EE7B7B',zrachok:'#2B2340',brovi:'#A06718',lin:'#2B2340',linT:4.2,rum:'#F28C8C',rumA:.27,rumX:58,rumY:46,
 sm:6,glX:38,glY:3,glW:36,glH:29,zk:.72,zh:.74,veko:.2,dug:.7,niz:.05,brX:39,brY:21,brDl:40,brTol:6,brG:3,brVn:0,brSpad:4,brPik:.62,nosY:38,nosD:16,nosW:11,ts:-1,
 rotY:76,rotK:.7,rotLin:8,ugolki:9,ulybka:1.6,asim:0};
const formaL=p=>{const j=chel(p),q=p.yaw*6;return [[-52,-112,14],[52,-112,14],[84,-78,12],[84,20,12],[64,84,12],[30+q,112+j,7],[-30+q,112+j,7],[-64,84,12],[-84,20,12],[-84,-78,12]];};
/** Back of the bob: one dark mass behind the face, notched ends behind the ear on the right that swing with p.hair. */
function zadL(c,p){const d=-p.yaw*10,h=p.hair*6;
 c.fillStyle=L.volosyT;gran(c,[[-66+d,-140,16],[58+d,-140,16],[100+d,-106,14],[106,-40,10],[106+h*.5,88,8],[100+h,126,3],[84+h,114,3],[62+h,126,3],[-96+h,132,4],[-112+h*.5,100,8],[-116,-40,10],[-106+d,-106,14]],10);c.fill();}
/** Front mass: side parting on the right, a strand across the forehead and down the left cheek, the bob slightly longer in front with a notched end; on the right the hair goes over and behind the ear. Low volume above the crown. */
const peredL=(c,d,h)=>gran(c,[[26+d,-90,3],[56+d*.6,-82,8],[78,-58,8],[86,-26,4],[92,-14,3],[100,-40,8],[103,-96,14],[80,-134,16],[18+d*.5,-152,16],[-60+d*.3,-143,16],[-102,-108,16],[-108,-40,10],[-112+h*.5,50,8],[-120+h,114,3],[-96+h,110,3],[-66+h,130,3],[-70+h*.3,64,6],[-76,-6,8],[-60+d*.5,-46,10],[-22+d*.8,-74,8]],8);
function golovaL(c,p){
 const {fe}=sdvig(p),d=p.yaw*12,h=p.hair*8,F=formaL(p),q=p.yaw*6;
 // right ear visible, a dot earring under it
 const ex=82-p.yaw*6,eY=2;c.fillStyle=L.kozha;gran(c,[[ex-4,eY-14,2],[ex+12,eY-18,3],[ex+18,eY-4,4],[ex+12,eY+22,4],[ex+2,eY+30,3],[ex-4,eY+24,2]],3);c.fill();
 c.fillStyle=L.serga;gran(c,[[ex+6,eY+34],[ex+11,eY+40],[ex+6,eY+46],[ex+1,eY+40]],2);c.fill();
 c.fillStyle=L.kozha;gran(c,F,12);c.fill();
 // side facet of the face on the left, slides on a turn, goes into the jaw corner at the bottom so the chin cut stays light
 c.save();gran(c,F,12);c.clip();c.fillStyle=L.grany;gran(c,[[-160,-130],[-52+fe*.8,-130],[-52+fe*.8,30],[-30+fe*.8+q,140],[-160,140]],4);c.fill();
 // a narrow light facet under the right cheekbone that stops before the chin
 c.fillStyle=L.skula;gran(c,[[92,22],[68+fe*.6,50],[64+fe*.5+q*.5,86],[92,86]],4);c.fill();c.restore();
 lico(c,p,L);
 c.fillStyle=L.volosy;peredL(c,d,h);c.fill();
 // hair facets: a light plane right of the parting toward the middle of the frame, a dark outer plane on the left strand
 c.save();peredL(c,d,h);c.clip();
 c.fillStyle=L.svet;gran(c,[[26+d,-90],[30+d*.6,-190],[150,-190],[150,-10],[86,-26],[78,-58],[56+d*.6,-82]],2);c.fill();
 c.fillStyle=L.volosyT;gran(c,[[-150,-90],[-98,-72],[-96,56],[-104+h,140],[-150,140]],2);c.fill();
 c.restore();
}
function teloL(c,p){
 c.rotate(.02);
 c.save();naL(c,p);zadL(c,p);c.restore();
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 // a cardigan without lapels: front edges with a placket, the blouse in the opening
 c.fillStyle=L.pidzhak;gran(c,[[-38,-28,6],[38,-28,6],[116,4,12],[148,40,14],[146,190,0],[-146,190,0],[-148,40,14],[-116,4,12]],8);c.fill();
 c.fillStyle=L.bluzka;gran(c,[[-50,-30,2],[50,-30,2],[36,190,0],[-36,190,0]],2);c.fill();
 // neck and the round blouse neckline in one shape
 c.fillStyle=L.sheya;gran(c,[[-28,-88,4],[28,-88,4],[31,-30,6],[22,0,12],[0,8,12],[-22,0,12],[-31,-30,6]],6);c.fill();
 c.fillStyle=L.planka;c.beginPath();for(const s of [-1,1])gran(c,[[s*48,-31,2],[s*62,-26,2],[s*50,190,0],[s*36,190,0]],2,true);c.fill();
 c.restore();
 c.save();naL(c,p);golovaL(c,p);c.restore();
}
const RL={S,tw:132,sy:60,plv:[98,8],pl:[148,40],lok:[128,178],lokN:[10,-4],k0:[62,160],k1:[70,112],w0:33,w1:28,w2:26,D:94,uz:.92,kx:.5,dY:-3,dov0:-.1,dov1:-.52,t0:.3,
 rukav:L.rukav,rukavP:L.rukavP,rukavT:L.rukavT,manzh:L.bluzka,manzhL:11,kozha:L.kozha,tenKist:'rgba(150,70,60,.34)'};
const rukiL=(c,p)=>{c.rotate(.02);for(const s of [-1,1])ruka(c,p,RL,s);};

// -- Artem, 38: fair skin, clean-shaven, short dark faceted haircut, grey temples, octagonal glasses; emerald jumper, shirt collar --
const A={kozha:'#EFC7A8',grany:'#E3B897',sheya:'#DAAE8E',nos:'#DFA889',volosy:'#2A2D35',volosyT:'#1E2027',svet:'#434955',sedina:'#6F737C',ochki:'#2A2D35',
 pidzhak:'#1E8A6A',rezinka:'#177659',rukav:'#156E55',rukavP:'#197A5E',rukavT:'#0F5642',rub:'#F7F0E3',vorot:'#FFFAF0',
 rot:'#6A1E2C',guba:'#C8706E',yazyk:'#E8707C',zrachok:'#201A24',brovi:'#2A2D35',lin:'#2A2024',linT:3.6,
 sm:-6,glX:40,glY:4,glW:34,glH:28,zk:.74,veko:.26,niz:.07,brX:41,brY:27,brDl:42,brTol:5.8,brG:4.5,brVn:-2,brSpad:3,brPik:.42,nosY:42,nosD:18,nosW:12,ts:1,
 rotY:84,rotK:.7,rotLin:8,ugolki:10,ulybka:1.6,asim:-.03};
const formaA=p=>{const j=chel(p),q=p.yaw*7;return [[-56,-118,14],[56,-118,14],[90,-82,12],[90,34,12],[82,92,12],[44+q,122+j,10],[-44+q,122+j,10],[-82,92,12],[-90,34,12],[-90,-82,12]];};
/** Short faceted haircut: volume up, short temples, a slightly receding hairline at the temples. */
const perA=(c,d,h)=>gran(c,[[-90,22,2],[-94,-40,6],[-100,-98,12],[-74,-142,16],[-20+d,-164+h,16],[48+d,-164+h,16],[92+d*.5,-138,14],[102,-96,12],[96,-40,6],[92,22,2],[82,22,2],[80,-50,6],[72,-94,8],[34+d,-86,8],[-20+d,-84,8],[-66,-94,8],[-80,-50,6],[-82,22,2]],6);
/** Thin octagonal glasses in one stroke: frames, bridge, arms. */
function ochki(c,p,fe,ey){
 const R=26,y=ey+2,kL=1+p.yaw*.2,kR=1-p.yaw*.2,x0=A.sm+fe,oct=(x,a)=>gran(c,[[x-a*.56,y-R*.78],[x+a*.56,y-R*.78],[x+a,y-R*.32],[x+a,y+R*.32],[x+a*.56,y+R*.78],[x-a*.56,y+R*.78],[x-a,y+R*.32],[x-a,y-R*.32]],5,true);
 c.strokeStyle=A.ochki;c.lineWidth=3.6;c.lineJoin=c.lineCap='round';c.beginPath();oct(x0-A.glX,R*kL);oct(x0+A.glX,R*kR);
 c.moveTo(x0-A.glX+R*kL,y-6);c.quadraticCurveTo(x0,y-11,x0+A.glX-R*kR,y-6);c.moveTo(x0-A.glX-R*kL,y-5);c.lineTo(-88-p.yaw*6,y-8);c.moveTo(x0+A.glX+R*kR,y-5);c.lineTo(88-p.yaw*6,y-8);c.stroke();
}
function golovaA(c,p){
 const {fe,py}=sdvig(p),d=p.yaw*12,h=p.hair*3,q=p.yaw*7,F=formaA(p);
 // ears in one fill
 c.fillStyle=A.kozha;c.beginPath();for(const s of [-1,1]){const x=s*86-p.yaw*6,k=s*(1-s*p.yaw*.6),v=32;gran(c,[[x-4*k,-v*.9],[x+12*k,-v*1.02],[x+19*k,-v*.5],[x+13*k,v*.4],[x+4*k,v*.86],[x-5*k,v*.7]].map(q=>[q[0],q[1]+18]),3,true);}c.fill();
 c.fillStyle=A.kozha;gran(c,F,12);c.fill();
 // side facet of the face on the right, slides on a turn, goes into the jaw corner at the bottom
 c.save();gran(c,F,12);c.clip();c.fillStyle=A.grany;gran(c,[[160,-130],[58+fe*.8,-130],[58+fe*.8,34],[38+fe*.8+q,150],[160,150]],4);c.fill();c.restore();
 lico(c,p,A);
 ochki(c,p,fe,A.glY+py*.8);
 c.fillStyle=A.volosy;perA(c,d,h);c.fill();
 // hair facets: light on the left half of the forelock, shadow on the right, grey temples as one facet
 c.save();perA(c,d,h);c.clip();
 c.fillStyle=A.svet;gran(c,[[-30+d,-190],[30+d,-190],[24+d,-84],[-36+d,-82],[-70,-120]],2);c.fill();
 c.fillStyle=A.volosyT;gran(c,[[30+d,-190],[130,-170],[130,-60],[72,-94],[24+d,-84]],2);c.fill();
 c.fillStyle=A.sedina;c.beginPath();for(const s of [-1,1])gran(c,[[s*76,-58],[s*120,-68],[s*120,-2],[s*80,4]],2,true);c.fill();
 c.restore();
}
function teloA(c,p){
 c.rotate(-.02);
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 // V-neck jumper: the neckline rib as one facet, the shirt in the neckline, collar points on top
 c.fillStyle=A.pidzhak;gran(c,[[-48,-30,6],[48,-30,6],[140,4,12],[176,40,14],[174,190,0],[-174,190,0],[-176,40,14],[-140,4,12]],8);c.fill();
 c.fillStyle=A.rub;gran(c,[[-50,-32,2],[50,-32,2],[4,94,2],[-4,94,2]],2);c.fill();
 c.fillStyle=A.sheya;gran(c,[[-44,-96,4],[44,-96,4],[48,-28,4],[0,16,3],[-48,-28,4]],3);c.fill();
 c.fillStyle=A.rezinka;c.beginPath();for(const s of [-1,1])gran(c,[[s*48,-32,2],[s*64,-27,2],[s*2,114,2],[s*1,94,2]],2,true);c.fill();
 c.fillStyle=A.vorot;c.beginPath();for(const s of [-1,1])gran(c,[[s*4,8,2],[s*48,-36,3],[s*60,-22,3],[s*32,30,2]],2,true);c.fill();
 c.restore();
 c.save();naA(c,p);golovaA(c,p);c.restore();
}
const RA={S,tw:162,sy:64,plv:[116,8],pl:[176,40],lok:[176,186],lokN:[8,-4],k0:[118,170],k1:[84,116],w0:41,w1:34,w2:31,D:100,uz:1,kx:.5,dY:0,dov0:-.2,dov1:-.52,t0:0,palec0:.26,
 rukav:A.rukav,rukavP:A.rukavP,rukavT:A.rukavT,manzh:A.rub,manzhL:12,kozha:A.kozha,tenKist:'rgba(120,60,30,.3)',tenOba:true};
/** Book under Artem's palms: it lies on the table and does not follow the body. Cover and page edge. */
function kniga(c,p){
 c.save();c.translate(-p.lean*22/S,-(p.bob*6-p.breath*2.2)/S);
 c.fillStyle='#E2A23C';gran(c,[[-104,136,4],[98,133,4],[116,196,3],[-122,199,3]],3);c.fill();
 c.fillStyle='#FBF1DE';gran(c,[[-122,199,2],[116,196,2],[116,205,2],[-122,208,2]],2);c.fill();
 c.restore();
}
const rukiA=(c,p)=>{kniga(c,p);c.rotate(-.02);for(const s of [-1,1])ruka(c,p,RA,s);};

Stili.dobavit({id:'grani3',nomer:26,imya:'Facets, simple adults',gruppa:'geo3',
 fon(c,W,H){c.fillStyle='#E6E4F5';c.fillRect(0,0,W,H);c.fillStyle='#DCDAF0';mnogo(c,[[-40,-40],[620,-40],[300,560],[-40,760]],0);c.fill();mnogo(c,[[1960,120],[1960,920],[1420,920],[1620,380]],0);c.fill();c.fillStyle='#EFEEFA';mnogo(c,[[760,-40],[1320,-40],[1180,420],[900,520]],0);c.fill();},
 // the original's table, but the top is seen from above: the hands rest on it; the front edge is darker
 stol(c,W,H){c.fillStyle='#6E6CBA';gran(c,[[-60,1010,0],[80,884,14],[1840,884,14],[1980,1010,0],[1980,1140,0],[-60,1140,0]],0);c.fill();c.fillStyle='#4A4892';gran(c,[[-60,1010,0],[1980,1010,0],[1980,1140,0],[-60,1140,0]],0);c.fill();},
 L:{x:XL,y:Y,s:S,ramka:[-158,-360,316,360],telo:teloL,ruki:rukiL},
 A:{x:XA,y:Y,s:S,ramka:[-162,-372,324,366],telo:teloA,ruki:rukiA}});
})();
